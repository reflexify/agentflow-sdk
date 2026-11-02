import '@reflexify/agentflow-elements';
import type { AppHost, SignOutcome } from '@reflexify/agentflow-sdk';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '../src/module.js';

const PERSON = '0190c0de-0000-7000-8000-000000000001';
const TASK_ENTITY = '0190c0de-0000-7000-8000-0000000000e1';
const TASK = '0190c0de-0000-7000-8000-00000000a001';
const DECISION_ENTITY = '0190c0de-0000-7000-8000-0000000000e2';

const problem = (status: number) => ({ error: { type: 'NOT_PUBLISHED', status }, response: new Response(null, { status }) });

interface Call {
  method: string;
  path: string;
  query?: Record<string, unknown>;
}

const step = (signed: boolean, finished = false) => ({
  record_id: TASK, entity_id: TASK_ENTITY, kind: 'signature', signs: true, step_status: finished ? 'submitted' : 'open', signed,
  run: { id: 'run-1', workflow_id: 'w1', workflow_name: 'Sign a decision', step_key: 'sign', step_label: 'Sign the letter' },
  instance_name: 'Budget', subject: null, actions: [], actions_gated_out: false, signed_action_id: null,
  form_definition: { schema_json: { type: 'object', properties: {} } }, draft_payload: null, prefill: null, entity_view: null,
});

const workLine = {
  id: TASK, entity_id: TASK_ENTITY, title: null, status: 'active', priority: 'normal', live: true, claimed_by_user_id: PERSON,
  assigned_user_ids: [], assigned_group_ids: [], assigned_unit_ids: [], due_at: null, started_at: '2026-10-06T08:00:00Z', clock: null,
  step: { workflow: { id: 'w1', name: 'Sign a decision' }, step: { key: 'sign', label: 'Sign the letter' }, kind: 'signature', signs: true, subject: null },
};

/** `finishedInDialog`: the person finishes the task in AgentFlow's dialog by another decision, which resolves `closed`. */
function makeHost(outcome: SignOutcome = 'signed', withSigning = true, finishedInDialog = false) {
  const calls: Call[] = [];
  let signed = false;
  let finished = false;
  const answers: Record<string, (query?: Record<string, unknown>) => unknown> = {
    'GET /caller': () => ({ kind: 'user', id: PERSON, display_name: 'Ann', org_id: 'org', email: null, org_name: 'Acme', permissions: [], app: { key: 'signed-decision', name: 'Signed decisions' } }),
    'GET /app/objects': () => ({
      revision: 1,
      objects: [{ logical_key: 'entity:decision', id: DECISION_ENTITY, state: 'active', source: 'own', kind: 'entity', key: 'decision', contract: null, contract_version: null, customized: false, feature: null, parent: null }],
    }),
    'GET /work': () => ({ items: [workLine], next_cursor: null, prev_cursor: null }),
    'GET /entities/{entity_id}/records/{record_id}/step': () => step(signed, finished),
    'GET /entities/{entity_id}/records/{record_id}': () => ({
      id: TASK, entity_id: TASK_ENTITY, version: 1, created_at: '2026-10-06T08:00:00Z', updated_at: '2026-10-06T08:00:00Z',
      body: { title: null, claimed_by: PERSON }, ref_labels: { claimed_by: 'Ann' },
    }),
    'GET /entities/{entity_id}': () => ({
      id: DECISION_ENTITY, key: 'decision', name: 'Decision',
      fields: [{ key: 'title', label: 'Title', type: 'text', system: false }],
      effective_capabilities: { list: true, read: true, write: false, delete: false, design: false },
    }),
    'GET /entities/{entity_id}/records': () => ({ items: [], next_cursor: null, prev_cursor: null }),
  };
  const api = {
    async GET(path: string, init?: { params?: { path?: Record<string, string>; query?: Record<string, unknown> } }) {
      calls.push({ method: 'GET', path: path.replace(/\{entity_id\}/, init?.params?.path?.entity_id ?? '{entity_id}'), query: init?.params?.query });
      const answer = answers[`GET ${path}`];
      return answer ? { data: answer(init?.params?.query), response: new Response(null, { status: 200 }) } : problem(404);
    },
  };
  const sign = vi.fn(async () => {
    signed = outcome === 'signed';
    finished = finishedInDialog;
    return outcome;
  });
  const localeListeners = new Set<(locale: string) => void>();
  const host = {
    contractVersion: 3,
    api,
    context: { person: { id: PERSON, name: 'Ann', email: null }, org: { id: 'org', name: 'Acme' }, locale: 'en', theme: { mode: 'light', brand: 'azure' } },
    onThemeChange: () => () => {},
    onLocaleChange(listener: (locale: string) => void) {
      localeListeners.add(listener);
      return () => localeListeners.delete(listener);
    },
    ...(withSigning ? { signing: { sign } } : {}),
  } as unknown as AppHost;
  return { host, calls, sign, localeListeners, work: () => calls.filter((c) => c.path === '/work'), records: () => calls.filter((c) => c.path === `/entities/${DECISION_ENTITY}/records`) };
}

let stop: (() => void) | undefined;
let shadowHost: HTMLElement | undefined;

function mountModule(host: AppHost) {
  shadowHost = document.createElement('div');
  document.body.append(shadowHost);
  const root = shadowHost.attachShadow({ mode: 'open' });
  stop = mount(root, host);
  return root;
}

const inbox = (root: ShadowRoot) => root.querySelector('agentflow-task-inbox');
const detail = (root: ShadowRoot) => root.querySelector('agentflow-task-detail');
const signButton = (root: ShadowRoot) =>
  [...(detail(root)?.shadowRoot?.querySelectorAll('button') ?? [])].find((b) => b.textContent?.trim() === 'Sign');

async function openTask(root: ShadowRoot) {
  const row = await vi.waitFor(() => {
    const found = inbox(root)?.shadowRoot?.querySelector('[part="row"]');
    expect(found).toBeTruthy();
    return found as HTMLElement;
  });
  row.click();
  await vi.waitFor(() => expect(signButton(root)).toBeDefined());
}

afterEach(() => {
  stop?.();
  stop = undefined;
  shadowHost?.remove();
  vi.restoreAllMocks();
});

describe('the signed-decision module', () => {
  it('goes through host.api alone, listing the work that asks for a signature', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { host, calls, work } = makeHost();
    const root = mountModule(host);
    await vi.waitFor(() => expect(work()).toHaveLength(1));
    expect(calls.some((c) => c.path === '/caller')).toBe(true);
    expect(work()[0]!.query).toMatchObject({ view: 'mine', signs: true });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(inbox(root)).not.toBeNull();
  });

  it('points the task detail at the chosen task and signs it through host.signing', async () => {
    const { host, sign } = makeHost('closed');
    const root = mountModule(host);
    await openTask(root);
    expect(detail(root)!.getAttribute('entity-id')).toBe(TASK_ENTITY);
    expect(detail(root)!.getAttribute('record-id')).toBe(TASK);
    signButton(root)!.click();
    await vi.waitFor(() => expect(sign).toHaveBeenCalledWith({ entity: TASK_ENTITY, record: TASK }));
  });

  it('reloads the inbox and the decisions once a signature is recorded', async () => {
    const { host, work, records } = makeHost('signed');
    const root = mountModule(host);
    await vi.waitFor(() => expect(records()).toHaveLength(1));
    await openTask(root);
    expect(work()).toHaveLength(1);
    signButton(root)!.click();
    await vi.waitFor(() => expect(work()).toHaveLength(2));
    await vi.waitFor(() => expect(records()).toHaveLength(2));
  });

  it('reloads the inbox and the decisions when the task was finished in the dialog without signing', async () => {
    const { host, work, records } = makeHost('closed', true, true);
    const root = mountModule(host);
    await vi.waitFor(() => expect(records()).toHaveLength(1));
    await openTask(root);
    expect(work()).toHaveLength(1);
    signButton(root)!.click();
    await vi.waitFor(() => expect(work()).toHaveLength(2));
    await vi.waitFor(() => expect(records()).toHaveLength(2));
  });

  it('reaches the elements with the host language when it changes', async () => {
    const { host, localeListeners } = makeHost();
    const root = mountModule(host);
    const provider = root.querySelector('agentflow-provider')!;
    expect(provider.getAttribute('locale')).toBe('en');
    for (const listener of localeListeners) listener('vi');
    expect(provider.getAttribute('locale')).toBe('vi');
    expect(root.querySelector('h1')!.textContent).not.toBe('');
  });

  it('leaves no signing to offer when the host has none', async () => {
    const { host } = makeHost('signed', false);
    const root = mountModule(host);
    const row = await vi.waitFor(() => {
      const found = inbox(root)?.shadowRoot?.querySelector('[part="row"]');
      expect(found).toBeTruthy();
      return found as HTMLElement;
    });
    row.click();
    await vi.waitFor(() => expect(detail(root)!.shadowRoot!.textContent).toContain('AgentFlow'));
    expect(signButton(root)).toBeUndefined();
  });

  it('cleans up: nothing is left in root, and the locale listener is gone', async () => {
    const { host, localeListeners } = makeHost();
    const root = mountModule(host);
    expect(localeListeners.size).toBe(1);
    stop!();
    stop = undefined;
    expect(localeListeners.size).toBe(0);
    expect(root.childNodes).toHaveLength(0);
  });
});
