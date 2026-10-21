export class AgentFlowError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly detail?: string,
    readonly requestId?: string,
    readonly fieldErrors?: unknown[],
  ) {
    super(detail ? `${code}: ${detail}` : code);
    this.name = 'AgentFlowError';
  }
}

export async function ok<T>(result: Promise<{ data?: T; error?: unknown; response: Response }>): Promise<T> {
  const { data, error, response } = await result;
  if (response.ok && error === undefined) return data as T;
  const p = (error ?? {}) as { type?: string; detail?: string; request_id?: string; field_errors?: unknown[] };
  throw new AgentFlowError(response.status, p.type ?? `HTTP_${response.status}`, p.detail, p.request_id, p.field_errors ?? undefined);
}
