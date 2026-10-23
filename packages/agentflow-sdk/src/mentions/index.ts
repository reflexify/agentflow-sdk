import type { AgentFlowClient } from '../client.js';
import { ok } from '../errors.js';
import type { components } from '../generated/public.js';

/** One token as one viewer may read it; the `mentions` map of a response is keyed by the token's target, `<kind>/<id>`. */
export type ResolvedMention = components['schemas']['ResolvedMention'];
export type UnnotifiedPerson = components['schemas']['UnnotifiedPerson'];
/** A record that mentions another, as `GET /entities/{id}/records/{id}/mentioned-in` lists it. */
export type MentionedInItem = components['schemas']['MentionedInItem'];
/** Where a source mentions the record: one of its comments, or a field. */
export type MentionPlace = components['schemas']['MentionPlace'];
export type MentionedInPage = components['schemas']['MentionedInPage'];
/** The `@` menu as `GET /mentions` answers it. */
export type MentionMenuResponse = components['schemas']['MentionMenu'];

export interface MentionMenuItem {
  kind: 'user' | 'record';
  /** The token's target: `user/<id>` or `record/<entity id>/<record id>`. */
  ref: string;
  label: string;
  meta?: string | null;
  entity_label?: string | null;
  /** The caller. */
  self?: boolean;
}

export interface MentionMenuGroup {
  key: string;
  title: string;
  items: MentionMenuItem[];
  /** Hits past the ones listed; asking the source again with `group` lists them. */
  more?: { count: number; group: string; label: string } | null;
}

/** An entity the menu did not search; asking the source again with `group` searches it alone. */
export interface MentionMenuScope {
  group: string;
  label: string;
}

export interface MentionMenu {
  groups: MentionMenuGroup[];
  /** The entities past the ones the whole menu searches, under a heading; absent when every one was searched. */
  unsearched?: { title: string; scopes: MentionMenuScope[] };
}

export type MentionMenuSource = (q: string, group?: string) => Promise<MentionMenu>;

/** The words the menu shows that the server does not: English unless given. */
export interface MentionMenuCopy {
  /** Heading of what the caller mentioned recently, when nothing is typed. */
  recent: string;
  people: string;
  /** Meta of the caller among the people. */
  you: string;
  /** Meta of a person a mention here will tell. */
  willBeNotified: string;
  /** Meta of a record found by a field other than its display field. */
  matchedBy: (field: string) => string;
  /** The row that lists the rest of an entity's hits. */
  more: (count: number, entity: string) => string;
  /** Heading of one entity's hits asked for alone. */
  results: (count: number, entity: string) => string;
  /** Heading of the entities the menu did not search, each of which can be searched alone. */
  searchIn: string;
}

export const ENGLISH_MENU_COPY: MentionMenuCopy = {
  recent: 'Recently mentioned',
  people: 'People',
  you: 'You',
  willBeNotified: 'Will be notified',
  matchedBy: (field) => `Matched by ${field}`,
  more: (count, entity) => `${count} more in ${entity}`,
  results: (count, entity) => `${entity} · ${count} results`,
  searchIn: 'Search in',
};

export const VIETNAMESE_MENU_COPY: MentionMenuCopy = {
  recent: 'Nhắc gần đây',
  people: 'Người',
  you: 'Bạn',
  willBeNotified: 'Sẽ nhận thông báo',
  matchedBy: (field) => `Khớp theo ${field}`,
  more: (count, entity) => `Xem thêm ${count} trong ${entity}`,
  results: (count, entity) => `${entity} · ${count} kết quả`,
  searchIn: 'Tìm trong',
};

export interface MentionMenuContext {
  /** The entity of the record written about, or of the one a create form will create. */
  entity_id: string;
  /** The record written about; absent on a create form. */
  record_id?: string;
  /** On a create form, the record the new one will be created under. */
  parent_record_id?: string;
  /** The most rows of each group, 1 to 8. */
  limit?: number;
  /** Overrides the heading of the people group. */
  peopleTitle?: string;
  copy?: Partial<MentionMenuCopy>;
}

export interface MentionMenuParams extends MentionMenuContext {
  q?: string;
  /** `people`, or `entity:<entity id>`; absent asks for the whole menu. */
  group?: string;
}

export const PEOPLE_GROUP = 'people';
export const RECENT_GROUP = 'recent';

/**
 * The `@` menu: what the caller mentioned recently when nothing is typed, otherwise the people who can read the record and
 * the records of each entity with hits, best first. `group` asks for one of those groups alone.
 */
export async function menu(client: AgentFlowClient, params: MentionMenuParams): Promise<MentionMenu> {
  const query: {
    entity_id: string;
    record_id?: string;
    parent_record_id?: string;
    q?: string;
    group?: string;
    limit?: number;
  } = { entity_id: params.entity_id };
  if (params.record_id) query.record_id = params.record_id;
  if (params.parent_record_id) query.parent_record_id = params.parent_record_id;
  if (params.q) query.q = params.q;
  if (params.group) query.group = params.group;
  if (params.limit !== undefined) query.limit = params.limit;
  const found = await ok(client.GET('/mentions', { params: { query } }));
  return fromResponse(found, params);
}

/** The server's menu as the kit's `<af-rich-editor>` draws it. */
export function fromResponse(found: MentionMenuResponse, params: Pick<MentionMenuParams, 'group' | 'peopleTitle' | 'copy'> = {}): MentionMenu {
  const copy: MentionMenuCopy = { ...ENGLISH_MENU_COPY, ...params.copy };
  const unsearched = unsearchedOf(found, copy);
  return {
    groups: found.groups.map((g) => {
      const isEntity = g.key !== PEOPLE_GROUP && g.key !== RECENT_GROUP;
      const title =
        g.key === PEOPLE_GROUP
          ? (params.peopleTitle ?? copy.people)
          : g.key === RECENT_GROUP
            ? copy.recent
            : params.group === g.key && g.total != null
              ? copy.results(g.total, g.label)
              : g.label;
      const items: MentionMenuItem[] = g.items.map((item) =>
        item.kind === 'user'
          ? {
              kind: 'user',
              ref: `user/${item.id}`,
              label: item.name,
              meta: item.is_self ? copy.you : item.will_be_notified ? copy.willBeNotified : (item.email ?? null),
              self: item.is_self,
            }
          : {
              kind: 'record',
              ref: `record/${item.entity_id}/${item.id}`,
              label: item.label,
              entity_label: item.entity_label,
              meta: item.matched_field ? copy.matchedBy(item.matched_field) : null,
            },
      );
      const more = isEntity && g.more ? { count: g.more, group: g.key, label: copy.more(g.more, g.label) } : null;
      return { key: g.key, title, items, more };
    }),
    ...(unsearched ? { unsearched } : {}),
  };
}

function unsearchedOf(found: MentionMenuResponse, copy: MentionMenuCopy): MentionMenu['unsearched'] {
  const scopes = (found.unsearched ?? []).map((e) => ({ group: e.key, label: e.label }));
  return scopes.length > 0 ? { title: copy.searchIn, scopes } : undefined;
}

/** A source for the kit's `<af-rich-editor>` `mentions` property, bound to the record being written about. */
export function menuSource(client: AgentFlowClient, context: MentionMenuContext): MentionMenuSource {
  return (q, group) => menu(client, { ...context, q, group });
}

/** The people a record write named in a mention field who cannot read it and so were not told; null means nobody. */
export function unnotifiedOf(written: { unnotified?: UnnotifiedPerson[] | null }): UnnotifiedPerson[] {
  return written.unnotified ?? [];
}

export interface MentionedInParams {
  /** The entity of the record that is mentioned. */
  entity_id: string;
  /** The record that is mentioned. */
  record_id: string;
  /** The `next_cursor` of the previous page. */
  cursor?: string;
  /** 1 to 200; 50 when absent. */
  limit?: number;
}

/**
 * The records that mention a record, newest mention first, one row each with its count and where it mentions. Only sources
 * the caller may read are listed, so a page can be shorter than `limit` while `next_cursor` is set.
 */
export async function mentionedIn(client: AgentFlowClient, params: MentionedInParams): Promise<MentionedInPage> {
  const query: { cursor?: string; limit?: number } = {};
  if (params.cursor) query.cursor = params.cursor;
  if (params.limit !== undefined) query.limit = params.limit;
  return ok(
    client.GET('/entities/{entity_id}/records/{record_id}/mentioned-in', {
      params: { path: { entity_id: params.entity_id, record_id: params.record_id }, query },
    }),
  );
}
