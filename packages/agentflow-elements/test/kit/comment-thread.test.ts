import type { Editor } from '@tiptap/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CommentDto } from '@reflexify/agentflow-sdk';
import '../../src/kit/index.js';
import { settle, shadow } from '../support.js';

type ThreadElement = HTMLElement & Record<string, unknown> & { settle(): void };
type EditorElement = HTMLElement & { editor: Editor | null; value: string; mentions: unknown; mentionMap: unknown };

// The test clock reads the page's timezone, Asia/Ho_Chi_Minh, and a moment in the past is relative to this one.
const NOW = new Date('2026-11-12T10:00:00Z');
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();
const HOUR = 3_600_000;

let serial = 0;
function comment(more: Partial<CommentDto> = {}): CommentDto {
  serial += 1;
  return {
    id: `00000000-0000-4000-8000-${String(serial).padStart(12, '0')}`,
    author: { id: 'u1', name: 'Lan Pham' },
    body: `Comment ${serial}`,
    mentions: {},
    files: [],
    created_at: ago(2 * HOUR),
    can_edit: false,
    can_delete: false,
    ...more,
  } as CommentDto;
}
const MINH = '2b9f6a0c-3d41-4e5f-8a7b-9c0d1e2f3a4b';
const FILE = { id: '00000000-0000-4000-9000-000000000001', name: 'quote.pdf', byte_size: 2048, content_type: 'application/pdf' };

interface Heard { type: string; detail: unknown; bubbles: boolean; composed: boolean }
const TYPES = ['af-comment-submit', 'af-comment-edit', 'af-comment-delete', 'af-comment-earlier', 'af-comment-open-file'];

async function thread(props: Record<string, unknown> = {}) {
  document.body.innerHTML = '';
  const el = document.createElement('af-comment-thread') as ThreadElement;
  Object.assign(el, { canComment: true, ...props });
  document.body.append(el);
  await settle();
  const heard: Heard[] = [];
  for (const type of TYPES) el.addEventListener(type, (e) => heard.push({ type, detail: (e as CustomEvent).detail, bubbles: e.bubbles, composed: e.composed }));
  return { el, heard };
}

const part = (el: Element, name: string) => shadow(el).querySelector<HTMLElement>(`[part~="${name}"]`);
const parts = (el: Element, name: string) => [...shadow(el).querySelectorAll<HTMLElement>(`[part~="${name}"]`)];
const text = (node: Element | null | undefined) => node?.textContent?.replace(/\s+/g, ' ').trim() ?? null;
const locked = (button: HTMLElement | null) => button?.getAttribute('aria-disabled') === 'true';
const editors = (el: Element) => [...shadow(el).querySelectorAll<EditorElement>('af-rich-editor')];
const click = async (node: HTMLElement | null) => {
  expect(node).not.toBeNull();
  node!.click();
  await settle();
};
const loaded = (editor: EditorElement) => vi.waitFor(() => expect(editor.editor).not.toBeNull(), { timeout: 5000 });
const contentOf = (editor: EditorElement) => editor.editor!.view.dom;

/** Expands the composer and waits for its editor, the way a person clicks the prompt. */
async function openComposer(el: Element): Promise<EditorElement> {
  await click(part(el, 'prompt'));
  const editor = editors(el)[0]!;
  await loaded(editor);
  await settle();
  return editor;
}

/** Types into an editor as a person does: it holds focus and its change has not been reported yet. */
function type(editor: EditorElement, markdown: string) {
  contentOf(editor).focus();
  editor.editor!.commands.focus('end');
  editor.editor!.commands.insertContent(markdown);
}

const ctrlEnter = (target: Element, init: KeyboardEventInit = { ctrlKey: true }) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true, cancelable: true, ...init }));

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('<af-comment-thread>', () => {
  describe('the thread', () => {
    it('draws the comments in the order given, each with its author, its time and its body', async () => {
      const comments = [
        comment({ author: { id: 'u1', name: 'Lan Pham' }, body: 'First', created_at: ago(3 * HOUR) }),
        comment({ author: { id: 'u2', name: 'Minh Tran' }, body: 'Second', created_at: ago(30 * 60_000) }),
      ];
      const { el } = await thread({ comments, locale: 'en' });
      const items = parts(el, 'comment');
      expect(items).toHaveLength(2);
      expect(items.map((i) => text(i.querySelector('[part~="author"]')))).toEqual(['Lan Pham', 'Minh Tran']);
      expect(items.map((i) => text(i.querySelector('[part~="time"]')))).toEqual(['3 hours ago', '30 minutes ago']);
      expect(items.map((i) => (i.querySelector('[part~="body"]') as unknown as { value: string }).value)).toEqual(['First', 'Second']);
      expect(items.map((i) => i.dataset.commentId)).toEqual(comments.map((c) => c.id));
      expect(shadow(el).querySelector('ol')!.getAttribute('aria-label')).toBe('Comments');
    });

    it('gives the exact moment on hover and marks an edited comment, in the words of the locale', async () => {
      const comments = [comment({ created_at: ago(2 * HOUR), edited_at: ago(HOUR) }), comment({ created_at: ago(2 * HOUR) })];
      const { el } = await thread({ comments, locale: 'vi' });
      const [edited, plain] = parts(el, 'comment');
      expect(edited!.querySelector('time')!.getAttribute('datetime')).toBe(comments[0]!.created_at);
      expect(edited!.querySelector('time')!.getAttribute('title')).toBeTruthy();
      expect(text(edited!.querySelector('[part~="edited"]'))).toContain('đã sửa');
      expect(edited!.querySelector('[part~="edited"]')!.getAttribute('title')).toMatch(/^Đã sửa /);
      expect(plain!.querySelector('[part~="edited"]')).toBeNull();
    });

    it('draws a nameless author as Someone, or Ai đó in Vietnamese, and never a blank', async () => {
      const comments = [comment({ author: { id: 'u9', name: '' } })];
      expect(text(part((await thread({ comments, locale: 'en' })).el, 'author'))).toBe('Someone');
      expect(text(part((await thread({ comments, locale: 'vi' })).el, 'author'))).toBe('Ai đó');
    });

    it('draws each body as af-markdown with the comment\'s own mention map, and none for a body that is only files', async () => {
      const mentions = { [`user/${MINH}`]: { state: 'ok', kind: 'user', id: MINH, label: 'Minh' } };
      const comments = [comment({ body: `Hello @[Minh](mention:user/${MINH})`, mentions: mentions as never }), comment({ body: '  ', files: [FILE] })];
      const { el } = await thread({ comments });
      const [first, second] = parts(el, 'comment');
      const body = first!.querySelector('af-markdown') as unknown as { value: string; mentions: unknown };
      expect(body.value).toBe(`Hello @[Minh](mention:user/${MINH})`);
      expect(body.mentions).toEqual(mentions);
      expect(second!.querySelector('af-markdown')).toBeNull();
    });

    it('shows Edit and Delete only where the server allows them', async () => {
      const comments = [comment({ can_edit: true, can_delete: true }), comment({ can_delete: true }), comment({ can_edit: true }), comment()];
      const { el } = await thread({ comments });
      const items = parts(el, 'comment');
      expect(items.map((i) => !!i.querySelector('[part~="edit"]'))).toEqual([true, false, true, false]);
      expect(items.map((i) => !!i.querySelector('[part~="delete"]'))).toEqual([true, true, false, false]);
    });

    it('names each action for the comment it acts on', async () => {
      const { el } = await thread({ comments: [comment({ author: { id: 'u1', name: 'Lan' }, can_edit: true, can_delete: true })], locale: 'en' });
      expect(part(el, 'edit')!.getAttribute('aria-label')).toBe('Edit comment by Lan');
      expect(part(el, 'delete')!.getAttribute('aria-label')).toBe('Delete comment by Lan');
    });

    it('says so when there are no comments', async () => {
      const { el } = await thread({ comments: [], locale: 'en' });
      expect(parts(el, 'comment')).toHaveLength(0);
      expect(text(shadow(el).querySelector('.empty'))).toBe('No comments yet.');
    });
  });

  describe('files on a comment', () => {
    it('draws a chip per file and opens the preview at that file with the comment\'s files in order', async () => {
      const second = { id: '00000000-0000-4000-9000-000000000002', name: 'photo.png', byte_size: 900, content_type: 'image/png' };
      const { el, heard } = await thread({ comments: [comment({ files: [FILE, second] })] });
      const chips = parts(el, 'file');
      expect(chips.map((c) => text(c))).toEqual(['quote.pdf 2 kB', 'photo.png 900 B']);
      await click(chips[1]!.querySelector('button'));
      expect(heard).toEqual([{
        type: 'af-comment-open-file',
        detail: { files: [{ file: FILE.id, filename: 'quote.pdf' }, { file: second.id, filename: 'photo.png' }], start: 1 },
        bubbles: true,
        composed: false,
      }]);
    });
  });

  describe('earlier comments', () => {
    it('draws the control only while there are earlier comments, and raises af-comment-earlier from it', async () => {
      const { el, heard } = await thread({ comments: [comment()], hasEarlier: true, locale: 'en' });
      expect(text(part(el, 'earlier'))).toBe('Show older comments');
      await click(part(el, 'earlier'));
      expect(heard).toEqual([{ type: 'af-comment-earlier', detail: {}, bubbles: true, composed: false }]);
      el.hasEarlier = false;
      await settle();
      expect(part(el, 'earlier')).toBeNull();
    });
  });

  describe('the composer', () => {
    it('starts as a labelled one-line prompt and creates no editor, so Tiptap is not loaded for a thread nobody writes in', async () => {
      const { el } = await thread({ comments: [comment({ can_edit: true })], locale: 'en' });
      const prompt = part(el, 'prompt')!;
      expect(prompt.localName).toBe('button');
      expect(text(prompt)).toBe('Write a comment');
      expect(editors(el)).toHaveLength(0);
      expect(part(el, 'send')).toBeNull();
    });

    it('expands to an af-rich-editor with its toolbar when the prompt is pressed, and the editor takes focus', async () => {
      const mentions = vi.fn(async () => ({ groups: [] }));
      const { el } = await thread({ locale: 'en', mentions });
      const editor = await openComposer(el);
      expect(part(el, 'prompt')).toBeNull();
      expect(editors(el)).toHaveLength(1);
      expect(editor.mentions).toBe(mentions);
      expect(editor.getAttribute('label') ?? (editor as unknown as { label: string }).label).toBe('Write a comment');
      expect(shadow(editor).querySelector('[part="toolbar"]')).not.toBeNull();
      await vi.waitFor(() => expect(shadow(editor).activeElement).toBe(contentOf(editor)));
    });

    it('hints at the shortcut, and at @ only when there is a menu to open', async () => {
      const { el } = await thread({ locale: 'en' });
      await openComposer(el);
      expect(text(shadow(el).querySelector('.hint'))).toBe('Ctrl/⌘+Enter to send');
      const withMenu = await thread({ locale: 'en', mentions: async () => ({ groups: [] }) });
      await openComposer(withMenu.el);
      expect(text(shadow(withMenu.el).querySelector('.hint'))).toBe('Type @ to mention someone · Ctrl/⌘+Enter to send');
    });

    it('raises af-comment-submit with the Markdown the editor holds, and keeps the draft until settle()', async () => {
      const { el, heard } = await thread();
      const editor = await openComposer(el);
      type(editor, 'Hello there');
      contentOf(editor).blur();
      await settle();
      await click(part(el, 'send'));
      expect(heard).toEqual([{ type: 'af-comment-submit', detail: { body: 'Hello there', attachment_ids: [] }, bubbles: true, composed: false }]);
      expect(editors(el)[0]).toBe(editor);
      expect(editor.editor!.getText()).toBe('Hello there');

      part(el, 'send')!.focus();
      el.settle();
      await settle();
      expect(editors(el)).toHaveLength(0);
      expect(text(part(el, 'prompt'))).toBe('Write a comment');
      expect(shadow(el).activeElement).toBe(part(el, 'prompt'));
    });

    it('sends what the editor holds when it was emptied back to where it started, not the last text it reported', async () => {
      const { el, heard } = await thread();
      const editor = await openComposer(el);
      type(editor, 'Changed my mind');
      contentOf(editor).blur();
      await settle();
      contentOf(editor).focus();
      editor.editor!.commands.clearContent();
      await click(part(el, 'send'));
      expect(heard).toEqual([]);
      type(editor, 'Second thought');
      await click(part(el, 'send'));
      expect(heard.map((h) => h.detail)).toEqual([{ body: 'Second thought', attachment_ids: [] }]);
    });

    it('reads what was typed even when the editor has not reported it yet: a press on Send, and Ctrl+Enter inside the editor', async () => {
      const { el, heard } = await thread();
      const editor = await openComposer(el);
      type(editor, 'Typed just now');
      await click(part(el, 'send'));
      expect(heard.map((h) => h.detail)).toEqual([{ body: 'Typed just now', attachment_ids: [] }]);

      const again = await thread();
      const second = await openComposer(again.el);
      type(second, 'Sent by keyboard');
      const proceeded = ctrlEnter(contentOf(second));
      await settle();
      expect(proceeded).toBe(false);
      expect(again.heard.map((h) => h.detail)).toEqual([{ body: 'Sent by keyboard', attachment_ids: [] }]);
    });

    it('sends on Cmd+Enter too, and not while an input method is composing', async () => {
      const { el, heard } = await thread();
      const editor = await openComposer(el);
      type(editor, 'One');
      ctrlEnter(contentOf(editor), { ctrlKey: true, isComposing: true });
      await settle();
      expect(heard).toEqual([]);
      ctrlEnter(contentOf(editor), { metaKey: true });
      await settle();
      expect(heard.map((h) => h.detail)).toEqual([{ body: 'One', attachment_ids: [] }]);
    });

    it('sends nothing for an empty composer, and puts the person back in the editor', async () => {
      const { el, heard } = await thread();
      const editor = await openComposer(el);
      await click(part(el, 'send'));
      expect(heard).toEqual([]);
      await vi.waitFor(() => expect(shadow(editor).activeElement).toBe(contentOf(editor)));
    });

    it('is not a second send while an action is in flight: busy locks Send and the editor, and a key does nothing', async () => {
      const { el, heard } = await thread();
      const editor = await openComposer(el);
      type(editor, 'Hello');
      ctrlEnter(contentOf(editor));
      await settle();
      expect(heard).toHaveLength(1);
      el.busy = true;
      await settle();
      expect(locked(part(el, 'send'))).toBe(true);
      expect([...part(el, 'composer')!.querySelectorAll<HTMLElement>('.fields')].map((f) => (f as HTMLElement & { inert: boolean }).inert)).toEqual([true]);
      expect(shadow(el).querySelector('.af-kit')!.getAttribute('aria-busy')).toBe('true');
      ctrlEnter(contentOf(editor));
      await click(part(el, 'send'));
      expect(heard).toHaveLength(1);
      el.busy = false;
      await settle();
      expect(locked(part(el, 'send'))).toBe(false);
    });

    it('keeps the draft and shows the page\'s error at the composer when a send is refused', async () => {
      const { el, heard } = await thread();
      const editor = await openComposer(el);
      type(editor, 'Keep me');
      await click(part(el, 'send'));
      expect(heard).toHaveLength(1);
      el.error = 'Couldn\'t send: check your connection';
      await settle();
      const alert = part(el, 'error')!;
      expect(alert.getAttribute('role')).toBe('alert');
      expect(text(alert)).toBe('Couldn\'t send: check your connection');
      expect(part(el, 'composer')!.contains(alert)).toBe(true);
      expect(editors(el)[0]).toBe(editor);
      expect(editor.editor!.getText()).toBe('Keep me');
      el.error = null;
      await settle();
      expect(part(el, 'error')).toBeNull();
    });

    it('hides the composer when the person cannot comment, and shows the read-only note instead when the thread is closed', async () => {
      const cannot = await thread({ canComment: false, comments: [comment()] });
      expect(part(cannot.el, 'prompt')).toBeNull();
      expect(part(cannot.el, 'closed')).toBeNull();
      const closed = await thread({ canComment: true, closed: true, comments: [comment()], locale: 'en' });
      expect(part(closed.el, 'prompt')).toBeNull();
      expect(part(closed.el, 'composer')).toBeNull();
      expect(text(part(closed.el, 'closed'))).toBe('Comments are closed This record\'s discussion is read-only.');
    });

    it('lists the people a send did not notify', async () => {
      const { el } = await thread({ unnotified: [{ user_id: 'a', name: 'Lan' }, { user_id: 'b', name: 'Minh' }], locale: 'en' });
      const note = part(el, 'unnotified')!;
      expect(note.parentElement!.getAttribute('role')).toBe('status');
      expect(text(note)).toBe('Lan and Minh can\'t see this record and weren\'t notified');
      el.unnotified = [];
      await settle();
      expect(part(el, 'unnotified')).toBeNull();
    });
  });

  describe('files in the composer', () => {
    const picked = (name: string) => new File(['x'], name, { type: 'application/pdf' });
    const upload = () => shadow(document.querySelector('af-comment-thread')!).querySelector('af-file-upload') as HTMLElement & { items: { id: string; name: string; status: string; error?: string | null }[] };
    const add = async (...files: File[]) => {
      upload().dispatchEvent(new CustomEvent('files-add', { detail: { files }, bubbles: true }));
      await settle();
    };

    it('draws no upload without an upload function', async () => {
      const { el } = await thread();
      await openComposer(el);
      expect(shadow(el).querySelector('af-file-upload')).toBeNull();
    });

    it('uploads each file through upload, shows it while it goes, and sends the ids of the files that arrived', async () => {
      const finish: Record<string, (value: { id: string }) => void> = {};
      const sent = vi.fn((file: File) => new Promise<{ id: string }>((done) => { finish[file.name] = done; }));
      const { el, heard } = await thread({ upload: sent });
      const editor = await openComposer(el);
      type(editor, 'See attached');
      await add(picked('a.pdf'), picked('b.pdf'));
      expect(sent).toHaveBeenCalledTimes(2);
      expect(upload().items.map((i) => [i.name, i.status])).toEqual([['a.pdf', 'uploading'], ['b.pdf', 'uploading']]);
      expect(locked(part(el, 'send'))).toBe(true);

      finish['a.pdf']!({ id: 'file-a' });
      finish['b.pdf']!({ id: 'file-b' });
      await settle();
      expect(upload().items.map((i) => [i.id, i.status])).toEqual([['file-a', 'done'], ['file-b', 'done']]);
      expect(locked(part(el, 'send'))).toBe(false);

      upload().dispatchEvent(new CustomEvent('remove', { detail: { id: 'file-a' }, bubbles: true }));
      await settle();
      await click(part(el, 'send'));
      expect(heard.map((h) => h.detail)).toEqual([{ body: 'See attached', attachment_ids: ['file-b'] }]);
    });

    it('marks a file that failed to upload, leaves it out of the send, and lets the person remove it', async () => {
      const { el, heard } = await thread({ upload: vi.fn().mockRejectedValue(new Error('too big')) });
      const editor = await openComposer(el);
      type(editor, 'Hi');
      await add(picked('c.pdf'));
      const [failed] = upload().items;
      expect([failed!.status, failed!.error]).toEqual(['failed', 'too big']);
      await click(part(el, 'send'));
      expect(heard.map((h) => h.detail)).toEqual([{ body: 'Hi', attachment_ids: [] }]);
      upload().dispatchEvent(new CustomEvent('remove', { detail: { id: failed!.id }, bubbles: true }));
      await settle();
      expect(upload().items).toEqual([]);
    });

    it('sends a comment of files alone, and clears them after settle()', async () => {
      const { el, heard } = await thread({ upload: vi.fn().mockResolvedValue({ id: 'file-a' }) });
      await openComposer(el);
      await add(picked('a.pdf'));
      await click(part(el, 'send'));
      expect(heard.map((h) => h.detail)).toEqual([{ body: '', attachment_ids: ['file-a'] }]);
      el.settle();
      await settle();
      await openComposer(el);
      expect(upload().items).toEqual([]);
    });

    it('does not take an upload that finishes after the composer closed', async () => {
      let finish: (value: { id: string }) => void = () => {};
      const { el, heard } = await thread({ upload: vi.fn(() => new Promise<{ id: string }>((done) => { finish = done; })) });
      const editor = await openComposer(el);
      type(editor, 'x');
      await add(picked('late.pdf'));
      expect(locked(part(el, 'send'))).toBe(true);
      finish({ id: 'late' });
      await settle();
      await click(part(el, 'send'));
      el.settle();
      await settle();
      await openComposer(el);
      expect(upload().items).toEqual([]);
      expect(heard).toHaveLength(1);
    });
  });

  describe('editing', () => {
    it('opens the comment\'s body in an editor in place of the body, with its mentions, and Save raises af-comment-edit with the version it opened at', async () => {
      const mentions = { [`user/${MINH}`]: { state: 'ok', kind: 'user', id: MINH, label: 'Minh' } };
      const mine = comment({ body: 'Old text', mentions: mentions as never, files: [FILE], can_edit: true });
      const { el, heard } = await thread({ comments: [mine, comment()] });
      expect(editors(el)).toHaveLength(0);
      await click(part(el, 'edit'));
      const [editor] = editors(el);
      expect(editors(el)).toHaveLength(1);
      expect(parts(el, 'comment')[0]!.contains(editor!)).toBe(true);
      expect(parts(el, 'comment')[0]!.querySelector('af-markdown')).toBeNull();
      expect(editor!.value).toBe('Old text');
      expect(editor!.mentionMap).toEqual(mentions);
      await loaded(editor!);
      await vi.waitFor(() => expect(shadow(editor!).activeElement).toBe(contentOf(editor!)));

      type(editor!, ' and more');
      // Someone else's save lands while the edit is open: the edit still started from the version it opened at.
      el.comments = [{ ...mine, body: 'Their text', edited_at: '2026-11-12T09:30:00.000Z' }, (el.comments as CommentDto[])[1]!];
      await settle();
      expect(editors(el)[0]).toBe(editor);
      await click(part(el, 'save'));
      expect(heard).toEqual([{ type: 'af-comment-edit', detail: { id: mine.id, body: 'Old text and more', attachment_ids: [FILE.id], version: mine.created_at }, bubbles: true, composed: false }]);
      expect(editors(el)).toHaveLength(1);

      el.settle();
      await settle();
      expect(editors(el)).toHaveLength(0);
      expect(parts(el, 'comment')[0]!.querySelector('af-markdown')).not.toBeNull();
    });

    it('sends the edit on Ctrl+Enter, and Cancel closes it without raising anything', async () => {
      const mine = comment({ body: 'Old', can_edit: true });
      const { el, heard } = await thread({ comments: [mine] });
      await click(part(el, 'edit'));
      const editor = editors(el)[0]!;
      await loaded(editor);
      type(editor, ' x');
      ctrlEnter(contentOf(editor));
      await settle();
      expect(heard.map((h) => h.detail)).toEqual([{ id: mine.id, body: 'Old x', attachment_ids: [], version: mine.created_at }]);

      await click(part(el, 'cancel'));
      expect(editors(el)).toHaveLength(0);
      expect(heard).toHaveLength(1);
    });

    it('saves the original text when the edit was typed over and typed back', async () => {
      const mine = comment({ body: 'Old', can_edit: true });
      const { el, heard } = await thread({ comments: [mine] });
      await click(part(el, 'edit'));
      const editor = editors(el)[0]!;
      await loaded(editor);
      type(editor, ' more');
      contentOf(editor).blur();
      await settle();
      contentOf(editor).focus();
      editor.editor!.commands.setContent('Old', { contentType: 'markdown' });
      await click(part(el, 'save'));
      expect(heard.map((h) => h.detail)).toEqual([{ id: mine.id, body: 'Old', attachment_ids: [], version: mine.created_at }]);
    });

    it('returns focus to the comment\'s Edit button when the edit is closed, by Cancel or by settle()', async () => {
      const { el } = await thread({ comments: [comment({ can_edit: true })] });
      await click(part(el, 'edit'));
      part(el, 'cancel')!.focus();
      await click(part(el, 'cancel'));
      expect(shadow(el).activeElement).toBe(part(el, 'edit'));
      await click(part(el, 'edit'));
      await loaded(editors(el)[0]!);
      await click(part(el, 'save'));
      part(el, 'save')!.focus();
      el.settle();
      await settle();
      expect(shadow(el).activeElement).toBe(part(el, 'edit'));
    });

    it('keeps the typed text and shows the error at the comment when the save is refused, and a refreshed comment does not overwrite it', async () => {
      const mine = comment({ body: 'Old', can_edit: true });
      const other = comment({ can_edit: true });
      const { el } = await thread({ comments: [mine, other] });
      await click(part(el, 'edit'));
      const editor = editors(el)[0]!;
      await loaded(editor);
      type(editor, ' mine');
      await click(part(el, 'save'));
      el.error = 'Couldn\'t save: someone changed it first';
      await settle();
      const [first, second] = parts(el, 'comment');
      expect(text(first!.querySelector('[part~="error"]'))).toBe('Couldn\'t save: someone changed it first');
      expect(second!.querySelector('[part~="error"]')).toBeNull();
      expect(part(el, 'composer')!.querySelector('[part~="error"]')).toBeNull();

      el.comments = [{ ...mine, body: 'Changed by someone else', edited_at: ago(60_000) }, other];
      await settle();
      expect(editors(el)[0]).toBe(editor);
      expect(editor.editor!.getText()).toBe('Old mine');
    });

    it('opens an editor in each comment on its own, and keeps the composer\'s draft across a refresh of the thread', async () => {
      const a = comment({ can_edit: true });
      const b = comment({ can_edit: true });
      const { el } = await thread({ comments: [a, b] });
      const composer = await openComposer(el);
      type(composer, 'Draft');
      composer.dispatchEvent(new Event('change'));
      await click(parts(el, 'edit')[0]!);
      await click(parts(el, 'edit')[0]!);
      expect(parts(el, 'edit')).toHaveLength(0);
      expect(editors(el)).toHaveLength(3);
      el.comments = [a, b, comment()];
      await settle();
      expect(editors(el)).toHaveLength(3);
      expect(editors(el).includes(composer)).toBe(true);
      expect(composer.editor!.getText()).toBe('Draft');
    });

    it('disables the actions while busy', async () => {
      const { el } = await thread({ comments: [comment({ can_edit: true, can_delete: true })], busy: true });
      expect(locked(part(el, 'edit'))).toBe(true);
      expect(locked(part(el, 'delete'))).toBe(true);
      el.busy = false;
      await click(part(el, 'edit'));
      el.busy = true;
      await settle();
      expect(locked(part(el, 'save'))).toBe(true);
      expect(locked(part(el, 'cancel'))).toBe(true);
    });

    it('draws a file-upload in an edit that holds the comment\'s files, and sends what is left of them with what was added', async () => {
      const mine = comment({ body: 'Old', files: [FILE], can_edit: true });
      const { el, heard } = await thread({ comments: [mine], upload: vi.fn().mockResolvedValue({ id: 'new-file' }) });
      await click(part(el, 'edit'));
      const box = parts(el, 'comment')[0]!.querySelector('af-file-upload') as HTMLElement & { items: { id: string; name: string; status: string }[] };
      expect(box.items).toEqual([expect.objectContaining({ id: FILE.id, name: 'quote.pdf', size: 2048, status: 'done' })]);
      box.dispatchEvent(new CustomEvent('files-add', { detail: { files: [new File(['x'], 'n.pdf')] }, bubbles: true }));
      await settle();
      box.dispatchEvent(new CustomEvent('remove', { detail: { id: FILE.id }, bubbles: true }));
      await settle();
      await loaded(editors(el)[0]!);
      await click(part(el, 'save'));
      expect(heard.map((h) => h.detail)).toEqual([{ id: mine.id, body: 'Old', attachment_ids: ['new-file'], version: mine.created_at }]);
    });
  });

  describe('deleting', () => {
    const confirmer = (el: Element) => shadow(el).querySelector('af-confirm') as HTMLElement & { open: boolean; danger: boolean; heading: string; message: string };

    it('asks first, and raises af-comment-delete only once the person confirms', async () => {
      const mine = comment({ can_delete: true });
      const { el, heard } = await thread({ comments: [mine], locale: 'en' });
      expect(confirmer(el).open).toBeFalsy();
      await click(part(el, 'delete'));
      expect(confirmer(el).open).toBe(true);
      expect(confirmer(el).danger).toBe(true);
      expect([confirmer(el).heading, confirmer(el).message]).toEqual(['Delete this comment?', 'The comment and its files will be removed for everyone.']);
      expect(heard).toEqual([]);
      confirmer(el).dispatchEvent(new CustomEvent('confirm', { detail: {}, bubbles: true }));
      await settle();
      expect(heard).toEqual([{ type: 'af-comment-delete', detail: { id: mine.id }, bubbles: true, composed: false }]);
      expect(confirmer(el).open).toBe(false);
    });

    it('raises nothing when the person backs out', async () => {
      const { el, heard } = await thread({ comments: [comment({ can_delete: true })] });
      await click(part(el, 'delete'));
      confirmer(el).dispatchEvent(new CustomEvent('cancel', { detail: { reason: 'close-button' }, bubbles: true }));
      await settle();
      expect(confirmer(el).open).toBe(false);
      expect(heard).toEqual([]);
    });

    it('shows a refusal at the comment it was raised for, and settle() leaves the thread as it is', async () => {
      const a = comment({ can_delete: true });
      const b = comment({ can_delete: true });
      const { el, heard } = await thread({ comments: [a, b] });
      await click(parts(el, 'delete')[1]!);
      confirmer(el).dispatchEvent(new CustomEvent('confirm', { detail: {}, bubbles: true }));
      await settle();
      expect(heard.map((h) => h.detail)).toEqual([{ id: b.id }]);
      el.error = 'Couldn\'t delete: only its author can do that';
      await settle();
      const [first, second] = parts(el, 'comment');
      expect(first!.querySelector('[part~="error"]')).toBeNull();
      expect(text(second!.querySelector('[part~="error"]'))).toBe('Couldn\'t delete: only its author can do that');
      el.settle();
      await settle();
      expect(parts(el, 'comment')).toHaveLength(2);
    });
  });

  describe('the contract', () => {
    it('is a custom element with settle() from construction, and the page\'s attributes read as Booleans', async () => {
      const el = document.createElement('af-comment-thread') as ThreadElement;
      expect(typeof el.settle).toBe('function');
      expect(() => el.settle()).not.toThrow();
      el.setAttribute('can-comment', '');
      el.setAttribute('closed', '');
      el.setAttribute('has-earlier', '');
      el.setAttribute('busy', '');
      el.setAttribute('error', 'Nope');
      expect([el.canComment, el.closed, el.hasEarlier, el.busy, el.error]).toEqual([true, true, true, true, 'Nope']);
    });

    it('draws in Vietnamese and takes its words from strings', async () => {
      const { el } = await thread({ locale: 'vi', strings: { commentPlaceholder: 'Nói gì đó' } });
      expect(text(part(el, 'prompt'))).toBe('Nói gì đó');
      const plain = await thread({ locale: 'vi', comments: [comment({ can_edit: true, can_delete: true })], hasEarlier: true });
      expect(text(part(plain.el, 'earlier'))).toBe('Xem bình luận cũ hơn');
      expect(text(part(plain.el, 'prompt'))).toBe('Viết bình luận');
      expect(part(plain.el, 'edit')!.getAttribute('aria-label')).toMatch(/^Sửa bình luận của /);
    });
  });
});
