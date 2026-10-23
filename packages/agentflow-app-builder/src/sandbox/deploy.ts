import { randomBytes } from "node:crypto";
import path from "node:path";
import type { Writable } from "node:stream";
import { stringFlag, usage, type Io, type Outcome, type Values } from "../command.js";
import { createDeployment, deploymentOf, endedMessage, readSealed, releaseOf, sealedFile, statusWord, waitFor } from "../deploy.js";
import { CliError } from "../errors.js";
import { requireFresh, requireUiEntry } from "../package-checks.js";
import { isRecord, Refusal, type Platform } from "../platform.js";
import { canonicalJson } from "../seal/canonical.js";
import { keyFromSeed } from "../seal/keys.js";
import { readPayloadDir } from "../seal/payload.js";
import { sign } from "../seal/seal.js";
import { defaultName, learn, makeSandbox, parentPlatform, readSecrets } from "./commands.js";
import { sandboxDecisions } from "./decisions.js";
import { readSpec, requireValidSpec } from "./spec.js";
import { ignoreFolder, readState, refuseTracked, removeState, writeState, type SandboxState } from "./state.js";

export const INSTALL_WAIT_MS = 300_000;

type Installation = NonNullable<SandboxState["installation"]>;

const STALLED =
  `the install is still running after ${INSTALL_WAIT_MS / 1000} s. If the API answers approvals but a worker does not run installs, ` +
  "check that a worker serves the default queue and that its APP_GRANT_SOURCE_WRITES_ENABLED matches the API's; the sandbox stays for inspection";

async function sealedBytes(values: Values, io: Io, say: (line: string) => void): Promise<{ bytes: Buffer; fileName: string }> {
  const given = stringFlag(values, "file");
  if (given !== undefined) {
    const file = sealedFile(io.cwd, given);
    return { bytes: readSealed(file), fileName: path.basename(file) };
  }
  await requireFresh(io.cwd);
  const files = readPayloadDir(path.join(io.cwd, "package"));
  requireUiEntry(files);
  const sealed = sign(files, keyFromSeed("sandbox", randomBytes(32)));
  say(`sealed ${sealed.id} ${sealed.version} with a key made for this deploy`);
  return { bytes: sealed.bytes, fileName: sealed.fileName };
}

async function deletePrevious(platform: Platform, io: Io, previous: SandboxState, say: (line: string) => void): Promise<void> {
  try {
    await platform.delete(`/sandboxes/${encodeURIComponent(previous.id)}`);
    say(`deleted the previous sandbox ${previous.id}`);
  } catch (error) {
    if (!(error instanceof Refusal && error.status === 404)) throw error;
    io.stderr.write(`the previous sandbox ${previous.id} is not one AgentFlow knows for this key; making a new one\n`);
  }
  removeState(io.cwd);
}

async function planAndApprove(owner: Platform, deploymentId: string, given: Record<string, unknown>): Promise<Record<string, unknown>> {
  const at = `/app-deployments/${encodeURIComponent(deploymentId)}`;
  const plan = async (decisions: Record<string, unknown>): Promise<{ plan: Record<string, unknown>; hash: string }> => {
    const { body } = await owner.postJson(`${at}/plan`, { decisions });
    if (!isRecord(body.plan) || typeof body.plan_hash !== "string") throw owner.unexpected("a plan without plan and plan_hash");
    return { plan: body.plan, hash: body.plan_hash };
  };
  const first = await plan(given);
  const decisions = sandboxDecisions(given, first.plan);
  const second = canonicalJson(decisions) === canonicalJson(given) ? first : await plan(decisions);
  const { body } = await owner.postJson(`${at}/approve`, { plan_hash: second.hash, decisions });
  return body;
}

async function arm(owner: Platform, installationId: string): Promise<{ armed: string[]; refused?: string }> {
  try {
    const { body } = await owner.postJson(`/app-installations/${encodeURIComponent(installationId)}/arm`, {});
    if (!Array.isArray(body.triggers) || !body.triggers.every((t) => typeof t === "string")) throw owner.unexpected("an arm answer without triggers");
    return { armed: body.triggers as string[] };
  } catch (error) {
    if (error instanceof Refusal && error.status === 409) return { armed: [], refused: `${error.code}: ${error.message}` };
    throw error;
  }
}

async function objectsOf(owner: Platform, installationId: string): Promise<Pick<Installation, "objects" | "parameters">> {
  const { body } = await owner.get(`/app-installations/${encodeURIComponent(installationId)}/objects`);
  if (!Array.isArray(body.objects)) throw owner.unexpected("an objects answer without objects");
  const objects: Record<string, string> = {};
  for (const item of body.objects) {
    if (isRecord(item) && typeof item.logical_key === "string" && typeof item.id === "string") objects[item.logical_key] = item.id;
  }
  return { objects, parameters: isRecord(body.parameters) ? body.parameters : {} };
}

export async function deploySandbox(values: Values, io: Io): Promise<Outcome> {
  if (values["parameters"] !== undefined || values["decisions"] !== undefined) {
    usage("deploy --sandbox takes its answers from sandbox.json (install.parameters and install.decisions), not --parameters or --decisions");
  }
  if (values["wait"]) usage("deploy --sandbox always waits; drop --wait");
  const json = values["json"] === true;
  const say = (stream: Writable, line: string): void => {
    if (!json) stream.write(`${line}\n`);
  };
  refuseTracked(io.cwd);
  const spec = readSpec(io.cwd);
  requireValidSpec(spec);
  const secrets = readSecrets(spec, io);
  const platform = parentPlatform(values, io);
  const previous = readState(io.cwd);
  if (previous) learn(io, previous);
  const { bytes, fileName } = await sealedBytes(values, io, (line) => say(io.stdout, line));

  ignoreFolder(io.cwd);
  if (previous) await deletePrevious(platform, io, previous, (line) => say(io.stdout, line));
  const state = await makeSandbox(platform, io, { name: defaultName(io.cwd), spec, secrets });
  say(io.stdout, `created sandbox ${state.name} (${state.id})`);

  const deployKey = platform.as(state.deploy_key, "the sandbox's deploy key");
  const uploaded = await deployKey.postPackage("/app-packages", bytes, fileName);
  const release = releaseOf(deployKey, uploaded.body);
  say(io.stdout, `uploaded ${release.package_id} ${release.version}`);
  const made = await createDeployment(deployKey, release, state.install.parameters);

  const ownerPerson = state.people[state.owner];
  if (!ownerPerson) {
    throw new CliError("DEPLOY_UNREACHABLE", `${state.url} named ${state.owner} as the sandbox's owner but gave it no token: the sandbox ${state.id} stays; check agentflow-app sandbox list`);
  }
  const owner = platform.as(ownerPerson.token, `the sandbox's ${state.owner}`);
  const given = isRecord(state.install.decisions) ? state.install.decisions : {};
  let approved: Record<string, unknown>;
  try {
    approved = await planAndApprove(owner, made.deployment_id, given);
  } catch (error) {
    if (!(error instanceof CliError)) throw error;
    const stays = `the sandbox stays: sign in with agentflow-app sandbox open --as ${state.owner} to see its setup page`;
    throw new CliError(error.code, `${error.message}\n${stays}`, error.files);
  }

  say(io.stderr, "installing; this usually takes a minute or two (300 s at most); Ctrl-C stops waiting, and the sandbox stays");
  const now = io.now ?? Date.now;
  const { deployment, stopped, stalled } = await waitFor(owner, deploymentOf(owner, approved), {
    sleep: io.sleep,
    onInterrupt: io.onInterrupt,
    progress: (line) => say(io.stderr, line),
    deadline: now() + INSTALL_WAIT_MS,
    now,
  });
  const sandbox = { id: state.id, name: state.name, expires_at: state.expires_at };
  if (stopped) {
    const note = `stopped waiting: deployment ${deployment.deployment_id} is ${statusWord(deployment.status)}; it goes on at ${deployment.approve_url}`;
    return { data: { sandbox, package: release, deployment: deployment.body, installation: null }, text: [], note, exit: 130 };
  }
  if (stalled) throw new CliError("DEPLOY_STALLED", STALLED);
  if (deployment.status !== "installed") throw new CliError("DEPLOY_FAILED", endedMessage(deployment));
  const installationId = deployment.body.installation_id;
  if (typeof installationId !== "string") throw owner.unexpected("an installed deployment without installation_id");

  const installation: Installation = {
    id: installationId,
    deployment_id: deployment.deployment_id,
    package_id: release.package_id,
    version: release.version,
    armed: [],
    objects: {},
    parameters: {},
  };
  writeState(io.cwd, { ...state, installation });
  const armed = values["no-arm"] ? { armed: [] } : await arm(owner, installationId);
  installation.armed = armed.armed;
  writeState(io.cwd, { ...state, installation });
  Object.assign(installation, await objectsOf(owner, installationId));
  writeState(io.cwd, { ...state, installation });

  const text = [
    `installed ${release.package_id} ${release.version} in sandbox ${state.name} (${state.id})`,
    values["no-arm"] ? "not armed (--no-arm)" : armed.refused ? "not armed: AgentFlow refused, as stderr says" : `armed ${armed.armed.length} triggers`,
  ];
  return {
    data: { sandbox, package: release, deployment: deployment.body, installation },
    text,
    ...(armed.refused ? { note: armed.refused, exit: 1 } : {}),
  };
}
