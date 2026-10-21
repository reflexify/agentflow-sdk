// @vitest-environment jsdom
import { fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { appObjectsFor } from '../src/shared/app-objects.js';
import { boot } from '../src/boot.js';
import { TEXT } from '../src/text.js';
import { TEST_IDS } from './support/ids.js';
import { stubColorScheme } from './support/media.js';

const AGENTFLOW = 'https://agentflow.example';
const CONFIG = { basePath: '/agentflow', ids: TEST_IDS, agentflowUrl: AGENTFLOW };
const PERSON = '10000000-0000-4000-8000-000000000001';
const WORK = '20000000-0000-4000-8000-000000000001';
const CALLER = {
  id: PERSON, kind: 'user', display_name: 'Minh Lê', email: 'minh@example.test',
  org_id: 'org', org_name: 'Công ty Demo', app: null, permissions: [],
};

beforeEach(() => {
  vi.resetModules();
  document.body.innerHTML = '<div id="demo-bar" hidden><span id="persona-label"></span><select id="persona"></select></div><div id="root"></div>';
  stubColorScheme(false);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  history.replaceState(null, '', '/');
});

const pathOf = (input: unknown) => (input instanceof Request ? new URL(input.url).pathname : String(input));
const json = (body: unknown, status = 200) => Response.json(body, { status });
const problem = (status: number, type: string) => json({ type, title: type, status }, status);
const page = (items: unknown[]) => json({ items, next_cursor: null, prev_cursor: null });
const never = () => new Promise<Response>(() => {});

/** Everything the page shows is in its container's shadow root, beside the stylesheet. */
const shown = () => document.getElementById('root')!.shadowRoot?.querySelector<HTMLElement>('[data-af-root]') ?? null;
const shownText = () => shown()?.textContent ?? '';
const buttons = () => [...(shown()?.querySelectorAll('button') ?? [])];

const browserSpeaks = (language: string) => {
  vi.spyOn(navigator, 'language', 'get').mockReturnValue(language);
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue([language]);
};

describe('boot', () => {
  const answering = (answers: Record<string, () => Response | Promise<Response>>) =>
    vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => (answers[pathOf(input)] ?? (() => problem(404, 'NOT_FOUND')))());
  const boots = (search: string, fetchMock: ReturnType<typeof answering>) => boot({ search }, fetchMock as unknown as typeof fetch);

  it('is the demo for ?demo, or in a build made for it, without asking the server', async () => {
    const fetchMock = answering({});
    expect(await boots('?demo', fetchMock)).toEqual({ mode: 'demo' });
    vi.stubEnv('VITE_PROJECTS_DEMO', '1');
    expect(await boots('', fetchMock)).toEqual({ mode: 'demo' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reads the site config afresh and the session under the config\'s base path', async () => {
    const fetchMock = answering({ '/site/config.json': () => json(CONFIG), '/agentflow/session': () => json({ signedIn: true }) });
    expect(await boots('', fetchMock)).toEqual({ mode: 'ready', config: CONFIG });
    expect(fetchMock.mock.calls.map(([input, init]) => [input, init?.cache])).toEqual([['/site/config.json', 'no-store'], ['/agentflow/session', 'no-store']]);
  });

  it.each([
    ['is signed out', () => json({ signedIn: false })],
    ['cannot be reached', () => Promise.reject(new TypeError('Failed to fetch'))],
    ['answers with a page', () => new Response('<html></html>', { headers: { 'content-type': 'text/html' } })],
  ])('is signed out when the session %s', async (_, session) => {
    const fetchMock = answering({ '/site/config.json': () => json(CONFIG), '/agentflow/session': session });
    expect(await boots('', fetchMock)).toEqual({ mode: 'signed-out', basePath: '/agentflow' });
  });

  it.each([
    ['is missing', () => problem(404, 'NOT_FOUND')],
    ['answers 500', () => problem(500, 'INTERNAL_ERROR')],
    ['cannot be reached', () => Promise.reject(new TypeError('Failed to fetch'))],
    // A dev server with no site behind it answers every path with its page and a 200.
    ['is the single-page fallback', () => new Response('<!doctype html><div id="root"></div>', { headers: { 'content-type': 'text/html' } })],
    ['is not JSON', () => new Response('nope')],
    ['is null', () => json(null)],
    ['has no ids', () => json({ basePath: '/agentflow', agentflowUrl: AGENTFLOW })],
    ['has ids that are not the module\'s', () => json({ ...CONFIG, ids: { entities: { project: 'x' }, groups: {} } })],
    ['has a base path that is not a path', () => json({ ...CONFIG, basePath: 'agentflow' })],
    ['has an AgentFlow address that is not one', () => json({ ...CONFIG, agentflowUrl: 'not a url' })],
    ['has an AgentFlow address of another scheme', () => json({ ...CONFIG, agentflowUrl: 'javascript:alert(1)' })],
  ])('is not set up when the site config %s', async (_, config) => {
    const fetchMock = answering({ '/site/config.json': config });
    expect(await boots('', fetchMock)).toEqual({ mode: 'no-config' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('the site', () => {
  type Server = {
    session?: { signedIn: boolean } | 'unreachable';
    config?: () => Response | Promise<Response>;
    caller?: () => Response | Promise<Response>;
  };
  const state = { ended: false };

  /** The site's server and the AgentFlow behind it: its config, the session, who is signed in, the module's objects, a workflow task. */
  const server = ({ session = { signedIn: true }, config = () => json(CONFIG), caller = () => json(CALLER) }: Server = {}) => async (input: unknown) => {
    const path = pathOf(input);
    if (path === '/site/config.json') return config();
    if (path === '/agentflow/session') return session === 'unreachable' ? Promise.reject(new TypeError('Failed to fetch')) : json(session);
    if (!path.startsWith('/agentflow/api')) return never();
    if (path === '/agentflow/api/caller') return caller();
    if (state.ended) return problem(401, 'NOT_SIGNED_IN');
    if (path === '/agentflow/api/app/objects') return json(appObjectsFor(TEST_IDS));
    if (path.startsWith('/agentflow/api/groups/')) return json({ id: 'g', name: 'Group', members: [] });
    if (path === '/agentflow/api/identities') return json({ users: [], groups: [] });
    if (path === '/agentflow/api/users' || path === '/agentflow/api/units') return page([]);
    if (path.endsWith('/records/query')) return page([]);
    if (path === '/agentflow/api/work') {
      const claimable = new URL(pathUrl(input)).searchParams.get('view') === 'claimable';
      return page(claimable ? [] : [{
        id: WORK, entity_id: TEST_IDS.entities.task, title: 'Duyệt', assigned_group_ids: [], due_at: null,
        step: { step: { label: 'Duyệt hồ sơ' }, workflow: { name: 'Phê duyệt' } },
      }]);
    }
    return never();
  };
  const pathUrl = (input: unknown) => (input instanceof Request ? input.url : `http://localhost${String(input)}`);

  const start = async (answer: (input: unknown) => Promise<Response>) => {
    state.ended = false;
    const fetchMock = vi.fn(answer);
    vi.stubGlobal('fetch', fetchMock);
    await import('../src/main.js');
    return fetchMock;
  };

  it.each([
    ['en-US', 'en'],
    ['vi-VN', 'vi'],
  ] as const)('says it is not set up, in the browser\'s language (%s), and shows no persona bar', async (language, lang) => {
    browserSpeaks(language);
    await start(server({ config: () => problem(404, 'NOT_FOUND') }));
    await vi.waitFor(() => expect(shownText()).toBe(TEXT[lang].siteNotSetUp + TEXT[lang].siteNotSetUpHint));
    expect(document.getElementById('demo-bar')!.hidden).toBe(true);
    expect(shown()!.querySelector('.projects')).not.toBeNull();
  });

  it('says it is not set up for a config that names the wrong ids, not a half-drawn board', async () => {
    await start(server({ config: () => json({ ...CONFIG, ids: { entities: {}, groups: {} } }) }));
    await vi.waitFor(() => expect(shownText()).toBe(TEXT.en.siteNotSetUp + TEXT.en.siteNotSetUpHint));
  });

  it('follows a later change of colour scheme on its own screens', async () => {
    const scheme = stubColorScheme(false);
    await start(server({ config: () => problem(404, 'NOT_FOUND') }));
    await vi.waitFor(() => expect(shownText()).toBe(TEXT.en.siteNotSetUp + TEXT.en.siteNotSetUpHint));
    expect(document.getElementById('root')!.dataset.theme).toBe('light');
    scheme.set(true);
    expect(document.getElementById('root')!.dataset.theme).toBe('dark');
  });

  it.each([
    ['en-US', 'en'],
    ['vi-VN', 'vi'],
  ] as const)('asks a person who is not signed in to sign in, in %s', async (language, lang) => {
    browserSpeaks(language);
    await start(server({ session: { signedIn: false } }));
    await vi.waitFor(() => expect(shownText()).toContain(TEXT[lang].signInTitle));
    const link = shown()!.querySelector('a.af-button.primary');
    expect(link?.textContent).toBe(TEXT[lang].signIn);
    expect(link?.getAttribute('href')).toBe('/agentflow/auth/login');
    expect(shown()!.querySelector('.app')).toBeNull();
  });

  it('says "Đăng nhập vào Dự án" to a Vietnamese browser', async () => {
    browserSpeaks('vi-VN');
    await start(server({ session: { signedIn: false } }));
    await vi.waitFor(() => expect(shownText()).toContain('Đăng nhập vào Dự án'));
  });

  it('returns to the page the person was on after signing in', async () => {
    history.replaceState(null, '', '/p/abc/members?x=1');
    await start(server({ session: { signedIn: false } }));
    await vi.waitFor(() => expect(shownText()).toContain(TEXT.en.signInTitle));
    expect(shown()!.querySelector('a')?.getAttribute('href')).toBe('/agentflow/auth/login?returnTo=%2Fp%2Fabc%2Fmembers%3Fx%3D1');
  });

  it('asks to sign in when the session cannot be checked, never leaving a spinner', async () => {
    await start(server({ session: 'unreachable' }));
    await vi.waitFor(() => expect(shownText()).toContain(TEXT.en.signInTitle));
  });

  it('mounts the module through the standalone host, with the config\'s AgentFlow address for what opens there', async () => {
    const fetchMock = await start(server());
    await vi.waitFor(() => expect(shown()?.querySelector('.app')).not.toBeNull());
    const paths = fetchMock.mock.calls.map(([input]) => pathOf(input));
    expect(paths).toEqual(expect.arrayContaining(['/site/config.json', '/agentflow/session', '/agentflow/api/caller', '/agentflow/api/app/objects']));
    expect(document.getElementById('root')!.shadowRoot!.querySelector('style')?.textContent).toContain('.projects');
    expect(document.getElementById('root')!.dataset.brand).toBe('agentflow');
    expect(document.getElementById('demo-bar')!.hidden).toBe(true);
    await vi.waitFor(() => expect(shown()!.querySelector('[data-part="open-form"]')).not.toBeNull());
    const href = shown()!.querySelector('[data-part="open-form"]')!.getAttribute('href')!;
    expect(new URL(href).origin).toBe(AGENTFLOW);
    expect(href).toBe(`${AGENTFLOW}/inbox?record=${WORK}&entity=${TEST_IDS.entities.task}`);
  });

  it('says it is loading while AgentFlow answers who is signed in, not a blank page, then shows only the module', async () => {
    let answer: (r: Response) => void = () => {};
    await start(server({ caller: () => new Promise<Response>((resolve) => { answer = resolve; }) }));
    await vi.waitFor(() => expect(shownText()).toBe(TEXT.en.loading));
    expect(shown()!.querySelector('[role="status"]')).not.toBeNull();
    answer(json(CALLER));
    await vi.waitFor(() => expect(shown()?.querySelector('.app')).not.toBeNull());
    expect(shownText()).not.toContain(TEXT.en.loading);
    expect(shown()!.querySelectorAll('.projects')).toHaveLength(1);
    expect(document.getElementById('root')!.shadowRoot!.querySelectorAll('style')).toHaveLength(1);
  });

  it('shows the module in the browser\'s language', async () => {
    browserSpeaks('vi-VN');
    await start(server());
    await vi.waitFor(() => expect(shownText()).toContain(TEXT.vi.openForm));
  });

  it('asks to sign in when the session ended after the check, as the host reads who is signed in', async () => {
    await start(server({ caller: () => problem(401, 'NOT_SIGNED_IN') }));
    await vi.waitFor(() => expect(shownText()).toContain(TEXT.en.signInTitle));
    expect(shown()!.querySelector('.app')).toBeNull();
  });

  it('asks to sign in, not the board\'s error, when the session ends while the module is open', async () => {
    await start(server());
    await vi.waitFor(() => expect(shown()?.querySelector('.app')).not.toBeNull());
    state.ended = true;
    history.pushState(null, '', '/projects');
    window.dispatchEvent(new PopStateEvent('popstate'));
    await vi.waitFor(() => expect(shownText()).toContain(TEXT.en.signInTitle));
    expect(shown()!.querySelector('.app')).toBeNull();
    expect(shown()!.querySelector('[role="alert"]')).toBeNull();
    expect(shown()!.querySelectorAll('.projects')).toHaveLength(1);
  });

  it.each([
    ['en-US', 'en'],
    ['vi-VN', 'vi'],
  ] as const)('says AgentFlow refused the person, not that it was unreachable, and offers no retry or sign-in, in %s', async (language, lang) => {
    browserSpeaks(language);
    await start(server({ caller: () => problem(403, 'APP_NOT_INSTALLED') }));
    await vi.waitFor(() => expect(shownText()).toBe(TEXT[lang].accessRefused + TEXT[lang].accessRefusedHint));
    expect(shownText()).not.toContain(TEXT[lang].hostFailed);
    expect(shownText()).not.toContain(TEXT[lang].signInTitle);
    expect(buttons()).toHaveLength(0);
    expect(shown()!.querySelector('a')).toBeNull();
    expect(shown()!.querySelector('.app')).toBeNull();
  });

  it.each([
    ['answers 500', () => problem(500, 'INTERNAL_ERROR')],
    ['cannot be reached', () => Promise.reject(new TypeError('Failed to fetch'))],
  ])('says AgentFlow could not be reached, not a sign-in, when the host %s, and tries again on Thử lại', async (_, caller) => {
    let broken = true;
    await start(server({ caller: () => (broken ? caller() : json(CALLER)) }));
    await vi.waitFor(() => expect(shown()?.querySelector('[role="alert"]')?.textContent).toContain(TEXT.en.hostFailed));
    expect(shownText()).not.toContain(TEXT.en.signInTitle);
    expect(shown()!.querySelector('a')).toBeNull();
    const retry = buttons().find((b) => b.textContent === TEXT.en.retry);
    expect(retry).toBeDefined();
    broken = false;
    fireEvent.click(retry!);
    await vi.waitFor(() => expect(shown()?.querySelector('.app')).not.toBeNull());
    expect(shown()!.querySelectorAll('.projects')).toHaveLength(1);
  });

  it('says it in Vietnamese, with Thử lại', async () => {
    browserSpeaks('vi-VN');
    await start(server({ caller: () => problem(500, 'INTERNAL_ERROR') }));
    await vi.waitFor(() => expect(shownText()).toContain(TEXT.vi.hostFailed));
    expect(buttons().map((b) => b.textContent)).toContain('Thử lại');
  });
});
