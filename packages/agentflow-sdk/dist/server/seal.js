import { fromBase64Url, toBase64Url } from '../base64url.js';
const KEY_BYTES = 32;
const IV_BYTES = 12;
async function importKey(key) {
    const raw = fromBase64Url(key);
    if (raw.byteLength !== KEY_BYTES) {
        throw new Error(`AgentFlow session key must decode to ${KEY_BYTES} bytes (base64url), got ${raw.byteLength}`);
    }
    return globalThis.crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
/** Encrypts `value` with AES-256-GCM under `key`; output is `base64url(iv[12] || ciphertext+tag)`. */
export async function seal(key, value) {
    const cryptoKey = await importKey(key);
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_BYTES));
    const plaintext = new TextEncoder().encode(JSON.stringify(value));
    const ciphertext = new Uint8Array(await globalThis.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, plaintext));
    const out = new Uint8Array(iv.byteLength + ciphertext.byteLength);
    out.set(iv, 0);
    out.set(ciphertext, iv.byteLength);
    return toBase64Url(out);
}
/** Reverses {@link seal}. Never throws — any tamper, wrong key or malformed input yields `undefined`. */
export async function unseal(key, sealed) {
    try {
        const cryptoKey = await importKey(key);
        const raw = fromBase64Url(sealed);
        if (raw.byteLength <= IV_BYTES)
            return undefined;
        const iv = raw.slice(0, IV_BYTES);
        const ciphertext = raw.slice(IV_BYTES);
        const plaintext = await globalThis.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ciphertext);
        return JSON.parse(new TextDecoder().decode(plaintext));
    }
    catch {
        return undefined;
    }
}
//# sourceMappingURL=seal.js.map