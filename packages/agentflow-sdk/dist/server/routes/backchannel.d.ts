import type { JWTVerifyGetKey } from 'jose';
import type { OidcConfig } from '../oidc.js';
import type { ServerErrorHandler } from '../options.js';
import type { SessionStore } from '../sessions.js';
export interface HandleBackchannelLogoutOptions {
    request: Request;
    getConfig: () => Promise<OidcConfig>;
    /** The JWKS for a `jwks_uri`, cached by the caller so keys are not fetched per request. */
    jwksFor: (jwksUri: string) => JWTVerifyGetKey;
    clientId: string;
    sessions: SessionStore;
    onError?: ServerErrorHandler;
}
/**
 * OIDC Back-Channel Logout 1.0: the provider POSTs a signed logout token naming a `sid`, and every
 * session of that `sid` ends. Answers 200 when they have, 400 for anything else (§2.8) — never a
 * 500, since the caller is the provider, not a browser that could show one.
 */
export declare function handleBackchannelLogout(opts: HandleBackchannelLogoutOptions): Promise<Response>;
/** A `jwksFor` that keeps one remote key set per `jwks_uri`; jose refetches on an unknown `kid`. */
export declare function remoteJwksCache(): (jwksUri: string) => JWTVerifyGetKey;
//# sourceMappingURL=backchannel.d.ts.map