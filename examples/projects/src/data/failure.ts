import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { isProjectsError } from '../api/projects-api.js';
import { useToast } from '../kit/elements.js';
import type { TextKey } from '../text.js';
import { useT } from './context.js';
import { keys } from './keys.js';

/** The platform's refusals the module says in its own words; the server's sentence for them is English. */
const PLATFORM_REFUSALS: Readonly<Record<string, TextKey>> = {
  STAGE_TRANSITION_NOT_ALLOWED: 'refusedStageMove',
  ENTITY_ACCESS_DENIED: 'refusedAccess',
  WORK_ALREADY_CLAIMED: 'refusedAlreadyClaimed',
};

/**
 * What a refusal says to the viewer: the module's text for a platform refusal it knows, else the server's sentence,
 * which for a broken rule is the message the package wrote. Null when there is neither.
 */
export function refusalText(e: unknown, tr: (key: TextKey, vars?: Record<string, string | number>) => string): string | null {
  if (!isProjectsError(e)) return null;
  const known = PLATFORM_REFUSALS[e.code];
  if (known) return tr(known);
  if (e.code === 'VALIDATION_ERROR' && e.reason?.includes("'managers' cannot be cleared")) return tr('lastManagerStays');
  return e.reason;
}

/**
 * `refusalText` for deleting a sub-label, whose refusals the module says with their numbers: the platform refuses the
 * clearing delete whole when the deleter cannot edit every task that uses the label, or when more tasks use it than one
 * delete may change. Other records' deletes have their own words, so this is for labels only.
 */
export function labelDeleteRefusalText(e: unknown, tr: (key: TextKey, vars?: Record<string, string | number>) => string): string | null {
  if (!isProjectsError(e)) return null;
  const facts = e.cascade;
  if (e.code === 'ENTITY_RECORD_CASCADE_FORBIDDEN' && facts?.forbidden !== undefined) return tr('labelInUseForbidden', { n: facts.forbidden });
  if (e.code === 'ENTITY_RECORD_CASCADE_TOO_LARGE' && facts?.found !== undefined && facts.cap !== undefined) {
    // Both numbers count the label itself, which is not a task.
    return tr('labelInUseTooMany', { n: Math.max(facts.found - 1, 0), cap: Math.max(facts.cap - 1, 0) });
  }
  return refusalText(e, tr);
}

/**
 * What every write path does with a refusal: say it in a toast and reload what the refusal shows is out of date.
 * Not an answer from the server but a fault in the module or the client is logged, never swallowed.
 */
export function useReportFailure(): (e: unknown, taskId: string) => void {
  const qc = useQueryClient();
  const toast = useToast();
  const tr = useT();
  return useCallback((e, taskId) => {
    if (isProjectsError(e, 'stale')) {
      // Someone else's version is newer: show theirs, never write over it.
      void qc.invalidateQueries({ queryKey: keys.task(taskId) });
      toast({ kind: 'info', text: tr('taskUpdatedElsewhere') });
    } else if (isProjectsError(e, 'not_found')) {
      void qc.invalidateQueries({ queryKey: keys.task(taskId) });
      void qc.invalidateQueries({ queryKey: ['board'] });
      void qc.invalidateQueries({ queryKey: keys.mywork });
      toast({ kind: 'error', text: tr('taskGone') });
    } else if (isProjectsError(e, 'offline')) {
      toast({ kind: 'error', text: tr('offlineLocked') });
    } else {
      if (!isProjectsError(e)) console.error(e);
      toast({ kind: 'error', text: refusalText(e, tr) || tr('saveFailed') });
    }
  }, [qc, toast, tr]);
}
