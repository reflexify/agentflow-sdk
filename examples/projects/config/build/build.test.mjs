import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPackage, loadApp } from "@reflexify/agentflow-app-builder";

const configDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const appDir = path.join(configDir, "..");
const packageDir = path.join(appDir, "package");
const { app, options } = await loadApp(appDir);

test("parameters.example.json names exactly the manifest's parameters", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(configDir, "package-manifest.json"), "utf8"));
  const example = JSON.parse(fs.readFileSync(path.join(configDir, "..", "parameters.example.json"), "utf8"));
  assert.deepEqual(Object.keys(example).sort(), manifest.parameters.map((p) => p.key).sort());
});

test("the manifest declares the module and version 1.1.0", () => {
  const built = JSON.parse(buildPackage(options)["manifest.json"]);
  assert.deepEqual(built.ui, { kind: "module", entry: "ui/index.js", contract: 1 });
  assert.equal(built.version, "1.1.0");
});

test("each workflow runs as the automation principal and fires only on a status change", () => {
  const { workflows, triggers } = app.sections;
  assert.deepEqual(Object.keys(workflows).sort(), ["freeze_on_close", "stamp_completion", "unfreeze_on_reopen"]);
  for (const w of Object.values(workflows)) {
    assert.deepEqual(w.run_as, { policy: "service_principal", service_principal_id: "${param:automation_principal}" });
  }
  for (const t of Object.values(triggers)) {
    assert.deepEqual(t.config.filter.and[0], { in: ["status", { var: "event.changed" }] });
  }
});

test("the launcher lists My Work and Projects, then the dashboard and open tasks", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(packageDir, "manifest.json"), "utf8"));
  assert.deepEqual(
    manifest.launcher.entries.map((e) => [e.key, e.target.module ?? e.target.object]),
    [["my_work", "/"], ["projects", "/projects"], ["dashboard", "@obj:dashboard:projects_overview"], ["open_tasks", "@obj:entity_view:task/open"]],
  );
  assert.deepEqual(manifest.launcher.entries[0].label, { en: "My Work", vi: "Việc của tôi" });
  assert.deepEqual(manifest.launcher.entries[1].label, { en: "Projects", vi: "Dự án" });
});

test("the board's counts are rollups over each parent's tasks", () => {
  const field = (entity, key) => JSON.parse(fs.readFileSync(path.join(packageDir, "objects/entity_field", `${entity}__${key}.json`), "utf8"));
  const count = (status, op = "eq") => ({ inverseKey: "tasks", agg: "count", filter: [{ field: "status", op, value: status }] });
  assert.deepEqual(field("project", "tasks_todo").rollup, count("todo"));
  assert.deepEqual(field("project", "tasks_doing").rollup, count("doing"));
  assert.deepEqual(field("project", "tasks_done").rollup, count("done"));
  assert.deepEqual(field("section", "tasks_done").rollup, count("done"));
  assert.deepEqual(field("section", "tasks_total").rollup, count("cancelled", "ne"));
  assert.deepEqual(field("task", "attachments"), { label: "Attachments", type: "file", format_options: { max_files: 20 } });
});

test("attachments follow the participants rule", () => {
  const task = JSON.parse(fs.readFileSync(path.join(configDir, "entities/task.json"), "utf8"));
  const rule = task.rules.find((r) => r.key === "board_by_participants");
  assert.ok(rule.condition.leaves[1].write.fields.includes("attachments"));
});

test("the holder completes a task straight from todo, and only the holder", () => {
  const task = JSON.parse(fs.readFileSync(path.join(packageDir, "objects/entity/task.json"), "utf8"));
  const moves = task.stage_model.transitions.filter((t) => t.from === "todo" && t.to === "done");
  assert.deepEqual(moves, [{ from: "todo", to: "done", required_fields: [], movers: [{ kind: "is_holder" }] }]);
});
