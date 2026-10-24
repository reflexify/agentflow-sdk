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
export declare function idsByKey<K extends string = string>(options?: {
    dir?: string;
}): Record<K, string>;
//# sourceMappingURL=sign-in.d.ts.map