import type { AgentFlowClient } from '../client.js';
import { ok } from '../errors.js';
import type { RequestFetch } from '../fetch.js';
import type { components } from '../generated/public.js';
import { readSandbox, type SandboxFile } from './sandbox-file.js';
import { as } from './sign-in.js';

type Holder = components['schemas']['FieldSecurityHolder'];

// Who holds a profile, named as sandbox.json names them.
export type FieldHolder = { group: string } | { person: string } | { principal: string } | { agent: string };

type Options = { dir?: string; fetch?: RequestFetch };

const RUN_DEPLOY = 'run pnpm exec agentflow-app deploy --sandbox';

type Installed = SandboxFile & { installation: NonNullable<SandboxFile['installation']> };

function installed(options?: Options): Installed {
  const sandbox = readSandbox(options?.dir);
  if (!sandbox.installation) throw new Error(`the sandbox has no installed app: ${RUN_DEPLOY}`);
  return sandbox as Installed;
}

// `order.cost` as the entity's id and the field's key, the entity named by the installed app's key for it.
function fieldOf(sandbox: Installed, field: string): { entity_id: string; key: string } {
  const [entity, key, ...rest] = field.split('.');
  if (!entity || !key || rest.length) throw new Error(`${field} is not a field: write <entity>.<field>, such as order.cost`);
  const { objects } = sandbox.installation;
  const id = Object.hasOwn(objects, `entity:${entity}`) ? objects[`entity:${entity}`] : undefined;
  if (!id) throw new Error(`the installed app has no entity ${entity}: is the sandbox file current? ${RUN_DEPLOY}`);
  return { entity_id: id, key };
}

async function holderOf(owner: AgentFlowClient, sandbox: Installed, holder: FieldHolder): Promise<Holder> {
  const pick = (map: Record<string, string>, key: string, noun: string): string => {
    if (Object.hasOwn(map, key)) return map[key]!;
    throw new Error(`the sandbox has no ${noun} ${key}`);
  };
  if ('group' in holder) return { kind: 'group', id: pick(sandbox.ids.groups, holder.group, 'group') };
  if ('principal' in holder) return { kind: 'service_principal', id: pick(sandbox.ids.principals, holder.principal, 'principal') };
  if ('person' in holder) {
    const people = Object.fromEntries(Object.entries(sandbox.people).map(([handle, p]) => [handle, p.user_id]));
    return { kind: 'user', id: pick(people, holder.person, 'person') };
  }
  const { agents } = await ok(
    owner.GET('/app-installations/{installation_id}/agents', { params: { path: { installation_id: sandbox.installation.id } } }),
  );
  const found = agents.find((agent) => agent.logical_key === `agent:${holder.agent}`);
  if (!found) throw new Error(`the installed app has no agent ${holder.agent}`);
  return { kind: 'agent', id: found.id };
}

// Changes one profile's holders and saves it whole, as the sandbox's owner. Nothing is sent when the holder is already
// where `held` says.
async function setHolder(profile: string, holder: FieldHolder, held: boolean, options?: Options): Promise<void> {
  const sandbox = installed(options);
  const owner = as(sandbox.owner, options);
  const { profiles } = await ok(owner.GET('/field-access/profiles'));
  const summary = profiles.find((p) => p.name === profile);
  if (!summary) throw new Error(`no field security profile is named ${profile}: sandbox.json's field_security makes it at deploy`);
  const path = { profile_id: summary.id };
  const current = await ok(owner.GET('/field-access/profiles/{profile_id}', { params: { path } }));
  const wanted = await holderOf(owner, sandbox, holder);
  const same = (h: Holder) => h.kind === wanted.kind && h.id === wanted.id;
  if (current.holders.some(same) === held) return;
  const holders = held ? [...current.holders, wanted] : current.holders.filter((h) => !same(h));
  await ok(
    owner.PUT('/field-access/profiles/{profile_id}', {
      params: { path },
      body: { name: current.name, description: current.description, fields: current.fields, holders, expected_updated_at: current.updated_at },
    }),
  );
}

export function grantFieldProfile(profile: string, holder: FieldHolder, options?: Options): Promise<void> {
  return setHolder(profile, holder, true, options);
}

export function revokeFieldProfile(profile: string, holder: FieldHolder, options?: Options): Promise<void> {
  return setHolder(profile, holder, false, options);
}

// Unsecuring takes the field out of every profile, and securing it again does not put it back: a deploy --sandbox
// --upgrade applies sandbox.json's field_security again.
async function setSecured(field: string, secured: boolean, options?: Options): Promise<void> {
  const sandbox = installed(options);
  const { entity_id, key } = fieldOf(sandbox, field);
  await ok(
    as(sandbox.owner, options).PUT('/field-access/entities/{entity_id}/secured', {
      params: { path: { entity_id }, query: { field_key: key } },
      body: { secured },
    }),
  );
}

export function secureField(field: string, options?: Options): Promise<void> {
  return setSecured(field, true, options);
}

export function unsecureField(field: string, options?: Options): Promise<void> {
  return setSecured(field, false, options);
}

// Throws unless the client's person reads the record but not the field: the field is secured, the entity says they may
// not read it, and the record they are answered with leaves it out.
export async function expectFieldHidden(client: AgentFlowClient, field: string, recordId: string, options?: Options): Promise<void> {
  const sandbox = installed(options);
  const { entity_id, key } = fieldOf(sandbox, field);
  const entity = await ok(client.GET('/entities/{entity_id}', { params: { path: { entity_id } } }));
  const levels = Object.hasOwn(entity.field_access, key) ? entity.field_access[key] : undefined;
  if (!levels) throw new Error(`${field} is not secured, so everyone who reads the record reads it`);
  if (levels.read) throw new Error(`this person may read ${field}`);
  const record = await ok(client.GET('/entities/{entity_id}/records/{record_id}', { params: { path: { entity_id, record_id: recordId } } }));
  if (Object.hasOwn(record.body, key)) throw new Error(`record ${recordId} carries ${field} for this person`);
}
