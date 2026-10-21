import type { PublicEvent, RealtimeChannel, RealtimeStatus, RealtimeTarget, RecordPresence } from '@reflexify/agentflow-sdk';
import { vi, type Mock } from 'vitest';

/** A channel the test drives: it says what AgentFlow's stream would. */
export function fakeChannel() {
  const listeners = <T>() => {
    const set = new Set<T>();
    return { set, add: (listener: T) => { set.add(listener); return () => void set.delete(listener); } };
  };
  const statuses = listeners<(s: RealtimeStatus) => void>();
  const events = listeners<(e: PublicEvent) => void>();
  const refetches = listeners<() => void>();
  const presences = listeners<(p: RecordPresence) => void>();
  const revokes = listeners<() => void>();
  let now: RealtimeStatus = 'connecting';
  let closed = false;
  const watched: (RealtimeTarget | null)[] = [];
  const retry: Mock<() => void> = vi.fn();
  const channel: RealtimeChannel = {
    status: () => now,
    onStatus: statuses.add,
    onEvent: events.add,
    onRefetch: refetches.add,
    onPresence: presences.add,
    onRevoked: revokes.add,
    watch: (target) => { watched.push(target); },
    retry,
    close: () => { closed = true; },
  };
  return {
    channel,
    watched,
    retry,
    closed: () => closed,
    /** Listeners subscribed now, of every kind together. */
    listening: () => statuses.set.size + events.set.size + refetches.set.size + presences.set.size + revokes.set.size,
    setStatus: (s: RealtimeStatus) => { now = s; for (const l of statuses.set) l(s); },
    event: (e: PublicEvent) => { for (const l of events.set) l(e); },
    refetch: () => { for (const l of refetches.set) l(); },
    presence: (p: RecordPresence) => { for (const l of presences.set) l(p); },
    revoke: () => { now = 'polling'; for (const l of statuses.set) l('polling'); for (const l of revokes.set) l(); },
  };
}

export type FakeChannel = ReturnType<typeof fakeChannel>;
