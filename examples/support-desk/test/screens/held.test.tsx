// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DeskApi } from '../../src/api/desk-api.js';
import { createFakeDesk } from '../../src/api/fake.js';
import { createSeed } from '../../src/api/seed.js';
import { REDRAFT_TIMEOUT_MS } from '../../src/model/timing.js';
import { Desk } from '../../src/shell/Desk.js';
import { renderDesk, TEST_NOW } from '../support/render.js';

const EVE_MESSAGE = '40000000-0000-4000-8000-000000000004';

beforeEach(() => window.history.pushState({}, '', '/held'));

const rows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1);
const eveRow = () => rows().find((r) => r.textContent?.includes('eve@mailbox.test'))!;

describe('held messages', () => {
  it('lists each held message with why it was held and how it matched', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(rows()).toHaveLength(2));
    const eve = eveRow();
    expect(within(eve).getByText('TK-2026-0418')).toBeTruthy();
    expect(within(eve).getByText('Ana Lima')).toBeTruthy();
    expect(within(eve).getByText('Not on the ticket').className).toBe('chip held');
    expect(within(eve).getByText('matched by the ticket number in its subject')).toBeTruthy();
    const khoa = rows().find((r) => r.textContent?.includes('khoa.tran@gmail.com'))!;
    expect(within(khoa).getByText('Sender check failed')).toBeTruthy();
    expect(within(khoa).getByText(/failed DMARC/)).toBeTruthy();
  });

  it('accepts a message, which leaves the list', async () => {
    const { fake } = renderDesk(<Desk />);
    await waitFor(() => expect(rows()).toHaveLength(2));
    fireEvent.click(within(eveRow()).getByRole('button', { name: 'Accept' }));
    await waitFor(() => expect(rows()).toHaveLength(1));
    expect(fake.server.runs().at(-1)).toMatchObject({ workflow: 'accept_message' });
  });

  it('moves a message to a new ticket and offers to open it', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(rows()).toHaveLength(2));
    fireEvent.click(within(eveRow()).getByRole('button', { name: 'Move to new ticket' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Open it' }));
    expect(window.location.pathname).toMatch(/^\/f\/open\/t\/[0-9a-f-]{36}$/);
  });

  it('opens the matched ticket from its number', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(rows()).toHaveLength(2));
    fireEvent.click(screen.getByRole('button', { name: 'TK-2026-0418' }));
    expect(window.location.pathname).toBe('/f/open/t/30000000-0000-4000-8000-000000000002');
  });

  it('says when nothing is held', async () => {
    const seed = createSeed(TEST_NOW);
    seed.records.reply = seed.records.reply!.filter((r) => r.body.author_kind !== 'unverified');
    renderDesk(<Desk />, { fake: createFakeDesk({ now: TEST_NOW, seed }) });
    expect(await screen.findByText('No held messages')).toBeTruthy();
  });
});

describe('what the screen says of an action', () => {
  // The clock moves with real time, because the desk waits on a run by polling it.
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(TEST_NOW);
  });
  afterEach(() => vi.useRealTimers());
  const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });

  it('says someone else already decided, and the message leaves the list', async () => {
    const fake = createFakeDesk({ now: TEST_NOW, atomicDelayMs: 2000 });
    renderDesk(<Desk />, { fake });
    await waitFor(() => expect(rows()).toHaveLength(2));
    fireEvent.click(within(eveRow()).getByRole('button', { name: 'Accept' }));
    act(() => { fake.server.write('reply', EVE_MESSAGE, { author_kind: 'customer' }); }); // a teammate got there first
    await advance(4000);
    const note = await screen.findByText('Someone else already accepted or moved this message.');
    expect(note.closest('[role="status"]')).toBeTruthy();
    await waitFor(() => expect(rows()).toHaveLength(1));
  });

  it('says it could not, in the desk\'s words, never with the run\'s own error', async () => {
    const failing = (api: DeskApi): DeskApi => ({
      ...api,
      start: async () => ({ state: 'done', runId: 'r1', status: 'failed', output: {}, outcome: null, error: 'node accept: SQLSTATE 23505 internal detail' }),
    });
    renderDesk(<Desk />, { api: failing });
    await waitFor(() => expect(rows()).toHaveLength(2));
    fireEvent.click(within(eveRow()).getByRole('button', { name: 'Accept' }));
    expect((await screen.findByText('Couldn\'t accept this message. Try again.')).closest('[role="alert"]')).toBeTruthy();
    fireEvent.click(within(eveRow()).getByRole('button', { name: 'Move to new ticket' }));
    expect(await screen.findByText('Couldn\'t move this message. Try again.')).toBeTruthy();
    expect(screen.queryByText(/SQLSTATE/)).toBeNull();
    // Both stay on the list: nothing moved.
    expect(rows()).toHaveLength(2);
  });

  it('says the message is gone when it was deleted before the run could start', async () => {
    const fake = createFakeDesk({ now: TEST_NOW });
    const deleting = (api: DeskApi): DeskApi => ({
      ...api,
      start: async (...args) => { fake.server.remove('reply', EVE_MESSAGE); return api.start(...args); },
    });
    renderDesk(<Desk />, { fake, api: deleting });
    await waitFor(() => expect(rows()).toHaveLength(2));
    fireEvent.click(within(eveRow()).getByRole('button', { name: 'Move to new ticket' }));
    expect(await screen.findByText('This message is gone.')).toBeTruthy();
    expect(screen.queryByText(/SUBJECT_BINDING_MISMATCH|That didn't work/)).toBeNull();
  });

  it('says it is still working when the run outlasts the wait', async () => {
    const fake = createFakeDesk({ now: TEST_NOW, atomicDelayMs: 200_000 });
    renderDesk(<Desk />, { fake });
    await waitFor(() => expect(rows()).toHaveLength(2));
    fireEvent.click(within(eveRow()).getByRole('button', { name: 'Accept' }));
    await advance(REDRAFT_TIMEOUT_MS + 1000);
    const note = await screen.findByText('Still working on it; it will show here when done.');
    expect(note.closest('[role="status"]')).toBeTruthy();
    // The buttons work again, and the message is still held: nothing has been decided.
    expect(within(eveRow()).getByRole('button', { name: 'Accept' })).toHaveProperty('disabled', false);
    expect(rows()).toHaveLength(2);
    await act(async () => { await fake.server.settle(); });
  });

  it('stops waiting when the person leaves the screen', async () => {
    const fake = createFakeDesk({ now: TEST_NOW, atomicDelayMs: 200_000 });
    const signals: (AbortSignal | undefined)[] = [];
    const watching = (api: DeskApi): DeskApi => ({
      ...api,
      waitForRun: (runId, opts) => { signals.push(opts.signal); return api.waitForRun(runId, opts); },
    });
    renderDesk(<Desk />, { fake, api: watching });
    await waitFor(() => expect(rows()).toHaveLength(2));
    fireEvent.click(within(eveRow()).getByRole('button', { name: 'Accept' }));
    await advance(1000);
    expect(signals).toHaveLength(1);
    expect(signals[0]?.aborted).toBe(false);
    // Leaving the screen ends the wait; the run itself carries on.
    fireEvent.click(screen.getByRole('button', { name: /^Contacts/ }));
    expect(signals[0]?.aborted).toBe(true);
    await act(async () => { await fake.server.settle(); });
  });

  it('keeps ⇧N working here, and says why when it can not', async () => {
    const seed = createSeed(TEST_NOW);
    renderDesk(<Desk />, { fake: createFakeDesk({ now: TEST_NOW, seed: { ...seed, tasks: seed.tasks.filter((t) => t.claimedBy) } }) });
    await waitFor(() => expect(rows()).toHaveLength(2));
    fireEvent.keyDown(document.body, { key: 'N', shiftKey: true });
    expect(await screen.findByText('Nothing left to claim in your pools.')).toBeTruthy();
    expect(window.location.pathname).toBe('/held');
  });
});
