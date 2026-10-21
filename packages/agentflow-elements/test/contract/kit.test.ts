// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { hasKitBundle, loadKit, settle, type KitEntry } from './harness.js';

// The kit's public surface, read from the README. Attributes are the string and Boolean properties' own; the rest are
// properties only.
const CONTRACT: Record<string, { attributes: string[]; properties: string[]; methods?: string[]; parts: string[] }> = {
  'af-dialog': { attributes: ['open', 'heading', 'locale'], properties: ['open', 'heading', 'locale', 'strings'], parts: ['content', 'heading', 'close', 'body', 'actions'] },
  'af-confirm': {
    attributes: ['open', 'heading', 'message', 'confirm-label', 'danger', 'impact', 'busy', 'locale'],
    properties: ['open', 'heading', 'message', 'confirmLabel', 'danger', 'impact', 'busy', 'locale', 'strings'],
    parts: ['content', 'heading', 'message', 'impact', 'actions', 'cancel', 'confirm'],
  },
  'af-menu': { attributes: ['label', 'locale'], properties: ['items', 'label', 'locale', 'strings'], parts: ['trigger', 'item'] },
  'af-popover': { attributes: ['open', 'placement', 'locale'], properties: ['open', 'placement', 'locale', 'strings'], parts: ['anchor', 'content'] },
  'af-tooltip': { attributes: ['text', 'locale'], properties: ['text', 'locale', 'strings'], parts: ['anchor'] },
  'af-toast': { attributes: ['locale'], properties: ['locale', 'strings'], methods: ['show', 'dismiss'], parts: ['toast', 'icon', 'text', 'action', 'close'] },
  'af-date': {
    attributes: ['value', 'min', 'max', 'clearable', 'placeholder', 'label', 'disabled', 'locale'],
    properties: ['value', 'min', 'max', 'clearable', 'placeholder', 'label', 'disabled', 'locale', 'strings'],
    parts: ['control', 'input', 'trigger', 'content', 'today', 'clear'],
  },
  'af-person-picker': {
    attributes: ['value', 'multiple', 'placeholder', 'label', 'loading', 'disabled', 'locale'],
    properties: ['people', 'value', 'multiple', 'placeholder', 'label', 'loading', 'disabled', 'locale', 'strings'],
    parts: ['control', 'chip', 'remove', 'input', 'clear', 'content', 'option', 'empty'],
  },
  'af-rich-editor': {
    attributes: ['value', 'readonly', 'placeholder', 'label', 'locale'],
    properties: ['value', 'readonly', 'placeholder', 'label', 'locale', 'strings'],
    parts: [
      'toolbar', 'tool-bold', 'tool-italic', 'tool-bullet-list', 'tool-numbered-list', 'tool-link', 'link-popover', 'link-input', 'link-apply',
      'placeholder', 'content',
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
  for (const type of ['close', 'confirm', 'cancel', 'select', 'action', 'change', 'search']) listen(type);
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
  });

  it('registers the nine tags, idempotently, each stamped with the kit version', async () => {
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
    see(el, 'content', 'heading', 'close', 'body', 'actions');
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

  it('af-menu: select with the id, and data-raised on the host while open', async () => {
    const { el, heard } = await mount('af-menu', { items: [{ id: 'rename', label: 'Đổi tên' }, { id: 'archive', label: 'Lưu trữ', disabled: true, reason: 'Không' }], label: 'Thao tác' }, '⋯');
    see(el, 'trigger');
    part(el, 'trigger')!.click();
    await settle();
    expect(el.dataset.raised).toBe('true');
    see(el, 'item');
    part(el, 'item')!.click();
    await settle();
    expect(heard).toEqual([event('select', { id: 'rename' })]);
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

  it('af-person-picker: search with the query, change in the shape of value, and every part', async () => {
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
    see(many.el, 'content', 'option');
    part(many.el, 'option')!.click();
    await settle();
    expect(many.heard).toEqual([event('search', { query: 'hoa' }), event('change', { value: ['u1', 'u2'] })]);
    await typeInto(part(many.el, 'input') as HTMLInputElement, 'zzz');
    see(many.el, 'empty');
  });

  it('af-rich-editor: change with the Markdown after an edit, and every part', async () => {
    const { el, heard } = await mount('af-rich-editor', { value: 'Việc', placeholder: 'Mô tả', label: 'Mô tả' });
    see(el, 'toolbar', 'tool-bold', 'tool-italic', 'tool-bullet-list', 'tool-numbered-list', 'tool-link', 'content');
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

  it('showed every part in the table', () => {
    for (const [tag, c] of Object.entries(CONTRACT)) expect([...(shown.get(tag) ?? [])].sort(), tag).toEqual([...c.parts].sort());
  });
});
