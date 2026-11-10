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

const NO_INSTALLATION = 'the sandbox has no installed app: run pnpm exec agentflow-app deploy --sandbox';

// `GET /app/objects` answers only an installed app's own code, so a person's client is refused it. The same answer, revision
// header included, is the installation's objects read with the owner's token: what `deploy --sandbox` itself reads.
function appObjectsThroughTheOwner(sandbox: SandboxFile, send: RequestFetch): RequestFetch {
  const appObjects = new URL(`${sandbox.url}/api/v1/app/objects`).pathname;
  return async (req) => {
    if (req.method !== 'GET' || new URL(req.url).pathname !== appObjects) return send(req);
    if (!sandbox.installation) throw new Error(NO_INSTALLATION);
    const { token } = person(sandbox, sandbox.owner);
    const installation = encodeURIComponent(sandbox.installation.id);
    return send(new Request(`${sandbox.url}/api/v1/app-installations/${installation}/objects`, { headers: { authorization: `Bearer ${token}` } }));
  };
}

// A client acting as the sandbox person `handle`. It also answers `GET /app/objects` as the installed app is answered, so
// module code that calls `getAppObjects(client)` runs in a test.
export function as(handle: string, options?: { dir?: string; fetch?: RequestFetch }): AgentFlowClient {
  const sandbox = readSandbox(options?.dir);
  const { token } = person(sandbox, handle);
  return createAgentFlowClient({
    baseUrl: `${sandbox.url}/api/v1`,
    auth: bearerAdapter(async () => token),
    fetch: appObjectsThroughTheOwner(sandbox, options?.fetch ?? ((req) => globalThis.fetch(req))),
  });
}

export async function signInAs(page: SignInPage, handle: string, options?: { dir?: string }): Promise<void> {
  const sandbox = readSandbox(options?.dir);
  const { token } = person(sandbox, handle);
  const answer = await page.request.post(`${sandbox.url}/api/v1/auth/sandbox-session`, { data: { token } });
  if (answer.status() !== 204) {
    throw new Error(
      `signing in as ${handle} answered ${answer.status()}: the sandbox may have expired or been deleted; run pnpm exec agentflow-app deploy --sandbox`,
    );
  }
}

// Pass the package's `LogicalKey` (from `agentflow-app types`) as K to make a mistyped key fail the compile.
export function idsByKey<K extends string = string>(options?: { dir?: string }): Record<K, string> {
  const { installation } = readSandbox(options?.dir);
  if (!installation) throw new Error(NO_INSTALLATION);
  return { ...installation.objects } as Record<K, string>;
}
