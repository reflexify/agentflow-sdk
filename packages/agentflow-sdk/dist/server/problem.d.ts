/** Every problem type the SDK answers with itself, as opposed to ones relayed from the API. */
export type SdkProblemType = 'NOT_SIGNED_IN' | 'NOT_PUBLISHED' | 'BAD_PATH' | 'CROSS_SITE_REQUEST' | 'SIGN_IN_EXPIRED' | 'IDP_UNAVAILABLE';
/** An `application/problem+json` answer carrying `{type, title, status}` — the same shape the
 * AgentFlow API uses, so a browser client handles the SDK's own refusals and upstream ones alike. */
export declare function problem(status: number, type: SdkProblemType, title: string, setCookies?: readonly string[], extraHeaders?: Record<string, string>): Response;
//# sourceMappingURL=problem.d.ts.map