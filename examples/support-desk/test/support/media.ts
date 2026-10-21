import { vi } from 'vitest';

/** jsdom has no `matchMedia`: a `prefers-color-scheme: dark` query the test sets and moves. */
export function stubColorScheme(dark = false) {
  const listeners = new Set<() => void>();
  const query = {
    get matches() { return dark; },
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_: string, listener: () => void) => void listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => void listeners.delete(listener),
  };
  vi.stubGlobal('matchMedia', () => query);
  return {
    set(next: boolean) {
      dark = next;
      for (const listener of [...listeners]) listener();
    },
    listening: () => listeners.size,
  };
}
