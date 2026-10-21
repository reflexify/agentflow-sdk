import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { isDeskError } from '../api/desk-api.js';
import { useDesk, useT } from '../data/desk-context.js';
import { useDrafts, useHeld, useMe, useMentions, useTasks, useTickets } from '../data/hooks.js';
import { keys } from '../data/keys.js';
import type { Ticket } from '../model/types.js';
import type { Folder } from '../shell/route.js';
import { useNavigate } from '../shell/RouteContext.js';
import { buildRows, folderTicketIds, nextClaimable, sortRows, type SortKey } from './rows.js';

export function useQueue(folder: Folder) {
  const { api } = useDesk();
  const me = useMe().data;
  const tasks = useTasks();
  const open = useTickets(['new', 'open']);
  const pending = useTickets(['pending']);
  const mentions = useMentions(me?.id ?? null);
  const drafts = useDrafts().data ?? [];
  const held = useHeld().data ?? [];
  const [sort, setSort] = useState<SortKey>(folder === 'open' ? 'newest' : folder === 'waiting' ? 'waiting' : 'sla');

  const ids = me ? folderTicketIds(folder, {
    meId: me.id, tasks: tasks.data ?? [], pending: pending.data ?? [], open: open.data ?? [], mentions: mentions.data ?? [],
  }) : [];
  const known = new Map<string, Ticket>([...(open.data ?? []), ...(pending.data ?? [])].map((t) => [t.id, t]));
  // A claimed or mentioned ticket outside the first 200 open ones (or solved since) is read on its own.
  const missing = ids.filter((id) => !known.has(id));
  const extra = useQueries({ queries: missing.map((id) => ({ queryKey: keys.ticket(id), queryFn: () => api.ticket(id) })) });
  for (const q of extra) if (q.data) known.set(q.data.id, q.data);

  const rows = sortRows(buildRows(ids, { tickets: known, tasks: tasks.data ?? [], drafts, held }), sort);
  // Not "clear" until the tickets that are read on their own have arrived too.
  const loading = !me || tasks.isPending || open.isPending || extra.some((q) => q.isPending);
  return { rows, loading, sort, setSort };
}

/** Claims the open task due soonest and opens it in Mine; tries the next one if someone else got there first. */
export function useNextTicket() {
  const { api } = useDesk();
  const tr = useT();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const dismiss = useCallback(() => setMessage(null), []);

  async function next() {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const tasks = await qc.fetchQuery({ queryKey: keys.tasks, queryFn: () => api.handlingTasks(), staleTime: 0 });
        const task = nextClaimable(tasks);
        if (!task) {
          setMessage(tr('nothingToClaim'));
          return;
        }
        try {
          await api.claim(task);
        } catch (e) {
          if (isDeskError(e, 'conflict')) continue;
          throw e;
        }
        await qc.invalidateQueries({ queryKey: keys.tasks });
        navigate({ screen: 'queue', folder: 'mine', ticketId: task.ticketId });
        return;
      }
      setMessage(tr('nothingToClaim'));
    } catch {
      setMessage(tr('claimFailed'));
    } finally {
      setBusy(false);
    }
  }
  return { next, busy, message, dismiss };
}
