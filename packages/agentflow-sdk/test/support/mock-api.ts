import { serve } from '@hono/node-server';
import type { ServerType } from '@hono/node-server';
import { Hono } from 'hono';
import { decodeJwt } from 'jose';

export interface MockApiRequest {
  method: string;
  path: string;
  /** The raw query string including its leading `?`, or `''`. */
  search: string;
  authorization: string | null;
  cookie: string | null;
  idempotencyKey: string | null;
  contentType: string | null;
  /** Every header as received, lower-cased names. */
  headers: Record<string, string>;
  /** Bytes of request body received; updated once the body has been read to the end, so a record
   * appears (with 0) as soon as the request's headers arrive. */
  bodyBytes: number;
}

export interface MockApi {
  baseUrl: string;
  close(): Promise<void>;
  callerStatus: number;
  callerType?: string;
  /** When set, a `callerStatus === 200` answers with this raw body instead of the normal JSON
   * caller object — for exercising a malformed-response path the real API should never produce. */
  callerRaw?: string;
  requests: MockApiRequest[];
  /** When set, answers every `/api/v1/*` request other than `/caller`; returning `undefined` falls
   * back to the echo. For injecting upstream responses (problems, cookies, redirects). */
  respond?: ((request: Request) => Response | Promise<Response> | undefined) | undefined;
}

function problem(status: number, type: string): Response {
  return new Response(JSON.stringify({ type, title: type, status }), {
    status,
    headers: { 'content-type': 'application/problem+json' },
  });
}

/**
 * A stand-in AgentFlow REST API: answers `GET /api/v1/caller` with `callerStatus`/`callerType`
 * and echoes everything else, recording every request the SDK's proxy forwards to it.
 */
export async function startMockApi(): Promise<MockApi> {
  const requests: MockApiRequest[] = [];

  // Assigned once the server has a port; route handlers close over `api` and read its mutable
  // callerStatus/callerType fields lazily, so declaring it before `listen()` resolves is safe.
  let api!: MockApi;

  const app = new Hono();

  app.use('*', async (c, next) => {
    const url = new URL(c.req.url);
    const headers: Record<string, string> = {};
    c.req.raw.headers.forEach((value, name) => {
      headers[name] = value;
    });
    const record: MockApiRequest = {
      method: c.req.method,
      path: url.pathname,
      search: url.search,
      authorization: c.req.header('authorization') ?? null,
      cookie: c.req.header('cookie') ?? null,
      idempotencyKey: c.req.header('idempotency-key') ?? null,
      contentType: c.req.header('content-type') ?? null,
      headers,
      bodyBytes: 0,
    };
    // Recorded before the body is read, so a test can observe that a request has *started*
    // arriving while its body is still streaming in.
    requests.push(record);
    if (c.req.raw.body) record.bodyBytes = (await c.req.arrayBuffer()).byteLength;
    await next();
  });

  app.get('/api/v1/caller', (c) => {
    if (api.callerStatus !== 200) {
      return problem(api.callerStatus, api.callerType ?? 'ERROR');
    }
    if (api.callerRaw !== undefined) {
      return new Response(api.callerRaw, { status: 200, headers: { 'content-type': 'text/plain' } });
    }
    const auth = c.req.header('authorization');
    let sub = 'unknown';
    let tid = 'unknown';
    if (auth?.startsWith('Bearer ')) {
      try {
        const claims = decodeJwt(auth.slice('Bearer '.length));
        if (typeof claims.sub === 'string') sub = claims.sub;
        if (typeof claims.tid === 'string') tid = claims.tid;
      } catch {
        // Malformed bearer token: fall through with placeholder identity; callerStatus governs
        // whether this endpoint should even be answering 200.
      }
    }
    return Response.json({
      kind: 'user',
      id: sub,
      display_name: 'Ann',
      org_id: tid,
      email: 'ann@example.test',
      org_name: 'Acme',
      permissions: [],
      app: { key: 'case-desk', name: 'Case desk' },
    });
  });

  app.all('/api/v1/*', async (c) => {
    const injected = await api.respond?.(c.req.raw);
    return injected ?? Response.json({ method: c.req.method, path: new URL(c.req.url).pathname });
  });

  const server = await new Promise<ServerType>((resolve) => {
    const s = serve({ fetch: app.fetch, hostname: '127.0.0.1', port: 0 }, () => resolve(s));
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('mock API failed to bind a TCP port');

  api = {
    baseUrl: `http://127.0.0.1:${address.port}`,
    callerStatus: 200,
    callerType: undefined,
    callerRaw: undefined,
    respond: undefined,
    requests,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };

  return api;
}
