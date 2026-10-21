import { useT } from '../../data/desk-context.js';
import type { Person } from '../../model/types.js';

export function MentionMenu({ matches, sel, onPick }: { matches: Person[]; sel: number; onPick(p: Person): void }) {
  const tr = useT();
  if (!matches.length) return null;
  return (
    <div className="menu slash" role="listbox" aria-label={tr('mentionPeople')}>
      {matches.map((p, i) => (
        <button key={p.id} role="option" aria-selected={i === sel} className={i === sel ? 'mi sel' : 'mi'}
          onMouseDown={(e) => { e.preventDefault(); onPick(p); }}>
          <span>{p.displayName}</span><span className="sub">{p.email ?? ''}</span>
        </button>
      ))}
    </div>
  );
}
