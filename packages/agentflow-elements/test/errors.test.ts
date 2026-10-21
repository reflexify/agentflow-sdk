import { AgentFlowError } from '@reflexify/agentflow-sdk';
import { describe, expect, it } from 'vitest';
import { classify } from '../src/errors.js';

// Another build's copy of the SDK error: same shape, a different class.
class ForeignError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly detail?: string,
  ) {
    super(code);
  }
}

describe('classify', () => {
  it('treats any 401 as signed out', () => {
    expect(classify(new AgentFlowError(401, 'NOT_SIGNED_IN'))).toEqual({ type: 'signed-out' });
    expect(classify(new AgentFlowError(401, 'TOKEN_EXPIRED'))).toEqual({ type: 'signed-out' });
  });
  it('treats the app refusals as lost access', () => {
    for (const code of ['APP_NOT_ASSIGNED', 'APP_NOT_INSTALLED', 'USER_NOT_PROJECTED']) {
      expect(classify(new AgentFlowError(403, code))).toEqual({ type: 'access-lost', code });
    }
  });
  it('treats any other 403 as a problem to show, not lost access', () => {
    expect(classify(new AgentFlowError(403, 'FORBIDDEN'))).toEqual({
      type: 'other',
      problem: { code: 'FORBIDDEN', status: 403 },
    });
  });
  it('passes anything else back as a problem to show', () => {
    const err = new AgentFlowError(409, 'TASK_ALREADY_CLAIMED', 'taken', 'req-1', [{ path: '/a', message: 'm' }]);
    expect(classify(err)).toEqual({
      type: 'other',
      problem: { code: 'TASK_ALREADY_CLAIMED', status: 409, detail: 'taken', requestId: 'req-1', fieldErrors: [{ path: '/a', message: 'm' }] },
    });
    expect(classify(new TypeError('fetch failed'))).toEqual({
      type: 'other',
      problem: { code: 'NETWORK_ERROR', status: 0, detail: 'fetch failed' },
    });
  });

  describe('by shape, not by class, because another build carries another error class', () => {
    it('reads a plain object with a numeric status and a string code as an API error', () => {
      expect(classify({ status: 401, code: 'NOT_SIGNED_IN' })).toEqual({ type: 'signed-out' });
      expect(classify({ status: 403, code: 'APP_NOT_ASSIGNED' })).toEqual({ type: 'access-lost', code: 'APP_NOT_ASSIGNED' });
      expect(
        classify({ status: 422, code: 'SUBMISSION_VALIDATION', detail: 'd', requestId: 'r', fieldErrors: [{ path: '/x', message: 'm' }] }),
      ).toEqual({
        type: 'other',
        problem: { code: 'SUBMISSION_VALIDATION', status: 422, detail: 'd', requestId: 'r', fieldErrors: [{ path: '/x', message: 'm' }] },
      });
    });

    it('reads another class of the same shape the same way', () => {
      expect(classify(new ForeignError(401, 'NOT_SIGNED_IN'))).toEqual({ type: 'signed-out' });
      expect(classify(new ForeignError(500, 'INTERNAL', 'later'))).toEqual({
        type: 'other',
        problem: { code: 'INTERNAL', status: 500, detail: 'later' },
      });
    });

    it('keeps only the optional fields that have their documented types', () => {
      expect(
        classify({ status: 422, code: 'X', detail: 7, requestId: null, fieldErrors: [{ path: '/a', message: 'm' }, { path: 1 }, 'bad', null] }),
      ).toEqual({ type: 'other', problem: { code: 'X', status: 422, fieldErrors: [{ path: '/a', message: 'm' }] } });
      expect(classify({ status: 422, code: 'X', fieldErrors: 'nope' })).toEqual({ type: 'other', problem: { code: 'X', status: 422 } });
    });

    it('treats anything without that shape as a network failure', () => {
      for (const value of [{ status: '401', code: 'NOT_SIGNED_IN' }, { status: 401 }, { code: 'NOT_SIGNED_IN' }, null, 'boom', 42]) {
        expect(classify(value), JSON.stringify(value)).toMatchObject({ type: 'other', problem: { code: 'NETWORK_ERROR', status: 0 } });
      }
    });
  });
});
