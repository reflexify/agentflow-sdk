import fs from "node:fs";
import path from "node:path";
import { envOf, stringFlag } from "./command.js";
import { failureText, problemOf, recentDeployments, statusWord } from "./deploy.js";
import { CliError } from "./errors.js";
import { Platform, Refusal } from "./platform.js";
import { learn } from "./sandbox/commands.js";
import { readState, STATE_FILE } from "./sandbox/state.js";
import { checkPayload } from "./seal/payload.js";
const text = (value) => (typeof value === "string" ? value : "");
function readRelease(cwd) {
    const manifest = path.join(cwd, "package", "manifest.json");
    if (!fs.existsSync(manifest))
        throw new CliError("PACKAGE_MISSING", `no package/ in ${cwd}: run pnpm build first`);
    return checkPayload(new Map([["manifest.json", fs.readFileSync(manifest)]]));
}
const summary = (deployment) => ({
    deployment_id: deployment.deployment_id,
    version: text(deployment.body.version),
    status: deployment.status,
    problem: problemOf(deployment.body),
    approve_url: deployment.approve_url,
    installation_id: text(deployment.body.installation_id) || null,
    created_at: text(deployment.body.created_at),
});
// The sandbox's own deploy key answers for it: a parent key could see it only with sandbox.create.
async function probeSandbox(platform, state) {
    const known = { id: state.id, expires_at: state.expires_at };
    if (platform.root !== state.url)
        return { ...known, state: "elsewhere" };
    try {
        await platform.as(state.deploy_key, "the sandbox's deploy key").get("/caller");
        return { ...known, state: "live" };
    }
    catch (error) {
        if (error instanceof Refusal && error.status === 401)
            return { ...known, state: "gone" };
        if (error instanceof CliError)
            return { ...known, state: "unknown" };
        throw error;
    }
}
export async function status(platform, release, sandbox) {
    const deployments = (await recentDeployments(platform, release.id)).map(summary);
    return {
        package_id: release.id,
        version: release.version,
        deployments,
        sandbox: sandbox ? await probeSandbox(platform, sandbox) : null,
    };
}
function deploymentLine(d) {
    const word = d.status === "failed" ? `failed: ${failureText(d.problem)}` : statusWord(d.status);
    const installation = d.installation_id ? ` (installation ${d.installation_id})` : "";
    // An installed deployment's page is long past approval, so its link is left out.
    const link = d.status === "installed" ? "" : `  ${d.status === "awaiting_approval" ? "approve" : "setup page"}: ${d.approve_url}`;
    return `${d.created_at}  ${d.version}  ${word}${installation}${link}`;
}
function sandboxLine(s, url) {
    if (s.state === "live")
        return `sandbox ${s.id}: live, expires ${s.expires_at}`;
    if (s.state === "gone")
        return `sandbox ${s.id}: gone (it expired, or was deleted from another folder or with --id; this folder's ${STATE_FILE} is left; it was to expire ${s.expires_at})`;
    if (s.state === "elsewhere")
        return `sandbox ${s.id}: on ${url}, not this deployment; expires ${s.expires_at}`;
    return `sandbox ${s.id}: could not be checked; expires ${s.expires_at}`;
}
function readSandbox(io) {
    try {
        return readState(io.cwd);
    }
    catch (error) {
        if (!(error instanceof CliError && error.code === "SANDBOX_STATE_INVALID"))
            throw error;
        io.stderr.write(`${error.message}\n`);
        return null;
    }
}
export const statusCommand = async (values, io) => {
    const release = readRelease(io.cwd);
    const platform = Platform.configure(envOf(io), stringFlag(values, "url"));
    const sandbox = readSandbox(io);
    if (sandbox)
        learn(io, sandbox);
    const report = await status(platform, release, sandbox);
    const lines = [`${report.package_id} (package/ is ${report.version})`];
    if (report.deployments.length === 0)
        lines.push(`no deployments of ${report.package_id}`);
    lines.push(...report.deployments.map(deploymentLine));
    lines.push(report.sandbox && sandbox
        ? sandboxLine(report.sandbox, sandbox.url)
        : fs.existsSync(path.join(io.cwd, STATE_FILE))
            ? `sandbox: ${STATE_FILE} could not be read (above)`
            : `no sandbox here: ${STATE_FILE} is absent (none was made in this folder, or sandbox delete removed it); a sandbox's own deployment is not in the list above`);
    return { data: report, text: lines, ...(report.deployments[0]?.status === "failed" ? { exit: 1 } : {}) };
};
//# sourceMappingURL=status.js.map