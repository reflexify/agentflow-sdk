import { useCallback, useEffect, useRef, useState } from 'react';
import type { LeaveApi, LeaveRequest } from './leave-api.js';
import { AlertIcon, CalendarIcon, PlusIcon, StatusIcon } from './icons.js';
import { useToasts, type ThemeMode } from './kit.js';
import { NewRequestDialog } from './NewRequestDialog.js';
import { errorText, TEXT, type Lang } from './text.js';

type Load = { state: 'loading' } | { state: 'ready'; requests: LeaveRequest[] } | { state: 'failed'; error: unknown };

/** A day as the viewer's language writes it. A day has no time zone, so it is formatted as UTC. */
const formatDay = (day: string, lang: Lang) =>
  new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${day}T00:00:00Z`));

interface Props {
  api: LeaveApi;
  lang: Lang;
  locale: string;
  theme: ThemeMode;
}

/** The list of leave requests, with a "New request" dialog. */
export function LeaveScreen({ api, lang, locale, theme }: Props) {
  const t = TEXT[lang];
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [creating, setCreating] = useState(false);
  const toasts = useToasts({ locale, theme });
  // Only the newest read may land: a retry pressed during a slow read must not be overwritten by it.
  const reads = useRef(0);

  const read = useCallback(() => {
    const mine = ++reads.current;
    setLoad({ state: 'loading' });
    api.list().then(
      (requests) => mine === reads.current && setLoad({ state: 'ready', requests }),
      (error: unknown) => mine === reads.current && setLoad({ state: 'failed', error }),
    );
  }, [api]);
  useEffect(read, [read]);

  const shown = useRef(load);
  useEffect(() => {
    shown.current = load;
  }, [load]);
  const sent = (made: LeaveRequest) => {
    // A list still loading, or one that failed, may not hold the new request: read it again rather than show it without.
    if (shown.current.state === 'ready') {
      setLoad((now) => (now.state === 'ready' ? { state: 'ready', requests: [made, ...now.requests] } : now));
    } else {
      read();
    }
    toasts.show('success', t.sent);
  };

  return (
    <div className="screen">
      <header className="head">
        <h1>{t.heading}</h1>
        {load.state === 'ready' && load.requests.length > 0 && <span className="count">{t.count(load.requests.length, locale)}</span>}
        <span className="grow" />
        <button type="button" className="af-button primary" onClick={() => setCreating(true)}>
          <PlusIcon />{t.newRequest}
        </button>
      </header>

      {load.state === 'loading' && (
        <div className="panel" aria-busy="true">
          <span className="sr-only" role="status">{t.loading}</span>
          <div className="skeleton" aria-hidden="true">
            {[60, 45, 70, 50].map((w) => (
              <div className="skeleton-row" key={w}>
                <span className="af-skeleton" style={{ width: `${w}%` }} />
                <span className="af-skeleton pill-shape" />
              </div>
            ))}
          </div>
        </div>
      )}

      {load.state === 'failed' && (
        <div className="state" role="alert">
          <span className="state-icon danger"><AlertIcon /></span>
          <h2>{t.loadFailed}</h2>
          <p>{errorText(load.error, t, t.retryHint)}</p>
          <button type="button" className="af-button secondary" onClick={read}>{t.retry}</button>
        </div>
      )}

      {load.state === 'ready' && load.requests.length === 0 && (
        <div className="state">
          <span className="state-icon"><CalendarIcon /></span>
          <h2>{t.emptyTitle}</h2>
          <p>{t.emptyBody}</p>
        </div>
      )}

      {load.state === 'ready' && load.requests.length > 0 && (
        <div className="panel">
          <table className="table">
            <caption className="sr-only">{t.caption}</caption>
            <thead>
              <tr>
                <th scope="col">{t.colNumber}</th>
                <th scope="col">{t.colType}</th>
                <th scope="col">{t.colDates}</th>
                <th scope="col" className="col-days">{t.colDays}</th>
                <th scope="col" className="col-status">{t.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {load.requests.map((r) => (
                <tr key={r.id}>
                  <td className="number">{r.number}</td>
                  <td>{t.type[r.type]}</td>
                  <td className="dates">
                    <time dateTime={r.from}>{formatDay(r.from, lang)}</time>
                    {r.to !== r.from && <> – <time dateTime={r.to}>{formatDay(r.to, lang)}</time></>}
                  </td>
                  <td className="col-days">{r.days ?? ''}</td>
                  <td className="col-status">
                    <span className="pill" data-status={r.status}><StatusIcon status={r.status} />{t.status[r.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NewRequestDialog open={creating} api={api} lang={lang} locale={locale} theme={theme}
        onSent={sent} onClose={() => setCreating(false)} />
      {toasts.region}
    </div>
  );
}
