// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DeskApi } from '../../src/api/desk-api.js';
import { createFakeDesk } from '../../src/api/fake.js';
import { LiveContext } from '../../src/live/live-context.js';
import { Desk } from '../../src/shell/Desk.js';
import { renderDesk, TEST_NOW } from '../support/render.js';

const ANA = '30000000-0000-4000-8000-000000000002';
const HELD = '40000000-0000-4000-8000-000000000004'; // eve@mailbox.test, held on Ana's ticket

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
  window.history.pushState({}, '', `/f/mine/t/${ANA}`);
});
afterEach(() => vi.useRealTimers());

const thread = () => screen.getByRole('log', { name: 'Conversation' });

describe('the thread', () => {
  it('shows the mockup\'s conversation in order, with the draft left for the composer', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(within(thread()).getAllByRole('article').length).toBeGreaterThan(3));
    const items = within(thread()).getAllByRole('article').map((a) => a.className);
    expect(items).toEqual(['card cust', 'card ours', 'notecard', 'event', 'card cust', 'heldcard']);
    expect(within(thread()).getByText('AI draft, edited')).toBeTruthy();
    expect(within(thread()).getByText(/Hà Nguyễn: Escalated: priority raised to high/)).toBeTruthy();
    expect(within(thread()).queryByText(/Good news: your parcel was mislabelled/)).toBeNull();
  });

  it('links an attachment under the API the desk calls', async () => {
    renderDesk(<Desk />);
    const file = await within(await screen.findByRole('log', { name: 'Conversation' })).findByRole('link', { name: /tracking-screenshot\.png/ });
    expect(file.getAttribute('href')).toBe('http://desk.memory/agentflow/api/attachments/att-1/download');
  });

  it('keeps quoted history folded until asked', async () => {
    renderDesk(<Desk />);
    await within(await screen.findByRole('log', { name: 'Conversation' })).findByText('Any news? I need it for a book club on Saturday.');
    expect(within(thread()).queryByText(/On Mon, Bo Tran wrote:/)).toBeNull();
    fireEvent.click(within(thread()).getByRole('button', { name: 'Show quoted text' }));
    expect(within(thread()).getByText(/On Mon, Bo Tran wrote:/)).toBeTruthy();
  });

  it('renders a huge quoted chain and an unbroken line as one short paragraph', async () => {
    const { fake } = renderDesk(<Desk />);
    await within(await screen.findByRole('log', { name: 'Conversation' })).findByText(/Any news\?/);
    const chain = Array.from({ length: 5000 }, (_, i) => `> line ${i}`).join('\n');
    act(() => {
      fake.server.write('reply', null, {
        ticket: ANA, author_kind: 'customer', status: 'received', posted_at: new Date(TEST_NOW.getTime() + 60_000).toISOString(), key: '<long@x>',
        body: `See https://example.com/${'a'.repeat(2000)}\n${chain}`,
      });
    });
    const long = await within(thread()).findByText(/^See https:\/\/example\.com\/a+$/);
    expect(long.closest('article')?.textContent?.length).toBeLessThan(2300);
    expect(long.closest('article')?.className).toBe('card cust fresh');
    expect(within(long.closest('article') as HTMLElement).getByText('New')).toBeTruthy();
  });

  it('calls a message new only when it came after the ticket was really opened, not after the clock\'s last tick', async () => {
    const KHOA = '30000000-0000-4000-8000-000000000001';
    const { fake } = renderDesk(<Desk />);
    await within(await screen.findByRole('log', { name: 'Conversation' })).findByText(/Any news\?/);
    // The desk's clock ticks every 30 s; a ticket opened 25 s after the last tick must not call what arrived
    // 15 s ago (before it was opened) new.
    act(() => { vi.setSystemTime(new Date(TEST_NOW.getTime() + 25_000)); });
    act(() => {
      fake.server.write('reply', null, {
        ticket: ANA, author_kind: 'customer', status: 'received', posted_at: new Date(TEST_NOW.getTime() + 10_000).toISOString(),
        key: '<before-open@x>', body: 'Sent before you opened this ticket',
      });
    });
    act(() => { window.history.pushState({}, '', `/f/mine/t/${KHOA}`); window.dispatchEvent(new PopStateEvent('popstate')); });
    await screen.findByRole('heading', { name: 'Charged twice for order #88213' });
    act(() => { window.history.pushState({}, '', `/f/mine/t/${ANA}`); window.dispatchEvent(new PopStateEvent('popstate')); });
    const card = (await within(await screen.findByRole('log', { name: 'Conversation' })).findByText('Sent before you opened this ticket')).closest('article');
    expect(card?.className).toBe('card cust');
  });

  it('says so when a message has no text', async () => {
    const { fake } = renderDesk(<Desk />);
    await within(await screen.findByRole('log', { name: 'Conversation' })).findByText(/Any news\?/);
    act(() => {
      fake.server.write('reply', null, { ticket: ANA, author_kind: 'customer', status: 'received', posted_at: TEST_NOW.toISOString(), key: '<empty@x>', body: '' });
    });
    expect(await within(thread()).findByText('This message had no plain text.')).toBeTruthy();
  });

  it('accepts a held message into the conversation', async () => {
    renderDesk(<Desk />);
    const held = (await within(await screen.findByRole('log', { name: 'Conversation' })).findByText('Held · not from anyone on this ticket')).closest('article') as HTMLElement;
    expect(within(held).getByText(/matched by the ticket number in its subject/)).toBeTruthy();
    fireEvent.click(within(held).getByRole('button', { name: 'Accept into conversation' }));
    await waitFor(() => expect(within(thread()).queryByText('Held · not from anyone on this ticket')).toBeNull());
    expect(within(thread()).getByText('Please refund this order to my new card, details attached.').closest('article')?.className).toContain('card cust');
  });

  it('warns while live updates are paused and retries on request', async () => {
    const { live } = renderDesk(<Desk />);
    await screen.findByRole('log', { name: 'Conversation' });
    act(() => live.setStatus('polling'));
    expect(screen.getByText('Live updates paused. Checking for changes every 30 seconds.')).toBeTruthy();
    act(() => fireEvent.click(screen.getByRole('button', { name: 'Retry now' })));
    expect(screen.queryByText(/Live updates paused/)).toBeNull();
  });

  it('stays quiet while the stream has never been live: AgentFlow may have it turned off', async () => {
    const off = { status: 'polling' as const, pushes: false, presence: {}, watch: () => {}, retry: () => {} };
    renderDesk(<Desk />, { wrap: (ui) => <LiveContext.Provider value={off}>{ui}</LiveContext.Provider> });
    await screen.findByRole('log', { name: 'Conversation' });
    expect(screen.queryByText(/Live updates paused/)).toBeNull();
  });
});

describe('held message actions', () => {
  // Timers run (the clock moves with real time), because the desk waits on a run by polling it.
  beforeEach(() => {
    vi.useRealTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(TEST_NOW);
  });

  const heldCard = async () =>
    (await within(await screen.findByRole('log', { name: 'Conversation' })).findByText('Held · not from anyone on this ticket')).closest('article') as HTMLElement;
  const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });

  it('moves a held message to a new ticket and offers to open it', async () => {
    const { fake } = renderDesk(<Desk />);
    fireEvent.click(within(await heldCard()).getByRole('button', { name: 'Move to a new ticket' }));
    await advance(1500);
    expect(await screen.findByText('Moved to a new ticket.')).toBeTruthy();
    const moved = fake.server.records('reply').find((r) => r.id === HELD)!.body.ticket as string;
    expect(moved).not.toBe(ANA);
    fireEvent.click(screen.getByRole('button', { name: 'Open it' }));
    expect(window.location.pathname).toBe(`/f/mine/t/${moved}`);
  });

  it('offers the new ticket as soon as the message has moved, before the draft for it is written', async () => {
    // The run waits on a Draft reply child for two minutes; the message itself moves at once.
    const fake = createFakeDesk({ now: TEST_NOW, draftDelayMs: 120_000 });
    renderDesk(<Desk />, { fake });
    fireEvent.click(within(await heldCard()).getByRole('button', { name: 'Move to a new ticket' }));
    await advance(2000);
    expect(await screen.findByText('Moved to a new ticket.')).toBeTruthy();
    await act(async () => { await fake.server.settle(); });
  });

  it('says so when someone else already decided', async () => {
    const fake = createFakeDesk({ now: TEST_NOW, atomicDelayMs: 2000 });
    renderDesk(<Desk />, { fake });
    fireEvent.click(within(await heldCard()).getByRole('button', { name: 'Accept into conversation' }));
    act(() => { fake.server.write('reply', HELD, { author_kind: 'customer' }); }); // a teammate got there first
    await advance(4000);
    expect(await screen.findByText('Someone else already accepted or moved this message.')).toBeTruthy();
    expect(screen.queryByText('Moved to a new ticket.')).toBeNull();
  });

  it('says it could not, in the desk\'s words, when the run failed', async () => {
    const failing = (api: DeskApi): DeskApi => ({
      ...api,
      start: async () => ({ state: 'done', runId: 'r1', status: 'failed', output: {}, outcome: null, error: 'node accept: SQLSTATE 23505 internal detail' }),
    });
    renderDesk(<Desk />, { api: failing });
    fireEvent.click(within(await heldCard()).getByRole('button', { name: 'Accept into conversation' }));
    expect(await screen.findByText('Couldn\'t accept this message. Try again.')).toBeTruthy();
    expect(screen.queryByText(/SQLSTATE/)).toBeNull();
    fireEvent.click(within(await heldCard()).getByRole('button', { name: 'Move to a new ticket' }));
    expect(await screen.findByText('Couldn\'t move this message. Try again.')).toBeTruthy();
  });

  it('says the message is gone when it was deleted before the run could start', async () => {
    const fake = createFakeDesk({ now: TEST_NOW });
    const deleting = (api: DeskApi): DeskApi => ({
      ...api,
      start: async (...args) => { fake.server.remove('reply', HELD); return api.start(...args); },
    });
    renderDesk(<Desk />, { fake, api: deleting });
    fireEvent.click(within(await heldCard()).getByRole('button', { name: 'Accept into conversation' }));
    expect(await screen.findByText('This message is gone.')).toBeTruthy();
  });

  it('says it is still working when the run outlasts the wait', async () => {
    const fake = createFakeDesk({ now: TEST_NOW, atomicDelayMs: 200_000 });
    renderDesk(<Desk />, { fake });
    fireEvent.click(within(await heldCard()).getByRole('button', { name: 'Accept into conversation' }));
    await advance(61_000);
    expect(await screen.findByText('Still working on it; it will show here when done.')).toBeTruthy();
    // The buttons work again.
    expect(within(await heldCard()).getByRole('button', { name: 'Accept into conversation' })).toHaveProperty('disabled', false);
    await act(async () => { await fake.server.settle(); });
  });

  it('stops waiting when the thread closes', async () => {
    const fake = createFakeDesk({ now: TEST_NOW, atomicDelayMs: 200_000 });
    const signals: (AbortSignal | undefined)[] = [];
    const watching = (api: DeskApi): DeskApi => ({
      ...api,
      waitForRun: (runId, opts) => { signals.push(opts.signal); return api.waitForRun(runId, opts); },
    });
    const view = renderDesk(<Desk />, { fake, api: watching });
    fireEvent.click(within(await heldCard()).getByRole('button', { name: 'Accept into conversation' }));
    await advance(1000);
    expect(signals).toHaveLength(1);
    expect(signals[0]?.aborted).toBe(false);
    view.unmount();
    expect(signals[0]?.aborted).toBe(true);
    await fake.server.settle();
  });
});
