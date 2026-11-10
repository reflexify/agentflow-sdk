import { afterEach, expect, it, vi } from 'vitest';

// The page's kit registers its tags before this package loads, as a module that imports its own kit first does.
const PageSource = vi.hoisted(() => {
  // Its properties are accessors, as a compiled kit element's are.
  class Source extends HTMLElement {
    #held: Record<string, unknown> = {};
    static {
      for (const name of ['sources', 'workflow', 'version', 'field', 'folder', 'locale', 'disabled']) {
        Object.defineProperty(this.prototype, name, { get(this: Source) { return this.#held[name]; }, set(this: Source, value: unknown) { this.#held[name] = value; } });
      }
    }
  }
  const PageSource = Object.assign(Source, { kitVersion: '99.0.0' });
  customElements.define('af-folder-source', PageSource);
  return PageSource;
});

import { CALLER, json, mount, settle, shadow, stubApi } from './support.js';

const ours = vi.hoisted(() => ({ loads: 0 }));
vi.mock('../src/kit/FolderSource.svelte', () => {
  ours.loads++;
  return { default: { element: class extends HTMLElement {} } };
});

const W = '0190c0de-0000-7000-8000-0000000000w1';
const V = '0190c0de-0000-7000-8000-0000000000v1';
const I = '0190c0de-0000-7000-8000-0000000000i1';

afterEach(() => vi.restoreAllMocks());

it("uses the page's own af-folder-source and loads nothing", async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const stub = stubApi({
    'GET /caller': () => json(200, CALLER),
    'GET /workflows/startable': () => json(200, { items: [{ id: W, name: 'Open a claim', version_id: V }], next_cursor: null, prev_cursor: null }),
    [`GET /workflow-versions/${V}/start-form`]: () =>
      json(200, {
        form_definition: { schema_json: { type: 'object', properties: { scans: { type: 'array', items: { type: 'string', format: 'attachment' } } } } },
        version_updated_at: '2026-09-25T00:00:00Z',
      }),
    [`GET /workflows/${W}/input-contract`]: () =>
      json(200, { published: true, version_id: V, form_definition_id: null, subject: { kind: 'none' }, params_slots: [{ key: 'scans', required: false, folder: { grain: 'file' } }] }),
    [`POST /workflows/${W}/instances`]: () => json(201, { id: I, status: 'running' }),
  });
  const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, stub);
  expect(customElements.get('af-folder-source')).toBe(PageSource);
  expect(warn).not.toHaveBeenCalled();
  expect(ours.loads).toBe(0);
  const root = shadow(p.querySelector('agentflow-start-form'));
  const el = root.querySelector('af-folder-source') as HTMLElement & { sources?: { preview?: unknown }; folder?: unknown; workflow?: string; version?: string; field?: string };
  expect(el).toBeInstanceOf(PageSource);
  expect(typeof el.sources?.preview).toBe('function');
  // No version: the form starts the current one, and an app's request that names any is refused.
  expect([el.workflow, el.version, el.field, el.folder]).toEqual([W, undefined, 'scans', { grain: 'file' }]);
  el.dispatchEvent(new CustomEvent('af-folder-change', { detail: { value: { $fileSet: 'set-9' }, preview: null }, bubbles: true }));
  [...root.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Start')!.click();
  await settle();
  expect(stub.calls.at(-1)!.body).toEqual({ name: 'Open a claim', version_id: V, input_payload: { scans: { $fileSet: 'set-9' } } });
});
