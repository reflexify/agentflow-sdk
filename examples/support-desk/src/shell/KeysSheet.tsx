import { useT } from '../data/desk-context.js';
import { useOverlays } from '../keys/KeyboardProvider.js';

const ROWS = [
  ['keyMove', ['J', 'K']], ['keyClaimNext', ['⇧N']], ['keyReplyNote', ['R', 'N']], ['keySaved', ['/']],
  ['keySend', ['⌘↵']], ['keySendWaiting', ['⌘⇧↵']], ['keyMark', ['S', 'W', 'E']], ['keyShorter', ['⌥S']],
  ['keyGo', ['G', 'M · U · H']], ['keyPalette', ['⌘K']],
] as const;

export function KeysSheet() {
  const tr = useT();
  const overlays = useOverlays();
  if (!overlays.help) return null;
  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) overlays.close(); }}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={tr('keysTitle')}>
        <h3>{tr('keysTitle')}</h3>
        <div className="keys">
          {ROWS.map(([label, keys]) => (
            <div key={label}><span>{tr(label)}</span><span>{keys.map((k) => <kbd key={k}>{k}</kbd>)}</span></div>
          ))}
        </div>
        <div><button className="btn" onClick={() => overlays.close()} autoFocus>{tr('close')}</button></div>
      </div>
    </div>
  );
}
