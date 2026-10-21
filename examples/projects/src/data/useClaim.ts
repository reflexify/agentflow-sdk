import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import type { BoardTasks } from '../api/projects-api.js';
import type { Task } from '../model/types.js';
import { useProjects } from './context.js';
import { useReportFailure } from './failure.js';
import { keys } from './keys.js';

const holding = (data: BoardTasks, taskId: string, holder: string | null): BoardTasks =>
  ({ ...data, tasks: data.tasks.map((t) => (t.id === taskId ? { ...t, holder } : t)) });

/**
 * Taking a task as its primary owner. Every cached board of the task's project shows the viewer at once; a refusal
 * puts back only that task's holder, so whatever else changed in the board meanwhile stays. A second press while the
 * first is in flight does nothing. Resolves to whether the viewer now holds the task.
 */
export function useClaim(): { claim(task: Task): Promise<boolean>; isPending(taskId: string): boolean } {
  const { api, viewer } = useProjects();
  const qc = useQueryClient();
  const report = useReportFailure();
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set());
  // State lags a render behind a press; this is what stops a second press in the same tick.
  const inFlight = useRef(new Set<string>());

  const claim = useCallback(async (task: Task) => {
    if (inFlight.current.has(task.id)) return false;
    inFlight.current.add(task.id);
    setPending(new Set(inFlight.current));
    const boards = ['board', task.project] as const;
    try {
      await qc.cancelQueries({ queryKey: boards });
      const before = new Map(qc.getQueriesData<BoardTasks>({ queryKey: boards })
        .flatMap(([key, data]) => {
          const held = data?.tasks.find((t) => t.id === task.id);
          return held ? [[JSON.stringify(key), held.holder] as const] : [];
        }));
      qc.setQueriesData<BoardTasks>({ queryKey: boards }, (data) => (data ? holding(data, task.id, viewer.id) : data));
      try {
        await api.claim(task);
        return true;
      } catch (e) {
        for (const [key, data] of qc.getQueriesData<BoardTasks>({ queryKey: boards })) {
          const id = JSON.stringify(key);
          if (data && before.has(id)) qc.setQueryData<BoardTasks>(key, holding(data, task.id, before.get(id)!));
        }
        report(e, task.id);
        return false;
      }
    } finally {
      inFlight.current.delete(task.id);
      setPending(new Set(inFlight.current));
      void qc.invalidateQueries({ queryKey: ['board'] });
      void qc.invalidateQueries({ queryKey: keys.mywork });
      void qc.invalidateQueries({ queryKey: keys.task(task.id) });
    }
  }, [api, qc, report, viewer.id]);

  const isPending = useCallback((taskId: string) => pending.has(taskId), [pending]);
  return { claim, isPending };
}
