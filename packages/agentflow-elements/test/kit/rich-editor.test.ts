import type { Editor } from '@tiptap/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../src/kit/index.js';
import { settle, shadow, watchDocumentKeyListeners } from '../support.js';

type RichEditor = HTMLElement & { value: string; readonly: boolean; editor: Editor | null };

async function richEditor(props: Partial<Pick<RichEditor, 'value' | 'readonly'>> & { label?: string } = {}): Promise<RichEditor> {
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
});
