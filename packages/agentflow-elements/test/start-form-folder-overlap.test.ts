import { expect, it, vi } from 'vitest';
import { CALLER, json, mount, settle, shadow, stubApi } from './support.js';

// A file of its own: the test defines the tag, as a page's own kit would, and it stays defined.
const code = vi.hoisted(() => ({ arrives: Promise.resolve(), refused: null as Error | null }));
vi.mock('../src/kit/FolderSource.svelte', async (original) => {
  await code.arrives;
  if (code.refused) throw code.refused;
  return original();
});

const W1 = '0190c0de-0000-7000-8000-0000000000w1';
const V1 = '0190c0de-0000-7000-8000-0000000000v1';
const W2 = '0190c0de-0000-7000-8000-0000000000w2';
const V2 = '0190c0de-0000-7000-8000-0000000000v2';
const files = { type: 'array', title: 'Scans', items: { type: 'string', format: 'attachment' } };
const text = { type: 'string', title: 'Note' };
const workflow = (id: string, version: string, folder: boolean) => ({
  [`GET /workflow-versions/${version}/start-form`]: () =>
    json(200, { form_definition: { schema_json: { type: 'object', properties: folder ? { scans: files } : { note: text } } }, version_updated_at: '2026-09-25T00:00:00Z' }),
  [`GET /workflows/${id}/input-contract`]: () =>
    json(200, { published: true, version_id: version, form_definition_id: null, subject: { kind: 'none' }, params_slots: folder ? [{ key: 'scans', required: false, folder: { grain: 'folder', depth: 2 } }] : [] }),
});
const api = () =>
  stubApi({
    'GET /caller': () => json(200, CALLER),
    'GET /workflows/startable': () =>
      json(200, { items: [{ id: W1, name: 'Open a claim', version_id: V1 }, { id: W2, name: 'Add a note', version_id: V2 }], next_cursor: null, prev_cursor: null }),
    ...workflow(W1, V1, true),
    ...workflow(W2, V2, false),
    'GET /watched-folders': () => json(200, { items: [] }),
  });
const root = (p: HTMLElement) => shadow(p.querySelector('agentflow-start-form'));

it('an older folder load that fails after a newer one loaded draws the picker', async () => {
  const quiet = (e: Event) => e.stopPropagation();
  document.body.addEventListener('request-failed', quiet);
  let arrive!: () => void;
  code.arrives = new Promise<void>((resolve) => (arrive = resolve));
  code.refused = new Error('Failed to fetch dynamically imported module');
  const p = await mount(`<agentflow-start-form workflow-id="${W1}"></agentflow-start-form>`, api());
  const form = p.querySelector('agentflow-start-form')!;
  expect(root(p).querySelector('#l-scans')).not.toBeNull();

  form.setAttribute('workflow-id', W2);
  await vi.waitFor(() => expect(root(p).querySelector('#l-scans')).toBeNull());
  customElements.define('af-folder-source', class extends HTMLElement {});
  form.setAttribute('workflow-id', W1);
  await vi.waitFor(() => expect(root(p).querySelector('af-folder-source')).not.toBeNull());

  arrive();
  await settle();
  await settle();
  expect(root(p).querySelector('af-folder-source')).not.toBeNull();
  expect(root(p).querySelector('[part="field-error"]')).toBeNull();
  document.body.removeEventListener('request-failed', quiet);
});
