import { type Handler } from "./command.js";
import { type Problem } from "./deploy.js";
import { Platform } from "./platform.js";
import { type SandboxState } from "./sandbox/state.js";
export type StatusDeployment = {
    deployment_id: string;
    version: string;
    status: string;
    problem: Problem | null;
    approve_url: string;
    installation_id: string | null;
    created_at: string;
    plan_findings?: unknown[];
};
export type SandboxStatus = {
    id: string;
    state: "live" | "gone" | "elsewhere" | "unknown";
    expires_at: string;
};
export type StatusReport = {
    package_id: string;
    version: string;
    deployments: StatusDeployment[];
    sandbox: SandboxStatus | null;
};
export declare function status(platform: Platform, release: {
    id: string;
    version: string;
}, sandbox: SandboxState | null): Promise<StatusReport>;
export declare const statusCommand: Handler;
//# sourceMappingURL=status.d.ts.map