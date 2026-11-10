import { describe, expect, it } from 'vitest';

import { provenance } from '../src/index.js';
import type { FieldProvenance, Passage, RecordProvenance } from '../src/index.js';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const WORKFLOW = '66666666-6666-4666-8666-666666666666';
const RUN = '33333333-3333-4333-8333-333333333333';

const passage = (chunk_id: string, text: string): Passage => ({
  attachment_id: '44444444-4444-4444-8444-444444444444',
  chunk_id,
  document_id: '55555555-5555-4555-8555-555555555555',
  text,
});

const origin = (category: 'ai' | 'human'): NonNullable<FieldProvenance['origin']> => ({
  category,
  confidence: 1,
  reason: null,
  redacted: false,
  run: category === 'ai' ? { instance_id: RUN, workflow: { id: WORKFLOW, key: 'triage', name: 'Triage' } } : null,
  written_at: '2027-04-01T09:00:00Z',
});

const summary: FieldProvenance = {
  field_key: 'summary',
  origin: origin('ai'),
  citation: { run: null, step: null, sources: [B, A] },
};
const title: FieldProvenance = { field_key: 'title', origin: origin('human'), citation: null };

const answer: RecordProvenance = {
  origins: 'available',
  fields: [summary, title],
  passages: [passage(A, 'first'), passage(B, 'second')],
};

describe('provenance.forField', () => {
  it("resolves a field's sources to passages in sources order", () => {
    expect(provenance.forField(answer, 'summary')?.passages.map((p) => p.chunk_id)).toEqual([B, A]);
  });

  it('is undefined for a field the answer does not hold', () => {
    expect(provenance.forField(answer, 'missing')).toBeUndefined();
  });

  it('gives no passages for a field with no citation, and keeps its origin', () => {
    expect(provenance.forField(answer, 'title')).toEqual({
      origin: answer.fields[1].origin,
      citation: null,
      passages: [],
    });
  });

  it('passes a null origin through when origins are unavailable', () => {
    const noOrigin: FieldProvenance = { ...summary, origin: null };
    expect(
      provenance.forField({ ...answer, origins: 'unavailable', fields: [noOrigin] }, 'summary')?.origin,
    ).toBeNull();
  });
});
