// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeDesk } from '../../src/api/fake.js';
import { DeskError } from '../../src/api/desk-api.js';
import { createSeed, DEMO_PEOPLE } from '../../src/api/seed.js';
import { useContact } from '../../src/data/hooks.js';
import { Desk } from '../../src/shell/Desk.js';
import { renderDesk, TEST_NOW } from '../support/render.js';

const ANA_CONTACT = '20000000-0000-4000-8000-000000000001';
const MARCO_CONTACT = '20000000-0000-4000-8000-000000000005';

/** Shows what the desk has cached for one contact, so a test can wait for a live push to have been fetched. */
function CachedOrganization({ id }: { id: string }) {
  return <output data-testid="cached-organization">{useContact(id).data?.organization ?? ''}</output>;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => vi.useRealTimers());

const bodyRows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1);
const contactRecord = (fake: ReturnType<typeof createFakeDesk>, id: string) => fake.server.records('contact').find((c) => c.id === id);

describe('the contacts list', () => {
  beforeEach(() => window.history.pushState({}, '', '/contacts'));

  it('lists contacts with their open tickets and last message', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(bodyRows()).toHaveLength(8));
    const ana = bodyRows().find((r) => r.textContent?.includes('ana@example.com'))!;
    const cells = within(ana).getAllByRole('cell').map((c) => c.textContent);
    expect(cells).toEqual(['Ana Lima', 'ana@example.com', '—', 'English', '1', expect.stringMatching(/^Today \d\d:\d\d$/)]);
  });

  it('shows 0 and a dash for a contact with no open ticket', async () => {
    const { fake } = renderDesk(<Desk />);
    await waitFor(() => expect(bodyRows()).toHaveLength(8));
    act(() => { fake.server.write('contact', null, { email: 'quiet@example.com', name: 'Quiet Person' }); });
    await waitFor(() => expect(bodyRows()).toHaveLength(9));
    const quiet = bodyRows().find((r) => r.textContent?.includes('quiet@example.com'))!;
    expect(within(quiet).getAllByRole('cell').map((c) => c.textContent)).toEqual(['Quiet Person', 'quiet@example.com', '—', '—', '0', '—']);
  });

  it('searches by name, email or organization', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(bodyRows()).toHaveLength(8));
    fireEvent.change(screen.getByRole('textbox', { name: 'Name, email or organization' }), { target: { value: 'nguyen' } });
    await waitFor(() => expect(bodyRows()).toHaveLength(1));
    expect(bodyRows()[0]!.textContent).toContain('Lan Phạm');
  });

  it('says when no contact matches', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(bodyRows()).toHaveLength(8));
    fireEvent.change(screen.getByRole('textbox', { name: 'Name, email or organization' }), { target: { value: 'zzzz' } });
    expect(await screen.findByText('No contacts match.')).toBeTruthy();
  });

  it('shows fifty at a time and the rest on request', async () => {
    const seed = createSeed(TEST_NOW);
    for (let n = 0; n < 60; n++) seed.records.contact!.push({ id: `20000000-0000-4000-8000-9${String(n).padStart(11, '0')}`, body: { email: `bulk${n}@example.com` } });
    renderDesk(<Desk />, { fake: createFakeDesk({ now: TEST_NOW, seed }) });
    await waitFor(() => expect(bodyRows()).toHaveLength(50));
    fireEvent.click(screen.getByRole('button', { name: 'Show more' }));
    await waitFor(() => expect(bodyRows()).toHaveLength(68));
    expect(screen.queryByRole('button', { name: 'Show more' })).toBeNull();
  });

  it('opens a contact from its name', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(bodyRows()).toHaveLength(8));
    fireEvent.click(within(bodyRows().find((r) => r.textContent?.includes('ana@example.com'))!).getByRole('button', { name: 'Ana Lima' }));
    expect(window.location.pathname).toBe(`/contacts/${ANA_CONTACT}`);
  });

  it('creates a contact and opens it', async () => {
    const { fake } = renderDesk(<Desk />);
    fireEvent.click(await screen.findByRole('button', { name: 'New contact' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), { target: { value: 'kim@example.net' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Kim Le' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() => expect(window.location.pathname).toMatch(/^\/contacts\/[0-9a-f-]{36}$/));
    expect(fake.server.records('contact').find((c) => c.body.email === 'kim@example.net')?.body.name).toBe('Kim Le');
    expect(await screen.findByRole('heading', { name: 'Kim Le' })).toBeTruthy();
  });

  it('keeps the address trimmed and in lower case, the way Intake finds a contact by it', async () => {
    const { fake } = renderDesk(<Desk />);
    fireEvent.click(await screen.findByRole('button', { name: 'New contact' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), { target: { value: '  Kim.Le@Example.NET ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() => expect(window.location.pathname).toMatch(/^\/contacts\/[0-9a-f-]{36}$/));
    expect(fake.server.records('contact').map((c) => c.body.email)).toContain('kim.le@example.net');
    expect(fake.server.records('contact').map((c) => c.body.email)).not.toContain('  Kim.Le@Example.NET ');
  });

  it('asks for an address, and for one that looks like an address', async () => {
    const { fake } = renderDesk(<Desk />);
    fireEvent.click(await screen.findByRole('button', { name: 'New contact' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Enter an email address.');
    fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), { target: { value: 'kim at example' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Enter an email address.');
    expect(fake.server.records('contact')).toHaveLength(8);
  });

  it('closes the form on Cancel', async () => {
    renderDesk(<Desk />);
    fireEvent.click(await screen.findByRole('button', { name: 'New contact' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('textbox', { name: 'Email' })).toBeNull();
  });

  it('says when the address already has a contact, and links to it', async () => {
    renderDesk(<Desk />);
    fireEvent.click(await screen.findByRole('button', { name: 'New contact' }));
    // The same address in capitals is the same person.
    fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), { target: { value: 'ANA@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(await screen.findByText('A contact with this email already exists.')).toBeTruthy();
    fireEvent.click(await screen.findByRole('button', { name: 'Open it' }));
    await waitFor(() => expect(window.location.pathname).toBe(`/contacts/${ANA_CONTACT}`));
  });
});

describe('the contact page', () => {
  beforeEach(() => window.history.pushState({}, '', `/contacts/${ANA_CONTACT}`));

  it('shows the contact and their tickets', async () => {
    renderDesk(<Desk />);
    expect(await screen.findByRole('heading', { name: 'Ana Lima' })).toBeTruthy();
    await waitFor(() => expect(screen.getByText('ana@example.com · customer since Mar 2026 · 3 tickets')).toBeTruthy());
    expect((screen.getByRole('textbox', { name: 'Email' }) as HTMLInputElement).readOnly).toBe(true);
    expect((screen.getByRole('combobox', { name: 'Language' }) as HTMLSelectElement).value).toBe('en');
    const tickets = screen.getByRole('list', { name: 'Tickets' });
    expect(within(tickets).getAllByRole('listitem')).toHaveLength(3);
    expect(within(tickets).getByText('Open').className).toBe('pill st-open');
  });

  it('opens a ticket from the page', async () => {
    renderDesk(<Desk />);
    const tickets = await screen.findByRole('list', { name: 'Tickets' });
    await waitFor(() => expect(within(tickets).getAllByRole('listitem')).toHaveLength(3));
    fireEvent.click(within(tickets).getByRole('button', { name: /TK-2026-0418/ }));
    expect(window.location.pathname).toBe('/f/open/t/30000000-0000-4000-8000-000000000002');
  });

  it('goes back to all contacts', async () => {
    renderDesk(<Desk />);
    fireEvent.click(await screen.findByRole('button', { name: 'All contacts' }));
    expect(window.location.pathname).toBe('/contacts');
  });

  it('says so when the contact can not be opened, instead of loading for ever', async () => {
    window.history.pushState({}, '', '/contacts/20000000-0000-4000-8000-0000000000ff');
    renderDesk(<Desk />);
    expect((await screen.findByRole('alert')).textContent).toBe('You can\'t open this contact, or it no longer exists.');
  });

  it('says so, and keeps what was typed, when the other version can not be read after a refused save', async () => {
    let failReads = false;
    const { fake } = renderDesk(<Desk />, {
      api: (api) => ({ ...api, contact: (id) => (failReads ? Promise.reject(new DeskError('offline', 0, 'NETWORK')) : api.contact(id)) }),
    });
    const name = await screen.findByRole('textbox', { name: 'Name' });
    fireEvent.change(name, { target: { value: 'Ana M. Lima' } });
    act(() => { fake.server.write('contact', ANA_CONTACT, { organization: 'Linden Book Club' }); });
    failReads = true;
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect((await screen.findByRole('alert')).textContent).toBe('You\'re offline. Try again when you\'re back.');
    expect((screen.getByRole('textbox', { name: 'Name' }) as HTMLInputElement).value).toBe('Ana M. Lima');
    expect(contactRecord(fake, ANA_CONTACT)?.body.name).toBe('Ana Lima');
    // Back online, the same save is refused again and now shows their version.
    failReads = false;
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect((await screen.findByText(/Someone else saved this contact just now/)).getAttribute('role')).toBe('alert');
    expect(screen.queryByText('You\'re offline. Try again when you\'re back.')).toBeNull();
    await waitFor(() => expect((screen.getByRole('textbox', { name: 'Organization' }) as HTMLInputElement).value).toBe('Linden Book Club'));
  });

  it('says "1 ticket" for a contact with one', async () => {
    window.history.pushState({}, '', `/contacts/${MARCO_CONTACT}`);
    renderDesk(<Desk />);
    await screen.findByRole('heading', { name: 'Marco Bellini' });
    await waitFor(() => expect(screen.getByText(/^marco@bellini\.it · customer since .+ · 1 ticket$/)).toBeTruthy());
  });

  it('says "1 phiếu" in Vietnamese', async () => {
    window.history.pushState({}, '', `/contacts/${MARCO_CONTACT}`);
    renderDesk(<Desk />, { lang: 'vi' });
    await screen.findByRole('heading', { name: 'Marco Bellini' });
    await waitFor(() => expect(screen.getByText(/^marco@bellini\.it · khách hàng từ .+ · 1 phiếu$/)).toBeTruthy());
  });

  it('saves the team\'s notes', async () => {
    const { fake } = renderDesk(<Desk />);
    const notes = await screen.findByRole('textbox', { name: 'Notes for the team' });
    fireEvent.change(notes, { target: { value: 'Prefers email. Runs the Saturday book club.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Saved')).toBeTruthy();
    expect(contactRecord(fake, ANA_CONTACT)?.body.notes).toBe('Prefers email. Runs the Saturday book club.');
  });

  it('clears a field that was emptied, and sets the language', async () => {
    const { fake } = renderDesk(<Desk />);
    fireEvent.change(await screen.findByRole('textbox', { name: 'Notes for the team' }), { target: { value: '  ' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), { target: { value: 'fr' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Saved')).toBeTruthy();
    expect(contactRecord(fake, ANA_CONTACT)?.body).not.toHaveProperty('notes');
    expect(contactRecord(fake, ANA_CONTACT)?.body.locale).toBe('fr');
  });

  it('shows the other person\'s save instead of overwriting it', async () => {
    const { fake } = renderDesk(<Desk />);
    const name = await screen.findByRole('textbox', { name: 'Name' });
    fake.server.actAs(DEMO_PEOPLE.ha);
    fake.server.write('contact', ANA_CONTACT, { organization: 'Linden Book Club' });
    fake.server.actAs(DEMO_PEOPLE.bo);
    fireEvent.change(name, { target: { value: 'Ana M. Lima' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText(/Someone else saved this contact just now/)).toBeTruthy();
    await waitFor(() => expect((screen.getByRole('textbox', { name: 'Organization' }) as HTMLInputElement).value).toBe('Linden Book Club'));
    expect(contactRecord(fake, ANA_CONTACT)?.body.name).toBe('Ana Lima');
  });

  it('refuses a save made over a change the screen has already fetched, once something was typed', async () => {
    const { fake } = renderDesk(<Desk />, { wrap: (ui) => <><CachedOrganization id={ANA_CONTACT} />{ui}</> });
    const name = await screen.findByRole('textbox', { name: 'Name' });
    // The edit comes first, then the other person's save arrives and is fetched; the save still goes out against what the edit started from.
    fireEvent.change(name, { target: { value: 'Ana M. Lima' } });
    act(() => { fake.server.write('contact', ANA_CONTACT, { organization: 'Linden Book Club' }); });
    await waitFor(() => expect(screen.getByTestId('cached-organization').textContent).toBe('Linden Book Club'));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText(/Someone else saved this contact just now/)).toBeTruthy();
    expect(contactRecord(fake, ANA_CONTACT)?.body.name).toBe('Ana Lima');
    expect(contactRecord(fake, ANA_CONTACT)?.body.organization).toBe('Linden Book Club');
  });

  it('follows the other person\'s save while nothing has been typed, and then keeps it', async () => {
    const { fake } = renderDesk(<Desk />);
    await screen.findByRole('textbox', { name: 'Name' });
    act(() => { fake.server.write('contact', ANA_CONTACT, { organization: 'Linden Book Club' }); });
    await waitFor(() => expect((screen.getByRole('textbox', { name: 'Organization' }) as HTMLInputElement).value).toBe('Linden Book Club'));
    fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Ana M. Lima' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Saved')).toBeTruthy();
    expect(contactRecord(fake, ANA_CONTACT)?.body).toMatchObject({ name: 'Ana M. Lima', organization: 'Linden Book Club' });
  });
});
