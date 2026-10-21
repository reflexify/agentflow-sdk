import { createRemoteJWKSet, jwtVerify } from 'jose';
import { reportError } from '../report.js';
const ROUTE = 'auth/backchannel-logout';
const BACKCHANNEL_LOGOUT_EVENT = 'http://schemas.openid.net/event/backchannel-logout';
/** OIDC Back-Channel Logout 1.0 §2.4 names `logout+jwt`; RFC 7515 §4.1.9 lets it carry the `application/` prefix. */
const LOGOUT_TOKEN_TYPES = new Set(['logout+jwt', 'application/logout+jwt']);
/** Anyone can POST here, and nothing is verified until the body has been read. A logout token is
 * well under 2 KiB. */
const MAX_BODY_BYTES = 16 * 1024;
/** Used when the metadata lists no ID token algorithms: OIDC Discovery 1.0 §3 has every provider
 * support RS256. */
const DEFAULT_SIGNING_ALGORITHMS = ['RS256'];
class LogoutTokenRefused extends Error {
    constructor(message) {
        super(message);
        this.name = 'LogoutTokenRefused';
    }
}
/**
 * OIDC Back-Channel Logout 1.0: the provider POSTs a signed logout token naming a `sid`, and every
 * session of that `sid` ends. Answers 200 when they have, 400 for anything else (§2.8) — never a
 * 500, since the caller is the provider, not a browser that could show one.
 */
export async function handleBackchannelLogout(opts) {
    try {
        const sid = await verifiedSid(opts);
        await opts.sessions.deleteBySid(sid);
        return answer(200);
    }
    catch (err) {
        reportError(opts.onError, ROUTE, err);
        return answer(400);
    }
}
async function verifiedSid(opts) {
    const contentType = opts.request.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().startsWith('application/x-www-form-urlencoded')) {
        throw new LogoutTokenRefused('the logout request is not form-encoded');
    }
    const tokens = new URLSearchParams(await readCapped(opts.request)).getAll('logout_token');
    if (tokens.length !== 1 || !tokens[0])
        throw new LogoutTokenRefused('the logout request must carry exactly one logout_token');
    const config = await opts.getConfig();
    const metadata = config.serverMetadata();
    if (!metadata.jwks_uri)
        throw new LogoutTokenRefused('the identity provider advertises no jwks_uri');
    // `exp` is checked when present but not required: Back-Channel Logout 1.0 final requires one,
    // but Reflexify's logout tokens carry none, so `maxTokenAge` bounds their age instead.
    const { payload, protectedHeader } = await jwtVerify(tokens[0], opts.jwksFor(metadata.jwks_uri), {
        issuer: metadata.issuer,
        audience: opts.clientId,
        algorithms: metadata.id_token_signing_alg_values_supported ?? DEFAULT_SIGNING_ALGORITHMS,
        requiredClaims: ['iat', 'jti'],
        maxTokenAge: '5m',
        clockTolerance: 30,
    });
    if (protectedHeader.typ !== undefined && !LOGOUT_TOKEN_TYPES.has(protectedHeader.typ.toLowerCase())) {
        throw new LogoutTokenRefused('the logout token has a typ other than logout+jwt');
    }
    const events = payload.events;
    if (!isObject(events) || !isObject(events[BACKCHANNEL_LOGOUT_EVENT])) {
        throw new LogoutTokenRefused('the logout token carries no back-channel logout event');
    }
    // A nonce would mean an ID token passed off as a logout token.
    if ('nonce' in payload)
        throw new LogoutTokenRefused('the logout token carries a nonce');
    if (typeof payload.sid !== 'string' || payload.sid === '') {
        throw new LogoutTokenRefused('the logout token names no sid');
    }
    return payload.sid;
}
/** The body as text, refused past {@link MAX_BODY_BYTES} whether or not `content-length` says so. */
async function readCapped(request) {
    const declared = request.headers.get('content-length');
    if (declared !== null && !(Number(declared) <= MAX_BODY_BYTES)) {
        throw new LogoutTokenRefused('the logout request declares a body larger than 16 KiB');
    }
    if (!request.body)
        return '';
    const reader = request.body.getReader();
    const decoder = new TextDecoder();
    let size = 0;
    let text = '';
    for (;;) {
        const { done, value } = await reader.read();
        if (done)
            return text + decoder.decode();
        size += value.byteLength;
        if (size > MAX_BODY_BYTES) {
            await reader.cancel();
            throw new LogoutTokenRefused('the logout request body is larger than 16 KiB');
        }
        text += decoder.decode(value, { stream: true });
    }
}
function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function answer(status) {
    return new Response(null, { status, headers: { 'cache-control': 'no-store' } });
}
/** A `jwksFor` that keeps one remote key set per `jwks_uri`; jose refetches on an unknown `kid`. */
export function remoteJwksCache() {
    const sets = new Map();
    return (jwksUri) => {
        let set = sets.get(jwksUri);
        if (!set) {
            set = createRemoteJWKSet(new URL(jwksUri));
            sets.set(jwksUri, set);
        }
        return set;
    };
}
//# sourceMappingURL=backchannel.js.map