import { createFakeDesk } from './api/fake.js';
import type { MemoryServer } from './api/memory-server.js';
import { DEMO_PEOPLE } from './api/seed.js';
import { createMemoryHost } from './demo-host.js';
import type { FakeLiveControls } from './live/FakeLiveProvider.js';
import { mountDesk } from './mount.js';

const ANA_TICKET = '30000000-0000-4000-8000-000000000002';
export const ANA_WRITES_AFTER_MS = 45_000;
/** Who the demo is signed in as: the memory server answers `/caller` with Bo. */
const BO = { id: DEMO_PEOPLE.bo, name: 'Bo Tran', email: 'bo@lindenbooks.test' };

declare global {
  interface Window {
    /** Demo mode only: the in-memory AgentFlow and the fake live layer, for Playwright. */
    __desk?: { server: MemoryServer; live: FakeLiveControls };
  }
}

/**
 * The whole desk on an in-memory AgentFlow, mounted as the module it is. Scripted (the default), a visitor sees what
 * live updates are for: Hà is viewing Ana's ticket, and 45 seconds in, Ana writes again. `?demo&script=off` leaves
 * the script out, for tests.
 */
export function mountDemo(
  container: { element: HTMLElement; root: HTMLElement; portalRoot: HTMLElement },
  opts: { scripted?: boolean } = {},
): () => void {
  const { server } = createFakeDesk({ draftDelayMs: 1500 });
  const host = createMemoryHost({ server, you: BO, container: container.element, portalRoot: container.portalRoot });
  let timer: ReturnType<typeof setTimeout> | undefined;
  const onReady = (live: FakeLiveControls) => {
    window.__desk = { server, live };
    // The fake live layer hands over its controls again when its effect runs again; the script runs once.
    if (opts.scripted === false || timer !== undefined) return;
    live.setPresence(ANA_TICKET, [DEMO_PEOPLE.ha]);
    timer = setTimeout(() => {
      server.write('reply', null, {
        ticket: ANA_TICKET, author_kind: 'customer', status: 'received', from_address: 'ana@example.com',
        body: 'Also, could you send it to my office instead? 12 Harbour St.', posted_at: new Date().toISOString(),
        key: `<demo-${Date.now()}@example.com>`,
      });
    }, ANA_WRITES_AFTER_MS);
  };
  const unmount = mountDesk(container.root, host, { demo: { server, you: DEMO_PEOPLE.bo, onReady } });
  return () => {
    clearTimeout(timer);
    unmount();
    host.close();
    delete window.__desk;
  };
}
