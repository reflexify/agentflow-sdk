import fs from "node:fs";
import path from "node:path";
import { agentObject, skillObject } from "./assets.js";
import { dashboardObject } from "./dashboard.js";
import { documentTemplateObject } from "./document-template.js";
import { at, checkReferences, isObject, kindOf, parameterOf, readJson, refuse, renderFiles, translate, writeFiles } from "./core.js";
import { entityObjects, entitySource } from "./entity.js";
import { checkModulePage, EXTENSIONS_PLATFORM, extensionBody, nameableKeysOf } from "./invariants.js";
import { checkMemory, memoryRelationshipObject, memoryTypeObject } from "./memory.js";
import { assistantOf } from "./assistant.js";
import { launcherOf } from "./launcher.js";
import { notificationsOf } from "./notifications.js";
import { MANIFEST_MEMBERS, manifestSource, OPTIONAL_MEMBERS } from "./manifest.js";
import { actionObject, checkGraph, checkNotify, DECLINE_ROUTE_PLATFORM, holdsDeclineRoute, holdsNotify, NOTIFICATIONS_PLATFORM, startGrants, triggerObject, workflowObject, } from "./workflow.js";
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
export const CONFIG_FOLDERS = ["entities", "entity_extensions", "memory_types", "memory_relationships", "agents", "skills", "dashboards", "document_templates", "code", "build"];
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
// The extensions of the package, each checked against the packages it requires. An extension is no entity: it is
// never among the entities or their sources, and a package extends each target once.
function extensionObjects(configDir, keys, access) {
    const extended = new Map();
    return keys.map((key) => {
        const where = `entity_extensions/${key}.json`;
        const body = extensionBody(readJson(path.join(configDir, where)), key, where, access);
        const earlier = extended.get(body.extends);
        if (earlier !== undefined)
            refuse(where, "/extends", `${body.extends} is already extended by ${earlier}`);
        extended.set(body.extends, key);
        return [`entity_extension:${key}`, body];
    });
}
// The package's own entities an `exports` list names, as logical keys.
function exportsOf(value, entities) {
    const where = "package-manifest.json";
    if (value === undefined)
        return [];
    if (!Array.isArray(value))
        refuse(where, "/exports", "must be an array of ${entity:key}");
    const out = [];
    value.forEach((item, i) => {
        const here = at("/exports", i);
        const key = translate(item, where, here);
        if (typeof key !== "string" || !key.startsWith("@obj:entity:"))
            refuse(where, here, "must be an ${entity:key}");
        const logical = key.slice("@obj:".length);
        if (!entities.includes(logical.slice("entity:".length)))
            refuse(where, here, `${logical} names no entity of the package`);
        if (out.includes(logical))
            refuse(where, here, `${logical} is listed twice`);
        out.push(logical);
    });
    return out;
}
// The egress translated. An entry naming a connection reaches the hosts of whatever connection the admin binds
// to that parameter, so the parameter must be a connection one.
function egressOf(value, connections) {
    const where = "package-manifest.json";
    if (!Array.isArray(value))
        return value;
    return value.map((entry, index) => {
        if (!entry || typeof entry !== "object" || !Object.hasOwn(entry, "connection"))
            return entry;
        const pointer = `/egress/${index}/connection`;
        const param = parameterOf(entry.connection, where, pointer);
        const key = param.slice("@param:".length);
        if (!connections.has(key))
            refuse(where, pointer, `${key} is not a connection_ref parameter`);
        return { ...entry, connection: param };
    });
}
const PLATFORM_MONTH = /^\d{4}\.(0[1-9]|1[0-2])$/;
// The platform month a package needs: its own, raised to `needs`, the highest month any feature it uses requires
// (null when it uses none). A value that is no month is left for verification to refuse.
function platformFor(declared, needs) {
    if (needs === null || typeof declared !== "string" || !PLATFORM_MONTH.test(declared))
        return declared;
    return declared < needs ? needs : declared;
}
const highestMonth = (months) => months.reduce((top, month) => (month !== null && (top === null || month > top) ? month : top), null);
export function buildPackage({ configDir, sections, exposedSteps = {}, entityOrder }) {
    const { workflows, order, triggers, actions } = sections;
    const workflowKeys = new Set(order.map((name) => workflows[name].key));
    const objects = [];
    const grants = [];
    const source = manifestSource(configDir);
    checkLayout(configDir);
    const entities = entityKeys(configDir, entityOrder);
    const extensions = jsonStems(configDir, "entity_extensions");
    const memoryTypes = jsonStems(configDir, "memory_types");
    const memoryRelationships = jsonStems(configDir, "memory_relationships");
    for (const key of memoryTypes) {
        if (memoryRelationships.includes(key)) {
            refuse("memory_relationships", "", `${key} is also a memory type: a type and a relationship share one key space, so give one of them another key`);
        }
    }
    const agents = jsonStems(configDir, "agents");
    const dashboards = jsonStems(configDir, "dashboards");
    const templates = jsonStems(configDir, "document_templates");
    const params = new Map(source.parameters.map((p) => [p.key, p.type]));
    const connections = new Map(source.parameters.filter((p) => p.type === "connection_ref").map((p) => [p.key, p.category]));
    const requiredPackages = source.requires?.packages;
    const access = new Map((Array.isArray(requiredPackages) ? requiredPackages : []).flatMap((p) => typeof p?.id === "string" ? [[p.id, new Set(isObject(p.access) ? Object.keys(p.access) : [])]] : []));
    const packages = new Set(access.keys());
    const notifications = "notifications" in source ? notificationsOf(source.notifications, "ui" in source) : undefined;
    const sources = new Map(entities.map((key) => [key, entitySource(configDir, key)]));
    for (const key of entities) {
        const entity = entityObjects(configDir, key, entities, params, sources, connections, packages);
        checkModulePage(sources.get(key), "ui" in source, `entities/${key}.json`);
        objects.push(...entity.objects);
        grants.push(...entity.grants);
    }
    objects.push(...extensionObjects(configDir, extensions, access));
    for (const key of memoryTypes)
        objects.push(memoryTypeObject(configDir, key, params));
    for (const key of memoryRelationships)
        objects.push(memoryRelationshipObject(configDir, key));
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
    const kindKeys = new Set((notifications?.kinds ?? []).map((kind) => kind.key));
    let sendsNotices = false;
    for (const name of order) {
        const built = workflowObject(workflows[name], configDir, exposedSteps, entities, connections);
        checkNotify(`workflow ${workflows[name].key}`, built.nodes, kindKeys);
        sendsNotices ||= holdsNotify(built.nodes);
        objects.push([`workflow:${workflows[name].key}`, built]);
    }
    for (const name of Object.keys(triggers).sort())
        objects.push([`trigger:${name}`, triggerObject(name, triggers[name], workflowKeys, connections)]);
    for (const name of Object.keys(actions).sort())
        objects.push(actionObject(name, actions[name], workflowKeys, entities));
    for (const key of dashboards)
        objects.push(dashboardObject(configDir, `${key}.json`, entities));
    for (const name of order)
        grants.push(...startGrants(workflows[name]));
    checkMemory(objects);
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
        features: {},
        objects: objects.map(([key]) => ({ key, kind: kindOf(key) })),
        grants,
    };
    const valueOf = (key) => {
        if (key in added)
            return added[key];
        switch (key) {
            case "exports":
                return exportsOf(source.exports, entities);
            case "egress":
                return egressOf(source.egress, connections);
            case "minPlatformVersion":
                return platformFor(source.minPlatformVersion, highestMonth([
                    order.some((name) => holdsDeclineRoute(workflows[name].graph)) ? DECLINE_ROUTE_PLATFORM : null,
                    notifications !== undefined || sendsNotices ? NOTIFICATIONS_PLATFORM : null,
                    extensions.length > 0 ? EXTENSIONS_PLATFORM : null,
                ]));
            case "launcher":
                return launcherOf(source.launcher, "ui" in source);
            case "notifications":
                return notifications;
            case "assistant":
                return assistantOf(source.assistant, new Map(entities.map((name) => [name, nameableKeysOf(sources.get(name))])), new Set(skillFiles.map((file) => file.replace(/\.SKILL\.md$/, ""))));
            default:
                return source[key];
        }
    };
    const manifest = Object.fromEntries(MANIFEST_MEMBERS.filter((key) => !OPTIONAL_MEMBERS.has(key) || key in source || key === "exports").map((key) => [key, valueOf(key)]));
    checkReferences(objects, manifest);
    return renderFiles(manifest, objects);
}
export function writePackage(options, packageDir) {
    return writeFiles(packageDir, buildPackage(options));
}
//# sourceMappingURL=build.js.map