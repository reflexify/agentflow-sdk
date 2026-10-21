import type { TextKey } from '../text.js';
import { dueBucket, type DueBucket } from './dates.js';
import { between, byPosition } from './positions.js';
import type { GroupBy, Person, Priority, Project, Section, Status, Task } from './types.js';

export type ColumnKey = string;

export interface Column {
  key: ColumnKey;
  title: TextKey | null;
  label: string | null;
  tasks: Task[];
  done: Task[];
  droppable: boolean;
  sectionId?: string | null;
  personId?: string | null;
  status?: Status;
  priority?: Priority | null;
}

interface Context { sections: Section[]; people: Map<string, Person>; today: string; showCancelled: boolean }

const STATUS_TITLES: Record<Status, TextKey> = {
  todo: 'statusTodo', doing: 'statusDoing', done: 'statusDone', cancelled: 'statusCancelled',
};
const DUE_TITLES: Record<DueBucket, TextKey> = {
  overdue: 'dueOverdue', today: 'dueToday', this_week: 'dueThisWeek', later: 'dueLater', none: 'dueNone',
};
const DUE_ORDER: DueBucket[] = ['overdue', 'today', 'this_week', 'later', 'none'];
const PRIORITY_TITLES: Record<Priority, TextKey> = {
  urgent: 'priorityUrgent', high: 'priorityHigh', medium: 'priorityMedium', low: 'priorityLow',
};
const PRIORITY_ORDER: Priority[] = ['urgent', 'high', 'medium', 'low'];

// A done task with no stamp yet was completed a moment ago, after every stamped one.
const completion = (t: Task) => t.completedAt ?? '\uffff';
const newestCompletion = (a: Task, b: Task) => completion(b).localeCompare(completion(a)) || byPosition(a, b);

/** The board's order of sections: by position, the unplaced ones last, by name. */
export function sectionOrder(a: Section, b: Section): number {
  if (a.position === null && b.position === null) return a.name.localeCompare(b.name);
  if (a.position === null) return 1;
  if (b.position === null) return -1;
  return a.position - b.position || a.name.localeCompare(b.name);
}

// Outside the status grouping a done task folds into its column's `done` list and the rest follow `byPosition`.
function fill(column: Omit<Column, 'tasks' | 'done'>, members: Task[]): Column {
  return {
    ...column,
    tasks: members.filter((t) => t.status !== 'done').sort(byPosition),
    done: members.filter((t) => t.status === 'done').sort(newestCompletion),
  };
}

export function columnsFor(groupBy: GroupBy, tasks: Task[], ctx: Context): Column[] {
  const shown = ctx.showCancelled ? tasks : tasks.filter((t) => t.status !== 'cancelled');

  switch (groupBy) {
    case 'status': {
      const statuses: Status[] = ctx.showCancelled ? ['todo', 'doing', 'done', 'cancelled'] : ['todo', 'doing', 'done'];
      return statuses.map((status) => ({
        key: `status:${status}`,
        title: STATUS_TITLES[status],
        label: null,
        tasks: shown.filter((t) => t.status === status).sort(byPosition),
        done: [],
        droppable: status !== 'done',
        status,
      }));
    }
    case 'section': {
      const known = new Set(ctx.sections.map((s) => s.id));
      const unsectioned = shown.filter((t) => !t.section || !known.has(t.section));
      const columns: Column[] = [];
      if (unsectioned.length > 0) {
        columns.push(fill({ key: 'section:none', title: 'noSection', label: null, droppable: true, sectionId: null }, unsectioned));
      }
      for (const s of [...ctx.sections].sort(sectionOrder)) {
        columns.push(fill(
          { key: `section:${s.id}`, title: null, label: s.name, droppable: true, sectionId: s.id },
          shown.filter((t) => t.section === s.id),
        ));
      }
      return columns;
    }
    case 'owner': {
      const holders = [...new Set(shown.flatMap((t) => (t.holder ? [t.holder] : [])))];
      const name = (id: string) => ctx.people.get(id)?.name ?? id;
      holders.sort((a, b) => name(a).localeCompare(name(b)) || a.localeCompare(b));
      return [
        fill({ key: 'owner:none', title: 'noPrimary', label: null, droppable: true, personId: null }, shown.filter((t) => !t.holder)),
        ...holders.map((id) =>
          fill({ key: `owner:${id}`, title: null, label: name(id), droppable: true, personId: id }, shown.filter((t) => t.holder === id))),
      ];
    }
    case 'due':
      return DUE_ORDER.map((bucket) =>
        fill(
          { key: `due:${bucket}`, title: DUE_TITLES[bucket], label: null, droppable: false },
          shown.filter((t) => dueBucket(t, ctx.today) === bucket),
        ));
    case 'priority':
      return [
        ...PRIORITY_ORDER.map((priority) =>
          fill(
            { key: `priority:${priority}`, title: PRIORITY_TITLES[priority], label: null, droppable: true, priority },
            shown.filter((t) => t.priority === priority),
          )),
        fill({ key: 'priority:none', title: 'priorityNone', label: null, droppable: true, priority: null }, shown.filter((t) => t.priority === null)),
      ];
  }
}

export function defaultGroup(project: Project, sections: Section[]): GroupBy {
  return project.defaultGroupBy ?? (sections.length > 0 ? 'section' : 'status');
}

/**
 * The position that puts `draft`, a task not yet stored, first among the open cards of the column it joins under
 * `groupBy`, or `null` when no other open card is there to go above. Cards with no position sort last, so above them
 * is the first position of all.
 */
export function topOf(groupBy: GroupBy, tasks: Task[], draft: Task, ctx: Context): number | null {
  const others = tasks.filter((t) => t.id !== draft.id);
  const column = columnsFor(groupBy, [...others, { ...draft, position: null }], { ...ctx, showCancelled: true })
    .find((c) => c.tasks.some((t) => t.id === draft.id));
  const first = column?.tasks.find((t) => t.id !== draft.id);
  if (!first) return null;
  return between(null, first.position);
}

/** The fields a card takes when dropped into `column`; `null` when a drop there changes nothing. */
export function dropChanges(
  groupBy: GroupBy,
  column: Column,
): Partial<Pick<Task, 'section' | 'status' | 'priority'>> | { holder: string | null } | null {
  if (!column.droppable) return null;
  switch (groupBy) {
    case 'status': return column.status ? { status: column.status } : null;
    case 'section': return { section: column.sectionId ?? null };
    case 'owner': return { holder: column.personId ?? null };
    case 'priority': return { priority: column.priority ?? null };
    case 'due': return null;
  }
}
