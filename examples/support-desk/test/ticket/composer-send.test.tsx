// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeskError, type DeskApi, type RunResult } from '../../src/api/desk-api.js';
import { createFakeDesk } from '../../src/api/fake.js';
import { DEMO_PEOPLE } from '../../src/api/seed.js';
import { Desk } from '../../src/shell/Desk.js';
import { renderDesk, TEST_NOW } from '../support/render.js';

const ANA = '30000000-0000-4000-8000-000000000002';
const PRIYA = '30000000-0000-4000-8000-000000000003';
const DRAFT = '40000000-0000-4000-8000-000000000005';

beforeEach(() => {
  // Fake timers that also move with real time, so queries settle while the countdown can be skipped.
  // The seed is dated from TEST_NOW; a message written in a test is too, whatever this machine's clock says.
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
const ticketStatus = (fake: ReturnType<typeof createFakeDesk>, id = ANA) => fake.server.records('ticket').find((t) => t.id === id)?.body.status;
const pressedTwiceInOneTick = () => act(() => {
  for (let i = 0; i < 2; i++) document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', metaKey: true, bubbles: true }));
});

describe('sending', () => {
  it('counts down ten seconds, sends once however often Send is pressed, and clears the composer', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    fireEvent.click(sendButton());
    expect(await screen.findByText(/^Sending to Ana Lima in 10 s\.$/)).toBeTruthy();
    fireEvent.keyDown(box(), { key: 'Enter', metaKey: true });
    fireEvent.click(sendButton());
    expect(box().readOnly).toBe(true);
    await advance(10_000);
    await screen.findByText('Sent.');
    expect(sends(fake)).toHaveLength(1);
    expect(fake.server.records('reply').find((r) => r.id === DRAFT)?.body).toMatchObject({ status: 'sent', author_user: DEMO_PEOPLE.bo });
    await waitFor(() => expect(box().value).toBe(''));
  });

  it('sends once when the key is pressed twice in the same instant, before the page has drawn anything', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    pressedTwiceInOneTick();
    await screen.findByText(/^Sending to Ana Lima in 10 s\.$/);
    await advance(10_000);
    await screen.findByText('Sent.');
    expect(sends(fake)).toHaveLength(1);
  });

  it('does not let a press made twice at once leave a countdown behind that sends early after an Undo', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    pressedTwiceInOneTick();
    await screen.findByRole('button', { name: 'Undo' });
    await advance(5000);
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    fireEvent.click(sendButton()); // a new countdown of ten seconds
    await screen.findByRole('button', { name: 'Undo' });
    await advance(6000); // the first press's ten seconds are up; this one's are not
    expect(sends(fake)).toHaveLength(0);
    await advance(5000);
    await screen.findByText('Sent.');
    expect(sends(fake)).toHaveLength(1);
  });

  it('sends nothing when undone', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    fireEvent.click(sendButton());
    fireEvent.click(await screen.findByRole('button', { name: 'Undo' }));
    await advance(15_000);
    expect(sends(fake)).toHaveLength(0);
    expect(box().readOnly).toBe(false);
  });

  it('sends at once when the desk is left during the countdown', async () => {
    const { fake, unmount } = renderDesk(<Desk />);
    await opened();
    fireEvent.click(sendButton());
    await screen.findByRole('button', { name: 'Undo' });
    expect(sends(fake)).toHaveLength(0);
    unmount();
    await waitFor(() => expect(sends(fake)).toHaveLength(1));
    await act(async () => { await fake.server.settle(); });
    await advance(15_000);
    expect(sends(fake)).toHaveLength(1);
  });

  it('does not start a countdown when the page was closed while the draft was being saved', async () => {
    const slow = (api: DeskApi): DeskApi => ({
      ...api,
      saveDraft: async (...args) => { await new Promise((r) => setTimeout(r, 1500)); return api.saveDraft(...args); },
    });
    const { fake, unmount } = renderDesk(<Desk />, { api: slow });
    await opened();
    fireEvent.change(box(), { target: { value: 'Typed just before sending' } });
    fireEvent.click(sendButton()); // saves first, which takes a while
    await advance(300);
    unmount();
    await advance(30_000);
    expect(sends(fake)).toHaveLength(0);
  });

  it('asks before the page is left during the countdown, and not otherwise', async () => {
    renderDesk(<Desk />);
    await opened();
    const leave = () => { const e = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(e); return e.defaultPrevented; };
    expect(leave()).toBe(false);
    fireEvent.click(sendButton());
    await screen.findByRole('button', { name: 'Undo' });
    await act(async () => {}); // the guard is set up by an effect, which runs just after the countdown is drawn
    expect(leave()).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(leave()).toBe(false);
  });

  it('sends and marks waiting on ⌘⇧↵, with who did it, and only once the reply is confirmed sent', async () => {
    // The send runs on a worker for two seconds: the ticket is not marked while it is still going.
    const fake = createFakeDesk({ now: TEST_NOW, atomicDelayMs: 2000 });
    renderDesk(<Desk />, { fake });
    await opened();
    fireEvent.keyDown(box(), { key: 'Enter', metaKey: true, shiftKey: true });
    expect(await screen.findByText(/then marking the ticket Waiting on customer\.$/)).toBeTruthy();
    await advance(10_000);
    expect(await screen.findByText('Sending…')).toBeTruthy();
    expect(ticketStatus(fake)).toBe('open');
    expect(fake.server.records('note').some((n) => n.body.body === 'Marked waiting on customer')).toBe(false);
    await advance(3000);
    expect(await screen.findByText('Sent. Ticket marked Waiting on customer.')).toBeTruthy();
    expect(ticketStatus(fake)).toBe('pending');
    expect(fake.server.records('note').some((n) => n.body.ticket === ANA && n.body.body === 'Marked waiting on customer' && n.body.author_user === DEMO_PEOPLE.bo)).toBe(true);
  });

  it('marks nothing, and keeps the box shut, while a send outlasts the wait, then says it went but the ticket was not marked', async () => {
    const fake = createFakeDesk({ now: TEST_NOW, atomicDelayMs: 30_000 });
    renderDesk(<Desk />, { fake });
    await opened();
    fireEvent.keyDown(box(), { key: 'Enter', metaKey: true, shiftKey: true });
    await screen.findByRole('button', { name: 'Undo' });
    await advance(10_000 + 9000); // the countdown, then the 8 s the desk waits
    expect(await screen.findByText('Still sending. The ticket wasn\'t marked; mark it when the reply shows as sent.')).toBeTruthy();
    expect(box().readOnly).toBe(true);
    expect(sendButton()).toHaveProperty('disabled', true);
    expect(ticketStatus(fake)).toBe('open');
    // The reply goes out later: the desk, still looking, sees it. The box opens, empty. The ticket stays unmarked.
    await act(async () => { await fake.server.settle(); });
    await advance(2500);
    await waitFor(() => expect(box().value).toBe(''));
    expect(box().readOnly).toBe(false);
    expect(screen.getByText('Sent, but the ticket wasn\'t marked: the reply took too long to confirm. Mark it now.')).toBeTruthy();
    expect(ticketStatus(fake)).toBe('open');
  });

  it('lets the person unlock the box when a send that outlasted the wait never lands', async () => {
    const fake = createFakeDesk({ now: TEST_NOW, atomicDelayMs: 600_000 });
    renderDesk(<Desk />, { fake });
    await opened();
    fireEvent.click(sendButton());
    await screen.findByRole('button', { name: 'Undo' });
    await advance(10_000 + 9000);
    await screen.findByText(/^Still sending\./);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText(/^Still sending\./)).toBeNull();
    expect(box().readOnly).toBe(false);
    await act(async () => { await fake.server.settle(); });
  });

  it('lets the send finish, and marks the ticket, when the desk is left once the send is under way', async () => {
    const fake = createFakeDesk({ now: TEST_NOW, atomicDelayMs: 5000 });
    const view = renderDesk(<Desk />, { fake });
    await opened();
    fireEvent.keyDown(box(), { key: 'Enter', metaKey: true, shiftKey: true });
    await screen.findByRole('button', { name: 'Undo' });
    await advance(11_000);
    expect(sends(fake)).toHaveLength(1);
    expect(ticketStatus(fake)).toBe('open');
    view.unmount();
    await act(async () => { await fake.server.settle(); });
    await advance(3000);
    expect(ticketStatus(fake)).toBe('pending');
  });

  it('says why a send-and-mark could not mark, once the reply has gone, as a sentence of its own', async () => {
    // TK-2026-0311 is solved and has no Handling task, so there is nothing to mark.
    window.history.pushState({}, '', '/f/open/t/30000000-0000-4000-8000-000000000011');
    const { fake } = renderDesk(<Desk />);
    await waitFor(() => expect(box().readOnly).toBe(false));
    fireEvent.change(box(), { target: { value: 'A word on a ticket with no task.' } });
    fireEvent.click(screen.getByRole('button', { name: 'More send options' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Send and mark Solved/ }));
    await screen.findByRole('button', { name: 'Undo' });
    await advance(10_500);
    expect(await screen.findByText('Sent, but the ticket wasn\'t marked. Your account can\'t do that here.')).toBeTruthy();
    expect(sends(fake)).toHaveLength(1);
  });

  it('remembers the option picked from the send menu as the default', async () => {
    renderDesk(<Desk />);
    await opened();
    fireEvent.click(screen.getByRole('button', { name: 'More send options' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Send and mark Solved/ }));
    expect(await screen.findByText(/then marking the ticket Solved\.$/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(window.localStorage.getItem('support-desk:send-default')).toBe('send_solved');
    fireEvent.keyDown(box(), { key: 'Enter', metaKey: true });
    expect(await screen.findByText(/then marking the ticket Solved\.$/)).toBeTruthy();
  });

  it('opens the next ticket after "Send and open next ticket", marking nothing', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    fireEvent.click(screen.getByRole('button', { name: 'More send options' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Send and open next ticket/ }));
    await screen.findByRole('button', { name: 'Undo' });
    await advance(10_000);
    await waitFor(() => expect(window.location.pathname).not.toBe(`/f/mine/t/${ANA}`));
    expect(window.location.pathname).toMatch(/^\/f\/mine\/t\//);
    expect(sends(fake)).toHaveLength(1);
    expect(ticketStatus(fake)).toBe('open');
  });

  it('pauses when the customer wrote again, and sends on Send anyway', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    act(() => {
      fake.server.write('reply', null, {
        ticket: ANA, author_kind: 'customer', status: 'received', body: 'Also, could you send it to my office?',
        posted_at: new Date(TEST_NOW.getTime() + 60_000).toISOString(), key: '<office@x>',
      });
    });
    fireEvent.click(sendButton());
    expect(await screen.findByText('Send paused.')).toBeTruthy();
    expect(screen.getByText(/^Ana Lima wrote again at /)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Send anyway' }));
    await screen.findByText(/^Sending to Ana Lima in 10 s\.$/);
    await advance(10_000);
    await screen.findByText('Sent.');
    expect(sends(fake)).toHaveLength(1);
  });

  it('redrafts with the new message instead, on request, carrying the text so far', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    const before = box().value;
    act(() => {
      fake.server.write('reply', null, {
        ticket: ANA, author_kind: 'customer', status: 'received', body: 'Office please', posted_at: new Date(TEST_NOW.getTime() + 60_000).toISOString(), key: '<o2@x>',
      });
    });
    fireEvent.click(sendButton());
    fireEvent.click(await screen.findByRole('button', { name: 'Redraft with it' }));
    await waitFor(() => expect(fake.server.runs().at(-1)).toMatchObject({
      workflow: 'draft_reply', params: { instruction: `Also answer the customer's newest message.\n\nThe draft to revise:\n${before}` },
    }));
    expect(sends(fake)).toHaveLength(0);
    await act(async () => { await fake.server.settle(); });
  });

  describe('when the send is refused', () => {
    it('says the draft changed when someone edited it during the countdown, and marks nothing', async () => {
      const { fake } = renderDesk(<Desk />);
      await opened();
      fireEvent.click(sendButton());
      await screen.findByRole('button', { name: 'Undo' });
      act(() => { fake.server.write('reply', DRAFT, { body: 'Hà rewrote it', author_user: DEMO_PEOPLE.ha }); });
      await advance(10_000);
      expect(await screen.findByText(/^Not sent: the draft changed after you opened it\./)).toBeTruthy();
      expect(ticketStatus(fake)).toBe('open');
    });

    it('marks nothing when a send-and-mark is refused: the ticket stays open and no note says otherwise', async () => {
      const { fake } = renderDesk(<Desk />);
      await opened();
      fireEvent.keyDown(box(), { key: 'Enter', metaKey: true, shiftKey: true });
      await screen.findByRole('button', { name: 'Undo' });
      act(() => { fake.server.write('reply', DRAFT, { body: 'Hà rewrote it', author_user: DEMO_PEOPLE.ha }); });
      await advance(10_000);
      expect(await screen.findByText(/^Not sent: the draft changed after you opened it\./)).toBeTruthy();
      await advance(3000);
      expect(ticketStatus(fake)).toBe('open');
      expect(fake.server.records('note').some((n) => String(n.body.body).startsWith('Marked'))).toBe(false);
      expect(fake.server.tasks().find((t) => t.ticketId === ANA)?.status).toBe('claimed');
    });

    it('says the reply was already sent when it was sent from somewhere else during the countdown', async () => {
      const { fake } = renderDesk(<Desk />);
      await opened();
      fireEvent.click(sendButton());
      await screen.findByRole('button', { name: 'Undo' });
      act(() => { fake.server.write('reply', DRAFT, { status: 'sent', key: 'outbound:elsewhere' }); });
      await advance(10_000);
      expect(await screen.findByText('Not sent: this reply was already sent.')).toBeTruthy();
    });

    it('says the draft no longer exists when it was deleted during the countdown', async () => {
      const { fake } = renderDesk(<Desk />);
      await opened();
      fireEvent.click(sendButton());
      await screen.findByRole('button', { name: 'Undo' });
      act(() => { fake.server.remove('reply', DRAFT); }); // the start then answers 422 SUBJECT_BINDING_MISMATCH
      await advance(10_000);
      expect(await screen.findByText('Not sent: this draft no longer exists.')).toBeTruthy();
      expect(sends(fake)).toHaveLength(0);
    });

    it('says the draft no longer exists when it is deleted while the send is running', async () => {
      const fake = createFakeDesk({ now: TEST_NOW, atomicDelayMs: 3000 });
      renderDesk(<Desk />, { fake });
      await opened();
      fireEvent.click(sendButton());
      await screen.findByRole('button', { name: 'Undo' });
      await advance(10_500);
      expect(sends(fake)).toHaveLength(1);
      act(() => { fake.server.remove('reply', DRAFT); });
      await advance(4000);
      expect(await screen.findByText('Not sent: this draft no longer exists.')).toBeTruthy();
    });

    it('says it did not go through, never in the run\'s own words, when the run failed and the draft is still there', async () => {
      const failing = (api: DeskApi): DeskApi => ({
        ...api,
        start: async (workflow, ...rest) => (workflow === 'send_reply'
          ? ({ state: 'done', runId: 'r', status: 'failed', output: {}, outcome: null, error: 'SMTP 550 mailbox unavailable' } satisfies RunResult)
          : api.start(workflow, ...rest)),
      });
      renderDesk(<Desk />, { api: failing });
      await opened();
      fireEvent.click(sendButton());
      await screen.findByRole('button', { name: 'Undo' });
      await advance(10_000);
      expect(await screen.findByText('Not sent: it didn\'t go through. Try again.')).toBeTruthy();
      expect(screen.queryByText(/SMTP/)).toBeNull();
    });

    it('says a network failure in the desk\'s words', async () => {
      const down = (api: DeskApi): DeskApi => ({
        ...api,
        start: (workflow, ...rest) => (workflow === 'send_reply' ? Promise.reject(new DeskError('offline', 0, 'NETWORK')) : api.start(workflow, ...rest)),
      });
      renderDesk(<Desk />, { api: down });
      await opened();
      fireEvent.click(sendButton());
      await screen.findByRole('button', { name: 'Undo' });
      await advance(10_000);
      expect(await screen.findByText('Not sent. You\'re offline. Try again when you\'re back.')).toBeTruthy();
    });
  });

  it('cannot send to a ticket with no requester', async () => {
    const { fake } = renderDesk(<Desk />);
    await opened();
    act(() => { fake.server.write('ticket', ANA, { requester: null }); });
    expect(await screen.findByText('Add a requester before sending.')).toBeTruthy();
    expect(sendButton()).toHaveProperty('disabled', true);
    fireEvent.keyDown(box(), { key: 'Enter', metaKey: true });
    await advance(12_000);
    expect(screen.queryByText(/^Sending to/)).toBeNull();
    expect(sends(fake)).toHaveLength(0);
  });

  it('says it could not check for new messages when that read fails, not that the draft is unsaved', async () => {
    let down = false;
    const { fake } = renderDesk(<Desk />, {
      api: (api) => ({ ...api, thread: (...args) => (down ? Promise.reject(new DeskError('offline', 0, 'NETWORK')) : api.thread(...args)) }),
    });
    await opened();
    down = true;
    fireEvent.click(sendButton());
    expect(await screen.findByText('Not sent: couldn\'t check for new messages. Try again.')).toBeTruthy();
    expect(screen.queryByText(/isn't saved yet/)).toBeNull();
    expect(sends(fake)).toHaveLength(0);
    expect(box().readOnly).toBe(false);
  });

  it('says autopilot would have sent a shadow-mode draft', async () => {
    window.history.pushState({}, '', `/f/mine/t/${PRIYA}`);
    renderDesk(<Desk />);
    expect(await screen.findByText('Autopilot would have sent this.')).toBeTruthy();
    expect(screen.getByText(/"Order status" is in shadow mode/)).toBeTruthy();
  });
});

describe('what cannot be done while the reply is not the person\'s to write', () => {
  it('refuses ⌘↵ and ⌘⇧↵ while a redraft is being written', async () => {
    vi.useRealTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(TEST_NOW);
    const fake = createFakeDesk({ now: TEST_NOW, draftDelayMs: 60_000 });
    renderDesk(<Desk />, { fake });
    await opened();
    fireEvent.click(screen.getByRole('button', { name: 'Shorter' }));
    await screen.findByText(/^Writing a new version/);
    fireEvent.keyDown(document.body, { key: 'Enter', metaKey: true });
    fireEvent.keyDown(document.body, { key: 'Enter', metaKey: true, shiftKey: true });
    await advance(12_000);
    expect(screen.queryByText(/^Sending to/)).toBeNull();
    expect(sends(fake)).toHaveLength(0);
    await act(async () => { await fake.server.settle(); });
  });
});

describe('what a send says afterwards', () => {
  it('can be closed with a button, so the keyboard can do it too', async () => {
    renderDesk(<Desk />);
    await opened();
    fireEvent.click(sendButton());
    await screen.findByRole('button', { name: 'Undo' });
    await advance(10_000);
    await screen.findByText('Sent.');
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Sent.')).toBeNull();
  });

  it('shows a refusal in a row that can be closed with a button', async () => {
    const down = (api: DeskApi): DeskApi => ({
      ...api,
      start: (workflow, ...rest) => (workflow === 'send_reply' ? Promise.reject(new DeskError('offline', 0, 'NETWORK')) : api.start(workflow, ...rest)),
    });
    renderDesk(<Desk />, { api: down });
    await opened();
    fireEvent.click(sendButton());
    await screen.findByRole('button', { name: 'Undo' });
    await advance(10_000);
    await screen.findByText(/^Not sent\. /);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText(/^Not sent\. /)).toBeNull();
  });
});
