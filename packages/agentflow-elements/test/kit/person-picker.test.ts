import { describe, expect, it } from 'vitest';
import '../../src/kit/index.js';
import { settle, shadow, watchDocumentKeyListeners } from '../support.js';

const PEOPLE = [
  { id: 'u1', name: 'Nguyễn Văn Bình', email: 'binh@acme.vn' },
  { id: 'u2', name: 'Trần Thị Hoa', email: 'hoa@acme.vn' },
  { id: 'u3', name: 'Lê Minh', email: null },
];
type PickerEl = HTMLElement & { people: unknown; value: unknown; multiple: boolean };

async function picker(props: Partial<PickerEl>) {
  document.body.innerHTML = '';
  const el = document.createElement('af-person-picker') as PickerEl;
  Object.assign(el, { people: PEOPLE }, props);
  document.body.append(el);
  await settle();
  return el;
}
const typeInto = async (el: HTMLElement, text: string) => {
  const input = shadow(el).querySelector('[part="input"]') as HTMLInputElement;
  input.focus();
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  await settle();
};
const options = (el: HTMLElement) => [...shadow(el).querySelectorAll('[part="option"]')].map((o) => o.textContent?.trim() ?? '');

describe('<af-person-picker>', () => {
  it('filters without accents and emits search', async () => {
    const el = await picker({ value: null });
    const searches: unknown[] = [];
    el.addEventListener('search', (e) => searches.push((e as CustomEvent).detail));
    await typeInto(el, 'binh');
    expect(options(el).some((t) => t.includes('Nguyễn Văn Bình'))).toBe(true);
    expect(options(el).some((t) => t.includes('Trần Thị Hoa'))).toBe(false);
    expect(searches.at(-1)).toEqual({ query: 'binh' });
  });

  it('picks one person', async () => {
    const el = await picker({ value: null });
    const seen: unknown[] = [];
    el.addEventListener('change', (e) => seen.push((e as CustomEvent).detail));
    await typeInto(el, 'hoa');
    (shadow(el).querySelector('[part="option"]') as HTMLElement).click();
    await settle();
    expect(seen).toEqual([{ value: 'u2' }]);
  });

  it('adds and removes people in multiple mode, as the app echoes each change', async () => {
    const el = await picker({ value: ['u1'], multiple: true });
    const chips = () => [...shadow(el).querySelectorAll('[part="chip"]')].map((c) => c.textContent ?? '');
    expect(chips()).toEqual([expect.stringContaining('Nguyễn Văn Bình')]);
    const seen: unknown[] = [];
    el.addEventListener('change', (e) => {
      const detail = (e as CustomEvent<{ value: unknown }>).detail;
      seen.push(detail);
      el.value = detail.value;
    });
    await typeInto(el, 'minh');
    (shadow(el).querySelector('[part="option"]') as HTMLElement).click();
    await settle();
    expect(chips()).toHaveLength(2);
    (shadow(el).querySelector('[part="remove"]') as HTMLElement).click();
    await settle();
    expect(seen).toEqual([{ value: ['u1', 'u3'] }, { value: ['u3'] }]);
    expect(chips()).toEqual([expect.stringContaining('Lê Minh')]);
  });

  it('shows what value says until the app sets it', async () => {
    const el = await picker({ value: ['u1'], multiple: true });
    const seen: unknown[] = [];
    el.addEventListener('change', (e) => seen.push((e as CustomEvent).detail));
    await typeInto(el, 'minh');
    (shadow(el).querySelector('[part="option"]') as HTMLElement).click();
    await settle();
    expect(seen).toEqual([{ value: ['u1', 'u3'] }]);
    expect(shadow(el).querySelectorAll('[part="chip"]')).toHaveLength(1);
  });

  it('adds no key listener of its own to document or window, mounted or open', async () => {
    const watch = watchDocumentKeyListeners();
    try {
      const el = await picker({ value: null });
      await typeInto(el, 'h');
      expect(watch.fromKit()).toEqual([]);
    } finally {
      watch.restore();
    }
  });

  it('shows initials when a person has no avatar', async () => {
    const el = await picker({ value: ['u3'], multiple: true });
    expect(shadow(el).querySelector('[part="chip"] .af-avatar')?.textContent).toBe('LM');
  });

  it('keeps typed Vietnamese text as typed and matches it with or without marks, đ included', async () => {
    const el = await picker({ value: null, people: [...PEOPLE, { id: 'u4', name: 'Đặng Quốc Đạt', email: 'dat@acme.vn' }] });
    const searches: unknown[] = [];
    el.addEventListener('search', (e) => searches.push((e as CustomEvent).detail));
    const input = () => shadow(el).querySelector('[part="input"]') as HTMLInputElement;
    await typeInto(el, 'Nguyễn');
    expect(input().value).toBe('Nguyễn');
    expect(options(el)).toEqual([expect.stringContaining('Nguyễn Văn Bình')]);
    await typeInto(el, 'Nguye\u0302\u0303n');
    expect(input().value).toBe('Nguye\u0302\u0303n');
    expect(options(el)).toEqual([expect.stringContaining('Nguyễn Văn Bình')]);
    await typeInto(el, 'dang');
    expect(options(el)).toEqual([expect.stringContaining('Đặng Quốc Đạt')]);
    await typeInto(el, 'ĐẶNG');
    expect(options(el)).toEqual([expect.stringContaining('Đặng Quốc Đạt')]);
    expect(searches.at(-1)).toEqual({ query: 'ĐẶNG' });
  });

  it('matches the email, and says so when nothing matches', async () => {
    const el = await picker({ value: null });
    await typeInto(el, 'hoa@');
    expect(options(el)).toEqual([expect.stringContaining('Trần Thị Hoa')]);
    await typeInto(el, 'zzz');
    expect(options(el)).toEqual([]);
    expect(shadow(el).querySelector('[part="empty"]')?.textContent).toBe('No matches');
    el.setAttribute('locale', 'vi');
    await settle();
    expect(shadow(el).querySelector('[part="empty"]')?.textContent).toBe('Không có kết quả');
  });

  it('shows the chosen person in single mode and clears only by an emitted change', async () => {
    const el = await picker({ value: 'u2' });
    const input = () => shadow(el).querySelector('[part="input"]') as HTMLInputElement;
    expect(input().value).toBe('Trần Thị Hoa');
    const seen: unknown[] = [];
    el.addEventListener('change', (e) => seen.push((e as CustomEvent).detail));
    (shadow(el).querySelector('[part="clear"]') as HTMLElement).click();
    await settle();
    expect(seen).toEqual([{ value: null }]);
    expect(input().value).toBe('Trần Thị Hoa');
    el.value = null;
    await settle();
    expect(input().value).toBe('');
  });

  it('does not search when the app changes value, and draws the image when a person has one', async () => {
    const el = await picker({ value: ['u1'], multiple: true, people: [{ id: 'u1', name: 'Binh', avatar: 'https://x.test/b.png' }] });
    const searches: unknown[] = [];
    el.addEventListener('search', (e) => searches.push((e as CustomEvent).detail));
    el.value = [];
    await settle();
    expect(searches).toEqual([]);
    el.value = ['u1'];
    await settle();
    expect(shadow(el).querySelector('[part="chip"] .af-avatar img')?.getAttribute('src')).toBe('https://x.test/b.png');
  });

  it('lets nothing be removed or chosen while disabled', async () => {
    const el = await picker({ value: ['u1'], multiple: true, disabled: true } as Partial<PickerEl>);
    expect((shadow(el).querySelector('[part="remove"]') as HTMLButtonElement).disabled).toBe(true);
    expect((shadow(el).querySelector('[part="input"]') as HTMLInputElement).disabled).toBe(true);
  });

  it('picks the highlighted first match on Enter', async () => {
    const el = await picker({ value: null });
    const seen: unknown[] = [];
    el.addEventListener('change', (e) => seen.push((e as CustomEvent).detail));
    await typeInto(el, 'tran');
    (shadow(el).querySelector('[part="input"]') as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }));
    await settle();
    expect(seen).toEqual([{ value: 'u2' }]);
  });

  it('names someone the list does not hold as unknown, never by id, and numbers several so their chips differ', async () => {
    const el = await picker({ value: ['u1', 'gone-1', 'gone-2'], multiple: true, locale: 'vi' } as Partial<PickerEl>);
    const chips = () => [...shadow(el).querySelectorAll('[part="chip"]')].map((c) => c.textContent?.trim() ?? '');
    expect(chips()).toEqual([expect.stringContaining('Nguyễn Văn Bình'), expect.stringContaining('Người không rõ 1'), expect.stringContaining('Người không rõ 2')]);
    expect(chips().join(' ')).not.toContain('gone-');
    const removes = [...shadow(el).querySelectorAll('[part="remove"]')].map((b) => b.getAttribute('aria-label'));
    expect(removes).toEqual(['Bỏ: Nguyễn Văn Bình', 'Bỏ: Người không rõ 1', 'Bỏ: Người không rõ 2']);
  });

  it('says one unknown person without a number, and in single mode puts the words in the input', async () => {
    const el = await picker({ value: 'gone', locale: 'en' } as Partial<PickerEl>);
    expect((shadow(el).querySelector('[part="input"]') as HTMLInputElement).value).toBe('Unknown person');
  });

  it('names its input from label, and has no name of its own without one', async () => {
    const el = await picker({ value: null, label: 'Người làm' } as Partial<PickerEl>);
    expect((shadow(el).querySelector('[part="input"]') as HTMLInputElement).getAttribute('aria-label')).toBe('Người làm');
    const bare = await picker({ value: null });
    expect((shadow(bare).querySelector('[part="input"]') as HTMLInputElement).hasAttribute('aria-label')).toBe(false);
  });

  it('survives a repeated id in value or in people, and shows each person once', async () => {
    const errors: unknown[] = [];
    const onError = (e: ErrorEvent) => errors.push(e.error);
    window.addEventListener('error', onError);
    try {
      const el = await picker({ value: ['u1', 'u1', 'u2'], multiple: true, people: [...PEOPLE, { id: 'u1', name: 'Bình khác' }] } as Partial<PickerEl>);
      const chips = [...shadow(el).querySelectorAll('[part="chip"]')].map((c) => c.textContent?.trim() ?? '');
      expect(chips).toEqual([expect.stringContaining('Nguyễn Văn Bình'), expect.stringContaining('Trần Thị Hoa')]);
      await typeInto(el, 'b');
      expect(options(el).filter((t) => t.includes('Bình'))).toEqual([expect.stringContaining('Nguyễn Văn Bình')]);
      expect(errors).toEqual([]);
    } finally {
      window.removeEventListener('error', onError);
    }
  });

  it('shows an ellipsis for an id only while loading, and nothing for an empty list that is not', async () => {
    const loading = await picker({ value: ['u9'], multiple: true, people: [], loading: true, locale: 'en' } as Partial<PickerEl>);
    expect(shadow(loading).querySelector('[part="chip"]')?.textContent).toContain('…');
    const idle = await picker({ value: ['u9'], multiple: true, people: [], locale: 'en' } as Partial<PickerEl>);
    expect(shadow(idle).querySelector('[part="chip"]')?.textContent).not.toContain('…');
    expect(shadow(idle).textContent).not.toContain('Unknown person');
    const loaded = await picker({ value: ['u9'], multiple: true, loading: false, locale: 'en' } as Partial<PickerEl>);
    expect(shadow(loaded).querySelector('[part="chip"]')?.textContent).toContain('Unknown person');
    const stillLoading = await picker({ value: ['u9'], multiple: true, loading: true, locale: 'en' } as Partial<PickerEl>);
    expect(shadow(stillLoading).querySelector('[part="chip"]')?.textContent).toContain('…');
  });

  it('calls no one unknown while the list of people is still empty', async () => {
    const single = await picker({ value: 'u1', people: [], locale: 'en' } as Partial<PickerEl>);
    expect((shadow(single).querySelector('[part="input"]') as HTMLInputElement).value).toBe('');
    expect(shadow(single).textContent).not.toContain('Unknown person');
    const many = await picker({ value: ['u1', 'u2'], multiple: true, people: [], locale: 'en' } as Partial<PickerEl>);
    expect(shadow(many).textContent).not.toContain('Unknown person');
    expect(shadow(many).querySelectorAll('[part="chip"]')).toHaveLength(2);
  });
});
