import type { ProjectsApi, TaskChanges } from '../api/projects-api.js';
import { dropChanges, sectionOrder, type Column, type ColumnKey } from '../model/grouping.js';
import { between, placeAt, STEP } from '../model/positions.js';
import { can, type Control } from '../model/roles.js';
import { statusChanges } from '../model/status.js';
import type { GroupBy, Project, Section, Task, TaskLabel, Viewer } from '../model/types.js';
import type { TextKey } from '../text.js';

export type DropWrite =
  | { kind: 'task'; task: Task; changes: TaskChanges }
  | { kind: 'holder'; task: Task; user: string | null }
  | { kind: 'section'; section: Section; position: number };

export type DropPlan = { refuse: TextKey } | { confirm: 'cancel'; writes: DropWrite[] } | { writes: DropWrite[] };

/** What dnd-kit carries for each draggable and droppable on the board. */
export type DragData = { kind: 'card'; column: ColumnKey } | { kind: 'column'; column: ColumnKey } | { kind: 'section' };

export const columnDropId = (key: ColumnKey) => `column:${key}`;
export const sectionDragId = (sectionId: string) => `section:${sectionId}`;

const refuse = (reason: TextKey): DropPlan => ({ refuse: reason });

/** The status control a move between two statuses needs; null when the stage model has no such move. */
function statusControl(from: Task['status'], to: Task['status']): Control | null {
  if (to === 'cancelled') return 'cancel';
  if (from === 'done') return to === 'doing' ? 'reopen' : null;
  if (from === 'cancelled') return to === 'todo' ? 'restore' : null;
  return 'move_status';
}

/**
 * What a card dropped at `index` of `to` (display order) writes, or why it may not land there. Every card the drop
 * renumbers is written too, before the moving one, so each of them must be one the viewer may move.
 */
export function planDrop(input: {
  groupBy: GroupBy; from: Column; to: Column; task: Task; index: number; viewer: Viewer; project: Project; labels: TaskLabel[]; online: boolean;
}): DropPlan {
  const { groupBy, from, to, task, index, viewer, project, labels, online } = input;
  if (!online) return refuse('offlineLocked');
  const ctx = (t: Task) => ({ viewer, project, task: t, online });
  const same = from.key === to.key;

  let control: Control = 'move_card';
  let changes: TaskChanges = {};
  let holder: { user: string | null } | null = null;
  if (!same) {
    if (groupBy === 'due') return refuse('dueNotDroppable');
    if (groupBy === 'status' && to.status === 'done') return refuse('completeByTick');
    const moved = dropChanges(groupBy, to);
    if (!moved) return refuse('dueNotDroppable');
    if ('holder' in moved) {
      if (task.status !== 'todo' && task.status !== 'doing') return refuse('wrongStatus');
      control = 'pick_primary';
      holder = { user: moved.holder };
    } else if (moved.status) {
      const needs = statusControl(task.status, moved.status);
      if (!needs) return refuse('wrongStatus');
      control = needs;
      changes = statusChanges(task, moved.status, labels);
    } else {
      if ('priority' in moved) control = 'edit_content';
      changes = moved;
    }
  }
  const verdict = can(control, ctx(task));
  if (!verdict.ok) return refuse(verdict.reason);

  if (same && to.tasks.findIndex((t) => t.id === task.id) === index) return { writes: [] };

  const placed = place(to.tasks, task.id, index);
  const writes: DropWrite[] = [];
  if ('renumber' in placed) {
    const byId = new Map(to.tasks.map((t) => [t.id, t] as const));
    for (const { id, position } of placed.renumber) {
      const other = byId.get(id)!;
      const may = can('move_card', ctx(other));
      if (!may.ok) return refuse(may.reason);
      writes.push({ kind: 'task', task: other, changes: { position } });
    }
  }
  if (holder) {
    // The work operations take no position, so the card's place in its new column is a write of its own.
    writes.push({ kind: 'holder', task, user: holder.user }, { kind: 'task', task, changes: { position: placed.position } });
  } else {
    writes.push({ kind: 'task', task, changes: { ...changes, position: placed.position } });
  }
  return groupBy === 'status' && to.status === 'cancelled' && !same ? { confirm: 'cancel', writes } : { writes };
}

/**
 * `placeAt`, with a renumbering that survives being cut short. Every item of the list, the moving one included, gets a
 * new number below the lowest the list holds, rising in its present order, written from its head; the moving item's
 * own move is written after them all. After any prefix of those writes the items written lead in their old order and
 * the rest follow as they were, so a write that fails partway leaves the stored order as it was. Renumbering to 1024,
 * 2048… would not: with A at 1 and B just above it, A written and B refused stores B, then the rest, then A.
 */
function place<T extends { id: string; position: number | null }>(list: T[], movingId: string, index: number):
  { position: number } | { renumber: { id: string; position: number }[]; position: number } {
  const placed = placeAt(list, movingId, index);
  if (!('renumber' in placed)) return placed;
  const known = list.flatMap((t) => (t.position === null ? [] : [t.position]));
  const floor = known.length > 0 ? Math.min(...known) : 0;
  const renumber = list.map((t, i) => ({ id: t.id, position: floor - (list.length - i) * STEP }));
  const rest = renumber.filter((r) => r.id !== movingId);
  const at = Math.max(0, Math.min(index, rest.length));
  return { renumber, position: between(rest[at - 1]?.position ?? null, rest[at]?.position ?? null)! };
}

/** The sections in the order the board shows them. */
export const orderedSections = (sections: Section[]) => [...sections].sort(sectionOrder);

/** What a section moved to `index` of the board's sections writes: its position, after any renumbering it needs. */
export function planSectionDrop(input: { sections: Section[]; section: Section; index: number; viewer: Viewer; project: Project; online: boolean }): DropPlan {
  const { section, index, viewer, project, online } = input;
  const verdict = can('sections', { viewer, project, online });
  if (!verdict.ok) return refuse(verdict.reason);
  const sections = orderedSections(input.sections);
  if (sections.findIndex((s) => s.id === section.id) === index) return { writes: [] };
  const placed = place(sections, section.id, index);
  const writes: DropWrite[] = [];
  if ('renumber' in placed) {
    const byId = new Map(sections.map((s) => [s.id, s] as const));
    for (const { id, position } of placed.renumber) writes.push({ kind: 'section', section: byId.get(id)!, position });
  }
  writes.push({ kind: 'section', section, position: placed.position });
  return { writes };
}

/** A drop's write that failed, and why: it may be a card the drop renumbered rather than the one dropped. */
export class DropWriteFailed extends Error {
  constructor(readonly write: DropWrite, override readonly cause: unknown) {
    super(cause instanceof Error ? cause.message : String(cause));
    this.name = 'DropWriteFailed';
  }
}

/**
 * Runs a plan's writes one after another, in order, and stops at the first that fails, throwing `DropWriteFailed`. A
 * record written twice is written the second time from what the first answered, or read again after a work operation,
 * which answers nothing: the first write moved its `updated_at`.
 */
export async function applyDrop(api: ProjectsApi, plan: { writes: DropWrite[] }): Promise<void> {
  // A record written once is written again from what that write answered, or read again when it answered nothing.
  const tasks = new Map<string, Task>();
  const sections = new Map<string, Section>();
  const unread = new Set<string>();
  for (const write of plan.writes) {
    try {
      if (write.kind === 'section') {
        const section = sections.get(write.section.id) ?? write.section;
        sections.set(section.id, await api.updateSection(section, { position: write.position }));
        continue;
      }
      const id = write.task.id;
      const task = unread.has(id) ? await api.task(id) : tasks.get(id) ?? write.task;
      unread.delete(id);
      if (write.kind === 'holder') {
        if (write.user) await api.assign(task, write.user);
        else await api.release(task);
        unread.add(id);
      } else {
        tasks.set(id, await api.updateTask(task, write.changes));
      }
    } catch (e) {
      throw new DropWriteFailed(write, e);
    }
  }
}
