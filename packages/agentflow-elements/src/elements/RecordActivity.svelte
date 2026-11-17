<svelte:options
  customElement={{
    shadow: 'open',
    props: {
      entity: { attribute: 'entity', type: 'String' },
      record: { attribute: 'record', type: 'String' },
      kinds: { attribute: 'kinds', type: 'String' },
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
  import { activity, ok, type ActivityEvent, type ActivityKind } from '@reflexify/agentflow-sdk';
  import { untrack } from 'svelte';
  import { ACTIVITY_FEED_TAG, defineActivityFeed } from '../activity-feed.js';
  import { APP_KEY_MISSING, type Problem } from '../errors.js';
  import { liveReload } from '../live.js';
  import { useAgentFlow } from '../use-agentflow.svelte.js';

  let { entity = undefined, record = undefined, kinds = undefined }: { entity?: string | null; record?: string | null; kinds?: string | null } = $props();

  const PAGE_SIZE = 25;
  // The most pages one ask reads while every line it gets back is withheld from this reader.
  const MAX_READS = 5;

  const self = $host();
  const af = useAgentFlow(self);
  const ready = $derived(af.current?.state === 'ready');
  const realtime = $derived(af.current?.realtime ?? null);
  // Handed to the operation as written: a kind it does not know is its 400 to give, and the page hears it.
  const kindList = $derived((kinds ?? '').split(',').map((k) => k.trim()).filter(Boolean) as ActivityKind[]);
  const kindsKey = $derived(kindList.join(','));

  // Raw: the lines are handed on whole, and a deep proxy of each buys nothing.
  let items = $state.raw<ActivityEvent[]>([]);
  let next = $state<string | null>(null);
  let labels = $state.raw<Record<string, string>>({});
  // The first read has answered, well or badly: until then the feed says it is loading.
  let settled = $state(false);
  let loadingMore = $state(false);
  let failure = $state<Problem | null>(null);

  // The feed's code loads the first time a record's activity is drawn, so a page that never draws one never pays for it. A page
  // whose own kit defined the tag has it from the start.
  let feedReady = $state(customElements.get(ACTIVITY_FEED_TAG) !== undefined);
  let feedFailed = $state(false);

  // Bumped whenever the element is pointed at another record or other kinds: each read captures it, and an answer that lands
  // after it moved is about lines that are no longer shown.
  let generation = 0;
  // Bumped when the lines held are replaced rather than added to, so a page of older ones still on its way is not joined to them.
  let era = 0;

  // An `instance` event names its run, not the record, so a run the feed has no line of yet may be a new one of the record's. Such a
  // run is read for once (`asked`); one still without a line after that read is another record's (`foreign`) and not read for again.
  const asked = new Set<string>();
  const foreign = new Set<string>();
  const FOREIGN_MAX = 500;
  const runsOf = (lines: ActivityEvent[]) => new Set(lines.flatMap((line) => (line.instance_id ? [line.instance_id] : [])));
  const showsRuns = $derived(kindList.length === 0 || kindList.includes('run'));

  const unique = (lines: ActivityEvent[]) => {
    const seen = new Set<string>();
    return lines.filter((line) => !seen.has(line.id) && !!seen.add(line.id));
  };

  // Newest first, as the operation orders its lines: by time, and by id for lines of the same instant.
  function newer(a: ActivityEvent, b: ActivityEvent): number {
    const x = Date.parse(a.occurred_at);
    const y = Date.parse(b.occurred_at);
    if (x !== y && !Number.isNaN(x) && !Number.isNaN(y)) return y - x;
    if (a.occurred_at !== b.occurred_at) return a.occurred_at < b.occurred_at ? 1 : -1;
    return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
  }

  // Each fresh line goes where its time puts it, so a late one with an older time does not sit above newer lines; the lines held
  // keep their order.
  function withFresh(held: ActivityEvent[], fresh: ActivityEvent[]): ActivityEvent[] {
    const merged = [...held];
    for (const line of fresh) {
      const at = merged.findIndex((other) => newer(line, other) < 0);
      merged.splice(at === -1 ? merged.length : at, 0, line);
    }
    return merged;
  }

  async function loadLabels(entityId: string) {
    const ctx = af.current;
    if (!ctx) return;
    try {
      const read = (await ok(ctx.client.GET('/entities/{entity_id}', { params: { path: { entity_id: entityId } } }))) as { fields?: { key: string; label: string }[] };
      // Labels belong to the entity, not to the record or kinds shown: only a move to another entity makes them stale.
      if (entity === entityId) labels = Object.fromEntries((read.fields ?? []).map((f) => [f.key, f.label]));
    } catch (error) {
      // The lines are drawn with the field keys instead; the page still hears why.
      ctx.report(error);
    }
  }

  type Page = { items: ActivityEvent[]; next_cursor: string | null };

  // The server drops the lines a reader may not be told after it reads them, so a page can come back empty with more behind it.
  // Reading on past such pages, a bounded number per ask, is what keeps "Load more" from being a press that adds nothing and an
  // empty feed from hiding "No activity yet". `current` says whether the answer is still wanted.
  async function readOn(first: Page, current: () => boolean): Promise<Page | null> {
    const ctx = af.current;
    let page = first;
    const lines = [...page.items];
    for (let read = 1; ctx && entity && record && lines.length === 0 && page.next_cursor !== null && read < MAX_READS; read++) {
      page = await activity.list(ctx.client, { entity_id: entity, record_id: record, kinds: kindList, cursor: page.next_cursor, limit: PAGE_SIZE });
      if (!current()) return null;
      lines.push(...page.items);
    }
    return { items: lines, next_cursor: page.next_cursor };
  }

  async function newest() {
    const ctx = af.current;
    if (!ctx || !ready || !entity || !record) return;
    const at = generation;
    const asking = [...asked];
    asked.clear();
    try {
      let page: Page | null = await activity.list(ctx.client, { entity_id: entity, record_id: record, kinds: kindList, limit: PAGE_SIZE });
      if (at !== generation) return;
      // Only a feed that holds nothing reads on: one that holds lines has its own cursor past them already.
      if (items.length === 0) page = await readOn(page, () => at === generation);
      if (!page) return;
      const read = unique(page.items);
      const held = new Set(items.map((line) => line.id));
      const fresh = read.filter((line) => !held.has(line.id));
      if (items.length === 0) {
        items = read;
        next = page.next_cursor;
      } else if (page.next_cursor !== null && fresh.length === read.length && read.length > 0) {
        // A full page with nothing in common with what is held: lines may lie between the two that no read has fetched.
        items = read;
        next = page.next_cursor;
        era++;
        loadingMore = false;
      } else {
        items = withFresh(items, fresh);
      }
      failure = null;
      const shown = runsOf(items);
      if (foreign.size > FOREIGN_MAX) foreign.clear();
      for (const run of asking) if (!shown.has(run)) foreign.add(run);
    } catch (error) {
      const problem = ctx.report(error);
      if (at === generation) failure = problem;
    } finally {
      if (at === generation) settled = true;
    }
  }

  // A reload asked for while one is under way for the same lines is read once more when it ends, however many were asked.
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

  async function more() {
    const ctx = af.current;
    const cursor = next;
    if (!ctx || !cursor || loadingMore || !entity || !record) return;
    const at = generation;
    const sameLines = era;
    loadingMore = true;
    try {
      const current = () => at === generation && sameLines === era;
      const first = await activity.list(ctx.client, { entity_id: entity, record_id: record, kinds: kindList, cursor, limit: PAGE_SIZE });
      if (!current()) return;
      const page = await readOn(first, current);
      if (!page) return;
      items = unique([...items, ...page.items]);
      next = page.next_cursor;
      failure = null;
    } catch (error) {
      const problem = ctx.report(error);
      if (at === generation && sameLines === era) failure = problem;
    } finally {
      if (at === generation && sameLines === era) loadingMore = false;
    }
  }

  reloaders.set(self, () => reload());

  // Declared before the reads so it runs first: Svelte runs sibling effects in declaration order.
  $effect(() => {
    void [entity, record, kindsKey];
    generation++;
    items = [];
    next = null;
    settled = false;
    loadingMore = false;
    failure = null;
    asked.clear();
    foreign.clear();
  });

  $effect(() => {
    void entity;
    labels = {};
    if (!ready || !entity) return;
    const id = entity;
    untrack(() => loadLabels(id));
  });

  $effect(() => {
    if (!ready || !entity || !record) return;
    void kindsKey;
    untrack(() => reload());
  });

  $effect(() => {
    if (!ready || !entity || !record) return;
    const target = { entity_id: entity, record_id: record };
    const channel = realtime;
    return untrack(() =>
      liveReload({
        realtime: channel,
        matches: (event) => {
          if (activity.isAbout(event, target, runsOf(items))) return true;
          const { kind, id } = event.subject;
          if (kind !== 'instance' || !showsRuns || foreign.has(id)) return false;
          asked.add(id);
          return true;
        },
        reload: () => void reload(),
      }),
    );
  });

  $effect(() => {
    if (feedReady) return;
    defineActivityFeed().then(
      () => (feedReady = true),
      (error: unknown) => {
        feedFailed = true;
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
  {#if feedFailed}
    <p part="error" class="error" role="alert">{t('activity.unavailable')}</p>
  {:else if !feedReady}
    <p class="muted" role="status">{t('common.loading')}</p>
  {:else if items.length > 0 || !failure}
    <af-activity-feed
      part="feed"
      events={items}
      fields={labels}
      hasMore={next !== null}
      loading={!settled || loadingMore}
      locale={af.current.locale}
      onaf-activity-more={more}
    ></af-activity-feed>
  {/if}
{/if}

<style>
  :host { display: block; font-family: var(--agentflow-font, system-ui, sans-serif); color: var(--agentflow-text, #101828); }
  .muted { color: var(--agentflow-muted, #667085); }
  .error { color: var(--agentflow-danger, #b42318); }
</style>
