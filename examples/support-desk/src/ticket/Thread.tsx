import { useEffect, useLayoutEffect, useRef } from 'react';
import { useT } from '../data/desk-context.js';
import { useThread } from '../data/hooks.js';
import { useLive } from '../live/live-context.js';
import { instantMs } from '../model/instant.js';
import { threadItems } from '../model/thread.js';
import type { Ticket } from '../model/types.js';
import { useNavigate, useRoute } from '../shell/RouteContext.js';
import { CustomerCard, EventLine, HeldCard, NoteCard, OurCard } from './cards.js';
import { useHeldActions } from './useHeldActions.js';

export function Thread({ ticket, openedAt, now }: { ticket: Ticket; openedAt: string; now: Date }) {
  const tr = useT();
  const live = useLive();
  const route = useRoute();
  const navigate = useNavigate();
  const data = useThread(ticket.id).data;
  const held = useHeldActions();
  const items = data ? threadItems(data.replies, data.notes) : [];
  const box = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const opened = instantMs(openedAt) ?? 0;

  // Stay at the bottom as messages arrive, unless the person scrolled up to read.
  useLayoutEffect(() => {
    const el = box.current;
    if (el && pinned.current) el.scrollTop = el.scrollHeight;
  }, [items.length]);
  useEffect(() => { pinned.current = true; }, [ticket.id]);

  const name = ticket.requesterName ?? tr('someone');
  return (
    <div className="thread" ref={box} role="log" aria-label={tr('conversation')}
      onScroll={(e) => { const el = e.currentTarget; pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40; }}>
      {live.pushes && live.status === 'polling' && (
        <div className="banner warn"><span>{tr('livePaused')}</span><button className="btn" onClick={() => live.retry()}>{tr('retryNow')}</button></div>
      )}
      {items.map((item) => {
        switch (item.kind) {
          case 'customer':
            return <CustomerCard key={item.id} reply={item.reply} name={name} now={now} fresh={(instantMs(item.at) ?? 0) > opened} />;
          case 'ours':
          case 'bot':
            return <OurCard key={item.id} reply={item.reply} now={now} />;
          case 'held':
            return (
              <HeldCard key={item.id} reply={item.reply} now={now} busy={held.busy !== null}
                onAccept={() => void held.accept(item.reply)} onMove={() => void held.move(item.reply)} />
            );
          case 'note':
            return <NoteCard key={item.id} note={item.note} now={now} />;
          default:
            return <EventLine key={item.id} note={item.note} now={now} />;
        }
      })}
      {held.error && <div className="banner bad" role="alert"><span>{held.error}</span></div>}
      {held.note && <div className="banner info" role="status"><span>{held.note}</span></div>}
      {held.movedTo && (
        <div className="banner info" role="status"><span>{tr('movedTo')}</span>
          <button className="btn" onClick={() => navigate({ screen: 'queue', folder: route.screen === 'queue' ? route.folder : 'open', ticketId: held.movedTo })}>{tr('openMoved')}</button></div>
      )}
    </div>
  );
}
