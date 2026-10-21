import { createFakeProjects } from './api/fake.js';
import type { MemoryServer } from './api/memory-server.js';
import { MINH, PEOPLE } from './api/seed.js';
import { createMemoryHost, type MemoryHost } from './demo-host.js';
import { mountProjects } from './mount.js';
import { parseRoute } from './shell/route.js';
import { langOf, t } from './text.js';

declare global {
  interface Window {
    /** Demo mode only: the in-memory AgentFlow, and who the module is mounted as, for Playwright and manual testers. */
    __projects?: { server: MemoryServer; actAs(id: string): void; unmount(): void };
  }
}

/**
 * The page's own persona picker, above the module and outside its shadow root. The bar's links to the module's two
 * screens are the `a[data-nav]` elements inside it, if it has them.
 */
export interface PersonaControls { bar: HTMLElement; label: HTMLElement; select: HTMLSelectElement }

type Place = 'mywork' | 'projects';
const PLACES: Record<Place, { path: string; text: 'myWork' | 'breadcrumbProjects' }> = {
  mywork: { path: '/', text: 'myWork' },
  projects: { path: '/projects', text: 'breadcrumbProjects' },
};
/** Projects, a project and the label settings are all under Dự án. */
const placeOf = (path: string): Place => (parseRoute(path).screen === 'mywork' ? 'mywork' : 'projects');

/**
 * Projects on an in-memory AgentFlow, mounted as the module it is, as Minh (the manager of "Ra mắt ứng dụng") until
 * someone else is chosen. The module reads its viewer from the host, so switching person mounts it again on a host for
 * that person, over the same server: what was changed stays.
 */
export function mountDemo(
  container: { element: HTMLElement; root: HTMLElement; portalRoot: HTMLElement },
  opts: { persona?: PersonaControls | null } = {},
): () => void {
  const { server } = createFakeProjects({ you: MINH });
  let host: MemoryHost | null = null;
  let unmountModule: (() => void) | null = null;
  let stopFollowing: (() => void) | null = null;

  const lang = langOf(navigator.language);
  const links = [...(opts.persona?.bar.querySelectorAll<HTMLAnchorElement>('a[data-nav]') ?? [])]
    .flatMap((link) => (link.dataset.nav! in PLACES ? [{ link, place: link.dataset.nav as Place }] : []));
  for (const { link, place } of links) link.textContent = t(lang, PLACES[place].text);
  // The bar outlives every host (a person switch makes a new one), so the click reads whichever host is current.
  const onNav = (event: MouseEvent) => {
    const link = event.currentTarget as HTMLAnchorElement;
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    host?.navigate(PLACES[link.dataset.nav as Place].path);
  };
  for (const { link } of links) link.addEventListener('click', onNav);
  const follow = (path: string) => {
    const now = placeOf(path);
    for (const { link, place } of links) {
      if (place === now) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
  };

  const leave = () => {
    stopFollowing?.();
    stopFollowing = null;
    unmountModule?.();
    host?.close();
    unmountModule = null;
    host = null;
  };
  const switchTo = (id: string) => {
    const person = PEOPLE.find((p) => p.id === id);
    if (!person) throw new Error(`No one in the demo has the id ${id}`);
    leave();
    server.actAs(id);
    host = createMemoryHost({ server, you: person, container: container.element, portalRoot: container.portalRoot });
    unmountModule = mountProjects(container.root, host, { demo: { server, you: id } });
    stopFollowing = host.onLocationChange(follow);
    if (opts.persona) opts.persona.select.value = id;
  };

  const persona = opts.persona;
  const onPick = () => { if (persona) switchTo(persona.select.value); };
  if (persona) {
    persona.label.textContent = t(lang, 'demoViewingAs');
    persona.select.replaceChildren(...PEOPLE.map((p) => new Option(p.name, p.id)));
    persona.select.addEventListener('change', onPick);
    persona.bar.hidden = false;
  }

  switchTo(MINH);
  const unmount = () => {
    leave();
    for (const { link } of links) {
      link.removeEventListener('click', onNav);
      link.removeAttribute('aria-current');
    }
    persona?.select.removeEventListener('change', onPick);
    if (persona) persona.bar.hidden = true;
    delete window.__projects;
  };
  window.__projects = { server, actAs: switchTo, unmount };
  return unmount;
}
