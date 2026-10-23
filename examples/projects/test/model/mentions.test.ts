import { describe, expect, it } from 'vitest';
import { bodyOf, draftOf, labelFor, personToken, scanMentions, stillPicked } from '../../src/model/mentions.js';

const HOA = '00000000-0000-4000-8000-000000000003';
const MINH = '00000000-0000-4000-8000-000000000002';
const RECORD = 'record/00000000-0000-4000-8000-000000000103/00000000-0000-4000-8000-0000000000aa';

describe('mention tokens', () => {
  it('scans person and record tokens, and reads an escaped label whole', () => {
    const text = `a ${personToken('Lê [Hoa]', HOA)} b @[Mật](mention:${RECORD})`;
    expect(scanMentions(text).map((t) => [t.kind, t.label, t.target])).toEqual([['user', 'Lê [Hoa]', `user/${HOA}`], ['record', 'Mật', RECORD]]);
  });

  it('leaves a link, a stray bracket and an unknown kind as text', () => {
    expect(scanMentions('@[docs](https://example.com) @[ x @[a](mention:dashboard/00000000-0000-4000-8000-000000000001)')).toEqual([]);
  });
});

describe('the text a person edits', () => {
  it('shows a person as @Name and keeps a record token or a nameless one as written', () => {
    const body = `${personToken('Lê Thị Hoa', HOA)} xem @[](mention:${RECORD}) nhé`;
    const draft = draftOf(body);
    expect(draft.text).toBe(`@Lê Thị Hoa xem @[](mention:${RECORD}) nhé`);
    expect(draft.picks).toEqual([{ label: 'Lê Thị Hoa', id: HOA }]);
  });

  it('writes the tokens back, longest name first, only for whole names', () => {
    const picks = [{ label: 'Minh', id: MINH }, { label: 'Minh Tuấn', id: HOA }];
    expect(bodyOf('@Minh Tuấn và @Minh, không phải @Minhh hay mail@Minh', picks))
      .toBe(`${personToken('Minh Tuấn', HOA)} và ${personToken('Minh', MINH)}, không phải @Minhh hay mail@Minh`);
  });

  it('round trips what the server sent', () => {
    const body = `Nhờ ${personToken('Lê Thị Hoa', HOA)}, xem @[Hồ sơ](mention:${RECORD}).`;
    const { text, picks } = draftOf(body);
    expect(bodyOf(text, picks)).toBe(body);
  });

  it('drops a person whose @Name was deleted from the text', () => {
    const picks = [{ label: 'Hoa', id: HOA }, { label: 'Minh', id: MINH }];
    expect(stillPicked('chỉ @Minh', picks)).toEqual([{ label: 'Minh', id: MINH }]);
  });
});

describe('people who share a name', () => {
  const ana = { id: HOA, name: 'Nguyễn Văn An', email: 'an.nguyen@example.com' };
  const anb = { id: MINH, name: 'Nguyễn Văn An', email: 'an.nguyen2@example.com' };

  it('labels the second with the start of their email, or a piece of their id without one', () => {
    expect(labelFor(ana, [])).toBe('Nguyễn Văn An');
    expect(labelFor(anb, [{ label: ana.name, id: ana.id }])).toBe('Nguyễn Văn An (an.nguyen2)');
    expect(labelFor({ id: MINH, name: 'Nguyễn Văn An' }, [{ label: ana.name, id: ana.id }])).toBe('Nguyễn Văn An (0000)');
    expect(labelFor(ana, [{ label: ana.name, id: ana.id }])).toBe('Nguyễn Văn An');
  });

  it('writes each their own token', () => {
    const picks = [{ label: 'Nguyễn Văn An', id: HOA }, { label: 'Nguyễn Văn An (an.nguyen2)', id: MINH }];
    expect(bodyOf('@Nguyễn Văn An (an.nguyen2) và @Nguyễn Văn An', picks))
      .toBe(`${personToken('Nguyễn Văn An (an.nguyen2)', MINH)} và ${personToken('Nguyễn Văn An', HOA)}`);
  });

  it('keeps the tokens of a shared label raw when a comment is edited, and still lifts the others', () => {
    const body = `${personToken('An', HOA)} ${personToken('An', MINH)} ${personToken('Bình', '00000000-0000-4000-8000-000000000009')}`;
    const draft = draftOf(body);
    expect(draft.text).toBe(`${personToken('An', HOA)} ${personToken('An', MINH)} @Bình`);
    expect(draft.picks).toEqual([{ label: 'Bình', id: '00000000-0000-4000-8000-000000000009' }]);
    expect(bodyOf(draft.text, draft.picks)).toBe(body);
  });
});
