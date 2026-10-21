import type { AgentFlowClient } from '../client.js';
import type { AgentFlowServerOptions } from './options.js';
export { IdpUnavailable, NotSignedIn } from './access.js';
export { describeError } from './describe-error.js';
export type { Caller } from './routes/callback.js';
export type { AgentFlowServerOptions, ServerErrorHandler } from './options.js';
export type { SdkProblemType } from './problem.js';
export { MemorySessionStore } from './sessions.js';
export type { SessionRecord, SessionStore } from './sessions.js';
export interface AgentFlowServer {
    handle(request: Request): Promise<Response | undefined>;
    clientFor(request: Request): Promise<AgentFlowClient | undefined>;
}
export declare function createAgentFlowServer(options: AgentFlowServerOptions): AgentFlowServer;
//# sourceMappingURL=index.d.ts.map