import { cursorList, type CursorPage } from '@reflexify/agentflow-sdk';
import { useEffect, useRef, useState } from 'react';
import { CopyButton, Markdown, Pager, ScrollArea, Splitter, Tabs, type SectionProps } from './kit.js';

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
 * value, and notes in Markdown whose mention reads the name the map resolves.
 */
export function Structure({ t, locale, theme, log }: SectionProps) {
  const [tab, setTab] = useState('overview');
  const [split, setSplit] = useState(storedSplit);
  const [pageSize, setPageSize] = useState(25);
  // The list reads the size when it fetches, so a new size takes one reset() and the pager stays drawn meanwhile.
  const size = useRef(pageSize);
  const [list] = useState(() => cursorList<PagedRow>((cursor) => fakePage(cursor, size.current)));
  const [paged, setPaged] = useState(list.state);
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
    </section>
  );
}
