import * as client from 'openid-client';
import { isSessionId } from '../access.js';
import { cookieHeader, readCookie } from '../cookies.js';
import { problem } from '../problem.js';
import { reportError } from '../report.js';
import { isSameOrigin } from '../same-origin.js';
const ROUTE = 'auth/logout';
/**
 * Signs out: revokes the refresh token (best effort), deletes the session, clears the cookie, and
 * sends the browser to the provider's end-session endpoint (RP-Initiated Logout), or to
 * `afterSignIn` when there is none. An unreachable provider never keeps the session alive.
 */
export async function handleLogout(opts) {
    // Otherwise any site could sign the user out with an auto-submitting form.
    if (!isSameOrigin(opts.request)) {
        return problem(403, 'CROSS_SITE_REQUEST', 'Cross-site request refused');
    }
    let config;
    try {
        config = await opts.getConfig();
    }
    catch (err) {
        reportError(opts.onError, ROUTE, err);
    }
    const sessionId = readCookie(opts.request, opts.sessionCookieName);
    let idToken;
    if (sessionId && isSessionId(sessionId)) {
        const payload = await opts.access.load(sessionId);
        if (payload) {
            idToken = payload.idToken;
            if (config) {
                try {
                    await client.tokenRevocation(config, payload.refreshToken);
                }
                catch (err) {
                    reportError(opts.onError, ROUTE, err);
                }
            }
        }
        // Deleted even when the record could not be read, so a sealed value no key opens goes too.
        await opts.sessions.delete(sessionId);
    }
    let location = opts.afterSignIn;
    if (config?.serverMetadata().end_session_endpoint) {
        const params = {};
        if (idToken)
            params.id_token_hint = idToken;
        if (opts.postLogoutRedirectUri)
            params.post_logout_redirect_uri = opts.postLogoutRedirectUri;
        location = client.buildEndSessionUrl(config, params).href;
    }
    const headers = new Headers({ location, 'cache-control': 'no-store' });
    headers.append('set-cookie', cookieHeader(opts.sessionCookieName, '', { maxAge: 0, secure: opts.secureCookies }));
    return new Response(null, { status: 303, headers });
}
//# sourceMappingURL=logout.js.map