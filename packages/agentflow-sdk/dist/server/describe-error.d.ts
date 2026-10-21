/**
 * One line that is safe to log for any error the SDK reports or throws: the error's name and
 * message with control characters escaped, then in brackets up to two codes — the provider's OAuth
 * `error` where there is one, else the error's `code` — from the error and from its direct cause.
 *
 * Never the error object itself, nor its cause's: a failed token-response check carries the whole
 * token response (access, refresh and ID tokens) as `cause.body`, and printing an error prints its
 * cause. Only codes are read, one level down, which is where the SDK keeps the provider's answer to
 * a failed refresh.
 */
export declare function describeError(error: unknown): string;
//# sourceMappingURL=describe-error.d.ts.map