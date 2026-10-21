import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useRef, useState } from 'react';
import { isProjectsError, type BoardTasks } from '../api/projects-api.js';
import { useProjects, useT } from '../data/context.js';
import { refusalText, useReportFailure } from '../data/failure.js';
import { keys } from '../data/keys.js';
import { useToast } from '../kit/elements.js';
import type { Column, ColumnKey } from '../model/grouping.js';
import type { Section, Task } from '../model/types.js';
import type { TextKey } from '../text.js';
import { applyDrop, DropWriteFailed, orderedSections, planDrop, planSectionDrop, type DragData, type DropPlan, type DropWrite } from './drag.js';
import type { BoardData } from './useBoardData.js';

type Ref = { id: string | number; data: { current: unknown } };
export interface DropEvent { active: Ref; over: Ref | null }

/** A drag in progress: what is moving, the column a card left, and the column it shows in while it is held over another. */
export interface Dragging {
  id: string;
  kind: 'card' | 'section';
  from: ColumnKey | null;
  preview: { to: ColumnKey; index: number } | null;
  over: ColumnKey | null;
  /** The columns a card could not be dropped into, and why, decided when it was picked up. */
  refused: ReadonlyMap<ColumnKey, TextKey>;
}

type Pending = { confirm: 'cancel'; writes: DropWrite[] };
type Snapshot = { tasks: Map<string, Task>; sections: Map<string, Section> };

const findTask = (column: Column | null, id: string) =>
  column?.tasks.find((t) => t.id === id) ?? column?.done.find((t) => t.id === id) ?? null;
const dataOf = (ref: Ref | null): DragData | null => (ref?.data.current as DragData | undefined) ?? null;
const SECTION = 'section:';

/**
 * The board's drag and drop. A drop is planned from the columns as the viewer sees them, shown in the cache at once,
 * then written; a refusal before the write is a toast, and one after it puts the cache back and says why. A drop into
 * Đã huỷ waits in `pending` for a confirmation. While a card is held over another column it shows there (`columns`).
 */
export function useBoardDrop(data: BoardData, opts: {
  /** Hears that the card is about to go back where it was, before the cache moves it. */
  onBeforeRestore?(taskId: string): void;
} = {}) {
  const { api, viewer, labels, online } = useProjects();
  const tr = useT();
  const toast = useToast();
  const qc = useQueryClient();
  const report = useReportFailure();
  const project = data.project!;
  const [pending, setPending] = useState<Pending | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [dragging, setDragging] = useState<Dragging | null>(null);
  const [rolledBack, setRolledBack] = useState<ReadonlySet<string>>(new Set());
  // Read by the handlers, which dnd-kit calls between renders.
  const drag = useRef<Dragging | null>(null);
  const held = useRef<Snapshot | null>(null);
  const inFlight = useRef(false);
  // What is being dropped and not yet written: a second drop of it would race the first to a stale version.
  const dropping = useRef(new Set<string>());
  const beforeRestore = useRef(opts.onBeforeRestore);
  beforeRestore.current = opts.onBeforeRestore;

  const setDrag = useCallback((next: Dragging | null) => {
    drag.current = next;
    setDragging(next);
  }, []);

  const boards = useMemo(() => ['board', project.id] as const, [project.id]);
  const columnOf = useCallback((key: ColumnKey | null) => data.columns.find((c) => c.key === key) ?? null, [data.columns]);

  const columns = useMemo(() => withPreview(data.columns, dragging), [data.columns, dragging]);

  // Every write lands in the cache before the request goes, and what it replaced is kept to put back.
  const show = useCallback(async (writes: DropWrite[]): Promise<Snapshot> => {
    await qc.cancelQueries({ queryKey: boards });
    const snapshot: Snapshot = { tasks: new Map(), sections: new Map() };
    const taskWrites = writes.filter((w) => w.kind !== 'section');
    if (taskWrites.length > 0) {
      for (const [key, board] of qc.getQueriesData<BoardTasks>({ queryKey: boards })) {
        if (!board) continue;
        qc.setQueryData<BoardTasks>(key, {
          ...board,
          tasks: board.tasks.map((t) => {
            let next = t;
            for (const w of taskWrites) {
              if (w.task.id !== t.id) continue;
              if (!snapshot.tasks.has(t.id)) snapshot.tasks.set(t.id, t);
              next = w.kind === 'holder' ? { ...next, holder: w.user } : { ...next, ...w.changes };
            }
            return next;
          }),
        });
      }
    }
    const sectionWrites = writes.flatMap((w) => (w.kind === 'section' ? [w] : []));
    if (sectionWrites.length > 0) {
      await qc.cancelQueries({ queryKey: keys.sections(project.id) });
      qc.setQueryData<Section[]>(keys.sections(project.id), (list) => list?.map((s) => {
        const w = [...sectionWrites].reverse().find((x) => x.section.id === s.id);
        if (!w) return s;
        if (!snapshot.sections.has(s.id)) snapshot.sections.set(s.id, s);
        return { ...s, position: w.position };
      }));
    }
    return snapshot;
  }, [qc, boards, project.id]);

  // Only what the drop changed goes back, so whatever else the cache learnt meanwhile stays.
  const restore = useCallback((snapshot: Snapshot) => {
    for (const id of snapshot.tasks.keys()) beforeRestore.current?.(id);
    for (const [key, board] of qc.getQueriesData<BoardTasks>({ queryKey: boards })) {
      if (!board) continue;
      qc.setQueryData<BoardTasks>(key, { ...board, tasks: board.tasks.map((t) => snapshot.tasks.get(t.id) ?? t) });
    }
    if (snapshot.sections.size > 0) {
      qc.setQueryData<Section[]>(keys.sections(project.id), (list) => list?.map((s) => snapshot.sections.get(s.id) ?? s));
    }
  }, [qc, boards, project.id]);

  const commit = useCallback(async (writes: DropWrite[], snapshot: Snapshot) => {
    const moving = writes[writes.length - 1]!;
    try {
      await applyDrop(api, { writes });
    } catch (thrown) {
      restore(snapshot);
      // The write that failed may be one the drop renumbered: the refusal, and a reload, are about that record.
      const failed = thrown instanceof DropWriteFailed ? thrown.write : moving;
      const e = thrown instanceof DropWriteFailed ? thrown.cause : thrown;
      if (failed.kind === 'section') {
        if (isProjectsError(e, 'stale')) toast({ kind: 'info', text: tr('sectionUpdatedElsewhere') });
        else {
          if (!isProjectsError(e)) console.error(e);
          toast({ kind: 'error', text: refusalText(e, tr) || tr('saveFailed') });
        }
      } else {
        // Someone else's newer version is not the viewer's mistake: it reloads without a flash.
        if (!isProjectsError(e, 'stale') && moving.kind !== 'section') setRolledBack((now) => new Set(now).add(moving.task.id));
        report(e, failed.task.id);
      }
    } finally {
      void qc.invalidateQueries({ queryKey: boards });
      void qc.invalidateQueries({ queryKey: keys.sections(project.id) });
      if (moving.kind !== 'section') {
        void qc.invalidateQueries({ queryKey: keys.mywork });
        for (const w of writes) if (w.kind !== 'section') void qc.invalidateQueries({ queryKey: keys.task(w.task.id) });
      }
    }
  }, [api, restore, toast, tr, report, qc, boards, project.id]);

  /** `shown` runs once the board shows the drop's outcome: the cache moved, or nothing will move. */
  const carryOut = useCallback(async (plan: DropPlan, shown: () => void) => {
    if ('refuse' in plan) {
      shown();
      toast({ kind: 'error', text: tr(plan.refuse) });
      return;
    }
    if (plan.writes.length === 0) {
      shown();
      return;
    }
    const snapshot = await show(plan.writes);
    shown();
    if ('confirm' in plan) {
      held.current = snapshot;
      setPending({ confirm: plan.confirm, writes: plan.writes });
      return;
    }
    await commit(plan.writes, snapshot);
  }, [toast, tr, show, commit]);

  /** Carries a plan out with `id` locked until its writes settle, or, for one that asks first, until it is answered. */
  const locked = useCallback(async (id: string, plan: DropPlan, shown: () => void) => {
    dropping.current.add(id);
    let asking = false;
    try {
      asking = 'confirm' in plan;
      await carryOut(plan, shown);
    } finally {
      if (!asking) dropping.current.delete(id);
    }
  }, [carryOut]);

  /** Where a drop over `over` lands: the column, and the index in it as the viewer sees it. */
  const targetOf = useCallback((activeId: string, over: Ref, state: Dragging | null) => {
    const overData = dataOf(over);
    let key: ColumnKey | null = null;
    if (overData?.kind === 'column') key = overData.column;
    else if (overData?.kind === 'card') key = String(over.id) === activeId ? state?.preview?.to ?? state?.from ?? overData.column : overData.column;
    const column = columnOf(key);
    if (!key || !column) return null;
    const shown = (withPreview(data.columns, state).find((c) => c.key === key)?.tasks ?? []).map((t) => t.id);
    const at = shown.indexOf(activeId);
    const overAt = overData?.kind === 'card' ? shown.indexOf(String(over.id)) : -1;
    // A card shown in the column is moved within it, as a sortable list does; otherwise it goes before the card it is
    // over, or last.
    const index = at >= 0 ? (overAt >= 0 ? overAt : at) : overAt >= 0 ? overAt : shown.length;
    return { column, index };
  }, [columnOf, data.columns]);

  const planCard = useCallback((from: Column, to: Column, task: Task, index: number) =>
    planDrop({ groupBy: data.groupBy, from, to, task, index, viewer, project, labels, online }),
  [data.groupBy, viewer, project, labels, online]);

  const onDragStart = useCallback(({ active }: { active: Ref }) => {
    const id = String(active.id);
    const a = dataOf(active);
    if (a?.kind === 'section') {
      setDrag({ id, kind: 'section', from: null, preview: null, over: null, refused: new Map() });
      return;
    }
    if (a?.kind !== 'card') return;
    const from = columnOf(a.column);
    const task = findTask(from, id);
    const refused = new Map<ColumnKey, TextKey>();
    if (from && task) {
      for (const to of data.columns) {
        const plan = planCard(from, to, task, to.key === from.key ? to.tasks.findIndex((t) => t.id === id) : to.tasks.length);
        if ('refuse' in plan) refused.set(to.key, plan.refuse);
      }
    }
    setDrag({ id, kind: 'card', from: a.column, preview: null, over: a.column, refused });
  }, [columnOf, data.columns, planCard, setDrag]);

  const onDragOver = useCallback(({ active, over }: DropEvent) => {
    const state = drag.current;
    if (!state || state.kind !== 'card') return;
    if (!over) {
      if (state.over !== null) setDrag({ ...state, over: null });
      return;
    }
    const target = targetOf(String(active.id), over, state);
    if (!target) return;
    const key = target.column.key;
    // Over a column that would refuse it, the card shows back where it started: dropped there, that is where it goes.
    if (state.refused.has(key)) {
      if (state.over !== key || state.preview) setDrag({ ...state, over: key, preview: null });
      return;
    }
    const shownIn = state.preview?.to ?? state.from;
    if (key === shownIn) {
      if (state.over !== key) setDrag({ ...state, over: key });
      return;
    }
    setDrag({ ...state, over: key, preview: key === state.from ? null : { to: key, index: target.index } });
  }, [targetOf, setDrag]);

  const onDragCancel = useCallback(() => setDrag(null), [setDrag]);

  const onDragEnd = useCallback(async (event: DropEvent) => {
    const state = drag.current;
    const a = dataOf(event.active);
    const activeId = String(event.active.id);
    const over = event.over;
    const done = () => { if (drag.current === state) setDrag(null); };
    try {
      if (!over || !a || dropping.current.has(activeId)) return;
      if (a.kind === 'section') {
        const o = dataOf(over);
        if (o?.kind !== 'section') return;
        const sections = orderedSections(data.sections);
        const section = sections.find((s) => SECTION + s.id === activeId);
        const index = sections.findIndex((s) => SECTION + s.id === String(over.id));
        if (!section || index < 0) return;
        await locked(activeId, planSectionDrop({ sections, section, index, viewer, project, online }), done);
        return;
      }
      if (a.kind !== 'card') return;
      const from = columnOf(state?.from ?? a.column);
      const task = findTask(from, activeId);
      const target = targetOf(activeId, over, state);
      if (!from || !task || !target) return;
      await locked(activeId, planCard(from, target.column, task, target.index), done);
    } finally {
      // Cleared only once the cache shows the drop, so the card never flashes back to where it started.
      done();
    }
  }, [data.sections, locked, viewer, project, online, columnOf, targetOf, planCard, setDrag]);

  const confirmPending = useCallback(async () => {
    if (!pending || inFlight.current) return;
    inFlight.current = true;
    setConfirming(true);
    const snapshot = held.current!;
    held.current = null;
    setPending(null);
    try {
      await commit(pending.writes, snapshot);
    } finally {
      inFlight.current = false;
      setConfirming(false);
      release(pending);
    }
  }, [pending, commit]);

  const cancelPending = useCallback(() => {
    if (!pending || inFlight.current) return;
    if (held.current) restore(held.current);
    held.current = null;
    setPending(null);
    release(pending);
  }, [pending, restore]);

  const release = (asked: Pending) => {
    const last = asked.writes[asked.writes.length - 1]!;
    dropping.current.delete(last.kind === 'section' ? SECTION + last.section.id : last.task.id);
  };

  const settled = useCallback((taskId: string) => setRolledBack((now) => {
    const next = new Set(now);
    next.delete(taskId);
    return next;
  }), []);

  return {
    onDragStart, onDragOver, onDragEnd, onDragCancel,
    columns, dragging, pending, confirming, confirmPending, cancelPending, rolledBack, settled,
  };
}

/** The columns as they show while a card is held over a column it did not start in. */
function withPreview(columns: Column[], state: Dragging | null): Column[] {
  if (!state?.preview || state.kind !== 'card') return columns;
  const { id, from, preview } = state;
  const task = columns.find((c) => c.key === from)?.tasks.find((t) => t.id === id);
  if (!task) return columns;
  return columns.map((c) => {
    if (c.key === preview.to) {
      const rest = c.tasks.filter((t) => t.id !== id);
      rest.splice(Math.min(preview.index, rest.length), 0, task);
      return { ...c, tasks: rest };
    }
    if (c.key === from) return { ...c, tasks: c.tasks.filter((t) => t.id !== id) };
    return c;
  });
}
