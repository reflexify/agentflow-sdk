import { ok } from '../errors.js';
async function liveWork(client) {
    const found = [];
    let cursor;
    do {
        const page = await ok(client.GET('/work', { params: { query: { view: 'all', live: true, limit: 200, ...(cursor ? { cursor } : {}) } } }));
        found.push(...page.items);
        cursor = page.next_cursor ?? undefined;
    } while (cursor);
    return found;
}
export async function waitForTask(client, stepKey, recordId, options) {
    const timeout = options?.timeout ?? 120_000;
    const interval = options?.interval ?? 1000;
    const deadline = Date.now() + timeout;
    for (;;) {
        const task = (await liveWork(client)).find((item) => item.step?.step.key === stepKey && item.step.subject?.record_id === recordId);
        if (task)
            return task;
        if (Date.now() >= deadline) {
            throw new Error(`no ${stepKey} task on record ${recordId} after ${timeout} ms: is the trigger armed, and is the task offered to this person?`);
        }
        await new Promise((resolve) => setTimeout(resolve, Math.min(interval, Math.max(deadline - Date.now(), 0))));
    }
}
// A task offered to exactly one person is claimed for them as it opens, so only work nobody holds is claimed here.
export async function completeTask(client, task, action, options) {
    const path = { entity_id: task.entity_id, record_id: task.id };
    if (task.claimed_by_user_id === null) {
        await ok(client.POST('/entities/{entity_id}/records/{record_id}/work/claim', { params: { path } }));
    }
    await ok(client.POST('/entities/{entity_id}/records/{record_id}/step/submit', {
        params: { path },
        body: { payload: { ...options?.payload, _action: action } },
    }));
}
//# sourceMappingURL=tasks.js.map