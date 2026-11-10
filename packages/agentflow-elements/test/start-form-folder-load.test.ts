import { afterEach, expect, it, vi } from 'vitest';
import { CALLER, json, mount, settle, shadow, stubApi } from './support.js';

// The folder source's code as this file's tests decide it arrives: counted, refused, or held back. A file of its own, because
// a tag once defined stays defined for every test after it, and these read the page before that. They run in the order written.
const code = vi.hoisted(() => ({ loads: 0, refused: null as Error | null, arrives: Promise.resolve() }));
vi.mock('../src/kit/FolderSource.svelte', async (original) => {
  code.loads++;
  if (code.refused) throw code.refused;
  await code.arrives;
  return original();
});

const W = '0190c0de-0000-7000-8000-0000000000w1';
const V = '0190c0de-0000-7000-8000-0000000000v1';
const files = { type: 'array', title: 'Scans', items: { type: 'string', format: 'attachment' } };
const api = (required: string[], properties: Record<string, unknown> = { scans: files }) =>
  stubApi({
    'GET /caller': () => json(200, CALLER),
    'GET /workflows/startable': () => json(200, { items: [{ id: W, name: 'Open a claim', version_id: V }], next_cursor: null, prev_cursor: null }),
    [`GET /workflow-versions/${V}/start-form`]: () => json(200, { form_definition: { schema_json: { type: 'object', required, properties } }, version_updated_at: '2026-09-25T00:00:00Z' }),
    [`GET /workflows/${W}/input-contract`]: () =>
      json(200, { published: true, version_id: V, form_definition_id: null, subject: { kind: 'none' }, params_slots: [{ key: 'scans', required: false, folder: { grain: 'folder', depth: 2 } }] }),
    'GET /watched-folders': () => json(200, { items: [] }),
  });
const form = (stub: ReturnType<typeof stubApi>) => mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, stub);
const root = (p: HTMLElement) => shadow(p.querySelector('agentflow-start-form'));
const start = (p: HTMLElement) => [...root(p).querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Start') as HTMLButtonElement;
const field = (p: HTMLElement) => root(p).querySelector('#l-scans')!.closest('[part="field"]')!;

afterEach(() => {
  code.refused = null;
  code.arrives = Promise.resolve();
});

it('loads the folder source only when a folder field appears', async () => {
  await form(api([], { amount: { type: 'number', title: 'Amount' } }));
  expect(code.loads).toBe(0);
  expect(customElements.get('af-folder-source')).toBeUndefined();
});

it('says that the folder source could not be loaded, tells the page, and starts without an optional field only', async () => {
  code.refused = new Error('Failed to fetch dynamically imported module');
  const failures: unknown[] = [];
  const hear = (e: Event) => failures.push((e as CustomEvent).detail);
  document.body.addEventListener('request-failed', hear);
  try {
    const optional = await form(api([]));
    expect(code.loads).toBe(1);
    expect(root(optional).querySelector('af-folder-source')).toBeNull();
    expect(field(optional).querySelector('[part="field-error"]')!.textContent).toBe("The folder picker couldn't be loaded. Reload the page to try again.");
    expect(failures).toHaveLength(1);
    expect(start(optional).disabled).toBe(false);

    const required = await form(api(['scans']));
    expect(start(required).disabled).toBe(true);
    expect(root(required).textContent).toContain("This form has a required field that can't be edited here.");
  } finally {
    document.body.removeEventListener('request-failed', hear);
  }
});

it('never draws the source disabled before it is defined, and holds the start until it is', async () => {
  let arrive!: () => void;
  code.arrives = new Promise<void>((resolve) => (arrive = resolve));
  try {
    const loadsBefore = code.loads;
    // A form drawn after a failed load asks again.
    const p = await form(api([]));
    expect(code.loads).toBe(loadsBefore + 1);
    // A tag drawn now would get `disabled="false"` as an attribute, which the element would read as disabled once defined.
    expect(root(p).querySelector('af-folder-source')).toBeNull();
    expect(field(p).querySelector('[part="notice"]')!.textContent).toBe('Loading…');
    // A start now would leave the field empty for good.
    expect(start(p).disabled).toBe(true);

    arrive();
    await vi.waitFor(() => expect(customElements.get('af-folder-source')).toBeDefined());
    await settle();
    const el = root(p).querySelector('af-folder-source') as HTMLElement & { disabled: boolean };
    expect(field(p).textContent).not.toContain('Loading…');
    expect([el.hasAttribute('disabled'), el.disabled]).toEqual([false, false]);
    expect(start(p).disabled).toBe(false);
  } finally {
    arrive();
  }
});
