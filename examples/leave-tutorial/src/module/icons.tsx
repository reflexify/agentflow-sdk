import type { ReactNode } from 'react';
import type { LeaveStatus } from './leave-api.js';

// Lucide's shapes, drawn in currentColor. Every icon is decoration: the words beside it carry the meaning.
function Icon({ size, children }: { size: number; children: ReactNode }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

export const PlusIcon = () => <Icon size={16}><path d="M5 12h14" /><path d="M12 5v14" /></Icon>;

export const CalendarIcon = () => (
  <Icon size={32}><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></Icon>
);

export const AlertIcon = () => (
  <Icon size={32}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" />
  </Icon>
);

export function StatusIcon({ status }: { status: LeaveStatus }) {
  return (
    <Icon size={12}>
      <circle cx="12" cy="12" r="10" />
      {status === 'submitted' && <path d="M12 6v6l4 2" />}
      {status === 'approved' && <path d="m9 12 2 2 4-4" />}
      {status === 'rejected' && <><path d="m15 9-6 6" /><path d="m9 9 6 6" /></>}
    </Icon>
  );
}
