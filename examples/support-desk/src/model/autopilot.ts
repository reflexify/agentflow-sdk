import type { AutopilotMode } from '../api/desk-api.js';
import type { TextKey } from '../text.js';
import type { AutopilotRule, Reply } from './types.js';

/** The triage step's intents (Plan 3, Task 10), in its order. */
export const INTENTS = [
  'order_status', 'refund_request', 'invoice_request', 'account_access', 'product_question',
  'bug_report', 'cancellation', 'feedback', 'other',
] as const;

/**
 * Always need a person to act in another system, so Draft reply itself leaves them out of autopilot, whatever a
 * rule says. A switch for them would do nothing, so the screen says "Never automatic" instead.
 */
export const NEVER_AUTOMATIC: readonly string[] = ['refund_request', 'cancellation'];

/** The triage step's intent in the person's language; a value the desk has no name for is shown as it is. */
export function intentLabel(tr: (key: TextKey) => string, intent: string | null): string {
  if (!intent) return '';
  return (INTENTS as readonly string[]).includes(intent) ? tr(`intent_${intent}` as TextKey) : intent;
}

export interface IntentStats { drafts: number; sentByPerson: number; sentUnchanged: number; autopilotSent: number }

export function modeOf(rule: AutopilotRule | undefined): AutopilotMode {
  return !rule || !rule.enabled ? 'off' : rule.mode;
}

const empty = (): IntentStats => ({ drafts: 0, sentByPerson: 0, sentUnchanged: 0, autopilotSent: 0 });

/** What a reply's intent counts under: a draft the triage step gave none is "other". */
export const intentOf = (r: Reply): string => r.intent ?? 'other';

export function aggregateAutopilot(replies: Reply[]): IntentStats & { byIntent: Map<string, IntentStats> } {
  const total = empty();
  const byIntent = new Map<string, IntentStats>();
  for (const r of replies) {
    if (!r.aiBody) continue;
    const s = byIntent.get(intentOf(r)) ?? empty();
    byIntent.set(intentOf(r), s);
    for (const bucket of [total, s]) {
      bucket.drafts += 1;
      if (r.autopilot === 'sent') bucket.autopilotSent += 1;
      else if (r.status === 'sent' && r.authorKind === 'agent') {
        bucket.sentByPerson += 1;
        if (r.aiUnchanged) bucket.sentUnchanged += 1;
      }
    }
  }
  return { ...total, byIntent };
}

export function unchangedShare(s: IntentStats): number | null {
  return s.sentByPerson ? s.sentUnchanged / s.sentByPerson : null;
}
