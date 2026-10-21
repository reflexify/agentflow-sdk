# @reflexify/agentflow-sdk

The user guide on your deployment explains how to build, seal and deploy an app: `<AGENTFLOW_URL>/guides/en/xay-dung-ung-dung/tong-quan` (Vietnamese: `<AGENTFLOW_URL>/guides/xay-dung-ung-dung/tong-quan`).

A client for AgentFlow's public API (`/api/v1`), plus a backend-for-frontend for apps installed in AgentFlow.

| import | runs in | what it is |
|---|---|---|
| `@reflexify/agentflow-sdk` | browser or server | A typed client (`openapi-fetch`) with auth adapters, problem errors, automatic idempotency keys and retries. |
| `@reflexify/agentflow-sdk/server` | server only | A Web `Request → Response` handler. It covers sign-in (authorization code with PKCE and an RFC 8707 `resource`), sealed server-side sessions, a proxy that forwards only published operations, token refresh, sign-out and back-channel logout. |

**Access and refresh tokens never reach the browser.** They stay on your server, sealed with AES-256-GCM under `sessionKey` before any `SessionStore` sees them. The ID token is kept the same way, except that sign-out sends it once as `id_token_hint`, in the redirect to the provider's end-session endpoint. The browser holds only an `HttpOnly` cookie with a random session id. It learns who is signed in from `GET /agentflow/session`, and it calls AgentFlow only through `/agentflow/api/*`, where the server adds `Authorization`.

ESM only. The package is `"private": true` for now.

`./server` uses Web APIs only: `fetch`, `Request` and `Response`, Web Crypto, and `btoa`/`atob`. It has no `Buffer` and no `node:` imports (a test enforces this). It runs on these runtimes:

- **Node.js 22+**: tested in CI.
- **Bun, Deno, Cloudflare Workers and other edge runtimes**: supported via Web APIs, but not tested against a real workerd or edge runtime. Bundlers for Workers and edge runtimes resolve the `workerd`, `worker` and `edge-light` export conditions to the server entry, ahead of `browser`.

## Server setup

```ts
// agentflow.ts: import this from server code only
import { createAgentFlowServer, MemorySessionStore } from '@reflexify/agentflow-sdk/server';
import { importPKCS8 } from 'jose';

export const agentflow = createAgentFlowServer({
  issuer: 'https://accounts.reflexify.ai',
  clientId: 'case-desk',
  privateKey: await importPKCS8(process.env.AGENTFLOW_PRIVATE_KEY!, 'RS256'),
  redirectUri: 'https://cases.example.com/agentflow/auth/callback',
  apiBaseUrl: 'https://agentflow.example.com/api/v1',
  resource: 'https://agentflow.example.com/api/v1/rest',
  sessions: new MemorySessionStore(), // development only; see "Session stores"
  sessionKey: process.env.AGENTFLOW_SESSION_KEY!,
});
```

Generate a session key with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`.

`createAgentFlowServer` does no I/O. It runs OIDC discovery on first use and retries after a failed attempt.

### Options

| option | type | default | |
|---|---|---|---|
| `issuer` | `string` | required | The identity provider's issuer URL. |
| `clientId` | `string` | required | The installed app's OAuth client id. Tokens carry `azp = clientId`. |
| `privateKey` | `CryptoKey` | required | Signs the `private_key_jwt` client assertion. The identity provider holds its public half. |
| `privateKeyId` | `string` | none | The `kid` for the client assertion. |
| `redirectUri` | `string` | required | An absolute URL that must be `{origin}{basePath}/auth/callback` and registered with the identity provider. The code is redeemed against this value, not against the request URL, so sign-in still works behind a TLS-terminating proxy. |
| `postLogoutRedirectUri` | `string` | none | Sent as `post_logout_redirect_uri` on sign-out. |
| `apiBaseUrl` | `string` | required | AgentFlow's public API base, such as `https://agentflow.example.com/api/v1`. A trailing `/` is trimmed. |
| `resource` | `string` | required | AgentFlow's REST resource indicator (its `API_RESOURCE_URI`, by default `{public base}/api/v1/rest`). It is sent at authorize, at code exchange and on every refresh, and tokens carry `aud = resource`. |
| `orgHint` | `string` | none | Sent as `org_hint` on every authorize request. |
| `sessions` | `SessionStore` | required | Where sealed sessions are kept. See [Session stores](#session-stores). |
| `sessionKey` | `string` | required | 32 bytes, base64url. It seals session records and the login cookie. Changing it signs everyone out. `createAgentFlowServer` throws a configuration error when it does not decode to exactly 32 bytes. |
| `basePath` | `string` | `'/agentflow'` | Where the routes live. A trailing `/` is trimmed and a missing leading `/` is added. |
| `secureCookies` | `boolean` | `true` | `true` gives `__Host-` cookie names and `Secure`. Set `false` only for plain-`http` development. |
| `afterSignIn` | `string` | `'/'` | A path on this origin. It is the `returnTo` when none (or an unsafe one) is given, the target of `?agentflow_error=` redirects, and the landing page after sign-out when the provider has no end-session endpoint. |
| `sessionTtlSeconds` | `number` | `43200` (12 h) | An absolute session lifetime. Refreshing tokens does not extend it. |
| `allowInsecureRequests` | `boolean` | `false` | Lets openid-client call an `http://` identity provider. **Tests and local development only.** |
| `fetch` | `typeof fetch` | `globalThis.fetch` | Used for the `/caller` check at sign-in, for the proxy and for `clientFor`. It is not used for OIDC calls. |
| `onError` | `(error, { route, summary }) => void \| Promise<void>` | none | Receives the errors a route handles instead of throwing, so you can log them: a failed code exchange or post-grant sign-in step, a failed revocation, a refused logout token, a failed refresh. `route` is `auth/callback`, `auth/logout`, `auth/backchannel-logout` or `api`. **Log `summary`, not `error`**: see [Logging errors safely](#logging-errors-safely). It is never awaited, and anything it throws or rejects with is dropped. |

### Routes

Every route is under `basePath`.

| route | answers |
|---|---|
| `GET auth/login?returnTo=/path` | A `302` to the provider's authorize endpoint (PKCE S256, `scope=openid offline_access`, `resource`, `org_hint`). It sets the sealed login cookie, which lasts 10 minutes. `returnTo` must be a relative path starting with `/`, not `//`, without a backslash, and printable ASCII only (percent-encode anything else); otherwise `afterSignIn` is used. It is redirected to exactly as given. |
| `GET auth/callback` | Redeems the code, then checks `GET {apiBaseUrl}/caller`. Only a `200` creates a session. The answer is a `302` to `returnTo` with the session cookie set. On failure it is either `400 SIGN_IN_EXPIRED` or a `302` to `afterSignIn?agentflow_error=…` (see [Sign-in errors](#sign-in-errors)). The login cookie is always cleared. |
| `POST auth/logout` | Same-origin only. It revokes the refresh token (best effort), deletes the session and clears the cookie. The answer is a `303` to the provider's end-session endpoint with `id_token_hint`, or to `afterSignIn` when the provider has none. |
| `POST auth/backchannel-logout` | OIDC Back-Channel Logout 1.0. Register `{origin}{basePath}/auth/backchannel-logout` with the provider. It verifies the form-encoded `logout_token` (issuer, `aud = clientId`, the provider's signing algorithms, `iat` and `jti`, at most 5 minutes old, the logout event, no `nonce`, a `sid`) and deletes every session with that `sid`. The answer is `200`, or `400` for anything else, including a body over 16 KiB. |
| `GET session` | `200` with `{"signedIn": true, "caller": Caller}` or `{"signedIn": false}`, sent `no-store`. `caller` is what `GET /caller` answered at sign-in: `{kind, id, display_name, org_id, email, org_name, permissions, app: {key, name} \| null}`. A cookie that names no live session is cleared. |
| `* api/<path>` | The proxy. `{basePath}/api/work?limit=20` is forwarded to `{apiBaseUrl}/work?limit=20` with `Authorization: Bearer`. The token is refreshed first when under 60 s of its life remain. |

The proxy runs its checks in this order:

1. It refuses unsafe paths (`BAD_PATH`).
2. It forwards only a `(method, path)` pair from the published OpenAPI document (`NOT_PUBLISHED`).
3. For methods other than `GET`, `HEAD` and `OPTIONS`, it requires `Sec-Fetch-Site: same-origin` or an `Origin` equal to the request's origin (`CROSS_SITE_REQUEST`).
4. It needs a live session (`NOT_SIGNED_IN`) and a token it can refresh (`IDP_UNAVAILABLE`).

It forwards only the `content-type`, `accept`, `idempotency-key` and `if-none-match` request headers, and never cookies. Request bodies are streamed through. The upstream status and body come back as they are, without `set-cookie` or hop-by-hop headers, and with `cache-control: private` added when the API set none. Redirects are relayed, never followed. An upstream `401` of type `SESSION_REVOKED` or `TOKEN_EXPIRED` also ends the session.

For any other path or method under `basePath`, `handle` resolves to `undefined`. It rejects on infrastructure failures: discovery failing during sign-in, the session store throwing, or the API being unreachable from the proxy. Let your framework turn that into a `500`.

### Cookies

| cookie | `secureCookies: false` | holds |
|---|---|---|
| `__Host-agentflow_session` | `agentflow_session` | A random session id only. `HttpOnly; SameSite=Lax; Path=/`, `Max-Age = sessionTtlSeconds`. |
| `__Host-agentflow_login` | `agentflow_login` | Sealed PKCE verifier, state, nonce and `returnTo`. It lasts 10 minutes and is cleared at the callback. |

## Mounting

`handle(request)` takes a standard `Request` and resolves to a `Response`, or to `undefined` when the request is not the SDK's. Mount it ahead of your own routes. [`test/mount.test.ts`](test/mount.test.ts) runs the Hono form and the Node listener form below.

**Hono**

```ts
app.use('*', async (c, next) => {
  const res = await agentflow.handle(c.req.raw);
  if (res) return res;
  await next();
});
```

**Next.js route handler**, at `app/agentflow/[...path]/route.ts`. It works on the default Node.js runtime. The Edge runtime resolves the `edge-light` condition to the same entry, and is supported via Web APIs but untested.

```ts
import { agentflow } from '@/lib/agentflow';

async function handler(request: Request): Promise<Response> {
  return (await agentflow.handle(request)) ?? new Response('Not Found', { status: 404 });
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
```

**SvelteKit**, in `src/hooks.server.ts`, with the setup module in `$lib/server/`, which SvelteKit keeps out of client bundles:

```ts
import type { Handle } from '@sveltejs/kit';
import { agentflow } from '$lib/server/agentflow';

export const handle: Handle = async ({ event, resolve }) =>
  (await agentflow.handle(event.request)) ?? resolve(event);
```

SvelteKit's CSRF check can refuse back-channel logout before `handle` runs. The check looks at cross-site form submissions, and the provider's back-channel logout is a server-to-server form `POST` with no `Origin` header. If the check refuses it, sessions outlive a sign-out at the provider.

- **Exempt `{basePath}/auth/backchannel-logout` from the check.** Use your SvelteKit version's CSRF or trusted-origins configuration, and read how that version treats a request with no `Origin`.
- **If the only option is to turn the check off, put an equivalent check back in `handle` for your own form actions.** The SDK's other unsafe routes, `auth/logout` and the proxy, check the origin themselves.
- **Verify back-channel logout in your deployment.** Sign in, end the session at the provider, and confirm that `GET {basePath}/session` answers `{"signedIn": false}`.

**Express or Fastify**, through a fetch bridge (`@hono/node-server`). Mount it **before any body parser**: the proxy streams the raw request body, and a parser that has already read it leaves nothing to forward.

```ts
import { getRequestListener } from '@hono/node-server';

const toAgentflow = getRequestListener(
  async (request) => (await agentflow.handle(request)) ?? new Response('Not Found', { status: 404 }),
);
const isAgentflow = (url = '') => /^\/agentflow(?:[/?]|$)/.test(url);

// Express: the first middleware
app.use((req, res, next) => {
  if (isAgentflow(req.url)) void toAgentflow(req, res);
  else next();
});

// Fastify: onRequest runs before Fastify parses the body
fastify.addHook('onRequest', async (request, reply) => {
  if (!isAgentflow(request.url)) return;
  reply.hijack();
  await toAgentflow(request.raw, reply.raw);
});
```

## In the browser

Use the core client with `proxyAdapter()`. It adds no credentials of its own, and the session cookie does the rest. `baseUrl` must be absolute.

```ts
import { AgentFlowError, createAgentFlowClient, ok, paginate, proxyAdapter } from '@reflexify/agentflow-sdk';

const api = createAgentFlowClient({ baseUrl: `${location.origin}/agentflow/api`, auth: proxyAdapter() });

const session = await (await fetch('/agentflow/session')).json();
if (!session.signedIn) location.assign(`/agentflow/auth/login?returnTo=${encodeURIComponent(location.pathname)}`);

try {
  const mine = await ok(api.GET('/work', { params: { query: { view: 'mine' } } }));
} catch (err) {
  if (err instanceof AgentFlowError && err.code === 'NOT_SIGNED_IN') location.assign('/agentflow/auth/login');
}

for await (const task of paginate((cursor) => ok(api.GET('/work', { params: { query: { cursor } } })))) {
  // every work line, page by page
}
```

`paginate` stops without an error when the server returns a cursor it already returned, because following it would repeat the same pages for ever. The list then ends early with no signal.

Sign out with a form. The answer is a redirect to the identity provider, which `fetch` cannot follow.

```html
<form method="post" action="/agentflow/auth/logout"><button>Sign out</button></form>
```

- `ok(result)` returns `data`. It throws `AgentFlowError` with `status`, `code` (the problem `type`), `detail`, `requestId` and `fieldErrors`.
- Operations that accept an `Idempotency-Key` get one automatically.
- The client retries `429`, `503` and `409 IDEMPOTENCY_KEY_IN_PROGRESS`, but only for safe methods and keyed writes. It honours `Retry-After` in seconds up to 30 s, waits 1 s when the header is absent or is not a number of seconds, and retries up to `maxRetries` times (default 3).

## On the server

`clientFor(request)` returns a typed client that calls `apiBaseUrl` directly as the request's session, or `undefined` when there is no live session. It is built on `bearerAdapter`, so each call reads the session's current token and refreshes it first when needed. A call can reject with `NotSignedIn` (the session ended, or the provider refused the refresh) or `IdpUnavailable` (the refresh failed any other way, and the session is kept).

```ts
import { IdpUnavailable, NotSignedIn } from '@reflexify/agentflow-sdk/server';
import { ok } from '@reflexify/agentflow-sdk';

app.get('/cases', async (c) => {
  const api = await agentflow.clientFor(c.req.raw);
  if (!api) return c.redirect('/agentflow/auth/login?returnTo=/cases');
  try {
    return c.json((await ok(api.GET('/work'))).items);
  } catch (err) {
    if (err instanceof NotSignedIn) return c.redirect('/agentflow/auth/login?returnTo=/cases');
    if (err instanceof IdpUnavailable) return c.text('Try again shortly', 503);
    throw err;
  }
});
```

For a token you obtain yourself, use `createAgentFlowClient({ baseUrl, auth: bearerAdapter(async () => token) })`.

## App modules

An app's UI can also run inside AgentFlow, at `/apps/<key>`, from the same code as its own site. It does so when the app is installed from a package and the deployment has app modules turned on. The module is an ES module whose named export `mount` renders into a root it is given and returns how to stop:

```ts
import type { AppHost } from '@reflexify/agentflow-sdk';
import { createRoot } from 'react-dom/client';
import { App } from './App';

export function mount(root: Element, host: AppHost) {
  const app = createRoot(root);
  app.render(<App host={host} />);
  return () => app.unmount();
}
```

- **The root is inside a shadow root** (`root.getRootNode()`). Put one `<style>` there, the UI kit's `KIT_CSS` first and then your own CSS, and remove it when the module unmounts. Render your own dialogs and popovers into `host.portalRoot`, which sits in the same shadow root; the kit's overlays need no portal.
- **Use the host for the rest.** `host.api` is the typed client as the signed-in person, and `host.context` holds the person, org, locale and theme.
- **Turn the keys you ship with into this organization's ids with `host.api.GET('/app/objects')`.** It answers for your own app in every host: each object by its logical key (`entity:ticket`) with its `id` and installed `key`, the installation's non-secret `parameters`, and its `revision`. Ask once per mount, and never hard-code an id.
- **A path is everything after `host.basePath` in the address bar**: pathname, query and fragment (`/t/42?tab=notes#n3`). `host.navigate(path)` goes there, and `host.onLocationChange` tells the current path at once, then each change, back, forward and a link to a fragment included. `modulePath(href, basePath)` and `hostPath(basePath, path)` map between the address bar and a path.
- **Follow the locale and the theme live.** `host.context.locale` and `host.context.theme` change in place, and `host.onLocaleChange` and `host.onThemeChange` say when, though not as they subscribe. Re-render on a change rather than remounting, so what the person was doing survives it.
- **Use `host.apiUrl(path)` for what the browser fetches itself**, such as a download link with `target="_blank"` or an `<img src>`. It returns the absolute URL of a published operation's `path` (`/attachments/a1/download`, query kept), under the API `host.api` calls, which the browser opens with the person's credentials. The typed client cannot make such a URL, and the API's address differs between hosts, so never hard-code it.
- **`host.realtime` belongs to the host.** It is opened the first time it is read, every read hands out the same channel, and the host closes it when the module unmounts. Never call `close()` on it.
- **Make no global side effects.** Listen for keys on your own root, not on `document` or `window`, so keys typed in the host's own UI never reach the module.
- **Style through the tokens, with AgentFlow's own values as fallbacks** (`AF_DEFAULT_PALETTE`): `color: var(--af-fg, oklch(0.21 0.035 255))`. The tokens are `AF_TOKENS`. Declare your own custom properties on your root element, never on `:host`. Set `data-theme` on that root from `host.context.theme.mode`, and on each kit element, and follow `host.onThemeChange`. Inside AgentFlow the tokens follow the person's light or dark mode and brand, switching live.
- **No React, or no framework at all, is needed.** Nothing but plain data and functions crosses the boundary, so the module brings its own framework and version.
- `defineModuleElement(tag, module)` wraps a module as a custom element, and `moduleFromElement(tag)` makes a module from one. The element hands the module a host that forwards each member to yours, with its own `portalRoot`, so a host written as a class, private fields and all, works as one.

The rules a module follows, with their reasons, and a review checklist are in the UI kit's design guide, [DESIGN.md](../agentflow-elements/DESIGN.md).

On the app's own site, the page mounts the same module with the standalone host. The host reads `/caller` through the SDK server's proxy, so sign the person in first:

```ts
import { createModuleContainer, createStandaloneHost } from '@reflexify/agentflow-sdk';
import { mount } from './module';

const element = document.getElementById('app')!;
const { root, portalRoot } = createModuleContainer(element);
const host = await createStandaloneHost({ container: element, portalRoot, brand: 'support-desk' });
mount(root, host);
```

It follows the browser's colour scheme and language (`languagechange`), injecting AgentFlow's palette unless it is given `palette`. It navigates with the history API under `basePath` and tells back, forward and fragment changes, and it opens the real-time channel through the proxy the first time `host.realtime` is read. `host.close()` stops all of that and closes the channel.

### Checking a host

`HOST_CONTRACT_CASES` is the contract as a list of cases, with no test framework in them. Each case builds a host through your `HostHarnessFactory`. A `HostHarness` is the host, plus controls that go back and forward, follow a link to a fragment and set the theme and the locale, plus the `appObjects` its API answers to `GET /app/objects` and the `apiBase` its `api` calls. Its API also answers `GET /events/stream` with a stream that stays open until the request is aborted, and `openStreams()` says how many it holds open, which is how the cases see a host close its channel. A case that fails rejects with an `Error` naming what it expected and what it saw. The SDK runs the cases against its standalone host, and AgentFlow runs them against its own. With Vitest:

```ts
import { HOST_CONTRACT_CASES } from '@reflexify/agentflow-sdk';

for (const contractCase of HOST_CONTRACT_CASES) {
  it(contractCase.name, () => contractCase.run(makeHarness));
}
```

## Logging errors safely

**Never log an error the SDK hands you as it is**, neither the object nor its `message`:

- **The cause can hold tokens.** When a check on the provider's token response fails, the error's `cause` carries the whole response (access, refresh and ID tokens). Printing an error prints its cause, and so does a structured logger's error serializer.
- **The message can hold request text.** Anyone can post to `auth/backchannel-logout`, and jose names a token header's unrecognised `crit` entry in its message before any key is checked. Printed raw, that writes an attacker's escape sequences and newlines into your terminal or log.

Log the one line the SDK builds instead. `onError` receives it as `summary`:

```ts
onError: (_error, { route, summary }) => console.error(`[agentflow] ${route}: ${summary}`),
```

For an error that reaches your own code, use `describeError`, which builds the same line. That covers a rejection from a `clientFor` call, or an error that escapes `handle()` into your framework's error handler: `auth/login` and `auth/callback` throw when OIDC discovery fails, for example when the provider cannot be reached.

```ts
import { describeError } from '@reflexify/agentflow-sdk/server';

app.onError((err, c) => {
  console.error(`${new URL(c.req.url).pathname}: ${describeError(err)}`);
  return c.text('Sign-in is unavailable right now', 500);
});
```

The line is the error's name and message, with every control character written as `\xNN`. After them, in brackets, come up to two codes: the provider's OAuth `error` where there is one, and otherwise the error's `code`. One is from the error and one from its direct cause, which is where the SDK keeps the provider's answer to a failed refresh. A code prints only when it fits RFC 6749's error charset and is at most 64 characters. For example:

```
IdpUnavailable: the identity provider could not refresh the session (invalid_target)
TypeError: fetch failed (ECONNREFUSED)
```

It never includes the cause itself, the provider's `error_description` or a response body. The log path is the pathname only, because the callback's query string carries the authorization code.

## Problem types

The SDK answers with these itself, as `application/problem+json` with `{type, title, status}`. That is the same shape as AgentFlow's own problems, which the proxy relays unchanged.

| type | status | route | when |
|---|---|---|---|
| `NOT_SIGNED_IN` | 401 | `api/*` | No session cookie, an unknown or expired session, or the provider refused the refresh token (`invalid_grant`). The cookie is cleared. |
| `NOT_PUBLISHED` | 404 | `api/*` | The method and path are not a published operation. |
| `BAD_PATH` | 400 | `api/*` | The raw path has a `..` segment, `%2e`, `%2f` or `%5c` (any case), a backslash, or `//`. |
| `CROSS_SITE_REQUEST` | 403 | `api/*` (unsafe methods), `auth/logout` | Neither `Sec-Fetch-Site: same-origin` nor an `Origin` equal to the request's origin. |
| `SIGN_IN_EXPIRED` | 400 | `auth/callback` | The login cookie is missing, older than 10 minutes or unreadable, or the code exchange failed (a state mismatch, a replayed code, or an error from the provider). Start again at `auth/login`. |
| `IDP_UNAVAILABLE` | 503 | `api/*` | The provider could not refresh the session: it was unreachable, answered `5xx` or `429`, or returned an OAuth error other than `invalid_grant`. The session is kept, so retry. It carries `Retry-After: 5`. |

### Sign-in errors

When a sign-in fails after the provider has issued tokens, the callback revokes the refresh token (best effort) and redirects to `afterSignIn?agentflow_error=<value>` without creating a session:

- **AgentFlow's refusal type**, when `GET /caller` answers anything but `200`. Examples are `APP_NOT_INSTALLED` (the app is not installed in the person's organization) and `APP_NOT_ASSIGNED` (the person is not in the app's audience). The value is `HTTP_<status>` when the answer has no problem type.
- **`SIGN_IN_FAILED`**, for everything else: a token response with no refresh token, no ID token or no `sid` claim, an unreachable `/caller`, a `200` with an unexpected body, or a failed store write. Each of these goes to `onError`.

## Session stores

```ts
interface SessionRecord { sid: string; sealed: string; expiresAt: number }  // expiresAt: epoch ms
interface SessionStore {
  get(id: string): Promise<SessionRecord | undefined>;
  set(id: string, record: SessionRecord): Promise<void>;
  delete(id: string): Promise<void>;
  deleteBySid(sid: string): Promise<number>;
}
```

A store must guarantee the following:

- **`get` honours expiry.** It returns nothing once `Date.now() >= expiresAt`. The SDK checks this too, but a store should expire records itself (for example with Redis `PXAT expiresAt`) instead of keeping them forever.
- **`set` upserts** and keeps the record's own `expiresAt`. A refresh rewrites the record with the same one.
- **`delete` is idempotent.**
- **`deleteBySid` removes every record with that provider `sid`** and returns how many it removed. Back-channel logout depends on it, so the store needs an index by `sid`.
- **Every replica sees one store.**
- **Errors propagate.** A store error usually rejects `handle`. The callback turns one into `SIGN_IN_FAILED`, and back-channel logout turns one into a `400`.

Tokens arrive already sealed. `sealed` is an opaque AES-256-GCM string, and the store never sees a plaintext token. Session ids are 43 base64url characters, checked before any lookup.

`MemorySessionStore` is for development and single-process deployments only. It is not shared across processes, it loses every session on restart, and it drops an expired record only when that record is read.

## Deployment

- **Run one instance, or use sticky sessions, when you have several replicas.** Token refresh is single-flight per server instance (each `createAgentFlowServer`), not per process, so create one server per process and share it. The provider rotates refresh tokens, so two replicas, or two server instances on one store, refreshing one session at once present the same refresh token twice. The SDK re-reads the store and adopts the winner's tokens when they are already there. If the loser looks before the winner has written, it deletes the session and the user is signed out. This holds until `SessionStore` gains a lock or compare-and-set.
- **Never bundle `./server` for a browser.** Its `browser` export condition resolves to a module that throws `runs on a server only` on import, so a bundle that includes it fails at load. `import type` from it is erased and is fine. The `workerd`, `worker` and `edge-light` conditions come first, so a Workers or edge bundle, which also sets `browser`, still gets the real server entry.
- **Behind a TLS-terminating proxy**, an adapter may build an `http://` request URL. The same-origin check then passes on `Sec-Fetch-Site: same-origin`, which current browsers send, and not on `Origin`.
