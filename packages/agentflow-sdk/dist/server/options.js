import { fromBase64Url } from '../base64url.js';
const DEFAULT_BASE_PATH = '/agentflow';
const DEFAULT_AFTER_SIGN_IN = '/';
const DEFAULT_SESSION_TTL_SECONDS = 43_200;
/** Fills in every optional field's default, derives the two cookie names from `secureCookies`, and
 * trims trailing slashes from `apiBaseUrl` so every route can append `/{path}` to it. */
export function resolveOptions(options) {
    checkSessionKey(options.sessionKey);
    const basePath = normalizeBasePath(options.basePath ?? DEFAULT_BASE_PATH);
    const secureCookies = options.secureCookies ?? true;
    return {
        ...options,
        apiBaseUrl: options.apiBaseUrl.replace(/\/+$/, ''),
        basePath,
        secureCookies,
        afterSignIn: options.afterSignIn ?? DEFAULT_AFTER_SIGN_IN,
        sessionTtlSeconds: options.sessionTtlSeconds ?? DEFAULT_SESSION_TTL_SECONDS,
        loginCookieName: secureCookies ? '__Host-agentflow_login' : 'agentflow_login',
        sessionCookieName: secureCookies ? '__Host-agentflow_session' : 'agentflow_session',
    };
}
function normalizeBasePath(basePath) {
    const trimmed = basePath.replace(/\/+$/, '');
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}
const SESSION_KEY_BYTES = 32;
/** Refuses a bad `sessionKey` at construction. Otherwise it would surface only on the first
 * sign-in, as a failure to seal the login cookie. The message never includes the key. */
function checkSessionKey(sessionKey) {
    let problem;
    if (typeof sessionKey !== 'string') {
        problem = 'it is missing';
    }
    else {
        let bytes;
        try {
            bytes = fromBase64Url(sessionKey).byteLength;
        }
        catch {
            bytes = undefined;
        }
        if (bytes === SESSION_KEY_BYTES)
            return;
        problem = bytes === undefined ? 'it is not base64url' : `it decodes to ${bytes} bytes`;
    }
    throw new Error(`AgentFlow server misconfigured: sessionKey must be ${SESSION_KEY_BYTES} random bytes, base64url-encoded (43 characters); ${problem}`);
}
//# sourceMappingURL=options.js.map