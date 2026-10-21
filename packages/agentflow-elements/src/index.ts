import Provider from './elements/Provider.svelte';
import RecordTable from './elements/RecordTable.svelte';
import StartForm from './elements/StartForm.svelte';
import TaskDetail from './elements/TaskDetail.svelte';
import TaskInbox from './elements/TaskInbox.svelte';

type Compiled = { element: CustomElementConstructor };

const TAGS: Record<string, Compiled> = {
  'agentflow-provider': Provider as unknown as Compiled,
  'agentflow-task-inbox': TaskInbox as unknown as Compiled,
  'agentflow-task-detail': TaskDetail as unknown as Compiled,
  'agentflow-record-table': RecordTable as unknown as Compiled,
  'agentflow-start-form': StartForm as unknown as Compiled,
};

export function defineAgentFlowElements(registry: CustomElementRegistry = customElements): void {
  for (const [tag, component] of Object.entries(TAGS)) {
    if (!registry.get(tag)) registry.define(tag, component.element);
  }
}

defineAgentFlowElements();

export { signIn, signOut } from './session.js';
export type * from './types.js';
export type { Locale, StringKey, Strings } from './i18n.js';
