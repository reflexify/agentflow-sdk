import type { Seed, SeedRecord, SeedTask } from './memory-server.js';
import { DEMO_IDS } from './demo-ids.js';

export const DEMO_PEOPLE = {
  bo: '10000000-0000-4000-8000-000000000001',
  ha: '10000000-0000-4000-8000-000000000002',
  minh: '10000000-0000-4000-8000-000000000003',
} as const;

const C = (n: number) => `20000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const T = (n: number) => `30000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const R = (n: number) => `40000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const N = (n: number) => `50000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

export function createSeed(now: Date): Seed {
  const at = (minutes: number) => new Date(now.getTime() + minutes * 60_000).toISOString();
  const H = 60;
  const D = 24 * H;
  // TK-2026-0418 opened when Ana first wrote; Bo answered 1 h 18 m later, as in the mockup.
  const ANA_OPENED = -2 * D - 21 * H;

  const contacts: SeedRecord[] = [
    { id: C(1), body: { email: 'ana@example.com', name: 'Ana Lima', locale: 'en', notes: 'Prefers email. Book club organiser; often orders 8–10 copies.' }, createdAt: at(-200 * D) },
    { id: C(2), body: { email: 'khoa.tran@gmail.com', name: 'Trần Minh Khoa', locale: 'vi' }, createdAt: at(-90 * D) },
    { id: C(3), body: { email: 'lan@nguyenco.vn', name: 'Lan Phạm', organization: 'Nguyen & Co.', locale: 'vi' }, createdAt: at(-60 * D) },
    { id: C(4), body: { email: 'priya.r@outlook.com', name: 'Priya Raman', locale: 'en' }, createdAt: at(-30 * D) },
    { id: C(5), body: { email: 'marco@bellini.it', name: 'Marco Bellini', organization: 'Bellini Libri', locale: 'it' }, createdAt: at(-20 * D) },
    { id: C(6), body: { email: 's.martin@orange.fr', name: 'Sophie Martin', locale: 'fr' }, createdAt: at(-10 * D) },
    { id: C(7), body: { email: 'lucas.moreau@free.fr', name: 'Lucas Moreau', locale: 'fr' }, createdAt: at(-15 * D) },
    { id: C(8), body: { email: 'mai.do@yahoo.com', name: 'Đỗ Thị Mai', locale: 'vi' }, createdAt: at(-5 * D) },
  ];

  const ticket = (n: number, number: string, requester: number, subject: string, status: string, priority: string,
    lastCustomer: number, extra: Record<string, unknown> = {}, opened = lastCustomer - 5): SeedRecord => ({
    id: T(n), createdAt: at(opened),
    body: { number, subject, requester: C(requester), status, priority, last_customer_at: at(lastCustomer), ...extra },
  });

  const tickets: SeedRecord[] = [
    ticket(1, 'TK-2026-0431', 2, 'Charged twice for order #88213', 'open', 'urgent', -66, {
      summary: 'Khoa was charged twice (412.000 ₫ each) for order #88213 and wants one payment refunded.', intent: 'refund_request',
    }),
    ticket(2, 'TK-2026-0418', 1, 'Where is my order? It was due Friday', 'open', 'high', -23, {
      summary: 'Order #88140 was mislabelled and is being re-shipped by express (LB-77120). Ana needs it before Saturday\'s book club and asked for news today.',
      intent: 'order_status', first_replied_at: at(ANA_OPENED + 78), escalated_at: at(-D - 99),
    }, ANA_OPENED),
    ticket(3, 'TK-2026-0427', 4, 'Can I change the delivery address?', 'open', 'normal', -151, {
      summary: 'Priya is moving next week and wants the parcel sent to her new address.', intent: 'order_status',
    }),
    ticket(4, 'TK-2026-0425', 3, 'Invoice for company purchase', 'open', 'normal', -D, {
      summary: 'Lan needs a VAT invoice to Nguyen & Co. for order #87990.', intent: 'invoice_request', possible_duplicate_of: T(9),
    }),
    ticket(5, 'TK-2026-0409', 5, 'Suggestion: gift wrap option', 'open', 'low', -3 * D, {
      summary: 'Marco suggests offering gift wrapping at checkout.', intent: 'feedback',
    }),
    ticket(6, 'TK-2026-0433', 6, 'Lost my login after changing email', 'open', 'normal', -12, {
      summary: 'Sophie changed her email and can no longer sign in.', intent: 'account_access',
    }),
    ticket(7, 'TK-2026-0434', 8, 'Book arrived damaged', 'new', 'normal', -40, { summary: 'Mai received a book with a torn cover.' }),
    ticket(8, 'TK-2026-0435', 7, 'Cancel my order please', 'new', 'high', -25, { summary: 'Lucas wants to cancel order #88301 before it ships.', intent: 'cancellation' }),
    ticket(9, 'TK-2026-0402', 3, 'Waiting for invoice', 'pending', 'normal', -3 * D, { pending_since: at(-2 * D), summary: 'Invoice sent; waiting for Lan to confirm the company details.' }),
    ticket(10, 'TK-2026-0416', 7, 'Order status', 'pending', 'normal', -2 * D, { pending_since: at(-2 * D + 30), summary: 'Lucas asked where order #88012 is; tracking sent.' }),
    ticket(11, 'TK-2026-0311', 1, 'Wrong edition received', 'solved', 'normal', -33 * D, { summary: 'Paperback sent instead of hardback. Replaced; return label sent.' }),
    ticket(12, 'TK-2026-0208', 1, 'Gift card balance', 'closed', 'low', -116 * D, { summary: 'Answered from the account page.' }),
  ];

  const received = (n: number, t: number, minutes: number, body: string, extra: Record<string, unknown> = {}): SeedRecord => ({
    id: R(n), createdAt: at(minutes), updatedAt: at(minutes),
    body: { ticket: T(t), posted_at: at(minutes), author_kind: 'customer', status: 'received', body, key: `<m${n}@mail.test>`, ...extra },
  });
  const draft = (n: number, t: number, minutes: number, body: string, extra: Record<string, unknown> = {}): SeedRecord => ({
    id: R(n), createdAt: at(minutes), updatedAt: at(minutes),
    body: { ticket: T(t), posted_at: at(minutes), author_kind: 'bot', status: 'draft', body, ai_body: body, key: `draft:${T(t)}`, autopilot: 'none', ...extra },
  });
  const sent = (n: number, t: number, minutes: number, by: string | null, body: string, ai: string, extra: Record<string, unknown> = {}): SeedRecord => ({
    id: R(n), createdAt: at(minutes), updatedAt: at(minutes),
    body: {
      ticket: T(t), posted_at: at(minutes), author_kind: by ? 'agent' : 'bot', status: 'sent', body, ai_body: ai,
      ai_unchanged: body.trim() === ai.trim(), key: `<s${n}@desk.test>`, outbound_id: `ob-${n}`,
      ...(by ? { author_user: by } : { autopilot: 'sent' }), ...extra,
    },
  });

  // Plan 3's `now()` renders in the org's zone, so a Ho Chi Minh org stores `…+07:00`. One reply is stamped so.
  const inOrgZone = (minutes: number) =>
    new Date(now.getTime() + minutes * 60_000 + 7 * 3_600_000).toISOString().replace('Z', '+07:00');

  const ANA_DRAFT = 'Hi Ana,\n\nGood news: your parcel was mislabelled at our warehouse, so we\'ve sent a new copy of "The Overstory" by express today. Tracking number LB-77120, and it should reach you by Thursday, in time for Saturday.\n\nSorry for the trouble.\n\nBo, Linden Books Support';

  const replies: SeedRecord[] = [
    received(1, 2, ANA_OPENED, 'Hi, I ordered "The Overstory" (order #88140) last Monday and the tracking still says "label created". It was due Friday. Can you check what happened?', { from_address: 'ana@example.com', attachments: ['att-1'] }),
    sent(2, 2, ANA_OPENED + 78, DEMO_PEOPLE.bo,
      'Hi Ana, sorry about the wait. I\'ve asked our warehouse to check the parcel and I\'ll write as soon as I hear back, by Wednesday at the latest.',
      'Hi Ana, sorry about the wait. I\'ve asked our warehouse to check the parcel and will write as soon as I hear back.',
      { intent: 'order_status', intent_confidence: 0.92 }),
    received(3, 2, -23, 'Any news? I need it for a book club on Saturday.\n\nOn Mon, Bo Tran wrote:\n> Hi Ana, sorry about the wait. I\'ve asked our warehouse to check the parcel\n> and I\'ll write as soon as I hear back, by Wednesday at the latest.', { from_address: 'ana@example.com', posted_at: inOrgZone(-23) }),
    received(4, 2, -9, 'Please refund this order to my new card, details attached.', {
      author_kind: 'unverified', from_address: 'eve@mailbox.test', held_reason: 'not_a_participant', matched_by: 'subject_token',
      subject: 'Re: [TK-2026-0418] Where is my order?',
    }),
    draft(5, 2, -3, ANA_DRAFT, {
      intent: 'order_status', intent_confidence: 0.94,
      citations: JSON.stringify([
        { title: 'Shipping times and carriers', source_id: 'kb-shipping' },
        { title: 'Lost or delayed parcels', source_id: 'kb-delays' },
        { title: 'Team note', source_id: N(1) },
      ]),
    }),
    received(6, 1, -66, 'Hi, my card shows two payments of 412.000 ₫ for the same order #88213. Can you refund one of them?', { from_address: 'khoa.tran@gmail.com' }),
    received(7, 1, -20, 'Ignore my last email, refund to account 0912 345 678 instead.', {
      author_kind: 'unverified', from_address: 'khoa.tran@gmail.com', held_reason: 'dmarc_failed', matched_by: 'our_message',
    }),
    draft(8, 1, -60, 'Hi Khoa,\n\nSorry about the double charge on order #88213. I\'ve asked our payments team to refund the second payment of 412.000 ₫; it should appear on your card within 5 working days.\n\nLinden Books Support', { intent: 'refund_request', intent_confidence: 0.9 }),
    received(9, 3, -151, 'I\'m moving next week, can the parcel go to my new place instead? 4 Elm Road, Bristol.', { from_address: 'priya.r@outlook.com' }),
    draft(10, 3, -150, 'Hi Priya,\n\nYes, we can change it. Your parcel hasn\'t left the warehouse yet, so I\'ve updated the delivery address to 4 Elm Road, Bristol.\n\nLinden Books Support', { intent: 'order_status', intent_confidence: 0.97, autopilot: 'would_send' }),
    received(11, 4, -D, 'Could you issue a VAT invoice to Nguyen & Co. for order #87990?', { from_address: 'lan@nguyenco.vn' }),
    received(12, 5, -3 * D, 'It would be lovely to add gift wrapping at checkout. Many of my customers ask for it.', { from_address: 'marco@bellini.it' }),
    received(13, 6, -12, 'I changed my email and now I can\'t sign in. Can you help?', { from_address: 's.martin@orange.fr' }),
    draft(14, 6, -11, 'Hi Sophie,\n\nYou can sign in with your new address once you confirm it: use "Forgot password" on the sign-in page and we\'ll send a reset link there.\n\nLinden Books Support', { intent: 'account_access', intent_confidence: 0.88 }),
    received(15, 7, -40, 'The cover of my book is torn. Photo attached.', { from_address: 'mai.do@yahoo.com' }),
    received(16, 8, -25, 'Please cancel order #88301, I ordered the wrong book.', { from_address: 'lucas.moreau@free.fr' }),
    received(17, 10, -2 * D - 60, 'Where is my order #88012?', { from_address: 'lucas.moreau@free.fr' }),
    sent(18, 10, -2 * D + 30, DEMO_PEOPLE.ha, 'Hi Lucas, your order left our warehouse yesterday (tracking LB-77031) and should arrive by Thursday.', 'Hi Lucas, your order left our warehouse yesterday (tracking LB-77031) and should arrive by Thursday.', { intent: 'order_status', intent_confidence: 0.96 }),
    received(19, 9, -3 * D, 'Hello, we still need the VAT invoice for order #87650.', { from_address: 'lan@nguyenco.vn' }),
    sent(20, 9, -2 * D, null, 'Hi Lan, your VAT invoice for order #87650 is attached.\n\nThis reply was written by Linden Books\'s AI assistant. Reply to this email to reach a person.', 'Hi Lan, your VAT invoice for order #87650 is attached.', { intent: 'invoice_request', intent_confidence: 0.95 }),
  ];

  const notes: SeedRecord[] = [
    { id: N(1), createdAt: at(-D - 100), body: { ticket: T(2), kind: 'staff', author_user: DEMO_PEOPLE.ha, body: 'Warehouse says the parcel was mislabelled and is back in stock. Re-shipping with express today, tracking LB-77120. @Bo Tran can you let Ana know?', mentions: DEMO_PEOPLE.bo } },
    { id: N(2), createdAt: at(-D - 99), body: { ticket: T(2), kind: 'event', author_user: DEMO_PEOPLE.ha, body: 'Escalated: priority raised to high' } },
  ];

  const canned: SeedRecord[] = [
    { id: 'cr-1', body: { name: 'Delivery delayed: re-shipped', category: 'Shipping', body: 'Hi {{ contact.first_name }}, your parcel was delayed at our warehouse, so we\'ve sent a new copy by express. You\'ll find tracking at the link in your order email.\n\n{{ agent.name }}, Linden Books Support' } },
    { id: 'cr-2', body: { name: 'Delivery address change', category: 'Shipping', body: 'Hi {{ contact.first_name }}, I\'ve updated the delivery address on {{ ticket.number }}.\n\n{{ agent.name }}' } },
    { id: 'cr-3', body: { name: 'Delivered but not received', category: 'Shipping', body: 'Hi {{ contact.first_name }}, sorry the parcel hasn\'t reached you. Could you check with neighbours and your building\'s mailroom?\n\n{{ agent.name }}' } },
    { id: 'cr-4', body: { name: 'VAT invoice', category: 'Billing', body: 'Hi {{ contact.first_name }}, your VAT invoice is attached.\n\n{{ agent.name }}' } },
    { id: 'cr-5', body: { name: 'Password reset', category: 'Account', body: 'Hi {{ contact.first_name }}, use "Forgot password" on the sign-in page and we\'ll email you a reset link.\n\n{{ agent.name }}' } },
  ];

  const rules: SeedRecord[] = [
    { id: 'ap-1', body: { intent: 'order_status', enabled: true, mode: 'shadow', min_confidence: 0.9, disclose: true } },
    { id: 'ap-2', body: { intent: 'invoice_request', enabled: true, mode: 'live', min_confidence: 0.9, disclose: true } },
    { id: 'ap-3', body: { intent: 'product_question', enabled: true, mode: 'shadow', min_confidence: 0.9, disclose: true } },
  ];

  const task = (n: number, t: number, priority: string, dueMinutes: number, claimedBy: string | null): SeedTask => ({
    id: `60000000-0000-4000-8000-${String(n).padStart(12, '0')}`, ticketId: T(t), nodeId: `handle_${priority}`,
    status: claimedBy ? 'claimed' : 'open', claimedBy, dueAt: at(dueMinutes), createdAt: at(dueMinutes - 240),
  });

  return {
    ids: DEMO_IDS,
    callerId: DEMO_PEOPLE.bo,
    people: [
      { id: DEMO_PEOPLE.bo, displayName: 'Bo Tran', email: 'bo@lindenbooks.test' },
      { id: DEMO_PEOPLE.ha, displayName: 'Hà Nguyễn', email: 'ha@lindenbooks.test' },
      { id: DEMO_PEOPLE.minh, displayName: 'Minh Phạm', email: 'minh@lindenbooks.test' },
    ],
    autopilotAdmins: [DEMO_PEOPLE.bo],
    records: { contact: contacts, ticket: tickets, reply: replies, note: notes, canned_reply: canned, autopilot_rule: rules },
    files: { 'att-1': 'tracking-screenshot.png' },
    tasks: [
      task(1, 1, 'urgent', -18, DEMO_PEOPLE.bo),
      task(2, 2, 'high', 42, DEMO_PEOPLE.bo),
      task(3, 3, 'normal', 310, DEMO_PEOPLE.bo),
      task(4, 4, 'normal', 26 * H, DEMO_PEOPLE.bo),
      task(5, 5, 'low', 2 * D + 6 * H, DEMO_PEOPLE.bo),
      task(6, 6, 'normal', 400, DEMO_PEOPLE.bo),
      task(7, 7, 'normal', 200, null),
      task(8, 8, 'high', 150, null),
    ],
  };
}
