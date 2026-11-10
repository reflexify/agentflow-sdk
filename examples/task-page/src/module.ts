import { consumeTask } from '@reflexify/agentflow-elements';
import { KIT_CSS } from '@reflexify/agentflow-elements/kit';
import type { AgentFlowClient, AppHost, AppSigning, AppTaskHandle, AppTasks, AppTaskState } from '@reflexify/agentflow-sdk';
import css from './module.css?inline';

const COPY = {
  en: {
    title: 'Review a request',
    note: 'Note',
    claim: 'Claim',
    loading: 'Loading the task',
    noTask: 'Open a task from My Work to review it here.',
    notFound: "This task is not one of this app's.",
    unreadable: 'AgentFlow could not load this task. It tries again when you come back to this window.',
    finished: 'This task is already decided.',
    decided: (label: string) => `Decided: ${label}`,
    unsupported: 'Open this task in AgentFlow.',
    reasons: {
      claim_first: 'Claim this task to decide',
      held_by_other: 'Someone else holds this task',
      finished: 'This task is already decided',
      signed_waiting: 'Waiting for the signature to finish',
      content_not_shown: 'Part of this task is hidden from you',
      values_invalid: 'Complete the required fields',
      selection_out_of_bounds: 'Pick the number of records the task asks for',
      busy: 'Working on it',
    } as Record<string, string>,
  },
  vi: {
    title: 'Duyệt yêu cầu',
    note: 'Ghi chú',
    claim: 'Nhận việc',
    loading: 'Đang tải việc cần làm',
    noTask: 'Mở một việc từ Việc của tôi để duyệt tại đây.',
    notFound: 'Việc này không thuộc ứng dụng này.',
    unreadable: 'AgentFlow chưa tải được việc này. Sẽ thử lại khi bạn quay lại cửa sổ này.',
    finished: 'Việc này đã được quyết định.',
    decided: (label: string) => `Đã quyết định: ${label}`,
    unsupported: 'Hãy mở việc này trong AgentFlow.',
    reasons: {
      claim_first: 'Nhận việc này để quyết định',
      held_by_other: 'Người khác đang giữ việc này',
      finished: 'Việc này đã được quyết định',
      signed_waiting: 'Đang chờ hoàn tất chữ ký',
      content_not_shown: 'Một phần của việc này bị ẩn với bạn',
      values_invalid: 'Hãy điền các trường bắt buộc',
      selection_out_of_bounds: 'Chọn đúng số bản ghi mà việc này yêu cầu',
      busy: 'Đang xử lý',
    } as Record<string, string>,
  },
} as const;
type Lang = keyof typeof COPY;

const langOf = (locale: string): Lang => (locale.toLowerCase().startsWith('vi') ? 'vi' : 'en');

/** The task's id is the last segment of the Human step's `page.path`, `/review/{{ record_id }}`. */
const REVIEW_PATH = /^\/review\/([^/?#]+)/;

// An elements build older than contract 5 has no `tasks` property on the provider.
type ProviderElement = HTMLElement & { client?: AgentFlowClient; signing?: AppSigning; tasks?: AppTasks };

/** What a refused call said: the server's own title, or the reason the host refused before sending. */
interface Refusal {
  status: number;
  type: string;
  title: string;
}

/** One thing the module shows under its heading. */
interface Screen {
  element: Element;
  paint(): void;
  dispose(): void;
}

/**
 * Renders the review page in `root`: the Human step's task, worked through `host.tasks`. AgentFlow hands over the
 * task's state and what it may do; this page draws them and sends the person's choice back. It returns how to take
 * the module away again.
 */
export function mount(root: ShadowRoot | Element, host: AppHost): () => void {
  const doc = root.ownerDocument;
  const scope = root instanceof ShadowRoot ? root : root.getRootNode();
  const style = doc.createElement('style');
  style.textContent = `${KIT_CSS}\n${css}`;
  (scope instanceof ShadowRoot ? scope : root).prepend(style);

  const element = doc.createElement('div');
  element.className = 'task-page af-kit';
  // Focusable itself, so a click anywhere inside puts focus in the module.
  element.tabIndex = -1;
  const page = doc.createElement('div');
  page.className = 'tp-page';
  page.innerHTML = '<h1></h1><div data-slot="screen"></div>';
  const heading = page.querySelector('h1')!;
  const slot = page.querySelector<HTMLElement>('[data-slot="screen"]')!;
  root.append(element);

  let lang: Lang = langOf(host.context.locale);

  const provider = doc.createElement('agentflow-provider') as ProviderElement;
  provider.client = host.api;
  if (host.signing) provider.signing = host.signing;
  // Offer tasks only to a provider that knows the property, so an older elements build shows the notice below.
  const tasksOffered = Boolean(host.tasks) && 'tasks' in provider;
  if (host.tasks && 'tasks' in provider) provider.tasks = host.tasks;

  /** A message in the kit's banner. */
  const banner = (tone: 'info' | 'danger', text: string) => {
    const box = doc.createElement('div');
    box.className = `af-banner ${tone}`;
    box.setAttribute('role', tone === 'danger' ? 'alert' : 'status');
    const body = doc.createElement('div');
    body.className = 'af-banner-description';
    body.textContent = text;
    box.append(body);
    return box;
  };

  const noticeScreen = (text: (copy: (typeof COPY)[Lang]) => string): Screen => {
    const holder = doc.createElement('div');
    return {
      element: holder,
      paint: () => holder.replaceChildren(banner('info', text(COPY[lang]))),
      dispose: () => {},
    };
  };

  const reviewScreen = (recordId: string): Screen => {
    // The task element opens the task, tells everything inside it, and closes it when it leaves the page.
    const task = doc.createElement('agentflow-task');
    task.setAttribute('record', recordId);
    const view = doc.createElement('div');
    view.className = 'tp-review';
    view.innerHTML = `
      <div data-slot="notice"></div>
      <div class="tp-claim"><button type="button" class="af-button secondary"></button></div>
      <div class="tp-field"><label class="af-label" for="tp-note"></label><textarea id="tp-note" class="af-textarea" rows="4"></textarea></div>
      <ul class="tp-actions"></ul>`;
    task.append(view);
    const noticeSlot = view.querySelector<HTMLElement>('[data-slot="notice"]')!;
    const claimBox = view.querySelector<HTMLElement>('.tp-claim')!;
    const claimButton = claimBox.querySelector('button')!;
    const noteField = view.querySelector<HTMLElement>('.tp-field')!;
    const noteLabel = noteField.querySelector('label')!;
    const note = noteField.querySelector('textarea')!;
    const list = view.querySelector<HTMLElement>('.tp-actions')!;
    const rows = new Map<string, { item: HTMLLIElement; button: HTMLButtonElement; reason: HTMLSpanElement }>();

    let handle: AppTaskHandle | null = null;
    let state: AppTaskState | null = null;
    let refusal: Refusal | null = null;
    // Set in the same tick as the press, so a second press before the first settles sends nothing.
    let inFlight = false;
    let noticeKey = '';

    const paintNotice = (copy: (typeof COPY)[Lang]) => {
      const taken = state?.taken?.label;
      let shown: ['info' | 'danger', string] | null = null;
      if (!state || state.status === 'loading') shown = ['info', copy.loading];
      else if (state.status === 'not_found') shown = ['info', copy.notFound];
      // The handle keeps trying on window focus and on AgentFlow's task-list nudge.
      else if (state.status === 'error') shown = ['danger', copy.unreadable];
      else if (state.status === 'finished') shown = ['info', taken ? copy.decided(taken) : copy.finished];
      else if (refusal) shown = ['danger', refusal.status === 0 ? (copy.reasons[refusal.type] ?? refusal.title) : refusal.title];
      // Rebuilt only when it changes, so a screen reader hears an alert once.
      const key = shown ? shown.join('|') : '';
      if (key === noticeKey) return;
      noticeKey = key;
      noticeSlot.replaceChildren(...(shown ? [banner(...shown)] : []));
    };

    const paintActions = (current: AppTaskState, copy: (typeof COPY)[Lang]) => {
      const ids = current.actions.map((a) => a.id);
      for (const id of [...rows.keys()]) if (!ids.includes(id)) rows.delete(id);
      for (const a of current.actions) {
        let row = rows.get(a.id);
        if (!row) {
          const item = doc.createElement('li');
          const button = doc.createElement('button');
          button.type = 'button';
          const reason = doc.createElement('span');
          reason.className = 'tp-reason';
          reason.id = `tp-reason-${a.id}`;
          item.append(button, reason);
          button.addEventListener('click', () => {
            // aria-disabled keeps the button focusable, so its reason can be reached; the press does nothing.
            if (button.getAttribute('aria-disabled') === 'true') return;
            void run(() => handle!.submit(a.id));
          });
          row = { item, button, reason };
          rows.set(a.id, row);
        }
        row.button.className = a.tone === 'primary' ? 'af-button primary' : 'af-button';
        row.button.textContent = a.label;
        if (a.enabled) {
          row.button.removeAttribute('aria-disabled');
          row.button.removeAttribute('aria-describedby');
          row.reason.textContent = '';
        } else {
          row.button.setAttribute('aria-disabled', 'true');
          row.button.setAttribute('aria-describedby', row.reason.id);
          row.reason.textContent = a.reason ? (copy.reasons[a.reason] ?? a.reason) : '';
        }
      }
      // Moved only when the order changed, so a focused button keeps its focus.
      const same = ids.length === list.children.length && ids.every((id, i) => list.children[i] === rows.get(id)!.item);
      if (!same) list.replaceChildren(...ids.map((id) => rows.get(id)!.item));
    };

    const paint = () => {
      const copy = COPY[lang];
      paintNotice(copy);
      noteLabel.textContent = copy.note;
      claimButton.textContent = copy.claim;
      const ready = state?.status === 'ready' ? state : null;
      // Claim is offered from the page itself, so a locked action can become enabled without leaving it.
      const work = ready?.work;
      claimBox.hidden = !(work?.canClaim && work.holder?.id !== host.context.person.id);
      noteField.hidden = !ready;
      list.hidden = !ready;
      if (!ready) return;
      const value = typeof ready.values.note === 'string' ? ready.values.note : '';
      if (note.value !== value) note.value = value;
      paintActions(ready, copy);
    };

    async function run(send: () => Promise<void>) {
      if (inFlight) return;
      inFlight = true;
      refusal = null;
      try {
        await send();
      } catch (error) {
        const problem = (error as { problem?: Refusal }).problem;
        refusal = problem ?? { status: 0, type: '', title: error instanceof Error ? error.message : String(error) };
      } finally {
        inFlight = false;
        paint();
      }
    }

    // The handle comes from the nearest <agentflow-task> around `view`: null while it is loading and after it closes.
    let unsubscribe = () => {};
    const stopConsuming = consumeTask(view, (next) => {
      unsubscribe();
      unsubscribe = () => {};
      handle = next;
      state = next?.state ?? null;
      if (next) {
        unsubscribe = next.subscribe((latest) => {
          state = latest;
          paint();
        });
      }
      paint();
    });

    note.addEventListener('input', () => handle?.setValues({ note: note.value }));
    claimButton.addEventListener('click', () => void run(() => handle!.claim()));

    return {
      element: task,
      paint,
      dispose() {
        stopConsuming();
        unsubscribe();
        task.remove();
      },
    };
  };

  let screen: Screen | null = null;
  let shownId: string | undefined;
  const show = (path: string) => {
    const id = REVIEW_PATH.exec(path)?.[1];
    // A query or a fragment that moves keeps the screen, and what the person typed in it.
    if (screen && id === shownId) return;
    screen?.dispose();
    shownId = id;
    screen = !tasksOffered ? noticeScreen((c) => c.unsupported) : id ? reviewScreen(id) : noticeScreen((c) => c.noTask);
    slot.replaceChildren(screen.element);
    screen.paint();
  };

  const showLocale = (locale: string) => {
    lang = langOf(locale);
    provider.setAttribute('locale', lang);
    element.lang = lang;
    heading.textContent = COPY[lang].title;
    screen?.paint();
  };
  // Neither listener is called as it subscribes, so each is read once subscribed: a switch made before then is not lost.
  const offLocale = host.onLocaleChange(showLocale);
  showLocale(host.context.locale);
  const offTheme = host.onThemeChange((theme) => {
    element.dataset.theme = theme.mode;
  });
  element.dataset.theme = host.context.theme.mode;

  // The provider holds the screen, so everything inside it reaches the host's client and tasks.
  provider.append(page);
  element.append(provider);
  const offLocation = host.onLocationChange(show);

  return () => {
    offLocale();
    offTheme();
    offLocation();
    screen?.dispose();
    element.remove();
    style.remove();
  };
}
