import { describe, expect, it } from 'vitest';
import { ConfigError, loadConfig, publicConfig } from '../server/config.js';
import { generateKeyPair, exportPKCS8 } from 'jose';

const ID = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const report = {
  entities: { ticket: ID(1), reply: ID(2), note: ID(3), contact: ID(4), canned_reply: ID(5), autopilot_rule: ID(6) },
  workflows: {
    support_handling: ID(7), support_draft_reply: ID(8), support_send_reply: ID(9),
    support_accept_message: ID(10), support_move_message: ID(11), support_intake: ID(12),
  },
  support_group_id: ID(13),
};

async function files(overrides: Record<string, string> = {}) {
  const { privateKey } = await generateKeyPair('RS256', { extractable: true });
  const pem = await exportPKCS8(privateKey);
  const store: Record<string, string> = { 'keys/private.pem': pem, 'desk.config.json': JSON.stringify(report), ...overrides };
  return async (path: string) => {
    if (!(path in store)) throw new Error(`ENOENT ${path}`);
    return store[path] as string;
  };
}

const env = {
  AGENTFLOW_ISSUER: 'https://accounts.example',
  AGENTFLOW_PRIVATE_KEY_ID: 'kid-1',
  SUPPORT_DESK_SESSION_KEY: 'a'.repeat(43),
};

describe('loadConfig', () => {
  it('reads the desk config and serves only ids', async () => {
    const config = await loadConfig(env, await files());
    expect(config.ids.workflows.send_reply).toBe(ID(9));
    expect(config.port).toBe(5174);
    expect(publicConfig(config)).toEqual({ basePath: '/agentflow', ids: config.ids });
  });

  it('lists every problem at once', async () => {
    const broken = JSON.stringify({ ...report, entities: { ...report.entities, reply: 'nope' }, support_group_id: undefined });
    const error = await loadConfig({ AGENTFLOW_PRIVATE_KEY_ID: 'kid' }, await files({ 'desk.config.json': broken })).catch((e) => e);
    expect(error).toBeInstanceOf(ConfigError);
    expect(error.message).toContain('AGENTFLOW_ISSUER is required');
    expect(error.message).toContain('SUPPORT_DESK_SESSION_KEY is required');
    expect(error.message).toContain('entities.reply must be a UUID');
    expect(error.message).toContain('support_group_id must be a UUID');
  });

  it('ignores the relay\'s two variables, which nothing reads any more', async () => {
    const config = await loadConfig({ ...env, SUPPORT_DESK_RELAY_API_KEY: 'nope', SUPPORT_DESK_WEBHOOK_SECRET: 'plain' }, await files());
    expect(publicConfig(config)).toEqual({ basePath: '/agentflow', ids: config.ids });
  });
});
