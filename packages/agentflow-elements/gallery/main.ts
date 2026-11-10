import { AF_DEFAULT_PALETTE, applyTheme, matches } from '@reflexify/agentflow-sdk';
import { KIT_CSS } from '../src/kit/index.js';
import { claimEscape } from '../src/kit/escape.js';
import type { AfDrillDetail, AfOpenRecordDetail, ComboboxOption, FileItem, FolderSources, MenuEntry, MenuItem, Person, PickerSource, SelectOption, ToastInput, TreeNode } from '../src/kit/index.js';
import { TILE_CASES } from '../test/kit/fixtures/tiles.js';

type Theme = 'light' | 'dark';
type Settable = HTMLElement & Record<string, unknown>;
type ToastElement = HTMLElement & { show(input: ToastInput): string };

interface GalleryEvent { theme: Theme; tag: string; type: string; detail: unknown; id?: string }
const events: GalleryEvent[] = [];
Object.assign(window, { galleryEvents: events });
const saves = { hold: false, held: [] as (() => void)[] };
Object.defineProperty(window, 'galleryHoldSave', { set: (on: boolean) => (saves.hold = on) });
Object.assign(window, { galleryFinishSave: () => saves.held.splice(0).forEach((finish) => finish()) });

const MENU: MenuItem[] = [
  { id: 'open', label: 'Open' },
  { id: 'rename', label: 'Rename' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'move', label: 'Move to section' },
  { id: 'copy-link', label: 'Copy link' },
  { id: 'archive', label: 'Archive', disabled: true, reason: 'Only a manager can archive' },
  { id: 'export', label: 'Export' },
  { id: 'delete', label: 'Delete', danger: true },
];
// A step's overflow actions: each drawn in the tone its author gave it, and the whole menu locked while a submit runs.
const TONED: MenuEntry[] = [
  { id: 'approve', label: 'Approve', tone: 'success' },
  { id: 'hold', label: 'Put on hold', tone: 'warning' },
  { id: 'note', label: 'Ask a question', tone: 'info' },
  { id: 'reject', label: 'Reject', tone: 'danger' },
  { id: 'remove', label: 'Remove', danger: true },
  { id: 'plain', label: 'Add a comment' },
];
const SORTS = [{ id: 'sort-due', label: 'Due date' }, { id: 'sort-priority', label: 'Priority' }, { id: 'sort-title', label: 'Title' }];
const menuEntries = (sort: string, archived: boolean): MenuEntry[] => [
  ...MENU,
  { id: 'sort', heading: 'Sort by', items: SORTS.map((s) => ({ ...s, type: 'radio' as const, checked: s.id === sort })) },
  { id: 'view', items: [{ id: 'show-archived', label: 'Show archived', type: 'checkbox', checked: archived }] },
];

const STATUSES: SelectOption[] = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'todo', label: 'Todo' },
  { value: 'triage', label: 'Triage' },
  { value: 'closed', label: 'Closed' },
  { value: 'archived', label: 'Archived', disabled: true, reason: 'Only a manager can archive' },
];
const LABELS: SelectOption[] = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature request' },
  { value: 'docs', label: 'Documentation' },
  { value: 'urgent', label: 'Urgent' },
];

const CITIES: ComboboxOption[] = [
  { value: 'hn', label: 'Hà Nội', description: 'Thủ đô' },
  { value: 'hcm', label: 'Thành phố Hồ Chí Minh', description: 'Miền Nam' },
  { value: 'dn', label: 'Đà Nẵng', description: 'Miền Trung' },
  { value: 'hp', label: 'Hải Phòng', description: 'Miền Bắc' },
  { value: 'ct', label: 'Cần Thơ', description: 'Miền Tây' },
  { value: 'hue', label: 'Huế', description: 'Miền Trung', disabled: true, reason: 'No branch opens here yet' },
  { value: 'nt', label: 'Nha Trang', description: 'Khánh Hoà' },
  { value: 'dl', label: 'Đà Lạt', description: 'Lâm Đồng' },
];

// Two hundred places, five kinds over forty names, served twenty at a time after 300 ms, as a slow directory would.
const PLACE_NAMES = [
  'An Bình', 'An Khánh', 'Bạch Đằng', 'Bến Nghé', 'Bình Thạnh', 'Cầu Giấy', 'Cát Linh', 'Chợ Lớn', 'Đa Kao', 'Đông Hưng',
  'Đồng Xuân', 'Gia Lâm', 'Hàng Bạc', 'Hàng Bông', 'Hòa Khánh', 'Hội An', 'Kim Liên', 'Lạc Long', 'Láng Hạ', 'Long Biên',
  'Mỹ An', 'Ngọc Hà', 'Nguyễn Du', 'Nhật Tân', 'Phú Mỹ', 'Phước Long', 'Quang Trung', 'Quảng An', 'Tân Định', 'Tân Phong',
  'Thạch Thang', 'Thảo Điền', 'Thanh Xuân', 'Thủ Thiêm', 'Trúc Bạch', 'Trường Thi', 'Văn Miếu', 'Vĩnh Phúc', 'Xuân La', 'Yên Phụ',
];
const PLACES: ComboboxOption[] = ['Phường', 'Xã', 'Thị trấn', 'Quận', 'Huyện'].flatMap((kind, k) =>
  PLACE_NAMES.map((place, i) => ({ value: `place-${k * PLACE_NAMES.length + i + 1}`, label: `${kind} ${place}`, description: kind })));
const PAGE_SIZE = 20;
const later = <T>(signal: AbortSignal, make: () => T) =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => resolve(make()), 300);
    signal.addEventListener('abort', () => { clearTimeout(timer); reject(signal.reason); }, { once: true });
  });
const PLACE_SOURCE: PickerSource<ComboboxOption> = Object.assign(
  ({ q, cursor, signal }: { q: string; cursor: string | null; signal: AbortSignal }) =>
    later(signal, () => {
      const found = PLACES.filter((p) => matches(p.label, q));
      const start = Number(cursor ?? 0);
      const end = start + PAGE_SIZE;
      return { items: found.slice(start, end), next: end < found.length ? String(end) : null };
    }),
  { resolve: (ids: string[], signal: AbortSignal) => later(signal, () => PLACES.filter((p) => ids.includes(p.value))) },
);

// Two hundred people, ten families over twenty given names, served as the places are.
const FAMILIES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ'];
const GIVEN_NAMES = ['An', 'Bảo', 'Chi', 'Dũng', 'Giang', 'Hà', 'Hải', 'Khoa', 'Lan', 'Linh', 'Mai', 'Minh', 'Nam', 'Ngọc', 'Phúc', 'Quân', 'Sơn', 'Thảo', 'Tú', 'Yến'];
const DIRECTORY: Person[] = FAMILIES.flatMap((family, f) =>
  GIVEN_NAMES.map((given, g) => ({ id: `person-${f * GIVEN_NAMES.length + g + 1}`, name: `${family} ${given}` })));
const PERSON_SOURCE: PickerSource<Person> = Object.assign(
  ({ q, cursor, signal }: { q: string; cursor: string | null; signal: AbortSignal }) =>
    later(signal, () => {
      const found = DIRECTORY.filter((p) => matches(p.name, q));
      const start = Number(cursor ?? 0);
      const end = start + PAGE_SIZE;
      return { items: found.slice(start, end), next: end < found.length ? String(end) : null };
    }),
  { resolve: (ids: string[], signal: AbortSignal) => later(signal, () => DIRECTORY.filter((p) => ids.includes(p.id))) },
);

// Three regions, each with two offices and an archived one.
const UNITS: TreeNode[] = [
  { id: 'north', parentId: null, label: 'Miền Bắc', code: 'MB' },
  { id: 'central', parentId: null, label: 'Miền Trung', code: 'MT' },
  { id: 'south', parentId: null, label: 'Miền Nam', code: 'MN' },
  { id: 'hanoi', parentId: 'north', label: 'Hà Nội', code: 'HN' },
  { id: 'haiphong', parentId: 'north', label: 'Hải Phòng', code: 'HP' },
  { id: 'namdinh', parentId: 'north', label: 'Nam Định', code: 'ND', archived: true },
  { id: 'danang', parentId: 'central', label: 'Đà Nẵng', code: 'DN' },
  { id: 'hue', parentId: 'central', label: 'Huế', code: 'HUE' },
  { id: 'quangngai', parentId: 'central', label: 'Quảng Ngãi', code: 'QNG', archived: true },
  { id: 'hcm', parentId: 'south', label: 'Thành phố Hồ Chí Minh', code: 'HCM' },
  { id: 'cantho', parentId: 'south', label: 'Cần Thơ', code: 'CT' },
  { id: 'vungtau', parentId: 'south', label: 'Vũng Tàu', code: 'VT', archived: true },
];

const PEOPLE: Person[] = [
  { id: 'p-minh', name: 'Lê Minh', email: 'minh@example.com' },
  { id: 'p-hoa', name: 'Trần Hoa', email: 'hoa@example.com' },
  { id: 'p-lan', name: 'Phạm Lan', email: 'lan@example.com' },
  { id: 'p-duc', name: 'Đỗ Đức', email: null },
];

const NOTES = '**Launch checklist**\n\n- Confirm the venue\n- Send the *invitations*\n\nSee [the brief](https://example.com/brief).';

// The Markdown view's sample: the editor's notes, then a table, a task list and a mention the map resolves.
const LAN_REF = 'user/0b6c1f4e-1a2b-4c3d-8e9f-0123456789ab';
const MARKDOWN = `${NOTES}\n\n| Task | Owner |\n| --- | --- |\n| Venue | Minh |\n| Invitations | Hoa |\n\n- [x] Book the room\n- [ ] Print the badges\n\nAsk @[Lan](mention:${LAN_REF}) about \`badges\`.`;

const STYLE = `
  :host { display: block; }
  .gallery { container-type: inline-size; display: grid; gap: 16px; padding: 16px; border-radius: 12px; background: var(--af-bg); color: var(--af-fg); }
  .gallery > h2 { margin: 0; font-size: 15px; }
  .row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  .short-column { height: 80px; overflow: auto; padding: 8px; border: 1px dashed var(--af-border); border-radius: 8px; background: var(--af-surface); }
  .short-column p { margin: 8px 0 0; color: var(--af-muted-fg); }
  .field { min-height: 32px; padding: 0 8px; border: 1px solid var(--af-border); border-radius: 6px; background: var(--af-surface); color: inherit; font: inherit; }
  [slot='content'] { display: grid; gap: 6px; }
  .stack { display: grid; gap: 8px; max-width: 320px; }
  .stack.wide { max-width: 480px; }
  .field-error { color: var(--af-danger); font-size: 12px; }
  fieldset.stack { margin: 0; padding: 0; border: 0; }
  .tiles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-flow: dense; gap: 12px; align-items: start; }
  .tile-cell { min-width: 0; }
  .tile-cell.wide { grid-column: 1 / -1; }
  .markdown-case { max-width: 480px; }
  .scroll-case { height: 200px; max-width: 360px; border: 1px solid var(--af-border); border-radius: 8px; }
  .scroll-head { position: sticky; top: 0; padding: 6px 12px; background: var(--af-surface); font-weight: 600; }
  .scroll-row { padding: 6px 12px; border-top: 1px solid var(--af-border); }
  .split-case { width: 600px; height: 160px; border: 1px solid var(--af-border); border-radius: 8px; }
  .split-case af-scroll-area { height: 100%; }
  .split-case ul { margin: 0; padding: 0; list-style: none; }
  .split-case li { padding: 6px 12px; border-top: 1px solid var(--af-border); }
  /* The end pane has a fill, so the handle's focus ring shows whole only if it paints above the pane. */
  .pager-list { height: 160px; max-width: 360px; border: 1px solid var(--af-border); border-radius: 8px; }
  .pager-list ol, .pager-list ul { margin: 0; padding: 0; list-style: none; }
  .pager-list li { padding: 6px 12px; border-top: 1px solid var(--af-border); }
  .bulk-list { height: 160px; max-width: 360px; border: 1px solid var(--af-border); border-radius: 8px; }
  .bulk-list ul { margin: 0; padding: 0; list-style: none; }
  .bulk-list li { padding: 6px 12px; border-top: 1px solid var(--af-border); }
  .bulk-list label { display: flex; align-items: center; gap: 8px; }
  .bulk-wide { min-width: 30rem; }
  .split-case [slot='end'] { background: var(--af-muted, oklch(0.968 0.007 247)); }
  .table-case { height: 240px; max-width: 480px; border: 1px solid var(--af-border); border-radius: 8px; background: var(--af-surface); }
  .view-case { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; max-width: 560px; }
  .view-board .af-board { height: 260px; }
  .view-box { overflow: hidden; border: 1px solid var(--af-border); border-radius: 12px; background: var(--af-surface); }
  .row-title { flex: 1 1 0%; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .board-cost { min-width: 0; }
  .board { display: flex; gap: 8px; padding: 8px; }
  .board-column { flex: none; width: 160px; height: 320px; }
  .board-column .af-skeleton { margin-bottom: 8px; }
`;

// Each variant beside AgentFlow's name for it, and every size with and without a label.
const BUTTON_VARIANTS: [string, string][] = [['primary', 'Default'], ['', 'Outline'], ['secondary', 'Secondary'], ['ghost', 'Ghost'], ['danger', 'Destructive'], ['link', 'Link']];
const BUTTON_SIZES: [string, string][] = [['xs', 'xs'], ['sm', 'sm'], ['', 'default'], ['lg', 'lg']];
const PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>';

const BOLD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" /></svg>';

const INFO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>';
const icon = (paths: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const SEARCH_X = icon('<path d="m13.5 8.5-5 5" /><path d="m8.5 8.5 5 5" /><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />');
const ALERT = icon('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" />');
const GRIP = icon('<circle cx="9" cy="12" r="1" /><circle cx="9" cy="5" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="19" r="1" />');
const PAPERCLIP = icon('<path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" />');
const DOWNLOAD = icon('<path d="M12 15V3" /><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" />');
const TRACE = Array.from({ length: 24 }, (_, i) => `    at load (records.ts:${40 + i})`).join('\n');
const PICTURE = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#7c3aed"/></svg>')}`;

const CHEVRON = icon('<path d="m9 18 6-6-6-6" />');
const CHECK = icon('<path d="M20 6 9 17l-5-5" />');
const USER = icon('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />');
const BOT = icon('<path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />');
const COG = icon('<path d="M11 10.27 7 3.34" /><path d="m11 13.73-4 6.93" /><path d="M12 22v-2" /><path d="M12 2v2" /><path d="M14 12h8" /><path d="m17 20.66-1-1.73" /><path d="m17 3.34-1 1.73" /><path d="M2 12h2" /><path d="m20.66 17-1.73-1" /><path d="m20.66 7-1.73 1" /><path d="m3.34 17 1.73-1" /><path d="m3.34 7 1.73 1" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="12" r="8" />');
const SHIELD = icon('<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />');
const KEY = icon('<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />');
const ARROW_UP = icon('<path d="m5 12 7-7 7 7" /><path d="M12 19V5" />');
const CHEVRON_LEFT = icon('<path d="m15 18-6-6 6-6" />');
const IMAGE = icon('<rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />');
const PANEL = icon('<rect width="18" height="18" x="3" y="3" rx="2" /><path d="M15 3v18" /><path d="m8 9 3 3-3 3" />');
const SEARCH = icon('<circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />');
const CLOSE = icon('<path d="M18 6 6 18" /><path d="m6 6 12 12" />');

// A grouped, sticky table in a scroll area: three groups, the first with twelve rows (one selected, three toned) and a
// Load more row, the second collapsed with twelve and a loading row, the third declared empty. Nine columns of
// unwrapped text run wider than the scroll area.
const TABLE_COLUMNS = 9;
const TABLE_TONES: Record<number, string> = { 4: 'warn', 6: 'danger', 8: 'ok' };
function tableRows(first: string, count: number, marked: boolean): string {
  return Array.from({ length: count }, (_, i) => {
    const selected = marked && i === 2;
    const tone = marked ? TABLE_TONES[i] : undefined;
    const n = String(i + 1).padStart(3, '0');
    const attrs = `${i === 0 ? ` id="${first}"` : ''}${selected ? ' aria-selected="true"' : ''}${tone ? ` data-tone="${tone}"` : ''}`;
    return `<tr${attrs}><td class="check"><input type="checkbox" class="af-checkbox" aria-label="Select invoice ${n}"${selected ? ' checked' : ''}></td><td>Invoice ${n}</td><td>INV-${n}</td><td>Open</td><td class="num">${(1240 + i * 37).toLocaleString('vi-VN')}</td><td>Minh</td><td>2026-11-${String(i + 1).padStart(2, '0')}</td><td>Hà Nội</td><td>Paid in two instalments</td></tr>`;
  }).join('');
}
function tableGroup(rowId: string, label: string, count: number, body: string, state: 'collapsed' | 'empty' | null): string {
  const attribute = state ? ` data-${state}` : '';
  const action = `<button type="button" class="af-button xs">Select all ${count || ''}</button>`;
  return `<tbody class="af-table-group"${attribute}>
      <tr class="af-table-group-header"><th scope="rowgroup" colspan="${TABLE_COLUMNS}" style="--af-table-depth: 0"><div class="af-table-group-row">
        <input type="checkbox" class="af-checkbox" aria-label="Select the loaded rows in ${label}">
        <button type="button" class="af-table-group-toggle" aria-expanded="${state === 'collapsed' ? 'false' : 'true'}" aria-controls="${rowId}">${CHEVRON}<span>${label}</span></button>
        <span class="af-table-group-count">${count}</span>
        <div class="af-table-group-actions">${action}</div>
      </div></th></tr>${body}
    </tbody>`;
}
function tableCase(t: Theme): string {
  const cells = `colspan="${TABLE_COLUMNS}"`;
  return `<af-scroll-area axis="both" class="table-case" label="Invoices" data-testid="${t}-table-area">
    <table class="af-table sticky" data-testid="${t}-table">
      <thead><tr>
        <th class="check"><input type="checkbox" class="af-checkbox" aria-label="Select the page"></th>
        <th aria-sort="ascending"><button type="button" class="af-table-sort" data-testid="${t}-sort-ascending">Name ${ARROW_UP}</button></th>
        <th aria-sort="none"><button type="button" class="af-table-sort" data-testid="${t}-sort-none">Reference ${ARROW_UP}</button></th>
        <th aria-sort="descending"><button type="button" class="af-table-sort" data-testid="${t}-sort-descending">Status ${ARROW_UP}</button></th>
        <th class="num">Amount</th><th>Owner</th><th>Due date</th><th>Region</th><th>Notes</th>
      </tr></thead>
      ${tableGroup(`${t}-table-g1`, 'Open', 12, `${tableRows(`${t}-table-g1`, 12, true)}<tr class="af-table-more"><td ${cells}><af-pager mode="more" has-more></af-pager></td></tr>`, null)}
      ${tableGroup(`${t}-table-g2`, 'Pending', 12, `${tableRows(`${t}-table-g2`, 12, false)}<tr class="af-table-loading"><td ${cells}><div class="af-skeleton row"></div></td></tr>`, 'collapsed')}
      ${tableGroup(`${t}-table-g3`, 'Closed', 0, `<tr class="af-table-empty" id="${t}-table-g3"><td ${cells}><div class="af-empty">No invoices are closed.</div></td></tr>`, 'empty')}
    </table>
  </af-scroll-area>`;
}

// The page structure classes: a timeline of one event per kind, drawn as dots and as icon tiles, with the changes of one
// event folded in a disclosure.
const EVENTS: { kind: string; icon: string; who: string; what: string; when: string }[] = [
  { kind: 'person', icon: USER, who: 'Lan', what: 'opened the invoice', when: '3 h ago' },
  { kind: 'agent', icon: BOT, who: 'Invoice agent', what: 'changed the status', when: '2 h ago' },
  { kind: 'system', icon: COG, who: 'System', what: 'sent a reminder', when: '1 h ago' },
  { kind: 'admin', icon: SHIELD, who: 'Minh', what: 'unlocked the record', when: '40 min ago' },
  { kind: 'api', icon: KEY, who: 'Accounting sync', what: 'updated the amount', when: '5 min ago' },
];
function timeline(t: Theme, icons: boolean): string {
  const items = EVENTS.map(
    (e, i) => `<li class="af-timeline-item" data-kind="${e.kind}"><span class="af-timeline-dot">${e.icon}</span><div class="af-timeline-body"><div class="af-timeline-text"><b>${e.who}</b> ${e.what}</div><time class="af-timeline-time" datetime="2026-11-05T0${i + 6}:30:00Z" title="5 Nov 2026, 0${i + 6}:30">${e.when}</time>${
      i === 1
        ? `<div class="af-disclosure"><button type="button" class="af-disclosure-toggle" aria-expanded="false" aria-controls="${t}-timeline-${icons ? 'icons' : 'dots'}-changes">${CHEVRON}<span>Changes</span></button><div id="${t}-timeline-${icons ? 'icons' : 'dots'}-changes" class="af-disclosure-body">Status: Open to Paid</div></div>`
        : ''
    }</div></li>`
  ).join('');
  return `<ol class="af-timeline${icons ? ' icons' : ''}" aria-label="Activity" data-testid="${t}-timeline${icons ? '-icons' : ''}">${items}<li class="af-timeline-item"><span class="af-timeline-dot">${COG}</span><div class="af-timeline-body"><div class="af-timeline-text"><b>Lan</b> added a note</div><time class="af-timeline-time" datetime="2026-11-05T11:30:00Z">just now</time></div></li></ol>`;
}

// The view classes: a grid of six cards (one chosen, one toned, one with a picture, one compact), a board of four columns
// (one dashed, one empty, the first with more cards than it has room for), a listbox, and a month and a week of events.
const CARDS: { title: string; rows: [string, string][]; state?: 'selected' | 'ok' | 'warn' | 'danger' | 'media' | 'compact' }[] = [
  { title: 'INV-0042', rows: [['Owner', 'Lan'], ['Amount', '1.240']] },
  { title: 'INV-0043', rows: [['Owner', 'Minh'], ['Amount', '980']], state: 'selected' },
  { title: 'INV-0044', rows: [['Owner', 'Hoa'], ['Amount', '2.115']], state: 'warn' },
  { title: 'INV-0045', rows: [['Owner', 'Lan'], ['Amount', '310']], state: 'media' },
  { title: 'INV-0046', rows: [['Owner', 'Minh'], ['Amount', '75']], state: 'compact' },
  { title: 'INV-0047', rows: [['Owner', 'Hoa'], ['Amount', '4.800']] },
];
function card(t: Theme, id: string, c: (typeof CARDS)[number]): string {
  const attrs = `${c.state === 'selected' ? ' aria-selected="true"' : ''}${c.state === 'ok' || c.state === 'warn' || c.state === 'danger' ? ` data-tone="${c.state}"` : ''}`;
  const media = c.state === 'media' ? `<div class="af-card-media" data-testid="${t}-${id}-media">${IMAGE}</div>` : '';
  const rows = c.rows.map(([name, value]) => `<div class="af-card-row"><dt>${name}</dt><dd>${value}</dd></div>`).join('');
  return `<article class="af-card${c.state === 'compact' ? ' compact' : ''}"${attrs} data-testid="${t}-${id}"><a class="af-card-link" href="#${c.title.toLowerCase()}" aria-label="Open ${c.title}" data-testid="${t}-${id}-link"></a><input type="checkbox" class="af-checkbox af-card-check" aria-label="Select ${c.title}" data-testid="${t}-${id}-check"${c.state === 'selected' ? ' checked' : ''}>${media}<h3 class="af-card-title">${c.title}</h3><dl class="af-card-rows">${rows}</dl></article>`;
}
const BOARD: { title: string; color?: string; count: number; modifier?: string }[] = [
  { title: 'Open', color: '#2a78d6', count: 6 },
  { title: 'In progress', color: '#eda100', count: 2 },
  { title: 'Closed', color: '#1baf7a', count: 0 },
  { title: 'Uncategorized', count: 1, modifier: ' dashed' },
];
function boardCase(t: Theme): string {
  const columns = BOARD.map(({ title, color, count, modifier = '' }, column) => {
    const cards = Array.from({ length: count }, (_, i) => card(t, `view-board-${column}-card-${i}`, { title: `INV-${100 + column * 10 + i}`, rows: [['Owner', 'Lan'], ['Amount', String(120 + i * 35)]], state: 'compact' })).join('');
    const dot = color ? `<span class="af-board-dot" style="--af-option-color: ${color}"></span>` : '';
    const compact = column === 1 ? ' compact' : '';
    return `<section class="af-board-column${modifier}${compact}" aria-label="${title}" data-testid="${t}-view-board-column-${column}">
      <header class="af-board-column-header"><h3 class="af-board-column-title">${dot}${title}</h3><span class="af-board-count">${count}</span></header>
      <af-scroll-area label="${title} cards" data-testid="${t}-view-board-cards-${column}"><div class="af-board-cards">${cards}</div></af-scroll-area>${count ? '' : '<p class="af-board-empty">No records</p>'}
    </section>`;
  }).join('');
  return `<af-scroll-area axis="horizontal" class="view-board" label="Board" data-testid="${t}-view-board-area"><div class="af-board" data-testid="${t}-view-board">${columns}</div></af-scroll-area>`;
}
function listCase(t: Theme): string {
  const rows = ['INV-0042', 'INV-0043', 'INV-0044', 'INV-0045', 'INV-0046'];
  const items = rows
    .map((title, i) => `<li id="${t}-row-${i}" class="af-list-row${i === 4 ? ' compact' : ''}" role="option" aria-selected="${i === 0}"${i === 2 ? ' data-active' : ''} data-testid="${t}-row-${i}"><span class="row-title">${title}</span><span class="af-chip secondary">${i % 2 ? 'Paid' : 'Open'}</span></li>`)
    .join('');
  return `<div class="view-box"><ul class="af-list" role="listbox" aria-label="Invoices" aria-activedescendant="${t}-row-2" tabindex="0" data-testid="${t}-list">${items}</ul></div>`;
}
// Monday 26 October 2026 is the first of 35 days; the 7th of November is today and the 12th is the chosen day.
const CAL_DAYS = Array.from({ length: 35 }, (_, i) => new Date(2026, 9, 26 + i));
const CAL_DAY_LABEL = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
interface CalEvent { label: string; time?: string; color?: string; edge?: 'continues' | 'continued' }
const CAL_EVENTS: Record<string, { events: CalEvent[]; more?: number }> = {
  '2026-11-02': { events: [{ label: 'Standup', time: '09:00' }] },
  '2026-11-04': { events: [{ label: 'Invoice review', time: '14:00', color: '#7c3aed' }, { label: 'Audit', color: '#0f766e' }] },
  '2026-11-08': { events: [{ label: 'Offsite', color: '#c2410c', edge: 'continued' }] },
  '2026-11-09': { events: [{ label: 'Offsite', color: '#c2410c', edge: 'continues' }] },
  '2026-11-12': { events: [{ label: 'Standup', time: '09:00' }, { label: 'Planning', time: '11:30', color: '#0f766e' }, { label: 'Retro', time: '15:00', color: '#7c3aed' }], more: 3 },
};
const calKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const calEvent = ({ label, time, color, edge }: CalEvent) =>
  `<a class="af-event${edge ? ` ${edge}` : ''}" href="#${label.toLowerCase().replace(/ /g, '-')}"${color ? ` style="--af-option-color: ${color}"` : ''}>${time ? `<span class="af-event-time">${time}</span>` : ''}${label}</a>`;
const calHeader = (period: string, modes: boolean) =>
  `<header class="af-cal-header"><button type="button" class="af-button icon ghost sm" aria-label="Previous">${CHEVRON_LEFT}</button><button type="button" class="af-button icon ghost sm" aria-label="Next">${CHEVRON}</button><button type="button" class="af-button sm">Today</button><h2 class="af-cal-period">${period}</h2>${
    modes ? '<div role="tablist" class="af-tabs segmented" aria-label="View"><button type="button" role="tab" aria-selected="true">Month</button><button type="button" role="tab" aria-selected="false">Week</button></div>' : ''
  }</header>`;
function monthCase(t: Theme): string {
  const days = CAL_DAYS.map((d) => {
    const key = calKey(d);
    const found = CAL_EVENTS[key];
    const outside = d.getMonth() !== 10;
    const more = found?.more ? `<button type="button" class="af-cal-more">+${found.more} more</button>` : '';
    return `<div class="af-cal-day${outside ? ' outside' : ''}" aria-selected="${key === '2026-11-12'}" data-day="${key}"><button type="button" class="af-cal-day-button" aria-label="${CAL_DAY_LABEL.format(d)}"></button><span class="af-cal-date${key === '2026-11-07' ? ' today' : ''}">${d.getDate()}</span><div class="af-cal-events">${found ? found.events.map(calEvent).join('') + more : ''}</div></div>`;
  }).join('');
  const weekdays = CAL_DAYS.slice(0, 7).map((d) => `<span>${new Intl.DateTimeFormat('en', { weekday: 'short' }).format(d)}</span>`).join('');
  return `<div class="af-cal" data-testid="${t}-cal-month">${calHeader('November 2026', true)}<div class="af-cal-weekdays">${weekdays}</div><div class="af-cal-grid">${days}</div></div>`;
}
function weekCase(t: Theme): string {
  const week = CAL_DAYS.slice(7, 14);
  const allDay = week
    .map((d, i) => `<div class="af-cal-day"><button type="button" class="af-cal-day-button" aria-label="${CAL_DAY_LABEL.format(d)}"></button><div class="af-cal-events">${i === 2 ? calEvent({ label: 'Offsite', color: '#c2410c' }) : ''}</div></div>`)
    .join('');
  const hours = [9, 10, 11]
    .map((h) => {
      const cells = week
        .map((_, i) => `<div class="af-cal-hour">${h === 9 && i === 1 ? '<a class="af-event block" href="#planning" style="--af-option-color: #0f766e; top: 24px; height: 46px"><span>Planning</span><span class="af-event-time">09:30</span></a>' : ''}</div>`)
        .join('');
      return `<div class="af-cal-hour-label">${String(h).padStart(2, '0')}:00</div>${cells}`;
    })
    .join('');
  return `<div class="af-cal" data-testid="${t}-cal-week">${calHeader('2 – 8 Nov 2026', false)}<div class="af-cal-week"><div class="af-cal-allday-label">All day</div>${allDay}<div class="af-cal-hours" data-testid="${t}-cal-hours">${hours}</div></div></div>`;
}

// The filter classes: a bar of three chips (one a quick filter's, one set aside) with its clear button, two search boxes, two facets
// (the first with eight options and a note, a range and a button that loads more; the second with fourteen, which outgrow the 224px
// its scroll area is bounded to) and a row of chips that are toggles or locked.
function filterChip(t: Theme, key: string, field: string, op: string, value: string): string {
  return `<span class="af-filter-chip" data-testid="${t}-filter-${key}"><button type="button" class="af-filter-chip-edit" data-testid="${t}-filter-${key}-edit"><span class="af-filter-chip-field">${field}</span> <b>${op}</b> <b>${value}</b></button><button type="button" class="af-filter-chip-remove" aria-label="Remove filter" data-testid="${t}-filter-${key}-remove">${CLOSE}</button></span>`;
}
const FACET_STATUS: [string, string, string][] = [
  ['Open', '#2a78d6', '1.240'], ['In progress', '#eda100', '380'], ['Pending', '#7c3aed', '112'], ['Paid', '#1baf7a', '2.115'],
  ['Overdue', '#e34948', '47'], ['Disputed', '#c2410c', '9'], ['Written off', '#898781', '0'], ['Archived with a name too long to fit the facet beside its count', '#0f766e', '31'],
];
const FACET_OWNERS = ['Lan', 'Minh', 'Hoa', 'Đức', 'Mai', 'Nam', 'Linh', 'Quang', 'Thảo', 'Hùng', 'Yến', 'Bảo', 'Châu', 'Dũng'];
function facet(t: Theme, key: string, title: string, options: [string, string, string][], extra = ''): string {
  const items = options
    .map(([name, color, count], i) => `<li class="af-facet-option"${count === '0' ? ' data-zero' : ''} data-testid="${t}-facet-${key}-option-${i}"><input type="checkbox" class="af-checkbox" id="${t}-facet-${key}-${i}"${i === 1 ? ' checked' : ''}><span class="af-facet-dot" style="--af-option-color: ${color}"></span><label for="${t}-facet-${key}-${i}">${name}</label><span class="af-facet-count">${count}</span></li>`)
    .join('');
  return `<section class="af-facet" aria-labelledby="${t}-facet-${key}-title" data-testid="${t}-facet-${key}"><header class="af-facet-header"><h3 id="${t}-facet-${key}-title">${title}</h3>${key === 'status' ? '<span class="af-facet-note">Approx.</span>' : ''}</header><af-scroll-area label="${title} options" data-testid="${t}-facet-${key}-area"><ul class="af-facet-list">${items}</ul></af-scroll-area>${extra}</section>`;
}
function filtersMarkup(t: Theme): string {
  return `
      <div class="stack wide" data-testid="${t}-filters">
        <div class="af-filter-bar" data-testid="${t}-filter-bar">
          <div class="row"><label class="af-search" data-testid="${t}-search">${SEARCH}<input type="search" class="af-input" placeholder="Search" aria-label="Search records" data-testid="${t}-search-input"><button type="button" class="af-search-clear" aria-label="Clear" data-testid="${t}-search-clear">${CLOSE}</button></label>
            <label class="af-search xs" data-testid="${t}-search-xs">${SEARCH}<input type="search" class="af-input" placeholder="Search" aria-label="Search records, compact" data-testid="${t}-search-xs-input"><button type="button" class="af-search-clear" aria-label="Clear" data-testid="${t}-search-xs-clear">${CLOSE}</button></label></div>
          <div class="af-filter-row" data-testid="${t}-filter-row">
            ${filterChip(t, 'status', 'Status', 'is', 'Open')}
            <span class="af-filter-chip preset" data-testid="${t}-filter-preset"><span class="af-filter-chip-edit"><span class="af-filter-chip-field">Owner</span> <b>is</b> <b>Whoever is viewing</b></span></span>
            <span class="af-filter-chip aside" data-testid="${t}-filter-aside"><span class="af-filter-chip-edit"><span class="af-filter-chip-field">Amount</span> <b>above</b> <b>1.000</b></span></span>
            ${filterChip(t, 'long', 'Customer', 'is one of', 'Hà Nội Trading, Sài Gòn Logistics, Đà Nẵng Freight, Huế Cargo, Cần Thơ Shipping, Hải Phòng Port')}
            <button type="button" class="af-filter-clear" data-testid="${t}-filter-clear">Clear filters</button>
          </div>
        </div>
        <div class="af-facet-bar" data-testid="${t}-facets">
          ${facet(t, 'status', 'Status', FACET_STATUS, '<p class="af-facet-stats">min 1 · max 9</p><button type="button" class="af-facet-more">Show more</button>')}
          ${facet(t, 'owner', 'Owner', FACET_OWNERS.map((name, i): [string, string, string] => [name, '#2a78d6', String(300 - i * 17)]))}
        </div>
        <div class="af-filter-row" role="group" aria-label="Quick filters" data-testid="${t}-toggles">
          <button type="button" class="af-chip toggle" aria-pressed="true" data-testid="${t}-toggle-all">All</button>
          <button type="button" class="af-chip toggle" aria-pressed="false" data-testid="${t}-toggle-open">Open</button>
          <button type="button" class="af-chip toggle compact" aria-pressed="true" data-testid="${t}-toggle-compact-on">All</button>
          <button type="button" class="af-chip toggle compact" aria-pressed="false" data-testid="${t}-toggle-compact">Open</button>
          <button type="button" class="af-chip secondary" aria-disabled="true" aria-describedby="${t}-why" data-testid="${t}-chip-locked">${CHEVRON}Approve</button><span id="${t}-why" hidden>Only a manager can approve</span>
          <button type="button" class="af-chip outline" data-testid="${t}-chip-button">Reopen</button>
        </div>
      </div>
`;
}

// A control with its label beside it, as a form lays one out.
const labelled = (input: string, id: string, text: string) => `<div class="row">${input.replace('>', ` id="${id}">`)}<label class="af-label" for="${id}">${text}</label></div>`;

// A dashboard tile's width is a part of the page, so a chart is drawn wide and narrow. A tile is as tall as its content.
const WIDE = new Set<string>(['COLUMN_STACKED', 'BAR_GROUPED', 'LINE', 'PIE', 'MULTIPLES', 'COLUMN_RUNNING', 'COLUMN_FORMULA', 'LIST']);
const TILE_CELLS: { id: string; name: keyof typeof TILE_CASES; wide: boolean }[] = [
  ...(Object.keys(TILE_CASES) as (keyof typeof TILE_CASES)[]).map((name) => ({ id: name, name, wide: WIDE.has(name) })),
  { id: 'BAR_GROUPED_NARROW', name: 'BAR_GROUPED', wide: false },
];

// The view classes' own markup, which pane() sets into `.view-case` when it builds the pane.
function viewsMarkup(t: Theme): string {
  return `
        <div class="af-toolbar" data-testid="${t}-toolbar">
          <div class="af-toolbar-lead"><input class="af-input sm" placeholder="Search records" aria-label="Search records" style="max-width: 200px"><button type="button" class="af-button sm">Add filter</button></div>
          <span class="af-toolbar-divider"></span>
          <div class="af-toolbar-trail"><button type="button" class="af-button icon ghost sm" aria-label="Export">${DOWNLOAD}</button><button type="button" class="af-button icon sm" aria-label="Facets" aria-pressed="false">${PANEL}</button></div>
        </div>
        <div class="af-card-grid" data-testid="${t}-cards">${CARDS.map((c, i) => card(t, `card-${i}`, c)).join('')}</div>
        ${boardCase(t)}
        ${listCase(t)}
        ${monthCase(t)}
        ${weekCase(t)}
  `;
}

function markup(theme: Theme): string {
  const t = theme;
  return `
    <style>${KIT_CSS}</style>
    <style>${STYLE}</style>
    <div class="gallery af-kit">
      <h2>${theme === 'light' ? 'Light, English' : 'Dark, Tiếng Việt'}</h2>
      <div class="row">
        <button type="button" class="af-button primary" data-testid="${t}-open-dialog">Open dialog</button>
        <button type="button" class="af-button secondary" data-testid="${t}-open-side-panel">Open side panel</button>
        <button type="button" class="af-button danger" data-testid="${t}-open-confirm">Open confirm</button>
        <button type="button" class="af-button secondary" data-testid="${t}-show-toast">Show toast</button>
        <button type="button" class="af-button ghost" data-testid="${t}-show-error">Show error toast</button>
        <button type="button" class="af-button secondary" data-testid="${t}-open-invite">Invite people</button>
        <input class="field" data-testid="${t}-outside" placeholder="A field on the page" />
        <af-dialog heading="Rename project">
          <p>The new name shows everywhere the project is listed.</p>
          <input class="field" data-testid="${t}-dialog-field" placeholder="Project name" />
          <button slot="actions" type="button" class="af-button secondary" data-testid="${t}-dialog-cancel">Cancel</button>
          <button slot="actions" type="button" class="af-button primary" data-testid="${t}-dialog-save">Save</button>
        </af-dialog>
        <af-dialog heading="Invite people" data-testid="${t}-invite-dialog">
          <p>They each get an email with a link to the project.</p>
          <button slot="actions" type="button" class="af-button primary" data-testid="${t}-invite-send">Send invites</button>
        </af-dialog>
        <af-dialog heading="Filters" placement="end" data-testid="${t}-side-panel">
          <p>Show the tasks that match.</p>
          <af-select label="Status" placeholder="Choose a status" data-testid="${t}-panel-status"></af-select>
          <button slot="actions" type="button" class="af-button primary" data-testid="${t}-panel-save">Save</button>
        </af-dialog>
        <af-confirm heading="Delete this task?" message="Its checklist and attachments go with it." impact="2 comments are deleted too." confirm-label="Delete" danger></af-confirm>
        <af-toast></af-toast>
      </div>
      <div class="short-column">
        <div class="row">
          <af-menu label="Task actions">⋯</af-menu>
          <af-date clearable label="Due date"></af-date>
          <af-popover>
            <button slot="anchor" type="button" class="af-button secondary" data-testid="${t}-popover-anchor">Filters</button>
            <div slot="content">
              <input class="field" data-testid="${t}-popover-first" placeholder="Search" />
              <input class="field" data-testid="${t}-popover-second" placeholder="Label" />
              <af-tooltip text="Only tasks due this week">
                <button type="button" class="af-button ghost sm" data-testid="${t}-popover-hint">Due soon</button>
              </af-tooltip>
            </div>
          </af-popover>
          <af-tooltip text="Tasks due this week">
            <button type="button" class="af-button ghost" data-testid="${t}-tooltip-anchor">This week</button>
          </af-tooltip>
          <af-person-picker placeholder="Assign someone" label="Assignee"></af-person-picker>
        </div>
        <p>This column is 80px tall and scrolls, so an overlay drawn inside it would be cut off at its edge.</p>
        <p>Every overlay above opens into the top layer instead.</p>
      </div>
      <h2>Buttons</h2>
      <div class="row" data-testid="${t}-button-variants">
        ${BUTTON_VARIANTS.map(([cls, label]) => `<button type="button" class="${['af-button', cls].filter(Boolean).join(' ')}">${label}</button>`).join('')}
        <button type="button" class="af-button primary" aria-disabled="true">Locked</button>
      </div>
      <div class="row" data-testid="${t}-button-sizes">
        ${BUTTON_SIZES.map(([size, label]) => `<button type="button" class="af-button primary ${size}">${PLUS}${label}</button>`).join('')}
        ${BUTTON_SIZES.map(([size, label]) => `<button type="button" class="af-button icon ${size}" aria-label="Add, ${label}">${PLUS}</button>`).join('')}
      </div>
      <h2>Form controls</h2>
      <div class="stack" data-testid="${t}-form-fields">
        <label class="af-label" for="${t}-name">Name</label>
        <input id="${t}-name" class="af-input" placeholder="Ada Lovelace" />
        <label class="af-label" for="${t}-email">Email</label>
        <input id="${t}-email" class="af-input" type="email" value="ada@" aria-invalid="true" aria-describedby="${t}-email-error" />
        <span id="${t}-email-error" class="field-error">Enter a full address</span>
        <input class="af-input sm" placeholder="Compact" aria-label="Compact" />
        <textarea class="af-textarea" placeholder="Notes" aria-label="Notes"></textarea>
        <input class="af-input" value="Locked" disabled aria-label="Locked" />
      </div>
      <div class="row" data-testid="${t}-form-checks">
        ${labelled('<input type="checkbox" class="af-checkbox">', `${t}-c1`, 'Unchecked')}
        ${labelled('<input type="checkbox" class="af-checkbox" checked>', `${t}-c2`, 'Checked')}
        ${labelled('<input type="checkbox" class="af-checkbox" data-indeterminate>', `${t}-c3`, 'Some')}
        ${labelled('<input type="checkbox" class="af-checkbox" aria-invalid="true">', `${t}-c4`, 'Required')}
        ${labelled('<input type="checkbox" class="af-checkbox" checked disabled>', `${t}-c5`, 'Locked')}
        ${labelled(`<input type="radio" name="${t}-r" class="af-radio" checked>`, `${t}-r1`, 'Chosen')}
        ${labelled(`<input type="radio" name="${t}-r" class="af-radio">`, `${t}-r2`, 'Other')}
        ${labelled(`<input type="radio" name="${t}-r" class="af-radio" disabled>`, `${t}-r3`, 'Locked')}
      </div>
      <div class="row" data-testid="${t}-form-switches">
        ${labelled('<input type="checkbox" role="switch" class="af-switch">', `${t}-s1`, 'Off')}
        ${labelled('<input type="checkbox" role="switch" class="af-switch" checked>', `${t}-s2`, 'On')}
        ${labelled('<input type="checkbox" role="switch" class="af-switch sm" checked>', `${t}-s3`, 'Small')}
        ${labelled('<input type="checkbox" role="switch" class="af-switch" disabled>', `${t}-s4`, 'Locked')}
      </div>
      <div class="row" data-testid="${t}-form-toggles">
        <button type="button" class="af-toggle" aria-pressed="false">Bold</button>
        <button type="button" class="af-toggle" aria-pressed="true">Pressed</button>
        <button type="button" class="af-toggle outline" aria-pressed="false">Outline</button>
        <button type="button" class="af-toggle outline" aria-pressed="true">Pressed</button>
        <button type="button" class="af-toggle sm" aria-pressed="false">sm</button>
        <button type="button" class="af-toggle lg" aria-pressed="false">lg</button>
        <button type="button" class="af-toggle" aria-pressed="false" aria-label="Bold">${BOLD}</button>
        <button type="button" class="af-toggle" aria-pressed="false" disabled>Locked</button>
        <div class="af-segmented" role="radiogroup" aria-label="Range" data-testid="${t}-segmented">
          <label><input type="radio" name="${t}-range" value="day"><span>Day</span></label>
          <label><input type="radio" name="${t}-range" value="week" checked><span>Week</span></label>
          <label><input type="radio" name="${t}-range" value="month"><span>Month</span></label>
        </div>
      </div>
      <h2>Display</h2>
      <div class="row" data-testid="${t}-chips">
        <span class="af-chip">Active</span>
        <span class="af-chip secondary">Secondary</span>
        <span class="af-chip danger">Overdue</span>
        <span class="af-chip outline">Outline</span>
        <span class="af-chip neutral">Neutral</span>
        <span class="af-chip success">Done</span>
        <span class="af-chip warning">Waiting</span>
        <span class="af-chip info">Info</span>
        <a class="af-chip outline" href="#chips">${PLUS}A link</a>
      </div>
      <div class="stack" data-testid="${t}-banners">
        <div class="af-banner" role="alert">${INFO}<div class="af-banner-title">Heads up</div><div class="af-banner-description">Your changes are not saved yet.</div></div>
        <div class="af-banner info" role="alert">${INFO}<div class="af-banner-title">Syncing</div><div class="af-banner-description">New rows appear as they arrive.</div></div>
        <div class="af-banner success" role="status">${INFO}<div class="af-banner-title">Signed</div><div class="af-banner-description">Waiting for the other signers.</div></div>
        <div class="af-banner warning" role="alert">${INFO}<div class="af-banner-title">Nearly full</div><div class="af-banner-description">Most of the storage is used.</div></div>
        <div class="af-banner danger" role="alert">${INFO}<div class="af-banner-title">Could not save</div><div class="af-banner-description">The server is unreachable.</div></div>
        <div class="af-banner danger" role="alert">A banner of bare text fills the width.</div>
      </div>
      <div class="row" data-testid="${t}-avatars">
        <span class="af-avatar sm"><span class="af-avatar-initials">LM</span><img alt="" data-testid="${t}-avatar-none" /></span>
        <span class="af-avatar" data-hue="3"><span class="af-avatar-initials">TH</span><img alt="" data-testid="${t}-avatar-failed" data-failed src="/missing-avatar.png" /></span>
        <span class="af-avatar lg" data-hue="6"><span class="af-avatar-initials">PL</span><img alt="" data-testid="${t}-avatar-broken" src="/missing-avatar.png" /></span>
        <span class="af-avatar"><span class="af-avatar-initials">ĐĐ</span><img alt="" data-testid="${t}-avatar-loaded" src="${PICTURE}" /></span>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map((hue) => `<span class="af-avatar" data-hue="${hue}">H${hue}</span>`).join('')}
      </div>
      <div class="row" data-testid="${t}-progress">
        <progress class="af-progress" style="width: 160px" value="40" max="100" aria-label="Upload"></progress>
        ${[0, 25, 75, 100].map((n) => `<progress class="af-progress circular" value="${n}" max="100" style="--af-progress: ${n / 100}" aria-label="Upload ${n}%"></progress>`).join('')}
        <span class="af-spinner" data-testid="${t}-spinner" aria-hidden="true"></span>
      </div>
      <div class="row" data-testid="${t}-tabs">
        <div role="tablist" class="af-tabs" aria-label="Sections">
          <button type="button" role="tab" aria-selected="true">Overview</button>
          <button type="button" role="tab" aria-selected="false" tabindex="-1">Activity</button>
          <button type="button" role="tab" aria-selected="false" tabindex="-1" disabled>Locked</button>
        </div>
        <div role="tablist" class="af-tabs line" aria-label="Sections">
          <button type="button" role="tab" aria-selected="true">Overview</button>
          <button type="button" role="tab" aria-selected="false" tabindex="-1">Activity</button>
        </div>
        <div role="tablist" class="af-tabs segmented" aria-label="Range">
          <button type="button" role="tab" aria-selected="true">Day</button>
          <button type="button" role="tab" aria-selected="false" tabindex="-1">Week</button>
        </div>
      </div>
      <div class="stack" data-testid="${t}-skeletons" aria-hidden="true">
        <div class="af-skeleton row"></div>
        <div class="af-skeleton card"></div>
        <div class="af-skeleton block"></div>
      </div>
      <div class="stack wide" data-testid="${t}-empty">
        <div class="af-empty">${SEARCH_X}<p class="af-empty-title">No records match this view.</p><p class="af-empty-body">Try another filter, or clear the search to see every record again.</p><button type="button" class="af-button sm">Clear search</button></div>
        <div class="af-empty boxed">${SEARCH_X}<p class="af-empty-title">Nothing in the trash.</p><p class="af-empty-body">Records you delete stay here for thirty days.</p></div>
      </div>
      <div class="stack wide" data-testid="${t}-error">
        <div class="af-error" role="alert">
          <span class="af-error-icon">${ALERT}</span>
          <h2 class="af-error-title">Something went wrong</h2>
          <p class="af-error-body">The page could not be shown. Try again, or reload it.</p>
          <div class="af-error-actions"><button type="button" class="af-button primary sm">Try again</button><button type="button" class="af-button sm">Reload page</button></div>
          <details class="af-error-details" open><summary>Technical details</summary><af-scroll-area label="Technical details"><pre>Reference: 8f3a1c\nTypeError: Failed to fetch\n${TRACE}</pre></af-scroll-area></details>
        </div>
      </div>
      <div class="stack wide" data-testid="${t}-repeater">
        <div class="af-repeater">
          <div class="af-repeater-row" aria-label="Row 1" style="--af-repeater-columns: 2">
            <div class="af-repeater-head"><button type="button" class="af-drag-handle" aria-label="Drag row 1">${GRIP}</button><span>Row 1</span><button type="button" class="af-repeater-remove">Remove</button></div>
            <div class="af-repeater-fields"><input class="af-input" aria-label="Item" value="Venue" /><input class="af-input" aria-label="Owner" value="Minh" /></div>
          </div>
          <div class="af-repeater-row" aria-label="Row 2" data-dragging style="--af-repeater-columns: 2">
            <div class="af-repeater-head"><button type="button" class="af-drag-handle" aria-label="Drag row 2">${GRIP}</button><span>Row 2</span><button type="button" class="af-repeater-remove">Remove</button></div>
            <div class="af-repeater-fields"><input class="af-input" aria-label="Item" value="Invitations" /><input class="af-input" aria-label="Owner" value="Hoa" /></div>
          </div>
          <button type="button" class="af-button sm">Add row</button>
        </div>
        <div class="af-repeater"><p class="af-repeater-empty">No rows yet.</p><button type="button" class="af-button sm">Add row</button></div>
      </div>
      <div class="stack wide" data-testid="${t}-repeater-line">
        <div class="af-repeater">
          <div class="af-repeater-row line">
            <button type="button" class="af-drag-handle" aria-label="Drag row 1">${GRIP}</button>
            <div class="af-repeater-fields" style="--af-repeater-columns: 2"><input class="af-input" aria-label="Item" value="Venue" /><input class="af-input" aria-label="Owner" value="Minh" /></div>
            <button type="button" class="af-button ghost icon sm" aria-label="Remove row 1">${CLOSE}</button>
          </div>
          <div class="af-repeater-row line" data-dragging>
            <button type="button" class="af-drag-handle" aria-label="Drag row 2" aria-pressed="true">${GRIP}</button>
            <div class="af-repeater-fields" style="--af-repeater-columns: 2"><input class="af-input" aria-label="Item" value="Invitations" /><input class="af-input" aria-label="Owner" value="Hoa" /></div>
            <button type="button" class="af-button ghost icon sm" aria-label="Remove row 2">${CLOSE}</button>
          </div>
          <div class="af-repeater-row line" data-testid="${t}-repeater-stacked">
            <button type="button" class="af-drag-handle" aria-label="Drag row 3">${GRIP}</button>
            <div class="af-repeater-fields" style="--af-repeater-columns: 2"><input class="af-input" aria-label="Item" value="Catering" /><input class="af-input" aria-label="Owner" value="Lan" /></div>
            <p class="af-field-description">Two children in the middle start together.</p>
            <button type="button" class="af-button ghost icon sm" aria-label="Remove row 3">${CLOSE}</button>
          </div>
          <div class="af-repeater-row" data-testid="${t}-repeater-headless"><div class="af-repeater-fields" style="--af-repeater-columns: 2"><input class="af-input" aria-label="Item" value="Read-only" readonly /><input class="af-input" aria-label="Owner" value="Minh" readonly /></div></div>
          <button type="button" class="af-button sm">Add row</button>
        </div>
      </div>
      <div class="row" data-testid="${t}-file-chips">
        <span class="af-file-chip">${PAPERCLIP}<button type="button" class="af-file-chip-name">report.pdf</button><a class="af-file-chip-download" href="#download" download aria-label="Download report.pdf">${DOWNLOAD}</a></span>
        <span class="af-file-chip">${PAPERCLIP}<button type="button" class="af-file-chip-name">quarterly-results-for-the-whole-group-including-every-subsidiary-final-v3.pdf</button><a class="af-file-chip-download" href="#download" download aria-label="Download the quarterly results">${DOWNLOAD}</a></span>
        <span class="af-file-chip" data-unresolved>${PAPERCLIP}<span class="af-file-chip-name">File not available</span></span>
      </div>
      ${tableCase(t)}
      <h2>Page structure classes</h2>
      <div class="stack wide" data-testid="${t}-page-structure">
        <nav class="af-breadcrumb" aria-label="Breadcrumb" data-testid="${t}-breadcrumb"><ol><li><a href="#entities">Entities</a></li><li><a href="#invoices">Invoices</a></li><li><a href="#inv-0042" aria-current="page">INV-0042</a></li></ol></nav>
        <nav class="af-breadcrumb eyebrow" aria-label="Section" data-testid="${t}-breadcrumb-eyebrow"><ol><li><a href="#entities">Entities</a></li></ol></nav>
        <div class="af-disclosure" data-testid="${t}-disclosure">
          <button type="button" class="af-disclosure-toggle" aria-expanded="true" aria-controls="${t}-disclosure-body" data-testid="${t}-disclosure-toggle">${CHEVRON}<span>Details</span></button>
          <div id="${t}-disclosure-body" class="af-disclosure-body" data-testid="${t}-disclosure-content">Issued on 5 November, due in thirty days.</div>
        </div>
        <div class="af-disclosure eyebrow" data-testid="${t}-disclosure-eyebrow">
          <button type="button" class="af-disclosure-toggle" aria-expanded="false" aria-controls="${t}-disclosure-eyebrow-body">${CHEVRON}<span>Payment</span></button>
          <div id="${t}-disclosure-eyebrow-body" class="af-disclosure-body">Two instalments, the second after delivery.</div>
        </div>
        <dl class="af-dl" style="--af-dl-columns: 2" data-testid="${t}-dl">
          <div class="af-dl-item"><dt>Customer</dt><dd>Hà Nội Trading</dd></div>
          <div class="af-dl-item"><dt>Status</dt><dd>Open</dd></div>
          <div class="af-dl-item" style="--af-dl-span: 2"><dt>Invoice number</dt><dd>INV-0042 <af-copy-button value="INV-0042" label="Copy the invoice number"></af-copy-button></dd></div>
        </dl>
        <div class="row" data-testid="${t}-stats">
          <div class="af-stat" style="width: 160px"><div class="af-stat-label"><span class="af-stat-dot" style="--af-stat-color: var(--af-warning)"></span>Open</div><div class="af-stat-value" data-tone="warning">42</div><div class="af-stat-note">this week</div></div>
          <div class="af-stat plain" style="width: 120px"><div class="af-stat-label">Paid</div><div class="af-stat-value">1.240</div></div>
        </div>
        ${timeline(t, false)}
        ${timeline(t, true)}
        <ol class="af-steps" aria-label="Progress" data-testid="${t}-steps">
          <li class="af-step" data-state="done"><span class="af-step-marker">${CHECK}</span><span class="af-step-label">Validate</span></li>
          <li class="af-step" data-state="current"><span class="af-step-marker">2</span><span class="af-step-label">Review</span></li>
          <li class="af-step" data-state="todo"><span class="af-step-marker">3</span><span class="af-step-label">Approve</span></li>
          <li class="af-step" data-state="failed"><span class="af-step-marker">4</span><span class="af-step-label">Publish</span></li>
        </ol>
      </div>
      <h2>View classes</h2>
      <div class="view-case" data-testid="${t}-views"></div>
      <h2>Filter classes</h2>
      ${filtersMarkup(t)}
      <af-rich-editor placeholder="Describe the task" label="Description"></af-rich-editor>
      <h2>af-number-input</h2>
      <div class="row" data-testid="${t}-numbers">
        <af-number-input min="0" max="10" steppers label="Quantity" data-case="quantity"></af-number-input>
        <af-number-input format="currency" currency="VND" step="1000" label="Amount" data-case="amount"></af-number-input>
        <af-number-input format="percent" placeholder="Discount" label="Discount" data-case="discount"></af-number-input>
        <af-number-input fractional label="Weight" data-case="weight"></af-number-input>
        <af-number-input format="percent" unscaled label="Rate" data-case="rate"></af-number-input>
        <af-number-input fractional label="Unit price" data-case="price"></af-number-input>
      </div>
      <h2>af-select</h2>
      <div class="row" data-testid="${t}-selects">
        <af-select label="Status" placeholder="Choose a status" data-case="status"></af-select>
        <af-select multiple label="Labels" placeholder="Choose labels" data-case="labels"></af-select>
        <af-select label="Queue" placeholder="No queues yet" data-case="empty"></af-select>
      </div>
      <h2>Inside a page's own dialog</h2>
      <div class="row">
        <button type="button" class="af-button secondary" data-testid="${t}-open-page-dialog">Open page dialog</button>
        <div role="dialog" aria-label="Page dialog" data-testid="${t}-page-dialog" hidden>
          <p>The page's own dialog closes on Escape, unless a kit overlay inside it is open.</p>
          <af-select label="Status" placeholder="Choose a status" data-case="in-page-dialog"></af-select>
        </div>
      </div>
      <h2>af-combobox</h2>
      <div class="row" data-testid="${t}-comboboxes">
        <af-combobox multiple label="Cities" placeholder="Find a city" data-case="cities" style="width: 320px"></af-combobox>
        <af-combobox label="Place" placeholder="Find a place" data-case="places" style="width: 320px"></af-combobox>
      </div>
      <h2>af-person-picker over a source</h2>
      <div class="row">
        <af-person-picker label="Owner" placeholder="Find someone" data-case="directory" style="width: 320px"></af-person-picker>
      </div>
      <h2>af-tree-picker</h2>
      <div class="row" data-testid="${t}-tree-pickers">
        <af-tree-picker label="Office" placeholder="Find an office" data-case="office" style="width: 320px"></af-tree-picker>
        <af-tree-picker multiple max="2" label="Offices" placeholder="Find up to two offices" data-case="offices" style="width: 320px"></af-tree-picker>
      </div>
      <h2>af-file-upload</h2>
      <div class="row">
        <af-file-upload accept="image/*,.pdf" multiple max-files="3" name="attachments" data-testid="${t}-file-upload" style="width: 360px"></af-file-upload>
        <af-file-upload replace max-files="1" accept=".pdf" label="Contract" data-testid="${t}-file-replace" style="width: 360px"></af-file-upload>
      </div>
      <h2>af-signature-pad</h2>
      <div class="row">
        <af-signature-pad name="signature" data-testid="${t}-signature" style="width: 420px"></af-signature-pad>
        <af-signature-pad readonly label="${t === 'light' ? 'Approver signature' : 'Chữ ký người duyệt'}" data-testid="${t}-signature-signed" style="width: 300px"></af-signature-pad>
      </div>
      <h2>af-folder-source</h2>
      <div class="row">
        <af-folder-source workflow="wf-dossiers" field="files" data-testid="${t}-folder-source" style="width: 420px"></af-folder-source>
      </div>
      <h2>af-date range</h2>
      <div class="row">
        <af-date range clearable label="Window" data-testid="${t}-date-range"></af-date>
      </div>
      <h2>af-date format</h2>
      <div class="row" data-testid="${t}-date-masks">
        ${['DD/MM/YYYY', 'DD-MM-YYYY', 'DD.MM.YYYY', 'YYYY-MM-DD'].map((mask) => `<af-date format="${mask}" label="${mask}" value="2026-02-20" data-case="${mask}"></af-date>`).join('')}
      </div>
      <h2>af-menu tones and a locked trigger</h2>
      <div class="row" data-testid="${t}-menu-states">
        <af-menu label="Step actions" data-testid="${t}-menu-tones">⋯</af-menu>
        <af-menu label="More actions" disabled reason="Saving the step" data-testid="${t}-menu-locked">⋯</af-menu>
      </div>
      <h2>af-field and af-fieldset</h2>
      <af-fieldset heading="Contact" description="How to reach the customer" columns="2" data-testid="${t}-section">
        <fieldset>
          <af-field label="Email" description="A work address" required error="Enter an email" data-span="2" data-testid="${t}-field-email">
            <input class="af-input" name="email" type="email">
          </af-field>
          <af-field label="Status" description="Who sees it" data-testid="${t}-field-status"><af-select name="status"></af-select></af-field>
          <af-field label="Owner" locked-reason="Set by the workflow" data-col="2" data-testid="${t}-field-owner">
            <input class="af-input" name="owner" value="Trần Hoa">
          </af-field>
          <af-field label="Priority" data-span="2" data-testid="${t}-field-priority">
            <div role="radiogroup" class="row">${labelled('<input type="radio" class="af-radio" name="priority" value="low" checked>', `${t}-priority-low`, 'Low')}${labelled('<input type="radio" class="af-radio" name="priority" value="high">', `${t}-priority-high`, 'High')}</div>
            <span slot="aside" class="af-chip neutral">AI</span>
          </af-field>
        </fieldset>
      </af-fieldset>
      <af-fieldset heading="Dates" columns="4" data-testid="${t}-section-four">
        <af-field label="Opened" data-testid="${t}-four-opened"><input class="af-input" name="opened" value="2026-11-02"></af-field>
        <af-field label="Due" edited description="Changed from the suggested date" data-span="2" data-testid="${t}-four-due"><input class="af-input" name="due" value="2026-11-20"></af-field>
        <af-field label="Cost" edited data-testid="${t}-four-cost"><af-number-input name="cost" value="1200"></af-number-input></af-field>
        <af-field label="Notes" data-span="4"><textarea class="af-textarea" name="notes"></textarea></af-field>
      </af-fieldset>
      <h2>Form controls in a form</h2>
      <form class="stack" data-testid="${t}-form">
        <fieldset class="stack" data-testid="${t}-form-fieldset">
          <af-date name="due" required label="Due date" data-testid="${t}-form-date"></af-date>
          <af-person-picker name="who" multiple label="Assignees" data-testid="${t}-form-who"></af-person-picker>
        </fieldset>
        ${labelled('<input type="checkbox" class="af-checkbox">', `${t}-form-lock`, 'Disable the fieldset')}
        <div class="row">
          <button type="reset" class="af-button" data-testid="${t}-form-reset">Reset</button>
          <button type="submit" class="af-button primary" data-testid="${t}-form-submit">Submit</button>
        </div>
        <output data-testid="${t}-form-data"></output>
      </form>
      <h2>af-form</h2>
      <af-form data-testid="${t}-whole-form">
        <form class="stack">
          <af-fieldset heading="New request" description="Saving takes a second and a half and answers with three errors" columns="2">
            <fieldset>
              <af-field label="Title" required data-span="2"><input class="af-input" name="title" value="Ship the release"></af-field>
              <af-field label="Status"><af-select name="status" data-testid="${t}-whole-status"></af-select></af-field>
              <af-field label="City"><af-combobox name="city" data-testid="${t}-whole-city"></af-combobox></af-field>
              <af-field label="Quantity"><af-number-input name="qty" steppers data-testid="${t}-whole-qty"></af-number-input></af-field>
              <af-field label="Due date"><af-date name="due" data-testid="${t}-whole-due"></af-date></af-field>
              <af-field label="Branches" data-span="2"><af-combobox name="branches" multiple data-testid="${t}-whole-branches"></af-combobox></af-field>
            </fieldset>
          </af-fieldset>
          <div class="row"><button class="af-button primary" data-testid="${t}-whole-save">Save</button></div>
        </form>
      </af-form>
      <h2>af-scroll-area</h2>
      <input class="field" data-testid="${t}-scroll-before" placeholder="A field before the scroll area" />
      <af-scroll-area class="scroll-case" label="${t === 'light' ? 'Fifty rows' : 'Năm mươi dòng'}" data-testid="${t}-scroll-area">
        <div class="scroll-head" data-testid="${t}-scroll-head">${t === 'light' ? 'Rows' : 'Các dòng'}</div>
        ${Array.from({ length: 50 }, (_, i) => `<div class="scroll-row">${t === 'light' ? 'Row' : 'Dòng'} ${i + 1}</div>`).join('')}
      </af-scroll-area>
      <h2>af-tabs</h2>
      <af-tabs label="${t === 'light' ? 'Record sections' : 'Các phần của bản ghi'}" data-testid="${t}-tabs-element">
        <div slot="overview" class="stack">${t === 'light' ? 'The record at a glance: its status, owner and due date.' : 'Tóm tắt bản ghi: trạng thái, người phụ trách và hạn.'}</div>
        <div slot="activity" class="stack">${t === 'light' ? 'Comments and changes, newest first.' : 'Bình luận và thay đổi, mới nhất trước.'}</div>
        <div slot="audit" class="stack">${t === 'light' ? 'Every change, with who made it.' : 'Mọi thay đổi và người thực hiện.'}</div>
      </af-tabs>
      <h2>af-splitter</h2>
      <af-splitter class="split-case" size="40" label="${t === 'light' ? 'Resize the list' : 'Đổi kích thước danh sách'}" data-testid="${t}-splitter">
        <af-scroll-area slot="start"><ul>${Array.from({ length: 12 }, (_, i) => `<li>${t === 'light' ? 'Record' : 'Bản ghi'} ${i + 1}</li>`).join('')}</ul></af-scroll-area>
        <af-scroll-area slot="end"><ul>${Array.from({ length: 12 }, (_, i) => `<li>${t === 'light' ? 'Field' : 'Trường'} ${i + 1}</li>`).join('')}</ul></af-scroll-area>
      </af-splitter>
      <h2>af-pager</h2>
      <af-scroll-area class="pager-list"><ol id="${t}-page-rows"></ol></af-scroll-area>
      <af-pager controls="${t}-page-rows" data-testid="${t}-pager"></af-pager>
      <af-scroll-area class="pager-list"><ul id="${t}-more-rows"></ul></af-scroll-area>
      <af-pager mode="more" focus-new controls="${t}-more-rows" data-testid="${t}-more-pager"></af-pager>
      <h2>af-copy-button</h2>
      <div class="row"><code>INV-0042</code><af-copy-button value="INV-0042" data-testid="${t}-copy-button"></af-copy-button></div>
      <h2>af-bulk-bar</h2>
      <af-scroll-area class="bulk-list" label="${t === 'light' ? 'Invoices' : 'Hóa đơn'}" data-testid="${t}-bulk-list">
        <ul>${Array.from({ length: 8 }, (_, i) => `<li><label><input type="checkbox" class="af-checkbox" />${t === 'light' ? 'Invoice' : 'Hóa đơn'} 00${i + 1}</label></li>`).join('')}</ul>
        <af-bulk-bar data-testid="${t}-bulk-bar">
          <button slot="actions" type="button" class="af-button ghost sm">${t === 'light' ? 'Assign' : 'Giao việc'}</button>
          <button slot="actions" type="button" class="af-button ghost sm bulk-wide">${t === 'light' ? 'Send a reminder to each owner' : 'Nhắc từng người phụ trách'}</button>
          <button slot="actions" type="button" class="af-button ghost sm">${t === 'light' ? 'Export' : 'Xuất'}</button>
          <button slot="actions" type="button" class="af-button ghost sm bulk-wide" disabled>${t === 'light' ? 'Move to another workspace' : 'Chuyển sang không gian khác'}</button>
          <button slot="actions" type="button" class="af-button ghost sm">${t === 'light' ? 'Archive' : 'Lưu trữ'}</button>
        </af-bulk-bar>
      </af-scroll-area>
      <h2>af-markdown</h2>
      <af-markdown class="markdown-case" data-testid="${t}-markdown"></af-markdown>
      <h2>Board cost</h2>
      <div class="row"><button type="button" class="af-button secondary" data-testid="${t}-build-board">Build a board of 40 columns of 60 cards</button></div>
      <div class="board-cost" data-testid="${t}-board-cost"></div>
      <h2>af-tile</h2>
      <div class="tiles">
        ${TILE_CELLS.map((cell) => `<div class="tile-cell${cell.wide ? ' wide' : ''}" data-case="${cell.id}"><af-tile></af-tile></div>`).join('')}
      </div>
    </div>
  `;
}

const pause = (ms: number) => new Promise((done) => setTimeout(done, ms));
let pretendSets = 0;
async function pretendUpload(count: number, opts: Parameters<FolderSources['uploadFiles']>[1]) {
  const id = `set-${++pretendSets}`;
  opts.onSetCreated?.(id);
  for (let stored = 0; stored <= count; stored++) {
    opts.signal?.throwIfAborted();
    opts.onProgress?.({ stored, total: count });
    if (stored < count) await pause(150);
  }
  return { value: { $fileSet: id }, refused: [] };
}
const FOLDER_SOURCES: FolderSources = {
  watched: async () => [
    { id: 'court-scans', name: 'Court scans', source: 'sftp', status: 'open', entry_count: 20_860, last_scan_at: '2026-11-09T02:00:00Z' },
    { id: 'archive', name: 'Archive', source: 'sftp', status: 'open', entry_count: 412, last_scan_at: null },
  ],
  subfolders: async (_set, path, cursor) => {
    await pause(200);
    if (path) return { items: [], next_cursor: null };
    const batch = (i: number) => ({ name: `batch-${String(i).padStart(2, '0')}`, path: `batch-${String(i).padStart(2, '0')}`, file_count: 40 + i, settled_count: i === 3 ? 12 : 40 + i });
    return cursor ? { items: [4, 5, 6].map(batch), next_cursor: null } : { items: [1, 2, 3].map(batch), next_cursor: 'next' };
  },
  preview: async (_workflow, field) => {
    await pause(200);
    return {
      field, grain: 'folder', depth: 1, group_count: 1043, item_count: 20_860, sample_keys: ['HS-481', 'HS-482', 'HS-483'], loose_file_count: 318, excluded_count: 41,
      excluded_by_reason: { NOT_IN_A_FOLDER: 1, NOT_SETTLED: 22, NO_MARKER: 9, TOO_MANY_FILES: 3, BELOW_MIN_ITEMS: 2, ABOVE_MAX_ITEMS: 1, FILE_TOO_LARGE: 3 }, refusal: null,
    };
  },
  uploadFolder: (files, opts) => pretendUpload(files.length, opts),
  uploadFiles: (files, opts) => pretendUpload(files.length, opts),
  deleteSet: async () => {},
};

function log(theme: Theme, el: Element, type: string) {
  el.addEventListener(type, (e) => events.push({ theme, tag: el.localName, type, detail: (e as CustomEvent).detail }));
}

// A signature as the pad exports one, in any theme: dark ink on a transparent PNG at twice the size it is shown.
function drawnSignature(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 576;
  const ink = canvas.getContext('2d')!;
  ink.scale(2, 2);
  ink.strokeStyle = '#0f172a';
  ink.lineWidth = 1.8;
  ink.lineCap = 'round';
  ink.beginPath();
  ink.moveTo(40, 190);
  ink.bezierCurveTo(70, 90, 100, 90, 110, 170);
  ink.bezierCurveTo(120, 230, 150, 110, 175, 150);
  ink.bezierCurveTo(195, 185, 215, 120, 260, 160);
  ink.stroke();
  return canvas.toDataURL('image/png');
}

function pane(parent: HTMLElement, theme: Theme): void {
  const host = document.createElement('div');
  host.className = 'af-app';
  applyTheme(host, { mode: theme, brand: 'azure' }, AF_DEFAULT_PALETTE);
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = markup(theme);
  // Connected first, so each element is upgraded before its properties are set.
  parent.append(host);
  const locale = theme === 'light' ? 'en' : 'vi';
  const one = <T extends Element = Settable>(selector: string) => root.querySelector(selector) as unknown as T;

  for (const el of root.querySelectorAll('af-dialog, af-confirm, af-menu, af-popover, af-tooltip, af-toast, af-date, af-person-picker, af-number-input, af-select, af-combobox, af-rich-editor, af-tile, af-field, af-fieldset, af-form, af-scroll-area, af-tabs, af-splitter, af-pager, af-copy-button, af-markdown, af-tree-picker, af-bulk-bar, af-file-upload, af-signature-pad, af-folder-source')) {
    (el as Settable).locale = locale;
    el.setAttribute('data-theme', theme);
  }

  // An avatar image that fails to load is marked, so the initials beneath it show.
  for (const image of root.querySelectorAll('.af-avatar img')) image.addEventListener('error', () => image.setAttribute('data-failed', ''));

  // No attribute sets a checkbox's mixed state; it is a property.
  one<HTMLInputElement>('[data-indeterminate]').indeterminate = true;

  const dialog = one('af-dialog');
  log(theme, dialog, 'close');
  dialog.addEventListener('close', () => {
    if (!dialog.hasAttribute('data-keep-open')) dialog.open = false;
  });
  one(`[data-testid="${theme}-open-dialog"]`).addEventListener('click', () => (dialog.open = true));
  for (const id of ['cancel', 'save']) one(`[data-testid="${theme}-dialog-${id}"]`).addEventListener('click', () => (dialog.open = false));

  const invite = one(`[data-testid="${theme}-invite-dialog"]`);
  invite.addEventListener('close', () => {
    if (!invite.hasAttribute('data-keep-open')) invite.open = false;
  });
  one(`[data-testid="${theme}-open-invite"]`).addEventListener('click', () => (invite.open = true));

  const panel = one(`[data-testid="${theme}-side-panel"]`);
  log(theme, panel, 'close');
  panel.addEventListener('close', () => (panel.open = false));
  one(`[data-testid="${theme}-open-side-panel"]`).addEventListener('click', () => (panel.open = true));
  one(`[data-testid="${theme}-panel-save"]`).addEventListener('click', () => (panel.open = false));
  const panelStatus = one(`[data-testid="${theme}-panel-status"]`);
  panelStatus.options = STATUSES;
  panelStatus.value = null;
  panelStatus.addEventListener('change', (e) => (panelStatus.value = (e as CustomEvent<{ value: string | null }>).detail.value));

  const confirm = one('af-confirm');
  log(theme, confirm, 'confirm');
  log(theme, confirm, 'cancel');
  for (const type of ['confirm', 'cancel']) {
    confirm.addEventListener(type, () => {
      if (!confirm.hasAttribute('data-keep-open')) confirm.open = false;
    });
  }
  one(`[data-testid="${theme}-open-confirm"]`).addEventListener('click', () => (confirm.open = true));

  const toast = one<ToastElement>('af-toast');
  log(theme, toast, 'action');
  one(`[data-testid="${theme}-show-toast"]`).addEventListener('click', () => toast.show({ kind: 'success', text: theme === 'light' ? 'Task completed' : 'Đã hoàn thành task' }));
  one(`[data-testid="${theme}-show-error"]`).addEventListener('click', () =>
    toast.show({ kind: 'error', text: theme === 'light' ? 'Could not save' : 'Không lưu được', action: { id: 'retry', label: theme === 'light' ? 'Retry' : 'Thử lại' } }),
  );

  // The page's one toast region sits beside the dialogs, as AgentFlow's will, so a dialog's own button raises a toast from outside it.
  one(`[data-testid="${theme}-invite-send"]`).addEventListener('click', () =>
    toast.show({ kind: 'error', text: theme === 'light' ? 'Could not send the invites' : 'Không gửi được lời mời', action: { id: 'retry-invite', label: theme === 'light' ? 'Retry' : 'Thử lại' } }),
  );

  const menu = one('af-menu');
  const view = { sort: 'sort-due', archived: false };
  menu.items = menuEntries(view.sort, view.archived);
  log(theme, menu, 'select');
  menu.addEventListener('select', (e) => {
    const { id, checked } = (e as CustomEvent<{ id: string; checked?: boolean }>).detail;
    if (SORTS.some((s) => s.id === id)) view.sort = id;
    else if (id === 'show-archived') view.archived = !!checked;
    else return;
    menu.items = menuEntries(view.sort, view.archived);
  });

  for (const toned of root.querySelectorAll<Settable>(`[data-testid="${theme}-menu-states"] af-menu`)) toned.items = TONED;

  const date = one('af-date');
  date.value = '2026-09-15';
  log(theme, date, 'change');
  date.addEventListener('change', (e) => (date.value = (e as CustomEvent<{ value: string | null }>).detail.value));

  // Each preset mask shows the same day; typed text that does not parse in it stays, marked, until it is corrected.
  for (const masked of root.querySelectorAll<Settable>(`[data-testid="${theme}-date-masks"] af-date`)) {
    log(theme, masked, 'change');
    masked.addEventListener('change', (e) => (masked.value = (e as CustomEvent<{ value: string | null }>).detail.value));
  }

  const span = one<Settable & { start: string | null; end: string | null }>(`[data-testid="${theme}-date-range"]`);
  span.start = '2026-09-07';
  span.end = '2026-09-18';
  log(theme, span, 'change');
  span.addEventListener('change', (e) => {
    const { start, end } = (e as CustomEvent<{ start: string | null; end: string | null }>).detail;
    span.start = start;
    span.end = end;
  });

  const popover = one('af-popover');
  log(theme, popover, 'close');
  popover.addEventListener('close', () => (popover.open = false));
  one(`[data-testid="${theme}-popover-anchor"]`).addEventListener('click', () => (popover.open = true));

  const picker = one('af-person-picker');
  picker.people = PEOPLE;
  picker.value = 'p-hoa';
  log(theme, picker, 'change');
  log(theme, picker, 'search');
  picker.addEventListener('change', (e) => (picker.value = (e as CustomEvent<{ value: string | null }>).detail.value));

  const directory = one('af-person-picker[data-case="directory"]');
  directory.source = PERSON_SOURCE;
  log(theme, directory, 'change');
  log(theme, directory, 'search');
  directory.addEventListener('change', (e) => (directory.value = (e as CustomEvent<{ value: string | null }>).detail.value));

  for (const [name, value] of [['quantity', 3], ['amount', 1500000], ['discount', 0.15], ['weight', 1234.567], ['rate', 12.5], ['price', 1234.5]] as const) {
    const number = one(`af-number-input[data-case="${name}"]`);
    number.value = value;
    log(theme, number, 'change');
    number.addEventListener('change', (e) => (number.value = (e as CustomEvent<{ value: number | null }>).detail.value));
  }

  for (const [name, options, value] of [['status', STATUSES, 'open'], ['labels', LABELS, ['bug', 'urgent']], ['empty', [], null]] as const) {
    const select = one(`af-select[data-case="${name}"]`);
    select.options = options;
    select.value = value;
    log(theme, select, 'change');
    select.addEventListener('change', (e) => (select.value = (e as CustomEvent<{ value: string | string[] | null }>).detail.value));
  }

  // The page's own layer, as a Radix dialog is: it hears Escape on the document before any kit overlay opened inside it,
  // and hands the key to one that is open instead of closing.
  const pageDialog = one<HTMLElement>(`[data-testid="${theme}-page-dialog"]`);
  const inPageDialog = one('af-select[data-case="in-page-dialog"]');
  inPageDialog.options = STATUSES;
  inPageDialog.value = null;
  inPageDialog.addEventListener('change', (e) => (inPageDialog.value = (e as CustomEvent<{ value: string | null }>).detail.value));
  const onPageDialogKey = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    if (claimEscape(e, pageDialog)) return;
    pageDialog.hidden = true;
    document.removeEventListener('keydown', onPageDialogKey, { capture: true });
  };
  one(`[data-testid="${theme}-open-page-dialog"]`).addEventListener('click', () => {
    pageDialog.hidden = false;
    document.addEventListener('keydown', onPageDialogKey, { capture: true });
  });

  for (const [name, props] of [['cities', { options: CITIES, value: ['hn', 'dn'] }], ['places', { source: PLACE_SOURCE, value: 'place-127' }]] as const) {
    const combobox = one(`af-combobox[data-case="${name}"]`);
    Object.assign(combobox, props);
    log(theme, combobox, 'change');
    log(theme, combobox, 'search');
    combobox.addEventListener('change', (e) => (combobox.value = (e as CustomEvent<{ value: string | string[] | null }>).detail.value));
  }

  for (const [name, value] of [['office', 'hanoi'], ['offices', ['danang']]] as const) {
    const tree = one(`af-tree-picker[data-case="${name}"]`);
    Object.assign(tree, { nodes: UNITS, value });
    log(theme, tree, 'change');
    log(theme, tree, 'search');
    tree.addEventListener('change', (e) => (tree.value = (e as CustomEvent<{ value: string | string[] | null }>).detail.value));
  }

  // The page uploads: a file it is given shows as uploading and is done a moment later; a remove takes the row out.
  const upload = one<HTMLElement & { items: FileItem[] }>(`[data-testid="${theme}-file-upload"]`);
  upload.items = [
    { id: 'contract', name: theme === 'light' ? 'contract.pdf' : 'hop-dong.pdf', size: 248_000, status: 'done', href: '#contract' },
    { id: 'site-photo', name: theme === 'light' ? 'site-photo.jpg' : 'anh-cong-trinh.jpg', size: 3_400_000, status: 'uploading', progress: 45 },
  ];
  log(theme, upload, 'files-add');
  log(theme, upload, 'remove');
  let uploaded = 0;
  upload.addEventListener('files-add', (e) => {
    for (const file of (e as CustomEvent<{ files: File[] }>).detail.files) {
      const id = `upload-${++uploaded}`;
      upload.items = [...upload.items, { id, name: file.name, size: file.size, status: 'uploading', progress: 30 }];
      setTimeout(() => (upload.items = upload.items.map((item) => (item.id === id ? { ...item, status: 'done', progress: null } : item))), 800);
    }
  });
  upload.addEventListener('remove', (e) => (upload.items = upload.items.filter((item) => item.id !== (e as CustomEvent<{ id: string }>).detail.id)));

  // The page gives the sources: here two made-up watched folders, an upload that stores a file every 150 ms, and one preview.
  const folderSource = one<HTMLElement & { sources: FolderSources; folder: unknown }>(`[data-testid="${theme}-folder-source"]`);
  folderSource.sources = FOLDER_SOURCES;
  folderSource.folder = { grain: 'folder', depth: 1 };
  for (const type of ['af-folder-upload-started', 'af-folder-progress', 'af-folder-busy', 'af-folder-change', 'af-folder-error']) log(theme, folderSource, type);

  // A field that holds one file takes a new pick in place of the one it holds.
  const replaceable = one<HTMLElement & { items: FileItem[] }>(`[data-testid="${theme}-file-replace"]`);
  replaceable.items = [{ id: 'contract', name: theme === 'light' ? 'contract.pdf' : 'hop-dong.pdf', size: 248_000, status: 'done' }];
  log(theme, replaceable, 'files-add');
  replaceable.addEventListener('files-add', (e) => {
    const [file] = (e as CustomEvent<{ files: File[] }>).detail.files;
    if (file) replaceable.items = [{ id: `replacement-${++uploaded}`, name: file.name, size: file.size, status: 'done' }];
  });
  replaceable.addEventListener('remove', () => (replaceable.items = []));

  // The page keeps each signature the pad reports; the read-only pad shows one drawn here, as a stored signature would be.
  const signature = one<HTMLElement & { value: string | null }>(`[data-testid="${theme}-signature"]`);
  log(theme, signature, 'change');
  signature.addEventListener('change', (e) => (signature.value = (e as CustomEvent<{ value: string | null }>).detail.value));
  one<HTMLElement & { value: string | null }>(`[data-testid="${theme}-signature-signed"]`).value = drawnSignature();

  const status = one(`[data-testid="${theme}-field-status"] af-select`);
  status.options = STATUSES;
  status.value = 'open';
  status.addEventListener('change', (e) => (status.value = (e as CustomEvent<{ value: string | null }>).detail.value));

  const editor = one('af-rich-editor');
  editor.value = NOTES;
  log(theme, editor, 'change');
  editor.addEventListener('change', (e) => (editor.value = (e as CustomEvent<{ value: string }>).detail.value));

  // The form's own controls are controlled too: each change is set back, and a submit shows what the form would send.
  const form = one<HTMLFormElement>(`[data-testid="${theme}-form"]`);
  const due = one(`[data-testid="${theme}-form-date"]`);
  const who = one(`[data-testid="${theme}-form-who"]`);
  who.people = PEOPLE;
  due.addEventListener('change', (e) => (due.value = (e as CustomEvent<{ value: string | null }>).detail.value));
  who.addEventListener('change', (e) => (who.value = (e as CustomEvent<{ value: string[] }>).detail.value));
  const lock = one<HTMLInputElement>(`#${theme}-form-lock`);
  lock.addEventListener('change', () => (one<HTMLFieldSetElement>(`[data-testid="${theme}-form-fieldset"]`).disabled = lock.checked));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    one(`[data-testid="${theme}-form-data"]`).textContent = JSON.stringify([...new FormData(form)]);
  });

  // A whole form: the save keeps the form busy, then answers with errors for the title, the branches and no field. It
  // takes 0.5 s; a test that sets `galleryHoldSave` holds it until it calls `galleryFinishSave()`, so it can look at the
  // busy form for as long as it needs.
  const whole = one<Settable & { busy: boolean; errors: { path: string; message: string }[] }>(`[data-testid="${theme}-whole-form"]`);
  const controlled: [string, Record<string, unknown>][] = [['status', { options: STATUSES, value: 'open' }], ['city', { options: CITIES, value: 'hn' }], ['qty', { value: 4 }], ['due', { value: '2026-11-20' }], ['branches', { options: CITIES, value: ['hn', 'dn'] }]];
  for (const [id, props] of controlled) {
    const control = one(`[data-testid="${theme}-whole-${id}"]`);
    Object.assign(control, props);
    control.addEventListener('change', (e) => (control.value = (e as CustomEvent<{ value: unknown }>).detail.value));
  }
  log(theme, whole, 'af-submit');
  whole.addEventListener('af-submit', () => {
    whole.busy = true;
    whole.errors = [];
    const finish = () => {
      whole.busy = false;
      whole.errors = [
        { path: '/title', message: theme === 'light' ? 'A request with this title is open' : 'Đã có yêu cầu cùng tiêu đề' },
        { path: '/branches', message: theme === 'light' ? 'Choose at most one branch' : 'Chọn tối đa một chi nhánh' },
        { path: '', message: theme === 'light' ? 'The quantity could not be checked; try again' : 'Chưa kiểm tra được số lượng; hãy thử lại' },
      ];
    };
    if (saves.hold) saves.held.push(finish);
    else setTimeout(finish, 500);
  });

  // The tabs are controlled: each change is set back, so a chosen tab shows its panel.
  const tabs = one(`[data-testid="${theme}-tabs-element"]`);
  tabs.items = theme === 'light'
    ? [{ value: 'overview', label: 'Overview' }, { value: 'activity', label: 'Activity' }, { value: 'audit', label: 'Audit log', disabled: true, reason: 'Only admins see the audit log' }]
    : [{ value: 'overview', label: 'Tổng quan' }, { value: 'activity', label: 'Hoạt động' }, { value: 'audit', label: 'Nhật ký', disabled: true, reason: 'Chỉ quản trị viên xem được nhật ký' }];
  tabs.value = 'overview';
  log(theme, tabs, 'tab-change');
  tabs.addEventListener('tab-change', (e) => (tabs.value = (e as CustomEvent<{ value: string }>).detail.value));

  // The panes follow a drag on their own; the page keeps the size it was told, as a page that stores it would.
  const splitter = one(`[data-testid="${theme}-splitter"]`);
  log(theme, splitter, 'size-change');
  splitter.addEventListener('size-change', (e) => (splitter.size = (e as CustomEvent<{ size: number }>).detail.size));

  // A page of two hundred rows at a time, at the size picked; each event sets the pager's state back.
  const pager = one(`[data-testid="${theme}-pager"]`);
  const pageRows = one<HTMLElement>(`#${theme}-page-rows`);
  const row = theme === 'light' ? 'Row' : 'Dòng';
  let page = 0;
  let pageSize = 25;
  const showPage = () => {
    const start = page * pageSize;
    const end = Math.min(200, start + pageSize);
    pageRows.innerHTML = Array.from({ length: end - start }, (_, i) => `<li>${row} ${start + i + 1}</li>`).join('');
    Object.assign(pager, { hasPrev: page > 0, hasNext: end < 200, rangeStart: start + 1, rangeEnd: end, total: 200, pageSize, pageSizes: [25, 50, 100] });
  };
  for (const type of ['prev', 'next', 'page-size-change']) log(theme, pager, type);
  pager.addEventListener('prev', () => { page -= 1; showPage(); });
  pager.addEventListener('next', () => { page += 1; showPage(); });
  pager.addEventListener('page-size-change', (e) => { pageSize = (e as CustomEvent<{ pageSize: number }>).detail.pageSize; page = 0; showPage(); });
  showPage();

  // Load more adds twenty rows of a hundred after 300 ms, busy meanwhile.
  const more = one(`[data-testid="${theme}-more-pager"]`);
  const moreRows = one<HTMLElement>(`#${theme}-more-rows`);
  const addRows = () => {
    const from = moreRows.children.length;
    moreRows.insertAdjacentHTML('beforeend', Array.from({ length: 20 }, (_, i) => `<li>${row} ${from + i + 1}</li>`).join(''));
    Object.assign(more, { shown: moreRows.children.length, total: 100, hasMore: moreRows.children.length < 100, busy: false });
  };
  log(theme, more, 'more');
  more.addEventListener('more', () => {
    more.busy = true;
    setTimeout(addRows, 300);
  });
  addRows();

  // The table's groups collapse as the page says: the toggle flips the group's attribute and its own.
  for (const toggle of root.querySelectorAll(`[data-testid="${theme}-table"] .af-table-group-toggle`)) {
    toggle.addEventListener('click', () => {
      const collapsed = toggle.closest('.af-table-group')!.toggleAttribute('data-collapsed');
      toggle.setAttribute('aria-expanded', String(!collapsed));
    });
  }

  // A card is chosen as the page says: its checkbox sets the state the classes draw, heard on the box that holds them.
  const views = one<HTMLElement>(`[data-testid="${theme}-views"]`);
  views.addEventListener('change', (event) => {
    const check = event.target as HTMLInputElement;
    if (check.classList.contains('af-card-check')) check.closest('.af-card')!.setAttribute('aria-selected', String(check.checked));
  });
  views.innerHTML = viewsMarkup(theme);
  for (const el of views.querySelectorAll('af-scroll-area')) {
    (el as Settable).locale = locale;
    el.setAttribute('data-theme', theme);
  }

  // A search box is cleared as the page says: the clear button empties the input and tells whoever listens, as typing would, and puts the caret back.
  for (const clear of root.querySelectorAll('.af-search-clear')) {
    clear.addEventListener('click', () => {
      const input = clear.parentElement!.querySelector('input')!;
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
    });
  }

  // A disclosure opens and closes as the page says: the toggle flips its own state, and the classes draw it.
  for (const toggle of root.querySelectorAll('.af-disclosure-toggle')) {
    toggle.addEventListener('click', () => toggle.setAttribute('aria-expanded', String(toggle.getAttribute('aria-expanded') !== 'true')));
  }

  log(theme, one(`[data-testid="${theme}-copy-button"]`), 'af-copy');

  // The selection is the page's: the bar shows the count the boxes give, and its clear empties them.
  const bulk = one(`[data-testid="${theme}-bulk-bar"]`);
  const boxes = [...root.querySelectorAll<HTMLInputElement>(`[data-testid="${theme}-bulk-list"] input[type="checkbox"]`)];
  const selected = () => (bulk.count = boxes.filter((box) => box.checked).length);
  bulk.total = boxes.length;
  for (const box of boxes) box.addEventListener('change', selected);
  log(theme, bulk, 'clear');
  bulk.addEventListener('clear', () => {
    for (const box of boxes) box.checked = false;
    selected();
  });
  for (const action of bulk.querySelectorAll('button')) {
    action.addEventListener('click', () => events.push({ theme, tag: 'af-bulk-bar', type: 'action', detail: { label: action.textContent } }));
  }

  const markdown = one(`[data-testid="${theme}-markdown"]`);
  Object.assign(markdown, { value: MARKDOWN, mentions: { [LAN_REF]: { state: 'ok', kind: 'user', id: LAN_REF.slice(5), label: 'Phạm Lan' } } });
  log(theme, markdown, 'af-link');

  // Built only when asked, so the gallery stays light: a horizontal scroll area of forty columns, each a vertical one of
  // sixty cards, the cost of a kanban board drawn in kit scrollers.
  one(`[data-testid="${theme}-build-board"]`).addEventListener('click', () => {
    const column = `<af-scroll-area class="board-column">${'<div class="af-skeleton card"></div>'.repeat(60)}</af-scroll-area>`;
    one(`[data-testid="${theme}-board-cost"]`).innerHTML = `<af-scroll-area axis="horizontal" data-testid="${theme}-board"><div class="board">${column.repeat(40)}</div></af-scroll-area>`;
  });

  for (const cell of TILE_CELLS) {
    const tile = one(`[data-case="${cell.id}"] af-tile`);
    const { spec, result, fields, rows, columns } = TILE_CASES[cell.name];
    Object.assign(tile, { spec, result, fields, rows, columns, drill: true });
    tile.addEventListener('af-drill', (e) => events.push({ theme, tag: 'af-tile', type: 'af-drill', detail: (e as CustomEvent<AfDrillDetail>).detail, id: cell.id }));
    tile.addEventListener('af-open-record', (e) => events.push({ theme, tag: 'af-tile', type: 'af-open-record', detail: (e as CustomEvent<AfOpenRecordDetail>).detail, id: cell.id }));
  }
}

const main = document.getElementById('gallery')!;
for (const theme of ['light', 'dark'] as const) pane(main, theme);
