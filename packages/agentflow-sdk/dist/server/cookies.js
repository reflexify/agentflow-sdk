/** Reads one cookie value from a request's `Cookie` header; never matches on a name suffix. */
export function readCookie(req, name) {
    const header = req.headers.get('cookie');
    if (!header)
        return undefined;
    for (const part of header.split(';')) {
        const trimmed = part.trim();
        const eq = trimmed.indexOf('=');
        if (eq === -1)
            continue;
        if (trimmed.slice(0, eq) === name)
            return trimmed.slice(eq + 1);
    }
    return undefined;
}
/** Builds a `Set-Cookie` value; attribute order is fixed to match what browsers and tests expect. */
export function cookieHeader(name, value, opts) {
    const parts = [`${name}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax'];
    if (opts.secure)
        parts.push('Secure');
    parts.push(`Max-Age=${opts.maxAge}`);
    return parts.join('; ');
}
//# sourceMappingURL=cookies.js.map