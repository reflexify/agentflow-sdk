import { describe, expect, it, vi } from 'vitest';
import { paginate } from '../src/index.js';

describe('paginate', () => {
  it('yields every item across pages in order and stops at the last cursor', async () => {
    const pages: Record<string, { items: number[]; next_cursor: string | null }> = {
      start: { items: [1, 2], next_cursor: 'a' },
      a: { items: [3, 4], next_cursor: 'b' },
      b: { items: [5], next_cursor: null },
    };
    const fetchPage = vi.fn(async (cursor?: string) => pages[cursor ?? 'start']);

    const items: number[] = [];
    for await (const item of paginate(fetchPage)) items.push(item);

    expect(items).toEqual([1, 2, 3, 4, 5]);
    expect(fetchPage).toHaveBeenCalledTimes(3);
    expect(fetchPage).toHaveBeenNthCalledWith(1, undefined);
    expect(fetchPage).toHaveBeenNthCalledWith(2, 'a');
    expect(fetchPage).toHaveBeenNthCalledWith(3, 'b');
  });

  it('stops when the server hands back a cursor it was already sent', async () => {
    const pages: Record<string, { items: number[]; next_cursor: string | null }> = {
      start: { items: [1], next_cursor: 'a' },
      a: { items: [2], next_cursor: 'b' },
      b: { items: [3], next_cursor: 'a' },
    };
    let calls = 0;
    const fetchPage = vi.fn(async (cursor?: string) => {
      if (++calls > 20) throw new Error('walked past a repeated cursor');
      return pages[cursor ?? 'start'];
    });

    const items: number[] = [];
    for await (const item of paginate(fetchPage)) items.push(item);

    expect(items).toEqual([1, 2, 3]);
    expect(fetchPage).toHaveBeenCalledTimes(3);
  });
});
