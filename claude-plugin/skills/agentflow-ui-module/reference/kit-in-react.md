# The kit in React

The kit's elements are custom elements with properties in and DOM events out. This page shows how the starter
uses them from React; each element's properties, events and parts are in the kit README,
`node_modules/@reflexify/agentflow-elements/README.md`.

## Why a wrapper

Wrap each element in a small component that sets its properties through a ref and listens with
`addEventListener`. Then nothing depends on how a given React version treats custom elements: whether it sets a
prop as a property or an attribute, and which events it wires up. A handler is read when its event fires, so a
new function on every render costs no new listener.

The hook, from `src/module/kit.tsx`, with the imports it needs:

```tsx
import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

function useElement<E extends HTMLElement>(props: Record<string, unknown>, events: Record<string, (detail: never) => void>): RefObject<E | null> {
  const ref = useRef<E | null>(null);
  useLayoutEffect(() => {
    const el = ref.current as unknown as Record<string, unknown> | null;
    if (el) for (const [key, value] of Object.entries(props)) if (el[key] !== value) el[key] = value;
  });
  const latest = useRef(events);
  latest.current = events;
  const names = Object.keys(events).join(',');
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const offs = names.split(',').filter(Boolean).map((type) => {
      const listener = (e: Event) => latest.current[type]?.((e as CustomEvent).detail as never);
      el.addEventListener(type, listener);
      return () => el.removeEventListener(type, listener);
    });
    return () => offs.forEach((off) => off());
  }, [names]);
  return ref;
}
```

One wrapper built on it, `Dialog`, from the same file. Every wrapper takes the locale and the theme. `af-dialog`
never closes itself: its `close` event calls `onClose`, which sets `open` to false.

```tsx
import type { DialogCloseDetail } from '@reflexify/agentflow-elements/jsx';
import type { ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';
type Common = { locale: string; theme: ThemeMode };

export function Dialog(p: Common & { open: boolean; heading: string; onClose(detail: DialogCloseDetail): void; children: ReactNode; actions: ReactNode }) {
  const ref = useElement<HTMLElement>({ open: p.open, heading: p.heading, locale: p.locale }, { close: p.onClose });
  return (
    <af-dialog ref={ref} data-theme={p.theme}>
      {p.children}
      <div slot="actions" className="slot">{p.actions}</div>
    </af-dialog>
  );
}
```

Import the kit once, for its side effect of defining the elements: `import '@reflexify/agentflow-elements/kit';`.

## Typings

```ts
import type { AfToastElement, DateChangeDetail, DialogCloseDetail } from '@reflexify/agentflow-elements/jsx';
```

`@reflexify/agentflow-elements/jsx` gives the JSX types of the nine tags, so `<af-dialog ref={ref}>` type-checks,
and the `detail` type of each event (`DialogCloseDetail`, `DateChangeDetail` and the rest), plus the element
types with methods, such as `AfToastElement`.

## Events

The kit's events bubble but are not composed: listen on the element itself, or on an ancestor in the same shadow
root. A listener on `document` never hears them, and must not be there anyway. Values are controlled: an element
that emits `change` shows the new value once you set it back.

## `busy` on `af-confirm`

Set `busy` to true when Confirm is pressed, keep it true across a render, and set it to false when the write
ends. Confirm stays locked from the press until `busy` goes from true to false, so a double press confirms once.
Setting it and clearing it in one flush is no change at all, and leaves Confirm locked.

## Boolean attributes

`open`, `danger`, `busy`, `clearable`, `disabled`, `multiple`, `readonly` and `loading` are true when the
attribute is present, whatever its value: `disabled="false"` is still disabled. Set the property to `false`
through the wrapper, or leave the attribute out. Setting the property does not write the attribute back.

## One `af-toast` per module

Render one `af-toast` and show every toast through it. Its `show({ kind, text })` returns the toast's id, which
`dismiss(id)` takes. Pattern: `useToasts` in `src/module/kit.tsx`. `af-toast` also holds the module's live
regions, so add no second one.

## `af-tooltip` in a long list

Every `af-tooltip` is a shadow root, so a list of 1,000 rows must not mount one per row up front. On a non-interactive
value, mount it the first time a pointer comes over it; on a control, use Projects' `Tooltip`
(`examples/projects/src/kit/elements.tsx`), which also arms on focus. Keep the full text, or a locked control's reason, as visually
hidden text in the page from the start, because the tooltip's text never reaches a screen reader. A tooltip on a
non-interactive value only adds detail the visible text already implies (text cut by an ellipsis implies the rest, and stays whole in the page
for a screen reader), and its anchor is never made focusable
for it. Patterns: `LazyTooltip` in `src/module/kit.tsx`, for text and marks; Projects' `Tooltip` in
`examples/projects/src/kit/elements.tsx`, which wraps a control, keeps its nodes and replays the pointer's arrival.
Never wrap focusable content (a control, a link, anything with `tabIndex`) in `LazyTooltip`: it remounts its
children when it arms, and focus inside them would drop.
