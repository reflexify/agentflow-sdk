import { SealError } from "./errors.js";
import { isRecord, type Platform } from "./platform.js";
import { readZip } from "./seal/zip.js";
import { signingMethodsIn } from "./workflow.js";

const WORKFLOW = /^objects\/workflow\/[^/]+\.json$/;

// Every signing method the package's workflows use.
export function packageSigningMethods(files: Map<string, Buffer>): Set<string> {
  const methods = new Set<string>();
  for (const [file, bytes] of files) {
    if (!WORKFLOW.test(file)) continue;
    let workflow: unknown;
    try {
      workflow = JSON.parse(bytes.toString("utf8"));
    } catch {
      continue;
    }
    for (const method of signingMethodsIn(isRecord(workflow) ? workflow.nodes : undefined)) methods.add(method);
  }
  return methods;
}

// What the target deployment will refuse of the package's signing steps, as warning lines. A deployment that does not
// list its methods is older than the list and refuses nothing here, so it is not warned about.
export async function signingWarnings(platform: Platform, files: Map<string, Buffer>): Promise<string[]> {
  return warningsFor(platform, packageSigningMethods(files));
}

async function warningsFor(platform: Platform, used: Set<string>): Promise<string[]> {
  if (used.size === 0) return [];
  const { body } = await platform.get("/platform");
  const esign = isRecord(body.esign) ? body.esign : undefined;
  const offered = esign?.methods;
  if (!Array.isArray(offered)) return [];
  const names = offered.filter((m): m is string => typeof m === "string");
  if (names.length === 0) {
    return ["warning: this package signs, but the deployment does not offer signing (its eSign service is not configured), so its setup will refuse to install the package"];
  }
  return [...used]
    .filter((method) => !names.includes(method))
    .sort((a, b) => (a === "server_email" ? -1 : b === "server_email" ? 1 : a < b ? -1 : a > b ? 1 : 0))
    .map(
      (method) =>
        `warning: this package signs with ${method}, which the deployment does not offer (it offers ${names.join(", ")}), so its setup will refuse to install the package`,
    );
}

// The warnings for a sealed archive's bytes. An archive that cannot be read, or whose workflows nest too deep to walk,
// gets none: the warning is advice, and AgentFlow refuses a bad archive on upload with its own code.
export async function archiveSigningWarnings(platform: Platform, bytes: Buffer): Promise<string[]> {
  let used: Set<string>;
  try {
    used = packageSigningMethods(readZip(bytes));
  } catch (error) {
    if (error instanceof SealError || error instanceof RangeError) return [];
    throw error;
  }
  return warningsFor(platform, used);
}

// Writes a sealed archive's warnings to `say` and returns them.
export async function sayArchiveSigningWarnings(platform: Platform, bytes: Buffer, say: (line: string) => void): Promise<string[]> {
  const warnings = await archiveSigningWarnings(platform, bytes);
  for (const line of warnings) say(line);
  return warnings;
}
