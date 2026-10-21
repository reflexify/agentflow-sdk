import fs from "node:fs";
import path from "node:path";
import { clip, readJson, refuse, translate } from "./core.js";
import { CONFIG_MEMBERS } from "./members.js";
const FRONTMATTER_LINE = new RegExp(`^(${CONFIG_MEMBERS.skill_frontmatter.join("|")}): (\\S.*?)\\s*$`);
export function agentObject(configDir, key) {
    const where = `agents/${key}.json`;
    const { key: own, ...rest } = readJson(path.join(configDir, where));
    if (own !== key)
        refuse(where, "/key", `is ${own}, not ${key}`);
    return [`agent:${key}`, translate(rest, where, "")];
}
// Reads a SKILL.md as the installer does: the frontmatter between the first two `---` lines, then the
// body after the closing line's break, untouched.
export function skillObject(configDir, fileName) {
    const where = `skills/${fileName}`;
    const lines = fs.readFileSync(path.join(configDir, where), "utf8").replace(/^\uFEFF/, "").split(/(?<=\n)/);
    const delimiter = (line) => line.replace(/[ \t\r\n]+$/, "") === "---";
    if (!delimiter(lines[0] ?? ""))
        refuse(where, "", "must start with a --- line");
    const close = lines.findIndex((line, i) => i > 0 && delimiter(line));
    if (close < 0)
        refuse(where, "", "its frontmatter is not closed by a --- line");
    const front = {};
    for (const line of lines.slice(1, close)) {
        const m = FRONTMATTER_LINE.exec(line);
        if (!m || /^["'|>&*!#%@`[{?:,\]}-]/.test(m[2]) || /(: | #|:$)/.test(m[2])) {
            refuse(where, "", `frontmatter line is not a plain "name: value" or "description: value": ${clip(line.trim())}`);
        }
        front[m[1]] = m[2];
    }
    if (!front.name || !front.description)
        refuse(where, "", "frontmatter needs a name and a description");
    const local = front.name.replaceAll("-", "_");
    if (fileName !== `${local}.SKILL.md`)
        refuse(where, "", `is named for ${front.name}, so it must be ${local}.SKILL.md`);
    return [`skill:${local}`, { description: front.description, body: lines.slice(close + 1).join("") }];
}
//# sourceMappingURL=assets.js.map