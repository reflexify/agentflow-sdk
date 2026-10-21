import { exportPKCS8, generateKeyPair } from 'jose';
import { loadConfig, type DeskConfig } from '../../server/config.js';

export const ID = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

/** The ids of the ticket app's entities and workflows plus `support_group_id`, as `desk.config.json` holds them. */
export const installReport = {
  entities: { ticket: ID(1), reply: ID(2), note: ID(3), contact: ID(4), canned_reply: ID(5), autopilot_rule: ID(6) },
  workflows: {
    support_handling: ID(7),
    support_draft_reply: ID(8),
    support_send_reply: ID(9),
    support_accept_message: ID(10),
    support_move_message: ID(11),
    support_intake: ID(12),
  },
  support_group_id: ID(13),
};

/** A `DeskConfig` built the way `loadConfig` builds one, from a generated key and `installReport`. */
export async function testConfig(overrides: Record<string, string> = {}): Promise<DeskConfig> {
  const { privateKey } = await generateKeyPair('RS256', { extractable: true });
  const pem = await exportPKCS8(privateKey);
  const store: Record<string, string> = { 'keys/private.pem': pem, 'desk.config.json': JSON.stringify(installReport) };
  return loadConfig(
    {
      AGENTFLOW_ISSUER: 'https://id.example',
      AGENTFLOW_PRIVATE_KEY_ID: 'k1',
      SUPPORT_DESK_SESSION_KEY: Buffer.alloc(32, 1).toString('base64url'),
      ...overrides,
    },
    async (path) => {
      if (!(path in store)) throw new Error(`ENOENT ${path}`);
      return store[path] as string;
    },
  );
}
