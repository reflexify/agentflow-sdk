import { $ as e, A as t, C as n, H as r, I as i, J as a, K as o, L as s, M as c, N as l, Q as u, R as d, T as f, U as p, V as m, W as h, X as g, Y as _, Z as v, at as y, ct as b, et as x, it as S, j as C, l as w, m as T, n as E, o as D, p as O, q as k, s as A, t as j, u as M, v as N, x as P, z as ee } from "./chunks/client-ChLD-Y6I.js";
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
		let ee = P.headers.get("Content-Length");
		if (P.status === 204 || N.method === "HEAD" || ee === "0" && !P.headers.get("Transfer-Encoding")?.includes("chunked")) return P.ok ? {
			data: void 0,
			response: P
		} : {
			error: void 0,
			response: P
		};
		if (P.ok) return {
			data: await (async () => {
				if (_ === "stream") return P.body;
				if (_ === "json" && !ee) {
					let e = await P.text();
					return e ? JSON.parse(e) : void 0;
				}
				return await P[_]();
			})(),
			response: P
		};
		let F = await P.text();
		try {
			F = JSON.parse(F);
		} catch {}
		return {
			error: F,
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
//#region ../agentflow-sdk/dist/app/revision.js
var te = class {
	#e = /* @__PURE__ */ new Set();
	observe(e) {
		if (e === null) return;
		let t = Number(e.trim());
		if (!(!Number.isSafeInteger(t) || t < 0)) for (let e of this.#e) e(t);
	}
	listen(e) {
		return this.#e.add(e), () => this.#e.delete(e);
	}
}, ne = /* @__PURE__ */ new WeakMap(), Z = (e, t) => ne.set(e, t), re = (e) => ne.get(e), ie = [
	{
		method: "POST",
		path: "/app-catalog/submissions",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/app-catalog/submissions/{submission_id}",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/app-catalog/withdrawals",
		idempotent: !1
	},
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
		path: "/app-installations/{installation_id}/arm",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/app-installations/{installation_id}/objects",
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
		method: "GET",
		path: "/entities/{entity_id}/records/{record_id}/comments",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/{record_id}/comments",
		idempotent: !0
	},
	{
		method: "DELETE",
		path: "/entities/{entity_id}/records/{record_id}/comments/{comment_id}",
		idempotent: !1
	},
	{
		method: "PATCH",
		path: "/entities/{entity_id}/records/{record_id}/comments/{comment_id}",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/{record_id}/list-ops",
		idempotent: !0
	},
	{
		method: "GET",
		path: "/entities/{entity_id}/records/{record_id}/mentioned-in",
		idempotent: !1
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
		path: "/mentions",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/mentions/people",
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
		path: "/sandboxes",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/sandboxes",
		idempotent: !1
	},
	{
		method: "DELETE",
		path: "/sandboxes/{sandbox_id}",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/sandboxes/{sandbox_id}",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/sandboxes/{sandbox_id}/sign-in-links",
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
], ae = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}", oe = ie.map((e) => ({
	op: e,
	re: RegExp("^" + e.path.replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace(/\{[^}]+\}/g, ae) + "$")
}));
function Q(e, t) {
	let n = e.toUpperCase();
	return oe.find((e) => e.op.method === n && e.re.test(t))?.op;
}
//#endregion
//#region ../agentflow-sdk/dist/fetch.js
var $ = /* @__PURE__ */ new Set([429, 503]), se = /* @__PURE__ */ new Set([
	"GET",
	"HEAD",
	"OPTIONS"
]), ce = 1e3, le = 30;
function ue(e) {
	let t = e.headers.get("retry-after")?.trim();
	if (!t) return ce;
	let n = Number(t);
	return Number.isFinite(n) && n >= 0 ? Math.min(n, le) * 1e3 : ce;
}
function de(e) {
	let t = new URL(e.baseUrl), n = e.fetch;
	return async (r) => {
		let i = new URL(r.url).pathname.slice(t.pathname.replace(/\/$/, "").length), a = Q(r.method, i), o = new Headers(r.headers);
		for (let [t, n] of Object.entries(await e.auth.headers())) o.set(t, n);
		a?.idempotent && !o.has("idempotency-key") && o.set("idempotency-key", crypto.randomUUID());
		let s = new Request(r, {
			headers: o,
			credentials: e.auth.credentials
		}), c = se.has(s.method) || o.has("idempotency-key");
		for (let t = 0;; t++) {
			let r = await n(s.clone());
			if (!($.has(r.status) || r.status === 409 && (await r.clone().json().catch(() => ({})))?.type === "IDEMPOTENCY_KEY_IN_PROGRESS") || !c || t >= e.maxRetries) return e.onRevision?.(r.headers.get("agentflow-app-revision")), r;
			await new Promise((e) => setTimeout(e, ue(r)));
		}
	};
}
//#endregion
//#region ../agentflow-sdk/dist/client.js
function fe(e) {
	let t = new te(), n = V({
		baseUrl: e.baseUrl,
		fetch: de({
			baseUrl: e.baseUrl,
			auth: e.auth,
			fetch: e.fetch ?? globalThis.fetch,
			maxRetries: e.maxRetries ?? 3,
			onRevision: (e) => t.observe(e)
		})
	});
	return Z(n, t), n;
}
//#endregion
//#region ../agentflow-sdk/dist/app/version.js
var pe = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/;
function me(e) {
	let t = typeof e == "string" ? pe.exec(e) : null, n = t ? [
		Number(t[1]),
		Number(t[2]),
		Number(t[3])
	] : [];
	if (!t || !n.every(Number.isSafeInteger)) throw TypeError(`not a version: ${e}`);
	return {
		core: n,
		pre: t[4] ? t[4].split(".") : []
	};
}
var he = /^\d+$/;
function ge(e, t) {
	let n = he.test(e), r = he.test(t);
	return n && r ? Math.sign(Number(e) - Number(t)) : n ? -1 : r ? 1 : e < t ? -1 : +(e > t);
}
function _e(e, t) {
	let n = me(e), r = me(t);
	for (let e = 0; e < 3; e++) if (n.core[e] !== r.core[e]) return n.core[e] < r.core[e] ? -1 : 1;
	if (n.pre.length === 0 || r.pre.length === 0) return Math.sign(r.pre.length - n.pre.length);
	for (let e = 0; e < Math.min(n.pre.length, r.pre.length); e++) {
		let t = ge(n.pre[e], r.pre[e]);
		if (t !== 0) return t;
	}
	return Math.sign(n.pre.length - r.pre.length);
}
//#endregion
//#region ../agentflow-sdk/dist/app/objects.js
var ve = 3e4, ye = [
	"own",
	"bound",
	"exported"
], be = /* @__PURE__ */ new WeakMap();
function xe(e, t = {}) {
	let n = be.get(e);
	return n || (n = Se(e, t.recheckAfterMs ?? ve), be.set(e, n)), n;
}
function Se(e, t) {
	let n = null, r = !1, i = null, a = -1, o = 0, s = /* @__PURE__ */ new Set(), c = (e) => void e.catch(() => {});
	function l(t = !1) {
		if (i) return i;
		let u = (async () => {
			await Promise.resolve();
			try {
				let t = await L(e.GET("/app/objects"));
				o = Date.now();
				let i = null;
				if (t.revision >= (n?.revision ?? -1) && (t.revision !== n?.revision && (i = t), n = t), r = a > (n?.revision ?? -1), i) for (let e of [...s]) try {
					e(i);
				} catch (e) {
					console.error("getAppObjects: a subscriber threw", e);
				}
				return n ?? t;
			} finally {
				i = null, !t && r && s.size > 0 && c(l(!0));
			}
		})();
		return i = u, u;
	}
	re(e)?.listen((e) => {
		a = Math.max(a, e), n && e > n.revision && (r = !0, s.size > 0 && c(l()));
	});
	let u = () => {
		globalThis.document?.visibilityState === "visible" && Date.now() - o >= t && c(l());
	};
	function d(e, t) {
		if (!n) throw Error("getAppObjects: call load() first");
		let r = n.objects.filter((t) => t.logical_key === e);
		if (t?.source) return r.find((e) => e.source === t.source) ?? null;
		for (let e of ye) {
			let t = r.find((t) => t.source === e);
			if (t) return t;
		}
		return null;
	}
	return {
		get current() {
			return n;
		},
		load: () => n && !r ? Promise.resolve(n) : l(),
		async refresh() {
			return i && await i.catch(() => {}), l();
		},
		find: d,
		id(e, t) {
			let n = d(e, t);
			return n && n.state !== "off" ? n.id : null;
		},
		satisfies(e, t, n) {
			_e(t, t);
			let r = d(e, n);
			if (!r || r.state === "off" || r.contract_version == null) return !1;
			try {
				return _e(r.contract_version, t) >= 0;
			} catch {
				return !1;
			}
		},
		subscribe(e) {
			return s.add(e), s.size === 1 && t > 0 && globalThis.document?.addEventListener("visibilitychange", u), () => {
				s.delete(e), s.size === 0 && globalThis.document?.removeEventListener("visibilitychange", u);
			};
		}
	};
}
//#endregion
//#region ../agentflow-sdk/dist/paginate.js
async function* Ce(e) {
	let t = /* @__PURE__ */ new Set(), n;
	do {
		let r = await e(n);
		if (yield* r.items, n = r.next_cursor ?? void 0, n !== void 0 && t.has(n)) break;
		n !== void 0 && t.add(n);
	} while (n);
}
//#endregion
//#region ../agentflow-sdk/dist/modules/tokens.js
var we = {
	"--af-warning": "oklch(0.666 0.179 58.318)",
	"--af-success": "oklch(0.596 0.145 163.225)",
	"--af-radius": "0.625rem",
	"--af-font-sans": "ui-sans-serif, system-ui, sans-serif",
	"--af-font-mono": "ui-monospace, SFMono-Regular, Menlo, monospace"
};
({ ...we }), { ...we };
//#endregion
//#region src/base-path.ts
var Te = "/agentflow", Ee = /^\/(?!\/)/;
function De(e) {
	try {
		return new URL(e, location.origin).origin === location.origin;
	} catch {
		return !1;
	}
}
function Oe(e) {
	return e == null ? Te : Ee.test(e) && De(e) ? e.replace(/\/+$/, "") : (console.warn(`agentflow: base-path ${JSON.stringify(e)} is not a path on this origin; using ${Te}.`), Te);
}
//#endregion
//#region src/context.ts
var ke = "context-request", Ae = "agentflow-provider-ready", je = "agentflow";
function Me(e) {
	let t = e;
	return t.context === je && typeof t.callback == "function";
}
function Ne(e, t) {
	let n, r = () => {
		let r = Object.assign(new Event(ke, {
			bubbles: !0,
			composed: !0
		}), {
			context: je,
			subscribe: !0,
			callback: (e, r) => {
				n = r, t(e);
			}
		});
		e.dispatchEvent(r);
	}, i = () => {
		n || r();
	};
	return window.addEventListener(Ae, i), r(), () => {
		window.removeEventListener(Ae, i), n?.();
	};
}
function Pe(e) {
	typeof reportError == "function" ? reportError(e) : console.error(e);
}
function Fe(e, t, n) {
	try {
		e(t, n);
	} catch (e) {
		Pe(e);
	}
}
function Ie(e, t) {
	let n = t, r = /* @__PURE__ */ new Set(), i = (e) => {
		if (!Me(e)) return;
		e.stopPropagation();
		let t = e.callback;
		e.subscribe && r.add(t), Fe(t, n, () => r.delete(t));
	};
	return e.addEventListener(ke, i), window.dispatchEvent(new Event(Ae)), {
		set(e) {
			n = e;
			for (let e of [...r]) Fe(e, n, () => r.delete(e));
		},
		dispose() {
			e.removeEventListener(ke, i), r.clear();
		}
	};
}
//#endregion
//#region src/errors.ts
var Le = "APP_KEY_MISSING", Re = /* @__PURE__ */ new Set([
	"APP_NOT_ASSIGNED",
	"APP_NOT_INSTALLED",
	"USER_NOT_PROJECTED"
]);
function ze(e) {
	let t = e;
	return typeof t == "object" && !!t && typeof t.status == "number" && typeof t.code == "string";
}
var Be = (e) => typeof e == "object" && !!e && typeof e.path == "string" && typeof e.message == "string";
function Ve(e) {
	if (ze(e)) {
		if (e.status === 401) return { type: "signed-out" };
		if (e.status === 403 && Re.has(e.code)) return {
			type: "access-lost",
			code: e.code
		};
		let t = {
			code: e.code,
			status: e.status
		};
		return typeof e.detail == "string" && (t.detail = e.detail), typeof e.requestId == "string" && (t.requestId = e.requestId), Array.isArray(e.fieldErrors) && (t.fieldErrors = e.fieldErrors.filter(Be).map(({ path: e, message: t }) => ({
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
var He = {
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
		notInstalled: "This app has no {key}.",
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
		notInstalled: "Ứng dụng này không có {key}.",
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
function Ue(e, t) {
	return e === "en" || e === "vi" ? e : t?.toLowerCase().startsWith("vi") ? "vi" : "en";
}
function We(e, t) {
	return (n, r) => (t[n] ?? He[e][n] ?? n).replace(/\{(\w+)\}/g, (e, t) => r && t in r ? String(r[t]) : e);
}
//#endregion
//#region src/props.ts
var Ge = /* @__PURE__ */ new Set();
function Ke(e, t) {
	typeof t == "string" && !Ge.has(e) && (Ge.add(e), console.warn(`agentflow: \`${e}\` is a property, not an attribute; set it from JavaScript.`));
}
function qe(e, t) {
	if (typeof e == "object" && e && !Array.isArray(e)) return e;
	Ke(t, e);
}
function Je(e) {
	let t = e == null ? NaN : Math.trunc(Number(e));
	return Number.isNaN(t) ? 25 : Math.min(200, Math.max(1, t));
}
function Ye(e, t) {
	if (typeof e == "function") return e;
	Ke(t, e);
}
//#endregion
//#region src/elements/Provider.svelte
function Xe(t, n) {
	y(n, !0);
	let i = E(n, "basePath", 7, Te), a = E(n, "locale", 7, void 0), o = E(n, "strings", 23, () => ({})), s = E(n, "fetchImpl", 7, void 0), l = n.$$host, d = u("loading"), f = u(null), p = r(() => fe({
		baseUrl: `${location.origin}${Oe(i())}/api`,
		auth: F(),
		fetch: Ye(s(), "fetchImpl") ?? globalThis.fetch.bind(globalThis)
	})), g = !1, _ = (e, t) => {
		g || l.dispatchEvent(new CustomEvent(e, {
			detail: t,
			bubbles: !0,
			composed: !0
		}));
	};
	function b(e) {
		g || (v(d, e, !0), l.dataset.state = e);
	}
	l.dataset.state = "loading";
	function w(e, t) {
		let n = Ve(e);
		return n.type === "signed-out" ? (m(d) !== "signed-out" && (b("signed-out"), _("signed-out", {})), null) : n.type === "access-lost" ? (m(d) !== "access-lost" && (b("access-lost"), _("access-lost", { code: n.code })), null) : (t && b("error"), _("request-failed", {
			code: n.problem.code,
			status: n.problem.status,
			detail: n.problem.detail,
			requestId: n.problem.requestId
		}), n.problem);
	}
	function T(e) {
		let t = e;
		return t?.name === "AppKeyMissing" && typeof t.kind == "string" && typeof t.key == "string" ? {
			code: Le,
			status: 0,
			detail: m(O).t("notInstalled", { key: `${t.kind}:${t.key}` })
		} : w(e, !1);
	}
	let D = x(() => Ue(a(), typeof navigator > "u" ? void 0 : navigator.language)), O = x(() => ({
		state: m(d),
		caller: m(f),
		client: p,
		locale: m(D),
		t: We(m(D), qe(o(), "strings") ?? {}),
		report: T
	})), A = Ie(l, r(() => m(O)));
	h(() => A.set(m(O))), h(() => () => {
		g = !0, A.dispose();
	}), (async () => {
		try {
			let e = await L(p.GET("/caller"));
			v(f, e, !0), b("ready"), _("session-ready", { caller: e });
		} catch (e) {
			w(e, !0);
		}
	})();
	var j = {
		get basePath() {
			return i();
		},
		set basePath(t = Te) {
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
			return s();
		},
		set fetchImpl(t = void 0) {
			s(t), e();
		}
	}, M = c(), N = k(M);
	return P(N, n, "default", {}, null), C(t, M), S(j);
}
j(Xe, {
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
var Ze = l("<span class=\"req svelte-olgbsr\">*</span>"), Qe = l("<input part=\"input\" type=\"checkbox\" class=\"svelte-olgbsr\"/>"), $e = l("<option> </option>"), et = l("<select part=\"input\" class=\"svelte-olgbsr\"><option>—</option><!></select>"), tt = l("<p part=\"notice\" class=\"muted svelte-olgbsr\"> </p>"), nt = l("<input part=\"input\" class=\"svelte-olgbsr\"/>"), rt = l("<p class=\"muted svelte-olgbsr\"> </p>"), it = l("<p part=\"field-error\" class=\"error svelte-olgbsr\" role=\"alert\"> </p>"), at = l("<div part=\"field\" class=\"field svelte-olgbsr\"><label part=\"label\" class=\"svelte-olgbsr\"> <!></label> <!> <!> <!></div>"), ot = {
	hash: "svelte-olgbsr",
	code: ".field.svelte-olgbsr {display:grid;gap:4px;margin-block-end:var(--agentflow-gap, 12px);}label.svelte-olgbsr {font-weight:600;}.req.svelte-olgbsr {color:var(--agentflow-danger, #b42318);}.muted.svelte-olgbsr {color:var(--agentflow-muted, #667085);margin:0;font-size:0.9em;}.error.svelte-olgbsr {color:var(--agentflow-danger, #b42318);margin:0;}input.svelte-olgbsr, select.svelte-olgbsr {font:inherit;padding:6px 8px;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);}"
};
function st(r, i) {
	y(i, !0), N(r, ot);
	let s = E(i, "fields", 7), l = E(i, "values", 31, () => g({})), u = E(i, "errors", 23, () => ({})), d = E(i, "disabled", 7, !1), h = E(i, "t", 7), v = {
		text: "text",
		email: "email",
		date: "date",
		datetime: "datetime-local",
		number: "number",
		integer: "number"
	};
	var x = {
		get fields() {
			return s();
		},
		set fields(t) {
			s(t), e();
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
			return d();
		},
		set disabled(t = !1) {
			d(t), e();
		},
		get t() {
			return h();
		},
		set t(t) {
			h(t), e();
		}
	}, j = c(), P = k(j);
	return n(P, 17, s, (e) => e.key, (e, r) => {
		var i = at(), s = o(i), c = o(s, !0), g = _(c), y = (e) => {
			var t = Ze();
			p((e) => M(t, "title", e), [() => h()("form.required")]), C(e, t);
		};
		f(g, (e) => {
			m(r).required && e(y);
		}), b(s);
		var x = _(s, 2), S = (e) => {
			var t = Qe();
			w(t), p(() => {
				M(t, "id", `f-${m(r).key}`), t.disabled = d();
			}), D(t, () => l()[m(r).key], (e) => l(l()[m(r).key] = e, !0)), C(e, t);
		}, E = (e) => {
			var i = et(), s = o(i);
			s.value = s.__value = "";
			var c = _(s);
			n(c, 17, () => m(r).options ?? [], (e) => e.value, (e, n) => {
				var r = $e(), i = a(r, !0), o = {};
				p(() => {
					t(i, m(n).label), o !== (o = m(n).value) && (r.value = (r.__value = o) ?? "");
				}), C(e, r);
			}), b(i), T(i), p(() => {
				M(i, "id", `f-${m(r).key}`), i.disabled = d();
			}), O(i, () => l()[m(r).key], (e) => l(l()[m(r).key] = e, !0)), C(e, i);
		}, k = (e) => {
			var n = tt(), r = a(n, !0);
			p((e) => t(r, e), [() => h()("form.unsupported")]), C(e, n);
		}, j = (e) => {
			var t = nt();
			w(t), p(() => {
				M(t, "id", `f-${m(r).key}`), M(t, "type", v[m(r).kind]), M(t, "step", m(r).kind === "integer" ? "1" : m(r).kind === "number" ? "any" : void 0), t.disabled = d();
			}), A(t, () => l()[m(r).key], (e) => l(l()[m(r).key] = e, !0)), C(e, t);
		};
		f(x, (e) => {
			m(r).kind === "boolean" ? e(S) : m(r).kind === "choice" ? e(E, 1) : m(r).kind === "unsupported" ? e(k, 2) : e(j, -1);
		});
		var N = _(x, 2), P = (e) => {
			var n = rt(), i = a(n, !0);
			p(() => t(i, m(r).description)), C(e, n);
		};
		f(N, (e) => {
			m(r).description && e(P);
		});
		var ee = _(N, 2), F = (e) => {
			var n = it(), i = a(n, !0);
			p(() => t(i, u()[m(r).key])), C(e, n);
		};
		f(ee, (e) => {
			u()[m(r).key] && e(F);
		}), b(i), p(() => {
			M(s, "for", `f-${m(r).key}`), t(c, m(r).label);
		}), C(e, i);
	}), C(r, j), S(x);
}
j(st, {
	fields: {},
	values: {},
	errors: {},
	disabled: {},
	t: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/app-keys.ts
var ct = class extends Error {
	kind;
	key;
	constructor(e, t) {
		super(`${e}:${t} is not installed`), this.kind = e, this.key = t, this.name = "AppKeyMissing";
	}
};
async function lt(e, t, n) {
	let r = xe(e);
	await r.load();
	let i = r.id(`${t}:${n}`);
	if (i === null) throw new ct(t, n);
	return i;
}
//#endregion
//#region src/format.ts
var ut = /^\d{4}-\d{2}-\d{2}$/, dt = /^\d{4}-\d{2}-\d{2}T/;
function ft(e, t) {
	if (!e) return "";
	if (ut.test(e)) {
		let [n, r, i] = e.split("-").map(Number), a = new Date(n, r - 1, i);
		return a.getFullYear() !== n || a.getMonth() !== r - 1 || a.getDate() !== i ? "" : new Intl.DateTimeFormat(t, { dateStyle: "medium" }).format(a);
	}
	let n = new Date(e);
	return Number.isNaN(n.getTime()) ? "" : new Intl.DateTimeFormat(t, {
		dateStyle: "medium",
		timeStyle: "short"
	}).format(n);
}
function pt(e, t, n) {
	if (e == null) return "";
	if (typeof e == "boolean") return n(e ? "common.yes" : "common.no");
	if (typeof e == "number") return new Intl.NumberFormat(t, { maximumSignificantDigits: 15 }).format(e);
	if (typeof e == "string") return (ut.test(e) || dt.test(e)) && ft(e, t) || e;
	if (Array.isArray(e)) return e.map((e) => pt(e, t, n)).join(", ");
	let r = JSON.stringify(e);
	return r.length > 80 ? `${r.slice(0, 79)}…` : r;
}
//#endregion
//#region src/form.ts
var mt = (e) => typeof e == "object" && !!e && !Array.isArray(e);
function ht(e) {
	let t = e.type;
	if (typeof t == "string") return t;
	if (Array.isArray(t)) return t.find((e) => e !== "null");
}
function gt(e) {
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
function _t(e) {
	if (Array.isArray(e.oneOf)) {
		let t = e.oneOf.filter((e) => !(mt(e) && e.const === null)), n = [];
		for (let e of t) {
			if (!mt(e) || typeof e.const != "string") return { kind: "unsupported" };
			n.push({
				value: e.const,
				label: typeof e.title == "string" ? e.title : e.const
			});
		}
		return n.length > 0 ? gt(n) : { kind: "unsupported" };
	}
	if (Array.isArray(e.enum)) {
		if (!e.enum.every((e) => typeof e == "string" || e === null)) return { kind: "unsupported" };
		let t = e.enum.filter((e) => typeof e == "string");
		return t.length > 0 ? gt(t.map((e) => ({
			value: e,
			label: e
		}))) : { kind: "unsupported" };
	}
	let t = ht(e);
	if (t === "string") switch (e.format) {
		case void 0: return { kind: "text" };
		case "date": return { kind: "date" };
		case "date-time": return { kind: "datetime" };
		case "email": return { kind: "email" };
		default: return { kind: "unsupported" };
	}
	return t === "number" ? { kind: "number" } : t === "integer" ? { kind: "integer" } : t === "boolean" ? { kind: "boolean" } : { kind: "unsupported" };
}
var vt = /^#\/properties\/([^/]+)$/;
function yt(e, t = []) {
	if (!mt(e)) return t;
	if (e.type === "Control" && typeof e.scope == "string") {
		let n = vt.exec(e.scope)?.[1];
		n !== void 0 && t.push(n);
	}
	if (Array.isArray(e.elements)) for (let n of e.elements) yt(n, t);
	return t;
}
function bt(e, t) {
	if (!mt(e) || !mt(e.properties)) return [];
	let n = e.properties, r = new Set(Array.isArray(e.required) ? e.required : []), i = (e) => typeof e == "string" && Object.hasOwn(n, e), a = Array.isArray(e["x-order"]) ? e["x-order"].filter(i) : [];
	return [.../* @__PURE__ */ new Set([
		...yt(t).filter(i),
		...a,
		...Object.keys(n)
	])].map((e) => {
		let t = mt(n[e]) ? n[e] : {}, i = {
			key: e,
			label: typeof t.title == "string" ? t.title : e,
			required: r.has(e),
			..._t(t)
		};
		return typeof t.description == "string" && (i.description = t.description), i;
	});
}
var xt = (e) => String(e).padStart(2, "0");
function St(e) {
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? "" : `${t.getFullYear()}-${xt(t.getMonth() + 1)}-${xt(t.getDate())}T${xt(t.getHours())}:${xt(t.getMinutes())}`;
}
function Ct(e, t) {
	let n = mt(t) ? t : {}, r = {};
	for (let t of e) {
		let e = n[t.key];
		t.kind === "boolean" ? r[t.key] = e === !0 : t.kind === "datetime" ? r[t.key] = typeof e == "string" ? St(e) : "" : t.kind === "unsupported" ? r[t.key] = e : r[t.key] = e ?? "";
	}
	return r;
}
var wt = (e) => e == null || e === "";
function Tt(e, t) {
	let n = {};
	for (let r of e) {
		let e = t[r.key];
		if (r.kind === "boolean") {
			n[r.key] = e === !0;
			continue;
		}
		wt(e) || (r.kind === "number" || r.kind === "integer" ? n[r.key] = Number(e) : r.kind === "datetime" ? n[r.key] = new Date(String(e)).toISOString() : n[r.key] = e);
	}
	return n;
}
function Et(e, t) {
	return e.filter((e) => e.required && e.kind !== "boolean" && e.kind !== "unsupported" && wt(t[e.key])).map((e) => e.key);
}
function Dt(e) {
	return e.filter((e) => e.required && e.kind === "unsupported");
}
function Ot(e) {
	let t = {};
	for (let n of e ?? []) {
		let e = n.path.replace(/^\//, "").split("/")[0] ?? "";
		t[e] ??= n.message;
	}
	return t;
}
//#endregion
//#region src/use-agentflow.svelte.ts
function kt(e) {
	let t = u(null);
	return h(() => Ne(e, (e) => v(t, e))), { get current() {
		return m(t);
	} };
}
//#endregion
//#region src/elements/RecordTable.svelte
var At = l("<form part=\"search\" role=\"search\"><input type=\"search\" class=\"svelte-1xcrvv6\"/></form>"), jt = l("<button part=\"create-button\" type=\"button\" class=\"svelte-1xcrvv6\"> </button>"), Mt = l("<div part=\"toolbar\" class=\"svelte-1xcrvv6\"><!> <!></div>"), Nt = l("<p part=\"notice\" class=\"error svelte-1xcrvv6\"> </p>"), Pt = l("<form part=\"form\"><!> <!> <div part=\"actions\" class=\"svelte-1xcrvv6\"><button part=\"button\" type=\"button\" class=\"secondary svelte-1xcrvv6\"> </button> <button part=\"button\" type=\"button\" class=\"svelte-1xcrvv6\"> </button></div></form>"), Ft = l("<br/> ", 1), It = l("<p part=\"error\" class=\"error svelte-1xcrvv6\" role=\"alert\"><!> <!></p>"), Lt = l("<p part=\"empty\" class=\"muted svelte-1xcrvv6\"> </p>"), Rt = l("<th class=\"svelte-1xcrvv6\"> </th>"), zt = l("<td part=\"cell\" class=\"svelte-1xcrvv6\"> </td>"), Bt = l("<tr part=\"row\" tabindex=\"0\" class=\"svelte-1xcrvv6\"></tr>"), Vt = l("<table part=\"table\" class=\"svelte-1xcrvv6\"><thead><tr></tr></thead><tbody></tbody></table>"), Ht = l("<p class=\"muted svelte-1xcrvv6\"> </p>"), Ut = l("<button part=\"load-more\" type=\"button\" class=\"svelte-1xcrvv6\"> </button>"), Wt = l("<!> <!> <!> <!> <!> <!>", 1), Gt = {
	hash: "svelte-1xcrvv6",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}[part='toolbar'].svelte-1xcrvv6 {display:flex;gap:8px;justify-content:space-between;margin-block-end:var(--agentflow-gap, 12px);}input[type='search'].svelte-1xcrvv6 {font:inherit;padding:6px 8px;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);}table.svelte-1xcrvv6 {width:100%;border-collapse:collapse;}th.svelte-1xcrvv6, td.svelte-1xcrvv6 {text-align:start;padding:8px;border-block-end:1px solid var(--agentflow-border, #eaecf0);}tr[part='row'].svelte-1xcrvv6 {cursor:pointer;}tr[part='row'].svelte-1xcrvv6:hover, tr[part='row'].svelte-1xcrvv6:focus {background:color-mix(in srgb, var(--agentflow-accent, #1570ef) 8%, transparent);}.muted.svelte-1xcrvv6 {color:var(--agentflow-muted, #667085);}.error.svelte-1xcrvv6 {color:var(--agentflow-danger, #b42318);}[part='actions'].svelte-1xcrvv6 {display:flex;gap:8px;}button.svelte-1xcrvv6 {font:inherit;padding:6px 14px;cursor:pointer;border-radius:var(--agentflow-radius, 6px);border:1px solid var(--agentflow-accent, #1570ef);background:var(--agentflow-accent, #1570ef);color:var(--agentflow-accent-text, #fff);}button.secondary.svelte-1xcrvv6, [part='load-more'].svelte-1xcrvv6 {background:transparent;color:var(--agentflow-accent, #1570ef);}button.svelte-1xcrvv6:disabled {opacity:0.5;cursor:default;}"
};
function Kt(s, l) {
	y(l, !0), N(s, Gt);
	let T = E(l, "entityId", 7), D = E(l, "entityKey", 7), O = E(l, "columns", 7), j = E(l, "pageSize", 7), P = E(l, "filter", 7), F = l.$$host, I = kt(F), R = x(() => I.current?.state === "ready"), z = u(null), B = x(() => T() || m(z)), V = x(() => qe(P(), "filter")), H = x(() => m(V) ? JSON.stringify(m(V)) : ""), U = x(() => Je(j())), W = u(null), G = u(g([])), K = u(null), q = u(""), J = u(!1), Y = u(!1), X = u(null), te = u(null), ne = u(!1), Z = u(!1), re = u(g({})), ie = u(g({})), ae = x(() => Dt(m(te) ?? [])), oe = x(() => {
		if (!m(W)) return [];
		let e = O()?.split(",").map((e) => e.trim()).filter(Boolean);
		return e?.length ? e.map((e) => m(W).fields.find((t) => t.key === e)).filter((e) => !!e) : m(W).fields.filter((e) => !e.system).slice(0, 5);
	}), Q = (e, t) => F.dispatchEvent(new CustomEvent(e, {
		detail: t,
		bubbles: !0,
		composed: !0
	})), $ = 0, se = 0;
	async function ce(e) {
		let t = I.current;
		if (!t) return;
		let n = $, r;
		try {
			r = await L(t.client.GET("/entities/{entity_id}", { params: { path: { entity_id: e } } }));
		} catch (e) {
			let r = t.report(e);
			n === $ && v(X, r, !0);
			return;
		}
		if (n === $ && (v(W, r, !0), r.effective_capabilities?.write)) try {
			let r = await L(t.client.GET("/entities/{entity_id}/create-form", { params: { path: { entity_id: e } } }));
			n === $ && v(te, bt(r.schema_json, r.ui_schema_json), !0);
		} catch (e) {
			let r = e?.status;
			if (r === 403 || r === 404) return;
			let i = t.report(e);
			n === $ && v(X, i, !0);
		}
	}
	async function le(e) {
		let t = I.current, n = m(B);
		if (!t || !n || !m(W)) return;
		let r = ++se;
		v(Y, !0), v(X, null), e || v(K, null);
		try {
			let i = { entity_id: n }, a = m(V) ? await L(t.client.POST("/entities/{entity_id}/records/query", {
				params: { path: i },
				body: {
					filter: m(V),
					limit: m(U),
					cursor: e
				}
			})) : await L(t.client.GET("/entities/{entity_id}/records", { params: {
				path: i,
				query: {
					limit: m(U),
					cursor: e,
					q: m(q) || void 0
				}
			} }));
			if (r !== se) return;
			v(G, e ? [...m(G), ...a.items] : a.items, !0), v(K, a.next_cursor, !0), v(J, !0);
		} catch (n) {
			let i = t.report(n);
			r === se && (v(X, i, !0), e || v(G, [], !0));
		} finally {
			r === se && v(Y, !1);
		}
	}
	function ue() {
		v(re, Ct(m(te) ?? [], {}), !0), v(ie, {}, !0), v(ne, !0);
	}
	async function de() {
		let e = I.current, t = m(B);
		if (!e || !t || !m(te) || m(Z) || m(ae).length > 0) return;
		let n = Et(m(te), m(re));
		if (n.length > 0) {
			v(ie, Object.fromEntries(n.map((t) => [t, e.t("form.required")])), !0);
			return;
		}
		let r = $;
		v(Z, !0), v(X, null), v(ie, {}, !0);
		let i;
		try {
			i = await L(e.client.POST("/entities/{entity_id}/records", {
				params: { path: { entity_id: t } },
				body: { form_payload: Tt(m(te), m(re)) }
			}));
		} catch (t) {
			let n = e.report(t);
			if (r !== $) return;
			v(Z, !1), v(ie, Ot(n?.fieldErrors), !0), v(X, n, !0);
			return;
		}
		Q("record-created", { recordId: i.id }), r === $ && (v(Z, !1), v(ne, !1), await le());
	}
	h(() => {
		T(), D(), v(z, null);
	}), h(() => {
		m(B), D(), $++, se++, v(W, null), v(te, null), v(q, ""), v(ne, !1), v(Z, !1), v(G, [], !0), v(K, null), v(J, !1), v(Y, !1), v(X, null);
	}), h(() => {
		if (!m(R) || T() || !D()) return;
		let e = D();
		r(async () => {
			let t = I.current;
			if (!t) return;
			let n = $;
			try {
				let r = await lt(t.client, "entity", e);
				n === $ && v(z, r, !0);
			} catch (e) {
				let r = t.report(e);
				n === $ && v(X, r, !0);
			}
		});
	}), h(() => {
		if (!m(R) || !m(B)) return;
		let e = m(B);
		r(() => ce(e));
	}), h(() => {
		m(R) && m(W) && (m(H), m(U), r(() => le()));
	});
	var fe = {
		get entityId() {
			return T();
		},
		set entityId(t) {
			T(t), e();
		},
		get entityKey() {
			return D();
		},
		set entityKey(t) {
			D(t), e();
		},
		get columns() {
			return O();
		},
		set columns(t) {
			O(t), e();
		},
		get pageSize() {
			return j();
		},
		set pageSize(t) {
			j(t), e();
		},
		get filter() {
			return P();
		},
		set filter(t) {
			P(t), e();
		}
	}, pe = c(), me = k(pe), he = (e) => {
		let r = x(() => I.current.t);
		var s = Wt(), c = k(s), l = (e) => {
			var n = Mt(), i = o(n), s = (e) => {
				var t = At(), n = o(t);
				w(n), b(t), p((e, t) => {
					M(n, "placeholder", e), M(n, "aria-label", t);
				}, [() => m(r)("records.search"), () => m(r)("records.search")]), ee("submit", t, (e) => {
					e.preventDefault(), le();
				}), A(n, () => m(q), (e) => v(q, e)), C(e, t);
			};
			f(i, (e) => {
				m(V) || e(s);
			});
			var c = _(i, 2), l = (e) => {
				var n = jt(), i = a(n, !0);
				p((e) => t(i, e), [() => m(r)("records.create")]), d("click", n, ue), C(e, n);
			};
			f(c, (e) => {
				m(te) && !m(ne) && e(l);
			}), b(n), C(e, n);
		};
		f(c, (e) => {
			m(W) && e(l);
		});
		var u = _(c, 2), h = (e) => {
			var n = Pt(), i = o(n);
			st(i, {
				get fields() {
					return m(te);
				},
				get errors() {
					return m(ie);
				},
				get disabled() {
					return m(Z);
				},
				get t() {
					return m(r);
				},
				get values() {
					return m(re);
				},
				set values(e) {
					v(re, e, !0);
				}
			});
			var s = _(i, 2), c = (e) => {
				var n = Nt(), i = a(n, !0);
				p((e) => t(i, e), [() => m(r)("form.unsupported_required")]), C(e, n);
			};
			f(s, (e) => {
				m(ae).length > 0 && e(c);
			});
			var l = _(s, 2), u = o(l), h = a(u, !0), g = _(u, 2), y = a(g, !0);
			b(l), b(n), p((e, n) => {
				t(h, e), g.disabled = m(Z) || m(ae).length > 0, t(y, n);
			}, [() => m(r)("common.cancel"), () => m(r)("records.save")]), ee("submit", n, (e) => e.preventDefault()), d("click", u, () => v(ne, !1)), d("click", g, de), C(e, n);
		};
		f(u, (e) => {
			m(ne) && m(te) && e(h);
		});
		var g = _(u, 2), y = (e) => {
			var n = It(), a = o(n), s = (e) => {
				var n = i();
				p(() => t(n, m(X).detail)), C(e, n);
			}, c = (e) => {
				var n = i();
				p((e) => t(n, e), [() => m(r)("common.error", { code: m(X).code })]), C(e, n);
			};
			f(a, (e) => {
				m(X).code === "APP_KEY_MISSING" ? e(s) : e(c, -1);
			});
			var l = _(a, 2), u = (e) => {
				var n = Ft(), i = _(k(n), 1, !0);
				p((e) => t(i, e), [() => m(r)("common.request_id", { id: m(X).requestId })]), C(e, n);
			};
			f(l, (e) => {
				m(X).requestId && e(u);
			}), b(n), C(e, n);
		};
		f(g, (e) => {
			m(X) && e(y);
		});
		var S = _(g, 2), T = (e) => {
			var n = Lt(), i = a(n, !0);
			p((e) => t(i, e), [() => m(r)("records.empty")]), C(e, n);
		}, E = (e) => {
			var i = Vt(), s = o(i), c = o(s);
			n(c, 21, () => m(oe), (e) => e.key, (e, n) => {
				var r = Rt(), i = a(r, !0);
				p(() => t(i, m(n).label)), C(e, r);
			}), b(c), b(s);
			var l = _(s);
			n(l, 21, () => m(G), (e) => e.id, (e, i) => {
				var o = Bt();
				n(o, 21, () => m(oe), (e) => e.key, (e, n) => {
					var o = zt(), s = a(o, !0);
					p((e) => t(s, e), [() => pt(m(i).body[m(n).key], I.current.locale, m(r))]), C(e, o);
				}), b(o), d("click", o, () => Q("record-select", { recordId: m(i).id })), d("keydown", o, (e) => e.key === "Enter" && Q("record-select", { recordId: m(i).id })), C(e, o);
			}), b(l), b(i), C(e, i);
		};
		f(S, (e) => {
			m(J) && !m(Y) && m(G).length === 0 && !m(X) ? e(T) : m(G).length > 0 && e(E, 1);
		});
		var D = _(S, 2), O = (e) => {
			var n = Ht(), i = a(n, !0);
			p((e) => t(i, e), [() => m(r)("common.loading")]), C(e, n);
		};
		f(D, (e) => {
			m(Y) && e(O);
		});
		var j = _(D, 2), N = (e) => {
			var n = Ut(), i = a(n, !0);
			p((e) => t(i, e), [() => m(r)("common.load_more")]), d("click", n, () => le(m(K) ?? void 0)), C(e, n);
		};
		f(j, (e) => {
			m(K) && !m(Y) && e(N);
		}), C(e, s);
	};
	return f(me, (e) => {
		I.current && m(R) && e(he);
	}), C(s, pe), S(fe);
}
s(["click", "keydown"]), j(Kt, {
	entityId: {
		attribute: "entity-id",
		type: "String"
	},
	entityKey: {
		attribute: "entity-key",
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
var qt = l("<br/> ", 1), Jt = l("<p part=\"error\" class=\"error svelte-1o3y7sj\" role=\"alert\"><!> <!></p>"), Yt = l("<p part=\"error\" class=\"error svelte-1o3y7sj\" role=\"alert\"> </p>"), Xt = l("<option> </option>"), Zt = l("<label part=\"picker\" class=\"svelte-1o3y7sj\"> <select class=\"svelte-1o3y7sj\"><option>—</option><!></select></label>"), Qt = l("<p class=\"muted svelte-1o3y7sj\"> </p>"), $t = l("<p part=\"notice\" role=\"status\"> </p>"), en = l("<p part=\"notice\" class=\"error svelte-1o3y7sj\"> </p>"), tn = l("<form part=\"form\"><!> <!> <div part=\"actions\"><button part=\"button\" type=\"button\" class=\"svelte-1o3y7sj\"> </button></div></form>"), nn = l("<!> <!> <!> <!> <!>", 1), rn = {
	hash: "svelte-1o3y7sj",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}[part='picker'].svelte-1o3y7sj {display:grid;gap:4px;margin-block-end:var(--agentflow-gap, 12px);font-weight:600;}select.svelte-1o3y7sj {font:inherit;padding:6px 8px;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);}.muted.svelte-1o3y7sj {color:var(--agentflow-muted, #667085);}.error.svelte-1o3y7sj {color:var(--agentflow-danger, #b42318);}button.svelte-1o3y7sj {font:inherit;padding:6px 14px;cursor:pointer;border-radius:var(--agentflow-radius, 6px);border:1px solid var(--agentflow-accent, #1570ef);background:var(--agentflow-accent, #1570ef);color:var(--agentflow-accent-text, #fff);}button.svelte-1o3y7sj:disabled {opacity:0.5;cursor:default;}"
};
function an(s, l) {
	y(l, !0), N(s, rn);
	let w = E(l, "workflowId", 7), D = E(l, "workflowKey", 7), A = "__name", j = l.$$host, M = kt(j), P = x(() => M.current?.state === "ready"), F = u(null), I = x(() => w() || m(F)), R = x(() => !!w() || !!D()), z = u(null), B = u(g([])), V = u(""), H = u(!1), U = u(null), W = u(g([])), G = u(g({})), K = u(g({})), q = u(null), J = u(!1), Y = u(!1), X = u(!1), te = x(() => Dt(m(W))), ne = (e, t) => j.dispatchEvent(new CustomEvent(e, {
		detail: t,
		bubbles: !0,
		composed: !0
	})), Z = 0;
	function re() {
		Z++, v(U, null), v(W, [], !0), v(G, {}, !0), v(K, {}, !0), v(q, null), v(J, !1), v(Y, !1), v(X, !1);
	}
	async function ie(e) {
		let t = M.current;
		if (!t) return;
		let n = Z;
		v(X, !0);
		let r = [];
		try {
			for await (let e of Ce((e) => L(t.client.GET("/workflows/startable", { params: { query: e ? {
				limit: 100,
				cursor: e
			} : { limit: 100 } } })))) r.push(e);
		} catch (e) {
			let r = t.report(e);
			n === Z && (v(q, r, !0), v(X, !1));
			return;
		}
		if (n !== Z || (v(X, !1), v(B, r, !0), !e)) return;
		let i = r.find((t) => t.id === e);
		i ? await oe(i) : v(H, !0);
	}
	let ae = (e) => ({
		...Ct(m(W), {}),
		[A]: e.name
	});
	async function oe(e) {
		let t = M.current;
		if (!t || (re(), !e)) return;
		let n = Z;
		v(X, !0);
		let r;
		try {
			r = await L(t.client.GET("/workflow-versions/{version_id}/start-form", { params: { path: { version_id: e.version_id } } }));
		} catch (e) {
			let r = t.report(e);
			n === Z && (v(q, r, !0), v(X, !1));
			return;
		}
		if (n !== Z) return;
		v(X, !1);
		let i = {
			key: A,
			label: t.t("start.name"),
			kind: "text",
			required: !0
		};
		v(W, [i, ...bt(r.form_definition?.schema_json, r.form_definition?.ui_schema_json)], !0), v(G, ae(e), !0), v(U, e, !0);
	}
	function Q(e) {
		v(V, e, !0), oe(m(B).find((t) => t.id === e) ?? null);
	}
	async function $() {
		let e = M.current, t = m(U);
		if (!e || !t || m(J) || m(te).length > 0) return;
		v(Y, !1);
		let n = String(m(G)[A] ?? "").trim(), r = Et(m(W), {
			...m(G),
			[A]: n
		});
		if (r.length > 0) {
			v(K, Object.fromEntries(r.map((t) => [t, e.t("form.required")])), !0);
			return;
		}
		let i = Z;
		v(J, !0), v(q, null), v(K, {}, !0);
		let a;
		try {
			a = await L(e.client.POST("/workflows/{workflow_id}/instances", {
				params: { path: { workflow_id: t.id } },
				body: {
					name: n,
					version_id: t.version_id,
					input_payload: Tt(m(W).filter((e) => e.key !== A), m(G))
				}
			}));
		} catch (t) {
			let n = e.report(t);
			if (i !== Z) return;
			v(J, !1), v(K, Ot(n?.fieldErrors), !0), v(q, n, !0);
			return;
		}
		ne("workflow-started", {
			instanceId: a.id,
			workflowId: t.id
		}), i === Z && (v(J, !1), v(G, ae(t), !0), v(Y, !0));
	}
	h(() => {
		w(), D(), v(F, null), v(z, null);
	}), h(() => {
		m(I), D(), re(), v(B, [], !0), v(V, ""), v(H, !1);
	}), h(() => {
		if (!m(P) || w() || !D()) return;
		let e = D();
		r(async () => {
			let t = M.current;
			if (!t) return;
			let n = Z;
			try {
				let r = await lt(t.client, "workflow", e);
				n === Z && v(F, r, !0);
			} catch (e) {
				let r = t.report(e);
				n === Z && v(z, r, !0);
			}
		});
	}), h(() => {
		if (!m(P) || D() && !w() && !m(I)) return;
		let e = m(I);
		r(() => ie(e));
	});
	var se = {
		get workflowId() {
			return w();
		},
		set workflowId(t) {
			w(t), e();
		},
		get workflowKey() {
			return D();
		},
		set workflowKey(t) {
			D(t), e();
		}
	}, ce = c(), le = k(ce), ue = (e) => {
		let r = x(() => M.current.t);
		var s = c(), l = k(s), u = (e) => {
			var n = Jt(), a = o(n), s = (e) => {
				var n = i();
				p(() => t(n, m(z).detail)), C(e, n);
			}, c = (e) => {
				var n = i();
				p((e) => t(n, e), [() => m(r)("common.error", { code: m(z).code })]), C(e, n);
			};
			f(a, (e) => {
				m(z).code === "APP_KEY_MISSING" ? e(s) : e(c, -1);
			});
			var l = _(a, 2), u = (e) => {
				var n = qt(), i = _(k(n), 1, !0);
				p((e) => t(i, e), [() => m(r)("common.request_id", { id: m(z).requestId })]), C(e, n);
			};
			f(l, (e) => {
				m(z).requestId && e(u);
			}), b(n), C(e, n);
		}, h = (e) => {
			var n = Yt(), i = a(n, !0);
			p((e) => t(i, e), [() => m(r)("start.not_startable")]), C(e, n);
		}, g = (e) => {
			var s = nn(), c = k(s), l = (e) => {
				var i = Zt(), s = o(i), c = _(s), l = o(c);
				l.value = l.__value = "";
				var u = _(l);
				n(u, 17, () => m(B), (e) => e.id, (e, n) => {
					var r = Xt(), i = a(r, !0), o = {};
					p(() => {
						t(i, m(n).name), o !== (o = m(n).id) && (r.value = (r.__value = o) ?? "");
					}), C(e, r);
				}), b(c), T(c), b(i), p((e) => t(s, `${e ?? ""} `), [() => m(r)("start.choose")]), O(c, () => m(V), Q), C(e, i);
			};
			f(c, (e) => {
				m(R) || e(l);
			});
			var u = _(c, 2), h = (e) => {
				var n = Qt(), i = a(n, !0);
				p((e) => t(i, e), [() => m(r)("common.loading")]), C(e, n);
			};
			f(u, (e) => {
				m(X) && e(h);
			});
			var g = _(u, 2), y = (e) => {
				var n = Jt(), a = o(n), s = (e) => {
					var n = i();
					p(() => t(n, m(q).detail)), C(e, n);
				}, c = (e) => {
					var n = i();
					p((e) => t(n, e), [() => m(r)("common.error", { code: m(q).code })]), C(e, n);
				};
				f(a, (e) => {
					m(q).code === "APP_KEY_MISSING" ? e(s) : e(c, -1);
				});
				var l = _(a, 2), u = (e) => {
					var n = qt(), i = _(k(n), 1, !0);
					p((e) => t(i, e), [() => m(r)("common.request_id", { id: m(q).requestId })]), C(e, n);
				};
				f(l, (e) => {
					m(q).requestId && e(u);
				}), b(n), C(e, n);
			};
			f(g, (e) => {
				m(q) && e(y);
			});
			var x = _(g, 2), S = (e) => {
				var n = $t(), i = a(n, !0);
				p((e) => t(i, e), [() => m(r)("start.started")]), C(e, n);
			};
			f(x, (e) => {
				m(Y) && e(S);
			});
			var w = _(x, 2), E = (e) => {
				var n = tn(), i = o(n);
				st(i, {
					get fields() {
						return m(W);
					},
					get errors() {
						return m(K);
					},
					get disabled() {
						return m(J);
					},
					get t() {
						return m(r);
					},
					get values() {
						return m(G);
					},
					set values(e) {
						v(G, e, !0);
					}
				});
				var s = _(i, 2), c = (e) => {
					var n = en(), i = a(n, !0);
					p((e) => t(i, e), [() => m(r)("form.unsupported_required")]), C(e, n);
				};
				f(s, (e) => {
					m(te).length > 0 && e(c);
				});
				var l = _(s, 2), u = o(l), h = a(u, !0);
				b(l), b(n), p((e) => {
					u.disabled = m(J) || m(te).length > 0, t(h, e);
				}, [() => m(r)("start.submit")]), ee("submit", n, (e) => e.preventDefault()), d("click", u, $), C(e, n);
			};
			f(w, (e) => {
				m(U) && e(E);
			}), C(e, s);
		};
		f(l, (e) => {
			m(z) ? e(u) : m(H) ? e(h, 1) : e(g, -1);
		}), C(e, s);
	};
	return f(le, (e) => {
		M.current && m(P) && e(ue);
	}), C(s, ce), S(se);
}
s(["click"]), j(an, {
	workflowId: {
		attribute: "workflow-id",
		type: "String"
	},
	workflowKey: {
		attribute: "workflow-key",
		type: "String"
	}
}, [], [], { mode: "open" });
//#endregion
//#region src/elements/TaskDetail.svelte
var on = l("<header part=\"header\"><h2 part=\"title\" class=\"svelte-xgtj81\"> </h2> <p part=\"meta\" class=\"muted svelte-xgtj81\"> </p></header>"), sn = l("<br/> ", 1), cn = l("<p part=\"error\" class=\"error svelte-xgtj81\" role=\"alert\"><!> <!> <!></p>"), ln = l("<p class=\"muted svelte-xgtj81\"> </p>"), un = l("<p part=\"notice\"> </p>"), dn = l("<button part=\"button\" type=\"button\" class=\"secondary svelte-xgtj81\"> </button>"), fn = l("<div part=\"actions\" class=\"svelte-xgtj81\"><button part=\"button\" type=\"button\" class=\"svelte-xgtj81\"> </button></div>"), pn = l("<p part=\"notice\"> </p> <div part=\"actions\" class=\"svelte-xgtj81\"><!></div>", 1), mn = l("<p part=\"notice\" class=\"error svelte-xgtj81\"> </p>"), hn = l("<button part=\"button\" type=\"button\" class=\"svelte-xgtj81\"> </button>"), gn = l("<form part=\"form\"><!> <!> <!> <!> <div part=\"actions\" class=\"svelte-xgtj81\"><!> <!></div></form>"), _n = l("<!> <!> <!> <!>", 1), vn = {
	hash: "svelte-xgtj81",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}h2.svelte-xgtj81 {margin:0 0 4px;font-size:1.25em;}.muted.svelte-xgtj81 {color:var(--agentflow-muted, #667085);margin:0 0 var(--agentflow-gap, 12px);}.error.svelte-xgtj81 {color:var(--agentflow-danger, #b42318);}[part='actions'].svelte-xgtj81 {display:flex;gap:8px;flex-wrap:wrap;}button.svelte-xgtj81 {font:inherit;padding:6px 14px;cursor:pointer;border-radius:var(--agentflow-radius, 6px);border:1px solid var(--agentflow-accent, #1570ef);background:var(--agentflow-accent, #1570ef);color:var(--agentflow-accent-text, #fff);}button.secondary.svelte-xgtj81 {background:transparent;color:var(--agentflow-accent, #1570ef);}button.svelte-xgtj81:disabled {opacity:0.5;cursor:default;}"
};
function yn(s, l) {
	y(l, !0), N(s, vn);
	let w = E(l, "entityId", 7), T = E(l, "entityKey", 7), D = E(l, "recordId", 7), O = {
		id: null,
		name: null,
		title: null
	}, A = l.$$host, j = kt(A), M = x(() => j.current?.state === "ready"), P = u(null), F = u(null), I = 0, R = x(() => w() || m(P)), z = u(null), B = u(g(O)), V = u(!1), H = u(g([])), U = u(g({})), W = u(g({})), G = u(null), K = x(() => m(G) ?? m(F)), q = u(!1), J = u(!1), Y = x(() => !!m(B).id && m(B).id === j.current?.caller?.id), X = x(() => !!m(z) && m(z).step_status !== "open"), te = x(() => !!m(z) && m(z).step_status === "open" && m(z).signed), ne = x(() => Dt(m(H))), Z = x(() => m(z)?.actions.find((e) => e.id === m(z)?.signed_action_id)), re = x(() => m(z)?.actions.filter((e) => e.id !== m(Z)?.id) ?? []), ie = x(() => {
		let e = m(z)?.entity_view;
		return e?.mode !== "selectable" || e.view?.type !== "grid" && e.view?.type !== "kanban" ? !1 : (e.min_selection ?? 1) > 0;
	}), ae = (e, t) => A.dispatchEvent(new CustomEvent(e, {
		detail: t,
		bubbles: !0,
		composed: !0
	}));
	function oe(e) {
		v(z, e, !0), v(H, bt(e.form_definition?.schema_json, e.form_definition?.ui_schema_json), !0), v(U, Ct(m(H), e.draft_payload ?? e.prefill ?? {}), !0), v(W, {}, !0);
	}
	let Q = 0;
	async function $(e, t) {
		let n = j.current;
		if (!n || !e || !t) return;
		let r = Q;
		v(J, !0);
		try {
			let i = {
				entity_id: e,
				record_id: t
			}, [a, o] = await Promise.all([n.client.GET("/entities/{entity_id}/records/{record_id}/step", { params: { path: i } }), n.client.GET("/entities/{entity_id}/records/{record_id}", { params: { path: i } })]);
			if (a.response.status === 404) {
				r === Q && (v(z, null), v(B, O, !0)), await L(Promise.resolve(o)), r === Q && v(V, !0);
				return;
			}
			let s = await L(Promise.resolve(a)), c = await L(Promise.resolve(o));
			if (r !== Q) return;
			v(V, !1);
			let l = typeof c.body.claimed_by == "string" ? c.body.claimed_by : null;
			v(B, {
				id: l,
				name: l ? c.ref_labels?.claimed_by ?? null : null,
				title: typeof c.body.title == "string" ? c.body.title : null
			}, !0), oe(s);
		} catch (e) {
			let t = n.report(e);
			r === Q && v(G, t, !0);
		} finally {
			r === Q && v(J, !1);
		}
	}
	async function se(e) {
		let t = j.current;
		if (!t || !m(z)) return;
		let n = m(R), r = D();
		if (!n) return;
		let i = Q;
		v(q, !0), v(G, null);
		try {
			let a = e === "claim" ? "/entities/{entity_id}/records/{record_id}/work/claim" : "/entities/{entity_id}/records/{record_id}/work/release";
			await L(t.client.POST(a, { params: { path: {
				entity_id: n,
				record_id: r
			} } })), i === Q && await $(n, r), ae(e === "claim" ? "task-claimed" : "task-released", {
				recordId: r,
				entityId: n
			});
		} catch (e) {
			let a = t.report(e);
			if (i !== Q) return;
			v(G, a, !0), a && await $(n, r);
		} finally {
			i === Q && v(q, !1);
		}
	}
	async function ce(e) {
		let t = j.current;
		if (!t || !m(z)) return;
		let n = Et(m(H), m(U));
		if (n.length > 0) {
			v(W, Object.fromEntries(n.map((e) => [e, t.t("form.required")])), !0);
			return;
		}
		let r = m(R), i = D();
		if (!r) return;
		let a = Q;
		v(q, !0), v(G, null), v(W, {}, !0);
		try {
			let n = Tt(m(H), m(U));
			e && (n._action = e);
			let o = await L(t.client.POST("/entities/{entity_id}/records/{record_id}/step/submit", {
				params: { path: {
					entity_id: r,
					record_id: i
				} },
				body: { payload: n }
			}));
			a === Q && oe(o), ae("task-submitted", {
				recordId: i,
				entityId: r,
				actionId: e
			});
		} catch (e) {
			let n = t.report(e);
			if (a !== Q) return;
			v(W, Ot(n?.fieldErrors), !0), v(G, n, !0);
		} finally {
			a === Q && v(q, !1);
		}
	}
	h(() => {
		w(), T(), I++, v(P, null), v(F, null);
	}), h(() => {
		m(R), T(), D(), Q++, v(z, null), v(V, !1), v(B, O, !0), v(G, null), v(W, {}, !0), v(q, !1), v(J, !1);
	}), h(() => {
		if (!m(M) || w() || !T()) return;
		let e = T();
		r(async () => {
			let t = j.current;
			if (!t) return;
			let n = I;
			try {
				let r = await lt(t.client, "entity", e);
				n === I && v(P, r, !0);
			} catch (e) {
				let r = t.report(e);
				n === I && v(F, r, !0);
			}
		});
	}), h(() => {
		if (!m(M) || !m(R)) return;
		let e = m(R), t = D();
		r(() => $(e, t));
	});
	var le = {
		get entityId() {
			return w();
		},
		set entityId(t) {
			w(t), e();
		},
		get entityKey() {
			return T();
		},
		set entityKey(t) {
			T(t), e();
		},
		get recordId() {
			return D();
		},
		set recordId(t) {
			D(t), e();
		}
	}, ue = c(), de = k(ue), fe = (e) => {
		let r = x(() => j.current.t);
		var s = _n(), l = k(s), u = (e) => {
			var n = on(), r = o(n), i = a(r, !0), s = _(r, 2), c = a(s, !0);
			b(n), p((e) => {
				t(i, m(B).title ?? m(z).run.step_label), t(c, e);
			}, [() => [m(z).run.workflow_name, m(z).instance_name].filter(Boolean).join(" · ")]), C(e, n);
		};
		f(l, (e) => {
			m(z) && !m(V) && e(u);
		});
		var h = _(l, 2), g = (e) => {
			var n = cn(), a = o(n), s = (e) => {
				var n = i();
				p(() => t(n, m(K).detail)), C(e, n);
			}, c = (e) => {
				var n = i();
				p((e) => t(n, e), [() => m(r)("common.error", { code: m(K).code })]), C(e, n);
			};
			f(a, (e) => {
				m(K).code === "APP_KEY_MISSING" ? e(s) : e(c, -1);
			});
			var l = _(a, 2), u = (e) => {
				var n = sn(), r = _(k(n), 1, !0);
				p(() => t(r, m(K).detail)), C(e, n);
			};
			f(l, (e) => {
				m(K).status === 422 && !m(K).fieldErrors?.length && m(K).detail && e(u);
			});
			var d = _(l, 2), h = (e) => {
				var n = sn(), i = _(k(n), 1, !0);
				p((e) => t(i, e), [() => m(r)("common.request_id", { id: m(K).requestId })]), C(e, n);
			};
			f(d, (e) => {
				m(K).requestId && e(h);
			}), b(n), C(e, n);
		};
		f(h, (e) => {
			m(K) && e(g);
		});
		var y = _(h, 2), S = (e) => {
			var n = ln(), i = a(n, !0);
			p((e) => t(i, e), [() => m(r)("common.loading")]), C(e, n);
		};
		f(y, (e) => {
			m(J) && e(S);
		});
		var w = _(y, 2), T = (e) => {
			var n = un(), i = a(n, !0);
			p((e) => t(i, e), [() => m(r)("task.withheld")]), C(e, n);
		}, E = (e) => {
			let i = (e) => {
				var n = dn(), i = a(n, !0);
				p((e) => {
					n.disabled = m(q), t(i, e);
				}, [() => m(r)("task.release")]), d("click", n, () => se("release")), C(e, n);
			};
			var s = c(), l = k(s), u = (e) => {
				var n = un(), i = a(n, !0);
				p((e) => t(i, e), [() => m(z).step_status === "cancelled" ? m(r)("task.cancelled") : m(r)("task.done")]), C(e, n);
			}, h = (e) => {
				var n = un(), i = a(n, !0);
				p((e) => t(i, e), [() => m(r)("task.signed_waiting")]), C(e, n);
			}, g = (e) => {
				var n = fn(), i = o(n), s = a(i, !0);
				b(n), p((e) => {
					i.disabled = m(q), t(s, e);
				}, [() => m(r)("task.claim")]), d("click", i, () => se("claim")), C(e, n);
			}, y = (e) => {
				var n = pn(), s = k(n), c = a(s, !0), l = _(s, 2), u = o(l);
				i(u), b(l), p((e) => t(c, e), [() => m(r)("task.sign_elsewhere")]), C(e, n);
			}, x = (e) => {
				var n = pn(), s = k(n), c = a(s, !0), l = _(s, 2), u = o(l);
				i(u), b(l), p((e) => t(c, e), [() => m(r)("task.select_elsewhere")]), C(e, n);
			}, S = (e) => {
				var s = gn(), l = o(s);
				st(l, {
					get fields() {
						return m(H);
					},
					get errors() {
						return m(W);
					},
					get disabled() {
						return m(q);
					},
					get t() {
						return m(r);
					},
					get values() {
						return m(U);
					},
					set values(e) {
						v(U, e, !0);
					}
				});
				var u = _(l, 2), h = (e) => {
					var n = mn(), i = a(n, !0);
					p((e) => t(i, e), [() => m(r)("form.unsupported_required")]), C(e, n);
				};
				f(u, (e) => {
					m(ne).length > 0 && e(h);
				});
				var g = _(u, 2), y = (e) => {
					var n = un(), i = a(n, !0);
					p((e) => t(i, e), [() => m(r)("task.no_actions")]), C(e, n);
				};
				f(g, (e) => {
					m(z).actions_gated_out && e(y);
				});
				var x = _(g, 2), S = (e) => {
					var n = un(), i = a(n, !0);
					p((e) => t(i, e), [() => m(r)("task.sign_elsewhere")]), C(e, n);
				};
				f(x, (e) => {
					m(Z) && e(S);
				});
				var w = _(x, 2), T = o(w);
				i(T);
				var E = _(T, 2), D = (e) => {
					var r = c(), i = k(r);
					n(i, 17, () => m(re), (e) => e.id, (e, n) => {
						var r = hn(), i = a(r, !0);
						p(() => {
							r.disabled = m(q) || m(ne).length > 0, t(i, m(n).label);
						}), d("click", r, () => ce(m(n).id)), C(e, r);
					}), C(e, r);
				}, O = (e) => {
					var n = hn(), i = a(n, !0);
					p((e) => {
						n.disabled = m(q) || m(ne).length > 0, t(i, e);
					}, [() => m(r)("task.submit")]), d("click", n, () => ce(null)), C(e, n);
				};
				f(E, (e) => {
					m(z).actions.length > 0 ? e(D) : m(z).actions_gated_out || e(O, 1);
				}), b(w), b(s), ee("submit", s, (e) => e.preventDefault()), C(e, s);
			}, w = (e) => {
				var n = un(), i = a(n, !0);
				p((e) => t(i, e), [() => m(B).name ? m(r)("task.claimed_by", { name: m(B).name }) : m(r)("task.claimed_by_someone")]), C(e, n);
			};
			f(l, (e) => {
				m(X) ? e(u) : m(te) ? e(h, 1) : m(B).id ? m(Y) && (m(z).kind === "signature" || m(z).signs && !m(Z)) ? e(y, 3) : m(Y) && m(ie) ? e(x, 4) : m(Y) ? e(S, 5) : e(w, -1) : e(g, 2);
			}), C(e, s);
		};
		f(w, (e) => {
			m(V) ? e(T) : m(z) && e(E, 1);
		}), C(e, s);
	};
	return f(de, (e) => {
		j.current && m(M) && e(fe);
	}), C(s, ue), S(le);
}
s(["click"]), j(yn, {
	entityId: {
		attribute: "entity-id",
		type: "String"
	},
	entityKey: {
		attribute: "entity-key",
		type: "String"
	},
	recordId: {
		attribute: "record-id",
		type: "String"
	}
}, [], [], { mode: "open" });
//#endregion
//#region src/elements/TaskInbox.svelte
var bn = l("<br/> ", 1), xn = l("<p part=\"error\" class=\"error svelte-j92hy\" role=\"alert\"> <!></p>"), Sn = l("<p part=\"empty\" class=\"muted svelte-j92hy\"> </p>"), Cn = l("<tr part=\"row\" tabindex=\"0\" class=\"svelte-j92hy\"><td class=\"svelte-j92hy\"> </td><td class=\"svelte-j92hy\"> </td><td class=\"svelte-j92hy\"> </td><td class=\"svelte-j92hy\"> </td></tr>"), wn = l("<table part=\"table\" class=\"svelte-j92hy\"><thead><tr><th class=\"svelte-j92hy\"> </th><th class=\"svelte-j92hy\"> </th><th class=\"svelte-j92hy\"> </th><th class=\"svelte-j92hy\"> </th></tr></thead><tbody></tbody></table>"), Tn = l("<p class=\"muted svelte-j92hy\"> </p>"), En = l("<button part=\"load-more\" type=\"button\" class=\"svelte-j92hy\"> </button>"), Dn = l("<!> <!> <!> <!>", 1), On = {
	hash: "svelte-j92hy",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}table.svelte-j92hy {width:100%;border-collapse:collapse;}th.svelte-j92hy, td.svelte-j92hy {text-align:start;padding:8px;border-block-end:1px solid var(--agentflow-border, #eaecf0);}tr[part='row'].svelte-j92hy {cursor:pointer;}tr[part='row'].svelte-j92hy:hover, tr[part='row'].svelte-j92hy:focus {background:color-mix(in srgb, var(--agentflow-accent, #1570ef) 8%, transparent);}.muted.svelte-j92hy {color:var(--agentflow-muted, #667085);}.error.svelte-j92hy {color:var(--agentflow-danger, #b42318);}button.svelte-j92hy {font:inherit;margin-block-start:var(--agentflow-gap, 12px);padding:6px 12px;cursor:pointer;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);background:transparent;}"
};
function kn(i, s) {
	y(s, !0), N(i, On);
	let l = E(s, "view", 7), w = E(s, "pageSize", 7), T = x(() => l() === "mine" || l() === "claimable" ? l() : "all"), D = x(() => Je(w())), O = s.$$host, A = kt(O), j = x(() => A.current?.state === "ready"), M = u(g([])), P = u(null), ee = u(!1), F = u(!1), I = u(null), R = 0;
	async function z(e) {
		let t = A.current;
		if (!t) return;
		let n = ++R;
		v(F, !0), v(I, null), e || v(P, null);
		try {
			let r = {
				view: m(T),
				live: !0,
				limit: m(D)
			};
			e && (r.cursor = e);
			let i = await L(t.client.GET("/work", { params: { query: r } }));
			if (n !== R) return;
			let a = i.items.filter((e) => e.step);
			v(M, e ? [...m(M), ...a] : a, !0), v(P, i.next_cursor, !0), v(ee, !0);
		} catch (r) {
			let i = t.report(r);
			n === R && (v(I, i, !0), e || v(M, [], !0));
		} finally {
			n === R && v(F, !1);
		}
	}
	h(() => {
		m(j) && (m(T), m(D), r(() => z()));
	});
	let B = (e) => O.dispatchEvent(new CustomEvent("task-select", {
		detail: {
			recordId: e.id,
			entityId: e.entity_id
		},
		bubbles: !0,
		composed: !0
	}));
	var V = {
		get view() {
			return l();
		},
		set view(t) {
			l(t), e();
		},
		get pageSize() {
			return w();
		},
		set pageSize(t) {
			w(t), e();
		}
	}, H = c(), U = k(H), W = (e) => {
		let r = x(() => A.current.t);
		var i = Dn(), s = k(i), c = (e) => {
			var n = xn(), i = o(n), a = _(i), s = (e) => {
				var n = bn(), i = _(k(n), 1, !0);
				p((e) => t(i, e), [() => m(r)("common.request_id", { id: m(I).requestId })]), C(e, n);
			};
			f(a, (e) => {
				m(I).requestId && e(s);
			}), b(n), p((e) => t(i, `${e ?? ""} `), [() => m(r)("common.error", { code: m(I).code })]), C(e, n);
		};
		f(s, (e) => {
			m(I) && e(c);
		});
		var l = _(s, 2), u = (e) => {
			var n = Sn(), i = a(n, !0);
			p((e) => t(i, e), [() => m(r)("inbox.empty")]), C(e, n);
		}, h = (e) => {
			var i = wn(), s = o(i), c = o(s), l = o(c), u = a(l, !0), f = _(l), h = a(f, !0), g = _(f), v = a(g, !0), y = _(g), x = a(y, !0);
			b(c), b(s);
			var S = _(s);
			n(S, 21, () => m(M), (e) => e.id, (e, n) => {
				var i = Cn(), s = o(i), c = a(s, !0), l = _(s), u = a(l, !0), f = _(l), h = a(f, !0), g = _(f), v = a(g, !0);
				b(i), p((e, r) => {
					t(c, m(n).step?.step.label || m(n).step?.step.key), t(u, m(n).step?.workflow.name ?? ""), t(h, e), t(v, r);
				}, [() => m(r)(m(n).claimed_by_user_id ? "status.claimed" : "status.open"), () => ft(m(n).due_at, A.current.locale)]), d("click", i, () => B(m(n))), d("keydown", i, (e) => e.key === "Enter" && B(m(n))), C(e, i);
			}), b(S), b(i), p((e, n, r, i) => {
				t(u, e), t(h, n), t(v, r), t(x, i);
			}, [
				() => m(r)("inbox.column.task"),
				() => m(r)("inbox.column.workflow"),
				() => m(r)("inbox.column.status"),
				() => m(r)("inbox.column.due")
			]), C(e, i);
		};
		f(l, (e) => {
			m(ee) && !m(F) && m(M).length === 0 && !m(I) && !m(P) ? e(u) : m(M).length > 0 && e(h, 1);
		});
		var g = _(l, 2), v = (e) => {
			var n = Tn(), i = a(n, !0);
			p((e) => t(i, e), [() => m(r)("common.loading")]), C(e, n);
		};
		f(g, (e) => {
			m(F) && e(v);
		});
		var y = _(g, 2), S = (e) => {
			var n = En(), i = a(n, !0);
			p((e) => t(i, e), [() => m(r)("common.load_more")]), d("click", n, () => z(m(P) ?? void 0)), C(e, n);
		};
		f(y, (e) => {
			m(P) && !m(F) && e(S);
		}), C(e, i);
	};
	return f(U, (e) => {
		A.current && m(j) && e(W);
	}), C(i, H), S(V);
}
s(["click", "keydown"]), j(kn, {
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
function An(e, t) {
	let n = Oe(t), r = e ?? `${location.pathname}${location.search}${location.hash}`;
	location.assign(`${n}/auth/login?returnTo=${encodeURIComponent(r)}`);
}
function jn(e) {
	let t = document.createElement("form");
	t.method = "post", t.action = `${Oe(e)}/auth/logout`, t.dataset.agentflowSignOut = "", t.hidden = !0, document.body.append(t), t.submit();
}
//#endregion
//#region src/index.ts
var Mn = {
	"agentflow-provider": Xe,
	"agentflow-task-inbox": kn,
	"agentflow-task-detail": yn,
	"agentflow-record-table": Kt,
	"agentflow-start-form": an
};
function Nn(e = customElements) {
	for (let [t, n] of Object.entries(Mn)) e.get(t) || e.define(t, n.element);
}
Nn();
//#endregion
export { Nn as defineAgentFlowElements, An as signIn, jn as signOut };
