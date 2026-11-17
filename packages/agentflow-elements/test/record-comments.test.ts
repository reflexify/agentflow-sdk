import { createAgentFlowClient, proxyAdapter, type CommentDto, type PublicEvent, type RealtimeChannel, type RealtimeStatus, type UnnotifiedPerson } from '@reflexify/agentflow-sdk';
import { flushSync } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineCommentThread } from '../src/comment-thread.js';
import { CALLER, json, mount, problem, settle, shadow, stubApi } from './support.js';

const E = '0190c0de-0000-7000-8000-0000000000e1';
const R = '0190c0de-0000-7000-8000-0000000000b1';
const R2 = '0190c0de-0000-7000-8000-0000000000b2';
const ORG = CALLER.org_id;
const FILE_A = '0190c0de-0000-7000-9000-0000000000a1';
const FILE_B = '0190c0de-0000-7000-9000-0000000000a2';
const KIT_TAGS = ['af-comment-thread', 'af-markdown', 'af-rich-editor', 'af-file-upload', 'af-confirm'];

const commentsPath = (record = R) => `/entities/${E}/records/${record}/comments`;
const comment = (n: number, extra: Partial<CommentDto> = {}): CommentDto => ({
  id: `0190c0de-0000-7000-8000-${String(n).padStart(12, '0')}`,
  author: { id: CALLER.id, name: 'Ann' },
  body: `Comment ${n}`,
  mentions: {},
  files: [],
  created_at: new Date(Date.UTC(2026, 10, 12, 8, 0, 0) + n * 60_000).toISOString(),
  edited_at: null,
  can_edit: true,
  can_delete: true,
  ...extra,
});
const threadPage = (items: CommentDto[], extra: Record<string, unknown> = {}) => ({
  items,
  total: items.length,
  closed: false,
  can_comment: true,
  next_cursor: null,
  prev_cursor: null,
  ...extra,
});

const streamed = (type: string, subject: { kind: string; id: string }, n = 1): PublicEvent => ({
  id: `evt-${n}`,
  type,
  occurred_at: '2026-11-12T10:00:00Z',
  org_id: ORG,
  position: n,
  subject: { entity_id: E, ...subject },
});
const onThread = (type = 'comment.created', record = R) => streamed(type, { kind: 'record', id: record });

function fakeChannel(initial: RealtimeStatus = 'live') {
  let current = initial;
  const events = new Set<(e: PublicEvent) => void>();
  const refetches = new Set<() => void>();
  const none = () => () => {};
  const channel: RealtimeChannel = {
    status: () => current,
    onStatus: none,
    onEvent: (l) => (events.add(l), () => events.delete(l)),
    onRefetch: (l) => (refetches.add(l), () => refetches.delete(l)),
    onPresence: none,
    onRevoked: none,
    watch() {},
    retry() {},
    close() {},
  };
  return {
    channel,
    emit: (e: PublicEvent) => [...events].forEach((l) => l(e)),
    listeners: () => events.size + refetches.size,
  };
}

type ThreadElement = HTMLElement & {
  comments: CommentDto[];
  canComment: boolean;
  closed: boolean;
  hasEarlier: boolean;
  busy: boolean;
  error: string | null;
  unnotified: UnnotifiedPerson[] | null;
  mentions: ((q: string, group?: string) => Promise<unknown>) | null;
  upload: ((file: File) => Promise<{ id: string }>) | null;
  locale: string;
  settle(): void;
};
type EditorElement = HTMLElement & { editor: { getText(): string; commands: { focus(at: string): void; insertContent(text: string): void }; view: { dom: HTMLElement } } | null };

const tag = () => `<agentflow-record-comments entity="${E}" record="${R}"></agentflow-record-comments>`;
const host = (p: HTMLElement) => p.querySelector('agentflow-record-comments') as HTMLElement & { reload(): Promise<void> };
const root = (p: HTMLElement) => shadow(host(p));
const threadOf = (p: HTMLElement) => root(p).querySelector('af-comment-thread') as ThreadElement | null;
const idsOf = (p: HTMLElement) => threadOf(p)!.comments.map((c) => c.id);
const drawn = (p: HTMLElement) => [...shadow(threadOf(p)).querySelectorAll('[data-comment-id]')].map((li) => li.getAttribute('data-comment-id'));
const part = (el: Element, name: string) => shadow(el).querySelector<HTMLElement>(`[part~="${name}"]`);
const editors = (el: Element) => [...shadow(el).querySelectorAll<EditorElement>('af-rich-editor')];
const loaded = (editor: EditorElement) => vi.waitFor(() => expect(editor.editor).not.toBeNull(), { timeout: 5000 });
const click = async (node: HTMLElement | null) => {
  expect(node).not.toBeNull();
  node!.click();
  await settle();
};
/** Types into an editor as a person does: it holds focus and its change has not been reported yet. */
function type(editor: EditorElement, markdown: string) {
  editor.editor!.view.dom.focus();
  editor.editor!.commands.focus('end');
  editor.editor!.commands.insertContent(markdown);
}

/** Mounts with the kit's thread already defined: only the first test reads the page before it is. */
async function mountThread(stub: ReturnType<typeof stubApi>, props: Record<string, unknown> = {}) {
  await defineCommentThread();
  return mount(tag(), stub, {}, props);
}

/** The comment reads `api` has seen, as search strings. */
const reads = (api: ReturnType<typeof stubApi>, record = R) => api.calls.filter((c) => c.method === 'GET' && c.path === commentsPath(record)).map((c) => c.search);

type Routes = Record<string, (req: Request, url: URL) => Response | Promise<Response>>;
function api(pages: (url: URL) => ReturnType<typeof threadPage> | Response, extra: Routes = {}) {
  return stubApi({
    'GET /caller': () => json(200, CALLER),
    [`GET ${commentsPath()}`]: (_req, url) => {
      const answer = pages(url);
      return answer instanceof Response ? answer : json(200, answer);
    },
    ...extra,
  });
}

/** The page's own settle() of the thread, watched. */
const watchSettle = (p: HTMLElement) => vi.spyOn(threadOf(p)!, 'settle');

/** Runs the coalescing window out under fake timers, then hands the clock back so the page can settle. */
async function afterWindow(ms = 250) {
  await vi.advanceTimersByTimeAsync(ms);
  vi.useRealTimers();
  await settle();
}

const submit = async (p: HTMLElement, body: string, attachment_ids: string[] = []) => {
  threadOf(p)!.dispatchEvent(new CustomEvent('af-comment-submit', { detail: { body, attachment_ids }, bubbles: true }));
  await settle();
};

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('<agentflow-record-comments>', () => {
  // First: a tag once defined stays defined, and this reads the page before the kit's thread is.
  it('loads the kit thread on demand, then draws the newest page with what the caller may do', async () => {
    for (const name of KIT_TAGS) expect(customElements.get(name), name).toBeUndefined();
    const stub = api(() => threadPage([comment(3), comment(4)], { prev_cursor: 'p1' }));
    const p = await mount(tag(), stub);
    await vi.waitFor(() => KIT_TAGS.forEach((name) => expect(customElements.get(name), name).toBeDefined()), { timeout: 20_000 });
    await settle();

    const thread = threadOf(p)!;
    expect(idsOf(p)).toEqual([comment(3).id, comment(4).id]);
    expect(drawn(p)).toEqual(idsOf(p));
    expect([thread.canComment, thread.closed, thread.hasEarlier, thread.busy, thread.locale]).toEqual([true, false, true, false, 'en']);
    expect(reads(stub)).toEqual(['?limit=25']);
  }, 30_000);

  it('tells the thread when the comments are closed or the caller may not write', async () => {
    const stub = api(() => threadPage([comment(1)], { closed: true, can_comment: false }));
    const p = await mountThread(stub);
    const thread = threadOf(p)!;
    expect([thread.canComment, thread.closed]).toEqual([false, true]);
    expect(part(thread, 'closed')).not.toBeNull();
    expect(part(thread, 'composer')).toBeNull();
  });

  it('loads earlier comments when the thread asks, puts them before the ones it has, and follows the cursor it is given', async () => {
    const stub = api((url) => {
      const before = url.searchParams.get('before');
      if (before === 'p1') return threadPage([comment(2), comment(3)], { prev_cursor: 'p0' });
      if (before === 'p0') return threadPage([comment(1)]);
      return threadPage([comment(4), comment(5)], { prev_cursor: 'p1' });
    });
    const p = await mountThread(stub);
    await click(part(threadOf(p)!, 'earlier'));
    expect(idsOf(p)).toEqual([2, 3, 4, 5].map((n) => comment(n).id));
    expect(threadOf(p)!.hasEarlier).toBe(true);
    await click(part(threadOf(p)!, 'earlier'));
    expect(idsOf(p)).toEqual([1, 2, 3, 4, 5].map((n) => comment(n).id));
    expect(threadOf(p)!.hasEarlier).toBe(false);
    expect(reads(stub)).toEqual(['?limit=25', '?before=p1&limit=25', '?before=p0&limit=25']);
  });

  it('sends under one key, holds the thread while it is out, then settles it, shows who was not told, and reads the thread again', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    const server = [comment(1)];
    const sent = comment(2, { body: 'Hello' });
    const keys: (string | null)[] = [];
    const stub = api(() => threadPage(server), {
      [`POST ${commentsPath()}`]: async (req) => {
        keys.push(req.headers.get('idempotency-key'));
        await gate;
        server.push(sent);
        return json(201, { comment: sent, unnotified: [{ user_id: CALLER.id, name: 'Bo' }] });
      },
    });
    const p = await mountThread(stub);
    const done = watchSettle(p);

    await submit(p, 'Hello', [FILE_A]);
    expect(threadOf(p)!.busy).toBe(true);
    await submit(p, 'Hello', [FILE_A]);
    expect(stub.calls.filter((c) => c.method === 'POST')).toHaveLength(1);

    release();
    await settle();
    expect(stub.calls.find((c) => c.method === 'POST')!.body).toEqual({ body: 'Hello', attachment_ids: [FILE_A] });
    expect(keys).toHaveLength(1);
    expect(keys[0]).toMatch(/^[0-9a-f-]{36}$/);
    expect(threadOf(p)!.busy).toBe(false);
    expect(threadOf(p)!.error).toBeFalsy();
    expect(done).toHaveBeenCalledTimes(1);
    expect(threadOf(p)!.unnotified).toEqual([{ user_id: CALLER.id, name: 'Bo' }]);
    expect(idsOf(p)).toEqual([comment(1).id, sent.id]);
    expect(reads(stub)).toHaveLength(2);
  });

  it('keeps the draft and says what went wrong when a send fails, and does not settle it', async () => {
    const stub = api(() => threadPage([comment(1)]), { [`POST ${commentsPath()}`]: () => problem(422, 'COMMENT_EMPTY') });
    const p = await mountThread(stub);
    const done = watchSettle(p);
    await submit(p, ' ');
    expect(threadOf(p)!.error).toBe('Something went wrong (COMMENT_EMPTY).');
    expect(threadOf(p)!.busy).toBe(false);
    expect(done).not.toHaveBeenCalled();
    expect(idsOf(p)).toEqual([comment(1).id]);
  });

  it('tells the page once about each write that fails: a send, an edit, an edit that lost the version race, and a delete', async () => {
    const mine = comment(1);
    let patch = () => problem(422, 'COMMENT_TOO_LONG');
    const stub = api(() => threadPage([mine]), {
      [`POST ${commentsPath()}`]: () => problem(422, 'COMMENT_EMPTY'),
      [`PATCH ${commentsPath()}/${mine.id}`]: () => patch(),
      [`DELETE ${commentsPath()}/${mine.id}`]: () => problem(500, 'INTERNAL'),
    });
    const p = await mountThread(stub);
    const heard: unknown[] = [];
    p.addEventListener('request-failed', (e) => heard.push((e as CustomEvent<{ code: string }>).detail.code));
    const raise = async (type: string, detail: unknown) => {
      threadOf(p)!.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }));
      await settle();
    };

    await raise('af-comment-submit', { body: 'Hello', attachment_ids: [] });
    expect(heard.splice(0)).toEqual(['COMMENT_EMPTY']);
    await raise('af-comment-edit', { id: mine.id, body: 'Edited', attachment_ids: [] });
    expect(heard.splice(0)).toEqual(['COMMENT_TOO_LONG']);
    patch = () => problem(409, 'STALE_VERSION');
    await raise('af-comment-edit', { id: mine.id, body: 'Edited', attachment_ids: [] });
    expect(heard.splice(0)).toEqual(['STALE_VERSION']);
    await raise('af-comment-delete', { id: mine.id });
    expect(heard.splice(0)).toEqual(['INTERNAL']);
  });

  it('retries a send that failed under the same key, takes a new one for a changed draft, and renews it after a send went through', async () => {
    let failing = true;
    const keys: (string | null)[] = [];
    const stub = api(() => threadPage([comment(1)]), {
      [`POST ${commentsPath()}`]: (req) => {
        keys.push(req.headers.get('idempotency-key'));
        if (failing) throw new TypeError('Failed to fetch');
        return json(201, { comment: comment(2), unnotified: [] });
      },
    });
    const p = await mountThread(stub);
    const done = watchSettle(p);

    await submit(p, 'A', [FILE_A]);
    expect(threadOf(p)!.error).toBe('Something went wrong (NETWORK_ERROR).');
    expect(done).not.toHaveBeenCalled();
    await submit(p, 'A', [FILE_A]);
    await submit(p, 'A!', [FILE_A]);
    failing = false;
    await submit(p, 'A!', [FILE_A]);
    expect(done).toHaveBeenCalledTimes(1);
    // The same words again, once the first has gone through, are another comment.
    await submit(p, 'A!', [FILE_A]);

    expect(keys).toHaveLength(5);
    expect(keys[1]).toBe(keys[0]);
    expect(keys[2]).not.toBe(keys[1]);
    expect(keys[3]).toBe(keys[2]);
    expect(keys[4]).not.toBe(keys[3]);
    expect(new Set(keys).size).toBe(3);
  });

  describe('an edit', () => {
    const open = async (p: HTMLElement) => {
      await click(part(threadOf(p)!, 'edit'));
      const editor = editors(threadOf(p)!)[0]!;
      await loaded(editor);
      return editor;
    };

    it('sends the version it was read at, replaces the comment with what the server kept, settles the edit and reads again', async () => {
      const mine = comment(1, { body: 'Old' });
      const edited = { ...mine, body: 'Old mine', edited_at: '2026-11-12T09:30:00.000Z' };
      let current = mine;
      const seen: { match: string | null; body: unknown }[] = [];
      const stub = api(() => threadPage([current]), {
        [`PATCH ${commentsPath()}/${mine.id}`]: (req) => {
          seen.push({ match: req.headers.get('if-match'), body: null });
          current = edited;
          return json(200, { comment: edited, unnotified: [] });
        },
      });
      const p = await mountThread(stub);
      const done = watchSettle(p);
      const editor = await open(p);
      type(editor, ' mine');
      await click(part(threadOf(p)!, 'save'));

      expect(seen).toEqual([{ match: mine.created_at, body: null }]);
      expect(stub.calls.find((c) => c.method === 'PATCH')!.body).toEqual({ body: 'Old mine', attachment_ids: [] });
      expect(done).toHaveBeenCalledTimes(1);
      expect(threadOf(p)!.comments[0]!.body).toBe('Old mine');
      expect(editors(threadOf(p)!)).toHaveLength(0);
      expect(reads(stub)).toHaveLength(2);
    });

    it('stale_edit_keeps_the_text: a version conflict reloads the comment, keeps what was typed, says it changed since, and does not settle', async () => {
      const mine = comment(1, { body: 'Old' });
      const theirs = { ...mine, body: 'Changed by Bo', edited_at: '2026-11-12T09:30:00.000Z' };
      let current = mine;
      const stub = api(() => threadPage([current]), {
        [`PATCH ${commentsPath()}/${mine.id}`]: () => {
          current = theirs;
          return problem(409, 'STALE_VERSION');
        },
      });
      const p = await mountThread(stub);
      const done = watchSettle(p);
      const editor = await open(p);
      type(editor, ' mine');
      await click(part(threadOf(p)!, 'save'));

      expect(stub.calls.filter((c) => c.method === 'PATCH')).toHaveLength(1);
      expect(reads(stub)).toHaveLength(2);
      expect(threadOf(p)!.comments[0]!.body).toBe('Changed by Bo');
      expect(threadOf(p)!.error).toContain('changed since you started');
      expect(threadOf(p)!.busy).toBe(false);
      expect(done).not.toHaveBeenCalled();
      expect(editors(threadOf(p)!)[0]).toBe(editor);
      expect(editor.editor!.getText()).toBe('Old mine');
      expect(part(threadOf(p)!, 'edit')).toBeNull();
    });
  });

  describe('an edit open across a reload', () => {
    it('sends the version the edit opened at, so a save made in between is a conflict, and a second Save is made over what was shown', async () => {
      const mine = comment(1, { body: 'Old' });
      const theirs = { ...mine, body: 'Changed by Bo', edited_at: '2026-11-12T09:30:00.000Z' };
      const kept = { ...mine, body: 'Old mine', edited_at: '2026-11-12T09:40:00.000Z' };
      let current = mine;
      const matches: (string | null)[] = [];
      const stub = api(() => threadPage([current]), {
        [`PATCH ${commentsPath()}/${mine.id}`]: (req) => {
          const match = req.headers.get('if-match');
          matches.push(match);
          if (match !== (current.edited_at ?? current.created_at)) return problem(409, 'STALE_VERSION');
          current = kept;
          return json(200, { comment: kept, unnotified: [] });
        },
      });
      const p = await mountThread(stub);
      const done = watchSettle(p);
      await click(part(threadOf(p)!, 'edit'));
      const editor = editors(threadOf(p)!)[0]!;
      await loaded(editor);
      type(editor, ' mine');

      // Bo saves while the edit is open, and the thread reads it.
      current = theirs;
      await host(p).reload();
      flushSync();
      expect(threadOf(p)!.comments[0]!.body).toBe('Changed by Bo');

      await click(part(threadOf(p)!, 'save'));
      expect(matches).toEqual([mine.created_at]);
      expect(threadOf(p)!.error).toContain('changed since you started');
      expect(done).not.toHaveBeenCalled();
      expect(editors(threadOf(p)!)[0]).toBe(editor);
      expect(editor.editor!.getText()).toBe('Old mine');

      // Told, the person saves again: on purpose over the newer version, which the open edit did not show them.
      await click(part(threadOf(p)!, 'save'));
      expect(matches).toEqual([mine.created_at, theirs.edited_at]);
      expect(done).toHaveBeenCalledTimes(1);
      expect(threadOf(p)!.comments[0]!.body).toBe('Old mine');
    });
  });

  it('deletes a comment, drops it from the thread and reads the thread again', async () => {
    const server = [comment(1), comment(2)];
    const stub = api(() => threadPage(server), {
      [`DELETE ${commentsPath()}/${comment(1).id}`]: () => {
        server.shift();
        return new Response(null, { status: 204 });
      },
    });
    const p = await mountThread(stub);
    threadOf(p)!.dispatchEvent(new CustomEvent('af-comment-delete', { detail: { id: comment(1).id }, bubbles: true }));
    await settle();
    expect(stub.calls.filter((c) => c.method === 'DELETE')).toHaveLength(1);
    expect(idsOf(p)).toEqual([comment(2).id]);
    expect(reads(stub)).toHaveLength(2);
  });

  describe('keeping up with the thread', () => {
    it('reloads once for a burst of comment events about the record, and leaves an open draft as it was', async () => {
      const live = fakeChannel();
      let server = [comment(1), comment(2)];
      const stub = api(() => threadPage(server));
      const p = await mountThread(stub, { realtime: live.channel });
      await click(part(threadOf(p)!, 'prompt'));
      const composer = editors(threadOf(p)!)[0]!;
      await loaded(composer);
      type(composer, 'Half a thought');
      composer.dispatchEvent(new Event('change'));

      server = [comment(2, { body: 'Changed' }), comment(3)];
      vi.useFakeTimers();
      live.emit(onThread('comment.created'));
      live.emit(onThread('comment.updated'));
      live.emit(onThread('comment.deleted'));
      await afterWindow();

      expect(reads(stub)).toHaveLength(2);
      expect(threadOf(p)!.comments.map((c) => c.body)).toEqual(['Changed', 'Comment 3']);
      expect(editors(threadOf(p)!)[0]).toBe(composer);
      expect(composer.editor!.getText()).toBe('Half a thought');
    });

    it('ignores an event about another record, and an event that is not about a comment', async () => {
      const live = fakeChannel();
      const stub = api(() => threadPage([comment(1)]));
      await mountThread(stub, { realtime: live.channel });
      vi.useFakeTimers();
      live.emit(onThread('comment.created', R2));
      live.emit(onThread('record.updated', R));
      await afterWindow(1000);
      expect(reads(stub)).toHaveLength(1);
    });

    it('merges the newest page by id, keeping earlier pages, and starts over when nothing it holds is on the page', async () => {
      let newest = threadPage([comment(4), comment(5)], { prev_cursor: 'p1' });
      const stub = api((url) => (url.searchParams.get('before') === 'p1' ? threadPage([comment(2), comment(3)], { prev_cursor: 'p0' }) : newest));
      const p = await mountThread(stub);
      await click(part(threadOf(p)!, 'earlier'));
      expect(idsOf(p)).toEqual([2, 3, 4, 5].map((n) => comment(n).id));

      // 3 stays, 4 is gone from the page's range, 5 is edited and 6 is new; 2 lies before the page and stays as it was read.
      newest = threadPage([comment(3), comment(5, { body: 'Edited' }), comment(6)], { prev_cursor: 'p1' });
      await host(p).reload();
      flushSync();
      expect(idsOf(p)).toEqual([2, 3, 5, 6].map((n) => comment(n).id));
      expect(threadOf(p)!.comments.map((c) => c.body)).toEqual(['Comment 2', 'Comment 3', 'Edited', 'Comment 6']);
      expect(threadOf(p)!.hasEarlier).toBe(true);

      // A whole page of new comments: the ones between it and what is held were never read.
      newest = threadPage([comment(20), comment(21)], { prev_cursor: 'p9' });
      await host(p).reload();
      flushSync();
      expect(idsOf(p)).toEqual([20, 21].map((n) => comment(n).id));
      expect(threadOf(p)!.hasEarlier).toBe(true);

      // A page that is the whole thread is all there is.
      newest = threadPage([comment(21)]);
      await host(p).reload();
      flushSync();
      expect(idsOf(p)).toEqual([comment(21).id]);
      expect(threadOf(p)!.hasEarlier).toBe(false);
    });

    it('stops listening when it is removed', async () => {
      const live = fakeChannel();
      const stub = api(() => threadPage([comment(1)]));
      const p = await mountThread(stub, { realtime: live.channel });
      expect(live.listeners()).toBeGreaterThan(0);
      host(p).remove();
      await settle();
      expect(live.listeners()).toBe(0);
    });
  });

  it('shows the failure and no thread when the first page cannot be read, and recovers on a reload', async () => {
    let broken = true;
    const stub = api(() => (broken ? problem(500, 'INTERNAL') : threadPage([comment(1)])));
    const p = await mountThread(stub);
    expect(threadOf(p)).toBeNull();
    expect(root(p).querySelector('[part="error"]')!.textContent).toContain('INTERNAL');
    broken = false;
    await host(p).reload();
    flushSync();
    expect(root(p).querySelector('[part="error"]')).toBeNull();
    expect(idsOf(p)).toEqual([comment(1).id]);
  });

  it('starts over for another record, drops a page still on its way from the first, and does not carry a draft across', async () => {
    let answer!: (r: Response) => void;
    let calls = 0;
    const stub = stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET ${commentsPath()}`]: () => (++calls === 1 ? json(200, threadPage([comment(1)])) : (new Promise<Response>((resolve) => (answer = resolve)) as unknown as Response)),
      [`GET ${commentsPath(R2)}`]: () => json(200, threadPage([comment(7)])),
    });
    const p = await mountThread(stub);
    const first = threadOf(p)!;
    void host(p).reload();
    await settle();
    host(p).setAttribute('record', R2);
    await settle();
    expect(idsOf(p)).toEqual([comment(7).id]);
    expect(threadOf(p)).not.toBe(first);
    answer(json(200, threadPage([comment(1)])));
    await settle();
    expect(idsOf(p)).toEqual([comment(7).id]);
  });

  it('binds the @ menu to the record', async () => {
    const stub = api(() => threadPage([comment(1)]), { 'GET /mentions': () => json(200, { groups: [] }) });
    const p = await mountThread(stub);
    await expect(threadOf(p)!.mentions!('ann')).resolves.toEqual({ groups: [] });
    const asked = stub.calls.find((c) => c.path === '/mentions')!;
    expect(new URLSearchParams(asked.search).get('entity_id')).toBe(E);
    expect(new URLSearchParams(asked.search).get('record_id')).toBe(R);
    expect(new URLSearchParams(asked.search).get('q')).toBe('ann');
  });

  it('uploads a file for a comment on the record, and tells the page when it is refused', async () => {
    // jsdom's FormData cannot be sent as a Request body, so the upload is taken at the client: what matters here is what it is given.
    const stub = api(() => threadPage([comment(1)]));
    const real = createAgentFlowClient({ baseUrl: `${location.origin}/agentflow/api`, auth: proxyAdapter(), fetch: stub.fetch });
    const sent: { path: string; form: FormData }[] = [];
    let refuse = false;
    const client = {
      ...real,
      POST: (path: string, init: { body: FormData }) => {
        sent.push({ path, form: init.body });
        return refuse
          ? Promise.resolve({ error: { type: 'COMMENTS_CLOSED', title: 'Closed', status: 409 }, response: new Response(null, { status: 409 }) })
          : Promise.resolve({ data: { id: FILE_A, byte_size: 1, content_type: 'text/plain', original_filename: 'a.txt', uploaded_at: '2026-11-12T10:00:00Z' }, response: new Response(null, { status: 201 }) });
      },
    };
    const p = await mountThread(stub, { client });
    const file = new File(['x'], 'a.txt', { type: 'text/plain' });

    await expect(threadOf(p)!.upload!(file)).resolves.toEqual({ id: FILE_A });
    expect(sent).toHaveLength(1);
    expect(sent[0]!.path).toBe('/attachments');
    expect([...sent[0]!.form.keys()]).toEqual(['entity_id', 'record_id', 'comment', 'file']);
    expect([sent[0]!.form.get('entity_id'), sent[0]!.form.get('record_id'), sent[0]!.form.get('comment')]).toEqual([E, R, 'true']);
    expect(sent[0]!.form.get('file')).toBe(file);

    refuse = true;
    await expect(threadOf(p)!.upload!(file)).rejects.toMatchObject({ code: 'COMMENTS_CLOSED', status: 409 });
  });

  describe('opening a file', () => {
    const open = (p: HTMLElement, start: number) =>
      threadOf(p)!.dispatchEvent(
        new CustomEvent('af-comment-open-file', { detail: { files: [{ file: FILE_A, filename: 'a.pdf' }, { file: FILE_B, filename: 'b.pdf' }], start }, bubbles: true }),
      );

    it('hands the files to the host’s preview, at the one chosen, when the provider has one', async () => {
      const preview = vi.fn().mockResolvedValue(undefined);
      const opened = vi.spyOn(window, 'open').mockReturnValue(null);
      const p = await mountThread(api(() => threadPage([comment(1)])), { files: { preview } });
      open(p, 1);
      await settle();
      expect(preview).toHaveBeenCalledWith([{ file: FILE_A, filename: 'a.pdf' }, { file: FILE_B, filename: 'b.pdf' }], { start: 1 });
      expect(opened).not.toHaveBeenCalled();
    });

    it('opens the file’s download in a new tab when the provider has no preview', async () => {
      const opened = vi.spyOn(window, 'open').mockReturnValue(null);
      const stub = api(() => threadPage([comment(1)]));
      const p = await mountThread(stub);
      open(p, 1);
      // In the click itself: a tab opened after an await is a popup the browser may block.
      expect(opened).toHaveBeenCalledTimes(1);
      expect(opened).toHaveBeenCalledWith(`${location.origin}/agentflow/api/attachments/${FILE_B}/download`, '_blank', 'noopener');
      expect(stub.calls.filter((c) => c.path.startsWith('/attachments'))).toEqual([]);
    });
  });
});
