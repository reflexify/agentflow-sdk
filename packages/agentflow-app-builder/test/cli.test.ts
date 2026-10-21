import { generateKeyPairSync } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Writable } from "node:stream";
import { describe, expect, it } from "vitest";
import { COMMANDS, ERROR_CODES, main, USAGE } from "../src/cli.js";
import { copyApp } from "./app-fixture.js";

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
    expect(out.stderr).toContain(`PACKAGE_MISSING: no package/ in ${app}: run agentflow-app build first`);
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
      message: "package/manifest.json declares a UI module, but package/ui/index.js is missing: run agentflow-app build first",
      files: ["package/ui/index.js"],
    });
    expect(fs.existsSync(path.join(app, "dist-app"))).toBe(false);

    fs.mkdirSync(path.join(app, "package/ui"));
    fs.writeFileSync(path.join(app, "package/ui/index.js"), "function mount() {}\nexport { mount };\n");
    expect((await run(app, ["seal"])).code).toBe(0);
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
      `SEAL_OUT_EXISTS: ${fileOf(app)} exists with other contents: raise version in config/package-manifest.json`,
    );
    expect(fs.readFileSync(fileOf(app)).equals(before)).toBe(true);
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

  it("prints the usage to stdout and returns 0 for --help, -h and <command> --help", async () => {
    for (const argv of [["--help"], ["-h"], ["init", "--help"], ["build", "-h"], ["deploy", "--help"], ["seal", "--help"]]) {
      const out = await run(copyApp(), argv);
      expect(out.code).toBe(0);
      expect(out.stdout).toContain(USAGE);
      expect(out.stderr).toBe("");
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
    expect(COMMANDS.build).toEqual(["--check", "--json"]);
    expect(COMMANDS.seal).toEqual(["--key", "--key-id", "--out", "--json"]);
    expect(COMMANDS.lint).toEqual(["--url", "--json"]);
    expect(COMMANDS.deploy).toEqual(["--file", "--parameters", "--decisions", "--wait", "--url", "--json"]);
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
          for (const m of text.matchAll(/"((?:APP|BUILD|CONFIG|DEPLOY|DRAFT|INIT|KEY|PACKAGE|SEAL|UI)_[A-Z_]+)"/g)) found.add(m[1]!);
        }
      }
    };
    walk(src);
    expect(found.size).toBeGreaterThan(15);
    expect(ERROR_CODES).toEqual(expect.arrayContaining(["USAGE", "INTERNAL"]));
    expect([...found].filter((code) => !(ERROR_CODES as readonly string[]).includes(code))).toEqual([]);
  });
});
