# Routes: reading and changing the module's path

A host gives the module `basePath` (`/apps/<key>` inside AgentFlow, where `<key>` is `<prefix>-<key>` of the package id, `acme-case-desk` for `acme/case-desk`, and `GET /api/v1/apps/launcher` lists it; `/` on the app's own site), `navigate(path)` and
`onLocationChange(listener)`. A path is the pathname, query and fragment after `basePath` (`/items/42?tab=notes#n3`),
and always starts with `/`. `onLocationChange` calls its listener at once with the current path, then on every
`navigate`, back or forward, and fragment change; it returns the function that stops listening. `modulePath` and
`hostPath` in `@reflexify/agentflow-sdk` are for hosts: a module does not call them.

```tsx
function usePath(host: Pick<AppHost, 'onLocationChange'>): string {
  const [path, setPath] = useState('/');
  useEffect(() => host.onLocationChange(setPath), [host]);
  return path;
}
```

Change the path with `host.navigate('/items/42')`; the host owns the address bar. A page that only forwards (a
task's `/tasks/<id>` that opens its order) moves with `host.navigate('/orders/o1', { replace: true })`, which takes
the place of the current history entry, so Back goes to the page before it instead of into the redirect again. An
AgentFlow built before the option ignores it and adds an entry.

## The starter's `ScreenHost`

The starter types the host its screen reads as `Pick<AppHost, 'context' | 'onLocaleChange' | 'onThemeChange'>`
(`ScreenHost` in `src/module/mount.tsx`). Through it `host.navigate`, `host.onLocationChange` and `host.assistant` do
not type-check. Widen it:

```ts
export type ScreenHost = Pick<AppHost, 'context' | 'onLocaleChange' | 'onThemeChange' | 'navigate' | 'onLocationChange' | 'assistant'>;
```

Then give the demo host and the test hosts the three new members (`assistant` is optional, so a host may leave it out).

## Telling the assistant what is open

Parse the record's id out of the path and call `setContext` from an effect that depends on it (SKILL.md, step 4):

```tsx
const itemId = /^\/items\/([^/?#]+)/.exec(usePath(host))?.[1];
useEffect(() => {
  host.assistant?.setContext(itemId ? { entity: 'item', record: itemId } : null);
}, [host, itemId]);
```

A screen with more to say than one record (a selection, a filtered view, text, an app kind) sends a list with
`setAssistantContext(host.assistant, items)`: `assistant.md`.

The record must be an id. AgentFlow reads the named record as the person, and offers the assistant nothing when
they cannot read it (a stale link, an id from another organization, a record they have no grant for): so an
unknown id does no harm, and the module needs no guard of its own to keep from naming it. Guard only for the
screen's sake, as a "not found" panel for a record the list did not return. A value that is not an id is ignored
with a console warning, and so is an entity key the package does not have.

`entity` is the key in your package (`item`, the tail of the logical key `entity:item`). `GET /app/objects` lists
each object under a second key, the one AgentFlow installed it under: the package's prefix, then yours
(`acme_items__item`). Send yours. An AgentFlow built before the host matched the logical key took only the
installed one and ignored `item` with the warning `this app has no entity "item"`: if the button never appears
and the console says so, the deployment is older than that fix.

## The page a record opens at

When an entity of the package declares `work.module_page` (the `agentflow-app-authoring` skill's `work.md`), AgentFlow
opens the module at that path from My Work, a work notification and its email, with the record's id in place of
`{{ record_id }}`: `/items/{{ record_id }}` opens `/apps/<key>/items/<the record's id>`. The first call of
`onLocationChange` carries that path, so read the id from it as above; the host passes no other route parameter.

- **Open the record there whatever its status.** A done or cancelled record is sent to the same page, so a screen that
  finds the record only in a list of open ones shows nothing for it.
- **Never link to `/inbox?record=…` for the app's own records.** AgentFlow sends that link straight back to the
  module, so the person goes round in a circle. Navigate inside the module instead.

## A test host with a working route and an assistant spy

A test needs a host whose `navigate` reaches `onLocationChange`, keeps the history `navigate` and `{ replace: true }`
make, and has a `back()` to walk it, and an `assistant` whose `setContext` and `open` calls it can read. A host
without those cannot show that Back skips a page that forwards: it passes with a forwarder that forgot `replace`. A
host has no `back` member (the browser owns Back), so `back` is the test's own. Use ids of the shape AgentFlow's
records have (UUIDs): the real host ignores anything else, so a test with `'42'` would pass here and fail there.

```tsx
import { act, render, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import type { AppAssistant } from '@reflexify/agentflow-sdk';
import type { ScreenHost } from '../src/module/mount.js';

function routedHost(start: string, context: ScreenHost['context']) {
  const history = [start]; // the entries Back walks through; the last one is the page on screen
  const listeners = new Set<(path: string) => void>();
  const tell = () => {
    for (const listener of listeners) listener(history[history.length - 1]!);
  };
  const setContext = vi.fn<AppAssistant['setContext']>();
  const open = vi.fn<NonNullable<AppAssistant['open']>>();
  const host: ScreenHost = {
    context,
    onLocaleChange: () => () => {},
    onThemeChange: () => () => {},
    navigate(next, options) {
      if (options?.replace) history[history.length - 1] = next; // takes the place of the current entry
      else history.push(next);
      tell();
    },
    onLocationChange(listener) {
      listeners.add(listener);
      listener(history[history.length - 1]!); // at once, as a real host does
      return () => void listeners.delete(listener);
    },
    assistant: { kinds: ['record', 'records', 'view', 'dashboard', 'text'], setContext, open },
  };
  // The browser's Back: drop the page on screen, and tell the module the one before it.
  const back = () => {
    if (history.length > 1) history.pop();
    tell();
  };
  return { host, setContext, open, back, path: () => history[history.length - 1]! };
}

it('tells the assistant which item is open, and clears it on the list', async () => {
  const ID = '0190f8f4-0000-7000-8000-000000000042';
  const { host, setContext } = routedHost(`/items/${ID}`, CONTEXT);
  render(<ItemsScreen host={host} />);
  await waitFor(() => expect(setContext).toHaveBeenLastCalledWith({ entity: 'item', record: ID }));
  act(() => host.navigate('/'));
  expect(setContext).toHaveBeenLastCalledWith(null);
});

it('leaves a page that only forwards out of Back', async () => {
  const TASK = '0190f8f4-0000-7000-8000-000000000071';
  const { host, back, path } = routedHost('/', CONTEXT);
  render(<ItemsScreen host={host} />);
  act(() => host.navigate(`/tasks/${TASK}`)); // the screen forwards: navigate('/orders/…', { replace: true })
  await waitFor(() => expect(path()).toMatch(/^\/orders\//));
  act(() => back());
  expect(path()).toBe('/'); // not `/tasks/…` again
});
```

`kinds` and `open` are contract 4's. To test a host before it, leave both out: `setAssistantContext` then sends the first
record alone, and a button guarded by `host.assistant?.open` should not render. To test a host with no assistant (the
app's own site), leave `assistant` out of the object. Items and `open` themselves: `assistant.md`.

A test that answers `GET /app/objects` itself must list each object as an installation does, under its installed
`key` (`acme_items__item`) beside its `logical_key` (`entity:item`). A fixture that gives both the same value
cannot tell a module that reads one from a module that reads the other, so it passes code the real host refuses.
