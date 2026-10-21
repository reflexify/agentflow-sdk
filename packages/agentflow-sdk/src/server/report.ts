import { describeError } from './describe-error.js';
import type { ServerErrorHandler } from './options.js';

/** Hands an error a route swallowed to the host's `onError`, if any. */
export function reportError(onError: ServerErrorHandler | undefined, route: string, error: unknown): void {
  if (!onError) return;
  // The report itself must never be able to break the response it's being told about. An async
  // reporter's rejection escapes the try/catch, and an unhandled rejection terminates a Node >= 15
  // host, so a returned promise gets its own no-op handler. Not awaited: reporting must not delay
  // the response.
  try {
    const result = onError(error, { route, summary: describeError(error) });
    if (result && typeof result.then === 'function') {
      result.then(undefined, () => {});
    }
  } catch {
    // dropped, as above
  }
}
