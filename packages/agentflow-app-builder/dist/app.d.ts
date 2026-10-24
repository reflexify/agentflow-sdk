import { type BuildOptions, type Sections } from "./build.js";
export declare const APP_FILE = "agentflow.app.mjs";
export declare const DEFAULT_VITE_CONFIG = "vite.module.config.ts";
export interface AppDefinition {
    sections: Sections;
    entityOrder?: string[];
    exposedSteps?: Record<string, string[]>;
    ui?: {
        viteConfig: string;
    } | {
        prebuilt: string;
    };
}
export declare function defineApp(app: AppDefinition): AppDefinition;
export declare function loadApp(dir: string): Promise<{
    app: AppDefinition;
    options: BuildOptions;
    manifestDeclaresUi: boolean;
    warnings: string[];
}>;
export declare function buildApp(dir: string, opts?: {
    log?: (line: string) => void;
}): Promise<{
    files: number;
    ui: "built" | "copied" | "none";
    warnings: string[];
}>;
//# sourceMappingURL=app.d.ts.map