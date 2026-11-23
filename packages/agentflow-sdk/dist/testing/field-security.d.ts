import type { AgentFlowClient } from '../client.js';
import type { RequestFetch } from '../fetch.js';
export type FieldHolder = {
    group: string;
} | {
    person: string;
} | {
    principal: string;
} | {
    agent: string;
};
type Options = {
    dir?: string;
    fetch?: RequestFetch;
};
export declare function grantFieldProfile(profile: string, holder: FieldHolder, options?: Options): Promise<void>;
export declare function revokeFieldProfile(profile: string, holder: FieldHolder, options?: Options): Promise<void>;
export declare function secureField(field: string, options?: Options): Promise<void>;
export declare function unsecureField(field: string, options?: Options): Promise<void>;
export declare function expectFieldHidden(client: AgentFlowClient, field: string, recordId: string, options?: Options): Promise<void>;
export {};
//# sourceMappingURL=field-security.d.ts.map