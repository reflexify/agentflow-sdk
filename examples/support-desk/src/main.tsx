import { AgentFlowError, applyTheme, createModuleContainer, createStandaloneHost } from '@reflexify/agentflow-sdk';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { bootDesk } from './boot.js';
import { postSignOut } from './data/session.js';
import { mountDemo } from './demo.js';
import { mountDesk } from './mount.js';
import { forwardStrayKeys } from './page-keys.js';
import { HostFailed } from './shell/HostFailed.js';
import { SignIn } from './shell/SignIn.js';
import { addDeskStyles } from './styles/inject.js';
import { DESK_BRAND, DESK_PALETTE } from './styles/palette.js';
import { langOf, t } from './text.js';

const element = document.getElementById('root')!;
// The browser's first language, as the host reports it to the desk, so the page's screens and the desk agree.
const lang = langOf(navigator.language);

/** One of the page's own screens (loading, sign-in, not set up, AgentFlow not reached), in the same shadow root and stylesheet as the desk. */
function showPage(content: ReactNode): () => void {
  const { root } = createModuleContainer(element);
  const mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(element, { mode, brand: DESK_BRAND }, DESK_PALETTE);
  const removeStyles = addDeskStyles(root);
  const box = document.createElement('div');
  box.className = 'desk';
  root.append(box);
  const page = createRoot(box);
  page.render(content);
  return () => {
    page.unmount();
    removeStyles();
  };
}

const hideLoading = showPage(<div className="empty">{t(lang, 'loading')}</div>);
const boot = await bootDesk(window.location.search, import.meta.env.VITE_DESK_DEMO === '1');
hideLoading();

if (boot.kind === 'demo') {
  const container = createModuleContainer(element);
  mountDemo({ element, ...container }, { scripted: new URLSearchParams(window.location.search).get('script') !== 'off' });
  forwardStrayKeys(document, container.root);
} else if (boot.kind === 'ready') {
  const container = createModuleContainer(element);
  const made = await createStandaloneHost({
    container: element, portalRoot: container.portalRoot, sdkBasePath: boot.config.basePath, brand: DESK_BRAND, palette: DESK_PALETTE,
  }).then((host) => ({ host }), (error: unknown) => ({ error }));
  if ('host' in made) {
    mountDesk(container.root, made.host, { signOut: postSignOut });
    forwardStrayKeys(document, container.root);
  } else if (made.error instanceof AgentFlowError && (made.error.status === 401 || made.error.status === 403)) {
    // AgentFlow refused the session: it ended, or the app was turned off for this person. The desk's own session check
    // cannot see that. Signing in again is how the person is told which (the refusal comes back in the address).
    showPage(<SignIn lang={lang} />);
  } else {
    // AgentFlow is down or not reachable, which is no refusal: signing in would succeed and lead straight back here.
    showPage(<HostFailed lang={lang} />);
  }
} else if (boot.kind === 'signed-out') {
  showPage(<SignIn lang={lang} />);
} else {
  showPage(<div className="empty">{t(lang, 'noConfig')}</div>);
}
