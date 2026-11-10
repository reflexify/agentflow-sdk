import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

// dist/starter is a gitignored copy of the case desk that `init` reads. It is refreshed here, once, before any test
// file starts: a file that rebuilt it would race the others that read it in parallel workers.
const builder = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

export default function setup(): void {
  execFileSync(process.execPath, [path.join(builder, "scripts/copy-starter.mjs")]);
}
