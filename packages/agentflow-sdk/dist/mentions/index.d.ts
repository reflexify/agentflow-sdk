import type { AgentFlowClient } from '../client.js';
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
    more?: {
        count: number;
        group: string;
        label: string;
    } | null;
}
/** An entity the menu did not search; asking the source again with `group` searches it alone. */
export interface MentionMenuScope {
    group: string;
    label: string;
}
export interface MentionMenu {
    groups: MentionMenuGroup[];
    /** The entities past the ones the whole menu searches, under a heading; absent when every one was searched. */
    unsearched?: {
        title: string;
        scopes: MentionMenuScope[];
    };
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
export declare const ENGLISH_MENU_COPY: MentionMenuCopy;
export declare const VIETNAMESE_MENU_COPY: MentionMenuCopy;
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
export declare const PEOPLE_GROUP = "people";
export declare const RECENT_GROUP = "recent";
/**
 * The `@` menu: what the caller mentioned recently when nothing is typed, otherwise the people who can read the record and
 * the records of each entity with hits, best first. `group` asks for one of those groups alone.
 */
export declare function menu(client: AgentFlowClient, params: MentionMenuParams): Promise<MentionMenu>;
/** The server's menu as the kit's `<af-rich-editor>` draws it. */
export declare function fromResponse(found: MentionMenuResponse, params?: Pick<MentionMenuParams, 'group' | 'peopleTitle' | 'copy'>): MentionMenu;
/** A source for the kit's `<af-rich-editor>` `mentions` property, bound to the record being written about. */
export declare function menuSource(client: AgentFlowClient, context: MentionMenuContext): MentionMenuSource;
/** The people a record write named in a mention field who cannot read it and so were not told; null means nobody. */
export declare function unnotifiedOf(written: {
    unnotified?: UnnotifiedPerson[] | null;
}): UnnotifiedPerson[];
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
export declare function mentionedIn(client: AgentFlowClient, params: MentionedInParams): Promise<MentionedInPage>;
//# sourceMappingURL=index.d.ts.map