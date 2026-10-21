import { useState } from 'react';
import { useT } from '../data/desk-context.js';
import { useMe, usePeople } from '../data/hooks.js';

export function HandOver({ onPick, disabled }: { onPick(userId: string): void; disabled: boolean }) {
  const tr = useT();
  const me = useMe().data;
  const people = (usePeople().data ?? []).filter((p) => p.id !== me?.id);
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: 'relative' }}>
      <button className="btn quiet" aria-haspopup="menu" aria-expanded={open} disabled={disabled} onClick={() => setOpen((o) => !o)}>
        {tr('handOver')}
      </button>
      {open && (
        <div className="menu" role="menu" aria-label={tr('handOverTo')} style={{ top: '100%', right: 0, minWidth: 200 }}
          onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}>
          <div className="sec">{tr('handOverTo')}</div>
          {people.map((p) => (
            <button key={p.id} className="mi" role="menuitem" onClick={() => { setOpen(false); onPick(p.id); }}>
              <span>{p.displayName}</span><span className="sub">{p.email ?? ''}</span>
            </button>
          ))}
        </div>
      )}
    </span>
  );
}
