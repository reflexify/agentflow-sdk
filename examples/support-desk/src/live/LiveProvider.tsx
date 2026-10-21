import type { RealtimeChannel } from '@reflexify/agentflow-sdk';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useDesk } from '../data/desk-context.js';
import { applyChange, changesOf } from '../data/live-events.js';
import { LiveStatusContext, type LiveStatus } from '../data/live-status.js';
import { LiveContext, type LiveApi, type PresenceMap } from './live-context.js';
import { DESK_EVENT_TYPES, type LiveSource } from './source.js';

/** The host's channel carries every event type; the desk hears the ones it reads. */
const HEARD: ReadonlySet<string> = new Set(DESK_EVENT_TYPES);

/** Live updates and presence on the channel the desk is given. The channel is not this provider's to close. */
export function LiveProvider(props: { source: LiveSource; children: ReactNode }) {
  const qc = useQueryClient();
  const { ids } = useDesk();
  const ticketEntity = ids.entities.ticket;
  const [status, setStatus] = useState<LiveStatus>('connecting');
  const [pushes, setPushes] = useState(false);
  const [presence, setPresence] = useState<PresenceMap>({});
  const channel = useRef<RealtimeChannel | null>(null);
  // A child's effect runs before this one, so a pane that opens with the page asks to watch before there is a channel.
  const watching = useRef<string | null>(null);

  useEffect(() => {
    const ch = props.source.channel();
    channel.current = ch;
    // Presence frames are never replayed, so each connect starts from a read of everyone's. A frame that lands while
    // that read is on its way is newer than the read for its record, so the read leaves that record alone.
    let reading: Set<string> | null = null;
    const readPresence = () => {
      const touched = new Set<string>();
      reading = touched;
      props.source.readPresence(ticketEntity).then(
        (records) => {
          if (reading !== touched) return;
          reading = null;
          setPresence((current) => {
            const next: PresenceMap = {};
            for (const r of records) next[r.record_id] = r.viewers;
            for (const id of touched) if (id in current) next[id] = current[id];
            return next;
          });
        },
        // The frames still come, and the next connect reads again.
        () => {
          if (reading === touched) reading = null;
        },
      );
    };
    const off = [
      ch.onStatus((next) => {
        setStatus(next);
        if (next === 'live') {
          setPushes(true);
          readPresence();
        } else {
          // The frames sent while the stream is down are lost: who is where is unknown until it is back.
          reading = null;
          setPresence({});
        }
      }),
      ch.onEvent((event) => {
        if (!HEARD.has(event.type)) return;
        for (const change of changesOf(event, ids)) applyChange(qc, change);
      }),
      ch.onRefetch(() => {
        void qc.invalidateQueries();
        readPresence();
      }),
      ch.onPresence((p) => {
        if (p.entity_id !== ticketEntity) return;
        reading?.add(p.record_id);
        setPresence((current) => ({ ...current, [p.record_id]: p.viewers }));
      }),
      // Refused for good: every list refetches now, so a session that ended says so at once.
      ch.onRevoked(() => void qc.invalidateQueries()),
    ];
    setStatus(ch.status());
    if (watching.current) ch.watch({ entityId: ticketEntity, recordId: watching.current });
    return () => {
      for (const stop of off) stop();
      reading = null;
      // The host hands out the same channel every time and closes it when the desk unmounts. Closing it here, when
      // this effect runs again (React's development double run, a change of ids), would end live updates for good.
      ch.watch(null);
      channel.current = null;
    };
  }, [props.source, qc, ids, ticketEntity]);

  // Built once: they touch only refs, so a page that lists one in an effect's deps doesn't rerun that effect on every
  // presence update.
  const [actions] = useState<Pick<LiveApi, 'watch' | 'retry'>>(() => ({
    watch: (ticket) => {
      watching.current = ticket;
      channel.current?.watch(ticket ? { entityId: ticketEntity, recordId: ticket } : null);
    },
    retry: () => channel.current?.retry(),
  }));
  const value = useMemo<LiveApi>(() => ({ status, pushes, presence, ...actions }), [status, pushes, presence, actions]);

  return (
    <LiveStatusContext.Provider value={status}>
      <LiveContext.Provider value={value}>{props.children}</LiveContext.Provider>
    </LiveStatusContext.Provider>
  );
}
