import type { Status, Task, TaskLabel } from './types.js';

export type StatusWrite = { status: Status; blocked?: false; label?: null };

/** Every status write goes through here: the package refuses a status that leaves `blocked` or a mismatched label behind. */
export function statusChanges(task: Pick<Task, 'status' | 'blocked' | 'label'>, to: Status, labels: TaskLabel[]): StatusWrite {
  const write: StatusWrite = { status: to };
  if (task.blocked && to !== 'doing') write.blocked = false;
  if (task.label && !labels.some((l) => l.id === task.label && l.baseStatus === to)) write.label = null;
  return write;
}
