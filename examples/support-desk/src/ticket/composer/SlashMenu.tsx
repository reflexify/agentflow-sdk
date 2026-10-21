import { useT } from '../../data/desk-context.js';
import { fillPlaceholders, type PlaceholderContext } from '../../model/text-tools.js';
import type { CannedReply } from '../../model/types.js';

/** The `/query` being typed at the caret, at the start of a line. */
export function slashAt(text: string, caret: number): { query: string; start: number } | null {
  const before = text.slice(0, caret);
  const m = /(^|\n)\/([^\n/]*)$/.exec(before);
  return m ? { query: m[2] ?? '', start: before.length - (m[2] ?? '').length - 1 } : null;
}

export function matchCanned(all: CannedReply[], query: string): CannedReply[] {
  const q = query.trim().toLowerCase();
  return all.filter((c) => !q || c.name.toLowerCase().includes(q) || (c.category ?? '').toLowerCase().includes(q)).slice(0, 8);
}

export function SlashMenu(props: {
  query: string; matches: CannedReply[]; sel: number; ctx: PlaceholderContext;
  onPick(c: CannedReply): void; onNote(): void; onAttach(): void;
}) {
  const tr = useT();
  const chosen = props.matches[props.sel];
  return (
    <div className="menu slash">
      <div className="sec">{tr('savedRepliesFor', { q: props.query })}</div>
      <div role="listbox" aria-label={tr('savedReplies')} style={{ display: 'contents' }}>
        {props.matches.length === 0 && <div className="mi"><span className="sub">{tr('noSavedReplies')}</span></div>}
        {props.matches.map((c, i) => (
          <button key={c.id} role="option" aria-selected={i === props.sel} className={i === props.sel ? 'mi sel' : 'mi'}
            onMouseDown={(e) => { e.preventDefault(); props.onPick(c); }}>
            <span>{c.name}</span><span className="sub">{c.category ?? ''}</span>
          </button>
        ))}
      </div>
      {chosen && <div className="preview">{fillPlaceholders(chosen.body, props.ctx)}</div>}
      <div className="sec">{tr('actions')}</div>
      <button className="mi" onMouseDown={(e) => { e.preventDefault(); props.onNote(); }}><span>{tr('switchToNote')}</span><span className="sub">N</span></button>
      <button className="mi" onMouseDown={(e) => { e.preventDefault(); props.onAttach(); }}><span>{tr('attachFile')}</span><span className="sub" /></button>
    </div>
  );
}
