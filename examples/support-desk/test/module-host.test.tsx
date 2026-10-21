// @vitest-environment jsdom
import { fireEvent, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '../src/module.js';
import { cleanupHosts, deskOnHost } from './support/desk-on-host.js';

const ANA = '30000000-0000-4000-8000-000000000002';
const DRAFT = '40000000-0000-4000-8000-000000000005';

beforeEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
});
afterEach(() => cleanupHosts());

describe('keys, inside AgentFlow', () => {
  it('reads typing in the composer as typing: ? goes into the reply, and opens the sheet only from elsewhere in the desk', async () => {
    const { desk } = deskOnHost({ path: `/f/mine/t/${ANA}` });
    const box = await desk.findByRole('textbox', { name: 'Reply' });
    fireEvent.keyDown(box, { key: '?' });
    expect(desk.queryByRole('dialog', { name: 'Keyboard shortcuts' })).toBeNull();
    fireEvent.keyDown(desk.getByRole('button', { name: /^Mine/ }), { key: '?' });
    expect(desk.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeTruthy();
  });

  it('hears no key typed outside it: the host\'s own search box moves nothing', async () => {
    const { desk, host } = deskOnHost();
    await desk.findByRole('button', { name: /^Mine/ });
    const before = host.navigated.length;
    const search = document.body.appendChild(document.createElement('input'));
    for (const key of ['?', 'g', 'h']) fireEvent.keyDown(search, { key });
    for (const key of ['?', 'g', 'u']) fireEvent.keyDown(document.body, { key });
    expect(desk.queryByRole('dialog')).toBeNull();
    expect(host.navigated).toHaveLength(before);
    search.remove();
  });

  it('can take focus itself, so a click anywhere in it puts focus where it hears keys', async () => {
    const { desk, root, shadow } = deskOnHost();
    await desk.findByRole('button', { name: /^Mine/ });
    const own = root.querySelector<HTMLElement>('.desk')!;
    // A div's tabIndex property already reads -1; only the attribute shows it was made focusable.
    expect(own.getAttribute('tabindex')).toBe('-1');
    own.focus();
    fireEvent.keyDown(own, { key: '?' });
    expect(shadow.activeElement).not.toBeNull();
    expect(desk.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeTruthy();
  });

  it('puts focus back inside its shadow root when an overlay closes', async () => {
    const { desk, shadow } = deskOnHost();
    const mine = await desk.findByRole('button', { name: /^Mine/ });
    mine.focus();
    fireEvent.keyDown(mine, { key: '?' });
    fireEvent.click(desk.getByRole('button', { name: 'Close' }));
    expect(shadow.activeElement).toBe(mine);
  });
});

describe('leaving the desk', () => {
  it('sends at once a reply that is counting down, as leaving it inside AgentFlow does', async () => {
    const { desk, fake, unmount } = deskOnHost({ path: `/f/mine/t/${ANA}` });
    const sends = () => fake.server.runs().filter((r) => r.workflow === 'send_reply');
    const box = (await desk.findByRole('textbox', { name: 'Reply' })) as HTMLTextAreaElement;
    await waitFor(() => expect(box.value).toContain('Good news'));
    fireEvent.keyDown(box, { key: 'Enter', metaKey: true });
    await desk.findByRole('button', { name: 'Undo' });
    expect(sends()).toHaveLength(0);
    // A move to another AgentFlow page: no tab closes, no beforeunload.
    unmount();
    await waitFor(() => expect(sends()).toHaveLength(1));
    await fake.server.settle();
    await waitFor(() => expect(fake.server.records('reply').find((r) => r.id === DRAFT)?.body.status).toBe('sent'));
  });
});

describe('signing out', () => {
  it('is offered only when the host page gives a way to sign out', async () => {
    const signOut = vi.fn();
    const own = deskOnHost({ options: { signOut } });
    fireEvent.click(await own.desk.findByRole('button', { name: 'Sign out' }));
    expect(signOut).toHaveBeenCalledOnce();

    // The module entry, as AgentFlow mounts it: AgentFlow has its own sign-out.
    const embedded = deskOnHost({ mount });
    await embedded.desk.findByText('Bo Tran');
    expect(embedded.desk.queryByRole('button', { name: 'Sign out' })).toBeNull();
  });
});
