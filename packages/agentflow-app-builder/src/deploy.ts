import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { CliError } from "./errors.js";
import { isRecord, planFindingLine, type Answer, type Platform } from "./platform.js";
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
  deadline?: number;
  now?: () => number;
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
    return `installing${by ? ` (approved by ${by})` : ""}; this usually takes a minute or two`;
  }
  return statusWord(deployment.status);
}

// A plan reads as the person who made it (a grant they may not delegate is theirs), so the
// lines say who planned rather than reading as a defect of the package.
export const FINDINGS_HEAD = "when a person last planned its setup, this stopped its approval (some findings depend on what that person may grant):";
export const FINDINGS_CLEAR = "when a person last planned its setup, nothing stopped its approval";

// What the last plan of a waiting deployment's setup found, as AgentFlow stores it; a person planned it, since a key cannot.
export const planFindingsOf = (body: Json): unknown[] => (Array.isArray(body.plan_findings) ? body.plan_findings : []);

export const planFindingLines = (findings: unknown[], indent = ""): string[] => [
  `${indent}${FINDINGS_HEAD}`,
  ...findings.map((finding) => `${indent}  ${planFindingLine(finding)}`),
];

export type Problem = { type: string; detail: string };

export function problemOf(body: Json): Problem | null {
  return isRecord(body.problem) ? { type: text(body.problem.type), detail: text(body.problem.detail) } : null;
}

// "TYPE — detail", for a line that already says the deployment failed.
export function failureText(problem: Problem | null): string {
  const code = problem?.type || "an error";
  return problem?.detail ? `${code} — ${problem.detail}` : code;
}

export function endedMessage(deployment: Deployment): string {
  const { deployment_id: id, approve_url: url } = deployment;
  if (deployment.status === "failed") {
    const problem = problemOf(deployment.body);
    const code = problem?.type || "an error";
    const detail = problem?.detail ? `: ${problem.detail}` : "";
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
  if (!fs.existsSync(manifest)) throw new CliError("PACKAGE_MISSING", `no package/ in ${cwd}: run pnpm build first`);
  const { fileName } = checkPayload(new Map([["manifest.json", fs.readFileSync(manifest)]]));
  const file = path.join(cwd, "dist-app", fileName);
  if (!fs.existsSync(file)) {
    throw new CliError("SEAL_MISSING", `${file} is not there: run pnpm seal first, or pass --file`, [file]);
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

export const RECENT = 10;
const LIST_PAGE = 200;
const LIST_PAGES = 5;
export const LIST_TIMEOUT_MS = 10_000;

// The list matches a substring of the package id, so acme/loan also finds acme/loan-servicing: read pages until
// RECENT of this package's own are found, or LIST_PAGES were read.
export async function recentDeployments(platform: Platform, packageId: string, signal?: AbortSignal): Promise<Deployment[]> {
  const found: Deployment[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < LIST_PAGES && found.length < RECENT; page++) {
    const query = new URLSearchParams({ q: packageId, sort: "created_at", dir: "desc", limit: String(LIST_PAGE) });
    if (cursor) query.set("cursor", cursor);
    const { body } = await platform.get(`/app-deployments?${query}`, signal);
    if (!Array.isArray(body.items)) throw platform.unexpected("a deployment list without items");
    for (const item of body.items) {
      if (isRecord(item) && item.package_id === packageId) found.push(deploymentOf(platform, item));
    }
    cursor = typeof body.next_cursor === "string" && body.next_cursor ? body.next_cursor : undefined;
    if (!cursor) break;
  }
  return found.slice(0, RECENT);
}

// Only a courtesy line: a key that cannot list deployments, or a list that is slow to answer, never holds up a deploy.
export async function lastFailed(platform: Platform, release: Release, timeoutMs = LIST_TIMEOUT_MS): Promise<Deployment | undefined> {
  let found: Deployment[];
  try {
    found = await recentDeployments(platform, release.package_id, AbortSignal.timeout(timeoutMs));
  } catch (error) {
    if (error instanceof CliError || (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError"))) return undefined;
    throw error;
  }
  const newest = found.find((deployment) => deployment.body.version === release.version);
  return newest?.status === "failed" ? newest : undefined;
}

export const previousLine = (release: Release, previous: Deployment): string =>
  `the last deployment of ${release.package_id} ${release.version} failed: ${failureText(problemOf(previous.body))}; this is a new one`;

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
): Promise<{ deployment: Deployment; stopped: boolean; stalled: boolean }> {
  const stop = new AbortController();
  const off = (options.onInterrupt ?? onSigint)(() => stop.abort());
  const sleep = options.sleep ?? sleepFor;
  const now = options.now ?? Date.now;
  let current = first;
  let misses = 0;
  let shown: unknown[] = [];
  const showFindings = (deployment: Deployment): void => {
    const found = deployment.status === "awaiting_approval" ? planFindingsOf(deployment.body) : [];
    if (JSON.stringify(found) === JSON.stringify(shown)) return;
    if (found.length > 0) for (const line of planFindingLines(found)) options.progress(line);
    else if (deployment.status === "awaiting_approval") options.progress(FINDINGS_CLEAR);
    shown = found;
  };
  showFindings(first);
  try {
    while (!SETTLED.has(current.status)) {
      if (options.deadline !== undefined && now() >= options.deadline) return { deployment: current, stopped: false, stalled: true };
      await sleep(POLL_MS, stop.signal);
      if (stop.signal.aborted) return { deployment: current, stopped: true, stalled: false };
      let answer: Answer;
      try {
        answer = await platform.get(`/app-deployments/${encodeURIComponent(current.deployment_id)}`, stop.signal);
      } catch (error) {
        if (stop.signal.aborted) return { deployment: current, stopped: true, stalled: false };
        if (error instanceof CliError && error.code === "DEPLOY_UNREACHABLE" && ++misses < MAX_MISSES) continue;
        throw error;
      }
      misses = 0;
      const next = deploymentOf(platform, answer.body);
      if (next.status !== current.status && !SETTLED.has(next.status)) options.progress(progressLine(next));
      showFindings(next);
      current = next;
    }
    return { deployment: current, stopped: false, stalled: false };
  } finally {
    off();
  }
}
