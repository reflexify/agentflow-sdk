/** Sends `items` to a host with `kinds`, and the first `record` item (or null) to one without. Never throws. */
export function setAssistantContext(assistant, items) {
    if (!assistant)
        return;
    try {
        if (assistant.kinds) {
            assistant.setContext(items);
            return;
        }
        const first = items.find((item) => item.kind === 'record');
        assistant.setContext(first?.kind === 'record' ? { entity: first.entity, record: first.record } : null);
    }
    catch {
        // A host that fails to take the context must not cost the screen that offered it.
    }
}
//# sourceMappingURL=assistant.js.map