import type { ReactNode } from 'react';
import type { Priority, Status } from '../model/types.js';

/**
 * Lucide's icons (ISC licence), drawn inline so they take `currentColor` and the theme, and never render as emoji.
 * Every icon is decoration: the words beside it, or its button's `aria-label`, say what it means.
 */
function Svg({ size, children, className }: { size: number; children: ReactNode; className?: string }) {
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

type IconProps = { size?: number; className?: string };
const icon = (paths: ReactNode) => ({ size = 16, className }: IconProps) => <Svg size={size} className={className}>{paths}</Svg>;

export const ListIcon = icon(<><path d="M3 12h.01" /><path d="M3 18h.01" /><path d="M3 6h.01" /><path d="M8 12h13" /><path d="M8 18h13" /><path d="M8 6h13" /></>);
export const KanbanIcon = icon(<><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M8 7v7" /><path d="M12 7v4" /><path d="M16 7v9" /></>);
export const ChevronDown = icon(<path d="m6 9 6 6 6-6" />);
export const ChevronRight = icon(<path d="m9 18 6-6-6-6" />);
export const CalendarIcon = icon(<><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></>);
export const CalendarX2 = icon(<><path d="M8 2v4" /><path d="M16 2v4" /><path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" /><path d="M3 10h18" /><path d="m17 22 5-5" /><path d="m17 17 5 5" /></>);
export const BanIcon = icon(<><circle cx="12" cy="12" r="10" /><path d="m4.9 4.9 14.2 14.2" /></>);
export const InfoIcon = icon(<><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></>);
export const PlusIcon = icon(<><path d="M5 12h14" /><path d="M12 5v14" /></>);
export const ListChecks = icon(<><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /><path d="M13 6h8" /><path d="M13 12h8" /><path d="M13 18h8" /></>);
export const ClipboardList = icon(<><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></>);
export const AlertTriangle = icon(<><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></>);
export const MoreHorizontal = icon(<><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></>);
export const Paperclip = icon(<path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" />);
export const XIcon = icon(<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>);
export const GripVertical = icon(<><circle cx="9" cy="12" r="1" /><circle cx="9" cy="5" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="19" r="1" /></>);
export const TagIcon = icon(<><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" /></>);
export const LockIcon = icon(<><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>);
export const CheckIcon = icon(<path d="M20 6 9 17l-5-5" />);
export const TrashIcon = icon(<><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><path d="M10 11v6" /><path d="M14 11v6" /></>);
export const ArrowUp = icon(<><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></>);
export const ArrowDown = icon(<><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></>);
export const FileIcon = icon(<><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></>);
export const FileText = icon(<><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></>);
export const ImageIcon = icon(<><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></>);
export const RotateCcw = icon(<><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></>);
export const WifiOff = icon(<><path d="M12 20h.01" /><path d="M8.5 16.429a5 5 0 0 1 7 0" /><path d="M5 12.859a10 10 0 0 1 5.17-2.69" /><path d="M19 12.859a10 10 0 0 0-2.007-1.523" /><path d="M2 8.82a15 15 0 0 1 4.177-2.643" /><path d="M22 8.82a15 15 0 0 0-11.288-3.764" /><path d="m2 2 20 20" /></>);
export const ExternalLink = icon(<><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>);
export const WorkflowIcon = icon(<><rect width="8" height="8" x="3" y="3" rx="2" /><path d="M7 11v4a2 2 0 0 0 2 2h4" /><rect width="8" height="8" x="13" y="13" rx="2" /></>);
export const SearchX = icon(<><path d="m13.5 8.5-5 5" /><path d="m8.5 8.5 5 5" /><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>);
export const CheckCircle2 = icon(<><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></>);
export const FolderKanban = icon(<><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /><path d="M8 10v4" /><path d="M12 10v2" /><path d="M16 10v6" /></>);

/** A status's glyph, so the status never rests on its colour alone. */
export function StatusGlyph({ status, size = 12 }: { status: Status; size?: number }) {
  switch (status) {
    case 'todo':
      return <Svg size={size}><circle cx="12" cy="12" r="9" /></Svg>;
    case 'doing':
      return <Svg size={size}><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" /></Svg>;
    case 'done':
      return <Svg size={size}><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></Svg>;
    case 'cancelled':
      return <Svg size={size}><circle cx="12" cy="12" r="9" /><path d="m5.7 5.7 12.6 12.6" /></Svg>;
  }
}

/** A priority's glyph: bars that fill with the level, and a filled square with "!" for urgent. */
export function PriorityGlyph({ priority, size = 14 }: { priority: Priority | null; size?: number }) {
  if (priority === null) return <Svg size={size}><path d="M7 12h10" /></Svg>;
  if (priority === 'urgent') {
    return (
      <Svg size={size}>
        <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" stroke="none" />
        <path d="M12 7.5v5.5" className="glyph-cut" />
        <path d="M12 16.5h.01" className="glyph-cut" />
      </Svg>
    );
  }
  const level = priority === 'high' ? 3 : priority === 'medium' ? 2 : 1;
  return (
    <Svg size={size}>
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={4 + i * 6}
          y={16 - i * 5}
          width="4"
          height={4 + i * 5}
          rx="1"
          fill="currentColor"
          stroke="none"
          opacity={i < level ? 1 : 0.25}
        />
      ))}
    </Svg>
  );
}
