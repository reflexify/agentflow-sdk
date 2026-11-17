import type { ActivityEvent, PublicEvent, RealtimeChannel, RealtimeStatus } from '@reflexify/agentflow-sdk';
import { flushSync } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { liveReload } from '../src/live.js';
import { CALLER, json, mount, problem, settle, shadow, stubApi } from './support.js';

const E = '0190c0de-0000-7000-8000-0000000000e1';
const R = '0190c0de-0000-7000-8000-0000000000b1';
const R2 = '0190c0de-0000-7000-8000-0000000000b2';
const RUN = '0190c0de-0000-7000-8000-0000000000c1';
const OTHER_RUN = '0190c0de-0000-7000-8000-0000000000c2';
const ORG = CALLER.org_id;

const ENTITY = { id: E, fields: [{ key: 'amount', label: 'Amount', system: false }] };
const activityPath = (record = R) => `/entities/${E}/records/${record}/activity`;
const line = (n: number, extra: Partial<ActivityEvent> = {}): ActivityEvent => ({
  id: `0190c0de-0000-7000-8000-${String(n).padStart(12, '0')}`,
  event_type: 'record.updated',
  occurred_at: new Date(Date.UTC(2026, 10, 12, 8, 0, 0) + n * 60_000).toISOString(),
  actor: { kind: 'user', id: CALLER.id, display_name: 'Ann' },
  payload: { changed: ['amount'] },
  ...extra,
});
const page = (items: ActivityEvent[], next: string | null = null) => ({ items, next_cursor: next, prev_cursor: null });

const streamed = (type: string, subject: { kind: string; id: string }, n = 1): PublicEvent => ({
  id: `evt-${n}`,
  type,
  occurred_at: '2026-11-12T10:00:00Z',
  org_id: ORG,
  position: n,
  subject: { entity_id: E, ...subject },
});
const onRecord = (n = 1) => streamed('record.updated', { kind: 'record', id: R }, n);

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
    refetch: () => [...refetches].forEach((l) => l()),
    setStatus: (s: RealtimeStatus) => (current = s),
    listeners: () => events.size + refetches.size,
  };
}

const tag = (attrs = '') => `<agentflow-record-activity entity="${E}" record="${R}" ${attrs}></agentflow-record-activity>`;
const host = (p: HTMLElement) => p.querySelector('agentflow-record-activity') as HTMLElement & { reload(): Promise<void> };
const root = (p: HTMLElement) => shadow(host(p));
const feedOf = (p: HTMLElement) => root(p).querySelector('af-activity-feed') as (HTMLElement & { events: ActivityEvent[]; hasMore: boolean; loading: boolean; fields: Record<string, string>; locale: string }) | null;
const idsOf = (p: HTMLElement) => feedOf(p)!.events.map((e) => e.id);
const drawn = (p: HTMLElement) => [...shadow(feedOf(p)).querySelectorAll('[data-event-id]')].map((li) => li.getAttribute('data-event-id'));
const moreButton = (p: HTMLElement) => shadow(feedOf(p)).querySelector<HTMLButtonElement>('[part~="more"]');

/** The activity reads `api` has seen, as search strings. */
const reads = (api: ReturnType<typeof stubApi>, record = R) => api.calls.filter((c) => c.method === 'GET' && c.path === activityPath(record)).map((c) => c.search);

function api(pages: (url: URL) => ReturnType<typeof page> | Response, extra: Record<string, () => Response> = {}) {
  return stubApi({
    'GET /caller': () => json(200, CALLER),
    [`GET /entities/${E}`]: () => json(200, ENTITY),
    [`GET ${activityPath()}`]: (_req, url) => {
      const answer = pages(url);
      return answer instanceof Response ? answer : json(200, answer);
    },
    ...extra,
  });
}

/** Runs the coalescing window out under fake timers, then hands the clock back so the page can settle. */
async function afterWindow(ms = 250) {
  await vi.advanceTimersByTimeAsync(ms);
  vi.useRealTimers();
  await settle();
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('<agentflow-record-activity>', () => {
  // First: a tag once defined stays defined, and this reads the page before the kit's feed is.
  it('loads the kit feed on demand, then draws the newest page with the entity’s field labels', async () => {
    const stub = api(() => page([line(2), line(1)]));
    const p = await mount(tag(), stub);
    await vi.waitFor(() => expect(customElements.get('af-activity-feed')).toBeDefined());
    await settle();

    const feed = feedOf(p)!;
    expect(feed.events.map((e) => e.id)).toEqual([line(2).id, line(1).id]);
    expect(drawn(p)).toEqual([line(2).id, line(1).id]);
    expect(feed.fields).toEqual({ amount: 'Amount' });
    expect(feed.locale).toBe('en');
    expect(feed.hasMore).toBe(false);
    expect(shadow(feed).textContent).toContain('Amount');
    expect(stub.calls.filter((c) => c.path === `/entities/${E}`)).toHaveLength(1);
    expect(reads(stub)).toEqual(['?limit=25']);
  });

  it('sends the kinds it was given, and none when it has none', async () => {
    const stub = api(() => page([line(1)]));
    await mount(tag('kinds="stage, work"'), stub);
    expect(reads(stub)).toEqual(['?kinds=stage%2Cwork&limit=25']);
    const all = api(() => page([line(1)]));
    await mount(tag(), all);
    expect(reads(all)).toEqual(['?limit=25']);
  });

  it('loads the next page when the feed asks, and appends it', async () => {
    const stub = api((url) => (url.searchParams.get('cursor') === 'older' ? page([line(2), line(1)]) : page([line(4), line(3)], 'older')));
    const p = await mount(tag(), stub);
    expect(feedOf(p)!.hasMore).toBe(true);
    moreButton(p)!.click();
    await settle();
    expect(idsOf(p)).toEqual([line(4).id, line(3).id, line(2).id, line(1).id]);
    expect(feedOf(p)!.hasMore).toBe(false);
    expect(reads(stub)[1]).toBe('?cursor=older&limit=25');
  });

  it('reloads on an event about the record and prepends only the lines it has not got', async () => {
    const live = fakeChannel();
    let fresh = false;
    const stub = api(() => page(fresh ? [line(3), line(2), line(1)] : [line(2), line(1)]));
    const p = await mount(tag(), stub, {}, { realtime: live.channel });
    expect(idsOf(p)).toEqual([line(2).id, line(1).id]);

    fresh = true;
    vi.useFakeTimers();
    live.emit(onRecord());
    await afterWindow();
    expect(reads(stub)).toHaveLength(2);
    expect(idsOf(p)).toEqual([line(3).id, line(2).id, line(1).id]);
    expect(drawn(p)).toEqual(idsOf(p));
  });

  it('keeps the older pages it loaded when a reload prepends', async () => {
    const live = fakeChannel();
    let fresh = false;
    const stub = api((url) => {
      if (url.searchParams.get('cursor') === 'older') return page([line(1)]);
      return page(fresh ? [line(4), line(3), line(2)] : [line(3), line(2)], 'older');
    });
    const p = await mount(tag(), stub, {}, { realtime: live.channel });
    moreButton(p)!.click();
    await settle();
    expect(idsOf(p)).toEqual([line(3).id, line(2).id, line(1).id]);

    fresh = true;
    vi.useFakeTimers();
    live.emit(onRecord());
    await afterWindow();
    expect(idsOf(p)).toEqual([line(4).id, line(3).id, line(2).id, line(1).id]);
    expect(feedOf(p)!.hasMore).toBe(false);
  });

  it('puts a line that arrives late, older than the top one, at its time and not above newer ones', async () => {
    const live = fakeChannel();
    let fresh = false;
    const stub = api(() => page(fresh ? [line(6), line(5), line(4), line(3)] : [line(5), line(3)]));
    const p = await mount(tag(), stub, {}, { realtime: live.channel });
    expect(idsOf(p)).toEqual([line(5).id, line(3).id]);

    fresh = true;
    vi.useFakeTimers();
    live.emit(onRecord());
    await afterWindow();
    expect(idsOf(p)).toEqual([line(6).id, line(5).id, line(4).id, line(3).id]);
    expect(drawn(p)).toEqual(idsOf(p));
  });

  it('starts over when a reload’s whole page is new, since lines may lie between it and what was loaded', async () => {
    const live = fakeChannel();
    let fresh = false;
    const stub = api((url) => {
      if (url.searchParams.get('cursor') === 'newer-older') return page([line(5)]);
      return fresh ? page([line(9), line(8)], 'newer-older') : page([line(2), line(1)], 'older');
    });
    const p = await mount(tag(), stub, {}, { realtime: live.channel });
    fresh = true;
    vi.useFakeTimers();
    live.emit(onRecord());
    await afterWindow();
    expect(idsOf(p)).toEqual([line(9).id, line(8).id]);
    moreButton(p)!.click();
    await settle();
    expect(idsOf(p)).toEqual([line(9).id, line(8).id, line(5).id]);
  });

  it('reads once for ten events inside the window', async () => {
    const live = fakeChannel();
    const stub = api(() => page([line(1)]));
    await mount(tag(), stub, {}, { realtime: live.channel });
    vi.useFakeTimers();
    for (let i = 0; i < 10; i++) {
      live.emit(onRecord(i));
      await vi.advanceTimersByTimeAsync(20);
    }
    expect(reads(stub)).toHaveLength(1);
    await afterWindow();
    expect(reads(stub)).toHaveLength(2);
  });

  it('ignores an event about another record', async () => {
    const live = fakeChannel();
    const stub = api(() => page([line(1)]));
    await mount(tag(), stub, {}, { realtime: live.channel });
    vi.useFakeTimers();
    live.emit(streamed('record.updated', { kind: 'record', id: R2 }));
    await afterWindow(1000);
    expect(reads(stub)).toHaveLength(1);
  });

  it('reloads for a run it has a line for, and once for a run it has none of yet, whose line then shows or which is not read for again', async () => {
    const live = fakeChannel();
    const NEW_RUN = '0190c0de-0000-7000-8000-0000000000c3';
    let lines = [line(2, { event_type: 'instance.started', instance_id: RUN, payload: null }), line(1)];
    const stub = api(() => page(lines));
    const p = await mount(tag(), stub, {}, { realtime: live.channel });
    const quiet = async () => {
      await vi.advanceTimersByTimeAsync(1000);
      vi.useRealTimers();
      await settle();
    };

    // Another record's run: one read finds no line of it, and its later events are not read for.
    vi.useFakeTimers();
    live.emit(streamed('instance.started', { kind: 'instance', id: OTHER_RUN }, 1));
    await afterWindow();
    expect(reads(stub)).toHaveLength(2);
    vi.useFakeTimers();
    live.emit(streamed('instance.completed', { kind: 'instance', id: OTHER_RUN }, 2));
    await quiet();
    expect(reads(stub)).toHaveLength(2);

    // A new run of this record's: its first event is read for, and its line shows.
    lines = [line(3, { event_type: 'instance.started', instance_id: NEW_RUN, payload: null }), ...lines];
    vi.useFakeTimers();
    live.emit(streamed('instance.started', { kind: 'instance', id: NEW_RUN }, 3));
    await afterWindow();
    expect(reads(stub)).toHaveLength(3);
    expect(idsOf(p)[0]).toBe(line(3).id);

    vi.useFakeTimers();
    live.emit(streamed('instance.completed', { kind: 'instance', id: RUN }, 4));
    await afterWindow();
    expect(reads(stub)).toHaveLength(4);
  });

  it('does not read for a run it has no line of while its kinds leave runs out', async () => {
    const live = fakeChannel();
    const stub = api(() => page([line(1)]));
    await mount(tag('kinds="field"'), stub, {}, { realtime: live.channel });
    vi.useFakeTimers();
    live.emit(streamed('instance.started', { kind: 'instance', id: OTHER_RUN }));
    await afterWindow(1000);
    expect(reads(stub)).toHaveLength(1);
  });

  describe('pages whose lines were all withheld', () => {
    it('reads on past them until it has lines, and says there is no activity when the feed ends with none', async () => {
      const stub = api((url) => {
        const cursor = url.searchParams.get('cursor');
        return cursor === null ? page([], 'c1') : cursor === 'c1' ? page([], 'c2') : page([], null);
      });
      const p = await mount(tag(), stub);
      expect(reads(stub)).toEqual(['?limit=25', '?cursor=c1&limit=25', '?cursor=c2&limit=25']);
      expect(feedOf(p)!.events).toEqual([]);
      expect(feedOf(p)!.hasMore).toBe(false);
      expect(moreButton(p)).toBeNull();
      expect(shadow(feedOf(p)).textContent).toContain('No activity yet');

      const found = api((url) => (url.searchParams.get('cursor') === null ? page([], 'c1') : page([line(1)], 'c2')));
      const q = await mount(tag(), found);
      expect(reads(found)).toHaveLength(2);
      expect(idsOf(q)).toEqual([line(1).id]);
      expect(feedOf(q)!.hasMore).toBe(true);
    });

    it('Load more reads on past them, so a press adds lines or the button goes', async () => {
      const stub = api((url) => {
        const cursor = url.searchParams.get('cursor');
        if (cursor === null) return page([line(5)], 'a');
        return cursor === 'a' ? page([], 'b') : page([line(1)], null);
      });
      const p = await mount(tag(), stub);
      moreButton(p)!.click();
      await settle();
      expect(reads(stub)).toHaveLength(3);
      expect(idsOf(p)).toEqual([line(5).id, line(1).id]);
      expect(moreButton(p)).toBeNull();
    });

    it('reads at most five pages for one ask', async () => {
      let n = 0;
      const stub = api(() => page([], `c${++n}`));
      const p = await mount(tag(), stub);
      expect(reads(stub)).toHaveLength(5);
      expect(feedOf(p)!.hasMore).toBe(true);
      moreButton(p)!.click();
      await settle();
      expect(reads(stub)).toHaveLength(10);
    });
  });

  it('reloads on a refetch from the channel', async () => {
    const live = fakeChannel();
    const stub = api(() => page([line(1)]));
    await mount(tag(), stub, {}, { realtime: live.channel });
    vi.useFakeTimers();
    live.refetch();
    await afterWindow();
    expect(reads(stub)).toHaveLength(2);
  });

  it('reloads when the window regains focus, with no channel or one that is polling, and not while one is live', async () => {
    const stub = api(() => page([line(1)]));
    await mount(tag(), stub);
    window.dispatchEvent(new Event('focus'));
    await settle();
    expect(reads(stub)).toHaveLength(2);

    const polling = fakeChannel('polling');
    const viaPolling = api(() => page([line(1)]));
    await mount(tag(), viaPolling, {}, { realtime: polling.channel });
    window.dispatchEvent(new Event('focus'));
    await settle();
    expect(reads(viaPolling)).toHaveLength(2);

    const live = fakeChannel('live');
    const viaStream = api(() => page([line(1)]));
    await mount(tag(), viaStream, {}, { realtime: live.channel });
    window.dispatchEvent(new Event('focus'));
    await settle();
    expect(reads(viaStream)).toHaveLength(1);
  });

  it('reload() fetches the newest page now, and a reload called while one is under way is one more read, not two', async () => {
    let fresh = false;
    let answer!: (r: Response) => void;
    const stub = api(() => page(fresh ? [line(2), line(1)] : [line(1)]), {});
    const p = await mount(tag(), stub);
    fresh = true;
    await host(p).reload();
    flushSync();
    expect(idsOf(p)).toEqual([line(2).id, line(1).id]);
    expect(reads(stub)).toHaveLength(2);

    let seen = 0;
    const held = stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, ENTITY),
      [`GET ${activityPath()}`]: () => (++seen === 2 ? (new Promise<Response>((resolve) => (answer = resolve)) as unknown as Response) : json(200, page([line(1)]))),
    });
    const q = await mount(tag(), held);
    const first = host(q).reload();
    const second = host(q).reload();
    await settle();
    expect(reads(held)).toHaveLength(2);
    answer(json(200, page([line(1)])));
    await settle();
    await Promise.all([first, second]);
    expect(reads(held)).toHaveLength(3);
  });

  it('shows the failure and no feed when the first page cannot be read, and recovers on a reload', async () => {
    let broken = true;
    const stub = api(() => (broken ? problem(500, 'INTERNAL') : page([line(1)])));
    const p = await mount(tag(), stub);
    expect(feedOf(p)).toBeNull();
    expect(root(p).querySelector('[part="error"]')!.textContent).toContain('INTERNAL');
    broken = false;
    await host(p).reload();
    flushSync();
    expect(root(p).querySelector('[part="error"]')).toBeNull();
    expect(idsOf(p)).toEqual([line(1).id]);
  });

  it('starts over for another record, and drops a page still on its way from the first', async () => {
    let answer!: (r: Response) => void;
    const stub = stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, ENTITY),
      [`GET ${activityPath()}`]: () => new Promise<Response>((resolve) => (answer = resolve)) as unknown as Response,
      [`GET ${activityPath(R2)}`]: () => json(200, page([line(7)])),
    });
    const p = await mount(tag(), stub);
    host(p).setAttribute('record', R2);
    await settle();
    expect(idsOf(p)).toEqual([line(7).id]);
    answer(json(200, page([line(1)])));
    await settle();
    expect(idsOf(p)).toEqual([line(7).id]);
  });

  it('keeps the field labels when the record changes while the entity is still being read', async () => {
    let answer!: (r: Response) => void;
    const stub = stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => new Promise<Response>((resolve) => (answer = resolve)) as unknown as Response,
      [`GET ${activityPath()}`]: () => json(200, page([line(1)])),
      [`GET ${activityPath(R2)}`]: () => json(200, page([line(7)])),
    });
    const p = await mount(tag(), stub);
    host(p).setAttribute('record', R2);
    await settle();
    expect(idsOf(p)).toEqual([line(7).id]);
    answer(json(200, ENTITY));
    await settle();
    expect(feedOf(p)!.fields).toEqual({ amount: 'Amount' });
    expect(stub.calls.filter((c) => c.path === `/entities/${E}`)).toHaveLength(1);
  });

  it('drops the labels of an entity it has since moved off', async () => {
    const E2 = '0190c0de-0000-7000-8000-0000000000e2';
    let answer!: (r: Response) => void;
    const stub = stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => new Promise<Response>((resolve) => (answer = resolve)) as unknown as Response,
      [`GET /entities/${E2}`]: () => json(200, { id: E2, fields: [{ key: 'total', label: 'Total', system: false }] }),
      [`GET ${activityPath()}`]: () => json(200, page([line(1)])),
      [`GET /entities/${E2}/records/${R}/activity`]: () => json(200, page([line(2)])),
    });
    const p = await mount(tag(), stub);
    host(p).setAttribute('entity', E2);
    await settle();
    expect(feedOf(p)!.fields).toEqual({ total: 'Total' });
    answer(json(200, ENTITY));
    await settle();
    expect(feedOf(p)!.fields).toEqual({ total: 'Total' });
  });

  it('stops listening when it is removed', async () => {
    const live = fakeChannel();
    const stub = api(() => page([line(1)]));
    const p = await mount(tag(), stub, {}, { realtime: live.channel });
    expect(live.listeners()).toBeGreaterThan(0);
    host(p).remove();
    await settle();
    expect(live.listeners()).toBe(0);
    vi.useFakeTimers();
    window.dispatchEvent(new Event('focus'));
    await afterWindow(1000);
    expect(reads(stub)).toHaveLength(1);
  });
});

describe('liveReload', () => {
  const run = (channel: RealtimeChannel | null, win = new EventTarget()) => {
    const reload = vi.fn();
    const stop = liveReload({ realtime: channel, matches: (e) => e.subject.id === R, reload, win: win as unknown as Window });
    return { reload, stop, win };
  };

  it('calls reload once, 250 ms after the first matching event, however many follow', () => {
    vi.useFakeTimers();
    const live = fakeChannel();
    const { reload } = run(live.channel);
    live.emit(onRecord(1));
    vi.advanceTimersByTime(249);
    live.emit(onRecord(2));
    live.emit(onRecord(3));
    expect(reload).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(reload).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1000);
    expect(reload).toHaveBeenCalledTimes(1);
    live.emit(onRecord(4));
    vi.advanceTimersByTime(250);
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it('treats a refetch as a matching event and ignores an event that does not match', () => {
    vi.useFakeTimers();
    const live = fakeChannel();
    const { reload } = run(live.channel);
    live.emit(streamed('record.updated', { kind: 'record', id: R2 }));
    vi.advanceTimersByTime(500);
    expect(reload).not.toHaveBeenCalled();
    live.refetch();
    vi.advanceTimersByTime(250);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('reloads on focus only without a channel or while it polls, deciding when the focus comes', () => {
    const live = fakeChannel('live');
    const stream = run(live.channel);
    stream.win.dispatchEvent(new Event('focus'));
    expect(stream.reload).not.toHaveBeenCalled();
    live.setStatus('polling');
    stream.win.dispatchEvent(new Event('focus'));
    expect(stream.reload).toHaveBeenCalledTimes(1);
    live.setStatus('live');
    stream.win.dispatchEvent(new Event('focus'));
    expect(stream.reload).toHaveBeenCalledTimes(1);

    const bare = run(null);
    bare.win.dispatchEvent(new Event('focus'));
    expect(bare.reload).toHaveBeenCalledTimes(1);
  });

  it('stops listening, and drops a reload still waiting, when it is stopped', () => {
    vi.useFakeTimers();
    const live = fakeChannel();
    const { reload, stop, win } = run(live.channel);
    live.emit(onRecord());
    stop();
    expect(live.listeners()).toBe(0);
    vi.advanceTimersByTime(1000);
    win.dispatchEvent(new Event('focus'));
    expect(reload).not.toHaveBeenCalled();
  });
});
