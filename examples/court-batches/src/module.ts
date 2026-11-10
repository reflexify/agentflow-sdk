import '@reflexify/agentflow-elements'; // defines <agentflow-provider>, <agentflow-record-table> and <agentflow-start-form>
import { KIT_CSS } from '@reflexify/agentflow-elements/kit';
import type { AgentFlowClient, AppHost } from '@reflexify/agentflow-sdk';
import css from './module.css?inline';

const COPY = {
  en: {
    batches: 'Batches',
    choose: 'Choose a batch to add its dossiers.',
    add: 'Add dossiers',
    hint: 'Pick the folder that holds one folder per prisoner. Each folder becomes a dossier of this batch, with its files, in the batch’s court.',
    back: 'All batches',
  },
  vi: {
    batches: 'Các đợt',
    choose: 'Chọn một đợt để thêm hồ sơ.',
    add: 'Thêm hồ sơ',
    hint: 'Chọn thư mục chứa mỗi phạm nhân một thư mục. Mỗi thư mục thành một hồ sơ của đợt này, kèm các tệp của nó, tại tòa của đợt.',
    back: 'Tất cả các đợt',
  },
} as const;
type Lang = keyof typeof COPY;

const langOf = (locale: string): Lang => (locale.toLowerCase().startsWith('vi') ? 'vi' : 'en');

/** The batch's id is the last segment of `/batches/<id>`. */
const BATCH_PATH = /^\/batches\/([^/?#]+)/;

type ProviderElement = HTMLElement & { client?: AgentFlowClient };
type StartFormElement = HTMLElement & { resumeSets?: Record<string, string> };

/**
 * Where an upload a person started is remembered: one entry per batch and field, holding the upload set's id. It is
 * the tab's own storage, so a reload finds it and another tab does not.
 */
const uploadKey = (batch: string, field = '') => `court-batches.upload.${batch}.${field}`;

/** The upload sets remembered for `batch`, by field. A browser that refuses storage remembers none. */
function rememberedUploads(batch: string): Record<string, string> {
  const sets: Record<string, string> = {};
  try {
    const prefix = uploadKey(batch);
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      const setId = key?.startsWith(prefix) ? sessionStorage.getItem(key) : null;
      if (key && setId) sets[key.slice(prefix.length)] = setId;
    }
  } catch {
    // Nothing to resume.
  }
  return sets;
}

function rememberUpload(batch: string, field: string, setId: string) {
  try {
    sessionStorage.setItem(uploadKey(batch, field), setId);
  } catch {
    // The upload still runs; only a reload would start it again.
  }
}

function forgetUploads(batch: string) {
  try {
    for (const field of Object.keys(rememberedUploads(batch))) sessionStorage.removeItem(uploadKey(batch, field));
  } catch {
    // Nothing was kept.
  }
}

/** One thing the module shows under its heading. */
interface Screen {
  element: Element;
  paint(): void;
}

/**
 * Renders the module in `root`: the batches, and for one batch its "Add dossiers" action. The start form is
 * AgentFlow's own element, so the folder picker, the upload and the preview are the ones AgentFlow's pages use. It
 * returns how to take the module away again.
 */
export function mount(root: ShadowRoot | Element, host: AppHost): () => void {
  const doc = root.ownerDocument;
  const scope = root instanceof ShadowRoot ? root : root.getRootNode();
  const style = doc.createElement('style');
  style.textContent = `${KIT_CSS}\n${css}`;
  (scope instanceof ShadowRoot ? scope : root).prepend(style);

  const element = doc.createElement('div');
  element.className = 'court-batches af-kit';
  // Focusable itself, so a click anywhere inside puts focus in the module.
  element.tabIndex = -1;
  const page = doc.createElement('div');
  page.className = 'cb-page';
  page.innerHTML = '<h1></h1><div data-slot="screen"></div>';
  const heading = page.querySelector('h1')!;
  const slot = page.querySelector<HTMLElement>('[data-slot="screen"]')!;
  root.append(element);

  let lang: Lang = langOf(host.context.locale);

  // Given the host's client before it is appended, so everything inside calls AgentFlow as the host does.
  const provider = doc.createElement('agentflow-provider') as ProviderElement;
  provider.client = host.api;

  const listScreen = (): Screen => {
    const view = doc.createElement('div');
    view.className = 'cb-screen';
    const hint = doc.createElement('p');
    const table = doc.createElement('agentflow-record-table');
    table.setAttribute('entity-key', 'batch');
    table.setAttribute('columns', 'title,status');
    table.addEventListener('record-select', (event) => {
      host.navigate(`/batches/${(event as CustomEvent<{ recordId: string }>).detail.recordId}`);
    });
    view.append(hint, table);
    return {
      element: view,
      paint() {
        heading.textContent = COPY[lang].batches;
        hint.textContent = COPY[lang].choose;
      },
    };
  };

  const batchScreen = (batch: string): Screen => {
    const view = doc.createElement('div');
    view.className = 'cb-screen';
    const back = doc.createElement('button');
    back.type = 'button';
    back.className = 'af-button secondary cb-back';
    back.addEventListener('click', () => host.navigate('/'));
    const hint = doc.createElement('p');

    // The batch's own action, started as AgentFlow's batch page starts it: the record is the run's subject.
    const form = doc.createElement('agentflow-start-form') as StartFormElement;
    form.setAttribute('entity', 'batch');
    form.setAttribute('record', batch);
    form.setAttribute('action', 'add_dossiers');
    // An upload this tab began before a reload goes on where it stopped, when the person picks the same folder.
    form.resumeSets = rememberedUploads(batch);
    form.addEventListener('af-folder-upload-started', (event) => {
      const { setId, field } = (event as CustomEvent<{ setId: string; field: string }>).detail;
      rememberUpload(batch, field, setId);
    });
    // The run took the upload, so there is nothing left to resume: not after a reload, and not in this form either.
    form.addEventListener('workflow-started', () => {
      forgetUploads(batch);
      form.resumeSets = {};
    });

    view.append(back, hint, form);
    return {
      element: view,
      paint() {
        heading.textContent = COPY[lang].add;
        back.textContent = COPY[lang].back;
        hint.textContent = COPY[lang].hint;
      },
    };
  };

  let screen: Screen | null = null;
  let shownBatch: string | undefined | null = null;
  const show = (path: string) => {
    const batch = BATCH_PATH.exec(path)?.[1];
    // A query or a fragment that moves keeps the screen, and an upload running in it.
    if (screen && batch === shownBatch) return;
    shownBatch = batch;
    screen = batch ? batchScreen(batch) : listScreen();
    slot.replaceChildren(screen.element);
    screen.paint();
  };

  const showLocale = (locale: string) => {
    lang = langOf(locale);
    provider.setAttribute('locale', lang);
    element.lang = lang;
    screen?.paint();
  };
  // Neither listener is called as it subscribes, so each is read once subscribed: a switch made before then is not lost.
  const offLocale = host.onLocaleChange(showLocale);
  showLocale(host.context.locale);
  const offTheme = host.onThemeChange((theme) => {
    element.dataset.theme = theme.mode;
  });
  element.dataset.theme = host.context.theme.mode;

  provider.append(page);
  element.append(provider);
  const offLocation = host.onLocationChange(show);

  return () => {
    offLocale();
    offTheme();
    offLocation();
    element.remove();
    style.remove();
  };
}
