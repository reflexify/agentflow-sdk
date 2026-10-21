import { useEffect, useState } from 'react';
import { isDeskError } from '../api/desk-api.js';
import { useT } from '../data/desk-context.js';
import { useTasks, useTicket } from '../data/hooks.js';
import { useLive } from '../live/live-context.js';
import { useQueue } from '../queue/useQueue.js';
import { useNavigate, useRoute } from '../shell/RouteContext.js';
import { Composer } from './composer/Composer.js';
import { errorText } from './messages.js';
import { Thread } from './Thread.js';
import { TicketHeader } from './TicketHeader.js';

export function TicketPane({ ticketId, now }: { ticketId: string | null; now: Date }) {
  const tr = useT();
  const { watch } = useLive();
  const read = useTicket(ticketId);
  const ticket = read.data;
  const task = (useTasks().data ?? []).find((t) => t.ticketId === ticketId) ?? null;
  const route = useRoute();
  const folder = route.screen === 'queue' ? route.folder : 'open';
  const { rows } = useQueue(folder);
  const navigate = useNavigate();
  // The ticket after this one in the list, or the first when this one has left it (marked, so no longer here).
  const openNext = () => {
    const i = rows.findIndex((r) => r.ticket.id === ticketId);
    const next = rows.find((r, j) => j > i && r.ticket.id !== ticketId) ?? rows.find((r) => r.ticket.id !== ticketId);
    navigate({ screen: 'queue', folder, ticketId: next?.ticket.id ?? null });
  };
  // A message that arrives after this moment is "New". The pane is keyed by ticket, so each ticket starts its own.
  // The moment is the real one: `now` is the desk's clock, which only ticks every 30 seconds.
  const [openedAt] = useState(() => new Date().toISOString());

  // Tells the server which ticket this person is viewing, for as long as the pane shows it.
  useEffect(() => {
    watch(ticketId);
    return () => watch(null);
  }, [ticketId, watch]);

  if (!ticketId) return <div className="convo"><div className="empty"><p>{tr('pickTicket')}</p></div></div>;
  if (!ticket && read.isError) {
    // Gone, or not this person's to open: nothing will arrive. Anything else is the connection, which the sentence names.
    const gone = isDeskError(read.error, 'not_found') || isDeskError(read.error, 'forbidden');
    return <div className="convo"><div className="empty"><p role="alert">{gone ? tr('ticketUnavailable') : errorText(tr, read.error)}</p></div></div>;
  }
  if (!ticket) return <div className="convo"><div className="empty"><p>{tr('loading')}</p></div></div>;
  return (
    <div className="convo">
      <TicketHeader key={`header:${ticket.id}`} ticket={ticket} task={task} now={now} />
      <Thread ticket={ticket} openedAt={openedAt} now={now} />
      <Composer key={`composer:${ticket.id}`} ticket={ticket} task={task} now={now} openNext={openNext} />
      <div className="hint">
        <span><kbd>R</kbd> {tr('reply').toLowerCase()}</span><span><kbd>N</kbd> {tr('note').toLowerCase()}</span>
        <span><kbd>/</kbd> {tr('savedReplies')}</span><span><kbd>S</kbd> {tr('markSolved').toLowerCase()}</span>
        <span><kbd>W</kbd> {tr('markWaiting').toLowerCase()}</span><span><kbd>E</kbd> {tr('markEscalate').toLowerCase()}</span>
        <span><kbd>⌘K</kbd> {tr('keyPalette').toLowerCase()}</span><span><kbd>?</kbd> {tr('keysTitle').toLowerCase()}</span>
      </div>
    </div>
  );
}
