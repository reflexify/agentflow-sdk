import '@reflexify/agentflow-elements';
import type { AgentFlowClient, AppHost, AppSigning } from '@reflexify/agentflow-sdk';
import css from './module.css?inline';

const COPY = {
  en: { title: 'Signed decisions', waiting: 'Waiting for your signature', task: 'Task', decisions: 'Decisions' },
  vi: { title: 'Quyết định đã ký', waiting: 'Chờ bạn ký', task: 'Nhiệm vụ', decisions: 'Quyết định' },
} as const;
type Lang = keyof typeof COPY;

const langOf = (locale: string): Lang => (locale.toLowerCase().startsWith('vi') ? 'vi' : 'en');

type ProviderElement = HTMLElement & { client?: AgentFlowClient; signing?: AppSigning };

/**
 * Renders the signing inbox in `root`: the tasks that ask the person to sign, the chosen task with its Sign button, and
 * the decisions. Everything goes through `host.api` and `host.signing`; it returns how to take the module away again.
 */
export function mount(root: ShadowRoot | Element, host: AppHost): () => void {
  const doc = root.ownerDocument;
  const scope = root instanceof ShadowRoot ? root : root.getRootNode();
  const style = doc.createElement('style');
  style.textContent = css;
  (scope instanceof ShadowRoot ? scope : root).prepend(style);

  const page = doc.createElement('div');
  page.className = 'signed-decision';
  page.innerHTML = `<div class="sd-page">
    <h1 data-copy="title"></h1>
    <section class="sd-section"><h2 data-copy="waiting"></h2><div data-slot="inbox"></div></section>
    <section class="sd-section" data-section="task" hidden><h2 data-copy="task"></h2><div data-slot="task"></div></section>
    <section class="sd-section"><h2 data-copy="decisions"></h2><div data-slot="decisions"></div></section>
  </div>`;
  const slot = (name: string) => page.querySelector<HTMLElement>(`[data-slot="${name}"]`)!;

  const provider = doc.createElement('agentflow-provider') as ProviderElement;
  provider.client = host.api;
  if (host.signing) provider.signing = host.signing;

  const makeInbox = () => {
    const inbox = doc.createElement('agentflow-task-inbox');
    inbox.setAttribute('view', 'mine');
    inbox.setAttribute('signs', 'true');
    return inbox;
  };
  const makeDecisions = () => {
    const table = doc.createElement('agentflow-record-table');
    table.setAttribute('entity-key', 'decision');
    table.setAttribute('columns', 'title,status');
    return table;
  };
  const reload = () => {
    slot('inbox').replaceChildren(makeInbox());
    slot('decisions').replaceChildren(makeDecisions());
  };

  provider.addEventListener('task-select', (event) => {
    const { entityId, recordId } = (event as CustomEvent<{ entityId: string; recordId: string }>).detail;
    // A fresh element carries both ids from its first load; moving one attribute at a time would read a mixed pair.
    const detail = doc.createElement('agentflow-task-detail');
    detail.setAttribute('entity-id', entityId);
    detail.setAttribute('record-id', recordId);
    slot('task').replaceChildren(detail);
    page.querySelector<HTMLElement>('[data-section="task"]')!.hidden = false;
  });
  provider.addEventListener('agentflow-signed', reload);
  provider.addEventListener('agentflow-declined', reload);
  provider.addEventListener('agentflow-task-changed', reload);

  const showLocale = (locale: string) => {
    const lang = langOf(locale);
    provider.setAttribute('locale', lang);
    page.lang = lang;
    for (const node of page.querySelectorAll<HTMLElement>('[data-copy]')) {
      node.textContent = COPY[lang][node.dataset.copy as keyof (typeof COPY)[Lang]];
    }
  };
  // Neither listener is called as it subscribes, so each is read once subscribed: a switch made before then is not lost.
  const offLocale = host.onLocaleChange(showLocale);
  showLocale(host.context.locale);
  const offTheme = host.onThemeChange((theme) => {
    page.dataset.theme = theme.mode;
  });
  page.dataset.theme = host.context.theme.mode;

  reload();
  provider.append(page);
  root.append(provider);

  return () => {
    offLocale();
    offTheme();
    provider.remove();
    style.remove();
  };
}
