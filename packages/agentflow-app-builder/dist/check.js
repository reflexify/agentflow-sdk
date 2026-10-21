import fs from "node:fs";
import path from "node:path";
import { loadApp } from "./app.js";
import { buildPackage } from "./build.js";
import { listFiles } from "./ui.js";
export async function checkPackage(dir) {
    const appDir = path.resolve(dir);
    const { options } = await loadApp(appDir);
    const built = buildPackage(options);
    const packageDir = path.join(appDir, "package");
    const present = listFiles(packageDir).filter((rel) => rel !== "ui" && !rel.startsWith("ui/"));
    const stale = [];
    const missing = [];
    for (const [rel, text] of Object.entries(built)) {
        const file = path.join(packageDir, rel);
        if (!fs.existsSync(file))
            missing.push(rel);
        else if (fs.readFileSync(file, "utf8") !== text)
            stale.push(rel);
    }
    const extra = present.filter((rel) => !(rel in built));
    return { stale: stale.sort(), missing: missing.sort(), extra };
}
//# sourceMappingURL=check.js.map