// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { templateSections, type TemplateSection } from '../../src/model/templates.js';
import type { TaskLabel } from '../../src/model/types.js';
import { SectionsEditor } from '../../src/projects/SectionsEditor.js';
import { t, TEXT } from '../../src/text.js';

const vi_ = TEXT.vi;
const LABELS: TaskLabel[] = [{ id: 'l1', updatedAt: '2026-10-01T00:00:00Z', name: 'Chờ duyệt', baseStatus: 'doing' }];

function Harness({ initial, seen }: { initial: TemplateSection[]; seen: TemplateSection[][] }) {
  const [value, setValue] = useState(initial);
  return (
    <SectionsEditor
      value={value}
      labels={LABELS}
      lang="vi"
      onChange={(next) => {
        seen.push(next);
        setValue(next);
      }}
    />
  );
}

function show(initial: TemplateSection[] = templateSections('software', 'vi')) {
  const seen: TemplateSection[][] = [];
  render(<Harness initial={initial} seen={seen} />);
  const list = () => screen.getByRole('list', { name: vi_.sections });
  const names = () => within(list()).queryAllByRole('textbox').filter((el) => el.matches('[data-part="name"]')).map((el) => (el as HTMLInputElement).value);
  const last = () => seen[seen.length - 1]!;
  const newRow = () => screen.getByRole('textbox', { name: vi_.newSectionName }) as HTMLInputElement;
  return { seen, list, names, last, newRow };
}

describe('the sections editor', () => {
  it('lists the sections in order, each with its name and description', () => {
    const { names } = show();
    expect(names()).toEqual(['Phân tích', 'Thiết kế', 'Phát triển', 'Kiểm thử', 'Triển khai']);
    const description = screen.getByRole('textbox', { name: t('vi', 'sectionDescriptionOf', { name: 'Thiết kế' }) }) as HTMLInputElement;
    expect(description.value).toBe('Thiết kế giải pháp, giao diện và kiến trúc trước khi phát triển');
  });

  it('adds a section with Enter in the new row and keeps the focus there for the next one', () => {
    const { names, newRow, last } = show([]);
    expect(screen.getByText(vi_.noSectionsYet)).toBeTruthy();
    const input = newRow();
    input.focus();
    fireEvent.change(input, { target: { value: '  Chuẩn bị  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(names()).toEqual(['Chuẩn bị']);
    expect(last()).toEqual([{ name: 'Chuẩn bị', description: '' }]);
    expect(newRow().value).toBe('');
    expect(document.activeElement).toBe(newRow());

    fireEvent.change(newRow(), { target: { value: 'Tổng kết' } });
    fireEvent.keyDown(newRow(), { key: 'Enter' });
    expect(names()).toEqual(['Chuẩn bị', 'Tổng kết']);
  });

  it('adds nothing for a blank name, and the add button is locked until there is one', () => {
    const { names, newRow, seen } = show([]);
    const add = screen.getByRole('button', { name: vi_.addSection });
    expect(add.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(add);
    fireEvent.change(newRow(), { target: { value: '   ' } });
    fireEvent.keyDown(newRow(), { key: 'Enter' });
    expect(names()).toEqual([]);
    expect(seen).toEqual([]);

    fireEvent.change(newRow(), { target: { value: 'Hậu cần' } });
    expect(add.getAttribute('aria-disabled')).toBeNull();
    fireEvent.click(add);
    expect(names()).toEqual(['Hậu cần']);
  });

  it('does not submit the form around it on Enter', () => {
    let submitted = 0;
    const seen: TemplateSection[][] = [];
    render(
      <form onSubmit={(e) => { e.preventDefault(); submitted += 1; }}>
        <Harness initial={templateSections('by_time', 'vi')} seen={seen} />
        <button type="submit">ok</button>
      </form>,
    );
    const newRow = screen.getByRole('textbox', { name: vi_.newSectionName });
    fireEvent.change(newRow, { target: { value: 'Tháng sau' } });
    const enter = fireEvent.keyDown(newRow, { key: 'Enter' });
    expect(enter).toBe(false);
    const first = screen.getByDisplayValue('Tuần này');
    expect(fireEvent.keyDown(first, { key: 'Enter' })).toBe(false);
    expect(submitted).toBe(0);
  });

  it('renames a section in place', () => {
    const { names, last } = show();
    fireEvent.change(screen.getByDisplayValue('Thiết kế'), { target: { value: 'Thiết kế giao diện' } });
    expect(names()[1]).toBe('Thiết kế giao diện');
    expect(last()[1]).toEqual({ name: 'Thiết kế giao diện', description: 'Thiết kế giải pháp, giao diện và kiến trúc trước khi phát triển' });
  });

  it('edits a description', () => {
    const { last } = show();
    const description = screen.getByRole('textbox', { name: t('vi', 'sectionDescriptionOf', { name: 'Kiểm thử' }) });
    fireEvent.change(description, { target: { value: 'Kiểm thử tự động và thủ công' } });
    expect(last()[3]).toEqual({ name: 'Kiểm thử', description: 'Kiểm thử tự động và thủ công' });
  });

  it('marks a section left without a name', () => {
    show();
    const name = screen.getByDisplayValue('Thiết kế');
    fireEvent.change(name, { target: { value: '  ' } });
    expect(name.getAttribute('aria-invalid')).toBe('true');
    const message = document.getElementById(name.getAttribute('aria-describedby')!.split(' ')[0]!);
    expect(message?.textContent).toBe(vi_.sectionNeedsNameRow);
  });

  it('removes a section, and focus moves to the one after it', () => {
    const { names, last } = show();
    fireEvent.click(screen.getByRole('button', { name: t('vi', 'removeSectionFromList', { name: 'Thiết kế' }) }));
    expect(names()).toEqual(['Phân tích', 'Phát triển', 'Kiểm thử', 'Triển khai']);
    expect(last().map((s) => s.name)).toEqual(['Phân tích', 'Phát triển', 'Kiểm thử', 'Triển khai']);
    expect(document.activeElement).toBe(screen.getByDisplayValue('Phát triển'));
  });

  it('moves the focus to the new row when the last section is removed', () => {
    const { names, newRow } = show([{ name: 'Một mình', description: '' }]);
    fireEvent.click(screen.getByRole('button', { name: t('vi', 'removeSectionFromList', { name: 'Một mình' }) }));
    expect(names()).toEqual([]);
    expect(document.activeElement).toBe(newRow());
  });

  it('reorders with the up and down buttons, and the moved button keeps the focus', () => {
    const { names } = show();
    const up = screen.getByRole('button', { name: t('vi', 'moveSectionUp', { name: 'Thiết kế' }) });
    up.focus();
    fireEvent.click(up);
    expect(names()).toEqual(['Thiết kế', 'Phân tích', 'Phát triển', 'Kiểm thử', 'Triển khai']);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: t('vi', 'moveSectionUp', { name: 'Thiết kế' }) }));

    fireEvent.click(screen.getByRole('button', { name: t('vi', 'moveSectionDown', { name: 'Phát triển' }) }));
    expect(names()).toEqual(['Thiết kế', 'Phân tích', 'Kiểm thử', 'Phát triển', 'Triển khai']);
  });

  it('locks moving the first section up and the last one down', () => {
    const { names } = show();
    const up = screen.getByRole('button', { name: t('vi', 'moveSectionUp', { name: 'Phân tích' }) });
    const down = screen.getByRole('button', { name: t('vi', 'moveSectionDown', { name: 'Triển khai' }) });
    expect(up.getAttribute('aria-disabled')).toBe('true');
    expect(down.getAttribute('aria-disabled')).toBe('true');
    expect(document.getElementById(up.getAttribute('aria-describedby')!)?.textContent).toBe(vi_.sectionAlreadyFirst);
    expect(document.getElementById(down.getAttribute('aria-describedby')!)?.textContent).toBe(vi_.sectionAlreadyLast);
    fireEvent.click(up);
    fireEvent.click(down);
    expect(names()).toEqual(['Phân tích', 'Thiết kế', 'Phát triển', 'Kiểm thử', 'Triển khai']);
    expect(screen.getByRole('button', { name: t('vi', 'moveSectionUp', { name: 'Thiết kế' }) }).getAttribute('aria-disabled')).toBeNull();
  });

  it('reorders with Alt and the arrow keys from a row, keeping the focus in the field', () => {
    const { names } = show();
    const name = screen.getByDisplayValue('Phát triển');
    name.focus();
    fireEvent.keyDown(name, { key: 'ArrowUp', altKey: true });
    expect(names()).toEqual(['Phân tích', 'Phát triển', 'Thiết kế', 'Kiểm thử', 'Triển khai']);
    expect(document.activeElement).toBe(screen.getByDisplayValue('Phát triển'));

    const description = screen.getByRole('textbox', { name: t('vi', 'sectionDescriptionOf', { name: 'Phát triển' }) });
    description.focus();
    fireEvent.keyDown(description, { key: 'ArrowDown', altKey: true });
    fireEvent.keyDown(screen.getByRole('textbox', { name: t('vi', 'sectionDescriptionOf', { name: 'Phát triển' }) }), { key: 'ArrowDown', altKey: true });
    expect(names()).toEqual(['Phân tích', 'Thiết kế', 'Kiểm thử', 'Phát triển', 'Triển khai']);
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: t('vi', 'sectionDescriptionOf', { name: 'Phát triển' }) }));

    // Without Alt an arrow is the field's own.
    fireEvent.keyDown(screen.getByDisplayValue('Phát triển'), { key: 'ArrowUp' });
    expect(names()).toEqual(['Phân tích', 'Thiết kế', 'Kiểm thử', 'Phát triển', 'Triển khai']);
  });

  it('names every control for a screen reader by its section', () => {
    show();
    for (const [key, name] of [
      ['moveSectionUp', 'Đưa Thiết kế lên'],
      ['moveSectionDown', 'Đưa Thiết kế xuống'],
      ['removeSectionFromList', 'Bỏ Thiết kế'],
    ] as const) {
      expect(t('vi', key, { name: 'Thiết kế' })).toBe(name);
      expect(screen.getByRole('button', { name })).toBeTruthy();
    }
    expect(screen.getByRole('textbox', { name: 'Mô tả của Thiết kế' })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: t('vi', 'sectionNameAt', { n: 2 }) })).toBe(screen.getByDisplayValue('Thiết kế'));
    expect(screen.getByRole('textbox', { name: vi_.newSectionName })).toBeTruthy();
  });

  it('suggests a sub-label for a section named like a status or a label, without refusing it', () => {
    const { names } = show([]);
    const newRow = screen.getByRole('textbox', { name: vi_.newSectionName });
    for (const name of ['Đang làm', 'chờ duyệt', 'Thiết kế']) {
      fireEvent.change(newRow, { target: { value: name } });
      fireEvent.keyDown(newRow, { key: 'Enter' });
    }
    expect(names()).toEqual(['Đang làm', 'chờ duyệt', 'Thiết kế']);
    const hintOf = (value: string) => {
      const input = screen.getByDisplayValue(value);
      const ids = (input.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean);
      return ids.map((id) => document.getElementById(id)?.textContent ?? '').join(' ');
    };
    expect(hintOf('Đang làm')).toBe(vi_.sectionLooksLikeStatus);
    expect(hintOf('chờ duyệt')).toBe(vi_.sectionLooksLikeStatus);
    expect(hintOf('Thiết kế')).toBe('');
  });
});
