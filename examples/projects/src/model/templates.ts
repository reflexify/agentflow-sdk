import type { Lang } from '../text.js';
import type { TaskLabel } from './types.js';

export type TemplateKey = 'blank' | 'software' | 'event' | 'by_time' | 'by_area';
export interface TemplateSection { name: string; description: string }

const section = (
  vi: [name: string, description: string],
  en: [name: string, description: string],
): Record<Lang, TemplateSection> => ({
  vi: { name: vi[0], description: vi[1] },
  en: { name: en[0], description: en[1] },
});

export const TEMPLATES: readonly { key: TemplateKey; name: Record<Lang, string>; sections: readonly Record<Lang, TemplateSection>[] }[] = [
  { key: 'blank', name: { vi: 'Trống', en: 'Blank' }, sections: [] },
  {
    key: 'software',
    name: { vi: 'Dự án phần mềm', en: 'Software project' },
    sections: [
      section(['Phân tích', 'Thu thập và làm rõ yêu cầu, phạm vi và tiêu chí nghiệm thu'], ['Analysis', 'Gather and clarify requirements, scope and acceptance criteria']),
      section(['Thiết kế', 'Thiết kế giải pháp, giao diện và kiến trúc trước khi phát triển'], ['Design', 'Design the solution, interface and architecture before building']),
      section(['Phát triển', 'Xây dựng tính năng theo thiết kế đã thống nhất'], ['Development', 'Build the features to the agreed design']),
      section(['Kiểm thử', 'Chạy kịch bản kiểm thử, ghi nhận và xác nhận sửa lỗi trước khi bàn giao'], ['Testing', 'Run test scenarios, record defects and confirm fixes before handover']),
      section(['Triển khai', 'Đưa vào sử dụng, hướng dẫn người dùng và theo dõi sau triển khai'], ['Deployment', 'Release, train users and monitor after go-live']),
    ],
  },
  {
    key: 'event',
    name: { vi: 'Sự kiện / Ra mắt', en: 'Event / Launch' },
    sections: [
      section(['Chuẩn bị', 'Lên kế hoạch, ngân sách, địa điểm và nhân sự'], ['Preparation', 'Plan the budget, venue and staffing']),
      section(['Truyền thông', 'Nội dung, kênh truyền thông và lời mời'], ['Communications', 'Content, channels and invitations']),
      section(['Hậu cần', 'Thiết bị, vận chuyển, ăn uống và vận hành tại chỗ'], ['Logistics', 'Equipment, transport, catering and on-site operations']),
      section(['Tổng kết', 'Đánh giá kết quả, thanh toán và rút kinh nghiệm'], ['Wrap-up', 'Review results, settle payments and capture lessons']),
    ],
  },
  {
    key: 'by_time',
    name: { vi: 'Theo thời gian', en: 'By time' },
    sections: [
      section(['Tuần này', 'Việc cần xong trong tuần này'], ['This week', 'Work to finish this week']),
      section(['Tuần sau', 'Việc dự kiến làm tuần sau'], ['Next week', 'Work planned for next week']),
      section(['Để sau', 'Việc chưa xếp lịch'], ['Later', 'Work not yet scheduled']),
    ],
  },
  {
    key: 'by_area',
    name: { vi: 'Theo mảng việc', en: 'By area' },
    sections: [
      section(['Kinh doanh', 'Bán hàng, khách hàng và đối tác'], ['Business', 'Sales, customers and partners']),
      section(['Kỹ thuật', 'Hệ thống, sản phẩm và hạ tầng'], ['Engineering', 'Systems, product and infrastructure']),
      section(['Hành chính', 'Nhân sự, hợp đồng và thủ tục nội bộ'], ['Administration', 'People, contracts and internal procedures']),
    ],
  },
];

/** A fresh copy, since the creator edits the draft in place. */
export function templateSections(key: TemplateKey, lang: Lang): TemplateSection[] {
  const template = TEMPLATES.find((x) => x.key === key);
  return (template?.sections ?? []).map((s) => ({ ...s[lang] }));
}

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').trim().toLowerCase();
const STATUS_WORDS = ['chua lam', 'dang lam', 'hoan thanh', 'xong', 'da huy', 'huy', 'to do', 'todo', 'in progress', 'doing', 'done', 'cancelled', 'canceled', 'bi chan', 'blocked'];

/** A section named like a status or a sub-label would be better as one of them; the creator may still keep it. */
export function looksLikeStatus(name: string, labels: TaskLabel[]): boolean {
  const n = fold(name);
  return n !== '' && (STATUS_WORDS.includes(n) || labels.some((l) => fold(l.name) === n));
}
