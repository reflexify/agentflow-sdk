import { type Handler, type Io, type Values } from "../command.js";
import { Platform } from "../platform.js";
import { type SandboxSpec } from "./spec.js";
import { type SandboxState } from "./state.js";
export declare const parentPlatform: (values: Values, io: Io) => Platform;
export declare function learn(io: Io, state: SandboxState): void;
export declare const defaultName: (cwd: string) => string;
export declare function readSecrets(spec: SandboxSpec, io: Io): Record<string, string>;
export declare function makeSandbox(platform: Platform, io: Io, request: Record<string, unknown>): Promise<SandboxState>;
export declare const sandboxCommand: Handler;
//# sourceMappingURL=commands.d.ts.map