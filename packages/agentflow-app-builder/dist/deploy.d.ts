import { type Platform } from "./platform.js";
export declare const POLL_MS = 3000;
export declare const MAX_MISSES = 5;
export type Json = Record<string, unknown>;
export type Release = {
    package_id: string;
    version: string;
    digest: string;
    signer: string;
};
export type Deployment = {
    deployment_id: string;
    status: string;
    approve_url: string;
    body: Json;
};
export type WaitOptions = {
    sleep?: (ms: number, signal: AbortSignal) => Promise<void>;
    onInterrupt?: (listener: () => void) => () => void;
    progress: (line: string) => void;
    deadline?: number;
    now?: () => number;
};
export declare const SETTLED: ReadonlySet<string>;
export declare const statusWord: (status: string) => string;
export declare function progressLine(deployment: Deployment): string;
export declare function endedMessage(deployment: Deployment): string;
export declare function sealedFile(cwd: string, flag: string | undefined): string;
export declare function readSealed(file: string): Buffer;
export declare function releaseOf(platform: Platform, body: Json): Release;
export declare function deploymentOf(platform: Platform, body: Json): Deployment;
export declare function deploymentKey(digest: string, parameters: Json | undefined, decisions: Json | undefined, after: string | undefined): string;
export declare function createDeployment(platform: Platform, release: Release, parameters?: Json, decisions?: Json): Promise<Deployment>;
export declare function waitFor(platform: Platform, first: Deployment, options: WaitOptions): Promise<{
    deployment: Deployment;
    stopped: boolean;
    stalled: boolean;
}>;
//# sourceMappingURL=deploy.d.ts.map