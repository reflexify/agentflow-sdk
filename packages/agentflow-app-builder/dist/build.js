import fs from "node:fs";
import path from "node:path";
import { agentObject, skillObject } from "./assets.js";
import { dashboardObject } from "./dashboard.js";
import { documentTemplateObject } from "./document-template.js";
import { at, checkReferences, kindOf, refuse, renderFiles, writeFiles } from "./core.js";
import { entityObjects, entitySource } from "./entity.js";
import { fieldKeysOf } from "./invariants.js";
import { assistantOf } from "./assistant.js";
import { launcherOf } from "./launcher.js";
import { MANIFEST_MEMBERS, manifestSource, OPTIONAL_MEMBERS } from "./manifest.js";
import { actionObject, checkGraph, startGrants, triggerObject, workflowObject, } from "./workflow.js";
// The sections merged, with the workflows' build-local names in publish order (a workflow comes after
// every workflow it calls). Every graph passes its checks, or this throws.
export function merge(sectionModules, order) {
    const merged = { workflows: {}, triggers: {}, actions: {} };
    for (const s of sectionModules) {
        for (const kind of ["workflows", "triggers", "actions"]) {
            for (const [name, item] of Object.entries(s[kind] ?? {})) {
                if (Object.hasOwn(merged[kind], name))
                    refuse("sections", at(`/${kind}`, name), "defined twice");
                merged[kind][name] = item;
            }
        }
    }
    const ordered = order.filter((k) => k in merged.workflows);
    const missing = Object.keys(merged.workflows).filter((k) => !ordered.includes(k));
    if (missing.length)
        throw new Error(`add ${missing} to ORDER`);
    for (const k of ordered)
        checkGraph(k, merged.workflows[k].graph);
    return { ...merged, order: ordered };
}
const CONFIG_FOLDERS = ["entities", "agents", "skills", "dashboards", "document_templates", "code", "build"];
const CONFIG_FILES = ["package-manifest.json"];
const FOLDERS = `the folders are ${CONFIG_FOLDERS.slice(0, -1).join(", ")} and ${CONFIG_FOLDERS.at(-1)}`;
// Dotfiles and the files an operating system leaves behind are never read and never refused.
const skipped = (name) => name.startsWith(".") || /^(desktop\.ini|thumbs\.db)$/i.test(name);
// Notes an author keeps beside the config. In skills/ a .md is skill content, so only a .txt is a note there.
// A skill file is never a note, so one put in the wrong place is refused rather than left out unseen.
const isSkillFile = (name) => /\.skill\.md$/i.test(name);
const isNote = (name) => /\.(md|txt)$/i.test(name) && !isSkillFile(name);
const SKILLS_HOME = "a skill: skills go in config/skills/";
const isSkillNote = (name) => /\.txt$/i.test(name);
const caseOf = (name, known) => known.find((k) => k !== name && k.toLowerCase() === name.toLowerCase());
function isFolder(dir, name, where) {
    try {
        return fs.statSync(path.join(dir, name)).isDirectory();
    }
    catch (error) {
        if (error.code === "ENOENT")
            refuse(where, "", `${name} is a link to nothing`);
        throw error;
    }
}
// The first file under `rel` (relative to `dir`) that is not skipped and not a note.
function firstOther(dir, rel, where, note) {
    for (const name of fs.readdirSync(path.join(dir, rel))) {
        if (skipped(name))
            continue;
        const child = `${rel}/${name}`;
        if (isFolder(dir, child, where)) {
            const found = firstOther(dir, child, where, note);
            if (found)
                return found;
        }
        else if (!note(name))
            return child;
    }
    return undefined;
}
// A misnamed folder or a stray object file would otherwise be left out of the package without a word.
function checkLayout(configDir) {
    for (const name of fs.readdirSync(configDir)) {
        if (skipped(name))
            continue;
        const folder = isFolder(configDir, name, "config");
        if (CONFIG_FOLDERS.includes(name)) {
            if (!folder)
                refuse("config", "", `${name} is a file, where the builder reads a folder`);
        }
        else if (folder) {
            const found = firstOther(configDir, name, "config", isNote);
            const near = caseOf(name, CONFIG_FOLDERS);
            if (found && near)
                refuse("config", "", `${name}/ is not a folder the builder reads; did you mean ${near}/? Names are case-sensitive`);
            if (found && isSkillFile(found))
                refuse("config", "", `${name}/ is not a folder the builder reads (it holds ${found}, ${SKILLS_HOME})`);
            if (found)
                refuse("config", "", `${name}/ is not a folder the builder reads (it holds ${found}); ${FOLDERS}`);
        }
        else if (isSkillFile(name)) {
            refuse("config", "", `${name} is ${SKILLS_HOME}`);
        }
        else if (!CONFIG_FILES.includes(name) && !isNote(name)) {
            const near = caseOf(name, CONFIG_FILES);
            if (near)
                refuse("config", "", `${name} is not a file the builder reads; did you mean ${near}? Names are case-sensitive`);
            refuse("config", "", `${name} is not a file the builder reads; the files are package-manifest.json and notes (.md, .txt)`);
        }
    }
}
// The files of a folder the builder reads, without notes. A subfolder of notes is skipped; one holding
// anything else is refused as a folder.
function filesOf(configDir, where, note, holds) {
    const dir = path.join(configDir, where);
    if (!fs.existsSync(dir))
        return [];
    const files = [];
    for (const name of fs.readdirSync(dir)) {
        if (skipped(name))
            continue;
        if (isFolder(dir, name, where)) {
            const found = firstOther(dir, name, where, note);
            if (found)
                refuse(where, "", `${name}/ is a folder holding ${found}; ${where}/ holds ${holds} only`);
        }
        else if (!note(name))
            files.push(name);
    }
    return files.sort();
}
const jsonStems = (configDir, where) => {
    const names = filesOf(configDir, where, isNote, ".json files and notes");
    for (const name of names)
        if (isSkillFile(name))
            refuse(where, "", `${name} is ${SKILLS_HOME}`);
    for (const name of names)
        if (!name.endsWith(".json"))
            refuse(where, "", `${name} is not a .json file`);
    return names.map((f) => f.slice(0, -".json".length)).sort();
};
// The entity files in the order the package lists them. `entityOrder` fixes that order and must name
// exactly the files found; without it they come sorted.
function entityKeys(configDir, entityOrder) {
    const found = jsonStems(configDir, "entities");
    if (!entityOrder)
        return found;
    if ([...entityOrder].sort().join() !== found.join()) {
        refuse("entities", "", `holds ${found} where entityOrder names ${[...entityOrder].sort()}`);
    }
    return entityOrder;
}
export function buildPackage({ configDir, sections, exposedSteps = {}, entityOrder }) {
    const { workflows, order, triggers, actions } = sections;
    const workflowKeys = new Set(order.map((name) => workflows[name].key));
    const objects = [];
    const grants = [];
    const source = manifestSource(configDir);
    checkLayout(configDir);
    const entities = entityKeys(configDir, entityOrder);
    const agents = jsonStems(configDir, "agents");
    const dashboards = jsonStems(configDir, "dashboards");
    const templates = jsonStems(configDir, "document_templates");
    const params = new Map(source.parameters.map((p) => [p.key, p.type]));
    const sources = new Map(entities.map((key) => [key, entitySource(configDir, key)]));
    for (const key of entities) {
        const entity = entityObjects(configDir, key, entities, params, sources);
        objects.push(...entity.objects);
        grants.push(...entity.grants);
    }
    const skillFiles = filesOf(configDir, "skills", isSkillNote, ".SKILL.md files and .txt notes");
    for (const name of skillFiles) {
        if (!name.endsWith(".SKILL.md"))
            refuse("skills", "", `${name} is not a .SKILL.md file: a skill's file is <name>.SKILL.md`);
    }
    for (const file of skillFiles)
        objects.push(skillObject(configDir, file));
    for (const key of agents)
        objects.push(agentObject(configDir, key));
    for (const key of templates)
        objects.push(documentTemplateObject(configDir, `${key}.json`, entities));
    for (const name of order)
        objects.push([`workflow:${workflows[name].key}`, workflowObject(workflows[name], configDir, exposedSteps, entities)]);
    for (const name of Object.keys(triggers).sort())
        objects.push([`trigger:${name}`, triggerObject(name, triggers[name], workflowKeys)]);
    for (const name of Object.keys(actions).sort())
        objects.push(actionObject(name, actions[name], workflowKeys, entities));
    for (const key of dashboards)
        objects.push(dashboardObject(configDir, `${key}.json`, entities));
    for (const name of order)
        grants.push(...startGrants(workflows[name]));
    const seen = new Set();
    for (const [key] of objects) {
        if (seen.has(key))
            throw new Error(`${key} is built twice`);
        seen.add(key);
    }
    const grantKeys = new Set();
    for (const { key } of grants) {
        if (grantKeys.has(key))
            throw new Error(`grant ${key} is built twice`);
        grantKeys.add(key);
    }
    const added = {
        exports: [],
        features: {},
        objects: objects.map(([key]) => ({ key, kind: kindOf(key) })),
        grants,
    };
    const manifest = Object.fromEntries(MANIFEST_MEMBERS.filter((key) => !OPTIONAL_MEMBERS.has(key) || key in source).map((key) => [
        key,
        key in added
            ? added[key]
            : key === "launcher"
                ? launcherOf(source.launcher, "ui" in source)
                : key === "assistant"
                    ? assistantOf(source.assistant, new Map(entities.map((name) => [name, fieldKeysOf(sources.get(name))])), new Set(skillFiles.map((file) => file.replace(/\.SKILL\.md$/, ""))))
                    : source[key],
    ]));
    checkReferences(objects, manifest);
    return renderFiles(manifest, objects);
}
export function writePackage(options, packageDir) {
    return writeFiles(packageDir, buildPackage(options));
}
//# sourceMappingURL=build.js.map