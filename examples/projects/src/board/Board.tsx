import {
  closestCenter, DndContext, DragOverlay, KeyboardSensor, PointerSensor, pointerWithin, rectIntersection, useSensor, useSensors,
  type Announcements, type CollisionDetection, type DropAnimation, type KeyboardCoordinateGetter, type UniqueIdentifier,
} from '@dnd-kit/core';
import { horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS as DndCSS } from '@dnd-kit/utilities';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { BoardTasks } from '../api/projects-api.js';
import { useProjects, useT } from '../data/context.js';
import { freshestTask, useTaskMutation } from '../data/hooks.js';
import { boardScopes, keys } from '../data/keys.js';
import { useClaim } from '../data/useClaim.js';
import { Confirm, useToast } from '../kit/elements.js';
import type { Column as ColumnData, ColumnKey } from '../model/grouping.js';
import { can, rolesOf } from '../model/roles.js';
import { statusChanges } from '../model/status.js';
import type { Task } from '../model/types.js';
import { useNavigate, useRoute } from '../shell/RouteContext.js';
import { withTask } from '../shell/route.js';
import type { TextKey } from '../text.js';
import { Column, columnHeadingId, type DragKind, type RenderCard, type SectionHandle } from './Column.js';
import { sectionDragId, type DragData } from './drag.js';
import { AddSection } from './SectionHeader.js';
import { TaskCard } from './TaskCard.js';
import type { BoardData } from './useBoardData.js';
import { DROP_MS, EASE_MOVE, reducedMotion, sortTransition } from './motion.js';
import { useBoardDrop } from './useBoardDrop.js';

export { useBoardDrop };

const without = (set: ReadonlySet<string>, id: string) => {
  const next = new Set(set);
  next.delete(id);
  return next;
};

const DROP_ANIMATION: DropAnimation = { duration: DROP_MS, easing: EASE_MOVE };

const kindOf = (d: { data: { current?: unknown } }) => (d.data.current as DragData | undefined)?.kind;

/**
 * A card is over the column under the pointer (or, from the keyboard, the column its box overlaps most), and in it
 * over the nearest card; a section header is over the nearest header. Nothing else is a target for either.
 */
const collide: CollisionDetection = (args) => {
  const kind = kindOf(args.active);
  if (kind === 'section') {
    return closestCenter({ ...args, droppableContainers: args.droppableContainers.filter((c) => kindOf(c) === 'section') });
  }
  const columns = args.droppableContainers.filter((c) => kindOf(c) === 'column');
  const within = pointerWithin({ ...args, droppableContainers: columns });
  const hit = (within.length > 0 ? within : rectIntersection({ ...args, droppableContainers: columns }))[0];
  if (!hit) return [];
  const key = (columns.find((c) => c.id === hit.id)?.data.current as { column?: ColumnKey } | undefined)?.column;
  const cards = args.droppableContainers.filter((c) => {
    const d = c.data.current as DragData | undefined;
    return d?.kind === 'card' && d.column === key;
  });
  return cards.length > 0 ? closestCenter({ ...args, droppableContainers: cards }) : [hit];
};

/**
 * The arrows step a card from card to card, and into a column only where it has none to step to; a column with cards
 * as a target of its own would take the step for itself, its box being where the card already is. A section steps
 * from header to header.
 */
const keyboardCoordinates: KeyboardCoordinateGetter = (event, args) => {
  const { active, droppableContainers } = args.context;
  const kind = active ? kindOf(active) : undefined;
  const filled = new Set(droppableContainers.getEnabled().flatMap((c) => {
    const d = c.data.current as DragData | undefined;
    return d?.kind === 'card' ? [d.column] : [];
  }));
  const keep = (c: { data: { current?: unknown } }) => {
    const d = c.data.current as DragData | undefined;
    if (kind === 'section') return d?.kind === 'section';
    return d?.kind === 'card' || (d?.kind === 'column' && !filled.has(d.column));
  };
  const enabled = droppableContainers.getEnabled().filter(keep);
  // The getter reads only these two of the map.
  const filtered = { getEnabled: () => enabled, get: (id: UniqueIdentifier) => droppableContainers.get(id) } as unknown as typeof droppableContainers;
  return sortableKeyboardCoordinates(event, { ...args, context: { ...args.context, droppableContainers: filtered } });
};

/**
 * The Tasks tab as columns of cards. The board scrolls sideways and each column by itself, so the heads stay in view.
 * Grouped by section, a manager adds sections from a last, ghost column and reorders them by their heads. Cards move
 * by pointer or keyboard; a drop is written at once, except into Đã huỷ, which asks first.
 */
export function Board({ data }: { data: BoardData }) {
  const route = useRoute();
  const navigate = useNavigate();
  const { viewer, people, labels, today, lang } = useProjects();
  const tr = useT();
  const toast = useToast();
  const qc = useQueryClient();
  const { update } = useTaskMutation();
  const { claim, isPending } = useClaim();
  const [ticking, setTicking] = useState<ReadonlySet<string>>(new Set());
  const [rolledBack, setRolledBack] = useState<ReadonlySet<string>>(new Set());
  // State lags a render behind a press; this is what stops a second press in the same tick.
  const inFlight = useRef(new Set<string>());
  const project = data.project!;
  const list = useRef<HTMLUListElement>(null);
  // A section just added from the ghost column: its column's heading takes focus once the column has rendered.
  const [focusSection, setFocusSection] = useState<string | null>(null);
  useEffect(() => {
    if (!focusSection) return;
    const heading = list.current?.querySelector<HTMLElement>(`#${columnHeadingId(`section:${focusSection}`)}`);
    if (!heading) return;
    heading.focus();
    setFocusSection(null);
  }, [focusSection, data.columns]);

  // A card a drop puts back travels from where it was dropped to where it is again, once the columns have moved it.
  const travelling = useRef(new Map<string, { from: DOMRect; columns: ColumnData[] }>());
  const onBeforeRestore = useCallback((id: string) => {
    const card = list.current?.querySelector(`[data-task="${id}"]`);
    if (card) travelling.current.set(id, { from: card.getBoundingClientRect(), columns: data.columns });
  }, [data.columns]);
  useLayoutEffect(() => {
    for (const [id, { from, columns }] of travelling.current) {
      if (columns === data.columns) continue;
      travelling.current.delete(id);
      const card = list.current?.querySelector<HTMLElement>(`[data-task="${id}"]`);
      if (!card || typeof card.animate !== 'function' || reducedMotion()) continue;
      const to = card.getBoundingClientRect();
      const dx = from.left - to.left;
      const dy = from.top - to.top;
      if (dx || dy) card.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: DROP_MS, easing: EASE_MOVE });
    }
  });

  const drop = useBoardDrop(data, { onBeforeRestore });
  const dragKind: DragKind = drop.dragging?.kind ?? null;
  // The announcements run after the drag has ended, so they read the refusals of the last drag, not the current one.
  const lastRefused = useRef<ReadonlyMap<ColumnKey, TextKey>>(new Map());
  if (drop.dragging) lastRefused.current = drop.dragging.refused;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: keyboardCoordinates }),
  );

  const tick = useCallback(async (task: Task) => {
    if (inFlight.current.has(task.id)) return;
    inFlight.current.add(task.id);
    setTicking(new Set(inFlight.current));
    try {
      const from = freshestTask(qc, task);
      const saved = await update(from, statusChanges(from, 'done', labels));
      if (!saved) {
        setRolledBack((now) => new Set(now).add(task.id));
        return;
      }
      // Into the fold at once rather than after the board's next read; a board that hides done tasks drops it.
      for (const scope of boardScopes(task.project)) {
        const key = keys.board(scope);
        const board = qc.getQueryData<BoardTasks>(key);
        if (!board) continue;
        qc.setQueryData<BoardTasks>(key, {
          ...board,
          tasks: scope.done === 'hide' ? board.tasks.filter((t) => t.id !== saved.id) : board.tasks.map((t) => (t.id === saved.id ? saved : t)),
        });
      }
      // The section's done count moves with it.
      void qc.invalidateQueries({ queryKey: keys.sections(task.project) });
      toast({ kind: 'success', text: tr('taskCompleted') });
    } finally {
      inFlight.current.delete(task.id);
      setTicking(new Set(inFlight.current));
    }
  }, [update, labels, qc, toast, tr]);

  const sectionById = useMemo(() => new Map(data.sections.map((s) => [s.id, s] as const)), [data.sections]);
  const showStatus = data.groupBy === 'section';
  const columns = drop.columns;
  const columnName = useCallback((key: ColumnKey | null) => {
    const column = data.columns.find((c) => c.key === key);
    return column ? (column.title ? tr(column.title) : column.label ?? '') : '';
  }, [data.columns, tr]);
  const taskById = useMemo(() => new Map(data.columns.flatMap((c) => [...c.tasks, ...c.done]).map((t) => [t.id, t] as const)), [data.columns]);

  const renderCard: RenderCard = (task, { dimmed }) => (
    <TaskCard
      variant="board"
      task={task}
      project={project}
      people={people}
      labels={labels}
      today={today}
      showStatus={showStatus}
      busy={isPending(task.id) || ticking.has(task.id)}
      ticking={ticking.has(task.id)}
      selected={route.task === task.id}
      dimmed={dimmed}
      rolledBack={rolledBack.has(task.id) || drop.rolledBack.has(task.id)}
      onRolledBackEnd={() => {
        setRolledBack((now) => without(now, task.id));
        drop.settled(task.id);
      }}
      onOpen={() => navigate(withTask(route, task.id))}
      onTick={() => void tick(task)}
      onClaim={() => void claim(task)}
    />
  );

  const titleOf = (id: string | number) => {
    const key = String(id);
    if (key.startsWith('section:')) return sectionById.get(key.slice('section:'.length))?.name ?? '';
    return taskById.get(key)?.title ?? '';
  };
  const keyOf = (over: { id: string | number; data: { current?: unknown } }): ColumnKey | null => {
    const d = over.data.current as DragData | undefined;
    if (d?.kind === 'section') return String(over.id);
    return d?.column ?? null;
  };
  const overText = (over: { id: string | number; data: { current?: unknown } }, done: boolean) => {
    const key = keyOf(over);
    const column = columnName(key);
    const reason = key ? lastRefused.current.get(key) : undefined;
    if (reason) return tr('dragRefused', { column, reason: tr(reason) });
    return tr(done ? 'dragDropped' : 'dragMovedTo', { column });
  };
  const announcements: Announcements = {
    onDragStart: ({ active }) => tr('dragPickedUp', { title: titleOf(active.id) }),
    onDragOver: ({ over }) => (over ? overText(over, false) : undefined),
    onDragEnd: ({ over }) => (over ? overText(over, true) : undefined),
    onDragCancel: ({ active }) => {
      const d = active.data.current as DragData | undefined;
      return tr('dragCancelled', { title: titleOf(active.id), column: d?.kind === 'card' ? columnName(d.column) : titleOf(active.id) });
    },
  };

  const manager = rolesOf(viewer, project).manager;
  const sectionsMovable = data.groupBy === 'section' && manager;
  const sectionIds = columns.flatMap((c) => (c.sectionId ? [sectionDragId(c.sectionId)] : []));
  const active = drop.dragging?.kind === 'card' ? taskById.get(drop.dragging.id) : undefined;
  const dropState = (column: ColumnData) => {
    if (dragKind !== 'card' || !drop.dragging) return undefined;
    const reason = drop.dragging.refused.get(column.key);
    if (reason) return { state: 'refused' as const, reason };
    return drop.dragging.over === column.key && column.key !== drop.dragging.from ? { state: 'accept' as const } : { state: 'open' as const };
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={collide}
        accessibility={{ announcements, screenReaderInstructions: { draggable: tr('dragInstructions') } }}
        onDragStart={drop.onDragStart}
        onDragOver={drop.onDragOver}
        onDragEnd={(e) => void drop.onDragEnd(e)}
        onDragCancel={drop.onDragCancel}
      >
        <SortableContext id="sections" items={sectionIds} strategy={horizontalListSortingStrategy}>
          <ul ref={list} className="board" aria-label={tr('board', { name: project.name })} data-dragging={dragKind ?? undefined}>
            {columns.map((column) => {
              const section = column.sectionId ? sectionById.get(column.sectionId) : undefined;
              const props = { column, section, project, renderCard, dragKind, drop: dropState(column) };
              return section && sectionsMovable
                ? <SectionSlot key={column.key} {...props} section={section} dragKind={dragKind} />
                : <li key={column.key} className="column-slot"><Column {...props} /></li>;
            })}
            {data.groupBy === 'section' && manager && (
              <li className="column-slot add-slot">
                <AddSection project={project} sections={data.sections} onAdded={setFocusSection} />
              </li>
            )}
          </ul>
        </SortableContext>
        <DragOverlay zIndex={20} dropAnimation={reducedMotion() ? null : DROP_ANIMATION}>
          {active ? <div className="drag-lift" inert>{renderCard(active, { dimmed: false })}</div> : null}
        </DragOverlay>
      </DndContext>
      <Confirm
        open={drop.pending !== null}
        heading={tr('cancelTaskHeading')}
        message={tr('cancelTaskMessage')}
        confirmLabel={tr('confirmCancelTask')}
        busy={drop.confirming}
        locale={lang}
        strings={{ cancel: tr('goBack') }}
        onConfirm={() => void drop.confirmPending()}
        onCancel={() => drop.cancelPending()}
      />
    </>
  );
}

/** A section's column, which a manager drags by its head to reorder the sections. */
function SectionSlot(p: Parameters<typeof Column>[0] & { section: NonNullable<Parameters<typeof Column>[0]['section']>; dragKind: DragKind }) {
  const { viewer, online } = useProjects();
  const tr = useT();
  const movable = can('sections', { viewer, project: p.project, online }).ok;
  const sortable = useSortable({
    id: sectionDragId(p.section.id),
    data: { kind: 'section' } satisfies DragData,
    disabled: { draggable: !movable, droppable: p.dragKind === 'card' },
    attributes: { roleDescription: tr('draggableSection') },
    transition: sortTransition(),
  });
  const handle: SectionHandle = {
    movable,
    setActivator: sortable.setActivatorNodeRef,
    attributes: sortable.attributes,
    listeners: sortable.listeners,
  };
  return (
    <li
      ref={sortable.setNodeRef}
      className="column-slot"
      data-dragging={sortable.isDragging ? 'true' : undefined}
      style={{ transform: DndCSS.Translate.toString(sortable.transform), transition: sortable.transition }}
    >
      <Column {...p} handle={handle} />
    </li>
  );
}
