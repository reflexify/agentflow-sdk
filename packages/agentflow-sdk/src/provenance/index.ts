import type { components } from '../generated/public.js';

/** What `GET /entities/{entity_id}/records/{record_id}/provenance` answers: each field's origin and citation, and the passages the citations name. */
export type RecordProvenance = components['schemas']['RecordProvenance'];
export type FieldProvenance = components['schemas']['FieldProvenance'];
/** Who or what wrote a field's value, and when. */
export type FieldOrigin = components['schemas']['FieldOrigin'];
/** The passages an AI step cited for a field, by chunk id, and the run and step that cited them. */
export type FieldCitation = components['schemas']['FieldCitation'];
export type RunRef = components['schemas']['RunRef'];
export type ValueOrigin = components['schemas']['ValueOrigin'];
/** A passage of a file that a field's citation names. */
export type Passage = components['schemas']['CitationSourceDto'];

export interface FieldEvidence {
  /** Null when the answer holds no origin for the field, as when its `origins` are `unavailable`. */
  origin: FieldOrigin | null;
  citation: FieldCitation | null;
  /** The passages the citation names, in the citation's order; empty without a citation. */
  passages: Passage[];
}

/** One field's origin and citation with its cited chunk ids joined to the answer's passages; undefined for a field the answer does not hold. */
export function forField(answer: RecordProvenance, field_key: string): FieldEvidence | undefined {
  const field = answer.fields.find((f) => f.field_key === field_key);
  if (!field) return undefined;
  const byChunk = new Map(answer.passages.map((p) => [p.chunk_id, p]));
  const passages: Passage[] = [];
  for (const id of field.citation?.sources ?? []) {
    const passage = byChunk.get(id);
    if (passage) passages.push(passage);
  }
  return { origin: field.origin, citation: field.citation, passages };
}
