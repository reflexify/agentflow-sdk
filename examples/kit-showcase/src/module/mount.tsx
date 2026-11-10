import { KIT_CSS } from '@reflexify/agentflow-elements/kit';
import type { AppHost } from '@reflexify/agentflow-sdk';
import { StrictMode, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Display } from './Display.js';
import { FormSection } from './FormSection.js';
import type { Log, ThemeMode } from './kit.js';
import { Overlays } from './Overlays.js';
import { Pages } from './Pages.js';
import { Pickers } from './Pickers.js';
import { Structure } from './Structure.js';
import css from './styles.css?inline';
import { langOf, TEXT } from './text.js';

/** What the page reads from its host: the language and the theme, which change in place. */
export type ShowcaseHost = Pick<AppHost, 'context' | 'onLocaleChange' | 'onThemeChange'>;

/** How many of the last events the page lists. */
const KEPT = 10;

/**
 * Renders the showcase in `root` and returns how to take it away again. Its one stylesheet, the kit's and its own, goes
 * into the shadow root that holds `root`.
 */
export function mountShowcase(root: ShadowRoot | Element, host: ShowcaseHost): () => void {
  const doc = root.ownerDocument;
  const scope = root instanceof ShadowRoot ? root : root.getRootNode();
  const style = doc.createElement('style');
  style.textContent = `${KIT_CSS}\n${css}`;
  (scope instanceof ShadowRoot ? scope : root).prepend(style);

  const element = doc.createElement('div');
  element.className = 'showcase af-kit';
  // Focusable itself, so a click anywhere inside puts focus in the module.
  element.tabIndex = -1;
  root.append(element);
  const react = createRoot(element);
  react.render(<StrictMode><Following host={host} element={element} /></StrictMode>);
  return () => {
    react.unmount();
    element.remove();
    style.remove();
  };
}

function Following({ host, element }: { host: ShowcaseHost; element: HTMLElement }) {
  const [locale, setLocale] = useState(host.context.locale);
  const [theme, setTheme] = useState<ThemeMode>(host.context.theme.mode);
  // Neither listener is called as it subscribes, so the context is read again once subscribed.
  useEffect(() => {
    const off = host.onLocaleChange(setLocale);
    setLocale(host.context.locale);
    return off;
  }, [host]);
  useEffect(() => {
    const off = host.onThemeChange((next) => setTheme(next.mode));
    setTheme(host.context.theme.mode);
    return off;
  }, [host]);
  const lang = langOf(locale);
  useLayoutEffect(() => {
    element.dataset.theme = theme;
    element.lang = lang;
  }, [element, theme, lang]);
  return <Showcase locale={locale} theme={theme} />;
}

function Showcase({ locale, theme }: { locale: string; theme: ThemeMode }) {
  const t = TEXT[langOf(locale)];
  const [events, setEvents] = useState<{ id: number; text: string }[]>([]);
  const log: Log = useCallback((tag, type, detail) => {
    setEvents((list) => [{ id: (list[0]?.id ?? 0) + 1, text: `${tag} ${type} ${JSON.stringify(detail ?? null)}` }, ...list].slice(0, KEPT));
  }, []);
  const section = { t, log, locale, theme };

  return (
    <div className="page">
      <header className="head">
        <h1>{t.heading}</h1>
        <p>{t.intro}</p>
      </header>
      <aside className="events card" aria-labelledby="showcase-events-heading">
        <h2 id="showcase-events-heading">{t.events}</h2>
        <ol data-testid="showcase-events" aria-live="polite">
          {events.map((event) => <li key={event.id}>{event.text}</li>)}
        </ol>
        {events.length === 0 && <p className="muted">{t.noEvents}</p>}
      </aside>
      <div className="sections">
        <Overlays {...section} />
        <Pickers {...section} />
        <Structure {...section} />
        <Pages {...section} />
        <FormSection {...section} />
        <Display {...section} />
      </div>
    </div>
  );
}
