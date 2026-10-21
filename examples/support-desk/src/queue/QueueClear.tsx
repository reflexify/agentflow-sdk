import { useT } from '../data/desk-context.js';
import { useHeld, useTasks, useTicketCount } from '../data/hooks.js';
import { instantMs } from '../model/instant.js';
import { shortDuration } from '../model/sla.js';
import { useNavigate } from '../shell/RouteContext.js';
import { nextClaimable } from './rows.js';

export function QueueClear({ now }: { now: Date }) {
  const tr = useT();
  const navigate = useNavigate();
  const waiting = useTicketCount(['pending']).data ?? 0;
  const held = useHeld().data?.length ?? 0;
  const dueAt = instantMs(nextClaimable(useTasks().data ?? [])?.dueAt);
  const untilDue = dueAt === null ? null : dueAt - now.getTime();
  return (
    <div className="empty">
      <h3>{tr('clearTitle')}</h3>
      <p style={{ maxWidth: '52ch', margin: 0 }}>
        {tr('clearWaiting', { n: waiting })}
        {untilDue !== null && ` ${tr(untilDue < 0 ? 'clearNextSlaOver' : 'clearNextSla', { d: shortDuration(untilDue) })}`}
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn primary" onClick={() => navigate({ screen: 'queue', folder: 'unclaimed', ticketId: null })}>{tr('clearUnclaimed')}</button>
        {held > 0 && <button className="btn" onClick={() => navigate({ screen: 'held' })}>{tr('clearHeld', { n: held })}</button>}
      </div>
    </div>
  );
}
