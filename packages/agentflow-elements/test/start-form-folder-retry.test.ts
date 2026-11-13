import { afterEach, expect, it, vi } from 'vitest';
import { CALLER, json, mount, settle, shadow, stubApi } from './support.js';

// A file of its own: a tag once defined stays defined for every later test in a file, and a retry that succeeds defines it.
const code = vi.hoisted(() => ({ loads: 0, refused: null as Error | null, arrives: Promise.resolve() }));
vi.mock('../src/kit/FolderSource.svelte', async (original) => {
  code.loads++;
  await code.arrives;
  if (code.refused) throw code.refused;
  return original();
});

const W1 = '0190c0de-0000-7000-8000-0000000000w1';
const V1 = '0190c0de-0000-7000-8000-0000000000v1';
const files = { type: 'array', title: 'Scans', items: { type: 'string', format: 'attachment' } };
type Slot = { key: string; required: boolean };
const SCANS: Slot[] = [{ key: 'scans', required: false }];
const workflow = (id: string, version: string, slots: Slot[]) => ({
  [`GET /workflow-versions/${version}/start-form`]: () =>
    json(200, { form_definition: { schema_json: { type: 'object', properties: Object.fromEntries(slots.map((s) => [s.key, files])), required: slots.filter((s) => s.required).map((s) => s.key) } }, version_updated_at: '2026-09-25T00:00:00Z' }),
  [`GET /workflows/${id}/input-contract`]: () =>
    json(200, { published: true, version_id: version, form_definition_id: null, subject: { kind: 'none' }, params_slots: slots.map((s) => ({ ...s, folder: { grain: 'folder', depth: 2 } })) }),
});
const api = (slots: Slot[] = SCANS) =>
  stubApi({
    'GET /caller': () => json(200, CALLER),
    'GET /workflows/startable': () =>
      json(200, { items: [{ id: W1, name: 'Open a claim', version_id: V1 }], next_cursor: null, prev_cursor: null }),
    ...workflow(W1, V1, slots),
    'GET /watched-folders': () => json(200, { items: [] }),
  });
const root = (p: HTMLElement) => shadow(p.querySelector('agentflow-start-form'));
const field = (p: HTMLElement, key = 'scans') => root(p).querySelector(`#l-${key}`)!.closest('[part="field"]')!;
const retry = (p: HTMLElement, key = 'scans') => field(p, key).querySelector('button[part="field-retry"]') as HTMLButtonElement | null;
const notice = (p: HTMLElement) => root(p).querySelector('[part="notice"].error')?.textContent ?? null;
const REQUIRED_NOTICE = "This form has a required field that can't be edited here.";
const quiet = (e: Event) => e.stopPropagation();

afterEach(() => {
  code.refused = null;
  code.arrives = Promise.resolve();
  document.body.removeEventListener('request-failed', quiet);
});

it('a retry that fails again keeps the sentence, the button and focus', async () => {
  code.refused = new Error('Failed to fetch dynamically imported module');
  document.body.addEventListener('request-failed', quiet);
  const p = await mount(`<agentflow-start-form workflow-id="${W1}"></agentflow-start-form>`, api());
  const button = retry(p)!;
  button.focus();
  let arrive!: () => void;
  code.arrives = new Promise<void>((resolve) => (arrive = resolve));
  button.click();
  await settle();
  // While the retry loads, the button stays where it was, focused. It is marked
  // aria-disabled, never disabled: a browser drops focus from a button that
  // becomes disabled (jsdom does not, so the attribute is what is pinned).
  expect(retry(p)).toBe(button);
  expect(button.disabled).toBe(false);
  expect(button.getAttribute('aria-disabled')).toBe('true');
  expect(root(p).activeElement).toBe(button);
  const loadsWhileRetrying = code.loads;
  button.click();
  await settle();
  expect(code.loads, 'a click while the retry loads starts nothing').toBe(loadsWhileRetrying);

  arrive();
  await vi.waitFor(() => expect(button.getAttribute('aria-disabled')).toBe('false'));
  expect(field(p).querySelector('[part="field-error"]')!.textContent).toContain("The folder picker couldn't be loaded.");
  expect(retry(p)).toBe(button);
  expect(root(p).activeElement).toBe(button);
});

it('a required folder field stays blocked while its retry loads', async () => {
  code.refused = new Error('Failed to fetch dynamically imported module');
  document.body.addEventListener('request-failed', quiet);
  const p = await mount(`<agentflow-start-form workflow-id="${W1}"></agentflow-start-form>`, api([{ key: 'scans', required: true }]));
  expect(notice(p)).toBe(REQUIRED_NOTICE);
  let arrive!: () => void;
  code.arrives = new Promise<void>((resolve) => (arrive = resolve));
  retry(p)!.click();
  await settle();
  expect(notice(p), 'the notice stays while the retry loads').toBe(REQUIRED_NOTICE);
  arrive();
  await vi.waitFor(() => expect(retry(p)!.getAttribute('aria-disabled')).toBe('false'));
  expect(notice(p)).toBe(REQUIRED_NOTICE);
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
  // Pressed without focus: a success does not pull focus into the picker.
  expect(root(p).activeElement).toBeNull();
});
