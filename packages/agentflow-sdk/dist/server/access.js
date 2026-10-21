import * as client from 'openid-client';
import { seal, unseal } from './seal.js';
const REFRESH_WHEN_UNDER_MS = 60_000;
/** How long an access token is taken to last when a token response omits `expires_in`. Zero would
 * refresh on every request. */
const DEFAULT_EXPIRES_IN_SECONDS = 300;
// What the callback mints: 32 random bytes, base64url. Checked before any store lookup so a
// forged cookie never reaches a host's SessionStore as an arbitrary key.
const SESSION_ID = /^[A-Za-z0-9_-]{43}$/;
export function isSessionId(value) {
    return SESSION_ID.test(value);
}
/** When an access token issued now with this `expires_in` expires, in epoch milliseconds. */
export function accessExpiresAt(expiresIn) {
    return Date.now() + (expiresIn ?? DEFAULT_EXPIRES_IN_SECONDS) * 1000;
}
/** The session is gone, expired, unreadable, or the provider refused its refresh token
 * (`invalid_grant`). `cause` is set only when that refusal ended it. */
export class NotSignedIn extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = 'NotSignedIn';
    }
}
/** The identity provider could not refresh the session — unreachable, timed out, a 5xx, a 429,
 * an OAuth error other than `invalid_grant` (a misconfigured client's `invalid_client`), or
 * discovery failing. The session is kept, so a later attempt can succeed. */
export class IdpUnavailable extends Error {
    constructor(message, options) {
        super(message, options);
        this.name = 'IdpUnavailable';
    }
}
export function sessionAccess(opts) {
    // Per server instance (each `createAgentFlowServer`), not per process: other replicas, or a second
    // instance on the same store, can still refresh one session concurrently, so `refresh` must
    // survive losing that race.
    const inflight = new Map();
    async function read(sessionId) {
        const record = await opts.sessions.get(sessionId);
        if (!record)
            return undefined;
        // Enforced here, not left to the store: one that ignores `expiresAt` must not extend a session.
        if (record.expiresAt <= Date.now()) {
            await opts.sessions.delete(sessionId);
            return undefined;
        }
        const payload = await unseal(opts.sessionKey, record.sealed);
        return payload ? { record, payload } : undefined;
    }
    async function load(sessionId) {
        return (await read(sessionId))?.payload;
    }
    async function accessTokenFor(sessionId) {
        const current = await read(sessionId);
        if (!current)
            throw new NotSignedIn('no live session for this id');
        if (!needsRefresh(current.payload))
            return current.payload.accessToken;
        const shared = inflight.get(sessionId);
        if (shared)
            return shared;
        const flight = refresh(sessionId).finally(() => {
            if (inflight.get(sessionId) === flight)
                inflight.delete(sessionId);
        });
        inflight.set(sessionId, flight);
        return flight;
    }
    async function refresh(sessionId) {
        // Read again inside the flight: a caller that read the record before an earlier refresh wrote
        // it back would otherwise refresh with a token the provider has already rotated away.
        let current = await read(sessionId);
        // Each pass after the first follows another replica's successful refresh of this session.
        for (;;) {
            if (!current)
                throw new NotSignedIn('no live session for this id');
            const { record, payload } = current;
            if (!needsRefresh(payload))
                return payload.accessToken;
            let tokens;
            try {
                const config = await opts.getConfig();
                // Always the same `resource` as at sign-in, or the provider mints a token for another audience.
                tokens = await client.refreshTokenGrant(config, payload.refreshToken, { resource: opts.resource });
            }
            catch (err) {
                if (!isRefusal(err)) {
                    throw new IdpUnavailable('the identity provider could not refresh the session', { cause: err });
                }
                // Single-flight is per server instance: another replica or instance may have spent this
                // refresh token first and stored what it got. Only a refusal of the token the store still holds ends the session.
                const latest = await read(sessionId);
                if (!latest)
                    throw new NotSignedIn('the session ended while its access token was being refreshed');
                if (latest.record.sealed === record.sealed) {
                    await opts.sessions.delete(sessionId);
                    throw new NotSignedIn('the identity provider refused to refresh the session', { cause: err });
                }
                current = latest;
                continue;
            }
            const refreshed = {
                ...payload,
                accessToken: tokens.access_token,
                accessExpiresAt: accessExpiresAt(tokens.expires_in),
                // The provider rotates refresh tokens and omits an ID token on refresh; keep what it didn't
                // replace. The original ID token stays the id_token_hint for sign-out.
                refreshToken: tokens.refresh_token ?? payload.refreshToken,
                idToken: tokens.id_token ?? payload.idToken,
            };
            // Written back only over the exact record this refresh started from. A session deleted
            // meanwhile (sign-out, back-channel logout, an upstream SESSION_REVOKED) must stay deleted.
            // Not atomic: the SessionStore contract has no compare-and-set.
            const latest = await opts.sessions.get(sessionId);
            if (!latest)
                throw new NotSignedIn('the session ended while its access token was being refreshed');
            if (latest.sealed === record.sealed) {
                await opts.sessions.set(sessionId, { ...record, sealed: await seal(opts.sessionKey, refreshed) });
            }
            return refreshed.accessToken;
        }
    }
    return { load, accessTokenFor };
}
function needsRefresh(payload) {
    return payload.accessExpiresAt - Date.now() < REFRESH_WHEN_UNDER_MS;
}
/** The provider has decided about this refresh token: `invalid_grant` (RFC 6749 §5.2). Any other
 * error — `invalid_client`, a 429, a 5xx — says nothing about the session, only that refreshing
 * failed this time. */
export function isRefusal(err) {
    return err instanceof client.ResponseBodyError && err.error === 'invalid_grant';
}
//# sourceMappingURL=access.js.map