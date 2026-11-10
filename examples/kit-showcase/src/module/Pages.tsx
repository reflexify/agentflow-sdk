import { Fragment, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { BulkBar, CopyButton, ScrollArea, Tooltip, type SectionProps } from './kit.js';
import type { Text } from './text.js';

const icon = (...paths: ReactElement[]) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths}</svg>
);
const SEARCH_X = icon(<path key="a" d="m13.5 8.5-5 5" />, <path key="b" d="m8.5 8.5 5 5" />, <circle key="c" cx="11" cy="11" r="8" />, <path key="d" d="m21 21-4.3-4.3" />);
const ALERT = icon(<path key="a" d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />, <path key="b" d="M12 9v4" />, <path key="c" d="M12 17h.01" />);
const GRIP = icon(
  <circle key="a" cx="9" cy="12" r="1" />, <circle key="b" cx="9" cy="5" r="1" />, <circle key="c" cx="9" cy="19" r="1" />,
  <circle key="d" cx="15" cy="12" r="1" />, <circle key="e" cx="15" cy="5" r="1" />, <circle key="f" cx="15" cy="19" r="1" />,
);
const PAPERCLIP = icon(<path key="a" d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" />);
const CHEVRON = icon(<path key="a" d="m9 18 6-6-6-6" />);
const ARROW_UP = icon(<path key="a" d="m5 12 7-7 7 7" />, <path key="b" d="M12 19V5" />);
const CHEVRON_LEFT = icon(<path key="a" d="m15 18-6-6 6-6" />);
const SEARCH = icon(<circle key="a" cx="11" cy="11" r="8" />, <path key="b" d="m21 21-4.3-4.3" />);
const CLOSE = icon(<path key="a" d="M18 6 6 18" />, <path key="b" d="m6 6 12 12" />);
const DOWNLOAD = icon(<path key="a" d="M12 15V3" />, <path key="b" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />, <path key="c" d="m7 10 5 5 5-5" />);
const CHECK = icon(<path key="a" d="M20 6 9 17l-5-5" />);
const USER = icon(<path key="a" d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />, <circle key="b" cx="12" cy="7" r="4" />);
const BOT = icon(<path key="a" d="M12 8V4H8" />, <rect key="b" width="16" height="12" x="4" y="8" rx="2" />, <path key="c" d="M2 14h2" />, <path key="d" d="M20 14h2" />, <path key="e" d="M15 13v2" />, <path key="f" d="M9 13v2" />);
const COG = icon(
  <path key="a" d="M11 10.27 7 3.34" />, <path key="b" d="m11 13.73-4 6.93" />, <path key="c" d="M12 22v-2" />, <path key="d" d="M12 2v2" />, <path key="e" d="M14 12h8" />,
  <path key="f" d="m17 20.66-1-1.73" />, <path key="g" d="m17 3.34-1 1.73" />, <path key="h" d="M2 12h2" />, <path key="i" d="m20.66 17-1.73-1" />, <path key="j" d="m20.66 7-1.73 1" />,
  <path key="k" d="m3.34 17 1.73-1" />, <path key="l" d="m3.34 7 1.73 1" />, <circle key="m" cx="12" cy="12" r="2" />, <circle key="n" cx="12" cy="12" r="8" />,
);
const SHIELD = icon(<path key="a" d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />);
const KEY = icon(<path key="a" d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />, <circle key="b" cx="16.5" cy="7.5" r=".5" fill="currentColor" />);

// A stack trace is code, so it is not translated.
const TRACE = ['TypeError: Failed to fetch', ...Array.from({ length: 24 }, (_, i) => `    at load (records.ts:${40 + i})`)].join('\n');
const REFERENCE = '8f3a1c';

interface Row { id: number; item: string; owner: string }

const GROUPS = ['open', 'pending', 'closed'] as const;
type Group = (typeof GROUPS)[number];
type Sort = 'none' | 'ascending' | 'descending';
const NEXT_SORT: Record<Sort, Sort> = { none: 'ascending', ascending: 'descending', descending: 'none' };
// Eight invoices in each group; a few rows are toned to show a row the page marks.
const INVOICES = GROUPS.map((group, g) => ({ group, rows: Array.from({ length: 8 }, (_, i) => ({ id: g * 8 + i + 1, amount: 1240 + g * 310 + i * 37 })) }));
const TONES: Record<number, string> = { 2: 'warn', 5: 'danger' };
const TABLE_COLUMNS = 7;
const ALL_INVOICES = INVOICES.flatMap(({ rows }) => rows.map((row) => row.id));

/**
 * A grouped table with a sticky header row and first column, in a scroll area that scrolls both ways. What it does when
 * pressed is the page's: it sorts the names, collapses a group and selects rows; the classes draw the state it sets. A
 * selection raises the bulk bar over the page from inside the scroll area, and its clear empties it.
 */
function GroupedTable({ t, locale, theme, log }: SectionProps) {
  const [collapsed, setCollapsed] = useState<ReadonlySet<Group>>(new Set(['pending']));
  const [selected, setSelected] = useState<ReadonlySet<number>>(new Set());
  const [sort, setSort] = useState<Sort>('ascending');
  const amount = new Intl.NumberFormat(locale);
  const flip = <T,>(set: ReadonlySet<T>, value: T) => {
    const next = new Set(set);
    if (!next.delete(value)) next.add(value);
    return next;
  };
  const all = selected.size === ALL_INVOICES.length;
  const act = (id: string) => log('af-bulk-bar', 'action', { id, count: selected.size });

  return (
    <ScrollArea locale={locale} theme={theme} label={t.tableLabel} axis="both" style={{ height: 260, minWidth: 0, border: '1px solid var(--line)', borderRadius: 'var(--r)' }} testId="pages-table">
      <table className="af-table sticky" style={{ minWidth: 1400 }}>
        <thead>
          <tr>
            <th className="check">
              <input
                type="checkbox"
                className="af-checkbox"
                aria-label={t.selectPage}
                checked={all}
                ref={(el) => { if (el) el.indeterminate = selected.size > 0 && !all; }}
                onChange={() => setSelected(all ? new Set() : new Set(ALL_INVOICES))}
              />
            </th>
            <th aria-sort={sort}>
              <button type="button" className="af-table-sort" onClick={() => { setSort(NEXT_SORT[sort]); log('af-table', 'sort', { name: NEXT_SORT[sort] }); }}>
                {t.colName}{ARROW_UP}
              </button>
            </th>
            <th>{t.colReference}</th>
            <th>{t.colStatus}</th>
            <th className="num">{t.colAmount}</th>
            <th>{t.owner}</th>
            <th>{t.colDue}</th>
          </tr>
        </thead>
        {INVOICES.map(({ group, rows }) => {
          const shut = collapsed.has(group);
          const ordered = sort === 'descending' ? [...rows].reverse() : rows;
          return (
            <tbody key={group} className="af-table-group" data-collapsed={shut ? '' : undefined}>
              <tr className="af-table-group-header">
                <th scope="rowgroup" colSpan={TABLE_COLUMNS} style={{ '--af-table-depth': 0 } as CSSProperties}>
                  <div className="af-table-group-row">
                    <button
                      type="button"
                      className="af-table-group-toggle"
                      aria-expanded={!shut}
                      aria-controls={`pages-table-${group}`}
                      onClick={() => { setCollapsed(flip(collapsed, group)); log('af-table', 'group', { group, collapsed: !shut }); }}
                    >
                      {CHEVRON}<span>{t.tableGroups[group]}</span>
                    </button>
                    <span className="af-table-group-count">{rows.length}</span>
                  </div>
                </th>
              </tr>
              {ordered.map((row, i) => {
                const number = String(row.id).padStart(3, '0');
                return (
                  <tr key={row.id} id={i === 0 ? `pages-table-${group}` : undefined} aria-selected={selected.has(row.id) ? 'true' : undefined} data-tone={TONES[i]}>
                    <td className="check">
                      <input type="checkbox" className="af-checkbox" aria-label={`${t.selectInvoice} ${number}`} checked={selected.has(row.id)} onChange={() => setSelected(flip(selected, row.id))} />
                    </td>
                    <td>{`${t.invoice} ${number}`}</td>
                    <td>{`INV-${number}`}</td>
                    <td>{t.tableGroups[group]}</td>
                    <td className="num">{amount.format(row.amount)}</td>
                    <td>Minh</td>
                    <td>{`2026-11-${String(row.id).padStart(2, '0')}`}</td>
                  </tr>
                );
              })}
            </tbody>
          );
        })}
      </table>
      <BulkBar locale={locale} theme={theme} count={selected.size} testId="pages-bulk-bar" onClear={() => { setSelected(new Set()); log('af-bulk-bar', 'clear', {}); }}>
        <button slot="actions" type="button" className="af-button ghost sm" onClick={() => act('remind')}>{t.bulkRemind}</button>
        <button slot="actions" type="button" className="af-button ghost sm" onClick={() => act('export')}>{t.bulkExport}</button>
      </BulkBar>
    </ScrollArea>
  );
}

// One kind of actor for each event of the feed, in the order the text lists them.
const EVENT_ACTORS = [
  { kind: 'person', icon: USER },
  { kind: 'agent', icon: BOT },
  { kind: 'system', icon: COG },
  { kind: 'admin', icon: SHIELD },
  { kind: 'api', icon: KEY },
] as const;

/** A disclosure the page folds: the toggle's state is the page's, and the classes draw what it says. */
function Disclosure({ id, title, eyebrow, open, onToggle, children, testId }: { id: string; title: string; eyebrow?: boolean; open: boolean; onToggle(): void; children: ReactNode; testId?: string }) {
  return (
    <div className={eyebrow ? 'af-disclosure eyebrow' : 'af-disclosure'} data-testid={testId}>
      <button type="button" className="af-disclosure-toggle" aria-expanded={open} aria-controls={id} onClick={onToggle}>
        {CHEVRON}<span>{title}</span>
      </button>
      <div id={id} className="af-disclosure-body">{children}</div>
    </div>
  );
}

/**
 * The page structure classes: a breadcrumb and an eyebrow crumb, two disclosures the page folds, a field list with a copy
 * button, a stat card and a plain one, a feed of events as dots and as icon tiles (one event holds a disclosure), and steps.
 */
function PageStructure({ t, locale, theme, log }: SectionProps) {
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set(['details', 'changes']));
  const flip = (id: string) => {
    const next = new Set(open);
    const was = next.delete(id);
    if (!was) next.add(id);
    setOpen(next);
    log('af-disclosure', 'toggle', { id, open: !was });
  };
  const feed = (icons: boolean) => (
    <ol className={icons ? 'af-timeline icons' : 'af-timeline'} aria-label={t.activityLabel} data-testid={icons ? 'pages-timeline-icons' : 'pages-timeline'}>
      {t.activityEvents.map((event, i) => (
        <li key={event.who} className="af-timeline-item" data-kind={EVENT_ACTORS[i]!.kind}>
          <span className="af-timeline-dot">{EVENT_ACTORS[i]!.icon}</span>
          <div className="af-timeline-body">
            <div className="af-timeline-text"><b>{event.who}</b> {event.what}</div>
            <time className="af-timeline-time" dateTime={`2026-11-05T0${i + 6}:30:00Z`} title={`2026-11-05 0${i + 6}:30`}>{event.when}</time>
            {i === 1 && (
              <Disclosure id={`pages-changes-${icons ? 'icons' : 'dots'}`} title={t.changesTitle} open={open.has('changes')} onToggle={() => flip('changes')}>{t.changesBody}</Disclosure>
            )}
          </div>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="stack" data-testid="pages-structure">
      <nav className="af-breadcrumb" aria-label={t.breadcrumbLabel}>
        <ol>
          <li><a href="#entities" onClick={(event) => event.preventDefault()}>{t.crumbEntities}</a></li>
          <li><a href="#invoices" onClick={(event) => event.preventDefault()}>{t.crumbInvoices}</a></li>
          <li><a href="#invoice" aria-current="page" onClick={(event) => event.preventDefault()}>{t.invoice} 042</a></li>
        </ol>
      </nav>
      <nav className="af-breadcrumb eyebrow" aria-label={t.sectionLabel}>
        <ol><li><a href="#entities" onClick={(event) => event.preventDefault()}>{t.crumbEntities}</a></li></ol>
      </nav>

      <Disclosure id="pages-details" title={t.detailsTitle} open={open.has('details')} onToggle={() => flip('details')} testId="pages-disclosure">{t.detailsBody}</Disclosure>
      <Disclosure id="pages-payment" title={t.paymentTitle} eyebrow open={open.has('payment')} onToggle={() => flip('payment')}>{t.paymentBody}</Disclosure>

      <dl className="af-dl" style={{ '--af-dl-columns': 2 } as CSSProperties} data-testid="pages-dl">
        <div className="af-dl-item"><dt>{t.customer}</dt><dd>Hà Nội Trading</dd></div>
        <div className="af-dl-item"><dt>{t.colStatus}</dt><dd>{t.tableGroups.open}</dd></div>
        <div className="af-dl-item" style={{ '--af-dl-span': 2 } as CSSProperties}>
          <dt>{t.copyValue}</dt>
          <dd>INV-0042 <CopyButton locale={locale} theme={theme} value="INV-0042" label={t.copyLabel} onCopy={(detail) => log('af-copy-button', 'af-copy', detail)} /></dd>
        </div>
      </dl>

      <div className="row">
        <div className="af-stat" style={{ width: 160 }}>
          <div className="af-stat-label"><span className="af-stat-dot" style={{ '--af-stat-color': 'var(--af-warning, oklch(0.666 0.179 58.318))' } as CSSProperties} />{t.tableGroups.open}</div>
          <div className="af-stat-value" data-tone="warning">42</div>
          <div className="af-stat-note">{t.thisWeek}</div>
        </div>
        <div className="af-stat plain" style={{ width: 120 }}>
          <div className="af-stat-label">{t.paid}</div>
          <div className="af-stat-value" data-tone="success">1.240</div>
          <div className="af-stat-note">{t.thisMonth}</div>
        </div>
      </div>

      {feed(false)}
      {feed(true)}

      <ol className="af-steps" aria-label={t.stepsLabel} data-testid="pages-steps">
        <li className="af-step" data-state="done"><span className="af-step-marker">{CHECK}</span><span className="af-step-label">{t.steps.validate}</span></li>
        <li className="af-step" data-state="current"><span className="af-step-marker">2</span><span className="af-step-label">{t.steps.review}</span></li>
        <li className="af-step" data-state="todo"><span className="af-step-marker">3</span><span className="af-step-label">{t.steps.approve}</span></li>
        <li className="af-step" data-state="failed"><span className="af-step-marker">4</span><span className="af-step-label">{t.steps.publish}</span></li>
      </ol>
    </div>
  );
}

// The board: the groups of the table as columns (the closed one is empty), the last one dashed for what belongs to none, and a card for each invoice.
const BOARD_COLUMNS = [
  { key: 'open', count: 6, color: '#2a78d6' },
  { key: 'pending', count: 3, color: '#eda100' },
  { key: 'closed', count: 0, color: '#1baf7a' },
  { key: 'uncategorized', count: 1, color: undefined },
] as const;
const BOARD = (() => {
  let id = 0;
  return BOARD_COLUMNS.map((column) => ({ ...column, cards: Array.from({ length: column.count }, () => ++id) }));
})();
const WARNED_CARD = 4;

/**
 * A board of cards in a scroll area that scrolls across, each column's cards in a scroll area of their own. The page keeps
 * which cards are chosen: the checkbox sets the state the card draws.
 */
function Board({ t, locale, theme, log }: SectionProps) {
  const [chosen, setChosen] = useState<ReadonlySet<number>>(new Set([2]));
  const amount = new Intl.NumberFormat(locale);
  return (
    <ScrollArea locale={locale} theme={theme} label={t.boardLabel} axis="horizontal" style={{ minWidth: 0 }} testId="pages-board">
      <div className="af-board" style={{ height: 300 }}>
        {BOARD.map(({ key, count, color, cards }) => {
          const name = key === 'uncategorized' ? t.uncategorized : t.tableGroups[key];
          return (
            <section key={key} aria-labelledby={`pages-board-${key}-title`} className={key === 'uncategorized' ? 'af-board-column dashed' : 'af-board-column'} data-testid={`pages-board-${key}`}>
              <header className="af-board-column-header">
                <h3 id={`pages-board-${key}-title`} className="af-board-column-title">
                  {color && <span className="af-board-dot" style={{ '--af-option-color': color } as CSSProperties} />}{name}
                </h3>
                <span className="af-board-count">{count}</span>
              </header>
              <ScrollArea locale={locale} theme={theme} label={name} testId={`pages-board-${key}-cards`}>
                <div className="af-board-cards">
                  {cards.map((id) => {
                    const number = String(id).padStart(3, '0');
                    return (
                      <article key={id} className="af-card compact" aria-selected={chosen.has(id) ? 'true' : undefined} data-tone={id === WARNED_CARD ? 'warn' : undefined} data-testid={`pages-card-${id}`}>
                        <a className="af-card-link" href={`#invoice-${number}`} aria-label={`${t.openRecord} ${t.invoice} ${number}`} onClick={(event) => event.preventDefault()} />
                        <input
                          type="checkbox"
                          className="af-checkbox af-card-check"
                          aria-label={`${t.selectInvoice} ${number}`}
                          checked={chosen.has(id)}
                          onChange={() => {
                            const next = new Set(chosen);
                            if (!next.delete(id)) next.add(id);
                            setChosen(next);
                            log('af-card', 'select', { id: number, selected: next.has(id) });
                          }}
                        />
                        <h3 className="af-card-title">{`${t.invoice} ${number}`}</h3>
                        <dl className="af-card-rows">
                          <div className="af-card-row"><dt>{t.owner}</dt><dd>Minh</dd></div>
                          <div className="af-card-row"><dt>{t.colAmount}</dt><dd>{amount.format(1240 + id * 37)}</dd></div>
                        </dl>
                      </article>
                    );
                  })}
                </div>
              </ScrollArea>
              {count === 0 && <p className="af-board-empty">{t.noRecords}</p>}
            </section>
          );
        })}
      </div>
    </ScrollArea>
  );
}

// Monday the 26th of October 2026 is the first of the month view's 35 days; the 7th of November is today.
const MONTH_DAYS = Array.from({ length: 35 }, (_, i) => new Date(2026, 9, 26 + i));
const TODAY = '2026-11-07';
const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
interface CalendarEvent { name: keyof Text['calEvents']; time?: string; color?: string; edge?: 'continues' | 'continued' }
const DAY_EVENTS: Record<string, { events: CalendarEvent[]; more?: number }> = {
  '2026-11-02': { events: [{ name: 'standup', time: '09:00' }] },
  '2026-11-04': { events: [{ name: 'review', time: '14:00', color: '#7c3aed' }, { name: 'audit', color: '#0f766e' }] },
  '2026-11-08': { events: [{ name: 'offsite', color: '#c2410c', edge: 'continued' }] },
  '2026-11-09': { events: [{ name: 'offsite', color: '#c2410c', edge: 'continues' }] },
  '2026-11-12': { events: [{ name: 'standup', time: '09:00' }, { name: 'planning', time: '11:30', color: '#0f766e' }, { name: 'retro', time: '15:00', color: '#7c3aed' }], more: 3 },
};
const HOURS = [9, 10, 11, 12];

/**
 * A calendar that shows a month or a week: the page builds every day and decides what pressing one does (here it marks the
 * day chosen), and the classes draw the cells, the dates and the events it hands them.
 */
function Calendar({ t, locale, log }: SectionProps) {
  const [mode, setMode] = useState<'month' | 'week'>('month');
  const [chosen, setChosen] = useState('2026-11-12');
  const full = new Intl.DateTimeFormat(locale, { dateStyle: 'full' });
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const event = ({ name, time, color, edge }: CalendarEvent) => (
    <a key={name} href={`#${name}`} className={`af-event${edge ? ` ${edge}` : ''}`} style={color ? ({ '--af-option-color': color } as CSSProperties) : undefined} onClick={(e) => e.preventDefault()}>
      {time && <span className="af-event-time">{time}</span>}{t.calEvents[name]}
    </a>
  );
  const choose = (key: string) => {
    setChosen(key);
    log('af-cal', 'select', { day: key });
  };
  const week = MONTH_DAYS.slice(7, 14);
  return (
    <div className="af-cal" role="region" aria-label={t.calendarLabel} data-testid="pages-calendar">
      <header className="af-cal-header">
        <button type="button" className="af-button icon ghost sm" aria-label={t.calPrevious}>{CHEVRON_LEFT}</button>
        <button type="button" className="af-button icon ghost sm" aria-label={t.calNext}>{CHEVRON}</button>
        <button type="button" className="af-button sm">{t.calToday}</button>
        <h3 className="af-cal-period">{mode === 'month' ? t.calPeriod : t.calWeekPeriod}</h3>
        <div role="tablist" className="af-tabs segmented" aria-label={t.calView}>
          {(['month', 'week'] as const).map((value) => (
            <button key={value} type="button" role="tab" aria-selected={mode === value} data-testid={`pages-calendar-${value}`} onClick={() => setMode(value)}>{value === 'month' ? t.calMonth : t.calWeek}</button>
          ))}
        </div>
      </header>
      {mode === 'month' ? (
        <>
          <div className="af-cal-weekdays">{t.weekdays.map((name) => <span key={name}>{name}</span>)}</div>
          <div className="af-cal-grid">
            {MONTH_DAYS.map((day) => {
              const key = dayKey(day);
              const found = DAY_EVENTS[key];
              return (
                <div key={key} className={day.getMonth() === 10 ? 'af-cal-day' : 'af-cal-day outside'} aria-selected={key === chosen} data-day={key}>
                  <button type="button" className="af-cal-day-button" aria-label={full.format(day)} onClick={() => choose(key)} />
                  <span className={key === TODAY ? 'af-cal-date today' : 'af-cal-date'}>{day.getDate()}</span>
                  <div className="af-cal-events">
                    {found?.events.map(event)}
                    {found?.more && <button type="button" className="af-cal-more" onClick={() => choose(key)}>{`+${found.more} ${t.calMore}`}</button>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="af-cal-week">
          <div className="af-cal-allday-label">{t.calAllDay}</div>
          {week.map((day, i) => (
            <div key={dayKey(day)} className="af-cal-day" aria-selected={dayKey(day) === chosen}>
              <button type="button" className="af-cal-day-button" aria-label={`${weekday.format(day)}, ${full.format(day)}`} onClick={() => choose(dayKey(day))} />
              <div className="af-cal-events">{i === 2 && event({ name: 'offsite', color: '#c2410c' })}</div>
            </div>
          ))}
          <div className="af-cal-hours" data-testid="pages-calendar-hours">
            {HOURS.map((hour) => (
              <Fragment key={hour}>
                <div className="af-cal-hour-label">{`${String(hour).padStart(2, '0')}:00`}</div>
                {week.map((day, i) => (
                  <div key={dayKey(day)} className="af-cal-hour">
                    {hour === 9 && i === 1 && (
                      <a className="af-event block" href="#planning" style={{ '--af-option-color': '#0f766e', top: 24, height: 46 } as CSSProperties} onClick={(e) => e.preventDefault()}>
                        <span>{t.calEvents.planning}</span><span className="af-event-time">09:30</span>
                      </a>
                    )}
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// The filters: a search box with its clear button, the chips of what a list is narrowed by (two the person can remove or edit, one a quick filter's
// and one set aside), a facet of status options in a scroll area, and toggle chips for a view, with a locked chip beside them.
const STATUS_OPTIONS = [
  { key: 'open', color: '#2a78d6', count: 1240 },
  { key: 'pending', color: '#eda100', count: 380 },
  { key: 'paid', color: '#1baf7a', count: 2115 },
  { key: 'overdue', color: '#e34948', count: 47 },
  { key: 'disputed', color: '#c2410c', count: 9 },
  { key: 'writtenOff', color: '#898781', count: 0 },
  { key: 'archived', color: '#0f766e', count: 31 },
  { key: 'draft', color: '#7c3aed', count: 12 },
] as const;
const FIRST_OPTIONS = 6;
const VIEWS = ['all', 'open', 'paid'] as const;
type OwnChip = 'status' | 'customer';

/**
 * What a person narrows a list by. The page keeps all of it: the search text, which chips are on, which options are ticked and which view is
 * pressed. The classes draw the state it sets (`aria-pressed`, `aria-disabled`, `data-zero`) and the clear button hides itself while the input
 * shows its placeholder.
 */
function Filters({ t, locale, theme, log }: SectionProps) {
  const [query, setQuery] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const [chips, setChips] = useState<readonly OwnChip[]>(['status', 'customer']);
  const [shown, setShown] = useState(FIRST_OPTIONS);
  const [ticked, setTicked] = useState<ReadonlySet<string>>(new Set(['pending']));
  const [view, setView] = useState<(typeof VIEWS)[number]>('all');
  const amount = new Intl.NumberFormat(locale);
  const label = (name: string) => <span className="af-filter-chip-field">{name}</span>;
  const chip = (key: OwnChip, name: string, op: string, value: string) => (
    <span key={key} className="af-filter-chip" data-testid={`pages-filter-${key}`}>
      <button type="button" className="af-filter-chip-edit" onClick={() => log('af-filter-chip', 'edit', { filter: key })}>
        {label(name)} <b>{op}</b> <b>{value}</b>
      </button>
      <button type="button" className="af-filter-chip-remove" aria-label={`${t.removeFilter}: ${name}`} onClick={() => { setChips((list) => list.filter((k) => k !== key)); log('af-filter-chip', 'remove', { filter: key }); }}>{CLOSE}</button>
    </span>
  );
  return (
    <div className="stack" data-testid="pages-filters">
      <div className="af-filter-bar">
        <label className="af-search" data-testid="pages-search">
          {SEARCH}
          <input ref={input} type="search" className="af-input" placeholder={t.search} aria-label={t.searchRecords} value={query} onChange={(event) => setQuery(event.target.value)} data-testid="pages-search-input" />
          <button
            type="button"
            className="af-search-clear"
            aria-label={t.clearField}
            data-testid="pages-search-clear"
            onClick={() => {
              setQuery('');
              input.current?.focus();
              log('af-search', 'clear', {});
            }}
          >
            {CLOSE}
          </button>
        </label>
        <div className="af-filter-row" data-testid="pages-filter-row">
          {chips.includes('status') && chip('status', t.colStatus, t.filterIs, t.statuses.open)}
          <span className="af-filter-chip preset" data-testid="pages-filter-preset">
            <span className="af-filter-chip-edit">{label(t.owner)} <b>{t.filterIs}</b> <b>{t.whoeverViewing}</b></span>
          </span>
          <span className="af-filter-chip aside" data-testid="pages-filter-aside">
            <span className="af-filter-chip-edit">{label(t.colAmount)} <b>{t.filterAbove}</b> <b>{amount.format(1000)}</b></span>
          </span>
          {chips.includes('customer') && chip('customer', t.customer, t.filterOneOf, 'Hà Nội Trading, Sài Gòn Logistics, Đà Nẵng Freight, Huế Cargo, Cần Thơ Shipping')}
          {chips.length > 1 && <button type="button" className="af-filter-clear" onClick={() => setChips([])} data-testid="pages-filter-clear">{t.clearFilters}</button>}
        </div>
      </div>

      <aside className="af-facet-bar" aria-label={t.facetsLabel}>
        <section className="af-facet" aria-labelledby="pages-facet-title" data-testid="pages-facet">
          <header className="af-facet-header">
            <h3 id="pages-facet-title">{t.colStatus}</h3>
            <span className="af-facet-note">{t.facetApprox}</span>
          </header>
          <ScrollArea locale={locale} theme={theme} label={t.statusOptions} testId="pages-facet-area">
            <ul className="af-facet-list">
              {STATUS_OPTIONS.slice(0, shown).map(({ key, color, count }) => (
                <li key={key} className="af-facet-option" data-zero={count === 0 ? '' : undefined}>
                  <input
                    type="checkbox"
                    className="af-checkbox"
                    id={`pages-facet-${key}`}
                    checked={ticked.has(key)}
                    onChange={() => {
                      const next = new Set(ticked);
                      if (!next.delete(key)) next.add(key);
                      setTicked(next);
                      log('af-facet', 'toggle', { option: key, ticked: next.has(key) });
                    }}
                  />
                  <span className="af-facet-dot" style={{ '--af-option-color': color } as CSSProperties} />
                  <label htmlFor={`pages-facet-${key}`}>{t.statuses[key]}</label>
                  <span className="af-facet-count">{amount.format(count)}</span>
                </li>
              ))}
            </ul>
          </ScrollArea>
          <p className="af-facet-stats">{t.facetRange}</p>
          {shown < STATUS_OPTIONS.length && <button type="button" className="af-facet-more" onClick={() => setShown(STATUS_OPTIONS.length)} data-testid="pages-facet-more">{t.showMore}</button>}
        </section>
      </aside>

      <div className="af-filter-row" role="group" aria-label={t.quickFilters} data-testid="pages-views">
        {VIEWS.map((key) => (
          <button key={key} type="button" className="af-chip toggle" aria-pressed={view === key} onClick={() => { setView(key); log('af-chip', 'view', { view: key }); }} data-testid={`pages-view-${key}`}>
            {key === 'all' ? t.all : t.statuses[key]}
          </button>
        ))}
        <Tooltip locale={locale} theme={theme} text={t.approveLocked}>
          <button type="button" className="af-chip secondary" aria-disabled="true" onClick={(event) => event.preventDefault()} data-testid="pages-approve">{CHEVRON}{t.steps.approve}</button>
        </Tooltip>
      </div>
    </div>
  );
}

/**
 * The state and piece classes: an empty list and an empty card, a screen's error with its technical details in a scroll
 * area, a repeating group of fields whose rows the page adds and removes (the handle only draws; moving a row is the
 * page's), a grouped table with sticky rows, the page structure classes, a board of cards, a calendar and a file's chips.
 */
export function Pages({ t, locale, theme, log }: SectionProps) {
  const [rows, setRows] = useState<Row[]>([{ id: 1, item: 'Venue', owner: 'Minh' }, { id: 2, item: 'Invitations', owner: 'Hoa' }]);
  const [next, setNext] = useState(3);
  const edit = (id: number, field: 'item' | 'owner', value: string) => setRows((list) => list.map((row) => (row.id === id ? { ...row, [field]: value } : row)));

  return (
    <section aria-labelledby="showcase-pages" className="card">
      <h2 id="showcase-pages">{t.pages}</h2>

      <h3>{t.partStates}</h3>
      <div className="stack" data-testid="pages-empty">
        <div className="af-empty">
          {SEARCH_X}
          <p className="af-empty-title">{t.emptyTitle}</p>
          <p className="af-empty-body">{t.emptyBody}</p>
          <button type="button" className="af-button sm" onClick={() => log('af-empty', 'clear-search', {})}>{t.clearSearch}</button>
        </div>
        <div className="af-empty boxed">
          {SEARCH_X}
          <p className="af-empty-title">{t.boxedTitle}</p>
          <p className="af-empty-body">{t.boxedBody}</p>
        </div>
      </div>

      <div className="af-error" role="alert" data-testid="pages-error">
        <span className="af-error-icon">{ALERT}</span>
        <h3 className="af-error-title">{t.errorTitle}</h3>
        <p className="af-error-body">{t.errorBody}</p>
        <div className="af-error-actions">
          <button type="button" className="af-button primary sm" onClick={() => log('af-error', 'retry', {})}>{t.tryAgain}</button>
          <button type="button" className="af-button sm" onClick={() => log('af-error', 'reload', {})}>{t.reload}</button>
        </div>
        <details className="af-error-details" open>
          <summary>{t.technicalDetails}</summary>
          <ScrollArea locale={locale} theme={theme} label={t.technicalDetails}>
            <pre>{`${t.reference}: ${REFERENCE}\n${TRACE}`}</pre>
          </ScrollArea>
        </details>
      </div>

      <h3>{t.partRepeater}</h3>
      <div className="af-repeater" data-testid="pages-repeater">
        {rows.map((row, index) => (
          <div key={row.id} className="af-repeater-row" aria-label={`${t.row} ${index + 1}`} style={{ '--af-repeater-columns': 2 } as CSSProperties}>
            <div className="af-repeater-head">
              <button type="button" className="af-drag-handle" aria-label={`${t.dragRow} ${index + 1}`}>{GRIP}</button>
              <span>{`${t.row} ${index + 1}`}</span>
              <button type="button" className="af-repeater-remove" onClick={() => setRows((list) => list.filter((r) => r.id !== row.id))}>{t.remove}</button>
            </div>
            <div className="af-repeater-fields">
              <input className="af-input" aria-label={`${t.item}, ${t.row} ${index + 1}`} value={row.item} onChange={(e) => edit(row.id, 'item', e.target.value)} />
              <input className="af-input" aria-label={`${t.owner}, ${t.row} ${index + 1}`} value={row.owner} onChange={(e) => edit(row.id, 'owner', e.target.value)} />
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="af-repeater-empty">{t.noRows}</p>}
        <button
          type="button"
          className="af-button sm"
          onClick={() => {
            setRows((list) => [...list, { id: next, item: '', owner: '' }]);
            setNext(next + 1);
          }}
        >
          {t.addRow}
        </button>
      </div>

      <h3>{t.partTable}</h3>
      <GroupedTable t={t} locale={locale} theme={theme} log={log} />

      <h3>{t.partStructure}</h3>
      <PageStructure t={t} locale={locale} theme={theme} log={log} />

      <h3>{t.partBoard}</h3>
      <Board t={t} locale={locale} theme={theme} log={log} />

      <h3>{t.partCalendar}</h3>
      <Calendar t={t} locale={locale} theme={theme} log={log} />

      <h3>{t.partFilters}</h3>
      <Filters t={t} locale={locale} theme={theme} log={log} />

      <h3>{t.partFiles}</h3>
      <div className="row" data-testid="pages-file-chips">
        <span className="af-file-chip">
          {PAPERCLIP}
          <button type="button" className="af-file-chip-name" onClick={() => log('af-file-chip', 'open', { name: 'report.pdf' })}>report.pdf</button>
          <a className="af-file-chip-download" href="#download" download aria-label={`${t.download} report.pdf`} onClick={(event) => { event.preventDefault(); log('af-file-chip', 'download', { name: 'report.pdf' }); }}>{DOWNLOAD}</a>
        </span>
        <span className="af-file-chip">
          {PAPERCLIP}
          <button type="button" className="af-file-chip-name" onClick={() => log('af-file-chip', 'open', { name: 'long' })}>{t.longFile}</button>
          <a className="af-file-chip-download" href="#download" download aria-label={`${t.download} ${t.longFile}`} onClick={(event) => event.preventDefault()}>{DOWNLOAD}</a>
        </span>
        <span className="af-file-chip" data-unresolved>
          {PAPERCLIP}
          <span className="af-file-chip-name">{t.fileUnavailable}</span>
        </span>
      </div>
    </section>
  );
}
