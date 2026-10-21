import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SDK_VERSION } from "./config-version.js";
import { CliError } from "./errors.js";
import { PACKAGE_PART } from "./seal/payload.js";
export const MIRROR_PACKAGES = {
    "@reflexify/agentflow-sdk": "agentflow-sdk",
    "@reflexify/agentflow-elements": "agentflow-elements",
    "@reflexify/agentflow-app-builder": "agentflow-app-builder",
};
export function mirrorRef(packageName, version) {
    const dir = MIRROR_PACKAGES[packageName];
    if (!dir)
        throw new Error(`no folder of the SDK mirror holds ${packageName}`);
    return `github:reflexify/agentflow-sdk#sdk-v${version}&path:packages/${dir}`;
}
// A project's pnpm settings, which the SDK workspace gives the starter there. pnpm 12 refuses a git reference below
// a direct dependency (ERR_PNPM_EXOTIC_SUBDEP), and the SDK's packages refer to each other that way; it also refuses
// to run esbuild's install script, which tsx needs, unless it is allowed (ERR_PNPM_IGNORED_BUILDS).
export const PROJECT_PNPM_WORKSPACE = `# The AgentFlow SDK's packages come from git and refer to each other by git
# reference, which pnpm refuses below a direct dependency unless this is off.
blockExoticSubdeps: false
allowBuilds:
  esbuild: true
`;
const BASE_TSCONFIG = "../../tsconfig.base.json";
const TEST_FILE = /^test\/.*\.test\.[cm]?[jt]sx?$/;
const TYPESCRIPT_FILE = /\.[cm]?tsx?$/;
const readJsonFile = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const renderJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const covers = (listed, file) => (listed.endsWith("/") ? file.startsWith(listed) : file === listed);
// The folder `copy-starter` fills: beside this module in dist/, or, when this runs from src/, in the dist/ next to it.
function defaultTemplate() {
    for (const rel of ["./starter/", "../dist/starter/"]) {
        const dir = fileURLToPath(new URL(rel, import.meta.url));
        if (fs.existsSync(path.join(dir, "starter.json")))
            return dir;
    }
    throw new CliError("INIT_STARTER_INVALID", "init found no starter in this install: run pnpm build in the builder package");
}
// The starter keeps a leading dot as `_`, so a package manager that drops dotfiles from a tarball keeps them.
const stored = (rel) => rel.split("/").map((segment) => (segment.startsWith(".") ? `_${segment.slice(1)}` : segment)).join("/");
const unexpected = (what, why = "is not what init expects") => new CliError("INIT_STARTER_INVALID", `init: the starter's ${what} ${why}`);
function replaceOnce(text, pattern, value, what) {
    if (!pattern.test(text))
        throw unexpected(what);
    return text.replace(pattern, (_match, head) => `${head}${value}`);
}
// `example` marks what describes the case desk's own objects: init keeps it, since the project starts as a copy of
// them, and a project converted from a draft drops it.
const FENCE_GROUPS = ["ui", "site", "only", "typescript", "example"];
// README.md and AGENTS.md carry blocks between `<!-- starter:NAME -->` and `<!-- /starter:NAME -->` lines, where NAME
// may join groups with `+`. A block goes when any of its groups is dropped, and the comment lines always go.
function stripFences(text, drop, what) {
    const kept = [];
    let open;
    for (const line of text.split("\n")) {
        const fence = /^\s*<!-- (\/)?starter:([a-z]+(?:\+[a-z]+)*) -->$/.exec(line);
        if (!fence) {
            if (!open || !open.split("+").some((group) => drop.has(group)))
                kept.push(line);
            continue;
        }
        const [, closing, name] = fence;
        const unknown = name.split("+").find((group) => !FENCE_GROUPS.includes(group));
        if (unknown)
            throw unexpected(what, `has a fence for an unknown group, ${unknown}`);
        if (!closing) {
            if (open)
                throw unexpected(what, `opens ${name} inside ${open}`);
            open = name;
        }
        else {
            if (open !== name)
                throw unexpected(what, `closes ${name} where ${open ?? "nothing"} is open`);
            open = undefined;
        }
    }
    if (open)
        throw unexpected(what, `never closes its ${open} fence`);
    return kept.join("\n").replace(/\n{3,}/g, "\n\n");
}
const pascal = (key) => key.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
// The starter's names, in the project's: the id, the app's name (as a title and in running text), the key, and the
// environment variables that carry the key as their prefix. Names only; nothing else in a file changes.
function renameStarter(text, names) {
    return text
        .replaceAll("acme/case-desk", names.id)
        .replaceAll("acme-case-desk", `${names.prefix}-${names.key}`)
        .replaceAll("dev-acme", `dev-${names.prefix}`)
        .replaceAll("CASE_DESK_", `${names.key.toUpperCase().replaceAll("-", "_")}_`)
        .replaceAll("CaseDesk", pascal(names.key))
        .replaceAll("caseDesk", pascal(names.key).replace(/^./, (c) => c.toLowerCase()))
        .replaceAll("case-desk", names.key)
        .replaceAll("Case desk", names.name)
        .replaceAll("case desk", names.name.toLowerCase());
}
function projectDoc(text, what, drop, names) {
    return renameStarter(stripFences(text, drop, what), names);
}
function dropManifestMembers(manifest, removed, remaining) {
    if (removed.some((g) => g.manifest?.ui) && !remaining.some((g) => g.manifest?.ui))
        delete manifest.ui;
    const keep = new Set(remaining.flatMap((g) => g.manifest?.launcherEntries ?? []));
    const drop = new Set(removed.flatMap((g) => g.manifest?.launcherEntries ?? []).filter((key) => !keep.has(key)));
    if (!drop.size || !manifest.launcher)
        return;
    const entries = manifest.launcher.entries.filter((entry) => !drop.has(entry.key));
    if (entries.length)
        manifest.launcher = { ...manifest.launcher, entries };
    else
        delete manifest.launcher;
}
function projectPackageJson(starter, removed, remaining, key, files, ref = mirrorRef) {
    const pkg = structuredClone(starter);
    pkg.name = key;
    const shared = (field, item) => remaining.some((g) => g[field].includes(item));
    for (const group of removed) {
        for (const field of ["dependencies", "devDependencies", "scripts"]) {
            for (const item of group[field])
                if (!shared(field, item))
                    delete pkg[field]?.[item];
        }
    }
    for (const field of ["dependencies", "devDependencies"]) {
        for (const [dep, range] of Object.entries((pkg[field] ?? {}))) {
            if (range.startsWith("workspace:"))
                pkg[field][dep] = ref(dep, SDK_VERSION);
        }
    }
    if (![...files].some((rel) => TEST_FILE.test(rel))) {
        files.delete("vitest.config.ts");
        delete pkg.devDependencies?.vitest;
        pkg.scripts.test = "agentflow-app build --check";
    }
    if (![...files].some((rel) => TYPESCRIPT_FILE.test(rel))) {
        files.delete("tsconfig.json");
        files.delete("tsconfig.node.json");
        delete pkg.devDependencies?.typescript;
        delete pkg.devDependencies?.["@types/node"];
        delete pkg.scripts.typecheck;
    }
    for (const field of ["dependencies", "devDependencies"]) {
        if (pkg[field] && Object.keys(pkg[field]).length === 0)
            delete pkg[field];
    }
    return pkg;
}
function inlineBaseConfig(tsconfig, template) {
    if (tsconfig.extends !== BASE_TSCONFIG)
        return tsconfig;
    const base = readJsonFile(path.join(template, "tsconfig.base.json"));
    const { extends: _extends, compilerOptions, ...rest } = tsconfig;
    return { compilerOptions: { ...base.compilerOptions, ...compilerOptions }, ...rest };
}
function assemble(template, staging, opts, name) {
    const starter = readJsonFile(path.join(template, "starter.json"));
    const wanted = { ui: opts.ui, site: opts.site ?? true };
    const removed = ["ui", "site"].filter((g) => !wanted[g]).map((g) => starter[g]);
    const remaining = ["ui", "site"].filter((g) => wanted[g]).map((g) => starter[g]);
    const listed = readJsonFile(path.join(template, ".files.json"));
    const files = new Set(listed.filter((rel) => !removed.some((g) => g.files.some((item) => covers(item, rel)))));
    const read = (rel) => fs.readFileSync(path.join(template, stored(rel)), "utf8");
    const pkg = projectPackageJson(JSON.parse(read("package.json")), removed, remaining, opts.key, files, opts.ref);
    files.add("pnpm-workspace.yaml");
    const edited = new Map();
    edited.set("package.json", renderJson(pkg));
    edited.set("pnpm-workspace.yaml", PROJECT_PNPM_WORKSPACE);
    const id = `${opts.prefix}/${opts.key}`;
    const dropped = new Set(["only", ...["ui", "site"].filter((g) => !wanted[g])]);
    if (!files.has("tsconfig.json"))
        dropped.add("typescript");
    const names = { prefix: opts.prefix, key: opts.key, id, name };
    if (!/^# Case desk$/m.test(read("README.md")))
        throw unexpected("README.md title");
    for (const doc of ["README.md", "AGENTS.md"])
        edited.set(doc, projectDoc(read(doc), doc, dropped, names));
    if (files.has("RUNBOOK.md"))
        edited.set("RUNBOOK.md", projectDoc(read("RUNBOOK.md"), "RUNBOOK.md", dropped, names));
    let config = read("config/package-manifest.json");
    config = replaceOnce(config, /^(  "id": )"acme\/case-desk"/m, JSON.stringify(id), "package manifest id");
    config = replaceOnce(config, /^(  "name": )"Case desk"/m, JSON.stringify(name), "package manifest name");
    config = replaceOnce(config, /^(  "changelog": )".*"/m, JSON.stringify("First release."), "package manifest changelog");
    config = replaceOnce(config, /("label": )"Case desk users"/, JSON.stringify(`${name} users`), "package manifest parameter label");
    const built = JSON.parse(read("package/manifest.json"));
    built.id = id;
    built.name = name;
    built.changelog = "First release.";
    built.parameters.find((p) => p.key === "app_users").label = `${name} users`;
    if (removed.length) {
        const source = JSON.parse(config);
        dropManifestMembers(source, removed, remaining);
        config = renderJson(source);
        dropManifestMembers(built, removed, remaining);
    }
    edited.set("config/package-manifest.json", config);
    edited.set("package/manifest.json", renderJson(built));
    for (const rel of ["tsconfig.json", "tsconfig.node.json"]) {
        if (files.has(rel))
            edited.set(rel, renderJson(inlineBaseConfig(JSON.parse(read(rel)), template)));
    }
    for (const rel of [...files].sort()) {
        const target = path.join(staging, rel);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        const text = edited.get(rel);
        if (text !== undefined) {
            fs.writeFileSync(target, text);
            continue;
        }
        const source = path.join(template, stored(rel));
        const bytes = fs.readFileSync(source);
        fs.writeFileSync(target, bytes.includes(0) ? bytes : renameStarter(bytes.toString("utf8"), names));
        fs.chmodSync(target, fs.statSync(source).mode & 0o777);
    }
}
export const DRAFT_PROJECT_FILES = ["package.json", "pnpm-workspace.yaml", ".gitignore", "README.md", "AGENTS.md", "CLAUDE.md"];
// The starter's project files for an app converted from a draft, as `init --no-ui --no-site` writes them: the
// draft brings its own config and, at most, a built module, and none of the starter's tests or TypeScript. The
// docs keep their module passages when the draft carries a module.
export function draftProjectFiles(id, name, hasUi, templateDir) {
    const template = templateDir ?? defaultTemplate();
    const starter = readJsonFile(path.join(template, "starter.json"));
    const read = (rel) => fs.readFileSync(path.join(template, stored(rel)), "utf8");
    const [prefix, key] = id.split("/");
    const pkg = projectPackageJson(JSON.parse(read("package.json")), [starter.ui, starter.site], [], key, new Set(DRAFT_PROJECT_FILES));
    const dropped = new Set(["only", "site", "typescript", "example", ...(hasUi ? [] : ["ui"])]);
    const names = { prefix, key, id, name };
    if (!/^# Case desk$/m.test(read("README.md")))
        throw unexpected("README.md title");
    return new Map([
        ["package.json", renderJson(pkg)],
        ["pnpm-workspace.yaml", PROJECT_PNPM_WORKSPACE],
        [".gitignore", read(".gitignore")],
        ["README.md", projectDoc(read("README.md"), "README.md", dropped, names)],
        ["AGENTS.md", projectDoc(read("AGENTS.md"), "AGENTS.md", dropped, names)],
        ["CLAUDE.md", read("CLAUDE.md")],
    ]);
}
const UNWRITABLE = {
    EACCES: "permission denied",
    EPERM: "permission denied",
    EROFS: "read-only file system",
    ENOTDIR: "a file is where a folder should be",
    EEXIST: "a file is where a folder should be",
};
function unwritable(error, folder) {
    const code = error.code;
    if (typeof code !== "string" || !Object.hasOwn(UNWRITABLE, code))
        return error;
    return new CliError("INIT_DIR_UNWRITABLE", `init cannot write in ${folder}: ${UNWRITABLE[code]} (${code})`, [folder]);
}
const READ_CALLS = new Set(["open", "read", "scandir", "stat", "lstat", "readlink"]);
// A failure belongs to the starter only when it was a read of a file inside the template folder.
function starterReadFailure(error, template) {
    const { syscall, path: failed } = error;
    if (typeof failed !== "string" || typeof syscall !== "string" || !READ_CALLS.has(syscall))
        return false;
    const inside = path.relative(path.resolve(template), path.resolve(failed));
    return inside !== "" && inside !== ".." && !inside.startsWith(`..${path.sep}`) && !path.isAbsolute(inside);
}
// Copies a built folder into a target that did not have these entries, recording each file and folder it
// creates, and nothing else, so a rollback never removes what another process put there.
function place(from, to, created) {
    if (fs.statSync(from).isDirectory()) {
        fs.mkdirSync(to);
        created.push({ path: to, dir: true });
        for (const name of fs.readdirSync(from))
            place(path.join(from, name), path.join(to, name), created);
    }
    else {
        fs.copyFileSync(from, to, fs.constants.COPYFILE_EXCL);
        created.push({ path: to, dir: false });
    }
}
function unplace(created) {
    for (const { path: made, dir } of created.reverse()) {
        try {
            if (dir)
                fs.rmdirSync(made);
            else
                fs.rmSync(made, { force: true });
        }
        catch {
            // a folder another process has put files in stays
        }
    }
}
const keyName = (key) => {
    const words = key.replaceAll("-", " ");
    return `${words.charAt(0).toUpperCase()}${words.slice(1)}`;
};
export async function initProject(dir, opts) {
    if (!PACKAGE_PART.prefixValid(opts.prefix)) {
        throw new CliError("INIT_NAME_INVALID", `--prefix ${opts.prefix}: ${PACKAGE_PART.prefixRule}`);
    }
    if (!PACKAGE_PART.keyValid(opts.key)) {
        const message = opts.keyFromFolder
            ? `key ${opts.key}, taken from the folder's name: ${PACKAGE_PART.keyRule}; name a valid one with --key <key>`
            : `key ${opts.key}: ${PACKAGE_PART.keyRule}`;
        throw new CliError("INIT_NAME_INVALID", message);
    }
    const target = path.resolve(dir);
    const existing = fs.existsSync(target);
    if (existing && (!fs.statSync(target).isDirectory() || fs.readdirSync(target).length > 0)) {
        throw new CliError("INIT_DIR_NOT_EMPTY", `${target} exists and is not an empty folder: name a new folder, or an empty one`, [target]);
    }
    const template = opts.templateDir ?? defaultTemplate();
    const parent = path.dirname(target);
    const staging = path.join(parent, `.agentflow-init-${randomBytes(6).toString("hex")}`);
    try {
        fs.mkdirSync(parent, { recursive: true });
        fs.mkdirSync(staging);
    }
    catch (error) {
        throw unwritable(error, parent);
    }
    const placed = [];
    try {
        assemble(template, staging, opts, keyName(opts.key));
        if (existing) {
            for (const entry of fs.readdirSync(staging)) {
                if (fs.existsSync(path.join(target, entry))) {
                    throw new CliError("INIT_DIR_NOT_EMPTY", `${target} was filled while init ran: name a new folder, or an empty one`, [target]);
                }
                place(path.join(staging, entry), path.join(target, entry), placed);
            }
            fs.rmSync(staging, { recursive: true, force: true });
        }
        else {
            fs.renameSync(staging, target);
        }
    }
    catch (error) {
        fs.rmSync(staging, { recursive: true, force: true });
        unplace(placed);
        const { code } = error;
        if (code === "ENOTEMPTY" || code === "EEXIST") {
            throw new CliError("INIT_DIR_NOT_EMPTY", `${target} was filled while init ran: name a new folder, or an empty one`, [target]);
        }
        if (starterReadFailure(error, template)) {
            throw new CliError("INIT_STARTER_INVALID", `init could not read its starter: ${error.message}`);
        }
        throw unwritable(error, target);
    }
    return { dir: target, id: `${opts.prefix}/${opts.key}` };
}
//# sourceMappingURL=init.js.map