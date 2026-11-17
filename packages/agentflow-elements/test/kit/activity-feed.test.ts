import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActivityEvent } from '@reflexify/agentflow-sdk';
import '../../src/kit/index.js';
import { settle, shadow } from '../support.js';

type FeedElement = HTMLElement & Record<string, unknown>;

// The test clock reads the page's timezone, Asia/Ho_Chi_Minh, and a moment in the past is relative to this one.
const NOW = new Date('2026-11-12T10:00:00Z');
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();
const HOUR = 3_600_000;

let serial = 0;
// A nameless actor comes with an empty name or none at all, which the schema does not allow for but the wire does.
type Line = Partial<Omit<ActivityEvent, 'actor'>> & { actor?: { kind: string; id?: string; display_name?: string | null } };
function event(event_type: string, more: Line = {}): ActivityEvent {
  serial += 1;
  return {
    id: `00000000-0000-4000-8000-${String(serial).padStart(12, '0')}`,
    event_type,
    occurred_at: ago(2 * HOUR),
    actor: { kind: 'user', id: 'u1', display_name: 'Lan Pham' },
    payload: null,
    ...more,
  } as ActivityEvent;
}

async function feed(props: Record<string, unknown>) {
  document.body.innerHTML = '';
  const el = document.createElement('af-activity-feed') as FeedElement;
  Object.assign(el, props);
  document.body.append(el);
  await settle();
  const heard: { detail: unknown; bubbles: boolean; composed: boolean }[] = [];
  el.addEventListener('af-activity-more', (e) => heard.push({ detail: (e as CustomEvent).detail, bubbles: e.bubbles, composed: e.composed }));
  return { el, heard };
}

const part = (el: Element, name: string) => shadow(el).querySelector<HTMLElement>(`[part~="${name}"]`);
const parts = (el: Element, name: string) => [...shadow(el).querySelectorAll<HTMLElement>(`[part~="${name}"]`)];
const text = (node: Element | null) => node?.textContent?.replace(/\s+/g, ' ').trim() ?? null;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('<af-activity-feed>', () => {
  it('draws one item per event, in the order given, each with its label, actor and time', async () => {
    const events = [event('record.created'), event('work.claimed', { actor: { kind: 'user', display_name: 'Minh' } }), event('instance.completed', { actor: { kind: 'system' } })];
    const { el } = await feed({ events, locale: 'en' });
    const items = parts(el, 'item');
    expect(items).toHaveLength(3);
    expect(items.map((i) => text(i.querySelector('[part~="actor"]')))).toEqual(['Lan Pham', 'Minh', 'System']);
    expect(items.map((i) => text(i.querySelector('[part~="label"]')))).toEqual(['created the record', 'claimed the work', 'completed the instance']);
    expect(items.every((i) => i.querySelector('[part~="time"]') !== null)).toBe(true);
    expect(items.map((i) => i.dataset.eventId)).toEqual(events.map((e) => e.id));
    expect(text(items[0]!.querySelector('.af-timeline-text'))).toBe('Lan Pham created the record');
  });

  it('draws a list the page can name, which is the kit timeline', async () => {
    const { el } = await feed({ events: [event('record.created')], locale: 'vi' });
    const list = shadow(el).querySelector('ol')!;
    expect(list.classList.contains('af-timeline')).toBe(true);
    expect(list.getAttribute('aria-label')).toBe('Hoạt động');
    expect(parts(el, 'item')[0]!.classList.contains('af-timeline-item')).toBe(true);
  });

  it('shows a stage move as from → to', async () => {
    const { el } = await feed({ events: [event('record.stage.transitioned', { payload: { from: 'Draft', to: 'Approved' } })], locale: 'en' });
    expect(text(part(el, 'label'))).toBe('changed the stage');
    expect(text(part(el, 'changes'))).toBe('Draft → Approved');
  });

  it('lists the fields a change names by the labels it is given, and by the key for one it is not', async () => {
    const { el } = await feed({
      events: [event('record.updated', { payload: { changed: ['status', 'due_date', 'x_custom'] } })],
      fields: { status: 'Status', due_date: 'Due date' },
      locale: 'en',
    });
    expect(text(part(el, 'label'))).toBe('updated the record');
    expect(text(part(el, 'changes'))).toBe('Changed: Status, Due date, x_custom');
  });

  it('says a list change by its item, and counts the ones it leaves out', async () => {
    const changes = [
      { kind: 'added', id: 'a', label: 'Call the bank' },
      { kind: 'removed', id: 'b', label: null },
      { kind: 'changed', id: 'c', label: 'Sign', column: 'done', from: false, to: true },
      { kind: 'moved', id: 'd', label: 'Send @[Lan](mention:user/0b6c1f4e-1a2b-4c3d-8e9f-0123456789ab)' },
      { kind: 'added', id: 'e', label: 'Five' },
      { kind: 'added', id: 'f', label: 'Six' },
    ];
    const { el } = await feed({
      events: [event('record.updated', { payload: { changed: ['checklist'], list_changes: { checklist: { label: 'Checklist', changes, total: 9 } } } })],
      fields: { checklist: 'Checklist' },
      locale: 'en',
    });
    const lines = [...part(el, 'changes')!.children].map((line) => text(line));
    expect(lines).toEqual([
      'Changed: Checklist',
      'Checklist: added “Call the bank”',
      'Checklist: removed “an item”',
      'Checklist: “Sign” done no → yes',
      'Checklist: moved “Send @Restricted record”',
      'Checklist: added “Five”',
      '+4 more',
    ]);
  });

  it('draws no changes row for an event that has nothing to list', async () => {
    const { el } = await feed({ events: [event('record.updated', { payload: { changed: [] } }), event('record.created')] });
    expect(part(el, 'changes')).toBeNull();
  });

  it.each([
    ['an empty name', { kind: 'user', display_name: '' }, 'Someone'],
    ['no name', { kind: 'user' }, 'Someone'],
    ['a name of spaces', { kind: 'user', display_name: '  ' }, 'Someone'],
    ['an actor that no longer resolves', { kind: 'unknown' }, 'Someone'],
    ['a nameless agent', { kind: 'agent', display_name: '' }, 'Agent'],
    ['a nameless system actor', { kind: 'system' }, 'System'],
    ['a named agent', { kind: 'agent', display_name: 'Intake agent' }, 'Intake agent'],
  ])('names the actor of %s as %s', async (_case, actor, expected) => {
    const { el } = await feed({ events: [event('work.claimed', { actor })], locale: 'en' });
    expect(text(part(el, 'actor'))).toBe(expected);
  });

  it('speaks Vietnamese for a vi locale: the label, the actor, the changes and the time', async () => {
    const events = [
      event('record.stage.transitioned', { actor: { kind: 'user' }, payload: { from: 'Nháp', to: 'Đã duyệt' } }),
      event('record.updated', { actor: { kind: 'agent' }, payload: { changed: ['status'] } }),
      event('instance.failed', { actor: { kind: 'system' } }),
    ];
    const { el } = await feed({ events, fields: { status: 'Trạng thái' }, locale: 'vi' });
    const items = parts(el, 'item');
    expect(items.map((i) => text(i.querySelector('[part~="actor"]')))).toEqual(['Ai đó', 'Tác tử', 'Hệ thống']);
    expect(items.map((i) => text(i.querySelector('[part~="label"]')))).toEqual(['đã chuyển giai đoạn', 'đã cập nhật bản ghi', 'đã ghi nhận phiên thất bại']);
    expect(text(items[0]!.querySelector('[part~="changes"]'))).toBe('Nháp → Đã duyệt');
    expect(text(items[1]!.querySelector('[part~="changes"]'))).toBe('Đã đổi: Trạng thái');
    expect(text(items[0]!.querySelector('[part~="time"]'))).toBe('2 giờ trước');
  });

  it('draws the generic label for a type it does not know, and keeps the type for the page', async () => {
    const { el } = await feed({ events: [event('billing.invoice_paid')], locale: 'en' });
    expect(text(part(el, 'label'))).toBe('Activity');
    expect(text(part(el, 'actor')!.parentElement)).toBe('Lan Pham · Activity');
    expect(parts(el, 'item')[0]!.dataset.eventType).toBe('billing.invoice_paid');
    const vi = await feed({ events: [event('billing.invoice_paid')], locale: 'vi' });
    expect(text(part(vi.el, 'label'))).toBe('Hoạt động');
  });

  it('draws a work line the kit has no phrase for as an update of the work, as the record page does', async () => {
    const { el } = await feed({ events: [event('work.something_new')], locale: 'en' });
    expect(text(part(el, 'label'))).toBe('updated the work');
  });

  it('names what a payload carries where a label has a place for it, and says it without when it does not', async () => {
    const { el } = await feed({
      events: [
        event('task.reassigned', { payload: { to_user_name: 'Hoa' } }),
        event('task.reassigned'),
        event('task.action_taken', { payload: { action_label: 'Approve' } }),
        event('task.action_taken'),
        event('record.series.raised', { payload: { name: 'Monthly close' } }),
        event('record.series.raised'),
      ],
      locale: 'en',
    });
    expect(parts(el, 'label').map((l) => text(l))).toEqual([
      'reassigned the task to Hoa',
      'reassigned the task to someone else',
      'chose “Approve”',
      'took an action',
      'created this record from the recurring series Monthly close',
      'created this record from a recurring series',
    ]);
  });

  it('draws the time relative to now, and the exact moment where the pointer rests', async () => {
    const { el } = await feed({ events: [event('record.created', { occurred_at: ago(2 * HOUR) }), event('record.created', { occurred_at: ago(3 * 86_400_000) }), event('record.created', { occurred_at: ago(20_000) })], locale: 'en' });
    const times = parts(el, 'time');
    expect(times.map((t) => text(t))).toEqual(['2 hours ago', '3 days ago', '20 seconds ago']);
    expect(times[0]!.localName).toBe('time');
    expect(times[0]!.getAttribute('datetime')).toBe(ago(2 * HOUR));
    expect(times[0]!.title).toBe('12 Nov 2026, 15:00');
    const vi = await feed({ events: [event('record.created', { occurred_at: ago(2 * HOUR) })], locale: 'vi' });
    expect(part(vi.el, 'time')!.title).toBe('15:00 12 thg 11, 2026');
  });

  it('keeps a time it cannot read as it came', async () => {
    const { el } = await feed({ events: [event('record.created', { occurred_at: 'yesterday-ish' })] });
    expect(text(part(el, 'time'))).toBe('yesterday-ish');
  });

  it('marks a change made through the assistant', async () => {
    const { el } = await feed({ events: [event('record.updated', { via: 'assistant', payload: { changed: ['a'] } }), event('record.created')], locale: 'en' });
    const [through, plain] = parts(el, 'item');
    expect(through!.querySelector('[part~="actor"]')!.parentElement!.textContent).toContain('via assistant');
    expect(plain!.textContent).not.toContain('via assistant');
    const vi = await feed({ events: [event('record.updated', { via: 'assistant', payload: { changed: ['a'] } })], locale: 'vi' });
    expect(vi.el.shadowRoot!.textContent).toContain('qua trợ lý');
  });

  it('colours the dot by who acted', async () => {
    const { el } = await feed({ events: [event('record.created'), event('agent.started', { actor: { kind: 'agent' } }), event('instance.started', { actor: { kind: 'system' } }), event('task.claimed', { actor: { kind: 'admin' } }), event('task.opened', { actor: { kind: 'api_key' } }), event('task.opened', { actor: { kind: 'unknown' } })] });
    expect(parts(el, 'item').map((i) => i.getAttribute('data-kind'))).toEqual(['person', 'agent', 'system', 'admin', 'api', null]);
  });

  it('shows Load more only with has-more, and pressing it raises af-activity-more with no detail, bubbling and not composed', async () => {
    const { el, heard } = await feed({ events: [event('record.created')] });
    expect(part(el, 'more')).toBeNull();
    el.hasMore = true;
    await settle();
    expect(text(part(el, 'more'))).toBe('Load more');
    part(el, 'more')!.click();
    await settle();
    expect(heard).toEqual([{ detail: {}, bubbles: true, composed: false }]);
  });

  it('reads has-more and loading from attributes, by presence', async () => {
    document.body.innerHTML = '<af-activity-feed has-more loading="false" locale="vi"></af-activity-feed>';
    await settle();
    const el = document.querySelector('af-activity-feed')!;
    expect(text(part(el, 'more'))).toBe('Tải thêm');
    expect(part(el, 'more')!.getAttribute('aria-disabled')).toBe('true');
  });

  it('locks Load more while loading, which shows a spinner and keeps the button focusable', async () => {
    const { el, heard } = await feed({ events: [event('record.created')], hasMore: true, loading: true });
    const more = part(el, 'more')!;
    expect(more.getAttribute('aria-disabled')).toBe('true');
    expect(more.hasAttribute('disabled')).toBe(false);
    expect(more.querySelector('.af-spinner')).not.toBeNull();
    more.focus();
    more.click();
    await settle();
    expect(heard).toEqual([]);
    expect(shadow(el).activeElement).toBe(more);
  });

  it('moves focus to the first line that arrived when the press that loaded them took away its own button', async () => {
    const first = [event('record.created'), event('record.updated', { payload: { changed: ['a'] } })];
    const { el } = await feed({ events: first, hasMore: true });
    part(el, 'more')!.focus();
    part(el, 'more')!.click();
    el.loading = true;
    await settle();
    const arrived = event('work.claimed');
    el.events = [...first, arrived];
    el.hasMore = false;
    el.loading = false;
    await settle();
    expect(part(el, 'more')).toBeNull();
    expect(shadow(el).activeElement).toBe(parts(el, 'item')[2]);
    expect(parts(el, 'item')[2]!.getAttribute('tabindex')).toBe('-1');
  });

  it('leaves focus where the person put it when the lines arrive', async () => {
    const first = [event('record.created')];
    const { el } = await feed({ events: first, hasMore: true });
    document.body.insertAdjacentHTML('beforeend', '<input id="elsewhere">');
    part(el, 'more')!.click();
    (document.getElementById('elsewhere') as HTMLInputElement).focus();
    el.events = [...first, event('work.claimed')];
    el.hasMore = false;
    await settle();
    expect(document.activeElement).toBe(document.getElementById('elsewhere'));
  });

  it('draws the empty state for no events, and a loading state while the first page loads', async () => {
    const { el } = await feed({ events: [], locale: 'en' });
    expect(parts(el, 'item')).toHaveLength(0);
    expect(shadow(el).querySelector('ol')).toBeNull();
    expect(text(shadow(el).querySelector('.af-empty-title'))).toBe('No activity yet.');

    el.loading = true;
    await settle();
    expect(shadow(el).querySelector('.af-empty')).toBeNull();
    expect(text(shadow(el).querySelector('[role="status"]'))).toBe('Loading…');
    expect(parts(el, 'item')).toHaveLength(0);

    const unset = await feed({ locale: 'vi' });
    expect(text(shadow(unset.el).querySelector('.af-empty-title'))).toBe('Chưa có hoạt động.');
  });

  it('does not show the empty state while there is more to load', async () => {
    const { el } = await feed({ events: [], hasMore: true });
    expect(shadow(el).querySelector('.af-empty')).toBeNull();
    expect(part(el, 'more')).not.toBeNull();
  });

  it('takes its words from strings over the language, and an events value that is not a list as none', async () => {
    const { el } = await feed({
      events: [event('record.created'), event('work.claimed')],
      strings: { activityRecordCreated: 'opened the file', activityActorSomeone: 'A colleague', activityEmpty: 'Nothing happened.' },
      locale: 'en',
    });
    expect(text(part(el, 'label'))).toBe('opened the file');
    el.events = [event('work.claimed', { actor: { kind: 'user' } })];
    await settle();
    expect(text(part(el, 'actor'))).toBe('A colleague');
    el.events = 'not a list';
    await settle();
    expect(text(shadow(el).querySelector('.af-empty-title'))).toBe('Nothing happened.');
  });

  it('follows its events, fields and locale as they change', async () => {
    const { el } = await feed({ events: [event('record.updated', { payload: { changed: ['status'] } })], locale: 'en' });
    expect(text(part(el, 'changes'))).toBe('Changed: status');
    el.fields = { status: 'Status' };
    await settle();
    expect(text(part(el, 'changes'))).toBe('Changed: Status');
    el.locale = 'vi';
    await settle();
    expect(text(part(el, 'changes'))).toBe('Đã đổi: Status');
    el.events = [];
    await settle();
    expect(parts(el, 'item')).toHaveLength(0);
  });
});
