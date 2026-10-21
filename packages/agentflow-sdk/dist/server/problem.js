/** An `application/problem+json` answer carrying `{type, title, status}` — the same shape the
 * AgentFlow API uses, so a browser client handles the SDK's own refusals and upstream ones alike. */
export function problem(status, type, title, setCookies = [], extraHeaders = {}) {
    const headers = new Headers({ ...extraHeaders, 'content-type': 'application/problem+json' });
    for (const cookie of setCookies)
        headers.append('set-cookie', cookie);
    return new Response(JSON.stringify({ type, title, status }), { status, headers });
}
//# sourceMappingURL=problem.js.map