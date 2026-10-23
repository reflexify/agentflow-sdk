import type { AgentFlowClient, MentionPlace } from '@reflexify/agentflow-sdk';
import { mentions } from '@reflexify/agentflow-sdk';

/** One record that mentions another, as the record panel lists it. */
export interface MentionedIn {
  id: string;
  entityId: string;
  entityLabel: string;
  title: string;
  /** Where in the source the mention is: its comments and the fields it sits in. */
  places: MentionPlace[];
  count: number;
  at: string;
  author: string | null;
}

/** The records, comments and fields that mention a record, newest first, among those the caller may read. */
export async function mentionedIn(client: AgentFlowClient, entityId: string, recordId: string): Promise<MentionedIn[]> {
  const out: MentionedIn[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 5; page++) {
    const body = await mentions.mentionedIn(client, { entity_id: entityId, record_id: recordId, limit: 50, ...(cursor ? { cursor } : {}) });
    for (const item of body.items) {
      out.push({
        id: item.record_id,
        entityId: item.entity_id,
        entityLabel: item.entity_label,
        title: item.label,
        places: item.places,
        count: item.count,
        at: item.last_at,
        author: item.last_author,
      });
    }
    cursor = body.next_cursor ?? undefined;
    if (!cursor) break;
  }
  return out;
}
