import { CliError } from "./errors.js";
export declare const UI_EXTENSIONS: Set<string>;
export declare const MOUNT_EXPORT: RegExp;
export declare const isEmptyMount: (source: string) => boolean;
export declare function listFiles(dir: string): string[];
export declare function checkUi(dir: string): void;
export declare function uiBuildFailure(message: string): CliError;
export declare function buildUi(appDir: string, viteConfig: string, outDir: string): Promise<void>;
//# sourceMappingURL=ui.d.ts.map