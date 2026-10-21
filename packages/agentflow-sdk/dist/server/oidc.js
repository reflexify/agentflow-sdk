import * as client from 'openid-client';
/**
 * `private_key_jwt` with the assertion addressed to the token endpoint, as OIDC Core §9 says it
 * should be. openid-client addresses it to the issuer, which RFC 7523 also allows but Reflexify
 * Identity refuses with `invalid_client`. The same assertion also authenticates revocation.
 */
function tokenEndpointPrivateKeyJwt(key) {
    return (as, metadata, body, headers) => client.PrivateKeyJwt(key, {
        [client.modifyAssertion]: (_header, payload) => {
            if (as.token_endpoint)
                payload.aud = as.token_endpoint;
        },
    })(as, metadata, body, headers);
}
/**
 * Wraps `client.discovery` so it runs at most once per server instance, and only on first use —
 * never at `createAgentFlowServer` time, which would make every server construction do network I/O.
 */
export function lazyOidcConfig(opts) {
    let discovered;
    return () => {
        if (!discovered) {
            const key = opts.privateKeyId ? { key: opts.privateKey, kid: opts.privateKeyId } : opts.privateKey;
            // A rejected discovery must not stick: clear the cache before rethrowing so the next call
            // retries instead of replaying the same rejected promise until the process restarts.
            // Concurrent callers made while this attempt is still in flight all share it (single-flight);
            // only a call made *after* it has settled triggers a fresh `discovery`.
            discovered = client
                .discovery(new URL(opts.issuer), opts.clientId, undefined, tokenEndpointPrivateKeyJwt(key), {
                execute: opts.allowInsecureRequests ? [client.allowInsecureRequests] : [],
            })
                .catch((err) => {
                discovered = undefined;
                throw err;
            });
        }
        return discovered;
    };
}
/** Builds the `/authorize` redirect: PKCE S256, offline access, and an RFC 8707 resource indicator. */
export function loginUrl(config, params) {
    return client.buildAuthorizationUrl(config, {
        redirect_uri: params.redirectUri,
        scope: 'openid offline_access',
        code_challenge: params.codeChallenge,
        code_challenge_method: 'S256',
        state: params.state,
        nonce: params.nonce,
        resource: params.resource,
        ...(params.orgHint ? { org_hint: params.orgHint } : {}),
    });
}
//# sourceMappingURL=oidc.js.map