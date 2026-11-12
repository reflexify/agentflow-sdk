import fs from "node:fs";
import path from "node:path";
import { hideSecret, stringFlag, usage } from "../command.js";
import { CliError } from "../errors.js";
import { isRecord, OFFLINE_CHECKS, Platform, Refusal } from "../platform.js";
import { openInBrowser } from "./browser.js";
import { requireParametersFit } from "./parameters.js";
import { readSpec, requireValidSpec, secretEnvs, serverSpec } from "./spec.js";
import { ignoreFolder, readState, refuseTracked, removeState, requireState, STATE_FILE, stateFromCreated, writeState, } from "./state.js";
const ACTIONS = {
    check: ["json"],
    create: ["name", "ttl-days", "url", "json"],
    delete: ["id", "url", "json"],
    list: ["url", "json"],
    "mail-in": ["connection", "file", "url", "json"],
    "mail-out": ["connection", "url", "json"],
    "records-in": ["connection", "stream", "file", "url", "json"],
    "records-out": ["connection", "url", "json"],
    open: ["as", "url", "json"],
};
const check = async (_values, io) => {
    const spec = readSpec(io.cwd);
    requireValidSpec(spec);
    const warnings = requireParametersFit(spec, io.cwd);
    return {
        data: { valid: true, ...(warnings.length ? { warnings } : {}) },
        text: ["sandbox.json is valid"],
        ...(warnings.length ? { note: warnings.map((line) => `warning: ${line}`).join("\n") } : {}),
    };
};
const NAME_MAX = 80;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const parentPlatform = (values, io) => Platform.configure(io.env ?? process.env, stringFlag(values, "url"), "AGENTFLOW_SANDBOX_KEY", OFFLINE_CHECKS);
export function learn(io, state) {
    hideSecret(io, state.deploy_key);
    for (const person of Object.values(state.people))
        hideSecret(io, person.token);
}
function ttlDays(values) {
    const given = stringFlag(values, "ttl-days");
    if (given === undefined)
        return undefined;
    const days = /^\d+$/.test(given) ? Number(given) : NaN;
    if (!(days >= 1 && days <= 30))
        usage("--ttl-days must be a whole number from 1 to 30");
    return days;
}
export const defaultName = (cwd) => path.basename(cwd).slice(0, NAME_MAX) || "app";
function sandboxName(values, cwd) {
    const given = stringFlag(values, "name");
    if (given === undefined)
        return defaultName(cwd);
    if (given.length < 1 || given.length > NAME_MAX)
        usage(`--name must be from 1 to ${NAME_MAX} characters`);
    return given;
}
function refuseLive(cwd) {
    const state = readState(cwd);
    if (!state)
        return;
    const expires = Date.parse(state.expires_at);
    if (Number.isNaN(expires) || expires > Date.now()) {
        usage(`${STATE_FILE} already names sandbox ${state.id}: run pnpm exec agentflow-app sandbox delete first, or pnpm exec agentflow-app deploy --sandbox, which replaces it`);
    }
}
export function readSecrets(spec, io) {
    const env = io.env ?? process.env;
    const secrets = {};
    for (const { key, env: name } of secretEnvs(spec)) {
        const secret = env[name];
        if (!secret)
            throw new CliError("SANDBOX_SECRET_MISSING", `${name} is not set: connection ${key} sends with it`);
        secrets[key] = secret;
        hideSecret(io, secret);
    }
    return secrets;
}
// The .gitignore line goes in before the sandbox exists: a write that fails afterwards would leave a live sandbox
// whose keys were never recorded.
export async function makeSandbox(platform, io, request) {
    ignoreFolder(io.cwd);
    const { body } = await platform.postJson("/sandboxes", request);
    const state = stateFromCreated(platform.root, body);
    learn(io, state);
    writeState(io.cwd, state);
    return state;
}
const create = async (values, io) => {
    refuseTracked(io.cwd);
    const spec = readSpec(io.cwd);
    requireValidSpec(spec);
    const secrets = readSecrets(spec, io);
    const days = ttlDays(values);
    const name = sandboxName(values, io.cwd);
    refuseLive(io.cwd);
    const platform = parentPlatform(values, io);
    const state = await makeSandbox(platform, io, { name, ...(days === undefined ? {} : { ttl_days: days }), spec: serverSpec(spec), secrets });
    const people = Object.keys(state.people);
    return {
        data: {
            id: state.id,
            name: state.name,
            created_at: state.created_at,
            expires_at: state.expires_at,
            owner: state.owner,
            people,
            state_file: STATE_FILE,
        },
        text: [
            `created sandbox ${state.name} (${state.id}), expires ${state.expires_at}`,
            `people: ${people.join(", ")}`,
            `keys written to ${STATE_FILE}`,
        ],
    };
};
const list = async (values, io) => {
    refuseTracked(io.cwd);
    let here;
    try {
        here = readState(io.cwd)?.id;
    }
    catch (error) {
        if (!(error instanceof CliError && error.code === "SANDBOX_STATE_INVALID"))
            throw error;
    }
    const platform = parentPlatform(values, io);
    const { body } = await platform.get("/sandboxes");
    if (!Array.isArray(body.sandboxes) || !body.sandboxes.every((item) => isRecord(item) && typeof item.id === "string")) {
        throw platform.unexpected("a sandbox list without sandboxes");
    }
    const sandboxes = body.sandboxes.map((item) => ({ ...item, this_folder: item.id === here }));
    const text = sandboxes.map((item) => `${item.id}  ${String(item.name)}  expires ${String(item.expires_at)}${item.this_folder ? "  (this folder)" : ""}`);
    return { data: { sandboxes }, text: text.length ? text : ["no live sandboxes"] };
};
// NOT_FOUND also answers a parent key from another organization, so the state
// file goes only once the sandbox's own deploy key is refused on the deployment
// that made it: the file holds the only copies of the sandbox people's tokens.
async function explainMissing(platform, state, io) {
    if (platform.root !== state.url) {
        io.stderr.write(`${STATE_FILE} names a sandbox made on ${state.url}, not ${platform.root}; kept ${STATE_FILE}\n`);
        return;
    }
    let status;
    try {
        const answer = await platform.as(state.deploy_key, "the sandbox's deploy key").get("/caller");
        status = answer.status;
    }
    catch (error) {
        if (!(error instanceof Refusal))
            return;
        status = error.status;
    }
    if (status === 401) {
        removeState(io.cwd);
        io.stderr.write(`sandbox ${state.id} is gone from ${platform.root}; removed ${STATE_FILE}\n`);
    }
    else if (status === 200) {
        io.stderr.write(`sandbox ${state.id} is still live; AGENTFLOW_SANDBOX_KEY belongs to an organization that does not own it\n`);
    }
}
const remove = async (values, io) => {
    refuseTracked(io.cwd);
    const given = stringFlag(values, "id");
    if (given !== undefined && !UUID.test(given))
        usage("--id must be a sandbox id, as pnpm exec agentflow-app sandbox list shows it");
    let state;
    if (given === undefined) {
        state = requireState(io.cwd);
    }
    else {
        try {
            state = readState(io.cwd);
        }
        catch (error) {
            if (!(error instanceof CliError && error.code === "SANDBOX_STATE_INVALID"))
                throw error;
            state = null;
        }
    }
    if (state)
        learn(io, state);
    const id = given ?? state.id;
    const platform = parentPlatform(values, io);
    try {
        await platform.delete(`/sandboxes/${id}`);
    }
    catch (error) {
        if (given === undefined && state && error instanceof Refusal && error.status === 404 && error.code === "NOT_FOUND") {
            await explainMissing(platform, state, io);
        }
        throw error;
    }
    if (state?.id === id)
        removeState(io.cwd);
    return { data: { id, deleted: true }, text: [`deleted sandbox ${id}`] };
};
const open = async (values, io) => {
    refuseTracked(io.cwd);
    const state = requireState(io.cwd);
    const handle = stringFlag(values, "as");
    if (handle === undefined)
        usage("sandbox open needs --as <handle>");
    const handles = Object.keys(state.people);
    if (!handles.includes(handle))
        usage(`${handle} is not one of the sandbox's people: ${handles.join(", ")}`);
    learn(io, state);
    const platform = parentPlatform(values, io);
    const { body } = await platform.postJson(`/sandboxes/${state.id}/sign-in-links`, { handle });
    if (typeof body.url !== "string" || body.url === "" || typeof body.expires_at !== "string") {
        throw platform.unexpected("a sign-in link without url and expires_at");
    }
    hideSecret(io, body.url);
    try {
        await (io.openUrl ?? openInBrowser)(body.url);
    }
    catch (error) {
        const cause = error instanceof Error ? error.message : String(error);
        throw new CliError("SANDBOX_OPEN_FAILED", `no browser could be started (${cause}); the link was not shown and expires unused in 5 minutes`);
    }
    return {
        data: { handle, expires_at: body.expires_at },
        text: [`opened a sign-in for ${handle} in your browser (the link works once, until ${body.expires_at})`],
    };
};
function connectionKey(values, action) {
    const key = stringFlag(values, "connection");
    if (key === undefined || key === "")
        usage(`sandbox ${action} needs --connection <key>`);
    return key;
}
function connectionId(state, key) {
    const id = Object.hasOwn(state.ids.connections, key) ? state.ids.connections[key] : undefined;
    if (id === undefined) {
        const keys = Object.keys(state.ids.connections);
        usage(`${key} is not one of the sandbox's connections: ${keys.length ? keys.join(", ") : "it has none"}`);
    }
    return id;
}
function readMessage(values, cwd) {
    const file = stringFlag(values, "file");
    if (file === undefined || file === "")
        usage("sandbox mail-in needs --file <message.json>");
    let message;
    try {
        message = JSON.parse(fs.readFileSync(path.resolve(cwd, file), "utf8"));
    }
    catch (error) {
        const cause = error instanceof Error ? error.message : String(error);
        usage(`--file ${file} cannot be read as JSON: ${cause}`);
    }
    if (!isRecord(message))
        usage(`--file ${file} is not a JSON object`);
    return message;
}
const connectionPath = (state, key, leaf) => `/sandboxes/${state.id}/connections/${connectionId(state, key)}/${leaf}`;
const mailIn = async (values, io) => {
    refuseTracked(io.cwd);
    const key = connectionKey(values, "mail-in");
    const message = readMessage(values, io.cwd);
    const state = requireState(io.cwd);
    const route = connectionPath(state, key, "inbound");
    learn(io, state);
    const platform = parentPlatform(values, io);
    const { body } = await platform.postJson(route, message);
    if (typeof body.recorded !== "boolean")
        throw platform.unexpected("an injected message without recorded");
    const text = body.recorded ? "recorded" : `discarded (${String(body.reason)})`;
    return { data: body, text: [text] };
};
const mailOut = async (values, io) => {
    refuseTracked(io.cwd);
    const key = connectionKey(values, "mail-out");
    const state = requireState(io.cwd);
    const route = connectionPath(state, key, "sent");
    learn(io, state);
    const platform = parentPlatform(values, io);
    const { body } = await platform.get(route);
    if (!Array.isArray(body.sends) || !body.sends.every(isRecord))
        throw platform.unexpected("a sent list without sends");
    const text = body.sends.map((send) => `${String(send.sent_at)}  to ${String(send.to)}  ${String(send.subject)}  ${String(send.message_id ?? "")}`.trimEnd());
    return { data: { sends: body.sends }, text: text.length ? text : ["nothing sent"] };
};
// The inject route keeps the API's default request body limit (2 MiB) and takes at most 500 records, so a file is sent
// in batches under both; a little room is left for the stream and the brackets around the records.
export const RECORDS_PER_BATCH = 500;
export const BATCH_BYTES = 2 * 1024 * 1024 - 1024;
const STREAMS = ["company", "currency", "uom", "tax_code", "vendor", "item", "purchase_order", "goods_receipt", "vendor_bill"];
function readJson(values, cwd, action, what) {
    const file = stringFlag(values, "file");
    if (file === undefined || file === "")
        usage(`sandbox ${action} needs --file <${what}>`);
    try {
        return JSON.parse(fs.readFileSync(path.resolve(cwd, file), "utf8"));
    }
    catch (error) {
        const cause = error instanceof Error ? error.message : String(error);
        usage(`--file ${file} cannot be read as JSON: ${cause}`);
    }
}
// One entry of the file as the route takes it. An entry with a `record`, a `key` or `deleted` is already one; anything
// else is a bare canonical record. A record's key defaults to its `company_erp_id` (or "") and `erp_id`, and its stamp
// to its `source_changed_at`, which is what a connector stamps a version with.
function injected(entry, at) {
    if (!isRecord(entry))
        usage(`${at} is not a JSON object`);
    const wrapped = "record" in entry || "key" in entry || "deleted" in entry;
    const record = wrapped ? entry.record : entry;
    const deleted = wrapped && entry.deleted === true;
    const own = isRecord(record) ? record : undefined;
    const key = wrapped && entry.key !== undefined ? entry.key : own ? [own.company_erp_id ?? "", own.erp_id] : undefined;
    const stamp = wrapped && entry.stamp !== undefined ? entry.stamp : own?.source_changed_at;
    if (key === undefined)
        usage(`${at} has no key, and no record to take it from: write "key": [company_erp_id or "", erp_id]`);
    if (stamp === undefined || stamp === null) {
        usage(`${at} has no stamp, and its record no source_changed_at: write "stamp" as an RFC 3339 time`);
    }
    return { key, stamp, ...(deleted ? { deleted: true } : {}), ...(deleted ? {} : { record }) };
}
function readRecords(values, cwd) {
    const file = readJson(values, cwd, "records-in", "records.json");
    const flag = stringFlag(values, "stream");
    const given = isRecord(file) ? file.stream : undefined;
    if (given !== undefined && typeof given !== "string")
        usage("--file: stream is not a string");
    if (flag !== undefined && given !== undefined && flag !== given)
        usage(`--stream ${flag} and the file's stream ${given} differ`);
    const stream = flag ?? given;
    if (stream === undefined)
        usage("sandbox records-in needs --stream <stream>, or a file with a stream");
    if (!STREAMS.includes(stream))
        usage(`${stream} is not a stream of a sandbox ERP connection: ${STREAMS.join(", ")}`);
    const entries = Array.isArray(file) ? file : isRecord(file) && Array.isArray(file.records) ? file.records : undefined;
    if (!entries)
        usage("--file holds neither a list of records nor { stream, records }");
    return { stream, records: entries.map((entry, i) => injected(entry, `records[${i}]`)) };
}
// The records in order, cut into batches of at most RECORDS_PER_BATCH and BATCH_BYTES each.
export function batchesOf(stream, records) {
    const overhead = Buffer.byteLength(JSON.stringify({ stream, records: [] }));
    const batches = [];
    let batch = [];
    let bytes = overhead;
    records.forEach((record, i) => {
        const size = Buffer.byteLength(JSON.stringify(record)) + 1;
        if (overhead + size > BATCH_BYTES)
            usage(`records[${i}] is ${size} bytes, more than one request to AgentFlow carries`);
        if (batch.length === RECORDS_PER_BATCH || bytes + size > BATCH_BYTES) {
            batches.push(batch);
            batch = [];
            bytes = overhead;
        }
        batch.push(record);
        bytes += size;
    });
    if (batch.length)
        batches.push(batch);
    return batches;
}
const recordsIn = async (values, io) => {
    refuseTracked(io.cwd);
    const key = connectionKey(values, "records-in");
    const { stream, records } = readRecords(values, io.cwd);
    const state = requireState(io.cwd);
    const route = connectionPath(state, key, "records");
    learn(io, state);
    const platform = parentPlatform(values, io);
    const batches = batchesOf(stream, records);
    const answers = [];
    const text = [];
    for (const [i, batch] of batches.entries()) {
        const { body } = await platform.postJson(route, { stream, records: batch });
        if (typeof body.recorded !== "number" || !Array.isArray(body.event_ids))
            throw platform.unexpected("an injection without recorded and event_ids");
        answers.push({ recorded: body.recorded, event_ids: body.event_ids });
        const from = batches.slice(0, i).reduce((sum, earlier) => sum + earlier.length, 0);
        text.push(`records ${from + 1}-${from + batch.length}: recorded ${body.recorded}, ${batch.length - body.recorded} already there`);
    }
    const recorded = answers.reduce((sum, answer) => sum + answer.recorded, 0);
    if (batches.length === 0)
        text.push("no records in the file");
    return { data: { stream, sent: records.length, recorded, batches: answers }, text };
};
const recordsOut = async (values, io) => {
    refuseTracked(io.cwd);
    const key = connectionKey(values, "records-out");
    const state = requireState(io.cwd);
    const route = connectionPath(state, key, "records-out");
    learn(io, state);
    const platform = parentPlatform(values, io);
    const { body } = await platform.get(route);
    if (!Array.isArray(body.writes) || !body.writes.every(isRecord))
        throw platform.unexpected("a records-out list without writes");
    const text = body.writes.map((write) => `${String(write.written_at)}  ${String(write.object_type)}  ${String(write.external_ref)}  ${String(write.erp_id)}`);
    return { data: { writes: body.writes }, text: text.length ? text : ["nothing written"] };
};
const HANDLERS = {
    check, create, list, delete: remove, open, "mail-in": mailIn, "mail-out": mailOut, "records-in": recordsIn, "records-out": recordsOut,
};
function refuseForeignFlags(action, values) {
    const taken = ACTIONS[action];
    for (const [flag, value] of Object.entries(values)) {
        if (value !== undefined && !taken.includes(flag))
            usage(`sandbox ${action} takes no --${flag}`);
    }
}
export const sandboxCommand = async (values, io, positionals) => {
    const action = positionals[0];
    if (action === undefined || !Object.hasOwn(ACTIONS, action)) {
        return usage("sandbox needs an action: create, delete, list, open, mail-in, mail-out, records-in, records-out or check");
    }
    refuseForeignFlags(action, values);
    const handler = HANDLERS[action];
    if (!handler)
        return usage(`sandbox ${action} is not available yet`);
    return handler(values, io, positionals);
};
//# sourceMappingURL=commands.js.map