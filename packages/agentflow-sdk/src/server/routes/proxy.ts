import { matchOperation } from '../../operations.js';
import { IdpUnavailable, NotSignedIn, isSessionId } from '../access.js';
import type { SessionAccess } from '../access.js';
import { cookieHeader, readCookie } from '../cookies.js';
import type { ServerErrorHandler } from '../options.js';
import { problem } from '../problem.js';
import { reportError } from '../report.js';
import { isSameOrigin } from '../same-origin.js';
import type { SessionStore } from '../sessions.js';

const ROUTE = 'api';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** Sent with `IDP_UNAVAILABLE`, so a retrying client backs off rather than each request becoming
 * several back-to-back refresh grants against a provider that is already failing. */
const IDP_RETRY_AFTER_SECONDS = '5';

/** The only browser headers that reach the API. Everything else — cookies, the browser's own
 * `authorization`, `x-forwarded-*` — stays on this side. */
const FORWARDED_REQUEST_HEADERS = ['content-type', 'accept', 'idempotency-key', 'if-none-match', 'last-event-id'] as const;

/** RFC 9110 §7.6.1: these describe the proxy's own connection to the API, not the browser's. */
const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'proxy-connection',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

/** Content codings `fetch` decodes transparently, leaving the header describing bytes that are gone. */
const DECODED_BY_FETCH = new Set(['gzip', 'x-gzip', 'deflate', 'br', 'zstd']);

/** Statuses a `Response` must be constructed without a body. */
const NULL_BODY_STATUSES = new Set([101, 103, 204, 205, 304]);

/** Upstream 401 types meaning the session's tokens are dead for good. */
const SESSION_ENDING_TYPES = new Set(['SESSION_REVOKED', 'TOKEN_EXPIRED']);

const UNSAFE_RAW_PATH = /(^|\/)\.\.(\/|$)|%2e|%2f|%5c|\\|\/\//i;

/**
 * True for a path carrying a `..` segment, an encoded dot, slash or backslash, a backslash, or an
 * empty segment. A WHATWG `Request` has already normalised some of these away; this check is for
 * the ones it keeps and for hosts that hand over a request URL nothing normalised.
 */
export function isUnsafeRawPath(rawPath: string): boolean {
  return UNSAFE_RAW_PATH.test(rawPath);
}

export interface HandleProxyOptions {
  request: Request;
  basePath: string;
  /** Without a trailing slash: `resolveOptions` trims it. */
  apiBaseUrl: string;
  access: SessionAccess;
  sessions: SessionStore;
  sessionCookieName: string;
  secureCookies: boolean;
  fetch?: typeof fetch;
  onError?: ServerErrorHandler;
}

/** Forwards a published AgentFlow operation with the session's bearer token; refuses everything else. */
export async function handleProxy(opts: HandleProxyOptions): Promise<Response> {
  const { request } = opts;

  const prefix = `${opts.basePath}/api`;
  const rawPath = rawPathOf(request.url);
  if (isUnsafeRawPath(rawPath) || (rawPath !== prefix && !rawPath.startsWith(`${prefix}/`))) {
    return problem(400, 'BAD_PATH', 'Bad path');
  }
  const rest = rawPath.slice(prefix.length);

  const op = matchOperation(request.method, rest);
  if (!op) return problem(404, 'NOT_PUBLISHED', 'Operation not published');

  if (!SAFE_METHODS.has(op.method) && !isSameOrigin(request)) {
    return problem(403, 'CROSS_SITE_REQUEST', 'Cross-site request refused');
  }

  const clearSessionCookie = cookieHeader(opts.sessionCookieName, '', { maxAge: 0, secure: opts.secureCookies });
  const sessionId = readCookie(request, opts.sessionCookieName);
  if (!sessionId || !isSessionId(sessionId)) {
    return notSignedIn(sessionId ? [clearSessionCookie] : []);
  }

  let token: string;
  try {
    token = await opts.access.accessTokenFor(sessionId);
  } catch (err) {
    if (err instanceof IdpUnavailable) {
      reportError(opts.onError, ROUTE, err);
      return problem(503, 'IDP_UNAVAILABLE', 'Identity provider unavailable', [], { 'retry-after': IDP_RETRY_AFTER_SECONDS });
    }
    if (!(err instanceof NotSignedIn)) throw err;
    if (err.cause !== undefined) reportError(opts.onError, ROUTE, err);
    return notSignedIn([clearSessionCookie]);
  }

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  headers.set('authorization', `Bearer ${token}`);
  // Keeps `content-length` truthful end to end; see `relay` for an upstream that encodes anyway.
  headers.set('accept-encoding', 'identity');

  // Built only from configuration, a path that matched a published template (so: fixed segments
  // and UUIDs), and the query string — never a host, scheme or userinfo from the browser.
  const upstreamUrl = `${opts.apiBaseUrl}${rest}${new URL(request.url).search}`;
  const init: RequestInit & { duplex?: 'half' } = {
    method: op.method,
    headers,
    // A redirect goes back to the browser: following it here would carry the bearer along.
    redirect: 'manual',
    signal: request.signal,
  };
  if (request.body && op.method !== 'GET' && op.method !== 'HEAD') {
    // Streamed through, never buffered: uploads can be large.
    init.body = request.body;
    init.duplex = 'half';
  }
  const upstream = await (opts.fetch ?? globalThis.fetch)(upstreamUrl, init);

  const setCookies: string[] = [];
  if (upstream.status === 401 && SESSION_ENDING_TYPES.has((await problemType(upstream)) ?? '')) {
    setCookies.push(clearSessionCookie);
    try {
      await opts.sessions.delete(sessionId);
    } catch (err) {
      reportError(opts.onError, ROUTE, err);
    }
  }
  return relay(upstream, setCookies);
}

function notSignedIn(setCookies: string[]): Response {
  return problem(401, 'NOT_SIGNED_IN', 'Not signed in', setCookies);
}

/** The request URL's path exactly as given — no dot-segment or percent-decoding applied. */
function rawPathOf(url: string): string {
  const withoutQuery = url.split('?', 1)[0]!.split('#', 1)[0]!;
  const schemeEnd = withoutQuery.indexOf('://');
  if (schemeEnd === -1) return withoutQuery;
  const pathStart = withoutQuery.indexOf('/', schemeEnd + 3);
  return pathStart === -1 ? '/' : withoutQuery.slice(pathStart);
}

async function problemType(res: Response): Promise<string | undefined> {
  if (!res.headers.get('content-type')?.includes('json')) return undefined;
  try {
    const body = (await res.clone().json()) as { type?: unknown };
    return typeof body.type === 'string' ? body.type : undefined;
  } catch {
    return undefined;
  }
}

/** The upstream response for the browser: status and body stream as is, headers minus
 * `set-cookie` (the API's cookies are not this origin's) and hop-by-hop ones. */
function relay(upstream: Response, setCookies: string[]): Response {
  const headers = new Headers();
  upstream.headers.forEach((value, name) => {
    if (name === 'set-cookie' || HOP_BY_HOP.has(name)) return;
    headers.append(name, value);
  });
  const codings = headers.get('content-encoding')?.split(',').map((c) => c.trim().toLowerCase());
  if (codings && codings.every((c) => DECODED_BY_FETCH.has(c))) {
    headers.delete('content-encoding');
    headers.delete('content-length');
  }
  // The answer was made with this session's bearer: no shared cache may keep it for another user.
  if (!headers.has('cache-control')) headers.set('cache-control', 'private');
  for (const cookie of setCookies) headers.append('set-cookie', cookie);

  return new Response(NULL_BODY_STATUSES.has(upstream.status) ? null : upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}
