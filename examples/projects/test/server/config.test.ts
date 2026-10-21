import { exportPKCS8, generateKeyPair } from 'jose';
import { describe, expect, it } from 'vitest';
import { ConfigError, loadConfig, publicConfig } from '../../server/config.js';
import { parseProjectIds } from '../../src/shared/app-objects.js';
import { ID, idsReport } from '../support/server-config.js';

async function files(overrides: Record<string, string> = {}) {
  const { privateKey } = await generateKeyPair('RS256', { extractable: true });
  const pem = await exportPKCS8(privateKey);
  const store: Record<string, string> = { 'keys/private.pem': pem, 'projects.config.json': JSON.stringify(idsReport), ...overrides };
  return async (path: string) => {
    if (!(path in store)) throw new Error(`ENOENT ${path}`);
    return store[path] as string;
  };
}

const env = {
  AGENTFLOW_ISSUER: 'https://accounts.example',
  AGENTFLOW_PRIVATE_KEY_ID: 'kid-1',
  PROJECTS_SESSION_KEY: 'a'.repeat(43),
};

describe('parseProjectIds', () => {
  it('returns the four entity ids and the three group ids', () => {
    expect(parseProjectIds(idsReport)).toEqual(idsReport);
  });

  it('lists every id that is missing or malformed in one error', () => {
    const broken = { entities: { ...idsReport.entities, section: 'nope', task_label: undefined }, groups: { users: ID(5) } };
    const error = (() => {
      try {
        parseProjectIds(broken);
      } catch (e) {
        return e as Error;
      }
      return undefined;
    })();
    expect(error).toBeInstanceOf(Error);
    for (const problem of ['entities.section must be a UUID', 'entities.task_label must be a UUID', 'groups.creators must be a UUID', 'groups.admins must be a UUID']) {
      expect(error!.message).toContain(problem);
    }
    expect(error!.message).not.toContain('entities.project');
  });

  it('refuses a value that is not an object', () => {
    for (const value of [null, undefined, 'x', 42, []]) expect(() => parseProjectIds(value)).toThrow(/entities\.project must be a UUID/);
  });
});

describe('loadConfig', () => {
  it('reads the ids and serves them with the AgentFlow address', async () => {
    const config = await loadConfig(env, await files());
    expect(config.ids).toEqual(idsReport);
    expect(config.port).toBe(5175);
    expect(config.origin).toBe('http://localhost:5175');
    expect(config.clientId).toBe('projects-dev');
    expect(publicConfig(config)).toEqual({ basePath: '/agentflow', ids: config.ids, agentflowUrl: 'http://localhost:4000' });
  });

  it('takes the AgentFlow address from AGENTFLOW_APP_URL, as an origin with no path', async () => {
    const config = await loadConfig({ ...env, AGENTFLOW_APP_URL: 'HTTPS://App.Example.com:443/' }, await files());
    expect(config.agentflowUrl).toBe('https://app.example.com');
    for (const bad of ['app.example.com', 'https://app.example.com/inbox', 'ftp://app.example.com']) {
      const error = await loadConfig({ ...env, AGENTFLOW_APP_URL: bad }, await files()).catch((e) => e);
      expect(error, bad).toBeInstanceOf(ConfigError);
      expect(error.message, bad).toContain('AGENTFLOW_APP_URL must be an http(s) origin with no path');
    }
  });

  it('lists every problem at once, naming the file', async () => {
    const broken = JSON.stringify({ entities: { ...idsReport.entities, section: 'nope' }, groups: { users: ID(5), creators: ID(6) } });
    const error = await loadConfig({ AGENTFLOW_PRIVATE_KEY_ID: 'kid' }, await files({ 'projects.config.json': broken })).catch((e) => e);
    expect(error).toBeInstanceOf(ConfigError);
    expect(error.message).toContain('AGENTFLOW_ISSUER is required');
    expect(error.message).toContain('PROJECTS_SESSION_KEY is required');
    expect(error.message).toContain('projects.config.json: entities.section must be a UUID');
    expect(error.message).toContain('projects.config.json: groups.admins must be a UUID');
  });

  it('refuses a config file without groups.admins, naming the file and the id', async () => {
    const { admins: _admins, ...groups } = idsReport.groups;
    const error = await loadConfig(env, await files({ 'projects.config.json': JSON.stringify({ ...idsReport, groups }) })).catch((e) => e);
    expect(error).toBeInstanceOf(ConfigError);
    expect(error.message).toContain('projects.config.json: groups.admins must be a UUID');
  });

  it('refuses a malformed entity id, naming the file and the id', async () => {
    const bad = { ...idsReport, entities: { ...idsReport.entities, task: 'not-a-uuid' } };
    const error = await loadConfig(env, await files({ 'projects.config.json': JSON.stringify(bad) })).catch((e) => e);
    expect(error).toBeInstanceOf(ConfigError);
    expect(error.message).toContain('projects.config.json: entities.task must be a UUID');
  });

  it('refuses a missing file, naming the variable and the file', async () => {
    const read = await files();
    const error = await loadConfig({ ...env, PROJECTS_CONFIG_FILE: 'elsewhere.json' }, read).catch((e) => e);
    expect(error).toBeInstanceOf(ConfigError);
    expect(error.message).toContain('PROJECTS_CONFIG_FILE (elsewhere.json) is not readable JSON');
  });

  it('refuses a file that is not JSON', async () => {
    const error = await loadConfig(env, await files({ 'projects.config.json': '{"entities":' })).catch((e) => e);
    expect(error).toBeInstanceOf(ConfigError);
    expect(error.message).toContain('PROJECTS_CONFIG_FILE (projects.config.json) is not readable JSON');
  });
});
