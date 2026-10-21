import { describe, expect, it } from 'vitest';
import { aggregateAutopilot, intentLabel, INTENTS, modeOf, NEVER_AUTOMATIC, unchangedShare } from '../../src/model/autopilot.js';
import { t } from '../../src/text.js';
import type { AutopilotRule, Reply } from '../../src/model/types.js';

const r = (over: Partial<Reply>) => ({ aiBody: 'x', status: 'sent', authorKind: 'agent', autopilot: 'none', aiUnchanged: false, intent: 'order_status', ...over }) as Reply;

describe('aggregateAutopilot', () => {
  const stats = aggregateAutopilot([
    r({ aiUnchanged: true }), r({}), r({ status: 'draft' }),
    r({ authorKind: 'bot', autopilot: 'sent', aiUnchanged: true, intent: 'invoice_request' }),
    r({ aiBody: null }),
  ]);
  it('counts drafts, people\'s unchanged sends and autopilot\'s sends', () => {
    expect([stats.drafts, stats.sentByPerson, stats.sentUnchanged, stats.autopilotSent]).toEqual([4, 2, 1, 1]);
    expect(unchangedShare(stats)).toBe(0.5);
  });
  it('splits by intent', () => {
    expect(stats.byIntent.get('order_status')).toMatchObject({ drafts: 3, sentByPerson: 2, sentUnchanged: 1, autopilotSent: 0 });
    expect(unchangedShare(stats.byIntent.get('invoice_request')!)).toBeNull();
  });
  it('files a draft with no intent under other', () => {
    expect(aggregateAutopilot([r({ intent: null })]).byIntent.get('other')).toMatchObject({ drafts: 1 });
  });
});

describe('modeOf', () => {
  it('reads off, shadow and live from a rule', () => {
    expect(modeOf(undefined)).toBe('off');
    expect(modeOf({ enabled: false, mode: 'live' } as AutopilotRule)).toBe('off');
    expect(modeOf({ enabled: true, mode: 'shadow' } as AutopilotRule)).toBe('shadow');
    expect(modeOf({ enabled: true, mode: 'live' } as AutopilotRule)).toBe('live');
  });
});

describe('the intents', () => {
  it('are the triage step\'s nine, and refunds and cancellations are never automatic', () => {
    expect(INTENTS).toHaveLength(9);
    expect(NEVER_AUTOMATIC.every((i) => (INTENTS as readonly string[]).includes(i))).toBe(true);
    expect([...NEVER_AUTOMATIC]).toEqual(['refund_request', 'cancellation']);
  });
});

describe('intentLabel', () => {
  const en = (k: Parameters<typeof t>[1]) => t('en', k);
  const vi = (k: Parameters<typeof t>[1]) => t('vi', k);
  it('names a known intent in the desk\'s language', () => {
    expect(intentLabel(en, 'order_status')).toBe('Order status');
    expect(intentLabel(vi, 'order_status')).toBe('Tình trạng đơn hàng');
    for (const intent of INTENTS) expect(intentLabel(vi, intent)).not.toBe(intent);
  });
  it('shows an intent it has no name for as it is, and nothing for none', () => {
    expect(intentLabel(vi, 'warranty_claim')).toBe('warranty_claim');
    expect(intentLabel(vi, null)).toBe('');
  });
});
