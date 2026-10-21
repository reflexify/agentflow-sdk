export type Answer = (request: Request) => Response | Promise<Response>;

export function scriptedFetch(answers: Answer[]) {
  const requests: { method: string; url: URL; body: unknown; contentType: string | null }[] = [];
  async function fetch(request: Request): Promise<Response> {
    const contentType = request.headers.get('content-type');
    const text = request.method === 'GET' ? '' : await request.clone().text();
    const body = contentType?.includes('json') && text ? JSON.parse(text) : text;
    requests.push({ method: request.method, url: new URL(request.url), body, contentType });
    const next = answers.shift();
    if (!next) throw new Error(`unscripted ${request.method} ${request.url}`);
    return next(request);
  }
  return { fetch, requests };
}

export const json = (status: number, body: unknown): Answer => () =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': status >= 400 ? 'application/problem+json' : 'application/json' },
  });

export const problem = (status: number, type: string): Answer =>
  json(status, { type, title: type, status, request_id: 'req-1' });
