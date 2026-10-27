import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { agentObject } from "../src/assets.js";
import { Draft } from "../src/draft/manifest.js";
import { agentSource } from "../src/draft/assets.js";

const agent = (readLimit: unknown): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "read-limit-"));
  fs.mkdirSync(path.join(dir, "agents"));
  fs.writeFileSync(path.join(dir, "agents", "triage.json"), JSON.stringify({ key: "triage", name: "Triage", read_limit: readLimit }));
  return dir;
};

const limit = { entities: [{ entity: "${entity:ticket}", operations: ["read", "list"] }] };

describe("an agent's read limit", () => {
  it("carries entity sentinels", () => {
    const [key, body] = agentObject(agent(limit), "triage");
    expect(key).toBe("agent:triage");
    expect((body as { read_limit: unknown }).read_limit).toEqual({
      entities: [{ entity: "@obj:entity:ticket", operations: ["read", "list"] }],
    });
  });

  it.each([
    ["an entity named twice", { entities: [limit.entities[0], { entity: "${entity:ticket}", operations: ["read"] }] }, "/read_limit/entities/1/entity", "named twice"],
    ["an entity that is not a reference", { entities: [{ entity: "ticket", operations: ["read"] }] }, "/read_limit/entities/0/entity", "${entity:"],
    ["an entity that is another kind", { entities: [{ entity: "${agent:triage}", operations: ["read"] }] }, "/read_limit/entities/0/entity", "${entity:"],
    ["an operation other than read or list", { entities: [{ entity: "${entity:ticket}", operations: ["read", "update"] }] }, "/read_limit/entities/0/operations/1", "read or list"],
    ["an empty operations list", { entities: [{ entity: "${entity:ticket}", operations: [] }] }, "/read_limit/entities/0/operations", "at least one"],
    ["an operation twice", { entities: [{ entity: "${entity:ticket}", operations: ["list", "list"] }] }, "/read_limit/entities/0/operations/1", "twice"],
    ["an unknown member of the limit", { entities: [], colour: 1 }, "/read_limit/colour", "no rule for"],
    ["an unknown member of an entry", { entities: [{ entity: "${entity:ticket}", operations: ["read"], colour: 1 }] }, "/read_limit/entities/0/colour", "no rule for"],
  ])("refuses %s", (_name, value, pointer, message) => {
    expect(() => agentObject(agent(value), "triage")).toThrow(`agents/triage.json#${pointer}: `);
    expect(() => agentObject(agent(value), "triage")).toThrow(message);
  });

  it("converts back from a draft to the same body", () => {
    const [, body] = agentObject(agent(limit), "triage");
    const bytes = Buffer.from(JSON.stringify({ name: "Triage", read_limit: (body as { read_limit: unknown }).read_limit }));
    const draft = new Draft(
      new Map([
        ["manifest.json", Buffer.from(JSON.stringify({ objects: [{ key: "agent:triage", kind: "agent" }] }))],
        ["objects/agent/triage.json", bytes],
      ]),
    );
    const source = agentSource(draft, "triage");
    expect(source.read_limit).toEqual(limit);
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "read-limit-"));
    fs.mkdirSync(path.join(dir, "agents"));
    fs.writeFileSync(path.join(dir, "agents", "triage.json"), JSON.stringify(source));
    expect(agentObject(dir, "triage")[1]).toEqual({ name: "Triage", read_limit: (body as { read_limit: unknown }).read_limit });
  });
});
