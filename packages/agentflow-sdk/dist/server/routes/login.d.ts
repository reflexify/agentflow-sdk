import type { OidcConfig } from '../oidc.js';
/** What the login cookie seals; the callback (unsealing it) reads exactly this shape. */
export interface LoginCookiePayload {
    state: string;
    nonce: string;
    codeVerifier: string;
    returnTo: string;
    exp: number;
}
export interface HandleLoginOptions {
    request: Request;
    config: OidcConfig;
    redirectUri: string;
    resource: string;
    orgHint?: string;
    afterSignIn: string;
    sessionKey: string;
    loginCookieName: string;
    secureCookies: boolean;
}
export declare function handleLogin(opts: HandleLoginOptions): Promise<Response>;
/**
 * A same-origin relative path only. Refuses `//` (protocol-relative), a backslash (some browsers
 * treat it as `/`, defeating the leading-slash check), a character a `Location` header cannot carry,
 * and anything an absolute URL would parse to a different origin than a fixed, arbitrary base.
 *
 * The caller keeps the value exactly as given: the parsed `pathname` is only for the check, since
 * normalising `/.//evil.test` yields `//evil.test`, which a browser reads as another host.
 */
export declare function isSafeReturnTo(value: unknown): value is string;
//# sourceMappingURL=login.d.ts.map