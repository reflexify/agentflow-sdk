import { AF_DEFAULT_PALETTE, applyTheme, createModuleContainer, type AppTheme } from '@reflexify/agentflow-sdk';
import type { LeaveRequest } from './leave-api.js';
import { createMemoryLeaveApi } from './memory-leave-api.js';
import { mountLeave, type ScreenHost } from './mount.js';

const SEED: LeaveRequest[] = [
  { id: 'demo-3', number: 'LV-2026-0003', type: 'annual', from: '2026-12-21', to: '2026-12-23', days: 3, status: 'submitted' },
  { id: 'demo-2', number: 'LV-2026-0002', type: 'sick', from: '2026-11-02', to: '2026-11-02', days: 1, status: 'approved' },
  { id: 'demo-1', number: 'LV-2026-0001', type: 'unpaid', from: '2026-10-05', to: '2026-10-09', days: 5, status: 'rejected' },
];

/**
 * The module on its in-memory fake, in a shadow root as AgentFlow gives it one, following the browser's language and
 * colour scheme. This is the page's code, not the module's, so it may listen on the window. `?empty` starts with no
 * requests, and `?fail` makes the first send fail.
 */
function mountDemo(element: HTMLElement): void {
  const query = new URLSearchParams(location.search);
  const api = createMemoryLeaveApi(query.has('empty') ? [] : SEED, { delayMs: 400 });
  if (query.has('fail')) api.failNextSend('The demo refuses this one request. Press Send request again.');

  const scheme = matchMedia('(prefers-color-scheme: dark)');
  const theme = (): AppTheme => ({ mode: scheme.matches ? 'dark' : 'light', brand: 'agentflow' });
  const themes = new Set<(theme: AppTheme) => void>();
  const locales = new Set<(locale: string) => void>();
  const host: ScreenHost = {
    context: { person: { id: 'demo', name: 'Demo', email: null }, org: { id: 'demo', name: 'Acme' }, locale: navigator.language, theme: theme() },
    onThemeChange(listener) {
      themes.add(listener);
      return () => void themes.delete(listener);
    },
    onLocaleChange(listener) {
      locales.add(listener);
      return () => void locales.delete(listener);
    },
  };
  scheme.addEventListener('change', () => {
    host.context.theme = theme();
    applyTheme(element, host.context.theme, AF_DEFAULT_PALETTE);
    for (const listener of themes) listener(host.context.theme);
  });
  addEventListener('languagechange', () => {
    host.context.locale = navigator.language;
    for (const listener of locales) listener(navigator.language);
  });

  applyTheme(element, host.context.theme, AF_DEFAULT_PALETTE);
  mountLeave(createModuleContainer(element).root, host, api);
}

mountDemo(document.getElementById('leave')!);
