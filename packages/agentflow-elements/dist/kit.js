import { _ as e, a as t, c as n, d as r, f as i, g as a, h as o, i as s, l as c, m as l, o as u, p as d, r as f, s as p, t as m, u as h } from "./chunks/FolderSource-CnEsHnTl.js";
import { $ as g, B as _, C as v, Ct as y, D as b, Dt as x, F as ee, Ft as S, H as te, I as C, It as w, J as T, K as ne, L as E, M as re, Mt as ie, N as D, Nt as O, O as ae, Ot as k, P as oe, Pt as se, Q as ce, R as le, S as ue, St as A, T as j, U as M, V as N, W as de, X as P, Y as F, Z as I, _ as L, _t as R, at as z, b as fe, bt as B, ct as pe, dt as me, et as he, ft as V, g as H, gt as ge, ht as U, it as _e, j as ve, lt as W, mt as ye, nt as be, ot as xe, pt as G, q as Se, r as Ce, rt as we, st as Te, t as Ee, tt as De, ut as Oe, v as K, vt as q, w as ke, y as J, yt as Ae, z as je } from "./chunks/version-DyshBDr6.js";
import { s as Me, t as Ne } from "./chunks/Loading-BoryAWcu.js";
import { $ as Pe, $t as Fe, A as Y, At as Ie, B as Le, Bt as Re, C as ze, Ct as Be, D as Ve, Dt as He, E as Ue, Et as We, F as Ge, Ft as Ke, G as qe, Gt as Je, H as Ye, Ht as Xe, I as Ze, It as Qe, J as $e, Jt as et, K as tt, Kt as nt, L as rt, Lt as it, M as at, Mt as ot, N as st, Nt as ct, O as lt, Ot as ut, P as dt, Pt as ft, Q as pt, Qt as mt, R as ht, Rt as gt, S as _t, St as vt, T as yt, Tt as bt, U as xt, Ut as St, V as Ct, Vt as wt, W as Tt, Wt as Et, X as Dt, Xt as Ot, Y as kt, Yt as At, Z as jt, Zt as Mt, _ as Nt, _t as Pt, a as Ft, an as It, at as Lt, b as Rt, bt as zt, c as Bt, cn as Vt, ct as Ht, d as Ut, dt as Wt, en as Gt, et as Kt, f as X, ft as qt, g as Jt, gt as Z, h as Yt, ht as Xt, i as Zt, in as Qt, it as $t, j as en, jt as tn, k as nn, kt as rn, l as an, ln as on, lt as sn, m as cn, mt as ln, n as un, nn as dn, nt as fn, o as pn, on as mn, ot as hn, p as gn, pt as _n, q as vn, qt as yn, r as bn, rn as xn, rt as Sn, s as Cn, sn as wn, st as Tn, t as En, tn as Dn, tt as On, u as Q, ut as kn, v as An, vt as jn, w as Mn, wt as Nn, x as Pn, xt as Fn, y as In, yt as Ln, z as Rn, zt as zn } from "./chunks/Scroller-DQsH6-zE.js";
import { a as Bn, c as Vn, i as Hn, l as Un, n as Wn, o as Gn, r as Kn, s as qn, t as Jn } from "./chunks/floating-ui.dom-ohCmVTxo.js";
import { claimEscape as Yn, isClaimed as Xn } from "./escape.js";
import { c as Zn, i as Qn } from "./chunks/mention-chip-BxnXPO1a.js";
//#region ../agentflow-sdk/dist/conventions/dates.js
var $n = /^(\d{4})-(\d{2})-(\d{2})$/, er = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, tr = (e) => String(e).padStart(2, "0"), nr = (e) => /^vi(-|$)/i.test(e ?? "");
function rr(e, t, n) {
	let r = new Date(Date.UTC(2e3, t - 1, n));
	return r.setUTCFullYear(e), r.getUTCFullYear() !== e || r.getUTCMonth() !== t - 1 || r.getUTCDate() !== n ? null : `${String(e).padStart(4, "0")}-${tr(t)}-${tr(n)}`;
}
function ir(e) {
	let t = $n.exec(e ?? "");
	return t ? rr(Number(t[1]), Number(t[2]), Number(t[3])) : null;
}
function ar(e) {
	let t = e.trim(), n = er.exec(t);
	return n ? rr(Number(n[3]), Number(n[2]), Number(n[1])) : ir(t);
}
function or(e, t) {
	let n = nr(t), r = n ? {
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
var sr = /DD|MM|YYYY/g;
function cr(e) {
	if (!e) return null;
	let t = e.match(sr), n = e.split(sr);
	if (!t || t.length !== 3 || new Set(t).size !== 3) return null;
	let [r, i, a, o] = n;
	return r !== "" || o !== "" || /\p{L}/u.test(i + a) ? null : {
		tokens: t,
		between: [i, a]
	};
}
function lr(e) {
	return cr(e) !== null;
}
function ur(e, t) {
	let n = cr(t), r = ir(e);
	if (!n || !r) return null;
	let i = {
		YYYY: r.slice(0, 4),
		MM: r.slice(5, 7),
		DD: r.slice(8, 10)
	};
	return n.tokens.map((e, t) => i[e] + (n.between[t] ?? "")).join("");
}
function dr(e, t) {
	let n = cr(t);
	if (!n) return null;
	let r = (e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), i = (e, t) => e === "YYYY" ? "(\\d{4})" : n.between[t - 1] === "" || n.between[t] === "" ? "(\\d{2})" : "(\\d{1,2})", a = n.tokens.map((e, t) => i(e, t) + r(n.between[t] ?? "")).join(""), o = RegExp(`^${a}$`).exec(e.trim());
	if (!o) return null;
	let s = (e) => Number(o[n.tokens.indexOf(e) + 1]);
	return rr(s("YYYY"), s("MM"), s("DD"));
}
function fr(e = /* @__PURE__ */ new Date()) {
	return `${String(e.getFullYear()).padStart(4, "0")}-${tr(e.getMonth() + 1)}-${tr(e.getDate())}`;
}
//#endregion
//#region ../agentflow-sdk/dist/conventions/match.js
function pr(e) {
	return e.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
}
function mr(e, t) {
	return pr(e ?? "").includes(pr(t.trim()));
}
//#endregion
//#region src/kit/BulkBar.svelte
var hr = "button, a[href], input, select, textarea, [role=\"button\"], [tabindex]";
function gr(e) {
	return e.matches(hr) ? e : e.querySelector(hr) ?? e;
}
var _r = (e) => !e.matches(":disabled") && e.getAttribute("aria-disabled") !== "true", vr = (e) => (e.textContent ?? "").replace(/\s+/g, " ").trim() || e.getAttribute("aria-label") || e.title;
function yr(t) {
	let n = t.shadowRoot;
	for (let t of n?.querySelector("slot")?.assignedElements() ?? []) {
		let n = gr(t);
		if (t.hasAttribute("data-overflow") || !_r(n)) continue;
		n.focus();
		let r = h();
		if (r && e(t, r)) return;
	}
	n?.querySelector("[part~=\"clear\"]")?.focus();
}
var br = I("<span class=\"words svelte-i31wrt\"> </span>"), xr = I("<span part=\"count\" class=\"count svelte-i31wrt\"> </span><!>", 1), Sr = I("<!><!>", 1), Cr = I("<af-menu><svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"1\"></circle><circle cx=\"19\" cy=\"12\" r=\"1\"></circle><circle cx=\"5\" cy=\"12\" r=\"1\"></circle></svg></af-menu>", 2), wr = I("<!> <div class=\"af-kit svelte-i31wrt\"><div part=\"status\" role=\"status\" class=\"live svelte-i31wrt\"> </div> <div part=\"bar\" popover=\"manual\"><span part=\"text\" class=\"summary svelte-i31wrt\"><!></span> <div class=\"tail svelte-i31wrt\"><div><!> <!></div> <button type=\"button\" part=\"clear\" class=\"af-button ghost sm clear svelte-i31wrt\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg> </button></div></div></div>", 1), Tr = {
	hash: "svelte-i31wrt",
	code: ":host {display:contents;}.af-kit.svelte-i31wrt {display:contents;}.live.svelte-i31wrt {position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;}.bar[popover].svelte-i31wrt {inset:auto 0 24px 0;box-sizing:border-box;width:max-content;max-width:calc(100vw - 2rem);margin:0 auto;padding:10px 12px 10px 16px;border:0;border-radius:calc(var(--k-radius) + 4px);background:var(--k-fg);color:var(--k-surface);box-shadow:0 25px 50px -12px rgb(0 0 0 / 0.25);overflow:visible;}.bar[popover].svelte-i31wrt:popover-open {display:flex;align-items:center;gap:12px;}.bar.wide.svelte-i31wrt {width:calc(100vw - 2rem);}.summary.svelte-i31wrt {display:flex;flex:none;align-items:center;gap:8px;font-size:13px;font-weight:600;line-height:1.5;}.words.svelte-i31wrt {min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.count.svelte-i31wrt {flex:none;border-radius:calc(var(--k-radius) - 2px);padding:2px 8px;background:var(--k-surface);color:var(--k-fg);font-variant-numeric:tabular-nums;}.bar.svelte-i31wrt[data-compact] .summary:where(.svelte-i31wrt) {flex:0 1 auto;min-width:0;}.bar.svelte-i31wrt[data-compact] .tail:where(.svelte-i31wrt) {min-width:min-content;}.tail.svelte-i31wrt {display:flex;flex:0 1 auto;align-items:center;gap:8px;min-width:0;margin-left:auto;color:color-mix(in oklab, var(--k-surface) 75%, transparent);--k-accent: color-mix(in oklab, var(--k-surface) calc(10% + var(--k-dark, 0) * 10%), transparent);--k-accent-fg: var(--k-surface);}.actions.svelte-i31wrt {display:flex;flex:0 1 auto;align-items:center;gap:8px;min-width:0;}.actions.empty.svelte-i31wrt {display:none;}.actions.svelte-i31wrt ::slotted([data-overflow]) {display:none !important;}.more.svelte-i31wrt {display:block;flex:none;width:32px;height:32px;}.more.idle.svelte-i31wrt {position:absolute;visibility:hidden;pointer-events:none;}.more.svelte-i31wrt::part(trigger) {width:32px;height:32px;padding:0;color:color-mix(in oklab, var(--k-surface) 75%, transparent);}\n  @media (hover: hover) {.more.svelte-i31wrt::part(trigger):hover {background:color-mix(in oklab, var(--k-surface) 10%, transparent);color:var(--k-surface);} }button.af-button.sm.clear.svelte-i31wrt {gap:4px;}"
};
function Er(r, i) {
	k(i, !0), ee(r, Tr);
	let o = L(i, "count", 7, 0), c = L(i, "total", 7, null), l = L(i, "label", 7, null), f = L(i, "locale", 7, null), p = L(i, "strings", 7, null), m = i.$$host, g = y(() => u(f(), p() ?? void 0)), _ = y(() => new Intl.NumberFormat(t(f()) ? "vi-VN" : "en-GB")), v = y(() => Number(o()) > 0), S = y(() => z(_).format(Number(o()) || 0)), te = y(() => Number.isFinite(Number(c())) && Number(c()) > 0), C = y(() => s(z(te) ? z(g).selectedOfTotal : z(g).selectedCount, { total: z(_).format(Number(c())) })), w = y(() => z(C).split("{count}")), ne = y(() => l() || s(z(C), { count: z(S) })), E = B(null), ie = B(null), D = B(null), ae = B(!1), oe = B([]), se = B([]), ce = (e) => e?.getBoundingClientRect().width ?? 0, le = () => z(ie)?.querySelector("slot") ?? null;
	function ue() {
		let e = z(ie), t = le()?.assignedElements() ?? [];
		for (let e of t) e.removeAttribute("data-overflow");
		if (!e) return;
		z(E)?.removeAttribute("data-compact");
		let n = ce(e), r = parseFloat(getComputedStyle(e).columnGap) || 0, i = t.map(ce), a = t.length;
		if (i.reduce((e, t) => e + t, 0) + r * Math.max(0, t.length - 1) > n + .5) {
			let e = n - ce(z(D)) - r, t = 0;
			for (a = 0; a < i.length; a++) {
				let n = t + (a ? r : 0) + i[a];
				if (n > e) break;
				t = n;
			}
		}
		z(E)?.toggleAttribute("data-compact", a === 0), q(oe, t.slice(a).filter((e) => e !== j));
		for (let e of z(oe)) e.setAttribute("data-overflow", "");
		I();
	}
	let j = null, N = null, de = (e) => e.matches("[data-raised=\"true\"]") || !!e.querySelector("[data-raised=\"true\"]");
	function P(e = !0) {
		N?.disconnect(), N = null, j && (j = null, e && ue());
	}
	Oe(() => () => P(!1));
	function I() {
		q(se, z(oe).map((e, t) => {
			let n = gr(e);
			return {
				id: String(t),
				label: vr(n),
				disabled: !_r(n)
			};
		}));
	}
	function R(e) {
		if (!(e instanceof CustomEvent)) return;
		let t = z(oe)[Number(e.detail?.id)];
		if (!t) return;
		let n = gr(t);
		if (P(), n === t) {
			n.click();
			return;
		}
		j = t, ue();
		let r = t;
		N = new MutationObserver(() => {
			j === r && !de(r) && P();
		}), N.observe(r, {
			attributes: !0,
			attributeFilter: ["data-raised"],
			subtree: !0
		}), n.click(), xe().then(() => {
			j === r && !de(r) && P();
		});
	}
	let pe = null;
	function me() {
		if (pe && z(E)) {
			pe.disconnect(), pe.observe(z(E));
			for (let e of le()?.assignedElements() ?? []) pe.observe(e);
		}
	}
	Oe(() => {
		if (!z(E) || typeof ResizeObserver > "u") return;
		let e = new ResizeObserver(() => ue());
		return pe = e, Te(me), () => {
			e.disconnect(), pe = null;
		};
	}), Oe(() => {
		let e = le();
		if (!e) return;
		let t = () => {
			q(ae, e.assignedElements().length > 0), me(), xe().then(ue);
		};
		return Te(t), _e(e, "slotchange", t);
	}), Oe(() => {
		let t = z(v);
		if (!t) {
			P(!1);
			let t = h();
			t && e(m, t) && t.blur();
		}
		a(z(E), t, m), t && Te(ue);
	}), Oe(() => {
		let e = z(E);
		if (e) return _e(e, "keydown", (t) => {
			if (!(t.key !== "Escape" || t.defaultPrevented || t.isComposing)) {
				for (let n of t.composedPath()) {
					if (n === e) break;
					if (n instanceof HTMLElement && n.dataset.raised === "true") return;
				}
				d(m, "clear", {});
			}
		});
	});
	var he = {
		get count() {
			return o();
		},
		set count(e = 0) {
			o(e), A();
		},
		get total() {
			return c();
		},
		set total(e = null) {
			c(e), A();
		},
		get label() {
			return l();
		},
		set label(e = null) {
			l(e), A();
		},
		get locale() {
			return f();
		},
		set locale(e = null) {
			f(e), A();
		},
		get strings() {
			return p();
		},
		set strings(e = null) {
			p(e), A();
		}
	}, H = wr(), ge = G(H);
	n(ge, {});
	var ve = U(ge, 2), Se = V(ve), Ce = ye(Se, !0), Ee = U(Se, 2);
	let De;
	var K = V(Ee), ke = V(K), J = (e) => {
		var t = br(), n = ye(t, !0);
		W(() => T(n, l())), F(e, t);
	}, Ae = (e) => {
		var t = Sr(), n = G(t), r = (e) => {
			var t = br(), n = ye(t, !0);
			W(() => T(n, z(w)[0])), F(e, t);
		}, i = y(() => z(w)[0]?.trim());
		M(n, (e) => {
			z(i) && e(r);
		});
		var a = U(n), o = (e) => {
			var t = xr(), n = G(t), r = ye(n, !0), i = U(n), a = (e) => {
				var t = br(), n = ye(t, !0);
				W((e) => T(n, e), [() => z(w).slice(1).join(z(S))]), F(e, t);
			}, o = y(() => z(w).slice(1).join(z(S)).trim());
			M(i, (e) => {
				z(o) && e(a);
			}), W(() => T(r, z(S))), F(e, t);
		};
		M(a, (e) => {
			z(w).length > 1 && e(o);
		}), F(e, t);
	};
	M(ke, (e) => {
		l() ? e(J) : e(Ae, -1);
	}), O(K);
	var Me = U(K, 2), Ne = V(Me);
	let Pe;
	var Fe = V(Ne);
	je(Fe, () => "<slot name=\"actions\"></slot>");
	var Y = U(Fe, 2), Ie = (e) => {
		var t = Cr();
		b(t, "part", "more");
		let n;
		W(() => b(t, "items", z(se))), W(() => b(t, "label", z(g).moreActions)), W(() => b(t, "locale", f() || void 0)), W(() => b(t, "strings", p() ?? void 0)), fe(t, (e) => q(D, e), () => z(D)), W(() => n = re(t, 1, "more svelte-i31wrt", null, n, { idle: z(oe).length === 0 })), we("select", t, R), we("pointerdown", t, I, !0), we("keydown", t, I, !0), F(e, t);
	};
	M(Y, (e) => {
		z(v) && e(Ie);
	}), O(Ne), fe(Ne, (e) => q(ie, e), () => z(ie));
	var Le = U(Ne, 2), Re = U(V(Le), 1, !0);
	return O(Le), O(Me), O(Ee), fe(Ee, (e) => q(E, e), () => z(E)), O(ve), W(() => {
		T(Ce, z(v) ? z(ne) : ""), De = re(Ee, 1, "bar svelte-i31wrt", null, De, { wide: z(oe).length > 0 }), Pe = re(Ne, 1, "actions svelte-i31wrt", null, Pe, { empty: !z(ae) }), T(Re, z(g).clearSelection);
	}), be("click", Le, () => d(m, "clear", {})), F(r, H), x(he);
}
De(["click"]), H(Er, {
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
		yr(this);
	}
});
//#endregion
//#region src/kit/form/associate.ts
var Dr = /* @__PURE__ */ new WeakMap(), Or = /* @__PURE__ */ new WeakMap(), kr = /* @__PURE__ */ new WeakMap();
function Ar(e) {
	let t = e;
	return class extends t {
		static formAssociated = !0;
		internals;
		constructor() {
			super(), this.internals = this.attachInternals(), Dr.set(this, this.internals);
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
			Or.get(this)?.reset();
		}
		formDisabledCallback(e) {
			kr.set(this, e), Or.get(this)?.disabled(e);
		}
	};
}
function jr(e, t) {
	let n = Dr.get(e);
	if (!n || typeof n.setFormValue != "function") return;
	let { name: r, value: i } = t;
	if (Array.isArray(i)) {
		if (r) {
			let e = new FormData();
			for (let t of i) e.append(r, t);
			n.setFormValue(e);
		} else n.setFormValue(null);
	} else n.setFormValue(i);
	Object.values(t.validity).some(Boolean) ? n.setValidity(t.validity, t.message || f.en.valueMissing, t.anchor ?? void 0) : n.setValidity({});
}
function Mr(e, t) {
	Or.set(e, t), kr.get(e) && t.disabled(!0);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+collection@1.43.3/node_modules/@zag-js/collection/dist/chunk-QZ7TP4HQ.mjs
var Nr = Object.defineProperty, Pr = (e, t, n) => t in e ? Nr(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, $ = (e, t, n) => Pr(e, typeof t == "symbol" ? t : t + "", n), Fr = Object.defineProperty, Ir = (e) => {
	throw TypeError(e);
}, Lr = (e, t, n) => t in e ? Fr(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, Rr = (e, t, n) => Lr(e, typeof t == "symbol" ? t : t + "", n), zr = (e, t, n) => t.has(e) || Ir("Cannot " + n), Br = (e, t, n) => (zr(e, t, "read from private field"), n ? n.call(e) : t.get(e)), Vr = (e, t, n) => t.has(e) ? Ir("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/store.mjs
function Hr(e, t = Object.is) {
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
var Ur = () => performance.now(), Wr, Gr = class {
	constructor(e) {
		Rr(this, "onTick", e), Rr(this, "frameId", null), Rr(this, "pausedAtMs", null), Rr(this, "context"), Rr(this, "cancelFrame", () => {
			this.frameId !== null && (cancelAnimationFrame(this.frameId), this.frameId = null);
		}), Rr(this, "setStartMs", (e) => {
			this.context.startMs = e;
		}), Rr(this, "start", () => {
			if (this.frameId !== null) return;
			let e = Ur();
			this.pausedAtMs === null ? this.context.startMs = e : (this.context.startMs += e - this.pausedAtMs, this.pausedAtMs = null), this.frameId = requestAnimationFrame(Br(this, Wr));
		}), Rr(this, "pause", () => {
			this.frameId !== null && (this.cancelFrame(), this.pausedAtMs = Ur());
		}), Rr(this, "stop", () => {
			this.frameId !== null && (this.cancelFrame(), this.pausedAtMs = null);
		}), Vr(this, Wr, (e) => {
			if (this.context.now = e, this.context.deltaMs = e - this.context.startMs, this.onTick(this.context) === !1) {
				this.stop();
				return;
			}
			this.frameId = requestAnimationFrame(Br(this, Wr));
		}), this.context = {
			now: 0,
			startMs: Ur(),
			deltaMs: 0
		};
	}
	get elapsedMs() {
		return this.pausedAtMs === null ? Ur() - this.context.startMs : this.pausedAtMs - this.context.startMs;
	}
};
Wr = /* @__PURE__ */ new WeakMap();
function Kr(e, t) {
	let n = new Gr(({ deltaMs: n }) => {
		if (n >= t) return e(), !1;
	});
	return n.start(), () => n.stop();
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+collection@1.43.3/node_modules/@zag-js/collection/dist/list-collection.mjs
var qr = {
	itemToValue(e) {
		return typeof e == "string" ? e : At(e) && Et(e, "value") ? e.value : "";
	},
	itemToString(e) {
		return typeof e == "string" ? e : At(e) && Et(e, "label") ? e.label : qr.itemToValue(e);
	},
	isItemDisabled(e) {
		return At(e) && Et(e, "disabled") ? !!e.disabled : !1;
	}
}, Jr = class e {
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
		}), $(this, "sort", (e) => [...e].sort(this.sortFn.bind(this))), $(this, "getItemValue", (e) => e == null ? null : this.options.itemToValue?.(e) ?? qr.itemToValue(e)), $(this, "getItemDisabled", (e) => e == null ? !1 : this.options.isItemDisabled?.(e) ?? qr.isItemDisabled(e)), $(this, "stringifyItem", (e) => e == null ? null : this.options.itemToString?.(e) ?? qr.itemToString(e)), $(this, "stringify", (e) => e == null ? null : this.stringifyItem(this.find(e))), $(this, "stringifyItems", (e, t = ", ") => {
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
				if (!(r && this.getItemValue(a) === t) && !this.getItemDisabled(a) && Yr(this.stringifyItem(a), e)) return a;
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
		}), $(this, "insert", (e, ...t) => this.copy(Xr(this.items, e, ...t))), $(this, "insertBefore", (e, ...t) => {
			let n = this.indexOf(e);
			if (n === -1) {
				if (this.items.length === 0) n = 0;
				else return this;
			}
			return this.copy(Xr(this.items, n, ...t));
		}), $(this, "insertAfter", (e, ...t) => {
			let n = this.indexOf(e);
			if (n === -1) {
				if (this.items.length === 0) n = 0;
				else return this;
			}
			return this.copy(Xr(this.items, n + 1, ...t));
		}), $(this, "prepend", (...e) => this.copy(Xr(this.items, 0, ...e))), $(this, "append", (...e) => this.copy(Xr(this.items, this.items.length, ...e))), $(this, "filter", (e) => {
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
			return n === -1 ? this : this.copy(Zr(this.items, [n], t));
		}), $(this, "moveBefore", (e, ...t) => {
			let n = this.items.findIndex((t) => this.getItemValue(t) === e);
			if (n === -1) return this;
			let r = t.map((e) => this.items.findIndex((t) => this.getItemValue(t) === e)).sort((e, t) => e - t);
			return this.copy(Zr(this.items, r, n));
		}), $(this, "moveAfter", (e, ...t) => {
			let n = this.items.findIndex((t) => this.getItemValue(t) === e);
			if (n === -1) return this;
			let r = t.map((e) => this.items.findIndex((t) => this.getItemValue(t) === e)).sort((e, t) => e - t);
			return this.copy(Zr(this.items, r, n + 1));
		}), $(this, "reorder", (e, t) => this.copy(Zr(this.items, [e], t))), $(this, "compareValue", (e, t) => {
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
}, Yr = (e, t) => !!e?.toLowerCase().startsWith(t.toLowerCase());
function Xr(e, t, ...n) {
	return [
		...e.slice(0, t),
		...n,
		...e.slice(t)
	];
}
function Zr(e, t, n) {
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
function Qr({ values: e, collection: t, selectedItemMap: n }) {
	let r = [];
	for (let i of e) {
		let e = t.find(i) ?? n.get(i);
		e != null && r.push(e);
	}
	return r;
}
function $r({ selectedItemMap: e, values: t, selectedItems: n, collection: r }) {
	let i = new Map(e);
	for (let e of n) {
		let t = r.getItemValue(e);
		t != null && i.set(t, e);
	}
	let a = new Set(t);
	for (let e of i.keys()) a.has(e) || i.delete(e);
	return i;
}
function ei({ values: e, collection: t, selectedItemMap: n }) {
	let r = Qr({
		values: e,
		collection: t,
		selectedItemMap: n
	});
	return {
		selectedItems: r,
		nextSelectedItemMap: $r({
			selectedItemMap: n,
			values: e,
			selectedItems: r,
			collection: t
		})
	};
}
function ti({ selectedItems: e, collection: t }) {
	return $r({
		selectedItemMap: /* @__PURE__ */ new Map(),
		values: e.map((e) => t.getItemValue(e)).filter(Boolean),
		selectedItems: e,
		collection: t
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+collection@1.43.3/node_modules/@zag-js/collection/dist/tree-visit.mjs
function ni(e, t, n) {
	for (let r = 0; r < t.length; r++) e = n.getChildren(e, t.slice(r + 1))[t[r]];
	return e;
}
function ri(e) {
	let t = ai(e), n = [], r = /* @__PURE__ */ new Set();
	for (let e of t) {
		let t = e.join();
		r.has(t) || (r.add(t), n.push(e));
	}
	return n;
}
function ii(e, t) {
	for (let n = 0; n < Math.min(e.length, t.length); n++) {
		if (e[n] < t[n]) return -1;
		if (e[n] > t[n]) return 1;
	}
	return e.length - t.length;
}
function ai(e) {
	return e.sort(ii);
}
function oi(e, t) {
	let n;
	return Di(e, {
		...t,
		onEnter: (e, r) => {
			if (t.predicate(e, r)) return n = e, "stop";
		}
	}), n;
}
function si(e, t) {
	let n = [];
	return Di(e, {
		onEnter: (e, r) => {
			t.predicate(e, r) && n.push(e);
		},
		getChildren: t.getChildren
	}), n;
}
function ci(e, t) {
	let n;
	return Di(e, {
		onEnter: (e, r) => {
			if (t.predicate(e, r)) return n = [...r], "stop";
		},
		getChildren: t.getChildren
	}), n;
}
function li(e, t) {
	let n = t.initialResult;
	return Di(e, {
		...t,
		onEnter: (e, r) => {
			n = t.nextResult(n, e, r);
		}
	}), n;
}
function ui(e, t) {
	return li(e, {
		...t,
		initialResult: [],
		nextResult: (e, n, r) => (e.push(...t.transform(n, r)), e)
	});
}
function di(e, t) {
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
function fi(e, t) {
	let n = [], r = 0, i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
	return Di(e, {
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
function pi(e, t) {
	return {
		type: "insert",
		index: e,
		nodes: t
	};
}
function mi(e) {
	return {
		type: "remove",
		indexes: e
	};
}
function hi() {
	return { type: "replace" };
}
function gi(e) {
	return [e.slice(0, -1), e[e.length - 1]];
}
function _i(e, t, n = /* @__PURE__ */ new Map()) {
	let [r, i] = gi(e);
	for (let e = r.length - 1; e >= 0; e--) {
		let t = r.slice(0, e).join();
		n.get(t)?.type !== "remove" && n.set(t, hi());
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
		default: n.set(r.join(), pi(i, t));
	}
	return n;
}
function vi(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
	for (let t of e) {
		let e = t.slice(0, -1).join(), r = n.get(e) ?? [];
		r.push(t[t.length - 1]), n.set(e, r.sort((e, t) => e - t));
	}
	for (let n of e) for (let e = n.length - 2; e >= 0; e--) {
		let r = n.slice(0, e).join();
		t.has(r) || t.set(r, hi());
	}
	for (let [e, r] of n) t.set(e, mi(r));
	return t;
}
function yi(e, t) {
	let n = /* @__PURE__ */ new Map(), [r, i] = gi(e);
	for (let e = r.length - 1; e >= 0; e--) {
		let t = r.slice(0, e).join();
		n.set(t, hi());
	}
	return n.set(r.join(), {
		type: "removeThenInsert",
		removeIndexes: [i],
		insertIndex: i,
		insertNodes: [t]
	}), n;
}
function bi(e, t, n) {
	return Si(e, {
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
					return n.create(e, xi(t, a, 0, ...o.insertNodes), i);
				case "insert": return n.create(e, xi(r, o.index, 0, ...o.nodes), i);
				case "replace": return n.create(e, r, i);
				default: return e;
			}
		}
	});
}
function xi(e, t, n, ...r) {
	return [
		...e.slice(0, t),
		...r,
		...e.slice(t + n)
	];
}
function Si(e, t) {
	let n = {};
	return Di(e, {
		...t,
		onLeave: (e, r) => {
			let i = [0, ...r], a = i.join(), o = t.transform(e, n[a] ?? [], r), s = i.slice(0, -1).join(), c = n[s] ?? [];
			c.push(o), n[s] = c;
		}
	}), n[""][0];
}
function Ci(e, t) {
	let { nodes: n, at: r } = t;
	if (r.length === 0) throw Error("Can't insert nodes at the root");
	return bi(e, _i(r, n), t);
}
function wi(e, t) {
	return t.at.length === 0 ? t.node : bi(e, yi(t.at, t.node), t);
}
function Ti(e, t) {
	if (t.indexPaths.length === 0) return e;
	for (let e of t.indexPaths) if (e.length === 0) throw Error("Can't remove the root node");
	return bi(e, vi(t.indexPaths), t);
}
function Ei(e, t) {
	if (t.indexPaths.length === 0) return e;
	for (let e of t.indexPaths) if (e.length === 0) throw Error("Can't move the root node");
	if (t.to.length === 0) throw Error("Can't move nodes to the root");
	let n = ri(t.indexPaths), r = n.map((n) => ni(e, n, t));
	return bi(e, _i(t.to, r, vi(n)), t);
}
function Di(e, t) {
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
var Oi = class e {
	constructor(t) {
		$(this, "options", t), $(this, "rootNode"), $(this, "isEqual", (e) => Ot(this.rootNode, e.rootNode)), $(this, "getNodeChildren", (e) => this.options.nodeToChildren?.(e) ?? ki.nodeToChildren(e) ?? []), $(this, "resolveIndexPath", (e) => typeof e == "string" ? this.getIndexPath(e) : e), $(this, "resolveNode", (e) => {
			let t = this.resolveIndexPath(e);
			return t ? this.at(t) : void 0;
		}), $(this, "getNodeChildrenCount", (e) => this.options.nodeToChildrenCount?.(e) ?? ki.nodeToChildrenCount(e)), $(this, "getNodeValue", (e) => this.options.nodeToValue?.(e) ?? ki.nodeToValue(e)), $(this, "getNodeDisabled", (e) => this.options.isNodeDisabled?.(e) ?? ki.isNodeDisabled(e)), $(this, "stringify", (e) => {
			let t = this.findNode(e);
			return t ? this.stringifyNode(t) : null;
		}), $(this, "stringifyNode", (e) => this.options.nodeToString?.(e) ?? ki.nodeToString(e)), $(this, "getFirstNode", (e = this.rootNode, t = {}) => {
			let n;
			return Di(e, {
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
			return Di(e, {
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
		}), $(this, "at", (e) => ni(this.rootNode, e, { getChildren: this.getNodeChildren })), $(this, "findNode", (e, t = this.rootNode) => oi(t, {
			getChildren: this.getNodeChildren,
			predicate: (t) => this.getNodeValue(t) === e
		})), $(this, "findNodes", (e, t = this.rootNode) => {
			let n = new Set(e.filter((e) => e != null));
			return si(t, {
				getChildren: this.getNodeChildren,
				predicate: (e) => n.has(this.getNodeValue(e))
			});
		}), $(this, "sort", (e) => e.reduce((e, t) => {
			let n = this.getIndexPath(t);
			return n && e.push({
				value: t,
				indexPath: n
			}), e;
		}, []).sort((e, t) => ii(e.indexPath, t.indexPath)).map(({ value: e }) => e)), $(this, "getValue", (e) => {
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
		}), $(this, "getDepth", (e) => ci(this.rootNode, {
			getChildren: this.getNodeChildren,
			predicate: (t) => this.getNodeValue(t) === e
		})?.length ?? 0), $(this, "isSameNode", (e, t) => this.getNodeValue(e) === this.getNodeValue(t)), $(this, "isRootNode", (e) => this.isSameNode(e, this.rootNode)), $(this, "contains", (e, t) => !e || !t ? !1 : t.slice(0, e.length).every((n, r) => e[r] === t[r])), $(this, "getNextNode", (e, t = {}) => {
			let n = !1, r;
			return Di(this.rootNode, {
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
			return Di(this.rootNode, {
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
			return Di(n, {
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
			Di(this.rootNode, {
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
		}), $(this, "getValues", (e = this.rootNode) => ui(e, {
			getChildren: this.getNodeChildren,
			transform: (e) => [this.getNodeValue(e)]
		}).slice(1)), $(this, "isValidDepth", (e, t) => t == null ? !0 : typeof t == "function" ? t(e.length) : e.length === t), $(this, "isBranchNode", (e) => this.getNodeChildren(e).length > 0 || this.getNodeChildrenCount(e) != null), $(this, "getBranchValues", (e = this.rootNode, t = {}) => {
			let n = [];
			return Di(e, {
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
		}), $(this, "flatten", (e = this.rootNode) => fi(e, { getChildren: this.getNodeChildren })), $(this, "_create", (e, t) => this.getNodeChildren(e).length > 0 || t.length > 0 ? {
			...e,
			children: t
		} : { ...e }), $(this, "_insert", (e, t, n) => this.copy(Ci(e, {
			at: t,
			nodes: n,
			getChildren: this.getNodeChildren,
			create: this._create
		}))), $(this, "copy", (t) => new e({
			...this.options,
			rootNode: t
		})), $(this, "_replace", (e, t, n) => this.copy(wi(e, {
			at: t,
			node: n,
			getChildren: this.getNodeChildren,
			create: this._create
		}))), $(this, "_move", (e, t, n) => this.copy(Ei(e, {
			indexPaths: t,
			to: n,
			getChildren: this.getNodeChildren,
			create: this._create
		}))), $(this, "_remove", (e, t) => this.copy(Ti(e, {
			indexPaths: t,
			getChildren: this.getNodeChildren,
			create: this._create
		}))), $(this, "replace", (e, t) => this._replace(this.rootNode, e, t)), $(this, "remove", (e) => this._remove(this.rootNode, e)), $(this, "insertBefore", (e, t) => this.getParentNode(e) ? this._insert(this.rootNode, e, t) : void 0), $(this, "insertAfter", (e, t) => {
			if (!this.getParentNode(e)) return;
			let n = [...e.slice(0, -1), e[e.length - 1] + 1];
			return this._insert(this.rootNode, n, t);
		}), $(this, "move", (e, t) => this._move(this.rootNode, e, t)), $(this, "filter", (e) => {
			let t = di(this.rootNode, {
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
		return ci(this.rootNode, {
			getChildren: this.getNodeChildren,
			predicate: (t) => this.getNodeValue(t) === e
		});
	}
}, ki = {
	nodeToValue(e) {
		return typeof e == "string" ? e : At(e) && Et(e, "value") ? e.value : "";
	},
	nodeToString(e) {
		return typeof e == "string" ? e : At(e) && Et(e, "label") ? e.label : ki.nodeToValue(e);
	},
	isNodeDisabled(e) {
		return At(e) && Et(e, "disabled") ? !!e.disabled : !1;
	},
	nodeToChildren(e) {
		return e.children;
	},
	nodeToChildrenCount(e) {
		if (At(e) && Et(e, "childrenCount")) return e.childrenCount;
	}
}, Ai = (e) => new Jr(e), ji = (e) => new Oi(e);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/memo.mjs
function Mi(e, t, n) {
	let r = [], i;
	return (a) => {
		let o = e(a);
		return o.length !== r.length || o.some((e, t) => !Ot(r[t], e)) ? (r = o, i = t(o, a), n?.onChange?.(i), i) : i;
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/caret.mjs
function Ni(e) {
	if (e) try {
		if (e.ownerDocument.activeElement !== e) return;
		let t = e.value.length;
		e.setSelectionRange(t, t);
	} catch {}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/controller.mjs
var Pi = /* @__PURE__ */ new Set([
	"menu",
	"listbox",
	"dialog",
	"grid",
	"tree",
	"region",
	"application"
]), Fi = (e) => Pi.has(e), Ii = (e) => e.getAttribute("aria-controls")?.split(" ") || [];
function Li(e, t) {
	let n = /* @__PURE__ */ new Set(), r = fn(e), i = (e) => {
		let a = e.querySelectorAll("[aria-controls]");
		for (let e of a) {
			if (e.getAttribute("aria-expanded") !== "true") continue;
			let a = Ii(e);
			for (let e of a) {
				if (!e || n.has(e)) continue;
				n.add(e);
				let a = r.getElementById(e);
				if (a) {
					let e = a.getAttribute("role"), n = a.getAttribute("aria-modal") === "true";
					if (e && Fi(e) && !n && (a === t || a.contains(t) || i(a))) return !0;
				}
			}
		}
		return !1;
	};
	return i(e);
}
function Ri(e, t) {
	let n = fn(e), r = /* @__PURE__ */ new Set(), i = (e) => {
		let a = e.querySelectorAll("[aria-controls]");
		for (let e of a) {
			if (e.getAttribute("aria-expanded") !== "true") continue;
			let a = Ii(e);
			for (let e of a) {
				if (!e || r.has(e)) continue;
				r.add(e);
				let a = n.getElementById(e);
				if (a) {
					let e = a.getAttribute("role"), n = a.getAttribute("aria-modal") === "true";
					e && Pi.has(e) && !n && (t(a), i(a));
				}
			}
		}
	};
	i(e);
}
function zi(e) {
	let t = /* @__PURE__ */ new Set();
	return Ri(e, (n) => {
		e.contains(n) || t.add(n);
	}), Array.from(t);
}
function Bi(e) {
	let t = e.getAttribute("role");
	return !!(t && Pi.has(t));
}
function Vi(e) {
	return e.hasAttribute("aria-controls") && e.getAttribute("aria-expanded") === "true";
}
function Hi(e) {
	return Vi(e) ? !0 : !!e.querySelector?.("[aria-controls][aria-expanded=\"true\"]");
}
function Ui(e) {
	if (!e.id) return !1;
	let t = fn(e), n = CSS.escape(e.id), r = `[aria-controls~="${n}"][aria-expanded="true"], [aria-controls="${n}"][aria-expanded="true"]`;
	return !!(t.querySelector(r) && Bi(e));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/data-url.mjs
function Wi(e, t) {
	let { type: n, quality: r = .92, background: i, size: a } = t;
	if (!e) throw Error("[zag-js > getDataUrl]: Could not find the svg element");
	let o = Sn(e), s = o.document, c = a ?? e.getBoundingClientRect(), l = e.cloneNode(!0);
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
function Gi(e, t) {
	let { type: n = "HTMLInputElement", property: r = "value" } = t, i = Sn(e)[n].prototype;
	return Object.getOwnPropertyDescriptor(i, r) ?? {};
}
function Ki(e) {
	if (e.localName === "input") return "HTMLInputElement";
	if (e.localName === "textarea") return "HTMLTextAreaElement";
	if (e.localName === "select") return "HTMLSelectElement";
}
function qi(e, t, n = "value") {
	if (!e) return;
	let r = Ki(e);
	r && Gi(e, {
		type: r,
		property: n
	}).set?.call(e, t), e.setAttribute(n, t);
}
function Ji(e) {
	return e.matches("textarea, input, select, button");
}
function Yi(e, t) {
	if (!e) return;
	let n = Ji(e) ? e.form : e.closest("form"), r = (e) => {
		e.defaultPrevented || t();
	};
	return n?.addEventListener("reset", r, { passive: !0 }), () => n?.removeEventListener("reset", r);
}
function Xi(e, t) {
	let n = e?.closest("fieldset");
	if (!n) return;
	t(n.disabled);
	let r = new (Sn(n)).MutationObserver(() => t(n.disabled));
	return r.observe(n, {
		attributes: !0,
		attributeFilter: ["disabled"]
	}), () => r.disconnect();
}
function Zi(e, t) {
	if (!e) return;
	let { onFieldsetDisabledChange: n, onFormReset: r } = t, i = [Yi(e, r), Xi(e, n)];
	return () => i.forEach((e) => e?.());
}
var Qi = /* @__PURE__ */ Symbol.for("zag.changeEvent");
function $i(e) {
	return Object.prototype.hasOwnProperty.call(e, Qi);
}
function ea(e) {
	return $i(e) || Object.defineProperty(e, Qi, { value: !0 }), e;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/tabbable.mjs
var ta = (e) => sn(e) && e.tagName === "IFRAME", na = /^(audio|video|details)$/;
function ra(e) {
	let t = e.getAttribute("tabindex");
	return t ? parseInt(t, 10) : NaN;
}
var ia = (e) => !Number.isNaN(ra(e)), aa = (e) => ra(e) < 0;
function oa(e) {
	return kn(e) && e.type === "radio";
}
function sa(e) {
	if (!oa(e) || !e.name || e.checked) return !0;
	let t = `input[type="radio"][name="${CSS.escape(e.name)}"]`, n = e.form ?? e.ownerDocument, r = Array.from(n.querySelectorAll(t)).filter((t) => t.form === e.form && fa(t)), i = r.find((e) => e.checked);
	return i ? i === e : r[0] === e;
}
function ca(e, t) {
	if (!t) return null;
	if (t === !0) return e.shadowRoot || null;
	let n = t(e);
	return (n === !0 ? e.shadowRoot : n) || null;
}
function la(e, t, n) {
	let r = [...e], i = [...e], a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
	e.forEach((e, t) => o.set(e, t));
	let s = 0;
	for (; s < i.length;) {
		let e = i[s++];
		if (!e || a.has(e)) continue;
		a.add(e);
		let c = ca(e, t);
		if (c) {
			let t = Array.from(c.querySelectorAll(ua)).filter(n), a = o.get(e);
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
var ua = "input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], button:not([disabled]), [tabindex], iframe, object, embed, area[href], audio[controls], video[controls], [contenteditable]:not([contenteditable='false']), details > summary:first-of-type", da = (e, t = {}) => {
	if (!e) return [];
	let { includeContainer: n = !1, getShadowRoot: r } = t, i = Array.from(e.querySelectorAll(ua));
	(n == 1 || n == "if-empty" && i.length === 0) && sn(e) && fa(e) && i.unshift(e);
	let a = [];
	for (let e of i) if (fa(e)) {
		if (ta(e) && e.contentDocument) {
			let t = e.contentDocument.body;
			a.push(...da(t, { getShadowRoot: r }));
			continue;
		}
		a.push(e);
	}
	return r ? la(a, r, fa) : a;
};
function fa(e) {
	return !sn(e) || e.closest("[inert]") ? !1 : e.matches(ua) && Ht(e);
}
function pa(e, t = {}) {
	if (!e) return [];
	let { includeContainer: n, getShadowRoot: r } = t, i = Array.from(e.querySelectorAll(ua));
	n && ma(e) && i.unshift(e);
	let a = [];
	for (let e of i) if (ma(e)) {
		if (ta(e) && e.contentDocument) {
			let t = e.contentDocument.body;
			a.push(...pa(t, { getShadowRoot: r }));
			continue;
		}
		a.push(e);
	}
	if (r) {
		let e = la(a, r, ma);
		return !e.length && n ? i : e;
	}
	return !a.length && n ? i : a;
}
function ma(e) {
	return sn(e) && e.tabIndex > 0 ? !0 : !fa(e) || aa(e) ? !1 : sa(e);
}
function ha(e, t = {}) {
	let n = pa(e, t);
	return [n[0] || null, n[n.length - 1] || null];
}
function ga(e) {
	return e.tabIndex < 0 && (na.test(e.localName) || Tn(e)) && !ia(e) ? 0 : e.tabIndex;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/initial-focus.mjs
function _a(e) {
	let { root: t, getInitialEl: n, filter: r, enabled: i = !0 } = e;
	if (!i) return;
	let a = typeof n == "function" ? n() : n;
	return a ||= t?.querySelector("[data-autofocus],[autofocus]"), a ||= pa(t).filter((e) => !r || r(e)).find((e) => !e.hasAttribute("data-no-autofocus")), a || t || void 0;
}
function va(e) {
	let t = e.currentTarget;
	if (!t) return !1;
	let [n, r] = ha(t);
	return !($t(n) && e.shiftKey || $t(r) && !e.shiftKey || !n && !r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/mutation-observer.mjs
function ya(e, t) {
	if (!e) return;
	let { attributes: n, callback: r } = t, i = new (e.ownerDocument.defaultView || window).MutationObserver((e) => {
		for (let t of e) t.type === "attributes" && t.attributeName && n.includes(t.attributeName) && r(t);
	});
	return i.observe(e, {
		attributes: !0,
		attributeFilter: n
	}), () => i.disconnect();
}
function ba(e, t) {
	let { defer: n } = t, r = n ? Y : (e) => e(), i = [];
	return i.push(r(() => {
		let n = typeof e == "function" ? e() : e;
		i.push(ya(n, t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
function xa(e, t) {
	let { callback: n } = t;
	if (!e) return;
	let r = new (e.ownerDocument.defaultView || window).MutationObserver(n);
	return r.observe(e, {
		childList: !0,
		subtree: !0
	}), () => r.disconnect();
}
function Sa(e, t) {
	let { defer: n } = t, r = n ? Y : (e) => e(), i = [];
	return i.push(r(() => {
		let n = typeof e == "function" ? e() : e;
		i.push(xa(n, t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/navigate.mjs
function Ca(e) {
	let t = () => {
		let t = Sn(e);
		e.dispatchEvent(new t.MouseEvent("click"));
	};
	tt() ? nn(e, "keyup", t) : queueMicrotask(t);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/overflow.mjs
function wa(e) {
	let t = On(e);
	return Wt(t) ? Kt(t).body : sn(t) && Oa(t) ? t : wa(t);
}
function Ta(e, t = []) {
	let n = wa(e), r = n === e.ownerDocument.body, i = Sn(n);
	return r ? t.concat(i, i.visualViewport || [], Oa(n) ? n : []) : t.concat(n, Ta(n, []));
}
var Ea = /auto|scroll|overlay|hidden|clip/, Da = /* @__PURE__ */ new Set(["inline", "contents"]);
function Oa(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = Sn(e).getComputedStyle(e);
	return Ea.test(t + r + n) && !Da.has(i);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/point.mjs
function ka(e, t) {
	let { left: n, top: r, width: i, height: a } = t.getBoundingClientRect(), o = {
		x: e.x - n,
		y: e.y - r
	}, s = {
		x: Xt(o.x / i),
		y: Xt(o.y / a)
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
function Aa(e, t) {
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
	let s = [en(e, "pointerlockchange", a, !1), en(e, "pointerlockerror", o, !1)];
	return () => {
		s.forEach((e) => e()), e.exitPointerLock();
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/proxy-tab-focus.mjs
function ja(e) {
	return e == null ? null : typeof e == "function" ? e() : e;
}
function Ma(e, t, n) {
	if (!t) return null;
	let r = pa(e.ownerDocument.body, { getShadowRoot: n }), i = r.indexOf(t);
	if (i === -1) return null;
	for (let t = i + 1; t < r.length; t++) {
		let n = r[t];
		if (!pt(e, n)) return n;
	}
	return null;
}
function Na(e, t = {}) {
	let { triggerElement: n, onFocus: r, onFocusEnter: i, getShadowRoot: a } = t, o = (ja(e) ?? ja(n))?.ownerDocument || document;
	function s(t) {
		if (t.key !== "Tab") return;
		let o = ja(e), s = ja(n);
		if (!o) return;
		let [c, l] = ha(o, {
			includeContainer: !0,
			getShadowRoot: a
		}), u = !c && !l, d = null;
		if (t.shiftKey && ($t(c) || u)) d = s;
		else if (!t.shiftKey && $t(s)) i?.(), d = c;
		else if (!t.shiftKey && ($t(l) || u)) d = Ma(o, s, a);
		else if (t.shiftKey) {
			let e = Ma(o, s, a);
			$t(e) && (i?.(), d = l);
		}
		d && (t.preventDefault(), typeof r == "function" ? r(d) : d.focus());
	}
	return en(o, "keydown", s, !0);
}
function Pa(e, t) {
	let { defer: n, ...r } = t, i = n ? Y : (e) => e(), a = [];
	return a.push(i(() => {
		a.push(Na(e, r));
	})), () => {
		a.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/resize-observer.mjs
function Fa(e) {
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
			let o = Sn(n);
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
var Ia = /* @__PURE__ */ Fa({ box: "border-box" });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/scroll.mjs
function La(e) {
	return e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth;
}
function Ra(e, t) {
	let { rootEl: n, ...r } = t || {};
	e && n && Oa(n) && La(n) && e.scrollIntoView(r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/searchable.mjs
var za = (e) => e.split("").map((e) => {
	let t = e.charCodeAt(0);
	return t > 0 && t < 128 ? e : t >= 128 && t <= 255 ? `/x${t.toString(16)}`.replace("/", "\\") : "";
}).join("").trim(), Ba = (e) => za(e.dataset?.valuetext ?? e.textContent ?? ""), Va = (e, t) => e.trim().toLowerCase().startsWith(t.toLowerCase());
function Ha(e, t, n, r = Nt) {
	let i = n ? An(e, n, r) : -1, a = n ? jn(e, i) : e;
	return t.length === 1 && (a = a.filter((e) => r(e) !== n)), a.find((e) => Va(Ba(e), t));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/typeahead.mjs
function Ua(e, t) {
	let { state: n, activeId: r, key: i, timeout: a = 350, itemToId: o } = t, s = n.keysSoFar + i, c = s.length > 1 && Array.from(s).every((e) => e === s[0]) ? s[0] : s, l = Ha(e.slice(), c, r, o);
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
var Wa = /* @__PURE__ */ Object.assign(Ua, {
	defaultOptions: {
		keysSoFar: "",
		timer: -1
	},
	isValidEvent: Ga
});
function Ga(e) {
	return e.key.length === 1 && !e.ctrlKey && !e.metaKey;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/visually-hidden.mjs
var Ka = {
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
function qa(e, t, n) {
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
function Ja(e, t) {
	let { timeout: n, rootNode: r } = t, i = Sn(r), a = Kt(r), o = new i.AbortController();
	return qa(new Promise((t) => {
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
function Ya(e, t, n = {}) {
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
			o.push(Y(() => {
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
var [Xa, Za] = an({
	name: "ComboboxContext",
	hookName: "useComboboxContext",
	providerName: "<ComboboxProvider />"
}), [Qa, $a] = an({
	name: "RenderStrategyContext",
	hookName: "useRenderStrategyContext",
	providerName: "<RenderStrategyPropsProvider />"
}), eo = Bt(), to = (e) => eo(e, ["lazyMount", "unmountOnExit"]);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+presence@1.43.3/node_modules/@zag-js/presence/dist/presence.connect.mjs
function no(e, t) {
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
var ro = zt({
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
				let r = new (Sn(n)).CustomEvent("exitcomplete", { bubbles: !1 });
				n.dispatchEvent(r);
			},
			setupNode: ({ refs: e, event: t }) => {
				e.get("node") !== t.node && (e.set("node", t.node), e.set("styles", jt(t.node)));
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
				Y(() => {
					if (r("present")) return;
					let i = io(t.get("styles"));
					e.set("unmountAnimationName", i), i === "none" || i === e.get("prevAnimationName") || t.get("styles")?.display === "none" || t.get("styles")?.animationDuration === "0s" ? n({
						type: "UNMOUNT",
						src: "presence.changed"
					}) : n({ type: "UNMOUNT.SUSPEND" });
				});
			},
			setPrevAnimationName: ({ context: e, refs: t }) => {
				Y(() => {
					e.set("prevAnimationName", io(t.get("styles")));
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
					r = Y(() => {
						let e = t.get("node");
						if (!e || !e.isConnected) {
							i();
							return;
						}
						let r = jt(e);
						if (io(r) === "none" || r.display === "none" || r.animationDuration === "0s") {
							n("onEnterComplete")?.();
							return;
						}
						let a = (t) => {
							Ge(t) === e && n("present") && (e.removeEventListener("animationend", a), n("onEnterComplete")?.());
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
					(n.composedPath?.()?.[0] ?? n.target) === i && e.set("prevAnimationName", io(t.get("styles")));
				}, o = (a) => {
					let o = io(t.get("styles"));
					Ge(a) === i && o === e.get("unmountAnimationName") && !r("present") && n({
						type: "UNMOUNT",
						src: "animationend"
					});
				}, s = (e) => {
					Ge(e) === i && !r("present") && n({
						type: "UNMOUNT",
						src: "animationcancel"
					});
				};
				i.addEventListener("animationstart", a), i.addEventListener("animationcancel", s), i.addEventListener("animationend", o);
				let c = Yt(i, { animationFillMode: "forwards" });
				return () => {
					i.removeEventListener("animationstart", a), i.removeEventListener("animationcancel", s), i.removeEventListener("animationend", o), lt(() => c());
				};
			}
		}
	}
});
function io(e) {
	return e?.animationName || "none";
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/presence/use-presence.svelte.js
var ao = (e) => {
	let t = y(() => Xe(e)), n = y(() => to(z(t))), r = y(() => w(z(n), 2)), i = y(() => z(r)[0]), a = y(() => z(r)[1]), o = Ut(ro, () => z(a)), s = y(() => no(o, gn)), c = B(!1);
	Oe(() => {
		z(s).present && q(c, !0);
	});
	let l = (e) => {
		e && o.send({
			type: "NODE.SET",
			node: e
		});
	}, u = y(() => !z(s).present && !z(c) && z(i).lazyMount || z(i).unmountOnExit && !z(s).present && z(c)), d = y(() => ({
		getPresenceProps: () => ({
			"data-state": z(s).skip && z(t).skipAnimationOnMount ? void 0 : z(t).present ? "open" : "closed",
			hidden: !z(s).present
		}),
		present: z(s).present,
		setNode: l,
		unmounted: z(u)
	}));
	return () => z(d);
}, oo = (e) => Bt()(e, [
	"immediate",
	"lazyMount",
	"onEnterComplete",
	"onExitComplete",
	"present",
	"skipAnimationOnMount",
	"unmountOnExit"
]), [so, co] = an({ name: "PresenceContext" }), lo = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function uo(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, lo), i = Za(), a = co(), o = y(() => X(i().getContentProps(), a().getPresenceProps(), r));
	function s(e) {
		a().setNode(e);
	}
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	}, l = P(), u = G(l), d = (e) => {
		Q(e, J({ as: "div" }, () => z(o), {
			[de()]: s,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = y(() => !a().unmounted);
	return M(u, (e) => {
		z(f) && e(d);
	}), F(e, l), x(c);
}
H(uo, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+combobox@1.43.3/node_modules/@zag-js/combobox/dist/combobox.anatomy.mjs
var fo = Cn("combobox").parts("root", "clearTrigger", "content", "control", "input", "item", "itemGroup", "itemGroupLabel", "itemIndicator", "itemText", "label", "list", "positioner", "trigger"), po = fo.build(), mo = (e) => new Jr(e);
mo.empty = () => new Jr({ items: [] });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+focus-visible@1.43.3/node_modules/@zag-js/focus-visible/dist/index.mjs
function ho(e) {
	return !(e.metaKey || !$e() && e.altKey || e.ctrlKey || e.key === "Control" || e.key === "Shift" || e.key === "Meta");
}
var go = /* @__PURE__ */ new Set([
	"checkbox",
	"radio",
	"range",
	"color",
	"file",
	"image",
	"button",
	"submit",
	"reset"
]), _o = [
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
function vo(e, t, n) {
	let r = n ? Ge(n) : null, i = Kt(r), a = Sn(r), o = Pe(i);
	return e = e || o instanceof a.HTMLInputElement && !go.has(o?.type) || o instanceof a.HTMLTextAreaElement || o instanceof a.HTMLElement && o.isContentEditable, !(e && t === "keyboard" && n instanceof a.KeyboardEvent && !Reflect.has(Eo, n.key));
}
var yo = null, bo = /* @__PURE__ */ new Set(), xo = /* @__PURE__ */ new Map(), So = !1, Co = null, wo = !1, To = null, Eo = {
	Tab: !0,
	Escape: !0
};
function Do(e, t) {
	for (let n of bo) n(e, t);
}
function Oo(e) {
	Co = null, So = !0, ho(e) && (yo = "keyboard", Do("keyboard", e));
}
function ko(e) {
	(e.type !== "pointermove" && e.type !== "mousemove" || To?.x !== e.clientX || To?.y !== e.clientY) && (To = {
		x: e.clientX,
		y: e.clientY
	}, yo = "pointer", (e.type === "mousedown" || e.type === "pointerdown") && (Co = null, So = !0, Do("pointer", e)));
}
function Ao(e) {
	if (Tt(e)) {
		Co = null, So = !0, yo = "virtual";
		return;
	}
	Co = null;
	let t = Ge(e), n = t?.closest("label"), r = n?.control;
	if (!n || !r || r.matches(":disabled")) return;
	let i = t?.closest(_o);
	i && n.contains(i) && i !== r || r !== Pe(n.ownerDocument) && (Co = r);
}
function jo(e) {
	let t = Ge(e), n = t === Co;
	t !== Sn(t) && t !== Kt(t) && e.isTrusted && (!So && !n && !wo && (yo = "virtual", Do("virtual", e)), So = !1, Co = null, wo = !1);
}
function Mo() {
	So = !1, Co = null, wo = !0;
}
function No(e) {
	if (typeof window > "u" || xo.get(Sn(e))) return;
	let t = Sn(e), n = Kt(e), r = t.HTMLElement.prototype.focus;
	function i() {
		So = !0, r.apply(this, arguments);
	}
	try {
		Object.defineProperty(t.HTMLElement.prototype, "focus", {
			configurable: !0,
			value: i
		});
	} catch {}
	n.addEventListener("keydown", Oo, !0), n.addEventListener("keyup", Oo, !0), n.addEventListener("click", Ao, !0), t.addEventListener("focus", jo, !0), t.addEventListener("blur", Mo, !1), t.PointerEvent === void 0 ? (n.addEventListener("mousedown", ko, !0), n.addEventListener("mousemove", ko, !0), n.addEventListener("mouseup", ko, !0)) : (n.addEventListener("pointerdown", ko, !0), n.addEventListener("pointermove", ko, !0), n.addEventListener("pointerup", ko, !0)), t.addEventListener("beforeunload", () => {
		Po(e);
	}, { once: !0 }), xo.set(t, { focus: r });
}
var Po = (e, t) => {
	let n = Sn(e), r = Kt(e);
	t && r.removeEventListener("DOMContentLoaded", t);
	let i = xo.get(n);
	if (i) {
		try {
			Object.defineProperty(n.HTMLElement.prototype, "focus", {
				configurable: !0,
				value: i.focus
			});
		} catch {}
		r.removeEventListener("keydown", Oo, !0), r.removeEventListener("keyup", Oo, !0), r.removeEventListener("click", Ao, !0), n.removeEventListener("focus", jo, !0), n.removeEventListener("blur", Mo, !1), n.PointerEvent === void 0 ? (r.removeEventListener("mousedown", ko, !0), r.removeEventListener("mousemove", ko, !0), r.removeEventListener("mouseup", ko, !0)) : (r.removeEventListener("pointerdown", ko, !0), r.removeEventListener("pointermove", ko, !0), r.removeEventListener("pointerup", ko, !0)), xo.delete(n);
	}
};
function Fo() {
	return yo;
}
function Io(e) {
	yo = e, Do(e, null);
}
function Lo() {
	return yo === "keyboard" || yo === "virtual";
}
function Ro(e = {}) {
	let { isTextInput: t, autoFocus: n, onChange: r, root: i } = e;
	No(i), r?.({
		isFocusVisible: n || Lo(),
		modality: yo
	});
	let a = (e, n) => {
		vo(!!t, e, n) && r?.({
			isFocusVisible: Lo(),
			modality: e
		});
	};
	return bo.add(a), () => {
		bo.delete(a);
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/get-anchor.mjs
function zo(e = 0, t = 0, n = 0, r = 0) {
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
function Bo(e) {
	if (!e) return zo();
	let { x: t, y: n, width: r, height: i } = e;
	return zo(t, n, r, i);
}
function Vo(e, t) {
	return {
		contextElement: sn(e) ? e : e?.contextElement,
		getBoundingClientRect: () => {
			let n = e, r = t?.(n);
			return r || !n ? Bo(r) : n.getBoundingClientRect();
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/middleware.mjs
var Ho = (e) => ({
	variable: e,
	reference: `var(${e})`
}), Uo = {
	arrowSize: Ho("--arrow-size"),
	arrowSizeHalf: Ho("--arrow-size-half"),
	arrowBg: Ho("--arrow-background"),
	transformOrigin: Ho("--transform-origin"),
	arrowOffset: Ho("--arrow-offset")
}, Wo = (e) => e === "top" || e === "bottom" ? "y" : "x";
function Go(e, t) {
	return {
		name: "transformOrigin",
		fn(n) {
			let { elements: r, middlewareData: i, placement: a, rects: o, y: s } = n, c = a.split("-")[0], l = Wo(c), u = i.arrow?.x || 0, d = i.arrow?.y || 0, f = t?.clientWidth || 0, p = t?.clientHeight || 0, m = u + f / 2, h = d + p / 2, g = Math.abs(i.shift?.y || 0), _ = o.reference.height / 2, v = p / 2, y = e.offset?.mainAxis ?? e.gutter, b = typeof y == "number" ? y + v : y ?? v, x = g > b, ee = {
				top: `${m}px calc(100% + ${b}px)`,
				bottom: `${m}px ${-b}px`,
				left: `calc(100% + ${b}px) ${h}px`,
				right: `${-b}px ${h}px`
			}[c], S = `${m}px ${o.reference.y + _ - s}px`, te = !!e.overlap && l === "y" && x;
			return r.floating.style.setProperty(Uo.transformOrigin.variable, te ? S : ee), { data: { transformOrigin: te ? S : ee } };
		}
	};
}
var Ko = {
	name: "rects",
	fn({ rects: e }) {
		return { data: e };
	}
}, qo = (e) => {
	if (e) return {
		name: "shiftArrow",
		fn({ placement: t, middlewareData: n }) {
			if (!n.arrow) return {};
			let { x: r, y: i } = n.arrow, a = t.split("-")[0];
			return Object.assign(e.style, {
				left: r == null ? "" : `${r}px`,
				top: i == null ? "" : `${i}px`,
				[a]: `calc(100% + ${Uo.arrowOffset.reference})`
			}), {};
		}
	};
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/placement.mjs
function Jo(e) {
	let [t, n] = e.split("-");
	return {
		side: t,
		align: n,
		hasAlign: n != null
	};
}
function Yo(e) {
	return e.split("-")[0];
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/get-placement.mjs
var Xo = {
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
function Zo(e, t) {
	let n = e.devicePixelRatio || 1;
	return Math.round(t * n) / n;
}
function Qo(e, t) {
	return e != null && Math.abs(e - t) < .5;
}
function $o(e) {
	return typeof e == "function" ? e() : e === "clipping-ancestors" ? "clippingAncestors" : e;
}
function es(e, t, n) {
	let r = e || t.createElement("div");
	return Jn({
		element: r,
		padding: n.arrowPadding
	});
}
function ts(e, t) {
	if (!et(t.offset ?? t.gutter)) return qn(({ placement: n }) => {
		let r = (e?.clientHeight || 0) / 2, i = t.offset?.mainAxis ?? t.gutter, a = typeof i == "number" ? i + r : i ?? r, { hasAlign: o } = Jo(n), s = o ? void 0 : t.shift, c = t.offset?.crossAxis ?? s;
		return We({
			crossAxis: c,
			mainAxis: a,
			alignmentAxis: t.shift
		});
	});
}
function ns(e) {
	if (e.flip) return Hn(() => {
		let t = $o(e.boundary);
		return {
			...t ? { boundary: t } : void 0,
			padding: e.overflowPadding,
			fallbackPlacements: e.flip === !0 ? void 0 : e.flip
		};
	});
}
function rs(e) {
	if (e.slide || e.overlap) return Vn(() => {
		let t = $o(e.boundary);
		return {
			...t ? { boundary: t } : void 0,
			mainAxis: e.slide,
			crossAxis: e.overlap,
			padding: e.overflowPadding,
			limiter: Gn()
		};
	});
}
function is(e) {
	if (e.sizeMiddleware === !1 && !e.sameWidth && !e.fitViewport) return;
	let t, n, r, i;
	return Un(() => {
		let a = $o(e.boundary);
		return {
			padding: e.overflowPadding,
			...a ? { boundary: a } : void 0,
			apply({ elements: e, rects: a, availableHeight: o, availableWidth: s }) {
				let c = e.floating, l = Math.round(a.reference.width), u = Math.round(a.reference.height);
				s = Math.floor(s), o = Math.floor(o), Qo(t, l) || (c.style.setProperty("--reference-width", `${l}px`), t = l), Qo(n, u) || (c.style.setProperty("--reference-height", `${u}px`), n = u), Qo(r, s) || (c.style.setProperty("--available-width", `${s}px`), r = s), Qo(i, o) || (c.style.setProperty("--available-height", `${o}px`), i = o);
			}
		};
	});
}
function as(e) {
	if (e.hideWhenDetached) return Bn(() => ({
		strategy: "referenceHidden",
		boundary: $o(e.boundary) ?? "clippingAncestors"
	}));
}
function os(e) {
	return e ? e === !0 ? {
		ancestorResize: !0,
		ancestorScroll: !0,
		elementResize: !0,
		layoutShift: !0
	} : e : {};
}
var ss = [
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
], cs = [
	"top",
	"right",
	"bottom",
	"left"
];
function ls(e, t) {
	if (!e) return wt;
	let n = new Map(t.map((t) => [t, e.style.getPropertyValue(t)]));
	return () => {
		n.forEach((t, n) => {
			t ? e.style.setProperty(n, t) : e.style.removeProperty(n);
		}), e.style.length === 0 && e.removeAttribute("style");
	};
}
function us(e) {
	return e == null ? null : sn(e) ? e : typeof e == "object" && e && "contextElement" in e && e.contextElement ? e.contextElement : e;
}
function ds(e, t, n = {}) {
	let r = () => (typeof t == "function" ? t() : t) ?? null, i = () => {
		let t = typeof e == "function" ? e() : e;
		return n.getAnchorElement?.() ?? t;
	}, a = () => {
		let e = i();
		return !e && !n.getAnchorRect ? null : Vo(e, n.getAnchorRect);
	}, o = Object.assign({}, Xo, n), s = [], c = null, l, u;
	function d(e) {
		l?.(), u?.(), c = e, l = o.restoreStyles ? ls(e, ss) : void 0;
		let t = e.querySelector("[data-part=arrow]");
		u = o.restoreStyles ? ls(t, cs) : void 0, s = [
			ts(t, o),
			ns(o),
			rs(o),
			es(t, e.ownerDocument, o),
			qo(t),
			Go({
				gutter: o.gutter,
				offset: o.offset,
				overlap: o.overlap
			}, t),
			is(o),
			as(o),
			Ko
		];
	}
	let { placement: f, strategy: p, onComplete: m, onPositioned: h } = o, g, _, v = !1, y, b, x = wt, ee = os(o.listeners);
	function S() {
		if (!o.listeners) return;
		let e = i(), t = a(), n = r();
		t && n && (us(e) !== us(y) || n !== b) && (x(), y = e, b = n, x = Wn(t, n, C, ee));
	}
	async function te() {
		S();
		let e = r();
		if (!e) return;
		e !== c && (d(e), v = !1);
		let t = a();
		if (!t) return;
		let n = await Kn(t, e, {
			placement: f,
			middleware: s,
			strategy: p
		}), i = Sn(e), l = Zo(i, n.x), u = Zo(i, n.y);
		if (m?.({
			...n,
			x: l,
			y: u
		}), o.applyStyles !== !1 && (Qo(g, l) || (e.style.setProperty("--x", `${l}px`), g = l), Qo(_, u) || (e.style.setProperty("--y", `${u}px`), _ = u), o.hideWhenDetached && (n.middlewareData.hide?.referenceHidden ? (e.style.setProperty("visibility", "hidden"), e.style.setProperty("pointer-events", "none")) : (e.style.removeProperty("visibility"), e.style.removeProperty("pointer-events"))), !v)) {
			let t = e.firstElementChild;
			t && (e.style.setProperty("--z-index", jt(t).zIndex), v = !0);
		}
	}
	async function C() {
		n.updatePosition ? (await n.updatePosition({
			updatePosition: te,
			floatingElement: r()
		}), h?.({ placed: !0 })) : await te();
	}
	return C(), () => {
		x(), u?.(), l?.(), h?.({ placed: !1 });
	};
}
function fs(e, t, n = {}) {
	let { defer: r, ...i } = n, a = r ? Y : (e) => e(), o = [];
	return o.push(a(() => {
		o.push(ds(e, t, i));
	})), () => {
		o.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/get-styles.mjs
var ps = {
	bottom: "rotate(45deg)",
	left: "rotate(135deg)",
	top: "rotate(225deg)",
	right: "rotate(315deg)"
};
function ms(e = {}) {
	let { placement: t, sameWidth: n, fitViewport: r, strategy: i = "absolute" } = e;
	return {
		arrow: {
			position: "absolute",
			width: Uo.arrowSize.reference,
			height: Uo.arrowSize.reference,
			[Uo.arrowSizeHalf.variable]: `calc(${Uo.arrowSize.reference} / 2)`,
			[Uo.arrowOffset.variable]: `calc(${Uo.arrowSizeHalf.reference} * -1)`
		},
		arrowTip: {
			transform: t ? ps[t.split("-")[0]] : void 0,
			background: Uo.arrowBg.reference,
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
var hs = (e) => e.ids?.root ?? `combobox:${e.id}`, gs = (e) => e.ids?.label ?? `combobox:${e.id}:label`, _s = (e) => e.ids?.control ?? `combobox:${e.id}:control`, vs = (e) => e.ids?.input ?? `combobox:${e.id}:input`, ys = (e) => e.ids?.content ?? `combobox:${e.id}:content`, bs = (e) => e.ids?.positioner ?? `combobox:${e.id}:popper`, xs = (e) => e.ids?.trigger ?? `combobox:${e.id}:toggle-btn`, Ss = (e) => e.ids?.clearTrigger ?? `combobox:${e.id}:clear-btn`, Cs = (e, t) => e.ids?.itemGroup?.(t) ?? `combobox:${e.id}:optgroup:${t}`, ws = (e, t) => e.ids?.itemGroupLabel?.(t) ?? `combobox:${e.id}:optgroup-label:${t}`, Ts = (e, t) => e.ids?.item?.(t) ?? `combobox:${e.id}:option:${t}`, Es = (e) => e.getById(ys(e)), Ds = (e) => e.getById(vs(e)), Os = (e) => e.getById(bs(e)), ks = (e) => e.getById(_s(e)), As = (e) => e.getById(xs(e)), js = (e) => e.getById(Ss(e)), Ms = (e, t) => {
	if (t == null) return null;
	let n = `[role=option][data-value="${CSS.escape(t)}"]`;
	return _t(Es(e), n);
}, Ns = (e) => {
	let t = Ds(e);
	e.isActiveElement(t) || t?.focus({ preventScroll: !0 }), Ni(t);
}, Ps = (e) => {
	let t = As(e);
	e.isActiveElement(t) || t?.focus({ preventScroll: !0 });
}, Fs = {
	triggerLabel: "Toggle suggestions",
	clearTriggerLabel: "Clear value"
};
function Is(e, t) {
	let { context: n, prop: r, state: i, send: a, scope: o, computed: s } = e, c = He(Fs, r("translations")), l = r("collection"), u = !!r("disabled"), d = s("isInteractive"), f = !!r("invalid"), p = !!r("required"), m = !!r("readOnly"), h = i.hasTag("open"), g = i.hasTag("focused"), _ = r("composite"), v = n.get("highlightedValue"), y = n.get("currentPlacement"), b = y ? Yo(y) : void 0, x = ms({
		...r("positioning"),
		placement: y
	});
	function ee(e) {
		let t = l.getItemDisabled(e.item), r = l.getItemValue(e.item);
		return Be(r, () => `[zag-js] No value found for item ${JSON.stringify(e.item)}`), {
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
			Ds(o)?.focus();
		},
		setOpen(e, t = "script") {
			i.hasTag("open") !== e && a({
				type: e ? "OPEN" : "CLOSE",
				src: t
			});
		},
		getRootProps() {
			return t.element({
				...po.root.attrs,
				dir: r("dir"),
				id: hs(o),
				"data-invalid": Z(f),
				"data-readonly": Z(m)
			});
		},
		getLabelProps() {
			return t.label({
				...po.label.attrs,
				dir: r("dir"),
				htmlFor: vs(o),
				id: gs(o),
				"data-readonly": Z(m),
				"data-disabled": Z(u),
				"data-invalid": Z(f),
				"data-required": Z(p),
				"data-focus": Z(g),
				onClick(e) {
					_ || (e.preventDefault(), As(o)?.focus({ preventScroll: !0 }));
				}
			});
		},
		getControlProps() {
			return t.element({
				...po.control.attrs,
				dir: r("dir"),
				id: _s(o),
				"data-state": h ? "open" : "closed",
				"data-focus": Z(g),
				"data-disabled": Z(u),
				"data-invalid": Z(f)
			});
		},
		getPositionerProps() {
			return t.element({
				...po.positioner.attrs,
				dir: r("dir"),
				id: bs(o),
				style: x.floating
			});
		},
		getInputProps() {
			return t.input({
				...po.input.attrs,
				dir: r("dir"),
				"aria-invalid": ln(f),
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
				id: vs(o),
				type: "text",
				role: "combobox",
				defaultValue: n.get("inputValue"),
				"aria-autocomplete": s("autoComplete") ? "both" : "list",
				"aria-controls": ys(o),
				"aria-expanded": h,
				"data-state": h ? "open" : "closed",
				"aria-activedescendant": v ? Ts(o, v) : void 0,
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
					if (e.defaultPrevented || !d || e.ctrlKey || e.shiftKey || rt(e)) return;
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
							let c = Ms(o, v);
							Lt(c) && r("navigate")?.({
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
					}[at(e, { dir: r("dir") })];
					i?.(e);
				}
			});
		},
		getTriggerProps(e = {}) {
			return t.button({
				...po.trigger.attrs,
				dir: r("dir"),
				id: xs(o),
				"aria-haspopup": _ ? "listbox" : "dialog",
				type: "button",
				tabIndex: e.focusable ? void 0 : -1,
				"aria-label": c.triggerLabel,
				"aria-expanded": h,
				"data-state": h ? "open" : "closed",
				"aria-controls": h ? ys(o) : void 0,
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
					e.defaultPrevented || d && Le(e) && a({
						type: "TRIGGER.CLICK",
						src: "trigger-click"
					});
				},
				onPointerDown(e) {
					d && e.pointerType !== "touch" && Le(e) && (e.preventDefault(), queueMicrotask(() => {
						Ns(o);
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
					}[at(e, { dir: r("dir") })];
					t && (t(e), e.preventDefault());
				}
			});
		},
		getContentProps() {
			return t.element({
				...po.content.attrs,
				dir: r("dir"),
				id: ys(o),
				role: _ ? "listbox" : "dialog",
				tabIndex: -1,
				hidden: !h,
				"data-state": h ? "open" : "closed",
				"data-placement": y,
				"data-side": b,
				"aria-labelledby": gs(o),
				"aria-multiselectable": r("multiple") && _ ? !0 : void 0,
				"data-empty": Z(l.size === 0),
				onPointerDown(e) {
					Le(e) && e.preventDefault();
				}
			});
		},
		getListProps() {
			return t.element({
				...po.list.attrs,
				role: _ ? void 0 : "listbox",
				"data-empty": Z(l.size === 0),
				"aria-labelledby": gs(o),
				"aria-multiselectable": r("multiple") && !_ ? !0 : void 0
			});
		},
		getClearTriggerProps() {
			return t.button({
				...po.clearTrigger.attrs,
				dir: r("dir"),
				id: Ss(o),
				type: "button",
				tabIndex: -1,
				disabled: u,
				"data-invalid": Z(f),
				"aria-label": c.clearTriggerLabel,
				"aria-controls": vs(o),
				hidden: !n.get("value").length,
				onPointerDown(e) {
					Le(e) && e.preventDefault();
				},
				onClick(e) {
					e.defaultPrevented || d && a({
						type: "VALUE.CLEAR",
						src: "clear-trigger"
					});
				}
			});
		},
		getItemState: ee,
		getItemProps(e) {
			let n = ee(e), i = n.value;
			return t.element({
				...po.item.attrs,
				dir: r("dir"),
				id: Ts(o, i),
				role: "option",
				tabIndex: -1,
				"data-highlighted": Z(n.highlighted),
				"data-state": n.selected ? "checked" : "unchecked",
				"aria-selected": ln(n.selected),
				"aria-disabled": ln(n.disabled),
				"data-disabled": Z(n.disabled),
				"data-value": n.value,
				onPointerMove() {
					n.disabled || Fo() === "pointer" && (n.highlighted || a({
						type: "ITEM.POINTER_MOVE",
						value: i
					}));
				},
				onPointerLeave() {
					e.persistFocus || n.disabled || Fo() === "pointer" && a({
						type: "ITEM.POINTER_LEAVE",
						value: i
					});
				},
				onClick(e) {
					Rn(e) || Ye(e) || ht(e) || n.disabled || a({
						type: "ITEM.CLICK",
						src: "item-select",
						value: i
					});
				}
			});
		},
		getItemTextProps(e) {
			let n = ee(e);
			return t.element({
				...po.itemText.attrs,
				dir: r("dir"),
				"data-state": n.selected ? "checked" : "unchecked",
				"data-disabled": Z(n.disabled),
				"data-highlighted": Z(n.highlighted)
			});
		},
		getItemIndicatorProps(e) {
			let n = ee(e);
			return t.element({
				"aria-hidden": !0,
				...po.itemIndicator.attrs,
				dir: r("dir"),
				"data-state": n.selected ? "checked" : "unchecked",
				hidden: !n.selected
			});
		},
		getItemGroupProps(e) {
			let { id: n } = e;
			return t.element({
				...po.itemGroup.attrs,
				dir: r("dir"),
				id: Cs(o, n),
				"aria-labelledby": ws(o, n),
				"data-empty": Z(l.size === 0),
				role: "group"
			});
		},
		getItemGroupLabelProps(e) {
			let { htmlFor: n } = e;
			return t.element({
				...po.itemGroupLabel.attrs,
				dir: r("dir"),
				id: ws(o, n),
				role: "presentation"
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+interact-outside@1.43.3/node_modules/@zag-js/interact-outside/dist/frame-utils.mjs
function Ls(e) {
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
function Rs(e) {
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
var zs = "pointerdown.outside", Bs = "focus.outside";
function Vs(e) {
	for (let t of e) if (sn(t) && fa(t)) return !0;
	return !1;
}
var Hs = (e) => "clientY" in e;
function Us(e, t) {
	if (!Hs(t) || !e) return !1;
	let n = e.getBoundingClientRect();
	return n.width === 0 || n.height === 0 ? !1 : n.top <= t.clientY && t.clientY <= n.top + n.height && n.left <= t.clientX && t.clientX <= n.left + n.width;
}
function Ws(e, t) {
	return e.y <= t.y && t.y <= e.y + e.height && e.x <= t.x && t.x <= e.x + e.width;
}
function Gs(e, t) {
	if (!t || !Hs(e)) return !1;
	let n = t.scrollHeight > t.clientHeight, r = n && e.clientX > t.offsetLeft + t.clientWidth, i = t.scrollWidth > t.clientWidth, a = i && e.clientY > t.offsetTop + t.clientHeight;
	return Ws({
		x: t.offsetLeft,
		y: t.offsetTop,
		width: t.clientWidth + (n ? 16 : 0),
		height: t.clientHeight + (i ? 16 : 0)
	}, {
		x: e.clientX,
		y: e.clientY
	}) ? r || a : !1;
}
function Ks(e, t) {
	let { exclude: n, onFocusOutside: r, onPointerDownOutside: i, onInteractOutside: a, defer: o, followControlledElements: s = !0 } = t;
	if (!e) return;
	let c = Kt(e), l = Sn(e), u = Ls(l), d = Rs(l);
	function f(t, r) {
		if (!sn(r) || !r.isConnected || pt(e, r) || Us(e, t) || s && Li(e, r)) return !1;
		let i = c.querySelector(`[aria-controls="${e.id}"]`);
		return i && Gs(t, wa(i)) || Gs(t, wa(e)) ? !1 : !n?.(r);
	}
	let p = /* @__PURE__ */ new Set(), m = qt(e?.getRootNode()), h = !1;
	function g(t) {
		h = !0;
		let n = () => {
			h = !1;
		};
		c.addEventListener("pointerup", n, { once: !0 }), l.addEventListener("pointerup", n, { once: !0 });
		function r(n) {
			let r = o && !Dt() ? Y : (e) => e(), s = n ?? t, c = s?.composedPath?.() ?? [s?.target];
			r(() => {
				let n = m ? c[0] : Ge(t);
				if (e && f(t, n)) {
					if (i || a) {
						let t = it(i, a);
						e.addEventListener(zs, t, { once: !0 });
					}
					Js(e, zs, {
						bubbles: !1,
						cancelable: !0,
						detail: {
							originalEvent: s,
							contextmenu: ht(s),
							focusable: Vs(c),
							target: n
						}
					});
				}
			});
		}
		t.pointerType === "touch" ? (p.forEach((e) => e()), p.add(en(c, "click", r, { once: !0 })), p.add(d.addEventListener("click", r, { once: !0 })), p.add(u.addEventListener("click", r, { once: !0 }))) : r();
	}
	let _ = /* @__PURE__ */ new Set(), v = setTimeout(() => {
		_.add(en(c, "pointerdown", g, !0)), _.add(d.addEventListener("pointerdown", g, !0)), _.add(u.addEventListener("pointerdown", g, !0));
	}, 0);
	function y(t) {
		h || (o ? Y : (e) => e())(() => {
			let n = t?.composedPath?.() ?? [t?.target], i = m ? n[0] : Ge(t);
			if (e && f(t, i)) {
				if (r || a) {
					let t = it(r, a);
					e.addEventListener(Bs, t, { once: !0 });
				}
				Js(e, Bs, {
					bubbles: !1,
					cancelable: !0,
					detail: {
						originalEvent: t,
						contextmenu: !1,
						focusable: fa(i),
						target: i
					}
				});
			}
		});
	}
	return Dt() || (_.add(en(c, "focusin", y, !0)), _.add(d.addEventListener("focusin", y, !0)), _.add(u.addEventListener("focusin", y, !0))), () => {
		clearTimeout(v), p.forEach((e) => e()), _.forEach((e) => e());
	};
}
function qs(e, t) {
	let { defer: n } = t, r = n ? Y : (e) => e(), i = [];
	return i.push(r(() => {
		let n = typeof e == "function" ? e() : e;
		i.push(Ks(n, t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
function Js(e, t, n) {
	let r = new (e.ownerDocument.defaultView || window).CustomEvent(t, n);
	return e.dispatchEvent(r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/escape-keydown.mjs
function Ys(e, t) {
	return en(Kt(e), "keydown", (e) => {
		e.key === "Escape" && (e.isComposing || t?.(e));
	}, { capture: !0 });
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/layer-stack.mjs
var Xs = "layer:request-dismiss", Zs = {
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
		return !!(this.getNestedLayers(e).some((e) => pt(e.node, t)) || this.recentlyRemoved.size > 0);
	},
	isInBranch(e) {
		return Array.from(this.branches).some((t) => pt(t, e));
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
			t && $s(t);
		}), this.recentlyRemoved.add(e), lt(() => this.recentlyRemoved.delete(e)), t < this.count() - 1 && this.getNestedLayers(e).forEach((t) => Zs.dismiss(t.node, e)), this.layers.splice(t, 1), this.syncLayers());
	},
	removeBranch(e) {
		let t = this.branches.indexOf(e);
		t >= 0 && this.branches.splice(t, 1);
	},
	syncLayers() {
		this.layers.forEach((e, t) => {
			Qs(e, t, e.node), e.styleTargets?.forEach((n) => {
				let r = n();
				if (!r || r === e.node) return;
				Qs(e, t, r);
				let { zIndex: i } = jt(e.node);
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
		tc(e, Xs, (e) => {
			r.requestDismiss?.(e), e.defaultPrevented || r?.dismiss();
		}), ec(e, Xs, {
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
function Qs(e, t, n) {
	n.style.setProperty("--layer-index", `${t}`), n.removeAttribute("data-nested"), n.removeAttribute("data-has-nested"), Zs.getParentLayerOfType(e.node, e.type) && n.setAttribute("data-nested", e.type);
	let r = Zs.countNestedLayersOfType(e.node, e.type);
	r > 0 && n.setAttribute("data-has-nested", e.type), n.style.setProperty("--nested-layer-count", `${r}`);
}
function $s(e) {
	e.style.removeProperty("--layer-index"), e.style.removeProperty("--nested-layer-count"), e.style.removeProperty("--z-index"), e.removeAttribute("data-nested"), e.removeAttribute("data-has-nested");
}
function ec(e, t, n) {
	let r = new (e.ownerDocument.defaultView || window).CustomEvent(t, {
		cancelable: !0,
		bubbles: !0,
		detail: n
	});
	return e.dispatchEvent(r);
}
function tc(e, t, n) {
	e.addEventListener(t, n, { once: !0 });
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/pointer-event-outside.mjs
var nc = /* @__PURE__ */ new WeakMap(), rc = /* @__PURE__ */ new WeakMap();
function ic(e) {
	return Zs.isBelowPointerBlockingLayer(e) ? "none" : "auto";
}
function ac(e) {
	let t = ic(e);
	e.style.pointerEvents !== t && (e.style.pointerEvents = t);
}
function oc(e) {
	if (rc.has(e)) return;
	let t = Sn(e);
	if (t.MutationObserver === void 0) return;
	let n = new t.MutationObserver(() => {
		rc.has(e) && ac(e);
	});
	n.observe(e, {
		attributes: !0,
		attributeFilter: ["style"]
	}), rc.set(e, n);
}
function sc() {
	Zs.layers.forEach(({ node: e }) => {
		ac(e), oc(e);
	});
}
function cc(e) {
	let t = rc.get(e);
	t && (t.disconnect(), rc.delete(e)), e.style.pointerEvents = "";
}
function lc(e, t) {
	let n = Kt(e), r = [];
	return Zs.hasPointerBlockingLayer() && !n.body.hasAttribute("data-inert") && (nc.set(n.body, n.body.style.pointerEvents), queueMicrotask(() => {
		let e = n.body;
		e && (e.style.pointerEvents = "none", e.setAttribute("data-inert", ""));
	})), t?.forEach((e) => {
		let [t, n] = Ja(() => {
			let t = e();
			return sn(t) ? t : null;
		}, { timeout: 1e3 });
		t.then((e) => r.push(Yt(e, { pointerEvents: "auto" }))), r.push(n);
	}), () => {
		Zs.hasPointerBlockingLayer() || (queueMicrotask(() => {
			let e = n.body;
			if (!e) return;
			let t = nc.get(e);
			t !== void 0 && (e.style.pointerEvents = t, nc.delete(e)), e.removeAttribute("data-inert"), e.style.length === 0 && e.removeAttribute("style");
		}), r.forEach((e) => e()));
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/dismissable-layer.mjs
function uc(e, t) {
	let { onDismiss: n, onRequestDismiss: r, pointerBlocking: i, exclude: a, debug: o, type: s = "dialog", layerStyleTargets: c } = t, l = {
		dismiss: n,
		node: e,
		type: s,
		pointerBlocking: i,
		requestDismiss: r,
		styleTargets: c
	};
	Zs.add(l), sc();
	function u(r) {
		let i = Ge(r.detail.originalEvent);
		Zs.isBelowPointerBlockingLayer(e) || Zs.isInBranch(i) || (t.onPointerDownOutside?.(r), t.onInteractOutside?.(r), !r.defaultPrevented && (o && console.log("onPointerDownOutside:", r.detail.originalEvent), n?.()));
	}
	function d(e) {
		let r = Ge(e.detail.originalEvent);
		Zs.isInBranch(r) || (t.onFocusOutside?.(e), t.onInteractOutside?.(e), !e.defaultPrevented && (o && console.log("onFocusOutside:", e.detail.originalEvent), n?.()));
	}
	function f(r) {
		Zs.isTopMost(e) && (t.onEscapeKeyDown?.(r), !r.defaultPrevented && n && (r.preventDefault(), n()));
	}
	function p(n) {
		let r = typeof a == "function" ? a() : a, i = Array.isArray(r) ? r : [r], o = t.persistentElements?.map((e) => e()).filter(sn);
		return o && i.push(...o), i.some((e) => pt(e, n)) || Zs.isInNestedLayer(e, n);
	}
	let m = [
		i ? lc(e, t.persistentElements) : void 0,
		Ys(e, f),
		qs(e, {
			exclude: p,
			onFocusOutside: d,
			onPointerDownOutside: u,
			defer: t.defer
		})
	];
	return () => {
		Zs.remove(e), sc(), cc(e), m.forEach((e) => e?.());
	};
}
function dc(e, t) {
	let { warnOnMissingNode: n = !0 } = t;
	return Ya(e, (e) => uc(e, t), {
		defer: t.defer,
		onMissing: n ? () => bt("[@zag-js/dismissable] node is `null` or `undefined`") : void 0
	});
}
function fc(e, t = {}) {
	return Ya(e, (e) => (Zs.addBranch(e), () => {
		Zs.removeBranch(e);
	}), {
		defer: t.defer,
		onMissing: () => bt("[@zag-js/dismissable] branch node is `null` or `undefined`")
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+live-region@1.43.3/node_modules/@zag-js/live-region/dist/index.mjs
var pc = "__live-region__", mc = "__live-region-debug__", hc = "position:fixed;inset-inline:0;bottom:0;z-index:2147483647;padding:12px 16px;background:black;color:white;font-size:14px;line-height:20px;text-align:center;pointer-events:none;";
function gc(e = {}) {
	let { level: t = "polite", document: n = document, root: r, delay: i = 0, debug: a = !1 } = e, o = n.defaultView ?? window, s = r ?? n.body;
	function c() {
		if (!a) return;
		let e = n.getElementById(mc);
		return e || (e = n.createElement("div"), e.id = mc, e.dataset.liveAnnouncerDebug = "true", e.setAttribute("aria-hidden", "true"), e.style.cssText = hc, s.appendChild(e), e);
	}
	function l(e, r) {
		n.getElementById(pc)?.remove(), r ??= i;
		let a = n.createElement("span");
		a.id = pc, a.dataset.liveAnnouncer = "true";
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
		n.getElementById(pc)?.remove(), n.getElementById(mc)?.remove();
	}
	return {
		announce: l,
		destroy: u,
		toJSON() {
			return pc;
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+combobox@1.43.3/node_modules/@zag-js/combobox/dist/combobox.machine.mjs
var { guards: _c, createMachine: vc, choose: yc } = Fn(), { and: bc, not: xc } = _c, Sc = vc({
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
				Ca(e);
			},
			collection: mo.empty(),
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
					let r = n(), i = e("collection"), a = ei({
						values: t,
						collection: i,
						selectedItemMap: r.get("selectedItemMap")
					}), o = e("value") ?? t, s = o === t ? a : ei({
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
					t = Re(e("selectionBehavior"), {
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
			selectedItemMap: t(() => ({ defaultValue: ti({
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
		selectedItems: ({ context: e, prop: t }) => Qr({
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
	entry: yc([{
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
								guard: bc("isOpenControlled", "openOnChange"),
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
							guard: bc("isCustomValue", xc("allowCustomValue")),
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
								guard: bc("isOpenControlled", "autoComplete"),
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
								guard: bc("isOpenControlled", "autoComplete"),
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
						guard: bc("isOpenControlled", "isCustomValue", xc("hasHighlightedItem"), xc("allowCustomValue")),
						actions: ["revertInputValue", "invokeOnClose"]
					},
					{
						guard: bc("isCustomValue", xc("hasHighlightedItem"), xc("allowCustomValue")),
						target: "closed.focused",
						actions: ["revertInputValue", "invokeOnClose"]
					},
					{
						guard: bc("isOpenControlled", "closeOnSelect"),
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
						guard: bc("isOpenControlled", "closeOnSelect"),
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
						guard: bc("isOpenControlled", "isCustomValue", xc("allowCustomValue")),
						actions: ["revertInputValue", "invokeOnClose"]
					},
					{
						guard: bc("isCustomValue", xc("allowCustomValue")),
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
						guard: bc("autoComplete", "isLastItemHighlighted"),
						actions: ["clearHighlightedValue", "scrollContentToTop"]
					}, { actions: ["highlightNextItem"] }],
					"INPUT.ARROW_UP": [{
						guard: bc("autoComplete", "isFirstItemHighlighted"),
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
							guard: bc("isOpenControlled", "autoComplete"),
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
							guard: bc("isHighlightedItemRemoved", "hasCollectionItems", "autoHighlight"),
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
				return nt(n) ? n : !!n?.({ inputValue: t.get("inputValue") });
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
				return Ro({ root: e.getRootNode?.() });
			},
			trackDismissableLayer({ send: e, prop: t, scope: n }) {
				return t("disableLayer") ? void 0 : dc(() => Es(n), {
					type: "listbox",
					defer: !0,
					exclude: () => [
						Ds(n),
						As(n),
						js(n)
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
				let n = gc({
					level: "assertive",
					document: t.getDoc()
				});
				return e.set("liveRegion", n), () => n.destroy();
			},
			trackPlacement({ context: e, prop: t, scope: n }) {
				return e.set("currentPlacement", t("positioning").placement), fs(() => ks(n) || As(n), () => Os(n), {
					...t("positioning"),
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			scrollToHighlightedItem({ context: e, prop: t, scope: n }) {
				let r = Ds(n), i = [], a = (r) => {
					if (Fo() === "pointer") return;
					let a = e.get("highlightedValue");
					if (!a) return;
					let o = Es(n), s = t("scrollToIndexFn");
					if (s) {
						s({
							index: t("collection").indexOf(a),
							immediate: r,
							getElement: () => Ms(n, a)
						});
						return;
					}
					let c = Ms(n, a), l = Y(() => {
						Ra(c, {
							rootEl: o,
							block: "nearest"
						});
					});
					i.push(l);
				}, o = Y(() => {
					Io("virtual"), a(!0);
				});
				i.push(o);
				let s = ba(r, {
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
				fs(() => ks(n), () => Os(n), {
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
				let a = n("multiple") ? mt(t.get("value"), i) : [i];
				n("onSelect")?.({
					value: a,
					itemValue: i
				}), t.set("value", a);
				let o = Re(n("selectionBehavior"), {
					preserve: t.get("inputValue"),
					replace: r.stringifyMany(a),
					clear: ""
				});
				t.set("inputValue", o);
			},
			scrollToHighlightedItem({ context: e, prop: t, scope: n }) {
				lt(() => {
					let r = e.get("highlightedValue");
					if (r == null) return;
					let i = Ms(n, r), a = Es(n), o = t("scrollToIndexFn");
					if (o) {
						o({
							index: t("collection").indexOf(r),
							immediate: !0,
							getElement: () => Ms(n, r)
						});
						return;
					}
					Ra(i, {
						rootEl: a,
						block: "nearest"
					});
				});
			},
			selectItem(e) {
				let { context: t, event: n, flush: r, prop: i } = e;
				n.value != null && r(() => {
					let e = i("multiple") ? mt(t.get("value"), n.value) : [n.value];
					i("onSelect")?.({
						value: e,
						itemValue: n.value
					}), t.set("value", e);
					let r = Re(i("selectionBehavior"), {
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
					let e = wn(t.get("value"), n.value);
					t.set("value", e);
					let r = Re(i("selectionBehavior"), {
						preserve: t.get("inputValue"),
						replace: i("collection").stringifyMany(e),
						clear: ""
					});
					t.set("inputValue", r);
				});
			},
			setInitialFocus({ scope: e }) {
				Y(() => {
					Ns(e);
				});
			},
			setFinalFocus({ scope: e }) {
				Y(() => {
					As(e)?.dataset.focusable == null ? Ns(e) : Ps(e);
				});
			},
			syncInputValue({ context: e, scope: t, event: n }) {
				let r = Ds(t);
				r && (r.value = e.get("inputValue"), queueMicrotask(() => {
					n.current().type !== "INPUT.CHANGE" && Ni(r);
				}));
			},
			setInputValue({ context: e, event: t }) {
				e.set("inputValue", t.value);
			},
			clearInputValue({ context: e }) {
				e.set("inputValue", "");
			},
			revertInputValue({ context: e, prop: t, computed: n }) {
				let r = t("selectionBehavior"), i = Re(r, {
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
					let e = Re(i("selectionBehavior"), {
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
					let e = Re(r("selectionBehavior"), {
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
						getElement: () => Ms(t, r)
					});
				} else {
					let e = Es(t);
					if (!e) return;
					e.scrollTop = 0;
				}
			},
			invokeOnOpen({ prop: e, event: t, context: n }) {
				let r = Cc(t);
				e("onOpenChange")?.({
					open: !0,
					reason: r,
					value: n.get("value")
				});
			},
			invokeOnClose({ prop: e, event: t, context: n }) {
				let r = Cc(t);
				e("onOpenChange")?.({
					open: !1,
					reason: r,
					value: n.get("value")
				});
			},
			highlightFirstItem({ context: e, prop: t, scope: n }) {
				(Es(n) ? queueMicrotask : Y)(() => {
					let n = t("collection").firstValue;
					n && e.set("highlightedValue", n);
				});
			},
			highlightFirstItemIfNeeded({ computed: e, action: t }) {
				e("autoHighlight") && t(["highlightFirstItem"]);
			},
			highlightLastItem({ context: e, prop: t, scope: n }) {
				(Es(n) ? queueMicrotask : Y)(() => {
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
				Y(() => {
					let [n] = t("collection").sort(e.get("value"));
					n && e.set("highlightedValue", n);
				});
			},
			highlightFirstOrSelectedItem({ context: e, prop: t, computed: n }) {
				Y(() => {
					let r = null;
					r = n("hasSelectedItems") ? t("collection").sort(e.get("value"))[0] : t("collection").firstValue, r && e.set("highlightedValue", r);
				});
			},
			highlightLastOrSelectedItem({ context: e, prop: t, computed: n }) {
				Y(() => {
					let r = t("collection"), i = null;
					i = n("hasSelectedItems") ? r.sort(e.get("value"))[0] : r.lastValue, i && e.set("highlightedValue", i);
				});
			},
			autofillInputValue({ context: e, computed: t, prop: n, event: r, scope: i }) {
				let a = Ds(i), o = n("collection");
				if (!t("autoComplete") || !a || !r.keypress) return;
				let s = o.stringify(e.get("highlightedValue"));
				Y(() => {
					a.value = s || e.get("inputValue");
				});
			},
			syncSelectedItems(e) {
				queueMicrotask(() => {
					let { context: t, prop: n } = e, r = n("collection"), i = t.get("value"), a = ei({
						values: i,
						collection: r,
						selectedItemMap: t.get("selectedItemMap")
					});
					t.set("selectedItemMap", a.nextSelectedItemMap);
					let o = Re(n("selectionBehavior"), {
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
				if (!qe()) return;
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
function Cc(e) {
	return (e.previousEvent || e).src;
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox.anatomy.js
var wc = fo.extendWith("empty"), Tc = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Ec(e, t) {
	k(t, !0);
	let n = wc.build(), r = L(t, "ref", 15, null), i = K(t, Tc), a = Za(), o = y(() => a().collection.size === 0);
	var s = {
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), A();
		}
	}, c = P(), l = G(c), u = (e) => {
		Q(e, J({ as: "div" }, () => n.empty.attrs, () => i, {
			role: "presentation",
			get ref() {
				return r();
			},
			set ref(e) {
				r(e);
			}
		}));
	};
	return M(l, (e) => {
		z(o) && e(u);
	}), F(e, c), x(s);
}
H(Ec, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox-control.svelte
var Dc = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Oc(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, Dc), i = Za(), a = y(() => X(i().getControlProps(), r));
	return Q(e, J({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(Oc, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox-input.svelte
var kc = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Ac(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, kc), i = Za(), a = y(() => X(i().getInputProps(), r));
	return Q(e, J({ as: "input" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(Ac, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/use-combobox-item-context.js
var [jc, Mc] = an({
	name: "ComboboxItemContext",
	hookName: "useComboboxItemContext",
	providerName: "<ComboboxItemProvider />"
}), [Nc, Pc] = an({
	name: "ComboboxItemPropsContext",
	hookName: "useComboboxItemPropsContext",
	providerName: "<ComboboxItemPropsProvider />"
}), Fc = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Ic(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, Fc), i = y(() => Bt()(r, ["item", "persistFocus"])), a = y(() => w(z(i), 2)), o = y(() => z(a)[0]), s = y(() => z(a)[1]), c = Za(), l = y(() => c().getItemState(z(o))), u = y(() => X(c().getItemProps(z(o)), z(s)));
	return jc(() => z(l)), Nc(() => z(o)), Q(e, J({ as: "div" }, () => z(u), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(Ic, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox-positioner.svelte
var Lc = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Rc(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, Lc), i = Za(), a = co(), o = y(() => X(i().getPositionerProps(), r));
	var s = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	}, c = P(), l = G(c), u = (e) => {
		Q(e, J({ as: "div" }, () => z(o), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, d = y(() => !a().unmounted);
	return M(l, (e) => {
		z(d) && e(u);
	}), F(e, c), x(s);
}
H(Rc, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+i18n-utils@1.43.3/node_modules/@zag-js/i18n-utils/dist/cache.mjs
function zc(e) {
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
var Bc = zc(Intl.NumberFormat);
function Vc(e, t, n = {}) {
	return Bc(t, n).format(e);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+i18n-utils@1.43.3/node_modules/@zag-js/i18n-utils/dist/format-bytes.mjs
var Hc = [
	"",
	"kilo",
	"mega",
	"giga",
	"tera"
], Uc = [
	"",
	"kilo",
	"mega",
	"giga",
	"tera",
	"peta"
], Wc = (e, t = "en-US", n = {}) => {
	if (Number.isNaN(e)) return "";
	if (e === 0) return "0 B";
	let { unitSystem: r = "decimal", precision: i = 3, unit: a = "byte", unitDisplay: o = "short" } = n, s = r === "binary" ? 1024 : 1e3, c = a === "bit" ? Hc : Uc, l = e < 0, u = Math.abs(e), d = 0;
	for (; u >= s && d < c.length - 1;) u /= s, d++;
	let f = parseFloat(u.toPrecision(i));
	return Vc(l ? -f : f, t, {
		style: "unit",
		unit: c[d] + a,
		unitDisplay: o
	});
}, Gc = /* @__PURE__ */ new Set([
	"Avst",
	"Arab",
	"Armi",
	"Syrc",
	"Samr",
	"Mand",
	"Thaa",
	"Mend",
	"Nkoo",
	"Adlm",
	"Rohg",
	"Hebr"
]), Kc = /* @__PURE__ */ new Set([
	"ae",
	"ar",
	"arc",
	"bcc",
	"bqi",
	"ckb",
	"dv",
	"fa",
	"glk",
	"he",
	"ku",
	"mzn",
	"nqo",
	"pnb",
	"ps",
	"sd",
	"ug",
	"ur",
	"yi"
]);
function qc(e) {
	if (Intl.Locale) {
		let t = new Intl.Locale(e).maximize().script ?? "";
		return Gc.has(t);
	}
	let t = e.split("-")[0];
	return Kc.has(t);
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/providers/locale/locale-provider.svelte
function Jc(e, t) {
	k(t, !0);
	let n = L(t, "locale", 7), r = L(t, "children", 7), i = y(() => ({
		locale: n(),
		dir: qc(n()) ? "rtl" : "ltr"
	}));
	bn(() => z(i));
	var a = {
		get locale() {
			return n();
		},
		set locale(e) {
			n(e), A();
		},
		get children() {
			return r();
		},
		set children(e) {
			r(e), A();
		}
	}, o = P(), s = G(o);
	return Se(s, () => r() ?? S), F(e, o), x(a);
}
H(Jc, {
	locale: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/utils.mjs
function Yc(e, t) {
	return e - t * Math.floor(e / t);
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/calendars/GregorianCalendar.mjs
var Xc = 1721426;
function Zc(e, t, n, r) {
	t = $c(e, t);
	let i = t - 1, a = -2;
	return n <= 2 ? a = 0 : Qc(t) && (a = -1), 1721425 + 365 * i + Math.floor(i / 4) - Math.floor(i / 100) + Math.floor(i / 400) + Math.floor((367 * n - 362) / 12 + a + r);
}
function Qc(e) {
	return e % 4 == 0 && (e % 100 != 0 || e % 400 == 0);
}
function $c(e, t) {
	return e === "BC" ? 1 - t : t;
}
function el(e) {
	let t = "AD";
	return e <= 0 && (t = "BC", e = 1 - e), [t, e];
}
var tl = {
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
}, nl = class {
	fromJulianDay(e) {
		let t = e, n = t - Xc, r = Math.floor(n / 146097), i = Yc(n, 146097), a = Math.floor(i / 36524), o = Yc(i, 36524), s = Math.floor(o / 1461), c = Yc(o, 1461), l = Math.floor(c / 365), [u, d] = el(r * 400 + a * 100 + s * 4 + l + +(a !== 4 && l !== 4)), f = t - Zc(u, d, 1, 1), p = 2;
		t < Zc(u, d, 3, 1) ? p = 0 : Qc(d) && (p = 1);
		let m = Math.floor(((f + p) * 12 + 373) / 367);
		return new Nu(u, d, m, t - Zc(u, d, m, 1) + 1);
	}
	toJulianDay(e) {
		return Zc(e.era, e.year, e.month, e.day);
	}
	getDaysInMonth(e) {
		return tl[Qc(e.year) ? "leapyear" : "standard"][e.month - 1];
	}
	getMonthsInYear(e) {
		return 12;
	}
	getDaysInYear(e) {
		return Qc(e.year) ? 366 : 365;
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
}, rl = {
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
function il(e, t) {
	return t = Zl(t, e.calendar), e.era === t.era && e.year === t.year && e.month === t.month && e.day === t.day;
}
function al(e, t) {
	return t = Zl(t, e.calendar), e = Cl(e), t = Cl(t), e.era === t.era && e.year === t.year && e.month === t.month;
}
function ol(e, t) {
	return t = Zl(t, e.calendar), e = Tl(e), t = Tl(t), e.era === t.era && e.year === t.year;
}
function sl(e, t) {
	return ul(e.calendar, t.calendar) && il(e, t);
}
function cl(e, t) {
	return ul(e.calendar, t.calendar) && al(e, t);
}
function ll(e, t) {
	return ul(e.calendar, t.calendar) && ol(e, t);
}
function ul(e, t) {
	return e.isEqual?.(t) ?? t.isEqual?.(e) ?? e.identifier === t.identifier;
}
function dl(e, t) {
	return il(e, hl(t));
}
var fl = {
	sun: 0,
	mon: 1,
	tue: 2,
	wed: 3,
	thu: 4,
	fri: 5,
	sat: 6
};
function pl(e, t, n) {
	let r = e.calendar.toJulianDay(e), i = n ? fl[n] : Ml(t), a = Math.ceil(r + 1 - i) % 7;
	return a < 0 && (a += 7), a;
}
function ml(e) {
	return Jl(Date.now(), e);
}
function hl(e) {
	return Yl(ml(e));
}
function gl(e, t) {
	return e.calendar.toJulianDay(e) - t.calendar.toJulianDay(t);
}
function _l(e, t) {
	return vl(e) - vl(t);
}
function vl(e) {
	return e.hour * 36e5 + e.minute * 6e4 + e.second * 1e3 + e.millisecond;
}
var yl = null, bl = !1;
function xl() {
	return yl ??= new Intl.DateTimeFormat().resolvedOptions().timeZone, yl;
}
function Sl() {
	return bl;
}
function Cl(e) {
	return e.subtract({ days: e.day - 1 });
}
function wl(e) {
	return e.add({ days: e.calendar.getDaysInMonth(e) - e.day });
}
function Tl(e) {
	return Cl(e.subtract({ months: e.month - 1 }));
}
function El(e) {
	return wl(e.add({ months: e.calendar.getMonthsInYear(e) - e.month }));
}
function Dl(e, t, n) {
	let r = pl(e, t, n);
	return e.subtract({ days: r });
}
function Ol(e, t, n) {
	return Dl(e, t, n).add({ days: 6 });
}
var kl = /* @__PURE__ */ new Map(), Al = /* @__PURE__ */ new Map();
function jl(e) {
	if (Intl.Locale) {
		let t = kl.get(e);
		return t || (t = new Intl.Locale(e).maximize().region, t && kl.set(e, t)), t;
	}
	let t = e.split("-")[1];
	return t === "u" ? void 0 : t;
}
function Ml(e) {
	let t = Al.get(e);
	if (!t) {
		if (Intl.Locale) {
			let n = new Intl.Locale(e);
			if ("getWeekInfo" in n && (t = n.getWeekInfo(), t)) return Al.set(e, t), t.firstDay;
		}
		let n = jl(e);
		if (e.includes("-fw-")) {
			let n = e.split("-fw-")[1].split("-")[0];
			t = n === "mon" ? { firstDay: 1 } : n === "tue" ? { firstDay: 2 } : n === "wed" ? { firstDay: 3 } : n === "thu" ? { firstDay: 4 } : n === "fri" ? { firstDay: 5 } : n === "sat" ? { firstDay: 6 } : { firstDay: 0 };
		} else t = e.includes("-ca-iso8601") ? { firstDay: 1 } : { firstDay: n && rl[n] || 0 };
		Al.set(e, t);
	}
	return t.firstDay;
}
function Nl(e, t, n) {
	let r = e.calendar.getDaysInMonth(e);
	return Math.ceil((pl(Cl(e), t, n) + r) / 7);
}
function Pl(e, t) {
	return e && t ? e.compare(t) <= 0 ? e : t : e || t;
}
function Fl(e, t) {
	return e && t ? e.compare(t) >= 0 ? e : t : e || t;
}
var Il = {
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
function Ll(e, t) {
	let n = e.calendar.toJulianDay(e), r = Math.ceil(n + 1) % 7;
	r < 0 && (r += 7);
	let [i, a] = Il[jl(t)] || [6, 0];
	return r === i || r === a;
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/conversion.mjs
function Rl(e) {
	return e = Zl(e, new nl()), zl($c(e.era, e.year), e.month, e.day, e.hour, e.minute, e.second, e.millisecond);
}
function zl(e, t, n, r, i, a, o) {
	let s = /* @__PURE__ */ new Date();
	return s.setUTCHours(r, i, a, o), s.setUTCFullYear(e, t - 1, n), s.getTime();
}
function Bl(e, t) {
	if (t === "UTC") return 0;
	if (e > 0 && t === xl() && !Sl()) return new Date(e).getTimezoneOffset() * -6e4;
	let { year: n, month: r, day: i, hour: a, minute: o, second: s } = Hl(e, t);
	return zl(n, r, i, a, o, s, 0) - Math.floor(e / 1e3) * 1e3;
}
var Vl = /* @__PURE__ */ new Map();
function Hl(e, t) {
	let n = Vl.get(t);
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
	}), Vl.set(t, n));
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
var Ul = 864e5;
function Wl(e, t, n, r) {
	return (n === r ? [n] : [n, r]).filter((n) => Gl(e, t, n));
}
function Gl(e, t, n) {
	let r = Hl(n, t);
	return e.year === r.year && e.month === r.month && e.day === r.day && e.hour === r.hour && e.minute === r.minute && e.second === r.second;
}
function Kl(e, t, n = "compatible") {
	let r = Xl(e);
	if (t === "UTC") return Rl(r);
	if (t === xl() && n === "compatible" && !Sl()) {
		r = Zl(r, new nl());
		let e = /* @__PURE__ */ new Date(), t = $c(r.era, r.year);
		return e.setFullYear(t, r.month - 1, r.day), e.setHours(r.hour, r.minute, r.second, r.millisecond), e.getTime();
	}
	let i = Rl(r), a = Bl(i - Ul, t), o = Bl(i + Ul, t), s = Wl(r, t, i - a, i - o);
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
function ql(e, t, n = "compatible") {
	return new Date(Kl(e, t, n));
}
function Jl(e, t) {
	let n = Bl(e, t), r = new Date(e + n), i = r.getUTCFullYear(), a = r.getUTCMonth() + 1, o = r.getUTCDate(), s = r.getUTCHours(), c = r.getUTCMinutes(), l = r.getUTCSeconds(), u = r.getUTCMilliseconds();
	return new Fu(i < 1 ? "BC" : "AD", i < 1 ? -i + 1 : i, a, o, t, n, s, c, l, u);
}
function Yl(e) {
	return new Nu(e.calendar, e.era, e.year, e.month, e.day);
}
function Xl(e, t) {
	let n = 0, r = 0, i = 0, a = 0;
	if ("timeZone" in e) ({hour: n, minute: r, second: i, millisecond: a} = e);
	else if ("hour" in e && !t) return e;
	return t && ({hour: n, minute: r, second: i, millisecond: a} = t), new Pu(e.calendar, e.era, e.year, e.month, e.day, n, r, i, a);
}
function Zl(e, t) {
	if (ul(e.calendar, t)) return e;
	let n = t.fromJulianDay(e.calendar.toJulianDay(e)), r = e.copy();
	return r.calendar = t, r.era = n.era, r.year = n.year, r.month = n.month, r.day = n.day, su(r), r;
}
function Ql(e, t, n) {
	return e instanceof Fu ? e.timeZone === t ? e : eu(e, t) : Jl(Kl(e, t, n), t);
}
function $l(e) {
	let t = Rl(e) - e.offset;
	return new Date(t);
}
function eu(e, t) {
	return Zl(Jl(Rl(e) - e.offset, t), e.calendar);
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/manipulation.mjs
var tu = 36e5;
function nu(e, t) {
	let n = e.copy(), r = "hour" in n ? hu(n, t) : 0;
	ru(n, t.years || 0), n.calendar.balanceYearMonth && n.calendar.balanceYearMonth(n, e), n.month += t.months || 0, iu(n), ou(n), n.day += (t.weeks || 0) * 7, n.day += t.days || 0, n.day += r, au(n), n.calendar.balanceDate && n.calendar.balanceDate(n), n.year < 1 && (n.year = 1, n.month = 1, n.day = 1);
	let i = n.calendar.getYearsInEra(n);
	if (n.year > i) {
		let e = n.calendar.isInverseEra?.(n);
		n.year = i, n.month = e ? 1 : n.calendar.getMonthsInYear(n), n.day = e ? 1 : n.calendar.getDaysInMonth(n);
	}
	n.month < 1 && (n.month = 1, n.day = 1);
	let a = n.calendar.getMonthsInYear(n);
	return n.month > a && (n.month = a, n.day = n.calendar.getDaysInMonth(n)), n.day = Math.max(1, Math.min(n.calendar.getDaysInMonth(n), n.day)), n;
}
function ru(e, t) {
	e.calendar.isInverseEra?.(e) && (t = -t), e.year += t;
}
function iu(e) {
	for (; e.month < 1;) ru(e, -1), e.month += e.calendar.getMonthsInYear(e);
	let t = 0;
	for (; e.month > (t = e.calendar.getMonthsInYear(e));) e.month -= t, ru(e, 1);
}
function au(e) {
	for (; e.day < 1;) e.month--, iu(e), e.day += e.calendar.getDaysInMonth(e);
	for (; e.day > e.calendar.getDaysInMonth(e);) e.day -= e.calendar.getDaysInMonth(e), e.month++, iu(e);
}
function ou(e) {
	e.month = Math.max(1, Math.min(e.calendar.getMonthsInYear(e), e.month)), e.day = Math.max(1, Math.min(e.calendar.getDaysInMonth(e), e.day));
}
function su(e) {
	e.calendar.constrainDate && e.calendar.constrainDate(e), e.year = Math.max(1, Math.min(e.calendar.getYearsInEra(e), e.year)), ou(e);
}
function cu(e) {
	let t = {};
	for (let n in e) typeof e[n] == "number" && (t[n] = -e[n]);
	return t;
}
function lu(e, t) {
	return nu(e, cu(t));
}
function uu(e, t) {
	let n = e.copy();
	return t.era != null && (n.era = t.era), t.year != null && (n.year = t.year), t.month != null && (n.month = t.month), t.day != null && (n.day = t.day), su(n), n;
}
function du(e, t) {
	let n = e.copy();
	return t.hour != null && (n.hour = t.hour), t.minute != null && (n.minute = t.minute), t.second != null && (n.second = t.second), t.millisecond != null && (n.millisecond = t.millisecond), pu(n), n;
}
function fu(e) {
	e.second += Math.floor(e.millisecond / 1e3), e.millisecond = mu(e.millisecond, 1e3), e.minute += Math.floor(e.second / 60), e.second = mu(e.second, 60), e.hour += Math.floor(e.minute / 60), e.minute = mu(e.minute, 60);
	let t = Math.floor(e.hour / 24);
	return e.hour = mu(e.hour, 24), t;
}
function pu(e) {
	e.millisecond = Math.max(0, Math.min(e.millisecond, 999)), e.second = Math.max(0, Math.min(e.second, 59)), e.minute = Math.max(0, Math.min(e.minute, 59)), e.hour = Math.max(0, Math.min(e.hour, 23));
}
function mu(e, t) {
	let n = e % t;
	return n < 0 && (n += t), n;
}
function hu(e, t) {
	return e.hour += t.hours || 0, e.minute += t.minutes || 0, e.second += t.seconds || 0, e.millisecond += t.milliseconds || 0, fu(e);
}
function gu(e, t, n, r) {
	let i = e.copy();
	switch (t) {
		case "era": {
			let t = e.calendar.getEras(), a = t.indexOf(e.era);
			if (a < 0) throw Error("Invalid era: " + e.era);
			a = vu(a, n, 0, t.length - 1, r?.round), i.era = t[a], su(i);
			break;
		}
		case "year":
			i.calendar.isInverseEra?.(i) && (n = -n), i.year = vu(e.year, n, -Infinity, 9999, r?.round), i.year === -Infinity && (i.year = 1), i.calendar.balanceYearMonth && i.calendar.balanceYearMonth(i, e);
			break;
		case "month":
			i.month = vu(e.month, n, 1, e.calendar.getMonthsInYear(e), r?.round);
			break;
		case "day":
			i.day = vu(e.day, n, 1, e.calendar.getDaysInMonth(e), r?.round);
			break;
		default: throw Error("Unsupported field " + t);
	}
	return e.calendar.balanceDate && e.calendar.balanceDate(i), su(i), i;
}
function _u(e, t, n, r) {
	let i = e.copy();
	switch (t) {
		case "hour": {
			let t = e.hour, a = 0, o = 23;
			if (r?.hourCycle === 12) {
				let e = t >= 12;
				a = e ? 12 : 0, o = e ? 23 : 11;
			}
			i.hour = vu(t, n, a, o, r?.round);
			break;
		}
		case "minute":
			i.minute = vu(e.minute, n, 0, 59, r?.round);
			break;
		case "second":
			i.second = vu(e.second, n, 0, 59, r?.round);
			break;
		case "millisecond":
			i.millisecond = vu(e.millisecond, n, 0, 999, r?.round);
			break;
		default: throw Error("Unsupported field " + t);
	}
	return i;
}
function vu(e, t, n, r, i = !1) {
	if (i) {
		e += Math.sign(t), e < n && (e = r);
		let i = Math.abs(t);
		e = t > 0 ? Math.ceil(e / i) * i : Math.floor(e / i) * i, e > r && (e = n);
	} else e += t, e < n ? e = r - (n - e - 1) : e > r && (e = n + (e - r - 1));
	return e;
}
function yu(e, t) {
	let n;
	return n = t.years != null && t.years !== 0 || t.months != null && t.months !== 0 || t.weeks != null && t.weeks !== 0 || t.days != null && t.days !== 0 ? Kl(nu(Xl(e), {
		years: t.years,
		months: t.months,
		weeks: t.weeks,
		days: t.days
	}), e.timeZone) : Rl(e) - e.offset, n += t.milliseconds || 0, n += (t.seconds || 0) * 1e3, n += (t.minutes || 0) * 6e4, n += (t.hours || 0) * 36e5, Zl(Jl(n, e.timeZone), e.calendar);
}
function bu(e, t) {
	return yu(e, cu(t));
}
function xu(e, t, n, r) {
	switch (t) {
		case "hour": {
			let t = 0, i = 23;
			if (r?.hourCycle === 12) {
				let n = e.hour >= 12;
				t = n ? 12 : 0, i = n ? 23 : 11;
			}
			let a = Xl(e), o = Zl(du(a, { hour: t }), new nl()), s = [Kl(o, e.timeZone, "earlier"), Kl(o, e.timeZone, "later")].filter((t) => Jl(t, e.timeZone).day === o.day)[0], c = Zl(du(a, { hour: i }), new nl()), l = [Kl(c, e.timeZone, "earlier"), Kl(c, e.timeZone, "later")].filter((t) => Jl(t, e.timeZone).day === c.day).pop(), u = Rl(e) - e.offset, d = Math.floor(u / tu), f = u % tu;
			return u = vu(d, n, Math.floor(s / tu), Math.floor(l / tu), r?.round) * tu + f, Zl(Jl(u, e.timeZone), e.calendar);
		}
		case "minute":
		case "second":
		case "millisecond": return _u(e, t, n, r);
		case "era":
		case "year":
		case "month":
		case "day": return Zl(Jl(Kl(gu(Xl(e), t, n, r), e.timeZone), e.timeZone), e.calendar);
		default: throw Error("Unsupported field " + t);
	}
}
function Su(e, t, n) {
	let r = Xl(e), i = du(uu(r, t), t);
	return i.compare(r) === 0 ? e : Zl(Jl(Kl(i, e.timeZone, n), e.timeZone), e.calendar);
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/string.mjs
var Cu = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})$/, wu = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})(?:T(\d{2}))?(?::(\d{2}))?(?::(\d{2}))?(\.\d+)?(?:(?:([+-]\d{2})(?::?(\d{2}))?)|Z)$/;
function Tu(e) {
	let t = e.match(Cu);
	if (!t) throw wu.test(e) ? Error(`Invalid ISO 8601 date string: ${e}. Use parseAbsolute() instead.`) : Error("Invalid ISO 8601 date string: " + e);
	let n = new Nu(Eu(t[1], 0, 9999), Eu(t[2], 1, 12), 1);
	return n.day = Eu(t[3], 1, n.calendar.getDaysInMonth(n)), n;
}
function Eu(e, t, n) {
	let r = Number(e);
	if (r < t || r > n) throw RangeError(`Value out of range: ${t} <= ${r} <= ${n}`);
	return r;
}
function Du(e) {
	return `${String(e.hour).padStart(2, "0")}:${String(e.minute).padStart(2, "0")}:${String(e.second).padStart(2, "0")}${e.millisecond ? String(e.millisecond / 1e3).slice(1) : ""}`;
}
function Ou(e) {
	let t = Zl(e, new nl()), n;
	return n = t.era === "BC" ? t.year === 1 ? "0000" : "-" + String(Math.abs(1 - t.year)).padStart(6, "00") : String(t.year).padStart(4, "0"), `${n}-${String(t.month).padStart(2, "0")}-${String(t.day).padStart(2, "0")}`;
}
function ku(e) {
	return `${Ou(e)}T${Du(e)}`;
}
function Au(e) {
	let t = Math.sign(e) < 0 ? "-" : "+";
	e = Math.abs(e);
	let n = Math.floor(e / 36e5), r = Math.floor(e % 36e5 / 6e4), i = Math.floor(e % 36e5 % 6e4 / 1e3), a = `${t}${String(n).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
	return i !== 0 && (a += `:${String(i).padStart(2, "0")}`), a;
}
function ju(e) {
	return `${ku(e)}${Au(e.offset)}[${e.timeZone}]`;
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/CalendarDate.mjs
function Mu(e) {
	let t = typeof e[0] == "object" ? e.shift() : new nl(), n;
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
var Nu = class e {
	constructor(...e) {
		let [t, n, r, i, a] = Mu(e);
		this.calendar = t, this.era = n, this.year = r, this.month = i, this.day = a, su(this);
	}
	copy() {
		return this.era ? new e(this.calendar, this.era, this.year, this.month, this.day) : new e(this.calendar, this.year, this.month, this.day);
	}
	add(e) {
		return nu(this, e);
	}
	subtract(e) {
		return lu(this, e);
	}
	set(e) {
		return uu(this, e);
	}
	cycle(e, t, n) {
		return gu(this, e, t, n);
	}
	toDate(e) {
		return ql(this, e);
	}
	toString() {
		return Ou(this);
	}
	compare(e) {
		return gl(this, e);
	}
}, Pu = class e {
	constructor(...e) {
		let [t, n, r, i, a] = Mu(e);
		this.calendar = t, this.era = n, this.year = r, this.month = i, this.day = a, this.hour = e.shift() || 0, this.minute = e.shift() || 0, this.second = e.shift() || 0, this.millisecond = e.shift() || 0, su(this);
	}
	copy() {
		return this.era ? new e(this.calendar, this.era, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond) : new e(this.calendar, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);
	}
	add(e) {
		return nu(this, e);
	}
	subtract(e) {
		return lu(this, e);
	}
	set(e) {
		return uu(du(this, e), e);
	}
	cycle(e, t, n) {
		switch (e) {
			case "era":
			case "year":
			case "month":
			case "day": return gu(this, e, t, n);
			default: return _u(this, e, t, n);
		}
	}
	toDate(e, t) {
		return ql(this, e, t);
	}
	toString() {
		return ku(this);
	}
	compare(e) {
		let t = gl(this, e);
		return t === 0 ? _l(this, Xl(e)) : t;
	}
}, Fu = class e {
	constructor(...e) {
		let [t, n, r, i, a] = Mu(e), o = e.shift(), s = e.shift();
		this.calendar = t, this.era = n, this.year = r, this.month = i, this.day = a, this.timeZone = o, this.offset = s, this.hour = e.shift() || 0, this.minute = e.shift() || 0, this.second = e.shift() || 0, this.millisecond = e.shift() || 0, su(this);
	}
	copy() {
		return this.era ? new e(this.calendar, this.era, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond) : new e(this.calendar, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond);
	}
	add(e) {
		return yu(this, e);
	}
	subtract(e) {
		return bu(this, e);
	}
	set(e, t) {
		return Su(this, e, t);
	}
	cycle(e, t, n) {
		return xu(this, e, t, n);
	}
	toDate() {
		return $l(this);
	}
	toString() {
		return ju(this);
	}
	toAbsoluteString() {
		return this.toDate().toISOString();
	}
	compare(e) {
		return this.toDate().getTime() - Ql(e, this.timeZone).toDate().getTime();
	}
}, Iu = /* @__PURE__ */ new Map(), Lu = class {
	constructor(e, t = {}) {
		this.formatter = zu(e, t), this.options = t;
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
		return Uu() && (this.resolvedHourCycle ||= Wu(e.locale, this.options), e.hourCycle = this.resolvedHourCycle, e.hour12 = this.resolvedHourCycle === "h11" || this.resolvedHourCycle === "h12"), e.calendar === "ethiopic-amete-alem" && (e.calendar = "ethioaa"), e;
	}
}, Ru = {
	true: { ja: "h11" },
	false: {}
};
function zu(e, t = {}) {
	if (typeof t.hour12 == "boolean" && Vu()) {
		t = { ...t };
		let n = Ru[String(t.hour12)][e.split("-")[0]], r = t.hour12 ? "h12" : "h23";
		t.hourCycle = n ?? r, delete t.hour12;
	}
	let n = e + (t ? Object.entries(t).sort((e, t) => e[0] < t[0] ? -1 : 1).join() : "");
	if (Iu.has(n)) return Iu.get(n);
	let r = new Intl.DateTimeFormat(e, t);
	return Iu.set(n, r), r;
}
var Bu = null;
function Vu() {
	return Bu ??= new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		hour12: !1
	}).format(new Date(2020, 2, 3, 0)) === "24", Bu;
}
var Hu = null;
function Uu() {
	return Hu ??= new Intl.DateTimeFormat("fr", {
		hour: "numeric",
		hour12: !1
	}).resolvedOptions().hourCycle === "h12", Hu;
}
function Wu(e, t) {
	if (!t.timeStyle && !t.hour) return;
	e = e.replace(/(-u-)?-nu-[a-zA-Z0-9]+/, ""), e += (e.includes("-u-") ? "" : "-u") + "-nu-latn";
	let n = zu(e, {
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
var [Gu, Ku] = an({
	name: "FieldContext",
	strict: !1
}), qu = (e) => {
	let t = pn(), n = Zt(), r = Ku(), i = y(() => {
		let i = Xe(e), a = Xe(i.collection);
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
	}), a = Ut(Sc, () => z(i)), o = y(() => Is(a, gn));
	return () => z(o);
}, Ju = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"open",
	"value",
	"inputValue"
]);
function Yu(e, t) {
	let n = g();
	k(t, !0);
	let r = L(t, "ref", 15, null), i = L(t, "open", 15), a = L(t, "value", 15), o = L(t, "inputValue", 15), s = K(t, Ju), c = y(() => oo(s)), l = y(() => w(z(c), 2)), u = y(() => z(l)[0]), d = y(() => z(l)[1]), f = y(() => Bt()(z(d), /* @__PURE__ */ "allowCustomValue.alwaysSubmitOnEnter.autoFocus.closeOnSelect.collection.composite.defaultHighlightedValue.defaultInputValue.defaultOpen.defaultValue.disabled.disableLayer.form.highlightedValue.id.ids.inputBehavior.inputValue.invalid.loopFocus.multiple.name.navigate.onFocusOutside.onHighlightChange.onInputValueChange.onInteractOutside.onOpenChange.onPointerDownOutside.onSelect.onValueChange.open.openOnChange.openOnClick.openOnKeyPress.placeholder.positioning.readOnly.required.scrollToIndexFn.selectionBehavior.translations.value".split("."))), p = y(() => w(z(f), 2)), m = y(() => z(p)[0]), h = y(() => z(p)[1]), _ = y(() => ({
		...z(m),
		id: z(m).id ?? n,
		open: i(),
		value: a(),
		inputValue: o(),
		onOpenChange(e) {
			z(m).onOpenChange?.(e), i() !== void 0 && i(e.open);
		},
		onValueChange(e) {
			z(m).onValueChange?.(e), a() !== void 0 && a(e.value);
		},
		onInputValueChange(e) {
			z(m).onInputValueChange?.(e), o() !== void 0 && o(e.inputValue);
		}
	})), v = qu(() => z(_)), b = ao(() => ({
		present: v().open,
		...z(u)
	})), ee = y(() => X(v().getRootProps(), z(h)));
	return Xa(v), so(b), Q(e, J({ as: "div" }, () => z(ee), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), x({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), A();
		},
		get open() {
			return i();
		},
		set open(e) {
			i(e), A();
		},
		get value() {
			return a();
		},
		set value(e) {
			a(e), A();
		},
		get inputValue() {
			return o();
		},
		set inputValue(e) {
			o(e), A();
		}
	});
}
H(Yu, {
	ref: {},
	open: {},
	value: {},
	inputValue: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/ComboboxStyles.svelte
var Xu = {
	hash: "svelte-n2y5i3",
	code: "[data-scope='combobox'] [part='chip'] .af-avatar {width:16px;height:16px;margin-left:-4px;font-size:8px;line-height:1;}[data-scope='combobox'] [part='chip'] button {display:inline-grid;flex:none;place-items:center;width:16px;height:16px;margin-right:-4px;padding:0;border:0;border-radius:calc(infinity * 1px);background:transparent;color:inherit;outline:none;cursor:pointer;}\n  @media (hover: hover) {[data-scope='combobox'] [part='chip'] button:hover:not(:disabled) {background-color:color-mix(in oklab, currentColor 10%, transparent);} }[data-scope='combobox'] [part='chip'] button:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[data-scope='combobox'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='combobox'][hidden] {display:none !important;}[data-scope='combobox'][data-part='control'] {display:flex;flex-wrap:wrap;align-items:center;gap:4px;box-sizing:border-box;width:100%;min-width:14em;min-height:36px;padding:4px 12px;border:1px solid var(--k-input);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark, 0) * 100%), transparent);box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);font-size:16px;line-height:24px;transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);}\n  @media (min-width: 48rem) {[data-scope='combobox'][data-part='control'] {font-size:14px;line-height:20px;} }[data-scope='combobox'][data-part='control']:has(input:focus-visible) {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring), 0 1px 2px 0 rgb(0 0 0 / 0.05);}[data-scope='combobox'][data-part='control'][data-disabled] {opacity:0.5;cursor:not-allowed;}[data-scope='combobox'][data-part='input'] {flex:1;min-width:6em;padding:0;border:0;outline:none;background:transparent;color:inherit;font:inherit;}[data-scope='combobox'][data-part='input']::placeholder {color:var(--k-muted);opacity:1;}[data-scope='combobox'][data-part='content'] {display:flex;flex-direction:column;width:var(--reference-width, auto);max-height:300px;padding:4px;}[data-scope='combobox'][data-part='item'] {position:relative;box-sizing:border-box;display:flex;align-items:center;gap:8px;padding:6px 8px;border:0 solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 4px));outline:none;font-size:14px;line-height:20px;cursor:default;-webkit-user-select:none;user-select:none;}[data-scope='combobox'][data-part='item'][data-highlighted] {background-color:var(--k-accent);color:var(--k-accent-fg);}[data-scope='combobox'][data-part='item'][data-state='checked'] {font-weight:600;}[data-scope='combobox'][data-part='item'] .lines {display:flex;flex-direction:column;min-width:0;}[data-scope='combobox'][data-part='item'] .detail {color:var(--k-muted);font-size:12px;line-height:16px;}[data-scope='combobox'][data-part='empty'] {padding:24px 0;font-size:14px;line-height:20px;text-align:center;}[data-scope='combobox'] [part='loading'] {padding:6px 12px;color:var(--k-muted);font-size:14px;line-height:20px;}[data-scope='combobox'] [part='load-more'] {display:flex;box-sizing:border-box;gap:8px;width:100%;margin:0;padding:6px 12px;border:0 solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 4px));background:transparent;color:inherit;font:inherit;font-size:14px;line-height:20px;text-align:start;outline:none;cursor:pointer;}[data-scope='combobox'].people [part='loading'], [data-scope='combobox'].people [part='load-more'] {padding-left:8px;padding-right:8px;}\n  @media (hover: hover) {[data-scope='combobox'] [part='load-more']:hover {background-color:var(--k-accent);color:var(--k-accent-fg);} }[data-scope='combobox'] [part='load-more']:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}\n  @media (prefers-reduced-motion: reduce) {[data-scope='combobox'][data-part='control'] {transition:none;} }\n  @media (forced-colors: active) {[data-scope='combobox'][data-part='control']:has(input:focus-visible), [data-scope='combobox'] [part='chip'] button:focus-visible,\n    [data-scope='combobox'] [part='load-more']:focus-visible {outline:2px solid;outline-offset:2px;}[data-scope='combobox'][data-part='item'][data-highlighted] {forced-color-adjust:none;background-color:Highlight;color:HighlightText;}\n  }"
};
function Zu(e) {
	ee(e, Xu);
}
H(Zu, {}, [], [], { mode: "open" });
//#endregion
//#region src/kit/Direction.svelte
function Qu(e, t) {
	k(t, !0);
	let n = L(t, "dir", 7), r = L(t, "children", 7);
	var i = {
		get dir() {
			return n();
		},
		set dir(e) {
			n(e), A();
		},
		get children() {
			return r();
		},
		set children(e) {
			r(e), A();
		}
	};
	{
		let t = y(() => n() === "rtl" ? "ar" : "en-US");
		Jc(e, {
			get locale() {
				return z(t);
			},
			children: (e, t) => {
				var n = P(), i = G(n);
				Se(i, r), F(e, n);
			},
			$$slots: { default: !0 }
		});
	}
	return x(i);
}
H(Qu, {
	dir: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/reactivity/set.js
var $u = [
	"forEach",
	"isDisjointFrom",
	"isSubsetOf",
	"isSupersetOf"
], ed = [
	"difference",
	"intersection",
	"symmetricDifference",
	"union"
], td = !1, nd = class e extends Set {
	#e = /* @__PURE__ */ new Map();
	#t = /* @__PURE__ */ B(0);
	#n = /* @__PURE__ */ B(0);
	#r = pe || -1;
	constructor(e) {
		if (super(), e) {
			for (var t of e) super.add(t);
			this.#n.v = super.size;
		}
		td || this.#a();
	}
	#i(e) {
		return pe === this.#r ? /* @__PURE__ */ B(e) : Ae(e);
	}
	#a() {
		td = !0;
		var t = e.prototype, n = Set.prototype;
		for (let e of $u) t[e] = function(...t) {
			return z(this.#t), n[e].apply(this, t);
		};
		for (let r of ed) t[r] = function(...t) {
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
		return super.has(e) || (super.add(e), q(this.#n, super.size), R(this.#t)), this;
	}
	delete(e) {
		var t = super.delete(e), n = this.#e, r = n.get(e);
		return r !== void 0 && (n.delete(e), q(r, !1)), t && (q(this.#n, super.size), R(this.#t)), t;
	}
	clear() {
		if (super.size !== 0) {
			super.clear();
			var e = this.#e;
			for (var t of e.values()) q(t, !1);
			e.clear(), q(this.#n, 0), R(this.#t);
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
}, rd = class extends Map {
	#e = /* @__PURE__ */ new Map();
	#t = /* @__PURE__ */ B(0);
	#n = /* @__PURE__ */ B(0);
	#r = pe || -1;
	constructor(e) {
		if (super(), e) {
			for (var [t, n] of e) super.set(t, n);
			this.#n.v = super.size;
		}
	}
	#i(e) {
		return pe === this.#r ? /* @__PURE__ */ B(e) : Ae(e);
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
		if (r === void 0) r = this.#i(0), n.set(e, r), q(this.#n, super.size), R(o);
		else if (i !== t) {
			R(r);
			var s = o.reactions === null ? null : new Set(o.reactions);
			(s === null || !r.reactions?.every((e) => s.has(e))) && R(o);
		}
		return a;
	}
	delete(e) {
		var t = this.#e, n = t.get(e), r = super.delete(e);
		return n !== void 0 && (t.delete(e), q(n, -1)), r && (q(this.#n, super.size), R(this.#t)), r;
	}
	clear() {
		if (super.size !== 0) {
			super.clear();
			var e = this.#e;
			q(this.#n, 0);
			for (var t of e.values()) q(t, -1);
			R(this.#t), e.clear();
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
}, id = 250;
function ad(e) {
	try {
		return Promise.resolve(e());
	} catch (e) {
		return Promise.reject(e);
	}
}
function od(e) {
	let t = B(null), n = B([]), r = B(null), i = "", a = B(!1), o = B(!1), s = B(!1), c = new rd(), l = new nd(), u = /* @__PURE__ */ new Set(), d = null, f = /* @__PURE__ */ new Set(), p;
	function m() {
		clearTimeout(p), q(o, !1), d?.abort(), d = null, q(a, !1);
	}
	function h(l, u) {
		let f = z(t);
		if (!f) return;
		l === null && (clearTimeout(p), q(o, !1)), d?.abort();
		let m = new AbortController();
		d = m, q(a, !0), ad(() => f({
			q: u,
			cursor: l,
			signal: m.signal
		})).then((t) => {
			if (m.signal.aborted) return;
			let a = t?.items ?? [];
			for (let t of a) c.set(e(t), t);
			let o = new Set(l === null ? [] : z(n).map(e)), s = a.filter((t) => !o.has(e(t)) && !!o.add(e(t)));
			q(n, l === null ? s : [...z(n), ...s]), i = u, q(r, t?.next ?? null, !0);
		}, () => {}).finally(() => {
			d === m && (d = null, q(a, !1), l === null && q(s, !0));
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
			z(t) && (clearTimeout(p), q(o, !0), p = setTimeout(() => h(null, e), id));
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
			f.add(a), ad(() => r.resolve(i, a.signal)).then((t) => {
				if (!a.signal.aborted) for (let n of t ?? []) c.set(e(n), n);
			}, () => {}).finally(() => {
				if (f.delete(a), !a.signal.aborted) for (let e of i) c.has(e) || l.add(e);
			});
		},
		stop: m,
		reset(e) {
			e !== z(t) && (q(t, e), m(), g(), u = /* @__PURE__ */ new Set(), l.clear(), q(n, []), q(r, null), i = "", q(s, !1));
		},
		destroy() {
			m(), g();
		}
	};
}
function sd(e, t, n, r) {
	let i;
	Oe(() => {
		let n = t() ?? null;
		Te(() => {
			n !== i && (i = n, e.reset(n), n && r());
		});
	}), Oe(() => {
		let r = t(), i = n();
		r?.resolve && Te(() => e.resolve(i));
	}), Oe(() => () => e.destroy());
}
//#endregion
//#region src/kit/Combobox.svelte
var cd = (e, t = S, n = S) => {
	var r = P(), i = G(r);
	E(i, () => Ic, (e, r) => {
		r(e, J({
			get item() {
				return t();
			},
			part: "option"
		}, n, {
			children: (e, n) => {
				var r = dd(), i = V(r), a = ye(i, !0), o = U(i, 2), s = (e) => {
					var n = ud(), r = ye(n, !0);
					W(() => T(r, t().description)), F(e, n);
				};
				M(o, (e) => {
					t().description && e(s);
				}), O(r), W(() => T(a, t().label)), F(e, r);
			},
			$$slots: { default: !0 }
		}));
	}), F(e, r);
};
function ld(e) {
	let t = /* @__PURE__ */ new Set();
	return e.filter((e) => !t.has(e.value) && !!t.add(e.value));
}
var ud = I("<span class=\"detail\"> </span>"), dd = I("<span class=\"lines\"><span> </span> <!></span>"), fd = I("<span id=\"af-described\" hidden=\"\"> </span>"), pd = I("<span class=\"af-chip secondary\" part=\"chip\"><span> </span> <button type=\"button\" part=\"remove\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button></span>"), md = I("<button type=\"button\" part=\"clear\" class=\"af-button ghost icon xs\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button>"), hd = I("<!> <!> <!>", 1), gd = I("<af-tooltip><!></af-tooltip>", 2), _d = I("<div part=\"loading\"> </div>"), vd = I("<button type=\"button\" part=\"load-more\"> </button>"), yd = I("<!> <!>", 1), bd = I("<div class=\"af-kit\"><!> <!></div>"), xd = {
	hash: "svelte-52f5fd",
	code: ":host {display:inline-block;max-width:100%;vertical-align:middle;}af-tooltip.svelte-52f5fd {display:block;}[data-scope='combobox'][data-part='item'][part='option'] {padding:6px 12px;}[data-scope='combobox'][data-part='item'][part='option'][data-disabled] {opacity:0.5;}"
};
function Sd(e, t) {
	k(t, !0), ee(e, xd);
	let i = L(t, "options", 23, () => []), o = L(t, "source", 7, null), s = L(t, "value", 7, null), c = L(t, "multiple", 7, !1), l = L(t, "placeholder", 7, null), f = L(t, "label", 7, null), m = L(t, "loading", 7, !1), g = L(t, "disabled", 7, !1), v = L(t, "locale", 7, null), S = L(t, "strings", 7, null), te = L(t, "name", 7, null), C = L(t, "required", 7, !1), w = L(t, "readonly", 7, !1), ne = L(t, "description", 7, null), D = L(t, "error", 7, null), ae = L(t, "invalid", 7, !1), oe = t.$$host, se = r(oe), ce = y(() => u(v(), S() ?? void 0)), le = y(() => ld(i() ?? [])), ue = y(() => new Map(z(le).map((e) => [e.value, e]))), N = y(() => [...new Set(Array.isArray(s()) ? s() : s() ? [s()] : [])]), de = B(null), I = B(!1), R = od((e) => e.value);
	sd(R, () => o(), () => z(N), () => {
		z(I) && R.now(z(de) ?? "");
	});
	let fe = (e) => o() ? R.named.get(e) : z(ue).get(e), pe = y(() => z(N).filter((e) => !fe(e)));
	function me(e) {
		let t = fe(e);
		return t ? t.label : m() || o() && R.pending(e) ? "…" : (o() ? R.answered(e) : z(le).length > 0) ? z(pe).length > 1 ? `${z(ce).unknownOption} ${z(pe).indexOf(e) + 1}` : z(ce).unknownOption : "";
	}
	let H = y(() => z(de) ?? (c() || !z(N)[0] ? "" : me(z(N)[0]))), ge = y(() => o() ? R.items : z(le).filter((e) => mr(e.label, z(de) ?? "") || mr(e.description, z(de) ?? ""))), _e = y(() => Ai({
		items: z(ge),
		itemToValue: (e) => e.value,
		itemToString: (e) => e.label,
		isItemDisabled: (e) => !!e.disabled
	})), ve = y(() => !!m() || R.busy), xe = B(null);
	Oe(() => a(z(xe), z(I), oe));
	let Se = (e) => d(oe, "change", { value: c() ? e : e[0] ?? null }), Ce = B(!1), we = y(() => !!g() || z(Ce)), Te = y(() => z(we) || !!w()), Ee = y(() => [ne(), D()].filter(Boolean).join(" ")), De = B(null), K = -Infinity, ke = -Infinity;
	Oe(() => {
		let e = !!C() && z(N).length === 0;
		jr(oe, {
			name: te(),
			value: c() ? z(N) : z(N)[0] ?? null,
			validity: e ? { valueMissing: !0 } : {},
			message: e ? p(z(ce), "valueMissing") : "",
			anchor: z(De)
		});
	}), Mr(oe, {
		reset() {
			let e = oe.getAttribute("value"), t = e ? [e] : [];
			(t.length !== z(N).length || t.some((e, t) => e !== z(N)[t])) && Se(t);
		},
		disabled(e) {
			q(Ce, e, !0);
		}
	});
	function J(e) {
		let t = e.target;
		t === z(De) || t.closest("button") || (e.preventDefault(), z(De)?.focus());
	}
	let Ae = (e) => e ? { "aria-description": e } : {};
	var je = {
		get options() {
			return i();
		},
		set options(e = []) {
			i(e), A();
		},
		get source() {
			return o();
		},
		set source(e = null) {
			o(e), A();
		},
		get value() {
			return s();
		},
		set value(e = null) {
			s(e), A();
		},
		get multiple() {
			return c();
		},
		set multiple(e = !1) {
			c(e), A();
		},
		get placeholder() {
			return l();
		},
		set placeholder(e = null) {
			l(e), A();
		},
		get label() {
			return f();
		},
		set label(e = null) {
			f(e), A();
		},
		get loading() {
			return m();
		},
		set loading(e = !1) {
			m(e), A();
		},
		get disabled() {
			return g();
		},
		set disabled(e = !1) {
			g(e), A();
		},
		get locale() {
			return v();
		},
		set locale(e = null) {
			v(e), A();
		},
		get strings() {
			return S();
		},
		set strings(e = null) {
			S(e), A();
		},
		get name() {
			return te();
		},
		set name(e = null) {
			te(e), A();
		},
		get required() {
			return C();
		},
		set required(e = !1) {
			C(e), A();
		},
		get readonly() {
			return w();
		},
		set readonly(e = !1) {
			w(e), A();
		},
		get description() {
			return ne();
		},
		set description(e = null) {
			ne(e), A();
		},
		get error() {
			return D();
		},
		set error(e = null) {
			D(e), A();
		},
		get invalid() {
			return ae();
		},
		set invalid(e = !1) {
			ae(e), A();
		}
	}, Me = hd(), Ne = G(Me);
	n(Ne, {});
	var Pe = U(Ne, 2);
	Zu(Pe, {});
	var Fe = U(Pe, 2);
	return Ft(Fe, {
		value: () => oe.shadowRoot,
		children: (e, t) => {
			Qu(e, {
				get dir() {
					return se;
				},
				children: (e, t) => {
					var n = bd(), r = V(n), i = (e) => {
						var t = fd(), n = ye(t, !0);
						W(() => T(n, z(Ee))), F(e, t);
					};
					M(r, (e) => {
						z(Ee) && e(i);
					});
					var a = U(r, 2), s = () => z(N), u = () => z(H);
					{
						let e = y(() => !!c()), t = y(() => !!w()), n = y(() => !!ae()), r = y(() => o() ? "none" : "autohighlight");
						E(a, () => Yu, (i, a) => {
							a(i, {
								get collection() {
									return z(_e);
								},
								get multiple() {
									return z(e);
								},
								get disabled() {
									return z(we);
								},
								get readOnly() {
									return z(t);
								},
								get invalid() {
									return z(n);
								},
								get inputBehavior() {
									return z(r);
								},
								selectionBehavior: "preserve",
								positioning: {
									strategy: "fixed",
									placement: "bottom-start"
								},
								onInteractOutside: (e) => {
									let t = e.detail.originalEvent.timeStamp;
									z(De) && h() === z(De) && K >= t && ke >= K && e.preventDefault();
								},
								get scrollToIndexFn() {
									return un;
								},
								get value() {
									return s();
								},
								set value(e) {},
								get inputValue() {
									return u();
								},
								set inputValue(e) {},
								onValueChange: (e) => {
									z(de) !== null && o() && z(I) && R.search(""), q(de, null), Se(e.value);
								},
								onInputValueChange: (e) => {
									e.reason === "input-change" && (q(de, e.inputValue, !0), d(oe, "search", { query: e.inputValue }), o() && R.search(e.inputValue));
								},
								onOpenChange: (e) => {
									e.open ? o() && e.reason !== "input-change" && R.now(z(de) ?? "") : (q(de, null), R.stop());
								},
								get open() {
									return z(I);
								},
								set open(e) {
									q(I, e, !0);
								},
								children: (e, t) => {
									var n = yd(), r = G(n);
									E(r, () => Oc, (e, t) => {
										t(e, {
											part: "control",
											onmousedown: J,
											children: (e, t) => {
												var n = hd(), r = G(n), i = (e) => {
													var t = P(), n = G(t);
													_(n, 16, () => z(N), (e) => e, (e, t) => {
														let n = y(() => me(t));
														var r = pd(), i = V(r), a = ye(i, !0), o = U(i, 2);
														O(r), W(() => {
															T(a, z(n)), j(o, "aria-label", `${z(ce).remove ?? ""}: ${z(n) ?? ""}`), o.disabled = z(Te);
														}), be("click", o, () => Se(z(N).filter((e) => e !== t))), F(e, r);
													}), F(e, t);
												};
												M(r, (e) => {
													c() && e(i);
												});
												var a = U(r, 2);
												{
													let e = y(() => l() ?? ""), t = y(() => f() || void 0), n = y(() => z(Ee) ? "af-described" : void 0), r = y(() => C() ? "true" : void 0);
													E(a, () => Ac, (i, a) => {
														a(i, {
															onfocusout: (e) => K = e.timeStamp,
															onfocusin: (e) => ke = e.timeStamp,
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
																return z(De);
															},
															set ref(e) {
																q(De, e, !0);
															}
														});
													});
												}
												var o = U(a, 2), s = (e) => {
													var t = md();
													W(() => j(t, "aria-label", z(ce).clear)), be("click", t, () => Se([])), F(e, t);
												};
												M(o, (e) => {
													!c() && z(N)[0] && !z(Te) && e(s);
												}), F(e, n);
											},
											$$slots: { default: !0 }
										});
									});
									var i = U(r, 2);
									E(i, () => Rc, (e, t) => {
										t(e, {
											popover: "manual",
											get ref() {
												return z(xe);
											},
											set ref(e) {
												q(xe, e, !0);
											},
											children: (e, t) => {
												var n = P(), r = G(n);
												E(r, () => uo, (e, t) => {
													t(e, {
														class: "af-overlay",
														part: "content",
														children: (e, t) => {
															En(e, {
																tabStop: !1,
																children: (e, t) => {
																	var n = yd(), r = G(n);
																	_(r, 17, () => z(_e).items, (e) => e.value, (e, t) => {
																		var n = P(), r = G(n), i = (e) => {
																			var n = gd();
																			W(() => b(n, "text", z(t).reason ?? "")), re(n, 1, "svelte-52f5fd");
																			var r = V(n);
																			{
																				let e = y(() => Ae(z(t).reason));
																				cd(r, () => z(t), () => z(e));
																			}
																			O(n), F(e, n);
																		}, a = (e) => {
																			cd(e, () => z(t), () => ({}));
																		};
																		M(r, (e) => {
																			z(t).disabled ? e(i) : e(a, -1);
																		}), F(e, n);
																	});
																	var i = U(r, 2), a = (e) => {
																		var t = _d(), n = ye(t, !0);
																		W(() => T(n, z(ce).loading)), F(e, t);
																	}, s = (e) => {
																		var t = yd(), n = G(t), r = (e) => {
																			var t = vd(), n = ye(t, !0);
																			W(() => T(n, z(ce).loadMore)), be("pointerdown", t, (e) => e.preventDefault()), be("click", t, () => R.more()), F(e, t);
																		};
																		M(n, (e) => {
																			o() && R.next && e(r);
																		});
																		var i = U(n, 2);
																		E(i, () => Ec, (e, t) => {
																			t(e, {
																				part: "empty",
																				children: (e, t) => {
																					ie();
																					var n = he();
																					W(() => T(n, z(ce).noResults)), F(e, n);
																				},
																				$$slots: { default: !0 }
																			});
																		}), F(e, t);
																	};
																	M(i, (e) => {
																		z(ve) ? e(a) : e(s, -1);
																	}), F(e, n);
																},
																$$slots: { default: !0 }
															});
														},
														$$slots: { default: !0 }
													});
												}), F(e, n);
											},
											$$slots: { default: !0 }
										});
									}), F(e, n);
								},
								$$slots: { default: !0 }
							});
						});
					}
					O(n), F(e, n);
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { default: !0 }
	}), F(e, Me), x(je);
}
De(["click", "pointerdown"]), H(Sd, {
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
}, Ar);
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/dialog/use-dialog-context.js
var [Cd, wd] = an({ name: "DialogContext" }), Td = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Ed(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, Td), i = wd(), a = co(), o = y(() => X(i().getContentProps(), a().getPresenceProps(), r));
	function s(e) {
		a().setNode(e);
	}
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	}, l = P(), u = G(l), d = (e) => {
		Q(e, J({ as: "div" }, () => z(o), {
			[de()]: s,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = y(() => !a().unmounted);
	return M(u, (e) => {
		z(f) && e(d);
	}), F(e, l), x(c);
}
H(Ed, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/dialog/dialog-description.svelte
var Dd = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Od(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, Dd), i = wd(), a = y(() => X(i().getDescriptionProps(), r));
	return Q(e, J({ as: "p" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(Od, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/dialog/dialog-positioner.svelte
var kd = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Ad(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, kd), i = wd(), a = co(), o = y(() => X(i().getPositionerProps(), r));
	var s = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	}, c = P(), l = G(c), u = (e) => {
		Q(e, J({ as: "div" }, () => z(o), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, d = y(() => !a().unmounted);
	return M(l, (e) => {
		z(d) && e(u);
	}), F(e, c), x(s);
}
H(Ad, { ref: {} }, [], [], { mode: "open" });
var jd = Cn("dialog").parts("trigger", "backdrop", "positioner", "content", "title", "description", "closeTrigger").build(), Md = (e) => e.ids?.positioner ?? `dialog:${e.id}:positioner`, Nd = (e) => e.ids?.backdrop ?? `dialog:${e.id}:backdrop`, Pd = (e) => e.ids?.content ?? `dialog:${e.id}:content`, Fd = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `dialog:${e.id}:trigger:${t}` : `dialog:${e.id}:trigger` : yn(n) ? n(t) : n;
}, Id = (e) => e.ids?.title ?? `dialog:${e.id}:title`, Ld = (e) => e.ids?.description ?? `dialog:${e.id}:description`, Rd = (e) => e.ids?.closeTrigger ?? `dialog:${e.id}:close`, zd = (e) => e.getById(Pd(e)), Bd = (e) => e.getById(Md(e)), Vd = (e) => e.getById(Nd(e)), Hd = (e) => e.getById(Fd(e)), Ud = (e) => e.getById(Id(e)), Wd = (e) => e.getById(Ld(e)), Gd = (e) => e.getById(Rd(e)), Kd = (e) => ze(e.getRootNode(), `[data-scope="dialog"][data-part="trigger"]${Pt(e.id)}`), qd = (e, t) => t == null ? Hd(e) ?? Kd(e)[0] : e.getById(Fd(e, t));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dialog@1.43.3/node_modules/@zag-js/dialog/dist/dialog.connect.mjs
function Jd(e, t) {
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
				...jd.trigger.attrs,
				dir: a("dir"),
				id: Fd(o, n),
				"data-ownedby": o.id,
				"data-value": n,
				"aria-haspopup": "dialog",
				type: "button",
				"aria-expanded": n == null ? c : c && i,
				"data-state": c ? "open" : "closed",
				"aria-controls": Pd(o),
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
				...jd.backdrop.attrs,
				dir: a("dir"),
				hidden: !c,
				id: Nd(o),
				"data-state": c ? "open" : "closed"
			});
		},
		getPositionerProps() {
			return t.element({
				...jd.positioner.attrs,
				dir: a("dir"),
				id: Md(o),
				style: We({ pointerEvents: !c || !a("modal") ? "none" : void 0 })
			});
		},
		getContentProps() {
			let e = i.get("rendered");
			return t.element({
				...jd.content.attrs,
				dir: a("dir"),
				role: a("role"),
				hidden: !c,
				id: Pd(o),
				tabIndex: -1,
				"data-state": c ? "open" : "closed",
				"aria-modal": a("modal"),
				"aria-label": s || void 0,
				"aria-labelledby": s || !e.title ? void 0 : Id(o),
				"aria-describedby": e.description ? Ld(o) : void 0,
				style: We({ pointerEvents: a("modal") ? void 0 : "auto" })
			});
		},
		getTitleProps() {
			return t.element({
				...jd.title.attrs,
				dir: a("dir"),
				id: Id(o)
			});
		},
		getDescriptionProps() {
			return t.element({
				...jd.description.attrs,
				dir: a("dir"),
				id: Ld(o)
			});
		},
		getCloseTriggerProps() {
			return t.button({
				...jd.closeTrigger.attrs,
				dir: a("dir"),
				id: Rd(o),
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
var Yd = /* @__PURE__ */ new WeakMap(), Xd = /* @__PURE__ */ new WeakMap(), Zd = {}, Qd = 0, $d = (e) => e && (e.host || $d(e.parentNode)), ef = (e, t) => t.map((t) => {
	if (e.contains(t)) return t;
	let n = $d(t);
	return n && e.contains(n) ? n : (console.error("[zag-js > ariaHidden] target", t, "in not contained inside", e, ". Doing nothing"), null);
}).filter((e) => !!e), tf = /* @__PURE__ */ new Set([
	"script",
	"output",
	"status",
	"next-route-announcer"
]), nf = (e) => tf.has(e.localName) || e.role === "status" || e.hasAttribute("aria-live") ? !0 : e.matches("[data-live-announcer]"), rf = (e, t) => {
	let { parentNode: n, markerName: r, controlAttribute: i, explicitBooleanValue: a, followControlledElements: o = !0 } = t, s = ef(n, Array.isArray(e) ? e : [e]);
	Zd[r] || (Zd[r] = /* @__PURE__ */ new WeakMap());
	let c = Zd[r], l = [], u = /* @__PURE__ */ new Set(), d = new Set(s), f = (e) => {
		e && !u.has(e) && (u.add(e), f(e.parentNode));
	};
	s.forEach((e) => {
		f(e), o && sn(e) && Ri(e, (e) => {
			f(e);
		});
	});
	let p = (e) => {
		e && !d.has(e) && Array.prototype.forEach.call(e.children, (e) => {
			if (u.has(e)) p(e);
			else try {
				if (nf(e)) return;
				let t = e.getAttribute(i), n = a ? t === "true" : t !== null && t !== "false", o = (Yd.get(e) || 0) + 1, s = (c.get(e) || 0) + 1;
				Yd.set(e, o), c.set(e, s), l.push(e), o === 1 && n && Xd.set(e, !0), s === 1 && e.setAttribute(r, ""), n || e.setAttribute(i, a ? "true" : "");
			} catch (t) {
				console.error("[zag-js > ariaHidden] cannot operate on ", e, t);
			}
		});
	};
	return p(n), u.clear(), Qd++, () => {
		l.forEach((e) => {
			let t = Yd.get(e) - 1, n = c.get(e) - 1;
			Yd.set(e, t), c.set(e, n), t || (Xd.has(e) || e.removeAttribute(i), Xd.delete(e)), n || e.removeAttribute(r);
		}), Qd--, Qd || (Yd = /* @__PURE__ */ new WeakMap(), Yd = /* @__PURE__ */ new WeakMap(), Xd = /* @__PURE__ */ new WeakMap(), Zd = {});
	};
}, af = (e) => (Array.isArray(e) ? e[0] : e).ownerDocument.body, of = (e, t = af(e), n = "data-aria-hidden", r = !0) => {
	if (t) return rf(e, {
		parentNode: t,
		markerName: n,
		controlAttribute: "aria-hidden",
		explicitBooleanValue: !0,
		followControlledElements: r
	});
}, sf = (e) => {
	let t = requestAnimationFrame(() => e());
	return () => cancelAnimationFrame(t);
};
function cf(e, t = {}) {
	let { defer: n = !0 } = t, r = n ? sf : (e) => e(), i = [];
	return i.push(r(() => {
		let t = (typeof e == "function" ? e() : e).filter(Boolean);
		t.length !== 0 && i.push(of(t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+focus-trap@1.43.3/node_modules/@zag-js/focus-trap/dist/chunk-QZ7TP4HQ.mjs
var lf = Object.defineProperty, uf = (e, t, n) => t in e ? lf(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, df = (e, t, n) => uf(e, typeof t == "symbol" ? t : t + "", n), ff = {
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
}, pf = [], mf = class {
	constructor(e, t) {
		df(this, "trapStack"), df(this, "config"), df(this, "doc"), df(this, "state", {
			containers: [],
			containerGroups: [],
			tabbableGroups: [],
			nodeFocusedBeforeActivation: null,
			mostRecentlyFocusedNode: null,
			active: !1,
			paused: !1,
			delayInitialFocusTimer: void 0,
			recentNavEvent: void 0
		}), df(this, "lastInteractionType", "keyboard"), df(this, "portalContainers", /* @__PURE__ */ new Set()), df(this, "listenerCleanups", []), df(this, "handleFocus", (e) => {
			let t = Ge(e), n = this.findContainerIndex(t, e) >= 0;
			if (n || hn(t)) n && (this.state.mostRecentlyFocusedNode = t);
			else {
				e.stopImmediatePropagation();
				let t, n = !0;
				if (this.state.mostRecentlyFocusedNode) {
					if (ga(this.state.mostRecentlyFocusedNode) > 0) {
						let e = this.findContainerIndex(this.state.mostRecentlyFocusedNode), { tabbableNodes: r } = this.state.containerGroups[e];
						if (r.length > 0) {
							let e = r.findIndex((e) => e === this.state.mostRecentlyFocusedNode);
							e >= 0 && (this.config.isKeyForward(this.state.recentNavEvent) ? e + 1 < r.length && (t = r[e + 1], n = !1) : e - 1 >= 0 && (t = r[e - 1], n = !1));
						}
					} else this.state.containerGroups.some((e) => e.tabbableNodes.some((e) => ga(e) > 0)) || (n = !1);
				} else n = !1;
				n && (t = this.findNextNavNode({
					target: this.state.mostRecentlyFocusedNode,
					isBackward: this.config.isKeyBackward(this.state.recentNavEvent)
				})), t ? this.tryFocus(t) : this.tryFocus(this.state.mostRecentlyFocusedNode || this.getInitialFocusNode());
			}
			this.state.recentNavEvent = void 0;
		}), df(this, "handlePointerDown", (e) => {
			this.lastInteractionType = "pointer";
			let t = Ge(e);
			if (!(this.findContainerIndex(t, e) >= 0)) {
				if (yf(this.config.clickOutsideDeactivates, e)) {
					this.deactivate({ returnFocus: this.config.returnFocusOnDeactivate });
					return;
				}
				yf(this.config.allowOutsideClick, e) || e.preventDefault();
			}
		}), df(this, "handleClick", (e) => {
			let t = Ge(e);
			this.findContainerIndex(t, e) >= 0 || yf(this.config.clickOutsideDeactivates, e) || yf(this.config.allowOutsideClick, e) || (e.preventDefault(), e.stopImmediatePropagation());
		}), df(this, "handleTabKey", (e) => {
			if (this.lastInteractionType = "keyboard", this.config.isKeyForward(e) || this.config.isKeyBackward(e)) {
				this.state.recentNavEvent = e;
				let t = this.config.isKeyBackward(e), n = this.findNextNavNode({
					event: e,
					isBackward: t
				});
				if (!n) return;
				gf(e) && e.preventDefault(), this.tryFocus(n);
			}
		}), df(this, "handleEscapeKey", (e) => {
			bf(e) && yf(this.config.escapeDeactivates, e) !== !1 && (e.preventDefault(), this.deactivate());
		}), df(this, "_mutationObserver"), df(this, "setupMutationObserver", () => {
			let e = this.doc.defaultView || window;
			this._mutationObserver = new e.MutationObserver((e) => {
				e.some((e) => Array.from(e.removedNodes).some((e) => e === this.state.mostRecentlyFocusedNode)) && this.tryFocus(this.getInitialFocusNode()), e.some((e) => e.type === "attributes" && (e.attributeName === "aria-controls" || e.attributeName === "aria-expanded") || e.type === "childList" && e.addedNodes.length > 0 && Array.from(e.addedNodes).some((e) => {
					if (e.nodeType !== Node.ELEMENT_NODE) return !1;
					let t = e;
					return Hi(t) ? !0 : t.id && !this.state.containers.some((e) => e.contains(t)) ? Ui(t) : !1;
				})) && this.state.active && !this.state.paused && (this.updateTabbableNodes(), this.updatePortalContainers());
			});
		}), df(this, "updateObservedNodes", () => {
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
		}), df(this, "getInitialFocusNode", () => {
			let e = this.getNodeForOption("initialFocus", { hasFallback: !0 });
			if (e === !1) return !1;
			if (e === void 0 || e && !fa(e)) {
				let t = Pe(this.doc);
				if (t && this.findContainerIndex(t) >= 0) e = t;
				else {
					let t = this.state.tabbableGroups[0];
					e = t && t.firstTabbableNode || this.getNodeForOption("fallbackFocus");
				}
			} else e === null && (e = this.getNodeForOption("fallbackFocus"));
			if (!e || (e.isConnected || (e = this.getNodeForOption("fallbackFocus")), !e || !e.isConnected)) throw Error("Your focus-trap needs to have at least one focusable element");
			return e;
		}), df(this, "tryFocus", (e, t) => {
			if (e !== !1 && e !== Pe(this.doc)) {
				if (!e || !e.focus) {
					this.tryFocus(this.getInitialFocusNode());
					return;
				}
				e.focus({
					preventScroll: !!this.config.preventScroll,
					...t
				}), this.state.mostRecentlyFocusedNode = e, Sf(e) && e.select();
			}
		}), df(this, "deactivate", (e) => {
			if (!this.state.active) return this;
			let t = {
				onDeactivate: this.config.onDeactivate,
				onPostDeactivate: this.config.onPostDeactivate,
				checkCanReturnFocus: this.config.checkCanReturnFocus,
				...e
			};
			clearTimeout(this.state.delayInitialFocusTimer), this.state.delayInitialFocusTimer = void 0, this.removeListeners(), this.state.active = !1, this.state.paused = !1, this.updateObservedNodes(), ff.deactivateTrap(this.trapStack, this), this.portalContainers.clear();
			let n = this.getOption(t, "onDeactivate"), r = this.getOption(t, "onPostDeactivate"), i = this.getOption(t, "checkCanReturnFocus"), a = this.getOption(t, "returnFocus", "returnFocusOnDeactivate");
			n?.();
			let o = () => {
				xf(() => {
					if (a && this.isSafeToOverrideFocus()) {
						let e = this.getReturnFocusNode(this.state.nodeFocusedBeforeActivation), t = this.lastInteractionType === "keyboard" ? { focusVisible: !0 } : void 0;
						this.tryFocus(e, t);
					}
					r?.();
				});
			};
			return a && i ? (i(this.getReturnFocusNode(this.state.nodeFocusedBeforeActivation)).then(o, o), this) : (o(), this);
		}), df(this, "pause", (e) => {
			if (this.state.paused || !this.state.active) return this;
			let t = this.getOption(e, "onPause"), n = this.getOption(e, "onPostPause");
			return this.state.paused = !0, t?.(), this.removeListeners(), this.updateObservedNodes(), n?.(), this;
		}), df(this, "unpause", (e) => {
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
		}), df(this, "updateContainerElements", (e) => (this.state.containers = Array.isArray(e) ? e.filter(Boolean) : [e].filter(Boolean), this.state.active && this.updateTabbableNodes(), this.updateObservedNodes(), this)), df(this, "getReturnFocusNode", (e) => {
			let t = this.getNodeForOption("setReturnFocus", { params: [e] });
			return t || t !== !1 && e;
		}), df(this, "getOption", (e, t, n) => e && e[t] !== void 0 ? e[t] : this.config[n || t]), df(this, "getNodeForOption", (e, { hasFallback: t = !1, params: n = [] } = {}) => {
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
		}), df(this, "findNextNavNode", (e) => {
			let { event: t, isBackward: n = !1 } = e, r = e.target || Ge(t);
			this.updateTabbableNodes();
			let i = null;
			if (this.state.tabbableGroups.length > 0) {
				let e = this.findContainerIndex(r, t), a = e >= 0 ? this.state.containerGroups[e] : void 0;
				if (e < 0) i = n ? this.state.tabbableGroups[this.state.tabbableGroups.length - 1].lastTabbableNode : this.state.tabbableGroups[0].firstTabbableNode;
				else if (n) {
					let n = this.state.tabbableGroups.findIndex(({ firstTabbableNode: e }) => r === e);
					if (n < 0 && (a?.container === r || fa(r) && !ma(r) && !a?.nextTabbableNode(r, !1)) && (n = e), n >= 0) {
						let e = n === 0 ? this.state.tabbableGroups.length - 1 : n - 1, t = this.state.tabbableGroups[e];
						i = ga(r) >= 0 ? t.lastTabbableNode : t.lastDomTabbableNode;
					} else gf(t) || (i = a?.nextTabbableNode(r, !1));
				} else {
					let n = this.state.tabbableGroups.findIndex(({ lastTabbableNode: e }) => r === e);
					if (n < 0 && (a?.container === r || fa(r) && !ma(r) && !a?.nextTabbableNode(r)) && (n = e), n >= 0) {
						let e = n === this.state.tabbableGroups.length - 1 ? 0 : n + 1, t = this.state.tabbableGroups[e];
						i = ga(r) >= 0 ? t.firstTabbableNode : t.firstDomTabbableNode;
					} else gf(t) || (i = a?.nextTabbableNode(r));
				}
			} else i = this.getNodeForOption("fallbackFocus");
			return i;
		}), this.trapStack = t.trapStack || pf;
		let n = {
			returnFocusOnDeactivate: !0,
			escapeDeactivates: !0,
			delayInitialFocus: !0,
			followControlledElements: !0,
			isKeyForward: _f,
			isKeyBackward: vf,
			...t
		};
		this.doc = n.document || Kt(Array.isArray(e) ? e[0] : e), this.config = n, this.updateContainerElements(e), this.setupMutationObserver();
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
			zi(e).forEach((e) => {
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
		return this.config.followControlledElements ? Li(e, t) : !1;
	}
	isPersistentElement(e, t) {
		let n = this.config.persistentElements;
		if (!n || n.length === 0) return !1;
		let r = typeof t?.composedPath == "function" ? t.composedPath() : void 0;
		return n.some((t) => {
			let n = t();
			return pt(n, e) || n != null && r?.includes(n);
		});
	}
	updateTabbableNodes() {
		if (this.state.containerGroups = this.state.containers.map((e) => {
			let t = pa(e, { getShadowRoot: this.config.getShadowRoot }), n = da(e, { getShadowRoot: this.config.getShadowRoot }), r = t[0], i = t[t.length - 1], a = r, o = i, s = !1;
			for (let e = 0; e < t.length; e++) if (ga(t[e]) > 0) {
				s = !0;
				break;
			}
			function c(e, r = !0) {
				let i = t.indexOf(e);
				if (i >= 0) return t[i + (r ? 1 : -1)];
				let a = n.indexOf(e);
				if (!(a < 0)) {
					if (r) {
						for (let e = a + 1; e < n.length; e++) if (ma(n[e])) return n[e];
					} else for (let e = a - 1; e >= 0; e--) if (ma(n[e])) return n[e];
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
		if (this.state.active) return ff.activateTrap(this.trapStack, this), this.listenerCleanups.push(en(this.doc, "focusin", this.handleFocus, !0), en(this.doc, "mousedown", this.handlePointerDown, {
			capture: !0,
			passive: !1
		}), en(this.doc, "touchstart", this.handlePointerDown, {
			capture: !0,
			passive: !1
		}), en(this.doc, "click", this.handleClick, {
			capture: !0,
			passive: !1
		}), en(this.doc, "keydown", this.handleTabKey, {
			capture: !0,
			passive: !1
		}), en(this.doc, "keydown", this.handleEscapeKey)), this;
	}
	commitInitialFocus() {
		return this.state.delayInitialFocusTimer = this.config.delayInitialFocus ? xf(() => {
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
		return this.state.containers.some((t) => pt(t, e));
	}
	isSafeToOverrideFocus() {
		let e = Pe(this.doc);
		return !e || e === this.doc.body || this.containsElement(e) ? !0 : this.trapStack.some((t) => t !== this && t.containsElement(e));
	}
	activate(e) {
		if (this.state.active) return this;
		let t = this.getOption(e, "onActivate"), n = this.getOption(e, "onPostActivate"), r = this.getOption(e, "checkCanFocusTrap");
		r || this.updateTabbableNodes(), this.state.active = !0, this.state.paused = !1, this.state.nodeFocusedBeforeActivation = Pe(this.doc), t?.();
		let i = () => {
			r && this.updateTabbableNodes(), this.addListeners(), this.updateObservedNodes(), n?.();
		};
		return r ? (r(this.state.containers.concat()).then(i, i), this) : (i(), this);
	}
}, hf = (e) => e?.type === "keydown", gf = (e) => hf(e) && e?.key === "Tab", _f = (e) => hf(e) && e.key === "Tab" && !e?.shiftKey, vf = (e) => hf(e) && e.key === "Tab" && e?.shiftKey, yf = (e, ...t) => typeof e == "function" ? e(...t) : e, bf = (e) => !e.isComposing && e.key === "Escape", xf = (e) => setTimeout(e, 0), Sf = (e) => e.localName === "input" && "select" in e && typeof e.select == "function";
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+focus-trap@1.43.3/node_modules/@zag-js/focus-trap/dist/index.mjs
function Cf(e, t = {}) {
	let n, r = Y(() => {
		let r = (Array.isArray(e) ? e : [e]).map((e) => typeof e == "function" ? e() : e).filter((e) => e != null);
		if (r.length === 0) return;
		let i = r[0];
		n = new mf(r, {
			escapeDeactivates: !1,
			allowOutsideClick: !0,
			preventScroll: !0,
			returnFocusOnDeactivate: !0,
			delayInitialFocus: !1,
			fallbackFocus: i,
			...t,
			document: Kt(i)
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
var wf = "data-scroll-lock", Tf = /* @__PURE__ */ new WeakMap();
function Ef(e) {
	let t = e.getBoundingClientRect().left;
	return Math.round(t) + e.scrollLeft ? "paddingLeft" : "paddingRight";
}
function Df(e) {
	let t = jt(e)?.scrollbarGutter;
	return t === "stable" || t?.startsWith("stable ") === !0;
}
function Of(e) {
	let { documentElement: t, body: n } = e;
	return Oa(t) ? t : n;
}
function kf(e) {
	let t = e.defaultView ?? window, { documentElement: n, body: r } = e, i = Of(e), a = Df(n) || Df(r), o = t.innerWidth - n.clientWidth;
	r.setAttribute(wf, "");
	let s = () => Jt(n, "--scrollbar-width", `${o}px`), c = Ef(n), l = [s(), vn() ? (() => {
		let { scrollX: e, scrollY: n, visualViewport: i } = t, s = i?.offsetLeft ?? 0, l = i?.offsetTop ?? 0, u = {
			position: "fixed",
			overflow: "hidden",
			top: `${-(n - Math.floor(l))}px`,
			left: `${-(e - Math.floor(s))}px`,
			right: "0"
		};
		!a && o > 0 && (u[c] = `${o}px`);
		let d = Yt(r, u);
		return () => {
			d?.(), t.scrollTo({
				left: e,
				top: n,
				behavior: "instant"
			});
		};
	})() : (() => {
		let e = { overflow: "hidden" };
		return !a && o > 0 && (e[c] = `${o}px`), Yt(i, e);
	})()];
	return () => {
		l.forEach((e) => e?.()), r.removeAttribute(wf);
	};
}
function Af(e) {
	let t = e ?? document, n = Tf.get(t);
	n || (n = {
		count: 0,
		cleanup: kf(t)
	}, Tf.set(t, n)), n.count++;
	let r = n, i = !1;
	return () => {
		i || (i = !0, r.count--, r.count === 0 && (r.cleanup(), Tf.delete(t)));
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dialog@1.43.3/node_modules/@zag-js/dialog/dist/dialog.machine.mjs
var jf = zt({
	props({ props: e, scope: t }) {
		let n = e.role === "alertdialog", r = n ? () => Gd(t) : void 0, i = typeof e.modal != "boolean" || e.modal;
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
						triggerElement: qd(n, e)
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
				return dc(() => zd(e), {
					type: "dialog",
					defer: !0,
					pointerBlocking: n("modal"),
					layerStyleTargets: [() => Vd(e), () => Bd(e)],
					exclude: [Hd(e), ...Kd(e)].filter(Boolean),
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
				if (t("preventScroll")) return Af(e.getDoc());
			},
			trapFocus({ scope: e, prop: t, context: n }) {
				return t("trapFocus") ? Cf(() => zd(e), {
					preventScroll: !0,
					returnFocusOnDeactivate: !!t("restoreFocus"),
					initialFocus: () => _a({
						root: zd(e),
						getInitialEl: t("initialFocusEl")
					}),
					setReturnFocus: (r) => {
						let i = t("finalFocusEl")?.();
						if (i) return i;
						let a = n.get("triggerValue");
						if (a) {
							let t = qd(e, a);
							if (t) return t;
						}
						return Kd(e)[0] || r;
					},
					getShadowRoot: !0
				}) : void 0;
			},
			hideContentBelow({ scope: e, prop: t }) {
				return t("modal") ? cf(() => [zd(e)], { defer: !0 }) : void 0;
			}
		},
		actions: {
			setInitialFocus({ prop: e, scope: t }) {
				e("trapFocus") || Y(() => {
					_a({
						root: zd(t),
						getInitialEl: e("initialFocusEl")
					})?.focus({ preventScroll: !0 });
				});
			},
			checkRenderedElements({ context: e, scope: t }) {
				Y(() => {
					e.set("rendered", {
						title: !!Ud(t),
						description: !!Wd(t)
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
}), Mf = (e) => {
	let t = pn(), n = Zt(), r = y(() => {
		let r = Xe(e) || {};
		return {
			getRootNode: t().getRootNode,
			dir: n().dir,
			...r
		};
	}), i = Ut(jf, () => z(r)), a = y(() => Jd(i, gn));
	return () => z(a);
}, Nf = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open",
	"children"
]);
function Pf(e, t) {
	let n = g();
	k(t, !0);
	let r = L(t, "open", 15), i = L(t, "children", 7), a = K(t, Nf), o = y(() => oo(a)), s = y(() => w(z(o), 2)), c = y(() => z(s)[0]), l = y(() => z(s)[1]), u = y(() => to(z(c))), d = y(() => w(z(u), 1)), f = y(() => z(d)[0]), p = y(() => ({
		...z(l),
		id: z(l).id ?? n,
		open: r(),
		onOpenChange(e) {
			z(l).onOpenChange?.(e), r() !== void 0 && r(e.open);
		}
	})), m = Mf(() => z(p)), h = y(() => ({
		...z(c),
		present: m().open
	})), _ = ao(() => z(h));
	Cd(m), Qa(() => z(f)), so(_);
	var v = {
		get open() {
			return r();
		},
		set open(e) {
			r(e), A();
		},
		get children() {
			return i();
		},
		set children(e) {
			i(e), A();
		}
	}, b = P(), ee = G(b);
	return Se(ee, () => i() ?? S), F(e, b), x(v);
}
H(Pf, {
	open: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/dialog/dialog-title.svelte
var Ff = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function If(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, Ff), i = wd(), a = y(() => X(i().getTitleProps(), r));
	return Q(e, J({ as: "h2" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(If, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Confirm.svelte
var Lf = I("<p part=\"message\" class=\"svelte-1fchw0y\"> </p>"), Rf = I("<p part=\"impact\" class=\"svelte-1fchw0y\"> </p>"), zf = I("<div><!> <!></div>"), Bf = I("<!> <!> <footer part=\"actions\" class=\"svelte-1fchw0y\"><button type=\"button\" part=\"cancel\" class=\"af-button\"> </button> <button type=\"button\" part=\"confirm\"> </button></footer>", 1), Vf = I("<dialog><!></dialog>"), Hf = I("<!> <!>", 1), Uf = {
	hash: "svelte-1fchw0y",
	code: ":host {display:contents;}dialog.svelte-1fchw0y {border:0;padding:0;background:transparent;max-width:calc(100vw - 32px);overflow:visible;}dialog.svelte-1fchw0y::backdrop {background:rgb(0 0 0 / 0.5);}p.svelte-1fchw0y {margin:0;}footer.svelte-1fchw0y {display:flex;justify-content:flex-end;gap:8px;}[data-scope='dialog'][data-part='content'] {box-sizing:border-box;display:grid;gap:16px;width:calc(100vw - 32px);padding:24px;border-radius:var(--k-radius);background-color:var(--k-bg);color:var(--k-fg);box-shadow:0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);}[data-scope='dialog'][data-part='title'] {margin:0;font-size:18px;font-weight:600;line-height:28px;}.description.svelte-1fchw0y {display:grid;gap:8px;margin-top:-10px;font-size:14px;line-height:20px;}[part='message'].svelte-1fchw0y {color:var(--k-muted);}[part='impact'].svelte-1fchw0y {color:var(--k-fg);font-weight:500;}\n  @media (min-width: 40rem) {[data-scope='dialog'][data-part='content'] {max-width:512px;} }\n  @media not (min-width: 40rem) {footer.svelte-1fchw0y {flex-direction:column-reverse;} }"
};
function Wf(e, t) {
	k(t, !0), ee(e, Uf);
	let r = L(t, "open", 7, !1), i = L(t, "heading", 7, ""), a = L(t, "message", 7, ""), s = L(t, "confirmLabel", 7, null), c = L(t, "danger", 7, !1), l = L(t, "impact", 7, null), f = L(t, "busy", 7, !1), p = L(t, "locale", 7, null), m = L(t, "strings", 7, null), h = t.$$host, g = y(() => u(p(), m() ?? void 0)), _ = B(null), b = B(!1), te = !1, C = o(h);
	Oe(() => C(z(_), !!r())), Oe(() => {
		r() && q(b, !1);
	}), Oe(() => {
		let e = !!f();
		te && !e && q(b, !1), te = e;
	});
	function w() {
		z(b) || f() || (q(b, !0), d(h, "confirm", {}));
	}
	var ne = {
		get open() {
			return r();
		},
		set open(e = !1) {
			r(e), A();
		},
		get heading() {
			return i();
		},
		set heading(e = "") {
			i(e), A();
		},
		get message() {
			return a();
		},
		set message(e = "") {
			a(e), A();
		},
		get confirmLabel() {
			return s();
		},
		set confirmLabel(e = null) {
			s(e), A();
		},
		get danger() {
			return c();
		},
		set danger(e = !1) {
			c(e), A();
		},
		get impact() {
			return l();
		},
		set impact(e = null) {
			l(e), A();
		},
		get busy() {
			return f();
		},
		set busy(e = !1) {
			f(e), A();
		},
		get locale() {
			return p();
		},
		set locale(e = null) {
			p(e), A();
		},
		get strings() {
			return m();
		},
		set strings(e = null) {
			m(e), A();
		}
	}, ae = Hf(), oe = G(ae);
	n(oe, {});
	var se = U(oe, 2);
	return Ft(se, {
		value: () => h.shadowRoot,
		children: (e, t) => {
			var n = P(), o = G(n), u = () => !!r();
			E(o, () => Pf, (e, t) => {
				t(e, {
					get open() {
						return u();
					},
					set open(e) {},
					modal: !1,
					preventScroll: !0,
					closeOnInteractOutside: !1,
					role: "alertdialog",
					onEscapeKeyDown: (e) => {
						Xn(e) && e.defaultPrevented && d(h, "cancel", { reason: "escape" });
					},
					onOpenChange: (e) => {
						e.open || d(h, "cancel", { reason: "escape" });
					},
					children: (e, t) => {
						var n = P(), r = G(n);
						{
							let e = (e, t = S) => {
								var n = Vf(), r = (e) => e.preventDefault();
								v(n, (e) => ({
									...e,
									class: "af-kit",
									oncancel: r
								}), [() => t()()], void 0, void 0, "svelte-1fchw0y");
								var o = V(n);
								E(o, () => Ed, (e, t) => {
									t(e, {
										part: "content",
										class: "af-overlay dialog",
										"aria-modal": "true",
										children: (e, t) => {
											var n = Bf(), r = G(n);
											E(r, () => If, (e, t) => {
												t(e, {
													part: "heading",
													children: (e, t) => {
														ie();
														var n = he();
														W(() => T(n, i() ?? "")), F(e, n);
													},
													$$slots: { default: !0 }
												});
											});
											var o = U(r, 2), u = (e) => {
												var t = P(), n = G(t);
												{
													let e = (e, t = S) => {
														var n = zf();
														v(n, (e) => ({
															...e,
															class: "description"
														}), [() => t()()], void 0, void 0, "svelte-1fchw0y");
														var r = V(n), i = (e) => {
															var t = Lf(), n = ye(t, !0);
															W(() => T(n, a())), F(e, t);
														};
														M(r, (e) => {
															a() && e(i);
														});
														var o = U(r, 2), s = (e) => {
															var t = Rf(), n = ye(t, !0);
															W(() => T(n, l())), F(e, t);
														};
														M(o, (e) => {
															l() && e(s);
														}), O(n), F(e, n);
													};
													E(n, () => Od, (t, n) => {
														n(t, {
															asChild: e,
															$$slots: { asChild: !0 }
														});
													});
												}
												F(e, t);
											};
											M(o, (e) => {
												(a() || l()) && e(u);
											});
											var p = U(o, 2), m = V(p), _ = ye(m, !0), y = U(m, 2), x = ye(y, !0);
											O(p), W(() => {
												T(_, z(g).cancel), re(y, 1, D(c() ? "af-button danger" : "af-button primary")), j(y, "aria-disabled", z(b) || f() ? "true" : void 0), T(x, s() || z(g).confirm);
											}), be("click", m, () => d(h, "cancel", { reason: "close-button" })), be("click", y, w), F(e, n);
										},
										$$slots: { default: !0 }
									});
								}), O(n), fe(n, (e) => q(_, e), () => z(_)), F(e, n);
							};
							E(r, () => Ad, (t, n) => {
								n(t, {
									asChild: e,
									$$slots: { asChild: !0 }
								});
							});
						}
						F(e, n);
					},
					$$slots: { default: !0 }
				});
			}), F(e, n);
		},
		$$slots: { default: !0 }
	}), F(e, ae), x(ne);
}
De(["click"]), H(Wf, {
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
var Gf = ce("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 6 9 17l-5-5\"></path></svg>"), Kf = ce("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\"></rect><path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\"></path></svg>"), qf = I("<span> </span>"), Jf = I("<!> <span class=\"af-kit svelte-dc4eyn\"><button type=\"button\" part=\"trigger\" class=\"af-button ghost icon xs\"><!></button> <div part=\"status\" role=\"status\" class=\"live svelte-dc4eyn\"><!></div></span>", 1), Yf = {
	hash: "svelte-dc4eyn",
	code: ":host {position:relative;display:inline-flex;vertical-align:middle;}.af-kit.svelte-dc4eyn {display:inline-flex;}.live.svelte-dc4eyn {position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;}"
};
function Xf(e, t) {
	k(t, !0), ee(e, Yf);
	let r = L(t, "value", 7, null), i = L(t, "label", 7, null), a = L(t, "locale", 7, null), o = L(t, "strings", 7, null), s = t.$$host, c = y(() => u(a(), o() ?? void 0)), l = B(null), f = B(0), p = B(null), m = 0, g, _ = !0;
	Oe(() => () => {
		_ = !1, clearTimeout(g);
	});
	let v = y(() => z(l) === "copied" ? z(c).copied : z(l) === "failed" ? z(c).copyFailed : "");
	async function b(e) {
		try {
			if (navigator.clipboard?.writeText) return await navigator.clipboard.writeText(e), !0;
		} catch {}
		return S(e);
	}
	function S(e) {
		let t = s.shadowRoot;
		if (!t) return !1;
		let n = h(), r = document.createElement("textarea");
		r.value = e, r.readOnly = !0, r.tabIndex = -1, r.setAttribute("aria-hidden", "true"), r.style.cssText = "position: fixed; top: 0; left: 0; width: 1px; height: 1px; margin: 0; padding: 0; border: 0; opacity: 0; pointer-events: none", r.addEventListener("copy", (e) => e.stopPropagation()), t.append(r);
		try {
			return r.focus({ preventScroll: !0 }), r.select(), r.setSelectionRange(0, e.length), document.execCommand("copy");
		} catch {
			return !1;
		} finally {
			r.remove(), (n && n !== document.body && n.isConnected ? n : z(p))?.focus({ preventScroll: !0 });
		}
	}
	async function C() {
		let e = ++m, t = r() ?? "", n = t !== "" && await b(t);
		d(s, "af-copy", {
			value: t,
			ok: n
		}), _ && e === m && (q(l, n ? "copied" : "failed", !0), q(f, z(f) + 1), clearTimeout(g), g = setTimeout(() => q(l, null), 2e3));
	}
	var w = {
		get value() {
			return r();
		},
		set value(e = null) {
			r(e), A();
		},
		get label() {
			return i();
		},
		set label(e = null) {
			i(e), A();
		},
		get locale() {
			return a();
		},
		set locale(e = null) {
			a(e), A();
		},
		get strings() {
			return o();
		},
		set strings(e = null) {
			o(e), A();
		}
	}, ne = Jf(), E = G(ne);
	n(E, {});
	var re = U(E, 2), ie = V(re), D = V(ie), ae = (e) => {
		var t = Gf();
		F(e, t);
	}, oe = (e) => {
		var t = Kf();
		F(e, t);
	};
	M(D, (e) => {
		z(l) === "copied" ? e(ae) : e(oe, -1);
	}), O(ie), fe(ie, (e) => q(p, e), () => z(p));
	var se = U(ie, 2), ce = V(se);
	return te(ce, () => z(f), (e) => {
		var t = qf(), n = ye(t, !0);
		W(() => T(n, z(v))), F(e, t);
	}), O(se), O(re), W(() => j(ie, "aria-label", i() || z(c).copy)), be("click", ie, C), F(e, ne), x(w);
}
De(["click"]), H(Xf, {
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
var [Zf, Qf] = an({ name: "FileUploadContext" }), $f = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function ep(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, $f), i = Qf(), a = y(() => Bt()(r, ["disableClick"])), o = y(() => w(z(a), 2)), s = y(() => z(o)[0]), c = y(() => z(o)[1]), l = y(() => X(i().getDropzoneProps(z(s)), z(c)));
	return Q(e, J({ as: "div" }, () => z(l), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(ep, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/file-upload/file-upload-hidden-input.svelte
var tp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function np(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, tp), i = Qf(), a = Ku(), o = y(() => X(i().getHiddenInputProps(), r));
	var s = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	};
	{
		let t = y(() => a?.()?.ariaDescribedby);
		Q(e, J({
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
	return x(s);
}
H(np, { ref: {} }, [], [], { mode: "open" });
var rp = Cn("file-upload").parts("root", "dropzone", "item", "itemDeleteTrigger", "itemGroup", "itemName", "itemPreview", "itemPreviewImage", "itemSizeText", "label", "trigger", "clearTrigger").build(), ip = (e) => typeof e.getAsEntry == "function" ? e.getAsEntry() : typeof e.webkitGetAsEntry == "function" ? e.webkitGetAsEntry() : null, ap = (e) => e.isDirectory, op = (e) => e.isFile, sp = (e, t) => (Object.defineProperty(e, "relativePath", { value: t ? `${t}/${e.name}` : e.name }), e), cp = (e, t) => Promise.all(Array.from(e).filter((e) => e.kind === "file").map((e) => {
	let n = ip(e);
	if (!n) return null;
	if (ap(n) && t) return lp(n.createReader(), `${n.name}`);
	if (op(n) && typeof e.getAsFile == "function") {
		let t = e.getAsFile();
		return Promise.resolve(t ? sp(t, "") : null);
	}
	if (op(n)) return new Promise((e) => {
		n.file((t) => {
			e(sp(t, ""));
		});
	});
}).filter((e) => e)), lp = (e, t = "") => new Promise((n) => {
	let r = [], i = () => {
		e.readEntries((e) => {
			if (e.length === 0) {
				n(Promise.all(r).then((e) => e.flat()));
				return;
			}
			let a = e.map((e) => {
				if (!e) return null;
				if (ap(e)) return lp(e.createReader(), `${t}${e.name}`);
				if (op(e)) return new Promise((n) => {
					e.file((e) => {
						n(sp(e, t));
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
function up(e) {
	return e === "audio/*" || e === "video/*" || e === "image/*" || e === "text/*" || /\w+\/[-+.\w]+/g.test(e);
}
function dp(e) {
	return /^.*\.[\w]+$/.test(e);
}
var fp = (e) => up(e) || dp(e);
function pp(e) {
	if (e != null) return typeof e == "string" ? e : Array.isArray(e) ? e.filter(fp).join(",") : Object.entries(e).reduce((e, [t, n]) => [
		...e,
		t,
		...n
	], []).filter(fp).join(",");
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+file-utils@1.43.3/node_modules/@zag-js/file-utils/dist/is-file-equal.mjs
var mp = (e, t) => e.name === t.name && e.size === t.size && e.type === t.type, hp = (e) => e != null;
function gp(e, t, n) {
	if (hp(e.size)) {
		if (hp(t) && hp(n)) {
			if (e.size > n) return [!1, "FILE_TOO_LARGE"];
			if (e.size < t) return [!1, "FILE_TOO_SMALL"];
		} else if (hp(t) && e.size < t) return [!1, "FILE_TOO_SMALL"];
		else if (hp(n) && e.size > n) return [!1, "FILE_TOO_LARGE"];
	}
	return [!0, null];
}
var _p = new Map("3g2_video/3gpp2[3gp,3gpp_video/3gpp[3mf_model/3mf[7z_application/x-7z-compressed[aac_audio/aac[ac_application/pkix-attr-cert[adp_audio/adpcm[adts_audio/aac[ai_application/postscript[aml_application/automationml-aml+xml[amlx_application/automationml-amlx+zip[amr_audio/amr[apk_application/vnd.android.package-archive[apng_image/apng[appcache,manifest_text/cache-manifest[appinstaller_application/appinstaller[appx_application/appx[appxbundle_application/appxbundle[asc_application/pgp-keys[atom_application/atom+xml[atomcat_application/atomcat+xml[atomdeleted_application/atomdeleted+xml[atomsvc_application/atomsvc+xml[au,snd_audio/basic[avi_video/x-msvideo[avci_image/avci[avcs_image/avcs[avif_image/avif[aw_application/applixware[bdoc_application/bdoc[bin,bpk,buffer,deb,deploy,dist,distz,dll,dmg,dms,dump,elc,exe,img,iso,lrf,mar,msi,msm,msp,pkg,so_application/octet-stream[bmp,dib_image/bmp[btf,btif_image/prs.btif[bz2_application/x-bzip2[c_text/x-c[ccxml_application/ccxml+xml[cdfx_application/cdfx+xml[cdmia_application/cdmi-capability[cdmic_application/cdmi-container[cdmid_application/cdmi-domain[cdmio_application/cdmi-object[cdmiq_application/cdmi-queue[cer_application/pkix-cert[cgm_image/cgm[cjs_application/node[class_application/java-vm[coffee,litcoffee_text/coffeescript[conf,def,in,ini,list,log,text,txt_text/plain[cpp,cxx,cc_text/x-c++src[cpl_application/cpl+xml[cpt_application/mac-compactpro[crl_application/pkix-crl[css_text/css[csv_text/csv[cu_application/cu-seeme[cwl_application/cwl[cww_application/prs.cww[davmount_application/davmount+xml[dbk_application/docbook+xml[doc_application/msword[docx_application/vnd.openxmlformats-officedocument.wordprocessingml.document[dsc_text/prs.lines.tag[dssc_application/dssc+der[dtd_application/xml-dtd[dwd_application/atsc-dwd+xml[ear,jar,war_application/java-archive[ecma_application/ecmascript[emf_image/emf[eml,mime_message/rfc822[emma_application/emma+xml[emotionml_application/emotionml+xml[eot_application/vnd.ms-fontobject[eps,ps_application/postscript[epub_application/epub+zip[exi_application/exi[exp_application/express[exr_image/aces[ez_application/andrew-inset[fdf_application/fdf[fdt_application/fdt+xml[fits_image/fits[flac_audio/flac[flv_video/x-flv[g3_image/g3fax[geojson_application/geo+json[gif_image/gif[glb_model/gltf-binary[gltf_model/gltf+json[gml_application/gml+xml[go_text/x-go[gpx_application/gpx+xml[gz_application/gzip[h_text/x-h[h261_video/h261[h263_video/h263[h264_video/h264[heic_image/heic[heics_image/heic-sequence[heif_image/heif[heifs_image/heif-sequence[htm,html,shtml_text/html[ico_image/x-icon[icns_image/x-icns[ics,ifb_text/calendar[iges,igs_model/iges[ink,inkml_application/inkml+xml[ipa_application/octet-stream[java_text/x-java-source[jp2,jpg2_image/jp2[jpeg,jpe,jpg_image/jpeg[jpf,jpx_image/jpx[jpm,jpgm_image/jpm[jpgv_video/jpeg[jph_image/jph[js,mjs_text/javascript[json_application/json[json5_application/json5[jsonld_application/ld+json[jsx_text/jsx[jxl_image/jxl[jxr_image/jxr[ktx_image/ktx[ktx2_image/ktx2[less_text/less[m1v,m2v,mpe,mpeg,mpg_video/mpeg[m4a_audio/mp4[m4v_video/x-m4v[md,markdown_text/markdown[mid,midi,kar,rmi_audio/midi[mkv_video/x-matroska[mp2,mp2a,mp3,mpga,m3a,m2a_audio/mpeg[mp4,mp4v,mpg4_video/mp4[mp4a_audio/mp4[mp4s,m4p_application/mp4[odp_application/vnd.oasis.opendocument.presentation[oda_application/oda[ods_application/vnd.oasis.opendocument.spreadsheet[odt_application/vnd.oasis.opendocument.text[oga,ogg,opus,spx_audio/ogg[ogv_video/ogg[ogx_application/ogg[otf_font/otf[p12,pfx_application/x-pkcs12[pdf_application/pdf[pem_application/x-pem-file[php_text/x-php[png_image/png[ppt_application/vnd.ms-powerpoint[pptx_application/vnd.openxmlformats-officedocument.presentationml.presentation[pskcxml_application/pskc+xml[psd_image/vnd.adobe.photoshop[py_text/x-python[qt,mov_video/quicktime[rar_application/vnd.rar[rdf_application/rdf+xml[rtf_text/rtf[sass_text/x-sass[scss_text/x-scss[sgm,sgml_text/sgml[sh_application/x-sh[svg,svgz_image/svg+xml[swf_application/x-shockwave-flash[tar_application/x-tar[tif,tiff_image/tiff[toml_application/toml[ts_video/mp2t[tsx_text/tsx[tsv_text/tab-separated-values[ttc_font/collection[ttf_font/ttf[vtt_text/vtt[wasm_application/wasm[wav_audio/wav[weba_audio/webm[webm_video/webm[webmanifest_application/manifest+json[webp_image/webp[wma_audio/x-ms-wma[wmv_video/x-ms-wmv[woff_font/woff[woff2_font/woff2[xls_application/vnd.ms-excel[xlsx_application/vnd.openxmlformats-officedocument.spreadsheetml.sheet[xml_application/xml[xz_application/x-xz[yaml,yml_text/yaml[zip_application/zip".split("[").flatMap((e) => {
	let [t, n] = e.split("_");
	return t.split(",").map((e) => [e, n]);
}));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+file-utils@1.43.3/node_modules/@zag-js/file-utils/dist/get-file-mime-type.mjs
function vp(e) {
	let t = e.split(".").pop();
	return t && _p.get(t) || null;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+file-utils@1.43.3/node_modules/@zag-js/file-utils/dist/is-valid-file-type.mjs
function yp(e, t) {
	if (e && t) {
		let n = Array.isArray(t) ? t : typeof t == "string" ? t.split(",") : [];
		if (n.length === 0) return !0;
		let r = e.name || "", i = (e.type || vp(r) || "").toLowerCase(), a = i.replace(/\/.*$/, "");
		return n.some((e) => {
			let t = e.trim().toLowerCase();
			return t.charAt(0) === "." ? r.toLowerCase().endsWith(t) : t.endsWith("/*") ? a === t.replace(/\/.*$/, "") : i === t;
		});
	}
	return !0;
}
function bp(e, t) {
	let n = e.type === "application/x-moz-file" || yp(e, t);
	return [n, n ? null : "FILE_INVALID_TYPE"];
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+file-upload@1.43.3/node_modules/@zag-js/file-upload/dist/file-upload.dom.mjs
var xp = (e) => e.ids?.root ?? `file:${e.id}`, Sp = (e) => e.ids?.dropzone ?? `file:${e.id}:dropzone`, Cp = (e) => e.ids?.hiddenInput ?? `file:${e.id}:input`, wp = (e) => e.ids?.trigger ?? `file:${e.id}:trigger`, Tp = (e) => e.ids?.label ?? `file:${e.id}:label`, Ep = (e, t) => e.ids?.item?.(t) ?? `file:${e.id}:item:${t}`, Dp = (e, t) => e.ids?.itemName?.(t) ?? `file:${e.id}:item-name:${t}`, Op = (e, t) => e.ids?.itemSizeText?.(t) ?? `file:${e.id}:item-size:${t}`, kp = (e, t) => e.ids?.itemPreview?.(t) ?? `file:${e.id}:item-preview:${t}`, Ap = (e, t) => e.ids?.itemDeleteTrigger?.(t) ?? `file:${e.id}:item-delete:${t}`, jp = (e) => zn(`${e.name}-${e.size}`), Mp = (e) => e.getById(xp(e)), Np = (e) => e.getById(Cp(e)), Pp = (e) => e.getById(Sp(e));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+file-upload@1.43.3/node_modules/@zag-js/file-upload/dist/file-upload.utils.mjs
function Fp(e) {
	let t = Ge(e);
	return e.dataTransfer ? e.dataTransfer.types.some((e) => e === "Files" || e === "application/x-moz-file") : !!t && "files" in t;
}
function Ip(e, t, n) {
	let { prop: r, computed: i } = e;
	return !i("multiple") && t > 1 ? !1 : !i("multiple") && t + n.length === 2 || !(t + n.length > r("maxFiles"));
}
function Lp(e, t, n = [], r = []) {
	let { prop: i, computed: a } = e, o = [], s = [], c = {
		acceptedFiles: n,
		rejectedFiles: r
	};
	return t.forEach((e) => {
		let [t, r] = bp(e, a("acceptAttr")), [l, u] = gp(e, i("minFileSize"), i("maxFileSize")), d = n.some((t) => mp(t, e)) || o.some((t) => mp(t, e)), f = i("validate")?.(e, c), p = !f || f.length === 0;
		if (t && l && p && !d) o.push(e);
		else {
			let t = [r, u];
			d && t.push("FILE_EXISTS"), p || t.push(...f ?? []), s.push({
				file: e,
				errors: t.filter(Boolean)
			});
		}
	}), Ip(e, o.length, n) || (o.forEach((e) => {
		s.push({
			file: e,
			errors: ["TOO_MANY_FILES"]
		});
	}), o.splice(0)), {
		acceptedFiles: o,
		rejectedFiles: s
	};
}
function Rp(e, t) {
	let n = Sn(e);
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
var zp = {
	dropzone: "dropzone",
	itemPreview: (e) => `preview of ${e.name}`,
	deleteFile: (e) => `delete file ${e.name}`
}, Bp = "accepted", Vp = "button, a[href], input:not([type='file']), select, textarea, [tabindex], [contenteditable]";
function Hp(e, t) {
	if (!e || e.getAttribute("type") === "file") return !1;
	let n = e.closest(Vp);
	return n != t && pt(t, n);
}
function Up(e, t) {
	let { state: n, send: r, prop: i, computed: a, scope: o, context: s } = e, c = !!i("disabled"), l = !!i("readOnly"), u = !!i("required"), d = i("allowDrop"), f = He(zp, i("translations")), p = n.matches("dragging"), m = n.matches("focused") && !c, h = s.get("acceptedFiles"), g = i("maxFiles");
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
		deleteFile(e, t = Bp) {
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
			return Wc(e.size, i("locale"));
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
				...rp.root.attrs,
				dir: i("dir"),
				id: xp(o),
				"data-disabled": Z(c),
				"data-readonly": Z(l),
				"data-dragging": Z(p)
			});
		},
		getDropzoneProps(e = {}) {
			return t.element({
				...rp.dropzone.attrs,
				dir: i("dir"),
				id: Sp(o),
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
					let n = Ge(t);
					pt(t.currentTarget, n) && (Hp(n, t.currentTarget) || e.disableClick || (t.key === "Enter" || t.key === " ") && r({
						type: "DROPZONE.CLICK",
						src: "keydown"
					}));
				},
				onClick(t) {
					if (c || l || t.defaultPrevented || e.disableClick) return;
					let n = Ge(t);
					pt(t.currentTarget, n) && (Hp(n, t.currentTarget) || (t.currentTarget.localName === "label" && t.preventDefault(), r({ type: "DROPZONE.CLICK" })));
				},
				onDragOver(e) {
					if (c || l || !d) return;
					e.preventDefault(), e.stopPropagation();
					try {
						e.dataTransfer.dropEffect = "copy";
					} catch {}
					if (!Fp(e)) return;
					let t = e.dataTransfer.items.length;
					r({
						type: "DROPZONE.DRAG_OVER",
						count: t
					});
				},
				onDragLeave(e) {
					c || l || d && (pt(e.currentTarget, e.relatedTarget) || r({ type: "DROPZONE.DRAG_LEAVE" }));
				},
				onDrop(e) {
					c || l || (d && (e.preventDefault(), e.stopPropagation()), Fp(e) && cp(e.dataTransfer.items, i("directory")).then((e) => {
						r({
							type: "DROPZONE.DROP",
							files: dn(e)
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
				...rp.trigger.attrs,
				dir: i("dir"),
				id: wp(o),
				disabled: c || l,
				"data-disabled": Z(c),
				"data-readonly": Z(l),
				"data-invalid": Z(i("invalid")),
				type: "button",
				onClick(e) {
					c || l || (pt(Pp(o), e.currentTarget) && e.stopPropagation(), r({ type: "OPEN" }));
				}
			});
		},
		getHiddenInputProps() {
			return t.input({
				id: Cp(o),
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
				style: Ka
			});
		},
		getItemGroupProps(e = {}) {
			let { type: n = Bp } = e;
			return t.element({
				...rp.itemGroup.attrs,
				dir: i("dir"),
				"data-disabled": Z(c),
				"data-type": n
			});
		},
		getItemProps(e) {
			let { file: n, type: r = Bp } = e;
			return t.element({
				...rp.item.attrs,
				dir: i("dir"),
				id: Ep(o, jp(n)),
				"data-disabled": Z(c),
				"data-type": r
			});
		},
		getItemNameProps(e) {
			let { file: n, type: r = Bp } = e;
			return t.element({
				...rp.itemName.attrs,
				dir: i("dir"),
				id: Dp(o, jp(n)),
				"data-disabled": Z(c),
				"data-type": r
			});
		},
		getItemSizeTextProps(e) {
			let { file: n, type: r = Bp } = e;
			return t.element({
				...rp.itemSizeText.attrs,
				dir: i("dir"),
				id: Op(o, jp(n)),
				"data-disabled": Z(c),
				"data-type": r
			});
		},
		getItemPreviewProps(e) {
			let { file: n, type: r = Bp } = e;
			return t.element({
				...rp.itemPreview.attrs,
				dir: i("dir"),
				id: kp(o, jp(n)),
				"data-disabled": Z(c),
				"data-type": r
			});
		},
		getItemPreviewImageProps(e) {
			let { file: n, url: r, type: i = Bp } = e;
			if (!n.type.startsWith("image/")) throw Error("Preview Image is only supported for image files");
			return t.img({
				...rp.itemPreviewImage.attrs,
				alt: f.itemPreview?.(n),
				src: r,
				"data-disabled": Z(c),
				"data-type": i
			});
		},
		getItemDeleteTriggerProps(e) {
			let { file: n, type: a = Bp } = e;
			return t.button({
				...rp.itemDeleteTrigger.attrs,
				dir: i("dir"),
				id: Ap(o, jp(n)),
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
				...rp.label.attrs,
				dir: i("dir"),
				id: Tp(o),
				htmlFor: Cp(o),
				"data-disabled": Z(c),
				"data-invalid": Z(i("invalid")),
				"data-required": Z(u)
			});
		},
		getClearTriggerProps() {
			return t.button({
				...rp.clearTrigger.attrs,
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
var Wp = zt({
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
				isEqual: (e, t) => e.length === t?.length && e.every((e, n) => mp(e, t[n])),
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
				isEqual: (e, t) => e.length === t?.length && e.every((e, n) => mp(e.file, t[n].file)),
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
		acceptAttr: ({ prop: e }) => pp(e("accept")),
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
			return it(en(n, "dragover", (e) => {
				e?.preventDefault();
			}, !1), en(n, "drop", (e) => {
				pt(Mp(t), Ge(e)) || e.preventDefault();
			}, !1));
		} },
		actions: {
			syncInputElement({ scope: e, context: t }) {
				queueMicrotask(() => {
					let n = Np(e);
					if (!n) return;
					Rp(n, t.get("acceptedFiles"));
					let r = e.getWin();
					n.dispatchEvent(new r.Event("change", { bubbles: !0 }));
				});
			},
			openFilePicker({ scope: e }) {
				Y(() => {
					Np(e)?.click();
				});
			},
			setFiles(e) {
				let { computed: t, context: n, event: r } = e, { acceptedFiles: i, rejectedFiles: a } = Lp(e, r.files);
				n.set("acceptedFiles", t("multiple") ? i : i.length > 0 ? [i[0]] : []), n.set("rejectedFiles", a);
			},
			setEventFiles(e) {
				let { computed: t, context: n, event: r, prop: i } = e, a = n.get("acceptedFiles"), o = n.get("rejectedFiles"), { acceptedFiles: s, rejectedFiles: c } = Lp(e, r.files, a, o), l = (e) => {
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
					bt(`[zag-js/file-upload] error transforming files
${e}`);
				}).finally(() => {
					n.set("transforming", !1);
				})) : l(s);
			},
			removeFile({ context: e, event: t }) {
				if (t.itemType === "rejected") {
					let n = e.get("rejectedFiles").filter((e) => !mp(e.file, t.file));
					e.set("rejectedFiles", n);
				} else {
					let n = e.get("acceptedFiles").filter((e) => !mp(e, t.file));
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
}), Gp = (e) => {
	let t = pn(), n = Zt(), r = Ku(), i = y(() => {
		let i = Xe(e);
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
	}), a = Ut(Wp, () => z(i)), o = y(() => Up(a, gn));
	return () => z(o);
}, Kp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"value"
]);
function qp(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = L(t, "value", 7), i = K(t, Kp), a = y(() => X(r()().getRootProps(), i));
	return Zf(() => r()()), Q(e, J({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		},
		get value() {
			return r();
		},
		set value(e) {
			r(e), A();
		}
	});
}
H(qp, {
	ref: {},
	value: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/FileUpload.svelte
var Jp = (e, t = S) => {
	var n = tm(), r = V(n), i = (e) => {
		var t = Qp();
		ie(2), F(e, t);
	}, a = (e) => {
		var n = em(), r = U(G(n), 2), i = (e) => {
			var t = $p();
			ie(2), F(e, t);
		};
		M(r, (e) => {
			t() === "text" && e(i);
		}), F(e, n);
	};
	M(r, (e) => {
		t() === "image" ? e(i) : e(a, -1);
	}), O(n), F(e, n);
}, Yp = [], Xp = 5e3;
function Zp(e) {
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
var Qp = ce("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"></rect><circle cx=\"9\" cy=\"9\" r=\"2\"></circle><path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\"></path>", 1), $p = ce("<path d=\"M10 9H8\"></path><path d=\"M16 13H8\"></path><path d=\"M16 17H8\"></path>", 1), em = ce("<path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\"></path><path d=\"M14 2v4a2 2 0 0 0 2 2h4\"></path><!>", 1), tm = ce("<svg part=\"icon\" viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><!></svg>"), nm = I("<span id=\"af-described\" hidden=\"\"> </span>"), rm = I("<span id=\"af-lead\" hidden=\"\"> </span>"), im = I("<svg class=\"glyph svelte-19e4ssx\" viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 3v12\"></path><path d=\"m17 8-5-5-5 5\"></path><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path></svg> <span class=\"lead svelte-19e4ssx\"> <span part=\"trigger\"> </span><!></span> <span part=\"hint\" id=\"af-hint\"> </span>", 1), am = I("<a class=\"thumb svelte-19e4ssx\" target=\"_blank\" rel=\"noopener\" tabindex=\"-1\" aria-hidden=\"true\"><img part=\"preview\" alt=\"\"/></a>"), om = I("<img part=\"preview\" alt=\"\"/>"), sm = I("<a part=\"name\" class=\"name svelte-19e4ssx\" target=\"_blank\" rel=\"noopener\"> </a>"), cm = I("<span part=\"name\" class=\"name svelte-19e4ssx\"> </span>"), lm = I("<span part=\"size\"> </span>"), um = I("<div part=\"progress\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\"><div class=\"fill svelte-19e4ssx\"></div></div>"), dm = I("<span part=\"status\"> </span>"), fm = I("<button type=\"button\" part=\"remove\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 6h18\"></path><path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\"></path><path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\"></path><line x1=\"10\" x2=\"10\" y1=\"11\" y2=\"17\"></line><line x1=\"14\" x2=\"14\" y1=\"11\" y2=\"17\"></line></svg></button>"), pm = I("<li part=\"item\"><!> <!> <!> <!> <!></li>"), mm = I("<ul part=\"list\"></ul>"), hm = I("<p class=\"none svelte-19e4ssx\"> </p>"), gm = I("<div class=\"af-kit upload svelte-19e4ssx\"><!> <!> <!> <div part=\"notice\" role=\"status\" aria-live=\"polite\"><!></div> <!></div>"), _m = I("<!> <!>", 1), vm = {
	hash: "svelte-19e4ssx",
	code: ":host {display:block;}.upload.svelte-19e4ssx {display:flex;flex-direction:column;gap:8px;font-size:12px;line-height:1.5;--fu-edge: color-mix(in oklab, var(--k-fg) calc(15% + var(--k-dark, 0) * 6%), var(--k-surface));--fu-soft: color-mix(in oklab, var(--k-muted) calc(60% + var(--k-dark, 0) * 25%), var(--k-surface));}.upload.svelte-19e4ssx > .root {display:contents;}[part~='dropzone'] {display:flex;box-sizing:border-box;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:16px 12px;border:2px dashed var(--fu-edge);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:color-mix(in oklab, var(--k-muted-bg) 40%, transparent);text-align:center;outline:none;cursor:pointer;transition-property:color, background-color, border-color, box-shadow;transition-duration:150ms;transition-timing-function:cubic-bezier(0.4, 0, 0.2, 1);}\n  @media (hover: hover) {[part~='dropzone']:hover {border-color:var(--fu-soft);} }[part~='dropzone'][data-dragging] {border-color:color-mix(in oklab, var(--k-primary) 60%, var(--k-surface));background-color:color-mix(in oklab, var(--k-primary) 4%, transparent);}[part~='dropzone'][data-invalid] {border-color:var(--k-danger);}[part~='dropzone']:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[part~='dropzone'][data-disabled] {opacity:0.5;cursor:not-allowed;}.glyph.svelte-19e4ssx {flex:none;color:var(--fu-soft);}.lead.svelte-19e4ssx {color:var(--k-fg);}[part~='trigger'] {margin-left:4px;color:var(--k-primary);font-weight:500;}\n  @media (hover: hover) {[part~='dropzone']:not([data-disabled]) [part~='trigger']:hover {text-decoration-line:underline;} }[part~='hint'] {color:var(--k-muted);font-size:10px;}[part~='notice'] {color:var(--k-danger);font-size:11.5px;}[part~='notice']:empty {margin-top:-8px;}[part~='list'] {box-sizing:border-box;margin:0;padding:0;border:1px solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:var(--k-surface);list-style:none;}[part~='item'] {display:flex;box-sizing:border-box;align-items:center;gap:8px;padding:8px 12px;}[part~='item'] + [part~='item'] {border-top:1px solid var(--k-line);}[part~='icon'] {flex:none;width:14px;height:14px;color:var(--k-muted);}.thumb.svelte-19e4ssx {display:block;flex:none;}[part~='preview'] {display:block;box-sizing:border-box;flex:none;width:32px;height:32px;border:1px solid var(--k-line);border-radius:0.25rem;background-color:var(--k-surface);object-fit:cover;}.name.svelte-19e4ssx {flex:1 1 0%;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}a.name.svelte-19e4ssx {color:var(--k-primary);font-weight:500;text-decoration-line:none;border-radius:2px;outline:none;}\n  @media (hover: hover) {a.name.svelte-19e4ssx:hover {text-decoration-line:underline;} }a.name.svelte-19e4ssx:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[part~='size'] {flex:none;color:var(--fu-soft);font-size:10px;}[part~='progress'] {position:relative;flex:none;width:64px;height:6px;overflow:hidden;border-radius:calc(infinity * 1px);background-color:color-mix(in oklab, var(--k-primary) 20%, transparent);}.fill.svelte-19e4ssx {width:100%;height:100%;background-color:var(--k-primary);transition:transform 150ms cubic-bezier(0.4, 0, 0.2, 1);}[part~='status'] {flex:none;color:var(--k-danger);font-size:10px;}[part~='remove'] {display:flex;box-sizing:border-box;flex:none;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:0;border-radius:0.25rem;background:none;color:var(--fu-soft);outline:none;cursor:pointer;}\n  @media (hover: hover) {[part~='remove']:not(:disabled):hover {background-color:color-mix(in oklab, var(--k-danger) 6%, var(--k-surface));color:var(--k-danger);} }[part~='remove']:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[part~='remove']:disabled {opacity:0.5;cursor:not-allowed;}.none.svelte-19e4ssx {box-sizing:border-box;margin:0;padding:8px 12px;border:1px solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:var(--k-surface);color:var(--fu-soft);font-size:11.5px;font-style:italic;}\n  @media (prefers-reduced-motion: reduce) {[part~='dropzone'], .fill.svelte-19e4ssx {transition:none;} }\n  @media (forced-colors: active) {[part~='dropzone']:focus-visible, a.name.svelte-19e4ssx:focus-visible, [part~='remove']:focus-visible {outline:2px solid;outline-offset:2px;}\n  }"
};
function ym(e, r) {
	let i = g();
	k(r, !0), ee(e, vm);
	let a = L(r, "items", 23, () => []), o = L(r, "accept", 7, null), c = L(r, "multiple", 7, !1), l = L(r, "replace", 7, !1), f = L(r, "label", 7, null), m = L(r, "maxFiles", 7, null), h = L(r, "disabled", 7, !1), v = L(r, "locale", 7, null), b = L(r, "strings", 7, null), S = L(r, "name", 7, null), te = L(r, "required", 7, !1), C = L(r, "readonly", 7, !1), w = L(r, "description", 7, null), ne = L(r, "error", 7, null), re = L(r, "invalid", 7, !1), ie = r.$$host, D = y(() => u(v(), b() ?? void 0)), ae = y(() => a() ?? []), oe = y(() => m() != null && Number(m()) >= 1), se = y(() => z(oe) ? Math.floor(Number(m())) : c() ? Infinity : 1), ce = y(() => z(se) > 1 ? z(D).dropFiles : z(D).dropFile), le = y(() => !!l() && z(se) === 1), ue = y(() => `${z(ce)} ${z(D).browse}`), N = B(!1), de = y(() => !!h() || z(N)), I = y(() => [w(), ne()].filter(Boolean).join(" ")), R = B(null), fe = B(null), pe = B(""), me;
	async function H(e) {
		clearTimeout(me), z(pe) === e && (q(pe, ""), await xe()), q(pe, e, !0), me = setTimeout(() => q(pe, ""), Xp);
	}
	Oe(() => () => clearTimeout(me));
	let ge = null;
	function _e() {
		return ge || (ge = {
			accepted: [],
			rejected: []
		}, queueMicrotask(Se)), ge;
	}
	function Se() {
		let { accepted: e, rejected: t } = ge;
		if (ge = null, z(fe) && (z(fe).value = ""), t.length && Ce().clearRejectedFiles(), (z(oe) && !z(le) ? z(ae).filter((e) => e.status !== "failed").length : 0) + (e.length + t.filter((e) => !e.errors.includes("FILE_EXISTS")).length) > z(se)) {
			H(z(se) === 1 ? z(D).oneFileOnly : s(z(D).fileCountRefused, { max: z(se) }));
			return;
		}
		let n = t.find((e) => e.errors.includes("FILE_INVALID_TYPE"));
		if (n) {
			H(s(z(D).fileTypeRefused, { name: n.file.name }));
			return;
		}
		let r = t.find((e) => e.errors.includes("FILE_EXISTS"));
		r && H(s(z(D).fileDuplicate, { name: r.file.name })), e.length && d(ie, "files-add", { files: e });
	}
	let Ce = Gp(() => ({
		id: i,
		getRootNode: () => ie.shadowRoot,
		accept: o() || void 0,
		maxFiles: z(se),
		disabled: z(de),
		readOnly: !!C(),
		invalid: !!re(),
		acceptedFiles: Yp,
		preventDocumentDrop: !1,
		translations: { dropzone: f() || z(ue) },
		onFileAccept: (e) => {
			e.files.length && _e().accepted.push(...e.files);
		},
		onFileReject: (e) => {
			e.files.length && _e().rejected.push(...e.files);
		}
	}));
	Oe(() => {
		let e = z(R);
		if (!e || !(z(de) || C())) return;
		let t = (e) => e.preventDefault();
		return e.addEventListener("dragover", t), e.addEventListener("drop", t), () => {
			e.removeEventListener("dragover", t), e.removeEventListener("drop", t);
		};
	});
	let we = y(() => {
		let e = t(v()) ? "vi-VN" : "en-GB", n = (t) => new Intl.NumberFormat(e, {
			style: "unit",
			unit: t,
			unitDisplay: "short",
			maximumFractionDigits: 1
		});
		return {
			byte: new Intl.NumberFormat(e, { maximumFractionDigits: 0 }),
			kilobyte: n("kilobyte"),
			megabyte: n("megabyte")
		};
	});
	function Te(e) {
		return e == null || !Number.isFinite(e) || e < 0 ? "" : e < 1024 ? `${z(we).byte.format(e)} B` : e < 1048576 ? z(we).kilobyte.format(e / 1024) : z(we).megabyte.format(e / 1024 / 1024);
	}
	let Ee = (e) => Math.min(100, Math.max(0, Number(e.progress) || 0));
	Oe(() => {
		let e = z(ae).filter((e) => e.status === "done").map((e) => e.id), t = !!te() && e.length === 0;
		jr(ie, {
			name: S(),
			value: e,
			validity: t ? { valueMissing: !0 } : {},
			message: t ? p(z(D), "valueMissing") : "",
			anchor: z(R)
		});
	}), Mr(ie, {
		reset() {},
		disabled(e) {
			q(N, e, !0);
		}
	});
	var De = {
		get items() {
			return a();
		},
		set items(e = []) {
			a(e), A();
		},
		get accept() {
			return o();
		},
		set accept(e = null) {
			o(e), A();
		},
		get multiple() {
			return c();
		},
		set multiple(e = !1) {
			c(e), A();
		},
		get replace() {
			return l();
		},
		set replace(e = !1) {
			l(e), A();
		},
		get label() {
			return f();
		},
		set label(e = null) {
			f(e), A();
		},
		get maxFiles() {
			return m();
		},
		set maxFiles(e = null) {
			m(e), A();
		},
		get disabled() {
			return h();
		},
		set disabled(e = !1) {
			h(e), A();
		},
		get locale() {
			return v();
		},
		set locale(e = null) {
			v(e), A();
		},
		get strings() {
			return b();
		},
		set strings(e = null) {
			b(e), A();
		},
		get name() {
			return S();
		},
		set name(e = null) {
			S(e), A();
		},
		get required() {
			return te();
		},
		set required(e = !1) {
			te(e), A();
		},
		get readonly() {
			return C();
		},
		set readonly(e = !1) {
			C(e), A();
		},
		get description() {
			return w();
		},
		set description(e = null) {
			w(e), A();
		},
		get error() {
			return ne();
		},
		set error(e = null) {
			ne(e), A();
		},
		get invalid() {
			return re();
		},
		set invalid(e = !1) {
			re(e), A();
		}
	}, K = _m(), ke = G(K);
	n(ke, {});
	var J = U(ke, 2);
	return Ft(J, {
		value: () => ie.shadowRoot,
		children: (e, t) => {
			var n = gm(), r = V(n), i = (e) => {
				var t = nm(), n = ye(t, !0);
				W(() => T(n, z(I))), F(e, t);
			};
			M(r, (e) => {
				z(I) && e(i);
			});
			var a = U(r, 2), o = (e) => {
				var t = rm(), n = ye(t, !0);
				W(() => T(n, z(ue))), F(e, t);
			};
			M(a, (e) => {
				f() && e(o);
			});
			var s = U(a, 2);
			E(s, () => qp, (e, t) => {
				t(e, {
					get value() {
						return Ce;
					},
					class: "root",
					children: (e, t) => {
						var n = P(), r = G(n), i = (e) => {
							var t = P(), n = G(t);
							{
								let e = y(() => [
									f() ? "af-lead" : "",
									"af-hint",
									z(I) ? "af-described" : ""
								].filter(Boolean).join(" "));
								E(n, () => ep, (t, n) => {
									n(t, {
										part: "dropzone",
										get "aria-describedby"() {
											return z(e);
										},
										get ref() {
											return z(R);
										},
										set ref(e) {
											q(R, e, !0);
										},
										children: (e, t) => {
											var n = im(), r = U(G(n), 2), i = V(r, !0), a = U(i), o = ye(a, !0), s = U(a);
											E(s, () => np, (e, t) => {
												t(e, {
													get ref() {
														return z(fe);
													},
													set ref(e) {
														q(fe, e, !0);
													}
												});
											}), O(r);
											var c = U(r, 2), l = ye(c, !0);
											W(() => {
												T(i, z(ce)), T(o, z(D).browse), T(l, z(se) > 1 ? z(D).multipleAllowed : z(D).oneFileOnly);
											}), F(e, n);
										},
										$$slots: { default: !0 }
									});
								});
							}
							F(e, t);
						};
						M(r, (e) => {
							C() || e(i);
						}), F(e, n);
					},
					$$slots: { default: !0 }
				});
			});
			var c = U(s, 2), l = V(c), u = (e) => {
				var t = he();
				W(() => T(t, z(pe))), F(e, t);
			};
			M(l, (e) => {
				z(pe) && e(u);
			}), O(c);
			var p = U(c, 2), m = (e) => {
				var t = mm();
				_(t, 21, () => z(ae), (e) => e.id, (e, t) => {
					let n = y(() => Te(z(t).size));
					var r = pm(), i = V(r), a = (e) => {
						var n = P(), r = G(n), i = (e) => {
							var n = am(), r = ye(n);
							W(() => {
								j(n, "href", z(t).href), j(r, "src", z(t).preview);
							}), F(e, n);
						}, a = (e) => {
							var n = om();
							W(() => j(n, "src", z(t).preview)), F(e, n);
						};
						M(r, (e) => {
							z(t).href ? e(i) : e(a, -1);
						}), F(e, n);
					}, o = (e) => {
						{
							let n = y(() => Zp(z(t).name));
							Jp(e, () => z(n));
						}
					};
					M(i, (e) => {
						z(t).preview ? e(a) : e(o, -1);
					});
					var s = U(i, 2), c = (e) => {
						var n = sm(), r = ye(n, !0);
						W(() => {
							j(n, "href", z(t).href), T(r, z(t).name);
						}), F(e, n);
					}, l = (e) => {
						var n = cm(), r = ye(n, !0);
						W(() => T(r, z(t).name)), F(e, n);
					};
					M(s, (e) => {
						z(t).href ? e(c) : e(l, -1);
					});
					var u = U(s, 2), f = (e) => {
						var t = lm(), r = ye(t, !0);
						W(() => T(r, z(n))), F(e, t);
					};
					M(u, (e) => {
						z(n) && e(f);
					});
					var p = U(u, 2), m = (e) => {
						var n = um(), r = ye(n);
						W((e, t) => {
							j(n, "aria-valuenow", e), j(n, "aria-label", z(D).uploading), ve(r, `transform: translateX(-${t ?? ""}%)`);
						}, [() => Ee(z(t)), () => 100 - Ee(z(t))]), F(e, n);
					}, h = (e) => {
						var n = dm(), r = ye(n, !0);
						W(() => {
							j(n, "title", z(t).error || void 0), T(r, z(D).uploadFailed);
						}), F(e, n);
					};
					M(p, (e) => {
						z(t).status === "uploading" ? e(m) : z(t).status === "failed" && e(h, 1);
					});
					var g = U(p, 2), _ = (e) => {
						var n = fm();
						W(() => {
							j(n, "aria-label", `${z(D).removeFile ?? ""}: ${z(t).name ?? ""}`), n.disabled = z(de) || z(t).status === "uploading";
						}), be("click", n, () => d(ie, "remove", { id: z(t).id })), F(e, n);
					};
					M(g, (e) => {
						C() || e(_);
					}), O(r), W(() => j(r, "data-status", z(t).status)), F(e, r);
				}), O(t), F(e, t);
			}, h = (e) => {
				var t = hm(), n = ye(t, !0);
				W(() => T(n, z(D).noFiles)), F(e, t);
			};
			M(p, (e) => {
				z(ae).length ? e(m) : C() && e(h, 1);
			}), O(n), F(e, n);
		},
		$$slots: { default: !0 }
	}), F(e, K), x(De);
}
De(["click"]), H(ym, {
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
}, [], [], { mode: "open" }, (e) => class extends Ar(e) {
	focus(e) {
		let t = this.shadowRoot?.querySelector("[part~=\"dropzone\"]");
		t ? t.focus(e) : super.focus(e);
	}
});
var bm = Cn("date-picker").parts("clearTrigger", "content", "control", "input", "label", "monthSelect", "nextTrigger", "positioner", "presetTrigger", "prevTrigger", "rangeText", "root", "table", "tableBody", "tableCell", "tableCellTrigger", "tableHead", "tableHeader", "tableRow", "trigger", "view", "viewControl", "viewTrigger", "yearSelect").build();
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/constrain.mjs
function xm(e, t, n, r, i) {
	let a = {};
	for (let e in t) {
		let n = e, r = t[n];
		r != null && (a[n] = Math.floor(r / 2), a[n] > 0 && r % 2 == 0 && a[n]--);
	}
	return wm(e, Sm(e, t, n).subtract(a), t, n, r, i);
}
function Sm(e, t, n, r, i) {
	let a = e;
	return t.years ? a = Tl(e) : t.months ? a = Cl(e) : t.weeks && (a = Dl(e, n)), wm(e, a, t, n, r, i);
}
function Cm(e, t, n, r, i) {
	let a = { ...t };
	return a.days ? a.days-- : a.weeks ? a.weeks-- : a.months ? a.months-- : a.years && a.years--, wm(e, Sm(e, t, n).subtract(a), t, n, r, i);
}
function wm(e, t, n, r, i, a) {
	return i && e.compare(i) >= 0 && (t = Fl(t, Sm(Yl(i), n, r))), a && e.compare(a) <= 0 && (t = Pl(t, Cm(Yl(a), n, r))), t;
}
function Tm(e, t, n) {
	let r = Yl(e), i = t ? Yl(t) : void 0, a = n ? Yl(n) : void 0, o = r;
	return i && (o = Fl(o, i)), a && (o = Pl(o, a)), o.compare(r) === 0 ? e : "hour" in e ? e.set({
		year: o.year,
		month: o.month,
		day: o.day
	}) : o;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/align.mjs
function Em(e, t, n, r, i, a) {
	switch (t) {
		case "start": return Sm(e, n, r, i, a);
		case "end": return Cm(e, n, r, i, a);
		default: return xm(e, n, r, i, a);
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/assertion.mjs
function Dm(e, t) {
	return e == null || t == null ? e === t : !("hour" in e) && !("hour" in t) ? il(e, t) : Xl(e).compare(Xl(t)) === 0;
}
function Om(e, t, n, r, i) {
	return e ? t?.(e, n) ? !0 : km(e, r, i) : !1;
}
function km(e, t, n) {
	return t != null && e.compare(t) < 0 || n != null && e.compare(n) > 0;
}
function Am(e, t, n) {
	let r = e.subtract({ days: 1 });
	return il(r, e) || km(r, t, n);
}
function jm(e, t, n) {
	let r = e.add({ days: 1 });
	return il(r, e) || km(r, t, n);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/duration.mjs
function Mm(e) {
	let t = { ...e };
	for (let e in t) t[e] = 1;
	return t;
}
function Nm(e, t) {
	let n = { ...t };
	return n.days ? n.days-- : n.days = -1, e.add(n);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/get-era-format.mjs
function Pm(e) {
	if (!e) return;
	let t = e.calendar.identifier;
	return t === "gregory" || t === "iso8601" ? e.era === "BC" ? "short" : void 0 : "short";
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/formatter.mjs
function Fm(e, t, n) {
	let r = n ?? Xl(hl(t));
	return new Lu(e, {
		weekday: "long",
		month: "long",
		year: "numeric",
		day: "numeric",
		era: Pm(r),
		calendar: r.calendar.identifier,
		timeZone: t
	});
}
function Im(e, t, n) {
	let r = n ?? hl(t);
	return new Lu(e, {
		month: "long",
		year: "numeric",
		era: Pm(r),
		calendar: r.calendar.identifier,
		timeZone: t
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/format.mjs
function Lm(e, t, n, r, i) {
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
function Rm(e, t, n, r) {
	if (!e) return "";
	let i = e, a = t ?? e, o = Fm(n, r);
	return il(i, a) ? o.format(i.toDate(r)) : Lm(i, a, o, (e, t) => `${e} \u2013 ${t}`, r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/date-month.mjs
var zm = [
	"sun",
	"mon",
	"tue",
	"wed",
	"thu",
	"fri",
	"sat"
];
function Bm(e) {
	return e == null ? void 0 : zm[e];
}
function Vm(e, t, n) {
	return Dl(e, t, Bm(n));
}
function Hm(e, t, n, r) {
	let i = t.add({ weeks: e }), a = [], o = Vm(i, n, r);
	for (; a.length < 7;) {
		a.push(o);
		let e = o.add({ days: 1 });
		if (il(o, e)) break;
		o = e;
	}
	return a;
}
function Um(e, t, n, r) {
	let i = Bm(r), a = n ?? Nl(e, t, i);
	return [...Array(a).keys()].map((n) => Hm(n, e, t, r));
}
function Wm(e, t) {
	let n = new Lu(e, {
		weekday: "long",
		timeZone: t
	}), r = new Lu(e, {
		weekday: "short",
		timeZone: t
	}), i = new Lu(e, {
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
function Gm(e, t, n, r) {
	let i = Vm(e, r, t), a = [...Array(7).keys()], o = Wm(r, n);
	return a.map((e) => o(i.add({ days: e })));
}
function Km(e, t = "long", n) {
	if (!n || n.calendar.identifier === "gregory" || n.calendar.identifier === "iso8601") {
		let n = new Date(2021, 0, 1), r = [];
		for (let i = 0; i < 12; i++) r.push(n.toLocaleString(e, { month: t })), n.setMonth(n.getMonth() + 1);
		return r;
	}
	let r = n.calendar.getMonthsInYear(n), i = new Lu(e, {
		month: t,
		calendar: n.calendar.identifier
	}), a = [];
	for (let e = 1; e <= r; e++) {
		let t = n.set({ month: e });
		a.push(i.format(t.toDate("UTC")));
	}
	return a;
}
function qm(e, t) {
	let n = Dl(e, t, "mon"), r = n.year, i = Dl(n.set({
		month: 1,
		day: 4
	}), t, "mon"), a = n.calendar.toJulianDay(n), o = i.calendar.toJulianDay(i);
	if (a >= o) return 1 + Math.floor((a - o) / 7);
	let s = Dl(n.set({
		year: r - 1,
		month: 1,
		day: 4
	}), t, "mon"), c = s.calendar.toJulianDay(s);
	return 1 + Math.floor((a - c) / 7);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/date-year.mjs
function Jm(e) {
	let t = [];
	for (let n = e.from; n <= e.to; n += 1) t.push(n);
	return t;
}
var Ym = 1900, Xm = 2099;
function Zm(e, t, n) {
	let r = e.calendar;
	return {
		from: t?.year ?? Zl(new Nu(Ym, 1, 1), r).year,
		to: n?.year ?? Zl(new Nu(Xm, 12, 31), r).year
	};
}
var Qm = 10;
function $m(e) {
	if (e) {
		if (e.length === 3) return e.padEnd(4, "0");
		if (e.length === 2) {
			let t = (/* @__PURE__ */ new Date()).getFullYear(), n = Math.floor(t / 100) * 100 + parseInt(e.slice(-2), 10);
			return n > t + Qm ? (n - 100).toString() : n.toString();
		}
		return e;
	}
}
function eh(e, t) {
	let n = t?.strict ? 10 : 12, r = e - e % 10, i = [];
	for (let e = 0; e < n; e += 1) {
		let t = r + e;
		i.push(t);
	}
	return i;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/mutation.mjs
function th(e, t) {
	let n = hl(e ?? xl());
	return t ? Zl(n, t) : n;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/pagination.mjs
function nh(e, t, n, r) {
	return function(i) {
		let { startDate: a, focusedDate: o } = i, s = Nm(a, e);
		return km(o, n, r) ? {
			startDate: a,
			focusedDate: Tm(o, n, r),
			endDate: s
		} : o.compare(a) < 0 ? {
			startDate: Cm(o, e, t, n, r),
			focusedDate: Tm(o, n, r),
			endDate: s
		} : o.compare(s) > 0 ? {
			startDate: Sm(o, e, t, n, r),
			endDate: s,
			focusedDate: Tm(o, n, r)
		} : {
			startDate: a,
			endDate: s,
			focusedDate: Tm(o, n, r)
		};
	};
}
function rh(e, t, n, r, i, a) {
	let o = nh(n, r, i, a), s = t.add(n);
	return o({
		focusedDate: e.add(n),
		startDate: Sm(wm(e, s, n, r, i, a), n, r)
	});
}
function ih(e, t, n, r, i, a) {
	let o = nh(n, r, i, a), s = t.subtract(n);
	return o({
		focusedDate: e.subtract(n),
		startDate: Sm(wm(e, s, n, r, i, a), n, r)
	});
}
function ah(e, t, n, r, i, a, o) {
	let s = nh(r, i, a, o);
	if (!n && !r.days) return s({
		focusedDate: e.add(Mm(r)),
		startDate: t
	});
	if (r.days) return rh(e, t, r, i, a, o);
	if (r.weeks) return s({
		focusedDate: e.add({ months: 1 }),
		startDate: t
	});
	if (r.months || r.years) return s({
		focusedDate: e.add({ years: 1 }),
		startDate: t
	});
}
function oh(e, t, n, r, i, a, o) {
	let s = nh(r, i, a, o);
	if (!n && !r.days) return s({
		focusedDate: e.subtract(Mm(r)),
		startDate: t
	});
	if (r.days) return ih(e, t, r, i, a, o);
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
var sh = /* @__PURE__ */ new Map();
function ch(e) {
	let t = sh.get(e);
	return t ?? (t = "0123456789" + new Intl.NumberFormat(e, { useGrouping: !1 }).format(1234567890), sh.set(e, t), t);
}
var lh = (e, t) => t ? ch(t).includes(e) : /\d/.test(e), uh = (e, t, n) => !e || e.length !== 1 || lh(e, n) || t.includes(e), dh = (e, t, n) => e.split("").filter((e) => uh(e, t, n)).join(""), fh = /* @__PURE__ */ new Map();
function ph(e) {
	let t = fh.get(e);
	if (t != null) return t;
	let n = new Intl.DateTimeFormat(e).formatToParts(/* @__PURE__ */ new Date()).find((e) => e.type === "literal");
	return t = n ? n.value : "/", fh.set(e, t), t;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/parse-date.mjs
var mh = (e) => e != null && e.length === 4, hh = (e) => e != null && parseFloat(e) <= 12, gh = (e) => e != null && parseFloat(e) <= 31;
function _h(e, t, n) {
	let { year: r, month: i, day: a } = yh(vh(t, n), e) ?? {};
	if (r != null || i != null || a != null) {
		let e = /* @__PURE__ */ new Date();
		r ||= e.getFullYear().toString(), i ||= (e.getMonth() + 1).toString(), a ||= e.getDate().toString();
	}
	if (mh(r) || (r = $m(r)), mh(r) && hh(i) && gh(a)) return new Nu(+r, +i, +a);
	let o = Date.parse(e);
	if (!isNaN(o)) {
		let e = new Date(o);
		return new Nu(e.getFullYear(), e.getMonth() + 1, e.getDate());
	}
}
function vh(e, t) {
	return new Lu(e, {
		day: "numeric",
		month: "numeric",
		year: "numeric",
		timeZone: t
	}).formatToParts(new Date(2e3, 11, 25)).map(({ type: e, value: t }) => e === "literal" ? `${t}?` : `((?!=<${e}>)\\d+)?`).join("");
}
function yh(e, t) {
	let n = t.match(e);
	return e.toString().match(/<(.+?)>/g)?.map((e) => {
		let t = e.match(/<(.+)>/);
		return !t || t.length <= 0 ? null : e.match(/<(.+)>/)?.[1];
	}).reduce((e, t, r) => (t && (e[t] = n && n.length > r ? n[r + 1] : null), e), {});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/preset.mjs
function bh(e, t, n) {
	let r = Yl(ml(n));
	switch (e) {
		case "thisWeek": return [Dl(r, t), Ol(r, t)];
		case "thisMonth": return [Cl(r), r];
		case "thisQuarter": return [Cl(r).add({ months: -((r.month - 1) % 3) }), r];
		case "thisYear": return [Tl(r), r];
		case "last3Days": return [r.add({ days: -2 }), r];
		case "last7Days": return [r.add({ days: -6 }), r];
		case "last14Days": return [r.add({ days: -13 }), r];
		case "last30Days": return [r.add({ days: -29 }), r];
		case "last90Days": return [r.add({ days: -89 }), r];
		case "lastMonth": return [Cl(r.add({ months: -1 })), wl(r.add({ months: -1 }))];
		case "lastQuarter": return [Cl(r.add({ months: -((r.month - 1) % 3) - 3 })), wl(r.add({ months: -((r.month - 1) % 3) - 1 }))];
		case "lastWeek": return [Dl(r, t).add({ weeks: -1 }), Ol(r, t).add({ weeks: -1 })];
		case "lastYear": return [Tl(r.add({ years: -1 })), El(r.add({ years: -1 }))];
		default: throw Error(`Invalid date range preset: ${e}`);
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-picker@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-picker/dist/date-picker.dom.mjs
var xh = (e, t) => e.ids?.label?.(t) ?? `datepicker:${e.id}:label:${t}`, Sh = (e) => e.ids?.root ?? `datepicker:${e.id}`, Ch = (e, t) => e.ids?.table?.(t) ?? `datepicker:${e.id}:table:${t}`, wh = (e) => e.ids?.content ?? `datepicker:${e.id}:content`, Th = (e, t) => e.ids?.cellTrigger?.(t) ?? `datepicker:${e.id}:cell-trigger:${t}`, Eh = (e, t) => e.ids?.prevTrigger?.(t) ?? `datepicker:${e.id}:prev:${t}`, Dh = (e, t) => e.ids?.nextTrigger?.(t) ?? `datepicker:${e.id}:next:${t}`, Oh = (e, t) => e.ids?.viewTrigger?.(t) ?? `datepicker:${e.id}:view:${t}`, kh = (e) => e.ids?.clearTrigger ?? `datepicker:${e.id}:clear`, Ah = (e) => e.ids?.control ?? `datepicker:${e.id}:control`, jh = (e, t) => e.ids?.input?.(t) ?? `datepicker:${e.id}:input:${t}`, Mh = (e) => e.ids?.trigger ?? `datepicker:${e.id}:trigger`, Nh = (e) => e.ids?.positioner ?? `datepicker:${e.id}:positioner`, Ph = (e) => e.ids?.monthSelect ?? `datepicker:${e.id}:month-select`, Fh = (e) => e.ids?.yearSelect ?? `datepicker:${e.id}:year-select`, Ih = (e, t) => _t(Rh(e), `[data-part=table-cell-trigger][data-view=${t}][data-focus]:not([data-outside-range])`), Lh = (e) => e.getById(Mh(e)), Rh = (e) => e.getById(wh(e)), zh = (e) => ze(Wh(e), "[data-part=input]"), Bh = (e) => e.getById(Fh(e)), Vh = (e) => e.getById(Ph(e)), Hh = (e) => e.getById(kh(e)), Uh = (e) => e.getById(Nh(e)), Wh = (e) => e.getById(Ah(e));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-picker@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-picker/dist/date-picker.utils.mjs
function Gh(e) {
	let [t, n] = e, r;
	return r = !t || !n || t.compare(n) <= 0 ? e : [n, t], r;
}
function Kh(e, t) {
	let [n, r] = t;
	return !n || !r ? !1 : n.compare(e) <= 0 && r.compare(e) >= 0;
}
function qh(e) {
	return e.slice().filter((e) => e != null).sort((e, t) => e.compare(t));
}
function Jh(e) {
	return Re(e, {
		year: "calendar decade",
		month: "calendar year",
		day: "calendar month"
	});
}
var Yh = {
	day: "dd",
	month: "mm",
	year: "yyyy"
};
function Xh(e) {
	return new Lu(e).formatToParts(/* @__PURE__ */ new Date()).map((e) => Yh[e.type] ?? e.value).join("");
}
var Zh = (e) => !Number.isNaN(e.day) && !Number.isNaN(e.month) && !Number.isNaN(e.year), Qh = {
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
		return Re(e, {
			year: "Switch to previous decade",
			month: "Switch to previous year",
			day: "Switch to previous month"
		});
	},
	nextTrigger(e) {
		return Re(e, {
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
function $h(e, t) {
	return e ? e === "day" ? 0 : e === "month" ? 1 : 2 : t || 0;
}
function eg(e) {
	return e === 0 ? "day" : e === 1 ? "month" : "year";
}
function tg(e, t, n) {
	return eg(ut($h(e, 0), $h(t, 0), $h(n, 2)));
}
function ng(e, t) {
	return $h(e, 0) > $h(t, 0);
}
function rg(e, t) {
	return $h(e, 0) < $h(t, 0);
}
function ig(e, t, n) {
	return tg(eg($h(e, 0) + 1), t, n);
}
function ag(e, t, n) {
	return tg(eg($h(e, 0) - 1), t, n);
}
var og = [
	"day",
	"month",
	"year"
];
function sg(e) {
	og.forEach((t) => e(t));
}
var cg = Mi((e) => [
	e.view,
	e.startValue.toString(),
	e.endValue.toString(),
	e.locale,
	e.timeZone,
	e.selectionMode
], ([e], t) => {
	let { startValue: n, endValue: r, locale: i, timeZone: a, selectionMode: o } = t;
	if (e === "year") {
		let e = eh(n.year, { strict: !0 }), t = e.at(0).toString(), r = e.at(-1).toString();
		return {
			start: t,
			end: r,
			formatted: `${t} - ${r}`
		};
	}
	if (e === "month") {
		let e = new Lu(i, {
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
	let s = new Lu(i, {
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
function lg(e, t) {
	let { state: n, context: r, prop: i, send: a, computed: o, scope: s } = e, c = r.get("startValue"), l = o("endValue"), u = r.get("value"), d = r.get("focusedValue"), f = r.get("hoveredValue"), p = f ? Gh([u[0], f]) : [], m = !!i("disabled"), h = !!i("readOnly"), g = !!i("invalid"), _ = o("isInteractive"), v = u.length === 0, y = i("min"), b = i("max"), x = i("locale"), ee = i("timeZone"), S = i("startOfWeek"), te = n.matches("focused"), C = n.matches("open"), w = i("selectionMode") === "range", T = i("selectionMode") === "multiple", ne = i("isDateUnavailable"), E = i("maxSelectedDates"), re = T && E != null && u.length >= E, ie = r.get("currentPlacement"), D = ie ? Yo(ie) : void 0, O = ms({
		...i("positioning"),
		placement: ie
	}), ae = ph(x), k = He(Qh, i("translations"));
	function oe(e = c) {
		let t = i("fixedWeeks") ? 6 : void 0;
		return Um(e, x, t, S);
	}
	function se(e = {}) {
		let { format: t } = e;
		return Km(x, t, d).map((e, t) => {
			let n = t + 1;
			return {
				label: e,
				value: n,
				disabled: km(d.set({ month: n }), y, b)
			};
		});
	}
	function ce() {
		return Jm(Zm(d, y, b)).map((e) => ({
			label: e.toString(),
			value: e,
			disabled: !ct(e, y?.year, b?.year)
		}));
	}
	function le(e) {
		return Om(e, ne, x, y, b);
	}
	function ue(e) {
		let t = c ?? th(ee, d.calendar);
		a({
			type: "FOCUS.SET",
			value: t.set({ month: e })
		});
	}
	function A(e) {
		let t = c ?? th(ee, d.calendar);
		a({
			type: "FOCUS.SET",
			value: t.set({ year: e })
		});
	}
	function j(e) {
		let { value: t, disabled: n } = e, r = d.set({ year: t }), i = !eh(c.year, { strict: !0 }).includes(t), a = ct(t, y?.year, b?.year), o = w && Kh(r, u), s = w && u[0] && ll(r, u[0]), l = w && u[1] && ll(r, u[1]), f = w && p.length > 0, m = f && Kh(r, p), h = f && p[0] && ll(r, p[0]), g = f && p[1] && ll(r, p[1]), _ = {
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
	function M(e) {
		let { value: t, disabled: n } = e, r = d.set({ month: t }), i = Im(x, ee, d), a = w && Kh(r, u), o = w && u[0] && cl(r, u[0]), s = w && u[1] && cl(r, u[1]), c = w && p.length > 0, l = c && Kh(r, p), f = c && p[0] && cl(r, p[0]), m = c && p[1] && cl(r, p[1]), h = {
			focused: d.month === e.value,
			selectable: !km(r, y, b),
			selected: !!u.find((e) => e && e.month === t && e.year === d.year),
			valueText: i.format(r.toDate(ee)),
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
	function N(e) {
		let { value: t, disabled: n, visibleRange: r = o("visibleRange") } = e, a = Fm(x, ee, d), s = Mm(o("visibleDuration")), c = i("outsideDaySelectable"), l = r.start.add(s).subtract({ days: 1 }), f = km(t, r.start, l), m = w && Kh(t, u), h = w && u[0] && il(t, u[0]), g = w && u[1] && il(t, u[1]), _ = w && p.length > 0, v = _ && Kh(t, p), S = _ && p[0] && il(t, p[0]), te = _ && p[1] && il(t, p[1]), C = u.some((e) => e != null && il(t, e)), T = {
			invalid: km(t, y, b),
			disabled: n || !c && f || km(t, y, b) || re && !C,
			selected: C,
			unavailable: Om(t, ne, x, y, b) && !n,
			outsideRange: f,
			today: dl(t, ee),
			weekend: Ll(t, x),
			value: t,
			valueText: a.format(t.toDate(ee)),
			get focused() {
				return d != null && il(t, d) && (!T.outsideRange || c);
			},
			get selectable() {
				return !T.disabled && !T.unavailable;
			},
			inRange: m || v,
			firstInRange: h,
			lastInRange: g,
			inHoveredRange: v,
			firstInHoveredRange: S,
			lastInHoveredRange: te
		};
		return T;
	}
	function de(e) {
		let { view: t = "day", id: n } = e;
		return [t, n].filter(Boolean).join(" ");
	}
	return {
		focused: te,
		open: C,
		disabled: m,
		invalid: g,
		readOnly: h,
		inline: !!i("inline"),
		numOfMonths: i("numOfMonths"),
		showWeekNumbers: !!i("showWeekNumbers"),
		selectionMode: i("selectionMode"),
		maxSelectedDates: E,
		isMaxSelected: re,
		view: r.get("view"),
		getRangePresetValue(e) {
			return bh(e, x, ee);
		},
		getWeekNumber(e) {
			let t = e[0];
			return t ? qm(t, x) : 0;
		},
		getDaysInWeek(e, t = c) {
			return Hm(e, t, x, S);
		},
		getOffset(e) {
			let t = c.add(e), n = l.add(e), r = Im(x, ee, d);
			return {
				visibleRange: {
					start: t,
					end: n
				},
				weeks: oe(t),
				visibleRangeText: {
					start: r.format(t.toDate(ee)),
					end: r.format(n.toDate(ee))
				}
			};
		},
		getMonthWeeks: oe,
		isUnavailable: le,
		weeks: oe(),
		weekDays: Gm(c, S, ee, x),
		visibleRangeText: o("visibleRangeText"),
		value: u,
		valueAsDate: u.filter((e) => e != null).map((e) => e.toDate(ee)),
		valueAsString: o("valueAsString"),
		focusedValue: d,
		focusedValueAsDate: d?.toDate(ee),
		focusedValueAsString: i("format")(d, {
			locale: x,
			timeZone: ee
		}),
		visibleRange: o("visibleRange"),
		selectToday() {
			let e = Tm(th(ee, d.calendar), y, b);
			a({
				type: "VALUE.SET",
				value: [e]
			});
		},
		setValue(e) {
			let t = e.map((e) => Tm(e, y, b));
			a({
				type: "VALUE.SET",
				value: t
			});
		},
		setTime(e, t = 0) {
			let n = Array.from(u), r = n[t];
			r && ("hour" in r || (r = Xl(r)), r = r.set({
				hour: e.hour ?? ("hour" in r ? r.hour : 0),
				minute: e.minute ?? ("minute" in r ? r.minute : 0),
				second: e.second ?? ("second" in r ? r.second : 0),
				millisecond: e.millisecond ?? ("millisecond" in r ? r.millisecond : 0)
			}), n[t] = Tm(r, y, b), a({
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
		focusMonth: ue,
		focusYear: A,
		getYears: ce,
		getMonths: se,
		getYearsGrid(e = {}) {
			let { columns: t = 1 } = e, n = eh(c.year, { strict: !0 }).map((e) => ({
				label: e.toString(),
				value: e,
				disabled: !ct(e, y?.year, b?.year)
			}));
			return Fe(n, t);
		},
		getDecade() {
			let e = eh(c.year, { strict: !0 });
			return {
				start: e.at(0),
				end: e.at(-1)
			};
		},
		getMonthsGrid(e = {}) {
			let { columns: t = 1, format: n } = e;
			return Fe(se({ format: n }), t);
		},
		format(e, t = {
			month: "long",
			year: "numeric"
		}) {
			return new Lu(x, {
				...t,
				calendar: e.calendar.identifier
			}).format(e.toDate(ee));
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
				...bm.root.attrs,
				dir: i("dir"),
				id: Sh(s),
				"data-state": C ? "open" : "closed",
				"data-disabled": Z(m),
				"data-readonly": Z(h),
				"data-empty": Z(v)
			});
		},
		getLabelProps(e = {}) {
			let { index: n = 0 } = e;
			return t.label({
				...bm.label.attrs,
				id: xh(s, n),
				dir: i("dir"),
				htmlFor: jh(s, n),
				"data-state": C ? "open" : "closed",
				"data-index": n,
				"data-disabled": Z(m),
				"data-readonly": Z(h)
			});
		},
		getControlProps() {
			return t.element({
				...bm.control.attrs,
				dir: i("dir"),
				id: Ah(s),
				"data-disabled": Z(m),
				"data-placeholder-shown": Z(v)
			});
		},
		getRangeTextProps() {
			return t.element({
				...bm.rangeText.attrs,
				dir: i("dir")
			});
		},
		getContentProps() {
			return t.element({
				...bm.content.attrs,
				hidden: !C,
				dir: i("dir"),
				"data-state": C ? "open" : "closed",
				"data-placement": ie,
				"data-side": D,
				"data-inline": Z(i("inline")),
				id: wh(s),
				tabIndex: -1,
				role: "application",
				"aria-roledescription": "datepicker",
				"aria-label": k.content
			});
		},
		getTableProps(e = {}) {
			let { view: n = "day", columns: r = n === "day" ? 7 : 4 } = e, o = de(e);
			return t.element({
				...bm.table.attrs,
				role: "grid",
				"data-columns": r,
				"aria-roledescription": Jh(n),
				id: Ch(s, o),
				"aria-readonly": ln(h),
				"aria-disabled": ln(m),
				"aria-multiselectable": ln(i("selectionMode") !== "single"),
				"data-view": n,
				dir: i("dir"),
				tabIndex: -1,
				onKeyDown(e) {
					if (e.defaultPrevented || m) return;
					let t = {
						Enter() {
							_ && (n === "day" && le(d) || (n !== "month" || M({ value: d.month }).selectable) && (n !== "year" || j({ value: d.year }).selectable) && a({
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
					}[at(e, { dir: i("dir") })];
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
				...bm.tableHead.attrs,
				"aria-hidden": !0,
				dir: i("dir"),
				"data-view": n,
				"data-disabled": Z(m)
			});
		},
		getTableHeaderProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...bm.tableHeader.attrs,
				dir: i("dir"),
				"data-view": n,
				"data-disabled": Z(m)
			});
		},
		getTableBodyProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...bm.tableBody.attrs,
				"data-view": n,
				"data-disabled": Z(m)
			});
		},
		getTableRowProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...bm.tableRow.attrs,
				"aria-disabled": ln(m),
				"data-disabled": Z(m),
				"data-view": n
			});
		},
		getWeekNumberHeaderCellProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...bm.tableCell.attrs,
				scope: "col",
				"aria-label": k.weekColumnHeader,
				"data-view": n,
				"data-type": "week-number",
				"data-disabled": Z(m)
			});
		},
		getWeekNumberCellProps(e) {
			let { weekIndex: n, week: r } = e, i = r[0] ? qm(r[0], x) : 0;
			return t.element({
				...bm.tableCell.attrs,
				role: "rowheader",
				"aria-label": k.weekNumberCell?.(i),
				"data-view": "day",
				"data-week-index": n,
				"data-type": "week-number",
				"data-disabled": Z(m)
			});
		},
		getDayTableCellState: N,
		getDayTableCellProps(e) {
			let { value: n } = e, r = N(e);
			return t.element({
				...bm.tableCell.attrs,
				role: "gridcell",
				"aria-disabled": ln(!r.selectable),
				"aria-selected": r.selected || r.inRange,
				"aria-invalid": ln(r.invalid),
				"aria-current": r.today ? "date" : void 0,
				"data-value": n.toString()
			});
		},
		getDayTableCellTriggerProps(e) {
			let { value: n } = e, r = N(e);
			return t.element({
				...bm.tableCellTrigger.attrs,
				id: Th(s, n.toString()),
				role: "button",
				dir: i("dir"),
				tabIndex: m ? -1 : r.focused ? 0 : -1,
				"aria-label": k.dayCell(r),
				"aria-disabled": ln(!r.selectable),
				"aria-invalid": ln(r.invalid),
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
				onPointerMove: w ? (e) => {
					if (e.pointerType === "touch" || !r.selectable) return;
					let t = !s.isActiveElement(e.currentTarget);
					f && sl(n, f) || a({
						type: "CELL.POINTER_MOVE",
						cell: "day",
						value: n,
						focus: t,
						outsideRange: r.outsideRange
					});
				} : void 0
			});
		},
		getMonthTableCellState: M,
		getMonthTableCellProps(e) {
			let { value: n, columns: r } = e, a = M(e);
			return t.element({
				...bm.tableCell.attrs,
				dir: i("dir"),
				colSpan: r,
				role: "gridcell",
				"aria-selected": ln(a.selected || a.inRange),
				"data-selected": Z(a.selected),
				"aria-disabled": ln(!a.selectable),
				"data-value": n
			});
		},
		getMonthTableCellTriggerProps(e) {
			let { value: n } = e, r = M(e);
			return t.element({
				...bm.tableCellTrigger.attrs,
				id: Th(s, n.toString()),
				role: "button",
				dir: i("dir"),
				tabIndex: m ? -1 : r.focused ? 0 : -1,
				"aria-label": r.valueText,
				"aria-disabled": ln(!r.selectable),
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
				onPointerMove: w ? (e) => {
					if (e.pointerType === "touch" || !r.selectable) return;
					let t = !s.isActiveElement(e.currentTarget);
					f && r.value && cl(r.value, f) || a({
						type: "CELL.POINTER_MOVE",
						cell: "month",
						value: r.value,
						focus: t
					});
				} : void 0
			});
		},
		getYearTableCellState: j,
		getYearTableCellProps(e) {
			let { value: n, columns: r } = e, a = j(e);
			return t.element({
				...bm.tableCell.attrs,
				dir: i("dir"),
				colSpan: r,
				role: "gridcell",
				"aria-selected": ln(a.selected || a.inRange),
				"data-selected": Z(a.selected),
				"aria-disabled": ln(!a.selectable),
				"data-value": n
			});
		},
		getYearTableCellTriggerProps(e) {
			let { value: n } = e, r = j(e);
			return t.element({
				...bm.tableCellTrigger.attrs,
				id: Th(s, n.toString()),
				role: "button",
				dir: i("dir"),
				tabIndex: m ? -1 : r.focused ? 0 : -1,
				"aria-label": r.valueText,
				"aria-disabled": ln(!r.selectable),
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
				onPointerMove: w ? (e) => {
					if (e.pointerType === "touch" || !r.selectable) return;
					let t = !s.isActiveElement(e.currentTarget);
					f && r.value && ll(r.value, f) || a({
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
				...bm.nextTrigger.attrs,
				dir: i("dir"),
				id: Dh(s, n),
				type: "button",
				"aria-label": k.nextTrigger(n),
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
				...bm.prevTrigger.attrs,
				dir: i("dir"),
				id: Eh(s, n),
				type: "button",
				"aria-label": k.prevTrigger(n),
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
				...bm.clearTrigger.attrs,
				id: kh(s),
				dir: i("dir"),
				type: "button",
				"aria-label": k.clearTrigger,
				hidden: !u.length,
				onClick(e) {
					e.defaultPrevented || _ && a({ type: "VALUE.CLEAR" });
				}
			});
		},
		getTriggerProps() {
			return t.button({
				...bm.trigger.attrs,
				id: Mh(s),
				dir: i("dir"),
				type: "button",
				"data-placement": ie,
				"data-side": D,
				"aria-label": k.trigger(C),
				"aria-controls": wh(s),
				"aria-expanded": C,
				"data-state": C ? "open" : "closed",
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
				...bm.view.attrs,
				"data-view": n,
				hidden: r.get("view") !== n
			});
		},
		getViewTriggerProps(e = {}) {
			let { view: n = "day" } = e, r = ig(n, i("minView"), i("maxView")), o = r !== n, c = m || !o;
			return t.button({
				...bm.viewTrigger.attrs,
				"data-view": n,
				dir: i("dir"),
				id: Oh(s, n),
				type: "button",
				disabled: c,
				"data-disabled": Z(c),
				"aria-label": k.viewTrigger(n, o ? r : void 0),
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
				...bm.viewControl.attrs,
				"data-view": n,
				dir: i("dir")
			});
		},
		getInputProps(e = {}) {
			let { index: n = 0, fixOnBlur: r = !0 } = e;
			return t.input({
				...bm.input.attrs,
				id: jh(s, n),
				autoComplete: "off",
				autoCorrect: "off",
				spellCheck: "false",
				dir: i("dir"),
				name: i("name"),
				"data-index": n,
				"data-state": C ? "open" : "closed",
				"data-placeholder-shown": Z(v),
				readOnly: h,
				disabled: m,
				required: i("required"),
				"aria-invalid": ln(g),
				"data-invalid": Z(g),
				placeholder: i("placeholder") || Xh(x),
				defaultValue: o("valueAsString")[n],
				onBeforeInput(e) {
					let { data: t } = Ze(e);
					uh(t, ae, x) || e.preventDefault();
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
						rt(e) || le(d) || e.currentTarget.value.trim() !== "" && a({
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
						value: dh(t, ae, x),
						index: n
					});
				}
			});
		},
		getMonthSelectProps() {
			return t.select({
				...bm.monthSelect.attrs,
				id: Ph(s),
				"aria-label": k.monthSelect,
				disabled: m,
				dir: i("dir"),
				defaultValue: c.month,
				onChange(e) {
					ue(Number(e.currentTarget.value));
				}
			});
		},
		getYearSelectProps() {
			return t.select({
				...bm.yearSelect.attrs,
				id: Fh(s),
				disabled: m,
				"aria-label": k.yearSelect,
				dir: i("dir"),
				defaultValue: c.year,
				onChange(e) {
					A(Number(e.currentTarget.value));
				}
			});
		},
		getPositionerProps() {
			return t.element({
				id: Nh(s),
				...bm.positioner.attrs,
				dir: i("dir"),
				style: O.floating
			});
		},
		getPresetTriggerProps(e) {
			let n = Array.isArray(e.value) ? e.value : bh(e.value, x, ee), r = n.filter((e) => e != null).map((e) => e.toDate(ee).toDateString());
			return t.button({
				...bm.presetTrigger.attrs,
				"aria-label": k.presetTrigger(r),
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
var { and: ug } = Ln();
function dg(e, t) {
	if (e?.length !== t?.length) return !1;
	let n = Math.max(e.length, t.length);
	for (let r = 0; r < n; r++) if (!Dm(e[r], t[r])) return !1;
	return !0;
}
function fg(e, t) {
	return e.map((e) => e == null ? "" : t("format")(e, {
		locale: t("locale"),
		timeZone: t("timeZone")
	}));
}
var pg = zt({
	props({ props: e }) {
		let t = e.locale || "en-US", n = e.timeZone || "UTC", r = e.selectionMode || "single", i = e.numOfMonths || 1, a;
		if (e.createCalendar) {
			let n = new Intl.DateTimeFormat(t).resolvedOptions().calendar;
			n !== "gregory" && n !== "iso8601" && (a = e.createCalendar(n));
		}
		let o = (e) => !a || e.calendar.identifier === a.identifier ? e : Zl(e, a), s = e.defaultValue ? qh(e.defaultValue).map((t) => Tm(o(t), e.min, e.max)) : void 0, c = e.value ? qh(e.value).map((t) => Tm(o(t), e.min, e.max)) : void 0, l = e.focusedValue || e.defaultFocusedValue || c?.[0] || s?.[0] || th(n, a);
		l = Tm(o(l), e.min, e.max);
		let u = e.minView || "day", d = e.maxView || "year", f = tg(e.defaultView || e.view || u, u, d);
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
				return new Lu(t, {
					timeZone: n,
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
					calendar: a?.identifier
				}).format(e.toDate(n));
			},
			parse(e, { locale: t, timeZone: n }) {
				return _h(e, t, n);
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
				isEqual: Dm,
				hash: (e) => e.toString(),
				sync: !0,
				onChange(t) {
					let r = n(), i = r.get("view"), a = r.get("value"), o = fg(a, e);
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
				isEqual: dg,
				hash: (e) => e.map((e) => e?.toString() ?? "").join(","),
				onChange(t) {
					let r = n(), i = fg(t, e);
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
				isEqual: Dm
			})),
			view: t(() => ({
				defaultValue: e("defaultView"),
				value: e("view"),
				onChange(t) {
					e("onViewChange")?.({ view: t });
				}
			})),
			startValue: t(() => ({
				defaultValue: Em(e("focusedValue") || e("defaultFocusedValue"), "start", { months: e("numOfMonths") }, e("locale")),
				isEqual: Dm,
				hash: (e) => e.toString()
			})),
			currentPlacement: t(() => ({ defaultValue: void 0 })),
			restoreFocus: t(() => ({ defaultValue: !1 }))
		};
	},
	computed: {
		isInteractive: ({ prop: e }) => !e("disabled") && !e("readOnly"),
		visibleDuration: ({ prop: e }) => ({ months: e("numOfMonths") }),
		endValue: ({ context: e, computed: t }) => Nm(e.get("startValue"), t("visibleDuration")),
		visibleRange: ({ context: e, computed: t }) => ({
			start: e.get("startValue"),
			end: t("endValue")
		}),
		visibleRangeText: ({ context: e, prop: t, computed: n }) => cg({
			view: e.get("view"),
			startValue: e.get("startValue"),
			endValue: n("endValue"),
			locale: t("locale"),
			timeZone: t("timeZone"),
			selectionMode: t("selectionMode")
		}),
		isPrevVisibleRangeValid: ({ context: e, prop: t }) => !Am(e.get("startValue"), t("min"), t("max")),
		isNextVisibleRangeValid: ({ prop: e, computed: t }) => !jm(t("endValue"), e("min"), e("max")),
		valueAsString: ({ context: e, prop: t }) => fg(e.get("value"), t)
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
						guard: ug("shouldRestoreFocus", "isInteractOutsideEvent"),
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
						guard: ug("isRangePicker", "hasSelectedRange"),
						actions: [
							"setActiveIndexToStart",
							"resetSelection",
							"setActiveIndexToEnd"
						]
					},
					{
						guard: ug("isRangePicker", "isSelectingEndDate", "closeOnSelect", "isOpenControlled"),
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
						guard: ug("isRangePicker", "isSelectingEndDate", "closeOnSelect"),
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
						guard: ug("isRangePicker", "isSelectingEndDate"),
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
						guard: ug("isMultiPicker", "canSelectDate"),
						actions: ["setFocusedDate", "toggleSelectedDate"]
					},
					{
						guard: "isMultiPicker",
						actions: ["setFocusedDate"]
					},
					{
						guard: ug("closeOnSelect", "isOpenControlled"),
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
					guard: ug("isRangePicker", "isSelectingEndDate", "isDayPointerMoveOutsideVisibleMonth"),
					actions: ["setHoveredDate"]
				}, {
					guard: ug("isRangePicker", "isSelectingEndDate"),
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
						guard: ug("isRangePicker", "hasSelectedRange"),
						actions: [
							"setActiveIndexToStart",
							"resetSelection",
							"setActiveIndexToEnd",
							"focusNextDay"
						]
					},
					{
						guard: ug("isRangePicker", "isSelectingEndDate", "closeOnSelect", "isOpenControlled"),
						actions: [
							"setSelectedDate",
							"setActiveIndexToStart",
							"clearHoveredDate",
							"invokeOnClose"
						]
					},
					{
						guard: ug("isRangePicker", "isSelectingEndDate", "closeOnSelect"),
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
						guard: ug("isRangePicker", "isSelectingEndDate"),
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
						guard: ug("isMultiPicker", "canSelectDate"),
						actions: ["toggleSelectedDate"]
					},
					{ guard: "isMultiPicker" },
					{
						guard: ug("closeOnSelect", "isOpenControlled"),
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
			isAboveMinView: ({ context: e, prop: t }) => ng(e.get("view"), t("minView")),
			isDayView: ({ context: e, event: t }) => (t.view || e.get("view")) === "day",
			isMonthView: ({ context: e, event: t }) => (t.view || e.get("view")) === "month",
			isYearView: ({ context: e, event: t }) => (t.view || e.get("view")) === "year",
			isRangePicker: ({ prop: e }) => e("selectionMode") === "range",
			hasSelectedRange: ({ context: e }) => e.get("value").length === 2,
			isMultiPicker: ({ prop: e }) => e("selectionMode") === "multiple",
			canSelectDate: (e) => {
				let { context: t, prop: n, event: r } = e, i = n("maxSelectedDates");
				if (i == null) return !0;
				let a = t.get("value"), o = mg(e, r.value ?? t.get("focusedValue"));
				return a.some((e) => Dm(e, o)) ? !0 : a.length < i;
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
				return t("inline") ? void 0 : (e.get("currentPlacement") || e.set("currentPlacement", t("positioning").placement), fs(Wh(n), () => Uh(n), {
					...t("positioning"),
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				}));
			},
			setupLiveRegion({ scope: e, refs: t }) {
				let n = e.getDoc();
				return t.set("announcer", gc({
					level: "assertive",
					document: n
				})), () => t.get("announcer")?.destroy?.();
			},
			trackDismissableElement({ scope: e, send: t, context: n, prop: r }) {
				return r("inline") ? void 0 : dc(() => Rh(e), {
					type: "popover",
					defer: !0,
					layerStyleTargets: [() => Uh(e)],
					exclude: [
						...zh(e),
						Lh(e),
						Hh(e)
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
				let n = ig(e.get("view"), t("minView"), t("maxView"));
				e.set("view", n);
			},
			setPreviousView({ context: e, prop: t }) {
				let n = ag(e.get("view"), t("minView"), t("maxView"));
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
					o = e && t ? Rm(e, t, i, a) : e ? Rm(e, null, i, a) : t ? Rm(t, null, i, a) : "";
				} else o = r.map((e) => Rm(e, null, i, a)).filter(Boolean).join(",");
				n.get("announcer")?.announce(o, 3e3);
			},
			announceVisibleRange({ computed: e, refs: t }) {
				let { formatted: n } = e("visibleRangeText");
				t.get("announcer")?.announce(n);
			},
			disableTextSelection({ scope: e }) {
				yt({
					target: Rh(e),
					doc: e.getDoc()
				});
			},
			enableTextSelection({ scope: e }) {
				Ue({
					doc: e.getDoc(),
					target: Rh(e)
				});
			},
			focusFirstSelectedDate(e) {
				let { context: t } = e;
				t.get("value").length && gg(e, t.get("value")[0]);
			},
			syncInputElement({ scope: e, computed: t }) {
				Y(() => {
					zh(e).forEach((e, n) => {
						qi(e, t("valueAsString")[n] || "");
					});
				});
			},
			setFocusedDate(e) {
				let { event: t } = e;
				gg(e, Array.isArray(t.value) ? t.value[0] : t.value);
			},
			setFocusedValueForView(e) {
				let { context: t, event: n } = e;
				gg(e, t.get("focusedValue").set({ [t.get("view")]: n.value }));
			},
			focusNextMonth(e) {
				let { context: t } = e;
				gg(e, t.get("focusedValue").add({ months: 1 }));
			},
			focusPreviousMonth(e) {
				let { context: t } = e;
				gg(e, t.get("focusedValue").subtract({ months: 1 }));
			},
			setDateValue({ context: e, event: t, prop: n }) {
				if (!Array.isArray(t.value)) return;
				let r = t.value.map((e) => Tm(e, n("min"), n("max")));
				e.set("value", r);
			},
			clearDateValue({ context: e }) {
				e.set("value", []);
			},
			setSelectedDate(e) {
				let { context: t, event: n } = e, r = Array.from(t.get("value")), i = t.get("activeIndex"), a = r[i];
				r[i] = hg(a, mg(e, n.value ?? t.get("focusedValue"))), t.set("value", Gh(r));
			},
			resetSelection(e) {
				let { context: t, event: n } = e, r = t.get("value")[0], i = mg(e, n.value ?? t.get("focusedValue"));
				t.set("value", [hg(r, i)]);
			},
			toggleSelectedDate(e) {
				let { context: t, event: n } = e, r = mg(e, n.value ?? t.get("focusedValue")), i = t.get("value"), a = i.findIndex((e) => Dm(e, r));
				if (a === -1) {
					let e = [...i, r];
					t.set("value", qh(e));
				} else {
					let e = Array.from(i);
					e.splice(a, 1), t.set("value", qh(e));
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
				n[r] = hg(i, e.get("focusedValue").copy()), e.set("value", Gh(n));
				let a = t("valueAsString");
				e.set("inputValue", a[r]);
			},
			focusPreviousDay(e) {
				let { context: t } = e;
				gg(e, t.get("focusedValue").subtract({ days: 1 }));
			},
			focusNextDay(e) {
				let { context: t } = e;
				gg(e, t.get("focusedValue").add({ days: 1 }));
			},
			focusPreviousWeek(e) {
				let { context: t } = e;
				gg(e, t.get("focusedValue").subtract({ weeks: 1 }));
			},
			focusNextWeek(e) {
				let { context: t } = e;
				gg(e, t.get("focusedValue").add({ weeks: 1 }));
			},
			focusNextPage(e) {
				let { context: t, computed: n, prop: r } = e;
				_g(e, rh(t.get("focusedValue"), t.get("startValue"), n("visibleDuration"), r("locale"), r("min"), r("max")));
			},
			focusPreviousPage(e) {
				let { context: t, computed: n, prop: r } = e;
				_g(e, ih(t.get("focusedValue"), t.get("startValue"), n("visibleDuration"), r("locale"), r("min"), r("max")));
			},
			focusSectionStart(e) {
				let { context: t } = e;
				gg(e, t.get("startValue").copy());
			},
			focusSectionEnd(e) {
				let { computed: t } = e;
				gg(e, t("endValue").copy());
			},
			focusNextSection(e) {
				let { context: t, event: n, computed: r, prop: i } = e, a = ah(t.get("focusedValue"), t.get("startValue"), n.larger, r("visibleDuration"), i("locale"), i("min"), i("max"));
				a && _g(e, a);
			},
			focusPreviousSection(e) {
				let { context: t, event: n, computed: r, prop: i } = e, a = oh(t.get("focusedValue"), t.get("startValue"), n.larger, r("visibleDuration"), i("locale"), i("min"), i("max"));
				a && _g(e, a);
			},
			focusNextYear(e) {
				let { context: t } = e;
				gg(e, t.get("focusedValue").add({ years: 1 }));
			},
			focusPreviousYear(e) {
				let { context: t } = e;
				gg(e, t.get("focusedValue").subtract({ years: 1 }));
			},
			focusNextDecade(e) {
				let { context: t } = e;
				gg(e, t.get("focusedValue").add({ years: 10 }));
			},
			focusPreviousDecade(e) {
				let { context: t } = e;
				gg(e, t.get("focusedValue").subtract({ years: 10 }));
			},
			clearFocusedDate(e) {
				let { context: t, prop: n } = e, r = t.get("focusedValue").calendar;
				gg(e, th(n("timeZone"), r));
			},
			focusPreviousMonthColumn(e) {
				let { context: t, event: n } = e;
				gg(e, t.get("focusedValue").subtract({ months: n.columns }));
			},
			focusNextMonthColumn(e) {
				let { context: t, event: n } = e;
				gg(e, t.get("focusedValue").add({ months: n.columns }));
			},
			focusPreviousYearColumn(e) {
				let { context: t, event: n } = e;
				gg(e, t.get("focusedValue").subtract({ years: n.columns }));
			},
			focusNextYearColumn(e) {
				let { context: t, event: n } = e;
				gg(e, t.get("focusedValue").add({ years: n.columns }));
			},
			focusFirstMonth(e) {
				let { context: t } = e, n = t.get("focusedValue"), r = n.calendar.getMinimumMonthInYear?.(n) ?? 1;
				gg(e, n.set({ month: r }));
			},
			focusLastMonth(e) {
				let { context: t } = e, n = t.get("focusedValue"), r = n.calendar.getMonthsInYear(n);
				gg(e, n.set({ month: r }));
			},
			focusFirstYear(e) {
				let { context: t } = e, n = eh(t.get("focusedValue").year);
				gg(e, t.get("focusedValue").set({ year: n[0] }));
			},
			focusLastYear(e) {
				let { context: t } = e, n = eh(t.get("focusedValue").year);
				gg(e, t.get("focusedValue").set({ year: n[n.length - 1] }));
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
				n.src !== "input.click" && Y(() => {
					Ih(e, t.get("view"))?.focus({ preventScroll: !0 });
				});
			},
			focusActiveCellIfNeeded({ scope: e, context: t, event: n }) {
				n.focus && Y(() => {
					Ih(e, t.get("view"))?.focus({ preventScroll: !0 });
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
				Y(() => {
					Lh(e)?.focus({ preventScroll: !0 });
				});
			},
			focusFirstInputElement({ scope: e, event: t }) {
				t.focus !== !1 && Y(() => {
					let [t] = zh(e);
					(t ?? Lh(e))?.focus({ preventScroll: !0 });
				});
			},
			focusInputElement({ scope: e }) {
				Y(() => {
					let t = zh(e);
					if (t.length === 0) {
						Lh(e)?.focus({ preventScroll: !0 });
						return;
					}
					let n = t.findLastIndex((e) => e.value !== ""), r = t[Math.max(n, 0)];
					r?.focus({ preventScroll: !0 }), r?.setSelectionRange(r.value.length, r.value.length);
				});
			},
			syncMonthSelectElement({ scope: e, context: t }) {
				qi(Vh(e), t.get("startValue").month.toString());
			},
			syncYearSelectElement({ scope: e, context: t }) {
				qi(Bh(e), t.get("startValue").year.toString());
			},
			setInputValue({ context: e, event: t }) {
				e.get("activeIndex") === t.index && e.set("inputValue", t.value);
			},
			syncInputValue({ scope: e, context: t, event: n }) {
				queueMicrotask(() => {
					qi(zh(e)[n.index ?? t.get("activeIndex")], t.get("inputValue"));
				});
			},
			focusParsedDate(e) {
				let { event: t, prop: n } = e;
				if (t.index == null) return;
				let r = n("parse")(t.value, {
					locale: n("locale"),
					timeZone: n("timeZone")
				});
				r && Zh(r) && gg(e, r);
			},
			selectParsedDate({ context: e, event: t, prop: n }) {
				if (t.index == null) return;
				let r = n("parse")(t.value, {
					locale: n("locale"),
					timeZone: n("timeZone")
				});
				if ((!r || !Zh(r)) && t.value && (r = e.get("focusedValue").copy()), !r) return;
				r = Tm(r, n("min"), n("max"));
				let i = Array.from(e.get("value"));
				i[t.index] = hg(i[t.index], r);
				let a = Gh(i);
				e.set("value", a);
				let o = fg(a, n);
				e.set("inputValue", o[t.index]);
			},
			resetView({ context: e }) {
				e.set("view", e.initial("view"));
			},
			setStartValue({ context: e, computed: t, prop: n }) {
				let r = e.get("focusedValue");
				if (!km(r, e.get("startValue"), t("endValue"))) return;
				let i = Em(r, "start", { months: n("numOfMonths") }, n("locale"));
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
}), mg = (e, t) => {
	let { context: n, prop: r } = e, i = n.get("view"), a = typeof t == "number" ? n.get("focusedValue").set({ [i]: t }) : t;
	return sg((e) => {
		rg(e, r("minView")) && (a = a.set({ [e]: +(e === "day") }));
	}), a;
}, hg = (e, t) => {
	if (!e || !("hour" in e)) return t;
	let n = "timeZone" in e, r = t;
	return "hour" in t || (r = n ? Ql(Xl(t), e.timeZone) : Xl(t)), r.set({
		hour: e.hour,
		minute: e.minute,
		second: e.second,
		millisecond: e.millisecond
	});
};
function gg(e, t) {
	let { context: n, prop: r, computed: i } = e;
	if (!t) return;
	let a = mg(e, t);
	if (Dm(n.get("focusedValue"), a)) return;
	let o = nh(i("visibleDuration"), r("locale"), r("min"), r("max"))({
		focusedDate: a,
		startDate: n.get("startValue")
	});
	n.set("startValue", o.startDate), n.set("focusedValue", o.focusedDate);
}
function _g(e, t) {
	let { context: n } = e;
	n.set("startValue", t.startDate), !Dm(n.get("focusedValue"), t.focusedDate) && n.set("focusedValue", t.focusedDate);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-picker@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-picker/dist/date-picker.parse.mjs
function vg(e) {
	return Array.isArray(e) ? e.map((e) => vg(e)) : e instanceof Date ? new Nu(e.getFullYear(), e.getMonth() + 1, e.getDate()) : Tu(e);
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-context.js
var [yg, bg] = an({
	name: "DatePickerContext",
	hookName: "useDatePickerContext",
	providerName: "<DatePickerProvider />"
}), xg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Sg(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, xg), i = bg(), a = y(() => X(i().getClearTriggerProps(), r));
	return Q(e, J({ as: "button" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(Sg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-content.svelte
var Cg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function wg(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, Cg), i = bg(), a = co(), o = y(() => X(i().getContentProps(), a().getPresenceProps(), r));
	function s(e) {
		a().setNode(e);
	}
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	}, l = P(), u = G(l), d = (e) => {
		Q(e, J({ as: "div" }, () => z(o), {
			[de()]: s,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = y(() => !a().unmounted);
	return M(u, (e) => {
		z(f) && e(d);
	}), F(e, l), x(c);
}
H(wg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-context.svelte
function Tg(e, t) {
	k(t, !0);
	let n = L(t, "render", 7), r = bg();
	var i = {
		get render() {
			return n();
		},
		set render(e) {
			n(e), A();
		}
	}, a = P(), o = G(a);
	return Se(o, n, () => r), F(e, a), x(i);
}
H(Tg, { render: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-control.svelte
var Eg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Dg(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, Eg), i = bg(), a = y(() => X(i().getControlProps(), r));
	return Q(e, J({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(Dg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-view-props-context.js
var [Og, kg] = an({
	name: "DatePickerViewPropsContext",
	hookName: "useDatePickerViewPropsContext",
	providerName: "<DatePickerViewPropsProvider />"
}), Ag = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function jg(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, Ag), i = bg(), a = kg(), o = y(() => X(i().getNextTriggerProps(a()), r));
	return Q(e, J({ as: "button" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(jg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-positioner.svelte
var Mg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Ng(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, Mg), i = bg(), a = co(), o = y(() => X(i().getPositionerProps(), r));
	var s = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	}, c = P(), l = G(c), u = (e) => {
		Q(e, J({ as: "div" }, () => z(o), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, d = y(() => !a().unmounted);
	return M(l, (e) => {
		z(d) && e(u);
	}), F(e, c), x(s);
}
H(Ng, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-prev-trigger.svelte
var Pg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Fg(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, Pg), i = bg(), a = kg(), o = y(() => X(i().getPrevTriggerProps(a()), r));
	return Q(e, J({ as: "button" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(Fg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-range-text.svelte
var Ig = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Lg(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, Ig), i = bg(), a = y(() => X(i().getRangeTextProps(), r)), o = y(() => {
		let { start: e, end: t } = i().visibleRangeText;
		return on([e, t]).filter(Boolean).join(" - ");
	});
	return Q(e, J({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		},
		children: (e, t) => {
			ie();
			var n = he();
			W(() => T(n, z(o))), F(e, n);
		},
		$$slots: { default: !0 }
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(Lg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker.svelte.js
var Rg = (e) => {
	let t = pn(), n = Zt(), r = y(() => {
		let r = Xe(e);
		return {
			dir: n().dir,
			locale: n().locale,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = Ut(pg, () => z(r)), a = y(() => lg(i, gn));
	return () => z(a);
}, zg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"value"
]);
function Bg(e, t) {
	k(t, !0);
	let n = L(t, "value", 7), r = K(t, zg), i = y(() => oo(r)), a = y(() => w(z(i), 2)), o = y(() => z(a)[0]), s = y(() => z(a)[1]), c = ao(() => ({
		present: n()().open,
		...z(o)
	})), l = y(() => X(n()().getRootProps(), z(s)));
	return yg(() => n()()), so(c), Q(e, J({ as: "div" }, () => z(l))), x({
		get value() {
			return n();
		},
		set value(e) {
			n(e), A();
		}
	});
}
H(Bg, { value: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-table-props-context.js
var [Vg, Hg] = an({
	name: "DatePickerTablePropsContext",
	hookName: "useDatePickerTablePropsContext",
	providerName: "<DatePickerTablePropsProvider />"
}), Ug = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"columns"
]);
function Wg(e, t) {
	let n = g();
	k(t, !0);
	let r = L(t, "columns", 7), i = K(t, Ug), a = bg(), o = kg(), s = y(() => ({
		id: n,
		columns: r(),
		...o()
	})), c = y(() => X(a().getTableProps(z(s)), i));
	return Vg(() => z(s)), Q(e, J({ as: "table" }, () => z(c))), x({
		get columns() {
			return r();
		},
		set columns(e) {
			r(e), A();
		}
	});
}
H(Wg, { columns: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-body.svelte
var Gg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Kg(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, Gg), i = bg(), a = y(() => X(i().getTableBodyProps(), r));
	return Q(e, J({ as: "tbody" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(Kg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-head.svelte
var qg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Jg(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, qg), i = bg(), a = Hg(), o = y(() => X(i().getTableHeadProps(a()), r));
	return Q(e, J({ as: "thead" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(Jg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-row.svelte
var Yg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Xg(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, Yg), i = bg(), a = Hg(), o = y(() => X(i().getTableRowProps(a()), r));
	return Q(e, J({ as: "tr" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(Xg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-trigger.svelte
var Zg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Qg(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, Zg), i = bg(), a = y(() => X(i().getTriggerProps(), r));
	return Q(e, J({ as: "button" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(Qg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-table-cell-props-context.js
var [$g, e_] = an({
	name: "DatePickerTableCellPropsContext",
	hookName: "useDatePickerTableCellPropsContext",
	providerName: "<DatePickerTableCellPropsProvider />"
}), t_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function n_(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, t_), i = y(() => Bt()(r, [
		"disabled",
		"value",
		"visibleRange",
		"columns"
	])), a = y(() => w(z(i), 2)), o = y(() => z(a)[0]), s = y(() => z(a)[1]), c = bg(), l = kg(), u = y(() => () => ({
		day: c().getDayTableCellProps,
		month: c().getMonthTableCellProps,
		year: c().getYearTableCellProps
	})[l().view](z(o))), d = y(() => X(z(u), z(s)));
	return $g(() => z(o)), Q(e, J({ as: "td" }, () => z(d), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(n_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-cell-trigger.svelte
var r_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function i_(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, r_), i = bg(), a = e_(), o = kg(), s = y(() => {
		let e = {
			day: i().getDayTableCellTriggerProps,
			month: i().getMonthTableCellTriggerProps,
			year: i().getYearTableCellTriggerProps
		}[o().view];
		return e(a());
	}), c = y(() => X(z(s), r));
	return Q(e, J({ as: "button" }, () => z(c), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(i_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-header.svelte
var a_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function o_(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, a_), i = bg(), a = Hg(), o = y(() => X(i().getTableHeaderProps(a()), r));
	return Q(e, J({ as: "th" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(o_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-view.svelte
var s_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function c_(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, s_), i = y(() => Bt()(r, ["view"])), a = y(() => w(z(i), 2)), o = y(() => z(a)[0]), s = y(() => z(a)[1]), c = bg(), l = y(() => X(c().getViewProps(z(o)), z(s)));
	return Og(() => z(o)), Q(e, J({ as: "div" }, () => z(l), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(c_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-view-control.svelte
var l_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function u_(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, l_), i = bg(), a = kg(), o = y(() => X(i().getViewControlProps(a()), r));
	return Q(e, J({ as: "div" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(u_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-view-trigger.svelte
var d_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function f_(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, d_), i = bg(), a = kg(), o = y(() => X(i().getViewTriggerProps(a()), r));
	return Q(e, J({ as: "button" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(f_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/DateField.svelte
var p_ = (e, t = S) => {
	var n = m_(), r = ye(n);
	W(() => j(r, "d", t())), F(e, n);
}, m_ = ce("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-1voin8a\"><path></path></svg>"), h_ = I("<input data-scope=\"date-picker\" autocomplete=\"off\" spellcheck=\"false\" class=\"svelte-1voin8a\"/>"), g_ = I("<span id=\"af-described\" hidden=\"\"> </span>"), __ = I("<!> <span part=\"separator\" class=\"separator svelte-1voin8a\" aria-hidden=\"true\">–</span> <!>", 1), v_ = I("<input part=\"input\" data-scope=\"date-picker\" autocomplete=\"off\" spellcheck=\"false\" class=\"svelte-1voin8a\"/>"), y_ = ce("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-1voin8a\"><path d=\"M8 2v4\"></path><path d=\"M16 2v4\"></path><rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\"></rect><path d=\"M3 10h18\"></path></svg>"), b_ = I("<!> <!>", 1), x_ = I("<!> <!> <!>", 1), S_ = I("<!> <!> <!> <footer class=\"svelte-1voin8a\"><button type=\"button\" part=\"today\" class=\"af-button ghost sm\"> </button> <!></footer>", 1), C_ = I("<div class=\"af-kit\"><!> <!></div>"), w_ = {
	hash: "svelte-1voin8a",
	code: ":host {display:inline-block;max-width:100%;vertical-align:middle;}input.svelte-1voin8a {flex:1;min-width:0;width:8.5em;padding:0;border:0;outline:none;background:transparent;color:inherit;font:inherit;}input.svelte-1voin8a::placeholder {color:var(--k-muted);opacity:1;}.separator.svelte-1voin8a {flex:none;color:var(--k-muted);}footer.svelte-1voin8a {display:flex;justify-content:space-between;gap:8px;margin-top:8px;}[data-scope='date-picker'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='date-picker'][hidden] {display:none !important;}[data-scope='date-picker'][data-part='control'] {position:relative;display:flex;align-items:center;box-sizing:border-box;width:100%;height:36px;padding:4px 36px 4px 12px;border:1px solid var(--k-input);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark, 0) * 100%), transparent);box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);font-size:16px;line-height:24px;transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);}\n  @media (min-width: 48rem) {[data-scope='date-picker'][data-part='control'] {font-size:14px;line-height:20px;} }[data-scope='date-picker'][data-part='control']:has(input:focus-visible) {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring), 0 1px 2px 0 rgb(0 0 0 / 0.05);}[data-scope='date-picker'][data-part='control'][data-disabled] {opacity:0.5;cursor:not-allowed;}[data-scope='date-picker'][data-part='control'].range {gap:8px;height:auto;padding:0;border:0;border-radius:0;background:none;box-shadow:none;transition:none;}[data-scope='date-picker'][data-part='control'].range:has(input:focus-visible) {box-shadow:none;}[data-scope='date-picker'][data-part='control'].range input.svelte-1voin8a {box-sizing:border-box;flex:1 1 auto;width:calc(8.5em + 26px);height:36px;min-height:0;padding:4px 12px;border:1px solid var(--k-input);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark, 0) * 100%), transparent);box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);}[data-scope='date-picker'][data-part='control'].range input.svelte-1voin8a:last-of-type {width:calc(8.5em + 50px);padding-right:36px;}[data-scope='date-picker'][data-part='control'].range input.svelte-1voin8a:focus-visible {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring), 0 1px 2px 0 rgb(0 0 0 / 0.05);}[data-scope='date-picker'][data-part='trigger'] {position:absolute;top:50%;right:4px;display:flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0 solid var(--k-line);border-radius:4px;background:transparent;color:var(--k-muted);outline:none;cursor:pointer;transform:translateY(-50%);}[data-scope='date-picker'][data-part='trigger'] svg.svelte-1voin8a {width:14px;height:14px;pointer-events:none;}\n  @media (hover: hover) {[data-scope='date-picker'][data-part='trigger']:not(:disabled):hover {background-color:var(--k-muted-bg);color:color-mix(in oklab, var(--k-fg) 55%, var(--k-muted));} }[data-scope='date-picker'][data-part='trigger']:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[data-scope='date-picker'][data-part='trigger']:disabled {opacity:0.5;pointer-events:none;}[data-scope='date-picker'][data-part='content'] {padding:12px;outline:none;}.af-button.icon[data-scope='date-picker'][data-part='prev-trigger'], .af-button.icon[data-scope='date-picker'][data-part='next-trigger'] {padding-inline:12px;}[data-scope='date-picker'][data-part='view-control'] {display:flex;align-items:center;justify-content:space-between;gap:4px;margin-bottom:16px;}[data-scope='date-picker'][data-part='table'] {border-collapse:collapse;}[data-scope='date-picker'][data-part='table-header'] {padding:0;color:var(--k-muted);font-size:0.8rem;font-weight:400;}[data-scope='date-picker'][data-part='table-cell'] {padding:8px 0 0;text-align:center;}[data-scope='date-picker'][data-part='table-cell-trigger'] {display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:32px;height:32px;padding:0;border:0 solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background:transparent;color:inherit;outline:none;font:inherit;font-size:14px;font-weight:400;line-height:1;cursor:pointer;-webkit-user-select:none;user-select:none;transition:background-color 100ms cubic-bezier(0.2, 0, 0, 1), color 100ms cubic-bezier(0.2, 0, 0, 1), box-shadow 100ms cubic-bezier(0.2, 0, 0, 1);}[data-scope='date-picker'][data-part='table-cell-trigger'][data-view='month'], [data-scope='date-picker'][data-part='table-cell-trigger'][data-view='year'] {width:auto;min-width:56px;padding:0 8px;}[data-scope='date-picker'][data-part='table-cell-trigger'][data-today] {background-color:var(--k-accent);color:var(--k-accent-fg);}[data-scope='date-picker'][data-part='table-cell-trigger'][data-outside-range] {color:var(--k-muted);}\n  @media (hover: hover) {[data-scope='date-picker'][data-part='table-cell-trigger']:hover:not([data-disabled], [data-selected]) {background-color:color-mix(in oklab, var(--k-accent) calc(100% - var(--k-dark, 0) * 50%), transparent);color:var(--k-accent-fg);}\n  }[data-scope='date-picker'][data-part='table-cell-trigger'][data-in-range]:not([data-selected]) {border-radius:0;background-color:var(--k-accent);color:var(--k-accent-fg);}[data-scope='date-picker'][data-part='table-cell-trigger'][data-selected] {background-color:var(--k-primary);color:var(--k-primary-fg);}[data-scope='date-picker'][data-part='table-cell-trigger']:focus-visible {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring);}[data-scope='date-picker'][data-part='table-cell-trigger'][data-disabled]:not([data-outside-range]) {opacity:0.5;color:var(--k-muted);cursor:not-allowed;}\n  @media (prefers-reduced-motion: reduce) {[data-scope='date-picker'][data-part='control'] input.svelte-1voin8a, [data-scope='date-picker'][data-part='control'], [data-scope='date-picker'][data-part='table-cell-trigger'] {transition:none;} }\n  @media (forced-colors: active) {[data-scope='date-picker'][data-part='control']:has(input:focus-visible), [data-scope='date-picker'][data-part='trigger']:focus-visible,\n    [data-scope='date-picker'][data-part='table-cell-trigger']:focus-visible,\n    [data-scope='date-picker'][data-part='content']:focus-visible,\n    [data-scope='date-picker'][data-part='control'].range input.svelte-1voin8a:focus-visible {outline:2px solid;outline-offset:2px;}[data-scope='date-picker'][data-part='table-cell-trigger'][data-in-range]:not([data-selected]) {border:1px dashed CanvasText;}[data-scope='date-picker'][data-part='table-cell-trigger'][data-selected] {forced-color-adjust:none;background-color:Highlight;color:HighlightText;}[data-scope='date-picker'][data-part='table-cell-trigger'][data-today]:not([data-selected]) {border:1px solid CanvasText;}\n  }"
};
function T_(e, i) {
	let o = g();
	k(i, !0), ee(e, w_);
	let c = (e, t = S) => {
		var n = h_();
		ke(n), fe(n, (e) => {
			t() === "start" ? q(We, e, !0) : q(Ge, e, !0);
		}, () => t() === "start" ? z(We) : z(Ge)), W(() => {
			j(n, "part", `input ${t() ?? ""}`), j(n, "data-part", z(Y) ? void 0 : "input"), ae(n, t() === "start" ? z(Me) : z(Ne)), j(n, "placeholder", b() || "dd/mm/yyyy"), j(n, "aria-label", te() ? `${te()}: ${t() === "start" ? z(me).rangeStart : z(me).rangeEnd}` : t() === "start" ? z(me).rangeStart : z(me).rangeEnd), j(n, "aria-describedby", z(Xe) ? "af-described" : void 0), j(n, "aria-invalid", ce() ? "true" : void 0), j(n, "aria-required", re() ? "true" : void 0), n.readOnly = !!D(), n.disabled = z(Ye);
		}), be("keydown", n, (e) => {
			e.key === "Enter" && !e.isComposing && (e.preventDefault(), st(t()));
		}), be("input", n, () => qe[t()] = !0), we("blur", n, () => st(t())), F(e, n);
	}, l = L(i, "value", 7, null), f = L(i, "locale", 7, null), m = L(i, "min", 7, null), h = L(i, "max", 7, null), v = L(i, "clearable", 7, !1), b = L(i, "placeholder", 7, null), te = L(i, "label", 7, null), C = L(i, "disabled", 7, !1), w = L(i, "strings", 7, null), ne = L(i, "name", 7, null), re = L(i, "required", 7, !1), D = L(i, "readonly", 7, !1), oe = L(i, "description", 7, null), se = L(i, "error", 7, null), ce = L(i, "invalid", 7, !1), le = L(i, "range", 7, !1), ue = L(i, "start", 7, null), de = L(i, "end", 7, null), I = L(i, "format", 7, null), R = i.$$host, pe = r(R), me = y(() => u(f(), w() ?? void 0)), H = y(() => t(f()) ? "vi-VN" : "en-GB"), ge = y(() => ir(l())), _e = y(() => ir(m())), ve = y(() => ir(h())), xe = y(() => !le() && lr(I()) ? I() : null), Se = (e) => z(xe) ? ur(e, z(xe)) ?? "" : or(e, f()), Ce = (e) => (z(xe) ? dr(e, z(xe)) : null) ?? ir(e.trim()), Te = y(() => z(ge) ? Se(z(ge)) : ""), Ee = B(!1);
	Oe(() => {
		z(Te), z(xe), q(Ee, !1);
	}), Oe(() => {
		R.toggleAttribute("data-unparsed", z(Ee));
	});
	let De = y(() => z(ge) !== null && (z(_e) !== null && z(ge) < z(_e) || z(ve) !== null && z(ge) > z(ve))), K = y(() => z(ge) && !z(De) ? [vg(z(ge))] : []), Ae = y(() => ir(ue())), je = y(() => ir(de())), Me = y(() => z(Ae) ? or(z(Ae), f()) : ""), Ne = y(() => z(je) ? or(z(je), f()) : ""), Pe = y(() => z(Ae) !== null && rt(z(Ae))), Fe = y(() => z(je) !== null && rt(z(je))), Y = y(() => z(Pe) || z(Fe)), Ie = B(null), Le = y(() => z(Ie) ?? (z(Y) ? [] : z(Ae) && z(je) ? [vg(z(Ae)), vg(z(je))] : z(Ae) ? [vg(z(Ae))] : [])), Re = y(() => le() ? z(Le) : z(K)), ze = y(() => le() ? z(Ae) !== null || z(je) !== null : z(De)), Be = (e) => e === "month" ? z(me).viewMonth : e === "year" ? z(me).viewYear : z(me).viewDay, Ve = B(!1), He = B(null), Ue = B(null), We = B(null), Ge = B(null), Ke = !1, qe = {
		start: !1,
		end: !1
	};
	Oe(() => a(z(He), z(Ve), R));
	let Je = B(!1), Ye = y(() => !!C() || z(Je)), Xe = y(() => [oe(), se()].filter(Boolean).join(" ")), Ze = (e) => e !== null && z(_e) !== null && e < z(_e), Qe = (e) => e !== null && z(ve) !== null && e > z(ve), $e = y(() => le() ? re() && z(Ae) === null && z(je) === null ? { valueMissing: !0 } : Ze(z(Ae)) || Ze(z(je)) ? { rangeUnderflow: !0 } : Qe(z(Ae)) || Qe(z(je)) ? { rangeOverflow: !0 } : {} : z(Ee) ? { badInput: !0 } : re() && z(ge) === null ? { valueMissing: !0 } : Ze(z(ge)) ? { rangeUnderflow: !0 } : Qe(z(ge)) ? { rangeOverflow: !0 } : {}), et = y(() => "badInput" in z($e) ? s(p(z(me), "badDate"), { format: z(xe) ?? "" }) : "valueMissing" in z($e) ? p(z(me), "valueMissing") : "rangeUnderflow" in z($e) ? s(p(z(me), "rangeUnderflow"), { min: or(z(_e), f()) }) : "rangeOverflow" in z($e) ? s(p(z(me), "rangeOverflow"), { max: or(z(ve), f()) }) : ""), tt = y(() => le() ? z(Ae) === null && z(je) === null ? null : `${z(Ae) ?? ""}/${z(je) ?? ""}` : z(ge)), nt = y(() => le() ? !z(Pe) && z(Fe) ? z(Ge) : z(We) : z(Ue));
	Oe(() => jr(R, {
		name: ne(),
		value: z(tt),
		validity: z($e),
		message: z(et),
		anchor: z(nt)
	})), Mr(R, {
		reset() {
			if (le()) {
				let e = {
					start: ir(R.getAttribute("start")),
					end: ir(R.getAttribute("end"))
				};
				(e.start !== z(Ae) || e.end !== z(je)) && d(R, "change", e);
				return;
			}
			let e = ir(R.getAttribute("value"));
			e !== z(ge) && d(R, "change", { value: e });
		},
		disabled(e) {
			q(Je, e, !0);
		}
	});
	function rt(e) {
		return z(_e) !== null && e < z(_e) || z(ve) !== null && e > z(ve);
	}
	function it(e) {
		let t = e !== null && rt(e);
		return (t ? z(Ee) : e !== z(ge) || z(Ee)) && d(R, "change", { value: t ? z(ge) : e }), !t && (z(Ee) && z(Ue) && (z(Ue).value = z(Te)), q(Ee, !1), !0);
	}
	function at() {
		if (!z(Ue) || !Ke) return;
		Ke = !1;
		let e = z(Ue).value.trim();
		if (z(xe)) {
			let t = e === "" ? null : Ce(e);
			if (e !== "" && t === null) {
				q(Ee, !0), d(R, "unparsed", { text: z(Ue).value });
				return;
			}
			it(t), q(Ee, !1), z(Ue).value = z(Te);
			return;
		}
		let t = e === "" ? v() ? null : void 0 : ar(e) ?? void 0;
		t !== void 0 && t !== z(ge) && it(t), z(Ue).value = z(Te);
	}
	function ot(e, t) {
		return e !== null && e !== z(Ae) && rt(e) || t !== null && t !== z(je) && rt(t) || e !== null && t !== null && t < e ? !1 : ((e !== z(Ae) || t !== z(je)) && d(R, "change", {
			start: e,
			end: t
		}), !0);
	}
	function st(e) {
		let t = z(e === "start" ? We : Ge);
		if (!t || !qe[e]) return;
		qe[e] = !1;
		let n = t.value.trim(), r = n === "" ? null : ar(n);
		(n === "" || r !== null) && (e === "start" ? ot(r, z(je)) : ot(z(Ae), r)), t.value = z(e === "start" ? Me : Ne);
	}
	function ct(e) {
		let [t, n] = e;
		if (t) {
			if (!n) {
				q(Ie, [t], !0);
				return;
			}
			q(Ie, null), ot(t.toString(), n.toString());
		}
	}
	function lt(e) {
		let t = fr();
		e().setFocusedValue(vg(t)), requestAnimationFrame(() => R.shadowRoot?.querySelector(`[data-part="table-cell-trigger"][data-view="day"][data-value="${t}"]`)?.focus());
	}
	function ut(e) {
		e().setOpen(!1), R.shadowRoot?.querySelector("[part=\"trigger\"]")?.focus();
	}
	let dt = Rg(() => ({
		id: o,
		dir: pe,
		getRootNode: () => R.shadowRoot,
		value: z(Re),
		locale: z(H),
		selectionMode: le() ? "range" : "single",
		min: z(_e) ? vg(z(_e)) : void 0,
		max: z(ve) ? vg(z(ve)) : void 0,
		disabled: z(Ye),
		readOnly: !!D(),
		fixedWeeks: !0,
		positioning: {
			strategy: "fixed",
			placement: "bottom-start"
		},
		format: (e) => Se(e.toString()),
		translations: {
			trigger: (e) => e ? z(me).closeCalendar : z(me).openCalendar,
			content: z(me).calendar,
			clearTrigger: z(me).clear,
			dayCell: (e) => s(e.selected ? z(me).selectedDate : z(me).chooseDate, { date: e.valueText }),
			viewTrigger: (e, t) => s(t ? z(me).switchView : z(me).currentView, { view: Be(t ?? e) }),
			prevTrigger: (e) => e === "day" ? z(me).previousMonth : e === "month" ? z(me).previousYear : z(me).previousDecade,
			nextTrigger: (e) => e === "day" ? z(me).nextMonth : e === "month" ? z(me).nextYear : z(me).nextDecade
		},
		onValueChange: (e) => le() ? ct(e.value) : it(e.value[0]?.toString() ?? null),
		onOpenChange: (e) => {
			if (q(Ve, e.open, !0), !e.open) q(Ie, null);
			else if (z(xe) && z(Ue)) {
				let e = Ce(z(Ue).value);
				e && dt().setFocusedValue(vg(e));
			}
		}
	}));
	var ft = {
		get value() {
			return l();
		},
		set value(e = null) {
			l(e), A();
		},
		get locale() {
			return f();
		},
		set locale(e = null) {
			f(e), A();
		},
		get min() {
			return m();
		},
		set min(e = null) {
			m(e), A();
		},
		get max() {
			return h();
		},
		set max(e = null) {
			h(e), A();
		},
		get clearable() {
			return v();
		},
		set clearable(e = !1) {
			v(e), A();
		},
		get placeholder() {
			return b();
		},
		set placeholder(e = null) {
			b(e), A();
		},
		get label() {
			return te();
		},
		set label(e = null) {
			te(e), A();
		},
		get disabled() {
			return C();
		},
		set disabled(e = !1) {
			C(e), A();
		},
		get strings() {
			return w();
		},
		set strings(e = null) {
			w(e), A();
		},
		get name() {
			return ne();
		},
		set name(e = null) {
			ne(e), A();
		},
		get required() {
			return re();
		},
		set required(e = !1) {
			re(e), A();
		},
		get readonly() {
			return D();
		},
		set readonly(e = !1) {
			D(e), A();
		},
		get description() {
			return oe();
		},
		set description(e = null) {
			oe(e), A();
		},
		get error() {
			return se();
		},
		set error(e = null) {
			se(e), A();
		},
		get invalid() {
			return ce();
		},
		set invalid(e = !1) {
			ce(e), A();
		},
		get range() {
			return le();
		},
		set range(e = !1) {
			le(e), A();
		},
		get start() {
			return ue();
		},
		set start(e = null) {
			ue(e), A();
		},
		get end() {
			return de();
		},
		set end(e = null) {
			de(e), A();
		},
		get format() {
			return I();
		},
		set format(e = null) {
			I(e), A();
		}
	}, pt = b_(), mt = G(pt);
	n(mt, {});
	var ht = U(mt, 2);
	return Ft(ht, {
		value: () => R.shadowRoot,
		children: (e, t) => {
			Qu(e, {
				get dir() {
					return pe;
				},
				children: (e, t) => {
					var n = C_(), r = V(n), i = (e) => {
						var t = g_(), n = ye(t, !0);
						W(() => T(n, z(Xe))), F(e, t);
					};
					M(r, (e) => {
						z(Xe) && e(i);
					});
					var a = U(r, 2);
					E(a, () => Bg, (e, t) => {
						t(e, {
							get value() {
								return dt;
							},
							children: (e, t) => {
								var n = b_(), r = G(n);
								{
									let e = y(() => le() ? "range" : void 0);
									E(r, () => Dg, (t, n) => {
										n(t, {
											part: "control",
											get class() {
												return z(e);
											},
											children: (e, t) => {
												var n = b_(), r = G(n), i = (e) => {
													var t = __(), n = G(t);
													c(n, () => "start");
													var r = U(n, 4);
													c(r, () => "end"), F(e, t);
												}, a = (e) => {
													var t = v_();
													ke(t), fe(t, (e) => q(Ue, e), () => z(Ue)), W(() => {
														j(t, "data-part", z(De) ? void 0 : "input"), ae(t, z(Te)), j(t, "placeholder", b() || z(xe) || "dd/mm/yyyy"), j(t, "aria-label", te() || b() || void 0), j(t, "aria-describedby", z(Xe) ? "af-described" : void 0), j(t, "aria-invalid", ce() || z(Ee) ? "true" : void 0), j(t, "aria-required", re() ? "true" : void 0), t.readOnly = !!D(), t.disabled = z(Ye);
													}), be("keydown", t, (e) => {
														e.key === "Enter" && !e.isComposing && (e.preventDefault(), at());
													}), be("input", t, () => Ke = !0), we("blur", t, at), F(e, t);
												};
												M(r, (e) => {
													le() ? e(i) : e(a, -1);
												});
												var o = U(r, 2);
												E(o, () => Qg, (e, t) => {
													t(e, {
														part: "trigger",
														children: (e, t) => {
															var n = y_();
															F(e, n);
														},
														$$slots: { default: !0 }
													});
												}), F(e, n);
											},
											$$slots: { default: !0 }
										});
									});
								}
								var i = U(r, 2);
								E(i, () => Ng, (e, t) => {
									t(e, {
										popover: "manual",
										get ref() {
											return z(He);
										},
										set ref(e) {
											q(He, e, !0);
										},
										children: (e, t) => {
											var n = P(), r = G(n);
											E(r, () => wg, (e, t) => {
												t(e, {
													class: "af-overlay date",
													part: "content",
													children: (e, t) => {
														var n = P(), r = G(n);
														{
															let e = (e, t = S) => {
																var n = S_(), r = G(n);
																E(r, () => c_, (e, n) => {
																	n(e, {
																		view: "day",
																		children: (e, n) => {
																			var r = b_(), i = G(r);
																			E(i, () => u_, (e, t) => {
																				t(e, {
																					children: (e, t) => {
																						var n = x_(), r = G(n);
																						E(r, () => Fg, (e, t) => {
																							t(e, {
																								class: "af-button ghost icon sm",
																								children: (e, t) => {
																									p_(e, () => "m15 18-6-6 6-6");
																								},
																								$$slots: { default: !0 }
																							});
																						});
																						var i = U(r, 2);
																						E(i, () => f_, (e, t) => {
																							t(e, {
																								class: "af-button ghost sm",
																								children: (e, t) => {
																									var n = P(), r = G(n);
																									E(r, () => Lg, (e, t) => {
																										t(e, {});
																									}), F(e, n);
																								},
																								$$slots: { default: !0 }
																							});
																						});
																						var a = U(i, 2);
																						E(a, () => jg, (e, t) => {
																							t(e, {
																								class: "af-button ghost icon sm",
																								children: (e, t) => {
																									p_(e, () => "m9 18 6-6-6-6");
																								},
																								$$slots: { default: !0 }
																							});
																						}), F(e, n);
																					},
																					$$slots: { default: !0 }
																				});
																			});
																			var a = U(i, 2);
																			E(a, () => Wg, (e, n) => {
																				n(e, {
																					children: (e, n) => {
																						var r = b_(), i = G(r);
																						E(i, () => Jg, (e, n) => {
																							n(e, {
																								children: (e, n) => {
																									var r = P(), i = G(r);
																									E(i, () => Xg, (e, n) => {
																										n(e, {
																											children: (e, n) => {
																												var r = P(), i = G(r);
																												_(i, 17, () => t()().weekDays, N, (e, t) => {
																													var n = P(), r = G(n);
																													E(r, () => o_, (e, n) => {
																														n(e, {
																															children: (e, n) => {
																																ie();
																																var r = he();
																																W(() => T(r, z(t).narrow)), F(e, r);
																															},
																															$$slots: { default: !0 }
																														});
																													}), F(e, n);
																												}), F(e, r);
																											},
																											$$slots: { default: !0 }
																										});
																									}), F(e, r);
																								},
																								$$slots: { default: !0 }
																							});
																						});
																						var a = U(i, 2);
																						E(a, () => Kg, (e, n) => {
																							n(e, {
																								children: (e, n) => {
																									var r = P(), i = G(r);
																									_(i, 17, () => t()().weeks, N, (e, n, r) => {
																										var i = P(), a = G(i);
																										E(a, () => Xg, (e, n) => {
																											n(e, {
																												children: (e, n) => {
																													var i = P(), a = G(i);
																													_(a, 17, () => t()().getDaysInWeek(r), (e) => e.toString(), (e, t) => {
																														var n = P(), r = G(n);
																														E(r, () => n_, (e, n) => {
																															n(e, {
																																get value() {
																																	return z(t);
																																},
																																children: (e, n) => {
																																	var r = P(), i = G(r);
																																	E(i, () => i_, (e, n) => {
																																		n(e, {
																																			children: (e, n) => {
																																				ie();
																																				var r = he();
																																				W(() => T(r, z(t).day)), F(e, r);
																																			},
																																			$$slots: { default: !0 }
																																		});
																																	}), F(e, r);
																																},
																																$$slots: { default: !0 }
																															});
																														}), F(e, n);
																													}), F(e, i);
																												},
																												$$slots: { default: !0 }
																											});
																										}), F(e, i);
																									}), F(e, r);
																								},
																								$$slots: { default: !0 }
																							});
																						}), F(e, r);
																					},
																					$$slots: { default: !0 }
																				});
																			}), F(e, r);
																		},
																		$$slots: { default: !0 }
																	});
																});
																var i = U(r, 2);
																E(i, () => c_, (e, n) => {
																	n(e, {
																		view: "month",
																		children: (e, n) => {
																			var r = b_(), i = G(r);
																			E(i, () => u_, (e, t) => {
																				t(e, {
																					children: (e, t) => {
																						var n = x_(), r = G(n);
																						E(r, () => Fg, (e, t) => {
																							t(e, {
																								class: "af-button ghost icon sm",
																								children: (e, t) => {
																									p_(e, () => "m15 18-6-6 6-6");
																								},
																								$$slots: { default: !0 }
																							});
																						});
																						var i = U(r, 2);
																						E(i, () => f_, (e, t) => {
																							t(e, {
																								class: "af-button ghost sm",
																								children: (e, t) => {
																									var n = P(), r = G(n);
																									E(r, () => Lg, (e, t) => {
																										t(e, {});
																									}), F(e, n);
																								},
																								$$slots: { default: !0 }
																							});
																						});
																						var a = U(i, 2);
																						E(a, () => jg, (e, t) => {
																							t(e, {
																								class: "af-button ghost icon sm",
																								children: (e, t) => {
																									p_(e, () => "m9 18 6-6-6-6");
																								},
																								$$slots: { default: !0 }
																							});
																						}), F(e, n);
																					},
																					$$slots: { default: !0 }
																				});
																			});
																			var a = U(i, 2);
																			E(a, () => Wg, (e, n) => {
																				n(e, {
																					children: (e, n) => {
																						var r = P(), i = G(r);
																						E(i, () => Kg, (e, n) => {
																							n(e, {
																								children: (e, n) => {
																									var r = P(), i = G(r);
																									_(i, 17, () => t()().getMonthsGrid({
																										columns: 4,
																										format: "short"
																									}), N, (e, t) => {
																										var n = P(), r = G(n);
																										E(r, () => Xg, (e, n) => {
																											n(e, {
																												children: (e, n) => {
																													var r = P(), i = G(r);
																													_(i, 17, () => z(t), (e) => e.value, (e, t) => {
																														var n = P(), r = G(n);
																														E(r, () => n_, (e, n) => {
																															n(e, {
																																get value() {
																																	return z(t).value;
																																},
																																children: (e, n) => {
																																	var r = P(), i = G(r);
																																	E(i, () => i_, (e, n) => {
																																		n(e, {
																																			children: (e, n) => {
																																				ie();
																																				var r = he();
																																				W(() => T(r, z(t).label)), F(e, r);
																																			},
																																			$$slots: { default: !0 }
																																		});
																																	}), F(e, r);
																																},
																																$$slots: { default: !0 }
																															});
																														}), F(e, n);
																													}), F(e, r);
																												},
																												$$slots: { default: !0 }
																											});
																										}), F(e, n);
																									}), F(e, r);
																								},
																								$$slots: { default: !0 }
																							});
																						}), F(e, r);
																					},
																					$$slots: { default: !0 }
																				});
																			}), F(e, r);
																		},
																		$$slots: { default: !0 }
																	});
																});
																var a = U(i, 2);
																E(a, () => c_, (e, n) => {
																	n(e, {
																		view: "year",
																		children: (e, n) => {
																			var r = b_(), i = G(r);
																			E(i, () => u_, (e, t) => {
																				t(e, {
																					children: (e, t) => {
																						var n = x_(), r = G(n);
																						E(r, () => Fg, (e, t) => {
																							t(e, {
																								class: "af-button ghost icon sm",
																								children: (e, t) => {
																									p_(e, () => "m15 18-6-6 6-6");
																								},
																								$$slots: { default: !0 }
																							});
																						});
																						var i = U(r, 2);
																						E(i, () => f_, (e, t) => {
																							t(e, {
																								class: "af-button ghost sm",
																								children: (e, t) => {
																									var n = P(), r = G(n);
																									E(r, () => Lg, (e, t) => {
																										t(e, {});
																									}), F(e, n);
																								},
																								$$slots: { default: !0 }
																							});
																						});
																						var a = U(i, 2);
																						E(a, () => jg, (e, t) => {
																							t(e, {
																								class: "af-button ghost icon sm",
																								children: (e, t) => {
																									p_(e, () => "m9 18 6-6-6-6");
																								},
																								$$slots: { default: !0 }
																							});
																						}), F(e, n);
																					},
																					$$slots: { default: !0 }
																				});
																			});
																			var a = U(i, 2);
																			E(a, () => Wg, (e, n) => {
																				n(e, {
																					children: (e, n) => {
																						var r = P(), i = G(r);
																						E(i, () => Kg, (e, n) => {
																							n(e, {
																								children: (e, n) => {
																									var r = P(), i = G(r);
																									_(i, 17, () => t()().getYearsGrid({ columns: 4 }), N, (e, t) => {
																										var n = P(), r = G(n);
																										E(r, () => Xg, (e, n) => {
																											n(e, {
																												children: (e, n) => {
																													var r = P(), i = G(r);
																													_(i, 17, () => z(t), (e) => e.value, (e, t) => {
																														var n = P(), r = G(n);
																														E(r, () => n_, (e, n) => {
																															n(e, {
																																get value() {
																																	return z(t).value;
																																},
																																children: (e, n) => {
																																	var r = P(), i = G(r);
																																	E(i, () => i_, (e, n) => {
																																		n(e, {
																																			children: (e, n) => {
																																				ie();
																																				var r = he();
																																				W(() => T(r, z(t).label)), F(e, r);
																																			},
																																			$$slots: { default: !0 }
																																		});
																																	}), F(e, r);
																																},
																																$$slots: { default: !0 }
																															});
																														}), F(e, n);
																													}), F(e, r);
																												},
																												$$slots: { default: !0 }
																											});
																										}), F(e, n);
																									}), F(e, r);
																								},
																								$$slots: { default: !0 }
																							});
																						}), F(e, r);
																					},
																					$$slots: { default: !0 }
																				});
																			}), F(e, r);
																		},
																		$$slots: { default: !0 }
																	});
																});
																var o = U(a, 2), s = V(o), c = ye(s, !0), l = U(s, 2), u = (e) => {
																	var n = P(), r = G(n);
																	E(r, () => Sg, (e, n) => {
																		n(e, J({
																			part: "clear",
																			class: "af-button ghost sm"
																		}, () => z(ze) ? { hidden: !1 } : {}, {
																			onclick: () => {
																				le() ? ot(null, null) : z(De) && it(null), ut(t());
																			},
																			children: (e, t) => {
																				ie();
																				var n = he();
																				W(() => T(n, z(me).clear)), F(e, n);
																			},
																			$$slots: { default: !0 }
																		}));
																	}), F(e, n);
																};
																M(l, (e) => {
																	v() && e(u);
																}), O(o), W((e) => {
																	s.disabled = e, T(c, z(me).today);
																}, [() => rt(fr())]), be("click", s, () => {
																	le() ? lt(t()) : it(fr()) && ut(t());
																}), F(e, n);
															};
															E(r, () => Tg, (t, n) => {
																n(t, {
																	render: e,
																	$$slots: { render: !0 }
																});
															});
														}
														F(e, n);
													},
													$$slots: { default: !0 }
												});
											}), F(e, n);
										},
										$$slots: { default: !0 }
									});
								}), F(e, n);
							},
							$$slots: { default: !0 }
						});
					}), O(n), F(e, n);
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { default: !0 }
	}), F(e, pt), x(ft);
}
De([
	"keydown",
	"input",
	"click"
]), H(T_, {
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
}, Ar);
//#endregion
//#region src/kit/tooltip-escape.ts
function E_(e, t) {
	return t.composedPath().some((t) => t instanceof HTMLElement && t.localName === "af-tooltip" && t.dataset.raised === "true" && e.contains(t));
}
//#endregion
//#region src/kit/Dialog.svelte
var D_ = I("<header class=\"svelte-gp7kvq\"><!> <button type=\"button\" part=\"close\" class=\"svelte-gp7kvq\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-gp7kvq\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button></header> <div part=\"body\" class=\"svelte-gp7kvq\"><!></div> <footer part=\"actions\" class=\"svelte-gp7kvq\"><!></footer>", 1), O_ = I("<dialog><!></dialog>"), k_ = I("<!> <!>", 1), A_ = {
	hash: "svelte-gp7kvq",
	code: ":host {display:contents;}dialog.svelte-gp7kvq {border:0;padding:0;background:transparent;max-width:calc(100vw - 32px);overflow:visible;}dialog.svelte-gp7kvq::backdrop {background:rgb(0 0 0 / 0.5);}header.svelte-gp7kvq {display:flex;flex:none;align-items:center;padding-right:24px;}[part='body'].svelte-gp7kvq {display:flex;flex:1 1 auto;flex-direction:column;min-height:0;margin:-4px -16px;}[part='body'].svelte-gp7kvq [data-scope='scroll-area'][data-part='viewport'] {padding:4px 16px;overscroll-behavior:contain;}footer.svelte-gp7kvq {display:flex;flex:none;flex-wrap:wrap;justify-content:flex-end;gap:8px;}footer[hidden].svelte-gp7kvq {display:none;}[part='close'].svelte-gp7kvq {position:absolute;top:16px;right:16px;display:flex;align-items:center;justify-content:center;width:16px;height:16px;padding:0;border:0 solid var(--k-line);border-radius:2px;background:transparent;color:inherit;opacity:0.7;outline:none;cursor:pointer;transition:opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);}[part='close'].svelte-gp7kvq svg:where(.svelte-gp7kvq) {flex:none;width:16px;height:16px;pointer-events:none;}\n  @media (hover: hover) {[part='close'].svelte-gp7kvq:hover {opacity:1;} }[part='close'].svelte-gp7kvq:focus-visible {box-shadow:0 0 0 2px var(--k-bg), 0 0 0 4px var(--k-focus-border);}[data-scope='dialog'][data-part='content'] {position:relative;display:flex;flex-direction:column;gap:16px;width:calc(100vw - 32px);max-height:calc(100dvh - 64px);padding:24px;border-radius:var(--k-radius);background-color:var(--k-bg);color:var(--k-fg);outline:none;box-shadow:0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);}[data-scope='dialog'][data-part='title'] {margin:0;font-size:18px;font-weight:600;line-height:1;}\n  @media (min-width: 40rem) {[data-scope='dialog'][data-part='content'] {max-width:512px;} }\n  @media not (min-width: 40rem) {footer.svelte-gp7kvq {flex-direction:column-reverse;} }dialog[data-placement='end'].svelte-gp7kvq {inset:0 0 0 auto;height:100dvh;max-width:none;max-height:none;margin:0;}[data-scope='dialog'][data-part='content'][data-placement='end'] {width:min(75vw, 384px);max-width:none;height:100%;max-height:none;padding:0;border:0 solid var(--k-line);border-left-width:1px;border-radius:0;}[data-scope='dialog'][data-part='content'][data-placement='end'] header.svelte-gp7kvq {box-sizing:border-box;padding:16px 40px 16px 16px;}[data-scope='dialog'][data-part='content'][data-placement='end'] [part='body'].svelte-gp7kvq {margin:-4px 0;}[data-scope='dialog'][data-part='content'][data-placement='end']:has(> footer[hidden]) [part='body'].svelte-gp7kvq {margin-bottom:0;}[data-scope='dialog'][data-part='content'][data-placement='end'] footer.svelte-gp7kvq {box-sizing:border-box;flex-direction:column;justify-content:normal;margin-top:auto;padding:16px;}[data-scope='dialog'][data-part='content'][data-placement='end'] [data-scope='dialog'][data-part='title'] {font-size:16px;line-height:24px;}\n  @keyframes af-dialog-slide-in { from { transform: translateX(100%); } }\n  @media (prefers-reduced-motion: no-preference) {[data-scope='dialog'][data-part='content'][data-placement='end'] { animation: af-dialog-slide-in 500ms cubic-bezier(0.4, 0, 0.2, 1);}\n  }\n  @media (prefers-reduced-motion: reduce) {[part='close'].svelte-gp7kvq {transition:none;} }\n  @media (forced-colors: active) {[part='close'].svelte-gp7kvq:focus-visible, [data-scope='dialog'][data-part='content']:focus-visible {outline:2px solid;outline-offset:2px;}\n  }"
};
function j_(t, r) {
	k(r, !0), ee(t, A_);
	let i = L(r, "open", 7, !1), a = L(r, "heading", 7, ""), s = L(r, "placement", 7, "center"), c = L(r, "locale", 7, null), f = L(r, "strings", 7, null), p = r.$$host, m = y(() => u(c(), f() ?? void 0)), h = y(() => s() === "end" ? "end" : "center"), g = B(null), _ = "escape", b = B(null), te = B(null), C = B(!1), w = o(p);
	Oe(() => w(z(g), !!i()));
	let ne = null, re = null, D = (t) => !(t instanceof Node && e(p, t)) && l(p);
	Oe(() => {
		if (i() && z(g)) return _e(p.ownerDocument, "pointerdown", (e) => {
			e !== re && e.button === 0 && e.pointerType !== "touch" && D(e.composedPath()[0] ?? null) && (ne = e, d(p, "close", { reason: "outside" }));
		}, { capture: !0 });
	}), Oe(() => {
		let e = z(b)?.querySelector("slot");
		if (!e) return;
		let t = () => q(C, e.assignedNodes().length > 0);
		return t(), _e(e, "slotchange", t);
	});
	var ae = {
		get open() {
			return i();
		},
		set open(e = !1) {
			i(e), A();
		},
		get heading() {
			return a();
		},
		set heading(e = "") {
			a(e), A();
		},
		get placement() {
			return s();
		},
		set placement(e = "center") {
			s(e), A();
		},
		get locale() {
			return c();
		},
		set locale(e = null) {
			c(e), A();
		},
		get strings() {
			return f();
		},
		set strings(e = null) {
			f(e), A();
		}
	}, oe = k_(), se = G(oe);
	n(se, {});
	var ce = U(se, 2);
	return Ft(ce, {
		value: () => p.shadowRoot,
		children: (e, t) => {
			var n = P(), o = G(n), s = () => !!i();
			E(o, () => Pf, (e, t) => {
				t(e, {
					get open() {
						return s();
					},
					set open(e) {},
					modal: !1,
					preventScroll: !0,
					closeOnInteractOutside: !0,
					onEscapeKeyDown: (e) => {
						E_(p, e) ? e.preventDefault() : Xn(e) && e.defaultPrevented ? d(p, "close", { reason: "escape" }) : _ = "escape";
					},
					onInteractOutside: (e) => {
						e.detail.originalEvent === ne || !D(e.detail.target) ? e.preventDefault() : (re = e.detail.originalEvent, _ = "outside");
					},
					onOpenChange: (e) => {
						e.open || (d(p, "close", { reason: _ }), _ = "escape");
					},
					children: (e, t) => {
						var n = P(), i = G(n);
						{
							let e = (e, t = S) => {
								var n = O_(), i = (e) => e.preventDefault();
								v(n, (e) => ({
									...e,
									class: "af-kit",
									"data-placement": z(h),
									oncancel: i
								}), [() => t()()], void 0, void 0, "svelte-gp7kvq");
								var o = V(n);
								E(o, () => Ed, (e, t) => {
									t(e, {
										part: "content",
										class: "af-overlay dialog",
										"aria-modal": "true",
										get "data-placement"() {
											return z(h);
										},
										children: (e, t) => {
											var n = D_(), i = G(n), o = V(i);
											E(o, () => If, (e, t) => {
												t(e, {
													part: "heading",
													get ref() {
														return z(te);
													},
													set ref(e) {
														q(te, e, !0);
													},
													children: (e, t) => {
														ie();
														var n = he();
														W(() => T(n, a() ?? "")), F(e, n);
													},
													$$slots: { default: !0 }
												});
											});
											var s = U(o, 2);
											O(i);
											var c = U(i, 2), l = V(c);
											{
												let e = y(() => ({
													element: z(te),
													text: a() ?? ""
												}));
												En(l, {
													get heading() {
														return z(e);
													},
													children: (e, t) => {
														var n = P(), i = G(n);
														le(i, r, "default", {}, null), F(e, n);
													},
													$$slots: { default: !0 }
												});
											}
											O(c);
											var u = U(c, 2), f = V(u);
											le(f, r, "actions", {}, null), O(u), fe(u, (e) => q(b, e), () => z(b)), W(() => {
												j(s, "aria-label", z(m).close), j(u, "hidden", !z(C));
											}), be("click", s, () => d(p, "close", { reason: "close-button" })), F(e, n);
										},
										$$slots: { default: !0 }
									});
								}), O(n), fe(n, (e) => q(g, e), () => z(g)), F(e, n);
							};
							E(i, () => Ad, (t, n) => {
								n(t, {
									asChild: e,
									$$slots: { asChild: !0 }
								});
							});
						}
						F(e, n);
					},
					$$slots: { default: !0 }
				});
			}), F(e, n);
		},
		$$slots: { default: !0 }
	}), F(t, oe), x(ae);
}
De(["click"]), H(j_, {
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
var M_ = I("<div part=\"content\" class=\"plain svelte-y87xpv\"> </div>"), N_ = I("<div part=\"content\" aria-busy=\"true\"></div>"), P_ = I("<!> <div class=\"af-kit\"><!></div>", 1), F_ = {
	hash: "svelte-y87xpv",
	code: ":host {display:block;}.plain.svelte-y87xpv {white-space:pre-wrap;overflow-wrap:anywhere;}"
};
function I_(e, t) {
	k(t, !0), ee(e, F_);
	let r = L(t, "value", 7, null), i = L(t, "mentions", 7, null), a = L(t, "schemes", 7, null), o = L(t, "locale", 7, null), s = L(t, "strings", 7, null), c = t.$$host, l = y(() => u(o(), s() ?? void 0)), d = B(null), f = B(!1);
	Oe(() => {
		let e = !0;
		return import("./chunks/markdown-view-CizFZX0q.js").then((t) => {
			e && q(d, t.default);
		}, () => {
			e && q(f, !0);
		}), () => {
			e = !1;
		};
	});
	var p = {
		get value() {
			return r();
		},
		set value(e = null) {
			r(e), A();
		},
		get mentions() {
			return i();
		},
		set mentions(e = null) {
			i(e), A();
		},
		get schemes() {
			return a();
		},
		set schemes(e = null) {
			a(e), A();
		},
		get locale() {
			return o();
		},
		set locale(e = null) {
			o(e), A();
		},
		get strings() {
			return s();
		},
		set strings(e = null) {
			s(e), A();
		}
	}, m = P_(), h = G(m);
	n(h, {});
	var g = U(h, 2), _ = V(g), v = (e) => {
		var t = P(), n = G(t);
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
					return z(l);
				},
				get host() {
					return c;
				}
			});
		}), F(e, t);
	}, b = (e) => {
		var t = M_(), n = ye(t, !0);
		W(() => T(n, r() ?? "")), F(e, t);
	}, S = (e) => {
		var t = N_();
		F(e, t);
	};
	return M(_, (e) => {
		z(d) ? e(v) : z(f) ? e(b, 1) : e(S, -1);
	}), O(g), F(e, m), x(p);
}
H(I_, {
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
var [L_, R_] = an({
	name: "MenuContext",
	hookName: "useMenuContext",
	providerName: "<MenuProvider />",
	strict: !1
}), [z_, B_] = an({
	name: "MenuItemContext",
	hookName: "useMenuItemContext",
	providerName: "<MenuItemProvider />"
}), [V_, H_] = an({
	name: "MenuItemPropsContext",
	hookName: "useMenuItemPropsContext",
	providerName: "<MenuItemPropsProvider />"
}), U_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"checked"
]);
function W_(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = L(t, "checked", 15), i = K(t, U_), a = y(() => Bt()(i, [
		"checked",
		"closeOnSelect",
		"disabled",
		"onCheckedChange",
		"value",
		"valueText"
	])), o = y(() => w(z(a), 2)), s = y(() => z(o)[0]), c = y(() => z(o)[1]), l = y(() => ({
		...z(s),
		type: "checkbox",
		checked: r(),
		onCheckedChange(e) {
			r() !== void 0 && r(e), z(s).onCheckedChange?.(e);
		}
	})), u = R_(), d = y(() => X(u().getOptionItemProps(z(l)), z(c))), f = y(() => u().getOptionItemState(z(l)));
	return V_(() => z(l)), z_(() => z(f)), Q(e, J({ as: "div" }, () => z(d), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		},
		get checked() {
			return r();
		},
		set checked(e) {
			r(e), A();
		}
	});
}
H(W_, {
	ref: {},
	checked: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-content.svelte
var G_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function K_(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, G_), i = R_(), a = co(), o = y(() => X(i().getContentProps(), a().getPresenceProps(), r));
	function s(e) {
		a().setNode(e);
	}
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	}, l = P(), u = G(l), d = (e) => {
		Q(e, J({
			as: "div",
			[de()]: s
		}, () => z(o), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = y(() => !a().unmounted);
	return M(u, (e) => {
		z(f) && e(d);
	}), F(e, l), x(c);
}
H(K_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-context.svelte
function q_(e, t) {
	k(t, !0);
	let n = L(t, "render", 7), r = R_();
	var i = {
		get render() {
			return n();
		},
		set render(e) {
			n(e), A();
		}
	}, a = P(), o = G(a);
	return Se(o, n, () => r), F(e, a), x(i);
}
H(q_, { render: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/use-menu-item-group-context.js
var [J_, Y_] = an({
	name: "MenuItemGroupContext",
	hookName: "useMenuItemGroupContext",
	providerName: "<MenuItemGroupProvider />"
}), X_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Z_(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, X_), i = R_(), a = Y_(), o = y(() => X(i().getItemGroupLabelProps({ htmlFor: a().id }), r));
	return Q(e, J({ as: "div" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(Z_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-item-group.svelte
var Q_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function $_(e, t) {
	let n = g();
	k(t, !0);
	let r = L(t, "ref", 15, null), i = K(t, Q_), a = R_(), o = y(() => ({
		id: n,
		...i
	})), s = y(() => X(a().getItemGroupProps(z(o)), i));
	return J_(() => z(o)), Q(e, J({ as: "div" }, () => z(s), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), x({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), A();
		}
	});
}
H($_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-item-indicator.svelte
var ev = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function tv(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, ev), i = R_(), a = H_(), o = y(() => X(i().getItemIndicatorProps(a()), r));
	return Q(e, J({ as: "div" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(tv, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-item.svelte
var nv = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function rv(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, nv), i = y(() => Bt()(r, [
		"closeOnSelect",
		"disabled",
		"value",
		"valueText",
		"onSelect"
	])), a = y(() => w(z(i), 2)), o = y(() => z(a)[0]), s = y(() => z(a)[1]), c = R_(), l = y(() => X(c().getItemProps(z(o)), z(s))), u = y(() => c().getItemState(z(o)));
	return Oe(() => c().addItemListener({
		id: z(u).id,
		onSelect: z(o).onSelect
	})), V_(() => z(o)), z_(() => z(u)), Q(e, J({ as: "div" }, () => z(l), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(rv, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-positioner.svelte
var iv = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function av(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, iv), i = R_(), a = co(), o = y(() => X(i().getPositionerProps(), r));
	var s = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	}, c = P(), l = G(c), u = (e) => {
		Q(e, J({ as: "div" }, () => z(o), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, d = y(() => !a().unmounted);
	return M(l, (e) => {
		z(d) && e(u);
	}), F(e, c), x(s);
}
H(av, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-radio-item-group.svelte
var ov = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"value"
]);
function sv(e, t) {
	let n = g();
	k(t, !0);
	let r = L(t, "ref", 15, null), i = L(t, "value", 15), a = K(t, ov), o = y(() => Bt()(a, [
		"id",
		"onValueChange",
		"value"
	])), s = y(() => w(z(o), 2)), c = y(() => z(s)[0]), l = y(() => z(s)[1]), u = R_(), d = y(() => ({
		id: z(c).id ?? n,
		value: i(),
		onValueChange(e) {
			i(e.value), z(c)?.onValueChange?.(e);
		}
	})), f = y(() => X(u().getItemGroupProps({ id: z(d).id }), z(l)));
	return J_(() => z(d)), Q(e, J({ as: "div" }, () => z(f), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), x({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), A();
		},
		get value() {
			return i();
		},
		set value(e) {
			i(e), A();
		}
	});
}
H(sv, {
	ref: {},
	value: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-radio-item.svelte
var cv = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function lv(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, cv), i = y(() => Bt()(r, [
		"closeOnSelect",
		"disabled",
		"value",
		"valueText"
	])), a = y(() => w(z(i), 2)), o = y(() => z(a)[0]), s = y(() => z(a)[1]), c = R_(), l = Y_(), u = y(() => ({
		...z(o),
		checked: l().value === z(o).value,
		type: "radio",
		onCheckedChange: () => l().onValueChange?.({ value: z(o).value })
	})), d = y(() => X(c().getOptionItemProps(z(u)), z(s))), f = y(() => c().getOptionItemState(z(u)));
	return V_(() => z(u)), z_(() => z(f)), Q(e, J({ as: "div" }, () => z(d), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(lv, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/use-menu-machine-context.js
var [uv, dv] = an({
	name: "MenuMachineContext",
	hookName: "useMenuMachineContext",
	providerName: "<MenuMachineProvider />",
	strict: !1
}), [fv, pv] = an({
	name: "MenuTriggerItemContext",
	hookName: "useMenuTriggerItemContext",
	providerName: "<MenuTriggerItemProvider />",
	strict: !1
}), mv = Cn("menu").parts("arrow", "arrowTip", "content", "contextTrigger", "indicator", "item", "itemGroup", "itemGroupLabel", "itemIndicator", "itemText", "positioner", "separator", "trigger", "triggerItem").build(), hv = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `menu:${e.id}:trigger:${t}` : `menu:${e.id}:trigger` : yn(n) ? n(t) : n;
}, gv = (e, t) => {
	let n = e.ids?.contextTrigger;
	return n == null ? t ? `menu:${e.id}:ctx-trigger:${t}` : `menu:${e.id}:ctx-trigger` : yn(n) ? n(t) : n;
}, _v = (e) => e.ids?.content ?? `menu:${e.id}:content`, vv = (e) => e.ids?.arrow ?? `menu:${e.id}:arrow`, yv = (e) => e.ids?.positioner ?? `menu:${e.id}:popper`, bv = (e, t) => e.ids?.group?.(t) ?? `menu:${e.id}:group:${t}`, xv = (e, t) => `${e.id}/${t}`, Sv = (e) => e?.dataset.value ?? null, Cv = (e, t) => e.ids?.groupLabel?.(t) ?? `menu:${e.id}:group-label:${t}`, wv = (e) => e.getById(_v(e)), Tv = (e) => e.getById(yv(e)), Ev = (e) => e.getById(hv(e)), Dv = (e, t) => t ? e.getById(xv(e, t)) : null, Ov = (e) => e.getById(gv(e)), kv = (e) => ze(e.getRootNode(), `[data-scope="menu"][data-part="trigger"]${Pt(e.id)}`), Av = (e) => ze(e.getRootNode(), `[data-scope="menu"][data-part="context-trigger"]${Pt(e.id)}`), jv = (e, t) => t == null ? Ev(e) ?? kv(e)[0] : e.getById(hv(e, t)), Mv = (e) => {
	let t = `[role^="menuitem"]${Pt(_v(e))}:not([data-disabled])`;
	return ze(wv(e), t);
}, Nv = (e) => Dn(Mv(e)), Pv = (e) => xn(Mv(e)), Fv = (e, t) => t ? e.id === t || e.dataset.value === t : !1, Iv = (e, t) => {
	let n = Mv(e), r = n.findIndex((e) => Fv(e, t.value));
	return Qt(n, r, { loop: t.loop ?? t.loopFocus });
}, Lv = (e, t) => {
	let n = Mv(e), r = n.findIndex((e) => Fv(e, t.value));
	return mn(n, r, { loop: t.loop ?? t.loopFocus });
}, Rv = (e, t) => {
	let n = Mv(e), r = n.find((e) => Fv(e, t.value));
	return Wa(n, {
		state: t.typeaheadState,
		key: t.key,
		activeId: r?.id ?? null
	});
}, zv = (e) => sn(e) && (e.dataset.disabled === "" || e.hasAttribute("disabled")), Bv = (e) => !!e?.getAttribute("role")?.startsWith("menuitem") && !!e?.hasAttribute("data-controls"), Vv = "menu:select";
function Hv(e, t) {
	if (!e) return;
	let n = new (Sn(e)).CustomEvent(Vv, { detail: { value: t } });
	e.dispatchEvent(n);
}
function Uv(e) {
	let t = _v(e);
	return wv(e) ?? e.getDoc().getElementById(t);
}
function Wv(e, t) {
	if (!sn(e)) return !1;
	for (let n in t) {
		let r = t[n], i = Uv(r.scope);
		if (i && pt(i, e)) return !0;
		let a = r.refs.get("children");
		if (Object.keys(a).length > 0 && Wv(e, a)) return !0;
	}
	return !1;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+rect-utils@1.43.3/node_modules/@zag-js/rect-utils/dist/rect.mjs
var Gv = (e, t) => ({
	x: e,
	y: t
});
function Kv(e) {
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
		center: Gv(a, o)
	};
}
function qv(e) {
	return {
		top: Gv(e.minX, e.minY),
		right: Gv(e.maxX, e.minY),
		bottom: Gv(e.maxX, e.maxY),
		left: Gv(e.minX, e.maxY)
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+rect-utils@1.43.3/node_modules/@zag-js/rect-utils/dist/polygon.mjs
function Jv(e, t) {
	let { top: n, right: r, left: i, bottom: a } = qv(Kv(e)), [o] = t.split("-");
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
function Yv(e, t) {
	let { x: n, y: r } = t, i = !1;
	for (let t = 0, a = e.length - 1; t < e.length; a = t++) {
		let o = e[t].x, s = e[t].y, c = e[a].x, l = e[a].y;
		s > r != l > r && n < (c - o) * (r - s) / (l - s) + o && (i = !i);
	}
	return i;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+menu@1.43.3/node_modules/@zag-js/menu/dist/menu.utils.mjs
function Xv(e) {
	let t = e.parent;
	for (; t && t.context.get("isSubmenu");) t = t.refs.get("parent");
	t?.send({ type: "CLOSE" });
}
function Zv(e, t) {
	return e ? Yv(e, t) : !1;
}
function Qv(e, t, n) {
	let r = Object.keys(e).length > 0;
	if (!t) return null;
	if (!r) return xv(n, t);
	for (let n in e) {
		let r = e[n], i = hv(r.scope);
		if (i === t) return i;
	}
	return xv(n, t);
}
function $v(e, t) {
	e && (e.refs.set("pointerRoutingLocked", t), e.context.set("pointerRoutingMode", t ? "locked" : "interactive"));
}
function ey(e) {
	let t = e.context.get("highlightedValue");
	if (!t) return !1;
	let n = e.refs.get("children");
	for (let e in n) {
		let r = n[e];
		if (r.state.hasTag("open") && hv(r.scope) === t) return !0;
	}
	return !1;
}
function ty(e, t) {
	e && (e.refs.get("pointerRoutingLocked") || t && ey(e) || $v(e, !1));
}
function ny(e) {
	e && (ey(e) || $v(e, !1));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+menu@1.43.3/node_modules/@zag-js/menu/dist/menu.connect.mjs
function ry(e, t) {
	let { context: n, send: r, state: i, computed: a, prop: o, scope: s } = e, c = i.hasTag("open"), l = n.get("isSubmenu"), u = a("isTypingAhead"), d = o("composite"), f = n.get("currentPlacement"), p = f ? Yo(f) : void 0, m = n.get("anchorPoint"), h = n.get("highlightedValue"), g = n.get("triggerValue"), _ = ms({
		...o("positioning"),
		placement: f
	});
	function v(e) {
		return {
			id: xv(s, e.value),
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
	function b(e) {
		return {
			...v(y(e)),
			checked: !!e.checked
		};
	}
	function x(e) {
		let { closeOnSelect: n, valueText: i, value: a } = e, o = v(e), c = xv(s, a);
		return t.element({
			...mv.item.attrs,
			id: c,
			role: "menuitem",
			"aria-disabled": ln(o.disabled),
			"data-disabled": Z(o.disabled),
			"data-ownedby": _v(s),
			"data-highlighted": Z(o.highlighted),
			"data-value": a,
			"data-valuetext": i,
			onDragStart(e) {
				e.currentTarget.matches("a[href]") && e.preventDefault();
			},
			onPointerMove(e) {
				if (o.disabled || e.pointerType !== "mouse" || Fo() !== "pointer") return;
				let t = e.currentTarget;
				if (o.highlighted) return;
				let i = st(e);
				r({
					type: "ITEM_POINTERMOVE",
					id: c,
					target: t,
					closeOnSelect: n,
					point: i
				});
			},
			onPointerLeave(e) {
				if (o.disabled || e.pointerType !== "mouse" || Fo() !== "pointer") return;
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
				if (Rn(e) || Ye(e) || o.disabled) return;
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
			return t.addEventListener(Vv, n), () => t.removeEventListener(Vv, n);
		},
		getContextTriggerProps(e = {}) {
			let { value: n } = e, i = n != null && g === n, a = gv(s, n);
			return t.element({
				...mv.contextTrigger.attrs,
				dir: o("dir"),
				id: a,
				"data-ownedby": s.id,
				"data-value": n,
				"data-current": Z(i),
				"data-state": c ? "open" : "closed",
				onPointerDown(e) {
					if (e.pointerType === "mouse") return;
					let t = st(e);
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
					let t = st(e);
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
			return vt(x({ value: t.id }), t);
		},
		getTriggerProps(n = {}) {
			let { value: i } = n, a = i != null && g === i, u = hv(s, i);
			return t.button({
				...l ? mv.triggerItem.attrs : mv.trigger.attrs,
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
				"aria-controls": _v(s),
				"data-controls": _v(s),
				"aria-expanded": i == null ? c : c && a,
				"data-state": c ? "open" : "closed",
				onPointerMove(e) {
					if (e.pointerType !== "mouse" || zv(e.currentTarget) || !l) return;
					let t = st(e);
					r({
						type: "TRIGGER_POINTERMOVE",
						target: e.currentTarget,
						point: t
					});
				},
				onPointerLeave(t) {
					if (zv(t.currentTarget) || t.pointerType !== "mouse" || !l) return;
					$v(e.refs.get("parent"), !0);
					let n = st(t);
					r({
						type: "TRIGGER_POINTERLEAVE",
						target: t.currentTarget,
						point: n
					});
				},
				onPointerDown(e) {
					zv(e.currentTarget) || ht(e) || e.preventDefault();
				},
				onClick(e) {
					e.defaultPrevented || zv(e.currentTarget) || r({
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
					}[at(e, {
						orientation: "vertical",
						dir: o("dir")
					})];
					t && (e.preventDefault(), t(e));
				}
			});
		},
		getIndicatorProps() {
			return t.element({
				...mv.indicator.attrs,
				dir: o("dir"),
				"data-state": c ? "open" : "closed"
			});
		},
		getPositionerProps() {
			return t.element({
				...mv.positioner.attrs,
				dir: o("dir"),
				id: yv(s),
				style: _.floating
			});
		},
		getArrowProps() {
			return t.element({
				id: vv(s),
				...mv.arrow.attrs,
				dir: o("dir"),
				style: _.arrow
			});
		},
		getArrowTipProps() {
			return t.element({
				...mv.arrowTip.attrs,
				dir: o("dir"),
				style: _.arrowTip
			});
		},
		getContentProps() {
			return t.element({
				...mv.content.attrs,
				id: _v(s),
				"aria-label": o("aria-label"),
				hidden: !c,
				"data-state": c ? "open" : "closed",
				role: d ? "menu" : "dialog",
				tabIndex: 0,
				dir: o("dir"),
				"aria-activedescendant": a("highlightedId") || void 0,
				"aria-labelledby": m ? gv(s, g ?? void 0) : hv(s, g ?? void 0),
				"data-placement": f,
				"data-side": p,
				onPointerEnter(e) {
					e.pointerType === "mouse" && r({ type: "MENU_POINTERENTER" });
				},
				onKeyDown(e) {
					if (e.defaultPrevented || !pt(e.currentTarget, Ge(e))) return;
					let t = Ge(e);
					if (t?.closest("[role=menu]") !== e.currentTarget && t !== e.currentTarget) return;
					if (e.key === "Tab" && !va(e)) {
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
					}, i = n[at(e, { dir: o("dir") })];
					if (i) {
						i(e), e.stopPropagation(), e.preventDefault();
						return;
					}
					o("typeahead") && xt(e) && (Ct(e) || Tn(t) || (r({
						type: "TYPEAHEAD",
						key: e.key
					}), e.preventDefault()));
				}
			});
		},
		getSeparatorProps() {
			return t.element({
				...mv.separator.attrs,
				role: "separator",
				dir: o("dir"),
				"aria-orientation": "horizontal"
			});
		},
		getItemState: v,
		getItemProps: x,
		getOptionItemState: b,
		getOptionItemProps(e) {
			let { type: n, disabled: i, closeOnSelect: a } = e, s = y(e), c = b(e);
			return {
				...x(s),
				...t.element({
					"data-type": n,
					...mv.item.attrs,
					dir: o("dir"),
					"data-value": s.value,
					role: `menuitem${n}`,
					"aria-checked": !!c.checked,
					"data-state": c.checked ? "checked" : "unchecked",
					onClick(e) {
						if (i || Rn(e) || Ye(e)) return;
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
			let n = b(gt(e)), r = n.checked ? "checked" : "unchecked";
			return t.element({
				...mv.itemIndicator.attrs,
				dir: o("dir"),
				"data-disabled": Z(n.disabled),
				"data-highlighted": Z(n.highlighted),
				"data-state": Et(e, "checked") ? r : void 0,
				hidden: Et(e, "checked") ? !n.checked : void 0
			});
		},
		getItemTextProps(e) {
			let n = b(gt(e)), r = n.checked ? "checked" : "unchecked";
			return t.element({
				...mv.itemText.attrs,
				dir: o("dir"),
				"data-disabled": Z(n.disabled),
				"data-highlighted": Z(n.highlighted),
				"data-state": Et(e, "checked") ? r : void 0
			});
		},
		getItemGroupLabelProps(e) {
			return t.element({
				...mv.itemGroupLabel.attrs,
				id: Cv(s, e.htmlFor),
				dir: o("dir")
			});
		},
		getItemGroupProps(e) {
			return t.element({
				id: bv(s, e.id),
				...mv.itemGroup.attrs,
				dir: o("dir"),
				"aria-labelledby": Cv(s, e.id),
				role: "group"
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+menu@1.43.3/node_modules/@zag-js/menu/dist/menu.machine.mjs
var { not: iy, and: ay, or: oy } = Ln(), sy = zt({
	props({ props: e }) {
		return {
			closeOnSelect: !0,
			typeahead: !0,
			composite: !0,
			loopFocus: !1,
			navigate(e) {
				Ca(e.node);
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
						triggerElement: jv(n, e)
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
			typeaheadState: { ...Wa.defaultOptions },
			positioningOverride: {}
		};
	},
	computed: {
		isRtl: ({ prop: e }) => e("dir") === "rtl",
		isTypingAhead: ({ refs: e }) => e.get("typeaheadState").keysSoFar !== "",
		highlightedId: ({ context: e, scope: t, refs: n }) => Qv(n.get("children"), e.get("highlightedValue"), t)
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
					guard: iy("isSubmenu"),
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
						guard: oy("isOpenAutoFocusEvent", "isArrowDownEvent"),
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
					guard: ay(iy("isTriggerItem"), "isOpenControlled"),
					actions: ["invokeOnClose", "releaseParentRoutingLock"]
				}, {
					guard: iy("isTriggerItem"),
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
					guard: ay("isSubmenu", "isOpenControlled"),
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
					guard: iy("isPointerRoutingLocked"),
					actions: [
						"setHighlightedItem",
						"focusMenu",
						"closeSiblingMenus"
					]
				}, { actions: ["setLastHighlightedItem", "closeSiblingMenus"] }],
				ITEM_POINTERLEAVE: {
					guard: ay(iy("isPointerRoutingLocked"), iy("isTriggerItem")),
					actions: ["clearHighlightedItem"]
				},
				ITEM_CLICK: [
					{
						guard: ay(iy("isTriggerItemHighlighted"), iy("isHighlightedItemEditable"), "closeOnSelect", "isOpenControlled"),
						actions: [
							"invokeOnSelect",
							"setOptionState",
							"closeRootMenu",
							"invokeOnClose",
							"releaseParentRoutingLock"
						]
					},
					{
						guard: ay(iy("isTriggerItemHighlighted"), iy("isHighlightedItemEditable"), "closeOnSelect"),
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
						guard: ay(iy("isTriggerItemHighlighted"), iy("isHighlightedItemEditable")),
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
			isTriggerItem: ({ event: e }) => Bv(e.target),
			isTriggerItemHighlighted: ({ event: e, scope: t, computed: n }) => !!(e.target ?? t.getById(n("highlightedId")))?.hasAttribute("data-controls"),
			isSubmenu: ({ context: e }) => e.get("isSubmenu"),
			isPointerRoutingLocked: ({ refs: e }) => e.get("pointerRoutingLocked"),
			isHighlightedItemEditable: ({ scope: e, computed: t }) => Tn(e.getById(t("highlightedId"))),
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
				return Ro({ root: e.getRootNode?.() });
			},
			trackPositioning({ context: e, prop: t, scope: n, refs: r }) {
				if (Ov(n) || Av(n).length > 0) return;
				let i = {
					...t("positioning"),
					...r.get("positioningOverride")
				};
				return e.set("currentPlacement", i.placement), fs(() => jv(n, e.get("triggerValue")), () => Tv(n), {
					...i,
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			trackInteractOutside({ refs: e, scope: t, prop: n, context: r, send: i }) {
				let a = () => wv(t), o = !0, s = (e) => Av(t).some((t) => pt(t, e));
				return dc(a, {
					type: "menu",
					defer: !0,
					exclude: [Ev(t), ...kv(t)].filter(Boolean),
					onInteractOutside: n("onInteractOutside"),
					onRequestDismiss: n("onRequestDismiss"),
					onFocusOutside(t) {
						n("onFocusOutside")?.(t);
						let r = Ge(t.detail.originalEvent);
						if (s(r)) {
							t.preventDefault();
							return;
						}
						if (Wv(r, e.get("children"))) {
							t.preventDefault();
							return;
						}
					},
					onEscapeKeyDown(t) {
						n("onEscapeKeyDown")?.(t), r.get("isSubmenu") && t.preventDefault(), Xv({ parent: e.get("parent") });
					},
					onPointerDownOutside(e) {
						n("onPointerDownOutside")?.(e);
						let t = Ge(e.detail.originalEvent);
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
				$v(i, !0);
				let a = t.getDoc();
				return en(a, "pointermove", (t) => {
					Zv(e.get("intentPolygon"), {
						x: t.clientX,
						y: t.clientY
					}) || (n({ type: "POINTER_MOVED_AWAY_FROM_SUBMENU" }), $v(i, !1));
				});
			},
			scrollToHighlightedItem({ scope: e, computed: t }) {
				let n = () => {
					Fo() !== "pointer" && Ra(e.getById(t("highlightedId")), {
						rootEl: wv(e),
						block: "nearest"
					});
				};
				return Y(() => {
					Io("virtual"), n();
				}), ba(() => wv(e), {
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
				let a = () => Tv(t), o = r.point ?? e.get("anchorPoint"), s = o ? () => ({
					width: 0,
					height: 0,
					...o
				}) : void 0, c = {
					...n("positioning"),
					...i.get("positioningOverride")
				}, l = r.value ?? e.get("triggerValue");
				fs(() => jv(t, l), a, {
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
				Lt(i) ? n("navigate")?.({
					value: a,
					node: i,
					href: i.href
				}) : queueMicrotask(() => i.click());
			},
			setIntentPolygon({ context: e, scope: t, event: n }) {
				let r = wv(t), i = e.get("currentPlacement");
				if (!r || !i) return;
				let a = Jv(r.getBoundingClientRect(), i);
				if (!a) return;
				let o = Yo(i) === "right" ? -5 : 5;
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
					let e = hv(n);
					r?.send({
						type: "HIGHLIGHTED.SUGGEST",
						value: e
					});
				}
				$v(r, !1);
			},
			unlockParentOnClose({ refs: e, context: t }) {
				ty(e.get("parent"), t.get("isSubmenu"));
			},
			setHighlightedItem({ context: e, event: t }) {
				let n = t.value || Sv(t.target);
				e.set("highlightedValue", n);
			},
			clearHighlightedItem({ context: e }) {
				e.set("highlightedValue", null);
			},
			focusMenu({ scope: e }) {
				Y(() => {
					let t = wv(e);
					_a({
						root: t,
						enabled: !pt(t, e.getActiveElement()),
						filter(e) {
							return !e.role?.startsWith("menuitem");
						}
					})?.focus({ preventScroll: !0 });
				});
			},
			highlightFirstItem({ context: e, scope: t }) {
				(wv(t) ? queueMicrotask : Y)(() => {
					let n = Nv(t);
					n && e.set("highlightedValue", Sv(n));
				});
			},
			highlightLastItem({ context: e, scope: t }) {
				(wv(t) ? queueMicrotask : Y)(() => {
					let n = Pv(t);
					n && e.set("highlightedValue", Sv(n));
				});
			},
			highlightNextItem({ context: e, scope: t, event: n, prop: r }) {
				let i = Iv(t, {
					loop: n.loop,
					value: e.get("highlightedValue"),
					loopFocus: r("loopFocus")
				});
				e.set("highlightedValue", Sv(i));
			},
			highlightPrevItem({ context: e, scope: t, event: n, prop: r }) {
				let i = Lv(t, {
					loop: n.loop,
					value: e.get("highlightedValue"),
					loopFocus: r("loopFocus")
				});
				e.set("highlightedValue", Sv(i));
			},
			invokeOnSelect({ context: e, prop: t, scope: n }) {
				let r = e.get("highlightedValue");
				r != null && (Hv(Dv(n, r), r), t("onSelect")?.({ value: r }));
			},
			focusTrigger({ scope: e, context: t, event: n }) {
				t.get("isSubmenu") || t.get("anchorPoint") || n.restoreFocus === !1 || queueMicrotask(() => {
					jv(e, t.get("triggerValue"))?.focus({ preventScroll: !0 });
				});
			},
			highlightMatchedItem({ scope: e, context: t, event: n, refs: r }) {
				let i = Rv(e, {
					key: n.key,
					value: t.get("highlightedValue"),
					typeaheadState: r.get("typeaheadState")
				});
				i && t.set("highlightedValue", Sv(i));
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
				if (!Bv(r)) return;
				let i = r?.getAttribute("data-uid"), a = e.get("children");
				for (let e in a) {
					if (e === i) continue;
					let r = a[e], o = r.context.get("intentPolygon");
					o && t.point && Yv(o, t.point) || (wv(n)?.focus({ preventScroll: !0 }), r.send({ type: "CLOSE" }));
				}
			},
			closeRootMenu({ refs: e }) {
				Xv({ parent: e.get("parent") });
			},
			openSubmenu({ refs: e, scope: t, computed: n }) {
				let r = t.getById(n("highlightedId"))?.getAttribute("data-uid"), i = e.get("children");
				(r ? i[r] : null)?.send({ type: "OPEN_AUTOFOCUS" });
			},
			focusParentMenu({ refs: e }) {
				e.get("parent")?.send({ type: "FOCUS_MENU" });
			},
			setLastHighlightedItem({ context: e, event: t }) {
				e.set("lastHighlightedValue", Sv(t.target));
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
				t.get("isSubmenu") && ny(e.get("parent"));
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
}), cy = (e) => {
	let t = pn(), n = Zt(), r = y(() => {
		let r = Xe(e);
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = Ut(sy, () => z(r)), a = y(() => ry(i, gn));
	return () => ({
		api: z(a),
		service: i
	});
}, ly = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open"
]);
function uy(e, t) {
	let n = g();
	k(t, !0);
	let r = L(t, "open", 15), i = K(t, ly), a = y(() => oo(i)), o = y(() => w(z(a), 2)), s = y(() => z(o)[0]), c = y(() => z(o)[1]), l = y(() => Bt()(z(c), [
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
	])), u = y(() => w(z(l), 2)), d = y(() => z(u)[0]), f = y(() => z(u)[1]), p = R_(), m = dv(), h = y(() => ({
		...z(d),
		id: z(d).id ?? n,
		open: r(),
		onOpenChange(e) {
			z(d).onOpenChange?.(e), r() !== void 0 && r(e.open);
		}
	})), _ = cy(() => z(h)), v = y(() => _().api), b = y(() => _().service), ee = ao(() => ({
		present: z(v).open,
		...z(s)
	}));
	ne(() => {
		let e = m?.(), t = p?.();
		e && t && (t.setChild(z(b)), z(v).setParent(e));
	});
	let te = y(() => p?.().getTriggerItemProps(z(v)));
	fv(() => z(te)), uv(() => z(b)), L_(() => z(v)), so(ee);
	var C = {
		get open() {
			return r();
		},
		set open(e) {
			r(e), A();
		}
	}, T = P(), E = G(T);
	return Se(E, () => z(f).children ?? S), F(e, T), x(C);
}
H(uy, { open: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-separator.svelte
var dy = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function fy(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, dy), i = R_(), a = y(() => X(i().getSeparatorProps(), r));
	return Q(e, J({
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
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(fy, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-trigger.svelte
var py = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function my(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, py), i = y(() => Bt()(r, ["value"])), a = y(() => w(z(i), 2)), o = y(() => z(a)[0]), s = y(() => z(a)[1]), c = R_(), l = pv(), u = y(() => X(c().getTriggerProps(z(o)), l?.() || {}, z(s)));
	return Q(e, J({
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
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(my, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Menu.svelte
var hy = I("<af-tooltip><!></af-tooltip>", 2), gy = ce("<svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 6 9 17l-5-5\"></path></svg>"), _y = ce("<svg viewBox=\"0 0 24 24\" width=\"8\" height=\"8\" fill=\"currentColor\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle></svg>"), vy = I("<!> ", 1), yy = I("<!> <!>", 1), by = I("<div class=\"af-kit\"><!></div>"), xy = {
	hash: "svelte-j0sh25",
	code: "af-tooltip.svelte-j0sh25 {display:block;}af-tooltip.lock.svelte-j0sh25 {display:inline-block;}[data-scope='menu'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='menu'][data-part='content'] {display:flex;flex-direction:column;min-width:128px;max-height:var(--available-height, none);padding:4px;}[data-scope='menu'][data-part='content'][hidden] {display:none;}[data-scope='menu'][data-part='item'] {position:relative;box-sizing:border-box;display:flex;align-items:center;gap:8px;padding:6px 8px;border:0 solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 4px));outline:none;font-size:14px;line-height:20px;cursor:default;-webkit-user-select:none;user-select:none;}[data-scope='menu'][data-part='item'][data-highlighted] {background-color:var(--k-accent);color:var(--k-accent-fg);}[data-scope='menu'][data-part='item'][data-danger] {color:var(--k-danger);}[data-scope='menu'][data-part='item'][data-danger][data-highlighted] {background-color:color-mix(in oklab, var(--k-danger) calc(10% + var(--k-dark, 0) * 10%), transparent);color:var(--k-danger);}[data-scope='menu'][data-part='item'][data-tone='success'] {--k-tone: var(--k-success);}[data-scope='menu'][data-part='item'][data-tone='warning'] {--k-tone: var(--k-warning);}[data-scope='menu'][data-part='item'][data-tone='info'] {--k-tone: var(--k-info);}[data-scope='menu'][data-part='item'][data-tone] {color:color-mix(in oklab, var(--k-tone) 75%, var(--k-fg));}[data-scope='menu'][data-part='item'][data-tone][data-highlighted] {background-color:color-mix(in oklab, var(--k-tone) calc(10% + var(--k-dark, 0) * 10%), transparent);color:color-mix(in oklab, var(--k-tone) 75%, var(--k-fg));}[data-scope='menu'][data-part='item'][aria-disabled='true'] {opacity:0.5;}[data-scope='menu'][data-part='item'][data-type] {padding-inline:32px 8px;}[data-scope='menu'][data-part='item-indicator'] {position:absolute;inset-inline-start:8px;display:flex;align-items:center;justify-content:center;width:14px;height:14px;pointer-events:none;}[data-scope='menu'][data-part='item-indicator'][hidden] {display:none;}[data-scope='menu'][data-part='item-indicator'] svg {flex-shrink:0;}[data-scope='menu'][data-part='item-group-label'] {box-sizing:border-box;padding:6px 8px;border:0 solid var(--k-line);font-size:14px;line-height:20px;font-weight:500;}[data-scope='menu'][data-part='content'] > [data-scope='scroll-area'][data-part='root'] {margin-inline:-4px;}[data-scope='menu'][data-part='content'] > [data-scope='scroll-area'] > [data-part='viewport'] {padding-inline:4px;}[data-scope='menu'][data-part='separator'] {height:1px;margin:4px -4px;background-color:var(--k-line);}[data-scope='menu'][data-part='item-group'].lone {display:contents;}\n  @media (forced-colors: active) {[data-scope='menu'][data-part='item'][data-highlighted], [data-scope='menu'][data-part='item'][data-tone][data-highlighted] {forced-color-adjust:none;background-color:Highlight;color:HighlightText;}[data-scope='menu'][data-part='separator'] {forced-color-adjust:none;background-color:CanvasText;}\n  }"
};
function Sy(e, t) {
	k(t, !0), ee(e, xy);
	let o = (e) => {
		var n = P(), r = G(n);
		{
			let e = y(() => c() ?? ""), n = y(() => l() ? "true" : void 0), i = y(() => l() ? C(u()) : {});
			E(r, () => my, (r, a) => {
				a(r, J({
					part: "trigger",
					class: "af-button ghost",
					get "aria-label"() {
						return z(e);
					},
					get "aria-disabled"() {
						return z(n);
					}
				}, () => z(i), {
					children: (e, n) => {
						var r = P(), i = G(r);
						le(i, t, "default", {}, null), F(e, r);
					},
					$$slots: { default: !0 }
				}));
			});
		}
		F(e, n);
	}, s = L(t, "items", 23, () => []), c = L(t, "label", 7, ""), l = L(t, "disabled", 7, !1), u = L(t, "reason", 7, ""), f = t.$$host, p = r(f), m = B(!1), h = B(null), g = y(() => z(m) && !l());
	Oe(() => {
		l() && q(m, !1);
	}), Oe(() => a(z(h), z(g), f));
	let v = y(() => !!l() && !!u()), te = !1;
	me(() => {
		z(v), te = f.shadowRoot?.activeElement?.getAttribute("part") === "trigger";
	}), Oe(() => {
		z(v), te && (te = !1, requestAnimationFrame(() => {
			let { activeElement: e, body: t } = f.ownerDocument;
			e && e !== t || f.shadowRoot?.querySelector("[part=\"trigger\"]")?.focus();
		}));
	});
	let C = (e) => e ? { "aria-description": e } : {}, w = [
		"success",
		"warning",
		"info",
		"danger"
	], ne = (e) => e.tone && w.includes(e.tone) ? e.tone : e.danger ? "danger" : void 0, D = (e) => Array.isArray(e.items), ae = y(() => (s() ?? []).flatMap((e) => D(e) ? e.items : [e]));
	function oe(e) {
		let t = z(ae).find((t) => t.id === e);
		t && !t.disabled && (t.type === "checkbox" ? d(f, "select", {
			id: t.id,
			checked: !t.checked
		}) : t.type === "radio" ? d(f, "select", {
			id: t.id,
			checked: !0
		}) : d(f, "select", { id: t.id }));
	}
	let se = (e) => e.find((e) => e.type === "radio" && e.checked)?.id, ce = y(() => (s() ?? []).filter((e) => !D(e) || e.items.length > 0)), ue = (e, t) => {
		let n = ne(e);
		return {
			value: e.id,
			disabled: e.disabled,
			part: "item",
			"data-danger": n === "danger" ? "" : void 0,
			"data-tone": n === "danger" ? void 0 : n,
			...e.disabled ? C(e.reason) : {},
			onclickcapture: e.disabled ? void 0 : () => t(e.id)
		};
	}, j = B(null), N = !1;
	function de(e) {
		!N && e && requestAnimationFrame(() => {
			let t = [...z(j)?.querySelectorAll("[data-part=\"item\"]") ?? []].find((t) => t.dataset.value === e) ?? null;
			un({ getElement: () => t });
		});
	}
	var I = {
		get items() {
			return s();
		},
		set items(e = []) {
			s(e), A();
		},
		get label() {
			return c();
		},
		set label(e = "") {
			c(e), A();
		},
		get disabled() {
			return l();
		},
		set disabled(e = !1) {
			l(e), A();
		},
		get reason() {
			return u();
		},
		set reason(e = "") {
			u(e), A();
		}
	}, R = yy(), fe = G(R);
	n(fe, {});
	var pe = U(fe, 2);
	return Ft(pe, {
		value: () => f.shadowRoot,
		children: (e, t) => {
			Qu(e, {
				get dir() {
					return p;
				},
				children: (e, t) => {
					var n = by(), r = V(n), a = () => z(g), s = (e) => {
						l() || q(m, e, !0);
					};
					E(r, () => uy, (e, t) => {
						t(e, {
							get open() {
								return a();
							},
							set open(e) {
								s(e);
							},
							positioning: {
								strategy: "fixed",
								placement: "bottom-end"
							},
							onHighlightChange: (e) => de(e.highlightedValue),
							onSelect: (e) => oe(e.value),
							onEscapeKeyDown: (e) => {
								Xn(e) && e.defaultPrevented && q(m, !1);
							},
							onRequestDismiss: (e) => {
								let t = e.detail?.targetLayer;
								(!(t instanceof Node) || !i(t, f)) && e.preventDefault();
							},
							children: (e, t) => {
								var n = yy(), r = G(n), i = (e) => {
									var t = hy();
									re(t, 1, "lock svelte-j0sh25"), W(() => b(t, "text", u()));
									var n = V(t);
									o(n), O(t), F(e, t);
								}, a = (e) => {
									o(e);
								};
								M(r, (e) => {
									z(v) ? e(i) : e(a, -1);
								});
								var s = U(r, 2);
								E(s, () => av, (e, t) => {
									t(e, {
										popover: "manual",
										get ref() {
											return z(h);
										},
										set ref(e) {
											q(h, e, !0);
										},
										children: (e, t) => {
											var n = P(), r = G(n);
											E(r, () => K_, (e, t) => {
												t(e, {
													class: "af-overlay menu",
													get ref() {
														return z(j);
													},
													set ref(e) {
														q(j, e, !0);
													},
													children: (e, t) => {
														En(e, {
															tabStop: !1,
															children: (e, t) => {
																var n = P(), r = G(n);
																{
																	let e = (e, t = S) => {
																		let n = (e, t = S) => {
																			var n = P(), r = G(n);
																			E(r, () => tv, (e, n) => {
																				n(e, {
																					part: "indicator",
																					children: (e, n) => {
																						var r = P(), i = G(r), a = (e) => {
																							var t = gy();
																							F(e, t);
																						}, o = (e) => {
																							var t = _y();
																							F(e, t);
																						};
																						M(i, (e) => {
																							t() === "checkbox" ? e(a) : e(o, -1);
																						}), F(e, r);
																					},
																					$$slots: { default: !0 }
																				});
																			}), F(e, n);
																		}, r = (e, r = S) => {
																			let i = y(() => ue(r(), (e) => t()().setHighlightedValue(e)));
																			var a = P(), o = G(a), s = (e) => {
																				var t = P(), a = G(t), o = () => !!r().checked;
																				E(a, () => W_, (e, t) => {
																					t(e, J(() => z(i), {
																						get checked() {
																							return o();
																						},
																						set checked(e) {},
																						children: (e, t) => {
																							var i = vy(), a = G(i);
																							n(a, () => r().type);
																							var o = U(a, 1, !0);
																							W(() => T(o, r().label)), F(e, i);
																						},
																						$$slots: { default: !0 }
																					}));
																				}), F(e, t);
																			}, c = (e) => {
																				var t = P(), a = G(t);
																				E(a, () => lv, (e, t) => {
																					t(e, J(() => z(i), {
																						children: (e, t) => {
																							var i = vy(), a = G(i);
																							n(a, () => r().type);
																							var o = U(a, 1, !0);
																							W(() => T(o, r().label)), F(e, i);
																						},
																						$$slots: { default: !0 }
																					}));
																				}), F(e, t);
																			}, l = (e) => {
																				var t = P(), n = G(t);
																				E(n, () => rv, (e, t) => {
																					t(e, J(() => z(i), {
																						children: (e, t) => {
																							ie();
																							var n = he();
																							W(() => T(n, r().label)), F(e, n);
																						},
																						$$slots: { default: !0 }
																					}));
																				}), F(e, t);
																			};
																			M(o, (e) => {
																				r().type === "checkbox" ? e(s) : r().type === "radio" ? e(c, 1) : e(l, -1);
																			}), F(e, a);
																		}, i = (e, t = S) => {
																			var n = P(), i = G(n), a = (e) => {
																				var n = hy();
																				W(() => b(n, "text", t().reason ?? "")), re(n, 1, "svelte-j0sh25");
																				var i = V(n);
																				r(i, t), O(n), F(e, n);
																			}, o = (e) => {
																				r(e, t);
																			};
																			M(i, (e) => {
																				t().disabled ? e(a) : e(o, -1);
																			}), F(e, n);
																		}, a = (e, t = S) => {
																			var n = yy(), r = G(n), a = (e) => {
																				var n = P(), r = G(n);
																				E(r, () => Z_, (e, n) => {
																					n(e, {
																						part: "heading",
																						children: (e, n) => {
																							ie();
																							var r = he();
																							W(() => T(r, t().heading)), F(e, r);
																						},
																						$$slots: { default: !0 }
																					});
																				}), F(e, n);
																			};
																			M(r, (e) => {
																				t().heading && e(a);
																			});
																			var o = U(r, 2);
																			_(o, 17, () => t().items, (e) => e.id, (e, t) => {
																				i(e, () => z(t));
																			}), F(e, n);
																		};
																		var o = P(), s = G(o);
																		_(s, 19, () => z(ce), (e) => D(e) ? `group:${e.id}` : `item:${e.id}`, (e, t, n) => {
																			var r = P(), o = G(r), s = (e) => {
																				var r = yy(), i = G(r), o = (e) => {
																					var t = P(), n = G(t);
																					E(n, () => fy, (e, t) => {
																						t(e, { part: "separator" });
																					}), F(e, t);
																				};
																				M(i, (e) => {
																					z(n) > 0 && e(o);
																				});
																				var s = U(i, 2), c = (e) => {
																					var n = P(), r = G(n), i = () => se(z(t).items);
																					{
																						let e = y(() => z(t).heading ? void 0 : null);
																						E(r, () => sv, (n, r) => {
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
																					F(e, n);
																				}, l = y(() => z(t).items.some((e) => e.type === "radio")), u = (e) => {
																					var n = P(), r = G(n);
																					{
																						let e = y(() => z(t).heading ? void 0 : null);
																						E(r, () => $_, (n, r) => {
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
																					F(e, n);
																				};
																				M(s, (e) => {
																					z(l) ? e(c) : e(u, -1);
																				}), F(e, r);
																			}, c = y(() => D(z(t))), l = (e) => {
																				var n = P(), r = G(n), a = () => z(t).checked ? z(t).id : void 0;
																				E(r, () => sv, (e, n) => {
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
																				}), F(e, n);
																			}, u = (e) => {
																				i(e, () => z(t));
																			};
																			M(o, (e) => {
																				z(c) ? e(s) : z(t).type === "radio" ? e(l, 1) : e(u, -1);
																			}), F(e, r);
																		}), F(e, o);
																	};
																	E(r, () => q_, (t, n) => {
																		n(t, {
																			render: e,
																			$$slots: { render: !0 }
																		});
																	});
																}
																F(e, n);
															},
															$$slots: { default: !0 }
														});
													},
													$$slots: { default: !0 }
												});
											}), F(e, n);
										},
										$$slots: { default: !0 }
									});
								}), F(e, n);
							},
							$$slots: { default: !0 }
						});
					}), O(n), we("pointermove", n, () => N = !0, !0), we("keydown", n, () => N = !1, !0), F(e, n);
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { default: !0 }
	}), F(e, R), x(I);
}
H(Sy, {
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
var [Cy, wy] = an({
	name: "NumberInputContext",
	hookName: "useNumberInputContext",
	providerName: "<NumberInputProvider />"
}), Ty = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Ey(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, Ty), i = wy(), a = y(() => X(i().getControlProps(), r));
	return Q(e, J({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(Ey, { ref: {} }, [], [], { mode: "open" });
var Dy = Cn("numberInput").parts("root", "label", "input", "control", "valueText", "incrementTrigger", "decrementTrigger", "scrubber").build();
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+number-input@1.43.3/node_modules/@zag-js/number-input/dist/cursor.mjs
function Oy(e, t) {
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
function ky(e, t, n) {
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
			let o = Ay(a, n, r), s = r === i ? o : Ay(a, n, i), c = Math.max(0, Math.min(o, n.length)), l = Math.max(c, Math.min(s, n.length));
			e.setSelectionRange(c, l);
		} catch {
			let t = e.value.length;
			e.setSelectionRange(t, t);
		}
	}
}
function Ay(e, t, n) {
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
var jy = (e) => e.ids?.root ?? `number-input:${e.id}`, My = (e) => e.ids?.input ?? `number-input:${e.id}:input`, Ny = (e) => e.ids?.incrementTrigger ?? `number-input:${e.id}:inc`, Py = (e) => e.ids?.decrementTrigger ?? `number-input:${e.id}:dec`, Fy = (e) => e.ids?.scrubber ?? `number-input:${e.id}:scrubber`, Iy = (e) => `number-input:${e.id}:cursor`, Ly = (e) => e.ids?.label ?? `number-input:${e.id}:label`, Ry = (e) => e.getById(My(e)), zy = (e) => e.getById(Ny(e)), By = (e) => e.getById(Py(e)), Vy = (e) => e.getDoc().getElementById(Iy(e)), Hy = (e, t) => {
	let n = null;
	return t === "increment" && (n = zy(e)), t === "decrement" && (n = By(e)), n;
}, Uy = (e, t) => {
	if (!kt()) return Ky(e, t), () => {
		Vy(e)?.remove();
	};
}, Wy = (e) => {
	let t = e.getDoc(), n = t.documentElement, r = t.body;
	return r.style.pointerEvents = "none", n.style.userSelect = "none", n.style.cursor = "ew-resize", () => {
		r.style.pointerEvents = "", n.style.userSelect = "", n.style.cursor = "", n.style.length || n.removeAttribute("style"), r.style.length || r.removeAttribute("style");
	};
}, Gy = (e, t) => {
	let { point: n, isRtl: r, event: i } = t, a = e.getWin(), o = ft(i.movementX, a.devicePixelRatio), s = ft(i.movementY, a.devicePixelRatio), c = o > 0 ? "increment" : o < 0 ? "decrement" : null;
	r && c === "increment" && (c = "decrement"), r && c === "decrement" && (c = "increment");
	let l = {
		x: n.x + o,
		y: n.y + s
	}, u = a.innerWidth, d = ft(7.5, a.devicePixelRatio);
	return l.x = Qe(l.x + d, u) - d, {
		hint: c,
		point: l
	};
}, Ky = (e, t) => {
	let n = e.getDoc(), r = n.createElement("div");
	r.className = "scrubber--cursor", r.id = Iy(e), Object.assign(r.style, {
		width: "15px",
		height: "15px",
		position: "fixed",
		pointerEvents: "none",
		left: "0px",
		top: "0px",
		zIndex: _n,
		transform: t ? `translate3d(${t.x}px, ${t.y}px, 0px)` : void 0,
		willChange: "transform"
	}), r.innerHTML = "\n      <svg width=\"46\" height=\"15\" style=\"left: -15.5px; position: absolute; top: 0; filter: drop-shadow(rgba(0, 0, 0, 0.4) 0px 1px 1.1px);\">\n        <g transform=\"translate(2 3)\">\n          <path fill-rule=\"evenodd\" d=\"M 15 4.5L 15 2L 11.5 5.5L 15 9L 15 6.5L 31 6.5L 31 9L 34.5 5.5L 31 2L 31 4.5Z\" style=\"stroke-width: 2px; stroke: white;\"></path>\n          <path fill-rule=\"evenodd\" d=\"M 15 4.5L 15 2L 11.5 5.5L 15 9L 15 6.5L 31 6.5L 31 9L 34.5 5.5L 31 2L 31 4.5Z\"></path>\n        </g>\n      </svg>", n.body.appendChild(r);
}, qy = {
	incrementLabel: "increment value",
	decrementLabel: "decrease value"
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+number-input@1.43.3/node_modules/@zag-js/number-input/dist/number-input.connect.mjs
function Jy(e, t) {
	let { state: n, send: r, prop: i, scope: a, computed: o } = e, s = n.hasTag("focus"), c = o("isDisabled"), l = !!i("readOnly"), u = !!i("required"), d = n.matches("scrubbing"), f = o("isValueEmpty"), p = i("invalid") === void 0 ? o("isOutOfRange") : !!i("invalid"), m = c || !o("canIncrement") || l, h = c || !o("canDecrement") || l, g = He(qy, i("translations"));
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
			Ry(a)?.focus();
		},
		getRootProps() {
			return t.element({
				id: jy(a),
				...Dy.root.attrs,
				dir: i("dir"),
				"data-disabled": Z(c),
				"data-focus": Z(s),
				"data-invalid": Z(p),
				"data-scrubbing": Z(d)
			});
		},
		getLabelProps() {
			return t.label({
				...Dy.label.attrs,
				dir: i("dir"),
				"data-disabled": Z(c),
				"data-focus": Z(s),
				"data-invalid": Z(p),
				"data-required": Z(u),
				"data-scrubbing": Z(d),
				id: Ly(a),
				htmlFor: My(a),
				onClick() {
					Y(() => {
						Ni(Ry(a));
					});
				}
			});
		},
		getControlProps() {
			return t.element({
				...Dy.control.attrs,
				dir: i("dir"),
				role: "group",
				"aria-disabled": c,
				"data-focus": Z(s),
				"data-disabled": Z(c),
				"data-invalid": Z(p),
				"data-scrubbing": Z(d),
				"aria-invalid": ln(p)
			});
		},
		getValueTextProps() {
			return t.element({
				...Dy.valueText.attrs,
				dir: i("dir"),
				"data-disabled": Z(c),
				"data-invalid": Z(p),
				"data-focus": Z(s),
				"data-scrubbing": Z(d)
			});
		},
		getInputProps() {
			return t.input({
				...Dy.input.attrs,
				dir: i("dir"),
				name: i("name"),
				form: i("form"),
				id: My(a),
				role: "spinbutton",
				defaultValue: o("formattedValue"),
				pattern: i("formatOptions") ? void 0 : i("pattern"),
				inputMode: i("inputMode"),
				"aria-invalid": ln(p),
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
					let t = Oy(e.currentTarget, a);
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
					if (e.defaultPrevented || l || rt(e)) return;
					let t = dt(e, {
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
							Ct(e) || (r({ type: "INPUT.HOME" }), e.preventDefault());
						},
						End() {
							Ct(e) || (r({ type: "INPUT.END" }), e.preventDefault());
						},
						Enter(e) {
							let t = Oy(e.currentTarget, a);
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
				...Dy.decrementTrigger.attrs,
				dir: i("dir"),
				id: Py(a),
				disabled: h,
				"data-disabled": Z(h),
				"aria-label": g.decrementLabel,
				type: "button",
				tabIndex: -1,
				"aria-controls": My(a),
				"data-scrubbing": Z(d),
				onPointerDown(e) {
					h || Le(e) && (r({
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
				...Dy.incrementTrigger.attrs,
				dir: i("dir"),
				id: Ny(a),
				disabled: m,
				"data-disabled": Z(m),
				"aria-label": g.incrementLabel,
				type: "button",
				tabIndex: -1,
				"aria-controls": My(a),
				"data-scrubbing": Z(d),
				onPointerDown(e) {
					!m && Le(e) && (r({
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
				...Dy.scrubber.attrs,
				dir: i("dir"),
				"data-disabled": Z(c),
				id: Fy(a),
				role: "presentation",
				"data-scrubbing": Z(d),
				onMouseDown(e) {
					if (c || !Le(e)) return;
					let t = st(e), n = Sn(e.currentTarget).devicePixelRatio;
					t.x -= ft(7.5, n), t.y -= ft(7.5, n), r({
						type: "SCRUBBER.PRESS_DOWN",
						point: t
					}), e.preventDefault(), Y(() => {
						Ni(Ry(a));
					});
				},
				style: { cursor: c ? void 0 : "ew-resize" }
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+number@3.6.7/node_modules/@internationalized/number/dist/private/NumberFormatter.mjs
var Yy = /* @__PURE__ */ new Map(), Xy = !1;
try {
	Xy = new Intl.NumberFormat("de-DE", { signDisplay: "exceptZero" }).resolvedOptions().signDisplay === "exceptZero";
} catch {}
var Zy = !1;
try {
	Zy = new Intl.NumberFormat("de-DE", {
		style: "unit",
		unit: "degree"
	}).resolvedOptions().style === "unit";
} catch {}
var Qy = { degree: { narrow: {
	default: "°",
	"ja-JP": " 度",
	"zh-TW": "度",
	"sl-SI": " °"
} } }, $y = class {
	constructor(e, t = {}) {
		this.numberFormatter = eb(e, t), this.options = t;
	}
	format(e) {
		let t = "";
		if (t = !Xy && this.options.signDisplay != null ? tb(this.numberFormatter, this.options.signDisplay, e) : this.numberFormatter.format(e), this.options.style === "unit" && !Zy) {
			let { unit: e, unitDisplay: n = "short", locale: r } = this.resolvedOptions();
			if (!e) return t;
			let i = Qy[e]?.[n];
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
		return !Xy && this.options.signDisplay != null && (e = {
			...e,
			signDisplay: this.options.signDisplay
		}), !Zy && this.options.style === "unit" && (e = {
			...e,
			style: "unit",
			unit: this.options.unit,
			unitDisplay: this.options.unitDisplay
		}), e;
	}
};
function eb(e, t = {}) {
	let { numberingSystem: n } = t;
	if (n && e.includes("-nu-") && (e.includes("-u-") || (e += "-u-"), e += `-nu-${n}`), t.style === "unit" && !Zy) {
		let { unit: e, unitDisplay: n = "short" } = t;
		if (!e) throw Error("unit option must be provided with style: \"unit\"");
		if (!Qy[e]?.[n]) throw Error(`Unsupported unit ${e} with unitDisplay = ${n}`);
		t = {
			...t,
			style: "decimal"
		};
	}
	let r = e + (t ? Object.entries(t).sort((e, t) => e[0] < t[0] ? -1 : 1).join() : "");
	if (Yy.has(r)) return Yy.get(r);
	let i = new Intl.NumberFormat(e, t);
	return Yy.set(r, i), i;
}
function tb(e, t, n) {
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
var nb = /* @__PURE__ */ RegExp("^.*\\(.*\\).*$"), rb = [
	"latn",
	"arab",
	"hanidec",
	"deva",
	"beng",
	"fullwide"
], ib = class {
	constructor(e, t = {}) {
		this.locale = e, this.options = t;
	}
	parse(e) {
		return ob(this.locale, this.options, e).parse(e);
	}
	isValidPartialNumber(e, t, n) {
		return ob(this.locale, this.options, e).isValidPartialNumber(e, t, n);
	}
	getNumberingSystem(e) {
		return ob(this.locale, this.options, e).options.numberingSystem;
	}
}, ab = /* @__PURE__ */ new Map();
function ob(e, t, n) {
	let r = sb(e, t);
	if (!e.includes("-nu-") && !r.isValidPartialNumber(n)) {
		for (let i of rb) if (i !== r.options.numberingSystem) {
			let r = sb(e + (e.includes("-u-") ? "-nu-" : "-u-nu-") + i, t);
			if (r.isValidPartialNumber(n)) return r;
		}
	}
	return r;
}
function sb(e, t) {
	let n = e + (t ? Object.entries(t).sort((e, t) => e[0] < t[0] ? -1 : 1).join() : ""), r = ab.get(n);
	return r || (r = new cb(e, t), ab.set(n, r)), r;
}
var cb = class {
	constructor(e, t = {}) {
		this.locale = e, t.roundingIncrement !== 1 && t.roundingIncrement != null && (t.maximumFractionDigits == null && t.minimumFractionDigits == null ? (t.maximumFractionDigits = 0, t.minimumFractionDigits = 0) : t.maximumFractionDigits == null ? t.maximumFractionDigits = t.minimumFractionDigits : t.minimumFractionDigits ??= t.maximumFractionDigits), this.formatter = new Intl.NumberFormat(e, t), this.options = this.formatter.resolvedOptions(), this.symbols = db(e, this.formatter, this.options, t), this.options.style === "percent" && ((this.options.minimumFractionDigits ?? 0) > 18 || (this.options.maximumFractionDigits ?? 0) > 18) && console.warn("NumberParser cannot handle percentages with greater than 18 decimal places, please reduce the number in your options.");
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
			return new ib(this.locale, e).parse(new $y(this.locale, e).format(r));
		}
		return this.options.currencySign === "accounting" && nb.test(e) && (r = -1 * r), r;
	}
	sanitize(e) {
		let t = this.formatter.resolvedOptions().useGrouping;
		return this.symbols.noNumeralUnits.length > 0 && this.symbols.noNumeralUnits.find((t) => t.unit === e) ? this.symbols.noNumeralUnits.find((t) => t.unit === e).value.toString() : (e = e.replace(this.symbols.literals, ""), this.symbols.minusSign && (e = e.replace("-", this.symbols.minusSign)), this.options.numberingSystem === "arab" && (this.symbols.decimal && (e = fb(e, ",", this.symbols.decimal), e = fb(e, "،", this.symbols.decimal)), this.symbols.group && t && (e = fb(e, ".", this.symbols.group))), this.symbols.group === "’" && e.includes("'") && t && (e = fb(e, "'", this.symbols.group)), this.symbols.group === "'" && e.includes("’") && t && (e = fb(e, "’", this.symbols.group)), this.options.locale === "fr-FR" && this.symbols.group && t && (e = fb(e, " ", this.symbols.group), e = fb(e, /\u00A0/g, this.symbols.group)), e);
	}
	isValidPartialNumber(e, t = -Infinity, n = Infinity) {
		let r = this.formatter.resolvedOptions().useGrouping;
		return e = this.sanitize(e), this.symbols.minusSign && e.startsWith(this.symbols.minusSign) && t < 0 ? e = e.slice(this.symbols.minusSign.length) : this.symbols.plusSign && e.startsWith(this.symbols.plusSign) && n > 0 && (e = e.slice(this.symbols.plusSign.length)), this.symbols.decimal && e.indexOf(this.symbols.decimal) > -1 && this.options.maximumFractionDigits === 0 ? !1 : (this.symbols.group && r && (e = fb(e, this.symbols.group, "")), e = e.replace(this.symbols.numeral, ""), this.symbols.decimal && (e = e.replace(this.symbols.decimal, "")), e.length === 0);
	}
}, lb = /* @__PURE__ */ new Set([
	"decimal",
	"fraction",
	"integer",
	"minusSign",
	"plusSign",
	"group"
]), ub = [
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
function db(e, t, n, r) {
	let i = new Intl.NumberFormat(e, {
		...n,
		minimumSignificantDigits: 1,
		maximumSignificantDigits: 21,
		roundingIncrement: 1,
		roundingPriority: "auto",
		roundingMode: "halfExpand",
		useGrouping: !0
	}), a = i.formatToParts(-10000.111), o = i.formatToParts(10000.111), s = ub.map((e) => i.formatToParts(e)), c = s.map((e, t) => {
		let n = e.find((e) => e.type === "unit");
		return n && !e.some((e) => e.type === "integer" || e.type === "fraction") ? {
			unit: n.value,
			value: ub[t]
		} : null;
	}).filter((e) => !!e), l = a.find((e) => e.type === "minusSign")?.value ?? "-", u = o.find((e) => e.type === "plusSign")?.value;
	!u && (r?.signDisplay === "exceptZero" || r?.signDisplay === "always") && (u = "+");
	let d = new Intl.NumberFormat(e, {
		...n,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).formatToParts(.001).find((e) => e.type === "decimal")?.value, f = a.find((e) => e.type === "group")?.value, p = a.filter((e) => !lb.has(e.type)).map((e) => pb(e.value)), m = s.flatMap((e) => e.filter((e) => !lb.has(e.type)).map((e) => pb(e.value))), h = [.../* @__PURE__ */ new Set([...p, ...m])].sort((e, t) => t.length - e.length), g = h.length === 0 ? /* @__PURE__ */ RegExp("\\p{White_Space}|\\p{Cf}", "gu") : RegExp(`${h.join("|")}|\\p{White_Space}|\\p{Cf}`, "gu"), _ = [...new Intl.NumberFormat(n.locale, { useGrouping: !1 }).format(9876543210)].reverse(), v = new Map(_.map((e, t) => [e, t])), y = RegExp(`[${_.join("")}]`, "g");
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
function fb(e, t, n) {
	return e.replaceAll ? e.replaceAll(t, n) : e.split(t).join(n);
}
function pb(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+number-input@1.43.3/node_modules/@zag-js/number-input/dist/number-input.utils.mjs
var mb = (e, t = {}) => new Intl.NumberFormat(e, t), hb = (e, t = {}) => new ib(e, t), gb = (e, t) => {
	let { prop: n, computed: r } = t;
	return n("formatOptions") ? e === "" ? NaN : r("parser").parse(e) : parseFloat(e);
}, _b = (e, t) => {
	let { prop: n, computed: r } = t;
	return Number.isNaN(e) ? "" : n("formatOptions") ? r("formatter").format(e) : e.toString();
}, vb = (e, t) => {
	let n = e !== void 0 && !Number.isNaN(e) ? e : 1;
	return t?.style === "percent" && (e === void 0 || Number.isNaN(e)) && (n = .01), n;
}, { choose: yb, guards: bb, createMachine: xb } = Fn(), { not: Sb, and: Cb } = bb, wb = xb({
	props({ props: e }) {
		let t = vb(e.step, e.formatOptions);
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
					let r = gb(t, {
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
		valueAsNumber: ({ context: e, computed: t, prop: n }) => gb(e.get("value"), {
			computed: t,
			prop: n
		}),
		formattedValue: ({ computed: e, prop: t }) => _b(e("valueAsNumber"), {
			computed: e,
			prop: t
		}),
		isAtMin: ({ computed: e, prop: t }) => ot(e("valueAsNumber"), t("min")),
		isAtMax: ({ computed: e, prop: t }) => tn(e("valueAsNumber"), t("max")),
		isOutOfRange: ({ computed: e, prop: t }) => !ct(e("valueAsNumber"), t("min"), t("max")),
		isValueEmpty: ({ context: e }) => e.get("value") === "",
		isDisabled: ({ prop: e, context: t }) => !!e("disabled") || t.get("fieldsetDisabled"),
		canIncrement: ({ prop: e, computed: t }) => e("allowOverflow") || !t("isAtMax"),
		canDecrement: ({ prop: e, computed: t }) => e("allowOverflow") || !t("isAtMin"),
		valueText: ({ prop: e, context: t }) => He(qy, e("translations")).valueText?.(t.get("value")),
		formatter: Mi(({ prop: e }) => [e("locale"), e("formatOptions")], ([e, t]) => mb(e, t)),
		parser: Mi(({ prop: e }) => [e("locale"), e("formatOptions")], ([e, t]) => hb(e, t))
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
						guard: Cb("clampValueOnBlur", Sb("isValueEmpty"), Sb("isInRange")),
						target: "idle",
						actions: [
							"setClampedValue",
							"clearHint",
							"invokeOnBlur",
							"invokeOnValueCommit"
						]
					},
					{
						guard: Sb("isInRange"),
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
			entry: yb([{
				guard: "isIncrementHint",
				actions: ["increment"]
			}, {
				guard: "isDecrementHint",
				actions: ["decrement"]
			}]),
			on: {
				CHANGE_DELAY: {
					target: "spinning",
					guard: Cb("isInRange", "spinOnPress")
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
				return Zi(Ry(t), {
					onFieldsetDisabledChange(t) {
						e.set("fieldsetDisabled", t);
					},
					onFormReset() {
						e.set("value", e.initial("value"));
					}
				});
			},
			setupVirtualCursor({ context: e, scope: t }) {
				return Uy(t, e.get("scrubberCursorPoint"));
			},
			preventTextSelection({ scope: e }) {
				return Wy(e);
			},
			trackButtonDisabled({ context: e, scope: t, send: n }) {
				return ba(Hy(t, e.get("hint")), {
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
				let r = Ry(e);
				if (!r || !e.isActiveElement(r) || !n("allowMouseWheel")) return;
				function i(e) {
					e.preventDefault();
					let n = Math.sign(e.deltaY) * -1;
					n === 1 ? t({ type: "VALUE.INCREMENT" }) : n === -1 && t({ type: "VALUE.DECREMENT" });
				}
				return en(r, "wheel", i, { passive: !1 });
			},
			activatePointerLock({ scope: e }) {
				if (!kt()) return Aa(e.getDoc());
			},
			trackMousemove({ scope: e, send: t, context: n, computed: r }) {
				let i = e.getDoc();
				function a(i) {
					let a = Gy(e, {
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
				return it(en(i, "mousemove", a, !1), en(i, "mouseup", o, !1));
			}
		},
		actions: {
			focusInput({ scope: e, prop: t }) {
				if (!t("focusInputOnChange")) return;
				let n = Ry(e);
				e.isActiveElement(n) || Y(() => n?.focus({ preventScroll: !0 }));
			},
			increment({ context: e, event: t, prop: n, computed: r }) {
				let i = Ie(r("valueAsNumber"), t.step ?? n("step"));
				n("allowOverflow") || (i = ut(i, n("min"), n("max"))), e.set("value", _b(i, {
					computed: r,
					prop: n
				}));
			},
			decrement({ context: e, event: t, prop: n, computed: r }) {
				let i = rn(r("valueAsNumber"), t.step ?? n("step"));
				n("allowOverflow") || (i = ut(i, n("min"), n("max"))), e.set("value", _b(i, {
					computed: r,
					prop: n
				}));
			},
			setClampedValue({ context: e, prop: t, computed: n }) {
				let r = ut(n("valueAsNumber"), t("min"), t("max"));
				e.set("value", _b(r, {
					computed: n,
					prop: t
				}));
			},
			setRawValue({ context: e, event: t, prop: n, computed: r }) {
				let i = typeof t.value == "number" ? t.value : gb(t.value, {
					computed: r,
					prop: n
				});
				n("allowOverflow") || (i = ut(i, n("min"), n("max"))), e.set("value", _b(i, {
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
				let r = _b(t("max"), {
					computed: n,
					prop: t
				});
				e.set("value", r);
			},
			decrementToMin({ context: e, prop: t, computed: n }) {
				let r = _b(t("min"), {
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
				let i = t.type.endsWith("CHANGE") ? e.get("value") : n("formattedValue"), a = Ry(r), o = t.selection ?? Oy(a, r);
				Y(() => {
					qi(a, i), ky(a, o, r);
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
				let n = Vy(t), r = e.get("scrubberCursorPoint");
				n && r && (n.style.transform = `translate3d(${r.x}px, ${r.y}px, 0px)`);
			}
		}
	}
}), Tb = (e = {}) => {
	let t = pn(), n = Zt(), r = Ku(), i = y(() => {
		let i = Xe(e);
		return Nn(i, ["id"]), {
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
	}), a = Ut(wb, () => z(i)), o = y(() => Jy(a, gn));
	return () => z(o);
}, Eb = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"value"
]);
function Db(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = L(t, "value", 7), i = K(t, Eb), a = y(() => X(r()().getRootProps(), i));
	return Cy(() => r()()), Q(e, J({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		},
		get value() {
			return r();
		},
		set value(e) {
			r(e), A();
		}
	});
}
H(Db, {
	ref: {},
	value: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/NumberInput.svelte
var Ob = (e, t = S) => {
	var n = zb(), r = ye(n);
	W(() => j(r, "d", t())), F(e, n);
};
function kb(e) {
	let t = Ar(e);
	return class extends t {
		attributeChangedCallback(e, t, n) {
			super.attributeChangedCallback(e, t, e === "value" && n !== null && n.trim() === "" ? null : n);
		}
	};
}
var Ab = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
function jb(e) {
	try {
		return new Intl.NumberFormat("en", {
			style: "currency",
			currency: e
		}).resolvedOptions().maximumFractionDigits ?? 0;
	} catch {
		return null;
	}
}
function Mb(e) {
	let [t = "", n] = String(e).split("e");
	return Math.max(0, (t.split(".")[1]?.length ?? 0) - Number(n ?? 0));
}
function Nb(e, t) {
	if (!Number.isFinite(e)) return e;
	let [n = "", r] = String(e).split("e");
	return Number(`${n}e${Number(r ?? 0) + t}`);
}
var Pb = 20, Fb = 18;
function Ib(e, t, n) {
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
var Lb = {
	comma_dot: "en-US",
	dot_comma: "de-DE",
	space_comma: "fr-FR"
}, Rb = {
	ArrowUp: [1, 1],
	ArrowDown: [-1, 1],
	PageUp: [1, 10],
	PageDown: [-1, 10]
}, zb = ce("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path></path></svg>"), Bb = I("<span id=\"af-described\" hidden=\"\"> </span>"), Vb = I("<button type=\"button\" part=\"decrement\" class=\"af-button ghost icon xs svelte-gc58zb\" tabindex=\"-1\"><!></button> <button type=\"button\" part=\"increment\" class=\"af-button ghost icon xs svelte-gc58zb\" tabindex=\"-1\"><!></button>", 1), Hb = I("<input/> <!>", 1), Ub = I("<!> <div class=\"af-kit\"><!> <!></div>", 1), Wb = {
	hash: "svelte-gc58zb",
	code: ":host {display:inline-block;max-width:100%;vertical-align:middle;}[data-scope='number-input'][data-part='root'] {display:block;}[data-scope='number-input'][data-part='control'] {display:flex;align-items:center;box-sizing:border-box;width:100%;height:36px;padding:4px 12px;border:1px solid var(--k-input);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark, 0) * 100%), transparent);box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);font-size:16px;line-height:24px;transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);}\n  @media (min-width: 48rem) {[data-scope='number-input'][data-part='control'] {font-size:14px;line-height:20px;} }[data-scope='number-input'][data-part='control'][data-steppers] {padding-right:4px;}[data-scope='number-input'][data-part='control']:has(input:focus-visible) {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring), 0 1px 2px 0 rgb(0 0 0 / 0.05);}[data-scope='number-input'][data-part='control']:has(input[aria-invalid='true']) {border-color:var(--k-danger);}[data-scope='number-input'][data-part='control']:has(input[aria-invalid='true']:focus-visible) {box-shadow:0 0 0 3px color-mix(in oklab, var(--k-danger) calc(20% + var(--k-dark, 0) * 20%), transparent), 0 1px 2px 0 rgb(0 0 0 / 0.05);}[data-scope='number-input'][data-part='control'][data-disabled] {opacity:0.5;cursor:not-allowed;}[data-scope='number-input'][data-part='input'] {flex:1;min-width:0;width:8em;height:100%;padding:0;border:0;outline:none;background:transparent;color:inherit;font:inherit;}[data-scope='number-input'][data-part='input']::placeholder {color:var(--k-muted);opacity:1;}[data-scope='number-input'][data-part='input']::selection {background:var(--k-primary);color:var(--k-primary-fg);}[data-scope='number-input'][data-part='input']:disabled {pointer-events:none;cursor:not-allowed;}.af-button.svelte-gc58zb {flex:none;}\n  @media (prefers-reduced-motion: reduce) {[data-scope='number-input'][data-part='control'] {transition:none;} }\n  @media (forced-colors: active) {[data-scope='number-input'][data-part='control']:has(input:focus-visible) {outline:2px solid;outline-offset:2px;}\n  }"
};
function Gb(e, i) {
	let a = g();
	k(i, !0), ee(e, Wb);
	let o = L(i, "value", 7, null), c = L(i, "min", 7, null), l = L(i, "max", 7, null), f = L(i, "step", 7, null), m = L(i, "precision", 7, null), h = L(i, "fractional", 7, !1), _ = L(i, "unscaled", 7, !1), b = L(i, "format", 7, "plain"), S = L(i, "currency", 7, "VND"), te = L(i, "steppers", 7, !1), C = L(i, "placeholder", 7, null), w = L(i, "label", 7, null), ne = L(i, "disabled", 7, !1), re = L(i, "locale", 7, null), ie = L(i, "separators", 7, null), D = L(i, "strings", 7, null), ae = L(i, "name", 7, null), oe = L(i, "required", 7, !1), se = L(i, "readonly", 7, !1), ce = L(i, "description", 7, null), le = L(i, "error", 7, null), ue = L(i, "invalid", 7, !1), N = i.$$host, de = r(N), I = `${a}-input`, R = y(() => u(re(), D() ?? void 0)), pe = y(() => t(re()) ? "vi-VN" : "en-GB"), he = y(() => ie() && Object.hasOwn(Lb, ie()) ? Lb[ie()] : z(pe)), H = y(() => ie() !== "none"), ge = y(() => Ab(o())), _e = y(() => Ab(c())), ve = y(() => Ab(l())), xe = y(() => b() === "currency" || b() === "percent" ? b() : "decimal"), Se = y(() => z(xe) === "percent" && !!_()), Ce = y(() => Ab(f()) !== null && f() > 0 ? f() : z(xe) === "percent" && !z(Se) ? .01 : 1), we = y(() => z(xe) === "percent" && !z(Se) ? Number((z(Ce) * 100).toFixed(10)) : z(Ce)), Ee = y(() => Ab(m()) !== null && m() >= 0), De = y(() => !z(Ee) && (!!h() || z(Se))), K = y(() => z(Ee) ? Math.min(20, Math.floor(m())) : z(De) ? z(xe) === "percent" ? Fb : Pb : Number.isInteger(z(we)) ? 0 : 2), ke = y(() => S() && jb(S()) !== null ? S().toUpperCase() : "VND"), J = y(() => ({
		...z(xe) === "currency" ? {
			style: z(xe),
			currency: z(ke),
			minimumFractionDigits: Math.min(jb(z(ke)) ?? 0, z(K)),
			maximumFractionDigits: z(K)
		} : {
			style: z(xe),
			maximumFractionDigits: z(K)
		},
		useGrouping: z(H)
	})), Ae = y(() => new Intl.NumberFormat(z(he), z(J))), je = (e) => z(Ae).format(z(Se) ? Nb(e, -2) : e), Me = y(() => z(ge) === null ? "" : je(z(ge))), Ne = y(() => Math.min(20, Math.max(z(K) + (z(xe) === "percent" && !z(Se) ? 2 : 0), Mb(z(Ce))))), Pe = (e, t = z(Ne)) => Number(e.toFixed(t)), Fe = B(null), Y = B(""), Ie = y(() => ie() === "space_comma" ? z(Y).replace(/(?<=[0-9])[ \u00a0](?=[0-9])/g, " ") : z(Y)), Le = B(!1), Re = B(!1), ze = "", Be = null;
	me(() => {
		let e = z(Me);
		e !== Be && (Be = e, Te(() => {
			z(Re) && (q(Re, !1), q(Le, !1));
		})), !z(Le) && (q(Y, e, !0), z(Fe) && z(Fe).value !== e && (z(Fe).value = e));
	});
	let Ve = B(!1), He = y(() => !!ne() || z(Ve)), Ue = y(() => [ce(), le()].filter(Boolean).join(" ")), We = Tb(() => ({
		id: a,
		ids: { input: I },
		getRootNode: () => N.shadowRoot,
		locale: z(he),
		dir: de,
		value: z(Ie),
		formatOptions: z(J),
		step: z(Ce),
		min: z(_e) ?? void 0,
		max: z(ve) ?? void 0,
		allowOverflow: !0,
		allowMouseWheel: !1,
		spinOnPress: !1,
		focusInputOnChange: !1,
		disabled: z(He),
		readOnly: !!se(),
		invalid: !!ue()
	}));
	Oe(() => {
		N.toggleAttribute("data-unparsed", z(Re));
	});
	let Ge = y(() => z(Re) ? { badInput: !0 } : oe() && z(ge) === null ? { valueMissing: !0 } : z(ge) !== null && z(_e) !== null && z(ge) < z(_e) ? { rangeUnderflow: !0 } : z(ge) !== null && z(ve) !== null && z(ge) > z(ve) ? { rangeOverflow: !0 } : {}), Ke = y(() => "badInput" in z(Ge) ? s(p(z(R), "badNumber"), { example: new Intl.NumberFormat(z(he), { useGrouping: z(H) }).format(1234.5) }) : "valueMissing" in z(Ge) ? p(z(R), "valueMissing") : "rangeUnderflow" in z(Ge) ? s(p(z(R), "numberUnderflow"), { min: je(z(_e)) }) : "rangeOverflow" in z(Ge) ? s(p(z(R), "numberOverflow"), { max: je(z(ve)) }) : "");
	Oe(() => jr(N, {
		name: ae(),
		value: z(ge) === null ? null : String(z(ge)),
		validity: z(Ge),
		message: z(Ke),
		anchor: z(Fe)
	})), Mr(N, {
		reset() {
			let e = N.getAttribute("value"), t = e === null || e.trim() === "" ? null : Ab(Number(e));
			t !== z(ge) && d(N, "change", { value: t });
		},
		disabled(e) {
			q(Ve, e, !0);
		}
	});
	function qe(e) {
		let t = z(Re);
		q(Re, !1), (e !== z(ge) || t) && d(N, "change", { value: e });
	}
	let Je = () => {
		if (z(Y).trim() === "") return null;
		let e = We().valueAsNumber;
		return z(Se) ? Nb(e, 2) : e;
	};
	function Ye() {
		if (!z(Le)) return;
		if (Ib(z(Ie), z(he), z(H))) {
			(!z(Re) || z(Y) !== ze) && d(N, "unparsed", { text: z(Y) }), ze = z(Y), q(Re, !0);
			return;
		}
		let e = Je();
		q(Le, !1), e === null || Number.isFinite(e) ? qe(e === null ? null : Pe(e)) : z(Re) && qe(z(ge));
	}
	function Xe(e, t = 1) {
		if (z(He) || se()) return;
		let n = z(Le) && !Ib(z(Ie), z(he), z(H)) ? Je() : z(ge);
		q(Le, !1);
		let r = n !== null && Number.isFinite(n) ? n : 0, i = Pe(r + e * t * z(Ce), z(De) ? Math.min(z(Ne), Math.max(Mb(r), Mb(z(Ce)))) : z(Ne));
		z(_e) !== null && (i = Math.max(i, z(_e))), z(ve) !== null && (i = Math.min(i, z(ve))), qe(i);
	}
	function Ze(e) {
		if (e.target !== z(Fe) || e.isComposing) return;
		let t = Rb[e.key];
		e.key === "Enter" ? (e.preventDefault(), Ye()) : t && (e.preventDefault(), Xe(...t));
	}
	let Qe = y(() => {
		let { onkeydown: e, onfocusout: t, oninput: n, ...r } = We().getInputProps();
		return {
			...r,
			onfocusout(e) {
				z(Re) || t?.(e);
			},
			oninput(e) {
				q(Y, e.currentTarget.value, !0), q(Le, !0), n?.(e);
			}
		};
	}), $e = y(() => z(ge) !== null && z(_e) !== null && z(ge) <= z(_e)), et = y(() => z(ge) !== null && z(ve) !== null && z(ge) >= z(ve));
	var tt = {
		get value() {
			return o();
		},
		set value(e = null) {
			o(e), A();
		},
		get min() {
			return c();
		},
		set min(e = null) {
			c(e), A();
		},
		get max() {
			return l();
		},
		set max(e = null) {
			l(e), A();
		},
		get step() {
			return f();
		},
		set step(e = null) {
			f(e), A();
		},
		get precision() {
			return m();
		},
		set precision(e = null) {
			m(e), A();
		},
		get fractional() {
			return h();
		},
		set fractional(e = !1) {
			h(e), A();
		},
		get unscaled() {
			return _();
		},
		set unscaled(e = !1) {
			_(e), A();
		},
		get format() {
			return b();
		},
		set format(e = "plain") {
			b(e), A();
		},
		get currency() {
			return S();
		},
		set currency(e = "VND") {
			S(e), A();
		},
		get steppers() {
			return te();
		},
		set steppers(e = !1) {
			te(e), A();
		},
		get placeholder() {
			return C();
		},
		set placeholder(e = null) {
			C(e), A();
		},
		get label() {
			return w();
		},
		set label(e = null) {
			w(e), A();
		},
		get disabled() {
			return ne();
		},
		set disabled(e = !1) {
			ne(e), A();
		},
		get locale() {
			return re();
		},
		set locale(e = null) {
			re(e), A();
		},
		get separators() {
			return ie();
		},
		set separators(e = null) {
			ie(e), A();
		},
		get strings() {
			return D();
		},
		set strings(e = null) {
			D(e), A();
		},
		get name() {
			return ae();
		},
		set name(e = null) {
			ae(e), A();
		},
		get required() {
			return oe();
		},
		set required(e = !1) {
			oe(e), A();
		},
		get readonly() {
			return se();
		},
		set readonly(e = !1) {
			se(e), A();
		},
		get description() {
			return ce();
		},
		set description(e = null) {
			ce(e), A();
		},
		get error() {
			return le();
		},
		set error(e = null) {
			le(e), A();
		},
		get invalid() {
			return ue();
		},
		set invalid(e = !1) {
			ue(e), A();
		}
	}, nt = Ub(), rt = G(nt);
	n(rt, {});
	var it = U(rt, 2), at = V(it), ot = (e) => {
		var t = Bb(), n = ye(t, !0);
		W(() => T(n, z(Ue))), F(e, t);
	};
	M(at, (e) => {
		z(Ue) && e(ot);
	});
	var st = U(at, 2);
	return E(st, () => Db, (e, t) => {
		t(e, {
			get value() {
				return We;
			},
			children: (e, t) => {
				var n = P(), r = G(n);
				{
					let e = y(() => te() ? "" : void 0);
					E(r, () => Ey, (t, n) => {
						n(t, {
							part: "control",
							get "data-steppers"() {
								return z(e);
							},
							onkeydowncapture: Ze,
							children: (e, t) => {
								var n = Hb(), r = G(n);
								v(r, () => ({
									...z(Qe),
									part: "input",
									value: z(Y),
									placeholder: C() || void 0,
									"aria-label": w() || C() || void 0,
									"aria-describedby": z(Ue) ? "af-described" : void 0,
									"aria-invalid": ue() || z(Re) ? "true" : void 0,
									"aria-required": oe() ? "true" : void 0,
									"aria-valuenow": z(ge) ?? void 0,
									"aria-valuemin": z(_e) ?? void 0,
									"aria-valuemax": z(ve) ?? void 0,
									"aria-valuetext": z(Y) || void 0,
									onblur: Ye
								}), void 0, void 0, void 0, "svelte-gc58zb", !0), fe(r, (e) => q(Fe, e), () => z(Fe));
								var i = U(r, 2), a = (e) => {
									var t = Vb(), n = G(t);
									Ob(V(n), () => "m6 9 6 6 6-6"), O(n);
									var r = U(n, 2);
									Ob(V(r), () => "m18 15-6-6-6 6"), O(r), W(() => {
										j(n, "aria-label", z(R).decrease), j(n, "aria-controls", I), n.disabled = z(He) || !!se() || z($e), j(r, "aria-label", z(R).increase), j(r, "aria-controls", I), r.disabled = z(He) || !!se() || z(et);
									}), be("mousedown", n, (e) => e.preventDefault()), be("click", n, () => Xe(-1)), be("mousedown", r, (e) => e.preventDefault()), be("click", r, () => Xe(1)), F(e, t);
								};
								M(i, (e) => {
									te() && e(a);
								}), F(e, n);
							},
							$$slots: { default: !0 }
						});
					});
				}
				F(e, n);
			},
			$$slots: { default: !0 }
		});
	}), O(it), F(e, nt), x(tt);
}
De(["mousedown", "click"]), H(Gb, {
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
}, kb);
//#endregion
//#region src/kit/Pager.svelte
var Kb = I("<span class=\"note svelte-1ygr0dr\"> </span>"), qb = I("<span class=\"af-spinner\" aria-hidden=\"true\"></span>"), Jb = I("<button type=\"button\" part=\"more\" class=\"af-button ghost sm more svelte-1ygr0dr\"><!> </button>"), Yb = I("<!> <!>", 1), Xb = I("<div part=\"page-size\" class=\"size svelte-1ygr0dr\"><span class=\"note svelte-1ygr0dr\" aria-hidden=\"true\"> </span> <af-select></af-select></div>", 2), Zb = I("<span part=\"range\" class=\"note svelte-1ygr0dr\"> </span>"), Qb = I("<!> <!> <button type=\"button\" part=\"prev\" class=\"af-button sm step svelte-1ygr0dr\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m15 18-6-6 6-6\"></path></svg> </button> <button type=\"button\" part=\"next\" class=\"af-button sm step svelte-1ygr0dr\"> <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m9 18 6-6-6-6\"></path></svg></button>", 1), $b = I("<span> </span>"), ex = I("<div class=\"af-kit row svelte-1ygr0dr\"><!></div> <div part=\"status\" role=\"status\" class=\"live svelte-1ygr0dr\"><!></div>", 1), tx = {
	hash: "svelte-1ygr0dr",
	code: ":host {display:block;}.row.svelte-1ygr0dr {display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;}.size.svelte-1ygr0dr {display:flex;align-items:center;gap:8px;}.note.svelte-1ygr0dr {font-size:12px;line-height:16px;color:var(--k-muted);white-space:nowrap;}.size.svelte-1ygr0dr af-select:where(.svelte-1ygr0dr) {width:76px;}button.af-button.sm.step.svelte-1ygr0dr {gap:4px;}button.af-button.sm.more.svelte-1ygr0dr {font-size:12px;line-height:16px;}.live.svelte-1ygr0dr {position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;}"
};
function nx(e, r) {
	k(r, !0), ee(e, tx);
	let i = L(r, "mode", 7, "pages"), a = L(r, "hasPrev", 7, !1), o = L(r, "hasNext", 7, !1), c = L(r, "hasMore", 7, !1), l = L(r, "busy", 7, !1), f = L(r, "pageSize", 7, null), p = L(r, "pageSizes", 7, null), m = L(r, "rangeStart", 7, null), g = L(r, "rangeEnd", 7, null), _ = L(r, "total", 7, null), v = L(r, "shown", 7, null), S = L(r, "focusNew", 7, !1), C = L(r, "controls", 7, null), w = L(r, "locale", 7, null), ne = L(r, "strings", 7, null), E = r.$$host, D = y(() => u(w(), ne() ?? void 0)), ae = (e) => {
		let t = typeof e == "string" && e.trim() !== "" ? Number(e) : e;
		return typeof t == "number" && Number.isFinite(t) ? t : null;
	}, oe = y(() => new Intl.NumberFormat(t(w()) ? "vi-VN" : "en-GB")), se = (e) => z(oe).format(e), ce = y(() => i() === "more"), le = y(() => ae(m())), ue = y(() => ae(g())), N = y(() => ae(_())), de = y(() => ae(v())), P = y(() => ae(f())), I = y(() => (p() ?? []).map(ae).filter((e) => e !== null)), R = y(() => z(le) === null || z(ue) === null ? "" : s(z(N) === null ? z(D).pageRangeOpen : z(D).pageRange, {
		start: se(z(le)),
		end: se(z(ue)),
		total: z(N) === null ? "" : se(z(N))
	})), pe = y(() => z(de) === null ? "" : s(z(N) === null ? z(D).shownOnly : z(D).shownOf, {
		shown: se(z(de)),
		total: z(N) === null ? "" : se(z(N))
	})), me = y(() => z(ce) ? !!c() || z(de) !== null : !!a() || !!o() || z(R) !== ""), he = y(() => !a() || !!l()), H = y(() => !o() || !!l()), ge = B(""), _e = B(0), ve = !1, xe = 0, Se = !1, Ce = !1, we = B(null), Ee = B(null);
	Oe(() => {
		z(de), c();
		let e = !!l();
		Te(() => {
			ve && (e && (Se = !0), Ce || (Ce = !0, queueMicrotask(De)));
		});
	});
	function De() {
		if (Ce = !1, !ve) return;
		let e = z(de), t = !!c();
		e !== null && e > xe ? (ve = !1, q(ge, s(z(D).moreLoaded, { count: se(e - xe) }), !0), q(_e, z(_e) + 1), K(e - xe)) : !l() && (Se || !t) && (ve = !1, K(0));
	}
	function K(e) {
		let t = h(), n = !t || t === document.body, r = !!z(we)?.isConnected, i = r && t === z(we), a = e > 0 ? je() : null;
		(e > 0 && S() && C() && (i || n) || n && !r) && ke(a ?? z(Ee));
	}
	function ke(e) {
		e?.isConnected && (!e.hasAttribute("tabindex") && e.tabIndex < 0 && e.setAttribute("tabindex", "-1"), e.focus());
	}
	function J(e) {
		if (!e) return null;
		let t = E.getRootNode();
		return (typeof t.getElementById == "function" ? t : document).getElementById(e);
	}
	let Ae = null;
	function je() {
		let e = J(C());
		if (!e || !Ae) return null;
		let t = [...e.children].find((e) => !Ae.has(e));
		return t instanceof HTMLElement || t instanceof SVGElement ? t : null;
	}
	function Me() {
		let e = J(C());
		for (let t of E.shadowRoot?.querySelectorAll("button[part=\"prev\"], button[part=\"next\"], button[part=\"more\"]") ?? []) "ariaControlsElements" in t && (t.ariaControlsElements = e ? [e] : null);
	}
	Oe(() => {
		C(), z(me), z(ce), c(), Me();
	});
	function Ne(e, t) {
		Me(), !e && (t === "more" && (Ae = new Set(J(C())?.children ?? []), ve = !0, xe = z(de) ?? 0, Se = !1, q(ge, "")), d(E, t, {}));
	}
	function Pe(e) {
		let t = ae(e.detail?.value);
		t !== null && d(E, "page-size-change", { pageSize: t });
	}
	var Fe = {
		get mode() {
			return i();
		},
		set mode(e = "pages") {
			i(e), A();
		},
		get hasPrev() {
			return a();
		},
		set hasPrev(e = !1) {
			a(e), A();
		},
		get hasNext() {
			return o();
		},
		set hasNext(e = !1) {
			o(e), A();
		},
		get hasMore() {
			return c();
		},
		set hasMore(e = !1) {
			c(e), A();
		},
		get busy() {
			return l();
		},
		set busy(e = !1) {
			l(e), A();
		},
		get pageSize() {
			return f();
		},
		set pageSize(e = null) {
			f(e), A();
		},
		get pageSizes() {
			return p();
		},
		set pageSizes(e = null) {
			p(e), A();
		},
		get rangeStart() {
			return m();
		},
		set rangeStart(e = null) {
			m(e), A();
		},
		get rangeEnd() {
			return g();
		},
		set rangeEnd(e = null) {
			g(e), A();
		},
		get total() {
			return _();
		},
		set total(e = null) {
			_(e), A();
		},
		get shown() {
			return v();
		},
		set shown(e = null) {
			v(e), A();
		},
		get focusNew() {
			return S();
		},
		set focusNew(e = !1) {
			S(e), A();
		},
		get controls() {
			return C();
		},
		set controls(e = null) {
			C(e), A();
		},
		get locale() {
			return w();
		},
		set locale(e = null) {
			w(e), A();
		},
		get strings() {
			return ne();
		},
		set strings(e = null) {
			ne(e), A();
		}
	}, Y = Yb(), Ie = G(Y);
	n(Ie, {});
	var Le = U(Ie, 2), Re = (e) => {
		var t = ex(), n = G(t), r = V(n), i = (e) => {
			var t = Yb(), n = G(t), r = (e) => {
				var t = Kb(), n = ye(t, !0);
				W(() => T(n, z(pe))), F(e, t);
			};
			M(n, (e) => {
				z(pe) && e(r);
			});
			var i = U(n, 2), a = (e) => {
				var t = Jb(), n = V(t), r = (e) => {
					var t = qb();
					F(e, t);
				};
				M(n, (e) => {
					l() && e(r);
				});
				var i = U(n, 1, !0);
				O(t), fe(t, (e) => q(we, e), () => z(we)), W(() => {
					j(t, "aria-controls", C() || void 0), j(t, "aria-disabled", l() ? "true" : void 0), T(i, z(D).loadMore);
				}), be("click", t, () => Ne(!!l(), "more")), F(e, t);
			};
			M(i, (e) => {
				c() && e(a);
			}), F(e, t);
		}, a = (e) => {
			var t = Qb(), n = G(t), r = (e) => {
				var t = Xb(), n = V(t), r = ye(n, !0), i = U(n, 2);
				b(i, "size", "sm"), W(() => b(i, "label", z(D).rowsPerPage)), W((e) => b(i, "value", e), [() => String(z(P))]), W((e) => b(i, "options", e), [() => z(I).map((e) => ({
					value: String(e),
					label: se(e)
				}))]), W(() => b(i, "locale", w() || void 0)), W(() => b(i, "strings", ne() ?? void 0)), re(i, 1, "svelte-1ygr0dr"), O(t), W(() => T(r, z(D).rowsPerPage)), be("change", i, Pe), F(e, t);
			};
			M(n, (e) => {
				z(P) !== null && z(I).length > 0 && e(r);
			});
			var i = U(n, 2), a = (e) => {
				var t = Zb(), n = ye(t, !0);
				W(() => T(n, z(R))), F(e, t);
			};
			M(i, (e) => {
				z(R) && e(a);
			});
			var o = U(i, 2), s = U(V(o), 1, !0);
			O(o);
			var c = U(o, 2), l = V(c, !0);
			ie(), O(c), W(() => {
				j(o, "aria-controls", C() || void 0), j(o, "aria-disabled", z(he) ? "true" : void 0), T(s, z(D).previous), j(c, "aria-controls", C() || void 0), j(c, "aria-disabled", z(H) ? "true" : void 0), T(l, z(D).next);
			}), be("click", o, () => Ne(z(he), "prev")), be("click", c, () => Ne(z(H), "next")), F(e, t);
		};
		M(r, (e) => {
			z(ce) ? e(i) : e(a, -1);
		}), O(n);
		var o = U(n, 2), s = V(o);
		te(s, () => z(_e), (e) => {
			var t = $b(), n = ye(t, !0);
			W(() => T(n, z(ge))), F(e, t);
		}), O(o), fe(o, (e) => q(Ee, e), () => z(Ee)), be("focusin", n, Me), F(e, t);
	};
	return M(Le, (e) => {
		z(me) && e(Re);
	}), F(e, Y), x(Fe);
}
De([
	"focusin",
	"click",
	"change"
]), H(nx, {
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
function rx(e) {
	let t = e.trim().split(/\s+/).filter(Boolean).map((e) => Array.from(e)[0].toUpperCase());
	return t.length === 0 ? "" : t.length === 1 ? t[0] : t[0] + t[t.length - 1];
}
var ix = I("<img alt=\"\"/>"), ax = I("<span class=\"af-avatar sm\"><!></span>"), ox = I("<span id=\"af-described\" hidden=\"\"> </span>"), sx = I("<span class=\"af-chip secondary\" part=\"chip\"><!> <span> </span> <button type=\"button\" part=\"remove\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button></span>"), cx = I("<span class=\"lead svelte-akzd1x\"><!></span>"), lx = I("<button type=\"button\" part=\"clear\" class=\"af-button ghost icon xs\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button>"), ux = I("<!> <!> <!>", 1), dx = I("<span class=\"detail\"> </span>"), fx = I("<!> <span class=\"lines\"><span class=\"name\"> </span> <!></span>", 1), px = I("<div part=\"loading\"> </div>"), mx = I("<button type=\"button\" part=\"load-more\"> </button>"), hx = I("<!> <!>", 1), gx = I("<div class=\"af-kit\"><!> <!></div>"), _x = {
	hash: "svelte-akzd1x",
	code: ".lead.svelte-akzd1x {display:inline-flex;margin-right:8px;}"
};
function vx(e, t) {
	k(t, !0), ee(e, _x);
	let i = (e, t = S) => {
		var n = ax(), r = V(n), i = (e) => {
			var n = ix();
			W(() => j(n, "src", t().avatar)), F(e, n);
		}, a = (e) => {
			var n = he();
			W((e) => T(n, e), [() => rx(t().name)]), F(e, n);
		}, o = y(() => fe(t().id)), s = (e) => {
			var t = he("?");
			F(e, t);
		};
		M(r, (e) => {
			t().avatar ? e(i) : z(o) ? e(a, 1) : e(s, -1);
		}), O(n), F(e, n);
	}, o = L(t, "people", 23, () => []), s = L(t, "source", 7, null), c = L(t, "value", 7, null), l = L(t, "multiple", 7, !1), f = L(t, "placeholder", 7, null), m = L(t, "label", 7, null), g = L(t, "loading", 7, !1), v = L(t, "locale", 7, null), b = L(t, "disabled", 7, !1), te = L(t, "strings", 7, null), C = L(t, "name", 7, null), w = L(t, "required", 7, !1), ne = L(t, "readonly", 7, !1), re = L(t, "description", 7, null), D = L(t, "error", 7, null), ae = L(t, "invalid", 7, !1), oe = t.$$host, se = r(oe), ce = y(() => u(v(), te() ?? void 0)), le = y(() => {
		let e = /* @__PURE__ */ new Set();
		return (o() ?? []).filter((t) => !e.has(t.id) && !!e.add(t.id));
	}), ue = y(() => new Map(z(le).map((e) => [e.id, e]))), N = y(() => [...new Set(Array.isArray(c()) ? c() : c() ? [c()] : [])]), de = B(null), I = B(!1), R = od((e) => e.id);
	sd(R, () => s(), () => z(N), () => {
		z(I) && R.now(z(de) ?? "");
	});
	let fe = (e) => s() ? R.named.get(e) : z(ue).get(e), pe = y(() => z(N).filter((e) => !fe(e)));
	function me(e) {
		let t = fe(e);
		return t ? t.name : g() || s() && R.pending(e) ? "…" : (s() ? R.answered(e) : z(le).length > 0) ? z(pe).length > 1 ? `${z(ce).unknownPerson} ${z(pe).indexOf(e) + 1}` : z(ce).unknownPerson : "";
	}
	let H = y(() => z(de) ?? (l() || !z(N)[0] || !s() && g() && !z(ue).has(z(N)[0]) ? "" : me(z(N)[0]))), ge = y(() => s() ? R.items : z(le).filter((e) => mr(e.name, z(de) ?? "") || mr(e.email, z(de) ?? ""))), _e = y(() => Ai({
		items: z(ge),
		itemToValue: (e) => e.id,
		itemToString: (e) => e.name
	})), ve = y(() => !!s() && (!!g() || R.busy)), xe = B(null);
	Oe(() => a(z(xe), z(I), oe));
	let Se = (e) => d(oe, "change", { value: l() ? e : e[0] ?? null }), Ce = B(!1), we = y(() => !!b() || z(Ce)), Te = y(() => z(we) || !!ne()), Ee = y(() => [re(), D()].filter(Boolean).join(" ")), De = B(null), K = -Infinity, ke = -Infinity;
	Oe(() => {
		let e = !!w() && z(N).length === 0;
		jr(oe, {
			name: C(),
			value: l() ? z(N) : z(N)[0] ?? null,
			validity: e ? { valueMissing: !0 } : {},
			message: e ? p(z(ce), "valueMissing") : "",
			anchor: z(De)
		});
	}), Mr(oe, {
		reset() {
			let e = oe.getAttribute("value"), t = e ? [e] : [];
			(t.length !== z(N).length || t.some((e, t) => e !== z(N)[t])) && Se(t);
		},
		disabled(e) {
			q(Ce, e, !0);
		}
	});
	function J(e) {
		let t = e.target;
		t === z(De) || t.closest("button") || (e.preventDefault(), z(De)?.focus());
	}
	var Ae = {
		get people() {
			return o();
		},
		set people(e = []) {
			o(e), A();
		},
		get source() {
			return s();
		},
		set source(e = null) {
			s(e), A();
		},
		get value() {
			return c();
		},
		set value(e = null) {
			c(e), A();
		},
		get multiple() {
			return l();
		},
		set multiple(e = !1) {
			l(e), A();
		},
		get placeholder() {
			return f();
		},
		set placeholder(e = null) {
			f(e), A();
		},
		get label() {
			return m();
		},
		set label(e = null) {
			m(e), A();
		},
		get loading() {
			return g();
		},
		set loading(e = !1) {
			g(e), A();
		},
		get locale() {
			return v();
		},
		set locale(e = null) {
			v(e), A();
		},
		get disabled() {
			return b();
		},
		set disabled(e = !1) {
			b(e), A();
		},
		get strings() {
			return te();
		},
		set strings(e = null) {
			te(e), A();
		},
		get name() {
			return C();
		},
		set name(e = null) {
			C(e), A();
		},
		get required() {
			return w();
		},
		set required(e = !1) {
			w(e), A();
		},
		get readonly() {
			return ne();
		},
		set readonly(e = !1) {
			ne(e), A();
		},
		get description() {
			return re();
		},
		set description(e = null) {
			re(e), A();
		},
		get error() {
			return D();
		},
		set error(e = null) {
			D(e), A();
		},
		get invalid() {
			return ae();
		},
		set invalid(e = !1) {
			ae(e), A();
		}
	}, je = ux(), Me = G(je);
	n(Me, {});
	var Ne = U(Me, 2);
	Zu(Ne, {});
	var Pe = U(Ne, 2);
	return Ft(Pe, {
		value: () => oe.shadowRoot,
		children: (e, t) => {
			Qu(e, {
				get dir() {
					return se;
				},
				children: (e, t) => {
					var n = gx(), r = V(n), a = (e) => {
						var t = ox(), n = ye(t, !0);
						W(() => T(n, z(Ee))), F(e, t);
					};
					M(r, (e) => {
						z(Ee) && e(a);
					});
					var o = U(r, 2), c = () => z(N), u = () => z(H);
					{
						let e = y(() => !!l()), t = y(() => !!ne()), n = y(() => !!ae()), r = y(() => s() ? "none" : "autohighlight");
						E(o, () => Yu, (a, o) => {
							o(a, {
								get collection() {
									return z(_e);
								},
								get multiple() {
									return z(e);
								},
								get disabled() {
									return z(we);
								},
								get readOnly() {
									return z(t);
								},
								get invalid() {
									return z(n);
								},
								get inputBehavior() {
									return z(r);
								},
								selectionBehavior: "preserve",
								positioning: {
									strategy: "fixed",
									placement: "bottom-start"
								},
								onInteractOutside: (e) => {
									let t = e.detail.originalEvent.timeStamp;
									z(De) && h() === z(De) && K >= t && ke >= K && e.preventDefault();
								},
								get scrollToIndexFn() {
									return un;
								},
								get value() {
									return c();
								},
								set value(e) {},
								get inputValue() {
									return u();
								},
								set inputValue(e) {},
								onValueChange: (e) => {
									z(de) !== null && s() && z(I) && R.search(""), q(de, null), Se(e.value);
								},
								onInputValueChange: (e) => {
									e.reason === "input-change" && (q(de, e.inputValue, !0), d(oe, "search", { query: e.inputValue }), s() && R.search(e.inputValue));
								},
								onOpenChange: (e) => {
									e.open ? s() && e.reason !== "input-change" && R.now(z(de) ?? "") : (q(de, null), R.stop());
								},
								get open() {
									return z(I);
								},
								set open(e) {
									q(I, e, !0);
								},
								children: (e, t) => {
									var n = hx(), r = G(n);
									E(r, () => Oc, (e, t) => {
										t(e, {
											part: "control",
											onmousedown: J,
											children: (e, t) => {
												var n = ux(), r = G(n), a = (e) => {
													var t = P(), n = G(t);
													_(n, 16, () => z(N), (e) => e, (e, t) => {
														let n = y(() => fe(t) ?? {
															id: t,
															name: me(t)
														});
														var r = sx(), a = V(r);
														i(a, () => z(n));
														var o = U(a, 2), s = ye(o, !0), c = U(o, 2);
														O(r), W(() => {
															T(s, z(n).name), j(c, "aria-label", `${z(ce).remove ?? ""}: ${z(n).name ?? ""}`), c.disabled = z(Te);
														}), be("click", c, () => Se(z(N).filter((e) => e !== t))), F(e, r);
													}), F(e, t);
												}, o = (e) => {
													let t = y(() => fe(z(N)[0]) ?? {
														id: z(N)[0],
														name: me(z(N)[0])
													});
													var n = cx(), r = V(n);
													i(r, () => z(t)), O(n), F(e, n);
												};
												M(r, (e) => {
													l() ? e(a) : z(N)[0] && e(o, 1);
												});
												var s = U(r, 2);
												{
													let e = y(() => f() ?? ""), t = y(() => m() || void 0), n = y(() => z(Ee) ? "af-described" : void 0), r = y(() => w() ? "true" : void 0);
													E(s, () => Ac, (i, a) => {
														a(i, {
															onfocusout: (e) => K = e.timeStamp,
															onfocusin: (e) => ke = e.timeStamp,
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
																return z(De);
															},
															set ref(e) {
																q(De, e, !0);
															}
														});
													});
												}
												var c = U(s, 2), u = (e) => {
													var t = lx();
													W(() => j(t, "aria-label", z(ce).clear)), be("click", t, () => Se([])), F(e, t);
												};
												M(c, (e) => {
													!l() && z(N)[0] && !z(Te) && e(u);
												}), F(e, n);
											},
											$$slots: { default: !0 }
										});
									});
									var a = U(r, 2);
									E(a, () => Rc, (e, t) => {
										t(e, {
											popover: "manual",
											get ref() {
												return z(xe);
											},
											set ref(e) {
												q(xe, e, !0);
											},
											children: (e, t) => {
												var n = P(), r = G(n);
												E(r, () => uo, (e, t) => {
													t(e, {
														class: "af-overlay people",
														part: "content",
														children: (e, t) => {
															En(e, {
																tabStop: !1,
																children: (e, t) => {
																	var n = hx(), r = G(n);
																	_(r, 17, () => z(_e).items, (e) => e.id, (e, t) => {
																		var n = P(), r = G(n);
																		E(r, () => Ic, (e, n) => {
																			n(e, {
																				get item() {
																					return z(t);
																				},
																				part: "option",
																				children: (e, n) => {
																					var r = fx(), a = G(r);
																					i(a, () => z(t));
																					var o = U(a, 2), s = V(o), c = ye(s, !0), l = U(s, 2), u = (e) => {
																						var n = dx(), r = ye(n, !0);
																						W(() => T(r, z(t).email)), F(e, n);
																					};
																					M(l, (e) => {
																						z(t).email && e(u);
																					}), O(o), W(() => T(c, z(t).name)), F(e, r);
																				},
																				$$slots: { default: !0 }
																			});
																		}), F(e, n);
																	});
																	var a = U(r, 2), o = (e) => {
																		var t = px(), n = ye(t, !0);
																		W(() => T(n, z(ce).loading)), F(e, t);
																	}, c = (e) => {
																		var t = hx(), n = G(t), r = (e) => {
																			var t = mx(), n = ye(t, !0);
																			W(() => T(n, z(ce).loadMore)), be("pointerdown", t, (e) => e.preventDefault()), be("click", t, () => R.more()), F(e, t);
																		};
																		M(n, (e) => {
																			s() && R.next && e(r);
																		});
																		var i = U(n, 2);
																		E(i, () => Ec, (e, t) => {
																			t(e, {
																				part: "empty",
																				children: (e, t) => {
																					ie();
																					var n = he();
																					W(() => T(n, z(ce).noResults)), F(e, n);
																				},
																				$$slots: { default: !0 }
																			});
																		}), F(e, t);
																	};
																	M(a, (e) => {
																		z(ve) ? e(o) : e(c, -1);
																	}), F(e, n);
																},
																$$slots: { default: !0 }
															});
														},
														$$slots: { default: !0 }
													});
												}), F(e, n);
											},
											$$slots: { default: !0 }
										});
									}), F(e, n);
								},
								$$slots: { default: !0 }
							});
						});
					}
					O(n), F(e, n);
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { default: !0 }
	}), F(e, je), x(Ae);
}
De(["click", "pointerdown"]), H(vx, {
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
}, Ar);
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/popover/use-popover-context.js
var [yx, bx] = an({ name: "PopoverContext" }), xx = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Sx(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, xx), i = bx(), a = y(() => X(i().getAnchorProps(), r));
	return Q(e, J({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(Sx, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/popover/popover-content.svelte
var Cx = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function wx(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, Cx), i = bx(), a = co(), o = y(() => X(i().getContentProps(), a().getPresenceProps(), r));
	function s(e) {
		a().setNode(e);
	}
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	}, l = P(), u = G(l), d = (e) => {
		Q(e, J({ as: "div" }, () => z(o), {
			[de()]: s,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = y(() => !a().unmounted);
	return M(u, (e) => {
		z(f) && e(d);
	}), F(e, l), x(c);
}
H(wx, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/popover/popover-positioner.svelte
var Tx = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Ex(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, Tx), i = bx(), a = co(), o = y(() => X(i().getPositionerProps(), r));
	var s = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	}, c = P(), l = G(c), u = (e) => {
		Q(e, J({ as: "div" }, () => z(o), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, d = y(() => !a().unmounted);
	return M(l, (e) => {
		z(d) && e(u);
	}), F(e, c), x(s);
}
H(Ex, { ref: {} }, [], [], { mode: "open" });
var Dx = Cn("popover").parts("arrow", "arrowTip", "anchor", "trigger", "indicator", "positioner", "content", "title", "description", "closeTrigger").build(), Ox = (e) => e.ids?.anchor ?? `popover:${e.id}:anchor`, kx = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `popover:${e.id}:trigger:${t}` : `popover:${e.id}:trigger` : yn(n) ? n(t) : n;
}, Ax = (e) => e.ids?.content ?? `popover:${e.id}:content`, jx = (e) => e.ids?.positioner ?? `popover:${e.id}:popper`, Mx = (e) => e.ids?.arrow ?? `popover:${e.id}:arrow`, Nx = (e) => e.ids?.title ?? `popover:${e.id}:title`, Px = (e) => e.ids?.description ?? `popover:${e.id}:desc`, Fx = (e) => e.ids?.closeTrigger ?? `popover:${e.id}:close`, Ix = (e) => e.getById(Ox(e)), Lx = (e) => e.getById(kx(e)), Rx = (e) => ze(e.getRootNode(), `[data-scope="popover"][data-part="trigger"]${Pt(e.id)}`), zx = (e, t) => t == null ? Lx(e) ?? Rx(e)[0] : e.getById(kx(e, t)), Bx = (e) => e.getById(Ax(e)), Vx = (e) => e.getById(jx(e)), Hx = (e) => e.getById(Nx(e)), Ux = (e) => e.getById(Px(e)), Wx = { closeTriggerLabel: "close" };
function Gx(e, t) {
	let { state: n, context: r, send: i, computed: a, prop: o, scope: s } = e, c = He(Wx, o("translations")), l = n.matches("open"), u = r.get("currentPlacement"), d = u ? Yo(u) : void 0, f = a("currentPortalled"), p = r.get("renderedElements"), m = r.get("triggerValue"), h = ms({
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
				id: Mx(s),
				...Dx.arrow.attrs,
				dir: o("dir"),
				style: h.arrow
			});
		},
		getArrowTipProps() {
			return t.element({
				...Dx.arrowTip.attrs,
				dir: o("dir"),
				style: h.arrowTip
			});
		},
		getAnchorProps() {
			return t.element({
				...Dx.anchor.attrs,
				dir: o("dir"),
				id: Ox(s)
			});
		},
		getTriggerProps(e = {}) {
			let { value: n } = e, r = n != null && m === n;
			return t.button({
				...Dx.trigger.attrs,
				dir: o("dir"),
				type: "button",
				"data-placement": u,
				"data-side": d,
				id: kx(s, n),
				"data-ownedby": s.id,
				"data-value": n,
				"data-current": Z(r),
				"aria-haspopup": "dialog",
				"aria-expanded": n == null ? l : l && r,
				"data-state": l ? "open" : "closed",
				"aria-controls": Ax(s),
				onPointerDown(e) {
					Le(e) && kt() && e.currentTarget.focus();
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
				...Dx.indicator.attrs,
				dir: o("dir"),
				"data-state": l ? "open" : "closed"
			});
		},
		getPositionerProps() {
			return t.element({
				id: jx(s),
				...Dx.positioner.attrs,
				dir: o("dir"),
				style: h.floating
			});
		},
		getContentProps() {
			return t.element({
				...Dx.content.attrs,
				dir: o("dir"),
				id: Ax(s),
				tabIndex: -1,
				role: "dialog",
				"aria-modal": ln(o("modal")),
				hidden: !l,
				"data-state": l ? "open" : "closed",
				"data-expanded": Z(l),
				"aria-labelledby": p.title ? Nx(s) : void 0,
				"aria-describedby": p.description ? Px(s) : void 0,
				"data-placement": u,
				"data-side": d
			});
		},
		getTitleProps() {
			return t.element({
				...Dx.title.attrs,
				id: Nx(s),
				dir: o("dir")
			});
		},
		getDescriptionProps() {
			return t.element({
				...Dx.description.attrs,
				id: Px(s),
				dir: o("dir")
			});
		},
		getCloseTriggerProps() {
			return t.button({
				...Dx.closeTrigger.attrs,
				dir: o("dir"),
				id: Fx(s),
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
var Kx = zt({
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
						triggerElement: zx(n, e)
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
				let r = Ix(n);
				return fs(() => r ?? zx(n, e.get("triggerValue")), () => Vx(n), {
					...t("positioning"),
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			trackDismissableElement({ send: e, prop: t, scope: n }) {
				let r = () => Bx(n), i = !0;
				return dc(r, {
					type: "popover",
					pointerBlocking: t("modal"),
					exclude: [Lx(n), ...Rx(n)].filter(Boolean),
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
				return e("modal") || !e("portalled") ? void 0 : Pa(() => Bx(t), {
					triggerElement: zx(t, n.get("triggerValue")),
					defer: !0,
					getShadowRoot: !0,
					onFocus(e) {
						e.focus({ preventScroll: !0 });
					}
				});
			},
			hideContentBelow({ prop: e, scope: t, context: n }) {
				return e("modal") ? cf(() => [Bx(t), zx(t, n.get("triggerValue"))], { defer: !0 }) : void 0;
			},
			preventScroll({ prop: e, scope: t }) {
				if (e("modal")) return Af(t.getDoc());
			},
			trapFocus({ prop: e, scope: t, context: n }) {
				return e("modal") ? Cf(() => Bx(t), {
					preventScroll: !0,
					returnFocusOnDeactivate: !!e("restoreFocus"),
					initialFocus: () => _a({
						root: Bx(t),
						getInitialEl: e("initialFocusEl"),
						enabled: e("autoFocus")
					}),
					setReturnFocus: (r) => {
						let i = e("finalFocusEl")?.();
						if (i) return i;
						let a = n.get("triggerValue");
						if (a) {
							let e = zx(t, a);
							if (e) return e;
						}
						return Rx(t)[0] || r;
					},
					getShadowRoot: !0
				}) : void 0;
			}
		},
		actions: {
			reposition({ event: e, prop: t, scope: n, context: r }) {
				let i = Ix(n);
				fs(() => i ?? zx(n, r.get("triggerValue")), () => Vx(n), {
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
				Y(() => {
					Object.assign(e.get("renderedElements"), {
						title: !!Hx(t),
						description: !!Ux(t)
					});
				});
			},
			setInitialFocus({ prop: e, scope: t }) {
				e("modal") || Y(() => {
					_a({
						root: Bx(t),
						getInitialEl: e("initialFocusEl"),
						enabled: e("autoFocus")
					})?.focus({ preventScroll: !0 });
				});
			},
			setFinalFocus({ event: e, prop: t, scope: n, context: r }) {
				let i = e.restoreFocus ?? e.previousEvent?.restoreFocus;
				(i == null || i) && t("restoreFocus") && Y(() => {
					let e = t("finalFocusEl")?.();
					if (e) {
						e.focus({ preventScroll: !0 });
						return;
					}
					zx(n, r.get("triggerValue"))?.focus({ preventScroll: !0 });
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
}), qx = (e) => {
	let t = pn(), n = Zt(), r = y(() => {
		let r = Xe(e) || {};
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = Ut(Kx, () => z(r)), a = y(() => Gx(i, gn));
	return () => z(a);
}, Jx = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open",
	"children"
]);
function Yx(e, t) {
	let n = g();
	k(t, !0);
	let r = L(t, "open", 15), i = L(t, "children", 7), a = K(t, Jx), o = y(() => oo(a)), s = y(() => w(z(o), 2)), c = y(() => z(s)[0]), l = y(() => z(s)[1]), u = y(() => ({
		...z(l),
		id: z(l).id ?? n,
		open: r(),
		onOpenChange(e) {
			z(l).onOpenChange?.(e), r() !== void 0 && r(e.open);
		}
	})), d = qx(() => z(u)), f = y(() => ({
		...z(c),
		present: d().open
	})), p = ao(() => z(f));
	yx(d), so(p);
	var m = {
		get open() {
			return r();
		},
		set open(e) {
			r(e), A();
		},
		get children() {
			return i();
		},
		set children(e) {
			i(e), A();
		}
	}, h = P(), _ = G(h);
	return Se(_, () => i() ?? S), F(e, h), x(m);
}
H(Yx, {
	open: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/popover/popover-trigger.svelte
var Xx = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Zx(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, Xx), i = y(() => Bt()(r, ["value"])), a = y(() => w(z(i), 2)), o = y(() => z(a)[0]), s = y(() => z(a)[1]), c = bx(), l = co(), u = y(() => {
		let e = c().getTriggerProps(z(o));
		return X({
			...e,
			"aria-controls": l().unmounted ? void 0 : e["aria-controls"]
		}, z(s));
	});
	return Q(e, J({ as: "button" }, () => z(u), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(Zx, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Popover.svelte
var Qx = I("<!> <!>", 1), $x = I("<div class=\"af-kit\"><!></div>"), eS = {
	hash: "svelte-1netzpl",
	code: "[data-scope='popover'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='popover'][data-part='anchor'] {display:inline-block;}[data-scope='popover'][data-part='content'] {min-width:min(18rem, calc(100vw - 32px));max-width:min(28rem, calc(100vw - 32px));padding:16px;outline:none;}\n  @media (forced-colors: active) {[data-scope='popover'][data-part='content']:focus-visible {outline:2px solid;outline-offset:2px;} }"
};
function tS(e, t) {
	k(t, !0), ee(e, eS);
	let r = L(t, "open", 7, !1), i = L(t, "placement", 7, "bottom-start"), o = t.$$host, s = B(null), c = "outside";
	Oe(() => a(z(s), !!r(), o));
	let l = "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])", u = !1;
	Oe(() => {
		r() && (u = !1);
	});
	let f = () => o.shadowRoot?.querySelector("slot[name=\"anchor\"]");
	function p(e) {
		let t = f()?.assignedElements() ?? [];
		for (let n = e; n; n = n.parentNode ?? (n instanceof ShadowRoot ? n.host : null)) if (t.includes(n)) return !0;
		return !1;
	}
	function m() {
		if (u) return null;
		let e = o.ownerDocument, t = !e.activeElement || e.activeElement === e.body, n = o.getRootNode().activeElement;
		if (!t && !(n && o.contains(n))) return null;
		for (let e of f()?.assignedElements() ?? []) {
			if (e.matches(l)) return e;
			let t = e.querySelector(l);
			if (t) return t;
		}
		return null;
	}
	var h = {
		get open() {
			return r();
		},
		set open(e = !1) {
			r(e), A();
		},
		get placement() {
			return i();
		},
		set placement(e = "bottom-start") {
			i(e), A();
		}
	}, g = Qx(), _ = G(g);
	n(_, {});
	var v = U(_, 2);
	return Ft(v, {
		value: () => o.shadowRoot,
		children: (e, n) => {
			var a = $x(), l = V(a);
			{
				let e = y(() => !!r()), n = y(() => ({
					strategy: "fixed",
					placement: i() || "bottom-start"
				}));
				E(l, () => Yx, (r, i) => {
					i(r, {
						get open() {
							return z(e);
						},
						closeOnEscape: !0,
						portalled: !1,
						get positioning() {
							return z(n);
						},
						finalFocusEl: m,
						onEscapeKeyDown: (e) => {
							E_(o, e) ? e.preventDefault() : Xn(e) && e.defaultPrevented ? d(o, "close", { reason: "escape" }) : c = "escape";
						},
						onInteractOutside: (e) => {
							let t = e.detail.target ?? null;
							if (p(t instanceof Node ? t : null)) {
								e.preventDefault();
								return;
							}
							c = "outside", u = !0;
						},
						onOpenChange: (e) => {
							e.open || (d(o, "close", { reason: c }), c = "outside");
						},
						children: (e, n) => {
							var r = Qx(), i = G(r);
							E(i, () => Sx, (e, n) => {
								n(e, {
									part: "anchor",
									children: (e, n) => {
										var r = P(), i = G(r);
										le(i, t, "anchor", {}, null), F(e, r);
									},
									$$slots: { default: !0 }
								});
							});
							var a = U(i, 2);
							E(a, () => Ex, (e, n) => {
								n(e, {
									popover: "manual",
									get ref() {
										return z(s);
									},
									set ref(e) {
										q(s, e, !0);
									},
									children: (e, n) => {
										var r = P(), i = G(r);
										E(i, () => wx, (e, n) => {
											n(e, {
												class: "af-overlay popover",
												part: "content",
												children: (e, n) => {
													var r = P(), i = G(r);
													le(i, t, "content", {}, null), F(e, r);
												},
												$$slots: { default: !0 }
											});
										}), F(e, r);
									},
									$$slots: { default: !0 }
								});
							}), F(e, r);
						},
						$$slots: { default: !0 }
					});
				});
			}
			O(a), F(e, a);
		},
		$$slots: { default: !0 }
	}), F(e, g), x(h);
}
H(tS, {
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
var nS = ce("<svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5\"></path><path d=\"M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5\"></path></svg>"), rS = I("<form class=\"link-form svelte-9gj0md\" novalidate=\"\"><input part=\"link-input\" type=\"url\" inputmode=\"url\" placeholder=\"https://\" class=\"svelte-9gj0md\"/> <button type=\"submit\" class=\"af-button primary\" part=\"link-apply\"> </button></form>"), iS = I("<!> <!>", 1), aS = I("<div part=\"toolbar\" class=\"toolbar svelte-9gj0md\"><button type=\"button\" part=\"tool-bold\" class=\"tool svelte-9gj0md\"><b>B</b></button> <button type=\"button\" part=\"tool-italic\" class=\"tool svelte-9gj0md\"><i>I</i></button> <button type=\"button\" part=\"tool-bullet-list\" class=\"tool svelte-9gj0md\">•</button> <button type=\"button\" part=\"tool-numbered-list\" class=\"tool svelte-9gj0md\">1.</button> <!></div>"), oS = I("<span part=\"placeholder\" class=\"placeholder svelte-9gj0md\" aria-hidden=\"true\"> </span>"), sS = I("<div class=\"mention-empty svelte-9gj0md\"> </div>"), cS = I("<div class=\"mention-title svelte-9gj0md\" part=\"mention-title\" aria-hidden=\"true\"> </div>"), lS = I("<div class=\"mention-scope svelte-9gj0md\" part=\"mention-scope\" role=\"option\" tabindex=\"-1\" data-kind=\"scope\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\" class=\"svelte-9gj0md\"><circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-3.5-3.5\"></path></svg> <span class=\"mention-name svelte-9gj0md\"> </span></div>"), uS = I("<div class=\"mention-scopes svelte-9gj0md\"></div>"), dS = I("<span class=\"mention-name svelte-9gj0md\"> </span>"), fS = I("<span class=\"mention-meta svelte-9gj0md\"> </span>"), pS = I("<span class=\"mention-meta mention-side svelte-9gj0md\"> </span>"), mS = I("<span class=\"af-avatar mention-avatar svelte-9gj0md\" aria-hidden=\"true\"> </span> <span class=\"mention-text svelte-9gj0md\"><span class=\"mention-name svelte-9gj0md\"> </span> <!></span> <!>", 1), hS = I("<div class=\"mention-option svelte-9gj0md\" part=\"mention-option\" role=\"option\" tabindex=\"-1\"><!></div>"), gS = I("<div class=\"mention-group\" role=\"group\"><!> <!></div>"), _S = I("<div class=\"af-kit editor svelte-9gj0md\"><!> <div class=\"surface svelte-9gj0md\"><!> <div part=\"content\" class=\"content svelte-9gj0md\"></div></div> <div part=\"mention-menu\" class=\"af-overlay mention-menu svelte-9gj0md\" popover=\"manual\" role=\"listbox\"><!></div></div>"), vS = {
	hash: "svelte-9gj0md",
	code: ".editor.svelte-9gj0md {display:flex;flex-direction:column;border:1px solid var(--k-line);border-radius:var(--k-radius);background:var(--k-surface);}.editor.svelte-9gj0md:focus-within {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring);}.editor[data-readonly].svelte-9gj0md {border-color:transparent;background:transparent;}.toolbar.svelte-9gj0md {display:flex;gap:2px;padding:4px;border-bottom:1px solid var(--k-line);}.tool.svelte-9gj0md, [data-scope='popover'][data-part='trigger'].tool {min-width:28px;height:28px;padding:0 6px;border:0;border-radius:4px;background:none;color:var(--k-fg);font:inherit;cursor:pointer;}\n  @media (hover: hover) {.tool.svelte-9gj0md:not(:disabled):hover, [data-scope='popover'][data-part='trigger'].tool:hover {background:color-mix(in oklab, var(--k-fg) 6%, transparent);} }.tool.svelte-9gj0md:not(:disabled):active {background:color-mix(in oklab, var(--k-fg) 10%, transparent);}.tool[aria-pressed='true'].svelte-9gj0md, [data-scope='popover'][data-part='trigger'].tool[aria-pressed='true'] {background:color-mix(in oklab, var(--k-primary) 14%, transparent);}.tool.svelte-9gj0md:disabled {opacity:0.55;cursor:default;}.tool.svelte-9gj0md:focus-visible {outline:none;box-shadow:0 0 0 3px var(--k-focus-ring);}.surface.svelte-9gj0md {position:relative;}.placeholder.svelte-9gj0md {position:absolute;inset:8px 12px auto;color:var(--k-muted);pointer-events:none;}.content.svelte-9gj0md > [contenteditable] {min-height:4.5em;padding:8px 12px;outline:none;white-space:pre-wrap;word-wrap:break-word;font-variant-ligatures:none;}.editor[data-readonly].svelte-9gj0md .content:where(.svelte-9gj0md) > [contenteditable] {min-height:0;padding:0;}.content.svelte-9gj0md p {margin:0 0 0.5em;}.content.svelte-9gj0md > [contenteditable] > :last-child {margin-bottom:0;}.content.svelte-9gj0md ul, .content.svelte-9gj0md ol {margin:0 0 0.5em;padding-left:1.5em;}.content.svelte-9gj0md a {color:var(--k-primary);}.editor[data-single-line].svelte-9gj0md .content:where(.svelte-9gj0md) > [contenteditable] {min-height:0;padding:4px 8px;white-space:nowrap;overflow:hidden;}.editor[data-single-line].svelte-9gj0md .content:where(.svelte-9gj0md) p {margin:0;}.content.svelte-9gj0md .af-mention-holder {display:inline;}.content.svelte-9gj0md .af-mention {display:inline-flex;align-items:center;gap:4px;padding:0 6px;border-radius:999px;vertical-align:baseline;background:color-mix(in oklab, var(--k-primary) 12%, transparent);color:var(--k-fg);font-size:0.95em;line-height:1.5;}.content.svelte-9gj0md .af-mention[data-state='restricted'] {background:color-mix(in oklab, var(--k-fg) 7%, transparent);color:var(--k-muted);}.content.svelte-9gj0md .af-mention[data-state='deleted'] {background:color-mix(in oklab, var(--k-fg) 7%, transparent);color:var(--k-muted);}.content.svelte-9gj0md .af-mention[data-state='deleted'] .af-mention-label {text-decoration:line-through;}.content.svelte-9gj0md .af-mention-link {color:inherit;text-decoration:none;}\n  @media (hover: hover) {.content.svelte-9gj0md .af-mention-link:hover {text-decoration:underline;} }.content.svelte-9gj0md .af-mention-avatar {width:16px;height:16px;font-size:10px;}.content.svelte-9gj0md table {border-collapse:collapse;}.content.svelte-9gj0md th, .content.svelte-9gj0md td {border:1px solid var(--k-line);padding:4px 8px;}.content.svelte-9gj0md ul[data-type='taskList'] {list-style:none;padding-left:0.25em;}.content.svelte-9gj0md ul[data-type='taskList'] li {display:flex;gap:6px;}[data-scope='popover'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}.mention-menu.svelte-9gj0md {position:fixed;inset:auto;margin:0;padding:4px;min-width:240px;max-width:360px;max-height:320px;}.mention-menu.svelte-9gj0md:popover-open {display:flex;flex-direction:column;}.mention-title.svelte-9gj0md {padding:6px 8px 2px;color:var(--k-muted);font-size:12px;font-weight:600;}.mention-option.svelte-9gj0md {display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:4px;cursor:pointer;}.mention-option[aria-selected='true'].svelte-9gj0md {background:color-mix(in oklab, var(--k-primary) 10%, transparent);}.mention-avatar.svelte-9gj0md {flex:none;width:24px;height:24px;font-size:12px;}.mention-text.svelte-9gj0md {display:flex;flex-direction:column;min-width:0;flex:1;}.mention-name.svelte-9gj0md {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.mention-meta.svelte-9gj0md {color:var(--k-muted);font-size:12px;}.mention-side.svelte-9gj0md {flex:none;}.mention-empty.svelte-9gj0md {padding:8px;color:var(--k-muted);}.mention-scopes.svelte-9gj0md {display:flex;flex-wrap:wrap;gap:4px;padding:4px 8px 6px;}.mention-scope.svelte-9gj0md {display:inline-flex;align-items:center;gap:4px;max-width:100%;padding:2px 8px;border:1px solid var(--k-line);border-radius:999px;color:var(--k-fg);font-size:12px;cursor:pointer;}.mention-scope.svelte-9gj0md svg:where(.svelte-9gj0md) {flex:none;color:var(--k-muted);}.mention-scope[aria-selected='true'].svelte-9gj0md {border-color:var(--k-primary);background:color-mix(in oklab, var(--k-primary) 10%, transparent);}.link-form.svelte-9gj0md {display:flex;gap:6px;padding:8px;}.link-form.svelte-9gj0md input:where(.svelte-9gj0md) {min-width:240px;min-height:32px;padding:0 8px;border:1px solid var(--k-line);border-radius:var(--k-radius);background:var(--k-bg);color:var(--k-fg);font:inherit;}.link-form.svelte-9gj0md input:where(.svelte-9gj0md):focus-visible {outline:none;border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring);}\n  @media (forced-colors: active) {.editor.svelte-9gj0md:focus-within {outline:2px solid;outline-offset:1px;}.tool.svelte-9gj0md:focus-visible, .link-form.svelte-9gj0md input:where(.svelte-9gj0md):focus-visible {outline:2px solid;outline-offset:1px;}\n  }"
};
function yS(e, t) {
	k(t, !0), ee(e, vS);
	let r = L(t, "value", 7, ""), i = L(t, "readonly", 7, !1), o = L(t, "placeholder", 7, null), s = L(t, "label", 7, null), c = L(t, "locale", 7, null), l = L(t, "strings", 7, null), f = L(t, "mentions", 7, null), p = L(t, "singleLine", 7, !1), m = L(t, "mentionMap", 7, null), h = t.$$host, g = y(() => u(c(), l() ?? void 0)), v = B(null), b = B(null), S = B(!0), te = B(ge({
		bold: !1,
		italic: !1,
		bulletList: !1,
		orderedList: !1,
		link: !1
	})), C = B(!1), w = B(""), ne = B(null);
	Oe(() => a(z(ne), z(C), h));
	let re = null, ie = null, D = B(null), ae = B(0), oe = B(null), se = `af-mention-${Math.random().toString(36).slice(2, 9)}`;
	Oe(() => a(z(oe), z(D) !== null, h)), Oe(() => _e(h, "keydown", (e) => {
		e.key === "Escape" && Xn(e) && e.defaultPrevented && z(D) && (z(b) && re?.(z(b).view), q(D, null));
	})), Oe(() => {
		let e = z(D)?.rect?.();
		z(oe) && e && (z(oe).style.left = `${Math.max(0, e.left)}px`, z(oe).style.top = `${e.bottom + 4}px`);
	});
	let ce = y(() => {
		let e = [];
		return (z(D)?.entries ?? []).forEach((t, n) => {
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
	async function le(e) {
		let t = z(D);
		if (!t) return;
		if (e.kind === "item") {
			t.command(e);
			return;
		}
		let n = f(), r = Qn(e);
		if (!n || !r) return;
		let i = await n(t.query, r);
		if (z(D) !== t) return;
		let a = ie?.(i) ?? [];
		q(D, {
			...t,
			entries: a
		}), q(ae, 0);
	}
	let N = (e) => e.some((e) => e.kind !== "scope"), de = (e) => !N(e.entries) && /\s/.test(e.query.trim()), I = {
		show(e) {
			q(D, de(e) ? null : e), q(ae, 0);
		},
		update(e) {
			q(D, de(e) ? null : e), q(ae, 0);
		},
		hide() {
			q(D, null);
		},
		key(e) {
			let t = z(D);
			if (!t) return !1;
			let n = t.entries.length;
			if (e.key === "Escape") return z(b) && re?.(z(b).view), q(D, null), !0;
			if (n === 0) return !1;
			if (e.key === "ArrowDown") return q(ae, (z(ae) + 1) % n), !0;
			if (e.key === "ArrowUp") return q(ae, (z(ae) - 1 + n) % n), !0;
			if (e.key === "Enter" || e.key === "Tab") {
				let e = t.entries[z(ae)];
				return e && le(e), !0;
			}
			return !1;
		}
	};
	Oe(() => {
		let e = z(b)?.view.dom;
		if (e) {
			if (z(D)) e.setAttribute("aria-haspopup", "listbox"), e.setAttribute("aria-expanded", "true"), e.setAttribute("aria-controls", se), z(D).entries.length > 0 ? e.setAttribute("aria-activedescendant", `${se}-${z(ae)}`) : e.removeAttribute("aria-activedescendant");
			else for (let t of [
				"aria-expanded",
				"aria-controls",
				"aria-activedescendant"
			]) e.removeAttribute(t);
		}
	}), Oe(() => {
		z(b) && Zn(z(b), {
			map: m() ?? null,
			strings: z(g)
		});
	});
	let R, pe = null, me = !1, he = !1, H = (e) => e.getMarkdown().replace(/\u00A0+$/gm, "").trimEnd();
	function ve() {
		if (clearTimeout(R), R = void 0, !z(b) || !me) return;
		me = !1;
		let e = H(z(b));
		e !== (r() ?? "") && e !== pe && (pe = e, d(h, "change", { value: e }));
	}
	function xe(e, t) {
		he = !1, H(e) !== t && (e.commands.setContent(t, {
			contentType: "markdown",
			emitUpdate: !1
		}), me = !1, pe = null);
	}
	function Se(e) {
		q(S, e.isEmpty, !0), q(te, {
			bold: e.isActive("bold"),
			italic: e.isActive("italic"),
			bulletList: e.isActive("bulletList"),
			orderedList: e.isActive("orderedList"),
			link: e.isActive("link")
		}, !0);
	}
	Oe(() => {
		let e = z(v);
		if (!e) return;
		let t = !!p(), n = !1, a = null;
		return import("./chunks/markdown-7fttOx98.js").then(({ createMarkdownEditor: o, exitSuggestion: s, flatten: c }) => {
			if (n) return;
			re = s, ie = c;
			let l = o({
				element: e,
				content: Te(() => r() ?? ""),
				editable: Te(() => !i()),
				singleLine: t,
				mention: {
					source: () => Te(() => f()),
					controller: I,
					strings: () => Te(() => z(g))
				},
				onUpdate() {
					me = !0, clearTimeout(R), R = setTimeout(ve, 600);
				},
				onBlur() {
					ve(), he && xe(l, r() ?? "");
				},
				onFocus() {}
			});
			Zn(l, {
				map: Te(() => m() ?? null),
				strings: Te(() => z(g))
			}), l.on("transaction", () => Se(l)), a = l, Se(l), q(b, l), h.editor = l;
		}), () => {
			n = !0, q(D, null), ve(), a?.destroy(), h.editor === a && (h.editor = null), q(b, null);
		};
	}), Oe(() => {
		let e = r() ?? "", t = z(b);
		t && Te(() => {
			t.isFocused ? he = !0 : xe(t, e);
		});
	}), Oe(() => {
		let e = z(b)?.view.dom;
		e && (s() ? e.setAttribute("aria-label", s()) : e.removeAttribute("aria-label"));
	}), Oe(() => {
		let e = !i();
		z(b) && z(b).isEditable !== e && z(b).setEditable(e, !1);
	});
	function Ce(e) {
		e && z(b) && q(w, z(b).getAttributes("link").href ?? "", !0), q(C, e, !0);
	}
	function Ee() {
		if (!z(b)) return;
		let e = z(w).trim(), t = z(b).chain().focus().extendMarkRange("link");
		e ? z(b).state.selection.empty && !z(b).isActive("link") ? t.insertContent({
			type: "text",
			text: e,
			marks: [{
				type: "link",
				attrs: { href: e }
			}]
		}).run() : t.setLink({ href: e }).run() : t.unsetLink().run(), q(C, !1);
	}
	let De = (e) => e.preventDefault();
	var K = {
		get value() {
			return r();
		},
		set value(e = "") {
			r(e), A();
		},
		get readonly() {
			return i();
		},
		set readonly(e = !1) {
			i(e), A();
		},
		get placeholder() {
			return o();
		},
		set placeholder(e = null) {
			o(e), A();
		},
		get label() {
			return s();
		},
		set label(e = null) {
			s(e), A();
		},
		get locale() {
			return c();
		},
		set locale(e = null) {
			c(e), A();
		},
		get strings() {
			return l();
		},
		set strings(e = null) {
			l(e), A();
		},
		get mentions() {
			return f();
		},
		set mentions(e = null) {
			f(e), A();
		},
		get singleLine() {
			return p();
		},
		set singleLine(e = !1) {
			p(e), A();
		},
		get mentionMap() {
			return m();
		},
		set mentionMap(e = null) {
			m(e), A();
		}
	}, J = iS(), Ae = G(J);
	n(Ae, {});
	var je = U(Ae, 2);
	return Ft(je, {
		value: () => h.shadowRoot,
		children: (e, t) => {
			var n = _S(), r = V(n), a = (e) => {
				var t = aS(), n = V(t), r = U(n, 2), i = U(r, 2), a = U(i, 2), o = U(a, 2);
				E(o, () => Yx, (e, t) => {
					t(e, {
						get open() {
							return z(C);
						},
						portalled: !1,
						positioning: {
							strategy: "fixed",
							placement: "bottom-start"
						},
						onOpenChange: (e) => Ce(e.open),
						onEscapeKeyDown: (e) => {
							Xn(e) && e.defaultPrevented && Ce(!1);
						},
						children: (e, t) => {
							var n = iS(), r = G(n);
							{
								let e = y(() => !z(b));
								E(r, () => Zx, (t, n) => {
									n(t, {
										part: "tool-link",
										class: "tool",
										get "aria-label"() {
											return z(g).link;
										},
										get title() {
											return z(g).link;
										},
										get "aria-pressed"() {
											return z(te).link;
										},
										get disabled() {
											return z(e);
										},
										children: (e, t) => {
											var n = nS();
											F(e, n);
										},
										$$slots: { default: !0 }
									});
								});
							}
							var i = U(r, 2);
							E(i, () => Ex, (e, t) => {
								t(e, {
									popover: "manual",
									get ref() {
										return z(ne);
									},
									set ref(e) {
										q(ne, e, !0);
									},
									children: (e, t) => {
										var n = P(), r = G(n);
										E(r, () => wx, (e, t) => {
											t(e, {
												class: "af-overlay link",
												part: "link-popover",
												children: (e, t) => {
													var n = rS(), r = V(n);
													ke(r);
													var i = U(r, 2), a = ye(i, !0);
													O(n), W(() => {
														j(r, "aria-label", z(g).link), T(a, z(g).confirm);
													}), we("submit", n, (e) => {
														e.preventDefault(), Ee();
													}), ue(r, () => z(w), (e) => q(w, e)), F(e, n);
												},
												$$slots: { default: !0 }
											});
										}), F(e, n);
									},
									$$slots: { default: !0 }
								});
							}), F(e, n);
						},
						$$slots: { default: !0 }
					});
				}), O(t), W(() => {
					j(n, "aria-label", z(g).bold), j(n, "title", z(g).bold), j(n, "aria-pressed", z(te).bold), n.disabled = !z(b), j(r, "aria-label", z(g).italic), j(r, "title", z(g).italic), j(r, "aria-pressed", z(te).italic), r.disabled = !z(b), j(i, "aria-label", z(g).bulletList), j(i, "title", z(g).bulletList), j(i, "aria-pressed", z(te).bulletList), i.disabled = !z(b), j(a, "aria-label", z(g).numberedList), j(a, "title", z(g).numberedList), j(a, "aria-pressed", z(te).orderedList), a.disabled = !z(b);
				}), be("mousedown", n, De), be("click", n, () => z(b)?.chain().focus().toggleBold().run()), be("mousedown", r, De), be("click", r, () => z(b)?.chain().focus().toggleItalic().run()), be("mousedown", i, De), be("click", i, () => z(b)?.chain().focus().toggleBulletList().run()), be("mousedown", a, De), be("click", a, () => z(b)?.chain().focus().toggleOrderedList().run()), F(e, t);
			};
			M(r, (e) => {
				!i() && !p() && e(a);
			});
			var s = U(r, 2), c = V(s), l = (e) => {
				var t = oS(), n = ye(t, !0);
				W(() => T(n, o())), F(e, t);
			};
			M(c, (e) => {
				z(S) && o() && e(l);
			});
			var u = U(c, 2);
			fe(u, (e) => q(v, e), () => z(v)), O(s);
			var d = U(s, 2), f = V(d);
			En(f, {
				tabStop: !1,
				children: (e, t) => {
					var n = iS(), r = G(n), i = (e) => {
						var t = sS(), n = ye(t, !0);
						W(() => T(n, z(g).noResults)), F(e, t);
					}, a = y(() => !N(z(D)?.entries ?? []));
					M(r, (e) => {
						z(a) && e(i);
					});
					var o = U(r, 2);
					_(o, 17, () => z(ce), (e) => e.key + e.title, (e, t) => {
						var n = gS(), r = V(n), i = (e) => {
							var n = cS(), r = ye(n, !0);
							W(() => T(r, z(t).title)), F(e, n);
						};
						M(r, (e) => {
							z(t).title && e(i);
						});
						var a = U(r, 2), o = (e) => {
							var n = uS();
							_(n, 21, () => z(t).rows, ({ entry: e, at: t }) => t, (e, t) => {
								let n = () => z(t).entry, r = () => z(t).at;
								var i = lS(), a = U(V(i), 2), o = ye(a, !0);
								O(i), W(() => {
									j(i, "id", `${se}-${r() ?? ""}`), j(i, "aria-selected", r() === z(ae)), j(i, "data-picked", r() === z(ae) ? "" : void 0), j(i, "data-group", n().scope?.group), T(o, n().scope?.label);
								}), be("mousedown", i, (e) => e.preventDefault()), we("mouseenter", i, () => q(ae, r(), !0)), be("click", i, () => void le(n())), be("keydown", i, () => {}), F(e, i);
							}), O(n), F(e, n);
						}, s = y(() => z(t).rows.every(({ entry: e }) => e.kind === "scope")), c = (e) => {
							var n = P(), r = G(n);
							_(r, 17, () => z(t).rows, ({ entry: e, at: t }) => t, (e, t) => {
								let n = () => z(t).entry, r = () => z(t).at;
								var i = hS(), a = V(i), o = (e) => {
									var t = dS(), r = ye(t, !0);
									W(() => T(r, n().more?.label)), F(e, t);
								}, s = (e) => {
									var t = mS(), r = G(t), i = ye(r, !0), a = U(r, 2), o = V(a), s = ye(o, !0), c = U(o, 2), l = (e) => {
										var t = fS(), r = ye(t, !0);
										W(() => T(r, n().item.entity_label)), F(e, t);
									};
									M(c, (e) => {
										n().item.entity_label && e(l);
									}), O(a);
									var u = U(a, 2), d = (e) => {
										var t = pS(), r = ye(t, !0);
										W(() => T(r, n().item.meta)), F(e, t);
									};
									M(u, (e) => {
										n().item.meta && e(d);
									}), W((e) => {
										T(i, e), T(s, n().item.label);
									}, [() => Array.from(n().item.label.trim())[0]?.toUpperCase() ?? "?"]), F(e, t);
								};
								M(a, (e) => {
									n().kind === "more" ? e(o) : n().item && e(s, 1);
								}), O(i), W(() => {
									j(i, "id", `${se}-${r() ?? ""}`), j(i, "aria-selected", r() === z(ae)), j(i, "data-picked", r() === z(ae) ? "" : void 0), j(i, "data-kind", n().kind);
								}), be("mousedown", i, (e) => e.preventDefault()), we("mouseenter", i, () => q(ae, r(), !0)), be("click", i, () => void le(n())), be("keydown", i, () => {}), F(e, i);
							}), F(e, n);
						};
						M(a, (e) => {
							z(s) ? e(o) : e(c, -1);
						}), O(n), W(() => j(n, "aria-label", z(t).title)), F(e, n);
					}), F(e, n);
				},
				$$slots: { default: !0 }
			}), O(d), fe(d, (e) => q(oe, e), () => z(oe)), O(n), W(() => {
				j(n, "data-readonly", i() ? "" : void 0), j(n, "data-single-line", p() ? "" : void 0), j(d, "id", se), j(d, "aria-label", z(g).mentionMenu);
			}), F(e, n);
		},
		$$slots: { default: !0 }
	}), F(e, J), x(K);
}
De([
	"mousedown",
	"click",
	"keydown"
]), H(yS, {
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
var bS = I("<!> <div class=\"af-kit svelte-cu6e0i\"><!></div>", 1), xS = {
	hash: "svelte-cu6e0i",
	code: ":host {display:block;min-height:0;}.af-kit.svelte-cu6e0i {display:flex;flex-direction:column;box-sizing:border-box;height:100%;max-height:inherit;color:inherit;font:inherit;}"
};
function SS(e, t) {
	k(t, !0), ee(e, xS);
	let r = L(t, "axis", 7, "vertical"), i = L(t, "label", 7, null), a = y(() => r() === "horizontal" || r() === "both" ? r() : "vertical");
	var o = {
		get axis() {
			return r();
		},
		set axis(e = "vertical") {
			r(e), A();
		},
		get label() {
			return i();
		},
		set label(e = null) {
			i(e), A();
		}
	}, s = bS(), c = G(s);
	n(c, {});
	var l = U(c, 2), u = V(l);
	{
		let e = y(() => i() || null);
		En(u, {
			get axis() {
				return z(a);
			},
			get label() {
				return z(e);
			},
			contentPart: !0,
			children: (e, n) => {
				var r = P(), i = G(r);
				le(i, t, "default", {}, null), F(e, r);
			},
			$$slots: { default: !0 }
		});
	}
	return O(l), F(e, s), x(o);
}
H(SS, {
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
var [CS, wS] = an({ name: "SelectContext" }), TS = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function ES(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, TS), i = wS(), a = co(), o = y(() => X(i().getContentProps(), a().getPresenceProps(), r));
	function s(e) {
		a().setNode(e);
	}
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	}, l = P(), u = G(l), d = (e) => {
		Q(e, J({ as: "div" }, () => z(o), {
			[de()]: s,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = y(() => !a().unmounted);
	return M(u, (e) => {
		z(f) && e(d);
	}), F(e, l), x(c);
}
H(ES, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/select/select-indicator.svelte
var DS = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function OS(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, DS), i = wS(), a = y(() => X(i().getIndicatorProps(), r));
	return Q(e, J({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(OS, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/select/use-select-item-context.js
var [kS, AS] = an({ name: "SelectItemContext" }), [jS, MS] = an({ name: "SelectItemPropsContext" }), NS = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function PS(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, NS), i = wS(), a = y(() => Bt()(r, ["item", "persistFocus"])), o = y(() => w(z(a), 2)), s = y(() => z(o)[0]), c = y(() => z(o)[1]), l = y(() => X(i().getItemProps(z(s)), z(c)));
	return kS(() => i().getItemState(z(s))), jS(() => z(s)), Q(e, J({ as: "div" }, () => z(l), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(PS, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/select/select-item-indicator.svelte
var FS = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function IS(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, FS), i = wS(), a = MS(), o = y(() => X(i().getItemIndicatorProps(a()), r));
	return Q(e, J({ as: "div" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(IS, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/select/select-item-text.svelte
var LS = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function RS(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, LS), i = wS(), a = MS(), o = y(() => X(i().getItemTextProps(a()), r));
	return Q(e, J({ as: "span" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(RS, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/select/select-positioner.svelte
var zS = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function BS(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, zS), i = wS(), a = co(), o = y(() => X(i().getPositionerProps(), r));
	var s = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	}, c = P(), l = G(c), u = (e) => {
		Q(e, J({ as: "div" }, () => z(o), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, d = y(() => !a().unmounted);
	return M(l, (e) => {
		z(d) && e(u);
	}), F(e, c), x(s);
}
H(BS, { ref: {} }, [], [], { mode: "open" });
var VS = Cn("select").parts("label", "positioner", "trigger", "indicator", "clearTrigger", "item", "itemText", "itemIndicator", "itemGroup", "itemGroupLabel", "list", "content", "root", "control", "valueText").build(), HS = (e) => new Jr(e);
HS.empty = () => new Jr({ items: [] });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+select@1.43.3/node_modules/@zag-js/select/dist/select.dom.mjs
var US = (e) => e.ids?.root ?? `select:${e.id}`, WS = (e) => e.ids?.content ?? `select:${e.id}:content`, GS = (e) => e.ids?.trigger ?? `select:${e.id}:trigger`, KS = (e) => e.ids?.clearTrigger ?? `select:${e.id}:clear-trigger`, qS = (e) => e.ids?.label ?? `select:${e.id}:label`, JS = (e) => e.ids?.control ?? `select:${e.id}:control`, YS = (e, t) => e.ids?.item?.(t) ?? `select:${e.id}:option:${t}`, XS = (e) => e.ids?.hiddenSelect ?? `select:${e.id}:select`, ZS = (e) => e.ids?.positioner ?? `select:${e.id}:positioner`, QS = (e, t) => e.ids?.itemGroup?.(t) ?? `select:${e.id}:optgroup:${t}`, $S = (e, t) => e.ids?.itemGroupLabel?.(t) ?? `select:${e.id}:optgroup-label:${t}`, eC = (e) => e.getById(XS(e)), tC = (e) => e.getById(WS(e)), nC = (e) => e.getById(GS(e)), rC = (e) => e.getById(KS(e)), iC = (e) => e.getById(ZS(e)), aC = (e, t) => t == null ? null : e.getById(YS(e, t)), oC = { clearTriggerLabel: "Clear value" };
function sC(e, t) {
	let { context: n, prop: r, scope: i, state: a, computed: o, send: s } = e, c = He(oC, r("translations")), l = r("disabled") || n.get("fieldsetDisabled"), u = !!r("invalid"), d = !!r("required"), f = !!r("readOnly"), p = r("composite"), m = r("collection"), h = a.hasTag("open"), g = a.matches("focused"), _ = n.get("highlightedValue"), v = n.get("highlightedItem"), y = o("selectedItems"), b = n.get("currentPlacement"), x = b ? Yo(b) : void 0, ee = o("isTypingAhead"), S = o("isInteractive"), te = _ ? YS(i, _) : void 0;
	function C(e) {
		let t = m.getItemDisabled(e.item), r = m.getItemValue(e.item);
		return Be(r, () => `[zag-js] No value found for item ${JSON.stringify(e.item)}`), {
			value: r,
			disabled: !!(l || t),
			highlighted: _ === r,
			selected: n.get("value").includes(r)
		};
	}
	let w = ms({
		...r("positioning"),
		placement: b
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
			nC(i)?.focus({ preventScroll: !0 });
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
		getItemState: C,
		getRootProps() {
			return t.element({
				...VS.root.attrs,
				dir: r("dir"),
				id: US(i),
				"data-invalid": Z(u),
				"data-readonly": Z(f)
			});
		},
		getLabelProps() {
			return t.label({
				dir: r("dir"),
				id: qS(i),
				...VS.label.attrs,
				"data-disabled": Z(l),
				"data-invalid": Z(u),
				"data-readonly": Z(f),
				"data-required": Z(d),
				htmlFor: XS(i),
				onClick(e) {
					e.defaultPrevented || l || nC(i)?.focus({ preventScroll: !0 });
				}
			});
		},
		getControlProps() {
			return t.element({
				...VS.control.attrs,
				dir: r("dir"),
				id: JS(i),
				"data-state": h ? "open" : "closed",
				"data-focus": Z(g),
				"data-disabled": Z(l),
				"data-invalid": Z(u)
			});
		},
		getValueTextProps() {
			return t.element({
				...VS.valueText.attrs,
				dir: r("dir"),
				"data-disabled": Z(l),
				"data-invalid": Z(u),
				"data-focus": Z(g)
			});
		},
		getTriggerProps() {
			return t.button({
				id: GS(i),
				disabled: l,
				dir: r("dir"),
				type: "button",
				role: "combobox",
				"aria-controls": WS(i),
				"aria-expanded": h,
				"aria-haspopup": "listbox",
				"data-state": h ? "open" : "closed",
				"aria-invalid": u,
				"aria-required": d,
				"aria-labelledby": qS(i),
				...VS.trigger.attrs,
				"data-disabled": Z(l),
				"data-invalid": Z(u),
				"data-readonly": Z(f),
				"data-placement": b,
				"data-side": x,
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
							s(ee ? {
								type: "TRIGGER.TYPEAHEAD",
								key: e.key
							} : { type: "TRIGGER.ENTER" });
						}
					}[at(e, {
						dir: r("dir"),
						orientation: "vertical"
					})];
					if (t) {
						t(e), e.preventDefault();
						return;
					}
					Wa.isValidEvent(e) && (s({
						type: "TRIGGER.TYPEAHEAD",
						key: e.key
					}), e.preventDefault());
				}
			});
		},
		getIndicatorProps() {
			return t.element({
				...VS.indicator.attrs,
				dir: r("dir"),
				"aria-hidden": !0,
				"data-state": h ? "open" : "closed",
				"data-disabled": Z(l),
				"data-invalid": Z(u),
				"data-readonly": Z(f)
			});
		},
		getItemProps(e) {
			let n = C(e);
			return t.element({
				id: YS(i, n.value),
				role: "option",
				...VS.item.attrs,
				dir: r("dir"),
				"data-value": n.value,
				"aria-selected": n.selected,
				"data-state": n.selected ? "checked" : "unchecked",
				"data-highlighted": Z(n.highlighted),
				"data-disabled": Z(n.disabled),
				"aria-disabled": ln(n.disabled),
				onPointerMove(e) {
					n.disabled || e.pointerType !== "mouse" || Fo() === "pointer" && n.value !== _ && s({
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
					n.disabled || e.persistFocus || t.pointerType === "mouse" && Fo() === "pointer" && s({ type: "ITEM.POINTER_LEAVE" });
				}
			});
		},
		getItemTextProps(e) {
			let n = C(e);
			return t.element({
				...VS.itemText.attrs,
				"data-state": n.selected ? "checked" : "unchecked",
				"data-disabled": Z(n.disabled),
				"data-highlighted": Z(n.highlighted)
			});
		},
		getItemIndicatorProps(e) {
			let n = C(e);
			return t.element({
				"aria-hidden": !0,
				...VS.itemIndicator.attrs,
				"data-state": n.selected ? "checked" : "unchecked",
				hidden: !n.selected
			});
		},
		getItemGroupLabelProps(e) {
			let { htmlFor: n } = e;
			return t.element({
				...VS.itemGroupLabel.attrs,
				id: $S(i, n),
				dir: r("dir"),
				role: "presentation"
			});
		},
		getItemGroupProps(e) {
			let { id: n } = e;
			return t.element({
				...VS.itemGroup.attrs,
				"data-disabled": Z(l),
				id: QS(i, n),
				"aria-labelledby": $S(i, n),
				role: "group",
				dir: r("dir")
			});
		},
		getClearTriggerProps() {
			return t.button({
				...VS.clearTrigger.attrs,
				id: KS(i),
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
				$i(Ze(e)) || s({
					type: "VALUE.SET",
					value: cC(e.currentTarget)
				});
			};
			return t.select({
				name: r("name"),
				form: r("form"),
				disabled: l,
				multiple: r("multiple"),
				required: r("required"),
				"aria-hidden": !0,
				id: XS(i),
				defaultValue: a,
				style: Ka,
				tabIndex: -1,
				autoComplete: r("autoComplete"),
				onChange: o,
				onInput: o,
				onFocus() {
					nC(i)?.focus({ preventScroll: !0 });
				},
				"aria-labelledby": qS(i)
			});
		},
		getPositionerProps() {
			return t.element({
				...VS.positioner.attrs,
				dir: r("dir"),
				id: ZS(i),
				style: w.floating
			});
		},
		getContentProps() {
			return t.element({
				hidden: !h,
				dir: r("dir"),
				id: WS(i),
				role: p ? "listbox" : "dialog",
				...VS.content.attrs,
				"data-state": h ? "open" : "closed",
				"data-placement": b,
				"data-side": x,
				"data-activedescendant": te,
				"aria-activedescendant": p ? te : void 0,
				"aria-multiselectable": r("multiple") && p ? !0 : void 0,
				"aria-labelledby": qS(i),
				tabIndex: 0,
				onKeyDown(e) {
					if (!S || !pt(e.currentTarget, Ge(e))) return;
					if (e.key === "Tab" && !va(e)) {
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
							ee ? s({
								type: "CONTENT.TYPEAHEAD",
								key: e.key
							}) : t.Enter?.(e);
						}
					}, n = t[at(e)];
					if (n) {
						n(e), e.preventDefault();
						return;
					}
					let r = Ge(e);
					Tn(r) || Wa.isValidEvent(e) && (s({
						type: "CONTENT.TYPEAHEAD",
						key: e.key
					}), e.preventDefault());
				}
			});
		},
		getListProps() {
			return t.element({
				...VS.list.attrs,
				tabIndex: 0,
				role: p ? void 0 : "listbox",
				"aria-labelledby": GS(i),
				"aria-activedescendant": p ? void 0 : te,
				"aria-multiselectable": !p && r("multiple") ? !0 : void 0
			});
		}
	};
}
var cC = (e) => e.multiple ? Array.from(e.selectedOptions, (e) => e.value) : e.value ? [e.value] : [], { and: lC, not: uC, or: dC } = Ln(), fC = zt({
	props({ props: e }) {
		return {
			loopFocus: !1,
			closeOnSelect: !e.multiple,
			composite: !0,
			defaultValue: [],
			...e,
			collection: e.collection ?? HS.empty(),
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
					let r = n(), i = e("collection"), a = ei({
						values: t,
						collection: i,
						selectedItemMap: r.get("selectedItemMap")
					}), o = e("value") ?? t, s = o === t ? a : ei({
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
			selectedItemMap: t(() => ({ defaultValue: ti({
				selectedItems: i,
				collection: e("collection")
			}) }))
		};
	},
	refs() {
		return { typeahead: { ...Wa.defaultOptions } };
	},
	computed: {
		hasSelectedItems: ({ context: e }) => e.get("value").length > 0,
		isTypingAhead: ({ refs: e }) => e.get("typeahead").keysSoFar !== "",
		isDisabled: ({ prop: e, context: t }) => !!e("disabled") || !!t.get("fieldsetDisabled"),
		isInteractive: ({ prop: e }) => !(e("disabled") || e("readOnly")),
		selectedItems: ({ context: e, prop: t }) => Qr({
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
						guard: dC("isTriggerArrowDownEvent", "isTriggerEnterEvent"),
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
					guard: lC(uC("multiple"), "hasSelectedItems"),
					actions: ["selectPreviousItem"]
				}, {
					guard: uC("multiple"),
					actions: ["selectLastItem"]
				}],
				"TRIGGER.ARROW_RIGHT": [{
					guard: lC(uC("multiple"), "hasSelectedItems"),
					actions: ["selectNextItem"]
				}, {
					guard: uC("multiple"),
					actions: ["selectFirstItem"]
				}],
				"TRIGGER.HOME": {
					guard: uC("multiple"),
					actions: ["selectFirstItem"]
				},
				"TRIGGER.END": {
					guard: uC("multiple"),
					actions: ["selectLastItem"]
				},
				"TRIGGER.TYPEAHEAD": {
					guard: uC("multiple"),
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
						guard: lC("closeOnSelect", "isOpenControlled"),
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
						guard: lC("hasHighlightedItem", "loop", "isLastItemHighlighted"),
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
						guard: lC("hasHighlightedItem", "loop", "isFirstItemHighlighted"),
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
			restoreFocus: ({ event: e }) => pC(e),
			isOpenControlled: ({ prop: e }) => e("open") !== void 0,
			isTriggerClickEvent: ({ event: e }) => e.previousEvent?.type === "TRIGGER.CLICK",
			isTriggerEnterEvent: ({ event: e }) => e.previousEvent?.type === "TRIGGER.ENTER",
			isTriggerArrowUpEvent: ({ event: e }) => e.previousEvent?.type === "TRIGGER.ARROW_UP",
			isTriggerArrowDownEvent: ({ event: e }) => e.previousEvent?.type === "TRIGGER.ARROW_DOWN"
		},
		effects: {
			trackFocusVisible({ scope: e }) {
				return Ro({ root: e.getRootNode?.() });
			},
			trackFormControlState({ context: e, scope: t }) {
				return Zi(eC(t), {
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
				let r = () => tC(e), i = !0;
				return dc(r, {
					type: "listbox",
					defer: !0,
					exclude: [nC(e), rC(e)],
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
				return e.set("currentPlacement", r.placement), fs(() => nC(n), () => iC(n), {
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
					if (i == null || Fo() === "pointer") return;
					let a = tC(n), o = t("scrollToIndexFn");
					if (o) {
						let e = t("collection").indexOf(i);
						o?.({
							index: e,
							immediate: r,
							getElement: () => aC(n, i)
						});
						return;
					}
					Ra(aC(n, i), {
						rootEl: a,
						block: "nearest"
					});
				};
				return Y(() => {
					Io("virtual"), r(!0);
				}), ba(() => tC(n), {
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
				fs(nC(n), () => iC(n), {
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
				Y(() => {
					_a({ root: tC(e) })?.focus({ preventScroll: !0 });
				});
			},
			focusTriggerEl({ event: e, scope: t }) {
				pC(e) && Y(() => {
					nC(t)?.focus({ preventScroll: !0 });
				});
			},
			selectHighlightedItem({ context: e, prop: t, event: n }) {
				let r = n.value ?? e.get("highlightedValue");
				r != null && t("collection").has(r) && (t("onSelect")?.({ value: r }), r = t("deselectable") && !t("multiple") && e.get("value").includes(r) ? null : r, e.set("value", (e) => r == null ? [] : t("multiple") ? mt(e, r) : [r]));
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
				e.set("value", (e) => r == null ? [] : t("multiple") ? mt(e, r) : [r]);
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
						getElement: () => aC(t, n)
					});
				} else tC(t)?.scrollTo(0, 0);
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
				let r = eC(n);
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
				let i = ei({
					values: e.get("value"),
					collection: n,
					selectedItemMap: e.get("selectedItemMap")
				});
				e.set("selectedItemMap", i.nextSelectedItemMap);
			},
			syncSelectedItems({ context: e, prop: t }) {
				let n = ei({
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
					let t = eC(e);
					if (!t) return;
					let n = new (e.getWin()).Event("change", {
						bubbles: !0,
						composed: !0
					});
					t.dispatchEvent(ea(n));
				});
			}
		}
	}
});
function pC(e) {
	let t = e.restoreFocus ?? e.previousEvent?.restoreFocus;
	return t == null || !!t;
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/select/use-select.svelte.js
var mC = (e) => {
	let t = Zt(), n = pn(), r = Ku(), i = y(() => {
		let i = Xe(e);
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
	}), a = Ut(fC, () => z(i)), o = y(() => sC(a, gn));
	return () => z(o);
}, hC = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function gC(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, hC), i = y(() => oo(r)), a = y(() => w(z(i), 2)), o = y(() => z(a)[0]), s = y(() => z(a)[1]), c = ao(() => ({
		present: t.value().open,
		...z(o)
	})), l = y(() => X(t.value().getRootProps(), z(s)));
	return CS(() => t.value()), so(c), Q(e, J({ as: "div" }, () => z(l), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(gC, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/select/select-trigger.svelte
var _C = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function vC(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, _C), i = wS(), a = y(() => X(i().getTriggerProps(), r));
	return Q(e, J({ as: "button" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(vC, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Select.svelte
var yC = (e, t = S, n = S) => {
	var r = P(), i = G(r);
	E(i, () => PS, (e, r) => {
		r(e, J({
			get item() {
				return t();
			},
			part: "option"
		}, n, {
			children: (e, n) => {
				var r = xC(), i = G(r);
				E(i, () => RS, (e, n) => {
					n(e, {
						children: (e, n) => {
							ie();
							var r = he();
							W(() => T(r, t().label)), F(e, r);
						},
						$$slots: { default: !0 }
					});
				});
				var a = U(i, 2), o = V(a);
				E(o, () => IS, (e, t) => {
					t(e, {
						children: (e, t) => {
							var n = bC();
							F(e, n);
						},
						$$slots: { default: !0 }
					});
				}), O(a), F(e, r);
			},
			$$slots: { default: !0 }
		}));
	}), F(e, r);
}, bC = ce("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-1sa71xq\"><path d=\"M20 6 9 17l-5-5\"></path></svg>"), xC = I("<!> <span class=\"check svelte-1sa71xq\"><!></span>", 1), SC = I("<span id=\"af-described\" hidden=\"\"> </span>"), CC = ce("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-1sa71xq\"><path d=\"m6 9 6 6 6-6\"></path></svg>"), wC = I("<span part=\"value\" class=\"svelte-1sa71xq\"> </span> <!>", 1), TC = I("<af-tooltip><!></af-tooltip>", 2), EC = I("<div part=\"empty\" class=\"svelte-1sa71xq\"> </div>"), DC = I("<!> <!>", 1), OC = I("<div class=\"af-kit\"><!> <!></div>"), kC = {
	hash: "svelte-1sa71xq",
	code: ":host {display:inline-block;max-width:100%;vertical-align:middle;}af-tooltip.svelte-1sa71xq {display:block;}[part='value'].svelte-1sa71xq {flex:1 1 auto;min-width:0;overflow:hidden;text-align:start;text-overflow:ellipsis;white-space:nowrap;}.check.svelte-1sa71xq {position:absolute;right:8px;display:flex;align-items:center;justify-content:center;width:14px;height:14px;}svg.svelte-1sa71xq {flex:none;width:16px;height:16px;pointer-events:none;}[data-scope='select'][hidden] {display:none !important;}[data-scope='select'][data-part='trigger'] {display:flex;align-items:center;justify-content:space-between;gap:8px;box-sizing:border-box;width:100%;height:36px;margin:0;padding:8px 12px;border:1px solid var(--k-input);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark, 0) * 100%), transparent);box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);color:inherit;font:inherit;font-size:14px;line-height:20px;white-space:nowrap;outline:none;cursor:default;transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);}[data-scope='select'][data-part='trigger'][data-size='sm'] {height:32px;}\n  @media (hover: hover) {[data-scope='select'][data-part='trigger']:hover:not(:disabled) {background-color:color-mix(in oklab, color-mix(in oklab, var(--k-input) 50%, transparent) calc(var(--k-dark, 0) * 100%), transparent);}\n  }[data-scope='select'][data-part='trigger'][data-placeholder] {color:var(--k-muted);}[data-scope='select'][data-part='trigger']:focus-visible {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring), 0 1px 2px 0 rgb(0 0 0 / 0.05);}[data-scope='select'][data-part='trigger'][aria-invalid='true'] {border-color:var(--k-danger);}[data-scope='select'][data-part='trigger'][aria-invalid='true']:focus-visible {box-shadow:0 0 0 3px color-mix(in oklab, var(--k-danger) calc(20% + var(--k-dark, 0) * 20%), transparent), 0 1px 2px 0 rgb(0 0 0 / 0.05);}[data-scope='select'][data-part='trigger']:disabled {opacity:0.5;cursor:not-allowed;}[data-scope='select'][data-part='indicator'] {display:flex;color:var(--k-muted);opacity:0.5;}[data-scope='select'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='select'][data-part='content'] {box-sizing:border-box;display:flex;flex-direction:column;width:max-content;min-width:max(128px, 100%);max-width:var(--available-width, 100vw);max-height:var(--available-height, 300px);padding:4px;outline:none;}[data-scope='select'][data-part='item'] {position:relative;box-sizing:border-box;display:flex;align-items:center;gap:8px;width:100%;padding:6px 32px 6px 8px;border:0 solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 4px));outline:none;font-size:14px;line-height:20px;cursor:default;-webkit-user-select:none;user-select:none;}[data-scope='select'][data-part='item'][data-highlighted] {background-color:var(--k-accent);color:var(--k-accent-fg);}[data-scope='select'][data-part='item'][data-disabled] {opacity:0.5;}[data-scope='select'][data-part='item'] .check {color:var(--k-muted);}[part='empty'].svelte-1sa71xq {padding:24px 0;font-size:14px;line-height:20px;text-align:center;}\n  @media (prefers-reduced-motion: reduce) {[data-scope='select'][data-part='trigger'] {transition:none;} }\n  @media (forced-colors: active) {[data-scope='select'][data-part='trigger']:focus-visible {outline:2px solid;outline-offset:2px;}[data-scope='select'][data-part='item'][data-highlighted] {forced-color-adjust:none;background-color:Highlight;color:HighlightText;}\n  }"
};
function AC(e, t) {
	let i = g();
	k(t, !0), ee(e, kC);
	let o = L(t, "options", 23, () => []), s = L(t, "value", 7, null), c = L(t, "multiple", 7, !1), l = L(t, "placeholder", 7, null), f = L(t, "label", 7, null), m = L(t, "disabled", 7, !1), h = L(t, "locale", 7, null), v = L(t, "strings", 7, null), S = L(t, "name", 7, null), te = L(t, "required", 7, !1), C = L(t, "readonly", 7, !1), w = L(t, "description", 7, null), ne = L(t, "error", 7, null), ie = L(t, "invalid", 7, !1), D = L(t, "size", 7, null), ae = t.$$host, oe = r(ae), se = y(() => u(h(), v() ?? void 0)), ce = y(() => {
		let e = /* @__PURE__ */ new Set();
		return (o() ?? []).filter((t) => !e.has(t.value) && !!e.add(t.value));
	}), le = y(() => new Map(z(ce).map((e) => [e.value, e]))), ue = y(() => [...new Set(Array.isArray(s()) ? s() : s() ? [s()] : [])]), j = y(() => z(ue).filter((e) => z(le).has(e)).map((e) => z(le).get(e).label).join(", ")), N = y(() => Ai({
		items: z(ce),
		itemToValue: (e) => e.value,
		itemToString: (e) => e.label,
		isItemDisabled: (e) => !!e.disabled
	})), de = B(!1), I = y(() => !!m() || z(de)), R = y(() => [w(), ne()].filter(Boolean).join(" ")), fe = (e) => d(ae, "change", { value: c() ? e : e[0] ?? null }), pe = mC(() => ({
		id: i,
		dir: oe,
		getRootNode: () => ae.shadowRoot,
		collection: z(N),
		multiple: !!c(),
		value: z(ue),
		disabled: z(I),
		readOnly: !!C(),
		invalid: !!ie(),
		required: !!te(),
		positioning: {
			strategy: "fixed",
			placement: "bottom-start",
			sameWidth: !0
		},
		scrollToIndexFn: un,
		onValueChange: (e) => fe(e.value)
	})), me = B(null), he = B(null), H = B(null);
	Oe(() => a(z(me), pe().open, ae)), Oe(() => _e(ae, "keydown", (e) => {
		e.key === "Escape" && Xn(e) && e.defaultPrevented && pe().open && pe().setOpen(!1);
	}));
	function ge(e) {
		z(I) || C() || e.isComposing || e.ctrlKey || e.metaKey || e.altKey || e.key.length === 1 && e.key !== " " && (e.preventDefault(), pe().open || pe().setOpen(!0), z(he)?.dispatchEvent(new KeyboardEvent("keydown", {
			key: e.key,
			bubbles: !0,
			composed: !1
		})));
	}
	Oe(() => {
		let e = !!te() && z(ue).length === 0;
		jr(ae, {
			name: S(),
			value: c() ? z(ue) : z(ue)[0] ?? null,
			validity: e ? { valueMissing: !0 } : {},
			message: e ? p(z(se), "valueMissing") : "",
			anchor: z(H)
		});
	}), Mr(ae, {
		reset() {
			let e = ae.getAttribute("value"), t = e ? [e] : [];
			(t.length !== z(ue).length || t.some((e, t) => e !== z(ue)[t])) && fe(t);
		},
		disabled(e) {
			q(de, e, !0);
		}
	});
	let ve = (e) => e ? { "aria-description": e } : {};
	var be = {
		get options() {
			return o();
		},
		set options(e = []) {
			o(e), A();
		},
		get value() {
			return s();
		},
		set value(e = null) {
			s(e), A();
		},
		get multiple() {
			return c();
		},
		set multiple(e = !1) {
			c(e), A();
		},
		get placeholder() {
			return l();
		},
		set placeholder(e = null) {
			l(e), A();
		},
		get label() {
			return f();
		},
		set label(e = null) {
			f(e), A();
		},
		get disabled() {
			return m();
		},
		set disabled(e = !1) {
			m(e), A();
		},
		get locale() {
			return h();
		},
		set locale(e = null) {
			h(e), A();
		},
		get strings() {
			return v();
		},
		set strings(e = null) {
			v(e), A();
		},
		get name() {
			return S();
		},
		set name(e = null) {
			S(e), A();
		},
		get required() {
			return te();
		},
		set required(e = !1) {
			te(e), A();
		},
		get readonly() {
			return C();
		},
		set readonly(e = !1) {
			C(e), A();
		},
		get description() {
			return w();
		},
		set description(e = null) {
			w(e), A();
		},
		get error() {
			return ne();
		},
		set error(e = null) {
			ne(e), A();
		},
		get invalid() {
			return ie();
		},
		set invalid(e = !1) {
			ie(e), A();
		},
		get size() {
			return D();
		},
		set size(e = null) {
			D(e), A();
		}
	}, xe = DC(), Se = G(xe);
	n(Se, {});
	var Ce = U(Se, 2);
	return Ft(Ce, {
		value: () => ae.shadowRoot,
		children: (e, t) => {
			Qu(e, {
				get dir() {
					return oe;
				},
				children: (e, t) => {
					var n = OC(), r = V(n), i = (e) => {
						var t = SC(), n = ye(t, !0);
						W(() => T(n, z(R))), F(e, t);
					};
					M(r, (e) => {
						z(R) && e(i);
					});
					var a = U(r, 2);
					E(a, () => gC, (e, t) => {
						t(e, {
							get value() {
								return pe;
							},
							children: (e, t) => {
								var n = DC(), r = G(n);
								{
									let e = y(() => f() || void 0), t = y(() => z(R) ? "af-described" : void 0), n = y(() => C() ? "true" : void 0), i = y(() => z(j) ? void 0 : ""), a = y(() => D() === "sm" ? "sm" : void 0);
									E(r, () => vC, (r, o) => {
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
											onkeydowncapture: ge,
											get ref() {
												return z(H);
											},
											set ref(e) {
												q(H, e, !0);
											},
											children: (e, t) => {
												var n = wC(), r = G(n), i = ye(r, !0), a = U(r, 2);
												E(a, () => OS, (e, t) => {
													t(e, {
														part: "indicator",
														children: (e, t) => {
															var n = CC();
															F(e, n);
														},
														$$slots: { default: !0 }
													});
												}), W(() => T(i, z(j) || l() || "")), F(e, n);
											},
											$$slots: { default: !0 }
										});
									});
								}
								var i = U(r, 2);
								E(i, () => BS, (e, t) => {
									t(e, {
										popover: "manual",
										get ref() {
											return z(me);
										},
										set ref(e) {
											q(me, e, !0);
										},
										children: (e, t) => {
											var n = P(), r = G(n);
											{
												let e = y(() => f() || void 0);
												E(r, () => ES, (t, n) => {
													n(t, {
														class: "af-overlay",
														part: "content",
														get "aria-label"() {
															return z(e);
														},
														"aria-labelledby": null,
														get ref() {
															return z(he);
														},
														set ref(e) {
															q(he, e, !0);
														},
														children: (e, t) => {
															En(e, {
																tabStop: !1,
																children: (e, t) => {
																	var n = DC(), r = G(n);
																	_(r, 17, () => z(N).items, (e) => e.value, (e, t) => {
																		var n = P(), r = G(n), i = (e) => {
																			var n = TC();
																			W(() => b(n, "text", z(t).reason ?? "")), re(n, 1, "svelte-1sa71xq");
																			var r = V(n);
																			{
																				let e = y(() => ve(z(t).reason));
																				yC(r, () => z(t), () => z(e));
																			}
																			O(n), F(e, n);
																		}, a = (e) => {
																			yC(e, () => z(t), () => ({}));
																		};
																		M(r, (e) => {
																			z(t).disabled ? e(i) : e(a, -1);
																		}), F(e, n);
																	});
																	var i = U(r, 2), a = (e) => {
																		var t = EC(), n = ye(t, !0);
																		W(() => T(n, z(se).noOptions)), F(e, t);
																	};
																	M(i, (e) => {
																		z(N).items.length === 0 && e(a);
																	}), F(e, n);
																},
																$$slots: { default: !0 }
															});
														},
														$$slots: { default: !0 }
													});
												});
											}
											F(e, n);
										},
										$$slots: { default: !0 }
									});
								}), F(e, n);
							},
							$$slots: { default: !0 }
						});
					}), O(n), F(e, n);
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { default: !0 }
	}), F(e, xe), x(be);
}
H(AC, {
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
}, Ar);
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/signature-pad/use-signature-pad-context.js
var [jC, MC] = an({
	name: "SignaturePadContext",
	hookName: "useSignaturePadContext",
	providerName: "<SignaturePadProvider />"
}), NC = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function PC(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, NC), i = MC(), a = y(() => X(i().getClearTriggerProps(), r));
	return Q(e, J({ as: "button" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(PC, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/signature-pad/signature-pad-control.svelte
var FC = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function IC(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, FC), i = MC(), a = y(() => X(i().getControlProps(), r));
	return Q(e, J({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(IC, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/signature-pad/signature-pad-guide.svelte
var LC = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function RC(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, LC), i = MC(), a = y(() => X(i().getGuideProps(), r));
	return Q(e, J({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(RC, { ref: {} }, [], [], { mode: "open" });
var zC = Cn("signature-pad").parts("root", "control", "segment", "segmentPath", "guide", "clearTrigger", "label").build(), BC = (e) => e.ids?.root ?? `signature-${e.id}`, VC = (e) => e.ids?.control ?? `signature-control-${e.id}`, HC = (e) => e.ids?.label ?? `signature-label-${e.id}`, UC = (e) => e.ids?.hiddenInput ?? `signature-input-${e.id}`, WC = (e) => e.getById(VC(e)), GC = (e) => _t(WC(e), "[data-part=segment]"), KC = (e, t) => Wi(GC(e), t), qC = {
	control: "signature pad",
	clearTrigger: "clear signature"
};
function JC(e, t) {
	let { state: n, send: r, prop: i, computed: a, context: o, scope: s } = e, c = n.matches("drawing"), l = a("isEmpty"), u = a("isInteractive"), d = !!i("disabled"), f = !!i("required"), p = He(qC, i("translations"));
	return {
		empty: l,
		drawing: c,
		currentPath: o.get("currentPath"),
		paths: o.get("paths"),
		clear() {
			r({ type: "CLEAR" });
		},
		getDataUrl(e, t) {
			return a("isEmpty") ? Promise.resolve("") : KC(s, {
				type: e,
				quality: t
			});
		},
		getLabelProps() {
			return t.label({
				...zC.label.attrs,
				dir: i("dir"),
				id: HC(s),
				"data-disabled": Z(d),
				"data-required": Z(f),
				htmlFor: UC(s),
				onClick(e) {
					u && (e.defaultPrevented || WC(s)?.focus({ preventScroll: !0 }));
				}
			});
		},
		getRootProps() {
			return t.element({
				...zC.root.attrs,
				dir: i("dir"),
				"data-disabled": Z(d),
				id: BC(s)
			});
		},
		getControlProps() {
			return t.element({
				...zC.control.attrs,
				dir: i("dir"),
				tabIndex: d ? void 0 : 0,
				id: VC(s),
				role: "application",
				"aria-roledescription": "signature pad",
				"aria-label": p.control,
				"aria-disabled": d,
				"data-disabled": Z(d),
				onPointerDown(e) {
					if (!Le(e) || Ct(e) || !u || Ge(e)?.closest("[data-part=clear-trigger]")) return;
					e.currentTarget.setPointerCapture(e.pointerId);
					let t = {
						x: e.clientX,
						y: e.clientY
					}, n = WC(s);
					if (!n) return;
					let { offset: i } = ka(t, n);
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
				...zC.segment.attrs,
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
				...zC.segmentPath.attrs,
				d: e.path
			});
		},
		getGuideProps() {
			return t.element({
				...zC.guide.attrs,
				dir: i("dir"),
				"data-disabled": Z(d)
			});
		},
		getClearTriggerProps() {
			return t.button({
				...zC.clearTrigger.attrs,
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
				id: UC(s),
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
var { PI: YC } = Math, XC = YC + 1e-4, ZC = .5, QC = [1, 1];
function $C(e, t, n, r = (e) => e) {
	return e * r(.5 - t * (.5 - n));
}
var { min: ew } = Math;
function tw(e, t, n) {
	let r = ew(1, t / n);
	return ew(1, e + (ew(1, 1 - r) - e) * (r * .275));
}
function nw(e) {
	return [-e[0], -e[1]];
}
function rw(e, t) {
	return [e[0] + t[0], e[1] + t[1]];
}
function iw(e, t, n) {
	return e[0] = t[0] + n[0], e[1] = t[1] + n[1], e;
}
function aw(e, t) {
	return [e[0] - t[0], e[1] - t[1]];
}
function ow(e, t, n) {
	return e[0] = t[0] - n[0], e[1] = t[1] - n[1], e;
}
function sw(e, t) {
	return [e[0] * t, e[1] * t];
}
function cw(e, t, n) {
	return e[0] = t[0] * n, e[1] = t[1] * n, e;
}
function lw(e, t) {
	return [e[0] / t, e[1] / t];
}
function uw(e) {
	return [e[1], -e[0]];
}
function dw(e, t) {
	let n = t[0];
	return e[0] = t[1], e[1] = -n, e;
}
function fw(e, t) {
	return e[0] * t[0] + e[1] * t[1];
}
function pw(e, t) {
	return e[0] === t[0] && e[1] === t[1];
}
function mw(e) {
	return Math.hypot(e[0], e[1]);
}
function hw(e, t) {
	let n = e[0] - t[0], r = e[1] - t[1];
	return n * n + r * r;
}
function gw(e) {
	return lw(e, mw(e));
}
function _w(e, t) {
	return Math.hypot(e[1] - t[1], e[0] - t[0]);
}
function vw(e, t, n) {
	let r = Math.sin(n), i = Math.cos(n), a = e[0] - t[0], o = e[1] - t[1], s = a * i - o * r, c = a * r + o * i;
	return [s + t[0], c + t[1]];
}
function yw(e, t, n, r) {
	let i = Math.sin(r), a = Math.cos(r), o = t[0] - n[0], s = t[1] - n[1], c = o * a - s * i, l = o * i + s * a;
	return e[0] = c + n[0], e[1] = l + n[1], e;
}
function bw(e, t, n) {
	return rw(e, sw(aw(t, e), n));
}
function xw(e, t, n, r) {
	let i = n[0] - t[0], a = n[1] - t[1];
	return e[0] = t[0] + i * r, e[1] = t[1] + a * r, e;
}
function Sw(e, t, n) {
	return rw(e, sw(t, n));
}
var Cw = [0, 0], ww = [0, 0], Tw = [0, 0];
function Ew(e, t) {
	let n = Sw(e, gw(uw(aw(e, rw(e, [1, 1])))), -t), r = [], i = 1 / 13;
	for (let t = i; t <= 1; t += i) r.push(vw(n, e, XC * 2 * t));
	return r;
}
function Dw(e, t, n) {
	let r = [], i = 1 / n;
	for (let n = i; n <= 1; n += i) r.push(vw(t, e, XC * n));
	return r;
}
function Ow(e, t, n) {
	let r = aw(t, n), i = sw(r, .5), a = sw(r, .51);
	return [
		aw(e, i),
		aw(e, a),
		rw(e, a),
		rw(e, i)
	];
}
function kw(e, t, n, r) {
	let i = [], a = Sw(e, t, n), o = 1 / r;
	for (let t = o; t < 1; t += o) i.push(vw(a, e, XC * 3 * t));
	return i;
}
function Aw(e, t, n) {
	return [
		rw(e, sw(t, n)),
		rw(e, sw(t, n * .99)),
		aw(e, sw(t, n * .99)),
		aw(e, sw(t, n))
	];
}
function jw(e, t, n) {
	return e === !1 || e === void 0 ? 0 : e === !0 ? Math.max(t, n) : e;
}
function Mw(e, t, n) {
	return e.slice(0, 10).reduce((e, r) => {
		let i = r.pressure;
		return t && (i = tw(e, r.distance, n)), (e + i) / 2;
	}, e[0].pressure);
}
function Nw(e, t = {}) {
	let { size: n = 16, smoothing: r = .5, thinning: i = .5, simulatePressure: a = !0, easing: o = (e) => e, start: s = {}, end: c = {}, last: l = !1 } = t, { cap: u = !0, easing: d = (e) => e * (2 - e) } = s, { cap: f = !0, easing: p = (e) => --e * e * e + 1 } = c;
	if (e.length === 0 || n <= 0) return [];
	let m = e[e.length - 1].runningLength, h = jw(s.taper, n, m), g = jw(c.taper, n, m), _ = (n * r) ** 2, v = [], y = [], b = Mw(e, a, n), x = $C(n, i, e[e.length - 1].pressure, o), ee, S = e[0].vector, te = e[0].point, C = te, w = te, T = C, ne = !1;
	for (let t = 0; t < e.length; t++) {
		let { pressure: r } = e[t], { point: s, vector: c, distance: l, runningLength: u } = e[t], f = t === e.length - 1;
		if (!f && m - u < 3) continue;
		i ? (a && (r = tw(b, l, n)), x = $C(n, i, r, o)) : x = n / 2, ee === void 0 && (ee = x);
		let E = u < h ? d(u / h) : 1, re = m - u < g ? p((m - u) / g) : 1;
		x = Math.max(.01, x * Math.min(E, re));
		let ie = (f ? e[t] : e[t + 1]).vector, D = f ? 1 : fw(c, ie), O = fw(c, S) < 0 && !ne, ae = D !== null && D < 0;
		if (O || ae) {
			dw(Cw, S), cw(Cw, Cw, x);
			for (let e = 0; e <= 1; e += .07692307692307693) ow(ww, s, Cw), yw(ww, ww, s, XC * e), w = [ww[0], ww[1]], v.push(w), iw(Tw, s, Cw), yw(Tw, Tw, s, XC * -e), T = [Tw[0], Tw[1]], y.push(T);
			te = w, C = T, ae && (ne = !0);
			continue;
		}
		if (ne = !1, f) {
			dw(Cw, c), cw(Cw, Cw, x), v.push(aw(s, Cw)), y.push(rw(s, Cw));
			continue;
		}
		xw(Cw, ie, c, D), dw(Cw, Cw), cw(Cw, Cw, x), ow(ww, s, Cw), w = [ww[0], ww[1]], (t <= 1 || hw(te, w) > _) && (v.push(w), te = w), iw(Tw, s, Cw), T = [Tw[0], Tw[1]], (t <= 1 || hw(C, T) > _) && (y.push(T), C = T), b = r, S = c;
	}
	let E = [e[0].point[0], e[0].point[1]], re = e.length > 1 ? [e[e.length - 1].point[0], e[e.length - 1].point[1]] : rw(e[0].point, [1, 1]), ie = [], D = [];
	if (e.length === 1) {
		if (!(h || g) || l) return Ew(E, ee || x);
	} else {
		h || g && e.length === 1 || (u ? ie.push(...Dw(E, y[0], 13)) : ie.push(...Ow(E, v[0], y[0])));
		let t = uw(nw(e[e.length - 1].vector));
		g || h && e.length === 1 ? D.push(re) : f ? D.push(...kw(re, t, x, 29)) : D.push(...Aw(re, t, x));
	}
	return v.concat(D, y.reverse(), ie);
}
var Pw = [0, 0];
function Fw(e) {
	return e != null && e >= 0;
}
function Iw(e, t = {}) {
	let { streamline: n = .5, size: r = 16, last: i = !1 } = t;
	if (e.length === 0) return [];
	let a = .15 + (1 - n) * .85, o = Array.isArray(e[0]) ? e : e.map(({ x: e, y: t, pressure: n = ZC }) => [
		e,
		t,
		n
	]);
	if (o.length === 2) {
		let e = o[1];
		o = o.slice(0, -1);
		for (let t = 1; t < 5; t++) o.push(bw(o[0], e, t / 4));
	}
	o.length === 1 && (o = [...o, [...rw(o[0], QC), ...o[0].slice(2)]]);
	let s = [{
		point: [o[0][0], o[0][1]],
		pressure: Fw(o[0][2]) ? o[0][2] : .25,
		vector: [...QC],
		distance: 0,
		runningLength: 0
	}], c = !1, l = 0, u = s[0], d = o.length - 1;
	for (let e = 1; e < o.length; e++) {
		let t = i && e === d ? [o[e][0], o[e][1]] : bw(u.point, o[e], a);
		if (pw(u.point, t)) continue;
		let n = _w(t, u.point);
		if (l += n, e < d && !c) {
			if (l < r) continue;
			c = !0;
		}
		ow(Pw, u.point, t), u = {
			point: t,
			pressure: Fw(o[e][2]) ? o[e][2] : ZC,
			vector: gw(Pw),
			distance: n,
			runningLength: l
		}, s.push(u);
	}
	return s[0].vector = s[1]?.vector || [0, 0], s;
}
function Lw(e, t = {}) {
	return Nw(Iw(e, t), t);
}
var Rw = Lw, zw = (e, t) => (e + t) / 2;
function Bw(e, t = !0) {
	let n = e.length;
	if (n < 4) return "";
	let r = e[0], i = e[1], a = e[2], o = `M${r[0].toFixed(2)},${r[1].toFixed(2)} Q${i[0].toFixed(2)},${i[1].toFixed(2)} ${zw(i[0], a[0]).toFixed(2)},${zw(i[1], a[1]).toFixed(2)} T`;
	for (let t = 2, a = n - 1; t < a; t++) r = e[t], i = e[t + 1], o += `${zw(r[0], i[0]).toFixed(2)},${zw(r[1], i[1]).toFixed(2)} `;
	return t && (o += "Z"), o;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+signature-pad@1.43.3/node_modules/@zag-js/signature-pad/dist/signature-pad.machine.mjs
var Vw = zt({
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
			return Mn(n, {
				onPointerMove({ event: n, point: r }) {
					let i = WC(e);
					if (!i) return;
					let { offset: a } = ka(r, i);
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
				let i = Rw(r, n("drawing"));
				e.set("currentPath", Bw(i));
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
						return r("isEmpty") ? Promise.resolve("") : KC(n, {
							type: e,
							quality: t
						});
					}
				});
			}
		}
	}
}), Hw = (e) => {
	let t = pn(), n = Zt(), r = Ku(), i = y(() => {
		let i = Xe(e);
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
	}), a = Ut(Vw, () => z(i)), o = y(() => JC(a, gn));
	return () => z(o);
}, Uw = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"value"
]);
function Ww(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = L(t, "value", 7), i = K(t, Uw), a = y(() => X(r()().getRootProps(), i));
	return jC(() => r()()), Q(e, J({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		},
		get value() {
			return r();
		},
		set value(e) {
			r(e), A();
		}
	});
}
H(Ww, {
	ref: {},
	value: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/signature-pad/signature-pad-segment.svelte
var Gw = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]), Kw = ce("<path></path>"), qw = I("<title>Signature</title> <!> <!>", 1);
function Jw(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, Gw), i = MC(), a = y(() => X(i().getSegmentProps(), r)), o = y(() => i().currentPath);
	return Q(e, J({ as: "svg" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		},
		children: (e, t) => {
			var n = qw(), r = U(G(n), 2);
			_(r, 17, () => i().paths, N, (e, t) => {
				var n = Kw();
				v(n, (e) => ({ ...e }), [() => i().getSegmentPathProps({ path: z(t) })]), F(e, n);
			});
			var a = U(r, 2), s = (e) => {
				var t = Kw();
				v(t, (e) => ({ ...e }), [() => i().getSegmentPathProps({ path: z(o) })]), F(e, t);
			};
			M(a, (e) => {
				z(o) && e(s);
			}), F(e, n);
		},
		$$slots: { default: !0 }
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(Jw, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/SignaturePad.svelte
var Yw = /* @__PURE__ */ new WeakMap(), Xw = 3.3 / 2, Zw = 1.9000000000000001 / 3.3, Qw = "#0f172a", $w = 5e3, eT = I("<span id=\"af-described\" hidden=\"\"> </span>"), tT = I("<img part=\"image\" alt=\"\"/>"), nT = I("<div class=\"frame svelte-ejan91\"><!></div>"), rT = I("<!> <!> <!>", 1), iT = I("<!> <div class=\"footer svelte-ejan91\"><p part=\"hint\" id=\"af-hint\"> </p> <!></div>", 1), aT = I("<div class=\"af-kit signature svelte-ejan91\"><!> <!></div>"), oT = I("<!> <!>", 1), sT = {
	hash: "svelte-ejan91",
	code: ":host {display:block;}.signature.svelte-ejan91 {display:flex;flex-direction:column;height:100%;}.signature.svelte-ejan91 > .root {display:contents;}.frame.svelte-ejan91, [part~='control'] {position:relative;box-sizing:border-box;flex:1 1 290px;min-height:0;overflow:hidden;border:1px solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:#fff;outline:none;touch-action:none;}[part~='control'] {cursor:crosshair;}[part~='control']:focus-visible {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring);}[part~='control'][data-disabled] {opacity:0.5;cursor:not-allowed;}[part~='control'][aria-invalid='true'] {border-color:var(--k-danger);}[part~='image'] {position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:left top;pointer-events:none;}[part~='guide'] {position:absolute;right:24px;bottom:25%;left:24px;border-bottom:1px dashed #d4d4d4;pointer-events:none;}.footer.svelte-ejan91 {display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px;}[part~='hint'] {margin:0;color:var(--k-muted);font-size:11px;}[part~='clear'] {flex:none;}\n  @media (forced-colors: active) {[part~='control']:focus-visible {outline:2px solid;outline-offset:2px;}\n  }"
};
function cT(e, t) {
	let r = g();
	k(t, !0), ee(e, sT);
	let i = L(t, "value", 7, null), a = L(t, "label", 7, null), o = L(t, "disabled", 7, !1), s = L(t, "locale", 7, null), c = L(t, "strings", 7, null), l = L(t, "name", 7, null), f = L(t, "required", 7, !1), m = L(t, "readonly", 7, !1), h = L(t, "description", 7, null), _ = L(t, "error", 7, null), v = L(t, "invalid", 7, !1), b = t.$$host, S = y(() => u(s(), c() ?? void 0)), te = y(() => a() || z(S).signaturePad), C = B(!1), w = y(() => !!o() || z(C)), ne = y(() => [h(), _()].filter(Boolean).join(" ")), re = B(null), D = B(null), ae = B(null);
	me(() => {
		i(), Te(() => q(ae, null));
	});
	let oe = 0, se;
	Oe(() => () => clearTimeout(se));
	let ce = 0, le = Hw(() => ({
		id: r,
		getRootNode: () => b.shadowRoot,
		disabled: z(w),
		readOnly: !!m(),
		drawing: {
			size: Xw,
			thinning: Zw,
			simulatePressure: !1,
			fill: Qw
		},
		translations: {
			control: z(te),
			clearTrigger: z(S).clear
		},
		onDrawEnd: (e) => {
			let t = ++oe;
			if (clearTimeout(se), !e.paths.length) {
				if (q(D, null), ce) {
					ce--;
					return;
				}
				q(ae, i()), d(b, "change", { value: null });
				return;
			}
			let n = new Promise((t) => t(e.getDataUrl("image/png"))), r = new Promise((e, t) => {
				se = setTimeout(() => t(/* @__PURE__ */ Error(`the export did not finish in ${$w} ms`)), $w);
			});
			Promise.race([n, r]).then((e) => {
				t === oe && (clearTimeout(se), q(D, e || null, !0), e && d(b, "change", { value: e }));
			}, (e) => {
				t === oe && (clearTimeout(se), q(D, null), console.warn("A signature could not be exported as an image; the pad reports no value.", { error: String(e) }));
			});
		}
	})), ue = y(() => le().paths.length > 0 || !!le().currentPath), N = y(() => !!i() && !z(ue) && i() !== z(ae)), de = y(() => z(ue) ? z(D) : z(N) ? i() : null);
	Yw.set(b, () => {
		m() || !z(ue) && !z(N) || le().clear();
	}), Oe(() => {
		let e = !!f() && !z(de);
		jr(b, {
			name: l(),
			value: z(de),
			validity: e ? { valueMissing: !0 } : {},
			message: e ? p(z(S), "valueMissing") : "",
			anchor: z(re)
		});
	}), Mr(b, {
		reset() {
			let e = b.getAttribute("value") || null, t = z(de);
			le().empty || (ce++, le().clear()), q(ae, null), t !== e && d(b, "change", { value: e });
		},
		disabled(e) {
			q(C, e, !0);
		}
	});
	var I = {
		get value() {
			return i();
		},
		set value(e = null) {
			i(e), A();
		},
		get label() {
			return a();
		},
		set label(e = null) {
			a(e), A();
		},
		get disabled() {
			return o();
		},
		set disabled(e = !1) {
			o(e), A();
		},
		get locale() {
			return s();
		},
		set locale(e = null) {
			s(e), A();
		},
		get strings() {
			return c();
		},
		set strings(e = null) {
			c(e), A();
		},
		get name() {
			return l();
		},
		set name(e = null) {
			l(e), A();
		},
		get required() {
			return f();
		},
		set required(e = !1) {
			f(e), A();
		},
		get readonly() {
			return m();
		},
		set readonly(e = !1) {
			m(e), A();
		},
		get description() {
			return h();
		},
		set description(e = null) {
			h(e), A();
		},
		get error() {
			return _();
		},
		set error(e = null) {
			_(e), A();
		},
		get invalid() {
			return v();
		},
		set invalid(e = !1) {
			v(e), A();
		}
	}, R = oT(), fe = G(R);
	n(fe, {});
	var pe = U(fe, 2);
	return Ft(pe, {
		value: () => b.shadowRoot,
		children: (e, t) => {
			var n = aT(), r = V(n), a = (e) => {
				var t = eT(), n = ye(t, !0);
				W(() => T(n, z(ne))), F(e, t);
			};
			M(r, (e) => {
				z(ne) && e(a);
			});
			var o = U(r, 2), s = (e) => {
				var t = nT(), n = V(t), r = (e) => {
					var t = tT();
					W(() => j(t, "src", i())), F(e, t);
				};
				M(n, (e) => {
					i() && e(r);
				}), O(t), W(() => {
					j(t, "role", i() ? "img" : void 0), j(t, "aria-label", i() ? z(te) : void 0);
				}), F(e, t);
			}, c = (e) => {
				var t = P(), n = G(t);
				E(n, () => Ww, (e, t) => {
					t(e, {
						get value() {
							return le;
						},
						class: "root",
						children: (e, t) => {
							var n = iT(), r = G(n);
							{
								let e = y(() => z(ne) ? "af-hint af-described" : "af-hint"), t = y(() => v() ? "true" : void 0);
								E(r, () => IC, (n, r) => {
									r(n, {
										part: "control",
										get "aria-describedby"() {
											return z(e);
										},
										get "aria-invalid"() {
											return z(t);
										},
										get ref() {
											return z(re);
										},
										set ref(e) {
											q(re, e, !0);
										},
										children: (e, t) => {
											var n = rT(), r = G(n), a = (e) => {
												var t = tT();
												W(() => j(t, "src", i())), F(e, t);
											};
											M(r, (e) => {
												z(N) && e(a);
											});
											var o = U(r, 2);
											E(o, () => Jw, (e, t) => {
												t(e, {
													part: "segment",
													"aria-hidden": "true"
												});
											});
											var s = U(o, 2);
											E(s, () => RC, (e, t) => {
												t(e, { part: "guide" });
											}), F(e, n);
										},
										$$slots: { default: !0 }
									});
								});
							}
							var a = U(r, 2), o = V(a), s = ye(o, !0), c = U(o, 2);
							{
								let e = y(() => z(w) || !z(ue) && !z(N));
								E(c, () => PC, (t, n) => {
									n(t, {
										part: "clear",
										class: "af-button ghost sm",
										hidden: !1,
										get disabled() {
											return z(e);
										},
										children: (e, t) => {
											ie();
											var n = he();
											W(() => T(n, z(S).clear)), F(e, n);
										},
										$$slots: { default: !0 }
									});
								});
							}
							O(a), W(() => T(s, z(S).signHint)), F(e, n);
						},
						$$slots: { default: !0 }
					});
				}), F(e, t);
			};
			M(o, (e) => {
				m() ? e(s) : e(c, -1);
			}), O(n), F(e, n);
		},
		$$slots: { default: !0 }
	}), F(e, R), x(I);
}
H(cT, {
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
}, [], [], { mode: "open" }, (e) => class extends Ar(e) {
	focus(e) {
		let t = this.shadowRoot?.querySelector("[part~=\"control\"]");
		t ? t.focus(e) : super.focus(e);
	}
	clear() {
		Yw.get(this)?.();
	}
});
var lT = Cn("splitter").parts("root", "panel", "resizeTrigger", "resizeTriggerIndicator").build(), uT = (e) => e.ids?.root ?? `splitter:${e.id}`, dT = (e, t) => e.ids?.resizeTrigger?.(t) ?? `splitter:${e.id}:splitter:${t}`, fT = (e, t) => e.ids?.panel?.(t) ?? `splitter:${e.id}:panel:${t}`, pT = (e) => `splitter:${e.id}:global-cursor`, mT = (e) => e.getById(uT(e)), hT = (e, t) => t == null ? null : e.getById(dT(e, t)), gT = (e) => sn(e) && e.dataset.part === "panel" ? e.dataset.id : void 0, _T = (e) => {
	let t = e?.previousElementSibling ?? null;
	for (; t;) {
		let e = gT(t);
		if (e) return e;
		t = t.previousElementSibling;
	}
}, vT = (e) => {
	let t = e?.nextElementSibling ?? null;
	for (; t;) {
		let e = gT(t);
		if (e) return e;
		t = t.nextElementSibling;
	}
}, yT = (e, t) => {
	let [n, r] = t.split(":");
	if (n && r) return t;
	let i = hT(e, t), a = n || _T(i), o = r || vT(i);
	return a && o ? `${a}:${o}` : null;
}, bT = (e, t) => {
	let n = t ? "col-resize" : "row-resize";
	return e.isAtMin && (n = t ? "e-resize" : "s-resize"), e.isAtMax && (n = t ? "w-resize" : "n-resize"), n;
}, xT = (e) => ze(mT(e), `[role=separator]${Pt(uT(e))}`), ST = (e) => e.getDoc().getElementById(pT(e)), CT = (e, t, n, r) => {
	let i = ST(e), a = `* { cursor: ${bT(t, n)} !important; }`;
	if (i) i.textContent = a;
	else {
		let t = e.getDoc().createElement("style");
		r && (t.nonce = r), t.id = pT(e), t.textContent = a, e.getDoc().head.appendChild(t);
	}
}, wT = (e) => {
	ST(e)?.remove();
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/utils/aria.mjs
function TT({ size: e, panels: t, pivotIndices: n }) {
	let r = 0, i = 100, a = 0, o = 0, s = n[0];
	return Be(s, () => "No pivot index found"), t.forEach((e, t) => {
		let { maxSize: n = 100, minSize: c = 0 } = e;
		t === s ? (r = c, i = n) : (a += c, o += n);
	}), {
		valueMax: Math.min(i, 100 - a),
		valueMin: Math.max(r, 100 - o),
		valueNow: e[s]
	};
}
function ET(e, t, n) {
	let [r, i] = n.split(":"), a = t.findIndex((e) => e.id === r), o = t.findIndex((e) => e.id === i);
	if (a === -1 || o === -1) return {
		beforeId: r || void 0,
		afterId: i || void 0,
		valueMax: void 0,
		valueMin: void 0,
		valueNow: void 0
	};
	let { valueMax: s, valueMin: c, valueNow: l } = TT({
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
function DT(e, t, n = 10) {
	return e.toFixed(n) === t.toFixed(n) ? 0 : e > t ? 1 : -1;
}
function OT(e, t, n = 10) {
	return e == null || t == null ? !1 : DT(e, t, n) === 0;
}
function kT(e, t, n) {
	if (e.length !== t.length) return !1;
	for (let r = 0; r < e.length; r++) {
		let i = e[r], a = t[r];
		if (!OT(i, a, n)) return !1;
	}
	return !0;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/utils/size.mjs
var AT = /^(-?\d*\.?\d+)(%|px|em|rem|vw|vh)?$/, jT = /^(-?\d*\.?\d+)%$/;
function MT(e, t) {
	if (!e) return 0;
	let n = e.getBoundingClientRect();
	return t === "horizontal" ? n.width : n.height;
}
function NT(e, t) {
	return MT(e, t);
}
function PT(e, t, n) {
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
function FT(e, t, n) {
	if (e == null) return;
	if (typeof e == "number") return e;
	let r = e.trim().match(AT);
	if (!r) return;
	let i = Number.parseFloat(r[1]);
	if (!Number.isFinite(i)) return;
	let a = r[2];
	if (a == null || a === "%") return i;
	if (!t) return;
	let o = MT(t, n);
	if (o === 0) return;
	let s = PT(i, a, t);
	return s == null ? void 0 : s / o * 100;
}
function IT(e) {
	if (e == null) return;
	if (typeof e == "number") return `${e}%`;
	let t = e.trim();
	if (jT.test(t)) return t;
	let n = t.match(AT);
	if (!n) return;
	let r = Number.parseFloat(n[1]);
	if (!Number.isFinite(r)) return;
	let i = n[2];
	return i == null ? `${r}%` : `${r}${i}`;
}
function LT({ sizes: e, panels: t, rootEl: n, orientation: r }) {
	let i = Array(t.length), a = 100, o = 0;
	for (let s = 0; s < t.length; s++) {
		let t = FT(e?.[s], n, r);
		t != null && (o++, i[s] = t, a -= t);
	}
	for (let e = 0; e < t.length; e++) {
		if (i[e] != null) continue;
		let n = t.length - o, r = n > 0 ? a / n : 0;
		o++, i[e] = r, a -= r;
	}
	return i;
}
function RT(e, t, n) {
	return e.map((e) => ({
		...e,
		minSize: FT(e.minSize, t, n),
		maxSize: FT(e.maxSize, t, n),
		collapsedSize: FT(e.collapsedSize, t, n)
	}));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/utils/panel.mjs
function zT(e, t) {
	let n = e.find((e) => e.id === t);
	return Be(n, () => `Panel data not found for id "${t}"`), n;
}
function BT(e, t) {
	return e.findIndex((e) => e === t || e.id === t.id);
}
function VT(e, t) {
	return e.findIndex((e) => e.id === t);
}
function HT(e, t, n) {
	let r = VT(e, t.id), i = r === e.length - 1 ? [r - 1, r] : [r, r + 1], a = n[r];
	return {
		...t,
		panelSize: a,
		pivotIndices: i
	};
}
function UT(e) {
	return e.sort((e, t) => {
		let n = e.order, r = t.order;
		return n == null && r == null ? 0 : n == null ? -1 : r == null ? 1 : n - r;
	});
}
function WT(e) {
	return e.map((e) => e.id).sort().join(":");
}
function GT(e) {
	return e.map((e) => e.id).sort().map((t) => {
		let n = e.find((e) => e.id === t);
		return JSON.stringify(n);
	}).join(",");
}
function KT({ size: e, defaultSize: t, dragState: n, resolvedSizes: r, panels: i, panelIndex: a, horizontal: o, collapsed: s = !1, precision: c = 3 }) {
	let l = r[a], u = e ?? t, d = i[a], f, p, m = 1, h = o ? "Width" : "Height", g = d ? IT(d.minSize) : void 0, _ = d ? IT(d.maxSize) : void 0, v = s ? IT(d?.collapsedSize ?? 0) : g, y = IT(u);
	return l == null ? y == null ? f = "1" : y.endsWith("%") ? f = Number.parseFloat(y).toPrecision(c) : (p = qT({
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
function qT({ basis: e, minSize: t, maxSize: n }) {
	return `clamp(${t ?? "0%"}, ${e}, ${n ?? "100%"})`;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/splitter.connect.mjs
function JT(e, t) {
	let { state: n, send: r, prop: i, computed: a, context: o, scope: s } = e, c = a("horizontal"), l = n.matches("dragging"), u = i("registry"), d = i("orientation"), f = i("panels"), p = o.get("panels"), m = () => {
		let e = o.get("size");
		return e.length > 0 ? e : LT({
			sizes: i("size") ?? i("defaultSize"),
			panels: f,
			rootEl: null,
			orientation: d
		});
	}, h = (e) => {
		let t = f.findIndex((t) => t.id === e), n = i("size")?.[t], r = i("defaultSize")?.[t], a = o.get("dragState"), s = o.get("size"), l = p[t], u = s[t], d = !!l?.collapsible && u != null && OT(u, l.collapsedSize ?? 0);
		return KT({
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
			return zT(f, e);
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
			let t = o.get("panels"), n = m(), r = zT(t, e), { panelSize: i } = HT(t, r, n);
			return Be(i != null, () => `Panel size not found for panel "${r.id}"`), i;
		},
		isPanelCollapsed(e) {
			let t = o.get("panels"), n = m(), r = zT(t, e), { collapsedSize: i = 0, collapsible: a, panelSize: s } = HT(t, r, n);
			return Be(s != null, () => `Panel size not found for panel "${r.id}"`), a === !0 && OT(s, i);
		},
		isPanelExpanded(e) {
			let t = o.get("panels"), n = m(), r = zT(t, e), { collapsedSize: i = 0, collapsible: a, panelSize: s } = HT(t, r, n);
			return Be(s != null, () => `Panel size not found for panel "${r.id}"`), !a || DT(s, i) > 0;
		},
		getLayout() {
			return WT(i("panels"));
		},
		getRootProps() {
			return t.element({
				...lT.root.attrs,
				"data-orientation": d,
				"data-dragging": Z(l),
				id: uT(s),
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
				...lT.panel.attrs,
				"data-orientation": d,
				"data-dragging": Z(l),
				dir: i("dir"),
				"data-id": n,
				"data-index": VT(i("panels"), n),
				id: fT(s, n),
				"data-ownedby": uT(s),
				style: h(n)
			});
		},
		getResizeTriggerState: _,
		getResizeTriggerIndicator(e) {
			let n = _(e);
			return t.element({
				...lT.resizeTriggerIndicator.attrs,
				"data-orientation": d,
				"data-focus": Z(n.focused),
				"data-dragging": Z(n.dragging),
				"data-disabled": Z(n.disabled),
				"data-ownedby": uT(s)
			});
		},
		getResizeTriggerProps(e) {
			let { id: n } = e, a = _(e), o = g(n), l = ET(m(), p, o);
			return t.element({
				...lT.resizeTrigger.attrs,
				dir: i("dir"),
				id: dT(s, n),
				role: "separator",
				"data-id": n,
				"data-ownedby": uT(s),
				tabIndex: a.disabled ? void 0 : 0,
				"aria-valuenow": l.valueNow,
				"aria-valuemin": l.valueMin,
				"aria-valuemax": l.valueMax,
				"data-orientation": d,
				"aria-orientation": d,
				"aria-controls": l.beforeId && l.afterId ? `${fT(s, l.beforeId)} ${fT(s, l.afterId)}` : void 0,
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
					if (!Le(e)) return;
					if (a.disabled) {
						e.preventDefault();
						return;
					}
					if (e.currentTarget.focus({
						preventScroll: !0,
						focusVisible: !1
					}), u) return;
					let t = st(e);
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
					}[at(e, {
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
function YT({ panels: e, prevLayout: t, prevGroupSize: n, nextGroupSize: r }) {
	if (n <= 0 || r <= 0) return t;
	let i = [...t], a = [], o = 0, s = 0;
	if (e.forEach((e, c) => {
		if (e.resizeBehavior === "preserve-pixel-size") {
			let e = t[c] / 100 * n / r * 100;
			i[c] = e, o += e;
		} else a.push(c), s += t[c];
	}), a.length === 0) {
		let e = i.reduce((e, t) => e + t, 0);
		if (OT(e, 100)) return i;
		if (e <= 0) return t;
		let n = 100 / e;
		return i.map((e) => e * n);
	}
	let c = 100 - o;
	if (c <= 0) {
		let e = i.reduce((e, t) => e + t, 0);
		if (OT(e, 100)) return i;
		let t = 100 / Math.max(e, 1);
		return i.map((e) => e * t);
	}
	if (OT(s, 0)) {
		let e = c / a.length;
		return a.forEach((t) => {
			i[t] = e;
		}), i;
	}
	a.forEach((e) => {
		i[e] = t[e] / s * c;
	});
	let l = i.reduce((e, t) => e + t, 0);
	if (OT(l, 100)) return i;
	let u = 100 / l;
	return i.map((e) => e * u);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/utils/resize-panel.mjs
function XT({ panels: e, index: t, size: n }) {
	let r = e[t];
	Be(r, () => `Panel data not found for index ${t}`);
	let { collapsedSize: i = 0, collapsible: a, maxSize: o = 100, minSize: s = 0 } = r;
	if (DT(n, s) < 0) {
		if (a) {
			let e = (i + s) / 2;
			n = DT(n, e) < 0 ? i : s;
		} else n = s;
	}
	return n = Math.min(o, n), n = parseFloat(n.toFixed(10)), n;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/utils/resize-by-delta.mjs
function ZT(e) {
	let { delta: t, initialSize: n, panels: r, pivotIndices: i, prevSize: a, trigger: o } = e;
	if (OT(t, 0)) return n;
	let s = [...n], [c, l] = i;
	Be(c, () => "Invalid first pivot index"), Be(l, () => "Invalid second pivot index");
	let u = 0;
	if (o === "keyboard") {
		{
			let e = t < 0 ? l : c, i = r[e];
			Be(i, () => `Panel data not found for index ${e}`);
			let { collapsedSize: a = 0, collapsible: o, minSize: s = 0 } = i;
			if (o) {
				let r = n[e];
				if (Be(r, () => `Previous size not found for panel index ${e}`), OT(r, a)) {
					let e = s - r;
					DT(e, Math.abs(t)) > 0 && (t = t < 0 ? 0 - e : e);
				}
			}
		}
		{
			let e = t < 0 ? c : l, i = r[e];
			Be(i, () => `No panel data found for index ${e}`);
			let { collapsedSize: a = 0, collapsible: o, minSize: s = 0 } = i;
			if (o) {
				let r = n[e];
				if (Be(r, () => `Previous size not found for panel index ${e}`), OT(r, s)) {
					let e = r - a;
					DT(e, Math.abs(t)) > 0 && (t = t < 0 ? 0 - e : e);
				}
			}
		}
	}
	{
		let e = t < 0 ? 1 : -1, i = t < 0 ? l : c, a = 0;
		for (;;) {
			let t = n[i];
			Be(t, () => `Previous size not found for panel index ${i}`);
			let o = XT({
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
			Be(a, () => `Previous size not found for panel index ${e}`);
			let o = a - i, c = XT({
				panels: r,
				index: e,
				size: o
			});
			if (!OT(a, c) && (u += a - c, s[e] = c, u.toPrecision(3).localeCompare(Math.abs(t).toPrecision(3), void 0, { numeric: !0 }) >= 0)) break;
			t < 0 ? e-- : e++;
		}
	}
	if (kT(a, s)) return a;
	{
		let e = t < 0 ? l : c, i = n[e];
		Be(i, () => `Previous size not found for panel index ${e}`);
		let a = i + u, o = XT({
			panels: r,
			index: e,
			size: a
		});
		if (s[e] = o, !OT(o, a)) {
			let e = a - o, n = t < 0 ? l : c;
			for (; n >= 0 && n < r.length;) {
				let i = s[n];
				Be(i, () => `Previous size not found for panel index ${n}`);
				let a = i + e, o = XT({
					panels: r,
					index: n,
					size: a
				});
				if (OT(i, o) || (e -= o - i, s[n] = o), OT(e, 0)) break;
				t > 0 ? n-- : n++;
			}
		}
	}
	return OT(s.reduce((e, t) => t + e, 0), 100) ? s : a;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/utils/validate-sizes.mjs
function QT({ size: e, panels: t }) {
	let n = [...e], r = n.reduce((e, t) => e + t, 0);
	if (n.length !== t.length) throw Error(`Invalid ${t.length} panel size: ${n.map((e) => `${e}%`).join(", ")}`);
	if (!OT(r, 100) && n.length > 0) for (let e = 0; e < t.length; e++) {
		let t = n[e];
		Be(t, () => `No size data found for index ${e}`);
		let i = 100 / r * t;
		n[e] = i;
	}
	let i = 0;
	for (let e = 0; e < t.length; e++) {
		let r = n[e];
		Be(r, () => `No size data found for index ${e}`);
		let a = XT({
			panels: t,
			index: e,
			size: r
		});
		r != a && (i += r - a, n[e] = a);
	}
	if (!OT(i, 0)) for (let e = 0; e < t.length; e++) {
		let r = n[e];
		Be(r, () => `No size data found for index ${e}`);
		let a = r + i, o = XT({
			panels: t,
			index: e,
			size: a
		});
		if (r !== o && (i -= o - r, n[e] = o, OT(i, 0))) break;
	}
	return n;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/splitter.machine.mjs
var $T = zt({
	props({ props: e }) {
		return Nn(e, ["panels"]), {
			orientation: "horizontal",
			defaultSize: [],
			dir: "ltr",
			...e,
			panels: UT(e.panels)
		};
	},
	initialState() {
		return "idle";
	},
	context({ prop: e, bindable: t, getContext: n, getRefs: r }) {
		return {
			panels: t(() => ({ defaultValue: RT(e("panels"), null, e("orientation")) })),
			size: t(() => ({
				defaultValue: [],
				isEqual(e, t) {
					return t != null && kT(e, t);
				},
				onChange(t) {
					let i = n(), a = r();
					if (a.get("suppressOnResize")) return;
					let o = a.get("panelSizeBeforeCollapse"), s = Object.fromEntries(o.entries()), c = i.get("dragState")?.resizeTriggerId ?? null, l = WT(e("panels"));
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
			() => GT(n("panels")),
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
			return t.isActiveElement(hT(t, n?.resizeTriggerId));
		} },
		effects: {
			trackResizeHandles: ({ prop: e, scope: t, send: n }) => {
				let r = e("registry");
				if (!r) return;
				let i = [], a = () => {
					i.forEach((e) => e()), i = xT(t).map((i) => {
						let a = i.dataset.id;
						if (a) return r.register({
							id: dT(t, a),
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
				let o = Sa(mT(t), { callback: a });
				return () => {
					i.forEach((e) => e()), o?.();
				};
			},
			trackRootResize: ({ scope: e, send: t }) => {
				let n = mT(e);
				if (n) return Ia.observe(n, () => {
					t({ type: "ROOT.RESIZE" });
				});
			},
			waitForHoverDelay: ({ send: e }) => Kr(() => {
				e({ type: "HOVER_DELAY" });
			}, 250),
			trackPointerMove: ({ scope: e, send: t }) => {
				let n = e.getDoc();
				return Mn(n, {
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
				let { context: t, event: n, prop: r, scope: i } = e, a = n.size, o = t.get("size"), s = t.get("panels"), c = QT({
					size: LT({
						sizes: a,
						panels: r("panels"),
						rootEl: mT(i),
						orientation: r("orientation")
					}),
					panels: s
				});
				Ot(o, c) || eE(e, c);
			},
			resetSize(e) {
				let { refs: t, context: n, prop: r, scope: i } = e;
				eE(e, t.get("initialSize") ?? QT({
					size: LT({
						sizes: r("size") ?? r("defaultSize"),
						panels: r("panels"),
						rootEl: mT(i),
						orientation: r("orientation")
					}),
					panels: n.get("panels")
				}));
			},
			syncSize(e) {
				let { context: t, scope: n, prop: r, refs: i } = e, a = mT(n);
				if (!a) return;
				let o = r("orientation"), s = NT(a, o);
				if (s <= 0) return;
				let c = RT(r("panels"), a, r("orientation"));
				t.set("panels", c);
				let l = r("size") ?? r("defaultSize"), u = `${WT(r("panels"))}:${JSON.stringify(r("size") ?? [])}:${JSON.stringify(r("defaultSize") ?? [])}`, d = i.get("prevGroupSize"), f = t.get("size"), p = LT({
					sizes: l,
					panels: r("panels"),
					rootEl: a,
					orientation: o
				}), m = QT({
					size: d != null && d !== s && f.length === c.length ? YT({
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
				let i = n("orientation"), a = e.get("size"), o = t.id, s = yT(r, o);
				if (!s || !mT(r)) return;
				let c = hT(r, o);
				Be(c, () => `Drag handle element not found for id "${o}"`);
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
					resolvedResizeTriggerId: yT(n, r)
				});
			},
			clearKeyboardState({ context: e }) {
				e.set("keyboardState", null);
			},
			collapsePanel(e) {
				let { context: t, event: n, refs: r } = e, i = t.get("size"), a = t.get("panels"), o = a.find((e) => e.id === n.id);
				if (Be(o, () => `Panel data not found for id "${n.id}"`), o.collapsible) {
					let { collapsedSize: t = 0, panelSize: n, pivotIndices: s } = HT(a, o, i);
					if (Be(n != null, () => `Panel size not found for panel "${o.id}"`), !OT(n, t)) {
						r.get("panelSizeBeforeCollapse").set(o.id, n);
						let c = ZT({
							delta: BT(a, o) === a.length - 1 ? n - t : t - n,
							initialSize: i,
							panels: a,
							pivotIndices: s,
							prevSize: i,
							trigger: "imperative-api"
						});
						Ot(i, c) || eE(e, c);
					}
				}
			},
			expandPanel(e) {
				let { context: t, event: n, refs: r } = e, i = t.get("panels"), a = t.get("size"), o = i.find((e) => e.id === n.id);
				if (Be(o, () => `Panel data not found for id "${n.id}"`), o.collapsible) {
					let { collapsedSize: t = 0, panelSize: s = 0, minSize: c = 0, pivotIndices: l } = HT(i, o, a), u = n.minSize ?? c;
					if (OT(s, t)) {
						let t = r.get("panelSizeBeforeCollapse").get(o.id), n = t != null && t >= u ? t : u, c = ZT({
							delta: BT(i, o) === i.length - 1 ? s - n : n - s,
							initialSize: a,
							panels: i,
							pivotIndices: l,
							prevSize: a,
							trigger: "imperative-api"
						});
						Ot(a, c) || eE(e, c);
					}
				}
			},
			resizePanel(e) {
				let { context: t, event: n } = e, r = t.get("size"), i = t.get("panels"), a = zT(i, n.id), o = n.size, { panelSize: s, pivotIndices: c } = HT(i, a, r);
				Be(s != null, () => `Panel size not found for panel "${a.id}"`);
				let l = ZT({
					delta: BT(i, a) === i.length - 1 ? s - o : o - s,
					initialSize: r,
					panels: i,
					pivotIndices: c,
					prevSize: r,
					trigger: "imperative-api"
				});
				Ot(r, l) || eE(e, l);
			},
			setPointerValue(e) {
				let { context: t, event: n, prop: r, scope: i } = e, a = t.get("dragState");
				if (!a) return;
				let { resolvedResizeTriggerId: o, initialSize: s, initialCursorPosition: c } = a, l = t.get("panels"), u = mT(i);
				Be(u, () => "Panel group element not found");
				let d = o.split(":").map((e) => l.findIndex((t) => t.id === e)), f = r("orientation") === "horizontal", p = f ? n.point.x : n.point.y, m = u.getBoundingClientRect(), h = f ? m.width : m.height, g = (p - c) / h * 100, _ = t.get("size"), v = ZT({
					delta: g,
					initialSize: s ?? _,
					panels: l,
					pivotIndices: d,
					prevSize: _,
					trigger: "mouse-or-touch"
				});
				Ot(_, v) || eE(e, v);
			},
			setKeyboardValue(e) {
				let { context: t, event: n } = e, r = t.get("panels"), i = yT(e.scope, n.id);
				if (!i) return;
				let a = n.delta, o = i.split(":").map((e) => r.findIndex((t) => t.id === e)), s = t.get("size"), c = ZT({
					delta: a,
					initialSize: s,
					panels: r,
					pivotIndices: o,
					prevSize: s,
					trigger: "keyboard"
				});
				Ot(s, c) || eE(e, c);
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
				Be(c, () => `No panel data found for index ${s}`);
				let l = i[s], { collapsedSize: u = 0, collapsible: d, minSize: f = 0 } = c;
				if (l != null && d) {
					let t = [a, o].map((e) => r.findIndex((t) => t.id === e)), s = ZT({
						delta: OT(l, u) ? f - u : u - l,
						initialSize: n.get("initialSize") ?? i,
						panels: r,
						pivotIndices: t,
						prevSize: i,
						trigger: "keyboard"
					});
					Ot(i, s) || eE(e, s);
				}
			},
			setGlobalCursor(e) {
				let { context: t, scope: n, prop: r } = e;
				if (r("registry")) return;
				let i = t.get("dragState");
				if (!i) return;
				let a = t.get("panels"), o = r("orientation") === "horizontal", [s] = i.resolvedResizeTriggerId.split(":"), c = a[a.findIndex((e) => e.id === s)], l = ET(t.get("size"), a, i.resolvedResizeTriggerId);
				CT(n, {
					isAtMin: OT(l.valueNow, l.valueMin) || OT(l.valueNow, c.collapsedSize),
					isAtMax: OT(l.valueNow, l.valueMax)
				}, o, r("nonce"));
			},
			clearGlobalCursor({ scope: e }) {
				wT(e);
			},
			focusNextResizeTrigger({ event: e, scope: t }) {
				let n = xT(t), r = n.findIndex((t) => t.dataset.id === e.id);
				(e.shiftKey ? mn(n, r) : Qt(n, r))?.focus();
			}
		}
	}
});
function eE(e, t) {
	let { refs: n, prop: r, context: i } = e, a = i.get("panels"), o = r("onCollapse"), s = r("onExpand"), c = r("onResize"), l = r("onResizeStart"), u = r("onResizeEnd"), d = n.get("panelIdToLastNotifiedSizeMap"), f = i.get("dragState"), p = i.get("keyboardState"), m = f === null && p === null;
	if (n.set("lastRequestedSize", t), m && l && queueMicrotask(() => {
		l();
	}), r("size") == null) i.set("size", t);
	else if (c) {
		let e = n.get("panelSizeBeforeCollapse"), i = Object.fromEntries(e.entries()), a = f?.resizeTriggerId ?? null;
		c({
			size: t,
			layout: WT(r("panels")),
			resizeTriggerId: a,
			expandToSizes: i
		});
	}
	t.forEach((e, t) => {
		let n = a[t];
		Be(n, () => `Panel data not found for index ${t}`);
		let { collapsedSize: r = 0, collapsible: i, id: c } = n, l = d.get(c);
		(l == null || e !== l) && (d.set(c, e), i && l != null && (o || s) && (OT(l, r) && !OT(e, r) && s?.({
			panelId: c,
			size: e
		}), !OT(l, r) && OT(e, r) && o?.({
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
var [tE, nE] = an({
	name: "SplitterContext",
	hookName: "useSplitterContext",
	providerName: "<SplitterProvider />"
}), rE = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function iE(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, rE), i = y(() => Bt()(r, ["id"])), a = y(() => w(z(i), 2)), o = y(() => z(a)[0]), s = y(() => z(a)[1]), c = nE(), l = y(() => X(c().getPanelProps(z(o)), z(s)));
	return Q(e, J({ as: "div" }, () => z(l), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(iE, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/splitter/use-splitter-resize-trigger-props-context.js
var [aE, oE] = an({
	name: "SplitterResizeTriggerPropsContext",
	hookName: "useSplitterResizeTriggerPropsContext",
	providerName: "<SplitterResizeTriggerPropsProvider />"
}), sE = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function cE(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, sE), i = y(() => Bt()(r, ["disabled", "id"])), a = y(() => w(z(i), 2)), o = y(() => z(a)[0]), s = y(() => z(a)[1]), c = nE(), l = y(() => X(c().getResizeTriggerProps(z(o)), z(s)));
	return aE(() => z(o)), Q(e, J({ as: "button" }, () => z(l), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(cE, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/splitter/splitter-split-props.svelte.js
function lE(e) {
	return Bt()(e, [
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
var uE = (e) => {
	let t = pn(), n = Zt(), r = y(() => {
		let r = Xe(e);
		return Nn(r, ["id"]), {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = Ut($T, () => z(r)), a = y(() => JT(i, gn));
	return () => z(a);
}, dE = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"size"
]);
function fE(e, t) {
	let n = g();
	k(t, !0);
	let r = L(t, "ref", 15, null), i = L(t, "size", 15), a = K(t, dE), o = y(() => lE(a)), s = y(() => w(z(o), 2)), c = y(() => z(s)[0]), l = y(() => z(s)[1]), u = y(() => ({
		...z(c),
		id: z(c).id ?? n,
		size: i(),
		onResize: (e) => {
			z(c).onResize?.(e), i(e.size);
		}
	})), d = uE(() => z(u)), f = y(() => X(d().getRootProps(), z(l)));
	return tE(d), Q(e, J({ as: "div" }, () => z(f), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), x({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), A();
		},
		get size() {
			return i();
		},
		set size(e) {
			i(e), A();
		}
	});
}
H(fE, {
	ref: {},
	size: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/Splitter.svelte
var pE = Symbol("af-splitter size set"), mE = I("<!> <!> <!>", 1), hE = I("<!> <!>", 1), gE = {
	hash: "svelte-125g2ht",
	code: ":host {display:flex;min-height:0;}[data-scope='splitter'][data-part='root'] {flex:1 1 auto;min-width:0;min-height:0;}[data-scope='splitter'][data-part='panel'] {min-width:0;min-height:0;overflow:hidden;}[data-scope='splitter'][data-part='resize-trigger'] {box-sizing:border-box;width:4px;margin:0;padding:0;border:0;border-radius:0;outline:none;appearance:none;background-color:var(--k-line);transition:background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);}[data-scope='splitter'][data-part='resize-trigger'][data-orientation='vertical'] {width:auto;height:4px;}[data-scope='splitter'][data-part='resize-trigger'][data-dragging] {background-color:color-mix(in oklab, var(--k-primary) 40%, transparent);}\n  @media (hover: hover) {[data-scope='splitter'][data-part='resize-trigger']:hover {background-color:color-mix(in oklab, var(--k-primary) 40%, transparent);} }[data-scope='splitter'][data-part='resize-trigger']:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[data-scope='splitter'][data-part='resize-trigger']:focus-visible, [data-scope='splitter'][data-part='resize-trigger'][data-dragging] {position:relative;z-index:1;}\n  @media (prefers-reduced-motion: reduce) {[data-scope='splitter'][data-part='resize-trigger'] {transition:none;} }\n  @media (forced-colors: active) {[data-scope='splitter'][data-part='resize-trigger'] {forced-color-adjust:none;background-color:CanvasText;}[data-scope='splitter'][data-part='resize-trigger'][data-dragging] {background-color:Highlight;}\n    @media (hover: hover) {[data-scope='splitter'][data-part='resize-trigger']:hover {background-color:Highlight;} }[data-scope='splitter'][data-part='resize-trigger']:focus-visible {outline:2px solid CanvasText;outline-offset:2px;}\n  }"
};
function _E(e, t) {
	k(t, !0), ee(e, gE);
	let i = L(t, "size", 7, 50), a = L(t, "min", 7, 20), o = L(t, "max", 7, 80), s = L(t, "orientation", 7, "horizontal"), c = L(t, "label", 7, null), l = L(t, "locale", 7, null), f = L(t, "strings", 7, null), p = t.$$host, m = r(p), h = y(() => u(l(), f() ?? void 0)), g = (e, t) => {
		let n = typeof e == "string" && e.trim() !== "" ? Number(e) : e;
		return typeof n == "number" && Number.isFinite(n) ? n : t;
	}, _ = y(() => Math.min(100, Math.max(0, g(a(), 20)))), v = y(() => Math.min(100, Math.max(z(_), g(o(), 80)))), b = y(() => g(i(), 50)), S = (e) => Math.min(z(v), Math.max(z(_), e)), te = y(() => s() === "vertical"), C = y(() => [{
		id: "start",
		minSize: z(_),
		maxSize: z(v)
	}, { id: "end" }]), w = B(ge([50, 50])), T = 50, ne = B(0);
	p[pE] = () => {
		q(ne, Te(() => z(ne)) + 1);
	};
	function re(e) {
		q(w, [e, 100 - e], !0), T = e;
	}
	me(() => {
		let e = z(b);
		z(ne), Te(() => re(S(e)));
	}), me(() => {
		z(_), z(v), Te(() => re(S(z(w)[0])));
	});
	function ie() {
		let e = z(w)[0];
		Math.abs(e - T) < 1e-9 || (T = e, d(p, "size-change", { size: Math.round(e * 100) / 100 }));
	}
	var D = {
		get size() {
			return i();
		},
		set size(e = 50) {
			i(e), A();
		},
		get min() {
			return a();
		},
		set min(e = 20) {
			a(e), A();
		},
		get max() {
			return o();
		},
		set max(e = 80) {
			o(e), A();
		},
		get orientation() {
			return s();
		},
		set orientation(e = "horizontal") {
			s(e), A();
		},
		get label() {
			return c();
		},
		set label(e = null) {
			c(e), A();
		},
		get locale() {
			return l();
		},
		set locale(e = null) {
			l(e), A();
		},
		get strings() {
			return f();
		},
		set strings(e = null) {
			f(e), A();
		}
	}, O = hE(), ae = G(O);
	n(ae, {});
	var oe = U(ae, 2);
	return Ft(oe, {
		value: () => p.shadowRoot,
		children: (e, n) => {
			Qu(e, {
				get dir() {
					return m;
				},
				children: (e, n) => {
					var r = P(), i = G(r), a = () => z(w), o = (e) => {
						e && q(w, e, !0);
					};
					{
						let e = y(() => z(te) ? "vertical" : "horizontal");
						E(i, () => fE, (n, r) => {
							r(n, {
								get orientation() {
									return z(e);
								},
								get panels() {
									return z(C);
								},
								keyboardResizeBy: 5,
								get size() {
									return a();
								},
								set size(e) {
									o(e);
								},
								onResizeEnd: ie,
								children: (e, n) => {
									var r = mE(), i = G(r);
									E(i, () => iE, (e, n) => {
										n(e, {
											id: "start",
											part: "start",
											children: (e, n) => {
												var r = P(), i = G(r);
												le(i, t, "start", {}, null), F(e, r);
											},
											$$slots: { default: !0 }
										});
									});
									var a = U(i, 2);
									{
										let e = y(() => c() || z(h).resizeHandle);
										E(a, () => cE, (t, n) => {
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
									var o = U(a, 2);
									E(o, () => iE, (e, n) => {
										n(e, {
											id: "end",
											part: "end",
											children: (e, n) => {
												var r = P(), i = G(r);
												le(i, t, "end", {}, null), F(e, r);
											},
											$$slots: { default: !0 }
										});
									}), F(e, r);
								},
								$$slots: { default: !0 }
							});
						});
					}
					F(e, r);
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { default: !0 }
	}), F(e, O), x(D);
}
H(_E, {
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
		super.size = e, this[pE]?.();
	}
	attributeChangedCallback(e, t, n) {
		super.attributeChangedCallback(e, t, n), e === "size" && this[pE]?.();
	}
});
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tabs/use-tabs-context.js
var [vE, yE] = an({
	name: "TabsContext",
	hookName: "useTabsContext",
	providerName: "<TabsProvider />"
}), bE = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function xE(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, bE), i = y(() => Bt()(r, ["value"])), a = y(() => w(z(i), 2)), o = y(() => z(a)[0]), s = y(() => z(a)[1]), c = yE(), l = $a(), u = y(() => ({
		...l(),
		present: c().value === z(o).value,
		immediate: !0
	})), d = ao(() => z(u)), f = y(() => X(c().getContentProps(z(o)), z(s)));
	so(d);
	function p(e) {
		d().setNode(e);
	}
	var m = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	}, h = P(), g = G(h), _ = (e) => {
		Q(e, J({ as: "div" }, () => z(f), {
			[de()]: p,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, v = y(() => !d().unmounted);
	return M(g, (e) => {
		z(v) && e(_);
	}), F(e, h), x(m);
}
H(xE, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tabs/tabs-list.svelte
var SE = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function CE(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, SE), i = yE(), a = y(() => X(i().getListProps(), r));
	return Q(e, J({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(CE, { ref: {} }, [], [], { mode: "open" });
var wE = Cn("tabs").parts("root", "list", "trigger", "content", "indicator").build(), TE = (e) => e.ids?.root ?? `tabs:${e.id}`, EE = (e) => e.ids?.list ?? `tabs:${e.id}:list`, DE = (e, t) => e.ids?.content?.(t) ?? `tabs:${e.id}:content-${t}`, OE = (e, t) => e.ids?.trigger?.(t) ?? `tabs:${e.id}:trigger-${t}`, kE = (e) => e.ids?.indicator ?? `tabs:${e.id}:indicator`, AE = (e) => e.getById(EE(e)), jE = (e, t) => e.getById(DE(e, t)), ME = (e, t) => t == null ? null : e.getById(OE(e, t)), NE = (e) => e.getById(kE(e)), PE = (e) => {
	let t = `[role=tab]${Pt(EE(e))}:not([disabled])`;
	return ze(AE(e), t);
}, FE = (e) => Dn(PE(e)), IE = (e) => xn(PE(e)), LE = (e, t) => Rt(PE(e), OE(e, t.value), t.loopFocus), RE = (e, t) => Pn(PE(e), OE(e, t.value), t.loopFocus), zE = (e) => ({
	x: e?.offsetLeft ?? 0,
	y: e?.offsetTop ?? 0,
	width: e?.offsetWidth ?? 0,
	height: e?.offsetHeight ?? 0
}), BE = (e, t) => zE(In(PE(e), OE(e, t)));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tabs@1.43.3/node_modules/@zag-js/tabs/dist/tabs.connect.mjs
function VE(e, t) {
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
			let t = OE(o, e);
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
			e && ME(o, e)?.focus();
		},
		getRootProps() {
			return t.element({
				...wE.root.attrs,
				id: TE(o),
				"data-orientation": a("orientation"),
				"data-focus": Z(c),
				dir: a("dir")
			});
		},
		getListProps() {
			return t.element({
				...wE.list.attrs,
				id: EE(o),
				role: "tablist",
				dir: a("dir"),
				"data-focus": Z(c),
				"aria-orientation": a("orientation"),
				"data-orientation": a("orientation"),
				"aria-label": s?.listLabel,
				onKeyDown(e) {
					if (e.defaultPrevented || rt(e) || !pt(e.currentTarget, Ge(e))) return;
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
					}[at(e, {
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
				...wE.trigger.attrs,
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
				"aria-controls": c.selected ? DE(o, n) : void 0,
				"data-ownedby": EE(o),
				"data-ssr": Z(i.get("ssr")),
				id: OE(o, n),
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
					e.defaultPrevented || Ye(e) || s || (kt() && e.currentTarget.focus(), r({
						type: "TAB_CLICK",
						value: n
					}));
				}
			});
		},
		getContentProps(e) {
			let { value: n } = e, r = i.get("value") === n;
			return t.element({
				...wE.content.attrs,
				dir: a("dir"),
				id: DE(o, n),
				tabIndex: d ? 0 : -1,
				"aria-labelledby": OE(o, n),
				role: "tabpanel",
				"data-ownedby": EE(o),
				"data-selected": Z(r),
				"data-orientation": a("orientation"),
				hidden: !r
			});
		},
		getIndicatorProps() {
			let e = i.get("indicatorRect"), n = i.get("animateIndicator");
			return t.element({
				id: kE(o),
				...wE.indicator.attrs,
				dir: a("dir"),
				"data-orientation": a("orientation"),
				hidden: HE(e),
				onTransitionEnd(e) {
					Ge(e) === e.currentTarget && r({ type: "INDICATOR_TRANSITION_END" });
				},
				style: {
					"--transition-property": "left, right, top, bottom, width, height",
					"--left": Ke(e?.x),
					"--top": Ke(e?.y),
					"--width": Ke(e?.width),
					"--height": Ke(e?.height),
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
var HE = (e) => e == null || e.width === 0 && e.height === 0 && e.x === 0 && e.y === 0, { createMachine: UE } = Fn(), WE = UE({
	props({ props: e }) {
		return {
			dir: "ltr",
			orientation: "horizontal",
			activationMode: "automatic",
			loopFocus: !0,
			composite: !0,
			navigate(e) {
				Ca(e.node);
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
				Y(() => {
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
				Y(() => {
					FE(e)?.focus();
				});
			},
			focusLastTab({ scope: e }) {
				Y(() => {
					IE(e)?.focus();
				});
			},
			focusNextTab({ context: e, prop: t, scope: n, event: r }) {
				let i = r.value ?? e.get("focusedValue");
				if (!i) return;
				let a = LE(n, {
					value: i,
					loopFocus: t("loopFocus")
				});
				Y(() => {
					t("composite") ? a?.focus() : a?.dataset.value != null && e.set("focusedValue", a.dataset.value);
				});
			},
			focusPrevTab({ context: e, prop: t, scope: n, event: r }) {
				let i = r.value ?? e.get("focusedValue");
				if (!i) return;
				let a = RE(n, {
					value: i,
					loopFocus: t("loopFocus")
				});
				Y(() => {
					t("composite") ? a?.focus() : a?.dataset.value != null && e.set("focusedValue", a.dataset.value);
				});
			},
			syncTabIndex({ context: e, scope: t }) {
				Y(() => {
					let n = e.get("value");
					if (!n) return;
					let r = jE(t, n);
					r && (da(r).length > 0 ? r.removeAttribute("tabindex") : r.setAttribute("tabindex", "0"));
				});
			},
			cleanupObserver({ refs: e }) {
				let t = e.get("indicatorCleanup");
				t && t();
			},
			setIndicatorRect({ context: e, event: t, scope: n }) {
				let r = t.id ?? e.get("value");
				NE(n) && r && ME(n, r) && e.set("indicatorRect", BE(n, r));
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
				if (r && r(), !NE(n)) return;
				let i = () => {
					let t = ME(n, e.get("value"));
					if (!t) return;
					let r = zE(t);
					e.set("indicatorRect", (e) => Ot(e, r) ? e : r);
				};
				i();
				let a = PE(n), o = AE(n), s = it(...a.map((e) => Ia.observe(e, i)), ...o ? [Ia.observe(o, i)] : []);
				t.set("indicatorCleanup", s);
			},
			navigateIfNeeded({ context: e, prop: t, scope: n }) {
				let r = e.get("value");
				if (!r) return;
				let i = ME(n, r);
				Lt(i) && t("navigate")?.({
					value: r,
					node: i,
					href: i.href
				});
			}
		}
	}
}), GE = (e) => {
	let t = pn(), n = Zt(), r = y(() => ({
		...Xe(e),
		dir: n().dir,
		getRootNode: t().getRootNode
	})), i = Ut(WE, () => z(r)), a = y(() => VE(i, gn));
	return () => z(a);
}, KE = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"value"
]);
function qE(e, t) {
	let n = g();
	k(t, !0);
	let r = L(t, "ref", 15, null), i = L(t, "value", 15), a = K(t, KE), o = y(() => to(a)), s = y(() => w(z(o), 2)), c = y(() => z(s)[0]), l = y(() => z(s)[1]), u = y(() => {
		let e = {
			...z(l),
			value: i()
		};
		return Bt()(e, [
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
	}), d = y(() => w(z(u), 2)), f = y(() => z(d)[0]), p = y(() => z(d)[1]), m = y(() => ({
		...z(f),
		id: z(f).id ?? n,
		value: i(),
		onValueChange(e) {
			z(f).onValueChange?.(e), i() !== void 0 && i(e.value);
		}
	})), h = GE(() => z(m)), _ = y(() => X(h().getRootProps(), z(p)));
	return vE(h), Qa(() => z(c)), Q(e, J({ as: "div" }, () => z(_), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), x({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), A();
		},
		get value() {
			return i();
		},
		set value(e) {
			i(e), A();
		}
	});
}
H(qE, {
	ref: {},
	value: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tabs/tabs-trigger.svelte
var JE = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function YE(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, JE), i = y(() => Bt()(r, ["value", "disabled"])), a = y(() => w(z(i), 2)), o = y(() => z(a)[0]), s = y(() => z(a)[1]), c = yE(), l = y(() => X(c().getTriggerProps(z(o)), z(s)));
	return Q(e, J({ as: "button" }, () => z(l), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(YE, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Tabs.svelte
var XE = I("<af-tooltip><!></af-tooltip>", 2), ZE = I("<!> <!>", 1), QE = {
	hash: "svelte-j0chmq",
	code: ":host {display:block;}[data-scope='tabs'][data-part='root'] {display:flex;flex-direction:column;gap:8px;}[data-scope='tabs'][data-part='content'] {flex:1;outline:none;}[data-scope='tabs'][data-part='list'] {border:0 solid var(--k-line);}.af-tabs > af-tooltip {display:flex;flex:1 1 0%;align-self:stretch;}.af-tabs > af-tooltip::part(anchor) {display:flex;flex:1 1 0%;align-items:center;}.af-tabs.segmented > af-tooltip {flex:0 1 auto;}.af-tabs [role='tab'][aria-disabled='true']:disabled {cursor:default;}"
};
function $E(e, t) {
	k(t, !0), ee(e, QE);
	let i = L(t, "items", 23, () => []), a = L(t, "value", 7, null), o = L(t, "label", 7, null), s = L(t, "variant", 7, "pill"), c = t.$$host, l = r(c), u = y(() => s() === "line" || s() === "segmented" ? s() : "pill"), f = y(() => {
		let e = (i() ?? []).filter((e) => !e.disabled);
		return e.some((e) => e.value === a()) ? null : e[0]?.value ?? null;
	}), p = (e) => z(f) === null ? void 0 : e.value === z(f) ? 0 : -1, m = (e) => e ? { "aria-description": e } : {};
	var h = {
		get items() {
			return i();
		},
		set items(e = []) {
			i(e), A();
		},
		get value() {
			return a();
		},
		set value(e = null) {
			a(e), A();
		},
		get label() {
			return o();
		},
		set label(e = null) {
			o(e), A();
		},
		get variant() {
			return s();
		},
		set variant(e = "pill") {
			s(e), A();
		}
	}, g = ZE(), S = G(g);
	n(S, {});
	var te = U(S, 2);
	return Ft(te, {
		value: () => c.shadowRoot,
		children: (e, t) => {
			Qu(e, {
				get dir() {
					return l;
				},
				children: (e, t) => {
					var n = P(), r = G(n), s = () => a() ?? null;
					E(r, () => qE, (e, t) => {
						t(e, {
							get value() {
								return s();
							},
							set value(e) {},
							activationMode: "automatic",
							loopFocus: !0,
							onValueChange: (e) => {
								e.value != null && d(c, "tab-change", { value: e.value });
							},
							children: (e, t) => {
								var n = ZE(), r = G(n);
								{
									let e = y(() => o() || void 0);
									E(r, () => CE, (t, n) => {
										n(t, {
											part: "list",
											get class() {
												return `af-kit af-tabs ${z(u) ?? ""}`;
											},
											get "aria-label"() {
												return z(e);
											},
											children: (e, t) => {
												var n = P(), r = G(n);
												_(r, 17, () => i() ?? [], (e) => e.value, (e, t) => {
													var n = P(), r = G(n), i = (e) => {
														var n = XE();
														W(() => b(n, "text", z(t).reason));
														var r = V(n);
														{
															let e = y(() => p(z(t))), n = y(() => m(z(t).reason));
															E(r, () => YE, (r, i) => {
																i(r, J({
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
																		ie();
																		var r = he();
																		W(() => T(r, z(t).label)), F(e, r);
																	},
																	$$slots: { default: !0 }
																}));
															});
														}
														O(n), F(e, n);
													}, a = (e) => {
														var n = P(), r = G(n);
														{
															let e = y(() => !!z(t).disabled), n = y(() => p(z(t)));
															E(r, () => YE, (r, i) => {
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
																		ie();
																		var r = he();
																		W(() => T(r, z(t).label)), F(e, r);
																	},
																	$$slots: { default: !0 }
																});
															});
														}
														F(e, n);
													};
													M(r, (e) => {
														z(t).disabled && z(t).reason ? e(i) : e(a, -1);
													}), F(e, n);
												}), F(e, n);
											},
											$$slots: { default: !0 }
										});
									});
								}
								var a = U(r, 2);
								_(a, 17, () => i() ?? [], (e) => e.value, (e, t) => {
									var n = P(), r = G(n);
									E(r, () => xE, (e, n) => {
										n(e, {
											get value() {
												return z(t).value;
											},
											part: "panel",
											children: (e, n) => {
												var r = P(), i = G(r);
												C(i, () => "slot", !1, (e, n) => {
													v(e, () => ({ name: z(t).value }));
												}), F(e, r);
											},
											$$slots: { default: !0 }
										});
									}), F(e, n);
								}), F(e, n);
							},
							$$slots: { default: !0 }
						});
					}), F(e, n);
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { default: !0 }
	}), F(e, g), x(h);
}
H($E, {
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
var eD = I("<div class=\"state svelte-18matrm\" part=\"state\"><p class=\"lead svelte-18matrm\"> </p></div>"), tD = I("<div class=\"frame svelte-18matrm\" part=\"frame\"><!></div>"), nD = I("<!> <div class=\"af-kit svelte-18matrm\"><!></div>", 1), rD = {
	hash: "svelte-18matrm",
	code: ":host {display:block;}.af-kit.svelte-18matrm {height:100%;}.frame.svelte-18matrm {display:flex;flex-direction:column;gap:8px;box-sizing:border-box;height:100%;min-width:0;padding:12px 16px;border:1px solid var(--k-line);border-radius:var(--k-radius);background:var(--k-surface);font-size:14px;line-height:20px;}.state.svelte-18matrm {padding:16px 0;}.lead.svelte-18matrm {margin:0;font-weight:500;}"
};
function iD(e, t) {
	k(t, !0), ee(e, rD);
	let r = L(t, "spec", 7, null), i = L(t, "result", 7, null), a = L(t, "fields", 7, null), o = L(t, "rows", 7, null), s = L(t, "columns", 7, null), c = L(t, "paging", 7, null), l = L(t, "table", 7, null), d = L(t, "drill", 7, !1), f = L(t, "locale", 7, null), p = L(t, "strings", 7, null), m = t.$$host, h = y(() => u(f(), p() ?? void 0)), g = y(() => r() ? Me(r(), a() ?? void 0) : ""), _ = B(null), v = B(!1);
	Oe(() => {
		let e = !0;
		return import("./chunks/tile-view-xseAeXsL.js").then((t) => {
			e && q(_, t.default);
		}, () => {
			e && q(v, !0);
		}), () => {
			e = !1;
		};
	});
	var b = {
		get spec() {
			return r();
		},
		set spec(e = null) {
			r(e), A();
		},
		get result() {
			return i();
		},
		set result(e = null) {
			i(e), A();
		},
		get fields() {
			return a();
		},
		set fields(e = null) {
			a(e), A();
		},
		get rows() {
			return o();
		},
		set rows(e = null) {
			o(e), A();
		},
		get columns() {
			return s();
		},
		set columns(e = null) {
			s(e), A();
		},
		get paging() {
			return c();
		},
		set paging(e = null) {
			c(e), A();
		},
		get table() {
			return l();
		},
		set table(e = null) {
			l(e), A();
		},
		get drill() {
			return d();
		},
		set drill(e = !1) {
			d(e), A();
		},
		get locale() {
			return f();
		},
		set locale(e = null) {
			f(e), A();
		},
		get strings() {
			return p();
		},
		set strings(e = null) {
			p(e), A();
		}
	}, S = nD(), te = G(S);
	n(te, {});
	var C = U(te, 2), w = V(C), ne = (e) => {
		var t = P(), n = G(t);
		{
			let e = y(() => !!d());
			E(n, () => z(_), (t, n) => {
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
						return c();
					},
					get table() {
						return l();
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
		F(e, t);
	}, re = (e) => {
		var t = tD(), n = V(t), r = (e) => {
			var t = eD(), n = V(t), r = ye(n, !0);
			O(t), W(() => T(r, z(h).tileLoadFailed)), F(e, t);
		}, i = (e) => {
			Ne(e, {
				get title() {
					return z(g);
				},
				get text() {
					return z(h);
				}
			});
		};
		M(n, (e) => {
			z(v) ? e(r) : e(i, -1);
		}), O(t), F(e, t);
	};
	return M(w, (e) => {
		z(_) ? e(ne) : e(re, -1);
	}), O(C), F(e, S), x(b);
}
H(iD, {
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
var aD = Cn("toast").parts("group", "root", "title", "description", "actionTrigger", "closeTrigger").build(), oD = (e) => `toast-group:${e}`, sD = (e, t) => e.getById(`toast-group:${t}`), cD = (e) => `toast:${e.id}`, lD = (e) => e.getById(cD(e)), uD = (e) => `toast:${e.id}:title`, dD = (e) => `toast:${e.id}:description`, fD = (e) => `toast${e.id}:close`, pD = {
	info: 5e3,
	error: 5e3,
	success: 2e3,
	loading: Infinity,
	warning: 5e3,
	DEFAULT: 5e3
};
function mD(e, t) {
	return e ?? pD[t] ?? pD.DEFAULT;
}
var hD = (e) => typeof e == "string" ? {
	left: e,
	right: e,
	bottom: e,
	top: e
} : e;
function gD(e, t) {
	let { prop: n, computed: r, context: i } = e, { offsets: a, gap: o } = n("store").attrs, s = i.get("heights"), c = hD(a), l = n("dir") === "rtl", u = t.replace("-start", l ? "-right" : "-left").replace("-end", l ? "-left" : "-right"), d = u.includes("right"), f = u.includes("left"), p = {
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
		zIndex: _n
	}, m = "center";
	return d && (m = "flex-end"), f && (m = "flex-start"), p.alignItems = m, u.includes("top") && (p.top = `max(env(safe-area-inset-top, 0px), ${c.top})`), u.includes("bottom") && (p.bottom = `max(env(safe-area-inset-bottom, 0px), ${c.bottom})`), u.includes("left") || (p.insetInlineEnd = `calc(env(safe-area-inset-right, 0px) + ${c.right})`), u.includes("right") || (p.insetInlineStart = `calc(env(safe-area-inset-left, 0px) + ${c.left})`), p;
}
function _D(e, t) {
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
function vD(e, t) {
	let { computed: n } = e, r = {
		position: "absolute",
		inset: "0",
		scale: "1 2",
		pointerEvents: t ? "none" : "auto"
	};
	return n("frontmost") && !t && ((e) => Object.assign(r, e))({ height: "calc(var(--initial-height) + 80%)" }), r;
}
function yD() {
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
function bD(e, t) {
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
				...aD.group.attrs,
				dir: r("dir"),
				tabIndex: -1,
				role: "region",
				"aria-label": `${s}, ${u} (${l})`,
				id: oD(u),
				"data-placement": u,
				"data-side": d,
				"data-align": f,
				"aria-live": "polite",
				"aria-relevant": "additions text",
				"aria-atomic": "false",
				style: gD(e, u),
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
					a.get("isFocusWithin") && !pt(e.currentTarget, e.relatedTarget) && queueMicrotask(() => i({ type: "REGION.BLUR" }));
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
var { guards: xD, createMachine: SD } = Fn(), { and: CD } = xD, wD = SD({
	props({ props: e }) {
		return {
			dir: "ltr",
			id: St(),
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
				guard: CD("isOverlapping", "isPointerOut"),
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
				return en(document, "keydown", (n) => {
					let { hotkey: r } = e("store").attrs;
					r.every((e) => n[e] || n.code === e) && t({ type: "DOC.HOTKEY" });
				}, { capture: !0 });
			},
			trackDocumentVisibility({ prop: e, send: t, scope: n }) {
				let { pauseOnPageIdle: r } = e("store").attrs;
				if (!r) return;
				let i = n.getDoc();
				return en(i, "visibilitychange", () => {
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
				let s = fc(() => sD(r, a), { defer: !0 });
				e.set("dismissableCleanup", s);
			},
			clearDismissableBranch({ refs: e }) {
				e.get("dismissableCleanup")?.();
			},
			focusRegionEl({ scope: e, computed: t }) {
				queueMicrotask(() => {
					sD(e, t("placement"))?.focus();
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
}), TD = { closeTriggerLabel: "Dismiss notification" };
function ED(e, t) {
	let { state: n, send: r, prop: i, scope: a, context: o, computed: s } = e, c = He(TD, i("translations")), l = n.hasTag("visible"), u = n.hasTag("paused"), d = o.get("mounted"), f = s("frontmost"), p = i("parent").computed("placement"), m = i("type"), h = i("stacked"), g = i("title"), _ = i("description"), v = i("action"), [y, b = "center"] = p.split("-");
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
				...aD.root.attrs,
				dir: i("dir"),
				id: cD(a),
				"data-state": l ? "open" : "closed",
				"data-type": m,
				"data-placement": p,
				"data-align": b,
				"data-side": y,
				"data-mounted": Z(d),
				"data-paused": Z(u),
				"data-first": Z(f),
				"data-sibling": Z(!f),
				"data-stack": Z(h),
				"data-overlap": Z(!h),
				role: "status",
				"aria-atomic": "true",
				"aria-describedby": _ ? dD(a) : void 0,
				"aria-labelledby": g ? uD(a) : void 0,
				tabIndex: 0,
				style: _D(e, l),
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
				style: vD(e, l)
			});
		},
		getGhostAfterProps() {
			return t.element({
				"data-ghost": "after",
				style: yD()
			});
		},
		getTitleProps() {
			return t.element({
				...aD.title.attrs,
				id: uD(a)
			});
		},
		getDescriptionProps() {
			return t.element({
				...aD.description.attrs,
				id: dD(a)
			});
		},
		getActionTriggerProps() {
			return t.button({
				...aD.actionTrigger.attrs,
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
				id: fD(a),
				...aD.closeTrigger.attrs,
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
var { not: DD } = Ln(), OD = zt({
	props({ props: e }) {
		return Nn(e, [
			"id",
			"type",
			"parent",
			"removeDelay"
		], "toast"), {
			closable: !0,
			...e,
			duration: mD(e.duration, e.type)
		};
	},
	initialState({ prop: e }) {
		return e("type") === "loading" || e("duration") === Infinity ? "visible:persist" : "visible";
	},
	context({ prop: e, bindable: t }) {
		return {
			remainingTime: t(() => ({ defaultValue: mD(e("duration"), e("type")) })),
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
					guard: DD("isLoadingType"),
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
				return Kr(() => {
					t({
						type: "REMOVE",
						src: "timer"
					});
				}, e("removeDelay"));
			},
			waitForDuration({ send: e, context: t, computed: n }) {
				if (!n("shouldPersist")) return Kr(() => {
					e({
						type: "DISMISS",
						src: "timer"
					});
				}, t.get("remainingTime"));
			},
			waitForNextTick({ send: e }) {
				return Kr(() => {
					e({
						type: "SHOW",
						src: "timer"
					});
				}, 0);
			},
			trackHeight({ scope: e, prop: t }) {
				let n;
				return Y(() => {
					let r = lD(e);
					if (!r) return;
					let i = new (e.getWin()).MutationObserver(() => {
						let e = kD(r), n = {
							id: t("id"),
							height: e
						};
						AD(t("parent"), n);
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
				Y(() => {
					e.set("mounted", !0);
				});
			},
			measureHeight({ scope: e, prop: t, context: n }) {
				queueMicrotask(() => {
					let r = lD(e);
					if (!r) return;
					let i = kD(r);
					n.set("initialHeight", i);
					let a = {
						id: t("id"),
						height: i
					};
					AD(t("parent"), a);
				});
			},
			setCloseTimer({ refs: e }) {
				e.set("closeTimerStartTime", Date.now());
			},
			resetCloseTimer({ context: e, refs: t, prop: n }) {
				t.set("closeTimerStartTime", Date.now()), e.set("remainingTime", mD(n("duration"), n("type")));
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
function kD(e) {
	let t = e.style.height;
	e.style.height = "auto";
	let n = e.offsetHeight;
	return e.style.height = t, n;
}
function AD(e, t) {
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
var jD = (e, t) => ({
	...t,
	...We(e)
}), MD = {
	error: [1, 2],
	warning: [3, 6],
	loading: [4, 5],
	success: [5, 7],
	info: [6, 8]
}, ND = "info", PD = (e, t) => {
	let [n, r] = MD[e ?? ND];
	return t ? n : r;
}, FD = (e) => e.sort((e, t) => (e.priority ?? PD(e.type, !!e.action)) - (t.priority ?? PD(t.type, !!t.action)));
function ID(e = {}) {
	let t = jD(e, {
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
		for (a = FD(a); a.length > 0 && r.length < t.max;) {
			let e = a.shift();
			e && (s(e), r.unshift(e));
		}
	}, u = (e) => {
		let n = e.id ?? `toast:${St()}`, a = r.find((e) => e.id === n);
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
				type: ND,
				...e,
				stacked: !t.overlap,
				gap: t.gap
			}, i = r.priority ?? PD(r.type, !!r.action);
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
				bt("[zag-js > toast] toaster.promise() requires at least a 'loading' option to be specified");
				return;
			}
			let r = u({
				...n,
				...t.loading,
				promise: e,
				type: "loading"
			}), i = !0, a, o = Xe(e).then(async (e) => {
				if (a = ["resolve", e], LD(e) && !e.ok) {
					i = !1;
					let a = Xe(t.error, `HTTP Error! status: ${e.status}`);
					u({
						...n,
						...a,
						id: r,
						type: "error"
					});
				} else if (t.success !== void 0) {
					i = !1;
					let a = Xe(t.success, e);
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
					let a = Xe(t.error, e);
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
var LD = (e) => e && typeof e == "object" && "ok" in e && typeof e.ok == "boolean" && "status" in e && typeof e.status == "number", RD = {
	connect: bD,
	machine: wD
}, zD = (e) => ID(e), [BD, VD] = an({
	name: "ToastContext",
	hookName: "useToastContext",
	providerName: "<ToastProvider />"
}), HD = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function UD(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, HD), i = VD(), a = y(() => X(i().getActionTriggerProps(), r));
	return Q(e, J({ as: "button" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(UD, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toast-close-trigger.svelte
var WD = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function GD(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, WD), i = VD(), a = y(() => X(i().getCloseTriggerProps(), r));
	return Q(e, J({ as: "button" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(GD, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toast-description.svelte
var KD = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function qD(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, KD), i = VD(), a = y(() => X(i().getDescriptionProps(), r));
	return Q(e, J({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(qD, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toast-root.svelte
var JD = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]), YD = I("<div></div> <!> <div></div>", 1);
function XD(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, JD), i = VD(), a = y(() => X(i().getRootProps(), r));
	return Q(e, J({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		},
		children: (e, n) => {
			var r = YD(), a = G(r);
			v(a, (e) => ({ ...e }), [() => i().getGhostBeforeProps()]);
			var o = U(a, 2);
			Se(o, () => t.children ?? S);
			var s = U(o, 2);
			v(s, (e) => ({ ...e }), [() => i().getGhostAfterProps()]), F(e, r);
		},
		$$slots: { default: !0 }
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(XD, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toaster-item.svelte
function ZD(e, t) {
	k(t, !0);
	let n = L(t, "children", 7), r = L(t, "value", 7), i = L(t, "parent", 7), a = L(t, "index", 7), o = pn(), s = y(() => ({
		...r()(),
		parent: i(),
		index: a(),
		getRootNode: o().getRootNode
	})), c = Ut(OD, () => z(s)), l = y(() => ED(c, gn));
	BD(() => z(l));
	var u = {
		get children() {
			return n();
		},
		set children(e) {
			n(e), A();
		},
		get value() {
			return r();
		},
		set value(e) {
			r(e), A();
		},
		get parent() {
			return i();
		},
		set parent(e) {
			i(e), A();
		},
		get index() {
			return a();
		},
		set index(e) {
			a(e), A();
		}
	}, d = P(), f = G(d);
	return Se(f, n, r), F(e, d), x(u);
}
H(ZD, {
	children: {},
	value: {},
	parent: {},
	index: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toaster.svelte
var QD = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"toaster",
	"children"
]);
function $D(e, t) {
	let n = g();
	k(t, !0);
	let r = L(t, "ref", 15, null), i = L(t, "toaster", 7), a = L(t, "children", 7), o = K(t, QD), s = Zt(), c = pn(), l = y(() => ({
		store: i(),
		id: n,
		dir: s().dir,
		getRootNode: c().getRootNode
	})), u = Ut(RD.machine, () => z(l)), d = y(() => RD.connect(u, gn)), f = y(() => z(d).getToasts()), p = y(() => X(z(d).getGroupProps(), o));
	return Q(e, J({ as: "div" }, () => z(p), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		},
		children: (e, t) => {
			var n = P(), r = G(n);
			_(r, 19, () => z(f), (e) => e.id, (e, t, n, r) => {
				let i = y(() => () => z(t));
				ZD(e, {
					value: z(i),
					get parent() {
						return u;
					},
					get index() {
						return z(n);
					},
					children: (e, t) => {
						var n = P(), r = G(n);
						Se(r, a, () => z(i)), F(e, n);
					},
					$$slots: { default: !0 }
				});
			}), F(e, n);
		},
		$$slots: { default: !0 }
	})), x({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), A();
		},
		get toaster() {
			return i();
		},
		set toaster(e) {
			i(e), A();
		},
		get children() {
			return a();
		},
		set children(e) {
			a(e), A();
		}
	});
}
H($D, {
	ref: {},
	toaster: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/Toast.svelte
var eO = /* @__PURE__ */ new WeakMap();
function tO(e) {
	let t = eO.get(e);
	return t || eO.set(e, t = zD({
		placement: "bottom-end",
		overlap: !1,
		gap: 8,
		hotkey: ["af-kit-no-hotkey"]
	})), t;
}
function nO(e, t) {
	return e.create({
		type: t.kind,
		description: t.text,
		duration: t.kind === "error" ? t.action ? Infinity : 8e3 : 4e3,
		meta: { action: t.action ?? null }
	});
}
var rO = I("<p> </p>"), iO = ce("<path d=\"m15 9-6 6\"></path><path d=\"M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z\"></path><path d=\"m9 9 6 6\"></path>", 1), aO = ce("<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"m9 12 2 2 4-4\"></path>", 1), oO = ce("<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 16v-4\"></path><path d=\"M12 8h.01\"></path>", 1), sO = ce("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-e495ij\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg>"), cO = ce("<svg part=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-e495ij\"><!></svg><!><!><!>", 1), lO = I("<div class=\"af-kit svelte-e495ij\"><div class=\"live svelte-e495ij\" role=\"status\"></div> <div class=\"live svelte-e495ij\" role=\"alert\"></div> <div class=\"region svelte-e495ij\" popover=\"manual\"><!></div></div>"), uO = I("<!> <!>", 1), dO = {
	hash: "svelte-e495ij",
	code: ":host {display:contents;}.af-kit.svelte-e495ij {display:contents;}.live.svelte-e495ij {position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;}.region[popover].svelte-e495ij {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;pointer-events:none;}[data-scope='toast'][data-part='root'] {--k-toast-tone: var(--k-info);--k-toast-bg: 6%;--k-toast-bg-dark: 0%;--k-toast-edge: 14%;--k-toast-edge-dark: 19%;--k-toast-ink: 100%;--k-toast-ink-dark: 100%;--k-toast-ground: color-mix(in oklab, color-mix(in oklab, var(--k-toast-tone) var(--k-toast-bg-dark), var(--k-bg)) calc(var(--k-dark, 0) * 100%),\n      color-mix(in oklab, var(--k-toast-tone) var(--k-toast-bg), var(--k-popover)));--k-toast-line: color-mix(in oklab, color-mix(in oklab, var(--k-toast-tone) var(--k-toast-edge-dark), var(--k-bg)) calc(var(--k-dark, 0) * 100%),\n      color-mix(in oklab, var(--k-toast-tone) var(--k-toast-edge), var(--k-popover)));--k-toast-text: color-mix(in oklab, color-mix(in oklab, var(--k-toast-tone) var(--k-toast-ink-dark), var(--k-fg)) calc(var(--k-dark, 0) * 100%),\n      color-mix(in oklab, var(--k-toast-tone) var(--k-toast-ink), var(--k-fg)));position:relative;display:flex;align-items:center;gap:6px;width:min(356px, calc(100vw - 32px));padding:16px;box-sizing:border-box;border-color:var(--k-toast-line);border-radius:var(--k-radius);background-color:var(--k-toast-ground);color:var(--k-toast-text);box-shadow:0 4px 12px rgb(0 0 0 / 0.1);outline:none;font-size:13px;line-height:1.5;translate:var(--x) var(--y);scale:var(--scale, 1);z-index:var(--z-index);opacity:var(--opacity);will-change:translate, opacity, scale;transition:translate 400ms cubic-bezier(0.21, 1.02, 0.73, 1), scale 400ms cubic-bezier(0.21, 1.02, 0.73, 1), opacity 400ms cubic-bezier(0.21, 1.02, 0.73, 1);}[data-scope='toast'][data-part='root'][data-state='closed'] {transition:translate 400ms cubic-bezier(0.06, 0.71, 0.55, 1), scale 400ms cubic-bezier(0.06, 0.71, 0.55, 1), opacity 200ms cubic-bezier(0.06, 0.71, 0.55, 1);}[data-scope='toast'][data-part='root']:focus-visible {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring), 0 4px 12px rgb(0 0 0 / 0.1);}[data-scope='toast'][data-part='root'][data-type='error'] {--k-toast-tone: var(--k-danger);--k-toast-bg: 7%;--k-toast-bg-dark: 5%;--k-toast-edge: 14%;--k-toast-edge-dark: 16%;--k-toast-ink: 100%;--k-toast-ink-dark: 56%;}[data-scope='toast'][data-part='root'][data-type='success'] {--k-toast-tone: var(--k-success);--k-toast-bg: 7%;--k-toast-bg-dark: 0%;--k-toast-edge: 22%;--k-toast-edge-dark: 16%;--k-toast-ink: 67%;--k-toast-ink-dark: 55%;}[part='icon'].svelte-e495ij {flex:none;width:16px;height:16px;margin-inline:-4px 5px;color:inherit;}[data-scope='toast'][data-part='description'] {flex:1;min-width:0;font-weight:500;overflow-wrap:anywhere;}[data-scope='toast'][data-part='action-trigger'] {display:flex;flex:none;align-items:center;height:24px;margin-left:auto;padding:0 8px;border:none;border-radius:4px;background-color:var(--k-popover-fg);color:var(--k-popover);outline:none;font:inherit;font-size:12px;font-weight:500;cursor:pointer;transition:opacity 400ms, box-shadow 200ms;}[data-scope='toast'][data-part='action-trigger']:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[data-scope='toast'][data-part='close-trigger'] {position:absolute;top:0;left:0;z-index:1;display:flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:1px solid var(--k-toast-line);border-radius:50%;background-color:var(--k-toast-ground);color:var(--k-toast-text);transform:translate(-35%, -35%);outline:none;cursor:pointer;transition:opacity 100ms, background 200ms, border-color 200ms;}[data-scope='toast'][data-part='close-trigger'] svg.svelte-e495ij {width:12px;height:12px;pointer-events:none;}[data-scope='toast'][data-part='close-trigger']:focus-visible {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring);}\n  @media (forced-colors: active) {[data-scope='toast'][data-part='root']:focus-visible, [data-scope='toast'][data-part='action-trigger']:focus-visible,\n    [data-scope='toast'][data-part='close-trigger']:focus-visible {outline:2px solid;outline-offset:2px;}\n  }\n  @media (prefers-reduced-motion: reduce) {[data-scope='toast'][data-part='root'], [data-scope='toast'][data-part='root'][data-state='closed'] {transition:none;}\n  }"
};
function fO(e, t) {
	k(t, !0), ee(e, dO);
	let r = L(t, "locale", 7, null), i = L(t, "strings", 7, null), o = t.$$host, s = y(() => u(r(), i() ?? void 0)), c = tO(o), l = B(null), f = B(0), p = B(ge([])), m = () => queueMicrotask(() => {
		let e = c.getVisibleToasts();
		q(f, e.length, !0), q(p, e.map((e) => ({
			id: e.id,
			error: e.type === "error",
			text: String(e.description ?? "")
		})), !0);
	});
	Oe(() => (m(), c.subscribe(m))), Oe(() => a(z(l), z(f) > 0, o));
	var h = {
		get locale() {
			return r();
		},
		set locale(e = null) {
			r(e), A();
		},
		get strings() {
			return i();
		},
		set strings(e = null) {
			i(e), A();
		}
	}, g = uO(), v = G(g);
	n(v, {});
	var b = U(v, 2);
	return Ft(b, {
		value: () => o.shadowRoot,
		children: (e, t) => {
			var n = lO(), r = V(n);
			_(r, 21, () => z(p).filter((e) => !e.error), (e) => e.id, (e, t) => {
				var n = rO(), r = ye(n, !0);
				W(() => T(r, z(t).text)), F(e, n);
			}), O(r);
			var i = U(r, 2);
			_(i, 21, () => z(p).filter((e) => e.error), (e) => e.id, (e, t) => {
				var n = rO(), r = ye(n, !0);
				W(() => T(r, z(t).text)), F(e, n);
			}), O(i);
			var a = U(i, 2);
			$D(V(a), {
				get toaster() {
					return c;
				},
				get "aria-label"() {
					return z(s).notifications;
				},
				"aria-live": "off",
				children: (e, t = S) => {
					let n = y(() => t()().meta?.action);
					var r = P(), i = G(r);
					E(i, () => XD, (e, r) => {
						r(e, {
							part: "toast",
							class: "af-overlay",
							"aria-live": "off",
							children: (e, r) => {
								var i = cO(), a = G(i), c = V(a), l = (e) => {
									var t = iO();
									ie(2), F(e, t);
								}, u = y(() => t()().type === "error"), f = (e) => {
									var t = aO();
									ie(), F(e, t);
								}, p = y(() => t()().type === "success"), m = (e) => {
									var t = oO();
									ie(2), F(e, t);
								};
								M(c, (e) => {
									z(u) ? e(l) : z(p) ? e(f, 1) : e(m, -1);
								}), O(a);
								var h = U(a);
								E(h, () => qD, (e, n) => {
									n(e, {
										part: "text",
										children: (e, n) => {
											ie();
											var r = he();
											W((e) => T(r, e), [() => t()().description]), F(e, r);
										},
										$$slots: { default: !0 }
									});
								});
								var g = U(h), _ = (e) => {
									var r = P(), i = G(r);
									E(i, () => UD, (e, r) => {
										r(e, {
											part: "action",
											onclick: () => d(o, "action", {
												toast: t()().id,
												action: z(n).id
											}),
											children: (e, t) => {
												ie();
												var r = he();
												W(() => T(r, z(n).label)), F(e, r);
											},
											$$slots: { default: !0 }
										});
									}), F(e, r);
								};
								M(g, (e) => {
									z(n) && e(_);
								});
								var v = U(g);
								E(v, () => GD, (e, t) => {
									t(e, {
										part: "close",
										get "aria-label"() {
											return z(s).close;
										},
										children: (e, t) => {
											var n = sO();
											F(e, n);
										},
										$$slots: { default: !0 }
									});
								}), F(e, i);
							},
							$$slots: { default: !0 }
						});
					}), F(e, r);
				},
				$$slots: { default: !0 }
			}), O(a), fe(a, (e) => q(l, e), () => z(l)), O(n), F(e, n);
		},
		$$slots: { default: !0 }
	}), F(e, g), x(h);
}
H(fO, {
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, [], [], { mode: "open" }, (e) => class extends e {
	show(e) {
		return nO(tO(this), e);
	}
	dismiss(e) {
		tO(this).dismiss(e);
	}
});
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/use-tooltip-context.js
var [pO, mO] = an({ name: "TooltipContext" }), hO = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function gO(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, hO), i = mO(), a = y(() => X(i().getArrowProps(), r));
	return Q(e, J({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(gO, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/tooltip-arrow-tip.svelte
var _O = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function vO(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, _O), i = mO(), a = y(() => X(i().getArrowTipProps(), r));
	return Q(e, J({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(vO, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/tooltip-content.svelte
var yO = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function bO(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, yO), i = mO(), a = co(), o = y(() => X(i().getContentProps(), a().getPresenceProps(), r));
	function s(e) {
		a().setNode(e);
	}
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	}, l = P(), u = G(l), d = (e) => {
		Q(e, J({ as: "div" }, () => z(o), {
			[de()]: s,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = y(() => !a().unmounted);
	return M(u, (e) => {
		z(f) && e(d);
	}), F(e, l), x(c);
}
H(bO, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/tooltip-context.svelte
function xO(e, t) {
	k(t, !0);
	let n = L(t, "render", 7), r = mO();
	var i = {
		get render() {
			return n();
		},
		set render(e) {
			n(e), A();
		}
	}, a = P(), o = G(a);
	return Se(o, () => n() ?? S, () => r), F(e, a), x(i);
}
H(xO, { render: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/tooltip-positioner.svelte
var SO = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function CO(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, SO), i = mO(), a = co(), o = y(() => X(i().getPositionerProps(), r));
	var s = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	}, c = P(), l = G(c), u = (e) => {
		Q(e, J({ as: "div" }, () => z(o), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, d = y(() => !a().unmounted);
	return M(l, (e) => {
		z(d) && e(u);
	}), F(e, c), x(s);
}
H(CO, { ref: {} }, [], [], { mode: "open" });
var wO = Cn("tooltip").parts("trigger", "arrow", "arrowTip", "positioner", "content").build(), TO = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `tooltip:${e.id}:trigger:${t}` : `tooltip:${e.id}:trigger` : yn(n) ? n(t) : n;
}, EO = (e) => e.ids?.content ?? `tooltip:${e.id}:content`, DO = (e) => e.ids?.arrow ?? `tooltip:${e.id}:arrow`, OO = (e) => e.ids?.positioner ?? `tooltip:${e.id}:popper`, kO = (e) => e.getById(TO(e)), AO = (e) => e.getById(OO(e)), jO = (e) => ze(e.getRootNode(), `[data-scope="tooltip"][data-part="trigger"]${Pt(e.id)}`), MO = (e, t) => t == null ? kO(e) ?? jO(e)[0] : e.getById(TO(e, t)), NO = Hr({
	id: null,
	prevId: null,
	instant: !1
});
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tooltip@1.43.3/node_modules/@zag-js/tooltip/dist/tooltip.connect.mjs
function PO(e, t) {
	let { state: n, context: r, send: i, scope: a, prop: o, event: s } = e, c = o("id"), l = !!o("aria-label"), u = n.matches("open", "closing"), d = r.get("triggerValue"), f = r.get("currentPlacement"), p = f ? Yo(f) : void 0, m = EO(a), h = o("disabled"), g = ms({
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
			let { value: n } = e, r = n != null && d === n, s = TO(a, n);
			return t.button({
				...wO.trigger.attrs,
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
					e.defaultPrevented || h || Lo() && i({
						type: u && n != null && !r ? "triggerValue.set" : "open",
						src: "trigger.focus",
						value: n,
						triggerId: s
					});
				},
				onBlur(e) {
					e.defaultPrevented || h || c === NO.get("id") && ((e.relatedTarget ?? a.getDoc().activeElement)?.closest(Pt(a.id)) ?? i({
						type: "close",
						src: "trigger.blur",
						value: n,
						triggerId: s
					}));
				},
				onPointerDown(e) {
					e.defaultPrevented || h || Le(e) && o("closeOnPointerDown") && c === NO.get("id") && i({
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
				id: DO(a),
				...wO.arrow.attrs,
				dir: o("dir"),
				style: g.arrow
			});
		},
		getArrowTipProps() {
			return t.element({
				...wO.arrowTip.attrs,
				dir: o("dir"),
				style: g.arrowTip
			});
		},
		getPositionerProps() {
			return t.element({
				id: OO(a),
				...wO.positioner.attrs,
				dir: o("dir"),
				style: g.floating
			});
		},
		getContentProps() {
			let e = NO.get("id") === c, n = NO.get("prevId") === c, r = NO.get("instant") && (u && e || n);
			return t.element({
				...wO.content.attrs,
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
var { and: FO, not: IO } = Ln(), LO = zt({
	initialState: ({ prop: e }) => e("open") || e("defaultOpen") ? "open" : "closed",
	props({ props: e }) {
		Nn(e, ["id"]);
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
					triggerElement: MO(n, e)
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
					guard: FO("noVisibleTooltip", IO("hasPointerMoveOpened")),
					target: "opening",
					actions: ["setTriggerValue"]
				}, {
					guard: IO("hasPointerMoveOpened"),
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
			noVisibleTooltip: () => NO.get("id") === null,
			isVisible: ({ prop: e }) => e("id") === NO.get("id"),
			isInteractive: ({ prop: e }) => !!e("interactive"),
			hasPointerMoveOpened: ({ context: e }) => !!e.get("hasPointerMoveOpened"),
			isOpenControlled: ({ prop: e }) => e("open") !== void 0
		},
		actions: {
			setGlobalId: ({ prop: e }) => {
				let t = NO.get("id"), n = t !== null && t !== e("id");
				NO.update({
					id: e("id"),
					prevId: n ? t : null,
					instant: n
				});
			},
			clearGlobalId: ({ prop: e }) => {
				e("id") === NO.get("id") && NO.update({
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
				t.type === "positioning.set" && fs(() => MO(r, e.get("triggerValue")), () => AO(r), {
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
				return fs(() => MO(r, i), () => AO(r), {
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
			trackFocusVisible: ({ scope: e }) => Ro({ root: e.getRootNode?.() }),
			trackPositioning: ({ context: e, prop: t, scope: n }) => (e.get("currentPlacement") || e.set("currentPlacement", t("positioning").placement), fs(() => MO(n, e.get("triggerValue")), () => AO(n), {
				...t("positioning"),
				defer: !0,
				onComplete(t) {
					e.set("currentPlacement", t.placement);
				}
			})),
			trackPointerlockChange: ({ send: e, scope: t }) => {
				let n = t.getDoc();
				return en(n, "pointerlockchange", () => e({
					type: "close",
					src: "pointerlock:change"
				}), !1);
			},
			trackScroll: ({ send: e, prop: t, scope: n, context: r }) => {
				if (!t("closeOnScroll")) return;
				let i = MO(n, r.get("triggerValue"));
				if (!i) return;
				let a = Ta(i).map((t) => en(t, "scroll", () => {
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
					n = NO.subscribe(() => {
						NO.get("id") !== e("id") && t({
							type: "close",
							src: "id.change"
						});
					});
				}), () => n?.();
			},
			trackEscapeKey: ({ send: e, prop: t }) => t("closeOnEscape") ? en(document, "keydown", (t) => {
				rt(t) || t.key === "Escape" && (t.stopPropagation(), e({
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
}), RO = (e) => {
	let t = pn(), n = Zt(), r = y(() => {
		let r = Xe(e);
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = Ut(LO, () => z(r)), a = y(() => PO(i, gn));
	return () => z(a);
}, zO = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open"
]);
function BO(e, t) {
	let n = g();
	k(t, !0);
	let r = L(t, "open", 15), i = K(t, zO), a = y(() => oo(i)), o = y(() => w(z(a), 2)), s = y(() => z(o)[0]), c = y(() => z(o)[1]), l = y(() => z(c).children), u = y(() => se(z(c), ["children"])), d = y(() => ({
		...z(u),
		id: n,
		onOpenChange(e) {
			z(u).onOpenChange?.(e), r() !== void 0 && r(e.open);
		}
	})), f = RO(() => z(d)), p = y(() => ({
		...z(s),
		present: f().open
	})), m = ao(() => z(p));
	pO(f), so(m);
	var h = {
		get open() {
			return r();
		},
		set open(e) {
			r(e), A();
		}
	}, _ = P(), v = G(_);
	return Se(v, () => z(l) ?? S), F(e, _), x(h);
}
H(BO, { open: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/tooltip-trigger.svelte
var VO = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function HO(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, VO), i = y(() => Bt()(r, ["value"])), a = y(() => w(z(i), 2)), o = y(() => z(a)[0]), s = y(() => z(a)[1]), c = mO(), l = y(() => X(c().getTriggerProps(z(o)), z(s)));
	return Q(e, J({ as: "button" }, () => z(l), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(HO, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Tooltip.svelte
var UO = I("<span><!></span>"), WO = I("<!> <!>", 1), GO = {
	hash: "svelte-1cq81kb",
	code: ":host {display:inline-block;}[part='anchor'].svelte-1cq81kb {display:block;}[data-scope='tooltip'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='tooltip'][data-part='arrow'] {--arrow-size: 10px;--arrow-background: var(--k-fg);--arrow-offset: calc(var(--arrow-size-half) * -1 - 2px) !important;}[data-scope='tooltip'][data-part='arrow-tip'] {border-radius:2px;}[data-scope='tooltip'][data-part='content'] {width:fit-content;max-width:280px;padding:6px 12px;border:0 solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:var(--k-fg);color:var(--k-bg);box-shadow:none;font-size:12px;line-height:16px;text-wrap:balance;overflow-wrap:anywhere;}"
};
function KO(e, t) {
	k(t, !0), ee(e, GO);
	let r = L(t, "text", 7, ""), i = t.$$host, o = B(!1), s = B(null), c = !1;
	Oe(() => a(z(s), z(o), i));
	let l = (e) => (t) => _e(t, "keydown", (t) => {
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
			r(e), A();
		}
	}, p = P(), m = G(p), h = (e) => {
		var a = WO(), f = G(a);
		n(f, {});
		var p = U(f, 2);
		Ft(p, {
			value: () => i.shadowRoot,
			children: (e, n) => {
				var i = P(), a = G(i);
				E(a, () => BO, (e, n) => {
					n(e, {
						openDelay: 300,
						closeDelay: 0,
						closeOnEscape: !1,
						positioning: {
							strategy: "fixed",
							gutter: 5
						},
						get open() {
							return z(o);
						},
						set open(e) {
							q(o, e, !0);
						},
						children: (e, n) => {
							var i = WO(), a = G(i);
							{
								let e = (e, n = S) => {
									var r = P(), i = G(r);
									{
										let e = (e, r = S) => {
											var i = UO();
											v(i, (e) => ({
												part: "anchor",
												...e
											}), [() => r()()], void 0, void 0, "svelte-1cq81kb");
											var a = V(i);
											le(a, t, "default", {}, null), O(i), oe(i, () => l(n())), F(e, i);
										};
										E(i, () => HO, (t, r) => {
											r(t, {
												onfocusin: () => u(n()),
												onfocusout: (e) => d(n(), e, e.currentTarget),
												onpointerdown: () => c = !0,
												onpointerleave: () => c = !1,
												asChild: e,
												$$slots: { asChild: !0 }
											});
										});
									}
									F(e, r);
								};
								E(a, () => xO, (t, n) => {
									n(t, {
										render: e,
										$$slots: { render: !0 }
									});
								});
							}
							var o = U(a, 2);
							E(o, () => CO, (e, t) => {
								t(e, {
									popover: "manual",
									class: "af-kit",
									get ref() {
										return z(s);
									},
									set ref(e) {
										q(s, e, !0);
									},
									children: (e, t) => {
										var n = WO(), i = G(n);
										E(i, () => gO, (e, t) => {
											t(e, {
												part: "arrow",
												children: (e, t) => {
													var n = P(), r = G(n);
													E(r, () => vO, (e, t) => {
														t(e, {});
													}), F(e, n);
												},
												$$slots: { default: !0 }
											});
										});
										var a = U(i, 2);
										E(a, () => bO, (e, t) => {
											t(e, {
												class: "af-overlay tooltip",
												children: (e, t) => {
													ie();
													var n = he();
													W(() => T(n, r())), F(e, n);
												},
												$$slots: { default: !0 }
											});
										}), F(e, n);
									},
									$$slots: { default: !0 }
								});
							}), F(e, i);
						},
						$$slots: { default: !0 }
					});
				}), F(e, i);
			},
			$$slots: { default: !0 }
		}), F(e, a);
	}, g = (e) => {
		var n = P(), r = G(n);
		le(r, t, "default", {}, null), F(e, n);
	};
	return M(m, (e) => {
		r() ? e(h) : e(g, -1);
	}), F(e, p), x(f);
}
H(KO, {
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
var [qO, JO] = an({ name: "CollapsibleContext" }), YO = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function XO(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, YO), i = JO(), a = y(() => X(i().getContentProps(), r));
	var o = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	}, s = P(), c = G(s), l = (e) => {
		Q(e, J({ as: "div" }, () => z(a), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, u = y(() => !i().isUnmounted);
	return M(c, (e) => {
		z(u) && e(l);
	}), F(e, s), x(o);
}
H(XO, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/collapsible/split-collapsible-props.svelte.js
var ZO = Bt(), QO = (e) => ZO(e, [
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
]), $O = Cn("collapsible").parts("root", "trigger", "content", "indicator").build(), ek = (e) => e.ids?.root ?? `collapsible:${e.id}`, tk = (e) => e.ids?.content ?? `collapsible:${e.id}:content`, nk = (e) => e.ids?.trigger ?? `collapsible:${e.id}:trigger`, rk = (e) => e.getById(tk(e));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+collapsible@1.43.3/node_modules/@zag-js/collapsible/dist/collapsible.connect.mjs
function ik(e, t) {
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
				...$O.root.attrs,
				"data-state": c ? "open" : "closed",
				dir: o("dir"),
				id: ek(a)
			});
		},
		getContentProps() {
			return t.element({
				...$O.content.attrs,
				id: tk(a),
				"data-collapsible": "",
				"data-state": v ? void 0 : c ? "open" : "closed",
				"data-disabled": Z(f),
				"data-has-collapsed-size": Z(_),
				hidden: !s && !_,
				dir: o("dir"),
				style: {
					"--height": Ke(d),
					"--width": Ke(u),
					"--collapsed-height": Ke(p),
					"--collapsed-width": Ke(m),
					...l && h && {
						overflow: "hidden",
						minHeight: Ke(p),
						maxHeight: Ke(p)
					},
					...l && g && {
						overflow: "hidden",
						minWidth: Ke(m),
						maxWidth: Ke(m)
					}
				}
			});
		},
		getTriggerProps() {
			return t.element({
				...$O.trigger.attrs,
				id: nk(a),
				dir: o("dir"),
				type: "button",
				"data-state": c ? "open" : "closed",
				"data-disabled": Z(f),
				"aria-controls": tk(a),
				"aria-expanded": s || !1,
				onClick(e) {
					e.defaultPrevented || f || r({ type: c ? "close" : "open" });
				}
			});
		},
		getIndicatorProps() {
			return t.element({
				...$O.indicator.attrs,
				dir: o("dir"),
				"data-state": c ? "open" : "closed",
				"data-disabled": Z(f)
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+collapsible@1.43.3/node_modules/@zag-js/collapsible/dist/collapsible.machine.mjs
var ak = zt({
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
				let n, r = Y(() => {
					let r = rk(t);
					if (!r) return;
					let i = jt(r).animationName;
					if (!i || i === "none") {
						e({ type: "animation.end" });
						return;
					}
					let a = (t) => {
						Ge(t) === r && e({ type: "animation.end" });
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
				let n, r = Y(() => {
					let r = rk(t);
					if (!r) return;
					let i = jt(r).animationName;
					if (!i || i === "none") {
						e({ type: "animation.end" });
						return;
					}
					let a = (t) => {
						Ge(t) === r && e({ type: "animation.end" });
					};
					r.addEventListener("animationend", a);
					let o = Yt(r, { animationFillMode: "forwards" });
					n = () => {
						r.removeEventListener("animationend", a), lt(() => o());
					};
				});
				return () => {
					r(), n?.();
				};
			},
			trackTabbableElements: ({ scope: e, prop: t }) => {
				if (!t("collapsedHeight") && !t("collapsedWidth")) return;
				let n = rk(e);
				if (!n) return;
				let r = () => {
					let e = pa(n).map((e) => cn(e, "inert", ""));
					return () => {
						e.forEach((e) => e());
					};
				}, i = r(), a = Sa(n, { callback() {
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
				let n = rk(t);
				if (!n) return;
				let { height: r, width: i } = n.getBoundingClientRect();
				e.set("size", {
					height: r,
					width: i
				});
			},
			computeSize: ({ refs: e, scope: t, context: n }) => {
				e.get("cleanup")?.();
				let r = Y(() => {
					let e = rk(t);
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
}), ok = (e) => {
	let t = pn(), n = Zt(), r = B(!1), i = y(() => {
		let { lazyMount: r, unmountOnExit: i, onExitComplete: a, ...o } = Xe(e) || {};
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...o
		};
	}), a = Ut(ak, () => z(i)), o = y(() => ik(a, gn)), s = y(() => Xe(e));
	Oe(() => {
		z(o).visible && q(r, !0);
	});
	let c = y(() => {
		let { lazyMount: e, unmountOnExit: t } = z(s) || {};
		return !z(o).visible && !z(r) && e || t && !z(o).visible && z(r);
	});
	return () => ({
		...z(o),
		isUnmounted: !!z(c)
	});
}, sk = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"open"
]);
function ck(e, t) {
	let n = g();
	k(t, !0);
	let r = L(t, "ref", 15, null), i = L(t, "open", 15), a = K(t, sk), o = y(() => QO(a)), s = y(() => w(z(o), 2)), c = y(() => z(s)[0]), l = y(() => z(s)[1]), u = y(() => ({
		...z(c),
		id: z(c).id ?? n,
		open: i(),
		onOpenChange(e) {
			z(c).onOpenChange?.(e), i() !== void 0 && i(e.open);
		}
	})), d = ok(() => z(u)), f = y(() => X(d().getRootProps(), z(l)));
	return qO(d), Q(e, J({ as: "div" }, () => z(f), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), x({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), A();
		},
		get open() {
			return i();
		},
		set open(e) {
			i(e), A();
		}
	});
}
H(ck, {
	ref: {},
	open: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/use-tree-view-context.js
var [lk, uk] = an({
	name: "TreeViewContext",
	hookName: "useTreeViewContext",
	providerName: "<TreeViewProvider />"
}), [dk, fk] = an({
	name: "TreeViewNodeContext",
	hookName: "useTreeViewNodeContext",
	providerName: "<TreeViewNodeProvider />"
}), [pk, mk] = an({
	name: "TreeViewNodePropsContext",
	hookName: "useTreeViewNodePropsContext",
	providerName: "<TreeViewNodePropsProvider />"
}), hk = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function gk(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, hk), i = uk(), a = mk(), o = fk(), s = $a(), c = y(() => X(i().getBranchProps(a()), r)), l = y(() => i().getBranchContentProps(a()));
	var u = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	}, d = P(), f = G(d);
	{
		let e = y(() => o().expanded), t = y(() => ({ content: z(l).id })), r = y(s);
		E(f, () => ck, (i, a) => {
			a(i, J({
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
	return F(e, d), x(u);
}
H(gk, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/tree-view-branch-content.svelte
var _k = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function vk(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, _k), i = uk(), a = mk(), o = y(() => i().getBranchContentProps(a())), s = y(Bt), c = y(() => z(s)(z(o), ["hidden", "data-state"])), l = y(() => w(z(c), 2)), u = y(() => z(l)[1]), d = y(() => X(z(u), r));
	var f = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	}, p = P(), m = G(p);
	return E(m, () => XO, (e, t) => {
		t(e, J(() => z(d), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}), F(e, p), x(f);
}
H(vk, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/tree-view-branch-control.svelte
var yk = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function bk(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, yk), i = uk(), a = mk(), o = y(() => X(i().getBranchControlProps(a()), r));
	return Q(e, J({ as: "div" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(bk, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/tree-view-branch-trigger.svelte
var xk = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Sk(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, xk), i = uk(), a = mk(), o = y(() => X(i().getBranchTriggerProps(a()), r));
	return Q(e, J({ as: "button" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(Sk, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/tree-view-item.svelte
var Ck = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function wk(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, Ck), i = uk(), a = mk(), o = y(() => X(i().getItemProps(a()), r));
	return Q(e, J({ as: "li" }, () => z(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(wk, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/tree-view-node-provider.svelte
function Tk(e, t) {
	k(t, !0);
	let n = L(t, "node", 7), r = L(t, "indexPath", 7), i = L(t, "children", 7), a = uk(), o = y(() => ({
		node: n(),
		indexPath: r()
	})), s = y(() => a().getNodeState(z(o)));
	dk(() => z(s)), pk(() => z(o));
	var c = {
		get node() {
			return n();
		},
		set node(e) {
			n(e), A();
		},
		get indexPath() {
			return r();
		},
		set indexPath(e) {
			r(e), A();
		},
		get children() {
			return i();
		},
		set children(e) {
			i(e), A();
		}
	}, l = P(), u = G(l);
	return Se(u, () => i() ?? S), F(e, l), x(c);
}
H(Tk, {
	node: {},
	indexPath: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/tree-view-split-props.js
var Ek = Bt();
function Dk(e) {
	return Ek(e, /* @__PURE__ */ "canRename.checkedValue.collection.defaultCheckedValue.defaultExpandedValue.defaultFocusedValue.defaultSelectedValue.expandedValue.expandOnClick.focusedValue.id.ids.loadChildren.onBeforeRename.onCheckedChange.onExpandedChange.onFocusChange.onLoadChildrenComplete.onLoadChildrenError.onRenameComplete.onRenameStart.onSelectionChange.selectedValue.selectionMode.translations.typeahead.scrollToIndexFn".split("."));
}
var Ok = Cn("tree-view").parts("branch", "branchContent", "branchControl", "branchIndentGuide", "branchIndicator", "branchText", "branchTrigger", "item", "itemIndicator", "itemText", "label", "nodeCheckbox", "nodeRenameInput", "root", "tree").build(), kk = (e) => new Oi(e);
kk.empty = () => new Oi({ rootNode: { children: [] } });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tree-view@1.43.3/node_modules/@zag-js/tree-view/dist/tree-view.dom.mjs
var Ak = (e) => e.ids?.root ?? `tree:${e.id}:root`, jk = (e) => e.ids?.label ?? `tree:${e.id}:label`, Mk = (e, t) => e.ids?.node?.(t) ?? `tree:${e.id}:node:${t}`, Nk = (e) => e.ids?.tree ?? `tree:${e.id}:tree`, Pk = (e, t) => {
	t != null && e.getById(Mk(e, t))?.focus();
}, Fk = (e, t) => `tree:${e.id}:rename-input:${t}`, Ik = (e, t) => e.getById(Fk(e, t));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tree-view@1.43.3/node_modules/@zag-js/tree-view/dist/utils/checked-state.mjs
function Lk(e, t, n) {
	let r = e.getNodeValue(t);
	if (!e.isBranchNode(t)) return n.includes(r);
	let i = e.getDescendantValues(r), a = i.every((e) => n.includes(e)), o = i.some((e) => n.includes(e));
	return a ? !0 : o ? "indeterminate" : !1;
}
function Rk(e, t, n) {
	let r = e.getDescendantValues(t), i = r.every((e) => n.includes(e));
	return on(i ? wn(n, ...r) : Mt(n, ...r));
}
function zk(e, t) {
	let n = /* @__PURE__ */ new Map();
	return e.visit({ onEnter: (r) => {
		let i = e.getNodeValue(r), a = e.isBranchNode(r), o = Lk(e, r, t);
		n.set(i, {
			type: a ? "branch" : "leaf",
			checked: o
		});
	} }), n;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tree-view@1.43.3/node_modules/@zag-js/tree-view/dist/tree-view.connect.mjs
var Bk = {
	treeLabel: "Tree View",
	renameInputLabel: "Rename tree item"
};
function Vk(e, t) {
	let { context: n, scope: r, computed: i, prop: a, send: o } = e, s = a("collection"), c = He(Bk, a("translations")), l = Array.from(n.get("expandedValue")), u = Array.from(n.get("selectedValue")), d = Array.from(n.get("checkedValue")), f = i("isTypingAhead"), p = n.get("focusedValue"), m = n.get("loadingStatus"), h = n.get("renamingValue"), g = s.getFirstNode(void 0, { skip: ({ indexPath: e }) => s.getValuePath(e).slice(0, -1).some((e) => !l.includes(e)) }), _ = g ? s.getNodeValue(g) : null;
	function v(e) {
		let { node: t, indexPath: n } = e, i = s.getNodeValue(t);
		return {
			id: Mk(r, i),
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
				return Lk(s, t, d);
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
			return zk(s, d);
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
			Pk(r, e);
		},
		selectParent(e) {
			let t = s.getParentNode(e);
			if (!t) return;
			let n = Mt(u, s.getNodeValue(t));
			o({
				type: "SELECTED.SET",
				value: n,
				src: "select.parent"
			});
		},
		expandParent(e) {
			let t = s.getParentNode(e);
			if (!t) return;
			let n = Mt(l, s.getNodeValue(t));
			o({
				type: "EXPANDED.SET",
				value: n,
				src: "expand.parent"
			});
		},
		setExpandedValue(e) {
			let t = on(e);
			o({
				type: "EXPANDED.SET",
				value: t
			});
		},
		setSelectedValue(e) {
			let t = on(e);
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
				...Ok.root.attrs,
				id: Ak(r),
				dir: a("dir")
			});
		},
		getLabelProps() {
			return t.element({
				...Ok.label.attrs,
				id: jk(r),
				dir: a("dir")
			});
		},
		getTreeProps() {
			return t.element({
				...Ok.tree.attrs,
				id: Nk(r),
				dir: a("dir"),
				role: "tree",
				"aria-label": c.treeLabel,
				"aria-labelledby": jk(r),
				"aria-multiselectable": a("selectionMode") === "multiple" || void 0,
				tabIndex: -1,
				onKeyDown(e) {
					if (e.defaultPrevented || rt(e)) return;
					let t = Ge(e);
					if (Tn(t)) return;
					let n = t?.closest("[data-part=branch-control], [data-part=item]");
					if (!n) return;
					let r = n.dataset.value;
					if (r == null) {
						console.warn("[zag-js/tree-view] Node id not found for node", n);
						return;
					}
					let i = n.matches("[data-part=branch-control]"), c = {
						ArrowDown(e) {
							Ct(e) || (e.preventDefault(), o({
								type: "NODE.ARROW_DOWN",
								id: r,
								shiftKey: e.shiftKey
							}));
						},
						ArrowUp(e) {
							Ct(e) || (e.preventDefault(), o({
								type: "NODE.ARROW_UP",
								id: r,
								shiftKey: e.shiftKey
							}));
						},
						ArrowLeft(e) {
							Ct(e) || n.dataset.disabled || (e.preventDefault(), o({
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
							Ct(e) || (e.preventDefault(), o({
								type: "NODE.HOME",
								id: r,
								shiftKey: e.shiftKey
							}));
						},
						End(e) {
							Ct(e) || (e.preventDefault(), o({
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
							n.dataset.disabled || Lt(t) && Ct(e) || (o({
								type: i ? "BRANCH_NODE.CLICK" : "NODE.CLICK",
								id: r,
								src: "keyboard"
							}), Lt(t) || e.preventDefault());
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
					}, l = c[at(e, { dir: a("dir") })];
					if (l) {
						l(e);
						return;
					}
					Wa.isValidEvent(e) && (o({
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
				...Ok.item.attrs,
				id: n.id,
				dir: a("dir"),
				"data-ownedby": Nk(r),
				"data-path": e.indexPath.join("/"),
				"data-value": n.value,
				tabIndex: n.focused ? 0 : -1,
				"data-focus": Z(n.focused),
				role: "treeitem",
				"aria-current": n.selected ? "true" : void 0,
				"aria-selected": n.disabled ? void 0 : n.selected,
				"data-selected": Z(n.selected),
				"aria-disabled": ln(n.disabled),
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
					if (n.disabled || !Le(e) || Lt(e.currentTarget) && Ct(e)) return;
					let t = e.metaKey || e.ctrlKey;
					o({
						type: "NODE.CLICK",
						id: n.value,
						shiftKey: e.shiftKey,
						ctrlKey: t
					}), e.stopPropagation(), Lt(e.currentTarget) || e.preventDefault();
				}
			});
		},
		getItemTextProps(e) {
			let n = v(e);
			return t.element({
				...Ok.itemText.attrs,
				"data-disabled": Z(n.disabled),
				"data-selected": Z(n.selected),
				"data-focus": Z(n.focused)
			});
		},
		getItemIndicatorProps(e) {
			let n = v(e);
			return t.element({
				...Ok.itemIndicator.attrs,
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
				...Ok.branch.attrs,
				"data-depth": n.depth,
				dir: a("dir"),
				"data-branch": n.value,
				role: "treeitem",
				"data-ownedby": Nk(r),
				"data-value": n.value,
				"aria-level": n.depth,
				"aria-selected": n.disabled ? void 0 : n.selected,
				"data-path": e.indexPath.join("/"),
				"data-selected": Z(n.selected),
				"aria-expanded": n.expanded,
				"data-state": n.expanded ? "open" : "closed",
				"aria-disabled": ln(n.disabled),
				"data-disabled": Z(n.disabled),
				"data-loading": Z(n.loading),
				"aria-busy": ln(n.loading),
				style: { "--depth": n.depth }
			});
		},
		getBranchIndicatorProps(e) {
			let n = v(e);
			return t.element({
				...Ok.branchIndicator.attrs,
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
				...Ok.branchTrigger.attrs,
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
				...Ok.branchControl.attrs,
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
				"aria-busy": ln(n.loading),
				onFocus(e) {
					o({
						type: "NODE.FOCUS",
						id: n.value
					}), e.stopPropagation();
				},
				onClick(e) {
					if (n.disabled || n.loading || !Le(e) || Lt(e.currentTarget) && Ct(e)) return;
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
				...Ok.branchText.attrs,
				dir: a("dir"),
				"data-disabled": Z(n.disabled),
				"data-state": n.expanded ? "open" : "closed",
				"data-loading": Z(n.loading)
			});
		},
		getBranchContentProps(e) {
			let n = v(e);
			return t.element({
				...Ok.branchContent.attrs,
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
				...Ok.branchIndentGuide.attrs,
				"data-depth": n.depth
			});
		},
		getNodeCheckboxProps(e) {
			let n = v(e), r = n.checked;
			return t.element({
				...Ok.nodeCheckbox.attrs,
				tabIndex: -1,
				role: "checkbox",
				"data-state": r === !0 ? "checked" : r === !1 ? "unchecked" : "indeterminate",
				"aria-checked": r === !0 ? "true" : r === !1 ? "false" : "mixed",
				"data-disabled": Z(n.disabled),
				onClick(e) {
					e.defaultPrevented || n.disabled || Le(e) && (o({
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
				...Ok.nodeRenameInput.attrs,
				id: Fk(r, n.value),
				type: "text",
				"aria-label": c.renameInputLabel,
				hidden: !n.renaming,
				onKeyDown(e) {
					rt(e) || (e.key === "Escape" && (o({ type: "RENAME.CANCEL" }), e.preventDefault()), e.key === "Enter" && (o({
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
function Hk(e, t) {
	let { context: n, prop: r, refs: i } = e;
	if (!r("loadChildren")) {
		n.set("expandedValue", (e) => on(Mt(e, ...t)));
		return;
	}
	let a = n.get("loadingStatus"), [o, s] = It(t, (e) => a[e] === "loaded");
	if (o.length > 0 && n.set("expandedValue", (e) => on(Mt(e, ...o))), s.length === 0) return;
	let c = r("collection"), [l, u] = It(s, (e) => {
		let t = c.findNode(e);
		return c.getNodeChildren(t).length > 0;
	});
	if (l.length > 0 && n.set("expandedValue", (e) => on(Mt(e, ...l))), u.length === 0) return;
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
	Be(p, () => "[zag-js/tree-view] `loadChildren` is required for async expansion");
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
		}), n.set("loadingStatus", a), t.length && (n.set("expandedValue", (e) => on(Mt(e, ...t))), r("onLoadChildrenComplete")?.({ collection: o })), i.length && r("onLoadChildrenError")?.({ nodes: i });
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tree-view@1.43.3/node_modules/@zag-js/tree-view/dist/utils/visit-skip.mjs
function Uk(e) {
	let { prop: t, context: n } = e;
	return function({ indexPath: e }) {
		return t("collection").getValuePath(e).slice(0, -1).some((e) => !n.get("expandedValue").includes(e));
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tree-view@1.43.3/node_modules/@zag-js/tree-view/dist/tree-view.machine.mjs
var { and: Wk } = Ln(), Gk = zt({
	props({ props: e }) {
		return {
			selectionMode: "single",
			collection: kk.empty(),
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
			typeaheadState: { ...Wa.defaultOptions },
			pendingAborts: /* @__PURE__ */ new Map()
		};
	},
	computed: {
		isMultipleSelection: ({ prop: e }) => e("selectionMode") === "multiple",
		isTypingAhead: ({ refs: e }) => e.get("typeaheadState").keysSoFar.length > 0,
		visibleNodes: ({ prop: e, context: t }) => {
			let n = [];
			return e("collection").visit({
				skip: Uk({
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
			guard: Wk("isMultipleSelection", "moveFocus"),
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
			guard: Wk("isShiftKey", "isMultipleSelection"),
			actions: ["focusTreeNextNode", "extendSelectionToNextNode"]
		}, { actions: ["focusTreeNextNode"] }],
		"NODE.ARROW_UP": [{
			guard: Wk("isShiftKey", "isMultipleSelection"),
			actions: ["focusTreePrevNode", "extendSelectionToPrevNode"]
		}, { actions: ["focusTreePrevNode"] }],
		"NODE.ARROW_LEFT": { actions: ["focusBranchNode"] },
		"BRANCH_NODE.ARROW_LEFT": [{
			guard: "isBranchExpanded",
			actions: ["collapseBranch"]
		}, { actions: ["focusBranchNode"] }],
		"BRANCH_NODE.ARROW_RIGHT": [{
			guard: Wk("isBranchFocused", "isBranchExpanded"),
			actions: ["focusBranchFirstNode"]
		}, { actions: ["expandBranch"] }],
		"SIBLINGS.EXPAND": { actions: ["expandSiblingBranches"] },
		"NODE.HOME": [{
			guard: Wk("isShiftKey", "isMultipleSelection"),
			actions: ["extendSelectionToFirstNode", "focusTreeFirstNode"]
		}, { actions: ["focusTreeFirstNode"] }],
		"NODE.END": [{
			guard: Wk("isShiftKey", "isMultipleSelection"),
			actions: ["extendSelectionToLastNode", "focusTreeLastNode"]
		}, { actions: ["focusTreeLastNode"] }],
		"NODE.CLICK": [
			{
				guard: Wk("isCtrlKey", "isMultipleSelection"),
				actions: ["toggleNodeSelection"]
			},
			{
				guard: Wk("isShiftKey", "isMultipleSelection"),
				actions: ["extendSelectionToNode"]
			},
			{ actions: ["selectNode"] }
		],
		"BRANCH_NODE.CLICK": [
			{
				guard: Wk("isCtrlKey", "isMultipleSelection"),
				actions: ["toggleNodeSelection"]
			},
			{
				guard: Wk("isShiftKey", "isMultipleSelection"),
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
				e.set("selectedValue", (e) => n == null ? e : !t.isTrusted && Je(n) ? e.concat(...n) : [Je(n) ? xn(n) : n].filter(Boolean));
			},
			deselectNode({ context: e, event: t }) {
				let n = Vt(t.id || t.value);
				e.set("selectedValue", (e) => wn(e, ...n));
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
				Hk(e, [t.id]);
			},
			expandBranches(e) {
				let { context: t, event: n } = e, r = Vt(n.value);
				Hk(e, Gt(r, t.get("expandedValue")));
			},
			collapseBranch({ context: e, event: t }) {
				e.set("expandedValue", (e) => wn(e, t.id));
			},
			collapseBranches(e) {
				let { context: t, event: n } = e, r = Vt(n.value);
				t.set("expandedValue", (e) => wn(e, ...r));
			},
			setExpanded({ context: e, event: t }) {
				Je(t.value) && e.set("expandedValue", t.value);
			},
			clearExpanded({ context: e }) {
				e.set("expandedValue", []);
			},
			setSelected({ context: e, event: t }) {
				Je(t.value) && e.set("selectedValue", t.value);
			},
			clearSelected({ context: e }) {
				e.set("selectedValue", []);
			},
			focusTreeFirstNode(e) {
				let { prop: t, scope: n } = e, r = t("collection"), i = r.getFirstNode(void 0, { skip: Uk(e) });
				if (!i) return;
				let a = r.getNodeValue(i);
				Kk(e, a) ? Y(() => Pk(n, a)) : Pk(n, a);
			},
			focusTreeLastNode(e) {
				let { prop: t, scope: n } = e, r = t("collection"), i = r.getLastNode(void 0, { skip: Uk(e) }), a = r.getNodeValue(i);
				Kk(e, a) ? Y(() => Pk(n, a)) : Pk(n, a);
			},
			focusBranchFirstNode(e) {
				let { event: t, prop: n, scope: r } = e, i = n("collection"), a = i.findNode(t.id), o = i.getFirstNode(a, { skip: Uk(e) });
				if (!o) return;
				let s = i.getNodeValue(o);
				Kk(e, s) ? Y(() => Pk(r, s)) : Pk(r, s);
			},
			focusTreeNextNode(e) {
				let { event: t, prop: n, scope: r } = e, i = n("collection"), a = i.getNextNode(t.id, { skip: Uk(e) });
				if (!a) return;
				let o = i.getNodeValue(a);
				Kk(e, o) ? Y(() => Pk(r, o)) : Pk(r, o);
			},
			focusTreePrevNode(e) {
				let { event: t, prop: n, scope: r } = e, i = n("collection"), a = i.getPreviousNode(t.id, { skip: Uk(e) });
				if (!a) return;
				let o = i.getNodeValue(a);
				Kk(e, o) ? Y(() => Pk(r, o)) : Pk(r, o);
			},
			focusBranchNode(e) {
				let { event: t, prop: n, scope: r } = e, i = n("collection"), a = i.getParentNode(t.id), o = a ? i.getNodeValue(a) : void 0;
				o && (Kk(e, o) ? Y(() => Pk(r, o)) : Pk(r, o));
			},
			selectAllNodes({ context: e, prop: t }) {
				e.set("selectedValue", t("collection").getValues());
			},
			focusMatchedNode(e) {
				let { context: t, prop: n, refs: r, event: i, scope: a, computed: o } = e, s = Wa(o("visibleNodes").map(({ node: e }) => ({
					textContent: n("collection").stringifyNode(e),
					id: n("collection").getNodeValue(e)
				})), {
					state: r.get("typeaheadState"),
					activeId: t.get("focusedValue"),
					key: i.key
				});
				s?.id && (Kk(e, s.id) ? Y(() => Pk(a, s.id)) : Pk(a, s.id));
			},
			toggleNodeSelection({ context: e, event: t }) {
				let n = mt(e.get("selectedValue"), t.id);
				e.set("selectedValue", n);
			},
			expandAllBranches(e) {
				let { context: t, prop: n } = e, r = n("collection").getBranchValues();
				Hk(e, Gt(r, t.get("expandedValue")));
			},
			expandSiblingBranches(e) {
				let { context: t, event: n, prop: r } = e, i = r("collection"), a = i.getIndexPath(n.id);
				if (!a) return;
				let o = i.getSiblingNodes(a).map((e) => i.getNodeValue(e));
				Hk(e, Gt(o, t.get("expandedValue")));
			},
			extendSelectionToNode(e) {
				let { context: t, event: n, prop: r, computed: i } = e, a = r("collection"), o = Dn(t.get("selectedValue")) || a.getNodeValue(a.getFirstNode()), s = n.id, c = [o, s], l = 0;
				i("visibleNodes").forEach(({ node: e }) => {
					let t = a.getNodeValue(e);
					l === 1 && c.push(t), (t === o || t === s) && l++;
				}), t.set("selectedValue", on(c));
			},
			extendSelectionToNextNode(e) {
				let { context: t, event: n, prop: r } = e, i = r("collection"), a = i.getNextNode(n.id, { skip: Uk(e) });
				if (!a) return;
				let o = new Set(t.get("selectedValue")), s = i.getNodeValue(a);
				s != null && (o.has(n.id) && o.has(s) ? o.delete(n.id) : o.has(s) || o.add(s), t.set("selectedValue", Array.from(o)));
			},
			extendSelectionToPrevNode(e) {
				let { context: t, event: n, prop: r } = e, i = r("collection"), a = i.getPreviousNode(n.id, { skip: Uk(e) });
				if (!a) return;
				let o = new Set(t.get("selectedValue")), s = i.getNodeValue(a);
				s != null && (o.has(n.id) && o.has(s) ? o.delete(n.id) : o.has(s) || o.add(s), t.set("selectedValue", Array.from(o)));
			},
			extendSelectionToFirstNode(e) {
				let { context: t, prop: n } = e, r = n("collection"), i = Dn(t.get("selectedValue")), a = [];
				r.visit({
					skip: Uk(e),
					onEnter: (e) => {
						let t = r.getNodeValue(e);
						if (a.push(t), t === i) return "stop";
					}
				}), t.set("selectedValue", a);
			},
			extendSelectionToLastNode(e) {
				let { context: t, prop: n } = e, r = n("collection"), i = Dn(t.get("selectedValue")), a = [], o = !1;
				r.visit({
					skip: Uk(e),
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
				e.set("checkedValue", (e) => t.isBranch ? Rk(r, t.value, e) : mt(e, t.value));
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
					e.set("renamingValue", null), Pk(r, i);
					return;
				}
				n("onRenameComplete")?.({
					value: i,
					label: o,
					indexPath: a
				}), e.set("renamingValue", null), Pk(r, i);
			},
			cancelRenaming({ context: e, scope: t }) {
				let n = e.get("renamingValue");
				e.set("renamingValue", null), n && Pk(t, n);
			},
			syncRenameInput({ context: e, scope: t, prop: n }) {
				let r = e.get("renamingValue");
				if (!r) return;
				let i = n("collection"), a = i.findNode(r);
				if (!a) return;
				let o = i.stringifyNode(a);
				qi(Ik(t, r), o);
			},
			focusRenameInput({ context: e, scope: t }) {
				let n = e.get("renamingValue");
				if (!n) return;
				let r = Ik(t, n);
				r && (r.focus(), r.select());
			}
		}
	}
});
function Kk(e, t) {
	let { prop: n, scope: r, computed: i } = e, a = n("scrollToIndexFn");
	if (!a) return !1;
	let o = n("collection"), s = i("visibleNodes");
	for (let e = 0; e < s.length; e++) {
		let { node: n, indexPath: i } = s[e];
		if (o.getNodeValue(n) === t) return a({
			index: e,
			node: n,
			indexPath: i,
			getElement: () => r.getById(Mk(r, t))
		}), !0;
	}
	return !1;
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/use-tree-view.svelte.js
var qk = (e) => {
	let t = pn(), n = Zt(), r = y(() => {
		let r = Xe(e);
		return Nn(r, ["id"]), {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = Ut(Gk, () => z(r)), a = y(() => Vk(i, gn));
	return () => z(a);
}, Jk = /* @__PURE__ */ new Set([
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
function Yk(e, t) {
	let n = g();
	k(t, !0);
	let r = L(t, "ref", 15, null), i = L(t, "expandedValue", 15), a = L(t, "selectedValue", 15), o = L(t, "focusedValue", 15), s = L(t, "checkedValue", 15), c = K(t, Jk), l = y(() => to(c)), u = y(() => w(z(l), 2)), d = y(() => z(u)[0]), f = y(() => z(u)[1]), p = y(() => Dk(z(f))), m = y(() => w(z(p), 2)), h = y(() => z(m)[0]), _ = y(() => z(m)[1]), v = y(() => ({
		...z(h),
		id: z(h).id ?? n,
		selectedValue: a(),
		expandedValue: i(),
		focusedValue: o(),
		checkedValue: s(),
		onExpandedChange: (e) => {
			z(h).onExpandedChange?.(e), i(e.expandedValue);
		},
		onFocusChange: (e) => {
			z(h).onFocusChange?.(e), o(e.focusedValue);
		},
		onSelectionChange: (e) => {
			z(h).onSelectionChange?.(e), a(e.selectedValue);
		},
		onCheckedChange: (e) => {
			z(h).onCheckedChange?.(e), s(e.checkedValue);
		}
	})), b = qk(() => z(v)), ee = y(() => X(b().getRootProps(), z(_)));
	return lk(b), Qa(() => z(d)), Q(e, J({ as: "div" }, () => z(ee), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), x({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), A();
		},
		get expandedValue() {
			return i();
		},
		set expandedValue(e) {
			i(e), A();
		},
		get selectedValue() {
			return a();
		},
		set selectedValue(e) {
			a(e), A();
		},
		get focusedValue() {
			return o();
		},
		set focusedValue(e) {
			o(e), A();
		},
		get checkedValue() {
			return s();
		},
		set checkedValue(e) {
			s(e), A();
		}
	});
}
H(Yk, {
	ref: {},
	expandedValue: {},
	selectedValue: {},
	focusedValue: {},
	checkedValue: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/tree-view-tree.svelte
var Xk = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Zk(e, t) {
	k(t, !0);
	let n = L(t, "ref", 15, null), r = K(t, Xk), i = uk(), a = y(() => X(i().getTreeProps(), r));
	return Q(e, J({ as: "div" }, () => z(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), x({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), A();
		}
	});
}
H(Zk, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/picker/forest.ts
function Qk(e) {
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
	for (let e of t.keys()) {
		if (i.has(e)) continue;
		let n = /* @__PURE__ */ new Set(), o = e;
		for (; !n.has(o);) n.add(o), o = t.get(o).parentId;
		r.add(o), a(o);
	}
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
function $k(e, t) {
	let n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), i = (e) => {
		let a = !1;
		for (let t of e.children) i(t) && (a = !0);
		a && r.add(e.node.id);
		let o = a || mr(e.node.label, t) || mr(e.node.code, t);
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
function eA(e, t) {
	return e.filter((e) => t.has(e.node.id)).map((e) => ({
		...e,
		children: eA(e.children, t)
	}));
}
var tA = ce("<svg viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m9 18 6-6-6-6\"></path></svg>"), nA = I("<span class=\"spacer svelte-wzhqq0\" aria-hidden=\"true\"></span>"), rA = ce("<svg viewBox=\"0 0 24 24\" width=\"10\" height=\"10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 6 9 17l-5-5\"></path></svg>"), iA = I("<span part=\"check\" aria-hidden=\"true\"><!></span>"), aA = I("<span part=\"ancestry\"> </span>"), oA = I("<code part=\"code\"> </code>"), sA = I("<span part=\"archived\"> </span>"), cA = I("<!> <!> <span class=\"label svelte-wzhqq0\"> </span> <!> <!> <!>", 1), lA = I("<af-tooltip><!></af-tooltip>", 2), uA = I("<!> <!>", 1), dA = I("<span id=\"af-described\" hidden=\"\"> </span>"), fA = I("<span class=\"af-chip secondary\" part=\"chip\"><span> </span> <button type=\"button\" part=\"remove\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button></span>"), pA = I("<button type=\"button\" part=\"clear\" class=\"af-button ghost icon xs\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button>"), mA = I("<div part=\"control\" data-scope=\"combobox\" data-part=\"control\"><!> <input part=\"input\" data-scope=\"combobox\" data-part=\"input\" role=\"combobox\" aria-haspopup=\"tree\" aria-controls=\"af-tree\" autocomplete=\"off\" spellcheck=\"false\"/> <!></div>"), hA = I("<div part=\"loading\"> </div>"), gA = I("<button type=\"button\" part=\"load-more\"> </button>"), _A = I("<div part=\"empty\"> </div>"), vA = I("<div class=\"af-kit\"><!> <!></div>"), yA = I("<!> <!> <!>", 1), bA = {
	hash: "svelte-wzhqq0",
	code: ":host {display:inline-block;max-width:100%;vertical-align:middle;}af-tooltip.svelte-wzhqq0 {display:block;}[data-scope='popover'][data-part='anchor'] {display:block;}[data-scope='popover'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='popover'][data-part='content'] {display:flex;flex-direction:column;box-sizing:border-box;width:var(--reference-width, auto);max-height:256px;padding:6px;outline:none;}[data-scope='tree-view'][data-part='tree'], [data-scope='tree-view'][data-part='branch'], [data-scope='tree-view'][data-part='branch-content'] {display:flex;flex-direction:column;gap:2px;margin:0;padding:0;outline:none;}[data-scope='tree-view'][data-part='branch-content'][hidden] {display:none;}[part~='node'] {display:flex;box-sizing:border-box;align-items:center;gap:8px;height:32px;min-height:0;padding-right:8px;border:0 solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));font-size:12.5px;line-height:1.5;outline:none;cursor:pointer;-webkit-user-select:none;user-select:none;}\n  @media (hover: hover) {[part~='node']:hover {background-color:var(--k-muted-bg);} }[part~='node']:focus-visible {box-shadow:0 0 0 2px var(--k-focus-ring);}[part~='node'][data-selected]:not([aria-disabled='true']) {background-color:var(--k-accent);color:var(--k-accent-fg);font-weight:600;}[part~='node'][data-archived]:not([data-selected]) {font-style:italic;}[part~='node'][aria-disabled='true'] {color:color-mix(in oklab, var(--k-muted) 70%, transparent);cursor:not-allowed;}\n  @media (hover: hover) {[part~='node'][aria-disabled='true']:hover {background-color:transparent;} }[part~='toggle'] {display:grid;flex:none;place-items:center;width:16px;height:16px;padding:0;border:0;border-radius:0.25rem;background:transparent;color:var(--k-muted);cursor:pointer;}[part~='toggle'] svg {transition:transform 150ms cubic-bezier(0.4, 0, 0.2, 1);}[part~='toggle'][data-state='open'] svg {transform:rotate(90deg);}.spacer.svelte-wzhqq0 {flex:none;width:16px;height:16px;}[part~='check'] {display:grid;flex:none;box-sizing:border-box;place-items:center;width:14px;height:14px;border:1px solid var(--k-input);border-radius:4px;background-color:var(--k-surface);}[part~='check'][data-state='on'] {border-color:var(--k-primary);background-color:var(--k-primary);color:var(--k-primary-fg);}.label.svelte-wzhqq0 {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}[part~='ancestry'] {min-width:0;overflow:hidden;color:var(--k-muted);font-size:11px;font-style:normal;font-weight:400;text-overflow:ellipsis;white-space:nowrap;}[part~='code'] {flex:none;margin-left:auto;color:var(--k-muted);font-family:var(--af-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);font-size:10.5px;font-style:normal;font-weight:400;}[part~='archived'] {display:inline-flex;flex:none;box-sizing:border-box;align-items:center;height:18px;margin-left:auto;padding:0 6px;border:1px solid var(--k-line);border-radius:calc(infinity * 1px);background-color:var(--k-muted-bg);color:var(--k-muted);font-size:10px;font-style:normal;font-weight:600;}[part~='code'] + [part~='archived'] {margin-left:0;}[part~='loading'], [part~='empty'] {padding:20px 12px;color:var(--k-muted);font-size:12px;line-height:1.5;text-align:center;}[part~='load-more'] {display:flex;box-sizing:border-box;align-items:center;width:100%;height:32px;margin:2px 0 0;padding:0 8px;border:0;border-radius:max(0px, calc(var(--k-radius) - 2px));background:transparent;color:inherit;font:inherit;font-size:12.5px;text-align:start;outline:none;cursor:pointer;}\n  @media (hover: hover) {[part~='load-more']:hover {background-color:var(--k-muted-bg);} }[part~='load-more']:focus-visible {box-shadow:0 0 0 2px var(--k-focus-ring);}\n  @media (prefers-reduced-motion: reduce) {[part~='toggle'] svg {transition:none;} }\n  @media (forced-colors: active) {[part~='node']:focus-visible, [part~='load-more']:focus-visible {outline:2px solid;outline-offset:-2px;}[part~='node'][data-selected]:not([aria-disabled='true']) {forced-color-adjust:none;background-color:Highlight;color:HighlightText;}\n  }"
};
function xA(e, t) {
	k(t, !0), ee(e, bA);
	let i = (e, t = S) => {
		let n = y(() => t().node), r = y(() => z(me).includes(z(n).id));
		var i = cA(), a = G(i), o = (e) => {
			var t = P(), n = G(t);
			E(n, () => Sk, (e, t) => {
				t(e, {
					part: "toggle",
					tabindex: -1,
					"aria-hidden": "true",
					children: (e, t) => {
						var n = tA();
						F(e, n);
					},
					$$slots: { default: !0 }
				});
			}), F(e, t);
		}, s = (e) => {
			var t = nA();
			F(e, t);
		};
		M(a, (e) => {
			t().children.length ? e(o) : e(s, -1);
		});
		var c = U(a, 2), l = (e) => {
			var t = iA(), n = V(t), i = (e) => {
				var t = rA();
				F(e, t);
			};
			M(n, (e) => {
				z(r) && e(i);
			}), O(t), W(() => j(t, "data-state", z(r) ? "on" : "off")), F(e, t);
		};
		M(c, (e) => {
			v() && e(l);
		});
		var u = U(c, 2), d = ye(u, !0), f = U(u, 2), p = (e) => {
			var n = aA(), r = ye(n, !0);
			W((e) => T(r, e), [() => t().ancestry.join(" › ")]), F(e, n);
		};
		M(f, (e) => {
			t().ancestry.length && e(p);
		});
		var m = U(f, 2), h = (e) => {
			var t = oA(), r = ye(t, !0);
			W(() => T(r, z(n).code)), F(e, t);
		};
		M(m, (e) => {
			z(n).code && e(h);
		});
		var g = U(m, 2), _ = (e) => {
			var t = sA(), n = ye(t, !0);
			W(() => T(n, z(pe).archived)), F(e, t);
		};
		M(g, (e) => {
			z(n).archived && e(_);
		}), W(() => T(d, z(n).label)), F(e, i);
	}, o = (e, t = S) => {
		var n = P(), r = G(n);
		{
			let e = y(() => 8 + t().depth * 18), n = y(() => t().node.archived ? "" : void 0), a = y(() => dt(t().node));
			E(r, () => bk, (r, o) => {
				o(r, J({
					part: "node",
					get style() {
						return `padding-left: ${z(e) ?? ""}px`;
					},
					get "data-archived"() {
						return z(n);
					}
				}, () => z(a), {
					onclick: () => nt(t().node.id),
					children: (e, n) => {
						i(e, t);
					},
					$$slots: { default: !0 }
				}));
			});
		}
		F(e, n);
	}, c = (e, t = S) => {
		var n = P(), r = G(n);
		{
			let e = y(() => 8 + t().depth * 18), n = y(() => t().node.archived ? "" : void 0), a = y(() => dt(t().node));
			E(r, () => wk, (r, o) => {
				o(r, J({
					part: "node",
					get style() {
						return `padding-left: ${z(e) ?? ""}px`;
					},
					get "data-archived"() {
						return z(n);
					}
				}, () => z(a), {
					onclick: () => nt(t().node.id),
					children: (e, n) => {
						i(e, t);
					},
					$$slots: { default: !0 }
				}));
			});
		}
		F(e, n);
	}, l = (e, t = S, n = S) => {
		var r = P(), i = G(r), a = (e) => {
			var r = lA();
			W((e) => b(r, "text", e), [() => Ge(t().node)]), re(r, 1, "svelte-wzhqq0");
			var i = V(r);
			Se(i, n, t), O(r), F(e, r);
		}, o = y(() => We(t().node) && Ge(t().node)), s = (e) => {
			var r = P(), i = G(r);
			Se(i, n, t), F(e, r);
		};
		M(i, (e) => {
			z(o) ? e(a) : e(s, -1);
		}), F(e, r);
	}, f = (e, t = S, n = S) => {
		var r = P(), i = G(r);
		E(i, () => Tk, (e, r) => {
			r(e, {
				get node() {
					return t();
				},
				get indexPath() {
					return n();
				},
				children: (e, r) => {
					var i = P(), a = G(i), s = (e) => {
						var r = P(), i = G(r);
						E(i, () => gk, (e, r) => {
							r(e, {
								children: (e, r) => {
									var i = uA(), a = G(i);
									l(a, t, () => o);
									var s = U(a, 2);
									E(s, () => vk, (e, r) => {
										r(e, {
											children: (e, r) => {
												var i = P(), a = G(i);
												_(a, 19, () => t().children, (e) => e.node.id, (e, t, r) => {
													{
														let i = y(() => [...n(), z(r)]);
														f(e, () => z(t), () => z(i));
													}
												}), F(e, i);
											},
											$$slots: { default: !0 }
										});
									}), F(e, i);
								},
								$$slots: { default: !0 }
							});
						}), F(e, r);
					}, u = (e) => {
						l(e, t, () => c);
					};
					M(a, (e) => {
						t().children.length ? e(s) : e(u, -1);
					}), F(e, i);
				},
				$$slots: { default: !0 }
			});
		}), F(e, r);
	}, m = L(t, "nodes", 23, () => []), h = L(t, "source", 7, null), g = L(t, "value", 7, null), v = L(t, "multiple", 7, !1), te = L(t, "max", 7, null), C = L(t, "placeholder", 7, null), w = L(t, "label", 7, null), ne = L(t, "loading", 7, !1), ie = L(t, "disabled", 7, !1), D = L(t, "locale", 7, null), oe = L(t, "strings", 7, null), se = L(t, "name", 7, null), ce = L(t, "required", 7, !1), le = L(t, "readonly", 7, !1), ue = L(t, "description", 7, null), N = L(t, "error", 7, null), de = L(t, "invalid", 7, !1), I = t.$$host, R = r(I), pe = y(() => u(D(), oe() ?? void 0)), me = y(() => [...new Set(Array.isArray(g()) ? g() : g() ? [g()] : [])]), he = B(null), H = B(!1), ge = od((e) => e.id), _e = null, ve = B(null), xe = !1;
	function Ce() {
		xe && ge.busy || (xe = !0, _e = null, ge.now(""));
	}
	sd(ge, () => h(), () => z(me), () => {
		q(ve, null), xe = !1, z(H) && Ce();
	}), Oe(() => {
		let e = ge.next;
		if (z(H) && h() && !ge.busy) {
			if (e === null) {
				xe && (xe = !1, q(ve, ge.items.length ? ge.items : null));
				return;
			}
			e !== _e && (_e = e, Te(() => ge.more()));
		}
	});
	let we = y(() => h() ? z(ve) ?? ge.items : m() ?? []), Ee = y(() => Qk(z(we))), De = y(() => new Map(z(we).map((e) => [e.id, e]))), K = y(() => (z(he) ?? "").trim()), Ae = y(() => z(K) ? $k(z(Ee), z(K)) : null), je = y(() => z(Ae) ? eA(z(Ee), z(Ae).shown) : z(Ee)), Me = new rd(), Ne = new rd(), Pe = (e) => z(Ae) ? Ne.get(e.node.id) ?? z(Ae).open.has(e.node.id) : Me.get(e.node.id) ?? e.depth === 0, Fe = y(() => {
		let e = [], t = (n) => {
			for (let r of n) r.children.length && (e.push(r), t(r.children));
		};
		return t(z(je)), e;
	}), Y = y(() => z(Fe).filter(Pe).map((e) => e.node.id));
	function Ie(e) {
		let t = new Set(e), n = z(Ae) ? Ne : Me;
		for (let e of z(Fe)) Pe(e) !== t.has(e.node.id) && n.set(e.node.id, t.has(e.node.id));
	}
	let Le = y(() => ji({
		rootNode: {
			node: {
				id: "",
				parentId: null,
				label: ""
			},
			depth: -1,
			children: z(je),
			ancestry: []
		},
		nodeToValue: (e) => e.node.id,
		nodeToString: (e) => e.node.label,
		nodeToChildren: (e) => e.children
	})), Re = (e) => h() ? ge.named.get(e) : z(De).get(e), ze = y(() => z(me).filter((e) => !Re(e)));
	function Be(e) {
		let t = Re(e);
		return t ? t.label : ne() || h() && ge.pending(e) ? "…" : (h() ? ge.answered(e) : z(we).length > 0) ? z(ze).length > 1 ? `${z(pe).unknownOption} ${z(ze).indexOf(e) + 1}` : z(pe).unknownOption : "";
	}
	let Ve = y(() => z(he) ?? (v() || !z(me)[0] ? "" : Be(z(me)[0]))), He = y(() => !!ne() || !!h() && ge.busy), Ue = y(() => !!v() && te() != null && z(me).length >= te()), We = (e) => !!e.disabled || z(Ue) && !z(me).includes(e.id), Ge = (e) => e.disabled ? e.reason ?? "" : z(Ue) && !z(me).includes(e.id) ? s(z(pe).maxPicked, { max: te() }) : "", Ke = (e) => d(I, "change", { value: v() ? e : e[0] ?? null }), qe = B(!1), Je = y(() => !!ie() || z(qe)), Ye = y(() => z(Je) || !!le()), Xe = y(() => [ue(), N()].filter(Boolean).join(" ")), Ze = B(null), Qe = B(null), $e = B(null), et = B(null);
	Oe(() => a(z(et), z(H), I));
	function tt(e) {
		e === z(H) || e && z(Ye) || (q(H, e, !0), e ? h() && Ce() : (q(he, null), Ne.clear(), ge.stop(), xe = !1));
	}
	function nt(e) {
		let t = z(De).get(e);
		if (!(!t || z(Ye) || We(t))) {
			if (v()) {
				Ke(z(me).includes(e) ? z(me).filter((t) => t !== e) : [...z(me), e]);
				return;
			}
			z(me)[0] !== e && Ke([e]), tt(!1), z(Ze)?.focus();
		}
	}
	let rt = !1, it;
	Oe(() => () => clearTimeout(it));
	let at = (e) => e.key.length === 1 && e.key !== " " && e.key !== "*" && !e.ctrlKey && !e.metaKey;
	function ot(e) {
		if (e.key === " " ? rt : at(e)) {
			rt = !0, clearTimeout(it), it = setTimeout(() => rt = !1, 350);
			return;
		}
		if (e.key !== "Enter" && e.key !== " ") return;
		let t = e.target.closest("[data-part=\"item\"], [data-part=\"branch-control\"]")?.dataset.value;
		t !== void 0 && (e.preventDefault(), nt(t));
	}
	function st() {
		let e = [...z($e)?.querySelectorAll("[data-part=\"item\"], [data-part=\"branch-control\"]") ?? []].filter((e) => !e.closest("[hidden]"));
		(e.find((e) => e.dataset.value === z(me)[0]) ?? e.find((e) => e.tabIndex === 0) ?? e[0])?.focus();
	}
	function ct(e) {
		e.key !== "ArrowDown" || z(Ye) || (e.preventDefault(), z(H) ? st() : tt(!0));
	}
	function lt(e) {
		let t = e.currentTarget.value;
		q(he, t, !0), Ne.clear(), d(I, "search", { query: t }), tt(!0);
	}
	Oe(() => {
		let e = !!ce() && z(me).length === 0;
		jr(I, {
			name: se(),
			value: v() ? z(me) : z(me)[0] ?? null,
			validity: e ? { valueMissing: !0 } : {},
			message: e ? p(z(pe), "valueMissing") : "",
			anchor: z(Ze)
		});
	}), Mr(I, {
		reset() {
			let e = I.getAttribute("value"), t = e ? [e] : [];
			(t.length !== z(me).length || t.some((e, t) => e !== z(me)[t])) && Ke(t);
		},
		disabled(e) {
			q(qe, e, !0);
		}
	});
	function ut(e) {
		let t = e.target;
		t === z(Ze) || t.closest("button") || (e.preventDefault(), z(Ze)?.focus());
	}
	let dt = (e) => {
		if (!We(e)) return {};
		let t = Ge(e);
		return t ? {
			"aria-disabled": "true",
			"aria-description": t
		} : { "aria-disabled": "true" };
	};
	var ft = {
		get nodes() {
			return m();
		},
		set nodes(e = []) {
			m(e), A();
		},
		get source() {
			return h();
		},
		set source(e = null) {
			h(e), A();
		},
		get value() {
			return g();
		},
		set value(e = null) {
			g(e), A();
		},
		get multiple() {
			return v();
		},
		set multiple(e = !1) {
			v(e), A();
		},
		get max() {
			return te();
		},
		set max(e = null) {
			te(e), A();
		},
		get placeholder() {
			return C();
		},
		set placeholder(e = null) {
			C(e), A();
		},
		get label() {
			return w();
		},
		set label(e = null) {
			w(e), A();
		},
		get loading() {
			return ne();
		},
		set loading(e = !1) {
			ne(e), A();
		},
		get disabled() {
			return ie();
		},
		set disabled(e = !1) {
			ie(e), A();
		},
		get locale() {
			return D();
		},
		set locale(e = null) {
			D(e), A();
		},
		get strings() {
			return oe();
		},
		set strings(e = null) {
			oe(e), A();
		},
		get name() {
			return se();
		},
		set name(e = null) {
			se(e), A();
		},
		get required() {
			return ce();
		},
		set required(e = !1) {
			ce(e), A();
		},
		get readonly() {
			return le();
		},
		set readonly(e = !1) {
			le(e), A();
		},
		get description() {
			return ue();
		},
		set description(e = null) {
			ue(e), A();
		},
		get error() {
			return N();
		},
		set error(e = null) {
			N(e), A();
		},
		get invalid() {
			return de();
		},
		set invalid(e = !1) {
			de(e), A();
		}
	}, pt = yA(), mt = G(pt);
	n(mt, {});
	var ht = U(mt, 2);
	Zu(ht, {});
	var gt = U(ht, 2);
	return Ft(gt, {
		value: () => I.shadowRoot,
		children: (e, t) => {
			Qu(e, {
				get dir() {
					return R;
				},
				children: (e, t) => {
					var n = vA(), r = V(n), i = (e) => {
						var t = dA(), n = ye(t, !0);
						W(() => T(n, z(Xe))), F(e, t);
					};
					M(r, (e) => {
						z(Xe) && e(i);
					});
					var a = U(r, 2);
					E(a, () => Yx, (e, t) => {
						t(e, {
							get open() {
								return z(H);
							},
							autoFocus: !1,
							restoreFocus: !1,
							portalled: !1,
							positioning: {
								strategy: "fixed",
								placement: "bottom-start"
							},
							persistentElements: [() => z(Qe)],
							onOpenChange: (e) => tt(e.open),
							onEscapeKeyDown: (e) => {
								z(Ze)?.focus(), Xn(e) && e.defaultPrevented && tt(!1);
							},
							children: (e, t) => {
								var n = uA(), r = G(n);
								E(r, () => Sx, (e, t) => {
									t(e, {
										children: (e, t) => {
											var n = mA(), r = V(n), i = (e) => {
												var t = P(), n = G(t);
												_(n, 16, () => z(me), (e) => e, (e, t) => {
													let n = y(() => Be(t));
													var r = fA(), i = V(r), a = ye(i, !0), o = U(i, 2);
													O(r), W(() => {
														T(a, z(n)), j(o, "aria-label", `${z(pe).remove ?? ""}: ${z(n) ?? ""}`), o.disabled = z(Ye);
													}), be("click", o, () => Ke(z(me).filter((e) => e !== t))), F(e, r);
												}), F(e, t);
											};
											M(r, (e) => {
												v() && e(i);
											});
											var a = U(r, 2);
											ke(a), fe(a, (e) => q(Ze, e), () => z(Ze));
											var o = U(a, 2), s = (e) => {
												var t = pA();
												W(() => j(t, "aria-label", z(pe).clear)), be("click", t, () => Ke([])), F(e, t);
											};
											M(o, (e) => {
												!v() && z(me)[0] && !z(Ye) && e(s);
											}), O(n), fe(n, (e) => q(Qe, e), () => z(Qe)), W(() => {
												j(n, "data-disabled", z(Je) ? "" : void 0), j(a, "aria-expanded", z(H)), j(a, "placeholder", C() ?? ""), j(a, "aria-label", w() || void 0), j(a, "aria-describedby", z(Xe) ? "af-described" : void 0), j(a, "aria-required", ce() ? "true" : void 0), j(a, "aria-invalid", de() ? "true" : void 0), a.disabled = z(Je), a.readOnly = !!le(), ae(a, z(Ve));
											}), be("mousedown", n, ut), be("input", a, lt), be("keydown", a, ct), be("click", a, () => tt(!0)), F(e, n);
										},
										$$slots: { default: !0 }
									});
								});
								var i = U(r, 2);
								E(i, () => Ex, (e, t) => {
									t(e, {
										popover: "manual",
										get ref() {
											return z(et);
										},
										set ref(e) {
											q(et, e, !0);
										},
										children: (e, t) => {
											var n = P(), r = G(n);
											E(r, () => wx, (e, t) => {
												t(e, {
													class: "af-overlay",
													part: "content",
													children: (e, t) => {
														En(e, {
															tabStop: !1,
															children: (e, t) => {
																var n = uA(), r = G(n), i = () => z(me), a = () => z(Y), o = Ie;
																{
																	let e = y(() => v() ? "multiple" : "single");
																	E(r, () => Yk, (t, n) => {
																		n(t, {
																			get collection() {
																				return z(Le);
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
																				var n = P(), r = G(n);
																				{
																					let e = y(() => w() || C() || void 0);
																					E(r, () => Zk, (t, n) => {
																						n(t, {
																							part: "tree",
																							get "aria-label"() {
																								return z(e);
																							},
																							onkeydown: ot,
																							get ref() {
																								return z($e);
																							},
																							set ref(e) {
																								q($e, e, !0);
																							},
																							children: (e, t) => {
																								var n = P(), r = G(n);
																								_(r, 19, () => z(je), (e) => e.node.id, (e, t, n) => {
																									f(e, () => z(t), () => [z(n)]);
																								}), F(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					});
																				}
																				F(e, n);
																			},
																			$$slots: { default: !0 }
																		});
																	});
																}
																var s = U(r, 2), c = (e) => {
																	var t = hA(), n = ye(t, !0);
																	W(() => T(n, z(pe).loading)), F(e, t);
																}, l = (e) => {
																	var t = gA(), n = ye(t, !0);
																	W(() => T(n, z(pe).loadMore)), be("click", t, () => ge.more()), F(e, t);
																}, u = (e) => {
																	var t = _A(), n = ye(t, !0);
																	W(() => T(n, z(K) ? z(pe).noMatches : z(pe).noNodes)), F(e, t);
																};
																M(s, (e) => {
																	z(He) ? e(c) : h() && ge.next ? e(l, 1) : z(je).length === 0 && e(u, 2);
																}), F(e, n);
															},
															$$slots: { default: !0 }
														});
													},
													$$slots: { default: !0 }
												});
											}), F(e, n);
										},
										$$slots: { default: !0 }
									});
								}), F(e, n);
							},
							$$slots: { default: !0 }
						});
					}), O(n), F(e, n);
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { default: !0 }
	}), F(e, pt), x(ft);
}
De([
	"mousedown",
	"click",
	"input",
	"keydown"
]), H(xA, {
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
}, Ar);
//#endregion
//#region src/kit/form/owned.ts
var SA = "data-af-owned", CA = (e) => e instanceof Element && e.hasAttribute("data-af-owned");
function wA(e, t, n) {
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
function TA(e, t, n) {
	let r = [...t], i = [...n];
	wA(e, r, i);
	let a = new MutationObserver(() => wA(e, r, i));
	return a.observe(e, { childList: !0 }), () => a.disconnect();
}
function EA(e, t) {
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
var DA = {
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
}, OA = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/></svg>", kA = 0, AA = (e) => e.constructor.kitVersion !== void 0, jA = (e) => /^(radiogroup|group)$/.test(e.getAttribute("role") ?? ""), MA = (e) => e instanceof HTMLInputElement || e instanceof HTMLSelectElement || e instanceof HTMLTextAreaElement;
function NA(e, t) {
	let n = document.createElement(e);
	return n.className = t, n.setAttribute(SA, ""), n;
}
var PA = class extends HTMLElement {
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
	#t = `af-field-${++kA}`;
	#n = NA("div", "af-field-row");
	#r = NA("label", "af-field-label");
	#i = NA("p", "af-field-description");
	#a = NA("p", "af-field-error");
	#o = Object.assign(document.createElement("span"), {
		className: "af-field-required",
		textContent: "*"
	});
	#s = document.createElement("af-tooltip");
	#c = Object.assign(document.createElement("button"), {
		type: "button",
		className: "af-button ghost icon xs af-field-lock",
		innerHTML: OA
	});
	#l = null;
	#u = null;
	#d = !1;
	#f = null;
	#p = /* @__PURE__ */ new WeakSet();
	constructor() {
		super(), this.#r.id = `${this.#t}-label`, this.#i.id = `${this.#t}-description`, this.#a.id = `${this.#t}-error`, this.#n.append(this.#r), this.#o.setAttribute("aria-hidden", "true"), this.#s.append(this.#c), this.#r.addEventListener("click", () => {
			let e = this.#f?.control;
			e && AA(e) && e.focus();
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
		for (let e of this.children) if (!CA(e) && !e.hasAttribute("slot")) return e;
		return null;
	}
	connectedCallback() {
		this.#d = !0;
		for (let e of [
			...Object.keys(DA),
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
		let e = u(this.locale, this.#e ?? void 0), t = this.lockedReason || null;
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
			stop: TA(this, r, i)
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
		if (AA(e)) {
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
		jA(e) ? (this.#r.removeAttribute("for"), e.setAttribute("aria-labelledby", this.#r.id), t.labelledBy = !0) : (e.id ||= `${this.#t}-control`, this.#r.htmlFor = e.id);
		let o = /* @__PURE__ */ new Set([this.#i.id, this.#a.id]), s = [...(e.getAttribute("aria-describedby") ?? "").split(/\s+/).filter((e) => e && !o.has(e)), ...i];
		s.length ? e.setAttribute("aria-describedby", s.join(" ")) : e.removeAttribute("aria-describedby"), this.invalid || this.error ? e.getAttribute("aria-invalid") !== "true" && (e.setAttribute("aria-invalid", "true"), t.ariaInvalid = !0) : t.ariaInvalid &&= (e.removeAttribute("aria-invalid"), !1), this.required ? (e.getAttribute("aria-required") !== "true" && (e.setAttribute("aria-required", "true"), t.ariaRequired = !0), MA(e) && !e.required && (e.required = !0, t.required = !0)) : (t.ariaRequired && e.removeAttribute("aria-required"), t.required && MA(e) && (e.required = !1), t.ariaRequired = !1, t.required = !1), e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement ? r && !e.readOnly ? (e.readOnly = !0, t.readOnly = !0) : !r && t.readOnly && (e.readOnly = !1, t.readOnly = !1) : (e instanceof HTMLSelectElement || e.getAttribute("role") === "radiogroup") && (r && e.getAttribute("aria-readonly") !== "true" ? (e.setAttribute("aria-readonly", "true"), t.ariaReadonly = !0) : !r && t.ariaReadonly && (e.removeAttribute("aria-readonly"), t.ariaReadonly = !1));
	}
	#_(e) {
		let { control: t } = e;
		if (AA(t)) {
			for (let [n, r] of Object.entries(e.kit)) t[n] = r;
			return;
		}
		e.labelledBy && t.getAttribute("aria-labelledby") === this.#r.id && t.removeAttribute("aria-labelledby");
		let n = /* @__PURE__ */ new Set([this.#i.id, this.#a.id]), r = (t.getAttribute("aria-describedby") ?? "").split(/\s+/).filter((e) => e && !n.has(e));
		r.length ? t.setAttribute("aria-describedby", r.join(" ")) : t.removeAttribute("aria-describedby"), e.ariaInvalid && t.removeAttribute("aria-invalid"), e.ariaRequired && t.removeAttribute("aria-required"), e.required && MA(t) && (t.required = !1), e.readOnly && (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) && (t.readOnly = !1), e.ariaReadonly && t.removeAttribute("aria-readonly");
	}
};
EA(PA, DA);
//#endregion
//#region src/kit/form/fieldset.ts
var FA = {
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
}, IA = 4, LA = 0, RA = (e) => {
	let t = Math.round(Number(e));
	return Number.isFinite(t) ? Math.max(1, Math.min(IA, t)) : 1;
};
function zA(e, t) {
	let n = e.getAttribute("data-span"), r = e.getAttribute("data-col");
	if (n === null && r === null) return null;
	let i = (e) => {
		let t = Math.trunc(Number(e ?? 1));
		return Number.isFinite(t) ? t : 1;
	}, a = Math.max(1, Math.min(t, i(n))), o = Math.max(1, Math.min(t, i(r)));
	return t > 1 ? `${Math.min(o, t - a + 1)} / span ${a}` : `span ${a} / span ${a}`;
}
var BA = class extends HTMLElement {
	static observedAttributes = [
		"heading",
		"description",
		"columns",
		"locale"
	];
	#e = null;
	#t = `af-fieldset-${++LA}`;
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
		]) e.setAttribute(SA, "");
		this.#r.id = `${this.#t}-heading`;
	}
	get strings() {
		return this.#e;
	}
	set strings(e) {
		this.#e = e ?? null;
	}
	get columns() {
		return RA(this.getAttribute("columns"));
	}
	set columns(e) {
		e == null ? this.removeAttribute("columns") : this.setAttribute("columns", String(e));
	}
	connectedCallback() {
		this.#c = !0;
		for (let e of [
			...Object.keys(FA),
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
		for (let t of this.children) if (t instanceof HTMLFieldSetElement && !CA(t)) {
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
			stop: TA(t, r, [])
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
			if (CA(n) || !(n instanceof HTMLElement)) continue;
			let e = zA(n, t);
			e === null ? this.#p(n) : n.style.getPropertyValue("grid-column") !== e && (n.style.setProperty("grid-column", e), this.#l.add(n));
		}
	}
	#p(e) {
		e instanceof HTMLElement && this.#l.has(e) && (e.style.removeProperty("grid-column"), this.#l.delete(e));
	}
};
EA(BA, FA);
//#endregion
//#region src/kit/form/form.ts
var VA = {
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
}, HA = "button:not([type]), [type=submit]", UA = (e) => e.replace(/^\//, "").replace(/\//g, ".");
function WA(e) {
	let t = e.control;
	if (!(t instanceof HTMLElement)) return;
	t.focus();
	let n = t.getRootNode().activeElement;
	(!n || n !== t && !t.contains(n)) && t.querySelector("input, select, textarea, button, [tabindex]:not([tabindex=\"-1\"])")?.focus();
}
var GA = class extends HTMLElement {
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
		super(), this.#s.className = "af-form-summary af-banner danger", this.#s.setAttribute(SA, ""), this.#s.setAttribute("role", "alert"), this.#s.tabIndex = -1, this.addEventListener("submit", this.#m);
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
		for (let e of this.children) if (e instanceof HTMLFormElement && !CA(e)) return e;
		return null;
	}
	connectedCallback() {
		for (let e of [
			...Object.keys(VA),
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
		let n = e.submitter ?? null, r;
		try {
			r = new FormData(t, n);
		} catch {
			r = new FormData(t);
		}
		d(this, "af-submit", {
			formData: r,
			submitter: n
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
		let e = this.#p, t = new Set(this.busy && this.#n && e ? e.querySelectorAll(HA) : []);
		for (let e of this.#o) t.has(e) || (e.getAttribute("aria-disabled") === "true" && e.removeAttribute("aria-disabled"), this.#o.delete(e));
		for (let e of t) e.getAttribute("aria-disabled") !== "true" && (e.setAttribute("aria-disabled", "true"), this.#o.add(e));
	}
	#y() {
		let e = this.#p;
		return e ? [...e.querySelectorAll("af-field")].filter((e) => e instanceof PA) : [];
	}
	#b(e) {
		if (!this.#n) return;
		let t = this.#p, n = this.#y(), r = /* @__PURE__ */ new Map();
		for (let { path: e, message: t } of this.#t) {
			let n = UA(String(e ?? ""));
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
			stop: TA(t, [this.#s], [])
		}) : (this.#c?.stop(), this.#c = null, this.#s.remove()), e && (this.#c ? this.#s.focus() : o[0] && WA(o[0]));
	}
	#x() {
		let { unmatched: e, matched: t } = this.#l;
		if (!e.length) return;
		let n = u(this.locale, this.#e ?? void 0);
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
					t.preventDefault(), WA(e);
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
EA(GA, VA);
//#endregion
//#region src/kit/fonts.ts
var KA = Symbol.for("@reflexify/agentflow-elements/kit/fonts");
function qA() {
	let e = globalThis;
	return e[KA] ??= {
		faces: /* @__PURE__ */ new Map(),
		ours: /* @__PURE__ */ new WeakSet()
	};
}
function JA(e) {
	return e.trim().replace(/^(["'])(.*)\1$/, "$2").trim().toLowerCase();
}
function YA(e) {
	let t = Object.entries(e.descriptors ?? {}).sort(([e], [t]) => e.localeCompare(t));
	return JSON.stringify([
		e.family,
		e.url,
		t
	]);
}
function XA(e, t) {
	console.warn("A font face did not load; text falls back to the module's font stack.", {
		family: e.family,
		url: e.url,
		error: String(t)
	});
}
function ZA(e) {
	if (typeof document > "u" || !document.fonts || typeof FontFace > "u") return Promise.resolve();
	let { faces: t, ours: n } = qA(), r = e.map((e) => {
		let r = YA(e), i = t.get(r);
		if (i) return i;
		let a = JA(e.family);
		for (let e of document.fonts) if (!n.has(e) && JA(e.family) === a) return Promise.resolve();
		let o;
		try {
			let t = new FontFace(e.family, `url(${JSON.stringify(e.url)})`, e.descriptors);
			document.fonts.add(t), n.add(t), o = t.load().then(() => void 0, (t) => XA(e, t));
		} catch (t) {
			XA(e, t), o = Promise.resolve();
		}
		return t.set(r, o), o;
	});
	return Promise.all(r).then(() => void 0);
}
//#endregion
//#region src/kit/index.ts
var QA = {
	"af-dialog": j_,
	"af-confirm": Wf,
	"af-menu": Sy,
	"af-popover": tS,
	"af-tooltip": KO,
	"af-toast": fO,
	"af-date": T_,
	"af-person-picker": vx,
	"af-number-input": Gb,
	"af-select": AC,
	"af-combobox": Sd,
	"af-rich-editor": yS,
	"af-tile": iD,
	"af-field": { element: PA },
	"af-fieldset": { element: BA },
	"af-form": { element: GA },
	"af-scroll-area": SS,
	"af-tabs": $E,
	"af-splitter": _E,
	"af-pager": nx,
	"af-copy-button": Xf,
	"af-markdown": I_,
	"af-tree-picker": xA,
	"af-bulk-bar": Er,
	"af-file-upload": ym,
	"af-signature-pad": cT,
	"af-folder-source": m
}, $A = Object.keys(QA);
for (let e of Object.values(QA)) Object.defineProperty(e.element, "kitVersion", { value: Ee });
function ej(e = customElements) {
	for (let [t, n] of Object.entries(QA)) {
		let r = e.get(t);
		if (!r) e.define(t, n.element);
		else if (r !== n.element) {
			let e = r.kitVersion;
			Ce(e, Ee) && console.warn(`An older copy of the AgentFlow UI kit registered ${t} first; this page uses it, not this copy.`, {
				tag: t,
				registered: e ?? null,
				loaded: Ee
			});
		}
	}
}
ej();
//#endregion
export { c as KIT_CSS, $A as KIT_TAGS, Ee as KIT_VERSION, Yn as claimEscape, ej as defineKitElements, ZA as loadFonts };
