// RFC 6749 §5.2's charset for an OAuth `error`. Every code printed must match it: the error of an
// authorization response comes from the callback's query string, which anyone can write, and a raw
// escape sequence there would rewrite the terminal.
const PRINTABLE_CODE = /^[\x20\x21\x23-\x5B\x5D-\x7E]{1,64}$/;
const printable = (value: unknown) => (typeof value === 'string' && PRINTABLE_CODE.test(value) ? value : undefined);

// The provider's `error`, by shape: openid-client throws oauth4webapi's classes as they are.
function oauthError(error: Error): string | undefined {
  switch (error.name) {
    case 'ResponseBodyError':
    case 'AuthorizationResponseError':
      return printable((error as { error?: unknown }).error);
    case 'WWWAuthenticateChallengeError': {
      const first: unknown = Array.isArray(error.cause) ? error.cause[0] : undefined;
      return printable((first as { parameters?: { error?: unknown } } | undefined)?.parameters?.error);
    }
    default:
      return undefined;
  }
}

const codeOf = (error: Error) => oauthError(error) ?? printable((error as { code?: unknown }).code);

// A message can carry request text: jose names a token header's unrecognised `crit` entry, and the
// back-channel logout route takes tokens from anyone.
const oneLine = (text: string) =>
  text.replace(/[\x00-\x1f\x7f-\x9f]/g, (c) => `\\x${c.charCodeAt(0).toString(16).padStart(2, '0')}`);

/**
 * One line that is safe to log for any error the SDK reports or throws: the error's name and
 * message with control characters escaped, then in brackets up to two codes — the provider's OAuth
 * `error` where there is one, else the error's `code` — from the error and from its direct cause.
 *
 * Never the error object itself, nor its cause's: a failed token-response check carries the whole
 * token response (access, refresh and ID tokens) as `cause.body`, and printing an error prints its
 * cause. Only codes are read, one level down, which is where the SDK keeps the provider's answer to
 * a failed refresh.
 */
export function describeError(error: unknown): string {
  if (!(error instanceof Error)) return `a thrown ${typeof error}`;
  const codes = [codeOf(error), error.cause instanceof Error ? codeOf(error.cause) : undefined];
  const shown = codes.filter((code, i): code is string => code !== undefined && codes.indexOf(code) === i);
  return `${oneLine(error.name)}: ${oneLine(error.message)}${shown.length ? ` (${shown.join(', ')})` : ''}`;
}
