export type Scripted =
  | { status: number; body?: unknown }
  | { status: number; blob: Blob }
  | { throws: unknown };
export interface SeenRequest { method: string; path: string; search: string; body: unknown }

const API_ROOT = '/agentflow/api';

export function scriptedFetch(answers: Scripted[]) {
  const requests: SeenRequest[] = [];
  async function fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const contentType = request.headers.get('content-type');
    const text = request.method === 'GET' || request.method === 'HEAD' ? '' : await request.clone().text();
    const body = contentType?.includes('json') && text ? JSON.parse(text) : text || undefined;
    const path = url.pathname.startsWith(API_ROOT) ? url.pathname.slice(API_ROOT.length) : url.pathname;
    requests.push({ method: request.method, path, search: url.search, body });
    const next = answers.shift();
    if (!next) throw new Error(`unscripted ${request.method} ${path}${url.search}`);
    if ('throws' in next) throw next.throws;
    if ('blob' in next) return new Response(next.blob, { status: next.status, headers: { 'content-type': next.blob.type } });
    const headers = { 'content-type': next.status >= 400 ? 'application/problem+json' : 'application/json' };
    return new Response(next.body === undefined ? null : JSON.stringify(next.body), { status: next.status, headers });
  }
  return { fetch, requests };
}
