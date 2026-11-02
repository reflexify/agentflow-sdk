# Signing

A signing step sends a PDF to be signed and hands back the signed file. The helpers are in
`@reflexify/agentflow-app-builder/workflow`. `examples/signed-decision` is a small app that signs a document end to
end; its workflow is the first flow below.

## The two kinds of step

| | A Signature step | A Human step with `signing` |
|---|---|---|
| Who signs | each signer you name, and each is one person | whoever holds the task, so its assignment may be a group (a member claims the task, then signs) |
| Write it with | `signature(id, name, { … })` | `node(id, name, "human", { assignment, actions, signing: signing({ … }) })` |
| The signed files | `signedFiles(id)` | `signedFiles(id)`, present only when the task was signed |
| What a later step reads | `signingStatus(id)`: `completed`, `declined` or `expired` | `nodes.<id>.output.action`, as for any Human step |

Use a Signature step when the signer is known from the run: the person who started it, or the person in a field of a
record. Use a Human step when any member of a group may sign.

**Each kind gives one of two things: the signer as a notice's actor, or a failure the run can route.**

- A **Signature step**'s signer is never a notice's `{actor}` (`notifications.md`, "Who is the actor"), but a failed
  envelope fails the step, so the run can route it ("When the envelope fails").
- A **Human step with `signing`** makes the signer the actor, but a failed envelope fails nothing: the task stays
  with its holder, and the run waits. The holder can sign again or pick another of the step's actions, and an end
  condition can end it, but nothing moves the run on by itself except a deadline (`workflows.md`, "A deadline on the
  task"), and only when it passes.

When a failure must reach someone at once, use a Signature step and word the "signed" notice without `{actor}`
(`"{record} is signed"`). When the notice must name the signer, use a Human step with `signing` and a deadline whose
timeout branch tells someone.

## The helpers

- **Documents.** Every document is a PDF.
  - `doc.template(id, templateRef, { fieldMapping?, filename? })` renders a document template the package carries:
    `doc.template("letter", "${document_template:decision_letter}", { fieldMapping: { "/title": ref("subject.record.title") } })`.
    `fieldMapping` keys are JSON pointers into the template's `schema_json`, and the values are bindings.
    `filename` is a `{{ }}` template for the file's name; `-signed.pdf` is added to it.
  - `doc.upstream(id, nodeId, documentId)` signs a PDF an earlier Document step made: `doc.upstream("letter", "make_letter", "letter")`.
  - `doc.review(id, reviewDocumentId)` signs one of the same Human step's review documents. Only `signing()` takes it.
  - **A file on a record is never signed as it is.** No helper names a File field, and publish refuses an upstream
    document that is not a Document step's (or a Human step's review document). To sign what a person uploaded, put
    its text into a template: "A file a person uploaded", below.
- **Signers.** `signer.initiator()` is the person who started the run. `signer.field(path)` is the person in a field,
  such as `signer.field("subject.record.owner")`. `signer.stepActor(nodeId)` is the person who completed an earlier
  step, and `signer.previousActor()` the person who completed the most recent Human task in the run, whatever steps
  sit between (inside a For Each, in that item's own run). `signer.user(paramKey)` is the
  person a `user_ref` parameter names. Each of the first four takes `.manager(levels)`, a whole number from 1 to 5,
  to sign as that person's manager: `signer.initiator().manager(1)`. There is no group, unit or list signer, because
  a signer is exactly one person.
- **`signature(id, name, options)`** is a Signature step:

```js
signature("sign", "Sign the letter", {
  documents: [doc.template("letter", "${document_template:decision_letter}")],
  signers: [{ role: "approver", who: signer.initiator() }],
  method: "server_email",
  routing: "parallel",
  onDecline: { edge: "e_declined" },
  task: { name: "Sign the letter", description: "Please sign." },
})
```

  - `signers` is a list of `{ role, who, order? }`. A `role` is the role of a signing field in the documents, and each
    role is used once. With `routing: "sequential"` every signer needs an `order`, a positive whole number, and the
    signers sign in that order.
  - `method` is `"server_email"` (the default) or `"client_cert"`; `routing` is `"parallel"` (the default) or
    `"sequential"`; `onDecline` is `"fail"` (the default) or `{ edge }`. All three are checked at build.
    `certVisible` matters only with `client_cert` (below); `server_email` ignores it.
  - `task` names the signing task, as `{{ }}` templates rendered when it opens. Without it the task takes the step's name.
- **`signing(options)`** is a Human step's `signing` block. It takes `documents`, `method`, `certVisible`,
  `signedAction` (the action the signed outcome takes; name it when the step has two or more actions) and
  `onDecline`, which also takes `{ action: "<action id>" }`. In a package, list `documents`: a packaged Human step has
  no form of its own to sign.

```js
node("review", "Review and sign", "human", {
  assignment: { candidates: [{ kind: "group", id: "${param:approvers}" }] },
  actions: [{ id: "signed", label: "Signed", edgeIds: ["e_signed"] }],
  signing: signing({
    documents: [doc.template("letter", "${document_template:decision_letter}")],
    onDecline: { edge: "e_declined" },
  }),
}),
```

- **`signedFiles(stepId)`** reads `nodes.<stepId>.output.generated_files`, the signed PDFs. **`signingStatus(stepId)`**
  reads `nodes.<stepId>.output.status` of a Signature step.

The builder refuses what it has no rule for, and each refusal says where it came from: `signature step <id>` for
`signature()`, `signing` for `signing()`, `signer` for a signer helper and `doc.template` for a template document.
The pointer after `#` names the member the step stores, not the option you wrote: a wrong `method` is refused at
`#/parameters/signingMethod`, a signer's `role`, `order` and `who` at `roleKey`, `routingOrder` and `recipient`. It
refuses:

- an option it does not know, including the names the graph stores. Write `method`, not `signingMethod`; the builder
  never writes `failOnSignerFailure`, so a Signature step fails when its envelope fails, and `onDecline: { edge }`
  routes a decline;
- on a Signature step, no document or no signer, a repeated document id, a blank or repeated role, a `who` that is not
  a signer, `sequential` without an `order` on each signer, and `doc.review`. An empty `documents` list is refused
  only here: `signing()` allows it, and the task then signs its own form;
- a `method`, `routing` or `onDecline` outside its allowed values (`"continue"` is not one), and `{ action }` on a
  Signature step;
- in `signing()`, an `{ action }` route that names the `signedAction`;
- a `.manager(levels)` outside 1 to 5, and an empty `signer.field` path or `signer.stepActor` step id.

There is no `human()` helper and no `saveTo`: the save is an `update` you write.

## A document template with a signing field

The signer's mark lands on a field in the template. A signing field is an inline `signature` item in a block's content:

```json
{ "id": "0190f8f4-0000-7000-8000-000000000013", "type": "text", "content": [
  { "type": "text", "value": "Approved by: " },
  { "type": "signature", "id": "approver_signature", "role": "approver", "field_type": "signature", "label": "Approver" }
] }
```

- `id` names the field and is unique in the template. `role` is the `role` of the signer that signs it.
- `field_type` is `signature` (the default) or `initials`, which are identity marks, or `date`, `text`, `number`
  or `checkbox`, which are values the signer fills in. Other members are `label`, `required`, `reserved_width` and
  `reserved_height`.
- A template is written as in `steps.md`, "A document step and its template". Name it in a step with
  `${document_template:<key>}`.
- A `client_cert` role needs a `signature` or `initials` field, because the seal needs an identity mark to land on.

## Flow one: a document the initiator signs

A record action starts the run. A Signature step asks the person who pressed the action to sign a letter made from
the record. A signature sets the status and saves the signed file in one `update`; a refusal sets the status the
record should hold when nobody signed (the sample marks it `declined`). The complete workflow, entity, template and
action are in `examples/signed-decision`: `examples/signed-decision/config/build/sign-decision.mjs`,
`examples/signed-decision/config/entities/decision.json` and
`examples/signed-decision/config/document_templates/decision_letter.json`.

```js
const DECISION = "${entity:decision}";

// start({ subject: DECISION }), then:
signature("sign", "Sign the letter", {
  documents: [doc.template("letter", "${document_template:decision_letter}", {
    fieldMapping: { "/title": ref("subject.record.title") },
  })],
  signers: [{ role: "approver", who: signer.initiator() }],
  onDecline: { edge: "e_declined" },
}),
update("signed", "Mark signed and keep the file", DECISION, "subject.record_id", [
  bind("status", lit("signed")),
  bind("signed_file", signedFiles("sign")),
]),
update("declined", "Mark declined", DECISION, "subject.record_id", [bind("status", lit("declined"))]),
// edges: sign -> signed (e_signed), sign -> declined (e_declined)
```

The action that starts it is on the entity's records, with `input_map: [{ from: "record.id", to: "subject" }]`
(`workflows.md`, "Actions"). The workflow runs as `INITIATOR`, so the person who presses it needs `update` on the
entity and the right to make the status move (`workflows.md`, "Who a workflow runs as").

**Save the file in the same update that sets the status.** With the status first and the file in a later update, the
record reads `signed` for a moment with an empty file, and a person or a test that waits for `signed` reads it empty.
Add a rule so the record cannot say `signed` without the file:

```json config
{ "rules": [
  { "key": "signed_needs_file", "message": "A decision is signed only with its signed file", "field": "signed_file",
    "condition": { "join": "and", "leaves": [
      { "kind": "field", "rule": { "field": "status", "op": "eq", "value": "signed" } },
      { "kind": "field", "rule": { "field": "signed_file", "op": "is_empty" } } ] } }
] }
```

That rule is a guard on the record, not proof of a signature. The workflow runs as the person who pressed the
action, so a rule cannot tell the workflow's write from that person's own edit. The sample's README says what its
guards do and do not cover.

## Flow two: one document per item

A run about a batch makes one document for each item in it, and each is signed by a person named on that item. A
For Each loops over the batch's items, and each child run signs its own item's document.

- **Loop over the items as records.** Use a reference-list field as the list: `listSource: "subject.record.items"`
  when the run is about the batch, or `nodes.<id>.output.record.items` of a Get Record step. The loop then hands each
  child the record itself, and the child run is about that record. A list of bare ids, such as a Code step's output,
  gives the children no subject.
- **In the body, the item is `input.<itemAlias>`.** A body has no `subject.*` of its own, and publish refuses a
  body that reads one, so read the item's fields as `input.item.title` and its id as `input.item.id`.
- **The signer is a person field of the item.** `signer.field("input.item.owner")` reads the `owner` field of the
  item. The path depends on what the child run holds, so check it with a test run in a sandbox: a path that reads
  nothing, or an empty field, leaves the signer unresolved. The Signature step then fails with
  `SIGN_INTERNAL_RECIPIENT_UNRESOLVED`, and no decline route takes it. In a loop, `continueOnItemFailure` lets the
  other items go on.
- **The signer may be named on the batch instead.** The body cannot read the batch's record: it has no `subject.*`, and
  `parent.subject.record.*` is refused at publish (`steps.md`, "What a child reads from its parent"). Read the batch
  with a Get Record step before the loop, and read that step from the body as `parent.nodes.<id>.output…`:
  `signer.field("parent.nodes.batch.output.record.<person field>")`. Check it with a test run too.
- **Save the file to the item** with an `update` on `input.item.id`, in the same update that sets its status.

```js
const ITEM = "${entity:item}";

getById("batch", "Read the batch", "${entity:batch}", "subject.record_id"), // only when the batch names the signer
node("each", "Sign each item", "for_each", {
  listSource: "subject.record.items", itemAlias: "item", mode: "parallel",
  continueOnItemFailure: true, failOnItemFailure: false,
  body: { schemaVersion: "1.0", start: "bs", end: ["be_signed", "be_declined"],
    nodes: [
      node("bs", "Item", "start", {}),
      signature("sign", "The owner signs the letter", {
        documents: [doc.template("letter", "${document_template:item_letter}", {
          fieldMapping: { "/title": ref("input.item.title") },
        })],
        signers: [{ role: "owner", who: signer.field("input.item.owner") }],
        onDecline: { edge: "e_declined" },
      }),
      update("signed", "Keep the signed file", ITEM, "input.item.id", [
        bind("status", lit("signed")),
        bind("signed_file", signedFiles("sign")),
      ]),
      update("declined", "Mark declined", ITEM, "input.item.id", [bind("status", lit("declined"))]),
      end("be_signed", "Signed"),
      end("be_declined", "Declined"),
    ],
    edges: edges(
      ["e0", "bs", "sign"], ["e_signed", "sign", "signed"], ["e_declined", "sign", "declined"],
      ["e1", "signed", "be_signed"], ["e2", "declined", "be_declined"],
    ) },
}),
```

Each owner gets one signing task, about their item. The item entity holds a person field (`owner`, a reference to
Users) and a `signed_file` file field. A Signature step in a body is judged like any other: the build counts its decline
route there too, and `lint` checks its roles and fields.

## The decline route

`onDecline: { edge: "<edge id>" }` on `signature(...)`, and `{ edge }` or `{ action: "<action id>" }` in
`signing(...)`, send a refused signature somewhere other than failing the step. The edge is one the route owns: it
leaves the step, no action owns it, and a Signature step also has exactly one other outbound edge, the signed path.
A Human step owns its actions' edges and the route's; an `{ action }` route adds no edge. An `{ action }` route may
not name the signed action. With one action, that action is the implied signed action, so a Human step needs at
least two actions for an `{ action }` route.

What each outcome does:

| The envelope | A Signature step | A Human step with `signing` |
|---|---|---|
| Declined or expired, with a route | follows the route; `status` is `declined` or `expired` and `generated_files` is empty | the task ends `done` with the outcome "Declined" or "Expired" (`__declined` or `__expired`), and the run follows the route |
| Declined or expired, without one (`"fail"`, the default) | fails the step | the task is cancelled and the step fails |
| Failed, with or without a route | fails the step; a route never takes it | the task stays with its holder, who can sign again |

A failed envelope is a fault, not a person's answer, so no route takes it. When one edge serves both a decline and an
expiry, a Decision after it tells them apart:
`decision("why", "Why not signed?", [when("e_expired", { "==": [{ var: "nodes.sign.output.status" }, "expired"] }), otherwise("e_refused")])`.

**How long a request lives.** AgentFlow does not set it. A signing step has no expiry member, no helper takes one,
no AgentFlow setting changes it, and AgentFlow asks the e-sign service for none, so the service's own default decides
when an envelope expires (`expired`). Neither AgentFlow nor this SDK says what that default is: ask the deployment's
operator, and write the answer in the app's README for its admins. A Signature step cannot have a deadline of its
own. A Human step with `signing` can: when its deadline passes unsigned, its timeout ends the task and the run goes
on (`workflows.md`, "A deadline on the task").

### When the envelope fails

A failed envelope fails a Signature step, and the run with it, whatever the route says. To keep the run going, give
the step the error strategy `continue` (`workflows.md`, "When a step fails") **and no decline route**, then read the
outcome with a Decision: `completed` is signed, anything else is not.

```js
{ ...signature("sign", "Sign the contract", {
    documents: [doc.upstream("contract", "render", "contract")],
    signers: [{ role: "signatory", who: signer.field("subject.record.signatory") }],
  }),
  settings: { error_handling: { strategy: "continue" } } },
decision("outcome", "Signed?", [
  when("e_signed", { "==": [{ var: "nodes.sign.output.status" }, "completed"] }),
  otherwise("e_not_signed"),
]),
```

- Without a route, a declined or expired envelope fails the step too, so `continue` sends all three (declined,
  expired, failed) down `e_not_signed`, and the branch cannot tell them apart. That is the price of routing a failure.
  It also takes an envelope that was never sent, because the e-sign service did not answer when the step started,
  and a transient error while the step waits: `continue` skips the retries the step would get without it. Treat
  `e_not_signed` as "not signed", not as "declined": do not move the record to a declined status from it.
- Never combine `continue` with a decline route: a failed envelope would then take every outbound edge, the signed
  path included.
- A signer the step cannot resolve (`SIGN_INTERNAL_RECIPIENT_UNRESOLVED`) is a failure too, and takes the same branch.

**A decline route and a failure path together.** One step cannot have both, so put the signing in a workflow of its
own and call it (`workflows.md`, "Calling another workflow"). The callee keeps the decline route and writes the
outcome on the record; the caller reads the record again and routes on what it says:

```js
// sign_contract: the signing alone, about the contract the caller is about. It has no trigger.
workflow("sign_contract", "Sign the contract", "The signatory signs; a refusal or an expiry marks it declined.",
  servicePrincipal("automation_principal"), NOBODY,
  graph("Sign the contract", [
    start({ subject: "${entity:contract}" }),
    signature("sign", "Sign the contract", {
      documents: [doc.template("contract", "${document_template:contract}")],
      signers: [{ role: "signatory", who: signer.field("subject.record.signatory") }],
      onDecline: { edge: "e_declined" },
    }),
    update("signed", "Keep the signed file", "${entity:contract}", "subject.record_id",
      [bind("status", lit("signed")), bind("signed_file", signedFiles("sign"))]),
    update("declined", "Mark declined", "${entity:contract}", "subject.record_id", [bind("status", lit("declined"))]),
    end("done_signed", "Signed", "signed"),
    end("done_declined", "Declined", "declined"),
  ], edges(["e0", "start", "sign"], ["e_signed", "sign", "signed"], ["e_declined", "sign", "declined"],
    ["e1", "signed", "done_signed"], ["e2", "declined", "done_declined"])),
),

// In the caller, about the same contract:
call("signing", "Have the contract signed", "${workflow:sign_contract}", "subject.record_id", [],
  { error_handling: { strategy: "continue" } }),
getById("after", "Read the contract again", "${entity:contract}", "subject.record_id"),
decision("outcome", "How did signing end?", [
  when("e_is_signed", { "==": [{ var: "nodes.after.output.record.status" }, "signed"] }),
  when("e_is_declined", { "==": [{ var: "nodes.after.output.record.status" }, "declined"] }),
  otherwise("e_not_completed"),
]),
// e_not_completed: a Notify step to the people who must act, then an End
```

- **The Signature step keeps its retries and its route.** It has no error strategy, so a transient error is retried
  inside the callee, and a decline or an expiry takes `e_declined` there and marks the contract `declined`.
- **A failed callee fails the Call step**, which `continue` turns into the stand-in, and so does any failure of the
  Call step itself: a transient error (`continue` does not retry it), a `subjectSource` that reads no record, or a
  callee whose trigger is on. That can happen after the callee signed and wrote `signed`, while the Call step reads its
  result. So decide on the record the callee writes, not on the Call step's output: read it again after the Call
  (`getById`, which keeps its retries). `otherwise` then means the record was neither signed nor declined when it was
  read, whatever failed. A failed callee's own run records why; when the Call step itself failed, there is no callee
  run to say.
- **Tell someone on that branch.** A failed callee tells nobody by itself, and with `continue` the caller does not
  fail either. AgentFlow tells a run's starter when the run fails, but a run a trigger started has no starter. Put a
  Notify step on `otherwise` for the group that acts, and give the record a way back, such as a transition a person
  makes to send it again. On `otherwise` the record still has the status it had before the signing.
- The Call step has one outbound edge, so `continue` is safe there. Its `subjectSource` must name a record of the
  callee's entity.

A route needs `minPlatformVersion` `2026.11` or later, because an older deployment drops the route unread. The build
raises the manifest's `minPlatformVersion` to `2026.11` when any workflow has a route, at any depth. A later month
stays as written, and a value that is not a month is left for verification to refuse.

## `client_cert` and `server_email`

- **`server_email`** (the default): the signer draws or types a mark, and the e-sign service seals the PDF on the
  server.
- **`client_cert`**: the signer signs with a certificate, and the seal needs a `signature` or `initials` field to
  anchor on. `certVisible` (true by default) chooses a visible stamp at the field over an invisible seal. Not every
  deployment offers certificate signing: read the `warning:` that `lint` prints (see Setup and sandboxes).

Only PDFs are signed. A document template renders to a PDF, and an upstream file must be one: a Document step that
makes `format: "pdf"`. A Word file cannot be signed; render the document from a template instead.

## A file a person uploaded

AgentFlow signs only documents it renders: a template, a Document step's PDF, or a Human step's review document. A
PDF a person attached to a record cannot be signed as it is. What can be signed is a new PDF that carries the file's
**text**: a Document step renders a template whose field reads `content()` of the File field, and the Signature step
signs that render with `doc.upstream`.

```js
node("render", "Render the contract for signature", "document", { documents: [{
  id: "contract", documentTemplateId: "${document_template:contract_for_signature}", format: "pdf",
  fieldMapping: { "/title": ref("subject.record.title"), "/contract_text": tpl("{{ content(subject.record.draft_contract) }}") },
}] }),
signature("sign", "Sign the contract", {
  documents: [doc.upstream("contract", "render", "contract")],
  signers: [{ role: "signatory", who: signer.field("subject.record.signatory") }],
}),
```

- **Read the text in the Document step.** `content()` works in a Document step's field mapping and is refused in a
  signing step's own documents, `doc.template`'s `fieldMapping` included (`reference.content_not_available` at
  install, which `build` and `lint` do not check; `workflows.md`, "A file's text").
- **Only the text carries over.** Layout, tables and images are lost, so say in the app's README that the signed PDF is
  a rendering of the draft's text, and keep the uploaded file on the record beside it.
- **A file with no text fails the Document step** with `FILE_CONTENT_FAILED`: a scan or an image with no text layer,
  a type with no parser, or more than 1 MiB of text. Give the step `continue` and a Decision after it on
  `nodes.render.output.generated_files` (`workflows.md`, "When a step fails") to route that. The branch then also
  takes a render that failed for a moment, which would otherwise be retried: call it "not rendered", not "no text".
- The template needs a signing field for the signer's role ("A document template with a signing field"), and
  `doc.upstream` needs the Document step on every path to the Signature step.

## Setup and sandboxes

A deployment says which signing methods it offers. `ESIGN_SIGNING_METHODS` lists them, `server_email`, `client_cert` or
both; unset, it offers both, and a deployment without an e-sign service (`ESIGN_BASE_URL`) offers neither. The names are
exact and lower case, and a value that names anything else refuses boot. Setup lists
what each signing step needs, and a Human step's `signing` counts as well as a Signature step:

- **Electronic signing** is needed by a step that signs by `server_email`, which is also a step that names no method.
- **Certificate signing** is needed by a step that signs by `client_cert`.

An item is *Invalid* until the deployment offers its method. A step whose method the deployment lacks fails with
`SIGN_METHOD_UNAVAILABLE` and creates no envelope: it is not retried, and nothing falls back to the other method. On a
Human step the task stays with its holder, who can try again once the deployment offers the method.

`lint` and `deploy` ask the target which methods it offers and print a `warning:` line for each method the package uses
and the target lacks. A target that offers none gets one line saying so. The warning never changes the exit code, and
a deployment too old to say what it offers gets no warning. A sandbox is an organization on a deployment, so it signs
only the methods that deployment does, and `deploy --sandbox` warns the same way.

## Where people sign

Signing happens in AgentFlow's task panel: the signer opens the task from My Work or the inbox, and the panel shows
AgentFlow's signing frame. A UI module inside AgentFlow can open the same panel in a dialog with
`host.signing?.sign({ entity, record })`. The module never gets the frame's address, and no signing route is
published: it names a record and gets one of four words back. `signed` means the step's signature is recorded (on a
Signature step with several signers, when the last of them signs). `declined` means the envelope was declined before
this person's signature was recorded, by this person or by another signer. `closed` means the dialog closed with no
end yet, or the step ended without a signature or a decline. `nothing_to_sign` means no open signing task of this app was found for the target. The workflow moves on
after `signed` or `declined` through its own job, so a record read made at once may still show the old state. The
`agentflow-ui-module` skill's page on signing has the code. Use contract 3 in the manifest's `ui` for a module that
calls it.

- **`record` is the Workflow task's own record, or a record a task is about.** The task record is the pair
  `<agentflow-task-inbox>` and My Work hand out (`entity` is the Workflow task entity's id). A record the task is about
  is a record of your package: `entity` is its key (`decision`), as for `host.assistant.setContext`, or its id.
- **"About" means the run's subject, and nothing else.** AgentFlow finds the person's open signing tasks whose run has
  that record as its subject. A signing step whose documents come from another record, in a run about something else, is
  not found by the record the screen shows, and `sign` resolves `nothing_to_sign`. Design the run around the record
  the screen shows: a `for_each` over records, or a Call whose `subjectSource` reads that record's id from the
  caller's run, such as `"subject.record.<reference field>"` for the record the caller's record points at, or
  `"nodes.<id>.output.record.id"` for one an earlier step read or wrote (`workflows.md`, "Calling another
  workflow"). When that is not possible, the module passes the task record itself.
- **Only the app's own workflows count.** A task of another app's workflow, or of one of the organization's own, is not
  offered, and neither is a task that is not open or that does not sign.
- **A signer reads what they sign.** The task names its signer, and that alone puts it in their My Work and inbox,
  with no grant on the record. But in an installed app's run AgentFlow opens the signing frame only for a person who
  may read every record the step read to prepare it: the documents' field mappings, an upstream document's own
  sources, and the field a `signer.field(...)` names. With `signer.field("subject.record.…")` that is always the run's
  record. Otherwise the frame is refused as if the task did not exist (a 404, with no reason). Give each signer `read`
  on the run's record: a field record scope on the field that names them (`access.md`, "How to design access").
- **A module outside AgentFlow cannot sign.** The app's own site has no `host.signing`, and nothing the module is
  given says where AgentFlow is: the site passes that address to the module, which links to the task in AgentFlow's
  inbox (the `agentflow-ui-module` skill's page on signing has the links and how to find the task).
- **The elements can sign inside a module.** `examples/signed-decision`'s module gives `<agentflow-provider>`
  `client = host.api` and `signing = host.signing`; the `agentflow-ui-module` skill's page on signing has the steps.

## What `lint` reports

`lint` judges signing steps with the checks publish makes, at any For Each depth. The release skill's
`lint-problems.md` explains each with its fix.

| Code | In short |
|---|---|
| `signing_no_field` | a Human step's documents declare no signing field |
| `signing_role_unknown` | a signer's role is the role of no field in the documents |
| `signing_role_uncovered` | a field's role has no signer |
| `signing_cert_no_anchor` | a `client_cert` seal has no `signature` or `initials` field to land on |
| `signing_signer_not_one_person` | a signer is a group, a unit pool, several candidates or a rule with a group backup |
| `signing_decline_route_invalid` | the route names an edge it cannot, or `minPlatformVersion` is older than `2026.11` |

A document that is an `upstreamFile`, or a template from another package, is left for publish to judge.
