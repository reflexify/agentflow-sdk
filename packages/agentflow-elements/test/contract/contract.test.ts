// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  CALLER, button, contextRequest, events, fill, hasBundle, input, json, loadBundle, mount, parts, problem, settle, stub,
  type ContextValue, type Entry,
} from './harness.js';

const CONTRACT: Record<string, { attributes: string[]; properties: string[]; parts: string[] }> = {
  'agentflow-provider': { attributes: ['base-path', 'locale'], properties: ['basePath', 'locale', 'strings', 'fetchImpl'], parts: [] },
  'agentflow-task-inbox': {
    attributes: ['view', 'page-size'],
    properties: ['view', 'pageSize'],
    parts: ['table', 'row', 'empty', 'error', 'load-more'],
  },
  'agentflow-task-detail': {
    attributes: ['entity-id', 'entity-key', 'record-id'],
    properties: ['entityId', 'entityKey', 'recordId'],
    parts: ['header', 'title', 'meta', 'notice', 'form', 'field', 'label', 'input', 'field-error', 'actions', 'button', 'error'],
  },
  'agentflow-record-table': {
    attributes: ['entity-id', 'entity-key', 'columns', 'page-size'],
    properties: ['entityId', 'entityKey', 'columns', 'pageSize', 'filter'],
    parts: [
      'toolbar', 'search', 'create-button', 'table', 'row', 'cell', 'empty', 'error', 'load-more',
      'form', 'field', 'label', 'input', 'field-error', 'notice', 'actions', 'button',
    ],
  },
  'agentflow-start-form': {
    attributes: ['workflow-id', 'workflow-key'],
    properties: ['workflowId', 'workflowKey'],
    parts: ['picker', 'form', 'field', 'label', 'input', 'field-error', 'notice', 'actions', 'button', 'error'],
  },
};
// Path parameters are UUIDs: the proxy forwards nothing else.
const T = '0190c0de-0000-7000-8000-00000000c0a1';
const E = '0190c0de-0000-7000-8000-00000000c0e1';
const R = '0190c0de-0000-7000-8000-00000000c0b1';
const W = '0190c0de-0000-7000-8000-00000000c0c1';
const V = '0190c0de-0000-7000-8000-00000000c0d1';
const I = '0190c0de-0000-7000-8000-00000000c0f1';
const UNKNOWN_W = '0190c0de-0000-7000-8000-00000000c0c2';
const NOTE_FORM = { schema_json: { type: 'object', properties: { note: { type: 'string', title: 'Note' } } } };
const REQUIRED_NOTE_FORM = { schema_json: { type: 'object', required: ['note'], properties: { note: { type: 'string', title: 'Note' } } } };
const TITLE_FORM = { schema_json: { type: 'object', required: ['title'], properties: { title: { type: 'string', title: 'Title' } } } };
// A required field no simple control can edit.
const BLOCKED_FORM = { schema_json: { type: 'object', required: ['files'], properties: { files: { type: 'array', title: 'Files' } } } };
const BROKEN = { type: 'INTERNAL', title: 'Internal', status: 500, detail: 'Try later.', request_id: 'req-contract' };
const ENTITY = { id: E, fields: [{ key: 'title', label: 'Title', system: false }], effective_capabilities: { write: true } };
const STARTABLE = [{ id: W, name: 'Open a case', version_id: V }];
const line = (id: string, extra = {}) => ({
  id, entity_id: E, title: null, status: 'active', priority: 'normal', live: true, claimed_by_user_id: null,
  assigned_user_ids: [], assigned_group_ids: [], assigned_unit_ids: [], due_at: null, started_at: '2026-10-06T08:00:00Z', clock: null,
  step: {
    workflow: { id: 'w1', name: 'Claims' }, step: { key: 'review', label: `Review ${id.slice(-1)}` },
    kind: 'human', signs: false, subject: null,
  },
  ...extra,
});
const step = (extra = {}) => ({
  record_id: T, entity_id: E, kind: 'human', signs: false, step_status: 'open', signed: false,
  run: { id: 'run-1', workflow_id: 'w1', workflow_name: 'Claims', step_key: 'review', step_label: 'Review' },
  instance_name: 'Case 7', subject: null,
  actions: [], actions_gated_out: false, signed_action_id: null, form_definition: NOTE_FORM, draft_payload: null, prefill: null,
  entity_view: null, ...extra,
});
const taskRecord = (claimedBy: string | null = null) => ({
  id: T, entity_id: E, version: 1, created_at: '2026-10-06T08:00:00Z', updated_at: '2026-10-06T08:00:00Z',
  body: { title: null, claimed_by: claimedBy }, ref_labels: claimedBy ? { claimed_by: 'Ann' } : {},
});
const work = (claimedBy: string | null) => ({
  record_id: T, active: true, claimed_by_user_id: claimedBy, claimed_at: claimedBy ? '2026-10-06T08:01:00Z' : null,
  assigned_user_ids: [], assigned_group_ids: [], assigned_unit_ids: [],
});
const page = (items: unknown[], next: string | null = null) => ({ items, next_cursor: next, prev_cursor: null });
const summary = (v: ContextValue) => [v.state, v.caller, typeof v.client.GET, v.locale, typeof v.t, typeof v.report];
const READY = ['ready', CALLER, 'function', 'en', 'function', 'function'];

// The parts each test has seen shown, checked against the contract table by the last test.
const shown = new Map<string, Set<string>>();
function expectParts(el: Element, ...names: string[]) {
  for (const name of names) {
    expect(parts(el, name).length, `${el.localName}::part(${name})`).toBeGreaterThan(0);
    shown.set(el.localName, (shown.get(el.localName) ?? new Set()).add(name));
  }
}

describe.skipIf(!hasBundle)('the public contract, against the built bundle', () => {
  let entry: Entry;
  beforeAll(async () => {
    entry = await loadBundle();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('exports its entry points and registers the five tags, idempotently', () => {
    expect([typeof entry.defineAgentFlowElements, typeof entry.signIn, typeof entry.signOut]).toEqual(['function', 'function', 'function']);
    expect(() => entry.defineAgentFlowElements()).not.toThrow();
    for (const tag of Object.keys(CONTRACT)) expect(customElements.get(tag), tag).toBeDefined();
  });

  it('observes every documented attribute and exposes every documented property', () => {
    for (const [tag, c] of Object.entries(CONTRACT)) {
      const observed = (customElements.get(tag) as unknown as { observedAttributes: string[] }).observedAttributes;
      for (const a of c.attributes) expect(observed, `${tag} [${a}]`).toContain(a);
      const el = document.createElement(tag);
      for (const p of c.properties) expect(p in el, `${tag}.${p}`).toBe(true);
    }
  });

  it('takes strings, filter and fetchImpl only from JavaScript, ignoring a string with one warning per name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const f = stub({
      'GET /caller': () => json(200, CALLER),
      'GET /work': () => json(200, page([])),
      [`GET /entities/${E}`]: () => json(200, { ...ENTITY, effective_capabilities: { write: false } }),
      [`GET /entities/${E}/records`]: () => json(200, page([])),
    });
    // Neither a string attribute nor a string property may replace the default fetch.
    vi.stubGlobal('fetch', f);
    const inner = `<agentflow-task-inbox></agentflow-task-inbox><agentflow-record-table entity-id="${E}"></agentflow-record-table>`;
    const lists = () => f.calls.filter((c) => c.path.startsWith(`/entities/${E}/records`)).map((c) => `${c.method} ${c.path}`);

    const byAttribute = await mount(inner.replace('<agentflow-record-table', `<agentflow-record-table filter='{"q":"x"}'`), undefined, {
      strings: '{"inbox.empty":"FROM ATTRIBUTE"}',
      fetchImpl: 'window.fetch',
    });
    expect(byAttribute.dataset.state).toBe('ready');
    expect(parts(byAttribute.querySelector('agentflow-task-inbox')!, 'empty')[0]?.textContent).not.toContain('FROM ATTRIBUTE');
    expect(lists()).toEqual([`GET /entities/${E}/records`]);

    f.calls.length = 0;
    const byStringProperty = await mount(inner, undefined, {}, { strings: '{"inbox.empty":"FROM STRING"}', fetchImpl: 'window.fetch' });
    const table = byStringProperty.querySelector('agentflow-record-table')! as HTMLElement & { filter?: unknown };
    table.filter = '{"q":"x"}';
    await settle();
    expect(byStringProperty.dataset.state).toBe('ready');
    expect(parts(byStringProperty.querySelector('agentflow-task-inbox')!, 'empty')[0]?.textContent).not.toContain('FROM STRING');
    expect(lists().every((l) => l === `GET /entities/${E}/records`)).toBe(true);

    const byProperty = await mount(inner, f, {}, { strings: { 'inbox.empty': 'FROM PROPERTY' } });
    expect(parts(byProperty.querySelector('agentflow-task-inbox')!, 'empty')[0]?.textContent).toContain('FROM PROPERTY');

    const messages = warn.mock.calls.map((c) => String(c[0]));
    for (const name of ['strings', 'filter', 'fetchImpl']) {
      expect(messages.filter((m) => new RegExp(`\\b${name}\\b`).test(m)), name).toHaveLength(1);
    }
    expect(messages).toHaveLength(3);
  });

  it('reports the session as events and data-state', async () => {
    const seen = events(document.body, 'session-ready', 'signed-out', 'access-lost', 'request-failed');
    const ready = await mount('', stub({ 'GET /caller': () => json(200, CALLER) }));
    expect(ready.dataset.state).toBe('ready');
    const out = await mount('', stub({ 'GET /caller': () => problem(401, 'NOT_SIGNED_IN') }));
    expect(out.dataset.state).toBe('signed-out');
    const lost = await mount('', stub({ 'GET /caller': () => problem(403, 'APP_NOT_INSTALLED') }));
    expect(lost.dataset.state).toBe('access-lost');
    const failed = await mount('', stub({ 'GET /caller': () => json(500, BROKEN) }));
    expect(failed.dataset.state).toBe('error');
    expect(seen).toEqual([
      { type: 'session-ready', detail: { caller: CALLER } },
      { type: 'signed-out', detail: {} },
      { type: 'access-lost', detail: { code: 'APP_NOT_INSTALLED' } },
      { type: 'request-failed', detail: { code: 'INTERNAL', status: 500, detail: 'Try later.', requestId: 'req-contract' } },
    ]);
  });

  it('renders its children through its default slot', async () => {
    const p = await mount('<p id="child">Hello</p>', stub({ 'GET /caller': () => json(200, CALLER) }));
    const slot = p.querySelector('#child')!.assignedSlot;
    expect(slot?.name).toBe('');
    expect(slot?.getRootNode()).toBe(p.shadowRoot);
  });

  it('calls AgentFlow under its base-path and speaks its locale', async () => {
    const f = stub({ 'GET /caller': () => json(200, CALLER), 'GET /work': () => json(200, page([])) });
    const p = await mount('<agentflow-task-inbox></agentflow-task-inbox>', f, { 'base-path': '/portal/af', locale: 'vi' });
    expect(p.dataset.state).toBe('ready');
    expect(f.calls.map((c) => c.path)).toEqual(expect.arrayContaining(['/caller', '/work']));
    for (const c of f.calls) expect(c.pathname).toMatch(/^\/portal\/af\/api\//);
    const inbox = p.querySelector('agentflow-task-inbox')!;
    expectParts(inbox, 'empty');
    expect(parts(inbox, 'empty')[0]!.textContent?.trim()).toBe('Không có công việc nào.');
  });

  it('task-select, task-claimed and task-submitted carry their details', async () => {
    let submits = 0;
    let held = false;
    const f = stub({
      'GET /caller': () => json(200, CALLER),
      'GET /work': () => json(200, page([line(T)])),
      [`GET /entities/${E}/records/${T}/step`]: () => json(200, step({ form_definition: REQUIRED_NOTE_FORM })),
      [`GET /entities/${E}/records/${T}`]: () => json(200, taskRecord(held ? CALLER.id : null)),
      [`POST /entities/${E}/records/${T}/work/claim`]: () => {
        held = true;
        return json(200, work(CALLER.id));
      },
      [`POST /entities/${E}/records/${T}/step/submit`]: () =>
        ++submits === 1
          ? problem(422, 'STEP_PAYLOAD_INVALID', { detail: '/note: Say more.' })
          : json(200, step({ step_status: 'submitted' })),
    });
    const seen = events(document.body, 'task-select', 'task-claimed', 'task-submitted');
    const p = await mount(`<agentflow-task-inbox></agentflow-task-inbox><agentflow-task-detail entity-id="${E}" record-id="${T}"></agentflow-task-detail>`, f);
    const query = f.calls.find((c) => c.path === '/work')!.query;
    expect([query.get('view'), query.get('live'), query.get('limit')]).toEqual(['all', 'true', '25']);

    const inbox = p.querySelector('agentflow-task-inbox')!;
    expectParts(inbox, 'table', 'row');
    parts(inbox, 'row')[0]!.click();
    const detail = p.querySelector('agentflow-task-detail')!;
    expectParts(detail, 'header', 'title', 'meta', 'actions', 'button');
    button(detail, 'Claim')!.click();
    await settle();
    expectParts(detail, 'form', 'field', 'label', 'input', 'actions');

    // The form's own required check answers before anything is sent.
    button(detail, 'Submit')!.click();
    await settle();
    expectParts(detail, 'field-error');
    expect(f.calls.some((c) => c.path === `/entities/${E}/records/${T}/step/submit`)).toBe(false);

    fill(input(detail, 'Note')!, 'fine');
    button(detail, 'Submit')!.click();
    await settle();
    expectParts(detail, 'error');
    expect(parts(detail, 'error')[0]!.textContent).toContain('/note: Say more.');
    expect(input(detail, 'Note')!.value).toBe('fine');

    button(detail, 'Submit')!.click();
    await settle();
    expectParts(detail, 'notice');
    expect(f.calls.filter((c) => c.path === `/entities/${E}/records/${T}/step/submit`).at(-1)!.body).toEqual({ payload: { note: 'fine' } });
    expect(seen).toEqual([
      { type: 'task-select', detail: { recordId: T, entityId: E } },
      { type: 'task-claimed', detail: { recordId: T, entityId: E } },
      { type: 'task-submitted', detail: { recordId: T, entityId: E, actionId: null } },
    ]);
  });

  it('the inbox asks for its view and page size, and loads more', async () => {
    const f = stub({
      'GET /caller': () => json(200, CALLER),
      'GET /work': (req) => (new URL(req.url).searchParams.has('cursor') ? json(500, BROKEN) : json(200, page([line(T)], 'next'))),
    });
    const p = await mount('<agentflow-task-inbox view="claimable" page-size="7"></agentflow-task-inbox>', f);
    const inbox = p.querySelector('agentflow-task-inbox')!;
    const first = f.calls.find((c) => c.path === '/work')!.query;
    expect([first.get('view'), first.get('live'), first.get('limit')]).toEqual(['claimable', 'true', '7']);
    expectParts(inbox, 'load-more');
    parts(inbox, 'load-more')[0]!.click();
    await settle();
    expect(f.calls.filter((c) => c.path === '/work').at(-1)!.query.get('cursor')).toBe('next');
    expectParts(inbox, 'error');
  });

  it('task-released carries its details', async () => {
    let released = false;
    const f = stub({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}/records/${T}/step`]: () => json(200, step()),
      [`GET /entities/${E}/records/${T}`]: () => json(200, taskRecord(released ? null : CALLER.id)),
      [`POST /entities/${E}/records/${T}/work/release`]: () => {
        released = true;
        return json(200, work(null));
      },
    });
    const seen = events(document.body, 'task-released');
    const p = await mount(`<agentflow-task-detail entity-id="${E}" record-id="${T}"></agentflow-task-detail>`, f);
    button(p.querySelector('agentflow-task-detail')!, 'Release')!.click();
    await settle();
    expect(seen).toEqual([{ type: 'task-released', detail: { recordId: T, entityId: E } }]);
  });

  it('record-select and record-created carry their details', async () => {
    const f = stub({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, ENTITY),
      [`GET /entities/${E}/create-form`]: () => json(200, TITLE_FORM),
      [`GET /entities/${E}/records`]: () => json(200, page([{ id: R, body: { title: 'Flood' } }])),
      // Validates like the server, so a build may check Required itself or leave it to the server.
      [`POST /entities/${E}/records`]: async (req) =>
        ((await req.json()) as { form_payload: { title?: string } }).form_payload.title
          ? json(201, { id: R, body: { title: 'Storm' } })
          : problem(422, 'SUBMISSION_VALIDATION', { field_errors: [{ path: '/title', message: 'Required', rule: 'required' }] }),
    });
    const seen = events(document.body, 'record-select', 'record-created');
    const p = await mount(`<agentflow-record-table entity-id="${E}"></agentflow-record-table>`, f);
    const table = p.querySelector('agentflow-record-table')!;
    expectParts(table, 'toolbar', 'search', 'create-button', 'table', 'row', 'cell');
    parts(table, 'row')[0]!.click();
    parts(table, 'create-button')[0]!.click();
    await settle();
    expectParts(table, 'form', 'field', 'label', 'input', 'actions', 'button');
    button(table, 'Create')!.click();
    await settle();
    expectParts(table, 'field-error');
    fill(input(table, 'Title')!, 'Storm');
    button(table, 'Create')!.click();
    await settle();
    expect(f.calls.filter((c) => c.method === 'POST' && c.path === `/entities/${E}/records`).at(-1)!.body).toEqual({ form_payload: { title: 'Storm' } });
    expect(seen).toEqual([
      { type: 'record-select', detail: { recordId: R } },
      { type: 'record-created', detail: { recordId: R } },
    ]);
  });

  it('the record table shows the columns it is given, in that order, and loads more', async () => {
    const fields = ['a', 'b', 'c'].map((key) => ({ key, label: key.toUpperCase(), system: false }));
    const f = stub({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, { id: E, fields, effective_capabilities: { write: false } }),
      [`GET /entities/${E}/records`]: (req) =>
        new URL(req.url).searchParams.has('cursor') ? json(500, BROKEN) : json(200, page([{ id: R, body: { a: 'A1', b: 'B1', c: 'C1' } }], 'next')),
    });
    const p = await mount(`<agentflow-record-table entity-id="${E}" columns="c,a" page-size="3"></agentflow-record-table>`, f);
    const table = p.querySelector('agentflow-record-table')!;
    expect(parts(table, 'cell').map((c) => c.textContent?.trim())).toEqual(['C1', 'A1']);
    expect(f.calls.find((c) => c.path === `/entities/${E}/records`)!.query.get('limit')).toBe('3');
    expectParts(table, 'load-more');
    parts(table, 'load-more')[0]!.click();
    await settle();
    expect(f.calls.filter((c) => c.path === `/entities/${E}/records`).at(-1)!.query.get('cursor')).toBe('next');
    expectParts(table, 'error');
  });

  it('a filter makes the record table list through the query endpoint', async () => {
    const filter = { field_filters: [{ field: 'title', op: 'eq', value: 'Flood' }] };
    const f = stub({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, { ...ENTITY, effective_capabilities: { write: false } }),
      [`GET /entities/${E}/records`]: () => json(200, page([{ id: R, body: { title: 'Flood' } }])),
      [`POST /entities/${E}/records/query`]: () => json(200, page([])),
    });
    const p = await mount(`<agentflow-record-table entity-id="${E}"></agentflow-record-table>`, f);
    const table = p.querySelector('agentflow-record-table')! as HTMLElement & { filter?: unknown };
    table.filter = filter;
    await settle();
    const query = f.calls.filter((c) => c.method === 'POST' && c.path === `/entities/${E}/records/query`);
    expect(query).toHaveLength(1);
    expect((query[0]!.body as { filter: unknown }).filter).toEqual(filter);
    expectParts(table, 'empty');
  });

  it('workflow-started carries its details', async () => {
    const f = stub({
      'GET /caller': () => json(200, CALLER),
      'GET /workflows/startable': () => json(200, page(STARTABLE)),
      [`GET /workflow-versions/${V}/start-form`]: () => json(200, { form_definition: null, version_updated_at: '2026-09-25T00:00:00Z' }),
      // Validates like the server, so a build may check the Case name itself or leave it to the server.
      [`POST /workflows/${W}/instances`]: async (req) =>
        ((await req.json()) as { name: string }).name.trim()
          ? json(201, { id: I })
          : problem(422, 'SUBMISSION_VALIDATION', { field_errors: [{ path: '/name', message: 'Required', rule: 'required' }] }),
    });
    const seen = events(document.body, 'workflow-started');
    const p = await mount(`<agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, f);
    const form = p.querySelector('agentflow-start-form')!;
    expectParts(form, 'form', 'field', 'label', 'input', 'actions', 'button');
    expect(input(form, 'Case name')!.value).toBe('Open a case');
    fill(input(form, 'Case name')!, '');
    button(form, 'Start')!.click();
    await settle();
    expectParts(form, 'field-error');
    expect(seen).toEqual([]);
    fill(input(form, 'Case name')!, 'Flood at dock 4');
    button(form, 'Start')!.click();
    await settle();
    expect(f.calls.filter((c) => c.method === 'POST').at(-1)!.body).toEqual({ name: 'Flood at dock 4', version_id: V, input_payload: {} });
    expect(seen).toEqual([{ type: 'workflow-started', detail: { instanceId: I, workflowId: W } }]);
    // A start confirms itself and resets the form, so a second click cannot silently repeat it.
    expectParts(form, 'notice');
    expect(input(form, 'Case name')!.value).toBe('Open a case');
  });

  it('the start form offers a picker without workflow-id, and says when a workflow cannot be started here', async () => {
    const f = stub({ 'GET /caller': () => json(200, CALLER), 'GET /workflows/startable': () => json(200, page(STARTABLE)) });
    const p = await mount(`<agentflow-start-form></agentflow-start-form><agentflow-start-form workflow-id="${UNKNOWN_W}"></agentflow-start-form>`, f);
    const [picking, refused] = p.querySelectorAll('agentflow-start-form');
    expectParts(picking!, 'picker');
    expect(refused!.shadowRoot!.textContent).toContain("This workflow can't be started here.");
    expect([parts(refused!, 'form'), parts(refused!, 'button')]).toEqual([[], []]);
  });

  it('task detail and the start form show a request that fails in their error part', async () => {
    const f = stub({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}/records/${T}/step`]: () => json(500, BROKEN),
      [`GET /entities/${E}/records/${T}`]: () => json(200, taskRecord()),
      'GET /workflows/startable': () => json(200, page(STARTABLE)),
      [`GET /workflow-versions/${V}/start-form`]: () => json(500, BROKEN),
    });
    const p = await mount(`<agentflow-task-detail entity-id="${E}" record-id="${T}"></agentflow-task-detail><agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, f);
    expectParts(p.querySelector('agentflow-task-detail')!, 'error');
    expectParts(p.querySelector('agentflow-start-form')!, 'error');
  });

  it('a required field that cannot be edited here blocks the form, with a notice', async () => {
    const f = stub({
      'GET /caller': () => json(200, CALLER),
      [`GET /entities/${E}`]: () => json(200, ENTITY),
      [`GET /entities/${E}/create-form`]: () => json(200, BLOCKED_FORM),
      [`GET /entities/${E}/records`]: () => json(200, page([])),
      'GET /workflows/startable': () => json(200, page(STARTABLE)),
      [`GET /workflow-versions/${V}/start-form`]: () => json(200, { form_definition: BLOCKED_FORM, version_updated_at: '2026-09-25T00:00:00Z' }),
    });
    const p = await mount(`<agentflow-record-table entity-id="${E}"></agentflow-record-table><agentflow-start-form workflow-id="${W}"></agentflow-start-form>`, f);
    const table = p.querySelector('agentflow-record-table')!;
    const start = p.querySelector('agentflow-start-form')!;
    expectParts(table, 'empty');
    parts(table, 'create-button')[0]!.click();
    await settle();
    expectParts(table, 'notice');
    expectParts(start, 'notice');
    button(table, 'Create')!.click();
    button(start, 'Start')!.click();
    await settle();
    expect(f.calls.filter((c) => c.method === 'POST')).toEqual([]);
  });

  it('answers the context protocol our other builds speak', async () => {
    const p = await mount('<div id="other-build"></div>', stub({ 'GET /caller': () => json(200, CALLER) }));
    const seen: unknown[] = [];
    p.querySelector('#other-build')!.dispatchEvent(contextRequest((v) => seen.push(summary(v))));
    expect(seen.at(-1)).toEqual(READY);
  });

  it('report reads an error by its shape, as another build would throw it', async () => {
    const p = await mount('<div id="other-build"></div>', stub({ 'GET /caller': () => json(200, CALLER) }));
    let report!: (error: unknown) => unknown;
    p.querySelector('#other-build')!.dispatchEvent(contextRequest((v) => (report = v.report as typeof report)));

    const fieldErrors = [{ path: '/x', message: 'm' }];
    expect(report({ status: 422, code: 'SUBMISSION_VALIDATION', fieldErrors })).toEqual({ code: 'SUBMISSION_VALIDATION', status: 422, fieldErrors });
    expect(p.dataset.state).toBe('ready');

    expect(report({ status: 401, code: 'NOT_SIGNED_IN' })).toBeNull();
    await settle();
    expect(p.dataset.state).toBe('signed-out');
  });

  it('keeps a subscribed request up to date until it unsubscribes', async () => {
    const f = stub({ 'GET /caller': () => json(200, CALLER), 'GET /work': () => problem(401, 'NOT_SIGNED_IN') });
    const p = await mount('<div id="kept"></div><div id="dropped"></div>', f);
    const kept: string[] = [];
    const dropped: string[] = [];
    let unsubscribe: unknown;
    p.querySelector('#kept')!.dispatchEvent(contextRequest((v) => kept.push(v.state)));
    p.querySelector('#dropped')!.dispatchEvent(
      contextRequest((v, unsub) => {
        dropped.push(v.state);
        unsubscribe = unsub;
      }),
    );
    expect(typeof unsubscribe).toBe('function');
    (unsubscribe as () => void)();
    const heard = dropped.length;

    // An element whose request answers 401 signs the page out, and the provider tells its subscribers.
    p.append(document.createElement('agentflow-task-inbox'));
    await settle();
    expect(p.dataset.state).toBe('signed-out');
    expect(kept.at(-1)).toBe('signed-out');
    expect(dropped).toHaveLength(heard);
    expect(dropped.every((s) => s === 'ready')).toBe(true);
  });

  it('announces a new provider on window, so a request made before it existed can be made again', async () => {
    document.body.innerHTML = '';
    const provider = document.createElement('agentflow-provider') as HTMLElement & Record<string, unknown>;
    provider.fetchImpl = stub({ 'GET /caller': () => json(200, CALLER) });
    const other = document.createElement('div');
    provider.append(other);
    const seen: unknown[] = [];
    const ask = () => other.dispatchEvent(contextRequest((v) => seen.push(summary(v))));
    ask();
    let announced = 0;
    window.addEventListener(
      'agentflow-provider-ready',
      () => {
        announced++;
        ask();
      },
      { once: true },
    );
    document.body.append(provider);
    await settle();
    expect(announced).toBe(1);
    expect(seen.at(-1)).toEqual(READY);
  });

  it('showed every part in the contract table', () => {
    for (const [tag, c] of Object.entries(CONTRACT)) expect([...(shown.get(tag) ?? [])].sort(), tag).toEqual([...c.parts].sort());
  });
});
