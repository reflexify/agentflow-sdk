import http from "node:http";
import type { AddressInfo } from "node:net";
import { Writable } from "node:stream";
import { main, type Io } from "../src/cli.js";

export const TOKEN = `afk_${"s3cr3tK3y".repeat(5)}`;

export type Seen = { method: string; path: string; headers: http.IncomingHttpHeaders; body: Buffer };
export type Reply =
  | { status: number; json: unknown; headers?: Record<string, string> }
  | { status: number; problem: Record<string, unknown> }
  | { status: number; html: string; headers?: Record<string, string> }
  | { hangUp: true };
export interface Stub {
  url: string;
  seen: Seen[];
  close(): Promise<void>;
}

const open: Stub[] = [];

export async function stub(route: (request: Seen) => Reply): Promise<Stub> {
  const seen: Seen[] = [];
  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      const request: Seen = { method: req.method ?? "", path: req.url ?? "", headers: req.headers, body: Buffer.concat(chunks) };
      seen.push(request);
      const reply = route(request);
      if ("hangUp" in reply) {
        req.socket.destroy();
      } else if ("problem" in reply) {
        res.writeHead(reply.status, { "content-type": "application/problem+json" });
        res.end(JSON.stringify({ title: "Refused", status: reply.status, ...reply.problem }));
      } else if ("json" in reply) {
        res.writeHead(reply.status, { "content-type": "application/json", ...reply.headers });
        res.end(JSON.stringify(reply.json));
      } else {
        res.writeHead(reply.status, { "content-type": "text/html", ...reply.headers });
        res.end(reply.html);
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  const made: Stub = {
    url: `http://127.0.0.1:${port}`,
    seen,
    close: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
  open.push(made);
  return made;
}

export async function closeStubs(): Promise<void> {
  await Promise.all(open.splice(0).map((s) => s.close()));
}

export async function deadUrl(): Promise<string> {
  const gone = await stub(() => ({ status: 500, html: "" }));
  await gone.close();
  return gone.url;
}

export function filePart(request: Seen, name: string): Buffer {
  const type = String(request.headers["content-type"]);
  const match = /boundary=(?:"([^"]+)"|([^;]+))/.exec(type);
  if (!match) throw new Error(`not multipart: ${type}`);
  const delimiter = Buffer.from(`--${match[1] ?? match[2]}`);
  let at = request.body.indexOf(delimiter);
  while (at !== -1) {
    const next = request.body.indexOf(delimiter, at + delimiter.length);
    if (next === -1) break;
    const part = request.body.subarray(at + delimiter.length + 2, next - 2);
    const split = part.indexOf("\r\n\r\n");
    if (part.subarray(0, split).toString("latin1").includes(`name="${name}"`)) return part.subarray(split + 4);
    at = next;
  }
  throw new Error(`no part named ${name}`);
}

function capture(): { stream: Writable; text: () => string } {
  const chunks: string[] = [];
  const stream = new Writable({
    write(chunk, _encoding, done) {
      chunks.push(String(chunk));
      done();
    },
  });
  return { stream, text: () => chunks.join("") };
}

export async function runCli(
  cwd: string,
  argv: string[],
  extra: Partial<Omit<Io, "cwd" | "stdout" | "stderr">> = {},
): Promise<{ code: number; stdout: string; stderr: string }> {
  const out = capture();
  const err = capture();
  const code = await main(argv, { cwd, stdout: out.stream, stderr: err.stream, ...extra });
  return { code, stdout: out.text(), stderr: err.text() };
}

export const envFor = (url: string): Record<string, string> => ({ AGENTFLOW_URL: url, AGENTFLOW_TOKEN: TOKEN });
