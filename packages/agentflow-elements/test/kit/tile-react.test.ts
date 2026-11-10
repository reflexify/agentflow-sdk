import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../src/kit/index.js';
import { DRILL, REVENUE_SPEC, TILE_FIELDS, revenueResult, uuid } from './fixtures/tile.js';
import { LIST } from './fixtures/tiles.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const valueOf = (el: Element) => (el.shadowRoot?.querySelector('[part~="value"]')?.textContent ?? '').trim();

let root: Root | null = null;
afterEach(async () => {
  await act(async () => root?.unmount());
  root = null;
  document.body.innerHTML = '';
});

describe('<af-tile> in React 19', () => {
  it('takes spec as a property, redraws with a new result and sends af-drill to onaf-drill', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    const onDrill = vi.fn();
    const tile = (result = revenueResult()) =>
      createElement('af-tile', { spec: REVENUE_SPEC, result, fields: TILE_FIELDS, drill: true, 'onaf-drill': onDrill });

    await act(async () => root!.render(tile()));
    const el = container.querySelector('af-tile') as HTMLElement & { spec: unknown; drill: boolean };
    expect(el.spec, 'an object, not the string an attribute would hold').toBe(REVENUE_SPEC);
    expect(el.drill).toBe(true);
    await expect.poll(() => valueOf(el), { timeout: 5000 }).toBe('$1,200.00');

    await act(async () => root!.render(tile(revenueResult(1800, 30))));
    await expect.poll(() => valueOf(el)).toBe('$1,800.00');

    el.shadowRoot!.querySelector<HTMLElement>('[part~="value"]')!.click();
    expect(onDrill).toHaveBeenCalledTimes(1);
    const event = onDrill.mock.calls[0]![0] as CustomEvent;
    expect(event.type).toBe('af-drill');
    expect(event.detail).toEqual({ drill: DRILL, measure: uuid(1), bucket: null, segment: null, label: 'sum · Amount', count: 30, other: false, newTab: false });
  });

  it('takes rows and columns as properties and sends af-open-record to onaf-open-record', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    const onOpen = vi.fn();
    const tile = (rows = LIST.rows) =>
      createElement('af-tile', { spec: LIST.spec, result: LIST.result, fields: LIST.fields, rows, columns: LIST.columns, drill: true, 'onaf-open-record': onOpen });

    await act(async () => root!.render(tile()));
    const el = container.querySelector('af-tile') as HTMLElement & { rows: unknown; columns: unknown };
    expect(el.rows, 'an array, not the string an attribute would hold').toBe(LIST.rows);
    expect(el.columns).toBe(LIST.columns);
    const rowsOf = () => [...el.shadowRoot!.querySelectorAll<HTMLElement>('[part~="list"] tbody tr')];
    await expect.poll(() => rowsOf().length, { timeout: 5000 }).toBe(3);

    await act(async () => root!.render(tile(LIST.rows!.slice(0, 2))));
    await expect.poll(() => rowsOf().length).toBe(2);

    rowsOf()[1]!.click();
    expect(onOpen).toHaveBeenCalledTimes(1);
    const event = onOpen.mock.calls[0]![0] as CustomEvent;
    expect(event.type).toBe('af-open-record');
    expect(event.detail).toEqual({ record: LIST.rows![1]!.id, entity: LIST.rows![1]!.entity_id, newTab: false });
  });

  it('takes paging as a property and sends af-page to onaf-page', async () => {
    const container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    const onPage = vi.fn();
    const tile = (paging: { prev: boolean; next: boolean; busy?: boolean } | null) =>
      createElement('af-tile', { spec: LIST.spec, result: LIST.result, fields: LIST.fields, rows: LIST.rows, columns: LIST.columns, paging, 'onaf-page': onPage });

    const first = { prev: false, next: true };
    await act(async () => root!.render(tile(first)));
    const el = container.querySelector('af-tile') as HTMLElement & { paging: unknown };
    expect(el.paging, 'an object, not the string an attribute would hold').toBe(first);
    const buttons = () => [...el.shadowRoot!.querySelectorAll<HTMLButtonElement>('[part~="pager"] button')];
    await expect.poll(() => buttons().map((b) => b.disabled), { timeout: 5000 }).toEqual([true, false]);

    await act(async () => root!.render(tile({ prev: true, next: true })));
    await expect.poll(() => buttons().map((b) => b.disabled)).toEqual([false, false]);

    buttons()[0]!.click();
    expect(onPage).toHaveBeenCalledTimes(1);
    const event = onPage.mock.calls[0]![0] as CustomEvent;
    expect(event.type).toBe('af-page');
    expect(event.detail).toEqual({ direction: 'prev' });

    await act(async () => root!.render(tile(null)));
    await expect.poll(() => el.shadowRoot!.querySelector('[part~="pager"]')).toBeNull();
  });
});
