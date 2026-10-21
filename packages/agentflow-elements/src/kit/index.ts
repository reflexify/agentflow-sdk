import Confirm from './Confirm.svelte';
import DateField from './DateField.svelte';
import Dialog from './Dialog.svelte';
import Menu from './Menu.svelte';
import PersonPicker from './PersonPicker.svelte';
import Popover from './Popover.svelte';
import RichEditor from './RichEditor.svelte';
import Toast from './Toast.svelte';
import Tooltip from './Tooltip.svelte';
import { KIT_VERSION } from './version.js';

type Compiled = { element: CustomElementConstructor };

const TAGS: Record<string, Compiled> = {
  'af-dialog': Dialog as unknown as Compiled,
  'af-confirm': Confirm as unknown as Compiled,
  'af-menu': Menu as unknown as Compiled,
  'af-popover': Popover as unknown as Compiled,
  'af-tooltip': Tooltip as unknown as Compiled,
  'af-toast': Toast as unknown as Compiled,
  'af-date': DateField as unknown as Compiled,
  'af-person-picker': PersonPicker as unknown as Compiled,
  'af-rich-editor': RichEditor as unknown as Compiled,
};

export const KIT_TAGS: readonly string[] = Object.keys(TAGS);
export { KIT_VERSION };

for (const component of Object.values(TAGS)) Object.defineProperty(component.element, 'kitVersion', { value: KIT_VERSION });

function older(theirs: unknown, ours: string): boolean {
  if (typeof theirs !== 'string') return true;
  const a = theirs.split('.').map((n) => Number.parseInt(n, 10) || 0);
  const b = ours.split('.').map((n) => Number.parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) < (b[i] ?? 0);
  return false;
}

/**
 * Defines each kit tag that is not defined yet. A tag another copy of the kit registered first stays, so a page can hold an
 * older copy than this one: that is reported once per tag, and a module feature-detects anything newer than what it requires.
 */
export function defineKitElements(registry: CustomElementRegistry = customElements): void {
  for (const [tag, component] of Object.entries(TAGS)) {
    const existing = registry.get(tag);
    if (!existing) registry.define(tag, component.element);
    else if (existing !== component.element) {
      const theirs = (existing as { kitVersion?: unknown }).kitVersion;
      if (older(theirs, KIT_VERSION)) {
        console.warn(`An older copy of the AgentFlow UI kit registered ${tag} first; this page uses it, not this copy.`, { tag, registered: theirs ?? null, loaded: KIT_VERSION });
      }
    }
  }
}

defineKitElements();

export { KIT_CSS } from './css.js';
export type { KitStrings } from './text.js';
export type { KitLocale } from './text.js';

export interface MenuItem { id: string; label: string; disabled?: boolean; reason?: string; danger?: boolean }
export interface Person { id: string; name: string; email?: string | null; avatar?: string | null }
export interface ToastInput { kind: 'success' | 'error' | 'info'; text: string; action?: { id: string; label: string } }
