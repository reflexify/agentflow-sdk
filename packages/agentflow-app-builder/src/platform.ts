import { CliError } from "./errors.js";

export type Env = Readonly<Record<string, string | undefined>>;
export type Answer = { status: number; body: Record<string, unknown> };

const API_ROOT = "/api/v1";
const TIMEOUT_MS = 120_000;
const LOOPBACK = new Set(["localhost", "127.0.0.1", "[::1]"]);
const KEY_HINT = "check AGENTFLOW_TOKEN: the key must be a current service principal key (deploy also needs integration.admin)";
const CODE = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/;

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown): string => (typeof value === "string" ? value : "");

export function problemLine(problem: unknown): string {
  const p = isRecord(problem) ? problem : {};
  const object = isRecord(p.object) ? p.object : {};
  const kind = text(object.kind) || "package";
  const named = text(object.name) ? `${kind} "${text(object.name)}"` : kind;
  const where = text(p.path) ? `  ${text(p.path)}` : "";
  const fix = text(p.fix) ? ` (fix: ${text(p.fix)})` : "";
  return `${text(p.code) || "problem"}  ${named}${where}: ${text(p.message)}${fix}`.replace(/[\r\n]+/g, " ");
}

function causeOf(error: unknown): string {
  const cause = (error as { cause?: { code?: unknown; message?: unknown } } | undefined)?.cause;
  return text(cause?.code) || text(cause?.message) || (error instanceof Error ? error.message : String(error));
}

export class Platform {
  private constructor(
    readonly root: string,
    private readonly token: string,
    private readonly source: string,
  ) {}

  static configure(env: Env, url: string | undefined): Platform {
    const source = url !== undefined ? "--url" : "AGENTFLOW_URL";
    const raw = url ?? env.AGENTFLOW_URL;
    if (!raw) {
      throw new CliError(
        "DEPLOY_NOT_CONFIGURED",
        "AGENTFLOW_URL is not set: set it to the address you open AgentFlow at, such as https://agentflow.example.com, or pass --url",
      );
    }
    // The address is never echoed: it may carry a password.
    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      throw new CliError("DEPLOY_NOT_CONFIGURED", `${source} is not a URL`);
    }
    if (parsed.username || parsed.password || parsed.search || parsed.hash) {
      throw new CliError("DEPLOY_NOT_CONFIGURED", `${source} must be the address alone, with no user, query or fragment`);
    }
    if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && LOOPBACK.has(parsed.hostname))) {
      throw new CliError(
        "DEPLOY_NOT_CONFIGURED",
        `${source} must start with https:// (http:// only for localhost), so the key never crosses the network in clear`,
      );
    }
    const token = env.AGENTFLOW_TOKEN;
    if (!token) {
      throw new CliError(
        "DEPLOY_NOT_CONFIGURED",
        "AGENTFLOW_TOKEN is not set: set it to a service principal's key (afk_…), which an admin makes under Admin → Service principals",
      );
    }
    const root = `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, "").replace(/\/api\/v1$/, "");
    return new Platform(root, token, source);
  }

  get(path: string, signal?: AbortSignal): Promise<Answer> {
    return this.send("GET", path, {}, signal);
  }

  postJson(path: string, body: unknown, headers: Record<string, string> = {}, signal?: AbortSignal): Promise<Answer> {
    return this.send("POST", path, { body: JSON.stringify(body), headers: { "content-type": "application/json", ...headers } }, signal);
  }

  postPackage(path: string, bytes: Uint8Array, fileName: string, signal?: AbortSignal): Promise<Answer> {
    const form = new FormData();
    form.append("package", new Blob([new Uint8Array(bytes)], { type: "application/zip" }), fileName);
    return this.send("POST", path, { body: form, size: bytes.length }, signal);
  }

  unexpected(what: string): CliError {
    return new CliError("DEPLOY_UNREACHABLE", this.hide(`${this.root} answered, but not as AgentFlow does (${what}): check ${this.source}`));
  }

  private hide(message: string): string {
    return message.split(this.token).join("[redacted]");
  }

  private refusal(problem: Record<string, unknown>, status: number): CliError {
    const detail = text(problem.detail) || text(problem.title) || `refused with ${text(problem.type)}`;
    const extensions = isRecord(problem.extensions) ? problem.extensions : {};
    const lines = Array.isArray(extensions.problems) ? extensions.problems.map(problemLine) : [];
    const hint = [
      ...(status === 401 || status === 403 ? [KEY_HINT] : []),
    ];
    return new CliError(text(problem.type), this.hide([detail, ...lines, ...hint].join("\n")));
  }

  private async send(
    method: string,
    path: string,
    init: { body?: string | FormData; headers?: Record<string, string>; size?: number },
    signal?: AbortSignal,
  ): Promise<Answer> {
    const timeout = AbortSignal.timeout(TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(`${this.root}${API_ROOT}${path}`, {
        method,
        redirect: "manual",
        headers: { accept: "application/json, application/problem+json", ...init.headers, authorization: `Bearer ${this.token}` },
        body: init.body,
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      const reason = timeout.aborted ? `nothing within ${TIMEOUT_MS / 1000} s` : causeOf(error);
      throw new CliError("DEPLOY_UNREACHABLE", this.hide(`no answer from ${this.root} (${reason}): check ${this.source} and your network`));
    }
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      throw new CliError(
        "DEPLOY_UNREACHABLE",
        this.hide(`${this.root} answered with a redirect${location ? ` to ${location}` : ""}: set ${this.source} to the address AgentFlow is served at`),
      );
    }
    let body: unknown;
    try {
      const raw = await response.text();
      body = raw ? JSON.parse(raw) : undefined;
    } catch (error) {
      if (signal?.aborted) throw error;
      body = undefined;
    }
    if (response.ok) {
      if (!isRecord(body)) throw this.unexpected(`${response.status} without a JSON object`);
      return { status: response.status, body };
    }
    if (isRecord(body) && CODE.test(text(body.type))) throw this.refusal(body, response.status);
    throw this.refusedInFront(response.status, init.size ?? (typeof init.body === "string" ? Buffer.byteLength(init.body) : undefined));
  }

  private refusedInFront(status: number, size: number | undefined): CliError {
    if (status === 413) {
      const sent = size === undefined ? "" : ` (${size} bytes sent)`;
      return new CliError(
        "DEPLOY_UNREACHABLE",
        this.hide(`${this.root} answered 413${sent}: something in front of AgentFlow refused it as too large, so AgentFlow never saw it; raise that limit or send a smaller archive`),
      );
    }
    if (status >= 500) return this.unexpected(`${status}: the answer did not come from AgentFlow`);
    return this.unexpected(`${status}`);
  }
}
