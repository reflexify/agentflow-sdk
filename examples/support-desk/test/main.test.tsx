// @vitest-environment jsdom
import { fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { appObjectsFor } from '../shared/app-objects.js';
import { DEMO_IDS } from '../src/api/demo-ids.js';
import { TEXT } from '../src/text.js';
import { stubColorScheme } from './support/media.js';

beforeEach(() => {
  vi.resetModules();
  document.body.innerHTML = '<div id="root"></div>';
  stubColorScheme(false);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  history.replaceState(null, '', '/');
});

/** Everything the page shows is in its container's shadow root, beside the stylesheet. */
const shown = () => document.getElementById('root')!.shadowRoot?.querySelector<HTMLElement>('[data-af-root]') ?? null;
const shownText = () => shown()?.textContent ?? '';

/** The language a browser reports: `navigator.language` is its first, `navigator.languages` all of them. */
const browserSpeaks = (language: string, languages: readonly string[] = [language]) => {
  vi.spyOn(navigator, 'language', 'get').mockReturnValue(language);
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(languages);
};

const start = async (answer: (input: unknown) => Promise<Response>) => {
  const fetchMock = vi.fn(answer);
  vi.stubGlobal('fetch', fetchMock);
  await import('../src/main.js');
  return { fetchMock };
};

/**
 * Waits until a mounted desk has opened its event stream. The desk opens it in an effect, a moment after it shows, so a
 * test that ended at the first sight of the desk left it to open later, against the NEXT test's `fetch`: the demo-mode
 * test then saw a request it never made. Opened here, the request waits on this test's server, which never answers it.
 */
const deskSettled = (fetchMock: { mock: { calls: unknown[][] } }) =>
  vi.waitFor(() => expect(fetchMock.mock.calls.some(([input]) => pathOf(input) === '/agentflow/api/events/stream')).toBe(true));

const CALLER = {
  id: '10000000-0000-4000-8000-000000000001', kind: 'user', display_name: 'Bo Tran', email: 'bo@lindenbooks.test',
  org_id: 'org', org_name: 'Linden Books', app: null, permissions: [],
};
const pathOf = (input: unknown) => (input instanceof Request ? new URL(input.url).pathname : String(input));

/** The desk's server: its config, the session, who is signed in, the ticket app's objects. Every other call never finishes. */
const server = (
  session: { signedIn: boolean } | 'unreachable',
  caller: 'ok' | 'refused' | 'forbidden' | 'down' | 'unreachable' = 'ok',
) => async (input: unknown) => {
  const path = pathOf(input);
  if (path === '/support-desk/config.json') return Response.json({ basePath: '/agentflow', ids: DEMO_IDS });
  if (path === '/agentflow/session') {
    return session === 'unreachable' ? Promise.reject(new TypeError('Failed to fetch')) : Response.json(session);
  }
  if (path === '/agentflow/api/caller') {
    if (caller === 'ok') return Response.json(CALLER);
    if (caller === 'forbidden') return Response.json({ type: 'APP_NOT_INSTALLED', title: 'App not installed', status: 403 }, { status: 403 });
    if (caller === 'down') return Response.json({ type: 'INTERNAL_ERROR', title: 'Internal error', status: 500 }, { status: 500 });
    if (caller === 'unreachable') return Promise.reject(new TypeError('Failed to fetch'));
    return Response.json({ type: 'NOT_SIGNED_IN', title: 'Not signed in', status: 401 }, { status: 401 });
  }
  if (path === '/agentflow/api/app/objects') return Response.json(appObjectsFor(DEMO_IDS));
  return new Promise<Response>(() => {});
};

describe('main', () => {
  it.each([
    ['answers 500', async () => Response.json({ code: 'INTERNAL_ERROR' }, { status: 500 })],
    ['cannot be reached', async () => Promise.reject(new TypeError('Failed to fetch'))],
    // Vite's single-page fallback answers any unknown path with index.html: a dev server with no desk config behind it.
    ['is the single-page fallback, HTML with a 200', async () => new Response('<!doctype html><html><body><div id="root"></div></body></html>', { status: 200, headers: { 'content-type': 'text/html' } })],
    ['is not JSON', async () => new Response('not json', { status: 200 })],
    ['is JSON of another shape', async () => Response.json({ ok: true })],
    ['is JSON of no object at all', async () => Response.json(null)],
  ])('says so when config.json %s', async (_, answer) => {
    await start(answer);
    await vi.waitFor(() => expect(shownText()).toBe(TEXT.en.noConfig));
  });

  it('says so in Vietnamese to a browser that prefers it', async () => {
    browserSpeaks('vi-VN', ['vi-VN', 'en']);
    await start(async () => Response.json({}, { status: 500 }));
    await vi.waitFor(() => expect(shownText()).toBe(TEXT.vi.noConfig));
  });

  it('mounts the desk as a module for a person who is signed in, with a way to sign out', async () => {
    const { fetchMock } = await start(server({ signedIn: true }));
    await vi.waitFor(() => expect(shown()?.querySelector('[data-testid="desk"]')).not.toBeNull());
    const paths = fetchMock.mock.calls.map(([input]) => pathOf(input));
    expect(paths).toEqual(expect.arrayContaining(['/support-desk/config.json', '/agentflow/session', '/agentflow/api/caller', '/agentflow/api/app/objects']));
    expect(document.getElementById('root')!.shadowRoot!.querySelector('style')?.textContent).toContain(':host');
    expect(document.getElementById('root')!.dataset.brand).toBe('support-desk');
    await vi.waitFor(() => expect([...shown()!.querySelectorAll('button')].some((b) => b.textContent === TEXT.en.signOut)).toBe(true));
    await deskSettled(fetchMock);
  });

  it.each([
    ['is not signed in', { signedIn: false } as const, 'ok' as const],
    ['cannot be checked', 'unreachable' as const, 'ok' as const],
    ['is refused when the host reads who is signed in', { signedIn: true } as const, 'refused' as const],
    ['is forbidden when the host reads who is signed in, as when the app was turned off for the person', { signedIn: true } as const, 'forbidden' as const],
  ])('asks for a sign-in when the session %s, and returns here afterwards', async (_, session, caller) => {
    history.replaceState(null, '', '/f/mine/t/abc');
    await start(server(session, caller));
    await vi.waitFor(() => expect(shownText()).toContain(TEXT.en.signInTitle));
    expect(shown()!.querySelector('[data-testid="desk"]')).toBeNull();
    expect(shown()!.querySelector('a')?.getAttribute('href')).toBe('/agentflow/auth/login?returnTo=%2Ff%2Fmine%2Ft%2Fabc');
  });

  it.each([
    ['answers 500', 'down' as const],
    ['cannot be reached', 'unreachable' as const],
  ])('says AgentFlow could not be reached, and offers a reload, not a sign-in, when who is signed in %s', async (_, caller) => {
    const { page } = await import('../src/data/session.js');
    const reload = vi.spyOn(page, 'reload').mockImplementation(() => undefined);
    await start(server({ signedIn: true }, caller));
    await vi.waitFor(() => expect(shownText()).toContain(TEXT.en.hostFailed));
    expect(shownText()).not.toContain(TEXT.en.signInTitle);
    expect(shown()!.querySelector('a')).toBeNull();
    expect(shown()!.querySelector('[data-testid="desk"]')).toBeNull();
    const button = [...shown()!.querySelectorAll('button')].find((b) => b.textContent === TEXT.en.reload);
    fireEvent.click(button!);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('says so in Vietnamese when AgentFlow could not be reached', async () => {
    browserSpeaks('vi-VN', ['vi-VN', 'en']);
    await start(server({ signedIn: true }, 'down'));
    await vi.waitFor(() => expect(shownText()).toContain(TEXT.vi.hostFailed));
    expect([...shown()!.querySelectorAll('button')].some((b) => b.textContent === TEXT.vi.reload)).toBe(true);
  });

  describe.each([
    ['vi-VN', ['vi-VN', 'en'], 'vi'],
    ['en-US', ['en-US', 'vi'], 'en'],
  ] as const)('for a browser whose first language is %s, of %j', (language, languages, lang) => {
    it(`shows the page's own screens in ${lang}`, async () => {
      browserSpeaks(language, languages);
      await start(server({ signedIn: false }));
      await vi.waitFor(() => expect(shownText()).toContain(TEXT[lang].signInTitle));
    });

    it(`shows the desk in ${lang} too`, async () => {
      browserSpeaks(language, languages);
      const { fetchMock } = await start(server({ signedIn: true }));
      await vi.waitFor(() => expect([...shown()?.querySelectorAll('button') ?? []].some((b) => b.textContent?.startsWith(TEXT[lang].folder_mine))).toBe(true));
      await deskSettled(fetchMock);
    });
  });

  it('mounts the desk on the demo host without asking the server, in demo mode', async () => {
    history.replaceState(null, '', '/?demo&script=off');
    const { fetchMock } = await start(async () => Promise.reject(new TypeError('no server')));
    await vi.waitFor(() => expect(shown()?.querySelector('[data-testid="desk"]')).not.toBeNull());
    expect(fetchMock).not.toHaveBeenCalled();
    expect([...shown()!.querySelectorAll('button')].some((b) => b.textContent === TEXT.en.signOut)).toBe(false);
  });

  it('gives the desk a key pressed while nothing has focus, and none typed in a field of the page\'s own', async () => {
    history.replaceState(null, '', '/?demo&script=off');
    await start(async () => Promise.reject(new TypeError('no server')));
    await vi.waitFor(() => expect(shown()?.querySelector('[data-testid="desk"]')).not.toBeNull());
    const outside = document.body.appendChild(document.createElement('input'));
    fireEvent.keyDown(outside, { key: '?' });
    expect(shown()!.querySelector('[role="dialog"]')).toBeNull();
    // Pressed again until heard: the desk attaches its listener in an effect, which can run just after the desk shows.
    // The sheet is opened, not toggled, so a second press does nothing.
    await vi.waitFor(() => {
      fireEvent.keyDown(document.body, { key: '?' });
      expect(shown()!.querySelector('[role="dialog"]')).not.toBeNull();
    });
  });
});
