import * as client from 'openid-client';
export type OidcConfig = client.Configuration;
export interface LazyOidcConfigOptions {
    issuer: string;
    clientId: string;
    privateKey: CryptoKey;
    privateKeyId?: string;
    allowInsecureRequests?: boolean;
}
/**
 * Wraps `client.discovery` so it runs at most once per server instance, and only on first use —
 * never at `createAgentFlowServer` time, which would make every server construction do network I/O.
 */
export declare function lazyOidcConfig(opts: LazyOidcConfigOptions): () => Promise<OidcConfig>;
export interface LoginUrlParams {
    state: string;
    nonce: string;
    codeChallenge: string;
    redirectUri: string;
    resource: string;
    orgHint?: string;
}
/** Builds the `/authorize` redirect: PKCE S256, offline access, and an RFC 8707 resource indicator. */
export declare function loginUrl(config: OidcConfig, params: LoginUrlParams): URL;
//# sourceMappingURL=oidc.d.ts.map