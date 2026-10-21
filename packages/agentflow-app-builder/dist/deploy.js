import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { CliError } from "./errors.js";
import { isRecord } from "./platform.js";
import { canonicalJson } from "./seal/canonical.js";
import { checkPayload } from "./seal/payload.js";
export const POLL_MS = 3000;
export const MAX_MISSES = 5;
const MAX_ENDED = 20;
const ENDED = new Set(["failed", "cancelled"]);
export const SETTLED = new Set(["installed", "failed", "cancelled"]);
const WORDS = { awaiting_approval: "awaiting approval" };
const text = (value) => (typeof value === "string" ? value : "");
export const statusWord = (status) => WORDS[status] ?? status;
export function progressLine(deployment) {
    if (deployment.status === "awaiting_approval")
        return `awaiting approval: ${deployment.approve_url}`;
    if (deployment.status === "installing") {
        const by = isRecord(deployment.body.approved_by) ? text(deployment.body.approved_by.name) : "";
        return by ? `installing (approved by ${by})` : "installing";
    }
    return statusWord(deployment.status);
}
export function endedMessage(deployment) {
    const { deployment_id: id, approve_url: url } = deployment;
    if (deployment.status === "failed") {
        const problem = isRecord(deployment.body.problem) ? deployment.body.problem : {};
        const code = text(problem.type) || "an error";
        const detail = text(problem.detail) ? `: ${text(problem.detail)}` : "";
        return `deployment ${id} failed with ${code}${detail}; see ${url}`;
    }
    const why = deployment.body.status_reason === "superseded" ? "a newer deployment of this package replaced it" : "it was withdrawn";
    return `deployment ${id} was cancelled: ${why}; see ${url}`;
}
export function sealedFile(cwd, flag) {
    if (flag !== undefined) {
        const file = path.resolve(cwd, flag);
        if (!fs.statSync(file, { throwIfNoEntry: false })?.isFile())
            throw new CliError("SEAL_MISSING", `${file}: no such file`, [file]);
        return file;
    }
    const manifest = path.join(cwd, "package", "manifest.json");
    if (!fs.existsSync(manifest))
        throw new CliError("PACKAGE_MISSING", `no package/ in ${cwd}: run agentflow-app build first`);
    const { fileName } = checkPayload(new Map([["manifest.json", fs.readFileSync(manifest)]]));
    const file = path.join(cwd, "dist-app", fileName);
    if (!fs.existsSync(file)) {
        throw new CliError("SEAL_MISSING", `${file} is not there: run agentflow-app seal first, or pass --file`, [file]);
    }
    return file;
}
export function readSealed(file) {
    try {
        return fs.readFileSync(file);
    }
    catch (error) {
        throw new CliError("SEAL_MISSING", `${file}: cannot read it (${error.code ?? "error"})`, [file]);
    }
}
export function releaseOf(platform, body) {
    const { package_id, version, digest, signer } = body;
    if (typeof package_id === "string" && typeof version === "string" && typeof digest === "string" && typeof signer === "string") {
        return { package_id, version, digest, signer };
    }
    throw platform.unexpected("an upload answer without package_id, version, digest and signer");
}
export function deploymentOf(platform, body) {
    const { deployment_id, status, approve_url } = body;
    if (typeof deployment_id === "string" && typeof status === "string" && typeof approve_url === "string") {
        return { deployment_id, status, approve_url, body };
    }
    throw platform.unexpected("a deployment without deployment_id, status and approve_url");
}
export function deploymentKey(digest, parameters, decisions, after) {
    const basis = canonicalJson({ digest, parameters: parameters ?? null, decisions: decisions ?? null, after: after ?? null });
    return `deploy-${createHash("sha256").update(basis).digest("hex")}`;
}
// A key replays what it made, so a deployment that has since ended would come back each time the same release is
// deployed with the same settings; the next key names the ended one, which keeps a retry of that request a replay.
export async function createDeployment(platform, release, parameters, decisions) {
    const request = {
        package_id: release.package_id,
        version: release.version,
        ...(parameters ? { parameters } : {}),
        ...(decisions ? { decisions } : {}),
    };
    let after;
    let last;
    for (let attempt = 0; attempt < MAX_ENDED; attempt++) {
        const key = deploymentKey(release.digest, parameters, decisions, after);
        const { body } = await platform.postJson("/app-deployments", request, { "idempotency-key": key });
        last = deploymentOf(platform, body);
        if (!ENDED.has(last.status))
            return last;
        after = last.deployment_id;
    }
    throw new CliError("DEPLOY_FAILED", `the last ${MAX_ENDED} deployments of ${release.package_id} ${release.version} with these settings all ended: seal a new version, ` +
        `change the settings (--parameters or --decisions), or retry after their idempotency keys expire; see ${last.approve_url}`);
}
const sleepFor = (ms, signal) => delay(ms, undefined, { signal }).catch(() => undefined);
const onSigint = (listener) => {
    process.once("SIGINT", listener);
    return () => void process.removeListener("SIGINT", listener);
};
export async function waitFor(platform, first, options) {
    const stop = new AbortController();
    const off = (options.onInterrupt ?? onSigint)(() => stop.abort());
    const sleep = options.sleep ?? sleepFor;
    let current = first;
    let misses = 0;
    try {
        while (!SETTLED.has(current.status)) {
            await sleep(POLL_MS, stop.signal);
            if (stop.signal.aborted)
                return { deployment: current, stopped: true };
            let answer;
            try {
                answer = await platform.get(`/app-deployments/${encodeURIComponent(current.deployment_id)}`, stop.signal);
            }
            catch (error) {
                if (stop.signal.aborted)
                    return { deployment: current, stopped: true };
                if (error instanceof CliError && error.code === "DEPLOY_UNREACHABLE" && ++misses < MAX_MISSES)
                    continue;
                throw error;
            }
            misses = 0;
            const next = deploymentOf(platform, answer.body);
            if (next.status !== current.status && !SETTLED.has(next.status))
                options.progress(progressLine(next));
            current = next;
        }
        return { deployment: current, stopped: false };
    }
    finally {
        off();
    }
}
//# sourceMappingURL=deploy.js.map