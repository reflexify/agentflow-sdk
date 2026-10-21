import { describe, expect, it } from 'vitest';
import { between, byPosition, placeAt, renumber, STEP } from '../../src/model/positions.js';

describe('positions', () => {
  it('puts a card halfway, at either end, or first', () => {
    expect(between(1024, 2048)).toBe(1536);
    expect(between(null, 1024)).toBe(0);
    expect(between(2048, null)).toBe(2048 + STEP);
    expect(between(null, null)).toBe(STEP);
  });
  it('says when the gap is too small to halve', () => {
    expect(between(1, 1 + 1e-7)).toBeNull();
    expect(between(5, 5)).toBeNull();
  });
  it('renumbers a column in order', () => {
    expect(renumber([{ id: 'a' }, { id: 'b' }])).toEqual([{ id: 'a', position: STEP }, { id: 'b', position: 2 * STEP }]);
  });
  it('places a card between neighbours, and renumbers when it must', () => {
    const column = [{ id: 'a', position: 1024 }, { id: 'b', position: 2048 }, { id: 'm', position: 9000 }];
    expect(placeAt(column, 'm', 1)).toEqual({ position: 1536 });
    const tight = [{ id: 'a', position: 1 }, { id: 'b', position: 1 + 1e-7 }, { id: 'm', position: 9 }];
    expect(placeAt(tight, 'm', 1)).toEqual({ renumber: [{ id: 'a', position: STEP }, { id: 'b', position: 2 * STEP }], position: 1.5 * STEP });
  });
  it('treats a card with no position as last, oldest first', () => {
    const column = [{ id: 'b', position: 1024 }, { id: 'a', position: null }, { id: 'm', position: null }];
    expect(placeAt(column, 'm', 0)).toEqual({ position: 0 });
    expect(placeAt([{ id: 'b', position: 1024 }, { id: 'a', position: null }, { id: 'm', position: 5 }], 'm', 2))
      .toEqual({ renumber: [{ id: 'b', position: STEP }, { id: 'a', position: 2 * STEP }], position: 3 * STEP });
  });
  it('sorts positioned cards first, then unpositioned ones by creation', () => {
    const cards = [
      { id: 'late', position: null, createdAt: '2026-10-03T00:00:00Z' },
      { id: 'two', position: 2, createdAt: '2026-10-05T00:00:00Z' },
      { id: 'early', position: null, createdAt: '2026-10-02T00:00:00Z' },
      { id: 'one', position: 1, createdAt: '2026-10-06T00:00:00Z' },
    ];
    expect([...cards].sort(byPosition).map((c) => c.id)).toEqual(['one', 'two', 'early', 'late']);
  });
  it('lands at either end of a column, and lands in an empty one', () => {
    const column = [{ id: 'a', position: 1024 }, { id: 'b', position: 2048 }, { id: 'm', position: 9000 }];
    expect(placeAt(column, 'm', 2)).toEqual({ position: 2048 + STEP });
    expect(placeAt(column, 'm', 99)).toEqual({ position: 2048 + STEP });
    expect(placeAt([{ id: 'm', position: 5 }], 'm', 0)).toEqual({ position: STEP });
  });
});
