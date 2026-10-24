import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { CliError } from "../errors.js";

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
  ids: { groups: Record<string, string>; units: Record<string, string>; principals: Record<string, string>; connections: Record<string, string> };
  install: { parameters: Record<string, unknown>; decisions: unknown };
  installation: null | {
    id: string;
    deployment_id: string;
    package_id: string;
    version: string;
    armed: string[];
    objects: Record<string, string>;
    parameters: Record<string, unknown>;
  };
};

export const STATE_FILE = ".agentflow/sandbox.json";
const IGNORE_LINE = "/.agentflow/";
const IGNORES = new Set([".agentflow/", "/.agentflow/", ".agentflow", "/.agentflow"]);

type Rec = Record<string, unknown>;
const isRec = (value: unknown): value is Rec => typeof value === "object" && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === "string";
const stringMap = (value: unknown): boolean => isRec(value) && Object.values(value).every(isString);

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
  const install = value.install;
  if (!isRec(install) || !isRec(install.parameters) || !("decisions" in install)) return "install is not parameters and decisions";
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
  return parsed as SandboxState;
}

export function requireState(cwd: string): SandboxState {
  const state = readState(cwd);
  if (!state) {
    throw new CliError(
      "SANDBOX_STATE_MISSING",
      `no ${STATE_FILE} in ${cwd}: make a sandbox with pnpm exec agentflow-app sandbox create, or run this where you did`,
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
  const { id, name, created_at, expires_at, deploy_key, owner, people, ids, install } = created as Rec;
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
  };
}
