import type { SandboxSpec } from "./spec.js";
type Rec = Record<string, unknown>;
export interface Dependency {
    file: string;
    fileName: string;
    bytes: Buffer;
    id: string;
    version: string;
    manifest: Rec;
}
export declare function readDependencies(spec: SandboxSpec, cwd: string): Dependency[];
export {};
//# sourceMappingURL=dependencies.d.ts.map