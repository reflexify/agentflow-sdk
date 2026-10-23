import { bearerAdapter } from '../auth.js';
import { createAgentFlowClient, type AgentFlowClient } from '../client.js';
import type { RequestFetch } from '../fetch.js';
import { readSandbox, type SandboxFile } from './sandbox-file.js';

export type SignInPage = {
  request: { post(url: string, options: { data: unknown }): Promise<{ status(): number }> };
};

function person(sandbox: SandboxFile, handle: string): { user_id: string; token: string } {
  const found = Object.hasOwn(sandbox.people, handle) ? sandbox.people[handle] : undefined;
  if (!found) {
    throw new Error(`${handle} is not one of the sandbox's people: ${Object.keys(sandbox.people).join(', ')}`);
  }
  return found;
}

export function as(handle: string, options?: { dir?: string; fetch?: RequestFetch }): AgentFlowClient {
  const sandbox = readSandbox(options?.dir);
  const { token } = person(sandbox, handle);
  return createAgentFlowClient({
    baseUrl: `${sandbox.url}/api/v1`,
    auth: bearerAdapter(async () => token),
    fetch: options?.fetch,
  });
}

export async function signInAs(page: SignInPage, handle: string, options?: { dir?: string }): Promise<void> {
  const sandbox = readSandbox(options?.dir);
  const { token } = person(sandbox, handle);
  const answer = await page.request.post(`${sandbox.url}/api/v1/auth/sandbox-session`, { data: { token } });
  if (answer.status() !== 204) {
    throw new Error(
      `signing in as ${handle} answered ${answer.status()}: the sandbox may have expired or been deleted; run agentflow-app deploy --sandbox`,
    );
  }
}

export function idsByKey(options?: { dir?: string }): Record<string, string> {
  const { installation } = readSandbox(options?.dir);
  if (!installation) throw new Error('the sandbox has no installed app: run agentflow-app deploy --sandbox');
  return { ...installation.objects };
}
