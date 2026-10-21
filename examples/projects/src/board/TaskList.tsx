import { useState, type MouseEvent, type ReactNode } from 'react';
import { useProjects, useT } from '../data/context.js';
import { useClaim } from '../data/useClaim.js';
import { Tooltip } from '../kit/elements.js';
import { formatCount, hueOf, initials } from '../model/format.js';
import type { Column } from '../model/grouping.js';
import { can } from '../model/roles.js';
import type { Project, Task } from '../model/types.js';
import { ChevronRight, ListChecks } from '../shared/icons.js';
import { useNavigate } from '../shell/RouteContext.js';
import { withTask, type Route } from '../shell/route.js';
import { DueDate } from './DueDate.js';
import { BlockedTag, GroupMark, LabelTag, PriorityMark, StatusPill } from './marks.js';
import type { BoardData } from './useBoardData.js';

type ProjectRoute = Extract<Route, { screen: 'project' }>;

const COLUMNS = ['colTitle', 'colPrimary', 'colStatus', 'colLabel', 'colDue', 'colPriority', 'colChecklist'] as const;
const COLUMN_PART = ['title', 'primary', 'status', 'label', 'due', 'priority', 'checklist'] as const;

/**
 * The Tasks tab as tables: one per group of the board's grouping, each row a task. There is no drag here; a click
 * anywhere on a row opens its drawer.
 */
export function TaskList({ data, route }: { data: BoardData; route: ProjectRoute }) {
  const { claim, isPending } = useClaim();
  const [folded, setFolded] = useState<ReadonlySet<string>>(new Set());

  const toggle = (key: string) => setFolded((now) => {
    const next = new Set(now);
    if (!next.delete(key)) next.add(key);
    return next;
  });

  return (
    <div className="task-list">
      {data.columns.map((column) => (
        <Group
          key={column.key}
          column={column}
          data={data}
          route={route}
          folded={folded.has(column.key)}
          isPending={isPending}
          onToggle={() => toggle(column.key)}
          onClaim={(task) => void claim(task)}
        />
      ))}
    </div>
  );
}

function Group(p: {
  column: Column; data: BoardData; route: ProjectRoute; folded: boolean; isPending(taskId: string): boolean;
  onToggle(): void; onClaim(task: Task): void;
}) {
  const { column } = p;
  const tr = useT();
  const { lang } = useProjects();
  const name = column.title ? tr(column.title) : column.label ?? '';
  const rows = [...column.tasks, ...column.done];
  const panel = `list-group-${column.key}`;
  return (
    <section className="list-group" aria-labelledby={`${panel}-head`}>
      <h3 className="list-group-head" id={`${panel}-head`} data-tone={column.key === 'due:overdue' ? 'danger' : undefined}>
        <button type="button" className="group-fold" aria-expanded={!p.folded} aria-controls={panel} onClick={p.onToggle}>
          <ChevronRight size={14} className="fold-chevron" />
          <GroupMark column={column} />
          <span className="group-name">{name}</span>
          {/* Read as "Thiết kế, 2", not "Thiết kế2". */}
          <span className="sr-only">, </span>
          <span className="group-count">{formatCount(rows.length, lang)}</span>
        </button>
      </h3>
      <div className="list-panel" id={panel} hidden={p.folded}>
        <table className="task-table">
          <caption className="sr-only">{name}</caption>
          {rows.length > 0 && (
            <thead>
              <tr>
                {COLUMNS.map((key, i) => <th key={key} scope="col" data-col={COLUMN_PART[i]}>{tr(key)}</th>)}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.length === 0
              ? <tr className="list-empty"><td colSpan={COLUMNS.length}>{tr('noTasks')}</td></tr>
              : rows.map((task) => (
                <Row
                  key={task.id}
                  task={task}
                  column={column}
                  data={p.data}
                  route={p.route}
                  busy={p.isPending(task.id)}
                  onClaim={() => p.onClaim(task)}
                />
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}


function Row(p: { task: Task; column: Column; data: BoardData; route: ProjectRoute; busy: boolean; onClaim(): void }) {
  const { task } = p;
  const { people, labels, lang } = useProjects();
  const navigate = useNavigate();
  const open = () => navigate(withTask(p.route, task.id));
  const label = task.label ? labels.find((l) => l.id === task.label) : undefined;
  const ticked = task.checklist.filter((i) => i.done).length;
  const finished = task.status === 'done' || task.status === 'cancelled';

  // The title's button already opens the drawer; a press on another control in the row is that control's.
  const onRowClick = (e: MouseEvent<HTMLTableRowElement>) => {
    if ((e.target as Element).closest('button, a, input, select, textarea')) return;
    open();
  };

  const tags: ReactNode = (label || task.blocked) && (
    <span className="row-tags">
      {label && <LabelTag name={label.name} />}
      {task.blocked && <BlockedTag />}
    </span>
  );
  const checklist: ReactNode = task.checklist.length > 0 && (
    <span className="row-checklist" data-part="checklist">
      <ListChecks size={14} />
      <span>{`${ticked}/${task.checklist.length}`}</span>
    </span>
  );

  return (
    <tr
      data-task={task.id}
      data-status={task.status}
      data-done={finished ? 'true' : undefined}
      data-selected={p.route.task === task.id ? 'true' : undefined}
      onClick={onRowClick}
    >
      <th scope="row" className="list-title">
        <Tooltip text={task.title} locale={lang}>
          <button type="button" className="row-title" data-part="title" onClick={open}>{task.title}</button>
        </Tooltip>
        {(tags || checklist) && <span className="row-sub">{tags}{checklist}</span>}
      </th>
      <td data-col="primary"><Primary task={task} project={p.data.project} people={people} busy={p.busy} onClaim={p.onClaim} /></td>
      <td data-col="status"><StatusPill status={task.status} /></td>
      <td data-col="label">{tags}</td>
      <td data-col="due"><DueDate task={task} plain={p.column.key === 'due:today'} /></td>
      <td data-col="priority"><PriorityMark priority={task.priority} /></td>
      <td data-col="checklist">{checklist}</td>
    </tr>
  );
}

function Primary(p: { task: Task; project: Project | undefined; people: Map<string, { name: string }>; busy: boolean; onClaim(): void }) {
  const { task } = p;
  const { viewer, online, lang } = useProjects();
  const tr = useT();
  if (task.holder) {
    const name = p.people.get(task.holder)?.name;
    if (!name) return <span className="cell-none">—</span>;
    return (
      <span className="person" data-part="holder">
        <span className="af-avatar sm" data-hue={hueOf(task.holder)} aria-hidden="true">{initials(name)}</span>
        <Tooltip text={name} locale={lang} className="person-tip" whenCutShort><span className="person-name">{name}</span></Tooltip>
      </span>
    );
  }
  if (task.status === 'done' || task.status === 'cancelled') return null;
  const verdict = can('claim', { viewer, project: p.project ?? null, task, online });
  const locked = !verdict.ok || p.busy;
  const reason = `claim-reason-${task.id}`;
  const button = (
    <button
      type="button"
      className="af-button secondary sm claim"
      data-part="claim"
      aria-disabled={locked ? 'true' : undefined}
      aria-busy={p.busy ? 'true' : undefined}
      aria-describedby={verdict.ok ? undefined : reason}
      onClick={() => { if (!locked) p.onClaim(); }}
    >
      {tr('claim')}
    </button>
  );
  if (verdict.ok) return button;
  return (
    <>
      <Tooltip text={tr(verdict.reason)} locale={lang}>{button}</Tooltip>
      <span id={reason} className="sr-only">{tr(verdict.reason)}</span>
    </>
  );
}
