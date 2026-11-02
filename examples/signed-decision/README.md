# Signed decision

`acme/signed-decision` is a small AgentFlow app that shows a Signature step end to end. It has no site. It is the app package, described by `config/`, and a small UI module that signs from the task detail.

A person records a decision. The **Sign** action on a draft decision starts the "Sign a decision" workflow, which:

1. renders a letter for the decision from a document template;
2. asks the person who started the workflow, the initiator, to sign it, in a Signature step;
3. on a signature, sets the decision's status to `signed` and keeps the signed file in the same update;
4. on a refusal or an expiry, sets the status to `declined` and keeps no file.

## What to read

| File | What it shows |
|---|---|
| `config/build/sign-decision.mjs` | The workflow, written with the builder's signing helpers (`signature`, `doc.template`, `signer.initiator`, `signedFiles`), and the record action that starts it. |
| `config/document_templates/decision_letter.json` | The letter. Its signature field has the role `approver`, which the step's signer must cover. |
| `config/entities/decision.json` | The `decision` entity: a title, a status (`draft`, `signed`, `declined`) and the signed file, with the stage model and rules that keep a decision consistent. |
| `config/package-manifest.json` | The manifest. `minPlatformVersion` is `2026.11`, the first platform that follows a decline route. Its `ui` member declares the module, with app contract 3, the first that gives a module `host.signing`. |
| `src/module.ts`, `src/module.css` | The UI module: `mount(root, host)` and its stylesheet. |
| `vite.module.config.ts` | Builds the module into `package/ui/` (ignored by git, rebuilt by `pnpm build`). |
| `test/module.test.ts` | Mounts the module under jsdom on a fake host. |
| `package/` | What `config/` builds into. Committed, so a reviewer reads what ships. |

Three things to notice in the step:

- **The signer's role matches the template.** The step signs as `approver`, and the template has one signature field for `approver`. A signer with no field, or a field with no signer, is a lint problem.
- **The decline route is an edge the step owns.** `onDecline: { edge: "e_declined" }` makes `e_declined` the decline path, and the step has exactly one other outbound edge, the signed path. A refusal and an expiry both take that route; without one, either fails the run.
- **The save is an ordinary update.** The step only produces the signed files. The `signed` update binds `signedFiles("sign")` to the entity's file field in the same write that sets the status, so the workflow never marks a decision `signed` without its file.

## What keeps a decision consistent

Whoever presses **Sign** is the approver who signs (`signer.initiator()`), and any member of the Decision users group (`app_users`) can sign any draft decision. The entity's stage model and rules then keep the record consistent:

- a decision starts as a `draft`, and the stage model lets it move only to `signed` or to `declined`;
- the rule `signed_needs_file` refuses `signed` while the signed file is empty;
- the rule `decided_is_fixed` refuses a change to the title or the signed file of a decision that is already signed or declined.

These are guards on the record, not proof of a signature. The workflow runs as the person who pressed Sign, so a rule cannot tell the workflow's write from that person's own edit: a member with update access could still mark a draft `signed` by attaching a file by hand, or move a draft to `declined` by hand, with no signing run at all.

## The module

Once installed, the module opens from the app's own section of AgentFlow's sidebar, under the "Apps" caption, and shows three things, headed in the person's language (`en` or `vi`, following the host and switching in place):

- **Waiting for your signature**: the inbox, `GET /work` for your own work (`view=mine`) that asks for a signature (`signs=true`).
- **Task**: the task you pick in the inbox, with **Release** and **Sign**, after **Claim** when nobody holds it. **Sign** opens AgentFlow's signing dialog.
- **Decisions**: a table of the Decision entity, found by its key (`entity-key="decision"`, resolved through `GET /app/objects`).

It is made of AgentFlow's API elements (`@reflexify/agentflow-elements`) and no framework. `src/module.ts` creates them with `document.createElement` and gives the provider two properties before it is connected:

- `provider.client = host.api`, so every call, `GET /caller` included, goes through the host's client as the signed-in person. The module sends no request of its own.
- `provider.signing = host.signing`, so the task detail shows **Sign**, which calls `host.signing.sign({ entity, record })`. A host without signing leaves the property unset, and the task detail then tells the person to sign in AgentFlow.

When the signature is recorded (`agentflow-signed`), declined (`agentflow-declined`), or the task was finished or released in AgentFlow's dialog without either (`agentflow-task-changed`), the module replaces the inbox and the decisions table with fresh copies, which is how an element is refreshed.

The elements read `--agentflow-*` custom properties and the host sets `--af-*` ones. `src/module.css` maps one to the other (`--agentflow-accent` from `--af-primary`, `--agentflow-text` from `--af-fg` and so on, with the elements' own defaults as fallbacks), so the elements follow the host's theme. The stylesheet is bundled into the script and put in the module's shadow root.

**Limit.** Other apps' signing tasks still show in the sample's inbox. `GET /work` has no app filter. Sign on one resolves `nothing_to_sign`, and the task detail then says to sign in AgentFlow.

The module runs inside AgentFlow, so try it through a sandbox or an install of the package; it has no page of its own. It signs only where the deployment signs: `host.signing` is there when AgentFlow offers signing, and the signing dialog works only where the deployment has a signing service.

## Commands

From the SDK's root folder, run `pnpm install && pnpm build` once, to build the builder and the elements this example uses. Then run these in this folder:

| Command | What it does |
|---|---|
| `pnpm build` | Writes `package/` from `config/`, and builds the module into `package/ui/`. |
| `pnpm check` | Checks that the committed `package/` is what `config/` builds, and that the module builds, and changes nothing. |
| `pnpm test` | The module's tests, then the same check. |

The builder's README documents `config/` and the other commands (`seal`, `lint`, `deploy`).
