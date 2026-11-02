import { checkPackage } from "./check.js";
import { CliError } from "./errors.js";
import { isEmptyMount } from "./ui.js";

// A module whose mount draws nothing builds, checks and seals, and every launcher entry that opens it shows a
// blank page. `read` gives a package file by its path inside the package, or nothing.
export function emptyUiWarnings(read: (rel: string) => Buffer | undefined): string[] {
  const manifest = read("manifest.json");
  if (!manifest) return [];
  const { ui } = JSON.parse(manifest.toString("utf8")) as { ui?: { entry?: unknown } };
  const entry = typeof ui === "object" && ui !== null && typeof ui.entry === "string" ? ui.entry : undefined;
  const bytes = entry === undefined ? undefined : read(entry);
  if (!bytes || !isEmptyMount(bytes.toString("utf8"))) return [];
  return [
    `the UI module ${entry} (${bytes.length} bytes) is an empty stub: it opens a blank screen. Replace it with a real module (the agentflow-ui-module skill), or remove ui and the launcher entries that open it`,
  ];
}

export async function requireFresh(cwd: string): Promise<void> {
  const { stale, missing, extra } = await checkPackage(cwd);
  const files = [...stale, ...missing, ...extra].map((rel) => `package/${rel}`);
  if (!files.length) return;
  const parts = [
    ...(stale.length ? [`stale: ${stale.join(", ")}`] : []),
    ...(missing.length ? [`missing: ${missing.join(", ")}`] : []),
    ...(extra.length ? [`not from the config: ${extra.join(", ")}`] : []),
  ];
  throw new CliError("PACKAGE_STALE", `package/ does not match the config (${parts.join("; ")}): run pnpm build`, files);
}

export async function requireSameValues(cwd: string): Promise<void> {
  const { stale, missing, extra, where = [] } = await checkPackage(cwd, { values: true });
  const files = [...stale, ...missing, ...extra].map((rel) => `package/${rel}`);
  if (!files.length) return;
  const parts = [
    ...where,
    ...missing.map((rel) => `${rel} (the config writes it, package/ does not have it)`),
    ...extra.map((rel) => `${rel} (package/ has it, the config does not write it)`),
  ];
  throw new CliError(
    "PACKAGE_DIFFERS",
    `the config does not build the values package/ holds; it differs at ${parts.join("; ")}. package/ is unchanged: fix the config and check again, or run pnpm build if the change is meant`,
    files,
  );
}

// A manifest that declares a module whose files were never built would seal, and the platform would refuse it
// later; worse, the next seal after building would meet SEAL_OUT_EXISTS for a version that was never released.
export function requireUiEntry(files: Map<string, Buffer>): void {
  const { ui } = JSON.parse(files.get("manifest.json")!.toString("utf8")) as { ui?: { entry?: unknown } };
  if (ui === undefined) return;
  const entry = typeof ui === "object" && ui !== null ? ui.entry : undefined;
  if (typeof entry === "string" && files.has(entry)) return;
  const missing = typeof entry === "string" ? `package/${entry}` : undefined;
  throw new CliError(
    "UI_ENTRY_MISSING",
    `package/manifest.json declares a UI module, but ${missing ?? "its entry"} is missing: run pnpm build first`,
    [missing ?? "package/manifest.json"],
  );
}
