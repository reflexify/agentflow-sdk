import fs from "node:fs";
import path from "node:path";
import { stringFlag } from "../command.js";
import { CliError } from "../errors.js";
import { readPayloadDir } from "../seal/payload.js";
import { generateTypes, payloadObjects } from "./generate.js";
export const TYPES_OUT = "src/generated/app.ts";
export function readPackageDir(cwd) {
    try {
        return readPayloadDir(path.join(cwd, "package"));
    }
    catch (error) {
        const code = error.code;
        if (code === "ENOENT" || code === "ENOTDIR") {
            throw new CliError("PACKAGE_MISSING", `no package/ in ${cwd}: run agentflow-app build first`);
        }
        throw error;
    }
}
function readIfThere(file) {
    try {
        return fs.readFileSync(file, "utf8");
    }
    catch (error) {
        if (error.code === "ENOENT")
            return undefined;
        throw error;
    }
}
export const typesCommand = async (values, io) => {
    const { manifest, objects } = payloadObjects(readPackageDir(io.cwd));
    const text = generateTypes(manifest, objects);
    const file = path.resolve(io.cwd, stringFlag(values, "out") ?? TYPES_OUT);
    const shown = path.relative(io.cwd, file).split(path.sep).join("/");
    const current = readIfThere(file);
    if (values["check"]) {
        if (current !== text) {
            throw new CliError("TYPES_STALE", `${shown} is not what package/ generates: run agentflow-app types`, [shown]);
        }
        return { data: { file: shown, changed: false }, text: [`${shown} matches package/`] };
    }
    if (current === text)
        return { data: { file: shown, changed: false }, text: [`unchanged: ${shown}`] };
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
    return { data: { file: shown, changed: true }, text: [`wrote ${shown}`] };
};
//# sourceMappingURL=command.js.map