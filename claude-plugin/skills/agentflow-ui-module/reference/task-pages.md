# A task page: working a Human step in the module

A package's Human step can name a page of this module (`agentflow-app-authoring`, `workflows.md`, "A page for the step"). AgentFlow's task links (My Work, a notification, the inbox landing) then open
`/apps/<key><path>`, and this page works the task. AgentFlow hands over a handle and data; the page decides what to
draw. A module that calls `host.tasks` declares `ui.contract: 5` (`manifest.md` in the authoring skill), and an AgentFlow built before contract 5 refuses that package.
The worked module is the SDK's `examples/task-page` (`examples/task-page/src/module.ts`), plain TypeScript with no framework;
`signing.md` is the same page for a Signature step.

**The task view in AgentFlow stays the fallback.** With modules off, a person outside the app's audience or a page an
upgrade removed, nothing redirects, and the person finishes the task there. Never build a page that is the only way to finish.

## Ask the host for the task

The page's path is the step's `page.path` with `{{ record_id }}` filled in, so read the id from `host.onLocationChange`
(`routes.md`). It is the id of the **Workflow task's record**, never the subject's. For a step with
`page: { path: "/review/{{ record_id }}" }`:

```ts
const taskId = /^\/review\/([^/?#]+)/.exec(path)?.[1];
```

`host.tasks?.open({ record: taskId })` returns an `AppTaskHandle` at once and fills it by reading, as the person.
`entity` is optional: the host finds the Workflow task entity itself. A module rarely calls `open` itself: wrap the page in
`<agentflow-task>` (next section), which opens and closes the handle. A task of another app's workflow reads `not_found`.

- **`status`** is `loading`, `ready`, `not_found` (no such task, none the person may read, or not this app's), `finished` or
  `error`. **`error` is a handle that has not managed to read the task yet**: draw a notice from it, not a spinner. `state.problem`
  says why (the server's `type`, `READ_FAILED` when the server gave none, `NETWORK_ERROR` when nothing could be sent), and the
  handle keeps trying when the window regains focus and on the nudge. A read that fails after the task was read keeps the last good
  state, so a half-filled page is never wiped.
- **The handle reads again** after each of its own actions, whether it landed or was refused, when the window regains
  focus, and when AgentFlow's task-list nudge arrives. A change someone else makes shows at the next of these; a page that
  wants it sooner watches `host.realtime`.
- **`host.tasks` is left out** by the app's own site and by an AgentFlow built before contract 5 (below).

## The wrapper and `consumeTask`

`<agentflow-task record="…">` (`@reflexify/agentflow-elements`, beside the API elements and not in the kit) hands one task to
everything inside it. It draws nothing, opens the handle when it connects or `record` changes, and closes it when it
leaves the page. Give the provider the host's members as properties **before you append it**:

```ts
import '@reflexify/agentflow-elements'; // defines the tags before mount runs
import type { AgentFlowClient, AppHost, AppSigning, AppTasks } from '@reflexify/agentflow-sdk';

type ProviderElement = HTMLElement & { client?: AgentFlowClient; signing?: AppSigning; tasks?: AppTasks };

const provider = document.createElement('agentflow-provider') as ProviderElement;
provider.client = host.api;
if (host.signing) provider.signing = host.signing;
// An older copy of the elements may have registered the tag first, and has no `tasks`.
const tasksOffered = Boolean(host.tasks) && 'tasks' in provider;
if (host.tasks && tasksOffered) provider.tasks = host.tasks;
```

- **Check `'tasks' in provider`** as `signing.md` checks `'client' in provider`. When it is false, or `host.tasks` is, say
  to open the task in AgentFlow (below) and mount no wrapper.
- **`state` on the element is output only**: `loading`, `ready`, `not-found`, `finished`, `error` or `unsupported` (a provider with no
  `tasks`, and then the element makes no call). Read it, never set it. The element does not hide on `signed-out` or
  `access-lost`: the handle calls on the host's own client, so say nothing of the provider's session.
- **Several tasks on one screen** are several wrappers. `consumeTask` answers from the nearest one.
- **Events** bubble and are composed: `agentflow-task-submitted`, `-claimed`, `-released`, `-signed`, `-declined` and
  `-changed`, each with `{ recordId, entityId, actionId? }`. Refresh a list beside the page on them.

`consumeTask(element, (handle) => …)` is called with the handle now and each time it changes, with `null` while there is
none, and returns the function that stops it. Pass an element **inside** the wrapper. Draw from `handle.state` and
subscribe to it:

```ts
import { consumeTask } from '@reflexify/agentflow-elements';
import type { AppTaskHandle, AppTaskState } from '@reflexify/agentflow-sdk';

declare const view: HTMLElement; // an element inside <agentflow-task>
declare function paint(state: AppTaskState | null): void; // your own drawing
let handle: AppTaskHandle | null = null;
let unsubscribe = () => {};

const stop = consumeTask(view, (next) => {
  unsubscribe();
  handle = next;
  unsubscribe = next ? next.subscribe((state) => paint(state)) : () => {};
  paint(next?.state ?? null);
});
// Unmount: stop(); unsubscribe();
```

The snippets above mirror the example's plain-TypeScript module. In React, build the provider as above in `mount`, append the React
container inside it, and render `<agentflow-task record={taskId}>` in JSX. Keep one line that imports the elements' JSX types in the
module (`import type {} from '@reflexify/agentflow-elements/jsx';`), which types the tag (`read-only-screens.md` says why). A hook over
`consumeTask` is a few lines, and it needs an element **inside** the wrapper:

```tsx
import { consumeTask } from '@reflexify/agentflow-elements';
import type { AppTaskHandle, AppTaskState } from '@reflexify/agentflow-sdk';
import { useEffect, useRef, useState, type RefObject } from 'react';

export function useTask(inside: RefObject<HTMLElement | null>) {
  const [task, setTask] = useState<{ handle: AppTaskHandle | null; state: AppTaskState | null }>({ handle: null, state: null });
  useEffect(() => {
    const element = inside.current;
    if (!element) return;
    let off = () => {};
    const stop = consumeTask(element, (handle) => {
      off();
      off = handle ? handle.subscribe((state) => setTask({ handle, state })) : () => {};
      setTask({ handle, state: handle?.state ?? null });
    });
    return () => {
      stop();
      off();
    };
  }, [inside]);
  return task;
}
```

```tsx
function ReviewPage({ taskId }: { taskId: string }) {
  return (
    <agentflow-task record={taskId}>
      <ReviewBody />
    </agentflow-task>
  );
}

function ReviewBody() {
  const inside = useRef<HTMLDivElement>(null); // an element rendered inside <agentflow-task>
  const { handle, state } = useTask(inside);
  return <div ref={inside}>{/* draw from `state`, act through `handle` */}</div>;
}
```

## Drawing the actions and their reasons

`state.actions` lists the step's actions in the panel's order (secondary first, the primary last), each
`{ id, label, tone, icon, kind: 'submit' | 'sign', enabled, reason }`. The server drops an action a `visibleWhen` rule hides, so it never
reaches the page; `state.allHidden` says a rule withheld every one, which is not the same as the step offering none.

- **One function judges, and the panel calls it too**, so the page and AgentFlow's task view cannot disagree about a
  button. Never recompute `enabled` from the step.
- **`reason` is `null` exactly when `enabled`.** Otherwise it is the first that holds, and one reason covers every action:

| `reason` | Means | The page |
|---|---|---|
| `finished` | the step is no longer open | show the outcome (`state.taken`) |
| `signed_waiting` | signed; the workflow has not moved on | say it is waiting |
| `held_by_other` | someone else holds the task | say who (`state.work.holder`) |
| `claim_first` | the person must claim it | offer Claim (`state.work.canClaim`) |
| `content_not_shown` | part of the step is hidden from the person, and the server would refuse a save or submit | say so and link to AgentFlow |
| `busy` | a call of the handle's is in flight | a spinner, not a message |
| `values_invalid` | the values fail the step's form; `fields` names the top-level fields | point at those fields |
| `selection_out_of_bounds` | the embedded view's selection is outside what the step asks | say how many records |

- **Translate every reason** in both languages, in the module's `text.ts`; the host ships no wording.
- **A locked action stays on screen** as `aria-disabled` with its reason in text that `aria-describedby` names (`checklist.md`,
  item 13), and the press does nothing. The example's `paintActions` is the pattern.
- **Offer Claim yourself** when `state.work.canClaim` and the person is not the holder: a group's task is locked with
  `claim_first` until `handle.claim()`, and `release()` hands it back (`state.work.canRelease`).
- **`canSaveDraft` is true only for the holder.** The draft route refuses anyone else, so show Save only when it is true.
- **`state.taken`** is `{ id, label, by }` once the step is finished; `by` is `'person'` in this release (`'deadline'` is reserved).
- **A refusal is shown, never swallowed.** A failed call rejects with an `AppTaskError`; read `error.problem`, an
  `AppTaskProblem` `{ status, type, title, detail? }`. `status: 0` is the host refusing before it sends, with `type` the reason
  above, `unknown_action`, `sign_action` or `draft_not_allowed`, `not_ready` (the task is still `loading`) or the task's `not_found` or
  `finished` status when it is not open, or `NETWORK_ERROR` when the request could not be sent at all. Otherwise `status` and `type` are
  the server's, such as `409` `WORK_NOT_ACTIVE`, `WORK_NOT_CLAIMANT`, `STEP_CONTENT_NOT_SHOWN` and `STEP_PAYLOAD_INVALID`
  (its `detail` names the field). The handle has already read the task again, so draw from the new state and show
  `problem.title` (`detail` where it adds the field). A call on a closed handle rejects with a plain `Error`.

## Values and submit

- **`setValues(changes)`** keeps the page's edits in the handle, and `state.values` follows them. A verdict such as `values_invalid` follows them too. The
  embedded view's selection rides as `{ selection: ids }`.
- **`submit(actionId)`** sends what AgentFlow's task panel sends. Before any `setValues` that is the draft or the prefill; after one it is the
  form's defaults, the current values and the change. Either way a field the page did not draw is carried, not blanked.
- **Never call `…/step/submit` yourself.** A page that builds its own payload meets the trap the handle exists to avoid: the bound write
  reads a key missing from the payload as empty, so a submit of only the drawn fields blanks the subject's other bound fields.
- **A packaged Human step has no form of its own.** What `setValues` holds is carried by the submission and the server does not
  check it; the workflow reads it as `nodes.<step>.output.<key>`. Validate it in the workflow, or bind it to a typed field of
  the record where the write is checked (`workflows.md` in the authoring skill). A task finished in AgentFlow's own view carries none of these keys.
- **A value the step must carry** (matched lines, a chosen option) is bound to a typed field of the record or validated in the workflow,
  not trusted as it arrives. Keep AgentFlow's own view able to finish the task: a later step handles a missing `output.<key>`.
- **`saveDraft()`** works for the holder (`canSaveDraft`), and a call without it is refused locally with `draft_not_allowed`.
- **Lock a button on the first press**, through a flag set in the same tick (the example's `inFlight`): a second press before the first
  settles would otherwise send a second call.

## Signing and the assistant

- **`sign()`** saves the handle's draft, opens AgentFlow's signing dialog for this task and resolves its outcome, `signed`, `declined`,
  `closed` or `nothing_to_sign` (`signing.md`). The action that signs has `kind: 'sign'`, which `submit` refuses; draw it as a button for `sign()`. Close your
  own modal dialog first.
- **The assistant follows the open handle** when the person has AI mode: it reads `state.values` when they send a message and writes
  its changes with `setValues`, so your screen updates as it does. With several handles open, the most recent is the one registered.
  Nothing for the page to call.

## Documents, the embedded view, the diagram and origins

All four are methods of the handle, as the person, on the host's own client:

- **`previewDocument(viewId)`** resolves a `Blob`: the step's review document filled with the current values. A page that does not show a
  review document lets the person approve without reading it, so draw one wherever the step has `reviewDocuments`.
- **`embeddedRecords({ cursor })`** resolves the embedded entity view's rows, and the selection goes back through `setValues({ selection })`.
- **`diagram()`** resolves the step's graph, **`fieldOrigins()`** where prefilled values came from (empty when the step carries no context),
  and **`comments.list()` and `comments.add(body)`** the step's thread. `comments.list`'s cursor is ignored: the route does not page.
- The step's `export.pdf` and `export.docx` are not offered.

The rest of the page goes through `host.api` as for any screen (`records-api.md`): records with `include_capabilities`, starting a workflow, the start
form, `host.realtime`, and `list_work` with a repeatable `workflow_id` to list only your own workflows' tasks (a count comes from that list).
Keys become ids through `getAppObjects(host.api)`.

- **No internal routes.** The task view's other calls (the cockpit, the draft, previews, the embedded rows, comments, the diagram, field
  origins, `…/step/esign/*`) are reached only through the handle. AgentFlow does not enforce this for a module; it is the rule our apps follow.

## What the page leaves out

- **`not_found`**: say the task is not this app's or is gone, with a link back to the app's list. **`finished`**: show the outcome from
  `state.taken?.label`, and no actions. **`error`**: say AgentFlow could not load the task and that it tries again (the handle
  does, on focus and on the nudge), with no actions. **`unsupported`** and a missing `host.tasks`: below.
- **Anything the page does not draw** (a document type, a part of the step hidden with `content_not_shown`, the diagram) gets an
  **Open in AgentFlow** link to the task's own page, `/entities/<state.record.entity>/records/<state.record.id>`. The record page does not
  redirect, and it opens the task in AgentFlow's view. Inside AgentFlow the module is drawn on AgentFlow's own origin, so
  that path works as written; a host elsewhere needs AgentFlow's address before it (below).
- **Never link to `/inbox?record=…` for the app's own tasks.** The landing sends a task of a step with a page straight back to the page, so
  the person goes round in a circle.

## A host without tasks

The app's own site has no `host.tasks`, and an AgentFlow built before contract 5 has none either. The page then shows a notice with
**Open in AgentFlow** and mounts no wrapper. The module is told no address, so the site that mounts it passes AgentFlow's address in as an
option, as `signing.md` does for a signing link. Test the page against a fake: a host whose `tasks.open` returns a handle you script, as
`examples/task-page/test/module.test.ts` does, and a second host with no `tasks` at all.
