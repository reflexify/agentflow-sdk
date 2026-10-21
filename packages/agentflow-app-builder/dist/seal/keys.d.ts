import { type KeyObject } from "node:crypto";
export type SigningKey = {
    keyId: string;
    privateKey: KeyObject;
};
export declare function checkKeyId(keyId: string): void;
export declare function keyFromSeed(keyId: string, seed: Uint8Array): SigningKey;
export declare function keygen(keyId: string, out: string): {
    file: string;
    keyId: string;
};
export declare function readKeyFile(file: string, keyId: string): SigningKey;
export declare function findKey(keysDir: string): string;
//# sourceMappingURL=keys.d.ts.map