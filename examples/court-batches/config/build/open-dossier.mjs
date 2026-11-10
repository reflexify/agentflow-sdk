import {
  NOBODY, bind, create, edges, end, graph, ref, servicePrincipal, start, tpl, workflow,
} from "@reflexify/agentflow-app-builder/workflow";

const BATCH = "${entity:batch}";
const DOSSIER = "${entity:dossier}";

export const workflows = {
  open_dossier: workflow(
    "open_dossier",
    "Open a dossier",
    "Opens the dossier of a new batch, filed in the batch's court.",
    servicePrincipal("automation_principal"),
    NOBODY,
    graph(
      "Open a dossier",
      [
        start({ subject: BATCH }),
        // `from: "trigger"` files the dossier in the batch's unit. The run's service principal has no unit of its own,
        // so the default (the creator's unit) would have nowhere to file it.
        create("dossier", "Open the dossier", DOSSIER, [
          bind("batch", ref("subject.record_id")),
          bind("title", tpl("Dossier of {{ subject.record.title }}")),
          bind("court", tpl("{{ subject.record.unit.name }}")),
        ], { destinationUnit: { from: "trigger" } }),
        end("opened", "Opened", "opened"),
      ],
      edges(["e_start", "start", "dossier"], ["e_opened", "dossier", "opened"]),
    ),
  ),
};

export const triggers = {
  open_dossier: {
    workflow: "open_dossier",
    kind: "entity_record",
    enabled: false,
    config: { entity_id: BATCH, change_kind: "created", input_mappings: [] },
  },
};

export const actions = {};
