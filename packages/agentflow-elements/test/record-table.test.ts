import { describe, expect, it } from 'vitest';
import { CALLER, json, mount, problem, settle, shadow, stubApi } from './support.js';

const E = '0190c0de-0000-7000-8000-0000000000e1';
const E2 = '0190c0de-0000-7000-8000-0000000000e2';
const R1 = '0190c0de-0000-7000-8000-0000000000r1';
const R2 = '0190c0de-0000-7000-8000-0000000000r2';
const field = (key: string, extra = {}) => ({ key, label: key.toUpperCase(), type: 'text', system: false, ...extra });
const entity = (write = true) => ({
  id: E, key: 'case', name: 'Case',
  fields: [field('title'), field('urgent', { type: 'boolean' }), field('created', { system: true })],
  effective_capabilities: { list: true, read: true, write, delete: false, design: false },
});
const record = (id: string, body: object) => ({ id, entity_id: E, body, version: 1, updated_at: '2026-09-25T00:00:00Z' });
const page = (items: object[], next: string | null = null) => ({ items, next_cursor: next, prev_cursor: null });
const CREATE_FORM = { schema_json: { type: 'object', required: ['title'], properties: { title: { type: 'string', title: 'Title' } } } };
const root = (p: HTMLElement) => shadow(p.querySelector('agentflow-record-table'));
const tag = `<agentflow-record-table entity-id="${E}"></agentflow-record-table>`;

async function search(p: HTMLElement, text: string) {
  const input = root(p).querySelector('[part="search"] input') as HTMLInputElement;
  input.value = text;
  input.dispatchEvent(new Event('input'));
  (root(p).querySelector('[part="search"]') as HTMLFormElement).requestSubmit();
  await settle();
}

async function fillCreate(p: HTMLElement, title: string) {
  (root(p).querySelector('[part="create-button"]') as HTMLButtonElement).click();
  await settle();
  const input = root(p).querySelector('#f-title') as HTMLInputElement;
  input.value = title;
  input.dispatchEvent(new Event('input'));
}

const createButton = (p: HTMLElement) => [...root(p).querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Create')!;

describe('<agentflow-record-table>', () => {
  it('lists records in the non-system columns and fires record-select', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, entity()),
      [`GET /entities/${E}/create-form`]: () => json(200, CREATE_FORM),
      [`GET /entities/${E}/records`]: () => json(200, page([record(R1, { title: 'Flood', urgent: true }), record(R2, { title: 'Fire', urgent: false })])),
    });
    const p = await mount(tag, api);
    const headers = [...root(p).querySelectorAll('th')].map((th) => th.textContent?.trim());
    expect(headers).toEqual(['TITLE', 'URGENT']);
    const cells = [...root(p).querySelectorAll('[part="row"]')].map((r) => r.textContent);
    expect(cells[0]).toContain('Flood');
    expect(cells[0]).toContain('Yes');
    const seen: unknown[] = [];
    p.addEventListener('record-select', (e) => seen.push((e as CustomEvent).detail));
    (root(p).querySelector('[part="row"]') as HTMLElement).click();
    expect(seen).toEqual([{ recordId: R1 }]);
  });

  it('searches with q', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, entity()),
      [`GET /entities/${E}/create-form`]: () => json(200, CREATE_FORM),
      [`GET /entities/${E}/records`]: (_r, url) => json(200, page(url.searchParams.get('q') === 'fire' ? [record(R2, { title: 'Fire' })] : [])),
    });
    const p = await mount(tag, api);
    const search = root(p).querySelector('[part="search"] input') as HTMLInputElement;
    search.value = 'fire';
    search.dispatchEvent(new Event('input'));
    (root(p).querySelector('[part="search"]') as HTMLFormElement).requestSubmit();
    await settle();
    expect(root(p).querySelectorAll('[part="row"]')).toHaveLength(1);
  });

  it('queries with the filter property through POST …/records/query', async () => {
    const filter = { field_filters: [{ field: 'urgent', op: 'eq', value: true }] };
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, entity()),
      [`GET /entities/${E}/create-form`]: () => json(200, CREATE_FORM),
      [`POST /entities/${E}/records/query`]: () => json(200, page([record(R1, { title: 'Flood', urgent: true })])),
    });
    document.body.innerHTML = '';
    const provider = document.createElement('agentflow-provider') as HTMLElement & { fetchImpl?: typeof fetch };
    provider.fetchImpl = api.fetch;
    const table = document.createElement('agentflow-record-table') as HTMLElement & { filter?: unknown };
    table.setAttribute('entity-id', E);
    table.filter = filter;
    provider.append(table);
    document.body.append(provider);
    await settle();
    const call = api.calls.find((c) => c.path.endsWith('/records/query'))!;
    expect(call.body).toMatchObject({ filter, limit: 25 });
    expect(shadow(table).querySelectorAll('[part="row"]')).toHaveLength(1);
  });

  it('creates a record from the create form and fires record-created', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, entity()),
      [`GET /entities/${E}/create-form`]: () => json(200, CREATE_FORM),
      [`GET /entities/${E}/records`]: () => json(200, page([])),
      [`POST /entities/${E}/records`]: () => json(201, record(R1, { title: 'Storm' })),
    });
    const p = await mount(tag, api);
    const seen: unknown[] = [];
    p.addEventListener('record-created', (e) => seen.push((e as CustomEvent).detail));
    (root(p).querySelector('[part="create-button"]') as HTMLButtonElement).click();
    await settle();
    const input = root(p).querySelector('#f-title') as HTMLInputElement;
    input.value = 'Storm';
    input.dispatchEvent(new Event('input'));
    [...root(p).querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Create')!.click();
    await settle();
    expect(api.calls.find((c) => c.method === 'POST' && c.path === `/entities/${E}/records`)!.body).toEqual({ form_payload: { title: 'Storm' } });
    expect(seen).toEqual([{ recordId: R1 }]);
  });

  it('does nothing until it has an entity id', async () => {
    const api = stubApi({ 'GET /caller': () => json(200, CALLER) });
    const p = await mount('<agentflow-record-table></agentflow-record-table>', api);
    expect(api.calls.map((c) => c.path)).toEqual(['/caller']);
    expect(root(p).querySelector('[part="error"]')).toBeNull();
  });

  it('hides New record without write access or without a create form', async () => {
    const noWrite = await mount(tag, stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, entity(false)),
      [`GET /entities/${E}/records`]: () => json(200, page([])),
    }));
    expect(root(noWrite).querySelector('[part="create-button"]')).toBeNull();
    const noForm = await mount(tag, stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, entity()),
      [`GET /entities/${E}/create-form`]: () => problem(404, 'NOT_FOUND'),
      [`GET /entities/${E}/records`]: () => json(200, page([])),
    }));
    expect(root(noForm).querySelector('[part="create-button"]')).toBeNull();
    expect(root(noForm).querySelector('[part="error"]')).toBeNull();
  });

  describe('a create form that fails to load', () => {
    const withCreateForm = (answer: () => Response) =>
      mount(tag, stubApi({
        'GET /caller': () => json(200, CALLER),
        [`GET /entities/${E}`]: () => json(200, entity()),
        [`GET /entities/${E}/create-form`]: answer,
        [`GET /entities/${E}/records`]: () => json(200, page([record(R1, { title: 'Flood' })])),
      }));
    const failures = () => {
      const seen: unknown[] = [];
      document.body.addEventListener('request-failed', (e) => seen.push((e as CustomEvent).detail));
      return seen;
    };

    it('hides New record and says nothing when there is no form or no right to it', async () => {
      for (const [status, code] of [[403, 'FORBIDDEN'], [404, 'NOT_FOUND']] as const) {
        const seen = failures();
        const p = await withCreateForm(() => problem(status, code));
        expect(root(p).querySelector('[part="create-button"]'), code).toBeNull();
        expect(root(p).querySelector('[part="error"]'), code).toBeNull();
        expect(root(p).querySelectorAll('[part="row"]'), code).toHaveLength(1);
        expect(seen, code).toEqual([]);
      }
    });

    it('hands any other failure to the provider and shows it', async () => {
      const seen = failures();
      const p = await withCreateForm(() => problem(500, 'INTERNAL'));
      expect(seen).toEqual([expect.objectContaining({ code: 'INTERNAL', status: 500 })]);
      expect(root(p).querySelector('[part="error"]')?.textContent).toContain('INTERNAL');
      expect(root(p).querySelector('[part="create-button"]')).toBeNull();
    });

    it('signs the page out on a 401', async () => {
      const p = await withCreateForm(() => problem(401, 'NOT_SIGNED_IN'));
      expect(p.dataset.state).toBe('signed-out');
    });

    it('reports a failure that lands after the host switched entity, but does not show it', async () => {
      let failLate!: () => void;
      const seen = failures();
      const p = await mount(tag, stubApi({
        'GET /caller': () => json(200, CALLER),
        [`GET /entities/${E}`]: () => json(200, entity()),
        [`GET /entities/${E}/create-form`]: () => new Promise<Response>((resolve) => (failLate = () => resolve(problem(500, 'INTERNAL')))),
        [`GET /entities/${E}/records`]: () => json(200, page([])),
        [`GET /entities/${E2}`]: () => json(200, { ...entity(false), id: E2 }),
        [`GET /entities/${E2}/records`]: () => json(200, page([record(R2, { title: 'Ann' })])),
      }));
      p.querySelector('agentflow-record-table')!.setAttribute('entity-id', E2);
      await settle();
      failLate();
      await settle();
      expect(seen).toEqual([expect.objectContaining({ code: 'INTERNAL' })]);
      expect(root(p).querySelector('[part="error"]')).toBeNull();
      expect(root(p).querySelectorAll('[part="row"]')).toHaveLength(1);
    });
  });

  it('shows the columns the host names, in that order, and skips keys the entity lacks', async () => {
    const p = await mount(`<agentflow-record-table entity-id="${E}" columns="urgent, nope ,title"></agentflow-record-table>`, stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, entity()),
      [`GET /entities/${E}/records`]: () => json(200, page([record(R1, { title: 'Flood', urgent: true })])),
    }));
    expect([...root(p).querySelectorAll('th')].map((th) => th.textContent?.trim())).toEqual(['URGENT', 'TITLE']);
    expect([...root(p).querySelectorAll('[part="cell"]')].map((td) => td.textContent)).toEqual(['Yes', 'Flood']);
  });

  it('asks for at most 200 records a page, and 25 once the host removes page-size', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, entity(false)),
      [`GET /entities/${E}/records`]: () => json(200, page([])),
    });
    const p = await mount(`<agentflow-record-table entity-id="${E}" page-size="500"></agentflow-record-table>`, api);
    const limits = () => api.calls.filter((c) => c.path === `/entities/${E}/records`).map((c) => new URLSearchParams(c.search).get('limit'));
    expect(limits()).toEqual(['200']);
    p.querySelector('agentflow-record-table')!.removeAttribute('page-size');
    await settle();
    expect(limits()).toEqual(['200', '25']);
  });

  it('shows the server’s field errors beside the fields and keeps the typed values', async () => {
    const p = await mount(tag, stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, entity()),
      [`GET /entities/${E}/create-form`]: () => json(200, CREATE_FORM),
      [`GET /entities/${E}/records`]: () => json(200, page([])),
      [`POST /entities/${E}/records`]: () => problem(400, 'SUBMISSION_VALIDATION', { field_errors: [{ path: '/title', message: 'Too short' }] }),
    }));
    (root(p).querySelector('[part="create-button"]') as HTMLButtonElement).click();
    await settle();
    const input = root(p).querySelector('#f-title') as HTMLInputElement;
    input.value = 'S';
    input.dispatchEvent(new Event('input'));
    [...root(p).querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Create')!.click();
    await settle();
    expect(root(p).querySelector('[part="field-error"]')?.textContent).toBe('Too short');
    expect((root(p).querySelector('#f-title') as HTMLInputElement).value).toBe('S');
  });

  it('sends one create for a double click', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, entity()),
      [`GET /entities/${E}/create-form`]: () => json(200, CREATE_FORM),
      [`GET /entities/${E}/records`]: () => json(200, page([])),
      [`POST /entities/${E}/records`]: () => json(201, record(R1, { title: 'Storm' })),
    });
    const p = await mount(tag, api);
    (root(p).querySelector('[part="create-button"]') as HTMLButtonElement).click();
    await settle();
    const input = root(p).querySelector('#f-title') as HTMLInputElement;
    input.value = 'Storm';
    input.dispatchEvent(new Event('input'));
    const create = [...root(p).querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Create')!;
    create.click();
    create.click();
    await settle();
    expect(api.calls.filter((c) => c.method === 'POST' && c.path === `/entities/${E}/records`)).toHaveLength(1);
  });

  it('blocks Create while the form has a required field it cannot edit', async () => {
    const form = { schema_json: { type: 'object', required: ['photo'], properties: { title: { type: 'string' }, photo: { type: 'object' } } } };
    const p = await mount(tag, stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, entity()),
      [`GET /entities/${E}/create-form`]: () => json(200, form),
      [`GET /entities/${E}/records`]: () => json(200, page([])),
    }));
    (root(p).querySelector('[part="create-button"]') as HTMLButtonElement).click();
    await settle();
    const create = [...root(p).querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Create')!;
    expect(create.disabled).toBe(true);
    expect(root(p).textContent).toContain("This form has a required field that can't be edited here.");
  });

  it('creates nothing while blocked, even when Create is enabled behind its back', async () => {
    const form = { schema_json: { type: 'object', required: ['photo'], properties: { title: { type: 'string' }, photo: { type: 'object' } } } };
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, entity()),
      [`GET /entities/${E}/create-form`]: () => json(200, form),
      [`GET /entities/${E}/records`]: () => json(200, page([])),
      [`POST /entities/${E}/records`]: () => json(201, record(R1, {})),
    });
    const p = await mount(tag, api);
    (root(p).querySelector('[part="create-button"]') as HTMLButtonElement).click();
    await settle();
    const create = createButton(p);
    create.removeAttribute('disabled');
    create.click();
    await settle();
    expect(api.calls.filter((c) => c.method === 'POST')).toEqual([]);
  });

  it('shows no toolbar without an entity, while it loads, or after it fails to', async () => {
    const none = await mount('<agentflow-record-table></agentflow-record-table>', stubApi({ 'GET /caller': () => json(200, CALLER) }));
    expect(root(none).querySelector('[part="toolbar"]')).toBeNull();

    const waiting = await mount(tag, stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => new Promise<Response>(() => {}),
    }));
    expect(root(waiting).querySelector('[part="toolbar"]')).toBeNull();

    const failed = await mount(tag, stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => problem(500, 'INTERNAL'),
    }));
    expect(root(failed).querySelector('[part="error"]')).not.toBeNull();
    expect(root(failed).querySelector('[part="toolbar"]')).toBeNull();
  });

  it('claims no emptiness for records it has not loaded', async () => {
    const waiting = await mount(tag, stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, entity(false)),
      [`GET /entities/${E}/records`]: () => new Promise<Response>(() => {}),
    }));
    expect(root(waiting).querySelector('[part="empty"]')).toBeNull();

    const out = await mount(tag, stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, entity(false)),
      [`GET /entities/${E}/records`]: () => problem(401, 'NOT_SIGNED_IN'),
    }));
    expect(out.dataset.state).toBe('signed-out');
    expect(root(out).querySelector('[part="empty"]')).toBeNull();
  });

  it('hides its rows and Load more once the app loses access', async () => {
    const p = await mount(tag, stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, entity(false)),
      [`GET /entities/${E}/records`]: (_r, url) =>
        url.searchParams.get('cursor') === 'c2' ? problem(403, 'APP_NOT_ASSIGNED') : json(200, page([record(R1, { title: 'Flood' })], 'c2')),
    }));
    expect(root(p).querySelectorAll('[part="row"]')).toHaveLength(1);
    (root(p).querySelector('[part="load-more"]') as HTMLButtonElement).click();
    await settle();

    expect(p.dataset.state).toBe('access-lost');
    expect(root(p).querySelector('[part="row"]')).toBeNull();
    expect(root(p).querySelector('[part="load-more"]')).toBeNull();
  });

  it('keeps neither the old rows nor their cursor when a reload for a new search fails', async () => {
    const p = await mount(tag, stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, entity(false)),
      [`GET /entities/${E}/records`]: (_r, url) =>
        url.searchParams.get('q') === 'fire' ? problem(500, 'INTERNAL') : json(200, page([record(R1, { title: 'Flood' })], 'c2')),
    }));
    expect(root(p).querySelector('[part="load-more"]')).not.toBeNull();
    await search(p, 'fire');

    expect(root(p).querySelector('[part="error"]')).not.toBeNull();
    expect(root(p).querySelectorAll('[part="row"]')).toHaveLength(0);
    expect(root(p).querySelector('[part="load-more"]')).toBeNull();
  });

  it('drops a page that answers a search since replaced', async () => {
    let answerFlood!: () => void;
    const p = await mount(tag, stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, entity(false)),
      [`GET /entities/${E}/records`]: (_r, url) => {
        const q = url.searchParams.get('q');
        if (q === 'flood') return new Promise<Response>((resolve) => (answerFlood = () => resolve(json(200, page([record(R1, { title: 'Flood' })])))));
        return json(200, page(q === 'fire' ? [record(R2, { title: 'Fire' })] : []));
      },
    }));
    await search(p, 'flood');
    await search(p, 'fire');
    answerFlood();
    await settle();
    const rows = root(p).querySelectorAll('[part="row"]');
    expect(rows).toHaveLength(1);
    expect(rows[0]!.textContent).toContain('Fire');
    expect(root(p).textContent).not.toContain('Loading');
  });

  it('forgets the search when the host switches entity', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, entity(false)),
      [`GET /entities/${E}/records`]: () => json(200, page([])),
      [`GET /entities/${E2}`]: () => json(200, { ...entity(false), id: E2, fields: [field('name')] }),
      [`GET /entities/${E2}/records`]: () => json(200, page([record(R2, { name: 'Ann' })])),
    });
    const p = await mount(tag, api);
    await search(p, 'fire');
    p.querySelector('agentflow-record-table')!.setAttribute('entity-id', E2);
    await settle();

    const firstPage = api.calls.filter((c) => c.path === `/entities/${E2}/records`);
    expect(firstPage).toHaveLength(1);
    expect(new URLSearchParams(firstPage[0]!.search).has('q')).toBe(false);
    expect((root(p).querySelector('[part="search"] input') as HTMLInputElement).value).toBe('');
  });

  it('drops a late answer for an entity the host has switched away from', async () => {
    let answerFirst!: () => void;
    const p = await mount(tag, stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => new Promise<Response>((resolve) => (answerFirst = () => resolve(json(200, entity())))),
      [`GET /entities/${E}/create-form`]: () => json(200, CREATE_FORM),
      [`GET /entities/${E}/records`]: () => json(200, page([record(R1, { title: 'Flood' })])),
      [`GET /entities/${E2}`]: () => json(200, { ...entity(false), id: E2, fields: [field('name')] }),
      [`GET /entities/${E2}/records`]: () => json(200, page([record(R2, { name: 'Ann' })])),
    }));
    p.querySelector('agentflow-record-table')!.setAttribute('entity-id', E2);
    await settle();
    answerFirst();
    await settle();
    expect([...root(p).querySelectorAll('th')].map((th) => th.textContent?.trim())).toEqual(['NAME']);
    const rows = root(p).querySelectorAll('[part="row"]');
    expect(rows).toHaveLength(1);
    expect(rows[0]!.textContent).toContain('Ann');
    expect(root(p).querySelector('[part="create-button"]')).toBeNull();
  });

  it('clears a fully loaded entity when the host switches to another', async () => {
    let answerE2!: () => void;
    const p = await mount(tag, stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, entity()),
      [`GET /entities/${E}/create-form`]: () => json(200, CREATE_FORM),
      [`GET /entities/${E}/records`]: () => json(200, page([record(R1, { title: 'Flood' })])),
      [`GET /entities/${E2}`]: () => new Promise<Response>((resolve) => (answerE2 = () => resolve(json(200, { ...entity(false), id: E2 })))),
      [`GET /entities/${E2}/records`]: () => new Promise<Response>(() => {}),
    }));
    expect(root(p).querySelector('[part="create-button"]')).not.toBeNull();
    expect(root(p).querySelectorAll('[part="row"]')).toHaveLength(1);

    p.querySelector('agentflow-record-table')!.setAttribute('entity-id', E2);
    await settle();
    expect(root(p).querySelector('[part="toolbar"]')).toBeNull();
    expect(root(p).querySelector('[part="row"]')).toBeNull();

    answerE2();
    await settle();
    expect(root(p).querySelector('[part="toolbar"]')).not.toBeNull();
    expect(root(p).querySelector('[part="create-button"]')).toBeNull();
    expect(root(p).querySelector('[part="row"]')).toBeNull();
  });

  describe('a create still in flight when the host switches entity', () => {
    const R3 = '0190c0de-0000-7000-8000-0000000000r3';

    async function createThenSwitch(answer: () => Response) {
      let answerCreate!: () => void;
      const api = stubApi({
        'GET /caller': () => json(200, CALLER),
        [`GET /entities/${E}`]: () => json(200, entity()),
        [`GET /entities/${E}/create-form`]: () => json(200, CREATE_FORM),
        [`GET /entities/${E}/records`]: () => json(200, page([])),
        [`POST /entities/${E}/records`]: () => new Promise<Response>((resolve) => (answerCreate = () => resolve(answer()))),
        [`GET /entities/${E2}`]: () => json(200, { ...entity(), id: E2 }),
        [`GET /entities/${E2}/create-form`]: () => json(200, CREATE_FORM),
        [`GET /entities/${E2}/records`]: () => json(200, page([record(R2, { title: 'Ann' })])),
      });
      const p = await mount(tag, api);
      const created: unknown[] = [];
      p.addEventListener('record-created', (e) => created.push((e as CustomEvent).detail));
      await fillCreate(p, 'Storm');
      createButton(p).click();
      p.querySelector('agentflow-record-table')!.setAttribute('entity-id', E2);
      await settle();
      await fillCreate(p, 'Other');
      answerCreate();
      await settle();
      return { api, p, created };
    }

    it('is still reported, and leaves the new entity’s form and rows alone', async () => {
      const { api, p, created } = await createThenSwitch(() => json(201, record(R3, { title: 'Storm' })));
      expect(created).toEqual([{ recordId: R3 }]);
      expect((root(p).querySelector('#f-title') as HTMLInputElement | null)?.value).toBe('Other');
      expect(root(p).querySelectorAll('[part="row"]')).toHaveLength(1);
      expect(api.calls.filter((c) => c.path === `/entities/${E2}/records`)).toHaveLength(1);
    });

    it('puts none of its errors on the new entity’s form', async () => {
      const { p, created } = await createThenSwitch(() =>
        problem(400, 'SUBMISSION_VALIDATION', { field_errors: [{ path: '/title', message: 'Too short' }] }),
      );
      expect(created).toEqual([]);
      expect(root(p).querySelector('[part="field-error"]')).toBeNull();
      expect(root(p).querySelector('[part="error"]')).toBeNull();
      expect((root(p).querySelector('#f-title') as HTMLInputElement | null)?.value).toBe('Other');
    });
  });

  it('reads the filter by value: a new but equal object reloads nothing', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, entity(false)),
      [`POST /entities/${E}/records/query`]: () => json(200, page([record(R1, { title: 'Flood', urgent: true })])),
    });
    const p = await mount(tag, api);
    const table = p.querySelector('agentflow-record-table') as HTMLElement & { filter?: unknown };
    const queries = () => api.calls.filter((c) => c.path === `/entities/${E}/records/query`).map((c) => (c.body as { filter: unknown }).filter);
    const urgent = () => ({ field_filters: [{ field: 'urgent', op: 'eq', value: true }] });

    table.filter = urgent();
    await settle();
    expect(queries()).toHaveLength(1);

    // What a React parent does on every render with an inline `filter={{…}}`.
    table.filter = urgent();
    await settle();
    table.filter = urgent();
    await settle();
    expect(queries()).toHaveLength(1);
    expect(root(p).querySelectorAll('[part="row"]')).toHaveLength(1);

    table.filter = { field_filters: [{ field: 'urgent', op: 'eq', value: false }] };
    await settle();
    expect(queries()).toEqual([urgent(), { field_filters: [{ field: 'urgent', op: 'eq', value: false }] }]);
  });

  it('reloads only the rows when the filter or page-size changes', async () => {
    const api = stubApi({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, entity()),
      [`GET /entities/${E}/create-form`]: () => json(200, CREATE_FORM),
      [`GET /entities/${E}/records`]: () => json(200, page([])),
      [`POST /entities/${E}/records/query`]: () => json(200, page([record(R1, { title: 'Flood', urgent: true })])),
    });
    const p = await mount(tag, api);
    const table = p.querySelector('agentflow-record-table') as HTMLElement & { filter?: unknown };
    table.filter = { field_filters: [{ field: 'urgent', op: 'eq', value: true }] };
    await settle();
    table.setAttribute('page-size', '10');
    await settle();

    const count = (method: string, path: string) => api.calls.filter((c) => c.method === method && c.path === path).length;
    expect(count('GET', `/entities/${E}`)).toBe(1);
    expect(count('GET', `/entities/${E}/create-form`)).toBe(1);
    expect(count('GET', `/entities/${E}/records`)).toBe(1);
    const queried = api.calls.filter((c) => c.path === `/entities/${E}/records/query`).map((c) => (c.body as { limit: number }).limit);
    expect(queried).toEqual([25, 10]);
  });
});
