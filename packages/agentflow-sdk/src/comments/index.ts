import type { AgentFlowClient } from '../client.js';
import { ok } from '../errors.js';
import type { components } from '../generated/public.js';
import type { PublicEvent } from '../realtime/channel.js';

/** One comment as the caller reads it: its body with mention labels they may read, and whether they may edit or delete it. */
export type CommentDto = components['schemas']['CommentDto'];
export type CommentPage = components['schemas']['CommentPage'];
/** A written or edited comment, with the people it mentioned who cannot read the record and so were not told. */
export type CommentWriteResult = components['schemas']['CommentWriteResult'];

interface RecordRef {
  /** The entity of the record. */
  entity_id: string;
  record_id: string;
}

export interface CommentListParams extends RecordRef {
  /** A `next_cursor`: the comments after it. */
  cursor?: string;
  /** A `prev_cursor`: the comments before it. With neither cursor the page is the newest comments. */
  before?: string;
  /** 1 to 100; 50 when absent. */
  limit?: number;
}

/** The record's comments, oldest first within a page. */
export async function list(client: AgentFlowClient, params: CommentListParams): Promise<CommentPage> {
  const query: { cursor?: string; before?: string; limit?: number } = {};
  if (params.cursor) query.cursor = params.cursor;
  if (params.before) query.before = params.before;
  if (params.limit !== undefined) query.limit = params.limit;
  return ok(
    client.GET('/entities/{entity_id}/records/{record_id}/comments', {
      params: { path: { entity_id: params.entity_id, record_id: params.record_id }, query },
    }),
  );
}

export interface CommentCreateParams extends RecordRef {
  /** Markdown with mention tokens. */
  body: string;
  /** Files the caller uploaded and has not bound to anything yet. */
  attachment_ids?: string[];
  /** Kept by the caller for as long as one comment is being written, so a retry replays it instead of posting twice. */
  idempotency_key: string;
}

export async function create(client: AgentFlowClient, params: CommentCreateParams): Promise<CommentWriteResult> {
  const body: { body: string; attachment_ids?: string[] } = { body: params.body };
  if (params.attachment_ids) body.attachment_ids = params.attachment_ids;
  return ok(
    client.POST('/entities/{entity_id}/records/{record_id}/comments', {
      params: {
        path: { entity_id: params.entity_id, record_id: params.record_id },
        header: { 'Idempotency-Key': params.idempotency_key },
      },
      body,
    }),
  );
}

export interface CommentUpdateParams extends RecordRef {
  /** The comment as last read: its `edited_at`, or its `created_at` while it was never edited, is the version the edit is checked against. */
  comment: Pick<CommentDto, 'id' | 'created_at' | 'edited_at'>;
  /** The new text; kept when absent. */
  body?: string;
  /** The comment's files after the edit, in full; kept when absent. */
  attachment_ids?: string[];
}

/** Edits a comment. A comment changed since it was read is refused as `STALE_VERSION`. */
export async function update(client: AgentFlowClient, params: CommentUpdateParams): Promise<CommentWriteResult> {
  const body: { body?: string; attachment_ids?: string[] } = {};
  if (params.body !== undefined) body.body = params.body;
  if (params.attachment_ids !== undefined) body.attachment_ids = params.attachment_ids;
  return ok(
    client.PATCH('/entities/{entity_id}/records/{record_id}/comments/{comment_id}', {
      params: {
        path: { entity_id: params.entity_id, record_id: params.record_id, comment_id: params.comment.id },
        header: { 'If-Match': params.comment.edited_at ?? params.comment.created_at },
      },
      body,
    }),
  );
}

export interface CommentRemoveParams extends RecordRef {
  comment_id: string;
}

/** Deletes a comment and its files. */
export async function remove(client: AgentFlowClient, params: CommentRemoveParams): Promise<void> {
  await ok(
    client.DELETE('/entities/{entity_id}/records/{record_id}/comments/{comment_id}', {
      params: { path: { entity_id: params.entity_id, record_id: params.record_id, comment_id: params.comment_id } },
    }),
  );
}

/** Whether an event from the stream is a comment event of this record, so its thread may have changed. */
export function isAbout(event: PublicEvent, record: { entity_id: string; record_id: string }): boolean {
  return event.type.startsWith('comment.') && event.subject.kind === 'record' && event.subject.id === record.record_id;
}
