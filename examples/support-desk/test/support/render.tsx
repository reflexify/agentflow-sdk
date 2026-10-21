import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import type { DeskApi } from '../../src/api/desk-api.js';
import { createFakeDesk } from '../../src/api/fake.js';
import { DEMO_PEOPLE } from '../../src/api/seed.js';
import { DeskProvider } from '../../src/data/desk-context.js';
import { FakeLiveProvider, type FakeLiveControls } from '../../src/live/FakeLiveProvider.js';
import type { DeskLocation } from '../../src/shell/RouteContext.js';
import { DeskShellContext, type DeskShell } from '../../src/shell/shell-context.js';
import type { Lang } from '../../src/text.js';

export const TEST_NOW = new Date('2026-10-06T11:12:00Z');
export const BO = { id: DEMO_PEOPLE.bo, name: 'Bo Tran' };
export const HA = { id: DEMO_PEOPLE.ha, name: 'Hà Nguyễn' };

export interface RenderDeskOptions {
  fake?: ReturnType<typeof createFakeDesk>;
  /** Replaces methods of the fake API, for a failure the memory server does not produce. */
  api?: (api: DeskApi) => DeskApi;
  lang?: Lang;
  /** Wraps the UI inside the providers. */
  wrap?: (ui: ReactNode, fake: ReturnType<typeof createFakeDesk>) => ReactNode;
  /** The host page's sign-out; the rail offers one only when it is given. */
  signOut?: () => void;
}

/**
 * The address bar as the desk's location, for tests that render the desk without a host. The page's query stays on
 * every path the desk goes to, as `?demo` does on the desk's own site.
 */
export function windowLocation(): DeskLocation {
  const listeners = new Set<() => void>();
  return {
    path: () => window.location.pathname + window.location.search + window.location.hash,
    subscribe(listener) {
      listeners.add(listener);
      window.addEventListener('popstate', listener);
      return () => {
        listeners.delete(listener);
        window.removeEventListener('popstate', listener);
      };
    },
    navigate(path) {
      window.history.pushState(null, '', path + window.location.search);
      for (const listener of [...listeners]) listener();
    },
  };
}

export function renderDesk(
  ui: ReactElement,
  opts: RenderDeskOptions = {},
): RenderResult & { fake: ReturnType<typeof createFakeDesk>; live: FakeLiveControls } {
  const fake = opts.fake ?? createFakeDesk({ now: TEST_NOW });
  const api = opts.api ? opts.api(fake.api) : fake.api;
  let live!: FakeLiveControls;
  const inner = opts.wrap ? opts.wrap(ui, fake) : ui;
  // The page's body: keys pressed anywhere on it, as `fireEvent.keyDown(document.body, …)` sends them, reach the desk.
  const shell: DeskShell = { location: windowLocation(), keyScope: document.body, signOut: opts.signOut };
  const result = render(
    <DeskShellContext.Provider value={shell}>
      <DeskProvider api={api} ids={fake.ids} lang={opts.lang ?? 'en'} retry={false}>
        <FakeLiveProvider server={fake.server} you={BO.id} onReady={(c) => { live = c; }}>{inner}</FakeLiveProvider>
      </DeskProvider>
    </DeskShellContext.Provider>,
  );
  return Object.assign(result, { fake, live });
}
