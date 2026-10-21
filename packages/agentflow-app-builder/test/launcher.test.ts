import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildPackage } from "../src/build.js";
import { launcherOf } from "../src/launcher.js";

const mini = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures/mini/config");
const empty = { workflows: {}, order: [], triggers: {}, actions: {} };
const W = "package-manifest.json";

function withManifest(change: (m: Record<string, unknown>) => void): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "launcher-"));
  fs.cpSync(mini, dir, { recursive: true });
  const file = path.join(dir, W);
  const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
  change(manifest);
  fs.writeFileSync(file, JSON.stringify(manifest));
  return dir;
}

describe("launcherOf", () => {
  it("translates object targets and keeps module targets and labels as written", () => {
    expect(
      launcherOf(
        {
          launch_url: "https://app.example.com",
          entries: [
            { key: "notes", label: { en: "Notes", vi: "Ghi chú" }, icon: "list-checks", target: { object: "${entity:note}" } },
            { key: "home", label: "Home", target: { module: "/" } },
          ],
        },
        true,
      ),
    ).toEqual({
      launch_url: "https://app.example.com",
      entries: [
        { key: "notes", label: { en: "Notes", vi: "Ghi chú" }, icon: "list-checks", target: { object: "@obj:entity:note" } },
        { key: "home", label: "Home", target: { module: "/" } },
      ],
    });
  });
  it("refuses a module target without ui", () => {
    expect(() => launcherOf({ entries: [{ key: "a", label: "A", target: { module: "/" } }] }, false)).toThrow(
      `${W}#/launcher/entries/0/target/module: a module target needs the package's ui`,
    );
  });
  it("refuses an object target of another kind, two targets, and unknown members", () => {
    expect(() => launcherOf({ entries: [{ key: "a", label: "A", target: { object: "${workflow:close}" } }] }, true)).toThrow(
      `${W}#/launcher/entries/0/target/object: must be a \${dashboard:key}, \${entity:key} or \${entity_view:entity/key}`,
    );
    expect(() => launcherOf({ entries: [{ key: "a", label: "A", target: { module: "/", object: "${entity:note}" } }] }, true)).toThrow(
      `${W}#/launcher/entries/0/target: exactly one of module or object`,
    );
    expect(() => launcherOf({ entries: [{ key: "a", label: "A", href: "/", target: { module: "/" } }] }, true)).toThrow(
      `${W}#/launcher/entries/0/href: a member the builder has no rule for`,
    );
    expect(() => launcherOf({ home: "/" }, true)).toThrow(`${W}#/launcher/home: a member the builder has no rule for`);
  });
});

describe("buildPackage with a launcher", () => {
  it("emits launcher after the objects are known, and refuses a target the package does not build", () => {
    const ok = withManifest((m) => {
      m.launcher = { entries: [{ key: "notes", label: "Notes", target: { object: "${entity:note}" } }] };
    });
    const manifest = JSON.parse(buildPackage({ configDir: ok, sections: empty })["manifest.json"]!);
    expect(manifest.launcher.entries[0].target).toEqual({ object: "@obj:entity:note" });

    const missing = withManifest((m) => {
      m.launcher = { entries: [{ key: "d", label: "D", target: { object: "${dashboard:nowhere}" } }] };
    });
    expect(() => buildPackage({ configDir: missing, sections: empty })).toThrow(
      "manifest.json#/launcher/entries/0/target/object: @obj:dashboard:nowhere names no object, parameter or required entity of the package",
    );
  });
  it("omits launcher when the source has none", () => {
    expect("launcher" in JSON.parse(buildPackage({ configDir: mini, sections: empty })["manifest.json"]!)).toBe(false);
  });
});
