import path from "node:path";
import { envOf, stringFlag, UsageError, type Handler } from "./command.js";
import { readSealed, sealedFile } from "./deploy.js";
import { isRecord, Platform } from "./platform.js";
import { readZip } from "./seal/zip.js";

type Status = "submitted" | "gate" | "review" | "approved" | "rejected";
type Entry = { id: string; package_id: string; version: string; state: string };
type SubmitAnswer = { submission: { id: string; status: Status }; entry: Entry | null; findings?: unknown[] };

export function parseRelease(text: string): { package_id: string; version: string } {
  const at = text.lastIndexOf("@");
  if (at <= 0 || at === text.length - 1 || !text.slice(0, at).includes("/")) {
    throw new UsageError(`expected prefix/slug@version, got ${JSON.stringify(text)}`);
  }
  return { package_id: text.slice(0, at), version: text.slice(at + 1) };
}

const word = (status: Status): string => (status === "approved" ? "published" : status === "rejected" ? "rejected" : "in review");

function manifestRelease(bytes: Uint8Array, fallback: string): string {
  try {
    const manifest: unknown = JSON.parse(readZip(bytes).get("manifest.json")?.toString("utf8") ?? "");
    if (isRecord(manifest) && typeof manifest.id === "string" && typeof manifest.version === "string") {
      return `${manifest.id} ${manifest.version}`;
    }
  } catch {
    // an unreadable archive was judged by the server; name the file instead
  }
  return fallback;
}

export const publishCommand: Handler = async (values, io, positionals) => {
  const named = stringFlag(values, "file");
  if (named !== undefined && positionals.length > 0) throw new UsageError("give the package once: --file or a path, not both");
  if (positionals.length > 1) throw new UsageError("publish takes one package");
  const platform = Platform.configure(envOf(io), stringFlag(values, "url"));
  const file = sealedFile(io.cwd, named ?? positionals[0]);
  const bytes = readSealed(file);
  const { body } = await platform.postPackage("/app-catalog/submissions", bytes, path.basename(file));
  const answer = body as unknown as SubmitAnswer;
  const label = answer.entry ? `${answer.entry.package_id} ${answer.entry.version}` : manifestRelease(bytes, path.basename(file));
  // Resubmitting the bytes of a withdrawn version answers with its existing entry, still withdrawn.
  if (answer.entry && answer.entry.state !== "published") {
    return {
      data: body,
      text: [`${answer.entry.state} ${label}`, "this version stays out of the catalog; publish a new version instead"],
      exit: 1,
    };
  }
  const rejected = answer.submission.status === "rejected";
  return {
    data: body,
    text: [`${word(answer.submission.status)} ${label}`],
    ...(rejected ? { exit: 1 } : {}),
  };
};

export const withdrawCommand: Handler = async (values, io, positionals) => {
  if (positionals.length !== 1) throw new UsageError("withdraw takes one prefix/slug@version");
  const reason = stringFlag(values, "reason");
  if (!reason?.trim()) throw new UsageError("withdraw needs --reason");
  const release = parseRelease(positionals[0]!);
  const platform = Platform.configure(envOf(io), stringFlag(values, "url"));
  const { body } = await platform.postJson("/app-catalog/withdrawals", { ...release, reason });
  const { entry } = body as unknown as { entry: Entry };
  return { data: body, text: [`withdrawn ${entry.package_id} ${entry.version}`] };
};
