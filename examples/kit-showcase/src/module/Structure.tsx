import { cursorList, type CursorPage } from '@reflexify/agentflow-sdk';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { AfCommentThreadElement } from '@reflexify/agentflow-elements/kit';
import type { ActivityEvent, CommentDto, MentionMenuSource, UnnotifiedPerson } from '@reflexify/agentflow-elements/kit';
import { ActivityFeed, CommentThread, CopyButton, Markdown, Pager, ScrollArea, Splitter, Tabs, type SectionProps } from './kit.js';

const SPLIT_KEY = 'kit-showcase:splitter';

// Storage can be blocked (a private window, a sandboxed frame); the splitter then starts at its default and is not kept.
function storedSplit(): number {
  try {
    const raw = localStorage.getItem(SPLIT_KEY);
    const n = raw == null ? Number.NaN : Number(raw);
    return Number.isFinite(n) ? n : 40;
  } catch {
    return 40;
  }
}
function storeSplit(size: number): void {
  try {
    localStorage.setItem(SPLIT_KEY, String(size));
  } catch {
    // Not kept; the splitter still works for this visit.
  }
}

// What the server would resolve the notes' mention to for this viewer: the token's label may be stale, the map's is not.
const HOA = 'user/6f1d2c3b-4a5e-4f60-8a7b-9c0d1e2f3a4b';
const MENTIONS = { [HOA]: { state: 'ok' as const, kind: 'user' as const, id: HOA.slice(5), label: 'Trần Thị Hoa (Kế toán)' } };

// A record's activity as `activity.list` answers it, in two pages of four: the second is what Load more adds.
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const line = (n: number, event_type: string, minutes: number, actor: ActivityEvent['actor'], payload: ActivityEvent['payload'] = null): ActivityEvent => ({
  id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`, event_type, occurred_at: minutesAgo(minutes), actor, payload,
});
const BINH = { kind: 'user', display_name: 'Nguyễn Văn Bình' };
const HOA_ACTOR = { kind: 'user', display_name: 'Trần Thị Hoa' };
const ACTIVITY_PAGES: ActivityEvent[][] = [
  [
    line(1, 'record.updated', 3, BINH, { changed: ['status', 'due_date'] }),
    line(2, 'record.stage.transitioned', 45, HOA_ACTOR, { from: 'Open', to: 'In progress' }),
    line(3, 'work.claimed', 130, BINH, {}),
    line(4, 'record.created', 1500, HOA_ACTOR),
  ],
  [
    line(5, 'instance.started', 1510, { kind: 'system', display_name: '' }),
    line(6, 'task.opened', 1520, { kind: 'system', display_name: '' }),
    line(7, 'agent.succeeded', 1530, { kind: 'agent', display_name: '' }),
    line(8, 'record.created', 4000, HOA_ACTOR),
  ],
];

// A record's comments as `comments.list` answers them, oldest first: two the viewer may not touch, one they wrote, and one behind Show older comments.
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();
const comment = (n: number, author: CommentDto['author'], body: string, hours: number, more: Partial<CommentDto> = {}): CommentDto => ({
  id: `00000000-0000-4000-9000-${String(n).padStart(12, '0')}`, author, body, mentions: {}, files: [], created_at: hoursAgo(hours), can_edit: false, can_delete: false, ...more,
});
const THREAD_FIRST: CommentDto[] = [comment(1, { id: 'u-hoa', name: 'Trần Thị Hoa' }, 'Opened the dispute with the supplier.', 70)];
const THREAD_NEWEST: CommentDto[] = [
  comment(2, { id: 'u-binh', name: 'Nguyễn Văn Bình' }, 'The quote came back, see the file.', 26, {
    files: [{ id: '00000000-0000-4000-a000-000000000001', name: 'quote.pdf', byte_size: 184_320, content_type: 'application/pdf' }], edited_at: hoursAgo(25), can_delete: true,
  }),
  comment(3, { id: 'u-me', name: 'Bo Tran' }, 'Thanks, I will check it today.', 3, { can_edit: true, can_delete: true }),
];
const PEOPLE_MENU: MentionMenuSource = async (q) => ({
  groups: [{
    key: 'people', title: 'People',
    items: [{ kind: 'user' as const, ref: HOA, label: 'Trần Thị Hoa', meta: 'hoa@example.com' }].filter((item) => item.label.toLowerCase().includes(q.toLowerCase())),
  }],
});
const pause = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));

const PAGED_TOTAL = 120;
const PAGE_SIZES = [25, 50, 100];
interface PagedRow { n: number }

// A made-up cursor-paged source: the cursor is the offset of the next page, and each answer takes 150ms.
function fakePage(cursor: string | null, size: number): Promise<CursorPage<PagedRow>> {
  const from = cursor === null ? 0 : Number(cursor);
  const to = Math.min(PAGED_TOTAL, from + size);
  const page = { items: Array.from({ length: to - from }, (_, i) => ({ n: from + i + 1 })), next_cursor: to < PAGED_TOTAL ? String(to) : null };
  return new Promise((resolve) => setTimeout(() => resolve(page), 150));
}

/**
 * The elements that lay a screen out: a list in a scroll area 200px tall, a tab stop while it scrolls, tabs over three
 * panels, which show the tab asked for once the page sets it back, a splitter whose size is kept across visits, and a
 * pager over one `cursorList` for its lifetime, which a new page size resets to the first page, a copy button beside a
 * value, notes in Markdown whose mention reads the name the map resolves, an activity feed whose Load more adds a second page, and a comment thread
 * whose sends, edits and deletes the page answers after a moment.
 */
export function Structure({ t, locale, theme, log }: SectionProps) {
  const [tab, setTab] = useState('overview');
  const [split, setSplit] = useState(storedSplit);
  const [pageSize, setPageSize] = useState(25);
  // The list reads the size when it fetches, so a new size takes one reset() and the pager stays drawn meanwhile.
  const size = useRef(pageSize);
  const [list] = useState(() => cursorList<PagedRow>((cursor) => fakePage(cursor, size.current)));
  const [paged, setPaged] = useState(list.state);
  const [activityPages, setActivityPages] = useState(1);
  const [activityLoading, setActivityLoading] = useState(false);
  const activity = useMemo(() => ACTIVITY_PAGES.slice(0, activityPages).flat(), [activityPages]);
  const thread = useRef<AfCommentThreadElement | null>(null);
  const [comments, setComments] = useState<CommentDto[]>(THREAD_NEWEST);
  const [earlier, setEarlier] = useState(true);
  const [threadBusy, setThreadBusy] = useState(false);
  const [threadError, setThreadError] = useState<string | null>(null);
  const [unnotified, setUnnotified] = useState<UnnotifiedPerson[]>([]);
  // What the page does for each of the thread's events: it is busy for a moment, then refuses text with "fail" in it (the thread keeps the
  // draft and shows the error) or applies the change and tells the thread it succeeded.
  async function answer(body: string, apply: () => void) {
    setThreadBusy(true);
    setThreadError(null);
    setUnnotified([]);
    await pause(400);
    setThreadBusy(false);
    if (body.includes('fail')) return setThreadError(t.commentsRefused);
    apply();
    thread.current?.settle();
  }
  useEffect(() => {
    setPaged(list.state);
    const stop = list.subscribe(setPaged);
    void list.next();
    return stop;
  }, [list]);
  return (
    <section aria-labelledby="showcase-structure" className="card">
      <h2 id="showcase-structure">{t.structure}</h2>
      <h3>{t.partScroll}</h3>
      <ScrollArea locale={locale} theme={theme} label={t.scrollLabel} style={{ height: 200 }} testId="structure-scroll">
        <ul className="scroll-list">
          {Array.from({ length: 50 }, (_, i) => <li key={i}>{`${t.scrollRow} ${i + 1}`}</li>)}
        </ul>
      </ScrollArea>
      <h3>{t.partTabs}</h3>
      <Tabs
        locale={locale}
        theme={theme}
        label={t.tabsLabel}
        items={[{ value: 'overview', label: t.tabOverview }, { value: 'activity', label: t.tabActivity }, { value: 'files', label: t.tabFiles }]}
        value={tab}
        testId="structure-tabs"
        onChange={(value) => {
          log('af-tabs', 'tab-change', { value });
          setTab(value);
        }}
      >
        <p slot="overview">{t.panelOverview}</p>
        <p slot="activity">{t.panelActivity}</p>
        <p slot="files">{t.panelFiles}</p>
      </Tabs>
      <h3>{t.partSplitter}</h3>
      <Splitter
        locale={locale}
        theme={theme}
        label={t.splitterLabel}
        size={split}
        style={{ height: 200 }}
        testId="structure-splitter"
        onChange={(size) => {
          log('af-splitter', 'size-change', { size });
          setSplit(size);
          storeSplit(size);
        }}
      >
        <ScrollArea slot="start" locale={locale} theme={theme} label={t.splitList} style={{ height: '100%' }}>
          <ul className="scroll-list">
            {Array.from({ length: 20 }, (_, i) => <li key={i}>{`${t.splitRecord} ${i + 1}`}</li>)}
          </ul>
        </ScrollArea>
        <p slot="end" className="split-detail">{t.splitDetail}</p>
      </Splitter>
      <h3>{t.partPager}</h3>
      <ScrollArea locale={locale} theme={theme} label={t.pagerList} style={{ height: 160 }}>
        <ol id="structure-paged-rows" className="scroll-list">
          {paged.items.map((row) => <li key={row.n}>{`${t.scrollRow} ${row.n}`}</li>)}
        </ol>
      </ScrollArea>
      <Pager
        locale={locale}
        theme={theme}
        hasPrev={paged.hasPrev}
        hasNext={paged.hasNext}
        busy={paged.busy}
        rangeStart={paged.items[0]?.n ?? null}
        rangeEnd={paged.items.at(-1)?.n ?? null}
        total={PAGED_TOTAL}
        pageSize={pageSize}
        pageSizes={PAGE_SIZES}
        controls="structure-paged-rows"
        testId="structure-pager"
        onPrev={() => {
          log('af-pager', 'prev', {});
          void list.prev();
        }}
        onNext={() => {
          log('af-pager', 'next', {});
          void list.next();
        }}
        onPageSize={(next) => {
          log('af-pager', 'page-size-change', { pageSize: next });
          size.current = next;
          setPageSize(next);
          void list.reset();
        }}
      />
      <h3>{t.partCopy}</h3>
      <p className="copy-row">
        <span>{t.copyValue}</span>
        <code>INV-0042</code>
        <CopyButton
          locale={locale}
          theme={theme}
          value="INV-0042"
          label={t.copyLabel}
          testId="structure-copy"
          onCopy={(detail) => log('af-copy-button', 'af-copy', detail)}
        />
      </p>
      <h3>{t.partMarkdown}</h3>
      <Markdown
        locale={locale}
        theme={theme}
        value={t.markdownNotes}
        mentions={MENTIONS}
        testId="structure-markdown"
        onLink={(detail) => log('af-markdown', 'af-link', detail)}
      />
      <h3>{t.partActivity}</h3>
      <ActivityFeed
        locale={locale}
        theme={theme}
        events={activity}
        fields={t.activityFields}
        hasMore={activityPages < ACTIVITY_PAGES.length}
        loading={activityLoading}
        testId="structure-activity"
        onMore={() => {
          log('af-activity-feed', 'af-activity-more', {});
          setActivityLoading(true);
          setTimeout(() => {
            setActivityPages((n) => n + 1);
            setActivityLoading(false);
          }, 300);
        }}
      />
      <h3>{t.partComments}</h3>
      <p>{t.commentsNote}</p>
      <CommentThread
        locale={locale}
        theme={theme}
        comments={comments}
        canComment
        hasEarlier={earlier}
        busy={threadBusy}
        error={threadError}
        unnotified={unnotified}
        mentions={PEOPLE_MENU}
        upload={async (file) => {
          await pause(600);
          if (file.name.includes('fail')) throw new Error('Too large');
          return { id: `00000000-0000-4000-a000-${String(Date.now() % 1e12).padStart(12, '0')}` };
        }}
        handle={thread}
        testId="structure-comments"
        onSubmit={(detail) => {
          log('af-comment-thread', 'af-comment-submit', detail);
          void answer(detail.body, () => {
            setComments((now) => [...now, comment(10 + now.length, { id: 'u-me', name: 'Bo Tran' }, detail.body, 0, { can_edit: true, can_delete: true })]);
            setUnnotified(detail.body.includes('@') ? [{ user_id: 'u-duc', name: 'Đỗ Đức' }] : []);
          });
        }}
        onEdit={(detail) => {
          log('af-comment-thread', 'af-comment-edit', detail);
          void answer(detail.body, () => setComments((now) => now.map((c) => (c.id === detail.id ? { ...c, body: detail.body, edited_at: new Date().toISOString() } : c))));
        }}
        onDelete={(detail) => {
          log('af-comment-thread', 'af-comment-delete', detail);
          void answer('', () => setComments((now) => now.filter((c) => c.id !== detail.id)));
        }}
        onEarlier={() => {
          log('af-comment-thread', 'af-comment-earlier', {});
          setComments((now) => [...THREAD_FIRST, ...now]);
          setEarlier(false);
        }}
        onOpenFile={(detail) => log('af-comment-thread', 'af-comment-open-file', detail)}
      />
    </section>
  );
}
