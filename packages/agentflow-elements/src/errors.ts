export interface Problem {
  code: string;
  status: number;
  detail?: string;
  requestId?: string;
  fieldErrors?: { path: string; message: string }[];
}

const ACCESS_LOST = new Set(['APP_NOT_ASSIGNED', 'APP_NOT_INSTALLED', 'USER_NOT_PROJECTED']);

export type Classified = { type: 'signed-out' } | { type: 'access-lost'; code: string } | { type: 'other'; problem: Problem };

type Shaped = { status: number; code: string; detail?: unknown; requestId?: unknown; fieldErrors?: unknown };

// By shape, never `instanceof`: an element from another build throws its own copy of the SDK's
// error class, and this provider must still read it.
function isApiError(error: unknown): error is Shaped {
  const e = error as Partial<Shaped> | null;
  return typeof e === 'object' && e !== null && typeof e.status === 'number' && typeof e.code === 'string';
}

const isFieldError = (e: unknown): e is { path: string; message: string } =>
  typeof e === 'object' && e !== null && typeof (e as { path?: unknown }).path === 'string' && typeof (e as { message?: unknown }).message === 'string';

export function classify(error: unknown): Classified {
  if (isApiError(error)) {
    if (error.status === 401) return { type: 'signed-out' };
    if (error.status === 403 && ACCESS_LOST.has(error.code)) return { type: 'access-lost', code: error.code };
    const problem: Problem = { code: error.code, status: error.status };
    if (typeof error.detail === 'string') problem.detail = error.detail;
    if (typeof error.requestId === 'string') problem.requestId = error.requestId;
    if (Array.isArray(error.fieldErrors)) problem.fieldErrors = error.fieldErrors.filter(isFieldError).map(({ path, message }) => ({ path, message }));
    return { type: 'other', problem };
  }
  return {
    type: 'other',
    problem: { code: 'NETWORK_ERROR', status: 0, detail: error instanceof Error ? error.message : String(error) },
  };
}
