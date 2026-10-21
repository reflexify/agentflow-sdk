import { useId, type ReactNode } from 'react';
import type { TaskChanges } from '../api/projects-api.js';
import { useProjectsBase, useT } from '../data/context.js';
import { Tooltip } from '../kit/elements.js';
import type { Verdict } from '../model/roles.js';
import type { Task } from '../model/types.js';
import type { TextKey } from '../text.js';
import { LockIcon } from '../shared/icons.js';

export type FieldKey = 'title' | 'priority' | 'due' | 'description' | 'primary' | 'collaborators' | 'status' | 'checklist' | 'attachments' | 'actions';

/** How a drawer field writes: through the drawer, which orders the writes and tells its own changes from others'. */
export interface DrawerWriter {
  /** Patches the task, showing the change at once and putting it back if it is refused. */
  save(changes: TaskChanges, field: FieldKey): Promise<Task | null>;
  /** Any other write on the task, such as a work operation; the drawer reads the task again after it. */
  run(field: FieldKey, write: (task: Task) => Promise<unknown>, shows?: Partial<Task>): Promise<boolean>;
  /** The field whose write was refused last, for its one flash. */
  rolledBack: FieldKey | null;
  settled(field: FieldKey): void;
}

/** A field's verdict as a lock: a control that must be shown is never hidden, it is locked with its reason. */
export const lockOf = (v: Verdict): TextKey | null => (v.ok ? null : v.reason);

/**
 * A labelled row: the label is a heading, so the drawer's sections can be walked by heading. A locked row shows a lock
 * by its label; `reasonOnLabel` puts the reason there too, for a value that is not a control of its own.
 */
export function FieldRow(p: {
  field: FieldKey; label: string; labelId: string; writer: DrawerWriter; lock?: TextKey | null; reasonOnLabel?: boolean;
  stacked?: boolean; children: ReactNode;
}) {
  const tr = useT();
  const { lang } = useProjectsBase();
  const hint = p.lock && (p.reasonOnLabel
    ? (
      <Tooltip text={tr(p.lock)} locale={lang}>
        <span className="lock-hint" tabIndex={0} role="img" aria-label={tr(p.lock)}><LockIcon size={12} /></span>
      </Tooltip>
    )
    : <span className="lock-hint"><LockIcon size={12} /></span>);
  return (
    <div
      className={p.stacked ? 'field-row stacked' : 'field-row'}
      data-field={p.field}
      data-locked={p.lock ? '' : undefined}
      data-rolled-back={p.writer.rolledBack === p.field ? '' : undefined}
      onAnimationEnd={() => p.writer.settled(p.field)}
    >
      <div className="field-label">
        <h3 id={p.labelId}>{p.label}</h3>
        {hint}
      </div>
      <div className="field-value">{p.children}</div>
    </div>
  );
}

/**
 * A control the viewer may not use, with its reason in a tooltip and, because the kit's tooltip describes only its
 * own anchor, in a hidden sentence beside it that the control names as its description.
 */
export function Locked({ reason, children }: { reason: TextKey; children: (describedBy: string) => ReactNode }) {
  const { lang } = useProjectsBase();
  const tr = useT();
  const id = useId();
  return (
    <>
      <Tooltip text={tr(reason)} locale={lang}>{children(id)}</Tooltip>
      <span id={id} className="sr-only">{tr(reason)}</span>
    </>
  );
}

/** A value shown as text because the viewer may not change it. It keeps focus, so its reason can be reached. */
export function LockedValue({ reason, labelId, children }: { reason: TextKey; labelId: string; children: ReactNode }) {
  const valueId = useId();
  return (
    <Locked reason={reason}>
      {(describedBy) => (
        <button type="button" className="field-static" aria-disabled="true" aria-labelledby={`${labelId} ${valueId}`} aria-describedby={describedBy}>
          <span id={valueId} className="field-static-text">{children}</span>
        </button>
      )}
    </Locked>
  );
}
