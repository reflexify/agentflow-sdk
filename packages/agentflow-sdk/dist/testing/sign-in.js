import { bearerAdapter } from '../auth.js';
import { createAgentFlowClient } from '../client.js';
import { readSandbox } from './sandbox-file.js';
function person(sandbox, handle) {
    const found = Object.hasOwn(sandbox.people, handle) ? sandbox.people[handle] : undefined;
    if (!found) {
        throw new Error(`${handle} is not one of the sandbox's people: ${Object.keys(sandbox.people).join(', ')}`);
    }
    return found;
}
export function as(handle, options) {
    const sandbox = readSandbox(options?.dir);
    const { token } = person(sandbox, handle);
    return createAgentFlowClient({
        baseUrl: `${sandbox.url}/api/v1`,
        auth: bearerAdapter(async () => token),
        fetch: options?.fetch,
    });
}
export async function signInAs(page, handle, options) {
    const sandbox = readSandbox(options?.dir);
    const { token } = person(sandbox, handle);
    const answer = await page.request.post(`${sandbox.url}/api/v1/auth/sandbox-session`, { data: { token } });
    if (answer.status() !== 204) {
        throw new Error(`signing in as ${handle} answered ${answer.status()}: the sandbox may have expired or been deleted; run agentflow-app deploy --sandbox`);
    }
}
export function idsByKey(options) {
    const { installation } = readSandbox(options?.dir);
    if (!installation)
        throw new Error('the sandbox has no installed app: run agentflow-app deploy --sandbox');
    return { ...installation.objects };
}
//# sourceMappingURL=sign-in.js.map