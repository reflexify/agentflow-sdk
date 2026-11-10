import {
  INITIATOR, bind, create, edges, end, getById, graph, node, ref, restricted, start, tpl, workflow,
} from "@reflexify/agentflow-app-builder/workflow";

const BATCH = "${entity:batch}";
const DOSSIER = "${entity:dossier}";

// One run of this graph per folder. `input.item` is that folder's files. A child run has no subject of its own, so
// it reads the batch from its parent: the batch's id is `parent.subject.record_id`, and the batch as the parent read
// it before the loop is `parent.nodes.batch.output.record`.
const perFolder = {
  schemaVersion: "1.0", start: "folder", end: ["filed"],
  nodes: [
    node("folder", "Folder", "start", {}),
    // `from: "trigger"` follows the loop out to the run's subject, so the dossier is filed in the batch's unit,
    // whoever started the run.
    create("dossier", "Open the dossier", DOSSIER, [
      bind("batch", ref("parent.subject.record_id")),
      bind("title", tpl("Dossier of {{ parent.nodes.batch.output.record.title }}")),
      bind("files", ref("input.item")),
    ], { destinationUnit: { from: "trigger" } }),
    node("filed", "Filed", "end", {}),
  ],
  edges: edges(["f_start", "folder", "dossier"], ["f_filed", "dossier", "filed"]),
};

export const workflows = {
  add_dossiers: workflow(
    "add_dossiers",
    "Add dossiers from a folder",
    "Opens one dossier for each folder of the files it is given, with that folder's files, in the batch's court.",
    INITIATOR,
    restricted("court_users", "court_admins"),
    graph(
      "Add dossiers from a folder",
      [
        start({ subject: BATCH, params: true }),
        getById("batch", "Read the batch", BATCH, "subject.record_id"),
        // Depth 1: each folder directly inside the one the person picked is one dossier.
        node("folders", "One group per folder", "group_files", { source: "input.files", depth: 1 }),
        node("each", "Each folder", "for_each", {
          listSource: "nodes.folders.output.groups", itemAlias: "item", mode: "parallel",
          continueOnItemFailure: true, failOnItemFailure: true, body: perFolder,
        }),
        end("added", "Added", "added"),
      ],
      edges(["e_start", "start", "batch"], ["e_batch", "batch", "folders"], ["e_folders", "folders", "each"], ["e_added", "each", "added"]),
    ),
    // An array of files is the shape that takes a folder: a watched folder, a folder from the person's computer, or
    // plain files, which arrive as one folder.
    { type: "object", required: ["files"],
      properties: { files: { type: "array", title: "Files", items: { type: "string", format: "attachment" } } } },
  ),
};

export const triggers = {};

export const actions = {
  add_dossiers: { entity: "batch", action: {
    workflow_id: "${workflow:add_dossiers}", key: "add_dossiers", label: "Add dossiers",
    scope: "row", mode: "async", input_map: [{ from: "record.id", to: "subject" }], icon: "folder-plus" } },
};
