import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { TicketStatus } from '../model/types.js';
import { useDesk } from './desk-context.js';
import { keys } from './keys.js';
import { usePollInterval } from './live-status.js';

export function useMe() {
  const { api } = useDesk();
  return useQuery({ queryKey: keys.me, queryFn: () => api.me(), staleTime: Infinity });
}

export function usePeople() {
  const { api } = useDesk();
  return useQuery({ queryKey: keys.people, queryFn: () => api.people(), staleTime: 5 * 60_000 });
}

export function useTasks() {
  const { api } = useDesk();
  return useQuery({ queryKey: keys.tasks, queryFn: () => api.handlingTasks(), refetchInterval: usePollInterval() });
}

export function useTicket(id: string | null) {
  const { api } = useDesk();
  return useQuery({ queryKey: keys.ticket(id ?? ''), queryFn: () => api.ticket(id!), enabled: id !== null, refetchInterval: usePollInterval() });
}

export function useTickets(status: TicketStatus[]) {
  const { api } = useDesk();
  return useQuery({ queryKey: keys.tickets(status), queryFn: () => api.tickets({ status }), refetchInterval: usePollInterval() });
}

export function useTicketCount(status: TicketStatus[]) {
  const { api } = useDesk();
  return useQuery({ queryKey: keys.ticketCount(status), queryFn: () => api.countTickets({ status }), refetchInterval: usePollInterval() });
}

export function useThread(ticketId: string | null) {
  const { api } = useDesk();
  return useQuery({
    queryKey: keys.thread(ticketId ?? ''), queryFn: () => api.thread(ticketId!), enabled: ticketId !== null,
    refetchInterval: usePollInterval(),
  });
}

export function useDrafts() {
  const { api } = useDesk();
  return useQuery({ queryKey: keys.drafts, queryFn: () => api.drafts(), refetchInterval: usePollInterval() });
}

export function useHeld() {
  const { api } = useDesk();
  return useQuery({ queryKey: keys.held, queryFn: () => api.heldMessages(), refetchInterval: usePollInterval() });
}

export function useMentions(userId: string | null) {
  const { api } = useDesk();
  return useQuery({ queryKey: keys.mentions(userId ?? ''), queryFn: () => api.mentions(userId!), enabled: userId !== null, refetchInterval: usePollInterval() });
}

export function useContact(id: string | null) {
  const { api } = useDesk();
  return useQuery({ queryKey: keys.contact(id ?? ''), queryFn: () => api.contact(id!), enabled: id !== null });
}

export function useContacts(q: string) {
  const { api } = useDesk();
  return useQuery({ queryKey: keys.contacts(q), queryFn: () => api.contacts(q) });
}

/** Contacts matching `q`, fifty a page, for the list that has a "Show more". */
export function useContactPages(q: string) {
  const { api } = useDesk();
  return useInfiniteQuery({
    queryKey: keys.contactPages(q),
    queryFn: ({ pageParam }) => api.contacts(q, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });
}

export function useContactCount() {
  const { api } = useDesk();
  return useQuery({ queryKey: keys.contactCount, queryFn: () => api.countContacts() });
}

export function useContactTickets(contactId: string | null) {
  const { api } = useDesk();
  return useQuery({
    queryKey: keys.contactTickets(contactId ?? ''),
    queryFn: () => api.tickets({ status: ['new', 'open', 'pending', 'solved', 'closed'], requesterId: contactId! }, 50),
    enabled: contactId !== null,
  });
}

export function useCanned() {
  const { api } = useDesk();
  return useQuery({ queryKey: keys.canned, queryFn: () => api.cannedReplies(), refetchInterval: usePollInterval() });
}

export function useRules() {
  const { api } = useDesk();
  return useQuery({ queryKey: keys.rules, queryFn: () => api.autopilotRules(), refetchInterval: usePollInterval() });
}

export function useAiReplies(since: string) {
  const { api } = useDesk();
  return useQuery({ queryKey: keys.aiReplies(since), queryFn: () => api.aiReplies(since) });
}
