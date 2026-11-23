import { readSse, type SseFrame } from '@reflexify/agentflow-sdk';
import { CHAT_LANGUAGES, type ChatLanguage } from './strings.js';

export type Author = 'visitor' | 'agent' | 'person' | 'system';

export interface LoggedMessage {
  position: number;
  author: Author;
  author_display: string | null;
  text: string;
  client_message_id: string | null;
  stream_id?: string;
  stream_segment?: number;
  created_at: string;
}

export interface ChatConfig {
  branding: {
    color: string | null;
    logo_url: string | null;
    languages: ChatLanguage[];
    greetings: Partial<Record<ChatLanguage, string>>;
  };
  verify_methods: string[];
}

export interface OpenedSession {
  token: string;
  expires_at: string;
}

export class ChatRefusal extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryAfterMs: number | null;
  constructor(status: number, code: string, retryAfterMs: number | null) {
    super(`chat refused: ${status} ${code}`);
    this.status = status;
    this.code = code;
    this.retryAfterMs = retryAfterMs;
  }

  get unavailable(): boolean {
    return this.status === 403 || this.status === 404;
  }
}

export type VerifyMethod = 'email_code' | 'agentflow';

const VERIFY_METHODS: readonly string[] = ['email_code', 'agentflow'] satisfies VerifyMethod[];

export type ReplyEvent =
  | { kind: 'started' | 'activity'; stream_id: string; segment: number; label: string | null }
  | { kind: 'delta'; stream_id: string; segment: number; text: string }
  | { kind: 'done' | 'abandoned'; stream_id: string; segment: number };

export type Sleep = (ms: number, signal?: AbortSignal) => Promise<void>;

export interface ChatApiOptions {
  sleep?: Sleep;
  random?: () => number;
}

export type FollowState = 'connecting' | 'live' | 'waiting' | 'ended';

export interface FollowHandlers {
  message(row: LoggedMessage): void;
  typing(until: number | null): void;
  reply(event: ReplyEvent): void;
  verify(methods: VerifyMethod[]): void;
  closed(reason: string): void;
  invalid(): void;
  unavailable(): void;
  unreachable(): void;
  state(state: FollowState): void;
}

export interface Follow {
  stop(): void;
}

export type ChatApi = ReturnType<typeof chatApi>;

const PAGE = 100;
const RETRIES = 3;
const RETRY_WAIT_MAX_MS = 30_000;
const BACKOFF_MIN_MS = 1_000;
const BACKOFF_MAX_MS = 30_000;
const STABLE_MS = 15_000;
const CONFIG_ATTEMPTS = 8;
const UNANSWERED_CONNECTS = 3;

const defaultSleep: Sleep = (ms, signal) =>
  new Promise((resolve) => {
    if (signal?.aborted) return resolve();
    const done = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', done);
      resolve();
    };
    const timer = setTimeout(done, ms);
    signal?.addEventListener('abort', done, { once: true });
  });

export function apiOrigin(attribute: string | null, scriptOrigin: string | null, pageOrigin: string): string {
  if (attribute?.trim()) return attribute.trim().replace(/\/+$/, '').replace(/\/api\/v1$/, '');
  return scriptOrigin ?? pageOrigin;
}

function backoffFrom(random: () => number) {
  let next = BACKOFF_MIN_MS;
  return {
    wait(): number {
      const wait = next / 2 + (random() * next) / 2;
      next = Math.min(next * 2, BACKOFF_MAX_MS);
      return Math.round(wait);
    },
    reset(): void {
      next = BACKOFF_MIN_MS;
    },
  };
}

const retryAfter = (refusal: ChatRefusal) => (refusal.retryAfterMs === null ? null : Math.min(refusal.retryAfterMs, BACKOFF_MAX_MS));

const isEventStream = (response: Response) => response.headers.get('content-type')?.toLowerCase().startsWith('text/event-stream') ?? false;

async function refusalOf(response: Response): Promise<ChatRefusal> {
  const problem = (await response.json().catch(() => null)) as { type?: unknown } | null;
  const code = typeof problem?.type === 'string' ? problem.type : `HTTP_${response.status}`;
  const retryAfter = response.headers.get('retry-after')?.trim();
  return new ChatRefusal(response.status, code, retryAfter && /^\d+$/.test(retryAfter) ? Number(retryAfter) * 1000 : null);
}

export function chatApi(origin: string, publicKey: string, fetchImpl: typeof fetch, options: ChatApiOptions = {}) {
  const root = `${origin}/api/v1/chat/${encodeURIComponent(publicKey)}`;
  const sleep = options.sleep ?? defaultSleep;
  const random = options.random ?? Math.random;

  async function call<T>(method: string, path: string, token?: string, body?: unknown, language?: ChatLanguage): Promise<T> {
    const headers: Record<string, string> = {};
    if (token) headers.authorization = `Bearer ${token}`;
    if (language) headers['accept-language'] = language;
    if (body !== undefined) headers['content-type'] = 'application/json';
    for (let attempt = 0; ; attempt++) {
      const response = await fetchImpl(`${root}/${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
      if (response.ok) return (response.status === 204 ? undefined : await response.json()) as T;
      const refusal = await refusalOf(response);
      const wait = refusal.retryAfterMs;
      if (response.status !== 429 || attempt >= RETRIES || wait === null || wait > RETRY_WAIT_MAX_MS) throw refusal;
      await sleep(wait);
    }
  }

  async function config(failed?: () => void, attempts = CONFIG_ATTEMPTS): Promise<ChatConfig> {
    const backoff = backoffFrom(random);
    for (let attempt = 1; ; attempt++) {
      try {
        const answer = await call<ChatConfig>('GET', 'config');
        const languages = answer.branding.languages.filter((l) => CHAT_LANGUAGES.includes(l));
        return { ...answer, branding: { ...answer.branding, languages } };
      } catch (error) {
        const refusal = error instanceof ChatRefusal ? error : null;
        if ((refusal && refusal.status < 500) || attempt >= attempts) throw error;
        failed?.();
        await sleep((refusal && retryAfter(refusal)) ?? backoff.wait());
      }
    }
  }

  async function history(token: string, after: number): Promise<LoggedMessage[]> {
    const rows: LoggedMessage[] = [];
    for (let cursor = after; ; ) {
      const { messages } = await call<{ messages: LoggedMessage[] }>('GET', `messages?after=${cursor}&limit=${PAGE}`, token);
      rows.push(...messages);
      if (messages.length < PAGE) return rows;
      cursor = messages[messages.length - 1]!.position;
    }
  }

  function follow(token: string, after: number, on: FollowHandlers): Follow {
    let cursor = after;
    let state: FollowState = 'connecting';
    const backoff = backoffFrom(random);
    let connection: AbortController | null = null;
    const halt = new AbortController();
    let unanswered = 0;

    const ended = () => state === 'ended';
    const move = (next: FollowState) => {
      if (ended() || state === next) return;
      state = next;
      on.state(next);
    };
    const end = () => {
      move('ended');
      connection?.abort();
      halt.abort();
    };
    const deliver = (frame: SseFrame) => {
      switch (frame.event) {
        case 'message': {
          const row = JSON.parse(frame.data) as LoggedMessage;
          cursor = Math.max(cursor, row.position);
          on.message(row);
          return;
        }
        case 'reply.started':
        case 'reply.activity':
        case 'reply.delta':
        case 'reply.done':
        case 'reply.abandoned':
          on.reply({ ...JSON.parse(frame.data), kind: frame.event.slice('reply.'.length) } as ReplyEvent);
          return;
        case 'typing': {
          const { until } = JSON.parse(frame.data) as { until: string | null };
          on.typing(until === null ? null : Date.parse(until));
          return;
        }
        case 'verify.requested': {
          const { methods } = JSON.parse(frame.data) as { methods: string[] };
          on.verify(methods.filter((m): m is VerifyMethod => VERIFY_METHODS.includes(m)));
          return;
        }
        case 'closed': {
          const { reason } = JSON.parse(frame.data) as { reason: string };
          on.closed(reason);
          end();
          return;
        }
      }
    };

    const run = async () => {
      while (!ended()) {
        move('connecting');
        const controller = new AbortController();
        connection = controller;
        let answered = false;
        let liveSince: number | null = null;
        let refusedWait: number | null = null;
        try {
          const headers: Record<string, string> = { authorization: `Bearer ${token}`, accept: 'text/event-stream' };
          if (cursor > 0) headers['last-event-id'] = String(cursor);
          const response = await fetchImpl(`${root}/stream`, { headers, signal: controller.signal });
          if (ended()) return;
          answered = true;
          if (!response.ok) {
            const refusal = await refusalOf(response);
            if (ended()) return;
            if (refusal.status === 401 || refusal.unavailable) {
              if (refusal.status === 401) on.invalid();
              else on.unavailable();
              end();
              return;
            }
            if (refusal.status === 429) refusedWait = retryAfter(refusal);
          } else if (response.body && isEventStream(response)) {
            move('live');
            liveSince = Date.now();
            for await (const frame of readSse(response.body, controller.signal)) {
              deliver(frame);
              if (ended()) return;
              backoff.reset();
            }
          } else {
            void response.body?.cancel().catch(() => undefined);
          }
        } catch {}
        if (ended()) return;
        unanswered = answered ? 0 : unanswered + 1;
        if (unanswered === UNANSWERED_CONNECTS) on.unreachable();
        if (liveSince !== null && Date.now() - liveSince >= STABLE_MS) backoff.reset();
        move('waiting');
        await sleep(refusedWait ?? backoff.wait(), halt.signal);
      }
    };
    void run();
    return { stop: end };
  }

  return {
    config,
    openSession: (identityToken?: string) => call<OpenedSession>('POST', 'sessions', undefined, identityToken ? { identity_token: identityToken } : {}),
    post: (token: string, text: string, clientMessageId: string) =>
      call<{ position: number }>('POST', 'messages', token, { text, client_message_id: clientMessageId }),
    history,
    close: (token: string) => call<void>('DELETE', 'session', token),
    giveEmail: (token: string, email: string) => call<void>('POST', 'session/email', token, { email }),
    sendCode: (token: string, email: string) => call<unknown>('POST', 'session/verify/email', token, { email }),
    confirmCode: (token: string, code: string, language: ChatLanguage) => call<void>('POST', 'session/verify/email/confirm', token, { code }, language),
    startSignIn: (token: string) => call<{ authorize_url: string }>('POST', 'session/verify/agentflow', token),
    confirmSignIn: (token: string, code: string, language: ChatLanguage) =>
      call<void>('POST', 'session/verify/agentflow/confirm', token, { code }, language),
    follow,
  };
}
