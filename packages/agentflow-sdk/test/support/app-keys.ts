import { exportJWK, generateKeyPair } from 'jose';
import type { JWK } from 'jose';

/** A fresh RS256 key pair for the app's `private_key_jwt` client authentication in tests. */
export async function appKeys(): Promise<{ privateKey: CryptoKey; publicJwk: JWK }> {
  const { privateKey, publicKey } = await generateKeyPair('RS256', { extractable: true, modulusLength: 2048 });
  const publicJwk = await exportJWK(publicKey);
  publicJwk.alg = 'RS256';
  publicJwk.use = 'sig';
  return { privateKey, publicJwk };
}
