export declare const MANIFEST_MEMBERS: string[];
export declare const OPTIONAL_MEMBERS: Set<string>;
export declare function checkUiMember(ui: unknown): void;
export declare function manifestSource(configDir: string): Record<string, unknown> & {
    parameters: {
        key: string;
        type: string;
    }[];
};
//# sourceMappingURL=manifest.d.ts.map