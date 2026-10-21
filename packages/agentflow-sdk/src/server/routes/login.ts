import * as client from 'openid-client';
import { cookieHeader } from '../cookies.js';
import { seal } from '../seal.js';
import { loginUrl } from '../oidc.js';
import type { OidcConfig } from '../oidc.js';

const LOGIN_COOKIE_TTL_SECONDS = 600;

/** What the login cookie seals; the callback (unsealing it) reads exactly this shape. */
export interface LoginCookiePayload {
  state: string;
  nonce: string;
  codeVerifier: string;
  returnTo: string;
  exp: number;
}

export interface HandleLoginOptions {
  request: Request;
  config: OidcConfig;
  redirectUri: string;
  resource: string;
  orgHint?: string;
  afterSignIn: string;
  sessionKey: string;
  loginCookieName: string;
  secureCookies: boolean;
}

export async function handleLogin(opts: HandleLoginOptions): Promise<Response> {
  const requestedReturnTo = new URL(opts.request.url).searchParams.get('returnTo');
  const returnTo = isSafeReturnTo(requestedReturnTo) ? requestedReturnTo : opts.afterSignIn;

  const codeVerifier = client.randomPKCECodeVerifier();
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  const state = client.randomState();
  const nonce = client.randomNonce();

  const payload: LoginCookiePayload = {
    state,
    nonce,
    codeVerifier,
    returnTo,
    exp: Date.now() + LOGIN_COOKIE_TTL_SECONDS * 1000,
  };
  const sealed = await seal(opts.sessionKey, payload);

  const location = loginUrl(opts.config, {
    state,
    nonce,
    codeChallenge,
    redirectUri: opts.redirectUri,
    resource: opts.resource,
    orgHint: opts.orgHint,
  });

  const headers = new Headers({ location: location.toString() });
  headers.append(
    'set-cookie',
    cookieHeader(opts.loginCookieName, sealed, { maxAge: LOGIN_COOKIE_TTL_SECONDS, secure: opts.secureCookies }),
  );
  return new Response(null, { status: 302, headers });
}

/** Anything but printable ASCII. The URL parser drops a tab or newline and percent-encodes the rest,
 * so such a value passes the origin check below — and then `Headers` refuses it as a `Location`
 * (a control character, or a code point above U+00FF). A browser's own path is already
 * percent-encoded ASCII, so nothing legitimate is lost. */
const NOT_PRINTABLE_ASCII = /[^\x20-\x7E]/;

/**
 * A same-origin relative path only. Refuses `//` (protocol-relative), a backslash (some browsers
 * treat it as `/`, defeating the leading-slash check), a character a `Location` header cannot carry,
 * and anything an absolute URL would parse to a different origin than a fixed, arbitrary base.
 *
 * The caller keeps the value exactly as given: the parsed `pathname` is only for the check, since
 * normalising `/.//evil.test` yields `//evil.test`, which a browser reads as another host.
 */
export function isSafeReturnTo(value: unknown): value is string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return false;
  if (NOT_PRINTABLE_ASCII.test(value)) return false;
  try {
    return new URL(value, 'http://agentflow.invalid').origin === 'http://agentflow.invalid';
  } catch {
    return false;
  }
}
