import '@reflexify/agentflow-elements';
import type { AppHost, AppTaskAction, AppTaskHandle, AppTaskState } from '@reflexify/agentflow-sdk';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '../src/module.js';

// What jsdom lacks and the kit's elements use.
class NoResize { observe() {} unobserve() {} disconnect() {} }
globalThis.ResizeObserver ??= NoResize as unknown as typeof ResizeObserver;

const PERSON = '0190c0de-0000-7000-8000-000000000001';
const TASK = '0190c0de-0000-7000-8000-00000000a001';

const action = (id: string, label: string, over: Partial<AppTaskAction> = {}): AppTaskAction => ({
  id, label, tone: null, icon: null, kind: 'submit', enabled: true, reason: null, ...over,
});

const stateOf = (over: Partial<AppTaskState> = {}): AppTaskState => ({
  status: 'ready',
  record: { entity: 'workflow-task', id: TASK },
  step: null,
  work: { holder: { id: PERSON, name: 'Ann' }, canClaim: false, canRelease: true, dueAt: null, clocks: [] },
  values: {},
  actions: [action('reject', 'Reject'), action('approve', 'Approve', { tone: 'primary' })],
  allHidden: false,
  canSaveDraft: false,
  busy: false,
  taken: null,
  lastEvent: null,
  ...over,
});

/** A handle that holds the state it is given and tells its subscribers when the test moves it. */
function makeHandle(initial: AppTaskState) {
  let state = initial;
  const listeners = new Set<(state: AppTaskState) => void>();
  const handle = {
    get state() {
      return state;
    },
    subscribe(listener: (state: AppTaskState) => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setValues: vi.fn((changes: Record<string, unknown>) => {
      handle.push({ values: { ...state.values, ...changes } });
    }),
    submit: vi.fn(async (_id: string) => {}),
    claim: vi.fn(async () => {}),
    close: vi.fn(),
    push(over: Partial<AppTaskState>) {
      state = { ...state, ...over };
      for (const listener of [...listeners]) listener(state);
    },
  };
  return handle;
}
type FakeHandle = ReturnType<typeof makeHandle>;

function makeHost(options: { handle?: FakeHandle; path?: string; tasks?: boolean } = {}) {
  const handle = options.handle ?? makeHandle(stateOf());
  const open = vi.fn((_target: { record: string; entity?: string }) => handle as unknown as AppTaskHandle);
  const locationListeners = new Set<(path: string) => void>();
  const localeListeners = new Set<(locale: string) => void>();
  let path = options.path ?? `/review/${TASK}`;
  const api = {
    async GET(route: string) {
      if (route === '/caller') {
        return {
          data: { kind: 'user', id: PERSON, display_name: 'Ann', org_id: 'org', email: null, org_name: 'Acme', permissions: [], app: { key: 'task-page', name: 'Task page' } },
          response: new Response(null, { status: 200 }),
        };
      }
      return { error: { type: 'NOT_FOUND', status: 404 }, response: new Response(null, { status: 404 }) };
    },
  };
  const host = {
    contractVersion: 5,
    api,
    context: { person: { id: PERSON, name: 'Ann', email: null }, org: { id: 'org', name: 'Acme' }, locale: 'en', theme: { mode: 'light', brand: 'azure' } },
    onThemeChange: () => () => {},
    onLocaleChange(listener: (locale: string) => void) {
      localeListeners.add(listener);
      return () => localeListeners.delete(listener);
    },
    onLocationChange(listener: (path: string) => void) {
      locationListeners.add(listener);
      listener(path);
      return () => locationListeners.delete(listener);
    },
    navigate: vi.fn(),
    ...(options.tasks === false ? {} : { tasks: { open } }),
  } as unknown as AppHost;
  return {
    host, handle, open, localeListeners, locationListeners,
    goTo(next: string) {
      path = next;
      for (const listener of [...locationListeners]) listener(path);
    },
  };
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

afterEach(() => {
  stop?.();
  stop = undefined;
  shadowHost?.remove();
  vi.restoreAllMocks();
});

const button = (root: ShadowRoot, label: string) =>
  [...root.querySelectorAll('button')].find((b) => b.textContent?.trim() === label);
const waitForButton = (root: ShadowRoot, label: string) =>
  vi.waitFor(() => {
    const found = button(root, label);
    expect(found).toBeDefined();
    return found!;
  });
const reasonOf = (root: ShadowRoot, label: string) => {
  const id = button(root, label)!.getAttribute('aria-describedby');
  return id ? root.getElementById(id)?.textContent : undefined;
};
const shown = (element: Element | null | undefined) => Boolean(element) && element!.closest('[hidden]') === null;
const notice = (root: ShadowRoot) => root.querySelector('.af-banner')?.textContent ?? '';

describe('the task-page module', () => {
  it("the review screen draws the task's actions and submits through the handle", async () => {
    const { host, handle, open } = makeHost();
    const root = mountModule(host);

    const approve = await waitForButton(root, 'Approve');
    expect(open).toHaveBeenCalledWith({ record: TASK });
    expect(approve.getAttribute('aria-disabled')).toBeNull();
    const note = root.querySelector('textarea')!;
    note.value = 'Looks fine';
    note.dispatchEvent(new Event('input', { bubbles: true }));
    expect(handle.setValues).toHaveBeenCalledWith({ note: 'Looks fine' });

    approve.click();
    expect(handle.submit).toHaveBeenCalledWith('approve');
    expect(handle.setValues.mock.invocationCallOrder[0]!).toBeLessThan(handle.submit.mock.invocationCallOrder[0]!);
    expect(handle.submit).toHaveBeenCalledTimes(1);
    approve.click();
    expect(handle.submit).toHaveBeenCalledTimes(1);
  });

  it('locks the actions of a task nobody holds with their reason, and claims it from the page', async () => {
    const claimFirst = (id: string, label: string) => action(id, label, { enabled: false, reason: 'claim_first' });
    const handle = makeHandle(stateOf({
      work: { holder: null, canClaim: true, canRelease: false, dueAt: null, clocks: [] },
      actions: [claimFirst('reject', 'Reject'), claimFirst('approve', 'Approve')],
    }));
    const { host } = makeHost({ handle });
    const root = mountModule(host);

    const approve = await waitForButton(root, 'Approve');
    expect(approve.getAttribute('aria-disabled')).toBe('true');
    expect(reasonOf(root, 'Approve')).toBe('Claim this task to decide');
    approve.click();
    expect(handle.submit).not.toHaveBeenCalled();

    expect(shown(button(root, 'Claim'))).toBe(true);
    button(root, 'Claim')!.click();
    expect(handle.claim).toHaveBeenCalledTimes(1);

    handle.push({
      work: { holder: { id: PERSON, name: 'Ann' }, canClaim: false, canRelease: true, dueAt: null, clocks: [] },
      actions: [action('reject', 'Reject'), action('approve', 'Approve')],
    });
    expect(shown(button(root, 'Claim'))).toBe(false);
    expect(button(root, 'Approve')!.getAttribute('aria-disabled')).toBeNull();
    expect(button(root, 'Approve')!.hasAttribute('aria-describedby')).toBe(false);
  });

  it('shows what a refused submit says instead of swallowing it', async () => {
    const handle = makeHandle(stateOf());
    const refusal = (status: number, type: string, title: string) => Object.assign(new Error(title), { problem: { status, type, title } });
    handle.submit.mockRejectedValueOnce(refusal(409, 'WORK_NOT_ACTIVE', 'This task is no longer open'));
    handle.submit.mockRejectedValueOnce(refusal(0, 'held_by_other', 'This cannot be done now'));
    const { host } = makeHost({ handle });
    const root = mountModule(host);

    (await waitForButton(root, 'Approve')).click();
    await vi.waitFor(() => expect(notice(root)).toContain('This task is no longer open'));

    button(root, 'Approve')!.click();
    await vi.waitFor(() => expect(notice(root)).toContain('Someone else holds this task'));
  });

  it('says why there is nothing to work on: not this app, already decided, could not load, or a host without tasks', async () => {
    const cases: [Partial<AppTaskState>, string][] = [
      [{ status: 'not_found' }, "This task is not one of this app's"],
      [
        { status: 'error', actions: [], problem: { status: 500, type: 'INTERNAL', title: 'Internal Server Error' } },
        'AgentFlow could not load this task',
      ],
      [{ status: 'finished', actions: [], taken: { id: 'approve', label: 'Approve', by: 'person' } }, 'Decided: Approve'],
      [{ status: 'finished', actions: [] }, 'This task is already decided'],
    ];
    for (const [over, text] of cases) {
      const { host } = makeHost({ handle: makeHandle(stateOf(over)) });
      const root = mountModule(host);
      await vi.waitFor(() => expect(notice(root)).toContain(text));
      expect(shown(root.querySelector('textarea'))).toBe(false);
      stop!();
      stop = undefined;
      shadowHost!.remove();
    }
  });

  it('a host without tasks shows the notice to open the task in AgentFlow', async () => {
    const { host, open } = makeHost({ tasks: false });
    const root = mountModule(host);
    await vi.waitFor(() => expect(notice(root)).toContain('Open this task in AgentFlow'));
    expect(open).not.toHaveBeenCalled();
    expect(root.querySelector('agentflow-task')).toBeNull();
  });

  it('opens the task the path names, and another one when the path moves', async () => {
    const other = '0190c0de-0000-7000-8000-00000000a002';
    const { host, open, handle, goTo } = makeHost({ path: '/' });
    const root = mountModule(host);
    await vi.waitFor(() => expect(notice(root)).toContain('Open a task from My Work'));
    expect(open).not.toHaveBeenCalled();

    goTo(`/review/${TASK}?tab=notes`);
    await waitForButton(root, 'Approve');
    expect(open).toHaveBeenLastCalledWith({ record: TASK });

    goTo(`/review/${other}`);
    await vi.waitFor(() => expect(open).toHaveBeenLastCalledWith({ record: other }));
    await vi.waitFor(() => expect(handle.close).toHaveBeenCalled());
  });

  it('follows the host language in place, reasons included', async () => {
    const handle = makeHandle(stateOf({ actions: [action('approve', 'Approve', { enabled: false, reason: 'claim_first' })] }));
    const { host, localeListeners } = makeHost({ handle });
    const root = mountModule(host);
    await waitForButton(root, 'Approve');
    const noteBefore = root.querySelector('textarea')!;
    noteBefore.value = 'kept';
    noteBefore.dispatchEvent(new Event('input', { bubbles: true }));

    for (const listener of localeListeners) listener('vi');
    expect(reasonOf(root, 'Approve')).toBe('Nhận việc này để quyết định');
    expect(root.querySelector('h1')!.textContent).toBe('Duyệt yêu cầu');
    expect(root.querySelector('agentflow-provider')!.getAttribute('locale')).toBe('vi');
    expect(root.querySelector('textarea')).toBe(noteBefore);
    expect(noteBefore.value).toBe('kept');
  });

  it('cleans up: the handle is closed, nothing is left in root, and the listeners are gone', async () => {
    const { host, handle, localeListeners, locationListeners } = makeHost();
    const root = mountModule(host);
    await waitForButton(root, 'Approve');
    stop!();
    stop = undefined;
    expect(localeListeners.size).toBe(0);
    expect(locationListeners.size).toBe(0);
    // The task element closes its handle as it leaves the page, a microtask later.
    await vi.waitFor(() => expect(handle.close).toHaveBeenCalled());
    expect(root.childNodes).toHaveLength(0);
  });
});
