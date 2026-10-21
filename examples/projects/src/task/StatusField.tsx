import { useId, useRef, useState, type KeyboardEvent } from 'react';
import type { TaskChanges } from '../api/projects-api.js';
import { useProjects, useT } from '../data/context.js';
import { Confirm, Tooltip, useToast } from '../kit/elements.js';
import { can, type Control, type Verdict } from '../model/roles.js';
import { statusChanges } from '../model/status.js';
import type { Project, Status, Task, TaskLabel } from '../model/types.js';
import type { TextKey } from '../text.js';
import { FieldRow, Locked, type DrawerWriter } from './fields.js';
import { BanIcon, CheckIcon, LockIcon, StatusGlyph } from '../shared/icons.js';

const STATUSES: readonly Status[] = ['todo', 'doing', 'done', 'cancelled'];
const WORD: Record<Status, TextKey> = { todo: 'statusTodo', doing: 'statusDoing', done: 'statusDone', cancelled: 'statusCancelled' };
const LIVE: readonly Status[] = ['todo', 'doing'];

/** Which action a press on `to` is, from where the task is: the stage model's moves, each with its own movers. */
function controlFor(from: Status, to: Status): Control | null {
  switch (to) {
    case 'done': return LIVE.includes(from) ? 'complete' : null;
    case 'doing': return from === 'todo' ? 'move_status' : from === 'done' ? 'reopen' : null;
    case 'todo': return from === 'doing' ? 'move_status' : from === 'cancelled' ? 'restore' : null;
    case 'cancelled': return LIVE.includes(from) ? 'cancel' : null;
  }
}

type Ctx = { viewer: ReturnType<typeof useProjects>['viewer']; project: Project | null; task: Task; online: boolean };

function moveVerdict(to: Status, ctx: Ctx): Verdict {
  const { task } = ctx;
  if (to === task.status) return { ok: true };
  const control = controlFor(task.status, to);
  if (control) return can(control, ctx);
  // No move leads there; a lock that holds for every move still says why first.
  if (!ctx.online) return { ok: false, reason: 'offlineLocked', hidden: false };
  if (ctx.project?.status === 'closed') return { ok: false, reason: 'projectClosedLocked', hidden: false };
  if (task.frozen) return { ok: false, reason: 'taskFrozenLocked', hidden: false };
  return { ok: false, reason: 'wrongStatus', hidden: false };
}

const both = (a: Verdict, b: Verdict): Verdict => (a.ok ? b : a);

/**
 * Trạng thái: the four base statuses as one segmented control, and under each status its sub-labels; "Bị chặn" sits
 * under Đang làm while the task is in progress. Every write is built by `statusChanges`, so a move never leaves a
 * blocked flag or another status's label behind.
 */
export function StatusField({ task, project, writer }: { task: Task; project: Project | null; writer: DrawerWriter }) {
  const { viewer, online, labels, lang } = useProjects();
  const tr = useT();
  const toast = useToast();
  const headingId = useId();
  const ctx: Ctx = { viewer, project, task, online };
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  // A press answers at once, so a second press in the same tick must be stopped here, not by state.
  const inFlight = useRef(false);
  const [cancelling, setCancelling] = useState<{ label: string | null } | null>(null);

  const write = async (changes: TaskChanges, completes: boolean) => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const saved = await writer.save(changes, 'status');
      if (saved && completes) toast({ kind: 'success', text: tr('taskCompleted') });
    } finally {
      inFlight.current = false;
    }
  };

  const move = (to: Status, label?: string) => {
    if (inFlight.current) return;
    if (to === 'cancelled' && task.status !== 'cancelled') {
      setCancelling({ label: label ?? null });
      return;
    }
    const changes: TaskChanges = to === task.status ? {} : { ...statusChanges(task, to, labels) };
    if (label !== undefined) changes.label = label;
    void write(changes, to === 'done' && task.status !== 'done');
  };

  const pressStatus = (to: Status) => {
    if (to === task.status || !moveVerdict(to, ctx).ok) return;
    move(to);
  };

  const pickLabel = (label: TaskLabel) => {
    const verdict = labelVerdict(label);
    if (!verdict.ok) return;
    if (task.label === label.id) void write({ label: null }, false);
    else move(label.baseStatus, label.id);
  };

  const labelVerdict = (label: TaskLabel) => both(moveVerdict(label.baseStatus, ctx), can('label', ctx));

  // A roving tab stop: Tab reaches the current status, and the arrows move between the four.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const at = buttons.current.findIndex((b) => b === e.target);
    if (at < 0) return;
    const next = e.key === 'ArrowRight' ? at + 1 : e.key === 'ArrowLeft' ? at - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? STATUSES.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    buttons.current[(next + STATUSES.length) % STATUSES.length]?.focus();
  };

  const statusButton = (s: Status, i: number) => {
    const verdict = moveVerdict(s, ctx);
    const pressed = task.status === s;
    const render = (describedBy?: string) => (
      <button
        ref={(el) => { buttons.current[i] = el; }}
        type="button"
        className="status-button"
        data-status={s}
        aria-pressed={pressed}
        aria-disabled={verdict.ok ? undefined : 'true'}
        aria-describedby={describedBy}
        tabIndex={pressed ? 0 : -1}
        onClick={() => pressStatus(s)}
      >
        {/* The lock takes the glyph's place, so a locked status keeps its width; a move that does not exist from here is only dimmed. */}
        {!verdict.ok && verdict.reason !== 'wrongStatus' ? <LockIcon size={14} /> : <StatusGlyph status={s} size={14} />}
        <span>{tr(WORD[s])}</span>
      </button>
    );
    return verdict.ok ? <span key={s} className="status-cell">{render()}</span>
      : <span key={s} className="status-cell"><Locked reason={verdict.reason}>{render}</Locked></span>;
  };

  const labelTag = (label: TaskLabel) => {
    const verdict = labelVerdict(label);
    const pressed = task.label === label.id;
    const render = (describedBy?: string) => (
      <button
        type="button"
        className="sublabel"
        aria-pressed={pressed}
        aria-disabled={verdict.ok ? undefined : 'true'}
        aria-describedby={describedBy}
        onClick={() => pickLabel(label)}
      >
        {pressed && <CheckIcon size={12} />}
        <span className="sublabel-name">{label.name}</span>
      </button>
    );
    // A long name is cut short in its column, so the whole name is in a tooltip, or the reason when it is locked.
    return (
      <span key={label.id} className="sublabel-item">
        {verdict.ok ? <Tooltip text={label.name} locale={lang}>{render()}</Tooltip> : <Locked reason={verdict.reason}>{render}</Locked>}
      </span>
    );
  };

  const blocked = can('blocked', ctx);
  const blockedToggle = (describedBy?: string) => (
    <button
      type="button"
      className="sublabel blocked-toggle"
      aria-pressed={task.blocked}
      aria-disabled={blocked.ok ? undefined : 'true'}
      aria-describedby={describedBy}
      onClick={() => { if (blocked.ok) void write({ blocked: !task.blocked }, false); }}
    >
      <BanIcon size={12} />
      <span className="sublabel-name">{tr('blocked')}</span>
    </button>
  );

  const sortedLabels = (s: Status) =>
    labels.filter((l) => l.baseStatus === s).sort((a, b) => a.name.localeCompare(b.name, 'vi'));

  return (
    <FieldRow field="status" label={tr('status')} labelId={headingId} writer={writer} stacked>
      <div className="status-field">
        <div className="status-track" role="group" aria-labelledby={headingId} onKeyDown={onKeyDown}>
          {STATUSES.map(statusButton)}
        </div>
        <div className="status-columns">
          {STATUSES.map((s) => {
            const own = sortedLabels(s);
            const showBlocked = s === 'doing' && task.status === 'doing';
            return (
              <div key={s} className="status-column" data-status-column={s}>
                {(own.length > 0 || showBlocked) && (
                  <div className="sublabels" role="group" aria-label={`${tr('subLabels')}: ${tr(WORD[s])}`}>
                    {own.map(labelTag)}
                    {showBlocked && (
                      <span className="sublabel-item">{blocked.ok ? blockedToggle() : <Locked reason={blocked.reason}>{blockedToggle}</Locked>}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <Confirm
        open={cancelling !== null}
        heading={tr('cancelTaskHeading')}
        message={tr('cancelTaskMessage')}
        confirmLabel={tr('cancelTask')}
        locale={lang}
        strings={{ cancel: tr('goBack') }}
        busy={false}
        onCancel={() => setCancelling(null)}
        onConfirm={() => {
          const pending = cancelling;
          setCancelling(null);
          if (!pending) return;
          const changes: TaskChanges = { ...statusChanges(task, 'cancelled', labels) };
          if (pending.label) changes.label = pending.label;
          void write(changes, false);
        }}
      />
    </FieldRow>
  );
}
