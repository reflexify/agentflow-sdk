import * as client from 'openid-client';
import { toBase64Url } from '../../base64url.js';
import { accessExpiresAt } from '../access.js';
import { cookieHeader, readCookie } from '../cookies.js';
import { seal, unseal } from '../seal.js';
import type { OidcConfig } from '../oidc.js';
import type { ServerErrorHandler } from '../options.js';
import { problem } from '../problem.js';
import { reportError } from '../report.js';
import type { SessionStore } from '../sessions.js';
import { isSafeReturnTo } from './login.js';
import type { LoginCookiePayload } from './login.js';

const SIGN_IN_EXPIRED = 'SIGN_IN_EXPIRED';
const SIGN_IN_FAILED = 'SIGN_IN_FAILED';
const PROBE_TIMEOUT_MS = 10_000;
const ROUTE = 'auth/callback';

/**
 * What `GET {apiBaseUrl}/caller` answers on success. Adds `email`, `org_name` and `app` beyond
 * the OpenAPI `Caller` schema — a deliberate deviation, corrected in the published contract later.
 */
export interface Caller {
  kind: string;
  id: string;
  display_name: string;
  org_id: string;
  email: string;
  org_name: string | null;
  permissions: string[];
  app: { key: string; name: string | null } | null;
}

/** What gets sealed into the session store. Tokens never reach the browser unsealed. */
export interface SessionPayload {
  accessToken: string;
  accessExpiresAt: number;
  refreshToken: string;
  idToken: string;
  caller: Caller;
}

export interface HandleCallbackOptions {
  request: Request;
  config: OidcConfig;
  redirectUri: string;
  /** Without a trailing slash: `resolveOptions` trims it. */
  apiBaseUrl: string;
  resource: string;
  afterSignIn: string;
  sessions: SessionStore;
  sessionKey: string;
  loginCookieName: string;
  sessionCookieName: string;
  secureCookies: boolean;
  sessionTtlSeconds: number;
  fetch?: typeof fetch;
  onError?: ServerErrorHandler;
}

export async function handleCallback(opts: HandleCallbackOptions): Promise<Response> {
  const clearLoginCookie = cookieHeader(opts.loginCookieName, '', { maxAge: 0, secure: opts.secureCookies });

  const sealedLogin = readCookie(opts.request, opts.loginCookieName);
  const login = sealedLogin ? await unseal<LoginCookiePayload>(opts.sessionKey, sealedLogin) : undefined;
  if (!login || login.exp <= Date.now()) {
    return problem(400, SIGN_IN_EXPIRED, 'Sign-in expired', [clearLoginCookie]);
  }

  // Redeem against the *configured* redirect URI, carrying only the request's query string. A
  // TLS-terminating proxy can hand this handler a request whose origin/scheme differs from what
  // was registered with the IdP and sent to /authorize, and the token endpoint checks for an
  // exact match — using `request.url`'s own origin here would break sign-in behind one.
  const currentUrl = new URL(opts.redirectUri);
  currentUrl.search = new URL(opts.request.url).search;

  let tokens;
  try {
    tokens = await client.authorizationCodeGrant(
      opts.config,
      currentUrl,
      { pkceCodeVerifier: login.codeVerifier, expectedState: login.state, expectedNonce: login.nonce, idTokenExpected: true },
      { resource: opts.resource },
    );
  } catch (err) {
    // State mismatch, a replayed/unknown code, a redirect_uri mismatch, or a bad `iss` all land
    // here as opaque failures from openid-client — none of them are the caller's fault to debug.
    reportError(opts.onError, ROUTE, err);
    return problem(400, SIGN_IN_EXPIRED, 'Sign-in expired', [clearLoginCookie]);
  }

  // Everything from here on is a *post-grant* failure: the IdP already issued real tokens, so a
  // problem past this point (a missing claim, an unreachable API, a malformed response, a store
  // write failure) is this SDK's to clean up rather than the caller's to debug — best-effort
  // revoke what was issued, clear the login cookie, and send the browser to `afterSignIn` with a
  // single generic code instead of a 500 or a session nothing can ever end.
  const { access_token: accessToken, refresh_token: refreshToken, id_token: idToken, expires_in: expiresIn } = tokens;
  const idClaims = tokens.claims();
  const sid = typeof idClaims?.sid === 'string' ? idClaims.sid : undefined;

  if (!refreshToken || !idToken || !sid) {
    return failSignIn(opts, refreshToken, clearLoginCookie, new Error('token response is missing refresh_token, id_token or a sid claim'));
  }

  let callerRes: Response;
  try {
    const fetchImpl = opts.fetch ?? globalThis.fetch;
    callerRes = await fetchImpl(`${opts.apiBaseUrl}/caller`, {
      headers: { authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
  } catch (err) {
    return failSignIn(opts, refreshToken, clearLoginCookie, err);
  }

  if (callerRes.status !== 200) {
    // A legitimate application-level refusal (no install, no assignment, …), not an SDK bug:
    // still revoke and clear, but forward the upstream problem type rather than SIGN_IN_FAILED.
    // The body is read first: the probe's timeout also bounds reading it, and a slow revocation
    // must not use that time up and turn the type into `HTTP_<status>`.
    const errorCode = (await problemType(callerRes)) ?? `HTTP_${callerRes.status}`;
    await bestEffortRevoke(opts, refreshToken);
    return redirectWithError(opts.afterSignIn, errorCode, [clearLoginCookie]);
  }

  let caller: Caller;
  try {
    const body: unknown = await callerRes.json();
    if (!isCaller(body)) throw new Error('GET /caller answered 200 with an unexpected body shape');
    caller = body;
  } catch (err) {
    return failSignIn(opts, refreshToken, clearLoginCookie, err);
  }

  const sessionId = randomSessionId();
  // Checked again here: a login cookie sealed by an earlier version, under a looser check, stays
  // valid for its 10 minutes.
  const returnTo = isSafeReturnTo(login.returnTo) ? login.returnTo : opts.afterSignIn;
  // Built before the session is written: a `Location` that `Headers` refuses must fail the sign-in
  // here, not throw after the write and leave a session no cookie names and nothing can end.
  let signedIn: Response;
  try {
    signedIn = redirect(returnTo, [
      cookieHeader(opts.sessionCookieName, sessionId, { maxAge: opts.sessionTtlSeconds, secure: opts.secureCookies }),
      clearLoginCookie,
    ]);
  } catch (err) {
    return failSignIn(opts, refreshToken, clearLoginCookie, err);
  }

  const payload: SessionPayload = {
    accessToken,
    accessExpiresAt: accessExpiresAt(expiresIn),
    refreshToken,
    idToken,
    caller,
  };
  try {
    await opts.sessions.set(sessionId, {
      sid,
      sealed: await seal(opts.sessionKey, payload),
      expiresAt: Date.now() + opts.sessionTtlSeconds * 1000,
    });
  } catch (err) {
    return failSignIn(opts, refreshToken, clearLoginCookie, err);
  }

  return signedIn;
}

/** The single post-grant failure path: report, best-effort revoke, clear the login cookie, and
 * send the browser to `afterSignIn` with a generic error code — never a 500, never a session. */
async function failSignIn(
  opts: HandleCallbackOptions,
  refreshToken: string | undefined,
  clearLoginCookie: string,
  error: unknown,
): Promise<Response> {
  reportError(opts.onError, ROUTE, error);
  await bestEffortRevoke(opts, refreshToken);
  return redirectWithError(opts.afterSignIn, SIGN_IN_FAILED, [clearLoginCookie]);
}

async function bestEffortRevoke(opts: HandleCallbackOptions, refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) return;
  try {
    await client.tokenRevocation(opts.config, refreshToken);
  } catch (err) {
    reportError(opts.onError, ROUTE, err);
  }
}

function isCaller(value: unknown): value is Caller {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && typeof v.org_id === 'string';
}

function randomSessionId(): string {
  return toBase64Url(globalThis.crypto.getRandomValues(new Uint8Array(32)));
}

async function problemType(res: Response): Promise<string | undefined> {
  try {
    const body = (await res.json()) as { type?: unknown };
    return typeof body.type === 'string' ? body.type : undefined;
  } catch {
    return undefined;
  }
}

/** Appends `agentflow_error` to `afterSignIn` via `URL`/`searchParams`, not string concatenation,
 * so an `afterSignIn` that already carries its own query string comes out well-formed. */
function redirectWithError(afterSignIn: string, code: string, setCookies: string[]): Response {
  const url = new URL(afterSignIn, 'http://agentflow.invalid');
  url.searchParams.set('agentflow_error', code);
  return redirect(url.pathname + url.search + url.hash, setCookies);
}

function redirect(location: string, setCookies: string[]): Response {
  const headers = new Headers({ location });
  for (const cookie of setCookies) headers.append('set-cookie', cookie);
  return new Response(null, { status: 302, headers });
}
