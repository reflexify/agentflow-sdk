import { exportPKCS8, generateKeyPair } from 'jose';
import { loadConfig, type ProjectsConfig } from '../../server/config.js';

export const ID = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

/** The ids of the Projects entities and groups, as `projects.config.json` holds them. */
export const idsReport = {
  entities: { project: ID(1), section: ID(2), task: ID(3), task_label: ID(4) },
  groups: { users: ID(5), creators: ID(6), admins: ID(7) },
};

/** A `ProjectsConfig` built the way `loadConfig` builds one, from a generated key and `idsReport`. */
export async function testConfig(overrides: Record<string, string> = {}): Promise<ProjectsConfig> {
  const { privateKey } = await generateKeyPair('RS256', { extractable: true });
  const pem = await exportPKCS8(privateKey);
  const store: Record<string, string> = { 'keys/private.pem': pem, 'projects.config.json': JSON.stringify(idsReport) };
  return loadConfig(
    {
      AGENTFLOW_ISSUER: 'https://id.example',
      AGENTFLOW_PRIVATE_KEY_ID: 'k1',
      PROJECTS_SESSION_KEY: Buffer.alloc(32, 1).toString('base64url'),
      ...overrides,
    },
    async (path) => {
      if (!(path in store)) throw new Error(`ENOENT ${path}`);
      return store[path] as string;
    },
  );
}
