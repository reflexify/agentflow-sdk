import { describe, expect, it } from 'vitest';
import { ProjectsError } from '../../src/api/projects-api.js';
import { labelDeleteRefusalText, refusalText } from '../../src/data/failure.js';
import { t, type Lang } from '../../src/text.js';

const say = (lang: Lang) => (key: Parameters<typeof t>[1], vars?: Parameters<typeof t>[2]) => t(lang, key, vars);
const refusal = (kind: ProjectsError['kind'], status: number, code: string, reason: string | null) => new ProjectsError(kind, status, code, reason);

describe('what a refusal says', () => {
  it("says the platform's known refusals in the module's own words, in Vietnamese and English", () => {
    const known = [
      [refusal('refused', 422, 'STAGE_TRANSITION_NOT_ALLOWED', "limited to: the work's holder"), 'refusedStageMove'],
      [refusal('forbidden', 403, 'ENTITY_ACCESS_DENIED', 'you may not assign this work'), 'refusedAccess'],
      [refusal('conflict', 409, 'WORK_ALREADY_CLAIMED', 'already claimed by 0190…'), 'refusedAlreadyClaimed'],
    ] as const;
    for (const [e, key] of known) {
      expect(refusalText(e, say('vi'))).toBe(t('vi', key));
      expect(refusalText(e, say('en'))).toBe(t('en', key));
    }
    expect(t('vi', 'refusedStageMove')).toBe('Task không chuyển được sang trạng thái này');
    expect(t('vi', 'refusedAccess')).toBe('Bạn không có quyền làm việc này');
    expect(t('vi', 'refusedAlreadyClaimed')).toBe('Người khác vừa nhận task này');
  });

  it("keeps a broken rule's message as the package wrote it, and any other server sentence", () => {
    const rule = refusal('refused', 422, 'ENTITY_VALIDATION_RULE_FAILED', 'Chỉ người chính hoặc quản lý được sửa');
    expect(refusalText(rule, say('en'))).toBe('Chỉ người chính hoặc quản lý được sửa');
    expect(refusalText(refusal('invalid', 422, 'VALIDATION_ERROR', 'required fields cannot be emptied: title'), say('vi')))
      .toBe('required fields cannot be emptied: title');
  });

  it('says the refusal of a write that would leave a project with no manager in its own words', () => {
    const e = refusal('invalid', 422, 'VALIDATION_ERROR', "required field 'managers' cannot be cleared");
    expect(refusalText(e, say('vi'))).toBe('Project cần ít nhất một quản lý');
    expect(refusalText(e, say('en'))).toBe('A project needs at least one manager');
  });

  it('says a refused label delete with its numbers, and the server sentence when it gave none', () => {
    const forbidden = new ProjectsError('forbidden', 403, 'ENTITY_RECORD_CASCADE_FORBIDDEN', 'would change records you cannot edit', undefined, null, null, null, { forbidden: 4 });
    expect(labelDeleteRefusalText(forbidden, say('vi'))).toBe('Nhãn đang được dùng trong 4 task bạn không sửa được');
    expect(labelDeleteRefusalText(forbidden, say('en'))).toBe('This label is used by 4 tasks you cannot edit');
    // Found and cap both count the label itself: 501 records is 500 tasks, and one delete changes at most 499.
    const large = new ProjectsError('invalid', 422, 'ENTITY_RECORD_CASCADE_TOO_LARGE', 'too big', undefined, null, null, null, { found: 501, cap: 500 });
    expect(labelDeleteRefusalText(large, say('en'))).toBe('This label is used by 500 tasks, more than the 499 one delete can change');
    expect(labelDeleteRefusalText(refusal('forbidden', 403, 'ENTITY_RECORD_CASCADE_FORBIDDEN', 'would change records you cannot edit'), say('vi')))
      .toBe('would change records you cannot edit');
  });

  it('keeps the server sentence for any other record\'s cascading refusal, never the label wording', () => {
    const forbidden = new ProjectsError('forbidden', 403, 'ENTITY_RECORD_CASCADE_FORBIDDEN', 'would change records you cannot edit', undefined, null, null, null, { forbidden: 4 });
    expect(refusalText(forbidden, say('vi'))).toBe('would change records you cannot edit');
    const large = new ProjectsError('invalid', 422, 'ENTITY_RECORD_CASCADE_TOO_LARGE', 'would touch 501 records', undefined, null, null, null, { found: 501, cap: 500 });
    expect(refusalText(large, say('vi'))).toBe('would touch 501 records');
  });

  it('has nothing to say for a refusal without a sentence, or for what is not a refusal', () => {
    expect(refusalText(refusal('failed', 500, 'INTERNAL', null), say('vi'))).toBeNull();
    expect(refusalText(new Error('boom'), say('vi'))).toBeNull();
  });
});
