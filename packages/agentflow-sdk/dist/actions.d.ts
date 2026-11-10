import type { components } from './generated/public.js';
type Schemas = components['schemas'];
/** The subjects the start operation takes: a record, an external id, or none. A selection is launched as a batch. */
export type GenericLaunchSubject = Exclude<Schemas['LaunchSubjectDto'], {
    kind: 'selection';
}> | null;
export interface ResolvedRowLaunch {
    subject: GenericLaunchSubject;
    /** Context-resolved values for `params.<key>` slots. */
    params: Record<string, unknown>;
    /** Param keys a context binding filled — rendered read-only in the start
     *  form; everything else falls through to Manual entry. */
    contextKeys: string[];
    /** Param keys set to the "Default" source — use the workflow field's own
     *  default and don't prompt (neither sent nor shown at launch). */
    defaultKeys: string[];
}
/** Resolve an action's input map against the row context (the record). Only
 *  the `record.*` sources exist here; an empty map (or one that never binds
 *  the subject) falls back to the built-in recordId → subject projection. */
export declare function resolveRowInputMap(action: Schemas['RecordAction'], record: Schemas['EntityRecord']): ResolvedRowLaunch;
/** The contract's params slots to collect in the start form at launch.
 *
 *  A context-bound slot IS prompted for: its value is a prefilled default the
 *  launcher may edit, which only a rendered field can offer. The exception is a
 *  contract with no form — a raw `schema` params binding exposes slots while
 *  `form_definition_id` stays null, so there is nothing to render them with.
 *  Prompting there would trade a working confirm dialog for a blank one, so a
 *  bound value stays silent and fixed instead.
 *
 *  `defaultKeys` (set to the field's own default) are excluded either way:
 *  neither prompted nor sent. */
export declare function manualParamKeys(contract: Schemas['WorkflowContractSummary'], contextKeys: string[], defaultKeys?: string[]): string[];
export {};
//# sourceMappingURL=actions.d.ts.map