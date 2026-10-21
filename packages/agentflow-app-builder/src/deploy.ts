import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { CliError } from "./errors.js";
import { isRecord, type Answer, type Platform } from "./platform.js";
import { canonicalJson } from "./seal/canonical.js";
import { checkPayload } from "./seal/payload.js";

export const POLL_MS = 3000;
export const MAX_MISSES = 5;
const MAX_ENDED = 20;

export type Json = Record<string, unknown>;
export type Release = { package_id: string; version: string; digest: string; signer: string };
export type Deployment = { deployment_id: string; status: string; approve_url: string; body: Json };
export type WaitOptions = {
  sleep?: (ms: number, signal: AbortSignal) => Promise<void>;
  onInterrupt?: (listener: () => void) => () => void;
  progress: (line: string) => void;
};

const ENDED = new Set(["failed", "cancelled"]);
export const SETTLED: ReadonlySet<string> = new Set(["installed", "failed", "cancelled"]);
const WORDS: Record<string, string> = { awaiting_approval: "awaiting approval" };
const text = (value: unknown): string => (typeof value === "string" ? value : "");

export const statusWord = (status: string): string => WORDS[status] ?? status;

export function progressLine(deployment: Deployment): string {
  if (deployment.status === "awaiting_approval") return `awaiting approval: ${deployment.approve_url}`;
  if (deployment.status === "installing") {
    const by = isRecord(deployment.body.approved_by) ? text(deployment.body.approved_by.name) : "";
    return by ? `installing (approved by ${by})` : "installing";
  }
  return statusWord(deployment.status);
}

export function endedMessage(deployment: Deployment): string {
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

export function sealedFile(cwd: string, flag: string | undefined): string {
  if (flag !== undefined) {
    const file = path.resolve(cwd, flag);
    if (!fs.statSync(file, { throwIfNoEntry: false })?.isFile()) throw new CliError("SEAL_MISSING", `${file}: no such file`, [file]);
    return file;
  }
  const manifest = path.join(cwd, "package", "manifest.json");
  if (!fs.existsSync(manifest)) throw new CliError("PACKAGE_MISSING", `no package/ in ${cwd}: run agentflow-app build first`);
  const { fileName } = checkPayload(new Map([["manifest.json", fs.readFileSync(manifest)]]));
  const file = path.join(cwd, "dist-app", fileName);
  if (!fs.existsSync(file)) {
    throw new CliError("SEAL_MISSING", `${file} is not there: run agentflow-app seal first, or pass --file`, [file]);
  }
  return file;
}

export function readSealed(file: string): Buffer {
  try {
    return fs.readFileSync(file);
  } catch (error) {
    throw new CliError("SEAL_MISSING", `${file}: cannot read it (${(error as NodeJS.ErrnoException).code ?? "error"})`, [file]);
  }
}

export function releaseOf(platform: Platform, body: Json): Release {
  const { package_id, version, digest, signer } = body;
  if (typeof package_id === "string" && typeof version === "string" && typeof digest === "string" && typeof signer === "string") {
    return { package_id, version, digest, signer };
  }
  throw platform.unexpected("an upload answer without package_id, version, digest and signer");
}

export function deploymentOf(platform: Platform, body: Json): Deployment {
  const { deployment_id, status, approve_url } = body;
  if (typeof deployment_id === "string" && typeof status === "string" && typeof approve_url === "string") {
    return { deployment_id, status, approve_url, body };
  }
  throw platform.unexpected("a deployment without deployment_id, status and approve_url");
}

export function deploymentKey(digest: string, parameters: Json | undefined, decisions: Json | undefined, after: string | undefined): string {
  const basis = canonicalJson({ digest, parameters: parameters ?? null, decisions: decisions ?? null, after: after ?? null });
  return `deploy-${createHash("sha256").update(basis).digest("hex")}`;
}

// A key replays what it made, so a deployment that has since ended would come back each time the same release is
// deployed with the same settings; the next key names the ended one, which keeps a retry of that request a replay.
export async function createDeployment(platform: Platform, release: Release, parameters?: Json, decisions?: Json): Promise<Deployment> {
  const request = {
    package_id: release.package_id,
    version: release.version,
    ...(parameters ? { parameters } : {}),
    ...(decisions ? { decisions } : {}),
  };
  let after: string | undefined;
  let last: Deployment | undefined;
  for (let attempt = 0; attempt < MAX_ENDED; attempt++) {
    const key = deploymentKey(release.digest, parameters, decisions, after);
    const { body } = await platform.postJson("/app-deployments", request, { "idempotency-key": key });
    last = deploymentOf(platform, body);
    if (!ENDED.has(last.status)) return last;
    after = last.deployment_id;
  }
  throw new CliError(
    "DEPLOY_FAILED",
    `the last ${MAX_ENDED} deployments of ${release.package_id} ${release.version} with these settings all ended: seal a new version, ` +
      `change the settings (--parameters or --decisions), or retry after their idempotency keys expire; see ${last!.approve_url}`,
  );
}

const sleepFor = (ms: number, signal: AbortSignal): Promise<void> => delay(ms, undefined, { signal }).catch(() => undefined);

const onSigint = (listener: () => void): (() => void) => {
  process.once("SIGINT", listener);
  return () => void process.removeListener("SIGINT", listener);
};

export async function waitFor(
  platform: Platform,
  first: Deployment,
  options: WaitOptions,
): Promise<{ deployment: Deployment; stopped: boolean }> {
  const stop = new AbortController();
  const off = (options.onInterrupt ?? onSigint)(() => stop.abort());
  const sleep = options.sleep ?? sleepFor;
  let current = first;
  let misses = 0;
  try {
    while (!SETTLED.has(current.status)) {
      await sleep(POLL_MS, stop.signal);
      if (stop.signal.aborted) return { deployment: current, stopped: true };
      let answer: Answer;
      try {
        answer = await platform.get(`/app-deployments/${encodeURIComponent(current.deployment_id)}`, stop.signal);
      } catch (error) {
        if (stop.signal.aborted) return { deployment: current, stopped: true };
        if (error instanceof CliError && error.code === "DEPLOY_UNREACHABLE" && ++misses < MAX_MISSES) continue;
        throw error;
      }
      misses = 0;
      const next = deploymentOf(platform, answer.body);
      if (next.status !== current.status && !SETTLED.has(next.status)) options.progress(progressLine(next));
      current = next;
    }
    return { deployment: current, stopped: false };
  } finally {
    off();
  }
}
