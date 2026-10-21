import { $ as e, A as t, C as n, H as r, J as i, K as a, L as o, M as s, N as c, Q as l, R as u, T as d, U as f, V as p, W as m, X as h, Y as g, Z as _, at as v, ct as y, et as b, it as x, j as S, l as C, m as w, n as T, o as E, p as D, q as O, s as k, t as A, u as j, v as M, x as N, z as P } from "./chunks/client-ChLD-Y6I.js";
//#region ../agentflow-sdk/dist/auth.js
function F() {
	return {
		async headers() {
			return {};
		},
		credentials: "same-origin"
	};
}
//#endregion
//#region ../agentflow-sdk/dist/errors.js
var I = class extends Error {
	status;
	code;
	detail;
	requestId;
	fieldErrors;
	constructor(e, t, n, r, i) {
		super(n ? `${t}: ${n}` : t), this.status = e, this.code = t, this.detail = n, this.requestId = r, this.fieldErrors = i, this.name = "AgentFlowError";
	}
};
async function L(e) {
	let { data: t, error: n, response: r } = await e;
	if (r.ok && n === void 0) return t;
	let i = n ?? {};
	throw new I(r.status, i.type ?? `HTTP_${r.status}`, i.detail, i.request_id, i.field_errors ?? void 0);
}
//#endregion
//#region ../../node_modules/.pnpm/openapi-fetch@0.17.0/node_modules/openapi-fetch/dist/index.mjs
var R = /\{[^{}]+\}/g, z = () => typeof process == "object" && Number.parseInt(process?.versions?.node?.substring(0, 2)) >= 18 && process.versions.undici;
function B() {
	return Math.random().toString(36).slice(2, 11);
}
function V(e) {
	let { baseUrl: t = "", Request: n = globalThis.Request, fetch: r = globalThis.fetch, querySerializer: i, bodySerializer: a, pathSerializer: o, headers: s, requestInitExt: c = void 0, ...l } = { ...e };
	c = z() ? c : void 0, t = X(t);
	let u = [];
	async function d(e, d) {
		let { baseUrl: f, fetch: p = r, Request: m = n, headers: h, params: g = {}, parseAs: _ = "json", querySerializer: v, bodySerializer: y = a ?? q, pathSerializer: b, body: x, middleware: S = [], ...C } = d || {}, w = t;
		f && (w = X(f) ?? t);
		let T = typeof i == "function" ? i : G(i);
		v && (T = typeof v == "function" ? v : G({
			...typeof i == "object" ? i : {},
			...v
		}));
		let E = b || o || K, D = x === void 0 ? void 0 : y(x, Y(s, h, g.header)), O = Y(D === void 0 || D instanceof FormData ? {} : { "Content-Type": "application/json" }, s, h, g.header), k = [...u, ...S], A = {
			redirect: "follow",
			...l,
			...C,
			body: D,
			headers: O
		}, j, M, N = new m(J(e, {
			baseUrl: w,
			params: g,
			querySerializer: T,
			pathSerializer: E
		}), A), P;
		for (let e in C) e in N || (N[e] = C[e]);
		if (k.length) {
			j = B(), M = Object.freeze({
				baseUrl: w,
				fetch: p,
				parseAs: _,
				querySerializer: T,
				bodySerializer: y,
				pathSerializer: E
			});
			for (let t of k) if (t && typeof t == "object" && typeof t.onRequest == "function") {
				let n = await t.onRequest({
					request: N,
					schemaPath: e,
					params: g,
					options: M,
					id: j
				});
				if (n) {
					if (n instanceof m) N = n;
					else if (n instanceof Response) {
						P = n;
						break;
					} else throw Error("onRequest: must return new Request() or Response() when modifying the request");
				}
			}
		}
		if (!P) {
			try {
				P = await p(N, c);
			} catch (t) {
				let n = t;
				if (k.length) for (let t = k.length - 1; t >= 0; t--) {
					let r = k[t];
					if (r && typeof r == "object" && typeof r.onError == "function") {
						let t = await r.onError({
							request: N,
							error: n,
							schemaPath: e,
							params: g,
							options: M,
							id: j
						});
						if (t) {
							if (t instanceof Response) {
								n = void 0, P = t;
								break;
							}
							if (t instanceof Error) {
								n = t;
								continue;
							}
							throw Error("onError: must return new Response() or instance of Error");
						}
					}
				}
				if (n) throw n;
			}
			if (k.length) for (let t = k.length - 1; t >= 0; t--) {
				let n = k[t];
				if (n && typeof n == "object" && typeof n.onResponse == "function") {
					let t = await n.onResponse({
						request: N,
						response: P,
						schemaPath: e,
						params: g,
						options: M,
						id: j
					});
					if (t) {
						if (!(t instanceof Response)) throw Error("onResponse: must return new Response() when modifying the response");
						P = t;
					}
				}
			}
		}
		let F = P.headers.get("Content-Length");
		if (P.status === 204 || N.method === "HEAD" || F === "0" && !P.headers.get("Transfer-Encoding")?.includes("chunked")) return P.ok ? {
			data: void 0,
			response: P
		} : {
			error: void 0,
			response: P
		};
		if (P.ok) return {
			data: await (async () => {
				if (_ === "stream") return P.body;
				if (_ === "json" && !F) {
					let e = await P.text();
					return e ? JSON.parse(e) : void 0;
				}
				return await P[_]();
			})(),
			response: P
		};
		let I = await P.text();
		try {
			I = JSON.parse(I);
		} catch {}
		return {
			error: I,
			response: P
		};
	}
	return {
		request(e, t, n) {
			return d(t, {
				...n,
				method: e.toUpperCase()
			});
		},
		GET(e, t) {
			return d(e, {
				...t,
				method: "GET"
			});
		},
		PUT(e, t) {
			return d(e, {
				...t,
				method: "PUT"
			});
		},
		POST(e, t) {
			return d(e, {
				...t,
				method: "POST"
			});
		},
		DELETE(e, t) {
			return d(e, {
				...t,
				method: "DELETE"
			});
		},
		OPTIONS(e, t) {
			return d(e, {
				...t,
				method: "OPTIONS"
			});
		},
		HEAD(e, t) {
			return d(e, {
				...t,
				method: "HEAD"
			});
		},
		PATCH(e, t) {
			return d(e, {
				...t,
				method: "PATCH"
			});
		},
		TRACE(e, t) {
			return d(e, {
				...t,
				method: "TRACE"
			});
		},
		use(...e) {
			for (let t of e) if (t) {
				if (typeof t != "object" || !("onRequest" in t || "onResponse" in t || "onError" in t)) throw Error("Middleware must be an object with one of `onRequest()`, `onResponse() or `onError()`");
				u.push(t);
			}
		},
		eject(...e) {
			for (let t of e) {
				let e = u.indexOf(t);
				e !== -1 && u.splice(e, 1);
			}
		}
	};
}
function H(e, t, n) {
	if (t == null) return "";
	if (typeof t == "object") throw Error("Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these.");
	return `${e}=${n?.allowReserved === !0 ? t : encodeURIComponent(t)}`;
}
function U(e, t, n) {
	if (!t || typeof t != "object") return "";
	let r = [], i = {
		simple: ",",
		label: ".",
		matrix: ";"
	}[n.style] || "&";
	if (n.style !== "deepObject" && n.explode === !1) {
		for (let e in t) r.push(e, n.allowReserved === !0 ? t[e] : encodeURIComponent(t[e]));
		let i = r.join(",");
		switch (n.style) {
			case "form": return `${e}=${i}`;
			case "label": return `.${i}`;
			case "matrix": return `;${e}=${i}`;
			default: return i;
		}
	}
	for (let i in t) {
		let a = n.style === "deepObject" ? `${e}[${i}]` : i;
		r.push(H(a, t[i], n));
	}
	let a = r.join(i);
	return n.style === "label" || n.style === "matrix" ? `${i}${a}` : a;
}
function W(e, t, n) {
	if (!Array.isArray(t)) return "";
	if (n.explode === !1) {
		let r = {
			form: ",",
			spaceDelimited: "%20",
			pipeDelimited: "|"
		}[n.style] || ",", i = (n.allowReserved === !0 ? t : t.map((e) => encodeURIComponent(e))).join(r);
		switch (n.style) {
			case "simple": return i;
			case "label": return `.${i}`;
			case "matrix": return `;${e}=${i}`;
			default: return `${e}=${i}`;
		}
	}
	let r = {
		simple: ",",
		label: ".",
		matrix: ";"
	}[n.style] || "&", i = [];
	for (let r of t) n.style === "simple" || n.style === "label" ? i.push(n.allowReserved === !0 ? r : encodeURIComponent(r)) : i.push(H(e, r, n));
	return n.style === "label" || n.style === "matrix" ? `${r}${i.join(r)}` : i.join(r);
}
function G(e) {
	return function(t) {
		let n = [];
		if (t && typeof t == "object") for (let r in t) {
			let i = t[r];
			if (i != null) {
				if (Array.isArray(i)) {
					if (i.length === 0) continue;
					n.push(W(r, i, {
						style: "form",
						explode: !0,
						...e?.array,
						allowReserved: e?.allowReserved || !1
					}));
					continue;
				}
				if (typeof i == "object") {
					n.push(U(r, i, {
						style: "deepObject",
						explode: !0,
						...e?.object,
						allowReserved: e?.allowReserved || !1
					}));
					continue;
				}
				n.push(H(r, i, e));
			}
		}
		return n.join("&");
	};
}
function K(e, t) {
	let n = e;
	for (let r of e.match(R) ?? []) {
		let e = r.substring(1, r.length - 1), i = !1, a = "simple";
		if (e.endsWith("*") && (i = !0, e = e.substring(0, e.length - 1)), e.startsWith(".") ? (a = "label", e = e.substring(1)) : e.startsWith(";") && (a = "matrix", e = e.substring(1)), !t || t[e] === void 0 || t[e] === null) continue;
		let o = t[e];
		if (Array.isArray(o)) {
			n = n.replace(r, W(e, o, {
				style: a,
				explode: i
			}));
			continue;
		}
		if (typeof o == "object") {
			n = n.replace(r, U(e, o, {
				style: a,
				explode: i
			}));
			continue;
		}
		if (a === "matrix") {
			n = n.replace(r, `;${H(e, o)}`);
			continue;
		}
		n = n.replace(r, a === "label" ? `.${encodeURIComponent(o)}` : encodeURIComponent(o));
	}
	return n;
}
function q(e, t) {
	return e instanceof FormData ? e : t && (t.get instanceof Function ? t.get("Content-Type") ?? t.get("content-type") : t["Content-Type"] ?? t["content-type"]) === "application/x-www-form-urlencoded" ? new URLSearchParams(e).toString() : JSON.stringify(e);
}
function J(e, t) {
	let n = `${t.baseUrl}${e}`;
	t.params?.path && (n = t.pathSerializer(n, t.params.path));
	let r = t.querySerializer(t.params.query ?? {});
	return r.startsWith("?") && (r = r.substring(1)), r && (n += `?${r}`), n;
}
function Y(...e) {
	let t = new Headers();
	for (let n of e) {
		if (!n || typeof n != "object") continue;
		let e = n instanceof Headers ? n.entries() : Object.entries(n);
		for (let [n, r] of e) if (r === null) t.delete(n);
		else if (Array.isArray(r)) for (let e of r) t.append(n, e);
		else r !== void 0 && t.set(n, r);
	}
	return t;
}
function X(e) {
	return e.endsWith("/") ? e.substring(0, e.length - 1) : e;
}
//#endregion
//#region ../agentflow-sdk/dist/generated/operations.js
var Z = [
	{
		method: "GET",
		path: "/app-deployments",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/app-deployments",
		idempotent: !0
	},
	{
		method: "GET",
		path: "/app-deployments/{deployment_id}",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/app-deployments/{deployment_id}/approve",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/app-deployments/{deployment_id}/cancel",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/app-deployments/{deployment_id}/plan",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/app-packages",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/app-packages/lint",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/app/objects",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/attachments",
		idempotent: !0
	},
	{
		method: "GET",
		path: "/attachments/{attachment_id}",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/attachments/{attachment_id}/download",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/caller",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/dashboards",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/dashboards/{dashboard_id}",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/dashboards/{dashboard_id}/compute",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/entities",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/entities/{entity_id}",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/entities/{entity_id}/create-form",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/entities/{entity_id}/presence",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/entities/{entity_id}/records",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records",
		idempotent: !0
	},
	{
		method: "DELETE",
		path: "/entities/{entity_id}/records/{record_id}",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/entities/{entity_id}/records/{record_id}",
		idempotent: !1
	},
	{
		method: "PATCH",
		path: "/entities/{entity_id}/records/{record_id}",
		idempotent: !0
	},
	{
		method: "PUT",
		path: "/entities/{entity_id}/records/{record_id}",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/{record_id}/list-ops",
		idempotent: !0
	},
	{
		method: "DELETE",
		path: "/entities/{entity_id}/records/{record_id}/presence",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/{record_id}/presence",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/entities/{entity_id}/records/{record_id}/step",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/{record_id}/step/submit",
		idempotent: !0
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/{record_id}/work/assign",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/{record_id}/work/claim",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/{record_id}/work/reassign",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/{record_id}/work/release",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/batch-runs",
		idempotent: !0
	},
	{
		method: "GET",
		path: "/entities/{entity_id}/records/batch-runs/{batch_run_id}",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/entities/{entity_id}/records/batch-runs/{batch_run_id}/members",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/count",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/query",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/events",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/events/stream",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/groups",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/groups/{group_id}",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/identities",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/instances",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/instances/{instance_id}",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/instances/{instance_id}/cancel",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/instances/{instance_id}/pause",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/instances/{instance_id}/resume",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/instances/{instance_id}/retry",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/notifications",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/notifications/{notification_id}/read",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/notifications/read-all",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/notifications/unread-count",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/platform",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/search",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/units",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/units/{unit_id}",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/users",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/users/{user_id}",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/webhook-event-types",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/webhook-subscriptions",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/webhook-subscriptions",
		idempotent: !0
	},
	{
		method: "DELETE",
		path: "/webhook-subscriptions/{subscription_id}",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/webhook-subscriptions/{subscription_id}",
		idempotent: !1
	},
	{
		method: "PATCH",
		path: "/webhook-subscriptions/{subscription_id}",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/webhook-subscriptions/{subscription_id}/deliveries",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/webhook-subscriptions/{subscription_id}/deliveries/{delivery_id}",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/webhook-subscriptions/{subscription_id}/deliveries/{delivery_id}/redeliver",
		idempotent: !0
	},
	{
		method: "GET",
		path: "/webhook-subscriptions/{subscription_id}/history",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/webhook-subscriptions/{subscription_id}/pause",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/webhook-subscriptions/{subscription_id}/resume",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/webhook-subscriptions/{subscription_id}/rotate-secret",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/work",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/workflow-versions/{version_id}/start-form",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/workflows/{workflow_id}/input-contract",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/workflows/{workflow_id}/instances",
		idempotent: !0
	},
	{
		method: "GET",
		path: "/workflows/startable",
		idempotent: !1
	}
], Q = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}", ee = Z.map((e) => ({
	op: e,
	re: RegExp("^" + e.path.replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace(/\{[^}]+\}/g, Q) + "$")
}));
function te(e, t) {
	let n = e.toUpperCase();
	return ee.find((e) => e.op.method === n && e.re.test(t))?.op;
}
//#endregion
//#region ../agentflow-sdk/dist/fetch.js
var ne = /* @__PURE__ */ new Set([429, 503]), $ = /* @__PURE__ */ new Set([
	"GET",
	"HEAD",
	"OPTIONS"
]), re = 1e3, ie = 30;
function ae(e) {
	let t = e.headers.get("retry-after")?.trim();
	if (!t) return re;
	let n = Number(t);
	return Number.isFinite(n) && n >= 0 ? Math.min(n, ie) * 1e3 : re;
}
function oe(e) {
	let t = new URL(e.baseUrl), n = e.fetch;
	return async (r) => {
		let i = new URL(r.url).pathname.slice(t.pathname.replace(/\/$/, "").length), a = te(r.method, i), o = new Headers(r.headers);
		for (let [t, n] of Object.entries(await e.auth.headers())) o.set(t, n);
		a?.idempotent && !o.has("idempotency-key") && o.set("idempotency-key", crypto.randomUUID());
		let s = new Request(r, {
			headers: o,
			credentials: e.auth.credentials
		}), c = $.has(s.method) || o.has("idempotency-key");
		for (let t = 0;; t++) {
			let r = await n(s.clone());
			if (!(ne.has(r.status) || r.status === 409 && (await r.clone().json().catch(() => ({})))?.type === "IDEMPOTENCY_KEY_IN_PROGRESS") || !c || t >= e.maxRetries) return r;
			await new Promise((e) => setTimeout(e, ae(r)));
		}
	};
}
//#endregion
//#region ../agentflow-sdk/dist/client.js
function se(e) {
	return V({
		baseUrl: e.baseUrl,
		fetch: oe({
			baseUrl: e.baseUrl,
			auth: e.auth,
			fetch: e.fetch ?? globalThis.fetch,
			maxRetries: e.maxRetries ?? 3
		})
	});
}
//#endregion
//#region ../agentflow-sdk/dist/paginate.js
async function* ce(e) {
	let t = /* @__PURE__ */ new Set(), n;
	do {
		let r = await e(n);
		if (yield* r.items, n = r.next_cursor ?? void 0, n !== void 0 && t.has(n)) break;
		n !== void 0 && t.add(n);
	} while (n);
}
//#endregion
//#region ../agentflow-sdk/dist/modules/tokens.js
var le = {
	"--af-warning": "oklch(0.666 0.179 58.318)",
	"--af-success": "oklch(0.596 0.145 163.225)",
	"--af-radius": "0.625rem",
	"--af-font-sans": "ui-sans-serif, system-ui, sans-serif",
	"--af-font-mono": "ui-monospace, SFMono-Regular, Menlo, monospace"
};
({ ...le }), { ...le };
//#endregion
//#region src/base-path.ts
var ue = "/agentflow", de = /^\/(?!\/)/;
function fe(e) {
	try {
		return new URL(e, location.origin).origin === location.origin;
	} catch {
		return !1;
	}
}
function pe(e) {
	return e == null ? ue : de.test(e) && fe(e) ? e.replace(/\/+$/, "") : (console.warn(`agentflow: base-path ${JSON.stringify(e)} is not a path on this origin; using ${ue}.`), ue);
}
//#endregion
//#region src/context.ts
var me = "context-request", he = "agentflow-provider-ready", ge = "agentflow";
function _e(e) {
	let t = e;
	return t.context === ge && typeof t.callback == "function";
}
function ve(e, t) {
	let n, r = () => {
		let r = Object.assign(new Event(me, {
			bubbles: !0,
			composed: !0
		}), {
			context: ge,
			subscribe: !0,
			callback: (e, r) => {
				n = r, t(e);
			}
		});
		e.dispatchEvent(r);
	}, i = () => {
		n || r();
	};
	return window.addEventListener(he, i), r(), () => {
		window.removeEventListener(he, i), n?.();
	};
}
function ye(e) {
	typeof reportError == "function" ? reportError(e) : console.error(e);
}
function be(e, t, n) {
	try {
		e(t, n);
	} catch (e) {
		ye(e);
	}
}
function xe(e, t) {
	let n = t, r = /* @__PURE__ */ new Set(), i = (e) => {
		if (!_e(e)) return;
		e.stopPropagation();
		let t = e.callback;
		e.subscribe && r.add(t), be(t, n, () => r.delete(t));
	};
	return e.addEventListener(me, i), window.dispatchEvent(new Event(he)), {
		set(e) {
			n = e;
			for (let e of [...r]) be(e, n, () => r.delete(e));
		},
		dispose() {
			e.removeEventListener(me, i), r.clear();
		}
	};
}
//#endregion
//#region src/errors.ts
var Se = /* @__PURE__ */ new Set([
	"APP_NOT_ASSIGNED",
	"APP_NOT_INSTALLED",
	"USER_NOT_PROJECTED"
]);
function Ce(e) {
	let t = e;
	return typeof t == "object" && !!t && typeof t.status == "number" && typeof t.code == "string";
}
var we = (e) => typeof e == "object" && !!e && typeof e.path == "string" && typeof e.message == "string";
function Te(e) {
	if (Ce(e)) {
		if (e.status === 401) return { type: "signed-out" };
		if (e.status === 403 && Se.has(e.code)) return {
			type: "access-lost",
			code: e.code
		};
		let t = {
			code: e.code,
			status: e.status
		};
		return typeof e.detail == "string" && (t.detail = e.detail), typeof e.requestId == "string" && (t.requestId = e.requestId), Array.isArray(e.fieldErrors) && (t.fieldErrors = e.fieldErrors.filter(we).map(({ path: e, message: t }) => ({
			path: e,
			message: t
		}))), {
			type: "other",
			problem: t
		};
	}
	return {
		type: "other",
		problem: {
			code: "NETWORK_ERROR",
			status: 0,
			detail: e instanceof Error ? e.message : String(e)
		}
	};
}
var Ee = {
	en: {
		"common.loading": "Loading…",
		"common.load_more": "Load more",
		"common.error": "Something went wrong ({code}).",
		"common.request_id": "Request id: {id}",
		"common.yes": "Yes",
		"common.no": "No",
		"common.cancel": "Cancel",
		"inbox.empty": "No tasks to show.",
		"inbox.column.task": "Task",
		"inbox.column.workflow": "Workflow",
		"inbox.column.status": "Status",
		"inbox.column.due": "Due",
		"task.claim": "Claim",
		"task.release": "Release",
		"task.submit": "Submit",
		"task.claimed_by": "Claimed by {name}",
		"task.claimed_by_someone": "Someone else is working on this task.",
		"task.withheld": "Only the people this task is assigned to can see its form.",
		"task.done": "This task is complete.",
		"task.cancelled": "This task was withdrawn.",
		"task.signed_waiting": "This task is signed and waiting on the workflow's owner to finish it.",
		"task.no_actions": "There is no decision you can make on this task right now.",
		"task.sign_elsewhere": "Signing this task isn't available here. Open it in AgentFlow to sign.",
		"task.select_elsewhere": "Choosing records for this task isn't available here. Open it in AgentFlow to choose them.",
		"form.required": "Required",
		"form.unsupported": "This field can't be edited here.",
		"form.unsupported_required": "This form has a required field that can't be edited here.",
		"records.search": "Search",
		"records.create": "New record",
		"records.save": "Create",
		"records.empty": "No records.",
		"start.choose": "Choose a workflow",
		"start.name": "Case name",
		"start.submit": "Start",
		"start.not_startable": "This workflow can't be started here.",
		"start.started": "Started.",
		"status.open": "Open",
		"status.claimed": "Claimed",
		"status.submitted": "Submitted",
		"status.cancelled": "Cancelled"
	},
	vi: {
		"common.loading": "Đang tải…",
		"common.load_more": "Tải thêm",
		"common.error": "Đã có lỗi xảy ra ({code}).",
		"common.request_id": "Mã yêu cầu: {id}",
		"common.yes": "Có",
		"common.no": "Không",
		"common.cancel": "Hủy",
		"inbox.empty": "Không có công việc nào.",
		"inbox.column.task": "Công việc",
		"inbox.column.workflow": "Quy trình",
		"inbox.column.status": "Trạng thái",
		"inbox.column.due": "Hạn",
		"task.claim": "Nhận việc",
		"task.release": "Trả lại",
		"task.submit": "Gửi",
		"task.claimed_by": "Đã được {name} nhận",
		"task.claimed_by_someone": "Người khác đang xử lý công việc này.",
		"task.withheld": "Chỉ những người được giao công việc này mới xem được biểu mẫu.",
		"task.done": "Công việc đã hoàn tất.",
		"task.cancelled": "Công việc này đã bị rút lại.",
		"task.signed_waiting": "Công việc này đã được ký và đang chờ chủ sở hữu quy trình hoàn tất.",
		"task.no_actions": "Hiện bạn không có quyết định nào để thực hiện cho công việc này.",
		"task.sign_elsewhere": "Không thể ký công việc này ở đây. Hãy mở công việc trong AgentFlow để ký.",
		"task.select_elsewhere": "Không thể chọn bản ghi cho công việc này ở đây. Hãy mở công việc trong AgentFlow để chọn.",
		"form.required": "Bắt buộc",
		"form.unsupported": "Không thể nhập trường này ở đây.",
		"form.unsupported_required": "Biểu mẫu có trường bắt buộc không nhập được ở đây.",
		"records.search": "Tìm kiếm",
		"records.create": "Thêm bản ghi",
		"records.save": "Tạo",
		"records.empty": "Không có bản ghi nào.",
		"start.choose": "Chọn quy trình",
		"start.name": "Tên hồ sơ",
		"start.submit": "Bắt đầu",
		"start.not_startable": "Không thể bắt đầu quy trình này ở đây.",
		"start.started": "Đã bắt đầu.",
		"status.open": "Mới",
		"status.claimed": "Đã nhận",
		"status.submitted": "Đã gửi",
		"status.cancelled": "Đã hủy"
	}
};
function De(e, t) {
	return e === "en" || e === "vi" ? e : t?.toLowerCase().startsWith("vi") ? "vi" : "en";
}
function Oe(e, t) {
	return (n, r) => (t[n] ?? Ee[e][n] ?? n).replace(/\{(\w+)\}/g, (e, t) => r && t in r ? String(r[t]) : e);
}
//#endregion
//#region src/props.ts
var ke = /* @__PURE__ */ new Set();
function Ae(e, t) {
	typeof t == "string" && !ke.has(e) && (ke.add(e), console.warn(`agentflow: \`${e}\` is a property, not an attribute; set it from JavaScript.`));
}
function je(e, t) {
	if (typeof e == "object" && e && !Array.isArray(e)) return e;
	Ae(t, e);
}
function Me(e) {
	let t = e == null ? NaN : Math.trunc(Number(e));
	return Number.isNaN(t) ? 25 : Math.min(200, Math.max(1, t));
}
function Ne(e, t) {
	if (typeof e == "function") return e;
	Ae(t, e);
}
//#endregion
//#region src/elements/Provider.svelte
function Pe(t, n) {
	v(n, !0);
	let i = T(n, "basePath", 7, ue), a = T(n, "locale", 7, void 0), o = T(n, "strings", 23, () => ({})), c = T(n, "fetchImpl", 7, void 0), u = n.$$host, d = l("loading"), f = l(null), h = r(() => se({
		baseUrl: `${location.origin}${pe(i())}/api`,
		auth: F(),
		fetch: Ne(c(), "fetchImpl") ?? globalThis.fetch.bind(globalThis)
	})), g = !1, y = (e, t) => {
		g || u.dispatchEvent(new CustomEvent(e, {
			detail: t,
			bubbles: !0,
			composed: !0
		}));
	};
	function C(e) {
		g || (_(d, e, !0), u.dataset.state = e);
	}
	u.dataset.state = "loading";
	function w(e, t) {
		let n = Te(e);
		return n.type === "signed-out" ? (p(d) !== "signed-out" && (C("signed-out"), y("signed-out", {})), null) : n.type === "access-lost" ? (p(d) !== "access-lost" && (C("access-lost"), y("access-lost", { code: n.code })), null) : (t && C("error"), y("request-failed", {
			code: n.problem.code,
			status: n.problem.status,
			detail: n.problem.detail,
			requestId: n.problem.requestId
		}), n.problem);
	}
	let E = (e) => w(e, !1), D = b(() => De(a(), typeof navigator > "u" ? void 0 : navigator.language)), k = b(() => ({
		state: p(d),
		caller: p(f),
		client: h,
		locale: p(D),
		t: Oe(p(D), je(o(), "strings") ?? {}),
		report: E
	})), A = xe(u, r(() => p(k)));
	m(() => A.set(p(k))), m(() => () => {
		g = !0, A.dispose();
	}), (async () => {
		try {
			let e = await L(h.GET("/caller"));
			_(f, e, !0), C("ready"), y("session-ready", { caller: e });
		} catch (e) {
			w(e, !0);
		}
	})();
	var j = {
		get basePath() {
			return i();
		},
		set basePath(t = ue) {
			i(t), e();
		},
		get locale() {
			return a();
		},
		set locale(t = void 0) {
			a(t), e();
		},
		get strings() {
			return o();
		},
		set strings(t = {}) {
			o(t), e();
		},
		get fetchImpl() {
			return c();
		},
		set fetchImpl(t = void 0) {
			c(t), e();
		}
	}, M = s(), P = O(M);
	return N(P, n, "default", {}, null), S(t, M), x(j);
}
A(Pe, {
	basePath: {
		attribute: "base-path",
		type: "String"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: {},
	fetchImpl: {}
}, ["default"], [], { mode: "open" });
//#endregion
//#region src/FieldList.svelte
var Fe = c("<span class=\"req svelte-olgbsr\">*</span>"), Ie = c("<input part=\"input\" type=\"checkbox\" class=\"svelte-olgbsr\"/>"), Le = c("<option> </option>"), Re = c("<select part=\"input\" class=\"svelte-olgbsr\"><option>—</option><!></select>"), ze = c("<p part=\"notice\" class=\"muted svelte-olgbsr\"> </p>"), Be = c("<input part=\"input\" class=\"svelte-olgbsr\"/>"), Ve = c("<p class=\"muted svelte-olgbsr\"> </p>"), He = c("<p part=\"field-error\" class=\"error svelte-olgbsr\" role=\"alert\"> </p>"), Ue = c("<div part=\"field\" class=\"field svelte-olgbsr\"><label part=\"label\" class=\"svelte-olgbsr\"> <!></label> <!> <!> <!></div>"), We = {
	hash: "svelte-olgbsr",
	code: ".field.svelte-olgbsr {display:grid;gap:4px;margin-block-end:var(--agentflow-gap, 12px);}label.svelte-olgbsr {font-weight:600;}.req.svelte-olgbsr {color:var(--agentflow-danger, #b42318);}.muted.svelte-olgbsr {color:var(--agentflow-muted, #667085);margin:0;font-size:0.9em;}.error.svelte-olgbsr {color:var(--agentflow-danger, #b42318);margin:0;}input.svelte-olgbsr, select.svelte-olgbsr {font:inherit;padding:6px 8px;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);}"
};
function Ge(r, o) {
	v(o, !0), M(r, We);
	let c = T(o, "fields", 7), l = T(o, "values", 31, () => h({})), u = T(o, "errors", 23, () => ({})), m = T(o, "disabled", 7, !1), _ = T(o, "t", 7), b = {
		text: "text",
		email: "email",
		date: "date",
		datetime: "datetime-local",
		number: "number",
		integer: "number"
	};
	var A = {
		get fields() {
			return c();
		},
		set fields(t) {
			c(t), e();
		},
		get values() {
			return l();
		},
		set values(t = {}) {
			l(t), e();
		},
		get errors() {
			return u();
		},
		set errors(t = {}) {
			u(t), e();
		},
		get disabled() {
			return m();
		},
		set disabled(t = !1) {
			m(t), e();
		},
		get t() {
			return _();
		},
		set t(t) {
			_(t), e();
		}
	}, N = s(), P = O(N);
	return n(P, 17, c, (e) => e.key, (e, r) => {
		var o = Ue(), s = a(o), c = a(s, !0), h = g(c), v = (e) => {
			var t = Fe();
			f((e) => j(t, "title", e), [() => _()("form.required")]), S(e, t);
		};
		d(h, (e) => {
			p(r).required && e(v);
		}), y(s);
		var x = g(s, 2), T = (e) => {
			var t = Ie();
			C(t), f(() => {
				j(t, "id", `f-${p(r).key}`), t.disabled = m();
			}), E(t, () => l()[p(r).key], (e) => l(l()[p(r).key] = e, !0)), S(e, t);
		}, O = (e) => {
			var o = Re(), s = a(o);
			s.value = s.__value = "";
			var c = g(s);
			n(c, 17, () => p(r).options ?? [], (e) => e.value, (e, n) => {
				var r = Le(), a = i(r, !0), o = {};
				f(() => {
					t(a, p(n).label), o !== (o = p(n).value) && (r.value = (r.__value = o) ?? "");
				}), S(e, r);
			}), y(o), w(o), f(() => {
				j(o, "id", `f-${p(r).key}`), o.disabled = m();
			}), D(o, () => l()[p(r).key], (e) => l(l()[p(r).key] = e, !0)), S(e, o);
		}, A = (e) => {
			var n = ze(), r = i(n, !0);
			f((e) => t(r, e), [() => _()("form.unsupported")]), S(e, n);
		}, M = (e) => {
			var t = Be();
			C(t), f(() => {
				j(t, "id", `f-${p(r).key}`), j(t, "type", b[p(r).kind]), j(t, "step", p(r).kind === "integer" ? "1" : p(r).kind === "number" ? "any" : void 0), t.disabled = m();
			}), k(t, () => l()[p(r).key], (e) => l(l()[p(r).key] = e, !0)), S(e, t);
		};
		d(x, (e) => {
			p(r).kind === "boolean" ? e(T) : p(r).kind === "choice" ? e(O, 1) : p(r).kind === "unsupported" ? e(A, 2) : e(M, -1);
		});
		var N = g(x, 2), P = (e) => {
			var n = Ve(), a = i(n, !0);
			f(() => t(a, p(r).description)), S(e, n);
		};
		d(N, (e) => {
			p(r).description && e(P);
		});
		var F = g(N, 2), I = (e) => {
			var n = He(), a = i(n, !0);
			f(() => t(a, u()[p(r).key])), S(e, n);
		};
		d(F, (e) => {
			u()[p(r).key] && e(I);
		}), y(o), f(() => {
			j(s, "for", `f-${p(r).key}`), t(c, p(r).label);
		}), S(e, o);
	}), S(r, N), x(A);
}
A(Ge, {
	fields: {},
	values: {},
	errors: {},
	disabled: {},
	t: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/format.ts
var Ke = /^\d{4}-\d{2}-\d{2}$/, qe = /^\d{4}-\d{2}-\d{2}T/;
function Je(e, t) {
	if (!e) return "";
	if (Ke.test(e)) {
		let [n, r, i] = e.split("-").map(Number), a = new Date(n, r - 1, i);
		return a.getFullYear() !== n || a.getMonth() !== r - 1 || a.getDate() !== i ? "" : new Intl.DateTimeFormat(t, { dateStyle: "medium" }).format(a);
	}
	let n = new Date(e);
	return Number.isNaN(n.getTime()) ? "" : new Intl.DateTimeFormat(t, {
		dateStyle: "medium",
		timeStyle: "short"
	}).format(n);
}
function Ye(e, t, n) {
	if (e == null) return "";
	if (typeof e == "boolean") return n(e ? "common.yes" : "common.no");
	if (typeof e == "number") return new Intl.NumberFormat(t, { maximumSignificantDigits: 15 }).format(e);
	if (typeof e == "string") return (Ke.test(e) || qe.test(e)) && Je(e, t) || e;
	if (Array.isArray(e)) return e.map((e) => Ye(e, t, n)).join(", ");
	let r = JSON.stringify(e);
	return r.length > 80 ? `${r.slice(0, 79)}…` : r;
}
//#endregion
//#region src/form.ts
var Xe = (e) => typeof e == "object" && !!e && !Array.isArray(e);
function Ze(e) {
	let t = e.type;
	if (typeof t == "string") return t;
	if (Array.isArray(t)) return t.find((e) => e !== "null");
}
function Qe(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) t.has(n.value) || t.set(n.value, n.label);
	return {
		kind: "choice",
		options: [...t].map(([e, t]) => ({
			value: e,
			label: t
		}))
	};
}
function $e(e) {
	if (Array.isArray(e.oneOf)) {
		let t = e.oneOf.filter((e) => !(Xe(e) && e.const === null)), n = [];
		for (let e of t) {
			if (!Xe(e) || typeof e.const != "string") return { kind: "unsupported" };
			n.push({
				value: e.const,
				label: typeof e.title == "string" ? e.title : e.const
			});
		}
		return n.length > 0 ? Qe(n) : { kind: "unsupported" };
	}
	if (Array.isArray(e.enum)) {
		if (!e.enum.every((e) => typeof e == "string" || e === null)) return { kind: "unsupported" };
		let t = e.enum.filter((e) => typeof e == "string");
		return t.length > 0 ? Qe(t.map((e) => ({
			value: e,
			label: e
		}))) : { kind: "unsupported" };
	}
	let t = Ze(e);
	if (t === "string") switch (e.format) {
		case void 0: return { kind: "text" };
		case "date": return { kind: "date" };
		case "date-time": return { kind: "datetime" };
		case "email": return { kind: "email" };
		default: return { kind: "unsupported" };
	}
	return t === "number" ? { kind: "number" } : t === "integer" ? { kind: "integer" } : t === "boolean" ? { kind: "boolean" } : { kind: "unsupported" };
}
var et = /^#\/properties\/([^/]+)$/;
function tt(e, t = []) {
	if (!Xe(e)) return t;
	if (e.type === "Control" && typeof e.scope == "string") {
		let n = et.exec(e.scope)?.[1];
		n !== void 0 && t.push(n);
	}
	if (Array.isArray(e.elements)) for (let n of e.elements) tt(n, t);
	return t;
}
function nt(e, t) {
	if (!Xe(e) || !Xe(e.properties)) return [];
	let n = e.properties, r = new Set(Array.isArray(e.required) ? e.required : []), i = (e) => typeof e == "string" && Object.hasOwn(n, e), a = Array.isArray(e["x-order"]) ? e["x-order"].filter(i) : [];
	return [.../* @__PURE__ */ new Set([
		...tt(t).filter(i),
		...a,
		...Object.keys(n)
	])].map((e) => {
		let t = Xe(n[e]) ? n[e] : {}, i = {
			key: e,
			label: typeof t.title == "string" ? t.title : e,
			required: r.has(e),
			...$e(t)
		};
		return typeof t.description == "string" && (i.description = t.description), i;
	});
}
var rt = (e) => String(e).padStart(2, "0");
function it(e) {
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? "" : `${t.getFullYear()}-${rt(t.getMonth() + 1)}-${rt(t.getDate())}T${rt(t.getHours())}:${rt(t.getMinutes())}`;
}
function at(e, t) {
	let n = Xe(t) ? t : {}, r = {};
	for (let t of e) {
		let e = n[t.key];
		t.kind === "boolean" ? r[t.key] = e === !0 : t.kind === "datetime" ? r[t.key] = typeof e == "string" ? it(e) : "" : t.kind === "unsupported" ? r[t.key] = e : r[t.key] = e ?? "";
	}
	return r;
}
var ot = (e) => e == null || e === "";
function st(e, t) {
	let n = {};
	for (let r of e) {
		let e = t[r.key];
		if (r.kind === "boolean") {
			n[r.key] = e === !0;
			continue;
		}
		ot(e) || (r.kind === "number" || r.kind === "integer" ? n[r.key] = Number(e) : r.kind === "datetime" ? n[r.key] = new Date(String(e)).toISOString() : n[r.key] = e);
	}
	return n;
}
function ct(e, t) {
	return e.filter((e) => e.required && e.kind !== "boolean" && e.kind !== "unsupported" && ot(t[e.key])).map((e) => e.key);
}
function lt(e) {
	return e.filter((e) => e.required && e.kind === "unsupported");
}
function ut(e) {
	let t = {};
	for (let n of e ?? []) {
		let e = n.path.replace(/^\//, "").split("/")[0] ?? "";
		t[e] ??= n.message;
	}
	return t;
}
//#endregion
//#region src/use-agentflow.svelte.ts
function dt(e) {
	let t = l(null);
	return m(() => ve(e, (e) => _(t, e))), { get current() {
		return p(t);
	} };
}
//#endregion
//#region src/elements/RecordTable.svelte
var ft = c("<form part=\"search\" role=\"search\"><input type=\"search\" class=\"svelte-1xcrvv6\"/></form>"), pt = c("<button part=\"create-button\" type=\"button\" class=\"svelte-1xcrvv6\"> </button>"), mt = c("<div part=\"toolbar\" class=\"svelte-1xcrvv6\"><!> <!></div>"), ht = c("<p part=\"notice\" class=\"error svelte-1xcrvv6\"> </p>"), gt = c("<form part=\"form\"><!> <!> <div part=\"actions\" class=\"svelte-1xcrvv6\"><button part=\"button\" type=\"button\" class=\"secondary svelte-1xcrvv6\"> </button> <button part=\"button\" type=\"button\" class=\"svelte-1xcrvv6\"> </button></div></form>"), _t = c("<br/> ", 1), vt = c("<p part=\"error\" class=\"error svelte-1xcrvv6\" role=\"alert\"> <!></p>"), yt = c("<p part=\"empty\" class=\"muted svelte-1xcrvv6\"> </p>"), bt = c("<th class=\"svelte-1xcrvv6\"> </th>"), xt = c("<td part=\"cell\" class=\"svelte-1xcrvv6\"> </td>"), St = c("<tr part=\"row\" tabindex=\"0\" class=\"svelte-1xcrvv6\"></tr>"), Ct = c("<table part=\"table\" class=\"svelte-1xcrvv6\"><thead><tr></tr></thead><tbody></tbody></table>"), wt = c("<p class=\"muted svelte-1xcrvv6\"> </p>"), Tt = c("<button part=\"load-more\" type=\"button\" class=\"svelte-1xcrvv6\"> </button>"), Et = c("<!> <!> <!> <!> <!> <!>", 1), Dt = {
	hash: "svelte-1xcrvv6",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}[part='toolbar'].svelte-1xcrvv6 {display:flex;gap:8px;justify-content:space-between;margin-block-end:var(--agentflow-gap, 12px);}input[type='search'].svelte-1xcrvv6 {font:inherit;padding:6px 8px;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);}table.svelte-1xcrvv6 {width:100%;border-collapse:collapse;}th.svelte-1xcrvv6, td.svelte-1xcrvv6 {text-align:start;padding:8px;border-block-end:1px solid var(--agentflow-border, #eaecf0);}tr[part='row'].svelte-1xcrvv6 {cursor:pointer;}tr[part='row'].svelte-1xcrvv6:hover, tr[part='row'].svelte-1xcrvv6:focus {background:color-mix(in srgb, var(--agentflow-accent, #1570ef) 8%, transparent);}.muted.svelte-1xcrvv6 {color:var(--agentflow-muted, #667085);}.error.svelte-1xcrvv6 {color:var(--agentflow-danger, #b42318);}[part='actions'].svelte-1xcrvv6 {display:flex;gap:8px;}button.svelte-1xcrvv6 {font:inherit;padding:6px 14px;cursor:pointer;border-radius:var(--agentflow-radius, 6px);border:1px solid var(--agentflow-accent, #1570ef);background:var(--agentflow-accent, #1570ef);color:var(--agentflow-accent-text, #fff);}button.secondary.svelte-1xcrvv6, [part='load-more'].svelte-1xcrvv6 {background:transparent;color:var(--agentflow-accent, #1570ef);}button.svelte-1xcrvv6:disabled {opacity:0.5;cursor:default;}"
};
function Ot(o, c) {
	v(c, !0), M(o, Dt);
	let w = T(c, "entityId", 7), E = T(c, "columns", 7), D = T(c, "pageSize", 7), A = T(c, "filter", 7), N = c.$$host, F = dt(N), I = b(() => F.current?.state === "ready"), R = b(() => je(A(), "filter")), z = b(() => p(R) ? JSON.stringify(p(R)) : ""), B = b(() => Me(D())), V = l(null), H = l(h([])), U = l(null), W = l(""), G = l(!1), K = l(!1), q = l(null), J = l(null), Y = l(!1), X = l(!1), Z = l(h({})), Q = l(h({})), ee = b(() => lt(p(J) ?? [])), te = b(() => {
		if (!p(V)) return [];
		let e = E()?.split(",").map((e) => e.trim()).filter(Boolean);
		return e?.length ? e.map((e) => p(V).fields.find((t) => t.key === e)).filter((e) => !!e) : p(V).fields.filter((e) => !e.system).slice(0, 5);
	}), ne = (e, t) => N.dispatchEvent(new CustomEvent(e, {
		detail: t,
		bubbles: !0,
		composed: !0
	})), $ = 0, re = 0;
	async function ie(e) {
		let t = F.current;
		if (!t) return;
		let n = $, r;
		try {
			r = await L(t.client.GET("/entities/{entity_id}", { params: { path: { entity_id: e } } }));
		} catch (e) {
			let r = t.report(e);
			n === $ && _(q, r, !0);
			return;
		}
		if (n === $ && (_(V, r, !0), r.effective_capabilities?.write)) try {
			let r = await L(t.client.GET("/entities/{entity_id}/create-form", { params: { path: { entity_id: e } } }));
			n === $ && _(J, nt(r.schema_json, r.ui_schema_json), !0);
		} catch (e) {
			let r = e?.status;
			if (r === 403 || r === 404) return;
			let i = t.report(e);
			n === $ && _(q, i, !0);
		}
	}
	async function ae(e) {
		let t = F.current, n = w();
		if (!t || !n || !p(V)) return;
		let r = ++re;
		_(K, !0), _(q, null), e || _(U, null);
		try {
			let i = { entity_id: n }, a = p(R) ? await L(t.client.POST("/entities/{entity_id}/records/query", {
				params: { path: i },
				body: {
					filter: p(R),
					limit: p(B),
					cursor: e
				}
			})) : await L(t.client.GET("/entities/{entity_id}/records", { params: {
				path: i,
				query: {
					limit: p(B),
					cursor: e,
					q: p(W) || void 0
				}
			} }));
			if (r !== re) return;
			_(H, e ? [...p(H), ...a.items] : a.items, !0), _(U, a.next_cursor, !0), _(G, !0);
		} catch (n) {
			let i = t.report(n);
			r === re && (_(q, i, !0), e || _(H, [], !0));
		} finally {
			r === re && _(K, !1);
		}
	}
	function oe() {
		_(Z, at(p(J) ?? [], {}), !0), _(Q, {}, !0), _(Y, !0);
	}
	async function se() {
		let e = F.current, t = w();
		if (!e || !t || !p(J) || p(X) || p(ee).length > 0) return;
		let n = ct(p(J), p(Z));
		if (n.length > 0) {
			_(Q, Object.fromEntries(n.map((t) => [t, e.t("form.required")])), !0);
			return;
		}
		let r = $;
		_(X, !0), _(q, null), _(Q, {}, !0);
		let i;
		try {
			i = await L(e.client.POST("/entities/{entity_id}/records", {
				params: { path: { entity_id: t } },
				body: { form_payload: st(p(J), p(Z)) }
			}));
		} catch (t) {
			let n = e.report(t);
			if (r !== $) return;
			_(X, !1), _(Q, ut(n?.fieldErrors), !0), _(q, n, !0);
			return;
		}
		ne("record-created", { recordId: i.id }), r === $ && (_(X, !1), _(Y, !1), await ae());
	}
	m(() => {
		w(), $++, re++, _(V, null), _(J, null), _(W, ""), _(Y, !1), _(X, !1), _(H, [], !0), _(U, null), _(G, !1), _(K, !1), _(q, null);
	}), m(() => {
		if (!p(I) || !w()) return;
		let e = w();
		r(() => ie(e));
	}), m(() => {
		p(I) && p(V) && (p(z), p(B), r(() => ae()));
	});
	var ce = {
		get entityId() {
			return w();
		},
		set entityId(t) {
			w(t), e();
		},
		get columns() {
			return E();
		},
		set columns(t) {
			E(t), e();
		},
		get pageSize() {
			return D();
		},
		set pageSize(t) {
			D(t), e();
		},
		get filter() {
			return A();
		},
		set filter(t) {
			A(t), e();
		}
	}, le = s(), ue = O(le), de = (e) => {
		let r = b(() => F.current.t);
		var o = Et(), s = O(o), c = (e) => {
			var n = mt(), o = a(n), s = (e) => {
				var t = ft(), n = a(t);
				C(n), y(t), f((e, t) => {
					j(n, "placeholder", e), j(n, "aria-label", t);
				}, [() => p(r)("records.search"), () => p(r)("records.search")]), P("submit", t, (e) => {
					e.preventDefault(), ae();
				}), k(n, () => p(W), (e) => _(W, e)), S(e, t);
			};
			d(o, (e) => {
				p(R) || e(s);
			});
			var c = g(o, 2), l = (e) => {
				var n = pt(), a = i(n, !0);
				f((e) => t(a, e), [() => p(r)("records.create")]), u("click", n, oe), S(e, n);
			};
			d(c, (e) => {
				p(J) && !p(Y) && e(l);
			}), y(n), S(e, n);
		};
		d(s, (e) => {
			p(V) && e(c);
		});
		var l = g(s, 2), m = (e) => {
			var n = gt(), o = a(n);
			Ge(o, {
				get fields() {
					return p(J);
				},
				get errors() {
					return p(Q);
				},
				get disabled() {
					return p(X);
				},
				get t() {
					return p(r);
				},
				get values() {
					return p(Z);
				},
				set values(e) {
					_(Z, e, !0);
				}
			});
			var s = g(o, 2), c = (e) => {
				var n = ht(), a = i(n, !0);
				f((e) => t(a, e), [() => p(r)("form.unsupported_required")]), S(e, n);
			};
			d(s, (e) => {
				p(ee).length > 0 && e(c);
			});
			var l = g(s, 2), m = a(l), h = i(m, !0), v = g(m, 2), b = i(v, !0);
			y(l), y(n), f((e, n) => {
				t(h, e), v.disabled = p(X) || p(ee).length > 0, t(b, n);
			}, [() => p(r)("common.cancel"), () => p(r)("records.save")]), P("submit", n, (e) => e.preventDefault()), u("click", m, () => _(Y, !1)), u("click", v, se), S(e, n);
		};
		d(l, (e) => {
			p(Y) && p(J) && e(m);
		});
		var h = g(l, 2), v = (e) => {
			var n = vt(), i = a(n), o = g(i), s = (e) => {
				var n = _t(), i = g(O(n), 1, !0);
				f((e) => t(i, e), [() => p(r)("common.request_id", { id: p(q).requestId })]), S(e, n);
			};
			d(o, (e) => {
				p(q).requestId && e(s);
			}), y(n), f((e) => t(i, `${e ?? ""} `), [() => p(r)("common.error", { code: p(q).code })]), S(e, n);
		};
		d(h, (e) => {
			p(q) && e(v);
		});
		var x = g(h, 2), w = (e) => {
			var n = yt(), a = i(n, !0);
			f((e) => t(a, e), [() => p(r)("records.empty")]), S(e, n);
		}, T = (e) => {
			var o = Ct(), s = a(o), c = a(s);
			n(c, 21, () => p(te), (e) => e.key, (e, n) => {
				var r = bt(), a = i(r, !0);
				f(() => t(a, p(n).label)), S(e, r);
			}), y(c), y(s);
			var l = g(s);
			n(l, 21, () => p(H), (e) => e.id, (e, a) => {
				var o = St();
				n(o, 21, () => p(te), (e) => e.key, (e, n) => {
					var o = xt(), s = i(o, !0);
					f((e) => t(s, e), [() => Ye(p(a).body[p(n).key], F.current.locale, p(r))]), S(e, o);
				}), y(o), u("click", o, () => ne("record-select", { recordId: p(a).id })), u("keydown", o, (e) => e.key === "Enter" && ne("record-select", { recordId: p(a).id })), S(e, o);
			}), y(l), y(o), S(e, o);
		};
		d(x, (e) => {
			p(G) && !p(K) && p(H).length === 0 && !p(q) ? e(w) : p(H).length > 0 && e(T, 1);
		});
		var E = g(x, 2), D = (e) => {
			var n = wt(), a = i(n, !0);
			f((e) => t(a, e), [() => p(r)("common.loading")]), S(e, n);
		};
		d(E, (e) => {
			p(K) && e(D);
		});
		var A = g(E, 2), M = (e) => {
			var n = Tt(), a = i(n, !0);
			f((e) => t(a, e), [() => p(r)("common.load_more")]), u("click", n, () => ae(p(U) ?? void 0)), S(e, n);
		};
		d(A, (e) => {
			p(U) && !p(K) && e(M);
		}), S(e, o);
	};
	return d(ue, (e) => {
		F.current && p(I) && e(de);
	}), S(o, le), x(ce);
}
o(["click", "keydown"]), A(Ot, {
	entityId: {
		attribute: "entity-id",
		type: "String"
	},
	columns: {
		attribute: "columns",
		type: "String"
	},
	pageSize: {
		attribute: "page-size",
		type: "Number"
	},
	filter: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/elements/StartForm.svelte
var kt = c("<p part=\"error\" class=\"error svelte-1o3y7sj\" role=\"alert\"> </p>"), At = c("<option> </option>"), jt = c("<label part=\"picker\" class=\"svelte-1o3y7sj\"> <select class=\"svelte-1o3y7sj\"><option>—</option><!></select></label>"), Mt = c("<p class=\"muted svelte-1o3y7sj\"> </p>"), Nt = c("<br/> ", 1), Pt = c("<p part=\"error\" class=\"error svelte-1o3y7sj\" role=\"alert\"> <!></p>"), Ft = c("<p part=\"notice\" role=\"status\"> </p>"), It = c("<p part=\"notice\" class=\"error svelte-1o3y7sj\"> </p>"), Lt = c("<form part=\"form\"><!> <!> <div part=\"actions\"><button part=\"button\" type=\"button\" class=\"svelte-1o3y7sj\"> </button></div></form>"), Rt = c("<!> <!> <!> <!> <!>", 1), zt = {
	hash: "svelte-1o3y7sj",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}[part='picker'].svelte-1o3y7sj {display:grid;gap:4px;margin-block-end:var(--agentflow-gap, 12px);font-weight:600;}select.svelte-1o3y7sj {font:inherit;padding:6px 8px;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);}.muted.svelte-1o3y7sj {color:var(--agentflow-muted, #667085);}.error.svelte-1o3y7sj {color:var(--agentflow-danger, #b42318);}button.svelte-1o3y7sj {font:inherit;padding:6px 14px;cursor:pointer;border-radius:var(--agentflow-radius, 6px);border:1px solid var(--agentflow-accent, #1570ef);background:var(--agentflow-accent, #1570ef);color:var(--agentflow-accent-text, #fff);}button.svelte-1o3y7sj:disabled {opacity:0.5;cursor:default;}"
};
function Bt(o, c) {
	v(c, !0), M(o, zt);
	let C = T(c, "workflowId", 7), E = "__name", k = c.$$host, A = dt(k), j = b(() => A.current?.state === "ready"), N = l(h([])), F = l(""), I = l(!1), R = l(null), z = l(h([])), B = l(h({})), V = l(h({})), H = l(null), U = l(!1), W = l(!1), G = l(!1), K = b(() => lt(p(z))), q = (e, t) => k.dispatchEvent(new CustomEvent(e, {
		detail: t,
		bubbles: !0,
		composed: !0
	})), J = 0;
	function Y() {
		J++, _(R, null), _(z, [], !0), _(B, {}, !0), _(V, {}, !0), _(H, null), _(U, !1), _(W, !1), _(G, !1);
	}
	async function X(e) {
		let t = A.current;
		if (!t) return;
		let n = J;
		_(G, !0);
		let r = [];
		try {
			for await (let e of ce((e) => L(t.client.GET("/workflows/startable", { params: { query: e ? {
				limit: 100,
				cursor: e
			} : { limit: 100 } } })))) r.push(e);
		} catch (e) {
			let r = t.report(e);
			n === J && (_(H, r, !0), _(G, !1));
			return;
		}
		if (n !== J || (_(G, !1), _(N, r, !0), !e)) return;
		let i = r.find((t) => t.id === e);
		i ? await Q(i) : _(I, !0);
	}
	let Z = (e) => ({
		...at(p(z), {}),
		[E]: e.name
	});
	async function Q(e) {
		let t = A.current;
		if (!t || (Y(), !e)) return;
		let n = J;
		_(G, !0);
		let r;
		try {
			r = await L(t.client.GET("/workflow-versions/{version_id}/start-form", { params: { path: { version_id: e.version_id } } }));
		} catch (e) {
			let r = t.report(e);
			n === J && (_(H, r, !0), _(G, !1));
			return;
		}
		if (n !== J) return;
		_(G, !1);
		let i = {
			key: E,
			label: t.t("start.name"),
			kind: "text",
			required: !0
		};
		_(z, [i, ...nt(r.form_definition?.schema_json, r.form_definition?.ui_schema_json)], !0), _(B, Z(e), !0), _(R, e, !0);
	}
	function ee(e) {
		_(F, e, !0), Q(p(N).find((t) => t.id === e) ?? null);
	}
	async function te() {
		let e = A.current, t = p(R);
		if (!e || !t || p(U) || p(K).length > 0) return;
		_(W, !1);
		let n = String(p(B)[E] ?? "").trim(), r = ct(p(z), {
			...p(B),
			[E]: n
		});
		if (r.length > 0) {
			_(V, Object.fromEntries(r.map((t) => [t, e.t("form.required")])), !0);
			return;
		}
		let i = J;
		_(U, !0), _(H, null), _(V, {}, !0);
		let a;
		try {
			a = await L(e.client.POST("/workflows/{workflow_id}/instances", {
				params: { path: { workflow_id: t.id } },
				body: {
					name: n,
					version_id: t.version_id,
					input_payload: st(p(z).filter((e) => e.key !== E), p(B))
				}
			}));
		} catch (t) {
			let n = e.report(t);
			if (i !== J) return;
			_(U, !1), _(V, ut(n?.fieldErrors), !0), _(H, n, !0);
			return;
		}
		q("workflow-started", {
			instanceId: a.id,
			workflowId: t.id
		}), i === J && (_(U, !1), _(B, Z(t), !0), _(W, !0));
	}
	m(() => {
		C(), Y(), _(N, [], !0), _(F, ""), _(I, !1);
	}), m(() => {
		if (!p(j)) return;
		let e = C();
		r(() => X(e));
	});
	var ne = {
		get workflowId() {
			return C();
		},
		set workflowId(t) {
			C(t), e();
		}
	}, $ = s(), re = O($), ie = (e) => {
		let r = b(() => A.current.t);
		var o = s(), c = O(o), l = (e) => {
			var n = kt(), a = i(n, !0);
			f((e) => t(a, e), [() => p(r)("start.not_startable")]), S(e, n);
		}, m = (e) => {
			var o = Rt(), s = O(o), c = (e) => {
				var o = jt(), s = a(o), c = g(s), l = a(c);
				l.value = l.__value = "";
				var u = g(l);
				n(u, 17, () => p(N), (e) => e.id, (e, n) => {
					var r = At(), a = i(r, !0), o = {};
					f(() => {
						t(a, p(n).name), o !== (o = p(n).id) && (r.value = (r.__value = o) ?? "");
					}), S(e, r);
				}), y(c), w(c), y(o), f((e) => t(s, `${e ?? ""} `), [() => p(r)("start.choose")]), D(c, () => p(F), ee), S(e, o);
			};
			d(s, (e) => {
				C() || e(c);
			});
			var l = g(s, 2), m = (e) => {
				var n = Mt(), a = i(n, !0);
				f((e) => t(a, e), [() => p(r)("common.loading")]), S(e, n);
			};
			d(l, (e) => {
				p(G) && e(m);
			});
			var h = g(l, 2), v = (e) => {
				var n = Pt(), i = a(n), o = g(i), s = (e) => {
					var n = Nt(), i = g(O(n), 1, !0);
					f((e) => t(i, e), [() => p(r)("common.request_id", { id: p(H).requestId })]), S(e, n);
				};
				d(o, (e) => {
					p(H).requestId && e(s);
				}), y(n), f((e) => t(i, `${e ?? ""} `), [() => p(r)("common.error", { code: p(H).code })]), S(e, n);
			};
			d(h, (e) => {
				p(H) && e(v);
			});
			var b = g(h, 2), x = (e) => {
				var n = Ft(), a = i(n, !0);
				f((e) => t(a, e), [() => p(r)("start.started")]), S(e, n);
			};
			d(b, (e) => {
				p(W) && e(x);
			});
			var T = g(b, 2), E = (e) => {
				var n = Lt(), o = a(n);
				Ge(o, {
					get fields() {
						return p(z);
					},
					get errors() {
						return p(V);
					},
					get disabled() {
						return p(U);
					},
					get t() {
						return p(r);
					},
					get values() {
						return p(B);
					},
					set values(e) {
						_(B, e, !0);
					}
				});
				var s = g(o, 2), c = (e) => {
					var n = It(), a = i(n, !0);
					f((e) => t(a, e), [() => p(r)("form.unsupported_required")]), S(e, n);
				};
				d(s, (e) => {
					p(K).length > 0 && e(c);
				});
				var l = g(s, 2), m = a(l), h = i(m, !0);
				y(l), y(n), f((e) => {
					m.disabled = p(U) || p(K).length > 0, t(h, e);
				}, [() => p(r)("start.submit")]), P("submit", n, (e) => e.preventDefault()), u("click", m, te), S(e, n);
			};
			d(T, (e) => {
				p(R) && e(E);
			}), S(e, o);
		};
		d(c, (e) => {
			p(I) ? e(l) : e(m, -1);
		}), S(e, o);
	};
	return d(re, (e) => {
		A.current && p(j) && e(ie);
	}), S(o, $), x(ne);
}
o(["click"]), A(Bt, { workflowId: {
	attribute: "workflow-id",
	type: "String"
} }, [], [], { mode: "open" });
//#endregion
//#region src/elements/TaskDetail.svelte
var Vt = c("<header part=\"header\"><h2 part=\"title\" class=\"svelte-xgtj81\"> </h2> <p part=\"meta\" class=\"muted svelte-xgtj81\"> </p></header>"), Ht = c("<br/> ", 1), Ut = c("<p part=\"error\" class=\"error svelte-xgtj81\" role=\"alert\"> <!> <!></p>"), Wt = c("<p class=\"muted svelte-xgtj81\"> </p>"), Gt = c("<p part=\"notice\"> </p>"), Kt = c("<button part=\"button\" type=\"button\" class=\"secondary svelte-xgtj81\"> </button>"), qt = c("<div part=\"actions\" class=\"svelte-xgtj81\"><button part=\"button\" type=\"button\" class=\"svelte-xgtj81\"> </button></div>"), Jt = c("<p part=\"notice\"> </p> <div part=\"actions\" class=\"svelte-xgtj81\"><!></div>", 1), Yt = c("<p part=\"notice\" class=\"error svelte-xgtj81\"> </p>"), Xt = c("<button part=\"button\" type=\"button\" class=\"svelte-xgtj81\"> </button>"), Zt = c("<form part=\"form\"><!> <!> <!> <!> <div part=\"actions\" class=\"svelte-xgtj81\"><!> <!></div></form>"), Qt = c("<!> <!> <!> <!>", 1), $t = {
	hash: "svelte-xgtj81",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}h2.svelte-xgtj81 {margin:0 0 4px;font-size:1.25em;}.muted.svelte-xgtj81 {color:var(--agentflow-muted, #667085);margin:0 0 var(--agentflow-gap, 12px);}.error.svelte-xgtj81 {color:var(--agentflow-danger, #b42318);}[part='actions'].svelte-xgtj81 {display:flex;gap:8px;flex-wrap:wrap;}button.svelte-xgtj81 {font:inherit;padding:6px 14px;cursor:pointer;border-radius:var(--agentflow-radius, 6px);border:1px solid var(--agentflow-accent, #1570ef);background:var(--agentflow-accent, #1570ef);color:var(--agentflow-accent-text, #fff);}button.secondary.svelte-xgtj81 {background:transparent;color:var(--agentflow-accent, #1570ef);}button.svelte-xgtj81:disabled {opacity:0.5;cursor:default;}"
};
function en(o, c) {
	v(c, !0), M(o, $t);
	let C = T(c, "entityId", 7), w = T(c, "recordId", 7), E = {
		id: null,
		name: null,
		title: null
	}, D = c.$$host, k = dt(D), A = b(() => k.current?.state === "ready"), j = l(null), N = l(h(E)), F = l(!1), I = l(h([])), R = l(h({})), z = l(h({})), B = l(null), V = l(!1), H = l(!1), U = b(() => !!p(N).id && p(N).id === k.current?.caller?.id), W = b(() => !!p(j) && p(j).step_status !== "open"), G = b(() => !!p(j) && p(j).step_status === "open" && p(j).signed), K = b(() => lt(p(I))), q = b(() => p(j)?.actions.find((e) => e.id === p(j)?.signed_action_id)), J = b(() => p(j)?.actions.filter((e) => e.id !== p(q)?.id) ?? []), Y = b(() => {
		let e = p(j)?.entity_view;
		return e?.mode !== "selectable" || e.view?.type !== "grid" && e.view?.type !== "kanban" ? !1 : (e.min_selection ?? 1) > 0;
	}), X = (e, t) => D.dispatchEvent(new CustomEvent(e, {
		detail: t,
		bubbles: !0,
		composed: !0
	}));
	function Z(e) {
		_(j, e, !0), _(I, nt(e.form_definition?.schema_json, e.form_definition?.ui_schema_json), !0), _(R, at(p(I), e.draft_payload ?? e.prefill ?? {}), !0), _(z, {}, !0);
	}
	let Q = 0;
	async function ee(e, t) {
		let n = k.current;
		if (!n || !e || !t) return;
		let r = Q;
		_(H, !0);
		try {
			let i = {
				entity_id: e,
				record_id: t
			}, [a, o] = await Promise.all([n.client.GET("/entities/{entity_id}/records/{record_id}/step", { params: { path: i } }), n.client.GET("/entities/{entity_id}/records/{record_id}", { params: { path: i } })]);
			if (a.response.status === 404) {
				r === Q && (_(j, null), _(N, E, !0)), await L(Promise.resolve(o)), r === Q && _(F, !0);
				return;
			}
			let s = await L(Promise.resolve(a)), c = await L(Promise.resolve(o));
			if (r !== Q) return;
			_(F, !1);
			let l = typeof c.body.claimed_by == "string" ? c.body.claimed_by : null;
			_(N, {
				id: l,
				name: l ? c.ref_labels?.claimed_by ?? null : null,
				title: typeof c.body.title == "string" ? c.body.title : null
			}, !0), Z(s);
		} catch (e) {
			let t = n.report(e);
			r === Q && _(B, t, !0);
		} finally {
			r === Q && _(H, !1);
		}
	}
	async function te(e) {
		let t = k.current;
		if (!t || !p(j)) return;
		let n = C(), r = w(), i = Q;
		_(V, !0), _(B, null);
		try {
			let a = e === "claim" ? "/entities/{entity_id}/records/{record_id}/work/claim" : "/entities/{entity_id}/records/{record_id}/work/release";
			await L(t.client.POST(a, { params: { path: {
				entity_id: n,
				record_id: r
			} } })), i === Q && await ee(n, r), X(e === "claim" ? "task-claimed" : "task-released", {
				recordId: r,
				entityId: n
			});
		} catch (e) {
			let a = t.report(e);
			if (i !== Q) return;
			_(B, a, !0), a && await ee(n, r);
		} finally {
			i === Q && _(V, !1);
		}
	}
	async function ne(e) {
		let t = k.current;
		if (!t || !p(j)) return;
		let n = ct(p(I), p(R));
		if (n.length > 0) {
			_(z, Object.fromEntries(n.map((e) => [e, t.t("form.required")])), !0);
			return;
		}
		let r = C(), i = w(), a = Q;
		_(V, !0), _(B, null), _(z, {}, !0);
		try {
			let n = st(p(I), p(R));
			e && (n._action = e);
			let o = await L(t.client.POST("/entities/{entity_id}/records/{record_id}/step/submit", {
				params: { path: {
					entity_id: r,
					record_id: i
				} },
				body: { payload: n }
			}));
			a === Q && Z(o), X("task-submitted", {
				recordId: i,
				entityId: r,
				actionId: e
			});
		} catch (e) {
			let n = t.report(e);
			if (a !== Q) return;
			_(z, ut(n?.fieldErrors), !0), _(B, n, !0);
		} finally {
			a === Q && _(V, !1);
		}
	}
	m(() => {
		C(), w(), Q++, _(j, null), _(F, !1), _(N, E, !0), _(B, null), _(z, {}, !0), _(V, !1), _(H, !1);
	}), m(() => {
		if (!p(A)) return;
		let e = C(), t = w();
		r(() => ee(e, t));
	});
	var $ = {
		get entityId() {
			return C();
		},
		set entityId(t) {
			C(t), e();
		},
		get recordId() {
			return w();
		},
		set recordId(t) {
			w(t), e();
		}
	}, re = s(), ie = O(re), ae = (e) => {
		let r = b(() => k.current.t);
		var o = Qt(), c = O(o), l = (e) => {
			var n = Vt(), r = a(n), o = i(r, !0), s = g(r, 2), c = i(s, !0);
			y(n), f((e) => {
				t(o, p(N).title ?? p(j).run.step_label), t(c, e);
			}, [() => [p(j).run.workflow_name, p(j).instance_name].filter(Boolean).join(" · ")]), S(e, n);
		};
		d(c, (e) => {
			p(j) && !p(F) && e(l);
		});
		var m = g(c, 2), h = (e) => {
			var n = Ut(), i = a(n), o = g(i), s = (e) => {
				var n = Ht(), r = g(O(n), 1, !0);
				f(() => t(r, p(B).detail)), S(e, n);
			};
			d(o, (e) => {
				p(B).status === 422 && !p(B).fieldErrors?.length && p(B).detail && e(s);
			});
			var c = g(o, 2), l = (e) => {
				var n = Ht(), i = g(O(n), 1, !0);
				f((e) => t(i, e), [() => p(r)("common.request_id", { id: p(B).requestId })]), S(e, n);
			};
			d(c, (e) => {
				p(B).requestId && e(l);
			}), y(n), f((e) => t(i, `${e ?? ""} `), [() => p(r)("common.error", { code: p(B).code })]), S(e, n);
		};
		d(m, (e) => {
			p(B) && e(h);
		});
		var v = g(m, 2), x = (e) => {
			var n = Wt(), a = i(n, !0);
			f((e) => t(a, e), [() => p(r)("common.loading")]), S(e, n);
		};
		d(v, (e) => {
			p(H) && e(x);
		});
		var C = g(v, 2), w = (e) => {
			var n = Gt(), a = i(n, !0);
			f((e) => t(a, e), [() => p(r)("task.withheld")]), S(e, n);
		}, T = (e) => {
			let o = (e) => {
				var n = Kt(), a = i(n, !0);
				f((e) => {
					n.disabled = p(V), t(a, e);
				}, [() => p(r)("task.release")]), u("click", n, () => te("release")), S(e, n);
			};
			var c = s(), l = O(c), m = (e) => {
				var n = Gt(), a = i(n, !0);
				f((e) => t(a, e), [() => p(j).step_status === "cancelled" ? p(r)("task.cancelled") : p(r)("task.done")]), S(e, n);
			}, h = (e) => {
				var n = Gt(), a = i(n, !0);
				f((e) => t(a, e), [() => p(r)("task.signed_waiting")]), S(e, n);
			}, v = (e) => {
				var n = qt(), o = a(n), s = i(o, !0);
				y(n), f((e) => {
					o.disabled = p(V), t(s, e);
				}, [() => p(r)("task.claim")]), u("click", o, () => te("claim")), S(e, n);
			}, b = (e) => {
				var n = Jt(), s = O(n), c = i(s, !0), l = g(s, 2), u = a(l);
				o(u), y(l), f((e) => t(c, e), [() => p(r)("task.sign_elsewhere")]), S(e, n);
			}, x = (e) => {
				var n = Jt(), s = O(n), c = i(s, !0), l = g(s, 2), u = a(l);
				o(u), y(l), f((e) => t(c, e), [() => p(r)("task.select_elsewhere")]), S(e, n);
			}, C = (e) => {
				var c = Zt(), l = a(c);
				Ge(l, {
					get fields() {
						return p(I);
					},
					get errors() {
						return p(z);
					},
					get disabled() {
						return p(V);
					},
					get t() {
						return p(r);
					},
					get values() {
						return p(R);
					},
					set values(e) {
						_(R, e, !0);
					}
				});
				var m = g(l, 2), h = (e) => {
					var n = Yt(), a = i(n, !0);
					f((e) => t(a, e), [() => p(r)("form.unsupported_required")]), S(e, n);
				};
				d(m, (e) => {
					p(K).length > 0 && e(h);
				});
				var v = g(m, 2), b = (e) => {
					var n = Gt(), a = i(n, !0);
					f((e) => t(a, e), [() => p(r)("task.no_actions")]), S(e, n);
				};
				d(v, (e) => {
					p(j).actions_gated_out && e(b);
				});
				var x = g(v, 2), C = (e) => {
					var n = Gt(), a = i(n, !0);
					f((e) => t(a, e), [() => p(r)("task.sign_elsewhere")]), S(e, n);
				};
				d(x, (e) => {
					p(q) && e(C);
				});
				var w = g(x, 2), T = a(w);
				o(T);
				var E = g(T, 2), D = (e) => {
					var r = s(), a = O(r);
					n(a, 17, () => p(J), (e) => e.id, (e, n) => {
						var r = Xt(), a = i(r, !0);
						f(() => {
							r.disabled = p(V) || p(K).length > 0, t(a, p(n).label);
						}), u("click", r, () => ne(p(n).id)), S(e, r);
					}), S(e, r);
				}, k = (e) => {
					var n = Xt(), a = i(n, !0);
					f((e) => {
						n.disabled = p(V) || p(K).length > 0, t(a, e);
					}, [() => p(r)("task.submit")]), u("click", n, () => ne(null)), S(e, n);
				};
				d(E, (e) => {
					p(j).actions.length > 0 ? e(D) : p(j).actions_gated_out || e(k, 1);
				}), y(w), y(c), P("submit", c, (e) => e.preventDefault()), S(e, c);
			}, w = (e) => {
				var n = Gt(), a = i(n, !0);
				f((e) => t(a, e), [() => p(N).name ? p(r)("task.claimed_by", { name: p(N).name }) : p(r)("task.claimed_by_someone")]), S(e, n);
			};
			d(l, (e) => {
				p(W) ? e(m) : p(G) ? e(h, 1) : p(N).id ? p(U) && (p(j).kind === "signature" || p(j).signs && !p(q)) ? e(b, 3) : p(U) && p(Y) ? e(x, 4) : p(U) ? e(C, 5) : e(w, -1) : e(v, 2);
			}), S(e, c);
		};
		d(C, (e) => {
			p(F) ? e(w) : p(j) && e(T, 1);
		}), S(e, o);
	};
	return d(ie, (e) => {
		k.current && p(A) && e(ae);
	}), S(o, re), x($);
}
o(["click"]), A(en, {
	entityId: {
		attribute: "entity-id",
		type: "String"
	},
	recordId: {
		attribute: "record-id",
		type: "String"
	}
}, [], [], { mode: "open" });
//#endregion
//#region src/elements/TaskInbox.svelte
var tn = c("<br/> ", 1), nn = c("<p part=\"error\" class=\"error svelte-j92hy\" role=\"alert\"> <!></p>"), rn = c("<p part=\"empty\" class=\"muted svelte-j92hy\"> </p>"), an = c("<tr part=\"row\" tabindex=\"0\" class=\"svelte-j92hy\"><td class=\"svelte-j92hy\"> </td><td class=\"svelte-j92hy\"> </td><td class=\"svelte-j92hy\"> </td><td class=\"svelte-j92hy\"> </td></tr>"), on = c("<table part=\"table\" class=\"svelte-j92hy\"><thead><tr><th class=\"svelte-j92hy\"> </th><th class=\"svelte-j92hy\"> </th><th class=\"svelte-j92hy\"> </th><th class=\"svelte-j92hy\"> </th></tr></thead><tbody></tbody></table>"), sn = c("<p class=\"muted svelte-j92hy\"> </p>"), cn = c("<button part=\"load-more\" type=\"button\" class=\"svelte-j92hy\"> </button>"), ln = c("<!> <!> <!> <!>", 1), un = {
	hash: "svelte-j92hy",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}table.svelte-j92hy {width:100%;border-collapse:collapse;}th.svelte-j92hy, td.svelte-j92hy {text-align:start;padding:8px;border-block-end:1px solid var(--agentflow-border, #eaecf0);}tr[part='row'].svelte-j92hy {cursor:pointer;}tr[part='row'].svelte-j92hy:hover, tr[part='row'].svelte-j92hy:focus {background:color-mix(in srgb, var(--agentflow-accent, #1570ef) 8%, transparent);}.muted.svelte-j92hy {color:var(--agentflow-muted, #667085);}.error.svelte-j92hy {color:var(--agentflow-danger, #b42318);}button.svelte-j92hy {font:inherit;margin-block-start:var(--agentflow-gap, 12px);padding:6px 12px;cursor:pointer;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);background:transparent;}"
};
function dn(o, c) {
	v(c, !0), M(o, un);
	let C = T(c, "view", 7), w = T(c, "pageSize", 7), E = b(() => C() === "mine" || C() === "claimable" ? C() : "all"), D = b(() => Me(w())), k = c.$$host, A = dt(k), j = b(() => A.current?.state === "ready"), N = l(h([])), P = l(null), F = l(!1), I = l(!1), R = l(null), z = 0;
	async function B(e) {
		let t = A.current;
		if (!t) return;
		let n = ++z;
		_(I, !0), _(R, null), e || _(P, null);
		try {
			let r = {
				view: p(E),
				live: !0,
				limit: p(D)
			};
			e && (r.cursor = e);
			let i = await L(t.client.GET("/work", { params: { query: r } }));
			if (n !== z) return;
			let a = i.items.filter((e) => e.step);
			_(N, e ? [...p(N), ...a] : a, !0), _(P, i.next_cursor, !0), _(F, !0);
		} catch (r) {
			let i = t.report(r);
			n === z && (_(R, i, !0), e || _(N, [], !0));
		} finally {
			n === z && _(I, !1);
		}
	}
	m(() => {
		p(j) && (p(E), p(D), r(() => B()));
	});
	let V = (e) => k.dispatchEvent(new CustomEvent("task-select", {
		detail: {
			recordId: e.id,
			entityId: e.entity_id
		},
		bubbles: !0,
		composed: !0
	}));
	var H = {
		get view() {
			return C();
		},
		set view(t) {
			C(t), e();
		},
		get pageSize() {
			return w();
		},
		set pageSize(t) {
			w(t), e();
		}
	}, U = s(), W = O(U), G = (e) => {
		let r = b(() => A.current.t);
		var o = ln(), s = O(o), c = (e) => {
			var n = nn(), i = a(n), o = g(i), s = (e) => {
				var n = tn(), i = g(O(n), 1, !0);
				f((e) => t(i, e), [() => p(r)("common.request_id", { id: p(R).requestId })]), S(e, n);
			};
			d(o, (e) => {
				p(R).requestId && e(s);
			}), y(n), f((e) => t(i, `${e ?? ""} `), [() => p(r)("common.error", { code: p(R).code })]), S(e, n);
		};
		d(s, (e) => {
			p(R) && e(c);
		});
		var l = g(s, 2), m = (e) => {
			var n = rn(), a = i(n, !0);
			f((e) => t(a, e), [() => p(r)("inbox.empty")]), S(e, n);
		}, h = (e) => {
			var o = on(), s = a(o), c = a(s), l = a(c), d = i(l, !0), m = g(l), h = i(m, !0), _ = g(m), v = i(_, !0), b = g(_), x = i(b, !0);
			y(c), y(s);
			var C = g(s);
			n(C, 21, () => p(N), (e) => e.id, (e, n) => {
				var o = an(), s = a(o), c = i(s, !0), l = g(s), d = i(l, !0), m = g(l), h = i(m, !0), _ = g(m), v = i(_, !0);
				y(o), f((e, r) => {
					t(c, p(n).step?.step.label || p(n).step?.step.key), t(d, p(n).step?.workflow.name ?? ""), t(h, e), t(v, r);
				}, [() => p(r)(p(n).claimed_by_user_id ? "status.claimed" : "status.open"), () => Je(p(n).due_at, A.current.locale)]), u("click", o, () => V(p(n))), u("keydown", o, (e) => e.key === "Enter" && V(p(n))), S(e, o);
			}), y(C), y(o), f((e, n, r, i) => {
				t(d, e), t(h, n), t(v, r), t(x, i);
			}, [
				() => p(r)("inbox.column.task"),
				() => p(r)("inbox.column.workflow"),
				() => p(r)("inbox.column.status"),
				() => p(r)("inbox.column.due")
			]), S(e, o);
		};
		d(l, (e) => {
			p(F) && !p(I) && p(N).length === 0 && !p(R) && !p(P) ? e(m) : p(N).length > 0 && e(h, 1);
		});
		var _ = g(l, 2), v = (e) => {
			var n = sn(), a = i(n, !0);
			f((e) => t(a, e), [() => p(r)("common.loading")]), S(e, n);
		};
		d(_, (e) => {
			p(I) && e(v);
		});
		var x = g(_, 2), C = (e) => {
			var n = cn(), a = i(n, !0);
			f((e) => t(a, e), [() => p(r)("common.load_more")]), u("click", n, () => B(p(P) ?? void 0)), S(e, n);
		};
		d(x, (e) => {
			p(P) && !p(I) && e(C);
		}), S(e, o);
	};
	return d(W, (e) => {
		A.current && p(j) && e(G);
	}), S(o, U), x(H);
}
o(["click", "keydown"]), A(dn, {
	view: {
		attribute: "view",
		type: "String"
	},
	pageSize: {
		attribute: "page-size",
		type: "Number"
	}
}, [], [], { mode: "open" });
//#endregion
//#region src/session.ts
function fn(e, t) {
	let n = pe(t), r = e ?? `${location.pathname}${location.search}${location.hash}`;
	location.assign(`${n}/auth/login?returnTo=${encodeURIComponent(r)}`);
}
function pn(e) {
	let t = document.createElement("form");
	t.method = "post", t.action = `${pe(e)}/auth/logout`, t.dataset.agentflowSignOut = "", t.hidden = !0, document.body.append(t), t.submit();
}
//#endregion
//#region src/index.ts
var mn = {
	"agentflow-provider": Pe,
	"agentflow-task-inbox": dn,
	"agentflow-task-detail": en,
	"agentflow-record-table": Ot,
	"agentflow-start-form": Bt
};
function hn(e = customElements) {
	for (let [t, n] of Object.entries(mn)) e.get(t) || e.define(t, n.element);
}
hn();
//#endregion
export { hn as defineAgentFlowElements, fn as signIn, pn as signOut };
