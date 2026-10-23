import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Writable } from "node:stream";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { main } from "../src/cli.js";
import { SDK_VERSION } from "../src/config-version.js";
import { initProject, MIRROR_PACKAGES, mirrorRef, PROJECT_PNPM_WORKSPACE } from "../src/init.js";
import { readZip } from "../src/seal/zip.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const builder = path.join(here, "..");
const starter = path.join(builder, "dist/starter");
const caseDesk = path.join(builder, "../../examples/case-desk");
const posix = process.platform !== "win32";

vi.setConfig({ testTimeout: 60_000 });

const roots: string[] = [];
const workDir = (): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "app-builder-init-"));
  roots.push(dir);
  return dir;
};

beforeAll(() => {
  if (!fs.existsSync(path.join(starter, "starter.json"))) {
    execFileSync(process.execPath, [path.join(builder, "scripts/copy-starter.mjs")]);
  }
});
afterEach(() => {
  vi.restoreAllMocks();
});
afterAll(() => {
  for (const dir of roots) fs.rmSync(dir, { recursive: true, force: true });
});

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

const json = (file: string): any => JSON.parse(fs.readFileSync(file, "utf8"));

function listFiles(dir: string): string[] {
  const walk = (current: string): string[] =>
    fs.readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
      const abs = path.join(current, entry.name);
      return entry.isDirectory() ? walk(abs) : [path.relative(dir, abs).split(path.sep).join("/")];
    });
  return walk(dir).sort();
}

const link = (project: string): void => fs.symlinkSync(path.join(caseDesk, "node_modules"), path.join(project, "node_modules"));

// The project's own Vitest, as a team runs it; the runner's variables would make the inner run think it is a worker.
function vitestIn(project: string, args: string[]): void {
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith("VITEST") && key !== "NODE_ENV" && key !== "TEST"));
  try {
    execFileSync(path.join(project, "node_modules/.bin/vitest"), ["run", ...args], { cwd: project, encoding: "utf8", stdio: "pipe", env });
  } catch (error) {
    const failed = error as { stdout?: string; stderr?: string };
    throw new Error(`vitest run ${args.join(" ")}: ${failed.stdout ?? ""}${failed.stderr ?? ""}`);
  }
}

async function start(name: string, flags: string[] = [], prefix = "acme"): Promise<{ root: string; project: string }> {
  const root = workDir();
  const result = await run(root, ["init", name, "--prefix", prefix, ...flags]);
  expect(result, result.stderr).toMatchObject({ code: 0 });
  return { root, project: path.join(root, name) };
}

// What a project holds, said from starter.json and the starter's file list rather than from init's own code.
function expectedFiles(ui: boolean, site: boolean): string[] {
  const groups = json(path.join(starter, "starter.json")) as Record<string, { files: string[] }>;
  const covered = (group: string, file: string) => groups[group]!.files.some((l) => (l.endsWith("/") ? file.startsWith(l) : file === l));
  const dropped = [...(ui ? [] : ["ui"]), ...(site ? [] : ["site"])];
  const out = (json(path.join(starter, ".files.json")) as string[]).filter((file) => !dropped.some((g) => covered(g, file)));
  const noTests = !ui && !site;
  const kept = out.filter((file) => !(noTests && ["vitest.config.ts", "tsconfig.json", "tsconfig.node.json"].includes(file)));
  return [...kept, "pnpm-workspace.yaml"].sort();
}

// What a project's README.md and AGENTS.md may say: nothing of the case desk, no fence comment, nothing of a part
// the project does not have, and what it does have.
function expectDocs(project: string, ui: boolean, site: boolean): void {
  const kept = new Set(listFiles(project));
  const removed = (json(path.join(starter, ".files.json")) as string[]).filter((file) => !kept.has(file));
  for (const doc of ["README.md", "AGENTS.md"]) {
    const text = fs.readFileSync(path.join(project, doc), "utf8");
    expect(text, doc).not.toMatch(/case[- ]desk/i);
    expect(text, doc).not.toContain("starter:");
    expect(text, doc).not.toContain("sdk/examples");
    expect(text, doc).not.toMatch(/\n{3,}/);
    for (const file of removed) expect(text, `${doc} names ${file}`).not.toContain(file);
    const gone = [
      ...(ui ? [] : ["src/module", "module.html", "pnpm demo", "package/ui", "UI module", "Cases screen", "launcher"]),
      ...(site ? [] : ["RUNBOOK.md", "server/", "pnpm start", "pnpm dev", "pnpm setup-keys", "pnpm check-setup", "standalone site"]),
      ...(ui || site ? [] : ["pnpm typecheck"]),
    ];
    for (const word of gone) expect(text, `${doc} mentions ${word}`).not.toContain(word);
    expect(text, doc).toContain("pnpm seal");
  }
  const readme = fs.readFileSync(path.join(project, "README.md"), "utf8");
  expect(readme).toMatch(/^# Acme intake$/m);
  expect(readme.indexOf("`app_users`, the group of the app's users")).toBeGreaterThan(-1);
  expect(readme).toContain("(its label is \"Acme intake users\")");
  expect(readme.includes("pnpm demo")).toBe(ui);
  expect(readme.includes("RUNBOOK.md")).toBe(site);
  expect(fs.readFileSync(path.join(project, "AGENTS.md"), "utf8").includes("src/module/module.tsx")).toBe(ui);
  expect(fs.readFileSync(path.join(project, "AGENTS.md"), "utf8").includes("pnpm typecheck")).toBe(ui || site);
}

describe("mirrorRef", () => {
  it("names a folder of the SDK mirror at the release's tag", () => {
    expect(mirrorRef("@reflexify/agentflow-sdk", "0.2.0")).toBe("github:reflexify/agentflow-sdk#sdk-v0.2.0&path:packages/agentflow-sdk");
    expect(Object.keys(MIRROR_PACKAGES).sort()).toEqual([
      "@reflexify/agentflow-app-builder",
      "@reflexify/agentflow-elements",
      "@reflexify/agentflow-sdk",
    ]);
    expect(() => mirrorRef("left-pad", "1.0.0")).toThrow(/left-pad/);
  });
});

describe("init", () => {
  it("names the package after the folder, and keeps the entity and workflow keys", async () => {
    const { project } = await start("acme-intake");
    const manifest = json(path.join(project, "config/package-manifest.json"));
    expect(manifest).toMatchObject({ id: "acme/acme-intake", name: "Acme intake" });
    expect(json(path.join(project, "package/manifest.json"))).toMatchObject({ id: "acme/acme-intake", name: "Acme intake" });
    expect(fs.existsSync(path.join(project, "config/entities/case.json"))).toBe(true);
    expect(fs.readFileSync(path.join(project, "config/build/open-case.mjs"), "utf8")).toContain("open_case");
    expect(json(path.join(project, "package.json")).name).toBe("acme-intake");
    expect(fs.readFileSync(path.join(project, "README.md"), "utf8")).toMatch(/^# Acme intake$/m);
    for (const doc of ["README.md", "AGENTS.md"]) {
      expect(fs.readFileSync(path.join(project, doc), "utf8"), doc).not.toMatch(/\b\d+\.\d+\.\d+\b/);
    }
    const ignored = fs.readFileSync(path.join(project, ".gitignore"), "utf8").split("\n");
    expect(ignored).toEqual(expect.arrayContaining(["/keys/", "node_modules/", "/.agentflow/"]));
    expect(fs.existsSync(path.join(project, "_gitignore"))).toBe(false);
  });

  it("starts the changelog over, and names the users group after the app", async () => {
    const { project } = await start("acme-intake");
    for (const file of ["config/package-manifest.json", "package/manifest.json"]) {
      const manifest = json(path.join(project, file));
      expect(manifest.changelog).toBe("First release.");
      expect(manifest.parameters.find((p: { key: string }) => p.key === "app_users").label).toBe("Acme intake users");
    }
    expect(JSON.stringify(json(path.join(project, "package/manifest.json")))).not.toMatch(/case desk/i);
  });

  it("writes the new id, key and prefix into the README and AGENTS.md wherever the starter's appeared", async () => {
    const { project } = await start("anything", ["--key", "intake"], "foo");
    const readme = fs.readFileSync(path.join(project, "README.md"), "utf8");
    expect(readme).toContain("`foo/intake` is an AgentFlow app");
    expect(readme).toContain("dist-app/foo-intake-<version>.afpkg");
    expect(readme).toContain("--key-id dev-foo");
    for (const doc of ["README.md", "AGENTS.md"]) expect(fs.readFileSync(path.join(project, doc), "utf8")).not.toContain("acme");
  });

  it("takes the key from --key", async () => {
    const { project } = await start("anything", ["--key", "intake"]);
    expect(json(path.join(project, "config/package-manifest.json"))).toMatchObject({ id: "acme/intake", name: "Intake" });
    expect(json(path.join(project, "package.json")).name).toBe("intake");
  });

  it("points every workspace dependency at the SDK mirror", async () => {
    const { project } = await start("acme-intake");
    const pkg = json(path.join(project, "package.json"));
    const all = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(JSON.stringify(all)).not.toContain("workspace:");
    for (const name of Object.keys(MIRROR_PACKAGES)) expect(all[name]).toBe(mirrorRef(name, SDK_VERSION));
    expect(pkg.scripts.test).toBe("vitest run && agentflow-app build --check");
  });

  it("gives the project the pnpm settings that let it install the SDK from git", async () => {
    const { project } = await start("acme-intake");
    const settings = fs.readFileSync(path.join(project, "pnpm-workspace.yaml"), "utf8");
    expect(settings).toBe(PROJECT_PNPM_WORKSPACE);
    expect(settings).toMatch(/^blockExoticSubdeps: false$/m);
    expect(settings).toMatch(/^allowBuilds:\n {2}esbuild: true$/m);
  });

  it("writes dependencies in the form the caller names", async () => {
    const root = workDir();
    const ref = (name: string, version: string) => `git+file:///mirror#sdk-v${version}&path:packages/${MIRROR_PACKAGES[name]}`;
    await initProject(path.join(root, "acme-intake"), { prefix: "acme", key: "acme-intake", ui: true, site: true, ref });
    const pkg = json(path.join(root, "acme-intake/package.json"));
    const all = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const name of Object.keys(MIRROR_PACKAGES)) expect(all[name]).toBe(ref(name, SDK_VERSION));
  });

  it("gives a project with a site a runbook that a team outside this repository can follow", async () => {
    for (const flags of [[], ["--no-ui"]]) {
      const { project } = await start("acme-intake", flags);
      const text = fs.readFileSync(path.join(project, "RUNBOOK.md"), "utf8");
      for (const word of ["cargo", "backend/", "examples/", "docs/design", "../"]) expect(text, `RUNBOOK.md names ${word}`).not.toContain(word);
      const prose = text.replace(/^```[\s\S]*?^```$/gm, "");
      const named = [
        ...[...prose.matchAll(/`([^`\n]+)`/g)].map((m) => m[1]!),
        ...[...prose.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]!),
      ]
        .map((span) => span.replace(/#.*$/, ""))
        .filter((span) => /^\.?[\w.-]+(\/[\w.@-]*)*$/.test(span) && (/^(config|src|server|static|scripts|test|package|dist-app|keys|docs|sdk|backend|examples|frontend|specs|deploy)\//.test(span) || /\.(md|json|ts|tsx|mjs|html|pem|example)$/.test(span)));
      const written = ["package/", "dist-app/", "keys/", "node_modules/", ".env"];
      for (const span of new Set(named)) {
        if (written.some((w) => span === w || span.startsWith(w.endsWith("/") ? w : `${w}/`))) continue;
        expect(fs.existsSync(path.join(project, span)), `RUNBOOK.md names ${span}, which is not in the project`).toBe(true);
      }
    }
  });

  it("copies no file that describes the starter itself", async () => {
    const { project } = await start("acme-intake");
    const files = listFiles(project);
    for (const rel of ["starter.json", "test/starter.test.ts", "test/package.test.ts", ".files.json", "tsconfig.base.json"]) {
      expect(files).not.toContain(rel);
    }
    expect(files.filter((rel) => rel.split("/").some((part) => part.startsWith("_")))).toEqual([]);
  });

  it("states what a project holds in tsconfig files that stand alone", async () => {
    const { project } = await start("acme-intake");
    for (const file of ["tsconfig.json", "tsconfig.node.json"]) {
      const config = json(path.join(project, file));
      expect(config.extends).toBeUndefined();
      expect(config.compilerOptions).toMatchObject({ strict: true, target: "ES2022", noEmit: true });
    }
  });

  it("builds, makes a key and seals the new project", async () => {
    const { project } = await start("acme-intake");
    link(project);
    expect(await run(project, ["build"])).toMatchObject({ code: 0 });
    expect(await run(project, ["build", "--check"])).toMatchObject({ code: 0 });
    expect(await run(project, ["keygen", "--key-id", "acme-1"])).toMatchObject({ code: 0 });
    const sealed = await run(project, ["seal", "--json"]);
    expect(sealed.code, sealed.stderr).toBe(0);
    const file = path.join(project, "dist-app", "acme-acme-intake-0.1.0.afpkg");
    expect(JSON.parse(sealed.stdout)).toMatchObject({ file, package_id: "acme/acme-intake", version: "0.1.0" });
    expect(fs.existsSync(file)).toBe(true);
  }, 120_000);

  describe.each([
    { label: "default", flags: [], ui: true, site: true },
    { label: "--no-ui", flags: ["--no-ui"], ui: false, site: true },
    { label: "--no-site", flags: ["--no-site"], ui: true, site: false },
    { label: "--no-ui --no-site", flags: ["--no-ui", "--no-site"], ui: false, site: false },
  ])("with $label", ({ flags, ui, site }) => {
    it("holds the files starter.json says, builds, seals and type-checks", async () => {
      const { project } = await start("acme-intake", flags);
      expect(listFiles(project)).toEqual(expectedFiles(ui, site));
      const pkg = json(path.join(project, "package.json"));
      const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
      expectDocs(project, ui, site);

      link(project);
      expect(await run(project, ["build", "--check"]), "the committed package/ must already match config/").toMatchObject({ code: 0 });
      const built = await run(project, ["build"]);
      expect(built.code, built.stderr).toBe(0);
      await run(project, ["keygen", "--key-id", "acme-1"]);
      const sealed = await run(project, ["seal", "--json"]);
      expect(sealed.code, sealed.stderr).toBe(0);
      const archive = readZip(fs.readFileSync(path.join(project, "dist-app/acme-acme-intake-0.1.0.afpkg")));
      expect([...archive.keys()].some((rel) => rel.startsWith("ui/"))).toBe(ui);

      const manifest = json(path.join(project, "config/package-manifest.json"));
      expect("ui" in manifest).toBe(ui);
      expect("launcher" in manifest).toBe(ui);
      expect("ui" in json(path.join(project, "package/manifest.json"))).toBe(ui);
      for (const dep of ["hono", "@hono/node-server", "jose", "tsx"]) expect(deps.includes(dep), dep).toBe(site);
      for (const dep of ["react", "@reflexify/agentflow-elements", "vite"]) expect(deps.includes(dep), dep).toBe(ui || site);
      expect(Object.keys(pkg.scripts).includes("demo")).toBe(ui);
      expect(Object.keys(pkg.scripts).includes("start")).toBe(site);

      const configs = ["tsconfig.json", "tsconfig.node.json"].filter((file) => fs.existsSync(path.join(project, file)));
      expect(configs.length > 0, "a project with TypeScript files carries tsconfig files").toBe(ui || site);
      expect(Object.keys(pkg.scripts).includes("typecheck")).toBe(ui || site);
      for (const config of configs) {
        const tsc = path.join(project, "node_modules/.bin/tsc");
        try {
          execFileSync(tsc, ["-p", config, "--noEmit"], { cwd: project, encoding: "utf8", stdio: "pipe" });
        } catch (error) {
          throw new Error(`tsc -p ${config}: ${(error as { stdout?: string }).stdout}`);
        }
      }
      for (const check of ["test/module/styles.test.ts", "test/module/ui-build.test.ts"]) {
        expect(listFiles(project).includes(check), check).toBe(ui);
      }
      if (ui) vitestIn(project, ["test/module"]);
    }, 180_000);
  });

  describe.each([
    { label: "default", flags: [] as string[], ui: true },
    { label: "--no-ui", flags: ["--no-ui"], ui: false },
  ])("the site of a project made with $label", ({ flags, ui }) => {
    it("says the new project's names everywhere the starter said its own", async () => {
      const { project } = await start("acme-intake", flags);
      const left: string[] = [];
      for (const rel of listFiles(project)) {
        const text = fs.readFileSync(path.join(project, rel), "utf8");
        if (/case[- _]?desk/i.test(text)) left.push(rel);
      }
      expect(left, "files that still name the starter").toEqual([]);
      const read = (rel: string): string => fs.readFileSync(path.join(project, rel), "utf8");
      expect(read("server/config.ts")).toContain("ACME_INTAKE_SESSION_KEY");
      expect(read("server/config.ts")).toContain("ACME_INTAKE_ORIGIN");
      expect(read("server/config.ts")).toContain("'acme-intake-dev'");
      expect(read("server/config.ts")).toContain("export interface AcmeIntakeConfig");
      expect(read("vite.config.ts")).toContain("acmeIntakeDevServer");
      expect(read("server/app.ts")).toContain("/acme-intake/config.json");
      expect(read("src/main.tsx")).toContain("/acme-intake/config.json");
      expect(read("scripts/setup.ts")).toContain("ACME_INTAKE_SESSION_KEY");
      expect(read("index.html")).toContain("<title>Acme intake</title>");
      expect(read("src/text.ts")).toContain("Acme intake couldn't load your session");
      expect(read("RUNBOOK.md")).toMatch(/^# Acme intake against the real stack$/m);
      expect(read("RUNBOOK.md")).toContain("`acme-intake-dev`");
      expect(read("RUNBOOK.md")).not.toContain("starter:");
      expect(read("RUNBOOK.md")).not.toMatch(/\n{3,}/);
      expect(/Cases screen|UI module/.test(read("RUNBOOK.md")), "the runbook's module passages").toBe(ui);
    });

    it("builds, and passes the tests it came with", async () => {
      const { project } = await start("acme-intake", flags);
      link(project);
      vitestIn(project, []);
    }, 240_000);
  });

  it("writes a key with a digit segment into identifiers and variables a compiler and a shell accept", async () => {
    const { project } = await start("my-2nd-app");
    const config = fs.readFileSync(path.join(project, "server/config.ts"), "utf8");
    expect(config).toContain("MY_2ND_APP_SESSION_KEY");
    expect(config).toContain("export interface My2ndAppConfig");
    expect(fs.readFileSync(path.join(project, "vite.config.ts"), "utf8")).toContain("my2ndAppDevServer");
    expect(fs.readFileSync(path.join(project, "index.html"), "utf8")).toContain("<title>My 2nd app</title>");
  });

  it("with neither the module nor the site, is the package alone, and its test is the check", async () => {
    const { project } = await start("acme-intake", ["--no-ui", "--no-site"]);
    const pkg = json(path.join(project, "package.json"));
    expect(pkg.scripts.test).toBe("agentflow-app build --check");
    expect(Object.keys(pkg.scripts).sort()).toEqual(["build", "check", "seal", "test"]);
    expect(pkg.dependencies).toBeUndefined();
    expect(Object.keys(pkg.devDependencies)).toEqual(["@reflexify/agentflow-app-builder"]);
    expect(listFiles(project).filter((rel) => rel.startsWith("src/") || rel.startsWith("test/") || rel.startsWith("server/"))).toEqual([]);
  });

  it("with --no-ui, leaves no module file and no module entry", async () => {
    const { project } = await start("acme-intake", ["--no-ui"]);
    const files = listFiles(project);
    expect(files.filter((rel) => rel.startsWith("src/module/") || rel.startsWith("test/module/"))).toEqual([]);
    expect(files).not.toContain("module.html");
    expect(files).not.toContain("vite.module.config.ts");
    expect(files).toContain("server/app.ts");
  });

  it("with --no-site, leaves no site file but keeps the module", async () => {
    const { project } = await start("acme-intake", ["--no-site"]);
    const files = listFiles(project);
    for (const rel of ["RUNBOOK.md", ".env.example", "src/App.tsx", "index.html", "vite.config.ts"]) expect(files).not.toContain(rel);
    expect(files.filter((rel) => rel.startsWith("server/"))).toEqual([]);
    expect(files).toContain("src/module/module.tsx");
    expect(files).toContain("vite.module.config.ts");
  });

  it("names in tsconfig.node.json only what the project has: no site paths without the site", async () => {
    const withSite = (await start("acme-intake")).project;
    expect(json(path.join(withSite, "tsconfig.node.json")).include).toEqual(
      expect.arrayContaining(["server", "scripts", "vite.config.ts", "vite.module.config.ts", "vitest.config.ts"]),
    );
    const { project } = await start("acme-intake", ["--no-site"]);
    const node = json(path.join(project, "tsconfig.node.json"));
    expect(node.include).toEqual(["test/**/*.ts", "vite.module.config.ts", "vitest.config.ts"]);
    expect(json(path.join(project, "tsconfig.json")).include).toEqual(["src", "test/**/*.tsx"]);
    const noUi = await start("acme-intake", ["--no-ui"]);
    expect(json(path.join(noUi.project, "tsconfig.node.json")).include).toEqual(
      expect.not.arrayContaining(["vite.module.config.ts"]),
    );
  });

  it("refuses a folder that is not empty, and leaves it as it was", async () => {
    const root = workDir();
    const target = path.join(root, "taken");
    fs.mkdirSync(target);
    fs.writeFileSync(path.join(target, "notes.txt"), "mine");
    const out = await run(root, ["init", "taken", "--prefix", "acme"]);
    expect(out.code).toBe(1);
    expect(out.stderr).toContain("INIT_DIR_NOT_EMPTY");
    expect(listFiles(target)).toEqual(["notes.txt"]);
    expect(fs.readdirSync(root).sort()).toEqual(["taken"]);
    const asJson = await run(root, ["init", "taken", "--prefix", "acme", "--json"]);
    expect(JSON.parse(asJson.stdout)).toMatchObject({ error: { code: "INIT_DIR_NOT_EMPTY" } });
  });

  it("refuses a path that is a file", async () => {
    const root = workDir();
    fs.writeFileSync(path.join(root, "file"), "x");
    expect((await run(root, ["init", "file", "--prefix", "acme"])).stderr).toContain("INIT_DIR_NOT_EMPTY");
  });

  it("fills an empty folder that exists", async () => {
    const root = workDir();
    fs.mkdirSync(path.join(root, "acme-intake"));
    const out = await run(root, ["init", "acme-intake", "--prefix", "acme"]);
    expect(out.code, out.stderr).toBe(0);
    expect(listFiles(path.join(root, "acme-intake"))).toEqual(expectedFiles(true, true));
    expect(fs.readdirSync(root)).toEqual(["acme-intake"]);
  });

  it("makes the folder with the mode any new folder gets, not the private mode of its staging folder", async () => {
    const { root, project } = await start("acme-intake");
    const ordinary = path.join(root, "ordinary");
    fs.mkdirSync(ordinary);
    expect(fs.statSync(project).mode & 0o777).toBe(fs.statSync(ordinary).mode & 0o777);
  });

  it.skipIf(!posix || process.getuid?.() === 0)("refuses a folder it cannot write in, naming it", async () => {
    const root = workDir();
    const closed = path.join(root, "closed");
    fs.mkdirSync(closed, { mode: 0o500 });
    try {
      const out = await run(root, ["init", "closed/acme-intake", "--prefix", "acme", "--json"]);
      expect(out.code).toBe(1);
      expect(JSON.parse(out.stdout).error).toMatchObject({ code: "INIT_DIR_UNWRITABLE", message: expect.stringContaining(closed) });
      expect(fs.readdirSync(closed)).toEqual([]);
    } finally {
      fs.chmodSync(closed, 0o700);
    }
  });

  it("refuses a folder under a regular file as unwritable, naming the file", async () => {
    const root = workDir();
    const file = path.join(root, "afile");
    fs.writeFileSync(file, "x");
    const out = await run(root, ["init", "afile/sub", "--prefix", "acme", "--json"]);
    expect(out.code).toBe(1);
    expect(JSON.parse(out.stdout).error).toMatchObject({ code: "INIT_DIR_UNWRITABLE", message: expect.stringContaining(file) });
    expect(fs.readFileSync(file, "utf8")).toBe("x");
  });

  it("does not blame the starter for a failure to write the new project", async () => {
    const root = workDir();
    const real = fs.writeFileSync;
    let thrown = false;
    vi.spyOn(fs, "writeFileSync").mockImplementation(((file: fs.PathOrFileDescriptor, ...rest: unknown[]) => {
      if (!thrown && String(file).includes(".agentflow-init-")) {
        thrown = true;
        throw Object.assign(new Error(`EACCES: permission denied, open '${String(file)}'`), { code: "EACCES", syscall: "open", path: String(file) });
      }
      return (real as (...args: unknown[]) => void)(file, ...rest);
    }) as typeof fs.writeFileSync);
    const out = await run(root, ["init", "acme-intake", "--prefix", "acme", "--json"]);
    expect(JSON.parse(out.stdout).error.code).toBe("INIT_DIR_UNWRITABLE");
    expect(fs.readdirSync(root)).toEqual([]);
  });

  describe("when another process fills the folder while init runs", () => {
    it("leaves a file that appeared where init would put one, and puts nothing beside it", async () => {
      const root = workDir();
      const target = path.join(root, "acme-intake");
      fs.mkdirSync(target);
      const real = fs.readdirSync;
      vi.spyOn(fs, "readdirSync").mockImplementation(((dir: fs.PathLike, ...rest: unknown[]) => {
        if (String(dir).includes(".agentflow-init-") && !fs.existsSync(path.join(target, "package.json"))) {
          fs.writeFileSync(path.join(target, "package.json"), "foreign");
          fs.mkdirSync(path.join(target, "config"));
          fs.writeFileSync(path.join(target, "config/mine.json"), "foreign too");
        }
        return (real as (...args: unknown[]) => unknown)(dir, ...rest);
      }) as typeof fs.readdirSync);
      const out = await run(root, ["init", "acme-intake", "--prefix", "acme", "--json"]);
      vi.restoreAllMocks();
      expect(JSON.parse(out.stdout).error.code).toBe("INIT_DIR_NOT_EMPTY");
      expect(listFiles(target)).toEqual(["config/mine.json", "package.json"]);
      expect(fs.readFileSync(path.join(target, "package.json"), "utf8")).toBe("foreign");
      expect(fs.readFileSync(path.join(target, "config/mine.json"), "utf8")).toBe("foreign too");
      expect(fs.readdirSync(root)).toEqual(["acme-intake"]);
    });

    it("removes what init made, and keeps a file that appeared inside a folder it made", async () => {
      const root = workDir();
      const target = path.join(root, "acme-intake");
      fs.mkdirSync(target);
      const foreign = path.join(target, "package/manifest.json");
      const real = fs.copyFileSync;
      vi.spyOn(fs, "copyFileSync").mockImplementation(((from: fs.PathLike, to: fs.PathLike, ...rest: unknown[]) => {
        if (String(to) === foreign) fs.writeFileSync(foreign, "foreign");
        return (real as (...args: unknown[]) => void)(from, to, ...rest);
      }) as typeof fs.copyFileSync);
      const out = await run(root, ["init", "acme-intake", "--prefix", "acme", "--json"]);
      vi.restoreAllMocks();
      expect(JSON.parse(out.stdout).error.code).toBe("INIT_DIR_NOT_EMPTY");
      expect(listFiles(target)).toEqual(["package/manifest.json"]);
      expect(fs.readFileSync(foreign, "utf8")).toBe("foreign");
      expect(fs.readdirSync(root)).toEqual(["acme-intake"]);
    });
  });

  it("refuses with a message about init when the starter is missing or not what init expects", async () => {
    const root = workDir();
    const empty = path.join(root, "empty");
    fs.mkdirSync(empty);
    const target = (name: string) => path.join(root, name);
    const missing = await initProject(target("a"), { prefix: "acme", key: "a", ui: true, templateDir: empty }).catch((e) => e);
    expect(missing).toMatchObject({ code: "INIT_STARTER_INVALID", message: expect.stringContaining("init") });

    for (const [change, why] of [
      [(t: string) => t.replace("<!-- /starter:ui -->", ""), /never closes|closes|opens/],
      [(t: string) => t.replace("starter:site", "starter:cloud"), /unknown group/],
      [(t: string) => t.replace("# Case desk", "# Something else"), /README\.md title/],
    ] as const) {
      const template = path.join(root, `template-${String(why).length}`);
      fs.cpSync(starter, template, { recursive: true });
      const readme = path.join(template, "README.md");
      fs.writeFileSync(readme, change(fs.readFileSync(readme, "utf8")));
      const error = await initProject(target(`out-${String(why).length}`), { prefix: "acme", key: "out", ui: true, templateDir: template }).catch((e) => e);
      expect(error, String(why)).toMatchObject({ code: "INIT_STARTER_INVALID", message: expect.stringMatching(why) });
      expect(fs.existsSync(target(`out-${String(why).length}`))).toBe(false);
    }
    expect(fs.readdirSync(root).filter((name) => name.startsWith(".agentflow-init-"))).toEqual([]);
  });

  it("refuses a prefix or key the package id does not allow, and names the rule", async () => {
    const root = workDir();
    const prefix = await run(root, ["init", "acme-intake", "--prefix", "Acme"]);
    expect(prefix.code).toBe(1);
    expect(prefix.stderr).toContain("INIT_NAME_INVALID");
    expect(prefix.stderr).toContain("--prefix Acme");
    expect(prefix.stderr).toContain("lowercase letters and digits");
    const key = await run(root, ["init", "acme-intake", "--prefix", "acme", "--key", "9x", "--json"]);
    expect(key.code).toBe(1);
    expect(JSON.parse(key.stdout).error).toMatchObject({ code: "INIT_NAME_INVALID", message: expect.stringContaining("9x") });
    expect(JSON.parse(key.stdout).error.message).not.toContain("folder");
    const folder = await run(root, ["init", "My_App", "--prefix", "acme"]);
    expect(folder.code).toBe(1);
    expect(folder.stderr).toContain("INIT_NAME_INVALID: key My_App, taken from the folder's name: a key is");
    expect(folder.stderr).toContain("; name a valid one with --key <key>");
    expect(fs.readdirSync(root)).toEqual([]);
    expect((await run(root, ["init", "My_App", "--prefix", "acme", "--key", "my-app"])).code).toBe(0);
  });

  it.skipIf(!posix || process.getuid?.() === 0)("leaves nothing behind when a copy fails part-way", async () => {
    const root = workDir();
    const template = path.join(root, "template");
    fs.cpSync(starter, template, { recursive: true });
    const unreadable = path.join(template, "config/entities/case.json");
    fs.chmodSync(unreadable, 0o000);
    try {
      const target = path.join(root, "out", "acme-intake");
      await expect(initProject(target, { prefix: "acme", key: "acme-intake", ui: true, templateDir: template })).rejects.toMatchObject({ code: "INIT_STARTER_INVALID", message: expect.stringContaining("EACCES") });
      expect(fs.existsSync(target)).toBe(false);
      expect(fs.readdirSync(path.join(root, "out"))).toEqual([]);

      const existing = path.join(root, "existing");
      fs.mkdirSync(existing);
      await expect(initProject(existing, { prefix: "acme", key: "existing", ui: true, templateDir: template })).rejects.toMatchObject({
        code: "INIT_STARTER_INVALID",
      });
      expect(fs.readdirSync(existing)).toEqual([]);
      expect(fs.readdirSync(root).sort()).toEqual(["existing", "out", "template"]);
    } finally {
      fs.chmodSync(unreadable, 0o644);
    }
  });
});

describe("init on the command line", () => {
  it("prints what it made and the next steps, or one JSON value with --json", async () => {
    const root = workDir();
    const plain = await run(root, ["init", "acme-intake", "--prefix", "acme"]);
    expect(plain.stdout).toContain("acme/acme-intake");
    expect(plain.stdout).toContain("cd acme-intake && pnpm install && pnpm build");
    const asJson = await run(root, ["init", "other", "--prefix", "acme", "--json"]);
    expect(asJson.stdout.trim().split("\n")).toHaveLength(1);
    expect(JSON.parse(asJson.stdout)).toEqual({ dir: path.join(root, "other"), id: "acme/other" });
  });

  it("is a usage error without a folder or a prefix, or with a second folder", async () => {
    const root = workDir();
    expect((await run(root, ["init", "--prefix", "acme"])).code).toBe(2);
    expect((await run(root, ["init", "acme-intake"])).code).toBe(2);
    expect((await run(root, ["init", "one", "two", "--prefix", "acme"])).stderr).toContain("unexpected argument: two");
    expect((await run(root, ["init", "one", "--prefix", "acme", "--from", "draft.zip"])).code).toBe(2);
    expect(fs.readdirSync(root)).toEqual([]);
  });

  it("refuses an extra argument on the other commands as before", async () => {
    const root = workDir();
    expect((await run(root, ["build", "extra"])).code).toBe(2);
  });
});
