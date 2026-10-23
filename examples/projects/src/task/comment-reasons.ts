import { isProjectsError } from '../api/projects-api.js';
import type { TextKey } from '../text.js';

const REASONS: Readonly<Record<string, TextKey>> = {
  COMMENT_EMPTY: 'commentReasonEmpty',
  COMMENT_TOO_LONG: 'commentReasonTooLong',
  COMMENT_TOO_MANY_FILES: 'commentReasonTooManyFiles',
  COMMENTS_CLOSED: 'commentReasonClosed',
  STALE_VERSION: 'commentReasonStale',
  COMMENT_NOT_FOUND: 'commentReasonGone',
  COMMENT_NOT_AUTHOR: 'commentReasonNotAuthor',
};

/** Why a comment write was refused, in the module's words; the server's sentence is English and so is never shown. */
export function commentReason(e: unknown, tr: (key: TextKey) => string, action: 'write' | 'delete' = 'write'): string {
  if (isProjectsError(e, 'offline')) return tr('offlineLocked');
  if (action === 'delete' && isProjectsError(e) && e.code === 'COMMENT_NOT_AUTHOR') return tr('commentReasonCannotDelete');
  return tr((isProjectsError(e) && REASONS[e.code]) || 'commentReasonGeneric');
}
