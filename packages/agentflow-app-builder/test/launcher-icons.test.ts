import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Writable } from "node:stream";
import { describe, expect, it } from "vitest";
import { main } from "../src/cli.js";
import { convertDraft } from "../src/draft/convert.js";
import { LAUNCHER_ICONS, launcherWarnings } from "../src/launcher.js";
import { nearest } from "../src/suggest.js";
import { copyApp } from "./app-fixture.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const docs = path.resolve(here, "../../../claude-plugin/skills/agentflow-app-authoring/reference/dashboards-and-launcher.md");
const entry = (icon: unknown, key = "teams") => ({ key, label: "Teams", icon, target: { module: "/" } });

async function run(cwd: string, argv: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  const chunks = { stdout: [] as string[], stderr: [] as string[] };
  const sink = (into: string[]) => new Writable({ write(chunk, _encoding, done) { into.push(String(chunk)); done(); } });
  const code = await main(argv, { cwd, stdout: sink(chunks.stdout), stderr: sink(chunks.stderr) });
  return { code, stdout: chunks.stdout.join(""), stderr: chunks.stderr.join("") };
}

describe("the launcher icon names", () => {
  it("are the 39 the authoring reference lists", () => {
    const line = fs.readFileSync(docs, "utf8").split("\n").find((l) => l.trimStart().startsWith("`database`, `building`"))!;
    expect(line.match(/`([a-z-]+)`/g)!.map((name) => name.slice(1, -1))).toEqual([...LAUNCHER_ICONS]);
    expect(LAUNCHER_ICONS).toHaveLength(39);
  });
});

describe("launcherWarnings", () => {
  it("is quiet for a listed icon, for no icon and for no launcher", () => {
    expect(launcherWarnings({ entries: [entry("folder"), entry("list-checks", "b"), { key: "c", label: "C", target: { module: "/" } }] })).toEqual([]);
    expect(launcherWarnings(undefined)).toEqual([]);
    expect(launcherWarnings({ launch_url: "https://x.example" })).toEqual([]);
  });
  it("names the entry and the icon, and suggests the nearest name where it is obvious", () => {
    expect(launcherWarnings({ entries: [entry("folder-kanban")] })).toEqual([
      "launcher entry teams: icon folder-kanban is not one of AgentFlow's icons and draws a dot; did you mean folder?",
    ]);
    expect(launcherWarnings({ entries: [entry("user"), entry("shopping-cart", "b"), entry("credit-card", "c")] })).toEqual([
      "launcher entry teams: icon user is not one of AgentFlow's icons and draws a dot; did you mean users?",
      "launcher entry b: icon shopping-cart is not one of AgentFlow's icons and draws a dot; did you mean cart?",
      "launcher entry c: icon credit-card is not one of AgentFlow's icons and draws a dot; did you mean card?",
    ]);
  });
  it("suggests only a name close enough to be useful: bolt is not bot", () => {
    expect(nearest("bolt", LAUNCHER_ICONS)).toBeUndefined();
    expect(launcherWarnings({ entries: [entry("bolt")] })).toEqual([
      "launcher entry teams: icon bolt is not one of AgentFlow's icons and draws a dot (the names are in the authoring reference, dashboards-and-launcher.md)",
    ]);
    expect(nearest("flog", LAUNCHER_ICONS)).toBeUndefined();
    expect(nearest("pinn", LAUNCHER_ICONS)).toBe("pin");
    expect(nearest("calender", LAUNCHER_ICONS)).toBe("calendar");
    expect(nearest("lauout-dashboard", LAUNCHER_ICONS)).toBe("layout-dashboard");
  });
  it("gives no suggestion when nothing is near", () => {
    expect(launcherWarnings({ entries: [entry("sparkles")] })).toEqual([
      "launcher entry teams: icon sparkles is not one of AgentFlow's icons and draws a dot (the names are in the authoring reference, dashboards-and-launcher.md)",
    ]);
  });
});

describe("build and init --from warn about an unknown launcher icon", () => {
  function withIcon(icon: string): string {
    const app = copyApp();
    const file = path.join(app, "config/package-manifest.json");
    const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
    manifest.launcher = { entries: [{ key: "notes", label: "Notes", icon, target: { object: "${entity:note}" } }] };
    fs.writeFileSync(file, JSON.stringify(manifest));
    return app;
  }
  it("build writes the package, exits 0 and warns on stderr", async () => {
    const out = await run(withIcon("folder-kanban"), ["build"]);
    expect(out.code).toBe(0);
    expect(out.stderr).toBe("warning: launcher entry notes: icon folder-kanban is not one of AgentFlow's icons and draws a dot; did you mean folder?\n");
    expect(out.stdout).toMatch(/wrote \d+ package files/);
  });
  it("build --json carries the warnings, and a clean build has no such member", async () => {
    const warned = JSON.parse((await run(withIcon("folder-kanban"), ["build", "--json"])).stdout);
    expect(warned.warnings).toEqual(["launcher entry notes: icon folder-kanban is not one of AgentFlow's icons and draws a dot; did you mean folder?"]);
    const clean = await run(withIcon("folder"), ["build", "--json"]);
    expect(clean.stderr).toBe("");
    expect(JSON.parse(clean.stdout)).not.toHaveProperty("warnings");
  });
  it("init --from reports the draft's unknown icon", async () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "launcher-icons-"));
    const zip = fs.readFileSync(path.join(here, "fixtures/drafts/tracker.zip"));
    const made = await convertDraft(zip, path.join(cwd, "app"));
    expect(made.warnings[0]).toBe("launcher entry teams: icon folder-kanban is not one of AgentFlow's icons and draws a dot; did you mean folder?");
    expect(made.warnings).toHaveLength(2);
    const out = await run(cwd, ["init", "second", "--from", path.join(here, "fixtures/drafts/tracker.zip")]);
    expect(out.code).toBe(0);
    expect(out.stderr).toContain("warning: launcher entry teams: icon folder-kanban");
  }, 30_000);
});
