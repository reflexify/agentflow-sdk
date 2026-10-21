import {
  NOBODY, NOW, bind, decision, edges, end, getById, graph, otherwise, ref, servicePrincipal, start, update, when, workflow,
} from "@reflexify/agentflow-app-builder/workflow";

const TASK = "${entity:task}";
const CLEAR = ref("");

export const workflows = {
  stamp_completion: workflow(
    "stamp_completion",
    "Stamp completion",
    "Sets a task's completed_at when it enters done, and clears it when it leaves done.",
    servicePrincipal("automation_principal"),
    NOBODY,
    graph(
      "Stamp completion",
      [
        start({ subject: TASK }),
        getById("task", "Read the task", TASK, "subject.record_id"),
        decision("is_done", "Done?", [
          when("e_done", { "==": [{ var: "nodes.task.output.record.status" }, "done"] }),
          otherwise("e_not_done"),
        ]),
        update("stamp", "Stamp completion", TASK, "subject.record_id", [bind("completed_at", NOW)]),
        update("clear", "Clear completion", TASK, "subject.record_id", [bind("completed_at", CLEAR)]),
        end("finish", "Finish", "completed"),
      ],
      edges(
        ["e_start", "start", "task"], ["e_read", "task", "is_done"],
        ["e_done", "is_done", "stamp"], ["e_not_done", "is_done", "clear"],
        ["e_stamped", "stamp", "finish"], ["e_cleared", "clear", "finish"],
      ),
    ),
  ),
};

export const triggers = {
  stamp_completion: {
    workflow: "stamp_completion",
    kind: "entity_record",
    enabled: true,
    config: {
      entity_id: TASK,
      change_kind: "updated",
      filter: { and: [
        { in: ["status", { var: "event.changed" }] },
        { or: [{ "==": [{ var: "status" }, "done"] }, { "==": [{ var: "event.previous.status" }, "done"] }] },
      ] },
      input_mappings: [],
    },
  },
};

export const actions = {};
