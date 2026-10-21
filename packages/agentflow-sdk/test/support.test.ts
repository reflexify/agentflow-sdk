import { randomUUID } from 'node:crypto';
import { decodeJwt, generateKeyPair, SignJWT } from 'jose';
import * as client from 'openid-client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { appKeys } from './support/app-keys.js';
import { startMockApi } from './support/mock-api.js';
import type { MockApi } from './support/mock-api.js';
import { startMockIdp } from './support/mock-idp.js';
import type { MockIdp } from './support/mock-idp.js';

const CLIENT_ID = 'case-desk-dev';
const RESOURCE = 'https://agentflow.example/api/v1/rest';
const REDIRECT_URI = 'https://app.test/agentflow/auth/callback';

async function clientAssertion(privateKey: CryptoKey, audience: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuer(CLIENT_ID)
    .setSubject(CLIENT_ID)
    .setAudience(audience)
    .setIssuedAt(now)
    .setExpirationTime(now + 60)
    .setJti(randomUUID())
    .sign(privateKey);
}

describe('mock identity provider', () => {
  let idp: MockIdp;
  let privateKey: CryptoKey;

  beforeAll(async () => {
    const keys = await appKeys();
    privateKey = keys.privateKey;
    idp = await startMockIdp({ clientId: CLIENT_ID, appPublicJwk: keys.publicJwk, resource: RESOURCE });
  });

  afterAll(() => idp.close());

  async function authorize(): Promise<{ code: string; verifier: string; state: string }> {
    const verifier = client.randomPKCECodeVerifier();
    const challenge = await client.calculatePKCECodeChallenge(verifier);
    const state = client.randomState();
    const url = new URL(`${idp.issuer}/authorize`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', CLIENT_ID);
    url.searchParams.set('redirect_uri', REDIRECT_URI);
    url.searchParams.set('state', state);
    url.searchParams.set('code_challenge', challenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('resource', RESOURCE);
    url.searchParams.set('nonce', 'nonce-1');

    const res = await fetch(url, { redirect: 'manual' });
    expect(res.status).toBe(302);
    const location = new URL(res.headers.get('location')!);
    return { code: location.searchParams.get('code')!, verifier, state };
  }

  async function tokenRequestWithAssertion(assertion: string, fields: Record<string, string>): Promise<Response> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: assertion,
      redirect_uri: REDIRECT_URI,
      ...fields,
    });
    return fetch(`${idp.issuer}/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });
  }

  async function tokenRequest(fields: Record<string, string>): Promise<Response> {
    return tokenRequestWithAssertion(await clientAssertion(privateKey, `${idp.issuer}/token`), fields);
  }

  it('/token refuses a client_assertion addressed to the issuer, as Reflexify Identity does', async () => {
    const { code, verifier } = await authorize();
    const res = await tokenRequestWithAssertion(await clientAssertion(privateKey, idp.issuer), {
      code,
      code_verifier: verifier,
      resource: RESOURCE,
    });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('invalid_client');
    expect(body.access_token).toBeUndefined();
  });

  it('discovery advertises what openid-client v6 requires', async () => {
    const res = await fetch(`${idp.issuer}/.well-known/openid-configuration`);
    expect(res.status).toBe(200);
    const doc = await res.json();
    expect(doc.authorization_endpoint).toBe(`${idp.issuer}/authorize`);
    expect(doc.token_endpoint).toBe(`${idp.issuer}/token`);
    expect(doc.jwks_uri).toBe(`${idp.issuer}/jwks.json`);
    expect(doc.end_session_endpoint).toBe(`${idp.issuer}/end_session`);
    expect(doc.revocation_endpoint).toBe(`${idp.issuer}/revoke`);
    expect(doc.authorization_response_iss_parameter_supported).toBe(true);
  });

  it('/authorize redirects to redirect_uri carrying code, state and iss', async () => {
    const { code, state } = await authorize();
    expect(code).toBeTruthy();
    expect(state).toBeTruthy();
  });

  it('/authorize response includes iss alongside code and state', async () => {
    const url = new URL(`${idp.issuer}/authorize`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', CLIENT_ID);
    url.searchParams.set('redirect_uri', REDIRECT_URI);
    url.searchParams.set('state', 'state-check');
    url.searchParams.set('code_challenge', 'x'.repeat(43));
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('resource', RESOURCE);
    url.searchParams.set('nonce', 'nonce-check');

    const res = await fetch(url, { redirect: 'manual' });
    expect(res.status).toBe(302);
    const location = new URL(res.headers.get('location')!);
    expect(location.origin + location.pathname).toBe(REDIRECT_URI);
    expect(location.searchParams.get('code')).toBeTruthy();
    expect(location.searchParams.get('state')).toBe('state-check');
    expect(location.searchParams.get('iss')).toBe(idp.issuer);
  });

  it('/token refuses a wrong code_verifier with 400 invalid_grant', async () => {
    const { code } = await authorize();
    const res = await tokenRequest({ code, code_verifier: 'not-the-verifier-that-was-used-at-all-here', resource: RESOURCE });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('invalid_grant');
  });

  it('/token refuses a wrong resource with 400 invalid_target', async () => {
    const { code, verifier } = await authorize();
    const res = await tokenRequest({ code, code_verifier: verifier, resource: 'https://wrong.example/api' });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('invalid_target');
  });

  it('/token refuses a client_assertion signed by a different key, issuing no tokens', async () => {
    const other = await generateKeyPair('RS256', { extractable: true, modulusLength: 2048 });
    const now = Math.floor(Date.now() / 1000);
    const wrongKeyAssertion = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer(CLIENT_ID)
      .setSubject(CLIENT_ID)
      .setAudience(`${idp.issuer}/token`)
      .setIssuedAt(now)
      .setExpirationTime(now + 60)
      .setJti(randomUUID())
      .sign(other.privateKey);

    const { code, verifier } = await authorize();
    const res = await tokenRequestWithAssertion(wrongKeyAssertion, { code, code_verifier: verifier, resource: RESOURCE });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('invalid_client');
    expect(body.access_token).toBeUndefined();
  });

  it('/token refuses an unsigned, alg:none or malformed client_assertion, issuing no tokens', async () => {
    const { code: code1, verifier: verifier1 } = await authorize();
    const malformed = await tokenRequestWithAssertion('not-a-jwt-at-all', {
      code: code1,
      code_verifier: verifier1,
      resource: RESOURCE,
    });
    expect(malformed.status).toBe(400);
    const malformedBody = await malformed.json();
    expect(malformedBody.error).toBe('invalid_client');
    expect(malformedBody.access_token).toBeUndefined();

    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({ iss: CLIENT_ID, sub: CLIENT_ID, aud: `${idp.issuer}/token`, iat: now, exp: now + 60, jti: randomUUID() }),
    ).toString('base64url');
    const unsignedAssertion = `${header}.${payload}.`;

    const { code: code2, verifier: verifier2 } = await authorize();
    const res = await tokenRequestWithAssertion(unsignedAssertion, {
      code: code2,
      code_verifier: verifier2,
      resource: RESOURCE,
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('invalid_client');
    expect(body.access_token).toBeUndefined();
  });

  it('/token refuses a client_assertion whose iss/sub is not the clientId, issuing no tokens', async () => {
    const now = Math.floor(Date.now() / 1000);
    const wrongSubjectAssertion = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer('someone-else')
      .setSubject('someone-else')
      .setAudience(`${idp.issuer}/token`)
      .setIssuedAt(now)
      .setExpirationTime(now + 60)
      .setJti(randomUUID())
      .sign(privateKey);

    const { code, verifier } = await authorize();
    const res = await tokenRequestWithAssertion(wrongSubjectAssertion, { code, code_verifier: verifier, resource: RESOURCE });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('invalid_client');
    expect(body.access_token).toBeUndefined();
  });

  it('/token refuses a mismatched redirect_uri without burning the code', async () => {
    const { code, verifier } = await authorize();

    const wrong = await tokenRequest({
      code,
      code_verifier: verifier,
      resource: RESOURCE,
      redirect_uri: 'https://app.test/agentflow/auth/somewhere-else',
    });
    expect(wrong.status).toBe(400);
    expect((await wrong.json()).error).toBe('invalid_grant');

    // Proves the code was not burned by the failed attempt: the same code, redeemed with the
    // redirect_uri that was actually used at /authorize, still succeeds exactly once.
    const ok = await tokenRequest({ code, code_verifier: verifier, resource: RESOURCE });
    expect(ok.status).toBe(200);

    const replay = await tokenRequest({ code, code_verifier: verifier, resource: RESOURCE });
    expect(replay.status).toBe(400);
    expect((await replay.json()).error).toBe('invalid_grant');
  });

  it('a redeemed code cannot be replayed', async () => {
    const { code, verifier } = await authorize();
    const first = await tokenRequest({ code, code_verifier: verifier, resource: RESOURCE });
    expect(first.status).toBe(200);

    const replay = await tokenRequest({ code, code_verifier: verifier, resource: RESOURCE });
    expect(replay.status).toBe(400);
    expect((await replay.json()).error).toBe('invalid_grant');
  });

  it('performs a real openid-client v6 sign-in round trip and issues tokens for this resource and client', async () => {
    const auth = client.PrivateKeyJwt(privateKey, {
      [client.modifyAssertion]: (_header, payload) => {
        payload.aud = `${idp.issuer}/token`;
      },
    });
    const config = await client.discovery(new URL(idp.issuer), CLIENT_ID, undefined, auth, {
      execute: [client.allowInsecureRequests],
    });

    const pkceCodeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(pkceCodeVerifier);
    const expectedState = client.randomState();
    const expectedNonce = client.randomNonce();

    const authorizationUrl = client.buildAuthorizationUrl(config, {
      redirect_uri: REDIRECT_URI,
      scope: 'openid offline_access',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: expectedState,
      nonce: expectedNonce,
      resource: RESOURCE,
    });

    const authRes = await fetch(authorizationUrl, { redirect: 'manual' });
    expect(authRes.status).toBe(302);
    const location = authRes.headers.get('location')!;

    const tokens = await client.authorizationCodeGrant(
      config,
      new URL(location),
      { pkceCodeVerifier, expectedState, expectedNonce, idTokenExpected: true },
      { resource: RESOURCE },
    );

    // oauth4webapi (which openid-client is built on) lowercases token_type per RFC 6749 §5.1
    // ("case insensitive"); the mock's own wire response still says 'Bearer'.
    expect(tokens.token_type).toBe('bearer');
    expect(tokens.access_token).toBeTruthy();
    expect(tokens.id_token).toBeTruthy();

    const accessClaims = decodeJwt(tokens.access_token) as Record<string, unknown>;
    expect(accessClaims.aud).toBe(RESOURCE);
    expect(accessClaims.azp).toBe(CLIENT_ID);
    expect(accessClaims.typ).toBe('user');
  });
});

describe('mock API', () => {
  let api: MockApi;

  beforeAll(async () => {
    api = await startMockApi();
  });

  afterAll(() => api.close());

  it('records GET /api/v1/caller and answers callerStatus', async () => {
    const ok = await fetch(`${api.baseUrl}/api/v1/caller`, { headers: { authorization: 'Bearer x' } });
    expect(ok.status).toBe(200);
    expect(api.requests.at(-1)).toMatchObject({ method: 'GET', path: '/api/v1/caller', authorization: 'Bearer x' });

    api.callerStatus = 403;
    api.callerType = 'APP_NOT_ASSIGNED';
    const refused = await fetch(`${api.baseUrl}/api/v1/caller`);
    expect(refused.status).toBe(403);
    const body = await refused.json();
    expect(body.type).toBe('APP_NOT_ASSIGNED');
    expect(api.requests.at(-1)).toMatchObject({ method: 'GET', path: '/api/v1/caller' });
  });
});
