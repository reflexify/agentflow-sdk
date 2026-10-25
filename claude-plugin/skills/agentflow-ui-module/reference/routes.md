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

Change the path with `host.navigate('/items/42')`; the host owns the address bar.

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

The record must be an id. AgentFlow reads the named record as the person, and offers the assistant nothing when
they cannot read it (a stale link, an id from another organization, a record they have no grant for): so an
unknown id does no harm, and the module needs no guard of its own to keep from naming it. Guard only for the
screen's sake, as a "not found" panel for a record the list did not return. A value that is not an id is ignored
with a console warning, and so is an entity key the package does not have.

## A test host with a working route and an assistant spy

A test needs a host whose `navigate` reaches `onLocationChange`, and an `assistant` whose `setContext` calls it can
read. Use ids of the shape AgentFlow's records have (UUIDs): the real host ignores anything else, so a test with
`'42'` would pass here and fail there.

```tsx
import { act, render, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import type { AppAssistantContext } from '@reflexify/agentflow-sdk';
import type { ScreenHost } from '../src/module/mount.js';

function routedHost(start: string, context: ScreenHost['context']) {
  let path = start;
  const listeners = new Set<(path: string) => void>();
  const setContext = vi.fn<(next: AppAssistantContext | null) => void>();
  const host: ScreenHost = {
    context,
    onLocaleChange: () => () => {},
    onThemeChange: () => () => {},
    navigate(next) {
      path = next;
      for (const listener of listeners) listener(path);
    },
    onLocationChange(listener) {
      listeners.add(listener);
      listener(path); // at once, as a real host does
      return () => void listeners.delete(listener);
    },
    assistant: { setContext },
  };
  return { host, setContext };
}

it('tells the assistant which item is open, and clears it on the list', async () => {
  const ID = '0190f8f4-0000-7000-8000-000000000042';
  const { host, setContext } = routedHost(`/items/${ID}`, CONTEXT);
  render(<ItemsScreen host={host} />);
  await waitFor(() => expect(setContext).toHaveBeenLastCalledWith({ entity: 'item', record: ID }));
  act(() => host.navigate('/'));
  expect(setContext).toHaveBeenLastCalledWith(null);
});
```

To test a host with no assistant (the app's own site), leave `assistant` out of the object.
