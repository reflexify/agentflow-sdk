import { exportPKCS8, generateKeyPair } from 'jose';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { runChecks, type Check } from '../server/checks.js';
import { loadConfig } from '../server/config.js';
import { installReport } from './support/config.js';

let pem = '';
beforeAll(async () => {
  pem = await exportPKCS8((await generateKeyPair('RS256', { extractable: true })).privateKey);
});
// The key and the desk config sit at the paths loadConfig asks for; anything else is not there.
const files = (report: unknown = installReport) => async (path: string) => {
  if (path === 'keys/private.pem') return pem;
  if (path === 'desk.config.json') return JSON.stringify(report);
  throw new Error(`ENOENT ${path}`);
};
const read = files();
const env = {
  AGENTFLOW_ISSUER: 'https://id.example',
  AGENTFLOW_PRIVATE_KEY_ID: 'k1',
  SUPPORT_DESK_SESSION_KEY: Buffer.alloc(32, 2).toString('base64url'),
};
const discovery = {
  issuer: 'https://id.example',
  authorization_endpoint: 'https://id.example/authorize',
  token_endpoint: 'https://id.example/token',
  jwks_uri: 'https://id.example/jwks',
  token_endpoint_auth_methods_supported: ['private_key_jwt'],
};
const fakeFetch = (routes: Record<string, () => Response>) =>
  (async (input: RequestInfo | URL) => {
    const url = String(input instanceof Request ? input.url : input);
    const hit = routes[url];
    if (!hit) throw new TypeError(`fetch failed: ${url}`);
    return hit();
  }) as typeof fetch;

describe('doctor checks', () => {
  it('passes when the provider and AgentFlow answer as expected', async () => {
    const checks = await runChecks(env, fakeFetch({
      'https://id.example/.well-known/openid-configuration': () => Response.json(discovery),
      'http://localhost:8080/api/v1/caller': () => new Response(null, { status: 401 }),
    }), read);
    expect(checks.map((c) => [c.name, c.ok])).toEqual([
      ['configuration', true], ['identity provider', true], ['private_key_jwt', true], ['AgentFlow API', true],
      ['desk config', true], ['live updates', true],
    ]);
  });
  it('doctor names each failing check', async () => {
    const checks = await runChecks(env, fakeFetch({
      'https://id.example/.well-known/openid-configuration': () => Response.json({ ...discovery, issuer: 'https://other.example', token_endpoint_auth_methods_supported: ['client_secret_basic'] }),
    }), read);
    const failed = checks.filter((c) => !c.ok).map((c) => c.name);
    expect(failed).toEqual(['identity provider', 'private_key_jwt', 'AgentFlow API']);
    expect(checks.find((c) => c.name === 'AgentFlow API')!.detail).toMatch(/fetch failed/);
  });
  it('does not vouch for private_key_jwt when discovery does not answer 200', async () => {
    const checks = await runChecks(env, fakeFetch({
      'https://id.example/.well-known/openid-configuration': () => new Response('not found', { status: 404 }),
      'http://localhost:8080/api/v1/caller': () => new Response(null, { status: 401 }),
    }), read);
    expect(checks.slice(1, 3)).toEqual([
      { name: 'identity provider', ok: false, detail: 'discovery answered 404' },
      { name: 'private_key_jwt', ok: false, detail: 'not checked: discovery answered 404' },
    ]);
  });
  it('passes a provider that does not list its token endpoint auth methods, and names the OIDC default', async () => {
    const bare: Record<string, unknown> = { ...discovery };
    delete bare.token_endpoint_auth_methods_supported;
    const checks = await runChecks(env, fakeFetch({
      'https://id.example/.well-known/openid-configuration': () => Response.json(bare),
      'http://localhost:8080/api/v1/caller': () => new Response(null, { status: 401 }),
    }), read);
    expect(checks.find((c) => c.name === 'private_key_jwt')).toEqual({
      name: 'private_key_jwt',
      ok: true,
      detail: "provider does not list its methods; OIDC's default is client_secret_basic, so sign-in may fail if private_key_jwt is not accepted",
    });
  });
  it('names why a host could not be reached, with the code fetch keeps in the cause, as the server log does', async () => {
    const refused = (async () => {
      const cause = Object.assign(new AggregateError([], ''), { code: 'ECONNREFUSED' });
      throw new TypeError('fetch failed', { cause });
    }) as typeof fetch;
    const notFound = (async () => {
      const cause = Object.assign(new Error('getaddrinfo ENOTFOUND id.example'), { code: 'ENOTFOUND' });
      throw new TypeError('fetch failed', { cause });
    }) as typeof fetch;
    const api = (await runChecks(env, refused, read)).find((c) => c.name === 'AgentFlow API')!;
    expect(api).toEqual({ name: 'AgentFlow API', ok: false, detail: 'TypeError: fetch failed (ECONNREFUSED)' });
    const idp = (await runChecks(env, notFound, read)).find((c) => c.name === 'identity provider')!;
    expect(idp.detail).toBe('TypeError: fetch failed (ENOTFOUND)');
  });
  it('drops a cause code outside RFC 6749\'s error charset, as the server log does', async () => {
    const hostile = (async () => {
      throw new TypeError('fetch failed', { cause: Object.assign(new Error(''), { code: 'E\u001b[2KFORGED' }) });
    }) as typeof fetch;
    const api = (await runChecks(env, hostile, read)).find((c) => c.name === 'AgentFlow API')!;
    expect(api.detail).toBe('TypeError: fetch failed');
  });
  it('fails the configuration for a mistyped AGENTFLOW_RESOURCE, before the provider sees it', async () => {
    const checks = await runChecks({ ...env, AGENTFLOW_RESOURCE: 'http//localhost:8080/api/v1/rest' }, fakeFetch({}), read);
    expect(checks).toHaveLength(1);
    expect(checks[0]).toMatchObject({ name: 'configuration', ok: false });
    expect(checks[0]!.detail).toContain('AGENTFLOW_RESOURCE must be an absolute http(s) URL');
  });
  it('stops after a configuration failure, with loadConfig\'s own message', async () => {
    const checks = await runChecks({}, fakeFetch({}), read);
    expect(checks).toHaveLength(1);
    const message = await loadConfig({}, read).then(
      () => 'loaded',
      (error: Error) => error.message,
    );
    expect(checks[0]).toEqual({ name: 'configuration', ok: false, detail: message });
  });
});

const API = 'http://localhost:8080/api/v1/caller';
const wants401 = () => new Response(null, { status: 401 });
const find = (checks: Check[], name: string) => checks.find((c) => c.name === name);

describe('the issuer, as the SDK compares it', () => {
  const PATH_DISCOVERY = 'https://host.example/realms/x/.well-known/openid-configuration';
  const pathDiscovery = { ...discovery, issuer: 'https://host.example/realms/x' };

  it('fails a path issuer that differs from discovery only by a trailing slash, and names both', async () => {
    const checks = await runChecks({ ...env, AGENTFLOW_ISSUER: 'https://host.example/realms/x/' }, fakeFetch({
      [PATH_DISCOVERY]: () => Response.json(pathDiscovery),
      [API]: wants401,
    }), read);
    expect(find(checks, 'identity provider')).toEqual({
      name: 'identity provider',
      ok: false,
      detail: 'discovery reports issuer "https://host.example/realms/x", but AGENTFLOW_ISSUER is "https://host.example/realms/x/"; the SDK requires them to match exactly',
    });
  });
  it('passes the same path issuer written exactly as discovery reports it', async () => {
    const checks = await runChecks({ ...env, AGENTFLOW_ISSUER: 'https://host.example/realms/x' }, fakeFetch({
      [PATH_DISCOVERY]: () => Response.json(pathDiscovery),
      [API]: wants401,
    }), read);
    expect(find(checks, 'identity provider')).toEqual({ name: 'identity provider', ok: true, detail: 'discovery ok' });
  });
  it('passes an origin-only issuer whether or not either side writes the slash, as the parsed URLs are equal', async () => {
    for (const [configured, reported] of [['https://id.example', 'https://id.example/'], ['https://id.example/', 'HTTPS://ID.example']]) {
      const checks = await runChecks({ ...env, AGENTFLOW_ISSUER: configured }, fakeFetch({
        'https://id.example/.well-known/openid-configuration': () => Response.json({ ...discovery, issuer: reported }),
        [API]: wants401,
      }), read);
      expect(find(checks, 'identity provider'), `${configured} vs ${reported}`).toEqual({ name: 'identity provider', ok: true, detail: 'discovery ok' });
    }
  });
  it('treats an issuer that is not a URL as a mismatch rather than throwing', async () => {
    const checks = await runChecks(env, fakeFetch({
      'https://id.example/.well-known/openid-configuration': () => Response.json({ ...discovery, issuer: 'not a url' }),
      [API]: wants401,
    }), read);
    expect(find(checks, 'identity provider')).toEqual({
      name: 'identity provider',
      ok: false,
      detail: 'discovery reports issuer "not a url", but AGENTFLOW_ISSUER is "https://id.example"; the SDK requires them to match exactly',
    });
  });
  it('says so when discovery reports no issuer at all', async () => {
    const { issuer: _issuer, ...noIssuer } = discovery;
    const checks = await runChecks(env, fakeFetch({
      'https://id.example/.well-known/openid-configuration': () => Response.json(noIssuer),
      [API]: wants401,
    }), read);
    expect(find(checks, 'identity provider')!.detail).toBe(
      'discovery reports no issuer, but AGENTFLOW_ISSUER is "https://id.example"; the SDK requires them to match exactly',
    );
  });
  it('fetches an issuer that already names a discovery document as it is, and, like the SDK, compares no issuer', async () => {
    const checks = await runChecks({ ...env, AGENTFLOW_ISSUER: 'https://id.example/.well-known/openid-configuration' }, fakeFetch({
      'https://id.example/.well-known/openid-configuration': () => Response.json(discovery),
      [API]: wants401,
    }), read);
    expect(find(checks, 'identity provider')).toMatchObject({ ok: true });
  });
  for (const [what, issuer] of [['no issuer', undefined], ['an empty issuer', ''], ['an issuer that is not a string', 42]] as const) {
    it(`fails an issuer that names a discovery document reporting ${what}, which the SDK refuses too`, async () => {
      const checks = await runChecks({ ...env, AGENTFLOW_ISSUER: 'https://id.example/.well-known/openid-configuration' }, fakeFetch({
        'https://id.example/.well-known/openid-configuration': () => Response.json({ ...discovery, issuer }),
        [API]: wants401,
      }), read);
      expect(find(checks, 'identity provider')).toEqual({
        name: 'identity provider',
        ok: false,
        detail: 'discovery reports no issuer; the SDK requires one',
      });
    });
  }
  it('asks for JSON without following a redirect, and fails a discovery that answers anything but 200', async () => {
    const seen: RequestInit[] = [];
    const redirecting = (async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input) === API) return wants401();
      seen.push(init ?? {});
      return init?.redirect === 'manual'
        ? new Response(null, { status: 302, headers: { location: 'https://elsewhere.example/openid-configuration' } })
        : Response.json(discovery);
    }) as typeof fetch;
    const checks = await runChecks(env, redirecting, read);
    expect(seen).toHaveLength(1);
    expect(new Headers(seen[0]!.headers).get('accept')).toBe('application/json');
    expect(checks.slice(1, 3)).toEqual([
      { name: 'identity provider', ok: false, detail: 'discovery answered 302' },
      { name: 'private_key_jwt', ok: false, detail: 'not checked: discovery answered 302' },
    ]);
  });
});

describe('a discovery document that is not a JSON object', () => {
  const bodies: [string, () => Response][] = [
    ['an HTML page', () => new Response('<html>sign in</html>', { status: 200, headers: { 'content-type': 'text/html' } })],
    ['JSON null', () => Response.json(null)],
    ['a JSON array', () => Response.json([discovery])],
    ['a JSON string', () => Response.json('https://id.example')],
  ];
  for (const [what, body] of bodies) {
    it(`fails the provider and leaves private_key_jwt unchecked for ${what}`, async () => {
      const checks = await runChecks(env, fakeFetch({
        'https://id.example/.well-known/openid-configuration': body,
        [API]: wants401,
      }), read);
      expect(checks.slice(1, 3)).toEqual([
        { name: 'identity provider', ok: false, detail: 'discovery document is not a JSON object' },
        { name: 'private_key_jwt', ok: false, detail: 'not checked: discovery document is not a JSON object' },
      ]);
    });
  }
});

describe('timeouts', () => {
  afterEach(() => vi.restoreAllMocks());

  const silent = ((_input: RequestInfo | URL, init?: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      const signal = init?.signal;
      signal?.addEventListener('abort', () => reject(signal.reason), { once: true });
    })) as typeof fetch;

  it('gives up on a host that never answers, and says it timed out', async () => {
    const checks = await runChecks(env, silent, read, { timeoutMs: 20 });
    expect(checks.slice(1, 4)).toEqual([
      { name: 'identity provider', ok: false, detail: 'timed out: no answer within 20 ms' },
      { name: 'private_key_jwt', ok: false, detail: 'not checked: discovery unreachable' },
      { name: 'AgentFlow API', ok: false, detail: 'timed out: no answer within 20 ms' },
    ]);
  });
  it('gives every request ten seconds by default', async () => {
    const timeout = vi.spyOn(AbortSignal, 'timeout');
    const signals: (AbortSignal | null | undefined)[] = [];
    const checks = await runChecks(env, (async (input: RequestInfo | URL, init?: RequestInit) => {
      signals.push(init?.signal);
      return String(input) === API ? wants401() : Response.json(discovery);
    }) as typeof fetch, read);
    expect(checks.every((c) => c.ok)).toBe(true);
    expect(timeout.mock.calls).toEqual([[10_000], [10_000]]);
    expect(signals).toEqual(timeout.mock.results.map((r) => r.value));
  });
});

describe('the other branches', () => {
  it('names the endpoints discovery lacks', async () => {
    const { authorization_endpoint: _a, jwks_uri: _j, ...partial } = discovery;
    const checks = await runChecks(env, fakeFetch({
      'https://id.example/.well-known/openid-configuration': () => Response.json(partial),
      [API]: wants401,
    }), read);
    expect(find(checks, 'identity provider')).toEqual({
      name: 'identity provider',
      ok: false,
      detail: 'discovery lacks authorization_endpoint, jwks_uri',
    });
  });
  it('fails an API that answers anything but 401 without a token', async () => {
    const checks = await runChecks(env, fakeFetch({
      'https://id.example/.well-known/openid-configuration': () => Response.json(discovery),
      [API]: () => Response.json({ kind: 'user' }),
    }), read);
    expect(find(checks, 'AgentFlow API')).toEqual({
      name: 'AgentFlow API',
      ok: false,
      detail: 'GET /caller without a token answered 200, expected 401',
    });
  });
  it('names the desk config file it read', async () => {
    const checks = await runChecks({ ...env, SUPPORT_DESK_CONFIG_FILE: 'other.config.json' }, fakeFetch({
      'https://id.example/.well-known/openid-configuration': () => Response.json(discovery),
      [API]: wants401,
    }), async (path) => (path === 'other.config.json' ? JSON.stringify(installReport) : read(path)));
    expect(find(checks, 'desk config')).toEqual({
      name: 'desk config',
      ok: true,
      detail: 'other.config.json: 6 entities, 5 workflows and the support group',
    });
  });
  it('describes a thrown value that is not an Error without printing it', async () => {
    const throwsObject = (async () => {
      throw { token: 'not-for-the-terminal' };
    }) as typeof fetch;
    const checks = await runChecks(env, throwsObject, read);
    expect(find(checks, 'identity provider')).toEqual({ name: 'identity provider', ok: false, detail: 'a thrown object' });
    expect(find(checks, 'AgentFlow API')).toEqual({ name: 'AgentFlow API', ok: false, detail: 'a thrown object' });
  });
});

describe('the desk config', () => {
  it('lists every id that is missing or malformed, as the configuration failure', async () => {
    const broken = { ...installReport, entities: { ...installReport.entities, reply: 'nope', note: undefined }, support_group_id: '' };
    const checks = await runChecks(env, fakeFetch({}), files(broken));
    expect(checks).toHaveLength(1);
    expect(checks[0]).toMatchObject({ name: 'configuration', ok: false });
    for (const problem of ['entities.reply must be a UUID', 'entities.note must be a UUID', 'support_group_id must be a UUID']) {
      expect(checks[0]!.detail).toContain(`desk.config.json: ${problem}`);
    }
  });
  it('says when the file is not there', async () => {
    const checks = await runChecks(env, fakeFetch({}), async (path) => {
      if (path === 'keys/private.pem') return pem;
      throw new Error(`ENOENT ${path}`);
    });
    expect(checks[0]!.detail).toContain('SUPPORT_DESK_CONFIG_FILE (desk.config.json) is not readable JSON');
  });
});

describe('live updates', () => {
  const live = async (extra: Record<string, string>) =>
    find(
      await runChecks({ ...env, ...extra }, fakeFetch({
        'https://id.example/.well-known/openid-configuration': () => Response.json(discovery),
        [API]: wants401,
      }), read),
      'live updates',
    )!;

  it('come from AgentFlow, with nothing to set in the desk', async () => {
    expect(await live({})).toEqual({
      name: 'live updates',
      ok: true,
      detail: "from AgentFlow's event stream: the rail reads Live once AgentFlow has REALTIME_CHANNEL_ENABLED on (RUNBOOK, The desk, step 7)",
    });
  });

  it('warn about the relay\'s variables, which nothing reads any more, without failing check-setup', async () => {
    expect(await live({ SUPPORT_DESK_RELAY_API_KEY: 'afk_x', SUPPORT_DESK_WEBHOOK_SECRET: 'whsec_x' })).toEqual({
      name: 'live updates',
      ok: true,
      warning: true,
      detail: "SUPPORT_DESK_RELAY_API_KEY and SUPPORT_DESK_WEBHOOK_SECRET are no longer read: remove them from .env, and delete the relay's webhook subscription in Admin → Webhooks (RUNBOOK, The desk, step 7)",
    });
    expect((await live({ SUPPORT_DESK_WEBHOOK_SECRET: 'whsec_x' })).detail)
      .toMatch(/^SUPPORT_DESK_WEBHOOK_SECRET is no longer read: remove it from \.env/);
  });
});
