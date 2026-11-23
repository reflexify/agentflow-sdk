import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { CliError } from "../errors.js";
export const STATE_FILE = ".agentflow/sandbox.json";
const IGNORE_LINE = "/.agentflow/";
const IGNORES = new Set([".agentflow/", "/.agentflow/", ".agentflow", "/.agentflow"]);
const isRec = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const isString = (value) => typeof value === "string";
const stringMap = (value) => isRec(value) && Object.values(value).every(isString);
const filled = (value) => isString(value) && value !== "";
const mapOf = (value, each) => isRec(value) && Object.values(value).every((item) => isRec(item) && each(item));
const isChat = (chat) => filled(chat.public_key) &&
    (chat.identity_secret === undefined || filled(chat.identity_secret)) &&
    Array.isArray(chat.origins) && chat.origins.length > 0 && chat.origins.every(isString);
const isSession = (session) => filled(session.token) && isString(session.expires_at) && (session.verified_email === undefined || isString(session.verified_email));
function shapeProblem(value) {
    if (!isRec(value))
        return "not an object";
    for (const member of ["id", "name", "created_at", "expires_at", "deploy_key", "owner"]) {
        if (!isString(value[member]) || value[member] === "")
            return `${member} is not a string`;
    }
    const people = value.people;
    if (!isRec(people) || !Object.values(people).every((p) => isRec(p) && isString(p.user_id) && isString(p.token) && p.token !== ""))
        return "people is not a map of user_id and token";
    const ids = value.ids;
    if (!isRec(ids))
        return "ids is not an object";
    for (const member of ["groups", "units", "principals", "connections"]) {
        if (!stringMap(ids[member]))
            return `ids.${member} is not a map of ids`;
    }
    for (const member of ["sla_policies", "escalation_policies"]) {
        if (ids[member] !== undefined && !stringMap(ids[member]))
            return `ids.${member} is not a map of ids`;
    }
    const install = value.install;
    if (!isRec(install) || !isRec(install.parameters) || !("decisions" in install))
        return "install is not parameters and decisions";
    if (value.chat !== undefined && !mapOf(value.chat, isChat))
        return "chat is not a map of public_key, identity_secret and origins";
    if (value.chat_sessions !== undefined && !mapOf(value.chat_sessions, (threads) => mapOf(threads, isSession))) {
        return "chat_sessions is not a map of threads, each a token and expires_at";
    }
    return null;
}
export function refuseTracked(cwd) {
    let tracked;
    try {
        tracked = execFileSync("git", ["ls-files", "--", ".agentflow"], { cwd, stdio: ["ignore", "pipe", "ignore"] }).toString();
    }
    catch {
        return;
    }
    if (tracked.trim()) {
        throw new CliError("SANDBOX_STATE_TRACKED", "git tracks files under .agentflow/, which holds the sandbox's keys: run `git rm -r --cached .agentflow`, commit that, and run this again", [".agentflow"]);
    }
}
const stateInvalid = (why) => new CliError("SANDBOX_STATE_INVALID", `${STATE_FILE} is not a sandbox state file this version reads (${why}): delete the sandbox it names with pnpm exec agentflow-app sandbox delete --id <id>, then remove the file`, [STATE_FILE]);
export function readState(cwd) {
    let raw;
    try {
        raw = fs.readFileSync(path.join(cwd, STATE_FILE), "utf8");
    }
    catch (error) {
        const code = error.code;
        if (code === "ENOENT")
            return null;
        throw stateInvalid(`cannot read it: ${code ?? "error"}`);
    }
    let parsed;
    try {
        parsed = JSON.parse(raw);
    }
    catch {
        throw stateInvalid("not JSON");
    }
    if (!isRec(parsed) || parsed.version !== 1)
        throw stateInvalid("not version 1");
    const problem = shapeProblem(parsed) ?? (isString(parsed.url) ? null : "url is not a string");
    if (problem)
        throw stateInvalid(problem);
    if (!Object.hasOwn(parsed.people, parsed.owner))
        throw stateInvalid("owner is not one of people");
    if (parsed.installation !== null && !isRec(parsed.installation))
        throw stateInvalid("installation is neither null nor an object");
    if (parsed.spec_sha256 !== undefined && !isString(parsed.spec_sha256))
        throw stateInvalid("spec_sha256 is not a string");
    return parsed;
}
export function requireState(cwd) {
    const state = readState(cwd);
    if (!state) {
        throw new CliError("SANDBOX_STATE_MISSING", `no ${STATE_FILE} in ${cwd}: make a sandbox with the app installed in it with pnpm exec agentflow-app deploy --sandbox (sandbox create makes one without the app), or run this where you did`, [STATE_FILE]);
    }
    return state;
}
const ignoreFailed = (file, verb, code) => new CliError("SANDBOX_STATE_TRACKED", `${file}: cannot ${verb} it (${code ?? "error"}), so .agentflow/ cannot be kept out of git; fix the file's permissions`, [".gitignore"]);
export function ignoreFolder(cwd) {
    const file = path.join(cwd, ".gitignore");
    let current = "";
    try {
        current = fs.readFileSync(file, "utf8");
    }
    catch (error) {
        const code = error.code;
        if (code !== "ENOENT")
            throw ignoreFailed(file, "read", code);
    }
    if (current.split("\n").some((line) => IGNORES.has(line.trim())))
        return;
    const lead = current === "" || current.endsWith("\n") ? "" : "\n";
    try {
        fs.writeFileSync(file, `${current}${lead}${IGNORE_LINE}\n`);
    }
    catch (error) {
        throw ignoreFailed(file, "write", error.code);
    }
}
export const tempPathFor = (file) => `${file}.tmp-${process.pid}`;
export function writeState(cwd, state) {
    const file = path.join(cwd, STATE_FILE);
    const dir = path.dirname(file);
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    fs.chmodSync(dir, 0o700);
    ignoreFolder(cwd);
    const temp = tempPathFor(file);
    fs.rmSync(temp, { force: true });
    try {
        fs.writeFileSync(temp, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
        fs.renameSync(temp, file);
    }
    catch (error) {
        fs.rmSync(temp, { force: true });
        throw error;
    }
}
const LOCK_RETRY_MS = 10;
const LOCK_ABANDONED_MS = 10_000;
// The lock and the break marker are each held only across synchronous code, so a file older than LOCK_ABANDONED_MS
// belongs to a process that died holding it. Several callers can judge the same file abandoned, and one that removed it
// late would remove the lock another had just taken. So only the caller that creates the marker named for that file
// removes it, and only if the path still holds that file: a new lock never has an abandoned one's modification time.
function removeAbandoned(file) {
    const seen = fs.statSync(file, { bigint: true, throwIfNoEntry: false });
    if (seen === undefined || Date.now() - Number(seen.mtimeMs) <= LOCK_ABANDONED_MS)
        return;
    const marker = `${file}.break-${seen.ino}-${seen.mtimeNs}`;
    try {
        fs.closeSync(fs.openSync(marker, "wx", 0o600));
    }
    catch (error) {
        if (error.code !== "EEXIST")
            throw error;
        removeAbandoned(marker);
        return;
    }
    try {
        const now = fs.statSync(file, { bigint: true, throwIfNoEntry: false });
        if (now !== undefined && now.ino === seen.ino && now.mtimeNs === seen.mtimeNs)
            fs.rmSync(file, { force: true });
    }
    finally {
        fs.rmSync(marker, { force: true });
    }
}
export async function updateState(cwd, change) {
    const lock = path.join(cwd, `${STATE_FILE}.lock`);
    for (;;) {
        try {
            fs.closeSync(fs.openSync(lock, "wx", 0o600));
            break;
        }
        catch (error) {
            if (error.code !== "EEXIST")
                throw error;
        }
        removeAbandoned(lock);
        await delay(LOCK_RETRY_MS);
    }
    try {
        writeState(cwd, change(requireState(cwd)));
    }
    finally {
        fs.rmSync(lock, { force: true });
    }
}
export function removeState(cwd) {
    fs.rmSync(path.join(cwd, STATE_FILE), { force: true });
}
export function stateFromCreated(url, created) {
    const problem = shapeProblem(created);
    if (problem) {
        throw new CliError("DEPLOY_UNREACHABLE", `${url} answered, but not as AgentFlow does for a new sandbox (${problem}): the sandbox may exist, so check pnpm exec agentflow-app sandbox list`);
    }
    const { id, name, created_at, expires_at, deploy_key, owner, people, ids, install, chat } = created;
    return {
        version: 1,
        url,
        id: id,
        name: name,
        created_at: created_at,
        expires_at: expires_at,
        deploy_key: deploy_key,
        owner: owner,
        people: people,
        ids: ids,
        install: install,
        installation: null,
        ...(chat === undefined ? {} : { chat: chat }),
    };
}
//# sourceMappingURL=state.js.map