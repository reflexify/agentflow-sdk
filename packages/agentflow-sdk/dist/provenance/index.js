/** One field's origin and citation with its cited chunk ids joined to the answer's passages; undefined for a field the answer does not hold. */
export function forField(answer, field_key) {
    const field = answer.fields.find((f) => f.field_key === field_key);
    if (!field)
        return undefined;
    const byChunk = new Map(answer.passages.map((p) => [p.chunk_id, p]));
    const passages = [];
    for (const id of field.citation?.sources ?? []) {
        const passage = byChunk.get(id);
        if (passage)
            passages.push(passage);
    }
    return { origin: field.origin, citation: field.citation, passages };
}
//# sourceMappingURL=index.js.map