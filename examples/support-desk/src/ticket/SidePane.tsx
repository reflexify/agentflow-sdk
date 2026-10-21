import { useState } from 'react';
import { useDesk, useT } from '../data/desk-context.js';
import { useContact, useContactTickets, useTasks, useThread, useTicket } from '../data/hooks.js';
import { intentLabel } from '../model/autopilot.js';
import { languageName } from '../model/language.js';
import { shortDuration } from '../model/sla.js';
import { draftOf } from '../model/thread.js';
import type { Priority } from '../model/types.js';
import { formatWhen } from '../model/when.js';
import { initials } from '../shell/people.js';
import { useNavigate } from '../shell/RouteContext.js';
import type { TextKey } from '../text.js';
import { ChangeRequester } from './ChangeRequester.js';

export function SidePane({ ticketId, now }: { ticketId: string | null; now: Date }) {
  const tr = useT();
  const { lang } = useDesk();
  const navigate = useNavigate();
  const ticket = useTicket(ticketId).data;
  const contact = useContact(ticket?.requesterId ?? null).data;
  const history = useContactTickets(ticket?.requesterId ?? null).data ?? [];
  const replies = useThread(ticketId).data?.replies;
  const task = (useTasks().data ?? []).find((t) => t.ticketId === ticketId) ?? null;
  const [changing, setChanging] = useState(false);
  if (!ticketId || !ticket) return <aside className="side" aria-label={tr('customer')} />;

  const locale = lang === 'vi' ? 'vi-VN' : 'en-GB';
  const earlier = history.filter((t) => t.id !== ticket.id);
  const draft = replies ? draftOf(replies, ticket.id) : null;
  const intent = draft?.intent ?? ticket.intent;
  const confidence = draft?.intentConfidence;
  const pool = task ? (task.nodeId.replace('handle_', '') as Priority) : null;
  const since = contact ? new Date(contact.createdAt).toLocaleDateString(locale, { month: 'short', year: 'numeric' }) : '';

  return (
    <aside className="side" aria-label={tr('customer')}>
      <div>
        <h3>{tr('customer')}</h3>
        <div className="box">
          {contact && (
            <>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span className="av">{initials(contact.name ?? contact.email)}</span>
                <div><b>{contact.name ?? contact.email}</b><br /><span className="small muted">{contact.email}</span></div>
              </div>
              <dl className="kv">
                <dt>{tr('organization')}</dt>
                <dd className={contact.organization ? undefined : 'faint'}>{contact.organization ?? tr('notSet')}</dd>
                <dt>{tr('language')}</dt>
                <dd className={contact.locale ? undefined : 'faint'}>{languageName(contact.locale, lang) ?? tr('notSet')}</dd>
                <dt>{tr('since')}</dt>
                <dd>{history.length === 1 ? tr('sinceValueOne', { month: since }) : tr('sinceValue', { month: since, n: history.length })}</dd>
              </dl>
              {contact.notes && (
                <div className="small" style={{ background: 'var(--note)', color: 'var(--note-ink)', borderRadius: 4, padding: '6px 8px' }}>{contact.notes}</div>
              )}
            </>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {contact && <button className="link" onClick={() => navigate({ screen: 'contact', id: contact.id })}>{tr('openContact')}</button>}
            <button className="link" onClick={() => setChanging((c) => !c)}>{tr('changeRequester')}</button>
          </div>
          {changing && <ChangeRequester ticket={ticket} onDone={() => setChanging(false)} />}
        </div>
      </div>
      <div>
        <h3>{tr('earlierTickets')}</h3>
        {earlier.length === 0
          ? <p className="small muted">{tr('noEarlier')}</p>
          : (
            <ul className="tl" aria-label={tr('earlierTickets')}>
              {earlier.map((t) => (
                <li key={t.id}>
                  <div className="t1">
                    <button className="link mono small" onClick={() => navigate({ screen: 'queue', folder: t.status === 'pending' ? 'waiting' : 'open', ticketId: t.id })}>{t.number}</button>
                    <span className={`pill st-${t.status}`}>{tr(`status_${t.status}` as TextKey)}</span>
                  </div>
                  <span>{t.summary ?? t.subject}</span>
                </li>
              ))}
            </ul>
          )}
      </div>
      <div>
        <h3>{tr('thisTicket')}</h3>
        <dl className="kv">
          <dt>{tr('opened')}</dt><dd>{formatWhen(ticket.createdAt, now, lang)}</dd>
          <dt>{tr('firstReply')}</dt>
          <dd>{ticket.firstRepliedAt ? shortDuration(new Date(ticket.firstRepliedAt).getTime() - new Date(ticket.createdAt).getTime()) : tr('notYet')}</dd>
          {intent && (
            <><dt>{tr('intent')}</dt>
              <dd>{confidence != null ? tr('intentSure', { intent: intentLabel(tr, intent), pct: Math.round(confidence * 100) }) : intentLabel(tr, intent)}</dd></>
          )}
          {pool && <><dt>{tr('pool')}</dt><dd>{tr('poolName', { priority: tr(`priority_${pool}` as TextKey) })}</dd></>}
        </dl>
      </div>
    </aside>
  );
}
