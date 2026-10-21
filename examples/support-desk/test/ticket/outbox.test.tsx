// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeskError, type DeskApi, type RunResult } from '../../src/api/desk-api.js';
import { createFakeDesk } from '../../src/api/fake.js';
import { DEMO_PEOPLE } from '../../src/api/seed.js';
import { Desk } from '../../src/shell/Desk.js';
import { renderDesk, TEST_NOW } from '../support/render.js';

// A send belongs to the desk, not to the box it was started from: the person can go to another ticket,
// another screen, and it still goes, marks and says how it went. Only closing the page stops a countdown;
// leaving the desk (unmounting it) sends it at once.

const ANA = '30000000-0000-4000-8000-000000000002';
const DRAFT = '40000000-0000-4000-8000-000000000005';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(TEST_NOW);
  window.sessionStorage.clear();
  window.localStorage.clear();
  window.history.pushState({}, '', `/f/mine/t/${ANA}`);
});
afterEach(() => vi.useRealTimers());

const box = () => screen.getByRole('textbox', { name: 'Reply' }) as HTMLTextAreaElement;
const sendButton = () => screen.getByRole('button', { name: /^Send ⌘↵/ });
const opened = () => waitFor(() => expect(box().value).toContain('Good news'));
const sends = (fake: { server: { runs(): { workflow: string }[] } }) => fake.server.runs().filter((r) => r.workflow === 'send_reply');
const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
const ticketStatus = (fake: ReturnType<typeof createFakeDesk>) => fake.server.records('ticket').find((t) => t.id === ANA)?.body.status;
/** G then M: to Mine, with no ticket open. */
const goMine = () => { fireEvent.keyDown(document.body, { key: 'g' }); fireEvent.keyDown(document.body, { key: 'm' }); };
const leave = () => { const e = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(e); return e.defaultPrevented; };
/** The one-line bar of sends for tickets that are not open. */
const barRow = (text: RegExp | string) => screen.findByText(text).then((el) => el.closest('.undo') as HTMLElement);

describe('a send that outlives the box it was started from', () => {
  it('still goes at ten seconds when the person has gone elsewhere, and says so, with a way back', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    fireEvent.click(sendButton());
    await screen.findByRole('button', { name: 'Undo' });
    goMine();
    expect(screen.queryByRole('textbox', { name: 'Reply' })).toBeNull(); // the box is gone
    const row = await barRow(/^Sending to Ana Lima in \d+ s\.$/);
    expect(within(row).getByRole('button', { name: 'Undo' })).toBeTruthy();
    await advance(10_500);
    expect(sends(fake)).toHaveLength(1);
    const done = await barRow(/Sent\.$/);
    expect(done.textContent).toContain('Ana Lima');
    fireEvent.click(within(done).getByRole('button', { name: 'Open' }));
    expect(window.location.pathname).toBe(`/f/mine/t/${ANA}`);
    expect(await screen.findByText('Sent.')).toBeTruthy(); // the ticket's own box says it too
    await waitFor(() => expect(box().value).toBe(''));
  });

  it('still goes at ten seconds when the person clicks another ticket in the queue', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    fireEvent.click(sendButton());
    await screen.findByRole('button', { name: 'Undo' });
    fireEvent.click(screen.getByText('Priya Raman').closest('[role="option"]') as HTMLElement);
    await waitFor(() => expect(window.location.pathname).not.toBe(`/f/mine/t/${ANA}`));
    await waitFor(() => expect((screen.getByRole('textbox', { name: 'Reply' }) as HTMLTextAreaElement).value).toContain('Yes, we can change it'));
    expect(await screen.findByText(/^Sending to Ana Lima in \d+ s\.$/)).toBeTruthy(); // Priya's box has no countdown of its own
    await advance(10_500);
    expect(sends(fake)).toHaveLength(1);
    expect(fake.server.records('reply').find((r) => r.id === DRAFT)?.body.status).toBe('sent');
    expect((screen.getByRole('textbox', { name: 'Reply' }) as HTMLTextAreaElement).value).toContain('Yes, we can change it'); // hers is untouched
  });

  describe('coming back to a ticket whose "Sent." was never closed', () => {
    const visit = (id: string) => act(() => { window.history.pushState({}, '', `/f/mine/t/${id}`); window.dispatchEvent(new PopStateEvent('popstate')); });
    const newDraft = (fake: ReturnType<typeof createFakeDesk>, body: string) => act(() => {
      fake.server.write('reply', null, {
        ticket: ANA, posted_at: new Date(TEST_NOW.getTime() + 120_000).toISOString(), author_kind: 'bot', status: 'draft',
        body, ai_body: body, key: `draft:${ANA}`, autopilot: 'none',
      });
    });

    it('shows the draft written since, however often the ticket is visited, and lets the person edit it', async () => {
      const { fake } = renderDesk(<Desk />);
      await opened();
      fireEvent.click(sendButton());
      await screen.findByRole('button', { name: 'Undo' });
      await advance(10_500);
      await screen.findByText('Sent.');
      goMine();
      await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Reply' })).toBeNull());
      newDraft(fake, 'A fresh AI draft'); // the customer wrote again, and the AI answered
      await advance(1000);
      visit(ANA);
      await waitFor(() => expect(box().value).toBe('A fresh AI draft'));
      // Away and back once more, the job still saying "Sent." and never closed: the thread is cached with the new draft now.
      goMine();
      await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Reply' })).toBeNull());
      await advance(1000);
      visit(ANA);
      await advance(5000);
      expect(box().value).toBe('A fresh AI draft');
      expect(screen.getByText(/^AI draft · /)).toBeTruthy();
      // And it can be written on, with no one else's edit to ask about.
      fireEvent.change(box(), { target: { value: 'A fresh AI draft, with my edit' } });
      await advance(1500);
      expect(screen.queryByText('The AI rewrote this draft.')).toBeNull();
      expect(fake.server.records('reply').find((r) => r.body.key === `draft:${ANA}`)?.body).toMatchObject({ body: 'A fresh AI draft, with my edit', author_user: DEMO_PEOPLE.bo });
    });

    it('still clears the box of the reply that was sent, when the ticket is left and came back to before the thread has been read again', async () => {
      const { fake } = renderDesk(<Desk />);
      await opened();
      fireEvent.click(sendButton());
      await screen.findByRole('button', { name: 'Undo' });
      await advance(10_500);
      await screen.findByText('Sent.');
      goMine();
      await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Reply' })).toBeNull());
      visit(ANA);
      await advance(2000);
      expect(box().value).toBe('');
      expect(sends(fake)).toHaveLength(1);
    });
  });

  it('shows the countdown once: in the box when the ticket is open, in the bar when it is not', async () => {
    renderDesk(<Desk />);
    await opened();
    fireEvent.click(sendButton());
    await screen.findByRole('button', { name: 'Undo' });
    expect(screen.getAllByText(/^Sending to Ana Lima in \d+ s\.$/)).toHaveLength(1);
    goMine();
    await screen.findByText(/^Sending to Ana Lima in \d+ s\.$/);
    expect(screen.getAllByText(/^Sending to Ana Lima in \d+ s\.$/)).toHaveLength(1);
  });

  it('cancels from the bar with Undo, and sends nothing', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    fireEvent.click(sendButton());
    await screen.findByRole('button', { name: 'Undo' });
    goMine();
    const row = await barRow(/^Sending to Ana Lima in \d+ s\.$/);
    fireEvent.click(within(row).getByRole('button', { name: 'Undo' }));
    await advance(15_000);
    expect(sends(fake)).toHaveLength(0);
    expect(screen.queryByText(/^Sending to Ana Lima/)).toBeNull();
    expect(leave()).toBe(false);
  });

  it('still marks the ticket when the person leaves during the wait for the send', async () => {
    const fake = createFakeDesk({ now: TEST_NOW, atomicDelayMs: 2000 });
    renderDesk(<Desk />, { fake });
    await opened();
    fireEvent.keyDown(box(), { key: 'Enter', metaKey: true, shiftKey: true });
    await screen.findByRole('button', { name: 'Undo' });
    await advance(10_300); // the countdown is over, and the send is on a worker
    expect(await screen.findByText('Sending…')).toBeTruthy();
    goMine();
    expect(ticketStatus(fake)).toBe('open');
    await advance(3000);
    expect(await screen.findByText(/Sent\. Ticket marked Waiting on customer\.$/)).toBeTruthy();
    expect(ticketStatus(fake)).toBe('pending');
    expect(fake.server.records('note').some((n) => n.body.ticket === ANA && n.body.body === 'Marked waiting on customer' && n.body.author_user === DEMO_PEOPLE.bo)).toBe(true);
  });

  it('does not open the next ticket for a person who has already gone somewhere else', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    fireEvent.click(screen.getByRole('button', { name: 'More send options' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Send and open next ticket/ }));
    await screen.findByRole('button', { name: 'Undo' });
    goMine();
    await advance(10_500);
    expect(sends(fake)).toHaveLength(1);
    expect(window.location.pathname).toBe('/f/mine');
  });

  it('asks before the page is closed while a send is counting down, even from another screen', async () => {
    renderDesk(<Desk />);
    await opened();
    expect(leave()).toBe(false);
    fireEvent.click(sendButton());
    await screen.findByRole('button', { name: 'Undo' });
    goMine();
    await screen.findByText(/^Sending to Ana Lima/);
    await act(async () => {}); // the guard is set up by an effect
    expect(leave()).toBe(true);
  });

  it('sends at once what is counting down when the desk is left, and still marks it', async () => {
    const { fake, unmount } = renderDesk(<Desk />);
    await opened();
    fireEvent.keyDown(box(), { key: 'Enter', metaKey: true, shiftKey: true });
    await screen.findByRole('button', { name: 'Undo' });
    await advance(3000); // seven seconds still to go
    expect(sends(fake)).toHaveLength(0);
    // Inside AgentFlow, leaving the desk is a move to another page: no beforeunload, and the tab stays open.
    unmount();
    await waitFor(() => expect(sends(fake)).toHaveLength(1));
    await act(async () => { await fake.server.settle(); });
    await advance(3000);
    expect(ticketStatus(fake)).toBe('pending');
  });

  it('sends nothing when the desk is left after an Undo: an email sent then could not be recalled', async () => {
    const { fake, unmount } = renderDesk(<Desk />);
    await opened();
    fireEvent.click(sendButton());
    fireEvent.click(await screen.findByRole('button', { name: 'Undo' }));
    await advance(3000); // seven seconds of the countdown would still have been to go
    unmount();
    await act(async () => { await fake.server.settle(); });
    await advance(15_000); // well past where the countdown would have ended
    expect(sends(fake)).toHaveLength(0);
    expect(fake.server.records('reply').find((r) => r.id === DRAFT)?.body.status).toBe('draft');
  });

  it('lets a send under way finish when the desk is left, its mark included', async () => {
    const fake = createFakeDesk({ now: TEST_NOW, atomicDelayMs: 5000 });
    const view = renderDesk(<Desk />, { fake });
    await opened();
    fireEvent.keyDown(box(), { key: 'Enter', metaKey: true, shiftKey: true });
    await screen.findByRole('button', { name: 'Undo' });
    await advance(10_500); // the countdown is over, and the send is on a worker
    view.unmount();
    await act(async () => { await fake.server.settle(); });
    await advance(3000);
    expect(ticketStatus(fake)).toBe('pending');
    expect(fake.server.records('note').some((n) => n.body.ticket === ANA && n.body.body === 'Marked waiting on customer')).toBe(true);
  });
});

describe('leaving while the send is being checked and saved', () => {
  it('still starts the countdown, in the bar, once the draft is saved', async () => {
    const slow = (api: DeskApi): DeskApi => ({
      ...api,
      saveDraft: async (...args) => { await new Promise((r) => setTimeout(r, 1500)); return api.saveDraft(...args); },
    });
    const { fake } = renderDesk(<Desk />, { api: slow });
    await opened();
    fireEvent.change(box(), { target: { value: 'Typed just before sending' } });
    fireEvent.click(sendButton()); // saves first, which takes a while
    goMine();
    await advance(2500);
    expect(await screen.findByText(/^Sending to Ana Lima in \d+ s\.$/)).toBeTruthy();
    await advance(10_500);
    expect(sends(fake)).toHaveLength(1);
    expect(fake.server.records('reply').find((r) => r.id === DRAFT)?.body).toMatchObject({ status: 'sent', body: 'Typed just before sending' });
  });

  it('does not cancel a countdown the person started since, when the box they left finds it could not save', async () => {
    let calls = 0;
    const failing = (api: DeskApi): DeskApi => ({
      ...api,
      saveDraft: async (...args) => {
        calls++;
        if (calls === 1) { await new Promise((r) => setTimeout(r, 3000)); throw new DeskError('failed', 500, 'BOOM'); }
        return api.saveDraft(...args);
      },
    });
    const { fake } = renderDesk(<Desk />, { api: failing });
    await opened();
    fireEvent.change(box(), { target: { value: 'Typed text' } });
    fireEvent.click(sendButton()); // the first box saves, slowly, and will fail
    await waitFor(() => expect(calls).toBe(1));
    goMine();
    act(() => { window.history.pushState({}, '', `/f/mine/t/${ANA}`); window.dispatchEvent(new PopStateEvent('popstate')); });
    await waitFor(() => expect(box().value).toBe('Typed text')); // the person is back, in a new box
    await advance(1000);
    fireEvent.click(sendButton()); // and sends again: a countdown of ten seconds
    await screen.findByRole('button', { name: 'Undo' });
    await advance(3000); // the first box's save fails now, and it refuses its send
    expect(screen.getByRole('button', { name: 'Undo' })).toBeTruthy();
    expect(screen.queryByText(/^Not sent/)).toBeNull();
    await advance(10_500);
    expect(sends(fake)).toHaveLength(1);
  }, 20_000);

  it('says so, in the bar, when the customer wrote again meanwhile, and sends nothing', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    act(() => {
      fake.server.write('reply', null, {
        ticket: ANA, author_kind: 'customer', status: 'received', body: 'Wait, one more thing',
        posted_at: new Date(TEST_NOW.getTime() + 60_000).toISOString(), key: '<more@x>',
      });
    });
    fireEvent.click(sendButton());
    goMine();
    expect(await screen.findByText(/Send paused\. Ana Lima wrote again at /)).toBeTruthy();
    await advance(15_000);
    expect(sends(fake)).toHaveLength(0);
  });
});

describe('a send that is under way and cannot be followed', () => {
  const unreachable = (api: DeskApi): DeskApi => ({ ...api, waitForRun: () => Promise.reject(new DeskError('offline', 0, 'NETWORK')) });
  const startedAndWaiting = async (opts: Parameters<typeof createFakeDesk>[0] = {}, api: (a: DeskApi) => DeskApi = unreachable) => {
    const fake = createFakeDesk({ now: TEST_NOW, ...opts });
    renderDesk(<Desk />, { fake, api });
    await opened();
    fireEvent.keyDown(box(), { key: 'Enter', metaKey: true, shiftKey: true });
    await screen.findByRole('button', { name: 'Undo' });
    await advance(10_500);
    return fake;
  };

  it('is "still sending", not "not sent", when only the reading of it failed, and the box stays shut', async () => {
    const fake = await startedAndWaiting();
    expect(await screen.findByText('Still sending. The ticket wasn\'t marked; mark it when the reply shows as sent.')).toBeTruthy();
    expect(screen.queryByText(/^Not sent/)).toBeNull();
    expect(box().readOnly).toBe(true);
    expect(sendButton()).toHaveProperty('disabled', true);
    // The background look at the run finds it sent: said as sent but not marked (the person asked for a mark), the box open and empty.
    await advance(2500);
    expect(await screen.findByText('Sent, but the ticket wasn\'t marked: the reply took too long to confirm. Mark it now.')).toBeTruthy();
    await waitFor(() => expect(box().value).toBe(''));
    expect(box().readOnly).toBe(false);
    expect(ticketStatus(fake)).toBe('open');
  });

  it('sees from the draft alone that the reply has gone, when the run cannot be read at all', async () => {
    const blind = (api: DeskApi): DeskApi => ({ ...unreachable(api), run: async (runId) => ({ state: 'running', runId }) });
    const fake = await startedAndWaiting({}, blind);
    await screen.findByText(/^Still sending\./);
    await advance(2500);
    expect(await screen.findByText('Sent, but the ticket wasn\'t marked: the reply took too long to confirm. Mark it now.')).toBeTruthy();
    await waitFor(() => expect(box().value).toBe(''));
    expect(ticketStatus(fake)).toBe('open'); // not known in time, so not marked
  });

  it('does not open the next ticket for a send that was only known to have gone late', async () => {
    const fake = createFakeDesk({ now: TEST_NOW });
    renderDesk(<Desk />, { fake, api: unreachable });
    await opened();
    fireEvent.click(screen.getByRole('button', { name: 'More send options' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Send and open next ticket/ }));
    await screen.findByRole('button', { name: 'Undo' });
    await advance(10_500);
    await screen.findByText(/^Still sending\./);
    await advance(2500);
    // Nothing was asked to be marked, so there is nothing to say was missed.
    expect(await screen.findByText('Sent.')).toBeTruthy();
    expect(window.location.pathname).toBe(`/f/mine/t/${ANA}`);
  });

  it('is "still sending", with a way out, when the start never answers', async () => {
    const mute = (api: DeskApi): DeskApi => ({ ...api, start: (workflow, ...rest) => (workflow === 'send_reply' ? new Promise<RunResult>(() => undefined) : api.start(workflow, ...rest)) });
    const fake = createFakeDesk({ now: TEST_NOW });
    renderDesk(<Desk />, { fake, api: mute });
    await opened();
    fireEvent.click(sendButton());
    await screen.findByRole('button', { name: 'Undo' });
    await advance(10_500);
    expect(await screen.findByText('Sending…')).toBeTruthy();
    await advance(8500); // the 8 seconds the desk waits for an answer
    expect(await screen.findByText(/^Still sending\./)).toBeTruthy();
    expect(box().readOnly).toBe(true);
    goMine();
    expect(await screen.findByText(/^Still sending to Ana Lima/)).toBeTruthy(); // the bar offers the way out too
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText(/^Still sending/)).toBeNull();
    expect(sends(fake)).toHaveLength(0); // it never reached the server
  });

  it('follows a start whose answer comes late, once it comes', async () => {
    const slow = (api: DeskApi): DeskApi => ({
      ...api,
      start: async (workflow, ...rest) => {
        if (workflow !== 'send_reply') return api.start(workflow, ...rest);
        await new Promise((r) => setTimeout(r, 12_000));
        return api.start(workflow, ...rest);
      },
    });
    const fake = createFakeDesk({ now: TEST_NOW });
    renderDesk(<Desk />, { fake, api: slow });
    await opened();
    fireEvent.keyDown(box(), { key: 'Enter', metaKey: true, shiftKey: true });
    await screen.findByRole('button', { name: 'Undo' });
    await advance(10_500 + 8500);
    await screen.findByText(/^Still sending\./);
    await advance(6000); // the answer arrives, and the run is found done
    expect(await screen.findByText('Sent, but the ticket wasn\'t marked: the reply took too long to confirm. Mark it now.')).toBeTruthy();
    expect(sends(fake)).toHaveLength(1);
    expect(ticketStatus(fake)).toBe('open'); // known late, so not marked
  });

  it('says it did not go through when the run is found to have failed', async () => {
    const failed: RunResult = { state: 'done', runId: 'r', status: 'failed', output: {}, outcome: null, error: 'worker exploded: stack trace' };
    await startedAndWaiting({ atomicDelayMs: 600_000 }, (api) => ({ ...unreachable(api), run: async () => failed }));
    await screen.findByText(/^Still sending\./);
    await advance(2500);
    expect(await screen.findByText('Not sent: it didn\'t go through. Try again.')).toBeTruthy();
    expect(screen.queryByText(/worker exploded/)).toBeNull();
    expect(box().readOnly).toBe(false);
  });

  it('says the draft changed when it moves on while the send is unknown', async () => {
    const fake = await startedAndWaiting({ atomicDelayMs: 600_000 });
    await screen.findByText(/^Still sending\./);
    act(() => { fake.server.write('reply', DRAFT, { body: 'Hà rewrote it', author_user: DEMO_PEOPLE.ha }); });
    await advance(2500);
    expect(await screen.findByText(/^Not sent: the draft changed after you opened it\./)).toBeTruthy();
    expect(ticketStatus(fake)).toBe('open');
    await act(async () => { await fake.server.settle(); });
  });

  it('says the draft is gone when it is deleted while the send is unknown', async () => {
    const fake = await startedAndWaiting({ atomicDelayMs: 600_000 });
    await screen.findByText(/^Still sending\./);
    act(() => { fake.server.remove('reply', DRAFT); });
    await advance(2500);
    expect(await screen.findByText('Not sent: this draft no longer exists.')).toBeTruthy();
    await act(async () => { await fake.server.settle(); });
  });

  it('lets the person close what never lands, and stops looking', async () => {
    const fake = await startedAndWaiting({ atomicDelayMs: 600_000 });
    await screen.findByText(/^Still sending\./);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(box().readOnly).toBe(false);
    await advance(20_000);
    expect(screen.queryByText(/^Not sent/)).toBeNull();
    await act(async () => { await fake.server.settle(); });
  });
});
