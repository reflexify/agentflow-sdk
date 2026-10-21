// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeskError, type DeskApi } from '../../src/api/desk-api.js';
import { createFakeDesk } from '../../src/api/fake.js';
import { createSeed, DEMO_PEOPLE } from '../../src/api/seed.js';
import { usePresence } from '../../src/live/live-context.js';
import { Desk } from '../../src/shell/Desk.js';
import { HA, renderDesk, TEST_NOW } from '../support/render.js';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
  window.history.pushState({}, '', '/f/mine');
});
afterEach(() => vi.useRealTimers());

const rows = () => within(screen.getByRole('listbox', { name: 'Tickets' })).getAllByRole('option');
const T = (n: number) => `30000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const fold = (name: RegExp) => screen.getByRole('button', { name });

describe('the queue', () => {
  it('lists my tickets by SLA, with the badges and chips from the mockup', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(rows()).toHaveLength(6));
    const first = rows()[0]!;
    expect(within(first).getByText('Trần Minh Khoa')).toBeTruthy();
    expect(within(first).getByText('−18m').className).toBe('sla over');
    expect(within(first).getByText('AI draft')).toBeTruthy();
    const ana = rows()[1]!;
    expect(within(ana).getByText('42m').className).toBe('sla soon');
    expect(within(ana).getByText('1 held')).toBeTruthy();
    expect(screen.getByText('6 tickets · 1 overdue')).toBeTruthy();
    expect(screen.getByText('Autopilot would have sent')).toBeTruthy();
    expect(screen.getByText('Possible duplicate')).toBeTruthy();
  });

  it('moves with J and K and opens with Enter', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(rows()).toHaveLength(6));
    fireEvent.keyDown(document.body, { key: 'j' });
    fireEvent.keyDown(document.body, { key: 'Enter' });
    expect(window.location.pathname).toMatch(/^\/f\/mine\/t\/30000000-0000-4000-8000-000000000002$/);
    expect(rows()[1]!.getAttribute('aria-selected')).toBe('true');
  });

  it('claims the next ticket due with ⇧N and opens it in Mine', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(rows()).toHaveLength(6));
    fireEvent.keyDown(document.body, { key: 'N', shiftKey: true });
    await waitFor(() => expect(rows()).toHaveLength(7));
    expect(window.location.pathname).toBe('/f/mine/t/30000000-0000-4000-8000-000000000008');
  });

  it('rings a ticket someone else is viewing', async () => {
    const { live } = renderDesk(<Desk />);
    await waitFor(() => expect(rows()).toHaveLength(6));
    act(() => live.setPresence('30000000-0000-4000-8000-000000000002', [HA.id]));
    const ring = await within(rows()[1]!).findByTitle('Hà Nguyễn is viewing');
    expect(ring.className).toContain('viewing');
    expect(ring.textContent).toBe('HN');
  });

  it('says the queue is clear when nothing is mine', async () => {
    const seed = createSeed(TEST_NOW);
    renderDesk(<Desk />, { fake: createFakeDesk({ now: TEST_NOW, seed: { ...seed, tasks: seed.tasks.filter((t) => !t.claimedBy) } }) });
    expect(await screen.findByText('Nothing waiting on you')).toBeTruthy();
    expect(screen.getByText(/2 tickets are waiting on customers\. The next SLA in your pools is due in 2h 30m\./)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Check held messages · 2' }));
    expect(window.location.pathname).toBe('/held');
  });
});

describe('Queue clear', () => {
  const noneMine = (dueMinutes?: number) => {
    const seed = createSeed(TEST_NOW);
    const tasks = seed.tasks.filter((t) => !t.claimedBy)
      .map((t) => (dueMinutes === undefined ? t : { ...t, dueAt: new Date(TEST_NOW.getTime() + dueMinutes * 60_000).toISOString() }));
    return createFakeDesk({ now: TEST_NOW, seed: { ...seed, tasks } });
  };

  it('says an SLA that has already passed is overdue, not due', async () => {
    renderDesk(<Desk />, { fake: noneMine(-30) });
    expect(await screen.findByText(/The next SLA in your pools is overdue by 30m\./)).toBeTruthy();
    expect(screen.queryByText(/is due in/)).toBeNull();
  });

  it('says so in Vietnamese too', async () => {
    renderDesk(<Desk />, { fake: noneMine(-30), lang: 'vi' });
    expect(await screen.findByText(/đã quá hạn 30m\./)).toBeTruthy();
  });

  it('claims the next ticket with ⇧N from here too, which the queue pane is not around to do', async () => {
    renderDesk(<Desk />, { fake: noneMine() });
    await screen.findByText('Nothing waiting on you');
    fireEvent.keyDown(document.body, { key: 'N', shiftKey: true });
    await waitFor(() => expect(rows()).toHaveLength(1));
    expect(window.location.pathname).toBe(`/f/mine/t/${T(8)}`);
  });
});

describe('⇧N outside the queue', () => {
  it('claims the next ticket from another screen and opens it in Mine', async () => {
    window.history.pushState({}, '', '/held');
    renderDesk(<Desk />);
    await screen.findByRole('heading', { name: 'Held messages' });
    fireEvent.keyDown(document.body, { key: 'N', shiftKey: true });
    await waitFor(() => expect(window.location.pathname).toBe(`/f/mine/t/${T(8)}`));
    await waitFor(() => expect(rows()).toHaveLength(7));
  });

  it('says when there is nothing left to claim, wherever the person is', async () => {
    window.history.pushState({}, '', '/contacts');
    const seed = createSeed(TEST_NOW);
    renderDesk(<Desk />, { fake: createFakeDesk({ now: TEST_NOW, seed: { ...seed, tasks: seed.tasks.filter((t) => t.claimedBy) } }) });
    fireEvent.keyDown(document.body, { key: 'N', shiftKey: true });
    expect((await screen.findByText('Nothing left to claim in your pools.')).getAttribute('role')).toBe('status');
    expect(window.location.pathname).toBe('/contacts');
    // It was said about where the person was; it goes when they go somewhere else.
    fireEvent.click(fold(/^Mine/));
    await waitFor(() => expect(screen.queryByText('Nothing left to claim in your pools.')).toBeNull());
  });
});

describe('the other folders', () => {
  it('lists the unclaimed tickets, the one due first on top', async () => {
    window.history.pushState({}, '', '/f/unclaimed');
    renderDesk(<Desk />);
    await waitFor(() => expect(rows()).toHaveLength(2));
    expect(within(rows()[0]!).getByText('Cancel my order please')).toBeTruthy();
    expect(within(rows()[1]!).getByText('Book arrived damaged')).toBeTruthy();
  });

  it('lists the tickets waiting on the customer, longest wait first, and says for how long', async () => {
    window.history.pushState({}, '', '/f/waiting');
    renderDesk(<Desk />);
    await waitFor(() => expect(rows()).toHaveLength(2));
    expect((screen.getByRole('combobox', { name: 'Sort' }) as HTMLSelectElement).value).toBe('waiting');
    expect(within(rows()[0]!).getByText('Waiting for invoice')).toBeTruthy();
    expect(within(rows()[0]!).getByText('waiting on customer 2d')).toBeTruthy();
  });

  it('lists every open ticket, newest change first', async () => {
    window.history.pushState({}, '', '/f/open');
    renderDesk(<Desk />);
    await waitFor(() => expect(rows()).toHaveLength(8));
    expect((screen.getByRole('combobox', { name: 'Sort' }) as HTMLSelectElement).value).toBe('newest');
  });

  it('starts each folder with its own sort, not the last one chosen', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(rows()).toHaveLength(6));
    fireEvent.change(screen.getByRole('combobox', { name: 'Sort' }), { target: { value: 'newest' } });
    fireEvent.click(fold(/^Waiting on customer/));
    await waitFor(() => expect(rows()).toHaveLength(2));
    expect((screen.getByRole('combobox', { name: 'Sort' }) as HTMLSelectElement).value).toBe('waiting');
  });

  it('sorts by the longest wait when asked', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(rows()).toHaveLength(6));
    fireEvent.change(screen.getByRole('combobox', { name: 'Sort' }), { target: { value: 'waiting' } });
    expect(within(rows()[0]!).getByText('Marco Bellini')).toBeTruthy();
    expect(within(rows()[1]!).getByText('Lan Phạm')).toBeTruthy();
  });

  it('lists the tickets that mention me, and counts a mention as read once I have looked', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(within(fold(/^Mentions/)).getByText('1')).toBeTruthy());
    fireEvent.click(fold(/^Mentions/));
    await waitFor(() => expect(rows()).toHaveLength(1));
    expect(within(rows()[0]!).getByText('Where is my order? It was due Friday')).toBeTruthy();
    await waitFor(() => expect(window.localStorage.getItem(`support-desk:mentions-seen:${DEMO_PEOPLE.bo}`)).toBeTruthy());
    // The badge goes while the person is reading the mentions, not only once they leave.
    await waitFor(() => expect(within(fold(/^Mentions/)).queryByText('1')).toBeNull());
    fireEvent.click(fold(/^Mine/));
    await waitFor(() => expect(rows()).toHaveLength(6));
    expect(within(fold(/^Mentions/)).queryByText('1')).toBeNull();
  });
});

describe('Next ticket', () => {
  const pools = (keep: (claimedBy: string | null) => boolean) => {
    const seed = createSeed(TEST_NOW);
    return createFakeDesk({ now: TEST_NOW, seed: { ...seed, tasks: seed.tasks.filter((t) => keep(t.claimedBy)) } });
  };

  it('says so when nothing is left to claim', async () => {
    renderDesk(<Desk />, { fake: pools((by) => by !== null) });
    await waitFor(() => expect(rows()).toHaveLength(6));
    fireEvent.click(screen.getByRole('button', { name: /^Next ticket/ }));
    expect((await screen.findByText('Nothing left to claim in your pools.')).getAttribute('role')).toBe('status');
    expect(rows()).toHaveLength(6);
  });

  it('tries the next claim when someone else got the ticket first', async () => {
    let claims = 0;
    renderDesk(<Desk />, {
      api: (api): DeskApi => ({
        ...api,
        claim: async (id) => {
          claims += 1;
          if (claims === 1) throw new DeskError('conflict', 409, 'ALREADY_CLAIMED');
          return api.claim(id);
        },
      }),
    });
    await waitFor(() => expect(rows()).toHaveLength(6));
    fireEvent.click(screen.getByRole('button', { name: /^Next ticket/ }));
    await waitFor(() => expect(rows()).toHaveLength(7));
    expect(claims).toBe(2);
    expect(window.location.pathname).toBe(`/f/mine/t/${T(8)}`);
  });

  it('says it could not claim when the claim fails for another reason, and can be tried again', async () => {
    renderDesk(<Desk />, {
      api: (api): DeskApi => ({ ...api, claim: async () => { throw new DeskError('offline', 0, 'NETWORK'); } }),
    });
    await waitFor(() => expect(rows()).toHaveLength(6));
    const button = screen.getByRole('button', { name: /^Next ticket/ });
    fireEvent.click(button);
    expect(await screen.findByText('Couldn\'t claim a ticket. Try again.')).toBeTruthy();
    await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false));
  });
});

describe('the ticket pane', () => {
  function Where() {
    const names = (viewers: { name: string }[]) => viewers.map((v) => v.name).join(',');
    const second = usePresence(T(2)).viewers;
    const third = usePresence(T(3)).viewers;
    return <p data-testid="where">{`${names(second)}|${names(third)}`}</p>;
  }

  it('tells the server which ticket this person is looking at, and stops when they leave it', async () => {
    window.history.pushState({}, '', `/f/mine/t/${T(2)}`);
    renderDesk(<Desk />, { wrap: (ui) => <>{ui}<Where /></> });
    await waitFor(() => expect(screen.getByTestId('where').textContent).toBe('Bo Tran|'));
    await waitFor(() => expect(rows()).toHaveLength(6));
    fireEvent.click(within(screen.getByRole('listbox', { name: 'Tickets' })).getByText('Can I change the delivery address?'));
    await waitFor(() => expect(screen.getByTestId('where').textContent).toBe('|Bo Tran'));
  });

  it('asks for a ticket to be picked when none is open', async () => {
    renderDesk(<Desk />);
    expect(await screen.findByText(/Pick a ticket from the list, or press ⇧N/)).toBeTruthy();
  });

  it('reads a claimed ticket that is not among the open ones, and does not call the queue clear meanwhile', async () => {
    const seed = createSeed(TEST_NOW);
    const solved = (seed.records.ticket ?? []).map((t) => (t.id === T(5) ? { ...t, body: { ...t.body, status: 'solved' } } : t));
    const only = seed.tasks.filter((t) => t.ticketId === T(5));
    let flashed = false;
    const watch = new MutationObserver(() => {
      if (document.body.textContent?.includes('Nothing waiting on you')) flashed = true;
    });
    watch.observe(document.body, { childList: true, subtree: true, characterData: true });
    try {
      renderDesk(<Desk />, { fake: createFakeDesk({ now: TEST_NOW, seed: { ...seed, records: { ...seed.records, ticket: solved }, tasks: only } }) });
      await waitFor(() => expect(rows()).toHaveLength(1));
      expect(within(rows()[0]!).getByText('Marco Bellini')).toBeTruthy();
      expect(flashed).toBe(false);
    } finally {
      watch.disconnect();
    }
  });
});

describe('moving through the list', () => {
  it('keeps the selected row on screen', async () => {
    const scrolled: Element[] = [];
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function scrollIntoView(this: Element, arg?: boolean | ScrollIntoViewOptions) {
      expect(arg).toEqual({ block: 'nearest' });
      scrolled.push(this);
    };
    try {
      renderDesk(<Desk />);
      await waitFor(() => expect(rows()).toHaveLength(6));
      scrolled.length = 0;
      fireEvent.keyDown(document.body, { key: 'j' });
      expect(scrolled).toEqual([rows()[1]]);
      fireEvent.keyDown(document.body, { key: 'j' });
      fireEvent.keyDown(document.body, { key: 'k' });
      expect(scrolled.at(-1)).toBe(rows()[1]);
    } finally {
      Element.prototype.scrollIntoView = original;
    }
  });

  it('does not lose its place when J is pressed on an empty list', async () => {
    window.history.pushState({}, '', '/f/mentions');
    const seed = createSeed(TEST_NOW);
    const { fake } = renderDesk(<Desk />, { fake: createFakeDesk({ now: TEST_NOW, seed: { ...seed, records: { ...seed.records, note: [] } } }) });
    await screen.findByText('0 tickets');
    fireEvent.keyDown(document.body, { key: 'j' });
    act(() => {
      fake.server.write('note', null, { ticket: T(2), kind: 'staff', author_user: DEMO_PEOPLE.ha, body: 'Please look', mentions: DEMO_PEOPLE.bo });
    });
    await waitFor(() => expect(rows()).toHaveLength(1));
    expect(rows()[0]!.getAttribute('aria-selected')).toBe('true');
  });
});

