import type { AgentFlowServer } from '../../src/server/index.js';
import type { MockIdp } from './mock-idp.js';

export interface SignInResult {
  cookie: string;
  location: string;
}

const ORIGIN = 'https://app.test';

/**
 * Drives a full sign-in through an in-process `AgentFlowServer`: `auth/login` → the mock IdP's
 * `/authorize` (followed manually, never via the fetch `redirect: 'follow'` default, since the
 * redirect target is `app.test` and not actually served) → `auth/callback`. `idp` isn't read here
 * — the login redirect already carries its `/authorize` URL — but stays a parameter so every call
 * site names the fixture it depends on.
 */
export async function signIn(server: AgentFlowServer, _idp: MockIdp, returnTo = '/'): Promise<SignInResult> {
  const loginRes = await server.handle(
    new Request(`${ORIGIN}/agentflow/auth/login?returnTo=${encodeURIComponent(returnTo)}`),
  );
  if (!loginRes || loginRes.status !== 302) {
    throw new Error(`expected auth/login to redirect, got ${loginRes?.status ?? 'undefined'}`);
  }
  const authorizeUrl = loginRes.headers.get('location');
  const loginSetCookie = loginRes.headers.get('set-cookie');
  if (!authorizeUrl || !loginSetCookie) {
    throw new Error('auth/login response is missing the redirect location or the login cookie');
  }

  const authorizeRes = await fetch(authorizeUrl, { redirect: 'manual' });
  const callbackUrl = authorizeRes.headers.get('location');
  if (!callbackUrl) {
    throw new Error('the identity provider did not redirect back to the callback URL');
  }

  const callbackRes = await server.handle(
    new Request(callbackUrl, { headers: { cookie: cookiePair(loginSetCookie) } }),
  );
  if (!callbackRes) {
    throw new Error('expected auth/callback to answer');
  }

  return {
    cookie: sessionCookiePair(callbackRes.headers.getSetCookie()),
    location: callbackRes.headers.get('location') ?? '',
  };
}

function cookiePair(setCookieHeader: string): string {
  return setCookieHeader.split(';')[0]!.trim();
}

/**
 * Picks the one `Set-Cookie` entry with a non-empty value out of a callback response: the login
 * cookie is always cleared (empty value) alongside it, on both success and refusal.
 */
function sessionCookiePair(setCookies: string[]): string {
  for (const raw of setCookies) {
    const pair = cookiePair(raw);
    const eq = pair.indexOf('=');
    if (eq !== -1 && pair.slice(eq + 1).length > 0) return pair;
  }
  return '';
}
