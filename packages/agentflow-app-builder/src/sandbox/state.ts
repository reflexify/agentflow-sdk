import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { CliError } from "../errors.js";

export type ChatConnection = { public_key: string; identity_secret?: string; origins: string[] };
export type ChatSession = { token: string; expires_at: string; verified_email?: string };

export type SandboxState = {
  version: 1;
  url: string;
  id: string;
  name: string;
  created_at: string;
  expires_at: string;
  deploy_key: string;
  owner: string;
  people: Record<string, { user_id: string; token: string }>;
  ids: {
    groups: Record<string, string>;
    units: Record<string, string>;
    principals: Record<string, string>;
    connections: Record<string, string>;
    // Absent in an answer from an AgentFlow build older than SLA policies in sandbox.json.
    sla_policies?: Record<string, string>;
    // Absent in an answer from an AgentFlow build older than escalation policies in sandbox.json.
    escalation_policies?: Record<string, string>;
  };
  install: { parameters: Record<string, unknown>; decisions: unknown };
  spec_sha256?: string;
  installation: null | {
    id: string;
    deployment_id: string;
    package_id: string;
    version: string;
    armed: string[];
    objects: Record<string, string>;
    parameters: Record<string, unknown>;
  };
  chat?: Record<string, ChatConnection>;
  chat_sessions?: Record<string, Record<string, ChatSession>>;
};

export const STATE_FILE = ".agentflow/sandbox.json";
const IGNORE_LINE = "/.agentflow/";
const IGNORES = new Set([".agentflow/", "/.agentflow/", ".agentflow", "/.agentflow"]);

type Rec = Record<string, unknown>;
const isRec = (value: unknown): value is Rec => typeof value === "object" && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === "string";
const stringMap = (value: unknown): boolean => isRec(value) && Object.values(value).every(isString);
const filled = (value: unknown): boolean => isString(value) && value !== "";
const mapOf = (value: unknown, each: (item: Rec) => boolean): boolean =>
  isRec(value) && Object.values(value).every((item) => isRec(item) && each(item));

const isChat = (chat: Rec): boolean =>
  filled(chat.public_key) &&
  (chat.identity_secret === undefined || filled(chat.identity_secret)) &&
  Array.isArray(chat.origins) && chat.origins.length > 0 && chat.origins.every(isString);
const isSession = (session: Rec): boolean =>
  filled(session.token) && isString(session.expires_at) && (session.verified_email === undefined || isString(session.verified_email));

function shapeProblem(value: unknown): string | null {
  if (!isRec(value)) return "not an object";
  for (const member of ["id", "name", "created_at", "expires_at", "deploy_key", "owner"]) {
    if (!isString(value[member]) || value[member] === "") return `${member} is not a string`;
  }
  const people = value.people;
  if (!isRec(people) || !Object.values(people).every((p) => isRec(p) && isString(p.user_id) && isString(p.token) && p.token !== "")) return "people is not a map of user_id and token";
  const ids = value.ids;
  if (!isRec(ids)) return "ids is not an object";
  for (const member of ["groups", "units", "principals", "connections"]) {
    if (!stringMap(ids[member])) return `ids.${member} is not a map of ids`;
  }
  for (const member of ["sla_policies", "escalation_policies"]) {
    if (ids[member] !== undefined && !stringMap(ids[member])) return `ids.${member} is not a map of ids`;
  }
  const install = value.install;
  if (!isRec(install) || !isRec(install.parameters) || !("decisions" in install)) return "install is not parameters and decisions";
  if (value.chat !== undefined && !mapOf(value.chat, isChat)) return "chat is not a map of public_key, identity_secret and origins";
  if (value.chat_sessions !== undefined && !mapOf(value.chat_sessions, (threads) => mapOf(threads, isSession))) {
    return "chat_sessions is not a map of threads, each a token and expires_at";
  }
  return null;
}

export function refuseTracked(cwd: string): void {
  let tracked: string;
  try {
    tracked = execFileSync("git", ["ls-files", "--", ".agentflow"], { cwd, stdio: ["ignore", "pipe", "ignore"] }).toString();
  } catch {
    return;
  }
  if (tracked.trim()) {
    throw new CliError(
      "SANDBOX_STATE_TRACKED",
      "git tracks files under .agentflow/, which holds the sandbox's keys: run `git rm -r --cached .agentflow`, commit that, and run this again",
      [".agentflow"],
    );
  }
}

const stateInvalid = (why: string): CliError =>
  new CliError(
    "SANDBOX_STATE_INVALID",
    `${STATE_FILE} is not a sandbox state file this version reads (${why}): delete the sandbox it names with pnpm exec agentflow-app sandbox delete --id <id>, then remove the file`,
    [STATE_FILE],
  );

export function readState(cwd: string): SandboxState | null {
  let raw: string;
  try {
    raw = fs.readFileSync(path.join(cwd, STATE_FILE), "utf8");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return null;
    throw stateInvalid(`cannot read it: ${code ?? "error"}`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw stateInvalid("not JSON");
  }
  if (!isRec(parsed) || parsed.version !== 1) throw stateInvalid("not version 1");
  const problem = shapeProblem(parsed) ?? (isString(parsed.url) ? null : "url is not a string");
  if (problem) throw stateInvalid(problem);
  if (!Object.hasOwn(parsed.people as Rec, parsed.owner as string)) throw stateInvalid("owner is not one of people");
  if (parsed.installation !== null && !isRec(parsed.installation)) throw stateInvalid("installation is neither null nor an object");
  if (parsed.spec_sha256 !== undefined && !isString(parsed.spec_sha256)) throw stateInvalid("spec_sha256 is not a string");
  return parsed as SandboxState;
}

export function requireState(cwd: string): SandboxState {
  const state = readState(cwd);
  if (!state) {
    throw new CliError(
      "SANDBOX_STATE_MISSING",
      `no ${STATE_FILE} in ${cwd}: make a sandbox with the app installed in it with pnpm exec agentflow-app deploy --sandbox (sandbox create makes one without the app), or run this where you did`,
      [STATE_FILE],
    );
  }
  return state;
}

const ignoreFailed = (file: string, verb: "read" | "write", code: string | undefined): CliError =>
  new CliError(
    "SANDBOX_STATE_TRACKED",
    `${file}: cannot ${verb} it (${code ?? "error"}), so .agentflow/ cannot be kept out of git; fix the file's permissions`,
    [".gitignore"],
  );

export function ignoreFolder(cwd: string): void {
  const file = path.join(cwd, ".gitignore");
  let current = "";
  try {
    current = fs.readFileSync(file, "utf8");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw ignoreFailed(file, "read", code);
  }
  if (current.split("\n").some((line) => IGNORES.has(line.trim()))) return;
  const lead = current === "" || current.endsWith("\n") ? "" : "\n";
  try {
    fs.writeFileSync(file, `${current}${lead}${IGNORE_LINE}\n`);
  } catch (error) {
    throw ignoreFailed(file, "write", (error as NodeJS.ErrnoException).code);
  }
}

export const tempPathFor = (file: string): string => `${file}.tmp-${process.pid}`;

export function writeState(cwd: string, state: SandboxState): void {
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
  } catch (error) {
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
function removeAbandoned(file: string): void {
  const seen = fs.statSync(file, { bigint: true, throwIfNoEntry: false });
  if (seen === undefined || Date.now() - Number(seen.mtimeMs) <= LOCK_ABANDONED_MS) return;
  const marker = `${file}.break-${seen.ino}-${seen.mtimeNs}`;
  try {
    fs.closeSync(fs.openSync(marker, "wx", 0o600));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    removeAbandoned(marker);
    return;
  }
  try {
    const now = fs.statSync(file, { bigint: true, throwIfNoEntry: false });
    if (now !== undefined && now.ino === seen.ino && now.mtimeNs === seen.mtimeNs) fs.rmSync(file, { force: true });
  } finally {
    fs.rmSync(marker, { force: true });
  }
}

export async function updateState(cwd: string, change: (state: SandboxState) => SandboxState): Promise<void> {
  const lock = path.join(cwd, `${STATE_FILE}.lock`);
  for (;;) {
    try {
      fs.closeSync(fs.openSync(lock, "wx", 0o600));
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    }
    removeAbandoned(lock);
    await delay(LOCK_RETRY_MS);
  }
  try {
    writeState(cwd, change(requireState(cwd)));
  } finally {
    fs.rmSync(lock, { force: true });
  }
}

export function removeState(cwd: string): void {
  fs.rmSync(path.join(cwd, STATE_FILE), { force: true });
}

export function stateFromCreated(url: string, created: Record<string, unknown>): SandboxState {
  const problem = shapeProblem(created);
  if (problem) {
    throw new CliError(
      "DEPLOY_UNREACHABLE",
      `${url} answered, but not as AgentFlow does for a new sandbox (${problem}): the sandbox may exist, so check pnpm exec agentflow-app sandbox list`,
    );
  }
  const { id, name, created_at, expires_at, deploy_key, owner, people, ids, install, chat } = created as Rec;
  return {
    version: 1,
    url,
    id: id as string,
    name: name as string,
    created_at: created_at as string,
    expires_at: expires_at as string,
    deploy_key: deploy_key as string,
    owner: owner as string,
    people: people as SandboxState["people"],
    ids: ids as SandboxState["ids"],
    install: install as SandboxState["install"],
    installation: null,
    ...(chat === undefined ? {} : { chat: chat as SandboxState["chat"] }),
  };
}
