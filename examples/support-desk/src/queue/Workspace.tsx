import type { Folder } from '../shell/route.js';
import { SidePane } from '../ticket/SidePane.js';
import { TicketPane } from '../ticket/TicketPane.js';
import { QueueClear } from './QueueClear.js';
import { QueuePane, useNow } from './QueuePane.js';
import { useQueue } from './useQueue.js';

export function Workspace({ folder, ticketId }: { folder: Folder; ticketId: string | null }) {
  const now = useNow();
  const { rows, loading } = useQueue(folder);
  if (folder === 'mine' && !loading && rows.length === 0 && !ticketId) return <QueueClear now={now} />;
  return (
    <div className="ws">
      {/* Keyed by folder, so each folder starts with its own sort and cursor. */}
      <QueuePane key={folder} folder={folder} ticketId={ticketId} now={now} />
      {/* Keyed by ticket, so what the pane remembers (when it was opened, a half-written reply) is one ticket's. */}
      <TicketPane key={ticketId ?? 'none'} ticketId={ticketId} now={now} />
      {/* Keyed by ticket too, under its own key (siblings may not share one): an open requester picker belongs to the ticket it was opened on. */}
      <SidePane key={`side:${ticketId ?? 'none'}`} ticketId={ticketId} now={now} />
    </div>
  );
}
