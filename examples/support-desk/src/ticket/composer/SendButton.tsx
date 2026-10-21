import { useEffect, useState } from 'react';
import { useT } from '../../data/desk-context.js';
import type { TextKey } from '../../text.js';
import type { SendChoice } from './useSend.js';

const OPTIONS: { choice: SendChoice; keys: string }[] = [
  { choice: 'send', keys: '⌘↵' }, { choice: 'send_waiting', keys: '⌘⇧↵' }, { choice: 'send_solved', keys: '' }, { choice: 'send_next', keys: '' },
];
const kbd = { background: 'transparent', color: 'inherit', borderColor: 'currentColor' };

export function SendButton(props: { disabled: boolean; current: SendChoice; onSend(): void; onPick(c: SendChoice): void }) {
  const tr = useT();
  const [open, setOpen] = useState(false);
  // A menu left open over a button that has just been disabled would still offer to send.
  useEffect(() => { if (props.disabled) setOpen(false); }, [props.disabled]);
  return (
    <>
      <div className="split">
        <button className="btn primary" disabled={props.disabled} onClick={props.onSend}>{tr('send')} <kbd style={kbd}>⌘↵</kbd></button>
        <button className="btn primary" aria-label={tr('moreSend')} aria-haspopup="menu" aria-expanded={open} disabled={props.disabled}
          onClick={() => setOpen((o) => !o)}>▾</button>
      </div>
      {open && (
        <div className="menu sendmenu" role="menu" onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}>
          {OPTIONS.map((o) => (
            <button key={o.choice} role="menuitem" className={o.choice === props.current ? 'mi sel' : 'mi'}
              onClick={() => { setOpen(false); props.onPick(o.choice); }}>
              <span>{tr(`choice_${o.choice}` as TextKey)}</span><span className="sub">{o.keys}</span>
            </button>
          ))}
          <div className="sec">{tr('yourDefault')}</div>
          <div className="mi" style={{ cursor: 'default' }}><span className="sub">{tr('defaultHint')}</span></div>
        </div>
      )}
    </>
  );
}
