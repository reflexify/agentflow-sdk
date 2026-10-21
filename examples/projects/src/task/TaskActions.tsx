import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState, type ReactNode } from 'react';
import type { BoardTasks } from '../api/projects-api.js';
import { useProjects, useT } from '../data/context.js';
import { keys } from '../data/keys.js';
import { Confirm, useToast } from '../kit/elements.js';
import { viewerTimeZone } from '../model/dates.js';
import { formatDateTime } from '../model/format.js';
import { can, type Control, type Verdict } from '../model/roles.js';
import { statusChanges } from '../model/status.js';
import type { Origin, Project, Status, Task } from '../model/types.js';
import { BanIcon, RotateCcw, TrashIcon } from '../shared/icons.js';
import type { TextKey } from '../text.js';
import { Locked, type DrawerWriter } from './fields.js';

const ORIGIN_WORD: Record<Origin, TextKey> = {
  manual: 'originManual', assistant: 'originAssistant', document: 'originDocument', workflow: 'originWorkflow',
};

/** "Tạo bởi … lúc … · qua …", from the record's creator, creation time and `origin`. The project's link is the crumb's. */
export function TaskOrigin({ task }: { task: Task }) {
  const { people } = useProjects();
  const tr = useT();
  const who = (task.createdBy && people.get(task.createdBy)?.name) || tr('unknownPerson');
  const when = formatDateTime(task.createdAt, viewerTimeZone());
  const [before, after = ''] = tr('createdLine', { who, source: tr(ORIGIN_WORD[task.origin]) }).split('{when}');
  return (
    <div className="task-origin">
      <p className="origin-line" data-part="origin">
        {before}<time dateTime={task.createdAt}>{when}</time>{after}
      </p>
    </div>
  );
}

type Pending = 'cancel' | 'delete' | null;

/**
 * Huỷ task (confirmed), Khôi phục on a cancelled task and Mở lại on a done one (a manager's, locked for anyone else),
 * and Xoá (managers only, hidden from anyone else, confirmed, a danger). Every status action is written by `statusChanges`, through the drawer's writer, which
 * reads the task again first when its last write was followed by the completion stamp.
 */
export function TaskActions({ task, project, writer, onClose }: { task: Task; project: Project | null; writer: DrawerWriter; onClose(): void }) {
  const { viewer, online, labels, lang, api } = useProjects();
  const tr = useT();
  const toast = useToast();
  const qc = useQueryClient();
  const ctx = { viewer, project, task, online };
  // A press answers at once, so a second press in the same tick must be stopped here, not by state.
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<Pending>(null);

  const once = async (fn: () => Promise<unknown>) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    try {
      await fn();
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  const move = (to: Status) => once(() => writer.save({ ...statusChanges(task, to, labels) }, 'status'));

  const remove = () => once(async () => {
    // The answer is the task as it was read, so the drawer does not read back a record that is gone.
    const deleted = await writer.run('actions', async (from) => {
      await api.deleteTask(from);
      return from;
    });
    setConfirming(null);
    if (!deleted) return;
    onClose();
    qc.removeQueries({ queryKey: keys.task(task.id), exact: true });
    for (const [key, data] of qc.getQueriesData<BoardTasks>({ queryKey: ['board'] })) {
      if (data?.tasks.some((t) => t.id === task.id)) qc.setQueryData<BoardTasks>(key, { ...data, tasks: data.tasks.filter((t) => t.id !== task.id) });
    }
    toast({ kind: 'success', text: tr('taskDeleted') });
  });

  if (task.frozen) return null;

  const shown = (control: Control): Verdict | null => {
    const v = can(control, ctx);
    return !v.ok && v.hidden ? null : v;
  };
  const cancel = shown('cancel');
  const restore = shown('restore');
  const reopen = shown('reopen');
  const del = shown('delete');
  if (!cancel && !restore && !reopen && !del) return null;

  const button = (v: Verdict, label: TextKey, onPress: () => void, look: 'secondary' | 'delete', icon?: ReactNode) => {
    const render = (describedBy?: string) => (
      <button
        type="button"
        className={look === 'delete' ? 'af-button ghost action-delete' : 'af-button secondary'}
        aria-disabled={v.ok && !busy ? undefined : 'true'}
        aria-busy={busy || undefined}
        aria-describedby={describedBy}
        onClick={() => { if (v.ok && !inFlight.current) onPress(); }}
      >
        {icon}
        <span>{tr(label)}</span>
      </button>
    );
    return v.ok ? render() : <Locked reason={v.reason}>{render}</Locked>;
  };

  return (
    <div
      className="task-actions"
      data-part="actions"
      data-field="actions"
      data-rolled-back={writer.rolledBack === 'actions' ? '' : undefined}
      onAnimationEnd={() => writer.settled('actions')}
    >
      {cancel && button(cancel, 'cancelTask', () => setConfirming('cancel'), 'secondary', <BanIcon size={16} />)}
      {restore && button(restore, 'restoreTask', () => void move('todo'), 'secondary', <RotateCcw size={16} />)}
      {reopen && button(reopen, 'reopenTask', () => void move('doing'), 'secondary', <RotateCcw size={16} />)}
      {del && <span className="action-end">{button(del, 'deleteTask', () => setConfirming('delete'), 'delete', <TrashIcon size={16} />)}</span>}
      <Confirm
        open={confirming === 'cancel'}
        heading={tr('cancelTaskHeading')}
        message={tr('cancelTaskMessage')}
        confirmLabel={tr('cancelTask')}
        locale={lang}
        strings={{ cancel: tr('goBack') }}
        busy={busy}
        onCancel={() => setConfirming(null)}
        onConfirm={() => {
          if (inFlight.current) return;
          setConfirming(null);
          void move('cancelled');
        }}
      />
      <Confirm
        open={confirming === 'delete'}
        heading={tr('deleteTaskHeading')}
        message={tr('deleteTaskMessage')}
        confirmLabel={tr('confirmDeleteTask')}
        danger
        locale={lang}
        strings={{ cancel: tr('goBack') }}
        busy={busy}
        onCancel={() => { if (!inFlight.current) setConfirming(null); }}
        onConfirm={() => void remove()}
      />
    </div>
  );
}
