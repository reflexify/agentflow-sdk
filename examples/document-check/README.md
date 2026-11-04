# Document check

`acme/document-check` is a small AgentFlow app that shows two steps that reach outside the package: an Extract Text step that reads an uploaded document, and a Webhook step that sends a secret to an external service. It has no site and no UI module. It is the app package, described by `config/`.

A person records a submission with a document and a registry code. The **Check** action on a new submission starts the "Check a submission" workflow, which:

1. reads the document's text (`extractText`), cut short rather than failed when it is very long;
2. looks the registry code up in a business registry (`webhook`), with the registry's API key as a bearer token;
3. on an answer, keeps the text, the page count and the registered name, and marks the submission `checked`;
4. on a 404, keeps the text and marks it `not_found`; when the registry does not answer, `lookup_failed`.

## What to read

| File | What it shows |
|---|---|
| `config/build/check-submission.mjs` | The workflow, written with the builder's `extractText`, `webhook` and `decision` helpers, and the record action that starts it. |
| `config/package-manifest.json` | The manifest: the `secret_ref` parameter `registry_key` the webhook sends, and `registry.example.com` in `egress`. |
| `config/entities/submission.json` | The `submission` entity: the document, the registry code, the status, and the fields the workflow fills. |
| `package/` | What `config/` builds into. Committed, so a reviewer reads what ships. |

Three things to notice in the steps:

- **The secret is a parameter, and its host is declared.** `auth: { kind: "bearer", secret: "registry_key" }` names the `secret_ref` parameter; the admin picks the stored secret at install, and the package never holds its value. Because the step sends a secret, `lint` wants the URL's host written in the URL, not in a template, and listed in `egress`; without the egress entry it reports `egress_undeclared`.
- **A failed lookup does not end the run.** The webhook's settings hold the error strategy `continue`. A webhook then keeps its own output: `success` is false and `status` is the HTTP status, or null when nothing answered. The Decision sends `success` to `checked`, a 404 to `not_found`, and anything else to `lookup_failed`.
- **The text comes from one read.** `nodes.read.output.text` is written by each of the three updates. A template that only needs the text could read `{{ content(subject.record.document) }}` with no step; the Extract Text step adds the page count and `onOversize: "truncate"`.

## Commands

From the SDK's root folder, run `pnpm install && pnpm build` once, to build the builder this example uses. Then run these in this folder:

| Command | What it does |
|---|---|
| `pnpm build` | Writes `package/` from `config/`. |
| `pnpm check` | Checks that the committed `package/` is what `config/` builds, and changes nothing. |
| `pnpm test` | The same check. |

The builder's README documents `config/` and the other commands (`seal`, `lint`, `deploy`).
