import type { ReactNode } from 'react';
import { useT } from '../data/context.js';
import { refusalText } from '../data/failure.js';
import { AlertTriangle, SearchX } from '../shared/icons.js';

const bone = (className: string, key?: number) => <span key={key} className={`af-skeleton bone ${className}`} />;

/** Five rows of a panel: a circle, then two bars. */
function Rows() {
  return (
    <div className="skeleton-panel">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton-row">{bone('bone-dot')}{bone('bone-title')}{bone('bone-meta')}</div>
      ))}
    </div>
  );
}

/** The project grid's cards: the name, the managers, the bar and the three counts. */
function Cards() {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="skeleton-card">
          {bone('bone-name')}
          <div className="skeleton-line">{[0, 1, 2].map((j) => bone('bone-avatar', j))}</div>
          {bone('bone-bar')}
          <div className="skeleton-line">{[0, 1, 2].map((j) => bone('bone-count', j))}</div>
        </div>
      ))}
    </>
  );
}

/** Four columns with a head and cards of the board's own heights. */
function Columns() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="skeleton-column">
          {bone('bone-head')}
          {[72, 96, 72].slice(0, 3 - (i % 2)).map((h, j) => <span key={j} className="af-skeleton bone bone-card" style={{ height: h }} />)}
        </div>
      ))}
    </>
  );
}

/** The drawer's title, then label and value pairs. */
function Form() {
  return (
    <>
      {bone('bone-heading')}
      {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton-field">{bone('bone-label')}{bone('bone-value')}</div>)}
    </>
  );
}

const SHAPES = { rows: Rows, cards: Cards, columns: Columns, form: Form } as const;

/** The shape of what is loading, in `af-skeleton` blocks. It shows only after a moment, so a quick read never flashes. */
export function Loading({ kind }: { kind: keyof typeof SHAPES }) {
  const tr = useT();
  const Shape = SHAPES[kind];
  return (
    <div className="state loading" data-kind={kind} role="status" aria-busy="true" aria-label={tr('loading')}>
      <Shape />
    </div>
  );
}

/** A read that failed: the server's reason when it gave one, and a way to try again. */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry(): void }) {
  const tr = useT();
  const reason = refusalText(error, tr) || tr('loadFailed');
  return (
    <div className="state error" role="alert">
      <span className="state-icon"><AlertTriangle size={32} /></span>
      <p className="state-title">{reason}</p>
      <button type="button" className="af-button secondary" onClick={onRetry}>{tr('retry')}</button>
    </div>
  );
}

/** A record that does not exist and one the viewer may not read look the same, so neither's existence shows. */
export function NotFound() {
  const tr = useT();
  return (
    <div className="state empty not-found">
      <span className="state-icon"><SearchX size={32} /></span>
      <p className="state-title">{tr('notFound')}</p>
    </div>
  );
}

export function Empty({ text, line, action, icon }: { text: string; line?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="state empty">
      {icon && <span className="state-icon">{icon}</span>}
      <p className="state-title">{text}</p>
      {line && <p className="state-line">{line}</p>}
      {action}
    </div>
  );
}
