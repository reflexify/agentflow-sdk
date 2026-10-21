import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

/**
 * Sets `props` on a custom element as properties after every render, and listens for `events` with
 * `addEventListener`, so nothing depends on how a React version treats custom elements. A callback is read when the
 * event fires, so a new function each render costs no listener.
 */
export function useElement<E extends HTMLElement>(props: Record<string, unknown>, events: Record<string, ((detail: never) => void) | undefined>): RefObject<E | null> {
  const ref = useRef<E | null>(null);
  useLayoutEffect(() => {
    const el = ref.current as unknown as Record<string, unknown> | null;
    if (!el) return;
    for (const [key, value] of Object.entries(props)) if (el[key] !== value) el[key] = value;
  });
  const latest = useRef(events);
  latest.current = events;
  const names = Object.keys(events).join(',');
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const off = names.split(',').filter(Boolean).map((type) => {
      const listener = (e: Event) => latest.current[type]?.((e as CustomEvent).detail as never);
      el.addEventListener(type, listener);
      return () => el.removeEventListener(type, listener);
    });
    return () => off.forEach((f) => f());
  }, [names]);
  return ref;
}
