// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DeskApi } from '../../src/api/desk-api.js';
import { DEMO_PEOPLE } from '../../src/api/seed.js';
import { postSignOut } from '../../src/data/session.js';
import { Desk } from '../../src/shell/Desk.js';
import { renderDesk } from '../support/render.js';

beforeEach(() => {
  window.history.pushState({}, '', '/?demo');
  window.localStorage.clear();
});

const fold = (name: RegExp) => screen.getByRole('button', { name });

describe('the shell', () => {
  it('counts each folder from the data', async () => {
    renderDesk(<Desk />);
    await waitFor(() => expect(within(fold(/^Mine/)).getByText('6')).toBeTruthy());
    expect(within(fold(/^Unclaimed in my pools/)).getByText('2')).toBeTruthy();
    expect(within(fold(/^Held messages/)).getByText('2').className).toBe('n alert');
    await waitFor(() => expect(within(fold(/^Mentions/)).getByText('1')).toBeTruthy());
    await waitFor(() => expect(within(fold(/^Waiting on customer/)).getByText('2')).toBeTruthy());
    expect(within(fold(/^All open/)).getByText('8')).toBeTruthy();
    expect(within(fold(/^Contacts/)).getByText('8')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('Live');
  });

  it('moves between folders and keeps ?demo in the address', async () => {
    renderDesk(<Desk />);
    fireEvent.click(fold(/^Waiting on customer/));
    expect(fold(/^Waiting on customer/).getAttribute('aria-current')).toBe('page');
    expect(window.location.pathname + window.location.search).toBe('/f/waiting?demo');
    act(() => {
      fireEvent.keyDown(document.body, { key: 'g' });
      fireEvent.keyDown(document.body, { key: 'h' });
    });
    expect(window.location.pathname).toBe('/held');
  });

  it('opens the palette on ⌘K, filters, and runs the chosen command', async () => {
    renderDesk(<Desk />);
    fireEvent.keyDown(document.body, { key: 'k', metaKey: true });
    const input = await screen.findByRole('textbox', { name: 'Command' });
    fireEvent.change(input, { target: { value: 'held' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(window.location.pathname).toBe('/held');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('finds a ticket by number in the palette', async () => {
    renderDesk(<Desk />);
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    fireEvent.change(await screen.findByRole('textbox', { name: 'Command' }), { target: { value: '0418' } });
    expect(await screen.findByRole('option', { name: /TK-2026-0418 · Where is my order/ })).toBeTruthy();
  });

  it('shows the keyboard sheet on ? and closes it on Escape', async () => {
    renderDesk(<Desk />);
    fireEvent.keyDown(document.body, { key: '?' });
    expect(screen.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeTruthy();
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('goes to Mine and to Unclaimed with G M and G U', async () => {
    window.history.pushState({}, '', '/held?demo');
    renderDesk(<Desk />);
    const press = (...keys: string[]) => act(() => { for (const key of keys) fireEvent.keyDown(document.body, { key }); });
    press('g', 'u');
    expect(window.location.pathname + window.location.search).toBe('/f/unclaimed?demo');
    expect(fold(/^Unclaimed in my pools/).getAttribute('aria-current')).toBe('page');
    press('g', 'm');
    expect(window.location.pathname + window.location.search).toBe('/f/mine?demo');
    expect(fold(/^Mine/).getAttribute('aria-current')).toBe('page');
    press('g', 'x', 'u');
    expect(window.location.pathname).toBe('/f/mine');
  });

  it('reads the open tickets for the palette only once it is opened', async () => {
    const asked: string[] = [];
    renderDesk(<Desk />, {
      api: (api): DeskApi => ({ ...api, tickets: async (filter, limit) => { asked.push(filter.status.join('+')); return api.tickets(filter, limit); } }),
    });
    await waitFor(() => expect(asked).toContain('new+open'));
    expect(asked).not.toContain('new+open+pending');
    fireEvent.keyDown(document.body, { key: 'k', metaKey: true });
    await waitFor(() => expect(asked).toContain('new+open+pending'));
  });
});

describe('an open ticket', () => {
  it('gives every child of the conversation its own key', async () => {
    // Found by the Playwright run: the header and the composer shared the ticket's id as their key, so React warned on every open.
    window.history.pushState({}, '', '/f/mine/t/30000000-0000-4000-8000-000000000002?demo');
    const warn = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderDesk(<Desk />);
    await screen.findByRole('textbox', { name: 'Reply' });
    expect(warn.mock.calls.filter(([m]) => String(m).includes('same key'))).toEqual([]);
    warn.mockRestore();
  });
});

describe('the overlays', () => {
  it('make the page behind them unavailable, and give focus back to what opened the palette', async () => {
    renderDesk(<Desk />);
    const opener = screen.getByRole('button', { name: /Search or jump to/ });
    opener.focus();
    fireEvent.click(opener);
    const dialog = await screen.findByRole('dialog', { name: 'Command' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Command' }), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('do the same for the shortcut sheet, however it is closed', async () => {
    renderDesk(<Desk />);
    const mine = fold(/^Mine/);
    mine.focus();
    fireEvent.keyDown(mine, { key: '?' });
    expect(screen.getByRole('dialog', { name: 'Keyboard shortcuts' }).getAttribute('aria-modal')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(document.activeElement).toBe(mine);

    fireEvent.keyDown(mine, { key: '?' });
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(mine);
  });
});

describe('signing out', () => {
  const ANA = '30000000-0000-4000-8000-000000000002';
  afterEach(() => vi.restoreAllMocks());

  /** jsdom cannot navigate: capture the form instead of letting `submit` report it as not implemented. */
  function captureSubmit() {
    const sent: { method: string; action: string; inBody: boolean }[] = [];
    vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(function (this: HTMLFormElement) {
      sent.push({ method: this.method, action: this.getAttribute('action') ?? '', inBody: document.body.contains(this) });
    });
    return sent;
  }

  it('posts to the SDK\'s logout route, on the desk\'s own site', () => {
    const sent = captureSubmit();
    postSignOut();
    expect(sent).toEqual([{ method: 'post', action: '/agentflow/auth/logout', inBody: true }]);
  });

  it('is offered by the rail when the host page gives a way to sign out, and uses it', async () => {
    const signOut = vi.fn();
    renderDesk(<Desk />, { signOut });
    await screen.findByText('Bo Tran');
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(signOut).toHaveBeenCalledOnce();
  });

  it('first clears the reply and note this person kept in the tab, and no one else\'s', async () => {
    const bo = DEMO_PEOPLE.bo;
    const ha = DEMO_PEOPLE.ha;
    for (const [family, who] of [['draft', bo], ['draft-base', bo], ['note', bo], ['draft', ha], ['note', ha]] as const) {
      window.sessionStorage.setItem(`support-desk:${family}:${who}:${ANA}`, 'kept');
    }
    window.sessionStorage.setItem('unrelated', 'stays');
    renderDesk(<Desk />, { signOut: vi.fn() });
    await screen.findByText('Bo Tran');
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    const left = Array.from({ length: window.sessionStorage.length }, (_, i) => window.sessionStorage.key(i)).sort();
    expect(left).toEqual([`support-desk:draft:${ha}:${ANA}`, `support-desk:note:${ha}:${ANA}`, 'unrelated']);
  });

  it('is not offered when the host page gives no way to sign out: in the demo, or inside AgentFlow', async () => {
    renderDesk(<Desk />);
    await screen.findByText('Bo Tran');
    expect(screen.queryByRole('button', { name: 'Sign out' })).toBeNull();
  });
});
