import {
  NOBODY, bind, edges, end, flt, graph, lit, ref, servicePrincipal, start, updateMany, workflow,
} from "@reflexify/agentflow-app-builder/workflow";

const PROJECT = "${entity:project}";
const TASK = "${entity:task}";
const ofThisProject = [flt("project", "eq", ref("subject.record_id"))];

// Two workflows, each chosen by its trigger's filter, because a run cannot
// decide on a Project's status: the project's task-count rollups make every read
// of the record, its event's input included, unknown to the run's decisions
// (agentflow-s7vh). They merge back into one once that is fixed.
const setFrozen = (key, name, description, step, frozen) =>
  workflow(
    key,
    name,
    description,
    servicePrincipal("automation_principal"),
    NOBODY,
    graph(
      name,
      [
        start({ subject: PROJECT }),
        updateMany(step, frozen ? "Freeze its tasks" : "Unfreeze its tasks", TASK, ofThisProject, [bind("frozen", lit(frozen))]),
        end("finish", "Finish", "completed"),
      ],
      edges(["e_start", "start", step], [frozen ? "e_frozen" : "e_unfrozen", step, "finish"]),
    ),
  );

export const workflows = {
  freeze_on_close: setFrozen("freeze_on_close", "Freeze on close", "Freezes a project's tasks when it closes.", "freeze", true),
  unfreeze_on_reopen: setFrozen("unfreeze_on_reopen", "Unfreeze on reopen", "Unfreezes a project's tasks when it reopens.", "unfreeze", false),
};

const onStatus = (workflowKey, test) => ({
  workflow: workflowKey,
  kind: "entity_record",
  enabled: true,
  config: {
    entity_id: PROJECT,
    change_kind: "updated",
    filter: { and: [{ in: ["status", { var: "event.changed" }] }, test] },
    input_mappings: [],
  },
});

export const triggers = {
  freeze_on_close: onStatus("freeze_on_close", { "==": [{ var: "status" }, "closed"] }),
  unfreeze_on_reopen: onStatus("unfreeze_on_reopen", { "==": [{ var: "event.previous.status" }, "closed"] }),
};

export const actions = {};
