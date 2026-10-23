import { act, render, type RenderResult } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createFakeProjects } from '../../src/api/fake.js';
import type { ProjectsApi } from '../../src/api/projects-api.js';
import { ProjectsProvider } from '../../src/data/context.js';
import { ToastRegion } from '../../src/kit/elements.js';
import { FakeLiveProvider, type FakeLiveControls } from '../../src/live/FakeLiveProvider.js';
import type { LiveStatus } from '../../src/live/LiveProvider.js';
import { RouteProvider, type ModuleLocation } from '../../src/shell/RouteContext.js';
import type { Lang } from '../../src/text.js';

/** A Wednesday: 2026-10-21, 10:00 in Hanoi. */
export const TEST_NOW = new Date('2026-10-21T03:00:00Z');

/** The address bar as the module's location, for tests that render it without a host. */
export function windowLocation(): ModuleLocation {
  const listeners = new Set<() => void>();
  return {
    current: () => window.location.pathname + window.location.search,
    subscribe(listener) {
      listeners.add(listener);
      window.addEventListener('popstate', listener);
      return () => {
        listeners.delete(listener);
        window.removeEventListener('popstate', listener);
      };
    },
    navigate(path) {
      window.history.pushState(null, '', path);
      for (const listener of [...listeners]) listener();
    },
  };
}

export interface RenderProjectsOptions {
  fake?: ReturnType<typeof createFakeProjects>;
  /** Who the fake API acts as, when `fake` is not given. */
  you?: string;
  /** The module path to start at. Default `/`. */
  path?: string;
  lang?: Lang;
  /** Renders as an app's own site does, where a comment takes no file. */
  standalone?: boolean;
  /** Wraps the fake's API, for a failure the memory server does not produce or a call held open. */
  api?: (api: ProjectsApi) => ProjectsApi;
}

/** `ui` inside the module's providers, over the in-memory AgentFlow, with the address bar as its location. */
export function renderProjects(ui: ReactNode, opts: RenderProjectsOptions = {}): RenderResult & {
  fake: ReturnType<typeof createFakeProjects>;
  live: { setStatus(s: LiveStatus): void };
  toasts(): string[];
} {
  window.history.replaceState(null, '', opts.path ?? '/');
  const fake = opts.fake ?? createFakeProjects({ you: opts.you });
  const api = opts.api ? opts.api(fake.api) : fake.api;
  const lang = opts.lang ?? 'en';
  // The live provider mounts once the viewer has loaded, so a status set before then waits for it.
  let controls: FakeLiveControls | null = null;
  let wanted: LiveStatus | null = null;
  const onReady = (c: FakeLiveControls) => {
    controls = c;
    if (wanted) c.setStatus(wanted);
  };
  const result = render(
    <RouteProvider location={windowLocation()}>
      <ProjectsProvider api={api} ids={fake.ids} lang={lang} agentflowUrl={(p) => p} standalone={opts.standalone} retry={false}>
        <FakeLiveProvider server={fake.server} onReady={onReady}>
          <ToastRegion locale={lang}>{ui}</ToastRegion>
        </FakeLiveProvider>
      </ProjectsProvider>
    </RouteProvider>,
  );
  const live = {
    setStatus(s: LiveStatus) {
      wanted = s;
      if (controls) act(() => controls!.setStatus(s));
    },
  };
  return Object.assign(result, { fake, live, toasts });
}

/** The text of every toast showing, in every `af-toast` on the page. */
export function toasts(): string[] {
  return [...document.querySelectorAll('af-toast')].flatMap((el) =>
    [...(el.shadowRoot?.querySelectorAll('[part="toast"]') ?? [])].map((t) => (t.querySelector('[part="text"]') ?? t).textContent?.trim() ?? ''));
}

function pick(el: Element, value: unknown): void {
  act(() => {
    (el as Element & { value: unknown }).value = value;
    el.dispatchEvent(new CustomEvent('change', { detail: { value }, bubbles: true }));
  });
}

/** What choosing in an `af-person-picker` does: its value, and its `change` event. */
export function pickPerson(el: Element, value: string | string[] | null): void {
  pick(el, value);
}

/** What choosing in an `af-date` does: its value, and its `change` event. */
export function pickDate(el: Element, value: string | null): void {
  pick(el, value);
}
