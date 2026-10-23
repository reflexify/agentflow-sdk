import type { ReactNode } from 'react';
import { useProjects, useT } from '../data/context.js';
import { Tooltip } from '../kit/elements.js';
import { hueOf, initials } from '../model/format.js';
import { can, type Verdict } from '../model/roles.js';
import type { Person, Project, Task, TaskLabel } from '../model/types.js';
import { CheckIcon, ListChecks, Paperclip, StatusGlyph } from '../shared/icons.js';
import { plainMentions } from '../shared/mentions.js';
import { DueDate } from './DueDate.js';
import { BlockedTag, LabelTag, StatusPill } from './marks.js';

/** How many unticked checklist items a card lists before it says how many more there are. */
const CARD_ITEMS = 5;

export interface TaskCardProps {
  task: Task;
  project: Project | undefined;
  people: Map<string, Person>;
  labels: TaskLabel[];
  today: string;
  onOpen(): void;
  onTick(): void;
  onClaim(): void;
  /** `board` is the card in a column; `row` (the default) is My Work's, which also names the task's project. */
  variant?: 'board' | 'row';
  /** The viewer's part in the task, shown where the card is not under a project. */
  roleChip?: string;
  /** Show the task's status pill, for a card grouped by something else than its status. */
  showStatus?: boolean;
  /** The server listed this task as work offered to the viewer, so who may take it is its answer, not the project's roles. */
  claimOffered?: boolean;
  /** A write on this card is in flight: its controls lock until it settles. */
  busy?: boolean;
  /** The tick was pressed and its write is in flight: the circle shows done at once. */
  ticking?: boolean;
  /** Its drawer is open. */
  selected?: boolean;
  /** In the fold of done tasks. */
  dimmed?: boolean;
  /** A write on it was just refused and put back: it flashes once. */
  rolledBack?: boolean;
  onRolledBackEnd?(): void;
}

/** The locks that hold for an offered task whoever it is offered to: the server has already decided who may take it. */
function offeredClaim(task: Task, project: Project | undefined, online: boolean): Verdict {
  if (!online) return { ok: false, reason: 'offlineLocked', hidden: false };
  if (project?.status === 'closed') return { ok: false, reason: 'projectClosedLocked', hidden: false };
  if (task.frozen) return { ok: false, reason: 'taskFrozenLocked', hidden: false };
  if (task.holder !== null) return { ok: false, reason: 'alreadyHeld', hidden: false };
  return { ok: true };
}

/** A locked control keeps its place and focus, and says why in a tooltip and in a description a screen reader reads. */
function Locked({ verdict, id, control }: { verdict: Verdict; id: string; control: (describedBy?: string) => ReactNode }) {
  const { lang } = useProjects();
  const tr = useT();
  if (verdict.ok) return <>{control()}</>;
  return (
    <>
      <Tooltip text={tr(verdict.reason)} locale={lang}>{control(id)}</Tooltip>
      <span id={id} className="sr-only">{tr(verdict.reason)}</span>
    </>
  );
}

/**
 * The card of a task. It is an `<article>` with no role of its own: the title is the button that opens it, and the
 * tick, the holder and the claim button sit beside that button, never inside it. Its head is the tick, the title and
 * the holder; under it the chips, then the meta: due, checklist, attachments and, with no holder, the claim.
 */
export function TaskCard(p: TaskCardProps) {
  const { task } = p;
  const { viewer, online, lang } = useProjects();
  const tr = useT();
  const board = p.variant === 'board';
  const ctx = { viewer, project: p.project ?? null, task, online };
  const tick = can('complete', ctx);
  const claim = p.claimOffered ? offeredClaim(task, p.project, online) : can('claim', ctx);
  const holder = task.holder ? p.people.get(task.holder) : undefined;
  // A row of My Work already says the viewer's part in its role tag; their own avatar on every row would say it again.
  const showHolder = holder && (board || holder.id !== viewer.id);
  const label = task.label ? p.labels.find((l) => l.id === task.label) : undefined;
  const ticked = task.checklist.filter((i) => i.done).length;
  const open = task.checklist.filter((i) => !i.done);
  const finished = task.status === 'done' || task.status === 'cancelled';

  const tickLocked = !tick.ok || !!p.busy;
  const tickSlot = !tick.ok && tick.hidden
    // A finished task has no tick to press; its mark keeps the column of titles aligned.
    ? <span className="tick-mark" data-status={task.status} aria-hidden="true"><StatusGlyph status={task.status} size={20} /></span>
    : (
      <Locked
        verdict={tick}
        id={`tick-reason-${task.id}`}
        control={(describedBy) => (
          <button
            type="button"
            className="tick"
            data-part="tick"
            data-state={p.ticking ? 'ticking' : undefined}
            aria-label={tr('completeTask', { title: task.title })}
            aria-disabled={tickLocked ? 'true' : undefined}
            aria-busy={p.ticking ? 'true' : undefined}
            aria-describedby={describedBy}
            onClick={() => { if (!tickLocked) p.onTick(); }}
          >
            <CheckIcon size={12} />
          </button>
        )}
      />
    );

  const claimLocked = !claim.ok || !!p.busy;
  const claimSlot = !holder && task.holder === null && !finished && (
    <Locked
      verdict={claim}
      id={`claim-reason-${task.id}`}
      control={(describedBy) => (
        <button
          type="button"
          className="af-button secondary sm claim"
          data-part="claim"
          aria-disabled={claimLocked ? 'true' : undefined}
          aria-busy={p.busy ? 'true' : undefined}
          aria-describedby={describedBy}
          onClick={() => { if (!claimLocked) p.onClaim(); }}
        >
          {tr('claim')}
        </button>
      )}
    />
  );

  const titleButton = <button type="button" className="card-title" data-part="title" onClick={p.onOpen}>{task.title}</button>;
  const chips = [
    p.roleChip && <span key="role" className="tag" data-part="role">{p.roleChip}</span>,
    label && <LabelTag key="label" name={label.name} />,
    task.blocked && <BlockedTag key="blocked" />,
    p.showStatus && <StatusPill key="status" status={task.status} />,
  ].filter(Boolean);

  return (
    <article
      className="task-card"
      aria-label={task.title}
      data-variant={board ? 'board' : 'row'}
      data-task={task.id}
      data-status={task.status}
      data-selected={p.selected ? 'true' : undefined}
      data-dimmed={p.dimmed ? 'true' : undefined}
      data-rolled-back={p.rolledBack ? '' : undefined}
      onAnimationEnd={(e) => { if (e.animationName === 'card-rolled-back') p.onRolledBackEnd?.(); }}
    >
      <div className="card-head">
        {tickSlot}
        <Tooltip text={task.title} locale={lang} className="card-tip" whenCutShort={!board}>{titleButton}</Tooltip>
        {showHolder && (
          <span className="af-avatar" data-part="holder" data-hue={hueOf(holder.id)} title={holder.name} role="img" aria-label={holder.name}>
            {initials(holder.name)}
          </span>
        )}
      </div>
      {chips.length > 0 && <div className="card-chips">{chips}</div>}
      {board && task.showChecklistOnCard && open.length > 0 && (
        <ul className="card-checklist" data-part="checklist-items">
          {open.slice(0, CARD_ITEMS).map((item) => <li key={item.id}>{plainMentions(item.text, task.mentions, tr)}</li>)}
          {open.length > CARD_ITEMS && <li className="card-checklist-more">{tr('checklistMore', { n: open.length - CARD_ITEMS })}</li>}
        </ul>
      )}
      <div className="card-meta">
        {!board && p.project && <span className="card-project" data-part="project">{p.project.name}</span>}
        {task.due && <span className="card-due" data-part="due"><DueDate task={task} /></span>}
        {task.checklist.length > 0 && (
          <span className="card-count" data-part="checklist" role="img" aria-label={tr('checklistCount', { done: ticked, total: task.checklist.length })}>
            <ListChecks size={14} />
            {`${ticked}/${task.checklist.length}`}
          </span>
        )}
        {task.attachments.length > 0 && (
          <span className="card-count" data-part="attachments" role="img" aria-label={tr('attachmentCount', { n: task.attachments.length })}>
            <Paperclip size={14} />
            {String(task.attachments.length)}
          </span>
        )}
        {claimSlot}
      </div>
    </article>
  );
}
