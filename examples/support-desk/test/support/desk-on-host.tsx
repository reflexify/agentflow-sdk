import { createModuleContainer, type AppHost } from '@reflexify/agentflow-sdk';
import { act, within } from '@testing-library/react';
import { flushSync } from 'react-dom';
import { createFakeDesk } from '../../src/api/fake.js';
import { mountDesk, type MountDeskOptions } from '../../src/mount.js';
import { fakeHost } from './host.js';
import { TEST_NOW } from './render.js';

const mounted: { unmount(): void; element: HTMLElement }[] = [];

/**
 * The desk mounted the way AgentFlow mounts a module: in a shadow root, on a host at `/apps/support-desk`, with the
 * in-memory AgentFlow behind the host's client. `requests` lists every call the desk made, as `METHOD /path`.
 */
export function deskOnHost(opts: {
  path?: string;
  locale?: string;
  /** Answers `GET /app/objects` in place of the memory server. */
  objects?: () => Response | Promise<Response>;
  /** What the host's `apiUrl` answers. */
  apiUrl?: (path: string) => string;
  /** `mountDesk`'s options, or a function of the memory server behind the host (for `demo`). */
  options?: MountDeskOptions | ((fake: ReturnType<typeof createFakeDesk>) => MountDeskOptions);
  /** Mounts with this instead of `mountDesk`: the module entry, or the built file. */
  mount?: (root: HTMLElement, host: AppHost) => () => void;
} = {}) {
  const fake = createFakeDesk({ now: TEST_NOW });
  const options = typeof opts.options === 'function' ? opts.options(fake) : opts.options;
  const element = document.body.appendChild(document.createElement('div'));
  const { root, portalRoot } = createModuleContainer(element);
  const requests: string[] = [];
  const host = fakeHost({
    server: fake.server,
    portalRoot,
    path: opts.path,
    locale: opts.locale,
    apiUrl: opts.apiUrl,
    intercept: (request) => {
      const path = new URL(request.url).pathname.replace(/^.*\/api(?=\/)/, '');
      requests.push(`${request.method} ${path}`);
      return path === '/app/objects' ? opts.objects?.() : undefined;
    },
  });
  let stop!: () => void;
  // Not in `act`: the desk's first render waits on its objects, and React leaves a render that waits inside a synchronous
  // `act` scope unscheduled for good once the scope closes. `flushSync` still renders the first screen before it returns.
  const environment = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const inAct = environment.IS_REACT_ACT_ENVIRONMENT;
  environment.IS_REACT_ACT_ENVIRONMENT = false;
  try {
    flushSync(() => {
      stop = (opts.mount ?? ((r: HTMLElement, h: AppHost) => mountDesk(r, h, options)))(root, host);
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
  return { fake, host, element, shadow: element.shadowRoot!, root, desk: within(root), requests, unmount };
}

/** Unmounts every desk a test mounted, and takes its element off the page. */
export function cleanupHosts(): void {
  for (const m of mounted.splice(0)) {
    m.unmount();
    m.element.remove();
  }
}
