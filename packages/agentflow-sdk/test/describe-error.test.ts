import * as openid from 'openid-client';
import { jwtVerify } from 'jose';
import { describe, expect, it } from 'vitest';
import { IdpUnavailable, NotSignedIn } from '../src/server/access.js';
import { describeError } from '../src/server/describe-error.js';

// The classes openid-client throws, typed loosely so a test can build the malformed shapes
// (a numeric `error`, an unprintable code) a provider or an attacker could send.
const oauth = openid as unknown as {
  ResponseBodyError: new (message: string, options: { cause: Record<string, unknown>; response: Response }) => Error;
  AuthorizationResponseError: new (message: string, options: { cause: URLSearchParams }) => Error;
  WWWAuthenticateChallengeError: new (message: string, options: { cause: unknown[]; response: Response }) => Error;
  ClientError: new (message: string, options?: { cause?: unknown; code?: string }) => Error;
};

describe('describeError', () => {
  const refreshFailed = (cause: unknown) => new IdpUnavailable('the identity provider could not refresh the session', { cause });
  const bodyError = (body: Record<string, unknown>) =>
    new oauth.ResponseBodyError('server responded with an error in the response body', { cause: body, response: new Response(null, { status: 400 }) });
  const challenge = (parameters: Record<string, string>) =>
    new oauth.WWWAuthenticateChallengeError('server responded with a challenge in the WWW-Authenticate HTTP Header', {
      cause: [{ scheme: 'bearer', parameters }],
      response: new Response(null, { status: 401 }),
    });
  const authorizationError = (query: string) =>
    new oauth.AuthorizationResponseError('authorization response from the server is an error', { cause: new URLSearchParams(query) });
  const fetchFailed = (code: string) => new TypeError('fetch failed', { cause: Object.assign(new AggregateError([], ''), { code }) });

  const described: [string, unknown, string][] = [
    ['a refresh the token endpoint refused', refreshFailed(bodyError({ error: 'invalid_client', error_description: 'kid-secret' })), 'IdpUnavailable: the identity provider could not refresh the session (invalid_client)'],
    ['a refresh refused with a WWW-Authenticate challenge', refreshFailed(challenge({ error: 'invalid_client', error_description: 'kid-secret' })), 'IdpUnavailable: the identity provider could not refresh the session (invalid_client)'],
    ['a refresh that timed out', refreshFailed(new oauth.ClientError('operation timed out', { code: 'OAUTH_TIMEOUT', cause: new DOMException('timed out', 'TimeoutError') })), 'IdpUnavailable: the identity provider could not refresh the session (OAUTH_TIMEOUT)'],
    ['a refresh token the provider refused', new NotSignedIn('the identity provider refused to refresh the session', { cause: bodyError({ error: 'invalid_grant' }) }), 'NotSignedIn: the identity provider refused to refresh the session (invalid_grant)'],
    ['an unreachable host, one level down only', refreshFailed(fetchFailed('ECONNREFUSED')), 'IdpUnavailable: the identity provider could not refresh the session'],
    ['a refused connection', fetchFailed('ECONNREFUSED'), 'TypeError: fetch failed (ECONNREFUSED)'],
    ['a host name that does not resolve', new TypeError('fetch failed', { cause: Object.assign(new Error('getaddrinfo ENOTFOUND id.example'), { code: 'ENOTFOUND' }) }), 'TypeError: fetch failed (ENOTFOUND)'],
    ['the provider refusing at /authorize', authorizationError('error=access_denied&error_description=no_seat&state=s1'), 'AuthorizationResponseError: authorization response from the server is an error (access_denied)'],
    ['the token endpoint refusing the code', bodyError({ error: 'invalid_target', error_description: 'resource-secret' }), 'ResponseBodyError: server responded with an error in the response body (invalid_target)'],
    ['a WWW-Authenticate challenge', challenge({ error: 'invalid_client', realm: 'id' }), 'WWWAuthenticateChallengeError: server responded with a challenge in the WWW-Authenticate HTTP Header (invalid_client)'],
    ['an error and a cause with the same code, once', new oauth.ClientError('unexpected JWT claim value encountered', { code: 'OAUTH_JWT_CLAIM_COMPARISON_FAILED', cause: Object.assign(new Error('unexpected ID Token "nonce" claim value'), { code: 'OAUTH_JWT_CLAIM_COMPARISON_FAILED' }) }), 'ClientError: unexpected JWT claim value encountered (OAUTH_JWT_CLAIM_COMPARISON_FAILED)'],
    ['an error and a cause with different codes, both', Object.assign(new Error('outer', { cause: Object.assign(new Error('inner'), { code: 'EPIPE' }) }), { code: 'OUTER_CODE' }), 'Error: outer (OUTER_CODE, EPIPE)'],
    ['a cause that is not an Error, which is never read', new Error('boom', { cause: { code: 'BODY_CODE', error: 'body_error' } }), 'Error: boom'],
  ];
  for (const [what, error, line] of described) {
    it(`describes ${what}`, () => {
      expect(describeError(error)).toBe(line);
    });
  }

  it('never prints the error_description, the response body or the cause message', () => {
    const out = [
      refreshFailed(bodyError({ error: 'invalid_client', error_description: 'description-secret', refresh_token: 'rt-secret' })),
      authorizationError('error=access_denied&error_description=description-secret&code=code-secret'),
      new TypeError('fetch failed', { cause: Object.assign(new Error('cause-message-secret'), { code: 'ECONNRESET' }) }),
    ].map(describeError).join('\n');
    expect(out).not.toMatch(/description-secret|rt-secret|code-secret|cause-message-secret/);
  });

  const hostile = ['\u001b[2K\u001b[1Gforged', 'access_denied\n[agentflow] forged', 'x\ry', 'tab\there', 'quote"d', 'back\\slash', 'é', 'a'.repeat(65), ''];
  for (const code of hostile) {
    it(`drops the code ${JSON.stringify(code)}, which RFC 6749's error charset does not allow`, () => {
      const lines = [
        describeError(authorizationError(`error=${encodeURIComponent(code)}&state=s1`)),
        describeError(refreshFailed(bodyError({ error: code }))),
        describeError(refreshFailed(challenge({ error: code }))),
        describeError(fetchFailed(code)),
        describeError(Object.assign(new Error('boom'), { code })),
      ];
      expect(lines).toEqual([
        'AuthorizationResponseError: authorization response from the server is an error (OAUTH_AUTHORIZATION_RESPONSE_ERROR)',
        'IdpUnavailable: the identity provider could not refresh the session (OAUTH_RESPONSE_BODY_ERROR)',
        'IdpUnavailable: the identity provider could not refresh the session (OAUTH_WWW_AUTHENTICATE_CHALLENGE)',
        'TypeError: fetch failed',
        'Error: boom',
      ]);
    });
  }
  it('prints a code of 64 characters, the longest RFC 6749 lets through here', () => {
    expect(describeError(refreshFailed(bodyError({ error: 'e'.repeat(64) })))).toBe(`IdpUnavailable: the identity provider could not refresh the session (${'e'.repeat(64)})`);
  });
  it('prints no code that is not a string', () => {
    expect(describeError(Object.assign(new Error('boom'), { code: 23 }))).toBe('Error: boom');
    expect(describeError(refreshFailed(bodyError({ error: 7 })))).toBe('IdpUnavailable: the identity provider could not refresh the session (OAUTH_RESPONSE_BODY_ERROR)');
  });

  it('escapes control characters in the name and message, so a line stays one line', () => {
    const error = new Error('a\u001b[2K\nb\rc\u007fd\u009be');
    error.name = 'Bad\nName';
    expect(describeError(error)).toBe('Bad\\x0aName: a\\x1b[2K\\x0ab\\x0dc\\x7fd\\x9be');
  });

  it('escapes the header value jose puts in a message before any key is checked', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', crit: ['\u001b[2K\u001b[1G[agentflow] forged\n[case-desk] second'] })).toString('base64url');
    const error = await jwtVerify(`${header}.${Buffer.from('{}').toString('base64url')}.sig`, new Uint8Array(32)).catch((e: unknown) => e);
    const line = describeError(error);
    expect(line).toMatch(/^JOSENotSupported: /);
    expect(line).not.toMatch(/[\x00-\x1f\x7f-\x9f]/);
    expect(line).toContain('\\x1b[2K\\x1b[1G[agentflow] forged\\x0a[case-desk] second');
  });
});
