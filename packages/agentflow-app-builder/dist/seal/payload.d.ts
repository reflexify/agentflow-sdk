export declare function readPayloadDir(dir: string): Map<string, Buffer>;
export declare function parseJsonFile(path: string, bytes: Uint8Array): unknown;
export declare const PACKAGE_PART: {
    prefixRule: string;
    keyRule: string;
    prefixValid: (prefix: string) => boolean;
    keyValid: (key: string) => boolean;
};
export declare function checkPayload(files: Map<string, Buffer>): {
    id: string;
    version: string;
    fileName: string;
};
//# sourceMappingURL=payload.d.ts.map