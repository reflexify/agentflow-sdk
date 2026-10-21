import { bearerAdapter } from '../auth.js';
import { createAgentFlowClient } from '../client.js';
import { isSessionId, sessionAccess } from './access.js';
import { readCookie } from './cookies.js';
import { lazyOidcConfig } from './oidc.js';
import { resolveOptions } from './options.js';
import { handleBackchannelLogout, remoteJwksCache } from './routes/backchannel.js';
import { handleLogin } from './routes/login.js';
import { handleCallback } from './routes/callback.js';
import { handleLogout } from './routes/logout.js';
import { handleProxy } from './routes/proxy.js';
import { handleSession } from './routes/session.js';
export { IdpUnavailable, NotSignedIn } from './access.js';
export { describeError } from './describe-error.js';
export { MemorySessionStore } from './sessions.js';
export function createAgentFlowServer(options) {
    const resolved = resolveOptions(options);
    const getConfig = lazyOidcConfig({
        issuer: resolved.issuer,
        clientId: resolved.clientId,
        privateKey: resolved.privateKey,
        privateKeyId: resolved.privateKeyId,
        allowInsecureRequests: resolved.allowInsecureRequests,
    });
    const access = sessionAccess({
        sessions: resolved.sessions,
        sessionKey: resolved.sessionKey,
        resource: resolved.resource,
        getConfig,
    });
    const jwksFor = remoteJwksCache();
    async function handle(request) {
        const route = routeFor(new URL(request.url).pathname, resolved.basePath);
        if (route === undefined)
            return undefined;
        if (route === 'auth/login' && request.method === 'GET') {
            return handleLogin({
                request,
                config: await getConfig(),
                redirectUri: resolved.redirectUri,
                resource: resolved.resource,
                orgHint: resolved.orgHint,
                afterSignIn: resolved.afterSignIn,
                sessionKey: resolved.sessionKey,
                loginCookieName: resolved.loginCookieName,
                secureCookies: resolved.secureCookies,
            });
        }
        if (route === 'auth/callback' && request.method === 'GET') {
            return handleCallback({
                request,
                config: await getConfig(),
                redirectUri: resolved.redirectUri,
                apiBaseUrl: resolved.apiBaseUrl,
                resource: resolved.resource,
                afterSignIn: resolved.afterSignIn,
                sessions: resolved.sessions,
                sessionKey: resolved.sessionKey,
                loginCookieName: resolved.loginCookieName,
                sessionCookieName: resolved.sessionCookieName,
                secureCookies: resolved.secureCookies,
                sessionTtlSeconds: resolved.sessionTtlSeconds,
                fetch: resolved.fetch,
                onError: resolved.onError,
            });
        }
        if (route === 'auth/logout' && request.method === 'POST') {
            return handleLogout({
                request,
                getConfig,
                access,
                sessions: resolved.sessions,
                sessionCookieName: resolved.sessionCookieName,
                secureCookies: resolved.secureCookies,
                postLogoutRedirectUri: resolved.postLogoutRedirectUri,
                afterSignIn: resolved.afterSignIn,
                onError: resolved.onError,
            });
        }
        if (route === 'auth/backchannel-logout' && request.method === 'POST') {
            return handleBackchannelLogout({
                request,
                getConfig,
                jwksFor,
                clientId: resolved.clientId,
                sessions: resolved.sessions,
                onError: resolved.onError,
            });
        }
        if (route === 'session' && request.method === 'GET') {
            return handleSession({
                request,
                access,
                sessionCookieName: resolved.sessionCookieName,
                secureCookies: resolved.secureCookies,
            });
        }
        if (route === 'api' || route.startsWith('api/')) {
            return handleProxy({
                request,
                basePath: resolved.basePath,
                apiBaseUrl: resolved.apiBaseUrl,
                access,
                sessions: resolved.sessions,
                sessionCookieName: resolved.sessionCookieName,
                secureCookies: resolved.secureCookies,
                fetch: resolved.fetch,
                onError: resolved.onError,
            });
        }
        return undefined;
    }
    /** A typed client that calls the API as the request's session, or `undefined` without one. */
    async function clientFor(request) {
        const sessionId = readCookie(request, resolved.sessionCookieName);
        if (!sessionId || !isSessionId(sessionId) || !(await access.load(sessionId)))
            return undefined;
        return createAgentFlowClient({
            baseUrl: resolved.apiBaseUrl,
            auth: bearerAdapter(() => access.accessTokenFor(sessionId)),
            fetch: resolved.fetch,
        });
    }
    return { handle, clientFor };
}
/** The request path relative to `basePath`, or `undefined` when the request is outside it. */
function routeFor(pathname, basePath) {
    if (pathname === basePath)
        return '';
    if (!pathname.startsWith(`${basePath}/`))
        return undefined;
    return pathname.slice(basePath.length + 1);
}
//# sourceMappingURL=index.js.map