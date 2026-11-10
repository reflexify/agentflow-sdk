// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import type { AfTileSpec } from '@reflexify/agentflow-elements/kit';
import { describe, expect, it } from 'vitest';
import { DateInput, FileUpload, NumberInput, Tile } from '../src/module/kit.js';
import { NUMBER_GOAL } from '../src/module/tiles.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
class NoResize { observe() {} unobserve() {} disconnect() {} }
globalThis.ResizeObserver ??= NoResize as unknown as typeof ResizeObserver;

// A wrapper sets its properties by name, so a misspelt one is set on nothing the element reads: each name must come
// back from the element with the value given.
async function drawn(node: React.ReactNode, tag: string): Promise<Record<string, unknown>> {
  const box = document.createElement('div');
  document.body.append(box);
  const root = createRoot(box);
  await act(async () => root.render(node));
  const el = box.querySelector(tag) as unknown as Record<string, unknown>;
  expect(Object.getPrototypeOf(el)).toBe(customElements.get(tag)!.prototype);
  return el;
}

describe("the showcase's wrappers", () => {
  const c = { locale: 'en', theme: 'light' as const };

  it("give af-number-input the digits, the percent and the separators they are passed", async () => {
    const el = await drawn(
      <NumberInput {...c} label="Reading" value={98.5} step={0.5} precision={3} fractional format="percent" unscaled currency="USD" separators="none" onChange={() => {}} />,
      'af-number-input',
    );
    expect(el).toMatchObject({ step: 0.5, precision: 3, fractional: true, format: 'percent', unscaled: true, currency: 'USD', separators: 'none' });
  });

  it('give af-file-upload its replace and its label', async () => {
    const el = await drawn(<FileUpload {...c} items={[]} maxFiles={1} replace label="Photo report" onAdd={() => {}} onRemove={() => {}} />, 'af-file-upload');
    expect(el).toMatchObject({ maxFiles: 1, replace: true, label: 'Photo report' });
  });

  it('give af-date its mask', async () => {
    const el = await drawn(<DateInput {...c} label="Received" value={null} format="DD.MM.YYYY" onChange={() => {}} />, 'af-date');
    expect(el.format).toBe('DD.MM.YYYY');
  });

  it("give af-tile a list's rows, columns and pager, and drill only where a press is heard", async () => {
    const rows = [{ id: 'r1', entity_id: 'e1', body: { title: 'One' } }];
    const columns = [{ key: 'title', label: 'Title' }];
    const paging = { prev: false, next: true };
    const list = { ...NUMBER_GOAL.spec, kind: 'list' } as AfTileSpec;
    const el = await drawn(
      <Tile {...c} spec={list} result={null} fields={NUMBER_GOAL.fields} rows={rows} columns={columns} paging={paging} table={false} onOpenRecord={() => {}} onPage={() => {}} />,
      'af-tile',
    );
    expect(el).toMatchObject({ rows, columns, paging, table: false, drill: true });
    const figure = await drawn(<Tile {...c} spec={NUMBER_GOAL.spec} result={NUMBER_GOAL.result} fields={NUMBER_GOAL.fields} onOpenRecord={() => {}} />, 'af-tile');
    expect(figure.drill).toBe(false);
  });
});
