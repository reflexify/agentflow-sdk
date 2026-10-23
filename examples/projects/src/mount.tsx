import type { AppHost } from '@reflexify/agentflow-sdk';
import { StrictMode, Suspense, use, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createHttpProjectsApi } from './api/http-projects-api.js';
import type { MemoryServer } from './api/memory-server.js';
import { ProjectsProvider } from './data/context.js';
import { KitTheme, type ThemeMode } from './kit/elements.js';
import { FakeLiveProvider } from './live/FakeLiveProvider.js';
import { LiveProvider } from './live/LiveProvider.js';
import { App } from './shell/App.js';
import { hostLocation, RouteProvider } from './shell/RouteContext.js';
import { projectIdsFrom, type ProjectIds } from './shared/app-objects.js';
import { addProjectsStyles } from './styles/inject.js';
import { langOf, t, type Lang } from './text.js';

export interface MountOptions {
  /** Where AgentFlow's own pages are, for a link the browser follows. Default: the same origin. */
  agentflowUrl?: (path: string) => string;
  /** The demo: its in-memory AgentFlow stands in for the real one. */
  demo?: { server: MemoryServer; you: string };
}

/** What `/app/objects` said about the objects the module ships with. */
type Objects = { state: 'ready'; ids: ProjectIds } | { state: 'missing'; missing: string[] } | { state: 'failed'; error: unknown };

/**
 * Asks which of this organization's objects the module's keys point to. Never rejects: a read that fails, and an answer
 * that cannot be understood, are both `failed`, which the module shows as a notice with a way to try again.
 */
async function readObjects(host: AppHost): Promise<Objects> {
  try {
    const { data, error } = await host.api.GET('/app/objects');
    if (!data) return { state: 'failed', error };
    const found = projectIdsFrom(data);
    return found.ids ? { state: 'ready', ids: found.ids } : { state: 'missing', missing: found.missing };
  } catch (error) {
    return { state: 'failed', error };
  }
}

/**
 * Mounts Projects in `root` on `host`, and returns how to unmount it. Everything it needs from outside comes through
 * the host: the API, the address bar, the live channel and the language.
 */
export function mountProjects(root: ShadowRoot | Element, host: AppHost, opts: MountOptions = {}): () => void {
  const removeStyles = addProjectsStyles(root);
  const element = root.ownerDocument.createElement('div');
  element.className = 'projects af-kit';
  // Focusable itself, so a click anywhere in it that lands on nothing focusable still puts focus inside the module.
  element.tabIndex = -1;
  root.append(element);
  const location = hostLocation(host);
  // Asked here, once per mount, not in an effect that React's development double run would repeat.
  const first = readObjects(host);
  const react = createRoot(element);
  react.render(
    <StrictMode>
      <RouteProvider location={location}>
        <Loaded host={host} opts={opts} first={first} />
      </RouteProvider>
    </StrictMode>,
  );
  return () => {
    react.unmount();
    location.close();
    element.remove();
    removeStyles();
  };
}

function Loaded({ host, opts, first }: { host: AppHost; opts: MountOptions; first: Promise<Objects> }) {
  const [lang, setLang] = useState<Lang>(() => langOf(host.context.locale));
  const [theme, setTheme] = useState<ThemeMode>(() => host.context.theme.mode);
  // A language or theme switch re-renders in place and never remounts, so what is open and half typed stays.
  useEffect(() => host.onLocaleChange((locale) => setLang(langOf(locale))), [host]);
  useEffect(() => {
    // A change between the first render and this subscription would otherwise go unheard.
    setTheme(host.context.theme.mode);
    return host.onThemeChange((next) => setTheme(next.mode));
  }, [host]);
  const [objects, setObjects] = useState(first);
  return (
    <KitTheme mode={theme}>
      <Suspense fallback={<p>{t(lang, 'loading')}</p>}>
        <Resolved objects={objects} lang={lang} host={host} opts={opts} retry={() => setObjects(readObjects(host))} />
      </Suspense>
    </KitTheme>
  );
}

function Resolved({ objects, lang, host, opts, retry }: { objects: Promise<Objects>; lang: Lang; host: AppHost; opts: MountOptions; retry: () => void }) {
  const found = use(objects);
  if (found.state === 'failed') {
    return (
      <div role="alert">
        <p>{t(lang, 'loadFailed')}</p>
        <button type="button" onClick={retry}>{t(lang, 'retry')}</button>
      </div>
    );
  }
  if (found.state === 'missing') return <p role="alert">{t(lang, 'missingObjects', { keys: found.missing.join(', ') })}</p>;
  return <Ready ids={found.ids} lang={lang} host={host} opts={opts} />;
}

const SAME_ORIGIN = (path: string) => path;

function Ready({ ids, lang, host, opts }: { ids: ProjectIds; lang: Lang; host: AppHost; opts: MountOptions }) {
  const [api] = useState(() =>
    // A call, not the bare method: a host that is a class instance keeps its `this`.
    createHttpProjectsApi({ client: host.api, ids, apiUrl: (p) => host.apiUrl(p), personId: host.context.person.id }));
  return (
    <ProjectsProvider api={api} ids={ids} lang={lang} agentflowUrl={opts.agentflowUrl ?? SAME_ORIGIN} standalone={!opts.demo && !host.basePath.startsWith('/apps/')}>
      {opts.demo
        ? <FakeLiveProvider server={opts.demo.server}><App /></FakeLiveProvider>
        : <LiveProvider host={host}><App /></LiveProvider>}
    </ProjectsProvider>
  );
}
