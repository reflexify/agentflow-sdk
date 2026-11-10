import { A as e, B as t, Ct as n, D as r, Dt as i, F as a, H as o, J as s, M as c, Nt as l, Ot as u, R as d, S as f, St as p, T as m, U as h, X as g, Y as _, Z as v, _ as y, at as b, bt as x, et as S, ft as C, g as w, gt as T, h as E, ht as D, k as O, lt as k, m as A, mt as j, n as M, nt as N, pt as P, r as F, rt as ee, st as te, t as I, tt as L, ut as R, vt as z, w as ne, x as re, xt as B } from "./chunks/version-D1aEkxtn.js";
import { n as V, t as H } from "./chunks/format-GenuUIkK.js";
//#region ../agentflow-sdk/dist/auth.js
function U() {
	return {
		async headers() {
			return {};
		},
		credentials: "same-origin"
	};
}
//#endregion
//#region ../agentflow-sdk/dist/errors.js
var W = class extends Error {
	status;
	code;
	detail;
	requestId;
	fieldErrors;
	constructor(e, t, n, r, i) {
		super(n ? `${t}: ${n}` : t), this.status = e, this.code = t, this.detail = n, this.requestId = r, this.fieldErrors = i, this.name = "AgentFlowError";
	}
};
async function G(e) {
	let { data: t, error: n, response: r } = await e;
	if (r.ok && n === void 0) return t;
	let i = n ?? {};
	throw new W(r.status, i.type ?? `HTTP_${r.status}`, i.detail, i.request_id, i.field_errors ?? void 0);
}
//#endregion
//#region ../agentflow-sdk/dist/app/version.js
var ie = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/;
function K(e) {
	let t = typeof e == "string" ? ie.exec(e) : null, n = t ? [
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
var q = /^\d+$/;
function ae(e, t) {
	let n = q.test(e), r = q.test(t);
	return n && r ? Math.sign(Number(e) - Number(t)) : n ? -1 : r ? 1 : e < t ? -1 : +(e > t);
}
function oe(e, t) {
	let n = K(e), r = K(t);
	for (let e = 0; e < 3; e++) if (n.core[e] !== r.core[e]) return n.core[e] < r.core[e] ? -1 : 1;
	if (n.pre.length === 0 || r.pre.length === 0) return Math.sign(r.pre.length - n.pre.length);
	for (let e = 0; e < Math.min(n.pre.length, r.pre.length); e++) {
		let t = ae(n.pre[e], r.pre[e]);
		if (t !== 0) return t;
	}
	return Math.sign(n.pre.length - r.pre.length);
}
//#endregion
//#region ../agentflow-sdk/dist/app/objects.js
var se = 3e4, J = [
	"own",
	"bound",
	"exported"
], ce = /* @__PURE__ */ new WeakMap();
function le(e, t = {}) {
	let n = ce.get(e);
	return n || (n = ue(e, t.recheckAfterMs ?? se), ce.set(e, n)), n;
}
function ue(e, t) {
	let n = null, r = !1, i = null, a = -1, o = 0, s = /* @__PURE__ */ new Set(), c = (e) => void e.catch(() => {});
	function l(t = !1) {
		if (i) return i;
		let u = (async () => {
			await Promise.resolve();
			try {
				let t = await G(e.GET("/app/objects"));
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
	E(e)?.listen((e) => {
		a = Math.max(a, e), n && e > n.revision && (r = !0, s.size > 0 && c(l()));
	});
	let u = () => {
		globalThis.document?.visibilityState === "visible" && Date.now() - o >= t && c(l());
	};
	function d(e, t) {
		if (!n) throw Error("getAppObjects: call load() first");
		let r = n.objects.filter((t) => t.logical_key === e);
		if (t?.source) return r.find((e) => e.source === t.source) ?? null;
		for (let e of J) {
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
			oe(t, t);
			let r = d(e, n);
			if (!r || r.state === "off" || r.contract_version == null) return !1;
			try {
				return oe(r.contract_version, t) >= 0;
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
function de(e, t) {
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
function fe(e, t, n = []) {
	let r = e.form_definition_id ? new Set(n) : /* @__PURE__ */ new Set([...t, ...n]);
	return e.params_slots.map((e) => e.key).filter((e) => !r.has(e));
}
//#endregion
//#region ../agentflow-sdk/dist/paginate.js
async function* Y(e) {
	let t = /* @__PURE__ */ new Set(), n;
	do {
		let r = await e(n);
		if (yield* r.items, n = r.next_cursor ?? void 0, n !== void 0 && t.has(n)) break;
		n !== void 0 && t.add(n);
	} while (n);
}
//#endregion
//#region ../agentflow-sdk/dist/folders.js
function X(e, t) {
	return t === void 0 ? { $fileSet: e } : {
		$fileSet: e,
		path: t
	};
}
var pe = 4, me = 8, Z = 200;
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
async function Q(e, t, n) {
	if (e.isFile) return [{
		path: t,
		file: await n(() => new Promise((t, n) => e.file(t, n)))
	}];
	let r = await n(() => he(e));
	return (await Promise.all(r.map((e) => Q(e, t ? `${t}/${e.name}` : e.name, n)))).flat();
}
var _e = /* @__PURE__ */ new Set([
	".ds_store",
	"thumbs.db",
	"desktop.ini"
]), ve = (e) => _e.has(e.slice(e.lastIndexOf("/") + 1).toLowerCase());
async function ye(e) {
	let t = ge(me);
	return (await Promise.all(e.map(async (n) => {
		if ("isDirectory" in n) return Q(n, e.length === 1 && n.isDirectory ? "" : n.name, t);
		let r = n.webkitRelativePath.indexOf("/");
		return [{
			path: r < 0 ? n.name : n.webkitRelativePath.slice(r + 1),
			file: n
		}];
	}))).flat().filter(({ path: e }) => !ve(e));
}
function be(e) {
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
function xe(e) {
	async function t(t) {
		await G(e.DELETE("/upload-sets/{file_set_id}", { params: { path: { file_set_id: t } } }));
	}
	async function n(n, r, i) {
		let a = [];
		try {
			let t = Y((t) => G(e.GET("/upload-sets/{file_set_id}/files", {
				params: {
					path: { file_set_id: n },
					query: {
						cursor: t,
						limit: Z
					}
				},
				signal: i
			})));
			for await (let e of t) a.push(e);
		} catch (e) {
			if (e instanceof W && e.status === 404) return null;
			throw e;
		}
		return a.length === r.size && a.every((e) => r.get(e.path)?.size === e.byte_size) ? a : (await t(n).catch((e) => {
			if (!(e instanceof W)) throw e;
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
			})), n = await G(e.POST("/upload-sets", {
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
			let t = 0, n = !1, r = (await Promise.allSettled(Array.from({ length: pe }, async () => {
				for (; !n && !a?.aborted && t < d.length;) {
					let r = d[t++], s = new FormData();
					s.append("path", r), s.append("file", o.get(r));
					try {
						await G(e.POST("/upload-sets/{file_set_id}/files", {
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
			a?.throwIfAborted(), await G(e.POST("/upload-sets/{file_set_id}/complete", {
				params: { path: { file_set_id: c } },
				signal: a
			}));
		} catch (e) {
			throw !s && a?.aborted && await t(c).catch(() => void 0), e;
		}
		return {
			value: X(c),
			refused: l
		};
	}
	return {
		async watched() {
			return (await G(e.GET("/watched-folders"))).items;
		},
		subfolders(t, n, r) {
			return G(e.GET("/watched-folders/{file_set_id}/subfolders", { params: {
				path: { file_set_id: t },
				query: {
					path: n,
					cursor: r ?? void 0
				}
			} }));
		},
		preview(t, n, r, i) {
			return G(e.POST("/workflows/{workflow_id}/folder-preview", {
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
			return r(await ye(e), t);
		},
		async uploadFiles(e, t) {
			return r(be(e), t);
		},
		deleteSet: t
	};
}
//#endregion
//#region src/base-path.ts
var Se = "/agentflow", Ce = /^\/(?!\/)/;
function we(e) {
	try {
		return new URL(e, location.origin).origin === location.origin;
	} catch {
		return !1;
	}
}
function Te(e) {
	return e == null ? Se : Ce.test(e) && we(e) ? e.replace(/\/+$/, "") : (console.warn(`agentflow: base-path ${JSON.stringify(e)} is not a path on this origin; using ${Se}.`), Se);
}
//#endregion
//#region src/context.ts
var Ee = "context-request", De = "agentflow-provider-ready", Oe = "agentflow", ke = "agentflow-task";
function Ae(e, t) {
	let n = e;
	return n.context === t && typeof n.callback == "function";
}
function je(e, t, n) {
	let r, i = () => {
		let i = Object.assign(new Event(Ee, {
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
	return window.addEventListener(De, a), i(), () => {
		window.removeEventListener(De, a), r?.();
	};
}
function Me(e) {
	typeof reportError == "function" ? reportError(e) : console.error(e);
}
function Ne(e, t, n) {
	try {
		e(t, n);
	} catch (e) {
		Me(e);
	}
}
function Pe(e, t, n) {
	let r = n, i = /* @__PURE__ */ new Set(), a = (e) => {
		if (!Ae(e, t)) return;
		e.stopPropagation();
		let n = e.callback;
		e.subscribe && i.add(n), Ne(n, r, () => i.delete(n));
	};
	return e.addEventListener(Ee, a), window.dispatchEvent(new Event(De)), {
		set(e) {
			r = e;
			for (let e of [...i]) Ne(e, r, () => i.delete(e));
		},
		dispose() {
			e.removeEventListener(Ee, a), i.clear();
		}
	};
}
//#endregion
//#region src/errors.ts
var Fe = "APP_KEY_MISSING", $ = /* @__PURE__ */ new Set([
	"APP_NOT_ASSIGNED",
	"APP_NOT_INSTALLED",
	"USER_NOT_PROJECTED"
]);
function Ie(e) {
	let t = e;
	return typeof t == "object" && !!t && typeof t.status == "number" && typeof t.code == "string";
}
var Le = (e) => typeof e == "object" && !!e && typeof e.path == "string" && typeof e.message == "string";
function Re(e) {
	if (Ie(e)) {
		if (e.status === 401) return { type: "signed-out" };
		if (e.status === 403 && $.has(e.code)) return {
			type: "access-lost",
			code: e.code
		};
		let t = {
			code: e.code,
			status: e.status
		};
		return typeof e.detail == "string" && (t.detail = e.detail), typeof e.requestId == "string" && (t.requestId = e.requestId), Array.isArray(e.fieldErrors) && (t.fieldErrors = e.fieldErrors.filter(Le).map(({ path: e, message: t }) => ({
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
var ze = {
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
		"form.uploading": "Wait for the upload to finish.",
		"form.folder_unavailable": "The folder picker couldn't be loaded. Reload the page to try again.",
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
		"form.uploading": "Hãy chờ tải lên xong.",
		"form.folder_unavailable": "Không tải được phần chọn thư mục. Hãy tải lại trang để thử lại.",
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
		"status.open": "Mới",
		"status.claimed": "Đã nhận",
		"status.submitted": "Đã gửi",
		"status.cancelled": "Đã hủy"
	}
};
function Be(e, t) {
	return e === "en" || e === "vi" ? e : t?.toLowerCase().startsWith("vi") ? "vi" : "en";
}
function Ve(e, t) {
	return (n, r) => (t[n] ?? ze[e][n] ?? n).replace(/\{(\w+)\}/g, (e, t) => r && t in r ? String(r[t]) : e);
}
//#endregion
//#region src/props.ts
var He = /* @__PURE__ */ new Set();
function Ue(e, t) {
	typeof t == "string" && !He.has(e) && (He.add(e), console.warn(`agentflow: \`${e}\` is a property, not an attribute; set it from JavaScript.`));
}
function We(e, t) {
	if (typeof e == "object" && e && !Array.isArray(e)) return e;
	Ue(t, e);
}
function Ge(e) {
	let t = e == null ? NaN : Math.trunc(Number(e));
	return Number.isNaN(t) ? 25 : Math.min(200, Math.max(1, t));
}
function Ke(e, t) {
	if (typeof e == "function") return e;
	Ue(t, e);
}
function qe(e, t) {
	if (typeof e == "object" && e && typeof e.GET == "function") return e;
	e != null && (typeof e == "string" ? Ue(t, e) : He.has(t) || (He.add(t), console.warn(`agentflow: \`${t}\` is not an AgentFlow client; ignoring it.`)));
}
//#endregion
//#region src/elements/Provider.svelte
function Je(e, t) {
	u(t, !0);
	let r = y(t, "basePath", 7, Se), a = y(t, "locale", 7, void 0), o = y(t, "strings", 23, () => ({})), s = y(t, "fetchImpl", 7, void 0), c = y(t, "signing", 7, void 0), l = y(t, "tasks", 7, void 0), f = y(t, "client", 7, void 0), m = t.$$host, h = x("loading"), v = x(null), S = te(() => qe(f(), "client") ?? A({
		baseUrl: `${location.origin}${Te(r())}/api`,
		auth: U(),
		fetch: Ke(s(), "fetchImpl") ?? globalThis.fetch.bind(globalThis)
	})), C = !1, w = (e, t) => {
		C || m.dispatchEvent(new CustomEvent(e, {
			detail: t,
			bubbles: !0,
			composed: !0
		}));
	};
	function T(e) {
		C || (z(h, e, !0), m.dataset.state = e);
	}
	m.dataset.state = "loading";
	function E(e, t) {
		let n = Re(e);
		return n.type === "signed-out" ? (b(h) !== "signed-out" && (T("signed-out"), w("signed-out", {})), null) : n.type === "access-lost" ? (b(h) !== "access-lost" && (T("access-lost"), w("access-lost", { code: n.code })), null) : (t && T("error"), w("request-failed", {
			code: n.problem.code,
			status: n.problem.status,
			detail: n.problem.detail,
			requestId: n.problem.requestId
		}), n.problem);
	}
	function D(e) {
		let t = e;
		return t?.name === "AppKeyMissing" && typeof t.kind == "string" && typeof t.key == "string" ? {
			code: Fe,
			status: 0,
			detail: b(k).t("notInstalled", { key: `${t.kind}:${t.key}` })
		} : E(e, !1);
	}
	let O = n(() => Be(a(), typeof navigator > "u" ? void 0 : navigator.language)), k = n(() => ({
		state: b(h),
		caller: b(v),
		client: S,
		signing: We(c(), "signing") ?? null,
		tasks: We(l(), "tasks") ?? null,
		locale: b(O),
		t: Ve(b(O), We(o(), "strings") ?? {}),
		report: D
	})), j = Pe(m, Oe, te(() => b(k)));
	R(() => j.set(b(k))), R(() => () => {
		C = !0, j.dispose();
	}), (async () => {
		try {
			let e = await G(S.GET("/caller"));
			z(v, e, !0), T("ready"), w("session-ready", { caller: e });
		} catch (e) {
			E(e, !0);
		}
	})();
	var M = {
		get basePath() {
			return r();
		},
		set basePath(e = Se) {
			r(e), p();
		},
		get locale() {
			return a();
		},
		set locale(e = void 0) {
			a(e), p();
		},
		get strings() {
			return o();
		},
		set strings(e = {}) {
			o(e), p();
		},
		get fetchImpl() {
			return s();
		},
		set fetchImpl(e = void 0) {
			s(e), p();
		},
		get signing() {
			return c();
		},
		set signing(e = void 0) {
			c(e), p();
		},
		get tasks() {
			return l();
		},
		set tasks(e = void 0) {
			l(e), p();
		},
		get client() {
			return f();
		},
		set client(e = void 0) {
			f(e), p();
		}
	}, N = g(), F = P(N);
	return d(F, t, "default", {}, null), _(e, N), i(M);
}
w(Je, {
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
	client: {}
}, ["default"], [], { mode: "open" });
//#endregion
//#region src/FieldList.svelte
var Ye = v("<span class=\"req svelte-olgbsr\">*</span>"), Xe = v("<input part=\"input\" type=\"checkbox\" class=\"svelte-olgbsr\"/>"), Ze = v("<option> </option>"), Qe = v("<select part=\"input\" class=\"svelte-olgbsr\"><option>—</option><!></select>"), $e = v("<p part=\"field-error\" class=\"error svelte-olgbsr\" role=\"alert\"> </p>"), et = v("<p part=\"notice\" class=\"muted svelte-olgbsr\" role=\"status\"> </p>"), tt = v("<af-folder-source></af-folder-source>", 2), nt = v("<p part=\"notice\" class=\"muted svelte-olgbsr\"> </p>"), rt = v("<input part=\"input\" class=\"svelte-olgbsr\"/>"), it = v("<p class=\"muted svelte-olgbsr\"> </p>"), at = v("<div part=\"field\" class=\"field svelte-olgbsr\"><label part=\"label\" class=\"svelte-olgbsr\"> <!></label> <!> <!> <!></div>"), ot = {
	hash: "svelte-olgbsr",
	code: ".field.svelte-olgbsr {display:grid;gap:4px;margin-block-end:var(--agentflow-gap, 12px);}label.svelte-olgbsr {font-weight:600;}.req.svelte-olgbsr {color:var(--agentflow-danger, #b42318);}.muted.svelte-olgbsr {color:var(--agentflow-muted, #667085);margin:0;font-size:0.9em;}.error.svelte-olgbsr {color:var(--agentflow-danger, #b42318);margin:0;}input.svelte-olgbsr, select.svelte-olgbsr {font:inherit;padding:6px 8px;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);}"
};
function st(n, c) {
	u(c, !0), a(n, ot);
	let d = y(c, "fields", 7), v = y(c, "values", 31, () => T({})), x = y(c, "errors", 23, () => ({})), S = y(c, "disabled", 7, !1), w = y(c, "t", 7), E = y(c, "folders", 7, null), A = y(c, "foldersReady", 7, !0), M = y(c, "foldersFailed", 7, !1), N = y(c, "uploading", 31, () => T({})), F = y(c, "refusing", 31, () => T({})), te = {
		text: "text",
		email: "email",
		date: "date",
		datetime: "datetime-local",
		number: "number",
		integer: "number"
	};
	var I = {
		get fields() {
			return d();
		},
		set fields(e) {
			d(e), p();
		},
		get values() {
			return v();
		},
		set values(e = {}) {
			v(e), p();
		},
		get errors() {
			return x();
		},
		set errors(e = {}) {
			x(e), p();
		},
		get disabled() {
			return S();
		},
		set disabled(e = !1) {
			S(e), p();
		},
		get t() {
			return w();
		},
		set t(e) {
			w(e), p();
		},
		get folders() {
			return E();
		},
		set folders(e = null) {
			E(e), p();
		},
		get foldersReady() {
			return A();
		},
		set foldersReady(e = !0) {
			A(e), p();
		},
		get foldersFailed() {
			return M();
		},
		set foldersFailed(e = !1) {
			M(e), p();
		},
		get uploading() {
			return N();
		},
		set uploading(e = {}) {
			N(e), p();
		},
		get refusing() {
			return F();
		},
		set refusing(e = {}) {
			F(e), p();
		}
	}, L = g(), R = P(L);
	return t(R, 17, d, (e) => e.key, (n, i) => {
		var a = at(), c = C(a), u = C(c, !0), d = D(u), p = (e) => {
			var t = Ye();
			k((e) => m(t, "title", e), [() => w()("form.required")]), _(e, t);
		};
		h(d, (e) => {
			b(i).required && e(p);
		}), l(c);
		var y = D(c, 2), T = (e) => {
			var t = Xe();
			ne(t), k(() => {
				m(t, "id", `f-${b(i).key}`), t.disabled = S();
			}), re(t, () => v()[b(i).key], (e) => v(v()[b(i).key] = e, !0)), _(e, t);
		}, I = (n) => {
			var r = Qe(), a = C(r);
			a.value = a.__value = "";
			var o = D(a);
			t(o, 17, () => b(i).options ?? [], (e) => e.value, (e, t) => {
				var n = Ze(), r = j(n, !0), i = {};
				k(() => {
					s(r, b(t).label), i !== (i = b(t).value) && (n.value = (n.__value = i) ?? "");
				}), _(e, n);
			}), l(r), e(r), k(() => {
				m(r, "id", `f-${b(i).key}`), r.disabled = S();
			}), O(r, () => v()[b(i).key], (e) => v(v()[b(i).key] = e, !0)), _(n, r);
		}, L = (e) => {
			var t = $e(), n = j(t, !0);
			k((e) => s(n, e), [() => w()("form.folder_unavailable")]), _(e, t);
		}, R = (e) => {
			var t = et(), n = j(t, !0);
			k((e) => s(n, e), [() => w()("common.loading")]), _(e, t);
		}, z = (e) => {
			var t = g(), n = P(t);
			o(n, () => E().round, (e) => {
				var t = tt();
				r(t, "part", "folder-source"), k(() => r(t, "id", `f-${b(i).key}`)), r(t, "role", "group"), k(() => r(t, "aria-labelledby", `l-${b(i).key}`)), k(() => r(t, "resumeSet", E().resumeSets?.[b(i).key] ?? null)), k(() => r(t, "sources", E().sources)), k(() => r(t, "workflow", E().workflow)), k(() => r(t, "field", b(i).key)), k(() => r(t, "folder", b(i).folder)), k(() => r(t, "locale", E().locale)), k(() => r(t, "disabled", S())), ee("af-folder-upload-started", t, (e) => E().uploadStarted(b(i).key, e.detail.setId)), ee("af-folder-busy", t, (e) => N(N()[b(i).key] = e.detail.busy, !0)), ee("af-folder-change", t, (e) => {
					v(v()[b(i).key] = e.detail.value, !0), F(F()[b(i).key] = !!e.detail.preview?.refusal, !0);
				}), _(e, t);
			}), _(e, t);
		}, B = (e) => {
			var t = nt(), n = j(t, !0);
			k((e) => s(n, e), [() => w()("form.unsupported")]), _(e, t);
		}, V = (e) => {
			var t = rt();
			ne(t), k(() => {
				m(t, "id", `f-${b(i).key}`), m(t, "type", te[b(i).kind]), m(t, "step", b(i).kind === "integer" ? "1" : b(i).kind === "number" ? "any" : void 0), t.disabled = S();
			}), f(t, () => v()[b(i).key], (e) => v(v()[b(i).key] = e, !0)), _(e, t);
		};
		h(y, (e) => {
			b(i).kind === "boolean" ? e(T) : b(i).kind === "choice" ? e(I, 1) : b(i).kind === "folder" && E() && M() ? e(L, 2) : b(i).kind === "folder" && E() && !A() ? e(R, 3) : b(i).kind === "folder" && E() ? e(z, 4) : b(i).kind === "unsupported" || b(i).kind === "folder" ? e(B, 5) : e(V, -1);
		});
		var H = D(y, 2), U = (e) => {
			var t = it(), n = j(t, !0);
			k(() => s(n, b(i).description)), _(e, t);
		};
		h(H, (e) => {
			b(i).description && e(U);
		});
		var W = D(H, 2), G = (e) => {
			var t = nt(), n = j(t, !0);
			k((e) => s(n, e), [() => w()("form.uploading")]), _(e, t);
		}, ie = (e) => {
			var t = $e(), n = j(t, !0);
			k(() => s(n, x()[b(i).key])), _(e, t);
		};
		h(W, (e) => {
			N()[b(i).key] ? e(G) : x()[b(i).key] && e(ie, 1);
		}), l(a), k(() => {
			m(c, "id", `l-${b(i).key}`), m(c, "for", b(i).kind === "folder" ? void 0 : `f-${b(i).key}`), s(u, b(i).label);
		}), _(n, a);
	}), _(n, L), i(I);
}
w(st, {
	fields: {},
	values: {},
	errors: {},
	disabled: {},
	t: {},
	folders: {},
	foldersReady: {},
	foldersFailed: {},
	uploading: {},
	refusing: {}
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
	let r = le(e);
	await r.load();
	let i = r.id(`${t}:${n}`);
	if (i === null) throw new ct(t, n);
	return i;
}
//#endregion
//#region src/form.ts
var ut = (e) => typeof e == "object" && !!e && !Array.isArray(e);
function dt(e) {
	let t = e.type;
	if (typeof t == "string") return t;
	if (Array.isArray(t)) return t.find((e) => e !== "null");
}
function ft(e) {
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
function pt(e) {
	if (Array.isArray(e.oneOf)) {
		let t = e.oneOf.filter((e) => !(ut(e) && e.const === null)), n = [];
		for (let e of t) {
			if (!ut(e) || typeof e.const != "string") return { kind: "unsupported" };
			n.push({
				value: e.const,
				label: typeof e.title == "string" ? e.title : e.const
			});
		}
		return n.length > 0 ? ft(n) : { kind: "unsupported" };
	}
	if (Array.isArray(e.enum)) {
		if (!e.enum.every((e) => typeof e == "string" || e === null)) return { kind: "unsupported" };
		let t = e.enum.filter((e) => typeof e == "string");
		return t.length > 0 ? ft(t.map((e) => ({
			value: e,
			label: e
		}))) : { kind: "unsupported" };
	}
	let t = dt(e);
	if (t === "string") switch (e.format) {
		case void 0: return { kind: "text" };
		case "date": return { kind: "date" };
		case "date-time": return { kind: "datetime" };
		case "email": return { kind: "email" };
		default: return { kind: "unsupported" };
	}
	return t === "number" ? { kind: "number" } : t === "integer" ? { kind: "integer" } : t === "boolean" ? { kind: "boolean" } : { kind: "unsupported" };
}
function mt(e) {
	return ut(e) && e.type === "array" && ut(e.items) && e.items.type === "string" && e.items.format === "attachment";
}
function ht(e) {
	return ut(e) && ut(e.properties) && Object.values(e.properties).some(mt);
}
var gt = /^#\/properties\/([^/]+)$/;
function _t(e, t = []) {
	if (!ut(e)) return t;
	if (e.type === "Control" && typeof e.scope == "string") {
		let n = gt.exec(e.scope)?.[1];
		n !== void 0 && t.push(n);
	}
	if (Array.isArray(e.elements)) for (let n of e.elements) _t(n, t);
	return t;
}
function vt(e, t, n = []) {
	if (!ut(e) || !ut(e.properties)) return [];
	let r = e.properties, i = new Set(Array.isArray(e.required) ? e.required : []), a = (e) => typeof e == "string" && Object.hasOwn(r, e), o = Array.isArray(e["x-order"]) ? e["x-order"].filter(a) : [], s = new Map(n.flatMap((e) => e.folder ? [[e.key, e.folder]] : []));
	return [.../* @__PURE__ */ new Set([
		..._t(t).filter(a),
		...o,
		...Object.keys(r)
	])].map((e) => {
		let t = ut(r[e]) ? r[e] : {}, n = mt(t) ? s.get(e) : void 0, a = {
			key: e,
			label: typeof t.title == "string" ? t.title : e,
			required: i.has(e),
			...n ? {
				kind: "folder",
				folder: n
			} : pt(t)
		};
		return typeof t.description == "string" && (a.description = t.description), a;
	});
}
function yt(e) {
	return e.flatMap((e) => e.folder ? [{
		key: e.key,
		label: e.title || e.key,
		kind: "folder",
		required: e.required === !0,
		folder: e.folder
	}] : []);
}
var bt = (e) => String(e).padStart(2, "0");
function xt(e) {
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? "" : `${t.getFullYear()}-${bt(t.getMonth() + 1)}-${bt(t.getDate())}T${bt(t.getHours())}:${bt(t.getMinutes())}`;
}
function St(e, t) {
	let n = ut(t) ? t : {}, r = {};
	for (let t of e) {
		let e = n[t.key];
		t.kind === "boolean" ? r[t.key] = e === !0 : t.kind === "datetime" ? r[t.key] = typeof e == "string" ? xt(e) : "" : t.kind === "unsupported" ? r[t.key] = e : t.kind === "folder" ? r[t.key] = null : r[t.key] = e ?? "";
	}
	return r;
}
var Ct = (e) => e == null || e === "";
function wt(e, t) {
	let n = {};
	for (let r of e) {
		let e = t[r.key];
		if (r.kind === "boolean") {
			n[r.key] = e === !0;
			continue;
		}
		Ct(e) || (r.kind === "number" || r.kind === "integer" ? n[r.key] = Number(e) : r.kind === "datetime" ? n[r.key] = new Date(String(e)).toISOString() : n[r.key] = e);
	}
	return n;
}
function Tt(e, t) {
	return e.filter((e) => e.required && e.kind !== "boolean" && e.kind !== "unsupported" && Ct(t[e.key])).map((e) => e.key);
}
function Et(e, t = !1) {
	return e.filter((e) => e.required && (e.kind === "unsupported" || t && e.kind === "folder"));
}
function Dt(e) {
	let t = {};
	for (let n of e ?? []) {
		let e = n.path.replace(/^\//, "").split("/")[0] ?? "";
		t[e] ??= n.message;
	}
	return t;
}
//#endregion
//#region src/use-agentflow.svelte.ts
function Ot(e) {
	let t = x(null);
	return R(() => je(e, Oe, (e) => z(t, e))), { get current() {
		return b(t);
	} };
}
//#endregion
//#region src/elements/RecordTable.svelte
var kt = v("<form part=\"search\" role=\"search\"><input type=\"search\" class=\"svelte-1xcrvv6\"/></form>"), At = v("<button part=\"create-button\" type=\"button\" class=\"svelte-1xcrvv6\"> </button>"), jt = v("<div part=\"toolbar\" class=\"svelte-1xcrvv6\"><!> <!></div>"), Mt = v("<p part=\"notice\" class=\"error svelte-1xcrvv6\"> </p>"), Nt = v("<form part=\"form\"><!> <!> <div part=\"actions\" class=\"svelte-1xcrvv6\"><button part=\"button\" type=\"button\" class=\"secondary svelte-1xcrvv6\"> </button> <button part=\"button\" type=\"button\" class=\"svelte-1xcrvv6\"> </button></div></form>"), Pt = v("<br/> ", 1), Ft = v("<p part=\"error\" class=\"error svelte-1xcrvv6\" role=\"alert\"><!> <!></p>"), It = v("<p part=\"empty\" class=\"muted svelte-1xcrvv6\"> </p>"), Lt = v("<th class=\"svelte-1xcrvv6\"> </th>"), Rt = v("<td part=\"cell\" class=\"svelte-1xcrvv6\"> </td>"), zt = v("<tr part=\"row\" tabindex=\"0\" class=\"svelte-1xcrvv6\"></tr>"), Bt = v("<table part=\"table\" class=\"svelte-1xcrvv6\"><thead><tr></tr></thead><tbody></tbody></table>"), Vt = v("<p class=\"muted svelte-1xcrvv6\"> </p>"), Ht = v("<button part=\"load-more\" type=\"button\" class=\"svelte-1xcrvv6\"> </button>"), Ut = v("<!> <!> <!> <!> <!> <!>", 1), Wt = {
	hash: "svelte-1xcrvv6",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}[part='toolbar'].svelte-1xcrvv6 {display:flex;gap:8px;justify-content:space-between;margin-block-end:var(--agentflow-gap, 12px);}input[type='search'].svelte-1xcrvv6 {font:inherit;padding:6px 8px;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);}table.svelte-1xcrvv6 {width:100%;border-collapse:collapse;}th.svelte-1xcrvv6, td.svelte-1xcrvv6 {text-align:start;padding:8px;border-block-end:1px solid var(--agentflow-border, #eaecf0);}tr[part='row'].svelte-1xcrvv6 {cursor:pointer;}tr[part='row'].svelte-1xcrvv6:hover, tr[part='row'].svelte-1xcrvv6:focus {background:color-mix(in srgb, var(--agentflow-accent, #1570ef) 8%, transparent);}.muted.svelte-1xcrvv6 {color:var(--agentflow-muted, #667085);}.error.svelte-1xcrvv6 {color:var(--agentflow-danger, #b42318);}[part='actions'].svelte-1xcrvv6 {display:flex;gap:8px;}button.svelte-1xcrvv6 {font:inherit;padding:6px 14px;cursor:pointer;border-radius:var(--agentflow-radius, 6px);border:1px solid var(--agentflow-accent, #1570ef);background:var(--agentflow-accent, #1570ef);color:var(--agentflow-accent-text, #fff);}button.secondary.svelte-1xcrvv6, [part='load-more'].svelte-1xcrvv6 {background:transparent;color:var(--agentflow-accent, #1570ef);}button.svelte-1xcrvv6:disabled {opacity:0.5;cursor:default;}"
};
function Gt(e, r) {
	u(r, !0), a(e, Wt);
	let o = y(r, "entityId", 7), c = y(r, "entityKey", 7), d = y(r, "columns", 7), v = y(r, "pageSize", 7), w = y(r, "filter", 7), E = r.$$host, O = Ot(E), A = n(() => O.current?.state === "ready"), M = x(null), F = n(() => o() || b(M)), I = n(() => We(w(), "filter")), L = n(() => b(I) ? JSON.stringify(b(I)) : ""), re = n(() => Ge(v())), B = x(null), V = x(T([])), U = x(null), W = x(""), ie = x(!1), K = x(!1), q = x(null), ae = x(null), oe = x(!1), se = x(!1), J = x(T({})), ce = x(T({})), le = n(() => Et(b(ae) ?? [])), ue = n(() => {
		if (!b(B)) return [];
		let e = d()?.split(",").map((e) => e.trim()).filter(Boolean);
		return e?.length ? e.map((e) => b(B).fields.find((t) => t.key === e)).filter((e) => !!e) : b(B).fields.filter((e) => !e.system).slice(0, 5);
	}), de = (e, t) => E.dispatchEvent(new CustomEvent(e, {
		detail: t,
		bubbles: !0,
		composed: !0
	})), fe = 0, Y = 0;
	async function X(e) {
		let t = O.current;
		if (!t) return;
		let n = fe, r;
		try {
			r = await G(t.client.GET("/entities/{entity_id}", { params: { path: { entity_id: e } } }));
		} catch (e) {
			let r = t.report(e);
			n === fe && z(q, r, !0);
			return;
		}
		if (n === fe && (z(B, r, !0), r.effective_capabilities?.write)) try {
			let r = await G(t.client.GET("/entities/{entity_id}/create-form", { params: { path: { entity_id: e } } }));
			n === fe && z(ae, vt(r.schema_json, r.ui_schema_json), !0);
		} catch (e) {
			let r = e?.status;
			if (r === 403 || r === 404) return;
			let i = t.report(e);
			n === fe && z(q, i, !0);
		}
	}
	async function pe(e) {
		let t = O.current, n = b(F);
		if (!t || !n || !b(B)) return;
		let r = ++Y;
		z(K, !0), z(q, null), e || z(U, null);
		try {
			let i = { entity_id: n }, a = b(I) ? await G(t.client.POST("/entities/{entity_id}/records/query", {
				params: { path: i },
				body: {
					filter: b(I),
					limit: b(re),
					cursor: e
				}
			})) : await G(t.client.GET("/entities/{entity_id}/records", { params: {
				path: i,
				query: {
					limit: b(re),
					cursor: e,
					q: b(W) || void 0
				}
			} }));
			if (r !== Y) return;
			z(V, e ? [...b(V), ...a.items] : a.items, !0), z(U, a.next_cursor, !0), z(ie, !0);
		} catch (n) {
			let i = t.report(n);
			r === Y && (z(q, i, !0), e || z(V, [], !0));
		} finally {
			r === Y && z(K, !1);
		}
	}
	function me() {
		z(J, St(b(ae) ?? [], {}), !0), z(ce, {}, !0), z(oe, !0);
	}
	async function Z() {
		let e = O.current, t = b(F);
		if (!e || !t || !b(ae) || b(se) || b(le).length > 0) return;
		let n = Tt(b(ae), b(J));
		if (n.length > 0) {
			z(ce, Object.fromEntries(n.map((t) => [t, e.t("form.required")])), !0);
			return;
		}
		let r = fe;
		z(se, !0), z(q, null), z(ce, {}, !0);
		let i;
		try {
			i = await G(e.client.POST("/entities/{entity_id}/records", {
				params: { path: { entity_id: t } },
				body: { form_payload: wt(b(ae), b(J)) }
			}));
		} catch (t) {
			let n = e.report(t);
			if (r !== fe) return;
			z(se, !1), z(ce, Dt(n?.fieldErrors), !0), z(q, n, !0);
			return;
		}
		de("record-created", { recordId: i.id }), r === fe && (z(se, !1), z(oe, !1), await pe());
	}
	R(() => {
		o(), c(), z(M, null);
	}), R(() => {
		b(F), c(), fe++, Y++, z(B, null), z(ae, null), z(W, ""), z(oe, !1), z(se, !1), z(V, [], !0), z(U, null), z(ie, !1), z(K, !1), z(q, null);
	}), R(() => {
		if (!b(A) || o() || !c()) return;
		let e = c();
		te(async () => {
			let t = O.current;
			if (!t) return;
			let n = fe;
			try {
				let r = await lt(t.client, "entity", e);
				n === fe && z(M, r, !0);
			} catch (e) {
				let r = t.report(e);
				n === fe && z(q, r, !0);
			}
		});
	}), R(() => {
		if (!b(A) || !b(F)) return;
		let e = b(F);
		te(() => X(e));
	}), R(() => {
		b(A) && b(B) && (b(L), b(re), te(() => pe()));
	});
	var he = {
		get entityId() {
			return o();
		},
		set entityId(e) {
			o(e), p();
		},
		get entityKey() {
			return c();
		},
		set entityKey(e) {
			c(e), p();
		},
		get columns() {
			return d();
		},
		set columns(e) {
			d(e), p();
		},
		get pageSize() {
			return v();
		},
		set pageSize(e) {
			v(e), p();
		},
		get filter() {
			return w();
		},
		set filter(e) {
			w(e), p();
		}
	}, ge = g(), Q = P(ge), _e = (e) => {
		let r = n(() => O.current.t);
		var i = Ut(), a = P(i), o = (e) => {
			var t = jt(), n = C(t), i = (e) => {
				var t = kt(), n = C(t);
				ne(n), l(t), k((e, t) => {
					m(n, "placeholder", e), m(n, "aria-label", t);
				}, [() => b(r)("records.search"), () => b(r)("records.search")]), ee("submit", t, (e) => {
					e.preventDefault(), pe();
				}), f(n, () => b(W), (e) => z(W, e)), _(e, t);
			};
			h(n, (e) => {
				b(I) || e(i);
			});
			var a = D(n, 2), o = (e) => {
				var t = At(), n = j(t, !0);
				k((e) => s(n, e), [() => b(r)("records.create")]), N("click", t, me), _(e, t);
			};
			h(a, (e) => {
				b(ae) && !b(oe) && e(o);
			}), l(t), _(e, t);
		};
		h(a, (e) => {
			b(B) && e(o);
		});
		var c = D(a, 2), u = (e) => {
			var t = Nt(), n = C(t);
			st(n, {
				get fields() {
					return b(ae);
				},
				get errors() {
					return b(ce);
				},
				get disabled() {
					return b(se);
				},
				get t() {
					return b(r);
				},
				get values() {
					return b(J);
				},
				set values(e) {
					z(J, e, !0);
				}
			});
			var i = D(n, 2), a = (e) => {
				var t = Mt(), n = j(t, !0);
				k((e) => s(n, e), [() => b(r)("form.unsupported_required")]), _(e, t);
			};
			h(i, (e) => {
				b(le).length > 0 && e(a);
			});
			var o = D(i, 2), c = C(o), u = j(c, !0), d = D(c, 2), f = j(d, !0);
			l(o), l(t), k((e, t) => {
				s(u, e), d.disabled = b(se) || b(le).length > 0, s(f, t);
			}, [() => b(r)("common.cancel"), () => b(r)("records.save")]), ee("submit", t, (e) => e.preventDefault()), N("click", c, () => z(oe, !1)), N("click", d, Z), _(e, t);
		};
		h(c, (e) => {
			b(oe) && b(ae) && e(u);
		});
		var d = D(c, 2), p = (e) => {
			var t = Ft(), n = C(t), i = (e) => {
				var t = S();
				k(() => s(t, b(q).detail)), _(e, t);
			}, a = (e) => {
				var t = S();
				k((e) => s(t, e), [() => b(r)("common.error", { code: b(q).code })]), _(e, t);
			};
			h(n, (e) => {
				b(q).code === "APP_KEY_MISSING" ? e(i) : e(a, -1);
			});
			var o = D(n, 2), c = (e) => {
				var t = Pt(), n = D(P(t), 1, !0);
				k((e) => s(n, e), [() => b(r)("common.request_id", { id: b(q).requestId })]), _(e, t);
			};
			h(o, (e) => {
				b(q).requestId && e(c);
			}), l(t), _(e, t);
		};
		h(d, (e) => {
			b(q) && e(p);
		});
		var g = D(d, 2), v = (e) => {
			var t = It(), n = j(t, !0);
			k((e) => s(n, e), [() => b(r)("records.empty")]), _(e, t);
		}, y = (e) => {
			var n = Bt(), i = C(n), a = C(i);
			t(a, 21, () => b(ue), (e) => e.key, (e, t) => {
				var n = Lt(), r = j(n, !0);
				k(() => s(r, b(t).label)), _(e, n);
			}), l(a), l(i);
			var o = D(i);
			t(o, 21, () => b(V), (e) => e.id, (e, n) => {
				var i = zt();
				t(i, 21, () => b(ue), (e) => e.key, (e, t) => {
					var i = Rt(), a = j(i, !0);
					k((e) => s(a, e), [() => H(b(n).body[b(t).key], O.current.locale, b(r))]), _(e, i);
				}), l(i), N("click", i, () => de("record-select", { recordId: b(n).id })), N("keydown", i, (e) => e.key === "Enter" && de("record-select", { recordId: b(n).id })), _(e, i);
			}), l(o), l(n), _(e, n);
		};
		h(g, (e) => {
			b(ie) && !b(K) && b(V).length === 0 && !b(q) ? e(v) : b(V).length > 0 && e(y, 1);
		});
		var x = D(g, 2), w = (e) => {
			var t = Vt(), n = j(t, !0);
			k((e) => s(n, e), [() => b(r)("common.loading")]), _(e, t);
		};
		h(x, (e) => {
			b(K) && e(w);
		});
		var T = D(x, 2), E = (e) => {
			var t = Ht(), n = j(t, !0);
			k((e) => s(n, e), [() => b(r)("common.load_more")]), N("click", t, () => pe(b(U) ?? void 0)), _(e, t);
		};
		h(T, (e) => {
			b(U) && !b(K) && e(E);
		}), _(e, i);
	};
	return h(Q, (e) => {
		O.current && b(A) && e(_e);
	}), _(e, ge), i(he);
}
L(["click", "keydown"]), w(Gt, {
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
//#region src/define.ts
var Kt = /* @__PURE__ */ new WeakSet();
function qt(e, t, n, r, i) {
	let a = t[n];
	F(a, r) && !Kt.has(t) && (Kt.add(t), console.warn(`An older copy of the AgentFlow ${i} registered ${e} first; this page uses it, not this copy.`, {
		tag: e,
		registered: a ?? null,
		loaded: r
	}));
}
function Jt(e, t, n, r, i) {
	for (let [a, o] of Object.entries(t)) {
		let t = e.get(a);
		t ? t !== o.element && qt(a, t, n, r, i) : e.define(a, o.element);
	}
}
//#endregion
//#region src/folder-source.ts
var Yt = "af-folder-source";
async function Xt(e = customElements) {
	let t = e.get(Yt);
	if (t) return qt(Yt, t, "kitVersion", I, "UI kit");
	let n = (await import("./chunks/FolderSource-BFwYWdDp.js").then((e) => e.n)).default;
	Object.defineProperty(n.element, "kitVersion", { value: I }), Jt(e, { [Yt]: n }, "kitVersion", I, "UI kit");
}
//#endregion
//#region src/elements/StartForm.svelte
var Zt = v("<br/> ", 1), Qt = v("<p part=\"error\" class=\"error svelte-1o3y7sj\" role=\"alert\"><!> <!></p>"), $t = v("<p part=\"error\" class=\"error svelte-1o3y7sj\" role=\"alert\"> </p>"), en = v("<option> </option>"), tn = v("<label part=\"picker\" class=\"svelte-1o3y7sj\"> <select class=\"svelte-1o3y7sj\"><option>—</option><!></select></label>"), nn = v("<p class=\"muted svelte-1o3y7sj\"> </p>"), rn = v("<p part=\"notice\" class=\"muted svelte-1o3y7sj\" role=\"status\"> </p>"), an = v("<p part=\"notice\"><!></p>"), on = v("<p part=\"notice\" class=\"error svelte-1o3y7sj\" role=\"alert\"> </p>"), sn = v("<p class=\"run svelte-1o3y7sj\"> </p>"), cn = v("<p part=\"notice\" class=\"error svelte-1o3y7sj\"> </p>"), ln = v("<form part=\"form\"><!> <!> <!> <div part=\"actions\"><button part=\"button\" type=\"button\" class=\"svelte-1o3y7sj\"> </button></div></form>"), un = v("<!> <!> <!> <!> <!> <!> <!>", 1), dn = {
	hash: "svelte-1o3y7sj",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}[part='picker'].svelte-1o3y7sj {display:grid;gap:4px;margin-block-end:var(--agentflow-gap, 12px);font-weight:600;}select.svelte-1o3y7sj {font:inherit;padding:6px 8px;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);}.run.svelte-1o3y7sj {margin-block:0 var(--agentflow-gap, 12px);font-weight:600;}.muted.svelte-1o3y7sj {color:var(--agentflow-muted, #667085);}.error.svelte-1o3y7sj {color:var(--agentflow-danger, #b42318);}button.svelte-1o3y7sj {font:inherit;padding:6px 14px;cursor:pointer;border-radius:var(--agentflow-radius, 6px);border:1px solid var(--agentflow-accent, #1570ef);background:var(--agentflow-accent, #1570ef);color:var(--agentflow-accent-text, #fff);}button.svelte-1o3y7sj:disabled {opacity:0.5;cursor:default;}"
};
function fn(r, o) {
	u(o, !0), a(r, dn);
	let d = y(o, "workflowId", 7), f = y(o, "workflowKey", 7), v = y(o, "entity", 7), w = y(o, "record", 7), E = y(o, "action", 7), A = y(o, "subjectEntity", 7), M = y(o, "subjectRecord", 7), F = y(o, "resumeSets", 7), I = "__name", L = 2e3, ne = /* @__PURE__ */ new Set([
		"failed",
		"rolled_back",
		"blocked"
	]), re = {
		completed: "start.completed",
		failed: "start.failed",
		rolled_back: "start.rolled_back",
		paused: "start.paused",
		blocked: "start.blocked",
		started: "start.started"
	};
	function V(e) {
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
	let H = o.$$host, U = Ot(H), W = n(() => U.current?.state === "ready"), ie = x(null), K = n(() => d() || b(ie)), q = n(() => !!v() || !!w() || !!E()), ae = n(() => !!d() || !!f() || b(q)), oe = x(null), se = x(null), J = n(() => b(oe) ?? b(se)), ce = x(T([])), le = x(""), ue = x(!1), X = x(null), pe = x(null), me = x(!1), Z = x(T([])), he = x(T({})), ge = x(T({})), Q = x(null), _e = x(!1), ve = x(null), ye = x(!1), be = x(!1), Se = x(0), Ce = x(T({})), we = x(T({})), Te = x([]);
	R(() => {
		F(), z(Te, []);
	});
	let Ee = null, De = (e) => (Ee?.client === e ? Ee : Ee = {
		client: e,
		sources: xe(e)
	}).sources, Oe = n(() => {
		let e = U.current;
		if (!e || !b(X) || !b(Z).some((e) => e.kind === "folder")) return null;
		let t = We(F(), "resumeSets"), n = t && Object.fromEntries(Object.entries(t).filter(([, e]) => !b(Te).includes(e)));
		return {
			sources: De(e.client),
			workflow: b(X).id,
			locale: e.locale,
			round: b(Se),
			resumeSets: n,
			uploadStarted: Ge
		};
	}), ke = x(customElements.get(Yt) !== void 0), Ae = x(!1), je = n(() => b(Oe) !== null);
	R(() => {
		b(je) && (z(Ae, !1), Xt().then(() => z(ke, !0), (e) => {
			z(Ae, !0), U.current?.report(e);
		}));
	});
	let Me = n(() => b(je) && !b(ke) && !b(Ae)), Ne = n(() => Et(b(Z), b(je) && b(Ae))), Pe = n(() => Object.values(b(Ce)).some(Boolean) || Object.values(b(we)).some(Boolean) || b(Me)), Fe = (e, t) => H.dispatchEvent(new CustomEvent(e, {
		detail: t,
		bubbles: !0,
		composed: !0
	})), $ = 0, Ie = null;
	function Le() {
		let e = Ie;
		e && (Ie = null, clearTimeout(e.timer), e.announce("started"));
	}
	function ze() {
		$++, Le(), z(X, null), z(pe, null), z(me, !1), z(Z, [], !0), z(he, {}, !0), z(Ce, {}, !0), z(we, {}, !0), z(ge, {}, !0), z(Q, null), z(_e, !1), z(ve, null), z(ye, !1), z(be, !1);
	}
	async function Be(e) {
		let t = U.current;
		if (!t) return;
		let n = $;
		z(be, !0);
		let r = [];
		try {
			for await (let e of Y((e) => G(t.client.GET("/workflows/startable", { params: { query: e ? {
				limit: 100,
				cursor: e
			} : { limit: 100 } } })))) r.push(e);
		} catch (e) {
			let r = t.report(e);
			n === $ && (z(Q, r, !0), z(be, !1));
			return;
		}
		if (n !== $ || (z(be, !1), z(ce, r, !0), !e)) return;
		let i = r.find((t) => t.id === e);
		i ? await Ue(i) : z(ue, !0);
	}
	let Ve = (e) => b(pe) ? St(b(Z), b(pe).params) : {
		...St(b(Z), {}),
		[I]: e.name
	};
	async function He(e, t, n) {
		let r = U.current;
		if (!r) return;
		let i = $;
		z(be, !0);
		try {
			let a = await lt(r.client, "entity", e), [o, s] = await Promise.all([G(r.client.GET("/entities/{entity_id}", { params: { path: { entity_id: a } } })), G(r.client.GET("/entities/{entity_id}/records/{record_id}", { params: { path: {
				entity_id: a,
				record_id: t
			} } }))]);
			if (i !== $) return;
			let c = o.actions.find((e) => e.key === n);
			if (!c) {
				z(be, !1), z(me, !0);
				return;
			}
			let l = await G(r.client.GET("/workflows/{workflow_id}/input-contract", { params: { path: { workflow_id: c.workflow_id } } }));
			if (i !== $) return;
			if (!l.version_id) {
				z(be, !1), z(ue, !0);
				return;
			}
			let u = de(c, s), d = new Set(fe(l, u.contextKeys, u.defaultKeys)), f = l.params_slots.filter((e) => u.params[e.key] == null), p = yt(f);
			if (d.size > 0 && l.form_definition_id) {
				let e = await G(r.client.GET("/workflow-versions/{version_id}/start-form", { params: { path: { version_id: l.version_id } } }));
				if (i !== $) return;
				p = vt(e.form_definition?.schema_json, e.form_definition?.ui_schema_json, f);
			}
			let m = p.filter((e) => d.has(e.key)), h = o.browser_config?.display_field, g = h ? s.body[h] : void 0, _ = typeof g == "string" && g.trim() || typeof g == "number" ? String(g) : s.id;
			z(be, !1), z(Z, m, !0), z(pe, {
				subject: u.subject,
				params: u.params,
				context: {
					entity_id: a,
					action_id: c.id,
					record_id: s.id
				},
				sync: c.mode === "sync"
			}, !0), z(he, St(m, u.params), !0), z(X, {
				id: c.workflow_id,
				name: `${c.label} · ${_}`,
				version_id: l.version_id
			}, !0);
		} catch (e) {
			let t = r.report(e);
			if (i !== $) return;
			z(Q, t, !0), z(be, !1);
		}
	}
	async function Ue(e) {
		let t = U.current;
		if (!t || (ze(), !e)) return;
		let n = $;
		z(be, !0);
		let r, i = [];
		try {
			r = await G(t.client.GET("/workflow-versions/{version_id}/start-form", { params: { path: { version_id: e.version_id } } })), n === $ && (!r.form_definition || ht(r.form_definition.schema_json)) && (i = (await G(t.client.GET("/workflows/{workflow_id}/input-contract", { params: { path: { workflow_id: e.id } } }))).params_slots);
		} catch (e) {
			let r = t.report(e);
			n === $ && (z(Q, r, !0), z(be, !1));
			return;
		}
		if (n !== $) return;
		z(be, !1);
		let a = {
			key: I,
			label: t.t("start.name"),
			kind: "text",
			required: !0
		}, o = r.form_definition;
		z(Z, [a, ...o ? vt(o.schema_json, o.ui_schema_json, i) : yt(i)], !0), z(he, Ve(e), !0), z(X, e, !0);
	}
	let Ge = (e, t) => Fe("af-folder-upload-started", {
		setId: t,
		field: e
	});
	function Ke(e) {
		z(le, e, !0), Ue(b(ce).find((t) => t.id === e) ?? null);
	}
	async function qe() {
		let e = U.current, t = b(X);
		if (!e || !t || b(_e) || b(Pe) || b(Ne).length > 0) return;
		z(ve, null);
		let n = b(pe), r = n ? t.name : String(b(he)[I] ?? "").trim(), i = Tt(b(Z), n ? b(he) : {
			...b(he),
			[I]: r
		});
		if (i.length > 0) {
			z(ge, Object.fromEntries(i.map((t) => [t, e.t("form.required")])), !0);
			return;
		}
		let a = $;
		z(_e, !0), z(Q, null), z(ge, {}, !0);
		let o;
		try {
			o = await G(e.client.POST("/workflows/{workflow_id}/instances", {
				params: { path: { workflow_id: t.id } },
				body: n ? {
					name: r,
					subject: n.subject,
					params: {
						...Object.fromEntries(Object.entries(n.params).filter(([e]) => !b(Z).some((t) => t.key === e))),
						...wt(b(Z), b(he))
					},
					version_id: t.version_id,
					action_context: n.context,
					...n.sync ? { wait_ms: 5e3 } : {}
				} : {
					name: r,
					version_id: t.version_id,
					input_payload: wt(b(Z).filter((e) => e.key !== I), b(he)),
					...M() ? { subject: {
						kind: "record",
						record_id: M()
					} } : {}
				}
			}));
		} catch (t) {
			let n = e.report(t);
			if (a !== $) return;
			if (z(_e, !1), n?.code === "ACTION_NOT_VISIBLE") {
				z(X, null), z(me, !0);
				return;
			}
			z(ge, Dt(n?.fieldErrors), !0), z(Q, n, !0);
			return;
		}
		let s = (e) => Fe("workflow-started", {
			instanceId: o.id,
			workflowId: t.id,
			...e ? { outcome: e } : {}
		}), c = b(Z).flatMap((e) => e.kind === "folder" ? [b(he)[e.key]?.$fileSet] : []).filter((e) => e !== void 0);
		c.length && z(Te, [...b(Te), ...c]);
		let l = n?.sync ? V(o) : { outcome: "started" };
		if (n?.sync ? (l || a !== $) && s(l?.outcome ?? "started") : s(), a !== $) return;
		let u = (e) => {
			z(_e, !1), z(ye, !1), z(he, Ve(t), !0), z(Ce, {}, !0), z(we, {}, !0), B(Se), z(ve, e, !0);
		};
		if (l) return u(l);
		z(ye, !0);
		let d = {
			timer: void 0,
			announce: s
		};
		Ie = d;
		let f = 0, p = async () => {
			f += L;
			let t;
			try {
				t = V(await G(e.client.GET("/instances/{instance_id}", { params: { path: { instance_id: o.id } } })));
			} catch (n) {
				Re(n).type !== "other" && e.report(n), t = { outcome: "started" };
			}
			if (Ie === d) {
				if (t ??= f >= 3e4 ? { outcome: "started" } : null, !t) {
					d.timer = setTimeout(p, L);
					return;
				}
				Ie = null, s(t.outcome), u(t);
			}
		};
		d.timer = setTimeout(p, L);
	}
	R(() => () => {
		$++, Le();
	}), R(() => {
		d(), f(), z(ie, null), z(oe, null);
	}), R(() => {
		b(K), f(), v(), w(), E(), ze(), z(ce, [], !0), z(le, ""), z(ue, !1);
	}), R(() => {
		if (!b(W) || b(q) || d() || !f()) return;
		let e = f();
		te(async () => {
			let t = U.current;
			if (!t) return;
			let n = $;
			try {
				let r = await lt(t.client, "workflow", e);
				n === $ && z(ie, r, !0);
			} catch (e) {
				let r = t.report(e);
				n === $ && z(oe, r, !0);
			}
		});
	}), R(() => {
		if (!b(W) || b(q) || f() && !d() && !b(K)) return;
		let e = b(K);
		te(() => Be(e));
	}), R(() => {
		if (!b(W) || !v() || !w() || !E()) return;
		let [e, t, n] = [
			v(),
			w(),
			E()
		];
		te(() => He(e, t, n));
	}), R(() => {
		if (z(se, null), !b(W) || b(q) || !A()) return;
		let e = A();
		te(async () => {
			let t = U.current;
			if (t) try {
				await lt(t.client, "entity", e);
			} catch (n) {
				let r = t.report(n);
				A() === e && z(se, r, !0);
			}
		});
	});
	var Je = {
		get workflowId() {
			return d();
		},
		set workflowId(e) {
			d(e), p();
		},
		get workflowKey() {
			return f();
		},
		set workflowKey(e) {
			f(e), p();
		},
		get entity() {
			return v();
		},
		set entity(e) {
			v(e), p();
		},
		get record() {
			return w();
		},
		set record(e) {
			w(e), p();
		},
		get action() {
			return E();
		},
		set action(e) {
			E(e), p();
		},
		get subjectEntity() {
			return A();
		},
		set subjectEntity(e) {
			A(e), p();
		},
		get subjectRecord() {
			return M();
		},
		set subjectRecord(e) {
			M(e), p();
		},
		get resumeSets() {
			return F();
		},
		set resumeSets(e) {
			F(e), p();
		}
	}, Ye = g(), Xe = P(Ye), Ze = (r) => {
		let i = n(() => U.current.t);
		var a = g(), o = P(a), u = (e) => {
			var t = Qt(), n = C(t), r = (e) => {
				var t = S();
				k(() => s(t, b(J).detail)), _(e, t);
			}, a = (e) => {
				var t = S();
				k((e) => s(t, e), [() => b(i)("common.error", { code: b(J).code })]), _(e, t);
			};
			h(n, (e) => {
				b(J).code === "APP_KEY_MISSING" ? e(r) : e(a, -1);
			});
			var o = D(n, 2), c = (e) => {
				var t = Zt(), n = D(P(t), 1, !0);
				k((e) => s(n, e), [() => b(i)("common.request_id", { id: b(J).requestId })]), _(e, t);
			};
			h(o, (e) => {
				b(J).requestId && e(c);
			}), l(t), _(e, t);
		}, d = (e) => {
			var t = $t(), n = j(t, !0);
			k((e) => s(n, e), [() => b(i)("start.not_startable")]), _(e, t);
		}, f = (r) => {
			var a = un(), o = P(a), u = (n) => {
				var r = tn(), a = C(r), o = D(a), c = C(o);
				c.value = c.__value = "";
				var u = D(c);
				t(u, 17, () => b(ce), (e) => e.id, (e, t) => {
					var n = en(), r = j(n, !0), i = {};
					k(() => {
						s(r, b(t).name), i !== (i = b(t).id) && (n.value = (n.__value = i) ?? "");
					}), _(e, n);
				}), l(o), e(o), l(r), k((e) => s(a, `${e ?? ""} `), [() => b(i)("start.choose")]), O(o, () => b(le), Ke), _(n, r);
			};
			h(o, (e) => {
				b(ae) || e(u);
			});
			var d = D(o, 2), f = (e) => {
				var t = nn(), n = j(t, !0);
				k((e) => s(n, e), [() => b(i)("common.loading")]), _(e, t);
			};
			h(d, (e) => {
				b(be) && e(f);
			});
			var p = D(d, 2), g = (e) => {
				var t = Qt(), n = C(t), r = (e) => {
					var t = S();
					k(() => s(t, b(Q).detail)), _(e, t);
				}, a = (e) => {
					var t = S();
					k((e) => s(t, e), [() => b(i)("common.error", { code: b(Q).code })]), _(e, t);
				};
				h(n, (e) => {
					b(Q).code === "APP_KEY_MISSING" ? e(r) : e(a, -1);
				});
				var o = D(n, 2), c = (e) => {
					var t = Zt(), n = D(P(t), 1, !0);
					k((e) => s(n, e), [() => b(i)("common.request_id", { id: b(Q).requestId })]), _(e, t);
				};
				h(o, (e) => {
					b(Q).requestId && e(c);
				}), l(t), _(e, t);
			};
			h(p, (e) => {
				b(Q) && e(g);
			});
			var v = D(p, 2), y = (e) => {
				var t = rn(), n = j(t, !0);
				k((e) => s(n, e), [() => b(i)("start.running")]), _(e, t);
			};
			h(v, (e) => {
				b(ye) && e(y);
			});
			var x = D(v, 2), w = (e) => {
				let t = n(() => ne.has(b(ve).outcome));
				var r = an();
				let a;
				var o = C(r), u = (e) => {
					var t = S();
					k((e) => s(t, e), [() => b(i)(re.rolled_back, {
						step: b(ve).step ?? "",
						message: b(ve).detail ?? ""
					})]), _(e, t);
				}, d = (e) => {
					var t = S();
					k((e) => s(t, e), [() => b(ve).detail || b(i)(re[b(ve).outcome])]), _(e, t);
				};
				h(o, (e) => {
					b(ve).outcome === "rolled_back" ? e(u) : e(d, -1);
				}), l(r), k(() => {
					m(r, "role", b(t) ? "alert" : "status"), a = c(r, 1, "svelte-1o3y7sj", null, a, { error: b(t) });
				}), _(e, r);
			};
			h(x, (e) => {
				b(ve) && e(w);
			});
			var T = D(x, 2), E = (e) => {
				var t = on(), n = j(t, !0);
				k((e) => s(n, e), [() => b(i)("start.action_unavailable")]), _(e, t);
			};
			h(T, (e) => {
				b(me) && e(E);
			});
			var A = D(T, 2), M = (e) => {
				var t = ln(), n = C(t), r = (e) => {
					var t = sn(), n = j(t, !0);
					k(() => s(n, b(X).name)), _(e, t);
				};
				h(n, (e) => {
					b(pe) && e(r);
				});
				var a = D(n, 2);
				st(a, {
					get fields() {
						return b(Z);
					},
					get errors() {
						return b(ge);
					},
					get disabled() {
						return b(_e);
					},
					get t() {
						return b(i);
					},
					get folders() {
						return b(Oe);
					},
					get foldersReady() {
						return b(ke);
					},
					get foldersFailed() {
						return b(Ae);
					},
					get values() {
						return b(he);
					},
					set values(e) {
						z(he, e, !0);
					},
					get uploading() {
						return b(Ce);
					},
					set uploading(e) {
						z(Ce, e, !0);
					},
					get refusing() {
						return b(we);
					},
					set refusing(e) {
						z(we, e, !0);
					}
				});
				var o = D(a, 2), c = (e) => {
					var t = cn(), n = j(t, !0);
					k((e) => s(n, e), [() => b(i)("form.unsupported_required")]), _(e, t);
				};
				h(o, (e) => {
					b(Ne).length > 0 && e(c);
				});
				var u = D(o, 2), d = C(u), f = j(d, !0);
				l(u), l(t), k((e) => {
					d.disabled = b(_e) || b(Pe) || b(Ne).length > 0, s(f, e);
				}, [() => b(i)("start.submit")]), ee("submit", t, (e) => e.preventDefault()), N("click", d, qe), _(e, t);
			};
			h(A, (e) => {
				b(X) && e(M);
			}), _(r, a);
		};
		h(o, (e) => {
			b(J) ? e(u) : b(ue) ? e(d, 1) : e(f, -1);
		}), _(r, a);
	};
	return h(Xe, (e) => {
		U.current && b(W) && e(Ze);
	}), _(r, Ye), i(Je);
}
L(["click"]), w(fn, {
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
var pn = {
	hash: "svelte-je5mvm",
	code: ":host {display:contents;}"
};
function mn(e, t) {
	u(t, !0), a(e, pn);
	let r = y(t, "record", 7, void 0), o = y(t, "entity", 7, void 0), s = {
		loading: "loading",
		ready: "ready",
		not_found: "not-found",
		finished: "finished",
		error: "error"
	}, c = t.$$host, l = Ot(c), f = n(() => l.current !== null), m = n(() => l.current?.tasks ?? null), h = Pe(c, ke, null);
	function v(e) {
		c.getAttribute("state") !== e && c.setAttribute("state", e);
	}
	R(() => {
		let e = b(m), t = r(), n = o();
		if (!b(f)) {
			v("loading");
			return;
		}
		if (!e) {
			v("unsupported");
			return;
		}
		if (!t) {
			v("not-found");
			return;
		}
		return te(() => {
			let r = e.open(n ? {
				record: t,
				entity: n
			} : { record: t }), i = r.state.lastEvent?.seq ?? null, a = !1, o = (e) => {
				if (a) return;
				v(s[e.status] ?? "loading");
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
			return h.set(r), () => {
				a = !0, l(), h.set(null), r.close();
			};
		});
	}), R(() => () => h.dispose());
	var x = {
		get record() {
			return r();
		},
		set record(e = void 0) {
			r(e), p();
		},
		get entity() {
			return o();
		},
		set entity(e = void 0) {
			o(e), p();
		}
	}, S = g(), C = P(S);
	return d(C, t, "default", {}, null), _(e, S), i(x);
}
w(mn, {
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
var hn = v("<header part=\"header\"><h2 part=\"title\" class=\"svelte-xgtj81\"> </h2> <p part=\"meta\" class=\"muted svelte-xgtj81\"> </p></header>"), gn = v("<br/> ", 1), _n = v("<p part=\"error\" class=\"error svelte-xgtj81\" role=\"alert\"><!> <!> <!></p>"), vn = v("<p class=\"muted svelte-xgtj81\"> </p>"), yn = v("<p part=\"notice\"> </p>"), bn = v("<button part=\"button\" type=\"button\" class=\"secondary svelte-xgtj81\"> </button>"), xn = v("<button part=\"button\" type=\"button\" class=\"svelte-xgtj81\"> </button>"), Sn = v("<div part=\"actions\" class=\"svelte-xgtj81\"><button part=\"button\" type=\"button\" class=\"svelte-xgtj81\"> </button></div>"), Cn = v("<!> <div part=\"actions\" class=\"svelte-xgtj81\"><!> <!></div>", 1), wn = v("<p part=\"notice\"> </p> <div part=\"actions\" class=\"svelte-xgtj81\"><!></div>", 1), Tn = v("<p part=\"notice\" class=\"error svelte-xgtj81\"> </p>"), En = v("<form part=\"form\"><!> <!> <!> <!> <!> <div part=\"actions\" class=\"svelte-xgtj81\"><!> <!></div></form>"), Dn = v("<!> <!> <!> <!>", 1), On = {
	hash: "svelte-xgtj81",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}h2.svelte-xgtj81 {margin:0 0 4px;font-size:1.25em;}.muted.svelte-xgtj81 {color:var(--agentflow-muted, #667085);margin:0 0 var(--agentflow-gap, 12px);}.error.svelte-xgtj81 {color:var(--agentflow-danger, #b42318);}[part='actions'].svelte-xgtj81 {display:flex;gap:8px;flex-wrap:wrap;}button.svelte-xgtj81 {font:inherit;padding:6px 14px;cursor:pointer;border-radius:var(--agentflow-radius, 6px);border:1px solid var(--agentflow-accent, #1570ef);background:var(--agentflow-accent, #1570ef);color:var(--agentflow-accent-text, #fff);}button.secondary.svelte-xgtj81 {background:transparent;color:var(--agentflow-accent, #1570ef);}button.svelte-xgtj81:disabled {opacity:0.5;cursor:default;}"
};
function kn(e, r) {
	u(r, !0), a(e, On);
	let o = y(r, "entityId", 7), c = y(r, "entityKey", 7), d = y(r, "recordId", 7), f = {
		id: null,
		name: null,
		title: null
	}, m = r.$$host, v = Ot(m), w = n(() => v.current?.state === "ready"), E = x(null), O = x(null), A = 0, M = n(() => o() || b(E)), F = x(null), I = x(T(f)), L = x(!1), ne = x(T([])), re = x(T({})), B = x(T({})), V = x(null), H = n(() => b(V) ?? b(O)), U = x(!1), W = x(!1), ie = x(!1), K = n(() => !!v.current?.signing && !b(ie)), q = n(() => !!b(I).id && b(I).id === v.current?.caller?.id), ae = n(() => !!b(F) && b(F).step_status !== "open"), oe = n(() => !!b(F) && b(F).step_status === "open" && b(F).signed), se = n(() => Et(b(ne))), J = n(() => b(F)?.actions.find((e) => e.id === b(F)?.signed_action_id)), ce = n(() => b(F)?.actions.filter((e) => e.id !== b(J)?.id) ?? []), le = n(() => !!b(J) && b(K)), ue = n(() => {
		let e = b(F)?.entity_view;
		return e?.mode !== "selectable" || e.view?.type !== "grid" && e.view?.type !== "kanban" ? !1 : (e.min_selection ?? 1) > 0;
	}), de = (e, t) => m.dispatchEvent(new CustomEvent(e, {
		detail: t,
		bubbles: !0,
		composed: !0
	}));
	function fe(e) {
		z(F, e, !0), z(ne, vt(e.form_definition?.schema_json, e.form_definition?.ui_schema_json), !0), z(re, St(b(ne), e.draft_payload ?? e.prefill ?? {}), !0), z(B, {}, !0);
	}
	let Y = 0;
	async function X(e, t) {
		let n = v.current;
		if (!n || !e || !t) return;
		let r = Y;
		z(W, !0), z(ie, !1);
		try {
			let i = {
				entity_id: e,
				record_id: t
			}, [a, o] = await Promise.all([n.client.GET("/entities/{entity_id}/records/{record_id}/step", { params: { path: i } }), n.client.GET("/entities/{entity_id}/records/{record_id}", { params: { path: i } })]);
			if (a.response.status === 404) {
				r === Y && (z(F, null), z(I, f, !0)), await G(Promise.resolve(o)), r === Y && z(L, !0);
				return;
			}
			let s = await G(Promise.resolve(a)), c = await G(Promise.resolve(o));
			if (r !== Y) return;
			z(L, !1);
			let l = typeof c.body.claimed_by == "string" ? c.body.claimed_by : null;
			z(I, {
				id: l,
				name: l ? c.ref_labels?.claimed_by ?? null : null,
				title: typeof c.body.title == "string" ? c.body.title : null
			}, !0), fe(s);
		} catch (e) {
			let t = n.report(e);
			r === Y && z(V, t, !0);
		} finally {
			r === Y && z(W, !1);
		}
	}
	async function pe(e) {
		let t = v.current;
		if (!t || !b(F)) return;
		let n = b(M), r = d();
		if (!n) return;
		let i = Y;
		z(U, !0), z(V, null);
		try {
			let a = e === "claim" ? "/entities/{entity_id}/records/{record_id}/work/claim" : "/entities/{entity_id}/records/{record_id}/work/release";
			await G(t.client.POST(a, { params: { path: {
				entity_id: n,
				record_id: r
			} } })), i === Y && await X(n, r), de(e === "claim" ? "task-claimed" : "task-released", {
				recordId: r,
				entityId: n
			});
		} catch (e) {
			let a = t.report(e);
			if (i !== Y) return;
			z(V, a, !0), a && await X(n, r);
		} finally {
			i === Y && z(U, !1);
		}
	}
	async function me() {
		let e = v.current;
		if (!e?.signing || !b(F)) return;
		let t = b(M), n = d();
		if (!t) return;
		let r = Y;
		z(U, !0), z(V, null);
		try {
			let i = await e.signing.sign({
				entity: t,
				record: n
			});
			r === Y && (await X(t, n), i === "nothing_to_sign" && z(ie, !0), i === "closed" && r === Y && !b(V) && (b(L) || b(ae) || !b(q)) && de("agentflow-task-changed", {
				recordId: n,
				entityId: t
			})), (i === "signed" || i === "declined") && de(i === "signed" ? "agentflow-signed" : "agentflow-declined", {
				recordId: n,
				entityId: t
			});
		} catch (i) {
			let a = e.report(i);
			if (r !== Y) return;
			z(V, a, !0), a && await X(t, n);
		} finally {
			r === Y && z(U, !1);
		}
	}
	async function Z(e) {
		let t = v.current;
		if (!t || !b(F)) return;
		let n = Tt(b(ne), b(re));
		if (n.length > 0) {
			z(B, Object.fromEntries(n.map((e) => [e, t.t("form.required")])), !0);
			return;
		}
		let r = b(M), i = d();
		if (!r) return;
		let a = Y;
		z(U, !0), z(V, null), z(B, {}, !0);
		try {
			let n = wt(b(ne), b(re));
			e && (n._action = e);
			let o = await G(t.client.POST("/entities/{entity_id}/records/{record_id}/step/submit", {
				params: { path: {
					entity_id: r,
					record_id: i
				} },
				body: { payload: n }
			}));
			a === Y && fe(o), de("task-submitted", {
				recordId: i,
				entityId: r,
				actionId: e
			});
		} catch (e) {
			let n = t.report(e);
			if (a !== Y) return;
			z(B, Dt(n?.fieldErrors), !0), z(V, n, !0);
		} finally {
			a === Y && z(U, !1);
		}
	}
	R(() => {
		o(), c(), A++, z(E, null), z(O, null);
	}), R(() => {
		b(M), c(), d(), Y++, z(F, null), z(L, !1), z(I, f, !0), z(V, null), z(B, {}, !0), z(U, !1), z(W, !1);
	}), R(() => {
		if (!b(w) || o() || !c()) return;
		let e = c();
		te(async () => {
			let t = v.current;
			if (!t) return;
			let n = A;
			try {
				let r = await lt(t.client, "entity", e);
				n === A && z(E, r, !0);
			} catch (e) {
				let r = t.report(e);
				n === A && z(O, r, !0);
			}
		});
	}), R(() => {
		if (!b(w) || !b(M)) return;
		let e = b(M), t = d();
		te(() => X(e, t));
	});
	var he = {
		get entityId() {
			return o();
		},
		set entityId(e) {
			o(e), p();
		},
		get entityKey() {
			return c();
		},
		set entityKey(e) {
			c(e), p();
		},
		get recordId() {
			return d();
		},
		set recordId(e) {
			d(e), p();
		}
	}, ge = g(), Q = P(ge), _e = (e) => {
		let r = n(() => v.current.t);
		var i = Dn(), a = P(i), o = (e) => {
			var t = hn(), n = C(t), r = j(n, !0), i = D(n, 2), a = j(i, !0);
			l(t), k((e) => {
				s(r, b(I).title ?? b(F).run.step_label), s(a, e);
			}, [() => [b(F).run.workflow_name, b(F).instance_name].filter(Boolean).join(" · ")]), _(e, t);
		};
		h(a, (e) => {
			b(F) && !b(L) && e(o);
		});
		var c = D(a, 2), u = (e) => {
			var t = _n(), n = C(t), i = (e) => {
				var t = S();
				k(() => s(t, b(H).detail)), _(e, t);
			}, a = (e) => {
				var t = S();
				k((e) => s(t, e), [() => b(r)("common.error", { code: b(H).code })]), _(e, t);
			};
			h(n, (e) => {
				b(H).code === "APP_KEY_MISSING" ? e(i) : e(a, -1);
			});
			var o = D(n, 2), c = (e) => {
				var t = gn(), n = D(P(t), 1, !0);
				k(() => s(n, b(H).detail)), _(e, t);
			};
			h(o, (e) => {
				b(H).status === 422 && !b(H).fieldErrors?.length && b(H).detail && e(c);
			});
			var u = D(o, 2), d = (e) => {
				var t = gn(), n = D(P(t), 1, !0);
				k((e) => s(n, e), [() => b(r)("common.request_id", { id: b(H).requestId })]), _(e, t);
			};
			h(u, (e) => {
				b(H).requestId && e(d);
			}), l(t), _(e, t);
		};
		h(c, (e) => {
			b(H) && e(u);
		});
		var d = D(c, 2), f = (e) => {
			var t = vn(), n = j(t, !0);
			k((e) => s(n, e), [() => b(r)("common.loading")]), _(e, t);
		};
		h(d, (e) => {
			b(W) && e(f);
		});
		var p = D(d, 2), m = (e) => {
			var t = yn(), n = j(t, !0);
			k((e) => s(n, e), [() => b(r)("task.withheld")]), _(e, t);
		}, y = (e) => {
			let i = (e) => {
				var t = bn(), n = j(t, !0);
				k((e) => {
					t.disabled = b(U), s(n, e);
				}, [() => b(r)("task.release")]), N("click", t, () => pe("release")), _(e, t);
			}, a = (e) => {
				var t = xn(), n = j(t, !0);
				k((e) => {
					t.disabled = b(U), s(n, e);
				}, [() => b(r)("task.sign")]), N("click", t, me), _(e, t);
			};
			var o = g(), c = P(o), u = (e) => {
				var t = yn(), n = j(t, !0);
				k((e) => s(n, e), [() => b(F).step_status === "cancelled" ? b(r)("task.cancelled") : b(r)("task.done")]), _(e, t);
			}, d = (e) => {
				var t = yn(), n = j(t, !0);
				k((e) => s(n, e), [() => b(r)("task.signed_waiting")]), _(e, t);
			}, f = (e) => {
				var t = Sn(), n = C(t), i = j(n, !0);
				l(t), k((e) => {
					n.disabled = b(U), s(i, e);
				}, [() => b(r)("task.claim")]), N("click", n, () => pe("claim")), _(e, t);
			}, p = (e) => {
				var t = Cn(), n = P(t), o = (e) => {
					var t = yn(), n = j(t, !0);
					k((e) => s(n, e), [() => b(r)("task.sign_elsewhere")]), _(e, t);
				};
				h(n, (e) => {
					b(K) || e(o);
				});
				var c = D(n, 2), u = C(c);
				i(u);
				var d = D(u, 2), f = (e) => {
					a(e);
				};
				h(d, (e) => {
					b(K) && e(f);
				}), l(c), _(e, t);
			}, m = (e) => {
				var t = wn(), n = P(t), a = j(n, !0), o = D(n, 2), c = C(o);
				i(c), l(o), k((e) => s(a, e), [() => b(r)("task.select_elsewhere")]), _(e, t);
			}, v = (e) => {
				var o = En(), c = C(o);
				{
					let e = n(() => b(U) || b(le));
					st(c, {
						get fields() {
							return b(ne);
						},
						get errors() {
							return b(B);
						},
						get disabled() {
							return b(e);
						},
						get t() {
							return b(r);
						},
						get values() {
							return b(re);
						},
						set values(e) {
							z(re, e, !0);
						}
					});
				}
				var u = D(c, 2), d = (e) => {
					var t = Tn(), n = j(t, !0);
					k((e) => s(n, e), [() => b(r)("form.unsupported_required")]), _(e, t);
				};
				h(u, (e) => {
					b(se).length > 0 && !b(le) && e(d);
				});
				var f = D(u, 2), p = (e) => {
					var t = yn(), n = j(t, !0);
					k((e) => s(n, e), [() => b(r)("task.no_actions")]), _(e, t);
				};
				h(f, (e) => {
					b(F).actions_gated_out && e(p);
				});
				var m = D(f, 2), v = (e) => {
					var t = yn(), n = j(t, !0);
					k((e) => s(n, e), [() => b(r)("task.sign_elsewhere")]), _(e, t);
				};
				h(m, (e) => {
					b(J) && !b(K) && e(v);
				});
				var y = D(m, 2), x = (e) => {
					var t = yn(), n = j(t, !0);
					k((e) => s(n, e), [() => b(r)("task.sign_in_dialog")]), _(e, t);
				};
				h(y, (e) => {
					b(le) && e(x);
				});
				var S = D(y, 2), w = C(S);
				i(w);
				var T = D(w, 2), E = (e) => {
					a(e);
				}, O = (e) => {
					var n = g(), r = P(n);
					t(r, 17, () => b(ce), (e) => e.id, (e, t) => {
						var n = xn(), r = j(n, !0);
						k(() => {
							n.disabled = b(U) || b(se).length > 0, s(r, b(t).label);
						}), N("click", n, () => Z(b(t).id)), _(e, n);
					}), _(e, n);
				}, A = (e) => {
					var t = xn(), n = j(t, !0);
					k((e) => {
						t.disabled = b(U) || b(se).length > 0, s(n, e);
					}, [() => b(r)("task.submit")]), N("click", t, () => Z(null)), _(e, t);
				};
				h(T, (e) => {
					b(le) ? e(E) : b(F).actions.length > 0 ? e(O, 1) : b(F).actions_gated_out || e(A, 2);
				}), l(S), l(o), ee("submit", o, (e) => e.preventDefault()), _(e, o);
			}, y = (e) => {
				var t = yn(), n = j(t, !0);
				k((e) => s(n, e), [() => b(I).name ? b(r)("task.claimed_by", { name: b(I).name }) : b(r)("task.claimed_by_someone")]), _(e, t);
			};
			h(c, (e) => {
				b(ae) ? e(u) : b(oe) ? e(d, 1) : b(I).id ? b(q) && (b(F).kind === "signature" || b(F).signs && !b(J)) ? e(p, 3) : b(q) && b(ue) ? e(m, 4) : b(q) ? e(v, 5) : e(y, -1) : e(f, 2);
			}), _(e, o);
		};
		h(p, (e) => {
			b(L) ? e(m) : b(F) && e(y, 1);
		}), _(e, i);
	};
	return h(Q, (e) => {
		v.current && b(w) && e(_e);
	}), _(e, ge), i(he);
}
L(["click"]), w(kn, {
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
var An = v("<br/> ", 1), jn = v("<p part=\"error\" class=\"error svelte-j92hy\" role=\"alert\"> <!></p>"), Mn = v("<p part=\"empty\" class=\"muted svelte-j92hy\"> </p>"), Nn = v("<tr part=\"row\" tabindex=\"0\" class=\"svelte-j92hy\"><td class=\"svelte-j92hy\"> </td><td class=\"svelte-j92hy\"> </td><td class=\"svelte-j92hy\"> </td><td class=\"svelte-j92hy\"> </td></tr>"), Pn = v("<table part=\"table\" class=\"svelte-j92hy\"><thead><tr><th class=\"svelte-j92hy\"> </th><th class=\"svelte-j92hy\"> </th><th class=\"svelte-j92hy\"> </th><th class=\"svelte-j92hy\"> </th></tr></thead><tbody></tbody></table>"), Fn = v("<p class=\"muted svelte-j92hy\"> </p>"), In = v("<button part=\"load-more\" type=\"button\" class=\"svelte-j92hy\"> </button>"), Ln = v("<!> <!> <!> <!>", 1), Rn = {
	hash: "svelte-j92hy",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}table.svelte-j92hy {width:100%;border-collapse:collapse;}th.svelte-j92hy, td.svelte-j92hy {text-align:start;padding:8px;border-block-end:1px solid var(--agentflow-border, #eaecf0);}tr[part='row'].svelte-j92hy {cursor:pointer;}tr[part='row'].svelte-j92hy:hover, tr[part='row'].svelte-j92hy:focus {background:color-mix(in srgb, var(--agentflow-accent, #1570ef) 8%, transparent);}.muted.svelte-j92hy {color:var(--agentflow-muted, #667085);}.error.svelte-j92hy {color:var(--agentflow-danger, #b42318);}button.svelte-j92hy {font:inherit;margin-block-start:var(--agentflow-gap, 12px);padding:6px 12px;cursor:pointer;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);background:transparent;}"
};
function zn(e, r) {
	u(r, !0), a(e, Rn);
	let o = y(r, "view", 7), c = y(r, "pageSize", 7), d = y(r, "signs", 7), f = n(() => o() === "mine" || o() === "claimable" ? o() : "all"), m = n(() => Ge(c())), v = n(() => d() === "true" || d() !== "false" && void 0), S = r.$$host, w = Ot(S), E = n(() => w.current?.state === "ready"), O = x(T([])), A = x(null), M = x(!1), F = x(!1), ee = x(null), I = 0;
	async function L(e) {
		let t = w.current;
		if (!t) return;
		let n = ++I;
		z(F, !0), z(ee, null), e || z(A, null);
		try {
			let r = {
				view: b(f),
				live: !0,
				limit: b(m)
			};
			b(v) !== void 0 && (r.signs = b(v)), e && (r.cursor = e);
			let i = await G(t.client.GET("/work", { params: { query: r } }));
			if (n !== I) return;
			let a = i.items.filter((e) => e.step);
			z(O, e ? [...b(O), ...a] : a, !0), z(A, i.next_cursor, !0), z(M, !0);
		} catch (r) {
			let i = t.report(r);
			n === I && (z(ee, i, !0), e || z(O, [], !0));
		} finally {
			n === I && z(F, !1);
		}
	}
	R(() => {
		b(E) && (b(f), b(m), b(v), te(() => L()));
	});
	let ne = (e) => S.dispatchEvent(new CustomEvent("task-select", {
		detail: {
			recordId: e.id,
			entityId: e.entity_id
		},
		bubbles: !0,
		composed: !0
	}));
	var re = {
		get view() {
			return o();
		},
		set view(e) {
			o(e), p();
		},
		get pageSize() {
			return c();
		},
		set pageSize(e) {
			c(e), p();
		},
		get signs() {
			return d();
		},
		set signs(e) {
			d(e), p();
		}
	}, B = g(), H = P(B), U = (e) => {
		let r = n(() => w.current.t);
		var i = Ln(), a = P(i), o = (e) => {
			var t = jn(), n = C(t), i = D(n), a = (e) => {
				var t = An(), n = D(P(t), 1, !0);
				k((e) => s(n, e), [() => b(r)("common.request_id", { id: b(ee).requestId })]), _(e, t);
			};
			h(i, (e) => {
				b(ee).requestId && e(a);
			}), l(t), k((e) => s(n, `${e ?? ""} `), [() => b(r)("common.error", { code: b(ee).code })]), _(e, t);
		};
		h(a, (e) => {
			b(ee) && e(o);
		});
		var c = D(a, 2), u = (e) => {
			var t = Mn(), n = j(t, !0);
			k((e) => s(n, e), [() => b(r)("inbox.empty")]), _(e, t);
		}, d = (e) => {
			var n = Pn(), i = C(n), a = C(i), o = C(a), c = j(o, !0), u = D(o), d = j(u, !0), f = D(u), p = j(f, !0), m = D(f), h = j(m, !0);
			l(a), l(i);
			var g = D(i);
			t(g, 21, () => b(O), (e) => e.id, (e, t) => {
				var n = Nn(), i = C(n), a = j(i, !0), o = D(i), c = j(o, !0), u = D(o), d = j(u, !0), f = D(u), p = j(f, !0);
				l(n), k((e, n) => {
					s(a, b(t).step?.step.label || b(t).step?.step.key), s(c, b(t).step?.workflow.name ?? ""), s(d, e), s(p, n);
				}, [() => b(r)(b(t).claimed_by_user_id ? "status.claimed" : "status.open"), () => V(b(t).due_at, w.current.locale)]), N("click", n, () => ne(b(t))), N("keydown", n, (e) => e.key === "Enter" && ne(b(t))), _(e, n);
			}), l(g), l(n), k((e, t, n, r) => {
				s(c, e), s(d, t), s(p, n), s(h, r);
			}, [
				() => b(r)("inbox.column.task"),
				() => b(r)("inbox.column.workflow"),
				() => b(r)("inbox.column.status"),
				() => b(r)("inbox.column.due")
			]), _(e, n);
		};
		h(c, (e) => {
			b(M) && !b(F) && b(O).length === 0 && !b(ee) && !b(A) ? e(u) : b(O).length > 0 && e(d, 1);
		});
		var f = D(c, 2), p = (e) => {
			var t = Fn(), n = j(t, !0);
			k((e) => s(n, e), [() => b(r)("common.loading")]), _(e, t);
		};
		h(f, (e) => {
			b(F) && e(p);
		});
		var m = D(f, 2), g = (e) => {
			var t = In(), n = j(t, !0);
			k((e) => s(n, e), [() => b(r)("common.load_more")]), N("click", t, () => L(b(A) ?? void 0)), _(e, t);
		};
		h(m, (e) => {
			b(A) && !b(F) && e(g);
		}), _(e, i);
	};
	return h(H, (e) => {
		w.current && b(E) && e(U);
	}), _(e, B), i(re);
}
L(["click", "keydown"]), w(zn, {
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
function Bn(e, t) {
	let n = Te(t), r = e ?? `${location.pathname}${location.search}${location.hash}`;
	location.assign(`${n}/auth/login?returnTo=${encodeURIComponent(r)}`);
}
function Vn(e) {
	let t = document.createElement("form");
	t.method = "post", t.action = `${Te(e)}/auth/logout`, t.dataset.agentflowSignOut = "", t.hidden = !0, document.body.append(t), t.submit();
}
//#endregion
//#region src/task-context.ts
function Hn(e, t) {
	let n = !1, r = je(e, ke, (e) => {
		n = !0, t(e);
	});
	return n || t(null), r;
}
//#endregion
//#region src/index.ts
var Un = {
	"agentflow-provider": Je,
	"agentflow-task": mn,
	"agentflow-task-inbox": zn,
	"agentflow-task-detail": kn,
	"agentflow-record-table": Gt,
	"agentflow-start-form": fn
}, Wn = M;
for (let e of Object.values(Un)) Object.defineProperty(e.element, "elementsVersion", { value: Wn });
function Gn(e = customElements) {
	Jt(e, Un, "elementsVersion", Wn, "elements");
}
Gn();
//#endregion
export { Wn as ELEMENTS_VERSION, Hn as consumeTask, Gn as defineAgentFlowElements, Xt as defineFolderSource, Bn as signIn, Vn as signOut };
