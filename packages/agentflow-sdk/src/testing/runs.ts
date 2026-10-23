import type { AgentFlowClient } from '../client.js';
import { ok } from '../errors.js';

export type SettledRun = { id: string; status: 'completed' | 'failed' | 'cancelled' | string; [member: string]: unknown };

const SETTLED = new Set(['completed', 'failed', 'cancelled']);

export async function waitForRun(
  client: AgentFlowClient,
  runId: string,
  options?: { timeout?: number; interval?: number },
): Promise<SettledRun> {
  const timeout = options?.timeout ?? 120_000;
  const interval = options?.interval ?? 1000;
  const deadline = Date.now() + timeout;
  for (;;) {
    const run = (await ok(
      client.GET('/instances/{instance_id}', { params: { path: { instance_id: runId } } }),
    )) as unknown as SettledRun;
    if (SETTLED.has(run.status)) return run;
    if (Date.now() >= deadline) throw new Error(`run ${runId} is still ${run.status} after ${timeout} ms`);
    await new Promise((resolve) => setTimeout(resolve, Math.min(interval, Math.max(deadline - Date.now(), 0))));
  }
}
