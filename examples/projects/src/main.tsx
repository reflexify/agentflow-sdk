import { AgentFlowError, applyTheme, createModuleContainer, createStandaloneHost } from '@reflexify/agentflow-sdk';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { boot, type SiteConfig } from './boot.js';
import { mountDemo, type PersonaControls } from './demo.js';
import { DEMO_BRAND, DEMO_PALETTE } from './demo-host.js';
import { mountProjects } from './mount.js';
import { AccessRefused, HostFailed, SiteLoading, SiteNotSetUp } from './shell/SiteStates.js';
import { SignIn } from './shell/SignIn.js';
import { addProjectsStyles } from './styles/inject.js';
import { langOf } from './text.js';

const element = document.getElementById('root')!;
const lang = langOf(navigator.language);
document.documentElement.lang = lang;

function personaControls(): PersonaControls | null {
  const bar = document.getElementById('demo-bar');
  const label = document.getElementById('persona-label');
  const select = document.getElementById('persona');
  return bar && label && select instanceof HTMLSelectElement ? { bar, label, select } : null;
}

/** What is on the page now, and how to take it away. */
let leave: (() => void) | null = null;
function show(next: () => () => void) {
  leave?.();
  leave = next();
}

/**
 * One of the page's own screens (loading, sign-in, not set up), in the module's look and in a shadow root of its own, or
 * in the root the module will take once it can mount.
 */
function showPage(content: ReactNode, { root } = createModuleContainer(element)): () => void {
  const scheme = window.matchMedia('(prefers-color-scheme: dark)');
  const follow = () => applyTheme(element, { mode: scheme.matches ? 'dark' : 'light', brand: DEMO_BRAND }, DEMO_PALETTE);
  follow();
  scheme.addEventListener('change', follow);
  const removeStyles = addProjectsStyles(root);
  const box = document.createElement('div');
  box.className = 'projects af-kit';
  root.append(box);
  const page = createRoot(box);
  page.render(content);
  return () => {
    scheme.removeEventListener('change', follow);
    page.unmount();
    removeStyles();
    box.remove();
  };
}

function signInScreen(basePath: string) {
  show(() => showPage(<SignIn lang={lang} basePath={basePath} />));
}

/**
 * Mounts the module on the SDK's standalone host. A 401 from AgentFlow once it is open means the session ended, which the
 * module would read as a failed load; the page takes the module away and asks for a sign-in instead.
 */
async function mountLive(config: SiteConfig) {
  const container = createModuleContainer(element);
  // Connecting can take a moment: the page says it is loading, where the module will be, until AgentFlow answers.
  show(() => showPage(<SiteLoading lang={lang} />, container));
  let open = false;
  const watched = async (request: Request) => {
    const response = await fetch(request);
    if (response.status === 401 && open) signInScreen(config.basePath);
    return response;
  };
  let host: Awaited<ReturnType<typeof createStandaloneHost>>;
  try {
    host = await createStandaloneHost({
      container: element, portalRoot: container.portalRoot, sdkBasePath: config.basePath, brand: DEMO_BRAND, palette: DEMO_PALETTE, fetch: watched,
    });
  } catch (error) {
    if (error instanceof AgentFlowError && error.status === 401) signInScreen(config.basePath);
    else if (error instanceof AgentFlowError && error.status === 403) show(() => showPage(<AccessRefused lang={lang} />));
    else show(() => showPage(<HostFailed lang={lang} onRetry={() => void start()} />));
    return;
  }
  leave?.();
  const unmount = mountProjects(container.root, host, { agentflowUrl: (path) => new URL(path, config.agentflowUrl).href });
  open = true;
  leave = () => {
    open = false;
    unmount();
    host.close();
  };
}

async function start() {
  show(() => showPage(<SiteLoading lang={lang} />));
  const what = await boot(window.location);
  switch (what.mode) {
    case 'demo':
      leave?.();
      leave = mountDemo({ element, ...createModuleContainer(element) }, { persona: personaControls() });
      return;
    case 'no-config':
      return show(() => showPage(<SiteNotSetUp lang={lang} />));
    case 'signed-out':
      return signInScreen(what.basePath);
    case 'ready':
      return mountLive(what.config);
  }
}

void start();
