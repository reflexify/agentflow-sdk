import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { assistantOf } from "../src/assistant.js";
import { buildPackage } from "../src/build.js";

const mini = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures/mini/config");
const empty = { workflows: {}, order: [], triggers: {}, actions: {} };
const W = "package-manifest.json";

function withManifest(change: (m: Record<string, unknown>) => void): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "assistant-"));
  fs.cpSync(mini, dir, { recursive: true });
  const file = path.join(dir, W);
  const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
  change(manifest);
  fs.writeFileSync(file, JSON.stringify(manifest));
  return dir;
}

describe("assistantOf", () => {
  it("copies a card lifetime from 1 to 1440 minutes", () => {
    expect(assistantOf({ proposal_ttl_minutes: 15 })).toEqual({ proposal_ttl_minutes: 15 });
    expect(assistantOf({ proposal_ttl_minutes: 1 })).toEqual({ proposal_ttl_minutes: 1 });
    expect(assistantOf({ proposal_ttl_minutes: 1440 })).toEqual({ proposal_ttl_minutes: 1440 });
  });
  it.each([0, 1441, 2.5, "15", null])("refuses a lifetime of %s", (value) => {
    expect(() => assistantOf({ proposal_ttl_minutes: value })).toThrow(
      `${W}#/assistant/proposal_ttl_minutes: must be a whole number of minutes from 1 to 1440`,
    );
  });
  it("refuses a member it does not know", () => {
    expect(() => assistantOf({ proposal_ttl_minutes: 15, skils: [] })).toThrow(
      `${W}#/assistant/skils: a member the builder has no rule for`,
    );
  });
  it("refuses a member that is not an object", () => {
    expect(() => assistantOf(15)).toThrow(`${W}#/assistant: must be an object`);
  });
});

describe("assistantOf labels", () => {
  const labels = {
    vi: { task: { name: "Công việc", fields: { due: "Hạn" } }, project: { name: "Dự án" } },
    "pt-BR": { task: { fields: { due: "Prazo" } } },
  };
  it("copies what entities and fields are called in other languages", () => {
    expect(assistantOf({ labels })).toEqual({ labels });
  });
  it.each([
    [{ vi: "Công việc" }, "/assistant/labels/vi", "must be an object"],
    [{ vi: { task: "Công việc" } }, "/assistant/labels/vi/task", "must be an object"],
    [{ vi: { task: { name: "" } } }, "/assistant/labels/vi/task/name", "must be 1 to 80 characters"],
    [{ vi: { task: { name: "x".repeat(81) } } }, "/assistant/labels/vi/task/name", "must be 1 to 80 characters"],
    [{ vi: { task: { fields: { due: 3 } } } }, "/assistant/labels/vi/task/fields/due", "must be 1 to 80 characters"],
    [{ vi: { task: { fields: { Due: "Hạn" } } } }, "/assistant/labels/vi/task/fields/Due", "must be a key like due_date"],
    [{ vi: { Task: { name: "Công việc" } } }, "/assistant/labels/vi/Task", "must be a key like task"],
    [{ VI: { task: { name: "Công việc" } } }, "/assistant/labels/VI", "must be a language like vi or pt-BR"],
    [{ vi: { task: { title: "Công việc" } } }, "/assistant/labels/vi/task/title", "a member the builder has no rule for"],
  ])("refuses %j", (value, pointer, message) => {
    expect(() => assistantOf({ labels: value })).toThrow(`${W}#${pointer}: ${message}`);
  });
  it("refuses labels that are not an object", () => {
    expect(() => assistantOf({ labels: [] })).toThrow(`${W}#/assistant/labels: must be an object`);
  });
});

describe("buildPackage with an assistant member", () => {
  it("builds a package whose manifest carries the member", () => {
    const dir = withManifest((m) => {
      m.assistant = { proposal_ttl_minutes: 15 };
    });
    const built = JSON.parse(buildPackage({ configDir: dir, sections: empty })["manifest.json"]!);
    expect(built.assistant).toEqual({ proposal_ttl_minutes: 15 });
  });
  it("omits the member when the source has none", () => {
    expect("assistant" in JSON.parse(buildPackage({ configDir: mini, sections: empty })["manifest.json"]!)).toBe(false);
  });
});

describe("buildPackage with labels", () => {
  it("builds labels for an entity of the package and refuses one it does not build", () => {
    const ok = withManifest((m) => {
      m.assistant = { labels: { vi: { note: { name: "Ghi chú", fields: { body: "Nội dung" } } } } };
    });
    const built = JSON.parse(buildPackage({ configDir: ok, sections: empty })["manifest.json"]!);
    expect(built.assistant.labels.vi.note.name).toBe("Ghi chú");

    const missing = withManifest((m) => {
      m.assistant = { labels: { vi: { nowhere: { name: "Đâu đó" } } } };
    });
    expect(() => buildPackage({ configDir: missing, sections: empty })).toThrow(
      `${W}#/assistant/labels/vi/nowhere: names no entity the package builds`,
    );

    const typo = withManifest((m) => {
      m.assistant = { labels: { vi: { note: { fields: { bodyy: "Nội dung" } } } } };
    });
    expect(() => buildPackage({ configDir: typo, sections: empty })).toThrow(
      `${W}#/assistant/labels/vi/note/fields/bodyy: names no field of the entity`,
    );
  });
});

describe("assistantOf skills", () => {
  it("copies the skills the package offers", () => {
    expect(assistantOf({ proposal_ttl_minutes: 15, skills: ["create_project"] })).toEqual({
      proposal_ttl_minutes: 15,
      skills: ["create_project"],
    });
  });
  it.each([[["create-project"]], [["a", "a"]], ["x"], [[3]]])("refuses %j", (value) => {
    expect(() => assistantOf({ skills: value })).toThrow(/skill keys/);
  });
  it("refuses a skill the package has no file for, when told which it has", () => {
    expect(() => assistantOf({ skills: ["nope"] }, undefined, new Set(["create_project"]))).toThrow(
      `${W}#/assistant/skills/0: offers skill nope, which config/skills does not have`,
    );
    expect(assistantOf({ skills: ["create_project"] }, undefined, new Set(["create_project"]))).toEqual({
      skills: ["create_project"],
    });
  });
});

describe("buildPackage offering skills", () => {
  const skill = "---\nname: create-project\ndescription: How to create a project from a request.\n---\n\n# Create a project\n";
  const withSkill = (offered: string[]): string => {
    const dir = withManifest((m) => {
      m.assistant = { skills: offered };
    });
    fs.mkdirSync(path.join(dir, "skills"), { recursive: true });
    fs.writeFileSync(path.join(dir, "skills", "create_project.SKILL.md"), skill);
    return dir;
  };
  it("builds a manifest that offers a skill of the package", () => {
    const built = JSON.parse(buildPackage({ configDir: withSkill(["create_project"]), sections: empty })["manifest.json"]!);
    expect(built.assistant).toEqual({ skills: ["create_project"] });
    expect(built.objects.map((o: { key: string }) => o.key)).toContain("skill:create_project");
  });
  it("refuses an offer of a skill the package does not have", () => {
    expect(() => buildPackage({ configDir: withSkill(["escalate"]), sections: empty })).toThrow(
      `${W}#/assistant/skills/0: offers skill escalate, which config/skills does not have`,
    );
  });
});
