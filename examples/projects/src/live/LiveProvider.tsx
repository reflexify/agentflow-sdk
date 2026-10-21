import type { AppHost, RealtimeChannel, RealtimeStatus, RealtimeTarget } from '@reflexify/agentflow-sdk';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useProjectsBase } from '../data/context.js';
import { applyChange, changesOf } from './events.js';

export type LiveStatus = RealtimeStatus | 'offline';

export interface Live {
  status: LiveStatus;
  /** Whether writes may be tried: the browser is online and the stream has not been lost since it was last live. */
  online: boolean;
  /** The task the page has open, or null: the host keeps the page one of its viewers while it says so. */
  watch(task: RealtimeTarget | null): void;
}

export const LiveContext = createContext<Live>({ status: 'connecting', online: true, watch: () => undefined });

export const useLive = (): Live => useContext(LiveContext);

/** `navigator.onLine`, heard through `window`'s `online` and `offline` events. */
export function useBrowserOnline(): boolean {
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine !== false);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    setOnline(navigator.onLine !== false);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

/** Live updates on the host's channel. The channel is the host's: this provider never closes it. */
export function LiveProvider({ host, children }: { host: AppHost; children: ReactNode }) {
  const qc = useQueryClient();
  const { ids } = useProjectsBase();
  const browserOnline = useBrowserOnline();
  const [status, setStatus] = useState<RealtimeStatus>('connecting');
  const [wasLive, setWasLive] = useState(false);
  const channel = useRef<RealtimeChannel | null>(null);
  // A child's effect runs before this one, so a drawer that opens with the page asks to watch before there is a channel.
  const watching = useRef<RealtimeTarget | null>(null);

  useEffect(() => {
    // Read here and not before: a host opens its stream the first time `realtime` is read.
    const ch = host.realtime;
    channel.current = ch;
    const seen = (next: RealtimeStatus) => {
      setStatus(next);
      if (next === 'live') setWasLive(true);
    };
    const off = [
      ch.onStatus(seen),
      ch.onEvent((event) => {
        for (const change of changesOf(event, ids)) applyChange(qc, change);
      }),
      ch.onRefetch(() => void qc.invalidateQueries()),
      // Refused for good: every read runs again now, so an access that ended shows at once.
      ch.onRevoked(() => void qc.invalidateQueries()),
    ];
    seen(ch.status());
    if (watching.current) ch.watch(watching.current);
    return () => {
      for (const stop of off) stop();
      // The host hands out the same channel every time and closes it when the module unmounts. Closing it here, when
      // this effect runs again (React's development double run), would end live updates for good.
      ch.watch(null);
      channel.current = null;
    };
  }, [host, qc, ids]);

  // Built once: it touches only refs, so a drawer that lists it in an effect's deps doesn't rerun that effect.
  const [watch] = useState(() => (target: RealtimeTarget | null) => {
    watching.current = target;
    channel.current?.watch(target);
  });
  const online = browserOnline && !(status === 'polling' && wasLive);
  const value = useMemo<Live>(
    () => ({ status: browserOnline ? status : 'offline', online, watch }),
    [browserOnline, status, online, watch],
  );
  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}
