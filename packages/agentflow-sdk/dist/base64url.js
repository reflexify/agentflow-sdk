// Base64url (RFC 4648 §5, unpadded) over `btoa`/`atob`: Web APIs that Node, Bun, Deno, Workers and
// edge runtimes all have, where Node's own byte helpers exist in Node alone.
/** Bytes per `String.fromCharCode` call: spreading a whole large array would overflow the stack. */
const CHUNK = 0x8000;
export function toBase64Url(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
/** Decodes base64url, padded or not; standard-alphabet `+` and `/` are accepted too. Throws on any
 * other character, or on a length no encoding produces. */
export function fromBase64Url(value) {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='));
    const out = new Uint8Array(new ArrayBuffer(binary.length));
    for (let i = 0; i < binary.length; i++)
        out[i] = binary.charCodeAt(i);
    return out;
}
//# sourceMappingURL=base64url.js.map