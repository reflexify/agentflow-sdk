import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { isDeskError } from '../api/desk-api.js';
import { useDesk, useT } from '../data/desk-context.js';
import { useContact, useContactTickets } from '../data/hooks.js';
import { keys } from '../data/keys.js';
import { instantMs } from '../model/instant.js';
import { languageName } from '../model/language.js';
import type { Contact } from '../model/types.js';
import { formatWhen } from '../model/when.js';
import { initials } from '../shell/people.js';
import { useNavigate } from '../shell/RouteContext.js';
import type { TextKey } from '../text.js';
import { errorText } from '../ticket/messages.js';

export const LANGUAGES = ['en', 'vi', 'fr', 'de', 'es', 'it', 'ja', 'ko', 'zh'];

type Form = { name: string; organization: string; locale: string; notes: string };
const toForm = (c: Contact): Form => ({ name: c.name ?? '', organization: c.organization ?? '', locale: c.locale ?? '', notes: c.notes ?? '' });
const sameForm = (a: Form, b: Form) => a.name === b.name && a.organization === b.organization && a.locale === b.locale && a.notes === b.notes;

export function ContactScreen({ id, now }: { id: string; now: Date }) {
  const tr = useT();
  const { api, lang } = useDesk();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const read = useContact(id);
  const contact = read.data;
  const tickets = useContactTickets(id).data ?? [];
  // The contact as the form was filled from it. A save is checked against this, not against the newest read:
  // someone else's save that arrives while the person is typing must be refused, not written over.
  const [base, setBase] = useState<Contact | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [message, setMessage] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!contact) return;
    if (base === null) {
      setBase(contact);
      setForm(toForm(contact));
    } else if (form && sameForm(form, toForm(base)) && (instantMs(contact.updatedAt) ?? 0) > (instantMs(base.updatedAt) ?? 0)) {
      // Nothing typed yet, so the other person's save is simply what the page shows now.
      setBase(contact);
      setForm(toForm(contact));
    }
  }, [contact, base, form]);
  if (!contact && read.isError) return <div className="empty"><p role="alert">{isDeskError(read.error, 'not_found') || isDeskError(read.error, 'forbidden') ? tr('contactUnavailable') : errorText(tr, read.error)}</p></div>;
  if (!contact || !base || !form) return <div className="empty"><p>{tr('loading')}</p></div>;

  const name = base.name ?? base.email;
  const month = new Date(base.createdAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-GB', { month: 'short', year: 'numeric' });
  const languages = base.locale && !LANGUAGES.includes(base.locale) ? [base.locale, ...LANGUAGES] : LANGUAGES;
  const field = (k: keyof Form) => ({ value: form[k], onChange: (e: { target: { value: string } }) => { setForm({ ...form, [k]: e.target.value }); setMessage(null); } });

  async function save() {
    if (!base || !form) return;
    setBusy(true);
    try {
      const nul = (v: string) => v.trim() || null;
      const updated = await api.updateContact(base, { name: nul(form.name), organization: nul(form.organization), locale: nul(form.locale), notes: nul(form.notes) });
      qc.setQueryData(keys.contact(id), updated);
      setBase(updated);
      setForm(toForm(updated));
      setMessage({ tone: 'ok', text: tr('saved') });
      void qc.invalidateQueries({ queryKey: ['contacts'] });
    } catch (e) {
      if (isDeskError(e, 'stale')) {
        try {
          const fresh = await api.contact(id);
          qc.setQueryData(keys.contact(id), fresh);
          setBase(fresh);
          setForm(toForm(fresh));
          setMessage({ tone: 'bad', text: tr('staleContact') });
        } catch (again) {
          // What was typed stays; the next Save is refused again and tries the read again.
          setMessage({ tone: 'bad', text: errorText(tr, again) });
        }
      } else setMessage({ tone: 'bad', text: errorText(tr, e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="scroll">
      <div className="contact-head">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="av lg">{initials(name)}</span>
          <div><h2 style={{ fontSize: 19, fontWeight: 600 }}>{name}</h2>
            <span className="muted small">{tr(tickets.length === 1 ? 'contactSubOne' : 'contactSub', { email: base.email, month, n: tickets.length })}</span></div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button className="link" onClick={() => navigate({ screen: 'contacts' })}>{tr('allContacts')}</button></div>
      </div>
      <div className="contact-grid">
        <form className="box form" onSubmit={(e) => { e.preventDefault(); void save(); }}>
          <div className="field"><label htmlFor="cf-name">{tr('name')}</label><input id="cf-name" {...field('name')} /></div>
          <div className="field"><label htmlFor="cf-email">{tr('email')}</label><input id="cf-email" value={base.email} readOnly />
            <span className="help">{tr('emailHelp', { name })}</span></div>
          <div className="field"><label htmlFor="cf-org">{tr('organization')}</label><input id="cf-org" placeholder={tr('orgPlaceholder')} {...field('organization')} /></div>
          <div className="field"><label htmlFor="cf-lang">{tr('language')}</label>
            <select id="cf-lang" {...field('locale')}>
              <option value="">—</option>
              {languages.map((l) => <option key={l} value={l}>{languageName(l, lang)}</option>)}
            </select></div>
          <div className="field"><label htmlFor="cf-notes">{tr('notesForTeam')}</label><textarea id="cf-notes" rows={3} {...field('notes')} />
            <span className="help">{tr('notesHelp')}</span></div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn primary" type="submit" disabled={busy}>{tr('save')}</button>
            {message && <span className={message.tone === 'ok' ? 'small muted' : 'small'} role={message.tone === 'ok' ? 'status' : 'alert'} style={message.tone === 'bad' ? { color: 'var(--danger)' } : undefined}>{message.text}</span>}
          </div>
        </form>
        <div style={{ minWidth: 0, display: 'grid', gap: 10, alignContent: 'start' }}>
          <h3 style={{ fontSize: 13, fontWeight: 600 }}>{tr('ticketsLabel')}</h3>
          <ul className="tl" style={{ gap: 12 }} aria-label={tr('ticketsLabel')}>
            {tickets.map((t) => (
              <li key={t.id} className="box">
                <div className="t1">
                  <button className="link" onClick={() => navigate({ screen: 'queue', folder: t.status === 'pending' ? 'waiting' : 'open', ticketId: t.id })}>
                    <span className="mono small">{t.number}</span> · {t.subject}
                  </button>
                  <span className={`pill st-${t.status}`}>{tr(`status_${t.status}` as TextKey)}</span>
                </div>
                {t.summary && <span className="muted">{t.summary}</span>}
                <span className="small faint">{tr('ticketLine', { opened: formatWhen(t.createdAt, now, lang), last: t.lastCustomerAt ? formatWhen(t.lastCustomerAt, now, lang) : '—' })}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
