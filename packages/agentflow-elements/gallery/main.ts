import { AF_DEFAULT_PALETTE, applyTheme } from '@reflexify/agentflow-sdk';
import { KIT_CSS } from '../src/kit/index.js';
import type { MenuItem, Person, ToastInput } from '../src/kit/index.js';

type Theme = 'light' | 'dark';
type Settable = HTMLElement & Record<string, unknown>;
type ToastElement = HTMLElement & { show(input: ToastInput): string };

interface GalleryEvent { theme: Theme; tag: string; type: string; detail: unknown }
const events: GalleryEvent[] = [];
Object.assign(window, { galleryEvents: events });

const MENU: MenuItem[] = [
  { id: 'open', label: 'Open' },
  { id: 'rename', label: 'Rename' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'move', label: 'Move to section' },
  { id: 'copy-link', label: 'Copy link' },
  { id: 'archive', label: 'Archive', disabled: true, reason: 'Only a manager can archive' },
  { id: 'export', label: 'Export' },
  { id: 'delete', label: 'Delete', danger: true },
];

const PEOPLE: Person[] = [
  { id: 'p-minh', name: 'Lê Minh', email: 'minh@example.com' },
  { id: 'p-hoa', name: 'Trần Hoa', email: 'hoa@example.com' },
  { id: 'p-lan', name: 'Phạm Lan', email: 'lan@example.com' },
  { id: 'p-duc', name: 'Đỗ Đức', email: null },
];

const NOTES = '**Launch checklist**\n\n- Confirm the venue\n- Send the *invitations*\n\nSee [the brief](https://example.com/brief).';

const STYLE = `
  :host { display: block; }
  .gallery { container-type: inline-size; display: grid; gap: 16px; padding: 16px; border-radius: 12px; background: var(--af-bg); color: var(--af-fg); }
  .gallery h2 { margin: 0; font-size: 15px; }
  .row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  .short-column { height: 80px; overflow: auto; padding: 8px; border: 1px dashed var(--af-border); border-radius: 8px; background: var(--af-surface); }
  .short-column p { margin: 8px 0 0; color: var(--af-muted-fg); }
  .field { min-height: 32px; padding: 0 8px; border: 1px solid var(--af-border); border-radius: 6px; background: var(--af-surface); color: inherit; font: inherit; }
  [slot='content'] { display: grid; gap: 6px; }
`;

function markup(theme: Theme): string {
  const t = theme;
  return `
    <style>${KIT_CSS}</style>
    <style>${STYLE}</style>
    <div class="gallery af-kit">
      <h2>${theme === 'light' ? 'Light, English' : 'Dark, Tiếng Việt'}</h2>
      <div class="row">
        <button type="button" class="af-button primary" data-testid="${t}-open-dialog">Open dialog</button>
        <button type="button" class="af-button danger" data-testid="${t}-open-confirm">Open confirm</button>
        <button type="button" class="af-button secondary" data-testid="${t}-show-toast">Show toast</button>
        <button type="button" class="af-button ghost" data-testid="${t}-show-error">Show error toast</button>
        <input class="field" data-testid="${t}-outside" placeholder="A field on the page" />
        <af-dialog heading="Rename project">
          <p>The new name shows everywhere the project is listed.</p>
          <input class="field" data-testid="${t}-dialog-field" placeholder="Project name" />
          <button slot="actions" type="button" class="af-button secondary" data-testid="${t}-dialog-cancel">Cancel</button>
          <button slot="actions" type="button" class="af-button primary" data-testid="${t}-dialog-save">Save</button>
        </af-dialog>
        <af-confirm heading="Delete this task?" message="Its checklist and attachments go with it." impact="2 comments are deleted too." confirm-label="Delete" danger></af-confirm>
        <af-toast></af-toast>
      </div>
      <div class="short-column">
        <div class="row">
          <af-menu label="Task actions">⋯</af-menu>
          <af-date clearable label="Due date"></af-date>
          <af-popover>
            <button slot="anchor" type="button" class="af-button secondary" data-testid="${t}-popover-anchor">Filters</button>
            <div slot="content">
              <input class="field" data-testid="${t}-popover-first" placeholder="Search" />
              <input class="field" data-testid="${t}-popover-second" placeholder="Label" />
            </div>
          </af-popover>
          <af-tooltip text="Tasks due this week">
            <button type="button" class="af-button ghost" data-testid="${t}-tooltip-anchor">This week</button>
          </af-tooltip>
          <af-person-picker placeholder="Assign someone" label="Assignee"></af-person-picker>
        </div>
        <p>This column is 80px tall and scrolls, so an overlay drawn inside it would be cut off at its edge.</p>
        <p>Every overlay above opens into the top layer instead.</p>
      </div>
      <af-rich-editor placeholder="Describe the task" label="Description"></af-rich-editor>
    </div>
  `;
}

function log(theme: Theme, el: Element, type: string) {
  el.addEventListener(type, (e) => events.push({ theme, tag: el.localName, type, detail: (e as CustomEvent).detail }));
}

function pane(parent: HTMLElement, theme: Theme): void {
  const host = document.createElement('div');
  host.className = 'af-app';
  applyTheme(host, { mode: theme, brand: 'azure' }, AF_DEFAULT_PALETTE);
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = markup(theme);
  // Connected first, so each element is upgraded before its properties are set.
  parent.append(host);
  const locale = theme === 'light' ? 'en' : 'vi';
  const one = <T extends Element = Settable>(selector: string) => root.querySelector(selector) as unknown as T;

  for (const el of root.querySelectorAll('af-dialog, af-confirm, af-menu, af-popover, af-tooltip, af-toast, af-date, af-person-picker, af-rich-editor')) {
    (el as Settable).locale = locale;
    el.setAttribute('data-theme', theme);
  }

  const dialog = one('af-dialog');
  log(theme, dialog, 'close');
  dialog.addEventListener('close', () => {
    if (!dialog.hasAttribute('data-keep-open')) dialog.open = false;
  });
  one(`[data-testid="${theme}-open-dialog"]`).addEventListener('click', () => (dialog.open = true));
  for (const id of ['cancel', 'save']) one(`[data-testid="${theme}-dialog-${id}"]`).addEventListener('click', () => (dialog.open = false));

  const confirm = one('af-confirm');
  log(theme, confirm, 'confirm');
  log(theme, confirm, 'cancel');
  for (const type of ['confirm', 'cancel']) {
    confirm.addEventListener(type, () => {
      if (!confirm.hasAttribute('data-keep-open')) confirm.open = false;
    });
  }
  one(`[data-testid="${theme}-open-confirm"]`).addEventListener('click', () => (confirm.open = true));

  const toast = one<ToastElement>('af-toast');
  log(theme, toast, 'action');
  one(`[data-testid="${theme}-show-toast"]`).addEventListener('click', () => toast.show({ kind: 'success', text: theme === 'light' ? 'Task completed' : 'Đã hoàn thành task' }));
  one(`[data-testid="${theme}-show-error"]`).addEventListener('click', () =>
    toast.show({ kind: 'error', text: theme === 'light' ? 'Could not save' : 'Không lưu được', action: { id: 'retry', label: theme === 'light' ? 'Retry' : 'Thử lại' } }),
  );

  const menu = one('af-menu');
  menu.items = MENU;
  log(theme, menu, 'select');

  const date = one('af-date');
  date.value = '2026-09-15';
  log(theme, date, 'change');
  date.addEventListener('change', (e) => (date.value = (e as CustomEvent<{ value: string | null }>).detail.value));

  const popover = one('af-popover');
  log(theme, popover, 'close');
  popover.addEventListener('close', () => (popover.open = false));
  one(`[data-testid="${theme}-popover-anchor"]`).addEventListener('click', () => (popover.open = true));

  const picker = one('af-person-picker');
  picker.people = PEOPLE;
  picker.value = 'p-hoa';
  log(theme, picker, 'change');
  log(theme, picker, 'search');
  picker.addEventListener('change', (e) => (picker.value = (e as CustomEvent<{ value: string | null }>).detail.value));

  const editor = one('af-rich-editor');
  editor.value = NOTES;
  log(theme, editor, 'change');
  editor.addEventListener('change', (e) => (editor.value = (e as CustomEvent<{ value: string }>).detail.value));
}

const main = document.getElementById('gallery')!;
for (const theme of ['light', 'dark'] as const) pane(main, theme);
