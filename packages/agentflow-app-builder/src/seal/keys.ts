import { createPrivateKey, generateKeyPairSync, type KeyObject } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { CliError } from "../errors.js";

export type SigningKey = { keyId: string; privateKey: KeyObject };

const PKCS8_ED25519_PREFIX = Buffer.from("302e020100300506032b657004220420", "hex");

export function checkKeyId(keyId: string): void {
  if (keyId === "" || /[\s\p{Cc}]/u.test(keyId)) {
    throw new CliError("KEY_ID_INVALID", "a key id is a non-empty name without whitespace or control characters");
  }
}

const PUBLISHABLE_KEY_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

function checkPublishableKeyId(keyId: string): void {
  checkKeyId(keyId);
  if (!PUBLISHABLE_KEY_ID.test(keyId)) {
    throw new CliError(
      "KEY_ID_INVALID",
      "a key id uses letters, digits, '.', '_' and '-' only, at most 64 characters, and starts with a letter or digit",
    );
  }
}

export function keyFromSeed(keyId: string, seed: Uint8Array): SigningKey {
  checkKeyId(keyId);
  if (seed.length !== 32) throw new CliError("KEY_INVALID", "an ed25519 seed is 32 bytes");
  const der = Buffer.concat([PKCS8_ED25519_PREFIX, seed]);
  return { keyId, privateKey: createPrivateKey({ key: der, format: "der", type: "pkcs8" }) };
}

export function keygen(keyId: string, out: string): { file: string; keyId: string } {
  checkPublishableKeyId(keyId);
  const { privateKey } = generateKeyPairSync("ed25519");
  const pem = privateKey.export({ type: "pkcs8", format: "pem" });
  mkdirSync(dirname(out), { recursive: true });
  try {
    writeFileSync(out, pem, { mode: 0o600, flag: "wx" });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new CliError("KEY_EXISTS", `${out} already exists; keygen never overwrites a key`, [out]);
    }
    throw error;
  }
  return { file: out, keyId };
}

function parseEd25519(pem: string): KeyObject | undefined {
  try {
    const key = createPrivateKey(pem);
    return key.asymmetricKeyType === "ed25519" ? key : undefined;
  } catch {
    return undefined;
  }
}

export function readKeyFile(file: string, keyId: string): SigningKey {
  checkKeyId(keyId);
  let mode: number;
  let pem: string;
  try {
    mode = statSync(file).mode;
    if (process.platform !== "win32" && (mode & 0o077) !== 0) {
      throw new CliError(
        "KEY_PERMISSIONS",
        `${file} can be read by other users (mode ${(mode & 0o777).toString(8)}); run: chmod 600 ${file}`,
        [file],
      );
    }
    pem = readFileSync(file, "utf8");
  } catch (error) {
    if (error instanceof CliError) throw error;
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new CliError("KEY_MISSING", `no key file at ${file}`, [file]);
    }
    throw error;
  }
  const privateKey = parseEd25519(pem);
  if (!privateKey) throw new CliError("KEY_INVALID", `${file} is not an ed25519 private key in PKCS#8 PEM`, [file]);
  return { keyId, privateKey };
}

export function findKey(keysDir: string): string {
  let names: string[];
  try {
    names = readdirSync(keysDir).filter((name) => name.endsWith(".pem")).sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT" && (error as NodeJS.ErrnoException).code !== "ENOTDIR") {
      throw error;
    }
    names = [];
  }
  const found: string[] = [];
  for (const name of names) {
    const file = join(keysDir, name);
    try {
      if (parseEd25519(readFileSync(file, "utf8"))) found.push(file);
    } catch {
      continue;
    }
  }
  if (found.length === 0) {
    throw new CliError("KEY_MISSING", `no ed25519 key in ${keysDir}; run keygen, or pass --key <file>`, [keysDir]);
  }
  if (found.length > 1) {
    throw new CliError("KEY_AMBIGUOUS", `more than one ed25519 key in ${keysDir}: ${found.join(", ")}; pass --key <file>`, found);
  }
  return found[0]!;
}
