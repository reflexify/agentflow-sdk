import { type AgentFlowClient } from '../client.js';
import type { RequestFetch } from '../fetch.js';
export type SignInPage = {
    request: {
        post(url: string, options: {
            data: unknown;
        }): Promise<{
            status(): number;
        }>;
    };
};
export declare function as(handle: string, options?: {
    dir?: string;
    fetch?: RequestFetch;
}): AgentFlowClient;
export declare function signInAs(page: SignInPage, handle: string, options?: {
    dir?: string;
}): Promise<void>;
export declare function idsByKey(options?: {
    dir?: string;
}): Record<string, string>;
//# sourceMappingURL=sign-in.d.ts.map