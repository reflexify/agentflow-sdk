import type { SessionAccess } from '../access.js';
export interface HandleSessionOptions {
    request: Request;
    access: SessionAccess;
    sessionCookieName: string;
    secureCookies: boolean;
}
/** `{signedIn: true, caller}` or `{signedIn: false}` — never a token. A session cookie that names
 * no live session is cleared, so the browser stops sending it. */
export declare function handleSession(opts: HandleSessionOptions): Promise<Response>;
//# sourceMappingURL=session.d.ts.map