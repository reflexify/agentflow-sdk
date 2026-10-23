export type SandboxFile = {
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
        decisions: Record<string, unknown>;
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
export declare function readSandbox(dir?: string): SandboxFile;
//# sourceMappingURL=sandbox-file.d.ts.map