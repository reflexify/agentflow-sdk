import { A as e, Ct as t, D as n, I as r, M as i, Ot as a, Pt as o, Q as s, S as c, St as l, T as u, U as d, V as f, W as p, X as m, Y as h, Z as g, _, _t as v, b as y, ct as b, dt as x, g as S, gt as C, h as w, ht as T, it as ee, k as E, kt as te, m as D, mt as O, n as k, nt as A, ot as j, pt as M, r as N, rt as P, st as F, t as I, tt as ne, ut as L, w as R, wt as z, x as B, xt as V, yt as H, z as U } from "./chunks/version-Cw97ZDNW.js";
import { n as W, t as re } from "./chunks/format-GenuUIkK.js";
//#region ../agentflow-sdk/dist/auth.js
function ie() {
	return {
		async headers() {
			return {};
		},
		credentials: "same-origin"
	};
}
//#endregion
//#region ../agentflow-sdk/dist/errors.js
var G = class extends Error {
	status;
	code;
	detail;
	requestId;
	fieldErrors;
	constructor(e, t, n, r, i) {
		super(n ? `${t}: ${n}` : t), this.status = e, this.code = t, this.detail = n, this.requestId = r, this.fieldErrors = i, this.name = "AgentFlowError";
	}
};
async function K(e) {
	let { data: t, error: n, response: r } = await e;
	if (r.ok && n === void 0) return t;
	let i = n ?? {};
	throw new G(r.status, i.type ?? `HTTP_${r.status}`, i.detail, i.request_id, i.field_errors ?? void 0);
}
//#endregion
//#region ../agentflow-sdk/dist/app/version.js
var q = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/;
function J(e) {
	let t = typeof e == "string" ? q.exec(e) : null, n = t ? [
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
var ae = /^\d+$/;
function oe(e, t) {
	let n = ae.test(e), r = ae.test(t);
	return n && r ? Math.sign(Number(e) - Number(t)) : n ? -1 : r ? 1 : e < t ? -1 : +(e > t);
}
function Y(e, t) {
	let n = J(e), r = J(t);
	for (let e = 0; e < 3; e++) if (n.core[e] !== r.core[e]) return n.core[e] < r.core[e] ? -1 : 1;
	if (n.pre.length === 0 || r.pre.length === 0) return Math.sign(r.pre.length - n.pre.length);
	for (let e = 0; e < Math.min(n.pre.length, r.pre.length); e++) {
		let t = oe(n.pre[e], r.pre[e]);
		if (t !== 0) return t;
	}
	return Math.sign(n.pre.length - r.pre.length);
}
//#endregion
//#region ../agentflow-sdk/dist/app/objects.js
var X = 3e4, se = [
	"own",
	"bound",
	"exported"
], ce = /* @__PURE__ */ new WeakMap();
function le(e, t = {}) {
	let n = ce.get(e);
	return n || (n = Z(e, t.recheckAfterMs ?? X), ce.set(e, n)), n;
}
function Z(e, t) {
	let n = null, r = !1, i = null, a = -1, o = 0, s = /* @__PURE__ */ new Set(), c = (e) => void e.catch(() => {});
	function l(t = !1) {
		if (i) return i;
		let u = (async () => {
			await Promise.resolve();
			try {
				let t = await K(e.GET("/app/objects"));
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
	w(e)?.listen((e) => {
		a = Math.max(a, e), n && e > n.revision && (r = !0, s.size > 0 && c(l()));
	});
	let u = () => {
		globalThis.document?.visibilityState === "visible" && Date.now() - o >= t && c(l());
	};
	function d(e, t) {
		if (!n) throw Error("getAppObjects: call load() first");
		let r = n.objects.filter((t) => t.logical_key === e);
		if (t?.source) return r.find((e) => e.source === t.source) ?? null;
		for (let e of se) {
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
			Y(t, t);
			let r = d(e, n);
			if (!r || r.state === "off" || r.contract_version == null) return !1;
			try {
				return Y(r.contract_version, t) >= 0;
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
//#region ../agentflow-sdk/dist/actions.js
function Q(e, t) {
	let n = {}, r = [], i = [];
	for (let a of e.input_map ?? []) {
		if (a.to === "subject" || !a.to.startsWith("params.")) continue;
		let e = a.to.slice(7);
		if (a.from === "default") {
			i.push(e);
			continue;
		}
		let o = a.from === "record.id" ? t.id : a.from.startsWith("record.") ? t.body[a.from.slice(7)] : void 0;
		o !== void 0 && (n[e] = o, r.push(e));
	}
	return {
		subject: {
			kind: "record",
			record_id: t.id
		},
		params: n,
		contextKeys: r,
		defaultKeys: i
	};
}
function ue(e, t, n = []) {
	let r = e.form_definition_id ? new Set(n) : /* @__PURE__ */ new Set([...t, ...n]);
	return e.params_slots.map((e) => e.key).filter((e) => !r.has(e));
}
//#endregion
//#region ../agentflow-sdk/dist/paginate.js
async function* de(e) {
	let t = /* @__PURE__ */ new Set(), n;
	do {
		let r = await e(n);
		if (yield* r.items, n = r.next_cursor ?? void 0, n !== void 0 && t.has(n)) break;
		n !== void 0 && t.add(n);
	} while (n);
}
//#endregion
//#region ../agentflow-sdk/dist/folders.js
function fe(e, t) {
	return t === void 0 ? { $fileSet: e } : {
		$fileSet: e,
		path: t
	};
}
var pe = 8, me = 200;
async function he(e) {
	let t = e.createReader(), n = [];
	for (;;) {
		let e = await new Promise((e, n) => t.readEntries(e, n));
		if (e.length === 0) return n;
		n.push(...e);
	}
}
function ge(e) {
	let t = 0, n = null, r = [];
	return async (i) => {
		t < e ? t++ : await new Promise((e) => r.push(e));
		try {
			if (n) throw n.error;
			return await i();
		} catch (e) {
			throw n ??= { error: e }, e;
		} finally {
			let e = r.shift();
			e ? e() : t--;
		}
	};
}
async function _e(e, t, n) {
	if (e.isFile) return [{
		path: t,
		file: await n(() => new Promise((t, n) => e.file(t, n)))
	}];
	let r = await n(() => he(e));
	return (await Promise.all(r.map((e) => _e(e, t ? `${t}/${e.name}` : e.name, n)))).flat();
}
var ve = /* @__PURE__ */ new Set([
	".ds_store",
	"thumbs.db",
	"desktop.ini"
]), ye = (e) => ve.has(e.slice(e.lastIndexOf("/") + 1).toLowerCase());
async function be(e) {
	let t = ge(pe);
	return (await Promise.all(e.map(async (n) => {
		if ("isDirectory" in n) return _e(n, e.length === 1 && n.isDirectory ? "" : n.name, t);
		let r = n.webkitRelativePath.indexOf("/");
		return [{
			path: r < 0 ? n.name : n.webkitRelativePath.slice(r + 1),
			file: n
		}];
	}))).flat().filter(({ path: e }) => !ye(e));
}
function xe(e) {
	let t = new Set(e.map((e) => e.name)), n = /* @__PURE__ */ new Set();
	return e.map((e) => {
		let r = e.name;
		if (n.has(r)) {
			let e = r.lastIndexOf("."), [n, i] = e > 0 ? [r.slice(0, e), r.slice(e)] : [r, ""];
			for (let e = 2; t.has(r); e++) r = `${n} (${e})${i}`;
			t.add(r);
		}
		return n.add(r), {
			path: `files/${r}`,
			file: e
		};
	});
}
function Se(e) {
	async function t(t) {
		await K(e.DELETE("/upload-sets/{file_set_id}", { params: { path: { file_set_id: t } } }));
	}
	async function n(n, r, i) {
		let a = [];
		try {
			let t = de((t) => K(e.GET("/upload-sets/{file_set_id}/files", {
				params: {
					path: { file_set_id: n },
					query: {
						cursor: t,
						limit: me
					}
				},
				signal: i
			})));
			for await (let e of t) a.push(e);
		} catch (e) {
			if (e instanceof G && e.status === 404) return null;
			throw e;
		}
		return a.length === r.size && a.every((e) => r.get(e.path)?.size === e.byte_size) ? a : (await t(n).catch((e) => {
			if (!(e instanceof G)) throw e;
		}), null);
	}
	async function r(r, i) {
		let { signal: a } = i;
		a?.throwIfAborted();
		let o = new Map(r.map(({ path: e, file: t }) => [e, t])), s = i.resumeSetId ? await n(i.resumeSetId, o, a) : null, c, l, u, d;
		if (s) c = i.resumeSetId, l = s.flatMap((e) => e.refused_reason ? [{
			path: e.path,
			reason: e.refused_reason
		}] : []), u = s.filter((e) => e.stored).length, d = s.filter((e) => !e.stored && !e.refused_reason).map((e) => e.path);
		else {
			let t = r.map(({ path: e, file: t }) => ({
				path: e,
				byte_size: t.size
			})), n = await K(e.POST("/upload-sets", {
				body: {
					name: i.name,
					files: t
				},
				signal: a
			}));
			c = n.id, l = n.refused, u = 0;
			let o = new Set(l.map((e) => e.path));
			d = t.map((e) => e.path).filter((e) => !o.has(e));
		}
		let f = u + d.length;
		try {
			s || i.onSetCreated?.(c), i.onProgress?.({
				stored: u,
				total: f
			});
			let t = 0, n = !1, r = (await Promise.allSettled(Array.from({ length: 4 }, async () => {
				for (; !n && !a?.aborted && t < d.length;) {
					let r = d[t++], s = new FormData();
					s.append("path", r), s.append("file", o.get(r));
					try {
						await K(e.POST("/upload-sets/{file_set_id}/files", {
							params: { path: { file_set_id: c } },
							body: s,
							signal: a
						}));
					} catch (e) {
						throw n = !0, e;
					}
					u += 1, i.onProgress?.({
						stored: u,
						total: f
					});
				}
			}))).find((e) => e.status === "rejected");
			if (r) throw r.reason;
			a?.throwIfAborted(), await K(e.POST("/upload-sets/{file_set_id}/complete", {
				params: { path: { file_set_id: c } },
				signal: a
			}));
		} catch (e) {
			throw !s && a?.aborted && await t(c).catch(() => void 0), e;
		}
		return {
			value: fe(c),
			refused: l
		};
	}
	return {
		async watched() {
			return (await K(e.GET("/watched-folders"))).items;
		},
		subfolders(t, n, r) {
			return K(e.GET("/watched-folders/{file_set_id}/subfolders", { params: {
				path: { file_set_id: t },
				query: {
					path: n,
					cursor: r ?? void 0
				}
			} }));
		},
		preview(t, n, r, i) {
			return K(e.POST("/workflows/{workflow_id}/folder-preview", {
				params: { path: { workflow_id: t } },
				body: {
					field: n,
					file_set_id: r.$fileSet,
					path: r.path,
					version_id: i
				}
			}));
		},
		async uploadFolder(e, t) {
			return r(await be(e), t);
		},
		async uploadFiles(e, t) {
			return r(xe(e), t);
		},
		deleteSet: t
	};
}
//#endregion
//#region ../agentflow-sdk/dist/activity/index.js
async function Ce(e, t) {
	let n = {};
	return t.kinds && t.kinds.length > 0 && (n.kinds = t.kinds.join(",")), t.cursor && (n.cursor = t.cursor), t.limit !== void 0 && (n.limit = t.limit), K(e.GET("/entities/{entity_id}/records/{record_id}/activity", { params: {
		path: {
			entity_id: t.entity_id,
			record_id: t.record_id
		},
		query: n
	} }));
}
function we(e, t, n) {
	let { kind: r, id: i } = e.subject;
	return r === "record" || r === "work" ? i === t.record_id : r === "instance" && n.has(i);
}
//#endregion
//#region ../agentflow-sdk/dist/comments/index.js
async function Te(e, t) {
	let n = {};
	return t.cursor && (n.cursor = t.cursor), t.before && (n.before = t.before), t.limit !== void 0 && (n.limit = t.limit), K(e.GET("/entities/{entity_id}/records/{record_id}/comments", { params: {
		path: {
			entity_id: t.entity_id,
			record_id: t.record_id
		},
		query: n
	} }));
}
async function Ee(e, t) {
	let n = { body: t.body };
	return t.attachment_ids && (n.attachment_ids = t.attachment_ids), K(e.POST("/entities/{entity_id}/records/{record_id}/comments", {
		params: {
			path: {
				entity_id: t.entity_id,
				record_id: t.record_id
			},
			header: { "Idempotency-Key": t.idempotency_key }
		},
		body: n
	}));
}
async function De(e, t) {
	let n = {};
	return t.body !== void 0 && (n.body = t.body), t.attachment_ids !== void 0 && (n.attachment_ids = t.attachment_ids), K(e.PATCH("/entities/{entity_id}/records/{record_id}/comments/{comment_id}", {
		params: {
			path: {
				entity_id: t.entity_id,
				record_id: t.record_id,
				comment_id: t.comment.id
			},
			header: { "If-Match": t.comment.edited_at ?? t.comment.created_at }
		},
		body: n
	}));
}
async function Oe(e, t) {
	await K(e.DELETE("/entities/{entity_id}/records/{record_id}/comments/{comment_id}", { params: { path: {
		entity_id: t.entity_id,
		record_id: t.record_id,
		comment_id: t.comment_id
	} } }));
}
function ke(e, t) {
	return e.type.startsWith("comment.") && e.subject.kind === "record" && e.subject.id === t.record_id;
}
//#endregion
//#region ../agentflow-sdk/dist/mentions/index.js
var Ae = {
	recent: "Recently mentioned",
	people: "People",
	you: "You",
	willBeNotified: "Will be notified",
	matchedBy: (e) => `Matched by ${e}`,
	more: (e, t) => `${e} more in ${t}`,
	results: (e, t) => `${t} · ${e} results`,
	searchIn: "Search in"
}, je = {
	recent: "Nhắc gần đây",
	people: "Người",
	you: "Bạn",
	willBeNotified: "Sẽ nhận thông báo",
	matchedBy: (e) => `Khớp theo ${e}`,
	more: (e, t) => `Xem thêm ${e} trong ${t}`,
	results: (e, t) => `${t} · ${e} kết quả`,
	searchIn: "Tìm trong"
};
async function Me(e, t) {
	let n = { entity_id: t.entity_id };
	return t.record_id && (n.record_id = t.record_id), t.parent_record_id && (n.parent_record_id = t.parent_record_id), t.q && (n.q = t.q), t.group && (n.group = t.group), t.limit !== void 0 && (n.limit = t.limit), Ne(await K(e.GET("/mentions", { params: { query: n } })), t);
}
function Ne(e, t = {}) {
	let n = {
		...Ae,
		...t.copy
	}, r = Pe(e, n);
	return {
		groups: e.groups.map((e) => {
			let r = e.key !== "people" && e.key !== "recent", i = e.key === "people" ? t.peopleTitle ?? n.people : e.key === "recent" ? n.recent : t.group === e.key && e.total != null ? n.results(e.total, e.label) : e.label, a = e.items.map((e) => e.kind === "user" ? {
				kind: "user",
				ref: `user/${e.id}`,
				label: e.name,
				meta: e.is_self ? n.you : e.will_be_notified ? n.willBeNotified : e.email ?? null,
				self: e.is_self
			} : {
				kind: "record",
				ref: `record/${e.entity_id}/${e.id}`,
				label: e.label,
				entity_label: e.entity_label,
				meta: e.matched_field ? n.matchedBy(e.matched_field) : null
			}), o = r && e.more ? {
				count: e.more,
				group: e.key,
				label: n.more(e.more, e.label)
			} : null;
			return {
				key: e.key,
				title: i,
				items: a,
				more: o
			};
		}),
		...r ? { unsearched: r } : {}
	};
}
function Pe(e, t) {
	let n = (e.unsearched ?? []).map((e) => ({
		group: e.key,
		label: e.label
	}));
	return n.length > 0 ? {
		title: t.searchIn,
		scopes: n
	} : void 0;
}
function Fe(e, t) {
	return (n, r) => Me(e, {
		...t,
		q: n,
		group: r
	});
}
//#endregion
//#region src/base-path.ts
var Ie = "/agentflow", Le = /^\/(?!\/)/;
function Re(e) {
	try {
		return new URL(e, location.origin).origin === location.origin;
	} catch {
		return !1;
	}
}
function ze(e) {
	return e == null ? Ie : Le.test(e) && Re(e) ? e.replace(/\/+$/, "") : (console.warn(`agentflow: base-path ${JSON.stringify(e)} is not a path on this origin; using ${Ie}.`), Ie);
}
//#endregion
//#region src/context.ts
var Be = "context-request", $ = "agentflow-provider-ready", Ve = "agentflow", He = "agentflow-task";
function Ue(e, t) {
	let n = e;
	return n.context === t && typeof n.callback == "function";
}
function We(e, t, n) {
	let r, i = () => {
		let i = Object.assign(new Event(Be, {
			bubbles: !0,
			composed: !0
		}), {
			context: t,
			subscribe: !0,
			callback: (e, t) => {
				r = t, n(e);
			}
		});
		e.dispatchEvent(i);
	}, a = () => {
		r || i();
	};
	return window.addEventListener($, a), i(), () => {
		window.removeEventListener($, a), r?.();
	};
}
function Ge(e) {
	typeof reportError == "function" ? reportError(e) : console.error(e);
}
function Ke(e, t, n) {
	try {
		e(t, n);
	} catch (e) {
		Ge(e);
	}
}
function qe(e, t, n) {
	let r = n, i = /* @__PURE__ */ new Set(), a = (e) => {
		if (!Ue(e, t)) return;
		e.stopPropagation();
		let n = e.callback;
		e.subscribe && i.add(n), Ke(n, r, () => i.delete(n));
	};
	return e.addEventListener(Be, a), window.dispatchEvent(new Event($)), {
		set(e) {
			r = e;
			for (let e of [...i]) Ke(e, r, () => i.delete(e));
		},
		dispose() {
			e.removeEventListener(Be, a), i.clear();
		}
	};
}
//#endregion
//#region src/errors.ts
var Je = "APP_KEY_MISSING", Ye = /* @__PURE__ */ new Set([
	"APP_NOT_ASSIGNED",
	"APP_NOT_INSTALLED",
	"USER_NOT_PROJECTED"
]);
function Xe(e) {
	let t = e;
	return typeof t == "object" && !!t && typeof t.status == "number" && typeof t.code == "string";
}
var Ze = (e) => typeof e == "object" && !!e && typeof e.path == "string" && typeof e.message == "string";
function Qe(e) {
	if (Xe(e)) {
		if (e.status === 401) return { type: "signed-out" };
		if (e.status === 403 && Ye.has(e.code)) return {
			type: "access-lost",
			code: e.code
		};
		let t = {
			code: e.code,
			status: e.status
		};
		return typeof e.detail == "string" && (t.detail = e.detail), typeof e.requestId == "string" && (t.requestId = e.requestId), Array.isArray(e.fieldErrors) && (t.fieldErrors = e.fieldErrors.filter(Ze).map(({ path: e, message: t }) => ({
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
var $e = {
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
		"task.fields_locked": "The record this task is about was chosen from something this workflow may not read, so the fields that would change it are shown read-only and left out when you submit.",
		"form.required": "Required",
		"form.unsupported": "This field can't be edited here.",
		"form.unsupported_required": "This form has a required field that can't be edited here.",
		"form.uploading": "Wait for the upload to finish.",
		"form.folder_unavailable": "The folder picker couldn't be loaded. Reload the page to try again.",
		"form.folder_retry": "Try again",
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
		"start.running": "Working…",
		"start.completed": "Done.",
		"start.failed": "Something went wrong.",
		"start.rolled_back": "Nothing was saved. {step} failed: {message}",
		"start.paused": "Submitted — now in progress.",
		"start.blocked": "Authorization blocked. An administrator needs to resume this run.",
		"start.action_unavailable": "This action isn't available on this record. Reload and try again.",
		"activity.unavailable": "The activity couldn't be shown. Reload the page to try again.",
		"comments.unavailable": "The comments couldn't be shown. Reload the page to try again.",
		"comments.changed": "This comment changed since you started editing. Your text is kept. Saving again replaces the newer version, which the editor does not show; Cancel to see it, which discards your text.",
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
		"task.fields_locked": "Bản ghi mà công việc này nói đến được chọn từ dữ liệu quy trình này không được đọc, nên các trường sẽ thay đổi bản ghi đó chỉ được xem và không được gửi đi khi bạn gửi.",
		"form.required": "Bắt buộc",
		"form.unsupported": "Không thể nhập trường này ở đây.",
		"form.unsupported_required": "Biểu mẫu có trường bắt buộc không nhập được ở đây.",
		"form.uploading": "Hãy chờ tải lên xong.",
		"form.folder_unavailable": "Không tải được phần chọn thư mục. Hãy tải lại trang để thử lại.",
		"form.folder_retry": "Thử lại",
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
		"start.running": "Đang xử lý…",
		"start.completed": "Hoàn tất.",
		"start.failed": "Đã xảy ra lỗi.",
		"start.rolled_back": "Không có gì được lưu. {step} bị lỗi: {message}",
		"start.paused": "Đã gửi — đang xử lý.",
		"start.blocked": "Bị chặn do phân quyền. Quản trị viên cần tiếp tục lượt chạy này.",
		"start.action_unavailable": "Hành động này không khả dụng với bản ghi này. Hãy tải lại và thử lại.",
		"activity.unavailable": "Không thể hiển thị hoạt động. Hãy tải lại trang để thử lại.",
		"comments.unavailable": "Không thể hiển thị bình luận. Hãy tải lại trang để thử lại.",
		"comments.changed": "Bình luận này đã thay đổi kể từ khi bạn bắt đầu sửa. Nội dung bạn nhập vẫn được giữ. Lưu lại sẽ thay thế phiên bản mới hơn mà trình soạn thảo không hiển thị; chọn Hủy để xem phiên bản đó, nội dung bạn nhập sẽ bị bỏ.",
		"status.open": "Mới",
		"status.claimed": "Đã nhận",
		"status.submitted": "Đã gửi",
		"status.cancelled": "Đã hủy"
	}
};
function et(e, t) {
	return e === "en" || e === "vi" ? e : t?.toLowerCase().startsWith("vi") ? "vi" : "en";
}
function tt(e, t) {
	return (n, r) => (t[n] ?? $e[e][n] ?? n).replace(/\{(\w+)\}/g, (e, t) => r && t in r ? String(r[t]) : e);
}
//#endregion
//#region src/props.ts
var nt = /* @__PURE__ */ new Set();
function rt(e, t) {
	typeof t == "string" && !nt.has(e) && (nt.add(e), console.warn(`agentflow: \`${e}\` is a property, not an attribute; set it from JavaScript.`));
}
function it(e, t) {
	if (typeof e == "object" && e && !Array.isArray(e)) return e;
	rt(t, e);
}
function at(e) {
	let t = e == null ? NaN : Math.trunc(Number(e));
	return Number.isNaN(t) ? 25 : Math.min(200, Math.max(1, t));
}
function ot(e, t) {
	if (typeof e == "function") return e;
	rt(t, e);
}
function st(e, t) {
	if (typeof e == "object" && e && typeof e.GET == "function") return e;
	e != null && (typeof e == "string" ? rt(t, e) : nt.has(t) || (nt.add(t), console.warn(`agentflow: \`${t}\` is not an AgentFlow client; ignoring it.`)));
}
//#endregion
//#region src/elements/Provider.svelte
function ct(e, n) {
	te(n, !0);
	let r = _(n, "basePath", 7, Ie), i = _(n, "locale", 7, void 0), o = _(n, "strings", 23, () => ({})), s = _(n, "fetchImpl", 7, void 0), c = _(n, "signing", 7, void 0), l = _(n, "tasks", 7, void 0), u = _(n, "realtime", 7, void 0), d = _(n, "files", 7, void 0), f = _(n, "client", 7, void 0), p = n.$$host, h = V("loading"), v = V(null), y = b(() => st(f(), "client") ?? D({
		baseUrl: `${location.origin}${ze(r())}/api`,
		auth: ie(),
		fetch: ot(s(), "fetchImpl") ?? globalThis.fetch.bind(globalThis)
	})), S = !1, C = (e, t) => {
		S || p.dispatchEvent(new CustomEvent(e, {
			detail: t,
			bubbles: !0,
			composed: !0
		}));
	};
	function w(e) {
		S || (H(h, e, !0), p.dataset.state = e);
	}
	p.dataset.state = "loading";
	function T(e, t) {
		let n = Qe(e);
		return n.type === "signed-out" ? (j(h) !== "signed-out" && (w("signed-out"), C("signed-out", {})), null) : n.type === "access-lost" ? (j(h) !== "access-lost" && (w("access-lost"), C("access-lost", { code: n.code })), null) : (t && w("error"), C("request-failed", {
			code: n.problem.code,
			status: n.problem.status,
			detail: n.problem.detail,
			requestId: n.problem.requestId
		}), n.problem);
	}
	function ee(e) {
		let t = e;
		return t?.name === "AppKeyMissing" && typeof t.kind == "string" && typeof t.key == "string" ? {
			code: Je,
			status: 0,
			detail: j(k).t("notInstalled", { key: `${t.kind}:${t.key}` })
		} : T(e, !1);
	}
	let E = z(() => et(i(), typeof navigator > "u" ? void 0 : navigator.language)), k = z(() => ({
		state: j(h),
		caller: j(v),
		client: y,
		signing: it(c(), "signing") ?? null,
		tasks: it(l(), "tasks") ?? null,
		realtime: it(u(), "realtime") ?? null,
		files: it(d(), "files") ?? null,
		locale: j(E),
		t: tt(j(E), it(o(), "strings") ?? {}),
		report: ee
	})), A = qe(p, Ve, b(() => j(k)));
	x(() => A.set(j(k))), x(() => () => {
		S = !0, A.dispose();
	}), (async () => {
		try {
			let e = await K(y.GET("/caller"));
			H(v, e, !0), w("ready"), C("session-ready", { caller: e });
		} catch (e) {
			T(e, !0);
		}
	})();
	var M = {
		get basePath() {
			return r();
		},
		set basePath(e = Ie) {
			r(e), t();
		},
		get locale() {
			return i();
		},
		set locale(e = void 0) {
			i(e), t();
		},
		get strings() {
			return o();
		},
		set strings(e = {}) {
			o(e), t();
		},
		get fetchImpl() {
			return s();
		},
		set fetchImpl(e = void 0) {
			s(e), t();
		},
		get signing() {
			return c();
		},
		set signing(e = void 0) {
			c(e), t();
		},
		get tasks() {
			return l();
		},
		set tasks(e = void 0) {
			l(e), t();
		},
		get realtime() {
			return u();
		},
		set realtime(e = void 0) {
			u(e), t();
		},
		get files() {
			return d();
		},
		set files(e = void 0) {
			d(e), t();
		},
		get client() {
			return f();
		},
		set client(e = void 0) {
			f(e), t();
		}
	}, N = g(), P = O(N);
	return U(P, n, "default", {}, null), m(e, N), a(M);
}
S(ct, {
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
	tasks: {},
	realtime: {},
	files: {},
	client: {}
}, ["default"], [], { mode: "open" });
//#endregion
//#region src/define.ts
var lt = /* @__PURE__ */ new WeakSet();
function ut(e, t, n, r, i) {
	let a = t[n];
	N(a, r) && !lt.has(t) && (lt.add(t), console.warn(`An older copy of the AgentFlow ${i} registered ${e} first; this page uses it, not this copy.`, {
		tag: e,
		registered: a ?? null,
		loaded: r
	}));
}
function dt(e, t, n, r, i) {
	for (let [a, o] of Object.entries(t)) {
		let t = e.get(a);
		t ? t !== o.element && ut(a, t, n, r, i) : e.define(a, o.element);
	}
}
//#endregion
//#region src/kit-tag.ts
async function ft(e, t, n = customElements) {
	let r = n.get(e);
	if (r) return ut(e, r, "kitVersion", I, "UI kit");
	let i = (await t()).default;
	Object.defineProperty(i.element, "kitVersion", { value: I }), dt(n, { [e]: i }, "kitVersion", I, "UI kit");
}
//#endregion
//#region src/activity-feed.ts
var pt = "af-activity-feed";
function mt(e = customElements) {
	return ft(pt, () => import("./chunks/ActivityFeed-shVGn19t.js").then((e) => e.n), e);
}
function ht({ realtime: e, matches: t, reload: n, win: r = window }) {
	let i, a = () => {
		i === void 0 && (i = setTimeout(() => {
			i = void 0, n();
		}, 250));
	}, o = () => {
		(!e || e.status() === "polling") && n();
	}, s = e?.onEvent((e) => {
		t(e) && a();
	}), c = e?.onRefetch(a);
	return r.addEventListener("focus", o), () => {
		s?.(), c?.(), r.removeEventListener("focus", o), i !== void 0 && clearTimeout(i), i = void 0;
	};
}
//#endregion
//#region src/use-agentflow.svelte.ts
function gt(e) {
	let t = V(null);
	return x(() => We(e, Ve, (e) => H(t, e))), { get current() {
		return j(t);
	} };
}
//#endregion
//#region src/elements/RecordActivity.svelte
var _t = /* @__PURE__ */ new WeakMap(), vt = s("<br/> ", 1), yt = s("<p part=\"error\" class=\"error svelte-st2tvt\" role=\"alert\"><!> <!></p>"), bt = s("<p part=\"error\" class=\"error svelte-st2tvt\" role=\"alert\"> </p>"), xt = s("<p class=\"muted svelte-st2tvt\" role=\"status\"> </p>"), St = s("<af-activity-feed></af-activity-feed>", 2), Ct = s("<!> <!>", 1), wt = {
	hash: "svelte-st2tvt",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}.muted.svelte-st2tvt {color:var(--agentflow-muted, #667085);}.error.svelte-st2tvt {color:var(--agentflow-danger, #b42318);}"
};
function Tt(e, i) {
	te(i, !0), r(e, wt);
	let s = _(i, "entity", 7, void 0), c = _(i, "record", 7, void 0), l = _(i, "kinds", 7, void 0), u = i.$$host, d = gt(u), f = z(() => d.current?.state === "ready"), v = z(() => d.current?.realtime ?? null), y = z(() => (l() ?? "").split(",").map((e) => e.trim()).filter(Boolean)), S = z(() => j(y).join(",")), w = V([]), E = V(null), D = V({}), k = V(!1), A = V(!1), N = V(null), P = V(customElements.get(pt) !== void 0), F = V(!1), I = 0, R = 0, B = /* @__PURE__ */ new Set(), U = /* @__PURE__ */ new Set(), W = (e) => new Set(e.flatMap((e) => e.instance_id ? [e.instance_id] : [])), re = z(() => j(y).length === 0 || j(y).includes("run")), ie = (e) => {
		let t = /* @__PURE__ */ new Set();
		return e.filter((e) => !t.has(e.id) && !!t.add(e.id));
	};
	function G(e, t) {
		let n = Date.parse(e.occurred_at), r = Date.parse(t.occurred_at);
		return n !== r && !Number.isNaN(n) && !Number.isNaN(r) ? r - n : e.occurred_at === t.occurred_at ? e.id < t.id ? 1 : e.id > t.id ? -1 : 0 : e.occurred_at < t.occurred_at ? 1 : -1;
	}
	function q(e, t) {
		let n = [...e];
		for (let e of t) {
			let t = n.findIndex((t) => G(e, t) < 0);
			n.splice(t === -1 ? n.length : t, 0, e);
		}
		return n;
	}
	async function J(e) {
		let t = d.current;
		if (t) try {
			let n = await K(t.client.GET("/entities/{entity_id}", { params: { path: { entity_id: e } } }));
			s() === e && H(D, Object.fromEntries((n.fields ?? []).map((e) => [e.key, e.label])));
		} catch (e) {
			t.report(e);
		}
	}
	async function ae(e, t) {
		let n = d.current, r = e, i = [...r.items];
		for (let e = 1; n && s() && c() && i.length === 0 && r.next_cursor !== null && e < 5; e++) {
			if (r = await Ce(n.client, {
				entity_id: s(),
				record_id: c(),
				kinds: j(y),
				cursor: r.next_cursor,
				limit: 25
			}), !t()) return null;
			i.push(...r.items);
		}
		return {
			items: i,
			next_cursor: r.next_cursor
		};
	}
	async function oe() {
		let e = d.current;
		if (!e || !j(f) || !s() || !c()) return;
		let t = I, n = [...B];
		B.clear();
		try {
			let r = await Ce(e.client, {
				entity_id: s(),
				record_id: c(),
				kinds: j(y),
				limit: 25
			});
			if (t !== I || (j(w).length === 0 && (r = await ae(r, () => t === I)), !r)) return;
			let i = ie(r.items), a = new Set(j(w).map((e) => e.id)), o = i.filter((e) => !a.has(e.id));
			j(w).length === 0 ? (H(w, i), H(E, r.next_cursor, !0)) : r.next_cursor !== null && o.length === i.length && i.length > 0 ? (H(w, i), H(E, r.next_cursor, !0), R++, H(A, !1)) : H(w, q(j(w), o)), H(N, null);
			let l = W(j(w));
			U.size > 500 && U.clear();
			for (let e of n) l.has(e) || U.add(e);
		} catch (n) {
			let r = e.report(n);
			t === I && H(N, r, !0);
		} finally {
			t === I && H(k, !0);
		}
	}
	let Y = null;
	function X() {
		if (Y && Y.at === I) return Y.again = !0, Y.done;
		let e = {
			at: I,
			again: !1,
			done: Promise.resolve()
		};
		return e.done = (async () => {
			do
				e.again = !1, await oe();
			while (e.again && e.at === I);
		})().finally(() => {
			Y === e && (Y = null);
		}), Y = e, e.done;
	}
	async function se() {
		let e = d.current, t = j(E);
		if (!e || !t || j(A) || !s() || !c()) return;
		let n = I, r = R;
		H(A, !0);
		try {
			let i = () => n === I && r === R, a = await Ce(e.client, {
				entity_id: s(),
				record_id: c(),
				kinds: j(y),
				cursor: t,
				limit: 25
			});
			if (!i()) return;
			let o = await ae(a, i);
			if (!o) return;
			H(w, ie([...j(w), ...o.items])), H(E, o.next_cursor, !0), H(N, null);
		} catch (t) {
			let i = e.report(t);
			n === I && r === R && H(N, i, !0);
		} finally {
			n === I && r === R && H(A, !1);
		}
	}
	_t.set(u, () => X()), x(() => {
		s(), c(), j(S), I++, H(w, []), H(E, null), H(k, !1), H(A, !1), H(N, null), B.clear(), U.clear();
	}), x(() => {
		if (s(), H(D, {}), !j(f) || !s()) return;
		let e = s();
		b(() => J(e));
	}), x(() => {
		j(f) && s() && c() && (j(S), b(() => X()));
	}), x(() => {
		if (!j(f) || !s() || !c()) return;
		let e = {
			entity_id: s(),
			record_id: c()
		}, t = j(v);
		return b(() => ht({
			realtime: t,
			matches: (t) => {
				if (we(t, e, W(j(w)))) return !0;
				let { kind: n, id: r } = t.subject;
				return n !== "instance" || !j(re) || U.has(r) ? !1 : (B.add(r), !0);
			},
			reload: () => void X()
		}));
	}), x(() => {
		j(P) || mt().then(() => H(P, !0), (e) => {
			H(F, !0), d.current?.report(e);
		});
	}), x(() => () => {
		_t.delete(u);
	});
	var ce = {
		get entity() {
			return s();
		},
		set entity(e = void 0) {
			s(e), t();
		},
		get record() {
			return c();
		},
		set record(e = void 0) {
			c(e), t();
		},
		get kinds() {
			return l();
		},
		set kinds(e = void 0) {
			l(e), t();
		}
	}, le = g(), Z = O(le), Q = (e) => {
		let t = z(() => d.current.t);
		var r = Ct(), i = O(r), a = (e) => {
			var n = yt(), r = M(n), i = (e) => {
				var t = ne();
				L(() => h(t, j(N).detail)), m(e, t);
			}, a = (e) => {
				var n = ne();
				L((e) => h(n, e), [() => j(t)("common.error", { code: j(N).code })]), m(e, n);
			};
			p(r, (e) => {
				j(N).code === "APP_KEY_MISSING" ? e(i) : e(a, -1);
			});
			var s = C(r, 2), c = (e) => {
				var n = vt(), r = C(O(n), 1, !0);
				L((e) => h(r, e), [() => j(t)("common.request_id", { id: j(N).requestId })]), m(e, n);
			};
			p(s, (e) => {
				j(N).requestId && e(c);
			}), o(n), m(e, n);
		};
		p(i, (e) => {
			j(N) && e(a);
		});
		var s = C(i, 2), c = (e) => {
			var n = bt(), r = T(n, !0);
			L((e) => h(r, e), [() => j(t)("activity.unavailable")]), m(e, n);
		}, l = (e) => {
			var n = xt(), r = T(n, !0);
			L((e) => h(r, e), [() => j(t)("common.loading")]), m(e, n);
		}, u = (e) => {
			var t = St();
			n(t, "part", "feed"), L(() => n(t, "events", j(w))), L(() => n(t, "fields", j(D))), L(() => n(t, "hasMore", j(E) !== null)), L(() => n(t, "loading", !j(k) || j(A))), L(() => n(t, "locale", d.current.locale)), ee("af-activity-more", t, se), m(e, t);
		};
		p(s, (e) => {
			j(F) ? e(c) : j(P) ? (j(w).length > 0 || !j(N)) && e(u, 2) : e(l, 1);
		}), m(e, r);
	};
	return p(Z, (e) => {
		d.current && j(f) && s() && c() && e(Q);
	}), m(e, le), a(ce);
}
S(Tt, {
	entity: {
		attribute: "entity",
		type: "String"
	},
	record: {
		attribute: "record",
		type: "String"
	},
	kinds: {
		attribute: "kinds",
		type: "String"
	}
}, [], [], { mode: "open" }, (e) => class extends e {
	reload() {
		return _t.get(this)?.() ?? Promise.resolve();
	}
});
//#endregion
//#region src/attachment-url.ts
function Et(e, t) {
	let n = "";
	return e.GET("/attachments/{attachment_id}/download", {
		params: { path: { attachment_id: t } },
		fetch: (e) => (n = e.url, Promise.resolve(new Response(null, { status: 204 })))
	}), n;
}
//#endregion
//#region src/comment-thread.ts
var Dt = "af-comment-thread", Ot = [
	Dt,
	"af-markdown",
	"af-rich-editor",
	"af-file-upload",
	"af-confirm"
], kt = (e = customElements) => Ot.every((t) => e.get(t) !== void 0);
async function At(e = customElements) {
	await Promise.all([
		ft(Dt, () => import("./chunks/CommentThread-DA0UcbuJ.js").then((e) => e.n), e),
		ft("af-markdown", () => import("./chunks/Markdown-EQKvkMql.js").then((e) => e.n), e),
		ft("af-rich-editor", () => import("./chunks/RichEditor-BX9PMBF3.js").then((e) => e.n), e),
		ft("af-file-upload", () => import("./chunks/FileUpload-D06JFZdh.js").then((e) => e.n), e),
		ft("af-confirm", () => import("./chunks/Confirm-CgWER7zz.js").then((e) => e.n), e)
	]);
}
//#endregion
//#region src/elements/RecordComments.svelte
var jt = /* @__PURE__ */ new WeakMap(), Mt = s("<br/> ", 1), Nt = s("<p part=\"error\" class=\"error svelte-1o2ifv8\" role=\"alert\"><!> <!></p>"), Pt = s("<p part=\"error\" class=\"error svelte-1o2ifv8\" role=\"alert\"> </p>"), Ft = s("<p class=\"muted svelte-1o2ifv8\" role=\"status\"> </p>"), It = s("<af-comment-thread></af-comment-thread>", 2), Lt = s("<!> <!>", 1), Rt = {
	hash: "svelte-1o2ifv8",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}.muted.svelte-1o2ifv8 {color:var(--agentflow-muted, #667085);}.error.svelte-1o2ifv8 {color:var(--agentflow-danger, #b42318);}"
};
function zt(e, i) {
	te(i, !0), r(e, Rt);
	let s = _(i, "entity", 7, void 0), c = _(i, "record", 7, void 0), l = /* @__PURE__ */ new Set([
		403,
		404,
		409
	]), u = i.$$host, f = gt(u), S = z(() => f.current?.state === "ready"), w = z(() => f.current?.realtime ?? null), E = V([]), D = V(null), k = V(!1), A = V(!1), N = V(!1), P = V(!1), F = V(!1), I = V(null), R = V(!1), B = V(null), U = V([]), W = V(null), re = V(v(kt())), ie = V(!1), G = 0, q = 0, J = null, ae = /* @__PURE__ */ new Map(), oe = (e) => {
		let t = /* @__PURE__ */ new Set();
		return e.filter((e) => !t.has(e.id) && !!t.add(e.id));
	};
	async function Y() {
		let e = f.current;
		if (!e || !j(S) || !s() || !c()) return;
		let t = G;
		try {
			let n = await Te(e.client, {
				entity_id: s(),
				record_id: c(),
				limit: 25
			});
			if (t !== G) return;
			let r = oe(n.items), i = n.prev_cursor ?? null;
			H(k, n.can_comment, !0), H(A, n.closed, !0);
			let a = j(E).length === 0 || i === null ? -1 : j(E).findIndex((e) => r.some((t) => t.id === e.id));
			j(E).length === 0 ? (H(E, r), H(D, i, !0)) : a === -1 ? (H(E, r), H(D, i, !0), q++, H(F, !1)) : H(E, [...j(E).slice(0, a), ...r]), H(P, !0), H(I, null);
		} catch (n) {
			let r = e.report(n);
			t === G && H(I, r, !0);
		} finally {
			t === G && H(N, !0);
		}
	}
	let X = null;
	function se() {
		if (X && X.at === G) return X.again = !0, X.done;
		let e = {
			at: G,
			again: !1,
			done: Promise.resolve()
		};
		return e.done = (async () => {
			do
				e.again = !1, await Y();
			while (e.again && e.at === G);
		})().finally(() => {
			X === e && (X = null);
		}), X = e, e.done;
	}
	async function ce() {
		let e = f.current, t = j(D);
		if (!e || !t || j(F) || !s() || !c()) return;
		let n = G, r = q;
		H(F, !0);
		try {
			let i = await Te(e.client, {
				entity_id: s(),
				record_id: c(),
				before: t,
				limit: 25
			});
			if (n !== G || r !== q) return;
			let a = new Set(j(E).map((e) => e.id));
			H(E, [...i.items.filter((e) => !a.has(e.id)), ...j(E)]), H(D, i.prev_cursor ?? null, !0), H(I, null);
		} catch (t) {
			let i = e.report(t);
			n === G && r === q && H(I, i, !0);
		} finally {
			n === G && r === q && H(F, !1);
		}
	}
	function le(e, t) {
		if (t !== G) return;
		H(R, !1);
		let n = f.current;
		H(B, n && e ? n.t("common.error", { code: e.code }) : null, !0), e && l.has(e.status) && se();
	}
	function Z() {
		let e = f.current;
		return !e || !j(S) || !s() || !c() || j(R) ? null : (H(R, !0), H(B, null), H(U, []), {
			ctx: e,
			target: {
				entity_id: s(),
				record_id: c()
			},
			at: G,
			thread: j(W)
		});
	}
	function Q(e) {
		H(R, !1), e.thread?.settle(), se();
	}
	async function ue(e) {
		let { body: t, attachment_ids: n } = e.detail, r = Z();
		if (!r) return;
		let i = n ?? [], a = i.join(",");
		(!J || J.body !== t || J.files !== a) && (J = {
			key: crypto.randomUUID(),
			body: t,
			files: a
		});
		try {
			let e = await Ee(r.ctx.client, {
				...r.target,
				body: t,
				...i.length > 0 ? { attachment_ids: i } : {},
				idempotency_key: J.key
			});
			if (r.at !== G) return;
			J = null, j(E).some((t) => t.id === e.comment.id) || H(E, [...j(E), e.comment]), H(U, e.unnotified ?? []), Q(r);
		} catch (e) {
			le(r.ctx.report(e), r.at);
		}
	}
	async function de(e) {
		let { id: t, body: n, attachment_ids: r, version: i } = e.detail, a = j(E).find((e) => e.id === t);
		if (!a) return;
		let o = Z();
		if (!o) return;
		let s = i ?? a.edited_at ?? a.created_at, c = ae.get(t), l = c && c.from === s ? c.to : s;
		try {
			let e = await De(o.ctx.client, {
				...o.target,
				comment: {
					...a,
					edited_at: l
				},
				body: n,
				attachment_ids: r ?? []
			});
			if (o.at !== G) return;
			ae.delete(t), H(E, j(E).map((n) => n.id === t ? e.comment : n)), H(U, e.unnotified ?? []), Q(o);
		} catch (e) {
			let n = o.ctx.report(e);
			if (n?.code === "STALE_VERSION") {
				if (await se(), o.at !== G) return;
				let e = j(E).find((e) => e.id === t);
				e && ae.set(t, {
					from: s,
					to: e.edited_at ?? e.created_at
				}), H(R, !1), H(B, o.ctx.t("comments.changed"), !0);
			} else le(n, o.at);
		}
	}
	async function fe(e) {
		let { id: t } = e.detail, n = Z();
		if (n) try {
			if (await Oe(n.ctx.client, {
				...n.target,
				comment_id: t
			}), n.at !== G) return;
			H(E, j(E).filter((e) => e.id !== t)), Q(n);
		} catch (e) {
			le(n.ctx.report(e), n.at);
		}
	}
	function pe(e) {
		let t = f.current, n = e.detail, r = Array.isArray(n?.files) ? n.files : [];
		if (!t || r.length === 0) return;
		let i = n.start ?? 0;
		if (t.files) {
			try {
				t.files.preview(r, { start: i }).catch((e) => t.report(e));
			} catch (e) {
				t.report(e);
			}
			return;
		}
		window.open(Et(t.client, (r[i] ?? r[0]).file), "_blank", "noopener");
	}
	let me = z(() => {
		let e = f.current;
		return !e || !s() || !c() ? null : Fe(e.client, {
			entity_id: s(),
			record_id: c(),
			...e.locale === "vi" ? { copy: je } : {}
		});
	}), he = z(() => {
		let e = f.current;
		if (!e || !s() || !c()) return null;
		let t = {
			entity: s(),
			record: c()
		};
		return async (n) => {
			let r = new FormData();
			r.append("entity_id", t.entity), r.append("record_id", t.record), r.append("comment", "true"), r.append("file", n);
			try {
				return { id: (await K(e.client.POST("/attachments", { body: r }))).id };
			} catch (t) {
				throw e.report(t), t;
			}
		};
	});
	jt.set(u, () => se()), x(() => {
		s(), c(), G++, H(E, []), H(D, null), H(k, !1), H(A, !1), H(N, !1), H(P, !1), H(F, !1), H(I, null), H(R, !1), H(B, null), H(U, []), J = null, ae.clear();
	}), x(() => {
		j(S) && s() && c() && b(() => se());
	}), x(() => {
		if (!j(S) || !s() || !c()) return;
		let e = {
			entity_id: s(),
			record_id: c()
		}, t = j(w);
		return b(() => ht({
			realtime: t,
			matches: (t) => ke(t, e),
			reload: () => void se()
		}));
	}), x(() => {
		j(re) || At().then(() => H(re, !0), (e) => {
			H(ie, !0), f.current?.report(e);
		});
	}), x(() => () => {
		jt.delete(u);
	});
	var ge = {
		get entity() {
			return s();
		},
		set entity(e = void 0) {
			s(e), t();
		},
		get record() {
			return c();
		},
		set record(e = void 0) {
			c(e), t();
		}
	}, _e = g(), ve = O(_e), ye = (e) => {
		let t = z(() => f.current.t);
		var r = Lt(), i = O(r), a = (e) => {
			var n = Nt(), r = M(n), i = (e) => {
				var t = ne();
				L(() => h(t, j(I).detail)), m(e, t);
			}, a = (e) => {
				var n = ne();
				L((e) => h(n, e), [() => j(t)("common.error", { code: j(I).code })]), m(e, n);
			};
			p(r, (e) => {
				j(I).code === "APP_KEY_MISSING" ? e(i) : e(a, -1);
			});
			var s = C(r, 2), c = (e) => {
				var n = Mt(), r = C(O(n), 1, !0);
				L((e) => h(r, e), [() => j(t)("common.request_id", { id: j(I).requestId })]), m(e, n);
			};
			p(s, (e) => {
				j(I).requestId && e(c);
			}), o(n), m(e, n);
		};
		p(i, (e) => {
			j(I) && e(a);
		});
		var l = C(i, 2), u = (e) => {
			var n = Pt(), r = T(n, !0);
			L((e) => h(r, e), [() => j(t)("comments.unavailable")]), m(e, n);
		}, _ = (e) => {
			var n = Ft(), r = T(n, !0);
			L((e) => h(r, e), [() => j(t)("common.loading")]), m(e, n);
		}, v = (e) => {
			var t = g(), r = O(t);
			d(r, () => `${s()}/${c()}`, (e) => {
				var t = It();
				n(t, "part", "thread"), L(() => n(t, "comments", j(E))), L(() => n(t, "canComment", j(k))), L(() => n(t, "closed", j(A))), L(() => n(t, "hasEarlier", j(D) !== null)), L(() => n(t, "busy", j(R))), L(() => n(t, "error", j(B))), L(() => n(t, "unnotified", j(U))), L(() => n(t, "mentions", j(me))), L(() => n(t, "upload", j(he))), L(() => n(t, "locale", f.current.locale)), y(t, (e) => H(W, e), () => j(W)), ee("af-comment-submit", t, ue), ee("af-comment-edit", t, de), ee("af-comment-delete", t, fe), ee("af-comment-earlier", t, ce), ee("af-comment-open-file", t, pe), m(e, t);
			}), m(e, t);
		};
		p(l, (e) => {
			j(ie) ? e(u) : !j(re) || !j(N) ? e(_, 1) : j(P) && e(v, 2);
		}), m(e, r);
	};
	return p(ve, (e) => {
		f.current && j(S) && s() && c() && e(ye);
	}), m(e, _e), a(ge);
}
S(zt, {
	entity: {
		attribute: "entity",
		type: "String"
	},
	record: {
		attribute: "record",
		type: "String"
	}
}, [], [], { mode: "open" }, (e) => class extends e {
	reload() {
		return jt.get(this)?.() ?? Promise.resolve();
	}
});
//#endregion
//#region src/FieldList.svelte
var Bt = s("<span class=\"req svelte-olgbsr\">*</span>"), Vt = s("<input part=\"input\" type=\"checkbox\" class=\"svelte-olgbsr\"/>"), Ht = s("<option> </option>"), Ut = s("<select part=\"input\" class=\"svelte-olgbsr\"><option>—</option><!></select>"), Wt = s("<button part=\"field-retry\" type=\"button\" class=\"svelte-olgbsr\"> </button>"), Gt = s("<p part=\"field-error\" class=\"error svelte-olgbsr\" role=\"alert\"> </p> <!>", 1), Kt = s("<p part=\"notice\" class=\"muted svelte-olgbsr\" role=\"status\"> </p>"), qt = s("<af-folder-source></af-folder-source>", 2), Jt = s("<p part=\"notice\" class=\"muted svelte-olgbsr\"> </p>"), Yt = s("<input part=\"input\" class=\"svelte-olgbsr\"/>"), Xt = s("<p class=\"muted svelte-olgbsr\"> </p>"), Zt = s("<p part=\"field-error\" class=\"error svelte-olgbsr\" role=\"alert\"> </p>"), Qt = s("<div part=\"field\" class=\"field svelte-olgbsr\"><label part=\"label\" class=\"svelte-olgbsr\"> <!></label> <!> <!> <!></div>"), $t = {
	hash: "svelte-olgbsr",
	code: ".field.svelte-olgbsr {display:grid;gap:4px;margin-block-end:var(--agentflow-gap, 12px);}label.svelte-olgbsr {font-weight:600;}.req.svelte-olgbsr {color:var(--agentflow-danger, #b42318);}.muted.svelte-olgbsr {color:var(--agentflow-muted, #667085);margin:0;font-size:0.9em;}.error.svelte-olgbsr {color:var(--agentflow-danger, #b42318);margin:0;}input.svelte-olgbsr, select.svelte-olgbsr {font:inherit;padding:6px 8px;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);}\n  /* Marked unavailable while its retry loads, but still focusable: a disabled button would drop focus. */[part='field-retry'][aria-disabled='true'].svelte-olgbsr {opacity:0.6;cursor:progress;}"
};
function en(i, s) {
	te(s, !0), r(i, $t);
	let l = _(s, "fields", 7), y = _(s, "values", 31, () => v({})), b = _(s, "errors", 23, () => ({})), x = _(s, "disabled", 7, !1), S = _(s, "t", 7), w = _(s, "folders", 7, null), D = _(s, "foldersReady", 7, !0), k = _(s, "foldersFailed", 7, !1), A = _(s, "foldersRetrying", 7, !1), N = _(s, "onFolderRetry", 7), F = _(s, "uploading", 31, () => v({})), I = _(s, "refusing", 31, () => v({})), ne = {
		text: "text",
		email: "email",
		date: "date",
		datetime: "datetime-local",
		number: "number",
		integer: "number"
	};
	var z = {
		get fields() {
			return l();
		},
		set fields(e) {
			l(e), t();
		},
		get values() {
			return y();
		},
		set values(e = {}) {
			y(e), t();
		},
		get errors() {
			return b();
		},
		set errors(e = {}) {
			b(e), t();
		},
		get disabled() {
			return x();
		},
		set disabled(e = !1) {
			x(e), t();
		},
		get t() {
			return S();
		},
		set t(e) {
			S(e), t();
		},
		get folders() {
			return w();
		},
		set folders(e = null) {
			w(e), t();
		},
		get foldersReady() {
			return D();
		},
		set foldersReady(e = !0) {
			D(e), t();
		},
		get foldersFailed() {
			return k();
		},
		set foldersFailed(e = !1) {
			k(e), t();
		},
		get foldersRetrying() {
			return A();
		},
		set foldersRetrying(e = !1) {
			A(e), t();
		},
		get onFolderRetry() {
			return N();
		},
		set onFolderRetry(e) {
			N(e), t();
		},
		get uploading() {
			return F();
		},
		set uploading(e = {}) {
			F(e), t();
		},
		get refusing() {
			return I();
		},
		set refusing(e = {}) {
			I(e), t();
		}
	}, V = g(), H = O(V);
	return f(H, 17, l, (e) => e.key, (t, r) => {
		var i = Qt(), a = M(i), s = M(a, !0), l = C(s), _ = (e) => {
			var t = Bt();
			L((e) => u(t, "title", e), [() => S()("form.required")]), m(e, t);
		};
		p(l, (e) => {
			j(r).required && e(_);
		}), o(a);
		var v = C(a, 2), te = (e) => {
			var t = Vt();
			R(t), L(() => {
				u(t, "id", `f-${j(r).key}`), t.disabled = x() || j(r).locked;
			}), B(t, () => y()[j(r).key], (e) => y(y()[j(r).key] = e, !0)), m(e, t);
		}, z = (t) => {
			var n = Ut(), i = M(n);
			i.value = i.__value = "";
			var a = C(i);
			f(a, 17, () => j(r).options ?? [], (e) => e.value, (e, t) => {
				var n = Ht(), r = T(n, !0), i = {};
				L(() => {
					h(r, j(t).label), i !== (i = j(t).value) && (n.value = (n.__value = i) ?? "");
				}), m(e, n);
			}), o(n), e(n), L(() => {
				u(n, "id", `f-${j(r).key}`), n.disabled = x() || j(r).locked;
			}), E(n, () => y()[j(r).key], (e) => y(y()[j(r).key] = e, !0)), m(t, n);
		}, V = (e) => {
			var t = Gt(), n = O(t), i = T(n, !0), a = C(n, 2), o = (e) => {
				var t = Wt(), n = T(t, !0);
				L((e) => {
					u(t, "data-field", j(r).key), u(t, "aria-disabled", A() ? "true" : "false"), h(n, e);
				}, [() => S()("form.folder_retry")]), P("click", t, function(...e) {
					N()?.apply(this, e);
				}), m(e, t);
			};
			p(a, (e) => {
				N() && e(o);
			}), L((e) => h(i, e), [() => S()("form.folder_unavailable")]), m(e, t);
		}, H = (e) => {
			var t = Kt(), n = T(t, !0);
			L((e) => h(n, e), [() => S()("common.loading")]), m(e, t);
		}, U = (e) => {
			var t = g(), i = O(t);
			d(i, () => w().round, (e) => {
				var t = qt();
				n(t, "part", "folder-source"), L(() => n(t, "id", `f-${j(r).key}`)), n(t, "role", "group"), L(() => n(t, "aria-labelledby", `l-${j(r).key}`)), L(() => n(t, "resumeSet", w().resumeSets?.[j(r).key] ?? null)), L(() => n(t, "sources", w().sources)), L(() => n(t, "workflow", w().workflow)), L(() => n(t, "field", j(r).key)), L(() => n(t, "folder", j(r).folder)), L(() => n(t, "locale", w().locale)), L(() => n(t, "disabled", x())), ee("af-folder-upload-started", t, (e) => w().uploadStarted(j(r).key, e.detail.setId)), ee("af-folder-busy", t, (e) => F(F()[j(r).key] = e.detail.busy, !0)), ee("af-folder-change", t, (e) => {
					y(y()[j(r).key] = e.detail.value, !0), I(I()[j(r).key] = !!e.detail.preview?.refusal, !0);
				}), m(e, t);
			}), m(e, t);
		}, W = (e) => {
			var t = Jt(), n = T(t, !0);
			L((e) => h(n, e), [() => S()("form.unsupported")]), m(e, t);
		}, re = (e) => {
			var t = Yt();
			R(t), L(() => {
				u(t, "id", `f-${j(r).key}`), u(t, "type", ne[j(r).kind]), u(t, "step", j(r).kind === "integer" ? "1" : j(r).kind === "number" ? "any" : void 0), t.disabled = x() || j(r).locked;
			}), c(t, () => y()[j(r).key], (e) => y(y()[j(r).key] = e, !0)), m(e, t);
		};
		p(v, (e) => {
			j(r).kind === "boolean" ? e(te) : j(r).kind === "choice" ? e(z, 1) : j(r).kind === "folder" && w() && (k() || A()) ? e(V, 2) : j(r).kind === "folder" && w() && !D() ? e(H, 3) : j(r).kind === "folder" && w() ? e(U, 4) : j(r).kind === "unsupported" || j(r).kind === "folder" ? e(W, 5) : e(re, -1);
		});
		var ie = C(v, 2), G = (e) => {
			var t = Xt(), n = T(t, !0);
			L(() => h(n, j(r).description)), m(e, t);
		};
		p(ie, (e) => {
			j(r).description && e(G);
		});
		var K = C(ie, 2), q = (e) => {
			var t = Jt(), n = T(t, !0);
			L((e) => h(n, e), [() => S()("form.uploading")]), m(e, t);
		}, J = (e) => {
			var t = Zt(), n = T(t, !0);
			L(() => h(n, b()[j(r).key])), m(e, t);
		};
		p(K, (e) => {
			F()[j(r).key] ? e(q) : b()[j(r).key] && e(J, 1);
		}), o(i), L(() => {
			u(a, "id", `l-${j(r).key}`), u(a, "for", j(r).kind === "folder" ? void 0 : `f-${j(r).key}`), h(s, j(r).label);
		}), m(t, i);
	}), m(i, V), a(z);
}
A(["click"]), S(en, {
	fields: {},
	values: {},
	errors: {},
	disabled: {},
	t: {},
	folders: {},
	foldersReady: {},
	foldersFailed: {},
	foldersRetrying: {},
	onFolderRetry: {},
	uploading: {},
	refusing: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/app-keys.ts
var tn = class extends Error {
	kind;
	key;
	constructor(e, t) {
		super(`${e}:${t} is not installed`), this.kind = e, this.key = t, this.name = "AppKeyMissing";
	}
};
async function nn(e, t, n) {
	let r = le(e);
	await r.load();
	let i = r.id(`${t}:${n}`);
	if (i === null) throw new tn(t, n);
	return i;
}
//#endregion
//#region src/form.ts
var rn = (e) => typeof e == "object" && !!e && !Array.isArray(e);
function an(e) {
	let t = e.type;
	if (typeof t == "string") return t;
	if (Array.isArray(t)) return t.find((e) => e !== "null");
}
function on(e) {
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
function sn(e) {
	if (Array.isArray(e.oneOf)) {
		let t = e.oneOf.filter((e) => !(rn(e) && e.const === null)), n = [];
		for (let e of t) {
			if (!rn(e) || typeof e.const != "string") return { kind: "unsupported" };
			n.push({
				value: e.const,
				label: typeof e.title == "string" ? e.title : e.const
			});
		}
		return n.length > 0 ? on(n) : { kind: "unsupported" };
	}
	if (Array.isArray(e.enum)) {
		if (!e.enum.every((e) => typeof e == "string" || e === null)) return { kind: "unsupported" };
		let t = e.enum.filter((e) => typeof e == "string");
		return t.length > 0 ? on(t.map((e) => ({
			value: e,
			label: e
		}))) : { kind: "unsupported" };
	}
	let t = an(e);
	if (t === "string") switch (e.format) {
		case void 0: return { kind: "text" };
		case "date": return { kind: "date" };
		case "date-time": return { kind: "datetime" };
		case "email": return { kind: "email" };
		default: return { kind: "unsupported" };
	}
	return t === "number" ? { kind: "number" } : t === "integer" ? { kind: "integer" } : t === "boolean" ? { kind: "boolean" } : { kind: "unsupported" };
}
function cn(e) {
	return rn(e) && e.type === "array" && rn(e.items) && e.items.type === "string" && e.items.format === "attachment";
}
function ln(e) {
	return rn(e) && rn(e.properties) && Object.values(e.properties).some(cn);
}
var un = /^#\/properties\/([^/]+)$/;
function dn(e, t = []) {
	if (!rn(e)) return t;
	if (e.type === "Control" && typeof e.scope == "string") {
		let n = un.exec(e.scope)?.[1];
		n !== void 0 && t.push(n);
	}
	if (Array.isArray(e.elements)) for (let n of e.elements) dn(n, t);
	return t;
}
function fn(e, t, n = []) {
	if (!rn(e) || !rn(e.properties)) return [];
	let r = e.properties, i = new Set(Array.isArray(e.required) ? e.required : []), a = (e) => typeof e == "string" && Object.hasOwn(r, e), o = Array.isArray(e["x-order"]) ? e["x-order"].filter(a) : [], s = new Map(n.flatMap((e) => e.folder ? [[e.key, e.folder]] : []));
	return [.../* @__PURE__ */ new Set([
		...dn(t).filter(a),
		...o,
		...Object.keys(r)
	])].map((e) => {
		let t = rn(r[e]) ? r[e] : {}, n = cn(t) ? s.get(e) : void 0, a = {
			key: e,
			label: typeof t.title == "string" ? t.title : e,
			required: i.has(e),
			...n ? {
				kind: "folder",
				folder: n
			} : sn(t)
		};
		return typeof t.description == "string" && (a.description = t.description), a;
	});
}
function pn(e) {
	return e.flatMap((e) => e.folder ? [{
		key: e.key,
		label: e.title || e.key,
		kind: "folder",
		required: e.required === !0,
		folder: e.folder
	}] : []);
}
var mn = (e) => String(e).padStart(2, "0");
function hn(e) {
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? "" : `${t.getFullYear()}-${mn(t.getMonth() + 1)}-${mn(t.getDate())}T${mn(t.getHours())}:${mn(t.getMinutes())}`;
}
function gn(e, t) {
	let n = rn(t) ? t : {}, r = {};
	for (let t of e) {
		let e = n[t.key];
		t.kind === "boolean" ? r[t.key] = e === !0 : t.kind === "datetime" ? r[t.key] = typeof e == "string" ? hn(e) : "" : t.kind === "unsupported" ? r[t.key] = e : t.kind === "folder" ? r[t.key] = null : r[t.key] = e ?? "";
	}
	return r;
}
var _n = (e) => e == null || e === "";
function vn(e, t) {
	let n = {};
	for (let r of e) {
		if (r.locked) continue;
		let e = t[r.key];
		if (r.kind === "boolean") {
			n[r.key] = e === !0;
			continue;
		}
		_n(e) || (r.kind === "number" || r.kind === "integer" ? n[r.key] = Number(e) : r.kind === "datetime" ? n[r.key] = new Date(String(e)).toISOString() : n[r.key] = e);
	}
	return n;
}
function yn(e, t) {
	return e.filter((e) => e.required && e.kind !== "boolean" && e.kind !== "unsupported" && _n(t[e.key])).map((e) => e.key);
}
function bn(e, t = !1) {
	return e.filter((e) => e.required && (e.kind === "unsupported" || t && e.kind === "folder"));
}
function xn(e) {
	let t = {};
	for (let n of e ?? []) {
		let e = n.path.replace(/^\//, "").split("/")[0] ?? "";
		t[e] ??= n.message;
	}
	return t;
}
//#endregion
//#region src/elements/RecordTable.svelte
var Sn = s("<form part=\"search\" role=\"search\"><input type=\"search\" class=\"svelte-1xcrvv6\"/></form>"), Cn = s("<button part=\"create-button\" type=\"button\" class=\"svelte-1xcrvv6\"> </button>"), wn = s("<div part=\"toolbar\" class=\"svelte-1xcrvv6\"><!> <!></div>"), Tn = s("<p part=\"notice\" class=\"error svelte-1xcrvv6\"> </p>"), En = s("<form part=\"form\"><!> <!> <div part=\"actions\" class=\"svelte-1xcrvv6\"><button part=\"button\" type=\"button\" class=\"secondary svelte-1xcrvv6\"> </button> <button part=\"button\" type=\"button\" class=\"svelte-1xcrvv6\"> </button></div></form>"), Dn = s("<br/> ", 1), On = s("<p part=\"error\" class=\"error svelte-1xcrvv6\" role=\"alert\"><!> <!></p>"), kn = s("<p part=\"empty\" class=\"muted svelte-1xcrvv6\"> </p>"), An = s("<th class=\"svelte-1xcrvv6\"> </th>"), jn = s("<td part=\"cell\" class=\"svelte-1xcrvv6\"> </td>"), Mn = s("<tr part=\"row\" tabindex=\"0\" class=\"svelte-1xcrvv6\"></tr>"), Nn = s("<table part=\"table\" class=\"svelte-1xcrvv6\"><thead><tr></tr></thead><tbody></tbody></table>"), Pn = s("<p class=\"muted svelte-1xcrvv6\"> </p>"), Fn = s("<button part=\"load-more\" type=\"button\" class=\"svelte-1xcrvv6\"> </button>"), In = s("<!> <!> <!> <!> <!> <!>", 1), Ln = {
	hash: "svelte-1xcrvv6",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}[part='toolbar'].svelte-1xcrvv6 {display:flex;gap:8px;justify-content:space-between;margin-block-end:var(--agentflow-gap, 12px);}input[type='search'].svelte-1xcrvv6 {font:inherit;padding:6px 8px;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);}table.svelte-1xcrvv6 {width:100%;border-collapse:collapse;}th.svelte-1xcrvv6, td.svelte-1xcrvv6 {text-align:start;padding:8px;border-block-end:1px solid var(--agentflow-border, #eaecf0);}tr[part='row'].svelte-1xcrvv6 {cursor:pointer;}tr[part='row'].svelte-1xcrvv6:hover, tr[part='row'].svelte-1xcrvv6:focus {background:color-mix(in srgb, var(--agentflow-accent, #1570ef) 8%, transparent);}.muted.svelte-1xcrvv6 {color:var(--agentflow-muted, #667085);}.error.svelte-1xcrvv6 {color:var(--agentflow-danger, #b42318);}[part='actions'].svelte-1xcrvv6 {display:flex;gap:8px;}button.svelte-1xcrvv6 {font:inherit;padding:6px 14px;cursor:pointer;border-radius:var(--agentflow-radius, 6px);border:1px solid var(--agentflow-accent, #1570ef);background:var(--agentflow-accent, #1570ef);color:var(--agentflow-accent-text, #fff);}button.secondary.svelte-1xcrvv6, [part='load-more'].svelte-1xcrvv6 {background:transparent;color:var(--agentflow-accent, #1570ef);}button.svelte-1xcrvv6:disabled {opacity:0.5;cursor:default;}"
};
function Rn(e, n) {
	te(n, !0), r(e, Ln);
	let i = _(n, "entityId", 7), s = _(n, "entityKey", 7), l = _(n, "columns", 7), d = _(n, "pageSize", 7), y = _(n, "filter", 7), S = n.$$host, w = gt(S), E = z(() => w.current?.state === "ready"), D = V(null), k = z(() => i() || j(D)), A = z(() => it(y(), "filter")), N = z(() => j(A) ? JSON.stringify(j(A)) : ""), F = z(() => at(d())), I = V(null), B = V(v([])), U = V(null), W = V(""), ie = V(!1), G = V(!1), q = V(null), J = V(null), ae = V(!1), oe = V(!1), Y = V(v({})), X = V(v({})), se = z(() => bn(j(J) ?? [])), ce = z(() => {
		if (!j(I)) return [];
		let e = l()?.split(",").map((e) => e.trim()).filter(Boolean);
		return e?.length ? e.map((e) => j(I).fields.find((t) => t.key === e)).filter((e) => !!e) : j(I).fields.filter((e) => !e.system).slice(0, 5);
	}), le = (e, t) => S.dispatchEvent(new CustomEvent(e, {
		detail: t,
		bubbles: !0,
		composed: !0
	})), Z = 0, Q = 0;
	async function ue(e) {
		let t = w.current;
		if (!t) return;
		let n = Z, r;
		try {
			r = await K(t.client.GET("/entities/{entity_id}", { params: { path: { entity_id: e } } }));
		} catch (e) {
			let r = t.report(e);
			n === Z && H(q, r, !0);
			return;
		}
		if (n === Z && (H(I, r, !0), r.effective_capabilities?.write)) try {
			let r = await K(t.client.GET("/entities/{entity_id}/create-form", { params: { path: { entity_id: e } } }));
			n === Z && H(J, fn(r.schema_json, r.ui_schema_json), !0);
		} catch (e) {
			let r = e?.status;
			if (r === 403 || r === 404) return;
			let i = t.report(e);
			n === Z && H(q, i, !0);
		}
	}
	async function de(e) {
		let t = w.current, n = j(k);
		if (!t || !n || !j(I)) return;
		let r = ++Q;
		H(G, !0), H(q, null), e || H(U, null);
		try {
			let i = { entity_id: n }, a = j(A) ? await K(t.client.POST("/entities/{entity_id}/records/query", {
				params: { path: i },
				body: {
					filter: j(A),
					limit: j(F),
					cursor: e
				}
			})) : await K(t.client.GET("/entities/{entity_id}/records", { params: {
				path: i,
				query: {
					limit: j(F),
					cursor: e,
					q: j(W) || void 0
				}
			} }));
			if (r !== Q) return;
			H(B, e ? [...j(B), ...a.items] : a.items, !0), H(U, a.next_cursor, !0), H(ie, !0);
		} catch (n) {
			let i = t.report(n);
			r === Q && (H(q, i, !0), e || H(B, [], !0));
		} finally {
			r === Q && H(G, !1);
		}
	}
	function fe() {
		H(Y, gn(j(J) ?? [], {}), !0), H(X, {}, !0), H(ae, !0);
	}
	async function pe() {
		let e = w.current, t = j(k);
		if (!e || !t || !j(J) || j(oe) || j(se).length > 0) return;
		let n = yn(j(J), j(Y));
		if (n.length > 0) {
			H(X, Object.fromEntries(n.map((t) => [t, e.t("form.required")])), !0);
			return;
		}
		let r = Z;
		H(oe, !0), H(q, null), H(X, {}, !0);
		let i;
		try {
			i = await K(e.client.POST("/entities/{entity_id}/records", {
				params: { path: { entity_id: t } },
				body: { form_payload: vn(j(J), j(Y)) }
			}));
		} catch (t) {
			let n = e.report(t);
			if (r !== Z) return;
			H(oe, !1), H(X, xn(n?.fieldErrors), !0), H(q, n, !0);
			return;
		}
		le("record-created", { recordId: i.id }), r === Z && (H(oe, !1), H(ae, !1), await de());
	}
	x(() => {
		i(), s(), H(D, null);
	}), x(() => {
		j(k), s(), Z++, Q++, H(I, null), H(J, null), H(W, ""), H(ae, !1), H(oe, !1), H(B, [], !0), H(U, null), H(ie, !1), H(G, !1), H(q, null);
	}), x(() => {
		if (!j(E) || i() || !s()) return;
		let e = s();
		b(async () => {
			let t = w.current;
			if (!t) return;
			let n = Z;
			try {
				let r = await nn(t.client, "entity", e);
				n === Z && H(D, r, !0);
			} catch (e) {
				let r = t.report(e);
				n === Z && H(q, r, !0);
			}
		});
	}), x(() => {
		if (!j(E) || !j(k)) return;
		let e = j(k);
		b(() => ue(e));
	}), x(() => {
		j(E) && j(I) && (j(N), j(F), b(() => de()));
	});
	var me = {
		get entityId() {
			return i();
		},
		set entityId(e) {
			i(e), t();
		},
		get entityKey() {
			return s();
		},
		set entityKey(e) {
			s(e), t();
		},
		get columns() {
			return l();
		},
		set columns(e) {
			l(e), t();
		},
		get pageSize() {
			return d();
		},
		set pageSize(e) {
			d(e), t();
		},
		get filter() {
			return y();
		},
		set filter(e) {
			y(e), t();
		}
	}, he = g(), ge = O(he), _e = (e) => {
		let t = z(() => w.current.t);
		var n = In(), r = O(n), i = (e) => {
			var n = wn(), r = M(n), i = (e) => {
				var n = Sn(), r = M(n);
				R(r), o(n), L((e, t) => {
					u(r, "placeholder", e), u(r, "aria-label", t);
				}, [() => j(t)("records.search"), () => j(t)("records.search")]), ee("submit", n, (e) => {
					e.preventDefault(), de();
				}), c(r, () => j(W), (e) => H(W, e)), m(e, n);
			};
			p(r, (e) => {
				j(A) || e(i);
			});
			var a = C(r, 2), s = (e) => {
				var n = Cn(), r = T(n, !0);
				L((e) => h(r, e), [() => j(t)("records.create")]), P("click", n, fe), m(e, n);
			};
			p(a, (e) => {
				j(J) && !j(ae) && e(s);
			}), o(n), m(e, n);
		};
		p(r, (e) => {
			j(I) && e(i);
		});
		var a = C(r, 2), s = (e) => {
			var n = En(), r = M(n);
			en(r, {
				get fields() {
					return j(J);
				},
				get errors() {
					return j(X);
				},
				get disabled() {
					return j(oe);
				},
				get t() {
					return j(t);
				},
				get values() {
					return j(Y);
				},
				set values(e) {
					H(Y, e, !0);
				}
			});
			var i = C(r, 2), a = (e) => {
				var n = Tn(), r = T(n, !0);
				L((e) => h(r, e), [() => j(t)("form.unsupported_required")]), m(e, n);
			};
			p(i, (e) => {
				j(se).length > 0 && e(a);
			});
			var s = C(i, 2), c = M(s), l = T(c, !0), u = C(c, 2), d = T(u, !0);
			o(s), o(n), L((e, t) => {
				h(l, e), u.disabled = j(oe) || j(se).length > 0, h(d, t);
			}, [() => j(t)("common.cancel"), () => j(t)("records.save")]), ee("submit", n, (e) => e.preventDefault()), P("click", c, () => H(ae, !1)), P("click", u, pe), m(e, n);
		};
		p(a, (e) => {
			j(ae) && j(J) && e(s);
		});
		var l = C(a, 2), d = (e) => {
			var n = On(), r = M(n), i = (e) => {
				var t = ne();
				L(() => h(t, j(q).detail)), m(e, t);
			}, a = (e) => {
				var n = ne();
				L((e) => h(n, e), [() => j(t)("common.error", { code: j(q).code })]), m(e, n);
			};
			p(r, (e) => {
				j(q).code === "APP_KEY_MISSING" ? e(i) : e(a, -1);
			});
			var s = C(r, 2), c = (e) => {
				var n = Dn(), r = C(O(n), 1, !0);
				L((e) => h(r, e), [() => j(t)("common.request_id", { id: j(q).requestId })]), m(e, n);
			};
			p(s, (e) => {
				j(q).requestId && e(c);
			}), o(n), m(e, n);
		};
		p(l, (e) => {
			j(q) && e(d);
		});
		var g = C(l, 2), _ = (e) => {
			var n = kn(), r = T(n, !0);
			L((e) => h(r, e), [() => j(t)("records.empty")]), m(e, n);
		}, v = (e) => {
			var n = Nn(), r = M(n), i = M(r);
			f(i, 21, () => j(ce), (e) => e.key, (e, t) => {
				var n = An(), r = T(n, !0);
				L(() => h(r, j(t).label)), m(e, n);
			}), o(i), o(r);
			var a = C(r);
			f(a, 21, () => j(B), (e) => e.id, (e, n) => {
				var r = Mn();
				f(r, 21, () => j(ce), (e) => e.key, (e, r) => {
					var i = jn(), a = T(i, !0);
					L((e) => h(a, e), [() => re(j(n).body[j(r).key], w.current.locale, j(t))]), m(e, i);
				}), o(r), P("click", r, () => le("record-select", { recordId: j(n).id })), P("keydown", r, (e) => e.key === "Enter" && le("record-select", { recordId: j(n).id })), m(e, r);
			}), o(a), o(n), m(e, n);
		};
		p(g, (e) => {
			j(ie) && !j(G) && j(B).length === 0 && !j(q) ? e(_) : j(B).length > 0 && e(v, 1);
		});
		var y = C(g, 2), b = (e) => {
			var n = Pn(), r = T(n, !0);
			L((e) => h(r, e), [() => j(t)("common.loading")]), m(e, n);
		};
		p(y, (e) => {
			j(G) && e(b);
		});
		var x = C(y, 2), S = (e) => {
			var n = Fn(), r = T(n, !0);
			L((e) => h(r, e), [() => j(t)("common.load_more")]), P("click", n, () => de(j(U) ?? void 0)), m(e, n);
		};
		p(x, (e) => {
			j(U) && !j(G) && e(S);
		}), m(e, n);
	};
	return p(ge, (e) => {
		w.current && j(E) && e(_e);
	}), m(e, he), a(me);
}
A(["click", "keydown"]), S(Rn, {
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
//#region src/folder-source.ts
var zn = "af-folder-source";
function Bn(e = customElements) {
	return ft(zn, () => import("./chunks/FolderSource-DF9tab27.js").then((e) => e.n), e);
}
//#endregion
//#region src/elements/StartForm.svelte
var Vn = s("<br/> ", 1), Hn = s("<p part=\"error\" class=\"error svelte-1o3y7sj\" role=\"alert\"><!> <!></p>"), Un = s("<p part=\"error\" class=\"error svelte-1o3y7sj\" role=\"alert\"> </p>"), Wn = s("<option> </option>"), Gn = s("<label part=\"picker\" class=\"svelte-1o3y7sj\"> <select class=\"svelte-1o3y7sj\"><option>—</option><!></select></label>"), Kn = s("<p class=\"muted svelte-1o3y7sj\"> </p>"), qn = s("<p part=\"notice\" class=\"muted svelte-1o3y7sj\" role=\"status\"> </p>"), Jn = s("<p part=\"notice\"><!></p>"), Yn = s("<p part=\"notice\" class=\"error svelte-1o3y7sj\" role=\"alert\"> </p>"), Xn = s("<p class=\"run svelte-1o3y7sj\"> </p>"), Zn = s("<p part=\"notice\" class=\"error svelte-1o3y7sj\"> </p>"), Qn = s("<form part=\"form\"><!> <!> <!> <div part=\"actions\"><button part=\"button\" type=\"button\" class=\"svelte-1o3y7sj\"> </button></div></form>"), $n = s("<!> <!> <!> <!> <!> <!> <!>", 1), er = {
	hash: "svelte-1o3y7sj",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}[part='picker'].svelte-1o3y7sj {display:grid;gap:4px;margin-block-end:var(--agentflow-gap, 12px);font-weight:600;}select.svelte-1o3y7sj {font:inherit;padding:6px 8px;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);}.run.svelte-1o3y7sj {margin-block:0 var(--agentflow-gap, 12px);font-weight:600;}.muted.svelte-1o3y7sj {color:var(--agentflow-muted, #667085);}.error.svelte-1o3y7sj {color:var(--agentflow-danger, #b42318);}button.svelte-1o3y7sj {font:inherit;padding:6px 14px;cursor:pointer;border-radius:var(--agentflow-radius, 6px);border:1px solid var(--agentflow-accent, #1570ef);background:var(--agentflow-accent, #1570ef);color:var(--agentflow-accent-text, #fff);}button.svelte-1o3y7sj:disabled {opacity:0.5;cursor:default;}"
};
function tr(n, s) {
	te(s, !0), r(n, er);
	let c = _(s, "workflowId", 7), d = _(s, "workflowKey", 7), y = _(s, "entity", 7), S = _(s, "record", 7), w = _(s, "action", 7), D = _(s, "subjectEntity", 7), k = _(s, "subjectRecord", 7), A = _(s, "resumeSets", 7), N = "__name", I = 2e3, R = /* @__PURE__ */ new Set([
		"failed",
		"rolled_back",
		"blocked"
	]), B = {
		completed: "start.completed",
		failed: "start.failed",
		rolled_back: "start.rolled_back",
		paused: "start.paused",
		blocked: "start.blocked",
		started: "start.started"
	};
	function U(e) {
		if (e.auth_blocked) return { outcome: "blocked" };
		if (e.status === "completed") return {
			outcome: "completed",
			detail: e.outcome_label
		};
		if (e.status === "failed" && e.last_rollback) {
			let { node_label: t, node_id: n, message: r } = e.last_rollback;
			return {
				outcome: "rolled_back",
				step: t || n,
				detail: r
			};
		}
		return e.status === "failed" || e.status === "cancelled" ? {
			outcome: "failed",
			detail: e.error_message
		} : e.status === "paused" ? { outcome: "paused" } : null;
	}
	let W = s.$$host, re = gt(W), ie = z(() => re.current?.state === "ready"), G = V(null), q = z(() => c() || j(G)), J = z(() => !!y() || !!S() || !!w()), ae = z(() => !!c() || !!d() || j(J)), oe = V(null), Y = V(null), X = z(() => j(oe) ?? j(Y)), se = V(v([])), ce = V(""), le = V(!1), Z = V(null), fe = V(null), pe = V(!1), me = V(v([])), he = V(v({})), ge = V(v({})), _e = V(null), ve = V(!1), ye = V(null), be = V(!1), xe = V(!1), Ce = V(0), we = V(v({})), Te = V(v({})), Ee = V([]);
	x(() => {
		A(), H(Ee, []);
	});
	let De = null, Oe = (e) => (De?.client === e ? De : De = {
		client: e,
		sources: Se(e)
	}).sources, ke = z(() => {
		let e = re.current;
		if (!e || !j(Z) || !j(me).some((e) => e.kind === "folder")) return null;
		let t = it(A(), "resumeSets"), n = t && Object.fromEntries(Object.entries(t).filter(([, e]) => !j(Ee).includes(e)));
		return {
			sources: Oe(e.client),
			workflow: j(Z).id,
			locale: e.locale,
			round: j(Ce),
			resumeSets: n,
			uploadStarted: Je
		};
	}), Ae = V(customElements.get(zn) !== void 0), je = V(!1), Me = V(0), Ne = V(!1), Pe = z(() => j(ke) !== null);
	x(() => {
		if (j(Me), !j(Pe)) return;
		H(je, !1);
		let e = !0;
		return Bn().then(async () => {
			if (!e) return;
			let t = s.$$host.shadowRoot?.activeElement, n = t?.matches("[part=\"field-retry\"]") ? t.getAttribute("data-field") : null;
			H(Ae, !0), H(Ne, !1), n !== null && (await F(), Fe(`f-${n}`, () => e));
		}, (t) => {
			e && (H(je, !0), H(Ne, !1), re.current?.report(t));
		}), () => {
			e = !1;
		};
	});
	let Fe = async (e, t) => {
		let n = s.$$host.shadowRoot;
		for (let r = 0; r < 30 && t(); r++) {
			if (n?.activeElement || document.activeElement && document.activeElement !== document.body && document.activeElement !== s.$$host) return;
			let t = n?.getElementById(e)?.shadowRoot?.querySelector("input[type=\"radio\"]:checked:not([disabled]), button:not([disabled]):not([aria-disabled=\"true\"])");
			if (t) return t.focus();
			await new Promise((e) => requestAnimationFrame(e));
		}
	}, Ie = () => {
		j(Ne) || (H(Ne, !0), l(Me));
	}, Le = z(() => j(Pe) && !j(Ae) && !j(je)), Re = z(() => bn(j(me), j(Pe) && (j(je) || j(Ne)))), ze = z(() => Object.values(j(we)).some(Boolean) || Object.values(j(Te)).some(Boolean) || j(Le)), Be = (e, t) => W.dispatchEvent(new CustomEvent(e, {
		detail: t,
		bubbles: !0,
		composed: !0
	})), $ = 0, Ve = null;
	function He() {
		let e = Ve;
		e && (Ve = null, clearTimeout(e.timer), e.announce("started"));
	}
	function Ue() {
		$++, He(), H(Z, null), H(fe, null), H(pe, !1), H(me, [], !0), H(he, {}, !0), H(we, {}, !0), H(Te, {}, !0), H(ge, {}, !0), H(_e, null), H(ve, !1), H(ye, null), H(be, !1), H(xe, !1);
	}
	async function We(e) {
		let t = re.current;
		if (!t) return;
		let n = $;
		H(xe, !0);
		let r = [];
		try {
			for await (let e of de((e) => K(t.client.GET("/workflows/startable", { params: { query: e ? {
				limit: 100,
				cursor: e
			} : { limit: 100 } } })))) r.push(e);
		} catch (e) {
			let r = t.report(e);
			n === $ && (H(_e, r, !0), H(xe, !1));
			return;
		}
		if (n !== $ || (H(xe, !1), H(se, r, !0), !e)) return;
		let i = r.find((t) => t.id === e);
		i ? await qe(i) : H(le, !0);
	}
	let Ge = (e) => j(fe) ? gn(j(me), j(fe).params) : {
		...gn(j(me), {}),
		[N]: e.name
	};
	async function Ke(e, t, n) {
		let r = re.current;
		if (!r) return;
		let i = $;
		H(xe, !0);
		try {
			let a = await nn(r.client, "entity", e), [o, s] = await Promise.all([K(r.client.GET("/entities/{entity_id}", { params: { path: { entity_id: a } } })), K(r.client.GET("/entities/{entity_id}/records/{record_id}", { params: { path: {
				entity_id: a,
				record_id: t
			} } }))]);
			if (i !== $) return;
			let c = o.actions.find((e) => e.key === n);
			if (!c) {
				H(xe, !1), H(pe, !0);
				return;
			}
			let l = await K(r.client.GET("/workflows/{workflow_id}/input-contract", { params: { path: { workflow_id: c.workflow_id } } }));
			if (i !== $) return;
			if (!l.version_id) {
				H(xe, !1), H(le, !0);
				return;
			}
			let u = Q(c, s), d = new Set(ue(l, u.contextKeys, u.defaultKeys)), f = l.params_slots.filter((e) => u.params[e.key] == null), p = pn(f);
			if (d.size > 0 && l.form_definition_id) {
				let e = await K(r.client.GET("/workflow-versions/{version_id}/start-form", { params: { path: { version_id: l.version_id } } }));
				if (i !== $) return;
				p = fn(e.form_definition?.schema_json, e.form_definition?.ui_schema_json, f);
			}
			let m = p.filter((e) => d.has(e.key)), h = o.browser_config?.display_field, g = h ? s.body[h] : void 0, _ = typeof g == "string" && g.trim() || typeof g == "number" ? String(g) : s.id;
			H(xe, !1), H(me, m, !0), H(fe, {
				subject: u.subject,
				params: u.params,
				context: {
					entity_id: a,
					action_id: c.id,
					record_id: s.id
				},
				sync: c.mode === "sync"
			}, !0), H(he, gn(m, u.params), !0), H(Z, {
				id: c.workflow_id,
				name: `${c.label} · ${_}`,
				version_id: l.version_id
			}, !0);
		} catch (e) {
			let t = r.report(e);
			if (i !== $) return;
			H(_e, t, !0), H(xe, !1);
		}
	}
	async function qe(e) {
		let t = re.current;
		if (!t || (Ue(), !e)) return;
		let n = $;
		H(xe, !0);
		let r, i = [];
		try {
			r = await K(t.client.GET("/workflow-versions/{version_id}/start-form", { params: { path: { version_id: e.version_id } } })), n === $ && (!r.form_definition || ln(r.form_definition.schema_json)) && (i = (await K(t.client.GET("/workflows/{workflow_id}/input-contract", { params: { path: { workflow_id: e.id } } }))).params_slots);
		} catch (e) {
			let r = t.report(e);
			n === $ && (H(_e, r, !0), H(xe, !1));
			return;
		}
		if (n !== $) return;
		H(xe, !1);
		let a = {
			key: N,
			label: t.t("start.name"),
			kind: "text",
			required: !0
		}, o = r.form_definition;
		H(me, [a, ...o ? fn(o.schema_json, o.ui_schema_json, i) : pn(i)], !0), H(he, Ge(e), !0), H(Z, e, !0);
	}
	let Je = (e, t) => Be("af-folder-upload-started", {
		setId: t,
		field: e
	});
	function Ye(e) {
		H(ce, e, !0), qe(j(se).find((t) => t.id === e) ?? null);
	}
	async function Xe() {
		let e = re.current, t = j(Z);
		if (!e || !t || j(ve) || j(ze) || j(Re).length > 0) return;
		H(ye, null);
		let n = j(fe), r = n ? t.name : String(j(he)[N] ?? "").trim(), i = yn(j(me), n ? j(he) : {
			...j(he),
			[N]: r
		});
		if (i.length > 0) {
			H(ge, Object.fromEntries(i.map((t) => [t, e.t("form.required")])), !0);
			return;
		}
		let a = $;
		H(ve, !0), H(_e, null), H(ge, {}, !0);
		let o;
		try {
			o = await K(e.client.POST("/workflows/{workflow_id}/instances", {
				params: { path: { workflow_id: t.id } },
				body: n ? {
					name: r,
					subject: n.subject,
					params: {
						...Object.fromEntries(Object.entries(n.params).filter(([e]) => !j(me).some((t) => t.key === e))),
						...vn(j(me), j(he))
					},
					version_id: t.version_id,
					action_context: n.context,
					...n.sync ? { wait_ms: 5e3 } : {}
				} : {
					name: r,
					version_id: t.version_id,
					input_payload: vn(j(me).filter((e) => e.key !== N), j(he)),
					...k() ? { subject: {
						kind: "record",
						record_id: k()
					} } : {}
				}
			}));
		} catch (t) {
			let n = e.report(t);
			if (a !== $) return;
			if (H(ve, !1), n?.code === "ACTION_NOT_VISIBLE") {
				H(Z, null), H(pe, !0);
				return;
			}
			H(ge, xn(n?.fieldErrors), !0), H(_e, n, !0);
			return;
		}
		let s = (e) => Be("workflow-started", {
			instanceId: o.id,
			workflowId: t.id,
			...e ? { outcome: e } : {}
		}), c = j(me).flatMap((e) => e.kind === "folder" ? [j(he)[e.key]?.$fileSet] : []).filter((e) => e !== void 0);
		c.length && H(Ee, [...j(Ee), ...c]);
		let u = n?.sync ? U(o) : { outcome: "started" };
		if (n?.sync ? (u || a !== $) && s(u?.outcome ?? "started") : s(), a !== $) return;
		let d = (e) => {
			H(ve, !1), H(be, !1), H(he, Ge(t), !0), H(we, {}, !0), H(Te, {}, !0), l(Ce), H(ye, e, !0);
		};
		if (u) return d(u);
		H(be, !0);
		let f = {
			timer: void 0,
			announce: s
		};
		Ve = f;
		let p = 0, m = async () => {
			p += I;
			let t;
			try {
				t = U(await K(e.client.GET("/instances/{instance_id}", { params: { path: { instance_id: o.id } } })));
			} catch (n) {
				Qe(n).type !== "other" && e.report(n), t = { outcome: "started" };
			}
			if (Ve === f) {
				if (t ??= p >= 3e4 ? { outcome: "started" } : null, !t) {
					f.timer = setTimeout(m, I);
					return;
				}
				Ve = null, s(t.outcome), d(t);
			}
		};
		f.timer = setTimeout(m, I);
	}
	x(() => () => {
		$++, He();
	}), x(() => {
		c(), d(), H(G, null), H(oe, null);
	}), x(() => {
		j(q), d(), y(), S(), w(), Ue(), H(se, [], !0), H(ce, ""), H(le, !1);
	}), x(() => {
		if (!j(ie) || j(J) || c() || !d()) return;
		let e = d();
		b(async () => {
			let t = re.current;
			if (!t) return;
			let n = $;
			try {
				let r = await nn(t.client, "workflow", e);
				n === $ && H(G, r, !0);
			} catch (e) {
				let r = t.report(e);
				n === $ && H(oe, r, !0);
			}
		});
	}), x(() => {
		if (!j(ie) || j(J) || d() && !c() && !j(q)) return;
		let e = j(q);
		b(() => We(e));
	}), x(() => {
		if (!j(ie) || !y() || !S() || !w()) return;
		let [e, t, n] = [
			y(),
			S(),
			w()
		];
		b(() => Ke(e, t, n));
	}), x(() => {
		if (H(Y, null), !j(ie) || j(J) || !D()) return;
		let e = D();
		b(async () => {
			let t = re.current;
			if (t) try {
				await nn(t.client, "entity", e);
			} catch (n) {
				let r = t.report(n);
				D() === e && H(Y, r, !0);
			}
		});
	});
	var Ze = {
		get workflowId() {
			return c();
		},
		set workflowId(e) {
			c(e), t();
		},
		get workflowKey() {
			return d();
		},
		set workflowKey(e) {
			d(e), t();
		},
		get entity() {
			return y();
		},
		set entity(e) {
			y(e), t();
		},
		get record() {
			return S();
		},
		set record(e) {
			S(e), t();
		},
		get action() {
			return w();
		},
		set action(e) {
			w(e), t();
		},
		get subjectEntity() {
			return D();
		},
		set subjectEntity(e) {
			D(e), t();
		},
		get subjectRecord() {
			return k();
		},
		set subjectRecord(e) {
			k(e), t();
		},
		get resumeSets() {
			return A();
		},
		set resumeSets(e) {
			A(e), t();
		}
	}, $e = g(), et = O($e), tt = (t) => {
		let n = z(() => re.current.t);
		var r = g(), a = O(r), s = (e) => {
			var t = Hn(), r = M(t), i = (e) => {
				var t = ne();
				L(() => h(t, j(X).detail)), m(e, t);
			}, a = (e) => {
				var t = ne();
				L((e) => h(t, e), [() => j(n)("common.error", { code: j(X).code })]), m(e, t);
			};
			p(r, (e) => {
				j(X).code === "APP_KEY_MISSING" ? e(i) : e(a, -1);
			});
			var s = C(r, 2), c = (e) => {
				var t = Vn(), r = C(O(t), 1, !0);
				L((e) => h(r, e), [() => j(n)("common.request_id", { id: j(X).requestId })]), m(e, t);
			};
			p(s, (e) => {
				j(X).requestId && e(c);
			}), o(t), m(e, t);
		}, c = (e) => {
			var t = Un(), r = T(t, !0);
			L((e) => h(r, e), [() => j(n)("start.not_startable")]), m(e, t);
		}, l = (t) => {
			var r = $n(), a = O(r), s = (t) => {
				var r = Gn(), i = M(r), a = C(i), s = M(a);
				s.value = s.__value = "";
				var c = C(s);
				f(c, 17, () => j(se), (e) => e.id, (e, t) => {
					var n = Wn(), r = T(n, !0), i = {};
					L(() => {
						h(r, j(t).name), i !== (i = j(t).id) && (n.value = (n.__value = i) ?? "");
					}), m(e, n);
				}), o(a), e(a), o(r), L((e) => h(i, `${e ?? ""} `), [() => j(n)("start.choose")]), E(a, () => j(ce), Ye), m(t, r);
			};
			p(a, (e) => {
				j(ae) || e(s);
			});
			var c = C(a, 2), l = (e) => {
				var t = Kn(), r = T(t, !0);
				L((e) => h(r, e), [() => j(n)("common.loading")]), m(e, t);
			};
			p(c, (e) => {
				j(xe) && e(l);
			});
			var d = C(c, 2), g = (e) => {
				var t = Hn(), r = M(t), i = (e) => {
					var t = ne();
					L(() => h(t, j(_e).detail)), m(e, t);
				}, a = (e) => {
					var t = ne();
					L((e) => h(t, e), [() => j(n)("common.error", { code: j(_e).code })]), m(e, t);
				};
				p(r, (e) => {
					j(_e).code === "APP_KEY_MISSING" ? e(i) : e(a, -1);
				});
				var s = C(r, 2), c = (e) => {
					var t = Vn(), r = C(O(t), 1, !0);
					L((e) => h(r, e), [() => j(n)("common.request_id", { id: j(_e).requestId })]), m(e, t);
				};
				p(s, (e) => {
					j(_e).requestId && e(c);
				}), o(t), m(e, t);
			};
			p(d, (e) => {
				j(_e) && e(g);
			});
			var _ = C(d, 2), v = (e) => {
				var t = qn(), r = T(t, !0);
				L((e) => h(r, e), [() => j(n)("start.running")]), m(e, t);
			};
			p(_, (e) => {
				j(be) && e(v);
			});
			var y = C(_, 2), b = (e) => {
				let t = z(() => R.has(j(ye).outcome));
				var r = Jn();
				let a;
				var s = M(r), c = (e) => {
					var t = ne();
					L((e) => h(t, e), [() => j(n)(B.rolled_back, {
						step: j(ye).step ?? "",
						message: j(ye).detail ?? ""
					})]), m(e, t);
				}, l = (e) => {
					var t = ne();
					L((e) => h(t, e), [() => j(ye).detail || j(n)(B[j(ye).outcome])]), m(e, t);
				};
				p(s, (e) => {
					j(ye).outcome === "rolled_back" ? e(c) : e(l, -1);
				}), o(r), L(() => {
					u(r, "role", j(t) ? "alert" : "status"), a = i(r, 1, "svelte-1o3y7sj", null, a, { error: j(t) });
				}), m(e, r);
			};
			p(y, (e) => {
				j(ye) && e(b);
			});
			var x = C(y, 2), S = (e) => {
				var t = Yn(), r = T(t, !0);
				L((e) => h(r, e), [() => j(n)("start.action_unavailable")]), m(e, t);
			};
			p(x, (e) => {
				j(pe) && e(S);
			});
			var w = C(x, 2), te = (e) => {
				var t = Qn(), r = M(t), i = (e) => {
					var t = Xn(), n = T(t, !0);
					L(() => h(n, j(Z).name)), m(e, t);
				};
				p(r, (e) => {
					j(fe) && e(i);
				});
				var a = C(r, 2);
				en(a, {
					get fields() {
						return j(me);
					},
					get errors() {
						return j(ge);
					},
					get disabled() {
						return j(ve);
					},
					get t() {
						return j(n);
					},
					get folders() {
						return j(ke);
					},
					get foldersReady() {
						return j(Ae);
					},
					get foldersFailed() {
						return j(je);
					},
					get foldersRetrying() {
						return j(Ne);
					},
					onFolderRetry: Ie,
					get values() {
						return j(he);
					},
					set values(e) {
						H(he, e, !0);
					},
					get uploading() {
						return j(we);
					},
					set uploading(e) {
						H(we, e, !0);
					},
					get refusing() {
						return j(Te);
					},
					set refusing(e) {
						H(Te, e, !0);
					}
				});
				var s = C(a, 2), c = (e) => {
					var t = Zn(), r = T(t, !0);
					L((e) => h(r, e), [() => j(n)("form.unsupported_required")]), m(e, t);
				};
				p(s, (e) => {
					j(Re).length > 0 && e(c);
				});
				var l = C(s, 2), u = M(l), d = T(u, !0);
				o(l), o(t), L((e) => {
					u.disabled = j(ve) || j(ze) || j(Re).length > 0, h(d, e);
				}, [() => j(n)("start.submit")]), ee("submit", t, (e) => e.preventDefault()), P("click", u, Xe), m(e, t);
			};
			p(w, (e) => {
				j(Z) && e(te);
			}), m(t, r);
		};
		p(a, (e) => {
			j(X) ? e(s) : j(le) ? e(c, 1) : e(l, -1);
		}), m(t, r);
	};
	return p(et, (e) => {
		re.current && j(ie) && e(tt);
	}), m(n, $e), a(Ze);
}
A(["click"]), S(tr, {
	workflowId: {
		attribute: "workflow-id",
		type: "String"
	},
	workflowKey: {
		attribute: "workflow-key",
		type: "String"
	},
	entity: {
		attribute: "entity",
		type: "String"
	},
	record: {
		attribute: "record",
		type: "String"
	},
	action: {
		attribute: "action",
		type: "String"
	},
	subjectEntity: {
		attribute: "subject-entity",
		type: "String"
	},
	subjectRecord: {
		attribute: "subject-record",
		type: "String"
	},
	resumeSets: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/elements/Task.svelte
var nr = {
	hash: "svelte-je5mvm",
	code: ":host {display:contents;}"
};
function rr(e, n) {
	te(n, !0), r(e, nr);
	let i = _(n, "record", 7, void 0), o = _(n, "entity", 7, void 0), s = {
		loading: "loading",
		ready: "ready",
		not_found: "not-found",
		finished: "finished",
		error: "error"
	}, c = n.$$host, l = gt(c), u = z(() => l.current !== null), d = z(() => l.current?.tasks ?? null), f = qe(c, He, null);
	function p(e) {
		c.getAttribute("state") !== e && c.setAttribute("state", e);
	}
	x(() => {
		let e = j(d), t = i(), n = o();
		if (!j(u)) {
			p("loading");
			return;
		}
		if (!e) {
			p("unsupported");
			return;
		}
		if (!t) {
			p("not-found");
			return;
		}
		return b(() => {
			let r = e.open(n ? {
				record: t,
				entity: n
			} : { record: t }), i = r.state.lastEvent?.seq ?? null, a = !1, o = (e) => {
				if (a) return;
				p(s[e.status] ?? "loading");
				let r = e.lastEvent;
				if (!r || r.seq === i) return;
				i = r.seq;
				let o = {
					recordId: e.record?.id ?? t,
					entityId: e.record?.entity ?? n ?? ""
				};
				r.actionId !== void 0 && (o.actionId = r.actionId), c.dispatchEvent(new CustomEvent(`agentflow-task-${r.kind}`, {
					detail: o,
					bubbles: !0,
					composed: !0
				}));
			};
			o(r.state);
			let l = r.subscribe(o);
			return f.set(r), () => {
				a = !0, l(), f.set(null), r.close();
			};
		});
	}), x(() => () => f.dispose());
	var h = {
		get record() {
			return i();
		},
		set record(e = void 0) {
			i(e), t();
		},
		get entity() {
			return o();
		},
		set entity(e = void 0) {
			o(e), t();
		}
	}, v = g(), y = O(v);
	return U(y, n, "default", {}, null), m(e, v), a(h);
}
S(rr, {
	record: {
		attribute: "record",
		type: "String"
	},
	entity: {
		attribute: "entity",
		type: "String"
	}
}, ["default"], [], { mode: "open" });
//#endregion
//#region src/elements/TaskDetail.svelte
var ir = s("<header part=\"header\"><h2 part=\"title\" class=\"svelte-xgtj81\"> </h2> <p part=\"meta\" class=\"muted svelte-xgtj81\"> </p></header>"), ar = s("<br/> ", 1), or = s("<p part=\"error\" class=\"error svelte-xgtj81\" role=\"alert\"><!> <!> <!></p>"), sr = s("<p class=\"muted svelte-xgtj81\"> </p>"), cr = s("<p part=\"notice\"> </p>"), lr = s("<button part=\"button\" type=\"button\" class=\"secondary svelte-xgtj81\"> </button>"), ur = s("<button part=\"button\" type=\"button\" class=\"svelte-xgtj81\"> </button>"), dr = s("<div part=\"actions\" class=\"svelte-xgtj81\"><button part=\"button\" type=\"button\" class=\"svelte-xgtj81\"> </button></div>"), fr = s("<!> <div part=\"actions\" class=\"svelte-xgtj81\"><!> <!></div>", 1), pr = s("<p part=\"notice\"> </p> <div part=\"actions\" class=\"svelte-xgtj81\"><!></div>", 1), mr = s("<p part=\"notice\" class=\"error svelte-xgtj81\"> </p>"), hr = s("<form part=\"form\"><!> <!> <!> <!> <!> <!> <div part=\"actions\" class=\"svelte-xgtj81\"><!> <!></div></form>"), gr = s("<!> <!> <!> <!>", 1), _r = {
	hash: "svelte-xgtj81",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}h2.svelte-xgtj81 {margin:0 0 4px;font-size:1.25em;}.muted.svelte-xgtj81 {color:var(--agentflow-muted, #667085);margin:0 0 var(--agentflow-gap, 12px);}.error.svelte-xgtj81 {color:var(--agentflow-danger, #b42318);}[part='actions'].svelte-xgtj81 {display:flex;gap:8px;flex-wrap:wrap;}button.svelte-xgtj81 {font:inherit;padding:6px 14px;cursor:pointer;border-radius:var(--agentflow-radius, 6px);border:1px solid var(--agentflow-accent, #1570ef);background:var(--agentflow-accent, #1570ef);color:var(--agentflow-accent-text, #fff);}button.secondary.svelte-xgtj81 {background:transparent;color:var(--agentflow-accent, #1570ef);}button.svelte-xgtj81:disabled {opacity:0.5;cursor:default;}"
};
function vr(e, n) {
	te(n, !0), r(e, _r);
	let i = _(n, "entityId", 7), s = _(n, "entityKey", 7), c = _(n, "recordId", 7), l = {
		id: null,
		name: null,
		title: null
	}, u = n.$$host, d = gt(u), y = z(() => d.current?.state === "ready"), S = V(null), w = V(null), E = 0, D = z(() => i() || j(S)), k = V(null), A = V(v(l)), N = V(!1), F = V(v([])), I = V(v({})), R = V(v({})), B = V(null), U = z(() => j(B) ?? j(w)), W = V(!1), re = V(!1), ie = V(!1), G = z(() => !!d.current?.signing && !j(ie)), q = z(() => !!j(A).id && j(A).id === d.current?.caller?.id), J = z(() => !!j(k) && j(k).step_status !== "open"), ae = z(() => !!j(k) && j(k).step_status === "open" && j(k).signed), oe = z(() => bn(j(F))), Y = z(() => j(k)?.actions.find((e) => e.id === j(k)?.signed_action_id)), X = z(() => j(k)?.actions.filter((e) => e.id !== j(Y)?.id) ?? []), se = z(() => !!j(Y) && j(G)), ce = z(() => {
		let e = j(k)?.entity_view;
		return e?.mode !== "selectable" || e.view?.type !== "grid" && e.view?.type !== "kanban" ? !1 : (e.min_selection ?? 1) > 0;
	}), le = (e, t) => u.dispatchEvent(new CustomEvent(e, {
		detail: t,
		bubbles: !0,
		composed: !0
	}));
	function Z(e) {
		H(k, e, !0);
		let t = new Set(e.locked_fields ?? []);
		H(F, fn(e.form_definition?.schema_json, e.form_definition?.ui_schema_json).map((e) => t.has(e.key) ? {
			...e,
			locked: !0
		} : e), !0), H(I, gn(j(F), e.draft_payload ?? e.prefill ?? {}), !0), H(R, {}, !0);
	}
	let Q = 0;
	async function ue(e, t) {
		let n = d.current;
		if (!n || !e || !t) return;
		let r = Q;
		H(re, !0), H(ie, !1);
		try {
			let i = {
				entity_id: e,
				record_id: t
			}, [a, o] = await Promise.all([n.client.GET("/entities/{entity_id}/records/{record_id}/step", { params: { path: i } }), n.client.GET("/entities/{entity_id}/records/{record_id}", { params: { path: i } })]);
			if (a.response.status === 404) {
				r === Q && (H(k, null), H(A, l, !0)), await K(Promise.resolve(o)), r === Q && H(N, !0);
				return;
			}
			let s = await K(Promise.resolve(a)), c = await K(Promise.resolve(o));
			if (r !== Q) return;
			H(N, !1);
			let u = typeof c.body.claimed_by == "string" ? c.body.claimed_by : null;
			H(A, {
				id: u,
				name: u ? c.ref_labels?.claimed_by ?? null : null,
				title: typeof c.body.title == "string" ? c.body.title : null
			}, !0), Z(s);
		} catch (e) {
			let t = n.report(e);
			r === Q && H(B, t, !0);
		} finally {
			r === Q && H(re, !1);
		}
	}
	async function de(e) {
		let t = d.current;
		if (!t || !j(k)) return;
		let n = j(D), r = c();
		if (!n) return;
		let i = Q;
		H(W, !0), H(B, null);
		try {
			let a = e === "claim" ? "/entities/{entity_id}/records/{record_id}/work/claim" : "/entities/{entity_id}/records/{record_id}/work/release";
			await K(t.client.POST(a, { params: { path: {
				entity_id: n,
				record_id: r
			} } })), i === Q && await ue(n, r), le(e === "claim" ? "task-claimed" : "task-released", {
				recordId: r,
				entityId: n
			});
		} catch (e) {
			let a = t.report(e);
			if (i !== Q) return;
			H(B, a, !0), a && await ue(n, r);
		} finally {
			i === Q && H(W, !1);
		}
	}
	async function fe() {
		let e = d.current;
		if (!e?.signing || !j(k)) return;
		let t = j(D), n = c();
		if (!t) return;
		let r = Q;
		H(W, !0), H(B, null);
		try {
			let i = await e.signing.sign({
				entity: t,
				record: n
			});
			r === Q && (await ue(t, n), i === "nothing_to_sign" && H(ie, !0), i === "closed" && r === Q && !j(B) && (j(N) || j(J) || !j(q)) && le("agentflow-task-changed", {
				recordId: n,
				entityId: t
			})), (i === "signed" || i === "declined") && le(i === "signed" ? "agentflow-signed" : "agentflow-declined", {
				recordId: n,
				entityId: t
			});
		} catch (i) {
			let a = e.report(i);
			if (r !== Q) return;
			H(B, a, !0), a && await ue(t, n);
		} finally {
			r === Q && H(W, !1);
		}
	}
	async function pe(e) {
		let t = d.current;
		if (!t || !j(k)) return;
		let n = yn(j(F), j(I));
		if (n.length > 0) {
			H(R, Object.fromEntries(n.map((e) => [e, t.t("form.required")])), !0);
			return;
		}
		let r = j(D), i = c();
		if (!r) return;
		let a = Q;
		H(W, !0), H(B, null), H(R, {}, !0);
		try {
			let n = vn(j(F), j(I));
			e && (n._action = e);
			let o = await K(t.client.POST("/entities/{entity_id}/records/{record_id}/step/submit", {
				params: { path: {
					entity_id: r,
					record_id: i
				} },
				body: { payload: n }
			}));
			a === Q && Z(o), le("task-submitted", {
				recordId: i,
				entityId: r,
				actionId: e
			});
		} catch (e) {
			let n = t.report(e);
			if (a !== Q) return;
			H(R, xn(n?.fieldErrors), !0), H(B, n, !0);
		} finally {
			a === Q && H(W, !1);
		}
	}
	x(() => {
		i(), s(), E++, H(S, null), H(w, null);
	}), x(() => {
		j(D), s(), c(), Q++, H(k, null), H(N, !1), H(A, l, !0), H(B, null), H(R, {}, !0), H(W, !1), H(re, !1);
	}), x(() => {
		if (!j(y) || i() || !s()) return;
		let e = s();
		b(async () => {
			let t = d.current;
			if (!t) return;
			let n = E;
			try {
				let r = await nn(t.client, "entity", e);
				n === E && H(S, r, !0);
			} catch (e) {
				let r = t.report(e);
				n === E && H(w, r, !0);
			}
		});
	}), x(() => {
		if (!j(y) || !j(D)) return;
		let e = j(D), t = c();
		b(() => ue(e, t));
	});
	var me = {
		get entityId() {
			return i();
		},
		set entityId(e) {
			i(e), t();
		},
		get entityKey() {
			return s();
		},
		set entityKey(e) {
			s(e), t();
		},
		get recordId() {
			return c();
		},
		set recordId(e) {
			c(e), t();
		}
	}, he = g(), ge = O(he), _e = (e) => {
		let t = z(() => d.current.t);
		var n = gr(), r = O(n), i = (e) => {
			var t = ir(), n = M(t), r = T(n, !0), i = C(n, 2), a = T(i, !0);
			o(t), L((e) => {
				h(r, j(A).title ?? j(k).run.step_label), h(a, e);
			}, [() => [j(k).run.workflow_name, j(k).instance_name].filter(Boolean).join(" · ")]), m(e, t);
		};
		p(r, (e) => {
			j(k) && !j(N) && e(i);
		});
		var a = C(r, 2), s = (e) => {
			var n = or(), r = M(n), i = (e) => {
				var t = ne();
				L(() => h(t, j(U).detail)), m(e, t);
			}, a = (e) => {
				var n = ne();
				L((e) => h(n, e), [() => j(t)("common.error", { code: j(U).code })]), m(e, n);
			};
			p(r, (e) => {
				j(U).code === "APP_KEY_MISSING" ? e(i) : e(a, -1);
			});
			var s = C(r, 2), c = (e) => {
				var t = ar(), n = C(O(t), 1, !0);
				L(() => h(n, j(U).detail)), m(e, t);
			};
			p(s, (e) => {
				j(U).status === 422 && !j(U).fieldErrors?.length && j(U).detail && e(c);
			});
			var l = C(s, 2), u = (e) => {
				var n = ar(), r = C(O(n), 1, !0);
				L((e) => h(r, e), [() => j(t)("common.request_id", { id: j(U).requestId })]), m(e, n);
			};
			p(l, (e) => {
				j(U).requestId && e(u);
			}), o(n), m(e, n);
		};
		p(a, (e) => {
			j(U) && e(s);
		});
		var c = C(a, 2), l = (e) => {
			var n = sr(), r = T(n, !0);
			L((e) => h(r, e), [() => j(t)("common.loading")]), m(e, n);
		};
		p(c, (e) => {
			j(re) && e(l);
		});
		var u = C(c, 2), _ = (e) => {
			var n = cr(), r = T(n, !0);
			L((e) => h(r, e), [() => j(t)("task.withheld")]), m(e, n);
		}, v = (e) => {
			let n = (e) => {
				var n = lr(), r = T(n, !0);
				L((e) => {
					n.disabled = j(W), h(r, e);
				}, [() => j(t)("task.release")]), P("click", n, () => de("release")), m(e, n);
			}, r = (e) => {
				var n = ur(), r = T(n, !0);
				L((e) => {
					n.disabled = j(W), h(r, e);
				}, [() => j(t)("task.sign")]), P("click", n, fe), m(e, n);
			};
			var i = g(), a = O(i), s = (e) => {
				var n = cr(), r = T(n, !0);
				L((e) => h(r, e), [() => j(k).step_status === "cancelled" ? j(t)("task.cancelled") : j(t)("task.done")]), m(e, n);
			}, c = (e) => {
				var n = cr(), r = T(n, !0);
				L((e) => h(r, e), [() => j(t)("task.signed_waiting")]), m(e, n);
			}, l = (e) => {
				var n = dr(), r = M(n), i = T(r, !0);
				o(n), L((e) => {
					r.disabled = j(W), h(i, e);
				}, [() => j(t)("task.claim")]), P("click", r, () => de("claim")), m(e, n);
			}, u = (e) => {
				var i = fr(), a = O(i), s = (e) => {
					var n = cr(), r = T(n, !0);
					L((e) => h(r, e), [() => j(t)("task.sign_elsewhere")]), m(e, n);
				};
				p(a, (e) => {
					j(G) || e(s);
				});
				var c = C(a, 2), l = M(c);
				n(l);
				var u = C(l, 2), d = (e) => {
					r(e);
				};
				p(u, (e) => {
					j(G) && e(d);
				}), o(c), m(e, i);
			}, d = (e) => {
				var r = pr(), i = O(r), a = T(i, !0), s = C(i, 2), c = M(s);
				n(c), o(s), L((e) => h(a, e), [() => j(t)("task.select_elsewhere")]), m(e, r);
			}, _ = (e) => {
				var i = hr(), a = M(i);
				{
					let e = z(() => j(W) || j(se));
					en(a, {
						get fields() {
							return j(F);
						},
						get errors() {
							return j(R);
						},
						get disabled() {
							return j(e);
						},
						get t() {
							return j(t);
						},
						get values() {
							return j(I);
						},
						set values(e) {
							H(I, e, !0);
						}
					});
				}
				var s = C(a, 2), c = (e) => {
					var n = mr(), r = T(n, !0);
					L((e) => h(r, e), [() => j(t)("form.unsupported_required")]), m(e, n);
				};
				p(s, (e) => {
					j(oe).length > 0 && !j(se) && e(c);
				});
				var l = C(s, 2), u = (e) => {
					var n = cr(), r = T(n, !0);
					L((e) => h(r, e), [() => j(t)("task.fields_locked")]), m(e, n);
				}, d = z(() => j(F).some((e) => e.locked));
				p(l, (e) => {
					j(d) && e(u);
				});
				var _ = C(l, 2), v = (e) => {
					var n = cr(), r = T(n, !0);
					L((e) => h(r, e), [() => j(t)("task.no_actions")]), m(e, n);
				};
				p(_, (e) => {
					j(k).actions_gated_out && e(v);
				});
				var y = C(_, 2), b = (e) => {
					var n = cr(), r = T(n, !0);
					L((e) => h(r, e), [() => j(t)("task.sign_elsewhere")]), m(e, n);
				};
				p(y, (e) => {
					j(Y) && !j(G) && e(b);
				});
				var x = C(y, 2), S = (e) => {
					var n = cr(), r = T(n, !0);
					L((e) => h(r, e), [() => j(t)("task.sign_in_dialog")]), m(e, n);
				};
				p(x, (e) => {
					j(se) && e(S);
				});
				var w = C(x, 2), E = M(w);
				n(E);
				var te = C(E, 2), D = (e) => {
					r(e);
				}, A = (e) => {
					var t = g(), n = O(t);
					f(n, 17, () => j(X), (e) => e.id, (e, t) => {
						var n = ur(), r = T(n, !0);
						L(() => {
							n.disabled = j(W) || j(oe).length > 0, h(r, j(t).label);
						}), P("click", n, () => pe(j(t).id)), m(e, n);
					}), m(e, t);
				}, N = (e) => {
					var n = ur(), r = T(n, !0);
					L((e) => {
						n.disabled = j(W) || j(oe).length > 0, h(r, e);
					}, [() => j(t)("task.submit")]), P("click", n, () => pe(null)), m(e, n);
				};
				p(te, (e) => {
					j(se) ? e(D) : j(k).actions.length > 0 ? e(A, 1) : j(k).actions_gated_out || e(N, 2);
				}), o(w), o(i), ee("submit", i, (e) => e.preventDefault()), m(e, i);
			}, v = (e) => {
				var n = cr(), r = T(n, !0);
				L((e) => h(r, e), [() => j(A).name ? j(t)("task.claimed_by", { name: j(A).name }) : j(t)("task.claimed_by_someone")]), m(e, n);
			};
			p(a, (e) => {
				j(J) ? e(s) : j(ae) ? e(c, 1) : j(A).id ? j(q) && (j(k).kind === "signature" || j(k).signs && !j(Y)) ? e(u, 3) : j(q) && j(ce) ? e(d, 4) : j(q) ? e(_, 5) : e(v, -1) : e(l, 2);
			}), m(e, i);
		};
		p(u, (e) => {
			j(N) ? e(_) : j(k) && e(v, 1);
		}), m(e, n);
	};
	return p(ge, (e) => {
		d.current && j(y) && e(_e);
	}), m(e, he), a(me);
}
A(["click"]), S(vr, {
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
var yr = s("<br/> ", 1), br = s("<p part=\"error\" class=\"error svelte-j92hy\" role=\"alert\"> <!></p>"), xr = s("<p part=\"empty\" class=\"muted svelte-j92hy\"> </p>"), Sr = s("<tr part=\"row\" tabindex=\"0\" class=\"svelte-j92hy\"><td class=\"svelte-j92hy\"> </td><td class=\"svelte-j92hy\"> </td><td class=\"svelte-j92hy\"> </td><td class=\"svelte-j92hy\"> </td></tr>"), Cr = s("<table part=\"table\" class=\"svelte-j92hy\"><thead><tr><th class=\"svelte-j92hy\"> </th><th class=\"svelte-j92hy\"> </th><th class=\"svelte-j92hy\"> </th><th class=\"svelte-j92hy\"> </th></tr></thead><tbody></tbody></table>"), wr = s("<p class=\"muted svelte-j92hy\"> </p>"), Tr = s("<button part=\"load-more\" type=\"button\" class=\"svelte-j92hy\"> </button>"), Er = s("<!> <!> <!> <!>", 1), Dr = {
	hash: "svelte-j92hy",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}table.svelte-j92hy {width:100%;border-collapse:collapse;}th.svelte-j92hy, td.svelte-j92hy {text-align:start;padding:8px;border-block-end:1px solid var(--agentflow-border, #eaecf0);}tr[part='row'].svelte-j92hy {cursor:pointer;}tr[part='row'].svelte-j92hy:hover, tr[part='row'].svelte-j92hy:focus {background:color-mix(in srgb, var(--agentflow-accent, #1570ef) 8%, transparent);}.muted.svelte-j92hy {color:var(--agentflow-muted, #667085);}.error.svelte-j92hy {color:var(--agentflow-danger, #b42318);}button.svelte-j92hy {font:inherit;margin-block-start:var(--agentflow-gap, 12px);padding:6px 12px;cursor:pointer;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);background:transparent;}"
};
function Or(e, n) {
	te(n, !0), r(e, Dr);
	let i = _(n, "view", 7), s = _(n, "pageSize", 7), c = _(n, "signs", 7), l = z(() => i() === "mine" || i() === "claimable" ? i() : "all"), u = z(() => at(s())), d = z(() => c() === "true" || c() !== "false" && void 0), y = n.$$host, S = gt(y), w = z(() => S.current?.state === "ready"), ee = V(v([])), E = V(null), D = V(!1), k = V(!1), A = V(null), N = 0;
	async function F(e) {
		let t = S.current;
		if (!t) return;
		let n = ++N;
		H(k, !0), H(A, null), e || H(E, null);
		try {
			let r = {
				view: j(l),
				live: !0,
				limit: j(u)
			};
			j(d) !== void 0 && (r.signs = j(d)), e && (r.cursor = e);
			let i = await K(t.client.GET("/work", { params: { query: r } }));
			if (n !== N) return;
			let a = i.items.filter((e) => e.step);
			H(ee, e ? [...j(ee), ...a] : a, !0), H(E, i.next_cursor, !0), H(D, !0);
		} catch (r) {
			let i = t.report(r);
			n === N && (H(A, i, !0), e || H(ee, [], !0));
		} finally {
			n === N && H(k, !1);
		}
	}
	x(() => {
		j(w) && (j(l), j(u), j(d), b(() => F()));
	});
	let I = (e) => y.dispatchEvent(new CustomEvent("task-select", {
		detail: {
			recordId: e.id,
			entityId: e.entity_id
		},
		bubbles: !0,
		composed: !0
	}));
	var ne = {
		get view() {
			return i();
		},
		set view(e) {
			i(e), t();
		},
		get pageSize() {
			return s();
		},
		set pageSize(e) {
			s(e), t();
		},
		get signs() {
			return c();
		},
		set signs(e) {
			c(e), t();
		}
	}, R = g(), B = O(R), U = (e) => {
		let t = z(() => S.current.t);
		var n = Er(), r = O(n), i = (e) => {
			var n = br(), r = M(n), i = C(r), a = (e) => {
				var n = yr(), r = C(O(n), 1, !0);
				L((e) => h(r, e), [() => j(t)("common.request_id", { id: j(A).requestId })]), m(e, n);
			};
			p(i, (e) => {
				j(A).requestId && e(a);
			}), o(n), L((e) => h(r, `${e ?? ""} `), [() => j(t)("common.error", { code: j(A).code })]), m(e, n);
		};
		p(r, (e) => {
			j(A) && e(i);
		});
		var a = C(r, 2), s = (e) => {
			var n = xr(), r = T(n, !0);
			L((e) => h(r, e), [() => j(t)("inbox.empty")]), m(e, n);
		}, c = (e) => {
			var n = Cr(), r = M(n), i = M(r), a = M(i), s = T(a, !0), c = C(a), l = T(c, !0), u = C(c), d = T(u, !0), p = C(u), g = T(p, !0);
			o(i), o(r);
			var _ = C(r);
			f(_, 21, () => j(ee), (e) => e.id, (e, n) => {
				var r = Sr(), i = M(r), a = T(i, !0), s = C(i), c = T(s, !0), l = C(s), u = T(l, !0), d = C(l), f = T(d, !0);
				o(r), L((e, t) => {
					h(a, j(n).step?.step.label || j(n).step?.step.key), h(c, j(n).step?.workflow.name ?? ""), h(u, e), h(f, t);
				}, [() => j(t)(j(n).claimed_by_user_id ? "status.claimed" : "status.open"), () => W(j(n).due_at, S.current.locale)]), P("click", r, () => I(j(n))), P("keydown", r, (e) => e.key === "Enter" && I(j(n))), m(e, r);
			}), o(_), o(n), L((e, t, n, r) => {
				h(s, e), h(l, t), h(d, n), h(g, r);
			}, [
				() => j(t)("inbox.column.task"),
				() => j(t)("inbox.column.workflow"),
				() => j(t)("inbox.column.status"),
				() => j(t)("inbox.column.due")
			]), m(e, n);
		};
		p(a, (e) => {
			j(D) && !j(k) && j(ee).length === 0 && !j(A) && !j(E) ? e(s) : j(ee).length > 0 && e(c, 1);
		});
		var l = C(a, 2), u = (e) => {
			var n = wr(), r = T(n, !0);
			L((e) => h(r, e), [() => j(t)("common.loading")]), m(e, n);
		};
		p(l, (e) => {
			j(k) && e(u);
		});
		var d = C(l, 2), g = (e) => {
			var n = Tr(), r = T(n, !0);
			L((e) => h(r, e), [() => j(t)("common.load_more")]), P("click", n, () => F(j(E) ?? void 0)), m(e, n);
		};
		p(d, (e) => {
			j(E) && !j(k) && e(g);
		}), m(e, n);
	};
	return p(B, (e) => {
		S.current && j(w) && e(U);
	}), m(e, R), a(ne);
}
A(["click", "keydown"]), S(Or, {
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
function kr(e, t) {
	let n = ze(t), r = e ?? `${location.pathname}${location.search}${location.hash}`;
	location.assign(`${n}/auth/login?returnTo=${encodeURIComponent(r)}`);
}
function Ar(e) {
	let t = document.createElement("form");
	t.method = "post", t.action = `${ze(e)}/auth/logout`, t.dataset.agentflowSignOut = "", t.hidden = !0, document.body.append(t), t.submit();
}
//#endregion
//#region src/task-context.ts
function jr(e, t) {
	let n = !1, r = We(e, He, (e) => {
		n = !0, t(e);
	});
	return n || t(null), r;
}
//#endregion
//#region src/index.ts
var Mr = {
	"agentflow-provider": ct,
	"agentflow-task": rr,
	"agentflow-task-inbox": Or,
	"agentflow-task-detail": vr,
	"agentflow-record-table": Rn,
	"agentflow-start-form": tr,
	"agentflow-record-activity": Tt,
	"agentflow-record-comments": zt
}, Nr = k;
for (let e of Object.values(Mr)) Object.defineProperty(e.element, "elementsVersion", { value: Nr });
function Pr(e = customElements) {
	dt(e, Mr, "elementsVersion", Nr, "elements");
}
Pr();
//#endregion
export { Nr as ELEMENTS_VERSION, jr as consumeTask, Pr as defineAgentFlowElements, Bn as defineFolderSource, kr as signIn, Ar as signOut };
