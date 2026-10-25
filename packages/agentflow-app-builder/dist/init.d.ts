export declare const MIRROR_PACKAGES: Record<string, string>;
export declare function mirrorRef(packageName: string, version: string): string;
export declare const PROJECT_PNPM_WORKSPACE = "# The AgentFlow SDK's packages come from git and refer to each other by git\n# reference, which pnpm refuses below a direct dependency unless this is off.\nblockExoticSubdeps: false\nallowBuilds:\n  esbuild: true\n";
export interface InitOptions {
    prefix: string;
    key: string;
    keyFromFolder?: boolean;
    ui: boolean;
    site?: boolean;
    templateDir?: string;
    ref?: (packageName: string, version: string) => string;
}
export declare const DRAFT_PROJECT_FILES: string[];
export declare function draftProjectFiles(id: string, name: string, version: string, hasUi: boolean, templateDir?: string): Map<string, string>;
export declare function initProject(dir: string, opts: InitOptions): Promise<{
    dir: string;
    id: string;
}>;
//# sourceMappingURL=init.d.ts.map