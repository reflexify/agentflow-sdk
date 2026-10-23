import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { Writable } from "node:stream";
import { envOf, stringFlag, usage, UsageError } from "./command.js";
import { sandboxCommand } from "./sandbox/commands.js";
import { readPackageDir, typesCommand } from "./types/command.js";
import { buildApp } from "./app.js";
import { requireFresh, requireUiEntry } from "./package-checks.js";
import { deploySandbox } from "./sandbox/deploy.js";
import { CliError, SealError } from "./errors.js";
import { convertDraft } from "./draft/convert.js";
import { initProject } from "./init.js";
import { findKey, keygen, readKeyFile } from "./seal/keys.js";
import { isRecord, Platform, problemLine } from "./platform.js";
import { createDeployment, endedMessage, progressLine, readSealed, releaseOf, sealedFile, SETTLED, statusWord, waitFor } from "./deploy.js";
import { publishCommand, withdrawCommand } from "./catalog.js";
import { readPayloadDir } from "./seal/payload.js";
import { sign } from "./seal/seal.js";
import { writeStoredZip } from "./seal/zip.js";
export const COMMANDS = {
    init: ["--prefix", "--key", "--no-ui", "--no-site", "--from", "--json"],
    build: ["--check", "--json"],
    keygen: ["--key-id", "--out", "--json"],
    seal: ["--key", "--key-id", "--out", "--json"],
    lint: ["--url", "--json"],
    publish: ["--file", "--url", "--json"],
    withdraw: ["--reason", "--url", "--json"],
    deploy: ["--file", "--parameters", "--decisions", "--wait", "--sandbox", "--no-arm", "--url", "--json"],
    sandbox: ["--name", "--ttl-days", "--id", "--as", "--url", "--json"],
    types: ["--out", "--check", "--json"],
};
export const ERROR_CODES = [
    "USAGE", "APP_FILE_MISSING", "APP_FILE_INVALID", "CONFIG_VERSION_MISSING", "CONFIG_VERSION_UNKNOWN",
    "BUILD_REFUSED", "PACKAGE_STALE", "PACKAGE_MISSING", "UI_TOOL_MISSING", "UI_BUILD_FAILED", "UI_ENTRY_MISSING", "UI_ENTRY_INVALID",
    "UI_FILE_TYPE", "KEY_EXISTS", "KEY_MISSING", "KEY_AMBIGUOUS", "KEY_PERMISSIONS", "KEY_INVALID", "KEY_ID_INVALID",
    "SEAL_FILE_UNLISTED", "SEAL_PATH_INVALID", "SEAL_MANIFEST_MISSING", "SEAL_MANIFEST_INVALID", "SEAL_VERSION_INVALID",
    "SEAL_JSON_INVALID", "SEAL_LIMIT_EXCEEDED", "SEAL_ARCHIVE_INVALID", "SEAL_OUT_EXISTS", "INIT_DIR_NOT_EMPTY",
    "INIT_NAME_INVALID", "INIT_DIR_UNWRITABLE", "INIT_STARTER_INVALID", "DRAFT_INVALID", "DRAFT_UNSUPPORTED", "DRAFT_REBUILD_DIFFERS",
    "DEPLOY_NOT_CONFIGURED", "DEPLOY_UNREACHABLE", "SEAL_MISSING", "DEPLOY_FAILED", "SANDBOX_SPEC_MISSING", "SANDBOX_SPEC_INVALID", "SANDBOX_SECRET_MISSING",
    "SANDBOX_STATE_TRACKED", "SANDBOX_STATE_MISSING", "SANDBOX_STATE_INVALID", "SANDBOX_OPEN_FAILED", "DEPLOY_STALLED", "TYPES_STALE", "INTERNAL",
];
export const USAGE = `Usage: agentflow-app <command> [options]

Commands:
  init <dir> --prefix <prefix> [--key <key>] [--no-ui] [--no-site]
                                      start an app in <dir> from the starter; the key defaults to the folder's name
  init <dir> --from <draft.zip>       start an app in <dir> from a draft downloaded from Admin → Apps → Pack
  build [--check]                     write package/ from the app's config; --check only compares
  keygen --key-id <id> [--out <file>] make a signing key (default keys/<id>.pem) and print where it is
  seal [--key <file>] [--key-id <id>] [--out <dir>]
                                      sign package/ into <out>/<package>-<version>.afpkg (default dist-app/)
  lint [--url <url>]                  send package/ to AgentFlow and print the problems it finds
  deploy [--file <afpkg>] [--parameters <file>] [--decisions <file>] [--wait] [--url <url>]
                                      upload the sealed package and ask for it to be installed; an admin approves.
                                      --parameters answers the manifest's parameters by key; --decisions may only
                                      decline grants: {"grants": {"<package>": {"<grant key>": "declined"}}}
  deploy --sandbox [--file <afpkg>] [--no-arm]
                                      replace this folder's sandbox with a new one from sandbox.json, install the
                                      package there as its owner (sealing package/ for you without --file), wait,
                                      and arm its triggers unless --no-arm
  publish [file] [--file <path>] [--url <url>] [--json]
                                      publish a sealed package to the deployment's app catalog. Needs app_catalog.publish.
  withdraw <prefix>/<slug>@<version> --reason <text> [--url <url>] [--json]
                                      withdraw a version you published. Installations keep running; new setups cannot choose it.
  sandbox check                       check sandbox.json without calling AgentFlow
  sandbox create [--name <name>] [--ttl-days <n>]
                                      make a sandbox from sandbox.json; its keys go to .agentflow/sandbox.json
  sandbox list                        list your organization's live sandboxes
  sandbox open --as <handle>          sign in to the sandbox in your browser as one of its people
  sandbox delete [--id <id>]          delete the sandbox in .agentflow/sandbox.json, or the one named
  types [--out <file>] [--check]      write TypeScript for the package's objects (default src/generated/app.ts); --check only compares

lint, deploy, publish and withdraw read AGENTFLOW_URL (the address you open AgentFlow at; --url overrides it) and AGENTFLOW_TOKEN
(a service principal's key). sandbox and deploy --sandbox read AGENTFLOW_SANDBOX_KEY instead. No key is printed.

Every command takes --json: one JSON value on stdout, an error as {"error":{"code","message"}}.
Exit codes: 0 done, 1 refused (lint: problems found; deploy --wait: failed or cancelled; deploy --sandbox: also
stalled or not armed), 2 usage error, 130 deploy --wait or --sandbox stopped by Ctrl-C (the deployment stays).`;
const BOOLEAN_FLAGS = new Set(["--check", "--json", "--no-ui", "--no-site", "--wait", "--sandbox", "--no-arm"]);
function toRefusal(error) {
    if (error instanceof CliError) {
        return { code: error.code, message: error.message, ...(error.files ? { files: error.files } : {}) };
    }
    const message = error instanceof Error ? error.message : String(error);
    const refusal = error instanceof Error && (error.constructor === Error || error.constructor === SyntaxError);
    const system = error instanceof Error && typeof error.code === "string";
    if (refusal && !system)
        return { code: "BUILD_REFUSED", message };
    const stack = process.env.AGENTFLOW_APP_DEBUG === "1" && error instanceof Error && error.stack ? `\n${error.stack}` : "";
    return { code: "INTERNAL", message: `${message}${stack}` };
}
const FILE_ERRORS = {
    ENOENT: "no such file or folder",
    ENOTDIR: "not a folder",
    EISDIR: "is a folder, not a file",
    EACCES: "permission denied",
    EPERM: "permission denied",
};
// A file or folder the build needs and cannot read is the app's fault, not the builder's.
function refuseFileError(error) {
    const { code, path: file } = error;
    if (typeof code === "string" && typeof file === "string" && Object.hasOwn(FILE_ERRORS, code)) {
        throw new CliError("BUILD_REFUSED", `${file}: ${FILE_ERRORS[code]}`, [file]);
    }
    throw error;
}
const build = async (values, io) => {
    try {
        return await buildOutcome(values, io);
    }
    catch (error) {
        return refuseFileError(error);
    }
};
const buildOutcome = async (values, io) => {
    if (values["check"]) {
        await requireFresh(io.cwd);
        return { data: { stale: [], missing: [], extra: [] }, text: ["package/ matches the config"] };
    }
    const { files, ui } = await buildApp(io.cwd);
    return { data: { files, ui }, text: [`wrote ${files} package files`, `ui: ${ui}`] };
};
const initFromDraft = async (from, values, io, positionals) => {
    const taken = ["prefix", "key", "no-ui", "no-site"].filter((flag) => values[flag] !== undefined);
    if (taken.length) {
        usage(`init --from takes no ${taken.map((f) => `--${f}`).join(", ")}: the draft holds the package id, and its project has no site`);
    }
    const [dir] = positionals;
    if (dir === undefined)
        usage("init --from needs a folder: agentflow-app init <dir> --from <draft.zip>");
    const file = path.resolve(io.cwd, from);
    let bytes;
    try {
        bytes = fs.readFileSync(file);
    }
    catch (error) {
        throw new CliError("DRAFT_INVALID", `${file}: cannot read it (${error.code ?? "error"})`, [file]);
    }
    const made = await convertDraft(bytes, path.resolve(io.cwd, dir));
    return {
        data: made,
        text: [`created ${made.dir} from ${file} (${made.files} files)`, `next: cd ${dir} && pnpm install && pnpm build && pnpm check`],
    };
};
const initCommand = async (values, io, positionals) => {
    const from = stringFlag(values, "from");
    if (from !== undefined)
        return initFromDraft(from, values, io, positionals);
    const [dir] = positionals;
    if (dir === undefined)
        usage("init needs a folder: agentflow-app init <dir> --prefix <prefix>");
    const prefix = stringFlag(values, "prefix");
    if (prefix === undefined)
        usage("init needs --prefix <prefix>, the publisher's prefix in the package id");
    const named = stringFlag(values, "key");
    const key = named ?? path.basename(path.resolve(io.cwd, dir));
    const made = await initProject(path.resolve(io.cwd, dir), {
        prefix: prefix,
        key,
        keyFromFolder: named === undefined,
        ui: !values["no-ui"],
        site: !values["no-site"],
    });
    return {
        data: made,
        text: [`created ${made.dir} for package ${made.id}`, `next: cd ${dir} && pnpm install && pnpm build`],
    };
};
const keygenCommand = async (values, io) => {
    const keyId = stringFlag(values, "key-id");
    if (keyId === undefined)
        usage("keygen needs --key-id <id>");
    const out = path.resolve(io.cwd, stringFlag(values, "out") ?? path.join("keys", `${keyId}.pem`));
    const made = keygen(keyId, out);
    return {
        data: { file: made.file, key_id: made.keyId },
        text: [
            `wrote ${made.file}`,
            `key id: ${made.keyId}`,
            "the key is secret: never commit, paste or print it (init's .gitignore ignores keys/); the id is not secret",
        ],
    };
};
const seal = async (values, io) => {
    const keyFile = stringFlag(values, "key") ? path.resolve(io.cwd, stringFlag(values, "key")) : findKey(path.join(io.cwd, "keys"));
    const keyId = stringFlag(values, "key-id") ?? path.basename(keyFile, path.extname(keyFile));
    const key = readKeyFile(keyFile, keyId);
    const files = readPackageDir(io.cwd);
    const sealed = sign(files, key);
    requireUiEntry(files);
    const outDir = path.resolve(io.cwd, stringFlag(values, "out") ?? "dist-app");
    const file = path.join(outDir, sealed.fileName);
    fs.mkdirSync(outDir, { recursive: true });
    let unchanged = false;
    try {
        fs.writeFileSync(file, sealed.bytes, { flag: "wx" });
    }
    catch (error) {
        if (error.code !== "EEXIST")
            throw error;
        if (!fs.readFileSync(file).equals(sealed.bytes)) {
            throw new SealError("SEAL_OUT_EXISTS", `${file} exists with other contents: raise version in config/package-manifest.json; if that version never reached a deployment or the catalog, delete ${file} and seal again`, [file]);
        }
        unchanged = true;
    }
    const data = { file, package_id: sealed.id, version: sealed.version, digest: sealed.digest, signer: sealed.signer, unchanged };
    const text = [`${unchanged ? "unchanged:" : "sealed"} ${file}`, `package ${sealed.id} ${sealed.version}`, `digest ${sealed.digest}`, `signer ${sealed.signer}`];
    return { data, text };
};
const lintCommand = async (values, io) => {
    const platform = Platform.configure(envOf(io), stringFlag(values, "url"));
    try {
        await requireFresh(io.cwd);
    }
    catch (error) {
        refuseFileError(error);
    }
    const files = readPayloadDir(path.join(io.cwd, "package"));
    const zip = writeStoredZip([...files].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
    const { body } = await platform.postPackage("/app-packages/lint", zip, "package.zip");
    if (!Array.isArray(body.problems))
        throw platform.unexpected("a lint answer without problems");
    const version = typeof body.platform_version === "string" ? body.platform_version : "unknown";
    const lines = body.problems.map(problemLine);
    const count = lines.length === 1 ? "1 problem" : `${lines.length} problems`;
    return {
        data: body,
        text: lines.length ? [...lines, `${count} (AgentFlow ${version})`] : [`no problems (AgentFlow ${version})`],
        ...(lines.length ? { exit: 1 } : {}),
    };
};
function readJsonObject(cwd, flag, name) {
    if (flag === undefined)
        return undefined;
    const file = path.resolve(cwd, flag);
    let value;
    try {
        value = JSON.parse(fs.readFileSync(file, "utf8"));
    }
    catch (error) {
        const code = error.code;
        return usage(`${name} ${file}: ${code ? `cannot read it (${code})` : "not JSON"}`);
    }
    if (!isRecord(value))
        usage(`${name} ${file}: not a JSON object`);
    return value;
}
// A request may only narrow what an app gets, so a decisions file holds grant declines and nothing else; AgentFlow
// judges it again and has the last word.
function checkDecisions(flag, decisions) {
    if (!decisions)
        return;
    const refused = (where) => usage(`--decisions ${flag}: ${where}; it may only decline grants, as {"grants": {"<package>": {"<grant key>": "declined"}}}, and the admin who approves decides the rest`);
    for (const [member, packages] of Object.entries(decisions)) {
        if (member !== "grants")
            refused(`${member} is not a grant decline`);
        if (!isRecord(packages))
            return refused("grants is not an object");
        for (const [pkg, grants] of Object.entries(packages)) {
            if (!isRecord(grants))
                return refused(`grants.${pkg} is not an object`);
            for (const [key, decision] of Object.entries(grants)) {
                if (decision !== "declined")
                    refused(`grants.${pkg}.${key} is not "declined"`);
            }
        }
    }
}
const deployCommand = async (values, io) => {
    if (values["sandbox"])
        return deploySandbox(values, io);
    if (values["no-arm"])
        usage("--no-arm goes with --sandbox: a deployment outside a sandbox is armed by the admin who approves it");
    const platform = Platform.configure(envOf(io), stringFlag(values, "url"));
    const parameters = readJsonObject(io.cwd, stringFlag(values, "parameters"), "--parameters");
    const decisions = readJsonObject(io.cwd, stringFlag(values, "decisions"), "--decisions");
    checkDecisions(stringFlag(values, "decisions"), decisions);
    const file = sealedFile(io.cwd, stringFlag(values, "file"));
    const json = values["json"] === true;
    const say = (stream, line) => {
        if (!json)
            stream.write(`${line}\n`);
    };
    const uploaded = await platform.postPackage("/app-packages", readSealed(file), path.basename(file));
    const release = releaseOf(platform, uploaded.body);
    const pkg = { ...release, uploaded: uploaded.status === 201 };
    say(io.stdout, `${pkg.uploaded ? "uploaded" : "already uploaded"} ${release.package_id} ${release.version}`);
    const made = await createDeployment(platform, release, parameters, decisions);
    say(io.stdout, progressLine(made));
    if (!values["wait"] || SETTLED.has(made.status))
        return { data: { package: pkg, deployment: made.body }, text: [] };
    say(io.stderr, "waiting; Ctrl-C stops waiting, and the deployment stays");
    const { deployment, stopped } = await waitFor(platform, made, {
        sleep: io.sleep,
        onInterrupt: io.onInterrupt,
        progress: (line) => say(io.stderr, line),
    });
    const data = { package: pkg, deployment: deployment.body };
    if (stopped) {
        const note = `stopped waiting: deployment ${deployment.deployment_id} is ${statusWord(deployment.status)}; it goes on at ${deployment.approve_url}`;
        return { data, text: [], note, exit: 130 };
    }
    if (deployment.status !== "installed")
        throw new CliError("DEPLOY_FAILED", endedMessage(deployment));
    return { data, text: ["installed"] };
};
const HANDLERS = {
    init: initCommand,
    build,
    keygen: keygenCommand,
    seal,
    lint: lintCommand,
    deploy: deployCommand,
    publish: publishCommand,
    withdraw: withdrawCommand,
    sandbox: sandboxCommand,
    types: async (values, io, positionals) => {
        try {
            return await typesCommand(values, io, positionals);
        }
        catch (error) {
            return refuseFileError(error);
        }
    },
};
function parse(command, args) {
    const options = {};
    for (const flag of COMMANDS[command])
        options[flag.slice(2)] = { type: BOOLEAN_FLAGS.has(flag) ? "boolean" : "string" };
    try {
        const { values, positionals } = parseArgs({ args, options, strict: true, allowPositionals: true });
        return { values: values, positionals };
    }
    catch (error) {
        return usage(error.message);
    }
}
function redacting(stream, secrets) {
    return new Writable({
        write(chunk, _encoding, done) {
            let text = String(chunk);
            for (const secret of secrets) {
                if (!secret)
                    continue;
                const escaped = JSON.stringify(secret).slice(1, -1);
                for (const form of escaped === secret ? [secret] : [secret, escaped])
                    text = text.split(form).join("[redacted]");
            }
            stream.write(text);
            done();
        },
    });
}
export async function main(argv, given) {
    const env = given.env ?? process.env;
    const secrets = new Set();
    for (const secret of [env.AGENTFLOW_TOKEN, env.AGENTFLOW_SANDBOX_KEY])
        if (secret)
            secrets.add(secret);
    const io = { ...given, secrets, stdout: redacting(given.stdout, secrets), stderr: redacting(given.stderr, secrets) };
    const json = argv.includes("--json");
    const write = (stream, text) => void stream.write(text.endsWith("\n") ? text : `${text}\n`);
    const refuse = (code, refusal, extra = "") => {
        if (json)
            write(io.stdout, JSON.stringify({ error: refusal }));
        else
            write(io.stderr, `${refusal.code}: ${refusal.message}${extra}`);
        return code;
    };
    const [command, ...rest] = argv;
    const head = command === "--json" ? rest[0] : command;
    const helpAsked = argv.some((arg) => arg === "--help" || arg === "-h");
    if (helpAsked) {
        write(io.stdout, json ? JSON.stringify({ usage: USAGE }) : USAGE);
        return 0;
    }
    if (head === undefined) {
        if (json)
            return refuse(2, { code: "USAGE", message: USAGE });
        write(io.stderr, USAGE);
        return 2;
    }
    const handler = Object.hasOwn(COMMANDS, command) ? HANDLERS[command] : undefined;
    if (!handler)
        return refuse(2, { code: "USAGE", message: `unknown command: ${command}` }, `\n\n${USAGE}`);
    try {
        const { values, positionals } = parse(command, rest);
        const allowed = command === "init" || command === "sandbox" || command === "publish" || command === "withdraw" ? 1 : 0;
        if (positionals.length > allowed)
            usage(`unexpected argument: ${positionals[allowed]}`);
        const outcome = await handler(values, io, positionals);
        if (outcome.note)
            write(io.stderr, outcome.note);
        if (json)
            write(io.stdout, JSON.stringify(outcome.data));
        else
            for (const line of outcome.text)
                write(io.stdout, line);
        return outcome.exit ?? 0;
    }
    catch (error) {
        if (error instanceof UsageError)
            return refuse(2, { code: "USAGE", message: error.message }, `\n\n${USAGE}`);
        return refuse(1, toRefusal(error));
    }
}
//# sourceMappingURL=cli.js.map