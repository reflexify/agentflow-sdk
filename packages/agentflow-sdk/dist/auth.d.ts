export interface AuthAdapter {
    headers(): Promise<Record<string, string>>;
    credentials?: RequestCredentials;
}
/** Delegates auth to same-origin cookies via the SDK's own server proxy; adds no headers. */
export declare function proxyAdapter(): AuthAdapter;
/** Sends a bearer token obtained fresh (or from cache) on every request. */
export declare function bearerAdapter(getToken: () => Promise<string>): AuthAdapter;
//# sourceMappingURL=auth.d.ts.map