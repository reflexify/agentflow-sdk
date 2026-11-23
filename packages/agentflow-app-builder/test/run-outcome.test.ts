import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildPackage } from "../src/build.js";
import { runOutcomeWarnings } from "../src/run-outcome.js";
import { merge } from "../src/index.js";
import { edges, end, graph, restricted, RUN_OUTCOME_PLATFORM, servicePrincipal, start, workflow, type TriggerSource } from "../src/workflow.js";

const configDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures/mini/config");

const flow = (key: string, contract: Record<string, unknown> = {}) => {
  const s = start();
  s.parameters.inputContract = { ...s.parameters.inputContract, ...contract };
  return workflow(key, key, `The ${key} workflow`, servicePrincipal("automation_principal_id"), restricted("support_group_id"),
    graph(key, [s, end("done", "Done")], edges(["e1", "start", "done"])));
};
const note = { subject: { kind: "entity", entityId: "${entity:note}", arity: "single" } };
const contact = { subject: { kind: "entity", entityId: "${entity:contact}", arity: "single" } };
const set = { subject: { kind: "entity", entityId: "${entity:note}", arity: "multiple" } };
const external = { subject: { kind: "external" } };

const cleanupOf = (config: Record<string, unknown>, workflow = "reset"): TriggerSource => ({ workflow, kind: "run_outcome", config });

function build(triggers: Record<string, TriggerSource>, contracts: Record<string, Record<string, unknown>> = {}) {
  const keys = ["process", "intake", "reset", "reset_more"];
  const workflows = Object.fromEntries(keys.map((key) => [key, flow(key, contracts[key])]));
  const raised: string[] = [];
  const files = buildPackage({ configDir, sections: merge([{ workflows, triggers }], keys) }, (line) => raised.push(line));
  return { files, raised, body: (name: string) => JSON.parse(files[`objects/trigger/${name}.json`]!) };
}

describe("a run-outcome trigger", () => {
  it("writes the watched workflows as references and the outcomes as a sorted list, failed when left out", () => {
    const { body, files, raised } = build({
      on_fail: cleanupOf({ workflows: ["${workflow:process}", "intake"] }),
      on_any: cleanupOf({ workflows: ["process"], outcomes: ["paused_on_access", "failed", "cancelled"] }, "reset_more"),
    });
    expect(body("on_fail")).toEqual({
      workflow: "@obj:workflow:reset",
      kind: "run_outcome",
      enabled: false,
      config: { workflows: ["@obj:workflow:process", "@obj:workflow:intake"], outcomes: ["failed"] },
    });
    expect(body("on_any").config.outcomes).toEqual(["cancelled", "failed", "paused_on_access"]);
    expect(RUN_OUTCOME_PLATFORM).toBe("2027.11");
    expect(JSON.parse(files["manifest.json"]!).minPlatformVersion).toBe(RUN_OUTCOME_PLATFORM);
    expect(raised).toEqual(["minPlatformVersion: 2027.11, raised from 2026.10 for a run-outcome trigger"]);
  });

  it("leaves the month of a package with no run-outcome trigger alone", () => {
    const schedule = { workflow: "reset", kind: "schedule", config: { cron: "0 6 * * *", timezone: "UTC", input_template: {} } };
    expect(build({ nightly: schedule }).raised).toEqual([]);
  });

  it("refuses a config the platform refuses, at the entry", () => {
    const rows: [Record<string, unknown> | undefined, string][] = [
      [undefined, "/config: an object with workflows and, optionally, outcomes"],
      [{ workflows: ["process"], watch: "all" }, "/config/watch: a member the builder has no rule for"],
      [{}, "/config/workflows: a list of at least one"],
      [{ workflows: [] }, "/config/workflows: a list of at least one"],
      [{ workflows: "process" }, "/config/workflows: a list of at least one"],
      [{ workflows: ["ghost"] }, "/config/workflows/0: ghost is not a workflow of the package"],
      [{ workflows: ["${workflow:ghost}"] }, "/config/workflows/0: ${workflow:ghost} is not a workflow of the package"],
      [{ workflows: [3] }, "/config/workflows/0: a workflow of the package, as ${workflow:<key>} or its key"],
      [{ workflows: ["@obj:workflow:process"] }, "/config/workflows/0: a string starting with @ reads as a sentinel"],
      [{ workflows: ["process", "${workflow:process}"] }, "/config/workflows/1: process is listed twice"],
      [{ workflows: ["process"], outcomes: [] }, "/config/outcomes: a list of at least one"],
      [{ workflows: ["process"], outcomes: ["completed"] }, "/config/outcomes/0: completed is not an outcome: failed, paused_on_access, cancelled"],
      [{ workflows: ["process"], outcomes: ["failed", "failed"] }, "/config/outcomes/1: failed is listed twice"],
    ];
    for (const [config, message] of rows) {
      const trigger = { workflow: "reset", kind: "run_outcome", ...(config === undefined ? {} : { config }) } as TriggerSource;
      expect(() => build({ cleanup: trigger }), message).toThrow(`trigger cleanup#${message}`);
    }
  });

  it("refuses a cleanup whose start refuses the subject every fire hands it", () => {
    const watch = cleanupOf({ workflows: ["intake", "process"] });
    const rows: [Record<string, Record<string, unknown>>, string | null][] = [
      [{ reset: note, process: note, intake: note }, null],
      [{ reset: {}, process: set, intake: external }, null],
      [{ reset: note, process: {}, intake: note }, null],
      [{ reset: set }, "/workflow: reset's start takes a set of records, and the trigger starts it about the ended run's record or about nothing, so every start fails with SUBJECT_BINDING_MISMATCH: declare one record of an entity, an external object, or no subject, on reset's start"],
      [{ reset: external }, null],
      [{ reset: external, process: external, intake: set }, null],
      [{ reset: external, intake: note }, "/config/workflows/0: runs of intake are about a record of note, and reset's start takes an external object"],
      [{ reset: note, intake: contact }, "/config/workflows/0: runs of intake are about a record of contact, and reset's start takes a record of note"],
      [{ reset: note, process: set }, "/config/workflows/1: runs of process are about a set of records"],
      [{ reset: note, process: external }, null],
    ];
    for (const [contracts, message] of rows) {
      const run = () => build({ cleanup: watch }, contracts);
      if (message === null) expect(run, JSON.stringify(contracts)).not.toThrow();
      else expect(run, message).toThrow(`trigger cleanup#${message}`);
    }
  });

  it("warns for a watched workflow a run-outcome trigger starts, whose runs from that trigger never fire one", () => {
    const keys = new Set(["process", "reset", "reset_more"]);
    expect(runOutcomeWarnings({ a: cleanupOf({ workflows: ["process"] }) }, keys)).toEqual([]);
    expect(runOutcomeWarnings({ a: cleanupOf({ workflows: ["process", "${workflow:reset}"] }) }, keys)).toEqual([
      `trigger "a": watches reset, the workflow it starts itself. A run a run-outcome trigger starts never fires one, and while "a" is on nobody starts reset by hand except as a batch run over records, so "a" fires for it only for a batch run's runs: leave reset out of config.workflows`,
    ]);
    const chained = { a: cleanupOf({ workflows: ["reset_more"] }), b: cleanupOf({ workflows: ["process"] }, "reset_more") };
    expect(runOutcomeWarnings(chained, keys)).toEqual([
      `trigger "a": watches reset_more, which trigger "b" starts when a run ends badly. A run a run-outcome trigger starts never fires one, and while "b" is on nobody starts reset_more by hand except as a batch run over records, so "a" fires for it only while "b" is off, or for a batch run's runs: leave reset_more out of config.workflows`,
    ]);
    const schedule = { workflow: "process", kind: "schedule", config: {} };
    expect(runOutcomeWarnings({ a: cleanupOf({ workflows: ["process"] }), nightly: schedule }, keys)).toEqual([]);
  });
});
