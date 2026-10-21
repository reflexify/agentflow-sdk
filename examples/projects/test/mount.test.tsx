// @vitest-environment jsdom
import { act, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createMemoryServer } from '../src/api/memory-server.js';
import { createSeed, MINH } from '../src/api/seed.js';
import { TEXT } from '../src/text.js';
import { cleanupHosts, projectsOnHost } from './support/on-host.js';

beforeEach(() => window.history.replaceState(null, '', '/elsewhere'));
afterEach(() => cleanupHosts());

describe('mounting the module', () => {
  it('puts one style and one root in the shadow root, and removes both on unmount', async () => {
    const m = await projectsOnHost({});
    expect(m.shadow.querySelectorAll('style')).toHaveLength(1);
    expect(m.shadow.querySelector('.projects')).not.toBeNull();
    m.unmount();
    expect(m.shadow.querySelector('style')).toBeNull();
    expect(m.shadow.querySelector('.projects')).toBeNull();
  });

  it('reads /app/objects once and names what is missing', async () => {
    const m = await projectsOnHost({ objects: (body) => ({ ...body, objects: body.objects.filter((o) => o.logical_key !== 'entity:task') }) });
    expect(await m.ui.findByText(TEXT.en.missingObjects.replace('{keys}', 'entity:task'))).toBeTruthy();
    expect(m.requests.filter((r) => r === 'GET /app/objects')).toHaveLength(1);
  });

  it('adds no key listener of its own to document or window, on My Work, in the drawer or during a board drag', async () => {
    // The kit's bundle keeps Zag's toast hotkey listener while af-toast is mounted, and dnd-kit's sensors listen on the
    // document while a drag is in progress. Both are a library's own, live only during its own interaction; this test is
    // about the module's code, so a call from either is left out.
    const LIBRARY = /agentflow-elements[\\/]dist[\\/]|@dnd-kit/;
    const added: { type: string; caller: string }[] = [];
    const originals = [document, window].map((target) => {
      const original = target.addEventListener;
      const watched = function (this: EventTarget, type: string, ...rest: unknown[]) {
        const holder: { stack?: string } = {};
        Error.captureStackTrace(holder, watched);
        added.push({ type, caller: (holder.stack ?? '').split('\n').find((line) => /^\s*at /.test(line)) ?? '' });
        return (original as (...args: unknown[]) => void).call(this, type, ...rest);
      };
      target.addEventListener = watched as typeof target.addEventListener;
      return () => { target.addEventListener = original; };
    });
    const server = createMemoryServer(createSeed(new Date()));
    server.actAs(MINH);
    const launch = server.records('project').find((r) => r.body.name === 'Ra mắt ứng dụng')!.id;
    const task = server.records('task').find((r) => r.body.title === 'Thiết kế luồng thanh toán')!.id;
    let dragged = false;
    try {
      const m = await projectsOnHost({ server });
      await m.ui.findByRole('navigation');

      act(() => m.host.go(`/p/${launch}/t/${task}`));
      const drawer = await m.ui.findByRole('dialog', { name: 'Thiết kế luồng thanh toán' });
      await waitFor(() => expect(drawer.querySelector('[data-field="description"] af-rich-editor')).not.toBeNull());
      const board = await waitFor(() => {
        const b = m.root.querySelector<HTMLElement>('.board');
        expect(b?.querySelectorAll('[data-task]').length).toBeGreaterThan(0);
        return b!;
      });
      const slot = [...board.querySelectorAll<HTMLElement>('.column-list > li')].find((li) => li.textContent?.includes('Thiết kế màn hình đăng nhập'))!;
      act(() => slot.focus());
      fireEvent.keyDown(slot, { key: ' ', code: 'Space' });
      await waitFor(() => expect(board.getAttribute('data-dragging')).toBe('card'));
      await act(async () => { await new Promise((r) => setTimeout(r, 10)); });
      dragged = added.some((a) => a.type === 'keydown' && /@dnd-kit/.test(a.caller));
      fireEvent.keyDown(slot, { key: 'Escape', code: 'Escape' });
      await waitFor(() => expect(board.hasAttribute('data-dragging')).toBe(false));
    } finally {
      originals.forEach((restore) => restore());
    }
    // The watch sees a library's listener, so it would see the module's.
    expect(dragged).toBe(true);
    const keyListeners = added.filter((a) => a.type.startsWith('key'));
    expect(keyListeners.filter((a) => !LIBRARY.test(a.caller)).map((a) => a.type)).toEqual([]);
  });

  it("says the host's theme on every kit element it renders, and changes it in place", async () => {
    const m = await projectsOnHost({});
    await m.ui.findByRole('navigation');
    const kit = () => [...m.shadow.querySelectorAll('*')].filter((el) => el.tagName.startsWith('AF-'));
    await waitFor(() => expect(kit().length).toBeGreaterThan(1));
    const before = kit();
    expect(before.map((el) => el.getAttribute('data-theme'))).toEqual(before.map(() => 'light'));
    act(() => m.host.setTheme({ mode: 'dark', brand: 'azure' }));
    expect(kit()).toEqual(before);
    expect(kit().map((el) => el.getAttribute('data-theme'))).toEqual(before.map(() => 'dark'));
  });

  it('never reads the realtime channel before the app has loaded', async () => {
    const m = await projectsOnHost({ objects: () => ({ objects: [], parameters: {}, revision: 1 }) });
    await m.ui.findByRole('alert');
    expect(m.host.realtimeReads()).toBe(0);
  });

  it('releases every host listener on unmount', async () => {
    const m = await projectsOnHost({});
    await m.ui.findByRole('navigation');
    expect(m.host.listening().locale).toBe(1);
    m.unmount();
    expect(m.host.listening()).toEqual({ location: 0, theme: 0, locale: 0 });
  });
});
