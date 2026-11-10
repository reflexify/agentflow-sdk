import type { AppTaskHandle } from '@reflexify/agentflow-sdk';
import { consumeContext, TASK_CONTEXT } from './context.js';

/**
 * The task of the nearest `<agentflow-task>` around `element`, now and each time it changes: the handle
 * while one is open, `null` while the element has none (closed, or its provider offers no tasks) and when
 * `element` is inside no task element. Call the returned function to stop.
 */
export function consumeTask(element: HTMLElement, onTask: (task: AppTaskHandle | null) => void): () => void {
  let answered = false;
  const stop = consumeContext<AppTaskHandle | null>(element, TASK_CONTEXT, (task) => {
    answered = true;
    onTask(task);
  });
  if (!answered) onTask(null);
  return stop;
}
