import { describe, expect, it } from 'vitest';
import { cursorList, type CursorList, type CursorListState, type CursorPage } from '../src/index.js';

interface Call {
  cursor: string | null;
  signal: AbortSignal;
  resolve(page: CursorPage<number>): void;
  reject(reason: unknown): void;
}

function source() {
  const calls: Call[] = [];
  const list = cursorList<number>(
    (cursor, signal) =>
      new Promise((resolve, reject) => {
        calls.push({ cursor, signal, resolve, reject });
      }),
  );
  return { calls, list };
}

async function answer(list: CursorList<number>, calls: Call[], step: () => Promise<void>, page: CursorPage<number>) {
  const done = step();
  calls[calls.length - 1].resolve(page);
  await done;
  return list.state;
}

describe('cursorList', () => {
  const two: CursorPage<number>[] = [{ items: [1], next_cursor: 'c2' }, { items: [2], next_cursor: 'c3' }];
  it.each<[string, CursorPage<number>[], 'next' | 'prev' | 'reset' | 'reload', string | null, { hasPrev: boolean }]>([
    ['the first next on a fresh list', [], 'next', null, { hasPrev: false }],
    ['next after a page with a cursor', [{ items: [1], next_cursor: 'c2' }], 'next', 'c2', { hasPrev: true }],
    ['prev after two pages', two, 'prev', null, { hasPrev: false }],
    ['reset after two pages', two, 'reset', null, { hasPrev: false }],
    ['reload on the second page', two, 'reload', 'c2', { hasPrev: true }],
  ])('%s fetches the right cursor', async (_name, before, step, cursor, after) => {
    const { calls, list } = source();
    for (const page of before) await answer(list, calls, () => list.next(), page);
    const done = list[step]();
    expect(calls.at(-1)!.cursor).toBe(cursor);
    expect(list.state.busy).toBe(true);
    calls.at(-1)!.resolve({ items: [9], next_cursor: 'c9' });
    await done;
    expect(list.state).toMatchObject({ ...after, items: [9], busy: false, hasNext: true });
  });

  it('reports a next page only for a cursor not already in the stack', async () => {
    const { calls, list } = source();
    let state = await answer(list, calls, () => list.next(), { items: [1], next_cursor: 'c2' });
    expect(state).toMatchObject({ hasPrev: false, hasNext: true });
    state = await answer(list, calls, () => list.next(), { items: [2], next_cursor: 'c2' });
    expect(state).toMatchObject({ hasPrev: true, hasNext: false });
    state = await answer(list, calls, () => list.prev(), { items: [1], next_cursor: null });
    expect(state).toMatchObject({ hasPrev: false, hasNext: false });
  });

  it('aborts the call before and drops its late answer', async () => {
    const { calls, list } = source();
    const first = list.next();
    const second = list.reload();
    expect(calls[0].signal.aborted).toBe(true);
    expect(calls[1].signal.aborted).toBe(false);
    // A stale answer while the newer call is still out leaves it busy and changes nothing.
    const pending = list.state;
    calls[0].resolve({ items: [1], next_cursor: 'c2' });
    await first;
    expect(list.state).toBe(pending);
    expect(list.state.busy).toBe(true);
    calls[1].resolve({ items: [2], next_cursor: null });
    await second;
    expect(list.state).toMatchObject({ items: [2], hasNext: false, busy: false });
  });

  it('aborts the newer call\'s predecessor and drops its answer when it lands after the newer one', async () => {
    const { calls, list } = source();
    const first = list.next();
    const second = list.reload();
    calls[1].resolve({ items: [2], next_cursor: null });
    await second;
    const settled = list.state;
    calls[0].resolve({ items: [1], next_cursor: 'c2' });
    await first;
    expect(list.state).toBe(settled);
  });

  it('forgets the stack when a reset starts, so a reload after a failed reset fetches the first page', async () => {
    const { calls, list } = source();
    for (const page of two) await answer(list, calls, () => list.next(), page);
    const failed = list.reset();
    calls.at(-1)!.reject(new Error('refused'));
    await failed;
    expect(list.state).toMatchObject({ hasPrev: false, hasNext: false, busy: false });
    const retry = list.reload();
    expect(calls.at(-1)!.cursor).toBeNull();
    calls.at(-1)!.resolve({ items: [1], next_cursor: 'c2' });
    await retry;
    expect(list.state).toMatchObject({ items: [1], hasPrev: false, hasNext: true });
  });

  it('holds a rejection in error, clears busy, and clears error on the next call', async () => {
    const { calls, list } = source();
    const boom = new Error('boom');
    const failed = list.next();
    calls[0].reject(boom);
    await failed;
    expect(list.state).toMatchObject({ error: boom, busy: false, items: [] });
    const retry = list.reload();
    expect(list.state.error).toBeUndefined();
    calls[1].resolve({ items: [1], next_cursor: null });
    await retry;
    expect(list.state).toMatchObject({ error: undefined, items: [1] });
  });

  it('tells a subscriber every change, as a new object, until it unsubscribes', async () => {
    const { calls, list } = source();
    const heard: CursorListState<number>[] = [];
    const stop = list.subscribe((state) => heard.push(state));
    await answer(list, calls, () => list.next(), { items: [1], next_cursor: 'c2' });
    expect(heard.map((s) => [s.busy, s.items])).toEqual([
      [true, []],
      [false, [1]],
    ]);
    expect(heard[0]).not.toBe(heard[1]);
    expect(heard[1]).toBe(list.state);
    stop();
    await answer(list, calls, () => list.next(), { items: [2], next_cursor: null });
    expect(heard).toHaveLength(2);
  });
});
