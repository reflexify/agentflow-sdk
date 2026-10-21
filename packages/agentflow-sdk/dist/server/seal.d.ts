/** Encrypts `value` with AES-256-GCM under `key`; output is `base64url(iv[12] || ciphertext+tag)`. */
export declare function seal(key: string, value: unknown): Promise<string>;
/** Reverses {@link seal}. Never throws — any tamper, wrong key or malformed input yields `undefined`. */
export declare function unseal<T>(key: string, sealed: string): Promise<T | undefined>;
//# sourceMappingURL=seal.d.ts.map