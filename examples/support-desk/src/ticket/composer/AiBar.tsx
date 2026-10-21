import { useState } from 'react';
import { useT } from '../../data/desk-context.js';
import { shortDuration } from '../../model/sla.js';
import type { Reply } from '../../model/types.js';
import type { TextKey } from '../../text.js';

export const SHORTER = 'Make it shorter.';
export const TUNES: { label: TextKey; instruction: string }[] = [
  { label: 'tuneShorter', instruction: SHORTER },
  { label: 'tuneFriendlier', instruction: 'Make it friendlier.' },
  { label: 'tuneFormal', instruction: 'Make it more formal.' },
  { label: 'tuneVietnamese', instruction: 'Write it in Vietnamese.' },
];

export function AiBar(props: { draft: Reply | null; now: Date; busy: boolean; canUndo: boolean; onTune(instruction: string, label: TextKey | null): void; onUndo(): void }) {
  const tr = useT();
  const [custom, setCustom] = useState<string | null>(null);
  const ai = props.draft?.aiBody ? props.draft : null;
  return (
    <div className="aibar">
      <div className="left">
        {/* `postedAt` is when the AI wrote it; `updatedAt` moves with every edit a person makes. */}
        {ai && <span className="chip ai">{tr('aiDraftAge', { age: shortDuration(props.now.getTime() - new Date(ai.postedAt).getTime()) })}</span>}
        {TUNES.map((t) => (
          <button key={t.label} className="tune" disabled={props.busy} onClick={() => props.onTune(t.instruction, t.label)}>{tr(t.label)}</button>
        ))}
        {custom === null
          ? <button className="tune" disabled={props.busy} onClick={() => setCustom('')}>{tr('tuneCustom')}</button>
          : <input className="tune" autoFocus value={custom} aria-label={tr('tuneCustom')} placeholder={tr('tuneCustomPlaceholder')}
              disabled={props.busy}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && custom.trim() && !props.busy) { props.onTune(custom.trim(), null); setCustom(null); }
                if (e.key === 'Escape') setCustom(null);
              }} />}
      </div>
      {props.canUndo && <button className="link" style={{ color: 'var(--ai)' }} onClick={props.onUndo}>{tr('undoRedraft')}</button>}
    </div>
  );
}
