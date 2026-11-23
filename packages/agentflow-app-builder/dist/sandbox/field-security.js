import fs from "node:fs";
import path from "node:path";
import { CliError } from "../errors.js";
import { isRecord, Refusal } from "../platform.js";
import { nearest } from "../suggest.js";
import { fieldSecurityOf } from "./spec.js";
const SEE = `the release skill's reference/sandbox-json.md, "Field security"`;
const didYouMean = (name, candidates) => {
    const near = nearest(name, candidates);
    return near ? `; did you mean ${near}?` : "";
};
const invalid = (field, message) => new CliError("SANDBOX_SPEC_INVALID", `sandbox.json: ${field}: ${message}`, ["sandbox.json"]);
function listsOf(member) {
    return [
        ...member.profiles.map((profile, i) => ({ at: `field_security.profiles[${i}].fields`, list: profile.fields })),
        { at: "field_security.secure", list: member.secure },
    ];
}
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const keysIn = (dir) => fs.existsSync(dir) ? fs.readdirSync(dir).filter((file) => file.endsWith(".json")).map((file) => file.slice(0, -".json".length)).sort() : [];
function packaged(cwd) {
    const root = path.join(cwd, "package", "objects");
    if (!fs.existsSync(root))
        return undefined;
    try {
        const fields = new Map(keysIn(path.join(root, "entity")).map((entity) => [entity, new Set()]));
        let recommended = 0;
        for (const name of keysIn(path.join(root, "entity_field"))) {
            const split = name.indexOf("__");
            if (split === -1)
                continue;
            const entity = name.slice(0, split);
            if (!fields.has(entity))
                fields.set(entity, new Set());
            fields.get(entity).add(name.slice(split + 2));
            const body = readJson(path.join(root, "entity_field", `${name}.json`));
            if (isRecord(body) && body.recommendedSecured === true)
                recommended++;
        }
        const manifest = readJson(path.join(cwd, "package", "manifest.json"));
        const prefix = isRecord(manifest) && typeof manifest.id === "string" ? `${manifest.id.replace(/[/-]/g, "_")}__` : "";
        const extensionRecommended = [];
        for (const name of keysIn(path.join(root, "entity_extension"))) {
            const body = readJson(path.join(root, "entity_extension", `${name}.json`));
            const declared = isRecord(body) && Array.isArray(body.fields) ? body.fields : [];
            for (const field of declared) {
                if (isRecord(field) && field.recommendedSecured === true && typeof field.key === "string")
                    extensionRecommended.push(`${prefix}${field.key}`);
            }
        }
        return { fields, recommended, agents: keysIn(path.join(root, "agent")), extensionRecommended };
    }
    catch {
        return undefined;
    }
}
// What package/ can already tell of field_security, before anything is installed: a field of one of the package's
// entities that the entity does not have, and an agent the package does not ship, are refused; "recommended" naming
// nothing is a warning. A path whose entity is not the package's own is left to deploy, which reads the installation.
export function fieldSecurityFindings(spec, cwd) {
    const member = fieldSecurityOf(spec);
    const found = { problem: null, warnings: [] };
    const pkg = member ? packaged(cwd) : undefined;
    if (!member || !pkg)
        return found;
    for (const { at, list } of listsOf(member)) {
        for (const written of list.paths) {
            const [entity, field] = written.split(".");
            const own = pkg.fields.get(entity);
            if (own && !own.has(field)) {
                found.problem = { field: at, message: `\`${written}\`: the package's entity ${entity} has no field ${field}${didYouMean(field, [...own])}` };
                return found;
            }
        }
        if (list.recommended && pkg.recommended === 0) {
            found.warnings.push(`${at}: the package marks no field recommendedSecured, so recommended names none`);
        }
        if (list.recommended && pkg.extensionRecommended.length) {
            found.warnings.push(`${at}: recommended leaves out the extension fields the package marks recommendedSecured (${pkg.extensionRecommended.join(", ")}): name each as <entity>.<installed key> (${SEE})`);
        }
    }
    for (const [i, profile] of member.profiles.entries()) {
        for (const agent of profile.agents) {
            if (pkg.agents.includes(agent))
                continue;
            const has = pkg.agents.length ? `it ships ${pkg.agents.join(", ")}` : "it ships none";
            found.problem = { field: `field_security.profiles[${i}].agents`, message: `\`${agent}\` is not one of the package's agents (${has})${didYouMean(agent, pkg.agents)}` };
            return found;
        }
    }
    return found;
}
export function requireFieldSecurityFits(spec, cwd) {
    const { problem, warnings } = fieldSecurityFindings(spec, cwd);
    if (problem)
        throw invalid(problem.field, problem.message);
    return warnings;
}
const COMPUTED = new Set(["formula", "rollup"]);
const PROFILE_NAME_TAKEN = "FIELD_ACCESS_PROFILE_NAME_TAKEN";
// AgentFlow refuses to secure a field while an unsecured formula on its entity, or an unsecured rollup on another, reads
// it, and names that reader. Securing the reader lifts the refusal.
const READER_UNSECURED = new Set(["ENTITY_FORMULA_SENSITIVE_INPUT", "ROLLUP_SOURCE_IN_USE"]);
const enc = encodeURIComponent;
const unsupported = (what) => new CliError("SANDBOX_FIELD_SECURITY_UNSUPPORTED", `this AgentFlow has no ${what}, which field_security needs: deploy to an AgentFlow that has them, or leave field_security out of sandbox.json`, ["sandbox.json"]);
async function readOrOld(owner, at, what) {
    try {
        return (await owner.get(at)).body;
    }
    catch (error) {
        if (error instanceof Refusal && error.code === "ROUTE_NOT_FOUND")
            throw unsupported(what);
        throw error;
    }
}
// Every field the organization has, named as sandbox.json names it: by the installed app's key for the entity where the
// app has one, else by the entity's own key.
async function readCatalog(owner, entityKeys) {
    const body = await readOrOld(owner, "/field-access/fields", "published field access operations");
    if (!Array.isArray(body.entities))
        throw owner.unexpected("a field list without entities");
    const catalog = new Map();
    for (const entity of body.entities) {
        if (!isRecord(entity) || typeof entity.entity_id !== "string" || !Array.isArray(entity.fields))
            continue;
        const named = entityKeys.get(entity.entity_id) ?? String(entity.entity_key);
        const fields = new Map();
        for (const field of entity.fields) {
            if (!isRecord(field) || typeof field.key !== "string")
                continue;
            fields.set(field.key, {
                entityId: entity.entity_id,
                key: field.key,
                path: `${named}.${field.key}`,
                computed: COMPUTED.has(String(field.field_type)),
                secured: field.secured === true,
                recommendedBy: (Array.isArray(field.recommended_by) ? field.recommended_by : []).flatMap((app) => isRecord(app) && typeof app.installation_id === "string" ? [app.installation_id] : []),
            });
        }
        catalog.set(entity.entity_id, fields);
    }
    return catalog;
}
async function readAgents(owner, installationId) {
    const body = await readOrOld(owner, `/app-installations/${enc(installationId)}/agents`, "list of an installed app's agents");
    if (!Array.isArray(body.agents))
        throw owner.unexpected("an agents answer without agents");
    const agents = new Map();
    for (const agent of body.agents) {
        if (isRecord(agent) && typeof agent.logical_key === "string" && typeof agent.id === "string") {
            agents.set(agent.logical_key.replace(/^agent:/, ""), agent.id);
        }
    }
    return agents;
}
function storedOf(owner, body) {
    if (typeof body.id !== "string" || typeof body.name !== "string" || typeof body.updated_at !== "string") {
        throw owner.unexpected("a profile without id, name or updated_at");
    }
    const fields = (Array.isArray(body.fields) ? body.fields : []).flatMap((g) => isRecord(g) && typeof g.entity_id === "string" && typeof g.field_key === "string"
        ? [{ entity_id: g.entity_id, field_key: g.field_key, can_create: g.can_create === true, can_update: g.can_update === true }]
        : []);
    const holders = (Array.isArray(body.holders) ? body.holders : []).flatMap((h) => isRecord(h) && typeof h.kind === "string" && typeof h.id === "string" ? [{ kind: h.kind, id: h.id }] : []);
    return { id: body.id, name: body.name, description: typeof body.description === "string" ? body.description : null, updated_at: body.updated_at, fields, holders };
}
async function profilesByName(owner) {
    const { body } = await owner.get("/field-access/profiles");
    if (!Array.isArray(body.profiles))
        throw owner.unexpected("a profile list without profiles");
    return new Map(body.profiles.flatMap((p) => isRecord(p) && typeof p.name === "string" && typeof p.id === "string" && typeof p.updated_at === "string"
        ? [[p.name, { id: p.id, updatedAt: p.updated_at }]]
        : []));
}
const grantKey = (g) => `${g.entity_id}/${g.field_key}/${g.can_create}/${g.can_update}`;
const holderKey = (h) => `${h.kind}/${h.id}`;
const sameSet = (a, b) => {
    const left = new Set(a);
    return left.size === new Set(b).size && b.every((item) => left.has(item));
};
// The answer orders fields and holders its own way, so a profile is compared with what would be sent as two sets.
const sameContent = (a, b) => sameSet(a.fields.map(grantKey), b.fields.map(grantKey)) && sameSet(a.holders.map(holderKey), b.holders.map(holderKey));
const refused = (error, doing) => error instanceof Refusal ? new CliError(error.code, `field_security: ${doing}: ${error.message}`, ["sandbox.json"]) : error;
export function planFieldSecurity(state, member) {
    const replace = "; sandbox.json named it after the sandbox was made, and deploy --sandbox --replace makes one with it";
    const people = Object.fromEntries(Object.entries(state.people).map(([handle, person]) => [handle, person.user_id]));
    const pick = (map, key, at, noun) => {
        if (Object.hasOwn(map, key))
            return map[key];
        throw invalid(at, `the sandbox has no ${noun} ${key}${replace}`);
    };
    return {
        secure: member.secure,
        profiles: member.profiles.map((spec, i) => {
            const at = `field_security.profiles[${i}]`;
            return {
                spec,
                holders: [
                    ...spec.groups.map((key) => ({ kind: "group", id: pick(state.ids.groups, key, `${at}.groups`, "group") })),
                    ...spec.people.map((handle) => ({ kind: "user", id: pick(people, handle, `${at}.people`, "person") })),
                    ...spec.principals.map((key) => ({ kind: "service_principal", id: pick(state.ids.principals, key, `${at}.principals`, "principal") })),
                ],
            };
        }),
    };
}
class Resolver {
    installationId;
    entityIds;
    catalog;
    agentIds;
    constructor(installationId, entityIds, catalog, agentIds) {
        this.installationId = installationId;
        this.entityIds = entityIds;
        this.catalog = catalog;
        this.agentIds = agentIds;
    }
    fields(list, at) {
        const found = new Map();
        if (list.recommended) {
            for (const fields of this.catalog.values()) {
                for (const field of fields.values())
                    if (field.recommendedBy.includes(this.installationId))
                        found.set(`${field.entityId}/${field.key}`, field);
            }
        }
        for (const written of list.paths) {
            const field = this.field(written, at);
            found.set(`${field.entityId}/${field.key}`, field);
        }
        return [...found.values()];
    }
    field(written, at) {
        const [entity, key] = written.split(".");
        const entityId = this.entityIds.get(entity);
        if (entityId === undefined) {
            throw invalid(at, `\`${written}\`: the installed app has no entity ${entity}, of its own or one it requires${didYouMean(entity, [...this.entityIds.keys()])}`);
        }
        const fields = this.catalog.get(entityId);
        const field = fields?.get(key);
        if (!field)
            throw invalid(at, `\`${written}\`: entity ${entity} has no field ${key}${didYouMean(key, [...(fields?.keys() ?? [])])}`);
        return field;
    }
    agents(profile, at) {
        return profile.agents.map((key) => {
            const id = this.agentIds.get(key);
            if (id !== undefined)
                return { kind: "agent", id };
            const has = this.agentIds.size ? `it holds ${[...this.agentIds.keys()].join(", ")}` : "it holds none";
            throw invalid(`${at}.agents`, `the installed app has no agent ${key} (${has})${didYouMean(key, [...this.agentIds.keys()])}`);
        });
    }
}
// The entity ids the installed app names by its own keys, from its recorded objects.
const entityIdsOf = (objects) => new Map(Object.entries(objects).flatMap(([key, id]) => (key.startsWith("entity:") ? [[key.slice("entity:".length), id]] : [])));
// Securing a field asks what to do with each profile that grants a formula reading it. A profile sandbox.json names is
// replaced whole right after, so it gets the field when it will grant it, and loses those formulas otherwise.
function securing(field, wanted) {
    const grantTo = [];
    const removeFrom = [];
    for (const w of wanted) {
        if (!w.existing)
            continue;
        const grants = w.content.fields.some((g) => g.entity_id === field.entityId && g.field_key === field.key);
        (grants ? grantTo : removeFrom).push(w.existing.id);
    }
    return { secured: true, ...(grantTo.length ? { grant_to: grantTo } : {}), ...(removeFrom.length ? { remove_readers_from: removeFrom } : {}) };
}
// Secures each field, a formula or rollup before the fields it reads: a field refused while an unsecured reader reads it
// is tried again after the others, until a pass secures nothing.
async function secureReadersFirst(owner, fields, wanted) {
    const secured = [];
    let pending = fields;
    while (pending.length) {
        const waiting = [];
        for (const field of pending) {
            try {
                await owner.putJson(`/field-access/entities/${enc(field.entityId)}/secured?field_key=${enc(field.key)}`, securing(field, wanted));
                secured.push(field.path);
            }
            catch (error) {
                if (!(error instanceof Refusal && READER_UNSECURED.has(error.code)))
                    throw refused(error, `securing ${field.path}`);
                waiting.push({ field, refusal: error });
            }
        }
        if (waiting.length === pending.length)
            throw readersLeftUnsecured(waiting);
        pending = waiting.map(({ field }) => field);
    }
    return secured;
}
function readersLeftUnsecured(waiting) {
    const one = waiting.length === 1;
    return new CliError(waiting[0].refusal.code, [
        `field_security: AgentFlow refused to secure ${one ? "this field" : "these fields"}, since a formula or rollup sandbox.json does not secure reads ${one ? "it" : "each"}:`,
        ...waiting.map(({ field, refusal }) => `  ${field.path}: ${refusal.message}`),
        "secure each formula or rollup named there too, in field_security.secure or a profile's fields, and deploy secures it before the fields it reads",
    ].join("\n"), ["sandbox.json"]);
}
// Makes the organization's field security what sandbox.json's field_security says, as the sandbox's owner: secures each
// field it names, then creates each profile it names or replaces it whole. A second run changes nothing. It never
// unsecures a field, and never touches a profile sandbox.json does not name.
export async function applyFieldSecurity(owner, installation, plan) {
    const entityIds = entityIdsOf(installation.objects);
    const entityKeys = new Map([...entityIds].map(([key, id]) => [id, key]));
    const catalog = await readCatalog(owner, entityKeys);
    const agents = plan.profiles.some(({ spec }) => spec.agents.length) ? await readAgents(owner, installation.id) : new Map();
    const resolver = new Resolver(installation.id, entityIds, catalog, agents);
    const toSecure = new Map();
    const take = (fields) => {
        for (const field of fields)
            toSecure.set(`${field.entityId}/${field.key}`, field);
        return fields;
    };
    take(resolver.fields(plan.secure, "field_security.secure"));
    const resolved = plan.profiles.map(({ spec, holders }, i) => {
        const at = `field_security.profiles[${i}]`;
        const write = spec.access === "read_write";
        const fields = take(resolver.fields(spec.fields, `${at}.fields`)).map((field) => ({ entity_id: field.entityId, field_key: field.key, can_create: write && !field.computed, can_update: write && !field.computed }));
        return { spec, content: { fields, holders: [...holders, ...resolver.agents(spec, at)] } };
    });
    const existing = await profilesByName(owner);
    const wanted = resolved.map((r) => ({ ...r, existing: existing.get(r.spec.name) }));
    const secured = await secureReadersFirst(owner, [...toSecure.values()].filter((field) => !field.secured), wanted);
    const profiles = [];
    for (const w of wanted) {
        try {
            profiles.push(await converge(owner, w));
        }
        catch (error) {
            throw refused(error, `saving profile ${w.spec.name}`);
        }
    }
    return { secured, profiles };
}
async function converge(owner, w) {
    let existing = w.existing;
    if (existing === undefined) {
        try {
            const { body } = await owner.postJson("/field-access/profiles", { name: w.spec.name, ...w.content });
            return { name: w.spec.name, id: storedOf(owner, body).id, outcome: "created" };
        }
        catch (error) {
            if (!(error instanceof Refusal && error.code === PROFILE_NAME_TAKEN))
                throw error;
            existing = (await profilesByName(owner)).get(w.spec.name);
            if (existing === undefined)
                throw error;
        }
    }
    const id = existing.id;
    const stored = storedOf(owner, (await owner.get(`/field-access/profiles/${enc(id)}`)).body);
    // Securing moves the updated_at of a profile it grants the field to or takes a formula from.
    if (sameContent(stored, w.content))
        return { name: w.spec.name, id, outcome: stored.updated_at === existing.updatedAt ? "unchanged" : "updated" };
    await owner.putJson(`/field-access/profiles/${enc(id)}`, {
        name: w.spec.name,
        description: stored.description,
        ...w.content,
        expected_updated_at: stored.updated_at,
    });
    return { name: w.spec.name, id, outcome: "updated" };
}
export function outcomeLine(outcome) {
    const parts = [];
    const n = outcome.secured.length;
    if (n)
        parts.push(`secured ${n} ${n === 1 ? "field" : "fields"}`);
    for (const verb of ["created", "updated"]) {
        const names = outcome.profiles.filter((p) => p.outcome === verb).map((p) => p.name);
        if (names.length)
            parts.push(`${verb} ${names.length === 1 ? "profile" : "profiles"} ${names.join(", ")}`);
    }
    return parts.length ? `field security: ${parts.join("; ")}` : "field security: already as sandbox.json sets it";
}
//# sourceMappingURL=field-security.js.map