import type { Editor } from '@tiptap/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../src/kit/index.js';
import { settle, shadow, watchDocumentKeyListeners } from '../support.js';

type RichEditor = HTMLElement & {
  value: string; readonly: boolean; editor: Editor | null;
  mentions: unknown; singleLine: boolean; mentionMap: unknown;
};

async function richEditor(props: Partial<Pick<RichEditor, 'value' | 'readonly' | 'mentions' | 'singleLine' | 'mentionMap'>> & { label?: string } = {}): Promise<RichEditor> {
  document.body.innerHTML = '';
  const el = document.createElement('af-rich-editor') as RichEditor;
  Object.assign(el, props);
  document.body.append(el);
  await vi.waitFor(() => expect((el as unknown as { editor: unknown }).editor).not.toBeNull());
  await settle();
  return el;
}

const content = (el: RichEditor) => shadow(el).querySelector('[part="content"]') as HTMLElement;
const focus = (el: RichEditor) => el.editor!.view.dom.dispatchEvent(new FocusEvent('focus'));
const blur = (el: RichEditor) => el.editor!.view.dom.dispatchEvent(new FocusEvent('blur'));

function changes(el: RichEditor): string[] {
  const seen: string[] = [];
  el.addEventListener('change', (e) => seen.push((e as CustomEvent<{ value: string }>).detail.value));
  return seen;
}

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('<af-rich-editor>', () => {
  it('names its editable content from label, keeps the name through edits, and drops it with the label', async () => {
    const el = await richEditor({ value: 'a', label: 'Mô tả' });
    const editable = () => shadow(el).querySelector('[contenteditable]') as HTMLElement;
    expect(editable().getAttribute('aria-label')).toBe('Mô tả');
    el.editor!.commands.insertContent('x');
    await settle();
    expect(editable().getAttribute('aria-label')).toBe('Mô tả');
    (el as unknown as { label: string | null }).label = null;
    await settle();
    expect(editable().hasAttribute('aria-label')).toBe(false);
    const bare = await richEditor({ value: 'a' });
    expect((shadow(bare).querySelector('[contenteditable]') as HTMLElement).hasAttribute('aria-label')).toBe(false);
  });

  it('renders its Markdown value as rich text', async () => {
    const el = await richEditor({ value: '**a**' });
    expect(content(el).querySelector('strong')?.textContent).toBe('a');
  });

  it('is not editable and shows no toolbar when readonly', async () => {
    const el = await richEditor({ value: 'a', readonly: true });
    expect(content(el).querySelector('.ProseMirror')?.getAttribute('contenteditable')).toBe('false');
    expect(shadow(el).querySelector('[part="toolbar"]')).toBeNull();
  });

  it('emits change exactly once when an edit is followed by a blur', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const el = await richEditor({ value: 'a' });
    const seen = changes(el);
    focus(el);
    el.editor!.commands.insertContent('x');
    blur(el);
    vi.advanceTimersByTime(1000);
    await settle();
    expect(seen).toHaveLength(1);
    expect(seen[0]).toContain('x');
  });

  it('emits an edit made just before the element is removed', async () => {
    const el = await richEditor({ value: 'a' });
    const seen = changes(el);
    focus(el);
    el.editor!.commands.insertContent('x');
    el.remove();
    await settle();
    expect(seen).toHaveLength(1);
    expect(seen[0]).toContain('x');
  });

  it('never emits a trailing no-break space', async () => {
    const el = await richEditor({ value: 'a' });
    const seen = changes(el);
    focus(el);
    const ed = el.editor!;
    ed.commands.insertContentAt(ed.state.doc.content.size - 1, ' b\u00A0');
    expect(ed.state.doc.textContent).toBe('a b\u00A0');
    blur(el);
    await settle();
    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatch(/b ?$/);
    expect(seen[0]).not.toMatch(/\u00A0$/);
  });

  it('holds a value set from outside until the editor loses focus', async () => {
    const el = await richEditor({ value: 'a' });
    focus(el);
    el.value = '**b**';
    await settle();
    expect(content(el).querySelector('strong')).toBeNull();
    blur(el);
    await settle();
    expect(content(el).querySelector('strong')?.textContent).toBe('b');
  });

  it('adds no key listener of its own to document or window, loaded and focused', async () => {
    const watch = watchDocumentKeyListeners();
    try {
      const el = await richEditor({ value: 'a' });
      focus(el);
      await settle();
      expect(el.editor!.isFocused).toBe(true);
      expect(watch.fromKit()).toEqual([]);
    } finally {
      watch.restore();
    }
  });

  describe('mentions', () => {
    const ENTITY = '0190f5a0-0000-7000-8000-000000000001';
    const RECORD = '0190f5a0-0000-7000-8000-000000000002';
    const PERSON = '0190f5a0-0000-7000-8000-000000000003';
    const menu = {
      groups: [
        { key: 'people', title: 'Người', items: [{ kind: 'user', ref: `user/${PERSON}`, label: 'Lê Hoàng Nam', meta: 'Sẽ nhận thông báo' }] },
        { key: `entity:${ENTITY}`, title: 'Task', items: [{ kind: 'record', ref: `record/${ENTITY}/${RECORD}`, label: 'Tích hợp cổng thanh toán', entity_label: 'Task' }] },
      ],
    };
    const menuOf = (el: RichEditor) => shadow(el).querySelector('[part="mention-menu"]') as HTMLElement;
    const options = (el: RichEditor) => [...menuOf(el).querySelectorAll('[role="option"]')];
    const press = (el: RichEditor, key: string) =>
      el.editor!.view.dom.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

    async function typeAt(el: RichEditor) {
      el.editor!.commands.focus();
      el.editor!.commands.insertContent('@');
      await vi.waitFor(() => expect(options(el).length).toBeGreaterThan(0));
    }

    it('typing @ opens the popover and lists the source\'s groups', async () => {
      const source = vi.fn(async () => menu);
      const el = await richEditor({ mentions: source });
      await typeAt(el);
      expect(source).toHaveBeenCalledWith('');
      expect(menuOf(el).getAttribute('role')).toBe('listbox');
      expect([...menuOf(el).querySelectorAll('[role="group"]')].map((g) => g.getAttribute('aria-label'))).toEqual(['Người', 'Task']);
      expect(options(el).map((o) => o.getAttribute('aria-selected'))).toEqual(['true', 'false']);
      expect(el.editor!.view.dom.getAttribute('aria-expanded')).toBe('true');
    });

    it('draws the entities the menu did not search as chips, and a chip searches its entity alone', async () => {
      const VENDOR = '0190f5a0-0000-7000-8000-000000000009';
      const VENDOR_RECORD = '0190f5a0-0000-7000-8000-00000000000a';
      const past = { groups: [], unsearched: { title: 'Tìm trong', scopes: [{ group: `entity:${VENDOR}`, label: 'Nhà cung cấp' }] } };
      const alone = {
        groups: [{ key: `entity:${VENDOR}`, title: 'Nhà cung cấp · 1 kết quả', items: [{ kind: 'record', ref: `record/${VENDOR}/${VENDOR_RECORD}`, label: 'Công ty Ánh Dương', entity_label: 'Nhà cung cấp' }] }],
      };
      const source = vi.fn(async (_q: string, group?: string) => (group ? alone : past));
      const el = await richEditor({ mentions: source });
      await typeAt(el);
      expect(menuOf(el).querySelector('.mention-empty')).not.toBeNull();
      const chip = menuOf(el).querySelector('[part="mention-scope"]') as HTMLElement;
      expect(chip.getAttribute('role')).toBe('option');
      expect(chip.textContent?.trim()).toBe('Nhà cung cấp');
      expect(menuOf(el).querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Tìm trong');
      press(el, 'Enter');
      await vi.waitFor(() => expect(source).toHaveBeenLastCalledWith('', `entity:${VENDOR}`));
      await vi.waitFor(() => expect(options(el).map((o) => o.textContent)).toEqual([expect.stringContaining('Công ty Ánh Dương')]));
      expect(menuOf(el).querySelector('[part="mention-scope"]')).toBeNull();
      press(el, 'Enter');
      await settle();
      expect(content(el).querySelector('[data-mention]')?.getAttribute('data-mention')).toBe(`record/${VENDOR}/${VENDOR_RECORD}`);
    });

    it('offers nothing without a source', async () => {
      const el = await richEditor();
      el.editor!.commands.focus();
      el.editor!.commands.insertContent('@');
      await settle();
      expect(options(el)).toEqual([]);
    });

    it('ArrowDown then Enter inserts a chip and emits the token in change', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const el = await richEditor({ mentions: async () => menu });
      const seen = changes(el);
      await typeAt(el);
      press(el, 'ArrowDown');
      await settle();
      expect(options(el).map((o) => o.getAttribute('aria-selected'))).toEqual(['false', 'true']);
      press(el, 'Enter');
      await settle();
      expect(content(el).querySelector('[data-mention]')?.getAttribute('data-mention')).toBe(`record/${ENTITY}/${RECORD}`);
      vi.advanceTimersByTime(1000);
      await settle();
      expect(seen.at(-1)).toBe(`@[Tích hợp cổng thanh toán](mention:record/${ENTITY}/${RECORD})`);
    });

    it('Escape closes the popover without inserting', async () => {
      const el = await richEditor({ mentions: async () => menu });
      await typeAt(el);
      press(el, 'Escape');
      await settle();
      expect(content(el).querySelector('[data-mention]')).toBeNull();
      expect(el.editor!.view.dom.hasAttribute('aria-expanded')).toBe(false);
    });

    it('single-line mode refuses Enter', async () => {
      const el = await richEditor({ value: 'một dòng', singleLine: true });
      el.editor!.commands.focus('end');
      press(el, 'Enter');
      await settle();
      expect(el.editor!.state.doc.childCount).toBe(1);
      expect(el.editor!.getMarkdown().trimEnd()).toBe('một dòng');
      expect(shadow(el).querySelector('[part="toolbar"]')).toBeNull();
    });

    it('single-line mode joins a multi-block value and a multi-line paste into one line', async () => {
      const el = await richEditor({ value: 'một\n\nhai', singleLine: true });
      expect(el.editor!.state.doc.childCount).toBe(1);
      expect(el.editor!.getMarkdown().trimEnd()).toBe('một hai');
      el.editor!.commands.focus('end');
      el.editor!.commands.insertContent('<p>ba</p><p>bốn</p>');
      await settle();
      expect(el.editor!.state.doc.childCount).toBe(1);
      expect(el.editor!.getMarkdown().trimEnd()).toBe('một hai ba bốn');
    });

    it('a restricted entry in mention-map draws the restricted chip', async () => {
      const token = `ref @[Bí mật](mention:record/${ENTITY}/${RECORD})`;
      const el = await richEditor({
        value: token,
        readonly: true,
        mentionMap: { [`record/${ENTITY}/${RECORD}`]: { state: 'restricted', kind: 'record' } },
      });
      const chip = content(el).querySelector('[data-mention]') as HTMLElement;
      expect(chip.getAttribute('data-state')).toBe('restricted');
      expect(chip.textContent).toBe('Restricted record');
      expect(chip.textContent).not.toContain('Bí mật');
      expect(chip.querySelector('a')).toBeNull();
    });

    it('a chip whose target is missing from the map is restricted, never the stored label', async () => {
      const el = await richEditor({ value: `@[Tên cũ](mention:record/${ENTITY}/${RECORD})`, readonly: true, mentionMap: {} });
      const chip = content(el).querySelector('[data-mention]') as HTMLElement;
      expect(chip.getAttribute('data-state')).toBe('restricted');
      expect(chip.textContent).not.toContain('Tên cũ');
    });

    it('a person chip draws the initial and name and is not a link', async () => {
      const el = await richEditor({
        value: `@[Cũ](mention:user/${PERSON})`,
        readonly: true,
        mentionMap: { [`user/${PERSON}`]: { state: 'ok', kind: 'user', id: PERSON, label: 'Lê Hoàng Nam', href: null } },
      });
      const chip = content(el).querySelector('[data-mention]') as HTMLElement;
      expect(chip.getAttribute('data-state')).toBe('ok');
      expect(chip.querySelector('.af-mention-avatar')?.textContent).toBe('L');
      expect(chip.querySelector('.af-mention-label')?.textContent).toBe('Lê Hoàng Nam');
      expect(chip.querySelector('a')).toBeNull();
    });

    it('a record chip opens the record, and a deleted one is struck through with the deleted text', async () => {
      const other = '0190f5a0-0000-7000-8000-000000000009';
      const el = await richEditor({
        value: `@[x](mention:record/${ENTITY}/${RECORD}) @[y](mention:record/${ENTITY}/${other})`,
        readonly: true,
        mentionMap: {
          [`record/${ENTITY}/${RECORD}`]: { state: 'ok', kind: 'record', id: RECORD, entity_id: ENTITY, label: 'Thanh toán', entity_label: 'Task', href: `/e/${ENTITY}/${RECORD}` },
          [`record/${ENTITY}/${other}`]: { state: 'deleted', kind: 'record' },
        },
      });
      const [open, gone] = [...content(el).querySelectorAll('[data-mention]')] as HTMLElement[];
      expect(open!.querySelector('a')?.getAttribute('href')).toBe(`/e/${ENTITY}/${RECORD}`);
      expect(open!.textContent).toBe('Thanh toán');
      expect(gone!.getAttribute('data-state')).toBe('deleted');
      expect(gone!.textContent).toBe('Deleted record');
    });

    it('redraws the chips when the map arrives after the value', async () => {
      const el = await richEditor({ value: `@[x](mention:user/${PERSON})`, readonly: true });
      expect(content(el).querySelector('[data-mention]')?.getAttribute('data-state')).toBe('restricted');
      el.mentionMap = { [`user/${PERSON}`]: { state: 'ok', kind: 'user', id: PERSON, label: 'Nam', href: null } };
      await settle();
      expect(content(el).querySelector('[data-mention]')?.getAttribute('data-state')).toBe('ok');
    });

    it('adds no key listener of its own to document or window with a source', async () => {
      const watch = watchDocumentKeyListeners();
      try {
        const el = await richEditor({ mentions: async () => menu });
        await typeAt(el);
        expect(watch.fromKit()).toEqual([]);
      } finally {
        watch.restore();
      }
    });
  });
});
