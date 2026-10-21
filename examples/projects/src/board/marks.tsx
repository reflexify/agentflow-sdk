import { useLayoutEffect, useRef, useState } from 'react';
import { useProjects, useT } from '../data/context.js';
import { Tooltip } from '../kit/elements.js';
import { hueOf, initials } from '../model/format.js';
import type { Column } from '../model/grouping.js';
import type { Priority, Status } from '../model/types.js';
import { BanIcon, PriorityGlyph, StatusGlyph } from '../shared/icons.js';
import type { TextKey } from '../text.js';

export const STATUS_TEXT: Record<Status, TextKey> = {
  todo: 'statusTodo', doing: 'statusDoing', done: 'statusDone', cancelled: 'statusCancelled',
};
export const PRIORITY_TEXT: Record<Priority, TextKey> = {
  urgent: 'priorityUrgent', high: 'priorityHigh', medium: 'priorityMedium', low: 'priorityLow',
};

/** A status as a pill: its glyph and its word, in its own tone. Pills mean state. */
export function StatusPill({ status }: { status: Status }) {
  const tr = useT();
  return (
    <span className="pill" data-part="status" data-status={status}>
      <StatusGlyph status={status} />
      {tr(STATUS_TEXT[status])}
    </span>
  );
}

/** A priority's glyph and word; "—" with Chưa đặt for none. */
export function PriorityMark({ priority }: { priority: Priority | null }) {
  const tr = useT();
  return (
    <span className="priority" data-part="priority" data-priority={priority ?? 'none'}>
      <PriorityGlyph priority={priority} />
      {tr(priority ? PRIORITY_TEXT[priority] : 'priorityNone')}
    </span>
  );
}

/** The danger tag a blocked task carries. */
export function BlockedTag() {
  const tr = useT();
  return (
    <span className="tag" data-tone="danger" data-part="blocked">
      <BanIcon size={12} />
      {tr('blocked')}
    </span>
  );
}

/** The mark before a group's name, on a board column and a list group alike: its status, its priority or its owner. */
export function GroupMark({ column }: { column: Column }) {
  const { people } = useProjects();
  if (column.status) return <span className="group-mark" data-status={column.status}><StatusGlyph status={column.status} size={14} /></span>;
  if (column.priority !== undefined) {
    return <span className="group-mark" data-priority={column.priority ?? 'none'}><PriorityGlyph priority={column.priority} size={14} /></span>;
  }
  if (column.personId) {
    const name = people.get(column.personId)?.name ?? '?';
    return <span className="af-avatar sm" data-hue={hueOf(column.personId)} aria-hidden="true">{initials(name)}</span>;
  }
  return null;
}

/**
 * A sub-label as a data tag. Its width is capped, so when the name does not fit it is cut with an ellipsis and the
 * whole name goes in a tooltip; a name that fits gets none, so there is no tooltip repeating what is in view.
 */
export function LabelTag({ name }: { name: string }) {
  const { lang } = useProjects();
  const ref = useRef<HTMLSpanElement>(null);
  const [cutName, setCutName] = useState<string | null>(null);
  const cut = cutName === name;
  // Measured only while unwrapped: inside the tooltip the tag has no box until the element renders its slot, and would
  // read as fitting. Once cut, a name keeps its tooltip.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || cut) return;
    const check = () => { if (el.scrollWidth > el.clientWidth) setCutName(name); };
    check();
    if (typeof ResizeObserver === 'undefined') return;
    const watch = new ResizeObserver(check);
    watch.observe(el);
    return () => watch.disconnect();
  }, [name, cut]);
  const tag = <span ref={ref} className="tag" data-part="label">{name}</span>;
  return cut ? <Tooltip text={name} locale={lang} className="tag-tip">{tag}</Tooltip> : tag;
}
