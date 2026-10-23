import { ok } from '../errors.js';
const SETTLED = new Set(['completed', 'failed', 'cancelled']);
export async function waitForRun(client, runId, options) {
    const timeout = options?.timeout ?? 120_000;
    const interval = options?.interval ?? 1000;
    const deadline = Date.now() + timeout;
    for (;;) {
        const run = (await ok(client.GET('/instances/{instance_id}', { params: { path: { instance_id: runId } } })));
        if (SETTLED.has(run.status))
            return run;
        if (Date.now() >= deadline)
            throw new Error(`run ${runId} is still ${run.status} after ${timeout} ms`);
        await new Promise((resolve) => setTimeout(resolve, Math.min(interval, Math.max(deadline - Date.now(), 0))));
    }
}
//# sourceMappingURL=runs.js.map