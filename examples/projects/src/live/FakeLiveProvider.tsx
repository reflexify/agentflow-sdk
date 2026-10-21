import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { MemoryServer } from '../api/memory-server.js';
import { applyChange } from './events.js';
import { LiveContext, useBrowserOnline, type Live, type LiveStatus } from './LiveProvider.js';

const NO_WATCH = () => undefined;

export interface FakeLiveControls {
  setStatus(status: LiveStatus): void;
}

/** Live updates without AgentFlow's stream: the memory server's own changes, for the demo and tests. */
export function FakeLiveProvider(props: { server: MemoryServer; onReady?: (controls: FakeLiveControls) => void; children: ReactNode }) {
  const qc = useQueryClient();
  const browserOnline = useBrowserOnline();
  const [status, setStatus] = useState<LiveStatus>('live');

  useEffect(() => props.server.onChange((c) => applyChange(qc, { entity: c.entity, id: c.id })), [props.server, qc]);

  const { onReady } = props;
  useEffect(() => {
    onReady?.({ setStatus });
  }, [onReady]);

  // It starts live, so polling here is always polling after having been live.
  const online = browserOnline && status !== 'offline' && status !== 'polling';
  const value = useMemo<Live>(
    () => ({ status: browserOnline ? status : 'offline', online, watch: NO_WATCH }),
    [browserOnline, status, online],
  );
  return <LiveContext.Provider value={value}>{props.children}</LiveContext.Provider>;
}
