import Provider from './elements/Provider.svelte';
import RecordTable from './elements/RecordTable.svelte';
import StartForm from './elements/StartForm.svelte';
import TaskDetail from './elements/TaskDetail.svelte';
import TaskInbox from './elements/TaskInbox.svelte';
import { VERSION, isOlder } from './version.js';

type Compiled = { element: CustomElementConstructor };

const TAGS: Record<string, Compiled> = {
  'agentflow-provider': Provider as unknown as Compiled,
  'agentflow-task-inbox': TaskInbox as unknown as Compiled,
  'agentflow-task-detail': TaskDetail as unknown as Compiled,
  'agentflow-record-table': RecordTable as unknown as Compiled,
  'agentflow-start-form': StartForm as unknown as Compiled,
};

/** The package version, stamped on each of the five element classes as `elementsVersion`. */
export const ELEMENTS_VERSION = VERSION;

for (const component of Object.values(TAGS)) Object.defineProperty(component.element, 'elementsVersion', { value: ELEMENTS_VERSION });

/**
 * Defines each tag that is not defined yet. A tag another copy registered first stays, so a page can hold an older copy
 * than this one: that is reported once per tag, and a module feature-detects what it needs, such as `'client' in provider`.
 */
export function defineAgentFlowElements(registry: CustomElementRegistry = customElements): void {
  for (const [tag, component] of Object.entries(TAGS)) {
    const existing = registry.get(tag);
    if (!existing) registry.define(tag, component.element);
    else if (existing !== component.element) {
      const theirs = (existing as { elementsVersion?: unknown }).elementsVersion;
      if (isOlder(theirs, ELEMENTS_VERSION)) {
        console.warn(`An older copy of the AgentFlow elements registered ${tag} first; this page uses it, not this copy.`, { tag, registered: theirs ?? null, loaded: ELEMENTS_VERSION });
      }
    }
  }
}

defineAgentFlowElements();

export { signIn, signOut } from './session.js';
export type * from './types.js';
export type { Locale, StringKey, Strings } from './i18n.js';
