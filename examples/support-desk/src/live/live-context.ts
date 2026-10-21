import { createContext, useContext } from 'react';
import { useT } from '../data/desk-context.js';
import { usePeople } from '../data/hooks.js';
import type { LiveStatus } from '../data/live-status.js';

export interface Who { id: string; name: string }
/** Who has which ticket open, by user id. */
export type PresenceMap = Record<string, string[]>;
export interface TicketPresence { viewers: Who[] }

export interface LiveApi {
  status: LiveStatus;
  /**
   * The event stream has been live on this page. Until it has (AgentFlow has it turned off, or it never connected),
   * the desk polls and says nothing about it.
   */
  pushes: boolean;
  presence: PresenceMap;
  /** The ticket this page has open, or null: the page is one of its viewers for as long as it says so. */
  watch(ticket: string | null): void;
  retry(): void;
}

const noop = () => undefined;
export const LiveContext = createContext<LiveApi>({ status: 'polling', pushes: false, presence: {}, watch: noop, retry: noop });

export const useLive = () => useContext(LiveContext);

const NOBODY: TicketPresence = { viewers: [] };
/**
 * The people with a ticket open, by name. Presence names user ids only, so a name comes from the support group's
 * list: someone outside it reads "Someone", and nobody shows until the list has loaded.
 */
export function usePresence(ticketId: string | null): TicketPresence {
  const { presence } = useLive();
  const people = usePeople();
  const tr = useT();
  const ids = ticketId ? presence[ticketId] : undefined;
  if (!ids?.length || people.isPending) return NOBODY;
  const viewers = ids.map((id) => ({ id, name: people.data?.find((p) => p.id === id)?.displayName ?? tr('someone') }));
  return { viewers: viewers.sort((a, b) => a.name.localeCompare(b.name)) };
}
