import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS as DndCSS } from '@dnd-kit/utilities';
import { useCallback, type ReactNode } from 'react';
import { useProjects, useT } from '../data/context.js';
import { Tooltip } from '../kit/elements.js';
import type { Column as ColumnData } from '../model/grouping.js';
import type { Project, Section, Task } from '../model/types.js';
import { ChevronRight, LockIcon } from '../shared/icons.js';
import type { TextKey } from '../text.js';
import { columnDropId, type DragData } from './drag.js';
import { GroupMark } from './marks.js';
import { sortTransition } from './motion.js';
import { SectionHeader } from './SectionHeader.js';

export type RenderCard = (task: Task, opts: { dimmed: boolean }) => ReactNode;
/** What is being dragged on the board, if anything. */
export type DragKind = 'card' | 'section' | null;
/** How a column takes the card being dragged: `open` for a column the card may go into but is not over. */
export type ColumnDrop = { state: 'accept' | 'open' } | { state: 'refused'; reason: TextKey };
/** What makes a section's head the handle that reorders it. */
export interface SectionHandle {
  movable: boolean;
  setActivator(el: HTMLElement | null): void;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
}

/** An id for a column's heading, unique in the module's shadow root. */
export const columnHeadingId = (key: string) => `board-col-${key.replace(/[^\w-]/g, '-')}`;

/**
 * One column of the board: its head, then its cards, which scroll by themselves under it, and at their foot the
 * column's done tasks folded away. Grouped by status there is no fold: Hoàn thành holds them itself. While a card is
 * dragged the column says whether it would take it, and a column that would not says why in its head.
 */
export function Column(p: {
  column: ColumnData; section?: Section; project: Project; renderCard: RenderCard;
  dragKind?: DragKind; drop?: ColumnDrop; handle?: SectionHandle;
}) {
  const { column } = p;
  const tr = useT();
  const headingId = columnHeadingId(column.key);
  const title = column.title ? tr(column.title) : column.label ?? '';
  const { setNodeRef } = useDroppable({
    id: columnDropId(column.key),
    data: { kind: 'column', column: column.key } satisfies DragData,
    disabled: p.dragKind === 'section',
  });
  const refusal = p.drop?.state === 'refused' ? p.drop.reason : null;
  const transition = sortTransition();
  const empty = column.tasks.length === 0 && column.done.length === 0;
  return (
    <section ref={setNodeRef} className="column" aria-labelledby={headingId} data-column={column.key} data-drop={p.drop?.state}>
      {p.section
        ? <SectionHeader section={p.section} project={p.project} headingId={headingId} handle={p.handle} />
        : <ColumnHead column={column} title={title} headingId={headingId} />}
      {refusal && (
        <p className="drop-refusal" data-part="drop-refusal">
          <LockIcon size={14} />
          {tr(refusal)}
        </p>
      )}
      <div className="column-cards">
        <SortableContext id={`cards:${column.key}`} items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <ol className="column-list" aria-labelledby={headingId}>
            {column.tasks.map((task) => (
              <CardSlot key={task.id} task={task} column={column.key} project={p.project} dragKind={p.dragKind ?? null} transition={transition}>
                {p.renderCard(task, { dimmed: false })}
              </CardSlot>
            ))}
          </ol>
        </SortableContext>
        {empty && (p.dragKind === 'card' && p.drop && p.drop.state !== 'refused'
          ? <p className="column-drop-here">{tr('dropHere')}</p>
          : <p className="column-empty">{tr('noTasks')}</p>)}
        {column.done.length > 0 && (
          <details className="fold">
            <summary className="fold-summary">
              <ChevronRight size={14} className="fold-chevron" />
              {tr('doneFold', { n: column.done.length })}
            </summary>
            <ol className="fold-list" aria-label={tr('doneFold', { n: column.done.length })}>
              {column.done.map((task) => <li key={task.id} className="card-slot">{p.renderCard(task, { dimmed: true })}</li>)}
            </ol>
          </details>
        )}
      </div>
    </section>
  );
}

/**
 * A card's place in its column, and what dnd-kit lifts. It is a group named for the task, so it is not a second
 * button around the card's own; Space or Enter on it, and only on it, picks the card up. A frozen card, or any card
 * offline or in a closed project, does not lift, and is no tab stop.
 */
function CardSlot(p: {
  task: Task; column: string; project: Project; dragKind: DragKind; transition: ReturnType<typeof sortTransition>; children: ReactNode;
}) {
  const { online } = useProjects();
  const tr = useT();
  const locked = !online || p.project.status === 'closed' || p.task.frozen;
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: p.task.id,
    data: { kind: 'card', column: p.column } satisfies DragData,
    disabled: { draggable: locked, droppable: p.dragKind === 'section' },
    attributes: { role: 'group', roleDescription: tr('draggableCard') },
    transition: p.transition,
  });
  // The slot is its own activator: without one, dnd-kit takes Space and Enter from any button inside it for a drag.
  const ref = useCallback((el: HTMLLIElement | null) => {
    setNodeRef(el);
    setActivatorNodeRef(el);
  }, [setNodeRef, setActivatorNodeRef]);
  return (
    <li
      ref={ref}
      className="card-slot"
      aria-label={p.task.title}
      data-dragging={isDragging ? 'true' : undefined}
      data-locked={locked ? 'true' : undefined}
      style={{ transform: DndCSS.Translate.toString(transform), transition }}
      // A card that cannot be lifted is no stop on the way and says nothing of dragging; its controls say why they are locked.
      {...(locked ? { role: 'group' } : attributes)}
      {...listeners}
    >
      {p.children}
    </li>
  );
}

/** The head of a column that is not a section: its mark, its name and how many tasks it holds. */
function ColumnHead({ column, title, headingId }: { column: ColumnData; title: string; headingId: string }) {
  const { lang } = useProjects();
  return (
    <div className="column-head">
      <div className="column-head-row">
        <h3 className="column-title" id={headingId} data-tone={column.key === 'due:overdue' ? 'danger' : undefined}>
          <GroupMark column={column} />
          <Tooltip text={title} locale={lang}><span className="column-name">{title}</span></Tooltip>
          {' '}<span className="sr-only">·</span>{' '}
          <span className="column-count">{column.tasks.length + column.done.length}</span>
        </h3>
      </div>
    </div>
  );
}
