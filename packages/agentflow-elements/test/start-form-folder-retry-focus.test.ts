import { expect, it, vi } from 'vitest';
import { CALLER, json, mount, shadow, stubApi } from './support.js';

// A file of its own: the retry here succeeds, and a defined tag stays defined for every later test in a file.
const code = vi.hoisted(() => ({ refused: null as Error | null }));
vi.mock('../src/kit/FolderSource.svelte', async (original) => {
  if (code.refused) throw code.refused;
  return original();
});

const W1 = '0190c0de-0000-7000-8000-0000000000w1';
const V1 = '0190c0de-0000-7000-8000-0000000000v1';
const files = { type: 'array', title: 'Scans', items: { type: 'string', format: 'attachment' } };
const keys = ['scans', 'more'];
const api = () =>
  stubApi({
    'GET /caller': () => json(200, CALLER),
    'GET /workflows/startable': () =>
      json(200, { items: [{ id: W1, name: 'Open a claim', version_id: V1 }], next_cursor: null, prev_cursor: null }),
    [`GET /workflow-versions/${V1}/start-form`]: () =>
      json(200, { form_definition: { schema_json: { type: 'object', properties: Object.fromEntries(keys.map((k) => [k, files])) } }, version_updated_at: '2026-09-25T00:00:00Z' }),
    [`GET /workflows/${W1}/input-contract`]: () =>
      json(200, { published: true, version_id: V1, form_definition_id: null, subject: { kind: 'none' }, params_slots: keys.map((key) => ({ key, required: false, folder: { grain: 'folder', depth: 2 } })) }),
    'GET /watched-folders': () => json(200, { items: [] }),
  });
const root = (p: HTMLElement) => shadow(p.querySelector('agentflow-start-form'));
const retry = (p: HTMLElement, key: string) =>
  root(p).querySelector(`#l-${key}`)!.closest('[part="field"]')!.querySelector('button[part="field-retry"]') as HTMLButtonElement;

it('a retry that succeeds moves focus into the folder picker of the field it was pressed in', async () => {
  code.refused = new Error('Failed to fetch dynamically imported module');
  const quiet = (e: Event) => e.stopPropagation();
  document.body.addEventListener('request-failed', quiet);
  const p = await mount(`<agentflow-start-form workflow-id="${W1}"></agentflow-start-form>`, api());
  const button = retry(p, 'more');
  button.focus();
  code.refused = null;
  button.click();
  await vi.waitFor(() => expect(customElements.get('af-folder-source')).toBeDefined());
  const picker = root(p).querySelector('#f-more') as HTMLElement;
  // Focus goes to the picker's first control, not its host: a negative tabindex on a shadow host would take
  // every control inside it out of the Tab order.
  await vi.waitFor(() => expect(picker.shadowRoot?.activeElement).not.toBeNull());
  expect(root(p).activeElement).toBe(picker);
  expect(picker.shadowRoot!.activeElement!.matches('input, button')).toBe(true);
  expect(picker.hasAttribute('tabindex')).toBe(false);
  document.body.removeEventListener('request-failed', quiet);
});
