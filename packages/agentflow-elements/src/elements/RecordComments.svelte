<svelte:options
  customElement={{
    shadow: 'open',
    props: {
      entity: { attribute: 'entity', type: 'String' },
      record: { attribute: 'record', type: 'String' },
    },
    extend: (ce) => class extends ce {
      // A method from construction: a page may call it before the element has connected, and then there is nothing to read.
      reload(): Promise<void> { return reloaders.get(this)?.() ?? Promise.resolve(); }
    },
  }}
/>

<script module lang="ts">
  const reloaders = new WeakMap<HTMLElement, () => Promise<void>>();
</script>

<script lang="ts">
  import { comments, mentions, ok, type CommentDto, type components, type UnnotifiedPerson } from '@reflexify/agentflow-sdk';
  import { untrack } from 'svelte';
  import { attachmentUrl } from '../attachment-url.js';
  import { commentThreadDefined, defineCommentThread } from '../comment-thread.js';
  import { APP_KEY_MISSING, type Problem } from '../errors.js';
  import { liveReload } from '../live.js';
  import { useAgentFlow } from '../use-agentflow.svelte.js';

  let { entity = undefined, record = undefined }: { entity?: string | null; record?: string | null } = $props();

  const PAGE_SIZE = 25;
  // The answers that say the thread is not as the person last saw it: the comment is gone, the thread is closed or no longer theirs
  // to write in, or the comment was changed by someone else.
  const CHANGED_UNDER_THEM = new Set([403, 404, 409]);
  const STALE_VERSION = 'STALE_VERSION';

  type Thread = HTMLElement & { settle(): void };

  const self = $host();
  const af = useAgentFlow(self);
  const ready = $derived(af.current?.state === 'ready');
  const realtime = $derived(af.current?.realtime ?? null);

  // Oldest first, as the operation answers: the pages read so far, the newest of them last. Raw: the comments are handed on whole.
  let items = $state.raw<CommentDto[]>([]);
  // The cursor of the comments before the oldest one held, or null when the oldest one held is the first of the thread.
  let earlier = $state<string | null>(null);
  let canComment = $state(false);
  let closed = $state(false);
  // The first read has answered, well or badly: until then the element says it is loading.
  let settled = $state(false);
  // Set once a page has been read, so a failure after that keeps the thread on screen.
  let loaded = $state(false);
  let loadingEarlier = $state(false);
  let failure = $state<Problem | null>(null);
  // What a write in flight tells the thread: it locks while `busy`, and shows `writeError` where the action was raised.
  let busy = $state(false);
  let writeError = $state<string | null>(null);
  let unnotified = $state.raw<UnnotifiedPerson[]>([]);
  let thread = $state<Thread | null>(null);

  // The thread's code loads the first time one is drawn, so a page that never draws one never pays for it. A page whose own kit
  // defined every tag has them from the start.
  let threadReady = $state(commentThreadDefined());
  let threadFailed = $state(false);

  // Bumped whenever the element is pointed at another record: each read and write captures it, and an answer that lands after it
  // moved is about a thread that is no longer shown.
  let generation = 0;
  // Bumped when the comments held are replaced rather than added to, so a page of earlier ones still on its way is not joined to them.
  let era = 0;

  // The key of the send that failed, and what it sent. A retry of that same send repeats the key, so a comment that did go
  // through is not posted twice; a changed draft is another request, which the server would refuse under the same key.
  let attempt: { key: string; body: string; files: string } | null = null;

  // Per comment, an edit that lost the version race: the version it started `from` and the newer one it was refused for `to`
  // with the note, which their next Save of that same edit is made over.
  const conflicts = new Map<string, { from: string; to: string }>();

  const unique = (list: CommentDto[]) => {
    const seen = new Set<string>();
    return list.filter((c) => !seen.has(c.id) && !!seen.add(c.id));
  };

  async function newest() {
    const ctx = af.current;
    if (!ctx || !ready || !entity || !record) return;
    const at = generation;
    try {
      const page = await comments.list(ctx.client, { entity_id: entity, record_id: record, limit: PAGE_SIZE });
      if (at !== generation) return;
      const read = unique(page.items);
      const before = page.prev_cursor ?? null;
      canComment = page.can_comment;
      closed = page.closed;
      const start = items.length === 0 || before === null ? -1 : items.findIndex((held) => read.some((c) => c.id === held.id));
      if (items.length === 0) {
        items = read;
        earlier = before;
      } else if (start === -1) {
        // The page is the whole thread, or has nothing in common with what is held: comments may lie between the two that no read
        // has fetched, so it is the page that is kept.
        items = read;
        earlier = before;
        era++;
        loadingEarlier = false;
      } else {
        // What lies before the page stays; the page itself is the newest word on its range, so a comment it left out is gone.
        items = [...items.slice(0, start), ...read];
      }
      loaded = true;
      failure = null;
    } catch (error) {
      const problem = ctx.report(error);
      if (at === generation) failure = problem;
    } finally {
      if (at === generation) settled = true;
    }
  }

  // A reload asked for while one is under way for the same record is read once more when it ends, however many were asked.
  let flight: { at: number; again: boolean; done: Promise<void> } | null = null;
  function reload(): Promise<void> {
    if (flight && flight.at === generation) {
      flight.again = true;
      return flight.done;
    }
    const mine = { at: generation, again: false, done: Promise.resolve() };
    mine.done = (async () => {
      do {
        mine.again = false;
        await newest();
      } while (mine.again && mine.at === generation);
    })().finally(() => {
      if (flight === mine) flight = null;
    });
    flight = mine;
    return mine.done;
  }

  async function loadEarlier() {
    const ctx = af.current;
    const cursor = earlier;
    if (!ctx || !cursor || loadingEarlier || !entity || !record) return;
    const at = generation;
    const sameThread = era;
    loadingEarlier = true;
    try {
      const page = await comments.list(ctx.client, { entity_id: entity, record_id: record, before: cursor, limit: PAGE_SIZE });
      if (at !== generation || sameThread !== era) return;
      const held = new Set(items.map((c) => c.id));
      items = [...page.items.filter((c) => !held.has(c.id)), ...items];
      earlier = page.prev_cursor ?? null;
      failure = null;
    } catch (error) {
      const problem = ctx.report(error);
      if (at === generation && sameThread === era) failure = problem;
    } finally {
      if (at === generation && sameThread === era) loadingEarlier = false;
    }
  }

  // The page's own words for what went wrong with a write, given what `report` made of it (which tells the page once, so the caller
  // reports and this does not), and a read of the thread when the answer says it is not as it was shown.
  function refused(problem: Problem | null, at: number) {
    if (at !== generation) return;
    busy = false;
    const ctx = af.current;
    writeError = ctx && problem ? ctx.t('common.error', { code: problem.code }) : null;
    if (problem && CHANGED_UNDER_THEM.has(problem.status)) void reload();
  }

  // What a write needs: the context, the record it is about, and the thread to tell when it has gone through. Nothing while another
  // write is out, which the thread locks itself against too.
  function begin() {
    const ctx = af.current;
    if (!ctx || !ready || !entity || !record || busy) return null;
    busy = true;
    writeError = null;
    unnotified = [];
    return { ctx, target: { entity_id: entity, record_id: record }, at: generation, thread };
  }

  // The write is over and the thread is told so: it clears the composer, or closes the edit, only now.
  function done(from: { thread: Thread | null }) {
    busy = false;
    from.thread?.settle();
    void reload();
  }

  async function send(e: Event) {
    const { body, attachment_ids } = (e as CustomEvent<{ body: string; attachment_ids?: string[] }>).detail;
    const now = begin();
    if (!now) return;
    const files = attachment_ids ?? [];
    const joined = files.join(',');
    if (!attempt || attempt.body !== body || attempt.files !== joined) attempt = { key: crypto.randomUUID(), body, files: joined };
    try {
      const written = await comments.create(now.ctx.client, {
        ...now.target,
        body,
        ...(files.length > 0 ? { attachment_ids: files } : {}),
        idempotency_key: attempt.key,
      });
      if (now.at !== generation) return;
      attempt = null;
      if (!items.some((c) => c.id === written.comment.id)) items = [...items, written.comment];
      unnotified = written.unnotified ?? [];
      done(now);
    } catch (error) {
      refused(now.ctx.report(error), now.at);
    }
  }

  async function save(e: Event) {
    const { id, body, attachment_ids, version } = (e as CustomEvent<{ id: string; body: string; attachment_ids?: string[]; version?: string }>).detail;
    const held = items.find((c) => c.id === id);
    if (!held) return;
    const now = begin();
    if (!now) return;
    // The edit is checked against the version it started from, not the one held now: a reload while it was open must not let it
    // save over a change silently. After a conflict the person has been told the comment changed, and a second Save of the same
    // edit replaces the newer version on purpose. The open edit hides the comment's current body, so they replace text they have
    // not seen; Cancel is the way to read it, and it drops their draft.
    const opened = version ?? held.edited_at ?? held.created_at;
    const told = conflicts.get(id);
    const from = told && told.from === opened ? told.to : opened;
    try {
      const written = await comments.update(now.ctx.client, { ...now.target, comment: { ...held, edited_at: from }, body, attachment_ids: attachment_ids ?? [] });
      if (now.at !== generation) return;
      conflicts.delete(id);
      items = items.map((c) => (c.id === id ? written.comment : c));
      unnotified = written.unnotified ?? [];
      done(now);
    } catch (error) {
      const problem = now.ctx.report(error);
      if (problem?.code === STALE_VERSION) {
        // Someone changed the comment first. The person's text stays in the editor and the note says the comment changed; nothing
        // is saved over the newer version unless they save again.
        await reload();
        if (now.at !== generation) return;
        const shown = items.find((c) => c.id === id);
        if (shown) conflicts.set(id, { from: opened, to: shown.edited_at ?? shown.created_at });
        busy = false;
        writeError = now.ctx.t('comments.changed');
      } else {
        refused(problem, now.at);
      }
    }
  }

  async function remove(e: Event) {
    const { id } = (e as CustomEvent<{ id: string }>).detail;
    const now = begin();
    if (!now) return;
    try {
      await comments.remove(now.ctx.client, { ...now.target, comment_id: id });
      if (now.at !== generation) return;
      items = items.filter((c) => c.id !== id);
      done(now);
    } catch (error) {
      refused(now.ctx.report(error), now.at);
    }
  }

  function openFile(e: Event) {
    const ctx = af.current;
    const detail = (e as CustomEvent<{ files?: { file: string; filename?: string }[]; start?: number }>).detail;
    const files = Array.isArray(detail?.files) ? detail.files : [];
    if (!ctx || files.length === 0) return;
    const start = detail.start ?? 0;
    if (ctx.files) {
      try {
        ctx.files.preview(files, { start }).catch((error: unknown) => ctx.report(error));
      } catch (error) {
        ctx.report(error);
      }
      return;
    }
    window.open(attachmentUrl(ctx.client, (files[start] ?? files[0]!).file), '_blank', 'noopener');
  }

  // The `@` menu, bound to the record being written about.
  const menu = $derived.by(() => {
    const ctx = af.current;
    if (!ctx || !entity || !record) return null;
    return mentions.menuSource(ctx.client, { entity_id: entity, record_id: record, ...(ctx.locale === 'vi' ? { copy: mentions.VIETNAMESE_MENU_COPY } : {}) });
  });

  // A file a comment carries is held to the record until the comment takes it, so the upload names the record and says it is for a comment.
  const upload = $derived.by(() => {
    const ctx = af.current;
    if (!ctx || !entity || !record) return null;
    const target = { entity, record };
    return async (file: File): Promise<{ id: string }> => {
      const form = new FormData();
      form.append('entity_id', target.entity);
      form.append('record_id', target.record);
      form.append('comment', 'true');
      form.append('file', file);
      try {
        const stored = await ok(ctx.client.POST('/attachments', { body: form as unknown as components['schemas']['AttachmentUpload'] }));
        return { id: stored.id };
      } catch (error) {
        ctx.report(error);
        throw error;
      }
    };
  });

  reloaders.set(self, () => reload());

  // Declared before the reads so it runs first: Svelte runs sibling effects in declaration order.
  $effect(() => {
    void [entity, record];
    generation++;
    items = [];
    earlier = null;
    canComment = false;
    closed = false;
    settled = false;
    loaded = false;
    loadingEarlier = false;
    failure = null;
    busy = false;
    writeError = null;
    unnotified = [];
    attempt = null;
    conflicts.clear();
  });

  $effect(() => {
    if (!ready || !entity || !record) return;
    untrack(() => reload());
  });

  $effect(() => {
    if (!ready || !entity || !record) return;
    const target = { entity_id: entity, record_id: record };
    const channel = realtime;
    return untrack(() =>
      liveReload({
        realtime: channel,
        matches: (event) => comments.isAbout(event, target),
        reload: () => void reload(),
      }),
    );
  });

  $effect(() => {
    if (threadReady) return;
    defineCommentThread().then(
      () => (threadReady = true),
      (error: unknown) => {
        threadFailed = true;
        // The page hears why: a refused or missing chunk is its to fix, and the element only says that it failed.
        af.current?.report(error);
      },
    );
  });

  $effect(() => () => {
    reloaders.delete(self);
  });
</script>

{#if af.current && ready && entity && record}
  {@const t = af.current.t}
  {#if failure}
    <p part="error" class="error" role="alert">
      {#if failure.code === APP_KEY_MISSING}{failure.detail}{:else}{t('common.error', { code: failure.code })}{/if}
      {#if failure.requestId}<br />{t('common.request_id', { id: failure.requestId })}{/if}
    </p>
  {/if}
  {#if threadFailed}
    <p part="error" class="error" role="alert">{t('comments.unavailable')}</p>
  {:else if !threadReady || !settled}
    <p class="muted" role="status">{t('common.loading')}</p>
  {:else if loaded}
    <!-- A thread belongs to one record: its drafts and open edits are dropped with it when the record changes. -->
    {#key `${entity}/${record}`}
      <af-comment-thread
        part="thread"
        bind:this={thread}
        comments={items}
        canComment={canComment}
        closed={closed}
        hasEarlier={earlier !== null}
        busy={busy}
        error={writeError}
        unnotified={unnotified}
        mentions={menu}
        upload={upload}
        locale={af.current.locale}
        onaf-comment-submit={send}
        onaf-comment-edit={save}
        onaf-comment-delete={remove}
        onaf-comment-earlier={loadEarlier}
        onaf-comment-open-file={openFile}
      ></af-comment-thread>
    {/key}
  {/if}
{/if}

<style>
  :host { display: block; font-family: var(--agentflow-font, system-ui, sans-serif); color: var(--agentflow-text, #101828); }
  .muted { color: var(--agentflow-muted, #667085); }
  .error { color: var(--agentflow-danger, #b42318); }
</style>
