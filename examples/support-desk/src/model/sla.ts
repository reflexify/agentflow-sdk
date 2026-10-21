import { SLA_SOON_MS } from './timing.js';

export function shortDuration(ms: number): string {
  const minutes = Math.floor(Math.abs(ms) / 60_000);
  if (minutes < 1) return '<1m';
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  if (hours > 0) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  return `${mins}m`;
}

export function slaBadge(dueAt: string | null, now: Date): { tone: 'over' | 'soon' | 'ok'; text: string } | null {
  if (!dueAt) return null;
  const left = new Date(dueAt).getTime() - now.getTime();
  if (left < 0) return { tone: 'over', text: `−${shortDuration(left)}` };
  return { tone: left < SLA_SOON_MS ? 'soon' : 'ok', text: shortDuration(left) };
}

export function waitingSince(lastCustomerAt: string | null, now: Date): string | null {
  return lastCustomerAt ? shortDuration(now.getTime() - new Date(lastCustomerAt).getTime()) : null;
}
