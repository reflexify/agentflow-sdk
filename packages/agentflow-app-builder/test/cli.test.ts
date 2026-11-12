import { generateKeyPairSync } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Writable } from "node:stream";
import { describe, expect, it } from "vitest";
import { COMMANDS, ERROR_CODES, main, USAGE } from "../src/cli.js";
import { readZip, writeStoredZip } from "../src/seal/zip.js";
import { copyApp, withUi, writeApp } from "./app-fixture.js";

const posix = process.platform !== "win32";

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

async function run(cwd: string, argv: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  const out = capture();
  const err = capture();
  const code = await main(argv, { cwd, stdout: out.stream, stderr: err.stream });
  return { code, stdout: out.text(), stderr: err.text() };
}

const fileOf = (app: string) => path.join(app, "dist-app", "rfx-mini-1.0.0.afpkg");
const objectFile = (app: string) => {
  const dir = path.join(app, "package/objects/entity");
  return path.join(dir, fs.readdirSync(dir).sort()[0]!);
};

function refusable(app: string): void {
  const file = path.join(app, "config/entities/note.json");
  fs.writeFileSync(file, JSON.stringify({ ...JSON.parse(fs.readFileSync(file, "utf8")), nonsense: true }));
}

async function sealed(): Promise<string> {
  const app = copyApp();
  await run(app, ["build"]);
  await run(app, ["keygen", "--key-id", "acme-1"]);
  return app;
}

describe("a reader that closes stdout early", () => {
  // `agentflow-app keygen | head -2`: the pipe closes, the next write fails with EPIPE, and Node emits that as an
  // 'error' on the stream. Nothing listened, so the process died with a stack trace after the work was done.
  const closedPipe = () =>
    new Writable({
      write(_chunk, _encoding, done) {
        done(Object.assign(new Error("write EPIPE"), { code: "EPIPE" }));
      },
    });

  it("finishes quietly, with the exit code the command had", async () => {
    const app = copyApp();
    const err = capture();
    const failures: unknown[] = [];
    const onUncaught = (error: unknown): void => void failures.push(error);
    process.on("uncaughtException", onUncaught);
    try {
      const code = await main(["build"], { cwd: app, stdout: closedPipe(), stderr: err.stream });
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(code).toBe(0);
    } finally {
      process.off("uncaughtException", onUncaught);
    }
    expect(failures).toEqual([]);
    expect(err.text()).toBe("");
  });

  it("still stops on a write error that is not a closed pipe", async () => {
    const app = copyApp();
    const full = new Writable({
      write(_chunk, _encoding, done) {
        done(Object.assign(new Error("write ENOSPC"), { code: "ENOSPC" }));
      },
    });
    const failures: unknown[] = [];
    const onUncaught = (error: unknown): void => void failures.push(error);
    process.on("uncaughtException", onUncaught);
    try {
      await main(["build"], { cwd: app, stdout: full, stderr: capture().stream });
      await new Promise((resolve) => setTimeout(resolve, 10));
    } finally {
      process.off("uncaughtException", onUncaught);
    }
    expect(failures).toHaveLength(1);
  });
});

describe("seal", () => {
  it("seals the built package and prints one JSON line", async () => {
    const app = copyApp();
    expect(await run(app, ["build"])).toMatchObject({ code: 0 });
    expect(await run(app, ["keygen", "--key-id", "acme-1"])).toMatchObject({ code: 0 });
    const out = await run(app, ["seal", "--json"]);
    expect(out.code).toBe(0);
    expect(out.stdout.trim().split("\n")).toHaveLength(1);
    expect(JSON.parse(out.stdout)).toEqual({
      file: fileOf(app),
      package_id: "rfx/mini",
      version: "1.0.0",
      digest: expect.stringMatching(/^[0-9a-f]{64}$/),
      signer: "acme-1",
      unchanged: false,
    });
    expect(fs.existsSync(fileOf(app))).toBe(true);
  });

  it("reports the sealed file in plain words without --json", async () => {
    const app = await sealed();
    const out = await run(app, ["seal"]);
    expect(out.code).toBe(0);
    expect(out.stdout).toContain(fileOf(app));
    expect(out.stdout).toContain("rfx/mini");
  });

  it.skipIf(!posix)("refuses a key other users can read, and says chmod 600", async () => {
    const app = await sealed();
    const key = path.join(app, "keys/acme-1.pem");
    fs.chmodSync(key, 0o644);
    const out = await run(app, ["seal"]);
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("KEY_PERMISSIONS");
    expect(out.stderr).toContain(`chmod 600 ${key}`);
    expect(fs.existsSync(fileOf(app))).toBe(false);
  });

  it("finds the ed25519 key beside an RSA one, and has no key with only the RSA one", async () => {
    const app = await sealed();
    const rsa = path.join(app, "keys/private.pem");
    fs.writeFileSync(rsa, generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey.export({ type: "pkcs8", format: "pem" }), { mode: 0o600 });
    expect(await run(app, ["seal"])).toMatchObject({ code: 0 });
    fs.rmSync(path.join(app, "keys/acme-1.pem"));
    const out = await run(app, ["seal"]);
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("KEY_MISSING");
    expect(out.stderr).toContain("pass --key <file> to seal with your publisher's key");
    const named = await run(app, ["seal", "--key", "keys/private.pem"]);
    expect(named.code).toBe(1);
    expect(named.stderr).toContain("KEY_INVALID");
  });

  it("refuses two ed25519 keys until one is named", async () => {
    const app = await sealed();
    await run(app, ["keygen", "--key-id", "acme-2"]);
    expect((await run(app, ["seal"])).stderr).toContain("KEY_AMBIGUOUS");
    const named = await run(app, ["seal", "--key", "keys/acme-2.pem", "--json"]);
    expect(JSON.parse(named.stdout)).toMatchObject({ signer: "acme-2" });
    const renamed = await run(app, ["seal", "--key", "keys/acme-2.pem", "--key-id", "other", "--out", "out", "--json"]);
    expect(JSON.parse(renamed.stdout)).toMatchObject({ signer: "other", file: path.join(app, "out", "rfx-mini-1.0.0.afpkg") });
  });

  it("refuses a file that is not part of a package, and names it", async () => {
    const app = await sealed();
    fs.writeFileSync(path.join(app, "package/.DS_Store"), "x");
    const out = await run(app, ["seal"]);
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("SEAL_FILE_UNLISTED");
    expect(out.stderr).toContain(".DS_Store");
  });

  it("says to build first when there is no package", async () => {
    const app = copyApp();
    fs.rmSync(path.join(app, "package"), { recursive: true });
    await run(app, ["keygen", "--key-id", "acme-1"]);
    const out = await run(app, ["seal"]);
    expect(out.code).toBe(1);
    expect(out.stderr).toContain(`PACKAGE_MISSING: no package/ in ${app}: run pnpm build first`);
  });

  it("refuses a manifest that declares a UI module whose entry was never built", async () => {
    const app = await sealed();
    const manifestFile = path.join(app, "package/manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
    fs.writeFileSync(manifestFile, JSON.stringify({ ...manifest, ui: { kind: "module", entry: "ui/index.js", contract: 1 } }, null, 2));
    const out = await run(app, ["seal", "--json"]);
    expect(out.code).toBe(1);
    expect(JSON.parse(out.stdout).error).toEqual({
      code: "UI_ENTRY_MISSING",
      message: "package/manifest.json declares a UI module, but package/ui/index.js is missing: run pnpm build first",
      files: ["package/ui/index.js"],
    });
    expect(fs.existsSync(path.join(app, "dist-app"))).toBe(false);

    fs.mkdirSync(path.join(app, "package/ui"));
    fs.writeFileSync(path.join(app, "package/ui/index.js"), "function mount() {}\nexport { mount };\n");
    expect((await run(app, ["seal"])).code).toBe(0);
  });

  it("warns in build and in seal when the UI module is the empty stub, and not for a real module", async () => {
    const app = copyApp();
    withUi(app);
    writeApp(app, `export default { sections: ${JSON.stringify({ workflows: {}, order: [], triggers: {}, actions: {} })}, ui: { prebuilt: "ui" } };\n`);
    fs.mkdirSync(path.join(app, "ui"));
    const stub = "function mount() { return () => {}; }\nexport { mount };\n";
    fs.writeFileSync(path.join(app, "ui/index.js"), stub);
    const warning = `warning: the UI module ui/index.js (${Buffer.byteLength(stub)} bytes) is an empty stub: it opens a blank screen`;
    const built = await run(app, ["build"]);
    expect(built).toMatchObject({ code: 0 });
    expect(built.stderr).toContain(warning);
    expect(JSON.parse((await run(app, ["build", "--json"])).stdout).warnings).toEqual([expect.stringContaining("is an empty stub")]);
    await run(app, ["keygen", "--key-id", "acme-1"]);
    const sealedOut = await run(app, ["seal"]);
    expect(sealedOut).toMatchObject({ code: 0 });
    expect(sealedOut.stderr).toContain(warning);
    expect(JSON.parse((await run(app, ["seal", "--json"])).stdout)).toMatchObject({ unchanged: true, warnings: [expect.stringContaining("remove ui")] });

    fs.writeFileSync(path.join(app, "ui/index.js"), "function mount(root) { root.textContent = 'Notes'; return () => {}; }\nexport { mount };\n");
    const real = await run(app, ["build"]);
    expect(real.stderr).not.toContain("empty stub");
    fs.rmSync(path.join(app, "dist-app"), { recursive: true });
    const resealed = await run(app, ["seal", "--json"]);
    expect(resealed.code).toBe(0);
    expect(JSON.parse(resealed.stdout).warnings).toBeUndefined();
  });

  it("leaves an unchanged seal alone and refuses a changed one without a version bump", async () => {
    const app = await sealed();
    expect((await run(app, ["seal"])).code).toBe(0);
    const before = fs.readFileSync(fileOf(app));
    const again = await run(app, ["seal"]);
    expect(again.code).toBe(0);
    expect(again.stdout).toContain(`unchanged: ${fileOf(app)}`);
    expect(again.stdout).not.toContain("sealed ");
    expect(again.stderr).toBe("");
    expect(again.stdout).toContain("digest ");
    const asJson = await run(app, ["seal", "--json"]);
    expect(asJson.code).toBe(0);
    expect(JSON.parse(asJson.stdout)).toMatchObject({ file: fileOf(app), unchanged: true });
    expect(fs.readFileSync(fileOf(app)).equals(before)).toBe(true);

    const note = path.join(app, "config/entities/note.json");
    const source = JSON.parse(fs.readFileSync(note, "utf8"));
    source.name = `${source.name} changed`;
    fs.writeFileSync(note, JSON.stringify(source, null, 2));
    expect((await run(app, ["build"])).code).toBe(0);
    const out = await run(app, ["seal"]);
    expect(out.code).toBe(1);
    expect(out.stderr).toContain(
      `SEAL_OUT_EXISTS: ${fileOf(app)} exists with other contents: raise version in config/package-manifest.json; ` +
        `if that version never reached a deployment or the catalog, delete ${fileOf(app)} and seal again`,
    );
    expect(fs.readFileSync(fileOf(app)).equals(before)).toBe(true);
  });

  it("takes a package whose JSON differs only in member order as unchanged, unless another key signs it", async () => {
    const app = await sealed();
    const first = await run(app, ["seal", "--json"]);
    expect(first.code).toBe(0);
    const before = fs.readFileSync(fileOf(app));
    const file = objectFile(app);
    const value = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>;
    fs.writeFileSync(file, JSON.stringify(Object.fromEntries(Object.entries(value).reverse()), null, 4));

    const again = await run(app, ["seal", "--json"]);
    expect(again.code).toBe(0);
    expect(JSON.parse(again.stdout)).toMatchObject({ unchanged: true, digest: JSON.parse(first.stdout).digest });
    expect(fs.readFileSync(fileOf(app)).equals(before)).toBe(true);

    expect((await run(app, ["keygen", "--key-id", "acme-2"])).code).toBe(0);
    const other = await run(app, ["seal", "--key", "keys/acme-2.pem"]);
    expect(other.code).toBe(1);
    expect(other.stderr).toContain(`SEAL_OUT_EXISTS: ${fileOf(app)} holds this package sealed by another key: delete ${fileOf(app)}`);
    expect(fs.readFileSync(fileOf(app)).equals(before)).toBe(true);

    // An archive whose own files no longer match its hashes.json is not the package, whatever it claims.
    const entries = readZip(before);
    const inside = `objects/entity/${path.basename(file)}`;
    entries.set(inside, Buffer.from(JSON.stringify({ ...value, name: "edited by hand" })));
    fs.writeFileSync(fileOf(app), writeStoredZip([...entries]));
    const edited = await run(app, ["seal", "--key", "keys/acme-1.pem"]);
    expect(edited.code).toBe(1);
    expect(edited.stderr).toContain(`SEAL_OUT_EXISTS: ${fileOf(app)} exists with other contents`);
  });

  it("refuses an unknown flag", async () => {
    const app = await sealed();
    const out = await run(app, ["seal", "--nope"]);
    expect(out.code).toBe(2);
    expect(out.stderr).toContain("USAGE");
  });
});

describe("keygen", () => {
  it("prints the file and the key id, never the private key", async () => {
    const app = copyApp();
    const out = await run(app, ["keygen", "--key-id", "acme-1"]);
    expect(out.code).toBe(0);
    const file = path.join(app, "keys/acme-1.pem");
    expect(out.stdout).toContain(file);
    expect(out.stdout).toContain("key id: acme-1");
    expect(out.stdout).toContain("the key is secret: never commit, paste or print it");
    const pem = fs.readFileSync(file, "utf8");
    const body = pem.split("\n").filter((l) => l && !l.startsWith("-----")).join("");
    for (const text of [out.stdout, out.stderr]) {
      expect(text).not.toContain("PRIVATE");
      expect(text).not.toContain(body);
    }
  });

  it("prints the same facts as JSON", async () => {
    const app = copyApp();
    const out = await run(app, ["keygen", "--key-id", "acme-1", "--out", "somewhere/k.pem", "--json"]);
    expect(JSON.parse(out.stdout)).toEqual({
      file: path.join(app, "somewhere/k.pem"),
      key_id: "acme-1",
    });
    expect(out.stdout).not.toContain("PRIVATE");
  });

  it("never overwrites a key", async () => {
    const app = copyApp();
    expect((await run(app, ["keygen", "--key-id", "acme-1"])).code).toBe(0);
    const second = await run(app, ["keygen", "--key-id", "acme-1"]);
    expect(second.code).toBe(1);
    expect(second.stderr).toContain("KEY_EXISTS");
  });

  it("needs a key id, and a valid one", async () => {
    const app = copyApp();
    expect((await run(app, ["keygen"])).code).toBe(2);
    const bad = await run(app, ["keygen", "--key-id", "a b"]);
    expect(bad.code).toBe(1);
    expect(bad.stderr).toContain("KEY_ID_INVALID");
  });

  it("refuses a key id outside the allowed characters, and says what is allowed", async () => {
    const app = copyApp();
    for (const id of ["a/b", "_lead", ".lead", "caf\u00e9", "x".repeat(65)]) {
      const bad = await run(app, ["keygen", "--key-id", id]);
      expect(bad.code, id).toBe(1);
      expect(bad.stderr, id).toContain("KEY_ID_INVALID");
      expect(bad.stderr, id).toContain("letters, digits");
    }
    expect(fs.existsSync(path.join(app, "keys"))).toBe(false);
    for (const id of ["a", "Acme_2026.v1-x", "x".repeat(64)]) expect((await run(app, ["keygen", "--key-id", id])).code, id).toBe(0);
  });
});

describe("build", () => {
  it("builds, then --check finds it clean", async () => {
    const app = copyApp();
    const built = await run(app, ["build"]);
    expect(built.code).toBe(0);
    expect(built.stdout).toMatch(/wrote \d+ package files/);
    expect(built.stdout).toContain("ui: none");
    expect(await run(app, ["build", "--check"])).toMatchObject({ code: 0 });
    expect(JSON.parse((await run(app, ["build", "--json"])).stdout)).toEqual({ files: expect.any(Number), ui: "none" });
  });

  it("says when it raises minPlatformVersion, and why, and is quiet when the config's month is enough", async () => {
    const app = copyApp();
    const note = path.join(app, "config/entities/note.json");
    const entity = JSON.parse(fs.readFileSync(note, "utf8"));
    entity.fields[0].queriedByApp = true;
    fs.writeFileSync(note, JSON.stringify(entity));
    const line = "minPlatformVersion: 2027.01, raised from 2026.10 for a field's queriedByApp";
    const built = await run(app, ["build"]);
    expect(built.stdout.split("\n")).toEqual([expect.stringMatching(/^wrote \d+ package files$/), line, "ui: none", ""]);
    expect(JSON.parse((await run(app, ["build", "--json"])).stdout).platform).toBe(line);
    expect((await run(app, ["build", "--check"])).stdout).not.toContain("minPlatformVersion");
    const manifest = path.join(app, "config/package-manifest.json");
    fs.writeFileSync(manifest, JSON.stringify({ ...JSON.parse(fs.readFileSync(manifest, "utf8")), minPlatformVersion: "2027.01" }));
    expect((await run(app, ["build"])).stdout).not.toContain("minPlatformVersion");
  });

  it("--check lists a stale file, and passes again after build", async () => {
    const app = copyApp();
    await run(app, ["build"]);
    const file = objectFile(app);
    fs.writeFileSync(file, `${fs.readFileSync(file, "utf8")} `);
    const stale = await run(app, ["build", "--check"]);
    expect(stale.code).toBe(1);
    expect(stale.stderr).toContain("PACKAGE_STALE");
    expect(stale.stderr).toContain(path.relative(path.join(app, "package"), file));
    const json = JSON.parse((await run(app, ["build", "--check", "--json"])).stdout);
    expect(json.error.code).toBe("PACKAGE_STALE");
    expect(json.error.files).toContain(`package/${path.relative(path.join(app, "package"), file)}`);
    await run(app, ["build"]);
    expect(await run(app, ["build", "--check"])).toMatchObject({ code: 0 });
  });

  it("--check reports a missing and an extra file", async () => {
    const app = copyApp();
    await run(app, ["build"]);
    fs.rmSync(objectFile(app));
    fs.writeFileSync(path.join(app, "package/objects/stray.json"), "{}");
    const out = await run(app, ["build", "--check"]);
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("stray.json");
  });

  it("--check --values passes members in another order, and names a changed value without touching package/", async () => {
    const app = copyApp();
    await run(app, ["build"]);
    const file = objectFile(app);
    const rel = path.relative(path.join(app, "package"), file);
    const value = JSON.parse(fs.readFileSync(file, "utf8"));
    fs.writeFileSync(file, JSON.stringify(Object.fromEntries(Object.entries(value).reverse())));
    expect((await run(app, ["build", "--check"])).code).toBe(1);
    const same = await run(app, ["build", "--check", "--values"]);
    expect(same).toMatchObject({ code: 0 });
    expect(same.stdout).toContain("package/ holds the values the config builds");

    const [key] = Object.keys(value).filter((k) => typeof value[k] === "string");
    fs.writeFileSync(file, JSON.stringify({ ...value, [key!]: "changed" }));
    const before = fs.readFileSync(file, "utf8");
    const differs = await run(app, ["build", "--check", "--values", "--json"]);
    expect(differs.code).toBe(1);
    expect(JSON.parse(differs.stdout).error).toMatchObject({
      code: "PACKAGE_DIFFERS",
      message: expect.stringContaining(`${rel}#/${key}`),
      files: [`package/${rel}`],
    });
    expect(fs.readFileSync(file, "utf8")).toBe(before);

    expect((await run(app, ["build", "--values"])).code).toBe(2);
  });

  it("reports a config the builder refuses as BUILD_REFUSED", async () => {
    const app = copyApp();
    refusable(app);
    const out = await run(app, ["build"]);
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^BUILD_REFUSED: \S*note\.json#\//m);
  });

  it("prints a refusal as one JSON value on stdout and nothing on stderr", async () => {
    const app = copyApp();
    refusable(app);
    const out = await run(app, ["build", "--json"]);
    expect(out.code).toBe(1);
    expect(out.stderr).toBe("");
    const body = JSON.parse(out.stdout);
    expect(body).toEqual({ error: { code: "BUILD_REFUSED", message: expect.stringContaining("note.json#/") } });
  });

  it("names the config version codes", async () => {
    const app = copyApp();
    const file = path.join(app, "config/package-manifest.json");
    const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
    delete manifest.configVersion;
    fs.writeFileSync(file, JSON.stringify(manifest));
    expect((await run(app, ["build"])).stderr).toContain("CONFIG_VERSION_MISSING");
    manifest.configVersion = 99;
    fs.writeFileSync(file, JSON.stringify(manifest));
    expect((await run(app, ["build"])).stderr).toContain("CONFIG_VERSION_UNKNOWN");
  });

  it("needs an agentflow.app.mjs", async () => {
    const app = copyApp();
    fs.rmSync(path.join(app, "agentflow.app.mjs"));
    const out = await run(app, ["build"]);
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("APP_FILE_MISSING");
  });
});

describe("usage", () => {
  it("prints the usage and returns 2 for an unknown command", async () => {
    const out = await run(copyApp(), ["frobnicate"]);
    expect(out.code).toBe(2);
    expect(out.stderr).toContain(USAGE);
    expect(out.stdout).toBe("");
  });

  it("prints the usage for no command to stderr and returns 2", async () => {
    const out = await run(copyApp(), []);
    expect(out.code).toBe(2);
    expect(out.stderr).toContain(USAGE);
  });

  it("prints the usage to stdout and returns 0 for --help, -h and an unknown command's --help", async () => {
    for (const argv of [["--help"], ["-h"], ["nope", "--help"]]) {
      const out = await run(copyApp(), argv);
      expect(out.code).toBe(0);
      expect(out.stdout).toContain(USAGE);
      expect(out.stderr).toBe("");
    }
  });

  it("prints a command's own forms for <command> --help, with what every command shares", async () => {
    for (const [argv, flags, others] of [
      [["init", "--help"], ["--prefix", "--from", "--no-ui"], ["keygen", "AGENTFLOW_URL"]],
      [["build", "-h"], ["--check", "--values"], ["init <dir>", "AGENTFLOW_URL"]],
      [["--json", "seal", "--help"], ["--key-id", "--out"], ["deploy [", "AGENTFLOW_URL"]],
      [["deploy", "--help"], ["--parameters", "--sandbox", "--upgrade", "AGENTFLOW_URL"], ["init <dir>", "sandbox check"]],
    ] as const) {
      const out = await run(copyApp(), [...argv]);
      expect(out.code).toBe(0);
      const text: string = (argv as readonly string[]).includes("--json") ? JSON.parse(out.stdout).usage : out.stdout;
      const command = (argv as readonly string[]).find((arg) => !arg.startsWith("-"))!;
      expect(text).toMatch(new RegExp(`^Usage: agentflow-app ${command} `));
      for (const flag of flags) expect(text).toContain(flag);
      for (const other of others) expect(text).not.toContain(other);
      expect(text).toContain("Every command takes --json");
    }
  });

  it("returns 2 for a stray argument", async () => {
    expect((await run(copyApp(), ["build", "extra"])).code).toBe(2);
  });

  it("reports a usage error as JSON when --json is among the arguments", async () => {
    const out = await run(copyApp(), ["seal", "--nope", "--json"]);
    expect(out.code).toBe(2);
    expect(out.stderr).toBe("");
    expect(JSON.parse(out.stdout).error.code).toBe("USAGE");
  });

  it("prints the usage as one JSON value for --help with --json, and a JSON usage error for no command", async () => {
    for (const argv of [["--help", "--json"], ["--json", "--help"], ["-h", "--json"]]) {
      const out = await run(copyApp(), argv);
      expect(out.code).toBe(0);
      expect(out.stderr).toBe("");
      expect(out.stdout.trim().split("\n")).toHaveLength(1);
      expect(JSON.parse(out.stdout)).toEqual({ usage: USAGE });
    }
    const bare = await run(copyApp(), ["--json"]);
    expect(bare.code).toBe(2);
    expect(bare.stdout.trim().split("\n")).toHaveLength(1);
    expect(JSON.parse(bare.stdout).error.code).toBe("USAGE");
  });

  it("refuses a missing config file as BUILD_REFUSED naming it, not as an internal error", async () => {
    const app = copyApp();
    const file = path.join(app, "config/package-manifest.json");
    fs.rmSync(file);
    for (const argv of [["build"], ["build", "--check"]]) {
      const out = await run(app, argv);
      expect(out.code).toBe(1);
      expect(out.stderr).toContain("BUILD_REFUSED");
      expect(out.stderr).toContain(file);
      expect(out.stderr).not.toContain("INTERNAL");
    }
    const asJson = await run(app, ["build", "--json"]);
    expect(JSON.parse(asJson.stdout).error).toMatchObject({ code: "BUILD_REFUSED", message: expect.stringContaining(file) });
  });

  it("refuses a config file that is not JSON as BUILD_REFUSED, naming the file and the parse message", async () => {
    const app = copyApp();
    const file = path.join(app, "config/package-manifest.json");
    fs.writeFileSync(file, '{ "id": ');
    const out = await run(app, ["build"]);
    expect(out.code).toBe(1);
    expect(out.stderr).toMatch(/^BUILD_REFUSED: /);
    expect(out.stderr).toContain(`${file}: `);
    expect(out.stderr).toMatch(/JSON|Unexpected|end of/);
  });

  it("lists the flags each command takes, and the usage names every command", () => {
    expect(COMMANDS.build).toEqual(["--check", "--values", "--json"]);
    expect(COMMANDS.seal).toEqual(["--key", "--key-id", "--out", "--json"]);
    expect(COMMANDS.lint).toEqual(["--url", "--json"]);
    expect(COMMANDS.deploy).toEqual(["--file", "--parameters", "--decisions", "--wait", "--sandbox", "--upgrade", "--no-arm", "--url", "--json"]);
    expect(COMMANDS.sandbox).toEqual(["--name", "--ttl-days", "--id", "--as", "--connection", "--stream", "--file", "--url", "--json"]);
    expect(COMMANDS.publish).toEqual(["--file", "--url", "--json"]);
    expect(COMMANDS.withdraw).toEqual(["--reason", "--url", "--json"]);
    expect(new Set([...USAGE.matchAll(/^ {2}([a-z]+)\b/gm)].map((m) => m[1]))).toEqual(new Set(Object.keys(COMMANDS)));
    expect(USAGE).toContain("AGENTFLOW_URL");
    expect(USAGE).toContain("AGENTFLOW_TOKEN");
  });

  it("lists every code the library can throw", () => {
    const src = path.join(path.dirname(new URL(import.meta.url).pathname), "../src");
    const found = new Set<string>();
    const walk = (dir: string): void => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(file);
        else if (entry.name.endsWith(".ts") && entry.name !== "cli.ts") {
          const text = fs.readFileSync(file, "utf8");
          for (const m of text.matchAll(/"((?:APP|BUILD|CONFIG|DEPLOY|DRAFT|INIT|KEY|PACKAGE|SANDBOX|SEAL|UI)_[A-Z_]+)"/g)) found.add(m[1]!);
        }
      }
    };
    walk(src);
    expect(found.size).toBeGreaterThan(15);
    expect(ERROR_CODES).toEqual(expect.arrayContaining(["USAGE", "INTERNAL"]));
    // Codes the CLI reads in AgentFlow's answers and never throws.
    const read = ["APP_DEPENDS_ON_FAILED"];
    expect([...found].filter((code) => !(ERROR_CODES as readonly string[]).includes(code) && !read.includes(code))).toEqual([]);
  });
});
