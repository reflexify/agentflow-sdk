export declare const LIMITS: {
    entries: number;
    file: number;
    total: number;
    archive: number;
};
export declare function pathValid(path: string): boolean;
export declare function writeStoredZip(entries: ReadonlyArray<readonly [path: string, bytes: Uint8Array]>): Buffer;
export declare function readZip(bytes: Uint8Array, opts?: {
    skipFolders?: boolean;
}): Map<string, Buffer>;
//# sourceMappingURL=zip.d.ts.map