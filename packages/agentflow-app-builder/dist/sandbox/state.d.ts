export type SandboxState = {
    version: 1;
    url: string;
    id: string;
    name: string;
    created_at: string;
    expires_at: string;
    deploy_key: string;
    owner: string;
    people: Record<string, {
        user_id: string;
        token: string;
    }>;
    ids: {
        groups: Record<string, string>;
        units: Record<string, string>;
        principals: Record<string, string>;
        connections: Record<string, string>;
    };
    install: {
        parameters: Record<string, unknown>;
        decisions: unknown;
    };
    installation: null | {
        id: string;
        deployment_id: string;
        package_id: string;
        version: string;
        armed: string[];
        objects: Record<string, string>;
        parameters: Record<string, unknown>;
    };
};
export declare const STATE_FILE = ".agentflow/sandbox.json";
export declare function refuseTracked(cwd: string): void;
export declare function readState(cwd: string): SandboxState | null;
export declare function requireState(cwd: string): SandboxState;
export declare function ignoreFolder(cwd: string): void;
export declare const tempPathFor: (file: string) => string;
export declare function writeState(cwd: string, state: SandboxState): void;
export declare function removeState(cwd: string): void;
export declare function stateFromCreated(url: string, created: Record<string, unknown>): SandboxState;
//# sourceMappingURL=state.d.ts.map