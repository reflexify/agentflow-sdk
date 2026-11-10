import type { AgentFlowClient } from './client.js';
import { ok } from './errors.js';
import type { components } from './generated/public.js';
import type { ComboboxOption, Person, PickerPage, PickerQuery, PickerSource, TreeNode } from './pickers.js';

export interface PeopleOptions {
  q?: never;
  /** Comma-separated group ids: only people in any of them. */
  group_id?: string;
  /** Comma-separated group ids: nobody in any of them. */
  not_group_id?: string;
  /** Comma-separated unit ids: only people placed in any of them or beneath. Needs `deployment.admin`. */
  unit_id?: string;
  /** Comma-separated role ids: only people holding any of them. Needs `deployment.admin`. */
  role_id?: string;
  is_active?: boolean;
  /** The page size, 1 to 200. */
  limit?: number;
}

export interface GroupsOptions {
  /** The page size, 1 to 200. */
  limit?: number;
  /** The description under a group's name; English by default: "1 member", "12 members". */
  members?: (count: number) => string;
}

export interface UnitsOptions {
  include_archived?: boolean;
  /** The page size, 1 to 200. */
  limit?: number;
}

/** A unit the caller is placed in. `name` and `code` are null where an installed app's package does not list them. */
export type MyUnit = components['schemas']['MyUnit'];

type DirectoryUnit = components['schemas']['Unit'] | components['schemas']['AppDirectoryUnit'];
type DirectoryPerson = components['schemas']['UserListItem'] | components['schemas']['AppDirectoryUser'];

const englishMembers = (count: number): string => `${count} ${count === 1 ? 'member' : 'members'}`;

const pageQuery = (query: PickerQuery) => ({ q: query.q || undefined, cursor: query.cursor ?? undefined });

/** An installed app is told a person's name only while its package lists it, so the email, then the id, stands in for it. */
const personOf = (user: DirectoryPerson): Person => ({
  id: user.id,
  name: user.display_name ?? user.email ?? user.id,
  email: user.email ?? null,
});

const nodeOf = (unit: DirectoryUnit): TreeNode => ({
  id: unit.id,
  parentId: unit.parent_id ?? null,
  label: unit.name ?? unit.code ?? unit.id,
  code: unit.code ?? null,
  archived: unit.archived ?? false,
});

async function namesOf(client: AgentFlowClient, query: { user_ids: string } | { group_ids: string }, signal: AbortSignal) {
  return ok(client.GET('/identities', { params: { query }, signal }));
}

/**
 * Sources for the kit's pickers: people, groups and units of the organization, a page at a time as the caller may list them.
 * Each call returns one function, which a picker holds for its lifetime; make it once, not on every render.
 */
export const directory = {
  /** People by name or email, narrowed by `opts`. `resolve` names the people for ids the picker holds but has not listed. */
  people(client: AgentFlowClient, opts: PeopleOptions = {}): PickerSource<Person> {
    const source = async (query: PickerQuery): Promise<PickerPage<Person>> => {
      const page = await ok(client.GET('/users', { params: { query: { ...opts, ...pageQuery(query) } }, signal: query.signal }));
      return { items: page.items.map(personOf), next: page.next_cursor ?? null };
    };
    const resolve = async (ids: string[], signal: AbortSignal): Promise<Person[]> => {
      if (ids.length === 0) return [];
      const found = await namesOf(client, { user_ids: ids.join(',') }, signal);
      return found.users.map(({ id, name }) => ({ id, name }));
    };
    return Object.assign(source, { resolve });
  },

  /**
   * Groups by name, each described by its member count. An installed app is refused the list, so a group picker on an app's
   * own site offers only the groups the installation names.
   */
  groups(client: AgentFlowClient, opts: GroupsOptions = {}): PickerSource<ComboboxOption> {
    const members = opts.members ?? englishMembers;
    const source = async (query: PickerQuery): Promise<PickerPage<ComboboxOption>> => {
      const page = await ok(client.GET('/groups', { params: { query: { limit: opts.limit, ...pageQuery(query) } }, signal: query.signal }));
      return {
        items: page.items.map((group) => ({ value: group.id, label: group.name, description: members(group.member_count) })),
        next: page.next_cursor ?? null,
      };
    };
    const resolve = async (ids: string[], signal: AbortSignal): Promise<ComboboxOption[]> => {
      if (ids.length === 0) return [];
      const found = await namesOf(client, { group_ids: ids.join(',') }, signal);
      return found.groups.map(({ id, name }) => ({ value: id, label: name }));
    };
    return Object.assign(source, { resolve });
  },

  /**
   * The units the caller is placed in, the primary first and then by name, archived units left out: what a page header reads to
   * say whose court or office it is. An installed app is told a unit's `name` and `code` only while its package lists them of
   * the `org_unit` entity, and is otherwise given `null` for each, with the ids and `primary` intact.
   */
  async myUnits(client: AgentFlowClient, signal?: AbortSignal): Promise<MyUnit[]> {
    return (await ok(client.GET('/me/units', { signal }))).items;
  },

  /**
   * Units by name or code, as the tree's nodes. `resolve` pages through every unit, archived ones included, until it has found
   * the ids asked for or the list ends: the operation names no unit by id in bulk.
   */
  units(client: AgentFlowClient, opts: UnitsOptions = {}): PickerSource<TreeNode> {
    const source = async (query: PickerQuery): Promise<PickerPage<TreeNode>> => {
      const page = await ok(
        client.GET('/units', { params: { query: { limit: opts.limit, include_archived: opts.include_archived, ...pageQuery(query) } }, signal: query.signal }),
      );
      return { items: page.items.map(nodeOf), next: page.next_cursor ?? null };
    };
    const resolve = async (ids: string[], signal: AbortSignal): Promise<TreeNode[]> => {
      const wanted = new Set(ids);
      const found: TreeNode[] = [];
      let cursor: string | undefined;
      while (found.length < wanted.size) {
        const page = await ok(client.GET('/units', { params: { query: { limit: opts.limit, include_archived: true, cursor } }, signal }));
        for (const unit of page.items) if (wanted.has(unit.id)) found.push(nodeOf(unit));
        if (!page.next_cursor) break;
        cursor = page.next_cursor;
      }
      return found;
    };
    return Object.assign(source, { resolve });
  },
};
