// @vitest-environment jsdom
import { act, cleanup, configure, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LeaveError, type LeaveApi, type LeaveRequest } from '../../src/module/leave-api.js';
import { createMemoryLeaveApi } from '../../src/module/memory-leave-api.js';
import type { ScreenHost } from '../../src/module/mount.js';
import { TEXT } from '../../src/module/text.js';

// What jsdom lacks and the kit's elements use.
class NoResize { observe() {} unobserve() {} disconnect() {} }
globalThis.ResizeObserver ??= NoResize as unknown as typeof ResizeObserver;
HTMLElement.prototype.showPopover ??= function (this: HTMLElement) { this.dataset.shown = 'true'; };
HTMLElement.prototype.hidePopover ??= function (this: HTMLElement) { this.dataset.shown = 'false'; };
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) { this.setAttribute('open', ''); };
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) { this.removeAttribute('open'); this.dispatchEvent(new Event('close')); };

// The first render draws the kit's elements for the first time, which takes over a second on a busy machine.
configure({ asyncUtilTimeout: 5000 });

const { LeaveScreen } = await import('../../src/module/LeaveScreen.js');
const { mountLeave } = await import('../../src/module/mount.js');

const SEED: LeaveRequest[] = [
  { id: 'r2', number: 'LV-2026-0002', type: 'annual', from: '2026-12-21', to: '2026-12-23', days: 3, status: 'submitted' },
  { id: 'r1', number: 'LV-2026-0001', type: 'sick', from: '2026-11-02', to: '2026-11-02', days: 1, status: 'approved' },
];

/** The texts of the toasts on screen, read from the toast element's own parts. */
const toasts = () =>
  [...document.querySelectorAll('af-toast')].flatMap((el) =>
    [...(el.shadowRoot?.querySelectorAll('[part="toast"]') ?? [])].map((t) => (t.querySelector('[part="text"]') ?? t).textContent?.trim() ?? ''));

const dialogOpen = () => (document.querySelector('af-dialog') as HTMLElement & { open: boolean }).open;

function show(seed: LeaveRequest[], wrap: (api: LeaveApi) => LeaveApi = (api) => api) {
  const api = createMemoryLeaveApi(seed);
  render(<LeaveScreen api={wrap(api)} lang="en" locale="en" theme="light" />);
  return api;
}

/** The kit's date inputs are web components: set the value they hold and fire the event they send. */
function chooseDate(label: string, value: string) {
  const input = [...document.querySelectorAll('af-date')].find((el) => (el as HTMLElement & { label: string }).label === label)!;
  act(() => {
    (input as HTMLElement & { value: string }).value = value;
    input.dispatchEvent(new CustomEvent('change', { detail: { value } }));
  });
}

async function fillAndSend(from: string, to: string) {
  fireEvent.click(screen.getByText('New request'));
  await waitFor(() => expect(dialogOpen()).toBe(true));
  chooseDate('From', from);
  chooseDate('To', to);
  fireEvent.click(screen.getByText('Send request'));
}

afterEach(cleanup);

describe('the Leave screen', () => {
  it('lists the requests, with their status', async () => {
    show(SEED);
    await screen.findByText('LV-2026-0001');
    const rows = [...document.querySelectorAll('tbody tr')] as HTMLElement[];
    expect(rows.map((r) => r.querySelector('.number')!.textContent)).toEqual(['LV-2026-0002', 'LV-2026-0001']);
    expect(rows.map((r) => r.querySelector('.pill')!.textContent)).toEqual(['Waiting for approval', 'Approved']);
    expect(rows.map((r) => r.querySelector('.col-days')!.textContent)).toEqual(['3', '1']);
  });

  it('adds a sent request to the list and says so in a toast', async () => {
    const api = show(SEED);
    await screen.findByText('LV-2026-0001');
    await fillAndSend('2027-01-04', '2027-01-06');
    expect(await screen.findByText('LV-DEMO-0001')).toBeTruthy();
    expect(api.requests[0]).toMatchObject({ from: '2027-01-04', to: '2027-01-06', days: 3, status: 'submitted' });
    await waitFor(() => expect(toasts()).toContain('Request sent'));
    expect(dialogOpen()).toBe(false);
  });

  it('asks for both days before it sends anything', async () => {
    const api = show(SEED);
    await screen.findByText('LV-2026-0001');
    fireEvent.click(screen.getByText('New request'));
    await waitFor(() => expect(dialogOpen()).toBe(true));
    fireEvent.click(screen.getByText('Send request'));
    expect((await screen.findByText('Choose the first and the last day')).getAttribute('role')).toBe('alert');
    expect(api.requests).toHaveLength(2);
  });

  it('says there are no requests yet when the list is empty', async () => {
    show([]);
    expect((await screen.findByText('No leave requests yet')).tagName).toBe('H2');
    expect(document.querySelector('table')).toBeNull();
  });

  it("shows why a send failed in the dialog, and keeps what was typed", async () => {
    const api = show(SEED);
    await screen.findByText('LV-2026-0001');
    api.failNextSend('The last day cannot be before the first day');
    await fillAndSend('2027-01-06', '2027-01-04');
    const alert = await screen.findByText('The last day cannot be before the first day');
    expect(alert.getAttribute('role')).toBe('alert');
    expect(alert.closest('af-dialog')).not.toBeNull();
    expect(dialogOpen()).toBe(true);
    expect(api.requests).toHaveLength(2);
    expect(toasts()).toEqual([]);
  });

  it('reads the list again when a request is sent while the list could not load', async () => {
    let failing = true;
    show(SEED, (api) => ({
      list: () => (failing ? Promise.reject(new LeaveError('NETWORK', null)) : api.list()),
      send: (input) => api.send(input),
    }));
    await screen.findByText("Couldn't reach AgentFlow. Check your connection.");
    failing = false;
    await fillAndSend('2027-01-04', '2027-01-06');
    expect(await screen.findByText('LV-DEMO-0001')).toBeTruthy();
    expect(screen.getByText('LV-2026-0001')).toBeTruthy();
  });

  it('counts through Intl.NumberFormat in both languages', () => {
    expect(TEXT.en.count(1, 'en')).toBe('1 request');
    expect(TEXT.en.count(1200, 'en')).toBe('1,200 requests');
    expect(TEXT.vi.count(1200, 'vi')).toBe('1.200 đơn');
  });
});

describe('the mounted screen', () => {
  /** A host whose language and theme switch once more as the screen subscribes, before its listener is registered. */
  function switchingHost(): ScreenHost {
    const context: ScreenHost['context'] = {
      person: { id: 'p', name: 'P', email: null }, org: { id: 'o', name: 'Acme' }, locale: 'en', theme: { mode: 'light', brand: 'agentflow' },
    };
    return {
      context,
      onLocaleChange: () => {
        context.locale = 'vi';
        return () => {};
      },
      onThemeChange: () => {
        context.theme = { mode: 'dark', brand: 'agentflow' };
        return () => {};
      },
    };
  }

  it('keeps a language and a theme switch made between its first render and its subscription', async () => {
    const element = document.createElement('div');
    document.body.append(element);
    const shadow = element.attachShadow({ mode: 'open' });
    let unmount = () => {};
    act(() => {
      unmount = mountLeave(shadow, switchingHost(), createMemoryLeaveApi(SEED));
    });
    const root = shadow.querySelector('.leave') as HTMLElement;
    await waitFor(() => expect(root.querySelector('h1')!.textContent).toBe('Đơn nghỉ phép'));
    expect(root.lang).toBe('vi');
    expect(root.dataset.theme).toBe('dark');
    act(() => unmount());
    element.remove();
  });
});
