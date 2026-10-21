import type { SessionStore } from './sessions.js';
/** Reports an error a route swallowed into a problem response or a refusal redirect, so a host
 * can log or alert on it instead of it silently becoming a generic `agentflow_error` code. May be
 * async; it is never awaited, so it cannot delay the response, and a synchronous throw or a
 * rejected promise from it is dropped rather than breaking the route or the host process. */
/** `summary` is `describeError(error)`: one line that is safe to log, where the error object is not. */
export type ServerErrorHandler = (error: unknown, context: {
    route: string;
    summary: string;
}) => void | Promise<void>;
export interface AgentFlowServerOptions {
    issuer: string;
    clientId: string;
    privateKey: CryptoKey;
    privateKeyId?: string;
    redirectUri: string;
    postLogoutRedirectUri?: string;
    apiBaseUrl: string;
    resource: string;
    orgHint?: string;
    sessions: SessionStore;
    sessionKey: string;
    basePath?: string;
    secureCookies?: boolean;
    afterSignIn?: string;
    sessionTtlSeconds?: number;
    allowInsecureRequests?: boolean;
    fetch?: typeof fetch;
    onError?: ServerErrorHandler;
}
export interface ResolvedAgentFlowServerOptions extends AgentFlowServerOptions {
    basePath: string;
    secureCookies: boolean;
    afterSignIn: string;
    sessionTtlSeconds: number;
    loginCookieName: string;
    sessionCookieName: string;
}
/** Fills in every optional field's default, derives the two cookie names from `secureCookies`, and
 * trims trailing slashes from `apiBaseUrl` so every route can append `/{path}` to it. */
export declare function resolveOptions(options: AgentFlowServerOptions): ResolvedAgentFlowServerOptions;
//# sourceMappingURL=options.d.ts.map