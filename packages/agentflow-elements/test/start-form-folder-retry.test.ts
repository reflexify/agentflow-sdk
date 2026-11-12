import { afterEach, expect, it, vi } from 'vitest';
import { CALLER, json, mount, settle, shadow, stubApi } from './support.js';

// A file of its own: a tag once defined stays defined for every later test in a file, and a retry that succeeds defines it.
const code = vi.hoisted(() => ({ loads: 0, refused: null as Error | null }));
vi.mock('../src/kit/FolderSource.svelte', async (original) => {
  code.loads++;
  if (code.refused) throw code.refused;
  return original();
});

const W1 = '0190c0de-0000-7000-8000-0000000000w1';
const V1 = '0190c0de-0000-7000-8000-0000000000v1';
const files = { type: 'array', title: 'Scans', items: { type: 'string', format: 'attachment' } };
const workflow = (id: string, version: string) => ({
  [`GET /workflow-versions/${version}/start-form`]: () =>
    json(200, { form_definition: { schema_json: { type: 'object', properties: { scans: files } } }, version_updated_at: '2026-09-25T00:00:00Z' }),
  [`GET /workflows/${id}/input-contract`]: () =>
    json(200, { published: true, version_id: version, form_definition_id: null, subject: { kind: 'none' }, params_slots: [{ key: 'scans', required: false, folder: { grain: 'folder', depth: 2 } }] }),
});
const api = () =>
  stubApi({
    'GET /caller': () => json(200, CALLER),
    'GET /workflows/startable': () =>
      json(200, { items: [{ id: W1, name: 'Open a claim', version_id: V1 }], next_cursor: null, prev_cursor: null }),
    ...workflow(W1, V1),
    'GET /watched-folders': () => json(200, { items: [] }),
  });
const root = (p: HTMLElement) => shadow(p.querySelector('agentflow-start-form'));
const field = (p: HTMLElement) => root(p).querySelector('#l-scans')!.closest('[part="field"]')!;
const retry = (p: HTMLElement) => field(p).querySelector('button[part="field-retry"]') as HTMLButtonElement | null;
const quiet = (e: Event) => e.stopPropagation();

afterEach(() => {
  code.refused = null;
  document.body.removeEventListener('request-failed', quiet);
});

it('a failed folder picker offers Try again, and Try again loads it', async () => {
  code.refused = new Error('Failed to fetch dynamically imported module');
  document.body.addEventListener('request-failed', quiet);
  const p = await mount(`<agentflow-start-form workflow-id="${W1}"></agentflow-start-form>`, api());
  const loadsBefore = code.loads;
  expect(field(p).querySelector('[part="field-error"]')!.textContent).toContain("The folder picker couldn't be loaded.");
  expect(retry(p)?.textContent?.trim()).toBe('Try again');

  code.refused = null;
  retry(p)!.click();
  await vi.waitFor(() => expect(customElements.get('af-folder-source')).toBeDefined());
  await settle();
  expect(code.loads).toBe(loadsBefore + 1);
  expect(root(p).querySelector('af-folder-source')).not.toBeNull();
  expect(field(p).querySelector('[part="field-error"]')).toBeNull();
});
