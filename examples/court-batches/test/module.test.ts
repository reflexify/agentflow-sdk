import type { AgentFlowClient, AppHost } from '@reflexify/agentflow-sdk';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '../src/module.js';

// What jsdom lacks and the elements use.
class NoResize { observe() {} unobserve() {} disconnect() {} }
globalThis.ResizeObserver ??= NoResize as unknown as typeof ResizeObserver;

const BATCH = '0190c0de-0000-7000-8000-00000000b001';
const OTHER_BATCH = '0190c0de-0000-7000-8000-00000000b002';

function makeHost(path: string) {
  const listeners = new Set<(path: string) => void>();
  // The screens under test are wiring; no call of theirs needs an answer.
  const api = {
    async GET() {
      return { error: { type: 'NOT_FOUND', status: 404 }, response: new Response(null, { status: 404 }) };
    },
  } as unknown as AgentFlowClient;
  const navigate = vi.fn((next: string) => {
    for (const listener of [...listeners]) listener(next);
  });
  const host = {
    contractVersion: 5,
    api,
    context: { person: { id: 'p', name: 'Hoa', email: null }, org: { id: 'org', name: 'Acme' }, locale: 'en', theme: { mode: 'light', brand: 'azure' } },
    onThemeChange: () => () => {},
    onLocaleChange: () => () => {},
    onLocationChange(listener: (path: string) => void) {
      listeners.add(listener);
      listener(path);
      return () => listeners.delete(listener);
    },
    navigate,
  } as unknown as AppHost;
  return { host, api, navigate };
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

function unmount() {
  stop?.();
  stop = undefined;
  shadowHost?.remove();
}

afterEach(() => {
  unmount();
  sessionStorage.clear();
});

type StartForm = HTMLElement & { resumeSets?: Record<string, string> };
const startForm = (root: ShadowRoot) => root.querySelector<StartForm>('agentflow-start-form')!;
const tell = (from: Element, type: string, detail: unknown) =>
  from.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));

describe('the court-batches module', () => {
  it("a batch's screen starts its Add dossiers action through the host's client, and resumes an upload after a reload", () => {
    const { host, api } = makeHost(`/batches/${BATCH}`);
    let root = mountModule(host);

    const provider = root.querySelector<HTMLElement & { client?: AgentFlowClient }>('agentflow-provider')!;
    expect(provider.client).toBe(api);
    let form = startForm(root);
    expect(provider.contains(form)).toBe(true);
    expect([form.getAttribute('entity'), form.getAttribute('record'), form.getAttribute('action')]).toEqual(['batch', BATCH, 'add_dossiers']);
    expect(form.resumeSets).toEqual({});

    // The form says an upload began; another batch's upload is not this one's.
    tell(form, 'af-folder-upload-started', { setId: 'set-1', field: 'files' });
    sessionStorage.setItem(`court-batches.upload.${OTHER_BATCH}.files`, 'set-9');

    // A reload: the module is mounted again, in the same tab.
    unmount();
    root = mountModule(host);
    form = startForm(root);
    expect(form.resumeSets).toEqual({ files: 'set-1' });

    // Once the run has started it holds the upload, and nothing is left to resume.
    tell(form, 'workflow-started', { instanceId: 'run-1', workflowId: 'wf-1' });
    expect(form.resumeSets).toEqual({});
    unmount();
    root = mountModule(host);
    expect(startForm(root).resumeSets).toEqual({});
    expect(sessionStorage.getItem(`court-batches.upload.${OTHER_BATCH}.files`)).toBe('set-9');
  });

  it('choosing a batch in the list opens its screen', () => {
    const { host, navigate } = makeHost('/');
    const root = mountModule(host);
    const table = root.querySelector('agentflow-record-table')!;
    expect(table.getAttribute('entity-key')).toBe('batch');
    expect(root.querySelector('agentflow-start-form')).toBeNull();

    tell(table, 'record-select', { recordId: BATCH });
    expect(navigate).toHaveBeenCalledWith(`/batches/${BATCH}`);
    expect(startForm(root).getAttribute('record')).toBe(BATCH);
  });
});
