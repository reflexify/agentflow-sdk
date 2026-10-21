import type { AppHost } from '@reflexify/agentflow-sdk';
import { StrictMode, Suspense, use, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { deskIdsFrom } from '../shared/app-objects.js';
import type { DeskIds } from '../shared/contract.js';
import { createHttpDeskApi } from './api/http-desk-api.js';
import type { MemoryServer } from './api/memory-server.js';
import { DeskProvider } from './data/desk-context.js';
import type { KeyScope } from './keys/KeyboardProvider.js';
import { FakeLiveProvider, type FakeLiveControls } from './live/FakeLiveProvider.js';
import { LiveProvider } from './live/LiveProvider.js';
import { hostLiveSource } from './live/source.js';
import { Desk } from './shell/Desk.js';
import { hostLocation } from './shell/RouteContext.js';
import { DeskShellContext, type DeskShell } from './shell/shell-context.js';
import { addDeskStyles } from './styles/inject.js';
import { langOf, t, type Lang } from './text.js';

export interface MountDeskOptions {
  /** Standalone only: ends the session. The rail shows "Sign out" only when it is given. */
  signOut?: () => void;
  /** The demo: its in-memory AgentFlow drives the fake live layer instead of `host.realtime`. */
  demo?: { server: MemoryServer; you: string; onReady?: (controls: FakeLiveControls) => void };
}

/** What `/app/objects` said about the objects the desk ships with. */
type Objects = { state: 'ready'; ids: DeskIds } | { state: 'missing'; missing: string[] } | { state: 'failed' };

/**
 * Asks which of this organization's objects the desk's keys point to. Never rejects: a read that fails, and an answer
 * that cannot be understood, are both `failed`, which the desk shows as a notice with a way to try again.
 */
async function readObjects(host: AppHost): Promise<Objects> {
  try {
    const { data } = await host.api.GET('/app/objects');
    if (!data) return { state: 'failed' };
    const found = deskIdsFrom(data);
    return found.ids ? { state: 'ready', ids: found.ids } : { state: 'missing', missing: found.missing };
  } catch {
    return { state: 'failed' };
  }
}

/** The shadow root the desk renders in, so a key typed in the host's own page never reaches it; outside one, its own element. */
function keyScopeOf(root: ShadowRoot | Element, element: HTMLElement): KeyScope {
  const node = root instanceof ShadowRoot ? root : root.getRootNode();
  return node instanceof ShadowRoot ? node : element;
}

/**
 * Mounts the desk in `root` on `host`, and returns how to unmount it. Everything the desk needs from outside comes
 * through the host: the API, the address bar, the live channel and the language.
 */
export function mountDesk(root: ShadowRoot | Element, host: AppHost, opts: MountDeskOptions = {}): () => void {
  const removeStyles = addDeskStyles(root);
  const element = root.ownerDocument.createElement('div');
  element.className = 'desk';
  // The desk hears keys only inside its shadow root. Focusable itself, it takes focus from a click anywhere in it
  // that lands on nothing focusable, so inside AgentFlow its shortcuts work from the first click into it.
  element.tabIndex = -1;
  root.append(element);
  const location = hostLocation(host);
  const shell: DeskShell = { location, keyScope: keyScopeOf(root, element), signOut: opts.signOut };
  // Asked here, once per mount, not in an effect that React's development double run would repeat.
  const first = readObjects(host);
  const react = createRoot(element);
  react.render(
    <StrictMode>
      <DeskShellContext.Provider value={shell}>
        <ModuleDesk host={host} opts={opts} first={first} />
      </DeskShellContext.Provider>
    </StrictMode>,
  );
  return () => {
    react.unmount();
    location.close();
    element.remove();
    removeStyles();
  };
}

function ModuleDesk({ host, opts, first }: { host: AppHost; opts: MountDeskOptions; first: Promise<Objects> }) {
  const [lang, setLang] = useState<Lang>(() => langOf(host.context.locale));
  // A language switch re-renders the desk and never remounts it, so the open ticket and a half-typed reply stay.
  useEffect(() => host.onLocaleChange((locale) => setLang(langOf(locale))), [host]);
  const [objects, setObjects] = useState(first);
  return (
    <Suspense fallback={<div className="empty">{t(lang, 'loading')}</div>}>
      <Resolved objects={objects} lang={lang} host={host} opts={opts} retry={() => setObjects(readObjects(host))} />
    </Suspense>
  );
}

function Resolved(props: { objects: Promise<Objects>; lang: Lang; host: AppHost; opts: MountDeskOptions; retry: () => void }) {
  const objects = use(props.objects);
  const { lang } = props;
  if (objects.state === 'failed') {
    return (
      <div className="empty" role="alert">
        <p>{t(lang, 'objectsFailed')}</p>
        <button className="btn" onClick={props.retry}>{t(lang, 'tryAgain')}</button>
      </div>
    );
  }
  if (objects.state === 'missing') {
    // Named as the installation names them, for an administrator to find.
    return (
      <div className="empty" role="alert">
        <h3>{t(lang, 'objectsMissingTitle')}</h3>
        <p>{t(lang, 'objectsMissingBody')}</p>
        <ul className="mono" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {objects.missing.map((key) => <li key={key}>{key}</li>)}
        </ul>
      </div>
    );
  }
  return <Ready ids={objects.ids} lang={lang} host={props.host} opts={props.opts} />;
}

function Ready({ ids, lang, host, opts }: { ids: DeskIds; lang: Lang; host: AppHost; opts: MountDeskOptions }) {
  const [desk] = useState(() => ({
    // A call, not the bare method: a host that is a class instance keeps its `this`.
    api: createHttpDeskApi({ client: host.api, ids, apiUrl: (path) => host.apiUrl(path) }),
    source: hostLiveSource(host),
  }));
  return (
    <DeskProvider api={desk.api} ids={ids} lang={lang} demo={opts.demo !== undefined}>
      {opts.demo
        ? <FakeLiveProvider server={opts.demo.server} you={opts.demo.you} onReady={opts.demo.onReady}><Desk /></FakeLiveProvider>
        : <LiveProvider source={desk.source}><Desk /></LiveProvider>}
    </DeskProvider>
  );
}
