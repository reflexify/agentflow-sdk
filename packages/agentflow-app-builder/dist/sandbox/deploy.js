import { randomBytes } from "node:crypto";
import path from "node:path";
import { stringFlag, usage } from "../command.js";
import { createDeployment, deploymentOf, endedMessage, planWarningLines, readSealed, releaseOf, sealedFile, statusWord, waitFor } from "../deploy.js";
import { CliError } from "../errors.js";
import { requireFresh, requireUiEntry } from "../package-checks.js";
import { isRecord, Refusal } from "../platform.js";
import { canonicalJson } from "../seal/canonical.js";
import { keyFromSeed } from "../seal/keys.js";
import { readPayloadDir } from "../seal/payload.js";
import { sign } from "../seal/seal.js";
import { defaultName, learn, makeSandbox, parentPlatform, readSecrets } from "./commands.js";
import { sandboxDecisions } from "./decisions.js";
import { requireParametersFit } from "./parameters.js";
import { readSpec, requireValidSpec } from "./spec.js";
import { ignoreFolder, readState, refuseTracked, removeState, requireState, STATE_FILE, writeState } from "./state.js";
export const INSTALL_WAIT_MS = 300_000;
const STALLED = `the install is still running after ${INSTALL_WAIT_MS / 1000} s. If the API answers approvals but a worker does not run installs, ` +
    "check that a worker serves the default queue and that its APP_GRANT_SOURCE_WRITES_ENABLED matches the API's; the sandbox stays for inspection";
async function sealedBytes(values, io, say) {
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
async function deletePrevious(platform, io, previous, say) {
    try {
        await platform.delete(`/sandboxes/${encodeURIComponent(previous.id)}`);
        say(`deleted the previous sandbox ${previous.id}`);
    }
    catch (error) {
        if (!(error instanceof Refusal && error.status === 404))
            throw error;
        io.stderr.write(`the previous sandbox ${previous.id} is not one AgentFlow knows for this key; making a new one\n`);
    }
    removeState(io.cwd);
}
async function planAndApprove(owner, deploymentId, given) {
    const at = `/app-deployments/${encodeURIComponent(deploymentId)}`;
    const plan = async (decisions) => {
        const { body } = await owner.postJson(`${at}/plan`, { decisions });
        if (!isRecord(body.plan) || typeof body.plan_hash !== "string")
            throw owner.unexpected("a plan without plan and plan_hash");
        return { plan: body.plan, hash: body.plan_hash };
    };
    const first = await plan(given);
    const decisions = sandboxDecisions(given, first.plan);
    const second = canonicalJson(decisions) === canonicalJson(given) ? first : await plan(decisions);
    const { body } = await owner.postJson(`${at}/approve`, { plan_hash: second.hash, decisions });
    return { approved: body, warnings: planWarningLines(second.plan) };
}
async function arm(owner, installationId) {
    try {
        const { body } = await owner.postJson(`/app-installations/${encodeURIComponent(installationId)}/arm`, {});
        if (!Array.isArray(body.triggers) || !body.triggers.every((t) => typeof t === "string"))
            throw owner.unexpected("an arm answer without triggers");
        return { armed: body.triggers };
    }
    catch (error) {
        if (error instanceof Refusal && error.status === 409)
            return { armed: [], refused: `${error.code}: ${error.message}` };
        throw error;
    }
}
async function objectsOf(owner, installationId) {
    const { body } = await owner.get(`/app-installations/${encodeURIComponent(installationId)}/objects`);
    if (!Array.isArray(body.objects))
        throw owner.unexpected("an objects answer without objects");
    const objects = {};
    for (const item of body.objects) {
        if (isRecord(item) && typeof item.logical_key === "string" && typeof item.id === "string")
            objects[item.logical_key] = item.id;
    }
    return { objects, parameters: isRecord(body.parameters) ? body.parameters : {} };
}
const RAISE = "; raise version in the manifest, build, and deploy --sandbox --upgrade again";
// AgentFlow's refusals of a version the sandbox already holds, or one not above it.
const HELD = /^APP_(PACKAGE_VERSION_EXISTS|VERSION_NOT_NEWER)$/;
export async function deploySandbox(values, io) {
    if (values["parameters"] !== undefined || values["decisions"] !== undefined) {
        usage("deploy --sandbox takes its answers from sandbox.json (install.parameters and install.decisions), not --parameters or --decisions");
    }
    if (values["wait"])
        usage("deploy --sandbox always waits; drop --wait");
    const json = values["json"] === true;
    const say = (stream, line) => {
        if (!json)
            stream.write(`${line}\n`);
    };
    refuseTracked(io.cwd);
    if (values["upgrade"])
        return upgradeSandbox(values, io, say);
    const spec = readSpec(io.cwd);
    requireValidSpec(spec);
    const secrets = readSecrets(spec, io);
    const platform = parentPlatform(values, io);
    const previous = readState(io.cwd);
    if (previous)
        learn(io, previous);
    const { bytes, fileName } = await sealedBytes(values, io, (line) => say(io.stdout, line));
    if (stringFlag(values, "file") === undefined) {
        for (const line of requireParametersFit(spec, io.cwd))
            say(io.stderr, `warning: ${line}`);
    }
    ignoreFolder(io.cwd);
    if (previous)
        await deletePrevious(platform, io, previous, (line) => say(io.stdout, line));
    const state = await makeSandbox(platform, io, { name: defaultName(io.cwd), spec, secrets });
    say(io.stdout, `created sandbox ${state.name} (${state.id})`);
    return installInto(platform, io, state, bytes, fileName, values, say);
}
// The recorded sandbox keeps what was set by hand in it, and the answers AgentFlow resolved when it was made.
async function upgradeSandbox(values, io, say) {
    const state = requireState(io.cwd);
    learn(io, state);
    const { bytes, fileName } = await sealedBytes(values, io, (line) => say(io.stdout, line));
    const platform = parentPlatform(values, io);
    if (platform.root !== state.url) {
        throw new CliError("SANDBOX_ELSEWHERE", `${STATE_FILE} names a sandbox made on ${state.url}, not ${platform.root}: set AGENTFLOW_URL to ${state.url} to upgrade it; to start over on ${platform.root}, first run sandbox delete with AGENTFLOW_URL=${state.url}`, [STATE_FILE]);
    }
    let live;
    try {
        const { body } = await platform.get(`/sandboxes/${encodeURIComponent(state.id)}`);
        live = typeof body.state === "string" ? body.state : "in an unknown state";
    }
    catch (error) {
        if (!(error instanceof Refusal && error.status === 404))
            throw error;
        live = "gone";
    }
    if (live !== "live") {
        throw new CliError("SANDBOX_GONE", `the recorded sandbox ${state.id} is ${live}: deploy --sandbox without --upgrade makes a new one`, [STATE_FILE]);
    }
    try {
        return await installInto(platform, io, state, bytes, fileName, values, say);
    }
    catch (error) {
        if (!(error instanceof CliError && HELD.test(error.code)))
            throw error;
        throw new CliError(error.code, `${error.message}${RAISE}`, error.files);
    }
}
async function installInto(platform, io, state, bytes, fileName, values, say) {
    const deployKey = platform.as(state.deploy_key, "the sandbox's deploy key");
    const uploaded = await deployKey.postPackage("/app-packages", bytes, fileName);
    const release = releaseOf(deployKey, uploaded.body);
    say(io.stdout, `uploaded ${release.package_id} ${release.version}`);
    const made = await createDeployment(deployKey, release, state.install.parameters);
    const ownerPerson = state.people[state.owner];
    if (!ownerPerson) {
        throw new CliError("DEPLOY_UNREACHABLE", `${state.url} named ${state.owner} as the sandbox's owner but gave it no token: the sandbox ${state.id} stays; check pnpm exec agentflow-app sandbox list`);
    }
    const owner = platform.as(ownerPerson.token, `the sandbox's ${state.owner}`);
    const given = isRecord(state.install.decisions) ? state.install.decisions : {};
    // An unchanged package replays the deployment it made before, which is past approval: wait on it instead.
    let approved = made.body;
    let warnings = [];
    try {
        if (made.status === "awaiting_approval")
            ({ approved, warnings } = await planAndApprove(owner, made.deployment_id, given));
    }
    catch (error) {
        if (!(error instanceof CliError))
            throw error;
        const stays = `the sandbox stays: sign in with pnpm exec agentflow-app sandbox open --as ${state.owner} to see its setup page`;
        throw new CliError(error.code, `${error.message}\n${stays}`, error.files);
    }
    for (const line of warnings)
        say(io.stderr, line);
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
        return { data: { sandbox, package: release, deployment: deployment.body, installation: null, plan_warnings: warnings }, text: [], note, exit: 130 };
    }
    if (stalled)
        throw new CliError("DEPLOY_STALLED", STALLED);
    if (deployment.status !== "installed")
        throw new CliError("DEPLOY_FAILED", endedMessage(deployment));
    const installationId = deployment.body.installation_id;
    if (typeof installationId !== "string")
        throw owner.unexpected("an installed deployment without installation_id");
    const installation = {
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
    // The deployment knows what it replaced; the state file may be behind it.
    const was = typeof deployment.body.from_version === "string" ? deployment.body.from_version : undefined;
    // A replay of a deployment that had already finished installed nothing in this run.
    const what = made.status === "installed"
        ? `${release.package_id} ${release.version} was already installed`
        : was === undefined
            ? `installed ${release.package_id} ${release.version}`
            : `upgraded ${release.package_id} ${was} to ${release.version}`;
    const text = [
        `${what} in sandbox ${state.name} (${state.id})`,
        values["no-arm"] ? "not armed (--no-arm)" : armed.refused ? "not armed: AgentFlow refused, as stderr says" : `armed ${armed.armed.length} triggers`,
    ];
    return {
        data: { sandbox, package: release, deployment: deployment.body, installation, plan_warnings: warnings },
        text,
        ...(armed.refused ? { note: armed.refused, exit: 1 } : {}),
    };
}
//# sourceMappingURL=deploy.js.map