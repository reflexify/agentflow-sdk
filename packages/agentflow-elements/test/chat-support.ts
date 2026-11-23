import type { ChatConfig, LoggedMessage } from '../src/chat/transport.js';

export const CHAT_ORIGIN = 'https://api.test';
export const PUBLIC_KEY = 'pub_test';

export const CHAT_CONFIG: ChatConfig = {
  branding: { color: '#0f766e', logo_url: null, languages: ['en', 'vi'], greetings: { en: 'Hello there' } },
  verify_methods: [],
};

export interface ChatCall {
  method: string;
  path: string;
  headers: Headers;
  body: unknown;
}

export interface FakeStream {
  headers: Headers;
  cancelled: boolean;
  push(event: string, data: unknown, id?: number): void;
  end(): void;
}

type Route = (call: ChatCall) => Response | Promise<Response> | undefined;

const encoder = new TextEncoder();

export const answer = (status: number, body?: unknown, headers: Record<string, string> = {}) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });

export const row = (position: number, author: LoggedMessage['author'], text: string, clientId: string | null = null): LoggedMessage => ({
  position,
  author,
  author_display: null,
  text,
  client_message_id: clientId,
  created_at: '2026-11-22T00:00:00Z',
});

export function fakeChat(override: Route = () => undefined) {
  const calls: ChatCall[] = [];
  const streams: FakeStream[] = [];
  let sessions = 0;
  let position = 0;
  const fetchImpl = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(String(input));
    const call: ChatCall = {
      method: init.method ?? 'GET',
      path: url.pathname.replace(`/api/v1/chat/${PUBLIC_KEY}/`, '') + url.search,
      headers: new Headers(init.headers),
      body: typeof init.body === 'string' ? JSON.parse(init.body) : undefined,
    };
    calls.push(call);
    const overridden = override(call);
    if (overridden) return overridden;
    switch (`${call.method} ${call.path.split('?')[0]}`) {
      case 'GET config':
        return answer(200, CHAT_CONFIG);
      case 'POST sessions':
        sessions++;
        return answer(201, { token: `afv_${sessions}`, expires_at: '2026-11-23T00:00:00Z' });
      case 'POST messages':
        return answer(200, { position: ++position });
      case 'GET stream': {
        let controller!: ReadableStreamDefaultController<Uint8Array>;
        const stream: FakeStream = {
          headers: call.headers,
          cancelled: false,
          push: (event, data, id) => controller.enqueue(encoder.encode(`${id === undefined ? '' : `id: ${id}\n`}event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)),
          end: () => controller.close(),
        };
        const body = new ReadableStream<Uint8Array>({
          start: (c) => void (controller = c),
          cancel: () => void (stream.cancelled = true),
        });
        streams.push(stream);
        return new Response(body, { status: 200, headers: { 'content-type': 'text/event-stream' } });
      }
      default:
        return answer(404, { type: 'NOT_FOUND', title: 'Not Found', status: 404 });
    }
  };
  return { fetch: fetchImpl as typeof fetch, calls, streams };
}

export async function until(ready: () => boolean, what: string, limit = 200): Promise<void> {
  for (let i = 0; i < limit; i++) {
    if (ready()) return;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error(`timed out waiting for ${what}`);
}
