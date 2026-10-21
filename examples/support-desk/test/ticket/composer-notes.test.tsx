// @vitest-environment jsdom
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import type { DeskApi } from '../../src/api/desk-api.js';
import { DEMO_PEOPLE } from '../../src/api/seed.js';
import { Desk } from '../../src/shell/Desk.js';
import { renderDesk } from '../support/render.js';

const ANA = '30000000-0000-4000-8000-000000000002';

beforeEach(() => {
  window.sessionStorage.clear();
  window.history.pushState({}, '', `/f/mine/t/${ANA}`);
});

const reply = () => screen.getByRole('textbox', { name: 'Reply' }) as HTMLTextAreaElement;

describe('notes', () => {
  it('writes a note with an @mention picked from the menu', async () => {
    const { fake } = renderDesk(<Desk />);
    await waitFor(() => expect(reply().value).toContain('Good news'));
    fireEvent.keyDown(document.body, { key: 'n' });
    const note = screen.getByRole('textbox', { name: 'Note' }) as HTMLTextAreaElement;
    fireEvent.change(note, { target: { value: '@H', selectionStart: 2 } });
    const menu = screen.getByRole('listbox', { name: 'People to mention' });
    fireEvent.keyDown(note, { key: 'Enter' });
    expect(note.value).toBe('@Hà Nguyễn ');
    expect(within(menu).queryByText('Bo Tran')).toBeNull();
    fireEvent.change(note, { target: { value: '@Hà Nguyễn I told Ana about the re-shipment.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add note' }));
    await waitFor(() => expect(fake.server.records('note').some((n) => n.body.body === '@Hà Nguyễn I told Ana about the re-shipment.')).toBe(true));
    const saved = fake.server.records('note').find((n) => n.body.body === '@Hà Nguyễn I told Ana about the re-shipment.')!;
    expect(saved.body).toMatchObject({ kind: 'staff', author_user: DEMO_PEOPLE.bo, mentions: DEMO_PEOPLE.ha, ticket: ANA });
    await waitFor(() => expect(note.value).toBe(''));
  });

  it('keeps a half-written note for the ticket, and does not add an empty one', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(reply().value).toContain('Good news'));
    fireEvent.keyDown(document.body, { key: 'n' });
    expect(screen.getByRole('button', { name: 'Add note' })).toHaveProperty('disabled', true);
    fireEvent.change(screen.getByRole('textbox', { name: 'Note' }), { target: { value: 'Call her back' } });
    expect(window.sessionStorage.getItem(`support-desk:note:${DEMO_PEOPLE.bo}:${ANA}`)).toBe('Call her back');
  });
});

describe('notes kept in the tab', () => {
  it('are not shown to the next person who signs in to it', async () => {
    const first = renderDesk(<Desk />);
    await waitFor(() => expect(reply().value).toContain('Good news'));
    fireEvent.keyDown(document.body, { key: 'n' });
    fireEvent.change(screen.getByRole('textbox', { name: 'Note' }), { target: { value: 'Bo\'s private thought' } });
    first.unmount();

    renderDesk(<Desk />, {
      api: (api): DeskApi => ({ ...api, me: async () => ({ ...(await api.me()), id: DEMO_PEOPLE.ha, displayName: 'Hà Nguyễn', email: 'ha@example.com' }) }),
    });
    await waitFor(() => expect(reply().value).toContain('Good news'));
    fireEvent.keyDown(document.body, { key: 'n' });
    expect((screen.getByRole('textbox', { name: 'Note' }) as HTMLTextAreaElement).value).toBe('');
  });
});

describe('saved replies', () => {
  it('opens on /, filters, previews with the customer\'s name, and inserts on Enter', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(reply().value).toContain('Good news'));
    fireEvent.change(reply(), { target: { value: '/deliv', selectionStart: 6 } });
    expect(screen.getByText('Saved replies · "deliv"')).toBeTruthy();
    const options = within(screen.getByRole('listbox', { name: 'saved replies' })).getAllByRole('option');
    expect(options.map((o) => o.textContent)).toEqual([
      'Delivery delayed: re-shippedShipping', 'Delivery address changeShipping', 'Delivered but not receivedShipping',
    ]);
    expect(screen.getByText(/^Hi Ana, your parcel was delayed at our warehouse/)).toBeTruthy();
    fireEvent.keyDown(reply(), { key: 'Enter' });
    expect(reply().value).toMatch(/^Hi Ana, your parcel was delayed at our warehouse[\s\S]*Bo Tran, Linden Books Support$/);
  });

  it('picks with the arrow keys, and keeps the text before and after the slash', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(reply().value).toContain('Good news'));
    fireEvent.change(reply(), { target: { value: 'Thanks!\n/deliv', selectionStart: 14 } });
    fireEvent.keyDown(reply(), { key: 'ArrowDown' });
    fireEvent.keyDown(reply(), { key: 'Enter' });
    expect(reply().value).toMatch(/^Thanks!\nHi Ana, I've updated the delivery address on TK-2026-0418\./);
  });

  it('opens from the / key, and leaves a reply that has text alone', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(reply().value).toContain('Good news'));
    fireEvent.keyDown(document.body, { key: '/' });
    expect(reply().value).toContain('Good news');
    expect(screen.queryByText(/Saved replies ·/)).toBeNull();
    fireEvent.change(reply(), { target: { value: '' } });
    fireEvent.keyDown(document.body, { key: '/' });
    expect(reply().value).toBe('/');
    expect(screen.getByText('Saved replies · ""')).toBeTruthy();
  });

  it('closes on Escape and leaves the text', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(reply().value).toContain('Good news'));
    fireEvent.change(reply(), { target: { value: '/vat', selectionStart: 4 } });
    fireEvent.keyDown(reply(), { key: 'Escape' });
    expect(screen.queryByText(/Saved replies ·/)).toBeNull();
    expect(reply().value).toBe('/vat');
  });

  it('says so when nothing matches, and Enter then adds a line as usual', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(reply().value).toContain('Good news'));
    fireEvent.change(reply(), { target: { value: '/zzz', selectionStart: 4 } });
    expect(screen.getByText('No saved reply matches')).toBeTruthy();
    expect(fireEvent.keyDown(reply(), { key: 'Enter' })).toBe(true); // not prevented: the textarea takes its newline
  });
});
