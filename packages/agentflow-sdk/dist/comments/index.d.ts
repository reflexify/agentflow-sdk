import type { AgentFlowClient } from '../client.js';
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
export declare function list(client: AgentFlowClient, params: CommentListParams): Promise<CommentPage>;
export interface CommentCreateParams extends RecordRef {
    /** Markdown with mention tokens. */
    body: string;
    /** Files the caller uploaded and has not bound to anything yet. */
    attachment_ids?: string[];
    /** Kept by the caller for as long as one comment is being written, so a retry replays it instead of posting twice. */
    idempotency_key: string;
}
export declare function create(client: AgentFlowClient, params: CommentCreateParams): Promise<CommentWriteResult>;
export interface CommentUpdateParams extends RecordRef {
    /** The comment as last read: its `edited_at`, or its `created_at` while it was never edited, is the version the edit is checked against. */
    comment: Pick<CommentDto, 'id' | 'created_at' | 'edited_at'>;
    /** The new text; kept when absent. */
    body?: string;
    /** The comment's files after the edit, in full; kept when absent. */
    attachment_ids?: string[];
}
/** Edits a comment. A comment changed since it was read is refused as `STALE_VERSION`. */
export declare function update(client: AgentFlowClient, params: CommentUpdateParams): Promise<CommentWriteResult>;
export interface CommentRemoveParams extends RecordRef {
    comment_id: string;
}
/** Deletes a comment and its files. */
export declare function remove(client: AgentFlowClient, params: CommentRemoveParams): Promise<void>;
/** Whether an event from the stream is a comment event of this record, so its thread may have changed. */
export declare function isAbout(event: PublicEvent, record: {
    entity_id: string;
    record_id: string;
}): boolean;
export {};
//# sourceMappingURL=index.d.ts.map