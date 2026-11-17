import Provider from './elements/Provider.svelte';
import RecordActivity from './elements/RecordActivity.svelte';
import RecordComments from './elements/RecordComments.svelte';
import RecordTable from './elements/RecordTable.svelte';
import StartForm from './elements/StartForm.svelte';
import Task from './elements/Task.svelte';
import TaskDetail from './elements/TaskDetail.svelte';
import TaskInbox from './elements/TaskInbox.svelte';
import { define, type Compiled } from './define.js';
import { VERSION } from './version.js';

const TAGS: Record<string, Compiled> = {
  'agentflow-provider': Provider as unknown as Compiled,
  'agentflow-task': Task as unknown as Compiled,
  'agentflow-task-inbox': TaskInbox as unknown as Compiled,
  'agentflow-task-detail': TaskDetail as unknown as Compiled,
  'agentflow-record-table': RecordTable as unknown as Compiled,
  'agentflow-start-form': StartForm as unknown as Compiled,
  'agentflow-record-activity': RecordActivity as unknown as Compiled,
  'agentflow-record-comments': RecordComments as unknown as Compiled,
};

/** The package version, stamped on each element class as `elementsVersion`. */
export const ELEMENTS_VERSION = VERSION;

for (const component of Object.values(TAGS)) Object.defineProperty(component.element, 'elementsVersion', { value: ELEMENTS_VERSION });

/**
 * Defines each tag that is not defined yet. A tag another copy registered first stays, so a page can hold an older copy
 * than this one: that is reported once per tag, and a module feature-detects what it needs, such as `'client' in provider`.
 * The kit's `af-folder-source`, which a start form draws a folder field with, `af-activity-feed`, which the record activity
 * draws its lines with, and `af-comment-thread`, which the record comments draw a thread with (and the editor, Markdown view, file
 * picker and confirmation that thread draws), are not among them: each is loaded and defined when an element first needs it.
 */
export function defineAgentFlowElements(registry: CustomElementRegistry = customElements): void {
  define(registry, TAGS, 'elementsVersion', ELEMENTS_VERSION, 'elements');
}

defineAgentFlowElements();

export { defineFolderSource } from './folder-source.js';
export { signIn, signOut } from './session.js';
export { consumeTask } from './task-context.js';
export type * from './types.js';
export type * from './element-types.js';
export type { Locale, StringKey, Strings } from './i18n.js';
