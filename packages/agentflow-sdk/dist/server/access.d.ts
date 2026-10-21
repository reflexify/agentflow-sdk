import type { OidcConfig } from './oidc.js';
import type { SessionStore } from './sessions.js';
import type { SessionPayload } from './routes/callback.js';
export declare function isSessionId(value: string): boolean;
/** When an access token issued now with this `expires_in` expires, in epoch milliseconds. */
export declare function accessExpiresAt(expiresIn: number | undefined): number;
/** The session is gone, expired, unreadable, or the provider refused its refresh token
 * (`invalid_grant`). `cause` is set only when that refusal ended it. */
export declare class NotSignedIn extends Error {
    constructor(message: string, options?: ErrorOptions);
}
/** The identity provider could not refresh the session — unreachable, timed out, a 5xx, a 429,
 * an OAuth error other than `invalid_grant` (a misconfigured client's `invalid_client`), or
 * discovery failing. The session is kept, so a later attempt can succeed. */
export declare class IdpUnavailable extends Error {
    constructor(message: string, options?: ErrorOptions);
}
export interface SessionAccessOptions {
    sessions: SessionStore;
    sessionKey: string;
    resource: string;
    getConfig: () => Promise<OidcConfig>;
}
export interface SessionAccess {
    /** The unsealed session, or `undefined` when the id names no live, readable session. An expired
     * record is deleted. */
    load(sessionId: string): Promise<SessionPayload | undefined>;
    /** The session's access token, refreshed first when under 60 s of its life remain; concurrent
     * callers for one session share one refresh. Throws {@link NotSignedIn} when there is no session
     * or the provider refuses the refresh token (the session is then deleted), and
     * {@link IdpUnavailable} when the refresh fails any other way (the session is kept). A store
     * failure propagates as is. */
    accessTokenFor(sessionId: string): Promise<string>;
}
export declare function sessionAccess(opts: SessionAccessOptions): SessionAccess;
/** The provider has decided about this refresh token: `invalid_grant` (RFC 6749 §5.2). Any other
 * error — `invalid_client`, a 429, a 5xx — says nothing about the session, only that refreshing
 * failed this time. */
export declare function isRefusal(err: unknown): boolean;
//# sourceMappingURL=access.d.ts.map