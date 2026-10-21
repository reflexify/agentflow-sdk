import { isDeskError } from '../api/desk-api.js';
import type { TextKey } from '../text.js';

const BY_KIND = {
  stale: 'errStale', forbidden: 'errForbidden', conflict: 'errConflict', offline: 'errOffline',
  signed_out: 'errSignedOut', not_found: 'errStale', invalid: 'errFailed', failed: 'errFailed',
} as const satisfies Record<string, TextKey>;

export function errorText(tr: (k: TextKey) => string, e: unknown): string {
  return tr(isDeskError(e) ? BY_KIND[e.kind] : 'errFailed');
}
