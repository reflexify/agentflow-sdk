import { $ as e, B as t, C as n, D as r, F as i, G as a, J as o, K as s, M as c, N as l, P as u, Q as d, R as f, T as p, U as m, V as h, W as g, X as _, Y as v, Z as y, b, c as x, d as S, et as C, f as w, g as T, h as E, i as D, l as O, n as k, nt as A, ot as ee, r as j, st as M, t as N, tt as P, ut as F, z as I } from "./chunks/version-CWaeZU01.js";
//#region ../agentflow-sdk/dist/auth.js
function L() {
	return {
		async headers() {
			return {};
		},
		credentials: "same-origin"
	};
}
//#endregion
//#region ../agentflow-sdk/dist/errors.js
var R = class extends Error {
	status;
	code;
	detail;
	requestId;
	fieldErrors;
	constructor(e, t, n, r, i) {
		super(n ? `${t}: ${n}` : t), this.status = e, this.code = t, this.detail = n, this.requestId = r, this.fieldErrors = i, this.name = "AgentFlowError";
	}
};
async function z(e) {
	let { data: t, error: n, response: r } = await e;
	if (r.ok && n === void 0) return t;
	let i = n ?? {};
	throw new R(r.status, i.type ?? `HTTP_${r.status}`, i.detail, i.request_id, i.field_errors ?? void 0);
}
//#endregion
//#region ../../node_modules/.pnpm/openapi-fetch@0.17.0/node_modules/openapi-fetch/dist/index.mjs
var B = /\{[^{}]+\}/g, V = () => typeof process == "object" && Number.parseInt(process?.versions?.node?.substring(0, 2)) >= 18 && process.versions.undici;
function te() {
	return Math.random().toString(36).slice(2, 11);
}
function H(e) {
	let { baseUrl: t = "", Request: n = globalThis.Request, fetch: r = globalThis.fetch, querySerializer: i, bodySerializer: a, pathSerializer: o, headers: s, requestInitExt: c = void 0, ...l } = { ...e };
	c = V() ? c : void 0, t = ne(t);
	let u = [];
	async function d(e, d) {
		let { baseUrl: f, fetch: p = r, Request: m = n, headers: h, params: g = {}, parseAs: _ = "json", querySerializer: v, bodySerializer: y = a ?? J, pathSerializer: b, body: x, middleware: S = [], ...C } = d || {}, w = t;
		f && (w = ne(f) ?? t);
		let T = typeof i == "function" ? i : K(i);
		v && (T = typeof v == "function" ? v : K({
			...typeof i == "object" ? i : {},
			...v
		}));
		let E = b || o || q, D = x === void 0 ? void 0 : y(x, X(s, h, g.header)), O = X(D === void 0 || D instanceof FormData ? {} : { "Content-Type": "application/json" }, s, h, g.header), k = [...u, ...S], A = {
			redirect: "follow",
			...l,
			...C,
			body: D,
			headers: O
		}, ee, j, M = new m(Y(e, {
			baseUrl: w,
			params: g,
			querySerializer: T,
			pathSerializer: E
		}), A), N;
		for (let e in C) e in M || (M[e] = C[e]);
		if (k.length) {
			ee = te(), j = Object.freeze({
				baseUrl: w,
				fetch: p,
				parseAs: _,
				querySerializer: T,
				bodySerializer: y,
				pathSerializer: E
			});
			for (let t of k) if (t && typeof t == "object" && typeof t.onRequest == "function") {
				let n = await t.onRequest({
					request: M,
					schemaPath: e,
					params: g,
					options: j,
					id: ee
				});
				if (n) {
					if (n instanceof m) M = n;
					else if (n instanceof Response) {
						N = n;
						break;
					} else throw Error("onRequest: must return new Request() or Response() when modifying the request");
				}
			}
		}
		if (!N) {
			try {
				N = await p(M, c);
			} catch (t) {
				let n = t;
				if (k.length) for (let t = k.length - 1; t >= 0; t--) {
					let r = k[t];
					if (r && typeof r == "object" && typeof r.onError == "function") {
						let t = await r.onError({
							request: M,
							error: n,
							schemaPath: e,
							params: g,
							options: j,
							id: ee
						});
						if (t) {
							if (t instanceof Response) {
								n = void 0, N = t;
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
						request: M,
						response: N,
						schemaPath: e,
						params: g,
						options: j,
						id: ee
					});
					if (t) {
						if (!(t instanceof Response)) throw Error("onResponse: must return new Response() when modifying the response");
						N = t;
					}
				}
			}
		}
		let P = N.headers.get("Content-Length");
		if (N.status === 204 || M.method === "HEAD" || P === "0" && !N.headers.get("Transfer-Encoding")?.includes("chunked")) return N.ok ? {
			data: void 0,
			response: N
		} : {
			error: void 0,
			response: N
		};
		if (N.ok) return {
			data: await (async () => {
				if (_ === "stream") return N.body;
				if (_ === "json" && !P) {
					let e = await N.text();
					return e ? JSON.parse(e) : void 0;
				}
				return await N[_]();
			})(),
			response: N
		};
		let F = await N.text();
		try {
			F = JSON.parse(F);
		} catch {}
		return {
			error: F,
			response: N
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
function U(e, t, n) {
	if (t == null) return "";
	if (typeof t == "object") throw Error("Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these.");
	return `${e}=${n?.allowReserved === !0 ? t : encodeURIComponent(t)}`;
}
function W(e, t, n) {
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
		r.push(U(a, t[i], n));
	}
	let a = r.join(i);
	return n.style === "label" || n.style === "matrix" ? `${i}${a}` : a;
}
function G(e, t, n) {
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
	for (let r of t) n.style === "simple" || n.style === "label" ? i.push(n.allowReserved === !0 ? r : encodeURIComponent(r)) : i.push(U(e, r, n));
	return n.style === "label" || n.style === "matrix" ? `${r}${i.join(r)}` : i.join(r);
}
function K(e) {
	return function(t) {
		let n = [];
		if (t && typeof t == "object") for (let r in t) {
			let i = t[r];
			if (i != null) {
				if (Array.isArray(i)) {
					if (i.length === 0) continue;
					n.push(G(r, i, {
						style: "form",
						explode: !0,
						...e?.array,
						allowReserved: e?.allowReserved || !1
					}));
					continue;
				}
				if (typeof i == "object") {
					n.push(W(r, i, {
						style: "deepObject",
						explode: !0,
						...e?.object,
						allowReserved: e?.allowReserved || !1
					}));
					continue;
				}
				n.push(U(r, i, e));
			}
		}
		return n.join("&");
	};
}
function q(e, t) {
	let n = e;
	for (let r of e.match(B) ?? []) {
		let e = r.substring(1, r.length - 1), i = !1, a = "simple";
		if (e.endsWith("*") && (i = !0, e = e.substring(0, e.length - 1)), e.startsWith(".") ? (a = "label", e = e.substring(1)) : e.startsWith(";") && (a = "matrix", e = e.substring(1)), !t || t[e] === void 0 || t[e] === null) continue;
		let o = t[e];
		if (Array.isArray(o)) {
			n = n.replace(r, G(e, o, {
				style: a,
				explode: i
			}));
			continue;
		}
		if (typeof o == "object") {
			n = n.replace(r, W(e, o, {
				style: a,
				explode: i
			}));
			continue;
		}
		if (a === "matrix") {
			n = n.replace(r, `;${U(e, o)}`);
			continue;
		}
		n = n.replace(r, a === "label" ? `.${encodeURIComponent(o)}` : encodeURIComponent(o));
	}
	return n;
}
function J(e, t) {
	return e instanceof FormData ? e : t && (t.get instanceof Function ? t.get("Content-Type") ?? t.get("content-type") : t["Content-Type"] ?? t["content-type"]) === "application/x-www-form-urlencoded" ? new URLSearchParams(e).toString() : JSON.stringify(e);
}
function Y(e, t) {
	let n = `${t.baseUrl}${e}`;
	t.params?.path && (n = t.pathSerializer(n, t.params.path));
	let r = t.querySerializer(t.params.query ?? {});
	return r.startsWith("?") && (r = r.substring(1)), r && (n += `?${r}`), n;
}
function X(...e) {
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
function ne(e) {
	return e.endsWith("/") ? e.substring(0, e.length - 1) : e;
}
//#endregion
//#region ../agentflow-sdk/dist/app/revision.js
var Z = class {
	#e = /* @__PURE__ */ new Set();
	observe(e) {
		if (e === null) return;
		let t = Number(e.trim());
		if (!(!Number.isSafeInteger(t) || t < 0)) for (let e of this.#e) e(t);
	}
	listen(e) {
		return this.#e.add(e), () => this.#e.delete(e);
	}
}, re = /* @__PURE__ */ new WeakMap(), ie = (e, t) => re.set(e, t), ae = (e) => re.get(e), oe = [
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
		path: "/app/agents/activity",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/app/notification-preferences",
		idempotent: !1
	},
	{
		method: "PUT",
		path: "/app/notification-preferences",
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
		path: "/entities/{entity_id}/records/{record_id}/runs",
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
		path: "/instances/{instance_id}/trace",
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
], se = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}", Q = oe.map((e) => ({
	op: e,
	re: RegExp("^" + e.path.replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace(/\{[^}]+\}/g, se) + "$")
}));
function ce(e, t) {
	let n = e.toUpperCase();
	return Q.find((e) => e.op.method === n && e.re.test(t))?.op;
}
//#endregion
//#region ../agentflow-sdk/dist/fetch.js
var $ = /* @__PURE__ */ new Set([429, 503]), le = /* @__PURE__ */ new Set([
	"GET",
	"HEAD",
	"OPTIONS"
]), ue = 1e3, de = 30;
function fe(e) {
	let t = e.headers.get("retry-after")?.trim();
	if (!t) return ue;
	let n = Number(t);
	return Number.isFinite(n) && n >= 0 ? Math.min(n, de) * 1e3 : ue;
}
function pe(e) {
	let t = new URL(e.baseUrl), n = e.fetch;
	return async (r) => {
		let i = new URL(r.url).pathname.slice(t.pathname.replace(/\/$/, "").length), a = ce(r.method, i), o = new Headers(r.headers);
		for (let [t, n] of Object.entries(await e.auth.headers())) o.set(t, n);
		a?.idempotent && !o.has("idempotency-key") && o.set("idempotency-key", crypto.randomUUID());
		let s = new Request(r, {
			headers: o,
			credentials: e.auth.credentials
		}), c = le.has(s.method) || o.has("idempotency-key");
		for (let t = 0;; t++) {
			let r = await n(s.clone());
			if (!($.has(r.status) || r.status === 409 && (await r.clone().json().catch(() => ({})))?.type === "IDEMPOTENCY_KEY_IN_PROGRESS") || !c || t >= e.maxRetries) return e.onRevision?.(r.headers.get("agentflow-app-revision")), r;
			await new Promise((e) => setTimeout(e, fe(r)));
		}
	};
}
//#endregion
//#region ../agentflow-sdk/dist/client.js
function me(e) {
	let t = new Z(), n = H({
		baseUrl: e.baseUrl,
		fetch: pe({
			baseUrl: e.baseUrl,
			auth: e.auth,
			fetch: e.fetch ?? globalThis.fetch,
			maxRetries: e.maxRetries ?? 3,
			onRevision: (e) => t.observe(e)
		})
	});
	return ie(n, t), n;
}
//#endregion
//#region ../agentflow-sdk/dist/app/version.js
var he = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/;
function ge(e) {
	let t = typeof e == "string" ? he.exec(e) : null, n = t ? [
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
var _e = /^\d+$/;
function ve(e, t) {
	let n = _e.test(e), r = _e.test(t);
	return n && r ? Math.sign(Number(e) - Number(t)) : n ? -1 : r ? 1 : e < t ? -1 : +(e > t);
}
function ye(e, t) {
	let n = ge(e), r = ge(t);
	for (let e = 0; e < 3; e++) if (n.core[e] !== r.core[e]) return n.core[e] < r.core[e] ? -1 : 1;
	if (n.pre.length === 0 || r.pre.length === 0) return Math.sign(r.pre.length - n.pre.length);
	for (let e = 0; e < Math.min(n.pre.length, r.pre.length); e++) {
		let t = ve(n.pre[e], r.pre[e]);
		if (t !== 0) return t;
	}
	return Math.sign(n.pre.length - r.pre.length);
}
//#endregion
//#region ../agentflow-sdk/dist/app/objects.js
var be = 3e4, xe = [
	"own",
	"bound",
	"exported"
], Se = /* @__PURE__ */ new WeakMap();
function Ce(e, t = {}) {
	let n = Se.get(e);
	return n || (n = we(e, t.recheckAfterMs ?? be), Se.set(e, n)), n;
}
function we(e, t) {
	let n = null, r = !1, i = null, a = -1, o = 0, s = /* @__PURE__ */ new Set(), c = (e) => void e.catch(() => {});
	function l(t = !1) {
		if (i) return i;
		let u = (async () => {
			await Promise.resolve();
			try {
				let t = await z(e.GET("/app/objects"));
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
	ae(e)?.listen((e) => {
		a = Math.max(a, e), n && e > n.revision && (r = !0, s.size > 0 && c(l()));
	});
	let u = () => {
		globalThis.document?.visibilityState === "visible" && Date.now() - o >= t && c(l());
	};
	function d(e, t) {
		if (!n) throw Error("getAppObjects: call load() first");
		let r = n.objects.filter((t) => t.logical_key === e);
		if (t?.source) return r.find((e) => e.source === t.source) ?? null;
		for (let e of xe) {
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
			ye(t, t);
			let r = d(e, n);
			if (!r || r.state === "off" || r.contract_version == null) return !1;
			try {
				return ye(r.contract_version, t) >= 0;
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
async function* Te(e) {
	let t = /* @__PURE__ */ new Set(), n;
	do {
		let r = await e(n);
		if (yield* r.items, n = r.next_cursor ?? void 0, n !== void 0 && t.has(n)) break;
		n !== void 0 && t.add(n);
	} while (n);
}
//#endregion
//#region ../agentflow-sdk/dist/modules/tokens.js
var Ee = {
	"--af-warning": "oklch(0.666 0.179 58.318)",
	"--af-success": "oklch(0.596 0.145 163.225)",
	"--af-radius": "0.625rem",
	"--af-font-sans": "ui-sans-serif, system-ui, sans-serif",
	"--af-font-mono": "ui-monospace, SFMono-Regular, Menlo, monospace"
};
({ ...Ee }), { ...Ee };
//#endregion
//#region src/base-path.ts
var De = "/agentflow", Oe = /^\/(?!\/)/;
function ke(e) {
	try {
		return new URL(e, location.origin).origin === location.origin;
	} catch {
		return !1;
	}
}
function Ae(e) {
	return e == null ? De : Oe.test(e) && ke(e) ? e.replace(/\/+$/, "") : (console.warn(`agentflow: base-path ${JSON.stringify(e)} is not a path on this origin; using ${De}.`), De);
}
//#endregion
//#region src/context.ts
var je = "context-request", Me = "agentflow-provider-ready", Ne = "agentflow";
function Pe(e) {
	let t = e;
	return t.context === Ne && typeof t.callback == "function";
}
function Fe(e, t) {
	let n, r = () => {
		let r = Object.assign(new Event(je, {
			bubbles: !0,
			composed: !0
		}), {
			context: Ne,
			subscribe: !0,
			callback: (e, r) => {
				n = r, t(e);
			}
		});
		e.dispatchEvent(r);
	}, i = () => {
		n || r();
	};
	return window.addEventListener(Me, i), r(), () => {
		window.removeEventListener(Me, i), n?.();
	};
}
function Ie(e) {
	typeof reportError == "function" ? reportError(e) : console.error(e);
}
function Le(e, t, n) {
	try {
		e(t, n);
	} catch (e) {
		Ie(e);
	}
}
function Re(e, t) {
	let n = t, r = /* @__PURE__ */ new Set(), i = (e) => {
		if (!Pe(e)) return;
		e.stopPropagation();
		let t = e.callback;
		e.subscribe && r.add(t), Le(t, n, () => r.delete(t));
	};
	return e.addEventListener(je, i), window.dispatchEvent(new Event(Me)), {
		set(e) {
			n = e;
			for (let e of [...r]) Le(e, n, () => r.delete(e));
		},
		dispose() {
			e.removeEventListener(je, i), r.clear();
		}
	};
}
//#endregion
//#region src/errors.ts
var ze = "APP_KEY_MISSING", Be = /* @__PURE__ */ new Set([
	"APP_NOT_ASSIGNED",
	"APP_NOT_INSTALLED",
	"USER_NOT_PROJECTED"
]);
function Ve(e) {
	let t = e;
	return typeof t == "object" && !!t && typeof t.status == "number" && typeof t.code == "string";
}
var He = (e) => typeof e == "object" && !!e && typeof e.path == "string" && typeof e.message == "string";
function Ue(e) {
	if (Ve(e)) {
		if (e.status === 401) return { type: "signed-out" };
		if (e.status === 403 && Be.has(e.code)) return {
			type: "access-lost",
			code: e.code
		};
		let t = {
			code: e.code,
			status: e.status
		};
		return typeof e.detail == "string" && (t.detail = e.detail), typeof e.requestId == "string" && (t.requestId = e.requestId), Array.isArray(e.fieldErrors) && (t.fieldErrors = e.fieldErrors.filter(He).map(({ path: e, message: t }) => ({
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
var We = {
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
		"task.sign": "Sign",
		"task.claimed_by": "Claimed by {name}",
		"task.claimed_by_someone": "Someone else is working on this task.",
		"task.withheld": "Only the people this task is assigned to can see its form.",
		"task.done": "This task is complete.",
		"task.cancelled": "This task was withdrawn.",
		"task.signed_waiting": "This task is signed and waiting on the workflow's owner to finish it.",
		"task.no_actions": "There is no decision you can make on this task right now.",
		"task.sign_elsewhere": "Signing this task isn't available here. Open it in AgentFlow to sign.",
		"task.sign_in_dialog": "You fill in this form and sign it in AgentFlow's signing dialog, which also offers this task's other decisions.",
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
		"task.sign": "Ký",
		"task.claimed_by": "Đã được {name} nhận",
		"task.claimed_by_someone": "Người khác đang xử lý công việc này.",
		"task.withheld": "Chỉ những người được giao công việc này mới xem được biểu mẫu.",
		"task.done": "Công việc đã hoàn tất.",
		"task.cancelled": "Công việc này đã bị rút lại.",
		"task.signed_waiting": "Công việc này đã được ký và đang chờ chủ sở hữu quy trình hoàn tất.",
		"task.no_actions": "Hiện bạn không có quyết định nào để thực hiện cho công việc này.",
		"task.sign_elsewhere": "Không thể ký công việc này ở đây. Hãy mở công việc trong AgentFlow để ký.",
		"task.sign_in_dialog": "Bạn điền biểu mẫu này và ký trong hộp thoại ký của AgentFlow, nơi cũng có các quyết định khác của công việc này.",
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
function Ge(e, t) {
	return e === "en" || e === "vi" ? e : t?.toLowerCase().startsWith("vi") ? "vi" : "en";
}
function Ke(e, t) {
	return (n, r) => (t[n] ?? We[e][n] ?? n).replace(/\{(\w+)\}/g, (e, t) => r && t in r ? String(r[t]) : e);
}
//#endregion
//#region src/props.ts
var qe = /* @__PURE__ */ new Set();
function Je(e, t) {
	typeof t == "string" && !qe.has(e) && (qe.add(e), console.warn(`agentflow: \`${e}\` is a property, not an attribute; set it from JavaScript.`));
}
function Ye(e, t) {
	if (typeof e == "object" && e && !Array.isArray(e)) return e;
	Je(t, e);
}
function Xe(e) {
	let t = e == null ? NaN : Math.trunc(Number(e));
	return Number.isNaN(t) ? 25 : Math.min(200, Math.max(1, t));
}
function Ze(e, t) {
	if (typeof e == "function") return e;
	Je(t, e);
}
function Qe(e, t) {
	if (typeof e == "object" && e && typeof e.GET == "function") return e;
	e != null && (typeof e == "string" ? Je(t, e) : qe.has(t) || (qe.add(t), console.warn(`agentflow: \`${t}\` is not an AgentFlow client; ignoring it.`)));
}
//#endregion
//#region src/elements/Provider.svelte
function $e(t, r) {
	M(r, !0);
	let i = D(r, "basePath", 7, De), a = D(r, "locale", 7, void 0), o = D(r, "strings", 23, () => ({})), c = D(r, "fetchImpl", 7, void 0), d = D(r, "signing", 7, void 0), f = D(r, "client", 7, void 0), p = r.$$host, h = C("loading"), _ = C(null), y = g(() => Qe(f(), "client") ?? me({
		baseUrl: `${location.origin}${Ae(i())}/api`,
		auth: L(),
		fetch: Ze(c(), "fetchImpl") ?? globalThis.fetch.bind(globalThis)
	})), b = !1, x = (e, t) => {
		b || p.dispatchEvent(new CustomEvent(e, {
			detail: t,
			bubbles: !0,
			composed: !0
		}));
	};
	function S(t) {
		b || (e(h, t, !0), p.dataset.state = t);
	}
	p.dataset.state = "loading";
	function w(e, t) {
		let n = Ue(e);
		return n.type === "signed-out" ? (m(h) !== "signed-out" && (S("signed-out"), x("signed-out", {})), null) : n.type === "access-lost" ? (m(h) !== "access-lost" && (S("access-lost"), x("access-lost", { code: n.code })), null) : (t && S("error"), x("request-failed", {
			code: n.problem.code,
			status: n.problem.status,
			detail: n.problem.detail,
			requestId: n.problem.requestId
		}), n.problem);
	}
	function T(e) {
		let t = e;
		return t?.name === "AppKeyMissing" && typeof t.kind == "string" && typeof t.key == "string" ? {
			code: ze,
			status: 0,
			detail: m(O).t("notInstalled", { key: `${t.kind}:${t.key}` })
		} : w(e, !1);
	}
	let E = A(() => Ge(a(), typeof navigator > "u" ? void 0 : navigator.language)), O = A(() => ({
		state: m(h),
		caller: m(_),
		client: y,
		signing: Ye(d(), "signing") ?? null,
		locale: m(E),
		t: Ke(m(E), Ye(o(), "strings") ?? {}),
		report: T
	})), k = Re(p, g(() => m(O)));
	s(() => k.set(m(O))), s(() => () => {
		b = !0, k.dispose();
	}), (async () => {
		try {
			let t = await z(y.GET("/caller"));
			e(_, t, !0), S("ready"), x("session-ready", { caller: t });
		} catch (e) {
			w(e, !0);
		}
	})();
	var j = {
		get basePath() {
			return i();
		},
		set basePath(e = De) {
			i(e), P();
		},
		get locale() {
			return a();
		},
		set locale(e = void 0) {
			a(e), P();
		},
		get strings() {
			return o();
		},
		set strings(e = {}) {
			o(e), P();
		},
		get fetchImpl() {
			return c();
		},
		set fetchImpl(e = void 0) {
			c(e), P();
		},
		get signing() {
			return d();
		},
		set signing(e = void 0) {
			d(e), P();
		},
		get client() {
			return f();
		},
		set client(e = void 0) {
			f(e), P();
		}
	}, N = u(), F = v(N);
	return n(F, r, "default", {}, null), l(t, N), ee(j);
}
j($e, {
	basePath: {
		attribute: "base-path",
		type: "String"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: {},
	fetchImpl: {},
	signing: {},
	client: {}
}, ["default"], [], { mode: "open" });
//#endregion
//#region src/FieldList.svelte
var et = i("<span class=\"req svelte-olgbsr\">*</span>"), tt = i("<input part=\"input\" type=\"checkbox\" class=\"svelte-olgbsr\"/>"), nt = i("<option> </option>"), rt = i("<select part=\"input\" class=\"svelte-olgbsr\"><option>—</option><!></select>"), it = i("<p part=\"notice\" class=\"muted svelte-olgbsr\"> </p>"), at = i("<input part=\"input\" class=\"svelte-olgbsr\"/>"), ot = i("<p class=\"muted svelte-olgbsr\"> </p>"), st = i("<p part=\"field-error\" class=\"error svelte-olgbsr\" role=\"alert\"> </p>"), ct = i("<div part=\"field\" class=\"field svelte-olgbsr\"><label part=\"label\" class=\"svelte-olgbsr\"> <!></label> <!> <!> <!></div>"), lt = {
	hash: "svelte-olgbsr",
	code: ".field.svelte-olgbsr {display:grid;gap:4px;margin-block-end:var(--agentflow-gap, 12px);}label.svelte-olgbsr {font-weight:600;}.req.svelte-olgbsr {color:var(--agentflow-danger, #b42318);}.muted.svelte-olgbsr {color:var(--agentflow-muted, #667085);margin:0;font-size:0.9em;}.error.svelte-olgbsr {color:var(--agentflow-danger, #b42318);margin:0;}input.svelte-olgbsr, select.svelte-olgbsr {font:inherit;padding:6px 8px;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);}"
};
function ut(e, t) {
	M(t, !0), b(e, lt);
	let n = D(t, "fields", 7), i = D(t, "values", 31, () => d({})), s = D(t, "errors", 23, () => ({})), f = D(t, "disabled", 7, !1), h = D(t, "t", 7), g = {
		text: "text",
		email: "email",
		date: "date",
		datetime: "datetime-local",
		number: "number",
		integer: "number"
	};
	var C = {
		get fields() {
			return n();
		},
		set fields(e) {
			n(e), P();
		},
		get values() {
			return i();
		},
		set values(e = {}) {
			i(e), P();
		},
		get errors() {
			return s();
		},
		set errors(e = {}) {
			s(e), P();
		},
		get disabled() {
			return f();
		},
		set disabled(e = !1) {
			f(e), P();
		},
		get t() {
			return h();
		},
		set t(e) {
			h(e), P();
		}
	}, k = u(), A = v(k);
	return p(A, 17, n, (e) => e.key, (e, t) => {
		var n = ct(), u = o(n), d = o(u, !0), v = y(d), b = (e) => {
			var t = et();
			a((e) => w(t, "title", e), [() => h()("form.required")]), l(e, t);
		};
		r(v, (e) => {
			m(t).required && e(b);
		}), F(u);
		var C = y(u, 2), D = (e) => {
			var n = tt();
			S(n), a(() => {
				w(n, "id", `f-${m(t).key}`), n.disabled = f();
			}), x(n, () => i()[m(t).key], (e) => i(i()[m(t).key] = e, !0)), l(e, n);
		}, k = (e) => {
			var n = rt(), r = o(n);
			r.value = r.__value = "";
			var s = y(r);
			p(s, 17, () => m(t).options ?? [], (e) => e.value, (e, t) => {
				var n = nt(), r = _(n, !0), i = {};
				a(() => {
					c(r, m(t).label), i !== (i = m(t).value) && (n.value = (n.__value = i) ?? "");
				}), l(e, n);
			}), F(n), T(n), a(() => {
				w(n, "id", `f-${m(t).key}`), n.disabled = f();
			}), E(n, () => i()[m(t).key], (e) => i(i()[m(t).key] = e, !0)), l(e, n);
		}, A = (e) => {
			var t = it(), n = _(t, !0);
			a((e) => c(n, e), [() => h()("form.unsupported")]), l(e, t);
		}, ee = (e) => {
			var n = at();
			S(n), a(() => {
				w(n, "id", `f-${m(t).key}`), w(n, "type", g[m(t).kind]), w(n, "step", m(t).kind === "integer" ? "1" : m(t).kind === "number" ? "any" : void 0), n.disabled = f();
			}), O(n, () => i()[m(t).key], (e) => i(i()[m(t).key] = e, !0)), l(e, n);
		};
		r(C, (e) => {
			m(t).kind === "boolean" ? e(D) : m(t).kind === "choice" ? e(k, 1) : m(t).kind === "unsupported" ? e(A, 2) : e(ee, -1);
		});
		var j = y(C, 2), M = (e) => {
			var n = ot(), r = _(n, !0);
			a(() => c(r, m(t).description)), l(e, n);
		};
		r(j, (e) => {
			m(t).description && e(M);
		});
		var N = y(j, 2), P = (e) => {
			var n = st(), r = _(n, !0);
			a(() => c(r, s()[m(t).key])), l(e, n);
		};
		r(N, (e) => {
			s()[m(t).key] && e(P);
		}), F(n), a(() => {
			w(u, "for", `f-${m(t).key}`), c(d, m(t).label);
		}), l(e, n);
	}), l(e, k), ee(C);
}
j(ut, {
	fields: {},
	values: {},
	errors: {},
	disabled: {},
	t: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/app-keys.ts
var dt = class extends Error {
	kind;
	key;
	constructor(e, t) {
		super(`${e}:${t} is not installed`), this.kind = e, this.key = t, this.name = "AppKeyMissing";
	}
};
async function ft(e, t, n) {
	let r = Ce(e);
	await r.load();
	let i = r.id(`${t}:${n}`);
	if (i === null) throw new dt(t, n);
	return i;
}
//#endregion
//#region src/format.ts
var pt = /^\d{4}-\d{2}-\d{2}$/, mt = /^\d{4}-\d{2}-\d{2}T/;
function ht(e, t) {
	if (!e) return "";
	if (pt.test(e)) {
		let [n, r, i] = e.split("-").map(Number), a = new Date(n, r - 1, i);
		return a.getFullYear() !== n || a.getMonth() !== r - 1 || a.getDate() !== i ? "" : new Intl.DateTimeFormat(t, { dateStyle: "medium" }).format(a);
	}
	let n = new Date(e);
	return Number.isNaN(n.getTime()) ? "" : new Intl.DateTimeFormat(t, {
		dateStyle: "medium",
		timeStyle: "short"
	}).format(n);
}
function gt(e, t, n) {
	if (e == null) return "";
	if (typeof e == "boolean") return n(e ? "common.yes" : "common.no");
	if (typeof e == "number") return new Intl.NumberFormat(t, { maximumSignificantDigits: 15 }).format(e);
	if (typeof e == "string") return (pt.test(e) || mt.test(e)) && ht(e, t) || e;
	if (Array.isArray(e)) return e.map((e) => gt(e, t, n)).join(", ");
	let r = JSON.stringify(e);
	return r.length > 80 ? `${r.slice(0, 79)}…` : r;
}
//#endregion
//#region src/form.ts
var _t = (e) => typeof e == "object" && !!e && !Array.isArray(e);
function vt(e) {
	let t = e.type;
	if (typeof t == "string") return t;
	if (Array.isArray(t)) return t.find((e) => e !== "null");
}
function yt(e) {
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
function bt(e) {
	if (Array.isArray(e.oneOf)) {
		let t = e.oneOf.filter((e) => !(_t(e) && e.const === null)), n = [];
		for (let e of t) {
			if (!_t(e) || typeof e.const != "string") return { kind: "unsupported" };
			n.push({
				value: e.const,
				label: typeof e.title == "string" ? e.title : e.const
			});
		}
		return n.length > 0 ? yt(n) : { kind: "unsupported" };
	}
	if (Array.isArray(e.enum)) {
		if (!e.enum.every((e) => typeof e == "string" || e === null)) return { kind: "unsupported" };
		let t = e.enum.filter((e) => typeof e == "string");
		return t.length > 0 ? yt(t.map((e) => ({
			value: e,
			label: e
		}))) : { kind: "unsupported" };
	}
	let t = vt(e);
	if (t === "string") switch (e.format) {
		case void 0: return { kind: "text" };
		case "date": return { kind: "date" };
		case "date-time": return { kind: "datetime" };
		case "email": return { kind: "email" };
		default: return { kind: "unsupported" };
	}
	return t === "number" ? { kind: "number" } : t === "integer" ? { kind: "integer" } : t === "boolean" ? { kind: "boolean" } : { kind: "unsupported" };
}
var xt = /^#\/properties\/([^/]+)$/;
function St(e, t = []) {
	if (!_t(e)) return t;
	if (e.type === "Control" && typeof e.scope == "string") {
		let n = xt.exec(e.scope)?.[1];
		n !== void 0 && t.push(n);
	}
	if (Array.isArray(e.elements)) for (let n of e.elements) St(n, t);
	return t;
}
function Ct(e, t) {
	if (!_t(e) || !_t(e.properties)) return [];
	let n = e.properties, r = new Set(Array.isArray(e.required) ? e.required : []), i = (e) => typeof e == "string" && Object.hasOwn(n, e), a = Array.isArray(e["x-order"]) ? e["x-order"].filter(i) : [];
	return [.../* @__PURE__ */ new Set([
		...St(t).filter(i),
		...a,
		...Object.keys(n)
	])].map((e) => {
		let t = _t(n[e]) ? n[e] : {}, i = {
			key: e,
			label: typeof t.title == "string" ? t.title : e,
			required: r.has(e),
			...bt(t)
		};
		return typeof t.description == "string" && (i.description = t.description), i;
	});
}
var wt = (e) => String(e).padStart(2, "0");
function Tt(e) {
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? "" : `${t.getFullYear()}-${wt(t.getMonth() + 1)}-${wt(t.getDate())}T${wt(t.getHours())}:${wt(t.getMinutes())}`;
}
function Et(e, t) {
	let n = _t(t) ? t : {}, r = {};
	for (let t of e) {
		let e = n[t.key];
		t.kind === "boolean" ? r[t.key] = e === !0 : t.kind === "datetime" ? r[t.key] = typeof e == "string" ? Tt(e) : "" : t.kind === "unsupported" ? r[t.key] = e : r[t.key] = e ?? "";
	}
	return r;
}
var Dt = (e) => e == null || e === "";
function Ot(e, t) {
	let n = {};
	for (let r of e) {
		let e = t[r.key];
		if (r.kind === "boolean") {
			n[r.key] = e === !0;
			continue;
		}
		Dt(e) || (r.kind === "number" || r.kind === "integer" ? n[r.key] = Number(e) : r.kind === "datetime" ? n[r.key] = new Date(String(e)).toISOString() : n[r.key] = e);
	}
	return n;
}
function kt(e, t) {
	return e.filter((e) => e.required && e.kind !== "boolean" && e.kind !== "unsupported" && Dt(t[e.key])).map((e) => e.key);
}
function At(e) {
	return e.filter((e) => e.required && e.kind === "unsupported");
}
function jt(e) {
	let t = {};
	for (let n of e ?? []) {
		let e = n.path.replace(/^\//, "").split("/")[0] ?? "";
		t[e] ??= n.message;
	}
	return t;
}
//#endregion
//#region src/use-agentflow.svelte.ts
function Mt(t) {
	let n = C(null);
	return s(() => Fe(t, (t) => e(n, t))), { get current() {
		return m(n);
	} };
}
//#endregion
//#region src/elements/RecordTable.svelte
var Nt = i("<form part=\"search\" role=\"search\"><input type=\"search\" class=\"svelte-1xcrvv6\"/></form>"), Pt = i("<button part=\"create-button\" type=\"button\" class=\"svelte-1xcrvv6\"> </button>"), Ft = i("<div part=\"toolbar\" class=\"svelte-1xcrvv6\"><!> <!></div>"), It = i("<p part=\"notice\" class=\"error svelte-1xcrvv6\"> </p>"), Lt = i("<form part=\"form\"><!> <!> <div part=\"actions\" class=\"svelte-1xcrvv6\"><button part=\"button\" type=\"button\" class=\"secondary svelte-1xcrvv6\"> </button> <button part=\"button\" type=\"button\" class=\"svelte-1xcrvv6\"> </button></div></form>"), Rt = i("<br/> ", 1), zt = i("<p part=\"error\" class=\"error svelte-1xcrvv6\" role=\"alert\"><!> <!></p>"), Bt = i("<p part=\"empty\" class=\"muted svelte-1xcrvv6\"> </p>"), Vt = i("<th class=\"svelte-1xcrvv6\"> </th>"), Ht = i("<td part=\"cell\" class=\"svelte-1xcrvv6\"> </td>"), Ut = i("<tr part=\"row\" tabindex=\"0\" class=\"svelte-1xcrvv6\"></tr>"), Wt = i("<table part=\"table\" class=\"svelte-1xcrvv6\"><thead><tr></tr></thead><tbody></tbody></table>"), Gt = i("<p class=\"muted svelte-1xcrvv6\"> </p>"), Kt = i("<button part=\"load-more\" type=\"button\" class=\"svelte-1xcrvv6\"> </button>"), qt = i("<!> <!> <!> <!> <!> <!>", 1), Jt = {
	hash: "svelte-1xcrvv6",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}[part='toolbar'].svelte-1xcrvv6 {display:flex;gap:8px;justify-content:space-between;margin-block-end:var(--agentflow-gap, 12px);}input[type='search'].svelte-1xcrvv6 {font:inherit;padding:6px 8px;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);}table.svelte-1xcrvv6 {width:100%;border-collapse:collapse;}th.svelte-1xcrvv6, td.svelte-1xcrvv6 {text-align:start;padding:8px;border-block-end:1px solid var(--agentflow-border, #eaecf0);}tr[part='row'].svelte-1xcrvv6 {cursor:pointer;}tr[part='row'].svelte-1xcrvv6:hover, tr[part='row'].svelte-1xcrvv6:focus {background:color-mix(in srgb, var(--agentflow-accent, #1570ef) 8%, transparent);}.muted.svelte-1xcrvv6 {color:var(--agentflow-muted, #667085);}.error.svelte-1xcrvv6 {color:var(--agentflow-danger, #b42318);}[part='actions'].svelte-1xcrvv6 {display:flex;gap:8px;}button.svelte-1xcrvv6 {font:inherit;padding:6px 14px;cursor:pointer;border-radius:var(--agentflow-radius, 6px);border:1px solid var(--agentflow-accent, #1570ef);background:var(--agentflow-accent, #1570ef);color:var(--agentflow-accent-text, #fff);}button.secondary.svelte-1xcrvv6, [part='load-more'].svelte-1xcrvv6 {background:transparent;color:var(--agentflow-accent, #1570ef);}button.svelte-1xcrvv6:disabled {opacity:0.5;cursor:default;}"
};
function Yt(n, i) {
	M(i, !0), b(n, Jt);
	let x = D(i, "entityId", 7), T = D(i, "entityKey", 7), E = D(i, "columns", 7), k = D(i, "pageSize", 7), j = D(i, "filter", 7), N = i.$$host, I = Mt(N), L = A(() => I.current?.state === "ready"), R = C(null), B = A(() => x() || m(R)), V = A(() => Ye(j(), "filter")), te = A(() => m(V) ? JSON.stringify(m(V)) : ""), H = A(() => Xe(k())), U = C(null), W = C(d([])), G = C(null), K = C(""), q = C(!1), J = C(!1), Y = C(null), X = C(null), ne = C(!1), Z = C(!1), re = C(d({})), ie = C(d({})), ae = A(() => At(m(X) ?? [])), oe = A(() => {
		if (!m(U)) return [];
		let e = E()?.split(",").map((e) => e.trim()).filter(Boolean);
		return e?.length ? e.map((e) => m(U).fields.find((t) => t.key === e)).filter((e) => !!e) : m(U).fields.filter((e) => !e.system).slice(0, 5);
	}), se = (e, t) => N.dispatchEvent(new CustomEvent(e, {
		detail: t,
		bubbles: !0,
		composed: !0
	})), Q = 0, ce = 0;
	async function $(t) {
		let n = I.current;
		if (!n) return;
		let r = Q, i;
		try {
			i = await z(n.client.GET("/entities/{entity_id}", { params: { path: { entity_id: t } } }));
		} catch (t) {
			let i = n.report(t);
			r === Q && e(Y, i, !0);
			return;
		}
		if (r === Q && (e(U, i, !0), i.effective_capabilities?.write)) try {
			let i = await z(n.client.GET("/entities/{entity_id}/create-form", { params: { path: { entity_id: t } } }));
			r === Q && e(X, Ct(i.schema_json, i.ui_schema_json), !0);
		} catch (t) {
			let i = t?.status;
			if (i === 403 || i === 404) return;
			let a = n.report(t);
			r === Q && e(Y, a, !0);
		}
	}
	async function le(t) {
		let n = I.current, r = m(B);
		if (!n || !r || !m(U)) return;
		let i = ++ce;
		e(J, !0), e(Y, null), t || e(G, null);
		try {
			let a = { entity_id: r }, o = m(V) ? await z(n.client.POST("/entities/{entity_id}/records/query", {
				params: { path: a },
				body: {
					filter: m(V),
					limit: m(H),
					cursor: t
				}
			})) : await z(n.client.GET("/entities/{entity_id}/records", { params: {
				path: a,
				query: {
					limit: m(H),
					cursor: t,
					q: m(K) || void 0
				}
			} }));
			if (i !== ce) return;
			e(W, t ? [...m(W), ...o.items] : o.items, !0), e(G, o.next_cursor, !0), e(q, !0);
		} catch (r) {
			let a = n.report(r);
			i === ce && (e(Y, a, !0), t || e(W, [], !0));
		} finally {
			i === ce && e(J, !1);
		}
	}
	function ue() {
		e(re, Et(m(X) ?? [], {}), !0), e(ie, {}, !0), e(ne, !0);
	}
	async function de() {
		let t = I.current, n = m(B);
		if (!t || !n || !m(X) || m(Z) || m(ae).length > 0) return;
		let r = kt(m(X), m(re));
		if (r.length > 0) {
			e(ie, Object.fromEntries(r.map((e) => [e, t.t("form.required")])), !0);
			return;
		}
		let i = Q;
		e(Z, !0), e(Y, null), e(ie, {}, !0);
		let a;
		try {
			a = await z(t.client.POST("/entities/{entity_id}/records", {
				params: { path: { entity_id: n } },
				body: { form_payload: Ot(m(X), m(re)) }
			}));
		} catch (n) {
			let r = t.report(n);
			if (i !== Q) return;
			e(Z, !1), e(ie, jt(r?.fieldErrors), !0), e(Y, r, !0);
			return;
		}
		se("record-created", { recordId: a.id }), i === Q && (e(Z, !1), e(ne, !1), await le());
	}
	s(() => {
		x(), T(), e(R, null);
	}), s(() => {
		m(B), T(), Q++, ce++, e(U, null), e(X, null), e(K, ""), e(ne, !1), e(Z, !1), e(W, [], !0), e(G, null), e(q, !1), e(J, !1), e(Y, null);
	}), s(() => {
		if (!m(L) || x() || !T()) return;
		let t = T();
		g(async () => {
			let n = I.current;
			if (!n) return;
			let r = Q;
			try {
				let i = await ft(n.client, "entity", t);
				r === Q && e(R, i, !0);
			} catch (t) {
				let i = n.report(t);
				r === Q && e(Y, i, !0);
			}
		});
	}), s(() => {
		if (!m(L) || !m(B)) return;
		let e = m(B);
		g(() => $(e));
	}), s(() => {
		m(L) && m(U) && (m(te), m(H), g(() => le()));
	});
	var fe = {
		get entityId() {
			return x();
		},
		set entityId(e) {
			x(e), P();
		},
		get entityKey() {
			return T();
		},
		set entityKey(e) {
			T(e), P();
		},
		get columns() {
			return E();
		},
		set columns(e) {
			E(e), P();
		},
		get pageSize() {
			return k();
		},
		set pageSize(e) {
			k(e), P();
		},
		get filter() {
			return j();
		},
		set filter(e) {
			j(e), P();
		}
	}, pe = u(), me = v(pe), he = (n) => {
		let i = A(() => I.current.t);
		var s = qt(), u = v(s), d = (n) => {
			var s = Ft(), u = o(s), d = (t) => {
				var n = Nt(), r = o(n);
				S(r), F(n), a((e, t) => {
					w(r, "placeholder", e), w(r, "aria-label", t);
				}, [() => m(i)("records.search"), () => m(i)("records.search")]), h("submit", n, (e) => {
					e.preventDefault(), le();
				}), O(r, () => m(K), (t) => e(K, t)), l(t, n);
			};
			r(u, (e) => {
				m(V) || e(d);
			});
			var f = y(u, 2), p = (e) => {
				var n = Pt(), r = _(n, !0);
				a((e) => c(r, e), [() => m(i)("records.create")]), t("click", n, ue), l(e, n);
			};
			r(f, (e) => {
				m(X) && !m(ne) && e(p);
			}), F(s), l(n, s);
		};
		r(u, (e) => {
			m(U) && e(d);
		});
		var g = y(u, 2), b = (n) => {
			var s = Lt(), u = o(s);
			ut(u, {
				get fields() {
					return m(X);
				},
				get errors() {
					return m(ie);
				},
				get disabled() {
					return m(Z);
				},
				get t() {
					return m(i);
				},
				get values() {
					return m(re);
				},
				set values(t) {
					e(re, t, !0);
				}
			});
			var d = y(u, 2), f = (e) => {
				var t = It(), n = _(t, !0);
				a((e) => c(n, e), [() => m(i)("form.unsupported_required")]), l(e, t);
			};
			r(d, (e) => {
				m(ae).length > 0 && e(f);
			});
			var p = y(d, 2), g = o(p), v = _(g, !0), b = y(g, 2), x = _(b, !0);
			F(p), F(s), a((e, t) => {
				c(v, e), b.disabled = m(Z) || m(ae).length > 0, c(x, t);
			}, [() => m(i)("common.cancel"), () => m(i)("records.save")]), h("submit", s, (e) => e.preventDefault()), t("click", g, () => e(ne, !1)), t("click", b, de), l(n, s);
		};
		r(g, (e) => {
			m(ne) && m(X) && e(b);
		});
		var x = y(g, 2), C = (e) => {
			var t = zt(), n = o(t), s = (e) => {
				var t = f();
				a(() => c(t, m(Y).detail)), l(e, t);
			}, u = (e) => {
				var t = f();
				a((e) => c(t, e), [() => m(i)("common.error", { code: m(Y).code })]), l(e, t);
			};
			r(n, (e) => {
				m(Y).code === "APP_KEY_MISSING" ? e(s) : e(u, -1);
			});
			var d = y(n, 2), p = (e) => {
				var t = Rt(), n = y(v(t), 1, !0);
				a((e) => c(n, e), [() => m(i)("common.request_id", { id: m(Y).requestId })]), l(e, t);
			};
			r(d, (e) => {
				m(Y).requestId && e(p);
			}), F(t), l(e, t);
		};
		r(x, (e) => {
			m(Y) && e(C);
		});
		var T = y(x, 2), E = (e) => {
			var t = Bt(), n = _(t, !0);
			a((e) => c(n, e), [() => m(i)("records.empty")]), l(e, t);
		}, D = (e) => {
			var n = Wt(), r = o(n), s = o(r);
			p(s, 21, () => m(oe), (e) => e.key, (e, t) => {
				var n = Vt(), r = _(n, !0);
				a(() => c(r, m(t).label)), l(e, n);
			}), F(s), F(r);
			var u = y(r);
			p(u, 21, () => m(W), (e) => e.id, (e, n) => {
				var r = Ut();
				p(r, 21, () => m(oe), (e) => e.key, (e, t) => {
					var r = Ht(), o = _(r, !0);
					a((e) => c(o, e), [() => gt(m(n).body[m(t).key], I.current.locale, m(i))]), l(e, r);
				}), F(r), t("click", r, () => se("record-select", { recordId: m(n).id })), t("keydown", r, (e) => e.key === "Enter" && se("record-select", { recordId: m(n).id })), l(e, r);
			}), F(u), F(n), l(e, n);
		};
		r(T, (e) => {
			m(q) && !m(J) && m(W).length === 0 && !m(Y) ? e(E) : m(W).length > 0 && e(D, 1);
		});
		var k = y(T, 2), ee = (e) => {
			var t = Gt(), n = _(t, !0);
			a((e) => c(n, e), [() => m(i)("common.loading")]), l(e, t);
		};
		r(k, (e) => {
			m(J) && e(ee);
		});
		var j = y(k, 2), M = (e) => {
			var n = Kt(), r = _(n, !0);
			a((e) => c(r, e), [() => m(i)("common.load_more")]), t("click", n, () => le(m(G) ?? void 0)), l(e, n);
		};
		r(j, (e) => {
			m(G) && !m(J) && e(M);
		}), l(n, s);
	};
	return r(me, (e) => {
		I.current && m(L) && e(he);
	}), l(n, pe), ee(fe);
}
I(["click", "keydown"]), j(Yt, {
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
var Xt = i("<br/> ", 1), Zt = i("<p part=\"error\" class=\"error svelte-1o3y7sj\" role=\"alert\"><!> <!></p>"), Qt = i("<p part=\"error\" class=\"error svelte-1o3y7sj\" role=\"alert\"> </p>"), $t = i("<option> </option>"), en = i("<label part=\"picker\" class=\"svelte-1o3y7sj\"> <select class=\"svelte-1o3y7sj\"><option>—</option><!></select></label>"), tn = i("<p class=\"muted svelte-1o3y7sj\"> </p>"), nn = i("<p part=\"notice\" role=\"status\"> </p>"), rn = i("<p part=\"notice\" class=\"error svelte-1o3y7sj\"> </p>"), an = i("<form part=\"form\"><!> <!> <div part=\"actions\"><button part=\"button\" type=\"button\" class=\"svelte-1o3y7sj\"> </button></div></form>"), on = i("<!> <!> <!> <!> <!>", 1), sn = {
	hash: "svelte-1o3y7sj",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}[part='picker'].svelte-1o3y7sj {display:grid;gap:4px;margin-block-end:var(--agentflow-gap, 12px);font-weight:600;}select.svelte-1o3y7sj {font:inherit;padding:6px 8px;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);}.muted.svelte-1o3y7sj {color:var(--agentflow-muted, #667085);}.error.svelte-1o3y7sj {color:var(--agentflow-danger, #b42318);}button.svelte-1o3y7sj {font:inherit;padding:6px 14px;cursor:pointer;border-radius:var(--agentflow-radius, 6px);border:1px solid var(--agentflow-accent, #1570ef);background:var(--agentflow-accent, #1570ef);color:var(--agentflow-accent-text, #fff);}button.svelte-1o3y7sj:disabled {opacity:0.5;cursor:default;}"
};
function cn(n, i) {
	M(i, !0), b(n, sn);
	let x = D(i, "workflowId", 7), S = D(i, "workflowKey", 7), w = "__name", O = i.$$host, k = Mt(O), j = A(() => k.current?.state === "ready"), N = C(null), I = A(() => x() || m(N)), L = A(() => !!x() || !!S()), R = C(null), B = C(d([])), V = C(""), te = C(!1), H = C(null), U = C(d([])), W = C(d({})), G = C(d({})), K = C(null), q = C(!1), J = C(!1), Y = C(!1), X = A(() => At(m(U))), ne = (e, t) => O.dispatchEvent(new CustomEvent(e, {
		detail: t,
		bubbles: !0,
		composed: !0
	})), Z = 0;
	function re() {
		Z++, e(H, null), e(U, [], !0), e(W, {}, !0), e(G, {}, !0), e(K, null), e(q, !1), e(J, !1), e(Y, !1);
	}
	async function ie(t) {
		let n = k.current;
		if (!n) return;
		let r = Z;
		e(Y, !0);
		let i = [];
		try {
			for await (let e of Te((e) => z(n.client.GET("/workflows/startable", { params: { query: e ? {
				limit: 100,
				cursor: e
			} : { limit: 100 } } })))) i.push(e);
		} catch (t) {
			let i = n.report(t);
			r === Z && (e(K, i, !0), e(Y, !1));
			return;
		}
		if (r !== Z || (e(Y, !1), e(B, i, !0), !t)) return;
		let a = i.find((e) => e.id === t);
		a ? await oe(a) : e(te, !0);
	}
	let ae = (e) => ({
		...Et(m(U), {}),
		[w]: e.name
	});
	async function oe(t) {
		let n = k.current;
		if (!n || (re(), !t)) return;
		let r = Z;
		e(Y, !0);
		let i;
		try {
			i = await z(n.client.GET("/workflow-versions/{version_id}/start-form", { params: { path: { version_id: t.version_id } } }));
		} catch (t) {
			let i = n.report(t);
			r === Z && (e(K, i, !0), e(Y, !1));
			return;
		}
		if (r !== Z) return;
		e(Y, !1);
		let a = {
			key: w,
			label: n.t("start.name"),
			kind: "text",
			required: !0
		};
		e(U, [a, ...Ct(i.form_definition?.schema_json, i.form_definition?.ui_schema_json)], !0), e(W, ae(t), !0), e(H, t, !0);
	}
	function se(t) {
		e(V, t, !0), oe(m(B).find((e) => e.id === t) ?? null);
	}
	async function Q() {
		let t = k.current, n = m(H);
		if (!t || !n || m(q) || m(X).length > 0) return;
		e(J, !1);
		let r = String(m(W)[w] ?? "").trim(), i = kt(m(U), {
			...m(W),
			[w]: r
		});
		if (i.length > 0) {
			e(G, Object.fromEntries(i.map((e) => [e, t.t("form.required")])), !0);
			return;
		}
		let a = Z;
		e(q, !0), e(K, null), e(G, {}, !0);
		let o;
		try {
			o = await z(t.client.POST("/workflows/{workflow_id}/instances", {
				params: { path: { workflow_id: n.id } },
				body: {
					name: r,
					version_id: n.version_id,
					input_payload: Ot(m(U).filter((e) => e.key !== w), m(W))
				}
			}));
		} catch (n) {
			let r = t.report(n);
			if (a !== Z) return;
			e(q, !1), e(G, jt(r?.fieldErrors), !0), e(K, r, !0);
			return;
		}
		ne("workflow-started", {
			instanceId: o.id,
			workflowId: n.id
		}), a === Z && (e(q, !1), e(W, ae(n), !0), e(J, !0));
	}
	s(() => {
		x(), S(), e(N, null), e(R, null);
	}), s(() => {
		m(I), S(), re(), e(B, [], !0), e(V, ""), e(te, !1);
	}), s(() => {
		if (!m(j) || x() || !S()) return;
		let t = S();
		g(async () => {
			let n = k.current;
			if (!n) return;
			let r = Z;
			try {
				let i = await ft(n.client, "workflow", t);
				r === Z && e(N, i, !0);
			} catch (t) {
				let i = n.report(t);
				r === Z && e(R, i, !0);
			}
		});
	}), s(() => {
		if (!m(j) || S() && !x() && !m(I)) return;
		let e = m(I);
		g(() => ie(e));
	});
	var ce = {
		get workflowId() {
			return x();
		},
		set workflowId(e) {
			x(e), P();
		},
		get workflowKey() {
			return S();
		},
		set workflowKey(e) {
			S(e), P();
		}
	}, $ = u(), le = v($), ue = (n) => {
		let i = A(() => k.current.t);
		var s = u(), d = v(s), g = (e) => {
			var t = Zt(), n = o(t), s = (e) => {
				var t = f();
				a(() => c(t, m(R).detail)), l(e, t);
			}, u = (e) => {
				var t = f();
				a((e) => c(t, e), [() => m(i)("common.error", { code: m(R).code })]), l(e, t);
			};
			r(n, (e) => {
				m(R).code === "APP_KEY_MISSING" ? e(s) : e(u, -1);
			});
			var d = y(n, 2), p = (e) => {
				var t = Xt(), n = y(v(t), 1, !0);
				a((e) => c(n, e), [() => m(i)("common.request_id", { id: m(R).requestId })]), l(e, t);
			};
			r(d, (e) => {
				m(R).requestId && e(p);
			}), F(t), l(e, t);
		}, b = (e) => {
			var t = Qt(), n = _(t, !0);
			a((e) => c(n, e), [() => m(i)("start.not_startable")]), l(e, t);
		}, x = (n) => {
			var s = on(), u = v(s), d = (e) => {
				var t = en(), n = o(t), r = y(n), s = o(r);
				s.value = s.__value = "";
				var u = y(s);
				p(u, 17, () => m(B), (e) => e.id, (e, t) => {
					var n = $t(), r = _(n, !0), i = {};
					a(() => {
						c(r, m(t).name), i !== (i = m(t).id) && (n.value = (n.__value = i) ?? "");
					}), l(e, n);
				}), F(r), T(r), F(t), a((e) => c(n, `${e ?? ""} `), [() => m(i)("start.choose")]), E(r, () => m(V), se), l(e, t);
			};
			r(u, (e) => {
				m(L) || e(d);
			});
			var g = y(u, 2), b = (e) => {
				var t = tn(), n = _(t, !0);
				a((e) => c(n, e), [() => m(i)("common.loading")]), l(e, t);
			};
			r(g, (e) => {
				m(Y) && e(b);
			});
			var x = y(g, 2), S = (e) => {
				var t = Zt(), n = o(t), s = (e) => {
					var t = f();
					a(() => c(t, m(K).detail)), l(e, t);
				}, u = (e) => {
					var t = f();
					a((e) => c(t, e), [() => m(i)("common.error", { code: m(K).code })]), l(e, t);
				};
				r(n, (e) => {
					m(K).code === "APP_KEY_MISSING" ? e(s) : e(u, -1);
				});
				var d = y(n, 2), p = (e) => {
					var t = Xt(), n = y(v(t), 1, !0);
					a((e) => c(n, e), [() => m(i)("common.request_id", { id: m(K).requestId })]), l(e, t);
				};
				r(d, (e) => {
					m(K).requestId && e(p);
				}), F(t), l(e, t);
			};
			r(x, (e) => {
				m(K) && e(S);
			});
			var C = y(x, 2), w = (e) => {
				var t = nn(), n = _(t, !0);
				a((e) => c(n, e), [() => m(i)("start.started")]), l(e, t);
			};
			r(C, (e) => {
				m(J) && e(w);
			});
			var D = y(C, 2), O = (n) => {
				var s = an(), u = o(s);
				ut(u, {
					get fields() {
						return m(U);
					},
					get errors() {
						return m(G);
					},
					get disabled() {
						return m(q);
					},
					get t() {
						return m(i);
					},
					get values() {
						return m(W);
					},
					set values(t) {
						e(W, t, !0);
					}
				});
				var d = y(u, 2), f = (e) => {
					var t = rn(), n = _(t, !0);
					a((e) => c(n, e), [() => m(i)("form.unsupported_required")]), l(e, t);
				};
				r(d, (e) => {
					m(X).length > 0 && e(f);
				});
				var p = y(d, 2), g = o(p), v = _(g, !0);
				F(p), F(s), a((e) => {
					g.disabled = m(q) || m(X).length > 0, c(v, e);
				}, [() => m(i)("start.submit")]), h("submit", s, (e) => e.preventDefault()), t("click", g, Q), l(n, s);
			};
			r(D, (e) => {
				m(H) && e(O);
			}), l(n, s);
		};
		r(d, (e) => {
			m(R) ? e(g) : m(te) ? e(b, 1) : e(x, -1);
		}), l(n, s);
	};
	return r(le, (e) => {
		k.current && m(j) && e(ue);
	}), l(n, $), ee(ce);
}
I(["click"]), j(cn, {
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
var ln = i("<header part=\"header\"><h2 part=\"title\" class=\"svelte-xgtj81\"> </h2> <p part=\"meta\" class=\"muted svelte-xgtj81\"> </p></header>"), un = i("<br/> ", 1), dn = i("<p part=\"error\" class=\"error svelte-xgtj81\" role=\"alert\"><!> <!> <!></p>"), fn = i("<p class=\"muted svelte-xgtj81\"> </p>"), pn = i("<p part=\"notice\"> </p>"), mn = i("<button part=\"button\" type=\"button\" class=\"secondary svelte-xgtj81\"> </button>"), hn = i("<button part=\"button\" type=\"button\" class=\"svelte-xgtj81\"> </button>"), gn = i("<div part=\"actions\" class=\"svelte-xgtj81\"><button part=\"button\" type=\"button\" class=\"svelte-xgtj81\"> </button></div>"), _n = i("<!> <div part=\"actions\" class=\"svelte-xgtj81\"><!> <!></div>", 1), vn = i("<p part=\"notice\"> </p> <div part=\"actions\" class=\"svelte-xgtj81\"><!></div>", 1), yn = i("<p part=\"notice\" class=\"error svelte-xgtj81\"> </p>"), bn = i("<form part=\"form\"><!> <!> <!> <!> <!> <div part=\"actions\" class=\"svelte-xgtj81\"><!> <!></div></form>"), xn = i("<!> <!> <!> <!>", 1), Sn = {
	hash: "svelte-xgtj81",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}h2.svelte-xgtj81 {margin:0 0 4px;font-size:1.25em;}.muted.svelte-xgtj81 {color:var(--agentflow-muted, #667085);margin:0 0 var(--agentflow-gap, 12px);}.error.svelte-xgtj81 {color:var(--agentflow-danger, #b42318);}[part='actions'].svelte-xgtj81 {display:flex;gap:8px;flex-wrap:wrap;}button.svelte-xgtj81 {font:inherit;padding:6px 14px;cursor:pointer;border-radius:var(--agentflow-radius, 6px);border:1px solid var(--agentflow-accent, #1570ef);background:var(--agentflow-accent, #1570ef);color:var(--agentflow-accent-text, #fff);}button.secondary.svelte-xgtj81 {background:transparent;color:var(--agentflow-accent, #1570ef);}button.svelte-xgtj81:disabled {opacity:0.5;cursor:default;}"
};
function Cn(n, i) {
	M(i, !0), b(n, Sn);
	let x = D(i, "entityId", 7), S = D(i, "entityKey", 7), w = D(i, "recordId", 7), T = {
		id: null,
		name: null,
		title: null
	}, E = i.$$host, O = Mt(E), k = A(() => O.current?.state === "ready"), j = C(null), N = C(null), I = 0, L = A(() => x() || m(j)), R = C(null), B = C(d(T)), V = C(!1), te = C(d([])), H = C(d({})), U = C(d({})), W = C(null), G = A(() => m(W) ?? m(N)), K = C(!1), q = C(!1), J = C(!1), Y = A(() => !!O.current?.signing && !m(J)), X = A(() => !!m(B).id && m(B).id === O.current?.caller?.id), ne = A(() => !!m(R) && m(R).step_status !== "open"), Z = A(() => !!m(R) && m(R).step_status === "open" && m(R).signed), re = A(() => At(m(te))), ie = A(() => m(R)?.actions.find((e) => e.id === m(R)?.signed_action_id)), ae = A(() => m(R)?.actions.filter((e) => e.id !== m(ie)?.id) ?? []), oe = A(() => !!m(ie) && m(Y)), se = A(() => {
		let e = m(R)?.entity_view;
		return e?.mode !== "selectable" || e.view?.type !== "grid" && e.view?.type !== "kanban" ? !1 : (e.min_selection ?? 1) > 0;
	}), Q = (e, t) => E.dispatchEvent(new CustomEvent(e, {
		detail: t,
		bubbles: !0,
		composed: !0
	}));
	function ce(t) {
		e(R, t, !0), e(te, Ct(t.form_definition?.schema_json, t.form_definition?.ui_schema_json), !0), e(H, Et(m(te), t.draft_payload ?? t.prefill ?? {}), !0), e(U, {}, !0);
	}
	let $ = 0;
	async function le(t, n) {
		let r = O.current;
		if (!r || !t || !n) return;
		let i = $;
		e(q, !0), e(J, !1);
		try {
			let a = {
				entity_id: t,
				record_id: n
			}, [o, s] = await Promise.all([r.client.GET("/entities/{entity_id}/records/{record_id}/step", { params: { path: a } }), r.client.GET("/entities/{entity_id}/records/{record_id}", { params: { path: a } })]);
			if (o.response.status === 404) {
				i === $ && (e(R, null), e(B, T, !0)), await z(Promise.resolve(s)), i === $ && e(V, !0);
				return;
			}
			let c = await z(Promise.resolve(o)), l = await z(Promise.resolve(s));
			if (i !== $) return;
			e(V, !1);
			let u = typeof l.body.claimed_by == "string" ? l.body.claimed_by : null;
			e(B, {
				id: u,
				name: u ? l.ref_labels?.claimed_by ?? null : null,
				title: typeof l.body.title == "string" ? l.body.title : null
			}, !0), ce(c);
		} catch (t) {
			let n = r.report(t);
			i === $ && e(W, n, !0);
		} finally {
			i === $ && e(q, !1);
		}
	}
	async function ue(t) {
		let n = O.current;
		if (!n || !m(R)) return;
		let r = m(L), i = w();
		if (!r) return;
		let a = $;
		e(K, !0), e(W, null);
		try {
			let e = t === "claim" ? "/entities/{entity_id}/records/{record_id}/work/claim" : "/entities/{entity_id}/records/{record_id}/work/release";
			await z(n.client.POST(e, { params: { path: {
				entity_id: r,
				record_id: i
			} } })), a === $ && await le(r, i), Q(t === "claim" ? "task-claimed" : "task-released", {
				recordId: i,
				entityId: r
			});
		} catch (t) {
			let o = n.report(t);
			if (a !== $) return;
			e(W, o, !0), o && await le(r, i);
		} finally {
			a === $ && e(K, !1);
		}
	}
	async function de() {
		let t = O.current;
		if (!t?.signing || !m(R)) return;
		let n = m(L), r = w();
		if (!n) return;
		let i = $;
		e(K, !0), e(W, null);
		try {
			let a = await t.signing.sign({
				entity: n,
				record: r
			});
			i === $ && (await le(n, r), a === "nothing_to_sign" && e(J, !0), a === "closed" && i === $ && !m(W) && (m(V) || m(ne) || !m(X)) && Q("agentflow-task-changed", {
				recordId: r,
				entityId: n
			})), (a === "signed" || a === "declined") && Q(a === "signed" ? "agentflow-signed" : "agentflow-declined", {
				recordId: r,
				entityId: n
			});
		} catch (a) {
			let o = t.report(a);
			if (i !== $) return;
			e(W, o, !0), o && await le(n, r);
		} finally {
			i === $ && e(K, !1);
		}
	}
	async function fe(t) {
		let n = O.current;
		if (!n || !m(R)) return;
		let r = kt(m(te), m(H));
		if (r.length > 0) {
			e(U, Object.fromEntries(r.map((e) => [e, n.t("form.required")])), !0);
			return;
		}
		let i = m(L), a = w();
		if (!i) return;
		let o = $;
		e(K, !0), e(W, null), e(U, {}, !0);
		try {
			let e = Ot(m(te), m(H));
			t && (e._action = t);
			let r = await z(n.client.POST("/entities/{entity_id}/records/{record_id}/step/submit", {
				params: { path: {
					entity_id: i,
					record_id: a
				} },
				body: { payload: e }
			}));
			o === $ && ce(r), Q("task-submitted", {
				recordId: a,
				entityId: i,
				actionId: t
			});
		} catch (t) {
			let r = n.report(t);
			if (o !== $) return;
			e(U, jt(r?.fieldErrors), !0), e(W, r, !0);
		} finally {
			o === $ && e(K, !1);
		}
	}
	s(() => {
		x(), S(), I++, e(j, null), e(N, null);
	}), s(() => {
		m(L), S(), w(), $++, e(R, null), e(V, !1), e(B, T, !0), e(W, null), e(U, {}, !0), e(K, !1), e(q, !1);
	}), s(() => {
		if (!m(k) || x() || !S()) return;
		let t = S();
		g(async () => {
			let n = O.current;
			if (!n) return;
			let r = I;
			try {
				let i = await ft(n.client, "entity", t);
				r === I && e(j, i, !0);
			} catch (t) {
				let i = n.report(t);
				r === I && e(N, i, !0);
			}
		});
	}), s(() => {
		if (!m(k) || !m(L)) return;
		let e = m(L), t = w();
		g(() => le(e, t));
	});
	var pe = {
		get entityId() {
			return x();
		},
		set entityId(e) {
			x(e), P();
		},
		get entityKey() {
			return S();
		},
		set entityKey(e) {
			S(e), P();
		},
		get recordId() {
			return w();
		},
		set recordId(e) {
			w(e), P();
		}
	}, me = u(), he = v(me), ge = (n) => {
		let i = A(() => O.current.t);
		var s = xn(), d = v(s), g = (e) => {
			var t = ln(), n = o(t), r = _(n, !0), i = y(n, 2), s = _(i, !0);
			F(t), a((e) => {
				c(r, m(B).title ?? m(R).run.step_label), c(s, e);
			}, [() => [m(R).run.workflow_name, m(R).instance_name].filter(Boolean).join(" · ")]), l(e, t);
		};
		r(d, (e) => {
			m(R) && !m(V) && e(g);
		});
		var b = y(d, 2), x = (e) => {
			var t = dn(), n = o(t), s = (e) => {
				var t = f();
				a(() => c(t, m(G).detail)), l(e, t);
			}, u = (e) => {
				var t = f();
				a((e) => c(t, e), [() => m(i)("common.error", { code: m(G).code })]), l(e, t);
			};
			r(n, (e) => {
				m(G).code === "APP_KEY_MISSING" ? e(s) : e(u, -1);
			});
			var d = y(n, 2), p = (e) => {
				var t = un(), n = y(v(t), 1, !0);
				a(() => c(n, m(G).detail)), l(e, t);
			};
			r(d, (e) => {
				m(G).status === 422 && !m(G).fieldErrors?.length && m(G).detail && e(p);
			});
			var h = y(d, 2), g = (e) => {
				var t = un(), n = y(v(t), 1, !0);
				a((e) => c(n, e), [() => m(i)("common.request_id", { id: m(G).requestId })]), l(e, t);
			};
			r(h, (e) => {
				m(G).requestId && e(g);
			}), F(t), l(e, t);
		};
		r(b, (e) => {
			m(G) && e(x);
		});
		var S = y(b, 2), C = (e) => {
			var t = fn(), n = _(t, !0);
			a((e) => c(n, e), [() => m(i)("common.loading")]), l(e, t);
		};
		r(S, (e) => {
			m(q) && e(C);
		});
		var w = y(S, 2), T = (e) => {
			var t = pn(), n = _(t, !0);
			a((e) => c(n, e), [() => m(i)("task.withheld")]), l(e, t);
		}, E = (n) => {
			let s = (e) => {
				var n = mn(), r = _(n, !0);
				a((e) => {
					n.disabled = m(K), c(r, e);
				}, [() => m(i)("task.release")]), t("click", n, () => ue("release")), l(e, n);
			}, d = (e) => {
				var n = hn(), r = _(n, !0);
				a((e) => {
					n.disabled = m(K), c(r, e);
				}, [() => m(i)("task.sign")]), t("click", n, de), l(e, n);
			};
			var f = u(), g = v(f), b = (e) => {
				var t = pn(), n = _(t, !0);
				a((e) => c(n, e), [() => m(R).step_status === "cancelled" ? m(i)("task.cancelled") : m(i)("task.done")]), l(e, t);
			}, x = (e) => {
				var t = pn(), n = _(t, !0);
				a((e) => c(n, e), [() => m(i)("task.signed_waiting")]), l(e, t);
			}, S = (e) => {
				var n = gn(), r = o(n), s = _(r, !0);
				F(n), a((e) => {
					r.disabled = m(K), c(s, e);
				}, [() => m(i)("task.claim")]), t("click", r, () => ue("claim")), l(e, n);
			}, C = (e) => {
				var t = _n(), n = v(t), u = (e) => {
					var t = pn(), n = _(t, !0);
					a((e) => c(n, e), [() => m(i)("task.sign_elsewhere")]), l(e, t);
				};
				r(n, (e) => {
					m(Y) || e(u);
				});
				var f = y(n, 2), p = o(f);
				s(p);
				var h = y(p, 2), g = (e) => {
					d(e);
				};
				r(h, (e) => {
					m(Y) && e(g);
				}), F(f), l(e, t);
			}, w = (e) => {
				var t = vn(), n = v(t), r = _(n, !0), u = y(n, 2), d = o(u);
				s(d), F(u), a((e) => c(r, e), [() => m(i)("task.select_elsewhere")]), l(e, t);
			}, T = (n) => {
				var f = bn(), g = o(f);
				{
					let t = A(() => m(K) || m(oe));
					ut(g, {
						get fields() {
							return m(te);
						},
						get errors() {
							return m(U);
						},
						get disabled() {
							return m(t);
						},
						get t() {
							return m(i);
						},
						get values() {
							return m(H);
						},
						set values(t) {
							e(H, t, !0);
						}
					});
				}
				var b = y(g, 2), x = (e) => {
					var t = yn(), n = _(t, !0);
					a((e) => c(n, e), [() => m(i)("form.unsupported_required")]), l(e, t);
				};
				r(b, (e) => {
					m(re).length > 0 && !m(oe) && e(x);
				});
				var S = y(b, 2), C = (e) => {
					var t = pn(), n = _(t, !0);
					a((e) => c(n, e), [() => m(i)("task.no_actions")]), l(e, t);
				};
				r(S, (e) => {
					m(R).actions_gated_out && e(C);
				});
				var w = y(S, 2), T = (e) => {
					var t = pn(), n = _(t, !0);
					a((e) => c(n, e), [() => m(i)("task.sign_elsewhere")]), l(e, t);
				};
				r(w, (e) => {
					m(ie) && !m(Y) && e(T);
				});
				var E = y(w, 2), D = (e) => {
					var t = pn(), n = _(t, !0);
					a((e) => c(n, e), [() => m(i)("task.sign_in_dialog")]), l(e, t);
				};
				r(E, (e) => {
					m(oe) && e(D);
				});
				var O = y(E, 2), k = o(O);
				s(k);
				var ee = y(k, 2), j = (e) => {
					d(e);
				}, M = (e) => {
					var n = u(), r = v(n);
					p(r, 17, () => m(ae), (e) => e.id, (e, n) => {
						var r = hn(), i = _(r, !0);
						a(() => {
							r.disabled = m(K) || m(re).length > 0, c(i, m(n).label);
						}), t("click", r, () => fe(m(n).id)), l(e, r);
					}), l(e, n);
				}, N = (e) => {
					var n = hn(), r = _(n, !0);
					a((e) => {
						n.disabled = m(K) || m(re).length > 0, c(r, e);
					}, [() => m(i)("task.submit")]), t("click", n, () => fe(null)), l(e, n);
				};
				r(ee, (e) => {
					m(oe) ? e(j) : m(R).actions.length > 0 ? e(M, 1) : m(R).actions_gated_out || e(N, 2);
				}), F(O), F(f), h("submit", f, (e) => e.preventDefault()), l(n, f);
			}, E = (e) => {
				var t = pn(), n = _(t, !0);
				a((e) => c(n, e), [() => m(B).name ? m(i)("task.claimed_by", { name: m(B).name }) : m(i)("task.claimed_by_someone")]), l(e, t);
			};
			r(g, (e) => {
				m(ne) ? e(b) : m(Z) ? e(x, 1) : m(B).id ? m(X) && (m(R).kind === "signature" || m(R).signs && !m(ie)) ? e(C, 3) : m(X) && m(se) ? e(w, 4) : m(X) ? e(T, 5) : e(E, -1) : e(S, 2);
			}), l(n, f);
		};
		r(w, (e) => {
			m(V) ? e(T) : m(R) && e(E, 1);
		}), l(n, s);
	};
	return r(he, (e) => {
		O.current && m(k) && e(ge);
	}), l(n, me), ee(pe);
}
I(["click"]), j(Cn, {
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
var wn = i("<br/> ", 1), Tn = i("<p part=\"error\" class=\"error svelte-j92hy\" role=\"alert\"> <!></p>"), En = i("<p part=\"empty\" class=\"muted svelte-j92hy\"> </p>"), Dn = i("<tr part=\"row\" tabindex=\"0\" class=\"svelte-j92hy\"><td class=\"svelte-j92hy\"> </td><td class=\"svelte-j92hy\"> </td><td class=\"svelte-j92hy\"> </td><td class=\"svelte-j92hy\"> </td></tr>"), On = i("<table part=\"table\" class=\"svelte-j92hy\"><thead><tr><th class=\"svelte-j92hy\"> </th><th class=\"svelte-j92hy\"> </th><th class=\"svelte-j92hy\"> </th><th class=\"svelte-j92hy\"> </th></tr></thead><tbody></tbody></table>"), kn = i("<p class=\"muted svelte-j92hy\"> </p>"), An = i("<button part=\"load-more\" type=\"button\" class=\"svelte-j92hy\"> </button>"), jn = i("<!> <!> <!> <!>", 1), Mn = {
	hash: "svelte-j92hy",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}table.svelte-j92hy {width:100%;border-collapse:collapse;}th.svelte-j92hy, td.svelte-j92hy {text-align:start;padding:8px;border-block-end:1px solid var(--agentflow-border, #eaecf0);}tr[part='row'].svelte-j92hy {cursor:pointer;}tr[part='row'].svelte-j92hy:hover, tr[part='row'].svelte-j92hy:focus {background:color-mix(in srgb, var(--agentflow-accent, #1570ef) 8%, transparent);}.muted.svelte-j92hy {color:var(--agentflow-muted, #667085);}.error.svelte-j92hy {color:var(--agentflow-danger, #b42318);}button.svelte-j92hy {font:inherit;margin-block-start:var(--agentflow-gap, 12px);padding:6px 12px;cursor:pointer;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);background:transparent;}"
};
function Nn(n, i) {
	M(i, !0), b(n, Mn);
	let f = D(i, "view", 7), h = D(i, "pageSize", 7), x = D(i, "signs", 7), S = A(() => f() === "mine" || f() === "claimable" ? f() : "all"), w = A(() => Xe(h())), T = A(() => x() === "true" || x() !== "false" && void 0), E = i.$$host, O = Mt(E), k = A(() => O.current?.state === "ready"), j = C(d([])), N = C(null), I = C(!1), L = C(!1), R = C(null), B = 0;
	async function V(t) {
		let n = O.current;
		if (!n) return;
		let r = ++B;
		e(L, !0), e(R, null), t || e(N, null);
		try {
			let i = {
				view: m(S),
				live: !0,
				limit: m(w)
			};
			m(T) !== void 0 && (i.signs = m(T)), t && (i.cursor = t);
			let a = await z(n.client.GET("/work", { params: { query: i } }));
			if (r !== B) return;
			let o = a.items.filter((e) => e.step);
			e(j, t ? [...m(j), ...o] : o, !0), e(N, a.next_cursor, !0), e(I, !0);
		} catch (i) {
			let a = n.report(i);
			r === B && (e(R, a, !0), t || e(j, [], !0));
		} finally {
			r === B && e(L, !1);
		}
	}
	s(() => {
		m(k) && (m(S), m(w), m(T), g(() => V()));
	});
	let te = (e) => E.dispatchEvent(new CustomEvent("task-select", {
		detail: {
			recordId: e.id,
			entityId: e.entity_id
		},
		bubbles: !0,
		composed: !0
	}));
	var H = {
		get view() {
			return f();
		},
		set view(e) {
			f(e), P();
		},
		get pageSize() {
			return h();
		},
		set pageSize(e) {
			h(e), P();
		},
		get signs() {
			return x();
		},
		set signs(e) {
			x(e), P();
		}
	}, U = u(), W = v(U), G = (e) => {
		let n = A(() => O.current.t);
		var i = jn(), s = v(i), u = (e) => {
			var t = Tn(), i = o(t), s = y(i), u = (e) => {
				var t = wn(), r = y(v(t), 1, !0);
				a((e) => c(r, e), [() => m(n)("common.request_id", { id: m(R).requestId })]), l(e, t);
			};
			r(s, (e) => {
				m(R).requestId && e(u);
			}), F(t), a((e) => c(i, `${e ?? ""} `), [() => m(n)("common.error", { code: m(R).code })]), l(e, t);
		};
		r(s, (e) => {
			m(R) && e(u);
		});
		var d = y(s, 2), f = (e) => {
			var t = En(), r = _(t, !0);
			a((e) => c(r, e), [() => m(n)("inbox.empty")]), l(e, t);
		}, h = (e) => {
			var r = On(), i = o(r), s = o(i), u = o(s), d = _(u, !0), f = y(u), h = _(f, !0), g = y(f), v = _(g, !0), b = y(g), x = _(b, !0);
			F(s), F(i);
			var S = y(i);
			p(S, 21, () => m(j), (e) => e.id, (e, r) => {
				var i = Dn(), s = o(i), u = _(s, !0), d = y(s), f = _(d, !0), p = y(d), h = _(p, !0), g = y(p), v = _(g, !0);
				F(i), a((e, t) => {
					c(u, m(r).step?.step.label || m(r).step?.step.key), c(f, m(r).step?.workflow.name ?? ""), c(h, e), c(v, t);
				}, [() => m(n)(m(r).claimed_by_user_id ? "status.claimed" : "status.open"), () => ht(m(r).due_at, O.current.locale)]), t("click", i, () => te(m(r))), t("keydown", i, (e) => e.key === "Enter" && te(m(r))), l(e, i);
			}), F(S), F(r), a((e, t, n, r) => {
				c(d, e), c(h, t), c(v, n), c(x, r);
			}, [
				() => m(n)("inbox.column.task"),
				() => m(n)("inbox.column.workflow"),
				() => m(n)("inbox.column.status"),
				() => m(n)("inbox.column.due")
			]), l(e, r);
		};
		r(d, (e) => {
			m(I) && !m(L) && m(j).length === 0 && !m(R) && !m(N) ? e(f) : m(j).length > 0 && e(h, 1);
		});
		var g = y(d, 2), b = (e) => {
			var t = kn(), r = _(t, !0);
			a((e) => c(r, e), [() => m(n)("common.loading")]), l(e, t);
		};
		r(g, (e) => {
			m(L) && e(b);
		});
		var x = y(g, 2), S = (e) => {
			var r = An(), i = _(r, !0);
			a((e) => c(i, e), [() => m(n)("common.load_more")]), t("click", r, () => V(m(N) ?? void 0)), l(e, r);
		};
		r(x, (e) => {
			m(N) && !m(L) && e(S);
		}), l(e, i);
	};
	return r(W, (e) => {
		O.current && m(k) && e(G);
	}), l(n, U), ee(H);
}
I(["click", "keydown"]), j(Nn, {
	view: {
		attribute: "view",
		type: "String"
	},
	pageSize: {
		attribute: "page-size",
		type: "Number"
	},
	signs: {
		attribute: "signs",
		type: "String"
	}
}, [], [], { mode: "open" });
//#endregion
//#region src/session.ts
function Pn(e, t) {
	let n = Ae(t), r = e ?? `${location.pathname}${location.search}${location.hash}`;
	location.assign(`${n}/auth/login?returnTo=${encodeURIComponent(r)}`);
}
function Fn(e) {
	let t = document.createElement("form");
	t.method = "post", t.action = `${Ae(e)}/auth/logout`, t.dataset.agentflowSignOut = "", t.hidden = !0, document.body.append(t), t.submit();
}
//#endregion
//#region src/index.ts
var In = {
	"agentflow-provider": $e,
	"agentflow-task-inbox": Nn,
	"agentflow-task-detail": Cn,
	"agentflow-record-table": Yt,
	"agentflow-start-form": cn
}, Ln = N;
for (let e of Object.values(In)) Object.defineProperty(e.element, "elementsVersion", { value: Ln });
function Rn(e = customElements) {
	for (let [t, n] of Object.entries(In)) {
		let r = e.get(t);
		if (!r) e.define(t, n.element);
		else if (r !== n.element) {
			let e = r.elementsVersion;
			k(e, Ln) && console.warn(`An older copy of the AgentFlow elements registered ${t} first; this page uses it, not this copy.`, {
				tag: t,
				registered: e ?? null,
				loaded: Ln
			});
		}
	}
}
Rn();
//#endregion
export { Ln as ELEMENTS_VERSION, Rn as defineAgentFlowElements, Pn as signIn, Fn as signOut };
