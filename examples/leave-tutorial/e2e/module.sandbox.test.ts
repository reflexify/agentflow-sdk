import { readSandbox } from '@reflexify/agentflow-sdk/testing';
import { expect, it } from 'vitest';

const sandbox = readSandbox();
const api = `${sandbox.url}/api/v1`;

/** Signs in as a sandbox person the way a browser would, and returns the session cookie for the next calls. */
async function sessionOf(handle: string): Promise<string> {
  const answer = await fetch(`${api}/auth/sandbox-session`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token: sandbox.people[handle]!.token }),
  });
  expect(answer.status).toBe(204);
  return answer.headers.getSetCookie().map((cookie) => cookie.split(';')[0]).join('; ');
}

/** The app's key in the URL, `/apps/<key>/`, as the launcher gives it to the person: the one entry that opens the module. */
async function moduleKey(cookie: string): Promise<string> {
  const launcher = await fetch(`${api}/apps/launcher`, { headers: { cookie } });
  expect(launcher.status).toBe(200);
  const apps = (await launcher.json()) as { key: string; entries: { href: string }[] }[];
  const app = apps.find((candidate) => candidate.entries.some((entry) => entry.href.startsWith(`/apps/${candidate.key}/`)));
  expect(app).toBeDefined();
  return app!.key;
}

it('opens the module for an employee: the check is ready and the entry is served', async () => {
  const cookie = await sessionOf('emma');
  const key = await moduleKey(cookie);
  const check = await fetch(`${api}/apps/${key}/module`, { headers: { cookie } });
  expect(check.status).toBe(200);
  const state = (await check.json()) as { state: string; module?: { digest: string; entry: string; contract: number } };
  expect(state.state).toBe('ready');
  expect(state.module).toMatchObject({ entry: 'ui/index.js', contract: 1 });

  const entry = await fetch(`${api}/apps/${key}/ui/${state.module!.digest}/index.js`, { headers: { cookie } });
  expect(entry.status).toBe(200);
  expect(entry.headers.get('content-type')).toMatch(/javascript/);
  expect(await entry.text()).toMatch(/export\s*\{\s*\w+ as mount\s*\}|export \{ mount \}/);
});

it('answers the module its own objects, so the screen can find the entity', async () => {
  const cookie = await sessionOf('emma');
  const objects = await fetch(`${api}/apps/${await moduleKey(cookie)}/objects`, { headers: { cookie } });
  expect(objects.status).toBe(200);
  const body = (await objects.json()) as { objects: { logical_key: string; id: string | null; state: string }[] };
  expect(body.objects.find((o) => o.logical_key === 'entity:leave_request')).toMatchObject({ state: 'live' });
});

it('does not open the module for someone outside the app', async () => {
  const key = await moduleKey(await sessionOf('emma'));
  const cookie = await sessionOf('bot');
  const check = await fetch(`${api}/apps/${key}/module`, { headers: { cookie } });
  expect(check.status).toBe(200);
  expect(((await check.json()) as { state: string }).state).toBe('not_assigned');
});
