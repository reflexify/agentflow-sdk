import fs from "node:fs";
import path from "node:path";
import { agentObject, skillObject } from "./assets.js";
import { dashboardObject } from "./dashboard.js";
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
const jsonStems = (configDir, where) => {
    const dir = path.join(configDir, where);
    if (!fs.existsSync(dir))
        return [];
    const names = fs.readdirSync(dir).filter((f) => !f.startsWith("."));
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
    const entities = entityKeys(configDir, entityOrder);
    const agents = jsonStems(configDir, "agents");
    const dashboards = jsonStems(configDir, "dashboards");
    const params = new Map(source.parameters.map((p) => [p.key, p.type]));
    const sources = new Map(entities.map((key) => [key, entitySource(configDir, key)]));
    for (const key of entities) {
        const entity = entityObjects(configDir, key, entities, params, sources);
        objects.push(...entity.objects);
        grants.push(...entity.grants);
    }
    const skillDir = path.join(configDir, "skills");
    const skillFiles = fs.existsSync(skillDir) ? fs.readdirSync(skillDir).filter((f) => !f.startsWith(".")).sort() : [];
    for (const name of skillFiles)
        if (!name.endsWith(".SKILL.md"))
            refuse("skills", "", `${name} is not a .SKILL.md file`);
    for (const file of skillFiles)
        objects.push(skillObject(configDir, file));
    for (const key of agents)
        objects.push(agentObject(configDir, key));
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