import { randomBytes } from "node:crypto";
import path from "node:path";
import { stringFlag, usage } from "../command.js";
import { createDeployment, deploymentOf, endedMessage, planWarningLines, readSealed, recentDeployments, releaseOf, sealedFile, statusWord, waitFor, } from "../deploy.js";
import { CliError } from "../errors.js";
import { requireFresh, requireUiEntry } from "../package-checks.js";
import { isRecord, Refusal } from "../platform.js";
import { canonicalJson } from "../seal/canonical.js";
import { keyFromSeed } from "../seal/keys.js";
import { checkPayload, readPayloadDir } from "../seal/payload.js";
import { sayArchiveSigningWarnings } from "../signing-check.js";
import { sign } from "../seal/seal.js";
import { readZip } from "../seal/zip.js";
import { defaultName, learn, makeSandbox, parentPlatform, readSecrets } from "./commands.js";
import { onlyPackages, otherPackagesAnswered, packagesPlanned, sandboxDecisions } from "./decisions.js";
import { readDependencies } from "./dependencies.js";
import { applyFieldSecurity, outcomeLine, planFieldSecurity, requireFieldSecurityFits, } from "./field-security.js";
import { requireParametersFit } from "./parameters.js";
import { fieldSecurityOf, fieldSecurityProblem, readSpec, requireValidSpec, serverSpec, specDigest, } from "./spec.js";
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
    return { bytes: sealed.bytes, fileName: sealed.fileName, id: sealed.id };
}
function packageIdOf({ bytes, id }) {
    if (id !== undefined)
        return id;
    const manifest = readZip(bytes).get("manifest.json");
    return checkPayload(new Map(manifest ? [["manifest.json", manifest]] : [])).id;
}
const madeElsewhere = (state, root, verb) => new CliError("SANDBOX_ELSEWHERE", `${STATE_FILE} names a sandbox made on ${state.url}, not ${root}: set AGENTFLOW_URL to ${state.url} to ${verb} it; to start over on ${root}, first run sandbox delete with AGENTFLOW_URL=${state.url}`, [STATE_FILE]);
// AgentFlow answers 404 to a key of another organization, or of a sandbox, too, so the sandbox's own deploy key decides
// whether it is gone, and only its 401 says so: reading a live one as gone would replace the state file that holds its tokens.
async function requireGone(platform, state) {
    try {
        await platform.as(state.deploy_key, "the sandbox's deploy key").get("/caller");
    }
    catch (error) {
        if (error instanceof Refusal && error.status === 401)
            return;
        throw error;
    }
    throw new CliError("SANDBOX_KEY_MISMATCH", `AGENTFLOW_SANDBOX_KEY sees no sandbox ${state.name} (${state.id}), but the sandbox's own deploy key still works, so AGENTFLOW_SANDBOX_KEY is not a key of the organization that made it (it is another organization's, or a sandbox's own): set AGENTFLOW_SANDBOX_KEY to a key of the organization that made the sandbox; ${STATE_FILE} stays, with the sandbox's tokens`, [STATE_FILE]);
}
// ROUTE_NOT_FOUND is a deployment without sandboxes, not an answer about this one.
const unseen = (error) => error instanceof Refusal && error.status === 404 && error.code !== "ROUTE_NOT_FOUND";
async function liveness(platform, state) {
    let word;
    try {
        const { body } = await platform.get(`/sandboxes/${encodeURIComponent(state.id)}`);
        word = typeof body.state === "string" ? body.state : "in an unknown state";
    }
    catch (error) {
        if (!unseen(error))
            throw error;
        await requireGone(platform, state);
        word = "gone";
    }
    return word === "live" ? { live: true } : { live: false, word };
}
async function installedOnServer(platform, state, packageId) {
    const deployKey = platform.as(state.deploy_key, "the sandbox's deploy key");
    return (await recentDeployments(deployKey, packageId)).find((deployment) => deployment.status === "installed");
}
const specChanged = (state, spec) => state.spec_sha256 !== undefined && state.spec_sha256 !== specDigest(spec);
async function reusableRecorded(platform, io, previous, spec, sealed, say) {
    const live = await liveness(platform, previous);
    if (!live.live) {
        say(io.stdout, `the recorded sandbox ${previous.id} is ${live.word}; making a new one`);
        return undefined;
    }
    const named = `sandbox ${previous.name} (${previous.id})`;
    const packageId = packageIdOf(sealed);
    const held = await installedOnServer(platform, previous, packageId);
    const changed = specChanged(previous, spec);
    if (held) {
        throw new CliError("SANDBOX_HOLDS_PACKAGE", `${named} already holds ${packageId} ${String(held.body.version)}: deploy --sandbox --upgrade installs into it and keeps its records` +
            (changed ? ", with the answers recorded before sandbox.json changed" : "") +
            "; deploy --sandbox --replace deletes it and makes a new one from sandbox.json", [STATE_FILE]);
    }
    if (changed) {
        throw new CliError("SANDBOX_SPEC_CHANGED", `sandbox.json changed after ${named} was made, and an install into it sends the answers recorded then: deploy --sandbox --replace deletes it and makes a new one from sandbox.json; deploy --sandbox --upgrade installs into it with the recorded answers`, [STATE_FILE, "sandbox.json"]);
    }
    if (previous.spec_sha256 === undefined) {
        say(io.stderr, `${named} was made by an older agentflow-app, which recorded no sandbox.json to compare with; if sandbox.json changed since, deploy --sandbox --replace makes a new one from it`);
    }
    return previous;
}
async function makeInPlaceOf(platform, io, replaced, request, say) {
    ignoreFolder(io.cwd);
    if (replaced) {
        try {
            await platform.delete(`/sandboxes/${encodeURIComponent(replaced.id)}`);
            say(io.stdout, `deleted sandbox ${replaced.name} (${replaced.id}), as --replace asks`);
        }
        catch (error) {
            if (!unseen(error))
                throw error;
            await requireGone(platform, replaced);
            io.stderr.write(`the recorded sandbox ${replaced.id} is gone; making a new one\n`);
        }
        removeState(io.cwd);
    }
    const state = await makeSandbox(platform, io, request);
    say(io.stdout, `created sandbox ${state.name} (${state.id})`);
    return state;
}
async function planAndApprove(owner, deploymentId, recorded, packageId, note) {
    const at = `/app-deployments/${encodeURIComponent(deploymentId)}`;
    const plan = async (decisions) => {
        const { body } = await owner.postJson(`${at}/plan`, { decisions });
        if (!isRecord(body.plan) || typeof body.plan_hash !== "string")
            throw owner.unexpected("a plan without plan and plan_hash");
        return { plan: body.plan, hash: body.plan_hash };
    };
    // The package itself is always planned; whether a dependency is, only a plan asked with no answers can tell.
    let given = recorded;
    let first;
    if (otherPackagesAnswered(recorded, packageId).length) {
        const unanswered = await plan({});
        const planned = packagesPlanned(unanswered.plan);
        if (planned) {
            const { kept, dropped } = onlyPackages(recorded, planned);
            given = kept;
            for (const pkg of dropped)
                note(`${pkg} is not part of this install, as a dependency the sandbox already holds is not, so the answers for it recorded when the sandbox was made are not sent`);
        }
        if (canonicalJson(given) === canonicalJson({}))
            first = unanswered;
    }
    first ??= await plan(given);
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
    // An object of the app's own lists before a bound or exported one under the same key, and is the one it means.
    for (const item of body.objects) {
        if (isRecord(item) && typeof item.logical_key === "string" && typeof item.id === "string" && !Object.hasOwn(objects, item.logical_key)) {
            objects[item.logical_key] = item.id;
        }
    }
    return { objects, parameters: isRecord(body.parameters) ? body.parameters : {} };
}
const NOT_ARMED = "the app is installed and its triggers are not armed: fix field_security in sandbox.json, then run pnpm exec agentflow-app deploy --sandbox --upgrade, which applies it again and arms them";
async function secureFields(owner, installation, plan) {
    try {
        return await applyFieldSecurity(owner, installation, plan);
    }
    catch (error) {
        if (!(error instanceof CliError))
            throw error;
        throw new CliError(error.code, `${error.message}\n${NOT_ARMED}`, error.files);
    }
}
// A sandbox signs exactly when the deployment that makes it does, so the deployment's own answer is the sandbox's.
async function warnAboutSigning(platform, io, bytes, say) {
    return sayArchiveSigningWarnings(platform, bytes, (line) => say(io.stderr, line));
}
const RAISE = "; raise version in the manifest, build, and deploy --sandbox --upgrade again";
// A deploy the plan refused leaves its upload in the sandbox, so a fix under the same version is other content there.
const STARTS_OVER = "; deploy --sandbox --replace starts over in a new sandbox, which holds no earlier upload";
// AgentFlow's refusals of a version the sandbox already holds, or one not above it.
const HELD = /^APP_(PACKAGE_VERSION_EXISTS|VERSION_NOT_NEWER)$/;
export async function deploySandbox(values, io) {
    if (values["parameters"] !== undefined || values["decisions"] !== undefined) {
        usage("deploy --sandbox takes its answers from sandbox.json (install.parameters and install.decisions), not --parameters or --decisions");
    }
    if (values["wait"])
        usage("deploy --sandbox always waits; drop --wait");
    if (values["upgrade"] && values["replace"])
        usage("--upgrade keeps the recorded sandbox and --replace deletes it: pass one of them");
    const json = values["json"] === true;
    const say = (stream, line) => {
        if (!json)
            stream.write(`${line}\n`);
    };
    refuseTracked(io.cwd);
    if (values["upgrade"])
        return upgradeSandbox(values, io, say);
    const replace = values["replace"] === true;
    const spec = readSpec(io.cwd);
    requireValidSpec(spec);
    const platform = parentPlatform(values, io);
    const previous = readState(io.cwd);
    if (previous) {
        learn(io, previous);
        if (platform.root !== previous.url)
            throw madeElsewhere(previous, platform.root, replace ? "replace" : "install into");
    }
    const sealed = await sealedBytes(values, io, (line) => say(io.stdout, line));
    const dependencies = readDependencies(spec, io.cwd);
    if (stringFlag(values, "file") === undefined) {
        for (const line of requireParametersFit(spec, io.cwd))
            say(io.stderr, `warning: ${line}`);
        for (const line of requireFieldSecurityFits(spec, io.cwd))
            say(io.stderr, `warning: ${line}`);
    }
    const recorded = previous && !replace ? await reusableRecorded(platform, io, previous, spec, sealed, say) : undefined;
    const warnings = await warnAboutSigning(platform, io, sealed.bytes, say);
    const upload = { bytes: sealed.bytes, fileName: sealed.fileName, dependencies, fieldSecurity: fieldSecurityOf(spec) };
    if (recorded) {
        say(io.stdout, `installing into sandbox ${recorded.name} (${recorded.id})`);
        try {
            return await installInto(platform, io, recorded, upload, values, say, warnings);
        }
        catch (error) {
            if (!(error instanceof CliError && error.code === "APP_PACKAGE_VERSION_EXISTS"))
                throw error;
            throw new CliError(error.code, `${error.message}${STARTS_OVER}`, error.files);
        }
    }
    const request = { name: defaultName(io.cwd), spec: serverSpec(spec), secrets: readSecrets(spec, io) };
    const state = await makeInPlaceOf(platform, io, replace ? previous : null, request, say);
    return installInto(platform, io, state, upload, values, say, warnings);
}
function specIfAny(cwd) {
    try {
        return readSpec(cwd);
    }
    catch (error) {
        if (error instanceof CliError && error.code === "SANDBOX_SPEC_MISSING")
            return undefined;
        throw error;
    }
}
// The recorded sandbox keeps what was set by hand in it, and the answers AgentFlow resolved when it was made.
async function upgradeSandbox(values, io, say) {
    const state = requireState(io.cwd);
    learn(io, state);
    const { bytes, fileName } = await sealedBytes(values, io, (line) => say(io.stdout, line));
    const spec = specIfAny(io.cwd);
    // field_security is applied as sandbox.json says it now, unlike the answers recorded when the sandbox was made.
    const fieldSecurity = spec ? fieldSecurityToApply(spec, values, io, say) : undefined;
    // The dependencies sandbox.json names now; an upload of one the sandbox already holds changes nothing.
    const dependencies = spec ? readDependencies(spec, io.cwd) : [];
    const platform = parentPlatform(values, io);
    if (platform.root !== state.url)
        throw madeElsewhere(state, platform.root, "upgrade");
    const live = await liveness(platform, state);
    if (!live.live) {
        throw new CliError("SANDBOX_GONE", `the recorded sandbox ${state.id} is ${live.word}: deploy --sandbox without --upgrade makes a new one`, [STATE_FILE]);
    }
    if (spec && specChanged(state, spec)) {
        say(io.stderr, `warning: sandbox.json changed after sandbox ${state.name} (${state.id}) was made; this upgrade sends the answers recorded then, and deploy --sandbox --replace makes a new sandbox from it`);
    }
    const warnings = await warnAboutSigning(platform, io, bytes, say);
    try {
        return await installInto(platform, io, state, { bytes, fileName, dependencies, fieldSecurity }, values, say, warnings);
    }
    catch (error) {
        if (!(error instanceof CliError && HELD.test(error.code)))
            throw error;
        throw new CliError(error.code, `${error.message}${RAISE}`, error.files);
    }
}
function fieldSecurityToApply(spec, values, io, say) {
    const found = fieldSecurityProblem(spec);
    if (found)
        throw new CliError("SANDBOX_SPEC_INVALID", `sandbox.json: ${found.field}: ${found.message}`, ["sandbox.json"]);
    if (stringFlag(values, "file") === undefined) {
        for (const line of requireFieldSecurityFits(spec, io.cwd))
            say(io.stderr, `warning: ${line}`);
    }
    return fieldSecurityOf(spec);
}
async function installInto(platform, io, state, { bytes, fileName, dependencies, fieldSecurity: member }, values, say, signing) {
    const plan = member ? planFieldSecurity(state, member) : undefined;
    const deployKey = platform.as(state.deploy_key, "the sandbox's deploy key");
    // Each dependency goes up first, so the install finds it among the sandbox's uploads.
    const uploadedDependencies = [];
    for (const dependency of dependencies) {
        const { body } = await deployKey.postPackage("/app-packages", dependency.bytes, dependency.fileName);
        const release = releaseOf(deployKey, body);
        say(io.stdout, `uploaded dependency ${release.package_id} ${release.version}`);
        uploadedDependencies.push(release);
    }
    const carried = {
        ...(signing.length ? { signing_warnings: signing } : {}),
        ...(uploadedDependencies.length ? { dependencies: uploadedDependencies } : {}),
    };
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
            ({ approved, warnings } = await planAndApprove(owner, made.deployment_id, given, release.package_id, (line) => say(io.stderr, line)));
    }
    catch (error) {
        if (!(error instanceof CliError))
            throw error;
        const stays = `the sandbox stays: sign in with pnpm exec agentflow-app sandbox open --as ${state.owner} to see its setup page`;
        // An older agentflow-app sent a dependency's answers on an upgrade, and the setup keeps an answer once planned.
        const named = [...error.message.matchAll(/APP_DECISION_UNMATCHED on \S+ of (\S+) at decisions\//g)].map((m) => m[1]);
        const other = named.find((pkg) => pkg !== release.package_id);
        const discard = other
            ? `\nanswers for ${other}, which this install does not write, stay on the setup from an earlier deploy: choose Discard this setup on that page, then run this deploy again`
            : "";
        throw new CliError(error.code, `${error.message}\n${stays}${discard}`, error.files);
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
        return { data: { sandbox, package: release, deployment: deployment.body, installation: null, plan_warnings: warnings, ...carried }, text: [], note, exit: 130 };
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
    const recordObjects = async () => {
        Object.assign(installation, await objectsOf(owner, installationId));
        writeState(io.cwd, { ...state, installation });
    };
    // Field security reads the objects, so they are recorded first and the state file names them whatever it refuses.
    // Before arming, so no run a trigger starts meets the fields unsecured or a holder without its profile.
    if (plan)
        await recordObjects();
    const fieldSecurity = plan ? await secureFields(owner, installation, plan) : undefined;
    const armed = values["no-arm"] ? { armed: [] } : await arm(owner, installationId);
    installation.armed = armed.armed;
    writeState(io.cwd, { ...state, installation });
    if (!plan)
        await recordObjects();
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
        ...(fieldSecurity ? [outcomeLine(fieldSecurity)] : []),
        values["no-arm"] ? "not armed (--no-arm)" : armed.refused ? "not armed: AgentFlow refused, as stderr says" : `armed ${armed.armed.length} triggers`,
    ];
    const installedBefore = was !== undefined || made.status === "installed";
    const retired = installedBefore ? await retiredKeysIfListed(owner, installationId, (line) => say(io.stderr, line)) : undefined;
    if (retired?.length) {
        const one = retired.length === 1;
        text.push(`${retired.length} ${one ? "object" : "objects"} that ${release.package_id} retired ${one ? "stays" : "stay"} installed as deprecated: ${retired.join(", ")}`, `remove each on the installed app's page, signed in as the owner (pnpm exec agentflow-app sandbox open --as ${state.owner}): ${state.url}/admin/apps/installed/${installationId}`);
    }
    return {
        data: {
            sandbox,
            package: release,
            deployment: deployment.body,
            installation,
            ...(fieldSecurity ? { field_security: fieldSecurity } : {}),
            ...(retired ? { retired } : {}),
            plan_warnings: warnings,
            ...carried,
        },
        text,
        ...(armed.refused ? { note: armed.refused, exit: 1 } : {}),
    };
}
async function retiredKeysIfListed(owner, installationId, warn) {
    try {
        const { body } = await owner.get(`/app-installations/${encodeURIComponent(installationId)}/retired`);
        if (!Array.isArray(body.objects))
            throw owner.unexpected("a retired answer without objects");
        return body.objects.flatMap((item) => (isRecord(item) && typeof item.logical_key === "string" ? [item.logical_key] : []));
    }
    catch (error) {
        if (!(error instanceof CliError))
            throw error;
        if (!(error instanceof Refusal && error.code === "ROUTE_NOT_FOUND"))
            warn(`warning: could not list the objects the package retired: ${error.message}`);
        return undefined;
    }
}
//# sourceMappingURL=deploy.js.map