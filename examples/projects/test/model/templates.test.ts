import { describe, expect, it } from 'vitest';
import { looksLikeStatus, TEMPLATES, templateSections } from '../../src/model/templates.js';
import type { TaskLabel } from '../../src/model/types.js';

describe('the system templates', () => {
  it('lists the five templates in order, named in both languages', () => {
    expect(TEMPLATES.map((x) => x.key)).toEqual(['blank', 'software', 'event', 'by_time', 'by_area']);
    expect(TEMPLATES.map((x) => x.name.vi)).toEqual(['Trống', 'Dự án phần mềm', 'Sự kiện / Ra mắt', 'Theo thời gian', 'Theo mảng việc']);
    expect(TEMPLATES.map((x) => x.name.en)).toEqual(['Blank', 'Software project', 'Event / Launch', 'By time', 'By area']);
  });

  it('gives the software template its five sections with their descriptions', () => {
    const sections = templateSections('software', 'vi');
    expect(sections.map((s) => s.name)).toEqual(['Phân tích', 'Thiết kế', 'Phát triển', 'Kiểm thử', 'Triển khai']);
    expect(sections[0]).toEqual({ name: 'Phân tích', description: 'Thu thập và làm rõ yêu cầu, phạm vi và tiêu chí nghiệm thu' });
    expect(sections[3]!.description).toBe('Chạy kịch bản kiểm thử, ghi nhận và xác nhận sửa lỗi trước khi bàn giao');
    expect(templateSections('software', 'en')[3]).toEqual({
      name: 'Testing', description: 'Run test scenarios, record defects and confirm fixes before handover',
    });
  });

  it('has the sections of the other templates in both languages', () => {
    expect(templateSections('event', 'vi').map((s) => s.name)).toEqual(['Chuẩn bị', 'Truyền thông', 'Hậu cần', 'Tổng kết']);
    expect(templateSections('by_time', 'en').map((s) => s.name)).toEqual(['This week', 'Next week', 'Later']);
    expect(templateSections('by_area', 'vi').map((s) => s.name)).toEqual(['Kinh doanh', 'Kỹ thuật', 'Hành chính']);
    expect(templateSections('by_area', 'en')[2]).toEqual({ name: 'Administration', description: 'People, contracts and internal procedures' });
  });

  it('has no sections for a blank project', () => {
    expect(templateSections('blank', 'en')).toEqual([]);
    expect(templateSections('blank', 'vi')).toEqual([]);
  });

  it('hands out copies, so editing a draft never changes the template', () => {
    templateSections('event', 'en')[0]!.name = 'Changed';
    expect(templateSections('event', 'en')[0]!.name).toBe('Preparation');
  });
});

describe('a section named like a status', () => {
  const labels: TaskLabel[] = [{ id: 'l1', updatedAt: '2026-10-01T00:00:00Z', name: 'Chờ duyệt', baseStatus: 'doing' }];

  it.each(['Đang làm', 'đang làm', 'DANG LAM', 'Xong', 'Hoàn thành', 'Done', 'In progress', '  Xong  ', 'Chờ duyệt', 'cho duyet'])('flags %s', (name) => {
    expect(looksLikeStatus(name, labels)).toBe(true);
  });

  it.each(['Phân tích', 'Thiết kế', '', '   '])('leaves %j alone', (name) => {
    expect(looksLikeStatus(name, labels)).toBe(false);
  });
});
