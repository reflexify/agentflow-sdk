import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { CliError } from "./errors.js";
export const UI_EXTENSIONS = new Set([".js", ".mjs", ".css", ".json", ".map", ".svg", ".png", ".jpg", ".webp", ".woff2"]);
export const MOUNT_EXPORT = /export\s*\{\s*(?:[\w$]+\s+as\s+)?mount\s*\}\s*;?\s*$/;
// The module a draft carries when its app has no screen: a `mount` that draws nothing and returns a no-op.
const EMPTY_MOUNT = /^(?:export\s+)?function\s+mount\s*\([^)]*\)\s*\{\s*return\s*\(\s*\)\s*=>\s*\{\s*\}\s*;?\s*\}\s*(?:export\s*\{\s*mount\s*\}\s*;?\s*)?$/;
export const isEmptyMount = (source) => EMPTY_MOUNT.test(source.trim());
// Every file under `dir` as a sorted, `/`-separated path relative to it.
export function listFiles(dir) {
    const out = [];
    const walk = (current, prefix) => {
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
            if (entry.isDirectory())
                walk(path.join(current, entry.name), rel);
            else
                out.push(rel);
        }
    };
    if (fs.existsSync(dir))
        walk(dir, "");
    return out.sort();
}
const extensionOf = (rel) => {
    const name = rel.slice(rel.lastIndexOf("/") + 1);
    const dot = name.lastIndexOf(".");
    return dot < 0 ? "" : name.slice(dot);
};
export function checkUi(dir) {
    const entry = path.join(dir, "index.js");
    if (!fs.existsSync(entry))
        throw new CliError("UI_ENTRY_MISSING", `${dir} has no index.js: the UI module's entry is ui/index.js`);
    if (!MOUNT_EXPORT.test(fs.readFileSync(entry, "utf8"))) {
        throw new CliError("UI_ENTRY_INVALID", `${entry} does not export mount: the module's last statement must be export { mount };`);
    }
    const refused = listFiles(dir).filter((rel) => !UI_EXTENSIONS.has(extensionOf(rel)));
    if (refused.length) {
        throw new CliError("UI_FILE_TYPE", `the UI module holds a file the platform does not serve: ${refused.join(", ")} (allowed: ${[...UI_EXTENSIONS].join(" ")})`, refused);
    }
}
// The app's own vite: the first node_modules/vite on the way up from the app, as Node looks, but
// without NODE_PATH or the global folders, so an app that lacks vite never borrows another install's.
function findVite(appDir) {
    for (let dir = appDir;; dir = path.dirname(dir)) {
        const candidate = path.join(dir, "node_modules", "vite", "package.json");
        if (fs.existsSync(candidate))
            return candidate;
        if (path.dirname(dir) === dir)
            return undefined;
    }
}
// The UI kit's `./jsx` entry holds JSX types and no code, so a plain import of it type-checks and then fails the
// bundle with a resolver error that names neither cause nor cure.
export function uiBuildFailure(message) {
    const typesOnly = /"\.\/jsx" is not exported\b/.test(message) && message.includes("agentflow-elements");
    const hint = typesOnly
        ? "\n@reflexify/agentflow-elements/jsx holds types only: import it as `import type {} from '@reflexify/agentflow-elements/jsx';` (and its event types with `import type`)"
        : "";
    return new CliError("UI_BUILD_FAILED", `the UI module did not build: ${message}${hint}`);
}
export async function buildUi(appDir, viteConfig, outDir) {
    appDir = path.resolve(appDir);
    outDir = path.resolve(outDir);
    const vitePackage = findVite(appDir);
    if (!vitePackage) {
        throw new CliError("UI_TOOL_MISSING", `the manifest declares a UI module, but vite is not installed in ${appDir}: run pnpm add -D vite`);
    }
    const vitePath = createRequire(vitePackage).resolve("vite");
    const { build } = await import(pathToFileURL(vitePath).href);
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
        await build({ root: appDir, configFile: path.join(appDir, viteConfig), logLevel: "warn", build: { outDir, emptyOutDir: true } });
    }
    catch (error) {
        throw uiBuildFailure(error.message);
    }
    finally {
        if (previous === undefined)
            delete process.env.NODE_ENV;
        else
            process.env.NODE_ENV = previous;
    }
    checkUi(outDir);
}
//# sourceMappingURL=ui.js.map