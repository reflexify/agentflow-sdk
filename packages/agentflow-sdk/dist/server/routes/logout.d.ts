import type { SessionAccess } from '../access.js';
import type { OidcConfig } from '../oidc.js';
import type { ServerErrorHandler } from '../options.js';
import type { SessionStore } from '../sessions.js';
export interface HandleLogoutOptions {
    request: Request;
    getConfig: () => Promise<OidcConfig>;
    access: SessionAccess;
    sessions: SessionStore;
    sessionCookieName: string;
    secureCookies: boolean;
    postLogoutRedirectUri?: string;
    afterSignIn: string;
    onError?: ServerErrorHandler;
}
/**
 * Signs out: revokes the refresh token (best effort), deletes the session, clears the cookie, and
 * sends the browser to the provider's end-session endpoint (RP-Initiated Logout), or to
 * `afterSignIn` when there is none. An unreachable provider never keeps the session alive.
 */
export declare function handleLogout(opts: HandleLogoutOptions): Promise<Response>;
//# sourceMappingURL=logout.d.ts.map