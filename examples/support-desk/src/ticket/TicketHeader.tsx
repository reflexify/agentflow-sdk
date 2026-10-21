import type { HandlingAction, QueueTask } from '../api/desk-api.js';
import { useDesk, useT } from '../data/desk-context.js';
import { useMe } from '../data/hooks.js';
import { useCommands, useKeys } from '../keys/KeyboardProvider.js';
import { usePresence } from '../live/live-context.js';
import { slaBadge } from '../model/sla.js';
import type { Priority, Ticket } from '../model/types.js';
import { avatarTone, initials } from '../shell/people.js';
import type { TextKey } from '../text.js';
import { HandOver } from './HandOver.js';
import { useTicketActions } from './useTicketActions.js';

const PRIORITIES: Priority[] = ['urgent', 'high', 'normal', 'low'];
const ACTIONS: { action: HandlingAction; label: TextKey; key: string }[] = [
  { action: 'solved', label: 'markSolved', key: 'S' },
  { action: 'waiting', label: 'markWaiting', key: 'W' },
  { action: 'escalate', label: 'markEscalate', key: 'E' },
];

export function TicketHeader({ ticket, task, now }: { ticket: Ticket; task: QueueTask | null; now: Date }) {
  const tr = useT();
  const { lang } = useDesk();
  const me = useMe().data;
  const actions = useTicketActions(ticket, task);
  const presence = usePresence(ticket.id);
  const sla = slaBadge(task?.dueAt ?? null, now);
  const dueAt = task?.dueAt
    ? new Date(task.dueAt).toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-GB', { hour: '2-digit', minute: '2-digit' })
    : '';
  const claimText = actions.mine ? tr('claimedByYou') : task?.status === 'open' ? tr('unclaimed') : tr('notInQueue');
  const others = presence.viewers.filter((v) => v.id !== me?.id);
  const title = tr('paletteTicket', { number: ticket.number });

  useKeys({
    solved: () => void actions.mark('solved'),
    waiting: () => void actions.mark('waiting'),
    escalate: () => void actions.mark('escalate'),
  });
  useCommands(actions.canMark ? [
    ...ACTIONS.map(({ action, label, key }) => ({
      id: `mark-${action}`, section: 'ticket' as const, title,
      label: tr('cmdMark', { action: tr(label) }), hint: key, run: () => void actions.mark(action),
    })),
    ...(task?.status === 'open'
      ? [{ id: 'claim', section: 'ticket' as const, title, label: tr('cmdClaim'), run: () => void actions.claim() }]
      : []),
    ...(actions.mine
      ? [{ id: 'release', section: 'ticket' as const, title, label: tr('cmdRelease'), run: () => void actions.release() }]
      : []),
  ] : []);

  return (
    <div className="chead">
      <div className="ct">
        <div>
          <h2>{ticket.subject}</h2>
          <div className="cmeta">
            <span className="mono">{ticket.number}</span>
            <span className={`pill st-${ticket.status}`}>{tr(`status_${ticket.status}` as TextKey)}</span>
            <label>{tr('priority')}{' '}
              <select aria-label={tr('priority')} aria-describedby={task ? 'priority-hint' : undefined}
                value={ticket.priority} disabled={actions.busy !== null}
                onChange={(e) => void actions.setPriority(e.target.value as Priority)}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{tr(`priority_${p}` as TextKey)}</option>)}
              </select>
            </label>
            {task && <span id="priority-hint">{tr('priorityHint')}{actions.canMark && ` ${tr('priorityHintEscalate')}`}</span>}
            {sla && <span className={`sla ${sla.tone}`}>{tr('slaDue', { left: sla.text, at: dueAt })}</span>}
            <span>{claimText}</span>
          </div>
        </div>
        {others.length > 0 && (
          <div className="stack" aria-label={tr('peopleOnTicket')}>
            {others.map((p) => (
              <span key={p.id} className={`av sm ${avatarTone(p.id)} viewing`} title={tr('isViewing', { name: p.name })}>{initials(p.name)}</span>
            ))}
          </div>
        )}
      </div>
      <div className="cact">
        {actions.canMark && ACTIONS.map(({ action, label, key }) => (
          <button key={action} className="btn" disabled={actions.busy !== null} onClick={() => void actions.mark(action)}>
            {tr(label)} <kbd>{key}</kbd>
          </button>
        ))}
        {actions.mine && <button className="btn quiet" disabled={actions.busy !== null} onClick={() => void actions.release()}>{tr('release')}</button>}
        {task?.status === 'open' && <button className="btn quiet" disabled={actions.busy !== null} onClick={() => void actions.claim()}>{tr('claim')}</button>}
        {actions.mine && <HandOver disabled={actions.busy !== null} onPick={(id) => void actions.handOver(id)} />}
      </div>
      {ticket.summary && <div className="summary"><b>{tr('summary')}</b><span>{ticket.summary}</span></div>}
      {actions.error && <div className="banner bad" role="alert"><span>{actions.error}</span></div>}
    </div>
  );
}
