import { describe, expect, it } from 'vitest';
import { applyListOps, ListOpError, newItemId, LIST_MAX_OPS } from '../src/lists/index.js';

const ids = (l: { id: string }[]) => l.map((i) => i.id);

describe('applyListOps', () => {
  it('appends, puts at the top, or inserts after an anchor', () => {
    const cur = [{ id: 'a' }, { id: 'b' }];
    const out = applyListOps(cur, [
      { op: 'add', id: 'x', values: {} },
      { op: 'add', id: 'y', values: {}, after: null },
      { op: 'add', id: 'z', values: {}, after: 'a' },
    ]);
    expect(ids(out)).toEqual(['y', 'a', 'z', 'b', 'x']);
  });
  it('appends after a vanished anchor', () => {
    expect(ids(applyListOps([{ id: 'a' }], [{ op: 'add', id: 'x', values: {}, after: 'gone' }]))).toEqual(['a', 'x']);
  });
  it('merges on set and reorders on move', () => {
    const out = applyListOps(
      [{ id: 'a', text: 'a', done: false }, { id: 'b' }, { id: 'c' }],
      [
        { op: 'set', id: 'a', values: { done: true } },
        { op: 'move', id: 'c', after: null },
        { op: 'move', id: 'a', after: 'b' },
      ],
    );
    expect(ids(out)).toEqual(['c', 'b', 'a']);
    expect(out[2]).toEqual({ id: 'a', text: 'a', done: true });
  });
  it('moves after a vanished anchor to the end', () => {
    expect(ids(applyListOps([{ id: 'a' }, { id: 'b' }], [{ op: 'move', id: 'a', after: 'gone' }]))).toEqual(['b', 'a']);
  });
  it('moves an item after itself to the end, as the server does', () => {
    expect(ids(applyListOps([{ id: 'a' }, { id: 'b' }, { id: 'c' }], [{ op: 'move', id: 'a', after: 'a' }]))).toEqual([
      'b',
      'c',
      'a',
    ]);
  });
  it('fails set and move on a missing item, not remove', () => {
    expect(() => applyListOps([{ id: 'a' }], [{ op: 'set', id: 'g', values: {} }])).toThrow(ListOpError);
    expect(() => applyListOps([{ id: 'a' }], [{ op: 'move', id: 'g', after: null }])).toThrow(ListOpError);
    expect(applyListOps([{ id: 'a' }], [{ op: 'remove', id: 'g' }])).toHaveLength(1);
  });
  it('keeps ids out of values and refuses a taken id', () => {
    expect(() => applyListOps([{ id: 'a' }], [{ op: 'set', id: 'a', values: { id: 'b' } }])).toThrow(ListOpError);
    expect(() => applyListOps([{ id: 'a' }], [{ op: 'add', id: 'a', values: {} }])).toThrow(ListOpError);
  });
  it('treats an absent list as empty and caps ops', () => {
    expect(applyListOps(undefined, [{ op: 'add', values: {} }], () => 'm')).toEqual([{ id: 'm' }]);
    const many = Array.from({ length: LIST_MAX_OPS + 1 }, () => ({ op: 'remove' as const, id: 'x' }));
    expect(() => applyListOps([], many)).toThrow(ListOpError);
  });
  it('does not mutate its input', () => {
    const cur = [{ id: 'a', done: false }];
    applyListOps(cur, [{ op: 'set', id: 'a', values: { done: true } }]);
    expect(cur[0].done).toBe(false);
  });
});

describe('newItemId', () => {
  it('is a version-7 UUID ordered by time', () => {
    const a = newItemId(1_700_000_000_000);
    const b = newItemId(1_700_000_000_001);
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(a < b).toBe(true);
  });
});
