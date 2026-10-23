import { checkPackage } from "./check.js";
import { CliError } from "./errors.js";
export async function requireFresh(cwd) {
    const { stale, missing, extra } = await checkPackage(cwd);
    const files = [...stale, ...missing, ...extra].map((rel) => `package/${rel}`);
    if (!files.length)
        return;
    const parts = [
        ...(stale.length ? [`stale: ${stale.join(", ")}`] : []),
        ...(missing.length ? [`missing: ${missing.join(", ")}`] : []),
        ...(extra.length ? [`not from the config: ${extra.join(", ")}`] : []),
    ];
    throw new CliError("PACKAGE_STALE", `package/ does not match the config (${parts.join("; ")}): run agentflow-app build`, files);
}
// A manifest that declares a module whose files were never built would seal, and the platform would refuse it
// later; worse, the next seal after building would meet SEAL_OUT_EXISTS for a version that was never released.
export function requireUiEntry(files) {
    const { ui } = JSON.parse(files.get("manifest.json").toString("utf8"));
    if (ui === undefined)
        return;
    const entry = typeof ui === "object" && ui !== null ? ui.entry : undefined;
    if (typeof entry === "string" && files.has(entry))
        return;
    const missing = typeof entry === "string" ? `package/${entry}` : undefined;
    throw new CliError("UI_ENTRY_MISSING", `package/manifest.json declares a UI module, but ${missing ?? "its entry"} is missing: run agentflow-app build first`, [missing ?? "package/manifest.json"]);
}
//# sourceMappingURL=package-checks.js.map