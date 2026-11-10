import type { AppTaskHandle } from '@reflexify/agentflow-sdk';
/**
 * The task of the nearest `<agentflow-task>` around `element`, now and each time it changes: the handle
 * while one is open, `null` while the element has none (closed, or its provider offers no tasks) and when
 * `element` is inside no task element. Call the returned function to stop.
 */
export declare function consumeTask(element: HTMLElement, onTask: (task: AppTaskHandle | null) => void): () => void;
//# sourceMappingURL=task-context.d.ts.map