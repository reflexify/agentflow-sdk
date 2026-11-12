import { a as e, c as t, d as n, f as r, h as i, i as a, l as o, m as s, o as c, p as l, r as u, s as d, t as f, u as p } from "./chunks/FolderSource-bewtzj77.js";
import { $ as m, B as h, C as g, Ct as _, D as v, Dt as y, F as ee, Ft as b, H as x, I as S, It as C, J as w, K as T, L as E, M as te, Mt as ne, N as re, Nt as D, O as ie, Ot as O, P as k, Pt as A, Q as ae, R as oe, S as j, St as M, T as N, U as P, V as se, W as ce, X as F, Y as I, Z as L, _ as R, _t as le, at as z, b as ue, bt as B, ct as de, dt as V, et as fe, ft as H, g as U, gt as pe, ht as W, it as me, j as he, lt as G, mt as ge, nt as _e, ot as ve, pt as K, q as ye, r as be, rt as xe, st as Se, t as Ce, tt as we, ut as Te, v as q, vt as J, w as Ee, y as Y, yt as De, z as Oe } from "./chunks/version-BYLi8HwQ.js";
import { s as ke, t as Ae } from "./chunks/Loading-BzWYrT4_.js";
import { $ as je, $t as Me, A as Ne, At as Pe, B as Fe, Bt as Ie, C as Le, Ct as Re, D as ze, Dt as Be, E as Ve, Et as He, F as Ue, Ft as We, G as Ge, Gt as Ke, H as qe, Ht as Je, I as Ye, It as Xe, J as Ze, Jt as Qe, K as $e, Kt as et, L as tt, Lt as nt, M as rt, Mt as it, N as at, Nt as ot, O as st, Ot as ct, P as lt, Pt as ut, Q as dt, Qt as ft, R as pt, Rt as mt, S as ht, St as gt, T as _t, Tt as vt, U as yt, Ut as bt, V as xt, Vt as St, W as Ct, Wt as wt, X as Tt, Xt as Et, Y as Dt, Yt as Ot, Z as kt, Zt as At, _ as jt, _t as Mt, a as Nt, an as Pt, at as Ft, b as It, bt as Lt, c as Rt, cn as zt, ct as Bt, d as X, dt as Vt, en as Ht, et as Ut, f as Wt, ft as Gt, g as Kt, gt as qt, h as Jt, ht as Z, i as Yt, in as Xt, it as Zt, j as Qt, jt as $t, k as en, kt as tn, l as Q, lt as nn, m as rn, mt as an, n as on, nn as sn, nt as cn, o as ln, on as un, ot as dn, p as fn, pt as pn, q as mn, qt as hn, r as gn, rn as _n, rt as vn, s as yn, sn as bn, st as xn, t as Sn, tn as Cn, tt as wn, u as Tn, ut as En, v as Dn, vt as On, w as kn, wt as An, x as jn, xt as Mn, y as Nn, yt as Pn, z as Fn, zt as In } from "./chunks/Scroller-CBTu_fzU.js";
import { a as Ln, c as Rn, i as zn, l as Bn, n as Vn, o as Hn, r as Un, s as Wn, t as Gn } from "./chunks/floating-ui.dom-ohCmVTxo.js";
import { claimEscape as Kn, isClaimed as qn } from "./escape.js";
import { c as Jn, i as Yn } from "./chunks/mention-chip-BxnXPO1a.js";
//#region ../agentflow-sdk/dist/conventions/dates.js
var Xn = /^(\d{4})-(\d{2})-(\d{2})$/, Zn = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, Qn = (e) => String(e).padStart(2, "0"), $n = (e) => /^vi(-|$)/i.test(e ?? "");
function er(e, t, n) {
	let r = new Date(Date.UTC(2e3, t - 1, n));
	return r.setUTCFullYear(e), r.getUTCFullYear() !== e || r.getUTCMonth() !== t - 1 || r.getUTCDate() !== n ? null : `${String(e).padStart(4, "0")}-${Qn(t)}-${Qn(n)}`;
}
function tr(e) {
	let t = Xn.exec(e ?? "");
	return t ? er(Number(t[1]), Number(t[2]), Number(t[3])) : null;
}
function nr(e) {
	let t = e.trim(), n = Zn.exec(t);
	return n ? er(Number(n[3]), Number(n[2]), Number(n[1])) : tr(t);
}
function rr(e, t) {
	let n = $n(t), r = n ? {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		timeZone: "UTC"
	} : {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC"
	};
	return new Intl.DateTimeFormat(n ? "vi-VN" : "en-GB", r).format(/* @__PURE__ */ new Date(`${e}T00:00:00Z`));
}
var ir = /DD|MM|YYYY/g;
function ar(e) {
	if (!e) return null;
	let t = e.match(ir), n = e.split(ir);
	if (!t || t.length !== 3 || new Set(t).size !== 3) return null;
	let [r, i, a, o] = n;
	return r !== "" || o !== "" || /\p{L}/u.test(i + a) ? null : {
		tokens: t,
		between: [i, a]
	};
}
function or(e) {
	return ar(e) !== null;
}
function sr(e, t) {
	let n = ar(t), r = tr(e);
	if (!n || !r) return null;
	let i = {
		YYYY: r.slice(0, 4),
		MM: r.slice(5, 7),
		DD: r.slice(8, 10)
	};
	return n.tokens.map((e, t) => i[e] + (n.between[t] ?? "")).join("");
}
function cr(e, t) {
	let n = ar(t);
	if (!n) return null;
	let r = (e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), i = (e, t) => e === "YYYY" ? "(\\d{4})" : n.between[t - 1] === "" || n.between[t] === "" ? "(\\d{2})" : "(\\d{1,2})", a = n.tokens.map((e, t) => i(e, t) + r(n.between[t] ?? "")).join(""), o = RegExp(`^${a}$`).exec(e.trim());
	if (!o) return null;
	let s = (e) => Number(o[n.tokens.indexOf(e) + 1]);
	return er(s("YYYY"), s("MM"), s("DD"));
}
function lr(e = /* @__PURE__ */ new Date()) {
	return `${String(e.getFullYear()).padStart(4, "0")}-${Qn(e.getMonth() + 1)}-${Qn(e.getDate())}`;
}
//#endregion
//#region ../agentflow-sdk/dist/conventions/match.js
function ur(e) {
	return e.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
}
function dr(e, t) {
	return ur(e ?? "").includes(ur(t.trim()));
}
//#endregion
//#region src/kit/BulkBar.svelte
var fr = "button, a[href], input, select, textarea, [role=\"button\"], [tabindex]";
function pr(e) {
	return e.matches(fr) ? e : e.querySelector(fr) ?? e;
}
var mr = (e) => !e.matches(":disabled") && e.getAttribute("aria-disabled") !== "true", hr = (e) => (e.textContent ?? "").replace(/\s+/g, " ").trim() || e.getAttribute("aria-label") || e.title;
function gr(e) {
	let t = e.shadowRoot;
	for (let e of t?.querySelector("slot")?.assignedElements() ?? []) {
		let t = pr(e);
		if (e.hasAttribute("data-overflow") || !mr(t)) continue;
		t.focus();
		let n = p();
		if (n && i(e, n)) return;
	}
	t?.querySelector("[part~=\"clear\"]")?.focus();
}
var _r = L("<span part=\"count\" class=\"count svelte-i31wrt\"> </span> ", 1), vr = L(" <!>", 1), yr = L("<af-menu><svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"1\"></circle><circle cx=\"19\" cy=\"12\" r=\"1\"></circle><circle cx=\"5\" cy=\"12\" r=\"1\"></circle></svg></af-menu>", 2), br = L("<!> <div class=\"af-kit\"><div part=\"status\" role=\"status\" class=\"live svelte-i31wrt\"> </div> <div part=\"bar\" popover=\"manual\"><span part=\"text\" class=\"summary svelte-i31wrt\"><!></span> <div class=\"tail svelte-i31wrt\"><div><!> <!></div> <button type=\"button\" part=\"clear\" class=\"af-button ghost sm clear svelte-i31wrt\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg> </button></div></div></div>", 1), xr = {
	hash: "svelte-i31wrt",
	code: ".live.svelte-i31wrt {position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;}.bar[popover].svelte-i31wrt {inset:auto 0 24px 0;box-sizing:border-box;width:max-content;max-width:calc(100vw - 2rem);margin:0 auto;padding:10px 12px 10px 16px;border:0;border-radius:calc(var(--k-radius) + 4px);background:var(--k-fg);color:var(--k-surface);box-shadow:0 25px 50px -12px rgb(0 0 0 / 0.25);overflow:visible;}.bar[popover].svelte-i31wrt:popover-open {display:flex;align-items:center;gap:12px;}.bar.wide.svelte-i31wrt {width:calc(100vw - 2rem);}.summary.svelte-i31wrt {display:flex;flex:none;align-items:center;gap:8px;font-size:13px;font-weight:600;line-height:1.5;}.count.svelte-i31wrt {border-radius:calc(var(--k-radius) - 2px);padding:2px 8px;background:var(--k-surface);color:var(--k-fg);font-variant-numeric:tabular-nums;}.tail.svelte-i31wrt {display:flex;flex:0 1 auto;align-items:center;gap:8px;min-width:0;margin-left:auto;color:color-mix(in oklab, var(--k-surface) 75%, transparent);--k-accent: color-mix(in oklab, var(--k-surface) calc(10% + var(--k-dark, 0) * 10%), transparent);--k-accent-fg: var(--k-surface);}.actions.svelte-i31wrt {display:flex;flex:0 1 auto;align-items:center;gap:8px;min-width:0;}.actions.empty.svelte-i31wrt {display:none;}.actions.svelte-i31wrt ::slotted([data-overflow]) {display:none !important;}.more.svelte-i31wrt {display:block;flex:none;width:32px;height:32px;}.more.idle.svelte-i31wrt {position:absolute;visibility:hidden;pointer-events:none;}.more.svelte-i31wrt::part(trigger) {width:32px;height:32px;padding:0;color:color-mix(in oklab, var(--k-surface) 75%, transparent);}.more.svelte-i31wrt::part(trigger):hover {background:color-mix(in oklab, var(--k-surface) 10%, transparent);color:var(--k-surface);}button.af-button.sm.clear.svelte-i31wrt {gap:4px;}"
};
function Sr(r, o) {
	O(o, !0), ee(r, xr);
	let l = R(o, "count", 7, 0), u = R(o, "total", 7, null), d = R(o, "label", 7, null), f = R(o, "locale", 7, null), m = R(o, "strings", 7, null), h = o.$$host, g = _(() => c(f(), m() ?? void 0)), b = _(() => new Intl.NumberFormat(e(f()) ? "vi-VN" : "en-GB")), x = _(() => Number(l()) > 0), S = _(() => z(b).format(Number(l()) || 0)), C = _(() => a(u() != null && Number.isFinite(Number(u())) ? z(g).selectedOfTotal : z(g).selectedCount, { total: z(b).format(Number(u())) })), T = _(() => z(C).split("{count}")), E = _(() => d() || a(z(C), { count: z(S) })), ne = B(null), re = B(null), ie = B(null), k = B(!1), A = B([]), ae = B([]), oe = (e) => e?.getBoundingClientRect().width ?? 0, j = () => z(re)?.querySelector("slot") ?? null;
	function N() {
		let e = z(re), t = j()?.assignedElements() ?? [];
		for (let e of t) e.removeAttribute("data-overflow");
		if (!e) return;
		let n = oe(e), r = parseFloat(getComputedStyle(e).columnGap) || 0, i = t.map(oe), a = t.length;
		if (i.reduce((e, t) => e + t, 0) + r * Math.max(0, t.length - 1) > n + .5) {
			let e = n - oe(z(ie)) - r, t = 0;
			for (a = 0; a < i.length; a++) {
				let n = t + (a ? r : 0) + i[a];
				if (n > e) break;
				t = n;
			}
		}
		J(A, t.slice(a));
		for (let e of z(A)) e.setAttribute("data-overflow", "");
		se();
	}
	function se() {
		J(ae, z(A).map((e, t) => {
			let n = pr(e);
			return {
				id: String(t),
				label: hr(n),
				disabled: !mr(n)
			};
		}));
	}
	function ce(e) {
		if (!(e instanceof CustomEvent)) return;
		let t = z(A)[Number(e.detail?.id)];
		t && pr(t).click();
	}
	let F = null;
	function L() {
		if (F && z(ne)) {
			F.disconnect(), F.observe(z(ne));
			for (let e of j()?.assignedElements() ?? []) F.observe(e);
		}
	}
	Te(() => {
		if (!z(ne) || typeof ResizeObserver > "u") return;
		let e = new ResizeObserver(() => N());
		return F = e, Se(L), () => {
			e.disconnect(), F = null;
		};
	}), Te(() => {
		let e = j();
		if (!e) return;
		let t = () => {
			J(k, e.assignedElements().length > 0), L(), ve().then(N);
		};
		return Se(t), me(e, "slotchange", t);
	}), Te(() => {
		let e = z(x);
		if (!e) {
			let e = p();
			e && i(h, e) && e.blur();
		}
		s(z(ne), e, h), e && Se(N);
	}), Te(() => {
		let e = z(ne);
		if (e) return me(e, "keydown", (t) => {
			if (!(t.key !== "Escape" || t.defaultPrevented || t.isComposing)) {
				for (let n of t.composedPath()) {
					if (n === e) break;
					if (n instanceof HTMLElement && n.dataset.raised === "true") return;
				}
				n(h, "clear", {});
			}
		});
	});
	var le = {
		get count() {
			return l();
		},
		set count(e = 0) {
			l(e), M();
		},
		get total() {
			return u();
		},
		set total(e = null) {
			u(e), M();
		},
		get label() {
			return d();
		},
		set label(e = null) {
			d(e), M();
		},
		get locale() {
			return f();
		},
		set locale(e = null) {
			f(e), M();
		},
		get strings() {
			return m();
		},
		set strings(e = null) {
			m(e), M();
		}
	}, de = br(), V = K(de);
	t(V, {});
	var U = W(V, 2), pe = H(U), he = ge(pe, !0), ye = W(pe, 2);
	let be;
	var Ce = H(ye), we = H(Ce), q = (e) => {
		var t = fe();
		G(() => w(t, d())), I(e, t);
	}, Ee = (e) => {
		var t = vr(), n = K(t, !0), r = W(n), i = (e) => {
			var t = _r(), n = K(t), r = ge(n, !0), i = W(n, 1, !0);
			G((e) => {
				w(r, z(S)), w(i, e);
			}, [() => z(T).slice(1).join(z(S))]), I(e, t);
		};
		P(r, (e) => {
			z(T).length > 1 && e(i);
		}), G(() => w(n, z(T)[0])), I(e, t);
	};
	P(we, (e) => {
		d() ? e(q) : e(Ee, -1);
	}), D(Ce);
	var Y = W(Ce, 2), De = H(Y);
	let ke;
	var Ae = H(De);
	Oe(Ae, () => "<slot name=\"actions\"></slot>");
	var je = W(Ae, 2), Me = (e) => {
		var t = yr();
		v(t, "part", "more");
		let n;
		G(() => v(t, "items", z(ae))), G(() => v(t, "label", z(g).moreActions)), G(() => v(t, "locale", f() || void 0)), G(() => v(t, "strings", m() ?? void 0)), ue(t, (e) => J(ie, e), () => z(ie)), G(() => n = te(t, 1, "more svelte-i31wrt", null, n, { idle: z(A).length === 0 })), xe("select", t, ce), xe("pointerdown", t, se, !0), xe("keydown", t, se, !0), I(e, t);
	};
	P(je, (e) => {
		z(x) && e(Me);
	}), D(De), ue(De, (e) => J(re, e), () => z(re));
	var Ne = W(De, 2), Pe = W(H(Ne), 1, !0);
	return D(Ne), D(Y), D(ye), ue(ye, (e) => J(ne, e), () => z(ne)), D(U), G(() => {
		w(he, z(x) ? z(E) : ""), be = te(ye, 1, "bar svelte-i31wrt", null, be, { wide: z(A).length > 0 }), ke = te(De, 1, "actions svelte-i31wrt", null, ke, { empty: !z(k) }), w(Pe, z(g).clearSelection);
	}), _e("click", Ne, () => n(h, "clear", {})), I(r, de), y(le);
}
we(["click"]), U(Sr, {
	count: {
		attribute: "count",
		type: "Number"
	},
	total: {
		attribute: "total",
		type: "Number"
	},
	label: {
		attribute: "label",
		type: "String"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, [], [], { mode: "open" }, (e) => class extends e {
	focus() {
		gr(this);
	}
});
//#endregion
//#region src/kit/form/associate.ts
var Cr = /* @__PURE__ */ new WeakMap(), wr = /* @__PURE__ */ new WeakMap(), Tr = /* @__PURE__ */ new WeakMap();
function Er(e) {
	let t = e;
	return class extends t {
		static formAssociated = !0;
		internals;
		constructor() {
			super(), this.internals = this.attachInternals(), Cr.set(this, this.internals);
		}
		get form() {
			return this.internals.form ?? null;
		}
		get validity() {
			return this.internals.validity;
		}
		get validationMessage() {
			return this.internals.validationMessage;
		}
		get willValidate() {
			return this.internals.willValidate;
		}
		checkValidity() {
			return this.internals.checkValidity();
		}
		reportValidity() {
			return this.internals.reportValidity();
		}
		focus(e) {
			let t = this.shadowRoot?.querySelector("[part~=\"input\"]");
			t ? t.focus(e) : super.focus(e);
		}
		formResetCallback() {
			wr.get(this)?.reset();
		}
		formDisabledCallback(e) {
			Tr.set(this, e), wr.get(this)?.disabled(e);
		}
	};
}
function Dr(e, t) {
	let n = Cr.get(e);
	if (!n || typeof n.setFormValue != "function") return;
	let { name: r, value: i } = t;
	if (Array.isArray(i)) {
		if (r) {
			let e = new FormData();
			for (let t of i) e.append(r, t);
			n.setFormValue(e);
		} else n.setFormValue(null);
	} else n.setFormValue(i);
	Object.values(t.validity).some(Boolean) ? n.setValidity(t.validity, t.message || u.en.valueMissing, t.anchor ?? void 0) : n.setValidity({});
}
function Or(e, t) {
	wr.set(e, t), Tr.get(e) && t.disabled(!0);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+collection@1.43.3/node_modules/@zag-js/collection/dist/chunk-QZ7TP4HQ.mjs
var kr = Object.defineProperty, Ar = (e, t, n) => t in e ? kr(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, $ = (e, t, n) => Ar(e, typeof t == "symbol" ? t : t + "", n), jr = Object.defineProperty, Mr = (e) => {
	throw TypeError(e);
}, Nr = (e, t, n) => t in e ? jr(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, Pr = (e, t, n) => Nr(e, typeof t == "symbol" ? t : t + "", n), Fr = (e, t, n) => t.has(e) || Mr("Cannot " + n), Ir = (e, t, n) => (Fr(e, t, "read from private field"), n ? n.call(e) : t.get(e)), Lr = (e, t, n) => t.has(e) ? Mr("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/store.mjs
function Rr(e, t = Object.is) {
	let n = { ...e }, r = /* @__PURE__ */ new Set(), i = (e) => (r.add(e), () => r.delete(e)), a = () => {
		r.forEach((e) => e());
	};
	return {
		subscribe: i,
		get: (e) => n[e],
		set: (e, r) => {
			t(n[e], r) || (n[e] = r, a());
		},
		update: (e) => {
			let r = !1;
			for (let i in e) {
				let a = e[i];
				a !== void 0 && !t(n[i], a) && (n[i] = a, r = !0);
			}
			r && a();
		},
		snapshot: () => ({ ...n })
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/timers.mjs
var zr = () => performance.now(), Br, Vr = class {
	constructor(e) {
		Pr(this, "onTick", e), Pr(this, "frameId", null), Pr(this, "pausedAtMs", null), Pr(this, "context"), Pr(this, "cancelFrame", () => {
			this.frameId !== null && (cancelAnimationFrame(this.frameId), this.frameId = null);
		}), Pr(this, "setStartMs", (e) => {
			this.context.startMs = e;
		}), Pr(this, "start", () => {
			if (this.frameId !== null) return;
			let e = zr();
			this.pausedAtMs === null ? this.context.startMs = e : (this.context.startMs += e - this.pausedAtMs, this.pausedAtMs = null), this.frameId = requestAnimationFrame(Ir(this, Br));
		}), Pr(this, "pause", () => {
			this.frameId !== null && (this.cancelFrame(), this.pausedAtMs = zr());
		}), Pr(this, "stop", () => {
			this.frameId !== null && (this.cancelFrame(), this.pausedAtMs = null);
		}), Lr(this, Br, (e) => {
			if (this.context.now = e, this.context.deltaMs = e - this.context.startMs, this.onTick(this.context) === !1) {
				this.stop();
				return;
			}
			this.frameId = requestAnimationFrame(Ir(this, Br));
		}), this.context = {
			now: 0,
			startMs: zr(),
			deltaMs: 0
		};
	}
	get elapsedMs() {
		return this.pausedAtMs === null ? zr() - this.context.startMs : this.pausedAtMs - this.context.startMs;
	}
};
Br = /* @__PURE__ */ new WeakMap();
function Hr(e, t) {
	let n = new Vr(({ deltaMs: n }) => {
		if (n >= t) return e(), !1;
	});
	return n.start(), () => n.stop();
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+collection@1.43.3/node_modules/@zag-js/collection/dist/list-collection.mjs
var Ur = {
	itemToValue(e) {
		return typeof e == "string" ? e : Qe(e) && bt(e, "value") ? e.value : "";
	},
	itemToString(e) {
		return typeof e == "string" ? e : Qe(e) && bt(e, "label") ? e.label : Ur.itemToValue(e);
	},
	isItemDisabled(e) {
		return Qe(e) && bt(e, "disabled") ? !!e.disabled : !1;
	}
}, Wr = class e {
	constructor(t) {
		$(this, "options", t), $(this, "items"), $(this, "indexMap", null), $(this, "copy", (t) => new e({
			...this.options,
			items: t ?? [...this.items]
		})), $(this, "isEqual", (e) => Ot(this.items, e.items)), $(this, "setItems", (e) => this.copy(e)), $(this, "getValues", (e = this.items) => {
			let t = [];
			for (let n of e) {
				let e = this.getItemValue(n);
				e != null && t.push(e);
			}
			return t;
		}), $(this, "find", (e) => {
			if (e == null) return null;
			let t = this.indexOf(e);
			return t === -1 ? null : this.at(t);
		}), $(this, "findMany", (e) => {
			let t = [];
			for (let n of e) {
				let e = this.find(n);
				e != null && t.push(e);
			}
			return t;
		}), $(this, "at", (e) => {
			if (!this.options.groupBy && !this.options.groupSort) return this.items[e] ?? null;
			let t = 0, n = this.group();
			for (let [, r] of n) for (let n of r) {
				if (t === e) return n;
				t++;
			}
			return null;
		}), $(this, "sortFn", (e, t) => {
			let n = this.indexOf(e), r = this.indexOf(t);
			return (n ?? 0) - (r ?? 0);
		}), $(this, "sort", (e) => [...e].sort(this.sortFn.bind(this))), $(this, "getItemValue", (e) => e == null ? null : this.options.itemToValue?.(e) ?? Ur.itemToValue(e)), $(this, "getItemDisabled", (e) => e == null ? !1 : this.options.isItemDisabled?.(e) ?? Ur.isItemDisabled(e)), $(this, "stringifyItem", (e) => e == null ? null : this.options.itemToString?.(e) ?? Ur.itemToString(e)), $(this, "stringify", (e) => e == null ? null : this.stringifyItem(this.find(e))), $(this, "stringifyItems", (e, t = ", ") => {
			let n = [];
			for (let t of e) {
				let e = this.stringifyItem(t);
				e != null && n.push(e);
			}
			return n.join(t);
		}), $(this, "stringifyMany", (e, t) => this.stringifyItems(this.findMany(e), t)), $(this, "has", (e) => this.indexOf(e) !== -1), $(this, "hasItem", (e) => e != null && this.has(this.getItemValue(e))), $(this, "group", () => {
			let { groupBy: e, groupSort: t } = this.options;
			if (!e) return [["", [...this.items]]];
			let n = /* @__PURE__ */ new Map();
			this.items.forEach((t, r) => {
				let i = e(t, r);
				n.has(i) || n.set(i, []), n.get(i).push(t);
			});
			let r = Array.from(n.entries());
			return t && r.sort(([e], [n]) => {
				if (typeof t == "function") return t(e, n);
				if (Array.isArray(t)) {
					let r = t.indexOf(e), i = t.indexOf(n);
					return r === -1 ? 1 : i === -1 ? -1 : r - i;
				}
				return t === "asc" ? e.localeCompare(n) : t === "desc" ? n.localeCompare(e) : 0;
			}), r;
		}), $(this, "getNextValue", (e, t = 1, n = !1) => {
			let r = this.indexOf(e);
			if (r === -1) return null;
			for (r = n ? Math.min(r + t, this.size - 1) : r + t; r <= this.size && this.getItemDisabled(this.at(r));) r++;
			return this.getItemValue(this.at(r));
		}), $(this, "getPreviousValue", (e, t = 1, n = !1) => {
			let r = this.indexOf(e);
			if (r === -1) return null;
			for (r = n ? Math.max(r - t, 0) : r - t; r >= 0 && this.getItemDisabled(this.at(r));) r--;
			return this.getItemValue(this.at(r));
		}), $(this, "indexOf", (e) => {
			if (e == null) return -1;
			if (!this.options.groupBy && !this.options.groupSort) return this.items.findIndex((t) => this.getItemValue(t) === e);
			if (!this.indexMap) {
				this.indexMap = /* @__PURE__ */ new Map();
				let e = 0, t = this.group();
				for (let [, n] of t) for (let t of n) {
					let n = this.getItemValue(t);
					n != null && this.indexMap.set(n, e), e++;
				}
			}
			return this.indexMap.get(e) ?? -1;
		}), $(this, "getByText", (e, t) => {
			let n = t == null ? -1 : this.indexOf(t), r = e.length === 1;
			for (let i = 0; i < this.items.length; i++) {
				let a = this.items[(n + i + 1) % this.items.length];
				if (!(r && this.getItemValue(a) === t) && !this.getItemDisabled(a) && Gr(this.stringifyItem(a), e)) return a;
			}
		}), $(this, "search", (e, t) => {
			let { state: n, currentValue: r, timeout: i = 350 } = t, a = n.keysSoFar + e, o = a.length > 1 && Array.from(a).every((e) => e === a[0]) ? a[0] : a, s = this.getByText(o, r), c = this.getItemValue(s);
			function l() {
				clearTimeout(n.timer), n.timer = -1;
			}
			function u(e) {
				n.keysSoFar = e, l(), e !== "" && (n.timer = +setTimeout(() => {
					u(""), l();
				}, i));
			}
			return u(a), c;
		}), $(this, "update", (e, t) => {
			let n = this.indexOf(e);
			return n === -1 ? this : this.copy([
				...this.items.slice(0, n),
				t,
				...this.items.slice(n + 1)
			]);
		}), $(this, "upsert", (e, t, n = "append") => {
			let r = this.indexOf(e);
			return r === -1 ? (n === "append" ? this.append : this.prepend)(t) : this.copy([
				...this.items.slice(0, r),
				t,
				...this.items.slice(r + 1)
			]);
		}), $(this, "insert", (e, ...t) => this.copy(Kr(this.items, e, ...t))), $(this, "insertBefore", (e, ...t) => {
			let n = this.indexOf(e);
			if (n === -1) {
				if (this.items.length === 0) n = 0;
				else return this;
			}
			return this.copy(Kr(this.items, n, ...t));
		}), $(this, "insertAfter", (e, ...t) => {
			let n = this.indexOf(e);
			if (n === -1) {
				if (this.items.length === 0) n = 0;
				else return this;
			}
			return this.copy(Kr(this.items, n + 1, ...t));
		}), $(this, "prepend", (...e) => this.copy(Kr(this.items, 0, ...e))), $(this, "append", (...e) => this.copy(Kr(this.items, this.items.length, ...e))), $(this, "filter", (e) => {
			let t = this.items.filter((t, n) => e(this.stringifyItem(t), n, t));
			return this.copy(t);
		}), $(this, "remove", (...e) => {
			let t = e.map((e) => typeof e == "string" ? e : this.getItemValue(e));
			return this.copy(this.items.filter((e) => {
				let n = this.getItemValue(e);
				return n != null && !t.includes(n);
			}));
		}), $(this, "move", (e, t) => {
			let n = this.indexOf(e);
			return n === -1 ? this : this.copy(qr(this.items, [n], t));
		}), $(this, "moveBefore", (e, ...t) => {
			let n = this.items.findIndex((t) => this.getItemValue(t) === e);
			if (n === -1) return this;
			let r = t.map((e) => this.items.findIndex((t) => this.getItemValue(t) === e)).sort((e, t) => e - t);
			return this.copy(qr(this.items, r, n));
		}), $(this, "moveAfter", (e, ...t) => {
			let n = this.items.findIndex((t) => this.getItemValue(t) === e);
			if (n === -1) return this;
			let r = t.map((e) => this.items.findIndex((t) => this.getItemValue(t) === e)).sort((e, t) => e - t);
			return this.copy(qr(this.items, r, n + 1));
		}), $(this, "reorder", (e, t) => this.copy(qr(this.items, [e], t))), $(this, "compareValue", (e, t) => {
			let n = this.indexOf(e), r = this.indexOf(t);
			return n < r ? -1 : +(n > r);
		}), $(this, "range", (e, t) => {
			let n = [], r = e;
			for (; r != null;) {
				if (this.find(r) && n.push(r), r === t) return n;
				r = this.getNextValue(r);
			}
			return [];
		}), $(this, "getValueRange", (e, t) => e && t ? this.compareValue(e, t) <= 0 ? this.range(e, t) : this.range(t, e) : []), $(this, "toString", () => {
			let e = "";
			for (let t of this.items) {
				let n = [
					this.getItemValue(t),
					this.stringifyItem(t),
					this.getItemDisabled(t)
				].filter(Boolean).join(":");
				e += n + ",";
			}
			return e;
		}), $(this, "toJSON", () => ({
			size: this.size,
			first: this.firstValue,
			last: this.lastValue
		})), this.items = [...t.items];
	}
	get size() {
		return this.items.length;
	}
	get firstValue() {
		let e = 0;
		for (; this.getItemDisabled(this.at(e));) e++;
		return this.getItemValue(this.at(e));
	}
	get lastValue() {
		let e = this.size - 1;
		for (; this.getItemDisabled(this.at(e));) e--;
		return this.getItemValue(this.at(e));
	}
	*[Symbol.iterator]() {
		yield* this.items;
	}
}, Gr = (e, t) => !!e?.toLowerCase().startsWith(t.toLowerCase());
function Kr(e, t, ...n) {
	return [
		...e.slice(0, t),
		...n,
		...e.slice(t)
	];
}
function qr(e, t, n) {
	t = [...t].sort((e, t) => e - t);
	let r = t.map((t) => e[t]);
	for (let n = t.length - 1; n >= 0; n--) e = [...e.slice(0, t[n]), ...e.slice(t[n] + 1)];
	return n = Math.max(0, n - t.filter((e) => e < n).length), [
		...e.slice(0, n),
		...r,
		...e.slice(n)
	];
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+collection@1.43.3/node_modules/@zag-js/collection/dist/selection-map.mjs
function Jr({ values: e, collection: t, selectedItemMap: n }) {
	let r = [];
	for (let i of e) {
		let e = t.find(i) ?? n.get(i);
		e != null && r.push(e);
	}
	return r;
}
function Yr({ selectedItemMap: e, values: t, selectedItems: n, collection: r }) {
	let i = new Map(e);
	for (let e of n) {
		let t = r.getItemValue(e);
		t != null && i.set(t, e);
	}
	let a = new Set(t);
	for (let e of i.keys()) a.has(e) || i.delete(e);
	return i;
}
function Xr({ values: e, collection: t, selectedItemMap: n }) {
	let r = Jr({
		values: e,
		collection: t,
		selectedItemMap: n
	});
	return {
		selectedItems: r,
		nextSelectedItemMap: Yr({
			selectedItemMap: n,
			values: e,
			selectedItems: r,
			collection: t
		})
	};
}
function Zr({ selectedItems: e, collection: t }) {
	return Yr({
		selectedItemMap: /* @__PURE__ */ new Map(),
		values: e.map((e) => t.getItemValue(e)).filter(Boolean),
		selectedItems: e,
		collection: t
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+collection@1.43.3/node_modules/@zag-js/collection/dist/tree-visit.mjs
function Qr(e, t, n) {
	for (let r = 0; r < t.length; r++) e = n.getChildren(e, t.slice(r + 1))[t[r]];
	return e;
}
function $r(e) {
	let t = ti(e), n = [], r = /* @__PURE__ */ new Set();
	for (let e of t) {
		let t = e.join();
		r.has(t) || (r.add(t), n.push(e));
	}
	return n;
}
function ei(e, t) {
	for (let n = 0; n < Math.min(e.length, t.length); n++) {
		if (e[n] < t[n]) return -1;
		if (e[n] > t[n]) return 1;
	}
	return e.length - t.length;
}
function ti(e) {
	return e.sort(ei);
}
function ni(e, t) {
	let n;
	return Ci(e, {
		...t,
		onEnter: (e, r) => {
			if (t.predicate(e, r)) return n = e, "stop";
		}
	}), n;
}
function ri(e, t) {
	let n = [];
	return Ci(e, {
		onEnter: (e, r) => {
			t.predicate(e, r) && n.push(e);
		},
		getChildren: t.getChildren
	}), n;
}
function ii(e, t) {
	let n;
	return Ci(e, {
		onEnter: (e, r) => {
			if (t.predicate(e, r)) return n = [...r], "stop";
		},
		getChildren: t.getChildren
	}), n;
}
function ai(e, t) {
	let n = t.initialResult;
	return Ci(e, {
		...t,
		onEnter: (e, r) => {
			n = t.nextResult(n, e, r);
		}
	}), n;
}
function oi(e, t) {
	return ai(e, {
		...t,
		initialResult: [],
		nextResult: (e, n, r) => (e.push(...t.transform(n, r)), e)
	});
}
function si(e, t) {
	let { predicate: n, create: r, getChildren: i } = t, a = (e, t) => {
		let o = i(e, t), s = [];
		o.forEach((e, n) => {
			let r = [...t, n], i = a(e, r);
			i && s.push(i);
		});
		let c = t.length === 0, l = n(e, t), u = s.length > 0;
		return c || l || u ? r(e, s, t) : null;
	};
	return a(e, []) || r(e, [], []);
}
function ci(e, t) {
	let n = [], r = 0, i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
	return Ci(e, {
		getChildren: t.getChildren,
		onEnter: (e, o) => {
			i.has(e) || i.set(e, r++);
			let s = t.getChildren(e, o);
			s.forEach((t) => {
				a.has(t) || a.set(t, e), i.has(t) || i.set(t, r++);
			});
			let c = s.length > 0 ? s.map((e) => i.get(e)) : void 0, l = a.get(e), u = l ? i.get(l) : void 0, d = i.get(e);
			n.push({
				...e,
				_children: c,
				_parent: u,
				_index: d
			});
		}
	}), n;
}
function li(e, t) {
	return {
		type: "insert",
		index: e,
		nodes: t
	};
}
function ui(e) {
	return {
		type: "remove",
		indexes: e
	};
}
function di() {
	return { type: "replace" };
}
function fi(e) {
	return [e.slice(0, -1), e[e.length - 1]];
}
function pi(e, t, n = /* @__PURE__ */ new Map()) {
	let [r, i] = fi(e);
	for (let e = r.length - 1; e >= 0; e--) {
		let t = r.slice(0, e).join();
		n.get(t)?.type !== "remove" && n.set(t, di());
	}
	let a = n.get(r.join());
	switch (a?.type) {
		case "remove":
			n.set(r.join(), {
				type: "removeThenInsert",
				removeIndexes: a.indexes,
				insertIndex: i,
				insertNodes: t
			});
			break;
		default: n.set(r.join(), li(i, t));
	}
	return n;
}
function mi(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
	for (let t of e) {
		let e = t.slice(0, -1).join(), r = n.get(e) ?? [];
		r.push(t[t.length - 1]), n.set(e, r.sort((e, t) => e - t));
	}
	for (let n of e) for (let e = n.length - 2; e >= 0; e--) {
		let r = n.slice(0, e).join();
		t.has(r) || t.set(r, di());
	}
	for (let [e, r] of n) t.set(e, ui(r));
	return t;
}
function hi(e, t) {
	let n = /* @__PURE__ */ new Map(), [r, i] = fi(e);
	for (let e = r.length - 1; e >= 0; e--) {
		let t = r.slice(0, e).join();
		n.set(t, di());
	}
	return n.set(r.join(), {
		type: "removeThenInsert",
		removeIndexes: [i],
		insertIndex: i,
		insertNodes: [t]
	}), n;
}
function gi(e, t, n) {
	return vi(e, {
		...n,
		getChildren: (e, r) => {
			let i = r.join();
			switch (t.get(i)?.type) {
				case "replace":
				case "remove":
				case "removeThenInsert":
				case "insert": return n.getChildren(e, r);
				default: return [];
			}
		},
		transform: (e, r, i) => {
			let a = i.join(), o = t.get(a);
			switch (o?.type) {
				case "remove": return n.create(e, r.filter((e, t) => !o.indexes.includes(t)), i);
				case "removeThenInsert":
					let t = r.filter((e, t) => !o.removeIndexes.includes(t)), a = o.removeIndexes.reduce((e, t) => t < e ? e - 1 : e, o.insertIndex);
					return n.create(e, _i(t, a, 0, ...o.insertNodes), i);
				case "insert": return n.create(e, _i(r, o.index, 0, ...o.nodes), i);
				case "replace": return n.create(e, r, i);
				default: return e;
			}
		}
	});
}
function _i(e, t, n, ...r) {
	return [
		...e.slice(0, t),
		...r,
		...e.slice(t + n)
	];
}
function vi(e, t) {
	let n = {};
	return Ci(e, {
		...t,
		onLeave: (e, r) => {
			let i = [0, ...r], a = i.join(), o = t.transform(e, n[a] ?? [], r), s = i.slice(0, -1).join(), c = n[s] ?? [];
			c.push(o), n[s] = c;
		}
	}), n[""][0];
}
function yi(e, t) {
	let { nodes: n, at: r } = t;
	if (r.length === 0) throw Error("Can't insert nodes at the root");
	return gi(e, pi(r, n), t);
}
function bi(e, t) {
	return t.at.length === 0 ? t.node : gi(e, hi(t.at, t.node), t);
}
function xi(e, t) {
	if (t.indexPaths.length === 0) return e;
	for (let e of t.indexPaths) if (e.length === 0) throw Error("Can't remove the root node");
	return gi(e, mi(t.indexPaths), t);
}
function Si(e, t) {
	if (t.indexPaths.length === 0) return e;
	for (let e of t.indexPaths) if (e.length === 0) throw Error("Can't move the root node");
	if (t.to.length === 0) throw Error("Can't move nodes to the root");
	let n = $r(t.indexPaths), r = n.map((n) => Qr(e, n, t));
	return gi(e, pi(t.to, r, mi(n)), t);
}
function Ci(e, t) {
	let { onEnter: n, onLeave: r, getChildren: i } = t, a = [], o = [{ node: e }], s = t.reuseIndexPath ? () => a : () => a.slice();
	for (; o.length > 0;) {
		let e = o[o.length - 1];
		if (e.state === void 0) {
			let t = n?.(e.node, s());
			if (t === "stop") return;
			e.state = t === "skip" ? -1 : 0;
		}
		let t = e.children || i(e.node, s());
		if (e.children ||= t, e.state !== -1) {
			if (e.state < t.length) {
				let n = e.state;
				a.push(n), o.push({ node: t[n] }), e.state = n + 1;
				continue;
			}
			if (r?.(e.node, s()) === "stop") return;
		}
		a.pop(), o.pop();
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+collection@1.43.3/node_modules/@zag-js/collection/dist/tree-collection.mjs
var wi = class e {
	constructor(t) {
		$(this, "options", t), $(this, "rootNode"), $(this, "isEqual", (e) => Ot(this.rootNode, e.rootNode)), $(this, "getNodeChildren", (e) => this.options.nodeToChildren?.(e) ?? Ti.nodeToChildren(e) ?? []), $(this, "resolveIndexPath", (e) => typeof e == "string" ? this.getIndexPath(e) : e), $(this, "resolveNode", (e) => {
			let t = this.resolveIndexPath(e);
			return t ? this.at(t) : void 0;
		}), $(this, "getNodeChildrenCount", (e) => this.options.nodeToChildrenCount?.(e) ?? Ti.nodeToChildrenCount(e)), $(this, "getNodeValue", (e) => this.options.nodeToValue?.(e) ?? Ti.nodeToValue(e)), $(this, "getNodeDisabled", (e) => this.options.isNodeDisabled?.(e) ?? Ti.isNodeDisabled(e)), $(this, "stringify", (e) => {
			let t = this.findNode(e);
			return t ? this.stringifyNode(t) : null;
		}), $(this, "stringifyNode", (e) => this.options.nodeToString?.(e) ?? Ti.nodeToString(e)), $(this, "getFirstNode", (e = this.rootNode, t = {}) => {
			let n;
			return Ci(e, {
				getChildren: this.getNodeChildren,
				onEnter: (r, i) => {
					if (!this.isSameNode(r, e)) {
						if (t.skip?.({
							value: this.getNodeValue(r),
							node: r,
							indexPath: i
						})) return "skip";
						if (!n && i.length > 0 && !this.getNodeDisabled(r)) return n = r, "stop";
					}
				}
			}), n;
		}), $(this, "getLastNode", (e = this.rootNode, t = {}) => {
			let n;
			return Ci(e, {
				getChildren: this.getNodeChildren,
				onEnter: (r, i) => {
					if (!this.isSameNode(r, e)) {
						if (t.skip?.({
							value: this.getNodeValue(r),
							node: r,
							indexPath: i
						})) return "skip";
						i.length > 0 && !this.getNodeDisabled(r) && (n = r);
					}
				}
			}), n;
		}), $(this, "at", (e) => Qr(this.rootNode, e, { getChildren: this.getNodeChildren })), $(this, "findNode", (e, t = this.rootNode) => ni(t, {
			getChildren: this.getNodeChildren,
			predicate: (t) => this.getNodeValue(t) === e
		})), $(this, "findNodes", (e, t = this.rootNode) => {
			let n = new Set(e.filter((e) => e != null));
			return ri(t, {
				getChildren: this.getNodeChildren,
				predicate: (e) => n.has(this.getNodeValue(e))
			});
		}), $(this, "sort", (e) => e.reduce((e, t) => {
			let n = this.getIndexPath(t);
			return n && e.push({
				value: t,
				indexPath: n
			}), e;
		}, []).sort((e, t) => ei(e.indexPath, t.indexPath)).map(({ value: e }) => e)), $(this, "getValue", (e) => {
			let t = this.at(e);
			return t ? this.getNodeValue(t) : void 0;
		}), $(this, "getValuePath", (e) => {
			if (!e) return [];
			let t = [], n = [...e];
			for (; n.length > 0;) {
				let e = this.at(n);
				e && t.unshift(this.getNodeValue(e)), n.pop();
			}
			return t;
		}), $(this, "getDepth", (e) => ii(this.rootNode, {
			getChildren: this.getNodeChildren,
			predicate: (t) => this.getNodeValue(t) === e
		})?.length ?? 0), $(this, "isSameNode", (e, t) => this.getNodeValue(e) === this.getNodeValue(t)), $(this, "isRootNode", (e) => this.isSameNode(e, this.rootNode)), $(this, "contains", (e, t) => !e || !t ? !1 : t.slice(0, e.length).every((n, r) => e[r] === t[r])), $(this, "getNextNode", (e, t = {}) => {
			let n = !1, r;
			return Ci(this.rootNode, {
				getChildren: this.getNodeChildren,
				onEnter: (i, a) => {
					if (this.isRootNode(i)) return;
					let o = this.getNodeValue(i);
					if (t.skip?.({
						value: o,
						node: i,
						indexPath: a
					})) return o === e && (n = !0), "skip";
					if (n && !this.getNodeDisabled(i)) return r = i, "stop";
					o === e && (n = !0);
				}
			}), r;
		}), $(this, "getPreviousNode", (e, t = {}) => {
			let n, r = !1;
			return Ci(this.rootNode, {
				getChildren: this.getNodeChildren,
				onEnter: (i, a) => {
					if (this.isRootNode(i)) return;
					let o = this.getNodeValue(i);
					if (t.skip?.({
						value: o,
						node: i,
						indexPath: a
					})) return "skip";
					if (o === e) return r = !0, "stop";
					this.getNodeDisabled(i) || (n = i);
				}
			}), r ? n : void 0;
		}), $(this, "getParentNodes", (e) => {
			let t = this.resolveIndexPath(e)?.slice();
			if (!t) return [];
			let n = [];
			for (; t.length > 0;) {
				t.pop();
				let e = this.at(t);
				e && !this.isRootNode(e) && n.unshift(e);
			}
			return n;
		}), $(this, "getDescendantNodes", (e, t) => {
			let n = this.resolveNode(e);
			if (!n) return [];
			let r = [];
			return Ci(n, {
				getChildren: this.getNodeChildren,
				onEnter: (e, n) => {
					n.length !== 0 && (t?.withBranch || !this.isBranchNode(e)) && r.push(e);
				}
			}), r;
		}), $(this, "getDescendantValues", (e, t) => this.getDescendantNodes(e, t).map((e) => this.getNodeValue(e))), $(this, "getParentIndexPath", (e) => e.slice(0, -1)), $(this, "getParentNode", (e) => {
			let t = this.resolveIndexPath(e);
			return t ? this.at(this.getParentIndexPath(t)) : void 0;
		}), $(this, "visit", (e) => {
			let { skip: t, ...n } = e;
			Ci(this.rootNode, {
				...n,
				getChildren: this.getNodeChildren,
				onEnter: (e, r) => {
					if (!this.isRootNode(e)) return t?.({
						value: this.getNodeValue(e),
						node: e,
						indexPath: r
					}) ? "skip" : n.onEnter?.(e, r);
				}
			});
		}), $(this, "getPreviousSibling", (e) => {
			let t = this.getParentNode(e);
			if (!t) return;
			let n = this.getNodeChildren(t), r = e[e.length - 1];
			for (; --r >= 0;) {
				let e = n[r];
				if (!this.getNodeDisabled(e)) return e;
			}
		}), $(this, "getNextSibling", (e) => {
			let t = this.getParentNode(e);
			if (!t) return;
			let n = this.getNodeChildren(t), r = e[e.length - 1];
			for (; ++r < n.length;) {
				let e = n[r];
				if (!this.getNodeDisabled(e)) return e;
			}
		}), $(this, "getSiblingNodes", (e) => {
			let t = this.getParentNode(e);
			return t ? this.getNodeChildren(t) : [];
		}), $(this, "getValues", (e = this.rootNode) => oi(e, {
			getChildren: this.getNodeChildren,
			transform: (e) => [this.getNodeValue(e)]
		}).slice(1)), $(this, "isValidDepth", (e, t) => t == null ? !0 : typeof t == "function" ? t(e.length) : e.length === t), $(this, "isBranchNode", (e) => this.getNodeChildren(e).length > 0 || this.getNodeChildrenCount(e) != null), $(this, "getBranchValues", (e = this.rootNode, t = {}) => {
			let n = [];
			return Ci(e, {
				getChildren: this.getNodeChildren,
				onEnter: (e, r) => {
					if (r.length === 0) return;
					let i = this.getNodeValue(e);
					if (t.skip?.({
						value: i,
						node: e,
						indexPath: r
					})) return "skip";
					this.isBranchNode(e) && this.isValidDepth(r, t.depth) && n.push(this.getNodeValue(e));
				}
			}), n;
		}), $(this, "flatten", (e = this.rootNode) => ci(e, { getChildren: this.getNodeChildren })), $(this, "_create", (e, t) => this.getNodeChildren(e).length > 0 || t.length > 0 ? {
			...e,
			children: t
		} : { ...e }), $(this, "_insert", (e, t, n) => this.copy(yi(e, {
			at: t,
			nodes: n,
			getChildren: this.getNodeChildren,
			create: this._create
		}))), $(this, "copy", (t) => new e({
			...this.options,
			rootNode: t
		})), $(this, "_replace", (e, t, n) => this.copy(bi(e, {
			at: t,
			node: n,
			getChildren: this.getNodeChildren,
			create: this._create
		}))), $(this, "_move", (e, t, n) => this.copy(Si(e, {
			indexPaths: t,
			to: n,
			getChildren: this.getNodeChildren,
			create: this._create
		}))), $(this, "_remove", (e, t) => this.copy(xi(e, {
			indexPaths: t,
			getChildren: this.getNodeChildren,
			create: this._create
		}))), $(this, "replace", (e, t) => this._replace(this.rootNode, e, t)), $(this, "remove", (e) => this._remove(this.rootNode, e)), $(this, "insertBefore", (e, t) => this.getParentNode(e) ? this._insert(this.rootNode, e, t) : void 0), $(this, "insertAfter", (e, t) => {
			if (!this.getParentNode(e)) return;
			let n = [...e.slice(0, -1), e[e.length - 1] + 1];
			return this._insert(this.rootNode, n, t);
		}), $(this, "move", (e, t) => this._move(this.rootNode, e, t)), $(this, "filter", (e) => {
			let t = si(this.rootNode, {
				predicate: e,
				getChildren: this.getNodeChildren,
				create: this._create
			});
			return this.copy(t);
		}), $(this, "toJSON", () => this.getValues(this.rootNode)), this.rootNode = t.rootNode;
	}
	getIndexPath(e) {
		if (Array.isArray(e)) {
			if (e.length === 0) return [];
			let t = [], n = this.getNodeChildren(this.rootNode);
			for (let r = 0; r < e.length; r++) {
				let i = e[r], a = n.findIndex((e) => this.getNodeValue(e) === i);
				if (a === -1) break;
				if (t.push(a), r < e.length - 1) {
					let e = n[a];
					n = this.getNodeChildren(e);
				}
			}
			return t;
		}
		return ii(this.rootNode, {
			getChildren: this.getNodeChildren,
			predicate: (t) => this.getNodeValue(t) === e
		});
	}
}, Ti = {
	nodeToValue(e) {
		return typeof e == "string" ? e : Qe(e) && bt(e, "value") ? e.value : "";
	},
	nodeToString(e) {
		return typeof e == "string" ? e : Qe(e) && bt(e, "label") ? e.label : Ti.nodeToValue(e);
	},
	isNodeDisabled(e) {
		return Qe(e) && bt(e, "disabled") ? !!e.disabled : !1;
	},
	nodeToChildren(e) {
		return e.children;
	},
	nodeToChildrenCount(e) {
		if (Qe(e) && bt(e, "childrenCount")) return e.childrenCount;
	}
}, Ei = (e) => new Wr(e), Di = (e) => new wi(e);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/memo.mjs
function Oi(e, t, n) {
	let r = [], i;
	return (a) => {
		let o = e(a);
		return o.length !== r.length || o.some((e, t) => !Ot(r[t], e)) ? (r = o, i = t(o, a), n?.onChange?.(i), i) : i;
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/caret.mjs
function ki(e) {
	if (e) try {
		if (e.ownerDocument.activeElement !== e) return;
		let t = e.value.length;
		e.setSelectionRange(t, t);
	} catch {}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/controller.mjs
var Ai = /* @__PURE__ */ new Set([
	"menu",
	"listbox",
	"dialog",
	"grid",
	"tree",
	"region",
	"application"
]), ji = (e) => Ai.has(e), Mi = (e) => e.getAttribute("aria-controls")?.split(" ") || [];
function Ni(e, t) {
	let n = /* @__PURE__ */ new Set(), r = wn(e), i = (e) => {
		let a = e.querySelectorAll("[aria-controls]");
		for (let e of a) {
			if (e.getAttribute("aria-expanded") !== "true") continue;
			let a = Mi(e);
			for (let e of a) {
				if (!e || n.has(e)) continue;
				n.add(e);
				let a = r.getElementById(e);
				if (a) {
					let e = a.getAttribute("role"), n = a.getAttribute("aria-modal") === "true";
					if (e && ji(e) && !n && (a === t || a.contains(t) || i(a))) return !0;
				}
			}
		}
		return !1;
	};
	return i(e);
}
function Pi(e, t) {
	let n = wn(e), r = /* @__PURE__ */ new Set(), i = (e) => {
		let a = e.querySelectorAll("[aria-controls]");
		for (let e of a) {
			if (e.getAttribute("aria-expanded") !== "true") continue;
			let a = Mi(e);
			for (let e of a) {
				if (!e || r.has(e)) continue;
				r.add(e);
				let a = n.getElementById(e);
				if (a) {
					let e = a.getAttribute("role"), n = a.getAttribute("aria-modal") === "true";
					e && Ai.has(e) && !n && (t(a), i(a));
				}
			}
		}
	};
	i(e);
}
function Fi(e) {
	let t = /* @__PURE__ */ new Set();
	return Pi(e, (n) => {
		e.contains(n) || t.add(n);
	}), Array.from(t);
}
function Ii(e) {
	let t = e.getAttribute("role");
	return !!(t && Ai.has(t));
}
function Li(e) {
	return e.hasAttribute("aria-controls") && e.getAttribute("aria-expanded") === "true";
}
function Ri(e) {
	return Li(e) ? !0 : !!e.querySelector?.("[aria-controls][aria-expanded=\"true\"]");
}
function zi(e) {
	if (!e.id) return !1;
	let t = wn(e), n = CSS.escape(e.id), r = `[aria-controls~="${n}"][aria-expanded="true"], [aria-controls="${n}"][aria-expanded="true"]`;
	return !!(t.querySelector(r) && Ii(e));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/data-url.mjs
function Bi(e, t) {
	let { type: n, quality: r = .92, background: i, size: a } = t;
	if (!e) throw Error("[zag-js > getDataUrl]: Could not find the svg element");
	let o = cn(e), s = o.document, c = a ?? e.getBoundingClientRect(), l = e.cloneNode(!0);
	l.hasAttribute("viewBox") || l.setAttribute("viewBox", `0 0 ${c.width} ${c.height}`);
	let u = "<?xml version=\"1.0\" standalone=\"no\"?>\r\n" + new o.XMLSerializer().serializeToString(l), d = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(u);
	if (n === "image/svg+xml") return Promise.resolve(d).then((e) => (l.remove(), e));
	let f = o.devicePixelRatio || 1, p = s.createElement("canvas"), m = new o.Image();
	m.src = d, p.width = c.width * f, p.height = c.height * f;
	let h = p.getContext("2d");
	return (n === "image/jpeg" || i) && (h.fillStyle = i || "white", h.fillRect(0, 0, p.width, p.height)), new Promise((e) => {
		m.onload = () => {
			h?.drawImage(m, 0, 0, p.width, p.height), e(p.toDataURL(n, r)), l.remove();
		};
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/form.mjs
function Vi(e, t) {
	let { type: n = "HTMLInputElement", property: r = "value" } = t, i = cn(e)[n].prototype;
	return Object.getOwnPropertyDescriptor(i, r) ?? {};
}
function Hi(e) {
	if (e.localName === "input") return "HTMLInputElement";
	if (e.localName === "textarea") return "HTMLTextAreaElement";
	if (e.localName === "select") return "HTMLSelectElement";
}
function Ui(e, t, n = "value") {
	if (!e) return;
	let r = Hi(e);
	r && Vi(e, {
		type: r,
		property: n
	}).set?.call(e, t), e.setAttribute(n, t);
}
function Wi(e) {
	return e.matches("textarea, input, select, button");
}
function Gi(e, t) {
	if (!e) return;
	let n = Wi(e) ? e.form : e.closest("form"), r = (e) => {
		e.defaultPrevented || t();
	};
	return n?.addEventListener("reset", r, { passive: !0 }), () => n?.removeEventListener("reset", r);
}
function Ki(e, t) {
	let n = e?.closest("fieldset");
	if (!n) return;
	t(n.disabled);
	let r = new (cn(n)).MutationObserver(() => t(n.disabled));
	return r.observe(n, {
		attributes: !0,
		attributeFilter: ["disabled"]
	}), () => r.disconnect();
}
function qi(e, t) {
	if (!e) return;
	let { onFieldsetDisabledChange: n, onFormReset: r } = t, i = [Gi(e, r), Ki(e, n)];
	return () => i.forEach((e) => e?.());
}
var Ji = /* @__PURE__ */ Symbol.for("zag.changeEvent");
function Yi(e) {
	return Object.prototype.hasOwnProperty.call(e, Ji);
}
function Xi(e) {
	return Yi(e) || Object.defineProperty(e, Ji, { value: !0 }), e;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/tabbable.mjs
var Zi = (e) => Bt(e) && e.tagName === "IFRAME", Qi = /^(audio|video|details)$/;
function $i(e) {
	let t = e.getAttribute("tabindex");
	return t ? parseInt(t, 10) : NaN;
}
var ea = (e) => !Number.isNaN($i(e)), ta = (e) => $i(e) < 0;
function na(e) {
	return nn(e) && e.type === "radio";
}
function ra(e) {
	if (!na(e) || !e.name || e.checked) return !0;
	let t = `input[type="radio"][name="${CSS.escape(e.name)}"]`, n = e.form ?? e.ownerDocument, r = Array.from(n.querySelectorAll(t)).filter((t) => t.form === e.form && ca(t)), i = r.find((e) => e.checked);
	return i ? i === e : r[0] === e;
}
function ia(e, t) {
	if (!t) return null;
	if (t === !0) return e.shadowRoot || null;
	let n = t(e);
	return (n === !0 ? e.shadowRoot : n) || null;
}
function aa(e, t, n) {
	let r = [...e], i = [...e], a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
	e.forEach((e, t) => o.set(e, t));
	let s = 0;
	for (; s < i.length;) {
		let e = i[s++];
		if (!e || a.has(e)) continue;
		a.add(e);
		let c = ia(e, t);
		if (c) {
			let t = Array.from(c.querySelectorAll(oa)).filter(n), a = o.get(e);
			if (a !== void 0) {
				let e = a + 1;
				r.splice(e, 0, ...t), t.forEach((t, n) => {
					o.set(t, e + n);
				});
				for (let n = e + t.length; n < r.length; n++) o.set(r[n], n);
			} else {
				let e = r.length;
				r.push(...t), t.forEach((t, n) => {
					o.set(t, e + n);
				});
			}
			i.push(...t);
		}
	}
	return r;
}
var oa = "input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], button:not([disabled]), [tabindex], iframe, object, embed, area[href], audio[controls], video[controls], [contenteditable]:not([contenteditable='false']), details > summary:first-of-type", sa = (e, t = {}) => {
	if (!e) return [];
	let { includeContainer: n = !1, getShadowRoot: r } = t, i = Array.from(e.querySelectorAll(oa));
	(n == 1 || n == "if-empty" && i.length === 0) && Bt(e) && ca(e) && i.unshift(e);
	let a = [];
	for (let e of i) if (ca(e)) {
		if (Zi(e) && e.contentDocument) {
			let t = e.contentDocument.body;
			a.push(...sa(t, { getShadowRoot: r }));
			continue;
		}
		a.push(e);
	}
	return r ? aa(a, r, ca) : a;
};
function ca(e) {
	return !Bt(e) || e.closest("[inert]") ? !1 : e.matches(oa) && xn(e);
}
function la(e, t = {}) {
	if (!e) return [];
	let { includeContainer: n, getShadowRoot: r } = t, i = Array.from(e.querySelectorAll(oa));
	n && ua(e) && i.unshift(e);
	let a = [];
	for (let e of i) if (ua(e)) {
		if (Zi(e) && e.contentDocument) {
			let t = e.contentDocument.body;
			a.push(...la(t, { getShadowRoot: r }));
			continue;
		}
		a.push(e);
	}
	if (r) {
		let e = aa(a, r, ua);
		return !e.length && n ? i : e;
	}
	return !a.length && n ? i : a;
}
function ua(e) {
	return Bt(e) && e.tabIndex > 0 ? !0 : !ca(e) || ta(e) ? !1 : ra(e);
}
function da(e, t = {}) {
	let n = la(e, t);
	return [n[0] || null, n[n.length - 1] || null];
}
function fa(e) {
	return e.tabIndex < 0 && (Qi.test(e.localName) || dn(e)) && !ea(e) ? 0 : e.tabIndex;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/initial-focus.mjs
function pa(e) {
	let { root: t, getInitialEl: n, filter: r, enabled: i = !0 } = e;
	if (!i) return;
	let a = typeof n == "function" ? n() : n;
	return a ||= t?.querySelector("[data-autofocus],[autofocus]"), a ||= la(t).filter((e) => !r || r(e)).find((e) => !e.hasAttribute("data-no-autofocus")), a || t || void 0;
}
function ma(e) {
	let t = e.currentTarget;
	if (!t) return !1;
	let [n, r] = da(t);
	return !(vn(n) && e.shiftKey || vn(r) && !e.shiftKey || !n && !r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/mutation-observer.mjs
function ha(e, t) {
	if (!e) return;
	let { attributes: n, callback: r } = t, i = new (e.ownerDocument.defaultView || window).MutationObserver((e) => {
		for (let t of e) t.type === "attributes" && t.attributeName && n.includes(t.attributeName) && r(t);
	});
	return i.observe(e, {
		attributes: !0,
		attributeFilter: n
	}), () => i.disconnect();
}
function ga(e, t) {
	let { defer: n } = t, r = n ? en : (e) => e(), i = [];
	return i.push(r(() => {
		let n = typeof e == "function" ? e() : e;
		i.push(ha(n, t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
function _a(e, t) {
	let { callback: n } = t;
	if (!e) return;
	let r = new (e.ownerDocument.defaultView || window).MutationObserver(n);
	return r.observe(e, {
		childList: !0,
		subtree: !0
	}), () => r.disconnect();
}
function va(e, t) {
	let { defer: n } = t, r = n ? en : (e) => e(), i = [];
	return i.push(r(() => {
		let n = typeof e == "function" ? e() : e;
		i.push(_a(n, t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/navigate.mjs
function ya(e) {
	let t = () => {
		let t = cn(e);
		e.dispatchEvent(new t.MouseEvent("click"));
	};
	Ge() ? st(e, "keyup", t) : queueMicrotask(t);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/overflow.mjs
function ba(e) {
	let t = Ut(e);
	return En(t) ? je(t).body : Bt(t) && wa(t) ? t : ba(t);
}
function xa(e, t = []) {
	let n = ba(e), r = n === e.ownerDocument.body, i = cn(n);
	return r ? t.concat(i, i.visualViewport || [], wa(n) ? n : []) : t.concat(n, xa(n, []));
}
var Sa = /auto|scroll|overlay|hidden|clip/, Ca = /* @__PURE__ */ new Set(["inline", "contents"]);
function wa(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = cn(e).getComputedStyle(e);
	return Sa.test(t + r + n) && !Ca.has(i);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/point.mjs
function Ta(e, t) {
	let { left: n, top: r, width: i, height: a } = t.getBoundingClientRect(), o = {
		x: e.x - n,
		y: e.y - r
	}, s = {
		x: an(o.x / i),
		y: an(o.y / a)
	};
	function c(e = {}) {
		let { dir: t = "ltr", orientation: n = "horizontal", inverted: r } = e, i = typeof r == "object" ? r.x : r, a = typeof r == "object" ? r.y : r;
		return n === "horizontal" ? t === "rtl" || i ? 1 - s.x : s.x : a ? 1 - s.y : s.y;
	}
	return {
		offset: o,
		percent: s,
		getPercentValue: c
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/pointer-lock.mjs
function Ea(e, t) {
	let n = e.body, r = "pointerLockElement" in e || "mozPointerLockElement" in e, i = () => !!e.pointerLockElement;
	function a() {
		t?.(i());
	}
	function o(n) {
		i() && t?.(!1), console.error("PointerLock error occurred:", n), e.exitPointerLock();
	}
	if (!r) return;
	try {
		n.requestPointerLock();
	} catch {}
	let s = [Ne(e, "pointerlockchange", a, !1), Ne(e, "pointerlockerror", o, !1)];
	return () => {
		s.forEach((e) => e()), e.exitPointerLock();
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/proxy-tab-focus.mjs
function Da(e) {
	return e == null ? null : typeof e == "function" ? e() : e;
}
function Oa(e, t, n) {
	if (!t) return null;
	let r = la(e.ownerDocument.body, { getShadowRoot: n }), i = r.indexOf(t);
	if (i === -1) return null;
	for (let t = i + 1; t < r.length; t++) {
		let n = r[t];
		if (!kt(e, n)) return n;
	}
	return null;
}
function ka(e, t = {}) {
	let { triggerElement: n, onFocus: r, onFocusEnter: i, getShadowRoot: a } = t, o = (Da(e) ?? Da(n))?.ownerDocument || document;
	function s(t) {
		if (t.key !== "Tab") return;
		let o = Da(e), s = Da(n);
		if (!o) return;
		let [c, l] = da(o, {
			includeContainer: !0,
			getShadowRoot: a
		}), u = !c && !l, d = null;
		if (t.shiftKey && (vn(c) || u)) d = s;
		else if (!t.shiftKey && vn(s)) i?.(), d = c;
		else if (!t.shiftKey && (vn(l) || u)) d = Oa(o, s, a);
		else if (t.shiftKey) {
			let e = Oa(o, s, a);
			vn(e) && (i?.(), d = l);
		}
		d && (t.preventDefault(), typeof r == "function" ? r(d) : d.focus());
	}
	return Ne(o, "keydown", s, !0);
}
function Aa(e, t) {
	let { defer: n, ...r } = t, i = n ? en : (e) => e(), a = [];
	return a.push(i(() => {
		a.push(ka(e, r));
	})), () => {
		a.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/resize-observer.mjs
function ja(e) {
	let t = /* @__PURE__ */ new WeakMap(), n, r = /* @__PURE__ */ new WeakMap(), i = (e) => n || (n = new e.ResizeObserver((e) => {
		for (let n of e) {
			r.set(n.target, n);
			let e = t.get(n.target);
			if (e) for (let t of e) t(n);
		}
	}), n);
	return {
		observe: (n, r) => {
			let a = t.get(n) || /* @__PURE__ */ new Set();
			a.add(r), t.set(n, a);
			let o = cn(n);
			return i(o).observe(n, e), () => {
				let e = t.get(n);
				e && (e.delete(r), e.size === 0 && (t.delete(n), i(o).unobserve(n)));
			};
		},
		unobserve: (e) => {
			t.delete(e), n?.unobserve(e);
		}
	};
}
var Ma = /* @__PURE__ */ ja({ box: "border-box" });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/scroll.mjs
function Na(e) {
	return e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth;
}
function Pa(e, t) {
	let { rootEl: n, ...r } = t || {};
	e && n && wa(n) && Na(n) && e.scrollIntoView(r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/searchable.mjs
var Fa = (e) => e.split("").map((e) => {
	let t = e.charCodeAt(0);
	return t > 0 && t < 128 ? e : t >= 128 && t <= 255 ? `/x${t.toString(16)}`.replace("/", "\\") : "";
}).join("").trim(), Ia = (e) => Fa(e.dataset?.valuetext ?? e.textContent ?? ""), La = (e, t) => e.trim().toLowerCase().startsWith(t.toLowerCase());
function Ra(e, t, n, r = Kt) {
	let i = n ? jt(e, n, r) : -1, a = n ? Mt(e, i) : e;
	return t.length === 1 && (a = a.filter((e) => r(e) !== n)), a.find((e) => La(Ia(e), t));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/typeahead.mjs
function za(e, t) {
	let { state: n, activeId: r, key: i, timeout: a = 350, itemToId: o } = t, s = n.keysSoFar + i, c = s.length > 1 && Array.from(s).every((e) => e === s[0]) ? s[0] : s, l = Ra(e.slice(), c, r, o);
	function u() {
		clearTimeout(n.timer), n.timer = -1;
	}
	function d(e) {
		n.keysSoFar = e, u(), e !== "" && (n.timer = +setTimeout(() => {
			d(""), u();
		}, a));
	}
	return d(s), l;
}
var Ba = /* @__PURE__ */ Object.assign(za, {
	defaultOptions: {
		keysSoFar: "",
		timer: -1
	},
	isValidEvent: Va
});
function Va(e) {
	return e.key.length === 1 && !e.ctrlKey && !e.metaKey;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/visually-hidden.mjs
var Ha = {
	border: "0",
	clip: "rect(0 0 0 0)",
	height: "1px",
	margin: "-1px",
	overflow: "hidden",
	padding: "0",
	position: "absolute",
	width: "1px",
	whiteSpace: "nowrap",
	wordWrap: "normal"
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/wait-for.mjs
function Ua(e, t, n) {
	let { signal: r } = t;
	return [new Promise((t, i) => {
		let a = setTimeout(() => {
			i(/* @__PURE__ */ Error(`Timeout of ${n}ms exceeded`));
		}, n);
		r.addEventListener("abort", () => {
			clearTimeout(a), i(new DOMException("Promise aborted", "AbortError"));
		}), e.then((e) => {
			r.aborted || (clearTimeout(a), t(e));
		}).catch((e) => {
			r.aborted || (clearTimeout(a), i(e));
		});
	}), () => t.abort()];
}
function Wa(e, t) {
	let { timeout: n, rootNode: r } = t, i = cn(r), a = je(r), o = new i.AbortController();
	return Ua(new Promise((t) => {
		let n = e();
		if (n) {
			t(n);
			return;
		}
		let r = new i.MutationObserver(() => {
			let n = e();
			n && n.isConnected && (r.disconnect(), t(n));
		});
		r.observe(a.body, {
			childList: !0,
			subtree: !0
		});
	}), o, n);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/when-node.mjs
function Ga(e, t, n = {}) {
	let { defer: r, onMissing: i } = n, a = () => typeof e == "function" ? e() : e, o = [], s = (e) => {
		if (!e) return i?.();
		o.push(t(e));
	}, c = a();
	if (!r || c) s(c);
	else {
		let e = !1;
		o.push(() => {
			e = !0;
		}), queueMicrotask(() => {
			if (e) return;
			let t = a();
			if (t) {
				s(t);
				return;
			}
			o.push(en(() => {
				e || s(a());
			}));
		});
	}
	return () => {
		o.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/use-combobox-context.js
var [Ka, qa] = Rt({
	name: "ComboboxContext",
	hookName: "useComboboxContext",
	providerName: "<ComboboxProvider />"
}), [Ja, Ya] = Rt({
	name: "RenderStrategyContext",
	hookName: "useRenderStrategyContext",
	providerName: "<RenderStrategyPropsProvider />"
}), Xa = yn(), Za = (e) => Xa(e, ["lazyMount", "unmountOnExit"]);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+presence@1.43.3/node_modules/@zag-js/presence/dist/presence.connect.mjs
function Qa(e, t) {
	let { state: n, send: r, context: i } = e, a = n.matches("mounted", "unmountSuspended");
	return {
		skip: !i.get("initial"),
		present: a,
		setNode(e) {
			e && r({
				type: "NODE.SET",
				node: e
			});
		},
		unmount() {
			r({ type: "UNMOUNT" });
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+presence@1.43.3/node_modules/@zag-js/presence/dist/presence.machine.mjs
var $a = Pn({
	props({ props: e }) {
		return {
			...e,
			present: !!e.present
		};
	},
	initialState({ prop: e }) {
		return e("present") ? "mounted" : "unmounted";
	},
	refs() {
		return {
			node: null,
			styles: null
		};
	},
	context({ bindable: e }) {
		return {
			unmountAnimationName: e(() => ({ defaultValue: null })),
			prevAnimationName: e(() => ({ defaultValue: null })),
			present: e(() => ({ defaultValue: !1 })),
			initial: e(() => ({
				sync: !0,
				defaultValue: !1
			}))
		};
	},
	exit: ["cleanupNode"],
	watch({ track: e, prop: t, send: n }) {
		e([() => t("present")], () => {
			n({ type: "PRESENCE.CHANGED" });
		});
	},
	on: {
		"NODE.SET": { actions: ["setupNode"] },
		"PRESENCE.CHANGED": { actions: ["setInitial", "syncPresence"] }
	},
	states: {
		mounted: {
			effects: ["trackEnterAnimation"],
			on: {
				UNMOUNT: {
					target: "unmounted",
					actions: ["clearPrevAnimationName", "invokeOnExitComplete"]
				},
				"UNMOUNT.SUSPEND": { target: "unmountSuspended" }
			}
		},
		unmountSuspended: {
			effects: ["trackExitAnimation"],
			on: {
				MOUNT: {
					target: "mounted",
					actions: ["setPrevAnimationName"]
				},
				UNMOUNT: {
					target: "unmounted",
					actions: ["clearPrevAnimationName", "invokeOnExitComplete"]
				}
			}
		},
		unmounted: { on: { MOUNT: {
			target: "mounted",
			actions: ["setPrevAnimationName"]
		} } }
	},
	implementations: {
		actions: {
			setInitial: ({ context: e }) => {
				e.get("initial") || queueMicrotask(() => {
					e.set("initial", !0);
				});
			},
			invokeOnExitComplete: ({ prop: e, refs: t }) => {
				e("onExitComplete")?.();
				let n = t.get("node");
				if (!n) return;
				let r = new (cn(n)).CustomEvent("exitcomplete", { bubbles: !1 });
				n.dispatchEvent(r);
			},
			setupNode: ({ refs: e, event: t }) => {
				e.get("node") !== t.node && (e.set("node", t.node), e.set("styles", Tt(t.node)));
			},
			cleanupNode: ({ refs: e }) => {
				e.set("node", null), e.set("styles", null);
			},
			syncPresence: ({ context: e, refs: t, send: n, prop: r }) => {
				let i = r("present");
				if (i) return n({
					type: "MOUNT",
					src: "presence.changed"
				});
				let a = t.get("node");
				if (!i && a?.ownerDocument.visibilityState === "hidden") return n({
					type: "UNMOUNT",
					src: "visibilitychange"
				});
				en(() => {
					if (r("present")) return;
					let i = eo(t.get("styles"));
					e.set("unmountAnimationName", i), i === "none" || i === e.get("prevAnimationName") || t.get("styles")?.display === "none" || t.get("styles")?.animationDuration === "0s" ? n({
						type: "UNMOUNT",
						src: "presence.changed"
					}) : n({ type: "UNMOUNT.SUSPEND" });
				});
			},
			setPrevAnimationName: ({ context: e, refs: t }) => {
				en(() => {
					e.set("prevAnimationName", eo(t.get("styles")));
				});
			},
			clearPrevAnimationName: ({ context: e }) => {
				e.set("prevAnimationName", null);
			}
		},
		effects: {
			trackEnterAnimation: ({ context: e, refs: t, prop: n }) => {
				if (!n("onEnterComplete") || !e.get("initial")) return;
				let r, i = () => {
					r = en(() => {
						let e = t.get("node");
						if (!e || !e.isConnected) {
							i();
							return;
						}
						let r = Tt(e);
						if (eo(r) === "none" || r.display === "none" || r.animationDuration === "0s") {
							n("onEnterComplete")?.();
							return;
						}
						let a = (t) => {
							lt(t) === e && n("present") && (e.removeEventListener("animationend", a), n("onEnterComplete")?.());
						};
						return e.addEventListener("animationend", a), () => {
							e.removeEventListener("animationend", a);
						};
					});
				};
				return i(), () => r?.();
			},
			trackExitAnimation: ({ context: e, refs: t, send: n, prop: r }) => {
				let i = t.get("node");
				if (!i) return;
				let a = (n) => {
					(n.composedPath?.()?.[0] ?? n.target) === i && e.set("prevAnimationName", eo(t.get("styles")));
				}, o = (a) => {
					let o = eo(t.get("styles"));
					lt(a) === i && o === e.get("unmountAnimationName") && !r("present") && n({
						type: "UNMOUNT",
						src: "animationend"
					});
				}, s = (e) => {
					lt(e) === i && !r("present") && n({
						type: "UNMOUNT",
						src: "animationcancel"
					});
				};
				i.addEventListener("animationstart", a), i.addEventListener("animationcancel", s), i.addEventListener("animationend", o);
				let c = rn(i, { animationFillMode: "forwards" });
				return () => {
					i.removeEventListener("animationstart", a), i.removeEventListener("animationcancel", s), i.removeEventListener("animationend", o), ze(() => c());
				};
			}
		}
	}
});
function eo(e) {
	return e?.animationName || "none";
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/presence/use-presence.svelte.js
var to = (e) => {
	let t = _(() => St(e)), n = _(() => Za(z(t))), r = _(() => C(z(n), 2)), i = _(() => z(r)[0]), a = _(() => z(r)[1]), o = Tn($a, () => z(a)), s = _(() => Qa(o, Wt)), c = B(!1);
	Te(() => {
		z(s).present && J(c, !0);
	});
	let l = (e) => {
		e && o.send({
			type: "NODE.SET",
			node: e
		});
	}, u = _(() => !z(s).present && !z(c) && z(i).lazyMount || z(i).unmountOnExit && !z(s).present && z(c)), d = _(() => ({
		getPresenceProps: () => ({
			"data-state": z(s).skip && z(t).skipAnimationOnMount ? void 0 : z(t).present ? "open" : "closed",
			hidden: !z(s).present
		}),
		present: z(s).present,
		setNode: l,
		unmounted: z(u)
	}));
	return () => z(d);
}, no = (e) => yn()(e, [
	"immediate",
	"lazyMount",
	"onEnterComplete",
	"onExitComplete",
	"present",
	"skipAnimationOnMount",
	"unmountOnExit"
]), [ro, io] = Rt({ name: "PresenceContext" }), ao = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function oo(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, ao), i = qa(), a = io(), o = _(() => X(i().getContentProps(), a().getPresenceProps(), r));
	function s(e) {
		a().setNode(e);
	}
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	}, l = F(), u = K(l), d = (e) => {
		Q(e, Y({ as: "div" }, () => z(o), {
			[ce()]: s,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = _(() => !a().unmounted);
	return P(u, (e) => {
		z(f) && e(d);
	}), I(e, l), y(c);
}
U(oo, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+combobox@1.43.3/node_modules/@zag-js/combobox/dist/combobox.anatomy.mjs
var so = ln("combobox").parts("root", "clearTrigger", "content", "control", "input", "item", "itemGroup", "itemGroupLabel", "itemIndicator", "itemText", "label", "list", "positioner", "trigger"), co = so.build(), lo = (e) => new Wr(e);
lo.empty = () => new Wr({ items: [] });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+focus-visible@1.43.3/node_modules/@zag-js/focus-visible/dist/index.mjs
function uo(e) {
	return !(e.metaKey || !mn() && e.altKey || e.ctrlKey || e.key === "Control" || e.key === "Shift" || e.key === "Meta");
}
var fo = /* @__PURE__ */ new Set([
	"checkbox",
	"radio",
	"range",
	"color",
	"file",
	"image",
	"button",
	"submit",
	"reset"
]), po = [
	"a[href]",
	"audio[controls]",
	"button",
	"details",
	"embed",
	"iframe",
	"img[controls]",
	"img[usemap]",
	"input",
	"select",
	"textarea",
	"video[controls]"
].join(",");
function mo(e, t, n) {
	let r = n ? lt(n) : null, i = je(r), a = cn(r), o = dt(i);
	return e = e || o instanceof a.HTMLInputElement && !fo.has(o?.type) || o instanceof a.HTMLTextAreaElement || o instanceof a.HTMLElement && o.isContentEditable, !(e && t === "keyboard" && n instanceof a.KeyboardEvent && !Reflect.has(So, n.key));
}
var ho = null, go = /* @__PURE__ */ new Set(), _o = /* @__PURE__ */ new Map(), vo = !1, yo = null, bo = !1, xo = null, So = {
	Tab: !0,
	Escape: !0
};
function Co(e, t) {
	for (let n of go) n(e, t);
}
function wo(e) {
	yo = null, vo = !0, uo(e) && (ho = "keyboard", Co("keyboard", e));
}
function To(e) {
	(e.type !== "pointermove" && e.type !== "mousemove" || xo?.x !== e.clientX || xo?.y !== e.clientY) && (xo = {
		x: e.clientX,
		y: e.clientY
	}, ho = "pointer", (e.type === "mousedown" || e.type === "pointerdown") && (yo = null, vo = !0, Co("pointer", e)));
}
function Eo(e) {
	if (yt(e)) {
		yo = null, vo = !0, ho = "virtual";
		return;
	}
	yo = null;
	let t = lt(e), n = t?.closest("label"), r = n?.control;
	if (!n || !r || r.matches(":disabled")) return;
	let i = t?.closest(po);
	i && n.contains(i) && i !== r || r !== dt(n.ownerDocument) && (yo = r);
}
function Do(e) {
	let t = lt(e), n = t === yo;
	t !== cn(t) && t !== je(t) && e.isTrusted && (!vo && !n && !bo && (ho = "virtual", Co("virtual", e)), vo = !1, yo = null, bo = !1);
}
function Oo() {
	vo = !1, yo = null, bo = !0;
}
function ko(e) {
	if (typeof window > "u" || _o.get(cn(e))) return;
	let t = cn(e), n = je(e), r = t.HTMLElement.prototype.focus;
	function i() {
		vo = !0, r.apply(this, arguments);
	}
	try {
		Object.defineProperty(t.HTMLElement.prototype, "focus", {
			configurable: !0,
			value: i
		});
	} catch {}
	n.addEventListener("keydown", wo, !0), n.addEventListener("keyup", wo, !0), n.addEventListener("click", Eo, !0), t.addEventListener("focus", Do, !0), t.addEventListener("blur", Oo, !1), t.PointerEvent === void 0 ? (n.addEventListener("mousedown", To, !0), n.addEventListener("mousemove", To, !0), n.addEventListener("mouseup", To, !0)) : (n.addEventListener("pointerdown", To, !0), n.addEventListener("pointermove", To, !0), n.addEventListener("pointerup", To, !0)), t.addEventListener("beforeunload", () => {
		Ao(e);
	}, { once: !0 }), _o.set(t, { focus: r });
}
var Ao = (e, t) => {
	let n = cn(e), r = je(e);
	t && r.removeEventListener("DOMContentLoaded", t);
	let i = _o.get(n);
	if (i) {
		try {
			Object.defineProperty(n.HTMLElement.prototype, "focus", {
				configurable: !0,
				value: i.focus
			});
		} catch {}
		r.removeEventListener("keydown", wo, !0), r.removeEventListener("keyup", wo, !0), r.removeEventListener("click", Eo, !0), n.removeEventListener("focus", Do, !0), n.removeEventListener("blur", Oo, !1), n.PointerEvent === void 0 ? (r.removeEventListener("mousedown", To, !0), r.removeEventListener("mousemove", To, !0), r.removeEventListener("mouseup", To, !0)) : (r.removeEventListener("pointerdown", To, !0), r.removeEventListener("pointermove", To, !0), r.removeEventListener("pointerup", To, !0)), _o.delete(n);
	}
};
function jo() {
	return ho;
}
function Mo(e) {
	ho = e, Co(e, null);
}
function No() {
	return ho === "keyboard" || ho === "virtual";
}
function Po(e = {}) {
	let { isTextInput: t, autoFocus: n, onChange: r, root: i } = e;
	ko(i), r?.({
		isFocusVisible: n || No(),
		modality: ho
	});
	let a = (e, n) => {
		mo(!!t, e, n) && r?.({
			isFocusVisible: No(),
			modality: e
		});
	};
	return go.add(a), () => {
		go.delete(a);
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/get-anchor.mjs
function Fo(e = 0, t = 0, n = 0, r = 0) {
	if (typeof DOMRect == "function") return new DOMRect(e, t, n, r);
	let i = {
		x: e,
		y: t,
		width: n,
		height: r,
		top: t,
		right: e + n,
		bottom: t + r,
		left: e
	};
	return {
		...i,
		toJSON: () => i
	};
}
function Io(e) {
	if (!e) return Fo();
	let { x: t, y: n, width: r, height: i } = e;
	return Fo(t, n, r, i);
}
function Lo(e, t) {
	return {
		contextElement: Bt(e) ? e : e?.contextElement,
		getBoundingClientRect: () => {
			let n = e, r = t?.(n);
			return r || !n ? Io(r) : n.getBoundingClientRect();
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/middleware.mjs
var Ro = (e) => ({
	variable: e,
	reference: `var(${e})`
}), zo = {
	arrowSize: Ro("--arrow-size"),
	arrowSizeHalf: Ro("--arrow-size-half"),
	arrowBg: Ro("--arrow-background"),
	transformOrigin: Ro("--transform-origin"),
	arrowOffset: Ro("--arrow-offset")
}, Bo = (e) => e === "top" || e === "bottom" ? "y" : "x";
function Vo(e, t) {
	return {
		name: "transformOrigin",
		fn(n) {
			let { elements: r, middlewareData: i, placement: a, rects: o, y: s } = n, c = a.split("-")[0], l = Bo(c), u = i.arrow?.x || 0, d = i.arrow?.y || 0, f = t?.clientWidth || 0, p = t?.clientHeight || 0, m = u + f / 2, h = d + p / 2, g = Math.abs(i.shift?.y || 0), _ = o.reference.height / 2, v = p / 2, y = e.offset?.mainAxis ?? e.gutter, ee = typeof y == "number" ? y + v : y ?? v, b = g > ee, x = {
				top: `${m}px calc(100% + ${ee}px)`,
				bottom: `${m}px ${-ee}px`,
				left: `calc(100% + ${ee}px) ${h}px`,
				right: `${-ee}px ${h}px`
			}[c], S = `${m}px ${o.reference.y + _ - s}px`, C = !!e.overlap && l === "y" && b;
			return r.floating.style.setProperty(zo.transformOrigin.variable, C ? S : x), { data: { transformOrigin: C ? S : x } };
		}
	};
}
var Ho = {
	name: "rects",
	fn({ rects: e }) {
		return { data: e };
	}
}, Uo = (e) => {
	if (e) return {
		name: "shiftArrow",
		fn({ placement: t, middlewareData: n }) {
			if (!n.arrow) return {};
			let { x: r, y: i } = n.arrow, a = t.split("-")[0];
			return Object.assign(e.style, {
				left: r == null ? "" : `${r}px`,
				top: i == null ? "" : `${i}px`,
				[a]: `calc(100% + ${zo.arrowOffset.reference})`
			}), {};
		}
	};
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/placement.mjs
function Wo(e) {
	let [t, n] = e.split("-");
	return {
		side: t,
		align: n,
		hasAlign: n != null
	};
}
function Go(e) {
	return e.split("-")[0];
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/get-placement.mjs
var Ko = {
	strategy: "absolute",
	placement: "bottom",
	listeners: !0,
	restoreStyles: !1,
	applyStyles: !0,
	gutter: 8,
	flip: !0,
	slide: !0,
	overlap: !1,
	sameWidth: !1,
	fitViewport: !1,
	overflowPadding: 8,
	arrowPadding: 4
};
function qo(e, t) {
	let n = e.devicePixelRatio || 1;
	return Math.round(t * n) / n;
}
function Jo(e, t) {
	return e != null && Math.abs(e - t) < .5;
}
function Yo(e) {
	return typeof e == "function" ? e() : e === "clipping-ancestors" ? "clippingAncestors" : e;
}
function Xo(e, t, n) {
	let r = e || t.createElement("div");
	return Gn({
		element: r,
		padding: n.arrowPadding
	});
}
function Zo(e, t) {
	if (!hn(t.offset ?? t.gutter)) return Wn(({ placement: n }) => {
		let r = (e?.clientHeight || 0) / 2, i = t.offset?.mainAxis ?? t.gutter, a = typeof i == "number" ? i + r : i ?? r, { hasAlign: o } = Wo(n), s = o ? void 0 : t.shift, c = t.offset?.crossAxis ?? s;
		return vt({
			crossAxis: c,
			mainAxis: a,
			alignmentAxis: t.shift
		});
	});
}
function Qo(e) {
	if (e.flip) return zn(() => {
		let t = Yo(e.boundary);
		return {
			...t ? { boundary: t } : void 0,
			padding: e.overflowPadding,
			fallbackPlacements: e.flip === !0 ? void 0 : e.flip
		};
	});
}
function $o(e) {
	if (e.slide || e.overlap) return Rn(() => {
		let t = Yo(e.boundary);
		return {
			...t ? { boundary: t } : void 0,
			mainAxis: e.slide,
			crossAxis: e.overlap,
			padding: e.overflowPadding,
			limiter: Hn()
		};
	});
}
function es(e) {
	if (e.sizeMiddleware === !1 && !e.sameWidth && !e.fitViewport) return;
	let t, n, r, i;
	return Bn(() => {
		let a = Yo(e.boundary);
		return {
			padding: e.overflowPadding,
			...a ? { boundary: a } : void 0,
			apply({ elements: e, rects: a, availableHeight: o, availableWidth: s }) {
				let c = e.floating, l = Math.round(a.reference.width), u = Math.round(a.reference.height);
				s = Math.floor(s), o = Math.floor(o), Jo(t, l) || (c.style.setProperty("--reference-width", `${l}px`), t = l), Jo(n, u) || (c.style.setProperty("--reference-height", `${u}px`), n = u), Jo(r, s) || (c.style.setProperty("--available-width", `${s}px`), r = s), Jo(i, o) || (c.style.setProperty("--available-height", `${o}px`), i = o);
			}
		};
	});
}
function ts(e) {
	if (e.hideWhenDetached) return Ln(() => ({
		strategy: "referenceHidden",
		boundary: Yo(e.boundary) ?? "clippingAncestors"
	}));
}
function ns(e) {
	return e ? e === !0 ? {
		ancestorResize: !0,
		ancestorScroll: !0,
		elementResize: !0,
		layoutShift: !0
	} : e : {};
}
var rs = [
	"transform",
	"visibility",
	"pointer-events",
	"--x",
	"--y",
	"--z-index",
	"--reference-width",
	"--reference-height",
	"--available-width",
	"--available-height",
	"--transform-origin"
], is = [
	"top",
	"right",
	"bottom",
	"left"
];
function as(e, t) {
	if (!e) return Ie;
	let n = new Map(t.map((t) => [t, e.style.getPropertyValue(t)]));
	return () => {
		n.forEach((t, n) => {
			t ? e.style.setProperty(n, t) : e.style.removeProperty(n);
		}), e.style.length === 0 && e.removeAttribute("style");
	};
}
function os(e) {
	return e == null ? null : Bt(e) ? e : typeof e == "object" && e && "contextElement" in e && e.contextElement ? e.contextElement : e;
}
function ss(e, t, n = {}) {
	let r = () => (typeof t == "function" ? t() : t) ?? null, i = () => {
		let t = typeof e == "function" ? e() : e;
		return n.getAnchorElement?.() ?? t;
	}, a = () => {
		let e = i();
		return !e && !n.getAnchorRect ? null : Lo(e, n.getAnchorRect);
	}, o = Object.assign({}, Ko, n), s = [], c = null, l, u;
	function d(e) {
		l?.(), u?.(), c = e, l = o.restoreStyles ? as(e, rs) : void 0;
		let t = e.querySelector("[data-part=arrow]");
		u = o.restoreStyles ? as(t, is) : void 0, s = [
			Zo(t, o),
			Qo(o),
			$o(o),
			Xo(t, e.ownerDocument, o),
			Uo(t),
			Vo({
				gutter: o.gutter,
				offset: o.offset,
				overlap: o.overlap
			}, t),
			es(o),
			ts(o),
			Ho
		];
	}
	let { placement: f, strategy: p, onComplete: m, onPositioned: h } = o, g, _, v = !1, y, ee, b = Ie, x = ns(o.listeners);
	function S() {
		if (!o.listeners) return;
		let e = i(), t = a(), n = r();
		t && n && (os(e) !== os(y) || n !== ee) && (b(), y = e, ee = n, b = Vn(t, n, w, x));
	}
	async function C() {
		S();
		let e = r();
		if (!e) return;
		e !== c && (d(e), v = !1);
		let t = a();
		if (!t) return;
		let n = await Un(t, e, {
			placement: f,
			middleware: s,
			strategy: p
		}), i = cn(e), l = qo(i, n.x), u = qo(i, n.y);
		if (m?.({
			...n,
			x: l,
			y: u
		}), o.applyStyles !== !1 && (Jo(g, l) || (e.style.setProperty("--x", `${l}px`), g = l), Jo(_, u) || (e.style.setProperty("--y", `${u}px`), _ = u), o.hideWhenDetached && (n.middlewareData.hide?.referenceHidden ? (e.style.setProperty("visibility", "hidden"), e.style.setProperty("pointer-events", "none")) : (e.style.removeProperty("visibility"), e.style.removeProperty("pointer-events"))), !v)) {
			let t = e.firstElementChild;
			t && (e.style.setProperty("--z-index", Tt(t).zIndex), v = !0);
		}
	}
	async function w() {
		n.updatePosition ? (await n.updatePosition({
			updatePosition: C,
			floatingElement: r()
		}), h?.({ placed: !0 })) : await C();
	}
	return w(), () => {
		b(), u?.(), l?.(), h?.({ placed: !1 });
	};
}
function cs(e, t, n = {}) {
	let { defer: r, ...i } = n, a = r ? en : (e) => e(), o = [];
	return o.push(a(() => {
		o.push(ss(e, t, i));
	})), () => {
		o.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/get-styles.mjs
var ls = {
	bottom: "rotate(45deg)",
	left: "rotate(135deg)",
	top: "rotate(225deg)",
	right: "rotate(315deg)"
};
function us(e = {}) {
	let { placement: t, sameWidth: n, fitViewport: r, strategy: i = "absolute" } = e;
	return {
		arrow: {
			position: "absolute",
			width: zo.arrowSize.reference,
			height: zo.arrowSize.reference,
			[zo.arrowSizeHalf.variable]: `calc(${zo.arrowSize.reference} / 2)`,
			[zo.arrowOffset.variable]: `calc(${zo.arrowSizeHalf.reference} * -1)`
		},
		arrowTip: {
			transform: t ? ls[t.split("-")[0]] : void 0,
			background: zo.arrowBg.reference,
			top: "0",
			left: "0",
			width: "100%",
			height: "100%",
			position: "absolute",
			zIndex: "inherit"
		},
		floating: {
			position: i,
			isolation: "isolate",
			minWidth: n ? void 0 : "max-content",
			width: n ? "var(--reference-width)" : void 0,
			maxWidth: r ? "var(--available-width)" : void 0,
			maxHeight: r ? "var(--available-height)" : void 0,
			pointerEvents: t ? void 0 : "none",
			top: "0px",
			left: "0px",
			transform: t ? "translate3d(var(--x), var(--y), 0)" : "translate3d(0, -100vh, 0)",
			zIndex: "var(--z-index)"
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+combobox@1.43.3/node_modules/@zag-js/combobox/dist/combobox.dom.mjs
var ds = (e) => e.ids?.root ?? `combobox:${e.id}`, fs = (e) => e.ids?.label ?? `combobox:${e.id}:label`, ps = (e) => e.ids?.control ?? `combobox:${e.id}:control`, ms = (e) => e.ids?.input ?? `combobox:${e.id}:input`, hs = (e) => e.ids?.content ?? `combobox:${e.id}:content`, gs = (e) => e.ids?.positioner ?? `combobox:${e.id}:popper`, _s = (e) => e.ids?.trigger ?? `combobox:${e.id}:toggle-btn`, vs = (e) => e.ids?.clearTrigger ?? `combobox:${e.id}:clear-btn`, ys = (e, t) => e.ids?.itemGroup?.(t) ?? `combobox:${e.id}:optgroup:${t}`, bs = (e, t) => e.ids?.itemGroupLabel?.(t) ?? `combobox:${e.id}:optgroup-label:${t}`, xs = (e, t) => e.ids?.item?.(t) ?? `combobox:${e.id}:option:${t}`, Ss = (e) => e.getById(hs(e)), Cs = (e) => e.getById(ms(e)), ws = (e) => e.getById(gs(e)), Ts = (e) => e.getById(ps(e)), Es = (e) => e.getById(_s(e)), Ds = (e) => e.getById(vs(e)), Os = (e, t) => {
	if (t == null) return null;
	let n = `[role=option][data-value="${CSS.escape(t)}"]`;
	return jn(Ss(e), n);
}, ks = (e) => {
	let t = Cs(e);
	e.isActiveElement(t) || t?.focus({ preventScroll: !0 }), ki(t);
}, As = (e) => {
	let t = Es(e);
	e.isActiveElement(t) || t?.focus({ preventScroll: !0 });
}, js = {
	triggerLabel: "Toggle suggestions",
	clearTriggerLabel: "Clear value"
};
function Ms(e, t) {
	let { context: n, prop: r, state: i, send: a, scope: o, computed: s } = e, c = He(js, r("translations")), l = r("collection"), u = !!r("disabled"), d = s("isInteractive"), f = !!r("invalid"), p = !!r("required"), m = !!r("readOnly"), h = i.hasTag("open"), g = i.hasTag("focused"), _ = r("composite"), v = n.get("highlightedValue"), y = n.get("currentPlacement"), ee = y ? Go(y) : void 0, b = us({
		...r("positioning"),
		placement: y
	});
	function x(e) {
		let t = l.getItemDisabled(e.item), r = l.getItemValue(e.item);
		return gt(r, () => `[zag-js] No value found for item ${JSON.stringify(e.item)}`), {
			value: r,
			disabled: !!(u || t),
			highlighted: v === r,
			selected: n.get("value").includes(r)
		};
	}
	return {
		focused: g,
		open: h,
		inputValue: n.get("inputValue"),
		highlightedValue: v,
		highlightedItem: n.get("highlightedItem"),
		value: n.get("value"),
		valueAsString: s("valueAsString"),
		hasSelectedItems: s("hasSelectedItems"),
		selectedItems: s("selectedItems"),
		collection: r("collection"),
		multiple: !!r("multiple"),
		disabled: !!u,
		syncSelectedItems() {
			a({ type: "SELECTED_ITEMS.SYNC" });
		},
		reposition(e = {}) {
			a({
				type: "POSITIONING.SET",
				options: e
			});
		},
		setHighlightValue(e) {
			a({
				type: "HIGHLIGHTED_VALUE.SET",
				value: e
			});
		},
		clearHighlightValue() {
			a({ type: "HIGHLIGHTED_VALUE.CLEAR" });
		},
		selectValue(e) {
			a({
				type: "ITEM.SELECT",
				value: e
			});
		},
		setValue(e) {
			a({
				type: "VALUE.SET",
				value: e
			});
		},
		setInputValue(e, t = "script") {
			a({
				type: "INPUT_VALUE.SET",
				value: e,
				src: t
			});
		},
		clearValue(e) {
			a(e == null ? { type: "VALUE.CLEAR" } : {
				type: "ITEM.CLEAR",
				value: e
			});
		},
		focus() {
			Cs(o)?.focus();
		},
		setOpen(e, t = "script") {
			i.hasTag("open") !== e && a({
				type: e ? "OPEN" : "CLOSE",
				src: t
			});
		},
		getRootProps() {
			return t.element({
				...co.root.attrs,
				dir: r("dir"),
				id: ds(o),
				"data-invalid": Z(f),
				"data-readonly": Z(m)
			});
		},
		getLabelProps() {
			return t.label({
				...co.label.attrs,
				dir: r("dir"),
				htmlFor: ms(o),
				id: fs(o),
				"data-readonly": Z(m),
				"data-disabled": Z(u),
				"data-invalid": Z(f),
				"data-required": Z(p),
				"data-focus": Z(g),
				onClick(e) {
					_ || (e.preventDefault(), Es(o)?.focus({ preventScroll: !0 }));
				}
			});
		},
		getControlProps() {
			return t.element({
				...co.control.attrs,
				dir: r("dir"),
				id: ps(o),
				"data-state": h ? "open" : "closed",
				"data-focus": Z(g),
				"data-disabled": Z(u),
				"data-invalid": Z(f)
			});
		},
		getPositionerProps() {
			return t.element({
				...co.positioner.attrs,
				dir: r("dir"),
				id: gs(o),
				style: b.floating
			});
		},
		getInputProps() {
			return t.input({
				...co.input.attrs,
				dir: r("dir"),
				"aria-invalid": pn(f),
				"data-invalid": Z(f),
				"data-autofocus": Z(r("autoFocus")),
				name: r("name"),
				form: r("form"),
				disabled: u,
				required: r("required"),
				autoComplete: "off",
				autoCorrect: "off",
				autoCapitalize: "none",
				spellCheck: "false",
				readOnly: m,
				placeholder: r("placeholder"),
				id: ms(o),
				type: "text",
				role: "combobox",
				defaultValue: n.get("inputValue"),
				"aria-autocomplete": s("autoComplete") ? "both" : "list",
				"aria-controls": hs(o),
				"aria-expanded": h,
				"data-state": h ? "open" : "closed",
				"aria-activedescendant": v ? xs(o, v) : void 0,
				onClick(e) {
					e.defaultPrevented || r("openOnClick") && d && a({
						type: "INPUT.CLICK",
						src: "input-click"
					});
				},
				onFocus() {
					u || a({ type: "INPUT.FOCUS" });
				},
				onBlur() {
					u || a({ type: "INPUT.BLUR" });
				},
				onChange(e) {
					a({
						type: "INPUT.CHANGE",
						value: e.currentTarget.value,
						src: "input-change"
					});
				},
				onKeyDown(e) {
					if (e.defaultPrevented || !d || e.ctrlKey || e.shiftKey || Ye(e)) return;
					let t = r("openOnKeyPress"), n = e.ctrlKey || e.metaKey || e.shiftKey, i = {
						ArrowDown(e) {
							(t || h) && (a({
								type: e.altKey ? "OPEN" : "INPUT.ARROW_DOWN",
								keypress: !0,
								src: "arrow-key"
							}), e.preventDefault());
						},
						ArrowUp() {
							(t || h) && (a({
								type: e.altKey ? "CLOSE" : "INPUT.ARROW_UP",
								keypress: !0,
								src: "arrow-key"
							}), e.preventDefault());
						},
						Home(e) {
							n || (a({
								type: "INPUT.HOME",
								keypress: !0
							}), h && e.preventDefault());
						},
						End(e) {
							n || (a({
								type: "INPUT.END",
								keypress: !0
							}), h && e.preventDefault());
						},
						Enter(e) {
							a({
								type: "INPUT.ENTER",
								keypress: !0,
								src: "item-select"
							});
							let t = v != null, n = r("alwaysSubmitOnEnter"), i = s("isCustomValue") && !r("allowCustomValue");
							if (h && !n && (t || i) && e.preventDefault(), v == null) return;
							let c = Os(o, v);
							Zt(c) && r("navigate")?.({
								value: v,
								node: c,
								href: c.href
							});
						},
						Escape() {
							a({
								type: "INPUT.ESCAPE",
								keypress: !0,
								src: "escape-key"
							}), e.preventDefault();
						}
					}[Qt(e, { dir: r("dir") })];
					i?.(e);
				}
			});
		},
		getTriggerProps(e = {}) {
			return t.button({
				...co.trigger.attrs,
				dir: r("dir"),
				id: _s(o),
				"aria-haspopup": _ ? "listbox" : "dialog",
				type: "button",
				tabIndex: e.focusable ? void 0 : -1,
				"aria-label": c.triggerLabel,
				"aria-expanded": h,
				"data-state": h ? "open" : "closed",
				"aria-controls": h ? hs(o) : void 0,
				disabled: u,
				"data-invalid": Z(f),
				"data-focusable": Z(e.focusable),
				"data-readonly": Z(m),
				"data-disabled": Z(u),
				onFocus() {
					e.focusable && a({
						type: "INPUT.FOCUS",
						src: "trigger"
					});
				},
				onClick(e) {
					e.defaultPrevented || d && Fn(e) && a({
						type: "TRIGGER.CLICK",
						src: "trigger-click"
					});
				},
				onPointerDown(e) {
					d && e.pointerType !== "touch" && Fn(e) && (e.preventDefault(), queueMicrotask(() => {
						ks(o);
					}));
				},
				onKeyDown(e) {
					if (e.defaultPrevented || _) return;
					let t = {
						ArrowDown() {
							a({
								type: "INPUT.ARROW_DOWN",
								src: "arrow-key"
							});
						},
						ArrowUp() {
							a({
								type: "INPUT.ARROW_UP",
								src: "arrow-key"
							});
						}
					}[Qt(e, { dir: r("dir") })];
					t && (t(e), e.preventDefault());
				}
			});
		},
		getContentProps() {
			return t.element({
				...co.content.attrs,
				dir: r("dir"),
				id: hs(o),
				role: _ ? "listbox" : "dialog",
				tabIndex: -1,
				hidden: !h,
				"data-state": h ? "open" : "closed",
				"data-placement": y,
				"data-side": ee,
				"aria-labelledby": fs(o),
				"aria-multiselectable": r("multiple") && _ ? !0 : void 0,
				"data-empty": Z(l.size === 0),
				onPointerDown(e) {
					Fn(e) && e.preventDefault();
				}
			});
		},
		getListProps() {
			return t.element({
				...co.list.attrs,
				role: _ ? void 0 : "listbox",
				"data-empty": Z(l.size === 0),
				"aria-labelledby": fs(o),
				"aria-multiselectable": r("multiple") && !_ ? !0 : void 0
			});
		},
		getClearTriggerProps() {
			return t.button({
				...co.clearTrigger.attrs,
				dir: r("dir"),
				id: vs(o),
				type: "button",
				tabIndex: -1,
				disabled: u,
				"data-invalid": Z(f),
				"aria-label": c.clearTriggerLabel,
				"aria-controls": ms(o),
				hidden: !n.get("value").length,
				onPointerDown(e) {
					Fn(e) && e.preventDefault();
				},
				onClick(e) {
					e.defaultPrevented || d && a({
						type: "VALUE.CLEAR",
						src: "clear-trigger"
					});
				}
			});
		},
		getItemState: x,
		getItemProps(e) {
			let n = x(e), i = n.value;
			return t.element({
				...co.item.attrs,
				dir: r("dir"),
				id: xs(o, i),
				role: "option",
				tabIndex: -1,
				"data-highlighted": Z(n.highlighted),
				"data-state": n.selected ? "checked" : "unchecked",
				"aria-selected": pn(n.selected),
				"aria-disabled": pn(n.disabled),
				"data-disabled": Z(n.disabled),
				"data-value": n.value,
				onPointerMove() {
					n.disabled || jo() === "pointer" && (n.highlighted || a({
						type: "ITEM.POINTER_MOVE",
						value: i
					}));
				},
				onPointerLeave() {
					e.persistFocus || n.disabled || jo() === "pointer" && a({
						type: "ITEM.POINTER_LEAVE",
						value: i
					});
				},
				onClick(e) {
					pt(e) || xt(e) || tt(e) || n.disabled || a({
						type: "ITEM.CLICK",
						src: "item-select",
						value: i
					});
				}
			});
		},
		getItemTextProps(e) {
			let n = x(e);
			return t.element({
				...co.itemText.attrs,
				dir: r("dir"),
				"data-state": n.selected ? "checked" : "unchecked",
				"data-disabled": Z(n.disabled),
				"data-highlighted": Z(n.highlighted)
			});
		},
		getItemIndicatorProps(e) {
			let n = x(e);
			return t.element({
				"aria-hidden": !0,
				...co.itemIndicator.attrs,
				dir: r("dir"),
				"data-state": n.selected ? "checked" : "unchecked",
				hidden: !n.selected
			});
		},
		getItemGroupProps(e) {
			let { id: n } = e;
			return t.element({
				...co.itemGroup.attrs,
				dir: r("dir"),
				id: ys(o, n),
				"aria-labelledby": bs(o, n),
				"data-empty": Z(l.size === 0),
				role: "group"
			});
		},
		getItemGroupLabelProps(e) {
			let { htmlFor: n } = e;
			return t.element({
				...co.itemGroupLabel.attrs,
				dir: r("dir"),
				id: bs(o, n),
				role: "presentation"
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+interact-outside@1.43.3/node_modules/@zag-js/interact-outside/dist/frame-utils.mjs
function Ns(e) {
	let t = {
		each(t) {
			for (let n = 0; n < e.frames?.length; n += 1) {
				let r = e.frames[n];
				r && t(r);
			}
		},
		addEventListener(e, n, r) {
			return t.each((t) => {
				try {
					t.document.addEventListener(e, n, r);
				} catch {}
			}), () => {
				try {
					t.removeEventListener(e, n, r);
				} catch {}
			};
		},
		removeEventListener(e, n, r) {
			t.each((t) => {
				try {
					t.document.removeEventListener(e, n, r);
				} catch {}
			});
		}
	};
	return t;
}
function Ps(e) {
	let t = e.frameElement == null ? null : e.parent;
	return {
		addEventListener: (e, n, r) => {
			try {
				t?.addEventListener(e, n, r);
			} catch {}
			return () => {
				try {
					t?.removeEventListener(e, n, r);
				} catch {}
			};
		},
		removeEventListener: (e, n, r) => {
			try {
				t?.removeEventListener(e, n, r);
			} catch {}
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+interact-outside@1.43.3/node_modules/@zag-js/interact-outside/dist/index.mjs
var Fs = "pointerdown.outside", Is = "focus.outside";
function Ls(e) {
	for (let t of e) if (Bt(t) && ca(t)) return !0;
	return !1;
}
var Rs = (e) => "clientY" in e;
function zs(e, t) {
	if (!Rs(t) || !e) return !1;
	let n = e.getBoundingClientRect();
	return n.width === 0 || n.height === 0 ? !1 : n.top <= t.clientY && t.clientY <= n.top + n.height && n.left <= t.clientX && t.clientX <= n.left + n.width;
}
function Bs(e, t) {
	return e.y <= t.y && t.y <= e.y + e.height && e.x <= t.x && t.x <= e.x + e.width;
}
function Vs(e, t) {
	if (!t || !Rs(e)) return !1;
	let n = t.scrollHeight > t.clientHeight, r = n && e.clientX > t.offsetLeft + t.clientWidth, i = t.scrollWidth > t.clientWidth, a = i && e.clientY > t.offsetTop + t.clientHeight;
	return Bs({
		x: t.offsetLeft,
		y: t.offsetTop,
		width: t.clientWidth + (n ? 16 : 0),
		height: t.clientHeight + (i ? 16 : 0)
	}, {
		x: e.clientX,
		y: e.clientY
	}) ? r || a : !1;
}
function Hs(e, t) {
	let { exclude: n, onFocusOutside: r, onPointerDownOutside: i, onInteractOutside: a, defer: o, followControlledElements: s = !0 } = t;
	if (!e) return;
	let c = je(e), l = cn(e), u = Ns(l), d = Ps(l);
	function f(t, r) {
		if (!Bt(r) || !r.isConnected || kt(e, r) || zs(e, t) || s && Ni(e, r)) return !1;
		let i = c.querySelector(`[aria-controls="${e.id}"]`);
		return i && Vs(t, ba(i)) || Vs(t, ba(e)) ? !1 : !n?.(r);
	}
	let p = /* @__PURE__ */ new Set(), m = Vt(e?.getRootNode()), h = !1;
	function g(t) {
		h = !0;
		let n = () => {
			h = !1;
		};
		c.addEventListener("pointerup", n, { once: !0 }), l.addEventListener("pointerup", n, { once: !0 });
		function r(n) {
			let r = o && !Dt() ? en : (e) => e(), s = n ?? t, c = s?.composedPath?.() ?? [s?.target];
			r(() => {
				let n = m ? c[0] : lt(t);
				if (e && f(t, n)) {
					if (i || a) {
						let t = Xe(i, a);
						e.addEventListener(Fs, t, { once: !0 });
					}
					Ws(e, Fs, {
						bubbles: !1,
						cancelable: !0,
						detail: {
							originalEvent: s,
							contextmenu: tt(s),
							focusable: Ls(c),
							target: n
						}
					});
				}
			});
		}
		t.pointerType === "touch" ? (p.forEach((e) => e()), p.add(Ne(c, "click", r, { once: !0 })), p.add(d.addEventListener("click", r, { once: !0 })), p.add(u.addEventListener("click", r, { once: !0 }))) : r();
	}
	let _ = /* @__PURE__ */ new Set(), v = setTimeout(() => {
		_.add(Ne(c, "pointerdown", g, !0)), _.add(d.addEventListener("pointerdown", g, !0)), _.add(u.addEventListener("pointerdown", g, !0));
	}, 0);
	function y(t) {
		h || (o ? en : (e) => e())(() => {
			let n = t?.composedPath?.() ?? [t?.target], i = m ? n[0] : lt(t);
			if (e && f(t, i)) {
				if (r || a) {
					let t = Xe(r, a);
					e.addEventListener(Is, t, { once: !0 });
				}
				Ws(e, Is, {
					bubbles: !1,
					cancelable: !0,
					detail: {
						originalEvent: t,
						contextmenu: !1,
						focusable: ca(i),
						target: i
					}
				});
			}
		});
	}
	return Dt() || (_.add(Ne(c, "focusin", y, !0)), _.add(d.addEventListener("focusin", y, !0)), _.add(u.addEventListener("focusin", y, !0))), () => {
		clearTimeout(v), p.forEach((e) => e()), _.forEach((e) => e());
	};
}
function Us(e, t) {
	let { defer: n } = t, r = n ? en : (e) => e(), i = [];
	return i.push(r(() => {
		let n = typeof e == "function" ? e() : e;
		i.push(Hs(n, t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
function Ws(e, t, n) {
	let r = new (e.ownerDocument.defaultView || window).CustomEvent(t, n);
	return e.dispatchEvent(r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/escape-keydown.mjs
function Gs(e, t) {
	return Ne(je(e), "keydown", (e) => {
		e.key === "Escape" && (e.isComposing || t?.(e));
	}, { capture: !0 });
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/layer-stack.mjs
var Ks = "layer:request-dismiss", qs = {
	layers: [],
	branches: [],
	recentlyRemoved: /* @__PURE__ */ new Set(),
	count() {
		return this.layers.length;
	},
	pointerBlockingLayers() {
		return this.layers.filter((e) => e.pointerBlocking);
	},
	topMostPointerBlockingLayer() {
		return [...this.pointerBlockingLayers()].slice(-1)[0];
	},
	hasPointerBlockingLayer() {
		return this.pointerBlockingLayers().length > 0;
	},
	isBelowPointerBlockingLayer(e) {
		return this.indexOf(e) < (this.topMostPointerBlockingLayer() ? this.indexOf(this.topMostPointerBlockingLayer()?.node) : -1);
	},
	isTopMost(e) {
		return this.layers[this.count() - 1]?.node === e;
	},
	getNestedLayers(e) {
		return Array.from(this.layers).slice(this.indexOf(e) + 1);
	},
	getLayersByType(e) {
		return this.layers.filter((t) => t.type === e);
	},
	getNestedLayersByType(e, t) {
		let n = this.indexOf(e);
		return n === -1 ? [] : this.layers.slice(n + 1).filter((e) => e.type === t);
	},
	getParentLayerOfType(e, t) {
		let n = this.indexOf(e);
		if (!(n <= 0)) return this.layers.slice(0, n).reverse().find((e) => e.type === t);
	},
	countNestedLayersOfType(e, t) {
		return this.getNestedLayersByType(e, t).length;
	},
	isInNestedLayer(e, t) {
		return !!(this.getNestedLayers(e).some((e) => kt(e.node, t)) || this.recentlyRemoved.size > 0);
	},
	isInBranch(e) {
		return Array.from(this.branches).some((t) => kt(t, e));
	},
	add(e) {
		let t = this.indexOf(e.node);
		t !== -1 && this.layers.splice(t, 1), this.layers.push(e), this.syncLayers();
	},
	addBranch(e) {
		this.branches.push(e);
	},
	remove(e) {
		let t = this.indexOf(e);
		t < 0 || (this.layers[t].styleTargets?.forEach((e) => {
			let t = e();
			t && Ys(t);
		}), this.recentlyRemoved.add(e), ze(() => this.recentlyRemoved.delete(e)), t < this.count() - 1 && this.getNestedLayers(e).forEach((t) => qs.dismiss(t.node, e)), this.layers.splice(t, 1), this.syncLayers());
	},
	removeBranch(e) {
		let t = this.branches.indexOf(e);
		t >= 0 && this.branches.splice(t, 1);
	},
	syncLayers() {
		this.layers.forEach((e, t) => {
			Js(e, t, e.node), e.styleTargets?.forEach((n) => {
				let r = n();
				if (!r || r === e.node) return;
				Js(e, t, r);
				let { zIndex: i } = Tt(e.node);
				r.style.setProperty("--z-index", i);
			});
		});
	},
	indexOf(e) {
		return this.layers.findIndex((t) => t.node === e);
	},
	dismiss(e, t) {
		let n = this.indexOf(e);
		if (n === -1) return;
		let r = this.layers[n];
		Zs(e, Ks, (e) => {
			r.requestDismiss?.(e), e.defaultPrevented || r?.dismiss();
		}), Xs(e, Ks, {
			originalLayer: e,
			targetLayer: t,
			originalIndex: n,
			targetIndex: t ? this.indexOf(t) : -1
		}), this.syncLayers();
	},
	clear() {
		this.remove(this.layers[0].node);
	}
};
function Js(e, t, n) {
	n.style.setProperty("--layer-index", `${t}`), n.removeAttribute("data-nested"), n.removeAttribute("data-has-nested"), qs.getParentLayerOfType(e.node, e.type) && n.setAttribute("data-nested", e.type);
	let r = qs.countNestedLayersOfType(e.node, e.type);
	r > 0 && n.setAttribute("data-has-nested", e.type), n.style.setProperty("--nested-layer-count", `${r}`);
}
function Ys(e) {
	e.style.removeProperty("--layer-index"), e.style.removeProperty("--nested-layer-count"), e.style.removeProperty("--z-index"), e.removeAttribute("data-nested"), e.removeAttribute("data-has-nested");
}
function Xs(e, t, n) {
	let r = new (e.ownerDocument.defaultView || window).CustomEvent(t, {
		cancelable: !0,
		bubbles: !0,
		detail: n
	});
	return e.dispatchEvent(r);
}
function Zs(e, t, n) {
	e.addEventListener(t, n, { once: !0 });
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/pointer-event-outside.mjs
var Qs = /* @__PURE__ */ new WeakMap(), $s = /* @__PURE__ */ new WeakMap();
function ec(e) {
	return qs.isBelowPointerBlockingLayer(e) ? "none" : "auto";
}
function tc(e) {
	let t = ec(e);
	e.style.pointerEvents !== t && (e.style.pointerEvents = t);
}
function nc(e) {
	if ($s.has(e)) return;
	let t = cn(e);
	if (t.MutationObserver === void 0) return;
	let n = new t.MutationObserver(() => {
		$s.has(e) && tc(e);
	});
	n.observe(e, {
		attributes: !0,
		attributeFilter: ["style"]
	}), $s.set(e, n);
}
function rc() {
	qs.layers.forEach(({ node: e }) => {
		tc(e), nc(e);
	});
}
function ic(e) {
	let t = $s.get(e);
	t && (t.disconnect(), $s.delete(e)), e.style.pointerEvents = "";
}
function ac(e, t) {
	let n = je(e), r = [];
	return qs.hasPointerBlockingLayer() && !n.body.hasAttribute("data-inert") && (Qs.set(n.body, n.body.style.pointerEvents), queueMicrotask(() => {
		let e = n.body;
		e && (e.style.pointerEvents = "none", e.setAttribute("data-inert", ""));
	})), t?.forEach((e) => {
		let [t, n] = Wa(() => {
			let t = e();
			return Bt(t) ? t : null;
		}, { timeout: 1e3 });
		t.then((e) => r.push(rn(e, { pointerEvents: "auto" }))), r.push(n);
	}), () => {
		qs.hasPointerBlockingLayer() || (queueMicrotask(() => {
			let e = n.body;
			if (!e) return;
			let t = Qs.get(e);
			t !== void 0 && (e.style.pointerEvents = t, Qs.delete(e)), e.removeAttribute("data-inert"), e.style.length === 0 && e.removeAttribute("style");
		}), r.forEach((e) => e()));
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/dismissable-layer.mjs
function oc(e, t) {
	let { onDismiss: n, onRequestDismiss: r, pointerBlocking: i, exclude: a, debug: o, type: s = "dialog", layerStyleTargets: c } = t, l = {
		dismiss: n,
		node: e,
		type: s,
		pointerBlocking: i,
		requestDismiss: r,
		styleTargets: c
	};
	qs.add(l), rc();
	function u(r) {
		let i = lt(r.detail.originalEvent);
		qs.isBelowPointerBlockingLayer(e) || qs.isInBranch(i) || (t.onPointerDownOutside?.(r), t.onInteractOutside?.(r), !r.defaultPrevented && (o && console.log("onPointerDownOutside:", r.detail.originalEvent), n?.()));
	}
	function d(e) {
		let r = lt(e.detail.originalEvent);
		qs.isInBranch(r) || (t.onFocusOutside?.(e), t.onInteractOutside?.(e), !e.defaultPrevented && (o && console.log("onFocusOutside:", e.detail.originalEvent), n?.()));
	}
	function f(r) {
		qs.isTopMost(e) && (t.onEscapeKeyDown?.(r), !r.defaultPrevented && n && (r.preventDefault(), n()));
	}
	function p(n) {
		let r = typeof a == "function" ? a() : a, i = Array.isArray(r) ? r : [r], o = t.persistentElements?.map((e) => e()).filter(Bt);
		return o && i.push(...o), i.some((e) => kt(e, n)) || qs.isInNestedLayer(e, n);
	}
	let m = [
		i ? ac(e, t.persistentElements) : void 0,
		Gs(e, f),
		Us(e, {
			exclude: p,
			onFocusOutside: d,
			onPointerDownOutside: u,
			defer: t.defer
		})
	];
	return () => {
		qs.remove(e), rc(), ic(e), m.forEach((e) => e?.());
	};
}
function sc(e, t) {
	let { warnOnMissingNode: n = !0 } = t;
	return Ga(e, (e) => oc(e, t), {
		defer: t.defer,
		onMissing: n ? () => An("[@zag-js/dismissable] node is `null` or `undefined`") : void 0
	});
}
function cc(e, t = {}) {
	return Ga(e, (e) => (qs.addBranch(e), () => {
		qs.removeBranch(e);
	}), {
		defer: t.defer,
		onMissing: () => An("[@zag-js/dismissable] branch node is `null` or `undefined`")
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+live-region@1.43.3/node_modules/@zag-js/live-region/dist/index.mjs
var lc = "__live-region__", uc = "__live-region-debug__", dc = "position:fixed;inset-inline:0;bottom:0;z-index:2147483647;padding:12px 16px;background:black;color:white;font-size:14px;line-height:20px;text-align:center;pointer-events:none;";
function fc(e = {}) {
	let { level: t = "polite", document: n = document, root: r, delay: i = 0, debug: a = !1 } = e, o = n.defaultView ?? window, s = r ?? n.body;
	function c() {
		if (!a) return;
		let e = n.getElementById(uc);
		return e || (e = n.createElement("div"), e.id = uc, e.dataset.liveAnnouncerDebug = "true", e.setAttribute("aria-hidden", "true"), e.style.cssText = dc, s.appendChild(e), e);
	}
	function l(e, r) {
		n.getElementById(lc)?.remove(), r ??= i;
		let a = n.createElement("span");
		a.id = lc, a.dataset.liveAnnouncer = "true";
		let l = t === "assertive" ? "alert" : "status";
		a.setAttribute("aria-live", t), a.setAttribute("role", l), Object.assign(a.style, {
			border: "0",
			clip: "rect(0 0 0 0)",
			height: "1px",
			margin: "-1px",
			overflow: "hidden",
			padding: "0",
			position: "absolute",
			width: "1px",
			whiteSpace: "nowrap",
			wordWrap: "normal"
		}), s.appendChild(a), o.setTimeout(() => {
			if (!a.isConnected) return;
			a.textContent = e;
			let t = c();
			t && (t.textContent = e);
		}, r);
	}
	function u() {
		n.getElementById(lc)?.remove(), n.getElementById(uc)?.remove();
	}
	return {
		announce: l,
		destroy: u,
		toJSON() {
			return lc;
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+combobox@1.43.3/node_modules/@zag-js/combobox/dist/combobox.machine.mjs
var { guards: pc, createMachine: mc, choose: hc } = Lt(), { and: gc, not: _c } = pc, vc = mc({
	props({ props: e }) {
		return {
			loopFocus: !0,
			openOnClick: !1,
			defaultValue: [],
			defaultInputValue: "",
			closeOnSelect: !e.multiple,
			allowCustomValue: !1,
			alwaysSubmitOnEnter: !1,
			inputBehavior: "none",
			selectionBehavior: e.multiple ? "clear" : "replace",
			openOnKeyPress: !0,
			openOnChange: !0,
			composite: !0,
			navigate({ node: e }) {
				ya(e);
			},
			collection: lo.empty(),
			...e,
			positioning: {
				placement: "bottom",
				sameWidth: !0,
				...e.positioning
			}
		};
	},
	initialState({ prop: e }) {
		return e("open") || e("defaultOpen") ? "open.suggesting" : "closed.idle";
	},
	context({ prop: e, bindable: t, getContext: n, getEvent: r }) {
		let i = e("value") ?? e("defaultValue") ?? [], a = e("collection").findMany(i);
		return {
			currentPlacement: t(() => ({ defaultValue: void 0 })),
			value: t(() => ({
				defaultValue: e("defaultValue"),
				value: e("value"),
				isEqual: Ot,
				hash(e) {
					return e.join(",");
				},
				onChange(t) {
					let r = n(), i = e("collection"), a = Xr({
						values: t,
						collection: i,
						selectedItemMap: r.get("selectedItemMap")
					}), o = e("value") ?? t, s = o === t ? a : Xr({
						values: o,
						collection: i,
						selectedItemMap: a.nextSelectedItemMap
					});
					r.set("selectedItemMap", s.nextSelectedItemMap), e("onValueChange")?.({
						value: t,
						items: a.selectedItems
					});
				}
			})),
			highlightedValue: t(() => ({
				defaultValue: e("defaultHighlightedValue") || null,
				value: e("highlightedValue"),
				onChange(t) {
					let n = e("collection").find(t);
					e("onHighlightChange")?.({
						highlightedValue: t,
						highlightedItem: n
					});
				}
			})),
			inputValue: t(() => {
				let t = e("inputValue") || e("defaultInputValue"), n = e("value") || e("defaultValue");
				if (!t.trim() && !e("multiple")) {
					let r = e("collection").stringifyMany(n);
					t = In(e("selectionBehavior"), {
						preserve: t || r,
						replace: r,
						clear: ""
					});
				}
				return {
					defaultValue: t,
					value: e("inputValue"),
					onChange(t) {
						let n = r(), i = (n.previousEvent || n).src;
						e("onInputValueChange")?.({
							inputValue: t,
							reason: i
						});
					}
				};
			}),
			highlightedItem: t(() => {
				let t = e("highlightedValue");
				return { defaultValue: e("collection").find(t) };
			}),
			selectedItemMap: t(() => ({ defaultValue: Zr({
				selectedItems: a,
				collection: e("collection")
			}) }))
		};
	},
	computed: {
		isInputValueEmpty: ({ context: e }) => e.get("inputValue").length === 0,
		isInteractive: ({ prop: e }) => !(e("readOnly") || e("disabled")),
		autoComplete: ({ prop: e }) => e("inputBehavior") === "autocomplete",
		autoHighlight: ({ prop: e }) => e("inputBehavior") === "autohighlight",
		hasSelectedItems: ({ context: e }) => e.get("value").length > 0,
		selectedItems: ({ context: e, prop: t }) => Jr({
			values: e.get("value"),
			collection: t("collection"),
			selectedItemMap: e.get("selectedItemMap")
		}),
		valueAsString: ({ computed: e, prop: t }) => t("collection").stringifyItems(e("selectedItems")),
		isCustomValue: ({ context: e, computed: t }) => e.get("inputValue") !== t("valueAsString")
	},
	watch({ context: e, prop: t, track: n, action: r, send: i }) {
		n([() => e.hash("value")], () => {
			r(["syncSelectedItems"]);
		}), n([() => e.get("inputValue")], () => {
			r(["syncInputValue"]);
		}), n([() => e.get("highlightedValue")], () => {
			r([
				"syncHighlightedItem",
				"autofillInputValue",
				"announceHighlightedItem"
			]);
		}), n([() => t("open")], () => {
			r(["toggleVisibility"]);
		}), n([() => t("collection").toString()], () => {
			i({ type: "CHILDREN_CHANGE" });
		});
	},
	on: {
		"SELECTED_ITEMS.SYNC": { actions: ["syncSelectedItems"] },
		"HIGHLIGHTED_VALUE.SET": { actions: ["setHighlightedValue"] },
		"HIGHLIGHTED_VALUE.CLEAR": { actions: ["clearHighlightedValue"] },
		"ITEM.SELECT": { actions: ["selectItem"] },
		"ITEM.CLEAR": { actions: ["clearItem"] },
		"VALUE.SET": { actions: ["setValue"] },
		"INPUT_VALUE.SET": { actions: ["setInputValue"] },
		"POSITIONING.SET": { actions: ["reposition"] }
	},
	entry: hc([{
		guard: "autoFocus",
		actions: ["setInitialFocus"]
	}]),
	states: {
		closed: {
			tags: ["closed"],
			initial: "idle",
			states: {
				idle: {
					tags: ["idle"],
					entry: ["scrollContentToTop", "clearHighlightedValue"],
					on: {
						"CONTROLLED.OPEN": { target: "open.interacting" },
						"TRIGGER.CLICK": [{
							guard: "isOpenControlled",
							actions: [
								"setInitialFocus",
								"highlightFirstSelectedItem",
								"invokeOnOpen"
							]
						}, {
							target: "open.interacting",
							actions: [
								"setInitialFocus",
								"highlightFirstSelectedItem",
								"invokeOnOpen"
							]
						}],
						"INPUT.CLICK": [{
							guard: "isOpenControlled",
							actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
						}, {
							target: "open.interacting",
							actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
						}],
						"INPUT.FOCUS": { target: "focused" },
						OPEN: [{
							guard: "isOpenControlled",
							actions: ["invokeOnOpen"]
						}, {
							target: "open.interacting",
							actions: ["invokeOnOpen"]
						}],
						"VALUE.CLEAR": {
							target: "focused",
							actions: [
								"clearInputValue",
								"clearSelectedItems",
								"setInitialFocus"
							]
						}
					}
				},
				focused: {
					tags: ["focused"],
					entry: ["scrollContentToTop", "clearHighlightedValue"],
					on: {
						"CONTROLLED.OPEN": [{
							guard: "isChangeEvent",
							target: "open.suggesting"
						}, { target: "open.interacting" }],
						"INPUT.CHANGE": [
							{
								guard: gc("isOpenControlled", "openOnChange"),
								actions: [
									"setInputValue",
									"invokeOnOpen",
									"highlightFirstItemIfNeeded"
								]
							},
							{
								guard: "openOnChange",
								target: "open.suggesting",
								actions: [
									"setInputValue",
									"invokeOnOpen",
									"highlightFirstItemIfNeeded"
								]
							},
							{ actions: ["setInputValue"] }
						],
						"LAYER.INTERACT_OUTSIDE": { target: "idle" },
						"INPUT.ESCAPE": {
							guard: gc("isCustomValue", _c("allowCustomValue")),
							actions: ["revertInputValue"]
						},
						"INPUT.BLUR": { target: "idle" },
						"INPUT.CLICK": [{
							guard: "isOpenControlled",
							actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
						}, {
							target: "open.interacting",
							actions: ["highlightFirstSelectedItem", "invokeOnOpen"]
						}],
						"TRIGGER.CLICK": [{
							guard: "isOpenControlled",
							actions: [
								"setInitialFocus",
								"highlightFirstSelectedItem",
								"invokeOnOpen"
							]
						}, {
							target: "open.interacting",
							actions: [
								"setInitialFocus",
								"highlightFirstSelectedItem",
								"invokeOnOpen"
							]
						}],
						"INPUT.ARROW_DOWN": [
							{
								guard: gc("isOpenControlled", "autoComplete"),
								actions: ["invokeOnOpen"]
							},
							{
								guard: "autoComplete",
								target: "open.interacting",
								actions: ["invokeOnOpen"]
							},
							{
								guard: "isOpenControlled",
								actions: ["highlightFirstOrSelectedItem", "invokeOnOpen"]
							},
							{
								target: "open.interacting",
								actions: ["highlightFirstOrSelectedItem", "invokeOnOpen"]
							}
						],
						"INPUT.ARROW_UP": [
							{
								guard: gc("isOpenControlled", "autoComplete"),
								actions: ["invokeOnOpen"]
							},
							{
								guard: "autoComplete",
								target: "open.interacting",
								actions: ["invokeOnOpen"]
							},
							{
								guard: "isOpenControlled",
								actions: ["highlightLastOrSelectedItem", "invokeOnOpen"]
							},
							{
								target: "open.interacting",
								actions: ["highlightLastOrSelectedItem", "invokeOnOpen"]
							}
						],
						OPEN: [{
							guard: "isOpenControlled",
							actions: ["invokeOnOpen"]
						}, {
							target: "open.interacting",
							actions: ["invokeOnOpen"]
						}],
						"VALUE.CLEAR": { actions: ["clearInputValue", "clearSelectedItems"] }
					}
				}
			}
		},
		open: {
			tags: ["open", "focused"],
			entry: ["setInitialFocus"],
			effects: [
				"trackFocusVisible",
				"scrollToHighlightedItem",
				"trackDismissableLayer",
				"trackPlacement",
				"trackLiveRegion"
			],
			on: {
				"CONTROLLED.CLOSE": [{
					guard: "restoreFocus",
					target: "closed.focused",
					actions: ["setFinalFocus"]
				}, { target: "closed.idle" }],
				"INPUT.ENTER": [
					{
						guard: gc("isOpenControlled", "isCustomValue", _c("hasHighlightedItem"), _c("allowCustomValue")),
						actions: ["revertInputValue", "invokeOnClose"]
					},
					{
						guard: gc("isCustomValue", _c("hasHighlightedItem"), _c("allowCustomValue")),
						target: "closed.focused",
						actions: ["revertInputValue", "invokeOnClose"]
					},
					{
						guard: gc("isOpenControlled", "closeOnSelect"),
						actions: ["selectHighlightedItem", "invokeOnClose"]
					},
					{
						guard: "closeOnSelect",
						target: "closed.focused",
						actions: [
							"selectHighlightedItem",
							"invokeOnClose",
							"setFinalFocus"
						]
					},
					{ actions: ["selectHighlightedItem"] }
				],
				"ITEM.CLICK": [
					{
						guard: gc("isOpenControlled", "closeOnSelect"),
						actions: ["selectItem", "invokeOnClose"]
					},
					{
						guard: "closeOnSelect",
						target: "closed.focused",
						actions: [
							"selectItem",
							"invokeOnClose",
							"setFinalFocus"
						]
					},
					{ actions: ["selectItem"] }
				],
				"TRIGGER.CLICK": [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closed.focused",
					actions: ["invokeOnClose"]
				}],
				"LAYER.INTERACT_OUTSIDE": [
					{
						guard: gc("isOpenControlled", "isCustomValue", _c("allowCustomValue")),
						actions: ["revertInputValue", "invokeOnClose"]
					},
					{
						guard: gc("isCustomValue", _c("allowCustomValue")),
						target: "closed.idle",
						actions: ["revertInputValue", "invokeOnClose"]
					},
					{
						guard: "isOpenControlled",
						actions: ["invokeOnClose"]
					},
					{
						target: "closed.idle",
						actions: ["invokeOnClose"]
					}
				],
				CLOSE: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closed.focused",
					actions: ["invokeOnClose", "setFinalFocus"]
				}],
				"VALUE.CLEAR": [{
					guard: "isOpenControlled",
					actions: [
						"clearInputValue",
						"clearSelectedItems",
						"invokeOnClose"
					]
				}, {
					target: "closed.focused",
					actions: [
						"clearInputValue",
						"clearSelectedItems",
						"invokeOnClose",
						"setFinalFocus"
					]
				}]
			},
			initial: "interacting",
			states: {
				interacting: { on: {
					CHILDREN_CHANGE: [{
						guard: "isHighlightedItemRemoved",
						actions: ["clearHighlightedValue"]
					}, { actions: ["scrollToHighlightedItem"] }],
					"INPUT.HOME": { actions: ["highlightFirstItem"] },
					"INPUT.END": { actions: ["highlightLastItem"] },
					"INPUT.ARROW_DOWN": [{
						guard: gc("autoComplete", "isLastItemHighlighted"),
						actions: ["clearHighlightedValue", "scrollContentToTop"]
					}, { actions: ["highlightNextItem"] }],
					"INPUT.ARROW_UP": [{
						guard: gc("autoComplete", "isFirstItemHighlighted"),
						actions: ["clearHighlightedValue"]
					}, { actions: ["highlightPrevItem"] }],
					"INPUT.CHANGE": [{
						guard: "autoComplete",
						target: "suggesting",
						actions: ["setInputValue"]
					}, {
						target: "suggesting",
						actions: ["clearHighlightedValue", "setInputValue"]
					}],
					"ITEM.POINTER_MOVE": { actions: ["setHighlightedValue"] },
					"ITEM.POINTER_LEAVE": { actions: ["clearHighlightedValue"] },
					"LAYER.ESCAPE": [
						{
							guard: gc("isOpenControlled", "autoComplete"),
							actions: ["syncInputValue", "invokeOnClose"]
						},
						{
							guard: "autoComplete",
							target: "closed.focused",
							actions: ["syncInputValue", "invokeOnClose"]
						},
						{
							guard: "isOpenControlled",
							actions: ["invokeOnClose"]
						},
						{
							target: "closed.focused",
							actions: ["invokeOnClose", "setFinalFocus"]
						}
					]
				} },
				suggesting: { on: {
					CHILDREN_CHANGE: [
						{
							guard: gc("isHighlightedItemRemoved", "hasCollectionItems", "autoHighlight"),
							actions: ["clearHighlightedValue", "highlightFirstItem"]
						},
						{
							guard: "isHighlightedItemRemoved",
							actions: ["clearHighlightedValue"]
						},
						{
							guard: "autoHighlight",
							actions: ["highlightFirstItem"]
						}
					],
					"INPUT.ARROW_DOWN": {
						target: "interacting",
						actions: ["highlightNextItem"]
					},
					"INPUT.ARROW_UP": {
						target: "interacting",
						actions: ["highlightPrevItem"]
					},
					"INPUT.HOME": {
						target: "interacting",
						actions: ["highlightFirstItem"]
					},
					"INPUT.END": {
						target: "interacting",
						actions: ["highlightLastItem"]
					},
					"INPUT.CHANGE": { actions: ["setInputValue"] },
					"LAYER.ESCAPE": [{
						guard: "isOpenControlled",
						actions: ["invokeOnClose"]
					}, {
						target: "closed.focused",
						actions: ["invokeOnClose"]
					}],
					"ITEM.POINTER_MOVE": {
						target: "interacting",
						actions: ["setHighlightedValue"]
					},
					"ITEM.POINTER_LEAVE": { actions: ["clearHighlightedValue"] }
				} }
			}
		}
	},
	implementations: {
		guards: {
			isInputValueEmpty: ({ computed: e }) => e("isInputValueEmpty"),
			autoComplete: ({ computed: e, prop: t }) => e("autoComplete") && !t("multiple"),
			autoHighlight: ({ computed: e }) => e("autoHighlight"),
			isFirstItemHighlighted: ({ prop: e, context: t }) => e("collection").firstValue === t.get("highlightedValue"),
			isLastItemHighlighted: ({ prop: e, context: t }) => e("collection").lastValue === t.get("highlightedValue"),
			isCustomValue: ({ computed: e }) => e("isCustomValue"),
			allowCustomValue: ({ prop: e }) => !!e("allowCustomValue"),
			hasHighlightedItem: ({ context: e }) => e.get("highlightedValue") != null,
			closeOnSelect: ({ prop: e }) => !!e("closeOnSelect"),
			isOpenControlled: ({ prop: e }) => e("open") != null,
			openOnChange: ({ prop: e, context: t }) => {
				let n = e("openOnChange");
				return Ke(n) ? n : !!n?.({ inputValue: t.get("inputValue") });
			},
			restoreFocus: ({ event: e }) => {
				let t = e.restoreFocus ?? e.previousEvent?.restoreFocus;
				return t == null || !!t;
			},
			isChangeEvent: ({ event: e }) => e.previousEvent?.type === "INPUT.CHANGE",
			autoFocus: ({ prop: e }) => !!e("autoFocus"),
			isHighlightedItemRemoved: ({ prop: e, context: t }) => !e("collection").has(t.get("highlightedValue")),
			hasCollectionItems: ({ prop: e }) => e("collection").size > 0
		},
		effects: {
			trackFocusVisible({ scope: e }) {
				return Po({ root: e.getRootNode?.() });
			},
			trackDismissableLayer({ send: e, prop: t, scope: n }) {
				return t("disableLayer") ? void 0 : sc(() => Ss(n), {
					type: "listbox",
					defer: !0,
					exclude: () => [
						Cs(n),
						Es(n),
						Ds(n)
					],
					onFocusOutside: t("onFocusOutside"),
					onPointerDownOutside: t("onPointerDownOutside"),
					onInteractOutside: t("onInteractOutside"),
					onEscapeKeyDown(t) {
						t.preventDefault(), t.stopPropagation(), e({
							type: "LAYER.ESCAPE",
							src: "escape-key"
						});
					},
					onDismiss() {
						e({
							type: "LAYER.INTERACT_OUTSIDE",
							src: "interact-outside",
							restoreFocus: !1
						});
					}
				});
			},
			trackLiveRegion({ refs: e, scope: t }) {
				let n = fc({
					level: "assertive",
					document: t.getDoc()
				});
				return e.set("liveRegion", n), () => n.destroy();
			},
			trackPlacement({ context: e, prop: t, scope: n }) {
				return e.set("currentPlacement", t("positioning").placement), cs(() => Ts(n) || Es(n), () => ws(n), {
					...t("positioning"),
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			scrollToHighlightedItem({ context: e, prop: t, scope: n }) {
				let r = Cs(n), i = [], a = (r) => {
					if (jo() === "pointer") return;
					let a = e.get("highlightedValue");
					if (!a) return;
					let o = Ss(n), s = t("scrollToIndexFn");
					if (s) {
						s({
							index: t("collection").indexOf(a),
							immediate: r,
							getElement: () => Os(n, a)
						});
						return;
					}
					let c = Os(n, a), l = en(() => {
						Pa(c, {
							rootEl: o,
							block: "nearest"
						});
					});
					i.push(l);
				}, o = en(() => {
					Mo("virtual"), a(!0);
				});
				i.push(o);
				let s = ga(r, {
					attributes: ["aria-activedescendant"],
					callback: () => a(!1)
				});
				return i.push(s), () => {
					i.forEach((e) => e());
				};
			}
		},
		actions: {
			reposition({ context: e, prop: t, scope: n, event: r }) {
				cs(() => Ts(n), () => ws(n), {
					...t("positioning"),
					...r.options,
					defer: !0,
					listeners: !1,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			setHighlightedValue({ context: e, event: t }) {
				t.value != null && e.set("highlightedValue", t.value);
			},
			clearHighlightedValue({ context: e }) {
				e.set("highlightedValue", null);
			},
			selectHighlightedItem(e) {
				let { context: t, prop: n } = e, r = n("collection"), i = t.get("highlightedValue");
				if (!i || !r.has(i)) return;
				let a = n("multiple") ? At(t.get("value"), i) : [i];
				n("onSelect")?.({
					value: a,
					itemValue: i
				}), t.set("value", a);
				let o = In(n("selectionBehavior"), {
					preserve: t.get("inputValue"),
					replace: r.stringifyMany(a),
					clear: ""
				});
				t.set("inputValue", o);
			},
			scrollToHighlightedItem({ context: e, prop: t, scope: n }) {
				ze(() => {
					let r = e.get("highlightedValue");
					if (r == null) return;
					let i = Os(n, r), a = Ss(n), o = t("scrollToIndexFn");
					if (o) {
						o({
							index: t("collection").indexOf(r),
							immediate: !0,
							getElement: () => Os(n, r)
						});
						return;
					}
					Pa(i, {
						rootEl: a,
						block: "nearest"
					});
				});
			},
			selectItem(e) {
				let { context: t, event: n, flush: r, prop: i } = e;
				n.value != null && r(() => {
					let e = i("multiple") ? At(t.get("value"), n.value) : [n.value];
					i("onSelect")?.({
						value: e,
						itemValue: n.value
					}), t.set("value", e);
					let r = In(i("selectionBehavior"), {
						preserve: t.get("inputValue"),
						replace: i("collection").stringifyMany(e),
						clear: ""
					});
					t.set("inputValue", r);
				});
			},
			clearItem(e) {
				let { context: t, event: n, flush: r, prop: i } = e;
				n.value != null && r(() => {
					let e = un(t.get("value"), n.value);
					t.set("value", e);
					let r = In(i("selectionBehavior"), {
						preserve: t.get("inputValue"),
						replace: i("collection").stringifyMany(e),
						clear: ""
					});
					t.set("inputValue", r);
				});
			},
			setInitialFocus({ scope: e }) {
				en(() => {
					ks(e);
				});
			},
			setFinalFocus({ scope: e }) {
				en(() => {
					Es(e)?.dataset.focusable == null ? ks(e) : As(e);
				});
			},
			syncInputValue({ context: e, scope: t, event: n }) {
				let r = Cs(t);
				r && (r.value = e.get("inputValue"), queueMicrotask(() => {
					n.current().type !== "INPUT.CHANGE" && ki(r);
				}));
			},
			setInputValue({ context: e, event: t }) {
				e.set("inputValue", t.value);
			},
			clearInputValue({ context: e }) {
				e.set("inputValue", "");
			},
			revertInputValue({ context: e, prop: t, computed: n }) {
				let r = t("selectionBehavior"), i = In(r, {
					replace: n("hasSelectedItems") ? n("valueAsString") : "",
					preserve: e.get("inputValue"),
					clear: ""
				});
				e.set("inputValue", i);
			},
			setValue(e) {
				let { context: t, flush: n, event: r, prop: i } = e;
				n(() => {
					t.set("value", r.value);
					let e = In(i("selectionBehavior"), {
						preserve: t.get("inputValue"),
						replace: i("collection").stringifyMany(r.value),
						clear: ""
					});
					t.set("inputValue", e);
				});
			},
			clearSelectedItems(e) {
				let { context: t, flush: n, prop: r } = e;
				n(() => {
					t.set("value", []);
					let e = In(r("selectionBehavior"), {
						preserve: t.get("inputValue"),
						replace: r("collection").stringifyMany([]),
						clear: ""
					});
					t.set("inputValue", e);
				});
			},
			scrollContentToTop({ prop: e, scope: t }) {
				let n = e("scrollToIndexFn");
				if (n) {
					let r = e("collection").firstValue;
					n({
						index: 0,
						immediate: !0,
						getElement: () => Os(t, r)
					});
				} else {
					let e = Ss(t);
					if (!e) return;
					e.scrollTop = 0;
				}
			},
			invokeOnOpen({ prop: e, event: t, context: n }) {
				let r = yc(t);
				e("onOpenChange")?.({
					open: !0,
					reason: r,
					value: n.get("value")
				});
			},
			invokeOnClose({ prop: e, event: t, context: n }) {
				let r = yc(t);
				e("onOpenChange")?.({
					open: !1,
					reason: r,
					value: n.get("value")
				});
			},
			highlightFirstItem({ context: e, prop: t, scope: n }) {
				(Ss(n) ? queueMicrotask : en)(() => {
					let n = t("collection").firstValue;
					n && e.set("highlightedValue", n);
				});
			},
			highlightFirstItemIfNeeded({ computed: e, action: t }) {
				e("autoHighlight") && t(["highlightFirstItem"]);
			},
			highlightLastItem({ context: e, prop: t, scope: n }) {
				(Ss(n) ? queueMicrotask : en)(() => {
					let n = t("collection").lastValue;
					n && e.set("highlightedValue", n);
				});
			},
			highlightNextItem({ context: e, prop: t }) {
				let n = null, r = e.get("highlightedValue"), i = t("collection");
				r ? (n = i.getNextValue(r), !n && t("loopFocus") && (n = i.firstValue)) : n = i.firstValue, n && e.set("highlightedValue", n);
			},
			highlightPrevItem({ context: e, prop: t }) {
				let n = null, r = e.get("highlightedValue"), i = t("collection");
				r ? (n = i.getPreviousValue(r), !n && t("loopFocus") && (n = i.lastValue)) : n = i.lastValue, n && e.set("highlightedValue", n);
			},
			highlightFirstSelectedItem({ context: e, prop: t }) {
				en(() => {
					let [n] = t("collection").sort(e.get("value"));
					n && e.set("highlightedValue", n);
				});
			},
			highlightFirstOrSelectedItem({ context: e, prop: t, computed: n }) {
				en(() => {
					let r = null;
					r = n("hasSelectedItems") ? t("collection").sort(e.get("value"))[0] : t("collection").firstValue, r && e.set("highlightedValue", r);
				});
			},
			highlightLastOrSelectedItem({ context: e, prop: t, computed: n }) {
				en(() => {
					let r = t("collection"), i = null;
					i = n("hasSelectedItems") ? r.sort(e.get("value"))[0] : r.lastValue, i && e.set("highlightedValue", i);
				});
			},
			autofillInputValue({ context: e, computed: t, prop: n, event: r, scope: i }) {
				let a = Cs(i), o = n("collection");
				if (!t("autoComplete") || !a || !r.keypress) return;
				let s = o.stringify(e.get("highlightedValue"));
				en(() => {
					a.value = s || e.get("inputValue");
				});
			},
			syncSelectedItems(e) {
				queueMicrotask(() => {
					let { context: t, prop: n } = e, r = n("collection"), i = t.get("value"), a = Xr({
						values: i,
						collection: r,
						selectedItemMap: t.get("selectedItemMap")
					});
					t.set("selectedItemMap", a.nextSelectedItemMap);
					let o = In(n("selectionBehavior"), {
						preserve: t.get("inputValue"),
						replace: r.stringifyMany(i),
						clear: ""
					});
					t.set("inputValue", o);
				});
			},
			syncHighlightedItem({ context: e, prop: t }) {
				let n = t("collection").find(e.get("highlightedValue"));
				e.set("highlightedItem", n);
			},
			announceHighlightedItem({ context: e, prop: t, refs: n }) {
				if (!Ct()) return;
				let r = e.get("highlightedValue"), i = r ? t("collection").stringifyItem(t("collection").find(r)) : null;
				if (!i) return;
				let a = r ? e.get("value").includes(r) : !1;
				n.get("liveRegion")?.announce(a ? `${i}, selected` : i);
			},
			toggleVisibility({ event: e, send: t, prop: n }) {
				t({
					type: n("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
					previousEvent: e
				});
			}
		}
	}
});
function yc(e) {
	return (e.previousEvent || e).src;
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox.anatomy.js
var bc = so.extendWith("empty"), xc = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Sc(e, t) {
	O(t, !0);
	let n = bc.build(), r = R(t, "ref", 15, null), i = q(t, xc), a = qa(), o = _(() => a().collection.size === 0);
	var s = {
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), M();
		}
	}, c = F(), l = K(c), u = (e) => {
		Q(e, Y({ as: "div" }, () => n.empty.attrs, () => i, {
			role: "presentation",
			get ref() {
				return r();
			},
			set ref(e) {
				r(e);
			}
		}));
	};
	return P(l, (e) => {
		z(o) && e(u);
	}), I(e, c), y(s);
}
U(Sc, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox-control.svelte
var Cc = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function wc(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, Cc), i = qa(), a = _(() => X(i().getControlProps(), r));
	return Q(e, Y({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(wc, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox-input.svelte
var Tc = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Ec(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, Tc), i = qa(), a = _(() => X(i().getInputProps(), r));
	return Q(e, Y({ as: "input" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(Ec, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/use-combobox-item-context.js
var [Dc, Oc] = Rt({
	name: "ComboboxItemContext",
	hookName: "useComboboxItemContext",
	providerName: "<ComboboxItemProvider />"
}), [kc, Ac] = Rt({
	name: "ComboboxItemPropsContext",
	hookName: "useComboboxItemPropsContext",
	providerName: "<ComboboxItemPropsProvider />"
}), jc = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Mc(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, jc), i = _(() => yn()(r, ["item", "persistFocus"])), a = _(() => C(z(i), 2)), o = _(() => z(a)[0]), s = _(() => z(a)[1]), c = qa(), l = _(() => c().getItemState(z(o))), u = _(() => X(c().getItemProps(z(o)), z(s)));
	return Dc(() => z(l)), kc(() => z(o)), Q(e, Y({ as: "div" }, () => z(u), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(Mc, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox-positioner.svelte
var Nc = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Pc(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, Nc), i = qa(), a = io(), o = _(() => X(i().getPositionerProps(), r));
	var s = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	}, c = F(), l = K(c), u = (e) => {
		Q(e, Y({ as: "div" }, () => z(o), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, d = _(() => !a().unmounted);
	return P(l, (e) => {
		z(d) && e(u);
	}), I(e, c), y(s);
}
U(Pc, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+i18n-utils@1.43.3/node_modules/@zag-js/i18n-utils/dist/cache.mjs
function Fc(e) {
	let t = /* @__PURE__ */ new Map();
	return function(n, r) {
		let i = n + (r ? Object.entries(r).sort((e, t) => e[0] < t[0] ? -1 : 1).join() : "");
		if (t.has(i)) return t.get(i);
		let a = new e(n, r);
		return t.set(i, a), a;
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+i18n-utils@1.43.3/node_modules/@zag-js/i18n-utils/dist/format-number.mjs
var Ic = Fc(Intl.NumberFormat);
function Lc(e, t, n = {}) {
	return Ic(t, n).format(e);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+i18n-utils@1.43.3/node_modules/@zag-js/i18n-utils/dist/format-bytes.mjs
var Rc = [
	"",
	"kilo",
	"mega",
	"giga",
	"tera"
], zc = [
	"",
	"kilo",
	"mega",
	"giga",
	"tera",
	"peta"
], Bc = (e, t = "en-US", n = {}) => {
	if (Number.isNaN(e)) return "";
	if (e === 0) return "0 B";
	let { unitSystem: r = "decimal", precision: i = 3, unit: a = "byte", unitDisplay: o = "short" } = n, s = r === "binary" ? 1024 : 1e3, c = a === "bit" ? Rc : zc, l = e < 0, u = Math.abs(e), d = 0;
	for (; u >= s && d < c.length - 1;) u /= s, d++;
	let f = parseFloat(u.toPrecision(i));
	return Lc(l ? -f : f, t, {
		style: "unit",
		unit: c[d] + a,
		unitDisplay: o
	});
};
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/utils.mjs
function Vc(e, t) {
	return e - t * Math.floor(e / t);
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/calendars/GregorianCalendar.mjs
var Hc = 1721426;
function Uc(e, t, n, r) {
	t = Gc(e, t);
	let i = t - 1, a = -2;
	return n <= 2 ? a = 0 : Wc(t) && (a = -1), 1721425 + 365 * i + Math.floor(i / 4) - Math.floor(i / 100) + Math.floor(i / 400) + Math.floor((367 * n - 362) / 12 + a + r);
}
function Wc(e) {
	return e % 4 == 0 && (e % 100 != 0 || e % 400 == 0);
}
function Gc(e, t) {
	return e === "BC" ? 1 - t : t;
}
function Kc(e) {
	let t = "AD";
	return e <= 0 && (t = "BC", e = 1 - e), [t, e];
}
var qc = {
	standard: [
		31,
		28,
		31,
		30,
		31,
		30,
		31,
		31,
		30,
		31,
		30,
		31
	],
	leapyear: [
		31,
		29,
		31,
		30,
		31,
		30,
		31,
		31,
		30,
		31,
		30,
		31
	]
}, Jc = class {
	fromJulianDay(e) {
		let t = e, n = t - Hc, r = Math.floor(n / 146097), i = Vc(n, 146097), a = Math.floor(i / 36524), o = Vc(i, 36524), s = Math.floor(o / 1461), c = Vc(o, 1461), l = Math.floor(c / 365), [u, d] = Kc(r * 400 + a * 100 + s * 4 + l + +(a !== 4 && l !== 4)), f = t - Uc(u, d, 1, 1), p = 2;
		t < Uc(u, d, 3, 1) ? p = 0 : Wc(d) && (p = 1);
		let m = Math.floor(((f + p) * 12 + 373) / 367);
		return new Tu(u, d, m, t - Uc(u, d, m, 1) + 1);
	}
	toJulianDay(e) {
		return Uc(e.era, e.year, e.month, e.day);
	}
	getDaysInMonth(e) {
		return qc[Wc(e.year) ? "leapyear" : "standard"][e.month - 1];
	}
	getMonthsInYear(e) {
		return 12;
	}
	getDaysInYear(e) {
		return Wc(e.year) ? 366 : 365;
	}
	getMaximumMonthsInYear() {
		return 12;
	}
	getMaximumDaysInMonth() {
		return 31;
	}
	getYearsInEra(e) {
		return 9999;
	}
	getEras() {
		return ["BC", "AD"];
	}
	isInverseEra(e) {
		return e.era === "BC";
	}
	balanceDate(e) {
		e.year <= 0 && (e.era = e.era === "BC" ? "AD" : "BC", e.year = 1 - e.year);
	}
	constructor() {
		this.identifier = "gregory";
	}
}, Yc = {
	"001": 1,
	AD: 1,
	AE: 6,
	AF: 6,
	AI: 1,
	AL: 1,
	AM: 1,
	AN: 1,
	AR: 1,
	AT: 1,
	AU: 1,
	AX: 1,
	AZ: 1,
	BA: 1,
	BE: 1,
	BG: 1,
	BH: 6,
	BM: 1,
	BN: 1,
	BY: 1,
	CH: 1,
	CL: 1,
	CM: 1,
	CN: 1,
	CR: 1,
	CY: 1,
	CZ: 1,
	DE: 1,
	DJ: 6,
	DK: 1,
	DZ: 6,
	EC: 1,
	EE: 1,
	EG: 6,
	ES: 1,
	FI: 1,
	FJ: 1,
	FO: 1,
	FR: 1,
	GB: 1,
	GE: 1,
	GF: 1,
	GP: 1,
	GR: 1,
	HR: 1,
	HU: 1,
	IE: 1,
	IQ: 6,
	IR: 6,
	IS: 1,
	IT: 1,
	JO: 6,
	KG: 1,
	KW: 6,
	KZ: 1,
	LB: 1,
	LI: 1,
	LK: 1,
	LT: 1,
	LU: 1,
	LV: 1,
	LY: 6,
	MC: 1,
	MD: 1,
	ME: 1,
	MK: 1,
	MN: 1,
	MQ: 1,
	MV: 5,
	MY: 1,
	NL: 1,
	NO: 1,
	NZ: 1,
	OM: 6,
	PL: 1,
	QA: 6,
	RE: 1,
	RO: 1,
	RS: 1,
	RU: 1,
	SD: 6,
	SE: 1,
	SI: 1,
	SK: 1,
	SM: 1,
	SY: 6,
	TJ: 1,
	TM: 1,
	TR: 1,
	UA: 1,
	UY: 1,
	UZ: 1,
	VA: 1,
	VN: 1,
	XK: 1
};
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/queries.mjs
function Xc(e, t) {
	return t = Ul(t, e.calendar), e.era === t.era && e.year === t.year && e.month === t.month && e.day === t.day;
}
function Zc(e, t) {
	return t = Ul(t, e.calendar), e = hl(e), t = hl(t), e.era === t.era && e.year === t.year && e.month === t.month;
}
function Qc(e, t) {
	return t = Ul(t, e.calendar), e = _l(e), t = _l(t), e.era === t.era && e.year === t.year;
}
function $c(e, t) {
	return nl(e.calendar, t.calendar) && Xc(e, t);
}
function el(e, t) {
	return nl(e.calendar, t.calendar) && Zc(e, t);
}
function tl(e, t) {
	return nl(e.calendar, t.calendar) && Qc(e, t);
}
function nl(e, t) {
	return e.isEqual?.(t) ?? t.isEqual?.(e) ?? e.identifier === t.identifier;
}
function rl(e, t) {
	return Xc(e, sl(t));
}
var il = {
	sun: 0,
	mon: 1,
	tue: 2,
	wed: 3,
	thu: 4,
	fri: 5,
	sat: 6
};
function al(e, t, n) {
	let r = e.calendar.toJulianDay(e), i = n ? il[n] : wl(t), a = Math.ceil(r + 1 - i) % 7;
	return a < 0 && (a += 7), a;
}
function ol(e) {
	return Bl(Date.now(), e);
}
function sl(e) {
	return Vl(ol(e));
}
function cl(e, t) {
	return e.calendar.toJulianDay(e) - t.calendar.toJulianDay(t);
}
function ll(e, t) {
	return ul(e) - ul(t);
}
function ul(e) {
	return e.hour * 36e5 + e.minute * 6e4 + e.second * 1e3 + e.millisecond;
}
var dl = null, fl = !1;
function pl() {
	return dl ??= new Intl.DateTimeFormat().resolvedOptions().timeZone, dl;
}
function ml() {
	return fl;
}
function hl(e) {
	return e.subtract({ days: e.day - 1 });
}
function gl(e) {
	return e.add({ days: e.calendar.getDaysInMonth(e) - e.day });
}
function _l(e) {
	return hl(e.subtract({ months: e.month - 1 }));
}
function vl(e) {
	return gl(e.add({ months: e.calendar.getMonthsInYear(e) - e.month }));
}
function yl(e, t, n) {
	let r = al(e, t, n);
	return e.subtract({ days: r });
}
function bl(e, t, n) {
	return yl(e, t, n).add({ days: 6 });
}
var xl = /* @__PURE__ */ new Map(), Sl = /* @__PURE__ */ new Map();
function Cl(e) {
	if (Intl.Locale) {
		let t = xl.get(e);
		return t || (t = new Intl.Locale(e).maximize().region, t && xl.set(e, t)), t;
	}
	let t = e.split("-")[1];
	return t === "u" ? void 0 : t;
}
function wl(e) {
	let t = Sl.get(e);
	if (!t) {
		if (Intl.Locale) {
			let n = new Intl.Locale(e);
			if ("getWeekInfo" in n && (t = n.getWeekInfo(), t)) return Sl.set(e, t), t.firstDay;
		}
		let n = Cl(e);
		if (e.includes("-fw-")) {
			let n = e.split("-fw-")[1].split("-")[0];
			t = n === "mon" ? { firstDay: 1 } : n === "tue" ? { firstDay: 2 } : n === "wed" ? { firstDay: 3 } : n === "thu" ? { firstDay: 4 } : n === "fri" ? { firstDay: 5 } : n === "sat" ? { firstDay: 6 } : { firstDay: 0 };
		} else t = e.includes("-ca-iso8601") ? { firstDay: 1 } : { firstDay: n && Yc[n] || 0 };
		Sl.set(e, t);
	}
	return t.firstDay;
}
function Tl(e, t, n) {
	let r = e.calendar.getDaysInMonth(e);
	return Math.ceil((al(hl(e), t, n) + r) / 7);
}
function El(e, t) {
	return e && t ? e.compare(t) <= 0 ? e : t : e || t;
}
function Dl(e, t) {
	return e && t ? e.compare(t) >= 0 ? e : t : e || t;
}
var Ol = {
	AF: [4, 5],
	AE: [5, 6],
	BH: [5, 6],
	DZ: [5, 6],
	EG: [5, 6],
	IL: [5, 6],
	IQ: [5, 6],
	IR: [5, 5],
	JO: [5, 6],
	KW: [5, 6],
	LY: [5, 6],
	OM: [5, 6],
	QA: [5, 6],
	SA: [5, 6],
	SD: [5, 6],
	SY: [5, 6],
	YE: [5, 6]
};
function kl(e, t) {
	let n = e.calendar.toJulianDay(e), r = Math.ceil(n + 1) % 7;
	r < 0 && (r += 7);
	let [i, a] = Ol[Cl(t)] || [6, 0];
	return r === i || r === a;
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/conversion.mjs
function Al(e) {
	return e = Ul(e, new Jc()), jl(Gc(e.era, e.year), e.month, e.day, e.hour, e.minute, e.second, e.millisecond);
}
function jl(e, t, n, r, i, a, o) {
	let s = /* @__PURE__ */ new Date();
	return s.setUTCHours(r, i, a, o), s.setUTCFullYear(e, t - 1, n), s.getTime();
}
function Ml(e, t) {
	if (t === "UTC") return 0;
	if (e > 0 && t === pl() && !ml()) return new Date(e).getTimezoneOffset() * -6e4;
	let { year: n, month: r, day: i, hour: a, minute: o, second: s } = Pl(e, t);
	return jl(n, r, i, a, o, s, 0) - Math.floor(e / 1e3) * 1e3;
}
var Nl = /* @__PURE__ */ new Map();
function Pl(e, t) {
	let n = Nl.get(t);
	n || (n = new Intl.DateTimeFormat("en-US", {
		timeZone: t,
		hour12: !1,
		era: "short",
		year: "numeric",
		month: "numeric",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		second: "numeric"
	}), Nl.set(t, n));
	let r = n.formatToParts(new Date(e)), i = {};
	for (let e of r) e.type !== "literal" && (i[e.type] = e.value);
	return {
		year: i.era === "BC" || i.era === "B" ? -i.year + 1 : +i.year,
		month: +i.month,
		day: +i.day,
		hour: i.hour === "24" ? 0 : +i.hour,
		minute: +i.minute,
		second: +i.second
	};
}
var Fl = 864e5;
function Il(e, t, n, r) {
	return (n === r ? [n] : [n, r]).filter((n) => Ll(e, t, n));
}
function Ll(e, t, n) {
	let r = Pl(n, t);
	return e.year === r.year && e.month === r.month && e.day === r.day && e.hour === r.hour && e.minute === r.minute && e.second === r.second;
}
function Rl(e, t, n = "compatible") {
	let r = Hl(e);
	if (t === "UTC") return Al(r);
	if (t === pl() && n === "compatible" && !ml()) {
		r = Ul(r, new Jc());
		let e = /* @__PURE__ */ new Date(), t = Gc(r.era, r.year);
		return e.setFullYear(t, r.month - 1, r.day), e.setHours(r.hour, r.minute, r.second, r.millisecond), e.getTime();
	}
	let i = Al(r), a = Ml(i - Fl, t), o = Ml(i + Fl, t), s = Il(r, t, i - a, i - o);
	if (s.length === 1) return s[0];
	if (s.length > 1) switch (n) {
		case "compatible":
		case "earlier": return s[0];
		case "later": return s[s.length - 1];
		case "reject": throw RangeError("Multiple possible absolute times found");
	}
	switch (n) {
		case "earlier": return Math.min(i - a, i - o);
		case "compatible":
		case "later": return Math.max(i - a, i - o);
		case "reject": throw RangeError("No such absolute time found");
	}
}
function zl(e, t, n = "compatible") {
	return new Date(Rl(e, t, n));
}
function Bl(e, t) {
	let n = Ml(e, t), r = new Date(e + n), i = r.getUTCFullYear(), a = r.getUTCMonth() + 1, o = r.getUTCDate(), s = r.getUTCHours(), c = r.getUTCMinutes(), l = r.getUTCSeconds(), u = r.getUTCMilliseconds();
	return new Du(i < 1 ? "BC" : "AD", i < 1 ? -i + 1 : i, a, o, t, n, s, c, l, u);
}
function Vl(e) {
	return new Tu(e.calendar, e.era, e.year, e.month, e.day);
}
function Hl(e, t) {
	let n = 0, r = 0, i = 0, a = 0;
	if ("timeZone" in e) ({hour: n, minute: r, second: i, millisecond: a} = e);
	else if ("hour" in e && !t) return e;
	return t && ({hour: n, minute: r, second: i, millisecond: a} = t), new Eu(e.calendar, e.era, e.year, e.month, e.day, n, r, i, a);
}
function Ul(e, t) {
	if (nl(e.calendar, t)) return e;
	let n = t.fromJulianDay(e.calendar.toJulianDay(e)), r = e.copy();
	return r.calendar = t, r.era = n.era, r.year = n.year, r.month = n.month, r.day = n.day, $l(r), r;
}
function Wl(e, t, n) {
	return e instanceof Du ? e.timeZone === t ? e : Kl(e, t) : Bl(Rl(e, t, n), t);
}
function Gl(e) {
	let t = Al(e) - e.offset;
	return new Date(t);
}
function Kl(e, t) {
	return Ul(Bl(Al(e) - e.offset, t), e.calendar);
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/manipulation.mjs
var ql = 36e5;
function Jl(e, t) {
	let n = e.copy(), r = "hour" in n ? su(n, t) : 0;
	Yl(n, t.years || 0), n.calendar.balanceYearMonth && n.calendar.balanceYearMonth(n, e), n.month += t.months || 0, Xl(n), Ql(n), n.day += (t.weeks || 0) * 7, n.day += t.days || 0, n.day += r, Zl(n), n.calendar.balanceDate && n.calendar.balanceDate(n), n.year < 1 && (n.year = 1, n.month = 1, n.day = 1);
	let i = n.calendar.getYearsInEra(n);
	if (n.year > i) {
		let e = n.calendar.isInverseEra?.(n);
		n.year = i, n.month = e ? 1 : n.calendar.getMonthsInYear(n), n.day = e ? 1 : n.calendar.getDaysInMonth(n);
	}
	n.month < 1 && (n.month = 1, n.day = 1);
	let a = n.calendar.getMonthsInYear(n);
	return n.month > a && (n.month = a, n.day = n.calendar.getDaysInMonth(n)), n.day = Math.max(1, Math.min(n.calendar.getDaysInMonth(n), n.day)), n;
}
function Yl(e, t) {
	e.calendar.isInverseEra?.(e) && (t = -t), e.year += t;
}
function Xl(e) {
	for (; e.month < 1;) Yl(e, -1), e.month += e.calendar.getMonthsInYear(e);
	let t = 0;
	for (; e.month > (t = e.calendar.getMonthsInYear(e));) e.month -= t, Yl(e, 1);
}
function Zl(e) {
	for (; e.day < 1;) e.month--, Xl(e), e.day += e.calendar.getDaysInMonth(e);
	for (; e.day > e.calendar.getDaysInMonth(e);) e.day -= e.calendar.getDaysInMonth(e), e.month++, Xl(e);
}
function Ql(e) {
	e.month = Math.max(1, Math.min(e.calendar.getMonthsInYear(e), e.month)), e.day = Math.max(1, Math.min(e.calendar.getDaysInMonth(e), e.day));
}
function $l(e) {
	e.calendar.constrainDate && e.calendar.constrainDate(e), e.year = Math.max(1, Math.min(e.calendar.getYearsInEra(e), e.year)), Ql(e);
}
function eu(e) {
	let t = {};
	for (let n in e) typeof e[n] == "number" && (t[n] = -e[n]);
	return t;
}
function tu(e, t) {
	return Jl(e, eu(t));
}
function nu(e, t) {
	let n = e.copy();
	return t.era != null && (n.era = t.era), t.year != null && (n.year = t.year), t.month != null && (n.month = t.month), t.day != null && (n.day = t.day), $l(n), n;
}
function ru(e, t) {
	let n = e.copy();
	return t.hour != null && (n.hour = t.hour), t.minute != null && (n.minute = t.minute), t.second != null && (n.second = t.second), t.millisecond != null && (n.millisecond = t.millisecond), au(n), n;
}
function iu(e) {
	e.second += Math.floor(e.millisecond / 1e3), e.millisecond = ou(e.millisecond, 1e3), e.minute += Math.floor(e.second / 60), e.second = ou(e.second, 60), e.hour += Math.floor(e.minute / 60), e.minute = ou(e.minute, 60);
	let t = Math.floor(e.hour / 24);
	return e.hour = ou(e.hour, 24), t;
}
function au(e) {
	e.millisecond = Math.max(0, Math.min(e.millisecond, 999)), e.second = Math.max(0, Math.min(e.second, 59)), e.minute = Math.max(0, Math.min(e.minute, 59)), e.hour = Math.max(0, Math.min(e.hour, 23));
}
function ou(e, t) {
	let n = e % t;
	return n < 0 && (n += t), n;
}
function su(e, t) {
	return e.hour += t.hours || 0, e.minute += t.minutes || 0, e.second += t.seconds || 0, e.millisecond += t.milliseconds || 0, iu(e);
}
function cu(e, t, n, r) {
	let i = e.copy();
	switch (t) {
		case "era": {
			let t = e.calendar.getEras(), a = t.indexOf(e.era);
			if (a < 0) throw Error("Invalid era: " + e.era);
			a = uu(a, n, 0, t.length - 1, r?.round), i.era = t[a], $l(i);
			break;
		}
		case "year":
			i.calendar.isInverseEra?.(i) && (n = -n), i.year = uu(e.year, n, -Infinity, 9999, r?.round), i.year === -Infinity && (i.year = 1), i.calendar.balanceYearMonth && i.calendar.balanceYearMonth(i, e);
			break;
		case "month":
			i.month = uu(e.month, n, 1, e.calendar.getMonthsInYear(e), r?.round);
			break;
		case "day":
			i.day = uu(e.day, n, 1, e.calendar.getDaysInMonth(e), r?.round);
			break;
		default: throw Error("Unsupported field " + t);
	}
	return e.calendar.balanceDate && e.calendar.balanceDate(i), $l(i), i;
}
function lu(e, t, n, r) {
	let i = e.copy();
	switch (t) {
		case "hour": {
			let t = e.hour, a = 0, o = 23;
			if (r?.hourCycle === 12) {
				let e = t >= 12;
				a = e ? 12 : 0, o = e ? 23 : 11;
			}
			i.hour = uu(t, n, a, o, r?.round);
			break;
		}
		case "minute":
			i.minute = uu(e.minute, n, 0, 59, r?.round);
			break;
		case "second":
			i.second = uu(e.second, n, 0, 59, r?.round);
			break;
		case "millisecond":
			i.millisecond = uu(e.millisecond, n, 0, 999, r?.round);
			break;
		default: throw Error("Unsupported field " + t);
	}
	return i;
}
function uu(e, t, n, r, i = !1) {
	if (i) {
		e += Math.sign(t), e < n && (e = r);
		let i = Math.abs(t);
		e = t > 0 ? Math.ceil(e / i) * i : Math.floor(e / i) * i, e > r && (e = n);
	} else e += t, e < n ? e = r - (n - e - 1) : e > r && (e = n + (e - r - 1));
	return e;
}
function du(e, t) {
	let n;
	return n = t.years != null && t.years !== 0 || t.months != null && t.months !== 0 || t.weeks != null && t.weeks !== 0 || t.days != null && t.days !== 0 ? Rl(Jl(Hl(e), {
		years: t.years,
		months: t.months,
		weeks: t.weeks,
		days: t.days
	}), e.timeZone) : Al(e) - e.offset, n += t.milliseconds || 0, n += (t.seconds || 0) * 1e3, n += (t.minutes || 0) * 6e4, n += (t.hours || 0) * 36e5, Ul(Bl(n, e.timeZone), e.calendar);
}
function fu(e, t) {
	return du(e, eu(t));
}
function pu(e, t, n, r) {
	switch (t) {
		case "hour": {
			let t = 0, i = 23;
			if (r?.hourCycle === 12) {
				let n = e.hour >= 12;
				t = n ? 12 : 0, i = n ? 23 : 11;
			}
			let a = Hl(e), o = Ul(ru(a, { hour: t }), new Jc()), s = [Rl(o, e.timeZone, "earlier"), Rl(o, e.timeZone, "later")].filter((t) => Bl(t, e.timeZone).day === o.day)[0], c = Ul(ru(a, { hour: i }), new Jc()), l = [Rl(c, e.timeZone, "earlier"), Rl(c, e.timeZone, "later")].filter((t) => Bl(t, e.timeZone).day === c.day).pop(), u = Al(e) - e.offset, d = Math.floor(u / ql), f = u % ql;
			return u = uu(d, n, Math.floor(s / ql), Math.floor(l / ql), r?.round) * ql + f, Ul(Bl(u, e.timeZone), e.calendar);
		}
		case "minute":
		case "second":
		case "millisecond": return lu(e, t, n, r);
		case "era":
		case "year":
		case "month":
		case "day": return Ul(Bl(Rl(cu(Hl(e), t, n, r), e.timeZone), e.timeZone), e.calendar);
		default: throw Error("Unsupported field " + t);
	}
}
function mu(e, t, n) {
	let r = Hl(e), i = ru(nu(r, t), t);
	return i.compare(r) === 0 ? e : Ul(Bl(Rl(i, e.timeZone, n), e.timeZone), e.calendar);
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/string.mjs
var hu = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})$/, gu = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})(?:T(\d{2}))?(?::(\d{2}))?(?::(\d{2}))?(\.\d+)?(?:(?:([+-]\d{2})(?::?(\d{2}))?)|Z)$/;
function _u(e) {
	let t = e.match(hu);
	if (!t) throw gu.test(e) ? Error(`Invalid ISO 8601 date string: ${e}. Use parseAbsolute() instead.`) : Error("Invalid ISO 8601 date string: " + e);
	let n = new Tu(vu(t[1], 0, 9999), vu(t[2], 1, 12), 1);
	return n.day = vu(t[3], 1, n.calendar.getDaysInMonth(n)), n;
}
function vu(e, t, n) {
	let r = Number(e);
	if (r < t || r > n) throw RangeError(`Value out of range: ${t} <= ${r} <= ${n}`);
	return r;
}
function yu(e) {
	return `${String(e.hour).padStart(2, "0")}:${String(e.minute).padStart(2, "0")}:${String(e.second).padStart(2, "0")}${e.millisecond ? String(e.millisecond / 1e3).slice(1) : ""}`;
}
function bu(e) {
	let t = Ul(e, new Jc()), n;
	return n = t.era === "BC" ? t.year === 1 ? "0000" : "-" + String(Math.abs(1 - t.year)).padStart(6, "00") : String(t.year).padStart(4, "0"), `${n}-${String(t.month).padStart(2, "0")}-${String(t.day).padStart(2, "0")}`;
}
function xu(e) {
	return `${bu(e)}T${yu(e)}`;
}
function Su(e) {
	let t = Math.sign(e) < 0 ? "-" : "+";
	e = Math.abs(e);
	let n = Math.floor(e / 36e5), r = Math.floor(e % 36e5 / 6e4), i = Math.floor(e % 36e5 % 6e4 / 1e3), a = `${t}${String(n).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
	return i !== 0 && (a += `:${String(i).padStart(2, "0")}`), a;
}
function Cu(e) {
	return `${xu(e)}${Su(e.offset)}[${e.timeZone}]`;
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/CalendarDate.mjs
function wu(e) {
	let t = typeof e[0] == "object" ? e.shift() : new Jc(), n;
	if (typeof e[0] == "string") n = e.shift();
	else {
		let e = t.getEras();
		n = e[e.length - 1];
	}
	let r = e.shift(), i = e.shift(), a = e.shift();
	return [
		t,
		n,
		r,
		i,
		a
	];
}
var Tu = class e {
	constructor(...e) {
		let [t, n, r, i, a] = wu(e);
		this.calendar = t, this.era = n, this.year = r, this.month = i, this.day = a, $l(this);
	}
	copy() {
		return this.era ? new e(this.calendar, this.era, this.year, this.month, this.day) : new e(this.calendar, this.year, this.month, this.day);
	}
	add(e) {
		return Jl(this, e);
	}
	subtract(e) {
		return tu(this, e);
	}
	set(e) {
		return nu(this, e);
	}
	cycle(e, t, n) {
		return cu(this, e, t, n);
	}
	toDate(e) {
		return zl(this, e);
	}
	toString() {
		return bu(this);
	}
	compare(e) {
		return cl(this, e);
	}
}, Eu = class e {
	constructor(...e) {
		let [t, n, r, i, a] = wu(e);
		this.calendar = t, this.era = n, this.year = r, this.month = i, this.day = a, this.hour = e.shift() || 0, this.minute = e.shift() || 0, this.second = e.shift() || 0, this.millisecond = e.shift() || 0, $l(this);
	}
	copy() {
		return this.era ? new e(this.calendar, this.era, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond) : new e(this.calendar, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);
	}
	add(e) {
		return Jl(this, e);
	}
	subtract(e) {
		return tu(this, e);
	}
	set(e) {
		return nu(ru(this, e), e);
	}
	cycle(e, t, n) {
		switch (e) {
			case "era":
			case "year":
			case "month":
			case "day": return cu(this, e, t, n);
			default: return lu(this, e, t, n);
		}
	}
	toDate(e, t) {
		return zl(this, e, t);
	}
	toString() {
		return xu(this);
	}
	compare(e) {
		let t = cl(this, e);
		return t === 0 ? ll(this, Hl(e)) : t;
	}
}, Du = class e {
	constructor(...e) {
		let [t, n, r, i, a] = wu(e), o = e.shift(), s = e.shift();
		this.calendar = t, this.era = n, this.year = r, this.month = i, this.day = a, this.timeZone = o, this.offset = s, this.hour = e.shift() || 0, this.minute = e.shift() || 0, this.second = e.shift() || 0, this.millisecond = e.shift() || 0, $l(this);
	}
	copy() {
		return this.era ? new e(this.calendar, this.era, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond) : new e(this.calendar, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond);
	}
	add(e) {
		return du(this, e);
	}
	subtract(e) {
		return fu(this, e);
	}
	set(e, t) {
		return mu(this, e, t);
	}
	cycle(e, t, n) {
		return pu(this, e, t, n);
	}
	toDate() {
		return Gl(this);
	}
	toString() {
		return Cu(this);
	}
	toAbsoluteString() {
		return this.toDate().toISOString();
	}
	compare(e) {
		return this.toDate().getTime() - Wl(e, this.timeZone).toDate().getTime();
	}
}, Ou = /* @__PURE__ */ new Map(), ku = class {
	constructor(e, t = {}) {
		this.formatter = ju(e, t), this.options = t;
	}
	format(e) {
		return this.formatter.format(e);
	}
	formatToParts(e) {
		return this.formatter.formatToParts(e);
	}
	formatRange(e, t) {
		if (typeof this.formatter.formatRange == "function") return this.formatter.formatRange(e, t);
		if (t < e) throw RangeError("End date must be >= start date");
		return `${this.formatter.format(e)} \u{2013} ${this.formatter.format(t)}`;
	}
	formatRangeToParts(e, t) {
		if (typeof this.formatter.formatRangeToParts == "function") return this.formatter.formatRangeToParts(e, t);
		if (t < e) throw RangeError("End date must be >= start date");
		let n = this.formatter.formatToParts(e), r = this.formatter.formatToParts(t);
		return [
			...n.map((e) => ({
				...e,
				source: "startRange"
			})),
			{
				type: "literal",
				value: " – ",
				source: "shared"
			},
			...r.map((e) => ({
				...e,
				source: "endRange"
			}))
		];
	}
	resolvedOptions() {
		let e = this.formatter.resolvedOptions();
		return Fu() && (this.resolvedHourCycle ||= Iu(e.locale, this.options), e.hourCycle = this.resolvedHourCycle, e.hour12 = this.resolvedHourCycle === "h11" || this.resolvedHourCycle === "h12"), e.calendar === "ethiopic-amete-alem" && (e.calendar = "ethioaa"), e;
	}
}, Au = {
	true: { ja: "h11" },
	false: {}
};
function ju(e, t = {}) {
	if (typeof t.hour12 == "boolean" && Nu()) {
		t = { ...t };
		let n = Au[String(t.hour12)][e.split("-")[0]], r = t.hour12 ? "h12" : "h23";
		t.hourCycle = n ?? r, delete t.hour12;
	}
	let n = e + (t ? Object.entries(t).sort((e, t) => e[0] < t[0] ? -1 : 1).join() : "");
	if (Ou.has(n)) return Ou.get(n);
	let r = new Intl.DateTimeFormat(e, t);
	return Ou.set(n, r), r;
}
var Mu = null;
function Nu() {
	return Mu ??= new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		hour12: !1
	}).format(new Date(2020, 2, 3, 0)) === "24", Mu;
}
var Pu = null;
function Fu() {
	return Pu ??= new Intl.DateTimeFormat("fr", {
		hour: "numeric",
		hour12: !1
	}).resolvedOptions().hourCycle === "h12", Pu;
}
function Iu(e, t) {
	if (!t.timeStyle && !t.hour) return;
	e = e.replace(/(-u-)?-nu-[a-zA-Z0-9]+/, ""), e += (e.includes("-u-") ? "" : "-u") + "-nu-latn";
	let n = ju(e, {
		...t,
		timeZone: void 0
	}), r = parseInt(n.formatToParts(new Date(2020, 2, 3, 0)).find((e) => e.type === "hour").value, 10), i = parseInt(n.formatToParts(new Date(2020, 2, 3, 23)).find((e) => e.type === "hour").value, 10);
	if (r === 0 && i === 23) return "h23";
	if (r === 24 && i === 23) return "h24";
	if (r === 0 && i === 11) return "h11";
	if (r === 12 && i === 11) return "h12";
	throw Error("Unexpected hour cycle result");
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/field/use-field-context.js
var [Lu, Ru] = Rt({
	name: "FieldContext",
	strict: !1
}), zu = (e) => {
	let t = Nt(), n = gn(), r = Ru(), i = _(() => {
		let i = St(e), a = St(i.collection);
		return {
			ids: {
				label: r?.()?.ids.label,
				input: r?.()?.ids.control
			},
			disabled: r?.()?.disabled,
			readOnly: r?.()?.readOnly,
			required: r?.()?.required,
			invalid: r?.()?.invalid,
			dir: n().dir,
			getRootNode: t().getRootNode,
			...i,
			collection: a
		};
	}), a = Tn(vc, () => z(i)), o = _(() => Ms(a, Wt));
	return () => z(o);
}, Bu = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"open",
	"value",
	"inputValue"
]);
function Vu(e, t) {
	let n = m();
	O(t, !0);
	let r = R(t, "ref", 15, null), i = R(t, "open", 15), a = R(t, "value", 15), o = R(t, "inputValue", 15), s = q(t, Bu), c = _(() => no(s)), l = _(() => C(z(c), 2)), u = _(() => z(l)[0]), d = _(() => z(l)[1]), f = _(() => yn()(z(d), /* @__PURE__ */ "allowCustomValue.alwaysSubmitOnEnter.autoFocus.closeOnSelect.collection.composite.defaultHighlightedValue.defaultInputValue.defaultOpen.defaultValue.disabled.disableLayer.form.highlightedValue.id.ids.inputBehavior.inputValue.invalid.loopFocus.multiple.name.navigate.onFocusOutside.onHighlightChange.onInputValueChange.onInteractOutside.onOpenChange.onPointerDownOutside.onSelect.onValueChange.open.openOnChange.openOnClick.openOnKeyPress.placeholder.positioning.readOnly.required.scrollToIndexFn.selectionBehavior.translations.value".split("."))), p = _(() => C(z(f), 2)), h = _(() => z(p)[0]), g = _(() => z(p)[1]), v = _(() => ({
		...z(h),
		id: z(h).id ?? n,
		open: i(),
		value: a(),
		inputValue: o(),
		onOpenChange(e) {
			z(h).onOpenChange?.(e), i() !== void 0 && i(e.open);
		},
		onValueChange(e) {
			z(h).onValueChange?.(e), a() !== void 0 && a(e.value);
		},
		onInputValueChange(e) {
			z(h).onInputValueChange?.(e), o() !== void 0 && o(e.inputValue);
		}
	})), ee = zu(() => z(v)), b = to(() => ({
		present: ee().open,
		...z(u)
	})), x = _(() => X(ee().getRootProps(), z(g)));
	return Ka(ee), ro(b), Q(e, Y({ as: "div" }, () => z(x), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), y({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), M();
		},
		get open() {
			return i();
		},
		set open(e) {
			i(e), M();
		},
		get value() {
			return a();
		},
		set value(e) {
			a(e), M();
		},
		get inputValue() {
			return o();
		},
		set inputValue(e) {
			o(e), M();
		}
	});
}
U(Vu, {
	ref: {},
	open: {},
	value: {},
	inputValue: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/ComboboxStyles.svelte
var Hu = {
	hash: "svelte-n2y5i3",
	code: "[data-scope='combobox'] [part='chip'] .af-avatar {width:16px;height:16px;margin-left:-4px;font-size:8px;line-height:1;}[data-scope='combobox'] [part='chip'] button {display:inline-grid;flex:none;place-items:center;width:16px;height:16px;margin-right:-4px;padding:0;border:0;border-radius:calc(infinity * 1px);background:transparent;color:inherit;outline:none;cursor:pointer;}[data-scope='combobox'] [part='chip'] button:hover:not(:disabled) {background-color:color-mix(in oklab, currentColor 10%, transparent);}[data-scope='combobox'] [part='chip'] button:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[data-scope='combobox'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='combobox'][hidden] {display:none !important;}[data-scope='combobox'][data-part='control'] {display:flex;flex-wrap:wrap;align-items:center;gap:4px;box-sizing:border-box;width:100%;min-width:14em;min-height:36px;padding:4px 12px;border:1px solid var(--k-input);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark, 0) * 100%), transparent);box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);font-size:16px;line-height:24px;transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);}\n  @media (min-width: 48rem) {[data-scope='combobox'][data-part='control'] {font-size:14px;line-height:20px;} }[data-scope='combobox'][data-part='control']:has(input:focus-visible) {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring), 0 1px 2px 0 rgb(0 0 0 / 0.05);}[data-scope='combobox'][data-part='control'][data-disabled] {opacity:0.5;cursor:not-allowed;}[data-scope='combobox'][data-part='input'] {flex:1;min-width:6em;padding:0;border:0;outline:none;background:transparent;color:inherit;font:inherit;}[data-scope='combobox'][data-part='input']::placeholder {color:var(--k-muted);opacity:1;}[data-scope='combobox'][data-part='content'] {display:flex;flex-direction:column;width:var(--reference-width, auto);max-height:300px;padding:4px;}[data-scope='combobox'][data-part='item'] {position:relative;box-sizing:border-box;display:flex;align-items:center;gap:8px;padding:6px 8px;border:0 solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 4px));outline:none;font-size:14px;line-height:20px;cursor:default;-webkit-user-select:none;user-select:none;}[data-scope='combobox'][data-part='item'][data-highlighted] {background-color:var(--k-accent);color:var(--k-accent-fg);}[data-scope='combobox'][data-part='item'][data-state='checked'] {font-weight:600;}[data-scope='combobox'][data-part='item'] .lines {display:flex;flex-direction:column;min-width:0;}[data-scope='combobox'][data-part='item'] .detail {color:var(--k-muted);font-size:12px;line-height:16px;}[data-scope='combobox'][data-part='empty'] {padding:24px 0;font-size:14px;line-height:20px;text-align:center;}[data-scope='combobox'] [part='loading'] {padding:6px 12px;color:var(--k-muted);font-size:14px;line-height:20px;}[data-scope='combobox'] [part='load-more'] {display:flex;box-sizing:border-box;gap:8px;width:100%;margin:0;padding:6px 12px;border:0 solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 4px));background:transparent;color:inherit;font:inherit;font-size:14px;line-height:20px;text-align:start;outline:none;cursor:pointer;}[data-scope='combobox'].people [part='loading'], [data-scope='combobox'].people [part='load-more'] {padding-left:8px;padding-right:8px;}[data-scope='combobox'] [part='load-more']:hover {background-color:var(--k-accent);color:var(--k-accent-fg);}[data-scope='combobox'] [part='load-more']:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}\n  @media (prefers-reduced-motion: reduce) {[data-scope='combobox'][data-part='control'] {transition:none;} }\n  @media (forced-colors: active) {[data-scope='combobox'][data-part='control']:has(input:focus-visible), [data-scope='combobox'] [part='chip'] button:focus-visible,\n    [data-scope='combobox'] [part='load-more']:focus-visible {outline:2px solid;outline-offset:2px;}[data-scope='combobox'][data-part='item'][data-highlighted] {forced-color-adjust:none;background-color:Highlight;color:HighlightText;}\n  }"
};
function Uu(e) {
	ee(e, Hu);
}
U(Uu, {}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/reactivity/set.js
var Wu = [
	"forEach",
	"isDisjointFrom",
	"isSubsetOf",
	"isSupersetOf"
], Gu = [
	"difference",
	"intersection",
	"symmetricDifference",
	"union"
], Ku = !1, qu = class e extends Set {
	#e = /* @__PURE__ */ new Map();
	#t = /* @__PURE__ */ B(0);
	#n = /* @__PURE__ */ B(0);
	#r = de || -1;
	constructor(e) {
		if (super(), e) {
			for (var t of e) super.add(t);
			this.#n.v = super.size;
		}
		Ku || this.#a();
	}
	#i(e) {
		return de === this.#r ? /* @__PURE__ */ B(e) : De(e);
	}
	#a() {
		Ku = !0;
		var t = e.prototype, n = Set.prototype;
		for (let e of Wu) t[e] = function(...t) {
			return z(this.#t), n[e].apply(this, t);
		};
		for (let r of Gu) t[r] = function(...t) {
			z(this.#t);
			var i = n[r].apply(this, t);
			return new e(i);
		};
	}
	has(e) {
		var t = super.has(e), n = this.#e, r = n.get(e);
		if (r === void 0) {
			if (!t) return z(this.#t), !1;
			r = this.#i(!0), n.set(e, r);
		}
		return z(r), t;
	}
	add(e) {
		return super.has(e) || (super.add(e), J(this.#n, super.size), le(this.#t)), this;
	}
	delete(e) {
		var t = super.delete(e), n = this.#e, r = n.get(e);
		return r !== void 0 && (n.delete(e), J(r, !1)), t && (J(this.#n, super.size), le(this.#t)), t;
	}
	clear() {
		if (super.size !== 0) {
			super.clear();
			var e = this.#e;
			for (var t of e.values()) J(t, !1);
			e.clear(), J(this.#n, 0), le(this.#t);
		}
	}
	keys() {
		return this.values();
	}
	values() {
		return z(this.#t), super.values();
	}
	entries() {
		return z(this.#t), super.entries();
	}
	[Symbol.iterator]() {
		return this.keys();
	}
	get size() {
		return z(this.#n);
	}
}, Ju = class extends Map {
	#e = /* @__PURE__ */ new Map();
	#t = /* @__PURE__ */ B(0);
	#n = /* @__PURE__ */ B(0);
	#r = de || -1;
	constructor(e) {
		if (super(), e) {
			for (var [t, n] of e) super.set(t, n);
			this.#n.v = super.size;
		}
	}
	#i(e) {
		return de === this.#r ? /* @__PURE__ */ B(e) : De(e);
	}
	has(e) {
		var t = this.#e, n = t.get(e);
		if (n === void 0) {
			if (super.has(e)) n = this.#i(0), t.set(e, n);
			else return z(this.#t), !1;
		}
		return z(n), !0;
	}
	forEach(e, t) {
		this.#a(), super.forEach(e, t);
	}
	get(e) {
		var t = this.#e, n = t.get(e);
		if (n === void 0) {
			if (super.has(e)) n = this.#i(0), t.set(e, n);
			else {
				z(this.#t);
				return;
			}
		}
		return z(n), super.get(e);
	}
	getOrInsert(e, t) {
		return super.has(e) || this.set(e, t), this.get(e);
	}
	getOrInsertComputed(e, t) {
		return super.has(e) || this.set(e, t(e)), this.get(e);
	}
	set(e, t) {
		var n = this.#e, r = n.get(e), i = super.get(e), a = super.set(e, t), o = this.#t;
		if (r === void 0) r = this.#i(0), n.set(e, r), J(this.#n, super.size), le(o);
		else if (i !== t) {
			le(r);
			var s = o.reactions === null ? null : new Set(o.reactions);
			(s === null || !r.reactions?.every((e) => s.has(e))) && le(o);
		}
		return a;
	}
	delete(e) {
		var t = this.#e, n = t.get(e), r = super.delete(e);
		return n !== void 0 && (t.delete(e), J(n, -1)), r && (J(this.#n, super.size), le(this.#t)), r;
	}
	clear() {
		if (super.size !== 0) {
			super.clear();
			var e = this.#e;
			J(this.#n, 0);
			for (var t of e.values()) J(t, -1);
			le(this.#t), e.clear();
		}
	}
	#a() {
		z(this.#t);
		var e = this.#e;
		if (this.#n.v !== e.size) {
			for (var t of super.keys()) if (!e.has(t)) {
				var n = this.#i(0);
				e.set(t, n);
			}
		}
		for ([, n] of this.#e) z(n);
	}
	keys() {
		return z(this.#t), super.keys();
	}
	values() {
		return this.#a(), super.values();
	}
	entries() {
		return this.#a(), super.entries();
	}
	[Symbol.iterator]() {
		return this.entries();
	}
	get size() {
		return z(this.#n), super.size;
	}
}, Yu = 250;
function Xu(e) {
	try {
		return Promise.resolve(e());
	} catch (e) {
		return Promise.reject(e);
	}
}
function Zu(e) {
	let t = B(null), n = B([]), r = B(null), i = "", a = B(!1), o = B(!1), s = B(!1), c = new Ju(), l = new qu(), u = /* @__PURE__ */ new Set(), d = null, f = /* @__PURE__ */ new Set(), p;
	function m() {
		clearTimeout(p), J(o, !1), d?.abort(), d = null, J(a, !1);
	}
	function h(l, u) {
		let f = z(t);
		if (!f) return;
		l === null && (clearTimeout(p), J(o, !1)), d?.abort();
		let m = new AbortController();
		d = m, J(a, !0), Xu(() => f({
			q: u,
			cursor: l,
			signal: m.signal
		})).then((t) => {
			if (m.signal.aborted) return;
			let a = t?.items ?? [];
			for (let t of a) c.set(e(t), t);
			let o = new Set(l === null ? [] : z(n).map(e)), s = a.filter((t) => !o.has(e(t)) && !!o.add(e(t)));
			J(n, l === null ? s : [...z(n), ...s]), i = u, J(r, t?.next ?? null, !0);
		}, () => {}).finally(() => {
			d === m && (d = null, J(a, !1), l === null && J(s, !0));
		});
	}
	function g() {
		for (let e of f) e.abort();
		f.clear();
	}
	return {
		get items() {
			return z(n);
		},
		get next() {
			return z(r);
		},
		get busy() {
			return z(o) || z(a);
		},
		get listed() {
			return z(s);
		},
		named: c,
		unnamed: l,
		pending(e) {
			return z(o) || z(a) || !!z(t)?.resolve && !l.has(e);
		},
		answered(e) {
			return l.has(e) || !z(t)?.resolve && z(s);
		},
		search(e) {
			z(t) && (clearTimeout(p), J(o, !0), p = setTimeout(() => h(null, e), Yu));
		},
		now(e) {
			h(null, e);
		},
		more() {
			z(r) === null || z(o) || z(a) || h(z(r), i);
		},
		resolve(n) {
			let r = z(t);
			if (!r?.resolve) return;
			let i = [...new Set(n)].filter((e) => !c.has(e) && !u.has(e));
			if (i.length === 0) return;
			for (let e of i) u.add(e);
			let a = new AbortController();
			f.add(a), Xu(() => r.resolve(i, a.signal)).then((t) => {
				if (!a.signal.aborted) for (let n of t ?? []) c.set(e(n), n);
			}, () => {}).finally(() => {
				if (f.delete(a), !a.signal.aborted) for (let e of i) c.has(e) || l.add(e);
			});
		},
		stop: m,
		reset(e) {
			e !== z(t) && (J(t, e), m(), g(), u = /* @__PURE__ */ new Set(), l.clear(), J(n, []), J(r, null), i = "", J(s, !1));
		},
		destroy() {
			m(), g();
		}
	};
}
function Qu(e, t, n, r) {
	let i;
	Te(() => {
		let n = t() ?? null;
		Se(() => {
			n !== i && (i = n, e.reset(n), n && r());
		});
	}), Te(() => {
		let r = t(), i = n();
		r?.resolve && Se(() => e.resolve(i));
	}), Te(() => () => e.destroy());
}
//#endregion
//#region src/kit/Combobox.svelte
var $u = (e, t = b, n = b) => {
	var r = F(), i = K(r);
	E(i, () => Mc, (e, r) => {
		r(e, Y({
			get item() {
				return t();
			},
			part: "option"
		}, n, {
			children: (e, n) => {
				var r = nd(), i = H(r), a = ge(i, !0), o = W(i, 2), s = (e) => {
					var n = td(), r = ge(n, !0);
					G(() => w(r, t().description)), I(e, n);
				};
				P(o, (e) => {
					t().description && e(s);
				}), D(r), G(() => w(a, t().label)), I(e, r);
			},
			$$slots: { default: !0 }
		}));
	}), I(e, r);
};
function ed(e) {
	let t = /* @__PURE__ */ new Set();
	return e.filter((e) => !t.has(e.value) && !!t.add(e.value));
}
var td = L("<span class=\"detail\"> </span>"), nd = L("<span class=\"lines\"><span> </span> <!></span>"), rd = L("<span id=\"af-described\" hidden=\"\"> </span>"), id = L("<span class=\"af-chip secondary\" part=\"chip\"><span> </span> <button type=\"button\" part=\"remove\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button></span>"), ad = L("<button type=\"button\" part=\"clear\" class=\"af-button ghost icon xs\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button>"), od = L("<!> <!> <!>", 1), sd = L("<af-tooltip><!></af-tooltip>", 2), cd = L("<div part=\"loading\"> </div>"), ld = L("<button type=\"button\" part=\"load-more\"> </button>"), ud = L("<!> <!>", 1), dd = L("<div class=\"af-kit\"><!> <!></div>"), fd = {
	hash: "svelte-52f5fd",
	code: ":host {display:inline-block;max-width:100%;vertical-align:middle;}af-tooltip.svelte-52f5fd {display:block;}[data-scope='combobox'][data-part='item'][part='option'] {padding:6px 12px;}[data-scope='combobox'][data-part='item'][part='option'][data-disabled] {opacity:0.5;}"
};
function pd(e, r) {
	O(r, !0), ee(e, fd);
	let i = R(r, "options", 23, () => []), a = R(r, "source", 7, null), o = R(r, "value", 7, null), l = R(r, "multiple", 7, !1), u = R(r, "placeholder", 7, null), f = R(r, "label", 7, null), p = R(r, "loading", 7, !1), m = R(r, "disabled", 7, !1), g = R(r, "locale", 7, null), b = R(r, "strings", 7, null), x = R(r, "name", 7, null), S = R(r, "required", 7, !1), C = R(r, "readonly", 7, !1), T = R(r, "description", 7, null), re = R(r, "error", 7, null), ie = R(r, "invalid", 7, !1), k = r.$$host, A = _(() => c(g(), b() ?? void 0)), ae = _(() => ed(i() ?? [])), oe = _(() => new Map(z(ae).map((e) => [e.value, e]))), j = _(() => [...new Set(Array.isArray(o()) ? o() : o() ? [o()] : [])]), se = B(null), ce = B(!1), L = Zu((e) => e.value);
	Qu(L, () => a(), () => z(j), () => {
		z(ce) && L.now(z(se) ?? "");
	});
	let le = (e) => a() ? L.named.get(e) : z(oe).get(e), ue = _(() => z(j).filter((e) => !le(e)));
	function de(e) {
		let t = le(e);
		return t ? t.label : p() || a() && L.pending(e) ? "…" : (a() ? L.answered(e) : z(ae).length > 0) ? z(ue).length > 1 ? `${z(A).unknownOption} ${z(ue).indexOf(e) + 1}` : z(A).unknownOption : "";
	}
	let V = _(() => z(se) ?? (l() || !z(j)[0] ? "" : de(z(j)[0]))), U = _(() => a() ? L.items : z(ae).filter((e) => dr(e.label, z(se) ?? "") || dr(e.description, z(se) ?? ""))), pe = _(() => Ei({
		items: z(U),
		itemToValue: (e) => e.value,
		itemToString: (e) => e.label,
		isItemDisabled: (e) => !!e.disabled
	})), me = _(() => !!p() || L.busy), he = B(null);
	Te(() => s(z(he), z(ce), k));
	let ve = (e) => n(k, "change", { value: l() ? e : e[0] ?? null }), ye = B(!1), be = _(() => !!m() || z(ye)), xe = _(() => z(be) || !!C()), Se = _(() => [T(), re()].filter(Boolean).join(" ")), Ce = B(null);
	Te(() => {
		let e = !!S() && z(j).length === 0;
		Dr(k, {
			name: x(),
			value: l() ? z(j) : z(j)[0] ?? null,
			validity: e ? { valueMissing: !0 } : {},
			message: e ? d(z(A), "valueMissing") : "",
			anchor: z(Ce)
		});
	}), Or(k, {
		reset() {
			let e = k.getAttribute("value"), t = e ? [e] : [];
			(t.length !== z(j).length || t.some((e, t) => e !== z(j)[t])) && ve(t);
		},
		disabled(e) {
			J(ye, e, !0);
		}
	});
	function we(e) {
		let t = e.target;
		t === z(Ce) || t.closest("button") || (e.preventDefault(), z(Ce)?.focus());
	}
	let q = (e) => e ? { "aria-description": e } : {};
	var Ee = {
		get options() {
			return i();
		},
		set options(e = []) {
			i(e), M();
		},
		get source() {
			return a();
		},
		set source(e = null) {
			a(e), M();
		},
		get value() {
			return o();
		},
		set value(e = null) {
			o(e), M();
		},
		get multiple() {
			return l();
		},
		set multiple(e = !1) {
			l(e), M();
		},
		get placeholder() {
			return u();
		},
		set placeholder(e = null) {
			u(e), M();
		},
		get label() {
			return f();
		},
		set label(e = null) {
			f(e), M();
		},
		get loading() {
			return p();
		},
		set loading(e = !1) {
			p(e), M();
		},
		get disabled() {
			return m();
		},
		set disabled(e = !1) {
			m(e), M();
		},
		get locale() {
			return g();
		},
		set locale(e = null) {
			g(e), M();
		},
		get strings() {
			return b();
		},
		set strings(e = null) {
			b(e), M();
		},
		get name() {
			return x();
		},
		set name(e = null) {
			x(e), M();
		},
		get required() {
			return S();
		},
		set required(e = !1) {
			S(e), M();
		},
		get readonly() {
			return C();
		},
		set readonly(e = !1) {
			C(e), M();
		},
		get description() {
			return T();
		},
		set description(e = null) {
			T(e), M();
		},
		get error() {
			return re();
		},
		set error(e = null) {
			re(e), M();
		},
		get invalid() {
			return ie();
		},
		set invalid(e = !1) {
			ie(e), M();
		}
	}, Y = od(), De = K(Y);
	t(De, {});
	var Oe = W(De, 2);
	Uu(Oe, {});
	var ke = W(Oe, 2);
	return Yt(ke, {
		value: () => k.shadowRoot,
		children: (e, t) => {
			var r = dd(), i = H(r), o = (e) => {
				var t = rd(), n = ge(t, !0);
				G(() => w(n, z(Se))), I(e, t);
			};
			P(i, (e) => {
				z(Se) && e(o);
			});
			var s = W(i, 2), c = () => z(j), d = () => z(V);
			{
				let e = _(() => !!l()), t = _(() => !!C()), r = _(() => !!ie()), i = _(() => a() ? "none" : "autohighlight");
				E(s, () => Vu, (o, s) => {
					s(o, {
						get collection() {
							return z(pe);
						},
						get multiple() {
							return z(e);
						},
						get disabled() {
							return z(be);
						},
						get readOnly() {
							return z(t);
						},
						get invalid() {
							return z(r);
						},
						get inputBehavior() {
							return z(i);
						},
						selectionBehavior: "preserve",
						positioning: {
							strategy: "fixed",
							placement: "bottom-start"
						},
						get scrollToIndexFn() {
							return on;
						},
						get value() {
							return c();
						},
						set value(e) {},
						get inputValue() {
							return d();
						},
						set inputValue(e) {},
						onValueChange: (e) => {
							z(se) !== null && a() && z(ce) && L.search(""), J(se, null), ve(e.value);
						},
						onInputValueChange: (e) => {
							e.reason === "input-change" && (J(se, e.inputValue, !0), n(k, "search", { query: e.inputValue }), a() && L.search(e.inputValue));
						},
						onOpenChange: (e) => {
							e.open ? a() && e.reason !== "input-change" && L.now(z(se) ?? "") : (J(se, null), L.stop());
						},
						get open() {
							return z(ce);
						},
						set open(e) {
							J(ce, e, !0);
						},
						children: (e, t) => {
							var n = ud(), r = K(n);
							E(r, () => wc, (e, t) => {
								t(e, {
									part: "control",
									onmousedown: we,
									children: (e, t) => {
										var n = od(), r = K(n), i = (e) => {
											var t = F(), n = K(t);
											h(n, 16, () => z(j), (e) => e, (e, t) => {
												let n = _(() => de(t));
												var r = id(), i = H(r), a = ge(i, !0), o = W(i, 2);
												D(r), G(() => {
													w(a, z(n)), N(o, "aria-label", `${z(A).remove ?? ""}: ${z(n) ?? ""}`), o.disabled = z(xe);
												}), _e("click", o, () => ve(z(j).filter((e) => e !== t))), I(e, r);
											}), I(e, t);
										};
										P(r, (e) => {
											l() && e(i);
										});
										var a = W(r, 2);
										{
											let e = _(() => u() ?? ""), t = _(() => f() || void 0), n = _(() => z(Se) ? "af-described" : void 0), r = _(() => S() ? "true" : void 0);
											E(a, () => Ec, (i, a) => {
												a(i, {
													part: "input",
													autocomplete: "off",
													spellcheck: "false",
													get placeholder() {
														return z(e);
													},
													get "aria-label"() {
														return z(t);
													},
													get "aria-describedby"() {
														return z(n);
													},
													get "aria-required"() {
														return z(r);
													},
													get ref() {
														return z(Ce);
													},
													set ref(e) {
														J(Ce, e, !0);
													}
												});
											});
										}
										var o = W(a, 2), s = (e) => {
											var t = ad();
											G(() => N(t, "aria-label", z(A).clear)), _e("click", t, () => ve([])), I(e, t);
										};
										P(o, (e) => {
											!l() && z(j)[0] && !z(xe) && e(s);
										}), I(e, n);
									},
									$$slots: { default: !0 }
								});
							});
							var i = W(r, 2);
							E(i, () => Pc, (e, t) => {
								t(e, {
									popover: "manual",
									get ref() {
										return z(he);
									},
									set ref(e) {
										J(he, e, !0);
									},
									children: (e, t) => {
										var n = F(), r = K(n);
										E(r, () => oo, (e, t) => {
											t(e, {
												class: "af-overlay",
												part: "content",
												children: (e, t) => {
													Sn(e, {
														tabStop: !1,
														children: (e, t) => {
															var n = ud(), r = K(n);
															h(r, 17, () => z(pe).items, (e) => e.value, (e, t) => {
																var n = F(), r = K(n), i = (e) => {
																	var n = sd();
																	G(() => v(n, "text", z(t).reason ?? "")), te(n, 1, "svelte-52f5fd");
																	var r = H(n);
																	{
																		let e = _(() => q(z(t).reason));
																		$u(r, () => z(t), () => z(e));
																	}
																	D(n), I(e, n);
																}, a = (e) => {
																	$u(e, () => z(t), () => ({}));
																};
																P(r, (e) => {
																	z(t).disabled ? e(i) : e(a, -1);
																}), I(e, n);
															});
															var i = W(r, 2), o = (e) => {
																var t = cd(), n = ge(t, !0);
																G(() => w(n, z(A).loading)), I(e, t);
															}, s = (e) => {
																var t = ud(), n = K(t), r = (e) => {
																	var t = ld(), n = ge(t, !0);
																	G(() => w(n, z(A).loadMore)), _e("pointerdown", t, (e) => e.preventDefault()), _e("click", t, () => L.more()), I(e, t);
																};
																P(n, (e) => {
																	a() && L.next && e(r);
																});
																var i = W(n, 2);
																E(i, () => Sc, (e, t) => {
																	t(e, {
																		part: "empty",
																		children: (e, t) => {
																			ne();
																			var n = fe();
																			G(() => w(n, z(A).noResults)), I(e, n);
																		},
																		$$slots: { default: !0 }
																	});
																}), I(e, t);
															};
															P(i, (e) => {
																z(me) ? e(o) : e(s, -1);
															}), I(e, n);
														},
														$$slots: { default: !0 }
													});
												},
												$$slots: { default: !0 }
											});
										}), I(e, n);
									},
									$$slots: { default: !0 }
								});
							}), I(e, n);
						},
						$$slots: { default: !0 }
					});
				});
			}
			D(r), I(e, r);
		},
		$$slots: { default: !0 }
	}), I(e, Y), y(Ee);
}
we(["click", "pointerdown"]), U(pd, {
	options: { type: "Array" },
	source: { type: "Object" },
	value: { attribute: "value" },
	multiple: {
		attribute: "multiple",
		type: "Boolean"
	},
	placeholder: {
		attribute: "placeholder",
		type: "String"
	},
	label: {
		attribute: "label",
		type: "String"
	},
	loading: {
		attribute: "loading",
		type: "Boolean"
	},
	disabled: {
		attribute: "disabled",
		reflect: !0,
		type: "Boolean"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" },
	name: {
		attribute: "name",
		reflect: !0,
		type: "String"
	},
	required: {
		attribute: "required",
		type: "Boolean"
	},
	readonly: {
		attribute: "readonly",
		reflect: !0,
		type: "Boolean"
	},
	description: {
		attribute: "description",
		type: "String"
	},
	error: {
		attribute: "error",
		type: "String"
	},
	invalid: {
		attribute: "invalid",
		type: "Boolean"
	}
}, [], [], {
	mode: "open",
	delegatesFocus: !0
}, Er);
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/dialog/use-dialog-context.js
var [md, hd] = Rt({ name: "DialogContext" }), gd = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function _d(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, gd), i = hd(), a = io(), o = _(() => X(i().getContentProps(), a().getPresenceProps(), r));
	function s(e) {
		a().setNode(e);
	}
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	}, l = F(), u = K(l), d = (e) => {
		Q(e, Y({ as: "div" }, () => z(o), {
			[ce()]: s,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = _(() => !a().unmounted);
	return P(u, (e) => {
		z(f) && e(d);
	}), I(e, l), y(c);
}
U(_d, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/dialog/dialog-description.svelte
var vd = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function yd(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, vd), i = hd(), a = _(() => X(i().getDescriptionProps(), r));
	return Q(e, Y({ as: "p" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(yd, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/dialog/dialog-positioner.svelte
var bd = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function xd(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, bd), i = hd(), a = io(), o = _(() => X(i().getPositionerProps(), r));
	var s = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	}, c = F(), l = K(c), u = (e) => {
		Q(e, Y({ as: "div" }, () => z(o), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, d = _(() => !a().unmounted);
	return P(l, (e) => {
		z(d) && e(u);
	}), I(e, c), y(s);
}
U(xd, { ref: {} }, [], [], { mode: "open" });
var Sd = ln("dialog").parts("trigger", "backdrop", "positioner", "content", "title", "description", "closeTrigger").build(), Cd = (e) => e.ids?.positioner ?? `dialog:${e.id}:positioner`, wd = (e) => e.ids?.backdrop ?? `dialog:${e.id}:backdrop`, Td = (e) => e.ids?.content ?? `dialog:${e.id}:content`, Ed = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `dialog:${e.id}:trigger:${t}` : `dialog:${e.id}:trigger` : et(n) ? n(t) : n;
}, Dd = (e) => e.ids?.title ?? `dialog:${e.id}:title`, Od = (e) => e.ids?.description ?? `dialog:${e.id}:description`, kd = (e) => e.ids?.closeTrigger ?? `dialog:${e.id}:close`, Ad = (e) => e.getById(Td(e)), jd = (e) => e.getById(Cd(e)), Md = (e) => e.getById(wd(e)), Nd = (e) => e.getById(Ed(e)), Pd = (e) => e.getById(Dd(e)), Fd = (e) => e.getById(Od(e)), Id = (e) => e.getById(kd(e)), Ld = (e) => ht(e.getRootNode(), `[data-scope="dialog"][data-part="trigger"]${qt(e.id)}`), Rd = (e, t) => t == null ? Nd(e) ?? Ld(e)[0] : e.getById(Ed(e, t));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dialog@1.43.3/node_modules/@zag-js/dialog/dist/dialog.connect.mjs
function zd(e, t) {
	let { state: n, send: r, context: i, prop: a, scope: o } = e, s = a("aria-label"), c = n.matches("open"), l = i.get("triggerValue");
	return {
		open: c,
		setOpen(e) {
			n.matches("open") !== e && r({ type: e ? "OPEN" : "CLOSE" });
		},
		triggerValue: l,
		setTriggerValue(e) {
			r({
				type: "TRIGGER_VALUE.SET",
				value: e
			});
		},
		getTriggerProps(e = {}) {
			let { value: n } = e, i = n != null && l === n;
			return t.button({
				...Sd.trigger.attrs,
				dir: a("dir"),
				id: Ed(o, n),
				"data-ownedby": o.id,
				"data-value": n,
				"aria-haspopup": "dialog",
				type: "button",
				"aria-expanded": n == null ? c : c && i,
				"data-state": c ? "open" : "closed",
				"aria-controls": Td(o),
				"data-current": Z(i),
				onClick(e) {
					e.defaultPrevented || r({
						type: c && n != null && !i ? "TRIGGER_VALUE.SET" : "TOGGLE",
						value: n
					});
				}
			});
		},
		getBackdropProps() {
			return t.element({
				...Sd.backdrop.attrs,
				dir: a("dir"),
				hidden: !c,
				id: wd(o),
				"data-state": c ? "open" : "closed"
			});
		},
		getPositionerProps() {
			return t.element({
				...Sd.positioner.attrs,
				dir: a("dir"),
				id: Cd(o),
				style: vt({ pointerEvents: !c || !a("modal") ? "none" : void 0 })
			});
		},
		getContentProps() {
			let e = i.get("rendered");
			return t.element({
				...Sd.content.attrs,
				dir: a("dir"),
				role: a("role"),
				hidden: !c,
				id: Td(o),
				tabIndex: -1,
				"data-state": c ? "open" : "closed",
				"aria-modal": a("modal"),
				"aria-label": s || void 0,
				"aria-labelledby": s || !e.title ? void 0 : Dd(o),
				"aria-describedby": e.description ? Od(o) : void 0,
				style: vt({ pointerEvents: a("modal") ? void 0 : "auto" })
			});
		},
		getTitleProps() {
			return t.element({
				...Sd.title.attrs,
				dir: a("dir"),
				id: Dd(o)
			});
		},
		getDescriptionProps() {
			return t.element({
				...Sd.description.attrs,
				dir: a("dir"),
				id: Od(o)
			});
		},
		getCloseTriggerProps() {
			return t.button({
				...Sd.closeTrigger.attrs,
				dir: a("dir"),
				id: kd(o),
				type: "button",
				onClick(e) {
					e.defaultPrevented || (e.stopPropagation(), r({ type: "CLOSE" }));
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+aria-hidden@1.43.3/node_modules/@zag-js/aria-hidden/dist/walk-tree-outside.mjs
var Bd = /* @__PURE__ */ new WeakMap(), Vd = /* @__PURE__ */ new WeakMap(), Hd = {}, Ud = 0, Wd = (e) => e && (e.host || Wd(e.parentNode)), Gd = (e, t) => t.map((t) => {
	if (e.contains(t)) return t;
	let n = Wd(t);
	return n && e.contains(n) ? n : (console.error("[zag-js > ariaHidden] target", t, "in not contained inside", e, ". Doing nothing"), null);
}).filter((e) => !!e), Kd = /* @__PURE__ */ new Set([
	"script",
	"output",
	"status",
	"next-route-announcer"
]), qd = (e) => Kd.has(e.localName) || e.role === "status" || e.hasAttribute("aria-live") ? !0 : e.matches("[data-live-announcer]"), Jd = (e, t) => {
	let { parentNode: n, markerName: r, controlAttribute: i, explicitBooleanValue: a, followControlledElements: o = !0 } = t, s = Gd(n, Array.isArray(e) ? e : [e]);
	Hd[r] || (Hd[r] = /* @__PURE__ */ new WeakMap());
	let c = Hd[r], l = [], u = /* @__PURE__ */ new Set(), d = new Set(s), f = (e) => {
		e && !u.has(e) && (u.add(e), f(e.parentNode));
	};
	s.forEach((e) => {
		f(e), o && Bt(e) && Pi(e, (e) => {
			f(e);
		});
	});
	let p = (e) => {
		e && !d.has(e) && Array.prototype.forEach.call(e.children, (e) => {
			if (u.has(e)) p(e);
			else try {
				if (qd(e)) return;
				let t = e.getAttribute(i), n = a ? t === "true" : t !== null && t !== "false", o = (Bd.get(e) || 0) + 1, s = (c.get(e) || 0) + 1;
				Bd.set(e, o), c.set(e, s), l.push(e), o === 1 && n && Vd.set(e, !0), s === 1 && e.setAttribute(r, ""), n || e.setAttribute(i, a ? "true" : "");
			} catch (t) {
				console.error("[zag-js > ariaHidden] cannot operate on ", e, t);
			}
		});
	};
	return p(n), u.clear(), Ud++, () => {
		l.forEach((e) => {
			let t = Bd.get(e) - 1, n = c.get(e) - 1;
			Bd.set(e, t), c.set(e, n), t || (Vd.has(e) || e.removeAttribute(i), Vd.delete(e)), n || e.removeAttribute(r);
		}), Ud--, Ud || (Bd = /* @__PURE__ */ new WeakMap(), Bd = /* @__PURE__ */ new WeakMap(), Vd = /* @__PURE__ */ new WeakMap(), Hd = {});
	};
}, Yd = (e) => (Array.isArray(e) ? e[0] : e).ownerDocument.body, Xd = (e, t = Yd(e), n = "data-aria-hidden", r = !0) => {
	if (t) return Jd(e, {
		parentNode: t,
		markerName: n,
		controlAttribute: "aria-hidden",
		explicitBooleanValue: !0,
		followControlledElements: r
	});
}, Zd = (e) => {
	let t = requestAnimationFrame(() => e());
	return () => cancelAnimationFrame(t);
};
function Qd(e, t = {}) {
	let { defer: n = !0 } = t, r = n ? Zd : (e) => e(), i = [];
	return i.push(r(() => {
		let t = (typeof e == "function" ? e() : e).filter(Boolean);
		t.length !== 0 && i.push(Xd(t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+focus-trap@1.43.3/node_modules/@zag-js/focus-trap/dist/chunk-QZ7TP4HQ.mjs
var $d = Object.defineProperty, ef = (e, t, n) => t in e ? $d(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, tf = (e, t, n) => ef(e, typeof t == "symbol" ? t : t + "", n), nf = {
	activateTrap(e, t) {
		if (e.length > 0) {
			let n = e[e.length - 1];
			n !== t && n.pause();
		}
		let n = e.indexOf(t);
		n === -1 || e.splice(n, 1), e.push(t);
	},
	deactivateTrap(e, t) {
		let n = e.indexOf(t);
		n !== -1 && e.splice(n, 1), e.length > 0 && e[e.length - 1].unpause();
	}
}, rf = [], af = class {
	constructor(e, t) {
		tf(this, "trapStack"), tf(this, "config"), tf(this, "doc"), tf(this, "state", {
			containers: [],
			containerGroups: [],
			tabbableGroups: [],
			nodeFocusedBeforeActivation: null,
			mostRecentlyFocusedNode: null,
			active: !1,
			paused: !1,
			delayInitialFocusTimer: void 0,
			recentNavEvent: void 0
		}), tf(this, "lastInteractionType", "keyboard"), tf(this, "portalContainers", /* @__PURE__ */ new Set()), tf(this, "listenerCleanups", []), tf(this, "handleFocus", (e) => {
			let t = lt(e), n = this.findContainerIndex(t, e) >= 0;
			if (n || Ft(t)) n && (this.state.mostRecentlyFocusedNode = t);
			else {
				e.stopImmediatePropagation();
				let t, n = !0;
				if (this.state.mostRecentlyFocusedNode) {
					if (fa(this.state.mostRecentlyFocusedNode) > 0) {
						let e = this.findContainerIndex(this.state.mostRecentlyFocusedNode), { tabbableNodes: r } = this.state.containerGroups[e];
						if (r.length > 0) {
							let e = r.findIndex((e) => e === this.state.mostRecentlyFocusedNode);
							e >= 0 && (this.config.isKeyForward(this.state.recentNavEvent) ? e + 1 < r.length && (t = r[e + 1], n = !1) : e - 1 >= 0 && (t = r[e - 1], n = !1));
						}
					} else this.state.containerGroups.some((e) => e.tabbableNodes.some((e) => fa(e) > 0)) || (n = !1);
				} else n = !1;
				n && (t = this.findNextNavNode({
					target: this.state.mostRecentlyFocusedNode,
					isBackward: this.config.isKeyBackward(this.state.recentNavEvent)
				})), t ? this.tryFocus(t) : this.tryFocus(this.state.mostRecentlyFocusedNode || this.getInitialFocusNode());
			}
			this.state.recentNavEvent = void 0;
		}), tf(this, "handlePointerDown", (e) => {
			this.lastInteractionType = "pointer";
			let t = lt(e);
			if (!(this.findContainerIndex(t, e) >= 0)) {
				if (uf(this.config.clickOutsideDeactivates, e)) {
					this.deactivate({ returnFocus: this.config.returnFocusOnDeactivate });
					return;
				}
				uf(this.config.allowOutsideClick, e) || e.preventDefault();
			}
		}), tf(this, "handleClick", (e) => {
			let t = lt(e);
			this.findContainerIndex(t, e) >= 0 || uf(this.config.clickOutsideDeactivates, e) || uf(this.config.allowOutsideClick, e) || (e.preventDefault(), e.stopImmediatePropagation());
		}), tf(this, "handleTabKey", (e) => {
			if (this.lastInteractionType = "keyboard", this.config.isKeyForward(e) || this.config.isKeyBackward(e)) {
				this.state.recentNavEvent = e;
				let t = this.config.isKeyBackward(e), n = this.findNextNavNode({
					event: e,
					isBackward: t
				});
				if (!n) return;
				sf(e) && e.preventDefault(), this.tryFocus(n);
			}
		}), tf(this, "handleEscapeKey", (e) => {
			df(e) && uf(this.config.escapeDeactivates, e) !== !1 && (e.preventDefault(), this.deactivate());
		}), tf(this, "_mutationObserver"), tf(this, "setupMutationObserver", () => {
			let e = this.doc.defaultView || window;
			this._mutationObserver = new e.MutationObserver((e) => {
				e.some((e) => Array.from(e.removedNodes).some((e) => e === this.state.mostRecentlyFocusedNode)) && this.tryFocus(this.getInitialFocusNode()), e.some((e) => e.type === "attributes" && (e.attributeName === "aria-controls" || e.attributeName === "aria-expanded") || e.type === "childList" && e.addedNodes.length > 0 && Array.from(e.addedNodes).some((e) => {
					if (e.nodeType !== Node.ELEMENT_NODE) return !1;
					let t = e;
					return Ri(t) ? !0 : t.id && !this.state.containers.some((e) => e.contains(t)) ? zi(t) : !1;
				})) && this.state.active && !this.state.paused && (this.updateTabbableNodes(), this.updatePortalContainers());
			});
		}), tf(this, "updateObservedNodes", () => {
			this._mutationObserver?.disconnect(), this.state.active && !this.state.paused && (this.state.containers.map((e) => {
				this._mutationObserver?.observe(e, {
					subtree: !0,
					childList: !0,
					attributes: !0,
					attributeFilter: ["aria-controls", "aria-expanded"]
				});
			}), this.portalContainers.forEach((e) => {
				this.observePortalContainer(e);
			}));
		}), tf(this, "getInitialFocusNode", () => {
			let e = this.getNodeForOption("initialFocus", { hasFallback: !0 });
			if (e === !1) return !1;
			if (e === void 0 || e && !ca(e)) {
				let t = dt(this.doc);
				if (t && this.findContainerIndex(t) >= 0) e = t;
				else {
					let t = this.state.tabbableGroups[0];
					e = t && t.firstTabbableNode || this.getNodeForOption("fallbackFocus");
				}
			} else e === null && (e = this.getNodeForOption("fallbackFocus"));
			if (!e || (e.isConnected || (e = this.getNodeForOption("fallbackFocus")), !e || !e.isConnected)) throw Error("Your focus-trap needs to have at least one focusable element");
			return e;
		}), tf(this, "tryFocus", (e, t) => {
			if (e !== !1 && e !== dt(this.doc)) {
				if (!e || !e.focus) {
					this.tryFocus(this.getInitialFocusNode());
					return;
				}
				e.focus({
					preventScroll: !!this.config.preventScroll,
					...t
				}), this.state.mostRecentlyFocusedNode = e, pf(e) && e.select();
			}
		}), tf(this, "deactivate", (e) => {
			if (!this.state.active) return this;
			let t = {
				onDeactivate: this.config.onDeactivate,
				onPostDeactivate: this.config.onPostDeactivate,
				checkCanReturnFocus: this.config.checkCanReturnFocus,
				...e
			};
			clearTimeout(this.state.delayInitialFocusTimer), this.state.delayInitialFocusTimer = void 0, this.removeListeners(), this.state.active = !1, this.state.paused = !1, this.updateObservedNodes(), nf.deactivateTrap(this.trapStack, this), this.portalContainers.clear();
			let n = this.getOption(t, "onDeactivate"), r = this.getOption(t, "onPostDeactivate"), i = this.getOption(t, "checkCanReturnFocus"), a = this.getOption(t, "returnFocus", "returnFocusOnDeactivate");
			n?.();
			let o = () => {
				ff(() => {
					if (a && this.isSafeToOverrideFocus()) {
						let e = this.getReturnFocusNode(this.state.nodeFocusedBeforeActivation), t = this.lastInteractionType === "keyboard" ? { focusVisible: !0 } : void 0;
						this.tryFocus(e, t);
					}
					r?.();
				});
			};
			return a && i ? (i(this.getReturnFocusNode(this.state.nodeFocusedBeforeActivation)).then(o, o), this) : (o(), this);
		}), tf(this, "pause", (e) => {
			if (this.state.paused || !this.state.active) return this;
			let t = this.getOption(e, "onPause"), n = this.getOption(e, "onPostPause");
			return this.state.paused = !0, t?.(), this.removeListeners(), this.updateObservedNodes(), n?.(), this;
		}), tf(this, "unpause", (e) => {
			if (!this.state.paused || !this.state.active) return this;
			let t = this.getOption(e, "onUnpause"), n = this.getOption(e, "onPostUnpause");
			this.state.paused = !1, t?.();
			try {
				this.updateTabbableNodes();
			} catch {}
			this.attachListeners();
			try {
				this.commitInitialFocus();
			} catch {}
			return this.updateObservedNodes(), n?.(), this;
		}), tf(this, "updateContainerElements", (e) => (this.state.containers = Array.isArray(e) ? e.filter(Boolean) : [e].filter(Boolean), this.state.active && this.updateTabbableNodes(), this.updateObservedNodes(), this)), tf(this, "getReturnFocusNode", (e) => {
			let t = this.getNodeForOption("setReturnFocus", { params: [e] });
			return t || t !== !1 && e;
		}), tf(this, "getOption", (e, t, n) => e && e[t] !== void 0 ? e[t] : this.config[n || t]), tf(this, "getNodeForOption", (e, { hasFallback: t = !1, params: n = [] } = {}) => {
			let r = this.config[e];
			if (typeof r == "function" && (r = r(...n)), r === !0 && (r = void 0), !r) {
				if (r === void 0 || r === !1) return r;
				throw Error(`\`${e}\` was specified but was not a node, or did not return a node`);
			}
			let i = r;
			if (typeof r == "string") {
				try {
					i = this.doc.querySelector(r);
				} catch (t) {
					throw Error(`\`${e}\` appears to be an invalid selector; error="${t.message}"`);
				}
				if (!i && !t) throw Error(`\`${e}\` as selector refers to no known node`);
			}
			return i;
		}), tf(this, "findNextNavNode", (e) => {
			let { event: t, isBackward: n = !1 } = e, r = e.target || lt(t);
			this.updateTabbableNodes();
			let i = null;
			if (this.state.tabbableGroups.length > 0) {
				let e = this.findContainerIndex(r, t), a = e >= 0 ? this.state.containerGroups[e] : void 0;
				if (e < 0) i = n ? this.state.tabbableGroups[this.state.tabbableGroups.length - 1].lastTabbableNode : this.state.tabbableGroups[0].firstTabbableNode;
				else if (n) {
					let n = this.state.tabbableGroups.findIndex(({ firstTabbableNode: e }) => r === e);
					if (n < 0 && (a?.container === r || ca(r) && !ua(r) && !a?.nextTabbableNode(r, !1)) && (n = e), n >= 0) {
						let e = n === 0 ? this.state.tabbableGroups.length - 1 : n - 1, t = this.state.tabbableGroups[e];
						i = fa(r) >= 0 ? t.lastTabbableNode : t.lastDomTabbableNode;
					} else sf(t) || (i = a?.nextTabbableNode(r, !1));
				} else {
					let n = this.state.tabbableGroups.findIndex(({ lastTabbableNode: e }) => r === e);
					if (n < 0 && (a?.container === r || ca(r) && !ua(r) && !a?.nextTabbableNode(r)) && (n = e), n >= 0) {
						let e = n === this.state.tabbableGroups.length - 1 ? 0 : n + 1, t = this.state.tabbableGroups[e];
						i = fa(r) >= 0 ? t.firstTabbableNode : t.firstDomTabbableNode;
					} else sf(t) || (i = a?.nextTabbableNode(r));
				}
			} else i = this.getNodeForOption("fallbackFocus");
			return i;
		}), this.trapStack = t.trapStack || rf;
		let n = {
			returnFocusOnDeactivate: !0,
			escapeDeactivates: !0,
			delayInitialFocus: !0,
			followControlledElements: !0,
			isKeyForward: cf,
			isKeyBackward: lf,
			...t
		};
		this.doc = n.document || je(Array.isArray(e) ? e[0] : e), this.config = n, this.updateContainerElements(e), this.setupMutationObserver();
	}
	addPortalContainer(e) {
		let t = e.parentElement;
		t && !this.portalContainers.has(t) && (this.portalContainers.add(t), this.state.active && !this.state.paused && this.observePortalContainer(t));
	}
	observePortalContainer(e) {
		this._mutationObserver?.observe(e, {
			subtree: !0,
			childList: !0,
			attributes: !0,
			attributeFilter: ["aria-controls", "aria-expanded"]
		});
	}
	updatePortalContainers() {
		this.config.followControlledElements && this.state.containers.forEach((e) => {
			Fi(e).forEach((e) => {
				this.addPortalContainer(e);
			});
		});
	}
	get active() {
		return this.state.active;
	}
	get paused() {
		return this.state.paused;
	}
	findContainerIndex(e, t) {
		let n = typeof t?.composedPath == "function" ? t.composedPath() : void 0;
		return this.state.containerGroups.findIndex(({ container: r, tabbableNodes: i }) => r.contains(e) || n?.includes(r) || i.find((t) => t === e) || this.isControlledElement(r, e) || this.isPersistentElement(e, t));
	}
	isControlledElement(e, t) {
		return this.config.followControlledElements ? Ni(e, t) : !1;
	}
	isPersistentElement(e, t) {
		let n = this.config.persistentElements;
		if (!n || n.length === 0) return !1;
		let r = typeof t?.composedPath == "function" ? t.composedPath() : void 0;
		return n.some((t) => {
			let n = t();
			return kt(n, e) || n != null && r?.includes(n);
		});
	}
	updateTabbableNodes() {
		if (this.state.containerGroups = this.state.containers.map((e) => {
			let t = la(e, { getShadowRoot: this.config.getShadowRoot }), n = sa(e, { getShadowRoot: this.config.getShadowRoot }), r = t[0], i = t[t.length - 1], a = r, o = i, s = !1;
			for (let e = 0; e < t.length; e++) if (fa(t[e]) > 0) {
				s = !0;
				break;
			}
			function c(e, r = !0) {
				let i = t.indexOf(e);
				if (i >= 0) return t[i + (r ? 1 : -1)];
				let a = n.indexOf(e);
				if (!(a < 0)) {
					if (r) {
						for (let e = a + 1; e < n.length; e++) if (ua(n[e])) return n[e];
					} else for (let e = a - 1; e >= 0; e--) if (ua(n[e])) return n[e];
				}
			}
			return {
				container: e,
				tabbableNodes: t,
				focusableNodes: n,
				posTabIndexesFound: s,
				firstTabbableNode: r,
				lastTabbableNode: i,
				firstDomTabbableNode: a,
				lastDomTabbableNode: o,
				nextTabbableNode: c
			};
		}), this.state.tabbableGroups = this.state.containerGroups.filter((e) => e.tabbableNodes.length > 0), this.state.tabbableGroups.length <= 0 && !this.getNodeForOption("fallbackFocus")) throw Error("Your focus-trap must have at least one container with at least one tabbable node in it at all times");
		if (this.state.containerGroups.find((e) => e.posTabIndexesFound) && this.state.containerGroups.length > 1) throw Error("At least one node with a positive tabindex was found in one of your focus-trap's multiple containers. Positive tabindexes are only supported in single-container focus-traps.");
	}
	attachListeners() {
		if (this.state.active) return nf.activateTrap(this.trapStack, this), this.listenerCleanups.push(Ne(this.doc, "focusin", this.handleFocus, !0), Ne(this.doc, "mousedown", this.handlePointerDown, {
			capture: !0,
			passive: !1
		}), Ne(this.doc, "touchstart", this.handlePointerDown, {
			capture: !0,
			passive: !1
		}), Ne(this.doc, "click", this.handleClick, {
			capture: !0,
			passive: !1
		}), Ne(this.doc, "keydown", this.handleTabKey, {
			capture: !0,
			passive: !1
		}), Ne(this.doc, "keydown", this.handleEscapeKey)), this;
	}
	commitInitialFocus() {
		return this.state.delayInitialFocusTimer = this.config.delayInitialFocus ? ff(() => {
			this.tryFocus(this.getInitialFocusNode());
		}) : this.tryFocus(this.getInitialFocusNode()), this;
	}
	addListeners() {
		if (this.state.active) return this.attachListeners(), this.commitInitialFocus(), this;
	}
	removeListeners() {
		if (this.state.active) return this.listenerCleanups.forEach((e) => e()), this.listenerCleanups = [], this;
	}
	containsElement(e) {
		return this.state.containers.some((t) => kt(t, e));
	}
	isSafeToOverrideFocus() {
		let e = dt(this.doc);
		return !e || e === this.doc.body || this.containsElement(e) ? !0 : this.trapStack.some((t) => t !== this && t.containsElement(e));
	}
	activate(e) {
		if (this.state.active) return this;
		let t = this.getOption(e, "onActivate"), n = this.getOption(e, "onPostActivate"), r = this.getOption(e, "checkCanFocusTrap");
		r || this.updateTabbableNodes(), this.state.active = !0, this.state.paused = !1, this.state.nodeFocusedBeforeActivation = dt(this.doc), t?.();
		let i = () => {
			r && this.updateTabbableNodes(), this.addListeners(), this.updateObservedNodes(), n?.();
		};
		return r ? (r(this.state.containers.concat()).then(i, i), this) : (i(), this);
	}
}, of = (e) => e?.type === "keydown", sf = (e) => of(e) && e?.key === "Tab", cf = (e) => of(e) && e.key === "Tab" && !e?.shiftKey, lf = (e) => of(e) && e.key === "Tab" && e?.shiftKey, uf = (e, ...t) => typeof e == "function" ? e(...t) : e, df = (e) => !e.isComposing && e.key === "Escape", ff = (e) => setTimeout(e, 0), pf = (e) => e.localName === "input" && "select" in e && typeof e.select == "function";
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+focus-trap@1.43.3/node_modules/@zag-js/focus-trap/dist/index.mjs
function mf(e, t = {}) {
	let n, r = en(() => {
		let r = (Array.isArray(e) ? e : [e]).map((e) => typeof e == "function" ? e() : e).filter((e) => e != null);
		if (r.length === 0) return;
		let i = r[0];
		n = new af(r, {
			escapeDeactivates: !1,
			allowOutsideClick: !0,
			preventScroll: !0,
			returnFocusOnDeactivate: !0,
			delayInitialFocus: !1,
			fallbackFocus: i,
			...t,
			document: je(i)
		});
		try {
			n.activate();
		} catch {}
	});
	return function() {
		n?.deactivate(), r();
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+remove-scroll@1.43.3/node_modules/@zag-js/remove-scroll/dist/index.mjs
var hf = "data-scroll-lock", gf = /* @__PURE__ */ new WeakMap();
function _f(e) {
	let t = e.getBoundingClientRect().left;
	return Math.round(t) + e.scrollLeft ? "paddingLeft" : "paddingRight";
}
function vf(e) {
	let t = Tt(e)?.scrollbarGutter;
	return t === "stable" || t?.startsWith("stable ") === !0;
}
function yf(e) {
	let { documentElement: t, body: n } = e;
	return wa(t) ? t : n;
}
function bf(e) {
	let t = e.defaultView ?? window, { documentElement: n, body: r } = e, i = yf(e), a = vf(n) || vf(r), o = t.innerWidth - n.clientWidth;
	r.setAttribute(hf, "");
	let s = () => Jt(n, "--scrollbar-width", `${o}px`), c = _f(n), l = [s(), $e() ? (() => {
		let { scrollX: e, scrollY: n, visualViewport: i } = t, s = i?.offsetLeft ?? 0, l = i?.offsetTop ?? 0, u = {
			position: "fixed",
			overflow: "hidden",
			top: `${-(n - Math.floor(l))}px`,
			left: `${-(e - Math.floor(s))}px`,
			right: "0"
		};
		!a && o > 0 && (u[c] = `${o}px`);
		let d = rn(r, u);
		return () => {
			d?.(), t.scrollTo({
				left: e,
				top: n,
				behavior: "instant"
			});
		};
	})() : (() => {
		let e = { overflow: "hidden" };
		return !a && o > 0 && (e[c] = `${o}px`), rn(i, e);
	})()];
	return () => {
		l.forEach((e) => e?.()), r.removeAttribute(hf);
	};
}
function xf(e) {
	let t = e ?? document, n = gf.get(t);
	n || (n = {
		count: 0,
		cleanup: bf(t)
	}, gf.set(t, n)), n.count++;
	let r = n, i = !1;
	return () => {
		i || (i = !0, r.count--, r.count === 0 && (r.cleanup(), gf.delete(t)));
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dialog@1.43.3/node_modules/@zag-js/dialog/dist/dialog.machine.mjs
var Sf = Pn({
	props({ props: e, scope: t }) {
		let n = e.role === "alertdialog", r = n ? () => Id(t) : void 0, i = typeof e.modal != "boolean" || e.modal;
		return {
			role: "dialog",
			modal: i,
			trapFocus: i,
			preventScroll: i,
			closeOnInteractOutside: i && !n,
			closeOnEscape: !0,
			restoreFocus: !0,
			initialFocusEl: r,
			...e
		};
	},
	initialState({ prop: e }) {
		return e("open") || e("defaultOpen") ? "open" : "closed";
	},
	context({ bindable: e, prop: t, scope: n }) {
		return {
			rendered: e(() => ({ defaultValue: {
				title: !0,
				description: !0
			} })),
			triggerValue: e(() => ({
				defaultValue: t("defaultTriggerValue") ?? null,
				value: t("triggerValue"),
				onChange(e) {
					let r = t("onTriggerValueChange");
					r && r({
						value: e,
						triggerElement: Rd(n, e)
					});
				}
			}))
		};
	},
	watch({ track: e, action: t, prop: n }) {
		e([() => n("open")], () => {
			t(["toggleVisibility"]);
		});
	},
	states: {
		open: {
			entry: ["checkRenderedElements", "setInitialFocus"],
			effects: [
				"trackDismissableElement",
				"trapFocus",
				"preventScroll",
				"hideContentBelow"
			],
			on: {
				"CONTROLLED.CLOSE": { target: "closed" },
				CLOSE: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closed",
					actions: ["invokeOnClose"]
				}],
				TOGGLE: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closed",
					actions: ["invokeOnClose"]
				}],
				"TRIGGER_VALUE.SET": { actions: ["setTriggerValue"] }
			}
		},
		closed: { on: {
			"CONTROLLED.OPEN": { target: "open" },
			OPEN: [{
				guard: "isOpenControlled",
				actions: ["invokeOnOpen", "setTriggerValue"]
			}, {
				target: "open",
				actions: ["invokeOnOpen", "setTriggerValue"]
			}],
			TOGGLE: [{
				guard: "isOpenControlled",
				actions: ["invokeOnOpen", "setTriggerValue"]
			}, {
				target: "open",
				actions: ["invokeOnOpen", "setTriggerValue"]
			}],
			"TRIGGER_VALUE.SET": { actions: ["setTriggerValue"] }
		} }
	},
	implementations: {
		guards: { isOpenControlled: ({ prop: e }) => e("open") != null },
		effects: {
			trackDismissableElement({ scope: e, send: t, prop: n }) {
				return sc(() => Ad(e), {
					type: "dialog",
					defer: !0,
					pointerBlocking: n("modal"),
					layerStyleTargets: [() => Md(e), () => jd(e)],
					exclude: [Nd(e), ...Ld(e)].filter(Boolean),
					onInteractOutside(e) {
						n("onInteractOutside")?.(e), n("closeOnInteractOutside") || e.preventDefault();
					},
					persistentElements: n("persistentElements"),
					onFocusOutside: n("onFocusOutside"),
					onPointerDownOutside: n("onPointerDownOutside"),
					onRequestDismiss: n("onRequestDismiss"),
					onEscapeKeyDown(e) {
						n("onEscapeKeyDown")?.(e), n("closeOnEscape") || e.preventDefault();
					},
					onDismiss() {
						t({
							type: "CLOSE",
							src: "interact-outside"
						});
					}
				});
			},
			preventScroll({ scope: e, prop: t }) {
				if (t("preventScroll")) return xf(e.getDoc());
			},
			trapFocus({ scope: e, prop: t, context: n }) {
				return t("trapFocus") ? mf(() => Ad(e), {
					preventScroll: !0,
					returnFocusOnDeactivate: !!t("restoreFocus"),
					initialFocus: () => pa({
						root: Ad(e),
						getInitialEl: t("initialFocusEl")
					}),
					setReturnFocus: (r) => {
						let i = t("finalFocusEl")?.();
						if (i) return i;
						let a = n.get("triggerValue");
						if (a) {
							let t = Rd(e, a);
							if (t) return t;
						}
						return Ld(e)[0] || r;
					},
					getShadowRoot: !0
				}) : void 0;
			},
			hideContentBelow({ scope: e, prop: t }) {
				return t("modal") ? Qd(() => [Ad(e)], { defer: !0 }) : void 0;
			}
		},
		actions: {
			setInitialFocus({ prop: e, scope: t }) {
				e("trapFocus") || en(() => {
					pa({
						root: Ad(t),
						getInitialEl: e("initialFocusEl")
					})?.focus({ preventScroll: !0 });
				});
			},
			checkRenderedElements({ context: e, scope: t }) {
				en(() => {
					e.set("rendered", {
						title: !!Pd(t),
						description: !!Fd(t)
					});
				});
			},
			invokeOnClose({ prop: e }) {
				e("onOpenChange")?.({ open: !1 });
			},
			invokeOnOpen({ prop: e }) {
				e("onOpenChange")?.({ open: !0 });
			},
			setTriggerValue({ context: e, event: t }) {
				t.value !== void 0 && e.set("triggerValue", t.value);
			},
			toggleVisibility({ prop: e, send: t, event: n }) {
				t({
					type: e("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
					previousEvent: n
				});
			}
		}
	}
}), Cf = (e) => {
	let t = Nt(), n = gn(), r = _(() => {
		let r = St(e) || {};
		return {
			getRootNode: t().getRootNode,
			dir: n().dir,
			...r
		};
	}), i = Tn(Sf, () => z(r)), a = _(() => zd(i, Wt));
	return () => z(a);
}, wf = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open",
	"children"
]);
function Tf(e, t) {
	let n = m();
	O(t, !0);
	let r = R(t, "open", 15), i = R(t, "children", 7), a = q(t, wf), o = _(() => no(a)), s = _(() => C(z(o), 2)), c = _(() => z(s)[0]), l = _(() => z(s)[1]), u = _(() => Za(z(c))), d = _(() => C(z(u), 1)), f = _(() => z(d)[0]), p = _(() => ({
		...z(l),
		id: z(l).id ?? n,
		open: r(),
		onOpenChange(e) {
			z(l).onOpenChange?.(e), r() !== void 0 && r(e.open);
		}
	})), h = Cf(() => z(p)), g = _(() => ({
		...z(c),
		present: h().open
	})), v = to(() => z(g));
	md(h), Ja(() => z(f)), ro(v);
	var ee = {
		get open() {
			return r();
		},
		set open(e) {
			r(e), M();
		},
		get children() {
			return i();
		},
		set children(e) {
			i(e), M();
		}
	}, x = F(), S = K(x);
	return ye(S, () => i() ?? b), I(e, x), y(ee);
}
U(Tf, {
	open: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/dialog/dialog-title.svelte
var Ef = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Df(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, Ef), i = hd(), a = _(() => X(i().getTitleProps(), r));
	return Q(e, Y({ as: "h2" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(Df, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Confirm.svelte
var Of = L("<p part=\"message\" class=\"svelte-1fchw0y\"> </p>"), kf = L("<p part=\"impact\" class=\"svelte-1fchw0y\"> </p>"), Af = L("<div><!> <!></div>"), jf = L("<!> <!> <footer part=\"actions\" class=\"svelte-1fchw0y\"><button type=\"button\" part=\"cancel\" class=\"af-button\"> </button> <button type=\"button\" part=\"confirm\"> </button></footer>", 1), Mf = L("<dialog><!></dialog>"), Nf = L("<!> <!>", 1), Pf = {
	hash: "svelte-1fchw0y",
	code: "dialog.svelte-1fchw0y {border:0;padding:0;background:transparent;max-width:calc(100vw - 32px);overflow:visible;}dialog.svelte-1fchw0y::backdrop {background:rgb(0 0 0 / 0.5);}p.svelte-1fchw0y {margin:0;}footer.svelte-1fchw0y {display:flex;justify-content:flex-end;gap:8px;}[data-scope='dialog'][data-part='content'] {box-sizing:border-box;display:grid;gap:16px;width:calc(100vw - 32px);padding:24px;border-radius:var(--k-radius);background-color:var(--k-bg);color:var(--k-fg);box-shadow:0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);}[data-scope='dialog'][data-part='title'] {margin:0;font-size:18px;font-weight:600;line-height:28px;}.description.svelte-1fchw0y {display:grid;gap:8px;margin-top:-10px;font-size:14px;line-height:20px;}[part='message'].svelte-1fchw0y {color:var(--k-muted);}[part='impact'].svelte-1fchw0y {color:var(--k-fg);font-weight:500;}\n  @media (min-width: 40rem) {[data-scope='dialog'][data-part='content'] {max-width:512px;} }\n  @media not (min-width: 40rem) {footer.svelte-1fchw0y {flex-direction:column-reverse;} }"
};
function Ff(e, r) {
	O(r, !0), ee(e, Pf);
	let i = R(r, "open", 7, !1), a = R(r, "heading", 7, ""), o = R(r, "message", 7, ""), s = R(r, "confirmLabel", 7, null), u = R(r, "danger", 7, !1), d = R(r, "impact", 7, null), f = R(r, "busy", 7, !1), p = R(r, "locale", 7, null), m = R(r, "strings", 7, null), h = r.$$host, v = _(() => c(p(), m() ?? void 0)), x = B(null), S = B(!1), C = !1, T = l(h);
	Te(() => T(z(x), !!i())), Te(() => {
		i() && J(S, !1);
	}), Te(() => {
		let e = !!f();
		C && !e && J(S, !1), C = e;
	});
	function ie() {
		z(S) || f() || (J(S, !0), n(h, "confirm", {}));
	}
	var k = {
		get open() {
			return i();
		},
		set open(e = !1) {
			i(e), M();
		},
		get heading() {
			return a();
		},
		set heading(e = "") {
			a(e), M();
		},
		get message() {
			return o();
		},
		set message(e = "") {
			o(e), M();
		},
		get confirmLabel() {
			return s();
		},
		set confirmLabel(e = null) {
			s(e), M();
		},
		get danger() {
			return u();
		},
		set danger(e = !1) {
			u(e), M();
		},
		get impact() {
			return d();
		},
		set impact(e = null) {
			d(e), M();
		},
		get busy() {
			return f();
		},
		set busy(e = !1) {
			f(e), M();
		},
		get locale() {
			return p();
		},
		set locale(e = null) {
			p(e), M();
		},
		get strings() {
			return m();
		},
		set strings(e = null) {
			m(e), M();
		}
	}, A = Nf(), ae = K(A);
	t(ae, {});
	var oe = W(ae, 2);
	return Yt(oe, {
		value: () => h.shadowRoot,
		children: (e, t) => {
			var r = F(), c = K(r), l = () => !!i();
			E(c, () => Tf, (e, t) => {
				t(e, {
					get open() {
						return l();
					},
					set open(e) {},
					modal: !1,
					preventScroll: !0,
					closeOnInteractOutside: !1,
					role: "alertdialog",
					onEscapeKeyDown: (e) => {
						qn(e) && e.defaultPrevented && n(h, "cancel", { reason: "escape" });
					},
					onOpenChange: (e) => {
						e.open || n(h, "cancel", { reason: "escape" });
					},
					children: (e, t) => {
						var r = F(), i = K(r);
						{
							let e = (e, t = b) => {
								var r = Mf(), i = (e) => e.preventDefault();
								g(r, (e) => ({
									...e,
									class: "af-kit",
									oncancel: i
								}), [() => t()()], void 0, void 0, "svelte-1fchw0y");
								var c = H(r);
								E(c, () => _d, (e, t) => {
									t(e, {
										part: "content",
										class: "af-overlay dialog",
										"aria-modal": "true",
										children: (e, t) => {
											var r = jf(), i = K(r);
											E(i, () => Df, (e, t) => {
												t(e, {
													part: "heading",
													children: (e, t) => {
														ne();
														var n = fe();
														G(() => w(n, a() ?? "")), I(e, n);
													},
													$$slots: { default: !0 }
												});
											});
											var c = W(i, 2), l = (e) => {
												var t = F(), n = K(t);
												{
													let e = (e, t = b) => {
														var n = Af();
														g(n, (e) => ({
															...e,
															class: "description"
														}), [() => t()()], void 0, void 0, "svelte-1fchw0y");
														var r = H(n), i = (e) => {
															var t = Of(), n = ge(t, !0);
															G(() => w(n, o())), I(e, t);
														};
														P(r, (e) => {
															o() && e(i);
														});
														var a = W(r, 2), s = (e) => {
															var t = kf(), n = ge(t, !0);
															G(() => w(n, d())), I(e, t);
														};
														P(a, (e) => {
															d() && e(s);
														}), D(n), I(e, n);
													};
													E(n, () => yd, (t, n) => {
														n(t, {
															asChild: e,
															$$slots: { asChild: !0 }
														});
													});
												}
												I(e, t);
											};
											P(c, (e) => {
												(o() || d()) && e(l);
											});
											var p = W(c, 2), m = H(p), _ = ge(m, !0), y = W(m, 2), ee = ge(y, !0);
											D(p), G(() => {
												w(_, z(v).cancel), te(y, 1, re(u() ? "af-button danger" : "af-button primary")), N(y, "aria-disabled", z(S) || f() ? "true" : void 0), w(ee, s() || z(v).confirm);
											}), _e("click", m, () => n(h, "cancel", { reason: "close-button" })), _e("click", y, ie), I(e, r);
										},
										$$slots: { default: !0 }
									});
								}), D(r), ue(r, (e) => J(x, e), () => z(x)), I(e, r);
							};
							E(i, () => xd, (t, n) => {
								n(t, {
									asChild: e,
									$$slots: { asChild: !0 }
								});
							});
						}
						I(e, r);
					},
					$$slots: { default: !0 }
				});
			}), I(e, r);
		},
		$$slots: { default: !0 }
	}), I(e, A), y(k);
}
we(["click"]), U(Ff, {
	open: { type: "Boolean" },
	heading: {
		attribute: "heading",
		type: "String"
	},
	message: {
		attribute: "message",
		type: "String"
	},
	confirmLabel: {
		attribute: "confirm-label",
		type: "String"
	},
	danger: {
		attribute: "danger",
		type: "Boolean"
	},
	impact: {
		attribute: "impact",
		type: "String"
	},
	busy: { type: "Boolean" },
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/CopyButton.svelte
var If = ae("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 6 9 17l-5-5\"></path></svg>"), Lf = ae("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\"></rect><path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\"></path></svg>"), Rf = L("<span> </span>"), zf = L("<!> <span class=\"af-kit svelte-dc4eyn\"><button type=\"button\" part=\"trigger\" class=\"af-button ghost icon xs\"><!></button> <div part=\"status\" role=\"status\" class=\"live svelte-dc4eyn\"><!></div></span>", 1), Bf = {
	hash: "svelte-dc4eyn",
	code: ":host {position:relative;display:inline-flex;vertical-align:middle;}.af-kit.svelte-dc4eyn {display:inline-flex;}.live.svelte-dc4eyn {position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;}"
};
function Vf(e, r) {
	O(r, !0), ee(e, Bf);
	let i = R(r, "value", 7, null), a = R(r, "label", 7, null), o = R(r, "locale", 7, null), s = R(r, "strings", 7, null), l = r.$$host, u = _(() => c(o(), s() ?? void 0)), d = B(null), f = B(0), m = B(null), h = 0, g, v = !0;
	Te(() => () => {
		v = !1, clearTimeout(g);
	});
	let b = _(() => z(d) === "copied" ? z(u).copied : z(d) === "failed" ? z(u).copyFailed : "");
	async function S(e) {
		try {
			if (navigator.clipboard?.writeText) return await navigator.clipboard.writeText(e), !0;
		} catch {}
		return C(e);
	}
	function C(e) {
		let t = l.shadowRoot;
		if (!t) return !1;
		let n = p(), r = document.createElement("textarea");
		r.value = e, r.readOnly = !0, r.tabIndex = -1, r.setAttribute("aria-hidden", "true"), r.style.cssText = "position: fixed; top: 0; left: 0; width: 1px; height: 1px; margin: 0; padding: 0; border: 0; opacity: 0; pointer-events: none", r.addEventListener("copy", (e) => e.stopPropagation()), t.append(r);
		try {
			return r.focus({ preventScroll: !0 }), r.select(), r.setSelectionRange(0, e.length), document.execCommand("copy");
		} catch {
			return !1;
		} finally {
			r.remove(), (n && n !== document.body && n.isConnected ? n : z(m))?.focus({ preventScroll: !0 });
		}
	}
	async function T() {
		let e = ++h, t = i() ?? "", r = t !== "" && await S(t);
		n(l, "af-copy", {
			value: t,
			ok: r
		}), v && e === h && (J(d, r ? "copied" : "failed", !0), J(f, z(f) + 1), clearTimeout(g), g = setTimeout(() => J(d, null), 2e3));
	}
	var E = {
		get value() {
			return i();
		},
		set value(e = null) {
			i(e), M();
		},
		get label() {
			return a();
		},
		set label(e = null) {
			a(e), M();
		},
		get locale() {
			return o();
		},
		set locale(e = null) {
			o(e), M();
		},
		get strings() {
			return s();
		},
		set strings(e = null) {
			s(e), M();
		}
	}, te = zf(), ne = K(te);
	t(ne, {});
	var re = W(ne, 2), ie = H(re), k = H(ie), A = (e) => {
		var t = If();
		I(e, t);
	}, ae = (e) => {
		var t = Lf();
		I(e, t);
	};
	P(k, (e) => {
		z(d) === "copied" ? e(A) : e(ae, -1);
	}), D(ie), ue(ie, (e) => J(m, e), () => z(m));
	var oe = W(ie, 2), j = H(oe);
	return x(j, () => z(f), (e) => {
		var t = Rf(), n = ge(t, !0);
		G(() => w(n, z(b))), I(e, t);
	}), D(oe), D(re), G(() => N(ie, "aria-label", a() || z(u).copy)), _e("click", ie, T), I(e, te), y(E);
}
we(["click"]), U(Vf, {
	value: {
		attribute: "value",
		type: "String"
	},
	label: {
		attribute: "label",
		type: "String"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/file-upload/use-file-upload-context.js
var [Hf, Uf] = Rt({ name: "FileUploadContext" }), Wf = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Gf(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, Wf), i = Uf(), a = _(() => yn()(r, ["disableClick"])), o = _(() => C(z(a), 2)), s = _(() => z(o)[0]), c = _(() => z(o)[1]), l = _(() => X(i().getDropzoneProps(z(s)), z(c)));
	return Q(e, Y({ as: "div" }, () => z(l), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(Gf, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/file-upload/file-upload-hidden-input.svelte
var Kf = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function qf(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, Kf), i = Uf(), a = Ru(), o = _(() => X(i().getHiddenInputProps(), r));
	var s = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	};
	{
		let t = _(() => a?.()?.ariaDescribedby);
		Q(e, Y({
			as: "input",
			get "aria-describedby"() {
				return z(t);
			}
		}, () => z(o), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}
	return y(s);
}
U(qf, { ref: {} }, [], [], { mode: "open" });
var Jf = ln("file-upload").parts("root", "dropzone", "item", "itemDeleteTrigger", "itemGroup", "itemName", "itemPreview", "itemPreviewImage", "itemSizeText", "label", "trigger", "clearTrigger").build(), Yf = (e) => typeof e.getAsEntry == "function" ? e.getAsEntry() : typeof e.webkitGetAsEntry == "function" ? e.webkitGetAsEntry() : null, Xf = (e) => e.isDirectory, Zf = (e) => e.isFile, Qf = (e, t) => (Object.defineProperty(e, "relativePath", { value: t ? `${t}/${e.name}` : e.name }), e), $f = (e, t) => Promise.all(Array.from(e).filter((e) => e.kind === "file").map((e) => {
	let n = Yf(e);
	if (!n) return null;
	if (Xf(n) && t) return ep(n.createReader(), `${n.name}`);
	if (Zf(n) && typeof e.getAsFile == "function") {
		let t = e.getAsFile();
		return Promise.resolve(t ? Qf(t, "") : null);
	}
	if (Zf(n)) return new Promise((e) => {
		n.file((t) => {
			e(Qf(t, ""));
		});
	});
}).filter((e) => e)), ep = (e, t = "") => new Promise((n) => {
	let r = [], i = () => {
		e.readEntries((e) => {
			if (e.length === 0) {
				n(Promise.all(r).then((e) => e.flat()));
				return;
			}
			let a = e.map((e) => {
				if (!e) return null;
				if (Xf(e)) return ep(e.createReader(), `${t}${e.name}`);
				if (Zf(e)) return new Promise((n) => {
					e.file((e) => {
						n(Qf(e, t));
					});
				});
			}).filter((e) => e);
			r.push(Promise.all(a)), i();
		});
	};
	i();
});
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+file-utils@1.43.3/node_modules/@zag-js/file-utils/dist/get-accept-attr.mjs
function tp(e) {
	return e === "audio/*" || e === "video/*" || e === "image/*" || e === "text/*" || /\w+\/[-+.\w]+/g.test(e);
}
function np(e) {
	return /^.*\.[\w]+$/.test(e);
}
var rp = (e) => tp(e) || np(e);
function ip(e) {
	if (e != null) return typeof e == "string" ? e : Array.isArray(e) ? e.filter(rp).join(",") : Object.entries(e).reduce((e, [t, n]) => [
		...e,
		t,
		...n
	], []).filter(rp).join(",");
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+file-utils@1.43.3/node_modules/@zag-js/file-utils/dist/is-file-equal.mjs
var ap = (e, t) => e.name === t.name && e.size === t.size && e.type === t.type, op = (e) => e != null;
function sp(e, t, n) {
	if (op(e.size)) {
		if (op(t) && op(n)) {
			if (e.size > n) return [!1, "FILE_TOO_LARGE"];
			if (e.size < t) return [!1, "FILE_TOO_SMALL"];
		} else if (op(t) && e.size < t) return [!1, "FILE_TOO_SMALL"];
		else if (op(n) && e.size > n) return [!1, "FILE_TOO_LARGE"];
	}
	return [!0, null];
}
var cp = new Map("3g2_video/3gpp2[3gp,3gpp_video/3gpp[3mf_model/3mf[7z_application/x-7z-compressed[aac_audio/aac[ac_application/pkix-attr-cert[adp_audio/adpcm[adts_audio/aac[ai_application/postscript[aml_application/automationml-aml+xml[amlx_application/automationml-amlx+zip[amr_audio/amr[apk_application/vnd.android.package-archive[apng_image/apng[appcache,manifest_text/cache-manifest[appinstaller_application/appinstaller[appx_application/appx[appxbundle_application/appxbundle[asc_application/pgp-keys[atom_application/atom+xml[atomcat_application/atomcat+xml[atomdeleted_application/atomdeleted+xml[atomsvc_application/atomsvc+xml[au,snd_audio/basic[avi_video/x-msvideo[avci_image/avci[avcs_image/avcs[avif_image/avif[aw_application/applixware[bdoc_application/bdoc[bin,bpk,buffer,deb,deploy,dist,distz,dll,dmg,dms,dump,elc,exe,img,iso,lrf,mar,msi,msm,msp,pkg,so_application/octet-stream[bmp,dib_image/bmp[btf,btif_image/prs.btif[bz2_application/x-bzip2[c_text/x-c[ccxml_application/ccxml+xml[cdfx_application/cdfx+xml[cdmia_application/cdmi-capability[cdmic_application/cdmi-container[cdmid_application/cdmi-domain[cdmio_application/cdmi-object[cdmiq_application/cdmi-queue[cer_application/pkix-cert[cgm_image/cgm[cjs_application/node[class_application/java-vm[coffee,litcoffee_text/coffeescript[conf,def,in,ini,list,log,text,txt_text/plain[cpp,cxx,cc_text/x-c++src[cpl_application/cpl+xml[cpt_application/mac-compactpro[crl_application/pkix-crl[css_text/css[csv_text/csv[cu_application/cu-seeme[cwl_application/cwl[cww_application/prs.cww[davmount_application/davmount+xml[dbk_application/docbook+xml[doc_application/msword[docx_application/vnd.openxmlformats-officedocument.wordprocessingml.document[dsc_text/prs.lines.tag[dssc_application/dssc+der[dtd_application/xml-dtd[dwd_application/atsc-dwd+xml[ear,jar,war_application/java-archive[ecma_application/ecmascript[emf_image/emf[eml,mime_message/rfc822[emma_application/emma+xml[emotionml_application/emotionml+xml[eot_application/vnd.ms-fontobject[eps,ps_application/postscript[epub_application/epub+zip[exi_application/exi[exp_application/express[exr_image/aces[ez_application/andrew-inset[fdf_application/fdf[fdt_application/fdt+xml[fits_image/fits[flac_audio/flac[flv_video/x-flv[g3_image/g3fax[geojson_application/geo+json[gif_image/gif[glb_model/gltf-binary[gltf_model/gltf+json[gml_application/gml+xml[go_text/x-go[gpx_application/gpx+xml[gz_application/gzip[h_text/x-h[h261_video/h261[h263_video/h263[h264_video/h264[heic_image/heic[heics_image/heic-sequence[heif_image/heif[heifs_image/heif-sequence[htm,html,shtml_text/html[ico_image/x-icon[icns_image/x-icns[ics,ifb_text/calendar[iges,igs_model/iges[ink,inkml_application/inkml+xml[ipa_application/octet-stream[java_text/x-java-source[jp2,jpg2_image/jp2[jpeg,jpe,jpg_image/jpeg[jpf,jpx_image/jpx[jpm,jpgm_image/jpm[jpgv_video/jpeg[jph_image/jph[js,mjs_text/javascript[json_application/json[json5_application/json5[jsonld_application/ld+json[jsx_text/jsx[jxl_image/jxl[jxr_image/jxr[ktx_image/ktx[ktx2_image/ktx2[less_text/less[m1v,m2v,mpe,mpeg,mpg_video/mpeg[m4a_audio/mp4[m4v_video/x-m4v[md,markdown_text/markdown[mid,midi,kar,rmi_audio/midi[mkv_video/x-matroska[mp2,mp2a,mp3,mpga,m3a,m2a_audio/mpeg[mp4,mp4v,mpg4_video/mp4[mp4a_audio/mp4[mp4s,m4p_application/mp4[odp_application/vnd.oasis.opendocument.presentation[oda_application/oda[ods_application/vnd.oasis.opendocument.spreadsheet[odt_application/vnd.oasis.opendocument.text[oga,ogg,opus,spx_audio/ogg[ogv_video/ogg[ogx_application/ogg[otf_font/otf[p12,pfx_application/x-pkcs12[pdf_application/pdf[pem_application/x-pem-file[php_text/x-php[png_image/png[ppt_application/vnd.ms-powerpoint[pptx_application/vnd.openxmlformats-officedocument.presentationml.presentation[pskcxml_application/pskc+xml[psd_image/vnd.adobe.photoshop[py_text/x-python[qt,mov_video/quicktime[rar_application/vnd.rar[rdf_application/rdf+xml[rtf_text/rtf[sass_text/x-sass[scss_text/x-scss[sgm,sgml_text/sgml[sh_application/x-sh[svg,svgz_image/svg+xml[swf_application/x-shockwave-flash[tar_application/x-tar[tif,tiff_image/tiff[toml_application/toml[ts_video/mp2t[tsx_text/tsx[tsv_text/tab-separated-values[ttc_font/collection[ttf_font/ttf[vtt_text/vtt[wasm_application/wasm[wav_audio/wav[weba_audio/webm[webm_video/webm[webmanifest_application/manifest+json[webp_image/webp[wma_audio/x-ms-wma[wmv_video/x-ms-wmv[woff_font/woff[woff2_font/woff2[xls_application/vnd.ms-excel[xlsx_application/vnd.openxmlformats-officedocument.spreadsheetml.sheet[xml_application/xml[xz_application/x-xz[yaml,yml_text/yaml[zip_application/zip".split("[").flatMap((e) => {
	let [t, n] = e.split("_");
	return t.split(",").map((e) => [e, n]);
}));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+file-utils@1.43.3/node_modules/@zag-js/file-utils/dist/get-file-mime-type.mjs
function lp(e) {
	let t = e.split(".").pop();
	return t && cp.get(t) || null;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+file-utils@1.43.3/node_modules/@zag-js/file-utils/dist/is-valid-file-type.mjs
function up(e, t) {
	if (e && t) {
		let n = Array.isArray(t) ? t : typeof t == "string" ? t.split(",") : [];
		if (n.length === 0) return !0;
		let r = e.name || "", i = (e.type || lp(r) || "").toLowerCase(), a = i.replace(/\/.*$/, "");
		return n.some((e) => {
			let t = e.trim().toLowerCase();
			return t.charAt(0) === "." ? r.toLowerCase().endsWith(t) : t.endsWith("/*") ? a === t.replace(/\/.*$/, "") : i === t;
		});
	}
	return !0;
}
function dp(e, t) {
	let n = e.type === "application/x-moz-file" || up(e, t);
	return [n, n ? null : "FILE_INVALID_TYPE"];
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+file-upload@1.43.3/node_modules/@zag-js/file-upload/dist/file-upload.dom.mjs
var fp = (e) => e.ids?.root ?? `file:${e.id}`, pp = (e) => e.ids?.dropzone ?? `file:${e.id}:dropzone`, mp = (e) => e.ids?.hiddenInput ?? `file:${e.id}:input`, hp = (e) => e.ids?.trigger ?? `file:${e.id}:trigger`, gp = (e) => e.ids?.label ?? `file:${e.id}:label`, _p = (e, t) => e.ids?.item?.(t) ?? `file:${e.id}:item:${t}`, vp = (e, t) => e.ids?.itemName?.(t) ?? `file:${e.id}:item-name:${t}`, yp = (e, t) => e.ids?.itemSizeText?.(t) ?? `file:${e.id}:item-size:${t}`, bp = (e, t) => e.ids?.itemPreview?.(t) ?? `file:${e.id}:item-preview:${t}`, xp = (e, t) => e.ids?.itemDeleteTrigger?.(t) ?? `file:${e.id}:item-delete:${t}`, Sp = (e) => mt(`${e.name}-${e.size}`), Cp = (e) => e.getById(fp(e)), wp = (e) => e.getById(mp(e)), Tp = (e) => e.getById(pp(e));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+file-upload@1.43.3/node_modules/@zag-js/file-upload/dist/file-upload.utils.mjs
function Ep(e) {
	let t = lt(e);
	return e.dataTransfer ? e.dataTransfer.types.some((e) => e === "Files" || e === "application/x-moz-file") : !!t && "files" in t;
}
function Dp(e, t, n) {
	let { prop: r, computed: i } = e;
	return !i("multiple") && t > 1 ? !1 : !i("multiple") && t + n.length === 2 || !(t + n.length > r("maxFiles"));
}
function Op(e, t, n = [], r = []) {
	let { prop: i, computed: a } = e, o = [], s = [], c = {
		acceptedFiles: n,
		rejectedFiles: r
	};
	return t.forEach((e) => {
		let [t, r] = dp(e, a("acceptAttr")), [l, u] = sp(e, i("minFileSize"), i("maxFileSize")), d = n.some((t) => ap(t, e)) || o.some((t) => ap(t, e)), f = i("validate")?.(e, c), p = !f || f.length === 0;
		if (t && l && p && !d) o.push(e);
		else {
			let t = [r, u];
			d && t.push("FILE_EXISTS"), p || t.push(...f ?? []), s.push({
				file: e,
				errors: t.filter(Boolean)
			});
		}
	}), Dp(e, o.length, n) || (o.forEach((e) => {
		s.push({
			file: e,
			errors: ["TOO_MANY_FILES"]
		});
	}), o.splice(0)), {
		acceptedFiles: o,
		rejectedFiles: s
	};
}
function kp(e, t) {
	let n = cn(e);
	try {
		if ("DataTransfer" in n) {
			let r = new n.DataTransfer();
			t.forEach((e) => {
				r.items.add(e);
			}), e.files = r.files;
		}
	} catch {}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+file-upload@1.43.3/node_modules/@zag-js/file-upload/dist/file-upload.connect.mjs
var Ap = {
	dropzone: "dropzone",
	itemPreview: (e) => `preview of ${e.name}`,
	deleteFile: (e) => `delete file ${e.name}`
}, jp = "accepted", Mp = "button, a[href], input:not([type='file']), select, textarea, [tabindex], [contenteditable]";
function Np(e, t) {
	if (!e || e.getAttribute("type") === "file") return !1;
	let n = e.closest(Mp);
	return n != t && kt(t, n);
}
function Pp(e, t) {
	let { state: n, send: r, prop: i, computed: a, scope: o, context: s } = e, c = !!i("disabled"), l = !!i("readOnly"), u = !!i("required"), d = i("allowDrop"), f = He(Ap, i("translations")), p = n.matches("dragging"), m = n.matches("focused") && !c, h = s.get("acceptedFiles"), g = i("maxFiles");
	return {
		dragging: p,
		focused: m,
		disabled: c,
		readOnly: l,
		transforming: s.get("transforming"),
		maxFilesReached: h.length >= g,
		remainingFiles: Math.max(0, g - h.length),
		openFilePicker() {
			c || l || r({ type: "OPEN" });
		},
		deleteFile(e, t = jp) {
			c || l || r({
				type: "FILE.DELETE",
				file: e,
				itemType: t
			});
		},
		acceptedFiles: h,
		rejectedFiles: s.get("rejectedFiles"),
		setFiles(e) {
			c || l || r({
				type: "FILES.SET",
				files: e,
				count: e.length
			});
		},
		clearRejectedFiles() {
			c || l || r({ type: "REJECTED_FILES.CLEAR" });
		},
		clearFiles() {
			c || l || r({ type: "FILES.CLEAR" });
		},
		getFileSize(e) {
			return Bc(e.size, i("locale"));
		},
		createFileUrl(e, t) {
			let n = o.getWin(), r = n.URL.createObjectURL(e);
			return t(r), () => n.URL.revokeObjectURL(r);
		},
		setClipboardFiles(e) {
			if (c || l) return !1;
			let t = Array.from(e?.items ?? []).reduce((e, t) => {
				if (t.kind !== "file") return e;
				let n = t.getAsFile();
				return n ? [...e, n] : e;
			}, []);
			return t.length ? (r({
				type: "FILE.SELECT",
				files: t
			}), !0) : !1;
		},
		getRootProps() {
			return t.element({
				...Jf.root.attrs,
				dir: i("dir"),
				id: fp(o),
				"data-disabled": Z(c),
				"data-readonly": Z(l),
				"data-dragging": Z(p)
			});
		},
		getDropzoneProps(e = {}) {
			return t.element({
				...Jf.dropzone.attrs,
				dir: i("dir"),
				id: pp(o),
				tabIndex: c || l || e.disableClick ? void 0 : 0,
				role: e.disableClick ? "application" : "button",
				"aria-label": f.dropzone,
				"aria-disabled": c || l || void 0,
				"data-invalid": Z(i("invalid")),
				"data-disabled": Z(c),
				"data-readonly": Z(l),
				"data-dragging": Z(p),
				onKeyDown(t) {
					if (c || l || t.defaultPrevented) return;
					let n = lt(t);
					kt(t.currentTarget, n) && (Np(n, t.currentTarget) || e.disableClick || (t.key === "Enter" || t.key === " ") && r({
						type: "DROPZONE.CLICK",
						src: "keydown"
					}));
				},
				onClick(t) {
					if (c || l || t.defaultPrevented || e.disableClick) return;
					let n = lt(t);
					kt(t.currentTarget, n) && (Np(n, t.currentTarget) || (t.currentTarget.localName === "label" && t.preventDefault(), r({ type: "DROPZONE.CLICK" })));
				},
				onDragOver(e) {
					if (c || l || !d) return;
					e.preventDefault(), e.stopPropagation();
					try {
						e.dataTransfer.dropEffect = "copy";
					} catch {}
					if (!Ep(e)) return;
					let t = e.dataTransfer.items.length;
					r({
						type: "DROPZONE.DRAG_OVER",
						count: t
					});
				},
				onDragLeave(e) {
					c || l || d && (kt(e.currentTarget, e.relatedTarget) || r({ type: "DROPZONE.DRAG_LEAVE" }));
				},
				onDrop(e) {
					c || l || (d && (e.preventDefault(), e.stopPropagation()), Ep(e) && $f(e.dataTransfer.items, i("directory")).then((e) => {
						r({
							type: "DROPZONE.DROP",
							files: Cn(e)
						});
					}));
				},
				onFocus() {
					c || l || r({ type: "DROPZONE.FOCUS" });
				},
				onBlur() {
					c || l || r({ type: "DROPZONE.BLUR" });
				}
			});
		},
		getTriggerProps() {
			return t.button({
				...Jf.trigger.attrs,
				dir: i("dir"),
				id: hp(o),
				disabled: c || l,
				"data-disabled": Z(c),
				"data-readonly": Z(l),
				"data-invalid": Z(i("invalid")),
				type: "button",
				onClick(e) {
					c || l || (kt(Tp(o), e.currentTarget) && e.stopPropagation(), r({ type: "OPEN" }));
				}
			});
		},
		getHiddenInputProps() {
			return t.input({
				id: mp(o),
				tabIndex: -1,
				disabled: c || l,
				type: "file",
				required: i("required"),
				capture: i("capture"),
				name: i("name"),
				accept: a("acceptAttr"),
				webkitdirectory: i("directory") ? "" : void 0,
				multiple: a("multiple") || i("maxFiles") > 1,
				"aria-hidden": !0,
				onClick(e) {
					e.stopPropagation(), e.currentTarget.value = "";
				},
				onInput(e) {
					if (c || l) return;
					let { files: t } = e.currentTarget;
					r({
						type: "FILE.SELECT",
						files: t ? Array.from(t) : []
					});
				},
				style: Ha
			});
		},
		getItemGroupProps(e = {}) {
			let { type: n = jp } = e;
			return t.element({
				...Jf.itemGroup.attrs,
				dir: i("dir"),
				"data-disabled": Z(c),
				"data-type": n
			});
		},
		getItemProps(e) {
			let { file: n, type: r = jp } = e;
			return t.element({
				...Jf.item.attrs,
				dir: i("dir"),
				id: _p(o, Sp(n)),
				"data-disabled": Z(c),
				"data-type": r
			});
		},
		getItemNameProps(e) {
			let { file: n, type: r = jp } = e;
			return t.element({
				...Jf.itemName.attrs,
				dir: i("dir"),
				id: vp(o, Sp(n)),
				"data-disabled": Z(c),
				"data-type": r
			});
		},
		getItemSizeTextProps(e) {
			let { file: n, type: r = jp } = e;
			return t.element({
				...Jf.itemSizeText.attrs,
				dir: i("dir"),
				id: yp(o, Sp(n)),
				"data-disabled": Z(c),
				"data-type": r
			});
		},
		getItemPreviewProps(e) {
			let { file: n, type: r = jp } = e;
			return t.element({
				...Jf.itemPreview.attrs,
				dir: i("dir"),
				id: bp(o, Sp(n)),
				"data-disabled": Z(c),
				"data-type": r
			});
		},
		getItemPreviewImageProps(e) {
			let { file: n, url: r, type: i = jp } = e;
			if (!n.type.startsWith("image/")) throw Error("Preview Image is only supported for image files");
			return t.img({
				...Jf.itemPreviewImage.attrs,
				alt: f.itemPreview?.(n),
				src: r,
				"data-disabled": Z(c),
				"data-type": i
			});
		},
		getItemDeleteTriggerProps(e) {
			let { file: n, type: a = jp } = e;
			return t.button({
				...Jf.itemDeleteTrigger.attrs,
				dir: i("dir"),
				id: xp(o, Sp(n)),
				type: "button",
				disabled: c || l,
				"data-disabled": Z(c),
				"data-readonly": Z(l),
				"data-type": a,
				"aria-label": f.deleteFile?.(n),
				onClick() {
					c || l || r({
						type: "FILE.DELETE",
						file: n,
						itemType: a
					});
				}
			});
		},
		getLabelProps() {
			return t.label({
				...Jf.label.attrs,
				dir: i("dir"),
				id: gp(o),
				htmlFor: mp(o),
				"data-disabled": Z(c),
				"data-invalid": Z(i("invalid")),
				"data-required": Z(u)
			});
		},
		getClearTriggerProps() {
			return t.button({
				...Jf.clearTrigger.attrs,
				dir: i("dir"),
				type: "button",
				disabled: c || l,
				hidden: h.length === 0,
				"data-disabled": Z(c),
				"data-readonly": Z(l),
				onClick(e) {
					e.defaultPrevented || c || l || r({ type: "FILES.CLEAR" });
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+file-upload@1.43.3/node_modules/@zag-js/file-upload/dist/file-upload.machine.mjs
var Fp = Pn({
	props({ props: e }) {
		return {
			minFileSize: 0,
			maxFileSize: Infinity,
			maxFiles: 1,
			allowDrop: !0,
			preventDocumentDrop: !0,
			defaultAcceptedFiles: [],
			...e
		};
	},
	initialState() {
		return "idle";
	},
	context({ prop: e, bindable: t, getContext: n }) {
		return {
			acceptedFiles: t(() => ({
				defaultValue: e("defaultAcceptedFiles"),
				value: e("acceptedFiles"),
				isEqual: (e, t) => e.length === t?.length && e.every((e, n) => ap(e, t[n])),
				hash(e) {
					return e.map((e) => `${e.name}-${e.size}`).join(",");
				},
				onChange(t) {
					let r = n();
					e("onFileAccept")?.({ files: t }), e("onFileChange")?.({
						acceptedFiles: t,
						rejectedFiles: r.get("rejectedFiles")
					});
				}
			})),
			rejectedFiles: t(() => ({
				defaultValue: [],
				isEqual: (e, t) => e.length === t?.length && e.every((e, n) => ap(e.file, t[n].file)),
				onChange(t) {
					let r = n();
					e("onFileReject")?.({ files: t }), e("onFileChange")?.({
						acceptedFiles: r.get("acceptedFiles"),
						rejectedFiles: t
					});
				}
			})),
			transforming: t(() => ({ defaultValue: !1 }))
		};
	},
	computed: {
		acceptAttr: ({ prop: e }) => ip(e("accept")),
		multiple: ({ prop: e }) => e("maxFiles") > 1
	},
	watch({ track: e, context: t, action: n }) {
		e([() => t.hash("acceptedFiles")], () => {
			n(["syncInputElement"]);
		});
	},
	on: {
		"FILES.SET": { actions: ["setFiles"] },
		"FILE.SELECT": { actions: ["setEventFiles"] },
		"FILE.DELETE": { actions: ["removeFile"] },
		"FILES.CLEAR": { actions: ["clearFiles"] },
		"REJECTED_FILES.CLEAR": { actions: ["clearRejectedFiles"] }
	},
	effects: ["preventDocumentDrop"],
	states: {
		idle: { on: {
			OPEN: { actions: ["openFilePicker"] },
			"DROPZONE.CLICK": { actions: ["openFilePicker"] },
			"DROPZONE.FOCUS": { target: "focused" },
			"DROPZONE.DRAG_OVER": { target: "dragging" }
		} },
		focused: { on: {
			"DROPZONE.BLUR": { target: "idle" },
			OPEN: { actions: ["openFilePicker"] },
			"DROPZONE.CLICK": { actions: ["openFilePicker"] },
			"DROPZONE.DRAG_OVER": { target: "dragging" }
		} },
		dragging: { on: {
			"DROPZONE.DROP": {
				target: "idle",
				actions: ["setEventFiles"]
			},
			"DROPZONE.DRAG_LEAVE": { target: "idle" }
		} }
	},
	implementations: {
		effects: { preventDocumentDrop({ prop: e, scope: t }) {
			if (!e("preventDocumentDrop") || !e("allowDrop") || e("disabled")) return;
			let n = t.getDoc();
			return Xe(Ne(n, "dragover", (e) => {
				e?.preventDefault();
			}, !1), Ne(n, "drop", (e) => {
				kt(Cp(t), lt(e)) || e.preventDefault();
			}, !1));
		} },
		actions: {
			syncInputElement({ scope: e, context: t }) {
				queueMicrotask(() => {
					let n = wp(e);
					if (!n) return;
					kp(n, t.get("acceptedFiles"));
					let r = e.getWin();
					n.dispatchEvent(new r.Event("change", { bubbles: !0 }));
				});
			},
			openFilePicker({ scope: e }) {
				en(() => {
					wp(e)?.click();
				});
			},
			setFiles(e) {
				let { computed: t, context: n, event: r } = e, { acceptedFiles: i, rejectedFiles: a } = Op(e, r.files);
				n.set("acceptedFiles", t("multiple") ? i : i.length > 0 ? [i[0]] : []), n.set("rejectedFiles", a);
			},
			setEventFiles(e) {
				let { computed: t, context: n, event: r, prop: i } = e, a = n.get("acceptedFiles"), o = n.get("rejectedFiles"), { acceptedFiles: s, rejectedFiles: c } = Op(e, r.files, a, o), l = (e) => {
					if (t("multiple")) {
						n.set("acceptedFiles", (t) => [...t, ...e]), n.set("rejectedFiles", c);
						return;
					}
					if (e.length) {
						n.set("acceptedFiles", [e[0]]), n.set("rejectedFiles", c);
						return;
					}
					c.length && (n.set("acceptedFiles", n.get("acceptedFiles")), n.set("rejectedFiles", c));
				}, u = i("transformFiles");
				u ? (n.set("transforming", !0), u(s).then(l).catch((e) => {
					An(`[zag-js/file-upload] error transforming files
${e}`);
				}).finally(() => {
					n.set("transforming", !1);
				})) : l(s);
			},
			removeFile({ context: e, event: t }) {
				if (t.itemType === "rejected") {
					let n = e.get("rejectedFiles").filter((e) => !ap(e.file, t.file));
					e.set("rejectedFiles", n);
				} else {
					let n = e.get("acceptedFiles").filter((e) => !ap(e, t.file));
					e.set("acceptedFiles", n);
				}
			},
			clearRejectedFiles({ context: e }) {
				e.set("rejectedFiles", []);
			},
			clearFiles({ context: e }) {
				e.set("acceptedFiles", []), e.set("rejectedFiles", []);
			}
		}
	}
}), Ip = (e) => {
	let t = Nt(), n = gn(), r = Ru(), i = _(() => {
		let i = St(e);
		return {
			ids: {
				label: r?.()?.ids.label,
				hiddenInput: r?.()?.ids.control
			},
			dir: n().dir,
			locale: n().locale,
			disabled: r?.()?.disabled,
			invalid: r?.()?.invalid,
			required: r?.()?.required,
			getRootNode: t().getRootNode,
			...i
		};
	}), a = Tn(Fp, () => z(i)), o = _(() => Pp(a, Wt));
	return () => z(o);
}, Lp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"value"
]);
function Rp(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = R(t, "value", 7), i = q(t, Lp), a = _(() => X(r()().getRootProps(), i));
	return Hf(() => r()()), Q(e, Y({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		},
		get value() {
			return r();
		},
		set value(e) {
			r(e), M();
		}
	});
}
U(Rp, {
	ref: {},
	value: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/FileUpload.svelte
var zp = (e, t = b) => {
	var n = Kp(), r = H(n), i = (e) => {
		var t = Up();
		ne(2), I(e, t);
	}, a = (e) => {
		var n = Gp(), r = W(K(n), 2), i = (e) => {
			var t = Wp();
			ne(2), I(e, t);
		};
		P(r, (e) => {
			t() === "text" && e(i);
		}), I(e, n);
	};
	P(r, (e) => {
		t() === "image" ? e(i) : e(a, -1);
	}), D(n), I(e, n);
}, Bp = [], Vp = 5e3;
function Hp(e) {
	let t = e.split(".").pop()?.toLowerCase() ?? "";
	return [
		"pdf",
		"doc",
		"docx",
		"txt"
	].includes(t) ? "text" : [
		"jpg",
		"jpeg",
		"png",
		"gif",
		"webp"
	].includes(t) ? "image" : "file";
}
var Up = ae("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"></rect><circle cx=\"9\" cy=\"9\" r=\"2\"></circle><path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\"></path>", 1), Wp = ae("<path d=\"M10 9H8\"></path><path d=\"M16 13H8\"></path><path d=\"M16 17H8\"></path>", 1), Gp = ae("<path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\"></path><path d=\"M14 2v4a2 2 0 0 0 2 2h4\"></path><!>", 1), Kp = ae("<svg part=\"icon\" viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><!></svg>"), qp = L("<span id=\"af-described\" hidden=\"\"> </span>"), Jp = L("<span id=\"af-lead\" hidden=\"\"> </span>"), Yp = L("<svg class=\"glyph svelte-19e4ssx\" viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 3v12\"></path><path d=\"m17 8-5-5-5 5\"></path><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path></svg> <span class=\"lead svelte-19e4ssx\"> <span part=\"trigger\"> </span><!></span> <span part=\"hint\" id=\"af-hint\"> </span>", 1), Xp = L("<a class=\"thumb svelte-19e4ssx\" target=\"_blank\" rel=\"noopener\" tabindex=\"-1\" aria-hidden=\"true\"><img part=\"preview\" alt=\"\"/></a>"), Zp = L("<img part=\"preview\" alt=\"\"/>"), Qp = L("<a part=\"name\" class=\"name svelte-19e4ssx\" target=\"_blank\" rel=\"noopener\"> </a>"), $p = L("<span part=\"name\" class=\"name svelte-19e4ssx\"> </span>"), em = L("<span part=\"size\"> </span>"), tm = L("<div part=\"progress\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\"><div class=\"fill svelte-19e4ssx\"></div></div>"), nm = L("<span part=\"status\"> </span>"), rm = L("<button type=\"button\" part=\"remove\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 6h18\"></path><path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\"></path><path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\"></path><line x1=\"10\" x2=\"10\" y1=\"11\" y2=\"17\"></line><line x1=\"14\" x2=\"14\" y1=\"11\" y2=\"17\"></line></svg></button>"), im = L("<li part=\"item\"><!> <!> <!> <!> <!></li>"), am = L("<ul part=\"list\"></ul>"), om = L("<p class=\"none svelte-19e4ssx\"> </p>"), sm = L("<div class=\"af-kit upload svelte-19e4ssx\"><!> <!> <!> <div part=\"notice\" role=\"status\" aria-live=\"polite\"><!></div> <!></div>"), cm = L("<!> <!>", 1), lm = {
	hash: "svelte-19e4ssx",
	code: ":host {display:block;}.upload.svelte-19e4ssx {display:flex;flex-direction:column;gap:8px;font-size:12px;line-height:1.5;--fu-edge: color-mix(in oklab, var(--k-fg) calc(15% + var(--k-dark, 0) * 6%), var(--k-surface));--fu-soft: color-mix(in oklab, var(--k-muted) calc(60% + var(--k-dark, 0) * 25%), var(--k-surface));}.upload.svelte-19e4ssx > .root {display:contents;}[part~='dropzone'] {display:flex;box-sizing:border-box;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:16px 12px;border:2px dashed var(--fu-edge);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:color-mix(in oklab, var(--k-muted-bg) 40%, transparent);text-align:center;outline:none;cursor:pointer;transition-property:color, background-color, border-color, box-shadow;transition-duration:150ms;transition-timing-function:cubic-bezier(0.4, 0, 0.2, 1);}[part~='dropzone']:hover {border-color:var(--fu-soft);}[part~='dropzone'][data-dragging] {border-color:color-mix(in oklab, var(--k-primary) 60%, var(--k-surface));background-color:color-mix(in oklab, var(--k-primary) 4%, transparent);}[part~='dropzone'][data-invalid] {border-color:var(--k-danger);}[part~='dropzone']:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[part~='dropzone'][data-disabled] {opacity:0.5;cursor:not-allowed;}.glyph.svelte-19e4ssx {flex:none;color:var(--fu-soft);}.lead.svelte-19e4ssx {color:var(--k-fg);}[part~='trigger'] {margin-left:4px;color:var(--k-primary);font-weight:500;}[part~='dropzone']:not([data-disabled]) [part~='trigger']:hover {text-decoration-line:underline;}[part~='hint'] {color:var(--k-muted);font-size:10px;}[part~='notice'] {color:var(--k-danger);font-size:11.5px;}[part~='notice']:empty {margin-top:-8px;}[part~='list'] {box-sizing:border-box;margin:0;padding:0;border:1px solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:var(--k-surface);list-style:none;}[part~='item'] {display:flex;box-sizing:border-box;align-items:center;gap:8px;padding:8px 12px;}[part~='item'] + [part~='item'] {border-top:1px solid var(--k-line);}[part~='icon'] {flex:none;width:14px;height:14px;color:var(--k-muted);}.thumb.svelte-19e4ssx {display:block;flex:none;}[part~='preview'] {display:block;box-sizing:border-box;flex:none;width:32px;height:32px;border:1px solid var(--k-line);border-radius:0.25rem;background-color:var(--k-surface);object-fit:cover;}.name.svelte-19e4ssx {flex:1 1 0%;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}a.name.svelte-19e4ssx {color:var(--k-primary);font-weight:500;text-decoration-line:none;border-radius:2px;outline:none;}a.name.svelte-19e4ssx:hover {text-decoration-line:underline;}a.name.svelte-19e4ssx:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[part~='size'] {flex:none;color:var(--fu-soft);font-size:10px;}[part~='progress'] {position:relative;flex:none;width:64px;height:6px;overflow:hidden;border-radius:calc(infinity * 1px);background-color:color-mix(in oklab, var(--k-primary) 20%, transparent);}.fill.svelte-19e4ssx {width:100%;height:100%;background-color:var(--k-primary);transition:transform 150ms cubic-bezier(0.4, 0, 0.2, 1);}[part~='status'] {flex:none;color:var(--k-danger);font-size:10px;}[part~='remove'] {display:flex;box-sizing:border-box;flex:none;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:0;border-radius:0.25rem;background:none;color:var(--fu-soft);outline:none;cursor:pointer;}[part~='remove']:not(:disabled):hover {background-color:color-mix(in oklab, var(--k-danger) 6%, var(--k-surface));color:var(--k-danger);}[part~='remove']:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[part~='remove']:disabled {opacity:0.5;cursor:not-allowed;}.none.svelte-19e4ssx {box-sizing:border-box;margin:0;padding:8px 12px;border:1px solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:var(--k-surface);color:var(--fu-soft);font-size:11.5px;font-style:italic;}\n  @media (prefers-reduced-motion: reduce) {[part~='dropzone'], .fill.svelte-19e4ssx {transition:none;} }\n  @media (forced-colors: active) {[part~='dropzone']:focus-visible, a.name.svelte-19e4ssx:focus-visible, [part~='remove']:focus-visible {outline:2px solid;outline-offset:2px;}\n  }"
};
function um(r, i) {
	let o = m();
	O(i, !0), ee(r, lm);
	let s = R(i, "items", 23, () => []), l = R(i, "accept", 7, null), u = R(i, "multiple", 7, !1), f = R(i, "replace", 7, !1), p = R(i, "label", 7, null), g = R(i, "maxFiles", 7, null), v = R(i, "disabled", 7, !1), b = R(i, "locale", 7, null), x = R(i, "strings", 7, null), S = R(i, "name", 7, null), C = R(i, "required", 7, !1), T = R(i, "readonly", 7, !1), te = R(i, "description", 7, null), ne = R(i, "error", 7, null), re = R(i, "invalid", 7, !1), ie = i.$$host, k = _(() => c(b(), x() ?? void 0)), A = _(() => s() ?? []), ae = _(() => g() != null && Number(g()) >= 1), oe = _(() => z(ae) ? Math.floor(Number(g())) : u() ? Infinity : 1), j = _(() => z(oe) > 1 ? z(k).dropFiles : z(k).dropFile), se = _(() => !!f() && z(oe) === 1), ce = _(() => `${z(j)} ${z(k).browse}`), L = B(!1), le = _(() => !!v() || z(L)), ue = _(() => [te(), ne()].filter(Boolean).join(" ")), de = B(null), V = B(""), U;
	async function pe(e) {
		clearTimeout(U), z(V) === e && (J(V, ""), await ve()), J(V, e, !0), U = setTimeout(() => J(V, ""), Vp);
	}
	Te(() => () => clearTimeout(U));
	let me = null;
	function ye() {
		return me || (me = {
			accepted: [],
			rejected: []
		}, queueMicrotask(be)), me;
	}
	function be() {
		let { accepted: e, rejected: t } = me;
		me = null, t.length && xe().clearRejectedFiles();
		let r = z(se) ? 0 : z(A).filter((e) => e.status !== "failed").length;
		if (t.some((e) => e.errors.includes("TOO_MANY_FILES")) || z(ae) && r + e.length > z(oe)) {
			pe(z(oe) === 1 ? z(k).oneFileOnly : a(z(k).fileCountRefused, { max: z(oe) }));
			return;
		}
		let i = t.find((e) => e.errors.includes("FILE_INVALID_TYPE"));
		if (i) {
			pe(a(z(k).fileTypeRefused, { name: i.file.name }));
			return;
		}
		e.length && n(ie, "files-add", { files: e });
	}
	let xe = Ip(() => ({
		id: o,
		getRootNode: () => ie.shadowRoot,
		accept: l() || void 0,
		maxFiles: z(oe),
		disabled: z(le),
		readOnly: !!T(),
		invalid: !!re(),
		acceptedFiles: Bp,
		preventDocumentDrop: !1,
		translations: { dropzone: p() || z(ce) },
		onFileAccept: (e) => {
			e.files.length && ye().accepted.push(...e.files);
		},
		onFileReject: (e) => {
			e.files.length && ye().rejected.push(...e.files);
		}
	}));
	Te(() => {
		let e = z(de);
		if (!e || !(z(le) || T())) return;
		let t = (e) => e.preventDefault();
		return e.addEventListener("dragover", t), e.addEventListener("drop", t), () => {
			e.removeEventListener("dragover", t), e.removeEventListener("drop", t);
		};
	});
	let Se = _(() => {
		let t = (t) => new Intl.NumberFormat(e(b()) ? "vi-VN" : "en-GB", {
			style: "unit",
			unit: t,
			unitDisplay: "short",
			maximumFractionDigits: 1
		});
		return {
			byte: t("byte"),
			kilobyte: t("kilobyte"),
			megabyte: t("megabyte")
		};
	});
	function Ce(e) {
		return e == null || !Number.isFinite(e) || e < 0 ? "" : e < 1024 ? z(Se).byte.format(e) : e < 1048576 ? z(Se).kilobyte.format(e / 1024) : z(Se).megabyte.format(e / 1024 / 1024);
	}
	let we = (e) => Math.min(100, Math.max(0, Number(e.progress) || 0));
	Te(() => {
		let e = z(A).filter((e) => e.status === "done").map((e) => e.id), t = !!C() && e.length === 0;
		Dr(ie, {
			name: S(),
			value: e,
			validity: t ? { valueMissing: !0 } : {},
			message: t ? d(z(k), "valueMissing") : "",
			anchor: z(de)
		});
	}), Or(ie, {
		reset() {},
		disabled(e) {
			J(L, e, !0);
		}
	});
	var q = {
		get items() {
			return s();
		},
		set items(e = []) {
			s(e), M();
		},
		get accept() {
			return l();
		},
		set accept(e = null) {
			l(e), M();
		},
		get multiple() {
			return u();
		},
		set multiple(e = !1) {
			u(e), M();
		},
		get replace() {
			return f();
		},
		set replace(e = !1) {
			f(e), M();
		},
		get label() {
			return p();
		},
		set label(e = null) {
			p(e), M();
		},
		get maxFiles() {
			return g();
		},
		set maxFiles(e = null) {
			g(e), M();
		},
		get disabled() {
			return v();
		},
		set disabled(e = !1) {
			v(e), M();
		},
		get locale() {
			return b();
		},
		set locale(e = null) {
			b(e), M();
		},
		get strings() {
			return x();
		},
		set strings(e = null) {
			x(e), M();
		},
		get name() {
			return S();
		},
		set name(e = null) {
			S(e), M();
		},
		get required() {
			return C();
		},
		set required(e = !1) {
			C(e), M();
		},
		get readonly() {
			return T();
		},
		set readonly(e = !1) {
			T(e), M();
		},
		get description() {
			return te();
		},
		set description(e = null) {
			te(e), M();
		},
		get error() {
			return ne();
		},
		set error(e = null) {
			ne(e), M();
		},
		get invalid() {
			return re();
		},
		set invalid(e = !1) {
			re(e), M();
		}
	}, Ee = cm(), Y = K(Ee);
	t(Y, {});
	var De = W(Y, 2);
	return Yt(De, {
		value: () => ie.shadowRoot,
		children: (e, t) => {
			var r = sm(), i = H(r), a = (e) => {
				var t = qp(), n = ge(t, !0);
				G(() => w(n, z(ue))), I(e, t);
			};
			P(i, (e) => {
				z(ue) && e(a);
			});
			var o = W(i, 2), s = (e) => {
				var t = Jp(), n = ge(t, !0);
				G(() => w(n, z(ce))), I(e, t);
			};
			P(o, (e) => {
				p() && e(s);
			});
			var c = W(o, 2);
			E(c, () => Rp, (e, t) => {
				t(e, {
					get value() {
						return xe;
					},
					class: "root",
					children: (e, t) => {
						var n = F(), r = K(n), i = (e) => {
							var t = F(), n = K(t);
							{
								let e = _(() => [
									p() ? "af-lead" : "",
									"af-hint",
									z(ue) ? "af-described" : ""
								].filter(Boolean).join(" "));
								E(n, () => Gf, (t, n) => {
									n(t, {
										part: "dropzone",
										get "aria-describedby"() {
											return z(e);
										},
										get ref() {
											return z(de);
										},
										set ref(e) {
											J(de, e, !0);
										},
										children: (e, t) => {
											var n = Yp(), r = W(K(n), 2), i = H(r, !0), a = W(i), o = ge(a, !0), s = W(a);
											E(s, () => qf, (e, t) => {
												t(e, {});
											}), D(r);
											var c = W(r, 2), l = ge(c, !0);
											G(() => {
												w(i, z(j)), w(o, z(k).browse), w(l, z(oe) > 1 ? z(k).multipleAllowed : z(k).oneFileOnly);
											}), I(e, n);
										},
										$$slots: { default: !0 }
									});
								});
							}
							I(e, t);
						};
						P(r, (e) => {
							T() || e(i);
						}), I(e, n);
					},
					$$slots: { default: !0 }
				});
			});
			var l = W(c, 2), u = H(l), d = (e) => {
				var t = fe();
				G(() => w(t, z(V))), I(e, t);
			};
			P(u, (e) => {
				z(V) && e(d);
			}), D(l);
			var f = W(l, 2), m = (e) => {
				var t = am();
				h(t, 21, () => z(A), (e) => e.id, (e, t) => {
					let r = _(() => Ce(z(t).size));
					var i = im(), a = H(i), o = (e) => {
						var n = F(), r = K(n), i = (e) => {
							var n = Xp(), r = ge(n);
							G(() => {
								N(n, "href", z(t).href), N(r, "src", z(t).preview);
							}), I(e, n);
						}, a = (e) => {
							var n = Zp();
							G(() => N(n, "src", z(t).preview)), I(e, n);
						};
						P(r, (e) => {
							z(t).href ? e(i) : e(a, -1);
						}), I(e, n);
					}, s = (e) => {
						{
							let n = _(() => Hp(z(t).name));
							zp(e, () => z(n));
						}
					};
					P(a, (e) => {
						z(t).preview ? e(o) : e(s, -1);
					});
					var c = W(a, 2), l = (e) => {
						var n = Qp(), r = ge(n, !0);
						G(() => {
							N(n, "href", z(t).href), w(r, z(t).name);
						}), I(e, n);
					}, u = (e) => {
						var n = $p(), r = ge(n, !0);
						G(() => w(r, z(t).name)), I(e, n);
					};
					P(c, (e) => {
						z(t).href ? e(l) : e(u, -1);
					});
					var d = W(c, 2), f = (e) => {
						var t = em(), n = ge(t, !0);
						G(() => w(n, z(r))), I(e, t);
					};
					P(d, (e) => {
						z(r) && e(f);
					});
					var p = W(d, 2), m = (e) => {
						var n = tm(), r = ge(n);
						G((e, t) => {
							N(n, "aria-valuenow", e), N(n, "aria-label", z(k).uploading), he(r, `transform: translateX(-${t ?? ""}%)`);
						}, [() => we(z(t)), () => 100 - we(z(t))]), I(e, n);
					}, h = (e) => {
						var n = nm(), r = ge(n, !0);
						G(() => {
							N(n, "title", z(t).error || void 0), w(r, z(k).uploadFailed);
						}), I(e, n);
					};
					P(p, (e) => {
						z(t).status === "uploading" ? e(m) : z(t).status === "failed" && e(h, 1);
					});
					var g = W(p, 2), v = (e) => {
						var r = rm();
						G(() => {
							N(r, "aria-label", `${z(k).removeFile ?? ""}: ${z(t).name ?? ""}`), r.disabled = z(le) || z(t).status === "uploading";
						}), _e("click", r, () => n(ie, "remove", { id: z(t).id })), I(e, r);
					};
					P(g, (e) => {
						T() || e(v);
					}), D(i), G(() => N(i, "data-status", z(t).status)), I(e, i);
				}), D(t), I(e, t);
			}, g = (e) => {
				var t = om(), n = ge(t, !0);
				G(() => w(n, z(k).noFiles)), I(e, t);
			};
			P(f, (e) => {
				z(A).length ? e(m) : T() && e(g, 1);
			}), D(r), I(e, r);
		},
		$$slots: { default: !0 }
	}), I(r, Ee), y(q);
}
we(["click"]), U(um, {
	items: { type: "Array" },
	accept: {
		attribute: "accept",
		type: "String"
	},
	multiple: {
		attribute: "multiple",
		type: "Boolean"
	},
	replace: {
		attribute: "replace",
		type: "Boolean"
	},
	label: {
		attribute: "label",
		type: "String"
	},
	maxFiles: {
		attribute: "max-files",
		type: "Number"
	},
	disabled: {
		attribute: "disabled",
		reflect: !0,
		type: "Boolean"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" },
	name: {
		attribute: "name",
		reflect: !0,
		type: "String"
	},
	required: {
		attribute: "required",
		type: "Boolean"
	},
	readonly: {
		attribute: "readonly",
		reflect: !0,
		type: "Boolean"
	},
	description: {
		attribute: "description",
		type: "String"
	},
	error: {
		attribute: "error",
		type: "String"
	},
	invalid: {
		attribute: "invalid",
		type: "Boolean"
	}
}, [], [], { mode: "open" }, (e) => class extends Er(e) {
	focus(e) {
		let t = this.shadowRoot?.querySelector("[part~=\"dropzone\"]");
		t ? t.focus(e) : super.focus(e);
	}
});
var dm = ln("date-picker").parts("clearTrigger", "content", "control", "input", "label", "monthSelect", "nextTrigger", "positioner", "presetTrigger", "prevTrigger", "rangeText", "root", "table", "tableBody", "tableCell", "tableCellTrigger", "tableHead", "tableHeader", "tableRow", "trigger", "view", "viewControl", "viewTrigger", "yearSelect").build();
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/constrain.mjs
function fm(e, t, n, r, i) {
	let a = {};
	for (let e in t) {
		let n = e, r = t[n];
		r != null && (a[n] = Math.floor(r / 2), a[n] > 0 && r % 2 == 0 && a[n]--);
	}
	return hm(e, pm(e, t, n).subtract(a), t, n, r, i);
}
function pm(e, t, n, r, i) {
	let a = e;
	return t.years ? a = _l(e) : t.months ? a = hl(e) : t.weeks && (a = yl(e, n)), hm(e, a, t, n, r, i);
}
function mm(e, t, n, r, i) {
	let a = { ...t };
	return a.days ? a.days-- : a.weeks ? a.weeks-- : a.months ? a.months-- : a.years && a.years--, hm(e, pm(e, t, n).subtract(a), t, n, r, i);
}
function hm(e, t, n, r, i, a) {
	return i && e.compare(i) >= 0 && (t = Dl(t, pm(Vl(i), n, r))), a && e.compare(a) <= 0 && (t = El(t, mm(Vl(a), n, r))), t;
}
function gm(e, t, n) {
	let r = Vl(e), i = t ? Vl(t) : void 0, a = n ? Vl(n) : void 0, o = r;
	return i && (o = Dl(o, i)), a && (o = El(o, a)), o.compare(r) === 0 ? e : "hour" in e ? e.set({
		year: o.year,
		month: o.month,
		day: o.day
	}) : o;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/align.mjs
function _m(e, t, n, r, i, a) {
	switch (t) {
		case "start": return pm(e, n, r, i, a);
		case "end": return mm(e, n, r, i, a);
		default: return fm(e, n, r, i, a);
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/assertion.mjs
function vm(e, t) {
	return e == null || t == null ? e === t : !("hour" in e) && !("hour" in t) ? Xc(e, t) : Hl(e).compare(Hl(t)) === 0;
}
function ym(e, t, n, r, i) {
	return e ? t?.(e, n) ? !0 : bm(e, r, i) : !1;
}
function bm(e, t, n) {
	return t != null && e.compare(t) < 0 || n != null && e.compare(n) > 0;
}
function xm(e, t, n) {
	let r = e.subtract({ days: 1 });
	return Xc(r, e) || bm(r, t, n);
}
function Sm(e, t, n) {
	let r = e.add({ days: 1 });
	return Xc(r, e) || bm(r, t, n);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/duration.mjs
function Cm(e) {
	let t = { ...e };
	for (let e in t) t[e] = 1;
	return t;
}
function wm(e, t) {
	let n = { ...t };
	return n.days ? n.days-- : n.days = -1, e.add(n);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/get-era-format.mjs
function Tm(e) {
	if (!e) return;
	let t = e.calendar.identifier;
	return t === "gregory" || t === "iso8601" ? e.era === "BC" ? "short" : void 0 : "short";
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/formatter.mjs
function Em(e, t, n) {
	let r = n ?? Hl(sl(t));
	return new ku(e, {
		weekday: "long",
		month: "long",
		year: "numeric",
		day: "numeric",
		era: Tm(r),
		calendar: r.calendar.identifier,
		timeZone: t
	});
}
function Dm(e, t, n) {
	let r = n ?? sl(t);
	return new ku(e, {
		month: "long",
		year: "numeric",
		era: Tm(r),
		calendar: r.calendar.identifier,
		timeZone: t
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/format.mjs
function Om(e, t, n, r, i) {
	let a = n.formatRangeToParts(e.toDate(i), t.toDate(i)), o = -1;
	for (let e = 0; e < a.length; e++) {
		let t = a[e];
		if (t.source === "shared" && t.type === "literal") o = e;
		else if (t.source === "endRange") break;
	}
	let s = "", c = "";
	for (let e = 0; e < a.length; e++) e < o ? s += a[e].value : e > o && (c += a[e].value);
	return r(s, c);
}
function km(e, t, n, r) {
	if (!e) return "";
	let i = e, a = t ?? e, o = Em(n, r);
	return Xc(i, a) ? o.format(i.toDate(r)) : Om(i, a, o, (e, t) => `${e} \u2013 ${t}`, r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/date-month.mjs
var Am = [
	"sun",
	"mon",
	"tue",
	"wed",
	"thu",
	"fri",
	"sat"
];
function jm(e) {
	return e == null ? void 0 : Am[e];
}
function Mm(e, t, n) {
	return yl(e, t, jm(n));
}
function Nm(e, t, n, r) {
	let i = t.add({ weeks: e }), a = [], o = Mm(i, n, r);
	for (; a.length < 7;) {
		a.push(o);
		let e = o.add({ days: 1 });
		if (Xc(o, e)) break;
		o = e;
	}
	return a;
}
function Pm(e, t, n, r) {
	let i = jm(r), a = n ?? Tl(e, t, i);
	return [...Array(a).keys()].map((n) => Nm(n, e, t, r));
}
function Fm(e, t) {
	let n = new ku(e, {
		weekday: "long",
		timeZone: t
	}), r = new ku(e, {
		weekday: "short",
		timeZone: t
	}), i = new ku(e, {
		weekday: "narrow",
		timeZone: t
	});
	return (e) => {
		let a = e instanceof Date ? e : e.toDate(t);
		return {
			value: e,
			short: r.format(a),
			long: n.format(a),
			narrow: i.format(a)
		};
	};
}
function Im(e, t, n, r) {
	let i = Mm(e, r, t), a = [...Array(7).keys()], o = Fm(r, n);
	return a.map((e) => o(i.add({ days: e })));
}
function Lm(e, t = "long", n) {
	if (!n || n.calendar.identifier === "gregory" || n.calendar.identifier === "iso8601") {
		let n = new Date(2021, 0, 1), r = [];
		for (let i = 0; i < 12; i++) r.push(n.toLocaleString(e, { month: t })), n.setMonth(n.getMonth() + 1);
		return r;
	}
	let r = n.calendar.getMonthsInYear(n), i = new ku(e, {
		month: t,
		calendar: n.calendar.identifier
	}), a = [];
	for (let e = 1; e <= r; e++) {
		let t = n.set({ month: e });
		a.push(i.format(t.toDate("UTC")));
	}
	return a;
}
function Rm(e, t) {
	let n = yl(e, t, "mon"), r = n.year, i = yl(n.set({
		month: 1,
		day: 4
	}), t, "mon"), a = n.calendar.toJulianDay(n), o = i.calendar.toJulianDay(i);
	if (a >= o) return 1 + Math.floor((a - o) / 7);
	let s = yl(n.set({
		year: r - 1,
		month: 1,
		day: 4
	}), t, "mon"), c = s.calendar.toJulianDay(s);
	return 1 + Math.floor((a - c) / 7);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/date-year.mjs
function zm(e) {
	let t = [];
	for (let n = e.from; n <= e.to; n += 1) t.push(n);
	return t;
}
var Bm = 1900, Vm = 2099;
function Hm(e, t, n) {
	let r = e.calendar;
	return {
		from: t?.year ?? Ul(new Tu(Bm, 1, 1), r).year,
		to: n?.year ?? Ul(new Tu(Vm, 12, 31), r).year
	};
}
var Um = 10;
function Wm(e) {
	if (e) {
		if (e.length === 3) return e.padEnd(4, "0");
		if (e.length === 2) {
			let t = (/* @__PURE__ */ new Date()).getFullYear(), n = Math.floor(t / 100) * 100 + parseInt(e.slice(-2), 10);
			return n > t + Um ? (n - 100).toString() : n.toString();
		}
		return e;
	}
}
function Gm(e, t) {
	let n = t?.strict ? 10 : 12, r = e - e % 10, i = [];
	for (let e = 0; e < n; e += 1) {
		let t = r + e;
		i.push(t);
	}
	return i;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/mutation.mjs
function Km(e, t) {
	let n = sl(e ?? pl());
	return t ? Ul(n, t) : n;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/pagination.mjs
function qm(e, t, n, r) {
	return function(i) {
		let { startDate: a, focusedDate: o } = i, s = wm(a, e);
		return bm(o, n, r) ? {
			startDate: a,
			focusedDate: gm(o, n, r),
			endDate: s
		} : o.compare(a) < 0 ? {
			startDate: mm(o, e, t, n, r),
			focusedDate: gm(o, n, r),
			endDate: s
		} : o.compare(s) > 0 ? {
			startDate: pm(o, e, t, n, r),
			endDate: s,
			focusedDate: gm(o, n, r)
		} : {
			startDate: a,
			endDate: s,
			focusedDate: gm(o, n, r)
		};
	};
}
function Jm(e, t, n, r, i, a) {
	let o = qm(n, r, i, a), s = t.add(n);
	return o({
		focusedDate: e.add(n),
		startDate: pm(hm(e, s, n, r, i, a), n, r)
	});
}
function Ym(e, t, n, r, i, a) {
	let o = qm(n, r, i, a), s = t.subtract(n);
	return o({
		focusedDate: e.subtract(n),
		startDate: pm(hm(e, s, n, r, i, a), n, r)
	});
}
function Xm(e, t, n, r, i, a, o) {
	let s = qm(r, i, a, o);
	if (!n && !r.days) return s({
		focusedDate: e.add(Cm(r)),
		startDate: t
	});
	if (r.days) return Jm(e, t, r, i, a, o);
	if (r.weeks) return s({
		focusedDate: e.add({ months: 1 }),
		startDate: t
	});
	if (r.months || r.years) return s({
		focusedDate: e.add({ years: 1 }),
		startDate: t
	});
}
function Zm(e, t, n, r, i, a, o) {
	let s = qm(r, i, a, o);
	if (!n && !r.days) return s({
		focusedDate: e.subtract(Cm(r)),
		startDate: t
	});
	if (r.days) return Ym(e, t, r, i, a, o);
	if (r.weeks) return s({
		focusedDate: e.subtract({ months: 1 }),
		startDate: t
	});
	if (r.months || r.years) return s({
		focusedDate: e.subtract({ years: 1 }),
		startDate: t
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/locale.mjs
var Qm = /* @__PURE__ */ new Map();
function $m(e) {
	let t = Qm.get(e);
	return t ?? (t = "0123456789" + new Intl.NumberFormat(e, { useGrouping: !1 }).format(1234567890), Qm.set(e, t), t);
}
var eh = (e, t) => t ? $m(t).includes(e) : /\d/.test(e), th = (e, t, n) => !e || e.length !== 1 || eh(e, n) || t.includes(e), nh = (e, t, n) => e.split("").filter((e) => th(e, t, n)).join(""), rh = /* @__PURE__ */ new Map();
function ih(e) {
	let t = rh.get(e);
	if (t != null) return t;
	let n = new Intl.DateTimeFormat(e).formatToParts(/* @__PURE__ */ new Date()).find((e) => e.type === "literal");
	return t = n ? n.value : "/", rh.set(e, t), t;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/parse-date.mjs
var ah = (e) => e != null && e.length === 4, oh = (e) => e != null && parseFloat(e) <= 12, sh = (e) => e != null && parseFloat(e) <= 31;
function ch(e, t, n) {
	let { year: r, month: i, day: a } = uh(lh(t, n), e) ?? {};
	if (r != null || i != null || a != null) {
		let e = /* @__PURE__ */ new Date();
		r ||= e.getFullYear().toString(), i ||= (e.getMonth() + 1).toString(), a ||= e.getDate().toString();
	}
	if (ah(r) || (r = Wm(r)), ah(r) && oh(i) && sh(a)) return new Tu(+r, +i, +a);
	let o = Date.parse(e);
	if (!isNaN(o)) {
		let e = new Date(o);
		return new Tu(e.getFullYear(), e.getMonth() + 1, e.getDate());
	}
}
function lh(e, t) {
	return new ku(e, {
		day: "numeric",
		month: "numeric",
		year: "numeric",
		timeZone: t
	}).formatToParts(new Date(2e3, 11, 25)).map(({ type: e, value: t }) => e === "literal" ? `${t}?` : `((?!=<${e}>)\\d+)?`).join("");
}
function uh(e, t) {
	let n = t.match(e);
	return e.toString().match(/<(.+?)>/g)?.map((e) => {
		let t = e.match(/<(.+)>/);
		return !t || t.length <= 0 ? null : e.match(/<(.+)>/)?.[1];
	}).reduce((e, t, r) => (t && (e[t] = n && n.length > r ? n[r + 1] : null), e), {});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/preset.mjs
function dh(e, t, n) {
	let r = Vl(ol(n));
	switch (e) {
		case "thisWeek": return [yl(r, t), bl(r, t)];
		case "thisMonth": return [hl(r), r];
		case "thisQuarter": return [hl(r).add({ months: -((r.month - 1) % 3) }), r];
		case "thisYear": return [_l(r), r];
		case "last3Days": return [r.add({ days: -2 }), r];
		case "last7Days": return [r.add({ days: -6 }), r];
		case "last14Days": return [r.add({ days: -13 }), r];
		case "last30Days": return [r.add({ days: -29 }), r];
		case "last90Days": return [r.add({ days: -89 }), r];
		case "lastMonth": return [hl(r.add({ months: -1 })), gl(r.add({ months: -1 }))];
		case "lastQuarter": return [hl(r.add({ months: -((r.month - 1) % 3) - 3 })), gl(r.add({ months: -((r.month - 1) % 3) - 1 }))];
		case "lastWeek": return [yl(r, t).add({ weeks: -1 }), bl(r, t).add({ weeks: -1 })];
		case "lastYear": return [_l(r.add({ years: -1 })), vl(r.add({ years: -1 }))];
		default: throw Error(`Invalid date range preset: ${e}`);
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-picker@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-picker/dist/date-picker.dom.mjs
var fh = (e, t) => e.ids?.label?.(t) ?? `datepicker:${e.id}:label:${t}`, ph = (e) => e.ids?.root ?? `datepicker:${e.id}`, mh = (e, t) => e.ids?.table?.(t) ?? `datepicker:${e.id}:table:${t}`, hh = (e) => e.ids?.content ?? `datepicker:${e.id}:content`, gh = (e, t) => e.ids?.cellTrigger?.(t) ?? `datepicker:${e.id}:cell-trigger:${t}`, _h = (e, t) => e.ids?.prevTrigger?.(t) ?? `datepicker:${e.id}:prev:${t}`, vh = (e, t) => e.ids?.nextTrigger?.(t) ?? `datepicker:${e.id}:next:${t}`, yh = (e, t) => e.ids?.viewTrigger?.(t) ?? `datepicker:${e.id}:view:${t}`, bh = (e) => e.ids?.clearTrigger ?? `datepicker:${e.id}:clear`, xh = (e) => e.ids?.control ?? `datepicker:${e.id}:control`, Sh = (e, t) => e.ids?.input?.(t) ?? `datepicker:${e.id}:input:${t}`, Ch = (e) => e.ids?.trigger ?? `datepicker:${e.id}:trigger`, wh = (e) => e.ids?.positioner ?? `datepicker:${e.id}:positioner`, Th = (e) => e.ids?.monthSelect ?? `datepicker:${e.id}:month-select`, Eh = (e) => e.ids?.yearSelect ?? `datepicker:${e.id}:year-select`, Dh = (e, t) => jn(kh(e), `[data-part=table-cell-trigger][data-view=${t}][data-focus]:not([data-outside-range])`), Oh = (e) => e.getById(Ch(e)), kh = (e) => e.getById(hh(e)), Ah = (e) => ht(Fh(e), "[data-part=input]"), jh = (e) => e.getById(Eh(e)), Mh = (e) => e.getById(Th(e)), Nh = (e) => e.getById(bh(e)), Ph = (e) => e.getById(wh(e)), Fh = (e) => e.getById(xh(e));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-picker@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-picker/dist/date-picker.utils.mjs
function Ih(e) {
	let [t, n] = e, r;
	return r = !t || !n || t.compare(n) <= 0 ? e : [n, t], r;
}
function Lh(e, t) {
	let [n, r] = t;
	return !n || !r ? !1 : n.compare(e) <= 0 && r.compare(e) >= 0;
}
function Rh(e) {
	return e.slice().filter((e) => e != null).sort((e, t) => e.compare(t));
}
function zh(e) {
	return In(e, {
		year: "calendar decade",
		month: "calendar year",
		day: "calendar month"
	});
}
var Bh = {
	day: "dd",
	month: "mm",
	year: "yyyy"
};
function Vh(e) {
	return new ku(e).formatToParts(/* @__PURE__ */ new Date()).map((e) => Bh[e.type] ?? e.value).join("");
}
var Hh = (e) => !Number.isNaN(e.day) && !Number.isNaN(e.month) && !Number.isNaN(e.year), Uh = {
	dayCell(e) {
		return e.unavailable ? `Not available. ${e.valueText}` : e.firstInRange ? `Starting range from ${e.valueText}` : e.lastInRange ? `Range ending at ${e.valueText}` : e.inRange ? `In range. ${e.valueText}` : e.selected ? `Selected date. ${e.valueText}` : `Choose ${e.valueText}`;
	},
	trigger(e) {
		return e ? "Close calendar" : "Open calendar";
	},
	viewTrigger(e, t) {
		return t ? `Switch to ${t} view` : `${e} view`;
	},
	presetTrigger(e) {
		let [t = "", n = ""] = e;
		return `select ${t} to ${n}`;
	},
	prevTrigger(e) {
		return In(e, {
			year: "Switch to previous decade",
			month: "Switch to previous year",
			day: "Switch to previous month"
		});
	},
	nextTrigger(e) {
		return In(e, {
			year: "Switch to next decade",
			month: "Switch to next year",
			day: "Switch to next month"
		});
	},
	placeholder() {
		return {
			day: "dd",
			month: "mm",
			year: "yyyy"
		};
	},
	content: "calendar",
	monthSelect: "Select month",
	yearSelect: "Select year",
	clearTrigger: "Clear selected dates",
	weekColumnHeader: "Wk",
	weekNumberCell(e) {
		return `Week ${e}`;
	}
};
function Wh(e, t) {
	return e ? e === "day" ? 0 : e === "month" ? 1 : 2 : t || 0;
}
function Gh(e) {
	return e === 0 ? "day" : e === 1 ? "month" : "year";
}
function Kh(e, t, n) {
	return Gh(Be(Wh(e, 0), Wh(t, 0), Wh(n, 2)));
}
function qh(e, t) {
	return Wh(e, 0) > Wh(t, 0);
}
function Jh(e, t) {
	return Wh(e, 0) < Wh(t, 0);
}
function Yh(e, t, n) {
	return Kh(Gh(Wh(e, 0) + 1), t, n);
}
function Xh(e, t, n) {
	return Kh(Gh(Wh(e, 0) - 1), t, n);
}
var Zh = [
	"day",
	"month",
	"year"
];
function Qh(e) {
	Zh.forEach((t) => e(t));
}
var $h = Oi((e) => [
	e.view,
	e.startValue.toString(),
	e.endValue.toString(),
	e.locale,
	e.timeZone,
	e.selectionMode
], ([e], t) => {
	let { startValue: n, endValue: r, locale: i, timeZone: a, selectionMode: o } = t;
	if (e === "year") {
		let e = Gm(n.year, { strict: !0 }), t = e.at(0).toString(), r = e.at(-1).toString();
		return {
			start: t,
			end: r,
			formatted: `${t} - ${r}`
		};
	}
	if (e === "month") {
		let e = new ku(i, {
			year: "numeric",
			timeZone: a,
			calendar: n.calendar.identifier
		}), t = e.format(n.toDate(a)), s = e.format(r.toDate(a));
		return {
			start: t,
			end: s,
			formatted: o === "range" ? `${t} - ${s}` : t
		};
	}
	let s = new ku(i, {
		month: "long",
		year: "numeric",
		timeZone: a,
		calendar: n.calendar.identifier
	}), c = s.format(n.toDate(a)), l = s.format(r.toDate(a));
	return {
		start: c,
		end: l,
		formatted: o === "range" ? `${c} - ${l}` : c
	};
});
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-picker@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-picker/dist/date-picker.connect.mjs
function eg(e, t) {
	let { state: n, context: r, prop: i, send: a, computed: o, scope: s } = e, c = r.get("startValue"), l = o("endValue"), u = r.get("value"), d = r.get("focusedValue"), f = r.get("hoveredValue"), p = f ? Ih([u[0], f]) : [], m = !!i("disabled"), h = !!i("readOnly"), g = !!i("invalid"), _ = o("isInteractive"), v = u.length === 0, y = i("min"), ee = i("max"), b = i("locale"), x = i("timeZone"), S = i("startOfWeek"), C = n.matches("focused"), w = n.matches("open"), T = i("selectionMode") === "range", E = i("selectionMode") === "multiple", te = i("isDateUnavailable"), ne = i("maxSelectedDates"), re = E && ne != null && u.length >= ne, D = r.get("currentPlacement"), ie = D ? Go(D) : void 0, O = us({
		...i("positioning"),
		placement: D
	}), k = ih(b), A = He(Uh, i("translations"));
	function ae(e = c) {
		let t = i("fixedWeeks") ? 6 : void 0;
		return Pm(e, b, t, S);
	}
	function oe(e = {}) {
		let { format: t } = e;
		return Lm(b, t, d).map((e, t) => {
			let n = t + 1;
			return {
				label: e,
				value: n,
				disabled: bm(d.set({ month: n }), y, ee)
			};
		});
	}
	function j() {
		return zm(Hm(d, y, ee)).map((e) => ({
			label: e.toString(),
			value: e,
			disabled: !it(e, y?.year, ee?.year)
		}));
	}
	function M(e) {
		return ym(e, te, b, y, ee);
	}
	function N(e) {
		let t = c ?? Km(x, d.calendar);
		a({
			type: "FOCUS.SET",
			value: t.set({ month: e })
		});
	}
	function P(e) {
		let t = c ?? Km(x, d.calendar);
		a({
			type: "FOCUS.SET",
			value: t.set({ year: e })
		});
	}
	function se(e) {
		let { value: t, disabled: n } = e, r = d.set({ year: t }), i = !Gm(c.year, { strict: !0 }).includes(t), a = it(t, y?.year, ee?.year), o = T && Lh(r, u), s = T && u[0] && tl(r, u[0]), l = T && u[1] && tl(r, u[1]), f = T && p.length > 0, m = f && Lh(r, p), h = f && p[0] && tl(r, p[0]), g = f && p[1] && tl(r, p[1]), _ = {
			focused: d.year === e.value,
			selectable: !i && a,
			outsideRange: i,
			selected: !!u.find((e) => e && e.year === t),
			valueText: t.toString(),
			inRange: o || m,
			firstInRange: !!s,
			lastInRange: !!l,
			inHoveredRange: !!m,
			firstInHoveredRange: !!h,
			lastInHoveredRange: !!g,
			value: r,
			get disabled() {
				return n || !_.selectable;
			}
		};
		return _;
	}
	function ce(e) {
		let { value: t, disabled: n } = e, r = d.set({ month: t }), i = Dm(b, x, d), a = T && Lh(r, u), o = T && u[0] && el(r, u[0]), s = T && u[1] && el(r, u[1]), c = T && p.length > 0, l = c && Lh(r, p), f = c && p[0] && el(r, p[0]), m = c && p[1] && el(r, p[1]), h = {
			focused: d.month === e.value,
			selectable: !bm(r, y, ee),
			selected: !!u.find((e) => e && e.month === t && e.year === d.year),
			valueText: i.format(r.toDate(x)),
			inRange: a || l,
			firstInRange: !!o,
			lastInRange: !!s,
			inHoveredRange: !!l,
			firstInHoveredRange: !!f,
			lastInHoveredRange: !!m,
			outsideRange: !1,
			value: r,
			get disabled() {
				return n || !h.selectable;
			}
		};
		return h;
	}
	function F(e) {
		let { value: t, disabled: n, visibleRange: r = o("visibleRange") } = e, a = Em(b, x, d), s = Cm(o("visibleDuration")), c = i("outsideDaySelectable"), l = r.start.add(s).subtract({ days: 1 }), f = bm(t, r.start, l), m = T && Lh(t, u), h = T && u[0] && Xc(t, u[0]), g = T && u[1] && Xc(t, u[1]), _ = T && p.length > 0, v = _ && Lh(t, p), S = _ && p[0] && Xc(t, p[0]), C = _ && p[1] && Xc(t, p[1]), w = u.some((e) => e != null && Xc(t, e)), E = {
			invalid: bm(t, y, ee),
			disabled: n || !c && f || bm(t, y, ee) || re && !w,
			selected: w,
			unavailable: ym(t, te, b, y, ee) && !n,
			outsideRange: f,
			today: rl(t, x),
			weekend: kl(t, b),
			value: t,
			valueText: a.format(t.toDate(x)),
			get focused() {
				return d != null && Xc(t, d) && (!E.outsideRange || c);
			},
			get selectable() {
				return !E.disabled && !E.unavailable;
			},
			inRange: m || v,
			firstInRange: h,
			lastInRange: g,
			inHoveredRange: v,
			firstInHoveredRange: S,
			lastInHoveredRange: C
		};
		return E;
	}
	function I(e) {
		let { view: t = "day", id: n } = e;
		return [t, n].filter(Boolean).join(" ");
	}
	return {
		focused: C,
		open: w,
		disabled: m,
		invalid: g,
		readOnly: h,
		inline: !!i("inline"),
		numOfMonths: i("numOfMonths"),
		showWeekNumbers: !!i("showWeekNumbers"),
		selectionMode: i("selectionMode"),
		maxSelectedDates: ne,
		isMaxSelected: re,
		view: r.get("view"),
		getRangePresetValue(e) {
			return dh(e, b, x);
		},
		getWeekNumber(e) {
			let t = e[0];
			return t ? Rm(t, b) : 0;
		},
		getDaysInWeek(e, t = c) {
			return Nm(e, t, b, S);
		},
		getOffset(e) {
			let t = c.add(e), n = l.add(e), r = Dm(b, x, d);
			return {
				visibleRange: {
					start: t,
					end: n
				},
				weeks: ae(t),
				visibleRangeText: {
					start: r.format(t.toDate(x)),
					end: r.format(n.toDate(x))
				}
			};
		},
		getMonthWeeks: ae,
		isUnavailable: M,
		weeks: ae(),
		weekDays: Im(c, S, x, b),
		visibleRangeText: o("visibleRangeText"),
		value: u,
		valueAsDate: u.filter((e) => e != null).map((e) => e.toDate(x)),
		valueAsString: o("valueAsString"),
		focusedValue: d,
		focusedValueAsDate: d?.toDate(x),
		focusedValueAsString: i("format")(d, {
			locale: b,
			timeZone: x
		}),
		visibleRange: o("visibleRange"),
		selectToday() {
			let e = gm(Km(x, d.calendar), y, ee);
			a({
				type: "VALUE.SET",
				value: [e]
			});
		},
		setValue(e) {
			let t = e.map((e) => gm(e, y, ee));
			a({
				type: "VALUE.SET",
				value: t
			});
		},
		setTime(e, t = 0) {
			let n = Array.from(u), r = n[t];
			r && ("hour" in r || (r = Hl(r)), r = r.set({
				hour: e.hour ?? ("hour" in r ? r.hour : 0),
				minute: e.minute ?? ("minute" in r ? r.minute : 0),
				second: e.second ?? ("second" in r ? r.second : 0),
				millisecond: e.millisecond ?? ("millisecond" in r ? r.millisecond : 0)
			}), n[t] = gm(r, y, ee), a({
				type: "VALUE.SET",
				value: n
			}));
		},
		clearValue(e = {}) {
			let { focus: t = !0 } = e;
			a({
				type: "VALUE.CLEAR",
				focus: t
			});
		},
		setFocusedValue(e) {
			a({
				type: "FOCUS.SET",
				value: e
			});
		},
		setOpen(e) {
			i("inline") || n.matches("open") !== e && a({ type: e ? "OPEN" : "CLOSE" });
		},
		focusMonth: N,
		focusYear: P,
		getYears: j,
		getMonths: oe,
		getYearsGrid(e = {}) {
			let { columns: t = 1 } = e, n = Gm(c.year, { strict: !0 }).map((e) => ({
				label: e.toString(),
				value: e,
				disabled: !it(e, y?.year, ee?.year)
			}));
			return ft(n, t);
		},
		getDecade() {
			let e = Gm(c.year, { strict: !0 });
			return {
				start: e.at(0),
				end: e.at(-1)
			};
		},
		getMonthsGrid(e = {}) {
			let { columns: t = 1, format: n } = e;
			return ft(oe({ format: n }), t);
		},
		format(e, t = {
			month: "long",
			year: "numeric"
		}) {
			return new ku(b, {
				...t,
				calendar: e.calendar.identifier
			}).format(e.toDate(x));
		},
		setView(e) {
			a({
				type: "VIEW.SET",
				view: e
			});
		},
		goToNext() {
			a({
				type: "GOTO.NEXT",
				view: r.get("view")
			});
		},
		goToPrev() {
			a({
				type: "GOTO.PREV",
				view: r.get("view")
			});
		},
		getRootProps() {
			return t.element({
				...dm.root.attrs,
				dir: i("dir"),
				id: ph(s),
				"data-state": w ? "open" : "closed",
				"data-disabled": Z(m),
				"data-readonly": Z(h),
				"data-empty": Z(v)
			});
		},
		getLabelProps(e = {}) {
			let { index: n = 0 } = e;
			return t.label({
				...dm.label.attrs,
				id: fh(s, n),
				dir: i("dir"),
				htmlFor: Sh(s, n),
				"data-state": w ? "open" : "closed",
				"data-index": n,
				"data-disabled": Z(m),
				"data-readonly": Z(h)
			});
		},
		getControlProps() {
			return t.element({
				...dm.control.attrs,
				dir: i("dir"),
				id: xh(s),
				"data-disabled": Z(m),
				"data-placeholder-shown": Z(v)
			});
		},
		getRangeTextProps() {
			return t.element({
				...dm.rangeText.attrs,
				dir: i("dir")
			});
		},
		getContentProps() {
			return t.element({
				...dm.content.attrs,
				hidden: !w,
				dir: i("dir"),
				"data-state": w ? "open" : "closed",
				"data-placement": D,
				"data-side": ie,
				"data-inline": Z(i("inline")),
				id: hh(s),
				tabIndex: -1,
				role: "application",
				"aria-roledescription": "datepicker",
				"aria-label": A.content
			});
		},
		getTableProps(e = {}) {
			let { view: n = "day", columns: r = n === "day" ? 7 : 4 } = e, o = I(e);
			return t.element({
				...dm.table.attrs,
				role: "grid",
				"data-columns": r,
				"aria-roledescription": zh(n),
				id: mh(s, o),
				"aria-readonly": pn(h),
				"aria-disabled": pn(m),
				"aria-multiselectable": pn(i("selectionMode") !== "single"),
				"data-view": n,
				dir: i("dir"),
				tabIndex: -1,
				onKeyDown(e) {
					if (e.defaultPrevented || m) return;
					let t = {
						Enter() {
							_ && (n === "day" && M(d) || (n !== "month" || ce({ value: d.month }).selectable) && (n !== "year" || se({ value: d.year }).selectable) && a({
								type: "TABLE.ENTER",
								view: n,
								columns: r,
								focus: !0
							}));
						},
						ArrowLeft() {
							a({
								type: "TABLE.ARROW_LEFT",
								view: n,
								columns: r,
								focus: !0
							});
						},
						ArrowRight() {
							a({
								type: "TABLE.ARROW_RIGHT",
								view: n,
								columns: r,
								focus: !0
							});
						},
						ArrowUp() {
							a({
								type: "TABLE.ARROW_UP",
								view: n,
								columns: r,
								focus: !0
							});
						},
						ArrowDown() {
							a({
								type: "TABLE.ARROW_DOWN",
								view: n,
								columns: r,
								focus: !0
							});
						},
						PageUp(e) {
							a({
								type: "TABLE.PAGE_UP",
								larger: e.shiftKey,
								view: n,
								columns: r,
								focus: !0
							});
						},
						PageDown(e) {
							a({
								type: "TABLE.PAGE_DOWN",
								larger: e.shiftKey,
								view: n,
								columns: r,
								focus: !0
							});
						},
						Home() {
							a({
								type: "TABLE.HOME",
								view: n,
								columns: r,
								focus: !0
							});
						},
						End() {
							a({
								type: "TABLE.END",
								view: n,
								columns: r,
								focus: !0
							});
						}
					}[Qt(e, { dir: i("dir") })];
					t && (t(e), e.preventDefault(), e.stopPropagation());
				},
				onPointerLeave() {
					a({ type: "TABLE.POINTER_LEAVE" });
				},
				onPointerDown() {
					a({
						type: "TABLE.POINTER_DOWN",
						view: n
					});
				},
				onPointerUp() {
					a({
						type: "TABLE.POINTER_UP",
						view: n
					});
				}
			});
		},
		getTableHeadProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...dm.tableHead.attrs,
				"aria-hidden": !0,
				dir: i("dir"),
				"data-view": n,
				"data-disabled": Z(m)
			});
		},
		getTableHeaderProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...dm.tableHeader.attrs,
				dir: i("dir"),
				"data-view": n,
				"data-disabled": Z(m)
			});
		},
		getTableBodyProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...dm.tableBody.attrs,
				"data-view": n,
				"data-disabled": Z(m)
			});
		},
		getTableRowProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...dm.tableRow.attrs,
				"aria-disabled": pn(m),
				"data-disabled": Z(m),
				"data-view": n
			});
		},
		getWeekNumberHeaderCellProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...dm.tableCell.attrs,
				scope: "col",
				"aria-label": A.weekColumnHeader,
				"data-view": n,
				"data-type": "week-number",
				"data-disabled": Z(m)
			});
		},
		getWeekNumberCellProps(e) {
			let { weekIndex: n, week: r } = e, i = r[0] ? Rm(r[0], b) : 0;
			return t.element({
				...dm.tableCell.attrs,
				role: "rowheader",
				"aria-label": A.weekNumberCell?.(i),
				"data-view": "day",
				"data-week-index": n,
				"data-type": "week-number",
				"data-disabled": Z(m)
			});
		},
		getDayTableCellState: F,
		getDayTableCellProps(e) {
			let { value: n } = e, r = F(e);
			return t.element({
				...dm.tableCell.attrs,
				role: "gridcell",
				"aria-disabled": pn(!r.selectable),
				"aria-selected": r.selected || r.inRange,
				"aria-invalid": pn(r.invalid),
				"aria-current": r.today ? "date" : void 0,
				"data-value": n.toString()
			});
		},
		getDayTableCellTriggerProps(e) {
			let { value: n } = e, r = F(e);
			return t.element({
				...dm.tableCellTrigger.attrs,
				id: gh(s, n.toString()),
				role: "button",
				dir: i("dir"),
				tabIndex: m ? -1 : r.focused ? 0 : -1,
				"aria-label": A.dayCell(r),
				"aria-disabled": pn(!r.selectable),
				"aria-invalid": pn(r.invalid),
				"data-disabled": Z(!r.selectable),
				"data-selectable": Z(r.selectable),
				"data-selected": Z(r.selected),
				"data-value": n.toString(),
				"data-view": "day",
				"data-today": Z(r.today),
				"data-focus": Z(r.focused),
				"data-unavailable": Z(r.unavailable),
				"data-range-start": Z(r.firstInRange),
				"data-range-end": Z(r.lastInRange),
				"data-in-range": Z(r.inRange),
				"data-outside-range": Z(r.outsideRange),
				"data-weekend": Z(r.weekend),
				"data-in-hover-range": Z(r.inHoveredRange),
				"data-hover-range-start": Z(r.firstInHoveredRange),
				"data-hover-range-end": Z(r.lastInHoveredRange),
				onClick(e) {
					e.defaultPrevented || _ && r.selectable && a({
						type: "CELL.CLICK",
						cell: "day",
						value: n
					});
				},
				onPointerMove: T ? (e) => {
					if (e.pointerType === "touch" || !r.selectable) return;
					let t = !s.isActiveElement(e.currentTarget);
					f && $c(n, f) || a({
						type: "CELL.POINTER_MOVE",
						cell: "day",
						value: n,
						focus: t,
						outsideRange: r.outsideRange
					});
				} : void 0
			});
		},
		getMonthTableCellState: ce,
		getMonthTableCellProps(e) {
			let { value: n, columns: r } = e, a = ce(e);
			return t.element({
				...dm.tableCell.attrs,
				dir: i("dir"),
				colSpan: r,
				role: "gridcell",
				"aria-selected": pn(a.selected || a.inRange),
				"data-selected": Z(a.selected),
				"aria-disabled": pn(!a.selectable),
				"data-value": n
			});
		},
		getMonthTableCellTriggerProps(e) {
			let { value: n } = e, r = ce(e);
			return t.element({
				...dm.tableCellTrigger.attrs,
				id: gh(s, n.toString()),
				role: "button",
				dir: i("dir"),
				tabIndex: m ? -1 : r.focused ? 0 : -1,
				"aria-label": r.valueText,
				"aria-disabled": pn(!r.selectable),
				"data-disabled": Z(!r.selectable),
				"data-selectable": Z(r.selectable),
				"data-selected": Z(r.selected),
				"data-value": n,
				"data-view": "month",
				"data-focus": Z(r.focused),
				"data-outside-range": Z(r.outsideRange),
				"data-range-start": Z(r.firstInRange),
				"data-range-end": Z(r.lastInRange),
				"data-in-range": Z(r.inRange),
				"data-in-hover-range": Z(r.inHoveredRange),
				"data-hover-range-start": Z(r.firstInHoveredRange),
				"data-hover-range-end": Z(r.lastInHoveredRange),
				onClick(e) {
					e.defaultPrevented || _ && r.selectable && a({
						type: "CELL.CLICK",
						cell: "month",
						value: n
					});
				},
				onPointerMove: T ? (e) => {
					if (e.pointerType === "touch" || !r.selectable) return;
					let t = !s.isActiveElement(e.currentTarget);
					f && r.value && el(r.value, f) || a({
						type: "CELL.POINTER_MOVE",
						cell: "month",
						value: r.value,
						focus: t
					});
				} : void 0
			});
		},
		getYearTableCellState: se,
		getYearTableCellProps(e) {
			let { value: n, columns: r } = e, a = se(e);
			return t.element({
				...dm.tableCell.attrs,
				dir: i("dir"),
				colSpan: r,
				role: "gridcell",
				"aria-selected": pn(a.selected || a.inRange),
				"data-selected": Z(a.selected),
				"aria-disabled": pn(!a.selectable),
				"data-value": n
			});
		},
		getYearTableCellTriggerProps(e) {
			let { value: n } = e, r = se(e);
			return t.element({
				...dm.tableCellTrigger.attrs,
				id: gh(s, n.toString()),
				role: "button",
				dir: i("dir"),
				tabIndex: m ? -1 : r.focused ? 0 : -1,
				"aria-label": r.valueText,
				"aria-disabled": pn(!r.selectable),
				"data-disabled": Z(!r.selectable),
				"data-selectable": Z(r.selectable),
				"data-selected": Z(r.selected),
				"data-value": n,
				"data-view": "year",
				"data-focus": Z(r.focused),
				"data-outside-range": Z(r.outsideRange),
				"data-range-start": Z(r.firstInRange),
				"data-range-end": Z(r.lastInRange),
				"data-in-range": Z(r.inRange),
				"data-in-hover-range": Z(r.inHoveredRange),
				"data-hover-range-start": Z(r.firstInHoveredRange),
				"data-hover-range-end": Z(r.lastInHoveredRange),
				onClick(e) {
					e.defaultPrevented || _ && r.selectable && a({
						type: "CELL.CLICK",
						cell: "year",
						value: n
					});
				},
				onPointerMove: T ? (e) => {
					if (e.pointerType === "touch" || !r.selectable) return;
					let t = !s.isActiveElement(e.currentTarget);
					f && r.value && tl(r.value, f) || a({
						type: "CELL.POINTER_MOVE",
						cell: "year",
						value: r.value,
						focus: t
					});
				} : void 0
			});
		},
		getNextTriggerProps(e = {}) {
			let { view: n = "day" } = e, r = m || !o("isNextVisibleRangeValid");
			return t.button({
				...dm.nextTrigger.attrs,
				dir: i("dir"),
				id: vh(s, n),
				type: "button",
				"aria-label": A.nextTrigger(n),
				disabled: r,
				"data-disabled": Z(r),
				onClick(e) {
					e.defaultPrevented || a({
						type: "GOTO.NEXT",
						view: n
					});
				}
			});
		},
		getPrevTriggerProps(e = {}) {
			let { view: n = "day" } = e, r = m || !o("isPrevVisibleRangeValid");
			return t.button({
				...dm.prevTrigger.attrs,
				dir: i("dir"),
				id: _h(s, n),
				type: "button",
				"aria-label": A.prevTrigger(n),
				disabled: r,
				"data-disabled": Z(r),
				onClick(e) {
					e.defaultPrevented || a({
						type: "GOTO.PREV",
						view: n
					});
				}
			});
		},
		getClearTriggerProps() {
			return t.button({
				...dm.clearTrigger.attrs,
				id: bh(s),
				dir: i("dir"),
				type: "button",
				"aria-label": A.clearTrigger,
				hidden: !u.length,
				onClick(e) {
					e.defaultPrevented || _ && a({ type: "VALUE.CLEAR" });
				}
			});
		},
		getTriggerProps() {
			return t.button({
				...dm.trigger.attrs,
				id: Ch(s),
				dir: i("dir"),
				type: "button",
				"data-placement": D,
				"data-side": ie,
				"aria-label": A.trigger(w),
				"aria-controls": hh(s),
				"aria-expanded": w,
				"data-state": w ? "open" : "closed",
				"data-placeholder-shown": Z(v),
				"aria-haspopup": "grid",
				disabled: m,
				onClick(e) {
					e.defaultPrevented || _ && a({ type: "TRIGGER.CLICK" });
				}
			});
		},
		getViewProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...dm.view.attrs,
				"data-view": n,
				hidden: r.get("view") !== n
			});
		},
		getViewTriggerProps(e = {}) {
			let { view: n = "day" } = e, r = Yh(n, i("minView"), i("maxView")), o = r !== n, c = m || !o;
			return t.button({
				...dm.viewTrigger.attrs,
				"data-view": n,
				dir: i("dir"),
				id: yh(s, n),
				type: "button",
				disabled: c,
				"data-disabled": Z(c),
				"aria-label": A.viewTrigger(n, o ? r : void 0),
				onClick(e) {
					e.defaultPrevented || _ && a({
						type: "VIEW.TOGGLE",
						src: "viewTrigger"
					});
				}
			});
		},
		getViewControlProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...dm.viewControl.attrs,
				"data-view": n,
				dir: i("dir")
			});
		},
		getInputProps(e = {}) {
			let { index: n = 0, fixOnBlur: r = !0 } = e;
			return t.input({
				...dm.input.attrs,
				id: Sh(s, n),
				autoComplete: "off",
				autoCorrect: "off",
				spellCheck: "false",
				dir: i("dir"),
				name: i("name"),
				"data-index": n,
				"data-state": w ? "open" : "closed",
				"data-placeholder-shown": Z(v),
				readOnly: h,
				disabled: m,
				required: i("required"),
				"aria-invalid": pn(g),
				"data-invalid": Z(g),
				placeholder: i("placeholder") || Vh(b),
				defaultValue: o("valueAsString")[n],
				onBeforeInput(e) {
					let { data: t } = Ue(e);
					th(t, k, b) || e.preventDefault();
				},
				onClick(e) {
					e.defaultPrevented || i("openOnClick") && _ && a({
						type: "OPEN",
						src: "input.click"
					});
				},
				onFocus() {
					a({
						type: "INPUT.FOCUS",
						index: n
					});
				},
				onBlur(e) {
					let t = e.currentTarget.value.trim();
					a({
						type: "INPUT.BLUR",
						value: t,
						index: n,
						fixOnBlur: r
					});
				},
				onKeyDown(e) {
					if (e.defaultPrevented || !_) return;
					let t = { Enter(e) {
						Ye(e) || M(d) || e.currentTarget.value.trim() !== "" && a({
							type: "INPUT.ENTER",
							value: e.currentTarget.value,
							index: n
						});
					} }[e.key];
					t && (t(e), e.preventDefault());
				},
				onInput(e) {
					let t = e.currentTarget.value;
					a({
						type: "INPUT.CHANGE",
						value: nh(t, k, b),
						index: n
					});
				}
			});
		},
		getMonthSelectProps() {
			return t.select({
				...dm.monthSelect.attrs,
				id: Th(s),
				"aria-label": A.monthSelect,
				disabled: m,
				dir: i("dir"),
				defaultValue: c.month,
				onChange(e) {
					N(Number(e.currentTarget.value));
				}
			});
		},
		getYearSelectProps() {
			return t.select({
				...dm.yearSelect.attrs,
				id: Eh(s),
				disabled: m,
				"aria-label": A.yearSelect,
				dir: i("dir"),
				defaultValue: c.year,
				onChange(e) {
					P(Number(e.currentTarget.value));
				}
			});
		},
		getPositionerProps() {
			return t.element({
				id: wh(s),
				...dm.positioner.attrs,
				dir: i("dir"),
				style: O.floating
			});
		},
		getPresetTriggerProps(e) {
			let n = Array.isArray(e.value) ? e.value : dh(e.value, b, x), r = n.filter((e) => e != null).map((e) => e.toDate(x).toDateString());
			return t.button({
				...dm.presetTrigger.attrs,
				"aria-label": A.presetTrigger(r),
				type: "button",
				onClick(e) {
					e.defaultPrevented || _ && a({
						type: "PRESET.CLICK",
						value: n
					});
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-picker@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-picker/dist/date-picker.machine.mjs
var { and: tg } = On();
function ng(e, t) {
	if (e?.length !== t?.length) return !1;
	let n = Math.max(e.length, t.length);
	for (let r = 0; r < n; r++) if (!vm(e[r], t[r])) return !1;
	return !0;
}
function rg(e, t) {
	return e.map((e) => e == null ? "" : t("format")(e, {
		locale: t("locale"),
		timeZone: t("timeZone")
	}));
}
var ig = Pn({
	props({ props: e }) {
		let t = e.locale || "en-US", n = e.timeZone || "UTC", r = e.selectionMode || "single", i = e.numOfMonths || 1, a;
		if (e.createCalendar) {
			let n = new Intl.DateTimeFormat(t).resolvedOptions().calendar;
			n !== "gregory" && n !== "iso8601" && (a = e.createCalendar(n));
		}
		let o = (e) => !a || e.calendar.identifier === a.identifier ? e : Ul(e, a), s = e.defaultValue ? Rh(e.defaultValue).map((t) => gm(o(t), e.min, e.max)) : void 0, c = e.value ? Rh(e.value).map((t) => gm(o(t), e.min, e.max)) : void 0, l = e.focusedValue || e.defaultFocusedValue || c?.[0] || s?.[0] || Km(n, a);
		l = gm(o(l), e.min, e.max);
		let u = e.minView || "day", d = e.maxView || "year", f = Kh(e.defaultView || e.view || u, u, d);
		return {
			locale: t,
			numOfMonths: i,
			timeZone: n,
			selectionMode: r,
			minView: u,
			maxView: d,
			outsideDaySelectable: !1,
			closeOnSelect: !0,
			format(e, { locale: t, timeZone: n }) {
				return new ku(t, {
					timeZone: n,
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
					calendar: a?.identifier
				}).format(e.toDate(n));
			},
			parse(e, { locale: t, timeZone: n }) {
				return ch(e, t, n);
			},
			...e,
			focusedValue: e.focusedValue === void 0 ? void 0 : l,
			defaultFocusedValue: l,
			value: c,
			defaultValue: s ?? [],
			defaultView: f,
			positioning: {
				placement: "bottom",
				...e.positioning
			}
		};
	},
	initialState({ prop: e }) {
		return e("inline") || (e("open") ?? e("defaultOpen")) ? "open" : "idle";
	},
	refs() {
		return { announcer: void 0 };
	},
	context({ prop: e, bindable: t, getContext: n }) {
		return {
			focusedValue: t(() => ({
				defaultValue: e("defaultFocusedValue"),
				value: e("focusedValue"),
				isEqual: vm,
				hash: (e) => e.toString(),
				sync: !0,
				onChange(t) {
					let r = n(), i = r.get("view"), a = r.get("value"), o = rg(a, e);
					e("onFocusChange")?.({
						value: a,
						valueAsString: o,
						view: i,
						focusedValue: t
					});
				}
			})),
			value: t(() => ({
				defaultValue: e("defaultValue"),
				value: e("value"),
				isEqual: ng,
				hash: (e) => e.map((e) => e?.toString() ?? "").join(","),
				onChange(t) {
					let r = n(), i = rg(t, e);
					e("onValueChange")?.({
						value: t,
						valueAsString: i,
						view: r.get("view")
					});
				}
			})),
			inputValue: t(() => ({ defaultValue: "" })),
			activeIndex: t(() => ({
				defaultValue: 0,
				sync: !0
			})),
			hoveredValue: t(() => ({
				defaultValue: null,
				isEqual: vm
			})),
			view: t(() => ({
				defaultValue: e("defaultView"),
				value: e("view"),
				onChange(t) {
					e("onViewChange")?.({ view: t });
				}
			})),
			startValue: t(() => ({
				defaultValue: _m(e("focusedValue") || e("defaultFocusedValue"), "start", { months: e("numOfMonths") }, e("locale")),
				isEqual: vm,
				hash: (e) => e.toString()
			})),
			currentPlacement: t(() => ({ defaultValue: void 0 })),
			restoreFocus: t(() => ({ defaultValue: !1 }))
		};
	},
	computed: {
		isInteractive: ({ prop: e }) => !e("disabled") && !e("readOnly"),
		visibleDuration: ({ prop: e }) => ({ months: e("numOfMonths") }),
		endValue: ({ context: e, computed: t }) => wm(e.get("startValue"), t("visibleDuration")),
		visibleRange: ({ context: e, computed: t }) => ({
			start: e.get("startValue"),
			end: t("endValue")
		}),
		visibleRangeText: ({ context: e, prop: t, computed: n }) => $h({
			view: e.get("view"),
			startValue: e.get("startValue"),
			endValue: n("endValue"),
			locale: t("locale"),
			timeZone: t("timeZone"),
			selectionMode: t("selectionMode")
		}),
		isPrevVisibleRangeValid: ({ context: e, prop: t }) => !xm(e.get("startValue"), t("min"), t("max")),
		isNextVisibleRangeValid: ({ prop: e, computed: t }) => !Sm(t("endValue"), e("min"), e("max")),
		valueAsString: ({ context: e, prop: t }) => rg(e.get("value"), t)
	},
	effects: ["setupLiveRegion"],
	watch({ track: e, prop: t, context: n, action: r, computed: i }) {
		e([() => t("locale")], () => {
			r(["setStartValue", "syncInputElement"]);
		}), e([() => n.hash("focusedValue")], () => {
			r([
				"setStartValue",
				"focusActiveCellIfNeeded",
				"setHoveredValueIfKeyboard"
			]);
		}), e([() => n.hash("startValue")], () => {
			r([
				"syncMonthSelectElement",
				"syncYearSelectElement",
				"invokeOnVisibleRangeChange"
			]);
		}), e([() => n.get("inputValue")], () => {
			r(["syncInputValue"]);
		}), e([() => n.hash("value")], () => {
			r(["syncInputElement"]);
		}), e([() => i("valueAsString").toString()], () => {
			r(["announceValueText"]);
		}), e([() => n.get("view")], () => {
			r(["focusActiveCell"]);
		}), e([() => t("open")], () => {
			r(["toggleVisibility"]);
		});
	},
	on: {
		"VALUE.SET": { actions: ["setDateValue", "setFocusedDate"] },
		"VIEW.SET": { actions: ["setView"] },
		"FOCUS.SET": { actions: ["setFocusedDate"] },
		"VALUE.CLEAR": { actions: [
			"clearDateValue",
			"clearFocusedDate",
			"setActiveIndexToStart",
			"clearHoveredDate",
			"focusFirstInputElement"
		] },
		"INPUT.CHANGE": [{
			guard: "isInputValueEmpty",
			actions: [
				"setInputValue",
				"clearDateValue",
				"clearFocusedDate"
			]
		}, { actions: ["setInputValue", "focusParsedDate"] }],
		"INPUT.ENTER": { actions: ["focusParsedDate", "selectFocusedDate"] },
		"INPUT.FOCUS": { actions: ["setActiveIndex"] },
		"INPUT.BLUR": [{
			guard: "shouldFixOnBlur",
			actions: ["setActiveIndexToStart", "selectParsedDate"]
		}, { actions: ["setActiveIndexToStart"] }],
		"PRESET.CLICK": [{
			guard: "isOpenControlled",
			actions: [
				"setDateValue",
				"setFocusedDate",
				"invokeOnClose"
			]
		}, {
			target: "focused",
			actions: [
				"setDateValue",
				"setFocusedDate",
				"focusInputElement"
			]
		}],
		"GOTO.NEXT": [
			{
				guard: "isYearView",
				actions: ["focusNextDecade", "announceVisibleRange"]
			},
			{
				guard: "isMonthView",
				actions: ["focusNextYear", "announceVisibleRange"]
			},
			{ actions: ["focusNextPage"] }
		],
		"GOTO.PREV": [
			{
				guard: "isYearView",
				actions: ["focusPreviousDecade", "announceVisibleRange"]
			},
			{
				guard: "isMonthView",
				actions: ["focusPreviousYear", "announceVisibleRange"]
			},
			{ actions: ["focusPreviousPage"] }
		]
	},
	states: {
		idle: {
			tags: ["closed"],
			on: {
				"CONTROLLED.OPEN": {
					target: "open",
					actions: [
						"resetView",
						"focusFirstSelectedDate",
						"focusActiveCell"
					]
				},
				"TRIGGER.CLICK": [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"resetView",
						"focusFirstSelectedDate",
						"focusActiveCell",
						"invokeOnOpen"
					]
				}],
				OPEN: [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"resetView",
						"focusFirstSelectedDate",
						"focusActiveCell",
						"invokeOnOpen"
					]
				}]
			}
		},
		focused: {
			tags: ["closed"],
			on: {
				"CONTROLLED.OPEN": {
					target: "open",
					actions: [
						"resetView",
						"focusFirstSelectedDate",
						"focusActiveCell"
					]
				},
				"TRIGGER.CLICK": [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"resetView",
						"focusFirstSelectedDate",
						"focusActiveCell",
						"invokeOnOpen"
					]
				}],
				OPEN: [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"resetView",
						"focusFirstSelectedDate",
						"focusActiveCell",
						"invokeOnOpen"
					]
				}]
			}
		},
		open: {
			tags: ["open"],
			entry: ["resumeRangeSelection"],
			effects: ["trackDismissableElement", "trackPositioning"],
			exit: ["clearHoveredDate"],
			on: {
				"CONTROLLED.CLOSE": [
					{
						guard: tg("shouldRestoreFocus", "isInteractOutsideEvent"),
						target: "focused",
						actions: ["focusTriggerElement"]
					},
					{
						guard: "shouldRestoreFocus",
						target: "focused",
						actions: ["focusInputElement"]
					},
					{ target: "idle" }
				],
				"CELL.CLICK": [
					{
						guard: "isAboveMinView",
						actions: ["setFocusedValueForView", "setPreviousView"]
					},
					{
						guard: tg("isRangePicker", "hasSelectedRange"),
						actions: [
							"setActiveIndexToStart",
							"resetSelection",
							"setActiveIndexToEnd"
						]
					},
					{
						guard: tg("isRangePicker", "isSelectingEndDate", "closeOnSelect", "isOpenControlled"),
						actions: [
							"setFocusedDate",
							"setSelectedDate",
							"setActiveIndexToStart",
							"clearHoveredDate",
							"invokeOnClose",
							"setRestoreFocus"
						]
					},
					{
						guard: tg("isRangePicker", "isSelectingEndDate", "closeOnSelect"),
						target: "focused",
						actions: [
							"setFocusedDate",
							"setSelectedDate",
							"setActiveIndexToStart",
							"clearHoveredDate",
							"invokeOnClose",
							"focusInputElement"
						]
					},
					{
						guard: tg("isRangePicker", "isSelectingEndDate"),
						actions: [
							"setFocusedDate",
							"setSelectedDate",
							"setActiveIndexToStart",
							"clearHoveredDate"
						]
					},
					{
						guard: "isRangePicker",
						actions: [
							"setFocusedDate",
							"setSelectedDate",
							"setActiveIndexToEnd"
						]
					},
					{
						guard: tg("isMultiPicker", "canSelectDate"),
						actions: ["setFocusedDate", "toggleSelectedDate"]
					},
					{
						guard: "isMultiPicker",
						actions: ["setFocusedDate"]
					},
					{
						guard: tg("closeOnSelect", "isOpenControlled"),
						actions: [
							"setFocusedDate",
							"setSelectedDate",
							"invokeOnClose"
						]
					},
					{
						guard: "closeOnSelect",
						target: "focused",
						actions: [
							"setFocusedDate",
							"setSelectedDate",
							"invokeOnClose",
							"focusInputElement"
						]
					},
					{ actions: ["setFocusedDate", "setSelectedDate"] }
				],
				"CELL.POINTER_MOVE": [{
					guard: tg("isRangePicker", "isSelectingEndDate", "isDayPointerMoveOutsideVisibleMonth"),
					actions: ["setHoveredDate"]
				}, {
					guard: tg("isRangePicker", "isSelectingEndDate"),
					actions: ["setHoveredDate", "setFocusedDate"]
				}],
				"TABLE.POINTER_LEAVE": {
					guard: "isRangePicker",
					actions: ["clearHoveredDate"]
				},
				"TABLE.POINTER_DOWN": { actions: ["disableTextSelection"] },
				"TABLE.POINTER_UP": { actions: ["enableTextSelection"] },
				"TABLE.ESCAPE": [{
					guard: "isOpenControlled",
					actions: ["focusFirstSelectedDate", "invokeOnClose"]
				}, {
					target: "focused",
					actions: [
						"focusFirstSelectedDate",
						"invokeOnClose",
						"focusTriggerElement"
					]
				}],
				"TABLE.ENTER": [
					{
						guard: "isAboveMinView",
						actions: ["setPreviousView"]
					},
					{
						guard: tg("isRangePicker", "hasSelectedRange"),
						actions: [
							"setActiveIndexToStart",
							"resetSelection",
							"setActiveIndexToEnd",
							"focusNextDay"
						]
					},
					{
						guard: tg("isRangePicker", "isSelectingEndDate", "closeOnSelect", "isOpenControlled"),
						actions: [
							"setSelectedDate",
							"setActiveIndexToStart",
							"clearHoveredDate",
							"invokeOnClose"
						]
					},
					{
						guard: tg("isRangePicker", "isSelectingEndDate", "closeOnSelect"),
						target: "focused",
						actions: [
							"setSelectedDate",
							"setActiveIndexToStart",
							"clearHoveredDate",
							"invokeOnClose",
							"focusInputElement"
						]
					},
					{
						guard: tg("isRangePicker", "isSelectingEndDate"),
						actions: [
							"setSelectedDate",
							"setActiveIndexToStart",
							"clearHoveredDate"
						]
					},
					{
						guard: "isRangePicker",
						actions: [
							"setSelectedDate",
							"setActiveIndexToEnd",
							"focusNextDay"
						]
					},
					{
						guard: tg("isMultiPicker", "canSelectDate"),
						actions: ["toggleSelectedDate"]
					},
					{ guard: "isMultiPicker" },
					{
						guard: tg("closeOnSelect", "isOpenControlled"),
						actions: ["selectFocusedDate", "invokeOnClose"]
					},
					{
						guard: "closeOnSelect",
						target: "focused",
						actions: [
							"selectFocusedDate",
							"invokeOnClose",
							"focusInputElement"
						]
					},
					{ actions: ["selectFocusedDate"] }
				],
				"TABLE.ARROW_RIGHT": [
					{
						guard: "isMonthView",
						actions: ["focusNextMonth"]
					},
					{
						guard: "isYearView",
						actions: ["focusNextYear"]
					},
					{ actions: ["focusNextDay", "setHoveredDate"] }
				],
				"TABLE.ARROW_LEFT": [
					{
						guard: "isMonthView",
						actions: ["focusPreviousMonth"]
					},
					{
						guard: "isYearView",
						actions: ["focusPreviousYear"]
					},
					{ actions: ["focusPreviousDay"] }
				],
				"TABLE.ARROW_UP": [
					{
						guard: "isMonthView",
						actions: ["focusPreviousMonthColumn"]
					},
					{
						guard: "isYearView",
						actions: ["focusPreviousYearColumn"]
					},
					{ actions: ["focusPreviousWeek"] }
				],
				"TABLE.ARROW_DOWN": [
					{
						guard: "isMonthView",
						actions: ["focusNextMonthColumn"]
					},
					{
						guard: "isYearView",
						actions: ["focusNextYearColumn"]
					},
					{ actions: ["focusNextWeek"] }
				],
				"TABLE.PAGE_UP": { actions: ["focusPreviousSection"] },
				"TABLE.PAGE_DOWN": { actions: ["focusNextSection"] },
				"TABLE.HOME": [
					{
						guard: "isMonthView",
						actions: ["focusFirstMonth"]
					},
					{
						guard: "isYearView",
						actions: ["focusFirstYear"]
					},
					{ actions: ["focusSectionStart"] }
				],
				"TABLE.END": [
					{
						guard: "isMonthView",
						actions: ["focusLastMonth"]
					},
					{
						guard: "isYearView",
						actions: ["focusLastYear"]
					},
					{ actions: ["focusSectionEnd"] }
				],
				"TRIGGER.CLICK": [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "focused",
					actions: ["invokeOnClose"]
				}],
				"VIEW.TOGGLE": { actions: ["setNextView"] },
				INTERACT_OUTSIDE: [
					{
						guard: "isOpenControlled",
						actions: ["setActiveIndexToStart", "invokeOnClose"]
					},
					{
						guard: "shouldRestoreFocus",
						target: "focused",
						actions: [
							"setActiveIndexToStart",
							"invokeOnClose",
							"focusTriggerElement"
						]
					},
					{
						target: "idle",
						actions: ["setActiveIndexToStart", "invokeOnClose"]
					}
				],
				CLOSE: [{
					guard: "isOpenControlled",
					actions: ["setActiveIndexToStart", "invokeOnClose"]
				}, {
					target: "idle",
					actions: ["setActiveIndexToStart", "invokeOnClose"]
				}]
			}
		}
	},
	implementations: {
		guards: {
			isAboveMinView: ({ context: e, prop: t }) => qh(e.get("view"), t("minView")),
			isDayView: ({ context: e, event: t }) => (t.view || e.get("view")) === "day",
			isMonthView: ({ context: e, event: t }) => (t.view || e.get("view")) === "month",
			isYearView: ({ context: e, event: t }) => (t.view || e.get("view")) === "year",
			isRangePicker: ({ prop: e }) => e("selectionMode") === "range",
			hasSelectedRange: ({ context: e }) => e.get("value").length === 2,
			isMultiPicker: ({ prop: e }) => e("selectionMode") === "multiple",
			canSelectDate: (e) => {
				let { context: t, prop: n, event: r } = e, i = n("maxSelectedDates");
				if (i == null) return !0;
				let a = t.get("value"), o = ag(e, r.value ?? t.get("focusedValue"));
				return a.some((e) => vm(e, o)) ? !0 : a.length < i;
			},
			shouldRestoreFocus: ({ context: e }) => !!e.get("restoreFocus"),
			isSelectingEndDate: ({ context: e }) => e.get("activeIndex") === 1,
			closeOnSelect: ({ prop: e }) => !!e("closeOnSelect"),
			isOpenControlled: ({ prop: e }) => e("open") != null || !!e("inline"),
			isInteractOutsideEvent: ({ event: e }) => e.previousEvent?.type === "INTERACT_OUTSIDE",
			isInputValueEmpty: ({ event: e }) => e.value.trim() === "",
			shouldFixOnBlur: ({ event: e }) => !!e.fixOnBlur,
			isDayPointerMoveOutsideVisibleMonth: ({ event: e }) => e.cell === "day" && e.outsideRange === !0
		},
		effects: {
			trackPositioning({ context: e, prop: t, scope: n }) {
				return t("inline") ? void 0 : (e.get("currentPlacement") || e.set("currentPlacement", t("positioning").placement), cs(Fh(n), () => Ph(n), {
					...t("positioning"),
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				}));
			},
			setupLiveRegion({ scope: e, refs: t }) {
				let n = e.getDoc();
				return t.set("announcer", fc({
					level: "assertive",
					document: n
				})), () => t.get("announcer")?.destroy?.();
			},
			trackDismissableElement({ scope: e, send: t, context: n, prop: r }) {
				return r("inline") ? void 0 : sc(() => kh(e), {
					type: "popover",
					defer: !0,
					layerStyleTargets: [() => Ph(e)],
					exclude: [
						...Ah(e),
						Oh(e),
						Nh(e)
					],
					onInteractOutside(e) {
						n.set("restoreFocus", !e.detail.focusable);
					},
					onDismiss() {
						t({ type: "INTERACT_OUTSIDE" });
					},
					onEscapeKeyDown(e) {
						e.preventDefault(), t({
							type: "TABLE.ESCAPE",
							src: "dismissable"
						});
					}
				});
			}
		},
		actions: {
			setNextView({ context: e, prop: t }) {
				let n = Yh(e.get("view"), t("minView"), t("maxView"));
				e.set("view", n);
			},
			setPreviousView({ context: e, prop: t }) {
				let n = Xh(e.get("view"), t("minView"), t("maxView"));
				e.set("view", n);
			},
			setView({ context: e, event: t }) {
				e.set("view", t.view);
			},
			setRestoreFocus({ context: e }) {
				e.set("restoreFocus", !0);
			},
			announceValueText({ context: e, prop: t, refs: n }) {
				let r = e.get("value"), i = t("locale"), a = t("timeZone"), o;
				if (t("selectionMode") === "range") {
					let [e, t] = r;
					o = e && t ? km(e, t, i, a) : e ? km(e, null, i, a) : t ? km(t, null, i, a) : "";
				} else o = r.map((e) => km(e, null, i, a)).filter(Boolean).join(",");
				n.get("announcer")?.announce(o, 3e3);
			},
			announceVisibleRange({ computed: e, refs: t }) {
				let { formatted: n } = e("visibleRangeText");
				t.get("announcer")?.announce(n);
			},
			disableTextSelection({ scope: e }) {
				kn({
					target: kh(e),
					doc: e.getDoc()
				});
			},
			enableTextSelection({ scope: e }) {
				_t({
					doc: e.getDoc(),
					target: kh(e)
				});
			},
			focusFirstSelectedDate(e) {
				let { context: t } = e;
				t.get("value").length && sg(e, t.get("value")[0]);
			},
			syncInputElement({ scope: e, computed: t }) {
				en(() => {
					Ah(e).forEach((e, n) => {
						Ui(e, t("valueAsString")[n] || "");
					});
				});
			},
			setFocusedDate(e) {
				let { event: t } = e;
				sg(e, Array.isArray(t.value) ? t.value[0] : t.value);
			},
			setFocusedValueForView(e) {
				let { context: t, event: n } = e;
				sg(e, t.get("focusedValue").set({ [t.get("view")]: n.value }));
			},
			focusNextMonth(e) {
				let { context: t } = e;
				sg(e, t.get("focusedValue").add({ months: 1 }));
			},
			focusPreviousMonth(e) {
				let { context: t } = e;
				sg(e, t.get("focusedValue").subtract({ months: 1 }));
			},
			setDateValue({ context: e, event: t, prop: n }) {
				if (!Array.isArray(t.value)) return;
				let r = t.value.map((e) => gm(e, n("min"), n("max")));
				e.set("value", r);
			},
			clearDateValue({ context: e }) {
				e.set("value", []);
			},
			setSelectedDate(e) {
				let { context: t, event: n } = e, r = Array.from(t.get("value")), i = t.get("activeIndex"), a = r[i];
				r[i] = og(a, ag(e, n.value ?? t.get("focusedValue"))), t.set("value", Ih(r));
			},
			resetSelection(e) {
				let { context: t, event: n } = e, r = t.get("value")[0], i = ag(e, n.value ?? t.get("focusedValue"));
				t.set("value", [og(r, i)]);
			},
			toggleSelectedDate(e) {
				let { context: t, event: n } = e, r = ag(e, n.value ?? t.get("focusedValue")), i = t.get("value"), a = i.findIndex((e) => vm(e, r));
				if (a === -1) {
					let e = [...i, r];
					t.set("value", Rh(e));
				} else {
					let e = Array.from(i);
					e.splice(a, 1), t.set("value", Rh(e));
				}
			},
			setHoveredDate({ context: e, event: t }) {
				e.set("hoveredValue", t.value);
			},
			clearHoveredDate({ context: e }) {
				e.set("hoveredValue", null);
			},
			selectFocusedDate({ context: e, computed: t }) {
				let n = Array.from(e.get("value")), r = e.get("activeIndex"), i = n[r];
				n[r] = og(i, e.get("focusedValue").copy()), e.set("value", Ih(n));
				let a = t("valueAsString");
				e.set("inputValue", a[r]);
			},
			focusPreviousDay(e) {
				let { context: t } = e;
				sg(e, t.get("focusedValue").subtract({ days: 1 }));
			},
			focusNextDay(e) {
				let { context: t } = e;
				sg(e, t.get("focusedValue").add({ days: 1 }));
			},
			focusPreviousWeek(e) {
				let { context: t } = e;
				sg(e, t.get("focusedValue").subtract({ weeks: 1 }));
			},
			focusNextWeek(e) {
				let { context: t } = e;
				sg(e, t.get("focusedValue").add({ weeks: 1 }));
			},
			focusNextPage(e) {
				let { context: t, computed: n, prop: r } = e;
				cg(e, Jm(t.get("focusedValue"), t.get("startValue"), n("visibleDuration"), r("locale"), r("min"), r("max")));
			},
			focusPreviousPage(e) {
				let { context: t, computed: n, prop: r } = e;
				cg(e, Ym(t.get("focusedValue"), t.get("startValue"), n("visibleDuration"), r("locale"), r("min"), r("max")));
			},
			focusSectionStart(e) {
				let { context: t } = e;
				sg(e, t.get("startValue").copy());
			},
			focusSectionEnd(e) {
				let { computed: t } = e;
				sg(e, t("endValue").copy());
			},
			focusNextSection(e) {
				let { context: t, event: n, computed: r, prop: i } = e, a = Xm(t.get("focusedValue"), t.get("startValue"), n.larger, r("visibleDuration"), i("locale"), i("min"), i("max"));
				a && cg(e, a);
			},
			focusPreviousSection(e) {
				let { context: t, event: n, computed: r, prop: i } = e, a = Zm(t.get("focusedValue"), t.get("startValue"), n.larger, r("visibleDuration"), i("locale"), i("min"), i("max"));
				a && cg(e, a);
			},
			focusNextYear(e) {
				let { context: t } = e;
				sg(e, t.get("focusedValue").add({ years: 1 }));
			},
			focusPreviousYear(e) {
				let { context: t } = e;
				sg(e, t.get("focusedValue").subtract({ years: 1 }));
			},
			focusNextDecade(e) {
				let { context: t } = e;
				sg(e, t.get("focusedValue").add({ years: 10 }));
			},
			focusPreviousDecade(e) {
				let { context: t } = e;
				sg(e, t.get("focusedValue").subtract({ years: 10 }));
			},
			clearFocusedDate(e) {
				let { context: t, prop: n } = e, r = t.get("focusedValue").calendar;
				sg(e, Km(n("timeZone"), r));
			},
			focusPreviousMonthColumn(e) {
				let { context: t, event: n } = e;
				sg(e, t.get("focusedValue").subtract({ months: n.columns }));
			},
			focusNextMonthColumn(e) {
				let { context: t, event: n } = e;
				sg(e, t.get("focusedValue").add({ months: n.columns }));
			},
			focusPreviousYearColumn(e) {
				let { context: t, event: n } = e;
				sg(e, t.get("focusedValue").subtract({ years: n.columns }));
			},
			focusNextYearColumn(e) {
				let { context: t, event: n } = e;
				sg(e, t.get("focusedValue").add({ years: n.columns }));
			},
			focusFirstMonth(e) {
				let { context: t } = e, n = t.get("focusedValue"), r = n.calendar.getMinimumMonthInYear?.(n) ?? 1;
				sg(e, n.set({ month: r }));
			},
			focusLastMonth(e) {
				let { context: t } = e, n = t.get("focusedValue"), r = n.calendar.getMonthsInYear(n);
				sg(e, n.set({ month: r }));
			},
			focusFirstYear(e) {
				let { context: t } = e, n = Gm(t.get("focusedValue").year);
				sg(e, t.get("focusedValue").set({ year: n[0] }));
			},
			focusLastYear(e) {
				let { context: t } = e, n = Gm(t.get("focusedValue").year);
				sg(e, t.get("focusedValue").set({ year: n[n.length - 1] }));
			},
			setActiveIndex({ context: e, event: t }) {
				e.set("activeIndex", t.index);
			},
			setActiveIndexToEnd({ context: e }) {
				e.set("activeIndex", 1);
			},
			setActiveIndexToStart({ context: e }) {
				e.set("activeIndex", 0);
			},
			resumeRangeSelection({ context: e, prop: t }) {
				t("selectionMode") === "range" && e.get("value").length === 1 && e.set("activeIndex", 1);
			},
			focusActiveCell({ scope: e, context: t, event: n }) {
				n.src !== "input.click" && en(() => {
					Dh(e, t.get("view"))?.focus({ preventScroll: !0 });
				});
			},
			focusActiveCellIfNeeded({ scope: e, context: t, event: n }) {
				n.focus && en(() => {
					Dh(e, t.get("view"))?.focus({ preventScroll: !0 });
				});
			},
			setHoveredValueIfKeyboard({ context: e, event: t, prop: n }) {
				(t.type.startsWith("TABLE.ARROW") || [
					"TABLE.ENTER",
					"TABLE.HOME",
					"TABLE.END",
					"TABLE.PAGE_UP",
					"TABLE.PAGE_DOWN"
				].includes(t.type)) && n("selectionMode") === "range" && e.get("activeIndex") !== 0 && e.set("hoveredValue", e.get("focusedValue").copy());
			},
			focusTriggerElement({ scope: e }) {
				en(() => {
					Oh(e)?.focus({ preventScroll: !0 });
				});
			},
			focusFirstInputElement({ scope: e, event: t }) {
				t.focus !== !1 && en(() => {
					let [t] = Ah(e);
					(t ?? Oh(e))?.focus({ preventScroll: !0 });
				});
			},
			focusInputElement({ scope: e }) {
				en(() => {
					let t = Ah(e);
					if (t.length === 0) {
						Oh(e)?.focus({ preventScroll: !0 });
						return;
					}
					let n = t.findLastIndex((e) => e.value !== ""), r = t[Math.max(n, 0)];
					r?.focus({ preventScroll: !0 }), r?.setSelectionRange(r.value.length, r.value.length);
				});
			},
			syncMonthSelectElement({ scope: e, context: t }) {
				Ui(Mh(e), t.get("startValue").month.toString());
			},
			syncYearSelectElement({ scope: e, context: t }) {
				Ui(jh(e), t.get("startValue").year.toString());
			},
			setInputValue({ context: e, event: t }) {
				e.get("activeIndex") === t.index && e.set("inputValue", t.value);
			},
			syncInputValue({ scope: e, context: t, event: n }) {
				queueMicrotask(() => {
					Ui(Ah(e)[n.index ?? t.get("activeIndex")], t.get("inputValue"));
				});
			},
			focusParsedDate(e) {
				let { event: t, prop: n } = e;
				if (t.index == null) return;
				let r = n("parse")(t.value, {
					locale: n("locale"),
					timeZone: n("timeZone")
				});
				r && Hh(r) && sg(e, r);
			},
			selectParsedDate({ context: e, event: t, prop: n }) {
				if (t.index == null) return;
				let r = n("parse")(t.value, {
					locale: n("locale"),
					timeZone: n("timeZone")
				});
				if ((!r || !Hh(r)) && t.value && (r = e.get("focusedValue").copy()), !r) return;
				r = gm(r, n("min"), n("max"));
				let i = Array.from(e.get("value"));
				i[t.index] = og(i[t.index], r);
				let a = Ih(i);
				e.set("value", a);
				let o = rg(a, n);
				e.set("inputValue", o[t.index]);
			},
			resetView({ context: e }) {
				e.set("view", e.initial("view"));
			},
			setStartValue({ context: e, computed: t, prop: n }) {
				let r = e.get("focusedValue");
				if (!bm(r, e.get("startValue"), t("endValue"))) return;
				let i = _m(r, "start", { months: n("numOfMonths") }, n("locale"));
				e.set("startValue", i);
			},
			invokeOnOpen({ prop: e, context: t }) {
				e("inline") || e("onOpenChange")?.({
					open: !0,
					value: t.get("value")
				});
			},
			invokeOnClose({ prop: e, context: t }) {
				e("inline") || e("onOpenChange")?.({
					open: !1,
					value: t.get("value")
				});
			},
			invokeOnVisibleRangeChange({ prop: e, context: t, computed: n }) {
				e("onVisibleRangeChange")?.({
					view: t.get("view"),
					visibleRange: n("visibleRange")
				});
			},
			toggleVisibility({ event: e, send: t, prop: n }) {
				t({
					type: n("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
					previousEvent: e
				});
			}
		}
	}
}), ag = (e, t) => {
	let { context: n, prop: r } = e, i = n.get("view"), a = typeof t == "number" ? n.get("focusedValue").set({ [i]: t }) : t;
	return Qh((e) => {
		Jh(e, r("minView")) && (a = a.set({ [e]: +(e === "day") }));
	}), a;
}, og = (e, t) => {
	if (!e || !("hour" in e)) return t;
	let n = "timeZone" in e, r = t;
	return "hour" in t || (r = n ? Wl(Hl(t), e.timeZone) : Hl(t)), r.set({
		hour: e.hour,
		minute: e.minute,
		second: e.second,
		millisecond: e.millisecond
	});
};
function sg(e, t) {
	let { context: n, prop: r, computed: i } = e;
	if (!t) return;
	let a = ag(e, t);
	if (vm(n.get("focusedValue"), a)) return;
	let o = qm(i("visibleDuration"), r("locale"), r("min"), r("max"))({
		focusedDate: a,
		startDate: n.get("startValue")
	});
	n.set("startValue", o.startDate), n.set("focusedValue", o.focusedDate);
}
function cg(e, t) {
	let { context: n } = e;
	n.set("startValue", t.startDate), !vm(n.get("focusedValue"), t.focusedDate) && n.set("focusedValue", t.focusedDate);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-picker@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-picker/dist/date-picker.parse.mjs
function lg(e) {
	return Array.isArray(e) ? e.map((e) => lg(e)) : e instanceof Date ? new Tu(e.getFullYear(), e.getMonth() + 1, e.getDate()) : _u(e);
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-context.js
var [ug, dg] = Rt({
	name: "DatePickerContext",
	hookName: "useDatePickerContext",
	providerName: "<DatePickerProvider />"
}), fg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function pg(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, fg), i = dg(), a = _(() => X(i().getClearTriggerProps(), r));
	return Q(e, Y({ as: "button" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(pg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-content.svelte
var mg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function hg(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, mg), i = dg(), a = io(), o = _(() => X(i().getContentProps(), a().getPresenceProps(), r));
	function s(e) {
		a().setNode(e);
	}
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	}, l = F(), u = K(l), d = (e) => {
		Q(e, Y({ as: "div" }, () => z(o), {
			[ce()]: s,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = _(() => !a().unmounted);
	return P(u, (e) => {
		z(f) && e(d);
	}), I(e, l), y(c);
}
U(hg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-context.svelte
function gg(e, t) {
	O(t, !0);
	let n = R(t, "render", 7), r = dg();
	var i = {
		get render() {
			return n();
		},
		set render(e) {
			n(e), M();
		}
	}, a = F(), o = K(a);
	return ye(o, n, () => r), I(e, a), y(i);
}
U(gg, { render: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-control.svelte
var _g = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function vg(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, _g), i = dg(), a = _(() => X(i().getControlProps(), r));
	return Q(e, Y({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(vg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-view-props-context.js
var [yg, bg] = Rt({
	name: "DatePickerViewPropsContext",
	hookName: "useDatePickerViewPropsContext",
	providerName: "<DatePickerViewPropsProvider />"
}), xg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Sg(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, xg), i = dg(), a = bg(), o = _(() => X(i().getNextTriggerProps(a()), r));
	return Q(e, Y({ as: "button" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(Sg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-positioner.svelte
var Cg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function wg(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, Cg), i = dg(), a = io(), o = _(() => X(i().getPositionerProps(), r));
	var s = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	}, c = F(), l = K(c), u = (e) => {
		Q(e, Y({ as: "div" }, () => z(o), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, d = _(() => !a().unmounted);
	return P(l, (e) => {
		z(d) && e(u);
	}), I(e, c), y(s);
}
U(wg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-prev-trigger.svelte
var Tg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Eg(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, Tg), i = dg(), a = bg(), o = _(() => X(i().getPrevTriggerProps(a()), r));
	return Q(e, Y({ as: "button" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(Eg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-range-text.svelte
var Dg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Og(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, Dg), i = dg(), a = _(() => X(i().getRangeTextProps(), r)), o = _(() => {
		let { start: e, end: t } = i().visibleRangeText;
		return zt([e, t]).filter(Boolean).join(" - ");
	});
	return Q(e, Y({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		},
		children: (e, t) => {
			ne();
			var n = fe();
			G(() => w(n, z(o))), I(e, n);
		},
		$$slots: { default: !0 }
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(Og, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker.svelte.js
var kg = (e) => {
	let t = Nt(), n = gn(), r = _(() => {
		let r = St(e);
		return {
			dir: n().dir,
			locale: n().locale,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = Tn(ig, () => z(r)), a = _(() => eg(i, Wt));
	return () => z(a);
}, Ag = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"value"
]);
function jg(e, t) {
	O(t, !0);
	let n = R(t, "value", 7), r = q(t, Ag), i = _(() => no(r)), a = _(() => C(z(i), 2)), o = _(() => z(a)[0]), s = _(() => z(a)[1]), c = to(() => ({
		present: n()().open,
		...z(o)
	})), l = _(() => X(n()().getRootProps(), z(s)));
	return ug(() => n()()), ro(c), Q(e, Y({ as: "div" }, () => z(l))), y({
		get value() {
			return n();
		},
		set value(e) {
			n(e), M();
		}
	});
}
U(jg, { value: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-table-props-context.js
var [Mg, Ng] = Rt({
	name: "DatePickerTablePropsContext",
	hookName: "useDatePickerTablePropsContext",
	providerName: "<DatePickerTablePropsProvider />"
}), Pg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"columns"
]);
function Fg(e, t) {
	let n = m();
	O(t, !0);
	let r = R(t, "columns", 7), i = q(t, Pg), a = dg(), o = bg(), s = _(() => ({
		id: n,
		columns: r(),
		...o()
	})), c = _(() => X(a().getTableProps(z(s)), i));
	return Mg(() => z(s)), Q(e, Y({ as: "table" }, () => z(c))), y({
		get columns() {
			return r();
		},
		set columns(e) {
			r(e), M();
		}
	});
}
U(Fg, { columns: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-body.svelte
var Ig = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Lg(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, Ig), i = dg(), a = _(() => X(i().getTableBodyProps(), r));
	return Q(e, Y({ as: "tbody" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(Lg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-head.svelte
var Rg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function zg(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, Rg), i = dg(), a = Ng(), o = _(() => X(i().getTableHeadProps(a()), r));
	return Q(e, Y({ as: "thead" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(zg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-row.svelte
var Bg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Vg(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, Bg), i = dg(), a = Ng(), o = _(() => X(i().getTableRowProps(a()), r));
	return Q(e, Y({ as: "tr" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(Vg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-trigger.svelte
var Hg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Ug(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, Hg), i = dg(), a = _(() => X(i().getTriggerProps(), r));
	return Q(e, Y({ as: "button" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(Ug, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-table-cell-props-context.js
var [Wg, Gg] = Rt({
	name: "DatePickerTableCellPropsContext",
	hookName: "useDatePickerTableCellPropsContext",
	providerName: "<DatePickerTableCellPropsProvider />"
}), Kg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function qg(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, Kg), i = _(() => yn()(r, [
		"disabled",
		"value",
		"visibleRange",
		"columns"
	])), a = _(() => C(z(i), 2)), o = _(() => z(a)[0]), s = _(() => z(a)[1]), c = dg(), l = bg(), u = _(() => () => ({
		day: c().getDayTableCellProps,
		month: c().getMonthTableCellProps,
		year: c().getYearTableCellProps
	})[l().view](z(o))), d = _(() => X(z(u), z(s)));
	return Wg(() => z(o)), Q(e, Y({ as: "td" }, () => z(d), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(qg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-cell-trigger.svelte
var Jg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Yg(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, Jg), i = dg(), a = Gg(), o = bg(), s = _(() => {
		let e = {
			day: i().getDayTableCellTriggerProps,
			month: i().getMonthTableCellTriggerProps,
			year: i().getYearTableCellTriggerProps
		}[o().view];
		return e(a());
	}), c = _(() => X(z(s), r));
	return Q(e, Y({ as: "button" }, () => z(c), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(Yg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-header.svelte
var Xg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Zg(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, Xg), i = dg(), a = Ng(), o = _(() => X(i().getTableHeaderProps(a()), r));
	return Q(e, Y({ as: "th" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(Zg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-view.svelte
var Qg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function $g(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, Qg), i = _(() => yn()(r, ["view"])), a = _(() => C(z(i), 2)), o = _(() => z(a)[0]), s = _(() => z(a)[1]), c = dg(), l = _(() => X(c().getViewProps(z(o)), z(s)));
	return yg(() => z(o)), Q(e, Y({ as: "div" }, () => z(l), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U($g, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-view-control.svelte
var e_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function t_(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, e_), i = dg(), a = bg(), o = _(() => X(i().getViewControlProps(a()), r));
	return Q(e, Y({ as: "div" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(t_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-view-trigger.svelte
var n_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function r_(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, n_), i = dg(), a = bg(), o = _(() => X(i().getViewTriggerProps(a()), r));
	return Q(e, Y({ as: "button" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(r_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/DateField.svelte
var i_ = (e, t = b) => {
	var n = a_(), r = ge(n);
	G(() => N(r, "d", t())), I(e, n);
}, a_ = ae("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-1voin8a\"><path></path></svg>"), o_ = L("<input data-scope=\"date-picker\" autocomplete=\"off\" spellcheck=\"false\" class=\"svelte-1voin8a\"/>"), s_ = L("<span id=\"af-described\" hidden=\"\"> </span>"), c_ = L("<!> <span part=\"separator\" class=\"separator svelte-1voin8a\" aria-hidden=\"true\">–</span> <!>", 1), l_ = L("<input part=\"input\" data-scope=\"date-picker\" autocomplete=\"off\" spellcheck=\"false\" class=\"svelte-1voin8a\"/>"), u_ = ae("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-1voin8a\"><path d=\"M8 2v4\"></path><path d=\"M16 2v4\"></path><rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\"></rect><path d=\"M3 10h18\"></path></svg>"), d_ = L("<!> <!>", 1), f_ = L("<!> <!> <!>", 1), p_ = L("<!> <!> <!> <footer class=\"svelte-1voin8a\"><button type=\"button\" part=\"today\" class=\"af-button ghost sm\"> </button> <!></footer>", 1), m_ = L("<div class=\"af-kit\"><!> <!></div>"), h_ = {
	hash: "svelte-1voin8a",
	code: ":host {display:inline-block;max-width:100%;vertical-align:middle;}input.svelte-1voin8a {flex:1;min-width:0;width:8.5em;padding:0;border:0;outline:none;background:transparent;color:inherit;font:inherit;}input.svelte-1voin8a::placeholder {color:var(--k-muted);opacity:1;}.separator.svelte-1voin8a {flex:none;color:var(--k-muted);}footer.svelte-1voin8a {display:flex;justify-content:space-between;gap:8px;margin-top:8px;}[data-scope='date-picker'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='date-picker'][hidden] {display:none !important;}[data-scope='date-picker'][data-part='control'] {position:relative;display:flex;align-items:center;box-sizing:border-box;width:100%;height:36px;padding:4px 36px 4px 12px;border:1px solid var(--k-input);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark, 0) * 100%), transparent);box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);font-size:16px;line-height:24px;transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);}\n  @media (min-width: 48rem) {[data-scope='date-picker'][data-part='control'] {font-size:14px;line-height:20px;} }[data-scope='date-picker'][data-part='control']:has(input:focus-visible) {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring), 0 1px 2px 0 rgb(0 0 0 / 0.05);}[data-scope='date-picker'][data-part='control'][data-disabled] {opacity:0.5;cursor:not-allowed;}[data-scope='date-picker'][data-part='control'].range {gap:8px;height:auto;padding:0;border:0;border-radius:0;background:none;box-shadow:none;transition:none;}[data-scope='date-picker'][data-part='control'].range:has(input:focus-visible) {box-shadow:none;}[data-scope='date-picker'][data-part='control'].range input.svelte-1voin8a {box-sizing:border-box;flex:1 1 auto;width:calc(8.5em + 26px);height:36px;min-height:0;padding:4px 12px;border:1px solid var(--k-input);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark, 0) * 100%), transparent);box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);}[data-scope='date-picker'][data-part='control'].range input.svelte-1voin8a:last-of-type {width:calc(8.5em + 50px);padding-right:36px;}[data-scope='date-picker'][data-part='control'].range input.svelte-1voin8a:focus-visible {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring), 0 1px 2px 0 rgb(0 0 0 / 0.05);}[data-scope='date-picker'][data-part='trigger'] {position:absolute;top:50%;right:4px;display:flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0 solid var(--k-line);border-radius:4px;background:transparent;color:var(--k-muted);outline:none;cursor:pointer;transform:translateY(-50%);}[data-scope='date-picker'][data-part='trigger'] svg.svelte-1voin8a {width:14px;height:14px;pointer-events:none;}[data-scope='date-picker'][data-part='trigger']:not(:disabled):hover {background-color:var(--k-muted-bg);color:color-mix(in oklab, var(--k-fg) 55%, var(--k-muted));}[data-scope='date-picker'][data-part='trigger']:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[data-scope='date-picker'][data-part='trigger']:disabled {opacity:0.5;pointer-events:none;}[data-scope='date-picker'][data-part='content'] {padding:12px;outline:none;}.af-button.icon[data-scope='date-picker'][data-part='prev-trigger'], .af-button.icon[data-scope='date-picker'][data-part='next-trigger'] {padding-inline:12px;}[data-scope='date-picker'][data-part='view-control'] {display:flex;align-items:center;justify-content:space-between;gap:4px;margin-bottom:16px;}[data-scope='date-picker'][data-part='table'] {border-collapse:collapse;}[data-scope='date-picker'][data-part='table-header'] {padding:0;color:var(--k-muted);font-size:0.8rem;font-weight:400;}[data-scope='date-picker'][data-part='table-cell'] {padding:8px 0 0;text-align:center;}[data-scope='date-picker'][data-part='table-cell-trigger'] {display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:32px;height:32px;padding:0;border:0 solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background:transparent;color:inherit;outline:none;font:inherit;font-size:14px;font-weight:400;line-height:1;cursor:pointer;-webkit-user-select:none;user-select:none;transition:background-color 100ms cubic-bezier(0.2, 0, 0, 1), color 100ms cubic-bezier(0.2, 0, 0, 1), box-shadow 100ms cubic-bezier(0.2, 0, 0, 1);}[data-scope='date-picker'][data-part='table-cell-trigger'][data-view='month'], [data-scope='date-picker'][data-part='table-cell-trigger'][data-view='year'] {width:auto;min-width:56px;padding:0 8px;}[data-scope='date-picker'][data-part='table-cell-trigger'][data-today] {background-color:var(--k-accent);color:var(--k-accent-fg);}[data-scope='date-picker'][data-part='table-cell-trigger'][data-outside-range] {color:var(--k-muted);}[data-scope='date-picker'][data-part='table-cell-trigger']:hover:not([data-disabled], [data-selected]) {background-color:color-mix(in oklab, var(--k-accent) calc(100% - var(--k-dark, 0) * 50%), transparent);color:var(--k-accent-fg);}[data-scope='date-picker'][data-part='table-cell-trigger'][data-in-range]:not([data-selected]) {border-radius:0;background-color:var(--k-accent);color:var(--k-accent-fg);}[data-scope='date-picker'][data-part='table-cell-trigger'][data-selected] {background-color:var(--k-primary);color:var(--k-primary-fg);}[data-scope='date-picker'][data-part='table-cell-trigger']:focus-visible {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring);}[data-scope='date-picker'][data-part='table-cell-trigger'][data-disabled]:not([data-outside-range]) {opacity:0.5;color:var(--k-muted);cursor:not-allowed;}\n  @media (prefers-reduced-motion: reduce) {[data-scope='date-picker'][data-part='control'] input.svelte-1voin8a, [data-scope='date-picker'][data-part='control'], [data-scope='date-picker'][data-part='table-cell-trigger'] {transition:none;} }\n  @media (forced-colors: active) {[data-scope='date-picker'][data-part='control']:has(input:focus-visible), [data-scope='date-picker'][data-part='trigger']:focus-visible,\n    [data-scope='date-picker'][data-part='table-cell-trigger']:focus-visible,\n    [data-scope='date-picker'][data-part='content']:focus-visible,\n    [data-scope='date-picker'][data-part='control'].range input.svelte-1voin8a:focus-visible {outline:2px solid;outline-offset:2px;}[data-scope='date-picker'][data-part='table-cell-trigger'][data-in-range]:not([data-selected]) {border:1px dashed CanvasText;}[data-scope='date-picker'][data-part='table-cell-trigger'][data-selected] {forced-color-adjust:none;background-color:Highlight;color:HighlightText;}[data-scope='date-picker'][data-part='table-cell-trigger'][data-today]:not([data-selected]) {border:1px solid CanvasText;}\n  }"
};
function g_(r, i) {
	let o = m();
	O(i, !0), ee(r, h_);
	let l = (e, t = b) => {
		var n = o_();
		Ee(n), ue(n, (e) => {
			t() === "start" ? J(He, e, !0) : J(Ue, e, !0);
		}, () => t() === "start" ? z(He) : z(Ue)), G(() => {
			N(n, "part", `input ${t() ?? ""}`), N(n, "data-part", z(Ne) ? void 0 : "input"), ie(n, t() === "start" ? z(ke) : z(Ae)), N(n, "placeholder", x() || "dd/mm/yyyy"), N(n, "aria-label", S() ? `${S()}: ${t() === "start" ? z(V).rangeStart : z(V).rangeEnd}` : t() === "start" ? z(V).rangeStart : z(V).rangeEnd), N(n, "aria-describedby", z(Je) ? "af-described" : void 0), N(n, "aria-invalid", oe() ? "true" : void 0), N(n, "aria-required", re() ? "true" : void 0), n.readOnly = !!k(), n.disabled = z(qe);
		}), _e("keydown", n, (e) => {
			e.key === "Enter" && !e.isComposing && (e.preventDefault(), at(t()));
		}), _e("input", n, () => Ge[t()] = !0), xe("blur", n, () => at(t())), I(e, n);
	}, u = R(i, "value", 7, null), f = R(i, "locale", 7, null), p = R(i, "min", 7, null), g = R(i, "max", 7, null), v = R(i, "clearable", 7, !1), x = R(i, "placeholder", 7, null), S = R(i, "label", 7, null), C = R(i, "disabled", 7, !1), T = R(i, "strings", 7, null), te = R(i, "name", 7, null), re = R(i, "required", 7, !1), k = R(i, "readonly", 7, !1), A = R(i, "description", 7, null), ae = R(i, "error", 7, null), oe = R(i, "invalid", 7, !1), j = R(i, "range", 7, !1), ce = R(i, "start", 7, null), L = R(i, "end", 7, null), le = R(i, "format", 7, null), de = i.$$host, V = _(() => c(f(), T() ?? void 0)), U = _(() => e(f()) ? "vi-VN" : "en-GB"), pe = _(() => tr(u())), me = _(() => tr(p())), he = _(() => tr(g())), ve = _(() => !j() && or(le()) ? le() : null), ye = (e) => z(ve) ? sr(e, z(ve)) ?? "" : rr(e, f()), be = (e) => (z(ve) ? cr(e, z(ve)) : null) ?? tr(e.trim()), Se = _(() => z(pe) ? ye(z(pe)) : ""), Ce = B(!1);
	Te(() => {
		z(Se), z(ve), J(Ce, !1);
	}), Te(() => {
		de.toggleAttribute("data-unparsed", z(Ce));
	});
	let we = _(() => z(pe) !== null && (z(me) !== null && z(pe) < z(me) || z(he) !== null && z(pe) > z(he))), q = _(() => z(pe) && !z(we) ? [lg(z(pe))] : []), De = _(() => tr(ce())), Oe = _(() => tr(L())), ke = _(() => z(De) ? rr(z(De), f()) : ""), Ae = _(() => z(Oe) ? rr(z(Oe), f()) : ""), je = _(() => z(De) !== null && tt(z(De))), Me = _(() => z(Oe) !== null && tt(z(Oe))), Ne = _(() => z(je) || z(Me)), Pe = B(null), Fe = _(() => z(Pe) ?? (z(Ne) ? [] : z(De) && z(Oe) ? [lg(z(De)), lg(z(Oe))] : z(De) ? [lg(z(De))] : [])), Ie = _(() => j() ? z(Fe) : z(q)), Le = _(() => j() ? z(De) !== null || z(Oe) !== null : z(we)), Re = (e) => e === "month" ? z(V).viewMonth : e === "year" ? z(V).viewYear : z(V).viewDay, ze = B(!1), Be = B(null), Ve = B(null), He = B(null), Ue = B(null), We = !1, Ge = {
		start: !1,
		end: !1
	};
	Te(() => s(z(Be), z(ze), de));
	let Ke = B(!1), qe = _(() => !!C() || z(Ke)), Je = _(() => [A(), ae()].filter(Boolean).join(" ")), Ye = (e) => e !== null && z(me) !== null && e < z(me), Xe = (e) => e !== null && z(he) !== null && e > z(he), Ze = _(() => j() ? re() && z(De) === null && z(Oe) === null ? { valueMissing: !0 } : Ye(z(De)) || Ye(z(Oe)) ? { rangeUnderflow: !0 } : Xe(z(De)) || Xe(z(Oe)) ? { rangeOverflow: !0 } : {} : z(Ce) ? { badInput: !0 } : re() && z(pe) === null ? { valueMissing: !0 } : Ye(z(pe)) ? { rangeUnderflow: !0 } : Xe(z(pe)) ? { rangeOverflow: !0 } : {}), Qe = _(() => "badInput" in z(Ze) ? a(d(z(V), "badDate"), { format: z(ve) ?? "" }) : "valueMissing" in z(Ze) ? d(z(V), "valueMissing") : "rangeUnderflow" in z(Ze) ? a(d(z(V), "rangeUnderflow"), { min: rr(z(me), f()) }) : "rangeOverflow" in z(Ze) ? a(d(z(V), "rangeOverflow"), { max: rr(z(he), f()) }) : ""), $e = _(() => j() ? z(De) === null && z(Oe) === null ? null : `${z(De) ?? ""}/${z(Oe) ?? ""}` : z(pe)), et = _(() => j() ? !z(je) && z(Me) ? z(Ue) : z(He) : z(Ve));
	Te(() => Dr(de, {
		name: te(),
		value: z($e),
		validity: z(Ze),
		message: z(Qe),
		anchor: z(et)
	})), Or(de, {
		reset() {
			if (j()) {
				let e = {
					start: tr(de.getAttribute("start")),
					end: tr(de.getAttribute("end"))
				};
				(e.start !== z(De) || e.end !== z(Oe)) && n(de, "change", e);
				return;
			}
			let e = tr(de.getAttribute("value"));
			e !== z(pe) && n(de, "change", { value: e });
		},
		disabled(e) {
			J(Ke, e, !0);
		}
	});
	function tt(e) {
		return z(me) !== null && e < z(me) || z(he) !== null && e > z(he);
	}
	function nt(e) {
		let t = e !== null && tt(e);
		return (t ? z(Ce) : e !== z(pe) || z(Ce)) && n(de, "change", { value: t ? z(pe) : e }), !t && (z(Ce) && z(Ve) && (z(Ve).value = z(Se)), J(Ce, !1), !0);
	}
	function rt() {
		if (!z(Ve) || !We) return;
		We = !1;
		let e = z(Ve).value.trim();
		if (z(ve)) {
			let t = e === "" ? null : be(e);
			if (e !== "" && t === null) {
				J(Ce, !0), n(de, "unparsed", { text: z(Ve).value });
				return;
			}
			nt(t), J(Ce, !1), z(Ve).value = z(Se);
			return;
		}
		let t = e === "" ? v() ? null : void 0 : nr(e) ?? void 0;
		t !== void 0 && t !== z(pe) && nt(t), z(Ve).value = z(Se);
	}
	function it(e, t) {
		return e !== null && e !== z(De) && tt(e) || t !== null && t !== z(Oe) && tt(t) || e !== null && t !== null && t < e ? !1 : ((e !== z(De) || t !== z(Oe)) && n(de, "change", {
			start: e,
			end: t
		}), !0);
	}
	function at(e) {
		let t = z(e === "start" ? He : Ue);
		if (!t || !Ge[e]) return;
		Ge[e] = !1;
		let n = t.value.trim(), r = n === "" ? null : nr(n);
		(n === "" || r !== null) && (e === "start" ? it(r, z(Oe)) : it(z(De), r)), t.value = z(e === "start" ? ke : Ae);
	}
	function ot(e) {
		let [t, n] = e;
		if (t) {
			if (!n) {
				J(Pe, [t], !0);
				return;
			}
			J(Pe, null), it(t.toString(), n.toString());
		}
	}
	function st(e) {
		let t = lr();
		e().setFocusedValue(lg(t)), requestAnimationFrame(() => de.shadowRoot?.querySelector(`[data-part="table-cell-trigger"][data-view="day"][data-value="${t}"]`)?.focus());
	}
	function ct(e) {
		e().setOpen(!1), de.shadowRoot?.querySelector("[part=\"trigger\"]")?.focus();
	}
	let lt = kg(() => ({
		id: o,
		getRootNode: () => de.shadowRoot,
		value: z(Ie),
		locale: z(U),
		selectionMode: j() ? "range" : "single",
		min: z(me) ? lg(z(me)) : void 0,
		max: z(he) ? lg(z(he)) : void 0,
		disabled: z(qe),
		readOnly: !!k(),
		fixedWeeks: !0,
		positioning: {
			strategy: "fixed",
			placement: "bottom-start"
		},
		format: (e) => ye(e.toString()),
		translations: {
			trigger: (e) => e ? z(V).closeCalendar : z(V).openCalendar,
			content: z(V).calendar,
			clearTrigger: z(V).clear,
			dayCell: (e) => a(e.selected ? z(V).selectedDate : z(V).chooseDate, { date: e.valueText }),
			viewTrigger: (e, t) => a(t ? z(V).switchView : z(V).currentView, { view: Re(t ?? e) }),
			prevTrigger: (e) => e === "day" ? z(V).previousMonth : e === "month" ? z(V).previousYear : z(V).previousDecade,
			nextTrigger: (e) => e === "day" ? z(V).nextMonth : e === "month" ? z(V).nextYear : z(V).nextDecade
		},
		onValueChange: (e) => j() ? ot(e.value) : nt(e.value[0]?.toString() ?? null),
		onOpenChange: (e) => {
			if (J(ze, e.open, !0), !e.open) J(Pe, null);
			else if (z(ve) && z(Ve)) {
				let e = be(z(Ve).value);
				e && lt().setFocusedValue(lg(e));
			}
		}
	}));
	var ut = {
		get value() {
			return u();
		},
		set value(e = null) {
			u(e), M();
		},
		get locale() {
			return f();
		},
		set locale(e = null) {
			f(e), M();
		},
		get min() {
			return p();
		},
		set min(e = null) {
			p(e), M();
		},
		get max() {
			return g();
		},
		set max(e = null) {
			g(e), M();
		},
		get clearable() {
			return v();
		},
		set clearable(e = !1) {
			v(e), M();
		},
		get placeholder() {
			return x();
		},
		set placeholder(e = null) {
			x(e), M();
		},
		get label() {
			return S();
		},
		set label(e = null) {
			S(e), M();
		},
		get disabled() {
			return C();
		},
		set disabled(e = !1) {
			C(e), M();
		},
		get strings() {
			return T();
		},
		set strings(e = null) {
			T(e), M();
		},
		get name() {
			return te();
		},
		set name(e = null) {
			te(e), M();
		},
		get required() {
			return re();
		},
		set required(e = !1) {
			re(e), M();
		},
		get readonly() {
			return k();
		},
		set readonly(e = !1) {
			k(e), M();
		},
		get description() {
			return A();
		},
		set description(e = null) {
			A(e), M();
		},
		get error() {
			return ae();
		},
		set error(e = null) {
			ae(e), M();
		},
		get invalid() {
			return oe();
		},
		set invalid(e = !1) {
			oe(e), M();
		},
		get range() {
			return j();
		},
		set range(e = !1) {
			j(e), M();
		},
		get start() {
			return ce();
		},
		set start(e = null) {
			ce(e), M();
		},
		get end() {
			return L();
		},
		set end(e = null) {
			L(e), M();
		},
		get format() {
			return le();
		},
		set format(e = null) {
			le(e), M();
		}
	}, dt = d_(), ft = K(dt);
	t(ft, {});
	var pt = W(ft, 2);
	return Yt(pt, {
		value: () => de.shadowRoot,
		children: (e, t) => {
			var n = m_(), r = H(n), i = (e) => {
				var t = s_(), n = ge(t, !0);
				G(() => w(n, z(Je))), I(e, t);
			};
			P(r, (e) => {
				z(Je) && e(i);
			});
			var a = W(r, 2);
			E(a, () => jg, (e, t) => {
				t(e, {
					get value() {
						return lt;
					},
					children: (e, t) => {
						var n = d_(), r = K(n);
						{
							let e = _(() => j() ? "range" : void 0);
							E(r, () => vg, (t, n) => {
								n(t, {
									part: "control",
									get class() {
										return z(e);
									},
									children: (e, t) => {
										var n = d_(), r = K(n), i = (e) => {
											var t = c_(), n = K(t);
											l(n, () => "start");
											var r = W(n, 4);
											l(r, () => "end"), I(e, t);
										}, a = (e) => {
											var t = l_();
											Ee(t), ue(t, (e) => J(Ve, e), () => z(Ve)), G(() => {
												N(t, "data-part", z(we) ? void 0 : "input"), ie(t, z(Se)), N(t, "placeholder", x() || z(ve) || "dd/mm/yyyy"), N(t, "aria-label", S() || x() || void 0), N(t, "aria-describedby", z(Je) ? "af-described" : void 0), N(t, "aria-invalid", oe() || z(Ce) ? "true" : void 0), N(t, "aria-required", re() ? "true" : void 0), t.readOnly = !!k(), t.disabled = z(qe);
											}), _e("keydown", t, (e) => {
												e.key === "Enter" && !e.isComposing && (e.preventDefault(), rt());
											}), _e("input", t, () => We = !0), xe("blur", t, rt), I(e, t);
										};
										P(r, (e) => {
											j() ? e(i) : e(a, -1);
										});
										var o = W(r, 2);
										E(o, () => Ug, (e, t) => {
											t(e, {
												part: "trigger",
												children: (e, t) => {
													var n = u_();
													I(e, n);
												},
												$$slots: { default: !0 }
											});
										}), I(e, n);
									},
									$$slots: { default: !0 }
								});
							});
						}
						var i = W(r, 2);
						E(i, () => wg, (e, t) => {
							t(e, {
								popover: "manual",
								get ref() {
									return z(Be);
								},
								set ref(e) {
									J(Be, e, !0);
								},
								children: (e, t) => {
									var n = F(), r = K(n);
									E(r, () => hg, (e, t) => {
										t(e, {
											class: "af-overlay date",
											part: "content",
											children: (e, t) => {
												var n = F(), r = K(n);
												{
													let e = (e, t = b) => {
														var n = p_(), r = K(n);
														E(r, () => $g, (e, n) => {
															n(e, {
																view: "day",
																children: (e, n) => {
																	var r = d_(), i = K(r);
																	E(i, () => t_, (e, t) => {
																		t(e, {
																			children: (e, t) => {
																				var n = f_(), r = K(n);
																				E(r, () => Eg, (e, t) => {
																					t(e, {
																						class: "af-button ghost icon sm",
																						children: (e, t) => {
																							i_(e, () => "m15 18-6-6 6-6");
																						},
																						$$slots: { default: !0 }
																					});
																				});
																				var i = W(r, 2);
																				E(i, () => r_, (e, t) => {
																					t(e, {
																						class: "af-button ghost sm",
																						children: (e, t) => {
																							var n = F(), r = K(n);
																							E(r, () => Og, (e, t) => {
																								t(e, {});
																							}), I(e, n);
																						},
																						$$slots: { default: !0 }
																					});
																				});
																				var a = W(i, 2);
																				E(a, () => Sg, (e, t) => {
																					t(e, {
																						class: "af-button ghost icon sm",
																						children: (e, t) => {
																							i_(e, () => "m9 18 6-6-6-6");
																						},
																						$$slots: { default: !0 }
																					});
																				}), I(e, n);
																			},
																			$$slots: { default: !0 }
																		});
																	});
																	var a = W(i, 2);
																	E(a, () => Fg, (e, n) => {
																		n(e, {
																			children: (e, n) => {
																				var r = d_(), i = K(r);
																				E(i, () => zg, (e, n) => {
																					n(e, {
																						children: (e, n) => {
																							var r = F(), i = K(r);
																							E(i, () => Vg, (e, n) => {
																								n(e, {
																									children: (e, n) => {
																										var r = F(), i = K(r);
																										h(i, 17, () => t()().weekDays, se, (e, t) => {
																											var n = F(), r = K(n);
																											E(r, () => Zg, (e, n) => {
																												n(e, {
																													children: (e, n) => {
																														ne();
																														var r = fe();
																														G(() => w(r, z(t).narrow)), I(e, r);
																													},
																													$$slots: { default: !0 }
																												});
																											}), I(e, n);
																										}), I(e, r);
																									},
																									$$slots: { default: !0 }
																								});
																							}), I(e, r);
																						},
																						$$slots: { default: !0 }
																					});
																				});
																				var a = W(i, 2);
																				E(a, () => Lg, (e, n) => {
																					n(e, {
																						children: (e, n) => {
																							var r = F(), i = K(r);
																							h(i, 17, () => t()().weeks, se, (e, n, r) => {
																								var i = F(), a = K(i);
																								E(a, () => Vg, (e, n) => {
																									n(e, {
																										children: (e, n) => {
																											var i = F(), a = K(i);
																											h(a, 17, () => t()().getDaysInWeek(r), (e) => e.toString(), (e, t) => {
																												var n = F(), r = K(n);
																												E(r, () => qg, (e, n) => {
																													n(e, {
																														get value() {
																															return z(t);
																														},
																														children: (e, n) => {
																															var r = F(), i = K(r);
																															E(i, () => Yg, (e, n) => {
																																n(e, {
																																	children: (e, n) => {
																																		ne();
																																		var r = fe();
																																		G(() => w(r, z(t).day)), I(e, r);
																																	},
																																	$$slots: { default: !0 }
																																});
																															}), I(e, r);
																														},
																														$$slots: { default: !0 }
																													});
																												}), I(e, n);
																											}), I(e, i);
																										},
																										$$slots: { default: !0 }
																									});
																								}), I(e, i);
																							}), I(e, r);
																						},
																						$$slots: { default: !0 }
																					});
																				}), I(e, r);
																			},
																			$$slots: { default: !0 }
																		});
																	}), I(e, r);
																},
																$$slots: { default: !0 }
															});
														});
														var i = W(r, 2);
														E(i, () => $g, (e, n) => {
															n(e, {
																view: "month",
																children: (e, n) => {
																	var r = d_(), i = K(r);
																	E(i, () => t_, (e, t) => {
																		t(e, {
																			children: (e, t) => {
																				var n = f_(), r = K(n);
																				E(r, () => Eg, (e, t) => {
																					t(e, {
																						class: "af-button ghost icon sm",
																						children: (e, t) => {
																							i_(e, () => "m15 18-6-6 6-6");
																						},
																						$$slots: { default: !0 }
																					});
																				});
																				var i = W(r, 2);
																				E(i, () => r_, (e, t) => {
																					t(e, {
																						class: "af-button ghost sm",
																						children: (e, t) => {
																							var n = F(), r = K(n);
																							E(r, () => Og, (e, t) => {
																								t(e, {});
																							}), I(e, n);
																						},
																						$$slots: { default: !0 }
																					});
																				});
																				var a = W(i, 2);
																				E(a, () => Sg, (e, t) => {
																					t(e, {
																						class: "af-button ghost icon sm",
																						children: (e, t) => {
																							i_(e, () => "m9 18 6-6-6-6");
																						},
																						$$slots: { default: !0 }
																					});
																				}), I(e, n);
																			},
																			$$slots: { default: !0 }
																		});
																	});
																	var a = W(i, 2);
																	E(a, () => Fg, (e, n) => {
																		n(e, {
																			children: (e, n) => {
																				var r = F(), i = K(r);
																				E(i, () => Lg, (e, n) => {
																					n(e, {
																						children: (e, n) => {
																							var r = F(), i = K(r);
																							h(i, 17, () => t()().getMonthsGrid({
																								columns: 4,
																								format: "short"
																							}), se, (e, t) => {
																								var n = F(), r = K(n);
																								E(r, () => Vg, (e, n) => {
																									n(e, {
																										children: (e, n) => {
																											var r = F(), i = K(r);
																											h(i, 17, () => z(t), (e) => e.value, (e, t) => {
																												var n = F(), r = K(n);
																												E(r, () => qg, (e, n) => {
																													n(e, {
																														get value() {
																															return z(t).value;
																														},
																														children: (e, n) => {
																															var r = F(), i = K(r);
																															E(i, () => Yg, (e, n) => {
																																n(e, {
																																	children: (e, n) => {
																																		ne();
																																		var r = fe();
																																		G(() => w(r, z(t).label)), I(e, r);
																																	},
																																	$$slots: { default: !0 }
																																});
																															}), I(e, r);
																														},
																														$$slots: { default: !0 }
																													});
																												}), I(e, n);
																											}), I(e, r);
																										},
																										$$slots: { default: !0 }
																									});
																								}), I(e, n);
																							}), I(e, r);
																						},
																						$$slots: { default: !0 }
																					});
																				}), I(e, r);
																			},
																			$$slots: { default: !0 }
																		});
																	}), I(e, r);
																},
																$$slots: { default: !0 }
															});
														});
														var a = W(i, 2);
														E(a, () => $g, (e, n) => {
															n(e, {
																view: "year",
																children: (e, n) => {
																	var r = d_(), i = K(r);
																	E(i, () => t_, (e, t) => {
																		t(e, {
																			children: (e, t) => {
																				var n = f_(), r = K(n);
																				E(r, () => Eg, (e, t) => {
																					t(e, {
																						class: "af-button ghost icon sm",
																						children: (e, t) => {
																							i_(e, () => "m15 18-6-6 6-6");
																						},
																						$$slots: { default: !0 }
																					});
																				});
																				var i = W(r, 2);
																				E(i, () => r_, (e, t) => {
																					t(e, {
																						class: "af-button ghost sm",
																						children: (e, t) => {
																							var n = F(), r = K(n);
																							E(r, () => Og, (e, t) => {
																								t(e, {});
																							}), I(e, n);
																						},
																						$$slots: { default: !0 }
																					});
																				});
																				var a = W(i, 2);
																				E(a, () => Sg, (e, t) => {
																					t(e, {
																						class: "af-button ghost icon sm",
																						children: (e, t) => {
																							i_(e, () => "m9 18 6-6-6-6");
																						},
																						$$slots: { default: !0 }
																					});
																				}), I(e, n);
																			},
																			$$slots: { default: !0 }
																		});
																	});
																	var a = W(i, 2);
																	E(a, () => Fg, (e, n) => {
																		n(e, {
																			children: (e, n) => {
																				var r = F(), i = K(r);
																				E(i, () => Lg, (e, n) => {
																					n(e, {
																						children: (e, n) => {
																							var r = F(), i = K(r);
																							h(i, 17, () => t()().getYearsGrid({ columns: 4 }), se, (e, t) => {
																								var n = F(), r = K(n);
																								E(r, () => Vg, (e, n) => {
																									n(e, {
																										children: (e, n) => {
																											var r = F(), i = K(r);
																											h(i, 17, () => z(t), (e) => e.value, (e, t) => {
																												var n = F(), r = K(n);
																												E(r, () => qg, (e, n) => {
																													n(e, {
																														get value() {
																															return z(t).value;
																														},
																														children: (e, n) => {
																															var r = F(), i = K(r);
																															E(i, () => Yg, (e, n) => {
																																n(e, {
																																	children: (e, n) => {
																																		ne();
																																		var r = fe();
																																		G(() => w(r, z(t).label)), I(e, r);
																																	},
																																	$$slots: { default: !0 }
																																});
																															}), I(e, r);
																														},
																														$$slots: { default: !0 }
																													});
																												}), I(e, n);
																											}), I(e, r);
																										},
																										$$slots: { default: !0 }
																									});
																								}), I(e, n);
																							}), I(e, r);
																						},
																						$$slots: { default: !0 }
																					});
																				}), I(e, r);
																			},
																			$$slots: { default: !0 }
																		});
																	}), I(e, r);
																},
																$$slots: { default: !0 }
															});
														});
														var o = W(a, 2), s = H(o), c = ge(s, !0), l = W(s, 2), u = (e) => {
															var n = F(), r = K(n);
															E(r, () => pg, (e, n) => {
																n(e, Y({
																	part: "clear",
																	class: "af-button ghost sm"
																}, () => z(Le) ? { hidden: !1 } : {}, {
																	onclick: () => {
																		j() ? it(null, null) : z(we) && nt(null), ct(t());
																	},
																	children: (e, t) => {
																		ne();
																		var n = fe();
																		G(() => w(n, z(V).clear)), I(e, n);
																	},
																	$$slots: { default: !0 }
																}));
															}), I(e, n);
														};
														P(l, (e) => {
															v() && e(u);
														}), D(o), G((e) => {
															s.disabled = e, w(c, z(V).today);
														}, [() => tt(lr())]), _e("click", s, () => {
															j() ? st(t()) : nt(lr()) && ct(t());
														}), I(e, n);
													};
													E(r, () => gg, (t, n) => {
														n(t, {
															render: e,
															$$slots: { render: !0 }
														});
													});
												}
												I(e, n);
											},
											$$slots: { default: !0 }
										});
									}), I(e, n);
								},
								$$slots: { default: !0 }
							});
						}), I(e, n);
					},
					$$slots: { default: !0 }
				});
			}), D(n), I(e, n);
		},
		$$slots: { default: !0 }
	}), I(r, dt), y(ut);
}
we([
	"keydown",
	"input",
	"click"
]), U(g_, {
	value: {
		attribute: "value",
		type: "String"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	min: {
		attribute: "min",
		type: "String"
	},
	max: {
		attribute: "max",
		type: "String"
	},
	clearable: {
		attribute: "clearable",
		type: "Boolean"
	},
	placeholder: {
		attribute: "placeholder",
		type: "String"
	},
	label: {
		attribute: "label",
		type: "String"
	},
	disabled: {
		attribute: "disabled",
		reflect: !0,
		type: "Boolean"
	},
	strings: { type: "Object" },
	name: {
		attribute: "name",
		reflect: !0,
		type: "String"
	},
	required: {
		attribute: "required",
		type: "Boolean"
	},
	readonly: {
		attribute: "readonly",
		reflect: !0,
		type: "Boolean"
	},
	description: {
		attribute: "description",
		type: "String"
	},
	error: {
		attribute: "error",
		type: "String"
	},
	invalid: {
		attribute: "invalid",
		type: "Boolean"
	},
	range: {
		attribute: "range",
		type: "Boolean"
	},
	start: {
		attribute: "start",
		type: "String"
	},
	end: {
		attribute: "end",
		type: "String"
	},
	format: {
		attribute: "format",
		type: "String"
	}
}, [], [], {
	mode: "open",
	delegatesFocus: !0
}, Er);
//#endregion
//#region src/kit/Dialog.svelte
var __ = L("<header class=\"svelte-gp7kvq\"><!> <button type=\"button\" part=\"close\" class=\"svelte-gp7kvq\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-gp7kvq\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button></header> <div part=\"body\" class=\"svelte-gp7kvq\"><!></div> <footer part=\"actions\" class=\"svelte-gp7kvq\"><!></footer>", 1), v_ = L("<dialog><!></dialog>"), y_ = L("<!> <!>", 1), b_ = {
	hash: "svelte-gp7kvq",
	code: "dialog.svelte-gp7kvq {border:0;padding:0;background:transparent;max-width:calc(100vw - 32px);overflow:visible;}dialog.svelte-gp7kvq::backdrop {background:rgb(0 0 0 / 0.5);}header.svelte-gp7kvq {display:flex;flex:none;align-items:center;padding-right:24px;}[part='body'].svelte-gp7kvq {display:flex;flex:1 1 auto;flex-direction:column;min-height:0;margin:-4px -16px;}[part='body'].svelte-gp7kvq [data-scope='scroll-area'][data-part='viewport'] {padding:4px 16px;overscroll-behavior:contain;}footer.svelte-gp7kvq {display:flex;flex:none;flex-wrap:wrap;justify-content:flex-end;gap:8px;}footer[hidden].svelte-gp7kvq {display:none;}[part='close'].svelte-gp7kvq {position:absolute;top:16px;right:16px;display:flex;align-items:center;justify-content:center;width:16px;height:16px;padding:0;border:0 solid var(--k-line);border-radius:2px;background:transparent;color:inherit;opacity:0.7;outline:none;cursor:pointer;transition:opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);}[part='close'].svelte-gp7kvq svg:where(.svelte-gp7kvq) {flex:none;width:16px;height:16px;pointer-events:none;}[part='close'].svelte-gp7kvq:hover {opacity:1;}[part='close'].svelte-gp7kvq:focus-visible {box-shadow:0 0 0 2px var(--k-bg), 0 0 0 4px var(--k-focus-border);}[data-scope='dialog'][data-part='content'] {position:relative;display:flex;flex-direction:column;gap:16px;width:calc(100vw - 32px);max-height:calc(100dvh - 64px);padding:24px;border-radius:var(--k-radius);background-color:var(--k-bg);color:var(--k-fg);outline:none;box-shadow:0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);}[data-scope='dialog'][data-part='title'] {margin:0;font-size:18px;font-weight:600;line-height:1;}\n  @media (min-width: 40rem) {[data-scope='dialog'][data-part='content'] {max-width:512px;} }\n  @media not (min-width: 40rem) {footer.svelte-gp7kvq {flex-direction:column-reverse;} }dialog[data-placement='end'].svelte-gp7kvq {inset:0 0 0 auto;height:100dvh;max-width:none;max-height:none;margin:0;}[data-scope='dialog'][data-part='content'][data-placement='end'] {width:min(75vw, 384px);max-width:none;height:100%;max-height:none;padding:0;border:0 solid var(--k-line);border-left-width:1px;border-radius:0;}[data-scope='dialog'][data-part='content'][data-placement='end'] header.svelte-gp7kvq {box-sizing:border-box;padding:16px 40px 16px 16px;}[data-scope='dialog'][data-part='content'][data-placement='end'] [part='body'].svelte-gp7kvq {margin:-4px 0;}[data-scope='dialog'][data-part='content'][data-placement='end']:has(> footer[hidden]) [part='body'].svelte-gp7kvq {margin-bottom:0;}[data-scope='dialog'][data-part='content'][data-placement='end'] footer.svelte-gp7kvq {box-sizing:border-box;flex-direction:column;justify-content:normal;margin-top:auto;padding:16px;}[data-scope='dialog'][data-part='content'][data-placement='end'] [data-scope='dialog'][data-part='title'] {font-size:16px;line-height:24px;}\n  @keyframes af-dialog-slide-in { from { transform: translateX(100%); } }\n  @media (prefers-reduced-motion: no-preference) {[data-scope='dialog'][data-part='content'][data-placement='end'] { animation: af-dialog-slide-in 500ms cubic-bezier(0.4, 0, 0.2, 1);}\n  }\n  @media (prefers-reduced-motion: reduce) {[part='close'].svelte-gp7kvq {transition:none;} }\n  @media (forced-colors: active) {[part='close'].svelte-gp7kvq:focus-visible, [data-scope='dialog'][data-part='content']:focus-visible {outline:2px solid;outline-offset:2px;}\n  }"
};
function x_(e, a) {
	O(a, !0), ee(e, b_);
	let o = R(a, "open", 7, !1), s = R(a, "heading", 7, ""), u = R(a, "placement", 7, "center"), d = R(a, "locale", 7, null), f = R(a, "strings", 7, null), p = a.$$host, m = _(() => c(d(), f() ?? void 0)), h = _(() => u() === "end" ? "end" : "center"), v = B(null), x = "escape", S = B(null), C = B(null), T = B(!1), te = l(p);
	Te(() => te(z(v), !!o()));
	let re = null, ie = null, k = (e) => !(e instanceof Node && i(p, e)) && r(p);
	Te(() => {
		if (o() && z(v)) return me(p.ownerDocument, "pointerdown", (e) => {
			e !== ie && e.button === 0 && e.pointerType !== "touch" && k(e.composedPath()[0] ?? null) && (re = e, n(p, "close", { reason: "outside" }));
		}, { capture: !0 });
	}), Te(() => {
		let e = z(S)?.querySelector("slot");
		if (!e) return;
		let t = () => J(T, e.assignedNodes().length > 0);
		return t(), me(e, "slotchange", t);
	});
	var A = {
		get open() {
			return o();
		},
		set open(e = !1) {
			o(e), M();
		},
		get heading() {
			return s();
		},
		set heading(e = "") {
			s(e), M();
		},
		get placement() {
			return u();
		},
		set placement(e = "center") {
			u(e), M();
		},
		get locale() {
			return d();
		},
		set locale(e = null) {
			d(e), M();
		},
		get strings() {
			return f();
		},
		set strings(e = null) {
			f(e), M();
		}
	}, ae = y_(), j = K(ae);
	t(j, {});
	var P = W(j, 2);
	return Yt(P, {
		value: () => p.shadowRoot,
		children: (e, t) => {
			var r = F(), i = K(r), c = () => !!o();
			E(i, () => Tf, (e, t) => {
				t(e, {
					get open() {
						return c();
					},
					set open(e) {},
					modal: !1,
					preventScroll: !0,
					closeOnInteractOutside: !0,
					onEscapeKeyDown: (e) => {
						qn(e) && e.defaultPrevented ? n(p, "close", { reason: "escape" }) : x = "escape";
					},
					onInteractOutside: (e) => {
						e.detail.originalEvent === re || !k(e.detail.target) ? e.preventDefault() : (ie = e.detail.originalEvent, x = "outside");
					},
					onOpenChange: (e) => {
						e.open || (n(p, "close", { reason: x }), x = "escape");
					},
					children: (e, t) => {
						var r = F(), i = K(r);
						{
							let e = (e, t = b) => {
								var r = v_(), i = (e) => e.preventDefault();
								g(r, (e) => ({
									...e,
									class: "af-kit",
									"data-placement": z(h),
									oncancel: i
								}), [() => t()()], void 0, void 0, "svelte-gp7kvq");
								var o = H(r);
								E(o, () => _d, (e, t) => {
									t(e, {
										part: "content",
										class: "af-overlay dialog",
										"aria-modal": "true",
										get "data-placement"() {
											return z(h);
										},
										children: (e, t) => {
											var r = __(), i = K(r), o = H(i);
											E(o, () => Df, (e, t) => {
												t(e, {
													part: "heading",
													get ref() {
														return z(C);
													},
													set ref(e) {
														J(C, e, !0);
													},
													children: (e, t) => {
														ne();
														var n = fe();
														G(() => w(n, s() ?? "")), I(e, n);
													},
													$$slots: { default: !0 }
												});
											});
											var c = W(o, 2);
											D(i);
											var l = W(i, 2), u = H(l);
											{
												let e = _(() => ({
													element: z(C),
													text: s() ?? ""
												}));
												Sn(u, {
													get heading() {
														return z(e);
													},
													children: (e, t) => {
														var n = F(), r = K(n);
														oe(r, a, "default", {}, null), I(e, n);
													},
													$$slots: { default: !0 }
												});
											}
											D(l);
											var d = W(l, 2), f = H(d);
											oe(f, a, "actions", {}, null), D(d), ue(d, (e) => J(S, e), () => z(S)), G(() => {
												N(c, "aria-label", z(m).close), N(d, "hidden", !z(T));
											}), _e("click", c, () => n(p, "close", { reason: "close-button" })), I(e, r);
										},
										$$slots: { default: !0 }
									});
								}), D(r), ue(r, (e) => J(v, e), () => z(v)), I(e, r);
							};
							E(i, () => xd, (t, n) => {
								n(t, {
									asChild: e,
									$$slots: { asChild: !0 }
								});
							});
						}
						I(e, r);
					},
					$$slots: { default: !0 }
				});
			}), I(e, r);
		},
		$$slots: { default: !0 }
	}), I(e, ae), y(A);
}
we(["click"]), U(x_, {
	open: { type: "Boolean" },
	heading: {
		attribute: "heading",
		type: "String"
	},
	placement: {
		attribute: "placement",
		type: "String"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, ["default", "actions"], [], { mode: "open" });
//#endregion
//#region src/kit/Markdown.svelte
var S_ = L("<div part=\"content\" class=\"plain svelte-y87xpv\"> </div>"), C_ = L("<div part=\"content\" aria-busy=\"true\"></div>"), w_ = L("<!> <div class=\"af-kit\"><!></div>", 1), T_ = {
	hash: "svelte-y87xpv",
	code: ":host {display:block;}.plain.svelte-y87xpv {white-space:pre-wrap;overflow-wrap:anywhere;}"
};
function E_(e, n) {
	O(n, !0), ee(e, T_);
	let r = R(n, "value", 7, null), i = R(n, "mentions", 7, null), a = R(n, "schemes", 7, null), o = R(n, "locale", 7, null), s = R(n, "strings", 7, null), l = n.$$host, u = _(() => c(o(), s() ?? void 0)), d = B(null), f = B(!1);
	Te(() => {
		let e = !0;
		return import("./chunks/markdown-view-BNnNBXye.js").then((t) => {
			e && J(d, t.default);
		}, () => {
			e && J(f, !0);
		}), () => {
			e = !1;
		};
	});
	var p = {
		get value() {
			return r();
		},
		set value(e = null) {
			r(e), M();
		},
		get mentions() {
			return i();
		},
		set mentions(e = null) {
			i(e), M();
		},
		get schemes() {
			return a();
		},
		set schemes(e = null) {
			a(e), M();
		},
		get locale() {
			return o();
		},
		set locale(e = null) {
			o(e), M();
		},
		get strings() {
			return s();
		},
		set strings(e = null) {
			s(e), M();
		}
	}, m = w_(), h = K(m);
	t(h, {});
	var g = W(h, 2), v = H(g), b = (e) => {
		var t = F(), n = K(t);
		E(n, () => z(d), (e, t) => {
			t(e, {
				get value() {
					return r();
				},
				get mentions() {
					return i();
				},
				get schemes() {
					return a();
				},
				get text() {
					return z(u);
				},
				get host() {
					return l;
				}
			});
		}), I(e, t);
	}, x = (e) => {
		var t = S_(), n = ge(t, !0);
		G(() => w(n, r() ?? "")), I(e, t);
	}, S = (e) => {
		var t = C_();
		I(e, t);
	};
	return P(v, (e) => {
		z(d) ? e(b) : z(f) ? e(x, 1) : e(S, -1);
	}), D(g), I(e, m), y(p);
}
U(E_, {
	value: {
		attribute: "value",
		type: "String"
	},
	mentions: { type: "Object" },
	schemes: { type: "Array" },
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/use-menu-context.js
var [D_, O_] = Rt({
	name: "MenuContext",
	hookName: "useMenuContext",
	providerName: "<MenuProvider />",
	strict: !1
}), [k_, A_] = Rt({
	name: "MenuItemContext",
	hookName: "useMenuItemContext",
	providerName: "<MenuItemProvider />"
}), [j_, M_] = Rt({
	name: "MenuItemPropsContext",
	hookName: "useMenuItemPropsContext",
	providerName: "<MenuItemPropsProvider />"
}), N_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"checked"
]);
function P_(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = R(t, "checked", 15), i = q(t, N_), a = _(() => yn()(i, [
		"checked",
		"closeOnSelect",
		"disabled",
		"onCheckedChange",
		"value",
		"valueText"
	])), o = _(() => C(z(a), 2)), s = _(() => z(o)[0]), c = _(() => z(o)[1]), l = _(() => ({
		...z(s),
		type: "checkbox",
		checked: r(),
		onCheckedChange(e) {
			r() !== void 0 && r(e), z(s).onCheckedChange?.(e);
		}
	})), u = O_(), d = _(() => X(u().getOptionItemProps(z(l)), z(c))), f = _(() => u().getOptionItemState(z(l)));
	return j_(() => z(l)), k_(() => z(f)), Q(e, Y({ as: "div" }, () => z(d), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		},
		get checked() {
			return r();
		},
		set checked(e) {
			r(e), M();
		}
	});
}
U(P_, {
	ref: {},
	checked: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-content.svelte
var F_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function I_(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, F_), i = O_(), a = io(), o = _(() => X(i().getContentProps(), a().getPresenceProps(), r));
	function s(e) {
		a().setNode(e);
	}
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	}, l = F(), u = K(l), d = (e) => {
		Q(e, Y({
			as: "div",
			[ce()]: s
		}, () => z(o), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = _(() => !a().unmounted);
	return P(u, (e) => {
		z(f) && e(d);
	}), I(e, l), y(c);
}
U(I_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-context.svelte
function L_(e, t) {
	O(t, !0);
	let n = R(t, "render", 7), r = O_();
	var i = {
		get render() {
			return n();
		},
		set render(e) {
			n(e), M();
		}
	}, a = F(), o = K(a);
	return ye(o, n, () => r), I(e, a), y(i);
}
U(L_, { render: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/use-menu-item-group-context.js
var [R_, z_] = Rt({
	name: "MenuItemGroupContext",
	hookName: "useMenuItemGroupContext",
	providerName: "<MenuItemGroupProvider />"
}), B_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function V_(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, B_), i = O_(), a = z_(), o = _(() => X(i().getItemGroupLabelProps({ htmlFor: a().id }), r));
	return Q(e, Y({ as: "div" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(V_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-item-group.svelte
var H_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function U_(e, t) {
	let n = m();
	O(t, !0);
	let r = R(t, "ref", 15, null), i = q(t, H_), a = O_(), o = _(() => ({
		id: n,
		...i
	})), s = _(() => X(a().getItemGroupProps(z(o)), i));
	return R_(() => z(o)), Q(e, Y({ as: "div" }, () => z(s), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), y({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), M();
		}
	});
}
U(U_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-item-indicator.svelte
var W_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function G_(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, W_), i = O_(), a = M_(), o = _(() => X(i().getItemIndicatorProps(a()), r));
	return Q(e, Y({ as: "div" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(G_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-item.svelte
var K_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function q_(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, K_), i = _(() => yn()(r, [
		"closeOnSelect",
		"disabled",
		"value",
		"valueText",
		"onSelect"
	])), a = _(() => C(z(i), 2)), o = _(() => z(a)[0]), s = _(() => z(a)[1]), c = O_(), l = _(() => X(c().getItemProps(z(o)), z(s))), u = _(() => c().getItemState(z(o)));
	return Te(() => c().addItemListener({
		id: z(u).id,
		onSelect: z(o).onSelect
	})), j_(() => z(o)), k_(() => z(u)), Q(e, Y({ as: "div" }, () => z(l), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(q_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-positioner.svelte
var J_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Y_(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, J_), i = O_(), a = io(), o = _(() => X(i().getPositionerProps(), r));
	var s = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	}, c = F(), l = K(c), u = (e) => {
		Q(e, Y({ as: "div" }, () => z(o), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, d = _(() => !a().unmounted);
	return P(l, (e) => {
		z(d) && e(u);
	}), I(e, c), y(s);
}
U(Y_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-radio-item-group.svelte
var X_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"value"
]);
function Z_(e, t) {
	let n = m();
	O(t, !0);
	let r = R(t, "ref", 15, null), i = R(t, "value", 15), a = q(t, X_), o = _(() => yn()(a, [
		"id",
		"onValueChange",
		"value"
	])), s = _(() => C(z(o), 2)), c = _(() => z(s)[0]), l = _(() => z(s)[1]), u = O_(), d = _(() => ({
		id: z(c).id ?? n,
		value: i(),
		onValueChange(e) {
			i(e.value), z(c)?.onValueChange?.(e);
		}
	})), f = _(() => X(u().getItemGroupProps({ id: z(d).id }), z(l)));
	return R_(() => z(d)), Q(e, Y({ as: "div" }, () => z(f), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), y({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), M();
		},
		get value() {
			return i();
		},
		set value(e) {
			i(e), M();
		}
	});
}
U(Z_, {
	ref: {},
	value: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-radio-item.svelte
var Q_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function $_(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, Q_), i = _(() => yn()(r, [
		"closeOnSelect",
		"disabled",
		"value",
		"valueText"
	])), a = _(() => C(z(i), 2)), o = _(() => z(a)[0]), s = _(() => z(a)[1]), c = O_(), l = z_(), u = _(() => ({
		...z(o),
		checked: l().value === z(o).value,
		type: "radio",
		onCheckedChange: () => l().onValueChange?.({ value: z(o).value })
	})), d = _(() => X(c().getOptionItemProps(z(u)), z(s))), f = _(() => c().getOptionItemState(z(u)));
	return j_(() => z(u)), k_(() => z(f)), Q(e, Y({ as: "div" }, () => z(d), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U($_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/use-menu-machine-context.js
var [ev, tv] = Rt({
	name: "MenuMachineContext",
	hookName: "useMenuMachineContext",
	providerName: "<MenuMachineProvider />",
	strict: !1
}), [nv, rv] = Rt({
	name: "MenuTriggerItemContext",
	hookName: "useMenuTriggerItemContext",
	providerName: "<MenuTriggerItemProvider />",
	strict: !1
}), iv = ln("menu").parts("arrow", "arrowTip", "content", "contextTrigger", "indicator", "item", "itemGroup", "itemGroupLabel", "itemIndicator", "itemText", "positioner", "separator", "trigger", "triggerItem").build(), av = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `menu:${e.id}:trigger:${t}` : `menu:${e.id}:trigger` : et(n) ? n(t) : n;
}, ov = (e, t) => {
	let n = e.ids?.contextTrigger;
	return n == null ? t ? `menu:${e.id}:ctx-trigger:${t}` : `menu:${e.id}:ctx-trigger` : et(n) ? n(t) : n;
}, sv = (e) => e.ids?.content ?? `menu:${e.id}:content`, cv = (e) => e.ids?.arrow ?? `menu:${e.id}:arrow`, lv = (e) => e.ids?.positioner ?? `menu:${e.id}:popper`, uv = (e, t) => e.ids?.group?.(t) ?? `menu:${e.id}:group:${t}`, dv = (e, t) => `${e.id}/${t}`, fv = (e) => e?.dataset.value ?? null, pv = (e, t) => e.ids?.groupLabel?.(t) ?? `menu:${e.id}:group-label:${t}`, mv = (e) => e.getById(sv(e)), hv = (e) => e.getById(lv(e)), gv = (e) => e.getById(av(e)), _v = (e, t) => t ? e.getById(dv(e, t)) : null, vv = (e) => e.getById(ov(e)), yv = (e) => ht(e.getRootNode(), `[data-scope="menu"][data-part="trigger"]${qt(e.id)}`), bv = (e) => ht(e.getRootNode(), `[data-scope="menu"][data-part="context-trigger"]${qt(e.id)}`), xv = (e, t) => t == null ? gv(e) ?? yv(e)[0] : e.getById(av(e, t)), Sv = (e) => {
	let t = `[role^="menuitem"]${qt(sv(e))}:not([data-disabled])`;
	return ht(mv(e), t);
}, Cv = (e) => Ht(Sv(e)), wv = (e) => sn(Sv(e)), Tv = (e, t) => t ? e.id === t || e.dataset.value === t : !1, Ev = (e, t) => {
	let n = Sv(e), r = n.findIndex((e) => Tv(e, t.value));
	return _n(n, r, { loop: t.loop ?? t.loopFocus });
}, Dv = (e, t) => {
	let n = Sv(e), r = n.findIndex((e) => Tv(e, t.value));
	return Pt(n, r, { loop: t.loop ?? t.loopFocus });
}, Ov = (e, t) => {
	let n = Sv(e), r = n.find((e) => Tv(e, t.value));
	return Ba(n, {
		state: t.typeaheadState,
		key: t.key,
		activeId: r?.id ?? null
	});
}, kv = (e) => Bt(e) && (e.dataset.disabled === "" || e.hasAttribute("disabled")), Av = (e) => !!e?.getAttribute("role")?.startsWith("menuitem") && !!e?.hasAttribute("data-controls"), jv = "menu:select";
function Mv(e, t) {
	if (!e) return;
	let n = new (cn(e)).CustomEvent(jv, { detail: { value: t } });
	e.dispatchEvent(n);
}
function Nv(e) {
	let t = sv(e);
	return mv(e) ?? e.getDoc().getElementById(t);
}
function Pv(e, t) {
	if (!Bt(e)) return !1;
	for (let n in t) {
		let r = t[n], i = Nv(r.scope);
		if (i && kt(i, e)) return !0;
		let a = r.refs.get("children");
		if (Object.keys(a).length > 0 && Pv(e, a)) return !0;
	}
	return !1;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+rect-utils@1.43.3/node_modules/@zag-js/rect-utils/dist/rect.mjs
var Fv = (e, t) => ({
	x: e,
	y: t
});
function Iv(e) {
	let { x: t, y: n, width: r, height: i } = e, a = t + r / 2, o = n + i / 2;
	return {
		x: t,
		y: n,
		width: r,
		height: i,
		minX: t,
		minY: n,
		maxX: t + r,
		maxY: n + i,
		midX: a,
		midY: o,
		center: Fv(a, o)
	};
}
function Lv(e) {
	return {
		top: Fv(e.minX, e.minY),
		right: Fv(e.maxX, e.minY),
		bottom: Fv(e.maxX, e.maxY),
		left: Fv(e.minX, e.maxY)
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+rect-utils@1.43.3/node_modules/@zag-js/rect-utils/dist/polygon.mjs
function Rv(e, t) {
	let { top: n, right: r, left: i, bottom: a } = Lv(Iv(e)), [o] = t.split("-");
	return {
		top: [
			i,
			n,
			r,
			a
		],
		right: [
			n,
			r,
			a,
			i
		],
		bottom: [
			n,
			i,
			a,
			r
		],
		left: [
			r,
			n,
			i,
			a
		]
	}[o];
}
function zv(e, t) {
	let { x: n, y: r } = t, i = !1;
	for (let t = 0, a = e.length - 1; t < e.length; a = t++) {
		let o = e[t].x, s = e[t].y, c = e[a].x, l = e[a].y;
		s > r != l > r && n < (c - o) * (r - s) / (l - s) + o && (i = !i);
	}
	return i;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+menu@1.43.3/node_modules/@zag-js/menu/dist/menu.utils.mjs
function Bv(e) {
	let t = e.parent;
	for (; t && t.context.get("isSubmenu");) t = t.refs.get("parent");
	t?.send({ type: "CLOSE" });
}
function Vv(e, t) {
	return e ? zv(e, t) : !1;
}
function Hv(e, t, n) {
	let r = Object.keys(e).length > 0;
	if (!t) return null;
	if (!r) return dv(n, t);
	for (let n in e) {
		let r = e[n], i = av(r.scope);
		if (i === t) return i;
	}
	return dv(n, t);
}
function Uv(e, t) {
	e && (e.refs.set("pointerRoutingLocked", t), e.context.set("pointerRoutingMode", t ? "locked" : "interactive"));
}
function Wv(e) {
	let t = e.context.get("highlightedValue");
	if (!t) return !1;
	let n = e.refs.get("children");
	for (let e in n) {
		let r = n[e];
		if (r.state.hasTag("open") && av(r.scope) === t) return !0;
	}
	return !1;
}
function Gv(e, t) {
	e && (e.refs.get("pointerRoutingLocked") || t && Wv(e) || Uv(e, !1));
}
function Kv(e) {
	e && (Wv(e) || Uv(e, !1));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+menu@1.43.3/node_modules/@zag-js/menu/dist/menu.connect.mjs
function qv(e, t) {
	let { context: n, send: r, state: i, computed: a, prop: o, scope: s } = e, c = i.hasTag("open"), l = n.get("isSubmenu"), u = a("isTypingAhead"), d = o("composite"), f = n.get("currentPlacement"), p = f ? Go(f) : void 0, m = n.get("anchorPoint"), h = n.get("highlightedValue"), g = n.get("triggerValue"), _ = us({
		...o("positioning"),
		placement: f
	});
	function v(e) {
		return {
			id: dv(s, e.value),
			disabled: !!e.disabled,
			highlighted: h === e.value
		};
	}
	function y(e) {
		let t = e.valueText ?? e.value;
		return {
			...e,
			id: e.value,
			valueText: t
		};
	}
	function ee(e) {
		return {
			...v(y(e)),
			checked: !!e.checked
		};
	}
	function b(e) {
		let { closeOnSelect: n, valueText: i, value: a } = e, o = v(e), c = dv(s, a);
		return t.element({
			...iv.item.attrs,
			id: c,
			role: "menuitem",
			"aria-disabled": pn(o.disabled),
			"data-disabled": Z(o.disabled),
			"data-ownedby": sv(s),
			"data-highlighted": Z(o.highlighted),
			"data-value": a,
			"data-valuetext": i,
			onDragStart(e) {
				e.currentTarget.matches("a[href]") && e.preventDefault();
			},
			onPointerMove(e) {
				if (o.disabled || e.pointerType !== "mouse" || jo() !== "pointer") return;
				let t = e.currentTarget;
				if (o.highlighted) return;
				let i = rt(e);
				r({
					type: "ITEM_POINTERMOVE",
					id: c,
					target: t,
					closeOnSelect: n,
					point: i
				});
			},
			onPointerLeave(e) {
				if (o.disabled || e.pointerType !== "mouse" || jo() !== "pointer") return;
				let t = e.currentTarget;
				r({
					type: "ITEM_POINTERLEAVE",
					id: c,
					target: t,
					closeOnSelect: n
				});
			},
			onPointerDown(e) {
				if (o.disabled) return;
				let t = e.currentTarget;
				r({
					type: "ITEM_POINTERDOWN",
					target: t,
					id: c,
					closeOnSelect: n
				});
			},
			onClick(e) {
				if (pt(e) || xt(e) || o.disabled) return;
				let t = e.currentTarget;
				r({
					type: "ITEM_CLICK",
					target: t,
					id: c,
					closeOnSelect: n
				});
			}
		});
	}
	return {
		highlightedValue: h,
		open: c,
		setOpen(e) {
			i.hasTag("open") !== e && r({ type: e ? "OPEN" : "CLOSE" });
		},
		triggerValue: g,
		setTriggerValue(e) {
			r({
				type: "TRIGGER_VALUE.SET",
				value: e
			});
		},
		setHighlightedValue(e) {
			r({
				type: "HIGHLIGHTED.SET",
				value: e
			});
		},
		setParent(e) {
			r({
				type: "PARENT.SET",
				value: e,
				id: e.prop("id")
			});
		},
		setChild(e) {
			r({
				type: "CHILD.SET",
				value: e,
				id: e.prop("id")
			});
		},
		reposition(e = {}) {
			r({
				type: "POSITIONING.SET",
				options: e
			});
		},
		addItemListener(e) {
			let t = s.getById(e.id);
			if (!t) return;
			let n = () => e.onSelect?.();
			return t.addEventListener(jv, n), () => t.removeEventListener(jv, n);
		},
		getContextTriggerProps(e = {}) {
			let { value: n } = e, i = n != null && g === n, a = ov(s, n);
			return t.element({
				...iv.contextTrigger.attrs,
				dir: o("dir"),
				id: a,
				"data-ownedby": s.id,
				"data-value": n,
				"data-current": Z(i),
				"data-state": c ? "open" : "closed",
				onPointerDown(e) {
					if (e.pointerType === "mouse") return;
					let t = rt(e);
					r({
						type: "CONTEXT_MENU_START",
						point: t,
						value: n
					});
				},
				onPointerCancel(e) {
					e.pointerType !== "mouse" && r({ type: "CONTEXT_MENU_CANCEL" });
				},
				onPointerMove(e) {
					e.pointerType !== "mouse" && r({ type: "CONTEXT_MENU_CANCEL" });
				},
				onPointerUp(e) {
					e.pointerType !== "mouse" && r({ type: "CONTEXT_MENU_CANCEL" });
				},
				onContextMenu(e) {
					let t = rt(e);
					r({
						type: c && n != null && !i ? "TRIGGER_VALUE.SET" : "CONTEXT_MENU",
						point: t,
						value: n
					}), e.preventDefault();
				},
				style: {
					WebkitTouchCallout: "none",
					WebkitUserSelect: "none",
					userSelect: "none"
				}
			});
		},
		getTriggerItemProps(e) {
			let t = e.getTriggerProps();
			return Mn(b({ value: t.id }), t);
		},
		getTriggerProps(n = {}) {
			let { value: i } = n, a = i != null && g === i, u = av(s, i);
			return t.button({
				...l ? iv.triggerItem.attrs : iv.trigger.attrs,
				"data-placement": f,
				"data-side": p,
				type: "button",
				dir: o("dir"),
				id: u,
				...i != null && {
					"data-ownedby": s.id,
					"data-value": i,
					"data-current": Z(a)
				},
				"data-uid": o("id"),
				"aria-haspopup": d ? "menu" : "dialog",
				"aria-controls": sv(s),
				"data-controls": sv(s),
				"aria-expanded": i == null ? c : c && a,
				"data-state": c ? "open" : "closed",
				onPointerMove(e) {
					if (e.pointerType !== "mouse" || kv(e.currentTarget) || !l) return;
					let t = rt(e);
					r({
						type: "TRIGGER_POINTERMOVE",
						target: e.currentTarget,
						point: t
					});
				},
				onPointerLeave(t) {
					if (kv(t.currentTarget) || t.pointerType !== "mouse" || !l) return;
					Uv(e.refs.get("parent"), !0);
					let n = rt(t);
					r({
						type: "TRIGGER_POINTERLEAVE",
						target: t.currentTarget,
						point: n
					});
				},
				onPointerDown(e) {
					kv(e.currentTarget) || tt(e) || e.preventDefault();
				},
				onClick(e) {
					e.defaultPrevented || kv(e.currentTarget) || r({
						type: c && i != null && !a ? "TRIGGER_VALUE.SET" : "TRIGGER_CLICK",
						target: e.currentTarget,
						value: i
					});
				},
				onBlur() {
					r({ type: "TRIGGER_BLUR" });
				},
				onFocus() {
					r({ type: "TRIGGER_FOCUS" });
				},
				onKeyDown(e) {
					if (e.defaultPrevented) return;
					let t = {
						ArrowDown() {
							r({
								type: "ARROW_DOWN",
								value: i
							});
						},
						ArrowUp() {
							r({
								type: "ARROW_UP",
								value: i
							});
						},
						Enter() {
							r({
								type: "ARROW_DOWN",
								src: "enter",
								value: i
							});
						},
						Space() {
							r({
								type: "ARROW_DOWN",
								src: "space",
								value: i
							});
						}
					}[Qt(e, {
						orientation: "vertical",
						dir: o("dir")
					})];
					t && (e.preventDefault(), t(e));
				}
			});
		},
		getIndicatorProps() {
			return t.element({
				...iv.indicator.attrs,
				dir: o("dir"),
				"data-state": c ? "open" : "closed"
			});
		},
		getPositionerProps() {
			return t.element({
				...iv.positioner.attrs,
				dir: o("dir"),
				id: lv(s),
				style: _.floating
			});
		},
		getArrowProps() {
			return t.element({
				id: cv(s),
				...iv.arrow.attrs,
				dir: o("dir"),
				style: _.arrow
			});
		},
		getArrowTipProps() {
			return t.element({
				...iv.arrowTip.attrs,
				dir: o("dir"),
				style: _.arrowTip
			});
		},
		getContentProps() {
			return t.element({
				...iv.content.attrs,
				id: sv(s),
				"aria-label": o("aria-label"),
				hidden: !c,
				"data-state": c ? "open" : "closed",
				role: d ? "menu" : "dialog",
				tabIndex: 0,
				dir: o("dir"),
				"aria-activedescendant": a("highlightedId") || void 0,
				"aria-labelledby": m ? ov(s, g ?? void 0) : av(s, g ?? void 0),
				"data-placement": f,
				"data-side": p,
				onPointerEnter(e) {
					e.pointerType === "mouse" && r({ type: "MENU_POINTERENTER" });
				},
				onKeyDown(e) {
					if (e.defaultPrevented || !kt(e.currentTarget, lt(e))) return;
					let t = lt(e);
					if (t?.closest("[role=menu]") !== e.currentTarget && t !== e.currentTarget) return;
					if (e.key === "Tab" && !ma(e)) {
						e.preventDefault();
						return;
					}
					let n = {
						ArrowDown() {
							r({ type: "ARROW_DOWN" });
						},
						ArrowUp() {
							r({ type: "ARROW_UP" });
						},
						ArrowLeft() {
							r({ type: "ARROW_LEFT" });
						},
						ArrowRight() {
							r({ type: "ARROW_RIGHT" });
						},
						Enter() {
							r({ type: "ENTER" });
						},
						Space(e) {
							u ? r({
								type: "TYPEAHEAD",
								key: e.key
							}) : n.Enter?.(e);
						},
						Home() {
							r({ type: "HOME" });
						},
						End() {
							r({ type: "END" });
						}
					}, i = n[Qt(e, { dir: o("dir") })];
					if (i) {
						i(e), e.stopPropagation(), e.preventDefault();
						return;
					}
					o("typeahead") && qe(e) && (Fe(e) || dn(t) || (r({
						type: "TYPEAHEAD",
						key: e.key
					}), e.preventDefault()));
				}
			});
		},
		getSeparatorProps() {
			return t.element({
				...iv.separator.attrs,
				role: "separator",
				dir: o("dir"),
				"aria-orientation": "horizontal"
			});
		},
		getItemState: v,
		getItemProps: b,
		getOptionItemState: ee,
		getOptionItemProps(e) {
			let { type: n, disabled: i, closeOnSelect: a } = e, s = y(e), c = ee(e);
			return {
				...b(s),
				...t.element({
					"data-type": n,
					...iv.item.attrs,
					dir: o("dir"),
					"data-value": s.value,
					role: `menuitem${n}`,
					"aria-checked": !!c.checked,
					"data-state": c.checked ? "checked" : "unchecked",
					onClick(e) {
						if (i || pt(e) || xt(e)) return;
						let t = e.currentTarget;
						r({
							type: "ITEM_CLICK",
							target: t,
							option: s,
							closeOnSelect: a
						});
					}
				})
			};
		},
		getItemIndicatorProps(e) {
			let n = ee(nt(e)), r = n.checked ? "checked" : "unchecked";
			return t.element({
				...iv.itemIndicator.attrs,
				dir: o("dir"),
				"data-disabled": Z(n.disabled),
				"data-highlighted": Z(n.highlighted),
				"data-state": bt(e, "checked") ? r : void 0,
				hidden: bt(e, "checked") ? !n.checked : void 0
			});
		},
		getItemTextProps(e) {
			let n = ee(nt(e)), r = n.checked ? "checked" : "unchecked";
			return t.element({
				...iv.itemText.attrs,
				dir: o("dir"),
				"data-disabled": Z(n.disabled),
				"data-highlighted": Z(n.highlighted),
				"data-state": bt(e, "checked") ? r : void 0
			});
		},
		getItemGroupLabelProps(e) {
			return t.element({
				...iv.itemGroupLabel.attrs,
				id: pv(s, e.htmlFor),
				dir: o("dir")
			});
		},
		getItemGroupProps(e) {
			return t.element({
				id: uv(s, e.id),
				...iv.itemGroup.attrs,
				dir: o("dir"),
				"aria-labelledby": pv(s, e.id),
				role: "group"
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+menu@1.43.3/node_modules/@zag-js/menu/dist/menu.machine.mjs
var { not: Jv, and: Yv, or: Xv } = On(), Zv = Pn({
	props({ props: e }) {
		return {
			closeOnSelect: !0,
			typeahead: !0,
			composite: !0,
			loopFocus: !1,
			navigate(e) {
				ya(e.node);
			},
			...e,
			positioning: {
				placement: "bottom-start",
				gutter: 8,
				...e.positioning
			}
		};
	},
	initialState({ prop: e }) {
		return e("open") || e("defaultOpen") ? "open" : "idle";
	},
	context({ bindable: e, prop: t, scope: n }) {
		return {
			highlightedValue: e(() => ({
				defaultValue: t("defaultHighlightedValue") || null,
				value: t("highlightedValue"),
				onChange(e) {
					t("onHighlightChange")?.({ highlightedValue: e });
				}
			})),
			lastHighlightedValue: e(() => ({ defaultValue: null })),
			currentPlacement: e(() => ({ defaultValue: void 0 })),
			intentPolygon: e(() => ({ defaultValue: null })),
			anchorPoint: e(() => ({
				defaultValue: null,
				hash(e) {
					return `x: ${e?.x}, y: ${e?.y}`;
				}
			})),
			isSubmenu: e(() => ({ defaultValue: !1 })),
			triggerValue: e(() => ({
				defaultValue: t("defaultTriggerValue") ?? null,
				value: t("triggerValue"),
				onChange(e) {
					let r = t("onTriggerValueChange");
					r && r({
						value: e,
						triggerElement: xv(n, e)
					});
				}
			})),
			pointerRoutingMode: e(() => ({ defaultValue: "interactive" }))
		};
	},
	refs() {
		return {
			parent: null,
			children: {},
			pointerRoutingLocked: !1,
			typeaheadState: { ...Ba.defaultOptions },
			positioningOverride: {}
		};
	},
	computed: {
		isRtl: ({ prop: e }) => e("dir") === "rtl",
		isTypingAhead: ({ refs: e }) => e.get("typeaheadState").keysSoFar !== "",
		highlightedId: ({ context: e, scope: t, refs: n }) => Hv(n.get("children"), e.get("highlightedValue"), t)
	},
	watch({ track: e, action: t, context: n, prop: r }) {
		e([() => n.get("isSubmenu")], () => {
			t(["setSubmenuPlacement"]);
		}), e([() => n.hash("anchorPoint")], () => {
			n.get("anchorPoint") && t(["reposition"]);
		}), e([() => r("open")], () => {
			t(["toggleVisibility"]);
		});
	},
	on: {
		"TRIGGER_VALUE.SET": { actions: [
			"setTriggerValue",
			"setAnchorPoint",
			"reposition",
			"focusMenu"
		] },
		"PARENT.SET": { actions: ["setParentMenu"] },
		"CHILD.SET": { actions: ["setChildMenu"] },
		OPEN: [{
			guard: "isOpenControlled",
			actions: ["setTriggerValue", "invokeOnOpen"]
		}, {
			target: "open",
			actions: ["setTriggerValue", "invokeOnOpen"]
		}],
		OPEN_AUTOFOCUS: [{
			guard: "isOpenControlled",
			actions: ["setTriggerValue", "invokeOnOpen"]
		}, {
			target: "open",
			actions: [
				"setTriggerValue",
				"highlightFirstItem",
				"invokeOnOpen"
			]
		}],
		CLOSE: [{
			guard: "isOpenControlled",
			actions: ["invokeOnClose", "releaseParentRoutingLock"]
		}, {
			target: "closed",
			actions: [
				"invokeOnClose",
				"releaseParentRoutingLock",
				"focusTrigger"
			]
		}],
		"HIGHLIGHTED.RESTORE": { actions: ["restoreHighlightedItem"] },
		"HIGHLIGHTED.SET": { actions: ["setHighlightedItem"] },
		"HIGHLIGHTED.SUGGEST": { actions: ["suggestHighlightedItem"] }
	},
	states: {
		idle: {
			tags: ["closed"],
			on: {
				"CONTROLLED.OPEN": { target: "open" },
				"CONTROLLED.CLOSE": { target: "closed" },
				CONTEXT_MENU_START: {
					target: "opening:contextmenu",
					actions: ["setAnchorPoint", "setTriggerValue"]
				},
				CONTEXT_MENU: [{
					guard: "isOpenControlled",
					actions: [
						"setAnchorPoint",
						"setTriggerValue",
						"invokeOnOpen"
					]
				}, {
					target: "open",
					actions: [
						"setAnchorPoint",
						"setTriggerValue",
						"invokeOnOpen"
					]
				}],
				TRIGGER_CLICK: [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen", "setTriggerValue"]
				}, {
					target: "open",
					actions: ["invokeOnOpen", "setTriggerValue"]
				}],
				TRIGGER_FOCUS: {
					guard: Jv("isSubmenu"),
					target: "closed"
				},
				TRIGGER_POINTERMOVE: {
					guard: "isSubmenu",
					target: "opening"
				}
			}
		},
		"opening:contextmenu": {
			tags: ["closed"],
			effects: ["waitForLongPress"],
			on: {
				"CONTROLLED.OPEN": {
					target: "open",
					actions: ["reposition"]
				},
				"CONTROLLED.CLOSE": {
					target: "closed",
					actions: ["focusTrigger"]
				},
				CONTEXT_MENU_CANCEL: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose", "releaseParentRoutingLock"]
				}, {
					target: "closed",
					actions: [
						"invokeOnClose",
						"releaseParentRoutingLock",
						"focusTrigger"
					]
				}],
				"LONG_PRESS.OPEN": [{
					guard: "isOpenControlled",
					actions: ["setTriggerValue", "invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"setTriggerValue",
						"invokeOnOpen",
						"reposition"
					]
				}]
			}
		},
		opening: {
			tags: ["closed"],
			effects: ["waitForOpenDelay"],
			on: {
				"CONTROLLED.OPEN": { target: "open" },
				"CONTROLLED.CLOSE": {
					target: "closed",
					actions: ["focusTrigger"]
				},
				BLUR: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose", "releaseParentRoutingLock"]
				}, {
					target: "closed",
					actions: [
						"invokeOnClose",
						"releaseParentRoutingLock",
						"focusTrigger"
					]
				}],
				TRIGGER_POINTERLEAVE: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose", "releaseParentRoutingLock"]
				}, {
					target: "closed",
					actions: [
						"invokeOnClose",
						"releaseParentRoutingLock",
						"focusTrigger"
					]
				}],
				"DELAY.OPEN": [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: ["invokeOnOpen"]
				}]
			}
		},
		closing: {
			tags: ["open"],
			effects: [
				"trackPointerMove",
				"trackInteractOutside",
				"waitForCloseDelay"
			],
			on: {
				"CONTROLLED.OPEN": { target: "open" },
				"CONTROLLED.CLOSE": {
					target: "closed",
					actions: ["focusParentMenu", "restoreParentHighlightedItem"]
				},
				MENU_POINTERENTER: {
					target: "open",
					actions: ["clearIntentPolygon"]
				},
				POINTER_MOVED_AWAY_FROM_SUBMENU: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose", "releaseParentRoutingLock"]
				}, {
					target: "closed",
					actions: ["focusParentMenu", "restoreParentHighlightedItem"]
				}],
				"DELAY.CLOSE": [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose", "releaseParentRoutingLock"]
				}, {
					target: "closed",
					actions: [
						"focusParentMenu",
						"restoreParentHighlightedItem",
						"invokeOnClose",
						"releaseParentRoutingLock"
					]
				}]
			}
		},
		closed: {
			tags: ["closed"],
			entry: [
				"clearHighlightedItem",
				"unlockParentOnClose",
				"clearAnchorPoint"
			],
			on: {
				"CONTROLLED.OPEN": [
					{
						guard: Xv("isOpenAutoFocusEvent", "isArrowDownEvent"),
						target: "open",
						actions: ["highlightFirstItem"]
					},
					{
						guard: "isArrowUpEvent",
						target: "open",
						actions: ["highlightLastItem"]
					},
					{ target: "open" }
				],
				CONTEXT_MENU_START: {
					target: "opening:contextmenu",
					actions: ["setAnchorPoint", "setTriggerValue"]
				},
				CONTEXT_MENU: [{
					guard: "isOpenControlled",
					actions: [
						"setAnchorPoint",
						"setTriggerValue",
						"invokeOnOpen"
					]
				}, {
					target: "open",
					actions: [
						"setAnchorPoint",
						"setTriggerValue",
						"invokeOnOpen"
					]
				}],
				TRIGGER_CLICK: [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen", "setTriggerValue"]
				}, {
					target: "open",
					actions: ["invokeOnOpen", "setTriggerValue"]
				}],
				TRIGGER_POINTERMOVE: {
					guard: "isTriggerItem",
					target: "opening"
				},
				TRIGGER_BLUR: { target: "idle" },
				ARROW_DOWN: [{
					guard: "isOpenControlled",
					actions: ["setTriggerValue", "invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"setTriggerValue",
						"highlightFirstItem",
						"invokeOnOpen"
					]
				}],
				ARROW_UP: [{
					guard: "isOpenControlled",
					actions: ["setTriggerValue", "invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"setTriggerValue",
						"highlightLastItem",
						"invokeOnOpen"
					]
				}]
			}
		},
		open: {
			tags: ["open"],
			effects: [
				"trackInteractOutside",
				"trackFocusVisible",
				"trackPositioning",
				"scrollToHighlightedItem"
			],
			entry: ["focusMenu", "unlockParentOnOpen"],
			on: {
				"CONTROLLED.CLOSE": [{
					target: "closed",
					guard: "isArrowLeftEvent",
					actions: ["focusParentMenu"]
				}, {
					target: "closed",
					actions: ["focusTrigger"]
				}],
				TRIGGER_CLICK: [{
					guard: Yv(Jv("isTriggerItem"), "isOpenControlled"),
					actions: ["invokeOnClose", "releaseParentRoutingLock"]
				}, {
					guard: Jv("isTriggerItem"),
					target: "closed",
					actions: [
						"invokeOnClose",
						"releaseParentRoutingLock",
						"focusTrigger"
					]
				}],
				CONTEXT_MENU: { actions: [
					"setAnchorPoint",
					"setTriggerValue",
					"focusMenu"
				] },
				ARROW_UP: { actions: ["highlightPrevItem", "focusMenu"] },
				ARROW_DOWN: { actions: ["highlightNextItem", "focusMenu"] },
				ARROW_LEFT: [{
					guard: Yv("isSubmenu", "isOpenControlled"),
					actions: ["invokeOnClose", "releaseParentRoutingLock"]
				}, {
					guard: "isSubmenu",
					target: "closed",
					actions: [
						"focusParentMenu",
						"invokeOnClose",
						"releaseParentRoutingLock"
					]
				}],
				HOME: { actions: ["highlightFirstItem", "focusMenu"] },
				END: { actions: ["highlightLastItem", "focusMenu"] },
				ARROW_RIGHT: {
					guard: "isTriggerItemHighlighted",
					actions: ["openSubmenu"]
				},
				ENTER: [{
					guard: "isTriggerItemHighlighted",
					actions: ["openSubmenu"]
				}, { actions: ["clickHighlightedItem"] }],
				ITEM_POINTERMOVE: [{
					guard: Jv("isPointerRoutingLocked"),
					actions: [
						"setHighlightedItem",
						"focusMenu",
						"closeSiblingMenus"
					]
				}, { actions: ["setLastHighlightedItem", "closeSiblingMenus"] }],
				ITEM_POINTERLEAVE: {
					guard: Yv(Jv("isPointerRoutingLocked"), Jv("isTriggerItem")),
					actions: ["clearHighlightedItem"]
				},
				ITEM_CLICK: [
					{
						guard: Yv(Jv("isTriggerItemHighlighted"), Jv("isHighlightedItemEditable"), "closeOnSelect", "isOpenControlled"),
						actions: [
							"invokeOnSelect",
							"setOptionState",
							"closeRootMenu",
							"invokeOnClose",
							"releaseParentRoutingLock"
						]
					},
					{
						guard: Yv(Jv("isTriggerItemHighlighted"), Jv("isHighlightedItemEditable"), "closeOnSelect"),
						target: "closed",
						actions: [
							"invokeOnSelect",
							"setOptionState",
							"closeRootMenu",
							"invokeOnClose",
							"releaseParentRoutingLock",
							"focusTrigger"
						]
					},
					{
						guard: Yv(Jv("isTriggerItemHighlighted"), Jv("isHighlightedItemEditable")),
						actions: ["invokeOnSelect", "setOptionState"]
					},
					{ actions: ["setHighlightedItem"] }
				],
				TRIGGER_POINTERMOVE: {
					guard: "isTriggerItem",
					actions: ["setIntentPolygon"]
				},
				TRIGGER_POINTERLEAVE: {
					target: "closing",
					actions: ["setIntentPolygon"]
				},
				ITEM_POINTERDOWN: { actions: ["setHighlightedItem"] },
				TYPEAHEAD: { actions: ["highlightMatchedItem"] },
				FOCUS_MENU: { actions: ["focusMenu"] },
				"POSITIONING.SET": { actions: ["reposition"] }
			}
		}
	},
	implementations: {
		guards: {
			closeOnSelect: ({ prop: e, event: t }) => !!(t?.closeOnSelect ?? e("closeOnSelect")),
			isTriggerItem: ({ event: e }) => Av(e.target),
			isTriggerItemHighlighted: ({ event: e, scope: t, computed: n }) => !!(e.target ?? t.getById(n("highlightedId")))?.hasAttribute("data-controls"),
			isSubmenu: ({ context: e }) => e.get("isSubmenu"),
			isPointerRoutingLocked: ({ refs: e }) => e.get("pointerRoutingLocked"),
			isHighlightedItemEditable: ({ scope: e, computed: t }) => dn(e.getById(t("highlightedId"))),
			isOpenControlled: ({ prop: e }) => e("open") !== void 0,
			isArrowLeftEvent: ({ event: e }) => e.previousEvent?.type === "ARROW_LEFT",
			isArrowUpEvent: ({ event: e }) => e.previousEvent?.type === "ARROW_UP",
			isArrowDownEvent: ({ event: e }) => e.previousEvent?.type === "ARROW_DOWN",
			isOpenAutoFocusEvent: ({ event: e }) => e.previousEvent?.type === "OPEN_AUTOFOCUS"
		},
		effects: {
			waitForOpenDelay({ send: e }) {
				let t = setTimeout(() => {
					e({ type: "DELAY.OPEN" });
				}, 200);
				return () => clearTimeout(t);
			},
			waitForCloseDelay({ send: e }) {
				let t = setTimeout(() => {
					e({ type: "DELAY.CLOSE" });
				}, 100);
				return () => clearTimeout(t);
			},
			waitForLongPress({ send: e }) {
				let t = setTimeout(() => {
					e({ type: "LONG_PRESS.OPEN" });
				}, 700);
				return () => clearTimeout(t);
			},
			trackFocusVisible({ scope: e }) {
				return Po({ root: e.getRootNode?.() });
			},
			trackPositioning({ context: e, prop: t, scope: n, refs: r }) {
				if (vv(n) || bv(n).length > 0) return;
				let i = {
					...t("positioning"),
					...r.get("positioningOverride")
				};
				return e.set("currentPlacement", i.placement), cs(() => xv(n, e.get("triggerValue")), () => hv(n), {
					...i,
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			trackInteractOutside({ refs: e, scope: t, prop: n, context: r, send: i }) {
				let a = () => mv(t), o = !0, s = (e) => bv(t).some((t) => kt(t, e));
				return sc(a, {
					type: "menu",
					defer: !0,
					exclude: [gv(t), ...yv(t)].filter(Boolean),
					onInteractOutside: n("onInteractOutside"),
					onRequestDismiss: n("onRequestDismiss"),
					onFocusOutside(t) {
						n("onFocusOutside")?.(t);
						let r = lt(t.detail.originalEvent);
						if (s(r)) {
							t.preventDefault();
							return;
						}
						if (Pv(r, e.get("children"))) {
							t.preventDefault();
							return;
						}
					},
					onEscapeKeyDown(t) {
						n("onEscapeKeyDown")?.(t), r.get("isSubmenu") && t.preventDefault(), Bv({ parent: e.get("parent") });
					},
					onPointerDownOutside(e) {
						n("onPointerDownOutside")?.(e);
						let t = lt(e.detail.originalEvent);
						if (s(t) && e.detail.contextmenu) {
							e.preventDefault();
							return;
						}
						o = !e.detail.focusable;
					},
					onDismiss() {
						i({
							type: "CLOSE",
							src: "interact-outside",
							restoreFocus: o
						});
					}
				});
			},
			trackPointerMove({ context: e, scope: t, send: n, refs: r }) {
				let i = r.get("parent");
				if (!i) return;
				Uv(i, !0);
				let a = t.getDoc();
				return Ne(a, "pointermove", (t) => {
					Vv(e.get("intentPolygon"), {
						x: t.clientX,
						y: t.clientY
					}) || (n({ type: "POINTER_MOVED_AWAY_FROM_SUBMENU" }), Uv(i, !1));
				});
			},
			scrollToHighlightedItem({ scope: e, computed: t }) {
				let n = () => {
					jo() !== "pointer" && Pa(e.getById(t("highlightedId")), {
						rootEl: mv(e),
						block: "nearest"
					});
				};
				return en(() => {
					Mo("virtual"), n();
				}), ga(() => mv(e), {
					defer: !0,
					attributes: ["aria-activedescendant"],
					callback: n
				});
			}
		},
		actions: {
			setAnchorPoint({ context: e, event: t }) {
				e.set("anchorPoint", (e) => Ot(e, t.point) ? e : t.point);
			},
			setSubmenuPlacement({ context: e, computed: t, refs: n }) {
				if (!e.get("isSubmenu")) return;
				let r = t("isRtl") ? "left-start" : "right-start";
				n.set("positioningOverride", {
					placement: r,
					gutter: 0
				});
			},
			reposition({ context: e, scope: t, prop: n, event: r, refs: i }) {
				let a = () => hv(t), o = r.point ?? e.get("anchorPoint"), s = o ? () => ({
					width: 0,
					height: 0,
					...o
				}) : void 0, c = {
					...n("positioning"),
					...i.get("positioningOverride")
				}, l = r.value ?? e.get("triggerValue");
				cs(() => xv(t, l), a, {
					...c,
					defer: !0,
					getAnchorRect: s,
					...r.options ?? {},
					listeners: !1,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			setOptionState({ event: e }) {
				if (!e.option) return;
				let { checked: t, onCheckedChange: n, type: r } = e.option;
				r === "radio" ? n?.(!0) : r === "checkbox" && n?.(!t);
			},
			clickHighlightedItem({ scope: e, computed: t, prop: n, context: r }) {
				let i = e.getById(t("highlightedId"));
				if (!i || i.dataset.disabled) return;
				let a = r.get("highlightedValue");
				Zt(i) ? n("navigate")?.({
					value: a,
					node: i,
					href: i.href
				}) : queueMicrotask(() => i.click());
			},
			setIntentPolygon({ context: e, scope: t, event: n }) {
				let r = mv(t), i = e.get("currentPlacement");
				if (!r || !i) return;
				let a = Rv(r.getBoundingClientRect(), i);
				if (!a) return;
				let o = Go(i) === "right" ? -5 : 5;
				e.set("intentPolygon", [{
					...n.point,
					x: n.point.x + o
				}, ...a]);
			},
			clearIntentPolygon({ context: e }) {
				e.set("intentPolygon", null);
			},
			clearAnchorPoint({ context: e }) {
				e.set("anchorPoint", null);
			},
			unlockParentOnOpen({ refs: e, context: t, scope: n }) {
				let r = e.get("parent");
				if (t.get("isSubmenu")) {
					let e = av(n);
					r?.send({
						type: "HIGHLIGHTED.SUGGEST",
						value: e
					});
				}
				Uv(r, !1);
			},
			unlockParentOnClose({ refs: e, context: t }) {
				Gv(e.get("parent"), t.get("isSubmenu"));
			},
			setHighlightedItem({ context: e, event: t }) {
				let n = t.value || fv(t.target);
				e.set("highlightedValue", n);
			},
			clearHighlightedItem({ context: e }) {
				e.set("highlightedValue", null);
			},
			focusMenu({ scope: e }) {
				en(() => {
					let t = mv(e);
					pa({
						root: t,
						enabled: !kt(t, e.getActiveElement()),
						filter(e) {
							return !e.role?.startsWith("menuitem");
						}
					})?.focus({ preventScroll: !0 });
				});
			},
			highlightFirstItem({ context: e, scope: t }) {
				(mv(t) ? queueMicrotask : en)(() => {
					let n = Cv(t);
					n && e.set("highlightedValue", fv(n));
				});
			},
			highlightLastItem({ context: e, scope: t }) {
				(mv(t) ? queueMicrotask : en)(() => {
					let n = wv(t);
					n && e.set("highlightedValue", fv(n));
				});
			},
			highlightNextItem({ context: e, scope: t, event: n, prop: r }) {
				let i = Ev(t, {
					loop: n.loop,
					value: e.get("highlightedValue"),
					loopFocus: r("loopFocus")
				});
				e.set("highlightedValue", fv(i));
			},
			highlightPrevItem({ context: e, scope: t, event: n, prop: r }) {
				let i = Dv(t, {
					loop: n.loop,
					value: e.get("highlightedValue"),
					loopFocus: r("loopFocus")
				});
				e.set("highlightedValue", fv(i));
			},
			invokeOnSelect({ context: e, prop: t, scope: n }) {
				let r = e.get("highlightedValue");
				r != null && (Mv(_v(n, r), r), t("onSelect")?.({ value: r }));
			},
			focusTrigger({ scope: e, context: t, event: n }) {
				t.get("isSubmenu") || t.get("anchorPoint") || n.restoreFocus === !1 || queueMicrotask(() => {
					xv(e, t.get("triggerValue"))?.focus({ preventScroll: !0 });
				});
			},
			highlightMatchedItem({ scope: e, context: t, event: n, refs: r }) {
				let i = Ov(e, {
					key: n.key,
					value: t.get("highlightedValue"),
					typeaheadState: r.get("typeaheadState")
				});
				i && t.set("highlightedValue", fv(i));
			},
			setParentMenu({ refs: e, event: t, context: n }) {
				e.set("parent", t.value), n.set("isSubmenu", !0);
			},
			setChildMenu({ refs: e, event: t }) {
				let n = e.get("children");
				n[t.id] = t.value, e.set("children", n);
			},
			closeSiblingMenus({ refs: e, event: t, scope: n }) {
				let r = t.target;
				if (!Av(r)) return;
				let i = r?.getAttribute("data-uid"), a = e.get("children");
				for (let e in a) {
					if (e === i) continue;
					let r = a[e], o = r.context.get("intentPolygon");
					o && t.point && zv(o, t.point) || (mv(n)?.focus({ preventScroll: !0 }), r.send({ type: "CLOSE" }));
				}
			},
			closeRootMenu({ refs: e }) {
				Bv({ parent: e.get("parent") });
			},
			openSubmenu({ refs: e, scope: t, computed: n }) {
				let r = t.getById(n("highlightedId"))?.getAttribute("data-uid"), i = e.get("children");
				(r ? i[r] : null)?.send({ type: "OPEN_AUTOFOCUS" });
			},
			focusParentMenu({ refs: e }) {
				e.get("parent")?.send({ type: "FOCUS_MENU" });
			},
			setLastHighlightedItem({ context: e, event: t }) {
				e.set("lastHighlightedValue", fv(t.target));
			},
			suggestHighlightedItem({ context: e, event: t }) {
				let n = t.value;
				if (n) {
					if (e.get("highlightedValue") != null) {
						e.set("lastHighlightedValue", n);
						return;
					}
					e.set("highlightedValue", n);
				}
			},
			restoreHighlightedItem({ context: e }) {
				let t = e.get("lastHighlightedValue");
				e.set("lastHighlightedValue", null), t && e.set("highlightedValue", t);
			},
			restoreParentHighlightedItem({ refs: e }) {
				e.get("parent")?.send({ type: "HIGHLIGHTED.RESTORE" });
			},
			invokeOnOpen({ prop: e }) {
				e("onOpenChange")?.({ open: !0 });
			},
			invokeOnClose({ prop: e }) {
				e("onOpenChange")?.({ open: !1 });
			},
			releaseParentRoutingLock({ refs: e, context: t }) {
				t.get("isSubmenu") && Kv(e.get("parent"));
			},
			toggleVisibility({ prop: e, event: t, send: n }) {
				n({
					type: e("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
					previousEvent: t
				});
			},
			setTriggerValue({ context: e, event: t }) {
				t.value !== void 0 && e.set("triggerValue", t.value);
			}
		}
	}
}), Qv = (e) => {
	let t = Nt(), n = gn(), r = _(() => {
		let r = St(e);
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = Tn(Zv, () => z(r)), a = _(() => qv(i, Wt));
	return () => ({
		api: z(a),
		service: i
	});
}, $v = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open"
]);
function ey(e, t) {
	let n = m();
	O(t, !0);
	let r = R(t, "open", 15), i = q(t, $v), a = _(() => no(i)), o = _(() => C(z(a), 2)), s = _(() => z(o)[0]), c = _(() => z(o)[1]), l = _(() => yn()(z(c), [
		"anchorPoint",
		"aria-label",
		"closeOnSelect",
		"composite",
		"defaultHighlightedValue",
		"defaultOpen",
		"defaultTriggerValue",
		"highlightedValue",
		"id",
		"ids",
		"loopFocus",
		"navigate",
		"onEscapeKeyDown",
		"onFocusOutside",
		"onHighlightChange",
		"onInteractOutside",
		"onOpenChange",
		"onPointerDownOutside",
		"onRequestDismiss",
		"onSelect",
		"onTriggerValueChange",
		"open",
		"positioning",
		"triggerValue",
		"typeahead"
	])), u = _(() => C(z(l), 2)), d = _(() => z(u)[0]), f = _(() => z(u)[1]), p = O_(), h = tv(), g = _(() => ({
		...z(d),
		id: z(d).id ?? n,
		open: r(),
		onOpenChange(e) {
			z(d).onOpenChange?.(e), r() !== void 0 && r(e.open);
		}
	})), v = Qv(() => z(g)), ee = _(() => v().api), x = _(() => v().service), S = to(() => ({
		present: z(ee).open,
		...z(s)
	}));
	T(() => {
		let e = h?.(), t = p?.();
		e && t && (t.setChild(z(x)), z(ee).setParent(e));
	});
	let w = _(() => p?.().getTriggerItemProps(z(ee)));
	nv(() => z(w)), ev(() => z(x)), D_(() => z(ee)), ro(S);
	var E = {
		get open() {
			return r();
		},
		set open(e) {
			r(e), M();
		}
	}, te = F(), ne = K(te);
	return ye(ne, () => z(f).children ?? b), I(e, te), y(E);
}
U(ey, { open: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-separator.svelte
var ty = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function ny(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, ty), i = O_(), a = _(() => X(i().getSeparatorProps(), r));
	return Q(e, Y({
		as: "div",
		"data-scope": "menu",
		"data-part": "separator"
	}, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(ny, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-trigger.svelte
var ry = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function iy(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, ry), i = _(() => yn()(r, ["value"])), a = _(() => C(z(i), 2)), o = _(() => z(a)[0]), s = _(() => z(a)[1]), c = O_(), l = rv(), u = _(() => X(c().getTriggerProps(z(o)), l?.() || {}, z(s)));
	return Q(e, Y({
		as: "button",
		"data-scope": "menu",
		"data-part": "trigger"
	}, () => z(u), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(iy, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Menu.svelte
var ay = L("<af-tooltip><!></af-tooltip>", 2), oy = ae("<svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 6 9 17l-5-5\"></path></svg>"), sy = ae("<svg viewBox=\"0 0 24 24\" width=\"8\" height=\"8\" fill=\"currentColor\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle></svg>"), cy = L("<!> ", 1), ly = L("<!> <!>", 1), uy = L("<div class=\"af-kit\"><!></div>"), dy = {
	hash: "svelte-j0sh25",
	code: "af-tooltip.svelte-j0sh25 {display:block;}af-tooltip.lock.svelte-j0sh25 {display:inline-block;}[data-scope='menu'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='menu'][data-part='content'] {display:flex;flex-direction:column;min-width:128px;max-height:var(--available-height, none);padding:4px;}[data-scope='menu'][data-part='content'][hidden] {display:none;}[data-scope='menu'][data-part='item'] {position:relative;box-sizing:border-box;display:flex;align-items:center;gap:8px;padding:6px 8px;border:0 solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 4px));outline:none;font-size:14px;line-height:20px;cursor:default;-webkit-user-select:none;user-select:none;}[data-scope='menu'][data-part='item'][data-highlighted] {background-color:var(--k-accent);color:var(--k-accent-fg);}[data-scope='menu'][data-part='item'][data-danger] {color:var(--k-danger);}[data-scope='menu'][data-part='item'][data-danger][data-highlighted] {background-color:color-mix(in oklab, var(--k-danger) calc(10% + var(--k-dark, 0) * 10%), transparent);color:var(--k-danger);}[data-scope='menu'][data-part='item'][data-tone='success'] {--k-tone: var(--k-success);}[data-scope='menu'][data-part='item'][data-tone='warning'] {--k-tone: var(--k-warning);}[data-scope='menu'][data-part='item'][data-tone='info'] {--k-tone: var(--k-info);}[data-scope='menu'][data-part='item'][data-tone] {color:color-mix(in oklab, var(--k-tone) 75%, var(--k-fg));}[data-scope='menu'][data-part='item'][data-tone][data-highlighted] {background-color:color-mix(in oklab, var(--k-tone) calc(10% + var(--k-dark, 0) * 10%), transparent);color:color-mix(in oklab, var(--k-tone) 75%, var(--k-fg));}[data-scope='menu'][data-part='item'][aria-disabled='true'] {opacity:0.5;}[data-scope='menu'][data-part='item'][data-type] {padding-inline:32px 8px;}[data-scope='menu'][data-part='item-indicator'] {position:absolute;inset-inline-start:8px;display:flex;align-items:center;justify-content:center;width:14px;height:14px;pointer-events:none;}[data-scope='menu'][data-part='item-indicator'][hidden] {display:none;}[data-scope='menu'][data-part='item-indicator'] svg {flex-shrink:0;}[data-scope='menu'][data-part='item-group-label'] {box-sizing:border-box;padding:6px 8px;border:0 solid var(--k-line);font-size:14px;line-height:20px;font-weight:500;}[data-scope='menu'][data-part='content'] > [data-scope='scroll-area'][data-part='root'] {margin-inline:-4px;}[data-scope='menu'][data-part='content'] > [data-scope='scroll-area'] > [data-part='viewport'] {padding-inline:4px;}[data-scope='menu'][data-part='separator'] {height:1px;margin:4px -4px;background-color:var(--k-line);}[data-scope='menu'][data-part='item-group'].lone {display:contents;}\n  @media (forced-colors: active) {[data-scope='menu'][data-part='item'][data-highlighted], [data-scope='menu'][data-part='item'][data-tone][data-highlighted] {forced-color-adjust:none;background-color:Highlight;color:HighlightText;}[data-scope='menu'][data-part='separator'] {forced-color-adjust:none;background-color:CanvasText;}\n  }"
};
function fy(e, r) {
	O(r, !0), ee(e, dy);
	let i = (e) => {
		var t = F(), n = K(t);
		{
			let e = _(() => o() ?? ""), t = _(() => c() ? "true" : void 0), i = _(() => c() ? x(l()) : {});
			E(n, () => iy, (n, a) => {
				a(n, Y({
					part: "trigger",
					class: "af-button ghost",
					get "aria-label"() {
						return z(e);
					},
					get "aria-disabled"() {
						return z(t);
					}
				}, () => z(i), {
					children: (e, t) => {
						var n = F(), i = K(n);
						oe(i, r, "default", {}, null), I(e, n);
					},
					$$slots: { default: !0 }
				}));
			});
		}
		I(e, t);
	}, a = R(r, "items", 23, () => []), o = R(r, "label", 7, ""), c = R(r, "disabled", 7, !1), l = R(r, "reason", 7, ""), u = r.$$host, d = B(!1), f = B(null), p = _(() => z(d) && !c());
	Te(() => {
		c() && J(d, !1);
	}), Te(() => s(z(f), z(p), u));
	let m = _(() => !!c() && !!l()), g = !1;
	V(() => {
		z(m), g = u.shadowRoot?.activeElement?.getAttribute("part") === "trigger";
	}), Te(() => {
		z(m), g && (g = !1, requestAnimationFrame(() => {
			let { activeElement: e, body: t } = u.ownerDocument;
			e && e !== t || u.shadowRoot?.querySelector("[part=\"trigger\"]")?.focus();
		}));
	});
	let x = (e) => e ? { "aria-description": e } : {}, S = [
		"success",
		"warning",
		"info",
		"danger"
	], C = (e) => e.tone && S.includes(e.tone) ? e.tone : e.danger ? "danger" : void 0, T = (e) => Array.isArray(e.items), re = _(() => (a() ?? []).flatMap((e) => T(e) ? e.items : [e]));
	function ie(e) {
		let t = z(re).find((t) => t.id === e);
		t && !t.disabled && (t.type === "checkbox" ? n(u, "select", {
			id: t.id,
			checked: !t.checked
		}) : t.type === "radio" ? n(u, "select", {
			id: t.id,
			checked: !0
		}) : n(u, "select", { id: t.id }));
	}
	let k = (e) => e.find((e) => e.type === "radio" && e.checked)?.id, A = _(() => (a() ?? []).filter((e) => !T(e) || e.items.length > 0)), ae = (e, t) => {
		let n = C(e);
		return {
			value: e.id,
			disabled: e.disabled,
			part: "item",
			"data-danger": n === "danger" ? "" : void 0,
			"data-tone": n === "danger" ? void 0 : n,
			...e.disabled ? x(e.reason) : {},
			onclickcapture: e.disabled ? void 0 : () => t(e.id)
		};
	}, j = B(null), N = !1;
	function se(e) {
		!N && e && requestAnimationFrame(() => {
			let t = [...z(j)?.querySelectorAll("[data-part=\"item\"]") ?? []].find((t) => t.dataset.value === e) ?? null;
			on({ getElement: () => t });
		});
	}
	var ce = {
		get items() {
			return a();
		},
		set items(e = []) {
			a(e), M();
		},
		get label() {
			return o();
		},
		set label(e = "") {
			o(e), M();
		},
		get disabled() {
			return c();
		},
		set disabled(e = !1) {
			c(e), M();
		},
		get reason() {
			return l();
		},
		set reason(e = "") {
			l(e), M();
		}
	}, L = ly(), le = K(L);
	t(le, {});
	var ue = W(le, 2);
	return Yt(ue, {
		value: () => u.shadowRoot,
		children: (e, t) => {
			var n = uy(), r = H(n), a = () => z(p), o = (e) => {
				c() || J(d, e, !0);
			};
			E(r, () => ey, (e, t) => {
				t(e, {
					get open() {
						return a();
					},
					set open(e) {
						o(e);
					},
					positioning: {
						strategy: "fixed",
						placement: "bottom-end"
					},
					onHighlightChange: (e) => se(e.highlightedValue),
					onSelect: (e) => ie(e.value),
					onEscapeKeyDown: (e) => {
						qn(e) && e.defaultPrevented && J(d, !1);
					},
					children: (e, t) => {
						var n = ly(), r = K(n), a = (e) => {
							var t = ay();
							te(t, 1, "lock svelte-j0sh25"), G(() => v(t, "text", l()));
							var n = H(t);
							i(n), D(t), I(e, t);
						}, o = (e) => {
							i(e);
						};
						P(r, (e) => {
							z(m) ? e(a) : e(o, -1);
						});
						var s = W(r, 2);
						E(s, () => Y_, (e, t) => {
							t(e, {
								popover: "manual",
								get ref() {
									return z(f);
								},
								set ref(e) {
									J(f, e, !0);
								},
								children: (e, t) => {
									var n = F(), r = K(n);
									E(r, () => I_, (e, t) => {
										t(e, {
											class: "af-overlay menu",
											get ref() {
												return z(j);
											},
											set ref(e) {
												J(j, e, !0);
											},
											children: (e, t) => {
												Sn(e, {
													tabStop: !1,
													children: (e, t) => {
														var n = F(), r = K(n);
														{
															let e = (e, t = b) => {
																let n = (e, t = b) => {
																	var n = F(), r = K(n);
																	E(r, () => G_, (e, n) => {
																		n(e, {
																			part: "indicator",
																			children: (e, n) => {
																				var r = F(), i = K(r), a = (e) => {
																					var t = oy();
																					I(e, t);
																				}, o = (e) => {
																					var t = sy();
																					I(e, t);
																				};
																				P(i, (e) => {
																					t() === "checkbox" ? e(a) : e(o, -1);
																				}), I(e, r);
																			},
																			$$slots: { default: !0 }
																		});
																	}), I(e, n);
																}, r = (e, r = b) => {
																	let i = _(() => ae(r(), (e) => t()().setHighlightedValue(e)));
																	var a = F(), o = K(a), s = (e) => {
																		var t = F(), a = K(t), o = () => !!r().checked;
																		E(a, () => P_, (e, t) => {
																			t(e, Y(() => z(i), {
																				get checked() {
																					return o();
																				},
																				set checked(e) {},
																				children: (e, t) => {
																					var i = cy(), a = K(i);
																					n(a, () => r().type);
																					var o = W(a, 1, !0);
																					G(() => w(o, r().label)), I(e, i);
																				},
																				$$slots: { default: !0 }
																			}));
																		}), I(e, t);
																	}, c = (e) => {
																		var t = F(), a = K(t);
																		E(a, () => $_, (e, t) => {
																			t(e, Y(() => z(i), {
																				children: (e, t) => {
																					var i = cy(), a = K(i);
																					n(a, () => r().type);
																					var o = W(a, 1, !0);
																					G(() => w(o, r().label)), I(e, i);
																				},
																				$$slots: { default: !0 }
																			}));
																		}), I(e, t);
																	}, l = (e) => {
																		var t = F(), n = K(t);
																		E(n, () => q_, (e, t) => {
																			t(e, Y(() => z(i), {
																				children: (e, t) => {
																					ne();
																					var n = fe();
																					G(() => w(n, r().label)), I(e, n);
																				},
																				$$slots: { default: !0 }
																			}));
																		}), I(e, t);
																	};
																	P(o, (e) => {
																		r().type === "checkbox" ? e(s) : r().type === "radio" ? e(c, 1) : e(l, -1);
																	}), I(e, a);
																}, i = (e, t = b) => {
																	var n = F(), i = K(n), a = (e) => {
																		var n = ay();
																		G(() => v(n, "text", t().reason ?? "")), te(n, 1, "svelte-j0sh25");
																		var i = H(n);
																		r(i, t), D(n), I(e, n);
																	}, o = (e) => {
																		r(e, t);
																	};
																	P(i, (e) => {
																		t().disabled ? e(a) : e(o, -1);
																	}), I(e, n);
																}, a = (e, t = b) => {
																	var n = ly(), r = K(n), a = (e) => {
																		var n = F(), r = K(n);
																		E(r, () => V_, (e, n) => {
																			n(e, {
																				part: "heading",
																				children: (e, n) => {
																					ne();
																					var r = fe();
																					G(() => w(r, t().heading)), I(e, r);
																				},
																				$$slots: { default: !0 }
																			});
																		}), I(e, n);
																	};
																	P(r, (e) => {
																		t().heading && e(a);
																	});
																	var o = W(r, 2);
																	h(o, 17, () => t().items, (e) => e.id, (e, t) => {
																		i(e, () => z(t));
																	}), I(e, n);
																};
																var o = F(), s = K(o);
																h(s, 19, () => z(A), (e) => T(e) ? `group:${e.id}` : `item:${e.id}`, (e, t, n) => {
																	var r = F(), o = K(r), s = (e) => {
																		var r = ly(), i = K(r), o = (e) => {
																			var t = F(), n = K(t);
																			E(n, () => ny, (e, t) => {
																				t(e, { part: "separator" });
																			}), I(e, t);
																		};
																		P(i, (e) => {
																			z(n) > 0 && e(o);
																		});
																		var s = W(i, 2), c = (e) => {
																			var n = F(), r = K(n), i = () => k(z(t).items);
																			{
																				let e = _(() => z(t).heading ? void 0 : null);
																				E(r, () => Z_, (n, r) => {
																					r(n, {
																						part: "group",
																						get value() {
																							return i();
																						},
																						set value(e) {},
																						get "aria-labelledby"() {
																							return z(e);
																						},
																						children: (e, n) => {
																							a(e, () => z(t));
																						},
																						$$slots: { default: !0 }
																					});
																				});
																			}
																			I(e, n);
																		}, l = _(() => z(t).items.some((e) => e.type === "radio")), u = (e) => {
																			var n = F(), r = K(n);
																			{
																				let e = _(() => z(t).heading ? void 0 : null);
																				E(r, () => U_, (n, r) => {
																					r(n, {
																						part: "group",
																						get "aria-labelledby"() {
																							return z(e);
																						},
																						children: (e, n) => {
																							a(e, () => z(t));
																						},
																						$$slots: { default: !0 }
																					});
																				});
																			}
																			I(e, n);
																		};
																		P(s, (e) => {
																			z(l) ? e(c) : e(u, -1);
																		}), I(e, r);
																	}, c = _(() => T(z(t))), l = (e) => {
																		var n = F(), r = K(n), a = () => z(t).checked ? z(t).id : void 0;
																		E(r, () => Z_, (e, n) => {
																			n(e, {
																				class: "lone",
																				get value() {
																					return a();
																				},
																				set value(e) {},
																				"aria-labelledby": null,
																				children: (e, n) => {
																					i(e, () => z(t));
																				},
																				$$slots: { default: !0 }
																			});
																		}), I(e, n);
																	}, u = (e) => {
																		i(e, () => z(t));
																	};
																	P(o, (e) => {
																		z(c) ? e(s) : z(t).type === "radio" ? e(l, 1) : e(u, -1);
																	}), I(e, r);
																}), I(e, o);
															};
															E(r, () => L_, (t, n) => {
																n(t, {
																	render: e,
																	$$slots: { render: !0 }
																});
															});
														}
														I(e, n);
													},
													$$slots: { default: !0 }
												});
											},
											$$slots: { default: !0 }
										});
									}), I(e, n);
								},
								$$slots: { default: !0 }
							});
						}), I(e, n);
					},
					$$slots: { default: !0 }
				});
			}), D(n), xe("pointermove", n, () => N = !0, !0), xe("keydown", n, () => N = !1, !0), I(e, n);
		},
		$$slots: { default: !0 }
	}), I(e, L), y(ce);
}
U(fy, {
	items: { type: "Array" },
	label: {
		attribute: "label",
		type: "String"
	},
	disabled: {
		attribute: "disabled",
		reflect: !0,
		type: "Boolean"
	},
	reason: {
		attribute: "reason",
		type: "String"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, ["default"], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/number-input/use-number-input-context.js
var [py, my] = Rt({
	name: "NumberInputContext",
	hookName: "useNumberInputContext",
	providerName: "<NumberInputProvider />"
}), hy = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function gy(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, hy), i = my(), a = _(() => X(i().getControlProps(), r));
	return Q(e, Y({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(gy, { ref: {} }, [], [], { mode: "open" });
var _y = ln("numberInput").parts("root", "label", "input", "control", "valueText", "incrementTrigger", "decrementTrigger", "scrubber").build();
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+number-input@1.43.3/node_modules/@zag-js/number-input/dist/cursor.mjs
function vy(e, t) {
	if (e && t.isActiveElement(e)) try {
		let { selectionStart: t, selectionEnd: n, value: r } = e;
		return t == null || n == null ? void 0 : {
			start: t,
			end: n,
			value: r
		};
	} catch {
		return;
	}
}
function yy(e, t, n) {
	if (e && n.isActiveElement(e)) {
		if (!t) {
			let t = e.value.length;
			e.setSelectionRange(t, t);
			return;
		}
		try {
			let n = e.value, { start: r, end: i, value: a } = t;
			if (n === a) {
				e.setSelectionRange(r, i);
				return;
			}
			let o = by(a, n, r), s = r === i ? o : by(a, n, i), c = Math.max(0, Math.min(o, n.length)), l = Math.max(c, Math.min(s, n.length));
			e.setSelectionRange(c, l);
		} catch {
			let t = e.value.length;
			e.setSelectionRange(t, t);
		}
	}
}
function by(e, t, n) {
	let r = e.slice(0, n), i = e.slice(n), a = 0, o = Math.min(r.length, t.length);
	for (let e = 0; e < o && r[e] === t[e]; e++) a = e + 1;
	let s = 0, c = Math.min(i.length, t.length - a);
	for (let e = 0; e < c; e++) {
		let n = i.length - 1 - e, r = t.length - 1 - e;
		if (i[n] === t[r]) s = e + 1;
		else break;
	}
	if (r.length > 0 && a >= r.length) return a;
	if (s >= i.length) return t.length - s;
	if (a > 0) return a;
	if (s > 0) return t.length - s;
	if (n === 0 && a === 0 && s === 0) return t.length;
	if (e.length > 0) {
		let r = n / e.length;
		return Math.round(r * t.length);
	}
	return t.length;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+number-input@1.43.3/node_modules/@zag-js/number-input/dist/number-input.dom.mjs
var xy = (e) => e.ids?.root ?? `number-input:${e.id}`, Sy = (e) => e.ids?.input ?? `number-input:${e.id}:input`, Cy = (e) => e.ids?.incrementTrigger ?? `number-input:${e.id}:inc`, wy = (e) => e.ids?.decrementTrigger ?? `number-input:${e.id}:dec`, Ty = (e) => e.ids?.scrubber ?? `number-input:${e.id}:scrubber`, Ey = (e) => `number-input:${e.id}:cursor`, Dy = (e) => e.ids?.label ?? `number-input:${e.id}:label`, Oy = (e) => e.getById(Sy(e)), ky = (e) => e.getById(Cy(e)), Ay = (e) => e.getById(wy(e)), jy = (e) => e.getDoc().getElementById(Ey(e)), My = (e, t) => {
	let n = null;
	return t === "increment" && (n = ky(e)), t === "decrement" && (n = Ay(e)), n;
}, Ny = (e, t) => {
	if (!Ze()) return Iy(e, t), () => {
		jy(e)?.remove();
	};
}, Py = (e) => {
	let t = e.getDoc(), n = t.documentElement, r = t.body;
	return r.style.pointerEvents = "none", n.style.userSelect = "none", n.style.cursor = "ew-resize", () => {
		r.style.pointerEvents = "", n.style.userSelect = "", n.style.cursor = "", n.style.length || n.removeAttribute("style"), r.style.length || r.removeAttribute("style");
	};
}, Fy = (e, t) => {
	let { point: n, isRtl: r, event: i } = t, a = e.getWin(), o = ot(i.movementX, a.devicePixelRatio), s = ot(i.movementY, a.devicePixelRatio), c = o > 0 ? "increment" : o < 0 ? "decrement" : null;
	r && c === "increment" && (c = "decrement"), r && c === "decrement" && (c = "increment");
	let l = {
		x: n.x + o,
		y: n.y + s
	}, u = a.innerWidth, d = ot(7.5, a.devicePixelRatio);
	return l.x = We(l.x + d, u) - d, {
		hint: c,
		point: l
	};
}, Iy = (e, t) => {
	let n = e.getDoc(), r = n.createElement("div");
	r.className = "scrubber--cursor", r.id = Ey(e), Object.assign(r.style, {
		width: "15px",
		height: "15px",
		position: "fixed",
		pointerEvents: "none",
		left: "0px",
		top: "0px",
		zIndex: Gt,
		transform: t ? `translate3d(${t.x}px, ${t.y}px, 0px)` : void 0,
		willChange: "transform"
	}), r.innerHTML = "\n      <svg width=\"46\" height=\"15\" style=\"left: -15.5px; position: absolute; top: 0; filter: drop-shadow(rgba(0, 0, 0, 0.4) 0px 1px 1.1px);\">\n        <g transform=\"translate(2 3)\">\n          <path fill-rule=\"evenodd\" d=\"M 15 4.5L 15 2L 11.5 5.5L 15 9L 15 6.5L 31 6.5L 31 9L 34.5 5.5L 31 2L 31 4.5Z\" style=\"stroke-width: 2px; stroke: white;\"></path>\n          <path fill-rule=\"evenodd\" d=\"M 15 4.5L 15 2L 11.5 5.5L 15 9L 15 6.5L 31 6.5L 31 9L 34.5 5.5L 31 2L 31 4.5Z\"></path>\n        </g>\n      </svg>", n.body.appendChild(r);
}, Ly = {
	incrementLabel: "increment value",
	decrementLabel: "decrease value"
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+number-input@1.43.3/node_modules/@zag-js/number-input/dist/number-input.connect.mjs
function Ry(e, t) {
	let { state: n, send: r, prop: i, scope: a, computed: o } = e, s = n.hasTag("focus"), c = o("isDisabled"), l = !!i("readOnly"), u = !!i("required"), d = n.matches("scrubbing"), f = o("isValueEmpty"), p = i("invalid") === void 0 ? o("isOutOfRange") : !!i("invalid"), m = c || !o("canIncrement") || l, h = c || !o("canDecrement") || l, g = He(Ly, i("translations"));
	return {
		focused: s,
		invalid: p,
		empty: f,
		value: o("formattedValue"),
		valueAsNumber: o("valueAsNumber"),
		setValue(e) {
			r({
				type: "VALUE.SET",
				value: e
			});
		},
		clearValue() {
			r({ type: "VALUE.CLEAR" });
		},
		increment() {
			r({ type: "VALUE.INCREMENT" });
		},
		decrement() {
			r({ type: "VALUE.DECREMENT" });
		},
		setToMax() {
			r({
				type: "VALUE.SET",
				value: i("max")
			});
		},
		setToMin() {
			r({
				type: "VALUE.SET",
				value: i("min")
			});
		},
		focus() {
			Oy(a)?.focus();
		},
		getRootProps() {
			return t.element({
				id: xy(a),
				..._y.root.attrs,
				dir: i("dir"),
				"data-disabled": Z(c),
				"data-focus": Z(s),
				"data-invalid": Z(p),
				"data-scrubbing": Z(d)
			});
		},
		getLabelProps() {
			return t.label({
				..._y.label.attrs,
				dir: i("dir"),
				"data-disabled": Z(c),
				"data-focus": Z(s),
				"data-invalid": Z(p),
				"data-required": Z(u),
				"data-scrubbing": Z(d),
				id: Dy(a),
				htmlFor: Sy(a),
				onClick() {
					en(() => {
						ki(Oy(a));
					});
				}
			});
		},
		getControlProps() {
			return t.element({
				..._y.control.attrs,
				dir: i("dir"),
				role: "group",
				"aria-disabled": c,
				"data-focus": Z(s),
				"data-disabled": Z(c),
				"data-invalid": Z(p),
				"data-scrubbing": Z(d),
				"aria-invalid": pn(p)
			});
		},
		getValueTextProps() {
			return t.element({
				..._y.valueText.attrs,
				dir: i("dir"),
				"data-disabled": Z(c),
				"data-invalid": Z(p),
				"data-focus": Z(s),
				"data-scrubbing": Z(d)
			});
		},
		getInputProps() {
			return t.input({
				..._y.input.attrs,
				dir: i("dir"),
				name: i("name"),
				form: i("form"),
				id: Sy(a),
				role: "spinbutton",
				defaultValue: o("formattedValue"),
				pattern: i("formatOptions") ? void 0 : i("pattern"),
				inputMode: i("inputMode"),
				"aria-invalid": pn(p),
				"data-invalid": Z(p),
				disabled: c,
				"data-disabled": Z(c),
				readOnly: l,
				required: i("required"),
				autoComplete: "off",
				autoCorrect: "off",
				spellCheck: "false",
				type: "text",
				"aria-roledescription": "numberfield",
				"aria-valuemin": i("min"),
				"aria-valuemax": i("max"),
				"aria-valuenow": Number.isNaN(o("valueAsNumber")) ? void 0 : o("valueAsNumber"),
				"aria-valuetext": o("valueText"),
				"data-scrubbing": Z(d),
				onFocus() {
					r({ type: "INPUT.FOCUS" });
				},
				onBlur() {
					r({ type: "INPUT.BLUR" });
				},
				onInput(e) {
					let t = vy(e.currentTarget, a);
					r({
						type: "INPUT.CHANGE",
						target: e.currentTarget,
						hint: "set",
						selection: t
					});
				},
				onBeforeInput(e) {
					try {
						let { selectionStart: t, selectionEnd: n, value: r } = e.currentTarget, i = r.slice(0, t) + (e.data ?? "") + r.slice(n);
						o("parser").isValidPartialNumber(i) || e.preventDefault();
					} catch {}
				},
				onKeyDown(e) {
					if (e.defaultPrevented || l || Ye(e)) return;
					let t = at(e, {
						step: i("step"),
						largeStep: i("largeStep"),
						smallStep: i("smallStep")
					}), n = {
						ArrowUp() {
							r({
								type: "INPUT.ARROW_UP",
								step: t
							}), e.preventDefault();
						},
						ArrowDown() {
							r({
								type: "INPUT.ARROW_DOWN",
								step: t
							}), e.preventDefault();
						},
						Home() {
							Fe(e) || (r({ type: "INPUT.HOME" }), e.preventDefault());
						},
						End() {
							Fe(e) || (r({ type: "INPUT.END" }), e.preventDefault());
						},
						Enter(e) {
							let t = vy(e.currentTarget, a);
							r({
								type: "INPUT.ENTER",
								selection: t
							});
						}
					}[e.key];
					n?.(e);
				}
			});
		},
		getDecrementTriggerProps() {
			return t.button({
				..._y.decrementTrigger.attrs,
				dir: i("dir"),
				id: wy(a),
				disabled: h,
				"data-disabled": Z(h),
				"aria-label": g.decrementLabel,
				type: "button",
				tabIndex: -1,
				"aria-controls": Sy(a),
				"data-scrubbing": Z(d),
				onPointerDown(e) {
					h || Fn(e) && (r({
						type: "TRIGGER.PRESS_DOWN",
						hint: "decrement",
						pointerType: e.pointerType
					}), e.pointerType === "mouse" && e.preventDefault(), e.pointerType === "touch" && e.currentTarget?.focus({ preventScroll: !0 }));
				},
				onPointerUp(e) {
					r({
						type: "TRIGGER.PRESS_UP",
						hint: "decrement",
						pointerType: e.pointerType
					});
				},
				onPointerLeave() {
					h || r({
						type: "TRIGGER.PRESS_UP",
						hint: "decrement"
					});
				}
			});
		},
		getIncrementTriggerProps() {
			return t.button({
				..._y.incrementTrigger.attrs,
				dir: i("dir"),
				id: Cy(a),
				disabled: m,
				"data-disabled": Z(m),
				"aria-label": g.incrementLabel,
				type: "button",
				tabIndex: -1,
				"aria-controls": Sy(a),
				"data-scrubbing": Z(d),
				onPointerDown(e) {
					!m && Fn(e) && (r({
						type: "TRIGGER.PRESS_DOWN",
						hint: "increment",
						pointerType: e.pointerType
					}), e.pointerType === "mouse" && e.preventDefault(), e.pointerType === "touch" && e.currentTarget?.focus({ preventScroll: !0 }));
				},
				onPointerUp(e) {
					r({
						type: "TRIGGER.PRESS_UP",
						hint: "increment",
						pointerType: e.pointerType
					});
				},
				onPointerLeave(e) {
					r({
						type: "TRIGGER.PRESS_UP",
						hint: "increment",
						pointerType: e.pointerType
					});
				}
			});
		},
		getScrubberProps() {
			return t.element({
				..._y.scrubber.attrs,
				dir: i("dir"),
				"data-disabled": Z(c),
				id: Ty(a),
				role: "presentation",
				"data-scrubbing": Z(d),
				onMouseDown(e) {
					if (c || !Fn(e)) return;
					let t = rt(e), n = cn(e.currentTarget).devicePixelRatio;
					t.x -= ot(7.5, n), t.y -= ot(7.5, n), r({
						type: "SCRUBBER.PRESS_DOWN",
						point: t
					}), e.preventDefault(), en(() => {
						ki(Oy(a));
					});
				},
				style: { cursor: c ? void 0 : "ew-resize" }
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+number@3.6.7/node_modules/@internationalized/number/dist/private/NumberFormatter.mjs
var zy = /* @__PURE__ */ new Map(), By = !1;
try {
	By = new Intl.NumberFormat("de-DE", { signDisplay: "exceptZero" }).resolvedOptions().signDisplay === "exceptZero";
} catch {}
var Vy = !1;
try {
	Vy = new Intl.NumberFormat("de-DE", {
		style: "unit",
		unit: "degree"
	}).resolvedOptions().style === "unit";
} catch {}
var Hy = { degree: { narrow: {
	default: "°",
	"ja-JP": " 度",
	"zh-TW": "度",
	"sl-SI": " °"
} } }, Uy = class {
	constructor(e, t = {}) {
		this.numberFormatter = Wy(e, t), this.options = t;
	}
	format(e) {
		let t = "";
		if (t = !By && this.options.signDisplay != null ? Gy(this.numberFormatter, this.options.signDisplay, e) : this.numberFormatter.format(e), this.options.style === "unit" && !Vy) {
			let { unit: e, unitDisplay: n = "short", locale: r } = this.resolvedOptions();
			if (!e) return t;
			let i = Hy[e]?.[n];
			t += i[r] || i.default;
		}
		return t;
	}
	formatToParts(e) {
		return this.numberFormatter.formatToParts(e);
	}
	formatRange(e, t) {
		if (typeof this.numberFormatter.formatRange == "function") return this.numberFormatter.formatRange(e, t);
		if (t < e) throw RangeError("End date must be >= start date");
		return `${this.format(e)} \u{2013} ${this.format(t)}`;
	}
	formatRangeToParts(e, t) {
		if (typeof this.numberFormatter.formatRangeToParts == "function") return this.numberFormatter.formatRangeToParts(e, t);
		if (t < e) throw RangeError("End date must be >= start date");
		let n = this.numberFormatter.formatToParts(e), r = this.numberFormatter.formatToParts(t);
		return [
			...n.map((e) => ({
				...e,
				source: "startRange"
			})),
			{
				type: "literal",
				value: " – ",
				source: "shared"
			},
			...r.map((e) => ({
				...e,
				source: "endRange"
			}))
		];
	}
	resolvedOptions() {
		let e = this.numberFormatter.resolvedOptions();
		return !By && this.options.signDisplay != null && (e = {
			...e,
			signDisplay: this.options.signDisplay
		}), !Vy && this.options.style === "unit" && (e = {
			...e,
			style: "unit",
			unit: this.options.unit,
			unitDisplay: this.options.unitDisplay
		}), e;
	}
};
function Wy(e, t = {}) {
	let { numberingSystem: n } = t;
	if (n && e.includes("-nu-") && (e.includes("-u-") || (e += "-u-"), e += `-nu-${n}`), t.style === "unit" && !Vy) {
		let { unit: e, unitDisplay: n = "short" } = t;
		if (!e) throw Error("unit option must be provided with style: \"unit\"");
		if (!Hy[e]?.[n]) throw Error(`Unsupported unit ${e} with unitDisplay = ${n}`);
		t = {
			...t,
			style: "decimal"
		};
	}
	let r = e + (t ? Object.entries(t).sort((e, t) => e[0] < t[0] ? -1 : 1).join() : "");
	if (zy.has(r)) return zy.get(r);
	let i = new Intl.NumberFormat(e, t);
	return zy.set(r, i), i;
}
function Gy(e, t, n) {
	if (t === "auto") return e.format(n);
	if (t === "never") return e.format(Math.abs(n));
	{
		let r = !1;
		if (t === "always" ? r = n > 0 || Object.is(n, 0) : t === "exceptZero" && (Object.is(n, -0) || Object.is(n, 0) ? n = Math.abs(n) : r = n > 0), r) {
			let t = e.format(-n), r = e.format(n), i = t.replace(r, "").replace(/\u200e|\u061C/, "");
			return [...i].length !== 1 && console.warn("@react-aria/i18n polyfill for NumberFormat signDisplay: Unsupported case"), t.replace(r, "!!!").replace(i, "+").replace("!!!", r);
		}
		return e.format(n);
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+number@3.6.7/node_modules/@internationalized/number/dist/private/NumberParser.mjs
var Ky = /* @__PURE__ */ RegExp("^.*\\(.*\\).*$"), qy = [
	"latn",
	"arab",
	"hanidec",
	"deva",
	"beng",
	"fullwide"
], Jy = class {
	constructor(e, t = {}) {
		this.locale = e, this.options = t;
	}
	parse(e) {
		return Xy(this.locale, this.options, e).parse(e);
	}
	isValidPartialNumber(e, t, n) {
		return Xy(this.locale, this.options, e).isValidPartialNumber(e, t, n);
	}
	getNumberingSystem(e) {
		return Xy(this.locale, this.options, e).options.numberingSystem;
	}
}, Yy = /* @__PURE__ */ new Map();
function Xy(e, t, n) {
	let r = Zy(e, t);
	if (!e.includes("-nu-") && !r.isValidPartialNumber(n)) {
		for (let i of qy) if (i !== r.options.numberingSystem) {
			let r = Zy(e + (e.includes("-u-") ? "-nu-" : "-u-nu-") + i, t);
			if (r.isValidPartialNumber(n)) return r;
		}
	}
	return r;
}
function Zy(e, t) {
	let n = e + (t ? Object.entries(t).sort((e, t) => e[0] < t[0] ? -1 : 1).join() : ""), r = Yy.get(n);
	return r || (r = new Qy(e, t), Yy.set(n, r)), r;
}
var Qy = class {
	constructor(e, t = {}) {
		this.locale = e, t.roundingIncrement !== 1 && t.roundingIncrement != null && (t.maximumFractionDigits == null && t.minimumFractionDigits == null ? (t.maximumFractionDigits = 0, t.minimumFractionDigits = 0) : t.maximumFractionDigits == null ? t.maximumFractionDigits = t.minimumFractionDigits : t.minimumFractionDigits ??= t.maximumFractionDigits), this.formatter = new Intl.NumberFormat(e, t), this.options = this.formatter.resolvedOptions(), this.symbols = tb(e, this.formatter, this.options, t), this.options.style === "percent" && ((this.options.minimumFractionDigits ?? 0) > 18 || (this.options.maximumFractionDigits ?? 0) > 18) && console.warn("NumberParser cannot handle percentages with greater than 18 decimal places, please reduce the number in your options.");
	}
	parse(e) {
		let t = this.formatter.resolvedOptions().useGrouping, n = this.sanitize(e);
		if (!t && this.symbols.group && n.includes(this.symbols.group)) return NaN;
		if (this.symbols.group && (n = n.replaceAll(this.symbols.group, "")), this.symbols.decimal && (n = n.replace(this.symbols.decimal, ".")), this.symbols.minusSign && (n = n.replace(this.symbols.minusSign, "-")), n = n.replace(this.symbols.numeral, this.symbols.index), this.options.style === "percent") {
			let e = n.indexOf("-");
			n = n.replace("-", ""), n = n.replace("+", "");
			let t = n.indexOf(".");
			t === -1 && (t = n.length), n = n.replace(".", ""), n = t - 2 == 0 ? `0.${n}` : t - 2 == -1 ? `0.0${n}` : t - 2 == -2 ? "0.00" : `${n.slice(0, t - 2)}.${n.slice(t - 2)}`, e > -1 && (n = `-${n}`);
		}
		let r = n ? +n : NaN;
		if (isNaN(r)) return NaN;
		if (this.options.style === "percent") {
			let e = {
				...this.options,
				style: "decimal",
				minimumFractionDigits: Math.min((this.options.minimumFractionDigits ?? 0) + 2, 20),
				maximumFractionDigits: Math.min((this.options.maximumFractionDigits ?? 0) + 2, 20)
			};
			return new Jy(this.locale, e).parse(new Uy(this.locale, e).format(r));
		}
		return this.options.currencySign === "accounting" && Ky.test(e) && (r = -1 * r), r;
	}
	sanitize(e) {
		let t = this.formatter.resolvedOptions().useGrouping;
		return this.symbols.noNumeralUnits.length > 0 && this.symbols.noNumeralUnits.find((t) => t.unit === e) ? this.symbols.noNumeralUnits.find((t) => t.unit === e).value.toString() : (e = e.replace(this.symbols.literals, ""), this.symbols.minusSign && (e = e.replace("-", this.symbols.minusSign)), this.options.numberingSystem === "arab" && (this.symbols.decimal && (e = nb(e, ",", this.symbols.decimal), e = nb(e, "،", this.symbols.decimal)), this.symbols.group && t && (e = nb(e, ".", this.symbols.group))), this.symbols.group === "’" && e.includes("'") && t && (e = nb(e, "'", this.symbols.group)), this.symbols.group === "'" && e.includes("’") && t && (e = nb(e, "’", this.symbols.group)), this.options.locale === "fr-FR" && this.symbols.group && t && (e = nb(e, " ", this.symbols.group), e = nb(e, /\u00A0/g, this.symbols.group)), e);
	}
	isValidPartialNumber(e, t = -Infinity, n = Infinity) {
		let r = this.formatter.resolvedOptions().useGrouping;
		return e = this.sanitize(e), this.symbols.minusSign && e.startsWith(this.symbols.minusSign) && t < 0 ? e = e.slice(this.symbols.minusSign.length) : this.symbols.plusSign && e.startsWith(this.symbols.plusSign) && n > 0 && (e = e.slice(this.symbols.plusSign.length)), this.symbols.decimal && e.indexOf(this.symbols.decimal) > -1 && this.options.maximumFractionDigits === 0 ? !1 : (this.symbols.group && r && (e = nb(e, this.symbols.group, "")), e = e.replace(this.symbols.numeral, ""), this.symbols.decimal && (e = e.replace(this.symbols.decimal, "")), e.length === 0);
	}
}, $y = /* @__PURE__ */ new Set([
	"decimal",
	"fraction",
	"integer",
	"minusSign",
	"plusSign",
	"group"
]), eb = [
	0,
	4,
	2,
	1,
	11,
	20,
	3,
	7,
	100,
	21,
	.1,
	1.1
];
function tb(e, t, n, r) {
	let i = new Intl.NumberFormat(e, {
		...n,
		minimumSignificantDigits: 1,
		maximumSignificantDigits: 21,
		roundingIncrement: 1,
		roundingPriority: "auto",
		roundingMode: "halfExpand",
		useGrouping: !0
	}), a = i.formatToParts(-10000.111), o = i.formatToParts(10000.111), s = eb.map((e) => i.formatToParts(e)), c = s.map((e, t) => {
		let n = e.find((e) => e.type === "unit");
		return n && !e.some((e) => e.type === "integer" || e.type === "fraction") ? {
			unit: n.value,
			value: eb[t]
		} : null;
	}).filter((e) => !!e), l = a.find((e) => e.type === "minusSign")?.value ?? "-", u = o.find((e) => e.type === "plusSign")?.value;
	!u && (r?.signDisplay === "exceptZero" || r?.signDisplay === "always") && (u = "+");
	let d = new Intl.NumberFormat(e, {
		...n,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).formatToParts(.001).find((e) => e.type === "decimal")?.value, f = a.find((e) => e.type === "group")?.value, p = a.filter((e) => !$y.has(e.type)).map((e) => rb(e.value)), m = s.flatMap((e) => e.filter((e) => !$y.has(e.type)).map((e) => rb(e.value))), h = [.../* @__PURE__ */ new Set([...p, ...m])].sort((e, t) => t.length - e.length), g = h.length === 0 ? /* @__PURE__ */ RegExp("\\p{White_Space}|\\p{Cf}", "gu") : RegExp(`${h.join("|")}|\\p{White_Space}|\\p{Cf}`, "gu"), _ = [...new Intl.NumberFormat(n.locale, { useGrouping: !1 }).format(9876543210)].reverse(), v = new Map(_.map((e, t) => [e, t])), y = RegExp(`[${_.join("")}]`, "g");
	return {
		minusSign: l,
		plusSign: u,
		decimal: d,
		group: f,
		literals: g,
		numeral: y,
		numerals: _,
		index: (e) => String(v.get(e)),
		noNumeralUnits: c
	};
}
function nb(e, t, n) {
	return e.replaceAll ? e.replaceAll(t, n) : e.split(t).join(n);
}
function rb(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+number-input@1.43.3/node_modules/@zag-js/number-input/dist/number-input.utils.mjs
var ib = (e, t = {}) => new Intl.NumberFormat(e, t), ab = (e, t = {}) => new Jy(e, t), ob = (e, t) => {
	let { prop: n, computed: r } = t;
	return n("formatOptions") ? e === "" ? NaN : r("parser").parse(e) : parseFloat(e);
}, sb = (e, t) => {
	let { prop: n, computed: r } = t;
	return Number.isNaN(e) ? "" : n("formatOptions") ? r("formatter").format(e) : e.toString();
}, cb = (e, t) => {
	let n = e !== void 0 && !Number.isNaN(e) ? e : 1;
	return t?.style === "percent" && (e === void 0 || Number.isNaN(e)) && (n = .01), n;
}, { choose: lb, guards: ub, createMachine: db } = Lt(), { not: fb, and: pb } = ub, mb = db({
	props({ props: e }) {
		let t = cb(e.step, e.formatOptions);
		return {
			dir: "ltr",
			locale: "en-US",
			focusInputOnChange: !0,
			clampValueOnBlur: !e.allowOverflow,
			allowOverflow: !1,
			inputMode: "decimal",
			pattern: "-?[0-9]*(.[0-9]+)?",
			defaultValue: "",
			step: t,
			min: -(2 ** 53 - 1),
			max: 2 ** 53 - 1,
			spinOnPress: !0,
			...e,
			largeStep: e.largeStep ?? 10 * t,
			smallStep: e.smallStep ?? t / 10
		};
	},
	initialState() {
		return "idle";
	},
	context({ prop: e, bindable: t, getComputed: n }) {
		return {
			value: t(() => ({
				defaultValue: e("defaultValue"),
				value: e("value"),
				onChange(t) {
					let r = ob(t, {
						computed: n(),
						prop: e
					});
					e("onValueChange")?.({
						value: t,
						valueAsNumber: r
					});
				}
			})),
			hint: t(() => ({ defaultValue: null })),
			scrubberCursorPoint: t(() => ({
				defaultValue: null,
				hash(e) {
					return e ? `x:${e.x}, y:${e.y}` : "";
				}
			})),
			fieldsetDisabled: t(() => ({ defaultValue: !1 }))
		};
	},
	computed: {
		isRtl: ({ prop: e }) => e("dir") === "rtl",
		valueAsNumber: ({ context: e, computed: t, prop: n }) => ob(e.get("value"), {
			computed: t,
			prop: n
		}),
		formattedValue: ({ computed: e, prop: t }) => sb(e("valueAsNumber"), {
			computed: e,
			prop: t
		}),
		isAtMin: ({ computed: e, prop: t }) => $t(e("valueAsNumber"), t("min")),
		isAtMax: ({ computed: e, prop: t }) => Pe(e("valueAsNumber"), t("max")),
		isOutOfRange: ({ computed: e, prop: t }) => !it(e("valueAsNumber"), t("min"), t("max")),
		isValueEmpty: ({ context: e }) => e.get("value") === "",
		isDisabled: ({ prop: e, context: t }) => !!e("disabled") || t.get("fieldsetDisabled"),
		canIncrement: ({ prop: e, computed: t }) => e("allowOverflow") || !t("isAtMax"),
		canDecrement: ({ prop: e, computed: t }) => e("allowOverflow") || !t("isAtMin"),
		valueText: ({ prop: e, context: t }) => He(Ly, e("translations")).valueText?.(t.get("value")),
		formatter: Oi(({ prop: e }) => [e("locale"), e("formatOptions")], ([e, t]) => ib(e, t)),
		parser: Oi(({ prop: e }) => [e("locale"), e("formatOptions")], ([e, t]) => ab(e, t))
	},
	watch({ track: e, action: t, context: n, computed: r, prop: i }) {
		e([
			() => n.get("value"),
			() => i("locale"),
			() => JSON.stringify(i("formatOptions"))
		], () => {
			t(["syncInputElement"]);
		}), e([() => r("isOutOfRange")], () => {
			t(["invokeOnInvalid"]);
		}), e([() => n.hash("scrubberCursorPoint")], () => {
			t(["setVirtualCursorPosition"]);
		});
	},
	effects: ["trackFormControl"],
	on: {
		"VALUE.SET": { actions: ["setRawValue"] },
		"VALUE.CLEAR": { actions: ["clearValue"] },
		"VALUE.INCREMENT": { actions: ["increment"] },
		"VALUE.DECREMENT": { actions: ["decrement"] }
	},
	states: {
		idle: { on: {
			"TRIGGER.PRESS_DOWN": [{
				guard: "isTouchPointer",
				target: "before:spin",
				actions: ["setHint"]
			}, {
				target: "before:spin",
				actions: [
					"focusInput",
					"invokeOnFocus",
					"setHint"
				]
			}],
			"SCRUBBER.PRESS_DOWN": {
				target: "scrubbing",
				actions: [
					"focusInput",
					"invokeOnFocus",
					"setHint",
					"setCursorPoint"
				]
			},
			"INPUT.FOCUS": {
				target: "focused",
				actions: ["focusInput", "invokeOnFocus"]
			}
		} },
		focused: {
			tags: ["focus"],
			effects: ["attachWheelListener"],
			on: {
				"TRIGGER.PRESS_DOWN": [{
					guard: "isTouchPointer",
					target: "before:spin",
					actions: ["setHint"]
				}, {
					target: "before:spin",
					actions: ["focusInput", "setHint"]
				}],
				"SCRUBBER.PRESS_DOWN": {
					target: "scrubbing",
					actions: [
						"focusInput",
						"setHint",
						"setCursorPoint"
					]
				},
				"INPUT.ARROW_UP": { actions: ["increment"] },
				"INPUT.ARROW_DOWN": { actions: ["decrement"] },
				"INPUT.HOME": { actions: ["decrementToMin"] },
				"INPUT.END": { actions: ["incrementToMax"] },
				"INPUT.CHANGE": { actions: ["setValue", "setHint"] },
				"INPUT.BLUR": [
					{
						guard: pb("clampValueOnBlur", fb("isValueEmpty"), fb("isInRange")),
						target: "idle",
						actions: [
							"setClampedValue",
							"clearHint",
							"invokeOnBlur",
							"invokeOnValueCommit"
						]
					},
					{
						guard: fb("isInRange"),
						target: "idle",
						actions: [
							"setFormattedValue",
							"clearHint",
							"invokeOnBlur",
							"invokeOnInvalid",
							"invokeOnValueCommit"
						]
					},
					{
						target: "idle",
						actions: [
							"setFormattedValue",
							"clearHint",
							"invokeOnBlur",
							"invokeOnValueCommit"
						]
					}
				],
				"INPUT.ENTER": { actions: [
					"setFormattedValue",
					"clearHint",
					"invokeOnBlur",
					"invokeOnValueCommit"
				] }
			}
		},
		"before:spin": {
			tags: ["focus"],
			effects: ["trackButtonDisabled", "waitForChangeDelay"],
			entry: lb([{
				guard: "isIncrementHint",
				actions: ["increment"]
			}, {
				guard: "isDecrementHint",
				actions: ["decrement"]
			}]),
			on: {
				CHANGE_DELAY: {
					target: "spinning",
					guard: pb("isInRange", "spinOnPress")
				},
				"TRIGGER.PRESS_UP": [{
					guard: "isTouchPointer",
					target: "focused",
					actions: ["clearHint"]
				}, {
					target: "focused",
					actions: ["focusInput", "clearHint"]
				}]
			}
		},
		spinning: {
			tags: ["focus"],
			effects: ["trackButtonDisabled", "spinValue"],
			on: {
				SPIN: [{
					guard: "isIncrementHint",
					actions: ["increment"]
				}, {
					guard: "isDecrementHint",
					actions: ["decrement"]
				}],
				"TRIGGER.PRESS_UP": {
					target: "focused",
					actions: ["focusInput", "clearHint"]
				}
			}
		},
		scrubbing: {
			tags: ["focus"],
			effects: [
				"activatePointerLock",
				"trackMousemove",
				"setupVirtualCursor",
				"preventTextSelection"
			],
			on: {
				"SCRUBBER.POINTER_UP": {
					target: "focused",
					actions: ["focusInput", "clearCursorPoint"]
				},
				"SCRUBBER.POINTER_MOVE": [{
					guard: "isIncrementHint",
					actions: ["increment", "setCursorPoint"]
				}, {
					guard: "isDecrementHint",
					actions: ["decrement", "setCursorPoint"]
				}]
			}
		}
	},
	implementations: {
		guards: {
			clampValueOnBlur: ({ prop: e }) => e("clampValueOnBlur"),
			spinOnPress: ({ prop: e }) => !!e("spinOnPress"),
			isInRange: ({ computed: e }) => !e("isOutOfRange"),
			isValueEmpty: ({ computed: e }) => e("isValueEmpty"),
			isDecrementHint: ({ context: e, event: t }) => (t.hint ?? e.get("hint")) === "decrement",
			isIncrementHint: ({ context: e, event: t }) => (t.hint ?? e.get("hint")) === "increment",
			isTouchPointer: ({ event: e }) => e.pointerType === "touch"
		},
		effects: {
			waitForChangeDelay({ send: e }) {
				let t = setTimeout(() => {
					e({ type: "CHANGE_DELAY" });
				}, 300);
				return () => clearTimeout(t);
			},
			spinValue({ send: e }) {
				let t = setInterval(() => {
					e({ type: "SPIN" });
				}, 50);
				return () => clearInterval(t);
			},
			trackFormControl({ context: e, scope: t }) {
				return qi(Oy(t), {
					onFieldsetDisabledChange(t) {
						e.set("fieldsetDisabled", t);
					},
					onFormReset() {
						e.set("value", e.initial("value"));
					}
				});
			},
			setupVirtualCursor({ context: e, scope: t }) {
				return Ny(t, e.get("scrubberCursorPoint"));
			},
			preventTextSelection({ scope: e }) {
				return Py(e);
			},
			trackButtonDisabled({ context: e, scope: t, send: n }) {
				return ga(My(t, e.get("hint")), {
					attributes: ["disabled"],
					callback() {
						n({
							type: "TRIGGER.PRESS_UP",
							src: "attr"
						});
					}
				});
			},
			attachWheelListener({ scope: e, send: t, prop: n }) {
				let r = Oy(e);
				if (!r || !e.isActiveElement(r) || !n("allowMouseWheel")) return;
				function i(e) {
					e.preventDefault();
					let n = Math.sign(e.deltaY) * -1;
					n === 1 ? t({ type: "VALUE.INCREMENT" }) : n === -1 && t({ type: "VALUE.DECREMENT" });
				}
				return Ne(r, "wheel", i, { passive: !1 });
			},
			activatePointerLock({ scope: e }) {
				if (!Ze()) return Ea(e.getDoc());
			},
			trackMousemove({ scope: e, send: t, context: n, computed: r }) {
				let i = e.getDoc();
				function a(i) {
					let a = Fy(e, {
						point: n.get("scrubberCursorPoint"),
						isRtl: r("isRtl"),
						event: i
					});
					a.hint && t({
						type: "SCRUBBER.POINTER_MOVE",
						hint: a.hint,
						point: a.point
					});
				}
				function o() {
					t({ type: "SCRUBBER.POINTER_UP" });
				}
				return Xe(Ne(i, "mousemove", a, !1), Ne(i, "mouseup", o, !1));
			}
		},
		actions: {
			focusInput({ scope: e, prop: t }) {
				if (!t("focusInputOnChange")) return;
				let n = Oy(e);
				e.isActiveElement(n) || en(() => n?.focus({ preventScroll: !0 }));
			},
			increment({ context: e, event: t, prop: n, computed: r }) {
				let i = tn(r("valueAsNumber"), t.step ?? n("step"));
				n("allowOverflow") || (i = Be(i, n("min"), n("max"))), e.set("value", sb(i, {
					computed: r,
					prop: n
				}));
			},
			decrement({ context: e, event: t, prop: n, computed: r }) {
				let i = ct(r("valueAsNumber"), t.step ?? n("step"));
				n("allowOverflow") || (i = Be(i, n("min"), n("max"))), e.set("value", sb(i, {
					computed: r,
					prop: n
				}));
			},
			setClampedValue({ context: e, prop: t, computed: n }) {
				let r = Be(n("valueAsNumber"), t("min"), t("max"));
				e.set("value", sb(r, {
					computed: n,
					prop: t
				}));
			},
			setRawValue({ context: e, event: t, prop: n, computed: r }) {
				let i = typeof t.value == "number" ? t.value : ob(t.value, {
					computed: r,
					prop: n
				});
				n("allowOverflow") || (i = Be(i, n("min"), n("max"))), e.set("value", sb(i, {
					computed: r,
					prop: n
				}));
			},
			setValue({ context: e, event: t }) {
				let n = t.target?.value ?? t.value;
				e.set("value", n);
			},
			clearValue({ context: e }) {
				e.set("value", "");
			},
			incrementToMax({ context: e, prop: t, computed: n }) {
				let r = sb(t("max"), {
					computed: n,
					prop: t
				});
				e.set("value", r);
			},
			decrementToMin({ context: e, prop: t, computed: n }) {
				let r = sb(t("min"), {
					computed: n,
					prop: t
				});
				e.set("value", r);
			},
			setHint({ context: e, event: t }) {
				e.set("hint", t.hint);
			},
			clearHint({ context: e }) {
				e.set("hint", null);
			},
			invokeOnFocus({ computed: e, prop: t }) {
				t("onFocusChange")?.({
					focused: !0,
					value: e("formattedValue"),
					valueAsNumber: e("valueAsNumber")
				});
			},
			invokeOnBlur({ computed: e, prop: t }) {
				t("onFocusChange")?.({
					focused: !1,
					value: e("formattedValue"),
					valueAsNumber: e("valueAsNumber")
				});
			},
			invokeOnInvalid({ computed: e, prop: t, event: n }) {
				if (n.type === "INPUT.CHANGE") return;
				let r = e("valueAsNumber") > t("max") ? "rangeOverflow" : "rangeUnderflow";
				t("onValueInvalid")?.({
					reason: r,
					value: e("formattedValue"),
					valueAsNumber: e("valueAsNumber")
				});
			},
			invokeOnValueCommit({ computed: e, prop: t }) {
				t("onValueCommit")?.({
					value: e("formattedValue"),
					valueAsNumber: e("valueAsNumber")
				});
			},
			syncInputElement({ context: e, event: t, computed: n, scope: r }) {
				let i = t.type.endsWith("CHANGE") ? e.get("value") : n("formattedValue"), a = Oy(r), o = t.selection ?? vy(a, r);
				en(() => {
					Ui(a, i), yy(a, o, r);
				});
			},
			setFormattedValue({ context: e, computed: t, action: n }) {
				e.set("value", t("formattedValue")), n(["syncInputElement"]);
			},
			setCursorPoint({ context: e, event: t }) {
				e.set("scrubberCursorPoint", t.point);
			},
			clearCursorPoint({ context: e }) {
				e.set("scrubberCursorPoint", null);
			},
			setVirtualCursorPosition({ context: e, scope: t }) {
				let n = jy(t), r = e.get("scrubberCursorPoint");
				n && r && (n.style.transform = `translate3d(${r.x}px, ${r.y}px, 0px)`);
			}
		}
	}
}), hb = (e = {}) => {
	let t = Nt(), n = gn(), r = Ru(), i = _(() => {
		let i = St(e);
		return Re(i, ["id"]), {
			ids: {
				label: r?.()?.ids.label,
				input: r?.()?.ids.control
			},
			dir: n().dir,
			locale: n().locale,
			disabled: r?.()?.disabled,
			readOnly: r?.()?.readOnly,
			invalid: r?.()?.invalid,
			required: r?.()?.required,
			getRootNode: t().getRootNode,
			...i
		};
	}), a = Tn(mb, () => z(i)), o = _(() => Ry(a, Wt));
	return () => z(o);
}, gb = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"value"
]);
function _b(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = R(t, "value", 7), i = q(t, gb), a = _(() => X(r()().getRootProps(), i));
	return py(() => r()()), Q(e, Y({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		},
		get value() {
			return r();
		},
		set value(e) {
			r(e), M();
		}
	});
}
U(_b, {
	ref: {},
	value: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/NumberInput.svelte
var vb = (e, t = b) => {
	var n = kb(), r = ge(n);
	G(() => N(r, "d", t())), I(e, n);
};
function yb(e) {
	let t = Er(e);
	return class extends t {
		attributeChangedCallback(e, t, n) {
			super.attributeChangedCallback(e, t, e === "value" && n !== null && n.trim() === "" ? null : n);
		}
	};
}
var bb = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
function xb(e) {
	try {
		return new Intl.NumberFormat("en", {
			style: "currency",
			currency: e
		}).resolvedOptions().maximumFractionDigits ?? 0;
	} catch {
		return null;
	}
}
function Sb(e) {
	let [t = "", n] = String(e).split("e");
	return Math.max(0, (t.split(".")[1]?.length ?? 0) - Number(n ?? 0));
}
function Cb(e, t) {
	if (!Number.isFinite(e)) return e;
	let [n = "", r] = String(e).split("e");
	return Number(`${n}e${Number(r ?? 0) + t}`);
}
var wb = 20, Tb = 18;
function Eb(e, t, n) {
	let r = new Intl.NumberFormat(t).formatToParts(1234.5), i = r.find((e) => e.type === "group")?.value, a = r.find((e) => e.type === "decimal")?.value ?? ".";
	if ([...e].some((e) => (e === "." || e === ",") && e !== i && e !== a)) return !0;
	let [o = "", ...s] = e.split(a);
	if (s.length > 1) return !0;
	if (!i) return !1;
	if (!n) return e.includes(i);
	if (s.some((e) => e.includes(i))) return !0;
	if (!o.includes(i)) return !1;
	let c = o.split(i).map((e) => e.replace(/[^0-9]/g, ""));
	return !/^[1-9][0-9]{0,2}$/.test(c[0] ?? "") || c.slice(1).some((e) => !/^[0-9]{3}$/.test(e));
}
var Db = {
	comma_dot: "en-US",
	dot_comma: "de-DE",
	space_comma: "fr-FR"
}, Ob = {
	ArrowUp: [1, 1],
	ArrowDown: [-1, 1],
	PageUp: [1, 10],
	PageDown: [-1, 10]
}, kb = ae("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path></path></svg>"), Ab = L("<span id=\"af-described\" hidden=\"\"> </span>"), jb = L("<button type=\"button\" part=\"decrement\" class=\"af-button ghost icon xs svelte-gc58zb\" tabindex=\"-1\"><!></button> <button type=\"button\" part=\"increment\" class=\"af-button ghost icon xs svelte-gc58zb\" tabindex=\"-1\"><!></button>", 1), Mb = L("<input/> <!>", 1), Nb = L("<!> <div class=\"af-kit\"><!> <!></div>", 1), Pb = {
	hash: "svelte-gc58zb",
	code: ":host {display:inline-block;max-width:100%;vertical-align:middle;}[data-scope='number-input'][data-part='root'] {display:block;}[data-scope='number-input'][data-part='control'] {display:flex;align-items:center;box-sizing:border-box;width:100%;height:36px;padding:4px 12px;border:1px solid var(--k-input);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark, 0) * 100%), transparent);box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);font-size:16px;line-height:24px;transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);}\n  @media (min-width: 48rem) {[data-scope='number-input'][data-part='control'] {font-size:14px;line-height:20px;} }[data-scope='number-input'][data-part='control'][data-steppers] {padding-right:4px;}[data-scope='number-input'][data-part='control']:has(input:focus-visible) {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring), 0 1px 2px 0 rgb(0 0 0 / 0.05);}[data-scope='number-input'][data-part='control']:has(input[aria-invalid='true']) {border-color:var(--k-danger);}[data-scope='number-input'][data-part='control']:has(input[aria-invalid='true']:focus-visible) {box-shadow:0 0 0 3px color-mix(in oklab, var(--k-danger) calc(20% + var(--k-dark, 0) * 20%), transparent), 0 1px 2px 0 rgb(0 0 0 / 0.05);}[data-scope='number-input'][data-part='control'][data-disabled] {opacity:0.5;cursor:not-allowed;}[data-scope='number-input'][data-part='input'] {flex:1;min-width:0;width:8em;height:100%;padding:0;border:0;outline:none;background:transparent;color:inherit;font:inherit;}[data-scope='number-input'][data-part='input']::placeholder {color:var(--k-muted);opacity:1;}[data-scope='number-input'][data-part='input']::selection {background:var(--k-primary);color:var(--k-primary-fg);}[data-scope='number-input'][data-part='input']:disabled {pointer-events:none;cursor:not-allowed;}.af-button.svelte-gc58zb {flex:none;}\n  @media (prefers-reduced-motion: reduce) {[data-scope='number-input'][data-part='control'] {transition:none;} }\n  @media (forced-colors: active) {[data-scope='number-input'][data-part='control']:has(input:focus-visible) {outline:2px solid;outline-offset:2px;}\n  }"
};
function Fb(r, i) {
	let o = m();
	O(i, !0), ee(r, Pb);
	let s = R(i, "value", 7, null), l = R(i, "min", 7, null), u = R(i, "max", 7, null), f = R(i, "step", 7, null), p = R(i, "precision", 7, null), h = R(i, "fractional", 7, !1), v = R(i, "unscaled", 7, !1), b = R(i, "format", 7, "plain"), x = R(i, "currency", 7, "VND"), S = R(i, "steppers", 7, !1), C = R(i, "placeholder", 7, null), T = R(i, "label", 7, null), te = R(i, "disabled", 7, !1), ne = R(i, "locale", 7, null), re = R(i, "separators", 7, null), ie = R(i, "strings", 7, null), k = R(i, "name", 7, null), A = R(i, "required", 7, !1), ae = R(i, "readonly", 7, !1), oe = R(i, "description", 7, null), j = R(i, "error", 7, null), se = R(i, "invalid", 7, !1), ce = i.$$host, L = `${o}-input`, le = _(() => c(ne(), ie() ?? void 0)), de = _(() => e(ne()) ? "vi-VN" : "en-GB"), fe = _(() => re() && Object.hasOwn(Db, re()) ? Db[re()] : z(de)), U = _(() => re() !== "none"), pe = _(() => bb(s())), me = _(() => bb(l())), he = _(() => bb(u())), ve = _(() => b() === "currency" || b() === "percent" ? b() : "decimal"), ye = _(() => z(ve) === "percent" && !!v()), be = _(() => bb(f()) !== null && f() > 0 ? f() : z(ve) === "percent" && !z(ye) ? .01 : 1), xe = _(() => z(ve) === "percent" && !z(ye) ? Number((z(be) * 100).toFixed(10)) : z(be)), Ce = _(() => bb(p()) !== null && p() >= 0), we = _(() => !z(Ce) && (!!h() || z(ye))), q = _(() => z(Ce) ? Math.min(20, Math.floor(p())) : z(we) ? z(ve) === "percent" ? Tb : wb : Number.isInteger(z(xe)) ? 0 : 2), Ee = _(() => x() && xb(x()) !== null ? x().toUpperCase() : "VND"), Y = _(() => ({
		...z(ve) === "currency" ? {
			style: z(ve),
			currency: z(Ee),
			minimumFractionDigits: Math.min(xb(z(Ee)) ?? 0, z(q)),
			maximumFractionDigits: z(q)
		} : {
			style: z(ve),
			maximumFractionDigits: z(q)
		},
		useGrouping: z(U)
	})), De = _(() => new Intl.NumberFormat(z(fe), z(Y))), Oe = (e) => z(De).format(z(ye) ? Cb(e, -2) : e), ke = _(() => z(pe) === null ? "" : Oe(z(pe))), Ae = _(() => Math.min(20, Math.max(z(q) + (z(ve) === "percent" && !z(ye) ? 2 : 0), Sb(z(be))))), je = (e, t = z(Ae)) => Number(e.toFixed(t)), Me = B(null), Ne = B(""), Pe = _(() => re() === "space_comma" ? z(Ne).replace(/(?<=[0-9])[ \u00a0](?=[0-9])/g, " ") : z(Ne)), Fe = B(!1), Ie = B(!1), Le = "", Re = null;
	V(() => {
		let e = z(ke);
		e !== Re && (Re = e, Se(() => {
			z(Ie) && (J(Ie, !1), J(Fe, !1));
		})), !z(Fe) && (J(Ne, e, !0), z(Me) && z(Me).value !== e && (z(Me).value = e));
	});
	let ze = B(!1), Be = _(() => !!te() || z(ze)), Ve = _(() => [oe(), j()].filter(Boolean).join(" ")), He = hb(() => ({
		id: o,
		ids: { input: L },
		getRootNode: () => ce.shadowRoot,
		locale: z(fe),
		dir: "ltr",
		value: z(Pe),
		formatOptions: z(Y),
		step: z(be),
		min: z(me) ?? void 0,
		max: z(he) ?? void 0,
		allowOverflow: !0,
		allowMouseWheel: !1,
		spinOnPress: !1,
		focusInputOnChange: !1,
		disabled: z(Be),
		readOnly: !!ae(),
		invalid: !!se()
	}));
	Te(() => {
		ce.toggleAttribute("data-unparsed", z(Ie));
	});
	let Ue = _(() => z(Ie) ? { badInput: !0 } : A() && z(pe) === null ? { valueMissing: !0 } : z(pe) !== null && z(me) !== null && z(pe) < z(me) ? { rangeUnderflow: !0 } : z(pe) !== null && z(he) !== null && z(pe) > z(he) ? { rangeOverflow: !0 } : {}), We = _(() => "badInput" in z(Ue) ? a(d(z(le), "badNumber"), { example: new Intl.NumberFormat(z(fe), { useGrouping: z(U) }).format(1234.5) }) : "valueMissing" in z(Ue) ? d(z(le), "valueMissing") : "rangeUnderflow" in z(Ue) ? a(d(z(le), "numberUnderflow"), { min: Oe(z(me)) }) : "rangeOverflow" in z(Ue) ? a(d(z(le), "numberOverflow"), { max: Oe(z(he)) }) : "");
	Te(() => Dr(ce, {
		name: k(),
		value: z(pe) === null ? null : String(z(pe)),
		validity: z(Ue),
		message: z(We),
		anchor: z(Me)
	})), Or(ce, {
		reset() {
			let e = ce.getAttribute("value"), t = e === null || e.trim() === "" ? null : bb(Number(e));
			t !== z(pe) && n(ce, "change", { value: t });
		},
		disabled(e) {
			J(ze, e, !0);
		}
	});
	function Ge(e) {
		let t = z(Ie);
		J(Ie, !1), (e !== z(pe) || t) && n(ce, "change", { value: e });
	}
	let Ke = () => {
		if (z(Ne).trim() === "") return null;
		let e = He().valueAsNumber;
		return z(ye) ? Cb(e, 2) : e;
	};
	function qe() {
		if (!z(Fe)) return;
		if (Eb(z(Pe), z(fe), z(U))) {
			(!z(Ie) || z(Ne) !== Le) && n(ce, "unparsed", { text: z(Ne) }), Le = z(Ne), J(Ie, !0);
			return;
		}
		let e = Ke();
		J(Fe, !1), e === null || Number.isFinite(e) ? Ge(e === null ? null : je(e)) : z(Ie) && Ge(z(pe));
	}
	function Je(e, t = 1) {
		if (z(Be) || ae()) return;
		let n = z(Fe) && !Eb(z(Pe), z(fe), z(U)) ? Ke() : z(pe);
		J(Fe, !1);
		let r = n !== null && Number.isFinite(n) ? n : 0, i = je(r + e * t * z(be), z(we) ? Math.min(z(Ae), Math.max(Sb(r), Sb(z(be)))) : z(Ae));
		z(me) !== null && (i = Math.max(i, z(me))), z(he) !== null && (i = Math.min(i, z(he))), Ge(i);
	}
	function Ye(e) {
		if (e.target !== z(Me) || e.isComposing) return;
		let t = Ob[e.key];
		e.key === "Enter" ? (e.preventDefault(), qe()) : t && (e.preventDefault(), Je(...t));
	}
	let Xe = _(() => {
		let { onkeydown: e, onfocusout: t, oninput: n, ...r } = He().getInputProps();
		return {
			...r,
			onfocusout(e) {
				z(Ie) || t?.(e);
			},
			oninput(e) {
				J(Ne, e.currentTarget.value, !0), J(Fe, !0), n?.(e);
			}
		};
	}), Ze = _(() => z(pe) !== null && z(me) !== null && z(pe) <= z(me)), Qe = _(() => z(pe) !== null && z(he) !== null && z(pe) >= z(he));
	var $e = {
		get value() {
			return s();
		},
		set value(e = null) {
			s(e), M();
		},
		get min() {
			return l();
		},
		set min(e = null) {
			l(e), M();
		},
		get max() {
			return u();
		},
		set max(e = null) {
			u(e), M();
		},
		get step() {
			return f();
		},
		set step(e = null) {
			f(e), M();
		},
		get precision() {
			return p();
		},
		set precision(e = null) {
			p(e), M();
		},
		get fractional() {
			return h();
		},
		set fractional(e = !1) {
			h(e), M();
		},
		get unscaled() {
			return v();
		},
		set unscaled(e = !1) {
			v(e), M();
		},
		get format() {
			return b();
		},
		set format(e = "plain") {
			b(e), M();
		},
		get currency() {
			return x();
		},
		set currency(e = "VND") {
			x(e), M();
		},
		get steppers() {
			return S();
		},
		set steppers(e = !1) {
			S(e), M();
		},
		get placeholder() {
			return C();
		},
		set placeholder(e = null) {
			C(e), M();
		},
		get label() {
			return T();
		},
		set label(e = null) {
			T(e), M();
		},
		get disabled() {
			return te();
		},
		set disabled(e = !1) {
			te(e), M();
		},
		get locale() {
			return ne();
		},
		set locale(e = null) {
			ne(e), M();
		},
		get separators() {
			return re();
		},
		set separators(e = null) {
			re(e), M();
		},
		get strings() {
			return ie();
		},
		set strings(e = null) {
			ie(e), M();
		},
		get name() {
			return k();
		},
		set name(e = null) {
			k(e), M();
		},
		get required() {
			return A();
		},
		set required(e = !1) {
			A(e), M();
		},
		get readonly() {
			return ae();
		},
		set readonly(e = !1) {
			ae(e), M();
		},
		get description() {
			return oe();
		},
		set description(e = null) {
			oe(e), M();
		},
		get error() {
			return j();
		},
		set error(e = null) {
			j(e), M();
		},
		get invalid() {
			return se();
		},
		set invalid(e = !1) {
			se(e), M();
		}
	}, et = Nb(), tt = K(et);
	t(tt, {});
	var nt = W(tt, 2), rt = H(nt), it = (e) => {
		var t = Ab(), n = ge(t, !0);
		G(() => w(n, z(Ve))), I(e, t);
	};
	P(rt, (e) => {
		z(Ve) && e(it);
	});
	var at = W(rt, 2);
	return E(at, () => _b, (e, t) => {
		t(e, {
			get value() {
				return He;
			},
			children: (e, t) => {
				var n = F(), r = K(n);
				{
					let e = _(() => S() ? "" : void 0);
					E(r, () => gy, (t, n) => {
						n(t, {
							part: "control",
							get "data-steppers"() {
								return z(e);
							},
							onkeydowncapture: Ye,
							children: (e, t) => {
								var n = Mb(), r = K(n);
								g(r, () => ({
									...z(Xe),
									part: "input",
									value: z(Ne),
									placeholder: C() || void 0,
									"aria-label": T() || C() || void 0,
									"aria-describedby": z(Ve) ? "af-described" : void 0,
									"aria-invalid": se() || z(Ie) ? "true" : void 0,
									"aria-required": A() ? "true" : void 0,
									"aria-valuenow": z(pe) ?? void 0,
									"aria-valuemin": z(me) ?? void 0,
									"aria-valuemax": z(he) ?? void 0,
									"aria-valuetext": z(Ne) || void 0,
									onblur: qe
								}), void 0, void 0, void 0, "svelte-gc58zb", !0), ue(r, (e) => J(Me, e), () => z(Me));
								var i = W(r, 2), a = (e) => {
									var t = jb(), n = K(t);
									vb(H(n), () => "m6 9 6 6 6-6"), D(n);
									var r = W(n, 2);
									vb(H(r), () => "m18 15-6-6-6 6"), D(r), G(() => {
										N(n, "aria-label", z(le).decrease), N(n, "aria-controls", L), n.disabled = z(Be) || !!ae() || z(Ze), N(r, "aria-label", z(le).increase), N(r, "aria-controls", L), r.disabled = z(Be) || !!ae() || z(Qe);
									}), _e("mousedown", n, (e) => e.preventDefault()), _e("click", n, () => Je(-1)), _e("mousedown", r, (e) => e.preventDefault()), _e("click", r, () => Je(1)), I(e, t);
								};
								P(i, (e) => {
									S() && e(a);
								}), I(e, n);
							},
							$$slots: { default: !0 }
						});
					});
				}
				I(e, n);
			},
			$$slots: { default: !0 }
		});
	}), D(nt), I(r, et), y($e);
}
we(["mousedown", "click"]), U(Fb, {
	value: {
		attribute: "value",
		type: "Number"
	},
	min: {
		attribute: "min",
		type: "Number"
	},
	max: {
		attribute: "max",
		type: "Number"
	},
	step: {
		attribute: "step",
		type: "Number"
	},
	precision: {
		attribute: "precision",
		type: "Number"
	},
	fractional: {
		attribute: "fractional",
		type: "Boolean"
	},
	unscaled: {
		attribute: "unscaled",
		type: "Boolean"
	},
	format: {
		attribute: "format",
		type: "String"
	},
	currency: {
		attribute: "currency",
		type: "String"
	},
	steppers: {
		attribute: "steppers",
		type: "Boolean"
	},
	placeholder: {
		attribute: "placeholder",
		type: "String"
	},
	label: {
		attribute: "label",
		type: "String"
	},
	disabled: {
		attribute: "disabled",
		reflect: !0,
		type: "Boolean"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	separators: {
		attribute: "separators",
		type: "String"
	},
	strings: { type: "Object" },
	name: {
		attribute: "name",
		reflect: !0,
		type: "String"
	},
	required: {
		attribute: "required",
		type: "Boolean"
	},
	readonly: {
		attribute: "readonly",
		reflect: !0,
		type: "Boolean"
	},
	description: {
		attribute: "description",
		type: "String"
	},
	error: {
		attribute: "error",
		type: "String"
	},
	invalid: {
		attribute: "invalid",
		type: "Boolean"
	}
}, [], [], {
	mode: "open",
	delegatesFocus: !0
}, yb);
//#endregion
//#region src/kit/Pager.svelte
var Ib = L("<span class=\"note svelte-1ygr0dr\"> </span>"), Lb = L("<span class=\"af-spinner\" aria-hidden=\"true\"></span>"), Rb = L("<button type=\"button\" part=\"more\" class=\"af-button ghost sm more svelte-1ygr0dr\"><!> </button>"), zb = L("<!> <!>", 1), Bb = L("<div part=\"page-size\" class=\"size svelte-1ygr0dr\"><span class=\"note svelte-1ygr0dr\" aria-hidden=\"true\"> </span> <af-select></af-select></div>", 2), Vb = L("<span part=\"range\" class=\"note svelte-1ygr0dr\"> </span>"), Hb = L("<!> <!> <button type=\"button\" part=\"prev\" class=\"af-button sm step svelte-1ygr0dr\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m15 18-6-6 6-6\"></path></svg> </button> <button type=\"button\" part=\"next\" class=\"af-button sm step svelte-1ygr0dr\"> <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m9 18 6-6-6-6\"></path></svg></button>", 1), Ub = L("<span> </span>"), Wb = L("<div class=\"af-kit row svelte-1ygr0dr\"><!></div> <div part=\"status\" role=\"status\" class=\"live svelte-1ygr0dr\"><!></div>", 1), Gb = {
	hash: "svelte-1ygr0dr",
	code: ":host {display:block;}.row.svelte-1ygr0dr {display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;}.size.svelte-1ygr0dr {display:flex;align-items:center;gap:8px;}.note.svelte-1ygr0dr {font-size:12px;line-height:16px;color:var(--k-muted);white-space:nowrap;}.size.svelte-1ygr0dr af-select:where(.svelte-1ygr0dr) {width:76px;}button.af-button.sm.step.svelte-1ygr0dr {gap:4px;}button.af-button.sm.more.svelte-1ygr0dr {font-size:12px;line-height:16px;}.live.svelte-1ygr0dr {position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;}"
};
function Kb(r, i) {
	O(i, !0), ee(r, Gb);
	let o = R(i, "mode", 7, "pages"), s = R(i, "hasPrev", 7, !1), l = R(i, "hasNext", 7, !1), u = R(i, "hasMore", 7, !1), d = R(i, "busy", 7, !1), f = R(i, "pageSize", 7, null), m = R(i, "pageSizes", 7, null), h = R(i, "rangeStart", 7, null), g = R(i, "rangeEnd", 7, null), b = R(i, "total", 7, null), S = R(i, "shown", 7, null), C = R(i, "focusNew", 7, !1), T = R(i, "controls", 7, null), E = R(i, "locale", 7, null), re = R(i, "strings", 7, null), ie = i.$$host, k = _(() => c(E(), re() ?? void 0)), A = (e) => {
		let t = typeof e == "string" && e.trim() !== "" ? Number(e) : e;
		return typeof t == "number" && Number.isFinite(t) ? t : null;
	}, ae = _(() => new Intl.NumberFormat(e(E()) ? "vi-VN" : "en-GB")), oe = (e) => z(ae).format(e), j = _(() => o() === "more"), se = _(() => A(h())), ce = _(() => A(g())), F = _(() => A(b())), L = _(() => A(S())), le = _(() => A(f())), de = _(() => (m() ?? []).map(A).filter((e) => e !== null)), V = _(() => z(se) === null || z(ce) === null ? "" : a(z(F) === null ? z(k).pageRangeOpen : z(k).pageRange, {
		start: oe(z(se)),
		end: oe(z(ce)),
		total: z(F) === null ? "" : oe(z(F))
	})), fe = _(() => z(L) === null ? "" : a(z(F) === null ? z(k).shownOnly : z(k).shownOf, {
		shown: oe(z(L)),
		total: z(F) === null ? "" : oe(z(F))
	})), U = _(() => z(j) ? !!u() || z(L) !== null : !!s() || !!l() || z(V) !== ""), pe = _(() => !s() || !!d()), me = _(() => !l() || !!d()), he = B(""), ve = B(0), ye = !1, be = 0, xe = !1, Ce = !1, we = B(null), q = B(null);
	Te(() => {
		z(L), u();
		let e = !!d();
		Se(() => {
			ye && (e && (xe = !0), Ce || (Ce = !0, queueMicrotask(Ee)));
		});
	});
	function Ee() {
		if (Ce = !1, !ye) return;
		let e = z(L), t = !!u();
		e !== null && e > be ? (ye = !1, J(he, a(z(k).moreLoaded, { count: oe(e - be) }), !0), J(ve, z(ve) + 1), Y(e - be)) : !d() && (xe || !t) && (ye = !1, Y(0));
	}
	function Y(e) {
		let t = p(), n = !t || t === document.body, r = !!z(we)?.isConnected, i = r && t === z(we), a = e > 0 ? Ae() : null;
		(e > 0 && C() && T() && (i || n) || n && !r) && De(a ?? z(q));
	}
	function De(e) {
		e?.isConnected && (!e.hasAttribute("tabindex") && e.tabIndex < 0 && e.setAttribute("tabindex", "-1"), e.focus());
	}
	function Oe(e) {
		if (!e) return null;
		let t = ie.getRootNode();
		return (typeof t.getElementById == "function" ? t : document).getElementById(e);
	}
	let ke = null;
	function Ae() {
		let e = Oe(T());
		if (!e || !ke) return null;
		let t = [...e.children].find((e) => !ke.has(e));
		return t instanceof HTMLElement || t instanceof SVGElement ? t : null;
	}
	function je() {
		let e = Oe(T());
		for (let t of ie.shadowRoot?.querySelectorAll("button[part=\"prev\"], button[part=\"next\"], button[part=\"more\"]") ?? []) "ariaControlsElements" in t && (t.ariaControlsElements = e ? [e] : null);
	}
	Te(() => {
		T(), z(U), z(j), u(), je();
	});
	function Me(e, t) {
		je(), !e && (t === "more" && (ke = new Set(Oe(T())?.children ?? []), ye = !0, be = z(L) ?? 0, xe = !1, J(he, "")), n(ie, t, {}));
	}
	function Ne(e) {
		let t = A(e.detail?.value);
		t !== null && n(ie, "page-size-change", { pageSize: t });
	}
	var Pe = {
		get mode() {
			return o();
		},
		set mode(e = "pages") {
			o(e), M();
		},
		get hasPrev() {
			return s();
		},
		set hasPrev(e = !1) {
			s(e), M();
		},
		get hasNext() {
			return l();
		},
		set hasNext(e = !1) {
			l(e), M();
		},
		get hasMore() {
			return u();
		},
		set hasMore(e = !1) {
			u(e), M();
		},
		get busy() {
			return d();
		},
		set busy(e = !1) {
			d(e), M();
		},
		get pageSize() {
			return f();
		},
		set pageSize(e = null) {
			f(e), M();
		},
		get pageSizes() {
			return m();
		},
		set pageSizes(e = null) {
			m(e), M();
		},
		get rangeStart() {
			return h();
		},
		set rangeStart(e = null) {
			h(e), M();
		},
		get rangeEnd() {
			return g();
		},
		set rangeEnd(e = null) {
			g(e), M();
		},
		get total() {
			return b();
		},
		set total(e = null) {
			b(e), M();
		},
		get shown() {
			return S();
		},
		set shown(e = null) {
			S(e), M();
		},
		get focusNew() {
			return C();
		},
		set focusNew(e = !1) {
			C(e), M();
		},
		get controls() {
			return T();
		},
		set controls(e = null) {
			T(e), M();
		},
		get locale() {
			return E();
		},
		set locale(e = null) {
			E(e), M();
		},
		get strings() {
			return re();
		},
		set strings(e = null) {
			re(e), M();
		}
	}, Fe = zb(), Ie = K(Fe);
	t(Ie, {});
	var Le = W(Ie, 2), Re = (e) => {
		var t = Wb(), n = K(t), r = H(n), i = (e) => {
			var t = zb(), n = K(t), r = (e) => {
				var t = Ib(), n = ge(t, !0);
				G(() => w(n, z(fe))), I(e, t);
			};
			P(n, (e) => {
				z(fe) && e(r);
			});
			var i = W(n, 2), a = (e) => {
				var t = Rb(), n = H(t), r = (e) => {
					var t = Lb();
					I(e, t);
				};
				P(n, (e) => {
					d() && e(r);
				});
				var i = W(n, 1, !0);
				D(t), ue(t, (e) => J(we, e), () => z(we)), G(() => {
					N(t, "aria-controls", T() || void 0), N(t, "aria-disabled", d() ? "true" : void 0), w(i, z(k).loadMore);
				}), _e("click", t, () => Me(!!d(), "more")), I(e, t);
			};
			P(i, (e) => {
				u() && e(a);
			}), I(e, t);
		}, a = (e) => {
			var t = Hb(), n = K(t), r = (e) => {
				var t = Bb(), n = H(t), r = ge(n, !0), i = W(n, 2);
				v(i, "size", "sm"), G(() => v(i, "label", z(k).rowsPerPage)), G((e) => v(i, "value", e), [() => String(z(le))]), G((e) => v(i, "options", e), [() => z(de).map((e) => ({
					value: String(e),
					label: oe(e)
				}))]), G(() => v(i, "locale", E() || void 0)), G(() => v(i, "strings", re() ?? void 0)), te(i, 1, "svelte-1ygr0dr"), D(t), G(() => w(r, z(k).rowsPerPage)), _e("change", i, Ne), I(e, t);
			};
			P(n, (e) => {
				z(le) !== null && z(de).length > 0 && e(r);
			});
			var i = W(n, 2), a = (e) => {
				var t = Vb(), n = ge(t, !0);
				G(() => w(n, z(V))), I(e, t);
			};
			P(i, (e) => {
				z(V) && e(a);
			});
			var o = W(i, 2), s = W(H(o), 1, !0);
			D(o);
			var c = W(o, 2), l = H(c, !0);
			ne(), D(c), G(() => {
				N(o, "aria-controls", T() || void 0), N(o, "aria-disabled", z(pe) ? "true" : void 0), w(s, z(k).previous), N(c, "aria-controls", T() || void 0), N(c, "aria-disabled", z(me) ? "true" : void 0), w(l, z(k).next);
			}), _e("click", o, () => Me(z(pe), "prev")), _e("click", c, () => Me(z(me), "next")), I(e, t);
		};
		P(r, (e) => {
			z(j) ? e(i) : e(a, -1);
		}), D(n);
		var o = W(n, 2), s = H(o);
		x(s, () => z(ve), (e) => {
			var t = Ub(), n = ge(t, !0);
			G(() => w(n, z(he))), I(e, t);
		}), D(o), ue(o, (e) => J(q, e), () => z(q)), _e("focusin", n, je), I(e, t);
	};
	return P(Le, (e) => {
		z(U) && e(Re);
	}), I(r, Fe), y(Pe);
}
we([
	"focusin",
	"click",
	"change"
]), U(Kb, {
	mode: {
		attribute: "mode",
		type: "String"
	},
	hasPrev: {
		attribute: "has-prev",
		type: "Boolean"
	},
	hasNext: {
		attribute: "has-next",
		type: "Boolean"
	},
	hasMore: {
		attribute: "has-more",
		type: "Boolean"
	},
	busy: {
		attribute: "busy",
		type: "Boolean"
	},
	pageSize: {
		attribute: "page-size",
		type: "Number"
	},
	pageSizes: { type: "Array" },
	rangeStart: {
		attribute: "range-start",
		type: "Number"
	},
	rangeEnd: {
		attribute: "range-end",
		type: "Number"
	},
	total: {
		attribute: "total",
		type: "Number"
	},
	shown: {
		attribute: "shown",
		type: "Number"
	},
	focusNew: {
		attribute: "focus-new",
		type: "Boolean"
	},
	controls: {
		attribute: "controls",
		type: "String"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/PersonPicker.svelte
function qb(e) {
	let t = e.trim().split(/\s+/).filter(Boolean).map((e) => Array.from(e)[0].toUpperCase());
	return t.length === 0 ? "" : t.length === 1 ? t[0] : t[0] + t[t.length - 1];
}
var Jb = L("<img alt=\"\"/>"), Yb = L("<span class=\"af-avatar sm\"><!></span>"), Xb = L("<span id=\"af-described\" hidden=\"\"> </span>"), Zb = L("<span class=\"af-chip secondary\" part=\"chip\"><!> <span> </span> <button type=\"button\" part=\"remove\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button></span>"), Qb = L("<span class=\"lead svelte-akzd1x\"><!></span>"), $b = L("<button type=\"button\" part=\"clear\" class=\"af-button ghost icon xs\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button>"), ex = L("<!> <!> <!>", 1), tx = L("<span class=\"detail\"> </span>"), nx = L("<!> <span class=\"lines\"><span class=\"name\"> </span> <!></span>", 1), rx = L("<div part=\"loading\"> </div>"), ix = L("<button type=\"button\" part=\"load-more\"> </button>"), ax = L("<!> <!>", 1), ox = L("<div class=\"af-kit\"><!> <!></div>"), sx = {
	hash: "svelte-akzd1x",
	code: ".lead.svelte-akzd1x {display:inline-flex;margin-right:8px;}"
};
function cx(e, r) {
	O(r, !0), ee(e, sx);
	let i = (e, t = b) => {
		var n = Yb(), r = H(n), i = (e) => {
			var n = Jb();
			G(() => N(n, "src", t().avatar)), I(e, n);
		}, a = (e) => {
			var n = fe();
			G((e) => w(n, e), [() => qb(t().name)]), I(e, n);
		}, o = _(() => le(t().id)), s = (e) => {
			var t = fe("?");
			I(e, t);
		};
		P(r, (e) => {
			t().avatar ? e(i) : z(o) ? e(a, 1) : e(s, -1);
		}), D(n), I(e, n);
	}, a = R(r, "people", 23, () => []), o = R(r, "source", 7, null), l = R(r, "value", 7, null), u = R(r, "multiple", 7, !1), f = R(r, "placeholder", 7, null), p = R(r, "label", 7, null), m = R(r, "loading", 7, !1), g = R(r, "locale", 7, null), v = R(r, "disabled", 7, !1), x = R(r, "strings", 7, null), S = R(r, "name", 7, null), C = R(r, "required", 7, !1), T = R(r, "readonly", 7, !1), te = R(r, "description", 7, null), re = R(r, "error", 7, null), ie = R(r, "invalid", 7, !1), k = r.$$host, A = _(() => c(g(), x() ?? void 0)), ae = _(() => {
		let e = /* @__PURE__ */ new Set();
		return (a() ?? []).filter((t) => !e.has(t.id) && !!e.add(t.id));
	}), oe = _(() => new Map(z(ae).map((e) => [e.id, e]))), j = _(() => [...new Set(Array.isArray(l()) ? l() : l() ? [l()] : [])]), se = B(null), ce = B(!1), L = Zu((e) => e.id);
	Qu(L, () => o(), () => z(j), () => {
		z(ce) && L.now(z(se) ?? "");
	});
	let le = (e) => o() ? L.named.get(e) : z(oe).get(e), ue = _(() => z(j).filter((e) => !le(e)));
	function de(e) {
		let t = le(e);
		return t ? t.name : m() || o() && L.pending(e) ? "…" : (o() ? L.answered(e) : z(ae).length > 0) ? z(ue).length > 1 ? `${z(A).unknownPerson} ${z(ue).indexOf(e) + 1}` : z(A).unknownPerson : "";
	}
	let V = _(() => z(se) ?? (u() || !z(j)[0] || !o() && m() && !z(oe).has(z(j)[0]) ? "" : de(z(j)[0]))), U = _(() => o() ? L.items : z(ae).filter((e) => dr(e.name, z(se) ?? "") || dr(e.email, z(se) ?? ""))), pe = _(() => Ei({
		items: z(U),
		itemToValue: (e) => e.id,
		itemToString: (e) => e.name
	})), me = _(() => !!o() && (!!m() || L.busy)), he = B(null);
	Te(() => s(z(he), z(ce), k));
	let ve = (e) => n(k, "change", { value: u() ? e : e[0] ?? null }), ye = B(!1), be = _(() => !!v() || z(ye)), xe = _(() => z(be) || !!T()), Se = _(() => [te(), re()].filter(Boolean).join(" ")), Ce = B(null);
	Te(() => {
		let e = !!C() && z(j).length === 0;
		Dr(k, {
			name: S(),
			value: u() ? z(j) : z(j)[0] ?? null,
			validity: e ? { valueMissing: !0 } : {},
			message: e ? d(z(A), "valueMissing") : "",
			anchor: z(Ce)
		});
	}), Or(k, {
		reset() {
			let e = k.getAttribute("value"), t = e ? [e] : [];
			(t.length !== z(j).length || t.some((e, t) => e !== z(j)[t])) && ve(t);
		},
		disabled(e) {
			J(ye, e, !0);
		}
	});
	function we(e) {
		let t = e.target;
		t === z(Ce) || t.closest("button") || (e.preventDefault(), z(Ce)?.focus());
	}
	var q = {
		get people() {
			return a();
		},
		set people(e = []) {
			a(e), M();
		},
		get source() {
			return o();
		},
		set source(e = null) {
			o(e), M();
		},
		get value() {
			return l();
		},
		set value(e = null) {
			l(e), M();
		},
		get multiple() {
			return u();
		},
		set multiple(e = !1) {
			u(e), M();
		},
		get placeholder() {
			return f();
		},
		set placeholder(e = null) {
			f(e), M();
		},
		get label() {
			return p();
		},
		set label(e = null) {
			p(e), M();
		},
		get loading() {
			return m();
		},
		set loading(e = !1) {
			m(e), M();
		},
		get locale() {
			return g();
		},
		set locale(e = null) {
			g(e), M();
		},
		get disabled() {
			return v();
		},
		set disabled(e = !1) {
			v(e), M();
		},
		get strings() {
			return x();
		},
		set strings(e = null) {
			x(e), M();
		},
		get name() {
			return S();
		},
		set name(e = null) {
			S(e), M();
		},
		get required() {
			return C();
		},
		set required(e = !1) {
			C(e), M();
		},
		get readonly() {
			return T();
		},
		set readonly(e = !1) {
			T(e), M();
		},
		get description() {
			return te();
		},
		set description(e = null) {
			te(e), M();
		},
		get error() {
			return re();
		},
		set error(e = null) {
			re(e), M();
		},
		get invalid() {
			return ie();
		},
		set invalid(e = !1) {
			ie(e), M();
		}
	}, Ee = ex(), Y = K(Ee);
	t(Y, {});
	var De = W(Y, 2);
	Uu(De, {});
	var Oe = W(De, 2);
	return Yt(Oe, {
		value: () => k.shadowRoot,
		children: (e, t) => {
			var r = ox(), a = H(r), s = (e) => {
				var t = Xb(), n = ge(t, !0);
				G(() => w(n, z(Se))), I(e, t);
			};
			P(a, (e) => {
				z(Se) && e(s);
			});
			var c = W(a, 2), l = () => z(j), d = () => z(V);
			{
				let e = _(() => !!u()), t = _(() => !!T()), r = _(() => !!ie()), a = _(() => o() ? "none" : "autohighlight");
				E(c, () => Vu, (s, c) => {
					c(s, {
						get collection() {
							return z(pe);
						},
						get multiple() {
							return z(e);
						},
						get disabled() {
							return z(be);
						},
						get readOnly() {
							return z(t);
						},
						get invalid() {
							return z(r);
						},
						get inputBehavior() {
							return z(a);
						},
						selectionBehavior: "preserve",
						positioning: {
							strategy: "fixed",
							placement: "bottom-start"
						},
						get scrollToIndexFn() {
							return on;
						},
						get value() {
							return l();
						},
						set value(e) {},
						get inputValue() {
							return d();
						},
						set inputValue(e) {},
						onValueChange: (e) => {
							z(se) !== null && o() && z(ce) && L.search(""), J(se, null), ve(e.value);
						},
						onInputValueChange: (e) => {
							e.reason === "input-change" && (J(se, e.inputValue, !0), n(k, "search", { query: e.inputValue }), o() && L.search(e.inputValue));
						},
						onOpenChange: (e) => {
							e.open ? o() && e.reason !== "input-change" && L.now(z(se) ?? "") : (J(se, null), L.stop());
						},
						get open() {
							return z(ce);
						},
						set open(e) {
							J(ce, e, !0);
						},
						children: (e, t) => {
							var n = ax(), r = K(n);
							E(r, () => wc, (e, t) => {
								t(e, {
									part: "control",
									onmousedown: we,
									children: (e, t) => {
										var n = ex(), r = K(n), a = (e) => {
											var t = F(), n = K(t);
											h(n, 16, () => z(j), (e) => e, (e, t) => {
												let n = _(() => le(t) ?? {
													id: t,
													name: de(t)
												});
												var r = Zb(), a = H(r);
												i(a, () => z(n));
												var o = W(a, 2), s = ge(o, !0), c = W(o, 2);
												D(r), G(() => {
													w(s, z(n).name), N(c, "aria-label", `${z(A).remove ?? ""}: ${z(n).name ?? ""}`), c.disabled = z(xe);
												}), _e("click", c, () => ve(z(j).filter((e) => e !== t))), I(e, r);
											}), I(e, t);
										}, o = (e) => {
											let t = _(() => le(z(j)[0]) ?? {
												id: z(j)[0],
												name: de(z(j)[0])
											});
											var n = Qb(), r = H(n);
											i(r, () => z(t)), D(n), I(e, n);
										};
										P(r, (e) => {
											u() ? e(a) : z(j)[0] && e(o, 1);
										});
										var s = W(r, 2);
										{
											let e = _(() => f() ?? ""), t = _(() => p() || void 0), n = _(() => z(Se) ? "af-described" : void 0), r = _(() => C() ? "true" : void 0);
											E(s, () => Ec, (i, a) => {
												a(i, {
													part: "input",
													autocomplete: "off",
													spellcheck: "false",
													get placeholder() {
														return z(e);
													},
													get "aria-label"() {
														return z(t);
													},
													get "aria-describedby"() {
														return z(n);
													},
													get "aria-required"() {
														return z(r);
													},
													get ref() {
														return z(Ce);
													},
													set ref(e) {
														J(Ce, e, !0);
													}
												});
											});
										}
										var c = W(s, 2), l = (e) => {
											var t = $b();
											G(() => N(t, "aria-label", z(A).clear)), _e("click", t, () => ve([])), I(e, t);
										};
										P(c, (e) => {
											!u() && z(j)[0] && !z(xe) && e(l);
										}), I(e, n);
									},
									$$slots: { default: !0 }
								});
							});
							var a = W(r, 2);
							E(a, () => Pc, (e, t) => {
								t(e, {
									popover: "manual",
									get ref() {
										return z(he);
									},
									set ref(e) {
										J(he, e, !0);
									},
									children: (e, t) => {
										var n = F(), r = K(n);
										E(r, () => oo, (e, t) => {
											t(e, {
												class: "af-overlay people",
												part: "content",
												children: (e, t) => {
													Sn(e, {
														tabStop: !1,
														children: (e, t) => {
															var n = ax(), r = K(n);
															h(r, 17, () => z(pe).items, (e) => e.id, (e, t) => {
																var n = F(), r = K(n);
																E(r, () => Mc, (e, n) => {
																	n(e, {
																		get item() {
																			return z(t);
																		},
																		part: "option",
																		children: (e, n) => {
																			var r = nx(), a = K(r);
																			i(a, () => z(t));
																			var o = W(a, 2), s = H(o), c = ge(s, !0), l = W(s, 2), u = (e) => {
																				var n = tx(), r = ge(n, !0);
																				G(() => w(r, z(t).email)), I(e, n);
																			};
																			P(l, (e) => {
																				z(t).email && e(u);
																			}), D(o), G(() => w(c, z(t).name)), I(e, r);
																		},
																		$$slots: { default: !0 }
																	});
																}), I(e, n);
															});
															var a = W(r, 2), s = (e) => {
																var t = rx(), n = ge(t, !0);
																G(() => w(n, z(A).loading)), I(e, t);
															}, c = (e) => {
																var t = ax(), n = K(t), r = (e) => {
																	var t = ix(), n = ge(t, !0);
																	G(() => w(n, z(A).loadMore)), _e("pointerdown", t, (e) => e.preventDefault()), _e("click", t, () => L.more()), I(e, t);
																};
																P(n, (e) => {
																	o() && L.next && e(r);
																});
																var i = W(n, 2);
																E(i, () => Sc, (e, t) => {
																	t(e, {
																		part: "empty",
																		children: (e, t) => {
																			ne();
																			var n = fe();
																			G(() => w(n, z(A).noResults)), I(e, n);
																		},
																		$$slots: { default: !0 }
																	});
																}), I(e, t);
															};
															P(a, (e) => {
																z(me) ? e(s) : e(c, -1);
															}), I(e, n);
														},
														$$slots: { default: !0 }
													});
												},
												$$slots: { default: !0 }
											});
										}), I(e, n);
									},
									$$slots: { default: !0 }
								});
							}), I(e, n);
						},
						$$slots: { default: !0 }
					});
				});
			}
			D(r), I(e, r);
		},
		$$slots: { default: !0 }
	}), I(e, Ee), y(q);
}
we(["click", "pointerdown"]), U(cx, {
	people: { type: "Array" },
	source: { type: "Object" },
	value: { attribute: "value" },
	multiple: {
		attribute: "multiple",
		type: "Boolean"
	},
	placeholder: {
		attribute: "placeholder",
		type: "String"
	},
	label: {
		attribute: "label",
		type: "String"
	},
	loading: {
		attribute: "loading",
		type: "Boolean"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	disabled: {
		attribute: "disabled",
		reflect: !0,
		type: "Boolean"
	},
	strings: { type: "Object" },
	name: {
		attribute: "name",
		reflect: !0,
		type: "String"
	},
	required: {
		attribute: "required",
		type: "Boolean"
	},
	readonly: {
		attribute: "readonly",
		reflect: !0,
		type: "Boolean"
	},
	description: {
		attribute: "description",
		type: "String"
	},
	error: {
		attribute: "error",
		type: "String"
	},
	invalid: {
		attribute: "invalid",
		type: "Boolean"
	}
}, [], [], {
	mode: "open",
	delegatesFocus: !0
}, Er);
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/popover/use-popover-context.js
var [lx, ux] = Rt({ name: "PopoverContext" }), dx = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function fx(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, dx), i = ux(), a = _(() => X(i().getAnchorProps(), r));
	return Q(e, Y({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(fx, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/popover/popover-content.svelte
var px = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function mx(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, px), i = ux(), a = io(), o = _(() => X(i().getContentProps(), a().getPresenceProps(), r));
	function s(e) {
		a().setNode(e);
	}
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	}, l = F(), u = K(l), d = (e) => {
		Q(e, Y({ as: "div" }, () => z(o), {
			[ce()]: s,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = _(() => !a().unmounted);
	return P(u, (e) => {
		z(f) && e(d);
	}), I(e, l), y(c);
}
U(mx, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/popover/popover-positioner.svelte
var hx = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function gx(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, hx), i = ux(), a = io(), o = _(() => X(i().getPositionerProps(), r));
	var s = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	}, c = F(), l = K(c), u = (e) => {
		Q(e, Y({ as: "div" }, () => z(o), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, d = _(() => !a().unmounted);
	return P(l, (e) => {
		z(d) && e(u);
	}), I(e, c), y(s);
}
U(gx, { ref: {} }, [], [], { mode: "open" });
var _x = ln("popover").parts("arrow", "arrowTip", "anchor", "trigger", "indicator", "positioner", "content", "title", "description", "closeTrigger").build(), vx = (e) => e.ids?.anchor ?? `popover:${e.id}:anchor`, yx = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `popover:${e.id}:trigger:${t}` : `popover:${e.id}:trigger` : et(n) ? n(t) : n;
}, bx = (e) => e.ids?.content ?? `popover:${e.id}:content`, xx = (e) => e.ids?.positioner ?? `popover:${e.id}:popper`, Sx = (e) => e.ids?.arrow ?? `popover:${e.id}:arrow`, Cx = (e) => e.ids?.title ?? `popover:${e.id}:title`, wx = (e) => e.ids?.description ?? `popover:${e.id}:desc`, Tx = (e) => e.ids?.closeTrigger ?? `popover:${e.id}:close`, Ex = (e) => e.getById(vx(e)), Dx = (e) => e.getById(yx(e)), Ox = (e) => ht(e.getRootNode(), `[data-scope="popover"][data-part="trigger"]${qt(e.id)}`), kx = (e, t) => t == null ? Dx(e) ?? Ox(e)[0] : e.getById(yx(e, t)), Ax = (e) => e.getById(bx(e)), jx = (e) => e.getById(xx(e)), Mx = (e) => e.getById(Cx(e)), Nx = (e) => e.getById(wx(e)), Px = { closeTriggerLabel: "close" };
function Fx(e, t) {
	let { state: n, context: r, send: i, computed: a, prop: o, scope: s } = e, c = He(Px, o("translations")), l = n.matches("open"), u = r.get("currentPlacement"), d = u ? Go(u) : void 0, f = a("currentPortalled"), p = r.get("renderedElements"), m = r.get("triggerValue"), h = us({
		...o("positioning"),
		placement: u
	});
	return {
		portalled: f,
		open: l,
		setOpen(e) {
			n.matches("open") !== e && i({ type: e ? "OPEN" : "CLOSE" });
		},
		triggerValue: m,
		setTriggerValue(e) {
			i({
				type: "TRIGGER_VALUE.SET",
				value: e
			});
		},
		reposition(e = {}) {
			i({
				type: "POSITIONING.SET",
				options: e
			});
		},
		getArrowProps() {
			return t.element({
				id: Sx(s),
				..._x.arrow.attrs,
				dir: o("dir"),
				style: h.arrow
			});
		},
		getArrowTipProps() {
			return t.element({
				..._x.arrowTip.attrs,
				dir: o("dir"),
				style: h.arrowTip
			});
		},
		getAnchorProps() {
			return t.element({
				..._x.anchor.attrs,
				dir: o("dir"),
				id: vx(s)
			});
		},
		getTriggerProps(e = {}) {
			let { value: n } = e, r = n != null && m === n;
			return t.button({
				..._x.trigger.attrs,
				dir: o("dir"),
				type: "button",
				"data-placement": u,
				"data-side": d,
				id: yx(s, n),
				"data-ownedby": s.id,
				"data-value": n,
				"data-current": Z(r),
				"aria-haspopup": "dialog",
				"aria-expanded": n == null ? l : l && r,
				"data-state": l ? "open" : "closed",
				"aria-controls": bx(s),
				onPointerDown(e) {
					Fn(e) && Ze() && e.currentTarget.focus();
				},
				onClick(e) {
					e.defaultPrevented || i({
						type: l && n != null && !r ? "TRIGGER_VALUE.SET" : "TOGGLE",
						value: n
					});
				},
				onBlur(e) {
					i({
						type: "TRIGGER_BLUR",
						target: e.relatedTarget
					});
				}
			});
		},
		getIndicatorProps() {
			return t.element({
				..._x.indicator.attrs,
				dir: o("dir"),
				"data-state": l ? "open" : "closed"
			});
		},
		getPositionerProps() {
			return t.element({
				id: xx(s),
				..._x.positioner.attrs,
				dir: o("dir"),
				style: h.floating
			});
		},
		getContentProps() {
			return t.element({
				..._x.content.attrs,
				dir: o("dir"),
				id: bx(s),
				tabIndex: -1,
				role: "dialog",
				"aria-modal": pn(o("modal")),
				hidden: !l,
				"data-state": l ? "open" : "closed",
				"data-expanded": Z(l),
				"aria-labelledby": p.title ? Cx(s) : void 0,
				"aria-describedby": p.description ? wx(s) : void 0,
				"data-placement": u,
				"data-side": d
			});
		},
		getTitleProps() {
			return t.element({
				..._x.title.attrs,
				id: Cx(s),
				dir: o("dir")
			});
		},
		getDescriptionProps() {
			return t.element({
				..._x.description.attrs,
				id: wx(s),
				dir: o("dir")
			});
		},
		getCloseTriggerProps() {
			return t.button({
				..._x.closeTrigger.attrs,
				dir: o("dir"),
				id: Tx(s),
				type: "button",
				"aria-label": c.closeTriggerLabel,
				onClick(e) {
					e.defaultPrevented || (e.stopPropagation(), i({ type: "CLOSE" }));
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popover@1.43.3/node_modules/@zag-js/popover/dist/popover.machine.mjs
var Ix = Pn({
	props({ props: e }) {
		return {
			closeOnInteractOutside: !0,
			closeOnEscape: !0,
			autoFocus: !0,
			modal: !1,
			portalled: !0,
			restoreFocus: !0,
			...e,
			positioning: {
				placement: "bottom",
				...e.positioning
			}
		};
	},
	initialState({ prop: e }) {
		return e("open") || e("defaultOpen") ? "open" : "closed";
	},
	context({ bindable: e, prop: t, scope: n }) {
		return {
			currentPlacement: e(() => ({ defaultValue: void 0 })),
			renderedElements: e(() => ({ defaultValue: {
				title: !0,
				description: !0
			} })),
			triggerValue: e(() => ({
				defaultValue: t("defaultTriggerValue") ?? null,
				value: t("triggerValue"),
				onChange(e) {
					let r = t("onTriggerValueChange");
					r && r({
						value: e,
						triggerElement: kx(n, e)
					});
				}
			}))
		};
	},
	computed: { currentPortalled: ({ prop: e }) => !!e("modal") || !!e("portalled") },
	watch({ track: e, prop: t, action: n }) {
		e([() => t("open")], () => {
			n(["toggleVisibility"]);
		});
	},
	entry: ["checkRenderedElements"],
	on: { "TRIGGER_VALUE.SET": { actions: ["setTriggerValue", "reposition"] } },
	states: {
		closed: { on: {
			"CONTROLLED.OPEN": {
				target: "open",
				actions: ["setInitialFocus"]
			},
			TOGGLE: [{
				guard: "isOpenControlled",
				actions: ["invokeOnOpen", "setTriggerValue"]
			}, {
				target: "open",
				actions: [
					"invokeOnOpen",
					"setTriggerValue",
					"setInitialFocus"
				]
			}],
			OPEN: [{
				guard: "isOpenControlled",
				actions: ["invokeOnOpen", "setTriggerValue"]
			}, {
				target: "open",
				actions: [
					"invokeOnOpen",
					"setTriggerValue",
					"setInitialFocus"
				]
			}]
		} },
		open: {
			effects: [
				"trapFocus",
				"preventScroll",
				"hideContentBelow",
				"trackDismissableElement",
				"trackPositioning",
				"proxyTabFocus"
			],
			on: {
				"CONTROLLED.CLOSE": {
					target: "closed",
					actions: ["setFinalFocus"]
				},
				CLOSE: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closed",
					actions: ["invokeOnClose", "setFinalFocus"]
				}],
				TOGGLE: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closed",
					actions: ["invokeOnClose"]
				}],
				"POSITIONING.SET": { actions: ["reposition"] }
			}
		}
	},
	implementations: {
		guards: { isOpenControlled: ({ prop: e }) => e("open") != null },
		effects: {
			trackPositioning({ context: e, prop: t, scope: n }) {
				e.set("currentPlacement", t("positioning").placement);
				let r = Ex(n);
				return cs(() => r ?? kx(n, e.get("triggerValue")), () => jx(n), {
					...t("positioning"),
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			trackDismissableElement({ send: e, prop: t, scope: n }) {
				let r = () => Ax(n), i = !0;
				return sc(r, {
					type: "popover",
					pointerBlocking: t("modal"),
					exclude: [Dx(n), ...Ox(n)].filter(Boolean),
					defer: !0,
					onEscapeKeyDown(e) {
						t("onEscapeKeyDown")?.(e), !t("closeOnEscape") && e.preventDefault();
					},
					onInteractOutside(e) {
						t("onInteractOutside")?.(e), !e.defaultPrevented && (i = !(e.detail.focusable || e.detail.contextmenu), t("closeOnInteractOutside") || e.preventDefault());
					},
					onPointerDownOutside: t("onPointerDownOutside"),
					onFocusOutside: t("onFocusOutside"),
					persistentElements: t("persistentElements"),
					onRequestDismiss: t("onRequestDismiss"),
					onDismiss() {
						e({
							type: "CLOSE",
							src: "interact-outside",
							restoreFocus: i
						});
					}
				});
			},
			proxyTabFocus({ prop: e, scope: t, context: n }) {
				return e("modal") || !e("portalled") ? void 0 : Aa(() => Ax(t), {
					triggerElement: kx(t, n.get("triggerValue")),
					defer: !0,
					getShadowRoot: !0,
					onFocus(e) {
						e.focus({ preventScroll: !0 });
					}
				});
			},
			hideContentBelow({ prop: e, scope: t, context: n }) {
				return e("modal") ? Qd(() => [Ax(t), kx(t, n.get("triggerValue"))], { defer: !0 }) : void 0;
			},
			preventScroll({ prop: e, scope: t }) {
				if (e("modal")) return xf(t.getDoc());
			},
			trapFocus({ prop: e, scope: t, context: n }) {
				return e("modal") ? mf(() => Ax(t), {
					preventScroll: !0,
					returnFocusOnDeactivate: !!e("restoreFocus"),
					initialFocus: () => pa({
						root: Ax(t),
						getInitialEl: e("initialFocusEl"),
						enabled: e("autoFocus")
					}),
					setReturnFocus: (r) => {
						let i = e("finalFocusEl")?.();
						if (i) return i;
						let a = n.get("triggerValue");
						if (a) {
							let e = kx(t, a);
							if (e) return e;
						}
						return Ox(t)[0] || r;
					},
					getShadowRoot: !0
				}) : void 0;
			}
		},
		actions: {
			reposition({ event: e, prop: t, scope: n, context: r }) {
				let i = Ex(n);
				cs(() => i ?? kx(n, r.get("triggerValue")), () => jx(n), {
					...t("positioning"),
					...e.options,
					defer: !0,
					listeners: !1,
					onComplete(e) {
						r.set("currentPlacement", e.placement);
					}
				});
			},
			setTriggerValue({ context: e, event: t }) {
				t.value !== void 0 && e.set("triggerValue", t.value);
			},
			checkRenderedElements({ context: e, scope: t }) {
				en(() => {
					Object.assign(e.get("renderedElements"), {
						title: !!Mx(t),
						description: !!Nx(t)
					});
				});
			},
			setInitialFocus({ prop: e, scope: t }) {
				e("modal") || en(() => {
					pa({
						root: Ax(t),
						getInitialEl: e("initialFocusEl"),
						enabled: e("autoFocus")
					})?.focus({ preventScroll: !0 });
				});
			},
			setFinalFocus({ event: e, prop: t, scope: n, context: r }) {
				let i = e.restoreFocus ?? e.previousEvent?.restoreFocus;
				(i == null || i) && t("restoreFocus") && en(() => {
					let e = t("finalFocusEl")?.();
					if (e) {
						e.focus({ preventScroll: !0 });
						return;
					}
					kx(n, r.get("triggerValue"))?.focus({ preventScroll: !0 });
				});
			},
			invokeOnOpen({ prop: e, flush: t }) {
				t(() => {
					e("onOpenChange")?.({ open: !0 });
				});
			},
			invokeOnClose({ prop: e, flush: t }) {
				t(() => {
					e("onOpenChange")?.({ open: !1 });
				});
			},
			toggleVisibility({ event: e, send: t, prop: n }) {
				t({
					type: n("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
					previousEvent: e
				});
			}
		}
	}
}), Lx = (e) => {
	let t = Nt(), n = gn(), r = _(() => {
		let r = St(e) || {};
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = Tn(Ix, () => z(r)), a = _(() => Fx(i, Wt));
	return () => z(a);
}, Rx = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open",
	"children"
]);
function zx(e, t) {
	let n = m();
	O(t, !0);
	let r = R(t, "open", 15), i = R(t, "children", 7), a = q(t, Rx), o = _(() => no(a)), s = _(() => C(z(o), 2)), c = _(() => z(s)[0]), l = _(() => z(s)[1]), u = _(() => ({
		...z(l),
		id: z(l).id ?? n,
		open: r(),
		onOpenChange(e) {
			z(l).onOpenChange?.(e), r() !== void 0 && r(e.open);
		}
	})), d = Lx(() => z(u)), f = _(() => ({
		...z(c),
		present: d().open
	})), p = to(() => z(f));
	lx(d), ro(p);
	var h = {
		get open() {
			return r();
		},
		set open(e) {
			r(e), M();
		},
		get children() {
			return i();
		},
		set children(e) {
			i(e), M();
		}
	}, g = F(), v = K(g);
	return ye(v, () => i() ?? b), I(e, g), y(h);
}
U(zx, {
	open: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/popover/popover-trigger.svelte
var Bx = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Vx(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, Bx), i = _(() => yn()(r, ["value"])), a = _(() => C(z(i), 2)), o = _(() => z(a)[0]), s = _(() => z(a)[1]), c = ux(), l = io(), u = _(() => {
		let e = c().getTriggerProps(z(o));
		return X({
			...e,
			"aria-controls": l().unmounted ? void 0 : e["aria-controls"]
		}, z(s));
	});
	return Q(e, Y({ as: "button" }, () => z(u), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(Vx, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Popover.svelte
var Hx = L("<!> <!>", 1), Ux = L("<div class=\"af-kit\"><!></div>"), Wx = {
	hash: "svelte-1netzpl",
	code: "[data-scope='popover'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='popover'][data-part='anchor'] {display:inline-block;}[data-scope='popover'][data-part='content'] {min-width:18rem;max-width:min(28rem, calc(100vw - 32px));padding:16px;outline:none;}\n  @media (forced-colors: active) {[data-scope='popover'][data-part='content']:focus-visible {outline:2px solid;outline-offset:2px;} }"
};
function Gx(e, r) {
	O(r, !0), ee(e, Wx);
	let i = R(r, "open", 7, !1), a = R(r, "placement", 7, "bottom-start"), o = r.$$host, c = B(null), l = "outside";
	Te(() => s(z(c), !!i(), o));
	let u = "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])", d = !1;
	Te(() => {
		i() && (d = !1);
	});
	let f = () => o.shadowRoot?.querySelector("slot[name=\"anchor\"]");
	function p(e) {
		let t = f()?.assignedElements() ?? [];
		for (let n = e; n; n = n.parentNode ?? (n instanceof ShadowRoot ? n.host : null)) if (t.includes(n)) return !0;
		return !1;
	}
	function m() {
		if (d) return null;
		let e = o.ownerDocument, t = !e.activeElement || e.activeElement === e.body, n = o.getRootNode().activeElement;
		if (!t && !(n && o.contains(n))) return null;
		for (let e of f()?.assignedElements() ?? []) {
			if (e.matches(u)) return e;
			let t = e.querySelector(u);
			if (t) return t;
		}
		return null;
	}
	let h = (e) => e.composedPath().some((e) => e instanceof HTMLElement && e.localName === "af-tooltip" && e.dataset.raised === "true" && o.contains(e));
	var g = {
		get open() {
			return i();
		},
		set open(e = !1) {
			i(e), M();
		},
		get placement() {
			return a();
		},
		set placement(e = "bottom-start") {
			a(e), M();
		}
	}, v = Hx(), b = K(v);
	t(b, {});
	var x = W(b, 2);
	return Yt(x, {
		value: () => o.shadowRoot,
		children: (e, t) => {
			var s = Ux(), u = H(s);
			{
				let e = _(() => !!i()), t = _(() => ({
					strategy: "fixed",
					placement: a() || "bottom-start"
				}));
				E(u, () => zx, (i, a) => {
					a(i, {
						get open() {
							return z(e);
						},
						closeOnEscape: !0,
						portalled: !1,
						get positioning() {
							return z(t);
						},
						finalFocusEl: m,
						onEscapeKeyDown: (e) => {
							h(e) ? e.preventDefault() : qn(e) && e.defaultPrevented ? n(o, "close", { reason: "escape" }) : l = "escape";
						},
						onInteractOutside: (e) => {
							let t = e.detail.target ?? null;
							if (p(t instanceof Node ? t : null)) {
								e.preventDefault();
								return;
							}
							l = "outside", d = !0;
						},
						onOpenChange: (e) => {
							e.open || (n(o, "close", { reason: l }), l = "outside");
						},
						children: (e, t) => {
							var n = Hx(), i = K(n);
							E(i, () => fx, (e, t) => {
								t(e, {
									part: "anchor",
									children: (e, t) => {
										var n = F(), i = K(n);
										oe(i, r, "anchor", {}, null), I(e, n);
									},
									$$slots: { default: !0 }
								});
							});
							var a = W(i, 2);
							E(a, () => gx, (e, t) => {
								t(e, {
									popover: "manual",
									get ref() {
										return z(c);
									},
									set ref(e) {
										J(c, e, !0);
									},
									children: (e, t) => {
										var n = F(), i = K(n);
										E(i, () => mx, (e, t) => {
											t(e, {
												class: "af-overlay popover",
												part: "content",
												children: (e, t) => {
													var n = F(), i = K(n);
													oe(i, r, "content", {}, null), I(e, n);
												},
												$$slots: { default: !0 }
											});
										}), I(e, n);
									},
									$$slots: { default: !0 }
								});
							}), I(e, n);
						},
						$$slots: { default: !0 }
					});
				});
			}
			D(s), I(e, s);
		},
		$$slots: { default: !0 }
	}), I(e, v), y(g);
}
U(Gx, {
	open: {
		attribute: "open",
		type: "Boolean"
	},
	placement: {
		attribute: "placement",
		type: "String"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, ["anchor", "content"], [], { mode: "open" });
//#endregion
//#region src/kit/RichEditor.svelte
var Kx = ae("<svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5\"></path><path d=\"M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5\"></path></svg>"), qx = L("<form class=\"link-form svelte-9gj0md\" novalidate=\"\"><input part=\"link-input\" type=\"url\" inputmode=\"url\" placeholder=\"https://\" class=\"svelte-9gj0md\"/> <button type=\"submit\" class=\"af-button primary\" part=\"link-apply\"> </button></form>"), Jx = L("<!> <!>", 1), Yx = L("<div part=\"toolbar\" class=\"toolbar svelte-9gj0md\"><button type=\"button\" part=\"tool-bold\" class=\"tool svelte-9gj0md\"><b>B</b></button> <button type=\"button\" part=\"tool-italic\" class=\"tool svelte-9gj0md\"><i>I</i></button> <button type=\"button\" part=\"tool-bullet-list\" class=\"tool svelte-9gj0md\">•</button> <button type=\"button\" part=\"tool-numbered-list\" class=\"tool svelte-9gj0md\">1.</button> <!></div>"), Xx = L("<span part=\"placeholder\" class=\"placeholder svelte-9gj0md\" aria-hidden=\"true\"> </span>"), Zx = L("<div class=\"mention-empty svelte-9gj0md\"> </div>"), Qx = L("<div class=\"mention-title svelte-9gj0md\" part=\"mention-title\" aria-hidden=\"true\"> </div>"), $x = L("<div class=\"mention-scope svelte-9gj0md\" part=\"mention-scope\" role=\"option\" tabindex=\"-1\" data-kind=\"scope\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\" class=\"svelte-9gj0md\"><circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-3.5-3.5\"></path></svg> <span class=\"mention-name svelte-9gj0md\"> </span></div>"), eS = L("<div class=\"mention-scopes svelte-9gj0md\"></div>"), tS = L("<span class=\"mention-name svelte-9gj0md\"> </span>"), nS = L("<span class=\"mention-meta svelte-9gj0md\"> </span>"), rS = L("<span class=\"mention-meta mention-side svelte-9gj0md\"> </span>"), iS = L("<span class=\"af-avatar mention-avatar svelte-9gj0md\" aria-hidden=\"true\"> </span> <span class=\"mention-text svelte-9gj0md\"><span class=\"mention-name svelte-9gj0md\"> </span> <!></span> <!>", 1), aS = L("<div class=\"mention-option svelte-9gj0md\" part=\"mention-option\" role=\"option\" tabindex=\"-1\"><!></div>"), oS = L("<div class=\"mention-group\" role=\"group\"><!> <!></div>"), sS = L("<div class=\"af-kit editor svelte-9gj0md\"><!> <div class=\"surface svelte-9gj0md\"><!> <div part=\"content\" class=\"content svelte-9gj0md\"></div></div> <div part=\"mention-menu\" class=\"af-overlay mention-menu svelte-9gj0md\" popover=\"manual\" role=\"listbox\"><!></div></div>"), cS = {
	hash: "svelte-9gj0md",
	code: ".editor.svelte-9gj0md {display:flex;flex-direction:column;border:1px solid var(--k-line);border-radius:var(--k-radius);background:var(--k-surface);}.editor.svelte-9gj0md:focus-within {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring);}.editor[data-readonly].svelte-9gj0md {border-color:transparent;background:transparent;}.toolbar.svelte-9gj0md {display:flex;gap:2px;padding:4px;border-bottom:1px solid var(--k-line);}.tool.svelte-9gj0md, [data-scope='popover'][data-part='trigger'].tool {min-width:28px;height:28px;padding:0 6px;border:0;border-radius:4px;background:none;color:var(--k-fg);font:inherit;cursor:pointer;}.tool.svelte-9gj0md:not(:disabled):hover, [data-scope='popover'][data-part='trigger'].tool:hover {background:color-mix(in oklab, var(--k-fg) 6%, transparent);}.tool.svelte-9gj0md:not(:disabled):active {background:color-mix(in oklab, var(--k-fg) 10%, transparent);}.tool[aria-pressed='true'].svelte-9gj0md, [data-scope='popover'][data-part='trigger'].tool[aria-pressed='true'] {background:color-mix(in oklab, var(--k-primary) 14%, transparent);}.tool.svelte-9gj0md:disabled {opacity:0.55;cursor:default;}.tool.svelte-9gj0md:focus-visible {outline:none;box-shadow:0 0 0 3px var(--k-focus-ring);}.surface.svelte-9gj0md {position:relative;}.placeholder.svelte-9gj0md {position:absolute;inset:8px 12px auto;color:var(--k-muted);pointer-events:none;}.content.svelte-9gj0md > [contenteditable] {min-height:4.5em;padding:8px 12px;outline:none;white-space:pre-wrap;word-wrap:break-word;font-variant-ligatures:none;}.editor[data-readonly].svelte-9gj0md .content:where(.svelte-9gj0md) > [contenteditable] {min-height:0;padding:0;}.content.svelte-9gj0md p {margin:0 0 0.5em;}.content.svelte-9gj0md > [contenteditable] > :last-child {margin-bottom:0;}.content.svelte-9gj0md ul, .content.svelte-9gj0md ol {margin:0 0 0.5em;padding-left:1.5em;}.content.svelte-9gj0md a {color:var(--k-primary);}.editor[data-single-line].svelte-9gj0md .content:where(.svelte-9gj0md) > [contenteditable] {min-height:0;padding:4px 8px;white-space:nowrap;overflow:hidden;}.editor[data-single-line].svelte-9gj0md .content:where(.svelte-9gj0md) p {margin:0;}.content.svelte-9gj0md .af-mention-holder {display:inline;}.content.svelte-9gj0md .af-mention {display:inline-flex;align-items:center;gap:4px;padding:0 6px;border-radius:999px;vertical-align:baseline;background:color-mix(in oklab, var(--k-primary) 12%, transparent);color:var(--k-fg);font-size:0.95em;line-height:1.5;}.content.svelte-9gj0md .af-mention[data-state='restricted'] {background:color-mix(in oklab, var(--k-fg) 7%, transparent);color:var(--k-muted);}.content.svelte-9gj0md .af-mention[data-state='deleted'] {background:color-mix(in oklab, var(--k-fg) 7%, transparent);color:var(--k-muted);}.content.svelte-9gj0md .af-mention[data-state='deleted'] .af-mention-label {text-decoration:line-through;}.content.svelte-9gj0md .af-mention-link {color:inherit;text-decoration:none;}.content.svelte-9gj0md .af-mention-link:hover {text-decoration:underline;}.content.svelte-9gj0md .af-mention-avatar {width:16px;height:16px;font-size:10px;}.content.svelte-9gj0md table {border-collapse:collapse;}.content.svelte-9gj0md th, .content.svelte-9gj0md td {border:1px solid var(--k-line);padding:4px 8px;}.content.svelte-9gj0md ul[data-type='taskList'] {list-style:none;padding-left:0.25em;}.content.svelte-9gj0md ul[data-type='taskList'] li {display:flex;gap:6px;}[data-scope='popover'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}.mention-menu.svelte-9gj0md {position:fixed;inset:auto;margin:0;padding:4px;min-width:240px;max-width:360px;max-height:320px;}.mention-menu.svelte-9gj0md:popover-open {display:flex;flex-direction:column;}.mention-title.svelte-9gj0md {padding:6px 8px 2px;color:var(--k-muted);font-size:12px;font-weight:600;}.mention-option.svelte-9gj0md {display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:4px;cursor:pointer;}.mention-option[aria-selected='true'].svelte-9gj0md {background:color-mix(in oklab, var(--k-primary) 10%, transparent);}.mention-avatar.svelte-9gj0md {flex:none;width:24px;height:24px;font-size:12px;}.mention-text.svelte-9gj0md {display:flex;flex-direction:column;min-width:0;flex:1;}.mention-name.svelte-9gj0md {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.mention-meta.svelte-9gj0md {color:var(--k-muted);font-size:12px;}.mention-side.svelte-9gj0md {flex:none;}.mention-empty.svelte-9gj0md {padding:8px;color:var(--k-muted);}.mention-scopes.svelte-9gj0md {display:flex;flex-wrap:wrap;gap:4px;padding:4px 8px 6px;}.mention-scope.svelte-9gj0md {display:inline-flex;align-items:center;gap:4px;max-width:100%;padding:2px 8px;border:1px solid var(--k-line);border-radius:999px;color:var(--k-fg);font-size:12px;cursor:pointer;}.mention-scope.svelte-9gj0md svg:where(.svelte-9gj0md) {flex:none;color:var(--k-muted);}.mention-scope[aria-selected='true'].svelte-9gj0md {border-color:var(--k-primary);background:color-mix(in oklab, var(--k-primary) 10%, transparent);}.link-form.svelte-9gj0md {display:flex;gap:6px;padding:8px;}.link-form.svelte-9gj0md input:where(.svelte-9gj0md) {min-width:240px;min-height:32px;padding:0 8px;border:1px solid var(--k-line);border-radius:var(--k-radius);background:var(--k-bg);color:var(--k-fg);font:inherit;}.link-form.svelte-9gj0md input:where(.svelte-9gj0md):focus-visible {outline:none;border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring);}\n  @media (forced-colors: active) {.editor.svelte-9gj0md:focus-within {outline:2px solid;outline-offset:1px;}.tool.svelte-9gj0md:focus-visible, .link-form.svelte-9gj0md input:where(.svelte-9gj0md):focus-visible {outline:2px solid;outline-offset:1px;}\n  }"
};
function lS(e, r) {
	O(r, !0), ee(e, cS);
	let i = R(r, "value", 7, ""), a = R(r, "readonly", 7, !1), o = R(r, "placeholder", 7, null), l = R(r, "label", 7, null), u = R(r, "locale", 7, null), d = R(r, "strings", 7, null), f = R(r, "mentions", 7, null), p = R(r, "singleLine", 7, !1), m = R(r, "mentionMap", 7, null), g = r.$$host, v = _(() => c(u(), d() ?? void 0)), b = B(null), x = B(null), S = B(!0), C = B(pe({
		bold: !1,
		italic: !1,
		bulletList: !1,
		orderedList: !1,
		link: !1
	})), T = B(!1), te = B(""), ne = B(null);
	Te(() => s(z(ne), z(T), g));
	let re = null, ie = null, k = B(null), A = B(0), ae = B(null), oe = `af-mention-${Math.random().toString(36).slice(2, 9)}`;
	Te(() => s(z(ae), z(k) !== null, g)), Te(() => me(g, "keydown", (e) => {
		e.key === "Escape" && qn(e) && e.defaultPrevented && z(k) && (z(x) && re?.(z(x).view), J(k, null));
	})), Te(() => {
		let e = z(k)?.rect?.();
		z(ae) && e && (z(ae).style.left = `${Math.max(0, e.left)}px`, z(ae).style.top = `${e.bottom + 4}px`);
	});
	let se = _(() => {
		let e = [];
		return (z(k)?.entries ?? []).forEach((t, n) => {
			let r = e[e.length - 1];
			r && r.key === t.group ? r.rows.push({
				entry: t,
				at: n
			}) : e.push({
				key: t.group,
				title: t.title,
				rows: [{
					entry: t,
					at: n
				}]
			});
		}), e;
	});
	async function ce(e) {
		let t = z(k);
		if (!t) return;
		if (e.kind === "item") {
			t.command(e);
			return;
		}
		let n = f(), r = Yn(e);
		if (!n || !r) return;
		let i = await n(t.query, r);
		if (z(k) !== t) return;
		let a = ie?.(i) ?? [];
		J(k, {
			...t,
			entries: a
		}), J(A, 0);
	}
	let L = (e) => e.some((e) => e.kind !== "scope"), le = (e) => !L(e.entries) && /\s/.test(e.query.trim()), de = {
		show(e) {
			J(k, le(e) ? null : e), J(A, 0);
		},
		update(e) {
			J(k, le(e) ? null : e), J(A, 0);
		},
		hide() {
			J(k, null);
		},
		key(e) {
			let t = z(k);
			if (!t) return !1;
			let n = t.entries.length;
			if (e.key === "Escape") return z(x) && re?.(z(x).view), J(k, null), !0;
			if (n === 0) return !1;
			if (e.key === "ArrowDown") return J(A, (z(A) + 1) % n), !0;
			if (e.key === "ArrowUp") return J(A, (z(A) - 1 + n) % n), !0;
			if (e.key === "Enter" || e.key === "Tab") {
				let e = t.entries[z(A)];
				return e && ce(e), !0;
			}
			return !1;
		}
	};
	Te(() => {
		let e = z(x)?.view.dom;
		if (e) {
			if (z(k)) e.setAttribute("aria-haspopup", "listbox"), e.setAttribute("aria-expanded", "true"), e.setAttribute("aria-controls", oe), z(k).entries.length > 0 ? e.setAttribute("aria-activedescendant", `${oe}-${z(A)}`) : e.removeAttribute("aria-activedescendant");
			else for (let t of [
				"aria-expanded",
				"aria-controls",
				"aria-activedescendant"
			]) e.removeAttribute(t);
		}
	}), Te(() => {
		z(x) && Jn(z(x), {
			map: m() ?? null,
			strings: z(v)
		});
	});
	let V, fe = null, U = !1, he = !1, ve = (e) => e.getMarkdown().replace(/\u00A0+$/gm, "").trimEnd();
	function ye() {
		if (clearTimeout(V), V = void 0, !z(x) || !U) return;
		U = !1;
		let e = ve(z(x));
		e !== (i() ?? "") && e !== fe && (fe = e, n(g, "change", { value: e }));
	}
	function be(e, t) {
		he = !1, ve(e) !== t && (e.commands.setContent(t, {
			contentType: "markdown",
			emitUpdate: !1
		}), U = !1, fe = null);
	}
	function Ce(e) {
		J(S, e.isEmpty, !0), J(C, {
			bold: e.isActive("bold"),
			italic: e.isActive("italic"),
			bulletList: e.isActive("bulletList"),
			orderedList: e.isActive("orderedList"),
			link: e.isActive("link")
		}, !0);
	}
	Te(() => {
		let e = z(b);
		if (!e) return;
		let t = !!p(), n = !1, r = null;
		return import("./chunks/markdown-_2Edvy_H.js").then(({ createMarkdownEditor: o, exitSuggestion: s, flatten: c }) => {
			if (n) return;
			re = s, ie = c;
			let l = o({
				element: e,
				content: Se(() => i() ?? ""),
				editable: Se(() => !a()),
				singleLine: t,
				mention: {
					source: () => Se(() => f()),
					controller: de,
					strings: () => Se(() => z(v))
				},
				onUpdate() {
					U = !0, clearTimeout(V), V = setTimeout(ye, 600);
				},
				onBlur() {
					ye(), he && be(l, i() ?? "");
				},
				onFocus() {}
			});
			Jn(l, {
				map: Se(() => m() ?? null),
				strings: Se(() => z(v))
			}), l.on("transaction", () => Ce(l)), r = l, Ce(l), J(x, l), g.editor = l;
		}), () => {
			n = !0, J(k, null), ye(), r?.destroy(), g.editor === r && (g.editor = null), J(x, null);
		};
	}), Te(() => {
		let e = i() ?? "", t = z(x);
		t && Se(() => {
			t.isFocused ? he = !0 : be(t, e);
		});
	}), Te(() => {
		let e = z(x)?.view.dom;
		e && (l() ? e.setAttribute("aria-label", l()) : e.removeAttribute("aria-label"));
	}), Te(() => {
		let e = !a();
		z(x) && z(x).isEditable !== e && z(x).setEditable(e, !1);
	});
	function we(e) {
		e && z(x) && J(te, z(x).getAttributes("link").href ?? "", !0), J(T, e, !0);
	}
	function q() {
		if (!z(x)) return;
		let e = z(te).trim(), t = z(x).chain().focus().extendMarkRange("link");
		e ? z(x).state.selection.empty && !z(x).isActive("link") ? t.insertContent({
			type: "text",
			text: e,
			marks: [{
				type: "link",
				attrs: { href: e }
			}]
		}).run() : t.setLink({ href: e }).run() : t.unsetLink().run(), J(T, !1);
	}
	let Y = (e) => e.preventDefault();
	var De = {
		get value() {
			return i();
		},
		set value(e = "") {
			i(e), M();
		},
		get readonly() {
			return a();
		},
		set readonly(e = !1) {
			a(e), M();
		},
		get placeholder() {
			return o();
		},
		set placeholder(e = null) {
			o(e), M();
		},
		get label() {
			return l();
		},
		set label(e = null) {
			l(e), M();
		},
		get locale() {
			return u();
		},
		set locale(e = null) {
			u(e), M();
		},
		get strings() {
			return d();
		},
		set strings(e = null) {
			d(e), M();
		},
		get mentions() {
			return f();
		},
		set mentions(e = null) {
			f(e), M();
		},
		get singleLine() {
			return p();
		},
		set singleLine(e = !1) {
			p(e), M();
		},
		get mentionMap() {
			return m();
		},
		set mentionMap(e = null) {
			m(e), M();
		}
	}, Oe = Jx(), ke = K(Oe);
	t(ke, {});
	var Ae = W(ke, 2);
	return Yt(Ae, {
		value: () => g.shadowRoot,
		children: (e, t) => {
			var n = sS(), r = H(n), i = (e) => {
				var t = Yx(), n = H(t), r = W(n, 2), i = W(r, 2), a = W(i, 2), o = W(a, 2);
				E(o, () => zx, (e, t) => {
					t(e, {
						get open() {
							return z(T);
						},
						portalled: !1,
						positioning: {
							strategy: "fixed",
							placement: "bottom-start"
						},
						onOpenChange: (e) => we(e.open),
						onEscapeKeyDown: (e) => {
							qn(e) && e.defaultPrevented && we(!1);
						},
						children: (e, t) => {
							var n = Jx(), r = K(n);
							{
								let e = _(() => !z(x));
								E(r, () => Vx, (t, n) => {
									n(t, {
										part: "tool-link",
										class: "tool",
										get "aria-label"() {
											return z(v).link;
										},
										get title() {
											return z(v).link;
										},
										get "aria-pressed"() {
											return z(C).link;
										},
										get disabled() {
											return z(e);
										},
										children: (e, t) => {
											var n = Kx();
											I(e, n);
										},
										$$slots: { default: !0 }
									});
								});
							}
							var i = W(r, 2);
							E(i, () => gx, (e, t) => {
								t(e, {
									popover: "manual",
									get ref() {
										return z(ne);
									},
									set ref(e) {
										J(ne, e, !0);
									},
									children: (e, t) => {
										var n = F(), r = K(n);
										E(r, () => mx, (e, t) => {
											t(e, {
												class: "af-overlay link",
												part: "link-popover",
												children: (e, t) => {
													var n = qx(), r = H(n);
													Ee(r);
													var i = W(r, 2), a = ge(i, !0);
													D(n), G(() => {
														N(r, "aria-label", z(v).link), w(a, z(v).confirm);
													}), xe("submit", n, (e) => {
														e.preventDefault(), q();
													}), j(r, () => z(te), (e) => J(te, e)), I(e, n);
												},
												$$slots: { default: !0 }
											});
										}), I(e, n);
									},
									$$slots: { default: !0 }
								});
							}), I(e, n);
						},
						$$slots: { default: !0 }
					});
				}), D(t), G(() => {
					N(n, "aria-label", z(v).bold), N(n, "title", z(v).bold), N(n, "aria-pressed", z(C).bold), n.disabled = !z(x), N(r, "aria-label", z(v).italic), N(r, "title", z(v).italic), N(r, "aria-pressed", z(C).italic), r.disabled = !z(x), N(i, "aria-label", z(v).bulletList), N(i, "title", z(v).bulletList), N(i, "aria-pressed", z(C).bulletList), i.disabled = !z(x), N(a, "aria-label", z(v).numberedList), N(a, "title", z(v).numberedList), N(a, "aria-pressed", z(C).orderedList), a.disabled = !z(x);
				}), _e("mousedown", n, Y), _e("click", n, () => z(x)?.chain().focus().toggleBold().run()), _e("mousedown", r, Y), _e("click", r, () => z(x)?.chain().focus().toggleItalic().run()), _e("mousedown", i, Y), _e("click", i, () => z(x)?.chain().focus().toggleBulletList().run()), _e("mousedown", a, Y), _e("click", a, () => z(x)?.chain().focus().toggleOrderedList().run()), I(e, t);
			};
			P(r, (e) => {
				!a() && !p() && e(i);
			});
			var s = W(r, 2), c = H(s), l = (e) => {
				var t = Xx(), n = ge(t, !0);
				G(() => w(n, o())), I(e, t);
			};
			P(c, (e) => {
				z(S) && o() && e(l);
			});
			var u = W(c, 2);
			ue(u, (e) => J(b, e), () => z(b)), D(s);
			var d = W(s, 2), f = H(d);
			Sn(f, {
				tabStop: !1,
				children: (e, t) => {
					var n = Jx(), r = K(n), i = (e) => {
						var t = Zx(), n = ge(t, !0);
						G(() => w(n, z(v).noResults)), I(e, t);
					}, a = _(() => !L(z(k)?.entries ?? []));
					P(r, (e) => {
						z(a) && e(i);
					});
					var o = W(r, 2);
					h(o, 17, () => z(se), (e) => e.key + e.title, (e, t) => {
						var n = oS(), r = H(n), i = (e) => {
							var n = Qx(), r = ge(n, !0);
							G(() => w(r, z(t).title)), I(e, n);
						};
						P(r, (e) => {
							z(t).title && e(i);
						});
						var a = W(r, 2), o = (e) => {
							var n = eS();
							h(n, 21, () => z(t).rows, ({ entry: e, at: t }) => t, (e, t) => {
								let n = () => z(t).entry, r = () => z(t).at;
								var i = $x(), a = W(H(i), 2), o = ge(a, !0);
								D(i), G(() => {
									N(i, "id", `${oe}-${r() ?? ""}`), N(i, "aria-selected", r() === z(A)), N(i, "data-picked", r() === z(A) ? "" : void 0), N(i, "data-group", n().scope?.group), w(o, n().scope?.label);
								}), _e("mousedown", i, (e) => e.preventDefault()), xe("mouseenter", i, () => J(A, r(), !0)), _e("click", i, () => void ce(n())), _e("keydown", i, () => {}), I(e, i);
							}), D(n), I(e, n);
						}, s = _(() => z(t).rows.every(({ entry: e }) => e.kind === "scope")), c = (e) => {
							var n = F(), r = K(n);
							h(r, 17, () => z(t).rows, ({ entry: e, at: t }) => t, (e, t) => {
								let n = () => z(t).entry, r = () => z(t).at;
								var i = aS(), a = H(i), o = (e) => {
									var t = tS(), r = ge(t, !0);
									G(() => w(r, n().more?.label)), I(e, t);
								}, s = (e) => {
									var t = iS(), r = K(t), i = ge(r, !0), a = W(r, 2), o = H(a), s = ge(o, !0), c = W(o, 2), l = (e) => {
										var t = nS(), r = ge(t, !0);
										G(() => w(r, n().item.entity_label)), I(e, t);
									};
									P(c, (e) => {
										n().item.entity_label && e(l);
									}), D(a);
									var u = W(a, 2), d = (e) => {
										var t = rS(), r = ge(t, !0);
										G(() => w(r, n().item.meta)), I(e, t);
									};
									P(u, (e) => {
										n().item.meta && e(d);
									}), G((e) => {
										w(i, e), w(s, n().item.label);
									}, [() => Array.from(n().item.label.trim())[0]?.toUpperCase() ?? "?"]), I(e, t);
								};
								P(a, (e) => {
									n().kind === "more" ? e(o) : n().item && e(s, 1);
								}), D(i), G(() => {
									N(i, "id", `${oe}-${r() ?? ""}`), N(i, "aria-selected", r() === z(A)), N(i, "data-picked", r() === z(A) ? "" : void 0), N(i, "data-kind", n().kind);
								}), _e("mousedown", i, (e) => e.preventDefault()), xe("mouseenter", i, () => J(A, r(), !0)), _e("click", i, () => void ce(n())), _e("keydown", i, () => {}), I(e, i);
							}), I(e, n);
						};
						P(a, (e) => {
							z(s) ? e(o) : e(c, -1);
						}), D(n), G(() => N(n, "aria-label", z(t).title)), I(e, n);
					}), I(e, n);
				},
				$$slots: { default: !0 }
			}), D(d), ue(d, (e) => J(ae, e), () => z(ae)), D(n), G(() => {
				N(n, "data-readonly", a() ? "" : void 0), N(n, "data-single-line", p() ? "" : void 0), N(d, "id", oe), N(d, "aria-label", z(v).mentionMenu);
			}), I(e, n);
		},
		$$slots: { default: !0 }
	}), I(e, Oe), y(De);
}
we([
	"mousedown",
	"click",
	"keydown"
]), U(lS, {
	value: {
		attribute: "value",
		type: "String"
	},
	readonly: {
		attribute: "readonly",
		type: "Boolean"
	},
	placeholder: {
		attribute: "placeholder",
		type: "String"
	},
	label: {
		attribute: "label",
		type: "String"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" },
	mentions: { type: "Object" },
	singleLine: {
		attribute: "single-line",
		type: "Boolean"
	},
	mentionMap: {
		attribute: "mention-map",
		type: "Object"
	}
}, [], [], { mode: "open" }, (e) => class extends e {
	editor = null;
});
//#endregion
//#region src/kit/ScrollArea.svelte
var uS = L("<!> <div class=\"af-kit svelte-cu6e0i\"><!></div>", 1), dS = {
	hash: "svelte-cu6e0i",
	code: ":host {display:block;min-height:0;}.af-kit.svelte-cu6e0i {display:flex;flex-direction:column;box-sizing:border-box;height:100%;max-height:inherit;color:inherit;font:inherit;}"
};
function fS(e, n) {
	O(n, !0), ee(e, dS);
	let r = R(n, "axis", 7, "vertical"), i = R(n, "label", 7, null), a = _(() => r() === "horizontal" || r() === "both" ? r() : "vertical");
	var o = {
		get axis() {
			return r();
		},
		set axis(e = "vertical") {
			r(e), M();
		},
		get label() {
			return i();
		},
		set label(e = null) {
			i(e), M();
		}
	}, s = uS(), c = K(s);
	t(c, {});
	var l = W(c, 2), u = H(l);
	{
		let e = _(() => i() || null);
		Sn(u, {
			get axis() {
				return z(a);
			},
			get label() {
				return z(e);
			},
			contentPart: !0,
			children: (e, t) => {
				var r = F(), i = K(r);
				oe(i, n, "default", {}, null), I(e, r);
			},
			$$slots: { default: !0 }
		});
	}
	return D(l), I(e, s), y(o);
}
U(fS, {
	axis: {
		attribute: "axis",
		type: "String"
	},
	label: {
		attribute: "label",
		type: "String"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, ["default"], [], { mode: "open" }, (e) => class extends e {
	get viewport() {
		return this.shadowRoot?.querySelector("[data-scope=\"scroll-area\"][data-part=\"viewport\"]") ?? null;
	}
});
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/select/use-select-context.js
var [pS, mS] = Rt({ name: "SelectContext" }), hS = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function gS(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, hS), i = mS(), a = io(), o = _(() => X(i().getContentProps(), a().getPresenceProps(), r));
	function s(e) {
		a().setNode(e);
	}
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	}, l = F(), u = K(l), d = (e) => {
		Q(e, Y({ as: "div" }, () => z(o), {
			[ce()]: s,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = _(() => !a().unmounted);
	return P(u, (e) => {
		z(f) && e(d);
	}), I(e, l), y(c);
}
U(gS, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/select/select-indicator.svelte
var _S = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function vS(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, _S), i = mS(), a = _(() => X(i().getIndicatorProps(), r));
	return Q(e, Y({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(vS, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/select/use-select-item-context.js
var [yS, bS] = Rt({ name: "SelectItemContext" }), [xS, SS] = Rt({ name: "SelectItemPropsContext" }), CS = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function wS(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, CS), i = mS(), a = _(() => yn()(r, ["item", "persistFocus"])), o = _(() => C(z(a), 2)), s = _(() => z(o)[0]), c = _(() => z(o)[1]), l = _(() => X(i().getItemProps(z(s)), z(c)));
	return yS(() => i().getItemState(z(s))), xS(() => z(s)), Q(e, Y({ as: "div" }, () => z(l), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(wS, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/select/select-item-indicator.svelte
var TS = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function ES(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, TS), i = mS(), a = SS(), o = _(() => X(i().getItemIndicatorProps(a()), r));
	return Q(e, Y({ as: "div" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(ES, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/select/select-item-text.svelte
var DS = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function OS(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, DS), i = mS(), a = SS(), o = _(() => X(i().getItemTextProps(a()), r));
	return Q(e, Y({ as: "span" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(OS, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/select/select-positioner.svelte
var kS = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function AS(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, kS), i = mS(), a = io(), o = _(() => X(i().getPositionerProps(), r));
	var s = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	}, c = F(), l = K(c), u = (e) => {
		Q(e, Y({ as: "div" }, () => z(o), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, d = _(() => !a().unmounted);
	return P(l, (e) => {
		z(d) && e(u);
	}), I(e, c), y(s);
}
U(AS, { ref: {} }, [], [], { mode: "open" });
var jS = ln("select").parts("label", "positioner", "trigger", "indicator", "clearTrigger", "item", "itemText", "itemIndicator", "itemGroup", "itemGroupLabel", "list", "content", "root", "control", "valueText").build(), MS = (e) => new Wr(e);
MS.empty = () => new Wr({ items: [] });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+select@1.43.3/node_modules/@zag-js/select/dist/select.dom.mjs
var NS = (e) => e.ids?.root ?? `select:${e.id}`, PS = (e) => e.ids?.content ?? `select:${e.id}:content`, FS = (e) => e.ids?.trigger ?? `select:${e.id}:trigger`, IS = (e) => e.ids?.clearTrigger ?? `select:${e.id}:clear-trigger`, LS = (e) => e.ids?.label ?? `select:${e.id}:label`, RS = (e) => e.ids?.control ?? `select:${e.id}:control`, zS = (e, t) => e.ids?.item?.(t) ?? `select:${e.id}:option:${t}`, BS = (e) => e.ids?.hiddenSelect ?? `select:${e.id}:select`, VS = (e) => e.ids?.positioner ?? `select:${e.id}:positioner`, HS = (e, t) => e.ids?.itemGroup?.(t) ?? `select:${e.id}:optgroup:${t}`, US = (e, t) => e.ids?.itemGroupLabel?.(t) ?? `select:${e.id}:optgroup-label:${t}`, WS = (e) => e.getById(BS(e)), GS = (e) => e.getById(PS(e)), KS = (e) => e.getById(FS(e)), qS = (e) => e.getById(IS(e)), JS = (e) => e.getById(VS(e)), YS = (e, t) => t == null ? null : e.getById(zS(e, t)), XS = { clearTriggerLabel: "Clear value" };
function ZS(e, t) {
	let { context: n, prop: r, scope: i, state: a, computed: o, send: s } = e, c = He(XS, r("translations")), l = r("disabled") || n.get("fieldsetDisabled"), u = !!r("invalid"), d = !!r("required"), f = !!r("readOnly"), p = r("composite"), m = r("collection"), h = a.hasTag("open"), g = a.matches("focused"), _ = n.get("highlightedValue"), v = n.get("highlightedItem"), y = o("selectedItems"), ee = n.get("currentPlacement"), b = ee ? Go(ee) : void 0, x = o("isTypingAhead"), S = o("isInteractive"), C = _ ? zS(i, _) : void 0;
	function w(e) {
		let t = m.getItemDisabled(e.item), r = m.getItemValue(e.item);
		return gt(r, () => `[zag-js] No value found for item ${JSON.stringify(e.item)}`), {
			value: r,
			disabled: !!(l || t),
			highlighted: _ === r,
			selected: n.get("value").includes(r)
		};
	}
	let T = us({
		...r("positioning"),
		placement: ee
	});
	return {
		open: h,
		focused: g,
		empty: n.get("value").length === 0,
		highlightedItem: v,
		highlightedValue: _,
		selectedItems: y,
		hasSelectedItems: o("hasSelectedItems"),
		value: n.get("value"),
		valueAsString: o("valueAsString"),
		collection: m,
		multiple: !!r("multiple"),
		disabled: !!l,
		reposition(e = {}) {
			s({
				type: "POSITIONING.SET",
				options: e
			});
		},
		focus() {
			KS(i)?.focus({ preventScroll: !0 });
		},
		setOpen(e) {
			a.hasTag("open") !== e && s({ type: e ? "OPEN" : "CLOSE" });
		},
		selectValue(e) {
			s({
				type: "ITEM.SELECT",
				value: e
			});
		},
		setValue(e) {
			s({
				type: "VALUE.SET",
				value: e
			});
		},
		selectAll() {
			s({
				type: "VALUE.SET",
				value: m.getValues()
			});
		},
		setHighlightValue(e) {
			s({
				type: "HIGHLIGHTED_VALUE.SET",
				value: e
			});
		},
		clearHighlightValue() {
			s({ type: "HIGHLIGHTED_VALUE.CLEAR" });
		},
		clearValue(e) {
			s(e ? {
				type: "ITEM.CLEAR",
				value: e
			} : { type: "VALUE.CLEAR" });
		},
		getItemState: w,
		getRootProps() {
			return t.element({
				...jS.root.attrs,
				dir: r("dir"),
				id: NS(i),
				"data-invalid": Z(u),
				"data-readonly": Z(f)
			});
		},
		getLabelProps() {
			return t.label({
				dir: r("dir"),
				id: LS(i),
				...jS.label.attrs,
				"data-disabled": Z(l),
				"data-invalid": Z(u),
				"data-readonly": Z(f),
				"data-required": Z(d),
				htmlFor: BS(i),
				onClick(e) {
					e.defaultPrevented || l || KS(i)?.focus({ preventScroll: !0 });
				}
			});
		},
		getControlProps() {
			return t.element({
				...jS.control.attrs,
				dir: r("dir"),
				id: RS(i),
				"data-state": h ? "open" : "closed",
				"data-focus": Z(g),
				"data-disabled": Z(l),
				"data-invalid": Z(u)
			});
		},
		getValueTextProps() {
			return t.element({
				...jS.valueText.attrs,
				dir: r("dir"),
				"data-disabled": Z(l),
				"data-invalid": Z(u),
				"data-focus": Z(g)
			});
		},
		getTriggerProps() {
			return t.button({
				id: FS(i),
				disabled: l,
				dir: r("dir"),
				type: "button",
				role: "combobox",
				"aria-controls": PS(i),
				"aria-expanded": h,
				"aria-haspopup": "listbox",
				"data-state": h ? "open" : "closed",
				"aria-invalid": u,
				"aria-required": d,
				"aria-labelledby": LS(i),
				...jS.trigger.attrs,
				"data-disabled": Z(l),
				"data-invalid": Z(u),
				"data-readonly": Z(f),
				"data-placement": ee,
				"data-side": b,
				"data-placeholder-shown": Z(!o("hasSelectedItems")),
				onClick(e) {
					S && (e.defaultPrevented || s({ type: "TRIGGER.CLICK" }));
				},
				onFocus() {
					s({ type: "TRIGGER.FOCUS" });
				},
				onBlur() {
					s({ type: "TRIGGER.BLUR" });
				},
				onKeyDown(e) {
					if (e.defaultPrevented || !S) return;
					let t = {
						ArrowUp() {
							s({ type: "TRIGGER.ARROW_UP" });
						},
						ArrowDown(e) {
							s({ type: e.altKey ? "OPEN" : "TRIGGER.ARROW_DOWN" });
						},
						ArrowLeft() {
							s({ type: "TRIGGER.ARROW_LEFT" });
						},
						ArrowRight() {
							s({ type: "TRIGGER.ARROW_RIGHT" });
						},
						Home() {
							s({ type: "TRIGGER.HOME" });
						},
						End() {
							s({ type: "TRIGGER.END" });
						},
						Enter() {
							s({ type: "TRIGGER.ENTER" });
						},
						Space(e) {
							s(x ? {
								type: "TRIGGER.TYPEAHEAD",
								key: e.key
							} : { type: "TRIGGER.ENTER" });
						}
					}[Qt(e, {
						dir: r("dir"),
						orientation: "vertical"
					})];
					if (t) {
						t(e), e.preventDefault();
						return;
					}
					Ba.isValidEvent(e) && (s({
						type: "TRIGGER.TYPEAHEAD",
						key: e.key
					}), e.preventDefault());
				}
			});
		},
		getIndicatorProps() {
			return t.element({
				...jS.indicator.attrs,
				dir: r("dir"),
				"aria-hidden": !0,
				"data-state": h ? "open" : "closed",
				"data-disabled": Z(l),
				"data-invalid": Z(u),
				"data-readonly": Z(f)
			});
		},
		getItemProps(e) {
			let n = w(e);
			return t.element({
				id: zS(i, n.value),
				role: "option",
				...jS.item.attrs,
				dir: r("dir"),
				"data-value": n.value,
				"aria-selected": n.selected,
				"data-state": n.selected ? "checked" : "unchecked",
				"data-highlighted": Z(n.highlighted),
				"data-disabled": Z(n.disabled),
				"aria-disabled": pn(n.disabled),
				onPointerMove(e) {
					n.disabled || e.pointerType !== "mouse" || jo() === "pointer" && n.value !== _ && s({
						type: "ITEM.POINTER_MOVE",
						value: n.value
					});
				},
				onClick(e) {
					e.defaultPrevented || n.disabled || s({
						type: "ITEM.CLICK",
						src: "pointerup",
						value: n.value
					});
				},
				onPointerLeave(t) {
					n.disabled || e.persistFocus || t.pointerType === "mouse" && jo() === "pointer" && s({ type: "ITEM.POINTER_LEAVE" });
				}
			});
		},
		getItemTextProps(e) {
			let n = w(e);
			return t.element({
				...jS.itemText.attrs,
				"data-state": n.selected ? "checked" : "unchecked",
				"data-disabled": Z(n.disabled),
				"data-highlighted": Z(n.highlighted)
			});
		},
		getItemIndicatorProps(e) {
			let n = w(e);
			return t.element({
				"aria-hidden": !0,
				...jS.itemIndicator.attrs,
				"data-state": n.selected ? "checked" : "unchecked",
				hidden: !n.selected
			});
		},
		getItemGroupLabelProps(e) {
			let { htmlFor: n } = e;
			return t.element({
				...jS.itemGroupLabel.attrs,
				id: US(i, n),
				dir: r("dir"),
				role: "presentation"
			});
		},
		getItemGroupProps(e) {
			let { id: n } = e;
			return t.element({
				...jS.itemGroup.attrs,
				"data-disabled": Z(l),
				id: HS(i, n),
				"aria-labelledby": US(i, n),
				role: "group",
				dir: r("dir")
			});
		},
		getClearTriggerProps() {
			return t.button({
				...jS.clearTrigger.attrs,
				id: IS(i),
				type: "button",
				"aria-label": c.clearTriggerLabel,
				"data-invalid": Z(u),
				disabled: l,
				hidden: !o("hasSelectedItems"),
				dir: r("dir"),
				onClick(e) {
					e.defaultPrevented || s({ type: "CLEAR.CLICK" });
				}
			});
		},
		getHiddenSelectProps() {
			let e = n.get("value"), a = r("multiple") ? e : e?.[0], o = (e) => {
				Yi(Ue(e)) || s({
					type: "VALUE.SET",
					value: QS(e.currentTarget)
				});
			};
			return t.select({
				name: r("name"),
				form: r("form"),
				disabled: l,
				multiple: r("multiple"),
				required: r("required"),
				"aria-hidden": !0,
				id: BS(i),
				defaultValue: a,
				style: Ha,
				tabIndex: -1,
				autoComplete: r("autoComplete"),
				onChange: o,
				onInput: o,
				onFocus() {
					KS(i)?.focus({ preventScroll: !0 });
				},
				"aria-labelledby": LS(i)
			});
		},
		getPositionerProps() {
			return t.element({
				...jS.positioner.attrs,
				dir: r("dir"),
				id: VS(i),
				style: T.floating
			});
		},
		getContentProps() {
			return t.element({
				hidden: !h,
				dir: r("dir"),
				id: PS(i),
				role: p ? "listbox" : "dialog",
				...jS.content.attrs,
				"data-state": h ? "open" : "closed",
				"data-placement": ee,
				"data-side": b,
				"data-activedescendant": C,
				"aria-activedescendant": p ? C : void 0,
				"aria-multiselectable": r("multiple") && p ? !0 : void 0,
				"aria-labelledby": LS(i),
				tabIndex: 0,
				onKeyDown(e) {
					if (!S || !kt(e.currentTarget, lt(e))) return;
					if (e.key === "Tab" && !ma(e)) {
						e.preventDefault();
						return;
					}
					let t = {
						ArrowUp() {
							s({ type: "CONTENT.ARROW_UP" });
						},
						ArrowDown() {
							s({ type: "CONTENT.ARROW_DOWN" });
						},
						Home() {
							s({ type: "CONTENT.HOME" });
						},
						End() {
							s({ type: "CONTENT.END" });
						},
						Enter() {
							s({
								type: "ITEM.CLICK",
								src: "keydown.enter"
							});
						},
						Space(e) {
							x ? s({
								type: "CONTENT.TYPEAHEAD",
								key: e.key
							}) : t.Enter?.(e);
						}
					}, n = t[Qt(e)];
					if (n) {
						n(e), e.preventDefault();
						return;
					}
					let r = lt(e);
					dn(r) || Ba.isValidEvent(e) && (s({
						type: "CONTENT.TYPEAHEAD",
						key: e.key
					}), e.preventDefault());
				}
			});
		},
		getListProps() {
			return t.element({
				...jS.list.attrs,
				tabIndex: 0,
				role: p ? void 0 : "listbox",
				"aria-labelledby": FS(i),
				"aria-activedescendant": p ? void 0 : C,
				"aria-multiselectable": !p && r("multiple") ? !0 : void 0
			});
		}
	};
}
var QS = (e) => e.multiple ? Array.from(e.selectedOptions, (e) => e.value) : e.value ? [e.value] : [], { and: $S, not: eC, or: tC } = On(), nC = Pn({
	props({ props: e }) {
		return {
			loopFocus: !1,
			closeOnSelect: !e.multiple,
			composite: !0,
			defaultValue: [],
			...e,
			collection: e.collection ?? MS.empty(),
			positioning: {
				placement: "bottom-start",
				gutter: 8,
				...e.positioning
			}
		};
	},
	context({ prop: e, bindable: t, getContext: n }) {
		let r = e("value") ?? e("defaultValue") ?? [], i = e("collection").findMany(r);
		return {
			value: t(() => ({
				defaultValue: e("defaultValue"),
				value: e("value"),
				isEqual: Ot,
				onChange(t) {
					let r = n(), i = e("collection"), a = Xr({
						values: t,
						collection: i,
						selectedItemMap: r.get("selectedItemMap")
					}), o = e("value") ?? t, s = o === t ? a : Xr({
						values: o,
						collection: i,
						selectedItemMap: a.nextSelectedItemMap
					});
					return r.set("selectedItemMap", s.nextSelectedItemMap), e("onValueChange")?.({
						value: t,
						items: a.selectedItems
					});
				}
			})),
			highlightedValue: t(() => ({
				defaultValue: e("defaultHighlightedValue") || null,
				value: e("highlightedValue"),
				onChange(t) {
					e("onHighlightChange")?.({
						highlightedValue: t,
						highlightedItem: e("collection").find(t),
						highlightedIndex: e("collection").indexOf(t)
					});
				}
			})),
			currentPlacement: t(() => ({ defaultValue: void 0 })),
			fieldsetDisabled: t(() => ({ defaultValue: !1 })),
			highlightedItem: t(() => ({ defaultValue: null })),
			selectedItemMap: t(() => ({ defaultValue: Zr({
				selectedItems: i,
				collection: e("collection")
			}) }))
		};
	},
	refs() {
		return { typeahead: { ...Ba.defaultOptions } };
	},
	computed: {
		hasSelectedItems: ({ context: e }) => e.get("value").length > 0,
		isTypingAhead: ({ refs: e }) => e.get("typeahead").keysSoFar !== "",
		isDisabled: ({ prop: e, context: t }) => !!e("disabled") || !!t.get("fieldsetDisabled"),
		isInteractive: ({ prop: e }) => !(e("disabled") || e("readOnly")),
		selectedItems: ({ context: e, prop: t }) => Jr({
			values: e.get("value"),
			collection: t("collection"),
			selectedItemMap: e.get("selectedItemMap")
		}),
		valueAsString: ({ computed: e, prop: t }) => t("collection").stringifyItems(e("selectedItems"))
	},
	initialState({ prop: e }) {
		return e("open") || e("defaultOpen") ? "open" : "idle";
	},
	entry: ["syncSelectElement"],
	watch({ context: e, prop: t, track: n, action: r }) {
		n([() => e.get("value").toString()], () => {
			r([
				"syncSelectedItems",
				"syncSelectElement",
				"dispatchChangeEvent"
			]);
		}), n([() => t("open")], () => {
			r(["toggleVisibility"]);
		}), n([() => e.get("highlightedValue")], () => {
			r(["syncHighlightedItem"]);
		}), n([() => t("collection").toString()], () => {
			r(["syncCollection"]);
		});
	},
	on: {
		"HIGHLIGHTED_VALUE.SET": { actions: ["setHighlightedItem"] },
		"HIGHLIGHTED_VALUE.CLEAR": { actions: ["clearHighlightedItem"] },
		"ITEM.SELECT": { actions: ["selectItem"] },
		"ITEM.CLEAR": { actions: ["clearItem"] },
		"VALUE.SET": { actions: ["setSelectedItems"] },
		"VALUE.CLEAR": { actions: ["clearSelectedItems"] },
		"CLEAR.CLICK": { actions: ["clearSelectedItems", "focusTriggerEl"] }
	},
	effects: ["trackFormControlState"],
	states: {
		idle: {
			tags: ["closed"],
			on: {
				"CONTROLLED.OPEN": [{
					guard: "isTriggerClickEvent",
					target: "open",
					actions: ["setInitialFocus", "highlightFirstSelectedItem"]
				}, {
					target: "open",
					actions: ["setInitialFocus"]
				}],
				"TRIGGER.CLICK": [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"invokeOnOpen",
						"setInitialFocus",
						"highlightFirstSelectedItem"
					]
				}],
				"TRIGGER.FOCUS": { target: "focused" },
				OPEN: [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: ["setInitialFocus", "invokeOnOpen"]
				}]
			}
		},
		focused: {
			tags: ["closed"],
			on: {
				"CONTROLLED.OPEN": [
					{
						guard: "isTriggerClickEvent",
						target: "open",
						actions: ["setInitialFocus", "highlightFirstSelectedItem"]
					},
					{
						guard: "isTriggerArrowUpEvent",
						target: "open",
						actions: ["setInitialFocus", "highlightComputedLastItem"]
					},
					{
						guard: tC("isTriggerArrowDownEvent", "isTriggerEnterEvent"),
						target: "open",
						actions: ["setInitialFocus", "highlightComputedFirstItem"]
					},
					{
						target: "open",
						actions: ["setInitialFocus"]
					}
				],
				OPEN: [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: ["setInitialFocus", "invokeOnOpen"]
				}],
				"TRIGGER.BLUR": { target: "idle" },
				"TRIGGER.CLICK": [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"setInitialFocus",
						"invokeOnOpen",
						"highlightFirstSelectedItem"
					]
				}],
				"TRIGGER.ENTER": [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"setInitialFocus",
						"invokeOnOpen",
						"highlightComputedFirstItem"
					]
				}],
				"TRIGGER.ARROW_UP": [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"setInitialFocus",
						"invokeOnOpen",
						"highlightComputedLastItem"
					]
				}],
				"TRIGGER.ARROW_DOWN": [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"setInitialFocus",
						"invokeOnOpen",
						"highlightComputedFirstItem"
					]
				}],
				"TRIGGER.ARROW_LEFT": [{
					guard: $S(eC("multiple"), "hasSelectedItems"),
					actions: ["selectPreviousItem"]
				}, {
					guard: eC("multiple"),
					actions: ["selectLastItem"]
				}],
				"TRIGGER.ARROW_RIGHT": [{
					guard: $S(eC("multiple"), "hasSelectedItems"),
					actions: ["selectNextItem"]
				}, {
					guard: eC("multiple"),
					actions: ["selectFirstItem"]
				}],
				"TRIGGER.HOME": {
					guard: eC("multiple"),
					actions: ["selectFirstItem"]
				},
				"TRIGGER.END": {
					guard: eC("multiple"),
					actions: ["selectLastItem"]
				},
				"TRIGGER.TYPEAHEAD": {
					guard: eC("multiple"),
					actions: ["selectMatchingItem"]
				}
			}
		},
		open: {
			tags: ["open"],
			exit: ["scrollContentToTop"],
			effects: [
				"trackDismissableElement",
				"trackFocusVisible",
				"computePlacement",
				"scrollToHighlightedItem"
			],
			on: {
				"CONTROLLED.CLOSE": [{
					guard: "restoreFocus",
					target: "focused",
					actions: ["focusTriggerEl", "clearHighlightedItem"]
				}, {
					target: "idle",
					actions: ["clearHighlightedItem"]
				}],
				CLOSE: [
					{
						guard: "isOpenControlled",
						actions: ["invokeOnClose"]
					},
					{
						guard: "restoreFocus",
						target: "focused",
						actions: [
							"invokeOnClose",
							"focusTriggerEl",
							"clearHighlightedItem"
						]
					},
					{
						target: "idle",
						actions: ["invokeOnClose", "clearHighlightedItem"]
					}
				],
				"TRIGGER.CLICK": [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "focused",
					actions: ["invokeOnClose", "clearHighlightedItem"]
				}],
				"ITEM.CLICK": [
					{
						guard: $S("closeOnSelect", "isOpenControlled"),
						actions: ["selectHighlightedItem", "invokeOnClose"]
					},
					{
						guard: "closeOnSelect",
						target: "focused",
						actions: [
							"selectHighlightedItem",
							"invokeOnClose",
							"focusTriggerEl",
							"clearHighlightedItem"
						]
					},
					{ actions: ["selectHighlightedItem"] }
				],
				"CONTENT.HOME": { actions: ["highlightFirstItem"] },
				"CONTENT.END": { actions: ["highlightLastItem"] },
				"CONTENT.ARROW_DOWN": [
					{
						guard: $S("hasHighlightedItem", "loop", "isLastItemHighlighted"),
						actions: ["highlightFirstItem"]
					},
					{
						guard: "hasHighlightedItem",
						actions: ["highlightNextItem"]
					},
					{ actions: ["highlightFirstItem"] }
				],
				"CONTENT.ARROW_UP": [
					{
						guard: $S("hasHighlightedItem", "loop", "isFirstItemHighlighted"),
						actions: ["highlightLastItem"]
					},
					{
						guard: "hasHighlightedItem",
						actions: ["highlightPreviousItem"]
					},
					{ actions: ["highlightLastItem"] }
				],
				"CONTENT.TYPEAHEAD": { actions: ["highlightMatchingItem"] },
				"ITEM.POINTER_MOVE": { actions: ["highlightItem"] },
				"ITEM.POINTER_LEAVE": { actions: ["clearHighlightedItem"] },
				"POSITIONING.SET": { actions: ["reposition"] }
			}
		}
	},
	implementations: {
		guards: {
			loop: ({ prop: e }) => !!e("loopFocus"),
			multiple: ({ prop: e }) => !!e("multiple"),
			hasSelectedItems: ({ computed: e }) => !!e("hasSelectedItems"),
			hasHighlightedItem: ({ context: e }) => e.get("highlightedValue") != null,
			isFirstItemHighlighted: ({ context: e, prop: t }) => e.get("highlightedValue") === t("collection").firstValue,
			isLastItemHighlighted: ({ context: e, prop: t }) => e.get("highlightedValue") === t("collection").lastValue,
			closeOnSelect: ({ prop: e, event: t }) => !!(t.closeOnSelect ?? e("closeOnSelect")),
			restoreFocus: ({ event: e }) => rC(e),
			isOpenControlled: ({ prop: e }) => e("open") !== void 0,
			isTriggerClickEvent: ({ event: e }) => e.previousEvent?.type === "TRIGGER.CLICK",
			isTriggerEnterEvent: ({ event: e }) => e.previousEvent?.type === "TRIGGER.ENTER",
			isTriggerArrowUpEvent: ({ event: e }) => e.previousEvent?.type === "TRIGGER.ARROW_UP",
			isTriggerArrowDownEvent: ({ event: e }) => e.previousEvent?.type === "TRIGGER.ARROW_DOWN"
		},
		effects: {
			trackFocusVisible({ scope: e }) {
				return Po({ root: e.getRootNode?.() });
			},
			trackFormControlState({ context: e, scope: t }) {
				return qi(WS(t), {
					onFieldsetDisabledChange(t) {
						e.set("fieldsetDisabled", t);
					},
					onFormReset() {
						let t = e.initial("value");
						e.set("value", t);
					}
				});
			},
			trackDismissableElement({ scope: e, send: t, prop: n }) {
				let r = () => GS(e), i = !0;
				return sc(r, {
					type: "listbox",
					defer: !0,
					exclude: [KS(e), qS(e)],
					onFocusOutside: n("onFocusOutside"),
					onPointerDownOutside: n("onPointerDownOutside"),
					onInteractOutside(e) {
						n("onInteractOutside")?.(e), i = !(e.detail.focusable || e.detail.contextmenu);
					},
					onDismiss() {
						t({
							type: "CLOSE",
							src: "interact-outside",
							restoreFocus: i
						});
					}
				});
			},
			computePlacement({ context: e, prop: t, scope: n }) {
				let r = t("positioning");
				return e.set("currentPlacement", r.placement), cs(() => KS(n), () => JS(n), {
					defer: !0,
					...r,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			scrollToHighlightedItem({ context: e, prop: t, scope: n }) {
				let r = (r) => {
					let i = e.get("highlightedValue");
					if (i == null || jo() === "pointer") return;
					let a = GS(n), o = t("scrollToIndexFn");
					if (o) {
						let e = t("collection").indexOf(i);
						o?.({
							index: e,
							immediate: r,
							getElement: () => YS(n, i)
						});
						return;
					}
					Pa(YS(n, i), {
						rootEl: a,
						block: "nearest"
					});
				};
				return en(() => {
					Mo("virtual"), r(!0);
				}), ga(() => GS(n), {
					defer: !0,
					attributes: ["data-activedescendant"],
					callback() {
						r(!1);
					}
				});
			}
		},
		actions: {
			reposition({ context: e, prop: t, scope: n, event: r }) {
				cs(KS(n), () => JS(n), {
					...t("positioning"),
					...r.options,
					defer: !0,
					listeners: !1,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			toggleVisibility({ send: e, prop: t, event: n }) {
				e({
					type: t("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
					previousEvent: n
				});
			},
			highlightPreviousItem({ context: e, prop: t }) {
				let n = e.get("highlightedValue");
				if (n == null) return;
				let r = t("collection").getPreviousValue(n, 1, t("loopFocus"));
				r != null && e.set("highlightedValue", r);
			},
			highlightNextItem({ context: e, prop: t }) {
				let n = e.get("highlightedValue");
				if (n == null) return;
				let r = t("collection").getNextValue(n, 1, t("loopFocus"));
				r != null && e.set("highlightedValue", r);
			},
			highlightFirstItem({ context: e, prop: t }) {
				let n = t("collection").firstValue;
				e.set("highlightedValue", n);
			},
			highlightLastItem({ context: e, prop: t }) {
				let n = t("collection").lastValue;
				e.set("highlightedValue", n);
			},
			setInitialFocus({ scope: e }) {
				en(() => {
					pa({ root: GS(e) })?.focus({ preventScroll: !0 });
				});
			},
			focusTriggerEl({ event: e, scope: t }) {
				rC(e) && en(() => {
					KS(t)?.focus({ preventScroll: !0 });
				});
			},
			selectHighlightedItem({ context: e, prop: t, event: n }) {
				let r = n.value ?? e.get("highlightedValue");
				r != null && t("collection").has(r) && (t("onSelect")?.({ value: r }), r = t("deselectable") && !t("multiple") && e.get("value").includes(r) ? null : r, e.set("value", (e) => r == null ? [] : t("multiple") ? At(e, r) : [r]));
			},
			highlightComputedFirstItem({ context: e, prop: t, computed: n }) {
				let r = t("collection"), i = n("hasSelectedItems") ? r.sort(e.get("value"))[0] : r.firstValue;
				e.set("highlightedValue", i);
			},
			highlightComputedLastItem({ context: e, prop: t, computed: n }) {
				let r = t("collection"), i = n("hasSelectedItems") ? r.sort(e.get("value"))[0] : r.lastValue;
				e.set("highlightedValue", i);
			},
			highlightFirstSelectedItem({ context: e, prop: t, computed: n }) {
				if (!n("hasSelectedItems")) return;
				let r = t("collection").sort(e.get("value"))[0];
				e.set("highlightedValue", r);
			},
			highlightItem({ context: e, event: t }) {
				e.set("highlightedValue", t.value);
			},
			highlightMatchingItem({ context: e, prop: t, event: n, refs: r }) {
				let i = t("collection").search(n.key, {
					state: r.get("typeahead"),
					currentValue: e.get("highlightedValue")
				});
				i != null && e.set("highlightedValue", i);
			},
			setHighlightedItem({ context: e, event: t }) {
				e.set("highlightedValue", t.value);
			},
			clearHighlightedItem({ context: e }) {
				e.set("highlightedValue", null);
			},
			selectItem({ context: e, prop: t, event: n }) {
				t("onSelect")?.({ value: n.value });
				let r = t("deselectable") && !t("multiple") && e.get("value").includes(n.value) ? null : n.value;
				e.set("value", (e) => r == null ? [] : t("multiple") ? At(e, r) : [r]);
			},
			clearItem({ context: e, event: t }) {
				e.set("value", (e) => e.filter((e) => e !== t.value));
			},
			setSelectedItems({ context: e, event: t }) {
				e.set("value", t.value);
			},
			clearSelectedItems({ context: e }) {
				e.set("value", []);
			},
			selectPreviousItem({ context: e, prop: t }) {
				let [n] = e.get("value"), r = t("collection").getPreviousValue(n);
				r && e.set("value", [r]);
			},
			selectNextItem({ context: e, prop: t }) {
				let [n] = e.get("value"), r = t("collection").getNextValue(n);
				r && e.set("value", [r]);
			},
			selectFirstItem({ context: e, prop: t }) {
				let n = t("collection").firstValue;
				n && e.set("value", [n]);
			},
			selectLastItem({ context: e, prop: t }) {
				let n = t("collection").lastValue;
				n && e.set("value", [n]);
			},
			selectMatchingItem({ context: e, prop: t, event: n, refs: r }) {
				let i = t("collection").search(n.key, {
					state: r.get("typeahead"),
					currentValue: e.get("value")[0]
				});
				i != null && e.set("value", [i]);
			},
			scrollContentToTop({ prop: e, scope: t }) {
				if (e("scrollToIndexFn")) {
					let n = e("collection").firstValue;
					e("scrollToIndexFn")?.({
						index: 0,
						immediate: !0,
						getElement: () => YS(t, n)
					});
				} else GS(t)?.scrollTo(0, 0);
			},
			invokeOnOpen({ prop: e, context: t }) {
				e("onOpenChange")?.({
					open: !0,
					value: t.get("value")
				});
			},
			invokeOnClose({ prop: e, context: t }) {
				e("onOpenChange")?.({
					open: !1,
					value: t.get("value")
				});
			},
			syncSelectElement({ context: e, prop: t, scope: n }) {
				let r = WS(n);
				if (r) {
					if (e.get("value").length === 0 && !t("multiple")) {
						r.selectedIndex = -1;
						return;
					}
					for (let t of r.options) t.selected = e.get("value").includes(t.value);
				}
			},
			syncCollection({ context: e, prop: t }) {
				let n = t("collection"), r = n.find(e.get("highlightedValue"));
				r && e.set("highlightedItem", r);
				let i = Xr({
					values: e.get("value"),
					collection: n,
					selectedItemMap: e.get("selectedItemMap")
				});
				e.set("selectedItemMap", i.nextSelectedItemMap);
			},
			syncSelectedItems({ context: e, prop: t }) {
				let n = Xr({
					values: e.get("value"),
					collection: t("collection"),
					selectedItemMap: e.get("selectedItemMap")
				});
				e.set("selectedItemMap", n.nextSelectedItemMap);
			},
			syncHighlightedItem({ context: e, prop: t }) {
				let n = t("collection"), r = e.get("highlightedValue"), i = r ? n.find(r) : null;
				e.set("highlightedItem", i);
			},
			dispatchChangeEvent({ scope: e }) {
				queueMicrotask(() => {
					let t = WS(e);
					if (!t) return;
					let n = new (e.getWin()).Event("change", {
						bubbles: !0,
						composed: !0
					});
					t.dispatchEvent(Xi(n));
				});
			}
		}
	}
});
function rC(e) {
	let t = e.restoreFocus ?? e.previousEvent?.restoreFocus;
	return t == null || !!t;
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/select/use-select.svelte.js
var iC = (e) => {
	let t = gn(), n = Nt(), r = Ru(), i = _(() => {
		let i = St(e);
		return {
			ids: {
				label: r?.()?.ids?.label,
				hiddenSelect: r?.()?.ids?.control
			},
			disabled: r?.()?.disabled,
			readOnly: r?.()?.readOnly,
			invalid: r?.()?.invalid,
			required: r?.()?.required,
			dir: t().dir,
			getRootNode: n().getRootNode,
			...i
		};
	}), a = Tn(nC, () => z(i)), o = _(() => ZS(a, Wt));
	return () => z(o);
}, aC = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function oC(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, aC), i = _(() => no(r)), a = _(() => C(z(i), 2)), o = _(() => z(a)[0]), s = _(() => z(a)[1]), c = to(() => ({
		present: t.value().open,
		...z(o)
	})), l = _(() => X(t.value().getRootProps(), z(s)));
	return pS(() => t.value()), ro(c), Q(e, Y({ as: "div" }, () => z(l), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(oC, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/select/select-trigger.svelte
var sC = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function cC(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, sC), i = mS(), a = _(() => X(i().getTriggerProps(), r));
	return Q(e, Y({ as: "button" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(cC, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Select.svelte
var lC = (e, t = b, n = b) => {
	var r = F(), i = K(r);
	E(i, () => wS, (e, r) => {
		r(e, Y({
			get item() {
				return t();
			},
			part: "option"
		}, n, {
			children: (e, n) => {
				var r = dC(), i = K(r);
				E(i, () => OS, (e, n) => {
					n(e, {
						children: (e, n) => {
							ne();
							var r = fe();
							G(() => w(r, t().label)), I(e, r);
						},
						$$slots: { default: !0 }
					});
				});
				var a = W(i, 2), o = H(a);
				E(o, () => ES, (e, t) => {
					t(e, {
						children: (e, t) => {
							var n = uC();
							I(e, n);
						},
						$$slots: { default: !0 }
					});
				}), D(a), I(e, r);
			},
			$$slots: { default: !0 }
		}));
	}), I(e, r);
}, uC = ae("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-1sa71xq\"><path d=\"M20 6 9 17l-5-5\"></path></svg>"), dC = L("<!> <span class=\"check svelte-1sa71xq\"><!></span>", 1), fC = L("<span id=\"af-described\" hidden=\"\"> </span>"), pC = ae("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-1sa71xq\"><path d=\"m6 9 6 6 6-6\"></path></svg>"), mC = L("<span part=\"value\" class=\"svelte-1sa71xq\"> </span> <!>", 1), hC = L("<af-tooltip><!></af-tooltip>", 2), gC = L("<div part=\"empty\" class=\"svelte-1sa71xq\"> </div>"), _C = L("<!> <!>", 1), vC = L("<div class=\"af-kit\"><!> <!></div>"), yC = {
	hash: "svelte-1sa71xq",
	code: ":host {display:inline-block;max-width:100%;vertical-align:middle;}af-tooltip.svelte-1sa71xq {display:block;}[part='value'].svelte-1sa71xq {flex:1 1 auto;min-width:0;overflow:hidden;text-align:start;text-overflow:ellipsis;white-space:nowrap;}.check.svelte-1sa71xq {position:absolute;right:8px;display:flex;align-items:center;justify-content:center;width:14px;height:14px;}svg.svelte-1sa71xq {flex:none;width:16px;height:16px;pointer-events:none;}[data-scope='select'][hidden] {display:none !important;}[data-scope='select'][data-part='trigger'] {display:flex;align-items:center;justify-content:space-between;gap:8px;box-sizing:border-box;width:100%;height:36px;margin:0;padding:8px 12px;border:1px solid var(--k-input);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark, 0) * 100%), transparent);box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);color:inherit;font:inherit;font-size:14px;line-height:20px;white-space:nowrap;outline:none;cursor:default;transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);}[data-scope='select'][data-part='trigger'][data-size='sm'] {height:32px;}[data-scope='select'][data-part='trigger']:hover:not(:disabled) {background-color:color-mix(in oklab, color-mix(in oklab, var(--k-input) 50%, transparent) calc(var(--k-dark, 0) * 100%), transparent);}[data-scope='select'][data-part='trigger'][data-placeholder] {color:var(--k-muted);}[data-scope='select'][data-part='trigger']:focus-visible {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring), 0 1px 2px 0 rgb(0 0 0 / 0.05);}[data-scope='select'][data-part='trigger'][aria-invalid='true'] {border-color:var(--k-danger);}[data-scope='select'][data-part='trigger'][aria-invalid='true']:focus-visible {box-shadow:0 0 0 3px color-mix(in oklab, var(--k-danger) calc(20% + var(--k-dark, 0) * 20%), transparent), 0 1px 2px 0 rgb(0 0 0 / 0.05);}[data-scope='select'][data-part='trigger']:disabled {opacity:0.5;cursor:not-allowed;}[data-scope='select'][data-part='indicator'] {display:flex;color:var(--k-muted);opacity:0.5;}[data-scope='select'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='select'][data-part='content'] {box-sizing:border-box;display:flex;flex-direction:column;width:max-content;min-width:max(128px, 100%);max-width:var(--available-width, 100vw);max-height:var(--available-height, 300px);padding:4px;outline:none;}[data-scope='select'][data-part='item'] {position:relative;box-sizing:border-box;display:flex;align-items:center;gap:8px;width:100%;padding:6px 32px 6px 8px;border:0 solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 4px));outline:none;font-size:14px;line-height:20px;cursor:default;-webkit-user-select:none;user-select:none;}[data-scope='select'][data-part='item'][data-highlighted] {background-color:var(--k-accent);color:var(--k-accent-fg);}[data-scope='select'][data-part='item'][data-disabled] {opacity:0.5;}[data-scope='select'][data-part='item'] .check {color:var(--k-muted);}[part='empty'].svelte-1sa71xq {padding:24px 0;font-size:14px;line-height:20px;text-align:center;}\n  @media (prefers-reduced-motion: reduce) {[data-scope='select'][data-part='trigger'] {transition:none;} }\n  @media (forced-colors: active) {[data-scope='select'][data-part='trigger']:focus-visible {outline:2px solid;outline-offset:2px;}[data-scope='select'][data-part='item'][data-highlighted] {forced-color-adjust:none;background-color:Highlight;color:HighlightText;}\n  }"
};
function bC(e, r) {
	let i = m();
	O(r, !0), ee(e, yC);
	let a = R(r, "options", 23, () => []), o = R(r, "value", 7, null), l = R(r, "multiple", 7, !1), u = R(r, "placeholder", 7, null), f = R(r, "label", 7, null), p = R(r, "disabled", 7, !1), g = R(r, "locale", 7, null), b = R(r, "strings", 7, null), x = R(r, "name", 7, null), S = R(r, "required", 7, !1), C = R(r, "readonly", 7, !1), T = R(r, "description", 7, null), ne = R(r, "error", 7, null), re = R(r, "invalid", 7, !1), ie = R(r, "size", 7, null), k = r.$$host, A = _(() => c(g(), b() ?? void 0)), ae = _(() => {
		let e = /* @__PURE__ */ new Set();
		return (a() ?? []).filter((t) => !e.has(t.value) && !!e.add(t.value));
	}), oe = _(() => new Map(z(ae).map((e) => [e.value, e]))), j = _(() => [...new Set(Array.isArray(o()) ? o() : o() ? [o()] : [])]), N = _(() => z(j).filter((e) => z(oe).has(e)).map((e) => z(oe).get(e).label).join(", ")), se = _(() => Ei({
		items: z(ae),
		itemToValue: (e) => e.value,
		itemToString: (e) => e.label,
		isItemDisabled: (e) => !!e.disabled
	})), ce = B(!1), L = _(() => !!p() || z(ce)), le = _(() => [T(), ne()].filter(Boolean).join(" ")), ue = (e) => n(k, "change", { value: l() ? e : e[0] ?? null }), de = iC(() => ({
		id: i,
		getRootNode: () => k.shadowRoot,
		collection: z(se),
		multiple: !!l(),
		value: z(j),
		disabled: z(L),
		readOnly: !!C(),
		invalid: !!re(),
		required: !!S(),
		positioning: {
			strategy: "fixed",
			placement: "bottom-start",
			sameWidth: !0
		},
		scrollToIndexFn: on,
		onValueChange: (e) => ue(e.value)
	})), V = B(null), fe = B(null), U = B(null);
	Te(() => s(z(V), de().open, k)), Te(() => me(k, "keydown", (e) => {
		e.key === "Escape" && qn(e) && e.defaultPrevented && de().open && de().setOpen(!1);
	}));
	function pe(e) {
		z(L) || C() || e.isComposing || e.ctrlKey || e.metaKey || e.altKey || e.key.length === 1 && e.key !== " " && (e.preventDefault(), de().open || de().setOpen(!0), z(fe)?.dispatchEvent(new KeyboardEvent("keydown", {
			key: e.key,
			bubbles: !0,
			composed: !1
		})));
	}
	Te(() => {
		let e = !!S() && z(j).length === 0;
		Dr(k, {
			name: x(),
			value: l() ? z(j) : z(j)[0] ?? null,
			validity: e ? { valueMissing: !0 } : {},
			message: e ? d(z(A), "valueMissing") : "",
			anchor: z(U)
		});
	}), Or(k, {
		reset() {
			let e = k.getAttribute("value"), t = e ? [e] : [];
			(t.length !== z(j).length || t.some((e, t) => e !== z(j)[t])) && ue(t);
		},
		disabled(e) {
			J(ce, e, !0);
		}
	});
	let he = (e) => e ? { "aria-description": e } : {};
	var _e = {
		get options() {
			return a();
		},
		set options(e = []) {
			a(e), M();
		},
		get value() {
			return o();
		},
		set value(e = null) {
			o(e), M();
		},
		get multiple() {
			return l();
		},
		set multiple(e = !1) {
			l(e), M();
		},
		get placeholder() {
			return u();
		},
		set placeholder(e = null) {
			u(e), M();
		},
		get label() {
			return f();
		},
		set label(e = null) {
			f(e), M();
		},
		get disabled() {
			return p();
		},
		set disabled(e = !1) {
			p(e), M();
		},
		get locale() {
			return g();
		},
		set locale(e = null) {
			g(e), M();
		},
		get strings() {
			return b();
		},
		set strings(e = null) {
			b(e), M();
		},
		get name() {
			return x();
		},
		set name(e = null) {
			x(e), M();
		},
		get required() {
			return S();
		},
		set required(e = !1) {
			S(e), M();
		},
		get readonly() {
			return C();
		},
		set readonly(e = !1) {
			C(e), M();
		},
		get description() {
			return T();
		},
		set description(e = null) {
			T(e), M();
		},
		get error() {
			return ne();
		},
		set error(e = null) {
			ne(e), M();
		},
		get invalid() {
			return re();
		},
		set invalid(e = !1) {
			re(e), M();
		},
		get size() {
			return ie();
		},
		set size(e = null) {
			ie(e), M();
		}
	}, ve = _C(), ye = K(ve);
	t(ye, {});
	var be = W(ye, 2);
	return Yt(be, {
		value: () => k.shadowRoot,
		children: (e, t) => {
			var n = vC(), r = H(n), i = (e) => {
				var t = fC(), n = ge(t, !0);
				G(() => w(n, z(le))), I(e, t);
			};
			P(r, (e) => {
				z(le) && e(i);
			});
			var a = W(r, 2);
			E(a, () => oC, (e, t) => {
				t(e, {
					get value() {
						return de;
					},
					children: (e, t) => {
						var n = _C(), r = K(n);
						{
							let e = _(() => f() || void 0), t = _(() => z(le) ? "af-described" : void 0), n = _(() => C() ? "true" : void 0), i = _(() => z(N) ? void 0 : ""), a = _(() => ie() === "sm" ? "sm" : void 0);
							E(r, () => cC, (r, o) => {
								o(r, {
									part: "trigger",
									get "aria-label"() {
										return z(e);
									},
									"aria-labelledby": null,
									get "aria-describedby"() {
										return z(t);
									},
									get "aria-readonly"() {
										return z(n);
									},
									get "data-placeholder"() {
										return z(i);
									},
									get "data-size"() {
										return z(a);
									},
									onkeydowncapture: pe,
									get ref() {
										return z(U);
									},
									set ref(e) {
										J(U, e, !0);
									},
									children: (e, t) => {
										var n = mC(), r = K(n), i = ge(r, !0), a = W(r, 2);
										E(a, () => vS, (e, t) => {
											t(e, {
												part: "indicator",
												children: (e, t) => {
													var n = pC();
													I(e, n);
												},
												$$slots: { default: !0 }
											});
										}), G(() => w(i, z(N) || u() || "")), I(e, n);
									},
									$$slots: { default: !0 }
								});
							});
						}
						var i = W(r, 2);
						E(i, () => AS, (e, t) => {
							t(e, {
								popover: "manual",
								get ref() {
									return z(V);
								},
								set ref(e) {
									J(V, e, !0);
								},
								children: (e, t) => {
									var n = F(), r = K(n);
									{
										let e = _(() => f() || void 0);
										E(r, () => gS, (t, n) => {
											n(t, {
												class: "af-overlay",
												part: "content",
												get "aria-label"() {
													return z(e);
												},
												"aria-labelledby": null,
												get ref() {
													return z(fe);
												},
												set ref(e) {
													J(fe, e, !0);
												},
												children: (e, t) => {
													Sn(e, {
														tabStop: !1,
														children: (e, t) => {
															var n = _C(), r = K(n);
															h(r, 17, () => z(se).items, (e) => e.value, (e, t) => {
																var n = F(), r = K(n), i = (e) => {
																	var n = hC();
																	G(() => v(n, "text", z(t).reason ?? "")), te(n, 1, "svelte-1sa71xq");
																	var r = H(n);
																	{
																		let e = _(() => he(z(t).reason));
																		lC(r, () => z(t), () => z(e));
																	}
																	D(n), I(e, n);
																}, a = (e) => {
																	lC(e, () => z(t), () => ({}));
																};
																P(r, (e) => {
																	z(t).disabled ? e(i) : e(a, -1);
																}), I(e, n);
															});
															var i = W(r, 2), a = (e) => {
																var t = gC(), n = ge(t, !0);
																G(() => w(n, z(A).noOptions)), I(e, t);
															};
															P(i, (e) => {
																z(se).items.length === 0 && e(a);
															}), I(e, n);
														},
														$$slots: { default: !0 }
													});
												},
												$$slots: { default: !0 }
											});
										});
									}
									I(e, n);
								},
								$$slots: { default: !0 }
							});
						}), I(e, n);
					},
					$$slots: { default: !0 }
				});
			}), D(n), I(e, n);
		},
		$$slots: { default: !0 }
	}), I(e, ve), y(_e);
}
U(bC, {
	options: { type: "Array" },
	value: { attribute: "value" },
	multiple: {
		attribute: "multiple",
		type: "Boolean"
	},
	placeholder: {
		attribute: "placeholder",
		type: "String"
	},
	label: {
		attribute: "label",
		type: "String"
	},
	disabled: {
		attribute: "disabled",
		reflect: !0,
		type: "Boolean"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" },
	name: {
		attribute: "name",
		reflect: !0,
		type: "String"
	},
	required: {
		attribute: "required",
		type: "Boolean"
	},
	readonly: {
		attribute: "readonly",
		reflect: !0,
		type: "Boolean"
	},
	description: {
		attribute: "description",
		type: "String"
	},
	error: {
		attribute: "error",
		type: "String"
	},
	invalid: {
		attribute: "invalid",
		type: "Boolean"
	},
	size: {
		attribute: "size",
		type: "String"
	}
}, [], [], {
	mode: "open",
	delegatesFocus: !0
}, Er);
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/signature-pad/use-signature-pad-context.js
var [xC, SC] = Rt({
	name: "SignaturePadContext",
	hookName: "useSignaturePadContext",
	providerName: "<SignaturePadProvider />"
}), CC = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function wC(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, CC), i = SC(), a = _(() => X(i().getClearTriggerProps(), r));
	return Q(e, Y({ as: "button" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(wC, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/signature-pad/signature-pad-control.svelte
var TC = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function EC(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, TC), i = SC(), a = _(() => X(i().getControlProps(), r));
	return Q(e, Y({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(EC, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/signature-pad/signature-pad-guide.svelte
var DC = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function OC(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, DC), i = SC(), a = _(() => X(i().getGuideProps(), r));
	return Q(e, Y({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(OC, { ref: {} }, [], [], { mode: "open" });
var kC = ln("signature-pad").parts("root", "control", "segment", "segmentPath", "guide", "clearTrigger", "label").build(), AC = (e) => e.ids?.root ?? `signature-${e.id}`, jC = (e) => e.ids?.control ?? `signature-control-${e.id}`, MC = (e) => e.ids?.label ?? `signature-label-${e.id}`, NC = (e) => e.ids?.hiddenInput ?? `signature-input-${e.id}`, PC = (e) => e.getById(jC(e)), FC = (e) => jn(PC(e), "[data-part=segment]"), IC = (e, t) => Bi(FC(e), t), LC = {
	control: "signature pad",
	clearTrigger: "clear signature"
};
function RC(e, t) {
	let { state: n, send: r, prop: i, computed: a, context: o, scope: s } = e, c = n.matches("drawing"), l = a("isEmpty"), u = a("isInteractive"), d = !!i("disabled"), f = !!i("required"), p = He(LC, i("translations"));
	return {
		empty: l,
		drawing: c,
		currentPath: o.get("currentPath"),
		paths: o.get("paths"),
		clear() {
			r({ type: "CLEAR" });
		},
		getDataUrl(e, t) {
			return a("isEmpty") ? Promise.resolve("") : IC(s, {
				type: e,
				quality: t
			});
		},
		getLabelProps() {
			return t.label({
				...kC.label.attrs,
				dir: i("dir"),
				id: MC(s),
				"data-disabled": Z(d),
				"data-required": Z(f),
				htmlFor: NC(s),
				onClick(e) {
					u && (e.defaultPrevented || PC(s)?.focus({ preventScroll: !0 }));
				}
			});
		},
		getRootProps() {
			return t.element({
				...kC.root.attrs,
				dir: i("dir"),
				"data-disabled": Z(d),
				id: AC(s)
			});
		},
		getControlProps() {
			return t.element({
				...kC.control.attrs,
				dir: i("dir"),
				tabIndex: d ? void 0 : 0,
				id: jC(s),
				role: "application",
				"aria-roledescription": "signature pad",
				"aria-label": p.control,
				"aria-disabled": d,
				"data-disabled": Z(d),
				onPointerDown(e) {
					if (!Fn(e) || Fe(e) || !u || lt(e)?.closest("[data-part=clear-trigger]")) return;
					e.currentTarget.setPointerCapture(e.pointerId);
					let t = {
						x: e.clientX,
						y: e.clientY
					}, n = PC(s);
					if (!n) return;
					let { offset: i } = Ta(t, n);
					r({
						type: "POINTER_DOWN",
						point: i,
						pressure: e.pressure
					});
				},
				onPointerUp(e) {
					u && e.currentTarget.hasPointerCapture(e.pointerId) && e.currentTarget.releasePointerCapture(e.pointerId);
				},
				style: {
					position: "relative",
					touchAction: "none",
					userSelect: "none",
					WebkitUserSelect: "none"
				}
			});
		},
		getSegmentProps() {
			return t.svg({
				...kC.segment.attrs,
				style: {
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					pointerEvents: "none",
					fill: i("drawing").fill
				}
			});
		},
		getSegmentPathProps(e) {
			return t.path({
				...kC.segmentPath.attrs,
				d: e.path
			});
		},
		getGuideProps() {
			return t.element({
				...kC.guide.attrs,
				dir: i("dir"),
				"data-disabled": Z(d)
			});
		},
		getClearTriggerProps() {
			return t.button({
				...kC.clearTrigger.attrs,
				dir: i("dir"),
				type: "button",
				"aria-label": p.clearTrigger,
				hidden: !o.get("paths").length || c,
				disabled: d,
				onClick() {
					r({ type: "CLEAR" });
				}
			});
		},
		getHiddenInputProps(e) {
			return t.input({
				id: NC(s),
				type: "text",
				hidden: !0,
				disabled: d,
				required: i("required"),
				readOnly: !0,
				name: i("name"),
				value: e.value
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/perfect-freehand@1.2.3/node_modules/perfect-freehand/dist/esm/index.mjs
var { PI: zC } = Math, BC = zC + 1e-4, VC = .5, HC = [1, 1];
function UC(e, t, n, r = (e) => e) {
	return e * r(.5 - t * (.5 - n));
}
var { min: WC } = Math;
function GC(e, t, n) {
	let r = WC(1, t / n);
	return WC(1, e + (WC(1, 1 - r) - e) * (r * .275));
}
function KC(e) {
	return [-e[0], -e[1]];
}
function qC(e, t) {
	return [e[0] + t[0], e[1] + t[1]];
}
function JC(e, t, n) {
	return e[0] = t[0] + n[0], e[1] = t[1] + n[1], e;
}
function YC(e, t) {
	return [e[0] - t[0], e[1] - t[1]];
}
function XC(e, t, n) {
	return e[0] = t[0] - n[0], e[1] = t[1] - n[1], e;
}
function ZC(e, t) {
	return [e[0] * t, e[1] * t];
}
function QC(e, t, n) {
	return e[0] = t[0] * n, e[1] = t[1] * n, e;
}
function $C(e, t) {
	return [e[0] / t, e[1] / t];
}
function ew(e) {
	return [e[1], -e[0]];
}
function tw(e, t) {
	let n = t[0];
	return e[0] = t[1], e[1] = -n, e;
}
function nw(e, t) {
	return e[0] * t[0] + e[1] * t[1];
}
function rw(e, t) {
	return e[0] === t[0] && e[1] === t[1];
}
function iw(e) {
	return Math.hypot(e[0], e[1]);
}
function aw(e, t) {
	let n = e[0] - t[0], r = e[1] - t[1];
	return n * n + r * r;
}
function ow(e) {
	return $C(e, iw(e));
}
function sw(e, t) {
	return Math.hypot(e[1] - t[1], e[0] - t[0]);
}
function cw(e, t, n) {
	let r = Math.sin(n), i = Math.cos(n), a = e[0] - t[0], o = e[1] - t[1], s = a * i - o * r, c = a * r + o * i;
	return [s + t[0], c + t[1]];
}
function lw(e, t, n, r) {
	let i = Math.sin(r), a = Math.cos(r), o = t[0] - n[0], s = t[1] - n[1], c = o * a - s * i, l = o * i + s * a;
	return e[0] = c + n[0], e[1] = l + n[1], e;
}
function uw(e, t, n) {
	return qC(e, ZC(YC(t, e), n));
}
function dw(e, t, n, r) {
	let i = n[0] - t[0], a = n[1] - t[1];
	return e[0] = t[0] + i * r, e[1] = t[1] + a * r, e;
}
function fw(e, t, n) {
	return qC(e, ZC(t, n));
}
var pw = [0, 0], mw = [0, 0], hw = [0, 0];
function gw(e, t) {
	let n = fw(e, ow(ew(YC(e, qC(e, [1, 1])))), -t), r = [], i = 1 / 13;
	for (let t = i; t <= 1; t += i) r.push(cw(n, e, BC * 2 * t));
	return r;
}
function _w(e, t, n) {
	let r = [], i = 1 / n;
	for (let n = i; n <= 1; n += i) r.push(cw(t, e, BC * n));
	return r;
}
function vw(e, t, n) {
	let r = YC(t, n), i = ZC(r, .5), a = ZC(r, .51);
	return [
		YC(e, i),
		YC(e, a),
		qC(e, a),
		qC(e, i)
	];
}
function yw(e, t, n, r) {
	let i = [], a = fw(e, t, n), o = 1 / r;
	for (let t = o; t < 1; t += o) i.push(cw(a, e, BC * 3 * t));
	return i;
}
function bw(e, t, n) {
	return [
		qC(e, ZC(t, n)),
		qC(e, ZC(t, n * .99)),
		YC(e, ZC(t, n * .99)),
		YC(e, ZC(t, n))
	];
}
function xw(e, t, n) {
	return e === !1 || e === void 0 ? 0 : e === !0 ? Math.max(t, n) : e;
}
function Sw(e, t, n) {
	return e.slice(0, 10).reduce((e, r) => {
		let i = r.pressure;
		return t && (i = GC(e, r.distance, n)), (e + i) / 2;
	}, e[0].pressure);
}
function Cw(e, t = {}) {
	let { size: n = 16, smoothing: r = .5, thinning: i = .5, simulatePressure: a = !0, easing: o = (e) => e, start: s = {}, end: c = {}, last: l = !1 } = t, { cap: u = !0, easing: d = (e) => e * (2 - e) } = s, { cap: f = !0, easing: p = (e) => --e * e * e + 1 } = c;
	if (e.length === 0 || n <= 0) return [];
	let m = e[e.length - 1].runningLength, h = xw(s.taper, n, m), g = xw(c.taper, n, m), _ = (n * r) ** 2, v = [], y = [], ee = Sw(e, a, n), b = UC(n, i, e[e.length - 1].pressure, o), x, S = e[0].vector, C = e[0].point, w = C, T = C, E = w, te = !1;
	for (let t = 0; t < e.length; t++) {
		let { pressure: r } = e[t], { point: s, vector: c, distance: l, runningLength: u } = e[t], f = t === e.length - 1;
		if (!f && m - u < 3) continue;
		i ? (a && (r = GC(ee, l, n)), b = UC(n, i, r, o)) : b = n / 2, x === void 0 && (x = b);
		let ne = u < h ? d(u / h) : 1, re = m - u < g ? p((m - u) / g) : 1;
		b = Math.max(.01, b * Math.min(ne, re));
		let D = (f ? e[t] : e[t + 1]).vector, ie = f ? 1 : nw(c, D), O = nw(c, S) < 0 && !te, k = ie !== null && ie < 0;
		if (O || k) {
			tw(pw, S), QC(pw, pw, b);
			for (let e = 0; e <= 1; e += .07692307692307693) XC(mw, s, pw), lw(mw, mw, s, BC * e), T = [mw[0], mw[1]], v.push(T), JC(hw, s, pw), lw(hw, hw, s, BC * -e), E = [hw[0], hw[1]], y.push(E);
			C = T, w = E, k && (te = !0);
			continue;
		}
		if (te = !1, f) {
			tw(pw, c), QC(pw, pw, b), v.push(YC(s, pw)), y.push(qC(s, pw));
			continue;
		}
		dw(pw, D, c, ie), tw(pw, pw), QC(pw, pw, b), XC(mw, s, pw), T = [mw[0], mw[1]], (t <= 1 || aw(C, T) > _) && (v.push(T), C = T), JC(hw, s, pw), E = [hw[0], hw[1]], (t <= 1 || aw(w, E) > _) && (y.push(E), w = E), ee = r, S = c;
	}
	let ne = [e[0].point[0], e[0].point[1]], re = e.length > 1 ? [e[e.length - 1].point[0], e[e.length - 1].point[1]] : qC(e[0].point, [1, 1]), D = [], ie = [];
	if (e.length === 1) {
		if (!(h || g) || l) return gw(ne, x || b);
	} else {
		h || g && e.length === 1 || (u ? D.push(..._w(ne, y[0], 13)) : D.push(...vw(ne, v[0], y[0])));
		let t = ew(KC(e[e.length - 1].vector));
		g || h && e.length === 1 ? ie.push(re) : f ? ie.push(...yw(re, t, b, 29)) : ie.push(...bw(re, t, b));
	}
	return v.concat(ie, y.reverse(), D);
}
var ww = [0, 0];
function Tw(e) {
	return e != null && e >= 0;
}
function Ew(e, t = {}) {
	let { streamline: n = .5, size: r = 16, last: i = !1 } = t;
	if (e.length === 0) return [];
	let a = .15 + (1 - n) * .85, o = Array.isArray(e[0]) ? e : e.map(({ x: e, y: t, pressure: n = VC }) => [
		e,
		t,
		n
	]);
	if (o.length === 2) {
		let e = o[1];
		o = o.slice(0, -1);
		for (let t = 1; t < 5; t++) o.push(uw(o[0], e, t / 4));
	}
	o.length === 1 && (o = [...o, [...qC(o[0], HC), ...o[0].slice(2)]]);
	let s = [{
		point: [o[0][0], o[0][1]],
		pressure: Tw(o[0][2]) ? o[0][2] : .25,
		vector: [...HC],
		distance: 0,
		runningLength: 0
	}], c = !1, l = 0, u = s[0], d = o.length - 1;
	for (let e = 1; e < o.length; e++) {
		let t = i && e === d ? [o[e][0], o[e][1]] : uw(u.point, o[e], a);
		if (rw(u.point, t)) continue;
		let n = sw(t, u.point);
		if (l += n, e < d && !c) {
			if (l < r) continue;
			c = !0;
		}
		XC(ww, u.point, t), u = {
			point: t,
			pressure: Tw(o[e][2]) ? o[e][2] : VC,
			vector: ow(ww),
			distance: n,
			runningLength: l
		}, s.push(u);
	}
	return s[0].vector = s[1]?.vector || [0, 0], s;
}
function Dw(e, t = {}) {
	return Cw(Ew(e, t), t);
}
var Ow = Dw, kw = (e, t) => (e + t) / 2;
function Aw(e, t = !0) {
	let n = e.length;
	if (n < 4) return "";
	let r = e[0], i = e[1], a = e[2], o = `M${r[0].toFixed(2)},${r[1].toFixed(2)} Q${i[0].toFixed(2)},${i[1].toFixed(2)} ${kw(i[0], a[0]).toFixed(2)},${kw(i[1], a[1]).toFixed(2)} T`;
	for (let t = 2, a = n - 1; t < a; t++) r = e[t], i = e[t + 1], o += `${kw(r[0], i[0]).toFixed(2)},${kw(r[1], i[1]).toFixed(2)} `;
	return t && (o += "Z"), o;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+signature-pad@1.43.3/node_modules/@zag-js/signature-pad/dist/signature-pad.machine.mjs
var jw = Pn({
	props({ props: e }) {
		return {
			defaultPaths: [],
			...e,
			drawing: {
				size: 2,
				simulatePressure: !1,
				thinning: .7,
				smoothing: .4,
				streamline: .6,
				...e.drawing
			}
		};
	},
	initialState() {
		return "idle";
	},
	context({ prop: e, bindable: t }) {
		return {
			paths: t(() => ({
				defaultValue: e("defaultPaths"),
				value: e("paths"),
				sync: !0,
				onChange(t) {
					e("onDraw")?.({
						paths: t,
						currentPath: null
					});
				}
			})),
			currentPoints: t(() => ({ defaultValue: [] })),
			currentPath: t(() => ({ defaultValue: null }))
		};
	},
	computed: {
		isInteractive: ({ prop: e }) => !(e("disabled") || e("readOnly")),
		isEmpty: ({ context: e }) => e.get("paths").length === 0
	},
	on: { CLEAR: { actions: [
		"clearPoints",
		"invokeOnDrawEnd",
		"focusCanvasEl"
	] } },
	states: {
		idle: { on: { POINTER_DOWN: {
			target: "drawing",
			actions: ["addPoint"]
		} } },
		drawing: {
			effects: ["trackPointerMove"],
			on: {
				POINTER_MOVE: { actions: ["addPoint", "invokeOnDraw"] },
				POINTER_UP: {
					target: "idle",
					actions: ["endStroke", "invokeOnDrawEnd"]
				}
			}
		}
	},
	implementations: {
		effects: { trackPointerMove({ scope: e, send: t }) {
			let n = e.getDoc();
			return Le(n, {
				onPointerMove({ event: n, point: r }) {
					let i = PC(e);
					if (!i) return;
					let { offset: a } = Ta(r, i);
					t({
						type: "POINTER_MOVE",
						point: a,
						pressure: n.pressure
					});
				},
				onPointerUp() {
					t({ type: "POINTER_UP" });
				}
			});
		} },
		actions: {
			addPoint({ context: e, event: t, prop: n }) {
				let r = [...e.get("currentPoints"), t.point];
				e.set("currentPoints", r);
				let i = Ow(r, n("drawing"));
				e.set("currentPath", Aw(i));
			},
			endStroke({ context: e }) {
				let t = [...e.get("paths"), e.get("currentPath")];
				e.set("paths", t), e.set("currentPoints", []), e.set("currentPath", null);
			},
			clearPoints({ context: e }) {
				e.set("currentPoints", []), e.set("paths", []), e.set("currentPath", null);
			},
			focusCanvasEl({ scope: e }) {
				queueMicrotask(() => {
					e.getActiveElement()?.focus({ preventScroll: !0 });
				});
			},
			invokeOnDraw({ context: e, prop: t }) {
				t("onDraw")?.({
					paths: e.get("paths"),
					currentPath: e.get("currentPath")
				});
			},
			invokeOnDrawEnd({ context: e, prop: t, scope: n, computed: r }) {
				t("onDrawEnd")?.({
					paths: [...e.get("paths")],
					getDataUrl(e, t = .92) {
						return r("isEmpty") ? Promise.resolve("") : IC(n, {
							type: e,
							quality: t
						});
					}
				});
			}
		}
	}
}), Mw = (e) => {
	let t = Nt(), n = gn(), r = Ru(), i = _(() => {
		let i = St(e);
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			ids: {
				label: r?.()?.ids.label,
				hiddenInput: r?.()?.ids.control
			},
			disabled: r?.()?.disabled,
			readOnly: r?.()?.readOnly,
			required: r?.()?.required,
			...i
		};
	}), a = Tn(jw, () => z(i)), o = _(() => RC(a, Wt));
	return () => z(o);
}, Nw = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"value"
]);
function Pw(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = R(t, "value", 7), i = q(t, Nw), a = _(() => X(r()().getRootProps(), i));
	return xC(() => r()()), Q(e, Y({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		},
		get value() {
			return r();
		},
		set value(e) {
			r(e), M();
		}
	});
}
U(Pw, {
	ref: {},
	value: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/signature-pad/signature-pad-segment.svelte
var Fw = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]), Iw = ae("<path></path>"), Lw = L("<title>Signature</title> <!> <!>", 1);
function Rw(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, Fw), i = SC(), a = _(() => X(i().getSegmentProps(), r)), o = _(() => i().currentPath);
	return Q(e, Y({ as: "svg" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		},
		children: (e, t) => {
			var n = Lw(), r = W(K(n), 2);
			h(r, 17, () => i().paths, se, (e, t) => {
				var n = Iw();
				g(n, (e) => ({ ...e }), [() => i().getSegmentPathProps({ path: z(t) })]), I(e, n);
			});
			var a = W(r, 2), s = (e) => {
				var t = Iw();
				g(t, (e) => ({ ...e }), [() => i().getSegmentPathProps({ path: z(o) })]), I(e, t);
			};
			P(a, (e) => {
				z(o) && e(s);
			}), I(e, n);
		},
		$$slots: { default: !0 }
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(Rw, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/SignaturePad.svelte
var zw = /* @__PURE__ */ new WeakMap(), Bw = 3.3 / 2, Vw = 1.9000000000000001 / 3.3, Hw = "#0f172a", Uw = L("<span id=\"af-described\" hidden=\"\"> </span>"), Ww = L("<img part=\"image\" alt=\"\"/>"), Gw = L("<div class=\"frame svelte-ejan91\" role=\"img\"><!></div>"), Kw = L("<!> <!> <!>", 1), qw = L("<!> <div class=\"footer svelte-ejan91\"><p part=\"hint\" id=\"af-hint\"> </p> <!></div>", 1), Jw = L("<div class=\"af-kit signature svelte-ejan91\"><!> <!></div>"), Yw = L("<!> <!>", 1), Xw = {
	hash: "svelte-ejan91",
	code: ":host {display:block;}.signature.svelte-ejan91 {display:flex;flex-direction:column;height:100%;}.signature.svelte-ejan91 > .root {display:contents;}.frame.svelte-ejan91, [part~='control'] {position:relative;box-sizing:border-box;flex:1 1 290px;min-height:0;overflow:hidden;border:1px solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:#fff;outline:none;touch-action:none;}[part~='control'] {cursor:crosshair;}[part~='control']:focus-visible {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring);}[part~='control'][data-disabled] {opacity:0.5;cursor:not-allowed;}[part~='control'][aria-invalid='true'] {border-color:var(--k-danger);}[part~='image'] {position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:left top;pointer-events:none;}[part~='guide'] {position:absolute;right:24px;bottom:25%;left:24px;border-bottom:1px dashed #d4d4d4;pointer-events:none;}.footer.svelte-ejan91 {display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px;}[part~='hint'] {margin:0;color:var(--k-muted);font-size:11px;}[part~='clear'] {flex:none;}\n  @media (forced-colors: active) {[part~='control']:focus-visible {outline:2px solid;outline-offset:2px;}\n  }"
};
function Zw(e, r) {
	let i = m();
	O(r, !0), ee(e, Xw);
	let a = R(r, "value", 7, null), o = R(r, "label", 7, null), s = R(r, "disabled", 7, !1), l = R(r, "locale", 7, null), u = R(r, "strings", 7, null), f = R(r, "name", 7, null), p = R(r, "required", 7, !1), h = R(r, "readonly", 7, !1), g = R(r, "description", 7, null), v = R(r, "error", 7, null), b = R(r, "invalid", 7, !1), x = r.$$host, S = _(() => c(l(), u() ?? void 0)), C = _(() => o() || z(S).signaturePad), T = B(!1), te = _(() => !!s() || z(T)), re = _(() => [g(), v()].filter(Boolean).join(" ")), ie = B(null), k = B(null), A = B(null);
	V(() => {
		a(), Se(() => J(A, null));
	});
	let ae = 0, oe = 0, j = Mw(() => ({
		id: i,
		getRootNode: () => x.shadowRoot,
		disabled: z(te),
		readOnly: !!h(),
		drawing: {
			size: Bw,
			thinning: Vw,
			simulatePressure: !1,
			fill: Hw
		},
		translations: {
			control: z(C),
			clearTrigger: z(S).clear
		},
		onDrawEnd: (e) => {
			let t = ++ae;
			if (!e.paths.length) {
				if (J(k, null), oe) {
					oe--;
					return;
				}
				J(A, a()), n(x, "change", { value: null });
				return;
			}
			new Promise((t) => t(e.getDataUrl("image/png"))).then((e) => {
				t === ae && (J(k, e || null, !0), e && n(x, "change", { value: e }));
			}, (e) => {
				t === ae && (J(k, null), console.warn("A signature could not be exported as an image; the pad reports no value.", { error: String(e) }));
			});
		}
	})), se = _(() => j().paths.length > 0 || !!j().currentPath), ce = _(() => !!a() && !z(se) && a() !== z(A)), L = _(() => z(se) ? z(k) : z(ce) ? a() : null);
	zw.set(x, () => j().clear()), Te(() => {
		let e = !!p() && !z(L);
		Dr(x, {
			name: f(),
			value: z(L),
			validity: e ? { valueMissing: !0 } : {},
			message: e ? d(z(S), "valueMissing") : "",
			anchor: z(ie)
		});
	}), Or(x, {
		reset() {
			let e = x.getAttribute("value") || null, t = z(L);
			j().empty || (oe++, j().clear()), J(A, null), t !== e && n(x, "change", { value: e });
		},
		disabled(e) {
			J(T, e, !0);
		}
	});
	var le = {
		get value() {
			return a();
		},
		set value(e = null) {
			a(e), M();
		},
		get label() {
			return o();
		},
		set label(e = null) {
			o(e), M();
		},
		get disabled() {
			return s();
		},
		set disabled(e = !1) {
			s(e), M();
		},
		get locale() {
			return l();
		},
		set locale(e = null) {
			l(e), M();
		},
		get strings() {
			return u();
		},
		set strings(e = null) {
			u(e), M();
		},
		get name() {
			return f();
		},
		set name(e = null) {
			f(e), M();
		},
		get required() {
			return p();
		},
		set required(e = !1) {
			p(e), M();
		},
		get readonly() {
			return h();
		},
		set readonly(e = !1) {
			h(e), M();
		},
		get description() {
			return g();
		},
		set description(e = null) {
			g(e), M();
		},
		get error() {
			return v();
		},
		set error(e = null) {
			v(e), M();
		},
		get invalid() {
			return b();
		},
		set invalid(e = !1) {
			b(e), M();
		}
	}, ue = Yw(), de = K(ue);
	t(de, {});
	var U = W(de, 2);
	return Yt(U, {
		value: () => x.shadowRoot,
		children: (e, t) => {
			var n = Jw(), r = H(n), i = (e) => {
				var t = Uw(), n = ge(t, !0);
				G(() => w(n, z(re))), I(e, t);
			};
			P(r, (e) => {
				z(re) && e(i);
			});
			var o = W(r, 2), s = (e) => {
				var t = Gw(), n = H(t), r = (e) => {
					var t = Ww();
					G(() => N(t, "src", a())), I(e, t);
				};
				P(n, (e) => {
					a() && e(r);
				}), D(t), G(() => N(t, "aria-label", z(C))), I(e, t);
			}, c = (e) => {
				var t = F(), n = K(t);
				E(n, () => Pw, (e, t) => {
					t(e, {
						get value() {
							return j;
						},
						class: "root",
						children: (e, t) => {
							var n = qw(), r = K(n);
							{
								let e = _(() => z(re) ? "af-hint af-described" : "af-hint"), t = _(() => b() ? "true" : void 0);
								E(r, () => EC, (n, r) => {
									r(n, {
										part: "control",
										get "aria-describedby"() {
											return z(e);
										},
										get "aria-invalid"() {
											return z(t);
										},
										get ref() {
											return z(ie);
										},
										set ref(e) {
											J(ie, e, !0);
										},
										children: (e, t) => {
											var n = Kw(), r = K(n), i = (e) => {
												var t = Ww();
												G(() => N(t, "src", a())), I(e, t);
											};
											P(r, (e) => {
												z(ce) && e(i);
											});
											var o = W(r, 2);
											E(o, () => Rw, (e, t) => {
												t(e, {
													part: "segment",
													"aria-hidden": "true"
												});
											});
											var s = W(o, 2);
											E(s, () => OC, (e, t) => {
												t(e, { part: "guide" });
											}), I(e, n);
										},
										$$slots: { default: !0 }
									});
								});
							}
							var i = W(r, 2), o = H(i), s = ge(o, !0), c = W(o, 2);
							{
								let e = _(() => z(te) || !z(se) && !z(ce));
								E(c, () => wC, (t, n) => {
									n(t, {
										part: "clear",
										class: "af-button ghost sm",
										hidden: !1,
										get disabled() {
											return z(e);
										},
										children: (e, t) => {
											ne();
											var n = fe();
											G(() => w(n, z(S).clear)), I(e, n);
										},
										$$slots: { default: !0 }
									});
								});
							}
							D(i), G(() => w(s, z(S).signHint)), I(e, n);
						},
						$$slots: { default: !0 }
					});
				}), I(e, t);
			};
			P(o, (e) => {
				h() ? e(s) : e(c, -1);
			}), D(n), I(e, n);
		},
		$$slots: { default: !0 }
	}), I(e, ue), y(le);
}
U(Zw, {
	value: {
		attribute: "value",
		type: "String"
	},
	label: {
		attribute: "label",
		type: "String"
	},
	disabled: {
		attribute: "disabled",
		reflect: !0,
		type: "Boolean"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" },
	name: {
		attribute: "name",
		reflect: !0,
		type: "String"
	},
	required: {
		attribute: "required",
		type: "Boolean"
	},
	readonly: {
		attribute: "readonly",
		reflect: !0,
		type: "Boolean"
	},
	description: {
		attribute: "description",
		type: "String"
	},
	error: {
		attribute: "error",
		type: "String"
	},
	invalid: {
		attribute: "invalid",
		type: "Boolean"
	}
}, [], [], { mode: "open" }, (e) => class extends Er(e) {
	focus(e) {
		let t = this.shadowRoot?.querySelector("[part~=\"control\"]");
		t ? t.focus(e) : super.focus(e);
	}
	clear() {
		zw.get(this)?.();
	}
});
var Qw = ln("splitter").parts("root", "panel", "resizeTrigger", "resizeTriggerIndicator").build(), $w = (e) => e.ids?.root ?? `splitter:${e.id}`, eT = (e, t) => e.ids?.resizeTrigger?.(t) ?? `splitter:${e.id}:splitter:${t}`, tT = (e, t) => e.ids?.panel?.(t) ?? `splitter:${e.id}:panel:${t}`, nT = (e) => `splitter:${e.id}:global-cursor`, rT = (e) => e.getById($w(e)), iT = (e, t) => t == null ? null : e.getById(eT(e, t)), aT = (e) => Bt(e) && e.dataset.part === "panel" ? e.dataset.id : void 0, oT = (e) => {
	let t = e?.previousElementSibling ?? null;
	for (; t;) {
		let e = aT(t);
		if (e) return e;
		t = t.previousElementSibling;
	}
}, sT = (e) => {
	let t = e?.nextElementSibling ?? null;
	for (; t;) {
		let e = aT(t);
		if (e) return e;
		t = t.nextElementSibling;
	}
}, cT = (e, t) => {
	let [n, r] = t.split(":");
	if (n && r) return t;
	let i = iT(e, t), a = n || oT(i), o = r || sT(i);
	return a && o ? `${a}:${o}` : null;
}, lT = (e, t) => {
	let n = t ? "col-resize" : "row-resize";
	return e.isAtMin && (n = t ? "e-resize" : "s-resize"), e.isAtMax && (n = t ? "w-resize" : "n-resize"), n;
}, uT = (e) => ht(rT(e), `[role=separator]${qt($w(e))}`), dT = (e) => e.getDoc().getElementById(nT(e)), fT = (e, t, n, r) => {
	let i = dT(e), a = `* { cursor: ${lT(t, n)} !important; }`;
	if (i) i.textContent = a;
	else {
		let t = e.getDoc().createElement("style");
		r && (t.nonce = r), t.id = nT(e), t.textContent = a, e.getDoc().head.appendChild(t);
	}
}, pT = (e) => {
	dT(e)?.remove();
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/utils/aria.mjs
function mT({ size: e, panels: t, pivotIndices: n }) {
	let r = 0, i = 100, a = 0, o = 0, s = n[0];
	return gt(s, () => "No pivot index found"), t.forEach((e, t) => {
		let { maxSize: n = 100, minSize: c = 0 } = e;
		t === s ? (r = c, i = n) : (a += c, o += n);
	}), {
		valueMax: Math.min(i, 100 - a),
		valueMin: Math.max(r, 100 - o),
		valueNow: e[s]
	};
}
function hT(e, t, n) {
	let [r, i] = n.split(":"), a = t.findIndex((e) => e.id === r), o = t.findIndex((e) => e.id === i);
	if (a === -1 || o === -1) return {
		beforeId: r || void 0,
		afterId: i || void 0,
		valueMax: void 0,
		valueMin: void 0,
		valueNow: void 0
	};
	let { valueMax: s, valueMin: c, valueNow: l } = mT({
		size: e,
		panels: t,
		pivotIndices: [a, o]
	});
	return {
		beforeId: r,
		afterId: i,
		valueMax: Math.round(s),
		valueMin: Math.round(c),
		valueNow: l == null ? void 0 : Math.round(l)
	};
}
function gT(e, t, n = 10) {
	return e.toFixed(n) === t.toFixed(n) ? 0 : e > t ? 1 : -1;
}
function _T(e, t, n = 10) {
	return e == null || t == null ? !1 : gT(e, t, n) === 0;
}
function vT(e, t, n) {
	if (e.length !== t.length) return !1;
	for (let r = 0; r < e.length; r++) {
		let i = e[r], a = t[r];
		if (!_T(i, a, n)) return !1;
	}
	return !0;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/utils/size.mjs
var yT = /^(-?\d*\.?\d+)(%|px|em|rem|vw|vh)?$/, bT = /^(-?\d*\.?\d+)%$/;
function xT(e, t) {
	if (!e) return 0;
	let n = e.getBoundingClientRect();
	return t === "horizontal" ? n.width : n.height;
}
function ST(e, t) {
	return xT(e, t);
}
function CT(e, t, n) {
	let r = n.ownerDocument.defaultView;
	if (r) switch (t) {
		case "px": return e;
		case "em": return e * Number.parseFloat(r.getComputedStyle(n).fontSize);
		case "rem": return e * Number.parseFloat(r.getComputedStyle(n.ownerDocument.documentElement).fontSize);
		case "vw": return e / 100 * r.innerWidth;
		case "vh": return e / 100 * r.innerHeight;
		default: return;
	}
}
function wT(e, t, n) {
	if (e == null) return;
	if (typeof e == "number") return e;
	let r = e.trim().match(yT);
	if (!r) return;
	let i = Number.parseFloat(r[1]);
	if (!Number.isFinite(i)) return;
	let a = r[2];
	if (a == null || a === "%") return i;
	if (!t) return;
	let o = xT(t, n);
	if (o === 0) return;
	let s = CT(i, a, t);
	return s == null ? void 0 : s / o * 100;
}
function TT(e) {
	if (e == null) return;
	if (typeof e == "number") return `${e}%`;
	let t = e.trim();
	if (bT.test(t)) return t;
	let n = t.match(yT);
	if (!n) return;
	let r = Number.parseFloat(n[1]);
	if (!Number.isFinite(r)) return;
	let i = n[2];
	return i == null ? `${r}%` : `${r}${i}`;
}
function ET({ sizes: e, panels: t, rootEl: n, orientation: r }) {
	let i = Array(t.length), a = 100, o = 0;
	for (let s = 0; s < t.length; s++) {
		let t = wT(e?.[s], n, r);
		t != null && (o++, i[s] = t, a -= t);
	}
	for (let e = 0; e < t.length; e++) {
		if (i[e] != null) continue;
		let n = t.length - o, r = n > 0 ? a / n : 0;
		o++, i[e] = r, a -= r;
	}
	return i;
}
function DT(e, t, n) {
	return e.map((e) => ({
		...e,
		minSize: wT(e.minSize, t, n),
		maxSize: wT(e.maxSize, t, n),
		collapsedSize: wT(e.collapsedSize, t, n)
	}));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/utils/panel.mjs
function OT(e, t) {
	let n = e.find((e) => e.id === t);
	return gt(n, () => `Panel data not found for id "${t}"`), n;
}
function kT(e, t) {
	return e.findIndex((e) => e === t || e.id === t.id);
}
function AT(e, t) {
	return e.findIndex((e) => e.id === t);
}
function jT(e, t, n) {
	let r = AT(e, t.id), i = r === e.length - 1 ? [r - 1, r] : [r, r + 1], a = n[r];
	return {
		...t,
		panelSize: a,
		pivotIndices: i
	};
}
function MT(e) {
	return e.sort((e, t) => {
		let n = e.order, r = t.order;
		return n == null && r == null ? 0 : n == null ? -1 : r == null ? 1 : n - r;
	});
}
function NT(e) {
	return e.map((e) => e.id).sort().join(":");
}
function PT(e) {
	return e.map((e) => e.id).sort().map((t) => {
		let n = e.find((e) => e.id === t);
		return JSON.stringify(n);
	}).join(",");
}
function FT({ size: e, defaultSize: t, dragState: n, resolvedSizes: r, panels: i, panelIndex: a, horizontal: o, collapsed: s = !1, precision: c = 3 }) {
	let l = r[a], u = e ?? t, d = i[a], f, p, m = 1, h = o ? "Width" : "Height", g = d ? TT(d.minSize) : void 0, _ = d ? TT(d.maxSize) : void 0, v = s ? TT(d?.collapsedSize ?? 0) : g, y = TT(u);
	return l == null ? y == null ? f = "1" : y.endsWith("%") ? f = Number.parseFloat(y).toPrecision(c) : (p = IT({
		basis: y,
		minSize: g,
		maxSize: _
	}), f = "0", m = 0) : f = i.length === 1 ? "1" : l.toPrecision(c), {
		flexBasis: p ?? 0,
		flexGrow: f,
		flexShrink: m,
		...v ? { [`min${h}`]: v } : {},
		..._ ? { [`max${h}`]: _ } : {},
		overflow: "hidden",
		pointerEvents: n === null ? void 0 : "none"
	};
}
function IT({ basis: e, minSize: t, maxSize: n }) {
	return `clamp(${t ?? "0%"}, ${e}, ${n ?? "100%"})`;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/splitter.connect.mjs
function LT(e, t) {
	let { state: n, send: r, prop: i, computed: a, context: o, scope: s } = e, c = a("horizontal"), l = n.matches("dragging"), u = i("registry"), d = i("orientation"), f = i("panels"), p = o.get("panels"), m = () => {
		let e = o.get("size");
		return e.length > 0 ? e : ET({
			sizes: i("size") ?? i("defaultSize"),
			panels: f,
			rootEl: null,
			orientation: d
		});
	}, h = (e) => {
		let t = f.findIndex((t) => t.id === e), n = i("size")?.[t], r = i("defaultSize")?.[t], a = o.get("dragState"), s = o.get("size"), l = p[t], u = s[t], d = !!l?.collapsible && u != null && _T(u, l.collapsedSize ?? 0);
		return FT({
			size: n,
			defaultSize: r,
			dragState: a,
			resolvedSizes: s,
			panels: f,
			panelIndex: t,
			horizontal: c,
			collapsed: d
		});
	}, g = (e) => {
		let [t, n] = e.split(":");
		if (t && n) return e;
		if (t) {
			let n = f.findIndex((e) => e.id === t), r = f[n + 1];
			return r ? `${t}:${r.id}` : e;
		}
		if (n) {
			let t = f.findIndex((e) => e.id === n), r = f[t - 1];
			return r ? `${r.id}:${n}` : e;
		}
		return e;
	}, _ = (e) => {
		let { id: t, disabled: r } = e, i = o.get("dragState")?.resizeTriggerId === t;
		return {
			dragging: i,
			focused: i || n.matches("focused") && o.get("keyboardState")?.resizeTriggerId === t,
			disabled: !!r
		};
	};
	return {
		dragging: l,
		orientation: d,
		getPanels() {
			return f;
		},
		getPanelById(e) {
			return OT(f, e);
		},
		getItems() {
			return f.flatMap((e, t, n) => {
				let r = n[t + 1];
				return e && r ? [{
					type: "panel",
					id: e.id
				}, {
					type: "handle",
					id: `${e.id}:${r.id}`
				}] : [{
					type: "panel",
					id: e.id
				}];
			});
		},
		getSizes() {
			return m();
		},
		setSizes(e) {
			r({
				type: "SIZE.SET",
				size: e
			});
		},
		resetSizes() {
			r({ type: "SIZE.RESET" });
		},
		collapsePanel(e) {
			r({
				type: "PANEL.COLLAPSE",
				id: e
			});
		},
		expandPanel(e, t) {
			r({
				type: "PANEL.EXPAND",
				id: e,
				minSize: t
			});
		},
		resizePanel(e, t) {
			r({
				type: "PANEL.RESIZE",
				id: e,
				size: t
			});
		},
		getPanelSize(e) {
			let t = o.get("panels"), n = m(), r = OT(t, e), { panelSize: i } = jT(t, r, n);
			return gt(i != null, () => `Panel size not found for panel "${r.id}"`), i;
		},
		isPanelCollapsed(e) {
			let t = o.get("panels"), n = m(), r = OT(t, e), { collapsedSize: i = 0, collapsible: a, panelSize: s } = jT(t, r, n);
			return gt(s != null, () => `Panel size not found for panel "${r.id}"`), a === !0 && _T(s, i);
		},
		isPanelExpanded(e) {
			let t = o.get("panels"), n = m(), r = OT(t, e), { collapsedSize: i = 0, collapsible: a, panelSize: s } = jT(t, r, n);
			return gt(s != null, () => `Panel size not found for panel "${r.id}"`), !a || gT(s, i) > 0;
		},
		getLayout() {
			return NT(i("panels"));
		},
		getRootProps() {
			return t.element({
				...Qw.root.attrs,
				"data-orientation": d,
				"data-dragging": Z(l),
				id: $w(s),
				dir: i("dir"),
				style: {
					display: "flex",
					flexDirection: c ? "row" : "column",
					height: "100%",
					width: "100%",
					overflow: "hidden"
				}
			});
		},
		getPanelProps(e) {
			let { id: n } = e;
			return t.element({
				...Qw.panel.attrs,
				"data-orientation": d,
				"data-dragging": Z(l),
				dir: i("dir"),
				"data-id": n,
				"data-index": AT(i("panels"), n),
				id: tT(s, n),
				"data-ownedby": $w(s),
				style: h(n)
			});
		},
		getResizeTriggerState: _,
		getResizeTriggerIndicator(e) {
			let n = _(e);
			return t.element({
				...Qw.resizeTriggerIndicator.attrs,
				"data-orientation": d,
				"data-focus": Z(n.focused),
				"data-dragging": Z(n.dragging),
				"data-disabled": Z(n.disabled),
				"data-ownedby": $w(s)
			});
		},
		getResizeTriggerProps(e) {
			let { id: n } = e, a = _(e), o = g(n), l = hT(m(), p, o);
			return t.element({
				...Qw.resizeTrigger.attrs,
				dir: i("dir"),
				id: eT(s, n),
				role: "separator",
				"data-id": n,
				"data-ownedby": $w(s),
				tabIndex: a.disabled ? void 0 : 0,
				"aria-valuenow": l.valueNow,
				"aria-valuemin": l.valueMin,
				"aria-valuemax": l.valueMax,
				"data-orientation": d,
				"aria-orientation": d,
				"aria-controls": l.beforeId && l.afterId ? `${tT(s, l.beforeId)} ${tT(s, l.afterId)}` : void 0,
				"data-focus": Z(a.focused),
				"data-dragging": Z(a.dragging),
				"data-disabled": Z(a.disabled),
				style: {
					touchAction: "none",
					userSelect: "none",
					WebkitUserSelect: "none",
					flex: "0 0 auto",
					pointerEvents: a.disabled || a.dragging && !a.focused ? "none" : void 0,
					cursor: a.disabled || u ? void 0 : c ? "col-resize" : "row-resize",
					[c ? "minHeight" : "minWidth"]: "0"
				},
				onPointerDown(e) {
					if (!Fn(e)) return;
					if (a.disabled) {
						e.preventDefault();
						return;
					}
					if (e.currentTarget.focus({
						preventScroll: !0,
						focusVisible: !1
					}), u) return;
					let t = rt(e);
					r({
						type: "POINTER_DOWN",
						id: n,
						point: t
					}), e.currentTarget.setPointerCapture(e.pointerId), e.preventDefault(), e.stopPropagation();
				},
				onPointerUp(e) {
					a.disabled || e.currentTarget.hasPointerCapture(e.pointerId) && e.currentTarget.releasePointerCapture(e.pointerId);
				},
				onPointerOver() {
					a.disabled || u || r({
						type: "POINTER_OVER",
						id: n
					});
				},
				onPointerLeave() {
					a.disabled || u || r({
						type: "POINTER_LEAVE",
						id: n
					});
				},
				onBlur() {
					a.disabled || r({ type: "BLUR" });
				},
				onFocus() {
					a.disabled || r({
						type: "FOCUS",
						id: n
					});
				},
				onKeyDown(e) {
					if (e.defaultPrevented || a.disabled) return;
					let t = i("keyboardResizeBy"), o = 0;
					o = e.shiftKey ? 10 : t ?? 1;
					let s = {
						Enter() {
							r({
								type: "ENTER",
								id: n
							});
						},
						ArrowUp() {
							r({
								type: "KEYBOARD_MOVE",
								id: n,
								delta: c ? 0 : -o
							});
						},
						ArrowDown() {
							r({
								type: "KEYBOARD_MOVE",
								id: n,
								delta: c ? 0 : o
							});
						},
						ArrowLeft() {
							r({
								type: "KEYBOARD_MOVE",
								id: n,
								delta: c ? -o : 0
							});
						},
						ArrowRight() {
							r({
								type: "KEYBOARD_MOVE",
								id: n,
								delta: c ? o : 0
							});
						},
						Home() {
							r({
								type: "KEYBOARD_MOVE",
								id: n,
								delta: -100
							});
						},
						End() {
							r({
								type: "KEYBOARD_MOVE",
								id: n,
								delta: 100
							});
						},
						F6() {
							r({
								type: "FOCUS.CYCLE",
								id: n,
								shiftKey: e.shiftKey
							});
						}
					}[Qt(e, {
						dir: i("dir"),
						orientation: d
					})];
					s && (s(e), e.preventDefault());
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/utils/preserve-fixed-panel-sizes.mjs
function RT({ panels: e, prevLayout: t, prevGroupSize: n, nextGroupSize: r }) {
	if (n <= 0 || r <= 0) return t;
	let i = [...t], a = [], o = 0, s = 0;
	if (e.forEach((e, c) => {
		if (e.resizeBehavior === "preserve-pixel-size") {
			let e = t[c] / 100 * n / r * 100;
			i[c] = e, o += e;
		} else a.push(c), s += t[c];
	}), a.length === 0) {
		let e = i.reduce((e, t) => e + t, 0);
		if (_T(e, 100)) return i;
		if (e <= 0) return t;
		let n = 100 / e;
		return i.map((e) => e * n);
	}
	let c = 100 - o;
	if (c <= 0) {
		let e = i.reduce((e, t) => e + t, 0);
		if (_T(e, 100)) return i;
		let t = 100 / Math.max(e, 1);
		return i.map((e) => e * t);
	}
	if (_T(s, 0)) {
		let e = c / a.length;
		return a.forEach((t) => {
			i[t] = e;
		}), i;
	}
	a.forEach((e) => {
		i[e] = t[e] / s * c;
	});
	let l = i.reduce((e, t) => e + t, 0);
	if (_T(l, 100)) return i;
	let u = 100 / l;
	return i.map((e) => e * u);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/utils/resize-panel.mjs
function zT({ panels: e, index: t, size: n }) {
	let r = e[t];
	gt(r, () => `Panel data not found for index ${t}`);
	let { collapsedSize: i = 0, collapsible: a, maxSize: o = 100, minSize: s = 0 } = r;
	if (gT(n, s) < 0) {
		if (a) {
			let e = (i + s) / 2;
			n = gT(n, e) < 0 ? i : s;
		} else n = s;
	}
	return n = Math.min(o, n), n = parseFloat(n.toFixed(10)), n;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/utils/resize-by-delta.mjs
function BT(e) {
	let { delta: t, initialSize: n, panels: r, pivotIndices: i, prevSize: a, trigger: o } = e;
	if (_T(t, 0)) return n;
	let s = [...n], [c, l] = i;
	gt(c, () => "Invalid first pivot index"), gt(l, () => "Invalid second pivot index");
	let u = 0;
	if (o === "keyboard") {
		{
			let e = t < 0 ? l : c, i = r[e];
			gt(i, () => `Panel data not found for index ${e}`);
			let { collapsedSize: a = 0, collapsible: o, minSize: s = 0 } = i;
			if (o) {
				let r = n[e];
				if (gt(r, () => `Previous size not found for panel index ${e}`), _T(r, a)) {
					let e = s - r;
					gT(e, Math.abs(t)) > 0 && (t = t < 0 ? 0 - e : e);
				}
			}
		}
		{
			let e = t < 0 ? c : l, i = r[e];
			gt(i, () => `No panel data found for index ${e}`);
			let { collapsedSize: a = 0, collapsible: o, minSize: s = 0 } = i;
			if (o) {
				let r = n[e];
				if (gt(r, () => `Previous size not found for panel index ${e}`), _T(r, s)) {
					let e = r - a;
					gT(e, Math.abs(t)) > 0 && (t = t < 0 ? 0 - e : e);
				}
			}
		}
	}
	{
		let e = t < 0 ? 1 : -1, i = t < 0 ? l : c, a = 0;
		for (;;) {
			let t = n[i];
			gt(t, () => `Previous size not found for panel index ${i}`);
			let o = zT({
				panels: r,
				index: i,
				size: 100
			}) - t;
			if (a += o, i += e, i < 0 || i >= r.length) break;
		}
		let o = Math.min(Math.abs(t), Math.abs(a));
		t = t < 0 ? 0 - o : o;
	}
	{
		let e = t < 0 ? c : l;
		for (; e >= 0 && e < r.length;) {
			let i = Math.abs(t) - Math.abs(u), a = n[e];
			gt(a, () => `Previous size not found for panel index ${e}`);
			let o = a - i, c = zT({
				panels: r,
				index: e,
				size: o
			});
			if (!_T(a, c) && (u += a - c, s[e] = c, u.toPrecision(3).localeCompare(Math.abs(t).toPrecision(3), void 0, { numeric: !0 }) >= 0)) break;
			t < 0 ? e-- : e++;
		}
	}
	if (vT(a, s)) return a;
	{
		let e = t < 0 ? l : c, i = n[e];
		gt(i, () => `Previous size not found for panel index ${e}`);
		let a = i + u, o = zT({
			panels: r,
			index: e,
			size: a
		});
		if (s[e] = o, !_T(o, a)) {
			let e = a - o, n = t < 0 ? l : c;
			for (; n >= 0 && n < r.length;) {
				let i = s[n];
				gt(i, () => `Previous size not found for panel index ${n}`);
				let a = i + e, o = zT({
					panels: r,
					index: n,
					size: a
				});
				if (_T(i, o) || (e -= o - i, s[n] = o), _T(e, 0)) break;
				t > 0 ? n-- : n++;
			}
		}
	}
	return _T(s.reduce((e, t) => t + e, 0), 100) ? s : a;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/utils/validate-sizes.mjs
function VT({ size: e, panels: t }) {
	let n = [...e], r = n.reduce((e, t) => e + t, 0);
	if (n.length !== t.length) throw Error(`Invalid ${t.length} panel size: ${n.map((e) => `${e}%`).join(", ")}`);
	if (!_T(r, 100) && n.length > 0) for (let e = 0; e < t.length; e++) {
		let t = n[e];
		gt(t, () => `No size data found for index ${e}`);
		let i = 100 / r * t;
		n[e] = i;
	}
	let i = 0;
	for (let e = 0; e < t.length; e++) {
		let r = n[e];
		gt(r, () => `No size data found for index ${e}`);
		let a = zT({
			panels: t,
			index: e,
			size: r
		});
		r != a && (i += r - a, n[e] = a);
	}
	if (!_T(i, 0)) for (let e = 0; e < t.length; e++) {
		let r = n[e];
		gt(r, () => `No size data found for index ${e}`);
		let a = r + i, o = zT({
			panels: t,
			index: e,
			size: a
		});
		if (r !== o && (i -= o - r, n[e] = o, _T(i, 0))) break;
	}
	return n;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/splitter.machine.mjs
var HT = Pn({
	props({ props: e }) {
		return Re(e, ["panels"]), {
			orientation: "horizontal",
			defaultSize: [],
			dir: "ltr",
			...e,
			panels: MT(e.panels)
		};
	},
	initialState() {
		return "idle";
	},
	context({ prop: e, bindable: t, getContext: n, getRefs: r }) {
		return {
			panels: t(() => ({ defaultValue: DT(e("panels"), null, e("orientation")) })),
			size: t(() => ({
				defaultValue: [],
				isEqual(e, t) {
					return t != null && vT(e, t);
				},
				onChange(t) {
					let i = n(), a = r();
					if (a.get("suppressOnResize")) return;
					let o = a.get("panelSizeBeforeCollapse"), s = Object.fromEntries(o.entries()), c = i.get("dragState")?.resizeTriggerId ?? null, l = NT(e("panels"));
					e("onResize")?.({
						size: t,
						layout: l,
						resizeTriggerId: c,
						expandToSizes: s
					});
				}
			})),
			dragState: t(() => ({ defaultValue: null })),
			keyboardState: t(() => ({ defaultValue: null }))
		};
	},
	watch({ track: e, action: t, prop: n }) {
		e([
			() => PT(n("panels")),
			() => JSON.stringify(n("size") ?? []),
			() => JSON.stringify(n("defaultSize") ?? [])
		], () => {
			t(["syncSize"]);
		});
	},
	refs() {
		return {
			panelSizeBeforeCollapse: /* @__PURE__ */ new Map(),
			prevDelta: 0,
			panelIdToLastNotifiedSizeMap: /* @__PURE__ */ new Map(),
			initialSize: null,
			prevInitialLayout: null,
			prevGroupSize: null,
			lastRequestedSize: null,
			suppressOnResize: !1
		};
	},
	computed: { horizontal({ prop: e }) {
		return e("orientation") === "horizontal";
	} },
	on: {
		"SIZE.SET": { actions: ["setSize"] },
		"SIZE.RESET": { actions: ["resetSize"] },
		"PANEL.COLLAPSE": { actions: ["collapsePanel"] },
		"PANEL.EXPAND": { actions: ["expandPanel"] },
		"PANEL.RESIZE": { actions: ["resizePanel"] },
		"ROOT.RESIZE": { actions: ["syncSize"] }
	},
	entry: ["syncSize"],
	exit: ["clearGlobalCursor"],
	effects: ["trackResizeHandles", "trackRootResize"],
	states: {
		idle: {
			entry: ["clearDraggingState", "clearKeyboardState"],
			on: {
				POINTER_OVER: {
					target: "hover:temp",
					actions: ["setKeyboardState"]
				},
				FOCUS: {
					target: "focused",
					actions: ["setKeyboardState"]
				},
				POINTER_DOWN: {
					target: "dragging",
					actions: ["setDraggingState"]
				}
			}
		},
		"hover:temp": {
			effects: ["waitForHoverDelay"],
			on: {
				HOVER_DELAY: { target: "hover" },
				FOCUS: {
					target: "focused",
					actions: ["setKeyboardState"]
				},
				POINTER_DOWN: {
					target: "dragging",
					actions: ["setDraggingState"]
				},
				POINTER_LEAVE: { target: "idle" }
			}
		},
		hover: {
			tags: ["focus"],
			on: {
				FOCUS: {
					target: "focused",
					actions: ["setKeyboardState"]
				},
				POINTER_DOWN: {
					target: "dragging",
					actions: ["setDraggingState"]
				},
				POINTER_LEAVE: { target: "idle" }
			}
		},
		focused: {
			tags: ["focus"],
			on: {
				BLUR: { target: "idle" },
				ENTER: { actions: ["collapseOrExpandPanel"] },
				POINTER_DOWN: {
					target: "dragging",
					actions: ["setDraggingState"]
				},
				KEYBOARD_MOVE: { actions: [
					"invokeOnResizeStart",
					"setKeyboardValue",
					"invokeOnResizeEnd"
				] },
				"FOCUS.CYCLE": { actions: ["focusNextResizeTrigger"] }
			}
		},
		dragging: {
			tags: ["focus"],
			effects: ["trackPointerMove"],
			entry: ["invokeOnResizeStart"],
			on: {
				POINTER_MOVE: { actions: ["setPointerValue", "setGlobalCursor"] },
				POINTER_UP: [{
					guard: "isResizeTriggerFocused",
					target: "focused",
					actions: [
						"invokeOnResizeEnd",
						"setKeyboardState",
						"clearDraggingState",
						"clearGlobalCursor"
					]
				}, {
					target: "idle",
					actions: ["invokeOnResizeEnd", "clearGlobalCursor"]
				}]
			}
		}
	},
	implementations: {
		guards: { isResizeTriggerFocused({ context: e, scope: t }) {
			let n = e.get("dragState");
			return t.isActiveElement(iT(t, n?.resizeTriggerId));
		} },
		effects: {
			trackResizeHandles: ({ prop: e, scope: t, send: n }) => {
				let r = e("registry");
				if (!r) return;
				let i = [], a = () => {
					i.forEach((e) => e()), i = uT(t).map((i) => {
						let a = i.dataset.id;
						if (a) return r.register({
							id: eT(t, a),
							element: i,
							orientation: e("orientation"),
							onActivate(e) {
								n({
									type: "POINTER_DOWN",
									id: a,
									point: e
								});
							},
							onDeactivate() {
								n({ type: "POINTER_UP" });
							}
						});
					}).filter(Boolean);
				};
				a();
				let o = va(rT(t), { callback: a });
				return () => {
					i.forEach((e) => e()), o?.();
				};
			},
			trackRootResize: ({ scope: e, send: t }) => {
				let n = rT(e);
				if (n) return Ma.observe(n, () => {
					t({ type: "ROOT.RESIZE" });
				});
			},
			waitForHoverDelay: ({ send: e }) => Hr(() => {
				e({ type: "HOVER_DELAY" });
			}, 250),
			trackPointerMove: ({ scope: e, send: t }) => {
				let n = e.getDoc();
				return Le(n, {
					onPointerMove(e) {
						t({
							type: "POINTER_MOVE",
							point: e.point
						});
					},
					onPointerUp() {
						t({ type: "POINTER_UP" });
					}
				});
			}
		},
		actions: {
			setSize(e) {
				let { context: t, event: n, prop: r, scope: i } = e, a = n.size, o = t.get("size"), s = t.get("panels"), c = VT({
					size: ET({
						sizes: a,
						panels: r("panels"),
						rootEl: rT(i),
						orientation: r("orientation")
					}),
					panels: s
				});
				Ot(o, c) || UT(e, c);
			},
			resetSize(e) {
				let { refs: t, context: n, prop: r, scope: i } = e;
				UT(e, t.get("initialSize") ?? VT({
					size: ET({
						sizes: r("size") ?? r("defaultSize"),
						panels: r("panels"),
						rootEl: rT(i),
						orientation: r("orientation")
					}),
					panels: n.get("panels")
				}));
			},
			syncSize(e) {
				let { context: t, scope: n, prop: r, refs: i } = e, a = rT(n);
				if (!a) return;
				let o = r("orientation"), s = ST(a, o);
				if (s <= 0) return;
				let c = DT(r("panels"), a, r("orientation"));
				t.set("panels", c);
				let l = r("size") ?? r("defaultSize"), u = `${NT(r("panels"))}:${JSON.stringify(r("size") ?? [])}:${JSON.stringify(r("defaultSize") ?? [])}`, d = i.get("prevGroupSize"), f = t.get("size"), p = ET({
					sizes: l,
					panels: r("panels"),
					rootEl: a,
					orientation: o
				}), m = VT({
					size: d != null && d !== s && f.length === c.length ? RT({
						panels: c,
						prevLayout: f,
						prevGroupSize: d,
						nextGroupSize: s
					}) : p,
					panels: c
				});
				i.get("prevInitialLayout") !== u && (i.set("initialSize", m), i.set("prevInitialLayout", u));
				let h = t.get("size");
				Ot(h, m) || (i.set("suppressOnResize", r("size") != null || h.length === 0), t.set("size", m), i.set("suppressOnResize", !1)), i.set("prevGroupSize", s);
			},
			setDraggingState({ context: e, event: t, prop: n, scope: r }) {
				let i = n("orientation"), a = e.get("size"), o = t.id, s = cT(r, o);
				if (!s || !rT(r)) return;
				let c = iT(r, o);
				gt(c, () => `Drag handle element not found for id "${o}"`);
				let l = i === "horizontal" ? t.point.x : t.point.y;
				e.set("dragState", {
					resizeTriggerId: t.id,
					resolvedResizeTriggerId: s,
					resizeTriggerRect: c.getBoundingClientRect(),
					initialCursorPosition: l,
					initialSize: a
				});
			},
			clearDraggingState({ context: e }) {
				e.set("dragState", null);
			},
			setKeyboardState({ context: e, event: t, scope: n }) {
				let r = t.id ?? e.get("dragState")?.resizeTriggerId;
				r != null && e.set("keyboardState", {
					resizeTriggerId: r,
					resolvedResizeTriggerId: cT(n, r)
				});
			},
			clearKeyboardState({ context: e }) {
				e.set("keyboardState", null);
			},
			collapsePanel(e) {
				let { context: t, event: n, refs: r } = e, i = t.get("size"), a = t.get("panels"), o = a.find((e) => e.id === n.id);
				if (gt(o, () => `Panel data not found for id "${n.id}"`), o.collapsible) {
					let { collapsedSize: t = 0, panelSize: n, pivotIndices: s } = jT(a, o, i);
					if (gt(n != null, () => `Panel size not found for panel "${o.id}"`), !_T(n, t)) {
						r.get("panelSizeBeforeCollapse").set(o.id, n);
						let c = BT({
							delta: kT(a, o) === a.length - 1 ? n - t : t - n,
							initialSize: i,
							panels: a,
							pivotIndices: s,
							prevSize: i,
							trigger: "imperative-api"
						});
						Ot(i, c) || UT(e, c);
					}
				}
			},
			expandPanel(e) {
				let { context: t, event: n, refs: r } = e, i = t.get("panels"), a = t.get("size"), o = i.find((e) => e.id === n.id);
				if (gt(o, () => `Panel data not found for id "${n.id}"`), o.collapsible) {
					let { collapsedSize: t = 0, panelSize: s = 0, minSize: c = 0, pivotIndices: l } = jT(i, o, a), u = n.minSize ?? c;
					if (_T(s, t)) {
						let t = r.get("panelSizeBeforeCollapse").get(o.id), n = t != null && t >= u ? t : u, c = BT({
							delta: kT(i, o) === i.length - 1 ? s - n : n - s,
							initialSize: a,
							panels: i,
							pivotIndices: l,
							prevSize: a,
							trigger: "imperative-api"
						});
						Ot(a, c) || UT(e, c);
					}
				}
			},
			resizePanel(e) {
				let { context: t, event: n } = e, r = t.get("size"), i = t.get("panels"), a = OT(i, n.id), o = n.size, { panelSize: s, pivotIndices: c } = jT(i, a, r);
				gt(s != null, () => `Panel size not found for panel "${a.id}"`);
				let l = BT({
					delta: kT(i, a) === i.length - 1 ? s - o : o - s,
					initialSize: r,
					panels: i,
					pivotIndices: c,
					prevSize: r,
					trigger: "imperative-api"
				});
				Ot(r, l) || UT(e, l);
			},
			setPointerValue(e) {
				let { context: t, event: n, prop: r, scope: i } = e, a = t.get("dragState");
				if (!a) return;
				let { resolvedResizeTriggerId: o, initialSize: s, initialCursorPosition: c } = a, l = t.get("panels"), u = rT(i);
				gt(u, () => "Panel group element not found");
				let d = o.split(":").map((e) => l.findIndex((t) => t.id === e)), f = r("orientation") === "horizontal", p = f ? n.point.x : n.point.y, m = u.getBoundingClientRect(), h = f ? m.width : m.height, g = (p - c) / h * 100, _ = t.get("size"), v = BT({
					delta: g,
					initialSize: s ?? _,
					panels: l,
					pivotIndices: d,
					prevSize: _,
					trigger: "mouse-or-touch"
				});
				Ot(_, v) || UT(e, v);
			},
			setKeyboardValue(e) {
				let { context: t, event: n } = e, r = t.get("panels"), i = cT(e.scope, n.id);
				if (!i) return;
				let a = n.delta, o = i.split(":").map((e) => r.findIndex((t) => t.id === e)), s = t.get("size"), c = BT({
					delta: a,
					initialSize: s,
					panels: r,
					pivotIndices: o,
					prevSize: s,
					trigger: "keyboard"
				});
				Ot(s, c) || UT(e, c);
			},
			invokeOnResizeEnd({ context: e, prop: t, refs: n }) {
				queueMicrotask(() => {
					let r = e.get("dragState");
					t("onResizeEnd")?.({
						size: n.get("lastRequestedSize") ?? e.get("size"),
						resizeTriggerId: r?.resizeTriggerId ?? null
					});
				});
			},
			invokeOnResizeStart({ prop: e }) {
				queueMicrotask(() => {
					e("onResizeStart")?.();
				});
			},
			collapseOrExpandPanel(e) {
				let { context: t, refs: n } = e, r = t.get("panels"), i = t.get("size"), [a, o] = (t.get("keyboardState")?.resolvedResizeTriggerId)?.split(":") ?? [], s = r.findIndex((e) => e.id === a);
				if (s === -1) return;
				let c = r[s];
				gt(c, () => `No panel data found for index ${s}`);
				let l = i[s], { collapsedSize: u = 0, collapsible: d, minSize: f = 0 } = c;
				if (l != null && d) {
					let t = [a, o].map((e) => r.findIndex((t) => t.id === e)), s = BT({
						delta: _T(l, u) ? f - u : u - l,
						initialSize: n.get("initialSize") ?? i,
						panels: r,
						pivotIndices: t,
						prevSize: i,
						trigger: "keyboard"
					});
					Ot(i, s) || UT(e, s);
				}
			},
			setGlobalCursor(e) {
				let { context: t, scope: n, prop: r } = e;
				if (r("registry")) return;
				let i = t.get("dragState");
				if (!i) return;
				let a = t.get("panels"), o = r("orientation") === "horizontal", [s] = i.resolvedResizeTriggerId.split(":"), c = a[a.findIndex((e) => e.id === s)], l = hT(t.get("size"), a, i.resolvedResizeTriggerId);
				fT(n, {
					isAtMin: _T(l.valueNow, l.valueMin) || _T(l.valueNow, c.collapsedSize),
					isAtMax: _T(l.valueNow, l.valueMax)
				}, o, r("nonce"));
			},
			clearGlobalCursor({ scope: e }) {
				pT(e);
			},
			focusNextResizeTrigger({ event: e, scope: t }) {
				let n = uT(t), r = n.findIndex((t) => t.dataset.id === e.id);
				(e.shiftKey ? Pt(n, r) : _n(n, r))?.focus();
			}
		}
	}
});
function UT(e, t) {
	let { refs: n, prop: r, context: i } = e, a = i.get("panels"), o = r("onCollapse"), s = r("onExpand"), c = r("onResize"), l = r("onResizeStart"), u = r("onResizeEnd"), d = n.get("panelIdToLastNotifiedSizeMap"), f = i.get("dragState"), p = i.get("keyboardState"), m = f === null && p === null;
	if (n.set("lastRequestedSize", t), m && l && queueMicrotask(() => {
		l();
	}), r("size") == null) i.set("size", t);
	else if (c) {
		let e = n.get("panelSizeBeforeCollapse"), i = Object.fromEntries(e.entries()), a = f?.resizeTriggerId ?? null;
		c({
			size: t,
			layout: NT(r("panels")),
			resizeTriggerId: a,
			expandToSizes: i
		});
	}
	t.forEach((e, t) => {
		let n = a[t];
		gt(n, () => `Panel data not found for index ${t}`);
		let { collapsedSize: r = 0, collapsible: i, id: c } = n, l = d.get(c);
		(l == null || e !== l) && (d.set(c, e), i && l != null && (o || s) && (_T(l, r) && !_T(e, r) && s?.({
			panelId: c,
			size: e
		}), !_T(l, r) && _T(e, r) && o?.({
			panelId: c,
			size: e
		})));
	}), m && u && queueMicrotask(() => {
		u({
			size: t,
			resizeTriggerId: null
		});
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/splitter/use-splitter-context.js
var [WT, GT] = Rt({
	name: "SplitterContext",
	hookName: "useSplitterContext",
	providerName: "<SplitterProvider />"
}), KT = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function qT(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, KT), i = _(() => yn()(r, ["id"])), a = _(() => C(z(i), 2)), o = _(() => z(a)[0]), s = _(() => z(a)[1]), c = GT(), l = _(() => X(c().getPanelProps(z(o)), z(s)));
	return Q(e, Y({ as: "div" }, () => z(l), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(qT, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/splitter/use-splitter-resize-trigger-props-context.js
var [JT, YT] = Rt({
	name: "SplitterResizeTriggerPropsContext",
	hookName: "useSplitterResizeTriggerPropsContext",
	providerName: "<SplitterResizeTriggerPropsProvider />"
}), XT = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function ZT(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, XT), i = _(() => yn()(r, ["disabled", "id"])), a = _(() => C(z(i), 2)), o = _(() => z(a)[0]), s = _(() => z(a)[1]), c = GT(), l = _(() => X(c().getResizeTriggerProps(z(o)), z(s)));
	return JT(() => z(o)), Q(e, Y({ as: "button" }, () => z(l), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(ZT, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/splitter/splitter-split-props.svelte.js
function QT(e) {
	return yn()(e, [
		"defaultSize",
		"id",
		"ids",
		"keyboardResizeBy",
		"nonce",
		"onCollapse",
		"onExpand",
		"onResize",
		"onResizeEnd",
		"onResizeStart",
		"orientation",
		"panels",
		"registry",
		"size"
	]);
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/splitter/use-splitter.svelte.js
var $T = (e) => {
	let t = Nt(), n = gn(), r = _(() => {
		let r = St(e);
		return Re(r, ["id"]), {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = Tn(HT, () => z(r)), a = _(() => LT(i, Wt));
	return () => z(a);
}, eE = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"size"
]);
function tE(e, t) {
	let n = m();
	O(t, !0);
	let r = R(t, "ref", 15, null), i = R(t, "size", 15), a = q(t, eE), o = _(() => QT(a)), s = _(() => C(z(o), 2)), c = _(() => z(s)[0]), l = _(() => z(s)[1]), u = _(() => ({
		...z(c),
		id: z(c).id ?? n,
		size: i(),
		onResize: (e) => {
			z(c).onResize?.(e), i(e.size);
		}
	})), d = $T(() => z(u)), f = _(() => X(d().getRootProps(), z(l)));
	return WT(d), Q(e, Y({ as: "div" }, () => z(f), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), y({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), M();
		},
		get size() {
			return i();
		},
		set size(e) {
			i(e), M();
		}
	});
}
U(tE, {
	ref: {},
	size: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/Splitter.svelte
var nE = Symbol("af-splitter size set"), rE = L("<!> <!> <!>", 1), iE = L("<!> <!>", 1), aE = {
	hash: "svelte-125g2ht",
	code: ":host {display:flex;min-height:0;}[data-scope='splitter'][data-part='root'] {flex:1 1 auto;min-width:0;min-height:0;}[data-scope='splitter'][data-part='panel'] {min-width:0;min-height:0;overflow:hidden;}[data-scope='splitter'][data-part='resize-trigger'] {box-sizing:border-box;width:4px;margin:0;padding:0;border:0;border-radius:0;outline:none;appearance:none;background-color:var(--k-line);transition:background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);}[data-scope='splitter'][data-part='resize-trigger'][data-orientation='vertical'] {width:auto;height:4px;}[data-scope='splitter'][data-part='resize-trigger']:hover, [data-scope='splitter'][data-part='resize-trigger'][data-dragging] {background-color:color-mix(in oklab, var(--k-primary) 40%, transparent);}[data-scope='splitter'][data-part='resize-trigger']:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[data-scope='splitter'][data-part='resize-trigger']:focus-visible, [data-scope='splitter'][data-part='resize-trigger'][data-dragging] {position:relative;z-index:1;}\n  @media (prefers-reduced-motion: reduce) {[data-scope='splitter'][data-part='resize-trigger'] {transition:none;} }\n  @media (forced-colors: active) {[data-scope='splitter'][data-part='resize-trigger'] {forced-color-adjust:none;background-color:CanvasText;}[data-scope='splitter'][data-part='resize-trigger']:hover, [data-scope='splitter'][data-part='resize-trigger'][data-dragging] {background-color:Highlight;}[data-scope='splitter'][data-part='resize-trigger']:focus-visible {outline:2px solid CanvasText;outline-offset:2px;}\n  }"
};
function oE(e, r) {
	O(r, !0), ee(e, aE);
	let i = R(r, "size", 7, 50), a = R(r, "min", 7, 20), o = R(r, "max", 7, 80), s = R(r, "orientation", 7, "horizontal"), l = R(r, "label", 7, null), u = R(r, "locale", 7, null), d = R(r, "strings", 7, null), f = r.$$host, p = _(() => c(u(), d() ?? void 0)), m = (e, t) => {
		let n = typeof e == "string" && e.trim() !== "" ? Number(e) : e;
		return typeof n == "number" && Number.isFinite(n) ? n : t;
	}, h = _(() => Math.min(100, Math.max(0, m(a(), 20)))), g = _(() => Math.min(100, Math.max(z(h), m(o(), 80)))), v = _(() => m(i(), 50)), b = (e) => Math.min(z(g), Math.max(z(h), e)), x = _(() => s() === "vertical"), S = _(() => [{
		id: "start",
		minSize: z(h),
		maxSize: z(g)
	}, { id: "end" }]), C = B(pe([50, 50])), w = 50, T = B(0);
	f[nE] = () => {
		J(T, Se(() => z(T)) + 1);
	};
	function te(e) {
		J(C, [e, 100 - e], !0), w = e;
	}
	V(() => {
		let e = z(v);
		z(T), Se(() => te(b(e)));
	}), V(() => {
		z(h), z(g), Se(() => te(b(z(C)[0])));
	});
	function ne() {
		let e = z(C)[0];
		Math.abs(e - w) < 1e-9 || (w = e, n(f, "size-change", { size: Math.round(e * 100) / 100 }));
	}
	var re = {
		get size() {
			return i();
		},
		set size(e = 50) {
			i(e), M();
		},
		get min() {
			return a();
		},
		set min(e = 20) {
			a(e), M();
		},
		get max() {
			return o();
		},
		set max(e = 80) {
			o(e), M();
		},
		get orientation() {
			return s();
		},
		set orientation(e = "horizontal") {
			s(e), M();
		},
		get label() {
			return l();
		},
		set label(e = null) {
			l(e), M();
		},
		get locale() {
			return u();
		},
		set locale(e = null) {
			u(e), M();
		},
		get strings() {
			return d();
		},
		set strings(e = null) {
			d(e), M();
		}
	}, D = iE(), ie = K(D);
	t(ie, {});
	var k = W(ie, 2);
	return Yt(k, {
		value: () => f.shadowRoot,
		children: (e, t) => {
			var n = F(), i = K(n), a = () => z(C), o = (e) => {
				e && J(C, e, !0);
			};
			{
				let e = _(() => z(x) ? "vertical" : "horizontal");
				E(i, () => tE, (t, n) => {
					n(t, {
						get orientation() {
							return z(e);
						},
						get panels() {
							return z(S);
						},
						keyboardResizeBy: 5,
						get size() {
							return a();
						},
						set size(e) {
							o(e);
						},
						onResizeEnd: ne,
						children: (e, t) => {
							var n = rE(), i = K(n);
							E(i, () => qT, (e, t) => {
								t(e, {
									id: "start",
									part: "start",
									children: (e, t) => {
										var n = F(), i = K(n);
										oe(i, r, "start", {}, null), I(e, n);
									},
									$$slots: { default: !0 }
								});
							});
							var a = W(i, 2);
							{
								let e = _(() => l() || z(p).resizeHandle);
								E(a, () => ZT, (t, n) => {
									n(t, {
										id: "start:end",
										part: "handle",
										class: "af-kit",
										type: "button",
										get "aria-label"() {
											return z(e);
										}
									});
								});
							}
							var o = W(a, 2);
							E(o, () => qT, (e, t) => {
								t(e, {
									id: "end",
									part: "end",
									children: (e, t) => {
										var n = F(), i = K(n);
										oe(i, r, "end", {}, null), I(e, n);
									},
									$$slots: { default: !0 }
								});
							}), I(e, n);
						},
						$$slots: { default: !0 }
					});
				});
			}
			I(e, n);
		},
		$$slots: { default: !0 }
	}), I(e, D), y(re);
}
U(oE, {
	size: {
		attribute: "size",
		type: "Number"
	},
	min: {
		attribute: "min",
		type: "Number"
	},
	max: {
		attribute: "max",
		type: "Number"
	},
	orientation: {
		attribute: "orientation",
		type: "String"
	},
	label: {
		attribute: "label",
		type: "String"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, ["start", "end"], [], { mode: "open" }, (e) => class extends e {
	get size() {
		return super.size;
	}
	set size(e) {
		super.size = e, this[nE]?.();
	}
	attributeChangedCallback(e, t, n) {
		super.attributeChangedCallback(e, t, n), e === "size" && this[nE]?.();
	}
});
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tabs/use-tabs-context.js
var [sE, cE] = Rt({
	name: "TabsContext",
	hookName: "useTabsContext",
	providerName: "<TabsProvider />"
}), lE = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function uE(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, lE), i = _(() => yn()(r, ["value"])), a = _(() => C(z(i), 2)), o = _(() => z(a)[0]), s = _(() => z(a)[1]), c = cE(), l = Ya(), u = _(() => ({
		...l(),
		present: c().value === z(o).value,
		immediate: !0
	})), d = to(() => z(u)), f = _(() => X(c().getContentProps(z(o)), z(s)));
	ro(d);
	function p(e) {
		d().setNode(e);
	}
	var m = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	}, h = F(), g = K(h), v = (e) => {
		Q(e, Y({ as: "div" }, () => z(f), {
			[ce()]: p,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, ee = _(() => !d().unmounted);
	return P(g, (e) => {
		z(ee) && e(v);
	}), I(e, h), y(m);
}
U(uE, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tabs/tabs-list.svelte
var dE = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function fE(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, dE), i = cE(), a = _(() => X(i().getListProps(), r));
	return Q(e, Y({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(fE, { ref: {} }, [], [], { mode: "open" });
var pE = ln("tabs").parts("root", "list", "trigger", "content", "indicator").build(), mE = (e) => e.ids?.root ?? `tabs:${e.id}`, hE = (e) => e.ids?.list ?? `tabs:${e.id}:list`, gE = (e, t) => e.ids?.content?.(t) ?? `tabs:${e.id}:content-${t}`, _E = (e, t) => e.ids?.trigger?.(t) ?? `tabs:${e.id}:trigger-${t}`, vE = (e) => e.ids?.indicator ?? `tabs:${e.id}:indicator`, yE = (e) => e.getById(hE(e)), bE = (e, t) => e.getById(gE(e, t)), xE = (e, t) => t == null ? null : e.getById(_E(e, t)), SE = (e) => e.getById(vE(e)), CE = (e) => {
	let t = `[role=tab]${qt(hE(e))}:not([disabled])`;
	return ht(yE(e), t);
}, wE = (e) => Ht(CE(e)), TE = (e) => sn(CE(e)), EE = (e, t) => Nn(CE(e), _E(e, t.value), t.loopFocus), DE = (e, t) => It(CE(e), _E(e, t.value), t.loopFocus), OE = (e) => ({
	x: e?.offsetLeft ?? 0,
	y: e?.offsetTop ?? 0,
	width: e?.offsetWidth ?? 0,
	height: e?.offsetHeight ?? 0
}), kE = (e, t) => OE(Dn(CE(e), _E(e, t)));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tabs@1.43.3/node_modules/@zag-js/tabs/dist/tabs.connect.mjs
function AE(e, t) {
	let { state: n, send: r, context: i, prop: a, scope: o } = e, s = a("translations"), c = n.matches("focused"), l = a("orientation") === "vertical", u = a("orientation") === "horizontal", d = a("composite");
	function f(e) {
		return {
			selected: i.get("value") === e.value,
			focused: i.get("focusedValue") === e.value,
			disabled: !!e.disabled
		};
	}
	return {
		value: i.get("value"),
		focusedValue: i.get("focusedValue"),
		setValue(e) {
			r({
				type: "SET_VALUE",
				value: e
			});
		},
		clearValue() {
			r({ type: "CLEAR_VALUE" });
		},
		setIndicatorRect(e) {
			let t = _E(o, e);
			r({
				type: "SET_INDICATOR_RECT",
				id: t
			});
		},
		syncTabIndex() {
			r({ type: "SYNC_TAB_INDEX" });
		},
		selectNext(e) {
			r({
				type: "TAB_FOCUS",
				value: e,
				src: "selectNext"
			}), r({
				type: "ARROW_NEXT",
				src: "selectNext"
			});
		},
		selectPrev(e) {
			r({
				type: "TAB_FOCUS",
				value: e,
				src: "selectPrev"
			}), r({
				type: "ARROW_PREV",
				src: "selectPrev"
			});
		},
		focus() {
			let e = i.get("value");
			e && xE(o, e)?.focus();
		},
		getRootProps() {
			return t.element({
				...pE.root.attrs,
				id: mE(o),
				"data-orientation": a("orientation"),
				"data-focus": Z(c),
				dir: a("dir")
			});
		},
		getListProps() {
			return t.element({
				...pE.list.attrs,
				id: hE(o),
				role: "tablist",
				dir: a("dir"),
				"data-focus": Z(c),
				"aria-orientation": a("orientation"),
				"data-orientation": a("orientation"),
				"aria-label": s?.listLabel,
				onKeyDown(e) {
					if (e.defaultPrevented || Ye(e) || !kt(e.currentTarget, lt(e))) return;
					let t = {
						ArrowDown() {
							u || r({
								type: "ARROW_NEXT",
								key: "ArrowDown"
							});
						},
						ArrowUp() {
							u || r({
								type: "ARROW_PREV",
								key: "ArrowUp"
							});
						},
						ArrowLeft() {
							l || r({
								type: "ARROW_PREV",
								key: "ArrowLeft"
							});
						},
						ArrowRight() {
							l || r({
								type: "ARROW_NEXT",
								key: "ArrowRight"
							});
						},
						Home() {
							r({ type: "HOME" });
						},
						End() {
							r({ type: "END" });
						}
					}[Qt(e, {
						dir: a("dir"),
						orientation: a("orientation")
					})];
					if (t) {
						e.preventDefault(), t(e);
						return;
					}
				}
			});
		},
		getTriggerState: f,
		getTriggerProps(e) {
			let { value: n, disabled: s } = e, c = f(e);
			return t.button({
				...pE.trigger.attrs,
				role: "tab",
				type: "button",
				disabled: s,
				dir: a("dir"),
				"data-orientation": a("orientation"),
				"data-disabled": Z(s),
				"aria-disabled": s,
				"data-value": n,
				"aria-selected": c.selected,
				"data-selected": Z(c.selected),
				"data-focus": Z(c.focused),
				"aria-controls": c.selected ? gE(o, n) : void 0,
				"data-ownedby": hE(o),
				"data-ssr": Z(i.get("ssr")),
				id: _E(o, n),
				tabIndex: c.selected && d ? 0 : -1,
				onFocus() {
					r({
						type: "TAB_FOCUS",
						value: n
					});
				},
				onBlur(e) {
					e.relatedTarget?.getAttribute("role") !== "tab" && r({ type: "TAB_BLUR" });
				},
				onClick(e) {
					e.defaultPrevented || xt(e) || s || (Ze() && e.currentTarget.focus(), r({
						type: "TAB_CLICK",
						value: n
					}));
				}
			});
		},
		getContentProps(e) {
			let { value: n } = e, r = i.get("value") === n;
			return t.element({
				...pE.content.attrs,
				dir: a("dir"),
				id: gE(o, n),
				tabIndex: d ? 0 : -1,
				"aria-labelledby": _E(o, n),
				role: "tabpanel",
				"data-ownedby": hE(o),
				"data-selected": Z(r),
				"data-orientation": a("orientation"),
				hidden: !r
			});
		},
		getIndicatorProps() {
			let e = i.get("indicatorRect"), n = i.get("animateIndicator");
			return t.element({
				id: vE(o),
				...pE.indicator.attrs,
				dir: a("dir"),
				"data-orientation": a("orientation"),
				hidden: jE(e),
				onTransitionEnd(e) {
					lt(e) === e.currentTarget && r({ type: "INDICATOR_TRANSITION_END" });
				},
				style: {
					"--transition-property": "left, right, top, bottom, width, height",
					"--left": ut(e?.x),
					"--top": ut(e?.y),
					"--width": ut(e?.width),
					"--height": ut(e?.height),
					position: "absolute",
					willChange: n ? "var(--transition-property)" : "auto",
					transitionProperty: n ? "var(--transition-property)" : "none",
					transitionDuration: n ? "var(--transition-duration, 150ms)" : "0ms",
					transitionTimingFunction: "var(--transition-timing-function)",
					[u ? "left" : "top"]: u ? "var(--left)" : "var(--top)"
				}
			});
		}
	};
}
var jE = (e) => e == null || e.width === 0 && e.height === 0 && e.x === 0 && e.y === 0, { createMachine: ME } = Lt(), NE = ME({
	props({ props: e }) {
		return {
			dir: "ltr",
			orientation: "horizontal",
			activationMode: "automatic",
			loopFocus: !0,
			composite: !0,
			navigate(e) {
				ya(e.node);
			},
			defaultValue: null,
			...e
		};
	},
	initialState() {
		return "idle";
	},
	context({ prop: e, bindable: t }) {
		return {
			value: t(() => ({
				defaultValue: e("defaultValue"),
				value: e("value"),
				onChange(t) {
					e("onValueChange")?.({ value: t });
				}
			})),
			focusedValue: t(() => ({
				defaultValue: e("value") || e("defaultValue"),
				sync: !0,
				onChange(t) {
					e("onFocusChange")?.({ focusedValue: t });
				}
			})),
			ssr: t(() => ({ defaultValue: !0 })),
			indicatorRect: t(() => ({ defaultValue: null })),
			animateIndicator: t(() => ({ defaultValue: !1 }))
		};
	},
	refs() {
		return {
			indicatorCleanup: null,
			prevValue: null
		};
	},
	watch({ context: e, prop: t, track: n, action: r }) {
		n([() => e.get("value")], () => {
			r([
				"syncIndicatorAnimation",
				"syncIndicatorRect",
				"syncTabIndex",
				"navigateIfNeeded"
			]);
		}), n([() => t("dir"), () => t("orientation")], () => {
			r(["syncIndicatorRect"]);
		});
	},
	on: {
		SET_VALUE: { actions: ["setValue"] },
		CLEAR_VALUE: { actions: ["clearValue"] },
		SET_INDICATOR_RECT: { actions: ["setIndicatorRect"] },
		SYNC_TAB_INDEX: { actions: ["syncTabIndex"] },
		INDICATOR_TRANSITION_END: { actions: ["clearIndicatorAnimation"] }
	},
	entry: [
		"syncPrevValue",
		"syncIndicatorRect",
		"syncTabIndex",
		"syncSsr"
	],
	exit: ["cleanupObserver"],
	states: {
		idle: { on: {
			TAB_FOCUS: {
				target: "focused",
				actions: ["setFocusedValue"]
			},
			TAB_CLICK: {
				target: "focused",
				actions: ["setFocusedValue", "setValue"]
			}
		} },
		focused: { on: {
			TAB_CLICK: { actions: ["setFocusedValue", "setValue"] },
			ARROW_PREV: [{
				guard: "selectOnFocus",
				actions: ["focusPrevTab", "selectFocusedTab"]
			}, { actions: ["focusPrevTab"] }],
			ARROW_NEXT: [{
				guard: "selectOnFocus",
				actions: ["focusNextTab", "selectFocusedTab"]
			}, { actions: ["focusNextTab"] }],
			HOME: [{
				guard: "selectOnFocus",
				actions: ["focusFirstTab", "selectFocusedTab"]
			}, { actions: ["focusFirstTab"] }],
			END: [{
				guard: "selectOnFocus",
				actions: ["focusLastTab", "selectFocusedTab"]
			}, { actions: ["focusLastTab"] }],
			TAB_FOCUS: { actions: ["setFocusedValue"] },
			TAB_BLUR: {
				target: "idle",
				actions: ["clearFocusedValue"]
			}
		} }
	},
	implementations: {
		guards: { selectOnFocus: ({ prop: e }) => e("activationMode") === "automatic" },
		actions: {
			selectFocusedTab({ context: e, prop: t }) {
				en(() => {
					let n = e.get("focusedValue");
					if (!n) return;
					let r = t("deselectable") && e.get("value") === n ? null : n;
					e.set("value", r);
				});
			},
			setFocusedValue({ context: e, event: t, flush: n }) {
				t.value != null && n(() => {
					e.set("focusedValue", t.value);
				});
			},
			clearFocusedValue({ context: e }) {
				e.set("focusedValue", null);
			},
			setValue({ context: e, event: t, prop: n }) {
				let r = n("deselectable") && e.get("value") === e.get("focusedValue");
				e.set("value", r ? null : t.value);
			},
			clearValue({ context: e }) {
				e.set("value", null);
			},
			focusFirstTab({ scope: e }) {
				en(() => {
					wE(e)?.focus();
				});
			},
			focusLastTab({ scope: e }) {
				en(() => {
					TE(e)?.focus();
				});
			},
			focusNextTab({ context: e, prop: t, scope: n, event: r }) {
				let i = r.value ?? e.get("focusedValue");
				if (!i) return;
				let a = EE(n, {
					value: i,
					loopFocus: t("loopFocus")
				});
				en(() => {
					t("composite") ? a?.focus() : a?.dataset.value != null && e.set("focusedValue", a.dataset.value);
				});
			},
			focusPrevTab({ context: e, prop: t, scope: n, event: r }) {
				let i = r.value ?? e.get("focusedValue");
				if (!i) return;
				let a = DE(n, {
					value: i,
					loopFocus: t("loopFocus")
				});
				en(() => {
					t("composite") ? a?.focus() : a?.dataset.value != null && e.set("focusedValue", a.dataset.value);
				});
			},
			syncTabIndex({ context: e, scope: t }) {
				en(() => {
					let n = e.get("value");
					if (!n) return;
					let r = bE(t, n);
					r && (sa(r).length > 0 ? r.removeAttribute("tabindex") : r.setAttribute("tabindex", "0"));
				});
			},
			cleanupObserver({ refs: e }) {
				let t = e.get("indicatorCleanup");
				t && t();
			},
			setIndicatorRect({ context: e, event: t, scope: n }) {
				let r = t.id ?? e.get("value");
				SE(n) && r && xE(n, r) && e.set("indicatorRect", kE(n, r));
			},
			syncSsr({ context: e }) {
				e.set("ssr", !1);
			},
			syncPrevValue({ context: e, refs: t }) {
				t.set("prevValue", e.get("value"));
			},
			syncIndicatorAnimation({ context: e, refs: t }) {
				let n = t.get("prevValue"), r = e.get("value"), i = n != null && r != null && n !== r;
				e.set("animateIndicator", i), t.set("prevValue", r);
			},
			clearIndicatorAnimation({ context: e }) {
				e.set("animateIndicator", !1);
			},
			syncIndicatorRect({ context: e, refs: t, scope: n }) {
				let r = t.get("indicatorCleanup");
				if (r && r(), !SE(n)) return;
				let i = () => {
					let t = xE(n, e.get("value"));
					if (!t) return;
					let r = OE(t);
					e.set("indicatorRect", (e) => Ot(e, r) ? e : r);
				};
				i();
				let a = CE(n), o = yE(n), s = Xe(...a.map((e) => Ma.observe(e, i)), ...o ? [Ma.observe(o, i)] : []);
				t.set("indicatorCleanup", s);
			},
			navigateIfNeeded({ context: e, prop: t, scope: n }) {
				let r = e.get("value");
				if (!r) return;
				let i = xE(n, r);
				Zt(i) && t("navigate")?.({
					value: r,
					node: i,
					href: i.href
				});
			}
		}
	}
}), PE = (e) => {
	let t = Nt(), n = gn(), r = _(() => ({
		...St(e),
		dir: n().dir,
		getRootNode: t().getRootNode
	})), i = Tn(NE, () => z(r)), a = _(() => AE(i, Wt));
	return () => z(a);
}, FE = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"value"
]);
function IE(e, t) {
	let n = m();
	O(t, !0);
	let r = R(t, "ref", 15, null), i = R(t, "value", 15), a = q(t, FE), o = _(() => Za(a)), s = _(() => C(z(o), 2)), c = _(() => z(s)[0]), l = _(() => z(s)[1]), u = _(() => {
		let e = {
			...z(l),
			value: i()
		};
		return yn()(e, [
			"value",
			"onValueChange",
			"onFocusChange",
			"orientation",
			"activationMode",
			"id",
			"ids",
			"loopFocus",
			"translations",
			"defaultValue",
			"composite",
			"deselectable",
			"navigate"
		]);
	}), d = _(() => C(z(u), 2)), f = _(() => z(d)[0]), p = _(() => z(d)[1]), h = _(() => ({
		...z(f),
		id: z(f).id ?? n,
		value: i(),
		onValueChange(e) {
			z(f).onValueChange?.(e), i() !== void 0 && i(e.value);
		}
	})), g = PE(() => z(h)), v = _(() => X(g().getRootProps(), z(p)));
	return sE(g), Ja(() => z(c)), Q(e, Y({ as: "div" }, () => z(v), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), y({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), M();
		},
		get value() {
			return i();
		},
		set value(e) {
			i(e), M();
		}
	});
}
U(IE, {
	ref: {},
	value: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tabs/tabs-trigger.svelte
var LE = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function RE(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, LE), i = _(() => yn()(r, ["value", "disabled"])), a = _(() => C(z(i), 2)), o = _(() => z(a)[0]), s = _(() => z(a)[1]), c = cE(), l = _(() => X(c().getTriggerProps(z(o)), z(s)));
	return Q(e, Y({ as: "button" }, () => z(l), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(RE, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Tabs.svelte
var zE = L("<af-tooltip><!></af-tooltip>", 2), BE = L("<!> <!>", 1), VE = {
	hash: "svelte-j0chmq",
	code: ":host {display:block;}[data-scope='tabs'][data-part='root'] {display:flex;flex-direction:column;gap:8px;}[data-scope='tabs'][data-part='content'] {flex:1;outline:none;}[data-scope='tabs'][data-part='list'] {border:0 solid var(--k-line);}.af-tabs > af-tooltip {display:flex;flex:1 1 0%;align-self:stretch;}.af-tabs > af-tooltip::part(anchor) {display:flex;flex:1 1 0%;align-items:center;}.af-tabs.segmented > af-tooltip {flex:0 1 auto;}.af-tabs [role='tab'][aria-disabled='true']:disabled {cursor:default;}"
};
function HE(e, r) {
	O(r, !0), ee(e, VE);
	let i = R(r, "items", 23, () => []), a = R(r, "value", 7, null), o = R(r, "label", 7, null), s = R(r, "variant", 7, "pill"), c = r.$$host, l = _(() => s() === "line" || s() === "segmented" ? s() : "pill"), u = _(() => {
		let e = (i() ?? []).filter((e) => !e.disabled);
		return e.some((e) => e.value === a()) ? null : e[0]?.value ?? null;
	}), d = (e) => z(u) === null ? void 0 : e.value === z(u) ? 0 : -1, f = (e) => e ? { "aria-description": e } : {};
	var p = {
		get items() {
			return i();
		},
		set items(e = []) {
			i(e), M();
		},
		get value() {
			return a();
		},
		set value(e = null) {
			a(e), M();
		},
		get label() {
			return o();
		},
		set label(e = null) {
			o(e), M();
		},
		get variant() {
			return s();
		},
		set variant(e = "pill") {
			s(e), M();
		}
	}, m = BE(), b = K(m);
	t(b, {});
	var x = W(b, 2);
	return Yt(x, {
		value: () => c.shadowRoot,
		children: (e, t) => {
			var r = F(), s = K(r), u = () => a() ?? null;
			E(s, () => IE, (e, t) => {
				t(e, {
					get value() {
						return u();
					},
					set value(e) {},
					activationMode: "automatic",
					loopFocus: !0,
					onValueChange: (e) => {
						e.value != null && n(c, "tab-change", { value: e.value });
					},
					children: (e, t) => {
						var n = BE(), r = K(n);
						{
							let e = _(() => o() || void 0);
							E(r, () => fE, (t, n) => {
								n(t, {
									part: "list",
									get class() {
										return `af-kit af-tabs ${z(l) ?? ""}`;
									},
									get "aria-label"() {
										return z(e);
									},
									children: (e, t) => {
										var n = F(), r = K(n);
										h(r, 17, () => i() ?? [], (e) => e.value, (e, t) => {
											var n = F(), r = K(n), i = (e) => {
												var n = zE();
												G(() => v(n, "text", z(t).reason));
												var r = H(n);
												{
													let e = _(() => d(z(t))), n = _(() => f(z(t).reason));
													E(r, () => RE, (r, i) => {
														i(r, Y({
															get value() {
																return z(t).value;
															},
															disabled: !0,
															part: "tab",
															get tabindex() {
																return z(e);
															}
														}, () => z(n), {
															children: (e, n) => {
																ne();
																var r = fe();
																G(() => w(r, z(t).label)), I(e, r);
															},
															$$slots: { default: !0 }
														}));
													});
												}
												D(n), I(e, n);
											}, a = (e) => {
												var n = F(), r = K(n);
												{
													let e = _(() => !!z(t).disabled), n = _(() => d(z(t)));
													E(r, () => RE, (r, i) => {
														i(r, {
															get value() {
																return z(t).value;
															},
															get disabled() {
																return z(e);
															},
															part: "tab",
															get tabindex() {
																return z(n);
															},
															children: (e, n) => {
																ne();
																var r = fe();
																G(() => w(r, z(t).label)), I(e, r);
															},
															$$slots: { default: !0 }
														});
													});
												}
												I(e, n);
											};
											P(r, (e) => {
												z(t).disabled && z(t).reason ? e(i) : e(a, -1);
											}), I(e, n);
										}), I(e, n);
									},
									$$slots: { default: !0 }
								});
							});
						}
						var a = W(r, 2);
						h(a, 17, () => i() ?? [], (e) => e.value, (e, t) => {
							var n = F(), r = K(n);
							E(r, () => uE, (e, n) => {
								n(e, {
									get value() {
										return z(t).value;
									},
									part: "panel",
									children: (e, n) => {
										var r = F(), i = K(r);
										S(i, () => "slot", !1, (e, n) => {
											g(e, () => ({ name: z(t).value }));
										}), I(e, r);
									},
									$$slots: { default: !0 }
								});
							}), I(e, n);
						}), I(e, n);
					},
					$$slots: { default: !0 }
				});
			}), I(e, r);
		},
		$$slots: { default: !0 }
	}), I(e, m), y(p);
}
U(HE, {
	items: { type: "Array" },
	value: {
		attribute: "value",
		type: "String"
	},
	label: {
		attribute: "label",
		type: "String"
	},
	variant: {
		attribute: "variant",
		type: "String"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/Tile.svelte
var UE = L("<div class=\"state svelte-18matrm\" part=\"state\"><p class=\"lead svelte-18matrm\"> </p></div>"), WE = L("<div class=\"frame svelte-18matrm\" part=\"frame\"><!></div>"), GE = L("<!> <div class=\"af-kit svelte-18matrm\"><!></div>", 1), KE = {
	hash: "svelte-18matrm",
	code: ":host {display:block;}.af-kit.svelte-18matrm {height:100%;}.frame.svelte-18matrm {display:flex;flex-direction:column;gap:8px;box-sizing:border-box;height:100%;min-width:0;padding:12px 16px;border:1px solid var(--k-line);border-radius:var(--k-radius);background:var(--k-surface);font-size:14px;line-height:20px;}.state.svelte-18matrm {padding:16px 0;}.lead.svelte-18matrm {margin:0;font-weight:500;}"
};
function qE(e, n) {
	O(n, !0), ee(e, KE);
	let r = R(n, "spec", 7, null), i = R(n, "result", 7, null), a = R(n, "fields", 7, null), o = R(n, "rows", 7, null), s = R(n, "columns", 7, null), l = R(n, "paging", 7, null), u = R(n, "table", 7, null), d = R(n, "drill", 7, !1), f = R(n, "locale", 7, null), p = R(n, "strings", 7, null), m = n.$$host, h = _(() => c(f(), p() ?? void 0)), g = _(() => r() ? ke(r(), a() ?? void 0) : ""), v = B(null), b = B(!1);
	Te(() => {
		let e = !0;
		return import("./chunks/tile-view-BMSKoEpn.js").then((t) => {
			e && J(v, t.default);
		}, () => {
			e && J(b, !0);
		}), () => {
			e = !1;
		};
	});
	var x = {
		get spec() {
			return r();
		},
		set spec(e = null) {
			r(e), M();
		},
		get result() {
			return i();
		},
		set result(e = null) {
			i(e), M();
		},
		get fields() {
			return a();
		},
		set fields(e = null) {
			a(e), M();
		},
		get rows() {
			return o();
		},
		set rows(e = null) {
			o(e), M();
		},
		get columns() {
			return s();
		},
		set columns(e = null) {
			s(e), M();
		},
		get paging() {
			return l();
		},
		set paging(e = null) {
			l(e), M();
		},
		get table() {
			return u();
		},
		set table(e = null) {
			u(e), M();
		},
		get drill() {
			return d();
		},
		set drill(e = !1) {
			d(e), M();
		},
		get locale() {
			return f();
		},
		set locale(e = null) {
			f(e), M();
		},
		get strings() {
			return p();
		},
		set strings(e = null) {
			p(e), M();
		}
	}, S = GE(), C = K(S);
	t(C, {});
	var T = W(C, 2), te = H(T), ne = (e) => {
		var t = F(), n = K(t);
		{
			let e = _(() => !!d());
			E(n, () => z(v), (t, n) => {
				n(t, {
					get spec() {
						return r();
					},
					get result() {
						return i();
					},
					get fields() {
						return a();
					},
					get rows() {
						return o();
					},
					get columns() {
						return s();
					},
					get paging() {
						return l();
					},
					get table() {
						return u();
					},
					get drill() {
						return z(e);
					},
					get text() {
						return z(h);
					},
					get locale() {
						return f();
					},
					get host() {
						return m;
					}
				});
			});
		}
		I(e, t);
	}, re = (e) => {
		var t = WE(), n = H(t), r = (e) => {
			var t = UE(), n = H(t), r = ge(n, !0);
			D(t), G(() => w(r, z(h).tileLoadFailed)), I(e, t);
		}, i = (e) => {
			Ae(e, {
				get title() {
					return z(g);
				},
				get text() {
					return z(h);
				}
			});
		};
		P(n, (e) => {
			z(b) ? e(r) : e(i, -1);
		}), D(t), I(e, t);
	};
	return P(te, (e) => {
		z(v) ? e(ne) : e(re, -1);
	}), D(T), I(e, S), y(x);
}
U(qE, {
	spec: { type: "Object" },
	result: { type: "Object" },
	fields: { type: "Array" },
	rows: { type: "Array" },
	columns: { type: "Array" },
	paging: { type: "Object" },
	table: { type: "Boolean" },
	drill: {
		attribute: "drill",
		type: "Boolean"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, [], [], { mode: "open" });
var JE = ln("toast").parts("group", "root", "title", "description", "actionTrigger", "closeTrigger").build(), YE = (e) => `toast-group:${e}`, XE = (e, t) => e.getById(`toast-group:${t}`), ZE = (e) => `toast:${e.id}`, QE = (e) => e.getById(ZE(e)), $E = (e) => `toast:${e.id}:title`, eD = (e) => `toast:${e.id}:description`, tD = (e) => `toast${e.id}:close`, nD = {
	info: 5e3,
	error: 5e3,
	success: 2e3,
	loading: Infinity,
	warning: 5e3,
	DEFAULT: 5e3
};
function rD(e, t) {
	return e ?? nD[t] ?? nD.DEFAULT;
}
var iD = (e) => typeof e == "string" ? {
	left: e,
	right: e,
	bottom: e,
	top: e
} : e;
function aD(e, t) {
	let { prop: n, computed: r, context: i } = e, { offsets: a, gap: o } = n("store").attrs, s = i.get("heights"), c = iD(a), l = n("dir") === "rtl", u = t.replace("-start", l ? "-right" : "-left").replace("-end", l ? "-left" : "-right"), d = u.includes("right"), f = u.includes("left"), p = {
		position: "fixed",
		pointerEvents: r("count") > 0 ? void 0 : "none",
		display: "flex",
		flexDirection: "column",
		"--gap": `${o}px`,
		"--first-height": `${s[0]?.height || 0}px`,
		"--viewport-offset-left": c.left,
		"--viewport-offset-right": c.right,
		"--viewport-offset-top": c.top,
		"--viewport-offset-bottom": c.bottom,
		zIndex: Gt
	}, m = "center";
	return d && (m = "flex-end"), f && (m = "flex-start"), p.alignItems = m, u.includes("top") && (p.top = `max(env(safe-area-inset-top, 0px), ${c.top})`), u.includes("bottom") && (p.bottom = `max(env(safe-area-inset-bottom, 0px), ${c.bottom})`), u.includes("left") || (p.insetInlineEnd = `calc(env(safe-area-inset-right, 0px) + ${c.right})`), u.includes("right") || (p.insetInlineStart = `calc(env(safe-area-inset-left, 0px) + ${c.left})`), p;
}
function oD(e, t) {
	let { prop: n, context: r, computed: i } = e, a = n("parent"), o = a.computed("placement"), { gap: s } = a.prop("store").attrs, [c] = o.split("-"), l = r.get("mounted"), u = r.get("remainingTime"), d = i("height"), f = i("frontmost"), p = !f, m = !n("stacked"), h = n("stacked"), g = n("type") === "loading" ? 2 ** 53 - 1 : u, _ = i("heightIndex") * s + i("heightBefore"), v = {
		position: "absolute",
		pointerEvents: "auto",
		"--opacity": "0",
		"--remove-delay": `${n("removeDelay")}ms`,
		"--duration": `${g}ms`,
		"--initial-height": `${d}px`,
		"--offset": `${_}px`,
		"--index": n("index"),
		"--z-index": i("zIndex"),
		"--lift-amount": "calc(var(--lift) * var(--gap))",
		"--y": "100%",
		"--x": "0"
	}, y = (e) => Object.assign(v, e);
	return c === "top" ? y({
		top: "0",
		"--sign": "-1",
		"--y": "-100%",
		"--lift": "1"
	}) : c === "bottom" && y({
		bottom: "0",
		"--sign": "1",
		"--y": "100%",
		"--lift": "-1"
	}), l && (y({
		"--y": "0",
		"--opacity": "1"
	}), h && y({
		"--y": "calc(var(--lift) * var(--offset))",
		"--height": "var(--initial-height)"
	})), t || y({
		"--opacity": "0",
		pointerEvents: "none"
	}), p && m && (y({
		"--base-scale": "var(--index) * 0.05 + 1",
		"--y": "calc(var(--lift-amount) * var(--index))",
		"--scale": "calc(-1 * var(--base-scale))",
		"--height": "var(--first-height)"
	}), t || y({ "--y": "calc(var(--sign) * 40%)" })), p && h && !t && y({ "--y": "calc(var(--lift) * var(--offset) + var(--lift) * -100%)" }), f && !t && y({ "--y": "calc(var(--lift) * -100%)" }), v;
}
function sD(e, t) {
	let { computed: n } = e, r = {
		position: "absolute",
		inset: "0",
		scale: "1 2",
		pointerEvents: t ? "none" : "auto"
	};
	return n("frontmost") && !t && ((e) => Object.assign(r, e))({ height: "calc(var(--initial-height) + 80%)" }), r;
}
function cD() {
	return {
		position: "absolute",
		left: "0",
		height: "calc(var(--gap) + 2px)",
		bottom: "100%",
		width: "100%"
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+toast@1.43.3/node_modules/@zag-js/toast/dist/toast-group.connect.mjs
function lD(e, t) {
	let { context: n, prop: r, send: i, refs: a, computed: o } = e;
	return {
		getCount() {
			return n.get("toasts").length;
		},
		getToasts() {
			return n.get("toasts");
		},
		getGroupProps(n = {}) {
			let { label: s = "Notifications" } = n, { hotkey: c } = r("store").attrs, l = c.join("+").replace(/Key/g, "").replace(/Digit/g, ""), u = o("placement"), [d, f = "center"] = u.split("-");
			return t.element({
				...JE.group.attrs,
				dir: r("dir"),
				tabIndex: -1,
				role: "region",
				"aria-label": `${s}, ${u} (${l})`,
				id: YE(u),
				"data-placement": u,
				"data-side": d,
				"data-align": f,
				"aria-live": "polite",
				"aria-relevant": "additions text",
				"aria-atomic": "false",
				style: aD(e, u),
				onMouseEnter() {
					a.get("ignoreMouseTimer").isActive() || i({
						type: "REGION.POINTER_ENTER",
						placement: u
					});
				},
				onMouseMove() {
					a.get("ignoreMouseTimer").isActive() || i({
						type: "REGION.POINTER_ENTER",
						placement: u
					});
				},
				onMouseLeave() {
					a.get("ignoreMouseTimer").isActive() || i({
						type: "REGION.POINTER_LEAVE",
						placement: u
					});
				},
				onFocus(e) {
					i({
						type: "REGION.FOCUS",
						target: e.relatedTarget
					});
				},
				onBlur(e) {
					a.get("isFocusWithin") && !kt(e.currentTarget, e.relatedTarget) && queueMicrotask(() => i({ type: "REGION.BLUR" }));
				}
			});
		},
		subscribe(e) {
			return r("store").subscribe(() => e(n.get("toasts")));
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+toast@1.43.3/node_modules/@zag-js/toast/dist/toast-group.machine.mjs
var { guards: uD, createMachine: dD } = Lt(), { and: fD } = uD, pD = dD({
	props({ props: e }) {
		return {
			dir: "ltr",
			id: Je(),
			...e,
			store: e.store
		};
	},
	initialState({ prop: e }) {
		return e("store").attrs.overlap ? "overlap" : "stack";
	},
	refs() {
		return {
			lastFocusedEl: null,
			isFocusWithin: !1,
			isPointerWithin: !1,
			ignoreMouseTimer: Ve.create(),
			dismissableCleanup: void 0
		};
	},
	context({ bindable: e }) {
		return {
			toasts: e(() => ({
				defaultValue: [],
				sync: !0,
				hash: (e) => e.map((e) => e.id).join(",")
			})),
			heights: e(() => ({
				defaultValue: [],
				sync: !0
			}))
		};
	},
	computed: {
		count: ({ context: e }) => e.get("toasts").length,
		overlap: ({ prop: e }) => e("store").attrs.overlap,
		placement: ({ prop: e }) => e("store").attrs.placement
	},
	effects: [
		"subscribeToStore",
		"trackDocumentVisibility",
		"trackHotKeyPress"
	],
	watch({ track: e, context: t, action: n }) {
		e([() => t.hash("toasts")], () => {
			queueMicrotask(() => {
				n(["collapsedIfEmpty", "setDismissableBranch"]);
			});
		});
	},
	exit: [
		"clearDismissableBranch",
		"clearLastFocusedEl",
		"clearMouseEventTimer"
	],
	on: {
		"DOC.HOTKEY": { actions: ["focusRegionEl"] },
		"REGION.BLUR": [
			{
				guard: fD("isOverlapping", "isPointerOut"),
				target: "overlap",
				actions: [
					"collapseToasts",
					"resumeToasts",
					"restoreFocusIfPointerOut"
				]
			},
			{
				guard: "isPointerOut",
				target: "stack",
				actions: ["resumeToasts", "restoreFocusIfPointerOut"]
			},
			{ actions: ["clearFocusWithin"] }
		],
		"TOAST.REMOVE": { actions: [
			"removeToast",
			"removeHeight",
			"ignoreMouseEventsTemporarily"
		] },
		"TOAST.PAUSE": { actions: ["pauseToasts"] }
	},
	states: {
		stack: { on: {
			"REGION.POINTER_LEAVE": [{
				guard: "isOverlapping",
				target: "overlap",
				actions: [
					"clearPointerWithin",
					"resumeToasts",
					"collapseToasts"
				]
			}, { actions: ["clearPointerWithin", "resumeToasts"] }],
			"REGION.OVERLAP": {
				target: "overlap",
				actions: ["collapseToasts"]
			},
			"REGION.FOCUS": { actions: ["setLastFocusedEl", "pauseToasts"] },
			"REGION.POINTER_ENTER": { actions: ["setPointerWithin", "pauseToasts"] }
		} },
		overlap: { on: {
			"REGION.STACK": {
				target: "stack",
				actions: ["expandToasts"]
			},
			"REGION.POINTER_ENTER": {
				target: "stack",
				actions: [
					"setPointerWithin",
					"pauseToasts",
					"expandToasts"
				]
			},
			"REGION.FOCUS": {
				target: "stack",
				actions: [
					"setLastFocusedEl",
					"pauseToasts",
					"expandToasts"
				]
			}
		} }
	},
	implementations: {
		guards: {
			isOverlapping: ({ computed: e }) => e("overlap"),
			isPointerOut: ({ refs: e }) => !e.get("isPointerWithin")
		},
		effects: {
			subscribeToStore({ context: e, prop: t }) {
				let n = t("store");
				return e.set("toasts", n.getVisibleToasts()), n.subscribe((t) => {
					if (t.dismiss) {
						e.set("toasts", (e) => e.filter((e) => e.id !== t.id));
						return;
					}
					e.set("toasts", (e) => {
						let n = e.findIndex((e) => e.id === t.id);
						return n === -1 ? [t, ...e] : [
							...e.slice(0, n),
							{
								...e[n],
								...t
							},
							...e.slice(n + 1)
						];
					});
				});
			},
			trackHotKeyPress({ prop: e, send: t }) {
				return Ne(document, "keydown", (n) => {
					let { hotkey: r } = e("store").attrs;
					r.every((e) => n[e] || n.code === e) && t({ type: "DOC.HOTKEY" });
				}, { capture: !0 });
			},
			trackDocumentVisibility({ prop: e, send: t, scope: n }) {
				let { pauseOnPageIdle: r } = e("store").attrs;
				if (!r) return;
				let i = n.getDoc();
				return Ne(i, "visibilitychange", () => {
					t({ type: i.visibilityState === "hidden" ? "PAUSE_ALL" : "RESUME_ALL" });
				});
			}
		},
		actions: {
			setDismissableBranch({ refs: e, context: t, computed: n, scope: r }) {
				let i = t.get("toasts"), a = n("placement"), o = i.length > 0;
				if (!o) {
					e.get("dismissableCleanup")?.();
					return;
				}
				if (o && e.get("dismissableCleanup")) return;
				let s = cc(() => XE(r, a), { defer: !0 });
				e.set("dismissableCleanup", s);
			},
			clearDismissableBranch({ refs: e }) {
				e.get("dismissableCleanup")?.();
			},
			focusRegionEl({ scope: e, computed: t }) {
				queueMicrotask(() => {
					XE(e, t("placement"))?.focus();
				});
			},
			pauseToasts({ prop: e }) {
				e("store").pause();
			},
			resumeToasts({ prop: e }) {
				e("store").resume();
			},
			expandToasts({ prop: e }) {
				e("store").expand();
			},
			collapseToasts({ prop: e }) {
				e("store").collapse();
			},
			removeToast({ prop: e, event: t }) {
				e("store").remove(t.id);
			},
			removeHeight({ event: e, context: t }) {
				e?.id != null && queueMicrotask(() => {
					t.set("heights", (t) => t.filter((t) => t.id !== e.id));
				});
			},
			collapsedIfEmpty({ send: e, computed: t }) {
				!t("overlap") || t("count") > 1 || e({ type: "REGION.OVERLAP" });
			},
			setLastFocusedEl({ refs: e, event: t }) {
				!e.get("isFocusWithin") && t.target && (e.set("isFocusWithin", !0), e.set("lastFocusedEl", t.target));
			},
			restoreFocusIfPointerOut({ refs: e }) {
				e.get("lastFocusedEl") && !e.get("isPointerWithin") && (e.get("lastFocusedEl")?.focus({ preventScroll: !0 }), e.set("lastFocusedEl", null), e.set("isFocusWithin", !1));
			},
			setPointerWithin({ refs: e }) {
				e.set("isPointerWithin", !0);
			},
			clearPointerWithin({ refs: e }) {
				e.set("isPointerWithin", !1), e.get("lastFocusedEl") && !e.get("isFocusWithin") && (e.get("lastFocusedEl")?.focus({ preventScroll: !0 }), e.set("lastFocusedEl", null));
			},
			clearFocusWithin({ refs: e }) {
				e.set("isFocusWithin", !1);
			},
			clearLastFocusedEl({ refs: e }) {
				e.get("lastFocusedEl") && (e.get("lastFocusedEl")?.focus({ preventScroll: !0 }), e.set("lastFocusedEl", null), e.set("isFocusWithin", !1));
			},
			ignoreMouseEventsTemporarily({ refs: e }) {
				e.get("ignoreMouseTimer").request();
			},
			clearMouseEventTimer({ refs: e }) {
				e.get("ignoreMouseTimer").cancel();
			}
		}
	}
}), mD = { closeTriggerLabel: "Dismiss notification" };
function hD(e, t) {
	let { state: n, send: r, prop: i, scope: a, context: o, computed: s } = e, c = He(mD, i("translations")), l = n.hasTag("visible"), u = n.hasTag("paused"), d = o.get("mounted"), f = s("frontmost"), p = i("parent").computed("placement"), m = i("type"), h = i("stacked"), g = i("title"), _ = i("description"), v = i("action"), [y, ee = "center"] = p.split("-");
	return {
		type: m,
		title: g,
		description: _,
		placement: p,
		visible: l,
		paused: u,
		closable: !!i("closable"),
		pause() {
			r({ type: "PAUSE" });
		},
		resume() {
			r({ type: "RESUME" });
		},
		dismiss() {
			r({
				type: "DISMISS",
				src: "programmatic"
			});
		},
		getRootProps() {
			return t.element({
				...JE.root.attrs,
				dir: i("dir"),
				id: ZE(a),
				"data-state": l ? "open" : "closed",
				"data-type": m,
				"data-placement": p,
				"data-align": ee,
				"data-side": y,
				"data-mounted": Z(d),
				"data-paused": Z(u),
				"data-first": Z(f),
				"data-sibling": Z(!f),
				"data-stack": Z(h),
				"data-overlap": Z(!h),
				role: "status",
				"aria-atomic": "true",
				"aria-describedby": _ ? eD(a) : void 0,
				"aria-labelledby": g ? $E(a) : void 0,
				tabIndex: 0,
				style: oD(e, l),
				onKeyDown(e) {
					e.defaultPrevented || e.key == "Escape" && (r({
						type: "DISMISS",
						src: "keyboard"
					}), e.preventDefault());
				}
			});
		},
		getGhostBeforeProps() {
			return t.element({
				"data-ghost": "before",
				style: sD(e, l)
			});
		},
		getGhostAfterProps() {
			return t.element({
				"data-ghost": "after",
				style: cD()
			});
		},
		getTitleProps() {
			return t.element({
				...JE.title.attrs,
				id: $E(a)
			});
		},
		getDescriptionProps() {
			return t.element({
				...JE.description.attrs,
				id: eD(a)
			});
		},
		getActionTriggerProps() {
			return t.button({
				...JE.actionTrigger.attrs,
				type: "button",
				onClick(e) {
					e.defaultPrevented || (v?.onClick?.(), r({
						type: "DISMISS",
						src: "user"
					}));
				}
			});
		},
		getCloseTriggerProps() {
			return t.button({
				id: tD(a),
				...JE.closeTrigger.attrs,
				type: "button",
				"aria-label": c?.closeTriggerLabel,
				onClick(e) {
					e.defaultPrevented || r({
						type: "DISMISS",
						src: "user"
					});
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+toast@1.43.3/node_modules/@zag-js/toast/dist/toast.machine.mjs
var { not: gD } = On(), _D = Pn({
	props({ props: e }) {
		return Re(e, [
			"id",
			"type",
			"parent",
			"removeDelay"
		], "toast"), {
			closable: !0,
			...e,
			duration: rD(e.duration, e.type)
		};
	},
	initialState({ prop: e }) {
		return e("type") === "loading" || e("duration") === Infinity ? "visible:persist" : "visible";
	},
	context({ prop: e, bindable: t }) {
		return {
			remainingTime: t(() => ({ defaultValue: rD(e("duration"), e("type")) })),
			createdAt: t(() => ({ defaultValue: Date.now() })),
			mounted: t(() => ({ defaultValue: !1 })),
			initialHeight: t(() => ({ defaultValue: 0 }))
		};
	},
	refs() {
		return {
			closeTimerStartTime: Date.now(),
			lastCloseStartTimerStartTime: 0
		};
	},
	computed: {
		zIndex: ({ prop: e }) => {
			let t = e("parent").context.get("toasts"), n = t.findIndex((t) => t.id === e("id"));
			return t.length - n;
		},
		height: ({ prop: e }) => e("parent").context.get("heights").find((t) => t.id === e("id"))?.height ?? 0,
		heightIndex: ({ prop: e }) => e("parent").context.get("heights").findIndex((t) => t.id === e("id")),
		frontmost: ({ prop: e }) => e("index") === 0,
		heightBefore: ({ prop: e }) => {
			let t = e("parent").context.get("heights"), n = t.findIndex((t) => t.id === e("id"));
			return t.reduce((e, t, r) => r >= n ? e : e + t.height, 0);
		},
		shouldPersist: ({ prop: e }) => e("type") === "loading" || e("duration") === Infinity
	},
	watch({ track: e, prop: t, send: n }) {
		e([() => t("message")], () => {
			let e = t("message");
			e && n({
				type: e,
				src: "programmatic"
			});
		}), e([() => t("type"), () => t("duration")], () => {
			n({ type: "UPDATE" });
		});
	},
	on: {
		UPDATE: [{
			guard: "shouldPersist",
			target: "visible:persist",
			actions: ["resetCloseTimer"]
		}, {
			target: "visible:updating",
			actions: ["resetCloseTimer"]
		}],
		MEASURE: { actions: ["measureHeight"] }
	},
	entry: [
		"setMounted",
		"measureHeight",
		"invokeOnVisible"
	],
	effects: ["trackHeight"],
	states: {
		"visible:updating": {
			tags: ["visible", "updating"],
			effects: ["waitForNextTick"],
			on: { SHOW: { target: "visible" } }
		},
		"visible:persist": {
			tags: ["visible", "paused"],
			on: {
				RESUME: {
					guard: gD("isLoadingType"),
					target: "visible",
					actions: ["setCloseTimer"]
				},
				DISMISS: { target: "dismissing" }
			}
		},
		visible: {
			tags: ["visible"],
			effects: ["waitForDuration"],
			on: {
				DISMISS: { target: "dismissing" },
				PAUSE: {
					target: "visible:persist",
					actions: ["syncRemainingTime"]
				}
			}
		},
		dismissing: {
			entry: ["invokeOnDismiss"],
			effects: ["waitForRemoveDelay"],
			on: { REMOVE: {
				target: "unmounted",
				actions: ["notifyParentToRemove"]
			} }
		},
		unmounted: { entry: ["invokeOnUnmount"] }
	},
	implementations: {
		effects: {
			waitForRemoveDelay({ prop: e, send: t }) {
				return Hr(() => {
					t({
						type: "REMOVE",
						src: "timer"
					});
				}, e("removeDelay"));
			},
			waitForDuration({ send: e, context: t, computed: n }) {
				if (!n("shouldPersist")) return Hr(() => {
					e({
						type: "DISMISS",
						src: "timer"
					});
				}, t.get("remainingTime"));
			},
			waitForNextTick({ send: e }) {
				return Hr(() => {
					e({
						type: "SHOW",
						src: "timer"
					});
				}, 0);
			},
			trackHeight({ scope: e, prop: t }) {
				let n;
				return en(() => {
					let r = QE(e);
					if (!r) return;
					let i = new (e.getWin()).MutationObserver(() => {
						let e = vD(r), n = {
							id: t("id"),
							height: e
						};
						yD(t("parent"), n);
					});
					i.observe(r, {
						childList: !0,
						subtree: !0,
						characterData: !0
					}), n = () => i.disconnect();
				}), () => n?.();
			}
		},
		guards: {
			isLoadingType: ({ prop: e }) => e("type") === "loading",
			shouldPersist: ({ computed: e }) => e("shouldPersist")
		},
		actions: {
			setMounted({ context: e }) {
				en(() => {
					e.set("mounted", !0);
				});
			},
			measureHeight({ scope: e, prop: t, context: n }) {
				queueMicrotask(() => {
					let r = QE(e);
					if (!r) return;
					let i = vD(r);
					n.set("initialHeight", i);
					let a = {
						id: t("id"),
						height: i
					};
					yD(t("parent"), a);
				});
			},
			setCloseTimer({ refs: e }) {
				e.set("closeTimerStartTime", Date.now());
			},
			resetCloseTimer({ context: e, refs: t, prop: n }) {
				t.set("closeTimerStartTime", Date.now()), e.set("remainingTime", rD(n("duration"), n("type")));
			},
			syncRemainingTime({ context: e, refs: t }) {
				e.set("remainingTime", (e) => {
					let n = t.get("closeTimerStartTime"), r = Date.now() - n;
					return t.set("lastCloseStartTimerStartTime", Date.now()), e - r;
				});
			},
			notifyParentToRemove({ prop: e }) {
				e("parent").send({
					type: "TOAST.REMOVE",
					id: e("id")
				});
			},
			invokeOnDismiss({ prop: e, event: t }) {
				e("onStatusChange")?.({
					status: "dismissing",
					src: t.src
				});
			},
			invokeOnUnmount({ prop: e }) {
				e("onStatusChange")?.({ status: "unmounted" });
			},
			invokeOnVisible({ prop: e }) {
				e("onStatusChange")?.({ status: "visible" });
			}
		}
	}
});
function vD(e) {
	let t = e.style.height;
	e.style.height = "auto";
	let n = e.offsetHeight;
	return e.style.height = t, n;
}
function yD(e, t) {
	let { id: n, height: r } = t;
	e.context.set("heights", (e) => e.find((e) => e.id === n) ? e.map((e) => e.id === n ? {
		...e,
		height: r
	} : e) : [{
		id: n,
		height: r
	}, ...e]);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+toast@1.43.3/node_modules/@zag-js/toast/dist/toast.store.mjs
var bD = (e, t) => ({
	...t,
	...vt(e)
}), xD = {
	error: [1, 2],
	warning: [3, 6],
	loading: [4, 5],
	success: [5, 7],
	info: [6, 8]
}, SD = "info", CD = (e, t) => {
	let [n, r] = xD[e ?? SD];
	return t ? n : r;
}, wD = (e) => e.sort((e, t) => (e.priority ?? CD(e.type, !!e.action)) - (t.priority ?? CD(t.type, !!t.action)));
function TD(e = {}) {
	let t = bD(e, {
		placement: "bottom",
		overlap: !1,
		max: 24,
		gap: 16,
		offsets: "1rem",
		hotkey: ["altKey", "KeyT"],
		removeDelay: 200,
		pauseOnPageIdle: !0
	}), n = [], r = [], i = /* @__PURE__ */ new Set(), a = [], o = (e) => (n.push(e), () => {
		let t = n.indexOf(e);
		n.splice(t, 1);
	}), s = (e) => (n.forEach((t) => t(e)), e), c = (e) => {
		if (r.length >= t.max) {
			a.push(e);
			return;
		}
		s(e), r.unshift(e);
	}, l = () => {
		for (a = wD(a); a.length > 0 && r.length < t.max;) {
			let e = a.shift();
			e && (s(e), r.unshift(e));
		}
	}, u = (e) => {
		let n = e.id ?? `toast:${Je()}`, a = r.find((e) => e.id === n);
		if (i.has(n) && i.delete(n), a) r = r.map((t) => t.id === n ? s({
			...t,
			...e,
			id: n
		}) : t);
		else {
			let r = {
				id: n,
				duration: t.duration,
				removeDelay: t.removeDelay,
				type: SD,
				...e,
				stacked: !t.overlap,
				gap: t.gap
			}, i = r.priority ?? CD(r.type, !!r.action);
			c({
				...r,
				priority: i
			});
		}
		return n;
	}, d = (e) => (i.add(e), e ? (n.forEach((t) => t({
		id: e,
		dismiss: !0
	})), r = r.filter((t) => t.id !== e), l()) : (r.forEach((e) => {
		n.forEach((t) => t({
			id: e.id,
			dismiss: !0
		}));
	}), r = [], a = []), e);
	return {
		attrs: t,
		subscribe: o,
		create: u,
		update: (e, t) => u({
			id: e,
			...t
		}),
		remove: d,
		dismiss: (e) => {
			r = e == null ? r.map((e) => s({
				...e,
				message: "DISMISS"
			})) : r.map((t) => t.id === e ? s({
				...t,
				message: "DISMISS"
			}) : t);
		},
		error: (e) => u({
			...e,
			type: "error"
		}),
		success: (e) => u({
			...e,
			type: "success"
		}),
		info: (e) => u({
			...e,
			type: "info"
		}),
		warning: (e) => u({
			...e,
			type: "warning"
		}),
		loading: (e) => u({
			...e,
			type: "loading"
		}),
		getVisibleToasts: () => r.filter((e) => !i.has(e.id)),
		getCount: () => r.length,
		promise: (e, t, n = {}) => {
			if (!t || !t.loading) {
				An("[zag-js > toast] toaster.promise() requires at least a 'loading' option to be specified");
				return;
			}
			let r = u({
				...n,
				...t.loading,
				promise: e,
				type: "loading"
			}), i = !0, a, o = St(e).then(async (e) => {
				if (a = ["resolve", e], ED(e) && !e.ok) {
					i = !1;
					let a = St(t.error, `HTTP Error! status: ${e.status}`);
					u({
						...n,
						...a,
						id: r,
						type: "error"
					});
				} else if (t.success !== void 0) {
					i = !1;
					let a = St(t.success, e);
					u({
						...n,
						...a,
						id: r,
						type: a.type ?? "success"
					});
				}
			}).catch(async (e) => {
				if (a = ["reject", e], t.error !== void 0) {
					i = !1;
					let a = St(t.error, e);
					u({
						...n,
						...a,
						id: r,
						type: "error"
					});
				}
			}).finally(() => {
				i && d(r), t.finally?.();
			});
			return {
				id: r,
				unwrap: () => new Promise((e, t) => o.then(() => a[0] === "reject" ? t(a[1]) : e(a[1])).catch(t))
			};
		},
		pause: (e) => {
			r = e == null ? r.map((e) => s({
				...e,
				message: "PAUSE"
			})) : r.map((t) => t.id === e ? s({
				...t,
				message: "PAUSE"
			}) : t);
		},
		resume: (e) => {
			r = e == null ? r.map((e) => s({
				...e,
				message: "RESUME"
			})) : r.map((t) => t.id === e ? s({
				...t,
				message: "RESUME"
			}) : t);
		},
		isVisible: (e) => !i.has(e) && !!r.find((t) => t.id === e),
		isDismissed: (e) => i.has(e),
		expand: () => {
			r = r.map((e) => s({
				...e,
				stacked: !0
			}));
		},
		collapse: () => {
			r = r.map((e) => s({
				...e,
				stacked: !1
			}));
		}
	};
}
var ED = (e) => e && typeof e == "object" && "ok" in e && typeof e.ok == "boolean" && "status" in e && typeof e.status == "number", DD = {
	connect: lD,
	machine: pD
}, OD = (e) => TD(e), [kD, AD] = Rt({
	name: "ToastContext",
	hookName: "useToastContext",
	providerName: "<ToastProvider />"
}), jD = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function MD(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, jD), i = AD(), a = _(() => X(i().getActionTriggerProps(), r));
	return Q(e, Y({ as: "button" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(MD, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toast-close-trigger.svelte
var ND = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function PD(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, ND), i = AD(), a = _(() => X(i().getCloseTriggerProps(), r));
	return Q(e, Y({ as: "button" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(PD, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toast-description.svelte
var FD = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function ID(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, FD), i = AD(), a = _(() => X(i().getDescriptionProps(), r));
	return Q(e, Y({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(ID, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toast-root.svelte
var LD = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]), RD = L("<div></div> <!> <div></div>", 1);
function zD(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, LD), i = AD(), a = _(() => X(i().getRootProps(), r));
	return Q(e, Y({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		},
		children: (e, n) => {
			var r = RD(), a = K(r);
			g(a, (e) => ({ ...e }), [() => i().getGhostBeforeProps()]);
			var o = W(a, 2);
			ye(o, () => t.children ?? b);
			var s = W(o, 2);
			g(s, (e) => ({ ...e }), [() => i().getGhostAfterProps()]), I(e, r);
		},
		$$slots: { default: !0 }
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(zD, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toaster-item.svelte
function BD(e, t) {
	O(t, !0);
	let n = R(t, "children", 7), r = R(t, "value", 7), i = R(t, "parent", 7), a = R(t, "index", 7), o = Nt(), s = _(() => ({
		...r()(),
		parent: i(),
		index: a(),
		getRootNode: o().getRootNode
	})), c = Tn(_D, () => z(s)), l = _(() => hD(c, Wt));
	kD(() => z(l));
	var u = {
		get children() {
			return n();
		},
		set children(e) {
			n(e), M();
		},
		get value() {
			return r();
		},
		set value(e) {
			r(e), M();
		},
		get parent() {
			return i();
		},
		set parent(e) {
			i(e), M();
		},
		get index() {
			return a();
		},
		set index(e) {
			a(e), M();
		}
	}, d = F(), f = K(d);
	return ye(f, n, r), I(e, d), y(u);
}
U(BD, {
	children: {},
	value: {},
	parent: {},
	index: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toaster.svelte
var VD = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"toaster",
	"children"
]);
function HD(e, t) {
	let n = m();
	O(t, !0);
	let r = R(t, "ref", 15, null), i = R(t, "toaster", 7), a = R(t, "children", 7), o = q(t, VD), s = gn(), c = Nt(), l = _(() => ({
		store: i(),
		id: n,
		dir: s().dir,
		getRootNode: c().getRootNode
	})), u = Tn(DD.machine, () => z(l)), d = _(() => DD.connect(u, Wt)), f = _(() => z(d).getToasts()), p = _(() => X(z(d).getGroupProps(), o));
	return Q(e, Y({ as: "div" }, () => z(p), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		},
		children: (e, t) => {
			var n = F(), r = K(n);
			h(r, 19, () => z(f), (e) => e.id, (e, t, n, r) => {
				let i = _(() => () => z(t));
				BD(e, {
					value: z(i),
					get parent() {
						return u;
					},
					get index() {
						return z(n);
					},
					children: (e, t) => {
						var n = F(), r = K(n);
						ye(r, a, () => z(i)), I(e, n);
					},
					$$slots: { default: !0 }
				});
			}), I(e, n);
		},
		$$slots: { default: !0 }
	})), y({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), M();
		},
		get toaster() {
			return i();
		},
		set toaster(e) {
			i(e), M();
		},
		get children() {
			return a();
		},
		set children(e) {
			a(e), M();
		}
	});
}
U(HD, {
	ref: {},
	toaster: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/Toast.svelte
var UD = /* @__PURE__ */ new WeakMap();
function WD(e) {
	let t = UD.get(e);
	return t || UD.set(e, t = OD({
		placement: "bottom-end",
		overlap: !1,
		gap: 8,
		hotkey: ["af-kit-no-hotkey"]
	})), t;
}
function GD(e, t) {
	return e.create({
		type: t.kind,
		description: t.text,
		duration: t.kind === "error" ? t.action ? Infinity : 8e3 : 4e3,
		meta: { action: t.action ?? null }
	});
}
var KD = L("<p> </p>"), qD = ae("<path d=\"m15 9-6 6\"></path><path d=\"M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z\"></path><path d=\"m9 9 6 6\"></path>", 1), JD = ae("<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"m9 12 2 2 4-4\"></path>", 1), YD = ae("<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 16v-4\"></path><path d=\"M12 8h.01\"></path>", 1), XD = ae("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-e495ij\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg>"), ZD = ae("<svg part=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-e495ij\"><!></svg><!><!><!>", 1), QD = L("<div class=\"af-kit\"><div class=\"live svelte-e495ij\" role=\"status\"></div> <div class=\"live svelte-e495ij\" role=\"alert\"></div> <div class=\"region svelte-e495ij\" popover=\"manual\"><!></div></div>"), $D = L("<!> <!>", 1), eO = {
	hash: "svelte-e495ij",
	code: ".live.svelte-e495ij {position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;}.region[popover].svelte-e495ij {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;pointer-events:none;}[data-scope='toast'][data-part='root'] {--k-toast-tone: var(--k-info);--k-toast-bg: 6%;--k-toast-bg-dark: 0%;--k-toast-edge: 14%;--k-toast-edge-dark: 19%;--k-toast-ink: 100%;--k-toast-ink-dark: 100%;--k-toast-ground: color-mix(in oklab, color-mix(in oklab, var(--k-toast-tone) var(--k-toast-bg-dark), var(--k-bg)) calc(var(--k-dark, 0) * 100%),\n      color-mix(in oklab, var(--k-toast-tone) var(--k-toast-bg), var(--k-popover)));--k-toast-line: color-mix(in oklab, color-mix(in oklab, var(--k-toast-tone) var(--k-toast-edge-dark), var(--k-bg)) calc(var(--k-dark, 0) * 100%),\n      color-mix(in oklab, var(--k-toast-tone) var(--k-toast-edge), var(--k-popover)));--k-toast-text: color-mix(in oklab, color-mix(in oklab, var(--k-toast-tone) var(--k-toast-ink-dark), var(--k-fg)) calc(var(--k-dark, 0) * 100%),\n      color-mix(in oklab, var(--k-toast-tone) var(--k-toast-ink), var(--k-fg)));position:relative;display:flex;align-items:center;gap:6px;width:min(356px, calc(100vw - 32px));padding:16px;box-sizing:border-box;border-color:var(--k-toast-line);border-radius:var(--k-radius);background-color:var(--k-toast-ground);color:var(--k-toast-text);box-shadow:0 4px 12px rgb(0 0 0 / 0.1);outline:none;font-size:13px;line-height:1.5;translate:var(--x) var(--y);scale:var(--scale, 1);z-index:var(--z-index);opacity:var(--opacity);will-change:translate, opacity, scale;transition:translate 400ms cubic-bezier(0.21, 1.02, 0.73, 1), scale 400ms cubic-bezier(0.21, 1.02, 0.73, 1), opacity 400ms cubic-bezier(0.21, 1.02, 0.73, 1);}[data-scope='toast'][data-part='root'][data-state='closed'] {transition:translate 400ms cubic-bezier(0.06, 0.71, 0.55, 1), scale 400ms cubic-bezier(0.06, 0.71, 0.55, 1), opacity 200ms cubic-bezier(0.06, 0.71, 0.55, 1);}[data-scope='toast'][data-part='root']:focus-visible {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring), 0 4px 12px rgb(0 0 0 / 0.1);}[data-scope='toast'][data-part='root'][data-type='error'] {--k-toast-tone: var(--k-danger);--k-toast-bg: 7%;--k-toast-bg-dark: 5%;--k-toast-edge: 14%;--k-toast-edge-dark: 16%;--k-toast-ink: 100%;--k-toast-ink-dark: 56%;}[data-scope='toast'][data-part='root'][data-type='success'] {--k-toast-tone: var(--k-success);--k-toast-bg: 7%;--k-toast-bg-dark: 0%;--k-toast-edge: 22%;--k-toast-edge-dark: 16%;--k-toast-ink: 67%;--k-toast-ink-dark: 55%;}[part='icon'].svelte-e495ij {flex:none;width:16px;height:16px;margin-inline:-4px 5px;color:inherit;}[data-scope='toast'][data-part='description'] {flex:1;min-width:0;font-weight:500;overflow-wrap:anywhere;}[data-scope='toast'][data-part='action-trigger'] {display:flex;flex:none;align-items:center;height:24px;margin-left:auto;padding:0 8px;border:none;border-radius:4px;background-color:var(--k-popover-fg);color:var(--k-popover);outline:none;font:inherit;font-size:12px;font-weight:500;cursor:pointer;transition:opacity 400ms, box-shadow 200ms;}[data-scope='toast'][data-part='action-trigger']:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[data-scope='toast'][data-part='close-trigger'] {position:absolute;top:0;left:0;z-index:1;display:flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:1px solid var(--k-toast-line);border-radius:50%;background-color:var(--k-toast-ground);color:var(--k-toast-text);transform:translate(-35%, -35%);outline:none;cursor:pointer;transition:opacity 100ms, background 200ms, border-color 200ms;}[data-scope='toast'][data-part='close-trigger'] svg.svelte-e495ij {width:12px;height:12px;pointer-events:none;}[data-scope='toast'][data-part='close-trigger']:focus-visible {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring);}\n  @media (forced-colors: active) {[data-scope='toast'][data-part='root']:focus-visible, [data-scope='toast'][data-part='action-trigger']:focus-visible,\n    [data-scope='toast'][data-part='close-trigger']:focus-visible {outline:2px solid;outline-offset:2px;}\n  }\n  @media (prefers-reduced-motion: reduce) {[data-scope='toast'][data-part='root'], [data-scope='toast'][data-part='root'][data-state='closed'] {transition:none;}\n  }"
};
function tO(e, r) {
	O(r, !0), ee(e, eO);
	let i = R(r, "locale", 7, null), a = R(r, "strings", 7, null), o = r.$$host, l = _(() => c(i(), a() ?? void 0)), u = WD(o), d = B(null), f = B(0), p = B(pe([])), m = () => queueMicrotask(() => {
		let e = u.getVisibleToasts();
		J(f, e.length, !0), J(p, e.map((e) => ({
			id: e.id,
			error: e.type === "error",
			text: String(e.description ?? "")
		})), !0);
	});
	Te(() => (m(), u.subscribe(m))), Te(() => s(z(d), z(f) > 0, o));
	var g = {
		get locale() {
			return i();
		},
		set locale(e = null) {
			i(e), M();
		},
		get strings() {
			return a();
		},
		set strings(e = null) {
			a(e), M();
		}
	}, v = $D(), x = K(v);
	t(x, {});
	var S = W(x, 2);
	return Yt(S, {
		value: () => o.shadowRoot,
		children: (e, t) => {
			var r = QD(), i = H(r);
			h(i, 21, () => z(p).filter((e) => !e.error), (e) => e.id, (e, t) => {
				var n = KD(), r = ge(n, !0);
				G(() => w(r, z(t).text)), I(e, n);
			}), D(i);
			var a = W(i, 2);
			h(a, 21, () => z(p).filter((e) => e.error), (e) => e.id, (e, t) => {
				var n = KD(), r = ge(n, !0);
				G(() => w(r, z(t).text)), I(e, n);
			}), D(a);
			var s = W(a, 2);
			HD(H(s), {
				get toaster() {
					return u;
				},
				get "aria-label"() {
					return z(l).notifications;
				},
				"aria-live": "off",
				children: (e, t = b) => {
					let r = _(() => t()().meta?.action);
					var i = F(), a = K(i);
					E(a, () => zD, (e, i) => {
						i(e, {
							part: "toast",
							class: "af-overlay",
							"aria-live": "off",
							children: (e, i) => {
								var a = ZD(), s = K(a), c = H(s), u = (e) => {
									var t = qD();
									ne(2), I(e, t);
								}, d = _(() => t()().type === "error"), f = (e) => {
									var t = JD();
									ne(), I(e, t);
								}, p = _(() => t()().type === "success"), m = (e) => {
									var t = YD();
									ne(2), I(e, t);
								};
								P(c, (e) => {
									z(d) ? e(u) : z(p) ? e(f, 1) : e(m, -1);
								}), D(s);
								var h = W(s);
								E(h, () => ID, (e, n) => {
									n(e, {
										part: "text",
										children: (e, n) => {
											ne();
											var r = fe();
											G((e) => w(r, e), [() => t()().description]), I(e, r);
										},
										$$slots: { default: !0 }
									});
								});
								var g = W(h), v = (e) => {
									var i = F(), a = K(i);
									E(a, () => MD, (e, i) => {
										i(e, {
											part: "action",
											onclick: () => n(o, "action", {
												toast: t()().id,
												action: z(r).id
											}),
											children: (e, t) => {
												ne();
												var n = fe();
												G(() => w(n, z(r).label)), I(e, n);
											},
											$$slots: { default: !0 }
										});
									}), I(e, i);
								};
								P(g, (e) => {
									z(r) && e(v);
								});
								var y = W(g);
								E(y, () => PD, (e, t) => {
									t(e, {
										part: "close",
										get "aria-label"() {
											return z(l).close;
										},
										children: (e, t) => {
											var n = XD();
											I(e, n);
										},
										$$slots: { default: !0 }
									});
								}), I(e, a);
							},
							$$slots: { default: !0 }
						});
					}), I(e, i);
				},
				$$slots: { default: !0 }
			}), D(s), ue(s, (e) => J(d, e), () => z(d)), D(r), I(e, r);
		},
		$$slots: { default: !0 }
	}), I(e, v), y(g);
}
U(tO, {
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, [], [], { mode: "open" }, (e) => class extends e {
	show(e) {
		return GD(WD(this), e);
	}
	dismiss(e) {
		WD(this).dismiss(e);
	}
});
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/use-tooltip-context.js
var [nO, rO] = Rt({ name: "TooltipContext" }), iO = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function aO(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, iO), i = rO(), a = io(), o = _(() => X(i().getContentProps(), a().getPresenceProps(), r));
	function s(e) {
		a().setNode(e);
	}
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	}, l = F(), u = K(l), d = (e) => {
		Q(e, Y({ as: "div" }, () => z(o), {
			[ce()]: s,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = _(() => !a().unmounted);
	return P(u, (e) => {
		z(f) && e(d);
	}), I(e, l), y(c);
}
U(aO, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/tooltip-context.svelte
function oO(e, t) {
	O(t, !0);
	let n = R(t, "render", 7), r = rO();
	var i = {
		get render() {
			return n();
		},
		set render(e) {
			n(e), M();
		}
	}, a = F(), o = K(a);
	return ye(o, () => n() ?? b, () => r), I(e, a), y(i);
}
U(oO, { render: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/tooltip-positioner.svelte
var sO = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function cO(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, sO), i = rO(), a = io(), o = _(() => X(i().getPositionerProps(), r));
	var s = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	}, c = F(), l = K(c), u = (e) => {
		Q(e, Y({ as: "div" }, () => z(o), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, d = _(() => !a().unmounted);
	return P(l, (e) => {
		z(d) && e(u);
	}), I(e, c), y(s);
}
U(cO, { ref: {} }, [], [], { mode: "open" });
var lO = ln("tooltip").parts("trigger", "arrow", "arrowTip", "positioner", "content").build(), uO = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `tooltip:${e.id}:trigger:${t}` : `tooltip:${e.id}:trigger` : et(n) ? n(t) : n;
}, dO = (e) => e.ids?.content ?? `tooltip:${e.id}:content`, fO = (e) => e.ids?.arrow ?? `tooltip:${e.id}:arrow`, pO = (e) => e.ids?.positioner ?? `tooltip:${e.id}:popper`, mO = (e) => e.getById(uO(e)), hO = (e) => e.getById(pO(e)), gO = (e) => ht(e.getRootNode(), `[data-scope="tooltip"][data-part="trigger"]${qt(e.id)}`), _O = (e, t) => t == null ? mO(e) ?? gO(e)[0] : e.getById(uO(e, t)), vO = Rr({
	id: null,
	prevId: null,
	instant: !1
});
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tooltip@1.43.3/node_modules/@zag-js/tooltip/dist/tooltip.connect.mjs
function yO(e, t) {
	let { state: n, context: r, send: i, scope: a, prop: o, event: s } = e, c = o("id"), l = !!o("aria-label"), u = n.matches("open", "closing"), d = r.get("triggerValue"), f = r.get("currentPlacement"), p = f ? Go(f) : void 0, m = dO(a), h = o("disabled"), g = us({
		...o("positioning"),
		placement: f
	});
	return {
		open: u,
		setOpen(e) {
			n.matches("open", "closing") !== e && i({ type: e ? "open" : "close" });
		},
		triggerValue: d,
		setTriggerValue(e) {
			i({
				type: "triggerValue.set",
				value: e ?? void 0
			});
		},
		reposition(e = {}) {
			i({
				type: "positioning.set",
				options: e
			});
		},
		getTriggerProps(e = {}) {
			let { value: n } = e, r = n != null && d === n, s = uO(a, n);
			return t.button({
				...lO.trigger.attrs,
				id: s,
				"data-ownedby": a.id,
				"data-value": n,
				"data-current": Z(r),
				dir: o("dir"),
				"data-expanded": Z(u),
				"data-state": u ? "open" : "closed",
				"aria-describedby": u ? m : void 0,
				onClick(e) {
					e.defaultPrevented || h || o("closeOnClick") && i({
						type: u && n != null && !r ? "triggerValue.set" : "close",
						src: "trigger.click",
						value: n,
						triggerId: s
					});
				},
				onFocus(e) {
					e.defaultPrevented || h || No() && i({
						type: u && n != null && !r ? "triggerValue.set" : "open",
						src: "trigger.focus",
						value: n,
						triggerId: s
					});
				},
				onBlur(e) {
					e.defaultPrevented || h || c === vO.get("id") && ((e.relatedTarget ?? a.getDoc().activeElement)?.closest(qt(a.id)) ?? i({
						type: "close",
						src: "trigger.blur",
						value: n,
						triggerId: s
					}));
				},
				onPointerDown(e) {
					e.defaultPrevented || h || Fn(e) && o("closeOnPointerDown") && c === vO.get("id") && i({
						type: "close",
						src: "trigger.pointerdown",
						value: n,
						triggerId: s
					});
				},
				onPointerMove(e) {
					e.defaultPrevented || h || e.pointerType !== "touch" && i({
						type: u && n != null && !r ? "triggerValue.set" : "pointer.move",
						value: n,
						triggerId: s
					});
				},
				onPointerOver(e) {
					e.defaultPrevented || h || e.pointerType !== "touch" && i({
						type: "pointer.move",
						value: n,
						triggerId: s
					});
				},
				onPointerLeave() {
					h || i({ type: "pointer.leave" });
				},
				onPointerCancel() {
					h || i({ type: "pointer.leave" });
				}
			});
		},
		getArrowProps() {
			return t.element({
				id: fO(a),
				...lO.arrow.attrs,
				dir: o("dir"),
				style: g.arrow
			});
		},
		getArrowTipProps() {
			return t.element({
				...lO.arrowTip.attrs,
				dir: o("dir"),
				style: g.arrowTip
			});
		},
		getPositionerProps() {
			return t.element({
				id: pO(a),
				...lO.positioner.attrs,
				dir: o("dir"),
				style: g.floating
			});
		},
		getContentProps() {
			let e = vO.get("id") === c, n = vO.get("prevId") === c, r = vO.get("instant") && (u && e || n);
			return t.element({
				...lO.content.attrs,
				dir: o("dir"),
				hidden: !u,
				"data-state": u ? "open" : "closed",
				"data-instant": Z(r),
				role: l ? void 0 : "tooltip",
				id: l ? void 0 : m,
				"data-placement": f,
				"data-side": p,
				onPointerEnter() {
					i({ type: "content.pointer.move" });
				},
				onPointerLeave() {
					i({ type: "content.pointer.leave" });
				},
				style: { pointerEvents: o("interactive") ? "auto" : "none" }
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tooltip@1.43.3/node_modules/@zag-js/tooltip/dist/tooltip.machine.mjs
var { and: bO, not: xO } = On(), SO = Pn({
	initialState: ({ prop: e }) => e("open") || e("defaultOpen") ? "open" : "closed",
	props({ props: e }) {
		Re(e, ["id"]);
		let t = e.closeOnClick ?? !0, n = e.closeOnPointerDown ?? t;
		return {
			openDelay: 400,
			closeDelay: 150,
			closeOnEscape: !0,
			interactive: !1,
			closeOnScroll: !0,
			disabled: !1,
			...e,
			closeOnPointerDown: n,
			closeOnClick: t,
			positioning: {
				placement: "bottom",
				...e.positioning
			}
		};
	},
	effects: ["trackFocusVisible", "trackStore"],
	context: ({ bindable: e, prop: t, scope: n }) => ({
		currentPlacement: e(() => ({ defaultValue: void 0 })),
		hasPointerMoveOpened: e(() => ({ defaultValue: null })),
		triggerValue: e(() => ({
			defaultValue: t("defaultTriggerValue") ?? null,
			value: t("triggerValue"),
			onChange(e) {
				let r = t("onTriggerValueChange");
				r && r({
					value: e,
					triggerElement: _O(n, e)
				});
			}
		}))
	}),
	watch({ track: e, action: t, prop: n }) {
		e([() => n("disabled")], () => {
			t(["closeIfDisabled"]);
		}), e([() => n("open")], () => {
			t(["toggleVisibility"]);
		}), e([() => n("triggerValue")], () => {
			t(["repositionImmediate"]);
		});
	},
	on: { "triggerValue.set": { actions: ["setTriggerValue", "repositionImmediate"] } },
	states: {
		closed: {
			entry: ["clearGlobalId"],
			on: {
				"controlled.open": { target: "open" },
				open: [{
					guard: "isOpenControlled",
					actions: ["setTriggerValue", "invokeOnOpen"]
				}, {
					target: "open",
					actions: ["setTriggerValue", "invokeOnOpen"]
				}],
				"pointer.leave": { actions: ["clearPointerMoveOpened"] },
				"pointer.move": [{
					guard: bO("noVisibleTooltip", xO("hasPointerMoveOpened")),
					target: "opening",
					actions: ["setTriggerValue"]
				}, {
					guard: xO("hasPointerMoveOpened"),
					target: "open",
					actions: [
						"setPointerMoveOpened",
						"invokeOnOpen",
						"setTriggerValue"
					]
				}]
			}
		},
		opening: {
			effects: [
				"trackScroll",
				"trackPointerlockChange",
				"waitForOpenDelay"
			],
			on: {
				"after.openDelay": [{
					guard: "isOpenControlled",
					actions: ["setPointerMoveOpened", "invokeOnOpen"]
				}, {
					target: "open",
					actions: ["setPointerMoveOpened", "invokeOnOpen"]
				}],
				"controlled.open": { target: "open" },
				"controlled.close": { target: "closed" },
				open: [{
					guard: "isOpenControlled",
					actions: ["setTriggerValue", "invokeOnOpen"]
				}, {
					target: "open",
					actions: ["setTriggerValue", "invokeOnOpen"]
				}],
				"pointer.leave": [{
					guard: "isOpenControlled",
					actions: [
						"clearPointerMoveOpened",
						"invokeOnClose",
						"toggleVisibility"
					]
				}, {
					target: "closed",
					actions: ["clearPointerMoveOpened", "invokeOnClose"]
				}],
				close: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose", "toggleVisibility"]
				}, {
					target: "closed",
					actions: ["invokeOnClose"]
				}]
			}
		},
		open: {
			effects: [
				"trackEscapeKey",
				"trackScroll",
				"trackPointerlockChange",
				"trackPositioning"
			],
			entry: ["setGlobalId"],
			on: {
				"controlled.close": { target: "closed" },
				close: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closed",
					actions: ["invokeOnClose"]
				}],
				"pointer.leave": [
					{
						guard: "isVisible",
						target: "closing",
						actions: ["clearPointerMoveOpened"]
					},
					{
						guard: "isOpenControlled",
						actions: ["clearPointerMoveOpened", "invokeOnClose"]
					},
					{
						target: "closed",
						actions: ["clearPointerMoveOpened", "invokeOnClose"]
					}
				],
				"content.pointer.leave": {
					guard: "isInteractive",
					target: "closing"
				},
				"positioning.set": { actions: ["reposition"] },
				"triggerValue.set": {
					target: "closing",
					actions: ["setTriggerValue", "immediateReopen"]
				}
			}
		},
		closing: {
			effects: ["trackPositioning", "waitForCloseDelay"],
			on: {
				"after.closeDelay": [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closed",
					actions: ["invokeOnClose"]
				}],
				"controlled.close": { target: "closed" },
				"controlled.open": { target: "open" },
				close: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closed",
					actions: ["invokeOnClose"]
				}],
				"pointer.move": [{
					guard: "isOpenControlled",
					actions: [
						"setPointerMoveOpened",
						"setTriggerValue",
						"invokeOnOpen",
						"toggleVisibility"
					]
				}, {
					target: "open",
					actions: [
						"setPointerMoveOpened",
						"setTriggerValue",
						"invokeOnOpen"
					]
				}],
				"triggerValue.set": {
					target: "open",
					actions: ["setTriggerValue", "repositionImmediate"]
				},
				reopen: { target: "open" },
				"content.pointer.move": {
					guard: "isInteractive",
					target: "open"
				},
				"positioning.set": { actions: ["reposition"] }
			}
		}
	},
	implementations: {
		guards: {
			noVisibleTooltip: () => vO.get("id") === null,
			isVisible: ({ prop: e }) => e("id") === vO.get("id"),
			isInteractive: ({ prop: e }) => !!e("interactive"),
			hasPointerMoveOpened: ({ context: e }) => !!e.get("hasPointerMoveOpened"),
			isOpenControlled: ({ prop: e }) => e("open") !== void 0
		},
		actions: {
			setGlobalId: ({ prop: e }) => {
				let t = vO.get("id"), n = t !== null && t !== e("id");
				vO.update({
					id: e("id"),
					prevId: n ? t : null,
					instant: n
				});
			},
			clearGlobalId: ({ prop: e }) => {
				e("id") === vO.get("id") && vO.update({
					id: null,
					prevId: null,
					instant: !1
				});
			},
			invokeOnOpen: ({ prop: e }) => {
				e("onOpenChange")?.({ open: !0 });
			},
			invokeOnClose: ({ prop: e }) => {
				e("onOpenChange")?.({ open: !1 });
			},
			closeIfDisabled: ({ prop: e, send: t }) => {
				e("disabled") && t({
					type: "close",
					src: "disabled.change"
				});
			},
			reposition: ({ context: e, event: t, prop: n, scope: r }) => {
				t.type === "positioning.set" && cs(() => _O(r, e.get("triggerValue")), () => hO(r), {
					...n("positioning"),
					...t.options,
					listeners: !1,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			repositionImmediate: ({ context: e, event: t, prop: n, scope: r }) => {
				let i = t.value ?? e.get("triggerValue");
				return cs(() => _O(r, i), () => hO(r), {
					...n("positioning"),
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			toggleVisibility: ({ prop: e, event: t, send: n }) => {
				queueMicrotask(() => {
					n({
						type: e("open") ? "controlled.open" : "controlled.close",
						previousEvent: t
					});
				});
			},
			setPointerMoveOpened: ({ context: e, event: t }) => {
				let n = t.triggerId ?? t.previousEvent?.triggerId;
				e.set("hasPointerMoveOpened", n ?? null);
			},
			clearPointerMoveOpened: ({ context: e }) => {
				e.set("hasPointerMoveOpened", null);
			},
			setTriggerValue: ({ context: e, event: t }) => {
				t.value !== void 0 && e.set("triggerValue", t.value);
			},
			immediateReopen: ({ send: e }) => {
				queueMicrotask(() => {
					e({ type: "reopen" });
				});
			}
		},
		effects: {
			trackFocusVisible: ({ scope: e }) => Po({ root: e.getRootNode?.() }),
			trackPositioning: ({ context: e, prop: t, scope: n }) => (e.get("currentPlacement") || e.set("currentPlacement", t("positioning").placement), cs(() => _O(n, e.get("triggerValue")), () => hO(n), {
				...t("positioning"),
				defer: !0,
				onComplete(t) {
					e.set("currentPlacement", t.placement);
				}
			})),
			trackPointerlockChange: ({ send: e, scope: t }) => {
				let n = t.getDoc();
				return Ne(n, "pointerlockchange", () => e({
					type: "close",
					src: "pointerlock:change"
				}), !1);
			},
			trackScroll: ({ send: e, prop: t, scope: n, context: r }) => {
				if (!t("closeOnScroll")) return;
				let i = _O(n, r.get("triggerValue"));
				if (!i) return;
				let a = xa(i).map((t) => Ne(t, "scroll", () => {
					e({
						type: "close",
						src: "scroll"
					});
				}, {
					passive: !0,
					capture: !0
				}));
				return () => {
					a.forEach((e) => e?.());
				};
			},
			trackStore: ({ prop: e, send: t }) => {
				let n;
				return queueMicrotask(() => {
					n = vO.subscribe(() => {
						vO.get("id") !== e("id") && t({
							type: "close",
							src: "id.change"
						});
					});
				}), () => n?.();
			},
			trackEscapeKey: ({ send: e, prop: t }) => t("closeOnEscape") ? Ne(document, "keydown", (t) => {
				Ye(t) || t.key === "Escape" && (t.stopPropagation(), e({
					type: "close",
					src: "keydown.escape"
				}));
			}, !0) : void 0,
			waitForOpenDelay: ({ send: e, prop: t, event: n }) => {
				let r = setTimeout(() => {
					e({
						type: "after.openDelay",
						previousEvent: n
					});
				}, t("openDelay"));
				return () => clearTimeout(r);
			},
			waitForCloseDelay: ({ send: e, prop: t, event: n }) => {
				let r = setTimeout(() => {
					e({
						type: "after.closeDelay",
						previousEvent: n
					});
				}, t("closeDelay"));
				return () => clearTimeout(r);
			}
		}
	}
}), CO = (e) => {
	let t = Nt(), n = gn(), r = _(() => {
		let r = St(e);
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = Tn(SO, () => z(r)), a = _(() => yO(i, Wt));
	return () => z(a);
}, wO = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open"
]);
function TO(e, t) {
	let n = m();
	O(t, !0);
	let r = R(t, "open", 15), i = q(t, wO), a = _(() => no(i)), o = _(() => C(z(a), 2)), s = _(() => z(o)[0]), c = _(() => z(o)[1]), l = _(() => z(c).children), u = _(() => A(z(c), ["children"])), d = _(() => ({
		...z(u),
		id: n,
		onOpenChange(e) {
			z(u).onOpenChange?.(e), r() !== void 0 && r(e.open);
		}
	})), f = CO(() => z(d)), p = _(() => ({
		...z(s),
		present: f().open
	})), h = to(() => z(p));
	nO(f), ro(h);
	var g = {
		get open() {
			return r();
		},
		set open(e) {
			r(e), M();
		}
	}, v = F(), ee = K(v);
	return ye(ee, () => z(l) ?? b), I(e, v), y(g);
}
U(TO, { open: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/tooltip-trigger.svelte
var EO = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function DO(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, EO), i = _(() => yn()(r, ["value"])), a = _(() => C(z(i), 2)), o = _(() => z(a)[0]), s = _(() => z(a)[1]), c = rO(), l = _(() => X(c().getTriggerProps(z(o)), z(s)));
	return Q(e, Y({ as: "button" }, () => z(l), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(DO, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Tooltip.svelte
var OO = L("<span><!></span>"), kO = L("<!> <!>", 1), AO = {
	hash: "svelte-1cq81kb",
	code: ":host {display:inline-block;}[part='anchor'].svelte-1cq81kb {display:block;}[data-scope='tooltip'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='tooltip'][data-part='content'] {width:fit-content;max-width:280px;padding:6px 12px;border:0 solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:var(--k-fg);color:var(--k-bg);box-shadow:none;font-size:12px;line-height:16px;text-wrap:balance;overflow-wrap:anywhere;}"
};
function jO(e, n) {
	O(n, !0), ee(e, AO);
	let r = R(n, "text", 7, ""), i = n.$$host, a = B(!1), o = B(null), c = !1;
	Te(() => s(z(o), z(a), i));
	let l = (e) => (t) => me(t, "keydown", (t) => {
		t.key === "Escape" && e().open && e().setOpen(!1);
	});
	function u(e) {
		let t = c;
		c = !1, t || e().setOpen(!0);
	}
	function d(e, t, n) {
		let r = t.relatedTarget;
		r && (i.contains(r) || n instanceof Node && n.contains(r)) || e().setOpen(!1);
	}
	var f = {
		get text() {
			return r();
		},
		set text(e = "") {
			r(e), M();
		}
	}, p = F(), m = K(p), h = (e) => {
		var s = kO(), f = K(s);
		t(f, {});
		var p = W(f, 2);
		Yt(p, {
			value: () => i.shadowRoot,
			children: (e, t) => {
				var i = F(), s = K(i);
				E(s, () => TO, (e, t) => {
					t(e, {
						openDelay: 300,
						closeDelay: 0,
						closeOnEscape: !1,
						positioning: { strategy: "fixed" },
						get open() {
							return z(a);
						},
						set open(e) {
							J(a, e, !0);
						},
						children: (e, t) => {
							var i = kO(), a = K(i);
							{
								let e = (e, t = b) => {
									var r = F(), i = K(r);
									{
										let e = (e, r = b) => {
											var i = OO();
											g(i, (e) => ({
												part: "anchor",
												...e
											}), [() => r()()], void 0, void 0, "svelte-1cq81kb");
											var a = H(i);
											oe(a, n, "default", {}, null), D(i), k(i, () => l(t())), I(e, i);
										};
										E(i, () => DO, (n, r) => {
											r(n, {
												onfocusin: () => u(t()),
												onfocusout: (e) => d(t(), e, e.currentTarget),
												onpointerdown: () => c = !0,
												onpointerleave: () => c = !1,
												asChild: e,
												$$slots: { asChild: !0 }
											});
										});
									}
									I(e, r);
								};
								E(a, () => oO, (t, n) => {
									n(t, {
										render: e,
										$$slots: { render: !0 }
									});
								});
							}
							var s = W(a, 2);
							E(s, () => cO, (e, t) => {
								t(e, {
									popover: "manual",
									class: "af-kit",
									get ref() {
										return z(o);
									},
									set ref(e) {
										J(o, e, !0);
									},
									children: (e, t) => {
										var n = F(), i = K(n);
										E(i, () => aO, (e, t) => {
											t(e, {
												class: "af-overlay tooltip",
												children: (e, t) => {
													ne();
													var n = fe();
													G(() => w(n, r())), I(e, n);
												},
												$$slots: { default: !0 }
											});
										}), I(e, n);
									},
									$$slots: { default: !0 }
								});
							}), I(e, i);
						},
						$$slots: { default: !0 }
					});
				}), I(e, i);
			},
			$$slots: { default: !0 }
		}), I(e, s);
	}, _ = (e) => {
		var t = F(), r = K(t);
		oe(r, n, "default", {}, null), I(e, t);
	};
	return P(m, (e) => {
		r() ? e(h) : e(_, -1);
	}), I(e, p), y(f);
}
U(jO, {
	text: {
		attribute: "text",
		type: "String"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, ["default"], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/collapsible/use-collapsible-context.js
var [MO, NO] = Rt({ name: "CollapsibleContext" }), PO = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function FO(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, PO), i = NO(), a = _(() => X(i().getContentProps(), r));
	var o = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	}, s = F(), c = K(s), l = (e) => {
		Q(e, Y({ as: "div" }, () => z(a), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, u = _(() => !i().isUnmounted);
	return P(c, (e) => {
		z(u) && e(l);
	}), I(e, s), y(o);
}
U(FO, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/collapsible/split-collapsible-props.svelte.js
var IO = yn(), LO = (e) => IO(e, [
	"collapsedHeight",
	"collapsedWidth",
	"defaultOpen",
	"disabled",
	"id",
	"ids",
	"lazyMount",
	"onExitComplete",
	"onOpenChange",
	"open",
	"unmountOnExit"
]), RO = ln("collapsible").parts("root", "trigger", "content", "indicator").build(), zO = (e) => e.ids?.root ?? `collapsible:${e.id}`, BO = (e) => e.ids?.content ?? `collapsible:${e.id}:content`, VO = (e) => e.ids?.trigger ?? `collapsible:${e.id}:trigger`, HO = (e) => e.getById(BO(e));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+collapsible@1.43.3/node_modules/@zag-js/collapsible/dist/collapsible.connect.mjs
function UO(e, t) {
	let { state: n, send: r, context: i, scope: a, prop: o } = e, s = n.matches("open") || n.matches("closing"), c = n.matches("open"), l = n.matches("closed"), { width: u, height: d } = i.get("size"), f = !!o("disabled"), p = o("collapsedHeight"), m = o("collapsedWidth"), h = p != null, g = m != null, _ = h || g, v = !i.get("initial") && c;
	return {
		disabled: f,
		visible: s,
		open: c,
		measureSize() {
			r({ type: "size.measure" });
		},
		setOpen(e) {
			n.matches("open") !== e && r({ type: e ? "open" : "close" });
		},
		getRootProps() {
			return t.element({
				...RO.root.attrs,
				"data-state": c ? "open" : "closed",
				dir: o("dir"),
				id: zO(a)
			});
		},
		getContentProps() {
			return t.element({
				...RO.content.attrs,
				id: BO(a),
				"data-collapsible": "",
				"data-state": v ? void 0 : c ? "open" : "closed",
				"data-disabled": Z(f),
				"data-has-collapsed-size": Z(_),
				hidden: !s && !_,
				dir: o("dir"),
				style: {
					"--height": ut(d),
					"--width": ut(u),
					"--collapsed-height": ut(p),
					"--collapsed-width": ut(m),
					...l && h && {
						overflow: "hidden",
						minHeight: ut(p),
						maxHeight: ut(p)
					},
					...l && g && {
						overflow: "hidden",
						minWidth: ut(m),
						maxWidth: ut(m)
					}
				}
			});
		},
		getTriggerProps() {
			return t.element({
				...RO.trigger.attrs,
				id: VO(a),
				dir: o("dir"),
				type: "button",
				"data-state": c ? "open" : "closed",
				"data-disabled": Z(f),
				"aria-controls": BO(a),
				"aria-expanded": s || !1,
				onClick(e) {
					e.defaultPrevented || f || r({ type: c ? "close" : "open" });
				}
			});
		},
		getIndicatorProps() {
			return t.element({
				...RO.indicator.attrs,
				dir: o("dir"),
				"data-state": c ? "open" : "closed",
				"data-disabled": Z(f)
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+collapsible@1.43.3/node_modules/@zag-js/collapsible/dist/collapsible.machine.mjs
var WO = Pn({
	initialState({ prop: e }) {
		return e("open") || e("defaultOpen") ? "open" : "closed";
	},
	context({ bindable: e }) {
		return {
			size: e(() => ({
				defaultValue: {
					height: 0,
					width: 0
				},
				sync: !0
			})),
			initial: e(() => ({ defaultValue: !1 }))
		};
	},
	refs() {
		return {
			cleanup: void 0,
			stylesRef: void 0
		};
	},
	watch({ track: e, prop: t, action: n }) {
		e([() => t("open")], () => {
			n([
				"setInitial",
				"computeSize",
				"toggleVisibility"
			]);
		});
	},
	exit: ["cleanupNode"],
	states: {
		closed: {
			effects: ["trackTabbableElements"],
			on: {
				"controlled.open": { target: "open" },
				open: [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"setInitial",
						"computeSize",
						"invokeOnOpen"
					]
				}]
			}
		},
		closing: {
			effects: ["trackExitAnimation"],
			on: {
				"controlled.close": { target: "closed" },
				"controlled.open": { target: "open" },
				open: [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: ["setInitial", "invokeOnOpen"]
				}],
				close: [{
					guard: "isOpenControlled",
					actions: ["invokeOnExitComplete"]
				}, {
					target: "closed",
					actions: [
						"setInitial",
						"computeSize",
						"invokeOnExitComplete"
					]
				}],
				"animation.end": {
					target: "closed",
					actions: ["invokeOnExitComplete", "clearInitial"]
				}
			}
		},
		open: {
			effects: ["trackEnterAnimation"],
			on: {
				"controlled.close": { target: "closing" },
				close: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closing",
					actions: [
						"setInitial",
						"computeSize",
						"invokeOnClose"
					]
				}],
				"size.measure": { actions: ["measureSize"] },
				"animation.end": { actions: ["clearInitial"] }
			}
		}
	},
	implementations: {
		guards: { isOpenControlled: ({ prop: e }) => e("open") != null },
		effects: {
			trackEnterAnimation: ({ send: e, scope: t }) => {
				let n, r = en(() => {
					let r = HO(t);
					if (!r) return;
					let i = Tt(r).animationName;
					if (!i || i === "none") {
						e({ type: "animation.end" });
						return;
					}
					let a = (t) => {
						lt(t) === r && e({ type: "animation.end" });
					};
					r.addEventListener("animationend", a), n = () => {
						r.removeEventListener("animationend", a);
					};
				});
				return () => {
					r(), n?.();
				};
			},
			trackExitAnimation: ({ send: e, scope: t }) => {
				let n, r = en(() => {
					let r = HO(t);
					if (!r) return;
					let i = Tt(r).animationName;
					if (!i || i === "none") {
						e({ type: "animation.end" });
						return;
					}
					let a = (t) => {
						lt(t) === r && e({ type: "animation.end" });
					};
					r.addEventListener("animationend", a);
					let o = rn(r, { animationFillMode: "forwards" });
					n = () => {
						r.removeEventListener("animationend", a), ze(() => o());
					};
				});
				return () => {
					r(), n?.();
				};
			},
			trackTabbableElements: ({ scope: e, prop: t }) => {
				if (!t("collapsedHeight") && !t("collapsedWidth")) return;
				let n = HO(e);
				if (!n) return;
				let r = () => {
					let e = la(n).map((e) => fn(e, "inert", ""));
					return () => {
						e.forEach((e) => e());
					};
				}, i = r(), a = va(n, { callback() {
					i(), i = r();
				} });
				return () => {
					i(), a();
				};
			}
		},
		actions: {
			setInitial: ({ context: e, flush: t }) => {
				t(() => {
					e.set("initial", !0);
				});
			},
			clearInitial: ({ context: e }) => {
				e.set("initial", !1);
			},
			cleanupNode: ({ refs: e }) => {
				e.set("stylesRef", null);
			},
			measureSize: ({ context: e, scope: t }) => {
				let n = HO(t);
				if (!n) return;
				let { height: r, width: i } = n.getBoundingClientRect();
				e.set("size", {
					height: r,
					width: i
				});
			},
			computeSize: ({ refs: e, scope: t, context: n }) => {
				e.get("cleanup")?.();
				let r = en(() => {
					let e = HO(t);
					if (!e) return;
					let r = e.hidden;
					e.style.animationName = "none", e.style.animationDuration = "0s", e.hidden = !1;
					let i = e.getBoundingClientRect();
					n.set("size", {
						height: i.height,
						width: i.width
					}), n.get("initial") && (e.style.animationName = "", e.style.animationDuration = ""), e.hidden = r;
				});
				e.set("cleanup", r);
			},
			invokeOnOpen: ({ prop: e }) => {
				e("onOpenChange")?.({ open: !0 });
			},
			invokeOnClose: ({ prop: e }) => {
				e("onOpenChange")?.({ open: !1 });
			},
			invokeOnExitComplete: ({ prop: e }) => {
				e("onExitComplete")?.();
			},
			toggleVisibility: ({ prop: e, send: t }) => {
				t({ type: e("open") ? "controlled.open" : "controlled.close" });
			}
		}
	}
}), GO = (e) => {
	let t = Nt(), n = gn(), r = B(!1), i = _(() => {
		let { lazyMount: r, unmountOnExit: i, onExitComplete: a, ...o } = St(e) || {};
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...o
		};
	}), a = Tn(WO, () => z(i)), o = _(() => UO(a, Wt)), s = _(() => St(e));
	Te(() => {
		z(o).visible && J(r, !0);
	});
	let c = _(() => {
		let { lazyMount: e, unmountOnExit: t } = z(s) || {};
		return !z(o).visible && !z(r) && e || t && !z(o).visible && z(r);
	});
	return () => ({
		...z(o),
		isUnmounted: !!z(c)
	});
}, KO = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"open"
]);
function qO(e, t) {
	let n = m();
	O(t, !0);
	let r = R(t, "ref", 15, null), i = R(t, "open", 15), a = q(t, KO), o = _(() => LO(a)), s = _(() => C(z(o), 2)), c = _(() => z(s)[0]), l = _(() => z(s)[1]), u = _(() => ({
		...z(c),
		id: z(c).id ?? n,
		open: i(),
		onOpenChange(e) {
			z(c).onOpenChange?.(e), i() !== void 0 && i(e.open);
		}
	})), d = GO(() => z(u)), f = _(() => X(d().getRootProps(), z(l)));
	return MO(d), Q(e, Y({ as: "div" }, () => z(f), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), y({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), M();
		},
		get open() {
			return i();
		},
		set open(e) {
			i(e), M();
		}
	});
}
U(qO, {
	ref: {},
	open: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/use-tree-view-context.js
var [JO, YO] = Rt({
	name: "TreeViewContext",
	hookName: "useTreeViewContext",
	providerName: "<TreeViewProvider />"
}), [XO, ZO] = Rt({
	name: "TreeViewNodeContext",
	hookName: "useTreeViewNodeContext",
	providerName: "<TreeViewNodeProvider />"
}), [QO, $O] = Rt({
	name: "TreeViewNodePropsContext",
	hookName: "useTreeViewNodePropsContext",
	providerName: "<TreeViewNodePropsProvider />"
}), ek = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function tk(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, ek), i = YO(), a = $O(), o = ZO(), s = Ya(), c = _(() => X(i().getBranchProps(a()), r)), l = _(() => i().getBranchContentProps(a()));
	var u = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	}, d = F(), f = K(d);
	{
		let e = _(() => o().expanded), t = _(() => ({ content: z(l).id })), r = _(s);
		E(f, () => qO, (i, a) => {
			a(i, Y({
				get open() {
					return z(e);
				},
				get ids() {
					return z(t);
				}
			}, () => z(r), () => z(c), {
				get ref() {
					return n();
				},
				set ref(e) {
					n(e);
				}
			}));
		});
	}
	return I(e, d), y(u);
}
U(tk, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/tree-view-branch-content.svelte
var nk = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function rk(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, nk), i = YO(), a = $O(), o = _(() => i().getBranchContentProps(a())), s = _(yn), c = _(() => z(s)(z(o), ["hidden", "data-state"])), l = _(() => C(z(c), 2)), u = _(() => z(l)[1]), d = _(() => X(z(u), r));
	var f = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	}, p = F(), m = K(p);
	return E(m, () => FO, (e, t) => {
		t(e, Y(() => z(d), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}), I(e, p), y(f);
}
U(rk, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/tree-view-branch-control.svelte
var ik = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function ak(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, ik), i = YO(), a = $O(), o = _(() => X(i().getBranchControlProps(a()), r));
	return Q(e, Y({ as: "div" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(ak, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/tree-view-branch-trigger.svelte
var ok = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function sk(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, ok), i = YO(), a = $O(), o = _(() => X(i().getBranchTriggerProps(a()), r));
	return Q(e, Y({ as: "button" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(sk, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/tree-view-item.svelte
var ck = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function lk(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, ck), i = YO(), a = $O(), o = _(() => X(i().getItemProps(a()), r));
	return Q(e, Y({ as: "li" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(lk, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/tree-view-node-provider.svelte
function uk(e, t) {
	O(t, !0);
	let n = R(t, "node", 7), r = R(t, "indexPath", 7), i = R(t, "children", 7), a = YO(), o = _(() => ({
		node: n(),
		indexPath: r()
	})), s = _(() => a().getNodeState(z(o)));
	XO(() => z(s)), QO(() => z(o));
	var c = {
		get node() {
			return n();
		},
		set node(e) {
			n(e), M();
		},
		get indexPath() {
			return r();
		},
		set indexPath(e) {
			r(e), M();
		},
		get children() {
			return i();
		},
		set children(e) {
			i(e), M();
		}
	}, l = F(), u = K(l);
	return ye(u, () => i() ?? b), I(e, l), y(c);
}
U(uk, {
	node: {},
	indexPath: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/tree-view-split-props.js
var dk = yn();
function fk(e) {
	return dk(e, /* @__PURE__ */ "canRename.checkedValue.collection.defaultCheckedValue.defaultExpandedValue.defaultFocusedValue.defaultSelectedValue.expandedValue.expandOnClick.focusedValue.id.ids.loadChildren.onBeforeRename.onCheckedChange.onExpandedChange.onFocusChange.onLoadChildrenComplete.onLoadChildrenError.onRenameComplete.onRenameStart.onSelectionChange.selectedValue.selectionMode.translations.typeahead.scrollToIndexFn".split("."));
}
var pk = ln("tree-view").parts("branch", "branchContent", "branchControl", "branchIndentGuide", "branchIndicator", "branchText", "branchTrigger", "item", "itemIndicator", "itemText", "label", "nodeCheckbox", "nodeRenameInput", "root", "tree").build(), mk = (e) => new wi(e);
mk.empty = () => new wi({ rootNode: { children: [] } });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tree-view@1.43.3/node_modules/@zag-js/tree-view/dist/tree-view.dom.mjs
var hk = (e) => e.ids?.root ?? `tree:${e.id}:root`, gk = (e) => e.ids?.label ?? `tree:${e.id}:label`, _k = (e, t) => e.ids?.node?.(t) ?? `tree:${e.id}:node:${t}`, vk = (e) => e.ids?.tree ?? `tree:${e.id}:tree`, yk = (e, t) => {
	t != null && e.getById(_k(e, t))?.focus();
}, bk = (e, t) => `tree:${e.id}:rename-input:${t}`, xk = (e, t) => e.getById(bk(e, t));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tree-view@1.43.3/node_modules/@zag-js/tree-view/dist/utils/checked-state.mjs
function Sk(e, t, n) {
	let r = e.getNodeValue(t);
	if (!e.isBranchNode(t)) return n.includes(r);
	let i = e.getDescendantValues(r), a = i.every((e) => n.includes(e)), o = i.some((e) => n.includes(e));
	return a ? !0 : o ? "indeterminate" : !1;
}
function Ck(e, t, n) {
	let r = e.getDescendantValues(t), i = r.every((e) => n.includes(e));
	return zt(i ? un(n, ...r) : Et(n, ...r));
}
function wk(e, t) {
	let n = /* @__PURE__ */ new Map();
	return e.visit({ onEnter: (r) => {
		let i = e.getNodeValue(r), a = e.isBranchNode(r), o = Sk(e, r, t);
		n.set(i, {
			type: a ? "branch" : "leaf",
			checked: o
		});
	} }), n;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tree-view@1.43.3/node_modules/@zag-js/tree-view/dist/tree-view.connect.mjs
var Tk = {
	treeLabel: "Tree View",
	renameInputLabel: "Rename tree item"
};
function Ek(e, t) {
	let { context: n, scope: r, computed: i, prop: a, send: o } = e, s = a("collection"), c = He(Tk, a("translations")), l = Array.from(n.get("expandedValue")), u = Array.from(n.get("selectedValue")), d = Array.from(n.get("checkedValue")), f = i("isTypingAhead"), p = n.get("focusedValue"), m = n.get("loadingStatus"), h = n.get("renamingValue"), g = s.getFirstNode(void 0, { skip: ({ indexPath: e }) => s.getValuePath(e).slice(0, -1).some((e) => !l.includes(e)) }), _ = g ? s.getNodeValue(g) : null;
	function v(e) {
		let { node: t, indexPath: n } = e, i = s.getNodeValue(t);
		return {
			id: _k(r, i),
			value: i,
			indexPath: n,
			valuePath: s.getValuePath(n),
			disabled: !!t.disabled,
			focused: p == null ? _ === i : p === i,
			selected: u.includes(i),
			expanded: l.includes(i),
			loading: m[i] === "loading",
			depth: n.length,
			isBranch: s.isBranchNode(t),
			renaming: h === i,
			get checked() {
				return Sk(s, t, d);
			}
		};
	}
	return {
		collection: s,
		expandedValue: l,
		selectedValue: u,
		checkedValue: d,
		toggleChecked(e, t) {
			o({
				type: "CHECKED.TOGGLE",
				value: e,
				isBranch: t
			});
		},
		setChecked(e) {
			o({
				type: "CHECKED.SET",
				value: e
			});
		},
		clearChecked() {
			o({ type: "CHECKED.CLEAR" });
		},
		getCheckedMap() {
			return wk(s, d);
		},
		expand(e) {
			o({
				type: e ? "BRANCH.EXPAND" : "EXPANDED.ALL",
				value: e
			});
		},
		collapse(e) {
			o({
				type: e ? "BRANCH.COLLAPSE" : "EXPANDED.CLEAR",
				value: e
			});
		},
		deselect(e) {
			o({
				type: e ? "NODE.DESELECT" : "SELECTED.CLEAR",
				value: e
			});
		},
		select(e) {
			o({
				type: e ? "NODE.SELECT" : "SELECTED.ALL",
				value: e,
				isTrusted: !1
			});
		},
		getVisibleNodes() {
			return i("visibleNodes");
		},
		focus(e) {
			yk(r, e);
		},
		selectParent(e) {
			let t = s.getParentNode(e);
			if (!t) return;
			let n = Et(u, s.getNodeValue(t));
			o({
				type: "SELECTED.SET",
				value: n,
				src: "select.parent"
			});
		},
		expandParent(e) {
			let t = s.getParentNode(e);
			if (!t) return;
			let n = Et(l, s.getNodeValue(t));
			o({
				type: "EXPANDED.SET",
				value: n,
				src: "expand.parent"
			});
		},
		setExpandedValue(e) {
			let t = zt(e);
			o({
				type: "EXPANDED.SET",
				value: t
			});
		},
		setSelectedValue(e) {
			let t = zt(e);
			o({
				type: "SELECTED.SET",
				value: t
			});
		},
		startRenaming(e) {
			o({
				type: "NODE.RENAME",
				value: e
			});
		},
		submitRenaming(e, t) {
			o({
				type: "RENAME.SUBMIT",
				value: e,
				label: t
			});
		},
		cancelRenaming() {
			o({ type: "RENAME.CANCEL" });
		},
		getRootProps() {
			return t.element({
				...pk.root.attrs,
				id: hk(r),
				dir: a("dir")
			});
		},
		getLabelProps() {
			return t.element({
				...pk.label.attrs,
				id: gk(r),
				dir: a("dir")
			});
		},
		getTreeProps() {
			return t.element({
				...pk.tree.attrs,
				id: vk(r),
				dir: a("dir"),
				role: "tree",
				"aria-label": c.treeLabel,
				"aria-labelledby": gk(r),
				"aria-multiselectable": a("selectionMode") === "multiple" || void 0,
				tabIndex: -1,
				onKeyDown(e) {
					if (e.defaultPrevented || Ye(e)) return;
					let t = lt(e);
					if (dn(t)) return;
					let n = t?.closest("[data-part=branch-control], [data-part=item]");
					if (!n) return;
					let r = n.dataset.value;
					if (r == null) {
						console.warn("[zag-js/tree-view] Node id not found for node", n);
						return;
					}
					let i = n.matches("[data-part=branch-control]"), c = {
						ArrowDown(e) {
							Fe(e) || (e.preventDefault(), o({
								type: "NODE.ARROW_DOWN",
								id: r,
								shiftKey: e.shiftKey
							}));
						},
						ArrowUp(e) {
							Fe(e) || (e.preventDefault(), o({
								type: "NODE.ARROW_UP",
								id: r,
								shiftKey: e.shiftKey
							}));
						},
						ArrowLeft(e) {
							Fe(e) || n.dataset.disabled || (e.preventDefault(), o({
								type: i ? "BRANCH_NODE.ARROW_LEFT" : "NODE.ARROW_LEFT",
								id: r
							}));
						},
						ArrowRight(e) {
							i && !n.dataset.disabled && (e.preventDefault(), o({
								type: "BRANCH_NODE.ARROW_RIGHT",
								id: r
							}));
						},
						Home(e) {
							Fe(e) || (e.preventDefault(), o({
								type: "NODE.HOME",
								id: r,
								shiftKey: e.shiftKey
							}));
						},
						End(e) {
							Fe(e) || (e.preventDefault(), o({
								type: "NODE.END",
								id: r,
								shiftKey: e.shiftKey
							}));
						},
						Space(e) {
							n.dataset.disabled || (f ? o({
								type: "TREE.TYPEAHEAD",
								key: e.key
							}) : c.Enter?.(e));
						},
						Enter(e) {
							n.dataset.disabled || Zt(t) && Fe(e) || (o({
								type: i ? "BRANCH_NODE.CLICK" : "NODE.CLICK",
								id: r,
								src: "keyboard"
							}), Zt(t) || e.preventDefault());
						},
						"*"(e) {
							n.dataset.disabled || (e.preventDefault(), o({
								type: "SIBLINGS.EXPAND",
								id: r
							}));
						},
						a(e) {
							e.metaKey && !n.dataset.disabled && (e.preventDefault(), o({
								type: "SELECTED.ALL",
								moveFocus: !0
							}));
						},
						F2(e) {
							if (n.dataset.disabled) return;
							let t = a("canRename");
							if (!t) return;
							let i = s.getIndexPath(r);
							if (i) {
								let e = s.at(i);
								if (e && !t(e, i)) return;
							}
							e.preventDefault(), o({
								type: "NODE.RENAME",
								value: r
							});
						}
					}, l = c[Qt(e, { dir: a("dir") })];
					if (l) {
						l(e);
						return;
					}
					Ba.isValidEvent(e) && (o({
						type: "TREE.TYPEAHEAD",
						key: e.key,
						id: r
					}), e.preventDefault());
				}
			});
		},
		getNodeState: v,
		getItemProps(e) {
			let n = v(e);
			return t.element({
				...pk.item.attrs,
				id: n.id,
				dir: a("dir"),
				"data-ownedby": vk(r),
				"data-path": e.indexPath.join("/"),
				"data-value": n.value,
				tabIndex: n.focused ? 0 : -1,
				"data-focus": Z(n.focused),
				role: "treeitem",
				"aria-current": n.selected ? "true" : void 0,
				"aria-selected": n.disabled ? void 0 : n.selected,
				"data-selected": Z(n.selected),
				"aria-disabled": pn(n.disabled),
				"data-disabled": Z(n.disabled),
				"data-renaming": Z(n.renaming),
				"data-checked": Z(n.checked === !0),
				"data-indeterminate": Z(n.checked === "indeterminate"),
				"aria-level": n.depth,
				"data-depth": n.depth,
				style: { "--depth": n.depth },
				onFocus(e) {
					e.stopPropagation(), o({
						type: "NODE.FOCUS",
						id: n.value
					});
				},
				onClick(e) {
					if (n.disabled || !Fn(e) || Zt(e.currentTarget) && Fe(e)) return;
					let t = e.metaKey || e.ctrlKey;
					o({
						type: "NODE.CLICK",
						id: n.value,
						shiftKey: e.shiftKey,
						ctrlKey: t
					}), e.stopPropagation(), Zt(e.currentTarget) || e.preventDefault();
				}
			});
		},
		getItemTextProps(e) {
			let n = v(e);
			return t.element({
				...pk.itemText.attrs,
				"data-disabled": Z(n.disabled),
				"data-selected": Z(n.selected),
				"data-focus": Z(n.focused)
			});
		},
		getItemIndicatorProps(e) {
			let n = v(e);
			return t.element({
				...pk.itemIndicator.attrs,
				"aria-hidden": !0,
				"data-disabled": Z(n.disabled),
				"data-selected": Z(n.selected),
				"data-focus": Z(n.focused),
				hidden: !n.selected
			});
		},
		getBranchProps(e) {
			let n = v(e);
			return t.element({
				...pk.branch.attrs,
				"data-depth": n.depth,
				dir: a("dir"),
				"data-branch": n.value,
				role: "treeitem",
				"data-ownedby": vk(r),
				"data-value": n.value,
				"aria-level": n.depth,
				"aria-selected": n.disabled ? void 0 : n.selected,
				"data-path": e.indexPath.join("/"),
				"data-selected": Z(n.selected),
				"aria-expanded": n.expanded,
				"data-state": n.expanded ? "open" : "closed",
				"aria-disabled": pn(n.disabled),
				"data-disabled": Z(n.disabled),
				"data-loading": Z(n.loading),
				"aria-busy": pn(n.loading),
				style: { "--depth": n.depth }
			});
		},
		getBranchIndicatorProps(e) {
			let n = v(e);
			return t.element({
				...pk.branchIndicator.attrs,
				"aria-hidden": !0,
				"data-state": n.expanded ? "open" : "closed",
				"data-disabled": Z(n.disabled),
				"data-selected": Z(n.selected),
				"data-focus": Z(n.focused),
				"data-loading": Z(n.loading)
			});
		},
		getBranchTriggerProps(e) {
			let n = v(e);
			return t.element({
				...pk.branchTrigger.attrs,
				role: "button",
				dir: a("dir"),
				"data-disabled": Z(n.disabled),
				"data-state": n.expanded ? "open" : "closed",
				"data-value": n.value,
				"data-loading": Z(n.loading),
				disabled: n.loading,
				onClick(e) {
					n.disabled || n.loading || (o({
						type: "BRANCH_TOGGLE.CLICK",
						id: n.value
					}), e.stopPropagation());
				}
			});
		},
		getBranchControlProps(e) {
			let n = v(e);
			return t.element({
				...pk.branchControl.attrs,
				role: "button",
				id: n.id,
				dir: a("dir"),
				tabIndex: n.focused ? 0 : -1,
				"data-path": e.indexPath.join("/"),
				"data-state": n.expanded ? "open" : "closed",
				"data-disabled": Z(n.disabled),
				"data-selected": Z(n.selected),
				"data-focus": Z(n.focused),
				"data-renaming": Z(n.renaming),
				"data-checked": Z(n.checked === !0),
				"data-indeterminate": Z(n.checked === "indeterminate"),
				"data-value": n.value,
				"data-depth": n.depth,
				"data-loading": Z(n.loading),
				"aria-busy": pn(n.loading),
				onFocus(e) {
					o({
						type: "NODE.FOCUS",
						id: n.value
					}), e.stopPropagation();
				},
				onClick(e) {
					if (n.disabled || n.loading || !Fn(e) || Zt(e.currentTarget) && Fe(e)) return;
					let t = e.metaKey || e.ctrlKey;
					o({
						type: "BRANCH_NODE.CLICK",
						id: n.value,
						shiftKey: e.shiftKey,
						ctrlKey: t
					}), e.stopPropagation();
				}
			});
		},
		getBranchTextProps(e) {
			let n = v(e);
			return t.element({
				...pk.branchText.attrs,
				dir: a("dir"),
				"data-disabled": Z(n.disabled),
				"data-state": n.expanded ? "open" : "closed",
				"data-loading": Z(n.loading)
			});
		},
		getBranchContentProps(e) {
			let n = v(e);
			return t.element({
				...pk.branchContent.attrs,
				role: "group",
				dir: a("dir"),
				"data-state": n.expanded ? "open" : "closed",
				"data-depth": n.depth,
				"data-path": e.indexPath.join("/"),
				"data-value": n.value,
				hidden: !n.expanded
			});
		},
		getBranchIndentGuideProps(e) {
			let n = v(e);
			return t.element({
				...pk.branchIndentGuide.attrs,
				"data-depth": n.depth
			});
		},
		getNodeCheckboxProps(e) {
			let n = v(e), r = n.checked;
			return t.element({
				...pk.nodeCheckbox.attrs,
				tabIndex: -1,
				role: "checkbox",
				"data-state": r === !0 ? "checked" : r === !1 ? "unchecked" : "indeterminate",
				"aria-checked": r === !0 ? "true" : r === !1 ? "false" : "mixed",
				"data-disabled": Z(n.disabled),
				onClick(e) {
					e.defaultPrevented || n.disabled || Fn(e) && (o({
						type: "CHECKED.TOGGLE",
						value: n.value,
						isBranch: n.isBranch
					}), e.stopPropagation(), e.currentTarget.closest("[role=treeitem]")?.focus({ preventScroll: !0 }));
				}
			});
		},
		getNodeRenameInputProps(e) {
			let n = v(e);
			return t.input({
				...pk.nodeRenameInput.attrs,
				id: bk(r, n.value),
				type: "text",
				"aria-label": c.renameInputLabel,
				hidden: !n.renaming,
				onKeyDown(e) {
					Ye(e) || (e.key === "Escape" && (o({ type: "RENAME.CANCEL" }), e.preventDefault()), e.key === "Enter" && (o({
						type: "RENAME.SUBMIT",
						label: e.currentTarget.value
					}), e.preventDefault()), e.stopPropagation());
				},
				onBlur(e) {
					o({
						type: "RENAME.SUBMIT",
						label: e.currentTarget.value
					});
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tree-view@1.43.3/node_modules/@zag-js/tree-view/dist/utils/expand-branch.mjs
function Dk(e, t) {
	let { context: n, prop: r, refs: i } = e;
	if (!r("loadChildren")) {
		n.set("expandedValue", (e) => zt(Et(e, ...t)));
		return;
	}
	let a = n.get("loadingStatus"), [o, s] = Xt(t, (e) => a[e] === "loaded");
	if (o.length > 0 && n.set("expandedValue", (e) => zt(Et(e, ...o))), s.length === 0) return;
	let c = r("collection"), [l, u] = Xt(s, (e) => {
		let t = c.findNode(e);
		return c.getNodeChildren(t).length > 0;
	});
	if (l.length > 0 && n.set("expandedValue", (e) => zt(Et(e, ...l))), u.length === 0) return;
	n.set("loadingStatus", (e) => ({
		...e,
		...u.reduce((e, t) => ({
			...e,
			[t]: "loading"
		}), {})
	}));
	let d = u.map((e) => {
		let t = c.getIndexPath(e);
		return {
			id: e,
			indexPath: t,
			valuePath: c.getValuePath(t),
			node: c.findNode(e)
		};
	}), f = i.get("pendingAborts"), p = r("loadChildren");
	gt(p, () => "[zag-js/tree-view] `loadChildren` is required for async expansion");
	let m = d.map(({ id: e, indexPath: t, valuePath: n, node: r }) => {
		let i = f.get(e);
		i && (i.abort(), f.delete(e));
		let a = new AbortController();
		return f.set(e, a), p({
			valuePath: n,
			indexPath: t,
			node: r,
			signal: a.signal
		});
	});
	Promise.allSettled(m).then((e) => {
		let t = [], i = [], a = n.get("loadingStatus"), o = r("collection");
		e.forEach((e, n) => {
			let { id: r, indexPath: s, node: c, valuePath: l } = d[n];
			e.status === "fulfilled" ? (a[r] = "loaded", t.push(r), o = o.replace(s, {
				...c,
				children: e.value
			})) : (f.delete(r), Reflect.deleteProperty(a, r), i.push({
				node: c,
				error: e.reason,
				indexPath: s,
				valuePath: l
			}));
		}), n.set("loadingStatus", a), t.length && (n.set("expandedValue", (e) => zt(Et(e, ...t))), r("onLoadChildrenComplete")?.({ collection: o })), i.length && r("onLoadChildrenError")?.({ nodes: i });
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tree-view@1.43.3/node_modules/@zag-js/tree-view/dist/utils/visit-skip.mjs
function Ok(e) {
	let { prop: t, context: n } = e;
	return function({ indexPath: e }) {
		return t("collection").getValuePath(e).slice(0, -1).some((e) => !n.get("expandedValue").includes(e));
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tree-view@1.43.3/node_modules/@zag-js/tree-view/dist/tree-view.machine.mjs
var { and: kk } = On(), Ak = Pn({
	props({ props: e }) {
		return {
			selectionMode: "single",
			collection: mk.empty(),
			typeahead: !0,
			expandOnClick: !0,
			defaultExpandedValue: [],
			defaultSelectedValue: [],
			...e
		};
	},
	initialState() {
		return "idle";
	},
	context({ prop: e, bindable: t, getContext: n }) {
		return {
			expandedValue: t(() => ({
				defaultValue: e("defaultExpandedValue"),
				value: e("expandedValue"),
				isEqual: Ot,
				onChange(t) {
					let r = n().get("focusedValue");
					e("onExpandedChange")?.({
						expandedValue: t,
						focusedValue: r,
						get expandedNodes() {
							return e("collection").findNodes(t);
						}
					});
				}
			})),
			selectedValue: t(() => ({
				defaultValue: e("defaultSelectedValue"),
				value: e("selectedValue"),
				isEqual: Ot,
				onChange(t) {
					let r = n().get("focusedValue");
					e("onSelectionChange")?.({
						selectedValue: t,
						focusedValue: r,
						get selectedNodes() {
							return e("collection").findNodes(t);
						}
					});
				}
			})),
			focusedValue: t(() => ({
				defaultValue: e("defaultFocusedValue") || null,
				value: e("focusedValue"),
				onChange(t) {
					e("onFocusChange")?.({
						focusedValue: t,
						get focusedNode() {
							return t ? e("collection").findNode(t) : null;
						}
					});
				}
			})),
			loadingStatus: t(() => ({ defaultValue: {} })),
			checkedValue: t(() => ({
				defaultValue: e("defaultCheckedValue") || [],
				value: e("checkedValue"),
				isEqual: Ot,
				onChange(t) {
					e("onCheckedChange")?.({ checkedValue: t });
				}
			})),
			renamingValue: t(() => ({
				sync: !0,
				defaultValue: null
			}))
		};
	},
	refs() {
		return {
			typeaheadState: { ...Ba.defaultOptions },
			pendingAborts: /* @__PURE__ */ new Map()
		};
	},
	computed: {
		isMultipleSelection: ({ prop: e }) => e("selectionMode") === "multiple",
		isTypingAhead: ({ refs: e }) => e.get("typeaheadState").keysSoFar.length > 0,
		visibleNodes: ({ prop: e, context: t }) => {
			let n = [];
			return e("collection").visit({
				skip: Ok({
					prop: e,
					context: t
				}),
				onEnter: (e, t) => {
					n.push({
						node: e,
						indexPath: t
					});
				}
			}), n;
		}
	},
	on: {
		"EXPANDED.SET": { actions: ["setExpanded"] },
		"EXPANDED.CLEAR": { actions: ["clearExpanded"] },
		"EXPANDED.ALL": { actions: ["expandAllBranches"] },
		"BRANCH.EXPAND": { actions: ["expandBranches"] },
		"BRANCH.COLLAPSE": { actions: ["collapseBranches"] },
		"SELECTED.SET": { actions: ["setSelected"] },
		"SELECTED.ALL": [{
			guard: kk("isMultipleSelection", "moveFocus"),
			actions: ["selectAllNodes", "focusTreeLastNode"]
		}, {
			guard: "isMultipleSelection",
			actions: ["selectAllNodes"]
		}],
		"SELECTED.CLEAR": { actions: ["clearSelected"] },
		"NODE.SELECT": { actions: ["selectNode"] },
		"NODE.DESELECT": { actions: ["deselectNode"] },
		"CHECKED.TOGGLE": { actions: ["toggleChecked"] },
		"CHECKED.SET": { actions: ["setChecked"] },
		"CHECKED.CLEAR": { actions: ["clearChecked"] },
		"NODE.FOCUS": { actions: ["setFocusedNode"] },
		"NODE.ARROW_DOWN": [{
			guard: kk("isShiftKey", "isMultipleSelection"),
			actions: ["focusTreeNextNode", "extendSelectionToNextNode"]
		}, { actions: ["focusTreeNextNode"] }],
		"NODE.ARROW_UP": [{
			guard: kk("isShiftKey", "isMultipleSelection"),
			actions: ["focusTreePrevNode", "extendSelectionToPrevNode"]
		}, { actions: ["focusTreePrevNode"] }],
		"NODE.ARROW_LEFT": { actions: ["focusBranchNode"] },
		"BRANCH_NODE.ARROW_LEFT": [{
			guard: "isBranchExpanded",
			actions: ["collapseBranch"]
		}, { actions: ["focusBranchNode"] }],
		"BRANCH_NODE.ARROW_RIGHT": [{
			guard: kk("isBranchFocused", "isBranchExpanded"),
			actions: ["focusBranchFirstNode"]
		}, { actions: ["expandBranch"] }],
		"SIBLINGS.EXPAND": { actions: ["expandSiblingBranches"] },
		"NODE.HOME": [{
			guard: kk("isShiftKey", "isMultipleSelection"),
			actions: ["extendSelectionToFirstNode", "focusTreeFirstNode"]
		}, { actions: ["focusTreeFirstNode"] }],
		"NODE.END": [{
			guard: kk("isShiftKey", "isMultipleSelection"),
			actions: ["extendSelectionToLastNode", "focusTreeLastNode"]
		}, { actions: ["focusTreeLastNode"] }],
		"NODE.CLICK": [
			{
				guard: kk("isCtrlKey", "isMultipleSelection"),
				actions: ["toggleNodeSelection"]
			},
			{
				guard: kk("isShiftKey", "isMultipleSelection"),
				actions: ["extendSelectionToNode"]
			},
			{ actions: ["selectNode"] }
		],
		"BRANCH_NODE.CLICK": [
			{
				guard: kk("isCtrlKey", "isMultipleSelection"),
				actions: ["toggleNodeSelection"]
			},
			{
				guard: kk("isShiftKey", "isMultipleSelection"),
				actions: ["extendSelectionToNode"]
			},
			{
				guard: "expandOnClick",
				actions: ["selectNode", "toggleBranchNode"]
			},
			{ actions: ["selectNode"] }
		],
		"BRANCH_TOGGLE.CLICK": { actions: ["toggleBranchNode"] },
		"TREE.TYPEAHEAD": { actions: ["focusMatchedNode"] }
	},
	exit: ["clearPendingAborts"],
	states: {
		idle: { on: { "NODE.RENAME": {
			target: "renaming",
			actions: ["setRenamingValue"]
		} } },
		renaming: {
			entry: ["syncRenameInput", "focusRenameInput"],
			on: {
				"RENAME.SUBMIT": {
					guard: "isRenameLabelValid",
					target: "idle",
					actions: ["submitRenaming"]
				},
				"RENAME.CANCEL": {
					target: "idle",
					actions: ["cancelRenaming"]
				}
			}
		}
	},
	implementations: {
		guards: {
			isBranchFocused: ({ context: e, event: t }) => e.get("focusedValue") === t.id,
			isBranchExpanded: ({ context: e, event: t }) => e.get("expandedValue").includes(t.id),
			isShiftKey: ({ event: e }) => e.shiftKey,
			isCtrlKey: ({ event: e }) => e.ctrlKey,
			hasSelectedItems: ({ context: e }) => e.get("selectedValue").length > 0,
			isMultipleSelection: ({ prop: e }) => e("selectionMode") === "multiple",
			moveFocus: ({ event: e }) => !!e.moveFocus,
			expandOnClick: ({ prop: e }) => !!e("expandOnClick"),
			isRenameLabelValid: ({ event: e }) => e.label.trim() !== ""
		},
		actions: {
			selectNode({ context: e, event: t }) {
				let n = t.id || t.value;
				e.set("selectedValue", (e) => n == null ? e : !t.isTrusted && wt(n) ? e.concat(...n) : [wt(n) ? sn(n) : n].filter(Boolean));
			},
			deselectNode({ context: e, event: t }) {
				let n = bn(t.id || t.value);
				e.set("selectedValue", (e) => un(e, ...n));
			},
			setFocusedNode({ context: e, event: t }) {
				e.set("focusedValue", t.id);
			},
			clearFocusedNode({ context: e }) {
				e.set("focusedValue", null);
			},
			clearSelectedItem({ context: e }) {
				e.set("selectedValue", []);
			},
			toggleBranchNode({ context: e, event: t, action: n }) {
				n(e.get("expandedValue").includes(t.id) ? ["collapseBranch"] : ["expandBranch"]);
			},
			expandBranch(e) {
				let { event: t } = e;
				Dk(e, [t.id]);
			},
			expandBranches(e) {
				let { context: t, event: n } = e, r = bn(n.value);
				Dk(e, Me(r, t.get("expandedValue")));
			},
			collapseBranch({ context: e, event: t }) {
				e.set("expandedValue", (e) => un(e, t.id));
			},
			collapseBranches(e) {
				let { context: t, event: n } = e, r = bn(n.value);
				t.set("expandedValue", (e) => un(e, ...r));
			},
			setExpanded({ context: e, event: t }) {
				wt(t.value) && e.set("expandedValue", t.value);
			},
			clearExpanded({ context: e }) {
				e.set("expandedValue", []);
			},
			setSelected({ context: e, event: t }) {
				wt(t.value) && e.set("selectedValue", t.value);
			},
			clearSelected({ context: e }) {
				e.set("selectedValue", []);
			},
			focusTreeFirstNode(e) {
				let { prop: t, scope: n } = e, r = t("collection"), i = r.getFirstNode(void 0, { skip: Ok(e) });
				if (!i) return;
				let a = r.getNodeValue(i);
				jk(e, a) ? en(() => yk(n, a)) : yk(n, a);
			},
			focusTreeLastNode(e) {
				let { prop: t, scope: n } = e, r = t("collection"), i = r.getLastNode(void 0, { skip: Ok(e) }), a = r.getNodeValue(i);
				jk(e, a) ? en(() => yk(n, a)) : yk(n, a);
			},
			focusBranchFirstNode(e) {
				let { event: t, prop: n, scope: r } = e, i = n("collection"), a = i.findNode(t.id), o = i.getFirstNode(a, { skip: Ok(e) });
				if (!o) return;
				let s = i.getNodeValue(o);
				jk(e, s) ? en(() => yk(r, s)) : yk(r, s);
			},
			focusTreeNextNode(e) {
				let { event: t, prop: n, scope: r } = e, i = n("collection"), a = i.getNextNode(t.id, { skip: Ok(e) });
				if (!a) return;
				let o = i.getNodeValue(a);
				jk(e, o) ? en(() => yk(r, o)) : yk(r, o);
			},
			focusTreePrevNode(e) {
				let { event: t, prop: n, scope: r } = e, i = n("collection"), a = i.getPreviousNode(t.id, { skip: Ok(e) });
				if (!a) return;
				let o = i.getNodeValue(a);
				jk(e, o) ? en(() => yk(r, o)) : yk(r, o);
			},
			focusBranchNode(e) {
				let { event: t, prop: n, scope: r } = e, i = n("collection"), a = i.getParentNode(t.id), o = a ? i.getNodeValue(a) : void 0;
				o && (jk(e, o) ? en(() => yk(r, o)) : yk(r, o));
			},
			selectAllNodes({ context: e, prop: t }) {
				e.set("selectedValue", t("collection").getValues());
			},
			focusMatchedNode(e) {
				let { context: t, prop: n, refs: r, event: i, scope: a, computed: o } = e, s = Ba(o("visibleNodes").map(({ node: e }) => ({
					textContent: n("collection").stringifyNode(e),
					id: n("collection").getNodeValue(e)
				})), {
					state: r.get("typeaheadState"),
					activeId: t.get("focusedValue"),
					key: i.key
				});
				s?.id && (jk(e, s.id) ? en(() => yk(a, s.id)) : yk(a, s.id));
			},
			toggleNodeSelection({ context: e, event: t }) {
				let n = At(e.get("selectedValue"), t.id);
				e.set("selectedValue", n);
			},
			expandAllBranches(e) {
				let { context: t, prop: n } = e, r = n("collection").getBranchValues();
				Dk(e, Me(r, t.get("expandedValue")));
			},
			expandSiblingBranches(e) {
				let { context: t, event: n, prop: r } = e, i = r("collection"), a = i.getIndexPath(n.id);
				if (!a) return;
				let o = i.getSiblingNodes(a).map((e) => i.getNodeValue(e));
				Dk(e, Me(o, t.get("expandedValue")));
			},
			extendSelectionToNode(e) {
				let { context: t, event: n, prop: r, computed: i } = e, a = r("collection"), o = Ht(t.get("selectedValue")) || a.getNodeValue(a.getFirstNode()), s = n.id, c = [o, s], l = 0;
				i("visibleNodes").forEach(({ node: e }) => {
					let t = a.getNodeValue(e);
					l === 1 && c.push(t), (t === o || t === s) && l++;
				}), t.set("selectedValue", zt(c));
			},
			extendSelectionToNextNode(e) {
				let { context: t, event: n, prop: r } = e, i = r("collection"), a = i.getNextNode(n.id, { skip: Ok(e) });
				if (!a) return;
				let o = new Set(t.get("selectedValue")), s = i.getNodeValue(a);
				s != null && (o.has(n.id) && o.has(s) ? o.delete(n.id) : o.has(s) || o.add(s), t.set("selectedValue", Array.from(o)));
			},
			extendSelectionToPrevNode(e) {
				let { context: t, event: n, prop: r } = e, i = r("collection"), a = i.getPreviousNode(n.id, { skip: Ok(e) });
				if (!a) return;
				let o = new Set(t.get("selectedValue")), s = i.getNodeValue(a);
				s != null && (o.has(n.id) && o.has(s) ? o.delete(n.id) : o.has(s) || o.add(s), t.set("selectedValue", Array.from(o)));
			},
			extendSelectionToFirstNode(e) {
				let { context: t, prop: n } = e, r = n("collection"), i = Ht(t.get("selectedValue")), a = [];
				r.visit({
					skip: Ok(e),
					onEnter: (e) => {
						let t = r.getNodeValue(e);
						if (a.push(t), t === i) return "stop";
					}
				}), t.set("selectedValue", a);
			},
			extendSelectionToLastNode(e) {
				let { context: t, prop: n } = e, r = n("collection"), i = Ht(t.get("selectedValue")), a = [], o = !1;
				r.visit({
					skip: Ok(e),
					onEnter: (e) => {
						let t = r.getNodeValue(e);
						t === i && (o = !0), o && a.push(t);
					}
				}), t.set("selectedValue", a);
			},
			clearPendingAborts({ refs: e }) {
				let t = e.get("pendingAborts");
				t.forEach((e) => e.abort()), t.clear();
			},
			toggleChecked({ context: e, event: t, prop: n }) {
				let r = n("collection");
				e.set("checkedValue", (e) => t.isBranch ? Ck(r, t.value, e) : At(e, t.value));
			},
			setChecked({ context: e, event: t }) {
				e.set("checkedValue", t.value);
			},
			clearChecked({ context: e }) {
				e.set("checkedValue", []);
			},
			setRenamingValue({ context: e, event: t, prop: n }) {
				e.set("renamingValue", t.value);
				let r = n("onRenameStart");
				if (r) {
					let e = n("collection"), i = e.getIndexPath(t.value);
					if (i) {
						let n = e.at(i);
						n && r({
							value: t.value,
							node: n,
							indexPath: i
						});
					}
				}
			},
			submitRenaming({ context: e, event: t, prop: n, scope: r }) {
				let i = e.get("renamingValue");
				if (!i) return;
				let a = n("collection").getIndexPath(i);
				if (!a) return;
				let o = t.label.trim(), s = n("onBeforeRename");
				if (s && !s({
					value: i,
					label: o,
					indexPath: a
				})) {
					e.set("renamingValue", null), yk(r, i);
					return;
				}
				n("onRenameComplete")?.({
					value: i,
					label: o,
					indexPath: a
				}), e.set("renamingValue", null), yk(r, i);
			},
			cancelRenaming({ context: e, scope: t }) {
				let n = e.get("renamingValue");
				e.set("renamingValue", null), n && yk(t, n);
			},
			syncRenameInput({ context: e, scope: t, prop: n }) {
				let r = e.get("renamingValue");
				if (!r) return;
				let i = n("collection"), a = i.findNode(r);
				if (!a) return;
				let o = i.stringifyNode(a);
				Ui(xk(t, r), o);
			},
			focusRenameInput({ context: e, scope: t }) {
				let n = e.get("renamingValue");
				if (!n) return;
				let r = xk(t, n);
				r && (r.focus(), r.select());
			}
		}
	}
});
function jk(e, t) {
	let { prop: n, scope: r, computed: i } = e, a = n("scrollToIndexFn");
	if (!a) return !1;
	let o = n("collection"), s = i("visibleNodes");
	for (let e = 0; e < s.length; e++) {
		let { node: n, indexPath: i } = s[e];
		if (o.getNodeValue(n) === t) return a({
			index: e,
			node: n,
			indexPath: i,
			getElement: () => r.getById(_k(r, t))
		}), !0;
	}
	return !1;
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/use-tree-view.svelte.js
var Mk = (e) => {
	let t = Nt(), n = gn(), r = _(() => {
		let r = St(e);
		return Re(r, ["id"]), {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = Tn(Ak, () => z(r)), a = _(() => Ek(i, Wt));
	return () => z(a);
}, Nk = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"expandedValue",
	"selectedValue",
	"focusedValue",
	"checkedValue"
]);
function Pk(e, t) {
	let n = m();
	O(t, !0);
	let r = R(t, "ref", 15, null), i = R(t, "expandedValue", 15), a = R(t, "selectedValue", 15), o = R(t, "focusedValue", 15), s = R(t, "checkedValue", 15), c = q(t, Nk), l = _(() => Za(c)), u = _(() => C(z(l), 2)), d = _(() => z(u)[0]), f = _(() => z(u)[1]), p = _(() => fk(z(f))), h = _(() => C(z(p), 2)), g = _(() => z(h)[0]), v = _(() => z(h)[1]), ee = _(() => ({
		...z(g),
		id: z(g).id ?? n,
		selectedValue: a(),
		expandedValue: i(),
		focusedValue: o(),
		checkedValue: s(),
		onExpandedChange: (e) => {
			z(g).onExpandedChange?.(e), i(e.expandedValue);
		},
		onFocusChange: (e) => {
			z(g).onFocusChange?.(e), o(e.focusedValue);
		},
		onSelectionChange: (e) => {
			z(g).onSelectionChange?.(e), a(e.selectedValue);
		},
		onCheckedChange: (e) => {
			z(g).onCheckedChange?.(e), s(e.checkedValue);
		}
	})), b = Mk(() => z(ee)), x = _(() => X(b().getRootProps(), z(v)));
	return JO(b), Ja(() => z(d)), Q(e, Y({ as: "div" }, () => z(x), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), y({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), M();
		},
		get expandedValue() {
			return i();
		},
		set expandedValue(e) {
			i(e), M();
		},
		get selectedValue() {
			return a();
		},
		set selectedValue(e) {
			a(e), M();
		},
		get focusedValue() {
			return o();
		},
		set focusedValue(e) {
			o(e), M();
		},
		get checkedValue() {
			return s();
		},
		set checkedValue(e) {
			s(e), M();
		}
	});
}
U(Pk, {
	ref: {},
	expandedValue: {},
	selectedValue: {},
	focusedValue: {},
	checkedValue: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/tree-view-tree.svelte
var Fk = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Ik(e, t) {
	O(t, !0);
	let n = R(t, "ref", 15, null), r = q(t, Fk), i = YO(), a = _(() => X(i().getTreeProps(), r));
	return Q(e, Y({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), y({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), M();
		}
	});
}
U(Ik, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/picker/forest.ts
function Lk(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) t.has(n.id) || t.set(n.id, n);
	let n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set();
	for (let e of t.values()) e.parentId == null || !t.has(e.parentId) ? r.add(e.id) : n.has(e.parentId) ? n.get(e.parentId).push(e) : n.set(e.parentId, [e]);
	let i = /* @__PURE__ */ new Set(), a = (e) => {
		if (!i.has(e)) {
			i.add(e);
			for (let t of n.get(e) ?? []) a(t.id);
		}
	};
	for (let e of r) a(e);
	for (let e of t.keys()) i.has(e) || (r.add(e), a(e));
	let o = (e, t, i) => {
		let a = [...i, e.label];
		return {
			node: e,
			depth: t,
			children: (n.get(e.id) ?? []).filter((e) => !r.has(e.id)).map((e) => o(e, t + 1, a)),
			ancestry: i
		};
	};
	return [...t.values()].filter((e) => r.has(e.id)).map((e) => o(e, 0, []));
}
function Rk(e, t) {
	let n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), i = (e) => {
		let a = !1;
		for (let t of e.children) i(t) && (a = !0);
		a && r.add(e.node.id);
		let o = a || dr(e.node.label, t) || dr(e.node.code, t);
		return o && n.add(e.node.id), o;
	};
	for (let t of e) i(t);
	return {
		shown: n,
		open: r
	};
}
//#endregion
//#region src/kit/TreePicker.svelte
function zk(e, t) {
	return e.filter((e) => t.has(e.node.id)).map((e) => ({
		...e,
		children: zk(e.children, t)
	}));
}
var Bk = ae("<svg viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m9 18 6-6-6-6\"></path></svg>"), Vk = L("<span class=\"spacer svelte-wzhqq0\" aria-hidden=\"true\"></span>"), Hk = ae("<svg viewBox=\"0 0 24 24\" width=\"10\" height=\"10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 6 9 17l-5-5\"></path></svg>"), Uk = L("<span part=\"check\" aria-hidden=\"true\"><!></span>"), Wk = L("<span part=\"ancestry\"> </span>"), Gk = L("<code part=\"code\"> </code>"), Kk = L("<span part=\"archived\"> </span>"), qk = L("<!> <!> <span class=\"label svelte-wzhqq0\"> </span> <!> <!> <!>", 1), Jk = L("<af-tooltip><!></af-tooltip>", 2), Yk = L("<!> <!>", 1), Xk = L("<span id=\"af-described\" hidden=\"\"> </span>"), Zk = L("<span class=\"af-chip secondary\" part=\"chip\"><span> </span> <button type=\"button\" part=\"remove\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button></span>"), Qk = L("<button type=\"button\" part=\"clear\" class=\"af-button ghost icon xs\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button>"), $k = L("<div part=\"control\" data-scope=\"combobox\" data-part=\"control\"><!> <input part=\"input\" data-scope=\"combobox\" data-part=\"input\" role=\"combobox\" aria-haspopup=\"tree\" aria-controls=\"af-tree\" autocomplete=\"off\" spellcheck=\"false\"/> <!></div>"), eA = L("<div part=\"loading\"> </div>"), tA = L("<button type=\"button\" part=\"load-more\"> </button>"), nA = L("<div part=\"empty\"> </div>"), rA = L("<div class=\"af-kit\"><!> <!></div>"), iA = L("<!> <!> <!>", 1), aA = {
	hash: "svelte-wzhqq0",
	code: ":host {display:inline-block;max-width:100%;vertical-align:middle;}af-tooltip.svelte-wzhqq0 {display:block;}[data-scope='popover'][data-part='anchor'] {display:block;}[data-scope='popover'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='popover'][data-part='content'] {display:flex;flex-direction:column;box-sizing:border-box;width:var(--reference-width, auto);max-height:256px;padding:6px;outline:none;}[data-scope='tree-view'][data-part='tree'], [data-scope='tree-view'][data-part='branch'], [data-scope='tree-view'][data-part='branch-content'] {display:flex;flex-direction:column;gap:2px;margin:0;padding:0;outline:none;}[data-scope='tree-view'][data-part='branch-content'][hidden] {display:none;}[part~='node'] {display:flex;box-sizing:border-box;align-items:center;gap:8px;height:32px;min-height:0;padding-right:8px;border:0 solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));font-size:12.5px;line-height:1.5;outline:none;cursor:pointer;-webkit-user-select:none;user-select:none;}[part~='node']:hover {background-color:var(--k-muted-bg);}[part~='node']:focus-visible {box-shadow:0 0 0 2px var(--k-focus-ring);}[part~='node'][data-selected] {background-color:var(--k-accent);color:var(--k-accent-fg);font-weight:600;}[part~='node'][data-archived]:not([data-selected]) {font-style:italic;}[part~='node'][aria-disabled='true'] {color:color-mix(in oklab, var(--k-muted) 70%, transparent);cursor:not-allowed;}[part~='node'][aria-disabled='true']:hover {background-color:transparent;}[part~='toggle'] {display:grid;flex:none;place-items:center;width:16px;height:16px;padding:0;border:0;border-radius:0.25rem;background:transparent;color:var(--k-muted);cursor:pointer;}[part~='toggle'] svg {transition:transform 150ms cubic-bezier(0.4, 0, 0.2, 1);}[part~='toggle'][data-state='open'] svg {transform:rotate(90deg);}.spacer.svelte-wzhqq0 {flex:none;width:16px;height:16px;}[part~='check'] {display:grid;flex:none;box-sizing:border-box;place-items:center;width:14px;height:14px;border:1px solid var(--k-input);border-radius:4px;background-color:var(--k-surface);}[part~='check'][data-state='on'] {border-color:var(--k-primary);background-color:var(--k-primary);color:var(--k-primary-fg);}.label.svelte-wzhqq0 {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}[part~='ancestry'] {min-width:0;overflow:hidden;color:var(--k-muted);font-size:11px;font-style:normal;font-weight:400;text-overflow:ellipsis;white-space:nowrap;}[part~='code'] {flex:none;margin-left:auto;color:var(--k-muted);font-family:var(--af-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);font-size:10.5px;font-style:normal;font-weight:400;}[part~='archived'] {display:inline-flex;flex:none;box-sizing:border-box;align-items:center;height:18px;margin-left:auto;padding:0 6px;border:1px solid var(--k-line);border-radius:calc(infinity * 1px);background-color:var(--k-muted-bg);color:var(--k-muted);font-size:10px;font-style:normal;font-weight:600;}[part~='code'] + [part~='archived'] {margin-left:0;}[part~='loading'], [part~='empty'] {padding:20px 12px;color:var(--k-muted);font-size:12px;line-height:1.5;text-align:center;}[part~='load-more'] {display:flex;box-sizing:border-box;align-items:center;width:100%;height:32px;margin:2px 0 0;padding:0 8px;border:0;border-radius:max(0px, calc(var(--k-radius) - 2px));background:transparent;color:inherit;font:inherit;font-size:12.5px;text-align:start;outline:none;cursor:pointer;}[part~='load-more']:hover {background-color:var(--k-muted-bg);}[part~='load-more']:focus-visible {box-shadow:0 0 0 2px var(--k-focus-ring);}\n  @media (prefers-reduced-motion: reduce) {[part~='toggle'] svg {transition:none;} }\n  @media (forced-colors: active) {[part~='node']:focus-visible, [part~='load-more']:focus-visible {outline:2px solid;outline-offset:-2px;}[part~='node'][data-selected] {forced-color-adjust:none;background-color:Highlight;color:HighlightText;}\n  }"
};
function oA(e, r) {
	O(r, !0), ee(e, aA);
	let i = (e, t = b) => {
		let n = _(() => t().node), r = _(() => z(V).includes(z(n).id));
		var i = qk(), a = K(i), o = (e) => {
			var t = F(), n = K(t);
			E(n, () => sk, (e, t) => {
				t(e, {
					part: "toggle",
					tabindex: -1,
					"aria-hidden": "true",
					children: (e, t) => {
						var n = Bk();
						I(e, n);
					},
					$$slots: { default: !0 }
				});
			}), I(e, t);
		}, s = (e) => {
			var t = Vk();
			I(e, t);
		};
		P(a, (e) => {
			t().children.length ? e(o) : e(s, -1);
		});
		var c = W(a, 2), l = (e) => {
			var t = Uk(), n = H(t), i = (e) => {
				var t = Hk();
				I(e, t);
			};
			P(n, (e) => {
				z(r) && e(i);
			}), D(t), G(() => N(t, "data-state", z(r) ? "on" : "off")), I(e, t);
		};
		P(c, (e) => {
			x() && e(l);
		});
		var u = W(c, 2), d = ge(u, !0), f = W(u, 2), p = (e) => {
			var n = Wk(), r = ge(n, !0);
			G((e) => w(r, e), [() => t().ancestry.join(" › ")]), I(e, n);
		};
		P(f, (e) => {
			t().ancestry.length && e(p);
		});
		var m = W(f, 2), h = (e) => {
			var t = Gk(), r = ge(t, !0);
			G(() => w(r, z(n).code)), I(e, t);
		};
		P(m, (e) => {
			z(n).code && e(h);
		});
		var g = W(m, 2), v = (e) => {
			var t = Kk(), n = ge(t, !0);
			G(() => w(n, z(de).archived)), I(e, t);
		};
		P(g, (e) => {
			z(n).archived && e(v);
		}), G(() => w(d, z(n).label)), I(e, i);
	}, o = (e, t = b) => {
		var n = F(), r = K(n);
		{
			let e = _(() => 8 + t().depth * 18), n = _(() => t().node.archived ? "" : void 0), a = _(() => ot(t().node));
			E(r, () => ak, (r, o) => {
				o(r, Y({
					part: "node",
					get style() {
						return `padding-left: ${z(e) ?? ""}px`;
					},
					get "data-archived"() {
						return z(n);
					}
				}, () => z(a), {
					onclick: () => et(t().node.id),
					children: (e, n) => {
						i(e, t);
					},
					$$slots: { default: !0 }
				}));
			});
		}
		I(e, n);
	}, l = (e, t = b) => {
		var n = F(), r = K(n);
		{
			let e = _(() => 8 + t().depth * 18), n = _(() => t().node.archived ? "" : void 0), a = _(() => ot(t().node));
			E(r, () => lk, (r, o) => {
				o(r, Y({
					part: "node",
					get style() {
						return `padding-left: ${z(e) ?? ""}px`;
					},
					get "data-archived"() {
						return z(n);
					}
				}, () => z(a), {
					onclick: () => et(t().node.id),
					children: (e, n) => {
						i(e, t);
					},
					$$slots: { default: !0 }
				}));
			});
		}
		I(e, n);
	}, u = (e, t = b, n = b) => {
		var r = F(), i = K(r), a = (e) => {
			var r = Jk();
			G((e) => v(r, "text", e), [() => Ue(t().node)]), te(r, 1, "svelte-wzhqq0");
			var i = H(r);
			ye(i, n, t), D(r), I(e, r);
		}, o = _(() => He(t().node) && Ue(t().node)), s = (e) => {
			var r = F(), i = K(r);
			ye(i, n, t), I(e, r);
		};
		P(i, (e) => {
			z(o) ? e(a) : e(s, -1);
		}), I(e, r);
	}, f = (e, t = b, n = b) => {
		var r = F(), i = K(r);
		E(i, () => uk, (e, r) => {
			r(e, {
				get node() {
					return t();
				},
				get indexPath() {
					return n();
				},
				children: (e, r) => {
					var i = F(), a = K(i), s = (e) => {
						var r = F(), i = K(r);
						E(i, () => tk, (e, r) => {
							r(e, {
								children: (e, r) => {
									var i = Yk(), a = K(i);
									u(a, t, () => o);
									var s = W(a, 2);
									E(s, () => rk, (e, r) => {
										r(e, {
											children: (e, r) => {
												var i = F(), a = K(i);
												h(a, 19, () => t().children, (e) => e.node.id, (e, t, r) => {
													{
														let i = _(() => [...n(), z(r)]);
														f(e, () => z(t), () => z(i));
													}
												}), I(e, i);
											},
											$$slots: { default: !0 }
										});
									}), I(e, i);
								},
								$$slots: { default: !0 }
							});
						}), I(e, r);
					}, c = (e) => {
						u(e, t, () => l);
					};
					P(a, (e) => {
						t().children.length ? e(s) : e(c, -1);
					}), I(e, i);
				},
				$$slots: { default: !0 }
			});
		}), I(e, r);
	}, p = R(r, "nodes", 23, () => []), m = R(r, "source", 7, null), g = R(r, "value", 7, null), x = R(r, "multiple", 7, !1), S = R(r, "max", 7, null), C = R(r, "placeholder", 7, null), T = R(r, "label", 7, null), ne = R(r, "loading", 7, !1), re = R(r, "disabled", 7, !1), k = R(r, "locale", 7, null), A = R(r, "strings", 7, null), ae = R(r, "name", 7, null), oe = R(r, "required", 7, !1), j = R(r, "readonly", 7, !1), se = R(r, "description", 7, null), ce = R(r, "error", 7, null), L = R(r, "invalid", 7, !1), le = r.$$host, de = _(() => c(k(), A() ?? void 0)), V = _(() => [...new Set(Array.isArray(g()) ? g() : g() ? [g()] : [])]), fe = B(null), U = B(!1), pe = Zu((e) => e.id), me = null, he = B(null), ve = !1;
	function be() {
		ve && pe.busy || (ve = !0, me = null, pe.now(""));
	}
	Qu(pe, () => m(), () => z(V), () => {
		J(he, null), ve = !1, z(U) && be();
	}), Te(() => {
		let e = pe.next;
		if (z(U) && m() && !pe.busy) {
			if (e === null) {
				ve && (ve = !1, J(he, pe.items.length ? pe.items : null));
				return;
			}
			e !== me && (me = e, Se(() => pe.more()));
		}
	});
	let xe = _(() => m() ? z(he) ?? pe.items : p() ?? []), Ce = _(() => Lk(z(xe))), we = _(() => new Map(z(xe).map((e) => [e.id, e]))), q = _(() => (z(fe) ?? "").trim()), De = _(() => z(q) ? Rk(z(Ce), z(q)) : null), Oe = _(() => z(De) ? zk(z(Ce), z(De).shown) : z(Ce)), ke = new Ju(), Ae = new Ju(), je = (e) => z(De) ? Ae.get(e.node.id) ?? z(De).open.has(e.node.id) : ke.get(e.node.id) ?? e.depth === 0, Me = _(() => {
		let e = [], t = (n) => {
			for (let r of n) r.children.length && (e.push(r), t(r.children));
		};
		return t(z(Oe)), e;
	}), Ne = _(() => z(Me).filter(je).map((e) => e.node.id));
	function Pe(e) {
		let t = new Set(e), n = z(De) ? Ae : ke;
		for (let e of z(Me)) je(e) !== t.has(e.node.id) && n.set(e.node.id, t.has(e.node.id));
	}
	let Fe = _(() => Di({
		rootNode: {
			node: {
				id: "",
				parentId: null,
				label: ""
			},
			depth: -1,
			children: z(Oe),
			ancestry: []
		},
		nodeToValue: (e) => e.node.id,
		nodeToString: (e) => e.node.label,
		nodeToChildren: (e) => e.children
	})), Ie = (e) => m() ? pe.named.get(e) : z(we).get(e), Le = _(() => z(V).filter((e) => !Ie(e)));
	function Re(e) {
		let t = Ie(e);
		return t ? t.label : ne() || m() && pe.pending(e) ? "…" : (m() ? pe.answered(e) : z(xe).length > 0) ? z(Le).length > 1 ? `${z(de).unknownOption} ${z(Le).indexOf(e) + 1}` : z(de).unknownOption : "";
	}
	let ze = _(() => z(fe) ?? (x() || !z(V)[0] ? "" : Re(z(V)[0]))), Be = _(() => !!ne() || !!m() && pe.busy), Ve = _(() => !!x() && S() != null && z(V).length >= S()), He = (e) => !!e.disabled || z(Ve) && !z(V).includes(e.id), Ue = (e) => e.disabled ? e.reason ?? "" : z(Ve) && !z(V).includes(e.id) ? a(z(de).maxPicked, { max: S() }) : "", We = (e) => n(le, "change", { value: x() ? e : e[0] ?? null }), Ge = B(!1), Ke = _(() => !!re() || z(Ge)), qe = _(() => z(Ke) || !!j()), Je = _(() => [se(), ce()].filter(Boolean).join(" ")), Ye = B(null), Xe = B(null), Ze = B(null), Qe = B(null);
	Te(() => s(z(Qe), z(U), le));
	function $e(e) {
		e === z(U) || e && z(qe) || (J(U, e, !0), e ? m() && be() : (J(fe, null), Ae.clear(), pe.stop(), ve = !1));
	}
	function et(e) {
		let t = z(we).get(e);
		if (!(!t || z(qe) || He(t))) {
			if (x()) {
				We(z(V).includes(e) ? z(V).filter((t) => t !== e) : [...z(V), e]);
				return;
			}
			z(V)[0] !== e && We([e]), $e(!1), z(Ye)?.focus();
		}
	}
	function tt(e) {
		if (e.key !== "Enter" && e.key !== " ") return;
		let t = e.target.closest("[data-part=\"item\"], [data-part=\"branch-control\"]")?.dataset.value;
		t !== void 0 && (e.preventDefault(), et(t));
	}
	function nt() {
		let e = [...z(Ze)?.querySelectorAll("[data-part=\"item\"], [data-part=\"branch-control\"]") ?? []].filter((e) => !e.closest("[hidden]"));
		(e.find((e) => e.dataset.value === z(V)[0]) ?? e.find((e) => e.tabIndex === 0) ?? e[0])?.focus();
	}
	function rt(e) {
		e.key !== "ArrowDown" || z(qe) || (e.preventDefault(), z(U) ? nt() : $e(!0));
	}
	function it(e) {
		let t = e.currentTarget.value;
		J(fe, t, !0), Ae.clear(), n(le, "search", { query: t }), $e(!0);
	}
	Te(() => {
		let e = !!oe() && z(V).length === 0;
		Dr(le, {
			name: ae(),
			value: x() ? z(V) : z(V)[0] ?? null,
			validity: e ? { valueMissing: !0 } : {},
			message: e ? d(z(de), "valueMissing") : "",
			anchor: z(Ye)
		});
	}), Or(le, {
		reset() {
			let e = le.getAttribute("value"), t = e ? [e] : [];
			(t.length !== z(V).length || t.some((e, t) => e !== z(V)[t])) && We(t);
		},
		disabled(e) {
			J(Ge, e, !0);
		}
	});
	function at(e) {
		let t = e.target;
		t === z(Ye) || t.closest("button") || (e.preventDefault(), z(Ye)?.focus());
	}
	let ot = (e) => {
		if (!He(e)) return {};
		let t = Ue(e);
		return t ? {
			"aria-disabled": "true",
			"aria-description": t
		} : { "aria-disabled": "true" };
	};
	var st = {
		get nodes() {
			return p();
		},
		set nodes(e = []) {
			p(e), M();
		},
		get source() {
			return m();
		},
		set source(e = null) {
			m(e), M();
		},
		get value() {
			return g();
		},
		set value(e = null) {
			g(e), M();
		},
		get multiple() {
			return x();
		},
		set multiple(e = !1) {
			x(e), M();
		},
		get max() {
			return S();
		},
		set max(e = null) {
			S(e), M();
		},
		get placeholder() {
			return C();
		},
		set placeholder(e = null) {
			C(e), M();
		},
		get label() {
			return T();
		},
		set label(e = null) {
			T(e), M();
		},
		get loading() {
			return ne();
		},
		set loading(e = !1) {
			ne(e), M();
		},
		get disabled() {
			return re();
		},
		set disabled(e = !1) {
			re(e), M();
		},
		get locale() {
			return k();
		},
		set locale(e = null) {
			k(e), M();
		},
		get strings() {
			return A();
		},
		set strings(e = null) {
			A(e), M();
		},
		get name() {
			return ae();
		},
		set name(e = null) {
			ae(e), M();
		},
		get required() {
			return oe();
		},
		set required(e = !1) {
			oe(e), M();
		},
		get readonly() {
			return j();
		},
		set readonly(e = !1) {
			j(e), M();
		},
		get description() {
			return se();
		},
		set description(e = null) {
			se(e), M();
		},
		get error() {
			return ce();
		},
		set error(e = null) {
			ce(e), M();
		},
		get invalid() {
			return L();
		},
		set invalid(e = !1) {
			L(e), M();
		}
	}, ct = iA(), lt = K(ct);
	t(lt, {});
	var ut = W(lt, 2);
	Uu(ut, {});
	var dt = W(ut, 2);
	return Yt(dt, {
		value: () => le.shadowRoot,
		children: (e, t) => {
			var n = rA(), r = H(n), i = (e) => {
				var t = Xk(), n = ge(t, !0);
				G(() => w(n, z(Je))), I(e, t);
			};
			P(r, (e) => {
				z(Je) && e(i);
			});
			var a = W(r, 2);
			E(a, () => zx, (e, t) => {
				t(e, {
					get open() {
						return z(U);
					},
					autoFocus: !1,
					restoreFocus: !1,
					portalled: !1,
					positioning: {
						strategy: "fixed",
						placement: "bottom-start"
					},
					persistentElements: [() => z(Xe)],
					onOpenChange: (e) => $e(e.open),
					onEscapeKeyDown: (e) => {
						z(Ye)?.focus(), qn(e) && e.defaultPrevented && $e(!1);
					},
					children: (e, t) => {
						var n = Yk(), r = K(n);
						E(r, () => fx, (e, t) => {
							t(e, {
								children: (e, t) => {
									var n = $k(), r = H(n), i = (e) => {
										var t = F(), n = K(t);
										h(n, 16, () => z(V), (e) => e, (e, t) => {
											let n = _(() => Re(t));
											var r = Zk(), i = H(r), a = ge(i, !0), o = W(i, 2);
											D(r), G(() => {
												w(a, z(n)), N(o, "aria-label", `${z(de).remove ?? ""}: ${z(n) ?? ""}`), o.disabled = z(qe);
											}), _e("click", o, () => We(z(V).filter((e) => e !== t))), I(e, r);
										}), I(e, t);
									};
									P(r, (e) => {
										x() && e(i);
									});
									var a = W(r, 2);
									Ee(a), ue(a, (e) => J(Ye, e), () => z(Ye));
									var o = W(a, 2), s = (e) => {
										var t = Qk();
										G(() => N(t, "aria-label", z(de).clear)), _e("click", t, () => We([])), I(e, t);
									};
									P(o, (e) => {
										!x() && z(V)[0] && !z(qe) && e(s);
									}), D(n), ue(n, (e) => J(Xe, e), () => z(Xe)), G(() => {
										N(n, "data-disabled", z(Ke) ? "" : void 0), N(a, "aria-expanded", z(U)), N(a, "placeholder", C() ?? ""), N(a, "aria-label", T() || void 0), N(a, "aria-describedby", z(Je) ? "af-described" : void 0), N(a, "aria-required", oe() ? "true" : void 0), N(a, "aria-invalid", L() ? "true" : void 0), a.disabled = z(Ke), a.readOnly = !!j(), ie(a, z(ze));
									}), _e("mousedown", n, at), _e("input", a, it), _e("keydown", a, rt), _e("click", a, () => $e(!0)), I(e, n);
								},
								$$slots: { default: !0 }
							});
						});
						var i = W(r, 2);
						E(i, () => gx, (e, t) => {
							t(e, {
								popover: "manual",
								get ref() {
									return z(Qe);
								},
								set ref(e) {
									J(Qe, e, !0);
								},
								children: (e, t) => {
									var n = F(), r = K(n);
									E(r, () => mx, (e, t) => {
										t(e, {
											class: "af-overlay",
											part: "content",
											children: (e, t) => {
												Sn(e, {
													tabStop: !1,
													children: (e, t) => {
														var n = Yk(), r = K(n), i = () => z(V), a = () => z(Ne), o = Pe;
														{
															let e = _(() => x() ? "multiple" : "single");
															E(r, () => Pk, (t, n) => {
																n(t, {
																	get collection() {
																		return z(Fe);
																	},
																	ids: { tree: "af-tree" },
																	get selectionMode() {
																		return z(e);
																	},
																	expandOnClick: !1,
																	get selectedValue() {
																		return i();
																	},
																	set selectedValue(e) {},
																	get expandedValue() {
																		return a();
																	},
																	set expandedValue(e) {
																		o(e);
																	},
																	children: (e, t) => {
																		var n = F(), r = K(n);
																		{
																			let e = _(() => T() || C() || void 0);
																			E(r, () => Ik, (t, n) => {
																				n(t, {
																					part: "tree",
																					get "aria-label"() {
																						return z(e);
																					},
																					onkeydown: tt,
																					get ref() {
																						return z(Ze);
																					},
																					set ref(e) {
																						J(Ze, e, !0);
																					},
																					children: (e, t) => {
																						var n = F(), r = K(n);
																						h(r, 19, () => z(Oe), (e) => e.node.id, (e, t, n) => {
																							f(e, () => z(t), () => [z(n)]);
																						}), I(e, n);
																					},
																					$$slots: { default: !0 }
																				});
																			});
																		}
																		I(e, n);
																	},
																	$$slots: { default: !0 }
																});
															});
														}
														var s = W(r, 2), c = (e) => {
															var t = eA(), n = ge(t, !0);
															G(() => w(n, z(de).loading)), I(e, t);
														}, l = (e) => {
															var t = tA(), n = ge(t, !0);
															G(() => w(n, z(de).loadMore)), _e("click", t, () => pe.more()), I(e, t);
														}, u = (e) => {
															var t = nA(), n = ge(t, !0);
															G(() => w(n, z(q) ? z(de).noMatches : z(de).noNodes)), I(e, t);
														};
														P(s, (e) => {
															z(Be) ? e(c) : m() && pe.next ? e(l, 1) : z(Oe).length === 0 && e(u, 2);
														}), I(e, n);
													},
													$$slots: { default: !0 }
												});
											},
											$$slots: { default: !0 }
										});
									}), I(e, n);
								},
								$$slots: { default: !0 }
							});
						}), I(e, n);
					},
					$$slots: { default: !0 }
				});
			}), D(n), I(e, n);
		},
		$$slots: { default: !0 }
	}), I(e, ct), y(st);
}
we([
	"mousedown",
	"click",
	"input",
	"keydown"
]), U(oA, {
	nodes: { type: "Array" },
	source: { type: "Object" },
	value: { attribute: "value" },
	multiple: {
		attribute: "multiple",
		type: "Boolean"
	},
	max: {
		attribute: "max",
		type: "Number"
	},
	placeholder: {
		attribute: "placeholder",
		type: "String"
	},
	label: {
		attribute: "label",
		type: "String"
	},
	loading: {
		attribute: "loading",
		type: "Boolean"
	},
	disabled: {
		attribute: "disabled",
		reflect: !0,
		type: "Boolean"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" },
	name: {
		attribute: "name",
		reflect: !0,
		type: "String"
	},
	required: {
		attribute: "required",
		type: "Boolean"
	},
	readonly: {
		attribute: "readonly",
		reflect: !0,
		type: "Boolean"
	},
	description: {
		attribute: "description",
		type: "String"
	},
	error: {
		attribute: "error",
		type: "String"
	},
	invalid: {
		attribute: "invalid",
		type: "Boolean"
	}
}, [], [], {
	mode: "open",
	delegatesFocus: !0
}, Er);
//#endregion
//#region src/kit/form/owned.ts
var sA = "data-af-owned", cA = (e) => e instanceof Element && e.hasAttribute("data-af-owned");
function lA(e, t, n) {
	let r = e.firstChild;
	for (let n of t) n === r ? r = n.nextSibling : e.insertBefore(n, r);
	let i = !0, a = e.lastChild;
	for (let e = n.length - 1; e >= 0; e--) {
		if (a !== n[e]) {
			i = !1;
			break;
		}
		a = a.previousSibling;
	}
	if (!i) for (let t of n) e.append(t);
}
function uA(e, t, n) {
	let r = [...t], i = [...n];
	lA(e, r, i);
	let a = new MutationObserver(() => lA(e, r, i));
	return a.observe(e, { childList: !0 }), () => a.disconnect();
}
function dA(e, t) {
	for (let [n, { attribute: r, type: i }] of Object.entries(t)) Object.defineProperty(e.prototype, n, {
		configurable: !0,
		enumerable: !0,
		get() {
			return i === "Boolean" ? this.hasAttribute(r) : this.getAttribute(r);
		},
		set(e) {
			(i === "Boolean" ? !e : e == null) ? this.removeAttribute(r) : this.setAttribute(r, i === "Boolean" ? "" : String(e));
		}
	});
}
//#endregion
//#region src/kit/form/field.ts
var fA = {
	label: {
		attribute: "label",
		type: "String"
	},
	description: {
		attribute: "description",
		type: "String"
	},
	error: {
		attribute: "error",
		type: "String"
	},
	invalid: {
		attribute: "invalid",
		type: "Boolean"
	},
	required: {
		attribute: "required",
		type: "Boolean"
	},
	readonly: {
		attribute: "readonly",
		type: "Boolean"
	},
	edited: {
		attribute: "edited",
		type: "Boolean"
	},
	lockedReason: {
		attribute: "locked-reason",
		type: "String"
	},
	locale: {
		attribute: "locale",
		type: "String"
	}
}, pA = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/></svg>", mA = 0, hA = (e) => e.constructor.kitVersion !== void 0, gA = (e) => /^(radiogroup|group)$/.test(e.getAttribute("role") ?? ""), _A = (e) => e instanceof HTMLInputElement || e instanceof HTMLSelectElement || e instanceof HTMLTextAreaElement;
function vA(e, t) {
	let n = document.createElement(e);
	return n.className = t, n.setAttribute(sA, ""), n;
}
var yA = class extends HTMLElement {
	static observedAttributes = [
		"label",
		"description",
		"error",
		"invalid",
		"required",
		"readonly",
		"edited",
		"locked-reason",
		"name",
		"locale"
	];
	#e = null;
	#t = `af-field-${++mA}`;
	#n = vA("div", "af-field-row");
	#r = vA("label", "af-field-label");
	#i = vA("p", "af-field-description");
	#a = vA("p", "af-field-error");
	#o = Object.assign(document.createElement("span"), {
		className: "af-field-required",
		textContent: "*"
	});
	#s = document.createElement("af-tooltip");
	#c = Object.assign(document.createElement("button"), {
		type: "button",
		className: "af-button ghost icon xs af-field-lock",
		innerHTML: pA
	});
	#l = null;
	#u = null;
	#d = !1;
	#f = null;
	#p = /* @__PURE__ */ new WeakSet();
	constructor() {
		super(), this.#r.id = `${this.#t}-label`, this.#i.id = `${this.#t}-description`, this.#a.id = `${this.#t}-error`, this.#n.append(this.#r), this.#o.setAttribute("aria-hidden", "true"), this.#s.append(this.#c), this.#r.addEventListener("click", () => {
			let e = this.#f?.control;
			e && hA(e) && e.focus();
		});
	}
	get strings() {
		return this.#e;
	}
	set strings(e) {
		this.#e = e ?? null, this.#h();
	}
	get name() {
		let e = this.getAttribute("name");
		if (e !== null) return e;
		let t = this.control;
		return t?.getAttribute("name") ?? t?.querySelector("[name]")?.getAttribute("name") ?? null;
	}
	set name(e) {
		e == null ? this.removeAttribute("name") : this.setAttribute("name", String(e));
	}
	get control() {
		for (let e of this.children) if (!cA(e) && !e.hasAttribute("slot")) return e;
		return null;
	}
	connectedCallback() {
		this.#d = !0;
		for (let e of [
			...Object.keys(fA),
			"strings",
			"name"
		]) if (Object.prototype.hasOwnProperty.call(this, e)) {
			let t = this[e];
			delete this[e], this[e] = t;
		}
		this.#u = new MutationObserver(() => this.#m()), this.#u.observe(this, {
			childList: !0,
			attributes: !0,
			attributeFilter: ["class"]
		}), this.#h();
	}
	disconnectedCallback() {
		this.#d = !1, this.#u?.disconnect(), this.#u = null, this.#l?.stop(), this.#l = null;
	}
	attributeChangedCallback() {
		this.#h();
	}
	#m() {
		this.classList.contains("af-field") || this.classList.add("af-field"), this.#g();
	}
	#h() {
		if (!this.#d) return;
		this.classList.contains("af-field") || this.classList.add("af-field");
		let e = c(this.locale, this.#e ?? void 0), t = this.lockedReason || null;
		this.#r.replaceChildren(this.label ?? ""), this.required && this.#r.append(this.#o), t ? (this.#s.setAttribute("text", t), this.#c.setAttribute("aria-label", e.locked), this.#s.parentNode !== this.#n && this.#n.append(this.#s)) : this.#s.remove();
		let n = this.description || null;
		if (this.#i.replaceChildren(n ?? ""), t) {
			let e = document.createElement("span");
			e.setAttribute("data-af-hidden", ""), e.textContent = n ? ` ${t}` : t, this.#i.append(e);
		}
		this.#i.toggleAttribute("data-af-hidden", !n && !!t), this.#a.textContent = this.error ?? "";
		let r = this.label || t || this.required ? [this.#n] : [], i = [...n || t ? [this.#i] : [], ...this.error ? [this.#a] : []];
		for (let e of [
			this.#n,
			this.#i,
			this.#a
		]) [...r, ...i].includes(e) || e.remove();
		let a = (e, t) => e.length === t.length && e.every((e, n) => e === t[n]);
		(!this.#l || !a(this.#l.first, r) || !a(this.#l.last, i)) && (this.#l?.stop(), this.#l = {
			first: r,
			last: i,
			stop: uA(this, r, i)
		}), this.#g();
	}
	#g() {
		if (!this.#d) return;
		let e = this.control;
		if (this.#f && this.#f.control !== e && (this.#_(this.#f), this.#f = null), !e) {
			this.#r.removeAttribute("for");
			return;
		}
		let t = this.#f ?? {
			control: e,
			labelledBy: !1,
			required: !1,
			readOnly: !1,
			ariaReadonly: !1,
			ariaInvalid: !1,
			ariaRequired: !1,
			kit: {}
		};
		this.#f = t;
		let n = this.lockedReason || null, r = this.readonly || !!n, i = [...this.description || n ? [this.#i.id] : [], ...this.error ? [this.#a.id] : []], a = e.localName.includes("-") ? customElements.get(e.localName) : void 0;
		if (e.localName.includes("-") && !(a && e instanceof a)) {
			this.#p.has(e) || (this.#p.add(e), customElements.whenDefined(e.localName).then(() => this.#g()));
			return;
		}
		if (hA(e)) {
			this.#r.removeAttribute("for");
			let i = {
				label: this.label,
				description: [this.description, n].filter(Boolean).join(" ") || null,
				error: this.error,
				invalid: this.invalid || !!this.error || null,
				required: this.required || null,
				readonly: r || null
			}, a = e;
			for (let e of Object.keys(i)) {
				let n = i[e];
				if (n !== null) {
					if (a[e] === n) continue;
					e in t.kit || (t.kit[e] = a[e]), a[e] = n;
				} else e in t.kit && (a[e] = t.kit[e], delete t.kit[e]);
			}
			return;
		}
		gA(e) ? (this.#r.removeAttribute("for"), e.setAttribute("aria-labelledby", this.#r.id), t.labelledBy = !0) : (e.id ||= `${this.#t}-control`, this.#r.htmlFor = e.id);
		let o = /* @__PURE__ */ new Set([this.#i.id, this.#a.id]), s = [...(e.getAttribute("aria-describedby") ?? "").split(/\s+/).filter((e) => e && !o.has(e)), ...i];
		s.length ? e.setAttribute("aria-describedby", s.join(" ")) : e.removeAttribute("aria-describedby"), this.invalid || this.error ? e.getAttribute("aria-invalid") !== "true" && (e.setAttribute("aria-invalid", "true"), t.ariaInvalid = !0) : t.ariaInvalid &&= (e.removeAttribute("aria-invalid"), !1), this.required ? (e.getAttribute("aria-required") !== "true" && (e.setAttribute("aria-required", "true"), t.ariaRequired = !0), _A(e) && !e.required && (e.required = !0, t.required = !0)) : (t.ariaRequired && e.removeAttribute("aria-required"), t.required && _A(e) && (e.required = !1), t.ariaRequired = !1, t.required = !1), e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement ? r && !e.readOnly ? (e.readOnly = !0, t.readOnly = !0) : !r && t.readOnly && (e.readOnly = !1, t.readOnly = !1) : (e instanceof HTMLSelectElement || e.getAttribute("role") === "radiogroup") && (r && e.getAttribute("aria-readonly") !== "true" ? (e.setAttribute("aria-readonly", "true"), t.ariaReadonly = !0) : !r && t.ariaReadonly && (e.removeAttribute("aria-readonly"), t.ariaReadonly = !1));
	}
	#_(e) {
		let { control: t } = e;
		if (hA(t)) {
			for (let [n, r] of Object.entries(e.kit)) t[n] = r;
			return;
		}
		e.labelledBy && t.getAttribute("aria-labelledby") === this.#r.id && t.removeAttribute("aria-labelledby");
		let n = /* @__PURE__ */ new Set([this.#i.id, this.#a.id]), r = (t.getAttribute("aria-describedby") ?? "").split(/\s+/).filter((e) => e && !n.has(e));
		r.length ? t.setAttribute("aria-describedby", r.join(" ")) : t.removeAttribute("aria-describedby"), e.ariaInvalid && t.removeAttribute("aria-invalid"), e.ariaRequired && t.removeAttribute("aria-required"), e.required && _A(t) && (t.required = !1), e.readOnly && (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) && (t.readOnly = !1), e.ariaReadonly && t.removeAttribute("aria-readonly");
	}
};
dA(yA, fA);
//#endregion
//#region src/kit/form/fieldset.ts
var bA = {
	heading: {
		attribute: "heading",
		type: "String"
	},
	description: {
		attribute: "description",
		type: "String"
	},
	locale: {
		attribute: "locale",
		type: "String"
	}
}, xA = 4, SA = 0, CA = (e) => {
	let t = Math.round(Number(e));
	return Number.isFinite(t) ? Math.max(1, Math.min(xA, t)) : 1;
};
function wA(e, t) {
	let n = e.getAttribute("data-span"), r = e.getAttribute("data-col");
	if (n === null && r === null) return null;
	let i = (e) => {
		let t = Math.trunc(Number(e ?? 1));
		return Number.isFinite(t) ? t : 1;
	}, a = Math.max(1, Math.min(t, i(n))), o = Math.max(1, Math.min(t, i(r)));
	return t > 1 ? `${Math.min(o, t - a + 1)} / span ${a}` : `span ${a} / span ${a}`;
}
var TA = class extends HTMLElement {
	static observedAttributes = [
		"heading",
		"description",
		"columns",
		"locale"
	];
	#e = null;
	#t = `af-fieldset-${++SA}`;
	#n = Object.assign(document.createElement("legend"), { className: "af-fieldset-legend" });
	#r = Object.assign(document.createElement("div"), { className: "af-fieldset-legend" });
	#i = Object.assign(document.createElement("p"), { className: "af-fieldset-description" });
	#a = null;
	#o = null;
	#s = null;
	#c = !1;
	#l = /* @__PURE__ */ new WeakSet();
	#u = !1;
	constructor() {
		super();
		for (let e of [
			this.#n,
			this.#r,
			this.#i
		]) e.setAttribute(sA, "");
		this.#r.id = `${this.#t}-heading`;
	}
	get strings() {
		return this.#e;
	}
	set strings(e) {
		this.#e = e ?? null;
	}
	get columns() {
		return CA(this.getAttribute("columns"));
	}
	set columns(e) {
		e == null ? this.removeAttribute("columns") : this.setAttribute("columns", String(e));
	}
	connectedCallback() {
		this.#c = !0;
		for (let e of [
			...Object.keys(bA),
			"strings",
			"columns"
		]) if (Object.prototype.hasOwnProperty.call(this, e)) {
			let t = this[e];
			delete this[e], this[e] = t;
		}
		this.#s = new MutationObserver((e) => {
			e.some((e) => e.target === this) ? this.#d() : this.#f();
		}), this.#d();
	}
	disconnectedCallback() {
		this.#c = !1, this.#s?.disconnect(), this.#s = null, this.#o?.stop(), this.#o = null, this.#a = null;
	}
	attributeChangedCallback() {
		this.#d();
	}
	#d() {
		if (!this.#c) return;
		this.classList.contains("af-fieldset") || this.classList.add("af-fieldset"), this.setAttribute("data-af-columns", String(this.columns));
		let e = null;
		for (let t of this.children) if (t instanceof HTMLFieldSetElement && !cA(t)) {
			e = t;
			break;
		}
		let t = e ?? this, n = e ? this.#n : this.#r;
		(e ? this.#r : this.#n).remove(), n.textContent = this.heading ?? "", this.#i.textContent = this.description ?? "";
		let r = [...this.heading ? [n] : [], ...this.description ? [this.#i] : []];
		for (let e of [n, this.#i]) r.includes(e) || e.remove();
		!e && this.heading ? (this.hasAttribute("role") || this.setAttribute("role", "group"), this.setAttribute("aria-labelledby", this.#r.id), this.#u = !0) : this.#u &&= (this.getAttribute("role") === "group" && this.removeAttribute("role"), this.removeAttribute("aria-labelledby"), !1);
		let i = this.#o;
		if ((!i || i.grid !== t || i.first.length !== r.length || i.first.some((e, t) => e !== r[t])) && (i?.stop(), this.#o = {
			grid: t,
			first: r,
			stop: uA(t, r, [])
		}), this.#a !== t) {
			if (this.#a) for (let e of this.#a.children) this.#p(e);
			this.#a = t, this.#s?.disconnect(), this.#s?.observe(this, { childList: !0 }), e ? this.#s?.observe(e, {
				childList: !0,
				attributes: !0,
				subtree: !0,
				attributeFilter: ["data-span", "data-col"]
			}) : this.#s?.observe(this, {
				childList: !0,
				attributes: !0,
				subtree: !0,
				attributeFilter: ["data-span", "data-col"]
			});
		}
		this.#f();
	}
	#f() {
		let e = this.#a;
		if (!e) return;
		let t = this.columns;
		for (let n of e.children) {
			if (cA(n) || !(n instanceof HTMLElement)) continue;
			let e = wA(n, t);
			e === null ? this.#p(n) : n.style.getPropertyValue("grid-column") !== e && (n.style.setProperty("grid-column", e), this.#l.add(n));
		}
	}
	#p(e) {
		e instanceof HTMLElement && this.#l.has(e) && (e.style.removeProperty("grid-column"), this.#l.delete(e));
	}
};
dA(TA, bA);
//#endregion
//#region src/kit/form/form.ts
var EA = {
	busy: {
		attribute: "busy",
		type: "Boolean"
	},
	dirty: {
		attribute: "dirty",
		type: "Boolean"
	},
	locale: {
		attribute: "locale",
		type: "String"
	}
}, DA = "button:not([type]), [type=submit]", OA = (e) => e.replace(/^\//, "").replace(/\//g, ".");
function kA(e) {
	let t = e.control;
	if (!(t instanceof HTMLElement)) return;
	t.focus();
	let n = t.getRootNode().activeElement;
	(!n || n !== t && !t.contains(n)) && t.querySelector("input, select, textarea, button, [tabindex]:not([tabindex=\"-1\"])")?.focus();
}
var AA = class extends HTMLElement {
	static observedAttributes = [
		"busy",
		"dirty",
		"locale"
	];
	#e = null;
	#t = [];
	#n = !1;
	#r = !1;
	#i = null;
	#a = /* @__PURE__ */ new Map();
	#o = /* @__PURE__ */ new Set();
	#s = document.createElement("div");
	#c = null;
	#l = {
		unmatched: [],
		matched: []
	};
	#u = null;
	#d = Object.assign(document.createElement("div"), { className: "af-banner-title" });
	#f = !1;
	constructor() {
		super(), this.#s.className = "af-form-summary af-banner danger", this.#s.setAttribute(sA, ""), this.#s.setAttribute("role", "alert"), this.#s.tabIndex = -1, this.addEventListener("submit", this.#m);
	}
	get strings() {
		return this.#e;
	}
	set strings(e) {
		this.#e = e ?? null, this.#x();
	}
	get errors() {
		return this.#t;
	}
	set errors(e) {
		let t = Array.isArray(e) ? e : [], n = t.length === this.#t.length && t.every((e, t) => e.path === this.#t[t].path && e.message === this.#t[t].message);
		this.#t = t, this.#b(t.length > 0 && !n);
	}
	get #p() {
		for (let e of this.children) if (e instanceof HTMLFormElement && !cA(e)) return e;
		return null;
	}
	connectedCallback() {
		for (let e of [
			...Object.keys(EA),
			"strings",
			"errors"
		]) if (Object.prototype.hasOwnProperty.call(this, e)) {
			let t = this[e];
			delete this[e], this[e] = t;
		}
		this.#n = !0, this.#i = new MutationObserver(() => this.#_()), this.#i.observe(this, {
			childList: !0,
			subtree: !0
		}), this.#_(), this.#g(), this.#t.length && queueMicrotask(() => this.#b(!1));
	}
	disconnectedCallback() {
		this.#n = !1, this.#i?.disconnect(), this.#i = null, this.#c?.stop(), this.#c = null, this.#g();
	}
	attributeChangedCallback(e, t, n) {
		e === "busy" ? (t !== null && n === null && (this.#r = !1), this.#v()) : e === "dirty" ? this.#g() : e === "locale" && this.#x();
	}
	#m = (e) => {
		let t = this.#p;
		if (!t || e.target !== t || (e.preventDefault(), this.#r || this.busy)) return;
		this.#r = !0;
		let r = e.submitter ?? null, i;
		try {
			i = new FormData(t, r);
		} catch {
			i = new FormData(t);
		}
		n(this, "af-submit", {
			formData: i,
			submitter: r
		}), setTimeout(() => {
			this.busy || (this.#r = !1);
		}, 0);
	};
	#h = (e) => {
		e.preventDefault(), e.returnValue = "";
	};
	#g() {
		let e = this.#n && this.dirty;
		e !== this.#f && (this.#f = e, e ? window.addEventListener("beforeunload", this.#h) : window.removeEventListener("beforeunload", this.#h));
	}
	#_() {
		this.#n && (this.#c && this.#c.form !== this.#p && (this.#c.stop(), this.#c = null, this.#s.remove()), this.#v());
	}
	#v() {
		let e = this.#p, t = new Set(this.busy && this.#n && e ? e.querySelectorAll(DA) : []);
		for (let e of this.#o) t.has(e) || (e.getAttribute("aria-disabled") === "true" && e.removeAttribute("aria-disabled"), this.#o.delete(e));
		for (let e of t) e.getAttribute("aria-disabled") !== "true" && (e.setAttribute("aria-disabled", "true"), this.#o.add(e));
	}
	#y() {
		let e = this.#p;
		return e ? [...e.querySelectorAll("af-field")].filter((e) => e instanceof yA) : [];
	}
	#b(e) {
		if (!this.#n) return;
		let t = this.#p, n = this.#y(), r = /* @__PURE__ */ new Map();
		for (let { path: e, message: t } of this.#t) {
			let n = OA(String(e ?? ""));
			r.set(n, [...r.get(n) ?? [], String(t ?? "")]);
		}
		let i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set();
		for (let e of n) {
			let t = e.name;
			t && r.has(t) && (a.add(t), i.set(e, r.get(t).join(" ")));
		}
		for (let [e, t] of this.#a) {
			let n = i.get(e);
			e.error === t.ours ? n === void 0 ? (e.error = t.before, this.#a.delete(e)) : n !== t.ours && (t.ours = n, e.error = n) : this.#a.delete(e);
		}
		for (let [e, t] of i) this.#a.has(e) || (this.#a.set(e, {
			ours: t,
			before: e.error
		}), e.error = t);
		let o = [...i.keys()], s = [...r].filter(([e]) => !a.has(e)).flatMap(([, e]) => e);
		this.#l = {
			unmatched: s,
			matched: o
		}, s.length && t ? (this.#x(), this.#c ||= {
			form: t,
			stop: uA(t, [this.#s], [])
		}) : (this.#c?.stop(), this.#c = null, this.#s.remove()), e && (this.#c ? this.#s.focus() : o[0] && kA(o[0]));
	}
	#x() {
		let { unmatched: e, matched: t } = this.#l;
		if (!e.length) return;
		let n = c(this.locale, this.#e ?? void 0);
		this.#d.textContent !== n.formErrors && (this.#d.textContent = n.formErrors);
		let r = t.map((e) => ({
			field: e,
			label: e.label || e.name || ""
		})), i = this.#u;
		if (!(i !== null && i.unmatched.length === e.length && i.unmatched.every((t, n) => t === e[n]) && i.links.length === r.length && i.links.every((e, t) => e.field === r[t].field && e.label === r[t].label))) {
			let t = Object.assign(document.createElement("ul"), { className: "af-banner-description" });
			for (let n of e) t.append(Object.assign(document.createElement("li"), { textContent: n }));
			for (let { field: e, label: n } of r) {
				let r = Object.assign(document.createElement("a"), {
					href: "#",
					textContent: n
				});
				r.addEventListener("click", (t) => {
					t.preventDefault(), kA(e);
				});
				let i = document.createElement("li");
				i.append(r), t.append(i);
			}
			this.#u = {
				unmatched: e,
				links: r
			}, this.#s.replaceChildren(this.#d, t);
		}
	}
};
dA(AA, EA);
//#endregion
//#region src/kit/fonts.ts
var jA = Symbol.for("@reflexify/agentflow-elements/kit/fonts");
function MA() {
	let e = globalThis;
	return e[jA] ??= {
		faces: /* @__PURE__ */ new Map(),
		ours: /* @__PURE__ */ new WeakSet()
	};
}
function NA(e) {
	return e.trim().replace(/^(["'])(.*)\1$/, "$2").trim().toLowerCase();
}
function PA(e) {
	let t = Object.entries(e.descriptors ?? {}).sort(([e], [t]) => e.localeCompare(t));
	return JSON.stringify([
		e.family,
		e.url,
		t
	]);
}
function FA(e, t) {
	console.warn("A font face did not load; text falls back to the module's font stack.", {
		family: e.family,
		url: e.url,
		error: String(t)
	});
}
function IA(e) {
	if (typeof document > "u" || !document.fonts || typeof FontFace > "u") return Promise.resolve();
	let { faces: t, ours: n } = MA(), r = e.map((e) => {
		let r = PA(e), i = t.get(r);
		if (i) return i;
		let a = NA(e.family);
		for (let e of document.fonts) if (!n.has(e) && NA(e.family) === a) return Promise.resolve();
		let o;
		try {
			let t = new FontFace(e.family, `url(${JSON.stringify(e.url)})`, e.descriptors);
			document.fonts.add(t), n.add(t), o = t.load().then(() => void 0, (t) => FA(e, t));
		} catch (t) {
			FA(e, t), o = Promise.resolve();
		}
		return t.set(r, o), o;
	});
	return Promise.all(r).then(() => void 0);
}
//#endregion
//#region src/kit/index.ts
var LA = {
	"af-dialog": x_,
	"af-confirm": Ff,
	"af-menu": fy,
	"af-popover": Gx,
	"af-tooltip": jO,
	"af-toast": tO,
	"af-date": g_,
	"af-person-picker": cx,
	"af-number-input": Fb,
	"af-select": bC,
	"af-combobox": pd,
	"af-rich-editor": lS,
	"af-tile": qE,
	"af-field": { element: yA },
	"af-fieldset": { element: TA },
	"af-form": { element: AA },
	"af-scroll-area": fS,
	"af-tabs": HE,
	"af-splitter": oE,
	"af-pager": Kb,
	"af-copy-button": Vf,
	"af-markdown": E_,
	"af-tree-picker": oA,
	"af-bulk-bar": Sr,
	"af-file-upload": um,
	"af-signature-pad": Zw,
	"af-folder-source": f
}, RA = Object.keys(LA);
for (let e of Object.values(LA)) Object.defineProperty(e.element, "kitVersion", { value: Ce });
function zA(e = customElements) {
	for (let [t, n] of Object.entries(LA)) {
		let r = e.get(t);
		if (!r) e.define(t, n.element);
		else if (r !== n.element) {
			let e = r.kitVersion;
			be(e, Ce) && console.warn(`An older copy of the AgentFlow UI kit registered ${t} first; this page uses it, not this copy.`, {
				tag: t,
				registered: e ?? null,
				loaded: Ce
			});
		}
	}
}
zA();
//#endregion
export { o as KIT_CSS, RA as KIT_TAGS, Ce as KIT_VERSION, Kn as claimEscape, zA as defineKitElements, IA as loadFonts };
