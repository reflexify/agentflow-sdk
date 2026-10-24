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
// The builder reads each frontmatter line as a plain `key: value`, so a value YAML would read as anything but text is
// refused, and the refusal names the rule: a quoted description, or a `: ` inside one, is the usual cause.
function lineRule(line) {
    return /^(?:name|description):\s*$/.test(line.trim())
        ? "has no value after the key"
        : 'does not start with "name: " or "description: " (the frontmatter holds only these two keys, one line each)';
}
function valueRule(value) {
    const first = /^["'|>&*!#%@`[{?:,\]}-]/.exec(value)?.[0];
    if (first) {
        return `has a value that starts with ${first === '"' || first === "'" ? "a quote" : `"${first}"`}, which is YAML syntax: begin the value with a plain word and leave the quotes out`;
    }
    if (value.includes(": "))
        return 'has a value that holds ": ", which YAML reads as a new key: reword it, for example with a dash or a comma instead of the colon';
    if (value.includes(" #"))
        return 'has a value that holds " #", which YAML reads as a comment: reword it';
    if (value.endsWith(":"))
        return 'has a value that ends with ":": end it with a word or a full stop';
    return undefined;
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
        const broken = m ? valueRule(m[2]) : lineRule(line);
        if (broken) {
            refuse(where, "", `frontmatter line is not a plain "name: value" or "description: value", because it ${broken}: ${clip(line.trim())}`);
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