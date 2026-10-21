import { isSessionId } from '../access.js';
import { cookieHeader, readCookie } from '../cookies.js';
/** `{signedIn: true, caller}` or `{signedIn: false}` — never a token. A session cookie that names
 * no live session is cleared, so the browser stops sending it. */
export async function handleSession(opts) {
    const sessionId = readCookie(opts.request, opts.sessionCookieName);
    const payload = sessionId && isSessionId(sessionId) ? await opts.access.load(sessionId) : undefined;
    const headers = new Headers({ 'content-type': 'application/json', 'cache-control': 'no-store' });
    if (payload) {
        return new Response(JSON.stringify({ signedIn: true, caller: payload.caller }), { headers });
    }
    if (sessionId) {
        headers.append('set-cookie', cookieHeader(opts.sessionCookieName, '', { maxAge: 0, secure: opts.secureCookies }));
    }
    return new Response(JSON.stringify({ signedIn: false }), { headers });
}
//# sourceMappingURL=session.js.map