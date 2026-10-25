import { LeaveError } from './leave-api.js';

export type Lang = 'en' | 'vi';

export const langOf = (locale: string): Lang => (locale.toLowerCase().startsWith('vi') ? 'vi' : 'en');

const en = {
  heading: 'Leave requests',
  count: (n: number, locale: string) => (n === 1 ? '1 request' : `${new Intl.NumberFormat(locale).format(n)} requests`),
  newRequest: 'New request',
  loading: 'Loading requests',
  emptyTitle: 'No leave requests yet',
  emptyBody: 'Ask for leave and it shows up here.',
  loadFailed: "Couldn't load the requests.",
  notInstalled: 'The leave package is not installed in this organization.',
  offline: "Couldn't reach AgentFlow. Check your connection.",
  retry: 'Try again',
  retryHint: "AgentFlow didn't say why. Try again in a moment.",
  colNumber: 'Number',
  colType: 'Type',
  colDates: 'Dates',
  colDays: 'Days',
  colStatus: 'Status',
  caption: 'Leave requests, newest first',
  type: { annual: 'Annual leave', sick: 'Sick leave', unpaid: 'Unpaid leave' },
  status: { draft: 'Draft', submitted: 'Waiting for approval', approved: 'Approved', rejected: 'Rejected' },
  typeLabel: 'Type',
  from: 'From',
  to: 'To',
  reason: 'Reason',
  reasonPlaceholder: 'Why do you need the days off? (optional)',
  datesMissing: 'Choose the first and the last day',
  cancel: 'Cancel',
  send: 'Send request',
  sending: 'Sending…',
  sendFailed: "Couldn't send the request.",
  sent: 'Request sent',
};

type Text = typeof en;

const vi: Text = {
  heading: 'Đơn nghỉ phép',
  count: (n: number, locale: string) => `${new Intl.NumberFormat(locale).format(n)} đơn`,
  newRequest: 'Đơn mới',
  loading: 'Đang tải đơn',
  emptyTitle: 'Chưa có đơn nghỉ phép nào',
  emptyBody: 'Xin nghỉ phép, đơn sẽ hiện ở đây.',
  loadFailed: 'Không tải được danh sách đơn.',
  notInstalled: 'Gói nghỉ phép chưa được cài đặt trong tổ chức này.',
  offline: 'Không kết nối được AgentFlow. Hãy kiểm tra kết nối mạng.',
  retry: 'Thử lại',
  retryHint: 'AgentFlow không cho biết lý do. Hãy thử lại sau giây lát.',
  colNumber: 'Số đơn',
  colType: 'Loại',
  colDates: 'Ngày nghỉ',
  colDays: 'Số ngày',
  colStatus: 'Trạng thái',
  caption: 'Đơn nghỉ phép, mới nhất trước',
  type: { annual: 'Phép năm', sick: 'Nghỉ ốm', unpaid: 'Nghỉ không lương' },
  status: { draft: 'Nháp', submitted: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Đã từ chối' },
  typeLabel: 'Loại',
  from: 'Từ ngày',
  to: 'Đến ngày',
  reason: 'Lý do',
  reasonPlaceholder: 'Vì sao bạn cần nghỉ? (không bắt buộc)',
  datesMissing: 'Hãy chọn ngày đầu và ngày cuối',
  cancel: 'Huỷ',
  send: 'Gửi đơn',
  sending: 'Đang gửi…',
  sendFailed: 'Không gửi được đơn.',
  sent: 'Đã gửi đơn',
};

export const TEXT: Record<Lang, Text> = { en, vi };

/** What to tell the person about a failed call: AgentFlow's own reason when it gave one, else `fallback`. */
export function errorText(error: unknown, t: Text, fallback: string): string {
  if (error instanceof LeaveError) {
    if (error.code === 'NOT_INSTALLED') return t.notInstalled;
    if (error.code === 'NETWORK') return t.offline;
    if (error.reason) return error.reason;
  }
  return fallback;
}
