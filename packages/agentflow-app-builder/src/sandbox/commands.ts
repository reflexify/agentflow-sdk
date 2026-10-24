import path from "node:path";
import { hideSecret, stringFlag, usage, type Handler, type Io, type Values } from "../command.js";
import { CliError } from "../errors.js";
import { isRecord, Platform, Refusal } from "../platform.js";
import { openInBrowser } from "./browser.js";
import { requireParametersFit } from "./parameters.js";
import { readSpec, requireValidSpec, secretEnvs, type SandboxSpec } from "./spec.js";
import {
  ignoreFolder, readState, refuseTracked, removeState, requireState, STATE_FILE, stateFromCreated, writeState, type SandboxState,
} from "./state.js";

const ACTIONS = {
  check: ["json"],
  create: ["name", "ttl-days", "url", "json"],
  delete: ["id", "url", "json"],
  list: ["url", "json"],
  open: ["as", "url", "json"],
} as const;

type Action = keyof typeof ACTIONS;

const check: Handler = async (_values, io) => {
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

export const parentPlatform = (values: Values, io: Io): Platform =>
  Platform.configure(io.env ?? process.env, stringFlag(values, "url"), "AGENTFLOW_SANDBOX_KEY");

export function learn(io: Io, state: SandboxState): void {
  hideSecret(io, state.deploy_key);
  for (const person of Object.values(state.people)) hideSecret(io, person.token);
}

function ttlDays(values: Values): number | undefined {
  const given = stringFlag(values, "ttl-days");
  if (given === undefined) return undefined;
  const days = /^\d+$/.test(given) ? Number(given) : NaN;
  if (!(days >= 1 && days <= 30)) usage("--ttl-days must be a whole number from 1 to 30");
  return days;
}

export const defaultName = (cwd: string): string => path.basename(cwd).slice(0, NAME_MAX) || "app";

function sandboxName(values: Values, cwd: string): string {
  const given = stringFlag(values, "name");
  if (given === undefined) return defaultName(cwd);
  if (given.length < 1 || given.length > NAME_MAX) usage(`--name must be from 1 to ${NAME_MAX} characters`);
  return given;
}

function refuseLive(cwd: string): void {
  const state = readState(cwd);
  if (!state) return;
  const expires = Date.parse(state.expires_at);
  if (Number.isNaN(expires) || expires > Date.now()) {
    usage(`${STATE_FILE} already names sandbox ${state.id}: run pnpm exec agentflow-app sandbox delete first, or pnpm exec agentflow-app deploy --sandbox, which replaces it`);
  }
}

export function readSecrets(spec: SandboxSpec, io: Io): Record<string, string> {
  const env = io.env ?? process.env;
  const secrets: Record<string, string> = {};
  for (const { key, env: name } of secretEnvs(spec)) {
    const secret = env[name];
    if (!secret) throw new CliError("SANDBOX_SECRET_MISSING", `${name} is not set: connection ${key} sends with it`);
    secrets[key] = secret;
    hideSecret(io, secret);
  }
  return secrets;
}

// The .gitignore line goes in before the sandbox exists: a write that fails afterwards would leave a live sandbox
// whose keys were never recorded.
export async function makeSandbox(platform: Platform, io: Io, request: Record<string, unknown>): Promise<SandboxState> {
  ignoreFolder(io.cwd);
  const { body } = await platform.postJson("/sandboxes", request);
  const state = stateFromCreated(platform.root, body);
  learn(io, state);
  writeState(io.cwd, state);
  return state;
}

const create: Handler = async (values, io) => {
  refuseTracked(io.cwd);
  const spec = readSpec(io.cwd);
  requireValidSpec(spec);
  const secrets = readSecrets(spec, io);
  const days = ttlDays(values);
  const name = sandboxName(values, io.cwd);
  refuseLive(io.cwd);
  const platform = parentPlatform(values, io);
  const state = await makeSandbox(platform, io, { name, ...(days === undefined ? {} : { ttl_days: days }), spec, secrets });
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

const list: Handler = async (values, io) => {
  refuseTracked(io.cwd);
  let here: string | undefined;
  try {
    here = readState(io.cwd)?.id;
  } catch (error) {
    if (!(error instanceof CliError && error.code === "SANDBOX_STATE_INVALID")) throw error;
  }
  const platform = parentPlatform(values, io);
  const { body } = await platform.get("/sandboxes");
  if (!Array.isArray(body.sandboxes) || !body.sandboxes.every((item) => isRecord(item) && typeof item.id === "string")) {
    throw platform.unexpected("a sandbox list without sandboxes");
  }
  const sandboxes = body.sandboxes.map((item) => ({ ...item, this_folder: item.id === here }));
  const text = sandboxes.map(
    (item) => `${item.id}  ${String(item.name)}  expires ${String(item.expires_at)}${item.this_folder ? "  (this folder)" : ""}`,
  );
  return { data: { sandboxes }, text: text.length ? text : ["no live sandboxes"] };
};

// NOT_FOUND also answers a parent key from another organization, so the state
// file goes only once the sandbox's own deploy key is refused on the deployment
// that made it: the file holds the only copies of the sandbox people's tokens.
async function explainMissing(platform: Platform, state: SandboxState, io: Io): Promise<void> {
  if (platform.root !== state.url) {
    io.stderr.write(`${STATE_FILE} names a sandbox made on ${state.url}, not ${platform.root}; kept ${STATE_FILE}\n`);
    return;
  }
  let status: number;
  try {
    const answer = await platform.as(state.deploy_key, "the sandbox's deploy key").get("/caller");
    status = answer.status;
  } catch (error) {
    if (!(error instanceof Refusal)) return;
    status = error.status;
  }
  if (status === 401) {
    removeState(io.cwd);
    io.stderr.write(`sandbox ${state.id} is gone from ${platform.root}; removed ${STATE_FILE}\n`);
  } else if (status === 200) {
    io.stderr.write(`sandbox ${state.id} is still live; AGENTFLOW_SANDBOX_KEY belongs to an organization that does not own it\n`);
  }
}

const remove: Handler = async (values, io) => {
  refuseTracked(io.cwd);
  const given = stringFlag(values, "id");
  if (given !== undefined && !UUID.test(given)) usage("--id must be a sandbox id, as pnpm exec agentflow-app sandbox list shows it");
  let state: SandboxState | null;
  if (given === undefined) {
    state = requireState(io.cwd);
  } else {
    try {
      state = readState(io.cwd);
    } catch (error) {
      if (!(error instanceof CliError && error.code === "SANDBOX_STATE_INVALID")) throw error;
      state = null;
    }
  }
  if (state) learn(io, state);
  const id = given ?? state!.id;
  const platform = parentPlatform(values, io);
  try {
    await platform.delete(`/sandboxes/${id}`);
  } catch (error) {
    if (given === undefined && state && error instanceof Refusal && error.status === 404 && error.code === "NOT_FOUND") {
      await explainMissing(platform, state, io);
    }
    throw error;
  }
  if (state?.id === id) removeState(io.cwd);
  return { data: { id, deleted: true }, text: [`deleted sandbox ${id}`] };
};

const open: Handler = async (values, io) => {
  refuseTracked(io.cwd);
  const state = requireState(io.cwd);
  const handle = stringFlag(values, "as");
  if (handle === undefined) usage("sandbox open needs --as <handle>");
  const handles = Object.keys(state.people);
  if (!handles.includes(handle)) usage(`${handle} is not one of the sandbox's people: ${handles.join(", ")}`);
  learn(io, state);
  const platform = parentPlatform(values, io);
  const { body } = await platform.postJson(`/sandboxes/${state.id}/sign-in-links`, { handle });
  if (typeof body.url !== "string" || body.url === "" || typeof body.expires_at !== "string") {
    throw platform.unexpected("a sign-in link without url and expires_at");
  }
  hideSecret(io, body.url);
  try {
    await (io.openUrl ?? openInBrowser)(body.url);
  } catch (error) {
    const cause = error instanceof Error ? error.message : String(error);
    throw new CliError(
      "SANDBOX_OPEN_FAILED",
      `no browser could be started (${cause}); the link was not shown and expires unused in 5 minutes`,
    );
  }
  return {
    data: { handle, expires_at: body.expires_at },
    text: [`opened a sign-in for ${handle} in your browser (the link works once, until ${body.expires_at})`],
  };
};

const HANDLERS: Partial<Record<Action, Handler>> = { check, create, list, delete: remove, open };

function refuseForeignFlags(action: Action, values: Values): void {
  const taken: readonly string[] = ACTIONS[action];
  for (const [flag, value] of Object.entries(values)) {
    if (value !== undefined && !taken.includes(flag)) usage(`sandbox ${action} takes no --${flag}`);
  }
}

export const sandboxCommand: Handler = async (values, io, positionals) => {
  const action = positionals[0];
  if (action === undefined || !Object.hasOwn(ACTIONS, action)) {
    return usage("sandbox needs an action: create, delete, list, open or check");
  }
  refuseForeignFlags(action as Action, values);
  const handler = HANDLERS[action as Action];
  if (!handler) return usage(`sandbox ${action} is not available yet`);
  return handler(values, io, positionals);
};
