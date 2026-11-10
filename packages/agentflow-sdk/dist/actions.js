/** Resolve an action's input map against the row context (the record). Only
 *  the `record.*` sources exist here; an empty map (or one that never binds
 *  the subject) falls back to the built-in recordId → subject projection. */
export function resolveRowInputMap(action, record) {
    const params = {};
    const contextKeys = [];
    const defaultKeys = [];
    for (const b of action.input_map ?? []) {
        if (b.to === 'subject' || !b.to.startsWith('params.'))
            continue;
        const key = b.to.slice('params.'.length);
        if (b.from === 'default') {
            defaultKeys.push(key);
            continue;
        }
        const value = b.from === 'record.id'
            ? record.id
            : b.from.startsWith('record.')
                ? record.body[b.from.slice('record.'.length)]
                : undefined;
        if (value === undefined)
            continue;
        params[key] = value;
        contextKeys.push(key);
    }
    // A `record.id → subject` row is the same projection the empty map defaults
    // to, so the subject is always this record on a row launch.
    return { subject: { kind: 'record', record_id: record.id }, params, contextKeys, defaultKeys };
}
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
export function manualParamKeys(contract, contextKeys, defaultKeys = []) {
    const excluded = contract.form_definition_id
        ? new Set(defaultKeys)
        : new Set([...contextKeys, ...defaultKeys]);
    return contract.params_slots.map((s) => s.key).filter((k) => !excluded.has(k));
}
//# sourceMappingURL=actions.js.map