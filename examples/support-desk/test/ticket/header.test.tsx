// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeskError, type DeskApi } from '../../src/api/desk-api.js';
import { createFakeDesk } from '../../src/api/fake.js';
import { createSeed, DEMO_PEOPLE } from '../../src/api/seed.js';
import { Desk } from '../../src/shell/Desk.js';
import { HA, renderDesk, TEST_NOW } from '../support/render.js';

const ANA = '30000000-0000-4000-8000-000000000002'; // TK-2026-0418, claimed by Bo
const MAI = '30000000-0000-4000-8000-000000000007'; // TK-2026-0434, open in the pool

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

const open = (folder: string, id: string) => window.history.pushState({}, '', `/f/${folder}/t/${id}`);
const header = () => screen.getByRole('heading', { level: 2, name: /Where is my order|Book arrived damaged|Can I change/ }).closest('.chead') as HTMLElement;

describe('the ticket header', () => {
  it('shows the ticket as the mockup does', async () => {
    open('mine', ANA);
    renderDesk(<Desk />);
    await screen.findByRole('heading', { name: 'Where is my order? It was due Friday' });
    const h = header();
    expect(within(h).getByText('TK-2026-0418')).toBeTruthy();
    expect(within(h).getByText('Open').className).toBe('pill st-open');
    expect((within(h).getByRole('combobox', { name: 'Priority' }) as HTMLSelectElement).value).toBe('high');
    expect(within(h).getByText(/^SLA 42m · due /).className).toBe('sla soon');
    expect(within(h).getByText('Claimed by you')).toBeTruthy();
    expect(within(h).getByText(/mislabelled and is being re-shipped/)).toBeTruthy();
  });

  it('marks waiting on W, with who did it, and the ticket leaves Mine', async () => {
    open('mine', ANA);
    const { fake } = renderDesk(<Desk />);
    await screen.findByRole('heading', { name: 'Where is my order? It was due Friday' });
    fireEvent.keyDown(document.body, { key: 'w' });
    await waitFor(() => expect(within(header()).getByText('Waiting on customer').className).toBe('pill st-pending'));
    const note = fake.server.records('note').find((n) => n.body.ticket === ANA && n.body.body === 'Marked waiting on customer');
    expect(note?.body.author_user).toBe(DEMO_PEOPLE.bo);
    expect(fake.server.tasks().find((t) => t.ticketId === ANA)?.status).toBe('completed');
    // ...and it has gone from the list beside it, which is Mine.
    const list = within(screen.getByRole('listbox', { name: 'Tickets' }));
    await waitFor(() => expect(list.getAllByRole('option')).toHaveLength(5));
    expect(list.queryByText('Where is my order? It was due Friday')).toBeNull();
  });

  it('claims an open ticket before marking it solved', async () => {
    open('unclaimed', MAI);
    const { fake } = renderDesk(<Desk />);
    await screen.findByRole('heading', { name: 'Book arrived damaged' });
    expect(within(header()).getByText('Unclaimed')).toBeTruthy();
    fireEvent.click(within(header()).getByRole('button', { name: /^Solved/ }));
    await waitFor(() => expect(within(header()).getByText('Solved').className).toBe('pill st-solved'));
    expect(fake.server.records('note').some((n) => n.body.ticket === MAI && n.body.author_user === DEMO_PEOPLE.bo)).toBe(true);
  });

  it('escalates to the next priority', async () => {
    open('mine', ANA);
    renderDesk(<Desk />);
    await screen.findByRole('heading', { name: 'Where is my order? It was due Friday' });
    fireEvent.click(within(header()).getByRole('button', { name: /^Escalate/ }));
    await waitFor(() => expect((within(header()).getByRole('combobox', { name: 'Priority' }) as HTMLSelectElement).value).toBe('urgent'));
  });

  it('changes the priority and leaves an event note by the person', async () => {
    open('mine', ANA);
    const { fake } = renderDesk(<Desk />);
    await screen.findByRole('heading', { name: 'Where is my order? It was due Friday' });
    fireEvent.change(within(header()).getByRole('combobox', { name: 'Priority' }), { target: { value: 'urgent' } });
    await waitFor(() => expect(fake.server.records('note').some((n) => n.body.body === 'Priority changed to urgent' && n.body.author_user === DEMO_PEOPLE.bo)).toBe(true));
    expect(fake.server.records('ticket').find((t) => t.id === ANA)?.body.priority).toBe('urgent');
  });

  it('releases the ticket back to the pool', async () => {
    open('mine', ANA);
    const { fake } = renderDesk(<Desk />);
    await screen.findByRole('heading', { name: 'Where is my order? It was due Friday' });
    fireEvent.click(within(header()).getByRole('button', { name: 'Release' }));
    await waitFor(() => expect(within(header()).getByText('Unclaimed')).toBeTruthy());
    expect(within(header()).getByRole('button', { name: 'Claim' })).toBeTruthy();
    expect(fake.server.tasks().find((t) => t.ticketId === ANA)).toMatchObject({ status: 'open', claimedBy: null });
  });

  it('hands over to a teammate', async () => {
    open('mine', ANA);
    const { fake } = renderDesk(<Desk />);
    await screen.findByRole('heading', { name: 'Where is my order? It was due Friday' });
    fireEvent.click(within(header()).getByRole('button', { name: 'Hand over…' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: /^Hà Nguyễn/ }));
    await waitFor(() => expect(within(header()).getByText('Not in your queue')).toBeTruthy());
    expect(fake.server.tasks().find((t) => t.ticketId === ANA)?.claimedBy).toBe(DEMO_PEOPLE.ha);
    expect(within(header()).queryByRole('button', { name: /^Solved/ })).toBeNull();
  });

  it('lists this ticket\'s actions first in the palette', async () => {
    open('mine', ANA);
    renderDesk(<Desk />);
    await screen.findByRole('heading', { name: 'Where is my order? It was due Friday' });
    fireEvent.keyDown(document.body, { key: 'k', metaKey: true });
    expect(await screen.findByText('Actions on TK-2026-0418')).toBeTruthy();
    expect(screen.getByRole('option', { name: /Mark Waiting on customer/ })).toBeTruthy();
  });

  it('says a ticket someone else handles is not in your queue', async () => {
    const seed = createSeed(TEST_NOW);
    seed.tasks = seed.tasks.map((t) => (t.ticketId === '30000000-0000-4000-8000-000000000003' ? { ...t, claimedBy: DEMO_PEOPLE.ha } : t));
    open('open', '30000000-0000-4000-8000-000000000003');
    renderDesk(<Desk />, { fake: createFakeDesk({ now: TEST_NOW, seed }) });
    await screen.findByRole('heading', { name: 'Can I change the delivery address?' });
    expect(within(header()).getByText('Not in your queue')).toBeTruthy();
    expect(within(header()).queryByRole('button', { name: /^Solved/ })).toBeNull();
  });
});

describe('when an action does not go through', () => {
  const ready = async (opts: Parameters<typeof renderDesk>[1] = {}) => {
    open('mine', ANA);
    const view = renderDesk(<Desk />, opts);
    await screen.findByRole('heading', { name: 'Where is my order? It was due Friday' });
    return view;
  };

  it('says so in plain words and lets the person try again', async () => {
    let refuse = true;
    await ready({
      api: (api): DeskApi => ({
        ...api,
        submit: async (...args) => {
          if (refuse) throw new DeskError('conflict', 409, 'ALREADY_COMPLETED', 'HTTP 409 conflict');
          return api.submit(...args);
        },
      }),
    });
    fireEvent.click(within(header()).getByRole('button', { name: /^Solved/ }));
    expect((await screen.findByRole('alert')).textContent).toBe('Someone else got there first.');
    await waitFor(() => expect((within(header()).getByRole('button', { name: /^Solved/ }) as HTMLButtonElement).disabled).toBe(false));
    refuse = false;
    fireEvent.click(within(header()).getByRole('button', { name: /^Solved/ }));
    await waitFor(() => expect(within(header()).getByText('Solved').className).toBe('pill st-solved'));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('does not carry an error over to another ticket, even one already loaded', async () => {
    const CHANGE = '30000000-0000-4000-8000-000000000003';
    open('mine', CHANGE);
    renderDesk(<Desk />, { api: (api): DeskApi => ({ ...api, submit: async () => { throw new DeskError('offline', 0, 'NETWORK'); } }) });
    await screen.findByRole('heading', { level: 2, name: 'Can I change the delivery address?' });
    const list = () => within(screen.getByRole('listbox', { name: 'Tickets' }));
    await waitFor(() => expect(list().getAllByRole('option')).toHaveLength(6));
    fireEvent.click(list().getByText('Trần Minh Khoa'));
    await screen.findByRole('heading', { level: 2, name: 'Charged twice for order #88213' });
    fireEvent.keyDown(document.body, { key: 'w' });
    expect((await screen.findByRole('alert')).textContent).toBe('You\'re offline. Try again when you\'re back.');
    fireEvent.click(list().getByText('Priya Raman'));
    await screen.findByRole('heading', { level: 2, name: 'Can I change the delivery address?' });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('ignores a second press while the first is still going', async () => {
    let release!: () => void;
    const submit = vi.fn();
    await ready({
      api: (api): DeskApi => ({
        ...api,
        submit: async (...args) => {
          submit();
          await new Promise<void>((resolve) => { release = resolve; });
          return api.submit(...args);
        },
      }),
    });
    fireEvent.keyDown(document.body, { key: 'w' });
    await waitFor(() => expect(submit).toHaveBeenCalledOnce());
    fireEvent.keyDown(document.body, { key: 'w' });
    fireEvent.keyDown(document.body, { key: 's' });
    expect(submit).toHaveBeenCalledOnce();
    expect((within(header()).getByRole('button', { name: /^Escalate/ }) as HTMLButtonElement).disabled).toBe(true);
    await act(async () => { release(); });
    await waitFor(() => expect(within(header()).getByText('Waiting on customer').className).toBe('pill st-pending'));
  });

  it('keeps the ticket with the person when a hand over is refused, and says why', async () => {
    const { fake } = await ready({
      api: (api): DeskApi => ({ ...api, handOver: async () => { throw new DeskError('forbidden', 403, 'NOT_A_CANDIDATE'); } }),
    });
    fireEvent.click(within(header()).getByRole('button', { name: 'Hand over…' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: /^Hà Nguyễn/ }));
    expect((await screen.findByRole('alert')).textContent).toBe('Your account can\'t do that here.');
    expect(within(header()).getByText('Claimed by you')).toBeTruthy();
    expect(fake.server.tasks().find((t) => t.ticketId === ANA)?.claimedBy).toBe(DEMO_PEOPLE.bo);
  });

  it('shows the priority the server has, not the one that was refused', async () => {
    await ready({
      api: (api): DeskApi => ({ ...api, updateTicket: async () => { throw new DeskError('stale', 412, 'VERSION_MISMATCH'); } }),
    });
    fireEvent.change(within(header()).getByRole('combobox', { name: 'Priority' }), { target: { value: 'low' } });
    expect((await screen.findByRole('alert')).textContent).toBe('Someone else changed this just now. It has been reloaded.');
    expect((within(header()).getByRole('combobox', { name: 'Priority' }) as HTMLSelectElement).value).toBe('high');
  });

  it('does nothing, and says nothing, when S is pressed on a ticket that is not in the queue', async () => {
    const seed = createSeed(TEST_NOW);
    seed.tasks = seed.tasks.map((t) => (t.ticketId === ANA ? { ...t, claimedBy: DEMO_PEOPLE.ha } : t));
    const submit = vi.fn();
    await ready({
      fake: createFakeDesk({ now: TEST_NOW, seed }),
      api: (api): DeskApi => ({ ...api, submit: async (...args) => { submit(); return api.submit(...args); } }),
    });
    fireEvent.keyDown(document.body, { key: 's' });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(submit).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('the rest of the header', () => {
  const ready = async (opts: Parameters<typeof renderDesk>[1] = {}) => {
    const view = renderDesk(<Desk />, opts);
    await screen.findByRole('heading', { level: 2, name: /Where is my order|Book arrived damaged/ });
    return view;
  };

  it('says when the pool changes, next to the priority, for a ticket the person can mark', async () => {
    open('mine', ANA);
    await ready();
    const hint = within(header()).getByText('The pool changes after this ticket is marked. Escalate moves it now.');
    expect(within(header()).getByRole('combobox', { name: 'Priority' }).getAttribute('aria-describedby')).toBe(hint.id);
  });

  it('keeps the hint to its first sentence where the ticket has a task the person cannot mark', async () => {
    open('mine', ANA);
    await ready({
      api: (api): DeskApi => ({
        ...api,
        handlingTasks: async () => (await api.handlingTasks()).map((t) => (t.ticketId === ANA ? { ...t, status: 'claimed', claimedByUserId: DEMO_PEOPLE.ha } : t)),
      }),
    });
    expect(within(header()).getByText('The pool changes after this ticket is marked.')).toBeTruthy();
    expect(within(header()).queryByText(/Escalate moves it now/)).toBeNull();
    expect(within(header()).queryByRole('button', { name: /^Escalate/ })).toBeNull();
  });

  it('leaves the hint out where there is nothing to mark', async () => {
    const seed = createSeed(TEST_NOW);
    seed.tasks = seed.tasks.map((t) => (t.ticketId === ANA ? { ...t, claimedBy: DEMO_PEOPLE.ha } : t));
    open('mine', ANA);
    await ready({ fake: createFakeDesk({ now: TEST_NOW, seed }) });
    expect(within(header()).queryByText(/The pool changes/)).toBeNull();
    expect(within(header()).getByRole('combobox', { name: 'Priority' }).getAttribute('aria-describedby')).toBeNull();
  });

  it('rings the people viewing the ticket', async () => {
    open('mine', ANA);
    const { live } = await ready();
    act(() => live.setPresence(ANA, [HA.id]));
    const people = within(header()).getByLabelText('People on this ticket');
    expect((await within(people).findByTitle('Hà Nguyễn is viewing')).textContent).toBe('HN');
    expect(within(people).getAllByTitle(/^Hà Nguyễn is/)).toHaveLength(1);
  });

  it('claims and releases from the palette too', async () => {
    open('unclaimed', MAI);
    const { fake } = await ready();
    fireEvent.keyDown(document.body, { key: 'k', metaKey: true });
    fireEvent.click(await screen.findByRole('option', { name: /Claim this ticket/ }));
    await waitFor(() => expect(within(header()).getByText('Claimed by you')).toBeTruthy());
    expect(fake.server.tasks().find((t) => t.ticketId === MAI)?.claimedBy).toBe(DEMO_PEOPLE.bo);
    fireEvent.keyDown(document.body, { key: 'k', metaKey: true });
    fireEvent.click(await screen.findByRole('option', { name: /Release this ticket/ }));
    await waitFor(() => expect(within(header()).getByText('Unclaimed')).toBeTruthy());
  });

  it('marks from the palette', async () => {
    open('mine', ANA);
    await ready();
    fireEvent.keyDown(document.body, { key: 'k', metaKey: true });
    fireEvent.click(await screen.findByRole('option', { name: /Mark Waiting on customer/ }));
    await waitFor(() => expect(within(header()).getByText('Waiting on customer').className).toBe('pill st-pending'));
  });

  it('reads in Vietnamese', async () => {
    open('mine', ANA);
    await ready({ lang: 'vi' });
    expect(within(header()).getByText('Đang mở').className).toBe('pill st-open');
    expect(within(header()).getByRole('combobox', { name: 'Ưu tiên' })).toBeTruthy();
    expect(within(header()).getByText('Bạn đã nhận')).toBeTruthy();
    expect(within(header()).getByRole('button', { name: /^Chuyển cấp/ })).toBeTruthy();
  });
});

describe('when the customer wrote while the person was working', () => {
  const customerWrote = (fake: ReturnType<typeof createFakeDesk>) =>
    act(() => { fake.server.write('ticket', ANA, { last_customer_at: new Date(TEST_NOW.getTime() + 60_000).toISOString() }); });

  it.each([['w', 'Waiting on customer'], ['s', 'Solved']])('says it was not marked on %s, leaves the ticket open, and shows the fresh task', async (key) => {
    open('mine', ANA);
    const { fake } = renderDesk(<Desk />);
    await screen.findByRole('heading', { name: 'Where is my order? It was due Friday' });
    customerWrote(fake);
    fireEvent.keyDown(document.body, { key });
    expect((await screen.findByRole('alert')).textContent)
      .toBe('Not marked: the customer wrote while you were working. Their message is in the thread.');
    expect(within(header()).getByText('Open').className).toBe('pill st-open');
    // The old task is done; the message that arrived opened a new one, in the pool.
    await waitFor(() => expect(within(header()).getByText('Unclaimed')).toBeTruthy());
    expect(fake.server.tasks().filter((t) => t.ticketId === ANA).map((t) => t.status)).toEqual(['completed', 'open']);
    expect(fake.server.records('note').some((n) => n.body.ticket === ANA && /^Marked /.test(String(n.body.body)))).toBe(false);
  });

  it('says so in Vietnamese', async () => {
    open('mine', ANA);
    const { fake } = renderDesk(<Desk />, { lang: 'vi' });
    await screen.findByRole('heading', { name: 'Where is my order? It was due Friday' });
    customerWrote(fake);
    fireEvent.keyDown(document.body, { key: 'w' });
    expect((await screen.findByRole('alert')).textContent).toMatch(/^Chưa đánh dấu: khách hàng/);
  });

  it('says nothing, and marks as asked, when the customer has been quiet', async () => {
    open('mine', ANA);
    renderDesk(<Desk />);
    await screen.findByRole('heading', { name: 'Where is my order? It was due Friday' });
    fireEvent.keyDown(document.body, { key: 'w' });
    await waitFor(() => expect(within(header()).getByText('Waiting on customer').className).toBe('pill st-pending'));
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('a ticket that cannot be read', () => {
  const GONE = '30000000-0000-4000-8000-0000000000ff';

  it('says so instead of loading for ever', async () => {
    open('mine', GONE);
    renderDesk(<Desk />);
    expect(await screen.findByText('You can\'t open this ticket, or it no longer exists.')).toBeTruthy();
    expect(screen.queryByText('Loading…')).toBeNull();
    // The list beside it still works.
    await waitFor(() => expect(within(screen.getByRole('listbox', { name: 'Tickets' })).getAllByRole('option')).toHaveLength(6));
  });

  it('says so in Vietnamese', async () => {
    open('mine', GONE);
    renderDesk(<Desk />, { lang: 'vi' });
    expect(await screen.findByText('Bạn không mở được phiếu này, hoặc phiếu không còn nữa.')).toBeTruthy();
  });

  it('says what is wrong when it is the connection rather than the ticket', async () => {
    open('mine', ANA);
    renderDesk(<Desk />, { api: (api): DeskApi => ({ ...api, ticket: async () => { throw new DeskError('offline', 0, 'NETWORK'); } }) });
    expect(await screen.findByText('You\'re offline. Try again when you\'re back.')).toBeTruthy();
    expect(screen.queryByText('You can\'t open this ticket, or it no longer exists.')).toBeNull();
  });
});

