import { serve } from '@hono/node-server';
import type { HttpBindings, ServerType } from '@hono/node-server';
import { Hono } from 'hono';
import { SignJWT, calculateJwkThumbprint, exportJWK, generateKeyPair, importJWK, jwtVerify } from 'jose';
import type { JWK } from 'jose';

const CLIENT_ASSERTION_TYPE = 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer';
const BACKCHANNEL_LOGOUT_EVENT = 'http://schemas.openid.net/event/backchannel-logout';

export interface MockIdpUser {
  sub: string;
  tid: string;
  /** Optional so a test can mint tokens for a user an IdP forgot to set `sid` on. */
  sid?: string;
  email: string;
}

/** How an unavailable provider fails: a 500 with a plain-text body, a 500 with an OAuth
 * `server_error` body, or a connection closed without any answer. */
export type IdpOutage = 'http-500' | 'oauth-500' | 'drop';

/** An OAuth error answer (RFC 6749 §5.2) to give one refresh grant instead of tokens. */
export interface RefreshFailure {
  status: number;
  error: string;
  headers?: Record<string, string>;
}

export interface MockIdp {
  issuer: string;
  close(): Promise<void>;
  user: MockIdpUser;
  /** The next refresh grant with a valid refresh token gets this answer — `400 invalid_grant` by
   * default — and leaves the token valid. */
  failNextRefresh(answer?: RefreshFailure): void;
  refreshCount(): number;
  revoked: string[];
  /** While set, every endpoint (discovery and JWKS included) fails this way. */
  outage: IdpOutage | undefined;
  /** When true, token responses carry no `expires_in`. */
  omitExpiresIn: boolean;
  /** When false, discovery advertises no `end_session_endpoint`. Read on each discovery request. */
  endSessionSupported: boolean;
  /** Discovery's `id_token_signing_alg_values_supported`, omitted when `undefined`. Read on each
   * discovery request. The JWKS publishes an RS256 key and an RS512 key either way. */
  idTokenSigningAlgs: string[] | undefined;
  /** Holds every refresh grant arriving from now on — after `refreshCount()` has counted it — until
   * the returned function is called. */
  holdRefreshes(): () => void;
  /** Like {@link holdRefreshes}, for the next refresh grant only: later ones are answered at once. */
  holdNextRefresh(): () => void;
  /** Signs a back-channel logout token. `overrides` replaces claims (`undefined` removes one);
   * `header` adds to or replaces protected-header parameters, and `alg: 'RS512'` signs with the
   * RS512 key. */
  logoutToken(sid: string, overrides?: Record<string, unknown>, header?: Record<string, unknown>): Promise<string>;
  /** The form parameters of the most recent `/token` request, for asserting what the client sent. */
  lastTokenRequest(): URLSearchParams | undefined;
  /** The `refresh_token` from the most recently minted token set, for tying a later `/revoke` call
   * back to the exact grant a test drove — without the SDK ever handing that value to the test. */
  lastIssuedRefreshToken(): string | undefined;
}

interface StartMockIdpOptions {
  clientId: string;
  appPublicJwk: JWK;
  resource: string;
  user?: MockIdpUser;
}

interface AuthorizationCode {
  codeChallenge: string;
  nonce: string;
  resource: string;
  redirectUri: string;
}

function randomToken(): string {
  return Buffer.from(globalThis.crypto.getRandomValues(new Uint8Array(32))).toString('base64url');
}

async function pkceMatches(verifier: string, challenge: string): Promise<boolean> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return Buffer.from(digest).toString('base64url') === challenge;
}

function oauthError(status: number, error: string, error_description?: string): Response {
  return Response.json({ error, error_description }, { status });
}

/**
 * A mock OpenID Connect identity provider good enough for `openid-client` v6's own validations:
 * discovery, PKCE S256, `private_key_jwt` client authentication, RFC 8707 `resource`, refresh-token
 * rotation, revocation and RP-Initiated / back-channel logout.
 */
export async function startMockIdp(opts: StartMockIdpOptions): Promise<MockIdp> {
  const user: MockIdpUser = opts.user ?? {
    sub: 'user-1',
    tid: 'org-1',
    sid: 'sess-1',
    email: 'ann@example.test',
  };

  const { privateKey: idpPrivateKey, publicKey: idpPublicKey } = await generateKeyPair('RS256', {
    extractable: true,
    modulusLength: 2048,
  });
  const idpPublicJwk = await exportJWK(idpPublicKey);
  const kid = await calculateJwkThumbprint(idpPublicJwk);
  idpPublicJwk.alg = 'RS256';
  idpPublicJwk.use = 'sig';
  idpPublicJwk.kid = kid;

  // A published key for another algorithm, so a token signed with it verifies against the JWKS and
  // only an algorithm allow-list can refuse it.
  const rs512 = await generateKeyPair('RS512', { extractable: true, modulusLength: 2048 });
  const rs512PublicJwk = await exportJWK(rs512.publicKey);
  const rs512Kid = await calculateJwkThumbprint(rs512PublicJwk);
  rs512PublicJwk.alg = 'RS512';
  rs512PublicJwk.use = 'sig';
  rs512PublicJwk.kid = rs512Kid;

  const appPublicKey = await importJWK(opts.appPublicJwk, 'RS256');

  const codes = new Map<string, AuthorizationCode>();
  const validRefreshTokens = new Set<string>();
  const revoked: string[] = [];
  let refreshCounter = 0;
  let failNext: RefreshFailure | undefined;
  let lastTokenRequestParams: URLSearchParams | undefined;
  let lastIssuedRefreshToken: string | undefined;
  let refreshGate: Promise<void> | undefined;
  let nextRefreshGate: Promise<void> | undefined;

  // Assigned once the server has a port; route handlers close over `idp` and read it lazily,
  // so declaring it before `listen()` resolves is safe.
  let idp!: MockIdp;

  async function verifyClientAssertion(body: URLSearchParams): Promise<Response | undefined> {
    const assertion = body.get('client_assertion');
    if (body.get('client_assertion_type') !== CLIENT_ASSERTION_TYPE || !assertion) {
      return oauthError(400, 'invalid_client', 'missing client_assertion');
    }
    let payload;
    try {
      ({ payload } = await jwtVerify(assertion, appPublicKey, {
        issuer: opts.clientId,
        subject: opts.clientId,
        algorithms: ['RS256'],
      }));
    } catch {
      return oauthError(400, 'invalid_client', 'client assertion failed verification');
    }
    // Reflexify Identity takes only the token endpoint as the assertion's audience (OIDC Core §9),
    // refusing the issuer that RFC 7523 would also allow.
    const aud = payload.aud;
    const audience = Array.isArray(aud) ? aud : aud ? [aud] : [];
    if (!audience.includes(`${idp.issuer}/token`)) {
      return oauthError(401, 'invalid_client', 'aud mismatch (must contain token endpoint URL)');
    }
    return undefined;
  }

  async function mintTokens(nonce: string | undefined, resource: string): Promise<Response> {
    const now = Math.floor(Date.now() / 1000);
    const accessToken = await new SignJWT({
      aud: resource,
      azp: opts.clientId,
      sub: user.sub,
      tid: user.tid,
      sid: user.sid,
      typ: 'user',
    })
      .setProtectedHeader({ alg: 'RS256', kid })
      .setIssuer(idp.issuer)
      .setIssuedAt(now)
      .setExpirationTime(now + 600)
      .sign(idpPrivateKey);

    const refreshToken = randomToken();
    validRefreshTokens.add(refreshToken);
    lastIssuedRefreshToken = refreshToken;

    const body: Record<string, unknown> = {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
    };
    if (!idp.omitExpiresIn) body.expires_in = 600;

    if (nonce !== undefined) {
      body.id_token = await new SignJWT({ sub: user.sub, nonce, sid: user.sid })
        .setProtectedHeader({ alg: 'RS256', kid })
        .setIssuer(idp.issuer)
        .setAudience(opts.clientId)
        .setIssuedAt(now)
        .setExpirationTime(now + 600)
        .sign(idpPrivateKey);
    }

    return Response.json(body);
  }

  async function handleAuthorizationCodeGrant(body: URLSearchParams): Promise<Response> {
    const code = body.get('code');
    const entry = code ? codes.get(code) : undefined;
    if (!code || !entry) return oauthError(400, 'invalid_grant', 'unknown or already-redeemed code');

    const verifier = body.get('code_verifier') ?? '';
    if (!(await pkceMatches(verifier, entry.codeChallenge))) {
      return oauthError(400, 'invalid_grant', 'code_verifier does not match code_challenge');
    }
    if ((body.get('redirect_uri') ?? '') !== entry.redirectUri) {
      return oauthError(400, 'invalid_grant', 'redirect_uri does not match the authorization request');
    }
    const resource = body.get('resource') ?? '';
    if (resource !== opts.resource) {
      return oauthError(400, 'invalid_target', 'unknown resource');
    }

    // Single-use: only consumed once every check has passed, so a replay is `invalid_grant`
    // rather than a failed check silently burning a code a retry could still succeed with.
    codes.delete(code);
    return mintTokens(entry.nonce, resource);
  }

  async function handleRefreshTokenGrant(body: URLSearchParams): Promise<Response> {
    refreshCounter += 1;
    if (refreshGate) await refreshGate;
    if (nextRefreshGate) {
      const gate = nextRefreshGate;
      nextRefreshGate = undefined;
      await gate;
    }
    const token = body.get('refresh_token');
    if (!token || !validRefreshTokens.has(token)) {
      return oauthError(400, 'invalid_grant', 'unknown or already-rotated refresh token');
    }
    if (failNext) {
      const { status, error, headers } = failNext;
      failNext = undefined;
      return Response.json({ error, error_description: 'forced test failure' }, { status, headers });
    }
    const resource = body.get('resource') ?? '';
    if (resource !== opts.resource) {
      return oauthError(400, 'invalid_target', 'unknown resource');
    }
    validRefreshTokens.delete(token);
    return mintTokens(undefined, resource);
  }

  const app = new Hono<{ Bindings: HttpBindings }>();

  app.use('*', async (c, next) => {
    switch (idp.outage) {
      case undefined:
        return next();
      case 'http-500':
        return c.text('provider unavailable', 500);
      case 'oauth-500':
        return c.json({ error: 'server_error', error_description: 'forced test outage' }, 500);
      case 'drop':
        // Node drops writes to a destroyed socket, so the answer below never reaches the client.
        c.env.incoming.socket.destroy();
        return c.body(null, 500);
    }
  });

  app.get('/.well-known/openid-configuration', (c) =>
    c.json({
      issuer: idp.issuer,
      authorization_endpoint: `${idp.issuer}/authorize`,
      token_endpoint: `${idp.issuer}/token`,
      jwks_uri: `${idp.issuer}/jwks.json`,
      revocation_endpoint: `${idp.issuer}/revoke`,
      ...(idp.endSessionSupported ? { end_session_endpoint: `${idp.issuer}/end_session` } : {}),
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['private_key_jwt'],
      ...(idp.idTokenSigningAlgs ? { id_token_signing_alg_values_supported: idp.idTokenSigningAlgs } : {}),
      subject_types_supported: ['public'],
      scopes_supported: ['openid', 'offline_access'],
      authorization_response_iss_parameter_supported: true,
    }),
  );

  app.get('/jwks.json', (c) => c.json({ keys: [idpPublicJwk, rs512PublicJwk] }));

  app.get('/authorize', (c) => {
    const q = c.req.query();
    if (!q.redirect_uri) return c.text('missing redirect_uri', 400);

    const code = randomToken();
    codes.set(code, {
      codeChallenge: q.code_challenge ?? '',
      nonce: q.nonce ?? '',
      resource: q.resource ?? '',
      redirectUri: q.redirect_uri,
    });

    const to = new URL(q.redirect_uri);
    to.searchParams.set('code', code);
    if (q.state) to.searchParams.set('state', q.state);
    to.searchParams.set('iss', idp.issuer);
    return c.redirect(to.toString(), 302);
  });

  app.post('/token', async (c) => {
    const body = new URLSearchParams(await c.req.text());
    lastTokenRequestParams = body;

    const assertionError = await verifyClientAssertion(body);
    if (assertionError) return assertionError;

    switch (body.get('grant_type')) {
      case 'authorization_code':
        return handleAuthorizationCodeGrant(body);
      case 'refresh_token':
        return handleRefreshTokenGrant(body);
      default:
        return oauthError(400, 'unsupported_grant_type');
    }
  });

  app.post('/revoke', async (c) => {
    const body = new URLSearchParams(await c.req.text());
    const token = body.get('token');
    if (token) {
      revoked.push(token);
      validRefreshTokens.delete(token);
    }
    return c.body(null, 200);
  });

  app.on(['GET', 'POST'], '/end_session', (c) => c.text('signed out', 200));

  const server = await new Promise<ServerType>((resolve) => {
    const s = serve({ fetch: app.fetch, hostname: '127.0.0.1', port: 0 }, () => resolve(s));
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('mock identity provider failed to bind a TCP port');

  idp = {
    issuer: `http://127.0.0.1:${address.port}`,
    user,
    revoked,
    outage: undefined,
    omitExpiresIn: false,
    endSessionSupported: true,
    idTokenSigningAlgs: ['RS256'],
    failNextRefresh: (answer = { status: 400, error: 'invalid_grant' }) => {
      failNext = answer;
    },
    holdRefreshes: () => {
      let release!: () => void;
      refreshGate = new Promise<void>((resolve) => {
        release = resolve;
      });
      return () => {
        refreshGate = undefined;
        release();
      };
    },
    holdNextRefresh: () => {
      let release!: () => void;
      nextRefreshGate = new Promise<void>((resolve) => {
        release = resolve;
      });
      return release;
    },
    refreshCount: () => refreshCounter,
    lastTokenRequest: () => lastTokenRequestParams,
    lastIssuedRefreshToken: () => lastIssuedRefreshToken,
    async logoutToken(sid, overrides, header) {
      const now = Math.floor(Date.now() / 1000);
      const claims: Record<string, unknown> = {
        iss: idp.issuer,
        aud: opts.clientId,
        iat: now,
        exp: now + 120,
        jti: randomToken(),
        sid,
        events: { [BACKCHANNEL_LOGOUT_EVENT]: {} },
        ...overrides,
      };
      if (header?.alg === 'RS512') {
        return new SignJWT(claims).setProtectedHeader({ kid: rs512Kid, ...header, alg: 'RS512' }).sign(rs512.privateKey);
      }
      return new SignJWT(claims).setProtectedHeader({ alg: 'RS256', kid, ...header }).sign(idpPrivateKey);
    },
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };

  return idp;
}
