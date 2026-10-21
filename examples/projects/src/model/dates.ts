import type { Task } from './types.js';

export type DueBucket = 'overdue' | 'today' | 'this_week' | 'later' | 'none';

export function viewerTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

/** The calendar day it is in `timeZone`, as `YYYY-MM-DD`. */
export function todayIn(timeZone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** How long until the calendar day in `timeZone` turns, in milliseconds: never less than one. */
export function msUntilNextDay(timeZone: string, now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const elapsed = ((part('hour') * 60 + part('minute')) * 60 + part('second')) * 1000 + now.getUTCMilliseconds();
  return Math.max(1, 86_400_000 - elapsed);
}

/** The Sunday that ends the week `today` falls in (weeks run Monday to Sunday). */
export function weekEnd(today: string): string {
  const d = new Date(`${today}T00:00:00Z`);
  const toSunday = (7 - d.getUTCDay()) % 7;
  d.setUTCDate(d.getUTCDate() + toSunday);
  return d.toISOString().slice(0, 10);
}

const finished = (status: Task['status']) => status === 'done' || status === 'cancelled';

export function isOverdue(task: Pick<Task, 'due' | 'status'>, today: string): boolean {
  return !!task.due && !finished(task.status) && task.due < today;
}

// A finished task past its date is `later`, not `overdue`: it must not read as late.
export function dueBucket(task: Pick<Task, 'due' | 'status'>, today: string): DueBucket {
  if (!task.due) return 'none';
  if (task.due < today) return finished(task.status) ? 'later' : 'overdue';
  if (task.due === today) return 'today';
  return task.due <= weekEnd(today) ? 'this_week' : 'later';
}

export function doneSince(window: '7' | '30', now: Date = new Date()): string {
  return new Date(now.getTime() - Number(window) * 86_400_000).toISOString();
}

/** Whole calendar days from `from` to `to`, both `YYYY-MM-DD`: negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}
