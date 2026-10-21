// @vitest-environment jsdom
import { act, fireEvent, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DeskApi, RunResult } from '../../src/api/desk-api.js';
import { OUTBOX_DONE_LINGER_MS, SEND_WAIT_MS, UNDO_SEND_MS } from '../../src/model/timing.js';
import { OutboxBar, OutboxProvider, useOutbox } from '../../src/outbox/Outbox.js';
import { RouteProvider } from '../../src/shell/RouteContext.js';
import { renderDesk, TEST_NOW, windowLocation } from '../support/render.js';

// The bar above the screens is for sends of tickets that are not open. A send that went well is news for a moment,
// not a row to close: ten quick sends must not push the workspace down ten rows.

const sentAtOnce = (api: DeskApi): DeskApi => ({
  ...api,
  start: async (): Promise<RunResult> => ({ state: 'done', runId: 'run-1', status: 'completed', output: { status: 'sent' }, outcome: null, error: null }),
});
const DRAFT = '40000000-0000-4000-8000-000000000005';
// The start never answers, and the draft the desk looks at meanwhile is still a draft at the version that was confirmed.
const neverAnswers = (api: DeskApi): DeskApi => ({
  ...api,
  start: () => new Promise<RunResult>(() => {}),
  reply: async () => ({ ...(await api.reply(DRAFT)), version: 1 }),
});

let outbox!: ReturnType<typeof useOutbox>;
function Capture() {
  outbox = useOutbox();
  return null;
}

const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
const ticket = (n: number) => ({
  ticketId: `t-${n}`, ticketName: `Customer ${n}`, draftId: `d-${n}`, version: 1, choice: 'send' as const, task: null, meId: 'u-1',
});
const startSend = (n: number) => act(() => { expect(outbox.start(ticket(n))).toBe(true); });
const refuse = (n: number) => act(() => outbox.refuse(`t-${n}`, `Customer ${n}`, 'Not sent: the draft changed.'));
const barRows = () => Array.from(document.querySelectorAll<HTMLElement>('.undo'));
/** What each row says, without its buttons. */
const rows = () => barRows().map((r) => r.querySelector('span')!.textContent);

function show(api: (a: DeskApi) => DeskApi = sentAtOnce) {
  renderDesk(<RouteProvider location={windowLocation()}><OutboxProvider><Capture /><OutboxBar /></OutboxProvider></RouteProvider>, { api });
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(TEST_NOW);
  window.history.pushState({}, '', '/f/mine');
});
afterEach(() => vi.useRealTimers());

describe('the outbox bar', () => {
  it('lets a finished send go after a short linger, with no one closing it', async () => {
    show();
    startSend(1);
    await advance(UNDO_SEND_MS + 500);
    expect(rows()).toEqual(['Customer 1 · Sent.']);
    await advance(OUTBOX_DONE_LINGER_MS - 1500);
    expect(rows()).toHaveLength(1);
    await advance(2000);
    expect(rows()).toEqual([]);
  });

  it('keeps a send that failed until the person closes it', async () => {
    show();
    refuse(1);
    await advance(OUTBOX_DONE_LINGER_MS * 5);
    expect(rows()).toEqual(['Customer 1 · Not sent: the draft changed.']);
    fireEvent.click(within(barRows()[0]!).getByRole('button', { name: 'Close' }));
    expect(rows()).toEqual([]);
  });

  it('keeps a send that is still not known to have gone', async () => {
    show(neverAnswers);
    startSend(1);
    await advance(UNDO_SEND_MS + SEND_WAIT_MS + OUTBOX_DONE_LINGER_MS * 3);
    expect(rows()).toEqual(['Still sending to Customer 1. The ticket wasn\'t marked.']);
  });

  it('shows the newest three rows and counts the rest', async () => {
    show();
    for (const n of [1, 2, 3, 4, 5]) refuse(n);
    const shown = () => rows().map((t) => t!.split(' · ')[0]);
    expect(shown()).toEqual(['Customer 3', 'Customer 4', 'Customer 5']);
    expect(screen.getByText('+2 more')).toBeTruthy();
    // Closing one makes room for the oldest of the rest.
    fireEvent.click(within(barRows()[2]!).getByRole('button', { name: 'Close' }));
    expect(shown()).toEqual(['Customer 2', 'Customer 3', 'Customer 4']);
    expect(screen.getByText('+1 more')).toBeTruthy();
  });

  it('never hides a countdown, so every Undo stays reachable, whatever the cap on the rest', async () => {
    show();
    for (const n of [1, 2, 3, 4]) startSend(n);
    expect(rows()).toHaveLength(4);
    expect(screen.getAllByRole('button', { name: 'Undo' })).toHaveLength(4);
    expect(screen.queryByText(/more$/)).toBeNull();
    // The cap applies to the rest: four failed sends come after the four countdowns, and only the newest three show.
    for (const n of [5, 6, 7, 8]) refuse(n);
    expect(screen.getAllByRole('button', { name: 'Undo' })).toHaveLength(4);
    expect(rows().filter((t) => t!.startsWith('Sending to'))).toHaveLength(4);
    expect(rows().filter((t) => t!.includes('Not sent'))).toHaveLength(3);
    expect(screen.getByText('+1 more')).toBeTruthy();
  });

  it('does not count the sends it has let go of, or keep a count with nothing behind it', async () => {
    show();
    for (const n of [1, 2, 3, 4, 5]) startSend(n);
    await advance(UNDO_SEND_MS + 500);
    expect(rows().filter((t) => t!.endsWith(' · Sent.'))).toHaveLength(3);
    expect(screen.getByText('+2 more')).toBeTruthy();
    await advance(OUTBOX_DONE_LINGER_MS + 500);
    expect(rows()).toEqual([]);
    expect(screen.queryByText(/more$/)).toBeNull();
  });
});
