/** Reads one cookie value from a request's `Cookie` header; never matches on a name suffix. */
export declare function readCookie(req: Request, name: string): string | undefined;
/** Builds a `Set-Cookie` value; attribute order is fixed to match what browsers and tests expect. */
export declare function cookieHeader(name: string, value: string, opts: {
    maxAge: number;
    secure: boolean;
}): string;
//# sourceMappingURL=cookies.d.ts.map