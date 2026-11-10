// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { DRILL, REVENUE_SPEC, TILE_FIELDS, bucketOf, chartResult, chartTile, listTile, measure, revenueResult, tileResult, uuid } from '../kit/fixtures/tile.js';
import { COLUMN_FANS_OUT, LIST, PIE, TEXT } from '../kit/fixtures/tiles.js';
import { hasKitBundle, loadKit, settle, type KitEntry } from './harness.js';
import pkg from '../../package.json';

// The kit's public surface, read from the README. Attributes are the string and Boolean properties' own; the rest are
// properties only. A tag with no shadow root has no parts; the classes of the nodes it draws are its surface instead.
const CONTRACT: Record<string, { attributes: string[]; properties: string[]; methods?: string[]; parts: string[]; classes?: string[] }> = {
  'af-dialog': { attributes: ['open', 'heading', 'placement', 'locale'], properties: ['open', 'heading', 'placement', 'locale', 'strings'], parts: ['content', 'heading', 'close', 'body', 'actions', 'viewport', 'scrollbar', 'thumb'] },
  'af-confirm': {
    attributes: ['open', 'heading', 'message', 'confirm-label', 'danger', 'impact', 'busy', 'locale'],
    properties: ['open', 'heading', 'message', 'confirmLabel', 'danger', 'impact', 'busy', 'locale', 'strings'],
    parts: ['content', 'heading', 'message', 'impact', 'actions', 'cancel', 'confirm'],
  },
  'af-menu': { attributes: ['label', 'disabled', 'reason', 'locale'], properties: ['items', 'label', 'disabled', 'reason', 'locale', 'strings'], parts: ['trigger', 'item', 'viewport', 'scrollbar', 'thumb', 'group', 'heading', 'separator', 'indicator'] },
  'af-popover': { attributes: ['open', 'placement', 'locale'], properties: ['open', 'placement', 'locale', 'strings'], parts: ['anchor', 'content'] },
  'af-tooltip': { attributes: ['text', 'locale'], properties: ['text', 'locale', 'strings'], parts: ['anchor'] },
  'af-toast': { attributes: ['locale'], properties: ['locale', 'strings'], methods: ['show', 'dismiss'], parts: ['toast', 'icon', 'text', 'action', 'close'] },
  'af-date': {
    attributes: ['value', 'min', 'max', 'clearable', 'placeholder', 'label', 'disabled', 'locale', 'name', 'required', 'readonly', 'description', 'error', 'invalid', 'range', 'start', 'end', 'format'],
    properties: ['value', 'min', 'max', 'clearable', 'placeholder', 'label', 'disabled', 'locale', 'strings', 'name', 'required', 'readonly', 'description', 'error', 'invalid', 'range', 'start', 'end', 'format'],
    parts: ['control', 'input', 'trigger', 'content', 'today', 'clear', 'start', 'separator', 'end'],
  },
  'af-person-picker': {
    attributes: ['value', 'multiple', 'placeholder', 'label', 'loading', 'disabled', 'locale', 'name', 'required', 'readonly', 'description', 'error', 'invalid'],
    properties: ['people', 'source', 'value', 'multiple', 'placeholder', 'label', 'loading', 'disabled', 'locale', 'strings', 'name', 'required', 'readonly', 'description', 'error', 'invalid'],
    parts: ['control', 'chip', 'remove', 'input', 'clear', 'content', 'option', 'empty', 'loading', 'load-more', 'viewport', 'scrollbar', 'thumb'],
  },
  'af-number-input': {
    attributes: ['value', 'min', 'max', 'step', 'precision', 'fractional', 'unscaled', 'format', 'currency', 'steppers', 'placeholder', 'label', 'disabled', 'locale', 'separators', 'name', 'required', 'readonly', 'description', 'error', 'invalid'],
    properties: ['value', 'min', 'max', 'step', 'precision', 'fractional', 'unscaled', 'format', 'currency', 'steppers', 'placeholder', 'label', 'disabled', 'locale', 'separators', 'strings', 'name', 'required', 'readonly', 'description', 'error', 'invalid'],
    parts: ['control', 'input', 'increment', 'decrement'],
  },
  'af-select': {
    attributes: ['value', 'multiple', 'placeholder', 'label', 'disabled', 'locale', 'name', 'required', 'readonly', 'description', 'error', 'invalid', 'size'],
    properties: ['options', 'value', 'multiple', 'placeholder', 'label', 'disabled', 'locale', 'strings', 'name', 'required', 'readonly', 'description', 'error', 'invalid', 'size'],
    parts: ['trigger', 'value', 'indicator', 'content', 'option', 'empty', 'viewport', 'scrollbar', 'thumb'],
  },
  'af-combobox': {
    attributes: ['value', 'multiple', 'placeholder', 'label', 'loading', 'disabled', 'locale', 'name', 'required', 'readonly', 'description', 'error', 'invalid'],
    properties: ['options', 'source', 'value', 'multiple', 'placeholder', 'label', 'loading', 'disabled', 'locale', 'strings', 'name', 'required', 'readonly', 'description', 'error', 'invalid'],
    parts: ['control', 'chip', 'remove', 'input', 'clear', 'content', 'option', 'empty', 'loading', 'load-more', 'viewport', 'scrollbar', 'thumb'],
  },
  'af-rich-editor': {
    attributes: ['value', 'readonly', 'placeholder', 'label', 'locale'],
    properties: ['value', 'readonly', 'placeholder', 'label', 'locale', 'strings'],
    parts: [
      'toolbar', 'tool-bold', 'tool-italic', 'tool-bullet-list', 'tool-numbered-list', 'tool-link', 'link-popover', 'link-input', 'link-apply',
      'placeholder', 'content', 'viewport', 'scrollbar', 'thumb',
    ],
  },
  'af-tile': {
    attributes: ['drill', 'locale'],
    properties: ['spec', 'result', 'fields', 'rows', 'columns', 'paging', 'table', 'drill', 'locale', 'strings'],
    parts: [
      'frame', 'head', 'title', 'state', 'figure', 'label', 'value', 'meta', 'goal', 'comparison', 'secondary', 'plot', 'zero', 'slice', 'table-toggle', 'table', 'legend', 'legend-item', 'tooltip',
      'verdict', 'notes', 'prose', 'list', 'badge', 'ref', 'file', 'mention', 'mention-icon', 'pager', 'viewport', 'scrollbar', 'thumb', 'corner',
    ],
  },
  'af-field': {
    attributes: ['label', 'description', 'error', 'invalid', 'required', 'readonly', 'edited', 'locked-reason', 'name', 'locale'],
    properties: ['label', 'description', 'error', 'invalid', 'required', 'readonly', 'edited', 'lockedReason', 'name', 'locale', 'strings'],
    parts: [],
    classes: ['af-field', 'af-field-row', 'af-field-label', 'af-field-required', 'af-field-description', 'af-field-error', 'af-field-lock'],
  },
  'af-fieldset': {
    attributes: ['heading', 'description', 'columns', 'locale'],
    properties: ['heading', 'description', 'columns', 'locale', 'strings'],
    parts: [],
    classes: ['af-fieldset', 'af-fieldset-legend', 'af-fieldset-description'],
  },
  'af-form': {
    attributes: ['busy', 'dirty', 'locale'],
    properties: ['errors', 'busy', 'dirty', 'locale', 'strings'],
    parts: [],
    classes: ['af-form-summary'],
  },
  'af-scroll-area': { attributes: ['axis', 'label', 'locale'], properties: ['axis', 'label', 'locale', 'strings', 'viewport'], parts: ['viewport', 'content', 'scrollbar', 'thumb', 'corner'] },
  'af-tabs': { attributes: ['value', 'label', 'variant', 'locale'], properties: ['items', 'value', 'label', 'variant', 'locale', 'strings'], parts: ['list', 'tab', 'panel'] },
  'af-splitter': { attributes: ['size', 'min', 'max', 'orientation', 'label', 'locale'], properties: ['size', 'min', 'max', 'orientation', 'label', 'locale', 'strings'], parts: ['start', 'end', 'handle'] },
  'af-pager': {
    attributes: ['mode', 'has-prev', 'has-next', 'has-more', 'busy', 'page-size', 'range-start', 'range-end', 'total', 'shown', 'focus-new', 'controls', 'locale'],
    properties: ['mode', 'hasPrev', 'hasNext', 'hasMore', 'busy', 'pageSize', 'pageSizes', 'rangeStart', 'rangeEnd', 'total', 'shown', 'focusNew', 'controls', 'locale', 'strings'],
    parts: ['prev', 'next', 'range', 'page-size', 'more', 'status'],
  },
  'af-copy-button': { attributes: ['value', 'label', 'locale'], properties: ['value', 'label', 'locale', 'strings'], parts: ['trigger', 'status'] },
  'af-markdown': { attributes: ['value', 'locale'], properties: ['value', 'mentions', 'schemes', 'locale', 'strings'], parts: ['content', 'viewport', 'scrollbar', 'thumb'] },
  'af-tree-picker': {
    attributes: ['value', 'multiple', 'max', 'placeholder', 'label', 'loading', 'disabled', 'locale', 'name', 'required', 'readonly', 'description', 'error', 'invalid'],
    properties: ['nodes', 'source', 'value', 'multiple', 'max', 'placeholder', 'label', 'loading', 'disabled', 'locale', 'strings', 'name', 'required', 'readonly', 'description', 'error', 'invalid'],
    parts: [
      'control', 'chip', 'remove', 'input', 'clear', 'content', 'tree', 'node', 'toggle', 'check', 'code', 'ancestry', 'archived', 'empty', 'loading', 'load-more',
      'viewport', 'scrollbar', 'thumb',
    ],
  },
  'af-bulk-bar': {
    attributes: ['count', 'total', 'label', 'locale'],
    properties: ['count', 'total', 'label', 'locale', 'strings'],
    methods: ['focus'],
    parts: ['bar', 'count', 'text', 'clear', 'more', 'status'],
  },
  'af-file-upload': {
    attributes: ['accept', 'multiple', 'replace', 'label', 'max-files', 'disabled', 'locale', 'name', 'required', 'readonly', 'description', 'error', 'invalid'],
    properties: ['items', 'accept', 'multiple', 'replace', 'label', 'maxFiles', 'disabled', 'locale', 'strings', 'name', 'required', 'readonly', 'description', 'error', 'invalid'],
    parts: ['dropzone', 'trigger', 'hint', 'notice', 'list', 'item', 'icon', 'preview', 'name', 'size', 'progress', 'status', 'remove'],
  },
  'af-signature-pad': {
    attributes: ['value', 'label', 'disabled', 'locale', 'name', 'required', 'readonly', 'description', 'error', 'invalid'],
    properties: ['value', 'label', 'disabled', 'locale', 'strings', 'name', 'required', 'readonly', 'description', 'error', 'invalid'],
    methods: ['clear', 'focus'],
    parts: ['control', 'segment', 'guide', 'image', 'clear', 'hint'],
  },
  'af-folder-source': {
    attributes: ['workflow', 'version', 'field', 'resume-set', 'disabled', 'locale'],
    properties: ['sources', 'workflow', 'version', 'field', 'folder', 'resumeSet', 'offer', 'disabled', 'locale', 'strings'],
    parts: [
      'sources', 'source', 'hint', 'dropzone', 'trigger', 'progress', 'cancel', 'notice', 'retry', 'path', 'crumb', 'list', 'folder', 'choose', 'open', 'more', 'empty',
      'chosen', 'preview', 'refusal', 'count', 'sample', 'reason',
    ],
  },
};
const PEOPLE = [{ id: 'u1', name: 'Nguyễn Văn Bình' }, { id: 'u2', name: 'Trần Thị Hoa' }];

type Kit = HTMLElement & Record<string, unknown>;
interface Heard { type: string; detail: unknown; bubbles: boolean; composed: boolean }

// The parts each test has seen, checked against the table by the last test.
const shown = new Map<string, Set<string>>();
const part = (el: Element, name: string) => el.shadowRoot?.querySelector<HTMLElement>(`[part~="${name}"]`) ?? null;
function see(el: Element, ...names: string[]) {
  for (const name of names) {
    expect(part(el, name), `${el.localName} part ${name}`).not.toBeNull();
    const set = shown.get(el.localName) ?? new Set<string>();
    set.add(name);
    shown.set(el.localName, set);
  }
}

/** Mounts `tag` inside another component's shadow root, as a module would, and records the events heard on that root. */
async function mount(tag: string, props: Record<string, unknown> = {}, inner = '') {
  document.body.innerHTML = '';
  const host = document.createElement('div');
  const root = host.attachShadow({ mode: 'open' });
  const el = document.createElement(tag) as Kit;
  Object.assign(el, props);
  el.innerHTML = inner;
  root.append(el);
  document.body.append(host);
  const heard: Heard[] = [];
  const outside: string[] = [];
  const listen = (type: string) => {
    root.addEventListener(type, (e) => {
      if (e.target === el) heard.push({ type, detail: (e as CustomEvent).detail, bubbles: e.bubbles, composed: e.composed });
    });
    document.body.addEventListener(type, (e) => {
      if (e instanceof CustomEvent) outside.push(type);
    });
  };
  for (const type of ['close', 'confirm', 'cancel', 'select', 'action', 'change', 'search', 'tab-change', 'size-change', 'prev', 'next', 'more', 'page-size-change', 'af-copy', 'af-link', 'af-drill', 'af-open-record', 'af-page', 'af-submit', 'clear', 'files-add', 'remove', 'unparsed', 'af-folder-upload-started', 'af-folder-progress', 'af-folder-change', 'af-folder-error', 'af-folder-busy']) listen(type);
  await settle();
  return { el, heard, outside };
}
const event = (type: string, detail: unknown): Heard => ({ type, detail, bubbles: true, composed: false });
const key = (target: Element, k: string) => target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, composed: true }));
async function typeInto(input: HTMLInputElement, text: string) {
  input.focus();
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  await settle();
}

describe.skipIf(!hasKitBundle)('the kit contract, against dist/kit.js', () => {
  let kit: KitEntry;
  beforeAll(async () => {
    // ProseMirror calls this when its content takes focus; jsdom has none.
    (document as Document & { execCommand?: () => boolean }).execCommand ??= () => false;
    kit = await loadKit();
  });
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('registers the twenty-seven tags, idempotently, each stamped with the kit version', async () => {
    expect([...kit.KIT_TAGS]).toEqual(Object.keys(CONTRACT));
    const before = kit.KIT_TAGS.map((t) => customElements.get(t));
    expect(() => kit.defineKitElements()).not.toThrow();
    await loadKit();
    kit.KIT_TAGS.forEach((t, i) => {
      expect(customElements.get(t), t).toBeDefined();
      expect(customElements.get(t), t).toBe(before[i]);
      expect((customElements.get(t) as unknown as { kitVersion: string }).kitVersion, t).toBe(kit.KIT_VERSION);
    });
    expect(kit.KIT_VERSION).toMatch(/^\d+\.\d+\.\d+/);
    expect(typeof kit.KIT_CSS).toBe('string');
  });

  it('publishes kit.css beside kit.js with the scoped rules', () => {
    const file = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../../dist/kit.css'), 'utf8');
    for (const selector of ['.af-kit {', '.af-button', '.af-chip', '.af-banner']) expect(file).toContain(selector);
    expect(pkg.exports['./kit.css']).toBe('./dist/kit.css');
  });

  it('observes every documented attribute and has every documented property and method, before it connects', () => {
    for (const [tag, c] of Object.entries(CONTRACT)) {
      const observed = (customElements.get(tag) as unknown as { observedAttributes: string[] }).observedAttributes;
      for (const a of c.attributes) expect(observed, `${tag} observes ${a}`).toContain(a);
      const el = document.createElement(tag);
      for (const p of c.properties) expect(p in el, `${tag}.${p}`).toBe(true);
      for (const m of c.methods ?? []) expect(typeof (el as unknown as Record<string, unknown>)[m], `${tag}.${m}()`).toBe('function');
    }
  });

  it('reads a Boolean attribute by its presence', async () => {
    const { el } = await mount('af-person-picker', { people: PEOPLE });
    el.setAttribute('disabled', 'false');
    await settle();
    expect((part(el, 'input') as HTMLInputElement).disabled).toBe(true);
    el.removeAttribute('disabled');
    await settle();
    expect((part(el, 'input') as HTMLInputElement).disabled).toBe(false);
  });

  it('af-dialog: close for Escape, the close button and a press outside; data-raised is never set', async () => {
    const { el, heard, outside } = await mount('af-dialog', { open: true, heading: 'Sửa' }, '<p>Body</p><button slot="actions">Lưu</button>');
    see(el, 'content', 'heading', 'close', 'body', 'actions', 'viewport', 'scrollbar', 'thumb');
    key(part(el, 'content')!, 'Escape');
    await settle();
    part(el, 'close')!.click();
    await settle();
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }));
    await settle();
    expect(heard).toEqual([event('close', { reason: 'escape' }), event('close', { reason: 'close-button' }), event('close', { reason: 'outside' })]);
    expect(outside).toEqual([]);
    expect(el.hasAttribute('data-raised')).toBe(false);
  });

  it('af-confirm: confirm with an empty detail, cancel for the button and Escape', async () => {
    const { el, heard } = await mount('af-confirm', { open: true, heading: 'Xoá?', message: 'Không hoàn tác được.', impact: '2 task', confirmLabel: 'Xoá' });
    see(el, 'content', 'heading', 'message', 'impact', 'actions', 'cancel', 'confirm');
    part(el, 'confirm')!.click();
    part(el, 'cancel')!.click();
    key(part(el, 'content')!, 'Escape');
    await settle();
    expect(heard).toEqual([event('confirm', {}), event('cancel', { reason: 'close-button' }), event('cancel', { reason: 'escape' })]);
  });

  it('af-menu: select with the id, checked for a checkable item, and data-raised on the host while open', async () => {
    const items = [
      { id: 'rename', label: 'Đổi tên' },
      { id: 'archive', label: 'Lưu trữ', disabled: true, reason: 'Không' },
      { id: 'view', heading: 'Hiển thị', items: [{ id: 'archived', label: 'Hiện mục đã lưu trữ', type: 'checkbox', checked: true }] },
    ];
    const { el, heard } = await mount('af-menu', { items, label: 'Thao tác' }, '⋯');
    see(el, 'trigger');
    part(el, 'trigger')!.click();
    await settle();
    expect(el.dataset.raised).toBe('true');
    see(el, 'item', 'viewport', 'scrollbar', 'thumb', 'group', 'heading', 'separator', 'indicator');
    part(el, 'item')!.click();
    await settle();
    expect(el.dataset.raised).toBe('false');
    part(el, 'trigger')!.click();
    await settle();
    (el.shadowRoot!.querySelector('[role="menuitemcheckbox"]') as HTMLElement).click();
    await settle();
    expect(heard).toEqual([event('select', { id: 'rename' }), event('select', { id: 'archived', checked: false })]);
    expect(el.dataset.raised).toBe('false');
  });

  it('af-popover: close with the reason, and data-raised on the host', async () => {
    const { el, heard } = await mount('af-popover', { open: false }, '<button slot="anchor">Mở</button><div slot="content"><input></div>');
    see(el, 'anchor', 'content');
    expect(el.dataset.raised).not.toBe('true');
    el.open = true;
    await settle();
    expect(el.dataset.raised).toBe('true');
    key(part(el, 'content')!, 'Escape');
    await settle();
    expect(heard).toEqual([event('close', { reason: 'escape' })]);
  });

  it('af-tooltip: its anchor, and data-raised on the host on keyboard focus', async () => {
    const { el } = await mount('af-tooltip', { text: 'Gợi ý' }, '<button>?</button>');
    see(el, 'anchor');
    part(el, 'anchor')!.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }));
    await settle();
    expect(el.dataset.raised).toBe('true');
  });

  it('af-toast: action with the toast id, and every toast part', async () => {
    const { el, heard } = await mount('af-toast');
    const id = (el.show as (i: unknown) => string)({ kind: 'error', text: 'Không lưu được', action: { id: 'retry', label: 'Thử lại' } });
    await settle();
    see(el, 'toast', 'icon', 'text', 'action', 'close');
    expect(el.dataset.raised).toBe('true');
    part(el, 'action')!.click();
    await settle();
    expect(heard).toEqual([event('action', { toast: id, action: 'retry' })]);
    (el.dismiss as (id: string) => void)(id);
  });

  it('af-date: change with an ISO value, and every part', async () => {
    const { el, heard } = await mount('af-date', { value: null, locale: 'vi', clearable: true, label: 'Hạn' });
    see(el, 'control', 'input', 'trigger');
    expect(part(el, 'input')!.getAttribute('aria-label')).toBe('Hạn');
    const input = part(el, 'input') as HTMLInputElement;
    await typeInto(input, '20/10/2026');
    key(input, 'Enter');
    await settle();
    expect(heard).toEqual([event('change', { value: '2026-10-20' })]);
    part(el, 'trigger')!.click();
    await settle();
    expect(el.dataset.raised).toBe('true');
    see(el, 'content', 'today', 'clear');
  });

  it('af-date format: unparsed with the text it cannot read', async () => {
    const { el, heard } = await mount('af-date', { value: null, locale: 'vi', format: 'DD/MM/YYYY', label: 'Hạn' });
    const input = part(el, 'input') as HTMLInputElement;
    await typeInto(input, '31/02/2026');
    key(input, 'Enter');
    await settle();
    expect(heard).toEqual([event('unparsed', { text: '31/02/2026' })]);
  });

  it('af-date range: change with both ends, and the range parts', async () => {
    const { el, heard } = await mount('af-date', { range: true, end: '2026-11-30', locale: 'vi', label: 'Hạn' });
    see(el, 'start', 'separator', 'end');
    expect(part(el, 'start')!.getAttribute('aria-label')).toBe('Hạn: Ngày bắt đầu');
    const start = part(el, 'start') as HTMLInputElement;
    await typeInto(start, '01/11/2026');
    key(start, 'Enter');
    await settle();
    expect(heard).toEqual([event('change', { start: '2026-11-01', end: '2026-11-30' })]);
  });

  it('af-person-picker: search with the query, change in the shape of value, a source’s pages, and every part', async () => {
    const single = await mount('af-person-picker', { people: PEOPLE, value: 'u1', label: 'Người làm' });
    see(single.el, 'control', 'input', 'clear');
    expect(part(single.el, 'input')!.getAttribute('aria-label')).toBe('Người làm');
    part(single.el, 'clear')!.click();
    await settle();
    expect(single.heard).toEqual([event('change', { value: null })]);

    const many = await mount('af-person-picker', { people: PEOPLE, value: ['u1'], multiple: true });
    see(many.el, 'chip', 'remove');
    await typeInto(part(many.el, 'input') as HTMLInputElement, 'hoa');
    expect(many.el.dataset.raised).toBe('true');
    see(many.el, 'content', 'option', 'viewport', 'scrollbar', 'thumb');
    part(many.el, 'option')!.click();
    await settle();
    expect(many.heard).toEqual([event('search', { query: 'hoa' }), event('change', { value: ['u1', 'u2'] })]);
    await typeInto(part(many.el, 'input') as HTMLInputElement, 'zzz');
    see(many.el, 'empty');

    let answer!: (page: { items: typeof PEOPLE; next: string | null }) => void;
    const source = () => new Promise<{ items: typeof PEOPLE; next: string | null }>((r) => (answer = r));
    const sourced = await mount('af-person-picker', { source, value: null });
    part(sourced.el, 'input')!.focus();
    key(part(sourced.el, 'input')!, 'ArrowDown');
    await settle();
    see(sourced.el, 'loading');
    answer({ items: PEOPLE, next: 'c2' });
    await settle();
    see(sourced.el, 'load-more');
  });

  it('af-number-input: change with a number on commit, and every part', async () => {
    const { el, heard } = await mount('af-number-input', { value: 2, locale: 'vi', steppers: true, precision: 2, label: 'Số lượng' });
    see(el, 'control', 'input', 'increment', 'decrement');
    const input = part(el, 'input') as HTMLInputElement;
    expect(input.getAttribute('aria-label')).toBe('Số lượng');
    await typeInto(input, '3,5');
    expect(heard).toEqual([]);
    key(input, 'Enter');
    await settle();
    part(el, 'increment')!.click();
    await settle();
    expect(heard).toEqual([event('change', { value: 3.5 }), event('change', { value: 3 })]);
    // A dot groups in Vietnamese, so "3.5" cannot be a number there: refused, with the text.
    await typeInto(input, '3.5');
    key(input, 'Enter');
    await settle();
    expect(heard.slice(2)).toEqual([event('unparsed', { text: '3.5' })]);
  });

  it('af-select: change in the shape of value, and every part', async () => {
    const options = [{ value: 'open', label: 'Mở' }, { value: 'closed', label: 'Đóng' }];
    const single = await mount('af-select', { options, value: 'open', label: 'Trạng thái' });
    see(single.el, 'trigger', 'value', 'indicator');
    expect(part(single.el, 'trigger')!.getAttribute('aria-label')).toBe('Trạng thái');
    part(single.el, 'trigger')!.click();
    await settle();
    expect(single.el.dataset.raised).toBe('true');
    see(single.el, 'content', 'option', 'viewport', 'scrollbar', 'thumb');
    [...single.el.shadowRoot!.querySelectorAll<HTMLElement>('[part~="option"]')][1]!.click();
    await settle();
    expect(single.heard).toEqual([event('change', { value: 'closed' })]);

    const many = await mount('af-select', { options, value: ['open'], multiple: true });
    part(many.el, 'trigger')!.click();
    await settle();
    [...many.el.shadowRoot!.querySelectorAll<HTMLElement>('[part~="option"]')][1]!.click();
    await settle();
    expect(many.heard).toEqual([event('change', { value: ['open', 'closed'] })]);

    const empty = await mount('af-select', { options: [] });
    part(empty.el, 'trigger')!.click();
    await settle();
    see(empty.el, 'empty');
  });

  it('af-combobox: search with the query, change in the shape of value, a source’s pages, and every part', async () => {
    const options = [{ value: 'dn', label: 'Đà Nẵng', description: 'Miền Trung' }, { value: 'hn', label: 'Hà Nội' }];
    const single = await mount('af-combobox', { options, value: 'dn', label: 'Thành phố' });
    see(single.el, 'control', 'input', 'clear');
    expect(part(single.el, 'input')!.getAttribute('aria-label')).toBe('Thành phố');
    expect((part(single.el, 'input') as HTMLInputElement).value).toBe('Đà Nẵng');
    part(single.el, 'clear')!.click();
    await settle();
    expect(single.heard).toEqual([event('change', { value: null })]);

    const many = await mount('af-combobox', { options, value: ['dn'], multiple: true });
    see(many.el, 'chip', 'remove');
    await typeInto(part(many.el, 'input') as HTMLInputElement, 'ha noi');
    expect(many.el.dataset.raised).toBe('true');
    see(many.el, 'content', 'option', 'viewport', 'scrollbar', 'thumb');
    part(many.el, 'option')!.click();
    await settle();
    expect(many.heard).toEqual([event('search', { query: 'ha noi' }), event('change', { value: ['dn', 'hn'] })]);
    await typeInto(part(many.el, 'input') as HTMLInputElement, 'zzz');
    see(many.el, 'empty');

    let answer!: (page: { items: typeof options; next: string | null }) => void;
    const source = () => new Promise<{ items: typeof options; next: string | null }>((r) => (answer = r));
    const sourced = await mount('af-combobox', { source, value: null });
    part(sourced.el, 'input')!.focus();
    key(part(sourced.el, 'input')!, 'ArrowDown');
    await settle();
    see(sourced.el, 'loading');
    answer({ items: options, next: 'c2' });
    await settle();
    see(sourced.el, 'load-more');
  });

  it('af-rich-editor: change with the Markdown after an edit, and every part', async () => {
    const { el, heard } = await mount('af-rich-editor', { value: 'Việc', placeholder: 'Mô tả', label: 'Mô tả' });
    see(el, 'toolbar', 'tool-bold', 'tool-italic', 'tool-bullet-list', 'tool-numbered-list', 'tool-link', 'content', 'viewport', 'scrollbar', 'thumb');
    await expect.poll(() => (part(el, 'tool-bullet-list') as HTMLButtonElement).disabled, { timeout: 5000 }).toBe(false);
    expect(el.shadowRoot!.querySelector('[contenteditable]')?.getAttribute('aria-label')).toBe('Mô tả');
    part(el, 'tool-bullet-list')!.click();
    await expect.poll(() => heard.length, { timeout: 3000 }).toBe(1);
    expect(heard).toEqual([event('change', { value: '- Việc' })]);
    part(el, 'tool-link')!.click();
    await settle();
    see(el, 'link-popover', 'link-input', 'link-apply');
    const empty = await mount('af-rich-editor', { value: '', placeholder: 'Mô tả' });
    await expect.poll(() => part(empty.el, 'placeholder') !== null, { timeout: 5000 }).toBe(true);
    see(empty.el, 'placeholder');
  });

  it('af-tile: af-drill with the address from the value and af-open-record with the row\u2019s record, only with drill, and every part', async () => {
    const detail = { drill: DRILL, measure: uuid(1), bucket: null, segment: null, label: 'sum · Amount', count: 12, other: false, newTab: false };
    const loading = await mount('af-tile');
    see(loading.el, 'frame', 'state');

    const { el, heard, outside } = await mount('af-tile', { spec: REVENUE_SPEC, result: revenueResult(1200, 12, { coverage: { partial: true } }), fields: TILE_FIELDS });
    await expect.poll(() => part(el, 'figure') !== null, { timeout: 5000 }).toBe(true);
    see(el, 'frame', 'title', 'figure', 'label', 'value', 'meta', 'goal', 'comparison', 'secondary', 'notes');
    part(el, 'value')!.click();
    expect(heard, 'without drill the value is text').toEqual([]);

    el.setAttribute('drill', '');
    await expect.poll(() => part(el, 'value')!.tagName).toBe('BUTTON');
    part(el, 'value')!.click();
    expect(heard).toEqual([event('af-drill', detail)]);
    expect(outside).toEqual([]);

    const column = await mount('af-tile', {
      spec: chartTile('column', [measure(1, { primary: true })]),
      result: chartResult({ [uuid(1)]: [bucketOf('new', 5), bucketOf('won', 8)] }),
      fields: TILE_FIELDS,
    });
    await expect.poll(() => part(column.el, 'plot') !== null, { timeout: 5000 }).toBe(true);
    see(column.el, 'head', 'plot', 'table-toggle');
    part(column.el, 'table-toggle')!.click();
    await expect.poll(() => part(column.el, 'table') !== null, { timeout: 5000 }).toBe(true);
    see(column.el, 'table', 'viewport', 'scrollbar', 'thumb', 'corner');

    const legend = await mount('af-tile', {
      spec: chartTile('column', [measure(1, { primary: true }), measure(2, { label: 'Second' })]),
      result: chartResult({ [uuid(1)]: [bucketOf('new', 5, { drill: DRILL }), bucketOf('won', 8)], [uuid(2)]: [bucketOf('new', 2), bucketOf('won', 4)] }),
      fields: TILE_FIELDS,
      drill: true,
    });
    await expect.poll(() => part(legend.el, 'legend') !== null, { timeout: 5000 }).toBe(true);
    const mark = legend.el.shadowRoot!.querySelector<SVGElement>('[role="button"]')!;
    mark.focus();
    await expect.poll(() => legend.el.dataset.raised, { timeout: 3000 }).toBe('true');
    see(legend.el, 'legend', 'legend-item', 'tooltip');
    mark.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(legend.heard, 'a mark sends the same event as the value of a number tile').toEqual([
      event('af-drill', { drill: DRILL, measure: uuid(1), bucket: 'new', segment: null, label: 'new', count: 5, other: false, newTab: false }),
    ]);
    expect(legend.outside).toEqual([]);

    const crossing = await mount('af-tile', {
      spec: chartTile('line', [measure(1, { primary: true })]),
      result: chartResult({ [uuid(1)]: [bucketOf('new', -3), bucketOf('won', 5)] }),
      fields: TILE_FIELDS,
    });
    await expect.poll(() => part(crossing.el, 'zero') !== null, { timeout: 5000 }).toBe(true);
    see(crossing.el, 'zero');

    const pie = await mount('af-tile', { spec: PIE.spec, result: PIE.result, fields: PIE.fields });
    await expect.poll(() => part(pie.el, 'slice') !== null, { timeout: 5000 }).toBe(true);
    see(pie.el, 'slice');
    const fanned = await mount('af-tile', { spec: COLUMN_FANS_OUT.spec, result: COLUMN_FANS_OUT.result, fields: COLUMN_FANS_OUT.fields });
    await expect.poll(() => part(fanned.el, 'verdict') !== null, { timeout: 5000 }).toBe(true);
    see(fanned.el, 'verdict');
    const text = await mount('af-tile', { spec: TEXT.spec, result: null, fields: null });
    await expect.poll(() => part(text.el, 'prose') !== null, { timeout: 5000 }).toBe(true);
    see(text.el, 'prose');

    const unavailable = await mount('af-tile', { spec: REVENUE_SPEC, result: tileResult({}, { outcome: 'unavailable' }) });
    await expect.poll(() => part(unavailable.el, 'figure') === null && part(unavailable.el, 'state')?.textContent?.includes('Not available')).toBe(true);
    see(unavailable.el, 'state');
    const notDrawn = await mount('af-tile', { spec: { ...listTile(), kind: 'map' }, result: tileResult({}) });
    await expect.poll(() => part(notDrawn.el, 'state')?.textContent?.includes('cannot be drawn')).toBe(true);

    const list = await mount('af-tile', { spec: LIST.spec, result: LIST.result, fields: LIST.fields, rows: LIST.rows, columns: LIST.columns });
    await expect.poll(() => part(list.el, 'list') !== null, { timeout: 5000 }).toBe(true);
    see(list.el, 'list', 'badge', 'ref', 'file');
    expect(part(list.el, 'pager'), 'no paging, no pager').toBeNull();
    const second = list.el.shadowRoot!.querySelectorAll<HTMLElement>('[part~="list"] tbody tr')[1]!;
    second.click();
    expect(list.heard, 'without drill a row is text').toEqual([]);
    list.el.setAttribute('drill', '');
    await expect.poll(() => list.el.shadowRoot!.querySelectorAll('[part~="list"] button').length).toBe(3);
    second.click();
    expect(list.heard).toEqual([event('af-open-record', { record: LIST.rows![1]!.id, entity: LIST.rows![1]!.entity_id, newTab: false })]);
    second.dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
    expect(list.heard.at(-1), 'a click with ctrl held asks for a new tab').toEqual(event('af-open-record', { record: LIST.rows![1]!.id, entity: LIST.rows![1]!.entity_id, newTab: true }));
    expect(list.outside).toEqual([]);

    const at = `record/${uuid(200)}/${uuid(310)}`;
    const mentioned = await mount('af-tile', {
      spec: LIST.spec,
      result: LIST.result,
      fields: LIST.fields,
      columns: [{ key: 'name', label: 'Deal' }],
      rows: [
        {
          id: uuid(201),
          entity_id: uuid(200),
          body: { name: `See @[Acme](mention:${at})` },
          mentions: { [at]: { state: 'ok', kind: 'record', id: uuid(310), entity_id: uuid(200), entity_label: 'Deal', href: '/records/r', label: 'Acme renewal' } },
        },
      ],
    });
    await expect.poll(() => part(mentioned.el, 'mention') !== null, { timeout: 5000 }).toBe(true);
    see(mentioned.el, 'mention', 'mention-icon');

    const paged = await mount('af-tile', { spec: LIST.spec, result: LIST.result, fields: LIST.fields, rows: LIST.rows, columns: LIST.columns, paging: { prev: false, next: true } });
    await expect.poll(() => part(paged.el, 'pager') !== null, { timeout: 5000 }).toBe(true);
    see(paged.el, 'pager');
    const [previous, next] = paged.el.shadowRoot!.querySelectorAll<HTMLButtonElement>('[part~="pager"] button');
    previous!.click();
    next!.click();
    expect(paged.heard, 'a disabled Previous sends nothing').toEqual([event('af-page', { direction: 'next' })]);
    expect(paged.outside).toEqual([]);
  });

  it('af-field and af-fieldset: no shadow root, the page’s control wired, and every documented class drawn in the light DOM', async () => {
    const { el } = await mount(
      'af-fieldset',
      { heading: 'Contact', description: 'How to reach you', columns: 2 },
      '<fieldset><af-field label="Owner" description="Who answers" error="Required" required locked-reason="Set by the workflow" data-span="2"><input name="owner"></af-field></fieldset>',
    );
    const field = el.querySelector('af-field') as Kit;
    for (const tag of [el, field]) {
      expect(tag.shadowRoot, tag.localName).toBeNull();
      for (const name of CONTRACT[tag.localName]!.classes!) {
        expect(tag.classList.contains(name) || tag.querySelector(`.${name}`) !== null, `${tag.localName} draws .${name}`).toBe(true);
      }
    }
    expect(field.name).toBe('owner');
    const input = field.querySelector('input')!;
    expect(field.querySelector('label')!.htmlFor).toBe(input.id);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.readOnly).toBe(true);
    expect(field.style.gridColumn).toBe('1 / span 2');
  });

  it('af-form: af-submit with the form data once per submit, the summary drawn in the light DOM, the field error set', async () => {
    const { el, heard, outside } = await mount('af-form', {}, '<form><af-field label="Email"><input name="email" value="a@b.vn"></af-field><button>Save</button></form>');
    expect(el.shadowRoot).toBeNull();
    const form = el.querySelector('form')!;
    form.requestSubmit();
    form.requestSubmit();
    expect(heard).toHaveLength(1);
    const { type, detail, bubbles, composed } = heard[0]!;
    expect({ type, bubbles, composed }).toEqual({ type: 'af-submit', bubbles: true, composed: false });
    expect((detail as { formData: FormData }).formData.get('email')).toBe('a@b.vn');
    expect((detail as { submitter: unknown }).submitter).toBeNull();
    expect(outside).toEqual([]);
    el.errors = [{ path: '/email', message: 'Taken' }, { path: '', message: 'Try later' }];
    expect((el.querySelector('af-field') as Kit).error).toBe('Taken');
    const summary = form.firstElementChild!;
    for (const name of CONTRACT['af-form']!.classes!) expect(summary.classList.contains(name), name).toBe(true);
    expect(summary.getAttribute('role')).toBe('alert');
  });

  it('af-scroll-area: the slot in the content, the viewport handed out, no events, and every part', async () => {
    const { el, heard } = await mount('af-scroll-area', { axis: 'both', label: 'Facets' }, '<p>Row</p>');
    see(el, 'viewport', 'content', 'scrollbar', 'thumb', 'corner');
    expect(el.viewport).toBe(part(el, 'viewport'));
    expect((part(el, 'content')!.querySelector('slot') as HTMLSlotElement).assignedNodes()).toHaveLength(1);
    expect(part(el, 'viewport')!.getAttribute('aria-label')).toBe('Facets');
    expect(heard).toEqual([]);
  });

  it('af-tabs: tab-change with the value asked for, the panel slotted by value, and every part', async () => {
    const items = [{ value: 'overview', label: 'Tổng quan' }, { value: 'activity', label: 'Hoạt động' }];
    const { el, heard } = await mount('af-tabs', { items, value: 'overview', label: 'Các phần' }, '<p slot="overview">Một</p><p slot="activity">Hai</p>');
    see(el, 'list', 'tab', 'panel');
    expect(part(el, 'list')!.getAttribute('aria-label')).toBe('Các phần');
    expect((part(el, 'panel')!.querySelector('slot') as HTMLSlotElement).assignedNodes().map((n) => n.textContent)).toEqual(['Một']);
    el.shadowRoot!.querySelectorAll<HTMLElement>('[part~="tab"]')[1]!.click();
    await settle();
    expect(heard).toEqual([event('tab-change', { value: 'activity' })]);
  });

  it('af-splitter: size-change with the size a key press moved to, the panes slotted by name, and every part', async () => {
    // Zag sizes the panes only once the root has a size, which jsdom never lays out.
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => new DOMRect(0, 0, 600, 160));
    const { el, heard } = await mount('af-splitter', { size: 38, label: 'Đổi kích thước' }, '<ul slot="start"><li>Một</li></ul><p slot="end">Hai</p>');
    see(el, 'start', 'end', 'handle');
    expect((part(el, 'start')!.querySelector('slot') as HTMLSlotElement).assignedNodes().map((n) => n.textContent)).toEqual(['Một']);
    expect((part(el, 'end')!.querySelector('slot') as HTMLSlotElement).assignedNodes().map((n) => n.textContent)).toEqual(['Hai']);
    const handle = part(el, 'handle')!;
    expect(handle.getAttribute('aria-label')).toBe('Đổi kích thước');
    handle.focus();
    await settle();
    key(handle, 'ArrowLeft');
    await settle();
    expect(heard).toEqual([event('size-change', { size: 33 })]);
  });

  it('af-pager: prev, next and page-size-change in pages mode, more in more mode, and every part', async () => {
    const pages = await mount('af-pager', { hasPrev: true, hasNext: true, rangeStart: 26, rangeEnd: 50, total: 1240, pageSize: 25, pageSizes: [25, 50], locale: 'vi' });
    see(pages.el, 'prev', 'next', 'range', 'page-size', 'status');
    expect(part(pages.el, 'range')!.textContent).toBe('26–50 trên 1.240');
    part(pages.el, 'prev')!.click();
    part(pages.el, 'next')!.click();
    part(pages.el, 'page-size')!.querySelector('af-select')!.dispatchEvent(new CustomEvent('change', { detail: { value: '50' }, bubbles: true }));
    await settle();
    expect(pages.heard).toEqual([event('prev', {}), event('next', {}), event('page-size-change', { pageSize: 50 })]);
    expect(pages.outside).toEqual([]);

    const more = await mount('af-pager', { mode: 'more', hasMore: true, shown: 50 });
    see(more.el, 'more', 'status');
    part(more.el, 'more')!.click();
    await settle();
    expect(more.heard).toEqual([event('more', {})]);
  });

  it('af-copy-button: af-copy with the value and whether it reached the clipboard, and both parts', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => {} }, configurable: true });
    try {
      const { el, heard, outside } = await mount('af-copy-button', { value: 'INV-0042', label: 'Sao chép số hóa đơn', locale: 'vi' });
      see(el, 'trigger', 'status');
      expect(part(el, 'trigger')!.getAttribute('aria-label')).toBe('Sao chép số hóa đơn');
      expect(part(el, 'status')!.getAttribute('role')).toBe('status');
      part(el, 'trigger')!.click();
      await settle();
      expect(heard).toEqual([event('af-copy', { value: 'INV-0042', ok: true })]);
      expect(outside).toEqual([]);
      expect(part(el, 'status')!.textContent).toBe('Đã sao chép');
    } finally {
      Reflect.deleteProperty(navigator, 'clipboard');
    }
  });

  it('af-markdown: a cancelable af-link with the href, for a link and a mention chip, and every part', async () => {
    const ref = 'user/0b6c1f4e-1a2b-4c3d-8e9f-0123456789ab';
    const value = `Hỏi @[Lan](mention:${ref}) về [tài liệu](https://example.com/a)\n\n| Việc | Người |\n| --- | --- |\n| Viết | Lan |`;
    const { el, heard, outside } = await mount('af-markdown', { value, mentions: { [ref]: { state: 'ok', kind: 'user', id: ref.slice(5), label: 'Trần Lan' } } });
    await expect.poll(() => part(el, 'content')?.getAttribute('aria-busy') ?? 'loaded', { timeout: 5000 }).toBe('loaded');
    see(el, 'content', 'viewport', 'scrollbar', 'thumb');
    let cancelable: boolean | null = null;
    el.addEventListener('af-link', (e) => {
      cancelable = e.cancelable;
      e.preventDefault();
    });
    const click = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true });
    part(el, 'content')!.querySelector('a')!.dispatchEvent(click);
    expect(cancelable).toBe(true);
    expect(click.defaultPrevented).toBe(true);
    part(el, 'content')!.querySelector<HTMLElement>('.af-mention')!.click();
    expect(heard).toEqual([event('af-link', { href: 'https://example.com/a' }), event('af-link', { href: `mention:${ref}` })]);
    expect(outside).toEqual([]);
  });

  it('af-tree-picker: search with the query, change in the shape of value, the forest from a source, and every part', async () => {
    const nodes = [
      { id: 'hq', parentId: null, label: 'HQ', code: 'HQ' },
      { id: 'north', parentId: 'hq', label: 'North' },
      { id: 'old', parentId: 'hq', label: 'Old office', archived: true },
    ];
    const single = await mount('af-tree-picker', { nodes, value: 'north', label: 'Đơn vị' });
    see(single.el, 'control', 'input', 'clear');
    expect(part(single.el, 'input')!.getAttribute('aria-label')).toBe('Đơn vị');
    expect((part(single.el, 'input') as HTMLInputElement).value).toBe('North');
    part(single.el, 'clear')!.click();
    await settle();
    expect(single.heard).toEqual([event('change', { value: null })]);

    const many = await mount('af-tree-picker', { nodes, value: ['north'], multiple: true });
    see(many.el, 'chip', 'remove');
    await typeInto(part(many.el, 'input') as HTMLInputElement, 'o');
    expect(many.el.dataset.raised).toBe('true');
    see(many.el, 'content', 'tree', 'node', 'toggle', 'check', 'code', 'ancestry', 'archived', 'viewport', 'scrollbar', 'thumb');
    many.el.shadowRoot!.querySelector<HTMLElement>('[part~="node"][data-value="old"]')!.click();
    await settle();
    expect(many.heard).toEqual([event('search', { query: 'o' }), event('change', { value: ['north', 'old'] })]);
    await typeInto(part(many.el, 'input') as HTMLInputElement, 'zzz');
    see(many.el, 'empty');

    let answer!: (page: { items: typeof nodes; next: string | null }) => void;
    let refuse!: (error: Error) => void;
    const source = ({ cursor }: { cursor: string | null }) =>
      new Promise<{ items: typeof nodes; next: string | null }>((resolve, reject) => (cursor ? (refuse = reject) : (answer = resolve)));
    const sourced = await mount('af-tree-picker', { source, value: null });
    part(sourced.el, 'input')!.focus();
    key(part(sourced.el, 'input')!, 'ArrowDown');
    await settle();
    see(sourced.el, 'loading');
    answer({ items: nodes, next: 'c2' });
    await settle();
    refuse(new Error('offline'));
    await settle();
    see(sourced.el, 'load-more');
  });

  it('af-bulk-bar: clear for its button and for Escape on an action, the sentence in its status, the overflow menu, and every part', async () => {
    let room = 1000;
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      return new DOMRect(0, 0, this.getAttribute('slot') === 'actions' ? 100 : this.localName === 'af-menu' ? 32 : room, 32);
    });
    const actions = ['Giao việc', 'Xuất', 'Lưu trữ'].map((label) => `<button type="button" slot="actions">${label}</button>`).join('');
    const { el, heard, outside } = await mount('af-bulk-bar', { count: 3, total: 40, locale: 'vi' }, actions);
    see(el, 'bar', 'count', 'text', 'clear', 'status');
    expect(el.dataset.raised).toBe('true');
    expect(part(el, 'status')!.getAttribute('role')).toBe('status');
    expect(part(el, 'status')!.textContent).toBe('Đã chọn 3 trên 40');
    part(el, 'clear')!.click();
    key(el.querySelector('button')!, 'Escape');
    await settle();
    expect(heard).toEqual([event('clear', {}), event('clear', {})]);
    expect(outside).toEqual([]);

    // Measured again each time it appears, as well as when it or an action is resized.
    room = 220;
    el.count = 0;
    await settle();
    el.count = 4;
    await settle();
    expect([...el.querySelectorAll('button')].map((b) => b.hasAttribute('data-overflow'))).toEqual([false, true, true]);
    see(el, 'more');
    expect((part(el, 'more') as Kit).items).toEqual([{ id: '0', label: 'Xuất', disabled: false }, { id: '1', label: 'Lưu trữ', disabled: false }]);
  });

  it('af-file-upload: files-add with every file dropped, a refusal in its notice, remove with the id, and every part', async () => {
    const items = [
      { id: 'f1', name: 'hop-dong.pdf', size: 1536, status: 'done', href: 'https://files.example/f1' },
      { id: 'f2', name: 'anh.png', size: 2048, status: 'uploading', progress: 40, preview: 'data:image/png;base64,AA==' },
      { id: 'f3', name: 'ghi-chu.txt', size: 512, status: 'failed', error: 'Máy chủ từ chối.' },
    ];
    const { el, heard, outside } = await mount('af-file-upload', { items, accept: '.pdf', multiple: true, maxFiles: 5, locale: 'vi' });
    see(el, 'dropzone', 'trigger', 'hint', 'notice', 'list', 'item', 'icon', 'preview', 'name', 'size', 'progress', 'status', 'remove');
    const dropped = async (...files: File[]) => {
      const dataTransfer = new DataTransfer();
      for (const f of files) dataTransfer.items.add(f);
      for (const type of ['dragover', 'drop']) part(el, 'dropzone')!.dispatchEvent(Object.assign(new Event(type, { bubbles: true, cancelable: true, composed: true }), { dataTransfer }));
      await settle();
    };
    const pdf = new File(['x'], 'a.pdf');
    await dropped(pdf, new File(['x'], 'b.txt'));
    expect(part(el, 'notice')!.textContent).toBe('b.txt không đúng định dạng cho phép.');
    await dropped(pdf);
    el.shadowRoot!.querySelectorAll<HTMLElement>('[part~="remove"]')[0]!.click();
    await settle();
    expect(heard).toEqual([event('files-add', { files: [pdf] }), event('remove', { id: 'f1' })]);
    expect(outside).toEqual([]);
  });

  it('af-signature-pad: value as its image, change null from its clear button and from clear(), and every part', async () => {
    const value = 'data:image/png;base64,c2lnbmVk';
    const { el, heard, outside } = await mount('af-signature-pad', { value, label: 'Chữ ký người duyệt', locale: 'vi' });
    see(el, 'control', 'segment', 'guide', 'image', 'clear', 'hint');
    expect(part(el, 'control')!.getAttribute('aria-label')).toBe('Chữ ký người duyệt');
    expect(part(el, 'image')!.getAttribute('src')).toBe(value);
    part(el, 'clear')!.click();
    await settle();
    expect(part(el, 'image')).toBeNull();
    (el as unknown as { clear(): void }).clear();
    await settle();
    expect(heard).toEqual([event('change', { value: null }), event('change', { value: null })]);
    expect(outside).toEqual([]);
  });

  it('af-folder-source: the set announced, the progress, a failure, change with the value and its preview, a watched folder browsed into, and every part', async () => {
    const preview = {
      field: 'files', grain: 'folder', depth: 1, group_count: 2, item_count: 9, sample_keys: ['HS-481'], loose_file_count: 3, excluded_count: 1,
      excluded_by_reason: { NOT_IN_A_FOLDER: 1 }, refusal: { code: 'UPLOAD_SET_INCOMPLETE', message: 'upload set is not complete' },
    };
    let uploads = 0;
    const sources = {
      watched: async () => [{ id: 'ws1', name: 'Hồ sơ toà', source: 'sftp', status: 'open', entry_count: 12, last_scan_at: null }],
      subfolders: async (_set: string, path?: string) => (path ? { items: [], next_cursor: null } : { items: [{ name: 'dot-11', path: 'dot-11', file_count: 4, settled_count: 4 }], next_cursor: 'c2' }),
      preview: async () => preview,
      uploadFolder: async (_files: File[], opts: { resumeSetId?: string; onSetCreated(id: string): void; onProgress(p: { stored: number; total: number }): void }) => {
        if (uploads++ === 0) {
          opts.onSetCreated('set-1');
          opts.onProgress({ stored: 1, total: 2 });
          await settle();
          throw new Error('offline');
        }
        return { value: { $fileSet: opts.resumeSetId! }, refused: [] };
      },
      uploadFiles: async () => ({ value: { $fileSet: 'set-f' }, refused: [] }),
      deleteSet: async () => {},
    };
    const { el, heard, outside } = await mount('af-folder-source', { sources, workflow: 'wf1', field: 'files', folder: { grain: 'folder', depth: 1 }, locale: 'vi' });
    see(el, 'sources', 'source', 'hint', 'dropzone', 'trigger', 'notice');
    const file = new File(['x'], 'p1.pdf');
    Object.defineProperty(file, 'webkitRelativePath', { value: 'dot-11/HS-481/p1.pdf' });
    const input = el.shadowRoot!.querySelector<HTMLInputElement>('input[type="file"]')!;
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    see(el, 'progress', 'cancel');
    await settle();
    await settle();
    expect(part(el, 'notice')!.textContent).toBe('Việc tải lên đã dừng. Thử lại để tiếp tục từ chỗ dang dở.');
    see(el, 'retry');
    part(el, 'retry')!.click();
    await settle();
    see(el, 'chosen', 'preview', 'refusal', 'count', 'sample', 'reason');
    expect(part(el, 'reason')!.textContent!.replace(/\s+/g, ' ').trim()).toBe('Tệp không nằm trong thư mục nào 3');

    el.shadowRoot!.querySelector<HTMLInputElement>('[part~="source"] input[value="watched"]')!.click();
    await settle();
    see(el, 'path', 'crumb', 'list', 'folder', 'choose', 'open');
    part(el, 'open')!.click();
    await settle();
    see(el, 'more');
    part(el, 'choose')!.click();
    await settle();
    part(el, 'open')!.click();
    await settle();
    see(el, 'empty');
    expect(heard).toEqual([
      event('af-folder-busy', { busy: true }),
      event('af-folder-upload-started', { setId: 'set-1' }),
      event('af-folder-progress', { stored: 1, total: 2 }),
      event('af-folder-error', { during: 'upload', status: null, code: null, message: 'offline' }),
      event('af-folder-busy', { busy: false }),
      event('af-folder-busy', { busy: true }),
      event('af-folder-change', { value: { $fileSet: 'set-1' }, preview }),
      event('af-folder-busy', { busy: false }),
      event('af-folder-change', { value: null, preview: null }),
      event('af-folder-busy', { busy: true }),
      event('af-folder-change', { value: { $fileSet: 'ws1', path: 'dot-11' }, preview }),
      event('af-folder-busy', { busy: false }),
    ]);
    expect(outside).toEqual([]);
  });

  it('showed every part in the table', () => {
    for (const [tag, c] of Object.entries(CONTRACT)) expect([...(shown.get(tag) ?? [])].sort(), tag).toEqual([...c.parts].sort());
  });
});
