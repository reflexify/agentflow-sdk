import { Writable } from "node:stream";
import { type Env } from "./platform.js";
export declare const COMMANDS: {
    readonly init: readonly ["--prefix", "--key", "--no-ui", "--no-site", "--from", "--json"];
    readonly build: readonly ["--check", "--json"];
    readonly keygen: readonly ["--key-id", "--out", "--json"];
    readonly seal: readonly ["--key", "--key-id", "--out", "--json"];
    readonly lint: readonly ["--url", "--json"];
    readonly deploy: readonly ["--file", "--parameters", "--decisions", "--wait", "--url", "--json"];
};
export declare const ERROR_CODES: readonly ["USAGE", "APP_FILE_MISSING", "APP_FILE_INVALID", "CONFIG_VERSION_MISSING", "CONFIG_VERSION_UNKNOWN", "BUILD_REFUSED", "PACKAGE_STALE", "PACKAGE_MISSING", "UI_TOOL_MISSING", "UI_BUILD_FAILED", "UI_ENTRY_MISSING", "UI_ENTRY_INVALID", "UI_FILE_TYPE", "KEY_EXISTS", "KEY_MISSING", "KEY_AMBIGUOUS", "KEY_PERMISSIONS", "KEY_INVALID", "KEY_ID_INVALID", "SEAL_FILE_UNLISTED", "SEAL_PATH_INVALID", "SEAL_MANIFEST_MISSING", "SEAL_MANIFEST_INVALID", "SEAL_VERSION_INVALID", "SEAL_JSON_INVALID", "SEAL_LIMIT_EXCEEDED", "SEAL_ARCHIVE_INVALID", "SEAL_OUT_EXISTS", "INIT_DIR_NOT_EMPTY", "INIT_NAME_INVALID", "INIT_DIR_UNWRITABLE", "INIT_STARTER_INVALID", "DRAFT_INVALID", "DRAFT_UNSUPPORTED", "DRAFT_REBUILD_DIFFERS", "DEPLOY_NOT_CONFIGURED", "DEPLOY_UNREACHABLE", "SEAL_MISSING", "DEPLOY_FAILED", "INTERNAL"];
export declare const USAGE = "Usage: agentflow-app <command> [options]\n\nCommands:\n  init <dir> --prefix <prefix> [--key <key>] [--no-ui] [--no-site]\n                                      start an app in <dir> from the starter; the key defaults to the folder's name\n  init <dir> --from <draft.zip>       start an app in <dir> from a draft downloaded from Admin \u2192 Apps \u2192 Pack\n  build [--check]                     write package/ from the app's config; --check only compares\n  keygen --key-id <id> [--out <file>] make a signing key (default keys/<id>.pem) and print where it is\n  seal [--key <file>] [--key-id <id>] [--out <dir>]\n                                      sign package/ into <out>/<package>-<version>.afpkg (default dist-app/)\n  lint [--url <url>]                  send package/ to AgentFlow and print the problems it finds\n  deploy [--file <afpkg>] [--parameters <file>] [--decisions <file>] [--wait] [--url <url>]\n                                      upload the sealed package and ask for it to be installed; an admin approves.\n                                      --parameters answers the manifest's parameters by key; --decisions may only\n                                      decline grants: {\"grants\": {\"<package>\": {\"<grant key>\": \"declined\"}}}\n\nlint and deploy read AGENTFLOW_URL (the address you open AgentFlow at; --url overrides it) and AGENTFLOW_TOKEN\n(a service principal's key). The key is never printed.\n\nEvery command takes --json: one JSON value on stdout, an error as {\"error\":{\"code\",\"message\"}}.\nExit codes: 0 done, 1 refused (lint: problems found; deploy --wait: failed or cancelled), 2 usage error,\n130 deploy --wait stopped by Ctrl-C (the deployment stays).";
export interface Io {
    cwd: string;
    stdout: Writable;
    stderr: Writable;
    env?: Env;
    sleep?: (ms: number, signal: AbortSignal) => Promise<void>;
    onInterrupt?: (listener: () => void) => () => void;
}
export declare function main(argv: string[], given: Io): Promise<number>;
//# sourceMappingURL=cli.d.ts.map