import type { SigningKey } from "./keys.js";
export type Sealed = {
    fileName: string;
    bytes: Buffer;
    digest: string;
    signer: string;
    id: string;
    version: string;
};
export declare function sign(files: Map<string, Buffer>, key: SigningKey): Sealed;
//# sourceMappingURL=seal.d.ts.map