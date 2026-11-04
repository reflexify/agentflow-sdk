import {
  INITIATOR, bind, decision, edges, end, extractText, graph, lit, otherwise, ref, restricted, start, update, webhook, when, workflow,
} from "@reflexify/agentflow-app-builder/workflow";

const SUBMISSION = "${entity:submission}";

export const workflows = {
  check_submission: workflow(
    "check_submission",
    "Check a submission",
    "Keeps the text of the submission's document, then looks its registry code up in the business registry and records the registered name, that the code was not found, or that the registry did not answer.",
    INITIATOR,
    restricted("app_users"),
    graph(
      "Check a submission",
      [
        start({ subject: SUBMISSION }),
        extractText("read", "Read the document", "subject.record.document", { onOversize: "truncate" }),
        webhook(
          "lookup",
          "Look the company up",
          {
            url: "https://registry.example.com/v1/companies/{{ subject.record.registry_code }}",
            method: "GET",
            headers: { Accept: "application/json" },
            auth: { kind: "bearer", secret: "registry_key" },
          },
          // With `continue`, a 404 or no answer does not fail the run: the step keeps its own output, with
          // `success` false and `status` the HTTP status (null when nothing answered), for the Decision below.
          { error_handling: { strategy: "continue" } },
        ),
        decision("found", "Found in the registry?", [
          when("e_found", { "==": [{ var: "nodes.lookup.output.success" }, true] }),
          when("e_missing", { "==": [{ var: "nodes.lookup.output.status" }, 404] }),
          otherwise("e_failed"),
        ]),
        update("checked", "Keep the text and the registered name", SUBMISSION, "subject.record_id", [
          bind("document_text", ref("nodes.read.output.text")),
          bind("page_count", ref("nodes.read.output.pageCount")),
          bind("registry_name", ref("nodes.lookup.output.response.name")),
          bind("status", lit("checked")),
        ]),
        update("missing", "Keep the text, and mark the code not found", SUBMISSION, "subject.record_id", [
          bind("document_text", ref("nodes.read.output.text")),
          bind("page_count", ref("nodes.read.output.pageCount")),
          bind("status", lit("not_found")),
        ]),
        update("failed", "Keep the text, and mark the lookup failed", SUBMISSION, "subject.record_id", [
          bind("document_text", ref("nodes.read.output.text")),
          bind("page_count", ref("nodes.read.output.pageCount")),
          bind("status", lit("lookup_failed")),
        ]),
        end("done_checked", "Checked", "checked"),
        end("done_missing", "Not found", "not_found"),
        end("done_failed", "Lookup failed", "lookup_failed"),
      ],
      edges(
        ["e_start", "start", "read"],
        ["e_read", "read", "lookup"],
        ["e_looked", "lookup", "found"],
        ["e_found", "found", "checked"], ["e_missing", "found", "missing"], ["e_failed", "found", "failed"],
        ["e_checked_done", "checked", "done_checked"], ["e_missing_done", "missing", "done_missing"],
        ["e_failed_done", "failed", "done_failed"],
      ),
    ),
  ),
};

export const triggers = {};

export const actions = {
  check: {
    entity: "submission",
    action: {
      workflow_id: "${workflow:check_submission}",
      label: "Check",
      key: "check",
      scope: "row",
      mode: "async",
      visible_when: { "==": [{ var: "status" }, "new"] },
      input_map: [{ from: "record.id", to: "subject" }],
      icon: "file-search",
    },
  },
};
