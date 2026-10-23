import type { components } from '../../generated/public.js';
import type { OidcConfig } from '../oidc.js';
import type { ServerErrorHandler } from '../options.js';
import type { SessionStore } from '../sessions.js';
/**
 * What `GET {apiBaseUrl}/caller` answers on success. Adds `email`, `org_name` and `app` beyond
 * the OpenAPI `Caller` schema — a deliberate deviation, corrected in the published contract later.
 */
export interface Caller {
    kind: string;
    id: string;
    display_name: string;
    org_id: string;
    email: string;
    org_name: string | null;
    permissions: string[];
    app: components['schemas']['CallerApp'] | null;
}
/** What gets sealed into the session store. Tokens never reach the browser unsealed. */
export interface SessionPayload {
    accessToken: string;
    accessExpiresAt: number;
    refreshToken: string;
    idToken: string;
    caller: Caller;
}
export interface HandleCallbackOptions {
    request: Request;
    config: OidcConfig;
    redirectUri: string;
    /** Without a trailing slash: `resolveOptions` trims it. */
    apiBaseUrl: string;
    resource: string;
    afterSignIn: string;
    sessions: SessionStore;
    sessionKey: string;
    loginCookieName: string;
    sessionCookieName: string;
    secureCookies: boolean;
    sessionTtlSeconds: number;
    fetch?: typeof fetch;
    onError?: ServerErrorHandler;
}
export declare function handleCallback(opts: HandleCallbackOptions): Promise<Response>;
//# sourceMappingURL=callback.d.ts.map