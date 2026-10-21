import type { ReactNode } from 'react';
import { CheckIcon } from './icons.js';

/** A filter that is on or off: a pill that says "on" with a tick as well as a colour, so the state never rests on colour alone. */
export function FilterChip(p: { pressed: boolean; onToggle(): void; describedBy?: string; children: ReactNode }) {
  return (
    <button type="button" className="filter-chip" aria-pressed={p.pressed} aria-describedby={p.describedBy} onClick={p.onToggle}>
      {p.pressed && <CheckIcon size={12} />}
      {p.children}
    </button>
  );
}
