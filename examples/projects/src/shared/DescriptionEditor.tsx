import { useLayoutEffect, useRef, useState } from 'react';
import { RichEditor } from '../kit/elements.js';
import { useLeaveOnUnmount } from './focus.js';

/**
 * Mô tả. The editor keeps what is being typed while the stored description moves under it, so the drawer remembers the
 * stored text the edit started from: if it has moved since, someone else changed it, and the draft is dropped, as a
 * title draft is, rather than written over their text. A dropped draft leaves the editor at once: a new one opens on
 * the stored text, so nothing more is typed into a draft that will never be written.
 */
export function DescriptionEditor(p: {
  /** The stored text. */
  value: string;
  /** What names the stored text's version, for `announce`. */
  version: string;
  readonly: boolean; labelId: string; label: string; placeholder: string; lang: string;
  /** Writes the text; resolves to a falsy value when the write did not happen. */
  save(value: string): Promise<unknown>;
  /** Said when someone else's change makes the editor drop what was typed. */
  announce(version: string): void;
}) {
  const startedFrom = useRef<string | null>(null);
  const [generation, setGeneration] = useState(0);
  const current = useRef(generation);
  current.current = generation;
  const group = useRef<HTMLDivElement>(null);
  useLeaveOnUnmount(group);
  // Focus that was in the editor a dropped draft leaves stays on the field, so it is not lost to the page.
  const refocus = useRef(false);
  useLayoutEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    group.current?.focus({ preventScroll: true });
  }, [generation]);
  return (
    <div
      ref={group}
      className="description"
      aria-labelledby={p.labelId}
      role="group"
      tabIndex={-1}
      onFocus={() => { startedFrom.current ??= p.value; }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) startedFrom.current = null;
      }}
    >
      <RichEditor
        key={generation}
        value={p.value}
        readonly={p.readonly}
        placeholder={p.placeholder}
        label={p.label}
        locale={p.lang}
        onChange={({ value }) => {
          // The editor a dropped draft was typed in still hands it over as it goes.
          if (generation !== current.current) return;
          if (value === p.value) return;
          const from = startedFrom.current ?? p.value;
          if (p.value !== from) {
            p.announce(p.version);
            const el = group.current;
            refocus.current = !!el && el.contains((el.getRootNode() as Document | ShadowRoot).activeElement);
            startedFrom.current = null;
            setGeneration((g) => g + 1);
            return;
          }
          if (startedFrom.current !== null) startedFrom.current = value;
          void p.save(value).then((saved) => {
            if (!saved && startedFrom.current === value) startedFrom.current = from;
          });
        }}
      />
    </div>
  );
}
