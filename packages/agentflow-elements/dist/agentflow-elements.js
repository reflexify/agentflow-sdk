import { A as e, B as t, Ct as n, D as r, Dt as i, F as a, H as o, J as s, M as c, Nt as l, Ot as u, R as d, S as f, St as p, T as m, U as h, X as g, Y as _, Z as v, _ as y, at as b, bt as x, et as S, ft as C, g as w, gt as T, h as E, ht as D, k as O, lt as k, m as A, mt as j, n as M, nt as N, ot as P, pt as F, r as I, rt as ee, st as L, t as R, tt as z, ut as B, vt as V, w as te, x as H, xt as U } from "./chunks/version-DyshBDr6.js";
import { n as W, t as G } from "./chunks/format-GenuUIkK.js";
//#region ../agentflow-sdk/dist/auth.js
function K() {
	return {
		async headers() {
			return {};
		},
		credentials: "same-origin"
	};
}
//#endregion
//#region ../agentflow-sdk/dist/errors.js
var ne = class extends Error {
	status;
	code;
	detail;
	requestId;
	fieldErrors;
	constructor(e, t, n, r, i) {
		super(n ? `${t}: ${n}` : t), this.status = e, this.code = t, this.detail = n, this.requestId = r, this.fieldErrors = i, this.name = "AgentFlowError";
	}
};
async function q(e) {
	let { data: t, error: n, response: r } = await e;
	if (r.ok && n === void 0) return t;
	let i = n ?? {};
	throw new ne(r.status, i.type ?? `HTTP_${r.status}`, i.detail, i.request_id, i.field_errors ?? void 0);
}
//#endregion
//#region ../agentflow-sdk/dist/app/version.js
var re = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/;
function J(e) {
	let t = typeof e == "string" ? re.exec(e) : null, n = t ? [
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
var Y = /^\d+$/;
function ie(e, t) {
	let n = Y.test(e), r = Y.test(t);
	return n && r ? Math.sign(Number(e) - Number(t)) : n ? -1 : r ? 1 : e < t ? -1 : +(e > t);
}
function ae(e, t) {
	let n = J(e), r = J(t);
	for (let e = 0; e < 3; e++) if (n.core[e] !== r.core[e]) return n.core[e] < r.core[e] ? -1 : 1;
	if (n.pre.length === 0 || r.pre.length === 0) return Math.sign(r.pre.length - n.pre.length);
	for (let e = 0; e < Math.min(n.pre.length, r.pre.length); e++) {
		let t = ie(n.pre[e], r.pre[e]);
		if (t !== 0) return t;
	}
	return Math.sign(n.pre.length - r.pre.length);
}
//#endregion
//#region ../agentflow-sdk/dist/app/objects.js
var oe = 3e4, se = [
	"own",
	"bound",
	"exported"
], ce = /* @__PURE__ */ new WeakMap();
function le(e, t = {}) {
	let n = ce.get(e);
	return n || (n = ue(e, t.recheckAfterMs ?? oe), ce.set(e, n)), n;
}
function ue(e, t) {
	let n = null, r = !1, i = null, a = -1, o = 0, s = /* @__PURE__ */ new Set(), c = (e) => void e.catch(() => {});
	function l(t = !1) {
		if (i) return i;
		let u = (async () => {
			await Promise.resolve();
			try {
				let t = await q(e.GET("/app/objects"));
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
			ae(t, t);
			let r = d(e, n);
			if (!r || r.state === "off" || r.contract_version == null) return !1;
			try {
				return ae(r.contract_version, t) >= 0;
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
function X(e, t, n = []) {
	let r = e.form_definition_id ? new Set(n) : /* @__PURE__ */ new Set([...t, ...n]);
	return e.params_slots.map((e) => e.key).filter((e) => !r.has(e));
}
//#endregion
//#region ../agentflow-sdk/dist/paginate.js
async function* fe(e) {
	let t = /* @__PURE__ */ new Set(), n;
	do {
		let r = await e(n);
		if (yield* r.items, n = r.next_cursor ?? void 0, n !== void 0 && t.has(n)) break;
		n !== void 0 && t.add(n);
	} while (n);
}
//#endregion
//#region ../agentflow-sdk/dist/folders.js
function pe(e, t) {
	return t === void 0 ? { $fileSet: e } : {
		$fileSet: e,
		path: t
	};
}
var me = 8, he = 200;
async function ge(e) {
	let t = e.createReader(), n = [];
	for (;;) {
		let e = await new Promise((e, n) => t.readEntries(e, n));
		if (e.length === 0) return n;
		n.push(...e);
	}
}
function Z(e) {
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
	let r = await n(() => ge(e));
	return (await Promise.all(r.map((e) => _e(e, t ? `${t}/${e.name}` : e.name, n)))).flat();
}
var ve = /* @__PURE__ */ new Set([
	".ds_store",
	"thumbs.db",
	"desktop.ini"
]), ye = (e) => ve.has(e.slice(e.lastIndexOf("/") + 1).toLowerCase());
async function be(e) {
	let t = Z(me);
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
		await q(e.DELETE("/upload-sets/{file_set_id}", { params: { path: { file_set_id: t } } }));
	}
	async function n(n, r, i) {
		let a = [];
		try {
			let t = fe((t) => q(e.GET("/upload-sets/{file_set_id}/files", {
				params: {
					path: { file_set_id: n },
					query: {
						cursor: t,
						limit: he
					}
				},
				signal: i
			})));
			for await (let e of t) a.push(e);
		} catch (e) {
			if (e instanceof ne && e.status === 404) return null;
			throw e;
		}
		return a.length === r.size && a.every((e) => r.get(e.path)?.size === e.byte_size) ? a : (await t(n).catch((e) => {
			if (!(e instanceof ne)) throw e;
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
			})), n = await q(e.POST("/upload-sets", {
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
						await q(e.POST("/upload-sets/{file_set_id}/files", {
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
			a?.throwIfAborted(), await q(e.POST("/upload-sets/{file_set_id}/complete", {
				params: { path: { file_set_id: c } },
				signal: a
			}));
		} catch (e) {
			throw !s && a?.aborted && await t(c).catch(() => void 0), e;
		}
		return {
			value: pe(c),
			refused: l
		};
	}
	return {
		async watched() {
			return (await q(e.GET("/watched-folders"))).items;
		},
		subfolders(t, n, r) {
			return q(e.GET("/watched-folders/{file_set_id}/subfolders", { params: {
				path: { file_set_id: t },
				query: {
					path: n,
					cursor: r ?? void 0
				}
			} }));
		},
		preview(t, n, r, i) {
			return q(e.POST("/workflows/{workflow_id}/folder-preview", {
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
//#region src/base-path.ts
var Q = "/agentflow", Ce = /^\/(?!\/)/;
function we(e) {
	try {
		return new URL(e, location.origin).origin === location.origin;
	} catch {
		return !1;
	}
}
function Te(e) {
	return e == null ? Q : Ce.test(e) && we(e) ? e.replace(/\/+$/, "") : (console.warn(`agentflow: base-path ${JSON.stringify(e)} is not a path on this origin; using ${Q}.`), Q);
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
var Fe = "APP_KEY_MISSING", Ie = /* @__PURE__ */ new Set([
	"APP_NOT_ASSIGNED",
	"APP_NOT_INSTALLED",
	"USER_NOT_PROJECTED"
]);
function Le(e) {
	let t = e;
	return typeof t == "object" && !!t && typeof t.status == "number" && typeof t.code == "string";
}
var Re = (e) => typeof e == "object" && !!e && typeof e.path == "string" && typeof e.message == "string";
function ze(e) {
	if (Le(e)) {
		if (e.status === 401) return { type: "signed-out" };
		if (e.status === 403 && Ie.has(e.code)) return {
			type: "access-lost",
			code: e.code
		};
		let t = {
			code: e.code,
			status: e.status
		};
		return typeof e.detail == "string" && (t.detail = e.detail), typeof e.requestId == "string" && (t.requestId = e.requestId), Array.isArray(e.fieldErrors) && (t.fieldErrors = e.fieldErrors.filter(Re).map(({ path: e, message: t }) => ({
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
var Be = {
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
		"status.open": "Mới",
		"status.claimed": "Đã nhận",
		"status.submitted": "Đã gửi",
		"status.cancelled": "Đã hủy"
	}
};
function Ve(e, t) {
	return e === "en" || e === "vi" ? e : t?.toLowerCase().startsWith("vi") ? "vi" : "en";
}
function $(e, t) {
	return (n, r) => (t[n] ?? Be[e][n] ?? n).replace(/\{(\w+)\}/g, (e, t) => r && t in r ? String(r[t]) : e);
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
	let r = y(t, "basePath", 7, Q), a = y(t, "locale", 7, void 0), o = y(t, "strings", 23, () => ({})), s = y(t, "fetchImpl", 7, void 0), c = y(t, "signing", 7, void 0), l = y(t, "tasks", 7, void 0), f = y(t, "client", 7, void 0), m = t.$$host, h = x("loading"), v = x(null), S = L(() => qe(f(), "client") ?? A({
		baseUrl: `${location.origin}${Te(r())}/api`,
		auth: K(),
		fetch: Ke(s(), "fetchImpl") ?? globalThis.fetch.bind(globalThis)
	})), C = !1, w = (e, t) => {
		C || m.dispatchEvent(new CustomEvent(e, {
			detail: t,
			bubbles: !0,
			composed: !0
		}));
	};
	function T(e) {
		C || (V(h, e, !0), m.dataset.state = e);
	}
	m.dataset.state = "loading";
	function E(e, t) {
		let n = ze(e);
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
	let O = n(() => Ve(a(), typeof navigator > "u" ? void 0 : navigator.language)), k = n(() => ({
		state: b(h),
		caller: b(v),
		client: S,
		signing: We(c(), "signing") ?? null,
		tasks: We(l(), "tasks") ?? null,
		locale: b(O),
		t: $(b(O), We(o(), "strings") ?? {}),
		report: D
	})), j = Pe(m, Oe, L(() => b(k)));
	B(() => j.set(b(k))), B(() => () => {
		C = !0, j.dispose();
	}), (async () => {
		try {
			let e = await q(S.GET("/caller"));
			V(v, e, !0), T("ready"), w("session-ready", { caller: e });
		} catch (e) {
			E(e, !0);
		}
	})();
	var M = {
		get basePath() {
			return r();
		},
		set basePath(e = Q) {
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
	}, N = g(), P = F(N);
	return d(P, t, "default", {}, null), _(e, N), i(M);
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
var Ye = v("<span class=\"req svelte-olgbsr\">*</span>"), Xe = v("<input part=\"input\" type=\"checkbox\" class=\"svelte-olgbsr\"/>"), Ze = v("<option> </option>"), Qe = v("<select part=\"input\" class=\"svelte-olgbsr\"><option>—</option><!></select>"), $e = v("<button part=\"field-retry\" type=\"button\" class=\"svelte-olgbsr\"> </button>"), et = v("<p part=\"field-error\" class=\"error svelte-olgbsr\" role=\"alert\"> </p> <!>", 1), tt = v("<p part=\"notice\" class=\"muted svelte-olgbsr\" role=\"status\"> </p>"), nt = v("<af-folder-source></af-folder-source>", 2), rt = v("<p part=\"notice\" class=\"muted svelte-olgbsr\"> </p>"), it = v("<input part=\"input\" class=\"svelte-olgbsr\"/>"), at = v("<p class=\"muted svelte-olgbsr\"> </p>"), ot = v("<p part=\"field-error\" class=\"error svelte-olgbsr\" role=\"alert\"> </p>"), st = v("<div part=\"field\" class=\"field svelte-olgbsr\"><label part=\"label\" class=\"svelte-olgbsr\"> <!></label> <!> <!> <!></div>"), ct = {
	hash: "svelte-olgbsr",
	code: ".field.svelte-olgbsr {display:grid;gap:4px;margin-block-end:var(--agentflow-gap, 12px);}label.svelte-olgbsr {font-weight:600;}.req.svelte-olgbsr {color:var(--agentflow-danger, #b42318);}.muted.svelte-olgbsr {color:var(--agentflow-muted, #667085);margin:0;font-size:0.9em;}.error.svelte-olgbsr {color:var(--agentflow-danger, #b42318);margin:0;}input.svelte-olgbsr, select.svelte-olgbsr {font:inherit;padding:6px 8px;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);}\n  /* Marked unavailable while its retry loads, but still focusable: a disabled button would drop focus. */[part='field-retry'][aria-disabled='true'].svelte-olgbsr {opacity:0.6;cursor:progress;}"
};
function lt(n, c) {
	u(c, !0), a(n, ct);
	let d = y(c, "fields", 7), v = y(c, "values", 31, () => T({})), x = y(c, "errors", 23, () => ({})), S = y(c, "disabled", 7, !1), w = y(c, "t", 7), E = y(c, "folders", 7, null), A = y(c, "foldersReady", 7, !0), M = y(c, "foldersFailed", 7, !1), P = y(c, "foldersRetrying", 7, !1), I = y(c, "onFolderRetry", 7), L = y(c, "uploading", 31, () => T({})), R = y(c, "refusing", 31, () => T({})), z = {
		text: "text",
		email: "email",
		date: "date",
		datetime: "datetime-local",
		number: "number",
		integer: "number"
	};
	var B = {
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
		get foldersRetrying() {
			return P();
		},
		set foldersRetrying(e = !1) {
			P(e), p();
		},
		get onFolderRetry() {
			return I();
		},
		set onFolderRetry(e) {
			I(e), p();
		},
		get uploading() {
			return L();
		},
		set uploading(e = {}) {
			L(e), p();
		},
		get refusing() {
			return R();
		},
		set refusing(e = {}) {
			R(e), p();
		}
	}, V = g(), U = F(V);
	return t(U, 17, d, (e) => e.key, (n, i) => {
		var a = st(), c = C(a), u = C(c, !0), d = D(u), p = (e) => {
			var t = Ye();
			k((e) => m(t, "title", e), [() => w()("form.required")]), _(e, t);
		};
		h(d, (e) => {
			b(i).required && e(p);
		}), l(c);
		var y = D(c, 2), T = (e) => {
			var t = Xe();
			te(t), k(() => {
				m(t, "id", `f-${b(i).key}`), t.disabled = S();
			}), H(t, () => v()[b(i).key], (e) => v(v()[b(i).key] = e, !0)), _(e, t);
		}, B = (n) => {
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
		}, V = (e) => {
			var t = et(), n = F(t), r = j(n, !0), a = D(n, 2), o = (e) => {
				var t = $e(), n = j(t, !0);
				k((e) => {
					m(t, "data-field", b(i).key), m(t, "aria-disabled", P() ? "true" : "false"), s(n, e);
				}, [() => w()("form.folder_retry")]), N("click", t, function(...e) {
					I()?.apply(this, e);
				}), _(e, t);
			};
			h(a, (e) => {
				I() && e(o);
			}), k((e) => s(r, e), [() => w()("form.folder_unavailable")]), _(e, t);
		}, U = (e) => {
			var t = tt(), n = j(t, !0);
			k((e) => s(n, e), [() => w()("common.loading")]), _(e, t);
		}, W = (e) => {
			var t = g(), n = F(t);
			o(n, () => E().round, (e) => {
				var t = nt();
				r(t, "part", "folder-source"), k(() => r(t, "id", `f-${b(i).key}`)), r(t, "role", "group"), k(() => r(t, "aria-labelledby", `l-${b(i).key}`)), k(() => r(t, "resumeSet", E().resumeSets?.[b(i).key] ?? null)), k(() => r(t, "sources", E().sources)), k(() => r(t, "workflow", E().workflow)), k(() => r(t, "field", b(i).key)), k(() => r(t, "folder", b(i).folder)), k(() => r(t, "locale", E().locale)), k(() => r(t, "disabled", S())), ee("af-folder-upload-started", t, (e) => E().uploadStarted(b(i).key, e.detail.setId)), ee("af-folder-busy", t, (e) => L(L()[b(i).key] = e.detail.busy, !0)), ee("af-folder-change", t, (e) => {
					v(v()[b(i).key] = e.detail.value, !0), R(R()[b(i).key] = !!e.detail.preview?.refusal, !0);
				}), _(e, t);
			}), _(e, t);
		}, G = (e) => {
			var t = rt(), n = j(t, !0);
			k((e) => s(n, e), [() => w()("form.unsupported")]), _(e, t);
		}, K = (e) => {
			var t = it();
			te(t), k(() => {
				m(t, "id", `f-${b(i).key}`), m(t, "type", z[b(i).kind]), m(t, "step", b(i).kind === "integer" ? "1" : b(i).kind === "number" ? "any" : void 0), t.disabled = S();
			}), f(t, () => v()[b(i).key], (e) => v(v()[b(i).key] = e, !0)), _(e, t);
		};
		h(y, (e) => {
			b(i).kind === "boolean" ? e(T) : b(i).kind === "choice" ? e(B, 1) : b(i).kind === "folder" && E() && (M() || P()) ? e(V, 2) : b(i).kind === "folder" && E() && !A() ? e(U, 3) : b(i).kind === "folder" && E() ? e(W, 4) : b(i).kind === "unsupported" || b(i).kind === "folder" ? e(G, 5) : e(K, -1);
		});
		var ne = D(y, 2), q = (e) => {
			var t = at(), n = j(t, !0);
			k(() => s(n, b(i).description)), _(e, t);
		};
		h(ne, (e) => {
			b(i).description && e(q);
		});
		var re = D(ne, 2), J = (e) => {
			var t = rt(), n = j(t, !0);
			k((e) => s(n, e), [() => w()("form.uploading")]), _(e, t);
		}, Y = (e) => {
			var t = ot(), n = j(t, !0);
			k(() => s(n, x()[b(i).key])), _(e, t);
		};
		h(re, (e) => {
			L()[b(i).key] ? e(J) : x()[b(i).key] && e(Y, 1);
		}), l(a), k(() => {
			m(c, "id", `l-${b(i).key}`), m(c, "for", b(i).kind === "folder" ? void 0 : `f-${b(i).key}`), s(u, b(i).label);
		}), _(n, a);
	}), _(n, V), i(B);
}
z(["click"]), w(lt, {
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
var ut = class extends Error {
	kind;
	key;
	constructor(e, t) {
		super(`${e}:${t} is not installed`), this.kind = e, this.key = t, this.name = "AppKeyMissing";
	}
};
async function dt(e, t, n) {
	let r = le(e);
	await r.load();
	let i = r.id(`${t}:${n}`);
	if (i === null) throw new ut(t, n);
	return i;
}
//#endregion
//#region src/form.ts
var ft = (e) => typeof e == "object" && !!e && !Array.isArray(e);
function pt(e) {
	let t = e.type;
	if (typeof t == "string") return t;
	if (Array.isArray(t)) return t.find((e) => e !== "null");
}
function mt(e) {
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
function ht(e) {
	if (Array.isArray(e.oneOf)) {
		let t = e.oneOf.filter((e) => !(ft(e) && e.const === null)), n = [];
		for (let e of t) {
			if (!ft(e) || typeof e.const != "string") return { kind: "unsupported" };
			n.push({
				value: e.const,
				label: typeof e.title == "string" ? e.title : e.const
			});
		}
		return n.length > 0 ? mt(n) : { kind: "unsupported" };
	}
	if (Array.isArray(e.enum)) {
		if (!e.enum.every((e) => typeof e == "string" || e === null)) return { kind: "unsupported" };
		let t = e.enum.filter((e) => typeof e == "string");
		return t.length > 0 ? mt(t.map((e) => ({
			value: e,
			label: e
		}))) : { kind: "unsupported" };
	}
	let t = pt(e);
	if (t === "string") switch (e.format) {
		case void 0: return { kind: "text" };
		case "date": return { kind: "date" };
		case "date-time": return { kind: "datetime" };
		case "email": return { kind: "email" };
		default: return { kind: "unsupported" };
	}
	return t === "number" ? { kind: "number" } : t === "integer" ? { kind: "integer" } : t === "boolean" ? { kind: "boolean" } : { kind: "unsupported" };
}
function gt(e) {
	return ft(e) && e.type === "array" && ft(e.items) && e.items.type === "string" && e.items.format === "attachment";
}
function _t(e) {
	return ft(e) && ft(e.properties) && Object.values(e.properties).some(gt);
}
var vt = /^#\/properties\/([^/]+)$/;
function yt(e, t = []) {
	if (!ft(e)) return t;
	if (e.type === "Control" && typeof e.scope == "string") {
		let n = vt.exec(e.scope)?.[1];
		n !== void 0 && t.push(n);
	}
	if (Array.isArray(e.elements)) for (let n of e.elements) yt(n, t);
	return t;
}
function bt(e, t, n = []) {
	if (!ft(e) || !ft(e.properties)) return [];
	let r = e.properties, i = new Set(Array.isArray(e.required) ? e.required : []), a = (e) => typeof e == "string" && Object.hasOwn(r, e), o = Array.isArray(e["x-order"]) ? e["x-order"].filter(a) : [], s = new Map(n.flatMap((e) => e.folder ? [[e.key, e.folder]] : []));
	return [.../* @__PURE__ */ new Set([
		...yt(t).filter(a),
		...o,
		...Object.keys(r)
	])].map((e) => {
		let t = ft(r[e]) ? r[e] : {}, n = gt(t) ? s.get(e) : void 0, a = {
			key: e,
			label: typeof t.title == "string" ? t.title : e,
			required: i.has(e),
			...n ? {
				kind: "folder",
				folder: n
			} : ht(t)
		};
		return typeof t.description == "string" && (a.description = t.description), a;
	});
}
function xt(e) {
	return e.flatMap((e) => e.folder ? [{
		key: e.key,
		label: e.title || e.key,
		kind: "folder",
		required: e.required === !0,
		folder: e.folder
	}] : []);
}
var St = (e) => String(e).padStart(2, "0");
function Ct(e) {
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? "" : `${t.getFullYear()}-${St(t.getMonth() + 1)}-${St(t.getDate())}T${St(t.getHours())}:${St(t.getMinutes())}`;
}
function wt(e, t) {
	let n = ft(t) ? t : {}, r = {};
	for (let t of e) {
		let e = n[t.key];
		t.kind === "boolean" ? r[t.key] = e === !0 : t.kind === "datetime" ? r[t.key] = typeof e == "string" ? Ct(e) : "" : t.kind === "unsupported" ? r[t.key] = e : t.kind === "folder" ? r[t.key] = null : r[t.key] = e ?? "";
	}
	return r;
}
var Tt = (e) => e == null || e === "";
function Et(e, t) {
	let n = {};
	for (let r of e) {
		let e = t[r.key];
		if (r.kind === "boolean") {
			n[r.key] = e === !0;
			continue;
		}
		Tt(e) || (r.kind === "number" || r.kind === "integer" ? n[r.key] = Number(e) : r.kind === "datetime" ? n[r.key] = new Date(String(e)).toISOString() : n[r.key] = e);
	}
	return n;
}
function Dt(e, t) {
	return e.filter((e) => e.required && e.kind !== "boolean" && e.kind !== "unsupported" && Tt(t[e.key])).map((e) => e.key);
}
function Ot(e, t = !1) {
	return e.filter((e) => e.required && (e.kind === "unsupported" || t && e.kind === "folder"));
}
function kt(e) {
	let t = {};
	for (let n of e ?? []) {
		let e = n.path.replace(/^\//, "").split("/")[0] ?? "";
		t[e] ??= n.message;
	}
	return t;
}
//#endregion
//#region src/use-agentflow.svelte.ts
function At(e) {
	let t = x(null);
	return B(() => je(e, Oe, (e) => V(t, e))), { get current() {
		return b(t);
	} };
}
//#endregion
//#region src/elements/RecordTable.svelte
var jt = v("<form part=\"search\" role=\"search\"><input type=\"search\" class=\"svelte-1xcrvv6\"/></form>"), Mt = v("<button part=\"create-button\" type=\"button\" class=\"svelte-1xcrvv6\"> </button>"), Nt = v("<div part=\"toolbar\" class=\"svelte-1xcrvv6\"><!> <!></div>"), Pt = v("<p part=\"notice\" class=\"error svelte-1xcrvv6\"> </p>"), Ft = v("<form part=\"form\"><!> <!> <div part=\"actions\" class=\"svelte-1xcrvv6\"><button part=\"button\" type=\"button\" class=\"secondary svelte-1xcrvv6\"> </button> <button part=\"button\" type=\"button\" class=\"svelte-1xcrvv6\"> </button></div></form>"), It = v("<br/> ", 1), Lt = v("<p part=\"error\" class=\"error svelte-1xcrvv6\" role=\"alert\"><!> <!></p>"), Rt = v("<p part=\"empty\" class=\"muted svelte-1xcrvv6\"> </p>"), zt = v("<th class=\"svelte-1xcrvv6\"> </th>"), Bt = v("<td part=\"cell\" class=\"svelte-1xcrvv6\"> </td>"), Vt = v("<tr part=\"row\" tabindex=\"0\" class=\"svelte-1xcrvv6\"></tr>"), Ht = v("<table part=\"table\" class=\"svelte-1xcrvv6\"><thead><tr></tr></thead><tbody></tbody></table>"), Ut = v("<p class=\"muted svelte-1xcrvv6\"> </p>"), Wt = v("<button part=\"load-more\" type=\"button\" class=\"svelte-1xcrvv6\"> </button>"), Gt = v("<!> <!> <!> <!> <!> <!>", 1), Kt = {
	hash: "svelte-1xcrvv6",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}[part='toolbar'].svelte-1xcrvv6 {display:flex;gap:8px;justify-content:space-between;margin-block-end:var(--agentflow-gap, 12px);}input[type='search'].svelte-1xcrvv6 {font:inherit;padding:6px 8px;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);}table.svelte-1xcrvv6 {width:100%;border-collapse:collapse;}th.svelte-1xcrvv6, td.svelte-1xcrvv6 {text-align:start;padding:8px;border-block-end:1px solid var(--agentflow-border, #eaecf0);}tr[part='row'].svelte-1xcrvv6 {cursor:pointer;}tr[part='row'].svelte-1xcrvv6:hover, tr[part='row'].svelte-1xcrvv6:focus {background:color-mix(in srgb, var(--agentflow-accent, #1570ef) 8%, transparent);}.muted.svelte-1xcrvv6 {color:var(--agentflow-muted, #667085);}.error.svelte-1xcrvv6 {color:var(--agentflow-danger, #b42318);}[part='actions'].svelte-1xcrvv6 {display:flex;gap:8px;}button.svelte-1xcrvv6 {font:inherit;padding:6px 14px;cursor:pointer;border-radius:var(--agentflow-radius, 6px);border:1px solid var(--agentflow-accent, #1570ef);background:var(--agentflow-accent, #1570ef);color:var(--agentflow-accent-text, #fff);}button.secondary.svelte-1xcrvv6, [part='load-more'].svelte-1xcrvv6 {background:transparent;color:var(--agentflow-accent, #1570ef);}button.svelte-1xcrvv6:disabled {opacity:0.5;cursor:default;}"
};
function qt(e, r) {
	u(r, !0), a(e, Kt);
	let o = y(r, "entityId", 7), c = y(r, "entityKey", 7), d = y(r, "columns", 7), v = y(r, "pageSize", 7), w = y(r, "filter", 7), E = r.$$host, O = At(E), A = n(() => O.current?.state === "ready"), M = x(null), P = n(() => o() || b(M)), I = n(() => We(w(), "filter")), R = n(() => b(I) ? JSON.stringify(b(I)) : ""), z = n(() => Ge(v())), H = x(null), U = x(T([])), W = x(null), K = x(""), ne = x(!1), re = x(!1), J = x(null), Y = x(null), ie = x(!1), ae = x(!1), oe = x(T({})), se = x(T({})), ce = n(() => Ot(b(Y) ?? [])), le = n(() => {
		if (!b(H)) return [];
		let e = d()?.split(",").map((e) => e.trim()).filter(Boolean);
		return e?.length ? e.map((e) => b(H).fields.find((t) => t.key === e)).filter((e) => !!e) : b(H).fields.filter((e) => !e.system).slice(0, 5);
	}), ue = (e, t) => E.dispatchEvent(new CustomEvent(e, {
		detail: t,
		bubbles: !0,
		composed: !0
	})), de = 0, X = 0;
	async function fe(e) {
		let t = O.current;
		if (!t) return;
		let n = de, r;
		try {
			r = await q(t.client.GET("/entities/{entity_id}", { params: { path: { entity_id: e } } }));
		} catch (e) {
			let r = t.report(e);
			n === de && V(J, r, !0);
			return;
		}
		if (n === de && (V(H, r, !0), r.effective_capabilities?.write)) try {
			let r = await q(t.client.GET("/entities/{entity_id}/create-form", { params: { path: { entity_id: e } } }));
			n === de && V(Y, bt(r.schema_json, r.ui_schema_json), !0);
		} catch (e) {
			let r = e?.status;
			if (r === 403 || r === 404) return;
			let i = t.report(e);
			n === de && V(J, i, !0);
		}
	}
	async function pe(e) {
		let t = O.current, n = b(P);
		if (!t || !n || !b(H)) return;
		let r = ++X;
		V(re, !0), V(J, null), e || V(W, null);
		try {
			let i = { entity_id: n }, a = b(I) ? await q(t.client.POST("/entities/{entity_id}/records/query", {
				params: { path: i },
				body: {
					filter: b(I),
					limit: b(z),
					cursor: e
				}
			})) : await q(t.client.GET("/entities/{entity_id}/records", { params: {
				path: i,
				query: {
					limit: b(z),
					cursor: e,
					q: b(K) || void 0
				}
			} }));
			if (r !== X) return;
			V(U, e ? [...b(U), ...a.items] : a.items, !0), V(W, a.next_cursor, !0), V(ne, !0);
		} catch (n) {
			let i = t.report(n);
			r === X && (V(J, i, !0), e || V(U, [], !0));
		} finally {
			r === X && V(re, !1);
		}
	}
	function me() {
		V(oe, wt(b(Y) ?? [], {}), !0), V(se, {}, !0), V(ie, !0);
	}
	async function he() {
		let e = O.current, t = b(P);
		if (!e || !t || !b(Y) || b(ae) || b(ce).length > 0) return;
		let n = Dt(b(Y), b(oe));
		if (n.length > 0) {
			V(se, Object.fromEntries(n.map((t) => [t, e.t("form.required")])), !0);
			return;
		}
		let r = de;
		V(ae, !0), V(J, null), V(se, {}, !0);
		let i;
		try {
			i = await q(e.client.POST("/entities/{entity_id}/records", {
				params: { path: { entity_id: t } },
				body: { form_payload: Et(b(Y), b(oe)) }
			}));
		} catch (t) {
			let n = e.report(t);
			if (r !== de) return;
			V(ae, !1), V(se, kt(n?.fieldErrors), !0), V(J, n, !0);
			return;
		}
		ue("record-created", { recordId: i.id }), r === de && (V(ae, !1), V(ie, !1), await pe());
	}
	B(() => {
		o(), c(), V(M, null);
	}), B(() => {
		b(P), c(), de++, X++, V(H, null), V(Y, null), V(K, ""), V(ie, !1), V(ae, !1), V(U, [], !0), V(W, null), V(ne, !1), V(re, !1), V(J, null);
	}), B(() => {
		if (!b(A) || o() || !c()) return;
		let e = c();
		L(async () => {
			let t = O.current;
			if (!t) return;
			let n = de;
			try {
				let r = await dt(t.client, "entity", e);
				n === de && V(M, r, !0);
			} catch (e) {
				let r = t.report(e);
				n === de && V(J, r, !0);
			}
		});
	}), B(() => {
		if (!b(A) || !b(P)) return;
		let e = b(P);
		L(() => fe(e));
	}), B(() => {
		b(A) && b(H) && (b(R), b(z), L(() => pe()));
	});
	var ge = {
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
	}, Z = g(), _e = F(Z), ve = (e) => {
		let r = n(() => O.current.t);
		var i = Gt(), a = F(i), o = (e) => {
			var t = Nt(), n = C(t), i = (e) => {
				var t = jt(), n = C(t);
				te(n), l(t), k((e, t) => {
					m(n, "placeholder", e), m(n, "aria-label", t);
				}, [() => b(r)("records.search"), () => b(r)("records.search")]), ee("submit", t, (e) => {
					e.preventDefault(), pe();
				}), f(n, () => b(K), (e) => V(K, e)), _(e, t);
			};
			h(n, (e) => {
				b(I) || e(i);
			});
			var a = D(n, 2), o = (e) => {
				var t = Mt(), n = j(t, !0);
				k((e) => s(n, e), [() => b(r)("records.create")]), N("click", t, me), _(e, t);
			};
			h(a, (e) => {
				b(Y) && !b(ie) && e(o);
			}), l(t), _(e, t);
		};
		h(a, (e) => {
			b(H) && e(o);
		});
		var c = D(a, 2), u = (e) => {
			var t = Ft(), n = C(t);
			lt(n, {
				get fields() {
					return b(Y);
				},
				get errors() {
					return b(se);
				},
				get disabled() {
					return b(ae);
				},
				get t() {
					return b(r);
				},
				get values() {
					return b(oe);
				},
				set values(e) {
					V(oe, e, !0);
				}
			});
			var i = D(n, 2), a = (e) => {
				var t = Pt(), n = j(t, !0);
				k((e) => s(n, e), [() => b(r)("form.unsupported_required")]), _(e, t);
			};
			h(i, (e) => {
				b(ce).length > 0 && e(a);
			});
			var o = D(i, 2), c = C(o), u = j(c, !0), d = D(c, 2), f = j(d, !0);
			l(o), l(t), k((e, t) => {
				s(u, e), d.disabled = b(ae) || b(ce).length > 0, s(f, t);
			}, [() => b(r)("common.cancel"), () => b(r)("records.save")]), ee("submit", t, (e) => e.preventDefault()), N("click", c, () => V(ie, !1)), N("click", d, he), _(e, t);
		};
		h(c, (e) => {
			b(ie) && b(Y) && e(u);
		});
		var d = D(c, 2), p = (e) => {
			var t = Lt(), n = C(t), i = (e) => {
				var t = S();
				k(() => s(t, b(J).detail)), _(e, t);
			}, a = (e) => {
				var t = S();
				k((e) => s(t, e), [() => b(r)("common.error", { code: b(J).code })]), _(e, t);
			};
			h(n, (e) => {
				b(J).code === "APP_KEY_MISSING" ? e(i) : e(a, -1);
			});
			var o = D(n, 2), c = (e) => {
				var t = It(), n = D(F(t), 1, !0);
				k((e) => s(n, e), [() => b(r)("common.request_id", { id: b(J).requestId })]), _(e, t);
			};
			h(o, (e) => {
				b(J).requestId && e(c);
			}), l(t), _(e, t);
		};
		h(d, (e) => {
			b(J) && e(p);
		});
		var g = D(d, 2), v = (e) => {
			var t = Rt(), n = j(t, !0);
			k((e) => s(n, e), [() => b(r)("records.empty")]), _(e, t);
		}, y = (e) => {
			var n = Ht(), i = C(n), a = C(i);
			t(a, 21, () => b(le), (e) => e.key, (e, t) => {
				var n = zt(), r = j(n, !0);
				k(() => s(r, b(t).label)), _(e, n);
			}), l(a), l(i);
			var o = D(i);
			t(o, 21, () => b(U), (e) => e.id, (e, n) => {
				var i = Vt();
				t(i, 21, () => b(le), (e) => e.key, (e, t) => {
					var i = Bt(), a = j(i, !0);
					k((e) => s(a, e), [() => G(b(n).body[b(t).key], O.current.locale, b(r))]), _(e, i);
				}), l(i), N("click", i, () => ue("record-select", { recordId: b(n).id })), N("keydown", i, (e) => e.key === "Enter" && ue("record-select", { recordId: b(n).id })), _(e, i);
			}), l(o), l(n), _(e, n);
		};
		h(g, (e) => {
			b(ne) && !b(re) && b(U).length === 0 && !b(J) ? e(v) : b(U).length > 0 && e(y, 1);
		});
		var x = D(g, 2), w = (e) => {
			var t = Ut(), n = j(t, !0);
			k((e) => s(n, e), [() => b(r)("common.loading")]), _(e, t);
		};
		h(x, (e) => {
			b(re) && e(w);
		});
		var T = D(x, 2), E = (e) => {
			var t = Wt(), n = j(t, !0);
			k((e) => s(n, e), [() => b(r)("common.load_more")]), N("click", t, () => pe(b(W) ?? void 0)), _(e, t);
		};
		h(T, (e) => {
			b(W) && !b(re) && e(E);
		}), _(e, i);
	};
	return h(_e, (e) => {
		O.current && b(A) && e(ve);
	}), _(e, Z), i(ge);
}
z(["click", "keydown"]), w(qt, {
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
var Jt = /* @__PURE__ */ new WeakSet();
function Yt(e, t, n, r, i) {
	let a = t[n];
	I(a, r) && !Jt.has(t) && (Jt.add(t), console.warn(`An older copy of the AgentFlow ${i} registered ${e} first; this page uses it, not this copy.`, {
		tag: e,
		registered: a ?? null,
		loaded: r
	}));
}
function Xt(e, t, n, r, i) {
	for (let [a, o] of Object.entries(t)) {
		let t = e.get(a);
		t ? t !== o.element && Yt(a, t, n, r, i) : e.define(a, o.element);
	}
}
//#endregion
//#region src/folder-source.ts
var Zt = "af-folder-source";
async function Qt(e = customElements) {
	let t = e.get(Zt);
	if (t) return Yt(Zt, t, "kitVersion", R, "UI kit");
	let n = (await import("./chunks/FolderSource-CnEsHnTl.js").then((e) => e.n)).default;
	Object.defineProperty(n.element, "kitVersion", { value: R }), Xt(e, { [Zt]: n }, "kitVersion", R, "UI kit");
}
//#endregion
//#region src/elements/StartForm.svelte
var $t = v("<br/> ", 1), en = v("<p part=\"error\" class=\"error svelte-1o3y7sj\" role=\"alert\"><!> <!></p>"), tn = v("<p part=\"error\" class=\"error svelte-1o3y7sj\" role=\"alert\"> </p>"), nn = v("<option> </option>"), rn = v("<label part=\"picker\" class=\"svelte-1o3y7sj\"> <select class=\"svelte-1o3y7sj\"><option>—</option><!></select></label>"), an = v("<p class=\"muted svelte-1o3y7sj\"> </p>"), on = v("<p part=\"notice\" class=\"muted svelte-1o3y7sj\" role=\"status\"> </p>"), sn = v("<p part=\"notice\"><!></p>"), cn = v("<p part=\"notice\" class=\"error svelte-1o3y7sj\" role=\"alert\"> </p>"), ln = v("<p class=\"run svelte-1o3y7sj\"> </p>"), un = v("<p part=\"notice\" class=\"error svelte-1o3y7sj\"> </p>"), dn = v("<form part=\"form\"><!> <!> <!> <div part=\"actions\"><button part=\"button\" type=\"button\" class=\"svelte-1o3y7sj\"> </button></div></form>"), fn = v("<!> <!> <!> <!> <!> <!> <!>", 1), pn = {
	hash: "svelte-1o3y7sj",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}[part='picker'].svelte-1o3y7sj {display:grid;gap:4px;margin-block-end:var(--agentflow-gap, 12px);font-weight:600;}select.svelte-1o3y7sj {font:inherit;padding:6px 8px;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);}.run.svelte-1o3y7sj {margin-block:0 var(--agentflow-gap, 12px);font-weight:600;}.muted.svelte-1o3y7sj {color:var(--agentflow-muted, #667085);}.error.svelte-1o3y7sj {color:var(--agentflow-danger, #b42318);}button.svelte-1o3y7sj {font:inherit;padding:6px 14px;cursor:pointer;border-radius:var(--agentflow-radius, 6px);border:1px solid var(--agentflow-accent, #1570ef);background:var(--agentflow-accent, #1570ef);color:var(--agentflow-accent-text, #fff);}button.svelte-1o3y7sj:disabled {opacity:0.5;cursor:default;}"
};
function mn(r, o) {
	u(o, !0), a(r, pn);
	let d = y(o, "workflowId", 7), f = y(o, "workflowKey", 7), v = y(o, "entity", 7), w = y(o, "record", 7), E = y(o, "action", 7), A = y(o, "subjectEntity", 7), M = y(o, "subjectRecord", 7), I = y(o, "resumeSets", 7), R = "__name", z = 2e3, te = /* @__PURE__ */ new Set([
		"failed",
		"rolled_back",
		"blocked"
	]), H = {
		completed: "start.completed",
		failed: "start.failed",
		rolled_back: "start.rolled_back",
		paused: "start.paused",
		blocked: "start.blocked",
		started: "start.started"
	};
	function W(e) {
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
	let G = o.$$host, K = At(G), ne = n(() => K.current?.state === "ready"), re = x(null), J = n(() => d() || b(re)), Y = n(() => !!v() || !!w() || !!E()), ie = n(() => !!d() || !!f() || b(Y)), ae = x(null), oe = x(null), se = n(() => b(ae) ?? b(oe)), ce = x(T([])), le = x(""), ue = x(!1), pe = x(null), me = x(null), he = x(!1), ge = x(T([])), Z = x(T({})), _e = x(T({})), ve = x(null), ye = x(!1), be = x(null), xe = x(!1), Q = x(!1), Ce = x(0), we = x(T({})), Te = x(T({})), Ee = x([]);
	B(() => {
		I(), V(Ee, []);
	});
	let De = null, Oe = (e) => (De?.client === e ? De : De = {
		client: e,
		sources: Se(e)
	}).sources, ke = n(() => {
		let e = K.current;
		if (!e || !b(pe) || !b(ge).some((e) => e.kind === "folder")) return null;
		let t = We(I(), "resumeSets"), n = t && Object.fromEntries(Object.entries(t).filter(([, e]) => !b(Ee).includes(e)));
		return {
			sources: Oe(e.client),
			workflow: b(pe).id,
			locale: e.locale,
			round: b(Ce),
			resumeSets: n,
			uploadStarted: Xe
		};
	}), Ae = x(customElements.get(Zt) !== void 0), je = x(!1), Me = x(0), Ne = x(!1), Pe = n(() => b(ke) !== null);
	B(() => {
		if (b(Me), !b(Pe)) return;
		V(je, !1);
		let e = !0;
		return Qt().then(async () => {
			if (!e) return;
			let t = o.$$host.shadowRoot?.activeElement, n = t?.matches("[part=\"field-retry\"]") ? t.getAttribute("data-field") : null;
			V(Ae, !0), V(Ne, !1), n !== null && (await P(), Fe(`f-${n}`, () => e));
		}, (t) => {
			e && (V(je, !0), V(Ne, !1), K.current?.report(t));
		}), () => {
			e = !1;
		};
	});
	let Fe = async (e, t) => {
		let n = o.$$host.shadowRoot;
		for (let r = 0; r < 30 && t(); r++) {
			if (n?.activeElement || document.activeElement && document.activeElement !== document.body && document.activeElement !== o.$$host) return;
			let t = n?.getElementById(e)?.shadowRoot?.querySelector("input[type=\"radio\"]:checked:not([disabled]), button:not([disabled]):not([aria-disabled=\"true\"])");
			if (t) return t.focus();
			await new Promise((e) => requestAnimationFrame(e));
		}
	}, Ie = () => {
		b(Ne) || (V(Ne, !0), U(Me));
	}, Le = n(() => b(Pe) && !b(Ae) && !b(je)), Re = n(() => Ot(b(ge), b(Pe) && (b(je) || b(Ne)))), Be = n(() => Object.values(b(we)).some(Boolean) || Object.values(b(Te)).some(Boolean) || b(Le)), Ve = (e, t) => G.dispatchEvent(new CustomEvent(e, {
		detail: t,
		bubbles: !0,
		composed: !0
	})), $ = 0, He = null;
	function Ue() {
		let e = He;
		e && (He = null, clearTimeout(e.timer), e.announce("started"));
	}
	function Ge() {
		$++, Ue(), V(pe, null), V(me, null), V(he, !1), V(ge, [], !0), V(Z, {}, !0), V(we, {}, !0), V(Te, {}, !0), V(_e, {}, !0), V(ve, null), V(ye, !1), V(be, null), V(xe, !1), V(Q, !1);
	}
	async function Ke(e) {
		let t = K.current;
		if (!t) return;
		let n = $;
		V(Q, !0);
		let r = [];
		try {
			for await (let e of fe((e) => q(t.client.GET("/workflows/startable", { params: { query: e ? {
				limit: 100,
				cursor: e
			} : { limit: 100 } } })))) r.push(e);
		} catch (e) {
			let r = t.report(e);
			n === $ && (V(ve, r, !0), V(Q, !1));
			return;
		}
		if (n !== $ || (V(Q, !1), V(ce, r, !0), !e)) return;
		let i = r.find((t) => t.id === e);
		i ? await Ye(i) : V(ue, !0);
	}
	let qe = (e) => b(me) ? wt(b(ge), b(me).params) : {
		...wt(b(ge), {}),
		[R]: e.name
	};
	async function Je(e, t, n) {
		let r = K.current;
		if (!r) return;
		let i = $;
		V(Q, !0);
		try {
			let a = await dt(r.client, "entity", e), [o, s] = await Promise.all([q(r.client.GET("/entities/{entity_id}", { params: { path: { entity_id: a } } })), q(r.client.GET("/entities/{entity_id}/records/{record_id}", { params: { path: {
				entity_id: a,
				record_id: t
			} } }))]);
			if (i !== $) return;
			let c = o.actions.find((e) => e.key === n);
			if (!c) {
				V(Q, !1), V(he, !0);
				return;
			}
			let l = await q(r.client.GET("/workflows/{workflow_id}/input-contract", { params: { path: { workflow_id: c.workflow_id } } }));
			if (i !== $) return;
			if (!l.version_id) {
				V(Q, !1), V(ue, !0);
				return;
			}
			let u = de(c, s), d = new Set(X(l, u.contextKeys, u.defaultKeys)), f = l.params_slots.filter((e) => u.params[e.key] == null), p = xt(f);
			if (d.size > 0 && l.form_definition_id) {
				let e = await q(r.client.GET("/workflow-versions/{version_id}/start-form", { params: { path: { version_id: l.version_id } } }));
				if (i !== $) return;
				p = bt(e.form_definition?.schema_json, e.form_definition?.ui_schema_json, f);
			}
			let m = p.filter((e) => d.has(e.key)), h = o.browser_config?.display_field, g = h ? s.body[h] : void 0, _ = typeof g == "string" && g.trim() || typeof g == "number" ? String(g) : s.id;
			V(Q, !1), V(ge, m, !0), V(me, {
				subject: u.subject,
				params: u.params,
				context: {
					entity_id: a,
					action_id: c.id,
					record_id: s.id
				},
				sync: c.mode === "sync"
			}, !0), V(Z, wt(m, u.params), !0), V(pe, {
				id: c.workflow_id,
				name: `${c.label} · ${_}`,
				version_id: l.version_id
			}, !0);
		} catch (e) {
			let t = r.report(e);
			if (i !== $) return;
			V(ve, t, !0), V(Q, !1);
		}
	}
	async function Ye(e) {
		let t = K.current;
		if (!t || (Ge(), !e)) return;
		let n = $;
		V(Q, !0);
		let r, i = [];
		try {
			r = await q(t.client.GET("/workflow-versions/{version_id}/start-form", { params: { path: { version_id: e.version_id } } })), n === $ && (!r.form_definition || _t(r.form_definition.schema_json)) && (i = (await q(t.client.GET("/workflows/{workflow_id}/input-contract", { params: { path: { workflow_id: e.id } } }))).params_slots);
		} catch (e) {
			let r = t.report(e);
			n === $ && (V(ve, r, !0), V(Q, !1));
			return;
		}
		if (n !== $) return;
		V(Q, !1);
		let a = {
			key: R,
			label: t.t("start.name"),
			kind: "text",
			required: !0
		}, o = r.form_definition;
		V(ge, [a, ...o ? bt(o.schema_json, o.ui_schema_json, i) : xt(i)], !0), V(Z, qe(e), !0), V(pe, e, !0);
	}
	let Xe = (e, t) => Ve("af-folder-upload-started", {
		setId: t,
		field: e
	});
	function Ze(e) {
		V(le, e, !0), Ye(b(ce).find((t) => t.id === e) ?? null);
	}
	async function Qe() {
		let e = K.current, t = b(pe);
		if (!e || !t || b(ye) || b(Be) || b(Re).length > 0) return;
		V(be, null);
		let n = b(me), r = n ? t.name : String(b(Z)[R] ?? "").trim(), i = Dt(b(ge), n ? b(Z) : {
			...b(Z),
			[R]: r
		});
		if (i.length > 0) {
			V(_e, Object.fromEntries(i.map((t) => [t, e.t("form.required")])), !0);
			return;
		}
		let a = $;
		V(ye, !0), V(ve, null), V(_e, {}, !0);
		let o;
		try {
			o = await q(e.client.POST("/workflows/{workflow_id}/instances", {
				params: { path: { workflow_id: t.id } },
				body: n ? {
					name: r,
					subject: n.subject,
					params: {
						...Object.fromEntries(Object.entries(n.params).filter(([e]) => !b(ge).some((t) => t.key === e))),
						...Et(b(ge), b(Z))
					},
					version_id: t.version_id,
					action_context: n.context,
					...n.sync ? { wait_ms: 5e3 } : {}
				} : {
					name: r,
					version_id: t.version_id,
					input_payload: Et(b(ge).filter((e) => e.key !== R), b(Z)),
					...M() ? { subject: {
						kind: "record",
						record_id: M()
					} } : {}
				}
			}));
		} catch (t) {
			let n = e.report(t);
			if (a !== $) return;
			if (V(ye, !1), n?.code === "ACTION_NOT_VISIBLE") {
				V(pe, null), V(he, !0);
				return;
			}
			V(_e, kt(n?.fieldErrors), !0), V(ve, n, !0);
			return;
		}
		let s = (e) => Ve("workflow-started", {
			instanceId: o.id,
			workflowId: t.id,
			...e ? { outcome: e } : {}
		}), c = b(ge).flatMap((e) => e.kind === "folder" ? [b(Z)[e.key]?.$fileSet] : []).filter((e) => e !== void 0);
		c.length && V(Ee, [...b(Ee), ...c]);
		let l = n?.sync ? W(o) : { outcome: "started" };
		if (n?.sync ? (l || a !== $) && s(l?.outcome ?? "started") : s(), a !== $) return;
		let u = (e) => {
			V(ye, !1), V(xe, !1), V(Z, qe(t), !0), V(we, {}, !0), V(Te, {}, !0), U(Ce), V(be, e, !0);
		};
		if (l) return u(l);
		V(xe, !0);
		let d = {
			timer: void 0,
			announce: s
		};
		He = d;
		let f = 0, p = async () => {
			f += z;
			let t;
			try {
				t = W(await q(e.client.GET("/instances/{instance_id}", { params: { path: { instance_id: o.id } } })));
			} catch (n) {
				ze(n).type !== "other" && e.report(n), t = { outcome: "started" };
			}
			if (He === d) {
				if (t ??= f >= 3e4 ? { outcome: "started" } : null, !t) {
					d.timer = setTimeout(p, z);
					return;
				}
				He = null, s(t.outcome), u(t);
			}
		};
		d.timer = setTimeout(p, z);
	}
	B(() => () => {
		$++, Ue();
	}), B(() => {
		d(), f(), V(re, null), V(ae, null);
	}), B(() => {
		b(J), f(), v(), w(), E(), Ge(), V(ce, [], !0), V(le, ""), V(ue, !1);
	}), B(() => {
		if (!b(ne) || b(Y) || d() || !f()) return;
		let e = f();
		L(async () => {
			let t = K.current;
			if (!t) return;
			let n = $;
			try {
				let r = await dt(t.client, "workflow", e);
				n === $ && V(re, r, !0);
			} catch (e) {
				let r = t.report(e);
				n === $ && V(ae, r, !0);
			}
		});
	}), B(() => {
		if (!b(ne) || b(Y) || f() && !d() && !b(J)) return;
		let e = b(J);
		L(() => Ke(e));
	}), B(() => {
		if (!b(ne) || !v() || !w() || !E()) return;
		let [e, t, n] = [
			v(),
			w(),
			E()
		];
		L(() => Je(e, t, n));
	}), B(() => {
		if (V(oe, null), !b(ne) || b(Y) || !A()) return;
		let e = A();
		L(async () => {
			let t = K.current;
			if (t) try {
				await dt(t.client, "entity", e);
			} catch (n) {
				let r = t.report(n);
				A() === e && V(oe, r, !0);
			}
		});
	});
	var $e = {
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
			return I();
		},
		set resumeSets(e) {
			I(e), p();
		}
	}, et = g(), tt = F(et), nt = (r) => {
		let i = n(() => K.current.t);
		var a = g(), o = F(a), u = (e) => {
			var t = en(), n = C(t), r = (e) => {
				var t = S();
				k(() => s(t, b(se).detail)), _(e, t);
			}, a = (e) => {
				var t = S();
				k((e) => s(t, e), [() => b(i)("common.error", { code: b(se).code })]), _(e, t);
			};
			h(n, (e) => {
				b(se).code === "APP_KEY_MISSING" ? e(r) : e(a, -1);
			});
			var o = D(n, 2), c = (e) => {
				var t = $t(), n = D(F(t), 1, !0);
				k((e) => s(n, e), [() => b(i)("common.request_id", { id: b(se).requestId })]), _(e, t);
			};
			h(o, (e) => {
				b(se).requestId && e(c);
			}), l(t), _(e, t);
		}, d = (e) => {
			var t = tn(), n = j(t, !0);
			k((e) => s(n, e), [() => b(i)("start.not_startable")]), _(e, t);
		}, f = (r) => {
			var a = fn(), o = F(a), u = (n) => {
				var r = rn(), a = C(r), o = D(a), c = C(o);
				c.value = c.__value = "";
				var u = D(c);
				t(u, 17, () => b(ce), (e) => e.id, (e, t) => {
					var n = nn(), r = j(n, !0), i = {};
					k(() => {
						s(r, b(t).name), i !== (i = b(t).id) && (n.value = (n.__value = i) ?? "");
					}), _(e, n);
				}), l(o), e(o), l(r), k((e) => s(a, `${e ?? ""} `), [() => b(i)("start.choose")]), O(o, () => b(le), Ze), _(n, r);
			};
			h(o, (e) => {
				b(ie) || e(u);
			});
			var d = D(o, 2), f = (e) => {
				var t = an(), n = j(t, !0);
				k((e) => s(n, e), [() => b(i)("common.loading")]), _(e, t);
			};
			h(d, (e) => {
				b(Q) && e(f);
			});
			var p = D(d, 2), g = (e) => {
				var t = en(), n = C(t), r = (e) => {
					var t = S();
					k(() => s(t, b(ve).detail)), _(e, t);
				}, a = (e) => {
					var t = S();
					k((e) => s(t, e), [() => b(i)("common.error", { code: b(ve).code })]), _(e, t);
				};
				h(n, (e) => {
					b(ve).code === "APP_KEY_MISSING" ? e(r) : e(a, -1);
				});
				var o = D(n, 2), c = (e) => {
					var t = $t(), n = D(F(t), 1, !0);
					k((e) => s(n, e), [() => b(i)("common.request_id", { id: b(ve).requestId })]), _(e, t);
				};
				h(o, (e) => {
					b(ve).requestId && e(c);
				}), l(t), _(e, t);
			};
			h(p, (e) => {
				b(ve) && e(g);
			});
			var v = D(p, 2), y = (e) => {
				var t = on(), n = j(t, !0);
				k((e) => s(n, e), [() => b(i)("start.running")]), _(e, t);
			};
			h(v, (e) => {
				b(xe) && e(y);
			});
			var x = D(v, 2), w = (e) => {
				let t = n(() => te.has(b(be).outcome));
				var r = sn();
				let a;
				var o = C(r), u = (e) => {
					var t = S();
					k((e) => s(t, e), [() => b(i)(H.rolled_back, {
						step: b(be).step ?? "",
						message: b(be).detail ?? ""
					})]), _(e, t);
				}, d = (e) => {
					var t = S();
					k((e) => s(t, e), [() => b(be).detail || b(i)(H[b(be).outcome])]), _(e, t);
				};
				h(o, (e) => {
					b(be).outcome === "rolled_back" ? e(u) : e(d, -1);
				}), l(r), k(() => {
					m(r, "role", b(t) ? "alert" : "status"), a = c(r, 1, "svelte-1o3y7sj", null, a, { error: b(t) });
				}), _(e, r);
			};
			h(x, (e) => {
				b(be) && e(w);
			});
			var T = D(x, 2), E = (e) => {
				var t = cn(), n = j(t, !0);
				k((e) => s(n, e), [() => b(i)("start.action_unavailable")]), _(e, t);
			};
			h(T, (e) => {
				b(he) && e(E);
			});
			var A = D(T, 2), M = (e) => {
				var t = dn(), n = C(t), r = (e) => {
					var t = ln(), n = j(t, !0);
					k(() => s(n, b(pe).name)), _(e, t);
				};
				h(n, (e) => {
					b(me) && e(r);
				});
				var a = D(n, 2);
				lt(a, {
					get fields() {
						return b(ge);
					},
					get errors() {
						return b(_e);
					},
					get disabled() {
						return b(ye);
					},
					get t() {
						return b(i);
					},
					get folders() {
						return b(ke);
					},
					get foldersReady() {
						return b(Ae);
					},
					get foldersFailed() {
						return b(je);
					},
					get foldersRetrying() {
						return b(Ne);
					},
					onFolderRetry: Ie,
					get values() {
						return b(Z);
					},
					set values(e) {
						V(Z, e, !0);
					},
					get uploading() {
						return b(we);
					},
					set uploading(e) {
						V(we, e, !0);
					},
					get refusing() {
						return b(Te);
					},
					set refusing(e) {
						V(Te, e, !0);
					}
				});
				var o = D(a, 2), c = (e) => {
					var t = un(), n = j(t, !0);
					k((e) => s(n, e), [() => b(i)("form.unsupported_required")]), _(e, t);
				};
				h(o, (e) => {
					b(Re).length > 0 && e(c);
				});
				var u = D(o, 2), d = C(u), f = j(d, !0);
				l(u), l(t), k((e) => {
					d.disabled = b(ye) || b(Be) || b(Re).length > 0, s(f, e);
				}, [() => b(i)("start.submit")]), ee("submit", t, (e) => e.preventDefault()), N("click", d, Qe), _(e, t);
			};
			h(A, (e) => {
				b(pe) && e(M);
			}), _(r, a);
		};
		h(o, (e) => {
			b(se) ? e(u) : b(ue) ? e(d, 1) : e(f, -1);
		}), _(r, a);
	};
	return h(tt, (e) => {
		K.current && b(ne) && e(nt);
	}), _(r, et), i($e);
}
z(["click"]), w(mn, {
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
var hn = {
	hash: "svelte-je5mvm",
	code: ":host {display:contents;}"
};
function gn(e, t) {
	u(t, !0), a(e, hn);
	let r = y(t, "record", 7, void 0), o = y(t, "entity", 7, void 0), s = {
		loading: "loading",
		ready: "ready",
		not_found: "not-found",
		finished: "finished",
		error: "error"
	}, c = t.$$host, l = At(c), f = n(() => l.current !== null), m = n(() => l.current?.tasks ?? null), h = Pe(c, ke, null);
	function v(e) {
		c.getAttribute("state") !== e && c.setAttribute("state", e);
	}
	B(() => {
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
		return L(() => {
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
	}), B(() => () => h.dispose());
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
	}, S = g(), C = F(S);
	return d(C, t, "default", {}, null), _(e, S), i(x);
}
w(gn, {
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
var _n = v("<header part=\"header\"><h2 part=\"title\" class=\"svelte-xgtj81\"> </h2> <p part=\"meta\" class=\"muted svelte-xgtj81\"> </p></header>"), vn = v("<br/> ", 1), yn = v("<p part=\"error\" class=\"error svelte-xgtj81\" role=\"alert\"><!> <!> <!></p>"), bn = v("<p class=\"muted svelte-xgtj81\"> </p>"), xn = v("<p part=\"notice\"> </p>"), Sn = v("<button part=\"button\" type=\"button\" class=\"secondary svelte-xgtj81\"> </button>"), Cn = v("<button part=\"button\" type=\"button\" class=\"svelte-xgtj81\"> </button>"), wn = v("<div part=\"actions\" class=\"svelte-xgtj81\"><button part=\"button\" type=\"button\" class=\"svelte-xgtj81\"> </button></div>"), Tn = v("<!> <div part=\"actions\" class=\"svelte-xgtj81\"><!> <!></div>", 1), En = v("<p part=\"notice\"> </p> <div part=\"actions\" class=\"svelte-xgtj81\"><!></div>", 1), Dn = v("<p part=\"notice\" class=\"error svelte-xgtj81\"> </p>"), On = v("<form part=\"form\"><!> <!> <!> <!> <!> <div part=\"actions\" class=\"svelte-xgtj81\"><!> <!></div></form>"), kn = v("<!> <!> <!> <!>", 1), An = {
	hash: "svelte-xgtj81",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}h2.svelte-xgtj81 {margin:0 0 4px;font-size:1.25em;}.muted.svelte-xgtj81 {color:var(--agentflow-muted, #667085);margin:0 0 var(--agentflow-gap, 12px);}.error.svelte-xgtj81 {color:var(--agentflow-danger, #b42318);}[part='actions'].svelte-xgtj81 {display:flex;gap:8px;flex-wrap:wrap;}button.svelte-xgtj81 {font:inherit;padding:6px 14px;cursor:pointer;border-radius:var(--agentflow-radius, 6px);border:1px solid var(--agentflow-accent, #1570ef);background:var(--agentflow-accent, #1570ef);color:var(--agentflow-accent-text, #fff);}button.secondary.svelte-xgtj81 {background:transparent;color:var(--agentflow-accent, #1570ef);}button.svelte-xgtj81:disabled {opacity:0.5;cursor:default;}"
};
function jn(e, r) {
	u(r, !0), a(e, An);
	let o = y(r, "entityId", 7), c = y(r, "entityKey", 7), d = y(r, "recordId", 7), f = {
		id: null,
		name: null,
		title: null
	}, m = r.$$host, v = At(m), w = n(() => v.current?.state === "ready"), E = x(null), O = x(null), A = 0, M = n(() => o() || b(E)), P = x(null), I = x(T(f)), R = x(!1), z = x(T([])), te = x(T({})), H = x(T({})), U = x(null), W = n(() => b(U) ?? b(O)), G = x(!1), K = x(!1), ne = x(!1), re = n(() => !!v.current?.signing && !b(ne)), J = n(() => !!b(I).id && b(I).id === v.current?.caller?.id), Y = n(() => !!b(P) && b(P).step_status !== "open"), ie = n(() => !!b(P) && b(P).step_status === "open" && b(P).signed), ae = n(() => Ot(b(z))), oe = n(() => b(P)?.actions.find((e) => e.id === b(P)?.signed_action_id)), se = n(() => b(P)?.actions.filter((e) => e.id !== b(oe)?.id) ?? []), ce = n(() => !!b(oe) && b(re)), le = n(() => {
		let e = b(P)?.entity_view;
		return e?.mode !== "selectable" || e.view?.type !== "grid" && e.view?.type !== "kanban" ? !1 : (e.min_selection ?? 1) > 0;
	}), ue = (e, t) => m.dispatchEvent(new CustomEvent(e, {
		detail: t,
		bubbles: !0,
		composed: !0
	}));
	function de(e) {
		V(P, e, !0), V(z, bt(e.form_definition?.schema_json, e.form_definition?.ui_schema_json), !0), V(te, wt(b(z), e.draft_payload ?? e.prefill ?? {}), !0), V(H, {}, !0);
	}
	let X = 0;
	async function fe(e, t) {
		let n = v.current;
		if (!n || !e || !t) return;
		let r = X;
		V(K, !0), V(ne, !1);
		try {
			let i = {
				entity_id: e,
				record_id: t
			}, [a, o] = await Promise.all([n.client.GET("/entities/{entity_id}/records/{record_id}/step", { params: { path: i } }), n.client.GET("/entities/{entity_id}/records/{record_id}", { params: { path: i } })]);
			if (a.response.status === 404) {
				r === X && (V(P, null), V(I, f, !0)), await q(Promise.resolve(o)), r === X && V(R, !0);
				return;
			}
			let s = await q(Promise.resolve(a)), c = await q(Promise.resolve(o));
			if (r !== X) return;
			V(R, !1);
			let l = typeof c.body.claimed_by == "string" ? c.body.claimed_by : null;
			V(I, {
				id: l,
				name: l ? c.ref_labels?.claimed_by ?? null : null,
				title: typeof c.body.title == "string" ? c.body.title : null
			}, !0), de(s);
		} catch (e) {
			let t = n.report(e);
			r === X && V(U, t, !0);
		} finally {
			r === X && V(K, !1);
		}
	}
	async function pe(e) {
		let t = v.current;
		if (!t || !b(P)) return;
		let n = b(M), r = d();
		if (!n) return;
		let i = X;
		V(G, !0), V(U, null);
		try {
			let a = e === "claim" ? "/entities/{entity_id}/records/{record_id}/work/claim" : "/entities/{entity_id}/records/{record_id}/work/release";
			await q(t.client.POST(a, { params: { path: {
				entity_id: n,
				record_id: r
			} } })), i === X && await fe(n, r), ue(e === "claim" ? "task-claimed" : "task-released", {
				recordId: r,
				entityId: n
			});
		} catch (e) {
			let a = t.report(e);
			if (i !== X) return;
			V(U, a, !0), a && await fe(n, r);
		} finally {
			i === X && V(G, !1);
		}
	}
	async function me() {
		let e = v.current;
		if (!e?.signing || !b(P)) return;
		let t = b(M), n = d();
		if (!t) return;
		let r = X;
		V(G, !0), V(U, null);
		try {
			let i = await e.signing.sign({
				entity: t,
				record: n
			});
			r === X && (await fe(t, n), i === "nothing_to_sign" && V(ne, !0), i === "closed" && r === X && !b(U) && (b(R) || b(Y) || !b(J)) && ue("agentflow-task-changed", {
				recordId: n,
				entityId: t
			})), (i === "signed" || i === "declined") && ue(i === "signed" ? "agentflow-signed" : "agentflow-declined", {
				recordId: n,
				entityId: t
			});
		} catch (i) {
			let a = e.report(i);
			if (r !== X) return;
			V(U, a, !0), a && await fe(t, n);
		} finally {
			r === X && V(G, !1);
		}
	}
	async function he(e) {
		let t = v.current;
		if (!t || !b(P)) return;
		let n = Dt(b(z), b(te));
		if (n.length > 0) {
			V(H, Object.fromEntries(n.map((e) => [e, t.t("form.required")])), !0);
			return;
		}
		let r = b(M), i = d();
		if (!r) return;
		let a = X;
		V(G, !0), V(U, null), V(H, {}, !0);
		try {
			let n = Et(b(z), b(te));
			e && (n._action = e);
			let o = await q(t.client.POST("/entities/{entity_id}/records/{record_id}/step/submit", {
				params: { path: {
					entity_id: r,
					record_id: i
				} },
				body: { payload: n }
			}));
			a === X && de(o), ue("task-submitted", {
				recordId: i,
				entityId: r,
				actionId: e
			});
		} catch (e) {
			let n = t.report(e);
			if (a !== X) return;
			V(H, kt(n?.fieldErrors), !0), V(U, n, !0);
		} finally {
			a === X && V(G, !1);
		}
	}
	B(() => {
		o(), c(), A++, V(E, null), V(O, null);
	}), B(() => {
		b(M), c(), d(), X++, V(P, null), V(R, !1), V(I, f, !0), V(U, null), V(H, {}, !0), V(G, !1), V(K, !1);
	}), B(() => {
		if (!b(w) || o() || !c()) return;
		let e = c();
		L(async () => {
			let t = v.current;
			if (!t) return;
			let n = A;
			try {
				let r = await dt(t.client, "entity", e);
				n === A && V(E, r, !0);
			} catch (e) {
				let r = t.report(e);
				n === A && V(O, r, !0);
			}
		});
	}), B(() => {
		if (!b(w) || !b(M)) return;
		let e = b(M), t = d();
		L(() => fe(e, t));
	});
	var ge = {
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
	}, Z = g(), _e = F(Z), ve = (e) => {
		let r = n(() => v.current.t);
		var i = kn(), a = F(i), o = (e) => {
			var t = _n(), n = C(t), r = j(n, !0), i = D(n, 2), a = j(i, !0);
			l(t), k((e) => {
				s(r, b(I).title ?? b(P).run.step_label), s(a, e);
			}, [() => [b(P).run.workflow_name, b(P).instance_name].filter(Boolean).join(" · ")]), _(e, t);
		};
		h(a, (e) => {
			b(P) && !b(R) && e(o);
		});
		var c = D(a, 2), u = (e) => {
			var t = yn(), n = C(t), i = (e) => {
				var t = S();
				k(() => s(t, b(W).detail)), _(e, t);
			}, a = (e) => {
				var t = S();
				k((e) => s(t, e), [() => b(r)("common.error", { code: b(W).code })]), _(e, t);
			};
			h(n, (e) => {
				b(W).code === "APP_KEY_MISSING" ? e(i) : e(a, -1);
			});
			var o = D(n, 2), c = (e) => {
				var t = vn(), n = D(F(t), 1, !0);
				k(() => s(n, b(W).detail)), _(e, t);
			};
			h(o, (e) => {
				b(W).status === 422 && !b(W).fieldErrors?.length && b(W).detail && e(c);
			});
			var u = D(o, 2), d = (e) => {
				var t = vn(), n = D(F(t), 1, !0);
				k((e) => s(n, e), [() => b(r)("common.request_id", { id: b(W).requestId })]), _(e, t);
			};
			h(u, (e) => {
				b(W).requestId && e(d);
			}), l(t), _(e, t);
		};
		h(c, (e) => {
			b(W) && e(u);
		});
		var d = D(c, 2), f = (e) => {
			var t = bn(), n = j(t, !0);
			k((e) => s(n, e), [() => b(r)("common.loading")]), _(e, t);
		};
		h(d, (e) => {
			b(K) && e(f);
		});
		var p = D(d, 2), m = (e) => {
			var t = xn(), n = j(t, !0);
			k((e) => s(n, e), [() => b(r)("task.withheld")]), _(e, t);
		}, y = (e) => {
			let i = (e) => {
				var t = Sn(), n = j(t, !0);
				k((e) => {
					t.disabled = b(G), s(n, e);
				}, [() => b(r)("task.release")]), N("click", t, () => pe("release")), _(e, t);
			}, a = (e) => {
				var t = Cn(), n = j(t, !0);
				k((e) => {
					t.disabled = b(G), s(n, e);
				}, [() => b(r)("task.sign")]), N("click", t, me), _(e, t);
			};
			var o = g(), c = F(o), u = (e) => {
				var t = xn(), n = j(t, !0);
				k((e) => s(n, e), [() => b(P).step_status === "cancelled" ? b(r)("task.cancelled") : b(r)("task.done")]), _(e, t);
			}, d = (e) => {
				var t = xn(), n = j(t, !0);
				k((e) => s(n, e), [() => b(r)("task.signed_waiting")]), _(e, t);
			}, f = (e) => {
				var t = wn(), n = C(t), i = j(n, !0);
				l(t), k((e) => {
					n.disabled = b(G), s(i, e);
				}, [() => b(r)("task.claim")]), N("click", n, () => pe("claim")), _(e, t);
			}, p = (e) => {
				var t = Tn(), n = F(t), o = (e) => {
					var t = xn(), n = j(t, !0);
					k((e) => s(n, e), [() => b(r)("task.sign_elsewhere")]), _(e, t);
				};
				h(n, (e) => {
					b(re) || e(o);
				});
				var c = D(n, 2), u = C(c);
				i(u);
				var d = D(u, 2), f = (e) => {
					a(e);
				};
				h(d, (e) => {
					b(re) && e(f);
				}), l(c), _(e, t);
			}, m = (e) => {
				var t = En(), n = F(t), a = j(n, !0), o = D(n, 2), c = C(o);
				i(c), l(o), k((e) => s(a, e), [() => b(r)("task.select_elsewhere")]), _(e, t);
			}, v = (e) => {
				var o = On(), c = C(o);
				{
					let e = n(() => b(G) || b(ce));
					lt(c, {
						get fields() {
							return b(z);
						},
						get errors() {
							return b(H);
						},
						get disabled() {
							return b(e);
						},
						get t() {
							return b(r);
						},
						get values() {
							return b(te);
						},
						set values(e) {
							V(te, e, !0);
						}
					});
				}
				var u = D(c, 2), d = (e) => {
					var t = Dn(), n = j(t, !0);
					k((e) => s(n, e), [() => b(r)("form.unsupported_required")]), _(e, t);
				};
				h(u, (e) => {
					b(ae).length > 0 && !b(ce) && e(d);
				});
				var f = D(u, 2), p = (e) => {
					var t = xn(), n = j(t, !0);
					k((e) => s(n, e), [() => b(r)("task.no_actions")]), _(e, t);
				};
				h(f, (e) => {
					b(P).actions_gated_out && e(p);
				});
				var m = D(f, 2), v = (e) => {
					var t = xn(), n = j(t, !0);
					k((e) => s(n, e), [() => b(r)("task.sign_elsewhere")]), _(e, t);
				};
				h(m, (e) => {
					b(oe) && !b(re) && e(v);
				});
				var y = D(m, 2), x = (e) => {
					var t = xn(), n = j(t, !0);
					k((e) => s(n, e), [() => b(r)("task.sign_in_dialog")]), _(e, t);
				};
				h(y, (e) => {
					b(ce) && e(x);
				});
				var S = D(y, 2), w = C(S);
				i(w);
				var T = D(w, 2), E = (e) => {
					a(e);
				}, O = (e) => {
					var n = g(), r = F(n);
					t(r, 17, () => b(se), (e) => e.id, (e, t) => {
						var n = Cn(), r = j(n, !0);
						k(() => {
							n.disabled = b(G) || b(ae).length > 0, s(r, b(t).label);
						}), N("click", n, () => he(b(t).id)), _(e, n);
					}), _(e, n);
				}, A = (e) => {
					var t = Cn(), n = j(t, !0);
					k((e) => {
						t.disabled = b(G) || b(ae).length > 0, s(n, e);
					}, [() => b(r)("task.submit")]), N("click", t, () => he(null)), _(e, t);
				};
				h(T, (e) => {
					b(ce) ? e(E) : b(P).actions.length > 0 ? e(O, 1) : b(P).actions_gated_out || e(A, 2);
				}), l(S), l(o), ee("submit", o, (e) => e.preventDefault()), _(e, o);
			}, y = (e) => {
				var t = xn(), n = j(t, !0);
				k((e) => s(n, e), [() => b(I).name ? b(r)("task.claimed_by", { name: b(I).name }) : b(r)("task.claimed_by_someone")]), _(e, t);
			};
			h(c, (e) => {
				b(Y) ? e(u) : b(ie) ? e(d, 1) : b(I).id ? b(J) && (b(P).kind === "signature" || b(P).signs && !b(oe)) ? e(p, 3) : b(J) && b(le) ? e(m, 4) : b(J) ? e(v, 5) : e(y, -1) : e(f, 2);
			}), _(e, o);
		};
		h(p, (e) => {
			b(R) ? e(m) : b(P) && e(y, 1);
		}), _(e, i);
	};
	return h(_e, (e) => {
		v.current && b(w) && e(ve);
	}), _(e, Z), i(ge);
}
z(["click"]), w(jn, {
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
var Mn = v("<br/> ", 1), Nn = v("<p part=\"error\" class=\"error svelte-j92hy\" role=\"alert\"> <!></p>"), Pn = v("<p part=\"empty\" class=\"muted svelte-j92hy\"> </p>"), Fn = v("<tr part=\"row\" tabindex=\"0\" class=\"svelte-j92hy\"><td class=\"svelte-j92hy\"> </td><td class=\"svelte-j92hy\"> </td><td class=\"svelte-j92hy\"> </td><td class=\"svelte-j92hy\"> </td></tr>"), In = v("<table part=\"table\" class=\"svelte-j92hy\"><thead><tr><th class=\"svelte-j92hy\"> </th><th class=\"svelte-j92hy\"> </th><th class=\"svelte-j92hy\"> </th><th class=\"svelte-j92hy\"> </th></tr></thead><tbody></tbody></table>"), Ln = v("<p class=\"muted svelte-j92hy\"> </p>"), Rn = v("<button part=\"load-more\" type=\"button\" class=\"svelte-j92hy\"> </button>"), zn = v("<!> <!> <!> <!>", 1), Bn = {
	hash: "svelte-j92hy",
	code: ":host {display:block;font-family:var(--agentflow-font, system-ui, sans-serif);color:var(--agentflow-text, #101828);}table.svelte-j92hy {width:100%;border-collapse:collapse;}th.svelte-j92hy, td.svelte-j92hy {text-align:start;padding:8px;border-block-end:1px solid var(--agentflow-border, #eaecf0);}tr[part='row'].svelte-j92hy {cursor:pointer;}tr[part='row'].svelte-j92hy:hover, tr[part='row'].svelte-j92hy:focus {background:color-mix(in srgb, var(--agentflow-accent, #1570ef) 8%, transparent);}.muted.svelte-j92hy {color:var(--agentflow-muted, #667085);}.error.svelte-j92hy {color:var(--agentflow-danger, #b42318);}button.svelte-j92hy {font:inherit;margin-block-start:var(--agentflow-gap, 12px);padding:6px 12px;cursor:pointer;border:1px solid var(--agentflow-border, #d0d5dd);border-radius:var(--agentflow-radius, 6px);background:transparent;}"
};
function Vn(e, r) {
	u(r, !0), a(e, Bn);
	let o = y(r, "view", 7), c = y(r, "pageSize", 7), d = y(r, "signs", 7), f = n(() => o() === "mine" || o() === "claimable" ? o() : "all"), m = n(() => Ge(c())), v = n(() => d() === "true" || d() !== "false" && void 0), S = r.$$host, w = At(S), E = n(() => w.current?.state === "ready"), O = x(T([])), A = x(null), M = x(!1), P = x(!1), I = x(null), ee = 0;
	async function R(e) {
		let t = w.current;
		if (!t) return;
		let n = ++ee;
		V(P, !0), V(I, null), e || V(A, null);
		try {
			let r = {
				view: b(f),
				live: !0,
				limit: b(m)
			};
			b(v) !== void 0 && (r.signs = b(v)), e && (r.cursor = e);
			let i = await q(t.client.GET("/work", { params: { query: r } }));
			if (n !== ee) return;
			let a = i.items.filter((e) => e.step);
			V(O, e ? [...b(O), ...a] : a, !0), V(A, i.next_cursor, !0), V(M, !0);
		} catch (r) {
			let i = t.report(r);
			n === ee && (V(I, i, !0), e || V(O, [], !0));
		} finally {
			n === ee && V(P, !1);
		}
	}
	B(() => {
		b(E) && (b(f), b(m), b(v), L(() => R()));
	});
	let z = (e) => S.dispatchEvent(new CustomEvent("task-select", {
		detail: {
			recordId: e.id,
			entityId: e.entity_id
		},
		bubbles: !0,
		composed: !0
	}));
	var te = {
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
	}, H = g(), U = F(H), G = (e) => {
		let r = n(() => w.current.t);
		var i = zn(), a = F(i), o = (e) => {
			var t = Nn(), n = C(t), i = D(n), a = (e) => {
				var t = Mn(), n = D(F(t), 1, !0);
				k((e) => s(n, e), [() => b(r)("common.request_id", { id: b(I).requestId })]), _(e, t);
			};
			h(i, (e) => {
				b(I).requestId && e(a);
			}), l(t), k((e) => s(n, `${e ?? ""} `), [() => b(r)("common.error", { code: b(I).code })]), _(e, t);
		};
		h(a, (e) => {
			b(I) && e(o);
		});
		var c = D(a, 2), u = (e) => {
			var t = Pn(), n = j(t, !0);
			k((e) => s(n, e), [() => b(r)("inbox.empty")]), _(e, t);
		}, d = (e) => {
			var n = In(), i = C(n), a = C(i), o = C(a), c = j(o, !0), u = D(o), d = j(u, !0), f = D(u), p = j(f, !0), m = D(f), h = j(m, !0);
			l(a), l(i);
			var g = D(i);
			t(g, 21, () => b(O), (e) => e.id, (e, t) => {
				var n = Fn(), i = C(n), a = j(i, !0), o = D(i), c = j(o, !0), u = D(o), d = j(u, !0), f = D(u), p = j(f, !0);
				l(n), k((e, n) => {
					s(a, b(t).step?.step.label || b(t).step?.step.key), s(c, b(t).step?.workflow.name ?? ""), s(d, e), s(p, n);
				}, [() => b(r)(b(t).claimed_by_user_id ? "status.claimed" : "status.open"), () => W(b(t).due_at, w.current.locale)]), N("click", n, () => z(b(t))), N("keydown", n, (e) => e.key === "Enter" && z(b(t))), _(e, n);
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
			b(M) && !b(P) && b(O).length === 0 && !b(I) && !b(A) ? e(u) : b(O).length > 0 && e(d, 1);
		});
		var f = D(c, 2), p = (e) => {
			var t = Ln(), n = j(t, !0);
			k((e) => s(n, e), [() => b(r)("common.loading")]), _(e, t);
		};
		h(f, (e) => {
			b(P) && e(p);
		});
		var m = D(f, 2), g = (e) => {
			var t = Rn(), n = j(t, !0);
			k((e) => s(n, e), [() => b(r)("common.load_more")]), N("click", t, () => R(b(A) ?? void 0)), _(e, t);
		};
		h(m, (e) => {
			b(A) && !b(P) && e(g);
		}), _(e, i);
	};
	return h(U, (e) => {
		w.current && b(E) && e(G);
	}), _(e, H), i(te);
}
z(["click", "keydown"]), w(Vn, {
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
function Hn(e, t) {
	let n = Te(t), r = e ?? `${location.pathname}${location.search}${location.hash}`;
	location.assign(`${n}/auth/login?returnTo=${encodeURIComponent(r)}`);
}
function Un(e) {
	let t = document.createElement("form");
	t.method = "post", t.action = `${Te(e)}/auth/logout`, t.dataset.agentflowSignOut = "", t.hidden = !0, document.body.append(t), t.submit();
}
//#endregion
//#region src/task-context.ts
function Wn(e, t) {
	let n = !1, r = je(e, ke, (e) => {
		n = !0, t(e);
	});
	return n || t(null), r;
}
//#endregion
//#region src/index.ts
var Gn = {
	"agentflow-provider": Je,
	"agentflow-task": gn,
	"agentflow-task-inbox": Vn,
	"agentflow-task-detail": jn,
	"agentflow-record-table": qt,
	"agentflow-start-form": mn
}, Kn = M;
for (let e of Object.values(Gn)) Object.defineProperty(e.element, "elementsVersion", { value: Kn });
function qn(e = customElements) {
	Xt(e, Gn, "elementsVersion", Kn, "elements");
}
qn();
//#endregion
export { Kn as ELEMENTS_VERSION, Wn as consumeTask, qn as defineAgentFlowElements, Qt as defineFolderSource, Hn as signIn, Un as signOut };
