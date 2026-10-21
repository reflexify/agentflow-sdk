import { useEffect, useRef } from 'react';
import { useT } from '../data/desk-context.js';
import { usePresence } from '../live/live-context.js';
import { firstLine } from '../model/text-tools.js';
import { slaBadge, waitingSince } from '../model/sla.js';
import { avatarTone, initials } from '../shell/people.js';
import type { QueueRow as Row } from './rows.js';

export function QueueRow(props: { row: Row; selected: boolean; meId: string; now: Date; onOpen(): void }) {
  const tr = useT();
  const { ticket, task } = props.row;
  const presence = usePresence(ticket.id);
  const others = presence.viewers.filter((v) => v.id !== props.meId);
  const sla = slaBadge(task?.dueAt ?? null, props.now);
  const waited = ticket.status === 'pending'
    ? waitingSince(ticket.pendingSince, props.now)
    : waitingSince(ticket.lastCustomerAt, props.now);
  const prio = ticket.priority === 'low' ? 'prio' : `prio ${ticket.priority}`;

  // Moving the selection with J and K must not walk it off the end of a long list.
  const row = useRef<HTMLDivElement>(null);
  const wasSelected = useRef(props.selected);
  useEffect(() => {
    if (props.selected && !wasSelected.current) row.current?.scrollIntoView?.({ block: 'nearest' });
    wasSelected.current = props.selected;
  }, [props.selected]);

  return (
    <div ref={row} className="row" role="option" aria-selected={props.selected} tabIndex={props.selected ? 0 : -1}
      onClick={props.onOpen} onKeyDown={(e) => { if (e.key === ' ') { e.preventDefault(); props.onOpen(); } }}>
      <span className={prio} />
      <div className="body">
        <div className="l1">
          <span className="who">{ticket.requesterName ?? ticket.number}</span>
          {others.length > 0 && (
            <span className="stack">
              {others.slice(0, 3).map((p) => (
                <span key={p.id} className={`av sm ${avatarTone(p.id)} viewing`} title={tr('isViewing', { name: p.name })}>{initials(p.name)}</span>
              ))}
            </span>
          )}
          {sla && <span className={`sla ${sla.tone}`}>{sla.text}</span>}
        </div>
        <div className="subj">{ticket.subject}</div>
        {ticket.summary && <div className="prev">{firstLine(ticket.summary, 140)}</div>}
        <div className="l4">
          <span className="num">{ticket.number}</span>
          {waited && <span className="wait">{tr(ticket.status === 'pending' ? 'pendingFor' : 'waitingFor', { d: waited })}</span>}
          {props.row.wouldSend ? <span className="chip ai">{tr('chipWouldSend')}</span>
            : props.row.hasDraft && <span className="chip ai">{tr('chipDraft')}</span>}
          {props.row.heldCount > 0 && <span className="chip held">{tr('chipHeld', { n: props.row.heldCount })}</span>}
          {ticket.possibleDuplicateOf && <span className="chip">{tr('chipDuplicate')}</span>}
        </div>
      </div>
    </div>
  );
}
