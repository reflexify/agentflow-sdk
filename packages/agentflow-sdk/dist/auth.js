/** Delegates auth to same-origin cookies via the SDK's own server proxy; adds no headers. */
export function proxyAdapter() {
    return {
        async headers() {
            return {};
        },
        credentials: 'same-origin',
    };
}
/** Sends a bearer token obtained fresh (or from cache) on every request. */
export function bearerAdapter(getToken) {
    return {
        async headers() {
            return { authorization: `Bearer ${await getToken()}` };
        },
    };
}
//# sourceMappingURL=auth.js.map