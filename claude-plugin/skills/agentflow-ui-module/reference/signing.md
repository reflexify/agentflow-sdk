# Signing from a module

A module does not draw a signing frame. It asks the host, and inside AgentFlow the host opens the signing dialog
the inbox uses. A module that calls it declares `ui.contract: 3` (the `agentflow-app-authoring` skill's manifest
page), and an AgentFlow built before contract 3 refuses that package. The authoring skill's page on signing
teaches the signing step itself; this page is the module's side.

## Ask the host

```tsx
const outcome = await host.signing?.sign({ entity: 'decision', record: id });
```

`entity` is the entity's key in your package (`decision`, as for `host.assistant?.setContext`), an installed key or
its id, or the Workflow task entity's id when `record` is the task's own record. `record` is the record's id. The
call resolves one of four words. They are what AgentFlow's backend reports, and it acts only on e-sign events that
end the whole envelope:

| Outcome | Means |
|---|---|
| `signed` | the step's signature is recorded. On a Signature step with several signers, that is when the last of them signs; until then, a person who signed and closed the dialog gets `closed` |
| `declined` | the envelope was declined before this person's signature was recorded, by this person or by another signer |
| `closed` | the dialog closed (its close button or Escape; a click outside does not) with no end yet, or the step ended without a signature or a decline, such as an expired envelope. Read the record again later, or use `host.realtime` |
| `nothing_to_sign` | no open signing task of this app was found for the target, and nothing opened |

- **What is signed is the step's documents**, never the record. The module cannot name a file or send one: it can
  only open a task a workflow already set up.
- **`closed` leaves the envelope prepared.** Calling `sign` again resumes it.
- **The workflow moves on through its own job.** After `signed` or `declined`, a record read made at once may still
  show the old state. Read again shortly, or watch `host.realtime`.
- **Close your own modal dialog before calling `sign`.** A kit dialog opened with `showModal()` stays on top and makes
  AgentFlow's dialog underneath inert.
- **It rejects when the lookup fails** (a server or network error), not when there is nothing to sign. Catch it
  and show AgentFlow's sentence as for any failed call.
- **One dialog at a time.** A second `sign` while one is open resolves the first `closed`, so disable your button
  while a call is pending. Unmounting the module resolves an open one `closed`.
- **Only the app's own workflows count.** A task of another app's workflow is `nothing_to_sign`.

## "About" is the run's subject

`record` is either the Workflow task's own record (`entity` is the Workflow task entity's id, the pair
`<agentflow-task-inbox>` and My Work hand out), or a record a signing task is about. A task is about its run's
subject and nothing else. A signing step whose documents come from another record, in a run about something else,
is not found by the record the screen shows, and `sign` resolves `nothing_to_sign`. The module then passes the task
record itself. Better, ask the app's author to design the run around the record the screen shows: a `for_each` over
records, or a Call whose `subjectSource` reads that record's id, such as `"subject.record.<reference field>"` (the
`agentflow-app-authoring` skill's `workflows.md`, "Calling another workflow").

## A host without signing

The app's own site has no `host.signing`, so the person signs in AgentFlow. Offer that with a link.

**The module is not told where AgentFlow is.** `host.apiUrl` builds addresses under the API the module calls, which
on the app's own site is that site's proxy, and `GET /app/objects` holds ids, not addresses. A sealed package is the
same for every organization, so do not write an address into it either: the site that mounts the module passes it
in, from its own settings, and the mount takes it as an option: a mount like the starter's `mountCases`, with one
more argument, `mountCases(root, host, api, { agentflowUrl })`. The starter's site does not mount the module (it
draws the SDK's elements), but it shows where such a value comes from: its server serves `config.json` from its own
settings. Until a site mounts the module, test the option in the module's tests and `pnpm demo`. Inside AgentFlow
the option is not needed: `host.signing` is there.

**What to link to**, under that address:

- **The task:** `/inbox?record=<task record id>&entity=<Workflow task entity id>` opens it in the inbox, where the
  person signs. The ids are a work line's `id` and `entity_id`. The task is a record of AgentFlow's Workflow task
  entity, not of your package, so the inbox opens it and does not send it back to the module (`routes.md`).
- **The record:** `/entities/<entity id>/records/<record id>` opens AgentFlow's own page for the record. On its
  default layout, its Tasks section lists the tasks about it, and each opens the task's page, which signs too. The
  entity id is `getAppObjects(host.api).id('entity:<key>')` after `await getAppObjects(host.api).load()`: `id`
  throws before the first load.

**Finding the task.** A screen keyed by a record finds its signing task in the person's work: `GET /work` with
`live: true` and `signs: true` lists their open work that asks for a signature, and the line whose
`step?.subject?.record_id` is the record is the task. `GET /work` has no filter by subject, so follow `next_cursor`
until it is null. Through an app's token it lists only the tasks of workflows the package covers (its own among
them), and a line names its subject only when the app may read the subject's entity. The lookup is a call to
AgentFlow, so it goes in the screen's API beside `list` and `create`: over HTTP in `http-cases-api.ts` (below), and a
fake in `memory-cases-api.ts`.

```tsx
import { ok, type AppHost } from '@reflexify/agentflow-sdk';

// In http-cases-api.ts: the HTTP implementation of the screen's `signingTask(recordId)`.
async function signingTask(host: Pick<AppHost, 'api'>, recordId: string): Promise<{ id: string; entity_id: string } | null> {
  let cursor: string | undefined;
  do {
    const page = await ok(host.api.GET('/work', { params: { query: { live: true, signs: true, limit: 200, cursor } } }));
    const line = page.items.find((item) => item.step?.subject?.record_id === recordId);
    if (line) return { id: line.id, entity_id: line.entity_id };
    cursor = page.next_cursor ?? undefined;
  } while (cursor);
  return null;
}

// In the screen: `task` from `api.signingTask(recordId)`, `agentflowUrl` from the mount's option.
{host.signing ? (
  <button type="button" disabled={pending} onClick={sign}>Sign</button>
) : task && agentflowUrl ? (
  <a href={`${agentflowUrl}/inbox?record=${task.id}&entity=${task.entity_id}`}>Sign in AgentFlow</a>
) : (
  <p>Sign it in AgentFlow, under My Work.</p>
)}
```

With no address (a site that passes none), say where to sign in words, as the last branch does. `host` is the
`AppHost` the module was mounted with, so widen the starter's `ScreenHost` for `signing` only, as `routes.md` does for
`assistant`: the screen calls AgentFlow through the `api` the starter's `mount` builds from `host.api`, so
`ScreenHost` leaves `api` out.

## The API elements' task detail

`<agentflow-task-detail>` shows a **Sign** button that calls `host.signing.sign(...)` for you, and
`<agentflow-task-inbox>` lists the work to sign. A module that builds its screen from the API elements (the
`@reflexify/agentflow-elements` package, no framework needed) gives the provider the host's client and signing, as properties, **before it
appends the provider**:

```ts
import '@reflexify/agentflow-elements'; // define the tags before mount runs
import type { AgentFlowClient, AppSigning } from '@reflexify/agentflow-sdk';

type ProviderElement = HTMLElement & { client?: AgentFlowClient; signing?: AppSigning };

const provider = document.createElement('agentflow-provider') as ProviderElement;
if (!('client' in provider)) {
  // another copy of the elements, from before `client`, registered the tag first: do not mount them
  root.append(signInNotice()); // your own "sign in AgentFlow" notice
  return;
}
provider.client = host.api; // every call, GET /caller included, goes through the host as the signed-in person
if (host.signing) provider.signing = host.signing; // the task detail's Sign button

const inbox = document.createElement('agentflow-task-inbox');
inbox.setAttribute('view', 'mine');
inbox.setAttribute('signs', 'true'); // only work whose step asks for a signature
provider.append(inbox);
root.append(provider); // last: the provider reads client once, when it connects
```

- **The tags are page-global, and the first registered copy wins.** `defineAgentFlowElements` skips a tag that is
  already defined. If another module, built against an elements release that predates `client`, was opened earlier in
  the same AgentFlow tab, its provider is the one you get: it ignores `provider.client`, calls
  `/agentflow/api/caller` (404 inside AgentFlow) and ends in `error`. That is what the `'client' in provider` check
  above catches, being true only for a copy that takes `client`. When it is false, do not mount the elements; show
  your own notice to sign in AgentFlow instead. The console says why: a copy that loads after an older one logs one
  warning per tag ("An older copy of the AgentFlow elements registered … first"), and
  `customElements.get('agentflow-provider')?.elementsVersion` names the copy that won (`undefined` for one released
  before the stamp).
- **`client` and `signing` are properties, never attributes**, and `client` is read once, when the provider connects.
  The provider then builds no client of its own, so `base-path` and `fetchImpl` do not apply. Define the elements
  (the import above) before `mount`: a property set on a tag that is not defined yet hides the element's own setter
  once it is.
- **`signs`** on the inbox is `"true"` for only the work that asks for a signature, `"false"` for only the work that
  does not; any other value or none lists both. A task you pick gives `task-select` `{ recordId, entityId }`; make an
  `<agentflow-task-detail entity-id record-id>` from it, as a fresh element so both ids are there from its first load.
- **Sign** calls `sign` with the task's own record, reads the step again and emits `agentflow-signed` or
  `agentflow-declined` with `{ recordId, entityId }`. The dialog shows the whole task, so the person may finish it
  there by another decision, or release it: that ends `closed`, and the element emits `agentflow-task-changed`
  `{ recordId, entityId }` when the step no longer waits on them. A `closed` that changed nothing emits nothing, and
  `nothing_to_sign` puts the notice "sign in AgentFlow" in place of the button until the step is read again. After
  any of the three events, replace the inbox and any record table with fresh copies: an element does not learn that
  the data behind it changed.
- **The form is read-only beside Sign.** For a Human step whose signing action sits in its form, the task detail
  shows the saved answers read-only, "You fill in this form and sign it in AgentFlow's signing dialog, which also offers this task's other decisions.", and only
  Release and Sign. AgentFlow's dialog shows the whole task from the saved draft, and a step's draft is not saved from
  a module, so a field typed in the element would be lost. Without `signing` the form is editable, beside a notice to
  sign in AgentFlow.
- **The session is AgentFlow's.** The provider's `signed-out` and `access-lost` states still fire. A module never
  calls `signIn` or `signOut`, which target the standalone site's `/auth` routes.
- **Map the tokens in your own stylesheet.** The elements read `--agentflow-*` custom properties; the host sets
  `--af-*` ones. Set the first from the second on your root, with the elements' own defaults as fallbacks:

  ```css
  .my-module {
    --agentflow-accent: var(--af-primary, #1570ef);
    --agentflow-accent-text: var(--af-primary-fg, #fff);
    --agentflow-text: var(--af-fg, #101828);
    --agentflow-muted: var(--af-muted-fg, #667085);
    --agentflow-border: var(--af-border, #d0d5dd);
    --agentflow-danger: var(--af-danger, #b42318);
    --agentflow-radius: var(--af-radius, 6px);
    --agentflow-font: var(--af-font-sans, system-ui, sans-serif);
  }
  ```

  Put the stylesheet in the shadow root as the starter's styles are (a stylesheet of the page does not reach it). Set
  `locale` on the provider from `host.context.locale`, and again from `host.onLocaleChange`.
- **Inside AgentFlow, the inbox also lists other workflows' signing tasks.** The module calls as the person, and
  `GET /work` has no app filter: only an app's token narrows it (above). `sign` on a task of another app's workflow,
  or of one of the organization's own, resolves `nothing_to_sign`, and the task detail then says to sign in AgentFlow.
- **Clean up on unmount.** Remove the provider and your stylesheet, and unsubscribe from `host.onLocaleChange` and
  `host.onThemeChange`.
- **A host without signing** (the app's own site) leaves `provider.signing` unset: the task detail then says to
  sign in AgentFlow. Offer the link above for a button of your own.

The SDK's `examples/signed-decision` is a worked module that does all of this in plain TypeScript
(`examples/signed-decision/src/module.ts` and `module.css`, `ui.contract: 3`), and its README's "The module"
section describes it. Use `host.signing?.sign(...)` as above when the module has a button of its own instead.
