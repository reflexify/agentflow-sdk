import { type Platform } from "./platform.js";
export declare function packageSigningMethods(files: Map<string, Buffer>): Set<string>;
export declare function signingWarnings(platform: Platform, files: Map<string, Buffer>): Promise<string[]>;
export declare function archiveSigningWarnings(platform: Platform, bytes: Buffer): Promise<string[]>;
export declare function sayArchiveSigningWarnings(platform: Platform, bytes: Buffer, say: (line: string) => void): Promise<string[]>;
//# sourceMappingURL=signing-check.d.ts.map