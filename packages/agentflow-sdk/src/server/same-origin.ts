/** True when the browser says the request came from this origin: `Sec-Fetch-Site: same-origin`, or
 * an `Origin` equal to the request's own. Anything else — including neither header — is cross-site. */
export function isSameOrigin(request: Request): boolean {
  if (request.headers.get('sec-fetch-site') === 'same-origin') return true;
  const origin = request.headers.get('origin');
  return origin !== null && origin === new URL(request.url).origin;
}
