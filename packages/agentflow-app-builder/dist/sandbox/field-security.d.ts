import { type Platform } from "../platform.js";
import { type FieldList, type FieldProfileSpec, type FieldSecuritySpec, type SandboxSpec } from "./spec.js";
import type { SandboxState } from "./state.js";
type Problem = {
    field: string;
    message: string;
};
export declare function fieldSecurityFindings(spec: SandboxSpec, cwd: string): {
    problem: Problem | null;
    warnings: string[];
};
export declare function requireFieldSecurityFits(spec: SandboxSpec, cwd: string): string[];
type Holder = {
    kind: "user" | "group" | "service_principal" | "agent";
    id: string;
};
export type ProfileOutcome = {
    name: string;
    id: string;
    outcome: "created" | "updated" | "unchanged";
};
export type FieldSecurityOutcome = {
    secured: string[];
    profiles: ProfileOutcome[];
};
export type FieldSecurityPlan = {
    secure: FieldList;
    profiles: {
        spec: FieldProfileSpec;
        holders: Holder[];
    }[];
};
export declare function planFieldSecurity(state: SandboxState, member: FieldSecuritySpec): FieldSecurityPlan;
export declare function applyFieldSecurity(owner: Platform, installation: {
    id: string;
    objects: Record<string, string>;
}, plan: FieldSecurityPlan): Promise<FieldSecurityOutcome>;
export declare function outcomeLine(outcome: FieldSecurityOutcome): string;
export {};
//# sourceMappingURL=field-security.d.ts.map