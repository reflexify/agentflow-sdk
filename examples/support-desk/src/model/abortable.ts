/** The error a cancelled wait ends with, as `fetch` and `waitForRun` end theirs. It is not a failure: nobody is waiting any more. */
export const cancelled = () => new DOMException('The wait was cancelled.', 'AbortError');

export const isAbort = (e: unknown) => e instanceof DOMException && e.name === 'AbortError';

/** Waits `ms`, or rejects at once when `signal` aborts, leaving no timer behind either way. */
export function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(cancelled());
    const onAbort = () => { clearTimeout(timer); reject(cancelled()); };
    const timer = setTimeout(() => { signal.removeEventListener('abort', onAbort); resolve(); }, ms);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}
