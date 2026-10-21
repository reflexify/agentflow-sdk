import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Tooltip } from '../kit/elements.js';
import { looksLikeStatus, type TemplateSection } from '../model/templates.js';
import type { TaskLabel } from '../model/types.js';
import { ArrowDown, ArrowUp, InfoIcon, PlusIcon, XIcon } from '../shared/icons.js';
import { t, type Lang, type TextKey } from '../text.js';

type Part = 'name' | 'description' | 'up' | 'down' | 'remove';

let rowSeq = 0;
const freshKey = () => `section-row-${++rowSeq}`;

/**
 * The sections a new project starts with, edited in place before anything is saved: add, rename, describe, remove and
 * reorder, with ↑ and ↓ or Alt and the arrow keys. Enter never submits the form around it.
 */
export function SectionsEditor(p: { value: TemplateSection[]; onChange(next: TemplateSection[]): void; labels: TaskLabel[]; lang: Lang }) {
  const { value, lang } = p;
  const tr = (key: TextKey, vars?: Record<string, string | number>) => t(lang, key, vars);
  // Rows keep their keys while they move, so a moved row keeps its focus. A list that comes from outside, a template
  // chosen, gets keys of its own.
  const keyed = useRef<{ value: TemplateSection[]; keys: string[] }>({ value: [], keys: [] });
  if (keyed.current.value !== value) keyed.current = { value, keys: value.map(() => freshKey()) };
  const keys = keyed.current.keys;
  const root = useRef<HTMLDivElement>(null);
  const focusNext = useRef<{ key: string; part: Part } | 'new' | null>(null);
  const [draft, setDraft] = useState('');
  const ids = { add: useId(), base: useId() };

  useLayoutEffect(() => {
    const target = focusNext.current;
    if (!target) return;
    focusNext.current = null;
    const el = target === 'new'
      ? root.current?.querySelector<HTMLElement>('[data-part="new"]')
      : root.current?.querySelector<HTMLElement>(`[data-key="${target.key}"] [data-part="${target.part}"]`);
    el?.focus({ preventScroll: false });
  });

  const emit = (next: TemplateSection[], nextKeys: string[]) => {
    keyed.current = { value: next, keys: nextKeys };
    p.onChange(next);
  };
  const edit = (i: number, change: Partial<TemplateSection>) =>
    emit(value.map((s, j) => (j === i ? { ...s, ...change } : s)), keys);
  const move = (i: number, by: -1 | 1, part: Part) => {
    const to = i + by;
    if (to < 0 || to >= value.length) return;
    const swap = <T,>(list: T[]) => {
      const next = [...list];
      [next[i], next[to]] = [next[to]!, next[i]!];
      return next;
    };
    focusNext.current = { key: keys[i]!, part };
    emit(swap(value), swap(keys));
  };
  const remove = (i: number) => {
    const after = keys[i + 1] ?? keys[i - 1];
    focusNext.current = after ? { key: after, part: 'name' } : 'new';
    emit(value.filter((_, j) => j !== i), keys.filter((_, j) => j !== i));
  };
  const add = () => {
    const name = draft.trim();
    focusNext.current = 'new';
    if (!name) return;
    setDraft('');
    emit([...value, { name, description: '' }], [...keys, freshKey()]);
  };

  const onRowKey = (i: number) => (e: KeyboardEvent<HTMLLIElement>) => {
    if (e.nativeEvent.isComposing) return;
    const part = ((e.target as HTMLElement).dataset.part ?? 'name') as Part;
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      move(i, e.key === 'ArrowUp' ? -1 : 1, part);
    } else if (e.key === 'Enter' && (part === 'name' || part === 'description')) {
      // Enter goes on to the next row's name, then to the new row, as in a list being typed.
      e.preventDefault();
      const next = keys[i + 1];
      root.current?.querySelector<HTMLElement>(next ? `[data-key="${next}"] [data-part="name"]` : '[data-part="new"]')?.focus();
    }
  };

  // A locked arrow's tooltip says why it is locked, not what it would do.
  const tool = (part: 'up' | 'down' | 'remove', label: string, icon: ReactNode, lock: { id: string; reason: string } | null, act: () => void) => (
    <>
      <Tooltip text={lock ? lock.reason : label} locale={lang}>
        <button
          type="button"
          className="icon-button sm"
          data-part={part}
          aria-label={label}
          aria-disabled={lock ? 'true' : undefined}
          aria-describedby={lock ? lock.id : undefined}
          onClick={() => { if (!lock) act(); }}
        >
          {icon}
        </button>
      </Tooltip>
      {lock && <span id={lock.id} className="sr-only">{lock.reason}</span>}
    </>
  );

  const blank = !draft.trim();
  return (
    <div className="sections-editor" ref={root}>
      <ol className="se-list" aria-label={tr('sections')}>
        {value.map((s, i) => {
          const key = keys[i]!;
          const shown = s.name.trim() || tr('unnamedSection', { n: i + 1 });
          const missing = !s.name.trim();
          const hint = !missing && looksLikeStatus(s.name, p.labels);
          const errorId = `${ids.base}-${key}-error`;
          const hintId = `${ids.base}-${key}-hint`;
          const describedBy = [missing ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;
          return (
            <li key={key} className="se-row" data-key={key} onKeyDown={onRowKey(i)}>
              <span className="se-index" aria-hidden="true">{i + 1}</span>
              <div className="se-fields">
                <input
                  className="se-input se-name"
                  data-part="name"
                  value={s.name}
                  autoComplete="off"
                  aria-label={tr('sectionNameAt', { n: i + 1 })}
                  aria-invalid={missing ? 'true' : undefined}
                  aria-describedby={describedBy}
                  onChange={(e) => edit(i, { name: e.target.value })}
                />
                <textarea
                  className="se-input se-description"
                  data-part="description"
                  rows={1}
                  value={s.description}
                  autoComplete="off"
                  placeholder={tr('sectionDescriptionPlaceholder')}
                  aria-label={tr('sectionDescriptionOf', { name: shown })}
                  onChange={(e) => edit(i, { description: e.target.value })}
                />
                {missing && <p id={errorId} className="se-note" data-tone="danger">{tr('sectionNeedsNameRow')}</p>}
                {hint && (
                  <p id={hintId} className="se-note" data-tone="info">
                    <InfoIcon size={14} />
                    <span>{tr('sectionLooksLikeStatus')}</span>
                  </p>
                )}
              </div>
              <span className="se-tools">
                {tool('up', tr('moveSectionUp', { name: shown }), <ArrowUp size={14} />,
                  i === 0 ? { id: `${ids.base}-${key}-first`, reason: tr('sectionAlreadyFirst') } : null, () => move(i, -1, 'up'))}
                {tool('down', tr('moveSectionDown', { name: shown }), <ArrowDown size={14} />,
                  i === value.length - 1 ? { id: `${ids.base}-${key}-last`, reason: tr('sectionAlreadyLast') } : null, () => move(i, 1, 'down'))}
                {tool('remove', tr('removeSectionFromList', { name: shown }), <XIcon size={14} />, null, () => remove(i))}
              </span>
            </li>
          );
        })}
      </ol>
      {value.length === 0 && <p className="se-empty">{tr('noSectionsYet')}</p>}
      <div className="se-new">
        <PlusIcon size={16} className="se-new-icon" />
        <input
          className="se-input se-new-input"
          data-part="new"
          value={draft}
          autoComplete="off"
          placeholder={tr('newSectionName')}
          aria-label={tr('newSectionName')}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
            e.preventDefault();
            add();
          }}
        />
        <Tooltip text={blank ? tr('enterSectionName') : ''} locale={lang}>
          <button
            type="button"
            className="af-button secondary sm se-add"
            aria-disabled={blank ? 'true' : undefined}
            aria-describedby={blank ? ids.add : undefined}
            onClick={() => { if (!blank) add(); }}
          >
            {tr('addSection')}
          </button>
        </Tooltip>
        {blank && <span id={ids.add} className="sr-only">{tr('enterSectionName')}</span>}
      </div>
    </div>
  );
}
