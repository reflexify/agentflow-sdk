# @reflexify/agentflow-elements

The user guide on your deployment explains how to build, seal and deploy an app: `<AGENTFLOW_URL>/guides/en/xay-dung-ung-dung/tong-quan` (Vietnamese: `<AGENTFLOW_URL>/guides/xay-dung-ung-dung/tong-quan`).

Five web components that put AgentFlow work inside an installed app's own pages: a task inbox, a workflow task you can claim and submit, an entity's records, and a form that starts a workflow. They work in any framework, or in none.

The elements talk to AgentFlow only through the proxy of [`@reflexify/agentflow-sdk/server`](../agentflow-sdk/README.md), so mount `createAgentFlowServer` at `basePath` (default `/agentflow`) first. Each element is a custom element with an open shadow root. Its styles are its own and it registers no other tags, so it neither leaks CSS into your page nor clashes with your components.

ESM only. The package is `"private": true` for now.

The package also ships a separate UI kit: nine general-purpose elements (dialog, confirm, menu, popover, tooltip, toast, date, person picker, rich editor) and a CSS layer, for an app module's own screens. See [The UI kit](#the-ui-kit).

## Loading it

Pick one of three ways:

1. **In a bundled app**, import the package once, at the top of your entry module. The import registers the five tags:

   ```ts
   import '@reflexify/agentflow-elements';
   ```

2. **In a plain page**, load the bundle as a module script. `dist/agentflow-elements.js` is one ES module with no bare imports; serve it from anywhere on your origin.

   ```html
   <script type="module" src="/assets/agentflow-elements.js"></script>
   ```

3. **In React 19**, add the JSX typings as well as the import. They type the attributes, the property-only `strings`, `filter` and `fetchImpl`, and the events, and make `entity-id` and `record-id` required on the task detail, and `entity-id` on the record table. The camelCase properties that mirror attributes, such as `recordId`, are not typed: write the attribute.

   ```ts
   import '@reflexify/agentflow-elements';
   import type {} from '@reflexify/agentflow-elements/jsx';
   ```

Register the tags before your first render, which a top-level import does. React 19 sets a prop as a property only when the element already has it, so on a tag that isn't defined yet, `strings`, `filter` and `fetchImpl` would arrive as attributes and be ignored.

`defineAgentFlowElements()` registers the tags and skips any tag already defined. A second copy of the bundle on the page therefore does not throw, and the first copy's definitions stay in use.

## The elements

Attributes are kebab-case, and the matching properties are camelCase. "Property only" means there is no attribute, because the value is not a string.

| Tag | Attributes / properties | Events (`detail`) | Parts |
|---|---|---|---|
| `agentflow-provider` | `base-path` (default `/agentflow`), `locale` (`en` or `vi`), `strings` (property only, a partial string map), `fetchImpl` (property only, default `globalThis.fetch`) | `session-ready` `{caller}`, `signed-out` `{}`, `access-lost` `{code}`, `request-failed` `{code, status, detail, requestId}` | none (it renders its children through `<slot>`) |
| `agentflow-task-inbox` | `view` (`all`, `mine` or `claimable`; default `all`), `page-size` (default 25) | `task-select` `{recordId, entityId}` | `table`, `row`, `empty`, `error`, `load-more` |
| `agentflow-task-detail` | `entity-id` (required), `record-id` (required) | `task-claimed` `{recordId, entityId}`, `task-released` `{recordId, entityId}`, `task-submitted` `{recordId, entityId, actionId}` | `header`, `title`, `meta`, `notice`, `form`, `field`, `label`, `input`, `field-error`, `actions`, `button`, `error` |
| `agentflow-record-table` | `entity-id` (required), `columns` (a comma list of field keys; default: the first five non-system fields), `page-size` (default 25), `filter` (property only, an `EntityRecordFilters` object; when set, the list uses `POST …/records/query`) | `record-select` `{recordId}`, `record-created` `{recordId}` | `toolbar`, `search`, `create-button`, `table`, `row`, `cell`, `empty`, `error`, `load-more`, `form`, `field`, `label`, `input`, `field-error`, `notice`, `actions`, `button` |
| `agentflow-start-form` | `workflow-id` (optional; without it, a picker lists the startable workflows) | `workflow-started` `{instanceId, workflowId}` | `picker`, `form`, `field`, `label`, `input`, `field-error`, `notice`, `actions`, `button`, `error` |

Every event is a `CustomEvent` that bubbles and is `composed`, so you can listen on the element, on the provider or on `document`. The `detail` types (`TaskSelectDetail`, `WorkflowStartedDetail` and so on) are exported from the package.

The other elements must sit inside an `<agentflow-provider>`, at any depth, and render nothing until its session is ready. Once the session ends or access is lost, they show nothing again.

### Provider

- On connect, it creates the API client for `{origin}{base-path}/api`, answers its descendants' context requests and calls `GET /caller`. It reads `base-path` and `fetchImpl` once, at connect.
- `base-path` must be a path on your origin: one leading `/`, not two, that still names your origin once the browser resolves it. Trailing slashes are dropped, and `/` means the origin itself. Anything else, such as `@other.example` or `//other.example`, would send every call to another host, so the provider uses `/agentflow` instead and logs one console warning.
- It mirrors its state in `data-state` on the element: `loading`, then `ready`, `signed-out`, `access-lost` or `error`. The attribute is set before the event that announces the change, so a listener reads the new state. A listener added late can read it instead of waiting for an event that has already fired.
- The outcomes:
  - `200` → `ready`, and `session-ready` with the caller.
  - Any `401` → `signed-out`.
  - `403` `APP_NOT_ASSIGNED`, `APP_NOT_INSTALLED` or `USER_NOT_PROJECTED` → `access-lost` with that code.
  - Anything else → `error`, and `request-failed`.
- Every element hands its failures to the provider, which maps them the same way. A `401` anywhere signs the whole page out. `signed-out` and `access-lost` each fire once per change of state. Any other failure fires `request-failed`, and the element that failed shows it inline, with the request id.

### Task inbox

- It lists `GET /work` with `view`, `live=true` and `limit`, which is `page-size`. **Load more** follows the next cursor. A `view` it does not know means `all`.
- It keeps only the lines a workflow step holds: My Work lists every kind of work, and a line with no step is not a task here.
- Its columns are the task (its step label, else its step key), the workflow, the status (Open, or Claimed once someone holds it) and the due date.
- Clicking a row, or pressing Enter on a focused row, fires `task-select` with the line's record and entity. Pass both to `agentflow-task-detail`.

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
  - The action that signs is not offered, because signing happens in AgentFlow; a notice says so.
  - A step that signs, claimed by you, shows that notice and **Release** only.
  - A task whose embedded entity view needs records chosen shows a notice sending you to AgentFlow, and **Release** only: the element does not draw that view, and the server refuses a submit without the choice. That is a selectable grid or kanban view whose minimum is above zero, or unset, which means one.
- When `entity-id` or `record-id` changes, it clears the task shown and ignores late answers about the old one. Each write carries the entity and record it started with, in both the call and the event, and a write that lands after the element moved on is announced but never shown.
- A claim refused with `409 WORK_ALREADY_CLAIMED` shows the problem inline and reloads the task.
- A submit the form's schema refuses answers `422 STEP_PAYLOAD_INVALID`, with the failing paths in its `detail` and no field errors. The element shows that detail under the error and keeps what was entered.

### Record table

- It loads `GET /entities/{entity-id}` for the fields. It lists with `GET /entities/{entity-id}/records` (the search box's text, `page-size` and the cursor), or with `POST /entities/{entity-id}/records/query` when `filter` is set. A filtered table has no search box. `filter` is compared by value, so a new object with the same contents, such as an inline `filter={{…}}` on each React render, sends no new query.
- **New record** shows only when you may write to the entity and `GET /entities/{entity-id}/create-form` answers `200`. A `403` or `404` there hides the button and nothing else; any other failure is handed to the provider and shown like a failed load. **New record** opens the create form in place, and **Create** sends `POST /entities/{entity-id}/records` with `{form_payload}`.
- Clicking a row, or pressing Enter on a focused row, fires `record-select`. A successful create fires `record-created`, then reloads the list.

### Start form

- It loads `GET /workflows/startable`, every page, 100 at a time.
  - With `workflow-id`, it uses that workflow. If you can't start it, it shows "This workflow can't be started here".
  - Without one, it shows a picker.
- It then loads the workflow version's start form. A version with no start form asks only for the name.
- It always shows a required **Case name** field, which defaults to the workflow's name.
- **Start** sends `POST /workflows/{id}/instances` with `{name, version_id, input_payload}` and fires `workflow-started`.
- **After a successful start, the form says "Started." and resets itself.** The notice is a `part="notice"` line. The Case name goes back to the workflow's name and every other field to its initial value, so a second click can't repeat the same start unnoticed. To move on, re-render or navigate on `workflow-started`, for example with a React `key` change or a route change.

## Refreshing an element

Elements have no methods. To refresh one, re-render it: in React, change its `key`; in a plain page, replace it with a fresh copy. An element reloads by itself when an attribute or property that chooses its data changes, such as `entity-id`, `record-id`, `view` or `filter` (compared by value), and the record table reloads after a create. The provider is the exception: it reads `base-path` and `fetchImpl` once, when it connects, so re-render it to change them. Nothing else tells an element that the data behind it changed, such as an inbox beside a task detail that was just submitted.

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
  - `task.claim`, `task.release`, `task.submit`, `task.claimed_by` (`{name}`), `task.claimed_by_someone`, `task.withheld`, `task.done`, `task.cancelled`, `task.signed_waiting`, `task.no_actions`, `task.sign_elsewhere`, `task.select_elsewhere`;
  - `form.required`, `form.unsupported`, `form.unsupported_required`;
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

Fields follow the order of the form's layout (`ui_schema_json`), then the schema's `x-order`, then the rest. The layout's sections and other structure are not rendered yet.

## Tokens

An element never sees, stores or logs a token. It calls AgentFlow through `{base-path}/api` with the browser's session cookie, which is `HttpOnly`. The server half of the SDK holds the tokens and adds `Authorization` in the proxy. There is nothing about credentials to configure on the elements.

## Content Security Policy

A page with a Content Security Policy must allow three things the bundle does. The first two were read off the built `agentflow-elements.js`, which bundles Svelte 5.57:

- **Inline `<style>` elements.** Each element's styles are a `<style>` element, without a nonce, that Svelte adds to the element's shadow root when it first renders. `style-src`, or `style-src-elem` if you set it, must allow them with `'unsafe-inline'`. Browsers ignore `'unsafe-inline'` in a directive that also lists a nonce or a hash, so a nonce-based `style-src` needs a separate `style-src-elem 'self' 'unsafe-inline'`. The alternative is the SHA-256 hash of every stylesheet, which changes with each release. Without either, the elements work but render unstyled. The five elements set no `style` attributes, so for them `style-src-attr` can stay strict. The UI kit's overlays do write inline styles: Ark's positioners place every menu, popover, tooltip, calendar and person list that way, and Zag styles the dialogs' `<dialog>` and each toast. CSSOM writes (`el.style.x = …`) are not subject to `style-src-attr` and `setAttribute('style', …)` is; this has not been checked against a strict policy, so a page that loads the kit should allow `style-src-attr 'unsafe-inline'` or test its own policy with every overlay open.
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

- the five tags;
- the attributes and properties in [the table](#the-elements);
- the events and their `detail`;
- the parts;
- the `--agentflow-*` custom properties;
- the provider's default slot and its `data-state`;
- the package entry points: `.` (`defineAgentFlowElements`, `signIn`, `signOut` and the types) and `./jsx`;
- the bundle's file name, `agentflow-elements.js`;
- the protocol the elements use to find their provider, so that elements from two builds on one page still work together. It is a `context-request` event with `context: 'agentflow'`, a `callback(value, unsubscribe)` and `subscribe`; the `agentflow-provider-ready` event on `window`; and the context value's `state`, `caller`, `client`, `locale`, `t` and `report`.

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
- **Boolean attributes.** The five elements have none: libraries disagree about what `flag="false"` means. The UI kit's elements do, with HTML presence semantics; see [the rules](#the-rules-every-kit-element-follows).
- **JSON in attributes.** `strings`, `filter` and `fetchImpl` are properties. Set them from JavaScript. An attribute of the same name is ignored, and so is a string set as the property, with one console warning per name.

The package follows semantic versioning over that surface. A change that breaks it needs a major version.

`test/contract/` holds a build to that surface. It loads the built `agentflow-elements.js` and touches nothing but the public surface, so the same suite checks any future build, whatever library it is written with. It checks:

- the entry points, and that the five tags register, idempotently;
- that every attribute in the table is observed and every property exists;
- what they do: `base-path` in every request path; `locale="vi"` in a built-in string; the inbox's `status`, `assignment` and `page-size` sent as `status`, `assignment` and `limit`; the record table's `columns` choosing and ordering the cells, and its `page-size` sent as `limit`; and `filter` moving the list to `POST …/records/query` with that filter;
- that `strings`, `filter` and `fetchImpl` ignore a string, whether from an attribute or set as the property, with one console warning per name;
- every event with its exact `detail`, heard outside a shadow root that holds the provider, which only a `bubbles` and `composed` event reaches;
- every part in the table, each in a state that shows it. `error` is shown for a request that fails, such as a `500`. `field-error` is shown for a `422` whose `field_errors` name the field, which the stub answers to a missing required value, so a build may check Required itself or leave it to the server;
- the provider's `data-state` for each outcome of `GET /caller`, and its default slot;
- the context protocol: an answer to `context-request`, updates to a subscribed request until it calls `unsubscribe`, and `agentflow-provider-ready` on `window`;
- that `report` reads a plain object by its shape: a `401` signs the page out, and a `422`'s `fieldErrors` come back in the `Problem`.

The `--agentflow-*` custom properties are part of the contract, but they are documented, not machine-checked: jsdom computes no styles. The JSX typings are checked by `test/jsx-types.test-d.tsx`, not by the contract suite. The unit tests cover each element's behaviour in more depth, but they run against the source, so they bind only this build.

## The UI kit

`@reflexify/agentflow-elements/kit` is a second entry, `dist/kit.js`, for an app module's own screens. It holds nine elements built on Ark UI (and Tiptap for the editor) and the CSS layer they share. It does not need a provider and calls no API. A module that imports only the kit does not load the five AgentFlow elements.

How a module built on the kit should look and behave, from tokens and layout to states, accessibility and a review
checklist, is the design guide beside this README, [DESIGN.md](DESIGN.md). It ships in the package:
`node_modules/@reflexify/agentflow-elements/DESIGN.md`.

```ts
import '@reflexify/agentflow-elements/kit';                 // registers the nine tags
import { KIT_CSS, KIT_TAGS, defineKitElements } from '@reflexify/agentflow-elements/kit';
import type { KitStrings, MenuItem, Person, ToastInput } from '@reflexify/agentflow-elements/kit';
import type {} from '@reflexify/agentflow-elements/jsx';  // React 19: types for the nine tags
```

`KIT_CSS` is the layer as a string. Each element already has it in its shadow root; put it in your own shadow root, in a `<style>`, to use its classes on your own markup: `af-button` (with `primary`, `secondary`, `danger` or `ghost`), `af-chip`, `af-avatar`, `af-tabs`, `af-skeleton`, `af-banner`. The classes read their tokens from `.af-kit`: put them inside an element with the class `af-kit`, which declares those tokens.

**Registration is global and guarded.** Importing the entry calls `defineKitElements()`, which defines each tag only if it is not defined yet. Two modules on one page therefore share whichever copy of a tag registered first. That is why each element's properties, events and parts change only additively.

**Version skew.** Each element class carries a static `kitVersion`, the package version (also exported as `KIT_VERSION`). When a tag is already registered by a copy with an older `kitVersion`, or with none, `defineKitElements()` keeps it and logs one `console.warn` for that tag. Your module then runs against the older copy, so it must feature-detect anything added after the kit version it requires, for example `'label' in el` before relying on a label, rather than assume it. `customElements.get('af-date').kitVersion` tells you which copy you got.

### The rules every kit element follows

- **Properties in, events out.** Data goes in as properties; anything that is not a string or a Boolean has no attribute. A change goes out as a DOM `CustomEvent` with plain data in `detail`, which `bubbles` but is not `composed`: listen on the element, or on an ancestor in the same shadow root. Values are controlled: an element that emits `change` shows the new value once you set it back.
- **Tokens.** An element is styled only through the `--af-*` custom properties (see `AF_TOKENS` in `@reflexify/agentflow-sdk`). Each is read with its own fallback, AgentFlow's default palette, and declared on an inner element, never on `:host`, so the tokens your host sets inherit into it. For the dark fallbacks, set `data-theme="dark"` on the element itself; with the tokens set, the inherited values decide.
- **The top layer.** An overlay renders in the element's own shadow root, so content you slot into it keeps working, and reaches the top layer instead of a portal, so no `overflow` or container query clips it. `af-dialog` and `af-confirm` use a native `<dialog>` opened with `showModal()`, which makes the page behind inert. The other overlays use `popover="manual"` with fixed positioning. While an element's popover layer is shown, the element itself (the host you hold, not a node in its shadow root) carries `data-raised="true"`, and `"false"` once the layer is hidden; before it first opens the attribute is absent. That attribute is part of the contract: read it to know whether an overlay is open, in jsdom too, which has no `:popover-open`. `af-dialog` and `af-confirm` have no popover layer and never set it: read their `open`.
- **Pointer.** While it is open, `af-dialog` adds one capturing `pointerdown` listener on its document, removed when it closes. It hears a press on the backdrop from the moment the dialog shows: Zag starts its own outside-press listener a timer later, and browsers run input before timers, so a quick press would otherwise go unheard. It never calls `preventDefault`.
- **Keys.** The kit's own code adds no key listener on `document` or `window`. Some library listeners there are accepted, because each exists only while that library's own interaction is live and acts only on its keys, or on none. From Zag, the state-machine library under Ark: the Escape listener an overlay's dismissable layer keeps only while it is open, and the focus-visible tracker, which records whether the last input was a key or a pointer and never acts on a key. `af-toast` also keeps Zag's toast-group hotkey listener while it is mounted; its hotkey matches no key. Svelte's delegated event dispatcher runs only Svelte handlers on elements in the event's own path. No element uses Zag's focus trap: the dialogs run with `modal={false}` and rely on `showModal()`'s inert page, so Tab walks slotted fields too and may leave for the browser's own chrome rather than wrap. [DESIGN.md](DESIGN.md), "Module rules", holds the rules a module's own code follows and their reasons.
- **Boolean attributes** follow HTML presence semantics, as `disabled` does on an `<input>`: `open`, `danger`, `busy`, `clearable`, `disabled`, `multiple`, `readonly` and `loading` are true when the attribute is present, whatever its value, so `disabled="false"` is still disabled, and false only when it is absent. Remove the attribute, or set the property to `false`, to turn one off. Setting the property does not write the attribute back.
- **Text.** An element's own text (Close, Cancel, Today, the calendar's labels and so on) is Vietnamese when `locale` is `vi` or `vi-…`, English otherwise. Override any string through the `strings` property, a partial `KitStrings`.

### The elements

Every element also takes `locale` and `strings`. Dates are ISO `yyyy-mm-dd` strings.

| Tag | Properties (attribute) | Slots | Events (`detail`) | Parts |
|---|---|---|---|---|
| `af-dialog` | `open`, `heading` | default (the body), `actions` (the footer, hidden while empty) | `close` `{reason: 'escape' \| 'outside' \| 'close-button'}`: Escape, a click on the backdrop, the × button. The element does not close itself; set `open` to `false` | `content`, `heading`, `close`, `body`, `actions` |
| `af-confirm` | `open`, `heading`, `message`, `confirmLabel` (`confirm-label`), `danger`, `impact`, `busy` | none | `confirm` `{}`; `cancel` `{reason: 'escape' \| 'close-button'}`. A backdrop click does nothing. After a press, Confirm stays locked until `busy` goes from `true` to `false` or the dialog opens again, so a double press emits once | `content`, `heading`, `message`, `impact`, `actions`, `cancel`, `confirm` |
| `af-menu` | `items` (`MenuItem[]`), `label` (the trigger's accessible name) | default (the trigger's content) | `select` `{id}`. A disabled item never selects, shows its `reason` in a tooltip and carries it as its `aria-description` | `trigger`, `item` |
| `af-popover` | `open`, `placement` (a Floating UI placement, default `bottom-start`) | `anchor`, `content` | `close` `{reason: 'escape' \| 'outside'}`. Open and close it through `open` | `anchor`, `content` |
| `af-tooltip` | `text` (empty shows the slot alone) | default (the anchor) | none. Opens after 300 ms of hover or at once on keyboard focus; Escape on the anchor closes it | `anchor` |
| `af-toast` | none; methods `show(input: ToastInput): string` (returns the toast's id) and `dismiss(id)`, both present from construction | none | `action` `{toast, action}`. Pressing the action also dismisses its toast. Success and info toasts close after 4 s, with or without an action, and an error after 8 s; an error with an action stays until dismissed | `toast`, `icon`, `text`, `action`, `close` |
| `af-date` | `value`, `min`, `max`, `clearable`, `placeholder`, `label` (the input's accessible name; without it, `placeholder` names it), `disabled` | none | `change` `{value: string \| null}` | `control`, `input`, `trigger`, `content`, `today`, `clear` |
| `af-person-picker` | `people` (`Person[]`), `value` (an id, an array of ids with `multiple`, or `null`), `multiple`, `placeholder`, `label` (the input's accessible name), `loading`, `disabled` | none | `change` `{value}` in the shape of `value`; `search` `{query}` as the person types | `control`, `chip`, `remove`, `input`, `clear`, `content`, `option`, `empty` |
| `af-rich-editor` | `value` (Markdown), `readonly`, `placeholder`, `label` (the editable area's accessible name) | none | `change` `{value}` with the Markdown, 600 ms after typing stops and on blur, only for an edit | `toolbar`, `tool-bold`, `tool-italic`, `tool-bullet-list`, `tool-numbered-list`, `tool-link`, `link-popover`, `link-input`, `link-apply`, `placeholder`, `content` |

Notes on single elements:

- **`af-dialog` and `af-confirm`** move focus in when they open: to the × in `af-dialog`, to Cancel in `af-confirm`. Escape and closing return it to where it was.
- **`af-date`** shows `dd/mm/yyyy` in Vietnamese and `d MMM yyyy` in English, the short month from the browser's own `Intl` (`15 Sept 2026` in Chromium, `15 Sep 2026` in Safari). It accepts typed `dd/mm/yyyy` or ISO, committed on Enter or blur, and refuses a date outside `min` and `max`. Picking a day puts focus on the input, Today on the calendar button, Clear on the input, and Escape on the calendar button. A stored value outside `min` and `max` is shown but never handed to the calendar.
- **`af-person-picker`** filters `people` itself, ignoring case and Vietnamese accents (`đ` matches `d`). In single mode, `clear` is how a person unassigns: it emits `{value: null}`.
- **`af-rich-editor`** loads Tiptap with a dynamic `import()`, so its code (about 170 KB gzip) is a chunk of its own that a page without an editor never fetches. The element also has an `editor` property, `null` until that chunk has loaded and the Tiptap `Editor` after. It exists for tests only and is outside the contract: it has no JSX type, may change or go in any release, and an app must not call it.
- **Accessible names.** `af-date`, `af-person-picker` and `af-rich-editor` sit in your form without a `<label for>`, which cannot point into a shadow root. Give each a `label`: it becomes the `aria-label` of the input or the editable area inside. Without one, `af-date` falls back to its `placeholder` and the other two have no name.
- **`af-toast`**'s region sits at the bottom end of the viewport, raised into the top layer only while it holds a toast. Each toast shows its kind in a leading bar and an icon. A hidden popover is outside the accessibility tree, so the text of each toast is also put in two visually hidden live regions that are always present: `role="status"` for success and info, `role="alert"` for an error. A screen reader therefore reads the first toast after a quiet spell, which a region shown in the same moment would miss. `show` and `dismiss` work before the element connects: a toast shown that early appears when it does.
- **`af-tooltip` cannot describe what you slot into it.** Its `aria-describedby` would have to point from your control, in your tree, to the bubble in the tooltip's shadow root, and an id reference does not cross a shadow boundary. A locked control that explains itself in a tooltip needs the reason in your own tree as well: put a visually hidden `<span id="…">` with the reason beside the control and point the control's `aria-describedby` at it. What you slot in inherits its colour and font from your page, not from the kit.
- **`af-dialog`** is at most the viewport's height less 64 px: its body scrolls and the heading and footer stay in view.
- **Focus rings** are drawn with `--af-primary`, solid. `--af-ring` is no longer read: AgentFlow's ring token is the primary at 40% alpha, about 1.6:1 on white, which fails the 3:1 a focus indicator needs.
- **`af-person-picker`** shows someone `people` does not hold as "Unknown person" (numbered when there are several), never by id. While `loading` is set, such an id shows as an ellipsis instead; while `people` is empty and `loading` is not set, it shows no name at all. A repeated id in `value` counts once, and of two people with one id the first wins.
- **CSS classes.** `af-button` comes in `primary`, `secondary`, `danger` and `ghost`, with `sm` (28 px) and `icon` (a 32 px square, `icon sm` 24 px); a locked one is `aria-disabled="true"`. `af-chip` takes `neutral`, `success`, `warning`, `info` or `danger`. `af-avatar` takes `sm` (20 px) and `lg` (32 px), and a `data-hue` from 0 to 7, best chosen from the person's id so it survives a rename. `af-tabs segmented` is the sunk-track switch. `af-banner` takes `info`, `warning` or `danger`.

### The kit's contract

The kit's public contract is its nine tags, the properties, attributes and methods in the table above, the events and their `detail`, the parts, `data-raised` on the host, the `--af-*` tokens, the CSS classes, the `kitVersion` stamp, and the `./kit` entry's exports (`defineKitElements`, `KIT_TAGS`, `KIT_CSS`, `KIT_VERSION` and the types). Shadow markup, ids, classes inside the shadow root and the `editor` property are not. It changes only additively, for the reason in [Registration](#the-ui-kit).

`test/contract/kit.test.ts` holds a build to it, as `test/contract/contract.test.ts` does for the five elements. It loads the built `dist/kit.js` and touches only that surface. It checks that the nine tags register, idempotently, with their `kitVersion`; that every attribute in the table is observed and every property and method exists before the element connects; that a Boolean attribute is read by its presence; every event with its exact `detail`, `bubbles: true` and `composed: false`; `data-raised` on the host; and every part, each in a state that shows it.

### The gallery

`pnpm gallery` (from this package) serves `http://localhost:5182/gallery/`: every kit element, once in a light English pane and once in a dark Vietnamese one, each inside a shadow root nested in another, as in a module. A short scrolling column holds the anchored overlays, to show they are not clipped. `pnpm e2e` runs `e2e/gallery.spec.ts` against it in Chromium and WebKit (`pnpm exec playwright install chromium webkit` once).

## Development

From `sdk/`:

```bash
pnpm build       # first: jsx.d.ts reads dist/, and test/contract/ loads dist/agentflow-elements.js and dist/kit.js
pnpm typecheck
pnpm test
```

Without a build, the contract suite and the bundle check skip locally. In CI, where `CI` is set, a missing bundle fails the contract suite instead.
