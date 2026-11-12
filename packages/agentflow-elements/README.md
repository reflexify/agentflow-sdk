# @reflexify/agentflow-elements

The user guide on your deployment explains how to build, seal and deploy an app: `<AGENTFLOW_URL>/guides/en/xay-dung-ung-dung/tong-quan` (Vietnamese: `<AGENTFLOW_URL>/guides/xay-dung-ung-dung/tong-quan`).

Five web components that put AgentFlow work inside an installed app's own pages: a task inbox, a workflow task you can claim and submit, an entity's records, and a form that starts a workflow. They work in any framework, or in none.

The elements talk to AgentFlow only through the proxy of [`@reflexify/agentflow-sdk/server`](../agentflow-sdk/README.md), so mount `createAgentFlowServer` at `basePath` (default `/agentflow`) first. Each element is a custom element with an open shadow root. Its styles are its own and it registers no other tags (but one kit element, `af-folder-source`, which a start form loads when it has [a folder field](#what-forms-can-show) to draw), so it neither leaks CSS into your page nor clashes with your components.

ESM only. The package is `"private": true` for now.

The package also ships a separate UI kit: twenty-seven elements (dialog, confirm, menu, popover, tooltip, toast, date, person picker, number input, select, combobox, rich editor, tile, field, fieldset, form, scroll area, tabs, splitter, pager, copy button, Markdown view, tree picker, bulk bar, file upload, signature pad, folder source) and a CSS layer, for an app module's own screens. See [The UI kit](#the-ui-kit).

## Loading it

Pick one of three ways:

1. **In a bundled app**, import the package once, at the top of your entry module. The import registers the six tags:

   ```ts
   import '@reflexify/agentflow-elements';
   ```

2. **In a plain page**, load the bundle as a module script. `dist/agentflow-elements.js` is an ES module with no bare imports. It imports the files in `dist/chunks/` by relative path, some of them only when they are needed, so serve `agentflow-elements.js` with `chunks/` beside it, from anywhere on your origin.

   ```html
   <script type="module" src="/assets/agentflow-elements.js"></script>
   ```

3. **In React 19**, add the JSX typings as well as the import. They type the attributes, the property-only `strings`, `filter`, `fetchImpl`, `signing` and `client`, and the events, and make `record-id` and one of `entity-id` or `entity-key` required on the task detail, and one of `entity-id` or `entity-key` on the record table. The camelCase properties that mirror attributes, such as `recordId`, are not typed: write the attribute.

   ```ts
   import '@reflexify/agentflow-elements';
   import type {} from '@reflexify/agentflow-elements/jsx';
   ```

Register the tags before your first render, which a top-level import does. React 19 sets a prop as a property only when the element already has it, so on a tag that isn't defined yet, `strings`, `filter`, `fetchImpl`, `signing` and `client` would arrive as attributes and be ignored.

`defineAgentFlowElements()` registers the tags and skips any tag already defined. A second copy of the bundle on the page therefore does not throw, and the first copy's definitions stay in use.

**Version skew.** Each element class carries a static `elementsVersion`, the package version (also exported as `ELEMENTS_VERSION`). When a tag is already registered by a copy with an older `elementsVersion`, or with none, `defineAgentFlowElements()` keeps it and logs one `console.warn` for that tag. Every copy released before `elementsVersion` has none, so it is reported. Your page then runs against the older copy, so feature-detect what you need rather than assume it: inside an AgentFlow module, check `'client' in provider` before relying on `client`. `customElements.get('agentflow-provider').elementsVersion` tells you which copy you got.

## The elements

Attributes are kebab-case, and the matching properties are camelCase. "Property only" means there is no attribute, because the value is not a string.

| Tag | Attributes / properties | Events (`detail`) | Parts |
|---|---|---|---|
| `agentflow-provider` | `base-path` (default `/agentflow`), `locale` (`en` or `vi`), `strings` (property only, a partial string map), `fetchImpl` (property only, default `globalThis.fetch`), `signing` (property only, an `AppSigning`), `tasks` (property only, an `AppTasks`: the host's `host.tasks`), `client` (property only, an `AgentFlowClient`: the client a module's `host.api` is, which the provider then uses for every call) | `session-ready` `{caller}`, `signed-out` `{}`, `access-lost` `{code}`, `request-failed` `{code, status, detail, requestId}` | none (it renders its children through `<slot>`) |
| `agentflow-task` | `record` (required: the record of the task to open), `entity` (optional: the record's entity, when the host cannot work it out); reflected `state`: `loading`, `ready`, `not-found`, `finished`, `error` or `unsupported` | `agentflow-task-submitted` `{recordId, entityId, actionId}`, `agentflow-task-claimed`, `agentflow-task-released`, `agentflow-task-signed`, `agentflow-task-declined` and `agentflow-task-changed`, each `{recordId, entityId}` | none (it renders its children through `<slot>`, with `display: contents`) |
| `agentflow-task-inbox` | `view` (`all`, `mine` or `claimable`; default `all`), `page-size` (default 25), `signs` (`true` lists only work whose step asks for a signature, `false` only work whose step does not; absent or any other value lists both) | `task-select` `{recordId, entityId}` | `table`, `row`, `empty`, `error`, `load-more` |
| `agentflow-task-detail` | `entity-id`, `entity-key` (the package's key, the same in every org; resolved through `GET /app/objects`, so the site's registration must belong to an installed package; an id wins over a key; one of the two is required), `record-id` (required) | `task-claimed` `{recordId, entityId}`, `task-released` `{recordId, entityId}`, `task-submitted` `{recordId, entityId, actionId}`, `agentflow-signed` `{recordId, entityId}`, `agentflow-declined` `{recordId, entityId}`, `agentflow-task-changed` `{recordId, entityId}` | `header`, `title`, `meta`, `notice`, `form`, `field`, `label`, `input`, `field-error`, `actions`, `button`, `error` |
| `agentflow-record-table` | `entity-id`, `entity-key` (the package's key, the same in every org; resolved through `GET /app/objects`, so the site's registration must belong to an installed package; an id wins over a key; one of the two is required), `columns` (a comma list of field keys; default: the first five non-system fields), `page-size` (default 25), `filter` (property only, an `EntityRecordFilters` object; when set, the list uses `POST …/records/query`) | `record-select` `{recordId}`, `record-created` `{recordId}` | `toolbar`, `search`, `create-button`, `table`, `row`, `cell`, `empty`, `error`, `load-more`, `form`, `field`, `label`, `input`, `field-error`, `notice`, `actions`, `button` |
| `agentflow-start-form` | `workflow-id` (optional; without it, a picker lists the startable workflows), `workflow-key` (the package's key, the same in every org; resolved through `GET /app/objects`, so the site's registration must belong to an installed package; an id wins over a key), `subject-record` (optional: the id of the record the run is about) with `subject-entity` (optional: that record's entity key), `resumeSets` (a property: upload sets to continue, by folder field key; see [What forms can show](#what-forms-can-show)), or `entity`, `record` and `action` together (an entity key, a record id and the key of one of the entity's actions: the form launches that action on that record) | `workflow-started` `{instanceId, workflowId, outcome?}`, `af-folder-upload-started` `{setId, field}` | `picker`, `form`, `field`, `label`, `input`, `folder-source`, `field-error`, `field-retry`, `notice`, `actions`, `button`, `error` |

Every event is a `CustomEvent` that bubbles and is `composed`, so you can listen on the element, on the provider or on `document`. The `detail` types (`TaskSelectDetail`, `WorkflowStartedDetail` and so on) are exported from the package.

The other elements must sit inside an `<agentflow-provider>`, at any depth, and render nothing until its session is ready. Once the session ends or access is lost, they show nothing again.

### Provider

- On connect, it creates the API client for `{origin}{base-path}/api`, answers its descendants' context requests and calls `GET /caller`. It reads `base-path`, `fetchImpl` and `client` once, at connect.
- `client` is the way to use the elements inside an AgentFlow app module: set it to `host.api` and every call, `GET /caller` included, goes through that client as the signed-in person. The provider then builds no client of its own, so `base-path` and `fetchImpl` do not apply to the API. A value without a `GET` function is ignored with one console warning, and the provider builds its own client as usual.
- `base-path` must be a path on your origin: one leading `/`, not two, that still names your origin once the browser resolves it. Trailing slashes are dropped, and `/` means the origin itself. Anything else, such as `@other.example` or `//other.example`, would send every call to another host, so the provider uses `/agentflow` instead and logs one console warning.
- `signing` is read whenever it changes. Without it, a task that needs signing shows a notice sending the person to AgentFlow, as before.
- `tasks` is read whenever it changes, as `signing` is. Set it to `host.tasks` inside an AgentFlow module, and check `'tasks' in provider` first: a copy of the elements from before this release, which an earlier module on the page may have registered, has no such property. Without it, `<agentflow-task>` reads `unsupported` and makes no call.
- It mirrors its state in `data-state` on the element: `loading`, then `ready`, `signed-out`, `access-lost` or `error`. The attribute is set before the event that announces the change, so a listener reads the new state. A listener added late can read it instead of waiting for an event that has already fired.
- The outcomes:
  - `200` → `ready`, and `session-ready` with the caller.
  - Any `401` → `signed-out`.
  - `403` `APP_NOT_ASSIGNED`, `APP_NOT_INSTALLED` or `USER_NOT_PROJECTED` → `access-lost` with that code.
  - Anything else → `error`, and `request-failed`.
- Every element hands its failures to the provider, which maps them the same way. A `401` anywhere signs the whole page out. `signed-out` and `access-lost` each fire once per change of state. Any other failure fires `request-failed`, and the element that failed shows it inline, with the request id.

### Task inbox

- It lists `GET /work` with `view`, `live=true` and `limit`, which is `page-size`. **Load more** follows the next cursor. A `view` it does not know means `all`. `signs` is sent as `signs=true` or `signs=false`, and nothing is sent for any other value. Changing `signs`, like `view` or `page-size`, reloads from the first page.
- It keeps only the lines a workflow step holds: My Work lists every kind of work, and a line with no step is not a task here.
- Its columns are the task (its step label, else its step key), the workflow, the status (Open, or Claimed once someone holds it) and the due date.
- Clicking a row, or pressing Enter on a focused row, fires `task-select` with the line's record and entity. Pass both to `agentflow-task-detail`.

### Task

`<agentflow-task>` hands one task to everything inside it. It draws nothing itself: it is `display: contents` around a `<slot>`, and what you put inside draws the page. Use it in an app module, where the provider has `tasks` (`host.tasks`); the page inside reads the task with `consumeTask`.

```html
<agentflow-provider id="p">
  <agentflow-task record="0190c0de-0000-7000-8000-00000000c0b1">
    <my-task-page></my-task-page>
  </agentflow-task>
</agentflow-provider>
```

```js
import { consumeTask } from '@reflexify/agentflow-elements';

// Inside my-task-page's connectedCallback; stop() in disconnectedCallback.
const stop = consumeTask(this, (task) => {
  // task is an AppTaskHandle: task.state, task.subscribe, task.submit(actionId), task.claim() ...
  // or null: outside any <agentflow-task>, or while the element has no task open.
});
```

- It calls `tasks.open({ record, entity })` on the provider when it connects and whenever `record` or `entity` changes, closing the handle it had before. It closes the handle when it is removed. `entity` is left out of the call when the attribute is not set.
- `state` mirrors the handle's `status`: `loading`, `ready`, `not-found` (the handle's `not_found`), `finished` and `error`. `unsupported` means the provider has no `tasks`, and nothing is opened. Until a provider answers it reads `loading`, and a missing `record` reads `not-found` with nothing opened. **`state` is output only.** The element writes the attribute itself and overwrites a value you set, so read it, never set it; the JSX types list no `state` for that reason. `error` is a handle that has not managed to read the task yet; its `state.problem` says why, and the host keeps trying when the window regains focus and on AgentFlow's task-list nudge.
- **It opens as soon as a provider answers, and it does not hide on `signed-out` or `access-lost`**, which the other elements do. The handle reads and writes through the host's own client, not the provider's, so those states say nothing about the task; a page that wants to react to them listens to the provider.
- **Any context provider fires `agentflow-provider-ready` on `window` when it connects, and `<agentflow-task>` is one**, since it answers `context-request` for `'agentflow-task'`. The event therefore does not mean a provider *element* has connected: a page that waits on it to find `<agentflow-provider>` should look for the element.
- Whenever the handle reports an event it did not report before, the element fires `agentflow-task-<kind>` (`submitted`, `claimed`, `released`, `signed`, `declined` or `changed`) on itself, once per event. The `detail` is `{recordId, entityId}`, with `actionId` as well when the event carries one. `entityId` is the entity the handle names for the record, else the `entity` attribute, else an empty string. Like the task detail's events they bubble and are `composed`. An event the handle already held when it was opened is not fired.
- `consumeTask(element, onTask)` finds the nearest `<agentflow-task>` around `element`, so two tasks on one screen stay apart. It calls `onTask` with the handle now and each time the handle is replaced, and with `null` while the element has none and when `element` is inside no task element. It returns a function that stops it.

### Task detail

A workflow task is a record of its own entity, and the work on it is the record's.

- It loads two things: `GET /entities/{entity-id}/records/{record-id}/step`, the step's panel, and `GET /entities/{entity-id}/records/{record-id}`, the record, which says who holds the task (`claimed_by`, named by `ref_labels.claimed_by`) and its title.
- The step answers `404` to someone who may read the task but is not named on its work. The element then shows a notice that the form is shown only to the people the task is assigned to, and nothing else. It stays that way until a read of the step succeeds, and a panel shown earlier is dropped.
- A step that is no longer open shows a notice: "complete" once it is `submitted`, and "withdrawn" when it is `cancelled`.
- A signature that is recorded on a step still `open` shows no form and no button, and says the task is signed and waiting on the workflow's owner to finish it. Signing or deciding again would contradict what is signed.
- The step answers `404` while the record itself is gone or unreadable: the element then shows the record's own problem, not the notice above.
- A task nobody holds shows **Claim**, to anyone who may open the step. The step carries no claim verdict, so someone who is not eligible to claim it sees the refusal (`403 WORK_NOT_ELIGIBLE`) as an error code after pressing it. **Claim** sends `POST …/records/{record-id}/work/claim` and **Release** `POST …/work/release`; the element then reads the step and the record again.
- A task claimed by you shows its form, filled from the saved draft, else the prefill, else empty. It also shows **Release** and either one button per action, which submits with `_action: <id>`, or a single **Submit**. **Submit** sends `POST …/records/{record-id}/step/submit` with `{payload}`, and the answer is the finished panel. A task claimed by someone else shows "Claimed by {name}", or "Someone else is working on this task." when the record does not name them.
- It never draws a button the server always refuses:
  - When rules withhold every decision (`actions_gated_out`), there is no **Submit**; a notice says there is no decision to make.
  - The action that signs is not offered as an action of the form. With no `signing` on the provider, a notice says signing happens in AgentFlow, and the form stays editable beside its other actions. With it, the notice becomes a **Sign** button and the form becomes read-only, showing the saved answers, with **Release** and **Sign** as its only buttons. AgentFlow's signing dialog shows the full task, every action included, from the saved draft, and a step's draft is not saved from a module, so what was typed here would be lost; a notice says the person fills in the form and signs it in the dialog. After a `nothing_to_sign` the form is editable again until the step is read again.
  - A step that signs, claimed by you, shows that notice and **Release** only, or **Release** and **Sign** when the provider has `signing`.
  - A task whose embedded entity view needs records chosen shows a notice sending you to AgentFlow, and **Release** only: the element does not draw that view, and the server refuses a submit without the choice. That is a selectable grid or kanban view whose minimum is above zero, or unset, which means one.
- **Sign** calls `signing.sign({ entity, record })` on the provider, and the host shows its own signing dialog. The button is busy until the dialog ends, and the element then reads the step again. `agentflow-signed` fires when the outcome is `signed` and `agentflow-declined` when it is `declined`. The dialog shows the whole task, so the person may finish it there by another decision, or release it; that ends `closed`, and `agentflow-task-changed` fires when the step read again no longer waits on them: it is no longer open, no longer served to them, or no longer theirs. A `closed` that changed nothing fires nothing. `nothing_to_sign` fires nothing and puts the notice in place of the button until the step is read again. A list beside the element is refreshed on any of the three events. Inside a module, give the provider `client` (`host.api`) and `signing` (`host.signing`) to have this button. A `sign` that rejects is reported like any other failed call, as `request-failed` and an error code in the element.
- When `entity-id` or `record-id` changes, it clears the task shown and ignores late answers about the old one. Each write carries the entity and record it started with, in both the call and the event, and a write that lands after the element moved on is announced but never shown.
- A claim refused with `409 WORK_ALREADY_CLAIMED` shows the problem inline and reloads the task.
- A submit the form's schema refuses answers `422 STEP_PAYLOAD_INVALID`, with the failing paths in its `detail` and no field errors. The element shows that detail under the error and keeps what was entered.

### Record table

- With `entity-key` instead of `entity-id`, it first resolves the key through `GET /app/objects`. When the app has no such entity, or its feature is off, it says "This app has no entity:<key>." and makes no records request, and fires no `request-failed` event: a key that names nothing is not a failed request. The task detail and the start form do the same.
- It loads `GET /entities/{entity-id}` for the fields. It lists with `GET /entities/{entity-id}/records` (the search box's text, `page-size` and the cursor), or with `POST /entities/{entity-id}/records/query` when `filter` is set. A filtered table has no search box. `filter` is compared by value, so a new object with the same contents, such as an inline `filter={{…}}` on each React render, sends no new query.
- **New record** shows only when you may write to the entity and `GET /entities/{entity-id}/create-form` answers `200`. A `403` or `404` there hides the button and nothing else; any other failure is handed to the provider and shown like a failed load. **New record** opens the create form in place, and **Create** sends `POST /entities/{entity-id}/records` with `{form_payload}`.
- Clicking a row, or pressing Enter on a focused row, fires `record-select`. A successful create fires `record-created`, then reloads the list.

### Start form

- It loads `GET /workflows/startable`, every page, 100 at a time.
  - With `workflow-key`, it resolves the key to a workflow id first, and says "This app has no workflow:<key>." when the app has no such workflow or its feature is off.
  - With `workflow-id`, it uses that workflow. If you can't start it, it shows "This workflow can't be started here".
  - Without one, it shows a picker.
- It then loads the workflow version's start form. A version with no start form asks for the name and for the folder fields its input contract names ([What forms can show](#what-forms-can-show)), and for nothing else.
- It always shows a required **Case name** field, which defaults to the workflow's name.
- **Start** sends `POST /workflows/{id}/instances` with `{name, version_id, input_payload}` and fires `workflow-started`.
- **After a successful start, the form says "Started." and resets itself.** The notice is a `part="notice"` line. The Case name goes back to the workflow's name and every other field to its initial value, so a second click can't repeat the same start unnoticed. To move on, re-render or navigate on `workflow-started`, for example with a React `key` change or a route change.

**Starting with a subject.** With `subject-record`, the start also sends `subject: {kind: 'record', record_id}`, and the form still asks for the Case name. `subject-entity` names the record's entity by its package key. It is only checked: when the app has no such entity, the form says "This app has no entity:<key>." and offers nothing to start.

**Launching a record action.** With `entity`, `record` and `action` set together, the form launches that action on that record as AgentFlow's record page does. It ignores `workflow-id` and `workflow-key`, and loads nothing until all three are set.

- It resolves the entity key, then reads the entity (`GET /entities/{id}`) to find the action by its key, and the record (`GET /entities/{id}/records/{record_id}`).
- It reads the action's workflow contract (`GET /workflows/{id}/input-contract`), and the start form of the contract's version when there are fields to ask for. A workflow whose start binds no form is asked only for the folder fields the contract names, among those the input map leaves open.
- It asks only for what the action's input map leaves open:
  - a field the map fills from the record is shown with the record's value, which the person may change;
  - a field the person empties is not sent, so the run does not get the record's value for it;
  - a field the map leaves to its own default is not shown and not sent;
  - when nothing is left, the form shows only the run's name and **Start**.
- There is no Case name. The run is named `<action label> · <record name>`, where the record name is the value of the entity's display field, or the record's id.
- **Start** sends `{name, subject, params, version_id, action_context: {entity_id, action_id, record_id}}`. The server checks the action's `visible_when` against the record as it is now.
- **An action whose `mode` is `sync` waits for its result**, as AgentFlow's dialog does.
  - The start also sends `wait_ms: 5000`. While it waits, the form is disabled and says "Working…".
  - A run that outlives the request is read again (`GET /instances/{id}`) every 2 seconds, for up to 30 seconds.
  - The notice then says how the run came out, and `workflow-started` fires once, at that moment, with `outcome`: `completed`, `failed` (a cancelled run too), `rolled_back`, `paused` (the run waits on a person) or `blocked` (an authorization block an administrator must clear).
  - `outcome` is `started`, and the notice "Started.", when the run is still going after 30 seconds, when its status can't be read (an app is refused a run that holds content), or when the form is removed or shows another action while it waits.
  - Any other start fires `workflow-started` at once, without `outcome`.
- When the server refuses with `ACTION_NOT_VISIBLE`, or the entity has no action with that key, the form is replaced by a `part="notice"` line: "This action isn't available on this record. Reload and try again."

```html
<agentflow-start-form entity="batch" record="0190c0de-0000-7000-8000-0000000000b7" action="add_files"></agentflow-start-form>
```

## Refreshing an element

Elements have no methods. To refresh one, re-render it: in React, change its `key`; in a plain page, replace it with a fresh copy. An element reloads by itself when an attribute or property that chooses its data changes, such as `entity-id`, `record-id`, `view` or `filter` (compared by value), and the record table reloads after a create. The provider is the exception: it reads `base-path`, `fetchImpl` and `client` once, when it connects, so re-render it to change them. Nothing else tells an element that the data behind it changed, such as an inbox beside a task detail that was just submitted.

## Signing in and out

```ts
import { signIn, signOut } from '@reflexify/agentflow-elements';

signIn();                  // to {basePath}/auth/login, returning to the current path, query and hash
signIn('/inbox');          // returning to /inbox
signIn('/inbox', '/af');   // with a base path other than /agentflow
signOut();                 // POST {basePath}/auth/logout
signOut('/af');
```

- `signIn(returnTo?, basePath?)` navigates to `{basePath}/auth/login?returnTo=…`. `returnTo` defaults to the current path, query and hash, so a hash-routed page returns to the same view. It must be a path on your origin.
- `signOut(basePath?)` submits a hidden form that posts to `{basePath}/auth/logout`. It is a form rather than `fetch`, because the answer redirects to the identity provider, which `fetch` cannot follow.
- Both take `basePath` by the provider's rule: one that is not a path on your origin falls back to `/agentflow`, with one console warning.

The provider never navigates by itself. Handle `signed-out` to decide what happens, which is usually `signIn()`.

## React 19

```tsx
import '@reflexify/agentflow-elements';
import { signIn, signOut } from '@reflexify/agentflow-elements';
import type {} from '@reflexify/agentflow-elements/jsx';
import { useState } from 'react';
import { Route, Routes, useNavigate, useParams } from 'react-router';

const STRINGS = { 'inbox.empty': 'Nothing is waiting for you.' };
const OPEN_CASES = { field_filters: [{ field: 'status', op: 'eq', value: 'open' }] };

export function App() {
  const [lost, setLost] = useState<string | null>(null);
  if (lost) return <p>This app is no longer available to you ({lost}).</p>;
  return (
    <agentflow-provider
      base-path="/agentflow"
      locale="vi"
      strings={STRINGS}
      onsigned-out={() => signIn()}
      onaccess-lost={(e) => setLost(e.detail.code)}
    >
      <button onClick={() => signOut()}>Sign out</button>
      <Routes>
        <Route path="/tasks" element={<Inbox />} />
        <Route path="/tasks/:entityId/:recordId" element={<Task />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/cases/new" element={<NewCase />} />
      </Routes>
    </agentflow-provider>
  );
}

function Inbox() {
  const navigate = useNavigate();
  return <agentflow-task-inbox view="mine" page-size={20} ontask-select={(e) => navigate(`/tasks/${e.detail.entityId}/${e.detail.recordId}`)} />;
}

function Task() {
  const { entityId = '', recordId = '' } = useParams();
  const navigate = useNavigate();
  return <agentflow-task-detail entity-id={entityId} record-id={recordId} ontask-submitted={() => navigate('/tasks')} />;
}

function Cases() {
  const navigate = useNavigate();
  return (
    <agentflow-record-table
      entity-id="0190c0de-0000-7000-8000-0000000000e1"
      columns="title,status,opened_on"
      filter={OPEN_CASES}
      onrecord-select={(e) => navigate(e.detail.recordId)}
    />
  );
}

function NewCase() {
  const [started, setStarted] = useState(0);
  return (
    <>
      {started > 0 && <p>Case started.</p>}
      <agentflow-start-form
        key={started}
        workflow-id="0190c0de-0000-7000-8000-0000000000c1"
        onworkflow-started={() => setStarted((n) => n + 1)}
      />
    </>
  );
}
```

React 19 passes `strings` and `filter` as properties, because the elements define them, and it wires `on<event>` props as listeners for `<event>`. The `key` change after `workflow-started` mounts a fresh form for the next case. A fresh form carries no "Started." notice, so the page shows its own message instead.

## A plain page

```html
<!doctype html>
<html lang="en">
  <head>
    <script type="module" src="/assets/agentflow-elements.js"></script>
    <style>
      agentflow-provider { --agentflow-accent: #7f56d9; --agentflow-radius: 4px; }
      agentflow-task-inbox::part(row):hover { background: #f4ebff; }
    </style>
  </head>
  <body>
    <agentflow-provider base-path="/agentflow">
      <button id="sign-out" type="button">Sign out</button>
      <agentflow-task-inbox view="all" page-size="20"></agentflow-task-inbox>
      <section id="task"></section>
    </agentflow-provider>

    <script type="module">
      import { signIn, signOut } from '/assets/agentflow-elements.js';

      const provider = document.querySelector('agentflow-provider');
      provider.strings = { 'inbox.empty': 'Nothing is waiting for you.' };
      provider.addEventListener('signed-out', () => signIn());
      if (provider.dataset.state === 'signed-out') signIn();

      document.querySelector('#sign-out').addEventListener('click', () => signOut());

      document.addEventListener('task-select', (e) => {
        const detail = document.createElement('agentflow-task-detail');
        detail.setAttribute('entity-id', e.detail.entityId);
        detail.setAttribute('record-id', e.detail.recordId);
        document.querySelector('#task').replaceChildren(detail);
      });
      document.addEventListener('task-submitted', () => {
        const inbox = document.querySelector('agentflow-task-inbox');
        inbox.replaceWith(inbox.cloneNode());
      });
    </script>
  </body>
</html>
```

Both scripts name the same URL, so the browser loads the bundle once. The `data-state` check covers a provider that settled before the listener was added. Replacing the inbox with a copy of itself is how a plain page refreshes it; a copy keeps attributes but not properties, so set any properties again.

## Theming

Style the elements through CSS custom properties and `::part()` only. Custom properties inherit into shadow roots, so setting them on the provider, or on any ancestor, themes every element inside it.

| custom property | default |
|---|---|
| `--agentflow-font` | `system-ui, sans-serif` |
| `--agentflow-text` | `#101828` |
| `--agentflow-muted` | `#667085` |
| `--agentflow-border` | `#d0d5dd` for controls, `#eaecf0` for table rules |
| `--agentflow-accent` | `#1570ef` |
| `--agentflow-accent-text` | `#fff` |
| `--agentflow-danger` | `#b42318` |
| `--agentflow-radius` | `6px` |
| `--agentflow-gap` | `12px` |

```css
agentflow-task-detail::part(button) { text-transform: uppercase; }
agentflow-record-table::part(cell) { font-variant-numeric: tabular-nums; }
agentflow-start-form::part(field-error) { font-weight: 600; }
```

The parts of each element are listed in [the table above](#the-elements).

## Language

- Every built-in string exists in English (`en`) and Vietnamese (`vi`).
- The provider's `locale` attribute wins. Without it, the locale is `vi` when `navigator.language` starts with `vi`, and `en` otherwise. Dates and numbers are formatted in the same locale.
- The provider's `strings` property overrides any key, in either language. It is a property, so set it from JavaScript. The `Strings` and `StringKey` types are exported. The keys are:
  - `common.loading`, `common.load_more`, `common.error` (`{code}`), `common.request_id` (`{id}`), `common.yes`, `common.no`, `common.cancel`;
  - `inbox.empty`, `inbox.column.task`, `inbox.column.workflow`, `inbox.column.status`, `inbox.column.due`;
  - `task.claim`, `task.release`, `task.submit`, `task.sign`, `task.claimed_by` (`{name}`), `task.claimed_by_someone`, `task.withheld`, `task.done`, `task.cancelled`, `task.signed_waiting`, `task.no_actions`, `task.sign_elsewhere`, `task.select_elsewhere`;
  - `form.required`, `form.unsupported`, `form.unsupported_required`, `form.uploading`, `form.folder_unavailable`, `form.folder_retry`;
  - `records.search`, `records.create`, `records.save`, `records.empty`;
  - `start.choose`, `start.name`, `start.submit`, `start.not_startable`, `start.started`;
  - `status.open`, `status.claimed`, `status.submitted` and `status.cancelled`: a step's statuses, and Claimed for a task someone holds. The inbox shows the first two.

## What forms can show

The task, record and start forms use one field renderer. It uses the browser's own controls and supports exactly:

- `string`, including the formats `date`, `date-time` and `email`;
- `number` and `integer`;
- `boolean`, as a checkbox;
- an `enum` whose members are all strings or `null`, as a select; `null` is not offered, because the empty option already means "none";
- a `oneOf` of `{const, title}` whose consts are all strings, as a select; a branch with a `null` const is skipped.

Anything else shows "This field can't be edited here". That includes objects, arrays, other enums and the formats `user`, `entity`, `attachment` and `signature`. A **required** field of that kind blocks the form: its submit button is disabled and a notice explains why.

**A folder field, in the start form only.** `<agentflow-start-form>` draws one more kind: a field of several files (an array of `attachment`) that the workflow's input contract gives a `folder`, which is a field a Group files step or a loop reads. It is drawn with the kit's `af-folder-source` ([Choosing a folder](#choosing-a-folder)), so the person picks files, a folder from their computer or a watched folder, sees what the launch would take, and the start sends the chosen `{$fileSet, path?}` as the field's value.

- **A workflow whose start binds no form gets its folder fields from the contract.** A workflow that declares its input as an `inputSchema` (`start({ params: true })` in the app builder) has no form, so the start form draws every field the contract gives a `folder`, labelled with the contract's `title` for it (its key without one) and required as the contract says. Its other parameters are not drawn, because the contract carries no field types: a screen that needs them asks for them itself.

- The start form reads the contract (`GET /workflows/{id}/input-contract`) only when the form has a field of several files, or when the workflow's start binds no form. A record action's launch has read it already.
- The source is given `folderSources(client)` with the provider's client, the workflow, the field's key, the contract's `folder` and the provider's locale. It is `part="folder-source"`, and its own parts are styled through that element's shadow root, with the `--af-*` tokens.
- A required folder field does not block the form. Start answers "Required" under it until a source is chosen.
- While a source uploads or checks what was chosen (the kit's `af-folder-busy`), Start is disabled and the field says "Wait for the upload to finish." (`form.uploading`) in place of "Required". A start then would go without the files.
- The source is a `role="group"` named by the field's label, so two folder fields are told apart.
- After a start the form resets, and the source with it: one upload set feeds one launch. The form no longer offers to continue a set a run it started has taken, until you set `resumeSets` anew; on `workflow-started`, clear the id you stored and the field's `resumeSets` entry.
- Start is held while a folder field is uploading or being checked, and while the launch of the chosen folder would be refused (`preview.refusal`). The source says why.
- The form gives the source no `version`: it starts the current published version, and an app's request that names a version is refused.
- The form fires `af-folder-upload-started` `{setId, field}` when an upload set is created, before its files are stored. Keep the id where the page will find it again (`localStorage`, keyed by person, for a closed tab: `sessionStorage` lasts only while the tab is open), and hand it back in `resumeSets`, a property: an object of field key to set id, such as `{scans: setId}`. The field's source then asks for the same folder and continues that set ([Choosing a folder](#choosing-a-folder)). A reload leaves the unfinished set in place, and a person may hold only a few, so a page that does not resume deletes it (`folderSources(client).deleteSet(setId)`).
- The start form loads and registers `af-folder-source` itself, and only that kit tag, the first time it has a folder field to draw, so a page needs no kit import for a start form and a form without a folder field loads no kit code. Until the element is there the field reads "Loading…" (`common.loading`) and Start is disabled, since a start then would go without the files. If its file cannot be loaded (a `chunks/` file that is missing, or a script the page's Content Security Policy refuses), the field says "The folder picker couldn't be loaded. Reload the page to try again." (`form.folder_unavailable`), the provider fires `request-failed`, an optional folder field is left empty by a start, and a required one blocks the form as a field it cannot draw does. Beside it a Try again button (`form.folder_retry`, part `field-retry`) asks for the file again, as the next folder field to appear does; a browser that remembers the failed load may answer the same, which is why the reload sentence stays. A page whose own kit registered the tag first keeps its copy, as with every kit tag, and then nothing is loaded. A page that wants the element ready before a form asks calls `defineFolderSource()`, which the package exports: it returns a promise that resolves once the tag is defined.
- Still not editable: a field of several files the contract gives no folder, a single-file field, and, in a record action, a field of files the action fills from the record, whose files are sent as they are.

Fields follow the order of the form's layout (`ui_schema_json`), then the schema's `x-order`, then the rest. The layout's sections and other structure are not rendered yet.

## Tokens

An element never sees, stores or logs a token. It calls AgentFlow through `{base-path}/api` with the browser's session cookie, which is `HttpOnly`. The server half of the SDK holds the tokens and adds `Authorization` in the proxy. There is nothing about credentials to configure on the elements.

## Content Security Policy

A page with a Content Security Policy must allow three things the bundle does. The first two were read off the built `agentflow-elements.js`, which bundles Svelte 5.57:

- **Inline `<style>` elements.** Each element's styles are a `<style>` element, without a nonce, that Svelte adds to the element's shadow root when it first renders. `style-src`, or `style-src-elem` if you set it, must allow them with `'unsafe-inline'`. Browsers ignore `'unsafe-inline'` in a directive that also lists a nonce or a hash, so a nonce-based `style-src` needs a separate `style-src-elem 'self' 'unsafe-inline'`. The alternative is the SHA-256 hash of every stylesheet, which changes with each release. Without either, the elements work but render unstyled. The six elements set no `style` attributes, so for them `style-src-attr` can stay strict. The UI kit's overlays do write inline styles: Ark's positioners place every menu, popover, tooltip, calendar and person list that way, and Zag styles the dialogs' `<dialog>` and each toast. CSSOM writes (`el.style.x = …`) are not subject to `style-src-attr` and `setAttribute('style', …)` is; this has not been checked against a strict policy, so a page that loads the kit should allow `style-src-attr 'unsafe-inline'` or test its own policy with every overlay open.
- **The Trusted Types policy `svelte-trusted-html`.** In a browser with Trusted Types, loading the bundle creates a policy of that name, which Svelte uses to build each element's markup from its own compiled templates, never from data. Under a `trusted-types` directive:
  - list `svelte-trusted-html`, or the module throws as it loads and registers no tag;
  - add `'allow-duplicates'` if the bundle can load twice, for example as an app bundle and a script tag. The second copy creates the same policy name, and without `'allow-duplicates'` that copy's module throws. When the second copy is the package imported by your app, that fails your app's entry module.

  `require-trusted-types-for 'script'` is fine: the bundle writes `innerHTML` only through that policy.
- **Sign-out's redirect to the identity provider.** `signOut()` submits a form to `{basePath}/auth/logout`, which answers with a `303` redirect to the provider's end-session endpoint. Chromium checks `form-action` against each redirect of a form submission. With `form-action 'self'` it blocks that redirect, and the person never reaches the provider's sign-out. List the origin of the provider's end-session endpoint beside `'self'`; it is normally the issuer's origin. `form-action` does not fall back to `default-src`, so a policy that does not set it needs nothing.

The bundle has no `eval`, and calls nothing but `{base-path}/api` on your origin. For example, with the identity provider at `https://id.example`:

```http
Content-Security-Policy: script-src 'self'; connect-src 'self'; style-src 'self' 'unsafe-inline'; form-action 'self' https://id.example; trusted-types svelte-trusted-html 'allow-duplicates'; require-trusted-types-for 'script'
```

List your own Trusted Types policies beside `svelte-trusted-html`. The policy name comes from Svelte, not from this package, so read this section again when a release moves to a newer Svelte. Like the custom properties, these requirements are documented, not machine-checked: jsdom enforces no CSP.

## The contract

The public contract is exactly:

- the six tags, and the kit's `af-folder-source`, which a start form with a folder field (or `defineFolderSource()`) registers unless the page's kit already has;
- the attributes and properties in [the table](#the-elements);
- the events and their `detail`;
- the parts;
- the `--agentflow-*` custom properties;
- the provider's default slot and its `data-state`;
- the package entry points: `.` (`defineAgentFlowElements`, `defineFolderSource`, `consumeTask`, `signIn`, `signOut`, `ELEMENTS_VERSION` and the types) and `./jsx`;
- the `elementsVersion` stamp on each element class;
- the bundle's file name, `agentflow-elements.js`;
- the protocol the elements use to find their provider, so that elements from two builds on one page still work together. It is a `context-request` event with `context: 'agentflow'`, a `callback(value, unsubscribe)` and `subscribe`; the `agentflow-provider-ready` event on `window`; and the context value's `state`, `caller`, `client`, `signing`, `tasks`, `locale`, `t` and `report`. `<agentflow-task>` answers the same request with `context: 'agentflow-task'`, whose value is the open `AppTaskHandle` or `null`.

`report(error)` is how an element hands a failure to the provider:

- It accepts any value. An object with a numeric `status` and a string `code` is an API error, with optional `detail` (a string), `requestId` (a string) and `fieldErrors` (an array of `{path, message}`). It is recognised by that shape, never by its class, because each build carries its own copy of the SDK's error class. Anything else is a network failure, `NETWORK_ERROR` with status `0`.
- It returns `null` when the provider took the failure over: any `401` signs the page out, and a `403` with `APP_NOT_ASSIGNED`, `APP_NOT_INSTALLED` or `USER_NOT_PROJECTED` loses access. The element then shows nothing, because the provider's state has left `ready`.
- Otherwise it fires `request-failed` and returns a `Problem` for the element to show inline:

  | field | type | |
  |---|---|---|
  | `code` | string | the API's error code, or `NETWORK_ERROR` |
  | `status` | number | the HTTP status, or `0` for a network failure |
  | `detail` | string, optional | the server's explanation; the elements do not show it |
  | `requestId` | string, optional | the id to quote to support |
  | `fieldErrors` | `{path, message}[]`, optional | one message per field, `path` a JSON pointer such as `/amount` |

The contract is not:

- **Shadow markup, ids and classes.** Any of these may change in any release. Style through `::part()` and the custom properties only, and find controls in tests through parts, not ids.
- **Boolean attributes.** The six elements have none: libraries disagree about what `flag="false"` means. The UI kit's elements do, with HTML presence semantics; see [the rules](#the-rules-every-kit-element-follows).
- **JSON in attributes.** `strings`, `filter`, `fetchImpl`, `signing`, `tasks` and `client` are properties. Set them from JavaScript. An attribute of the same name is ignored, and so is a string set as the property, with one console warning per name.

The package follows semantic versioning over that surface. A change that breaks it needs a major version.

`test/contract/` holds a build to that surface. It loads the built `agentflow-elements.js` and touches nothing but the public surface, so the same suite checks any future build, whatever library it is written with. It checks:

- the entry points, and that the six tags register, idempotently, each with `elementsVersion` equal to `ELEMENTS_VERSION`;
- that every attribute in the table is observed and every property exists;
- what they do: `base-path` in every request path; `locale="vi"` in a built-in string; the inbox's `view` and `page-size` sent as `view` and `limit`, and its `signs` sent as `signs` only when it is `true` or `false` and sent again when it changes; the record table's `columns` choosing and ordering the cells, and its `page-size` sent as `limit`; and `filter` moving the list to `POST …/records/query` with that filter;
- that `strings`, `filter`, `fetchImpl`, `signing` and `client` ignore a string, whether from an attribute or set as the property, with one console warning per name, and that a provider holding a `client` makes no request of its own;
- every event with its exact `detail`, heard outside a shadow root that holds the provider, which only a `bubbles` and `composed` event reaches, the task detail's `agentflow-signed`, `agentflow-declined` and `agentflow-task-changed` included, from a stub `signing` whose dialog ends `signed`, `declined` and `closed`;
- every part in the table, each in a state that shows it. `error` is shown for a request that fails, such as a `500`. `field-error` is shown for a `422` whose `field_errors` name the field, which the stub answers to a missing required value, so a build may check Required itself or leave it to the server;
- the provider's `data-state` for each outcome of `GET /caller`, and its default slot;
- the context protocol: an answer to `context-request`, updates to a subscribed request until it calls `unsubscribe`, and `agentflow-provider-ready` on `window`;
- that `report` reads a plain object by its shape: a `401` signs the page out, and a `422`'s `fieldErrors` come back in the `Problem`.

The `--agentflow-*` custom properties are part of the contract, but they are documented, not machine-checked: jsdom computes no styles. The JSX typings are checked by `test/jsx-types.test-d.tsx`, not by the contract suite. The unit tests cover each element's behaviour in more depth, but they run against the source, so they bind only this build.

## The UI kit

`@reflexify/agentflow-elements/kit` is a second entry, `dist/kit.js`, for an app module's own screens. It holds the elements below, built on Ark UI (and Tiptap for the editor), and the CSS layer they share. It does not need a provider and calls no API: the one element that reaches the server, `af-folder-source`, does so only through the `sources` object your page hands it. A module that imports only the kit does not load the six AgentFlow elements.

How a module built on the kit should look and behave, from tokens and layout to states, accessibility and a review
checklist, is the design guide beside this README, [DESIGN.md](DESIGN.md). It ships in the package:
`node_modules/@reflexify/agentflow-elements/DESIGN.md`.

```ts
import '@reflexify/agentflow-elements/kit';                 // registers the kit's tags
import { KIT_CSS, KIT_TAGS, defineKitElements } from '@reflexify/agentflow-elements/kit';
import type { AfSubmitDetail, ComboboxOption, FileItem, FileSetEnvelope, FolderPreview, FolderSources, FormError, KitStrings, MenuEntry, MenuGroup, MenuItem, Person, PickerPage, PickerQuery, PickerSource, SelectOption, SlotFolder, TabItem, ToastInput, TreeNode } from '@reflexify/agentflow-elements/kit';
import type {} from '@reflexify/agentflow-elements/jsx';  // React 19: types for the kit's tags
```

`KIT_CSS` is the layer as a string. Each element already has it in its shadow root; put it in your own shadow root, in a `<style>`, to use its classes on your own markup: `af-button` (with `primary`, `secondary`, `ghost`, `danger` or `link`, and `xs`, `sm`, `lg` or `icon`; [below](#buttons)), the display classes `af-chip`, `af-banner`, `af-avatar`, `af-progress`, `af-tabs`, `af-skeleton` and `af-spinner` ([below](#display-classes)), the state and piece classes `af-empty`, `af-error`, `af-repeater`, `af-drag-handle` and `af-file-chip` ([below](#state-and-piece-classes)), the table classes `af-table`, `af-table-sort` and `af-table-group` with their parts ([below](#tables)), the page structure classes `af-breadcrumb`, `af-disclosure`, `af-dl`, `af-stat`, `af-timeline` and `af-steps` with their parts ([below](#page-structure-classes)), the view classes `af-toolbar`, `af-card`, `af-board`, `af-list-row`, `af-cal` and `af-event` with their parts ([below](#view-classes)), the filter classes `af-filter-chip`, `af-search` and `af-facet` with their parts, and the chip as a toggle or a locked control ([below](#filter-classes)), and the form controls `af-input`, `af-textarea`, `af-checkbox`, `af-radio`, `af-switch`, `af-label`, `af-toggle` and `af-segmented` ([below](#form-controls)). The classes read their tokens from `.af-kit`: put them inside an element with the class `af-kit`, which declares those tokens.

The same stylesheet is a file, `@reflexify/agentflow-elements/kit.css`, for a page that links or imports CSS rather than holding a string, as AgentFlow's own frontend does (`@import '@reflexify/agentflow-elements/kit.css' layer(kit)`). It selects only the kit's own classes, never `:root`, `html` or `body`, and declares its variables on `.af-kit` only, so importing it into a cascade layer leaves the rest of the page alone.

**The kit is drawn as AgentFlow's own components are.** A kit class, and the parts of a kit element, compute the same styles as the AgentFlow component of the same name (`Button`, `Input`, `Badge`, `DialogContent`, …) in every brand and both themes, and a Playwright spec in AgentFlow's frontend (`e2e/kit-parity.spec.ts`) compares the two, computed style by computed style, in Chromium and WebKit. No CI job runs it, or this package's `pnpm e2e`, or the kit showcase's spec ([The gallery and the showcase](#the-gallery-and-the-showcase)): all are a manual check, required on every change to the kit's styles or elements or to the frontend's kit wiring. Build the showcase first, `pnpm --dir sdk --filter kit-showcase build`. Then, from `frontend/`, run `pnpm exec playwright test e2e/kit-parity.spec.ts e2e/app-module.spec.ts e2e/kit-showcase.spec.ts --project=chromium` and again with `--project=webkit`; from this package, `pnpm e2e`. Where Playwright's WebKit cannot install its system libraries (Ubuntu 26.04, for one), WebKit will not launch from the frontend's config: point a local copy of it at a WebKit build that launches there (`launchOptions.executablePath`) and say which build ran. The pairs for the tree picker, the bulk bar, the file upload and the signature pad, and the person picker's `load-more` row, have been run in Chromium only. The class and element names did not change, so markup you wrote keeps working and looks different (sizes in particular: [Buttons](#buttons) and [Display classes](#display-classes) list them).

**Registration is global and guarded.** Importing the entry calls `defineKitElements()`, which defines each tag only if it is not defined yet. Two modules on one page therefore share whichever copy of a tag registered first. That is why each element's properties, events and parts change only additively.

**Version skew.** Each element class carries a static `kitVersion`, the package version (also exported as `KIT_VERSION`). When a tag is already registered by a copy with an older `kitVersion`, or with none, `defineKitElements()` keeps it and logs one `console.warn` for that tag. Your module then runs against the older copy, so it must feature-detect anything added after the kit version it requires, for example `'label' in el` before relying on a label, rather than assume it. `customElements.get('af-date').kitVersion` tells you which copy you got. Inside AgentFlow that copy is AgentFlow's own: its frontend registers the kit on every page, so a module opened there runs on AgentFlow's copy even when it is the only module on the page. AgentFlow's kit is meant to be at least as new as the kit an installed app was built against, but nothing enforces it, so feature-detect anything newer than the version you require.

**Fonts.** Browsers ignore `@font-face` inside a shadow root, so a typeface declared in your module's CSS never loads. Use the host's faces through `--af-font-sans` and `--af-font-mono` first. For a face the host lacks, ship the file beside your module's source and register it with `loadFonts`:

```ts
import { loadFonts } from '@reflexify/agentflow-elements/kit';

await loadFonts([
  { family: 'Display', url: new URL('./display.woff2', import.meta.url).href },
  { family: 'Display', url: new URL('./display-bold.woff2', import.meta.url).href, descriptors: { weight: '700' } },
]);
```

It adds each face to `document.fonts`, which the shadow root shares, once per page: two modules or two mounts asking for the same family, url and descriptors add it once, and each weight is its own face. A family the page already has from the host is left alone. The promise resolves when the faces have loaded and never rejects: a face that fails is one `console.warn`, and text falls back to your font stack. A family name belongs to the whole page, not to your module: another app that registers a face under the same family, with its own file, changes how your text renders, so give your faces a family name distinctive to your app.

### The rules every kit element follows

- **Properties in, events out.** Data goes in as properties; anything that is not a string or a Boolean has no attribute. A change goes out as a DOM `CustomEvent` with plain data in `detail`, which `bubbles` but is not `composed`: listen on the element, or on an ancestor in the same shadow root. Values are controlled: an element that reports a change shows the new value once you set it back. There are two exceptions. `af-splitter`'s drag: its panes follow the pointer at once, since a splitter that waited for the page on every pointer move would stutter, `size-change` tells you where the drag ended, and every `size` you set moves the panes onto it, even the value it already held; to keep the panes in step with your state, set `size` from the event's detail. And `af-signature-pad`'s strokes: they show as they are drawn, since a pen that waited for the page would draw nothing, and `change` reports the drawing when each stroke ends ([Signing](#signing)). An element that holds your page's own content never names its event after a native one that bubbles up from inside it: a `<select>`, an `<input>` or a kit `af-select` in a tab panel or a splitter pane raises `change` through the host, with no `detail` of yours (a native control's has none, and a kit `af-select`'s is its own `{value}`). So `af-tabs` and `af-splitter` use `tab-change` and `size-change`, as `af-form` uses `af-submit`; the value elements keep `change`.
- **Tokens.** An element is styled only through the `--af-*` custom properties (see `AF_TOKENS` in `@reflexify/agentflow-sdk`). Each is read with its own fallback, AgentFlow's default palette, and declared on an inner element, never on `:host`, so the tokens your host sets inherit into it. Eight of them name the surfaces AgentFlow's controls use that the others cannot: `--af-secondary` and `--af-secondary-fg`, `--af-accent` and `--af-accent-fg` (the secondary and accent fills, with their text), `--af-muted` (the muted fill), `--af-input` (the border of a field) and `--af-popover` and `--af-popover-fg` (the surface of a menu or popover, a step lighter than the card in a dark brand). A palette may leave them out and the fallbacks hold. For the dark fallbacks, set `data-theme="dark"` on the element itself; with the tokens set, the inherited values decide. In the light DOM, a container with the classes `af-kit` and `data-theme="dark"` does the same for the kit classes inside it, and sets the one switch (`--k-dark`) that the values differing only in the dark follow, so it reaches the kit elements inside it too; their colours still come from the tokens, or from `data-theme="dark"` on the element.
- **The top layer.** An overlay renders in the element's own shadow root, so content you slot into it keeps working, and reaches the top layer instead of a portal, so no `overflow` or container query clips it. `af-dialog` and `af-confirm` use a native `<dialog>` opened with `showModal()`, which makes the page behind inert. The other overlays use `popover="manual"` with fixed positioning. While an element's popover layer is shown, the element itself (the host you hold, not a node in its shadow root) carries `data-raised="true"`, and `"false"` once the layer is hidden; before it first opens the attribute is absent. That attribute is part of the contract: read it to know whether an overlay is open, in jsdom too, which has no `:popover-open`. `af-dialog` and `af-confirm` have no popover layer and never set it: read their `open`. An `af-dialog` with `placement="end"` slides in, but it closes at once, with no slide out: a native `<dialog>` closes as soon as it is told to.
- **Pointer.** While it is open, `af-dialog` adds one capturing `pointerdown` listener on its document, removed when it closes. It hears a press on the backdrop from the moment the dialog shows: Zag starts its own outside-press listener a timer later, and browsers run input before timers, so a quick press would otherwise go unheard. It never calls `preventDefault`. While a stroke is held, the library under `af-signature-pad` follows the pointer with `pointermove`, `pointerup`, `pointercancel` and `contextmenu` listeners on its document, removed when the stroke ends; they act on no key.
- **Leaving the page.** `beforeunload` is the kit's one listener on `window`. `af-form` holds it only while its `dirty` is set, and removes it when `dirty` clears or the element leaves the page.
- **Keys.** The kit's own code adds no key listener on `document` or `window`. Some library listeners there are accepted, because each exists only while that library's own interaction is live and acts only on its keys, or on none. From Zag, the state-machine library under Ark: the Escape listener an overlay's dismissable layer keeps only while it is open, and the focus-visible tracker, which records whether the last input was a key or a pointer and never acts on a key. `af-toast` also keeps Zag's toast-group hotkey listener while it is mounted; its hotkey matches no key. Svelte's delegated event dispatcher runs only Svelte handlers on elements in the event's own path. No element uses Zag's focus trap: the dialogs run with `modal={false}` and rely on `showModal()`'s inert page, so Tab walks slotted fields too and may leave for the browser's own chrome rather than wrap. [DESIGN.md](DESIGN.md), "Module rules", holds the rules a module's own code follows and their reasons.
- **Escape under a page's own layer.** A kit overlay closes on Escape through a listener on its document that runs only while it is open, so a page's own layer that opened first and also listens there, as a Radix dialog does, hears the key before the kit and closes: one Escape meant for the kit overlay inside it closes the whole layer. Such a layer calls `claimEscape(event, element)` in its Escape handler, with the element it draws, and when that returns `true` cancels the event and stays open. It returns `true` when an open kit overlay sits inside `element` (anywhere in the document when `element` is `null` or left out), across open shadow roots: a raised `af-menu`, `af-popover`, `af-select`, `af-combobox`, `af-date`, `af-person-picker`, `af-tree-picker` or `af-rich-editor` (its mention menu or link popover), a raised `af-tooltip` the Escape comes from inside of (one shown by hover closes only on its own anchor, so it keeps no Escape pressed elsewhere), or an `af-dialog` or `af-confirm` whose `open` is true. It then marks the event under `Symbol.for('af-kit.escape-claimed')`, which every copy of the kit reads, and the topmost kit overlay closes on the cancelled Escape exactly as on one nobody cancelled: the same `close` or `cancel` with `reason: 'escape'`, focus back where it goes today, and a tooltip shown inside an `af-popover` still taking the Escape first. An Escape cancelled without the claim closes nothing it did not close before (`af-combobox`, `af-person-picker`, `af-date` and `af-tooltip` have always closed on any Escape). `claimEscape` comes from `@reflexify/agentflow-elements/kit` and from `@reflexify/agentflow-elements/escape`, an entry that imports nothing else and registers no tag, so a page's every layer can call it without loading the kit. A module listens on its own shadow root (module rule 5 in [DESIGN.md](DESIGN.md)), after the kit, and never needs it.
- **Drops.** No element listens for a drag or a drop on `document` or `window`. Ark's file upload guards the whole document against a stray drop by default; `af-file-upload` turns that off, so a page that wants it guards its own document ([Attaching files](#attaching-files)). `af-folder-source` listens on its own drop zone only, and cancels every drag over it and drop on it, while it is locked too.
- **Boolean attributes** follow HTML presence semantics, as `disabled` does on an `<input>`: `open`, `danger`, `busy`, `dirty`, `clearable`, `disabled`, `multiple`, `range`, `readonly`, `required`, `invalid`, `loading`, `steppers`, `fractional`, `unscaled`, `replace`, `drill`, `has-prev`, `has-next`, `has-more` and `focus-new` are true when the attribute is present, whatever its value, so `disabled="false"` is still disabled, and false only when it is absent. Remove the attribute, or set the property to `false`, to turn one off. Setting the property does not write the attribute back, except `disabled`, `readonly` and `name` on `af-date`, `af-person-picker`, `af-number-input`, `af-select`, `af-combobox`, `af-tree-picker` and `af-file-upload` (see [Form controls in a form](#form-controls-in-a-form)), and the properties of `af-field`, `af-fieldset` and `af-form` that have an attribute, which read and write it.
- **Text.** An element's own text (Close, Cancel, Today, the calendar's labels and so on) is Vietnamese when `locale` is `vi` or `vi-…`, English otherwise. Override any string through the `strings` property, a partial `KitStrings`.

### The elements

Every element also takes `locale` and `strings`. Dates are ISO `yyyy-mm-dd` strings.

| Tag | Properties (attribute) | Slots | Events (`detail`) | Parts |
|---|---|---|---|---|
| `af-dialog` | `open`, `heading`, `placement` (`center`, the default, or `end`, a side panel) | default (the body), `actions` (the footer, hidden while empty) | `close` `{reason: 'escape' \| 'outside' \| 'close-button'}`: Escape, a click on the backdrop, the × button. The element does not close itself; set `open` to `false` | `content`, `heading`, `close`, `body`, `actions` |
| `af-confirm` | `open`, `heading`, `message`, `confirmLabel` (`confirm-label`), `danger`, `impact`, `busy` | none | `confirm` `{}`; `cancel` `{reason: 'escape' \| 'close-button'}`. A backdrop click does nothing. After a press, Confirm stays locked until `busy` goes from `true` to `false` or the dialog opens again, so a double press emits once | `content`, `heading`, `message`, `impact`, `actions`, `cancel`, `confirm` |
| `af-menu` | `items` (`MenuEntry[]`: each a `MenuItem` `{id, label, disabled?, reason?, danger?, tone?, type?, checked?}` or a `MenuGroup` `{id, heading?, items: MenuItem[]}`), `label` (the trigger's accessible name), `disabled`, `reason` | default (the trigger's content) | `select` `{id}`, and `{id, checked}` for an item with `type` `checkbox` (the state it would take) or `radio` (always `true`). A disabled item never selects, shows its `reason` in a tooltip and carries it as its `aria-description`. An item's `tone` (`success`, `warning`, `info` or `danger`) colours its label in that tone's text colour, the same as the kit's `.af-chip` in the tone, and a tint of the tone shows behind it while it is highlighted; `danger` draws as the `danger` flag does, which keeps working, and a `tone` wins over `danger` on the same item. `disabled` locks the trigger: it carries `aria-disabled="true"` and stays focusable (it is not a `disabled` button, so its reason can be reached by keyboard), the menu cannot open, and one that is open closes and stays closed when unlocked. With `reason` the trigger sits in an `af-tooltip` showing it and carries it as its `aria-description`; focus that was on the trigger stays on it when the lock draws the tooltip. Without `disabled` the trigger and its items are drawn exactly as before. An item's `id` is unique across the whole menu, groups included (one id in two groups is still one item to the menu); a group's `id` may equal an item's. A group draws its `heading` and a separator before it when anything comes before it, and an empty group draws nothing; the radio items of one group are one choice. Picking a checkable item closes the menu, as a plain item does, and its check moves only once you set `checked` back | `trigger`, `item`, `group`, `heading`, `separator`, `indicator` (a checkable item's check or dot, drawn while it is checked) |
| `af-popover` | `open`, `placement` (a Floating UI placement, default `bottom-start`) | `anchor`, `content` | `close` `{reason: 'escape' \| 'outside'}`. Open and close it through `open`; a press on the anchor while it is open emits nothing, so the anchor's own click can toggle it. Closing returns focus to the anchor (below) | `anchor`, `content` |
| `af-tooltip` | `text` (empty shows the slot alone) | default (the anchor) | none. Opens after 300 ms of hover or at once on keyboard focus; Escape on the anchor closes it | `anchor` |
| `af-toast` | none; methods `show(input: ToastInput): string` (returns the toast's id) and `dismiss(id)`, both present from construction | none | `action` `{toast, action}`. Pressing the action also dismisses its toast. Success and info toasts close after 4 s, with or without an action, and an error after 8 s; an error with an action stays until dismissed | `toast`, `icon`, `text`, `action`, `close` |
| `af-date` | `value`, `min`, `max`, `clearable`, `placeholder`, `label` (the input's accessible name; without it, `placeholder` names it), `disabled`, `format` (a date mask such as `DD.MM.YYYY`, shown and read in every language; see below), the form properties `name`, `required`, `readonly`, `description`, `error`, `invalid` (see [Form controls in a form](#form-controls-in-a-form)), and `range` (Boolean) with `start` and `end` (ISO strings) | none | `change` `{value: string \| null}`, or with `range` `{start: string \| null, end: string \| null}`; `unparsed` `{text}` when typed text does not read in its `format` (see below) | `control`, `input`, `trigger`, `content`, `today`, `clear`, and with `range` `start` and `end` (each beside `input`) and `separator`. While typed text in its `format` does not parse, the host carries `data-unparsed` |
| `af-person-picker` | `people` (`Person[]`), `source` (a `PickerSource<Person>`; when set it wins over `people`), `value` (an id, an array of ids with `multiple`, or `null`), `multiple`, `placeholder`, `label` (the input's accessible name), `loading`, `disabled`, and the form properties `name`, `required`, `readonly`, `description`, `error`, `invalid` (see [Form controls in a form](#form-controls-in-a-form)) | none | `change` `{value}` in the shape of `value`; `search` `{query}` as the person types | `control`, `chip`, `remove`, `input`, `clear`, `content`, `option`, `empty`, `loading`, `load-more` |
| `af-number-input` | `value` (a number or `null`), `min`, `max`, `step` (default 1, or 0.01, one point, with `format="percent"`), `precision` (the most fraction digits shown; default 0 when `step` is a whole number in the units shown, so a percent's 0.01 counts as one point, and 2 otherwise), `fractional` (Boolean: with no `precision`, keep up to 20 fraction digits as typed and show as many as the value has, where a whole `step` otherwise means none), `unscaled` (Boolean: with `format="percent"`, the value is the percentage itself, `12.5` for 12.5%, not the fraction `0.125`, and `step`, `min` and `max` are in points), `format` (`plain`, `currency` or `percent`; default `plain`), `currency` (an ISO 4217 code; default `VND`), `separators` (`locale`, `comma_dot`, `dot_comma`, `space_comma` or `none`; default `locale`, see below), `steppers`, `placeholder`, `label` (the input's accessible name; without it, `placeholder` names it), `disabled`, and the form properties `name`, `required`, `readonly`, `description`, `error`, `invalid` (see [Form controls in a form](#form-controls-in-a-form)) | none | `change` `{value: number \| null}`, only on a commit: blur, Enter, an arrow key, PageUp or PageDown, or a stepper; `unparsed` `{text}` when typed text is refused for its separators (see below) | `control`, `input`, `increment`, `decrement`. While typed text it refuses for its grouping is in the input, the host carries `data-unparsed` |
| `af-select` | `options` (`SelectOption[]`), `value` (an option's value, an array of them with `multiple`, or `null`), `multiple`, `placeholder`, `label` (the trigger's accessible name), `disabled`, the form properties `name`, `required`, `readonly`, `description`, `error`, `invalid` (see [Form controls in a form](#form-controls-in-a-form)), and `size` (`sm`, a 32 px trigger in the same 14 px type, as AgentFlow's `SelectTrigger size="sm"`) | none | `change` `{value}` in the shape of `value`. A disabled option is never chosen, shows its `reason` in a tooltip and carries it as its `aria-description` | `trigger`, `value`, `indicator`, `content`, `option`, `empty` |
| `af-combobox` | `options` (`ComboboxOption[]`), `source` (a `PickerSource<ComboboxOption>`; when set it wins over `options`), `value` (an option's value, an array of them with `multiple`, or `null`), `multiple`, `placeholder`, `label` (the input's accessible name), `loading`, `disabled`, and the form properties `name`, `required`, `readonly`, `description`, `error`, `invalid` (see [Form controls in a form](#form-controls-in-a-form)) | none | `change` `{value}` in the shape of `value`; `search` `{query}` as the person types. A disabled option is never chosen, shows its `reason` in a tooltip and carries it as its `aria-description` | `control`, `chip`, `remove`, `input`, `clear`, `content`, `option`, `empty`, `loading`, `load-more` |
| `af-rich-editor` | `value` (Markdown), `readonly`, `placeholder`, `label` (the editable area's accessible name) | none | `change` `{value}` with the Markdown, 600 ms after typing stops and on blur, only for an edit | `toolbar`, `tool-bold`, `tool-italic`, `tool-bullet-list`, `tool-numbered-list`, `tool-link`, `link-popover`, `link-input`, `link-apply`, `placeholder`, `content` |
| `af-tile` | `spec` (a dashboard's `TileSpec` or a module's `ComputeTile`), `result` (its `TileResult` or `ComputedTile`), `fields` (the entity's fields, from `GET /entities/{entity_id}`), `rows` and `columns` (a list tile's records and the columns it shows), `paging` (a list tile's pager; property only), `table` (property only: `true` shows a chart as its table and `false` as its plot, and the tile then draws no toggle of its own; unset, it draws its own), `drill` (Boolean attribute) | none | `af-drill` `{drill, measure, bucket, segment, label, count, other, newTab}`: the value of a number tile, or a mark of a chart (a bar, a segment, a dot, a slice), only with `drill` and only when its result names the records behind it; `af-open-record` `{record, entity, newTab}`: a row of a list tile, only with `drill`; `af-page` `{direction}`: a press of the pager's Previous or Next, only with `paging`. The element never fetches | `frame`, `head`, `title`, `state`, `figure`, `label`, `value`, `meta`, `goal`, `comparison`, `secondary`, `plot`, `zero`, `slice`, `table-toggle`, `table`, `legend`, `legend-item`, `tooltip`, `verdict`, `notes`, `prose`, `list`, `badge`, `ref`, `file`, `mention`, `mention-icon`, `pager` |
| `af-field` | `label`, `description`, `error`, `invalid`, `required`, `readonly`, `edited`, `lockedReason` (`locked-reason`), `name` (unset, its control's `name`) | none: no shadow root. Its control is its first child, and a child with `slot="aside"` sits in the label row | none | none: it draws the classes under [Fields and forms](#fields-and-forms) |
| `af-fieldset` | `heading`, `description`, `columns` (1 to 4, default 1) | none: no shadow root. A native `<fieldset>` child is the section; without one, its own children are | none | none: it draws the classes under [Fields and forms](#fields-and-forms) |
| `af-form` | `errors` (`FormError[]`, `{path, message}`), `busy`, `dirty` | none: no shadow root. Its first `<form>` child is the form it enhances | `af-submit` `{formData, submitter}` in place of the form's own submit, once until the page has had its turn (see [Fields and forms](#fields-and-forms)) | none: it draws the class under [Fields and forms](#fields-and-forms) |
| `af-scroll-area` | `axis` (`vertical`, the default, `horizontal` or `both`), `label` (names the viewport, which is then a region); read-only `viewport`, the element that scrolls | default (the content) | none: listen for `scroll` on `viewport` | `viewport`, `content`, `scrollbar` (one per axis), `thumb`, and with `axis="both"` `corner` |
| `af-tabs` | `items` (`TabItem[]`, a property only), `value` (the shown tab's value), `label` (the tab list's accessible name), `variant` (`pill`, the default, `line` or `segmented`) | one per item, named by its `value` (the panel) | `tab-change` `{value}`: a click, an arrow key, Home or End moving to a tab. The element does not change tab itself; set `value`. A disabled item is never asked for, shows its `reason` in a tooltip and carries it as its `aria-description` | `list`, `tab`, `panel` |
| `af-splitter` | `size` (the start pane's share in percent, default 50, held within `min` and `max`), `min` (default 20), `max` (default 80), `orientation` (`horizontal`, the default, or `vertical`, which stacks the panes), `label` (the handle's accessible name; without it, `Resize panes`, the `KitStrings` key `resizeHandle`) | `start`, `end` (the panes; neither scrolls, so put an `af-scroll-area` in a pane whose content does) | `size-change` `{size}`: when a drag ends, and after each arrow key, Home or End that moved the handle (5 points a press, 10 with Shift). The panes follow a drag at once. Every `size` you set moves them onto it, and a `min` or `max` that leaves them outside the range clamps them; neither emits. While a drag is live, Zag sets the page's cursor through a `<style>` it adds to `<head>` and removes when the drag ends, as `react-resizable-panels` does on AgentFlow's own pages | `start`, `end`, `handle` |
| `af-pager` | `mode` (`pages`, the default, or `more`), `hasPrev` (`has-prev`), `hasNext` (`has-next`), `hasMore` (`has-more`), `busy`, `pageSize` (`page-size`, a number), `pageSizes` (`number[]`, a property only), `rangeStart` (`range-start`), `rangeEnd` (`range-end`), `total`, `shown` (numbers), `focusNew` (`focus-new`), `controls` (the id of the element whose direct children are the rows it pages, in the same root: a list, or a table group's `tbody`) | none | `prev` `{}`, `next` `{}`: Previous and Next; `page-size-change` `{pageSize}`: a size picked in its select, as a number; `more` `{}`: Load more. A locked button emits nothing. The element never pages itself; set the properties from your list's state ([Pagination](#pagination)) | `prev`, `next`, `range`, `page-size`, `more`, `status` (the visually hidden live region) |
| `af-copy-button` | `value` (the text to copy; an empty or missing one is a failed copy, with nothing written), `label` (the button's accessible name; without it, `Copy`, the `KitStrings` key `copy`) | none | `af-copy` `{value, ok}`: once per press, after the outcome is known; `ok` is false when the browser refused or there was nothing to copy. The element changes nothing on the page itself ([Copying a value](#copying-a-value)) | `trigger`, `status` (the visually hidden live region) |
| `af-markdown` | `value` (Markdown), `mentions` (`Record<string, ResolvedMention>`, the response's map the mention chips read; a property only), `schemes` (`string[]`, URL schemes kept as links beside the safe ones, such as `af-mention:`; a property only) | none | `af-link` `{href}`: before a link opens, and when a mention chip is pressed (`href` `mention:<ref>`). Cancelable: `preventDefault()` keeps the link from opening ([Markdown](#markdown)) | `content`; a table or a code block scrolls in the kit's scroller, with its `viewport`, `scrollbar` and `thumb` |
| `af-tree-picker` | `nodes` (`TreeNode[]`, a property only), `source` (a `PickerSource<TreeNode>`, a property only; when set it wins over `nodes`), `value` (an id, an array of ids with `multiple`, or `null`), `multiple`, `max` (a number; with `multiple`, the most that may be picked), `placeholder`, `label` (the input's accessible name), `loading`, `disabled`, and the form properties `name`, `required`, `readonly`, `description`, `error`, `invalid` (see [Form controls in a form](#form-controls-in-a-form)) | none | `change` `{value}` in the shape of `value`; `search` `{query}` as the person types. A disabled node is never chosen, shows its `reason` in a tooltip and carries it as its `aria-description`; at `max` every node not picked is disabled the same way, with the reason "At most {max}" (`KitStrings` key `maxPicked`) | `control`, `chip`, `remove`, `input`, `clear`, `content`, `tree`, `node`, `toggle`, `check`, `code`, `ancestry`, `archived`, `empty`, `loading`, `load-more` |
| `af-bulk-bar` | `count` (a number; the bar shows while it is above zero), `total` (a number; shown as "of N" when set), `label` (the sentence shown and announced in place of `3 selected`, for a selection that is not a count of rows, such as `All 1,240 in Overdue selected`) | `actions`: your own buttons | `clear` `{}`: from the clear button, and from Escape anywhere inside the bar unless an open overlay in it takes the key. The bar never clears anything itself; empty your selection and set `count` to 0 ([Bulk actions](#bulk-actions)). `focus()` moves focus to the first enabled action, else to the clear button | `bar`, `count` (the pill), `text`, `clear`, `more` (the `af-menu` holding the actions that do not fit), `status` (the visually hidden live region) |
| `af-file-upload` | `items` (`FileItem[]`: `{id, name, size?, status: 'uploading' \| 'done' \| 'failed', progress?, error?, href?, preview?}`, a property only; each `id` must be unique, since the rows are keyed by it and a repeated one is an error), `accept` (as the native attribute: types and extensions, comma-separated), `multiple`, `replace` (Boolean: in a one-file element a pick while an item is held fits, and the page swaps the items), `label` (the drop zone's accessible name, and the text it shows becomes its description; without it the shown text names it), `max-files` (a number: the most files the field holds, counting the items that have not failed; without it, one file a pick unless `multiple`, then any number), `disabled`, and the form properties `name`, `required`, `readonly`, `description`, `error`, `invalid` (see [Form controls in a form](#form-controls-in-a-form)) | none | `files-add` `{files}`: once for each drop or pick that fits `accept` and `max-files`, with every `File`; the element keeps none. `remove` `{id}`: from a row's remove button. A drop that does not fit is refused whole, with a notice and no event ([Attaching files](#attaching-files)) | `dropzone`, `trigger` (the browse word), `hint`, `notice` (the polite live region), `list`, `item`, `icon`, `preview`, `name`, `size`, `progress`, `status` (the failed word), `remove` |
| `af-signature-pad` | `value` (a PNG data URL, or `null`; shown as an image until a stroke is drawn), `label` (the pad's accessible name; without it, `Signature`, the `KitStrings` key `signaturePad`), `disabled`, and the form properties `name`, `required`, `readonly` (shows `value` and nothing to draw with), `description`, `error`, `invalid` (see [Form controls in a form](#form-controls-in-a-form)); method `clear()`, present from construction | none | `change` `{value}`: a PNG data URL of the strokes when a stroke ends, and `null` after `clear()` or the clear button ([Signing](#signing)) | `control` (the drawing surface), `segment` (the strokes), `guide` (the baseline), `image` (`value`, until a stroke is drawn), `clear`, `hint` |
| `af-folder-source` | `sources` (a `FolderSources`, what `folderSources(client)` from `@reflexify/agentflow-sdk` returns; a property only, and one object for the page's lifetime), `workflow` (the workflow's id), `field` (the key of its start form's file field), `version` (a version id, when the page launches one it chose; the current published version without it), `folder` (`SlotFolder`, a property only: `{grain: 'folder', depth}` or `{grain: 'file'}`, the field's `folder` in the workflow's input contract), `resume-set` (property `resumeSet`: the id of an upload set an interrupted upload announced), `offer` (an array of `'files'`, `'computer'` and `'watched'`, a property only: the sources to offer, all three without it), `disabled` | none | `af-folder-upload-started` `{setId}`: as soon as an upload set exists, before any file is stored, and again when a resumed upload had to start a new set. `af-folder-progress` `{stored, total}`: as each file is stored. `af-folder-busy` `{busy}`: `true` from a pick or a choice, `false` once its value is known, the upload fails or the person cancels. `af-folder-change` `{value, preview}`: `value` is `{$fileSet, path?}` to launch with and `preview` what the launch would take, `null` when it could not be read; both `null` when the person starts choosing again. `af-folder-error` `{during: 'upload' \| 'preview' \| 'list', status, code, message}`: a call through `sources` failed; `status` and `code` are the server's, `null` when none answered, and `message` is its own sentence ([Choosing a folder](#choosing-a-folder)) | `sources` (the radio group), `source` (each choice), `hint`, `dropzone`, `trigger` (the browse words), `progress`, `cancel`, `notice` (the polite live region), `retry`, `path` (the way back up a watched folder), `crumb`, `list`, `folder` (a row), `choose`, `open`, `more`, `empty`, `chosen` (the name of what was chosen), `preview`, `refusal`, `count`, `sample`, `reason` (each with `data-code`) |

Notes on single elements:

- **`af-dialog` and `af-confirm`** move focus in when they open: to the × in `af-dialog`, to Cancel in `af-confirm`. Escape and closing return it to where it was.
- **`af-date`** shows `dd/mm/yyyy` in Vietnamese and `d MMM yyyy` in English, the short month from the browser's own `Intl` (`15 Sept 2026` in Chromium, `15 Sep 2026` in Safari). It accepts typed `dd/mm/yyyy` or ISO, committed on Enter or blur, and refuses a date outside `min` and `max`. Picking a day puts focus on the input, Today on the calendar button, Clear on the input, and Escape on the calendar button. A stored value outside `min` and `max` is shown but never handed to the calendar.
- **`af-date` with `format`** shows and reads an author's date mask instead of the language's form. A mask holds `DD`, `MM` and `YYYY` once each, with no letters between them: `DD/MM/YYYY`, `DD-MM-YYYY`, `DD.MM.YYYY`, `YYYY-MM-DD` or `MM/DD/YYYY`, or with nothing between some or all of them: `YYYYMMDD`, `DDMMYYYY`. Any other `format`, and range mode, are ignored, and the element behaves as without one. The input shows the value in the mask in every language (`20.02.2026` for `DD.MM.YYYY`, in English as in Vietnamese), and the mask is the placeholder unless you give one. Typed text commits on Enter or blur when it reads in the mask, a day and month of one or two digits and a four-digit year (`20.2.2026`; exactly two digits for a day or month next to a part with nothing between them, so `20260220` reads in `YYYYMMDD` and `2026022` does not), or as an ISO date, and is refused outside `min` and `max` as without a mask. A day that does not exist (`31/02/2026`), a two-digit year or text in another shape does not parse: it stays in the input, the input carries `aria-invalid="true"`, the host carries the attribute `data-unparsed`, its validity is `badInput` (see [Form controls in a form](#form-controls-in-a-form)), no `change` fires, and the element emits `unparsed` with the refused `text`, once for each text it refuses, so a page that validates on its own can hold the text and refuse the form. Text that parses, a new `value` or a pick in the calendar clears all three, and the first commit after a refusal emits `change` even when it keeps the value the element already has (a date outside `min` and `max` commits that value, and emptying an empty field commits `null`), so a page holding the refused text hears it replaced. Emptying the input commits `null`, with or without `clearable`. The calendar opens on the month of a typed date that parses, otherwise on the value's. The SDK's `isDateMask(mask)`, `formatMasked(iso, mask)` and `parseMasked(text, mask)` write and read the same masks.
- **`af-date range`** picks a span. `value` is ignored: the ends are `start` and `end`, and `change` carries `{start, end}`. Either end may be `null`, an open end. It draws two inputs, `part="input start"` and `part="input end"`, with an en dash `part="separator"` between them; each is named `Start date` and `End date` (the `KitStrings` keys `rangeStart` and `rangeEnd`), after `label` when it is set (`Due: Start date`). Each input accepts typed text and commits it as the single input does; emptying one commits that end as `null`, without `clearable`. An end earlier than the start, or a changed end outside `min` and `max`, is refused and the input shows its end again. In the calendar, picking a start and then an end emits `change` once, with both ends. Clear empties both ends, and Today brings today into view and focuses it, to be picked as either end.
- **`af-number-input`** shows its value as the browser's `Intl.NumberFormat` writes it for the language: `1.234,5` in Vietnamese and `1,234.5` in English, `1.500.000 ₫` with `format="currency"`, and `15%` for a `value` of `0.15` with `format="percent"`, as `Intl` reads a percent. Intl may put a no-break space before a currency or percent sign. While the input has focus it keeps what the person types, in the language's separators, and does not follow `value`; a commit parses it, emits `change`, and shows `value` again, formatted, once you set it back. Empty text commits `null`, and text that is no number is dropped. Text whose grouping does not read in the language is refused rather than read some other way: when the whole part (before the language's decimal separator, `,` in Vietnamese and `.` in English) holds the group separator (`.` in Vietnamese, `,` in English), its first group must be one to three digits without a leading zero and every later group exactly three digits, and the fraction may hold neither a group separator nor a second decimal separator, so in Vietnamese `1.234,5`, `1234,5` and `1.234` read as 1234.5, 1234.5 and 1234, while `1234.5`, `12.50` and `0.125`, an English decimal point that would otherwise read as 12345, 1250 and 125, are refused, as are an English-formatted `1,234.5` and `1.234,5.6`, and as `1,5` and `1.234,5` are in English. Refused text stays in the input, the input carries `aria-invalid="true"`, the host carries the attribute `data-unparsed`, its validity is `badInput` (its message the `KitStrings` key `badNumber`, `Enter a number as {example}.`, the example being 1234.5 written in the language) no `change` fires, and the element emits `unparsed` with the refused `text`, once for each text it refuses, so a page that validates on its own can hold the text and refuse the form. Text that reads, a step or a new `value` clears all three, and the first commit after a refusal emits `change` even when its value is the one the element already has (text that is no number commits that value), so a page holding the refused text hears it replaced. A blank `value` attribute (`value=""`) is no value, shown empty and read as `null` on a form's reset. The arrow keys step by `step`, PageUp and PageDown by ten steps, and neither steps past `min` or `max`; a typed number outside them is emitted, and the form calls it `rangeUnderflow` or `rangeOverflow`. `steppers` adds a decrease and an increase button inside the field's end. The mouse wheel never changes the value.
  - **Digits.** With no `precision`, a number shows no fraction digits when `step` is whole and two otherwise, and commit rounds to them, so `3.7` typed with the default step commits `4`. `fractional` keeps what is typed instead, up to 20 fraction digits (18 for a percent, the most the parser reads), and shows as many as the value has: `3,14159` commits `3.14159` and `1234.567` shows `1.234,567` in Vietnamese. The arrow keys still step by `step`, and the result keeps only the digits the value and the step have, so `0.2` stepped by `0.1` is `0.3`. A `precision` wins over `fractional`.
  - **Separators.** `separators` shows and reads the number in a field's own separators rather than the language's: `comma_dot` writes `1,234.5`, `dot_comma` `1.234,5`, `space_comma` `1 234,5` (a narrow no-break space, and a typed space or no-break space between digits reads as one), and `none` the language's decimal with no groups, `1234,5` in Vietnamese. The refusal above and the `badNumber` example follow the preset, so in `dot_comma` under English `1.234,5` reads as 1234.5 and `1,234.5` is refused, with `none` any group separator is refused, and in `space_comma` any `.` is refused (French's parser would read a lone point as the decimal). Unset, or `locale`, the language's separators are used.
  - **An unscaled percent.** A percent's `value` is a fraction by default, as `Intl` reads it, so `0.125` shows `12.5%`. AgentFlow stores a percentage as itself, so `unscaled` with `format="percent"` shows `12.5` as `12.5%` (`12,5%` in Vietnamese), commits `12.5` for typed `12,5` or `12,5%`, and steps by one point; `min`, `max` and `step` are in points as well, and the range messages say `40%` for a `min` of `40`. With no `precision` an unscaled percent keeps the digits it has, as `fractional` does, since the point it stores is not a fraction to round; `precision="0"` rounds it to whole points. `unscaled` does nothing with any other `format`.
- **`af-select`** shows the chosen option's label in its trigger, and with `multiple` every chosen label in the order of `value`, joined with `, ` and cut off with an ellipsis when the trigger is too narrow. A value `options` does not hold shows the `placeholder`, never the raw value, and is still submitted. The list is at least as wide as the trigger. Typing a letter on the closed trigger opens the list and highlights the first option it starts; typing on in the open list moves the highlight, and Enter or a click picks. An empty `options` shows "No options" in the open list. A `value` of `''` is no value, as `null` is, so an option whose value is `''` reads as no choice once the page sets it back: give every option a non-empty value.
- **`af-combobox`** is typed into to find a value. Without a `source` it filters `options` itself by label and description, ignoring case and Vietnamese accents (`đ` matches `d`), as `af-person-picker` does. With `multiple`, the chosen values are removable chips beside the input; in single mode `clear` emits `{value: null}`. An option's `description` shows muted beneath its label. As in `af-select`, a `value` of `''` is no value, as `null` is, so give every option a non-empty value. `focus()`, a click on its `af-field`'s label and a press on a chip's text put focus in the input, never on a chip's remove button.
- **`af-combobox` with a `source`** asks the source for its options instead of filtering `options`. It calls `source({q, cursor: null, signal})` when the list opens from the keyboard, and 250 ms after typing stops, with what was typed as `q`. Each call aborts the previous one's `signal`, and an answer to an aborted call is dropped, so answers that arrive out of order never show a stale list. A `loading` row shows while a call runs, and a `load-more` row while the last page's `next` is set: pressing it calls with that cursor and appends the page. For a value no loaded page has named, it calls `source.resolve(ids, signal)` once. Every item a page or `resolve` names is kept, so a chosen value keeps its name after the list changes. While a call or `resolve` that could name a value runs, the value shows as an ellipsis; once they have answered without it, as "Unknown value", numbered when there are several, never as its id. With a source, typing does not highlight the first option, because the list may still answer earlier text: the arrow keys highlight, then Enter picks. **Pass one stable function** (a module constant, or one memoised for the page's lifetime): a new function restarts the list and asks afresh, so a source built inline in a render asks on every render.
- **Which to use: `af-select` or `af-combobox`.** A list short enough to scan, at most about 15 options, takes `af-select`. A longer list, a list loaded from the server or one people search by name takes `af-combobox`.
- **`af-person-picker`** filters `people` itself, ignoring case and Vietnamese accents (`đ` matches `d`). In single mode, `clear` is how a person unassigns: it emits `{value: null}`.
- **`af-person-picker` with a `source`** asks the source for its people instead of filtering `people`, exactly as `af-combobox` with a `source` does: on open and 250 ms after typing stops, one call at a time, a `loading` row while a call runs and a `load-more` row while `next` is set, `source.resolve(ids, signal)` asked once for a chosen id no page has named, and the first person not highlighted as the person types. It still emits `search` `{query}` as the person types. A chosen id shows as an ellipsis while a call or `resolve` that could name it runs, and as "Unknown person" once they have answered without it. The SDK's `directory.people(client)` is such a source. Pass one stable function, as for `af-combobox`: a new function restarts the list.
- **`af-tree-picker`** picks from a hierarchy: AgentFlow's units, or anything else whose nodes name a `parentId`. A node whose parent is not among the nodes is a root, and a cycle is cut at the node that comes first. The roots start open and the branches below them closed; the chevron (`toggle`) opens and closes one. Typing filters the tree itself, by label and `code` and ignoring case and Vietnamese accents: it shows each match with its ancestors, opens those ancestors, and clearing the text gives back the branches as they were. Picking a branch picks that node alone, never the nodes beneath it. A deeper node shows its ancestry after its label (`HQ › North`), its `code` in the mono face, and an archived node is italic with an "Archived" chip, as AgentFlow's `TreeSelect` draws it. In single mode a pick closes the popup and the input shows the node's label; with `multiple` the popup stays open, each node has a `check`, and the picks are chips beside the input. The keyboard is the tree's: ArrowDown from the input moves into the tree, Up and Down move, Right and Left open and close a branch, Enter or Space picks, and Escape closes and returns to the input. A chosen id nothing names shows as "Unknown value", as in `af-combobox`.
- **`af-tree-picker` with a `source`** asks for the whole forest each time it opens: `source({q: '', cursor, signal})` for the first page and then for every `next` until it is null, with a `loading` row meanwhile, and builds the tree from `parentId`. Typing never calls the source, because a server's search would drop the ancestors a match needs to have a place in the tree. If a page fails, a `load-more` row asks for it again. `source.resolve(ids, signal)` names a chosen id the pages do not hold, such as an archived unit left out of the list. The SDK's `directory.units(client)` is such a source. Pass one stable function, as for `af-combobox`.
- **`af-rich-editor`** loads Tiptap with a dynamic `import()`, so its code (about 170 KB gzip) is a chunk of its own that a page without an editor never fetches. The element also has an `editor` property, `null` until that chunk has loaded and the Tiptap `Editor` after. It exists for tests only and is outside the contract: it has no JSX type, may change or go in any release, and an app must not call it.
- **`af-tile`** draws one tile of a dashboard, a number, a bar, column, line, pie or donut chart, a text or a list, from the `spec`, `result`, `rows` and `columns` a module already has, and never fetches. Its properties, the `af-drill`, `af-open-record` and `af-page` events, what each part holds, what it does not draw and what it weighs are under [Drawing a tile](#drawing-a-tile).
- **Accessible names.** `af-date`, `af-person-picker`, `af-number-input`, `af-select`, `af-combobox`, `af-tree-picker`, `af-file-upload` and `af-rich-editor` sit in your form without a `<label for>`, which cannot point into a shadow root. Give each a `label`: it becomes the `aria-label` of the input, the trigger, the drop zone or the editable area inside. Without one, `af-date` and `af-number-input` fall back to their `placeholder`, `af-file-upload` to the text its drop zone shows, and the other five have no name.
- **`af-toast`**'s region sits at the bottom end of the viewport, raised into the top layer only while it holds a toast. Each toast shows its kind in its colours and an icon, as AgentFlow's toasts do, with its close button over the leading top corner. A hidden popover is outside the accessibility tree, so the text of each toast is also put in two visually hidden live regions that are always present: `role="status"` for success and info, `role="alert"` for an error. A screen reader therefore reads the first toast after a quiet spell, which a region shown in the same moment would miss. `show` and `dismiss` work before the element connects: a toast shown that early appears when it does. **A toast shown while a modal `af-dialog` stays open is drawn above the dialog but cannot be pressed**, its action and close button included: the dialog makes everything outside it inert, and the toast region is outside. Show a refusal that keeps a dialog open inside the dialog; a toast shown after it closes works. The gallery's "Invite people" case and `e2e/gallery.spec.ts` check this in Chromium and WebKit, when someone runs them (no CI job does).
- **`af-tooltip` cannot describe what you slot into it.** Its `aria-describedby` would have to point from your control, in your tree, to the bubble in the tooltip's shadow root, and an id reference does not cross a shadow boundary. A locked control that explains itself in a tooltip needs the reason in your own tree as well: put a visually hidden `<span id="…">` with the reason beside the control and point the control's `aria-describedby` at it. What you slot in inherits its colour and font from your page, not from the kit.
- **`af-dialog`** is at most the viewport's height less 64 px: its body scrolls and the heading and footer stay in view.
- **`af-dialog placement="end"`** is a side panel, as AgentFlow's right Sheet: docked at the right edge in every language, as tall as the viewport and `min(75vw, 384px)` wide, with the same parts, slots and `close` reasons. Its content carries `data-placement="end"` (`center` otherwise). It slides in from the right over 500 ms, not under `prefers-reduced-motion: reduce`, and its actions stack at its foot. A kit popup slotted into it, an `af-select` say, rises above it, and Escape closes that popup first.
- **`af-popover` returns focus to its anchor** when it closes by Escape, or when you set `open` to `false` while focus is inside it (a Done button in its content, say): to the first control in what the `anchor` slot holds, the slotted element itself or a control inside it, so a button wrapped in an `af-tooltip` gets it. A close by a press outside leaves focus where the press put it.
- **An `af-tooltip` inside an `af-popover` takes the first Escape.** An Escape pressed on the anchor of a tooltip that is showing inside the popover closes the tooltip alone, emits no `close`, and leaves the popover open; the next Escape closes the popover. An Escape pressed anywhere else in the popover closes it, even while a tooltip shows under the pointer.
- **`af-popover`**'s content is at least 288 px wide, as AgentFlow's popover is, and grows with wider content up to 28rem (or the viewport less 16 px each side), so it does not spill past its border. Give it another width on `::part(content)`.
- **Focus** is AgentFlow's own: a border in `--af-ring` and a 3 px ring of it at half strength, on every focusable class and every focusable part of an element. `--af-ring` is the primary at 40% alpha, about 1.6:1 on white, so the ring is soft, as it is on AgentFlow's controls. Under forced colours, where a shadow is not drawn, each draws a 2 px outline instead. The marks of `af-tile` are SVG and keep a solid 2 px `--af-primary` outline. That is a known gap carried from AgentFlow, which draws the same ring, and not a rule for your own controls: a ring built from `--af-ring` alone fails the 3:1 a focus indicator needs, so give them a solid outline in `--af-primary`, as [DESIGN.md](DESIGN.md) says. Every kit focus ring is drawn from two private variables on `.af-kit`, `--k-focus-border` and `--k-focus-ring`, so the kit can change it in one place.
- **`af-person-picker`** shows someone `people` does not hold as "Unknown person" (numbered when there are several), never by id. While `loading` is set, such an id shows as an ellipsis instead; while `people` is empty and `loading` is not set, it shows no name at all. A repeated id in `value` counts once, and of two people with one id the first wins.
- **`af-tabs`** draws its list with the `af-tabs` classes, in the look `variant` names, and wraps each slotted panel in a `tabpanel` that only the shown tab's is not `hidden`, so the panels stay in your tree and keep their state. The arrow keys move between tabs, wrapping at the ends, and skip a disabled one; Home and End go to the first and the last. A panel's content keeps your page's font and colour. A `value` no item holds shows no panel; while `value` names no enabled item, the first enabled tab is still the list's tab stop, so a keyboard can reach it.

  ```html
  <af-tabs id="sections" label="Record sections" value="overview">
    <div slot="overview">…</div>
    <div slot="activity">…</div>
  </af-tabs>
  <script type="module">
    const tabs = document.getElementById('sections');
    tabs.items = [{ value: 'overview', label: 'Overview' }, { value: 'activity', label: 'Activity' }];
    tabs.addEventListener('tab-change', (e) => (tabs.value = e.detail.value));
  </script>
  ```

- **CSS classes.** The buttons are under [Buttons](#buttons), the chips, banners (`info`, `success`, `warning`, `danger`), avatars, progress bars, tabs, skeletons and spinner under [Display classes](#display-classes), the empty state, the error, the repeating group, the drag handle and the file chip under [State and piece classes](#state-and-piece-classes), the table, its sort headers, groups and sticky rows under [Tables](#tables), the breadcrumb, the disclosure, the field list, the stat, the timeline and the steps under [Page structure classes](#page-structure-classes), the toolbar, the card, the board, the list row, the calendar and the event under [View classes](#view-classes), the filter chip, the search box, the facet and the chip as a toggle or a locked control under [Filter classes](#filter-classes), and the form controls under [Form controls](#form-controls).

### Scrolling

Every kit element that scrolls a part of itself, a menu's or a select's list, a combobox's, the person picker's, the dialog's body, the editor's mention menu and the tile's tables, prose tables, code blocks and text body, scrolls it in the kit's one scroller, the one `af-scroll-area` puts around your content. In each of those elements the scroller's boxes are parts too: `viewport` (the box that scrolls), `scrollbar` and `thumb`, and in `af-tile`, whose tables scroll both ways, `corner`, so `::part(viewport)` styles the scrolling box. It keeps the browser's own scrolling: the wheel, touch, the keys, find in page, scroll anchoring, `scrollIntoView` and `position: sticky` (a sticky row sticks to the viewport's top, not the page's) are the browser's. It hides the native scrollbars and draws AgentFlow's over them, as its `ScrollArea` does: a 10 px gutter holding a fully rounded thumb in the border colour, shown while the pointer is over the area or it scrolls and faded 150 ms after both end, and always shown under reduced motion or forced colours. A scrollbar whose axis does not overflow is not drawn.

- **The tab stop.** The viewport is a tab stop while its content overflows either way and holds nothing Tab reaches, and not otherwise, which is the browsers' own rule for a scroller: a long list of text or a wide table of figures needs the stop, or a keyboard could not scroll it, while one that holds a field, a button or a link is scrolled by tabbing through what it holds, and a box that fits is not one more stop. What it holds is read through slots and open shadow roots, so your slotted form and a kit element inside count, and read again when the area resizes or what it holds changes. So an overflowing `af-dialog` body holding a form is no stop, and one holding long plain text is a stop named by the dialog's heading; each column of a board of card links is no stop. A menu's, select's, combobox's, person picker's and mention menu's list is never a tab stop: the arrow keys scroll the highlight, and Tab closes it. Focused, the viewport shows the 3 px ring of AgentFlow's ScrollArea and a 1 px outline in the text colour, which is the kit's own: the ring alone is too faint over a borderless box to show where focus is. The tile's regions keep the solid 2 px outline in `--af-primary` they always had. With `label` it is a region of that name; give one to every area that may be a stop.
- **`viewport`.** `af-scroll-area`'s `viewport` property returns the element inside its shadow root that scrolls, crossing the shadow boundary on purpose: a virtualised list reads its `scrollTop`, auto-scroll and a restored position set it, and the page listens for `scroll` on it, since the element itself emits no events. It is `null` until the element has rendered.
- **Its size.** The host is a block, and the viewport fills it: give the host a `height` or a `max-height`, let a flex column size it (it carries `min-height: 0`), or put it in a grid track written `minmax(0, 1fr)`: an `auto` row grows to the tallest content in it (a side panel's, say), and nothing scrolls. Before the tag is defined, `kit.css` lays it out as a block, so the page's layout holds while the kit loads. Slotted content keeps the page's font and colour.
- **Its layers.** The viewport is a stacking context of its own, so a `z-index` in the content, a sticky header's say, stays inside it and the drawn scrollbars, which come after it, always paint above.

```html
<af-scroll-area label="Facets" style="max-height: 14rem">
  <ul>…</ul>
</af-scroll-area>
```

### Pagination

`af-pager` draws AgentFlow's pager for a list you page yourself. In `pages` mode it shows, left to right, the rows-per-page select (only with both `pageSize` and `pageSizes`), the range (`26–50 of 1,240` with `total`, `26–50` without it, nothing without `rangeStart` and `rangeEnd`), and Previous and Next. It renders nothing while there is neither a previous nor a next page and no range, as AgentFlow's `Pager` hides itself on a list that fits one page. A button with no page its way, and both while `busy`, are locked with `aria-disabled="true"`, so they keep focus and a press emits nothing. Numbers are written by `Intl.NumberFormat` for `locale` (`1.240` in Vietnamese). With `controls` set, each button references the list through ARIA element reflection (`ariaControlsElements`), which reaches across the pager's shadow root to the list in your page, and carries the `aria-controls` attribute as well for the page's own tooling: an id in the attribute alone names nothing from inside a shadow root.

In `more` mode it shows `Showing 50 of 1,240` (or `Showing 50` without `total`) when `shown` is set, and a Load more button while `hasMore` is set, locked with a spinner while `busy`. After a press, when you set `shown` higher, the `status` part, a `role="status"` region, says how many rows arrived, counted from `shown` at the press (`25 more loaded`); a `shown` that changes without a press says nothing. A load that ends without rows, because `busy` falls after rising or `hasMore` turns false, is forgotten, so a later change of `shown` says nothing either. Set `shown` no later than `busy` goes `false`: the element reads the three as they stand at the first microtask after you set one, so setting them one after another synchronously, in the same run of your code (one handler, one render), is fine, but a `shown` set after an `await` or in a later task than `busy=false` is not announced. A page bound to `cursorList` gets both in one state.

Focus moves only while it is still the pager's. `controls` must name the element whose direct children are the rows: a `ul` or `ol`, or for a table the group's `tbody`, never the `table` itself (a pager that names the table never finds a row and always falls back to its `status` part). At a Load more press the pager remembers the children that element holds. With `focus-new` and `controls`, when you then set `shown` higher, focus moves from the Load more button or from the page (`body`) to the first child, in document order, that the element did not hold at the press, wherever you put it (before a Load more or loading row that stays last, say), given `tabindex="-1"` when it is not focusable; when `shown` grows but no new child arrived, it moves to the `status` part (given `tabindex="-1"`) instead. In every other case, a load without rows included, focus moves only when the Load more button is gone and focus has fallen to the page, as when the last page removes the button: to the first new row if `controls` names the list and a row arrived, and to the `status` part otherwise. While the button is drawn, a load without rows leaves focus where it is, and a person who moved focus elsewhere during the load keeps it there.

The SDK's `cursorList` holds a cursor-paged list's state for it: the stack of cursors behind Previous, the next cursor, `busy` and `error`. Each call aborts the one before it and drops a late answer, and a server that hands back a cursor already in the stack has no next page.

```js
import { cursorList, ok } from '@reflexify/agentflow-sdk';

const pager = document.querySelector('af-pager');
const list = cursorList((cursor, signal) => ok(api.GET('/work', { params: { query: { cursor: cursor ?? undefined, limit: 25 } }, signal })));
list.subscribe(({ items, hasPrev, hasNext, busy }) => {
  renderRows(items);
  Object.assign(pager, { hasPrev, hasNext, busy });
});
pager.addEventListener('prev', () => list.prev());
pager.addEventListener('next', () => list.next());
list.next();
```

`list.state` is a new object on every change, so a React page can keep it in state from `subscribe`. `reload()` fetches the current page again and `reset()` the first, as after a new filter or page size. `reset()` forgets the stack as it starts, so if it fails, nothing of the old query is left: a `reload()` then asks for the first page.

### Bulk actions

`af-bulk-bar` is the bar a list shows while rows are selected: AgentFlow's dark bar, 24 px above the bottom of the window and centred, with the count in a pill (none when you set `label`), your actions and a clear button. It is raised into the top layer (`popover="manual"`), so no scroll container or a module's box clips it, and the host carries `data-raised` while it shows. It shows while `count` is above zero and hides at zero; it never takes focus when it appears. The selection is yours: the bar keeps none, and shows whatever `count` you set.

- **The sentence.** `3 selected`, or `3 of 40 selected` with `total` (`Đã chọn 3`, `Đã chọn 3 trên 40` in Vietnamese; the `KitStrings` keys `selectedCount` and `selectedOfTotal`, numbers written in the language's separators), or your `label` in its place, and with `label` set no count pill is drawn. The `status` part, a polite live region outside the bar and in the tree from the first render, holds it, so a screen reader hears each change of the count.
- **Your actions.** Slot buttons into `actions`, rich ones included (a run action in an `af-popover`, a download link). A ghost button (`af-button ghost sm`) takes the bar's colours: the text at three quarters of the bar's text colour, lighter on hover. When the actions are wider than the room the bar has, the last ones that do not fit get `data-overflow` and are hidden, and the `more` part appears: an `af-menu` (`More actions`, the key `moreActions`) listing each hidden action's text and whether it is disabled, which clicks the action you choose. A wrapper's action is the first control inside it. The bar measures again whenever it or an action is resized, and when the actions change.
- **Clearing.** The clear button (`Clear selection`, the key `clearSelection`) and Escape inside the bar emit `clear`. Escape in the open overflow menu, or in an open kit overlay you slotted, closes that overlay instead.
- **Emptied while in use.** When `count` returns to 0 the bar hides, its menu closes, and focus that was inside the bar goes to `document.body` rather than staying on a hidden button.
- **A shortcut is yours to bind.** The kit adds no key listener on `document` ([The rules every kit element follows](#the-rules-every-kit-element-follows)), so the bar binds none: pick a key that collides with nothing on your page and call `bar.focus()` from it. The example below binds `Alt+Shift+A` on the bar's root node, which is your module's shadow root inside a module, where a listener on AgentFlow's `document` is not yours to add, and the document on a page of your own.

```js
const bar = document.querySelector('af-bulk-bar');
bar.count = selection.size;
bar.addEventListener('clear', () => {
  selection.clear();
  bar.count = 0;
});
bar.getRootNode().addEventListener('keydown', (e) => {
  if (e.altKey && e.shiftKey && e.code === 'KeyA') bar.focus();
});
```

### Attaching files

`af-file-upload` is AgentFlow's attachment field: a dashed drop zone and, below it, a row for each file. It never uploads. It hands your page the files a person drops or picks, your page uploads them, and the rows draw the `items` you set, so a file shows only once you add it to `items`.

- **The drop zone** is one keyboard-reachable button: Enter or Space opens the browser's file picker, as a press anywhere on it does. It reads `Drop files here, or browse` (`Drop a file here, or browse` when it takes one file; `Thả tệp vào đây, hoặc chọn tệp` in Vietnamese), with the browse word (`trigger`) in the primary colour and the native file input hidden behind it, and a `hint` below: `Multiple files allowed.` or `One file only.` While files are dragged over it, it turns to the primary colour.
- **A label** names the drop zone: with `label` set (an `af-field` sets it for the control it holds), the zone's accessible name is the label and the text it shows (`Drop a file here, or browse`) is read as its description, before the hint and any `description` or `error`. Without one, the shown text is the name, as before.
- **Replacing a file.** A field that holds one file takes `replace`: a pick or a drop while an item is held fits when its one file matches `accept`, and raises `files-add` with it, so the page puts the new item in place of the one it holds. Without `replace`, a one-file element with `max-files="1"` refuses a pick while an item that has not failed is held (`One file only.`); one with no `max-files` already hands the pick on, and `replace` changes nothing there. `replace` has no effect on an element that takes more than one file, and a drop of two files on a one-file element is still refused.
- **What fits.** A drop or a pick fits when every file matches `accept` (a MIME type, a family such as `image/*`, or an extension such as `.pdf`, matched against the file's name) and, with `max-files`, the items that have not failed and the new files together are no more than `max-files`. One that fits raises `files-add` once with every file; an empty file fits. One that does not is refused whole, and `notice`, a polite live region, says why for five seconds: `{name} is not an allowed type.` (`fileTypeRefused`) or `At most {max} files.` (`fileCountRefused`), `One file only.` when the field takes one. A refusal is not an event.
- **The rows.** Each item shows its type's icon (an image's thumbnail when `preview` is set), its `name` (a link that opens `href` in a new tab when set), its `size` in the language's units (`1.5 kB`, `1,5 kB` in Vietnamese, counted in 1,024s as AgentFlow does), a progress bar while `uploading` (`progress`, 0 to 100, named `Uploading…`), `Failed` in the danger tone while `failed`, with `error` as its tooltip, and a remove button (`Remove file: <name>`), disabled while the file uploads. A remove raises `remove` with the id; take the item out of `items`.
- **In a form,** its value is one entry under `name` for each item whose status is `done`, its id, and `required` is unmet until one is done. `readonly` hides the drop zone and the remove buttons and keeps the rows, with `No files attached.` when there are none; `disabled` greys the drop zone, which then takes no file, and disables the remove buttons. `focus()` lands on the drop zone.
- **Guarding the document.** A file dropped beside the zone rather than on it is the browser's to handle, which opens it in place of your page. Ark's file upload stops that with listeners on the whole document, which the kit does not add. Guard your own page if it needs it, on the upload's root node: your module's shadow root inside a module, since the document there is AgentFlow's and not yours to add listeners to, and the document on a page of your own.

```js
const upload = document.querySelector('af-file-upload');
upload.items = [];
upload.addEventListener('files-add', (e) => {
  for (const file of e.detail.files) {
    const id = crypto.randomUUID();
    upload.items = [...upload.items, { id, name: file.name, size: file.size, status: 'uploading', progress: 0 }];
    store(file).then(
      (stored) => (upload.items = upload.items.map((it) => (it.id === id ? { ...it, id: stored.id, status: 'done', href: stored.url } : it))),
      (err) => (upload.items = upload.items.map((it) => (it.id === id ? { ...it, status: 'failed', error: String(err) } : it))),
    );
  }
});
upload.addEventListener('remove', (e) => (upload.items = upload.items.filter((it) => it.id !== e.detail.id)));
// A stray drop elsewhere on the page, or the module, opens nothing.
for (const type of ['dragover', 'drop']) upload.getRootNode().addEventListener(type, (e) => e.preventDefault());
```

### Signing

`af-signature-pad` is AgentFlow's drawing pane for a signature: a 288 px white pad with a 1 px edge, a dashed baseline, the hint `Use your mouse or finger to sign. Click Clear to start over.` (`Dùng chuột hoặc ngón tay để ký. Bấm Xoá để ký lại.` in Vietnamese, the `KitStrings` key `signHint`) and a Clear button.

- **Strokes draw at once.** The pad keeps its strokes, so they show as they are drawn, not once your page sets them back. When a stroke ends, `change` carries a PNG data URL of every stroke on the pad: transparent behind the ink, at the device's pixel ratio, so a stroke drawn on a 2× screen is exported at 2×. The ink is AgentFlow's dark slate (`#0f172a`), 1.65 px wide, within the 0.7 px to 2.6 px of AgentFlow's pen.
- **White with dark ink in every theme.** The pad's ground and ink are fixed, not tokens, in the dark theme too: the export is stored data that other people see in their own themes, so a signature drawn in the dark must not come out as pale ink that vanishes on a light page or on paper. A `value` image sits on the same white, and the dashed baseline on it is a fixed light grey. The edge, the hint and the Clear button follow the theme.
- **`value`** is shown as an image until a stroke is drawn, when the image goes and the strokes stay; set `value` from `change` as for any control, and the pad keeps showing the strokes. `clear()` and the Clear button empty the pad and the image and raise `change` with `null`.
- **Its size.** The host is a block, and the pad is 288 px tall unless you give the host a height, which the pad then fills above the hint. The strokes keep their place when the pad grows or shrinks.
- **In a form,** its value is the last data URL it reported, or `value` while nothing has been drawn, and `required` is unmet while both are empty. `readonly` shows `value` and nothing to draw with. `focus()` lands on the pad.

### Choosing a folder

`af-folder-source` is how a person says what a workflow's folder field reads. It offers three sources in a radio group: **Files** (plain files, which the SDK stores as one folder), **Folder from this computer** (a directory picked or dropped, uploaded with its paths kept) and **Watched folder** (one of the watched folders the person may use, or a folder inside it). AgentFlow's own start dialog draws its folder fields with it, and `<agentflow-start-form>` does the same. A page that takes one of the sources its own way sets `offer`, a property, to the ones it wants drawn, such as `['computer', 'watched']`: they keep the element's order, the element starts on the one the field's `folder` calls for (a folder from this computer for folders, files for files) or, when that one is left out, on the first offered, and a list that names none of the three offers all of them. AgentFlow's dialog leaves `files` out, because it attaches plain files as it always has.

The element draws and never fetches. Your page gives it `sources`, made once with `folderSources(client)` from `@reflexify/agentflow-sdk`, and everything it needs from the server goes through that object: the watched folders and their subfolders, the upload, and the preview of the launch. Give it the `workflow` and `field` the value is for, and the field's `folder` from the workflow's input contract, which says whether one unit of the run is a folder at some depth or a file; with `version`, the preview is for that version.

```js
import { folderSources } from '@reflexify/agentflow-sdk';

const source = document.querySelector('af-folder-source');
source.sources = folderSources(client);            // once: not a new object on each render
source.workflow = workflowId;
source.field = 'files';
source.folder = contract.params_slots.find((slot) => slot.key === 'files').folder;  // from the workflow's input contract
source.resumeSet = sessionStorage.getItem('upload-set');

source.addEventListener('af-folder-upload-started', (e) => sessionStorage.setItem('upload-set', e.detail.setId));
source.addEventListener('af-folder-change', (e) => {
  launch.disabled = !e.detail.value || !!e.detail.preview?.refusal;
  input.files = e.detail.value;                    // { $fileSet, path? }: the value the launch takes for the field
  if (e.detail.value) sessionStorage.removeItem('upload-set');
});
```

- **Which source it starts on.** A field whose unit is a folder starts on Folder from this computer, and one whose unit is a file on Files. The `hint` says what one unit is: `Each folder directly inside it is one item.`, `Each folder {depth} levels inside it is one item.` or `Each file is one item.`
- **Files and a folder from this computer** share one drop zone, a keyboard-reachable button: Enter, Space or a press opens the browser's picker, which picks a directory in the folder source (the element's own hidden `<input type="file" webkitdirectory>`). A drop is judged by what it holds: the folder source takes a drop with at least one folder in it and refuses single files (`Drop a folder here, not single files.`), and the files source refuses a drop with a folder in it (`Drop files here, not a folder.`); a refusal is spoken by `notice` and is not an event. A folder that holds no file to upload, picked or dropped, is refused the same way (`That folder holds no files, so there is nothing to upload.`) and no request is made; `.DS_Store`, `Thumbs.db` and `desktop.ini` do not count as files, since an upload leaves them out. Without `sources` the element has nothing to read through: a press or a drop says so (`Files cannot be chosen here: nothing is connected to read them from.`), and so does the list of watched folders. The picked folder's own name is not part of a path, so the folders directly inside it are the first level a launch groups by. The upload set is named for the folder, or for the first file.
- **The upload.** `af-folder-upload-started` carries the upload set's id as soon as the set exists; keep it where the page will find it again (`sessionStorage` for a reload, as below; `localStorage`, keyed by person, for a closed tab). An id whose set is gone makes the next pick start a new set; one whose set a run already took is refused `UPLOAD_SET_ALREADY_LAUNCHED` in the preview (`preview.refusal.code`), so drop it then. `af-folder-progress` follows each stored file, and the element shows the same in a progress bar with a Cancel button, which stops the upload and deletes a set this upload made. Taking the element off the page mid-upload stops it the same way; a reload does not, and leaves the set to be resumed. While it runs the drop zone is locked (`aria-disabled`) and keeps the focus, and the sources, the watched rows, the path, Load more and the list's Try again are disabled, so a stray choice cannot stop the upload: Cancel does.
- **What is spoken.** `notice` is a `role="status"` region. Beside the refusals and failures it shows, it says what the eye already has, clipped to a pixel (`data-spoken`): `Preparing the upload…`, the progress each time a quarter of the files is stored (`2 of 8 files uploaded`, not one line a file), and the outcome once the launch is checked (`The upload is complete. What a launch would take: Folders 12, Files 1,340.`, with the files left out for size after it). A watched folder's check ends the same way. A launch that would be refused is the `refusal` alert, which speaks for itself.
- **Resuming.** With `resume-set` set, the hint asks for the same folder (`Choose the same folder to continue the upload that was interrupted.`), and the next pick continues that set: the SDK uploads only what the set lacks when the files are the ones it declared, and otherwise deletes it and starts a new set, which is announced by `af-folder-upload-started` like the first. An upload that stops (`The upload stopped. Try again to continue where it left off.`) leaves its set, and Try again continues it with the same files without `resume-set` being set. That is for an upload that was interrupted; one the server refused is told apart ([below](#choosing-a-folder), "A refusal"). A set whose upload completed is not resumed again on the same page. After a reload a kept id of one is harmless when no run took the set, and refused `UPLOAD_SET_ALREADY_LAUNCHED` in the preview when one did (drop it then, above).
- **A watched folder** is browsed, not searched. The list shows the watched folders with their file counts; each row has two buttons. The row itself chooses the folder (`aria-pressed` marks the chosen one), and the chevron after it (`Open {name}`) lists the folders inside, a page at a time with Load more. The path above the list leads back up. The list is at most 224 px tall and scrolls inside itself. Choosing the watched folder gives `{$fileSet}`, and a folder inside it `{$fileSet, path}`. Focus follows the list when it changes: to its first row, or to the first row a Load more added.
- **Busy.** `af-folder-busy` `{busy: true}` is raised as soon as the person picks files or a folder, or chooses a watched folder: before the upload set exists, which for a large folder takes a while to declare. `{busy: false}` follows when that ends, however it ends: after the `af-folder-change` that carries the value, after the `af-folder-error` of an upload that failed, or on Cancel, which raises nothing else. Between the two the element holds no value, so a page that launches then launches without the files; disable its Start for as long. `<agentflow-start-form>` does.
- **The preview.** Once a source yields a value the element asks `sources.preview` what a launch would take, and only then raises `af-folder-change`. The `preview` part shows the folders and files a launch would take (the files alone for a field whose unit is a file), the first few of them, how many are left out, and each reason with its count: files in no folder (counted as files, since they are one left-out unit however many they are), a folder still being copied in, one not marked complete, one with too many files, with fewer or more files than the field takes, or holding a file too large to store. A code the kit has no words for shows as `Another reason (CODE)`. Files the server would not store are counted below the reasons. A `refusal` is shown as an alert in the kit's words and the page's language, never the server's English: its own for the codes it knows ([below](#choosing-a-folder), "A refusal") and one sentence for any other. `preview.refusal.message` still holds the server's. The launch would not start, so lock your launch button on `preview.refusal`.
- **When the preview cannot be read,** `af-folder-change` still carries the value, with `preview: null`, and Try again asks once more. Without `workflow` and `field` no preview is asked for. Changing `workflow`, `field` or `version` under a chosen value checks it again, also while a check is still out, whose answer is then dropped: a `preview` you receive is always for the workflow, field and version the element holds.
- **A refusal** is not an interruption. When a call through `sources` fails with an error whose `status` is a 4xx other than 408 or 429, as an `AgentFlowError` from the SDK is, asking again would get the same answer: the person already has five unfinished upload sets, the files are over the size a set may hold, the workflow has no such field. `notice` then shows the kit's words for it, in the page's language, and nothing offers to try again. The kit reads the error's `code` and has its own words for six: `FILE_SET_NO_READY_GROUPS` (`Nothing in it is ready to run yet`), `UPLOAD_SET_ALREADY_LAUNCHED`, `UPLOAD_SET_INCOMPLETE`, `FILE_SET_SLOT_HAS_OTHER_CONSUMERS`, `FILE_SET_MARKER_NEEDS_FOLDER_GRAIN` and `FILE_SET_IN_USE` (the `folderReason…` strings). Every other refusal reads `This was refused, and trying again will not change that.` (`folderRefused`). An upload set this element announced cannot complete after that, so the element deletes it through `sources.deleteSet` and no longer resumes it, even while `resume-set` still names it. A set named only by `resume-set` is not the element's to delete: it is left, and not resumed again. Any other failure keeps Try again. Either way `af-folder-error` tells the page, with the `status`, the `code` and the server's own sentence as `message` (the error's `detail`, else its `message`), so it can say what the element does not. The server's sentence is English and is shown nowhere else.
- **Focus** stays in the element: when an upload ends while Cancel holds it, it moves to Try again after a failure and to the drop zone otherwise, or to the chosen source when the drop zone is not shown.
- **Choosing again** withdraws the value: `af-folder-change` with `{value: null, preview: null}` is raised when a new pick, drop or choice begins, and an upload still running is stopped.
- **Every string** is a `KitStrings` key starting with `folder` (`folderFromFiles`, `folderReasonNotSettled`, …), in English and Vietnamese.

### Copying a value

`af-copy-button` is an extra-small ghost icon button, 24 px square with a 12 px copy icon, that puts `value` on the clipboard. It asks `navigator.clipboard.writeText` first, started inside the click so the browser still counts it as the person's gesture. When that is missing or refused (no permission, an insecure page, a frame the policy shuts out), it puts `value` in a temporary `<textarea>` in its shadow root, selects it and calls `document.execCommand('copy')`. When that fails too, the copy failed. Focus goes back to where it was before the selection, or to the button when nothing had it.

For two seconds after a press the icon is a check (a failure keeps the copy icon), and the `status` part, a visually hidden `role="status"` region that is in the tree from the first render, reads `Copied` or `Couldn't copy`; then both clear. A second press inside the two seconds starts them again; when presses overlap, each reports its own outcome and the icon and status show the latest press's. An empty or missing `value` is a failed copy (`ok: false`, `Couldn't copy`) with nothing written to the clipboard, so a press never empties it. The button's name stays `Copy`, or your `label`, so a screen reader's focus stays on a button it knows and the region does the announcing.

`af-copy` is raised once per press, after the outcome is known: `{value, ok}` with `ok` false when the text did not reach the clipboard. Its name is prefixed because the browser's own `copy` event shares the shorter one, as `af-form`'s `af-submit` does for `submit`: the selection fallback makes the browser raise `copy` inside the element, and the element keeps that event inside its shadow root, so a bubbling `copy` listener on the element or above it never hears it (a capturing one on `document` still can).

```js
const button = document.querySelector('af-copy-button');
button.value = 'INV-0042';
button.addEventListener('af-copy', (e) => {
  if (!e.detail.ok) showManualCopy(e.detail.value);
});
```

### Markdown

`af-markdown` draws Markdown read-only, as AgentFlow's `MarkdownView` does: GFM (tables, task lists, strikethrough) with a single newline as a line break, at 12.5 px with a 1.625 line height. Its parser and its drawing are the `markdown-view` chunk, loaded when the first `af-markdown` is connected to the page; until it lands the `content` part is empty and carries `aria-busy="true"`. If the chunk cannot load (a redeploy that removed it, the network gone), the value is shown as it was written, as plain text with its line breaks, and the next time the element is connected it tries again. It is the text tile's parser, so the same bounds hold: only the first 20,000 characters are read as Markdown (the rest is plain text), and a body built to make the parser slow, such as 20,000 characters of unclosed emphasis, is shown as it was typed instead.

A link opens in a new tab (`target="_blank"`, `rel="noreferrer noopener"`) when its URL is relative or its scheme is http, https, irc, ircs, mailto or xmpp, or starts with one of `schemes`; any other link, `javascript:` among them, is drawn as its text. `javascript:`, `vbscript:` and `data:` stay text even when listed. Before a link opens the element raises `af-link` `{href}`, cancelable: call `preventDefault()` to route the link yourself, and it does not open.

A mention token, `@[label](mention:<kind>/<id>)` as the rich editor writes it, is drawn as the editor's read-only chip: the label the `mentions` map resolves, `Restricted record` or `Restricted person` (`mentionRestricted`, `mentionRestrictedPerson`) for a target the viewer may not see, and `Deleted record` (`mentionDeleted`) for a deleted record. A target the map does not hold shows the token's own label in the chip's muted look. A chip never shows its target's id. Pressing it raises `af-link` with `href` `mention:<ref>`, and it navigates nowhere itself. A token in text the element shows as typed (past the first 20,000 characters, say) reads `@label`.

Never rendered: raw HTML, which is drawn as its own characters; an image, which is drawn as its alt text and never fetched; a task list's checkboxes, which are disabled.

```js
const notes = document.querySelector('af-markdown');
notes.value = record.notes;
notes.mentions = response.mentions;
notes.schemes = ['af-mention:'];
notes.addEventListener('af-link', (e) => {
  if (e.detail.href.startsWith('mention:')) {
    e.preventDefault();
    openMention(e.detail.href.slice('mention:'.length));
  }
});
```

### Form controls in a form

`af-date`, `af-person-picker`, `af-number-input`, `af-select`, `af-combobox`, `af-tree-picker`, `af-file-upload` and `af-signature-pad` are form-associated custom elements: inside a `<form>`, in your page or in a shadow root, they take part as an `<input>` does.

- **`name`** puts the value in the form's `FormData`: `af-date` as one entry, the ISO date (with `range`, `start/end`, an empty side for an open end, as `2026-11-01/`), `af-number-input` as one entry, the number as `String(value)` writes it (`1234.5`), and `af-person-picker`, `af-select`, `af-combobox` and `af-tree-picker` as one entry per id or value, so `multiple` with two people gives two entries under one name, `af-file-upload` as one entry per item whose status is `done`, its id, and `af-signature-pad` as one entry, the PNG data URL. An empty value submits nothing. Setting the `name`, `disabled` or `readonly` property writes its attribute back, because the browser reads the attribute: to submit the value under its name, to leave a disabled element out of `FormData` and validity, and to keep a read-only one out of validity. No other property does.
- **Validity.** `required` with no value is `valueMissing` (with `range`, when both ends are empty), and an `af-date` value (or either end) before `min` or after `max` is `rangeUnderflow` or `rangeOverflow`, each with a message in the element's language (the `KitStrings` keys of the same names). Text an `af-date` with `format` cannot read is `badInput`, with the message `Enter a date as DD.MM.YYYY.` naming its mask (the `KitStrings` key `badDate`, whose `{format}` the mask fills). An `af-number-input` value below `min` or above `max` is `rangeUnderflow` or `rangeOverflow` too, its message from `numberUnderflow` or `numberOverflow`, with the bound written as the field writes its value. Text an `af-number-input` refuses for its grouping is `badInput`, with the message `Enter a number as 1,234.5.` (`Nhập số theo dạng 1.234,5.` in Vietnamese; the `KitStrings` key `badNumber`, whose `{example}` the language fills). The element has `form`, `validity`, `validationMessage`, `willValidate`, `checkValidity()` and `reportValidity()`, as an `<input>` has. `form.checkValidity()` counts it, and `form.reportValidity()` focuses its input and shows the message there. `el.focus()` also reaches the input. The element's `internals` exists for tests only and is outside the contract.
- **Reset.** Values are controlled, so `form.reset()` cannot clear the element: it emits `change` with its default value, which is its `value` attribute if you wrote one (a number for `af-number-input`), otherwise `null` (`[]` with `multiple`); `af-date range` emits `{start, end}` from its `start` and `end` attributes. Set the value back, as for any `change`. It emits nothing when the value already equals that default. `af-file-upload` has no default to go back to and emits nothing: its items are yours. `af-signature-pad` also empties its strokes.
- **A disabled `<fieldset>`** disables an element inside it, as it does an `<input>`, which also keeps the value out of `FormData`. The element's own `disabled` property stays as you set it.
- **The form properties are for accessibility.** `description`, `error`, `invalid`, `required` and `readonly` describe the input inside the shadow root, where a `<label for>` or an `aria-describedby` from your page cannot reach: `description` and `error`, in that order, become the text its `aria-describedby` points at, `invalid` sets its `aria-invalid`, `required` its `aria-required`, and `readonly` makes it read-only, keeps the calendar or the list closed, and stops the arrow keys and steppers. The element draws none of them. The visible label, help text and error are `af-field`'s to draw.

### Pickers

`af-person-picker`, `af-combobox` and `af-tree-picker` choose a person, an option or a node of a hierarchy, and all three get their list in the same way. The rules below hold for each; the element's own behaviour is in its row and notes in [The elements](#the-elements).

- **A fixed list, or a source.** Give a picker its list in `people` (`Person[]`), `options` (`ComboboxOption[]`) or `nodes` (`TreeNode[]`) and it filters the list itself as the person types, ignoring case and Vietnamese accents. Or give it a `source`, a function `({q, cursor, signal}) => Promise<{items, next}>`, and it asks for its list instead: a set `source` wins, and the fixed list is not read. `next` is the cursor for the page after this one, or `null` at the end; `q` is what was typed and `cursor` is `null` for the first page. The item types are the SDK's (`Person`, `ComboboxOption`, `TreeNode` in `@reflexify/agentflow-sdk`), which the kit re-exports under the same names. A `source` is a property only, with no attribute.
- **One stable function.** A new function restarts the list and asks again, so a `source` written inline in a render asks on every render, and a tree picker fetches its whole forest each time. Make it a module constant, or build it once for the page's lifetime.
- **`resolve`.** A source may carry `resolve(ids, signal)`, which returns the items for ids the picker holds and no page has named, such as the saved value of an edit form. The picker asks it once for each id, aborts it when the source changes, and never looks an id up itself. A value nothing has named shows as an ellipsis while a call or `resolve` that could name it runs, and as "Unknown value" (`Unknown person` in the person picker) once they have answered without it, never as its id; without a `resolve`, that is once the first page has answered. Give one whenever `value` can start non-empty.
- **A source that rejects is not drawn as an error.** The list reads as empty; the tree picker, whose pages after the first can fail, shows a `load-more` row that asks again. Catch the failure in the source if the screen has to say so.
- **The tree picker loads the forest and filters it itself.** Over a `source` it asks for every page of the empty query when the popup opens, following `next` until it is null, and builds the tree from `parentId`, with a `loading` row meanwhile. Typing never reaches the source, because a server's search would drop the ancestors a match needs in order to have a place in the tree: the picker matches what was typed against each node's `label` and `code`, accent-insensitively, shows every match with its ancestors and opens them, and clearing the text gives back the branches as they were. A node whose parent is not among the items is a root. Picking a branch picks that node alone. `resolve` names a chosen id the pages do not hold, such as an archived unit the list leaves out.
- **The directory.** The SDK's `directory` makes the three sources for the organization's people, groups and units, each with a `resolve`, as `GET /users`, `GET /groups` and `GET /units` list them:

```js
import { directory } from '@reflexify/agentflow-sdk';

// Each call returns a new function, so make the sources once, outside any render.
const people = directory.people(api);
const units = directory.units(api);
const groups = directory.groups(api, { members: (count) => `${count} thành viên` });

document.querySelector('af-person-picker').source = people;
document.querySelector('af-tree-picker').source = units;
document.querySelector('af-combobox').source = groups;
```

`directory.people(api, options?)` takes `group_id`, `not_group_id`, `unit_id`, `role_id`, `is_active` and `limit`; `directory.groups(api, options?)` takes `limit` and `members`, which words a group's description (its member count, in English by default); `directory.units(api, options?)` takes `include_archived` and `limit`. On an installed app's own site the lists are the app's view of the directory, bounded by what its package lists of the `user`, `group` and `org_unit` entities: a person or a unit whose name is not listed is named by their email or code, then their id, `resolve` names a person only while `name` is listed, and `GET /groups` is refused (`APP_CEILING_DENIED`), so `directory.groups` rejects there and a group picker offers only the groups the installation names. The SDK's README, "Directory sources", has the rest.

### Fields and forms

`af-field` and `af-fieldset` draw a form as AgentFlow's forms look: a label over each control with its description and
error, and a section card over a grid of fields, and `af-form` submits it. Unlike the other elements these three have no
shadow root. They enhance the
children your page writes, React's included, and never move one of them: each inserts nodes of its own, marked
`data-af-owned`, and puts those back first and last whenever your page adds, swaps or removes a child. So a conditional
control, or a child appended later, works as it would in a `<div>`.

```html
<af-fieldset heading="Contact" description="How to reach the customer" columns="2">
  <fieldset>
    <af-field label="Email" description="A work address" required data-span="2"><input class="af-input" name="email"></af-field>
    <af-field label="Owner" locked-reason="Set by the workflow"><af-select name="owner"></af-select></af-field>
    <af-field label="Priority"><div role="radiogroup">…</div><span slot="aside">…</span></af-field>
  </fieldset>
</af-fieldset>
```

- **The control** is the field's first child that is neither its own nor in a slot. A child with `slot="aside"`, such as a
  pill, sits at the end of the label row, placed by the grid, not moved.
- **A native control, or an element of your own,** gets an id if it has none, a `<label for>` pointing at it,
  `aria-describedby` over the description and the error (after any ids of your own), `aria-invalid` while the field is
  `invalid` or has an `error`, `required` and `aria-required` with `required`, and `readOnly` (on an input or a textarea)
  or `aria-readonly="true"` (on a `<select>` or a `role="radiogroup"`) with `readonly`. A `role="radiogroup"` or `role="group"` container is named with `aria-labelledby` instead. The field
  takes back only what it set, so a control that leaves it keeps what you wrote on it.
- **A kit control** (`af-date`, `af-select` and the others) gets what the field has of `label`, `description`, `error`,
  `invalid` (also true while there is an `error`), `required` and `readonly` as its own properties, which name and
  describe its inner input. What the field lacks it leaves alone, so `<af-field label="Due"><af-date required>` keeps
  the control's `required`. What it wrote and then drops, or what it wrote on a control that leaves it, goes back to the
  control's own value. A click on the label focuses the control's input (with a multiple `af-combobox` or
  `af-person-picker`, the input, not the first chip's remove button).
- **`locked-reason`** makes the control read-only (as `readonly` does: `readOnly` on a native input or textarea, the
  `readonly` property on a kit control, and on a native `<select>` or a `role="radiogroup"` only `aria-readonly="true"`,
  which tells assistive technology but cannot stop a person changing it, so the page keeps the value; a `role="group"`
  gets nothing) and adds a lock button to the label row, named `Locked` (the
  `KitStrings` key `locked`), whose tooltip shows the reason. The reason is also in the control's description, hidden
  from sight, because the tooltip's bubble is in its shadow root.
- **`edited`** marks a field whose value the person changed from a suggested one: a 3 px bar in the warning tone on its
  inline-start edge, with 9 px of padding in from it. It is the same for a native control and a kit element, and it
  changes nothing on the control, its classes, attributes or properties. In forced colours the bar is `Highlight`.
- **`name`** is the field's own, or else its control's (a group's first named input): what a form files the field's error under.
- **`af-fieldset` around a native `<fieldset>`** inserts a `<legend class="af-fieldset-legend">` and a
  `<p class="af-fieldset-description">` first in that fieldset, which is drawn as the card with the legend in its border,
  and lays out the fieldset's other children on the grid. The fieldset still disables every control inside it, the kit's
  included. **Without one,** it is the card itself, a `role="group"` named by its heading, and disables nothing.
- **A child's place on the grid** comes from `data-span` (how many columns it spans) and `data-col` (the column it
  starts in), each cut to the section's columns (one to four), and the column moved left so the span fits, as
  AgentFlow's form sections place a field. One with either attribute starts in column 1 unless `data-col` says otherwise; one with
  neither flows into the next free cell. The element writes the result as the child's `grid-column` style.

`af-form` enhances the native `<form>` your page writes as its first child, so the browser's own validation, `FormData`
and a disabled `<fieldset>` keep working:

```html
<af-form>
  <form>
    <af-field label="Email"><input class="af-input" name="email" type="email" required></af-field>
    <af-field label="City" name="address.city"><af-select name="city"></af-select></af-field>
    <button class="af-button primary">Save</button>
  </form>
</af-form>
```

- **Submitting.** The form's native `submit` is cancelled and becomes `af-submit` on the element, with the form's
  `FormData` (the kit controls included) and the button that submitted it. The event is `af-submit`, not `submit`,
  because the form's own `submit` already bubbles through the element. From that event the form is locked: a second
  submit, a double click or a second Enter, emits nothing. A moment later (a zero timer) it unlocks unless your handler
  has set `busy`, which keeps it locked until `busy` clears; no submit emits while `busy` is set. While it is, the form's submit buttons
  (`<button>` without a type, and `type="submit"`) carry `aria-disabled="true"`, so they keep their focus.
- **Errors.** Set `errors` to the server's `{path, message}` list. A path is a JSON Pointer that names an `af-field` by
  its `name` (`/address/city` names `address.city`), and the message becomes that field's `error`. The next `errors`
  clears only the errors the form set, so one your page set on a field stays. A message whose path names no field (`''`
  for the form as a whole) goes into a summary, `div.af-form-summary[role=alert]`, the form's first child: the heading
  `Some fields need attention` (the `KitStrings` key `formErrors`), those messages, and a link for each field that has an
  error, which focuses that field's control. A non-empty `errors` whose paths or messages differ from the last ones
  moves focus to the summary when there is one, and otherwise to the first field with an error; the same list again, in
  a new array as React passes it on each render, places the errors but leaves focus where it is.
- **Unsaved changes.** While `dirty` is set, leaving the page asks first, through one `beforeunload` listener on `window`.

| Class | Drawn by | Look |
|---|---|---|
| `af-field` | the field, on itself | A grid with 6 px between its rows. |
| `af-field-row` | the field | The label row: the label, the lock and the aside. |
| `af-field-label` | the field | 12.5 px at weight 500 in the foreground. |
| `af-field-required` | the field, with `required` | A `*` in the danger tone, hidden from assistive technology. |
| `af-field-description` | the field, with `description` or `locked-reason` | 11 px, muted, drawn above the control. |
| `af-field-error` | the field, with `error` | 11 px in the danger tone, last. |
| `af-field-lock` | the field, with `locked-reason` | A ghost extra-small icon button. |
| `af-field[edited]` | the field, with `edited` | A 3 px bar in the warning tone on the inline-start edge, 9 px of inline-start padding. `Highlight` in forced colours. |
| `af-fieldset` | the section, on itself | A card: a border, the surface, the radius plus 4 px, 20 px of padding and a small shadow, over a grid of one to four equal columns with a 16 px gap that fills its holes (`row dense`). |
| `af-fieldset-legend` | the section, with `heading` | 13 px, semibold, 4 px of inline padding. |
| `af-fieldset-description` | the section, with `description` | 12 px, muted, 12 px above the first row. |
| `af-form-summary` | the form, when an error matches no field | A danger banner (`af-banner danger`, which it also carries): the heading, then the messages and the field links as a list in the banner's description style. |

### Buttons

`af-button` is AgentFlow's `Button`. With no variant it is the outline button, a bordered button with a faint shadow that takes the accent fill under the pointer; the other variants set a fill. State is the native attribute: `disabled`, or `aria-disabled="true"` to lock a button and keep its focus and tooltip.

| Class | Markup | Notes |
|---|---|---|
| `af-button` | `<button type="button" class="af-button">Cancel</button>` | The outline button. 36 px high, 14 px at weight 500, 16 px icons, an 8 px gap. Text takes the colour around it. |
| `primary`, `secondary`, `ghost`, `danger`, `link` | `<button type="button" class="af-button primary">Save</button>` | `primary` is the brand fill, `secondary` the secondary fill, `ghost` has no fill until the pointer is over it, `danger` is the destructive fill (for deletes only) and `link` is the primary colour as text with an underline under the pointer. None but the outline button has a border or a shadow. |
| `xs`, `sm`, `lg` | `<button type="button" class="af-button sm">…</button>` | 24 px (12 px type, 12 px icons), 32 px and 40 px high. A button with an `<svg>` child takes less inline padding at every size. |
| `icon` | `<button type="button" class="af-button icon" aria-label="Add"><svg>…</svg></button>` | A square: 36 px, and `icon xs` 24 px, `icon sm` 32 px, `icon lg` 40 px. Name it with `aria-label`. |

- **Focus** is a ring-coloured border and a 3 px ring, as for the other classes (under [the rules](#the-rules-every-kit-element-follows)), and a 2 px outline under forced colours.
- **Locked** is half opacity and `cursor: not-allowed` with no hover, and keeps its pointer events so a tooltip can explain it.
- **Sizes and fills changed.** Before, the unmarked button was 32 px, `sm` was 28 px, `icon` a 32 px square (`icon sm` 24 px) and `secondary` the colour of a card; `secondary` is now AgentFlow's secondary fill.

### Form controls

Native elements with kit classes, so `<label>`, `required`, `FormData`, reset and server rendering work as they do for any form, and a checkbox on every table row costs one element. Each looks like AgentFlow's own control of the same name (`Input`, `Textarea`, `Checkbox`, `RadioGroup`, `Switch`, `Label`, `Toggle`, `SegmentedControl`) in size, colour, border, shadow and focus ring, in light and dark. State is the native attribute, not a class: `checked`, `disabled`, `aria-invalid="true"`, `aria-pressed`. Put the markup inside an `af-kit` element, like the other classes.

| Class | Markup | Notes |
|---|---|---|
| `af-input` | `<input class="af-input">` | 36 px; `sm` is 32 px with 12 px type. Fills the width it is given. Type is 16 px below 768 px, so iOS does not zoom in on focus, and 14 px from there. |
| `af-textarea` | `<textarea class="af-textarea">` | At least 64 px, resizes vertically only; `sm` as for the input. |
| `af-checkbox` | `<input type="checkbox" class="af-checkbox">` | 16 px. Set the `indeterminate` property in script to draw a dash; no attribute does. |
| `af-radio` | `<input type="radio" class="af-radio" name="…">` | 16 px. |
| `af-switch` | `<input type="checkbox" role="switch" class="af-switch">` | 32 by 18 px; `sm` is 24 by 14 px. |
| `af-label` | `<label class="af-label" for="…">` | Dims after a disabled input (`<input disabled>` then `<label>`), or inside an element marked `data-disabled="true"`. |
| `af-toggle` | `<button type="button" class="af-toggle" aria-pressed="false">` | A button that stays pressed. `outline` adds a border and shadow; `sm` is 32 px and `lg` 40 px. |
| `af-segmented` | `<div role="radiogroup" class="af-segmented" aria-label="…"><label><input type="radio" name="…" value="…"><span>Day</span></label>…</div>` | The native radios are invisible and keep their keyboard behaviour; the chosen option is raised on the track, and an unchosen one takes a stronger text colour under the pointer. A group whose radios are all disabled dims as a whole. |

```html
<div class="af-kit">
  <label class="af-label" for="name">Name</label>
  <input id="name" class="af-input" required />
  <label class="af-label" for="email">Email</label>
  <input id="email" class="af-input" type="email" aria-invalid="true" aria-describedby="email-error" />
  <span id="email-error">Enter a full address</span>

  <div style="display: flex; gap: 8px; align-items: center">
    <input id="terms" type="checkbox" class="af-checkbox" />
    <label class="af-label" for="terms">I agree</label>
  </div>
</div>
```

- **`aria-invalid="true"`** turns the border of an input, textarea, checkbox, radio or toggle to the danger tone, and the ring it shows on focus. AgentFlow's switch and segmented control have no invalid look, so the kit's have none.
- **Focus** is a 3 px ring and a ring-coloured border, as AgentFlow's controls have it; a checked checkbox keeps its primary border. Under forced colours the ring is not drawn, so each control shows a 2 px outline instead, and a checked, pressed or chosen control is painted in the system's highlight colours so it still differs from an unchecked one.
- **A control in an edited field** looks as it always does. `af-field` with `edited` draws the bar on its own edge, so no control's own border or ground changes; see [Fields and forms](#fields-and-forms).
- **Disabled** is the native `disabled` attribute and half opacity. A kit button is locked with `aria-disabled` so it keeps focus; these controls are disabled, which also keeps them out of `FormData`.
- **The segmented control's greys** are AgentFlow's neutral ramp, which no token holds, so each is a mix of the tokens: exact in the dark, and in the light off by tint only, at most 9 of 255 on a channel.

### Display classes

Chips, banners, avatars, progress bars, tabs, skeletons and the spinner, each drawn as AgentFlow's own component of the same name is (`Badge`, `Alert`, `Avatar`, `Progress`, `Tabs`), in size, colour, border, shadow and focus ring, in light and dark. Put the markup inside an `af-kit` element, like the other classes.

| Class | Markup | Notes |
|---|---|---|
| `af-chip` | `<span class="af-chip">Active</span>` | A badge: a solid primary pill, 22 px high with 12 px type. `secondary`, `danger` (the destructive badge) and `outline` are the other variants. `neutral`, `success`, `warning` and `info` are tinted tones that keep their names and take the badge's size. Only a link (`<a class="af-chip">`) or a button (`<button class="af-chip">`, with the states under [Filter classes](#filter-classes)) hovers or takes focus; `aria-invalid="true"` turns the border to the danger tone. A leading `<svg>` is 12 px. |
| `af-banner` | `<div class="af-banner" role="alert"><svg>…</svg><div class="af-banner-title">Title</div><div class="af-banner-description">Details</div></div>` | A card with a border and 12 by 16 px of padding. The icon, the title and the description are optional: a banner of bare text fills the width, and one with an `<svg>` first gets a 16 px column for it. The title holds one line. `danger` is red text on the card, as AgentFlow's destructive alert is; `info`, `success` and `warning` tint the border and the ground, each at the same strength in its own tone. |
| `af-avatar` | `<span class="af-avatar"><span class="af-avatar-initials">AL</span><img src="…" alt=""></span>` | 32 px; `sm` is 24 px with 12 px type and `lg` is 40 px. The initials sit beneath the image. An `<img>` with no `src`, or marked `data-failed`, is hidden so the initials show: set the attribute from the image's `error` event. A `data-hue` from 0 to 7, best chosen from the person's id so it survives a rename, tints the circle. Text placed directly in the span, without the initials element, draws the same circle. |
| `af-progress` | `<progress class="af-progress" value="40" max="100" aria-label="…">` | An 8 px rounded track of the primary at 20% with the fill at full strength. Give it a `value`: one without is an empty track. `circular` makes it a 32 px ring drawn up to `--af-progress`, a number from 0 to 1 that you set in a `style`. |
| `af-tabs` | `<div role="tablist" class="af-tabs"><button type="button" role="tab" aria-selected="true">Overview</button>…</div>` | A muted pill with the chosen tab raised on it. `line` has no track and marks the chosen tab with a bar under it. `segmented` is the sunk-track switch. A tab is disabled with `disabled`, or locked with `aria-disabled="true"` to keep its focus and tooltip. A tab is any `role="tab"` inside the list, so one wrapped in `af-tooltip` keeps the look; the wrapper's own size is not drawn by the stylesheet, so a plain page makes the `af-tooltip` a flex item of the list itself (`display: flex`, `flex: 1 1 0%` and `align-self: stretch`, with `flex: 0 1 auto` instead in `segmented`; and its `anchor` part `display: flex`, `flex: 1 1 0%` and `align-items: center`), as the `af-tabs` element does for a locked tab. |
| `af-skeleton` | `<div class="af-skeleton row"></div>` | A shimmering placeholder, 12 px high by default and as wide as its container. `row` is 40 px (a list or table row), `card` 96 px, `column` 320 px (a board column) and `block` 160 px (a chart or a picture); a `width` or `height` of your own overrides them. |
| `af-spinner` | `<span class="af-spinner" aria-hidden="true"></span>` | A 16 px ring in the text colour with an open top-right, turning once a second, drawn as lucide's `Loader2` is. Label what is loading in text beside it. |

```html
<div class="af-kit">
  <span class="af-chip">Active</span>
  <span class="af-chip danger">Overdue</span>
  <a class="af-chip outline" href="/tags/billing">Billing</a>

  <div class="af-banner danger" role="alert">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
    <div class="af-banner-title">Could not save</div>
    <div class="af-banner-description">The server is unreachable. Try again.</div>
  </div>

  <span class="af-avatar" data-hue="3">
    <span class="af-avatar-initials">LM</span>
    <img src="https://example.com/minh.png" alt="" onerror="this.setAttribute('data-failed', '')" />
  </span>

  <progress class="af-progress" value="40" max="100" aria-label="Upload"></progress>
  <progress class="af-progress circular" value="25" max="100" style="--af-progress: 0.25" aria-label="Upload"></progress>

  <div role="tablist" class="af-tabs line" aria-label="Sections">
    <button type="button" role="tab" aria-selected="true">Overview</button>
    <button type="button" role="tab" aria-selected="false" tabindex="-1">Activity</button>
  </div>

  <div class="af-skeleton row" aria-hidden="true"></div>
  <span class="af-spinner" aria-hidden="true"></span> Saving
</div>
```

- **The tabs' keys and `aria-selected` are yours:** the classes only draw the state. Move `aria-selected` and `tabindex` as you change tab.
- **The `line` tabs' colour** is AgentFlow's brand ramp, a Tailwind palette that no token holds, so the kit draws it from `--af-primary` and a few points of white or black, and the match is approximate. The comparison with AgentFlow's, per channel on a scale of 0 to 255 and for the chosen tab's text and the bar only, allows the largest difference measured: azure is within 7 in the light and 10 in the dark, crimson within 25 in the light and 26 in the dark. AgentFlow's default brand uses Tailwind's own violet, which the primary cannot reach, so there the bar and the chosen tab's text are a related shade of the primary and not the same: up to 64 apart in the light, and the bar 124 apart in the dark.
- **Focus** on a chip link or a tab is a 3 px ring and a ring-coloured border, as AgentFlow's has it. Under forced colours the ring is not drawn, so each shows a 2 px outline; the chosen tab is filled in the system's highlight colours, a `line` tab keeps its bar in them, a chip keeps an edge, and a progress bar's fill is the system's highlight on a track with a grey edge (a ring's track is grey), so each still differs from what is not chosen or filled.
- **Reduced motion** stops the skeleton's shimmer and the spinner's turn.
- **Sizes changed.** Before, `af-avatar` was 20, 24 and 32 px, an untoned `af-chip` was a tint of the primary, `af-tabs` was an underlined strip and `af-banner` was 8 by 12 px of padding. Markup that overrode those sizes keeps its overrides.

### State and piece classes

The empty state of a list, the error of a screen, a repeating group of fields with the handle that moves a row, and a file's chip, drawn as the AgentFlow pieces they come from are (`RecordsEmpty` and the records page's no-views card, the error fallback, the repeating control in the form renderer, and the record value's file chip). Put the markup inside an `af-kit` element, like the other classes. The icons are yours: each class sizes the `<svg>` that is its direct child (an icon inside a wrapper of your own is not sized).

| Class | Markup | Notes |
|---|---|---|
| `af-empty` | `<div class="af-empty"><svg>…</svg><p class="af-empty-title">No records match this view.</p><p class="af-empty-body">…</p><button class="af-button sm">Clear search</button></div>` | A centred column with 8 px between its parts and 40 by 16 px of padding. The icon is 28 px, in the muted colour at half strength; the title is 14 px at weight 500; the body is 12.5 px, muted and at most 28 rem wide; a button sits 4 px further down. `boxed` makes it a card, as the records page draws one: a 2 px dashed border in the line colour, the surface, 48 px of padding and a radius of 14 px (the radius plus 4 px), a 32 px icon at 60%, the title 12 px under the icon, the body 4 px under the title and a button 16 px under the body. |
| `af-error` | `<div class="af-error" role="alert"><span class="af-error-icon"><svg/></span><h2 class="af-error-title">…</h2><p class="af-error-body">…</p><div class="af-error-actions"><button class="af-button primary sm">Try again</button><button class="af-button sm">Reload page</button></div><details class="af-error-details"><summary>Technical details</summary><af-scroll-area><pre>…</pre></af-scroll-area></details></div>` | A centred column at most 28 rem wide, with 16 px between its parts and 24 px of padding. The icon sits in a 44 px round tile, the danger tone at 10% over the surface, with a 20 px icon; the title is 16 px semibold and the body 14 px muted, 6 px apart. The actions are a row with 8 px between them. The summary is 12 px, muted and a pointer. The `pre` is 11 px monospace, pre-wrapped and start-aligned, on the muted ground with 10 px of padding and a radius of 8 px. The scroll area around it is bounded at 192 px by the class, so a long trace scrolls in the kit's scroller. The 28 rem bound includes the 24 px of padding, so the text column is 400 px, where AgentFlow's padding sits outside its 28 rem column. |
| `af-repeater` | `<div class="af-repeater"><div class="af-repeater-row" aria-label="Row 1" style="--af-repeater-columns: 2"><div class="af-repeater-head"><button type="button" class="af-drag-handle" aria-label="Drag row 1"><svg/></button><span>Row 1</span><button type="button" class="af-repeater-remove">Remove</button></div><div class="af-repeater-fields">…</div></div><p class="af-repeater-empty">No rows yet.</p><button type="button" class="af-button sm">Add row</button></div>` | Rows 8 px apart. A row is a card: the surface, a 1 px border, a radius of 8 px, 12 px of padding and a small shadow; the head is 11 px at weight 500 in the muted colour, with the label after the handle and `Remove` at the far end in the danger tone, underlined under the pointer. The fields are a grid with 12 px between them and as many equal columns as `--af-repeater-columns` says (one when it is not set), which you set on the row. The empty note is a dashed box on the muted ground at 40%, in 11.5 px italic. `data-dragging` on a row raises it and dims it to 80%. `line` on a row (`af-repeater-row line`) makes it one grid row instead, with 8 px of padding and no head: a leading `af-drag-handle`, the fields (one child, or a column of them, 8 px apart) and a trailing remove button (an `af-button ghost icon sm`, or `af-repeater-remove`). The 8 px beside the handle and the button are their own margins, so a row without one has no gutter in its place and every child in the middle starts at the same offset. A row without `line` is drawn as described above, whether it has a head or not. The add-row button is an ordinary `af-button sm`. |
| `af-drag-handle` | `<button type="button" class="af-drag-handle" aria-label="Drag row 1"><svg>…</svg></button>` | A 14 px icon in the muted colour, the foreground under the pointer, with 2 px of padding and a 4 px radius. The cursor is `grab`, `grabbing` while pressed (`:active`, or `aria-pressed="true"` as dnd-kit sets it while a handle is dragged), and `touch-action: none`. In an `af-repeater-row line` it is a 24 px ghost icon button, with an accent ground under the pointer. In a repeater's head the padding spills over the handle's neighbours, so the row is as tall as it would be without it. |
| `af-file-chip` | `<span class="af-file-chip"><svg/><button type="button" class="af-file-chip-name">report.pdf</button><a class="af-file-chip-download" download aria-label="Download report.pdf"><svg/></a></span>` | An inline pill at most 240 px wide: the muted ground, a 1 px border, 2 by 6 px of padding and 10.5 px muted text, with a 12 px paperclip. The name is a button that gives way to an ellipsis and is underlined under the pointer; the download link is a 12 px icon in the muted colour, the foreground under the pointer. `data-unresolved`, on the chip or on the name, makes the name plain text: it takes no pointer, and the page puts a `<span>` there. |

```html
<div class="af-kit">
  <div class="af-empty boxed">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
    <p class="af-empty-title">No views yet</p>
    <p class="af-empty-body">Add a view to choose the columns and filters this list opens with.</p>
  </div>

  <div class="af-repeater">
    <div class="af-repeater-row" aria-label="Row 1" style="--af-repeater-columns: 2">
      <div class="af-repeater-head">
        <button type="button" class="af-drag-handle" aria-label="Drag row 1"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" /></svg></button>
        <span>Row 1</span>
        <button type="button" class="af-repeater-remove">Remove</button>
      </div>
      <div class="af-repeater-fields">
        <input class="af-input" aria-label="Item" />
        <input class="af-input" aria-label="Owner" />
      </div>
    </div>
    <button type="button" class="af-button sm">Add row</button>
  </div>

  <div class="af-repeater">
    <div class="af-repeater-row line">
      <button type="button" class="af-drag-handle" aria-label="Drag row 1"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" /></svg></button>
      <div class="af-repeater-fields" style="--af-repeater-columns: 2">
        <input class="af-input" aria-label="Item" />
        <input class="af-input" aria-label="Owner" />
      </div>
      <button type="button" class="af-button ghost icon sm" aria-label="Remove row 1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg></button>
    </div>
    <button type="button" class="af-button sm">Add row</button>
  </div>
</div>
```

- **Moving a row is yours.** The classes draw a row, its handle and a row being dragged; no pointer or key behaviour comes with them. Set `data-dragging` while your sortable library holds a row, and name the handle with `aria-label`.
- **The error's details** are a native `<details>`, collapsed until the reader opens it, around an `af-scroll-area`, which scrolls a long trace once the kit's JavaScript is loaded. Put the trace in the `pre` as text, never as markup.
- **Focus** on the handle, `Remove`, the chip's name and its download link is the kit's 3 px ring, and a 2 px outline under forced colours, where the ring is not drawn. **Reduced motion** drops the colour transitions on the handle, the download link and the error's summary.
- **The colours** are AgentFlow's raw Tailwind ramps (neutral for text, edges and grounds, rose for the error and `Remove`, and white for a row, which AgentFlow's dark palette does not flip), which no token holds, so the kit draws them in the muted text, the foreground, the muted ground and the danger tone. The comparison with AgentFlow's allows the largest per-channel gap measured, on a scale of 0 to 255: text up to 55 in the light and 31 in the dark; the error tile and `Remove`, in rose, up to 52 and 43 in the light and 100 and 88 in the dark; the handle and the paperclip, which AgentFlow draws in neutral 400, up to 68 in the light and 30 in the dark; and the empty state's icon, which AgentFlow draws in neutral 300 at full strength and the kit in the muted text at half, up to 38 in the light and 32 in the dark, compared as the colour each paints over the page. The card's dashed edge is within 11 in the light, and is not compared in the dark, where AgentFlow's is an opaque grey and the kit's the line colour at 11%.

### Tables

A record table drawn as AgentFlow's is (`RecordTable`): a header row on the muted ground, rows divided by a line, a header row over each group of rows, and a row the page marks selected or toned. Put the markup inside an `af-kit` element, like the other classes. The behaviour stays yours: you sort, select, collapse and page, and the classes draw the state you set (`aria-sort`, `aria-selected`, `data-tone`, `data-collapsed`, `data-empty`).

| Class | Markup | Notes |
|---|---|---|
| `af-table` | `<table class="af-table">` | Full width, collapsed borders, 12.5 px text. The header row has a 1 px line under it and the muted ground at 70% over the surface, with muted text; each row has a 1 px line under it, none on the last. `th` and `td` have 8 by 12 px of padding and do not wrap; `compact` makes them 4 by 12 px. `th.check` and `td.check` are set to 36 px; a cell holding the 16 px checkbox with 12 px of padding on each side computes 40 px, as AgentFlow's `w-9 px-3` does. `.num` is end-aligned with tabular numerals. Under the pointer, or with focus inside, a row takes the hover ground; `aria-selected="true"` is the primary at 8% over the surface (12% under the pointer); `data-tone` is `ok`, `warn` or `danger`, the success, warning and danger tones at 8%, 8% and 10%. |
| `af-table-sort` | `<th aria-sort="ascending"><button type="button" class="af-table-sort">Name <svg>…</svg></button></th>` | The text of the header as a button, with your 12 px icon (an arrow pointing up) shown under the pointer, while the button has focus and while the column is the sorted one, and turned over for `descending`. `aria-sort="none"` shows it under the pointer only, and at half strength where nothing hovers (a touch screen), so a column still says it sorts. Set `aria-sort` on the `th`. |
| `sticky` | `<table class="af-table sticky">` inside an `af-scroll-area axis="both"` | The header row sticks to the top of the scroll area, a group's header under it, and the first cell of every row to the start. Because a collapsed border does not move with the cell that sticks, a sticky table draws its lines as the cells' own bottom borders. The layers, from the bottom: a first cell, a group header, the header row, and the cell where the header row meets the first column, so a row that scrolls under a group header never paints over it. The scroll area keeps its content's layers inside its viewport, so none of them covers the scrollbars. |
| `af-table-group` | `<tbody class="af-table-group" data-collapsed>` with a `tr.af-table-group-header` first | A group is a `tbody`. Its header is a `th scope="rowgroup"` spanning the columns, whose `.af-table-group-row` holds a checkbox, the toggle, the count and the actions: a row with 12 px between them, 6 by 12 px of padding and `--af-table-depth` steps of 16 px more at the start, in 12.5 px text at weight 500 on the muted ground at 60%. The toggle is a button with 6 px between its chevron (14 px, muted, turned a quarter for `aria-expanded="true"`, so draw it pointing right) and its text; the count is a pill on the foreground at 7%, in 11 px text, sitting 6 px after the toggle as AgentFlow's does inside it; the actions sit at the end. `data-collapsed` shows the header only; `data-empty` dims what the header holds to 60%, lightens its ground to match and makes its actions ignore the pointer (it dims the row inside the cell, not the table row, so the stuck header stays opaque and keeps its layer). |
| `af-table-more`, `af-table-loading`, `af-table-empty` | `<tr class="af-table-more"><td colspan="4"><af-pager mode="more" has-more focus-new controls="g1-rows"></af-pager></td></tr>` | The rows at the foot of a group: Load more (its `controls` names the group's `tbody`, whose direct children are the rows), a loading row (`<div class="af-skeleton row">`) and an empty state (`<div class="af-empty">`). The first two are 8 by 12 px of 12 px muted text; the empty one has no padding. |

```html
<af-scroll-area axis="both" label="Invoices" style="height: 420px">
  <table class="af-table sticky">
    <thead>
      <tr>
        <th class="check"><input type="checkbox" class="af-checkbox" aria-label="Select the page"></th>
        <th aria-sort="ascending"><button type="button" class="af-table-sort">Name <svg>…</svg></button></th>
        <th class="num">Amount</th>
        <th>Owner</th>
      </tr>
    </thead>
    <tbody id="g1-rows" class="af-table-group" data-collapsed>
      <tr class="af-table-group-header">
        <th scope="rowgroup" colspan="4" style="--af-table-depth: 0">
          <div class="af-table-group-row">
            <input type="checkbox" class="af-checkbox" aria-label="Select the loaded rows in this group">
            <button type="button" class="af-table-group-toggle" aria-expanded="false" aria-controls="g1"><svg>…</svg><span>Open</span></button>
            <span class="af-table-group-count">12</span>
            <div class="af-table-group-actions">…</div>
          </div>
        </th>
      </tr>
      <tr id="g1" aria-selected="true" data-tone="warn"><td class="check">…</td><td>…</td><td class="num">1.240</td><td>…</td></tr>
      <tr class="af-table-more"><td colspan="4"><af-pager mode="more" has-more focus-new controls="g1-rows"></af-pager></td></tr>
      <tr class="af-table-loading"><td colspan="4"><div class="af-skeleton row"></div></td></tr>
      <tr class="af-table-empty"><td colspan="4"><div class="af-empty">…</div></td></tr>
    </tbody>
  </table>
</af-scroll-area>
```

- **`--af-table-head`** is how far below the top a group's header sticks, which is the height of the header row; CSS cannot measure it, so the kit sets it on the table to the height its own header row measures: the first of the sizes below that fits the table (`compact` and a check column in the header are what it looks for). It changes only with the header's type or padding, and then you set it on the table (in its `style`, or in a rule of your own). The sizes are the smallest whole number, or the exact size where all three engines agree, of what Chromium, WebKit and Firefox measure (a header a little taller than the value only hides the top of the group header under it; a shorter one leaves a gap that rows show through). **`--af-table-depth`** is read on the group header's `th` and defaults to 0; the one level is what AgentFlow draws.

  | Header row | Chromium | WebKit | Firefox | `--af-table-head` |
  |---|---|---|---|---|
  | plain, no check column | 35.75 px | 35.75 px | 35.75 px | 35.75 px |
  | plain, with a check column | 37.75 px | 36.875 px | 36.383 px | 36 px |
  | `compact`, no check column | 27.75 px | 27.75 px | 27.75 px | 27.75 px |
  | `compact`, with a check column | 29.75 px | 28.875 px | 28.383 px | 28 px |

- **A row's ground** is `--k-row-bg` on the row, painted by its cells, so a cell that sticks stays opaque; the first cell's fallback is the surface. A row you tone, select or hover keeps that order: a selected row wins over a tone, and a tone gives way to the pointer.
- **A collapsed or empty group is yours to keep honest:** `data-collapsed` and `data-empty` are presence attributes, and `pointer-events: none` does not take the actions of an empty group out of the tab order, so disable or `inert` them yourself. Keep `aria-expanded` and `aria-controls` on the toggle in step with `data-collapsed`.
- **Focus** on a sort button and a group toggle is the kit's 3 px ring, and a 2 px outline under forced colours, where a selected row is outlined in the system's highlight too, since its ground is not drawn. **Reduced motion** drops the sort icon's fade and turn and the chevron's turn. The toggle and the sort button show a pointer, as `af-button` does, where AgentFlow's toggle keeps the browser's arrow.
- **The colours** are AgentFlow's Tailwind ramps (neutral, violet, emerald, amber and rose), which no token holds, so the kit draws them in the muted ground and text, the foreground, the primary and the tones over the surface. The comparison with AgentFlow's allows the largest per-channel gap measured, on a scale of 0 to 255: the header's text and the chevron up to 22 in the light and 10 in the dark, the toggle's text up to 29 and 18 and the count's up to 32 and 24; the grounds, as painted over the card, up to 2 and 8 for the header row, 2 and 7 for a group's header, 4 and 5 for the count, 9 and 12 for a selected row, and 7 and 22 for `ok`, 9 and 24 for `warn` and 14 and 19 for `danger`; and under the pointer up to 8 and 10 for a row and 13 and 18 for a selected one.
- **Firefox:** the check that the header row, a group's header and the first column stick, and that a row scrolling under the group header does not paint over it, passes in Chromium and WebKit with `pnpm e2e`, and in Firefox 155 with `pnpm exec playwright install firefox` once and then `KIT_FIREFOX=1 pnpm e2e --project=firefox` (the project exists only when the variable is exactly `1`), which runs only the checks that name sticky positioning.

### Page structure classes

The breadcrumb of a page's header, a disclosure that folds a section, a field list, a figure with its label, a timeline of events and a row of steps, drawn as the AgentFlow pieces they come from are (`PageHeader`'s crumb trail and eyebrow, `RowDisclosureHeader` and `SectionEyebrow`, the record page's field list, `StatCard`, the activity feed with `TimelineDot`, and the instance activity's icon tile). The steps have no AgentFlow counterpart and are the kit's own. Put the markup inside an `af-kit` element, like the other classes. The icons are yours: each class sizes the `<svg>` that is its direct child, or the `<svg>` in the marker or the tile.

| Class | Markup | Notes |
|---|---|---|
| `af-breadcrumb` | `<nav class="af-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="…">Entities</a></li><li><a href="…" aria-current="page">Invoices</a></li></ol></nav>` | A row that wraps, 4 px between its items, in 11.5 px text. Every item but the first has a 12 px chevron before it, drawn as a mask in the muted colour at 60% (the system's text colour under forced colours), pointing right, and left in a right-to-left page (`dir="rtl"`). Links are in the muted colour and the foreground under the pointer; `[aria-current="page"]`, and an item that is not a link, is in the foreground. `eyebrow` on the `nav` makes its one crumb 11 px at weight 600, uppercase, with 0.05 em of tracking. |
| `af-disclosure` | `<div class="af-disclosure"><button type="button" class="af-disclosure-toggle" aria-expanded="true" aria-controls="d1"><svg>…</svg><span>Details</span></button><div id="d1" class="af-disclosure-body">…</div></div>` | The toggle is a text button, 6 px between its parts, 12.5 px at weight 600 with −0.025 em of tracking, in the foreground; its 14 px chevron is muted, the foreground under the pointer, and turned a quarter for `aria-expanded="true"`, so draw it pointing right: in a right-to-left page (`dir="rtl"`) the class mirrors it to point left while closed, through `:dir(rtl)`. A 1 px rule in the line colour at 80% fills the rest of the row after the label, and the body sits 12 px below. The body after a toggle that says `aria-expanded="false"` is hidden. A label too long for the row gives way to an ellipsis. `eyebrow` makes it a block heading: the label is 10.5 px at weight 600, uppercase, with 0.05 em of tracking and the muted colour, the chevron is 12 px and the rule is the line colour in full. |
| `af-dl` | `<dl class="af-dl" style="--af-dl-columns: 2"><div class="af-dl-item" style="--af-dl-span: 2"><dt>Invoice number</dt><dd>INV-0042 <af-copy-button value="INV-0042"></af-copy-button></dd></div></dl>` | A grid of `--af-dl-columns` equal columns (one when it is not set), with 16 px between rows and 40 px between columns. An item spans `--af-dl-span` columns (one when it is not set). The term is a row with 6 px between its parts, 10.5 px at weight 500, uppercase, with 0.05 em of tracking, in the muted colour; the value is 4 px below it, 13.5 px at weight 500, in the foreground, with no margin of its own. An `af-copy-button` in the value is invisible until the item is under the pointer or holds focus, and stays visible on a device that has no hover. It sits at 24 px in a line of 20, so its margin keeps the value as tall as one without it. |
| `af-stat` | `<div class="af-stat"><div class="af-stat-label"><span class="af-stat-dot" style="--af-stat-color: …"></span>Open</div><div class="af-stat-value" data-tone="warning">42</div><div class="af-stat-note">this week</div></div>` | A card on the muted ground with 12 by 14 px of padding and a radius of 8 px (the radius less 2 px). The label is 12 px at weight 600 in the muted colour, with an optional 6 px dot in `--af-stat-color` (the muted colour when it is not set) and an ellipsis for a long text; the value is 4 px below, 24 px at weight 600 with tabular numerals, in the foreground or, by `data-tone`, the `success`, `warning`, `danger` or `info` tone; the note is 2 px below, 11 px and muted. `plain` drops the card, makes the label 10.5 px uppercase with 0.05 em of tracking, and the value 21 px with a tight line and −0.025 em of tracking. |
| `af-timeline` | `<ol class="af-timeline"><li class="af-timeline-item" data-kind="agent"><span class="af-timeline-dot"><svg>…</svg></span><div class="af-timeline-body"><div class="af-timeline-text"><b>Lan</b> changed the status</div><time class="af-timeline-time" datetime="…" title="…">2 h ago</time><div class="af-disclosure">…</div></div></li></ol>` | No bullets or margins. An item is a row with 12 px between its parts and 16 px below it (none on the last). A 1 px line in the colour of a dot with no kind (the foreground at 20% over the surface) at 80% runs from 16 px down the item to the next dot, and none follows the last item. The dot is 11 px and round with a 3 px ring of the surface, in the foreground at 20% over the surface, or by `data-kind` the info tone (`person`), the primary (`agent`), the muted colour (`system`), the warning tone (`admin`) or the success tone (`api`); an `svg` in it is hidden. The text is 12.5 px with a line height of 1.375 in the muted colour, `b` at weight 500 in the foreground; the time is 11 px and muted. `icons` on the list replaces the dot with a 28 px tile with a radius of 8 px, tinted by its kind at 12% over the surface and holding your 14 px `svg` in the kind's colour (the muted colour for an item with no kind); the line then runs between the tiles, 4 px clear of each. The line and the dot sit at the inline start, so in a right-to-left page the line stays under the dots. Items hold anything, an `af-disclosure` among them. |
| `af-steps` | `<ol class="af-steps"><li class="af-step" data-state="done"><span class="af-step-marker">1</span><span class="af-step-label">Validate</span></li><li class="af-step" data-state="current">…</li><li class="af-step" data-state="todo">…</li><li class="af-step" data-state="failed">…</li></ol>` | A row of equal columns with no bullets, each centred on a 24 px round marker with a 12 px label 6 px below it. A 1 px connector in the line colour joins a marker to the one before it, and is the primary after a `done` step. By `data-state`: `done` fills the marker with the primary and the primary foreground, `current` (or `aria-current="step"`, which marks it for assistive technology too) outlines it in the primary (2 px) with the primary text, `todo` outlines it in the line colour with muted text and a muted label, and `failed` fills it with the danger tone. The marker holds a number or an icon of yours (14 px). The state is drawn in colour alone, so say it in words too: `aria-current="step"` on the current step, and visually hidden text (`<span class="sr-only">Done</span>`, with a class of your own) beside a done or failed marker. In a right-to-left page the connectors and the order follow the text. |

```html
<div class="af-kit">
  <nav class="af-breadcrumb" aria-label="Breadcrumb">
    <ol>
      <li><a href="/entities">Entities</a></li>
      <li><a href="/entities/invoices" aria-current="page">Invoices</a></li>
    </ol>
  </nav>

  <div class="af-disclosure">
    <button type="button" class="af-disclosure-toggle" aria-expanded="true" aria-controls="details"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg><span>Details</span></button>
    <div id="details" class="af-disclosure-body">Issued on 5 November, due in thirty days.</div>
  </div>

  <dl class="af-dl" style="--af-dl-columns: 2">
    <div class="af-dl-item"><dt>Customer</dt><dd>Hà Nội Trading</dd></div>
    <div class="af-dl-item"><dt>Status</dt><dd>Open</dd></div>
  </dl>

  <ol class="af-steps" aria-label="Progress">
    <li class="af-step" data-state="done"><span class="af-step-marker">1</span><span class="af-step-label">Validate</span></li>
    <li class="af-step" data-state="current"><span class="af-step-marker">2</span><span class="af-step-label">Review</span></li>
    <li class="af-step" data-state="todo"><span class="af-step-marker">3</span><span class="af-step-label">Approve</span></li>
  </ol>
</div>
```

- **Folding a disclosure is yours.** The classes draw the state the toggle says: flip `aria-expanded` on click (and keep `aria-controls` pointing at the body), and the body hides and the chevron turns. The body must follow its toggle directly. In a timeline, a disclosure is the same markup inside the item's body.
- **The variables** are `--af-dl-columns` and `--af-dl-span` for the field list, and `--af-stat-color` for a stat's dot; each is set in the `style` of the element it names, or in a rule of your own.
- **A timeline's dot and ring** assume the surface behind the list is the card surface: the 3 px ring that breaks the line is drawn in it. The line runs 16 px past its item and under the next dot's ring, so the ring has to be opaque there.
- **Focus** on a breadcrumb link and the disclosure's toggle is the kit's 3 px ring, and a 2 px outline under forced colours, where the chevron, the rules, the lines and the dots are drawn in the system's text colour and the filled step markers in its highlight. **Reduced motion** drops the chevron's turn and colour change and the copy button's fade.
- **The steps are display only.** They have no AgentFlow counterpart, so the parity spec does not compare them; the gallery's end-to-end test holds their sizes and the four states' colours by token.
- **The colours** of the breadcrumb are tokens on both sides and match AgentFlow's. The rest are AgentFlow's raw Tailwind ramps (neutral for text, rules and grounds; sky, violet, amber, emerald and teal for the feed, its tiles and a stat's tones), which no token holds, so the kit draws them in the muted text, the foreground, the muted ground and the info, primary, warning, success and danger tones. The comparison with AgentFlow's allows the largest per-channel gap measured, on a scale of 0 to 255: the disclosure's label up to 55 in the light and 31 in the dark, its chevron 68 and 30 (55 and 40 under the pointer), the eyebrow's label 22 and 10 and its chevron 68 and 30 (73 and 47 under the pointer); the field list's term 68 and 30 and its value 14 and 5; a stat's ground 3 and 10, its label 32 and 24, its note 68 and 30, its dot 41 and 46 (35 and 35 when plain), its warning value 77 and 160 and its plain success value 31 and 129; the timeline's text 32 and 24, its actor 29 and 18 and its time 68 and 30; a dot, in the info, primary, warning and success tones against sky, violet, amber and emerald, up to 72 and 109, 93 and 82, 72 and 95, and 59 and 59, and the dot with no kind 16 and 6; and an icon tile's ground and icon, per kind, up to 11 and 45 (`person`), 13 and 72 (`agent`), 12 and 22 (`system`), 12 and 43 (`admin`) and 14 and 33 (`api`) in the light, and 29 and 54, 18 and 90, 7 and 10, 40 and 122, and 35 and 113 in the dark. The rules and the line are translucent, so they are compared as the colour each paints over the page: up to 9 in the light and 6 in the dark for the disclosure's rule, 11 and 8 for the eyebrow's, and 16 and 21 for the timeline's. The ring is AgentFlow's white in both themes and the kit's is the surface, which is white in the light only, so it is compared in the light.
- **Two sizes follow the component's measure and not the design's numbers:** AgentFlow's `rounded-md` computes to the radius less 2 px (8 px at the default radius), which is what a stat card and an icon tile use, and its value line at 24 px is exactly 32 px.

### View classes

The row of controls above a list, a record's card, the board of columns that holds cards, a list of rows with one chosen, and a month or a week of events, drawn as the AgentFlow pieces they come from are (the records page's toolbar, `KanbanCard` and the gallery's card, `RecordBoard`'s columns, `RecordInbox`'s rows with `WorkRow`'s chosen one, and `RecordCalendar`'s day cells and event bars). Put the markup inside an `af-kit` element, like the other classes. They draw what the page sets (`aria-selected`, `data-tone`, `data-active`, `--af-option-color`) and nothing more: the page builds every day, card and row, keeps which are chosen, and decides what pressing one does. The icons are yours: a class sizes the `<svg>` that is the direct child of the element it names.

| Class | Markup | Notes |
|---|---|---|
| `af-toolbar` | `<div class="af-toolbar"><div class="af-toolbar-lead">…</div><span class="af-toolbar-divider"></span><div class="af-toolbar-trail">…</div></div>` | A row that wraps, with 8 px between its parts. The lead is a row with 8 px between its parts that takes the width (`flex: 1` and `min-width: 0`, so it shrinks before it wraps); the divider is a 1 px by 16 px rule in the line colour; the trail is a row with 4 px between its parts, pushed to the end. |
| `af-card` | `<article class="af-card" aria-selected="true" data-tone="ok"><a class="af-card-link" href="…" aria-label="Open INV-0042"></a><input type="checkbox" class="af-checkbox af-card-check" aria-label="Select"><div class="af-card-media"><img src="…" alt=""></div><h3 class="af-card-title">INV-0042</h3><dl class="af-card-rows"><div class="af-card-row"><dt>Owner</dt><dd>Lan</dd></div></dl></article>` | A card on the surface with a 1 px border in the line colour, the radius, 10 px of padding (6 px with `compact`) and the small shadow. Under the pointer the border takes a little of the text colour; the shadow does not change, as AgentFlow's does not. `aria-selected="true"` takes the primary at 40% for its border and 6% for its ground, and keeps them under the pointer (on an `article` the attribute is a styling hook only, since the role does not support it: selection reaches assistive technology through the checkbox); `data-tone` (`ok`, `warn`, `danger`) tints the ground as the table's rows are. The title is 12.5 px at weight 600 with a line height of 1.375; the rows sit 6 px below it, 4 px apart, in 11 px muted text with tabular numerals, a `dt` lighter (the muted colour at 70%) and beside its `dd` with 6 px between. The link covers the card inside its border and is its one tab stop: its visible focus draws the kit's ring around the card itself (a 2 px outline under forced colours). The checkbox sits 6 px from the end and 8 px from the top, above the link, and is invisible until the card is under the pointer, the checkbox has focus or it is checked, and always shown where nothing hovers. `af-card-media` is a 16:9 box with a 1 px border and the radius, on the muted ground, centring your 24 px icon in the muted colour; an `img` in it covers it, and the title is 8 px below it. `af-card-grid` is a grid of `repeat(auto-fill, minmax(200px, 1fr))` with 12 px between cards. |
| `af-board` | `<af-scroll-area axis="horizontal"><div class="af-board"><section class="af-board-column dashed compact"><header class="af-board-column-header"><h3 class="af-board-column-title"><span class="af-board-dot" style="--af-option-color: #2a78d6"></span>Open</h3><span class="af-board-count">12</span></header><af-scroll-area><div class="af-board-cards">…cards…</div></af-scroll-area><p class="af-board-empty">No records</p></section></div></af-scroll-area>` | Columns in a row, 12 px apart and 8 px above the bottom, that keep their width: 256 px, or 224 px with `compact`. A column has a 1 px border, the radius plus 4 px, 8 px of padding and the muted ground at 60%, and is a flex column whose scroll area shrinks to what the column's height leaves, so give the board (or the column) a height of your own for the cards to scroll in. `dashed` has a dashed border, the muted ground at 40% and a muted title. The header is a row with space between, 0 by 4 px by 8 px of padding; the title is 12 px at weight 500 with a 6 px gap and an 8 px dot in `--af-option-color` (the muted colour when it is not set); the count is a pill on the surface, 10 px and muted, with 0 by 6 px of padding; the cards are 6 px apart; the empty note is 8 px by 4 px of padding, 11 px and muted. The cards sit in a box padded by 4 px, which the scroll area's matching negative margin takes back, so the shadow and the focus ring of a card at the edge of the column are not cut. |
| `af-list-row` | `<ul class="af-list" role="listbox" aria-activedescendant="r2" tabindex="0"><li id="r2" class="af-list-row" role="option" aria-selected="true" data-active>…</li></ul>` | The list has no bullets or margins, and its visible focus is a 1 px ring drawn inside it (a 2 px outline under forced colours). A row is a full-width row with 8 px between its parts, 8 px by 12 px of padding (6 px by 12 px with `compact`), a 1 px line under it (none under the last) and 12.5 px text; it takes the hover ground under the pointer and with `data-active`. `aria-selected="true"` is the primary at 6% with a 3 px bar in the primary at its start, 6 px in from the top and the bottom and rounded on its far side. `aria-current="true"` draws the same, for a row that is not an `option`: one that holds buttons of its own, such as AgentFlow's My Work rows, sits in a plain `ul` and is marked current rather than selected. |
| `af-cal` | `<div class="af-cal"><header class="af-cal-header"><button class="af-button icon ghost sm" aria-label="Previous">…</button>…<h2 class="af-cal-period">November 2026</h2><div role="tablist" class="af-tabs segmented">…</div></header><div class="af-cal-weekdays"><span>Mon</span>…</div><div class="af-cal-grid"><div class="af-cal-day outside" aria-selected="false"><button type="button" class="af-cal-day-button" aria-label="27 October 2026"></button><span class="af-cal-date today">27</span><div class="af-cal-events"><a class="af-event continues" style="--af-option-color: #7c3aed"><span class="af-event-time">09:00</span>Standup</a><button type="button" class="af-cal-more">+3 more</button></div></div>…</div></div>` | A box with a 1 px border, the radius plus 4 px and the small shadow, clipping its corners. The header is a wrapping row with 8 px between its parts, 8 px by 10 px of padding and a line under it, and a segmented `af-tabs` in it is pushed to the end; the period is 13 px at weight 600 with −0.025 em of tracking. The weekday names are seven equal columns on the muted ground at 80% with a line under them, each 4 px by 8 px, 11 px at weight 500, uppercase, with 0.025 em of tracking, muted, and a line at the end of all but the last. The grid is seven equal columns of days at least 116 px tall, each with a line at its end and under it (none at the end of a row or under the last row) on the surface; `outside` is the muted ground at 70%, and `aria-selected="true"` is the primary at 5% with an inset 1 px ring at 30%. The day's button covers it and tints it (the text colour at 5%) under the pointer; the date is a 20 px round box, 4 px from the top and 6 px from the end, 11 px at weight 500, filled with the primary for `today` and muted for a day `outside` the month; the events are a grid with 2 px between them, above the button, that lets the pointer through between them; the more button is 21 px tall, 10.5 px, muted, the text colour under the pointer. |
| `af-cal-week` | `<div class="af-cal-week"><div class="af-cal-allday-label">All day</div><div class="af-cal-day">…</div>…<div class="af-cal-hours"><div class="af-cal-hour-label">09:00</div><div class="af-cal-hour"><a class="af-event block" style="top: 24px; height: 46px">…</a></div>…</div></div>` | A week is a rail of 56 px and seven columns: the all-day label (10 px, uppercase, muted, at the end of its cell), then a day cell for each day, 26 px tall at least, holding that day's all-day events. `af-cal-hours` repeats the grid for the hours: an hour label (10 px, muted, tabular numerals, at the end) and seven hour cells, each `--af-cal-hour` tall (48 px when it is not set) with a line over it, except the first row's. A timed event is an `af-event block` in the hour cell it starts in, placed by the `top` and the `height` you give it, which may run past the cell. A week draws its own weekday header: `af-cal-weekdays` is the month's, seven equal columns, and a week's grid has the 56 px rail before them, so the page lays the names out on the week's columns itself. |
| `af-event` | `<a class="af-event continues" style="--af-option-color: #7c3aed"><span class="af-event-time">09:00</span>Standup</a>` | A row with 4 px between its parts, 19 px tall with a line of 17 px, 0 by 6 px of padding, a 4 px radius, 11 px text clipped at its edge. Its ground, edge and text come from `--af-option-color` (the primary when it is not set), mixed over the surface at 12% and 30%, and 75% toward the text colour for the text. `continues` squares its start edge and drops its border (the event came from the week before), `continued` does the same to its end. The time has tabular numerals at 70%. `block` is placed absolutely across its hour, 10.5 px with a tight line and 0 by 1 px of padding; put its label and time each in a `span`, which carry 4 px of padding of their own. |

```html
<div class="af-kit">
  <div class="af-card-grid">
    <article class="af-card" aria-selected="true">
      <a class="af-card-link" href="/records/inv-0042" aria-label="Open INV-0042"></a>
      <input type="checkbox" class="af-checkbox af-card-check" aria-label="Select INV-0042" checked>
      <h3 class="af-card-title">INV-0042</h3>
      <dl class="af-card-rows">
        <div class="af-card-row"><dt>Owner</dt><dd>Lan</dd></div>
        <div class="af-card-row"><dt>Amount</dt><dd>1.240</dd></div>
      </dl>
    </article>
  </div>

  <ul class="af-list" role="listbox" aria-label="Invoices" aria-activedescendant="row-1" tabindex="0">
    <li id="row-0" class="af-list-row" role="option" aria-selected="false">INV-0042</li>
    <li id="row-1" class="af-list-row" role="option" aria-selected="true" data-active>INV-0043</li>
  </ul>
</div>
```

- **The page flips the state.** A card's checkbox is yours to listen to: set `aria-selected` on the card from it. A listbox's keys are yours too: move `aria-activedescendant` and `data-active` together, and set `aria-selected` on the chosen row. A list whose rows hold their own controls is not a listbox: mark its chosen row `aria-current="true"` instead. A day's button is the cell's one stop, and a more button is another.
- **The variables** are `--af-option-color` (a board's dot and an event: any CSS colour, set in the `style` of the element or in a rule of your own) and `--af-cal-hour` (an hour of the week's grid, set on `af-cal-hours`).
- **Scrolling is the scroll area's.** The board sits in an `af-scroll-area` with `axis="horizontal"` and each column's cards in an `af-scroll-area` of their own, so the kit's scrollbars are drawn and the scroll area's `viewport` is the element that scrolls: a board has a `viewport.scrollLeft`, and a column's cards a `viewport.scrollTop`. The column shrinks its scroll area to the height you leave it. A calendar's hours scroll the same way: wrap `af-cal-hours` in a scroll area with a `max-height`. The calendar's box clips its corners with `overflow: hidden`, which does not scroll.
- **Focus and motion.** The card's link and the more button draw the kit's ring, and a day's button an inset 2 px ring in the same colour (all three an outline under forced colours, where a chosen row's bar, a chosen card's border and a chosen day's outline are drawn in the system's highlight and today's date is filled with it); the list draws a 1 px ring inside itself, and the active row, whose ground forced colours replace, a 1 px dashed outline. Reduced motion drops the card's, the checkbox's, the row's and the day button's transitions.
- **The colours** are AgentFlow's raw Tailwind ramps (neutral for text, grounds and edges, violet for a chosen card and row), which no token holds, so the kit draws them in the muted text, the foreground, the muted ground and the primary over the surface. The comparison with AgentFlow's allows the largest per-channel gap measured, on a scale of 0 to 255, in the light and in the dark: a card's title up to 14 and 5, a row's text 32 and 24 and a term 23 and 23 (painted over the card); a chosen card's border 25 and 37 and its ground 6 and 9 (painted over the card); a card's edge under the pointer 11 in the light (AgentFlow's is neutral 300, which its dark theme does not flip, so the dark is not compared); a picture's ground 9 and 1 and its icon 68 and 30; a column's ground 2 and 6, its title 55 and 31, its count 22 and 10 and its empty note 68 and 30; a dashed column's ground 1 and 4 and its title 22 and 10; a list row's text 29 and 18, its ground under the pointer 8 and 10 and a chosen row's ground 5 and 11; a day cell's ground outside the month 2 and 7, a chosen day's 2 and 3 and the tint of its button under the pointer 6 and 7; a date's text 55 and 31, an outside date's 68 and 30, the more button's text 22 and 10 and 14 and 5 under the pointer. AgentFlow tints an event from a hex colour at 12% with an edge at 40% and the hex itself for the text, where the kit mixes 12%, 30% and 75% toward the text colour, so the text stays readable on a pale colour: its ground differs by up to 3 and 6, its edge by 48 and 43 and its text by 64 and 73, each as painted over the card. The chosen row's bar is AgentFlow's violet-to-fuchsia gradient and the kit's is the primary, so only its box is compared.
- **Where the measure is not the design's number.** AgentFlow's `rounded-lg` is the radius itself and its `rounded-xl` the radius plus 4 px, so a card and a picture have the radius (10 px at the default) and a column and the calendar the radius plus 4 px (14 px), not 8 px and 12 px; its weekday names have 0.025 em of tracking and not 0.05 em; the date of a month cell is 11 px and not 12 px; and its card shadow does not grow under the pointer, since its `hover:shadow` and its `shadow-sm` are the same shadow. A day has no padding of its own: the date sits 4 px from the top and 6 px from the end, and the events are 2 px in from the sides, a pixel less at an end that has a line. The card's checkbox sits 8 px from the top, where AgentFlow's 16 px box falls in a 24 px line.
- **Not compared.** A card's link covers the card in the kit and the header alone in AgentFlow, which leaves its own controls below the header clickable; the checkbox's `z-index` follows from that. A date's `display` is a box pushed to the end by its margin in the kit and an inline box in a right-aligned line in AgentFlow, and the place and the size of the date are compared. The calendar's box, its header row and the weekday names are compared with RecordCalendar's (the radius, the padding and the tracking, not their colours, which the day cells' comparison holds); the gallery's end-to-end test holds what the comparison does not reach: the week grid and the hours.

### Filter classes

The chips that say what a list is narrowed by, the search box above it, the sidebar of facets beside it and the chip as a toggle, drawn as the AgentFlow pieces they come from are (`RecordFilterBar`'s chips and clear link, the records page's search box, `FacetSidebar`'s cards and options, `ViewPresetBar`'s chip, and `StageMoveControl`'s locked chip). Put the markup inside an `af-kit` element, like the other classes. They draw what the page sets (`aria-pressed`, `aria-disabled`, `data-zero`, `--af-option-color`) and nothing more: the page builds every chip, option and view, keeps what is on, ticked and pressed, and decides what pressing one does. The icons are yours: a class sizes the `<svg>` that is the direct child of the element it names.

| Class | Markup | Notes |
|---|---|---|
| `af-filter-chip` | `<div class="af-filter-bar"><div class="af-filter-row"><span class="af-filter-chip"><button type="button" class="af-filter-chip-edit"><span class="af-filter-chip-field">Status</span> <b>is</b> <b>Open</b></button><button type="button" class="af-filter-chip-remove" aria-label="Remove filter"><svg>…</svg></button></span><span class="af-filter-chip preset"><span class="af-filter-chip-edit">…</span></span><span class="af-filter-chip aside"><span class="af-filter-chip-edit">…</span></span><button type="button" class="af-filter-clear">Clear filters</button></div></div>` | The bar is a column with 8 px between its rows and the row wraps with 6 px between its parts. A chip is an inline row 24 px tall and at most 288 px wide, on the secondary ground in the secondary text, fully rounded, with a 1 px transparent border, 0 by 4 px by 0 by 8 px of padding, 4 px between its parts and 11.5 px text at weight 400. The edit button is bare text (it takes the chip's font and colour) on one line with an ellipsis, so a chip with a long list of values stops at 288 px and keeps its remove button whole; its `af-filter-chip-field` is at 70% and each `b` at weight 500. The remove button is a 12 px box at 60%, at full strength under the pointer. `preset` is a quick filter's chip: the primary at 8% over the surface, the primary text, 8 px of padding at the end and no remove button. `aside` is a chip set aside: a dashed edge in the line colour, no ground, muted text and 8 px at the end. In both, the text is a `span.af-filter-chip-edit`, since there is nothing to press. `af-filter-clear` is 11.5 px muted text, underlined with the line 2 px below the text and 2 px in from the start, in the foreground under the pointer. The edit button, the remove button and the clear link each take the kit's 3 px ring around themselves, and the pill does not clip it. |
| `af-search` | `<label class="af-search xs"><svg>…</svg><input type="search" class="af-input" placeholder="Search" aria-label="Search records"><button type="button" class="af-search-clear" aria-label="Clear"><svg>…</svg></button></label>` | A relative box at least 128 px wide that takes the room it is given (`flex: 1`) up to 320 px from 640 px of width up. The 14 px magnifier sits 10 px from the start, centred, in the muted colour, and lets the pointer through. The input is 32 px tall (28 px with `xs` on the label) with 32 px of padding at the start and 28 px at the end, on the surface in the light and the faint fill in the dark, and the browser's own cancel button is hidden. Its text is 12 px below 768 px of width and 14 px from there, as AgentFlow's is. `af-search-clear` is a 20 px icon button (12 px icon) 4 px from the end, centred, muted and the foreground under the pointer, and it is hidden while the input shows its placeholder (`:placeholder-shown`), so give the input a placeholder; emptying the input when it is pressed is the page's. |
| `af-facet` | `<div class="af-facet-bar"><section class="af-facet" aria-labelledby="f-title"><header class="af-facet-header"><h3 id="f-title">Status</h3><span class="af-facet-note">Approx.</span></header><af-scroll-area label="Status options"><ul class="af-facet-list"><li class="af-facet-option" data-zero><input type="checkbox" class="af-checkbox" id="f1"><span class="af-facet-dot" style="--af-option-color: #2a78d6"></span><label for="f1">Open</label><span class="af-facet-count">1.240</span></li></ul></af-scroll-area><p class="af-facet-stats">min 1 · max 9</p><button type="button" class="af-facet-more">Show more</button></section></div>` | The bar is 240 px wide, a column with 16 px between its cards. A card is on the surface with a 1 px border in the line colour, the radius less 2 px (8 px at the default) and 12 px of padding. The header is a row with space between and 8 px below it; its `h3` is 12 px at weight 500 with no margin; `af-facet-note` is 10 px, upper-case, with 0.025 em of tracking, in the warning tone. The list is a grid of 6 px with 8 px of padding at the end and no bullets, in an `af-scroll-area` that the card holds to 224 px, so a long list scrolls. An option is a row with 8 px between its parts: your checkbox, an 8 px round dot in `--af-option-color` (the muted colour when it is not set), the label, which takes the width, gives way to an ellipsis, is 12 px and shows the pointer (it names the checkbox, so give them a `for` and an `id`), and the count at 11 px, muted, with tabular numerals. `data-zero` on an option mutes its label. The stats sit 10 px below the list (6 px between the siblings and 4 px of padding), 11 px and muted. `af-facet-more` is 11 px muted text at weight 500 on 4 px of padding with a 4 px radius, 4 px below, in the foreground under the pointer, with the kit's ring. |
| `af-chip` states | `<button type="button" class="af-chip toggle compact" aria-pressed="true">All</button>`, `<button type="button" class="af-chip" aria-disabled="true" aria-describedby="why">Approve</button>` | A `button.af-chip` takes the pointer, the link's hover (the variant's hover ground and text) and the kit's ring. `toggle` is a quiet text button: 26 px tall with 0 by 10 px of padding, 6 px between its parts, 12 px at weight 500, no border, the radius less 2 px (8 px at the default), transparent in the muted colour, the muted ground and the foreground under the pointer; `aria-pressed="true"` is the primary at 8% over the surface with the primary text, and keeps them under the pointer. `compact` (on a `toggle`) is 22 px tall with 0 by 8 px of padding at 11.5 px. `aria-disabled="true"` (or `:disabled` on a button) dims a chip to 60% and shows `not-allowed`, and does not light it under the pointer; a chip locked with `aria-disabled` keeps its focus and its tooltip, as the stage-move chips do, so point `aria-describedby` at the reason. |

```html
<div class="af-kit">
  <div class="af-filter-bar">
    <label class="af-search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
      <input type="search" class="af-input" placeholder="Search" aria-label="Search records">
      <button type="button" class="af-search-clear" aria-label="Clear"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button>
    </label>
    <div class="af-filter-row">
      <span class="af-filter-chip">
        <button type="button" class="af-filter-chip-edit"><span class="af-filter-chip-field">Status</span> <b>is</b> <b>Open</b></button>
        <button type="button" class="af-filter-chip-remove" aria-label="Remove filter"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button>
      </span>
      <button type="button" class="af-filter-clear">Clear filters</button>
    </div>
  </div>

  <div role="group" aria-label="Quick filters" class="af-filter-row">
    <button type="button" class="af-chip toggle" aria-pressed="true">All</button>
    <button type="button" class="af-chip toggle" aria-pressed="false">Open</button>
  </div>
</div>
```

- **The page flips the state.** The kit does not filter, search or tick. Empty the input from the clear button's `click` (and put the caret back in it); take a chip off from its remove button's; set `aria-pressed` on a toggle from its `click`; and keep `data-zero` in step with the counts you load.
- **The variables** are `--af-option-color` (a facet's dot: any CSS colour, set in the `style` of the dot or in a rule of your own).
- **Scrolling is the scroll area's.** The facet's list is an `af-scroll-area` whose holder, the card, bounds it to 224 px through its `max-height`, so the kit's scrollbars are drawn and its `viewport` is the element that scrolls. Eight options fit and nothing scrolls; fourteen do not.
- **Focus and motion.** Every button here draws the kit's ring (a 2 px outline under forced colours, where a filter chip keeps an edge in the system's text colour, an unpressed toggle gets a 1 px outline and a pressed one is filled with the system's highlight). A toggle's change of ground and colour fades over 100 ms, and reduced motion drops it.
- **The colours** are AgentFlow's raw Tailwind ramps (violet for a quick filter's chip and a pressed toggle, neutral for the rest, amber for the note), which no token holds, so the kit draws them in the primary mixed into the surface, the muted text and the foreground, and the warning tone. The comparison with AgentFlow's allows the largest per-channel gap measured, on a scale of 0 to 255, in the light and in the dark: a quick filter's ground 4 and 15 and its text 72 and 90 (and a pressed toggle's the same); a set-aside chip's text, the clear link's and a count's 22 and 10, the clear link's under the pointer 14 and 5; the magnifier, the stats and the label of an option with no records 68 and 30; and an unpressed toggle's ground under the pointer 9 and 1 and its text 14 and 5. The amber note equals the warning tone in every look.
- **Where the measure is not the design's number.** AgentFlow's `rounded-md` computes to the radius less 2 px, so a facet card and a toggle chip are 8 px at the default radius, not 6 px; its note has `tracking-wide`, which is 0.025 em and not 0.05 em; its locked chip is at 60% and not 50%; the stats sit below the list by the 6 px between siblings and 4 px of padding, not 4 px alone; and the search input's text is 14 px with a line of 20 px from 768 px of width up, because its `md:text-sm` is not overridden by its `text-[12px]`, and 12 px below it. The search box takes the room it is given up to 320 px, as the records page's does, where the design gives only the 128 px least.
- **Not compared.** The kit's end padding on the search input (28 px against AgentFlow's 12 px) is the clear button's lane, which AgentFlow has no button for. The cursor of a button is the pointer here, where AgentFlow's plain buttons keep Tailwind's default arrow (the remove button, the clear link and the toggle chips), and the remove button is a flex box where AgentFlow's is a block. A chip's text is a button in the kit and a span in AgentFlow, which has nothing to edit, so the comparison holds the text and where it sits, not its cursor. AgentFlow spaces cards, options and the stats with margins and the kit with a gap or a grid, so their `display`, `row-gap` and margins are not compared; where each part sits is. The locked chip has the kit's own chip look, so only its dimming and cursor are held against StageMoveControl's.

### Drawing a tile

`af-tile` draws a tile from what a module already holds: the tile it asked for, the answer, and the fields of the tile's entity. It never fetches. What it keeps of its own is small: which series the legend isolated, which mark holds the tab stop, the emphasis the legend gives a series, the tooltip, and whether the table is showing (that one outlasts a change of `spec`). A text tile needs only its `spec`.

```ts
import { computeTiles, getAppObjects, ok, type ComputeTile } from '@reflexify/agentflow-sdk';
import '@reflexify/agentflow-elements/kit';

const tiles = {
  revenue: { kind: 'number', label: 'Revenue', query: { entity: 'deal', measures: [{ key: 'total', fn: 'sum', field: 'amount', primary: true }] } },
} satisfies Record<string, ComputeTile>;

const objects = getAppObjects(host.api);
await objects.load();
const entity_id = objects.id('entity:deal')!;
const [results, entity] = await Promise.all([
  computeTiles(host.api, tiles),
  ok(host.api.GET('/entities/{entity_id}', { params: { path: { entity_id } } })),
]);

const tile = document.createElement('af-tile') as HTMLElement & Record<string, unknown>;
Object.assign(tile, { spec: tiles.revenue, result: results.revenue, fields: entity.fields, drill: true });
tile.addEventListener('af-drill', (e) => showRecords((e as CustomEvent).detail));
root.append(tile);
```

- **`spec`** is the tile, as a dashboard file writes it (`TileSpec`) or as `computeTiles` takes it (`ComputeTile`, an entity or a measure named by key). **`result`** is what answered it: a `TileResult`, or the `ComputedTile` `computeTiles` returns under the tile's name. The element reads each measure's result by its `key`, then by its `id`, so both shapes draw. While either is missing the tile shows a skeleton and `Loading…`; a text tile, which holds its Markdown in `spec.body`, draws without a `result`.
- **`fields`** are the fields of the tile's entity, `fields` of `GET /entities/{entity_id}`. They give the labels, the number formats (a currency, a percent, a duration), the option labels and option colours. Through an app's token the answer holds only the fields the app's ceiling admits. With no `fields` (`null`) nothing fails: a value is a plain number, a label is the field's key, and a split is coloured by appearance. A field reached through a relationship is not among the entity's own fields, so it is named by its key too.
- **`rows`** and **`columns`** are a list tile's records and the columns it shows, and are properties only. A row is a record as `POST /entities/{entity_id}/records/query` returns it (`id`, `entity_id`, `body`, and `ref_labels`, `file_labels` and `file_counts` when the response has them); a column is `{key, label}`, a field's key and the heading over it. The element reads no `ListTileSource`: `computeTiles` reads a list tile's first page and returns it as `rows` beside `columns`, the view's columns the reader may read, and the module passes both as they are. While either is unset (`null` or `undefined`) the tile shows `Loading…`, as it does for a missing `spec` or `result`; an empty `rows` is an answer, and the tile says `No records match this view.`
- **`paging`** is a list tile's pager, and is a property only: set it as one, as `rows` and `columns` are. It is `{prev, next, busy?}`, `prev` and `next` saying whether a page lies before or after the `rows` shown, and `busy` true while the module reads another. Unset (`null`), there is no pager. The element reads no cursor and fetches nothing: a press of Previous or Next sends `af-page` with `detail` `{direction: 'prev' | 'next'}`, and the module reads that page, then sets new `rows` and `paging`. `computeTiles` gives the cursor after a list tile's first page as `next_cursor`, with `null` meaning `rows` is the last page. A button is disabled when its direction has no page and while `busy`, and a disabled button sends nothing. The pager is drawn under a list whether its `rows` are empty or not, so a reader on an empty page can still go back, and under neither the loading skeleton, nor a failed or unavailable tile, nor a view none of whose columns the reader may read. The event bubbles and is not composed.
- **`table`** is a chart's choice of table or plot, and is a property only: set it as one. `true` shows the table and `false` the plot, and either way the tile draws no `table-toggle`, so the host draws the control and keeps the choice; AgentFlow's dashboard does this in its card's header. Unset (`null`), the tile draws its own toggle and keeps the choice. The element also observes a `table` attribute, and reads it by presence as `drill` is read, so `table="false"` is true; do not write the attribute. A tile that is not a chart with buckets ignores it.
- **`drill`** (Boolean attribute, off by default) lets a number's value, a chart's marks and a list's rows open what is behind them. `af-drill` has `detail` `{drill, measure, bucket, segment, label, count, other, newTab}`: `drill` is the records' address, an `EntityRecordFilters` that `POST /entities/{entity_id}/records/query` takes as its `filter`; `measure` is the measure's key, or its id when it has none; `bucket` is the bucket's key and `segment` the stack segment's key, both `null` for a number, and `segment` `null` unless the chart is stacked; `label` is the word for the mark (the measure's label for a number, the bucket's label for a chart mark, `<bucket> · <segment>` for a segment); `count` is how many records it covers; `other` is true for the remainder fold; `newTab` is true for a middle click and for a click with Ctrl, Meta or Shift held, as a link is opened in a new tab, and false for a plain click; a middle press starts no autoscroll. Enter or Space with Ctrl, Meta or Shift held sends true too: on a chart mark the element reads the held key, and on a native button (the number's value, and the button in a list row's first cell) the browser turns Enter or Space into a click that carries it. The event bubbles and is not composed. It is sent only when the result names the records behind the mark. With `drill` off, or when the tile sets `drill_disabled`, a mark is `role="img"` and sends nothing; with `drill` on, a mark whose records are not named is `aria-disabled="true"` and sends nothing. The element opens nothing itself: what the module does with a drill is its own screen. A list row sends `af-open-record` with `detail` `{record, entity, newTab}`, the row's record id and its entity id and the same `newTab`, only with `drill` and only for a row that has both ids; a row without them is drawn and is not a control. The element opens no tab itself: a module that sees `newTab` opens the record in one. The event bubbles and is not composed.
- **`locale`** and **`strings`** work as on every kit element. The tile's own words are the `tile…` strings, in English and Vietnamese.

What it draws:

- **A number tile** draws `figure`: the primary measure's `value` (and its `label` when the tile has several), `meta`, `goal`, `comparison`, in that order, then up to three more measures as `secondary` blocks with the same parts and no goal. A value is text in the text colour, never tinted by a measure's colour. `meta` is the record count with what the server cut off: `at least` or `at most` after the count, or `a sample of the first N records`; a capped result that names no cap says `incomplete — no bound`. `goal` carries `data-tone` as `short`, `over`, `met` or `none` (a goal over a value that is missing: the target alone, with no distance), drawn in text colours whatever the tone. A number over no records still draws its figure, because zero is a value: a count is `0` over `0 records`, and an average is `—` with `No value over this population`. With `drill`, the primary's `value` is a `<button>` that sends `af-drill` on a click, Enter or Space; its `title` is `Click to open N records`. Without `drill` it is text. `notes` lists, under the figure, what a reader must know about the numbers (a filter that did not apply, withheld records), one to a line.
- **A bar, column or line chart** draws its marks in `plot`, taking the width of its box and the height it is given. Its natural height, the one it takes when its host sets none, is 240 px; a bar chart's is 28 px a bucket and 40 over, and at least 160 px. In a shorter cell the plot is squeezed down to a floor of 64 px, or for a bar chart 16 px a bucket and 24 over when that is more, so a short card still shows its axes, its legend and every bar; anything more than the frame holds scrolls inside the frame, in the browser's own scroller drawn thin in the kit's line colour (the kit's scroller on every tile cost Safari seconds on a page of forty). The value axis keeps up with the plot: it has one label for each 20 px of the plot's height at most, and never fewer than two (zero and the top), so a short column or line chart reads two or three round numbers where a tall one reads five. A chart with no buckets, or over no records, says `No buckets over these records` in `state`. A chart over a capped count says so in `notes` (`Counted up to N records: each figure is at least what is shown`).
- **The marks.** A bucket that is `$other` or `$restricted` is hatched, a period with no records is a dashed outline, and a bucket with no value draws nothing. An unstacked chart with an earlier period draws it beside the primary series, as a lighter bar or line; a target is a short rule across the bucket in a bar or column chart, and a dashed line in a line chart. A line chart draws a line and a dot for each series, a heavier line across the plot at zero when its axis runs from below zero to above it (`zero`), with a gap where a value is missing (never a zero), a ring for a period with no records, and, when two to four series are showing, each series' name at the end of its line. A bar or column chart has no direct labels but a derived figure's (below): its legend, its tooltip and its table say what each colour is. Colours come from `--af-chart-*`, read as `--k-chart-*` with AgentFlow's palette as the fallback, and hiding a series never changes another's colour.
- **A pie or donut chart** draws the primary measure alone, as the platform's pie does: `stack_by` and the other measures are ignored, and the target, the earlier period and a derived figure show in the tooltip and the table only. Each bucket is a `slice`, clockwise from 12 o'clock in the server's order (the kept values, then `(Other)`, then `(Restricted)`), never sorted by size, and coloured by its identity, so a stage keeps its colour; `(Other)` and `(Restricted)` are hatched. A bucket whose value is not above zero, or that is a period with no records, has no slice and keeps its row in the table. A slice's share is its value over the sum of the slices drawn, which is the fraction its angle shows, and the table has a `share` column. Slices carry no labels, because labels around a small pie collide and get clipped: `legend` holds an item for each slice with its name, its value and its share. That legend is not a toggle, since hiding a slice would redraw the pie as shares of another whole. A donut is the same chart with a hole. In the keyboard reading Left, Right, Up and Down all step through the slices. The platform labels its slices by name around the pie; the element does not.
- **Small multiples.** A chart whose measures are in more than one unit (a count and a sum) is drawn as one panel for each unit, one above the other, and never on a second axis. The primary measure's panel is first. Every panel has the primary's buckets in the same places, so a bucket lines up from one panel to the next, and each has a scale of its own and its unit named above it (a currency's code, else the word for the unit). The earlier period, the target and a derived figure belong to the primary, so they are drawn in its panel only, and the end-of-line series names of a line chart are left to the legend. A panel's natural height is 160 px (a bar chart's, 28 px a bucket and 40 over, and at least 120), and in a shorter cell it is squeezed to the floor of a single chart's plot, 64 px, or 16 px a bucket and 24 over for a bar chart, and each panel's value axis follows the same label rule at its own height. Each panel is a tab stop of its own, and Tab moves to the next. The legend names every series and does not isolate one, since isolating a series would blank whole panels; the table is one table for every panel.
- **A derived figure** (`transform.derive`) is drawn beside the series it belongs to, and is also in the tooltip, in the table as a column, and in a note under the chart that names it. A share is written as `value · share` past each bar's end and above each column. A formula is written the same way as `value · figure`, on a bar or column chart in one panel; on a line, or across several panels, it is in the tooltip, the table and the note only. A rank is written as `#n ` before each category label of a bar or column chart, and a tie shows the same number. A running total is a solid line on the same axis, through a dot for each bucket (hollow for a period with no records) on a bar or column chart, and a line without dots on a line chart; the target's line is dashed. A bucket with no figure draws none. On a pie whose derive is a share, the derived figure is headed `Share of the buckets shown`, to tell it from the slice's own share. A column chart whose figure labels would be wider than their buckets writes the figure alone (`0.92`, not `$120,000 · 0.92`): the value is on the axis, in the tooltip and in the table. A derive kind this version does not know is not drawn.
- **`verdict`** is a line under a chart, above its notes, that says whether the buckets add up to the whole, from the `verdict` the server sends with the result. It holds an icon and the words, with `data-verdict` (`partitions`, `fans_out`, `overlaps` or `not_applicable`) and `data-tone` (`ok`, `warning` or `info`); only the `fans_out` warning icon takes `--k-warning`, and the words stay in the text colour. The words are the platform's, so a pie and a line chart say `Bars add up to {total}` as well, and a stacked chart (`stack_by`) says `Segments add up to each bar; bars add up to {total}`. It shows under a chart with no buckets too.
- **A text tile** draws `spec.body` as Markdown in `prose`, with no result and no editor. The body is parsed with `marked`, the parser the kit's editor uses, and drawn from a closed set of elements, so no raw HTML is ever live: `<b>x</b>` and `<a href=…>` are shown as the text they are, as are `<img>` and `<script>`. It follows the platform's own rules: GFM (tables, task lists, strikethrough), a single newline is a line break, an image is its alt text and is never requested, and a link is kept only for the schemes `http`, `https`, `irc`, `ircs`, `mailto` and `xmpp` (any other, `tel:` included, draws as its text), opening in a new tab with `rel="noreferrer"`. Character references (`&amp;`, `&#58;`, and a short list of named ones) are decoded. A body is read as Markdown up to its first 20,000 characters, cut at a line end; the rest is drawn as one plain block with its line breaks. A table of more than 2,000 cells (10,000 over the whole body) is not read as a table, and its lines are read as a paragraph; nesting past 24 levels is shown as typed. A table is a scrolling region that is a tab stop while it is wider than the tile and holds no link, with its words kept whole; a code block scrolls the same way.
- **A list tile** draws `list`: a `<table>` with a column heading for each of `columns` and a row for each of `rows`, in the order given, in a scrolling region that is a tab stop while the table is wider or taller than the tile and its rows hold no buttons (with `drill`, Tab reaches each row's button instead). A cell is worded by its field's type as the platform's record value words it, and draws what the type calls for:
  - an **option** is a `badge`, one for each option a multi-select holds, tinted in the option's colour over the page's own surface and ink, so one rule serves light and dark; an option with no colour is neutral, except a stored value that is a legacy status name (`approved`, `active`, `draft`, `pending`, `suspended`, `inactive`), which takes the tint the record browser gives it;
  - a **boolean** is a check mark for `Yes` and a dash for `No`, each named for a screen reader;
  - a **number** is its figure in its format, and a number field that has a bar also draws a track filled to the value on a scale of 0 to 100, in the colour of the first band the value reaches; a rating is its stars and never a bar;
  - a **reference** is a neutral `ref` chip with the name the server resolved in `ref_labels` (a field that holds several draws a chip for each), and its id as typed text when the server named none. It carries none of the record browser's per-entity glyph or accent, which the kit cannot read;
  - a **file** is a `file` chip with the first file's name from `file_labels` and `+N` beside it for the rest (`file_counts` says how many); a name the server withheld reads `File unavailable`;
  - **text that holds a mention** is its words around a `mention` chip, as the editor draws it: a person with an initial, a record with its icon (`mention-icon`), and a deleted one still with its name. The row's `mentions` say what this reader may see, so a mention the response does not resolve reads `Restricted person` or `Restricted record` and shows nothing of who or what it is. A chip is never a link, because it sits in a row that opens its record;
  - a date is a day and a datetime a moment in the locale, a list field is `3 items`, an auto-number is a number (`1,234`), and a value that is missing or formats to nothing is `—`.

  Whatever a cell draws, it keeps its words: they name the row's button and are what a reader of the table is told. With `paging` set, `pager` is a `<nav>` under the table, named by the tile's title, holding two buttons, `Previous` and `Next`; it has `aria-busy="true"` while `paging.busy` is true. Without `paging` there is no pager, and the tile shows the rows it is given. `notes` sits under the table and the pager and says what a page's filter did to the list, as it does under a figure: a filter the entity has no field for, a tile that does not follow the filter, a filter that left no record, and records withheld from the reader. An empty `columns`, which is a view none of whose columns the reader may read, says `None of this view's columns can be shown to you.` in `state` and draws no table and no pager. A record that appears twice in `rows` is drawn once, as it first came. With `drill`, a click on a row sends `af-open-record`, and the first cell holds a `<button>` named by the cell's text (`Open <heading>` when the cell is `—`), so Enter and Space send the same event; without `drill` the rows are text.
- **`head`** is the row above the figure that holds `title` and `table-toggle`; a host that draws its own title and toggle hides it.
- **`table-toggle`** is a plain button whose label says what a press shows next (`Show as table`, then `Show as chart`). It is not drawn when the host sets `table`. It swaps `plot` for `table`: the same figures, one row to a bucket, with a pie's share, the earlier period, its difference, a derived figure and the target as columns, and one column for each series of each panel. The table sits in a scrolling region that takes the tab stop when the table is wider than the tile, so a keyboard can scroll it, and stays out of the tab order when it fits; the region and the table's caption carry the tile's title, or the split field's name when it has none.
- **`legend`** is drawn when the chart has two or more things to name. With two or more series, each is a button that shows that series alone, and pressing it again shows every series. Its accessible name is always `Show only <series>`, with `aria-pressed` while it is alone and `Show every series` as its `title` then. Pointing at or focusing one fades the others to a quarter, over 120 ms, and not at all under `prefers-reduced-motion: reduce`. A lone series is text, not a button, and the earlier period, the target and a period with no records are plain items beside the series. The legend stays in the table view, and a series it hid is left out of the table. A pie's legend and small multiples' legend are not toggles (above).
- **`tooltip`** is the tile's own layer, in the top layer, so no container clips it. It follows the pointer from bucket to bucket, and shows at a mark when it takes focus: the bucket's label, a row for each series showing, the target, the earlier period and its change, a stack's bar total, and what a click opens. A line chart also draws a crosshair at the bucket.
- **The keyboard.** The marks are `role="button"` (`role="img"` when the tile opens no records) behind one tab stop in `plot`, each with its summary as its `aria-label` (a period with no records is spoken as `<bucket>, <series>: no records (filled)`). In a column or line chart Left and Right move between buckets and Up and Down between series; in a bar chart it is the other way round. Home and End go to the first and last bucket, a bucket with no mark for the series is skipped, and nothing wraps. A mark reads its own label when it takes focus, and nothing repeats it in a live region. With `drill`, Enter, Space or a click on a mark sends `af-drill`; a click on a bucket beside its marks opens the first series showing that has records to open, and opens nothing in a stack or for a period with no records. A focus ring shows for keyboard focus only: a click leaves none.
- **A new `result`** replaces the marks, hides the tooltip, and moves the tab stop to a mark that still exists. A series that was alone stays alone if the new result still has it, and a series that arrives is hidden with the rest; if it is gone, every series shows again. Set a new `result` on the same element, and keep the current one until it arrives: a `null` `result` unmounts the chart, and with it the isolation, the tab stop and the tooltip.
- **`state`** says why there is no figure: `Not available to you` for a tile over records the caller cannot list, the problem's title and detail for a tile the server could not compute, `This tile cannot be drawn here yet` for what this version does not draw, and `This tile could not be loaded. Reload the page to try again.` when the tile's drawing code (the `tile-view` chunk, below) could not be fetched, which the tile reports in place of the skeleton it was showing rather than waiting for ever. The skeleton is the same frame, with the tile's title, that the figure then fills, so the card does not change height when the code arrives.

Not drawn: a chart type or a tile kind the element does not know (a map, say), and a `transform.derive` kind it does not know, which a newer server may send. Each says so in `state` and draws no picture rather than a wrong one.

**Size.** Its drawing code (d3's scales and shapes, the geometry, the views) is the `tile-view` chunk, loaded when the first `af-tile` is connected to the page, whether or not it holds a `spec` and a `result` yet; `kit.js` holds only the shell, so a page that creates no `af-tile` never fetches it. `kit.js` and the chunks it reaches statically, which every page loads, weigh 246,780 bytes gzipped with the kit drawn in AgentFlow's look, the form elements, the scroll area, the tabs, the splitter, the pager, the dialog's side panel, the menu's groups, headings, checkbox and radio items, the copy button, the Markdown view's element, the state and piece classes, the table classes, the page structure classes, the view classes and the filter classes in, against a guard of 8,000 more. The `tile-view` chunk weighs 68,885 bytes gzipped with the Markdown parser it reaches, against a guard of 90,000; the `markdown-view` chunk, which shares that parser, weighs 21,264 bytes gzipped with it, and is reached only by `import()`, so the parser is never in what every page loads. `kit.js` itself is 772,682 bytes raw, against a guard of 872,682. The two guards are there to catch an accident, such as a charting library or the editor coming in by mistake, and are not a budget (a change that adds weight on purpose re-measures the baseline in the same commit); neither the eager code nor the tile's or the Markdown view's chunk holds ProseMirror. `test/bundle.test.ts` holds all three.

### The kit's contract

The kit's public contract is its twenty-seven tags, the properties, attributes and methods in the table above, the events and their `detail`, the parts, `data-raised` on the host, the `--af-*` tokens, the CSS classes, the `kitVersion` stamp, and the `./kit` entry's exports (`defineKitElements`, `KIT_TAGS`, `KIT_CSS`, `KIT_VERSION`, `loadFonts` and the types). Shadow markup, ids, classes inside the shadow root and the `editor` property are not. It changes only additively, for the reason in [Registration](#the-ui-kit).

`test/contract/kit.test.ts` holds a build to it, as `test/contract/contract.test.ts` does for the six elements. It loads the built `dist/kit.js` and touches only that surface. It checks that the twenty-seven tags register, idempotently, with their `kitVersion`; that every attribute in the table is observed and every property and method exists before the element connects; that a Boolean attribute is read by its presence; every event with its exact `detail`, `bubbles: true` and `composed: false`; `data-raised` on the host; every part, each in a state that shows it; and every class `af-field`, `af-fieldset` and `af-form` draw.

### The gallery and the showcase

Two pages check the kit in a browser, and they check different things. The gallery runs in CI, in the `kit-e2e` workflow, on a pull request that changes kit or SDK source (it is not on every pull request) and nightly on `main`; the showcase does not. Both are part of the manual gate on a kit change ([The UI kit](#the-ui-kit)).

**The gallery** checks each element on its own. `pnpm gallery` (from this package) serves `http://localhost:5182/gallery/` (the environment variable `KIT_GALLERY_PORT` overrides 5182, for the gallery and for `pnpm e2e` alike): every kit element, once in a light English pane and once in a dark Vietnamese one, each inside a shadow root nested in another, as in a module. The form elements are there too: `af-number-input` plain, as a currency, as a percent, fractional, as an unscaled percent and as a fractional price on which the gallery's check types text it refuses; `af-select` single, multiple and empty; `af-combobox` over a list and over a source of two hundred places served twenty at a time after 300 ms; `af-person-picker` over a source of two hundred people served the same way; `af-tree-picker` over three regions, each with two offices and an archived one, single and multiple with `max="2"`; `af-date range`; `af-date` in each preset `format` (`DD/MM/YYYY`, `DD-MM-YYYY`, `DD.MM.YYYY` and `YYYY-MM-DD`); a section of `af-field`s in an `af-fieldset`; a plain `<form>` holding `af-date` and `af-person-picker`; and an `af-form` holding a multiple `af-combobox`, whose save takes a second and a half and answers with three errors. A short scrolling column holds the anchored overlays, to show they are not clipped. An `af-tabs` holds three tabs, one locked with a reason, over their panels. An `af-splitter` 600 px wide holds a list in each pane. An `af-pager` pages a list of two hundred rows with sizes of 25, 50 and 100, and another in `more` mode adds twenty rows to its list on each press, with `focus-new`. An `af-copy-button` copies an invoice number. A list of eight rows in a scroll area has a checkbox each, bound to an `af-bulk-bar` with five actions, two of them wide, so its overflow menu shows at the gallery's width. An `af-file-upload` takes images and PDFs, up to three, and holds two files, one of them uploading; a file it is given shows as uploading and is done a moment later. An `af-signature-pad` 288 px tall takes a signature, and a read-only one shows a drawn one. An `af-folder-source` over made-up sources uploads what it is given a file every 150 ms, lists two watched folders with six folders inside served three at a time, and previews a launch with seven left-out reasons. An `af-markdown` draws the editor's notes with a table, a task list and a mention. An `af-table` in a 240 px `af-scroll-area` holds three groups (the second collapsed, the third declared empty) under a sticky header row, with a sort header in each state, a number column, a selected row and toned ones. An `af-scroll-area` 200 px tall holds fifty rows under a sticky heading, and a button builds, on demand, a board of forty columns of sixty skeleton cards, each column a scroll area inside a horizontal one, whose frame times `pnpm e2e` measures while the wheel scrolls it. The classes have blocks of their own: the display classes, which also hold the empty states, an error with its trace in a scroll area, a repeating group of fields, the file chips and the grouped table; the page structure classes (a breadcrumb, two disclosures, a field list, stats, two timelines and steps); the view classes (a toolbar, cards, a list, a board, a month and a week of events); and the filter classes (a bar of chips, two search boxes, two facets, and the chip as a toggle and as a locked control). Below them, `af-tile` draws each named case of `test/kit/fixtures/tiles.ts` (a number with a goal, a capped one, one with secondaries, a stacked column, grouped bars at two widths, a line, a pie and a donut, small multiples, a share, a running total, a rank and a formula, a chart that fans out, a text tile, a list, and a tile that is unavailable, failed or loading) with `drill` on, and every `af-drill` and `af-open-record` is recorded in `window.galleryEvents`. Its checks for the new elements: a person picker over a source pages and names a chosen person; a tree picker opens the branches a search matches and picks with the keyboard; a bulk bar appears without taking focus, in the top layer over the page, moves its last actions into its menu, and clears on Escape; a file upload takes a chosen file and refuses a fourth; and a signature pad draws a stroke, reports a PNG at twice the pad's size and keeps the stroke through a resize. `pnpm e2e` runs `e2e/gallery.spec.ts` against it in Chromium and WebKit (`pnpm exec playwright install chromium webkit` once; WebKit on Linux also needs the system libraries `playwright install-deps` lists), and in Firefox, which is opt-in: `pnpm exec playwright install firefox` once, then `KIT_FIREFOX=1 pnpm e2e --project=firefox`. There it runs only the checks that name sticky positioning (the header row, a group's header and the first column of a sticky table stay in view, and a row scrolling under a group header does not paint over it), the one thing the kit relies on that Firefox might draw differently. The tests run in jsdom, which has no layout, so only the gallery shows how a tile really looks.

**The showcase** checks them together, in a real module inside AgentFlow. `examples/kit-showcase` (`acme/kit-showcase`) is an app package whose only content is a UI module: one page with every element and class of the kit on made-up data, in six sections (Overlays, Pickers, Structure, Pages, A form and Display), using the wrappers the UI module skill teaches (`src/module/kit.tsx`) and, in `src/module/FormSection.tsx`, a form built from `af-form`, `af-fieldset`, `af-field` and every input. Structure (`src/module/Structure.tsx`) lays a screen out with the elements: a scroll area, tabs over three panels, a splitter whose size the module keeps across visits, a pager bound to one `cursorList`, a copy button and Markdown notes whose mention shows the name the map resolves. Pages (`src/module/Pages.tsx`) draws a page with the classes: the empty states and the error, a repeating group of fields, a grouped table with sticky rows that raises a bulk bar while rows are ticked, the page structure classes, a board, a calendar, the file chips and the filter classes. Pickers (`src/module/Pickers.tsx`) has a person picker over a slow source and a tree picker over units, and the form adds a file upload, whose made-up upload the module runs, and a signature pad whose last stroke the module keeps in a hidden field the form sends. Pickers also holds a folder source over made-up sources, whose upload and preview the module pretends. `frontend/e2e/kit-showcase.spec.ts` drives it in AgentFlow, in Chromium and WebKit, and checks what the gallery cannot: that the module runs on AgentFlow's copy of each tag, that its overlays rise above AgentFlow's page from inside the module's shadow root, and that the `<form>` in its shadow root collects the kit controls' values, with a check for what each structure element and page class does inside AgentFlow (the side panel docks at AgentFlow's right edge, the splitter reports a drag, the grouped table's header row, a group's header and first column stay in view, the person picker lists people from the module's source, the tree picker finds a unit under its branch, the file upload hands the module a chosen file, a stroke on the signature pad reaches the form, and the bulk bar rises above AgentFlow's page and clears on Escape). The checks for the pickers, the bulk bar, the file upload and the signature pad, like the parity pairs for the same elements, have been run in Chromium only: Playwright's WebKit does not launch on the machine they were written on, so their WebKit run is still to be made. When the kit gains an element or a mode, add it to the showcase and check one behaviour of it in the spec.

- **Open it alone** on the standalone host with `pnpm --filter kit-showcase demo` from `sdk/`, at `http://localhost:5175/module.html`, following the browser's colour scheme and language.
- **Open it in AgentFlow, with no backend.** Build it with `pnpm --dir sdk --filter kit-showcase build` from the repository root. On a fresh checkout run `pnpm --dir sdk build` first: the showcase bundles the built SDK and kit, and builds with the SDK's app builder, which the filtered build does not build. The built `package/ui/` is not committed (git ignores it, as it does the case desk's). The frontend's `predev` copies it into `public/mock-modules/` when Playwright starts the dev server, or when you run `pnpm dev`, and AgentFlow's mocked API serves it as the app `kit-showcase`, at `http://localhost:4000/apps/kit-showcase`. With a dev server already running, run `node scripts/sync-kit-showcase.mjs` from `frontend/` after a build. Its manifest declares `ui.contract: 1`.
- **Run the spec** from `frontend/` with `pnpm exec playwright test e2e/kit-showcase.spec.ts --project=chromium`, and again with `--project=webkit`. When the built files are missing it fails, naming the build command, and never skips.

## Development

From `sdk/`:

```bash
pnpm build       # first: jsx.d.ts reads dist/, and test/contract/ loads dist/agentflow-elements.js and dist/kit.js
pnpm typecheck
pnpm test
```

Without a build, the contract suite and the bundle check skip locally. In CI, where `CI` is set, a missing bundle fails the contract suite instead.
