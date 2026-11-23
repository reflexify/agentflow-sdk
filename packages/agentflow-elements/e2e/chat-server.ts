import { randomBytes } from 'node:crypto';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { ChatConfig, LoggedMessage } from '../src/chat/transport.js';

const VISITOR_ECHO_MS = 1_200;
const TYPING_AFTER_MS = 200;
const ANSWER_AFTER_MS = 1_200;
const DELTA_EVERY_MS = 40;
export const CHAT_SERVER_CODE = '123456';

export const CHAT_SERVER_CONFIG: ChatConfig = {
  branding: {
    color: '#0f766e',
    logo_url: null,
    languages: ['en', 'vi'],
    greetings: { en: 'Hi, this is Hanoi Bicycle Rental.', vi: 'Xin chào, đây là Hanoi Bicycle Rental.' },
  },
  verify_methods: ['email_code'],
};

interface Thread {
  publicKey: string;
  rows: LoggedMessage[];
  shown: LoggedMessage[];
  open: boolean;
  typingUntil: string | null;
  streams: Set<ServerResponse>;
  verified: boolean;
  code: string | null;
  email: string | null;
}

export interface ChatServer {
  url: string;
  sessions(publicKey: string): number;
  posts(publicKey: string): number;
  close(): Promise<void>;
}

const frame = (event: string, data: unknown, id?: number) => `${id === undefined ? '' : `id: ${id}\n`}event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

export async function startChatServer(allowedOrigin: string): Promise<ChatServer> {
  const threads = new Map<string, Thread>();
  const opened = new Map<string, number>();
  const posted = new Map<string, number>();
  let answers = 0;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const later = (ms: number, run: () => void) => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      run();
    }, ms);
    timers.add(timer);
  };

  const broadcast = (thread: Thread, text: string) => {
    for (const stream of thread.streams) stream.write(text);
  };
  const log = (thread: Thread, message: Omit<LoggedMessage, 'position' | 'created_at'>): LoggedMessage => {
    const row = { ...message, position: thread.rows.length + 1, created_at: new Date().toISOString() };
    thread.rows.push(row);
    return row;
  };
  const show = (thread: Thread, row: LoggedMessage) => {
    thread.shown.push(row);
    broadcast(thread, frame('message', row, row.position));
  };
  const typing = (thread: Thread, until: string | null) => {
    thread.typingUntil = until;
    broadcast(thread, frame('typing', { until }));
  };
  const answer = (thread: Thread, text: string) => {
    const streamId = `run-${++answers}:reply:0`;
    const words = text.split(/(?= )/);
    broadcast(thread, frame('reply.started', { stream_id: streamId, segment: 0, label: 'Writing' }));
    words.forEach((word, i) =>
      later(DELTA_EVERY_MS * (i + 1), () => broadcast(thread, frame('reply.delta', { stream_id: streamId, segment: 0, text: word }))),
    );
    later(DELTA_EVERY_MS * (words.length + 1), () => {
      if (!thread.open) return;
      broadcast(thread, frame('reply.done', { stream_id: streamId, segment: 0 }));
      show(thread, { ...log(thread, { author: 'agent', author_display: 'Mai', text, client_message_id: null }), stream_id: streamId, stream_segment: 0 });
      typing(thread, null);
    });
  };
  const close = (thread: Thread) => {
    thread.open = false;
    broadcast(thread, frame('closed', { reason: 'thread_closed' }));
    for (const stream of thread.streams) stream.end();
    thread.streams.clear();
  };

  const send = (res: ServerResponse, status: number, body?: unknown, headers: Record<string, string> = {}) => {
    res.writeHead(status, { ...(body === undefined ? {} : { 'content-type': 'application/json' }), ...headers });
    res.end(body === undefined ? undefined : JSON.stringify(body));
  };
  const problem = (res: ServerResponse, status: number, type: string, headers: Record<string, string> = {}) =>
    send(res, status, { type, title: type, status, detail: type }, headers);
  const readJson = async (req: IncomingMessage): Promise<Record<string, unknown>> => {
    let text = '';
    for await (const chunk of req) text += chunk;
    return text ? (JSON.parse(text) as Record<string, unknown>) : {};
  };
  const threadOf = (req: IncomingMessage, publicKey: string): Thread | undefined => {
    const token = req.headers.authorization?.replace(/^Bearer /, '') ?? '';
    const thread = threads.get(token);
    return thread?.publicKey === publicKey ? thread : undefined;
  };

  const handle = async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? '/', 'http://chat.test');
    const match = /^\/api\/v1\/chat\/(pub_[A-Za-z0-9_-]+)\/([a-z/]+)$/.exec(url.pathname);
    if (!match) return problem(res, 404, 'NOT_FOUND');
    if (req.headers.origin !== allowedOrigin) return problem(res, 403, 'CHAT_ORIGIN_REFUSED');
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'access-control-allow-origin': allowedOrigin,
        'access-control-allow-methods': 'GET, POST, DELETE',
        'access-control-allow-headers': 'authorization, content-type, last-event-id',
        'access-control-max-age': '600',
        vary: 'origin, access-control-request-method, access-control-request-headers',
      });
      return res.end();
    }
    res.setHeader('access-control-allow-origin', allowedOrigin);
    res.setHeader('access-control-expose-headers', 'retry-after');
    res.setHeader('vary', 'origin');
    const [, publicKey, route] = match as unknown as [string, string, string];

    switch (`${req.method} ${route}`) {
      case 'GET config':
        return send(res, 200, CHAT_SERVER_CONFIG);
      case 'POST sessions': {
        const token = `afv_${randomBytes(32).toString('base64url')}`;
        threads.set(token, { publicKey, rows: [], shown: [], open: true, typingUntil: null, streams: new Set(), verified: false, code: null, email: null });
        opened.set(publicKey, (opened.get(publicKey) ?? 0) + 1);
        return send(res, 201, { token, expires_at: new Date(Date.now() + 86_400_000).toISOString() });
      }
      case 'DELETE session': {
        const thread = threadOf(req, publicKey);
        if (!thread) return problem(res, 401, 'CHAT_SESSION_INVALID');
        if (thread.open) close(thread);
        return send(res, 204);
      }
      case 'POST messages': {
        const thread = threadOf(req, publicKey);
        if (!thread) return problem(res, 401, 'CHAT_SESSION_INVALID');
        const { text, client_message_id: clientId } = (await readJson(req)) as { text: string; client_message_id: string };
        const stored = thread.rows.find((r) => r.client_message_id === clientId);
        if (stored) return send(res, 200, { position: stored.position });
        if (!thread.open) return problem(res, 409, 'MESSAGE_THREAD_CLOSED');
        posted.set(publicKey, (posted.get(publicKey) ?? 0) + 1);
        const row = log(thread, { author: 'visitor', author_display: null, text, client_message_id: clientId });
        send(res, 200, { position: row.position });
        later(VISITOR_ECHO_MS, () => {
          show(thread, row);
          later(TYPING_AFTER_MS, () => {
            typing(thread, new Date(Date.now() + 10_000).toISOString());
            later(ANSWER_AFTER_MS, () => {
              if (!thread.open) return;
              if (!/order/i.test(text) || thread.verified) return answer(thread, `Thanks! You wrote: ${text}`);
              show(thread, log(thread, { author: 'agent', author_display: 'Mai', text: 'I need to confirm it’s you first.', client_message_id: null }));
              typing(thread, null);
              broadcast(thread, frame('verify.requested', { methods: CHAT_SERVER_CONFIG.verify_methods, requested_at: new Date().toISOString() }));
            });
          });
        });
        return;
      }
      case 'POST session/verify/email': {
        const thread = threadOf(req, publicKey);
        if (!thread) return problem(res, 401, 'CHAT_SESSION_INVALID');
        const { email } = (await readJson(req)) as { email: string };
        thread.email = email;
        thread.code = CHAT_SERVER_CODE;
        return send(res, 202, { expires_in_seconds: 600 });
      }
      case 'POST session/verify/email/confirm': {
        const thread = threadOf(req, publicKey);
        if (!thread) return problem(res, 401, 'CHAT_SESSION_INVALID');
        const { code } = (await readJson(req)) as { code: string };
        if (!thread.code || code !== thread.code || !thread.email) return problem(res, 422, 'CHAT_VERIFY_CODE_INVALID');
        thread.verified = true;
        thread.code = null;
        const at = thread.email.lastIndexOf('@');
        show(thread, log(thread, { author: 'system', author_display: null, text: `Verified as ${thread.email[0]}•••${thread.email.slice(at)}`, client_message_id: null }));
        return send(res, 204);
      }
      case 'POST session/email':
        return threadOf(req, publicKey) ? send(res, 204) : problem(res, 401, 'CHAT_SESSION_INVALID');
      case 'GET messages': {
        const thread = threadOf(req, publicKey);
        if (!thread) return problem(res, 401, 'CHAT_SESSION_INVALID');
        const after = Number(url.searchParams.get('after') ?? 0);
        const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 100);
        return send(res, 200, { messages: thread.shown.filter((r) => r.position > after).slice(0, limit) });
      }
      case 'GET stream': {
        const thread = threadOf(req, publicKey);
        if (!thread) return problem(res, 401, 'CHAT_SESSION_INVALID');
        if (thread.streams.size >= 3) return problem(res, 429, 'CHAT_RATE_LIMITED', { 'retry-after': '5' });
        const cursor = Math.max(Number(url.searchParams.get('after') ?? 0), Number(req.headers['last-event-id'] ?? 0));
        res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' });
        res.write(': open\n\n');
        for (const row of thread.shown.filter((r) => r.position > (cursor <= thread.rows.length ? cursor : 0))) res.write(frame('message', row, row.position));
        if (thread.typingUntil) res.write(frame('typing', { until: thread.typingUntil }));
        if (!thread.open) {
          res.end(frame('closed', { reason: 'thread_closed' }));
          return;
        }
        thread.streams.add(res);
        req.on('close', () => thread.streams.delete(res));
        return;
      }
      default:
        return problem(res, 404, 'NOT_FOUND');
    }
  };

  const server = createServer((req, res) => void handle(req, res));
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}`,
    sessions: (publicKey) => opened.get(publicKey) ?? 0,
    posts: (publicKey) => posted.get(publicKey) ?? 0,
    close: async () => {
      for (const timer of timers) clearTimeout(timer);
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}
