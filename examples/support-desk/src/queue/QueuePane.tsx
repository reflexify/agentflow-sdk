import { useEffect, useState } from 'react';
import { useT } from '../data/desk-context.js';
import { useMe, useMentions } from '../data/hooks.js';
import { useKeys } from '../keys/KeyboardProvider.js';
import { instantMs } from '../model/instant.js';
import { CLOCK_TICK_MS } from '../model/timing.js';
import type { TextKey } from '../text.js';
import { markMentionsSeen } from '../shell/mentions-seen.js';
import type { Folder } from '../shell/route.js';
import { useNavigate } from '../shell/RouteContext.js';
import { useNextTicketControl } from './NextTicket.js';
import { QueueRow } from './QueueRow.js';
import { useQueue } from './useQueue.js';
import type { SortKey } from './rows.js';

export function useNow(everyMs = CLOCK_TICK_MS): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), everyMs);
    return () => clearInterval(id);
  }, [everyMs]);
  return now;
}

export function QueuePane({ folder, ticketId, now }: { folder: Folder; ticketId: string | null; now: Date }) {
  const tr = useT();
  const navigate = useNavigate();
  const me = useMe().data;
  const { rows, sort, setSort } = useQueue(folder);
  const nextTicket = useNextTicketControl();
  const mentions = useMentions(me?.id ?? null).data;
  const open = (id: string) => navigate({ screen: 'queue', folder, ticketId: id });
  const openIndex = rows.findIndex((r) => r.ticket.id === ticketId);
  const [cursor, setCursor] = useState(0);
  useEffect(() => { if (openIndex >= 0) setCursor(openIndex); }, [openIndex]);
  // The list can shrink under the cursor (a marked ticket leaves it), or be empty.
  const at = Math.min(cursor, Math.max(rows.length - 1, 0));

  useEffect(() => {
    if (folder === 'mentions' && me && mentions?.length) {
      markMentionsSeen(me.id, mentions.reduce((max, n) => ((instantMs(n.createdAt) ?? 0) > (instantMs(max) ?? 0) ? n.createdAt : max), ''));
    }
  }, [folder, me, mentions]);

  useKeys({
    next: () => setCursor(Math.max(Math.min(at + 1, rows.length - 1), 0)),
    prev: () => setCursor(Math.max(at - 1, 0)),
    open: () => { const r = rows[at]; if (r) open(r.ticket.id); },
  });

  const overdue = rows.filter((r) => {
    const due = instantMs(r.task?.dueAt);
    return due !== null && due < now.getTime();
  }).length;
  return (
    <div className="queue">
      <div className="qhead">
        <div className="qtitle">
          <h2>{tr(`folder_${folder}` as TextKey)}</h2>
          <button className="btn primary" title={tr('nextTicketTitle')} disabled={nextTicket.busy} onClick={() => void nextTicket.next()}>
            {tr('nextTicket')} <kbd style={{ background: 'transparent', color: 'inherit', borderColor: 'currentColor' }}>⇧N</kbd>
          </button>
        </div>
        <div className="qtools">
          <select className="sortsel" aria-label={tr('sortLabel')} value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="sla">{tr('sortSla')}</option>
            <option value="waiting">{tr('sortWaiting')}</option>
            <option value="newest">{tr('sortNewest')}</option>
          </select>
          <span className="small muted">{overdue ? tr('queueCount', { n: rows.length, overdue }) : tr('queueCountCalm', { n: rows.length })}</span>
        </div>
      </div>
      <div className="rows" role="listbox" aria-label={tr('ticketsLabel')}>
        {rows.map((row, i) => (
          <QueueRow key={row.ticket.id} row={row} meId={me?.id ?? ''} now={now}
            selected={i === at} onOpen={() => { setCursor(i); open(row.ticket.id); }} />
        ))}
      </div>
      <div className="qfoot">
        <span className="small muted"><kbd>J</kbd> <kbd>K</kbd> {tr('keysMoveOpen', { enter: '↵' })}</span>
        <span className="small muted">{tr('rings')} <span style={{ color: 'var(--view)' }}>●</span> {tr('ringViewing')}</span>
      </div>
    </div>
  );
}
