import { useProjects, useT } from '../data/context.js';
import { Tooltip } from '../kit/elements.js';
import { daysBetween, isOverdue } from '../model/dates.js';
import { formatDay } from '../model/format.js';
import type { Task } from '../model/types.js';
import { CalendarIcon, CalendarX2 } from '../shared/icons.js';
import type { TextKey } from '../text.js';

const RELATIVE: Record<number, TextKey> = { [-1]: 'dayYesterday', 0: 'dueToday', 1: 'dayTomorrow' };

/**
 * A task's due day in the viewer's words: Hôm qua, Hôm nay or Ngày mai within a day of today, else `dd/mm`. Overdue
 * shows in the danger ink with its own icon, and the tooltip holds the full date. `plain` drops the relative word,
 * for a group whose heading already says it.
 */
export function DueDate({ task, plain = false, icon = true }: { task: Pick<Task, 'due' | 'status'>; plain?: boolean; icon?: boolean }) {
  const { today, lang } = useProjects();
  const tr = useT();
  if (!task.due) return null;
  const days = daysBetween(today, task.due);
  const overdue = isOverdue(task, today);
  const word = !plain ? RELATIVE[days] : undefined;
  const full = new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-GB', { dateStyle: 'full', timeZone: 'UTC' })
    .format(new Date(`${task.due}T00:00:00Z`));
  const lateBy = overdue ? (-days === 1 ? tr('overdueByOne') : tr('overdueBy', { n: -days })) : '';
  const late = overdue ? `${lateBy} · ` : '';
  return (
    <Tooltip text={`${late}${full}`} locale={lang}>
      <time className="due" dateTime={task.due} data-overdue={overdue ? 'true' : undefined}>
        {icon && (overdue ? <CalendarX2 size={14} /> : <CalendarIcon size={14} />)}
        {word ? tr(word) : formatDay(task.due, today)}
        {/* The tooltip is the only other place that says so, and a screen reader never reaches it. */}
        {overdue && <span className="sr-only">{lateBy}</span>}
      </time>
    </Tooltip>
  );
}
