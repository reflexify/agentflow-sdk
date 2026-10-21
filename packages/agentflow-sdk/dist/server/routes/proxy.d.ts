import type { SessionAccess } from '../access.js';
import type { ServerErrorHandler } from '../options.js';
import type { SessionStore } from '../sessions.js';
/**
 * True for a path carrying a `..` segment, an encoded dot, slash or backslash, a backslash, or an
 * empty segment. A WHATWG `Request` has already normalised some of these away; this check is for
 * the ones it keeps and for hosts that hand over a request URL nothing normalised.
 */
export declare function isUnsafeRawPath(rawPath: string): boolean;
export interface HandleProxyOptions {
    request: Request;
    basePath: string;
    /** Without a trailing slash: `resolveOptions` trims it. */
    apiBaseUrl: string;
    access: SessionAccess;
    sessions: SessionStore;
    sessionCookieName: string;
    secureCookies: boolean;
    fetch?: typeof fetch;
    onError?: ServerErrorHandler;
}
/** Forwards a published AgentFlow operation with the session's bearer token; refuses everything else. */
export declare function handleProxy(opts: HandleProxyOptions): Promise<Response>;
//# sourceMappingURL=proxy.d.ts.map