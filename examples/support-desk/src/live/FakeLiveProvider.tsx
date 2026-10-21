import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { MemoryServer } from '../api/memory-server.js';
import { applyChange } from '../data/live-events.js';
import { LiveStatusContext, type LiveStatus } from '../data/live-status.js';
import { LiveContext, type LiveApi, type PresenceMap } from './live-context.js';

export interface FakeLiveControls {
  /** Who has `ticket` open, by user id, as a presence frame says. */
  setPresence(ticket: string, viewers: string[]): void;
  setStatus(status: LiveStatus): void;
}

/** Live updates without AgentFlow's stream: the memory server's changes, and presence kept in the page. */
export function FakeLiveProvider(props: { server: MemoryServer; you: string; onReady?: (c: FakeLiveControls) => void; children: ReactNode }) {
  const qc = useQueryClient();
  const [status, setStatusState] = useState<LiveStatus>('live');
  const [presence, setPresenceMap] = useState<PresenceMap>({});
  // A ref, not state: a pane's cleanup holds the actions of the render its effect ran in, and must still see who you are.
  const youRef = useRef(props.you);
  youRef.current = props.you;
  const watching = useRef<string | null>(null);

  useEffect(() => props.server.onChange((c) => {
    applyChange(qc, c.kind === 'task' ? { t: 'queue' } : { t: 'changed', ticket: c.ticketId, entity: c.entity, id: c.id });
    // A ticket's change refreshes the queue too, as the stream's does.
    if (c.kind === 'record' && c.entity === 'ticket') applyChange(qc, { t: 'queue' });
  }), [props.server, qc]);

  // Built once, like the real provider's, so a page that lists one in an effect's deps doesn't rerun it.
  const [api] = useState(() => {
    const update = (ticket: string, f: (viewers: string[]) => string[]) =>
      setPresenceMap((p) => ({ ...p, [ticket]: f(p[ticket] ?? []) }));
    const join = (ticket: string) => update(ticket, (v) => [...v.filter((id) => id !== youRef.current), youRef.current]);

    /** Offline, who is where is unknown; back on, you are on your ticket again. */
    function setStatus(next: LiveStatus) {
      setStatusState(next);
      if (next !== 'live') setPresenceMap({});
      else if (watching.current) join(watching.current);
    }

    const actions: Pick<LiveApi, 'watch' | 'retry'> = {
      watch(ticket) {
        const before = watching.current;
        if (before) update(before, (v) => v.filter((id) => id !== youRef.current));
        if (ticket) join(ticket);
        watching.current = ticket;
      },
      retry: () => setStatus('live'),
    };
    const controls: FakeLiveControls = {
      setPresence: (ticket, viewers) => setPresenceMap((p) => ({ ...p, [ticket]: viewers })),
      setStatus,
    };
    return { actions, controls };
  });

  useEffect(() => {
    props.onReady?.(api.controls);
  }, [props.onReady, api]);

  const value = useMemo<LiveApi>(() => ({ status, pushes: true, presence, ...api.actions }), [status, presence, api]);

  return (
    <LiveStatusContext.Provider value={status}>
      <LiveContext.Provider value={value}>{props.children}</LiveContext.Provider>
    </LiveStatusContext.Provider>
  );
}
