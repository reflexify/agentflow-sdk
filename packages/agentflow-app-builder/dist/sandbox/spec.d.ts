export type SandboxSpec = Record<string, unknown>;
type Problem = {
    field: string;
    message: string;
};
declare const FIELD_ACCESS_LEVELS: readonly ["read", "read_write"];
export declare const CONNECTION_KINDS: readonly ["resend", "loopback", "sandbox_erp", "odoo", "chat"];
export declare const LOOPBACK_CHANNELS: readonly ["sms", "whatsapp", "slack", "teams", "voice", "webhook"];
export declare const EMAIL_KINDS: ReadonlySet<string>;
export type FieldList = {
    recommended: boolean;
    paths: string[];
};
export type FieldProfileSpec = {
    name: string;
    access: (typeof FIELD_ACCESS_LEVELS)[number];
    fields: FieldList;
    groups: string[];
    people: string[];
    principals: string[];
    agents: string[];
};
export type FieldSecuritySpec = {
    profiles: FieldProfileSpec[];
    secure: FieldList;
};
export declare function fieldSecurityProblem(spec: SandboxSpec): Problem | null;
export declare function fieldSecurityOf(spec: SandboxSpec): FieldSecuritySpec | undefined;
export declare function checkSpec(spec: unknown): Problem | null;
export declare function requireValidSpec(spec: unknown): void;
export declare function readSpec(cwd: string): SandboxSpec;
export declare function serverSpec(spec: SandboxSpec): SandboxSpec;
export declare const specDigest: (spec: SandboxSpec) => string;
export declare const LOOPBACK_MESSAGING = "loopback_messaging";
export declare function connectionKinds(spec: SandboxSpec): Map<string, string>;
export declare function secretEnvs(spec: SandboxSpec): {
    key: string;
    env: string;
}[];
export {};
//# sourceMappingURL=spec.d.ts.map