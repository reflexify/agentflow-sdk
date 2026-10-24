import fs from "node:fs";
import path from "node:path";
import { DEFAULT_VITE_CONFIG, loadApp } from "./app.js";
import { buildPackage } from "./build.js";
import { buildUi, checkUi, listFiles } from "./ui.js";
const isUi = (rel) => rel === "ui" || rel.startsWith("ui/");
// The module as `build` would write it, in a folder `use` reads: the prebuilt folder itself, or a fresh vite build.
// The build goes to a folder as deep below the app as package/ui, because a source map names its sources relative to
// where it is written; the same source then gives the same bytes.
const LEFTOVER_MS = 10 * 60 * 1000;
// A killed check leaves its folder behind; one younger than any check takes may belong to a run still going.
function removeLeftovers(parent) {
    for (const name of fs.readdirSync(parent)) {
        if (!name.startsWith("ui-check-"))
            continue;
        const folder = path.join(parent, name);
        try {
            if (Date.now() - fs.statSync(folder).mtimeMs > LEFTOVER_MS)
                fs.rmSync(folder, { recursive: true, force: true });
        }
        catch {
            // another run removed it first
        }
    }
}
async function withExpectedUi(appDir, app, use) {
    if (app.ui && "prebuilt" in app.ui) {
        const source = path.join(appDir, app.ui.prebuilt);
        checkUi(source);
        return use(source);
    }
    const parent = path.join(appDir, ".agentflow");
    const made = !fs.existsSync(parent);
    fs.mkdirSync(parent, { recursive: true, mode: 0o700 });
    removeLeftovers(parent);
    const out = fs.mkdtempSync(path.join(parent, "ui-check-"));
    try {
        await buildUi(appDir, app.ui?.viteConfig ?? DEFAULT_VITE_CONFIG, out);
        return use(out);
    }
    finally {
        fs.rmSync(out, { recursive: true, force: true });
        if (made) {
            try {
                fs.rmdirSync(parent);
            }
            catch {
                // something else wrote there meanwhile, such as a sandbox's state: it stays
            }
        }
    }
}
export async function checkPackage(dir) {
    const appDir = path.resolve(dir);
    const { app, options, manifestDeclaresUi } = await loadApp(appDir);
    const built = buildPackage(options);
    const packageDir = path.join(appDir, "package");
    const present = listFiles(packageDir);
    const stale = [];
    const missing = [];
    for (const [rel, text] of Object.entries(built)) {
        const file = path.join(packageDir, rel);
        if (!fs.existsSync(file))
            missing.push(rel);
        else if (fs.readFileSync(file, "utf8") !== text)
            stale.push(rel);
    }
    const extra = present.filter((rel) => !isUi(rel) && !(rel in built));
    const presentUi = present.filter(isUi);
    if (!manifestDeclaresUi) {
        extra.push(...presentUi);
    }
    else if (fs.existsSync(path.join(packageDir, "ui"))) {
        // Git ignores package/ui, so a fresh checkout has none; seal's entry check refuses a module never built.
        await withExpectedUi(appDir, app, (expectedDir) => {
            const expected = listFiles(expectedDir);
            for (const rel of expected) {
                const file = path.join(packageDir, "ui", rel);
                if (!fs.existsSync(file))
                    missing.push(`ui/${rel}`);
                else if (!fs.readFileSync(file).equals(fs.readFileSync(path.join(expectedDir, rel))))
                    stale.push(`ui/${rel}`);
            }
            const wanted = new Set(expected.map((rel) => `ui/${rel}`));
            extra.push(...presentUi.filter((rel) => !wanted.has(rel)));
        });
    }
    return { stale: stale.sort(), missing: missing.sort(), extra: extra.sort() };
}
//# sourceMappingURL=check.js.map