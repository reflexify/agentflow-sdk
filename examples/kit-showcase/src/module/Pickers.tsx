import type { ComboboxOption, FolderSources, Person, PickerSource, TreeNode } from '@reflexify/agentflow-elements/kit';
import { matches } from '@reflexify/agentflow-sdk';
import { useState } from 'react';
import { Combobox, DateInput, FolderSource, PersonPicker, TreePicker, type SectionProps } from './kit.js';

export const PEOPLE: Person[] = [
  { id: 'p-minh', name: 'Lê Minh', email: 'minh@example.com' },
  { id: 'p-hoa', name: 'Trần Hoa', email: 'hoa@example.com' },
  { id: 'p-lan', name: 'Phạm Lan', email: 'lan@example.com' },
  { id: 'p-duc', name: 'Đỗ Đức', email: null },
];

// Sixty places, served twenty at a time after 300 ms, as a slow directory would.
const PLACE_NAMES = [
  'An Bình', 'Bạch Đằng', 'Bến Nghé', 'Cầu Giấy', 'Chợ Lớn', 'Đa Kao', 'Đồng Xuân', 'Gia Lâm', 'Hàng Bạc', 'Hội An',
  'Kim Liên', 'Láng Hạ', 'Long Biên', 'Ngọc Hà', 'Phú Mỹ', 'Quang Trung', 'Tân Định', 'Thảo Điền', 'Thủ Thiêm', 'Yên Phụ',
];
const PLACES: ComboboxOption[] = ['Phường', 'Xã', 'Quận'].flatMap((kind, k) =>
  PLACE_NAMES.map((place, i) => ({ value: `place-${k * PLACE_NAMES.length + i + 1}`, label: `${kind} ${place}`, description: kind })));
const after300 = <T,>(signal: AbortSignal, make: () => T) =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => resolve(make()), 300);
    signal.addEventListener('abort', () => { clearTimeout(timer); reject(signal.reason); }, { once: true });
  });
/** One function for the module's lifetime: a new source would restart the combobox's list. */
const PLACE_SOURCE: PickerSource<ComboboxOption> = Object.assign(
  ({ q, cursor, signal }: { q: string; cursor: string | null; signal: AbortSignal }) =>
    after300(signal, () => {
      const found = PLACES.filter((p) => matches(p.label, q));
      const start = Number(cursor ?? 0);
      return { items: found.slice(start, start + 20), next: start + 20 < found.length ? String(start + 20) : null };
    }),
  { resolve: (ids: string[], signal: AbortSignal) => after300(signal, () => PLACES.filter((p) => ids.includes(p.value))) },
);

/** The people as a slow directory serves them, twenty at a time after 300 ms; one function, as the place source is. */
const PEOPLE_SOURCE: PickerSource<Person> = Object.assign(
  ({ q, cursor, signal }: { q: string; cursor: string | null; signal: AbortSignal }) =>
    after300(signal, () => {
      const found = PEOPLE.filter((p) => matches(p.name, q) || matches(p.email, q));
      const start = Number(cursor ?? 0);
      return { items: found.slice(start, start + 20), next: start + 20 < found.length ? String(start + 20) : null };
    }),
  { resolve: (ids: string[], signal: AbortSignal) => after300(signal, () => PEOPLE.filter((p) => ids.includes(p.id))) },
);

/** Units in three levels, as AgentFlow's are: two regions, their branches, and a team or two under a branch. */
const UNITS: TreeNode[] = [
  { id: 'u-north', parentId: null, label: 'Miền Bắc', code: 'MB' },
  { id: 'u-south', parentId: null, label: 'Miền Nam', code: 'MN' },
  { id: 'u-hanoi', parentId: 'u-north', label: 'Chi nhánh Hà Nội', code: 'HN' },
  { id: 'u-haiphong', parentId: 'u-north', label: 'Chi nhánh Hải Phòng', code: 'HP', archived: true },
  { id: 'u-hcm', parentId: 'u-south', label: 'Chi nhánh Hồ Chí Minh', code: 'HCM' },
  { id: 'u-hanoi-sales', parentId: 'u-hanoi', label: 'Kinh doanh', code: 'HN-KD' },
  { id: 'u-hanoi-support', parentId: 'u-hanoi', label: 'Hỗ trợ', code: 'HN-HT' },
  { id: 'u-hcm-sales', parentId: 'u-hcm', label: 'Kinh doanh', code: 'HCM-KD' },
];

const pause = (ms: number) => new Promise((done) => setTimeout(done, ms));
let pretendSets = 0;
/** An upload that stores nothing: the set is announced, then a file counts as stored every 100 ms until all are, or it is cancelled. */
async function pretendUpload(count: number, opts: Parameters<FolderSources['uploadFiles']>[1]) {
  const id = `set-${++pretendSets}`;
  opts.onSetCreated?.(id);
  for (let stored = 0; stored <= count; stored++) {
    opts.signal?.throwIfAborted();
    opts.onProgress?.({ stored, total: count });
    if (stored < count) await pause(100);
  }
  return { value: { $fileSet: id }, refused: [] };
}
/** What `folderSources(client)` gives a module, made up: one object for the module's lifetime, as a picker's source is. */
const FOLDER_SOURCES: FolderSources = {
  watched: async () => [
    { id: 'ws-scans', name: 'Hồ sơ quét', source: 'sftp', status: 'open', entry_count: 1480, last_scan_at: '2026-11-09T02:00:00Z' },
    { id: 'ws-archive', name: 'Lưu trữ', source: 'sftp', status: 'open', entry_count: 96, last_scan_at: null },
  ],
  subfolders: async (_set, path) => ({
    items: path ? [] : ['dot-10', 'dot-11', 'dot-12'].map((name, i) => ({ name, path: name, file_count: 40 + i, settled_count: i === 2 ? 30 : 40 + i })),
    next_cursor: null,
  }),
  preview: async (_workflow, field) => ({
    field, grain: 'folder', depth: 1, group_count: 12, item_count: 148, sample_keys: ['HS-481', 'HS-482', 'HS-483'], loose_file_count: 2, excluded_count: 3,
    excluded_by_reason: { NOT_IN_A_FOLDER: 1, NOT_SETTLED: 2 }, refusal: null,
  }),
  uploadFolder: (files, opts) => pretendUpload(files.length, opts),
  uploadFiles: (files, opts) => pretendUpload(files.length, opts),
  deleteSet: async () => {},
};

/** The date, a person picker and a combobox, each over a source, and a unit tree, on their own, each controlled: a change shows once it is set back. A folder source over made-up sources follows them. */
export function Pickers({ t, log, locale, theme }: SectionProps) {
  const c = { locale, theme };
  const [due, setDue] = useState<string | null>('2026-09-15');
  const [who, setWho] = useState<string | null>('p-hoa');
  const [place, setPlace] = useState<string | null>('place-23');
  const [unit, setUnit] = useState<string | null>('u-hcm');
  return (
    <section aria-labelledby="showcase-pickers" className="card">
      <h2 id="showcase-pickers">{t.pickers}</h2>
      <div className="row">
        <DateInput
          {...c}
          label={t.dueDate}
          value={due}
          testId="picker-date"
          onChange={(value) => {
            log('af-date', 'change', { value });
            setDue(value);
          }}
        />
        <PersonPicker
          {...c}
          source={PEOPLE_SOURCE}
          value={who}
          label={t.assignee}
          placeholder={t.assignSomeone}
          testId="picker-person"
          onChange={(value) => {
            log('af-person-picker', 'change', { value });
            setWho(value);
          }}
          onSearch={(detail) => log('af-person-picker', 'search', detail)}
        />
        <Combobox
          {...c}
          source={PLACE_SOURCE}
          value={place}
          label={t.place}
          placeholder={t.findPlace}
          testId="picker-place"
          onChange={(value) => {
            log('af-combobox', 'change', { value });
            setPlace(value);
          }}
          onSearch={(detail) => log('af-combobox', 'search', detail)}
        />
        <TreePicker
          {...c}
          nodes={UNITS}
          value={unit}
          label={t.unit}
          placeholder={t.findUnit}
          testId="picker-unit"
          onChange={(value) => {
            log('af-tree-picker', 'change', { value });
            setUnit(value);
          }}
          onSearch={(detail) => log('af-tree-picker', 'search', detail)}
        />
      </div>
      <h3>{t.folderSource}</h3>
      <div className="stack" style={{ maxWidth: 420 }}>
        <FolderSource
          {...c}
          sources={FOLDER_SOURCES}
          workflow="wf-dossiers"
          field="files"
          folder={{ grain: 'folder', depth: 1 }}
          testId="picker-folder"
          onStarted={(detail) => log('af-folder-source', 'af-folder-upload-started', detail)}
          onChange={(detail) => log('af-folder-source', 'af-folder-change', { value: detail.value })}
        />
      </div>
    </section>
  );
}
