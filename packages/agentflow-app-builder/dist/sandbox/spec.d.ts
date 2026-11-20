export type SandboxSpec = Record<string, unknown>;
type Problem = {
    field: string;
    message: string;
};
export declare const CONNECTION_KINDS: readonly ["resend", "loopback", "sandbox_erp"];
export declare const LOOPBACK_CHANNELS: readonly ["sms", "whatsapp", "slack", "teams", "voice", "webhook"];
export declare function checkSpec(spec: unknown): Problem | null;
export declare function requireValidSpec(spec: unknown): void;
export declare function readSpec(cwd: string): SandboxSpec;
export declare function serverSpec(spec: SandboxSpec): SandboxSpec;
export declare const LOOPBACK_MESSAGING = "loopback_messaging";
export declare function connectionKinds(spec: SandboxSpec): Map<string, string>;
export declare function secretEnvs(spec: SandboxSpec): {
    key: string;
    env: string;
}[];
export {};
//# sourceMappingURL=spec.d.ts.map