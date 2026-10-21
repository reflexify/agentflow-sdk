import { useEffect, useMemo, useState } from 'react';
import { useDesk, useT } from '../data/desk-context.js';
import { useContactPages, useTickets } from '../data/hooks.js';
import { instantMs } from '../model/instant.js';
import { languageName } from '../model/language.js';
import { SEARCH_PAUSE_MS } from '../model/timing.js';
import { formatWhen } from '../model/when.js';
import { useNavigate } from '../shell/RouteContext.js';
import { NewContact } from './NewContact.js';

export function ContactsScreen({ now }: { now: Date }) {
  const tr = useT();
  const { lang } = useDesk();
  const navigate = useNavigate();
  const [typed, setTyped] = useState('');
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setQ(typed.trim()), SEARCH_PAUSE_MS);
    return () => clearTimeout(id);
  }, [typed]);
  const pages = useContactPages(q);
  const contacts = pages.data?.pages.flatMap((p) => p.items) ?? [];
  const open = useTickets(['new', 'open', 'pending']).data;
  // One read of the open tickets, counted per requester, instead of one read per contact.
  const byRequester = useMemo(() => {
    const m = new Map<string, { n: number; last: string | null }>();
    for (const t of open ?? []) {
      if (!t.requesterId) continue;
      const e = m.get(t.requesterId) ?? { n: 0, last: null };
      e.n += 1;
      if (t.lastCustomerAt && (!e.last || (instantMs(t.lastCustomerAt) ?? 0) > (instantMs(e.last) ?? 0))) e.last = t.lastCustomerAt;
      m.set(t.requesterId, e);
    }
    return m;
  }, [open]);

  return (
    <>
      <div className="screenhead">
        <h2>{tr('screen_contacts')}</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', minWidth: 0 }}>
          <label className="search"><span className="muted" aria-hidden="true">⌕</span>
            <input aria-label={tr('contactSearch')} placeholder={tr('contactSearch')} value={typed} onChange={(e) => setTyped(e.target.value)} /></label>
          <button className="btn primary" onClick={() => setAdding(true)}>{tr('newContact')}</button>
        </div>
      </div>
      <div className="scroll">
        {adding && <NewContact onCreated={(id) => navigate({ screen: 'contact', id })} onCancel={() => setAdding(false)} />}
        <div className="tw" style={{ paddingTop: 12 }}>
          <table>
            <thead><tr><th>{tr('colName')}</th><th>{tr('colEmail')}</th><th>{tr('colOrg')}</th><th>{tr('colLanguage')}</th><th>{tr('colOpen')}</th><th>{tr('colLast')}</th></tr></thead>
            <tbody>
              {pages.data && contacts.length === 0 && <tr><td colSpan={6} className="small muted">{tr('noContacts')}</td></tr>}
              {contacts.map((c) => {
                const t = byRequester.get(c.id);
                return (
                  <tr key={c.id}>
                    <td><button className="link" style={{ fontSize: 13.5 }} onClick={() => navigate({ screen: 'contact', id: c.id })}>{c.name ?? c.email}</button></td>
                    <td>{c.email}</td>
                    <td className={c.organization ? undefined : 'faint'}>{c.organization ?? '—'}</td>
                    <td>{languageName(c.locale, lang) ?? '—'}</td>
                    <td className="mono">{t?.n ?? 0}</td>
                    <td className="mono small">{t?.last ? formatWhen(t.last, now, lang) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {pages.hasNextPage && <button className="btn" style={{ margin: '12px 0' }} disabled={pages.isFetchingNextPage} onClick={() => void pages.fetchNextPage()}>{tr('showMore')}</button>}
        </div>
      </div>
    </>
  );
}
