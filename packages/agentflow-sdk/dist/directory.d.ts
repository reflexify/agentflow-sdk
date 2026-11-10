import type { AgentFlowClient } from './client.js';
import type { components } from './generated/public.js';
import type { ComboboxOption, Person, PickerSource, TreeNode } from './pickers.js';
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
/**
 * Sources for the kit's pickers: people, groups and units of the organization, a page at a time as the caller may list them.
 * Each call returns one function, which a picker holds for its lifetime; make it once, not on every render.
 */
export declare const directory: {
    /** People by name or email, narrowed by `opts`. `resolve` names the people for ids the picker holds but has not listed. */
    people(client: AgentFlowClient, opts?: PeopleOptions): PickerSource<Person>;
    /**
     * Groups by name, each described by its member count. An installed app is refused the list, so a group picker on an app's
     * own site offers only the groups the installation names.
     */
    groups(client: AgentFlowClient, opts?: GroupsOptions): PickerSource<ComboboxOption>;
    /**
     * The units the caller is placed in, the primary first and then by name, archived units left out: what a page header reads to
     * say whose court or office it is. An installed app is told a unit's `name` and `code` only while its package lists them of
     * the `org_unit` entity, and is otherwise given `null` for each, with the ids and `primary` intact.
     */
    myUnits(client: AgentFlowClient, signal?: AbortSignal): Promise<MyUnit[]>;
    /**
     * Units by name or code, as the tree's nodes. `resolve` pages through every unit, archived ones included, until it has found
     * the ids asked for or the list ends: the operation names no unit by id in bulk.
     */
    units(client: AgentFlowClient, opts?: UnitsOptions): PickerSource<TreeNode>;
};
//# sourceMappingURL=directory.d.ts.map