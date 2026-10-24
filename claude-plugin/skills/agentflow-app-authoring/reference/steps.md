# The steps a workflow may use

A workflow is a graph of steps: `node(id, name, nodeType, params, settings)` in
`@reflexify/agentflow-app-builder/workflow`, with a helper for the common ones (`workflows.md`, "The helpers").
This page says, for every step kind, whether a package can carry it, how to write it, and what later steps read
from it. A step's output is read as `nodes.<id>.output.<member>` in a `ref(...)` or a `{{ … }}` template.

The builder checks a graph's shape (`workflows.md`, "What `merge` checks") and passes every step's own parameters
through unchecked. AgentFlow checks them at `lint` and at install. So write a step the way this reference shows it,
and run `lint` before you believe it.

## Steps with a helper or a shipped example

| Step (`node_type`) | Write it with | Reads as | Example |
|---|---|---|---|
| `start` | `start({ subject?, params? })` | `input.<name>` (the run's input), `subject.record_id`, `subject.record.<field>` | the case desk's "Open a case" |
| `end` | `end(id, name, outcome?, outputs?)`; `outputs` is `{ name: ref(...) \| lit(...) }`, and a `ref` may carry a `label` | what a Call step or a trigger's caller reads | A For Each step, below |
| `decision` | `decision(id, name, [when(edge, condition), otherwise(edge)])` | picks the edge | `workflows.md`, "Decisions" |
| `human` | `node(id, name, "human", { assignment, actions })` | the person picks an action; each action names an edge | `workflows.md`, "Human steps" |
| `entity_record`, `operation: "get"` | `getById(id, name, entity, idPath)` | `nodes.<id>.output.record` (`.id`, and each field by key) | `workflows.md`, "The helpers" |
| `entity_record`, `"search"` | `search(id, name, entity, [flt(field, op, binding)], { sort?, dir?, limit? })`; the filter value is a binding: `flt("status", "eq", lit("pending"))` | `nodes.<id>.output.records`, `.returnedCount` | A For Each step, below |
| `entity_record`, `"create"` | `create(id, name, entity, [bind(field, binding)])` | `nodes.<id>.output.record.id` | the case desk's "Open a case" |
| `entity_record`, `"update"` | `update(id, name, entity, idPath, [bind(field, binding)], { expect?, check? })`; `expect: { fields: { status: "pending" } }` makes the write skip when the stored values differ | `.record`, and `.skipped` (true when `expect` did not hold) | A For Each step, below |
| `entity_record`, `"update_many"` | `updateMany(id, name, entity, [flt(...)], [bind(...)])` | | `workflows.md`, "The helpers" |
| `entity_record`, `"upsert"` | `upsert(id, name, entity, matchKey, [bind(...)])`: `matchKey` is the `id` of one of the entity's `natural_key` sets (`entities.md`); it finds the record that matches the bound fields, or creates it | `.record.id` | `workflows.md`, "The helpers" |
| `set_variable` | `setvar(id, name, [[variable, binding]])`; `readParameters(...names)` reads parameters | `vars.<name>` / `{{ vars.<name> }}` | `workflows.md`, "Parameters inside text" |
| `call_workflow` | `call(id, name, "${workflow:key}", subjectSource?, [[input, binding]], settings?)`; the callee comes earlier in `ORDER` | the callee's End outputs, as `nodes.<id>.output.<name>` | `workflows.md`, "The helpers" |
| `code` | `code(id, name, "code/file.js", [[input, binding]], outputSchema)`; the file defines `main(inputs)` | `nodes.<id>.output.<member>` of `outputSchema` | `workflows.md`, "Code steps" |
| `email` | `node(id, name, "email", { email: { connection, to, cc?, replyTo?, subject, body, headers?, attachments? } })`, `connection` as in `workflows.md`, "Email steps" (a step may also set `delivery`, such as `"together"`, and `autoSubmitted`, such as `"auto-replied"`) | `nodes.<id>.output.messages[0].outbound_id` | `workflows.md`, "Email steps" |
| `agent` | `node(id, name, "agent", { agentRef: { agentId: "${agent:key}" }, promptTemplate, outputSchema, conversation?, memory? })` | `nodes.<id>.output.<member>` of `outputSchema` | `agents-and-skills.md`; `workflows.md`, "Agent steps that recall memory" |
| `for_each` | `node(id, name, "for_each", { listSource, itemAlias, mode, continueOnItemFailure, failOnItemFailure, body })`: `body` is a graph of its own (its own `start`, edges and ends) run once per item; `mode` is `parallel` or `sequential` | `nodes.<id>.output.items` (one entry per item, with its `status` and any `error`) | A For Each step, below |

A reference field reads as the id of the record it points at: `subject.record.item` is the item's id, so pass it
as an idPath (`update(…, ITEM, "subject.record.item", …)`). A longer path follows the reference into that
record: `subject.record.item.name` is the item's name, and `subject.record.item.id` is the id again, at the
cost of reading the item as the run's principal. Prefer the bare form. The same holds for
`nodes.<id>.output.record.<reference>`.

`merge` checks a For Each body as a graph of its own. A graph that must be all-or-nothing takes `"atomic"` as `graph`'s last argument; an atomic run
refuses Human, Signature, Agent and Extract text steps.

### A For Each step

A search for idle items, a body that closes each one unless its status moved since the search, and an End
whose output carries a label. Inside the body the item is `input.<itemAlias>`:

```js
search("idle", "Idle items", ITEM, [flt("status", "eq", lit("pending"))], { limit: 500 }),
node("each", "Close each", "for_each", {
  listSource: "nodes.idle.output.records", itemAlias: "item", mode: "sequential",
  continueOnItemFailure: true, failOnItemFailure: false,
  body: { schemaVersion: "1.0", start: "bs", end: ["be"],
    nodes: [
      node("bs", "Item", "start", {}),
      update("close", "Close it", ITEM, "input.item.id", [bind("status", lit("closed"))],
        { expect: { fields: { status: "pending" } } }),
      node("be", "Done", "end", {}),
    ],
    edges: edges(["be0", "bs", "close"], ["be1", "close", "be"]) },
}),
end("done", "Done", "Done", { checked: { ...ref("nodes.idle.output.returnedCount"), label: "Items checked" } }),
```

## Steps that need something outside the package

A package can carry these, but they run only if the organization supplies what they name. Each shows in setup
as a required item that is *Invalid* until the deployment or the admin provides it.

| Step | Needs | `lint` |
|---|---|---|
| `email` | an outgoing-mail connection (`connection_ref` parameter); `api.resend.com` in `egress` | `egress_undeclared` |
| `agent` | an AI provider on the deployment, and the agent's model parameter | `agent_parameter_optional` |
| `code` | a code runner for its language on the deployment | |
| `webhook` | a URL with a fixed host in `egress`, and a `secret_ref` parameter when it sends a secret | `egress_undeclared`, `destination_unknown` |
| `integration` | a connected account (`connection_ref`) and its host in `egress` | `egress_undeclared` |
| `signature` | the e-sign service on the deployment | |
| `document`, `extract_text` | document rendering and parsing on the deployment | |

There is no shipped example of a `webhook`, `integration`, `signature`, `document`, `extract_text`, `group_files`,
`image`, `entity_relationship` or `auto_number` step, and the builder does not check their parameters. To get a
step's exact parameters, build it in AgentFlow's workflow designer, pack the app as a draft (**Admin → Apps → Pack**)
and read the step in the converted module (`agentflow-from-draft`); or ask your org admin or the AgentFlow team.
Write such a step with `node(id, name, "<kind>", params)` and run `lint`.

## Steps a package cannot carry

- **`sql_query`** and **`learn`**: `lint` refuses them (`sql_node`, `learn_step`): they name one organization's
  database connection or memory types.
- **`fork`** and **`join`**: `merge` refuses a plain step with more than one outbound edge, and a Fork has one per
  arm, so the builder cannot make a parallel branch yet. Use a Decision, or a Call to another workflow.
