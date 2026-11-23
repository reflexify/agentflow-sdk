import { createHmac, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { hideSecret, stringFlag, stringFlags, usage } from "../command.js";
import { sleepFor } from "../deploy.js";
import { CliError } from "../errors.js";
import { isRecord, OFFLINE_CHECKS, Platform, Refusal } from "../platform.js";
import { openInBrowser } from "./browser.js";
import { requireFieldSecurityFits } from "./field-security.js";
import { requireParametersFit } from "./parameters.js";
import { readSpec, requireValidSpec, secretEnvs, serverSpec, specDigest } from "./spec.js";
import { ignoreFolder, readState, refuseTracked, removeState, requireState, STATE_FILE, stateFromCreated, updateState, writeState, } from "./state.js";
const ACTIONS = {
    check: ["json"],
    create: ["name", "ttl-days", "url", "json"],
    delete: ["id", "url", "json"],
    list: ["url", "json"],
    "mail-in": ["connection", "file", "url", "json"],
    "mail-out": ["connection", "url", "json"],
    "message-in": ["connection", "from", "thread-key", "text", "verified-email", "verified-phone", "file", "url", "json"],
    "message-out": ["connection", "thread-key", "follow", "url", "json"],
    "records-in": ["connection", "stream", "file", "url", "json"],
    "records-out": ["connection", "url", "json"],
    "record-status": ["connection", "external-ref", "status", "url", "json"],
    "record-remove": ["connection", "external-ref", "url", "json"],
    fire: ["trigger", "url", "json"],
    open: ["as", "url", "json"],
};
const check = async (_values, io) => {
    const spec = readSpec(io.cwd);
    requireValidSpec(spec);
    const warnings = [...requireParametersFit(spec, io.cwd), ...requireFieldSecurityFits(spec, io.cwd)];
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
    for (const chat of Object.values(state.chat ?? {}))
        if (chat.identity_secret)
            hideSecret(io, chat.identity_secret);
    for (const threads of Object.values(state.chat_sessions ?? {}))
        for (const session of Object.values(threads))
            hideSecret(io, session.token);
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
        usage(`${STATE_FILE} already names sandbox ${state.id}: pnpm exec agentflow-app deploy --sandbox installs into it; to start over, run pnpm exec agentflow-app sandbox delete first, or pnpm exec agentflow-app deploy --sandbox --replace`);
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
    const state = { ...stateFromCreated(platform.root, body), spec_sha256: specDigest(request.spec) };
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
// The decoded bytes of all of one message's attachments that the inject route takes.
export const MESSAGE_FILES_MAX_BYTES = 5 * 1024 * 1024;
// The request body the inject route takes (AgentFlow's INLINE_FILES_BODY_LIMIT): those files as base64, and a megabyte
// for the rest of the message.
const MESSAGE_BODY_MAX_BYTES = Math.ceil(MESSAGE_FILES_MAX_BYTES / 3) * 4 + 1024 * 1024;
const CONTENT_TYPES = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".txt": "text/plain",
    ".csv": "text/csv",
    ".json": "application/json",
    ".html": "text/html",
    ".xml": "application/xml",
    ".zip": "application/zip",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};
// Each file is sized before any is read, so files past the cap together are refused without reading one.
function attachments(values, cwd) {
    const cannot = (file, error) => {
        const cause = error instanceof Error ? error.message : String(error);
        return usage(`--file ${file} cannot be read: ${cause}`);
    };
    let total = 0;
    const files = stringFlags(values, "file").map((file) => {
        if (file === "")
            usage("--file needs a path");
        const at = path.resolve(cwd, file);
        try {
            total += fs.statSync(at).size;
        }
        catch (error) {
            cannot(file, error);
        }
        if (total > MESSAGE_FILES_MAX_BYTES)
            usage("the --file attachments add up to more than 5 MiB, which one message carries");
        return { file, at };
    });
    return files.map(({ file, at }) => {
        let bytes;
        try {
            bytes = fs.readFileSync(at);
        }
        catch (error) {
            return cannot(file, error);
        }
        const filename = path.basename(file);
        return {
            filename,
            content_type: CONTENT_TYPES[path.extname(filename).toLowerCase()] ?? "application/octet-stream",
            content_base64: bytes.toString("base64"),
        };
    });
}
function readInjectedMessage(values, cwd) {
    const from = stringFlag(values, "from");
    if (from === undefined || from.trim() === "")
        usage("sandbox message-in needs --from <sender>");
    const threadKey = stringFlag(values, "thread-key");
    if (threadKey !== undefined && threadKey.trim() === "")
        usage("--thread-key must not be blank: leave it out for the sender's own thread");
    const text = stringFlag(values, "text");
    // AgentFlow judges the address and the number and names either in its 422, so the rules live in one place.
    const verifiedEmail = stringFlag(values, "verified-email");
    const verifiedPhone = stringFlag(values, "verified-phone");
    const files = attachments(values, cwd);
    if ((text === undefined || text.trim() === "") && files.length === 0)
        usage("sandbox message-in needs --text <text>, a --file, or both");
    const message = {
        from,
        ...(threadKey === undefined ? {} : { thread_key: threadKey }),
        ...(text === undefined ? {} : { text }),
        ...(verifiedEmail === undefined ? {} : { verified_email: verifiedEmail }),
        ...(verifiedPhone === undefined ? {} : { verified_phone: verifiedPhone }),
        ...(files.length ? { attachments: files } : {}),
    };
    // The files are within their cap, so a body past the route's limit is the text's doing.
    if (Buffer.byteLength(JSON.stringify(message)) > MESSAGE_BODY_MAX_BYTES) {
        usage(`--text is too long: the message would be more than ${MESSAGE_BODY_MAX_BYTES} bytes, the most AgentFlow takes for one message`);
    }
    return message;
}
const messageIn = async (values, io) => {
    refuseTracked(io.cwd);
    const key = connectionKey(values, "message-in");
    // Whether the connection is a chat is in the state, so with none the flags cannot be judged for either kind.
    const state = requireState(io.cwd);
    const chat = chatOf(state, key);
    if (chat)
        return chatMessageIn(values, io, state, key, chat);
    const message = readInjectedMessage(values, io.cwd);
    const route = connectionPath(state, key, "messages");
    learn(io, state);
    const platform = parentPlatform(values, io);
    const { body } = await platform.postJson(route, message);
    if (typeof body.event_id !== "string" || typeof body.thread_id !== "string") {
        throw platform.unexpected("an injected message without event_id and thread_id");
    }
    return { data: body, text: [`recorded ${body.event_id} on thread ${body.thread_id}`] };
};
// One line per send: when, the thread, who it was addressed to (a reply names none), and its text on one line.
function sentMessageLine(send) {
    const to = isRecord(send.to) ? `  to ${String(send.to.value)}` : "";
    const text = typeof send.text === "string" ? `  ${send.text.replace(/\s+/g, " ")}` : "";
    return `${String(send.sent_at)}  thread ${String(send.thread_id)}${to}${text}`;
}
const messageOut = async (values, io) => {
    refuseTracked(io.cwd);
    const key = connectionKey(values, "message-out");
    const state = requireState(io.cwd);
    const chat = chatOf(state, key);
    if (chat)
        return values["follow"] === true ? followChat(values, io, state, key, chat) : chatMessagesOut(values, io, state, key, chat);
    const route = connectionPath(state, key, "messages-out");
    if (values["follow"] === true)
        usage(`${key} is not a chat connection, and only a chat thread has a live stream for --follow to print`);
    if (stringFlag(values, "thread-key") !== undefined) {
        usage(`${key} is not a chat connection, and --thread-key names a chat thread: message-out on ${key} lists every thread`);
    }
    learn(io, state);
    const platform = parentPlatform(values, io);
    const { body } = await platform.get(route);
    if (!Array.isArray(body.sends) || !body.sends.every(isRecord))
        throw platform.unexpected("a messages-out list without sends");
    const text = body.sends.map(sentMessageLine);
    return { data: { sends: body.sends }, text: text.length ? text : ["nothing sent"] };
};
const DEFAULT_THREAD = "default";
const CHAT_PAGE = 100;
const IDENTITY_TOKEN_SECONDS = 300;
const CHAT_REFUSED_FLAGS = [
    ["from", "a chat visitor has no sender address: leave out --from, and prove an email with --verified-email"],
    ["file", "a chat visitor writes text only, so a chat connection takes no --file"],
    ["verified-phone", "a chat visitor proves an email, not a phone, so a chat connection takes no --verified-phone"],
];
const own = (map, key) => map !== undefined && Object.hasOwn(map, key) ? map[key] : undefined;
const chatOf = (state, key) => own(state.chat, key);
const chatPath = (chat, leaf) => `/chat/${encodeURIComponent(chat.public_key)}/${leaf}`;
const visitor = (parent, chat, key, token) => parent.as(token, `the chat connection ${key}`, { origin: chat.origins[0] });
function givenThreadKey(values) {
    const given = stringFlag(values, "thread-key");
    if (given !== undefined && given.trim() === "")
        usage("--thread-key must not be blank: leave it out for the default thread");
    return given;
}
const noChatYet = (key, threadKey) => threadKey === undefined
    ? `no chat on ${key} yet: run sandbox message-in --connection ${key} first`
    : `no chat on thread ${threadKey} of ${key} yet: run sandbox message-in --connection ${key} --thread-key ${threadKey} first`;
// A site's identity token for `email`, signed as a website's server signs one: HS256 under the identity secret's text as
// it is, expiring within the ten minutes AgentFlow allows.
function identityToken(secret, email, now) {
    const part = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
    const claims = { sub: email, email, exp: Math.floor(now / 1000) + IDENTITY_TOKEN_SECONDS };
    const signed = `${part({ alg: "HS256", typ: "JWT" })}.${part(claims)}`;
    return `${signed}.${createHmac("sha256", secret).update(signed).digest("base64url")}`;
}
const chatEnded = (error) => error instanceof Refusal &&
    ((error.status === 401 && error.code === "CHAT_SESSION_INVALID") || (error.status === 409 && error.code === "MESSAGE_THREAD_CLOSED"));
async function chatMessageIn(values, io, recorded, key, chat) {
    for (const [flag, why] of CHAT_REFUSED_FLAGS)
        if (values[flag] !== undefined)
            usage(why);
    const text = stringFlag(values, "text");
    if (text === undefined || text.trim() === "")
        usage("sandbox message-in needs --text <text> on a chat connection");
    const threadKey = givenThreadKey(values) ?? DEFAULT_THREAD;
    const email = stringFlag(values, "verified-email");
    if (email !== undefined && chat.identity_secret === undefined) {
        usage(`${key} does not offer site verification, so --verified-email cannot be signed: add "site" to its settings.verify_methods in sandbox.json and make the sandbox again`);
    }
    learn(io, recorded);
    const parent = parentPlatform(values, io);
    const now = (io.now ?? Date.now)();
    const identity = email === undefined ? undefined : identityToken(chat.identity_secret, email, now);
    if (identity !== undefined)
        hideSecret(io, identity);
    const remember = (session) => updateState(io.cwd, (state) => ({
        ...state,
        chat_sessions: { ...state.chat_sessions, [key]: { ...own(state.chat_sessions, key), [threadKey]: session } },
    }));
    const open = async () => {
        const { body } = await visitor(parent, chat, key, null).postJson(chatPath(chat, "sessions"), identity === undefined ? {} : { identity_token: identity });
        if (typeof body.token !== "string" || body.token === "" || typeof body.expires_at !== "string") {
            throw parent.unexpected("a chat session without token and expires_at");
        }
        hideSecret(io, body.token);
        await remember({ token: body.token, expires_at: body.expires_at, ...(email === undefined ? {} : { verified_email: email }) });
        return visitor(parent, chat, key, body.token);
    };
    const reopen = async () => {
        const opened = await open();
        io.stderr.write(`the chat on thread ${threadKey} had ended; opened a new one\n`);
        return opened;
    };
    const clientMessageId = randomUUID();
    const post = async (as) => {
        const { body } = await as.postJson(chatPath(chat, "messages"), { text, client_message_id: clientMessageId });
        if (typeof body.position !== "number")
            throw parent.unexpected("a chat message without position");
        return body.position;
    };
    const stored = own(own(recorded.chat_sessions, key), threadKey);
    let position;
    let session = "opened";
    if (stored === undefined) {
        position = await post(await open());
    }
    else if (!(Date.parse(stored.expires_at) > now)) {
        position = await post(await reopen());
    }
    else {
        try {
            const as = visitor(parent, chat, key, stored.token);
            if (email !== undefined && email !== stored.verified_email) {
                await as.postJson(chatPath(chat, "session/identity"), { identity_token: identity });
                await remember({ ...stored, verified_email: email });
            }
            position = await post(as);
            session = "reused";
        }
        catch (error) {
            if (!chatEnded(error))
                throw error;
            position = await post(await reopen());
        }
    }
    return { data: { thread_key: threadKey, position, session }, text: [`posted at position ${position} on chat thread ${threadKey}`] };
}
function chatLine(threadKey, row) {
    const shown = typeof row.author_display === "string" && row.author_display !== "" ? ` (${row.author_display})` : "";
    return `${String(row.created_at)}  thread ${threadKey}  ${String(row.author)}${shown}  ${String(row.text).replace(/\s+/g, " ")}`;
}
async function chatMessagesOut(values, io, state, key, chat) {
    const only = givenThreadKey(values);
    const threads = own(state.chat_sessions, key) ?? {};
    const keys = only === undefined ? Object.keys(threads) : Object.hasOwn(threads, only) ? [only] : [];
    if (keys.length === 0)
        return { data: { messages: [] }, text: [noChatYet(key, only)] };
    learn(io, state);
    const parent = parentPlatform(values, io);
    const messages = [];
    const ended = [];
    const text = [];
    for (const threadKey of keys) {
        const as = visitor(parent, chat, key, threads[threadKey].token);
        const log = [];
        try {
            for (let after = 0;;) {
                const { body } = await as.get(`${chatPath(chat, "messages")}?after=${after}&limit=${CHAT_PAGE}`);
                const rows = body.messages;
                if (!Array.isArray(rows) || !rows.every((row) => isRecord(row) && typeof row.position === "number")) {
                    throw parent.unexpected("a chat log without messages");
                }
                log.push(...rows);
                if (rows.length < CHAT_PAGE)
                    break;
                after = rows.at(-1).position;
            }
        }
        catch (error) {
            if (!chatEnded(error))
                throw error;
            ended.push(threadKey);
            text.push(`thread ${threadKey}: its chat has ended, so its log cannot be read (${error.code}); message-in on it opens a new one`);
            continue;
        }
        for (const row of log) {
            messages.push({ thread_key: threadKey, ...row });
            text.push(chatLine(threadKey, row));
        }
    }
    return {
        data: { messages, ...(ended.length ? { ended_threads: ended } : {}) },
        text: text.length ? text : [`the chats on ${key} hold no messages yet`],
    };
}
const jsonOr = (data) => {
    try {
        return JSON.parse(data);
    }
    catch {
        return data;
    }
};
function streamLine(threadKey, event, data) {
    const value = jsonOr(data);
    if (!isRecord(value))
        return `${event}  ${data}`;
    if (event === "message")
        return chatLine(threadKey, value);
    if (event === "typing")
        return value.until === null || value.until === undefined ? "typing stopped" : `typing until ${String(value.until)}`;
    if (event === "closed")
        return `closed (${String(value.reason)})`;
    return `${event}  ${data}`;
}
const RECONNECT_WINDOW_MS = 30_000;
const STREAM_SETTLED_MS = 5_000;
const reconnectDelay = (attempt) => Math.min(250 * 2 ** attempt, 4_000);
const reconnectable = (error) => error instanceof Refusal ? error.status === 429 || error.status >= 500 : error instanceof CliError && error.code === "DEPLOY_UNREACHABLE";
// A stream that drops is opened again after the last message printed, as an EventSource would, so a restart of
// AgentFlow loses no message and prints none twice. An outage lasts until a stream prints something or stays open
// STREAM_SETTLED_MS, and one longer than RECONNECT_WINDOW_MS fails the follow.
async function followChat(values, io, state, key, chat) {
    const given = givenThreadKey(values);
    const threadKey = given ?? DEFAULT_THREAD;
    const session = own(own(state.chat_sessions, key), threadKey);
    if (session === undefined)
        usage(noChatYet(key, given));
    learn(io, state);
    const json = values["json"] === true;
    const as = visitor(parentPlatform(values, io), chat, key, session.token);
    const now = io.now ?? Date.now;
    const sleep = io.sleep ?? sleepFor;
    const never = new AbortController().signal;
    let lastId;
    let outageFrom;
    for (let attempt = 0;; attempt++) {
        let openedAt;
        let heard = false;
        try {
            const events = await as.events(chatPath(chat, "stream"), lastId);
            openedAt = now();
            for await (const { event, data, id } of events) {
                heard = true;
                lastId = id ?? lastId;
                io.stdout.write(`${json ? JSON.stringify({ event, data: jsonOr(data) }) : streamLine(threadKey, event, data)}\n`);
                if (event === "closed")
                    return { data: null, text: [], printed: true };
            }
        }
        catch (error) {
            if (outageFrom === undefined || !reconnectable(error))
                throw error;
        }
        const at = now();
        if (openedAt !== undefined && (outageFrom === undefined || heard || at - openedAt >= STREAM_SETTLED_MS)) {
            outageFrom = at;
            attempt = 0;
        }
        if (at - outageFrom >= RECONNECT_WINDOW_MS) {
            const after = lastId === undefined ? "" : ` after position ${lastId}`;
            throw new CliError("DEPLOY_UNREACHABLE", `the stream of chat thread ${threadKey} on ${key} dropped${after} and did not come back within ${RECONNECT_WINDOW_MS / 1000} s: check that AgentFlow is up, then run message-out --follow again`);
        }
        await sleep(reconnectDelay(attempt), never);
    }
}
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
function externalRef(values, action) {
    const ref = stringFlag(values, "external-ref");
    if (ref === undefined || ref === "")
        usage(`sandbox ${action} needs --external-ref <ref>, as records-out lists it`);
    return ref;
}
const writePath = (state, key, ref) => `${connectionPath(state, key, "records-out")}?external_ref=${encodeURIComponent(ref)}`;
// AgentFlow judges the status and refuses another with a 400 naming the ones it takes, so the set lives in one place.
const recordStatus = async (values, io) => {
    refuseTracked(io.cwd);
    const key = connectionKey(values, "record-status");
    const ref = externalRef(values, "record-status");
    const status = stringFlag(values, "status");
    if (status === undefined || status === "")
        usage("sandbox record-status needs --status <status>: draft, posted or cancelled");
    const state = requireState(io.cwd);
    const route = writePath(state, key, ref);
    learn(io, state);
    const platform = parentPlatform(values, io);
    const { body } = await platform.patchJson(route, { status });
    if (!isRecord(body.record))
        throw platform.unexpected("a bill without its record");
    return { data: body, text: [`${ref} reads back ${String(body.record.status)}`] };
};
const recordRemove = async (values, io) => {
    refuseTracked(io.cwd);
    const key = connectionKey(values, "record-remove");
    const ref = externalRef(values, "record-remove");
    const state = requireState(io.cwd);
    const route = writePath(state, key, ref);
    learn(io, state);
    const platform = parentPlatform(values, io);
    await platform.delete(route);
    return { data: { external_ref: ref, removed: true }, text: [`removed ${ref}: a read of it finds nothing`] };
};
// A trigger is named by its key in the package; its id is the one the installation's objects listed when deploy
// --sandbox recorded them, after arming.
function triggerId(state, key) {
    const objects = state.installation?.objects;
    if (!objects)
        usage("sandbox fire needs the installation that deploy --sandbox records: run pnpm exec agentflow-app deploy --sandbox first");
    const id = Object.hasOwn(objects, `trigger:${key}`) ? objects[`trigger:${key}`] : undefined;
    if (id === undefined) {
        const keys = Object.keys(objects).filter((k) => k.startsWith("trigger:")).map((k) => k.slice("trigger:".length));
        usage(`${key} is not one of the installation's triggers: ${keys.length ? keys.join(", ") : "it has none"}`);
    }
    return id;
}
const fire = async (values, io) => {
    refuseTracked(io.cwd);
    const key = stringFlag(values, "trigger");
    if (key === undefined || key === "")
        usage("sandbox fire needs --trigger <key>, the trigger's key in the package");
    const state = requireState(io.cwd);
    const id = triggerId(state, key);
    learn(io, state);
    const platform = parentPlatform(values, io);
    const { body } = await platform.postJson(`/sandboxes/${state.id}/triggers/${id}/fire`, {});
    if (typeof body.fire_id !== "string")
        throw platform.unexpected("a fire without fire_id");
    return { data: { trigger_id: id, fire_id: body.fire_id }, text: [`fired trigger:${key} (fire ${body.fire_id})`] };
};
const HANDLERS = {
    check, create, list, delete: remove, open, "mail-in": mailIn, "mail-out": mailOut, "message-in": messageIn, "message-out": messageOut,
    "records-in": recordsIn,
    "records-out": recordsOut,
    "record-status": recordStatus,
    "record-remove": recordRemove,
    fire,
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
        return usage("sandbox needs an action: create, delete, list, open, mail-in, mail-out, message-in, message-out, records-in, records-out, record-status, record-remove, fire or check");
    }
    refuseForeignFlags(action, values);
    const files = values["file"];
    if (Array.isArray(files) && action !== "message-in") {
        if (files.length > 1)
            usage(`sandbox ${action} takes one --file`);
        values = { ...values, file: files[0] };
    }
    const handler = HANDLERS[action];
    if (!handler)
        return usage(`sandbox ${action} is not available yet`);
    return handler(values, io, positionals);
};
//# sourceMappingURL=commands.js.map