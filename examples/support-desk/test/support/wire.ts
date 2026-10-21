import type { components } from '@reflexify/agentflow-sdk';

export type WireRecord = components['schemas']['EntityRecord'];

export function wire(id: string, body: Record<string, unknown>, extra: Partial<WireRecord> = {}): WireRecord {
  return {
    id, body, entity_id: 'e', org_id: 'o', version: 1,
    created_at: '2026-10-06T09:00:00Z', updated_at: '2026-10-06T09:00:00Z', ...extra,
  };
}

export const page = (items: WireRecord[], next_cursor: string | null = null) => ({ items, next_cursor, prev_cursor: null });
