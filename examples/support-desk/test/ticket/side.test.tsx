// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEMO_PEOPLE } from '../../src/api/seed.js';
import { Desk } from '../../src/shell/Desk.js';
import { renderDesk, TEST_NOW } from '../support/render.js';

const ANA = '30000000-0000-4000-8000-000000000002';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
  window.history.pushState({}, '', `/f/mine/t/${ANA}`);
});
afterEach(() => vi.useRealTimers());

const side = () => screen.getByRole('complementary', { name: 'Customer' });

const PRIYA_TICKET = '30000000-0000-4000-8000-000000000003';

describe('the side pane', () => {
  it('shows the customer, their notes and their history, as the mockup does', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(within(side()).getByText('ana@example.com')).toBeTruthy());
    expect(within(side()).getByText('Ana Lima')).toBeTruthy();
    expect(within(side()).getByText('Not set').className).toBe('faint');
    expect(within(side()).getByText('English')).toBeTruthy();
    await waitFor(() => expect(within(side()).getByText('Mar 2026 · 3 tickets')).toBeTruthy());
    expect(within(side()).getByText('Prefers email. Book club organiser; often orders 8–10 copies.')).toBeTruthy();
    const earlier = within(side()).getByRole('list', { name: 'Earlier tickets' });
    expect(within(earlier).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      expect.stringContaining('TK-2026-0311'), expect.stringContaining('TK-2026-0208'),
    ]);
    expect(within(earlier).getByText('Solved').className).toBe('pill st-solved');
  });

  it('describes this ticket: first reply, intent and pool', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(within(side()).getByText('1h 18m')).toBeTruthy());
    expect(within(side()).getByText('Order status · 94% sure')).toBeTruthy();
    expect(within(side()).getByText('High priority')).toBeTruthy();
  });

  it('opens the contact page', async () => {
    renderDesk(<Desk />);
    fireEvent.click(await within(await screen.findByRole('complementary', { name: 'Customer' })).findByRole('button', { name: 'Open contact' }));
    expect(window.location.pathname).toBe('/contacts/20000000-0000-4000-8000-000000000001');
  });

  it('changes the requester and notes who did it', async () => {
    const { fake } = renderDesk(<Desk />);
    fireEvent.click(await within(await screen.findByRole('complementary', { name: 'Customer' })).findByRole('button', { name: 'Change requester' }));
    fireEvent.change(within(side()).getByRole('combobox', { name: 'Name or email' }), { target: { value: 'Sophie' } });
    fireEvent.click(await within(side()).findByRole('option', { name: /Sophie Martin/ }));
    await waitFor(() => expect(within(side()).getByText('s.martin@orange.fr')).toBeTruthy());
    expect(fake.server.records('ticket').find((t) => t.id === ANA)?.body.requester).toBe('20000000-0000-4000-8000-000000000006');
    expect(fake.server.records('note').some((n) => n.body.body === 'Requester changed to Sophie Martin' && n.body.author_user === DEMO_PEOPLE.bo)).toBe(true);
  });

  it('adds a new contact by e-mail when none matches', async () => {
    const { fake } = renderDesk(<Desk />);
    fireEvent.click(await within(await screen.findByRole('complementary', { name: 'Customer' })).findByRole('button', { name: 'Change requester' }));
    fireEvent.change(within(side()).getByRole('combobox', { name: 'Name or email' }), { target: { value: 'new.person@example.org' } });
    fireEvent.click(await within(side()).findByRole('option', { name: 'Add new.person@example.org as a new contact' }));
    // A contact without a name shows its address as the name too.
    await waitFor(() => expect(within(side()).getAllByText('new.person@example.org')).toHaveLength(2));
    expect(fake.server.records('contact').some((c) => c.body.email === 'new.person@example.org')).toBe(true);
  });

  it('adds the address lowercased, as typed in capitals', async () => {
    const { fake } = renderDesk(<Desk />);
    fireEvent.click(await within(await screen.findByRole('complementary', { name: 'Customer' })).findByRole('button', { name: 'Change requester' }));
    fireEvent.change(within(side()).getByRole('combobox', { name: 'Name or email' }), { target: { value: '  New.Person@Example.ORG ' } });
    fireEvent.click(await within(side()).findByRole('option', { name: 'Add new.person@example.org as a new contact' }));
    await waitFor(() => expect(fake.server.records('contact').some((c) => c.body.email === 'new.person@example.org')).toBe(true));
    expect(fake.server.records('contact').some((c) => c.body.email === 'New.Person@Example.ORG')).toBe(false);
  });

  it('does not offer to add an address that already has a contact, in any case, not even while the search is out', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    renderDesk(<Desk />, {
      api: (api) => ({ ...api, contacts: async (q, cursor) => { if (q.toLowerCase().includes('@orange')) await gate; return api.contacts(q, cursor); } }),
    });
    fireEvent.click(await within(await screen.findByRole('complementary', { name: 'Customer' })).findByRole('button', { name: 'Change requester' }));
    fireEvent.change(within(side()).getByRole('combobox', { name: 'Name or email' }), { target: { value: 'S.Martin@Orange.fr' } });
    // Past the typing pause, with the search still unanswered.
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(within(side()).queryByRole('option', { name: /as a new contact/ })).toBeNull();
    release();
    await within(side()).findByRole('option', { name: /Sophie Martin/ });
    expect(within(side()).queryByRole('option', { name: /as a new contact/ })).toBeNull();
  });

  it('names the intent in the desk\'s language', async () => {
    renderDesk(<Desk />, { lang: 'vi' });
    const vi = await screen.findByRole('complementary', { name: 'Khách hàng' });
    await waitFor(() => expect(within(vi).getByText('Tình trạng đơn hàng · chắc 94%')).toBeTruthy());
  });

  it('leaves the requester picker behind when another ticket is opened', async () => {
    renderDesk(<Desk />);
    fireEvent.click(await within(await screen.findByRole('complementary', { name: 'Customer' })).findByRole('button', { name: 'Change requester' }));
    expect(within(side()).getByRole('combobox', { name: 'Name or email' })).toBeTruthy();
    act(() => {
      window.history.pushState({}, '', `/f/mine/t/${PRIYA_TICKET}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await waitFor(() => expect(within(side()).getByText('priya.r@outlook.com')).toBeTruthy());
    expect(within(side()).queryByRole('combobox', { name: 'Name or email' })).toBeNull();
    expect(within(side()).getByRole('button', { name: 'Change requester' })).toBeTruthy();
  });

  it('names the intent in the shadow-mode banner in the desk\'s language', async () => {
    window.history.pushState({}, '', `/f/mine/t/${PRIYA_TICKET}`);
    renderDesk(<Desk />, { lang: 'vi' });
    expect(await screen.findByText(/"Tình trạng đơn hàng" đang ở chế độ thử/)).toBeTruthy();
  });
});
