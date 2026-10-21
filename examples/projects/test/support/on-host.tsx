import { createModuleContainer, type AppHost } from '@reflexify/agentflow-sdk';
import { act, within } from '@testing-library/react';
import { flushSync } from 'react-dom';
import { createMemoryServer } from '../../src/api/memory-server.js';
import { createSeed, MINH } from '../../src/api/seed.js';
import { mountProjects, type MountOptions } from '../../src/mount.js';
import { appObjectsFor, type AppObjects } from '../../src/shared/app-objects.js';
import { fakeHost, type FakeHost } from './host.js';
import { TEST_IDS } from './ids.js';

const mounted: { unmount(): void; element: HTMLElement }[] = [];

/** The in-memory AgentFlow on the seed, acting as `personId`. */
function seededServer(personId: string) {
  const server = createMemoryServer(createSeed(new Date()));
  server.actAs(personId);
  return server;
}

/**
 * Projects mounted the way AgentFlow mounts a module: in a shadow root, on a host at `/apps/rfx-projects`.
 * `requests` lists every call it made, as `METHOD /path`.
 */
export async function projectsOnHost(opts: {
  path?: string;
  locale?: string;
  personId?: string;
  /** Rewrites the `/app/objects` answer. */
  objects?: (body: AppObjects) => AppObjects;
  /** What the host's `apiUrl` answers. */
  apiUrl?: (path: string) => string;
  /** The server behind the host's client. Default: the in-memory AgentFlow on the seed, as the host's person. */
  server?: { fetch(request: Request): Promise<Response> };
  /** Answers a request before the server does, or leaves it to the server with `null`. */
  intercept?: (request: Request) => Response | Promise<Response> | null;
  options?: MountOptions;
  /** Mounts with this instead of `mountProjects`: the module entry, or the built file. */
  mount?: (root: HTMLElement, host: AppHost) => () => void;
} = {}): Promise<{ root: HTMLElement; shadow: ShadowRoot; ui: ReturnType<typeof within>; host: FakeHost; requests: string[]; unmount(): void }> {
  const element = document.body.appendChild(document.createElement('div'));
  const { root, portalRoot } = createModuleContainer(element);
  const requests: string[] = [];
  const host = fakeHost({
    server: opts.server ?? seededServer(opts.personId ?? MINH),
    portalRoot,
    path: opts.path,
    locale: opts.locale,
    personId: opts.personId,
    apiUrl: opts.apiUrl,
    intercept: (request) => {
      const path = new URL(request.url).pathname.replace(/^.*\/api(?=\/)/, '');
      requests.push(`${request.method} ${path}`);
      if (opts.objects && request.method === 'GET' && path === '/app/objects') return Response.json(opts.objects(appObjectsFor(TEST_IDS)));
      return opts.intercept?.(request) ?? null;
    },
  });
  let stop!: () => void;
  // Not in `act`: the first render waits on /app/objects, and React leaves a render that waits inside a synchronous
  // `act` scope unscheduled for good once the scope closes. `flushSync` still renders the first screen before it returns.
  const environment = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const inAct = environment.IS_REACT_ACT_ENVIRONMENT;
  environment.IS_REACT_ACT_ENVIRONMENT = false;
  try {
    flushSync(() => {
      stop = (opts.mount ?? ((r: HTMLElement, h: AppHost) => mountProjects(r, h, opts.options)))(root, host);
    });
  } finally {
    environment.IS_REACT_ACT_ENVIRONMENT = inAct;
  }
  let done = false;
  const unmount = () => {
    if (done) return;
    done = true;
    act(() => stop());
  };
  mounted.push({ unmount, element });
  return { root, shadow: element.shadowRoot!, ui: within(root), host, requests, unmount };
}

/** Unmounts everything a test mounted, and takes its element off the page. */
export function cleanupHosts(): void {
  for (const m of mounted.splice(0)) {
    m.unmount();
    m.element.remove();
  }
}
