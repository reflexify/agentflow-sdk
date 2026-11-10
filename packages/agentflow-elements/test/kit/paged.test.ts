import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PickerPage, PickerQuery, PickerSource } from '@reflexify/agentflow-sdk';
import { paged } from '../../src/kit/picker/paged.svelte.js';

interface Item { id: string; name: string }
const NAMES: Item[] = [
  ...Array.from({ length: 30 }, (_, i) => ({ id: `ngo-${i + 1}`, name: `Ngo ${i + 1}` })),
  ...Array.from({ length: 30 }, (_, i) => ({ id: `nguyen-${i + 1}`, name: `Nguyen ${i + 1}` })),
];
const PAGE = 20;

/** A source over NAMES in pages of 20, each answer after `delays[q]` ms (10 by default), aborted or not. */
function spySource(delays: Record<string, number> = {}) {
  const queries: PickerQuery[] = [];
  const source = vi.fn((query: PickerQuery) => {
    queries.push(query);
    const hits = NAMES.filter((n) => n.name.toLowerCase().includes(query.q));
    const start = query.cursor ? Number(query.cursor) : 0;
    const end = start + PAGE;
    return new Promise<PickerPage<Item>>((answer) =>
      setTimeout(() => answer({ items: hits.slice(start, end), next: end < hits.length ? String(end) : null }), delays[query.q] ?? 10));
  }) as unknown as PickerSource<Item> & ReturnType<typeof vi.fn>;
  return { source, queries };
}
const ids = (items: Item[]) => items.map((i) => i.id);

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('paged', () => {
  it('asks once, for the last text, 250 ms after the last keystroke', async () => {
    const { source, queries } = spySource();
    const list = paged<Item>((i) => i.id);
    list.reset(source);
    list.search('ng');
    expect(list.busy).toBe(true);
    await vi.advanceTimersByTimeAsync(100);
    list.search('ngu');
    await vi.advanceTimersByTimeAsync(249);
    expect(source).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(source).toHaveBeenCalledTimes(1);
    expect(queries[0]).toMatchObject({ q: 'ngu', cursor: null });
    await vi.advanceTimersByTimeAsync(10);
    expect(list.busy).toBe(false);
    expect(list.items).toHaveLength(20);
  });

  it('drops a slow answer that lands after a later, faster one', async () => {
    const { source, queries } = spySource({ ng: 500, ngu: 10 });
    const list = paged<Item>((i) => i.id);
    list.reset(source);
    list.search('ng');
    await vi.advanceTimersByTimeAsync(250);
    list.search('ngu');
    await vi.advanceTimersByTimeAsync(260);
    expect(queries.map((q) => q.q)).toEqual(['ng', 'ngu']);
    expect(queries[0]!.signal.aborted).toBe(true);
    const nguyen = ids(NAMES.slice(30, 50));
    expect(ids(list.items)).toEqual(nguyen);
    await vi.advanceTimersByTimeAsync(500);
    expect(ids(list.items)).toEqual(nguyen);
    expect(list.next).toBe('20');
  });

  it('appends the next page on more, ignores more while busy, and ends with next null', async () => {
    const { source, queries } = spySource();
    const list = paged<Item>((i) => i.id);
    list.reset(source);
    list.now('');
    expect(queries).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(10);
    expect(list.items).toHaveLength(20);
    expect(list.next).toBe('20');
    list.more();
    list.more();
    expect(queries.map((q) => q.cursor)).toEqual([null, '20']);
    await vi.advanceTimersByTimeAsync(10);
    expect(ids(list.items)).toEqual(ids(NAMES.slice(0, 40)));
    expect(list.next).toBe('40');
    list.more();
    await vi.advanceTimersByTimeAsync(10);
    expect(ids(list.items)).toEqual(ids(NAMES));
    expect(list.next).toBeNull();
    list.more();
    expect(queries).toHaveLength(3);
  });

  it('leaves the list as it was when the source rejects or throws', async () => {
    let fail: 'reject' | 'throw' | null = null;
    const { source: answering } = spySource();
    const source = ((query: PickerQuery) => {
      if (fail === 'throw') throw new Error('offline');
      if (fail === 'reject') return Promise.reject(new Error('offline'));
      return answering(query);
    }) as PickerSource<Item>;
    const list = paged<Item>((i) => i.id);
    list.reset(source);
    list.now('');
    await vi.advanceTimersByTimeAsync(10);
    for (const how of ['reject', 'throw'] as const) {
      fail = how;
      list.more();
      await vi.advanceTimersByTimeAsync(10);
      expect(list.items, how).toHaveLength(20);
      expect(list.next, how).toBe('20');
      expect(list.busy, how).toBe(false);
    }
  });

  it('asks resolve once for each key no page named, and keeps the keys it did not name', async () => {
    const { source } = spySource();
    let answer!: (items: Item[]) => void;
    source.resolve = vi.fn(() => new Promise<Item[]>((r) => (answer = r)));
    const list = paged<Item>((i) => i.id);
    list.reset(source);
    list.now('');
    await vi.advanceTimersByTimeAsync(10);
    list.resolve(['ngo-1', 'x', 'y']);
    list.resolve(['x']);
    expect(source.resolve).toHaveBeenCalledTimes(1);
    expect(vi.mocked(source.resolve).mock.calls[0]![0]).toEqual(['x', 'y']);
    answer([{ id: 'y', name: 'Yến' }]);
    await vi.advanceTimersByTimeAsync(0);
    list.resolve(['x', 'y']);
    expect(source.resolve).toHaveBeenCalledTimes(1);
    expect(list.named.get('y')?.name).toBe('Yến');
    expect([...list.unnamed]).toEqual(['x']);
  });

  it('counts the keys of a resolve that rejects or throws as unnamed, and never asks for them again', async () => {
    for (const how of ['reject', 'throw'] as const) {
      const { source } = spySource();
      source.resolve = vi.fn(() => {
        if (how === 'throw') throw new Error('too many ids');
        return Promise.reject(new Error('too many ids'));
      });
      const list = paged<Item>((i) => i.id);
      list.reset(source);
      list.resolve(['x', 'y']);
      await vi.advanceTimersByTimeAsync(0);
      expect([...list.unnamed], how).toEqual(['x', 'y']);
      list.resolve(['x', 'y']);
      await vi.advanceTimersByTimeAsync(0);
      expect(source.resolve, how).toHaveBeenCalledTimes(1);
    }
  });

  it('changes nothing for the same source, and restarts for another, keeping the names', async () => {
    const first = spySource();
    const list = paged<Item>((i) => i.id);
    list.reset(first.source);
    list.now('');
    await vi.advanceTimersByTimeAsync(10);
    list.more();
    list.reset(first.source);
    expect(first.queries[1]!.signal.aborted).toBe(false);
    expect(list.items).toHaveLength(20);
    expect(list.busy).toBe(true);

    const second = spySource();
    list.reset(second.source);
    expect(first.queries[1]!.signal.aborted).toBe(true);
    expect(list.items).toEqual([]);
    expect(list.next).toBeNull();
    expect(list.busy).toBe(false);
    expect(list.named.get('ngo-1')?.name).toBe('Ngo 1');
    await vi.advanceTimersByTimeAsync(10);
    expect(list.items).toEqual([]);
  });

  it('drops a page that answers after stop, as when the list closed while it was asked for', async () => {
    const { source, queries } = spySource();
    const list = paged<Item>((i) => i.id);
    list.reset(source);
    list.now('');
    await vi.advanceTimersByTimeAsync(10);
    list.more();
    list.stop();
    expect(queries[1]!.signal.aborted).toBe(true);
    await vi.advanceTimersByTimeAsync(10);
    expect(ids(list.items)).toEqual(ids(NAMES.slice(0, 20)));
    expect(list.next).toBe('20');
    expect(list.busy).toBe(false);
  });

  it('aborts everything on destroy, and an answer after it changes nothing', async () => {
    const { source, queries } = spySource();
    let lookup!: AbortSignal;
    source.resolve = vi.fn((_ids: string[], signal: AbortSignal) => {
      lookup = signal;
      return new Promise<Item[]>((r) => setTimeout(() => r([{ id: 'x', name: 'Xuân' }]), 10));
    });
    const list = paged<Item>((i) => i.id);
    list.reset(source);
    list.now('');
    list.resolve(['x']);
    list.destroy();
    expect(queries[0]!.signal.aborted).toBe(true);
    expect(lookup.aborted).toBe(true);
    expect(list.busy).toBe(false);
    await vi.advanceTimersByTimeAsync(10);
    expect(list.items).toEqual([]);
    expect(list.named.has('x')).toBe(false);
    expect(list.unnamed.has('x')).toBe(false);
  });
});
