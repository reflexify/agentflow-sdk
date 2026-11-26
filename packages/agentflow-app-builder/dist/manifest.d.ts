export declare const MANIFEST_MEMBERS: string[];
export declare const OPTIONAL_MEMBERS: Set<string>;
export declare function checkUiMember(ui: unknown): void;
export declare const RUN_FOLLOW_PLATFORM = "2028.01";
export declare function uiContractWarnings(source: Record<string, unknown>): string[];
export declare function manifestSource(configDir: string): Record<string, unknown> & {
    parameters: {
        key: string;
        type: string;
        category?: string;
    }[];
};
//# sourceMappingURL=manifest.d.ts.map