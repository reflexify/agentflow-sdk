// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deskIdsFrom } from '../shared/app-objects.js';
import { DEMO_IDS } from '../src/api/demo-ids.js';
import { createFakeDesk } from '../src/api/fake.js';
import { createMemoryHost, type MemoryHost } from '../src/demo-host.js';
import { DESK_PALETTE } from '../src/styles/palette.js';
import { stubColorScheme } from './support/media.js';

const BO = { id: '10000000-0000-4000-8000-000000000001', name: 'Bo Tran', email: 'bo@lindenbooks.test' };
let host: MemoryHost | undefined;
let scheme: ReturnType<typeof stubColorScheme>;

beforeEach(() => {
  scheme = stubColorScheme(false);
  window.history.replaceState(null, '', '/f/mine?demo&script=off');
});
afterEach(() => {
  host?.close();
  host = undefined;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  window.history.replaceState(null, '', '/');
});

function make() {
  const container = document.createElement('div');
  host = createMemoryHost({ server: createFakeDesk().server, you: BO, container, portalRoot: document.createElement('div') });
  return { host, container };
}

describe('the demo\'s host', () => {
  it('answers the API from the in-memory AgentFlow, /app/objects included', async () => {
    const { host } = make();
    expect((await host.api.GET('/caller')).data?.display_name).toBe('Bo Tran');
    expect(deskIdsFrom((await host.api.GET('/app/objects')).data!)).toEqual({ ids: DEMO_IDS, missing: [] });
    expect(host.context.person).toEqual(BO);
  });

  it('names a published path under the base its client calls, query kept', () => {
    const { host } = make();
    expect(host.apiUrl('/attachments/att-1/download')).toBe('http://desk.memory/agentflow/api/attachments/att-1/download');
    expect(host.apiUrl('/work?view=all')).toBe('http://desk.memory/agentflow/api/work?view=all');
  });

  it('names a path with no leading slash as it names the same path with one', () => {
    const { host } = make();
    expect(host.apiUrl('attachments/att-1/download')).toBe(host.apiUrl('/attachments/att-1/download'));
    expect(host.apiUrl('attachments/att-1/download')).toBe('http://desk.memory/agentflow/api/attachments/att-1/download');
  });

  it('tells a change of fragment once, though the browser fires both popstate and hashchange for it', () => {
    const { host } = make();
    const seen: string[] = [];
    host.onLocationChange((path) => seen.push(path));
    window.history.pushState(null, '', '/f/mine?demo&script=off#top');
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    expect(seen).toEqual(['/f/mine?demo&script=off', '/f/mine?demo&script=off#top']);
  });

  it('reports the path with the page\'s query, and keeps that query on every path the desk goes to', () => {
    const { host } = make();
    const seen: string[] = [];
    const stop = host.onLocationChange((path) => seen.push(path));
    host.navigate('/held');
    expect(window.location.pathname + window.location.search).toBe('/held?demo&script=off');
    window.history.pushState(null, '', '/f/waiting?demo&script=off#top');
    window.dispatchEvent(new PopStateEvent('popstate'));
    stop();
    host.navigate('/contacts');
    expect(seen).toEqual(['/f/mine?demo&script=off', '/held?demo&script=off', '/f/waiting?demo&script=off#top']);
  });

  it('keeps the page\'s query before a fragment the desk asks for', () => {
    const { host } = make();
    host.navigate('/f/mine/t/42#reply');
    expect(window.location.pathname + window.location.search + window.location.hash).toBe('/f/mine/t/42?demo&script=off#reply');
  });

  it('follows the colour scheme, with the desk\'s own palette in the tokens', () => {
    const { host, container } = make();
    const modes: string[] = [];
    host.onThemeChange((theme) => modes.push(theme.mode));
    expect(container.dataset.theme).toBe('light');
    expect(container.style.getPropertyValue('--af-bg')).toBe(DESK_PALETTE.light['--af-bg']);
    scheme.set(true);
    expect([container.dataset.theme, host.context.theme.mode, modes]).toEqual(['dark', 'dark', ['dark']]);
    expect(container.style.getPropertyValue('--af-bg')).toBe(DESK_PALETTE.dark['--af-bg']);
  });

  it('follows the browser\'s language', () => {
    const { host } = make();
    const seen: string[] = [];
    host.onLocaleChange((locale) => seen.push(locale));
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('vi-VN');
    window.dispatchEvent(new Event('languagechange'));
    expect([host.context.locale, seen]).toEqual(['vi-VN', ['vi-VN']]);
  });

  it('hands out a channel that never connects, since the demo\'s live layer is the memory server\'s', () => {
    const { host } = make();
    expect(host.realtime.status()).toBe('polling');
    expect(host.realtime).toBe(host.realtime);
    expect(() => {
      host.realtime.watch({ entityId: 'e', recordId: 'r' });
      host.realtime.close();
    }).not.toThrow();
  });

  it('stops following the page once closed', () => {
    const { host } = make();
    const seen: string[] = [];
    host.onLocationChange((path) => seen.push(path));
    host.close();
    window.dispatchEvent(new PopStateEvent('popstate'));
    scheme.set(true);
    expect(seen).toHaveLength(1);
    expect(scheme.listening()).toBe(0);
  });
});
