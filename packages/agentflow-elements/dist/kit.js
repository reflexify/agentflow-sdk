import { $ as e, B as t, C as n, Ct as r, D as i, Ft as a, G as o, H as s, I as c, It as l, J as u, L as d, Lt as f, M as p, Nt as m, O as h, Ot as g, P as _, Pt as v, Q as y, R as b, T as x, U as S, V as C, W as w, X as T, Y as E, Z as D, _ as O, _t as k, at as ee, b as te, bt as A, ct as ne, dt as j, et as M, ft as re, g as N, gt as P, ht as F, it as ie, kt as I, lt as L, mt as R, nt as z, ot as B, pt as V, q as ae, r as H, rt as oe, st as se, t as ce, tt as le, ut as U, v as W, vt as ue, w as de, wt as G, xt as K, y as q, yt as J, z as fe } from "./chunks/version-CCDdag5V.js";
import { s as pe, t as Y } from "./chunks/Loading-B3QyjI_k.js";
import { a as me, i as he, n as ge, o as _e, r as ve, s as ye } from "./chunks/text-CDgi_cJ8.js";
import { t as be } from "./chunks/ActivityFeed-RaK6rTb7.js";
import { a as xe, c as Se, i as Ce, n as we, o as Te, r as Ee, s as De, t as Oe } from "./chunks/environment-1PeQDNCe.js";
import { a as ke, c as Ae, i as je, l as Me, o as Ne, r as Pe, s as Fe, t as Ie } from "./chunks/RichEditor-lvZV6ef0.js";
import { a as Le, i as Re, o as ze, r as Be, s as Ve, t as He } from "./chunks/FileUpload-BLOIwraN.js";
import { $ as Ue, A as We, At as Ge, C as Ke, Ct as qe, D as Je, Dt as Ye, E as Xe, Et as Ze, Ft as Qe, G as $e, I as et, It as tt, L as nt, Lt as rt, N as it, Nt as at, O as ot, Ot as st, P as ct, Pt as lt, Q as ut, R as dt, Rt as ft, S as pt, St as mt, T as ht, Tt as gt, U as _t, V as vt, Z as yt, _ as bt, a as xt, at as St, b as Ct, bt as wt, c as X, ct as Tt, d as Et, dt as Dt, et as Z, f as Ot, ft as kt, g as At, gt as jt, h as Mt, i as Nt, it as Pt, j as Ft, jt as It, k as Lt, kt as Rt, l as zt, lt as Bt, m as Vt, mt as Ht, n as Ut, o as Wt, ot as Gt, p as Kt, pt as qt, q as Jt, r as Yt, rt as Xt, s as Zt, st as Qt, t as $t, tt as en, u as Q, ut as tn, v as nn, vt as rn, w as an, x as on, xt as sn, y as cn, yt as ln, zt as un } from "./chunks/use-locale-context-Bbi6iBc1.js";
import { C as dn, S as fn, _ as pn, b as mn, d as hn, f as gn, g as _n, h as vn, m as yn, p as bn, u as xn, v as Sn, x as Cn, y as wn } from "./chunks/mention-chip-CSmBskyF.js";
import { a as Tn, c as En, d as Dn, i as On, l as kn, n as An, o as jn, s as Mn, t as Nn, u as Pn } from "./chunks/set-CnFBSE12.js";
import { _ as Fn, a as In, c as Ln, d as Rn, f as zn, g as Bn, h as Vn, i as Hn, l as Un, m as Wn, o as Gn, p as Kn, s as qn, u as Jn, y as Yn } from "./chunks/dist-Csn5UEk4.js";
import { t as Xn } from "./chunks/CommentThread-CvqXM3ri.js";
import { a as Zn, i as Qn, o as $n, r as er, t as tr } from "./chunks/Confirm-CDcmWK03.js";
import { claimEscape as nr, isClaimed as rr } from "./escape.js";
import { t as ir } from "./chunks/FolderSource-BYpfyyO9.js";
import { t as ar } from "./chunks/Markdown-BT56NDof.js";
//#region ../agentflow-sdk/dist/conventions/dates.js
var or = /^(\d{4})-(\d{2})-(\d{2})$/, sr = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, cr = (e) => String(e).padStart(2, "0"), lr = (e) => /^vi(-|$)/i.test(e ?? "");
function ur(e, t, n) {
	let r = new Date(Date.UTC(2e3, t - 1, n));
	return r.setUTCFullYear(e), r.getUTCFullYear() !== e || r.getUTCMonth() !== t - 1 || r.getUTCDate() !== n ? null : `${String(e).padStart(4, "0")}-${cr(t)}-${cr(n)}`;
}
function dr(e) {
	let t = or.exec(e ?? "");
	return t ? ur(Number(t[1]), Number(t[2]), Number(t[3])) : null;
}
function fr(e) {
	let t = e.trim(), n = sr.exec(t);
	return n ? ur(Number(n[3]), Number(n[2]), Number(n[1])) : dr(t);
}
function pr(e, t) {
	let n = lr(t), r = n ? {
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
var mr = /DD|MM|YYYY/g;
function hr(e) {
	if (!e) return null;
	let t = e.match(mr), n = e.split(mr);
	if (!t || t.length !== 3 || new Set(t).size !== 3) return null;
	let [r, i, a, o] = n;
	return r !== "" || o !== "" || /\p{L}/u.test(i + a) ? null : {
		tokens: t,
		between: [i, a]
	};
}
function gr(e) {
	return hr(e) !== null;
}
function _r(e, t) {
	let n = hr(t), r = dr(e);
	if (!n || !r) return null;
	let i = {
		YYYY: r.slice(0, 4),
		MM: r.slice(5, 7),
		DD: r.slice(8, 10)
	};
	return n.tokens.map((e, t) => i[e] + (n.between[t] ?? "")).join("");
}
function vr(e, t) {
	let n = hr(t);
	if (!n) return null;
	let r = (e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), i = (e, t) => e === "YYYY" ? "(\\d{4})" : n.between[t - 1] === "" || n.between[t] === "" ? "(\\d{2})" : "(\\d{1,2})", a = n.tokens.map((e, t) => i(e, t) + r(n.between[t] ?? "")).join(""), o = RegExp(`^${a}$`).exec(e.trim());
	if (!o) return null;
	let s = (e) => Number(o[n.tokens.indexOf(e) + 1]);
	return ur(s("YYYY"), s("MM"), s("DD"));
}
function yr(e = /* @__PURE__ */ new Date()) {
	return `${String(e.getFullYear()).padStart(4, "0")}-${cr(e.getMonth() + 1)}-${cr(e.getDate())}`;
}
//#endregion
//#region ../agentflow-sdk/dist/conventions/match.js
function br(e) {
	return e.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
}
function xr(e, t) {
	return br(e ?? "").includes(br(t.trim()));
}
//#endregion
//#region src/kit/BulkBar.svelte
var Sr = "button, a[href], input, select, textarea, [role=\"button\"], [tabindex]";
function Cr(e) {
	return e.matches(Sr) ? e : e.querySelector(Sr) ?? e;
}
var wr = (e) => !e.matches(":disabled") && e.getAttribute("aria-disabled") !== "true", Tr = (e) => (e.textContent ?? "").replace(/\s+/g, " ").trim() || e.getAttribute("aria-label") || e.title;
function Er(e) {
	let t = e.shadowRoot;
	for (let e of t?.querySelector("slot")?.assignedElements() ?? []) {
		let t = Cr(e);
		if (e.hasAttribute("data-overflow") || !wr(t)) continue;
		t.focus();
		let n = Oe();
		if (n && Se(e, n)) return;
	}
	t?.querySelector("[part~=\"clear\"]")?.focus();
}
var Dr = y("<span class=\"words svelte-i31wrt\"> </span>"), Or = y("<span part=\"count\" class=\"count svelte-i31wrt\"> </span><!>", 1), kr = y("<!><!>", 1), Ar = y("<af-menu><svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"1\"></circle><circle cx=\"19\" cy=\"12\" r=\"1\"></circle><circle cx=\"5\" cy=\"12\" r=\"1\"></circle></svg></af-menu>", 2), jr = y("<!> <div class=\"af-kit svelte-i31wrt\"><div part=\"status\" role=\"status\" class=\"live svelte-i31wrt\"> </div> <div part=\"bar\" popover=\"manual\"><span part=\"text\" class=\"summary svelte-i31wrt\"><!></span> <div class=\"tail svelte-i31wrt\"><div><!> <!></div> <button type=\"button\" part=\"clear\" class=\"af-button ghost sm clear svelte-i31wrt\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg> </button></div></div></div>", 1), Mr = {
	hash: "svelte-i31wrt",
	code: ":host {display:contents;}.af-kit.svelte-i31wrt {display:contents;}.live.svelte-i31wrt {position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;}.bar[popover].svelte-i31wrt {inset:auto 0 24px 0;box-sizing:border-box;width:max-content;max-width:calc(100vw - 2rem);margin:0 auto;padding:10px 12px 10px 16px;border:0;border-radius:calc(var(--k-radius) + 4px);background:var(--k-fg);color:var(--k-surface);box-shadow:0 25px 50px -12px rgb(0 0 0 / 0.25);overflow:visible;}.bar[popover].svelte-i31wrt:popover-open {display:flex;align-items:center;gap:12px;}.bar.wide.svelte-i31wrt {width:calc(100vw - 2rem);}.summary.svelte-i31wrt {display:flex;flex:none;align-items:center;gap:8px;font-size:13px;font-weight:600;line-height:1.5;}.words.svelte-i31wrt {min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.count.svelte-i31wrt {flex:none;border-radius:calc(var(--k-radius) - 2px);padding:2px 8px;background:var(--k-surface);color:var(--k-fg);font-variant-numeric:tabular-nums;}.bar.svelte-i31wrt[data-compact] .summary:where(.svelte-i31wrt) {flex:0 1 auto;min-width:0;}.bar.svelte-i31wrt[data-compact] .tail:where(.svelte-i31wrt) {min-width:min-content;}.tail.svelte-i31wrt {display:flex;flex:0 1 auto;align-items:center;gap:8px;min-width:0;margin-left:auto;color:color-mix(in oklab, var(--k-surface) 75%, transparent);--k-accent: color-mix(in oklab, var(--k-surface) calc(10% + var(--k-dark, 0) * 10%), transparent);--k-accent-fg: var(--k-surface);}.actions.svelte-i31wrt {display:flex;flex:0 1 auto;align-items:center;gap:8px;min-width:0;}.actions.empty.svelte-i31wrt {display:none;}.actions.svelte-i31wrt ::slotted([data-overflow]) {display:none !important;}.more.svelte-i31wrt {display:block;flex:none;width:32px;height:32px;}.more.idle.svelte-i31wrt {position:absolute;visibility:hidden;pointer-events:none;}.more.svelte-i31wrt::part(trigger) {width:32px;height:32px;padding:0;color:color-mix(in oklab, var(--k-surface) 75%, transparent);}\n  @media (hover: hover) {.more.svelte-i31wrt::part(trigger):hover {background:color-mix(in oklab, var(--k-surface) 10%, transparent);color:var(--k-surface);} }button.af-button.sm.clear.svelte-i31wrt {gap:4px;}"
};
function Nr(e, n) {
	I(n, !0), c(e, Mr);
	let a = O(n, "count", 7, 0), o = O(n, "total", 7, null), s = O(n, "label", 7, null), l = O(n, "locale", 7, null), u = O(n, "strings", 7, null), d = n.$$host, f = G(() => he(l(), u() ?? void 0)), m = G(() => new Intl.NumberFormat(ve(l()) ? "vi-VN" : "en-GB")), h = G(() => Number(a()) > 0), _ = G(() => B(m).format(Number(a()) || 0)), y = G(() => Number.isFinite(Number(o())) && Number(o()) > 0), b = G(() => ge(B(y) ? B(f).selectedOfTotal : B(f).selectedCount, { total: B(m).format(Number(o())) })), x = G(() => B(b).split("{count}")), S = G(() => s() || ge(B(b), { count: B(_) })), C = K(null), D = K(null), k = K(null), A = K(!1), M = K([]), re = K([]), N = (e) => e?.getBoundingClientRect().width ?? 0, L = () => B(D)?.querySelector("slot") ?? null;
	function z() {
		let e = B(D), t = L()?.assignedElements() ?? [];
		for (let e of t) e.removeAttribute("data-overflow");
		if (!e) return;
		B(C)?.removeAttribute("data-compact");
		let n = N(e), r = parseFloat(getComputedStyle(e).columnGap) || 0, i = t.map(N), a = t.length;
		if (i.reduce((e, t) => e + t, 0) + r * Math.max(0, t.length - 1) > n + .5) {
			let e = n - N(B(k)) - r, t = 0;
			for (a = 0; a < i.length; a++) {
				let n = t + (a ? r : 0) + i[a];
				if (n > e) break;
				t = n;
			}
		}
		B(C)?.toggleAttribute("data-compact", a === 0), J(M, t.slice(a).filter((e) => e !== ae));
		for (let e of B(M)) e.setAttribute("data-overflow", "");
		W();
	}
	let ae = null, H = null, ce = (e) => e.matches("[data-raised=\"true\"]") || !!e.querySelector("[data-raised=\"true\"]");
	function le(e = !0) {
		H?.disconnect(), H = null, ae && (ae = null, e && z());
	}
	j(() => () => le(!1));
	function W() {
		J(re, B(M).map((e, t) => {
			let n = Cr(e);
			return {
				id: String(t),
				label: Tr(n),
				disabled: !wr(n)
			};
		}));
	}
	function ue(e) {
		if (!(e instanceof CustomEvent)) return;
		let t = B(M)[Number(e.detail?.id)];
		if (!t) return;
		let n = Cr(t);
		if (le(), n === t) {
			n.click();
			return;
		}
		ae = t, z();
		let r = t;
		H = new MutationObserver(() => {
			ae === r && !ce(r) && le();
		}), H.observe(r, {
			attributes: !0,
			attributeFilter: ["data-raised"],
			subtree: !0
		}), n.click(), se().then(() => {
			ae === r && !ce(r) && le();
		});
	}
	let de = null;
	function q() {
		if (de && B(C)) {
			de.disconnect(), de.observe(B(C));
			for (let e of L()?.assignedElements() ?? []) de.observe(e);
		}
	}
	j(() => {
		if (!B(C) || typeof ResizeObserver > "u") return;
		let e = new ResizeObserver(() => z());
		return de = e, ne(q), () => {
			e.disconnect(), de = null;
		};
	}), j(() => {
		let e = L();
		if (!e) return;
		let t = () => {
			J(A, e.assignedElements().length > 0), q(), se().then(z);
		};
		return ne(t), ee(e, "slotchange", t);
	}), j(() => {
		let e = B(h);
		if (!e) {
			le(!1);
			let e = Oe();
			e && Se(d, e) && e.blur();
		}
		De(B(C), e, d), e && ne(z);
	}), j(() => {
		let e = B(C);
		if (e) return ee(e, "keydown", (t) => {
			if (!(t.key !== "Escape" || t.defaultPrevented || t.isComposing)) {
				for (let n of t.composedPath()) {
					if (n === e) break;
					if (n instanceof HTMLElement && n.dataset.raised === "true") return;
				}
				Ce(d, "clear", {});
			}
		});
	});
	var fe = {
		get count() {
			return a();
		},
		set count(e = 0) {
			a(e), r();
		},
		get total() {
			return o();
		},
		set total(e = null) {
			o(e), r();
		},
		get label() {
			return s();
		},
		set label(e = null) {
			s(e), r();
		},
		get locale() {
			return l();
		},
		set locale(e = null) {
			l(e), r();
		},
		get strings() {
			return u();
		},
		set strings(e = null) {
			u(e), r();
		}
	}, pe = jr(), Y = R(pe);
	_e(Y, {});
	var me = P(Y, 2), ye = V(me), be = F(ye, !0), xe = P(ye, 2);
	let we;
	var Te = V(xe), Ee = V(Te), ke = (e) => {
		var t = Dr(), n = F(t, !0);
		U(() => E(n, s())), T(e, t);
	}, Ae = (e) => {
		var t = kr(), n = R(t), r = (e) => {
			var t = Dr(), n = F(t, !0);
			U(() => E(n, B(x)[0])), T(e, t);
		}, i = G(() => B(x)[0]?.trim());
		w(n, (e) => {
			B(i) && e(r);
		});
		var a = P(n), o = (e) => {
			var t = Or(), n = R(t), r = F(n, !0), i = P(n), a = (e) => {
				var t = Dr(), n = F(t, !0);
				U((e) => E(n, e), [() => B(x).slice(1).join(B(_))]), T(e, t);
			}, o = G(() => B(x).slice(1).join(B(_)).trim());
			w(i, (e) => {
				B(o) && e(a);
			}), U(() => E(r, B(_))), T(e, t);
		};
		w(a, (e) => {
			B(x).length > 1 && e(o);
		}), T(e, t);
	};
	w(Ee, (e) => {
		s() ? e(ke) : e(Ae, -1);
	}), v(Te);
	var je = P(Te, 2), Me = V(je);
	let Ne;
	var Pe = V(Me);
	t(Pe, () => "<slot name=\"actions\"></slot>");
	var Fe = P(Pe, 2), Ie = (e) => {
		var t = Ar();
		i(t, "part", "more");
		let n;
		U(() => i(t, "items", B(re))), U(() => i(t, "label", B(f).moreActions)), U(() => i(t, "locale", l() || void 0)), U(() => i(t, "strings", u() ?? void 0)), te(t, (e) => J(k, e), () => B(k)), U(() => n = p(t, 1, "more svelte-i31wrt", null, n, { idle: B(M).length === 0 })), ie("select", t, ue), ie("pointerdown", t, W, !0), ie("keydown", t, W, !0), T(e, t);
	};
	w(Fe, (e) => {
		B(h) && e(Ie);
	}), v(Me), te(Me, (e) => J(D, e), () => B(D));
	var Le = P(Me, 2), Re = P(V(Le), 1, !0);
	return v(Le), v(je), v(xe), te(xe, (e) => J(C, e), () => B(C)), v(me), U(() => {
		E(be, B(h) ? B(S) : ""), we = p(xe, 1, "bar svelte-i31wrt", null, we, { wide: B(M).length > 0 }), Ne = p(Me, 1, "actions svelte-i31wrt", null, Ne, { empty: !B(A) }), E(Re, B(f).clearSelection);
	}), oe("click", Le, () => Ce(d, "clear", {})), T(e, pe), g(fe);
}
z(["click"]), N(Nr, {
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
		Er(this);
	}
});
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+collection@1.43.3/node_modules/@zag-js/collection/dist/chunk-QZ7TP4HQ.mjs
var Pr = Object.defineProperty, Fr = (e, t, n) => t in e ? Pr(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, $ = (e, t, n) => Fr(e, typeof t == "symbol" ? t : t + "", n), Ir = Object.defineProperty, Lr = (e) => {
	throw TypeError(e);
}, Rr = (e, t, n) => t in e ? Ir(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, zr = (e, t, n) => Rr(e, typeof t == "symbol" ? t : t + "", n), Br = (e, t, n) => t.has(e) || Lr("Cannot " + n), Vr = (e, t, n) => (Br(e, t, "read from private field"), n ? n.call(e) : t.get(e)), Hr = (e, t, n) => t.has(e) ? Lr("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/store.mjs
function Ur(e, t = Object.is) {
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
var Wr = () => performance.now(), Gr, Kr = class {
	constructor(e) {
		zr(this, "onTick", e), zr(this, "frameId", null), zr(this, "pausedAtMs", null), zr(this, "context"), zr(this, "cancelFrame", () => {
			this.frameId !== null && (cancelAnimationFrame(this.frameId), this.frameId = null);
		}), zr(this, "setStartMs", (e) => {
			this.context.startMs = e;
		}), zr(this, "start", () => {
			if (this.frameId !== null) return;
			let e = Wr();
			this.pausedAtMs === null ? this.context.startMs = e : (this.context.startMs += e - this.pausedAtMs, this.pausedAtMs = null), this.frameId = requestAnimationFrame(Vr(this, Gr));
		}), zr(this, "pause", () => {
			this.frameId !== null && (this.cancelFrame(), this.pausedAtMs = Wr());
		}), zr(this, "stop", () => {
			this.frameId !== null && (this.cancelFrame(), this.pausedAtMs = null);
		}), Hr(this, Gr, (e) => {
			if (this.context.now = e, this.context.deltaMs = e - this.context.startMs, this.onTick(this.context) === !1) {
				this.stop();
				return;
			}
			this.frameId = requestAnimationFrame(Vr(this, Gr));
		}), this.context = {
			now: 0,
			startMs: Wr(),
			deltaMs: 0
		};
	}
	get elapsedMs() {
		return this.pausedAtMs === null ? Wr() - this.context.startMs : this.pausedAtMs - this.context.startMs;
	}
};
Gr = /* @__PURE__ */ new WeakMap();
function qr(e, t) {
	let n = new Kr(({ deltaMs: n }) => {
		if (n >= t) return e(), !1;
	});
	return n.start(), () => n.stop();
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+collection@1.43.3/node_modules/@zag-js/collection/dist/list-collection.mjs
var Jr = {
	itemToValue(e) {
		return typeof e == "string" ? e : gt(e) && wt(e, "value") ? e.value : "";
	},
	itemToString(e) {
		return typeof e == "string" ? e : gt(e) && wt(e, "label") ? e.label : Jr.itemToValue(e);
	},
	isItemDisabled(e) {
		return gt(e) && wt(e, "disabled") ? !!e.disabled : !1;
	}
}, Yr = class e {
	constructor(t) {
		$(this, "options", t), $(this, "items"), $(this, "indexMap", null), $(this, "copy", (t) => new e({
			...this.options,
			items: t ?? [...this.items]
		})), $(this, "isEqual", (e) => Ze(this.items, e.items)), $(this, "setItems", (e) => this.copy(e)), $(this, "getValues", (e = this.items) => {
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
		}), $(this, "sort", (e) => [...e].sort(this.sortFn.bind(this))), $(this, "getItemValue", (e) => e == null ? null : this.options.itemToValue?.(e) ?? Jr.itemToValue(e)), $(this, "getItemDisabled", (e) => e == null ? !1 : this.options.isItemDisabled?.(e) ?? Jr.isItemDisabled(e)), $(this, "stringifyItem", (e) => e == null ? null : this.options.itemToString?.(e) ?? Jr.itemToString(e)), $(this, "stringify", (e) => e == null ? null : this.stringifyItem(this.find(e))), $(this, "stringifyItems", (e, t = ", ") => {
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
				if (!(r && this.getItemValue(a) === t) && !this.getItemDisabled(a) && Xr(this.stringifyItem(a), e)) return a;
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
		}), $(this, "insert", (e, ...t) => this.copy(Zr(this.items, e, ...t))), $(this, "insertBefore", (e, ...t) => {
			let n = this.indexOf(e);
			if (n === -1) {
				if (this.items.length === 0) n = 0;
				else return this;
			}
			return this.copy(Zr(this.items, n, ...t));
		}), $(this, "insertAfter", (e, ...t) => {
			let n = this.indexOf(e);
			if (n === -1) {
				if (this.items.length === 0) n = 0;
				else return this;
			}
			return this.copy(Zr(this.items, n + 1, ...t));
		}), $(this, "prepend", (...e) => this.copy(Zr(this.items, 0, ...e))), $(this, "append", (...e) => this.copy(Zr(this.items, this.items.length, ...e))), $(this, "filter", (e) => {
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
			return n === -1 ? this : this.copy(Qr(this.items, [n], t));
		}), $(this, "moveBefore", (e, ...t) => {
			let n = this.items.findIndex((t) => this.getItemValue(t) === e);
			if (n === -1) return this;
			let r = t.map((e) => this.items.findIndex((t) => this.getItemValue(t) === e)).sort((e, t) => e - t);
			return this.copy(Qr(this.items, r, n));
		}), $(this, "moveAfter", (e, ...t) => {
			let n = this.items.findIndex((t) => this.getItemValue(t) === e);
			if (n === -1) return this;
			let r = t.map((e) => this.items.findIndex((t) => this.getItemValue(t) === e)).sort((e, t) => e - t);
			return this.copy(Qr(this.items, r, n + 1));
		}), $(this, "reorder", (e, t) => this.copy(Qr(this.items, [e], t))), $(this, "compareValue", (e, t) => {
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
}, Xr = (e, t) => !!e?.toLowerCase().startsWith(t.toLowerCase());
function Zr(e, t, ...n) {
	return [
		...e.slice(0, t),
		...n,
		...e.slice(t)
	];
}
function Qr(e, t, n) {
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
function $r({ values: e, collection: t, selectedItemMap: n }) {
	let r = [];
	for (let i of e) {
		let e = t.find(i) ?? n.get(i);
		e != null && r.push(e);
	}
	return r;
}
function ei({ selectedItemMap: e, values: t, selectedItems: n, collection: r }) {
	let i = new Map(e);
	for (let e of n) {
		let t = r.getItemValue(e);
		t != null && i.set(t, e);
	}
	let a = new Set(t);
	for (let e of i.keys()) a.has(e) || i.delete(e);
	return i;
}
function ti({ values: e, collection: t, selectedItemMap: n }) {
	let r = $r({
		values: e,
		collection: t,
		selectedItemMap: n
	});
	return {
		selectedItems: r,
		nextSelectedItemMap: ei({
			selectedItemMap: n,
			values: e,
			selectedItems: r,
			collection: t
		})
	};
}
function ni({ selectedItems: e, collection: t }) {
	return ei({
		selectedItemMap: /* @__PURE__ */ new Map(),
		values: e.map((e) => t.getItemValue(e)).filter(Boolean),
		selectedItems: e,
		collection: t
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+collection@1.43.3/node_modules/@zag-js/collection/dist/tree-visit.mjs
function ri(e, t, n) {
	for (let r = 0; r < t.length; r++) e = n.getChildren(e, t.slice(r + 1))[t[r]];
	return e;
}
function ii(e) {
	let t = oi(e), n = [], r = /* @__PURE__ */ new Set();
	for (let e of t) {
		let t = e.join();
		r.has(t) || (r.add(t), n.push(e));
	}
	return n;
}
function ai(e, t) {
	for (let n = 0; n < Math.min(e.length, t.length); n++) {
		if (e[n] < t[n]) return -1;
		if (e[n] > t[n]) return 1;
	}
	return e.length - t.length;
}
function oi(e) {
	return e.sort(ai);
}
function si(e, t) {
	let n;
	return Oi(e, {
		...t,
		onEnter: (e, r) => {
			if (t.predicate(e, r)) return n = e, "stop";
		}
	}), n;
}
function ci(e, t) {
	let n = [];
	return Oi(e, {
		onEnter: (e, r) => {
			t.predicate(e, r) && n.push(e);
		},
		getChildren: t.getChildren
	}), n;
}
function li(e, t) {
	let n;
	return Oi(e, {
		onEnter: (e, r) => {
			if (t.predicate(e, r)) return n = [...r], "stop";
		},
		getChildren: t.getChildren
	}), n;
}
function ui(e, t) {
	let n = t.initialResult;
	return Oi(e, {
		...t,
		onEnter: (e, r) => {
			n = t.nextResult(n, e, r);
		}
	}), n;
}
function di(e, t) {
	return ui(e, {
		...t,
		initialResult: [],
		nextResult: (e, n, r) => (e.push(...t.transform(n, r)), e)
	});
}
function fi(e, t) {
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
function pi(e, t) {
	let n = [], r = 0, i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
	return Oi(e, {
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
function mi(e, t) {
	return {
		type: "insert",
		index: e,
		nodes: t
	};
}
function hi(e) {
	return {
		type: "remove",
		indexes: e
	};
}
function gi() {
	return { type: "replace" };
}
function _i(e) {
	return [e.slice(0, -1), e[e.length - 1]];
}
function vi(e, t, n = /* @__PURE__ */ new Map()) {
	let [r, i] = _i(e);
	for (let e = r.length - 1; e >= 0; e--) {
		let t = r.slice(0, e).join();
		n.get(t)?.type !== "remove" && n.set(t, gi());
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
		default: n.set(r.join(), mi(i, t));
	}
	return n;
}
function yi(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
	for (let t of e) {
		let e = t.slice(0, -1).join(), r = n.get(e) ?? [];
		r.push(t[t.length - 1]), n.set(e, r.sort((e, t) => e - t));
	}
	for (let n of e) for (let e = n.length - 2; e >= 0; e--) {
		let r = n.slice(0, e).join();
		t.has(r) || t.set(r, gi());
	}
	for (let [e, r] of n) t.set(e, hi(r));
	return t;
}
function bi(e, t) {
	let n = /* @__PURE__ */ new Map(), [r, i] = _i(e);
	for (let e = r.length - 1; e >= 0; e--) {
		let t = r.slice(0, e).join();
		n.set(t, gi());
	}
	return n.set(r.join(), {
		type: "removeThenInsert",
		removeIndexes: [i],
		insertIndex: i,
		insertNodes: [t]
	}), n;
}
function xi(e, t, n) {
	return Ci(e, {
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
					return n.create(e, Si(t, a, 0, ...o.insertNodes), i);
				case "insert": return n.create(e, Si(r, o.index, 0, ...o.nodes), i);
				case "replace": return n.create(e, r, i);
				default: return e;
			}
		}
	});
}
function Si(e, t, n, ...r) {
	return [
		...e.slice(0, t),
		...r,
		...e.slice(t + n)
	];
}
function Ci(e, t) {
	let n = {};
	return Oi(e, {
		...t,
		onLeave: (e, r) => {
			let i = [0, ...r], a = i.join(), o = t.transform(e, n[a] ?? [], r), s = i.slice(0, -1).join(), c = n[s] ?? [];
			c.push(o), n[s] = c;
		}
	}), n[""][0];
}
function wi(e, t) {
	let { nodes: n, at: r } = t;
	if (r.length === 0) throw Error("Can't insert nodes at the root");
	return xi(e, vi(r, n), t);
}
function Ti(e, t) {
	return t.at.length === 0 ? t.node : xi(e, bi(t.at, t.node), t);
}
function Ei(e, t) {
	if (t.indexPaths.length === 0) return e;
	for (let e of t.indexPaths) if (e.length === 0) throw Error("Can't remove the root node");
	return xi(e, yi(t.indexPaths), t);
}
function Di(e, t) {
	if (t.indexPaths.length === 0) return e;
	for (let e of t.indexPaths) if (e.length === 0) throw Error("Can't move the root node");
	if (t.to.length === 0) throw Error("Can't move nodes to the root");
	let n = ii(t.indexPaths), r = n.map((n) => ri(e, n, t));
	return xi(e, vi(t.to, r, yi(n)), t);
}
function Oi(e, t) {
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
var ki = class e {
	constructor(t) {
		$(this, "options", t), $(this, "rootNode"), $(this, "isEqual", (e) => Ze(this.rootNode, e.rootNode)), $(this, "getNodeChildren", (e) => this.options.nodeToChildren?.(e) ?? Ai.nodeToChildren(e) ?? []), $(this, "resolveIndexPath", (e) => typeof e == "string" ? this.getIndexPath(e) : e), $(this, "resolveNode", (e) => {
			let t = this.resolveIndexPath(e);
			return t ? this.at(t) : void 0;
		}), $(this, "getNodeChildrenCount", (e) => this.options.nodeToChildrenCount?.(e) ?? Ai.nodeToChildrenCount(e)), $(this, "getNodeValue", (e) => this.options.nodeToValue?.(e) ?? Ai.nodeToValue(e)), $(this, "getNodeDisabled", (e) => this.options.isNodeDisabled?.(e) ?? Ai.isNodeDisabled(e)), $(this, "stringify", (e) => {
			let t = this.findNode(e);
			return t ? this.stringifyNode(t) : null;
		}), $(this, "stringifyNode", (e) => this.options.nodeToString?.(e) ?? Ai.nodeToString(e)), $(this, "getFirstNode", (e = this.rootNode, t = {}) => {
			let n;
			return Oi(e, {
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
			return Oi(e, {
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
		}), $(this, "at", (e) => ri(this.rootNode, e, { getChildren: this.getNodeChildren })), $(this, "findNode", (e, t = this.rootNode) => si(t, {
			getChildren: this.getNodeChildren,
			predicate: (t) => this.getNodeValue(t) === e
		})), $(this, "findNodes", (e, t = this.rootNode) => {
			let n = new Set(e.filter((e) => e != null));
			return ci(t, {
				getChildren: this.getNodeChildren,
				predicate: (e) => n.has(this.getNodeValue(e))
			});
		}), $(this, "sort", (e) => e.reduce((e, t) => {
			let n = this.getIndexPath(t);
			return n && e.push({
				value: t,
				indexPath: n
			}), e;
		}, []).sort((e, t) => ai(e.indexPath, t.indexPath)).map(({ value: e }) => e)), $(this, "getValue", (e) => {
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
		}), $(this, "getDepth", (e) => li(this.rootNode, {
			getChildren: this.getNodeChildren,
			predicate: (t) => this.getNodeValue(t) === e
		})?.length ?? 0), $(this, "isSameNode", (e, t) => this.getNodeValue(e) === this.getNodeValue(t)), $(this, "isRootNode", (e) => this.isSameNode(e, this.rootNode)), $(this, "contains", (e, t) => !e || !t ? !1 : t.slice(0, e.length).every((n, r) => e[r] === t[r])), $(this, "getNextNode", (e, t = {}) => {
			let n = !1, r;
			return Oi(this.rootNode, {
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
			return Oi(this.rootNode, {
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
			return Oi(n, {
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
			Oi(this.rootNode, {
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
		}), $(this, "getValues", (e = this.rootNode) => di(e, {
			getChildren: this.getNodeChildren,
			transform: (e) => [this.getNodeValue(e)]
		}).slice(1)), $(this, "isValidDepth", (e, t) => t == null ? !0 : typeof t == "function" ? t(e.length) : e.length === t), $(this, "isBranchNode", (e) => this.getNodeChildren(e).length > 0 || this.getNodeChildrenCount(e) != null), $(this, "getBranchValues", (e = this.rootNode, t = {}) => {
			let n = [];
			return Oi(e, {
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
		}), $(this, "flatten", (e = this.rootNode) => pi(e, { getChildren: this.getNodeChildren })), $(this, "_create", (e, t) => this.getNodeChildren(e).length > 0 || t.length > 0 ? {
			...e,
			children: t
		} : { ...e }), $(this, "_insert", (e, t, n) => this.copy(wi(e, {
			at: t,
			nodes: n,
			getChildren: this.getNodeChildren,
			create: this._create
		}))), $(this, "copy", (t) => new e({
			...this.options,
			rootNode: t
		})), $(this, "_replace", (e, t, n) => this.copy(Ti(e, {
			at: t,
			node: n,
			getChildren: this.getNodeChildren,
			create: this._create
		}))), $(this, "_move", (e, t, n) => this.copy(Di(e, {
			indexPaths: t,
			to: n,
			getChildren: this.getNodeChildren,
			create: this._create
		}))), $(this, "_remove", (e, t) => this.copy(Ei(e, {
			indexPaths: t,
			getChildren: this.getNodeChildren,
			create: this._create
		}))), $(this, "replace", (e, t) => this._replace(this.rootNode, e, t)), $(this, "remove", (e) => this._remove(this.rootNode, e)), $(this, "insertBefore", (e, t) => this.getParentNode(e) ? this._insert(this.rootNode, e, t) : void 0), $(this, "insertAfter", (e, t) => {
			if (!this.getParentNode(e)) return;
			let n = [...e.slice(0, -1), e[e.length - 1] + 1];
			return this._insert(this.rootNode, n, t);
		}), $(this, "move", (e, t) => this._move(this.rootNode, e, t)), $(this, "filter", (e) => {
			let t = fi(this.rootNode, {
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
		return li(this.rootNode, {
			getChildren: this.getNodeChildren,
			predicate: (t) => this.getNodeValue(t) === e
		});
	}
}, Ai = {
	nodeToValue(e) {
		return typeof e == "string" ? e : gt(e) && wt(e, "value") ? e.value : "";
	},
	nodeToString(e) {
		return typeof e == "string" ? e : gt(e) && wt(e, "label") ? e.label : Ai.nodeToValue(e);
	},
	isNodeDisabled(e) {
		return gt(e) && wt(e, "disabled") ? !!e.disabled : !1;
	},
	nodeToChildren(e) {
		return e.children;
	},
	nodeToChildrenCount(e) {
		if (gt(e) && wt(e, "childrenCount")) return e.childrenCount;
	}
}, ji = (e) => new Yr(e), Mi = (e) => new ki(e);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/memo.mjs
function Ni(e, t, n) {
	let r = [], i;
	return (a) => {
		let o = e(a);
		return o.length !== r.length || o.some((e, t) => !Ze(r[t], e)) ? (r = o, i = t(o, a), n?.onChange?.(i), i) : i;
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/caret.mjs
function Pi(e) {
	if (e) try {
		if (e.ownerDocument.activeElement !== e) return;
		let t = e.value.length;
		e.setSelectionRange(t, t);
	} catch {}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/data-url.mjs
function Fi(e, t) {
	let { type: n, quality: r = .92, background: i, size: a } = t;
	if (!e) throw Error("[zag-js > getDataUrl]: Could not find the svg element");
	let o = vt(e), s = o.document, c = a ?? e.getBoundingClientRect(), l = e.cloneNode(!0);
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
function Ii(e, t) {
	let { type: n = "HTMLInputElement", property: r = "value" } = t, i = vt(e)[n].prototype;
	return Object.getOwnPropertyDescriptor(i, r) ?? {};
}
function Li(e) {
	if (e.localName === "input") return "HTMLInputElement";
	if (e.localName === "textarea") return "HTMLTextAreaElement";
	if (e.localName === "select") return "HTMLSelectElement";
}
function Ri(e, t, n = "value") {
	if (!e) return;
	let r = Li(e);
	r && Ii(e, {
		type: r,
		property: n
	}).set?.call(e, t), e.setAttribute(n, t);
}
function zi(e) {
	return e.matches("textarea, input, select, button");
}
function Bi(e, t) {
	if (!e) return;
	let n = zi(e) ? e.form : e.closest("form"), r = (e) => {
		e.defaultPrevented || t();
	};
	return n?.addEventListener("reset", r, { passive: !0 }), () => n?.removeEventListener("reset", r);
}
function Vi(e, t) {
	let n = e?.closest("fieldset");
	if (!n) return;
	t(n.disabled);
	let r = new (vt(n)).MutationObserver(() => t(n.disabled));
	return r.observe(n, {
		attributes: !0,
		attributeFilter: ["disabled"]
	}), () => r.disconnect();
}
function Hi(e, t) {
	if (!e) return;
	let { onFieldsetDisabledChange: n, onFormReset: r } = t, i = [Bi(e, r), Vi(e, n)];
	return () => i.forEach((e) => e?.());
}
var Ui = /* @__PURE__ */ Symbol.for("zag.changeEvent");
function Wi(e) {
	return Object.prototype.hasOwnProperty.call(e, Ui);
}
function Gi(e) {
	return Wi(e) || Object.defineProperty(e, Ui, { value: !0 }), e;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/mutation-observer.mjs
function Ki(e, t) {
	if (!e) return;
	let { attributes: n, callback: r } = t, i = new (e.ownerDocument.defaultView || window).MutationObserver((e) => {
		for (let t of e) t.type === "attributes" && t.attributeName && n.includes(t.attributeName) && r(t);
	});
	return i.observe(e, {
		attributes: !0,
		attributeFilter: n
	}), () => i.disconnect();
}
function qi(e, t) {
	let { defer: n } = t, r = n ? Mt : (e) => e(), i = [];
	return i.push(r(() => {
		let n = typeof e == "function" ? e() : e;
		i.push(Ki(n, t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
function Ji(e, t) {
	let { callback: n } = t;
	if (!e) return;
	let r = new (e.ownerDocument.defaultView || window).MutationObserver(n);
	return r.observe(e, {
		childList: !0,
		subtree: !0
	}), () => r.disconnect();
}
function Yi(e, t) {
	let { defer: n } = t, r = n ? Mt : (e) => e(), i = [];
	return i.push(r(() => {
		let n = typeof e == "function" ? e() : e;
		i.push(Ji(n, t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/navigate.mjs
function Xi(e) {
	let t = () => {
		let t = vt(e);
		e.dispatchEvent(new t.MouseEvent("click"));
	};
	Ft() ? Vt(e, "keyup", t) : queueMicrotask(t);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/point.mjs
function Zi(e, t) {
	let { left: n, top: r, width: i, height: a } = t.getBoundingClientRect(), o = {
		x: e.x - n,
		y: e.y - r
	}, s = {
		x: Ue(o.x / i),
		y: Ue(o.y / a)
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
function Qi(e, t) {
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
	let s = [At(e, "pointerlockchange", a, !1), At(e, "pointerlockerror", o, !1)];
	return () => {
		s.forEach((e) => e()), e.exitPointerLock();
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/resize-observer.mjs
function $i(e) {
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
			let o = vt(n);
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
var ea = /* @__PURE__ */ $i({ box: "border-box" });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/scroll.mjs
function ta(e) {
	return e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth;
}
function na(e, t) {
	let { rootEl: n, ...r } = t || {};
	e && n && Wn(n) && ta(n) && e.scrollIntoView(r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/searchable.mjs
var ra = (e) => e.split("").map((e) => {
	let t = e.charCodeAt(0);
	return t > 0 && t < 128 ? e : t >= 128 && t <= 255 ? `/x${t.toString(16)}`.replace("/", "\\") : "";
}).join("").trim(), ia = (e) => ra(e.dataset?.valuetext ?? e.textContent ?? ""), aa = (e, t) => e.trim().toLowerCase().startsWith(t.toLowerCase());
function oa(e, t, n, r = On) {
	let i = n ? Tn(e, n, r) : -1, a = n ? Xt(e, i) : e;
	return t.length === 1 && (a = a.filter((e) => r(e) !== n)), a.find((e) => aa(ia(e), t));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/typeahead.mjs
function sa(e, t) {
	let { state: n, activeId: r, key: i, timeout: a = 350, itemToId: o } = t, s = n.keysSoFar + i, c = s.length > 1 && Array.from(s).every((e) => e === s[0]) ? s[0] : s, l = oa(e.slice(), c, r, o);
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
var ca = /* @__PURE__ */ Object.assign(sa, {
	defaultOptions: {
		keysSoFar: "",
		timer: -1
	},
	isValidEvent: la
});
function la(e) {
	return e.key.length === 1 && !e.ctrlKey && !e.metaKey;
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/use-combobox-context.js
var [ua, da] = Zt({
	name: "ComboboxContext",
	hookName: "useComboboxContext",
	providerName: "<ComboboxProvider />"
}), fa = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function pa(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, fa), a = da(), s = qn(), c = G(() => Q(a().getContentProps(), s().getPresenceProps(), i));
	function l(e) {
		s().setNode(e);
	}
	var u = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	}, d = D(), f = R(d), p = (e) => {
		X(e, q({ as: "div" }, () => B(c), {
			[o()]: l,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, m = G(() => !s().unmounted);
	return w(f, (e) => {
		B(m) && e(p);
	}), T(e, d), g(u);
}
N(pa, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+combobox@1.43.3/node_modules/@zag-js/combobox/dist/combobox.anatomy.mjs
var ma = xt("combobox").parts("root", "clearTrigger", "content", "control", "input", "item", "itemGroup", "itemGroupLabel", "itemIndicator", "itemText", "label", "list", "positioner", "trigger"), ha = ma.build(), ga = (e) => new Yr(e);
ga.empty = () => new Yr({ items: [] });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+focus-visible@1.43.3/node_modules/@zag-js/focus-visible/dist/index.mjs
function _a(e) {
	return !(e.metaKey || !it() && e.altKey || e.ctrlKey || e.key === "Control" || e.key === "Shift" || e.key === "Meta");
}
var va = /* @__PURE__ */ new Set([
	"checkbox",
	"radio",
	"range",
	"color",
	"file",
	"image",
	"button",
	"submit",
	"reset"
]), ya = [
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
function ba(e, t, n) {
	let r = n ? Ct(n) : null, i = dt(r), a = vt(r), o = nt(i);
	return e = e || o instanceof a.HTMLInputElement && !va.has(o?.type) || o instanceof a.HTMLTextAreaElement || o instanceof a.HTMLElement && o.isContentEditable, !(e && t === "keyboard" && n instanceof a.KeyboardEvent && !Reflect.has(Oa, n.key));
}
var xa = null, Sa = /* @__PURE__ */ new Set(), Ca = /* @__PURE__ */ new Map(), wa = !1, Ta = null, Ea = !1, Da = null, Oa = {
	Tab: !0,
	Escape: !0
};
function ka(e, t) {
	for (let n of Sa) n(e, t);
}
function Aa(e) {
	Ta = null, wa = !0, _a(e) && (xa = "keyboard", ka("keyboard", e));
}
function ja(e) {
	(e.type !== "pointermove" && e.type !== "mousemove" || Da?.x !== e.clientX || Da?.y !== e.clientY) && (Da = {
		x: e.clientX,
		y: e.clientY
	}, xa = "pointer", (e.type === "mousedown" || e.type === "pointerdown") && (Ta = null, wa = !0, ka("pointer", e)));
}
function Ma(e) {
	if (Lt(e)) {
		Ta = null, wa = !0, xa = "virtual";
		return;
	}
	Ta = null;
	let t = Ct(e), n = t?.closest("label"), r = n?.control;
	if (!n || !r || r.matches(":disabled")) return;
	let i = t?.closest(ya);
	i && n.contains(i) && i !== r || r !== nt(n.ownerDocument) && (Ta = r);
}
function Na(e) {
	let t = Ct(e), n = t === Ta;
	t !== vt(t) && t !== dt(t) && e.isTrusted && (!wa && !n && !Ea && (xa = "virtual", ka("virtual", e)), wa = !1, Ta = null, Ea = !1);
}
function Pa() {
	wa = !1, Ta = null, Ea = !0;
}
function Fa(e) {
	if (typeof window > "u" || Ca.get(vt(e))) return;
	let t = vt(e), n = dt(e), r = t.HTMLElement.prototype.focus;
	function i() {
		wa = !0, r.apply(this, arguments);
	}
	try {
		Object.defineProperty(t.HTMLElement.prototype, "focus", {
			configurable: !0,
			value: i
		});
	} catch {}
	n.addEventListener("keydown", Aa, !0), n.addEventListener("keyup", Aa, !0), n.addEventListener("click", Ma, !0), t.addEventListener("focus", Na, !0), t.addEventListener("blur", Pa, !1), t.PointerEvent === void 0 ? (n.addEventListener("mousedown", ja, !0), n.addEventListener("mousemove", ja, !0), n.addEventListener("mouseup", ja, !0)) : (n.addEventListener("pointerdown", ja, !0), n.addEventListener("pointermove", ja, !0), n.addEventListener("pointerup", ja, !0)), t.addEventListener("beforeunload", () => {
		Ia(e);
	}, { once: !0 }), Ca.set(t, { focus: r });
}
var Ia = (e, t) => {
	let n = vt(e), r = dt(e);
	t && r.removeEventListener("DOMContentLoaded", t);
	let i = Ca.get(n);
	if (i) {
		try {
			Object.defineProperty(n.HTMLElement.prototype, "focus", {
				configurable: !0,
				value: i.focus
			});
		} catch {}
		r.removeEventListener("keydown", Aa, !0), r.removeEventListener("keyup", Aa, !0), r.removeEventListener("click", Ma, !0), n.removeEventListener("focus", Na, !0), n.removeEventListener("blur", Pa, !1), n.PointerEvent === void 0 ? (r.removeEventListener("mousedown", ja, !0), r.removeEventListener("mousemove", ja, !0), r.removeEventListener("mouseup", ja, !0)) : (r.removeEventListener("pointerdown", ja, !0), r.removeEventListener("pointermove", ja, !0), r.removeEventListener("pointerup", ja, !0)), Ca.delete(n);
	}
};
function La() {
	return xa;
}
function Ra(e) {
	xa = e, ka(e, null);
}
function za() {
	return xa === "keyboard" || xa === "virtual";
}
function Ba(e = {}) {
	let { isTextInput: t, autoFocus: n, onChange: r, root: i } = e;
	Fa(i), r?.({
		isFocusVisible: n || za(),
		modality: xa
	});
	let a = (e, n) => {
		ba(!!t, e, n) && r?.({
			isFocusVisible: za(),
			modality: e
		});
	};
	return Sa.add(a), () => {
		Sa.delete(a);
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+combobox@1.43.3/node_modules/@zag-js/combobox/dist/combobox.dom.mjs
var Va = (e) => e.ids?.root ?? `combobox:${e.id}`, Ha = (e) => e.ids?.label ?? `combobox:${e.id}:label`, Ua = (e) => e.ids?.control ?? `combobox:${e.id}:control`, Wa = (e) => e.ids?.input ?? `combobox:${e.id}:input`, Ga = (e) => e.ids?.content ?? `combobox:${e.id}:content`, Ka = (e) => e.ids?.positioner ?? `combobox:${e.id}:popper`, qa = (e) => e.ids?.trigger ?? `combobox:${e.id}:toggle-btn`, Ja = (e) => e.ids?.clearTrigger ?? `combobox:${e.id}:clear-btn`, Ya = (e, t) => e.ids?.itemGroup?.(t) ?? `combobox:${e.id}:optgroup:${t}`, Xa = (e, t) => e.ids?.itemGroupLabel?.(t) ?? `combobox:${e.id}:optgroup-label:${t}`, Za = (e, t) => e.ids?.item?.(t) ?? `combobox:${e.id}:option:${t}`, Qa = (e) => e.getById(Ga(e)), $a = (e) => e.getById(Wa(e)), eo = (e) => e.getById(Ka(e)), to = (e) => e.getById(Ua(e)), no = (e) => e.getById(qa(e)), ro = (e) => e.getById(Ja(e)), io = (e, t) => {
	if (t == null) return null;
	let n = `[role=option][data-value="${CSS.escape(t)}"]`;
	return kn(Qa(e), n);
}, ao = (e) => {
	let t = $a(e);
	e.isActiveElement(t) || t?.focus({ preventScroll: !0 }), Pi(t);
}, oo = (e) => {
	let t = no(e);
	e.isActiveElement(t) || t?.focus({ preventScroll: !0 });
}, so = {
	triggerLabel: "Toggle suggestions",
	clearTriggerLabel: "Clear value"
};
function co(e, t) {
	let { context: n, prop: r, state: i, send: a, scope: o, computed: s } = e, c = kt(so, r("translations")), l = r("collection"), u = !!r("disabled"), d = s("isInteractive"), f = !!r("invalid"), p = !!r("required"), m = !!r("readOnly"), h = i.hasTag("open"), g = i.hasTag("focused"), _ = r("composite"), v = n.get("highlightedValue"), y = n.get("currentPlacement"), b = y ? Me(y) : void 0, x = Fe({
		...r("positioning"),
		placement: y
	});
	function S(e) {
		let t = l.getItemDisabled(e.item), r = l.getItemValue(e.item);
		return Tt(r, () => `[zag-js] No value found for item ${JSON.stringify(e.item)}`), {
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
			$a(o)?.focus();
		},
		setOpen(e, t = "script") {
			i.hasTag("open") !== e && a({
				type: e ? "OPEN" : "CLOSE",
				src: t
			});
		},
		getRootProps() {
			return t.element({
				...ha.root.attrs,
				dir: r("dir"),
				id: Va(o),
				"data-invalid": Z(f),
				"data-readonly": Z(m)
			});
		},
		getLabelProps() {
			return t.label({
				...ha.label.attrs,
				dir: r("dir"),
				htmlFor: Wa(o),
				id: Ha(o),
				"data-readonly": Z(m),
				"data-disabled": Z(u),
				"data-invalid": Z(f),
				"data-required": Z(p),
				"data-focus": Z(g),
				onClick(e) {
					_ || (e.preventDefault(), no(o)?.focus({ preventScroll: !0 }));
				}
			});
		},
		getControlProps() {
			return t.element({
				...ha.control.attrs,
				dir: r("dir"),
				id: Ua(o),
				"data-state": h ? "open" : "closed",
				"data-focus": Z(g),
				"data-disabled": Z(u),
				"data-invalid": Z(f)
			});
		},
		getPositionerProps() {
			return t.element({
				...ha.positioner.attrs,
				dir: r("dir"),
				id: Ka(o),
				style: x.floating
			});
		},
		getInputProps() {
			return t.input({
				...ha.input.attrs,
				dir: r("dir"),
				"aria-invalid": ut(f),
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
				id: Wa(o),
				type: "text",
				role: "combobox",
				defaultValue: n.get("inputValue"),
				"aria-autocomplete": s("autoComplete") ? "both" : "list",
				"aria-controls": Ga(o),
				"aria-expanded": h,
				"data-state": h ? "open" : "closed",
				"aria-activedescendant": v ? Za(o, v) : void 0,
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
					if (e.defaultPrevented || !d || e.ctrlKey || e.shiftKey || pt(e)) return;
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
							let c = io(o, v);
							_t(c) && r("navigate")?.({
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
					}[bt(e, { dir: r("dir") })];
					i?.(e);
				}
			});
		},
		getTriggerProps(e = {}) {
			return t.button({
				...ha.trigger.attrs,
				dir: r("dir"),
				id: qa(o),
				"aria-haspopup": _ ? "listbox" : "dialog",
				type: "button",
				tabIndex: e.focusable ? void 0 : -1,
				"aria-label": c.triggerLabel,
				"aria-expanded": h,
				"data-state": h ? "open" : "closed",
				"aria-controls": h ? Ga(o) : void 0,
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
					e.defaultPrevented || d && ht(e) && a({
						type: "TRIGGER.CLICK",
						src: "trigger-click"
					});
				},
				onPointerDown(e) {
					d && e.pointerType !== "touch" && ht(e) && (e.preventDefault(), queueMicrotask(() => {
						ao(o);
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
					}[bt(e, { dir: r("dir") })];
					t && (t(e), e.preventDefault());
				}
			});
		},
		getContentProps() {
			return t.element({
				...ha.content.attrs,
				dir: r("dir"),
				id: Ga(o),
				role: _ ? "listbox" : "dialog",
				tabIndex: -1,
				hidden: !h,
				"data-state": h ? "open" : "closed",
				"data-placement": y,
				"data-side": b,
				"aria-labelledby": Ha(o),
				"aria-multiselectable": r("multiple") && _ ? !0 : void 0,
				"data-empty": Z(l.size === 0),
				onPointerDown(e) {
					ht(e) && e.preventDefault();
				}
			});
		},
		getListProps() {
			return t.element({
				...ha.list.attrs,
				role: _ ? void 0 : "listbox",
				"data-empty": Z(l.size === 0),
				"aria-labelledby": Ha(o),
				"aria-multiselectable": r("multiple") && !_ ? !0 : void 0
			});
		},
		getClearTriggerProps() {
			return t.button({
				...ha.clearTrigger.attrs,
				dir: r("dir"),
				id: Ja(o),
				type: "button",
				tabIndex: -1,
				disabled: u,
				"data-invalid": Z(f),
				"aria-label": c.clearTriggerLabel,
				"aria-controls": Wa(o),
				hidden: !n.get("value").length,
				onPointerDown(e) {
					ht(e) && e.preventDefault();
				},
				onClick(e) {
					e.defaultPrevented || d && a({
						type: "VALUE.CLEAR",
						src: "clear-trigger"
					});
				}
			});
		},
		getItemState: S,
		getItemProps(e) {
			let n = S(e), i = n.value;
			return t.element({
				...ha.item.attrs,
				dir: r("dir"),
				id: Za(o, i),
				role: "option",
				tabIndex: -1,
				"data-highlighted": Z(n.highlighted),
				"data-state": n.selected ? "checked" : "unchecked",
				"aria-selected": ut(n.selected),
				"aria-disabled": ut(n.disabled),
				"data-disabled": Z(n.disabled),
				"data-value": n.value,
				onPointerMove() {
					n.disabled || La() === "pointer" && (n.highlighted || a({
						type: "ITEM.POINTER_MOVE",
						value: i
					}));
				},
				onPointerLeave() {
					e.persistFocus || n.disabled || La() === "pointer" && a({
						type: "ITEM.POINTER_LEAVE",
						value: i
					});
				},
				onClick(e) {
					an(e) || Je(e) || Ke(e) || n.disabled || a({
						type: "ITEM.CLICK",
						src: "item-select",
						value: i
					});
				}
			});
		},
		getItemTextProps(e) {
			let n = S(e);
			return t.element({
				...ha.itemText.attrs,
				dir: r("dir"),
				"data-state": n.selected ? "checked" : "unchecked",
				"data-disabled": Z(n.disabled),
				"data-highlighted": Z(n.highlighted)
			});
		},
		getItemIndicatorProps(e) {
			let n = S(e);
			return t.element({
				"aria-hidden": !0,
				...ha.itemIndicator.attrs,
				dir: r("dir"),
				"data-state": n.selected ? "checked" : "unchecked",
				hidden: !n.selected
			});
		},
		getItemGroupProps(e) {
			let { id: n } = e;
			return t.element({
				...ha.itemGroup.attrs,
				dir: r("dir"),
				id: Ya(o, n),
				"aria-labelledby": Xa(o, n),
				"data-empty": Z(l.size === 0),
				role: "group"
			});
		},
		getItemGroupLabelProps(e) {
			let { htmlFor: n } = e;
			return t.element({
				...ha.itemGroupLabel.attrs,
				dir: r("dir"),
				id: Xa(o, n),
				role: "presentation"
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+live-region@1.43.3/node_modules/@zag-js/live-region/dist/index.mjs
var lo = "__live-region__", uo = "__live-region-debug__", fo = "position:fixed;inset-inline:0;bottom:0;z-index:2147483647;padding:12px 16px;background:black;color:white;font-size:14px;line-height:20px;text-align:center;pointer-events:none;";
function po(e = {}) {
	let { level: t = "polite", document: n = document, root: r, delay: i = 0, debug: a = !1 } = e, o = n.defaultView ?? window, s = r ?? n.body;
	function c() {
		if (!a) return;
		let e = n.getElementById(uo);
		return e || (e = n.createElement("div"), e.id = uo, e.dataset.liveAnnouncerDebug = "true", e.setAttribute("aria-hidden", "true"), e.style.cssText = fo, s.appendChild(e), e);
	}
	function l(e, r) {
		n.getElementById(lo)?.remove(), r ??= i;
		let a = n.createElement("span");
		a.id = lo, a.dataset.liveAnnouncer = "true";
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
		n.getElementById(lo)?.remove(), n.getElementById(uo)?.remove();
	}
	return {
		announce: l,
		destroy: u,
		toJSON() {
			return lo;
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+combobox@1.43.3/node_modules/@zag-js/combobox/dist/combobox.machine.mjs
var { guards: mo, createMachine: ho, choose: go } = Gt(), { and: _o, not: vo } = mo, yo = ho({
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
				Xi(e);
			},
			collection: ga.empty(),
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
				isEqual: Ze,
				hash(e) {
					return e.join(",");
				},
				onChange(t) {
					let r = n(), i = e("collection"), a = ti({
						values: t,
						collection: i,
						selectedItemMap: r.get("selectedItemMap")
					}), o = e("value") ?? t, s = o === t ? a : ti({
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
					t = jt(e("selectionBehavior"), {
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
			selectedItemMap: t(() => ({ defaultValue: ni({
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
		selectedItems: ({ context: e, prop: t }) => $r({
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
	entry: go([{
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
								guard: _o("isOpenControlled", "openOnChange"),
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
							guard: _o("isCustomValue", vo("allowCustomValue")),
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
								guard: _o("isOpenControlled", "autoComplete"),
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
								guard: _o("isOpenControlled", "autoComplete"),
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
						guard: _o("isOpenControlled", "isCustomValue", vo("hasHighlightedItem"), vo("allowCustomValue")),
						actions: ["revertInputValue", "invokeOnClose"]
					},
					{
						guard: _o("isCustomValue", vo("hasHighlightedItem"), vo("allowCustomValue")),
						target: "closed.focused",
						actions: ["revertInputValue", "invokeOnClose"]
					},
					{
						guard: _o("isOpenControlled", "closeOnSelect"),
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
						guard: _o("isOpenControlled", "closeOnSelect"),
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
						guard: _o("isOpenControlled", "isCustomValue", vo("allowCustomValue")),
						actions: ["revertInputValue", "invokeOnClose"]
					},
					{
						guard: _o("isCustomValue", vo("allowCustomValue")),
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
						guard: _o("autoComplete", "isLastItemHighlighted"),
						actions: ["clearHighlightedValue", "scrollContentToTop"]
					}, { actions: ["highlightNextItem"] }],
					"INPUT.ARROW_UP": [{
						guard: _o("autoComplete", "isFirstItemHighlighted"),
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
							guard: _o("isOpenControlled", "autoComplete"),
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
							guard: _o("isHighlightedItemRemoved", "hasCollectionItems", "autoHighlight"),
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
				return mt(n) ? n : !!n?.({ inputValue: t.get("inputValue") });
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
				return Ba({ root: e.getRootNode?.() });
			},
			trackDismissableLayer({ send: e, prop: t, scope: n }) {
				return t("disableLayer") ? void 0 : In(() => Qa(n), {
					type: "listbox",
					defer: !0,
					exclude: () => [
						$a(n),
						no(n),
						ro(n)
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
				let n = po({
					level: "assertive",
					document: t.getDoc()
				});
				return e.set("liveRegion", n), () => n.destroy();
			},
			trackPlacement({ context: e, prop: t, scope: n }) {
				return e.set("currentPlacement", t("positioning").placement), Ae(() => to(n) || no(n), () => eo(n), {
					...t("positioning"),
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			scrollToHighlightedItem({ context: e, prop: t, scope: n }) {
				let r = $a(n), i = [], a = (r) => {
					if (La() === "pointer") return;
					let a = e.get("highlightedValue");
					if (!a) return;
					let o = Qa(n), s = t("scrollToIndexFn");
					if (s) {
						s({
							index: t("collection").indexOf(a),
							immediate: r,
							getElement: () => io(n, a)
						});
						return;
					}
					let c = io(n, a), l = Mt(() => {
						na(c, {
							rootEl: o,
							block: "nearest"
						});
					});
					i.push(l);
				}, o = Mt(() => {
					Ra("virtual"), a(!0);
				});
				i.push(o);
				let s = qi(r, {
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
				Ae(() => to(n), () => eo(n), {
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
				let a = n("multiple") ? st(t.get("value"), i) : [i];
				n("onSelect")?.({
					value: a,
					itemValue: i
				}), t.set("value", a);
				let o = jt(n("selectionBehavior"), {
					preserve: t.get("inputValue"),
					replace: r.stringifyMany(a),
					clear: ""
				});
				t.set("inputValue", o);
			},
			scrollToHighlightedItem({ context: e, prop: t, scope: n }) {
				Kt(() => {
					let r = e.get("highlightedValue");
					if (r == null) return;
					let i = io(n, r), a = Qa(n), o = t("scrollToIndexFn");
					if (o) {
						o({
							index: t("collection").indexOf(r),
							immediate: !0,
							getElement: () => io(n, r)
						});
						return;
					}
					na(i, {
						rootEl: a,
						block: "nearest"
					});
				});
			},
			selectItem(e) {
				let { context: t, event: n, flush: r, prop: i } = e;
				n.value != null && r(() => {
					let e = i("multiple") ? st(t.get("value"), n.value) : [n.value];
					i("onSelect")?.({
						value: e,
						itemValue: n.value
					}), t.set("value", e);
					let r = jt(i("selectionBehavior"), {
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
					let e = rt(t.get("value"), n.value);
					t.set("value", e);
					let r = jt(i("selectionBehavior"), {
						preserve: t.get("inputValue"),
						replace: i("collection").stringifyMany(e),
						clear: ""
					});
					t.set("inputValue", r);
				});
			},
			setInitialFocus({ scope: e }) {
				Mt(() => {
					ao(e);
				});
			},
			setFinalFocus({ scope: e }) {
				Mt(() => {
					no(e)?.dataset.focusable == null ? ao(e) : oo(e);
				});
			},
			syncInputValue({ context: e, scope: t, event: n }) {
				let r = $a(t);
				r && (r.value = e.get("inputValue"), queueMicrotask(() => {
					n.current().type !== "INPUT.CHANGE" && Pi(r);
				}));
			},
			setInputValue({ context: e, event: t }) {
				e.set("inputValue", t.value);
			},
			clearInputValue({ context: e }) {
				e.set("inputValue", "");
			},
			revertInputValue({ context: e, prop: t, computed: n }) {
				let r = t("selectionBehavior"), i = jt(r, {
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
					let e = jt(i("selectionBehavior"), {
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
					let e = jt(r("selectionBehavior"), {
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
						getElement: () => io(t, r)
					});
				} else {
					let e = Qa(t);
					if (!e) return;
					e.scrollTop = 0;
				}
			},
			invokeOnOpen({ prop: e, event: t, context: n }) {
				let r = bo(t);
				e("onOpenChange")?.({
					open: !0,
					reason: r,
					value: n.get("value")
				});
			},
			invokeOnClose({ prop: e, event: t, context: n }) {
				let r = bo(t);
				e("onOpenChange")?.({
					open: !1,
					reason: r,
					value: n.get("value")
				});
			},
			highlightFirstItem({ context: e, prop: t, scope: n }) {
				(Qa(n) ? queueMicrotask : Mt)(() => {
					let n = t("collection").firstValue;
					n && e.set("highlightedValue", n);
				});
			},
			highlightFirstItemIfNeeded({ computed: e, action: t }) {
				e("autoHighlight") && t(["highlightFirstItem"]);
			},
			highlightLastItem({ context: e, prop: t, scope: n }) {
				(Qa(n) ? queueMicrotask : Mt)(() => {
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
				Mt(() => {
					let [n] = t("collection").sort(e.get("value"));
					n && e.set("highlightedValue", n);
				});
			},
			highlightFirstOrSelectedItem({ context: e, prop: t, computed: n }) {
				Mt(() => {
					let r = null;
					r = n("hasSelectedItems") ? t("collection").sort(e.get("value"))[0] : t("collection").firstValue, r && e.set("highlightedValue", r);
				});
			},
			highlightLastOrSelectedItem({ context: e, prop: t, computed: n }) {
				Mt(() => {
					let r = t("collection"), i = null;
					i = n("hasSelectedItems") ? r.sort(e.get("value"))[0] : r.lastValue, i && e.set("highlightedValue", i);
				});
			},
			autofillInputValue({ context: e, computed: t, prop: n, event: r, scope: i }) {
				let a = $a(i), o = n("collection");
				if (!t("autoComplete") || !a || !r.keypress) return;
				let s = o.stringify(e.get("highlightedValue"));
				Mt(() => {
					a.value = s || e.get("inputValue");
				});
			},
			syncSelectedItems(e) {
				queueMicrotask(() => {
					let { context: t, prop: n } = e, r = n("collection"), i = t.get("value"), a = ti({
						values: i,
						collection: r,
						selectedItemMap: t.get("selectedItemMap")
					});
					t.set("selectedItemMap", a.nextSelectedItemMap);
					let o = jt(n("selectionBehavior"), {
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
				if (!We()) return;
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
function bo(e) {
	return (e.previousEvent || e).src;
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox.anatomy.js
var xo = ma.extendWith("empty"), So = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Co(e, t) {
	I(t, !0);
	let n = xo.build(), i = O(t, "ref", 15, null), a = W(t, So), o = da(), s = G(() => o().collection.size === 0);
	var c = {
		get ref() {
			return i();
		},
		set ref(e = null) {
			i(e), r();
		}
	}, l = D(), u = R(l), d = (e) => {
		X(e, q({ as: "div" }, () => n.empty.attrs, () => a, {
			role: "presentation",
			get ref() {
				return i();
			},
			set ref(e) {
				i(e);
			}
		}));
	};
	return w(u, (e) => {
		B(s) && e(d);
	}), T(e, l), g(c);
}
N(Co, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox-control.svelte
var wo = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function To(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, wo), a = da(), o = G(() => Q(a().getControlProps(), i));
	return X(e, q({ as: "div" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(To, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox-input.svelte
var Eo = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Do(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, Eo), a = da(), o = G(() => Q(a().getInputProps(), i));
	return X(e, q({ as: "input" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(Do, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/use-combobox-item-context.js
var [Oo, ko] = Zt({
	name: "ComboboxItemContext",
	hookName: "useComboboxItemContext",
	providerName: "<ComboboxItemProvider />"
}), [Ao, jo] = Zt({
	name: "ComboboxItemPropsContext",
	hookName: "useComboboxItemPropsContext",
	providerName: "<ComboboxItemPropsProvider />"
}), Mo = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function No(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, Mo), a = G(() => Wt()(i, ["item", "persistFocus"])), o = G(() => f(B(a), 2)), s = G(() => B(o)[0]), c = G(() => B(o)[1]), l = da(), u = G(() => l().getItemState(B(s))), d = G(() => Q(l().getItemProps(B(s)), B(c)));
	return Oo(() => B(u)), Ao(() => B(s)), X(e, q({ as: "div" }, () => B(d), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(No, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox-positioner.svelte
var Po = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Fo(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, Po), a = da(), o = qn(), s = G(() => Q(a().getPositionerProps(), i));
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	}, l = D(), u = R(l), d = (e) => {
		X(e, q({ as: "div" }, () => B(s), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = G(() => !o().unmounted);
	return w(u, (e) => {
		B(f) && e(d);
	}), T(e, l), g(c);
}
N(Fo, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+i18n-utils@1.43.3/node_modules/@zag-js/i18n-utils/dist/is-rtl.mjs
var Io = /* @__PURE__ */ new Set([
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
]), Lo = /* @__PURE__ */ new Set([
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
function Ro(e) {
	if (Intl.Locale) {
		let t = new Intl.Locale(e).maximize().script ?? "";
		return Io.has(t);
	}
	let t = e.split("-")[0];
	return Lo.has(t);
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/providers/locale/locale-provider.svelte
function zo(e, t) {
	I(t, !0);
	let n = O(t, "locale", 7), i = O(t, "children", 7), a = G(() => ({
		locale: n(),
		dir: Ro(n()) ? "rtl" : "ltr"
	}));
	$t(() => B(a));
	var o = {
		get locale() {
			return n();
		},
		set locale(e) {
			n(e), r();
		},
		get children() {
			return i();
		},
		set children(e) {
			i(e), r();
		}
	}, s = D(), c = R(s);
	return u(c, () => i() ?? l), T(e, s), g(o);
}
N(zo, {
	locale: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/utils.mjs
function Bo(e, t) {
	return e - t * Math.floor(e / t);
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/calendars/GregorianCalendar.mjs
var Vo = 1721426;
function Ho(e, t, n, r) {
	t = Wo(e, t);
	let i = t - 1, a = -2;
	return n <= 2 ? a = 0 : Uo(t) && (a = -1), 1721425 + 365 * i + Math.floor(i / 4) - Math.floor(i / 100) + Math.floor(i / 400) + Math.floor((367 * n - 362) / 12 + a + r);
}
function Uo(e) {
	return e % 4 == 0 && (e % 100 != 0 || e % 400 == 0);
}
function Wo(e, t) {
	return e === "BC" ? 1 - t : t;
}
function Go(e) {
	let t = "AD";
	return e <= 0 && (t = "BC", e = 1 - e), [t, e];
}
var Ko = {
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
}, qo = class {
	fromJulianDay(e) {
		let t = e, n = t - Vo, r = Math.floor(n / 146097), i = Bo(n, 146097), a = Math.floor(i / 36524), o = Bo(i, 36524), s = Math.floor(o / 1461), c = Bo(o, 1461), l = Math.floor(c / 365), [u, d] = Go(r * 400 + a * 100 + s * 4 + l + +(a !== 4 && l !== 4)), f = t - Ho(u, d, 1, 1), p = 2;
		t < Ho(u, d, 3, 1) ? p = 0 : Uo(d) && (p = 1);
		let m = Math.floor(((f + p) * 12 + 373) / 367);
		return new wc(u, d, m, t - Ho(u, d, m, 1) + 1);
	}
	toJulianDay(e) {
		return Ho(e.era, e.year, e.month, e.day);
	}
	getDaysInMonth(e) {
		return Ko[Uo(e.year) ? "leapyear" : "standard"][e.month - 1];
	}
	getMonthsInYear(e) {
		return 12;
	}
	getDaysInYear(e) {
		return Uo(e.year) ? 366 : 365;
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
}, Jo = {
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
function Yo(e, t) {
	return t = Hs(t, e.calendar), e.era === t.era && e.year === t.year && e.month === t.month && e.day === t.day;
}
function Xo(e, t) {
	return t = Hs(t, e.calendar), e = ms(e), t = ms(t), e.era === t.era && e.year === t.year && e.month === t.month;
}
function Zo(e, t) {
	return t = Hs(t, e.calendar), e = gs(e), t = gs(t), e.era === t.era && e.year === t.year;
}
function Qo(e, t) {
	return ts(e.calendar, t.calendar) && Yo(e, t);
}
function $o(e, t) {
	return ts(e.calendar, t.calendar) && Xo(e, t);
}
function es(e, t) {
	return ts(e.calendar, t.calendar) && Zo(e, t);
}
function ts(e, t) {
	return e.isEqual?.(t) ?? t.isEqual?.(e) ?? e.identifier === t.identifier;
}
function ns(e, t) {
	return Yo(e, os(t));
}
var rs = {
	sun: 0,
	mon: 1,
	tue: 2,
	wed: 3,
	thu: 4,
	fri: 5,
	sat: 6
};
function is(e, t, n) {
	let r = e.calendar.toJulianDay(e), i = n ? rs[n] : Cs(t), a = Math.ceil(r + 1 - i) % 7;
	return a < 0 && (a += 7), a;
}
function as(e) {
	return zs(Date.now(), e);
}
function os(e) {
	return Bs(as(e));
}
function ss(e, t) {
	return e.calendar.toJulianDay(e) - t.calendar.toJulianDay(t);
}
function cs(e, t) {
	return ls(e) - ls(t);
}
function ls(e) {
	return e.hour * 36e5 + e.minute * 6e4 + e.second * 1e3 + e.millisecond;
}
var us = null, ds = !1;
function fs() {
	return us ??= new Intl.DateTimeFormat().resolvedOptions().timeZone, us;
}
function ps() {
	return ds;
}
function ms(e) {
	return e.subtract({ days: e.day - 1 });
}
function hs(e) {
	return e.add({ days: e.calendar.getDaysInMonth(e) - e.day });
}
function gs(e) {
	return ms(e.subtract({ months: e.month - 1 }));
}
function _s(e) {
	return hs(e.add({ months: e.calendar.getMonthsInYear(e) - e.month }));
}
function vs(e, t, n) {
	let r = is(e, t, n);
	return e.subtract({ days: r });
}
function ys(e, t, n) {
	return vs(e, t, n).add({ days: 6 });
}
var bs = /* @__PURE__ */ new Map(), xs = /* @__PURE__ */ new Map();
function Ss(e) {
	if (Intl.Locale) {
		let t = bs.get(e);
		return t || (t = new Intl.Locale(e).maximize().region, t && bs.set(e, t)), t;
	}
	let t = e.split("-")[1];
	return t === "u" ? void 0 : t;
}
function Cs(e) {
	let t = xs.get(e);
	if (!t) {
		if (Intl.Locale) {
			let n = new Intl.Locale(e);
			if ("getWeekInfo" in n && (t = n.getWeekInfo(), t)) return xs.set(e, t), t.firstDay;
		}
		let n = Ss(e);
		if (e.includes("-fw-")) {
			let n = e.split("-fw-")[1].split("-")[0];
			t = n === "mon" ? { firstDay: 1 } : n === "tue" ? { firstDay: 2 } : n === "wed" ? { firstDay: 3 } : n === "thu" ? { firstDay: 4 } : n === "fri" ? { firstDay: 5 } : n === "sat" ? { firstDay: 6 } : { firstDay: 0 };
		} else t = e.includes("-ca-iso8601") ? { firstDay: 1 } : { firstDay: n && Jo[n] || 0 };
		xs.set(e, t);
	}
	return t.firstDay;
}
function ws(e, t, n) {
	let r = e.calendar.getDaysInMonth(e);
	return Math.ceil((is(ms(e), t, n) + r) / 7);
}
function Ts(e, t) {
	return e && t ? e.compare(t) <= 0 ? e : t : e || t;
}
function Es(e, t) {
	return e && t ? e.compare(t) >= 0 ? e : t : e || t;
}
var Ds = {
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
function Os(e, t) {
	let n = e.calendar.toJulianDay(e), r = Math.ceil(n + 1) % 7;
	r < 0 && (r += 7);
	let [i, a] = Ds[Ss(t)] || [6, 0];
	return r === i || r === a;
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/conversion.mjs
function ks(e) {
	return e = Hs(e, new qo()), As(Wo(e.era, e.year), e.month, e.day, e.hour, e.minute, e.second, e.millisecond);
}
function As(e, t, n, r, i, a, o) {
	let s = /* @__PURE__ */ new Date();
	return s.setUTCHours(r, i, a, o), s.setUTCFullYear(e, t - 1, n), s.getTime();
}
function js(e, t) {
	if (t === "UTC") return 0;
	if (e > 0 && t === fs() && !ps()) return new Date(e).getTimezoneOffset() * -6e4;
	let { year: n, month: r, day: i, hour: a, minute: o, second: s } = Ns(e, t);
	return As(n, r, i, a, o, s, 0) - Math.floor(e / 1e3) * 1e3;
}
var Ms = /* @__PURE__ */ new Map();
function Ns(e, t) {
	let n = Ms.get(t);
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
	}), Ms.set(t, n));
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
var Ps = 864e5;
function Fs(e, t, n, r) {
	return (n === r ? [n] : [n, r]).filter((n) => Is(e, t, n));
}
function Is(e, t, n) {
	let r = Ns(n, t);
	return e.year === r.year && e.month === r.month && e.day === r.day && e.hour === r.hour && e.minute === r.minute && e.second === r.second;
}
function Ls(e, t, n = "compatible") {
	let r = Vs(e);
	if (t === "UTC") return ks(r);
	if (t === fs() && n === "compatible" && !ps()) {
		r = Hs(r, new qo());
		let e = /* @__PURE__ */ new Date(), t = Wo(r.era, r.year);
		return e.setFullYear(t, r.month - 1, r.day), e.setHours(r.hour, r.minute, r.second, r.millisecond), e.getTime();
	}
	let i = ks(r), a = js(i - Ps, t), o = js(i + Ps, t), s = Fs(r, t, i - a, i - o);
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
function Rs(e, t, n = "compatible") {
	return new Date(Ls(e, t, n));
}
function zs(e, t) {
	let n = js(e, t), r = new Date(e + n), i = r.getUTCFullYear(), a = r.getUTCMonth() + 1, o = r.getUTCDate(), s = r.getUTCHours(), c = r.getUTCMinutes(), l = r.getUTCSeconds(), u = r.getUTCMilliseconds();
	return new Ec(i < 1 ? "BC" : "AD", i < 1 ? -i + 1 : i, a, o, t, n, s, c, l, u);
}
function Bs(e) {
	return new wc(e.calendar, e.era, e.year, e.month, e.day);
}
function Vs(e, t) {
	let n = 0, r = 0, i = 0, a = 0;
	if ("timeZone" in e) ({hour: n, minute: r, second: i, millisecond: a} = e);
	else if ("hour" in e && !t) return e;
	return t && ({hour: n, minute: r, second: i, millisecond: a} = t), new Tc(e.calendar, e.era, e.year, e.month, e.day, n, r, i, a);
}
function Hs(e, t) {
	if (ts(e.calendar, t)) return e;
	let n = t.fromJulianDay(e.calendar.toJulianDay(e)), r = e.copy();
	return r.calendar = t, r.era = n.era, r.year = n.year, r.month = n.month, r.day = n.day, Qs(r), r;
}
function Us(e, t, n) {
	return e instanceof Ec ? e.timeZone === t ? e : Gs(e, t) : zs(Ls(e, t, n), t);
}
function Ws(e) {
	let t = ks(e) - e.offset;
	return new Date(t);
}
function Gs(e, t) {
	return Hs(zs(ks(e) - e.offset, t), e.calendar);
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/manipulation.mjs
var Ks = 36e5;
function qs(e, t) {
	let n = e.copy(), r = "hour" in n ? oc(n, t) : 0;
	Js(n, t.years || 0), n.calendar.balanceYearMonth && n.calendar.balanceYearMonth(n, e), n.month += t.months || 0, Ys(n), Zs(n), n.day += (t.weeks || 0) * 7, n.day += t.days || 0, n.day += r, Xs(n), n.calendar.balanceDate && n.calendar.balanceDate(n), n.year < 1 && (n.year = 1, n.month = 1, n.day = 1);
	let i = n.calendar.getYearsInEra(n);
	if (n.year > i) {
		let e = n.calendar.isInverseEra?.(n);
		n.year = i, n.month = e ? 1 : n.calendar.getMonthsInYear(n), n.day = e ? 1 : n.calendar.getDaysInMonth(n);
	}
	n.month < 1 && (n.month = 1, n.day = 1);
	let a = n.calendar.getMonthsInYear(n);
	return n.month > a && (n.month = a, n.day = n.calendar.getDaysInMonth(n)), n.day = Math.max(1, Math.min(n.calendar.getDaysInMonth(n), n.day)), n;
}
function Js(e, t) {
	e.calendar.isInverseEra?.(e) && (t = -t), e.year += t;
}
function Ys(e) {
	for (; e.month < 1;) Js(e, -1), e.month += e.calendar.getMonthsInYear(e);
	let t = 0;
	for (; e.month > (t = e.calendar.getMonthsInYear(e));) e.month -= t, Js(e, 1);
}
function Xs(e) {
	for (; e.day < 1;) e.month--, Ys(e), e.day += e.calendar.getDaysInMonth(e);
	for (; e.day > e.calendar.getDaysInMonth(e);) e.day -= e.calendar.getDaysInMonth(e), e.month++, Ys(e);
}
function Zs(e) {
	e.month = Math.max(1, Math.min(e.calendar.getMonthsInYear(e), e.month)), e.day = Math.max(1, Math.min(e.calendar.getDaysInMonth(e), e.day));
}
function Qs(e) {
	e.calendar.constrainDate && e.calendar.constrainDate(e), e.year = Math.max(1, Math.min(e.calendar.getYearsInEra(e), e.year)), Zs(e);
}
function $s(e) {
	let t = {};
	for (let n in e) typeof e[n] == "number" && (t[n] = -e[n]);
	return t;
}
function ec(e, t) {
	return qs(e, $s(t));
}
function tc(e, t) {
	let n = e.copy();
	return t.era != null && (n.era = t.era), t.year != null && (n.year = t.year), t.month != null && (n.month = t.month), t.day != null && (n.day = t.day), Qs(n), n;
}
function nc(e, t) {
	let n = e.copy();
	return t.hour != null && (n.hour = t.hour), t.minute != null && (n.minute = t.minute), t.second != null && (n.second = t.second), t.millisecond != null && (n.millisecond = t.millisecond), ic(n), n;
}
function rc(e) {
	e.second += Math.floor(e.millisecond / 1e3), e.millisecond = ac(e.millisecond, 1e3), e.minute += Math.floor(e.second / 60), e.second = ac(e.second, 60), e.hour += Math.floor(e.minute / 60), e.minute = ac(e.minute, 60);
	let t = Math.floor(e.hour / 24);
	return e.hour = ac(e.hour, 24), t;
}
function ic(e) {
	e.millisecond = Math.max(0, Math.min(e.millisecond, 999)), e.second = Math.max(0, Math.min(e.second, 59)), e.minute = Math.max(0, Math.min(e.minute, 59)), e.hour = Math.max(0, Math.min(e.hour, 23));
}
function ac(e, t) {
	let n = e % t;
	return n < 0 && (n += t), n;
}
function oc(e, t) {
	return e.hour += t.hours || 0, e.minute += t.minutes || 0, e.second += t.seconds || 0, e.millisecond += t.milliseconds || 0, rc(e);
}
function sc(e, t, n, r) {
	let i = e.copy();
	switch (t) {
		case "era": {
			let t = e.calendar.getEras(), a = t.indexOf(e.era);
			if (a < 0) throw Error("Invalid era: " + e.era);
			a = lc(a, n, 0, t.length - 1, r?.round), i.era = t[a], Qs(i);
			break;
		}
		case "year":
			i.calendar.isInverseEra?.(i) && (n = -n), i.year = lc(e.year, n, -Infinity, 9999, r?.round), i.year === -Infinity && (i.year = 1), i.calendar.balanceYearMonth && i.calendar.balanceYearMonth(i, e);
			break;
		case "month":
			i.month = lc(e.month, n, 1, e.calendar.getMonthsInYear(e), r?.round);
			break;
		case "day":
			i.day = lc(e.day, n, 1, e.calendar.getDaysInMonth(e), r?.round);
			break;
		default: throw Error("Unsupported field " + t);
	}
	return e.calendar.balanceDate && e.calendar.balanceDate(i), Qs(i), i;
}
function cc(e, t, n, r) {
	let i = e.copy();
	switch (t) {
		case "hour": {
			let t = e.hour, a = 0, o = 23;
			if (r?.hourCycle === 12) {
				let e = t >= 12;
				a = e ? 12 : 0, o = e ? 23 : 11;
			}
			i.hour = lc(t, n, a, o, r?.round);
			break;
		}
		case "minute":
			i.minute = lc(e.minute, n, 0, 59, r?.round);
			break;
		case "second":
			i.second = lc(e.second, n, 0, 59, r?.round);
			break;
		case "millisecond":
			i.millisecond = lc(e.millisecond, n, 0, 999, r?.round);
			break;
		default: throw Error("Unsupported field " + t);
	}
	return i;
}
function lc(e, t, n, r, i = !1) {
	if (i) {
		e += Math.sign(t), e < n && (e = r);
		let i = Math.abs(t);
		e = t > 0 ? Math.ceil(e / i) * i : Math.floor(e / i) * i, e > r && (e = n);
	} else e += t, e < n ? e = r - (n - e - 1) : e > r && (e = n + (e - r - 1));
	return e;
}
function uc(e, t) {
	let n;
	return n = t.years != null && t.years !== 0 || t.months != null && t.months !== 0 || t.weeks != null && t.weeks !== 0 || t.days != null && t.days !== 0 ? Ls(qs(Vs(e), {
		years: t.years,
		months: t.months,
		weeks: t.weeks,
		days: t.days
	}), e.timeZone) : ks(e) - e.offset, n += t.milliseconds || 0, n += (t.seconds || 0) * 1e3, n += (t.minutes || 0) * 6e4, n += (t.hours || 0) * 36e5, Hs(zs(n, e.timeZone), e.calendar);
}
function dc(e, t) {
	return uc(e, $s(t));
}
function fc(e, t, n, r) {
	switch (t) {
		case "hour": {
			let t = 0, i = 23;
			if (r?.hourCycle === 12) {
				let n = e.hour >= 12;
				t = n ? 12 : 0, i = n ? 23 : 11;
			}
			let a = Vs(e), o = Hs(nc(a, { hour: t }), new qo()), s = [Ls(o, e.timeZone, "earlier"), Ls(o, e.timeZone, "later")].filter((t) => zs(t, e.timeZone).day === o.day)[0], c = Hs(nc(a, { hour: i }), new qo()), l = [Ls(c, e.timeZone, "earlier"), Ls(c, e.timeZone, "later")].filter((t) => zs(t, e.timeZone).day === c.day).pop(), u = ks(e) - e.offset, d = Math.floor(u / Ks), f = u % Ks;
			return u = lc(d, n, Math.floor(s / Ks), Math.floor(l / Ks), r?.round) * Ks + f, Hs(zs(u, e.timeZone), e.calendar);
		}
		case "minute":
		case "second":
		case "millisecond": return cc(e, t, n, r);
		case "era":
		case "year":
		case "month":
		case "day": return Hs(zs(Ls(sc(Vs(e), t, n, r), e.timeZone), e.timeZone), e.calendar);
		default: throw Error("Unsupported field " + t);
	}
}
function pc(e, t, n) {
	let r = Vs(e), i = nc(tc(r, t), t);
	return i.compare(r) === 0 ? e : Hs(zs(Ls(i, e.timeZone, n), e.timeZone), e.calendar);
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/string.mjs
var mc = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})$/, hc = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})(?:T(\d{2}))?(?::(\d{2}))?(?::(\d{2}))?(\.\d+)?(?:(?:([+-]\d{2})(?::?(\d{2}))?)|Z)$/;
function gc(e) {
	let t = e.match(mc);
	if (!t) throw hc.test(e) ? Error(`Invalid ISO 8601 date string: ${e}. Use parseAbsolute() instead.`) : Error("Invalid ISO 8601 date string: " + e);
	let n = new wc(_c(t[1], 0, 9999), _c(t[2], 1, 12), 1);
	return n.day = _c(t[3], 1, n.calendar.getDaysInMonth(n)), n;
}
function _c(e, t, n) {
	let r = Number(e);
	if (r < t || r > n) throw RangeError(`Value out of range: ${t} <= ${r} <= ${n}`);
	return r;
}
function vc(e) {
	return `${String(e.hour).padStart(2, "0")}:${String(e.minute).padStart(2, "0")}:${String(e.second).padStart(2, "0")}${e.millisecond ? String(e.millisecond / 1e3).slice(1) : ""}`;
}
function yc(e) {
	let t = Hs(e, new qo()), n;
	return n = t.era === "BC" ? t.year === 1 ? "0000" : "-" + String(Math.abs(1 - t.year)).padStart(6, "00") : String(t.year).padStart(4, "0"), `${n}-${String(t.month).padStart(2, "0")}-${String(t.day).padStart(2, "0")}`;
}
function bc(e) {
	return `${yc(e)}T${vc(e)}`;
}
function xc(e) {
	let t = Math.sign(e) < 0 ? "-" : "+";
	e = Math.abs(e);
	let n = Math.floor(e / 36e5), r = Math.floor(e % 36e5 / 6e4), i = Math.floor(e % 36e5 % 6e4 / 1e3), a = `${t}${String(n).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
	return i !== 0 && (a += `:${String(i).padStart(2, "0")}`), a;
}
function Sc(e) {
	return `${bc(e)}${xc(e.offset)}[${e.timeZone}]`;
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/CalendarDate.mjs
function Cc(e) {
	let t = typeof e[0] == "object" ? e.shift() : new qo(), n;
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
var wc = class e {
	constructor(...e) {
		let [t, n, r, i, a] = Cc(e);
		this.calendar = t, this.era = n, this.year = r, this.month = i, this.day = a, Qs(this);
	}
	copy() {
		return this.era ? new e(this.calendar, this.era, this.year, this.month, this.day) : new e(this.calendar, this.year, this.month, this.day);
	}
	add(e) {
		return qs(this, e);
	}
	subtract(e) {
		return ec(this, e);
	}
	set(e) {
		return tc(this, e);
	}
	cycle(e, t, n) {
		return sc(this, e, t, n);
	}
	toDate(e) {
		return Rs(this, e);
	}
	toString() {
		return yc(this);
	}
	compare(e) {
		return ss(this, e);
	}
}, Tc = class e {
	constructor(...e) {
		let [t, n, r, i, a] = Cc(e);
		this.calendar = t, this.era = n, this.year = r, this.month = i, this.day = a, this.hour = e.shift() || 0, this.minute = e.shift() || 0, this.second = e.shift() || 0, this.millisecond = e.shift() || 0, Qs(this);
	}
	copy() {
		return this.era ? new e(this.calendar, this.era, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond) : new e(this.calendar, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);
	}
	add(e) {
		return qs(this, e);
	}
	subtract(e) {
		return ec(this, e);
	}
	set(e) {
		return tc(nc(this, e), e);
	}
	cycle(e, t, n) {
		switch (e) {
			case "era":
			case "year":
			case "month":
			case "day": return sc(this, e, t, n);
			default: return cc(this, e, t, n);
		}
	}
	toDate(e, t) {
		return Rs(this, e, t);
	}
	toString() {
		return bc(this);
	}
	compare(e) {
		let t = ss(this, e);
		return t === 0 ? cs(this, Vs(e)) : t;
	}
}, Ec = class e {
	constructor(...e) {
		let [t, n, r, i, a] = Cc(e), o = e.shift(), s = e.shift();
		this.calendar = t, this.era = n, this.year = r, this.month = i, this.day = a, this.timeZone = o, this.offset = s, this.hour = e.shift() || 0, this.minute = e.shift() || 0, this.second = e.shift() || 0, this.millisecond = e.shift() || 0, Qs(this);
	}
	copy() {
		return this.era ? new e(this.calendar, this.era, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond) : new e(this.calendar, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond);
	}
	add(e) {
		return uc(this, e);
	}
	subtract(e) {
		return dc(this, e);
	}
	set(e, t) {
		return pc(this, e, t);
	}
	cycle(e, t, n) {
		return fc(this, e, t, n);
	}
	toDate() {
		return Ws(this);
	}
	toString() {
		return Sc(this);
	}
	toAbsoluteString() {
		return this.toDate().toISOString();
	}
	compare(e) {
		return this.toDate().getTime() - Us(e, this.timeZone).toDate().getTime();
	}
}, Dc = /* @__PURE__ */ new Map(), Oc = class {
	constructor(e, t = {}) {
		this.formatter = Ac(e, t), this.options = t;
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
		return Pc() && (this.resolvedHourCycle ||= Fc(e.locale, this.options), e.hourCycle = this.resolvedHourCycle, e.hour12 = this.resolvedHourCycle === "h11" || this.resolvedHourCycle === "h12"), e.calendar === "ethiopic-amete-alem" && (e.calendar = "ethioaa"), e;
	}
}, kc = {
	true: { ja: "h11" },
	false: {}
};
function Ac(e, t = {}) {
	if (typeof t.hour12 == "boolean" && Mc()) {
		t = { ...t };
		let n = kc[String(t.hour12)][e.split("-")[0]], r = t.hour12 ? "h12" : "h23";
		t.hourCycle = n ?? r, delete t.hour12;
	}
	let n = e + (t ? Object.entries(t).sort((e, t) => e[0] < t[0] ? -1 : 1).join() : "");
	if (Dc.has(n)) return Dc.get(n);
	let r = new Intl.DateTimeFormat(e, t);
	return Dc.set(n, r), r;
}
var jc = null;
function Mc() {
	return jc ??= new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		hour12: !1
	}).format(new Date(2020, 2, 3, 0)) === "24", jc;
}
var Nc = null;
function Pc() {
	return Nc ??= new Intl.DateTimeFormat("fr", {
		hour: "numeric",
		hour12: !1
	}).resolvedOptions().hourCycle === "h12", Nc;
}
function Fc(e, t) {
	if (!t.timeStyle && !t.hour) return;
	e = e.replace(/(-u-)?-nu-[a-zA-Z0-9]+/, ""), e += (e.includes("-u-") ? "" : "-u") + "-nu-latn";
	let n = Ac(e, {
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
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/use-combobox.svelte.js
var Ic = (e) => {
	let t = Nt(), n = Ut(), r = Be(), i = G(() => {
		let i = rn(e), a = rn(i.collection);
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
	}), a = zt(yo, () => B(i)), o = G(() => co(a, Et));
	return () => B(o);
}, Lc = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"open",
	"value",
	"inputValue"
]);
function Rc(e, t) {
	let n = M();
	I(t, !0);
	let i = O(t, "ref", 15, null), a = O(t, "open", 15), o = O(t, "value", 15), s = O(t, "inputValue", 15), c = W(t, Lc), l = G(() => Ln(c)), u = G(() => f(B(l), 2)), d = G(() => B(u)[0]), p = G(() => B(u)[1]), m = G(() => Wt()(B(p), /* @__PURE__ */ "allowCustomValue.alwaysSubmitOnEnter.autoFocus.closeOnSelect.collection.composite.defaultHighlightedValue.defaultInputValue.defaultOpen.defaultValue.disabled.disableLayer.form.highlightedValue.id.ids.inputBehavior.inputValue.invalid.loopFocus.multiple.name.navigate.onFocusOutside.onHighlightChange.onInputValueChange.onInteractOutside.onOpenChange.onPointerDownOutside.onSelect.onValueChange.open.openOnChange.openOnClick.openOnKeyPress.placeholder.positioning.readOnly.required.scrollToIndexFn.selectionBehavior.translations.value".split("."))), h = G(() => f(B(m), 2)), _ = G(() => B(h)[0]), v = G(() => B(h)[1]), y = G(() => ({
		...B(_),
		id: B(_).id ?? n,
		open: a(),
		value: o(),
		inputValue: s(),
		onOpenChange(e) {
			B(_).onOpenChange?.(e), a() !== void 0 && a(e.open);
		},
		onValueChange(e) {
			B(_).onValueChange?.(e), o() !== void 0 && o(e.value);
		},
		onInputValueChange(e) {
			B(_).onInputValueChange?.(e), s() !== void 0 && s(e.inputValue);
		}
	})), b = Ic(() => B(y)), x = Un(() => ({
		present: b().open,
		...B(d)
	})), S = G(() => Q(b().getRootProps(), B(v)));
	return ua(b), Gn(x), X(e, q({ as: "div" }, () => B(S), {
		get ref() {
			return i();
		},
		set ref(e) {
			i(e);
		}
	})), g({
		get ref() {
			return i();
		},
		set ref(e = null) {
			i(e), r();
		},
		get open() {
			return a();
		},
		set open(e) {
			a(e), r();
		},
		get value() {
			return o();
		},
		set value(e) {
			o(e), r();
		},
		get inputValue() {
			return s();
		},
		set inputValue(e) {
			s(e), r();
		}
	});
}
N(Rc, {
	ref: {},
	open: {},
	value: {},
	inputValue: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/ComboboxStyles.svelte
var zc = {
	hash: "svelte-n2y5i3",
	code: "[data-scope='combobox'] [part='chip'] .af-avatar {width:16px;height:16px;margin-left:-4px;font-size:8px;line-height:1;}[data-scope='combobox'] [part='chip'] button {display:inline-grid;flex:none;place-items:center;width:16px;height:16px;margin-right:-4px;padding:0;border:0;border-radius:calc(infinity * 1px);background:transparent;color:inherit;outline:none;cursor:pointer;}\n  @media (hover: hover) {[data-scope='combobox'] [part='chip'] button:hover:not(:disabled) {background-color:color-mix(in oklab, currentColor 10%, transparent);} }[data-scope='combobox'] [part='chip'] button:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[data-scope='combobox'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='combobox'][hidden] {display:none !important;}[data-scope='combobox'][data-part='control'] {display:flex;flex-wrap:wrap;align-items:center;gap:4px;box-sizing:border-box;width:100%;min-width:14em;min-height:36px;padding:4px 12px;border:1px solid var(--k-input);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark, 0) * 100%), transparent);box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);font-size:16px;line-height:24px;transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);}\n  @media (min-width: 48rem) {[data-scope='combobox'][data-part='control'] {font-size:14px;line-height:20px;} }[data-scope='combobox'][data-part='control']:has(input:focus-visible) {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring), 0 1px 2px 0 rgb(0 0 0 / 0.05);}[data-scope='combobox'][data-part='control'][data-disabled] {opacity:0.5;cursor:not-allowed;}[data-scope='combobox'][data-part='input'] {flex:1;min-width:6em;padding:0;border:0;outline:none;background:transparent;color:inherit;font:inherit;}[data-scope='combobox'][data-part='input']::placeholder {color:var(--k-muted);opacity:1;}[data-scope='combobox'][data-part='content'] {display:flex;flex-direction:column;width:var(--reference-width, auto);max-height:300px;padding:4px;}[data-scope='combobox'][data-part='item'] {position:relative;box-sizing:border-box;display:flex;align-items:center;gap:8px;padding:6px 8px;border:0 solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 4px));outline:none;font-size:14px;line-height:20px;cursor:default;-webkit-user-select:none;user-select:none;}[data-scope='combobox'][data-part='item'][data-highlighted] {background-color:var(--k-accent);color:var(--k-accent-fg);}[data-scope='combobox'][data-part='item'][data-state='checked'] {font-weight:600;}[data-scope='combobox'][data-part='item'] .lines {display:flex;flex-direction:column;min-width:0;}[data-scope='combobox'][data-part='item'] .detail {color:var(--k-muted);font-size:12px;line-height:16px;}[data-scope='combobox'][data-part='empty'] {padding:24px 0;font-size:14px;line-height:20px;text-align:center;}[data-scope='combobox'] [part='loading'] {padding:6px 12px;color:var(--k-muted);font-size:14px;line-height:20px;}[data-scope='combobox'] [part='load-more'] {display:flex;box-sizing:border-box;gap:8px;width:100%;margin:0;padding:6px 12px;border:0 solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 4px));background:transparent;color:inherit;font:inherit;font-size:14px;line-height:20px;text-align:start;outline:none;cursor:pointer;}[data-scope='combobox'].people [part='loading'], [data-scope='combobox'].people [part='load-more'] {padding-left:8px;padding-right:8px;}\n  @media (hover: hover) {[data-scope='combobox'] [part='load-more']:hover {background-color:var(--k-accent);color:var(--k-accent-fg);} }[data-scope='combobox'] [part='load-more']:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}\n  @media (prefers-reduced-motion: reduce) {[data-scope='combobox'][data-part='control'] {transition:none;} }\n  @media (forced-colors: active) {[data-scope='combobox'][data-part='control']:has(input:focus-visible), [data-scope='combobox'] [part='chip'] button:focus-visible,\n    [data-scope='combobox'] [part='load-more']:focus-visible {outline:2px solid;outline-offset:2px;}[data-scope='combobox'][data-part='item'][data-highlighted] {forced-color-adjust:none;background-color:Highlight;color:HighlightText;}\n  }"
};
function Bc(e) {
	c(e, zc);
}
N(Bc, {}, [], [], { mode: "open" });
//#endregion
//#region src/kit/Direction.svelte
function Vc(e, t) {
	I(t, !0);
	let n = O(t, "dir", 7), i = O(t, "children", 7);
	var a = {
		get dir() {
			return n();
		},
		set dir(e) {
			n(e), r();
		},
		get children() {
			return i();
		},
		set children(e) {
			i(e), r();
		}
	};
	{
		let t = G(() => n() === "rtl" ? "ar" : "en-US");
		zo(e, {
			get locale() {
				return B(t);
			},
			children: (e, t) => {
				var n = D(), r = R(n);
				u(r, i), T(e, n);
			},
			$$slots: { default: !0 }
		});
	}
	return g(a);
}
N(Vc, {
	dir: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/reactivity/set.js
var Hc = [
	"forEach",
	"isDisjointFrom",
	"isSubsetOf",
	"isSupersetOf"
], Uc = [
	"difference",
	"intersection",
	"symmetricDifference",
	"union"
], Wc = !1, Gc = class e extends Set {
	#e = /* @__PURE__ */ new Map();
	#t = /* @__PURE__ */ K(0);
	#n = /* @__PURE__ */ K(0);
	#r = L || -1;
	constructor(e) {
		if (super(), e) {
			for (var t of e) super.add(t);
			this.#n.v = super.size;
		}
		Wc || this.#a();
	}
	#i(e) {
		return L === this.#r ? /* @__PURE__ */ K(e) : A(e);
	}
	#a() {
		Wc = !0;
		var t = e.prototype, n = Set.prototype;
		for (let e of Hc) t[e] = function(...t) {
			return B(this.#t), n[e].apply(this, t);
		};
		for (let r of Uc) t[r] = function(...t) {
			B(this.#t);
			var i = n[r].apply(this, t);
			return new e(i);
		};
	}
	has(e) {
		var t = super.has(e), n = this.#e, r = n.get(e);
		if (r === void 0) {
			if (!t) return B(this.#t), !1;
			r = this.#i(!0), n.set(e, r);
		}
		return B(r), t;
	}
	add(e) {
		return super.has(e) || (super.add(e), J(this.#n, super.size), ue(this.#t)), this;
	}
	delete(e) {
		var t = super.delete(e), n = this.#e, r = n.get(e);
		return r !== void 0 && (n.delete(e), J(r, !1)), t && (J(this.#n, super.size), ue(this.#t)), t;
	}
	clear() {
		if (super.size !== 0) {
			super.clear();
			var e = this.#e;
			for (var t of e.values()) J(t, !1);
			e.clear(), J(this.#n, 0), ue(this.#t);
		}
	}
	keys() {
		return this.values();
	}
	values() {
		return B(this.#t), super.values();
	}
	entries() {
		return B(this.#t), super.entries();
	}
	[Symbol.iterator]() {
		return this.keys();
	}
	get size() {
		return B(this.#n);
	}
}, Kc = class extends Map {
	#e = /* @__PURE__ */ new Map();
	#t = /* @__PURE__ */ K(0);
	#n = /* @__PURE__ */ K(0);
	#r = L || -1;
	constructor(e) {
		if (super(), e) {
			for (var [t, n] of e) super.set(t, n);
			this.#n.v = super.size;
		}
	}
	#i(e) {
		return L === this.#r ? /* @__PURE__ */ K(e) : A(e);
	}
	has(e) {
		var t = this.#e, n = t.get(e);
		if (n === void 0) {
			if (super.has(e)) n = this.#i(0), t.set(e, n);
			else return B(this.#t), !1;
		}
		return B(n), !0;
	}
	forEach(e, t) {
		this.#a(), super.forEach(e, t);
	}
	get(e) {
		var t = this.#e, n = t.get(e);
		if (n === void 0) {
			if (super.has(e)) n = this.#i(0), t.set(e, n);
			else {
				B(this.#t);
				return;
			}
		}
		return B(n), super.get(e);
	}
	getOrInsert(e, t) {
		return super.has(e) || this.set(e, t), this.get(e);
	}
	getOrInsertComputed(e, t) {
		return super.has(e) || this.set(e, t(e)), this.get(e);
	}
	set(e, t) {
		var n = this.#e, r = n.get(e), i = super.get(e), a = super.set(e, t), o = this.#t;
		if (r === void 0) r = this.#i(0), n.set(e, r), J(this.#n, super.size), ue(o);
		else if (i !== t) {
			ue(r);
			var s = o.reactions === null ? null : new Set(o.reactions);
			(s === null || !r.reactions?.every((e) => s.has(e))) && ue(o);
		}
		return a;
	}
	delete(e) {
		var t = this.#e, n = t.get(e), r = super.delete(e);
		return n !== void 0 && (t.delete(e), J(n, -1)), r && (J(this.#n, super.size), ue(this.#t)), r;
	}
	clear() {
		if (super.size !== 0) {
			super.clear();
			var e = this.#e;
			J(this.#n, 0);
			for (var t of e.values()) J(t, -1);
			ue(this.#t), e.clear();
		}
	}
	#a() {
		B(this.#t);
		var e = this.#e;
		if (this.#n.v !== e.size) {
			for (var t of super.keys()) if (!e.has(t)) {
				var n = this.#i(0);
				e.set(t, n);
			}
		}
		for ([, n] of this.#e) B(n);
	}
	keys() {
		return B(this.#t), super.keys();
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
		return B(this.#n), super.size;
	}
}, qc = 250;
function Jc(e) {
	try {
		return Promise.resolve(e());
	} catch (e) {
		return Promise.reject(e);
	}
}
function Yc(e) {
	let t = K(null), n = K([]), r = K(null), i = "", a = K(!1), o = K(!1), s = K(!1), c = new Kc(), l = new Gc(), u = /* @__PURE__ */ new Set(), d = null, f = /* @__PURE__ */ new Set(), p;
	function m() {
		clearTimeout(p), J(o, !1), d?.abort(), d = null, J(a, !1);
	}
	function h(l, u) {
		let f = B(t);
		if (!f) return;
		l === null && (clearTimeout(p), J(o, !1)), d?.abort();
		let m = new AbortController();
		d = m, J(a, !0), Jc(() => f({
			q: u,
			cursor: l,
			signal: m.signal
		})).then((t) => {
			if (m.signal.aborted) return;
			let a = t?.items ?? [];
			for (let t of a) c.set(e(t), t);
			let o = new Set(l === null ? [] : B(n).map(e)), s = a.filter((t) => !o.has(e(t)) && !!o.add(e(t)));
			J(n, l === null ? s : [...B(n), ...s]), i = u, J(r, t?.next ?? null, !0);
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
			return B(n);
		},
		get next() {
			return B(r);
		},
		get busy() {
			return B(o) || B(a);
		},
		get listed() {
			return B(s);
		},
		named: c,
		unnamed: l,
		pending(e) {
			return B(o) || B(a) || !!B(t)?.resolve && !l.has(e);
		},
		answered(e) {
			return l.has(e) || !B(t)?.resolve && B(s);
		},
		search(e) {
			B(t) && (clearTimeout(p), J(o, !0), p = setTimeout(() => h(null, e), qc));
		},
		now(e) {
			h(null, e);
		},
		more() {
			B(r) === null || B(o) || B(a) || h(B(r), i);
		},
		resolve(n) {
			let r = B(t);
			if (!r?.resolve) return;
			let i = [...new Set(n)].filter((e) => !c.has(e) && !u.has(e));
			if (i.length === 0) return;
			for (let e of i) u.add(e);
			let a = new AbortController();
			f.add(a), Jc(() => r.resolve(i, a.signal)).then((t) => {
				if (!a.signal.aborted) for (let n of t ?? []) c.set(e(n), n);
			}, () => {}).finally(() => {
				if (f.delete(a), !a.signal.aborted) for (let e of i) c.has(e) || l.add(e);
			});
		},
		stop: m,
		reset(e) {
			e !== B(t) && (J(t, e), m(), g(), u = /* @__PURE__ */ new Set(), l.clear(), J(n, []), J(r, null), i = "", J(s, !1));
		},
		destroy() {
			m(), g();
		}
	};
}
function Xc(e, t, n, r) {
	let i;
	j(() => {
		let n = t() ?? null;
		ne(() => {
			n !== i && (i = n, e.reset(n), n && r());
		});
	}), j(() => {
		let r = t(), i = n();
		r?.resolve && ne(() => e.resolve(i));
	}), j(() => () => e.destroy());
}
//#endregion
//#region src/kit/Combobox.svelte
var Zc = (e, t = l, n = l) => {
	var r = D(), i = R(r);
	b(i, () => No, (e, r) => {
		r(e, q({
			get item() {
				return t();
			},
			part: "option"
		}, n, {
			children: (e, n) => {
				var r = el(), i = V(r), a = F(i, !0), o = P(i, 2), s = (e) => {
					var n = $c(), r = F(n, !0);
					U(() => E(r, t().description)), T(e, n);
				};
				w(o, (e) => {
					t().description && e(s);
				}), v(r), U(() => E(a, t().label)), T(e, r);
			},
			$$slots: { default: !0 }
		}));
	}), T(e, r);
};
function Qc(e) {
	let t = /* @__PURE__ */ new Set();
	return e.filter((e) => !t.has(e.value) && !!t.add(e.value));
}
var $c = y("<span class=\"detail\"> </span>"), el = y("<span class=\"lines\"><span> </span> <!></span>"), tl = y("<span id=\"af-described\" hidden=\"\"> </span>"), nl = y("<span class=\"af-chip secondary\" part=\"chip\"><span> </span> <button type=\"button\" part=\"remove\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button></span>"), rl = y("<button type=\"button\" part=\"clear\" class=\"af-button ghost icon xs\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button>"), il = y("<!> <!> <!>", 1), al = y("<af-tooltip><!></af-tooltip>", 2), ol = y("<div part=\"loading\"> </div>"), sl = y("<button type=\"button\" part=\"load-more\"> </button>"), cl = y("<!> <!>", 1), ll = y("<div class=\"af-kit\"><!> <!></div>"), ul = {
	hash: "svelte-52f5fd",
	code: ":host {display:inline-block;max-width:100%;vertical-align:middle;}af-tooltip.svelte-52f5fd {display:block;}[data-scope='combobox'][data-part='item'][part='option'] {padding:6px 12px;}[data-scope='combobox'][data-part='item'][part='option'][data-disabled] {opacity:0.5;}"
};
function dl(e, t) {
	I(t, !0), c(e, ul);
	let n = O(t, "options", 23, () => []), a = O(t, "source", 7, null), o = O(t, "value", 7, null), s = O(t, "multiple", 7, !1), l = O(t, "placeholder", 7, null), u = O(t, "label", 7, null), d = O(t, "loading", 7, !1), f = O(t, "disabled", 7, !1), h = O(t, "locale", 7, null), _ = O(t, "strings", 7, null), y = O(t, "name", 7, null), S = O(t, "required", 7, !1), k = O(t, "readonly", 7, !1), ee = O(t, "description", 7, null), te = O(t, "error", 7, null), A = O(t, "invalid", 7, !1), ne = t.$$host, M = we(ne), re = G(() => he(h(), _() ?? void 0)), N = G(() => Qc(n() ?? [])), ie = G(() => new Map(B(N).map((e) => [e.value, e]))), L = G(() => [...new Set(Array.isArray(o()) ? o() : o() ? [o()] : [])]), z = K(null), ae = K(!1), H = Yc((e) => e.value);
	Xc(H, () => a(), () => B(L), () => {
		B(ae) && H.now(B(z) ?? "");
	});
	let se = (e) => a() ? H.named.get(e) : B(ie).get(e), ce = G(() => B(L).filter((e) => !se(e)));
	function W(e) {
		let t = se(e);
		return t ? t.label : d() || a() && H.pending(e) ? "…" : (a() ? H.answered(e) : B(N).length > 0) ? B(ce).length > 1 ? `${B(re).unknownOption} ${B(ce).indexOf(e) + 1}` : B(re).unknownOption : "";
	}
	let ue = G(() => B(z) ?? (s() || !B(L)[0] ? "" : W(B(L)[0]))), de = G(() => a() ? H.items : B(N).filter((e) => xr(e.label, B(z) ?? "") || xr(e.description, B(z) ?? ""))), q = G(() => ji({
		items: B(de),
		itemToValue: (e) => e.value,
		itemToString: (e) => e.label,
		isItemDisabled: (e) => !!e.disabled
	})), fe = G(() => !!d() || H.busy), pe = K(null);
	j(() => De(B(pe), B(ae), ne));
	let Y = (e) => Ce(ne, "change", { value: s() ? e : e[0] ?? null }), ge = K(!1), ve = G(() => !!f() || B(ge)), ye = G(() => B(ve) || !!k()), be = G(() => [ee(), te()].filter(Boolean).join(" ")), xe = K(null), Se = -Infinity, Te = -Infinity;
	j(() => {
		let e = !!S() && B(L).length === 0;
		Ve(ne, {
			name: y(),
			value: s() ? B(L) : B(L)[0] ?? null,
			validity: e ? { valueMissing: !0 } : {},
			message: e ? me(B(re), "valueMissing") : "",
			anchor: B(xe)
		});
	}), ze(ne, {
		reset() {
			let e = ne.getAttribute("value"), t = e ? [e] : [];
			(t.length !== B(L).length || t.some((e, t) => e !== B(L)[t])) && Y(t);
		},
		disabled(e) {
			J(ge, e, !0);
		}
	});
	function Ee(e) {
		let t = e.target;
		t === B(xe) || t.closest("button") || (e.preventDefault(), B(xe)?.focus());
	}
	let ke = (e) => e ? { "aria-description": e } : {};
	var Ae = {
		get options() {
			return n();
		},
		set options(e = []) {
			n(e), r();
		},
		get source() {
			return a();
		},
		set source(e = null) {
			a(e), r();
		},
		get value() {
			return o();
		},
		set value(e = null) {
			o(e), r();
		},
		get multiple() {
			return s();
		},
		set multiple(e = !1) {
			s(e), r();
		},
		get placeholder() {
			return l();
		},
		set placeholder(e = null) {
			l(e), r();
		},
		get label() {
			return u();
		},
		set label(e = null) {
			u(e), r();
		},
		get loading() {
			return d();
		},
		set loading(e = !1) {
			d(e), r();
		},
		get disabled() {
			return f();
		},
		set disabled(e = !1) {
			f(e), r();
		},
		get locale() {
			return h();
		},
		set locale(e = null) {
			h(e), r();
		},
		get strings() {
			return _();
		},
		set strings(e = null) {
			_(e), r();
		},
		get name() {
			return y();
		},
		set name(e = null) {
			y(e), r();
		},
		get required() {
			return S();
		},
		set required(e = !1) {
			S(e), r();
		},
		get readonly() {
			return k();
		},
		set readonly(e = !1) {
			k(e), r();
		},
		get description() {
			return ee();
		},
		set description(e = null) {
			ee(e), r();
		},
		get error() {
			return te();
		},
		set error(e = null) {
			te(e), r();
		},
		get invalid() {
			return A();
		},
		set invalid(e = !1) {
			A(e), r();
		}
	}, je = il(), Me = R(je);
	_e(Me, {});
	var Ne = P(Me, 2);
	Bc(Ne, {});
	var Pe = P(Ne, 2);
	return Yt(Pe, {
		value: () => ne.shadowRoot,
		children: (e, t) => {
			Vc(e, {
				get dir() {
					return M;
				},
				children: (e, t) => {
					var n = ll(), r = V(n), o = (e) => {
						var t = tl(), n = F(t, !0);
						U(() => E(n, B(be))), T(e, t);
					};
					w(r, (e) => {
						B(be) && e(o);
					});
					var c = P(r, 2), d = () => B(L), f = () => B(ue);
					{
						let e = G(() => !!s()), t = G(() => !!k()), n = G(() => !!A()), r = G(() => a() ? "none" : "autohighlight");
						b(c, () => Rc, (o, c) => {
							c(o, {
								get collection() {
									return B(q);
								},
								get multiple() {
									return B(e);
								},
								get disabled() {
									return B(ve);
								},
								get readOnly() {
									return B(t);
								},
								get invalid() {
									return B(n);
								},
								get inputBehavior() {
									return B(r);
								},
								selectionBehavior: "preserve",
								positioning: {
									strategy: "fixed",
									placement: "bottom-start"
								},
								onInteractOutside: (e) => {
									let t = e.detail.originalEvent.timeStamp;
									B(xe) && Oe() === B(xe) && Se >= t && Te >= Se && e.preventDefault();
								},
								get scrollToIndexFn() {
									return hn;
								},
								get value() {
									return d();
								},
								set value(e) {},
								get inputValue() {
									return f();
								},
								set inputValue(e) {},
								onValueChange: (e) => {
									B(z) !== null && a() && B(ae) && H.search(""), J(z, null), Y(e.value);
								},
								onInputValueChange: (e) => {
									e.reason === "input-change" && (J(z, e.inputValue, !0), Ce(ne, "search", { query: e.inputValue }), a() && H.search(e.inputValue));
								},
								onOpenChange: (e) => {
									e.open ? a() && e.reason !== "input-change" && H.now(B(z) ?? "") : (J(z, null), H.stop());
								},
								get open() {
									return B(ae);
								},
								set open(e) {
									J(ae, e, !0);
								},
								children: (e, t) => {
									var n = cl(), r = R(n);
									b(r, () => To, (e, t) => {
										t(e, {
											part: "control",
											onmousedown: Ee,
											children: (e, t) => {
												var n = il(), r = R(n), i = (e) => {
													var t = D(), n = R(t);
													C(n, 16, () => B(L), (e) => e, (e, t) => {
														let n = G(() => W(t));
														var r = nl(), i = V(r), a = F(i, !0), o = P(i, 2);
														v(r), U(() => {
															E(a, B(n)), x(o, "aria-label", `${B(re).remove ?? ""}: ${B(n) ?? ""}`), o.disabled = B(ye);
														}), oe("click", o, () => Y(B(L).filter((e) => e !== t))), T(e, r);
													}), T(e, t);
												};
												w(r, (e) => {
													s() && e(i);
												});
												var a = P(r, 2);
												{
													let e = G(() => l() ?? ""), t = G(() => u() || void 0), n = G(() => B(be) ? "af-described" : void 0), r = G(() => S() ? "true" : void 0);
													b(a, () => Do, (i, a) => {
														a(i, {
															onfocusout: (e) => Se = e.timeStamp,
															onfocusin: (e) => Te = e.timeStamp,
															part: "input",
															autocomplete: "off",
															spellcheck: "false",
															get placeholder() {
																return B(e);
															},
															get "aria-label"() {
																return B(t);
															},
															get "aria-describedby"() {
																return B(n);
															},
															get "aria-required"() {
																return B(r);
															},
															get ref() {
																return B(xe);
															},
															set ref(e) {
																J(xe, e, !0);
															}
														});
													});
												}
												var o = P(a, 2), c = (e) => {
													var t = rl();
													U(() => x(t, "aria-label", B(re).clear)), oe("click", t, () => Y([])), T(e, t);
												};
												w(o, (e) => {
													!s() && B(L)[0] && !B(ye) && e(c);
												}), T(e, n);
											},
											$$slots: { default: !0 }
										});
									});
									var o = P(r, 2);
									b(o, () => Fo, (e, t) => {
										t(e, {
											popover: "manual",
											get ref() {
												return B(pe);
											},
											set ref(e) {
												J(pe, e, !0);
											},
											children: (e, t) => {
												var n = D(), r = R(n);
												b(r, () => pa, (e, t) => {
													t(e, {
														class: "af-overlay",
														part: "content",
														children: (e, t) => {
															xn(e, {
																tabStop: !1,
																children: (e, t) => {
																	var n = cl(), r = R(n);
																	C(r, 17, () => B(q).items, (e) => e.value, (e, t) => {
																		var n = D(), r = R(n), a = (e) => {
																			var n = al();
																			U(() => i(n, "text", B(t).reason ?? "")), p(n, 1, "svelte-52f5fd");
																			var r = V(n);
																			{
																				let e = G(() => ke(B(t).reason));
																				Zc(r, () => B(t), () => B(e));
																			}
																			v(n), T(e, n);
																		}, o = (e) => {
																			Zc(e, () => B(t), () => ({}));
																		};
																		w(r, (e) => {
																			B(t).disabled ? e(a) : e(o, -1);
																		}), T(e, n);
																	});
																	var o = P(r, 2), s = (e) => {
																		var t = ol(), n = F(t, !0);
																		U(() => E(n, B(re).loading)), T(e, t);
																	}, c = (e) => {
																		var t = cl(), n = R(t), r = (e) => {
																			var t = sl(), n = F(t, !0);
																			U(() => E(n, B(re).loadMore)), oe("pointerdown", t, (e) => e.preventDefault()), oe("click", t, () => H.more()), T(e, t);
																		};
																		w(n, (e) => {
																			a() && H.next && e(r);
																		});
																		var i = P(n, 2);
																		b(i, () => Co, (e, t) => {
																			t(e, {
																				part: "empty",
																				children: (e, t) => {
																					m();
																					var n = le();
																					U(() => E(n, B(re).noResults)), T(e, n);
																				},
																				$$slots: { default: !0 }
																			});
																		}), T(e, t);
																	};
																	w(o, (e) => {
																		B(fe) ? e(s) : e(c, -1);
																	}), T(e, n);
																},
																$$slots: { default: !0 }
															});
														},
														$$slots: { default: !0 }
													});
												}), T(e, n);
											},
											$$slots: { default: !0 }
										});
									}), T(e, n);
								},
								$$slots: { default: !0 }
							});
						});
					}
					v(n), T(e, n);
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { default: !0 }
	}), T(e, je), g(Ae);
}
z(["click", "pointerdown"]), N(dl, {
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
}, Le);
//#endregion
//#region src/kit/CopyButton.svelte
var fl = e("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 6 9 17l-5-5\"></path></svg>"), pl = e("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\"></rect><path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\"></path></svg>"), ml = y("<span> </span>"), hl = y("<!> <span class=\"af-kit svelte-dc4eyn\"><button type=\"button\" part=\"trigger\" class=\"af-button ghost icon xs\"><!></button> <div part=\"status\" role=\"status\" class=\"live svelte-dc4eyn\"><!></div></span>", 1), gl = {
	hash: "svelte-dc4eyn",
	code: ":host {position:relative;display:inline-flex;vertical-align:middle;}.af-kit.svelte-dc4eyn {display:inline-flex;}.live.svelte-dc4eyn {position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;}"
};
function _l(e, t) {
	I(t, !0), c(e, gl);
	let n = O(t, "value", 7, null), i = O(t, "label", 7, null), a = O(t, "locale", 7, null), o = O(t, "strings", 7, null), s = t.$$host, l = G(() => he(a(), o() ?? void 0)), u = K(null), d = K(0), f = K(null), p = 0, m, h = !0;
	j(() => () => {
		h = !1, clearTimeout(m);
	});
	let _ = G(() => B(u) === "copied" ? B(l).copied : B(u) === "failed" ? B(l).copyFailed : "");
	async function y(e) {
		try {
			if (navigator.clipboard?.writeText) return await navigator.clipboard.writeText(e), !0;
		} catch {}
		return b(e);
	}
	function b(e) {
		let t = s.shadowRoot;
		if (!t) return !1;
		let n = Oe(), r = document.createElement("textarea");
		r.value = e, r.readOnly = !0, r.tabIndex = -1, r.setAttribute("aria-hidden", "true"), r.style.cssText = "position: fixed; top: 0; left: 0; width: 1px; height: 1px; margin: 0; padding: 0; border: 0; opacity: 0; pointer-events: none", r.addEventListener("copy", (e) => e.stopPropagation()), t.append(r);
		try {
			return r.focus({ preventScroll: !0 }), r.select(), r.setSelectionRange(0, e.length), document.execCommand("copy");
		} catch {
			return !1;
		} finally {
			r.remove(), (n && n !== document.body && n.isConnected ? n : B(f))?.focus({ preventScroll: !0 });
		}
	}
	async function C() {
		let e = ++p, t = n() ?? "", r = t !== "" && await y(t);
		Ce(s, "af-copy", {
			value: t,
			ok: r
		}), h && e === p && (J(u, r ? "copied" : "failed", !0), J(d, B(d) + 1), clearTimeout(m), m = setTimeout(() => J(u, null), 2e3));
	}
	var D = {
		get value() {
			return n();
		},
		set value(e = null) {
			n(e), r();
		},
		get label() {
			return i();
		},
		set label(e = null) {
			i(e), r();
		},
		get locale() {
			return a();
		},
		set locale(e = null) {
			a(e), r();
		},
		get strings() {
			return o();
		},
		set strings(e = null) {
			o(e), r();
		}
	}, k = hl(), ee = R(k);
	_e(ee, {});
	var A = P(ee, 2), ne = V(A), M = V(ne), re = (e) => {
		var t = fl();
		T(e, t);
	}, N = (e) => {
		var t = pl();
		T(e, t);
	};
	w(M, (e) => {
		B(u) === "copied" ? e(re) : e(N, -1);
	}), v(ne), te(ne, (e) => J(f, e), () => B(f));
	var ie = P(ne, 2), L = V(ie);
	return S(L, () => B(d), (e) => {
		var t = ml(), n = F(t, !0);
		U(() => E(n, B(_))), T(e, t);
	}), v(ie), v(A), U(() => x(ne, "aria-label", i() || B(l).copy)), oe("click", ne, C), T(e, k), g(D);
}
z(["click"]), N(_l, {
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
var vl = xt("date-picker").parts("clearTrigger", "content", "control", "input", "label", "monthSelect", "nextTrigger", "positioner", "presetTrigger", "prevTrigger", "rangeText", "root", "table", "tableBody", "tableCell", "tableCellTrigger", "tableHead", "tableHeader", "tableRow", "trigger", "view", "viewControl", "viewTrigger", "yearSelect").build();
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/constrain.mjs
function yl(e, t, n, r, i) {
	let a = {};
	for (let e in t) {
		let n = e, r = t[n];
		r != null && (a[n] = Math.floor(r / 2), a[n] > 0 && r % 2 == 0 && a[n]--);
	}
	return Sl(e, bl(e, t, n).subtract(a), t, n, r, i);
}
function bl(e, t, n, r, i) {
	let a = e;
	return t.years ? a = gs(e) : t.months ? a = ms(e) : t.weeks && (a = vs(e, n)), Sl(e, a, t, n, r, i);
}
function xl(e, t, n, r, i) {
	let a = { ...t };
	return a.days ? a.days-- : a.weeks ? a.weeks-- : a.months ? a.months-- : a.years && a.years--, Sl(e, bl(e, t, n).subtract(a), t, n, r, i);
}
function Sl(e, t, n, r, i, a) {
	return i && e.compare(i) >= 0 && (t = Es(t, bl(Bs(i), n, r))), a && e.compare(a) <= 0 && (t = Ts(t, xl(Bs(a), n, r))), t;
}
function Cl(e, t, n) {
	let r = Bs(e), i = t ? Bs(t) : void 0, a = n ? Bs(n) : void 0, o = r;
	return i && (o = Es(o, i)), a && (o = Ts(o, a)), o.compare(r) === 0 ? e : "hour" in e ? e.set({
		year: o.year,
		month: o.month,
		day: o.day
	}) : o;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/align.mjs
function wl(e, t, n, r, i, a) {
	switch (t) {
		case "start": return bl(e, n, r, i, a);
		case "end": return xl(e, n, r, i, a);
		default: return yl(e, n, r, i, a);
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/assertion.mjs
function Tl(e, t) {
	return e == null || t == null ? e === t : !("hour" in e) && !("hour" in t) ? Yo(e, t) : Vs(e).compare(Vs(t)) === 0;
}
function El(e, t, n, r, i) {
	return e ? t?.(e, n) ? !0 : Dl(e, r, i) : !1;
}
function Dl(e, t, n) {
	return t != null && e.compare(t) < 0 || n != null && e.compare(n) > 0;
}
function Ol(e, t, n) {
	let r = e.subtract({ days: 1 });
	return Yo(r, e) || Dl(r, t, n);
}
function kl(e, t, n) {
	let r = e.add({ days: 1 });
	return Yo(r, e) || Dl(r, t, n);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/duration.mjs
function Al(e) {
	let t = { ...e };
	for (let e in t) t[e] = 1;
	return t;
}
function jl(e, t) {
	let n = { ...t };
	return n.days ? n.days-- : n.days = -1, e.add(n);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/get-era-format.mjs
function Ml(e) {
	if (!e) return;
	let t = e.calendar.identifier;
	return t === "gregory" || t === "iso8601" ? e.era === "BC" ? "short" : void 0 : "short";
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/formatter.mjs
function Nl(e, t, n) {
	let r = n ?? Vs(os(t));
	return new Oc(e, {
		weekday: "long",
		month: "long",
		year: "numeric",
		day: "numeric",
		era: Ml(r),
		calendar: r.calendar.identifier,
		timeZone: t
	});
}
function Pl(e, t, n) {
	let r = n ?? os(t);
	return new Oc(e, {
		month: "long",
		year: "numeric",
		era: Ml(r),
		calendar: r.calendar.identifier,
		timeZone: t
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/format.mjs
function Fl(e, t, n, r, i) {
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
function Il(e, t, n, r) {
	if (!e) return "";
	let i = e, a = t ?? e, o = Nl(n, r);
	return Yo(i, a) ? o.format(i.toDate(r)) : Fl(i, a, o, (e, t) => `${e} \u2013 ${t}`, r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/date-month.mjs
var Ll = [
	"sun",
	"mon",
	"tue",
	"wed",
	"thu",
	"fri",
	"sat"
];
function Rl(e) {
	return e == null ? void 0 : Ll[e];
}
function zl(e, t, n) {
	return vs(e, t, Rl(n));
}
function Bl(e, t, n, r) {
	let i = t.add({ weeks: e }), a = [], o = zl(i, n, r);
	for (; a.length < 7;) {
		a.push(o);
		let e = o.add({ days: 1 });
		if (Yo(o, e)) break;
		o = e;
	}
	return a;
}
function Vl(e, t, n, r) {
	let i = Rl(r), a = n ?? ws(e, t, i);
	return [...Array(a).keys()].map((n) => Bl(n, e, t, r));
}
function Hl(e, t) {
	let n = new Oc(e, {
		weekday: "long",
		timeZone: t
	}), r = new Oc(e, {
		weekday: "short",
		timeZone: t
	}), i = new Oc(e, {
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
function Ul(e, t, n, r) {
	let i = zl(e, r, t), a = [...Array(7).keys()], o = Hl(r, n);
	return a.map((e) => o(i.add({ days: e })));
}
function Wl(e, t = "long", n) {
	if (!n || n.calendar.identifier === "gregory" || n.calendar.identifier === "iso8601") {
		let n = new Date(2021, 0, 1), r = [];
		for (let i = 0; i < 12; i++) r.push(n.toLocaleString(e, { month: t })), n.setMonth(n.getMonth() + 1);
		return r;
	}
	let r = n.calendar.getMonthsInYear(n), i = new Oc(e, {
		month: t,
		calendar: n.calendar.identifier
	}), a = [];
	for (let e = 1; e <= r; e++) {
		let t = n.set({ month: e });
		a.push(i.format(t.toDate("UTC")));
	}
	return a;
}
function Gl(e, t) {
	let n = vs(e, t, "mon"), r = n.year, i = vs(n.set({
		month: 1,
		day: 4
	}), t, "mon"), a = n.calendar.toJulianDay(n), o = i.calendar.toJulianDay(i);
	if (a >= o) return 1 + Math.floor((a - o) / 7);
	let s = vs(n.set({
		year: r - 1,
		month: 1,
		day: 4
	}), t, "mon"), c = s.calendar.toJulianDay(s);
	return 1 + Math.floor((a - c) / 7);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/date-year.mjs
function Kl(e) {
	let t = [];
	for (let n = e.from; n <= e.to; n += 1) t.push(n);
	return t;
}
var ql = 1900, Jl = 2099;
function Yl(e, t, n) {
	let r = e.calendar;
	return {
		from: t?.year ?? Hs(new wc(ql, 1, 1), r).year,
		to: n?.year ?? Hs(new wc(Jl, 12, 31), r).year
	};
}
var Xl = 10;
function Zl(e) {
	if (e) {
		if (e.length === 3) return e.padEnd(4, "0");
		if (e.length === 2) {
			let t = (/* @__PURE__ */ new Date()).getFullYear(), n = Math.floor(t / 100) * 100 + parseInt(e.slice(-2), 10);
			return n > t + Xl ? (n - 100).toString() : n.toString();
		}
		return e;
	}
}
function Ql(e, t) {
	let n = t?.strict ? 10 : 12, r = e - e % 10, i = [];
	for (let e = 0; e < n; e += 1) {
		let t = r + e;
		i.push(t);
	}
	return i;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/mutation.mjs
function $l(e, t) {
	let n = os(e ?? fs());
	return t ? Hs(n, t) : n;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/pagination.mjs
function eu(e, t, n, r) {
	return function(i) {
		let { startDate: a, focusedDate: o } = i, s = jl(a, e);
		return Dl(o, n, r) ? {
			startDate: a,
			focusedDate: Cl(o, n, r),
			endDate: s
		} : o.compare(a) < 0 ? {
			startDate: xl(o, e, t, n, r),
			focusedDate: Cl(o, n, r),
			endDate: s
		} : o.compare(s) > 0 ? {
			startDate: bl(o, e, t, n, r),
			endDate: s,
			focusedDate: Cl(o, n, r)
		} : {
			startDate: a,
			endDate: s,
			focusedDate: Cl(o, n, r)
		};
	};
}
function tu(e, t, n, r, i, a) {
	let o = eu(n, r, i, a), s = t.add(n);
	return o({
		focusedDate: e.add(n),
		startDate: bl(Sl(e, s, n, r, i, a), n, r)
	});
}
function nu(e, t, n, r, i, a) {
	let o = eu(n, r, i, a), s = t.subtract(n);
	return o({
		focusedDate: e.subtract(n),
		startDate: bl(Sl(e, s, n, r, i, a), n, r)
	});
}
function ru(e, t, n, r, i, a, o) {
	let s = eu(r, i, a, o);
	if (!n && !r.days) return s({
		focusedDate: e.add(Al(r)),
		startDate: t
	});
	if (r.days) return tu(e, t, r, i, a, o);
	if (r.weeks) return s({
		focusedDate: e.add({ months: 1 }),
		startDate: t
	});
	if (r.months || r.years) return s({
		focusedDate: e.add({ years: 1 }),
		startDate: t
	});
}
function iu(e, t, n, r, i, a, o) {
	let s = eu(r, i, a, o);
	if (!n && !r.days) return s({
		focusedDate: e.subtract(Al(r)),
		startDate: t
	});
	if (r.days) return nu(e, t, r, i, a, o);
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
var au = /* @__PURE__ */ new Map();
function ou(e) {
	let t = au.get(e);
	return t ?? (t = "0123456789" + new Intl.NumberFormat(e, { useGrouping: !1 }).format(1234567890), au.set(e, t), t);
}
var su = (e, t) => t ? ou(t).includes(e) : /\d/.test(e), cu = (e, t, n) => !e || e.length !== 1 || su(e, n) || t.includes(e), lu = (e, t, n) => e.split("").filter((e) => cu(e, t, n)).join(""), uu = /* @__PURE__ */ new Map();
function du(e) {
	let t = uu.get(e);
	if (t != null) return t;
	let n = new Intl.DateTimeFormat(e).formatToParts(/* @__PURE__ */ new Date()).find((e) => e.type === "literal");
	return t = n ? n.value : "/", uu.set(e, t), t;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/parse-date.mjs
var fu = (e) => e != null && e.length === 4, pu = (e) => e != null && parseFloat(e) <= 12, mu = (e) => e != null && parseFloat(e) <= 31;
function hu(e, t, n) {
	let { year: r, month: i, day: a } = _u(gu(t, n), e) ?? {};
	if (r != null || i != null || a != null) {
		let e = /* @__PURE__ */ new Date();
		r ||= e.getFullYear().toString(), i ||= (e.getMonth() + 1).toString(), a ||= e.getDate().toString();
	}
	if (fu(r) || (r = Zl(r)), fu(r) && pu(i) && mu(a)) return new wc(+r, +i, +a);
	let o = Date.parse(e);
	if (!isNaN(o)) {
		let e = new Date(o);
		return new wc(e.getFullYear(), e.getMonth() + 1, e.getDate());
	}
}
function gu(e, t) {
	return new Oc(e, {
		day: "numeric",
		month: "numeric",
		year: "numeric",
		timeZone: t
	}).formatToParts(new Date(2e3, 11, 25)).map(({ type: e, value: t }) => e === "literal" ? `${t}?` : `((?!=<${e}>)\\d+)?`).join("");
}
function _u(e, t) {
	let n = t.match(e);
	return e.toString().match(/<(.+?)>/g)?.map((e) => {
		let t = e.match(/<(.+)>/);
		return !t || t.length <= 0 ? null : e.match(/<(.+)>/)?.[1];
	}).reduce((e, t, r) => (t && (e[t] = n && n.length > r ? n[r + 1] : null), e), {});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/preset.mjs
function vu(e, t, n) {
	let r = Bs(as(n));
	switch (e) {
		case "thisWeek": return [vs(r, t), ys(r, t)];
		case "thisMonth": return [ms(r), r];
		case "thisQuarter": return [ms(r).add({ months: -((r.month - 1) % 3) }), r];
		case "thisYear": return [gs(r), r];
		case "last3Days": return [r.add({ days: -2 }), r];
		case "last7Days": return [r.add({ days: -6 }), r];
		case "last14Days": return [r.add({ days: -13 }), r];
		case "last30Days": return [r.add({ days: -29 }), r];
		case "last90Days": return [r.add({ days: -89 }), r];
		case "lastMonth": return [ms(r.add({ months: -1 })), hs(r.add({ months: -1 }))];
		case "lastQuarter": return [ms(r.add({ months: -((r.month - 1) % 3) - 3 })), hs(r.add({ months: -((r.month - 1) % 3) - 1 }))];
		case "lastWeek": return [vs(r, t).add({ weeks: -1 }), ys(r, t).add({ weeks: -1 })];
		case "lastYear": return [gs(r.add({ years: -1 })), _s(r.add({ years: -1 }))];
		default: throw Error(`Invalid date range preset: ${e}`);
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-picker@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-picker/dist/date-picker.dom.mjs
var yu = (e, t) => e.ids?.label?.(t) ?? `datepicker:${e.id}:label:${t}`, bu = (e) => e.ids?.root ?? `datepicker:${e.id}`, xu = (e, t) => e.ids?.table?.(t) ?? `datepicker:${e.id}:table:${t}`, Su = (e) => e.ids?.content ?? `datepicker:${e.id}:content`, Cu = (e, t) => e.ids?.cellTrigger?.(t) ?? `datepicker:${e.id}:cell-trigger:${t}`, wu = (e, t) => e.ids?.prevTrigger?.(t) ?? `datepicker:${e.id}:prev:${t}`, Tu = (e, t) => e.ids?.nextTrigger?.(t) ?? `datepicker:${e.id}:next:${t}`, Eu = (e, t) => e.ids?.viewTrigger?.(t) ?? `datepicker:${e.id}:view:${t}`, Du = (e) => e.ids?.clearTrigger ?? `datepicker:${e.id}:clear`, Ou = (e) => e.ids?.control ?? `datepicker:${e.id}:control`, ku = (e, t) => e.ids?.input?.(t) ?? `datepicker:${e.id}:input:${t}`, Au = (e) => e.ids?.trigger ?? `datepicker:${e.id}:trigger`, ju = (e) => e.ids?.positioner ?? `datepicker:${e.id}:positioner`, Mu = (e) => e.ids?.monthSelect ?? `datepicker:${e.id}:month-select`, Nu = (e) => e.ids?.yearSelect ?? `datepicker:${e.id}:year-select`, Pu = (e, t) => kn(Iu(e), `[data-part=table-cell-trigger][data-view=${t}][data-focus]:not([data-outside-range])`), Fu = (e) => e.getById(Au(e)), Iu = (e) => e.getById(Su(e)), Lu = (e) => Pn(Hu(e), "[data-part=input]"), Ru = (e) => e.getById(Nu(e)), zu = (e) => e.getById(Mu(e)), Bu = (e) => e.getById(Du(e)), Vu = (e) => e.getById(ju(e)), Hu = (e) => e.getById(Ou(e));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-picker@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-picker/dist/date-picker.utils.mjs
function Uu(e) {
	let [t, n] = e, r;
	return r = !t || !n || t.compare(n) <= 0 ? e : [n, t], r;
}
function Wu(e, t) {
	let [n, r] = t;
	return !n || !r ? !1 : n.compare(e) <= 0 && r.compare(e) >= 0;
}
function Gu(e) {
	return e.slice().filter((e) => e != null).sort((e, t) => e.compare(t));
}
function Ku(e) {
	return jt(e, {
		year: "calendar decade",
		month: "calendar year",
		day: "calendar month"
	});
}
var qu = {
	day: "dd",
	month: "mm",
	year: "yyyy"
};
function Ju(e) {
	return new Oc(e).formatToParts(/* @__PURE__ */ new Date()).map((e) => qu[e.type] ?? e.value).join("");
}
var Yu = (e) => !Number.isNaN(e.day) && !Number.isNaN(e.month) && !Number.isNaN(e.year), Xu = {
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
		return jt(e, {
			year: "Switch to previous decade",
			month: "Switch to previous year",
			day: "Switch to previous month"
		});
	},
	nextTrigger(e) {
		return jt(e, {
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
function Zu(e, t) {
	return e ? e === "day" ? 0 : e === "month" ? 1 : 2 : t || 0;
}
function Qu(e) {
	return e === 0 ? "day" : e === 1 ? "month" : "year";
}
function $u(e, t, n) {
	return Qu(vn(Zu(e, 0), Zu(t, 0), Zu(n, 2)));
}
function ed(e, t) {
	return Zu(e, 0) > Zu(t, 0);
}
function td(e, t) {
	return Zu(e, 0) < Zu(t, 0);
}
function nd(e, t, n) {
	return $u(Qu(Zu(e, 0) + 1), t, n);
}
function rd(e, t, n) {
	return $u(Qu(Zu(e, 0) - 1), t, n);
}
var id = [
	"day",
	"month",
	"year"
];
function ad(e) {
	id.forEach((t) => e(t));
}
var od = Ni((e) => [
	e.view,
	e.startValue.toString(),
	e.endValue.toString(),
	e.locale,
	e.timeZone,
	e.selectionMode
], ([e], t) => {
	let { startValue: n, endValue: r, locale: i, timeZone: a, selectionMode: o } = t;
	if (e === "year") {
		let e = Ql(n.year, { strict: !0 }), t = e.at(0).toString(), r = e.at(-1).toString();
		return {
			start: t,
			end: r,
			formatted: `${t} - ${r}`
		};
	}
	if (e === "month") {
		let e = new Oc(i, {
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
	let s = new Oc(i, {
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
function sd(e, t) {
	let { state: n, context: r, prop: i, send: a, computed: o, scope: s } = e, c = r.get("startValue"), l = o("endValue"), u = r.get("value"), d = r.get("focusedValue"), f = r.get("hoveredValue"), p = f ? Uu([u[0], f]) : [], m = !!i("disabled"), h = !!i("readOnly"), g = !!i("invalid"), _ = o("isInteractive"), v = u.length === 0, y = i("min"), b = i("max"), x = i("locale"), S = i("timeZone"), C = i("startOfWeek"), w = n.matches("focused"), T = n.matches("open"), E = i("selectionMode") === "range", D = i("selectionMode") === "multiple", O = i("isDateUnavailable"), k = i("maxSelectedDates"), ee = D && k != null && u.length >= k, te = r.get("currentPlacement"), A = te ? Me(te) : void 0, ne = Fe({
		...i("positioning"),
		placement: te
	}), j = du(x), M = kt(Xu, i("translations"));
	function re(e = c) {
		let t = i("fixedWeeks") ? 6 : void 0;
		return Vl(e, x, t, C);
	}
	function N(e = {}) {
		let { format: t } = e;
		return Wl(x, t, d).map((e, t) => {
			let n = t + 1;
			return {
				label: e,
				value: n,
				disabled: Dl(d.set({ month: n }), y, b)
			};
		});
	}
	function P() {
		return Kl(Yl(d, y, b)).map((e) => ({
			label: e.toString(),
			value: e,
			disabled: !mn(e, y?.year, b?.year)
		}));
	}
	function F(e) {
		return El(e, O, x, y, b);
	}
	function ie(e) {
		let t = c ?? $l(S, d.calendar);
		a({
			type: "FOCUS.SET",
			value: t.set({ month: e })
		});
	}
	function I(e) {
		let t = c ?? $l(S, d.calendar);
		a({
			type: "FOCUS.SET",
			value: t.set({ year: e })
		});
	}
	function L(e) {
		let { value: t, disabled: n } = e, r = d.set({ year: t }), i = !Ql(c.year, { strict: !0 }).includes(t), a = mn(t, y?.year, b?.year), o = E && Wu(r, u), s = E && u[0] && es(r, u[0]), l = E && u[1] && es(r, u[1]), f = E && p.length > 0, m = f && Wu(r, p), h = f && p[0] && es(r, p[0]), g = f && p[1] && es(r, p[1]), _ = {
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
	function R(e) {
		let { value: t, disabled: n } = e, r = d.set({ month: t }), i = Pl(x, S, d), a = E && Wu(r, u), o = E && u[0] && $o(r, u[0]), s = E && u[1] && $o(r, u[1]), c = E && p.length > 0, l = c && Wu(r, p), f = c && p[0] && $o(r, p[0]), m = c && p[1] && $o(r, p[1]), h = {
			focused: d.month === e.value,
			selectable: !Dl(r, y, b),
			selected: !!u.find((e) => e && e.month === t && e.year === d.year),
			valueText: i.format(r.toDate(S)),
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
	function z(e) {
		let { value: t, disabled: n, visibleRange: r = o("visibleRange") } = e, a = Nl(x, S, d), s = Al(o("visibleDuration")), c = i("outsideDaySelectable"), l = r.start.add(s).subtract({ days: 1 }), f = Dl(t, r.start, l), m = E && Wu(t, u), h = E && u[0] && Yo(t, u[0]), g = E && u[1] && Yo(t, u[1]), _ = E && p.length > 0, v = _ && Wu(t, p), C = _ && p[0] && Yo(t, p[0]), w = _ && p[1] && Yo(t, p[1]), T = u.some((e) => e != null && Yo(t, e)), D = {
			invalid: Dl(t, y, b),
			disabled: n || !c && f || Dl(t, y, b) || ee && !T,
			selected: T,
			unavailable: El(t, O, x, y, b) && !n,
			outsideRange: f,
			today: ns(t, S),
			weekend: Os(t, x),
			value: t,
			valueText: a.format(t.toDate(S)),
			get focused() {
				return d != null && Yo(t, d) && (!D.outsideRange || c);
			},
			get selectable() {
				return !D.disabled && !D.unavailable;
			},
			inRange: m || v,
			firstInRange: h,
			lastInRange: g,
			inHoveredRange: v,
			firstInHoveredRange: C,
			lastInHoveredRange: w
		};
		return D;
	}
	function B(e) {
		let { view: t = "day", id: n } = e;
		return [t, n].filter(Boolean).join(" ");
	}
	return {
		focused: w,
		open: T,
		disabled: m,
		invalid: g,
		readOnly: h,
		inline: !!i("inline"),
		numOfMonths: i("numOfMonths"),
		showWeekNumbers: !!i("showWeekNumbers"),
		selectionMode: i("selectionMode"),
		maxSelectedDates: k,
		isMaxSelected: ee,
		view: r.get("view"),
		getRangePresetValue(e) {
			return vu(e, x, S);
		},
		getWeekNumber(e) {
			let t = e[0];
			return t ? Gl(t, x) : 0;
		},
		getDaysInWeek(e, t = c) {
			return Bl(e, t, x, C);
		},
		getOffset(e) {
			let t = c.add(e), n = l.add(e), r = Pl(x, S, d);
			return {
				visibleRange: {
					start: t,
					end: n
				},
				weeks: re(t),
				visibleRangeText: {
					start: r.format(t.toDate(S)),
					end: r.format(n.toDate(S))
				}
			};
		},
		getMonthWeeks: re,
		isUnavailable: F,
		weeks: re(),
		weekDays: Ul(c, C, S, x),
		visibleRangeText: o("visibleRangeText"),
		value: u,
		valueAsDate: u.filter((e) => e != null).map((e) => e.toDate(S)),
		valueAsString: o("valueAsString"),
		focusedValue: d,
		focusedValueAsDate: d?.toDate(S),
		focusedValueAsString: i("format")(d, {
			locale: x,
			timeZone: S
		}),
		visibleRange: o("visibleRange"),
		selectToday() {
			let e = Cl($l(S, d.calendar), y, b);
			a({
				type: "VALUE.SET",
				value: [e]
			});
		},
		setValue(e) {
			let t = e.map((e) => Cl(e, y, b));
			a({
				type: "VALUE.SET",
				value: t
			});
		},
		setTime(e, t = 0) {
			let n = Array.from(u), r = n[t];
			r && ("hour" in r || (r = Vs(r)), r = r.set({
				hour: e.hour ?? ("hour" in r ? r.hour : 0),
				minute: e.minute ?? ("minute" in r ? r.minute : 0),
				second: e.second ?? ("second" in r ? r.second : 0),
				millisecond: e.millisecond ?? ("millisecond" in r ? r.millisecond : 0)
			}), n[t] = Cl(r, y, b), a({
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
		focusMonth: ie,
		focusYear: I,
		getYears: P,
		getMonths: N,
		getYearsGrid(e = {}) {
			let { columns: t = 1 } = e, n = Ql(c.year, { strict: !0 }).map((e) => ({
				label: e.toString(),
				value: e,
				disabled: !mn(e, y?.year, b?.year)
			}));
			return Rt(n, t);
		},
		getDecade() {
			let e = Ql(c.year, { strict: !0 });
			return {
				start: e.at(0),
				end: e.at(-1)
			};
		},
		getMonthsGrid(e = {}) {
			let { columns: t = 1, format: n } = e;
			return Rt(N({ format: n }), t);
		},
		format(e, t = {
			month: "long",
			year: "numeric"
		}) {
			return new Oc(x, {
				...t,
				calendar: e.calendar.identifier
			}).format(e.toDate(S));
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
				...vl.root.attrs,
				dir: i("dir"),
				id: bu(s),
				"data-state": T ? "open" : "closed",
				"data-disabled": Z(m),
				"data-readonly": Z(h),
				"data-empty": Z(v)
			});
		},
		getLabelProps(e = {}) {
			let { index: n = 0 } = e;
			return t.label({
				...vl.label.attrs,
				id: yu(s, n),
				dir: i("dir"),
				htmlFor: ku(s, n),
				"data-state": T ? "open" : "closed",
				"data-index": n,
				"data-disabled": Z(m),
				"data-readonly": Z(h)
			});
		},
		getControlProps() {
			return t.element({
				...vl.control.attrs,
				dir: i("dir"),
				id: Ou(s),
				"data-disabled": Z(m),
				"data-placeholder-shown": Z(v)
			});
		},
		getRangeTextProps() {
			return t.element({
				...vl.rangeText.attrs,
				dir: i("dir")
			});
		},
		getContentProps() {
			return t.element({
				...vl.content.attrs,
				hidden: !T,
				dir: i("dir"),
				"data-state": T ? "open" : "closed",
				"data-placement": te,
				"data-side": A,
				"data-inline": Z(i("inline")),
				id: Su(s),
				tabIndex: -1,
				role: "application",
				"aria-roledescription": "datepicker",
				"aria-label": M.content
			});
		},
		getTableProps(e = {}) {
			let { view: n = "day", columns: r = n === "day" ? 7 : 4 } = e, o = B(e);
			return t.element({
				...vl.table.attrs,
				role: "grid",
				"data-columns": r,
				"aria-roledescription": Ku(n),
				id: xu(s, o),
				"aria-readonly": ut(h),
				"aria-disabled": ut(m),
				"aria-multiselectable": ut(i("selectionMode") !== "single"),
				"data-view": n,
				dir: i("dir"),
				tabIndex: -1,
				onKeyDown(e) {
					if (e.defaultPrevented || m) return;
					let t = {
						Enter() {
							_ && (n === "day" && F(d) || (n !== "month" || R({ value: d.month }).selectable) && (n !== "year" || L({ value: d.year }).selectable) && a({
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
					}[bt(e, { dir: i("dir") })];
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
				...vl.tableHead.attrs,
				"aria-hidden": !0,
				dir: i("dir"),
				"data-view": n,
				"data-disabled": Z(m)
			});
		},
		getTableHeaderProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...vl.tableHeader.attrs,
				dir: i("dir"),
				"data-view": n,
				"data-disabled": Z(m)
			});
		},
		getTableBodyProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...vl.tableBody.attrs,
				"data-view": n,
				"data-disabled": Z(m)
			});
		},
		getTableRowProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...vl.tableRow.attrs,
				"aria-disabled": ut(m),
				"data-disabled": Z(m),
				"data-view": n
			});
		},
		getWeekNumberHeaderCellProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...vl.tableCell.attrs,
				scope: "col",
				"aria-label": M.weekColumnHeader,
				"data-view": n,
				"data-type": "week-number",
				"data-disabled": Z(m)
			});
		},
		getWeekNumberCellProps(e) {
			let { weekIndex: n, week: r } = e, i = r[0] ? Gl(r[0], x) : 0;
			return t.element({
				...vl.tableCell.attrs,
				role: "rowheader",
				"aria-label": M.weekNumberCell?.(i),
				"data-view": "day",
				"data-week-index": n,
				"data-type": "week-number",
				"data-disabled": Z(m)
			});
		},
		getDayTableCellState: z,
		getDayTableCellProps(e) {
			let { value: n } = e, r = z(e);
			return t.element({
				...vl.tableCell.attrs,
				role: "gridcell",
				"aria-disabled": ut(!r.selectable),
				"aria-selected": r.selected || r.inRange,
				"aria-invalid": ut(r.invalid),
				"aria-current": r.today ? "date" : void 0,
				"data-value": n.toString()
			});
		},
		getDayTableCellTriggerProps(e) {
			let { value: n } = e, r = z(e);
			return t.element({
				...vl.tableCellTrigger.attrs,
				id: Cu(s, n.toString()),
				role: "button",
				dir: i("dir"),
				tabIndex: m ? -1 : r.focused ? 0 : -1,
				"aria-label": M.dayCell(r),
				"aria-disabled": ut(!r.selectable),
				"aria-invalid": ut(r.invalid),
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
				onPointerMove: E ? (e) => {
					if (e.pointerType === "touch" || !r.selectable) return;
					let t = !s.isActiveElement(e.currentTarget);
					f && Qo(n, f) || a({
						type: "CELL.POINTER_MOVE",
						cell: "day",
						value: n,
						focus: t,
						outsideRange: r.outsideRange
					});
				} : void 0
			});
		},
		getMonthTableCellState: R,
		getMonthTableCellProps(e) {
			let { value: n, columns: r } = e, a = R(e);
			return t.element({
				...vl.tableCell.attrs,
				dir: i("dir"),
				colSpan: r,
				role: "gridcell",
				"aria-selected": ut(a.selected || a.inRange),
				"data-selected": Z(a.selected),
				"aria-disabled": ut(!a.selectable),
				"data-value": n
			});
		},
		getMonthTableCellTriggerProps(e) {
			let { value: n } = e, r = R(e);
			return t.element({
				...vl.tableCellTrigger.attrs,
				id: Cu(s, n.toString()),
				role: "button",
				dir: i("dir"),
				tabIndex: m ? -1 : r.focused ? 0 : -1,
				"aria-label": r.valueText,
				"aria-disabled": ut(!r.selectable),
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
				onPointerMove: E ? (e) => {
					if (e.pointerType === "touch" || !r.selectable) return;
					let t = !s.isActiveElement(e.currentTarget);
					f && r.value && $o(r.value, f) || a({
						type: "CELL.POINTER_MOVE",
						cell: "month",
						value: r.value,
						focus: t
					});
				} : void 0
			});
		},
		getYearTableCellState: L,
		getYearTableCellProps(e) {
			let { value: n, columns: r } = e, a = L(e);
			return t.element({
				...vl.tableCell.attrs,
				dir: i("dir"),
				colSpan: r,
				role: "gridcell",
				"aria-selected": ut(a.selected || a.inRange),
				"data-selected": Z(a.selected),
				"aria-disabled": ut(!a.selectable),
				"data-value": n
			});
		},
		getYearTableCellTriggerProps(e) {
			let { value: n } = e, r = L(e);
			return t.element({
				...vl.tableCellTrigger.attrs,
				id: Cu(s, n.toString()),
				role: "button",
				dir: i("dir"),
				tabIndex: m ? -1 : r.focused ? 0 : -1,
				"aria-label": r.valueText,
				"aria-disabled": ut(!r.selectable),
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
				onPointerMove: E ? (e) => {
					if (e.pointerType === "touch" || !r.selectable) return;
					let t = !s.isActiveElement(e.currentTarget);
					f && r.value && es(r.value, f) || a({
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
				...vl.nextTrigger.attrs,
				dir: i("dir"),
				id: Tu(s, n),
				type: "button",
				"aria-label": M.nextTrigger(n),
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
				...vl.prevTrigger.attrs,
				dir: i("dir"),
				id: wu(s, n),
				type: "button",
				"aria-label": M.prevTrigger(n),
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
				...vl.clearTrigger.attrs,
				id: Du(s),
				dir: i("dir"),
				type: "button",
				"aria-label": M.clearTrigger,
				hidden: !u.length,
				onClick(e) {
					e.defaultPrevented || _ && a({ type: "VALUE.CLEAR" });
				}
			});
		},
		getTriggerProps() {
			return t.button({
				...vl.trigger.attrs,
				id: Au(s),
				dir: i("dir"),
				type: "button",
				"data-placement": te,
				"data-side": A,
				"aria-label": M.trigger(T),
				"aria-controls": Su(s),
				"aria-expanded": T,
				"data-state": T ? "open" : "closed",
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
				...vl.view.attrs,
				"data-view": n,
				hidden: r.get("view") !== n
			});
		},
		getViewTriggerProps(e = {}) {
			let { view: n = "day" } = e, r = nd(n, i("minView"), i("maxView")), o = r !== n, c = m || !o;
			return t.button({
				...vl.viewTrigger.attrs,
				"data-view": n,
				dir: i("dir"),
				id: Eu(s, n),
				type: "button",
				disabled: c,
				"data-disabled": Z(c),
				"aria-label": M.viewTrigger(n, o ? r : void 0),
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
				...vl.viewControl.attrs,
				"data-view": n,
				dir: i("dir")
			});
		},
		getInputProps(e = {}) {
			let { index: n = 0, fixOnBlur: r = !0 } = e;
			return t.input({
				...vl.input.attrs,
				id: ku(s, n),
				autoComplete: "off",
				autoCorrect: "off",
				spellCheck: "false",
				dir: i("dir"),
				name: i("name"),
				"data-index": n,
				"data-state": T ? "open" : "closed",
				"data-placeholder-shown": Z(v),
				readOnly: h,
				disabled: m,
				required: i("required"),
				"aria-invalid": ut(g),
				"data-invalid": Z(g),
				placeholder: i("placeholder") || Ju(x),
				defaultValue: o("valueAsString")[n],
				onBeforeInput(e) {
					let { data: t } = on(e);
					cu(t, j, x) || e.preventDefault();
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
						pt(e) || F(d) || e.currentTarget.value.trim() !== "" && a({
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
						value: lu(t, j, x),
						index: n
					});
				}
			});
		},
		getMonthSelectProps() {
			return t.select({
				...vl.monthSelect.attrs,
				id: Mu(s),
				"aria-label": M.monthSelect,
				disabled: m,
				dir: i("dir"),
				defaultValue: c.month,
				onChange(e) {
					ie(Number(e.currentTarget.value));
				}
			});
		},
		getYearSelectProps() {
			return t.select({
				...vl.yearSelect.attrs,
				id: Nu(s),
				disabled: m,
				"aria-label": M.yearSelect,
				dir: i("dir"),
				defaultValue: c.year,
				onChange(e) {
					I(Number(e.currentTarget.value));
				}
			});
		},
		getPositionerProps() {
			return t.element({
				id: ju(s),
				...vl.positioner.attrs,
				dir: i("dir"),
				style: ne.floating
			});
		},
		getPresetTriggerProps(e) {
			let n = Array.isArray(e.value) ? e.value : vu(e.value, x, S), r = n.filter((e) => e != null).map((e) => e.toDate(S).toDateString());
			return t.button({
				...vl.presetTrigger.attrs,
				"aria-label": M.presetTrigger(r),
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
var { and: cd } = Pt();
function ld(e, t) {
	if (e?.length !== t?.length) return !1;
	let n = Math.max(e.length, t.length);
	for (let r = 0; r < n; r++) if (!Tl(e[r], t[r])) return !1;
	return !0;
}
function ud(e, t) {
	return e.map((e) => e == null ? "" : t("format")(e, {
		locale: t("locale"),
		timeZone: t("timeZone")
	}));
}
var dd = St({
	props({ props: e }) {
		let t = e.locale || "en-US", n = e.timeZone || "UTC", r = e.selectionMode || "single", i = e.numOfMonths || 1, a;
		if (e.createCalendar) {
			let n = new Intl.DateTimeFormat(t).resolvedOptions().calendar;
			n !== "gregory" && n !== "iso8601" && (a = e.createCalendar(n));
		}
		let o = (e) => !a || e.calendar.identifier === a.identifier ? e : Hs(e, a), s = e.defaultValue ? Gu(e.defaultValue).map((t) => Cl(o(t), e.min, e.max)) : void 0, c = e.value ? Gu(e.value).map((t) => Cl(o(t), e.min, e.max)) : void 0, l = e.focusedValue || e.defaultFocusedValue || c?.[0] || s?.[0] || $l(n, a);
		l = Cl(o(l), e.min, e.max);
		let u = e.minView || "day", d = e.maxView || "year", f = $u(e.defaultView || e.view || u, u, d);
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
				return new Oc(t, {
					timeZone: n,
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
					calendar: a?.identifier
				}).format(e.toDate(n));
			},
			parse(e, { locale: t, timeZone: n }) {
				return hu(e, t, n);
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
				isEqual: Tl,
				hash: (e) => e.toString(),
				sync: !0,
				onChange(t) {
					let r = n(), i = r.get("view"), a = r.get("value"), o = ud(a, e);
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
				isEqual: ld,
				hash: (e) => e.map((e) => e?.toString() ?? "").join(","),
				onChange(t) {
					let r = n(), i = ud(t, e);
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
				isEqual: Tl
			})),
			view: t(() => ({
				defaultValue: e("defaultView"),
				value: e("view"),
				onChange(t) {
					e("onViewChange")?.({ view: t });
				}
			})),
			startValue: t(() => ({
				defaultValue: wl(e("focusedValue") || e("defaultFocusedValue"), "start", { months: e("numOfMonths") }, e("locale")),
				isEqual: Tl,
				hash: (e) => e.toString()
			})),
			currentPlacement: t(() => ({ defaultValue: void 0 })),
			restoreFocus: t(() => ({ defaultValue: !1 }))
		};
	},
	computed: {
		isInteractive: ({ prop: e }) => !e("disabled") && !e("readOnly"),
		visibleDuration: ({ prop: e }) => ({ months: e("numOfMonths") }),
		endValue: ({ context: e, computed: t }) => jl(e.get("startValue"), t("visibleDuration")),
		visibleRange: ({ context: e, computed: t }) => ({
			start: e.get("startValue"),
			end: t("endValue")
		}),
		visibleRangeText: ({ context: e, prop: t, computed: n }) => od({
			view: e.get("view"),
			startValue: e.get("startValue"),
			endValue: n("endValue"),
			locale: t("locale"),
			timeZone: t("timeZone"),
			selectionMode: t("selectionMode")
		}),
		isPrevVisibleRangeValid: ({ context: e, prop: t }) => !Ol(e.get("startValue"), t("min"), t("max")),
		isNextVisibleRangeValid: ({ prop: e, computed: t }) => !kl(t("endValue"), e("min"), e("max")),
		valueAsString: ({ context: e, prop: t }) => ud(e.get("value"), t)
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
						guard: cd("shouldRestoreFocus", "isInteractOutsideEvent"),
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
						guard: cd("isRangePicker", "hasSelectedRange"),
						actions: [
							"setActiveIndexToStart",
							"resetSelection",
							"setActiveIndexToEnd"
						]
					},
					{
						guard: cd("isRangePicker", "isSelectingEndDate", "closeOnSelect", "isOpenControlled"),
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
						guard: cd("isRangePicker", "isSelectingEndDate", "closeOnSelect"),
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
						guard: cd("isRangePicker", "isSelectingEndDate"),
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
						guard: cd("isMultiPicker", "canSelectDate"),
						actions: ["setFocusedDate", "toggleSelectedDate"]
					},
					{
						guard: "isMultiPicker",
						actions: ["setFocusedDate"]
					},
					{
						guard: cd("closeOnSelect", "isOpenControlled"),
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
					guard: cd("isRangePicker", "isSelectingEndDate", "isDayPointerMoveOutsideVisibleMonth"),
					actions: ["setHoveredDate"]
				}, {
					guard: cd("isRangePicker", "isSelectingEndDate"),
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
						guard: cd("isRangePicker", "hasSelectedRange"),
						actions: [
							"setActiveIndexToStart",
							"resetSelection",
							"setActiveIndexToEnd",
							"focusNextDay"
						]
					},
					{
						guard: cd("isRangePicker", "isSelectingEndDate", "closeOnSelect", "isOpenControlled"),
						actions: [
							"setSelectedDate",
							"setActiveIndexToStart",
							"clearHoveredDate",
							"invokeOnClose"
						]
					},
					{
						guard: cd("isRangePicker", "isSelectingEndDate", "closeOnSelect"),
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
						guard: cd("isRangePicker", "isSelectingEndDate"),
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
						guard: cd("isMultiPicker", "canSelectDate"),
						actions: ["toggleSelectedDate"]
					},
					{ guard: "isMultiPicker" },
					{
						guard: cd("closeOnSelect", "isOpenControlled"),
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
			isAboveMinView: ({ context: e, prop: t }) => ed(e.get("view"), t("minView")),
			isDayView: ({ context: e, event: t }) => (t.view || e.get("view")) === "day",
			isMonthView: ({ context: e, event: t }) => (t.view || e.get("view")) === "month",
			isYearView: ({ context: e, event: t }) => (t.view || e.get("view")) === "year",
			isRangePicker: ({ prop: e }) => e("selectionMode") === "range",
			hasSelectedRange: ({ context: e }) => e.get("value").length === 2,
			isMultiPicker: ({ prop: e }) => e("selectionMode") === "multiple",
			canSelectDate: (e) => {
				let { context: t, prop: n, event: r } = e, i = n("maxSelectedDates");
				if (i == null) return !0;
				let a = t.get("value"), o = fd(e, r.value ?? t.get("focusedValue"));
				return a.some((e) => Tl(e, o)) ? !0 : a.length < i;
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
				if (t("inline")) return;
				e.get("currentPlacement") || e.set("currentPlacement", t("positioning").placement);
				let r = Hu(n);
				return Ae(r, () => Vu(n), {
					...t("positioning"),
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			setupLiveRegion({ scope: e, refs: t }) {
				let n = e.getDoc();
				return t.set("announcer", po({
					level: "assertive",
					document: n
				})), () => t.get("announcer")?.destroy?.();
			},
			trackDismissableElement({ scope: e, send: t, context: n, prop: r }) {
				return r("inline") ? void 0 : In(() => Iu(e), {
					type: "popover",
					defer: !0,
					layerStyleTargets: [() => Vu(e)],
					exclude: [
						...Lu(e),
						Fu(e),
						Bu(e)
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
				let n = nd(e.get("view"), t("minView"), t("maxView"));
				e.set("view", n);
			},
			setPreviousView({ context: e, prop: t }) {
				let n = rd(e.get("view"), t("minView"), t("maxView"));
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
					o = e && t ? Il(e, t, i, a) : e ? Il(e, null, i, a) : t ? Il(t, null, i, a) : "";
				} else o = r.map((e) => Il(e, null, i, a)).filter(Boolean).join(",");
				n.get("announcer")?.announce(o, 3e3);
			},
			announceVisibleRange({ computed: e, refs: t }) {
				let { formatted: n } = e("visibleRangeText");
				t.get("announcer")?.announce(n);
			},
			disableTextSelection({ scope: e }) {
				bn({
					target: Iu(e),
					doc: e.getDoc()
				});
			},
			enableTextSelection({ scope: e }) {
				yn({
					doc: e.getDoc(),
					target: Iu(e)
				});
			},
			focusFirstSelectedDate(e) {
				let { context: t } = e;
				t.get("value").length && md(e, t.get("value")[0]);
			},
			syncInputElement({ scope: e, computed: t }) {
				Mt(() => {
					Lu(e).forEach((e, n) => {
						Ri(e, t("valueAsString")[n] || "");
					});
				});
			},
			setFocusedDate(e) {
				let { event: t } = e;
				md(e, Array.isArray(t.value) ? t.value[0] : t.value);
			},
			setFocusedValueForView(e) {
				let { context: t, event: n } = e;
				md(e, t.get("focusedValue").set({ [t.get("view")]: n.value }));
			},
			focusNextMonth(e) {
				let { context: t } = e;
				md(e, t.get("focusedValue").add({ months: 1 }));
			},
			focusPreviousMonth(e) {
				let { context: t } = e;
				md(e, t.get("focusedValue").subtract({ months: 1 }));
			},
			setDateValue({ context: e, event: t, prop: n }) {
				if (!Array.isArray(t.value)) return;
				let r = t.value.map((e) => Cl(e, n("min"), n("max")));
				e.set("value", r);
			},
			clearDateValue({ context: e }) {
				e.set("value", []);
			},
			setSelectedDate(e) {
				let { context: t, event: n } = e, r = Array.from(t.get("value")), i = t.get("activeIndex"), a = r[i];
				r[i] = pd(a, fd(e, n.value ?? t.get("focusedValue"))), t.set("value", Uu(r));
			},
			resetSelection(e) {
				let { context: t, event: n } = e, r = t.get("value")[0], i = fd(e, n.value ?? t.get("focusedValue"));
				t.set("value", [pd(r, i)]);
			},
			toggleSelectedDate(e) {
				let { context: t, event: n } = e, r = fd(e, n.value ?? t.get("focusedValue")), i = t.get("value"), a = i.findIndex((e) => Tl(e, r));
				if (a === -1) {
					let e = [...i, r];
					t.set("value", Gu(e));
				} else {
					let e = Array.from(i);
					e.splice(a, 1), t.set("value", Gu(e));
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
				n[r] = pd(i, e.get("focusedValue").copy()), e.set("value", Uu(n));
				let a = t("valueAsString");
				e.set("inputValue", a[r]);
			},
			focusPreviousDay(e) {
				let { context: t } = e;
				md(e, t.get("focusedValue").subtract({ days: 1 }));
			},
			focusNextDay(e) {
				let { context: t } = e;
				md(e, t.get("focusedValue").add({ days: 1 }));
			},
			focusPreviousWeek(e) {
				let { context: t } = e;
				md(e, t.get("focusedValue").subtract({ weeks: 1 }));
			},
			focusNextWeek(e) {
				let { context: t } = e;
				md(e, t.get("focusedValue").add({ weeks: 1 }));
			},
			focusNextPage(e) {
				let { context: t, computed: n, prop: r } = e;
				hd(e, tu(t.get("focusedValue"), t.get("startValue"), n("visibleDuration"), r("locale"), r("min"), r("max")));
			},
			focusPreviousPage(e) {
				let { context: t, computed: n, prop: r } = e;
				hd(e, nu(t.get("focusedValue"), t.get("startValue"), n("visibleDuration"), r("locale"), r("min"), r("max")));
			},
			focusSectionStart(e) {
				let { context: t } = e;
				md(e, t.get("startValue").copy());
			},
			focusSectionEnd(e) {
				let { computed: t } = e;
				md(e, t("endValue").copy());
			},
			focusNextSection(e) {
				let { context: t, event: n, computed: r, prop: i } = e, a = ru(t.get("focusedValue"), t.get("startValue"), n.larger, r("visibleDuration"), i("locale"), i("min"), i("max"));
				a && hd(e, a);
			},
			focusPreviousSection(e) {
				let { context: t, event: n, computed: r, prop: i } = e, a = iu(t.get("focusedValue"), t.get("startValue"), n.larger, r("visibleDuration"), i("locale"), i("min"), i("max"));
				a && hd(e, a);
			},
			focusNextYear(e) {
				let { context: t } = e;
				md(e, t.get("focusedValue").add({ years: 1 }));
			},
			focusPreviousYear(e) {
				let { context: t } = e;
				md(e, t.get("focusedValue").subtract({ years: 1 }));
			},
			focusNextDecade(e) {
				let { context: t } = e;
				md(e, t.get("focusedValue").add({ years: 10 }));
			},
			focusPreviousDecade(e) {
				let { context: t } = e;
				md(e, t.get("focusedValue").subtract({ years: 10 }));
			},
			clearFocusedDate(e) {
				let { context: t, prop: n } = e, r = t.get("focusedValue").calendar;
				md(e, $l(n("timeZone"), r));
			},
			focusPreviousMonthColumn(e) {
				let { context: t, event: n } = e;
				md(e, t.get("focusedValue").subtract({ months: n.columns }));
			},
			focusNextMonthColumn(e) {
				let { context: t, event: n } = e;
				md(e, t.get("focusedValue").add({ months: n.columns }));
			},
			focusPreviousYearColumn(e) {
				let { context: t, event: n } = e;
				md(e, t.get("focusedValue").subtract({ years: n.columns }));
			},
			focusNextYearColumn(e) {
				let { context: t, event: n } = e;
				md(e, t.get("focusedValue").add({ years: n.columns }));
			},
			focusFirstMonth(e) {
				let { context: t } = e, n = t.get("focusedValue"), r = n.calendar.getMinimumMonthInYear?.(n) ?? 1;
				md(e, n.set({ month: r }));
			},
			focusLastMonth(e) {
				let { context: t } = e, n = t.get("focusedValue"), r = n.calendar.getMonthsInYear(n);
				md(e, n.set({ month: r }));
			},
			focusFirstYear(e) {
				let { context: t } = e, n = Ql(t.get("focusedValue").year);
				md(e, t.get("focusedValue").set({ year: n[0] }));
			},
			focusLastYear(e) {
				let { context: t } = e, n = Ql(t.get("focusedValue").year);
				md(e, t.get("focusedValue").set({ year: n[n.length - 1] }));
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
				n.src !== "input.click" && Mt(() => {
					Pu(e, t.get("view"))?.focus({ preventScroll: !0 });
				});
			},
			focusActiveCellIfNeeded({ scope: e, context: t, event: n }) {
				n.focus && Mt(() => {
					Pu(e, t.get("view"))?.focus({ preventScroll: !0 });
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
				Mt(() => {
					Fu(e)?.focus({ preventScroll: !0 });
				});
			},
			focusFirstInputElement({ scope: e, event: t }) {
				t.focus !== !1 && Mt(() => {
					let [t] = Lu(e);
					(t ?? Fu(e))?.focus({ preventScroll: !0 });
				});
			},
			focusInputElement({ scope: e }) {
				Mt(() => {
					let t = Lu(e);
					if (t.length === 0) {
						Fu(e)?.focus({ preventScroll: !0 });
						return;
					}
					let n = t.findLastIndex((e) => e.value !== ""), r = t[Math.max(n, 0)];
					r?.focus({ preventScroll: !0 }), r?.setSelectionRange(r.value.length, r.value.length);
				});
			},
			syncMonthSelectElement({ scope: e, context: t }) {
				Ri(zu(e), t.get("startValue").month.toString());
			},
			syncYearSelectElement({ scope: e, context: t }) {
				Ri(Ru(e), t.get("startValue").year.toString());
			},
			setInputValue({ context: e, event: t }) {
				e.get("activeIndex") === t.index && e.set("inputValue", t.value);
			},
			syncInputValue({ scope: e, context: t, event: n }) {
				queueMicrotask(() => {
					Ri(Lu(e)[n.index ?? t.get("activeIndex")], t.get("inputValue"));
				});
			},
			focusParsedDate(e) {
				let { event: t, prop: n } = e;
				if (t.index == null) return;
				let r = n("parse")(t.value, {
					locale: n("locale"),
					timeZone: n("timeZone")
				});
				r && Yu(r) && md(e, r);
			},
			selectParsedDate({ context: e, event: t, prop: n }) {
				if (t.index == null) return;
				let r = n("parse")(t.value, {
					locale: n("locale"),
					timeZone: n("timeZone")
				});
				if ((!r || !Yu(r)) && t.value && (r = e.get("focusedValue").copy()), !r) return;
				r = Cl(r, n("min"), n("max"));
				let i = Array.from(e.get("value"));
				i[t.index] = pd(i[t.index], r);
				let a = Uu(i);
				e.set("value", a);
				let o = ud(a, n);
				e.set("inputValue", o[t.index]);
			},
			resetView({ context: e }) {
				e.set("view", e.initial("view"));
			},
			setStartValue({ context: e, computed: t, prop: n }) {
				let r = e.get("focusedValue");
				if (!Dl(r, e.get("startValue"), t("endValue"))) return;
				let i = wl(r, "start", { months: n("numOfMonths") }, n("locale"));
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
}), fd = (e, t) => {
	let { context: n, prop: r } = e, i = n.get("view"), a = typeof t == "number" ? n.get("focusedValue").set({ [i]: t }) : t;
	return ad((e) => {
		td(e, r("minView")) && (a = a.set({ [e]: +(e === "day") }));
	}), a;
}, pd = (e, t) => {
	if (!e || !("hour" in e)) return t;
	let n = "timeZone" in e, r = t;
	return "hour" in t || (r = n ? Us(Vs(t), e.timeZone) : Vs(t)), r.set({
		hour: e.hour,
		minute: e.minute,
		second: e.second,
		millisecond: e.millisecond
	});
};
function md(e, t) {
	let { context: n, prop: r, computed: i } = e;
	if (!t) return;
	let a = fd(e, t);
	if (Tl(n.get("focusedValue"), a)) return;
	let o = eu(i("visibleDuration"), r("locale"), r("min"), r("max"))({
		focusedDate: a,
		startDate: n.get("startValue")
	});
	n.set("startValue", o.startDate), n.set("focusedValue", o.focusedDate);
}
function hd(e, t) {
	let { context: n } = e;
	n.set("startValue", t.startDate), !Tl(n.get("focusedValue"), t.focusedDate) && n.set("focusedValue", t.focusedDate);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-picker@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-picker/dist/date-picker.parse.mjs
function gd(e) {
	return Array.isArray(e) ? e.map((e) => gd(e)) : e instanceof Date ? new wc(e.getFullYear(), e.getMonth() + 1, e.getDate()) : gc(e);
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-context.js
var [_d, vd] = Zt({
	name: "DatePickerContext",
	hookName: "useDatePickerContext",
	providerName: "<DatePickerProvider />"
}), yd = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function bd(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, yd), a = vd(), o = G(() => Q(a().getClearTriggerProps(), i));
	return X(e, q({ as: "button" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(bd, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-content.svelte
var xd = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Sd(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, xd), a = vd(), s = qn(), c = G(() => Q(a().getContentProps(), s().getPresenceProps(), i));
	function l(e) {
		s().setNode(e);
	}
	var u = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	}, d = D(), f = R(d), p = (e) => {
		X(e, q({ as: "div" }, () => B(c), {
			[o()]: l,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, m = G(() => !s().unmounted);
	return w(f, (e) => {
		B(m) && e(p);
	}), T(e, d), g(u);
}
N(Sd, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-context.svelte
function Cd(e, t) {
	I(t, !0);
	let n = O(t, "render", 7), i = vd();
	var a = {
		get render() {
			return n();
		},
		set render(e) {
			n(e), r();
		}
	}, o = D(), s = R(o);
	return u(s, n, () => i), T(e, o), g(a);
}
N(Cd, { render: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-control.svelte
var wd = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Td(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, wd), a = vd(), o = G(() => Q(a().getControlProps(), i));
	return X(e, q({ as: "div" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(Td, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-view-props-context.js
var [Ed, Dd] = Zt({
	name: "DatePickerViewPropsContext",
	hookName: "useDatePickerViewPropsContext",
	providerName: "<DatePickerViewPropsProvider />"
}), Od = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function kd(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, Od), a = vd(), o = Dd(), s = G(() => Q(a().getNextTriggerProps(o()), i));
	return X(e, q({ as: "button" }, () => B(s), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(kd, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-positioner.svelte
var Ad = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function jd(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, Ad), a = vd(), o = qn(), s = G(() => Q(a().getPositionerProps(), i));
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	}, l = D(), u = R(l), d = (e) => {
		X(e, q({ as: "div" }, () => B(s), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = G(() => !o().unmounted);
	return w(u, (e) => {
		B(f) && e(d);
	}), T(e, l), g(c);
}
N(jd, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-prev-trigger.svelte
var Md = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Nd(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, Md), a = vd(), o = Dd(), s = G(() => Q(a().getPrevTriggerProps(o()), i));
	return X(e, q({ as: "button" }, () => B(s), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(Nd, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-range-text.svelte
var Pd = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Fd(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, Pd), a = vd(), o = G(() => Q(a().getRangeTextProps(), i)), s = G(() => {
		let { start: e, end: t } = a().visibleRangeText;
		return un([e, t]).filter(Boolean).join(" - ");
	});
	return X(e, q({ as: "div" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		},
		children: (e, t) => {
			m();
			var n = le();
			U(() => E(n, B(s))), T(e, n);
		},
		$$slots: { default: !0 }
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(Fd, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker.svelte.js
var Id = (e) => {
	let t = Nt(), n = Ut(), r = G(() => {
		let r = rn(e);
		return {
			dir: n().dir,
			locale: n().locale,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = zt(dd, () => B(r)), a = G(() => sd(i, Et));
	return () => B(a);
}, Ld = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"value"
]);
function Rd(e, t) {
	I(t, !0);
	let n = O(t, "value", 7), i = W(t, Ld), a = G(() => Ln(i)), o = G(() => f(B(a), 2)), s = G(() => B(o)[0]), c = G(() => B(o)[1]), l = Un(() => ({
		present: n()().open,
		...B(s)
	})), u = G(() => Q(n()().getRootProps(), B(c)));
	return _d(() => n()()), Gn(l), X(e, q({ as: "div" }, () => B(u))), g({
		get value() {
			return n();
		},
		set value(e) {
			n(e), r();
		}
	});
}
N(Rd, { value: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-table-props-context.js
var [zd, Bd] = Zt({
	name: "DatePickerTablePropsContext",
	hookName: "useDatePickerTablePropsContext",
	providerName: "<DatePickerTablePropsProvider />"
}), Vd = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"columns"
]);
function Hd(e, t) {
	let n = M();
	I(t, !0);
	let i = O(t, "columns", 7), a = W(t, Vd), o = vd(), s = Dd(), c = G(() => ({
		id: n,
		columns: i(),
		...s()
	})), l = G(() => Q(o().getTableProps(B(c)), a));
	return zd(() => B(c)), X(e, q({ as: "table" }, () => B(l))), g({
		get columns() {
			return i();
		},
		set columns(e) {
			i(e), r();
		}
	});
}
N(Hd, { columns: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-body.svelte
var Ud = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Wd(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, Ud), a = vd(), o = G(() => Q(a().getTableBodyProps(), i));
	return X(e, q({ as: "tbody" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(Wd, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-head.svelte
var Gd = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Kd(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, Gd), a = vd(), o = Bd(), s = G(() => Q(a().getTableHeadProps(o()), i));
	return X(e, q({ as: "thead" }, () => B(s), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(Kd, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-row.svelte
var qd = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Jd(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, qd), a = vd(), o = Bd(), s = G(() => Q(a().getTableRowProps(o()), i));
	return X(e, q({ as: "tr" }, () => B(s), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(Jd, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-trigger.svelte
var Yd = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Xd(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, Yd), a = vd(), o = G(() => Q(a().getTriggerProps(), i));
	return X(e, q({ as: "button" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(Xd, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-table-cell-props-context.js
var [Zd, Qd] = Zt({
	name: "DatePickerTableCellPropsContext",
	hookName: "useDatePickerTableCellPropsContext",
	providerName: "<DatePickerTableCellPropsProvider />"
}), $d = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function ef(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, $d), a = G(() => Wt()(i, [
		"disabled",
		"value",
		"visibleRange",
		"columns"
	])), o = G(() => f(B(a), 2)), s = G(() => B(o)[0]), c = G(() => B(o)[1]), l = vd(), u = Dd(), d = G(() => () => ({
		day: l().getDayTableCellProps,
		month: l().getMonthTableCellProps,
		year: l().getYearTableCellProps
	})[u().view](B(s))), p = G(() => Q(B(d), B(c)));
	return Zd(() => B(s)), X(e, q({ as: "td" }, () => B(p), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(ef, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-cell-trigger.svelte
var tf = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function nf(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, tf), a = vd(), o = Qd(), s = Dd(), c = G(() => {
		let e = {
			day: a().getDayTableCellTriggerProps,
			month: a().getMonthTableCellTriggerProps,
			year: a().getYearTableCellTriggerProps
		}[s().view];
		return e(o());
	}), l = G(() => Q(B(c), i));
	return X(e, q({ as: "button" }, () => B(l), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(nf, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-header.svelte
var rf = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function af(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, rf), a = vd(), o = Bd(), s = G(() => Q(a().getTableHeaderProps(o()), i));
	return X(e, q({ as: "th" }, () => B(s), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(af, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-view.svelte
var of = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function sf(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, of), a = G(() => Wt()(i, ["view"])), o = G(() => f(B(a), 2)), s = G(() => B(o)[0]), c = G(() => B(o)[1]), l = vd(), u = G(() => Q(l().getViewProps(B(s)), B(c)));
	return Ed(() => B(s)), X(e, q({ as: "div" }, () => B(u), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(sf, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-view-control.svelte
var cf = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function lf(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, cf), a = vd(), o = Dd(), s = G(() => Q(a().getViewControlProps(o()), i));
	return X(e, q({ as: "div" }, () => B(s), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(lf, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-view-trigger.svelte
var uf = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function df(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, uf), a = vd(), o = Dd(), s = G(() => Q(a().getViewTriggerProps(o()), i));
	return X(e, q({ as: "button" }, () => B(s), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(df, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/DateField.svelte
var ff = (e, t = l) => {
	var n = pf(), r = F(n);
	U(() => x(r, "d", t())), T(e, n);
}, pf = e("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-1voin8a\"><path></path></svg>"), mf = y("<input data-scope=\"date-picker\" autocomplete=\"off\" spellcheck=\"false\" class=\"svelte-1voin8a\"/>"), hf = y("<span id=\"af-described\" hidden=\"\"> </span>"), gf = y("<!> <span part=\"separator\" class=\"separator svelte-1voin8a\" aria-hidden=\"true\">–</span> <!>", 1), _f = y("<input part=\"input\" data-scope=\"date-picker\" autocomplete=\"off\" spellcheck=\"false\" class=\"svelte-1voin8a\"/>"), vf = e("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-1voin8a\"><path d=\"M8 2v4\"></path><path d=\"M16 2v4\"></path><rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\"></rect><path d=\"M3 10h18\"></path></svg>"), yf = y("<!> <!>", 1), bf = y("<!> <!> <!>", 1), xf = y("<!> <!> <!> <footer class=\"svelte-1voin8a\"><button type=\"button\" part=\"today\" class=\"af-button ghost sm\"> </button> <!></footer>", 1), Sf = y("<div class=\"af-kit\"><!> <!></div>"), Cf = {
	hash: "svelte-1voin8a",
	code: ":host {display:inline-block;max-width:100%;vertical-align:middle;}input.svelte-1voin8a {flex:1;min-width:0;width:8.5em;padding:0;border:0;outline:none;background:transparent;color:inherit;font:inherit;}input.svelte-1voin8a::placeholder {color:var(--k-muted);opacity:1;}.separator.svelte-1voin8a {flex:none;color:var(--k-muted);}footer.svelte-1voin8a {display:flex;justify-content:space-between;gap:8px;margin-top:8px;}[data-scope='date-picker'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='date-picker'][hidden] {display:none !important;}[data-scope='date-picker'][data-part='control'] {position:relative;display:flex;align-items:center;box-sizing:border-box;width:100%;height:36px;padding:4px 36px 4px 12px;border:1px solid var(--k-input);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark, 0) * 100%), transparent);box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);font-size:16px;line-height:24px;transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);}\n  @media (min-width: 48rem) {[data-scope='date-picker'][data-part='control'] {font-size:14px;line-height:20px;} }[data-scope='date-picker'][data-part='control']:has(input:focus-visible) {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring), 0 1px 2px 0 rgb(0 0 0 / 0.05);}[data-scope='date-picker'][data-part='control'][data-disabled] {opacity:0.5;cursor:not-allowed;}[data-scope='date-picker'][data-part='control'].range {gap:8px;height:auto;padding:0;border:0;border-radius:0;background:none;box-shadow:none;transition:none;}[data-scope='date-picker'][data-part='control'].range:has(input:focus-visible) {box-shadow:none;}[data-scope='date-picker'][data-part='control'].range input.svelte-1voin8a {box-sizing:border-box;flex:1 1 auto;width:calc(8.5em + 26px);height:36px;min-height:0;padding:4px 12px;border:1px solid var(--k-input);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark, 0) * 100%), transparent);box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);}[data-scope='date-picker'][data-part='control'].range input.svelte-1voin8a:last-of-type {width:calc(8.5em + 50px);padding-right:36px;}[data-scope='date-picker'][data-part='control'].range input.svelte-1voin8a:focus-visible {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring), 0 1px 2px 0 rgb(0 0 0 / 0.05);}[data-scope='date-picker'][data-part='trigger'] {position:absolute;top:50%;right:4px;display:flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0 solid var(--k-line);border-radius:4px;background:transparent;color:var(--k-muted);outline:none;cursor:pointer;transform:translateY(-50%);}[data-scope='date-picker'][data-part='trigger'] svg.svelte-1voin8a {width:14px;height:14px;pointer-events:none;}\n  @media (hover: hover) {[data-scope='date-picker'][data-part='trigger']:not(:disabled):hover {background-color:var(--k-muted-bg);color:color-mix(in oklab, var(--k-fg) 55%, var(--k-muted));} }[data-scope='date-picker'][data-part='trigger']:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[data-scope='date-picker'][data-part='trigger']:disabled {opacity:0.5;pointer-events:none;}[data-scope='date-picker'][data-part='content'] {padding:12px;outline:none;}.af-button.icon[data-scope='date-picker'][data-part='prev-trigger'], .af-button.icon[data-scope='date-picker'][data-part='next-trigger'] {padding-inline:12px;}[data-scope='date-picker'][data-part='view-control'] {display:flex;align-items:center;justify-content:space-between;gap:4px;margin-bottom:16px;}[data-scope='date-picker'][data-part='table'] {border-collapse:collapse;}[data-scope='date-picker'][data-part='table-header'] {padding:0;color:var(--k-muted);font-size:0.8rem;font-weight:400;}[data-scope='date-picker'][data-part='table-cell'] {padding:8px 0 0;text-align:center;}[data-scope='date-picker'][data-part='table-cell-trigger'] {display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:32px;height:32px;padding:0;border:0 solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background:transparent;color:inherit;outline:none;font:inherit;font-size:14px;font-weight:400;line-height:1;cursor:pointer;-webkit-user-select:none;user-select:none;transition:background-color 100ms cubic-bezier(0.2, 0, 0, 1), color 100ms cubic-bezier(0.2, 0, 0, 1), box-shadow 100ms cubic-bezier(0.2, 0, 0, 1);}[data-scope='date-picker'][data-part='table-cell-trigger'][data-view='month'], [data-scope='date-picker'][data-part='table-cell-trigger'][data-view='year'] {width:auto;min-width:56px;padding:0 8px;}[data-scope='date-picker'][data-part='table-cell-trigger'][data-today] {background-color:var(--k-accent);color:var(--k-accent-fg);}[data-scope='date-picker'][data-part='table-cell-trigger'][data-outside-range] {color:var(--k-muted);}\n  @media (hover: hover) {[data-scope='date-picker'][data-part='table-cell-trigger']:hover:not([data-disabled], [data-selected]) {background-color:color-mix(in oklab, var(--k-accent) calc(100% - var(--k-dark, 0) * 50%), transparent);color:var(--k-accent-fg);}\n  }[data-scope='date-picker'][data-part='table-cell-trigger'][data-in-range]:not([data-selected]) {border-radius:0;background-color:var(--k-accent);color:var(--k-accent-fg);}[data-scope='date-picker'][data-part='table-cell-trigger'][data-selected] {background-color:var(--k-primary);color:var(--k-primary-fg);}[data-scope='date-picker'][data-part='table-cell-trigger']:focus-visible {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring);}[data-scope='date-picker'][data-part='table-cell-trigger'][data-disabled]:not([data-outside-range]) {opacity:0.5;color:var(--k-muted);cursor:not-allowed;}\n  @media (prefers-reduced-motion: reduce) {[data-scope='date-picker'][data-part='control'] input.svelte-1voin8a, [data-scope='date-picker'][data-part='control'], [data-scope='date-picker'][data-part='table-cell-trigger'] {transition:none;} }\n  @media (forced-colors: active) {[data-scope='date-picker'][data-part='control']:has(input:focus-visible), [data-scope='date-picker'][data-part='trigger']:focus-visible,\n    [data-scope='date-picker'][data-part='table-cell-trigger']:focus-visible,\n    [data-scope='date-picker'][data-part='content']:focus-visible,\n    [data-scope='date-picker'][data-part='control'].range input.svelte-1voin8a:focus-visible {outline:2px solid;outline-offset:2px;}[data-scope='date-picker'][data-part='table-cell-trigger'][data-in-range]:not([data-selected]) {border:1px dashed CanvasText;}[data-scope='date-picker'][data-part='table-cell-trigger'][data-selected] {forced-color-adjust:none;background-color:Highlight;color:HighlightText;}[data-scope='date-picker'][data-part='table-cell-trigger'][data-today]:not([data-selected]) {border:1px solid CanvasText;}\n  }"
};
function wf(e, t) {
	let n = M();
	I(t, !0), c(e, Cf);
	let i = (e, t = l) => {
		var n = mf();
		de(n), te(n, (e) => {
			t() === "start" ? J(Ke, e, !0) : J(qe, e, !0);
		}, () => t() === "start" ? B(Ke) : B(qe)), U(() => {
			x(n, "part", `input ${t() ?? ""}`), x(n, "data-part", B(Fe) ? void 0 : "input"), h(n, t() === "start" ? B(je) : B(Me)), x(n, "placeholder", p() || "dd/mm/yyyy"), x(n, "aria-label", _() ? `${_()}: ${t() === "start" ? B(W).rangeStart : B(W).rangeEnd}` : t() === "start" ? B(W).rangeStart : B(W).rangeEnd), x(n, "aria-describedby", B(Qe) ? "af-described" : void 0), x(n, "aria-invalid", N() ? "true" : void 0), x(n, "aria-required", ee() ? "true" : void 0), n.readOnly = !!A(), n.disabled = B(Ze);
		}), oe("keydown", n, (e) => {
			e.key === "Enter" && !e.isComposing && (e.preventDefault(), lt(t()));
		}), oe("input", n, () => Ye[t()] = !0), ie("blur", n, () => lt(t())), T(e, n);
	}, a = O(t, "value", 7, null), o = O(t, "locale", 7, null), u = O(t, "min", 7, null), d = O(t, "max", 7, null), f = O(t, "clearable", 7, !1), p = O(t, "placeholder", 7, null), _ = O(t, "label", 7, null), y = O(t, "disabled", 7, !1), S = O(t, "strings", 7, null), k = O(t, "name", 7, null), ee = O(t, "required", 7, !1), A = O(t, "readonly", 7, !1), ne = O(t, "description", 7, null), re = O(t, "error", 7, null), N = O(t, "invalid", 7, !1), L = O(t, "range", 7, !1), z = O(t, "start", 7, null), ae = O(t, "end", 7, null), H = O(t, "format", 7, null), se = t.$$host, ce = we(se), W = G(() => he(o(), S() ?? void 0)), ue = G(() => ve(o()) ? "vi-VN" : "en-GB"), fe = G(() => dr(a())), pe = G(() => dr(u())), Y = G(() => dr(d())), ye = G(() => !L() && gr(H()) ? H() : null), be = (e) => B(ye) ? _r(e, B(ye)) ?? "" : pr(e, o()), xe = (e) => (B(ye) ? vr(e, B(ye)) : null) ?? dr(e.trim()), Se = G(() => B(fe) ? be(B(fe)) : ""), Te = K(!1);
	j(() => {
		B(Se), B(ye), J(Te, !1);
	}), j(() => {
		se.toggleAttribute("data-unparsed", B(Te));
	});
	let Ee = G(() => B(fe) !== null && (B(pe) !== null && B(fe) < B(pe) || B(Y) !== null && B(fe) > B(Y))), Oe = G(() => B(fe) && !B(Ee) ? [gd(B(fe))] : []), ke = G(() => dr(z())), Ae = G(() => dr(ae())), je = G(() => B(ke) ? pr(B(ke), o()) : ""), Me = G(() => B(Ae) ? pr(B(Ae), o()) : ""), Ne = G(() => B(ke) !== null && at(B(ke))), Pe = G(() => B(Ae) !== null && at(B(Ae))), Fe = G(() => B(Ne) || B(Pe)), Ie = K(null), Le = G(() => B(Ie) ?? (B(Fe) ? [] : B(ke) && B(Ae) ? [gd(B(ke)), gd(B(Ae))] : B(ke) ? [gd(B(ke))] : [])), Re = G(() => L() ? B(Le) : B(Oe)), Be = G(() => L() ? B(ke) !== null || B(Ae) !== null : B(Ee)), He = (e) => e === "month" ? B(W).viewMonth : e === "year" ? B(W).viewYear : B(W).viewDay, Ue = K(!1), We = K(null), Ge = K(null), Ke = K(null), qe = K(null), Je = !1, Ye = {
		start: !1,
		end: !1
	};
	j(() => De(B(We), B(Ue), se));
	let Xe = K(!1), Ze = G(() => !!y() || B(Xe)), Qe = G(() => [ne(), re()].filter(Boolean).join(" ")), $e = (e) => e !== null && B(pe) !== null && e < B(pe), et = (e) => e !== null && B(Y) !== null && e > B(Y), tt = G(() => L() ? ee() && B(ke) === null && B(Ae) === null ? { valueMissing: !0 } : $e(B(ke)) || $e(B(Ae)) ? { rangeUnderflow: !0 } : et(B(ke)) || et(B(Ae)) ? { rangeOverflow: !0 } : {} : B(Te) ? { badInput: !0 } : ee() && B(fe) === null ? { valueMissing: !0 } : $e(B(fe)) ? { rangeUnderflow: !0 } : et(B(fe)) ? { rangeOverflow: !0 } : {}), nt = G(() => "badInput" in B(tt) ? ge(me(B(W), "badDate"), { format: B(ye) ?? "" }) : "valueMissing" in B(tt) ? me(B(W), "valueMissing") : "rangeUnderflow" in B(tt) ? ge(me(B(W), "rangeUnderflow"), { min: pr(B(pe), o()) }) : "rangeOverflow" in B(tt) ? ge(me(B(W), "rangeOverflow"), { max: pr(B(Y), o()) }) : ""), rt = G(() => L() ? B(ke) === null && B(Ae) === null ? null : `${B(ke) ?? ""}/${B(Ae) ?? ""}` : B(fe)), it = G(() => L() ? !B(Ne) && B(Pe) ? B(qe) : B(Ke) : B(Ge));
	j(() => Ve(se, {
		name: k(),
		value: B(rt),
		validity: B(tt),
		message: B(nt),
		anchor: B(it)
	})), ze(se, {
		reset() {
			if (L()) {
				let e = {
					start: dr(se.getAttribute("start")),
					end: dr(se.getAttribute("end"))
				};
				(e.start !== B(ke) || e.end !== B(Ae)) && Ce(se, "change", e);
				return;
			}
			let e = dr(se.getAttribute("value"));
			e !== B(fe) && Ce(se, "change", { value: e });
		},
		disabled(e) {
			J(Xe, e, !0);
		}
	});
	function at(e) {
		return B(pe) !== null && e < B(pe) || B(Y) !== null && e > B(Y);
	}
	function ot(e) {
		let t = e !== null && at(e);
		return (t ? B(Te) : e !== B(fe) || B(Te)) && Ce(se, "change", { value: t ? B(fe) : e }), !t && (B(Te) && B(Ge) && (B(Ge).value = B(Se)), J(Te, !1), !0);
	}
	function st() {
		if (!B(Ge) || !Je) return;
		Je = !1;
		let e = B(Ge).value.trim();
		if (B(ye)) {
			let t = e === "" ? null : xe(e);
			if (e !== "" && t === null) {
				J(Te, !0), Ce(se, "unparsed", { text: B(Ge).value });
				return;
			}
			ot(t), J(Te, !1), B(Ge).value = B(Se);
			return;
		}
		let t = e === "" ? f() ? null : void 0 : fr(e) ?? void 0;
		t !== void 0 && t !== B(fe) && ot(t), B(Ge).value = B(Se);
	}
	function ct(e, t) {
		return e !== null && e !== B(ke) && at(e) || t !== null && t !== B(Ae) && at(t) || e !== null && t !== null && t < e ? !1 : ((e !== B(ke) || t !== B(Ae)) && Ce(se, "change", {
			start: e,
			end: t
		}), !0);
	}
	function lt(e) {
		let t = B(e === "start" ? Ke : qe);
		if (!t || !Ye[e]) return;
		Ye[e] = !1;
		let n = t.value.trim(), r = n === "" ? null : fr(n);
		(n === "" || r !== null) && (e === "start" ? ct(r, B(Ae)) : ct(B(ke), r)), t.value = B(e === "start" ? je : Me);
	}
	function ut(e) {
		let [t, n] = e;
		if (t) {
			if (!n) {
				J(Ie, [t], !0);
				return;
			}
			J(Ie, null), ct(t.toString(), n.toString());
		}
	}
	function dt(e) {
		let t = yr();
		e().setFocusedValue(gd(t)), requestAnimationFrame(() => se.shadowRoot?.querySelector(`[data-part="table-cell-trigger"][data-view="day"][data-value="${t}"]`)?.focus());
	}
	function ft(e) {
		e().setOpen(!1), se.shadowRoot?.querySelector("[part=\"trigger\"]")?.focus();
	}
	let pt = Id(() => ({
		id: n,
		dir: ce,
		getRootNode: () => se.shadowRoot,
		value: B(Re),
		locale: B(ue),
		selectionMode: L() ? "range" : "single",
		min: B(pe) ? gd(B(pe)) : void 0,
		max: B(Y) ? gd(B(Y)) : void 0,
		disabled: B(Ze),
		readOnly: !!A(),
		fixedWeeks: !0,
		positioning: {
			strategy: "fixed",
			placement: "bottom-start"
		},
		format: (e) => be(e.toString()),
		translations: {
			trigger: (e) => e ? B(W).closeCalendar : B(W).openCalendar,
			content: B(W).calendar,
			clearTrigger: B(W).clear,
			dayCell: (e) => ge(e.selected ? B(W).selectedDate : B(W).chooseDate, { date: e.valueText }),
			viewTrigger: (e, t) => ge(t ? B(W).switchView : B(W).currentView, { view: He(t ?? e) }),
			prevTrigger: (e) => e === "day" ? B(W).previousMonth : e === "month" ? B(W).previousYear : B(W).previousDecade,
			nextTrigger: (e) => e === "day" ? B(W).nextMonth : e === "month" ? B(W).nextYear : B(W).nextDecade
		},
		onValueChange: (e) => L() ? ut(e.value) : ot(e.value[0]?.toString() ?? null),
		onOpenChange: (e) => {
			if (J(Ue, e.open, !0), !e.open) J(Ie, null);
			else if (B(ye) && B(Ge)) {
				let e = xe(B(Ge).value);
				e && pt().setFocusedValue(gd(e));
			}
		}
	}));
	var mt = {
		get value() {
			return a();
		},
		set value(e = null) {
			a(e), r();
		},
		get locale() {
			return o();
		},
		set locale(e = null) {
			o(e), r();
		},
		get min() {
			return u();
		},
		set min(e = null) {
			u(e), r();
		},
		get max() {
			return d();
		},
		set max(e = null) {
			d(e), r();
		},
		get clearable() {
			return f();
		},
		set clearable(e = !1) {
			f(e), r();
		},
		get placeholder() {
			return p();
		},
		set placeholder(e = null) {
			p(e), r();
		},
		get label() {
			return _();
		},
		set label(e = null) {
			_(e), r();
		},
		get disabled() {
			return y();
		},
		set disabled(e = !1) {
			y(e), r();
		},
		get strings() {
			return S();
		},
		set strings(e = null) {
			S(e), r();
		},
		get name() {
			return k();
		},
		set name(e = null) {
			k(e), r();
		},
		get required() {
			return ee();
		},
		set required(e = !1) {
			ee(e), r();
		},
		get readonly() {
			return A();
		},
		set readonly(e = !1) {
			A(e), r();
		},
		get description() {
			return ne();
		},
		set description(e = null) {
			ne(e), r();
		},
		get error() {
			return re();
		},
		set error(e = null) {
			re(e), r();
		},
		get invalid() {
			return N();
		},
		set invalid(e = !1) {
			N(e), r();
		},
		get range() {
			return L();
		},
		set range(e = !1) {
			L(e), r();
		},
		get start() {
			return z();
		},
		set start(e = null) {
			z(e), r();
		},
		get end() {
			return ae();
		},
		set end(e = null) {
			ae(e), r();
		},
		get format() {
			return H();
		},
		set format(e = null) {
			H(e), r();
		}
	}, ht = yf(), gt = R(ht);
	_e(gt, {});
	var _t = P(gt, 2);
	return Yt(_t, {
		value: () => se.shadowRoot,
		children: (e, t) => {
			Vc(e, {
				get dir() {
					return ce;
				},
				children: (e, t) => {
					var n = Sf(), r = V(n), a = (e) => {
						var t = hf(), n = F(t, !0);
						U(() => E(n, B(Qe))), T(e, t);
					};
					w(r, (e) => {
						B(Qe) && e(a);
					});
					var o = P(r, 2);
					b(o, () => Rd, (e, t) => {
						t(e, {
							get value() {
								return pt;
							},
							children: (e, t) => {
								var n = yf(), r = R(n);
								{
									let e = G(() => L() ? "range" : void 0);
									b(r, () => Td, (t, n) => {
										n(t, {
											part: "control",
											get class() {
												return B(e);
											},
											children: (e, t) => {
												var n = yf(), r = R(n), a = (e) => {
													var t = gf(), n = R(t);
													i(n, () => "start");
													var r = P(n, 4);
													i(r, () => "end"), T(e, t);
												}, o = (e) => {
													var t = _f();
													de(t), te(t, (e) => J(Ge, e), () => B(Ge)), U(() => {
														x(t, "data-part", B(Ee) ? void 0 : "input"), h(t, B(Se)), x(t, "placeholder", p() || B(ye) || "dd/mm/yyyy"), x(t, "aria-label", _() || p() || void 0), x(t, "aria-describedby", B(Qe) ? "af-described" : void 0), x(t, "aria-invalid", N() || B(Te) ? "true" : void 0), x(t, "aria-required", ee() ? "true" : void 0), t.readOnly = !!A(), t.disabled = B(Ze);
													}), oe("keydown", t, (e) => {
														e.key === "Enter" && !e.isComposing && (e.preventDefault(), st());
													}), oe("input", t, () => Je = !0), ie("blur", t, st), T(e, t);
												};
												w(r, (e) => {
													L() ? e(a) : e(o, -1);
												});
												var s = P(r, 2);
												b(s, () => Xd, (e, t) => {
													t(e, {
														part: "trigger",
														children: (e, t) => {
															var n = vf();
															T(e, n);
														},
														$$slots: { default: !0 }
													});
												}), T(e, n);
											},
											$$slots: { default: !0 }
										});
									});
								}
								var a = P(r, 2);
								b(a, () => jd, (e, t) => {
									t(e, {
										popover: "manual",
										get ref() {
											return B(We);
										},
										set ref(e) {
											J(We, e, !0);
										},
										children: (e, t) => {
											var n = D(), r = R(n);
											b(r, () => Sd, (e, t) => {
												t(e, {
													class: "af-overlay date",
													part: "content",
													children: (e, t) => {
														var n = D(), r = R(n);
														{
															let e = (e, t = l) => {
																var n = xf(), r = R(n);
																b(r, () => sf, (e, n) => {
																	n(e, {
																		view: "day",
																		children: (e, n) => {
																			var r = yf(), i = R(r);
																			b(i, () => lf, (e, t) => {
																				t(e, {
																					children: (e, t) => {
																						var n = bf(), r = R(n);
																						b(r, () => Nd, (e, t) => {
																							t(e, {
																								class: "af-button ghost icon sm",
																								children: (e, t) => {
																									ff(e, () => "m15 18-6-6 6-6");
																								},
																								$$slots: { default: !0 }
																							});
																						});
																						var i = P(r, 2);
																						b(i, () => df, (e, t) => {
																							t(e, {
																								class: "af-button ghost sm",
																								children: (e, t) => {
																									var n = D(), r = R(n);
																									b(r, () => Fd, (e, t) => {
																										t(e, {});
																									}), T(e, n);
																								},
																								$$slots: { default: !0 }
																							});
																						});
																						var a = P(i, 2);
																						b(a, () => kd, (e, t) => {
																							t(e, {
																								class: "af-button ghost icon sm",
																								children: (e, t) => {
																									ff(e, () => "m9 18 6-6-6-6");
																								},
																								$$slots: { default: !0 }
																							});
																						}), T(e, n);
																					},
																					$$slots: { default: !0 }
																				});
																			});
																			var a = P(i, 2);
																			b(a, () => Hd, (e, n) => {
																				n(e, {
																					children: (e, n) => {
																						var r = yf(), i = R(r);
																						b(i, () => Kd, (e, n) => {
																							n(e, {
																								children: (e, n) => {
																									var r = D(), i = R(r);
																									b(i, () => Jd, (e, n) => {
																										n(e, {
																											children: (e, n) => {
																												var r = D(), i = R(r);
																												C(i, 17, () => t()().weekDays, s, (e, t) => {
																													var n = D(), r = R(n);
																													b(r, () => af, (e, n) => {
																														n(e, {
																															children: (e, n) => {
																																m();
																																var r = le();
																																U(() => E(r, B(t).narrow)), T(e, r);
																															},
																															$$slots: { default: !0 }
																														});
																													}), T(e, n);
																												}), T(e, r);
																											},
																											$$slots: { default: !0 }
																										});
																									}), T(e, r);
																								},
																								$$slots: { default: !0 }
																							});
																						});
																						var a = P(i, 2);
																						b(a, () => Wd, (e, n) => {
																							n(e, {
																								children: (e, n) => {
																									var r = D(), i = R(r);
																									C(i, 17, () => t()().weeks, s, (e, n, r) => {
																										var i = D(), a = R(i);
																										b(a, () => Jd, (e, n) => {
																											n(e, {
																												children: (e, n) => {
																													var i = D(), a = R(i);
																													C(a, 17, () => t()().getDaysInWeek(r), (e) => e.toString(), (e, t) => {
																														var n = D(), r = R(n);
																														b(r, () => ef, (e, n) => {
																															n(e, {
																																get value() {
																																	return B(t);
																																},
																																children: (e, n) => {
																																	var r = D(), i = R(r);
																																	b(i, () => nf, (e, n) => {
																																		n(e, {
																																			children: (e, n) => {
																																				m();
																																				var r = le();
																																				U(() => E(r, B(t).day)), T(e, r);
																																			},
																																			$$slots: { default: !0 }
																																		});
																																	}), T(e, r);
																																},
																																$$slots: { default: !0 }
																															});
																														}), T(e, n);
																													}), T(e, i);
																												},
																												$$slots: { default: !0 }
																											});
																										}), T(e, i);
																									}), T(e, r);
																								},
																								$$slots: { default: !0 }
																							});
																						}), T(e, r);
																					},
																					$$slots: { default: !0 }
																				});
																			}), T(e, r);
																		},
																		$$slots: { default: !0 }
																	});
																});
																var i = P(r, 2);
																b(i, () => sf, (e, n) => {
																	n(e, {
																		view: "month",
																		children: (e, n) => {
																			var r = yf(), i = R(r);
																			b(i, () => lf, (e, t) => {
																				t(e, {
																					children: (e, t) => {
																						var n = bf(), r = R(n);
																						b(r, () => Nd, (e, t) => {
																							t(e, {
																								class: "af-button ghost icon sm",
																								children: (e, t) => {
																									ff(e, () => "m15 18-6-6 6-6");
																								},
																								$$slots: { default: !0 }
																							});
																						});
																						var i = P(r, 2);
																						b(i, () => df, (e, t) => {
																							t(e, {
																								class: "af-button ghost sm",
																								children: (e, t) => {
																									var n = D(), r = R(n);
																									b(r, () => Fd, (e, t) => {
																										t(e, {});
																									}), T(e, n);
																								},
																								$$slots: { default: !0 }
																							});
																						});
																						var a = P(i, 2);
																						b(a, () => kd, (e, t) => {
																							t(e, {
																								class: "af-button ghost icon sm",
																								children: (e, t) => {
																									ff(e, () => "m9 18 6-6-6-6");
																								},
																								$$slots: { default: !0 }
																							});
																						}), T(e, n);
																					},
																					$$slots: { default: !0 }
																				});
																			});
																			var a = P(i, 2);
																			b(a, () => Hd, (e, n) => {
																				n(e, {
																					children: (e, n) => {
																						var r = D(), i = R(r);
																						b(i, () => Wd, (e, n) => {
																							n(e, {
																								children: (e, n) => {
																									var r = D(), i = R(r);
																									C(i, 17, () => t()().getMonthsGrid({
																										columns: 4,
																										format: "short"
																									}), s, (e, t) => {
																										var n = D(), r = R(n);
																										b(r, () => Jd, (e, n) => {
																											n(e, {
																												children: (e, n) => {
																													var r = D(), i = R(r);
																													C(i, 17, () => B(t), (e) => e.value, (e, t) => {
																														var n = D(), r = R(n);
																														b(r, () => ef, (e, n) => {
																															n(e, {
																																get value() {
																																	return B(t).value;
																																},
																																children: (e, n) => {
																																	var r = D(), i = R(r);
																																	b(i, () => nf, (e, n) => {
																																		n(e, {
																																			children: (e, n) => {
																																				m();
																																				var r = le();
																																				U(() => E(r, B(t).label)), T(e, r);
																																			},
																																			$$slots: { default: !0 }
																																		});
																																	}), T(e, r);
																																},
																																$$slots: { default: !0 }
																															});
																														}), T(e, n);
																													}), T(e, r);
																												},
																												$$slots: { default: !0 }
																											});
																										}), T(e, n);
																									}), T(e, r);
																								},
																								$$slots: { default: !0 }
																							});
																						}), T(e, r);
																					},
																					$$slots: { default: !0 }
																				});
																			}), T(e, r);
																		},
																		$$slots: { default: !0 }
																	});
																});
																var a = P(i, 2);
																b(a, () => sf, (e, n) => {
																	n(e, {
																		view: "year",
																		children: (e, n) => {
																			var r = yf(), i = R(r);
																			b(i, () => lf, (e, t) => {
																				t(e, {
																					children: (e, t) => {
																						var n = bf(), r = R(n);
																						b(r, () => Nd, (e, t) => {
																							t(e, {
																								class: "af-button ghost icon sm",
																								children: (e, t) => {
																									ff(e, () => "m15 18-6-6 6-6");
																								},
																								$$slots: { default: !0 }
																							});
																						});
																						var i = P(r, 2);
																						b(i, () => df, (e, t) => {
																							t(e, {
																								class: "af-button ghost sm",
																								children: (e, t) => {
																									var n = D(), r = R(n);
																									b(r, () => Fd, (e, t) => {
																										t(e, {});
																									}), T(e, n);
																								},
																								$$slots: { default: !0 }
																							});
																						});
																						var a = P(i, 2);
																						b(a, () => kd, (e, t) => {
																							t(e, {
																								class: "af-button ghost icon sm",
																								children: (e, t) => {
																									ff(e, () => "m9 18 6-6-6-6");
																								},
																								$$slots: { default: !0 }
																							});
																						}), T(e, n);
																					},
																					$$slots: { default: !0 }
																				});
																			});
																			var a = P(i, 2);
																			b(a, () => Hd, (e, n) => {
																				n(e, {
																					children: (e, n) => {
																						var r = D(), i = R(r);
																						b(i, () => Wd, (e, n) => {
																							n(e, {
																								children: (e, n) => {
																									var r = D(), i = R(r);
																									C(i, 17, () => t()().getYearsGrid({ columns: 4 }), s, (e, t) => {
																										var n = D(), r = R(n);
																										b(r, () => Jd, (e, n) => {
																											n(e, {
																												children: (e, n) => {
																													var r = D(), i = R(r);
																													C(i, 17, () => B(t), (e) => e.value, (e, t) => {
																														var n = D(), r = R(n);
																														b(r, () => ef, (e, n) => {
																															n(e, {
																																get value() {
																																	return B(t).value;
																																},
																																children: (e, n) => {
																																	var r = D(), i = R(r);
																																	b(i, () => nf, (e, n) => {
																																		n(e, {
																																			children: (e, n) => {
																																				m();
																																				var r = le();
																																				U(() => E(r, B(t).label)), T(e, r);
																																			},
																																			$$slots: { default: !0 }
																																		});
																																	}), T(e, r);
																																},
																																$$slots: { default: !0 }
																															});
																														}), T(e, n);
																													}), T(e, r);
																												},
																												$$slots: { default: !0 }
																											});
																										}), T(e, n);
																									}), T(e, r);
																								},
																								$$slots: { default: !0 }
																							});
																						}), T(e, r);
																					},
																					$$slots: { default: !0 }
																				});
																			}), T(e, r);
																		},
																		$$slots: { default: !0 }
																	});
																});
																var o = P(a, 2), c = V(o), u = F(c, !0), d = P(c, 2), p = (e) => {
																	var n = D(), r = R(n);
																	b(r, () => bd, (e, n) => {
																		n(e, q({
																			part: "clear",
																			class: "af-button ghost sm"
																		}, () => B(Be) ? { hidden: !1 } : {}, {
																			onclick: () => {
																				L() ? ct(null, null) : B(Ee) && ot(null), ft(t());
																			},
																			children: (e, t) => {
																				m();
																				var n = le();
																				U(() => E(n, B(W).clear)), T(e, n);
																			},
																			$$slots: { default: !0 }
																		}));
																	}), T(e, n);
																};
																w(d, (e) => {
																	f() && e(p);
																}), v(o), U((e) => {
																	c.disabled = e, E(u, B(W).today);
																}, [() => at(yr())]), oe("click", c, () => {
																	L() ? dt(t()) : ot(yr()) && ft(t());
																}), T(e, n);
															};
															b(r, () => Cd, (t, n) => {
																n(t, {
																	render: e,
																	$$slots: { render: !0 }
																});
															});
														}
														T(e, n);
													},
													$$slots: { default: !0 }
												});
											}), T(e, n);
										},
										$$slots: { default: !0 }
									});
								}), T(e, n);
							},
							$$slots: { default: !0 }
						});
					}), v(n), T(e, n);
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { default: !0 }
	}), T(e, ht), g(mt);
}
z([
	"keydown",
	"input",
	"click"
]), N(wf, {
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
}, Le);
//#endregion
//#region src/kit/tooltip-escape.ts
function Tf(e, t) {
	return t.composedPath().some((t) => t instanceof HTMLElement && t.localName === "af-tooltip" && t.dataset.raised === "true" && e.contains(t));
}
//#endregion
//#region src/kit/Dialog.svelte
var Ef = y("<header class=\"svelte-gp7kvq\"><!> <button type=\"button\" part=\"close\" class=\"svelte-gp7kvq\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-gp7kvq\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button></header> <div part=\"body\" class=\"svelte-gp7kvq\"><!></div> <footer part=\"actions\" class=\"svelte-gp7kvq\"><!></footer>", 1), Df = y("<dialog><!></dialog>"), Of = y("<!> <!>", 1), kf = {
	hash: "svelte-gp7kvq",
	code: ":host {display:contents;}dialog.svelte-gp7kvq {border:0;padding:0;background:transparent;max-width:calc(100vw - 32px);overflow:visible;}dialog.svelte-gp7kvq::backdrop {background:rgb(0 0 0 / 0.5);}header.svelte-gp7kvq {display:flex;flex:none;align-items:center;padding-right:24px;}[part='body'].svelte-gp7kvq {display:flex;flex:1 1 auto;flex-direction:column;min-height:0;margin:-4px -16px;}[part='body'].svelte-gp7kvq [data-scope='scroll-area'][data-part='viewport'] {padding:4px 16px;overscroll-behavior:contain;}footer.svelte-gp7kvq {display:flex;flex:none;flex-wrap:wrap;justify-content:flex-end;gap:8px;}footer[hidden].svelte-gp7kvq {display:none;}[part='close'].svelte-gp7kvq {position:absolute;top:16px;right:16px;display:flex;align-items:center;justify-content:center;width:16px;height:16px;padding:0;border:0 solid var(--k-line);border-radius:2px;background:transparent;color:inherit;opacity:0.7;outline:none;cursor:pointer;transition:opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);}[part='close'].svelte-gp7kvq svg:where(.svelte-gp7kvq) {flex:none;width:16px;height:16px;pointer-events:none;}\n  @media (hover: hover) {[part='close'].svelte-gp7kvq:hover {opacity:1;} }[part='close'].svelte-gp7kvq:focus-visible {box-shadow:0 0 0 2px var(--k-bg), 0 0 0 4px var(--k-focus-border);}[data-scope='dialog'][data-part='content'] {position:relative;display:flex;flex-direction:column;gap:16px;width:calc(100vw - 32px);max-height:calc(100dvh - 64px);padding:24px;border-radius:var(--k-radius);background-color:var(--k-bg);color:var(--k-fg);outline:none;box-shadow:0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);}[data-scope='dialog'][data-part='title'] {margin:0;font-size:18px;font-weight:600;line-height:1;}\n  @media (min-width: 40rem) {[data-scope='dialog'][data-part='content'] {max-width:512px;} }\n  @media not (min-width: 40rem) {footer.svelte-gp7kvq {flex-direction:column-reverse;} }dialog[data-placement='end'].svelte-gp7kvq {inset:0 0 0 auto;height:100dvh;max-width:none;max-height:none;margin:0;}[data-scope='dialog'][data-part='content'][data-placement='end'] {width:min(75vw, 384px);max-width:none;height:100%;max-height:none;padding:0;border:0 solid var(--k-line);border-left-width:1px;border-radius:0;}[data-scope='dialog'][data-part='content'][data-placement='end'] header.svelte-gp7kvq {box-sizing:border-box;padding:16px 40px 16px 16px;}[data-scope='dialog'][data-part='content'][data-placement='end'] [part='body'].svelte-gp7kvq {margin:-4px 0;}[data-scope='dialog'][data-part='content'][data-placement='end']:has(> footer[hidden]) [part='body'].svelte-gp7kvq {margin-bottom:0;}[data-scope='dialog'][data-part='content'][data-placement='end'] footer.svelte-gp7kvq {box-sizing:border-box;flex-direction:column;justify-content:normal;margin-top:auto;padding:16px;}[data-scope='dialog'][data-part='content'][data-placement='end'] [data-scope='dialog'][data-part='title'] {font-size:16px;line-height:24px;}\n  @keyframes af-dialog-slide-in { from { transform: translateX(100%); } }\n  @media (prefers-reduced-motion: no-preference) {[data-scope='dialog'][data-part='content'][data-placement='end'] { animation: af-dialog-slide-in 500ms cubic-bezier(0.4, 0, 0.2, 1);}\n  }\n  @media (prefers-reduced-motion: reduce) {[part='close'].svelte-gp7kvq {transition:none;} }\n  @media (forced-colors: active) {[part='close'].svelte-gp7kvq:focus-visible, [data-scope='dialog'][data-part='content']:focus-visible {outline:2px solid;outline-offset:2px;}\n  }"
};
function Af(e, t) {
	I(t, !0), c(e, kf);
	let i = O(t, "open", 7, !1), a = O(t, "heading", 7, ""), o = O(t, "placement", 7, "center"), s = O(t, "locale", 7, null), u = O(t, "strings", 7, null), d = t.$$host, f = G(() => he(s(), u() ?? void 0)), p = G(() => o() === "end" ? "end" : "center"), h = K(null), _ = "escape", y = K(null), S = K(null), C = K(!1), w = Te(d);
	j(() => w(B(h), !!i()));
	let k = null, A = null, ne = (e) => !(e instanceof Node && Se(d, e)) && xe(d);
	j(() => {
		if (i() && B(h)) return ee(d.ownerDocument, "pointerdown", (e) => {
			e !== A && e.button === 0 && e.pointerType !== "touch" && ne(e.composedPath()[0] ?? null) && (k = e, Ce(d, "close", { reason: "outside" }));
		}, { capture: !0 });
	}), j(() => {
		let e = B(y)?.querySelector("slot");
		if (!e) return;
		let t = () => J(C, e.assignedNodes().length > 0);
		return t(), ee(e, "slotchange", t);
	});
	var M = {
		get open() {
			return i();
		},
		set open(e = !1) {
			i(e), r();
		},
		get heading() {
			return a();
		},
		set heading(e = "") {
			a(e), r();
		},
		get placement() {
			return o();
		},
		set placement(e = "center") {
			o(e), r();
		},
		get locale() {
			return s();
		},
		set locale(e = null) {
			s(e), r();
		},
		get strings() {
			return u();
		},
		set strings(e = null) {
			u(e), r();
		}
	}, re = Of(), N = R(re);
	_e(N, {});
	var F = P(N, 2);
	return Yt(F, {
		value: () => d.shadowRoot,
		children: (e, r) => {
			var o = D(), s = R(o), c = () => !!i();
			b(s, () => Qn, (e, r) => {
				r(e, {
					get open() {
						return c();
					},
					set open(e) {},
					modal: !1,
					preventScroll: !0,
					closeOnInteractOutside: !0,
					onEscapeKeyDown: (e) => {
						Tf(d, e) ? e.preventDefault() : rr(e) && e.defaultPrevented ? Ce(d, "close", { reason: "escape" }) : _ = "escape";
					},
					onInteractOutside: (e) => {
						e.detail.originalEvent === k || !ne(e.detail.target) ? e.preventDefault() : (A = e.detail.originalEvent, _ = "outside");
					},
					onOpenChange: (e) => {
						e.open || (Ce(d, "close", { reason: _ }), _ = "escape");
					},
					children: (e, r) => {
						var i = D(), o = R(i);
						{
							let e = (e, r = l) => {
								var i = Df(), o = (e) => e.preventDefault();
								n(i, (e) => ({
									...e,
									class: "af-kit",
									"data-placement": B(p),
									oncancel: o
								}), [() => r()()], void 0, void 0, "svelte-gp7kvq");
								var s = V(i);
								b(s, () => $n, (e, n) => {
									n(e, {
										part: "content",
										class: "af-overlay dialog",
										"aria-modal": "true",
										get "data-placement"() {
											return B(p);
										},
										children: (e, n) => {
											var r = Ef(), i = R(r), o = V(i);
											b(o, () => er, (e, t) => {
												t(e, {
													part: "heading",
													get ref() {
														return B(S);
													},
													set ref(e) {
														J(S, e, !0);
													},
													children: (e, t) => {
														m();
														var n = le();
														U(() => E(n, a() ?? "")), T(e, n);
													},
													$$slots: { default: !0 }
												});
											});
											var s = P(o, 2);
											v(i);
											var c = P(i, 2), l = V(c);
											{
												let e = G(() => ({
													element: B(S),
													text: a() ?? ""
												}));
												xn(l, {
													get heading() {
														return B(e);
													},
													children: (e, n) => {
														var r = D(), i = R(r);
														fe(i, t, "default", {}, null), T(e, r);
													},
													$$slots: { default: !0 }
												});
											}
											v(c);
											var u = P(c, 2), p = V(u);
											fe(p, t, "actions", {}, null), v(u), te(u, (e) => J(y, e), () => B(y)), U(() => {
												x(s, "aria-label", B(f).close), x(u, "hidden", !B(C));
											}), oe("click", s, () => Ce(d, "close", { reason: "close-button" })), T(e, r);
										},
										$$slots: { default: !0 }
									});
								}), v(i), te(i, (e) => J(h, e), () => B(h)), T(e, i);
							};
							b(o, () => Zn, (t, n) => {
								n(t, {
									asChild: e,
									$$slots: { asChild: !0 }
								});
							});
						}
						T(e, i);
					},
					$$slots: { default: !0 }
				});
			}), T(e, o);
		},
		$$slots: { default: !0 }
	}), T(e, re), g(M);
}
z(["click"]), N(Af, {
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
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/use-menu-context.js
var [jf, Mf] = Zt({
	name: "MenuContext",
	hookName: "useMenuContext",
	providerName: "<MenuProvider />",
	strict: !1
}), [Nf, Pf] = Zt({
	name: "MenuItemContext",
	hookName: "useMenuItemContext",
	providerName: "<MenuItemProvider />"
}), [Ff, If] = Zt({
	name: "MenuItemPropsContext",
	hookName: "useMenuItemPropsContext",
	providerName: "<MenuItemPropsProvider />"
}), Lf = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"checked"
]);
function Rf(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = O(t, "checked", 15), a = W(t, Lf), o = G(() => Wt()(a, [
		"checked",
		"closeOnSelect",
		"disabled",
		"onCheckedChange",
		"value",
		"valueText"
	])), s = G(() => f(B(o), 2)), c = G(() => B(s)[0]), l = G(() => B(s)[1]), u = G(() => ({
		...B(c),
		type: "checkbox",
		checked: i(),
		onCheckedChange(e) {
			i() !== void 0 && i(e), B(c).onCheckedChange?.(e);
		}
	})), d = Mf(), p = G(() => Q(d().getOptionItemProps(B(u)), B(l))), m = G(() => d().getOptionItemState(B(u)));
	return Ff(() => B(u)), Nf(() => B(m)), X(e, q({ as: "div" }, () => B(p), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		},
		get checked() {
			return i();
		},
		set checked(e) {
			i(e), r();
		}
	});
}
N(Rf, {
	ref: {},
	checked: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-content.svelte
var zf = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Bf(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, zf), a = Mf(), s = qn(), c = G(() => Q(a().getContentProps(), s().getPresenceProps(), i));
	function l(e) {
		s().setNode(e);
	}
	var u = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	}, d = D(), f = R(d), p = (e) => {
		X(e, q({
			as: "div",
			[o()]: l
		}, () => B(c), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, m = G(() => !s().unmounted);
	return w(f, (e) => {
		B(m) && e(p);
	}), T(e, d), g(u);
}
N(Bf, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-context.svelte
function Vf(e, t) {
	I(t, !0);
	let n = O(t, "render", 7), i = Mf();
	var a = {
		get render() {
			return n();
		},
		set render(e) {
			n(e), r();
		}
	}, o = D(), s = R(o);
	return u(s, n, () => i), T(e, o), g(a);
}
N(Vf, { render: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/use-menu-item-group-context.js
var [Hf, Uf] = Zt({
	name: "MenuItemGroupContext",
	hookName: "useMenuItemGroupContext",
	providerName: "<MenuItemGroupProvider />"
}), Wf = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Gf(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, Wf), a = Mf(), o = Uf(), s = G(() => Q(a().getItemGroupLabelProps({ htmlFor: o().id }), i));
	return X(e, q({ as: "div" }, () => B(s), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(Gf, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-item-group.svelte
var Kf = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function qf(e, t) {
	let n = M();
	I(t, !0);
	let i = O(t, "ref", 15, null), a = W(t, Kf), o = Mf(), s = G(() => ({
		id: n,
		...a
	})), c = G(() => Q(o().getItemGroupProps(B(s)), a));
	return Hf(() => B(s)), X(e, q({ as: "div" }, () => B(c), {
		get ref() {
			return i();
		},
		set ref(e) {
			i(e);
		}
	})), g({
		get ref() {
			return i();
		},
		set ref(e = null) {
			i(e), r();
		}
	});
}
N(qf, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-item-indicator.svelte
var Jf = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Yf(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, Jf), a = Mf(), o = If(), s = G(() => Q(a().getItemIndicatorProps(o()), i));
	return X(e, q({ as: "div" }, () => B(s), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(Yf, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-item.svelte
var Xf = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Zf(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, Xf), a = G(() => Wt()(i, [
		"closeOnSelect",
		"disabled",
		"value",
		"valueText",
		"onSelect"
	])), o = G(() => f(B(a), 2)), s = G(() => B(o)[0]), c = G(() => B(o)[1]), l = Mf(), u = G(() => Q(l().getItemProps(B(s)), B(c))), d = G(() => l().getItemState(B(s)));
	return j(() => l().addItemListener({
		id: B(d).id,
		onSelect: B(s).onSelect
	})), Ff(() => B(s)), Nf(() => B(d)), X(e, q({ as: "div" }, () => B(u), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(Zf, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-positioner.svelte
var Qf = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function $f(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, Qf), a = Mf(), o = qn(), s = G(() => Q(a().getPositionerProps(), i));
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	}, l = D(), u = R(l), d = (e) => {
		X(e, q({ as: "div" }, () => B(s), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = G(() => !o().unmounted);
	return w(u, (e) => {
		B(f) && e(d);
	}), T(e, l), g(c);
}
N($f, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-radio-item-group.svelte
var ep = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"value"
]);
function tp(e, t) {
	let n = M();
	I(t, !0);
	let i = O(t, "ref", 15, null), a = O(t, "value", 15), o = W(t, ep), s = G(() => Wt()(o, [
		"id",
		"onValueChange",
		"value"
	])), c = G(() => f(B(s), 2)), l = G(() => B(c)[0]), u = G(() => B(c)[1]), d = Mf(), p = G(() => ({
		id: B(l).id ?? n,
		value: a(),
		onValueChange(e) {
			a(e.value), B(l)?.onValueChange?.(e);
		}
	})), m = G(() => Q(d().getItemGroupProps({ id: B(p).id }), B(u)));
	return Hf(() => B(p)), X(e, q({ as: "div" }, () => B(m), {
		get ref() {
			return i();
		},
		set ref(e) {
			i(e);
		}
	})), g({
		get ref() {
			return i();
		},
		set ref(e = null) {
			i(e), r();
		},
		get value() {
			return a();
		},
		set value(e) {
			a(e), r();
		}
	});
}
N(tp, {
	ref: {},
	value: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-radio-item.svelte
var np = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function rp(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, np), a = G(() => Wt()(i, [
		"closeOnSelect",
		"disabled",
		"value",
		"valueText"
	])), o = G(() => f(B(a), 2)), s = G(() => B(o)[0]), c = G(() => B(o)[1]), l = Mf(), u = Uf(), d = G(() => ({
		...B(s),
		checked: u().value === B(s).value,
		type: "radio",
		onCheckedChange: () => u().onValueChange?.({ value: B(s).value })
	})), p = G(() => Q(l().getOptionItemProps(B(d)), B(c))), m = G(() => l().getOptionItemState(B(d)));
	return Ff(() => B(d)), Nf(() => B(m)), X(e, q({ as: "div" }, () => B(p), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(rp, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/use-menu-machine-context.js
var [ip, ap] = Zt({
	name: "MenuMachineContext",
	hookName: "useMenuMachineContext",
	providerName: "<MenuMachineProvider />",
	strict: !1
}), [op, sp] = Zt({
	name: "MenuTriggerItemContext",
	hookName: "useMenuTriggerItemContext",
	providerName: "<MenuTriggerItemProvider />",
	strict: !1
}), cp = xt("menu").parts("arrow", "arrowTip", "content", "contextTrigger", "indicator", "item", "itemGroup", "itemGroupLabel", "itemIndicator", "itemText", "positioner", "separator", "trigger", "triggerItem").build(), lp = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `menu:${e.id}:trigger:${t}` : `menu:${e.id}:trigger` : qe(n) ? n(t) : n;
}, up = (e, t) => {
	let n = e.ids?.contextTrigger;
	return n == null ? t ? `menu:${e.id}:ctx-trigger:${t}` : `menu:${e.id}:ctx-trigger` : qe(n) ? n(t) : n;
}, dp = (e) => e.ids?.content ?? `menu:${e.id}:content`, fp = (e) => e.ids?.arrow ?? `menu:${e.id}:arrow`, pp = (e) => e.ids?.positioner ?? `menu:${e.id}:popper`, mp = (e, t) => e.ids?.group?.(t) ?? `menu:${e.id}:group:${t}`, hp = (e, t) => `${e.id}/${t}`, gp = (e) => e?.dataset.value ?? null, _p = (e, t) => e.ids?.groupLabel?.(t) ?? `menu:${e.id}:group-label:${t}`, vp = (e) => e.getById(dp(e)), yp = (e) => e.getById(pp(e)), bp = (e) => e.getById(lp(e)), xp = (e, t) => t ? e.getById(hp(e, t)) : null, Sp = (e) => e.getById(up(e)), Cp = (e) => Pn(e.getRootNode(), `[data-scope="menu"][data-part="trigger"]${en(e.id)}`), wp = (e) => Pn(e.getRootNode(), `[data-scope="menu"][data-part="context-trigger"]${en(e.id)}`), Tp = (e, t) => t == null ? bp(e) ?? Cp(e)[0] : e.getById(lp(e, t)), Ep = (e) => {
	let t = `[role^="menuitem"]${en(dp(e))}:not([data-disabled])`;
	return Pn(vp(e), t);
}, Dp = (e) => It(Ep(e)), Op = (e) => at(Ep(e)), kp = (e, t) => t ? e.id === t || e.dataset.value === t : !1, Ap = (e, t) => {
	let n = Ep(e), r = n.findIndex((e) => kp(e, t.value));
	return lt(n, r, { loop: t.loop ?? t.loopFocus });
}, jp = (e, t) => {
	let n = Ep(e), r = n.findIndex((e) => kp(e, t.value));
	return tt(n, r, { loop: t.loop ?? t.loopFocus });
}, Mp = (e, t) => {
	let n = Ep(e), r = n.find((e) => kp(e, t.value));
	return ca(n, {
		state: t.typeaheadState,
		key: t.key,
		activeId: r?.id ?? null
	});
}, Np = (e) => Jt(e) && (e.dataset.disabled === "" || e.hasAttribute("disabled")), Pp = (e) => !!e?.getAttribute("role")?.startsWith("menuitem") && !!e?.hasAttribute("data-controls"), Fp = "menu:select";
function Ip(e, t) {
	if (!e) return;
	let n = new (vt(e)).CustomEvent(Fp, { detail: { value: t } });
	e.dispatchEvent(n);
}
function Lp(e) {
	let t = dp(e);
	return vp(e) ?? e.getDoc().getElementById(t);
}
function Rp(e, t) {
	if (!Jt(e)) return !1;
	for (let n in t) {
		let r = t[n], i = Lp(r.scope);
		if (i && et(i, e)) return !0;
		let a = r.refs.get("children");
		if (Object.keys(a).length > 0 && Rp(e, a)) return !0;
	}
	return !1;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+rect-utils@1.43.3/node_modules/@zag-js/rect-utils/dist/rect.mjs
var zp = (e, t) => ({
	x: e,
	y: t
});
function Bp(e) {
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
		center: zp(a, o)
	};
}
function Vp(e) {
	return {
		top: zp(e.minX, e.minY),
		right: zp(e.maxX, e.minY),
		bottom: zp(e.maxX, e.maxY),
		left: zp(e.minX, e.maxY)
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+rect-utils@1.43.3/node_modules/@zag-js/rect-utils/dist/polygon.mjs
function Hp(e, t) {
	let { top: n, right: r, left: i, bottom: a } = Vp(Bp(e)), [o] = t.split("-");
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
function Up(e, t) {
	let { x: n, y: r } = t, i = !1;
	for (let t = 0, a = e.length - 1; t < e.length; a = t++) {
		let o = e[t].x, s = e[t].y, c = e[a].x, l = e[a].y;
		s > r != l > r && n < (c - o) * (r - s) / (l - s) + o && (i = !i);
	}
	return i;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+menu@1.43.3/node_modules/@zag-js/menu/dist/menu.utils.mjs
function Wp(e) {
	let t = e.parent;
	for (; t && t.context.get("isSubmenu");) t = t.refs.get("parent");
	t?.send({ type: "CLOSE" });
}
function Gp(e, t) {
	return e ? Up(e, t) : !1;
}
function Kp(e, t, n) {
	let r = Object.keys(e).length > 0;
	if (!t) return null;
	if (!r) return hp(n, t);
	for (let n in e) {
		let r = e[n], i = lp(r.scope);
		if (i === t) return i;
	}
	return hp(n, t);
}
function qp(e, t) {
	e && (e.refs.set("pointerRoutingLocked", t), e.context.set("pointerRoutingMode", t ? "locked" : "interactive"));
}
function Jp(e) {
	let t = e.context.get("highlightedValue");
	if (!t) return !1;
	let n = e.refs.get("children");
	for (let e in n) {
		let r = n[e];
		if (r.state.hasTag("open") && lp(r.scope) === t) return !0;
	}
	return !1;
}
function Yp(e, t) {
	e && (e.refs.get("pointerRoutingLocked") || t && Jp(e) || qp(e, !1));
}
function Xp(e) {
	e && (Jp(e) || qp(e, !1));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+menu@1.43.3/node_modules/@zag-js/menu/dist/menu.connect.mjs
function Zp(e, t) {
	let { context: n, send: r, state: i, computed: a, prop: o, scope: s } = e, c = i.hasTag("open"), l = n.get("isSubmenu"), u = a("isTypingAhead"), d = o("composite"), f = n.get("currentPlacement"), p = f ? Me(f) : void 0, m = n.get("anchorPoint"), h = n.get("highlightedValue"), g = n.get("triggerValue"), _ = Fe({
		...o("positioning"),
		placement: f
	});
	function v(e) {
		return {
			id: hp(s, e.value),
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
		let { closeOnSelect: n, valueText: i, value: a } = e, o = v(e), c = hp(s, a);
		return t.element({
			...cp.item.attrs,
			id: c,
			role: "menuitem",
			"aria-disabled": ut(o.disabled),
			"data-disabled": Z(o.disabled),
			"data-ownedby": dp(s),
			"data-highlighted": Z(o.highlighted),
			"data-value": a,
			"data-valuetext": i,
			onDragStart(e) {
				e.currentTarget.matches("a[href]") && e.preventDefault();
			},
			onPointerMove(e) {
				if (o.disabled || e.pointerType !== "mouse" || La() !== "pointer") return;
				let t = e.currentTarget;
				if (o.highlighted) return;
				let i = nn(e);
				r({
					type: "ITEM_POINTERMOVE",
					id: c,
					target: t,
					closeOnSelect: n,
					point: i
				});
			},
			onPointerLeave(e) {
				if (o.disabled || e.pointerType !== "mouse" || La() !== "pointer") return;
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
				if (an(e) || Je(e) || o.disabled) return;
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
			return t.addEventListener(Fp, n), () => t.removeEventListener(Fp, n);
		},
		getContextTriggerProps(e = {}) {
			let { value: n } = e, i = n != null && g === n, a = up(s, n);
			return t.element({
				...cp.contextTrigger.attrs,
				dir: o("dir"),
				id: a,
				"data-ownedby": s.id,
				"data-value": n,
				"data-current": Z(i),
				"data-state": c ? "open" : "closed",
				onPointerDown(e) {
					if (e.pointerType === "mouse") return;
					let t = nn(e);
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
					let t = nn(e);
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
			return Qt(x({ value: t.id }), t);
		},
		getTriggerProps(n = {}) {
			let { value: i } = n, a = i != null && g === i, u = lp(s, i);
			return t.button({
				...l ? cp.triggerItem.attrs : cp.trigger.attrs,
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
				"aria-controls": dp(s),
				"data-controls": dp(s),
				"aria-expanded": i == null ? c : c && a,
				"data-state": c ? "open" : "closed",
				onPointerMove(e) {
					if (e.pointerType !== "mouse" || Np(e.currentTarget) || !l) return;
					let t = nn(e);
					r({
						type: "TRIGGER_POINTERMOVE",
						target: e.currentTarget,
						point: t
					});
				},
				onPointerLeave(t) {
					if (Np(t.currentTarget) || t.pointerType !== "mouse" || !l) return;
					qp(e.refs.get("parent"), !0);
					let n = nn(t);
					r({
						type: "TRIGGER_POINTERLEAVE",
						target: t.currentTarget,
						point: n
					});
				},
				onPointerDown(e) {
					Np(e.currentTarget) || Ke(e) || e.preventDefault();
				},
				onClick(e) {
					e.defaultPrevented || Np(e.currentTarget) || r({
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
					}[bt(e, {
						orientation: "vertical",
						dir: o("dir")
					})];
					t && (e.preventDefault(), t(e));
				}
			});
		},
		getIndicatorProps() {
			return t.element({
				...cp.indicator.attrs,
				dir: o("dir"),
				"data-state": c ? "open" : "closed"
			});
		},
		getPositionerProps() {
			return t.element({
				...cp.positioner.attrs,
				dir: o("dir"),
				id: pp(s),
				style: _.floating
			});
		},
		getArrowProps() {
			return t.element({
				id: fp(s),
				...cp.arrow.attrs,
				dir: o("dir"),
				style: _.arrow
			});
		},
		getArrowTipProps() {
			return t.element({
				...cp.arrowTip.attrs,
				dir: o("dir"),
				style: _.arrowTip
			});
		},
		getContentProps() {
			return t.element({
				...cp.content.attrs,
				id: dp(s),
				"aria-label": o("aria-label"),
				hidden: !c,
				"data-state": c ? "open" : "closed",
				role: d ? "menu" : "dialog",
				tabIndex: 0,
				dir: o("dir"),
				"aria-activedescendant": a("highlightedId") || void 0,
				"aria-labelledby": m ? up(s, g ?? void 0) : lp(s, g ?? void 0),
				"data-placement": f,
				"data-side": p,
				onPointerEnter(e) {
					e.pointerType === "mouse" && r({ type: "MENU_POINTERENTER" });
				},
				onKeyDown(e) {
					if (e.defaultPrevented || !et(e.currentTarget, Ct(e))) return;
					let t = Ct(e);
					if (t?.closest("[role=menu]") !== e.currentTarget && t !== e.currentTarget) return;
					if (e.key === "Tab" && !Bn(e)) {
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
					}, i = n[bt(e, { dir: o("dir") })];
					if (i) {
						i(e), e.stopPropagation(), e.preventDefault();
						return;
					}
					o("typeahead") && ot(e) && (Xe(e) || $e(t) || (r({
						type: "TYPEAHEAD",
						key: e.key
					}), e.preventDefault()));
				}
			});
		},
		getSeparatorProps() {
			return t.element({
				...cp.separator.attrs,
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
					...cp.item.attrs,
					dir: o("dir"),
					"data-value": s.value,
					role: `menuitem${n}`,
					"aria-checked": !!c.checked,
					"data-state": c.checked ? "checked" : "unchecked",
					onClick(e) {
						if (i || an(e) || Je(e)) return;
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
			let n = b(Ht(e)), r = n.checked ? "checked" : "unchecked";
			return t.element({
				...cp.itemIndicator.attrs,
				dir: o("dir"),
				"data-disabled": Z(n.disabled),
				"data-highlighted": Z(n.highlighted),
				"data-state": wt(e, "checked") ? r : void 0,
				hidden: wt(e, "checked") ? !n.checked : void 0
			});
		},
		getItemTextProps(e) {
			let n = b(Ht(e)), r = n.checked ? "checked" : "unchecked";
			return t.element({
				...cp.itemText.attrs,
				dir: o("dir"),
				"data-disabled": Z(n.disabled),
				"data-highlighted": Z(n.highlighted),
				"data-state": wt(e, "checked") ? r : void 0
			});
		},
		getItemGroupLabelProps(e) {
			return t.element({
				...cp.itemGroupLabel.attrs,
				id: _p(s, e.htmlFor),
				dir: o("dir")
			});
		},
		getItemGroupProps(e) {
			return t.element({
				id: mp(s, e.id),
				...cp.itemGroup.attrs,
				dir: o("dir"),
				"aria-labelledby": _p(s, e.id),
				role: "group"
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+menu@1.43.3/node_modules/@zag-js/menu/dist/menu.machine.mjs
var { not: Qp, and: $p, or: em } = Pt(), tm = St({
	props({ props: e }) {
		return {
			closeOnSelect: !0,
			typeahead: !0,
			composite: !0,
			loopFocus: !1,
			navigate(e) {
				Xi(e.node);
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
						triggerElement: Tp(n, e)
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
			typeaheadState: { ...ca.defaultOptions },
			positioningOverride: {}
		};
	},
	computed: {
		isRtl: ({ prop: e }) => e("dir") === "rtl",
		isTypingAhead: ({ refs: e }) => e.get("typeaheadState").keysSoFar !== "",
		highlightedId: ({ context: e, scope: t, refs: n }) => Kp(n.get("children"), e.get("highlightedValue"), t)
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
					guard: Qp("isSubmenu"),
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
						guard: em("isOpenAutoFocusEvent", "isArrowDownEvent"),
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
					guard: $p(Qp("isTriggerItem"), "isOpenControlled"),
					actions: ["invokeOnClose", "releaseParentRoutingLock"]
				}, {
					guard: Qp("isTriggerItem"),
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
					guard: $p("isSubmenu", "isOpenControlled"),
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
					guard: Qp("isPointerRoutingLocked"),
					actions: [
						"setHighlightedItem",
						"focusMenu",
						"closeSiblingMenus"
					]
				}, { actions: ["setLastHighlightedItem", "closeSiblingMenus"] }],
				ITEM_POINTERLEAVE: {
					guard: $p(Qp("isPointerRoutingLocked"), Qp("isTriggerItem")),
					actions: ["clearHighlightedItem"]
				},
				ITEM_CLICK: [
					{
						guard: $p(Qp("isTriggerItemHighlighted"), Qp("isHighlightedItemEditable"), "closeOnSelect", "isOpenControlled"),
						actions: [
							"invokeOnSelect",
							"setOptionState",
							"closeRootMenu",
							"invokeOnClose",
							"releaseParentRoutingLock"
						]
					},
					{
						guard: $p(Qp("isTriggerItemHighlighted"), Qp("isHighlightedItemEditable"), "closeOnSelect"),
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
						guard: $p(Qp("isTriggerItemHighlighted"), Qp("isHighlightedItemEditable")),
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
			isTriggerItem: ({ event: e }) => Pp(e.target),
			isTriggerItemHighlighted: ({ event: e, scope: t, computed: n }) => !!(e.target ?? t.getById(n("highlightedId")))?.hasAttribute("data-controls"),
			isSubmenu: ({ context: e }) => e.get("isSubmenu"),
			isPointerRoutingLocked: ({ refs: e }) => e.get("pointerRoutingLocked"),
			isHighlightedItemEditable: ({ scope: e, computed: t }) => $e(e.getById(t("highlightedId"))),
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
				return Ba({ root: e.getRootNode?.() });
			},
			trackPositioning({ context: e, prop: t, scope: n, refs: r }) {
				if (Sp(n) || wp(n).length > 0) return;
				let i = {
					...t("positioning"),
					...r.get("positioningOverride")
				};
				return e.set("currentPlacement", i.placement), Ae(() => Tp(n, e.get("triggerValue")), () => yp(n), {
					...i,
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			trackInteractOutside({ refs: e, scope: t, prop: n, context: r, send: i }) {
				let a = () => vp(t), o = !0, s = (e) => wp(t).some((t) => et(t, e));
				return In(a, {
					type: "menu",
					defer: !0,
					exclude: [bp(t), ...Cp(t)].filter(Boolean),
					onInteractOutside: n("onInteractOutside"),
					onRequestDismiss: n("onRequestDismiss"),
					onFocusOutside(t) {
						n("onFocusOutside")?.(t);
						let r = Ct(t.detail.originalEvent);
						if (s(r)) {
							t.preventDefault();
							return;
						}
						if (Rp(r, e.get("children"))) {
							t.preventDefault();
							return;
						}
					},
					onEscapeKeyDown(t) {
						n("onEscapeKeyDown")?.(t), r.get("isSubmenu") && t.preventDefault(), Wp({ parent: e.get("parent") });
					},
					onPointerDownOutside(e) {
						n("onPointerDownOutside")?.(e);
						let t = Ct(e.detail.originalEvent);
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
				qp(i, !0);
				let a = t.getDoc();
				return At(a, "pointermove", (t) => {
					Gp(e.get("intentPolygon"), {
						x: t.clientX,
						y: t.clientY
					}) || (n({ type: "POINTER_MOVED_AWAY_FROM_SUBMENU" }), qp(i, !1));
				});
			},
			scrollToHighlightedItem({ scope: e, computed: t }) {
				let n = () => {
					La() !== "pointer" && na(e.getById(t("highlightedId")), {
						rootEl: vp(e),
						block: "nearest"
					});
				};
				return Mt(() => {
					Ra("virtual"), n();
				}), qi(() => vp(e), {
					defer: !0,
					attributes: ["aria-activedescendant"],
					callback: n
				});
			}
		},
		actions: {
			setAnchorPoint({ context: e, event: t }) {
				e.set("anchorPoint", (e) => Ze(e, t.point) ? e : t.point);
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
				let a = () => yp(t), o = r.point ?? e.get("anchorPoint"), s = o ? () => ({
					width: 0,
					height: 0,
					...o
				}) : void 0, c = {
					...n("positioning"),
					...i.get("positioningOverride")
				}, l = r.value ?? e.get("triggerValue");
				Ae(() => Tp(t, l), a, {
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
				_t(i) ? n("navigate")?.({
					value: a,
					node: i,
					href: i.href
				}) : queueMicrotask(() => i.click());
			},
			setIntentPolygon({ context: e, scope: t, event: n }) {
				let r = vp(t), i = e.get("currentPlacement");
				if (!r || !i) return;
				let a = Hp(r.getBoundingClientRect(), i);
				if (!a) return;
				let o = Me(i) === "right" ? -5 : 5;
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
					let e = lp(n);
					r?.send({
						type: "HIGHLIGHTED.SUGGEST",
						value: e
					});
				}
				qp(r, !1);
			},
			unlockParentOnClose({ refs: e, context: t }) {
				Yp(e.get("parent"), t.get("isSubmenu"));
			},
			setHighlightedItem({ context: e, event: t }) {
				let n = t.value || gp(t.target);
				e.set("highlightedValue", n);
			},
			clearHighlightedItem({ context: e }) {
				e.set("highlightedValue", null);
			},
			focusMenu({ scope: e }) {
				Mt(() => {
					let t = vp(e);
					Vn({
						root: t,
						enabled: !et(t, e.getActiveElement()),
						filter(e) {
							return !e.role?.startsWith("menuitem");
						}
					})?.focus({ preventScroll: !0 });
				});
			},
			highlightFirstItem({ context: e, scope: t }) {
				(vp(t) ? queueMicrotask : Mt)(() => {
					let n = Dp(t);
					n && e.set("highlightedValue", gp(n));
				});
			},
			highlightLastItem({ context: e, scope: t }) {
				(vp(t) ? queueMicrotask : Mt)(() => {
					let n = Op(t);
					n && e.set("highlightedValue", gp(n));
				});
			},
			highlightNextItem({ context: e, scope: t, event: n, prop: r }) {
				let i = Ap(t, {
					loop: n.loop,
					value: e.get("highlightedValue"),
					loopFocus: r("loopFocus")
				});
				e.set("highlightedValue", gp(i));
			},
			highlightPrevItem({ context: e, scope: t, event: n, prop: r }) {
				let i = jp(t, {
					loop: n.loop,
					value: e.get("highlightedValue"),
					loopFocus: r("loopFocus")
				});
				e.set("highlightedValue", gp(i));
			},
			invokeOnSelect({ context: e, prop: t, scope: n }) {
				let r = e.get("highlightedValue");
				r != null && (Ip(xp(n, r), r), t("onSelect")?.({ value: r }));
			},
			focusTrigger({ scope: e, context: t, event: n }) {
				t.get("isSubmenu") || t.get("anchorPoint") || n.restoreFocus === !1 || queueMicrotask(() => {
					Tp(e, t.get("triggerValue"))?.focus({ preventScroll: !0 });
				});
			},
			highlightMatchedItem({ scope: e, context: t, event: n, refs: r }) {
				let i = Mp(e, {
					key: n.key,
					value: t.get("highlightedValue"),
					typeaheadState: r.get("typeaheadState")
				});
				i && t.set("highlightedValue", gp(i));
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
				if (!Pp(r)) return;
				let i = r?.getAttribute("data-uid"), a = e.get("children");
				for (let e in a) {
					if (e === i) continue;
					let r = a[e], o = r.context.get("intentPolygon");
					o && t.point && Up(o, t.point) || (vp(n)?.focus({ preventScroll: !0 }), r.send({ type: "CLOSE" }));
				}
			},
			closeRootMenu({ refs: e }) {
				Wp({ parent: e.get("parent") });
			},
			openSubmenu({ refs: e, scope: t, computed: n }) {
				let r = t.getById(n("highlightedId"))?.getAttribute("data-uid"), i = e.get("children");
				(r ? i[r] : null)?.send({ type: "OPEN_AUTOFOCUS" });
			},
			focusParentMenu({ refs: e }) {
				e.get("parent")?.send({ type: "FOCUS_MENU" });
			},
			setLastHighlightedItem({ context: e, event: t }) {
				e.set("lastHighlightedValue", gp(t.target));
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
				t.get("isSubmenu") && Xp(e.get("parent"));
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
}), nm = (e) => {
	let t = Nt(), n = Ut(), r = G(() => {
		let r = rn(e);
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = zt(tm, () => B(r)), a = G(() => Zp(i, Et));
	return () => ({
		api: B(a),
		service: i
	});
}, rm = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open"
]);
function im(e, t) {
	let n = M();
	I(t, !0);
	let i = O(t, "open", 15), a = W(t, rm), o = G(() => Ln(a)), s = G(() => f(B(o), 2)), c = G(() => B(s)[0]), d = G(() => B(s)[1]), p = G(() => Wt()(B(d), [
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
	])), m = G(() => f(B(p), 2)), h = G(() => B(m)[0]), _ = G(() => B(m)[1]), v = Mf(), y = ap(), b = G(() => ({
		...B(h),
		id: B(h).id ?? n,
		open: i(),
		onOpenChange(e) {
			B(h).onOpenChange?.(e), i() !== void 0 && i(e.open);
		}
	})), x = nm(() => B(b)), S = G(() => x().api), C = G(() => x().service), w = Un(() => ({
		present: B(S).open,
		...B(c)
	}));
	ae(() => {
		let e = y?.(), t = v?.();
		e && t && (t.setChild(B(C)), B(S).setParent(e));
	});
	let E = G(() => v?.().getTriggerItemProps(B(S)));
	op(() => B(E)), ip(() => B(C)), jf(() => B(S)), Gn(w);
	var k = {
		get open() {
			return i();
		},
		set open(e) {
			i(e), r();
		}
	}, ee = D(), te = R(ee);
	return u(te, () => B(_).children ?? l), T(e, ee), g(k);
}
N(im, { open: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-separator.svelte
var am = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function om(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, am), a = Mf(), o = G(() => Q(a().getSeparatorProps(), i));
	return X(e, q({
		as: "div",
		"data-scope": "menu",
		"data-part": "separator"
	}, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(om, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-trigger.svelte
var sm = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function cm(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, sm), a = G(() => Wt()(i, ["value"])), o = G(() => f(B(a), 2)), s = G(() => B(o)[0]), c = G(() => B(o)[1]), l = Mf(), u = sp(), d = G(() => Q(l().getTriggerProps(B(s)), u?.() || {}, B(c)));
	return X(e, q({
		as: "button",
		"data-scope": "menu",
		"data-part": "trigger"
	}, () => B(d), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(cm, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Menu.svelte
var lm = y("<af-tooltip><!></af-tooltip>", 2), um = e("<svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 6 9 17l-5-5\"></path></svg>"), dm = e("<svg viewBox=\"0 0 24 24\" width=\"8\" height=\"8\" fill=\"currentColor\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle></svg>"), fm = y("<!> ", 1), pm = y("<!> <!>", 1), mm = y("<div class=\"af-kit\"><!></div>"), hm = {
	hash: "svelte-j0sh25",
	code: "af-tooltip.svelte-j0sh25 {display:block;}af-tooltip.lock.svelte-j0sh25 {display:inline-block;}[data-scope='menu'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='menu'][data-part='content'] {display:flex;flex-direction:column;min-width:128px;max-height:var(--available-height, none);padding:4px;}[data-scope='menu'][data-part='content'][hidden] {display:none;}[data-scope='menu'][data-part='item'] {position:relative;box-sizing:border-box;display:flex;align-items:center;gap:8px;padding:6px 8px;border:0 solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 4px));outline:none;font-size:14px;line-height:20px;cursor:default;-webkit-user-select:none;user-select:none;}[data-scope='menu'][data-part='item'][data-highlighted] {background-color:var(--k-accent);color:var(--k-accent-fg);}[data-scope='menu'][data-part='item'][data-danger] {color:var(--k-danger);}[data-scope='menu'][data-part='item'][data-danger][data-highlighted] {background-color:color-mix(in oklab, var(--k-danger) calc(10% + var(--k-dark, 0) * 10%), transparent);color:var(--k-danger);}[data-scope='menu'][data-part='item'][data-tone='success'] {--k-tone: var(--k-success);}[data-scope='menu'][data-part='item'][data-tone='warning'] {--k-tone: var(--k-warning);}[data-scope='menu'][data-part='item'][data-tone='info'] {--k-tone: var(--k-info);}[data-scope='menu'][data-part='item'][data-tone] {color:color-mix(in oklab, var(--k-tone) 75%, var(--k-fg));}[data-scope='menu'][data-part='item'][data-tone][data-highlighted] {background-color:color-mix(in oklab, var(--k-tone) calc(10% + var(--k-dark, 0) * 10%), transparent);color:color-mix(in oklab, var(--k-tone) 75%, var(--k-fg));}[data-scope='menu'][data-part='item'][aria-disabled='true'] {opacity:0.5;}[data-scope='menu'][data-part='item'][data-type] {padding-inline:32px 8px;}[data-scope='menu'][data-part='item-indicator'] {position:absolute;inset-inline-start:8px;display:flex;align-items:center;justify-content:center;width:14px;height:14px;pointer-events:none;}[data-scope='menu'][data-part='item-indicator'][hidden] {display:none;}[data-scope='menu'][data-part='item-indicator'] svg {flex-shrink:0;}[data-scope='menu'][data-part='item-group-label'] {box-sizing:border-box;padding:6px 8px;border:0 solid var(--k-line);font-size:14px;line-height:20px;font-weight:500;}[data-scope='menu'][data-part='content'] > [data-scope='scroll-area'][data-part='root'] {margin-inline:-4px;}[data-scope='menu'][data-part='content'] > [data-scope='scroll-area'] > [data-part='viewport'] {padding-inline:4px;}[data-scope='menu'][data-part='separator'] {height:1px;margin:4px -4px;background-color:var(--k-line);}[data-scope='menu'][data-part='item-group'].lone {display:contents;}\n  @media (forced-colors: active) {[data-scope='menu'][data-part='item'][data-highlighted], [data-scope='menu'][data-part='item'][data-tone][data-highlighted] {forced-color-adjust:none;background-color:Highlight;color:HighlightText;}[data-scope='menu'][data-part='separator'] {forced-color-adjust:none;background-color:CanvasText;}\n  }"
};
function gm(e, t) {
	I(t, !0), c(e, hm);
	let n = (e) => {
		var n = D(), r = R(n);
		{
			let e = G(() => o() ?? ""), n = G(() => s() ? "true" : void 0), i = G(() => s() ? k(u()) : {});
			b(r, () => cm, (r, a) => {
				a(r, q({
					part: "trigger",
					class: "af-button ghost",
					get "aria-label"() {
						return B(e);
					},
					get "aria-disabled"() {
						return B(n);
					}
				}, () => B(i), {
					children: (e, n) => {
						var r = D(), i = R(r);
						fe(i, t, "default", {}, null), T(e, r);
					},
					$$slots: { default: !0 }
				}));
			});
		}
		T(e, n);
	}, a = O(t, "items", 23, () => []), o = O(t, "label", 7, ""), s = O(t, "disabled", 7, !1), u = O(t, "reason", 7, ""), d = t.$$host, f = we(d), h = K(!1), _ = K(null), y = G(() => B(h) && !s());
	j(() => {
		s() && J(h, !1);
	}), j(() => De(B(_), B(y), d));
	let x = G(() => !!s() && !!u()), S = !1;
	re(() => {
		B(x), S = d.shadowRoot?.activeElement?.getAttribute("part") === "trigger";
	}), j(() => {
		B(x), S && (S = !1, requestAnimationFrame(() => {
			let { activeElement: e, body: t } = d.ownerDocument;
			e && e !== t || d.shadowRoot?.querySelector("[part=\"trigger\"]")?.focus();
		}));
	});
	let k = (e) => e ? { "aria-description": e } : {}, ee = [
		"success",
		"warning",
		"info",
		"danger"
	], te = (e) => e.tone && ee.includes(e.tone) ? e.tone : e.danger ? "danger" : void 0, A = (e) => Array.isArray(e.items), ne = G(() => (a() ?? []).flatMap((e) => A(e) ? e.items : [e]));
	function M(e) {
		let t = B(ne).find((t) => t.id === e);
		t && !t.disabled && (t.type === "checkbox" ? Ce(d, "select", {
			id: t.id,
			checked: !t.checked
		}) : t.type === "radio" ? Ce(d, "select", {
			id: t.id,
			checked: !0
		}) : Ce(d, "select", { id: t.id }));
	}
	let N = (e) => e.find((e) => e.type === "radio" && e.checked)?.id, F = G(() => (a() ?? []).filter((e) => !A(e) || e.items.length > 0)), L = (e, t) => {
		let n = te(e);
		return {
			value: e.id,
			disabled: e.disabled,
			part: "item",
			"data-danger": n === "danger" ? "" : void 0,
			"data-tone": n === "danger" ? void 0 : n,
			...e.disabled ? k(e.reason) : {},
			onclickcapture: e.disabled ? void 0 : () => t(e.id)
		};
	}, z = K(null), ae = !1;
	function H(e) {
		!ae && e && requestAnimationFrame(() => {
			let t = [...B(z)?.querySelectorAll("[data-part=\"item\"]") ?? []].find((t) => t.dataset.value === e) ?? null;
			hn({ getElement: () => t });
		});
	}
	var oe = {
		get items() {
			return a();
		},
		set items(e = []) {
			a(e), r();
		},
		get label() {
			return o();
		},
		set label(e = "") {
			o(e), r();
		},
		get disabled() {
			return s();
		},
		set disabled(e = !1) {
			s(e), r();
		},
		get reason() {
			return u();
		},
		set reason(e = "") {
			u(e), r();
		}
	}, se = pm(), ce = R(se);
	_e(ce, {});
	var W = P(ce, 2);
	return Yt(W, {
		value: () => d.shadowRoot,
		children: (e, t) => {
			Vc(e, {
				get dir() {
					return f;
				},
				children: (e, t) => {
					var r = mm(), a = V(r), o = () => B(y), c = (e) => {
						s() || J(h, e, !0);
					};
					b(a, () => im, (e, t) => {
						t(e, {
							get open() {
								return o();
							},
							set open(e) {
								c(e);
							},
							positioning: {
								strategy: "fixed",
								placement: "bottom-end"
							},
							onHighlightChange: (e) => H(e.highlightedValue),
							onSelect: (e) => M(e.value),
							onEscapeKeyDown: (e) => {
								rr(e) && e.defaultPrevented && J(h, !1);
							},
							onRequestDismiss: (e) => {
								let t = e.detail?.targetLayer;
								(!(t instanceof Node) || !Ee(t, d)) && e.preventDefault();
							},
							children: (e, t) => {
								var r = pm(), a = R(r), o = (e) => {
									var t = lm();
									p(t, 1, "lock svelte-j0sh25"), U(() => i(t, "text", u()));
									var r = V(t);
									n(r), v(t), T(e, t);
								}, s = (e) => {
									n(e);
								};
								w(a, (e) => {
									B(x) ? e(o) : e(s, -1);
								});
								var c = P(a, 2);
								b(c, () => $f, (e, t) => {
									t(e, {
										popover: "manual",
										get ref() {
											return B(_);
										},
										set ref(e) {
											J(_, e, !0);
										},
										children: (e, t) => {
											var n = D(), r = R(n);
											b(r, () => Bf, (e, t) => {
												t(e, {
													class: "af-overlay menu",
													get ref() {
														return B(z);
													},
													set ref(e) {
														J(z, e, !0);
													},
													children: (e, t) => {
														xn(e, {
															tabStop: !1,
															children: (e, t) => {
																var n = D(), r = R(n);
																{
																	let e = (e, t = l) => {
																		let n = (e, t = l) => {
																			var n = D(), r = R(n);
																			b(r, () => Yf, (e, n) => {
																				n(e, {
																					part: "indicator",
																					children: (e, n) => {
																						var r = D(), i = R(r), a = (e) => {
																							var t = um();
																							T(e, t);
																						}, o = (e) => {
																							var t = dm();
																							T(e, t);
																						};
																						w(i, (e) => {
																							t() === "checkbox" ? e(a) : e(o, -1);
																						}), T(e, r);
																					},
																					$$slots: { default: !0 }
																				});
																			}), T(e, n);
																		}, r = (e, r = l) => {
																			let i = G(() => L(r(), (e) => t()().setHighlightedValue(e)));
																			var a = D(), o = R(a), s = (e) => {
																				var t = D(), a = R(t), o = () => !!r().checked;
																				b(a, () => Rf, (e, t) => {
																					t(e, q(() => B(i), {
																						get checked() {
																							return o();
																						},
																						set checked(e) {},
																						children: (e, t) => {
																							var i = fm(), a = R(i);
																							n(a, () => r().type);
																							var o = P(a, 1, !0);
																							U(() => E(o, r().label)), T(e, i);
																						},
																						$$slots: { default: !0 }
																					}));
																				}), T(e, t);
																			}, c = (e) => {
																				var t = D(), a = R(t);
																				b(a, () => rp, (e, t) => {
																					t(e, q(() => B(i), {
																						children: (e, t) => {
																							var i = fm(), a = R(i);
																							n(a, () => r().type);
																							var o = P(a, 1, !0);
																							U(() => E(o, r().label)), T(e, i);
																						},
																						$$slots: { default: !0 }
																					}));
																				}), T(e, t);
																			}, u = (e) => {
																				var t = D(), n = R(t);
																				b(n, () => Zf, (e, t) => {
																					t(e, q(() => B(i), {
																						children: (e, t) => {
																							m();
																							var n = le();
																							U(() => E(n, r().label)), T(e, n);
																						},
																						$$slots: { default: !0 }
																					}));
																				}), T(e, t);
																			};
																			w(o, (e) => {
																				r().type === "checkbox" ? e(s) : r().type === "radio" ? e(c, 1) : e(u, -1);
																			}), T(e, a);
																		}, a = (e, t = l) => {
																			var n = D(), a = R(n), o = (e) => {
																				var n = lm();
																				U(() => i(n, "text", t().reason ?? "")), p(n, 1, "svelte-j0sh25");
																				var a = V(n);
																				r(a, t), v(n), T(e, n);
																			}, s = (e) => {
																				r(e, t);
																			};
																			w(a, (e) => {
																				t().disabled ? e(o) : e(s, -1);
																			}), T(e, n);
																		}, o = (e, t = l) => {
																			var n = pm(), r = R(n), i = (e) => {
																				var n = D(), r = R(n);
																				b(r, () => Gf, (e, n) => {
																					n(e, {
																						part: "heading",
																						children: (e, n) => {
																							m();
																							var r = le();
																							U(() => E(r, t().heading)), T(e, r);
																						},
																						$$slots: { default: !0 }
																					});
																				}), T(e, n);
																			};
																			w(r, (e) => {
																				t().heading && e(i);
																			});
																			var o = P(r, 2);
																			C(o, 17, () => t().items, (e) => e.id, (e, t) => {
																				a(e, () => B(t));
																			}), T(e, n);
																		};
																		var s = D(), c = R(s);
																		C(c, 19, () => B(F), (e) => A(e) ? `group:${e.id}` : `item:${e.id}`, (e, t, n) => {
																			var r = D(), i = R(r), s = (e) => {
																				var r = pm(), i = R(r), a = (e) => {
																					var t = D(), n = R(t);
																					b(n, () => om, (e, t) => {
																						t(e, { part: "separator" });
																					}), T(e, t);
																				};
																				w(i, (e) => {
																					B(n) > 0 && e(a);
																				});
																				var s = P(i, 2), c = (e) => {
																					var n = D(), r = R(n), i = () => N(B(t).items);
																					{
																						let e = G(() => B(t).heading ? void 0 : null);
																						b(r, () => tp, (n, r) => {
																							r(n, {
																								part: "group",
																								get value() {
																									return i();
																								},
																								set value(e) {},
																								get "aria-labelledby"() {
																									return B(e);
																								},
																								children: (e, n) => {
																									o(e, () => B(t));
																								},
																								$$slots: { default: !0 }
																							});
																						});
																					}
																					T(e, n);
																				}, l = G(() => B(t).items.some((e) => e.type === "radio")), u = (e) => {
																					var n = D(), r = R(n);
																					{
																						let e = G(() => B(t).heading ? void 0 : null);
																						b(r, () => qf, (n, r) => {
																							r(n, {
																								part: "group",
																								get "aria-labelledby"() {
																									return B(e);
																								},
																								children: (e, n) => {
																									o(e, () => B(t));
																								},
																								$$slots: { default: !0 }
																							});
																						});
																					}
																					T(e, n);
																				};
																				w(s, (e) => {
																					B(l) ? e(c) : e(u, -1);
																				}), T(e, r);
																			}, c = G(() => A(B(t))), l = (e) => {
																				var n = D(), r = R(n), i = () => B(t).checked ? B(t).id : void 0;
																				b(r, () => tp, (e, n) => {
																					n(e, {
																						class: "lone",
																						get value() {
																							return i();
																						},
																						set value(e) {},
																						"aria-labelledby": null,
																						children: (e, n) => {
																							a(e, () => B(t));
																						},
																						$$slots: { default: !0 }
																					});
																				}), T(e, n);
																			}, u = (e) => {
																				a(e, () => B(t));
																			};
																			w(i, (e) => {
																				B(c) ? e(s) : B(t).type === "radio" ? e(l, 1) : e(u, -1);
																			}), T(e, r);
																		}), T(e, s);
																	};
																	b(r, () => Vf, (t, n) => {
																		n(t, {
																			render: e,
																			$$slots: { render: !0 }
																		});
																	});
																}
																T(e, n);
															},
															$$slots: { default: !0 }
														});
													},
													$$slots: { default: !0 }
												});
											}), T(e, n);
										},
										$$slots: { default: !0 }
									});
								}), T(e, r);
							},
							$$slots: { default: !0 }
						});
					}), v(r), ie("pointermove", r, () => ae = !0, !0), ie("keydown", r, () => ae = !1, !0), T(e, r);
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { default: !0 }
	}), T(e, se), g(oe);
}
N(gm, {
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
var [_m, vm] = Zt({
	name: "NumberInputContext",
	hookName: "useNumberInputContext",
	providerName: "<NumberInputProvider />"
}), ym = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function bm(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, ym), a = vm(), o = G(() => Q(a().getControlProps(), i));
	return X(e, q({ as: "div" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(bm, { ref: {} }, [], [], { mode: "open" });
var xm = xt("numberInput").parts("root", "label", "input", "control", "valueText", "incrementTrigger", "decrementTrigger", "scrubber").build();
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+number-input@1.43.3/node_modules/@zag-js/number-input/dist/cursor.mjs
function Sm(e, t) {
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
function Cm(e, t, n) {
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
			let o = wm(a, n, r), s = r === i ? o : wm(a, n, i), c = Math.max(0, Math.min(o, n.length)), l = Math.max(c, Math.min(s, n.length));
			e.setSelectionRange(c, l);
		} catch {
			let t = e.value.length;
			e.setSelectionRange(t, t);
		}
	}
}
function wm(e, t, n) {
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
var Tm = (e) => e.ids?.root ?? `number-input:${e.id}`, Em = (e) => e.ids?.input ?? `number-input:${e.id}:input`, Dm = (e) => e.ids?.incrementTrigger ?? `number-input:${e.id}:inc`, Om = (e) => e.ids?.decrementTrigger ?? `number-input:${e.id}:dec`, km = (e) => e.ids?.scrubber ?? `number-input:${e.id}:scrubber`, Am = (e) => `number-input:${e.id}:cursor`, jm = (e) => e.ids?.label ?? `number-input:${e.id}:label`, Mm = (e) => e.getById(Em(e)), Nm = (e) => e.getById(Dm(e)), Pm = (e) => e.getById(Om(e)), Fm = (e) => e.getDoc().getElementById(Am(e)), Im = (e, t) => {
	let n = null;
	return t === "increment" && (n = Nm(e)), t === "decrement" && (n = Pm(e)), n;
}, Lm = (e, t) => {
	if (!ct()) return Bm(e, t), () => {
		Fm(e)?.remove();
	};
}, Rm = (e) => {
	let t = e.getDoc(), n = t.documentElement, r = t.body;
	return r.style.pointerEvents = "none", n.style.userSelect = "none", n.style.cursor = "ew-resize", () => {
		r.style.pointerEvents = "", n.style.userSelect = "", n.style.cursor = "", n.style.length || n.removeAttribute("style"), r.style.length || r.removeAttribute("style");
	};
}, zm = (e, t) => {
	let { point: n, isRtl: r, event: i } = t, a = e.getWin(), o = Cn(i.movementX, a.devicePixelRatio), s = Cn(i.movementY, a.devicePixelRatio), c = o > 0 ? "increment" : o < 0 ? "decrement" : null;
	r && c === "increment" && (c = "decrement"), r && c === "decrement" && (c = "increment");
	let l = {
		x: n.x + o,
		y: n.y + s
	}, u = a.innerWidth, d = Cn(7.5, a.devicePixelRatio);
	return l.x = dn(l.x + d, u) - d, {
		hint: c,
		point: l
	};
}, Bm = (e, t) => {
	let n = e.getDoc(), r = n.createElement("div");
	r.className = "scrubber--cursor", r.id = Am(e), Object.assign(r.style, {
		width: "15px",
		height: "15px",
		position: "fixed",
		pointerEvents: "none",
		left: "0px",
		top: "0px",
		zIndex: yt,
		transform: t ? `translate3d(${t.x}px, ${t.y}px, 0px)` : void 0,
		willChange: "transform"
	}), r.innerHTML = "\n      <svg width=\"46\" height=\"15\" style=\"left: -15.5px; position: absolute; top: 0; filter: drop-shadow(rgba(0, 0, 0, 0.4) 0px 1px 1.1px);\">\n        <g transform=\"translate(2 3)\">\n          <path fill-rule=\"evenodd\" d=\"M 15 4.5L 15 2L 11.5 5.5L 15 9L 15 6.5L 31 6.5L 31 9L 34.5 5.5L 31 2L 31 4.5Z\" style=\"stroke-width: 2px; stroke: white;\"></path>\n          <path fill-rule=\"evenodd\" d=\"M 15 4.5L 15 2L 11.5 5.5L 15 9L 15 6.5L 31 6.5L 31 9L 34.5 5.5L 31 2L 31 4.5Z\"></path>\n        </g>\n      </svg>", n.body.appendChild(r);
}, Vm = {
	incrementLabel: "increment value",
	decrementLabel: "decrease value"
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+number-input@1.43.3/node_modules/@zag-js/number-input/dist/number-input.connect.mjs
function Hm(e, t) {
	let { state: n, send: r, prop: i, scope: a, computed: o } = e, s = n.hasTag("focus"), c = o("isDisabled"), l = !!i("readOnly"), u = !!i("required"), d = n.matches("scrubbing"), f = o("isValueEmpty"), p = i("invalid") === void 0 ? o("isOutOfRange") : !!i("invalid"), m = c || !o("canIncrement") || l, h = c || !o("canDecrement") || l, g = kt(Vm, i("translations"));
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
			Mm(a)?.focus();
		},
		getRootProps() {
			return t.element({
				id: Tm(a),
				...xm.root.attrs,
				dir: i("dir"),
				"data-disabled": Z(c),
				"data-focus": Z(s),
				"data-invalid": Z(p),
				"data-scrubbing": Z(d)
			});
		},
		getLabelProps() {
			return t.label({
				...xm.label.attrs,
				dir: i("dir"),
				"data-disabled": Z(c),
				"data-focus": Z(s),
				"data-invalid": Z(p),
				"data-required": Z(u),
				"data-scrubbing": Z(d),
				id: jm(a),
				htmlFor: Em(a),
				onClick() {
					Mt(() => {
						Pi(Mm(a));
					});
				}
			});
		},
		getControlProps() {
			return t.element({
				...xm.control.attrs,
				dir: i("dir"),
				role: "group",
				"aria-disabled": c,
				"data-focus": Z(s),
				"data-disabled": Z(c),
				"data-invalid": Z(p),
				"data-scrubbing": Z(d),
				"aria-invalid": ut(p)
			});
		},
		getValueTextProps() {
			return t.element({
				...xm.valueText.attrs,
				dir: i("dir"),
				"data-disabled": Z(c),
				"data-invalid": Z(p),
				"data-focus": Z(s),
				"data-scrubbing": Z(d)
			});
		},
		getInputProps() {
			return t.input({
				...xm.input.attrs,
				dir: i("dir"),
				name: i("name"),
				form: i("form"),
				id: Em(a),
				role: "spinbutton",
				defaultValue: o("formattedValue"),
				pattern: i("formatOptions") ? void 0 : i("pattern"),
				inputMode: i("inputMode"),
				"aria-invalid": ut(p),
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
					let t = Sm(e.currentTarget, a);
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
					if (e.defaultPrevented || l || pt(e)) return;
					let t = cn(e, {
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
							Xe(e) || (r({ type: "INPUT.HOME" }), e.preventDefault());
						},
						End() {
							Xe(e) || (r({ type: "INPUT.END" }), e.preventDefault());
						},
						Enter(e) {
							let t = Sm(e.currentTarget, a);
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
				...xm.decrementTrigger.attrs,
				dir: i("dir"),
				id: Om(a),
				disabled: h,
				"data-disabled": Z(h),
				"aria-label": g.decrementLabel,
				type: "button",
				tabIndex: -1,
				"aria-controls": Em(a),
				"data-scrubbing": Z(d),
				onPointerDown(e) {
					h || ht(e) && (r({
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
				...xm.incrementTrigger.attrs,
				dir: i("dir"),
				id: Dm(a),
				disabled: m,
				"data-disabled": Z(m),
				"aria-label": g.incrementLabel,
				type: "button",
				tabIndex: -1,
				"aria-controls": Em(a),
				"data-scrubbing": Z(d),
				onPointerDown(e) {
					!m && ht(e) && (r({
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
				...xm.scrubber.attrs,
				dir: i("dir"),
				"data-disabled": Z(c),
				id: km(a),
				role: "presentation",
				"data-scrubbing": Z(d),
				onMouseDown(e) {
					if (c || !ht(e)) return;
					let t = nn(e), n = vt(e.currentTarget).devicePixelRatio;
					t.x -= Cn(7.5, n), t.y -= Cn(7.5, n), r({
						type: "SCRUBBER.PRESS_DOWN",
						point: t
					}), e.preventDefault(), Mt(() => {
						Pi(Mm(a));
					});
				},
				style: { cursor: c ? void 0 : "ew-resize" }
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+number@3.6.7/node_modules/@internationalized/number/dist/private/NumberFormatter.mjs
var Um = /* @__PURE__ */ new Map(), Wm = !1;
try {
	Wm = new Intl.NumberFormat("de-DE", { signDisplay: "exceptZero" }).resolvedOptions().signDisplay === "exceptZero";
} catch {}
var Gm = !1;
try {
	Gm = new Intl.NumberFormat("de-DE", {
		style: "unit",
		unit: "degree"
	}).resolvedOptions().style === "unit";
} catch {}
var Km = { degree: { narrow: {
	default: "°",
	"ja-JP": " 度",
	"zh-TW": "度",
	"sl-SI": " °"
} } }, qm = class {
	constructor(e, t = {}) {
		this.numberFormatter = Jm(e, t), this.options = t;
	}
	format(e) {
		let t = "";
		if (t = !Wm && this.options.signDisplay != null ? Ym(this.numberFormatter, this.options.signDisplay, e) : this.numberFormatter.format(e), this.options.style === "unit" && !Gm) {
			let { unit: e, unitDisplay: n = "short", locale: r } = this.resolvedOptions();
			if (!e) return t;
			let i = Km[e]?.[n];
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
		return !Wm && this.options.signDisplay != null && (e = {
			...e,
			signDisplay: this.options.signDisplay
		}), !Gm && this.options.style === "unit" && (e = {
			...e,
			style: "unit",
			unit: this.options.unit,
			unitDisplay: this.options.unitDisplay
		}), e;
	}
};
function Jm(e, t = {}) {
	let { numberingSystem: n } = t;
	if (n && e.includes("-nu-") && (e.includes("-u-") || (e += "-u-"), e += `-nu-${n}`), t.style === "unit" && !Gm) {
		let { unit: e, unitDisplay: n = "short" } = t;
		if (!e) throw Error("unit option must be provided with style: \"unit\"");
		if (!Km[e]?.[n]) throw Error(`Unsupported unit ${e} with unitDisplay = ${n}`);
		t = {
			...t,
			style: "decimal"
		};
	}
	let r = e + (t ? Object.entries(t).sort((e, t) => e[0] < t[0] ? -1 : 1).join() : "");
	if (Um.has(r)) return Um.get(r);
	let i = new Intl.NumberFormat(e, t);
	return Um.set(r, i), i;
}
function Ym(e, t, n) {
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
var Xm = /* @__PURE__ */ RegExp("^.*\\(.*\\).*$"), Zm = [
	"latn",
	"arab",
	"hanidec",
	"deva",
	"beng",
	"fullwide"
], Qm = class {
	constructor(e, t = {}) {
		this.locale = e, this.options = t;
	}
	parse(e) {
		return eh(this.locale, this.options, e).parse(e);
	}
	isValidPartialNumber(e, t, n) {
		return eh(this.locale, this.options, e).isValidPartialNumber(e, t, n);
	}
	getNumberingSystem(e) {
		return eh(this.locale, this.options, e).options.numberingSystem;
	}
}, $m = /* @__PURE__ */ new Map();
function eh(e, t, n) {
	let r = th(e, t);
	if (!e.includes("-nu-") && !r.isValidPartialNumber(n)) {
		for (let i of Zm) if (i !== r.options.numberingSystem) {
			let r = th(e + (e.includes("-u-") ? "-nu-" : "-u-nu-") + i, t);
			if (r.isValidPartialNumber(n)) return r;
		}
	}
	return r;
}
function th(e, t) {
	let n = e + (t ? Object.entries(t).sort((e, t) => e[0] < t[0] ? -1 : 1).join() : ""), r = $m.get(n);
	return r || (r = new nh(e, t), $m.set(n, r)), r;
}
var nh = class {
	constructor(e, t = {}) {
		this.locale = e, t.roundingIncrement !== 1 && t.roundingIncrement != null && (t.maximumFractionDigits == null && t.minimumFractionDigits == null ? (t.maximumFractionDigits = 0, t.minimumFractionDigits = 0) : t.maximumFractionDigits == null ? t.maximumFractionDigits = t.minimumFractionDigits : t.minimumFractionDigits ??= t.maximumFractionDigits), this.formatter = new Intl.NumberFormat(e, t), this.options = this.formatter.resolvedOptions(), this.symbols = ah(e, this.formatter, this.options, t), this.options.style === "percent" && ((this.options.minimumFractionDigits ?? 0) > 18 || (this.options.maximumFractionDigits ?? 0) > 18) && console.warn("NumberParser cannot handle percentages with greater than 18 decimal places, please reduce the number in your options.");
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
			return new Qm(this.locale, e).parse(new qm(this.locale, e).format(r));
		}
		return this.options.currencySign === "accounting" && Xm.test(e) && (r = -1 * r), r;
	}
	sanitize(e) {
		let t = this.formatter.resolvedOptions().useGrouping;
		return this.symbols.noNumeralUnits.length > 0 && this.symbols.noNumeralUnits.find((t) => t.unit === e) ? this.symbols.noNumeralUnits.find((t) => t.unit === e).value.toString() : (e = e.replace(this.symbols.literals, ""), this.symbols.minusSign && (e = e.replace("-", this.symbols.minusSign)), this.options.numberingSystem === "arab" && (this.symbols.decimal && (e = oh(e, ",", this.symbols.decimal), e = oh(e, "،", this.symbols.decimal)), this.symbols.group && t && (e = oh(e, ".", this.symbols.group))), this.symbols.group === "’" && e.includes("'") && t && (e = oh(e, "'", this.symbols.group)), this.symbols.group === "'" && e.includes("’") && t && (e = oh(e, "’", this.symbols.group)), this.options.locale === "fr-FR" && this.symbols.group && t && (e = oh(e, " ", this.symbols.group), e = oh(e, /\u00A0/g, this.symbols.group)), e);
	}
	isValidPartialNumber(e, t = -Infinity, n = Infinity) {
		let r = this.formatter.resolvedOptions().useGrouping;
		return e = this.sanitize(e), this.symbols.minusSign && e.startsWith(this.symbols.minusSign) && t < 0 ? e = e.slice(this.symbols.minusSign.length) : this.symbols.plusSign && e.startsWith(this.symbols.plusSign) && n > 0 && (e = e.slice(this.symbols.plusSign.length)), this.symbols.decimal && e.indexOf(this.symbols.decimal) > -1 && this.options.maximumFractionDigits === 0 ? !1 : (this.symbols.group && r && (e = oh(e, this.symbols.group, "")), e = e.replace(this.symbols.numeral, ""), this.symbols.decimal && (e = e.replace(this.symbols.decimal, "")), e.length === 0);
	}
}, rh = /* @__PURE__ */ new Set([
	"decimal",
	"fraction",
	"integer",
	"minusSign",
	"plusSign",
	"group"
]), ih = [
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
function ah(e, t, n, r) {
	let i = new Intl.NumberFormat(e, {
		...n,
		minimumSignificantDigits: 1,
		maximumSignificantDigits: 21,
		roundingIncrement: 1,
		roundingPriority: "auto",
		roundingMode: "halfExpand",
		useGrouping: !0
	}), a = i.formatToParts(-10000.111), o = i.formatToParts(10000.111), s = ih.map((e) => i.formatToParts(e)), c = s.map((e, t) => {
		let n = e.find((e) => e.type === "unit");
		return n && !e.some((e) => e.type === "integer" || e.type === "fraction") ? {
			unit: n.value,
			value: ih[t]
		} : null;
	}).filter((e) => !!e), l = a.find((e) => e.type === "minusSign")?.value ?? "-", u = o.find((e) => e.type === "plusSign")?.value;
	!u && (r?.signDisplay === "exceptZero" || r?.signDisplay === "always") && (u = "+");
	let d = new Intl.NumberFormat(e, {
		...n,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).formatToParts(.001).find((e) => e.type === "decimal")?.value, f = a.find((e) => e.type === "group")?.value, p = a.filter((e) => !rh.has(e.type)).map((e) => sh(e.value)), m = s.flatMap((e) => e.filter((e) => !rh.has(e.type)).map((e) => sh(e.value))), h = [.../* @__PURE__ */ new Set([...p, ...m])].sort((e, t) => t.length - e.length), g = h.length === 0 ? /* @__PURE__ */ RegExp("\\p{White_Space}|\\p{Cf}", "gu") : RegExp(`${h.join("|")}|\\p{White_Space}|\\p{Cf}`, "gu"), _ = [...new Intl.NumberFormat(n.locale, { useGrouping: !1 }).format(9876543210)].reverse(), v = new Map(_.map((e, t) => [e, t])), y = RegExp(`[${_.join("")}]`, "g");
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
function oh(e, t, n) {
	return e.replaceAll ? e.replaceAll(t, n) : e.split(t).join(n);
}
function sh(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+number-input@1.43.3/node_modules/@zag-js/number-input/dist/number-input.utils.mjs
var ch = (e, t = {}) => new Intl.NumberFormat(e, t), lh = (e, t = {}) => new Qm(e, t), uh = (e, t) => {
	let { prop: n, computed: r } = t;
	return n("formatOptions") ? e === "" ? NaN : r("parser").parse(e) : parseFloat(e);
}, dh = (e, t) => {
	let { prop: n, computed: r } = t;
	return Number.isNaN(e) ? "" : n("formatOptions") ? r("formatter").format(e) : e.toString();
}, fh = (e, t) => {
	let n = e !== void 0 && !Number.isNaN(e) ? e : 1;
	return t?.style === "percent" && (e === void 0 || Number.isNaN(e)) && (n = .01), n;
}, { choose: ph, guards: mh, createMachine: hh } = Gt(), { not: gh, and: _h } = mh, vh = hh({
	props({ props: e }) {
		let t = fh(e.step, e.formatOptions);
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
					let r = uh(t, {
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
		valueAsNumber: ({ context: e, computed: t, prop: n }) => uh(e.get("value"), {
			computed: t,
			prop: n
		}),
		formattedValue: ({ computed: e, prop: t }) => dh(e("valueAsNumber"), {
			computed: e,
			prop: t
		}),
		isAtMin: ({ computed: e, prop: t }) => wn(e("valueAsNumber"), t("min")),
		isAtMax: ({ computed: e, prop: t }) => Sn(e("valueAsNumber"), t("max")),
		isOutOfRange: ({ computed: e, prop: t }) => !mn(e("valueAsNumber"), t("min"), t("max")),
		isValueEmpty: ({ context: e }) => e.get("value") === "",
		isDisabled: ({ prop: e, context: t }) => !!e("disabled") || t.get("fieldsetDisabled"),
		canIncrement: ({ prop: e, computed: t }) => e("allowOverflow") || !t("isAtMax"),
		canDecrement: ({ prop: e, computed: t }) => e("allowOverflow") || !t("isAtMin"),
		valueText: ({ prop: e, context: t }) => kt(Vm, e("translations")).valueText?.(t.get("value")),
		formatter: Ni(({ prop: e }) => [e("locale"), e("formatOptions")], ([e, t]) => ch(e, t)),
		parser: Ni(({ prop: e }) => [e("locale"), e("formatOptions")], ([e, t]) => lh(e, t))
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
						guard: _h("clampValueOnBlur", gh("isValueEmpty"), gh("isInRange")),
						target: "idle",
						actions: [
							"setClampedValue",
							"clearHint",
							"invokeOnBlur",
							"invokeOnValueCommit"
						]
					},
					{
						guard: gh("isInRange"),
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
			entry: ph([{
				guard: "isIncrementHint",
				actions: ["increment"]
			}, {
				guard: "isDecrementHint",
				actions: ["decrement"]
			}]),
			on: {
				CHANGE_DELAY: {
					target: "spinning",
					guard: _h("isInRange", "spinOnPress")
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
				return Hi(Mm(t), {
					onFieldsetDisabledChange(t) {
						e.set("fieldsetDisabled", t);
					},
					onFormReset() {
						e.set("value", e.initial("value"));
					}
				});
			},
			setupVirtualCursor({ context: e, scope: t }) {
				return Lm(t, e.get("scrubberCursorPoint"));
			},
			preventTextSelection({ scope: e }) {
				return Rm(e);
			},
			trackButtonDisabled({ context: e, scope: t, send: n }) {
				return qi(Im(t, e.get("hint")), {
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
				let r = Mm(e);
				if (!r || !e.isActiveElement(r) || !n("allowMouseWheel")) return;
				function i(e) {
					e.preventDefault();
					let n = Math.sign(e.deltaY) * -1;
					n === 1 ? t({ type: "VALUE.INCREMENT" }) : n === -1 && t({ type: "VALUE.DECREMENT" });
				}
				return At(r, "wheel", i, { passive: !1 });
			},
			activatePointerLock({ scope: e }) {
				if (!ct()) return Qi(e.getDoc());
			},
			trackMousemove({ scope: e, send: t, context: n, computed: r }) {
				let i = e.getDoc();
				function a(i) {
					let a = zm(e, {
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
				return qt(At(i, "mousemove", a, !1), At(i, "mouseup", o, !1));
			}
		},
		actions: {
			focusInput({ scope: e, prop: t }) {
				if (!t("focusInputOnChange")) return;
				let n = Mm(e);
				e.isActiveElement(n) || Mt(() => n?.focus({ preventScroll: !0 }));
			},
			increment({ context: e, event: t, prop: n, computed: r }) {
				let i = pn(r("valueAsNumber"), t.step ?? n("step"));
				n("allowOverflow") || (i = vn(i, n("min"), n("max"))), e.set("value", dh(i, {
					computed: r,
					prop: n
				}));
			},
			decrement({ context: e, event: t, prop: n, computed: r }) {
				let i = _n(r("valueAsNumber"), t.step ?? n("step"));
				n("allowOverflow") || (i = vn(i, n("min"), n("max"))), e.set("value", dh(i, {
					computed: r,
					prop: n
				}));
			},
			setClampedValue({ context: e, prop: t, computed: n }) {
				let r = vn(n("valueAsNumber"), t("min"), t("max"));
				e.set("value", dh(r, {
					computed: n,
					prop: t
				}));
			},
			setRawValue({ context: e, event: t, prop: n, computed: r }) {
				let i = typeof t.value == "number" ? t.value : uh(t.value, {
					computed: r,
					prop: n
				});
				n("allowOverflow") || (i = vn(i, n("min"), n("max"))), e.set("value", dh(i, {
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
				let r = dh(t("max"), {
					computed: n,
					prop: t
				});
				e.set("value", r);
			},
			decrementToMin({ context: e, prop: t, computed: n }) {
				let r = dh(t("min"), {
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
				let i = t.type.endsWith("CHANGE") ? e.get("value") : n("formattedValue"), a = Mm(r), o = t.selection ?? Sm(a, r);
				Mt(() => {
					Ri(a, i), Cm(a, o, r);
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
				let n = Fm(t), r = e.get("scrubberCursorPoint");
				n && r && (n.style.transform = `translate3d(${r.x}px, ${r.y}px, 0px)`);
			}
		}
	}
}), yh = (e = {}) => {
	let t = Nt(), n = Ut(), r = Be(), i = G(() => {
		let i = rn(e);
		return Bt(i, ["id"]), {
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
	}), a = zt(vh, () => B(i)), o = G(() => Hm(a, Et));
	return () => B(o);
}, bh = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"value"
]);
function xh(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = O(t, "value", 7), a = W(t, bh), o = G(() => Q(i()().getRootProps(), a));
	return _m(() => i()()), X(e, q({ as: "div" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		},
		get value() {
			return i();
		},
		set value(e) {
			i(e), r();
		}
	});
}
N(xh, {
	ref: {},
	value: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/NumberInput.svelte
var Sh = (e, t = l) => {
	var n = Nh(), r = F(n);
	U(() => x(r, "d", t())), T(e, n);
};
function Ch(e) {
	let t = Le(e);
	return class extends t {
		attributeChangedCallback(e, t, n) {
			super.attributeChangedCallback(e, t, e === "value" && n !== null && n.trim() === "" ? null : n);
		}
	};
}
var wh = (e) => typeof e == "number" && Number.isFinite(e) ? e : null;
function Th(e) {
	try {
		return new Intl.NumberFormat("en", {
			style: "currency",
			currency: e
		}).resolvedOptions().maximumFractionDigits ?? 0;
	} catch {
		return null;
	}
}
function Eh(e) {
	let [t = "", n] = String(e).split("e");
	return Math.max(0, (t.split(".")[1]?.length ?? 0) - Number(n ?? 0));
}
function Dh(e, t) {
	if (!Number.isFinite(e)) return e;
	let [n = "", r] = String(e).split("e");
	return Number(`${n}e${Number(r ?? 0) + t}`);
}
var Oh = 20, kh = 18;
function Ah(e, t, n) {
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
var jh = {
	comma_dot: "en-US",
	dot_comma: "de-DE",
	space_comma: "fr-FR"
}, Mh = {
	ArrowUp: [1, 1],
	ArrowDown: [-1, 1],
	PageUp: [1, 10],
	PageDown: [-1, 10]
}, Nh = e("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path></path></svg>"), Ph = y("<span id=\"af-described\" hidden=\"\"> </span>"), Fh = y("<button type=\"button\" part=\"decrement\" class=\"af-button ghost icon xs svelte-gc58zb\" tabindex=\"-1\"><!></button> <button type=\"button\" part=\"increment\" class=\"af-button ghost icon xs svelte-gc58zb\" tabindex=\"-1\"><!></button>", 1), Ih = y("<input/> <!>", 1), Lh = y("<!> <div class=\"af-kit\"><!> <!></div>", 1), Rh = {
	hash: "svelte-gc58zb",
	code: ":host {display:inline-block;max-width:100%;vertical-align:middle;}[data-scope='number-input'][data-part='root'] {display:block;}[data-scope='number-input'][data-part='control'] {display:flex;align-items:center;box-sizing:border-box;width:100%;height:36px;padding:4px 12px;border:1px solid var(--k-input);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark, 0) * 100%), transparent);box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);font-size:16px;line-height:24px;transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);}\n  @media (min-width: 48rem) {[data-scope='number-input'][data-part='control'] {font-size:14px;line-height:20px;} }[data-scope='number-input'][data-part='control'][data-steppers] {padding-right:4px;}[data-scope='number-input'][data-part='control']:has(input:focus-visible) {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring), 0 1px 2px 0 rgb(0 0 0 / 0.05);}[data-scope='number-input'][data-part='control']:has(input[aria-invalid='true']) {border-color:var(--k-danger);}[data-scope='number-input'][data-part='control']:has(input[aria-invalid='true']:focus-visible) {box-shadow:0 0 0 3px color-mix(in oklab, var(--k-danger) calc(20% + var(--k-dark, 0) * 20%), transparent), 0 1px 2px 0 rgb(0 0 0 / 0.05);}[data-scope='number-input'][data-part='control'][data-disabled] {opacity:0.5;cursor:not-allowed;}[data-scope='number-input'][data-part='input'] {flex:1;min-width:0;width:8em;height:100%;padding:0;border:0;outline:none;background:transparent;color:inherit;font:inherit;}[data-scope='number-input'][data-part='input']::placeholder {color:var(--k-muted);opacity:1;}[data-scope='number-input'][data-part='input']::selection {background:var(--k-primary);color:var(--k-primary-fg);}[data-scope='number-input'][data-part='input']:disabled {pointer-events:none;cursor:not-allowed;}.af-button.svelte-gc58zb {flex:none;}\n  @media (prefers-reduced-motion: reduce) {[data-scope='number-input'][data-part='control'] {transition:none;} }\n  @media (forced-colors: active) {[data-scope='number-input'][data-part='control']:has(input:focus-visible) {outline:2px solid;outline-offset:2px;}\n  }"
};
function zh(e, t) {
	let i = M();
	I(t, !0), c(e, Rh);
	let a = O(t, "value", 7, null), o = O(t, "min", 7, null), s = O(t, "max", 7, null), l = O(t, "step", 7, null), u = O(t, "precision", 7, null), d = O(t, "fractional", 7, !1), f = O(t, "unscaled", 7, !1), p = O(t, "format", 7, "plain"), m = O(t, "currency", 7, "VND"), h = O(t, "steppers", 7, !1), _ = O(t, "placeholder", 7, null), y = O(t, "label", 7, null), S = O(t, "disabled", 7, !1), C = O(t, "locale", 7, null), k = O(t, "separators", 7, null), ee = O(t, "strings", 7, null), A = O(t, "name", 7, null), N = O(t, "required", 7, !1), ie = O(t, "readonly", 7, !1), L = O(t, "description", 7, null), z = O(t, "error", 7, null), ae = O(t, "invalid", 7, !1), H = t.$$host, se = we(H), ce = `${i}-input`, le = G(() => he(C(), ee() ?? void 0)), W = G(() => ve(C()) ? "vi-VN" : "en-GB"), ue = G(() => k() && Object.hasOwn(jh, k()) ? jh[k()] : B(W)), de = G(() => k() !== "none"), q = G(() => wh(a())), fe = G(() => wh(o())), pe = G(() => wh(s())), Y = G(() => p() === "currency" || p() === "percent" ? p() : "decimal"), ye = G(() => B(Y) === "percent" && !!f()), be = G(() => wh(l()) !== null && l() > 0 ? l() : B(Y) === "percent" && !B(ye) ? .01 : 1), xe = G(() => B(Y) === "percent" && !B(ye) ? Number((B(be) * 100).toFixed(10)) : B(be)), Se = G(() => wh(u()) !== null && u() >= 0), Te = G(() => !B(Se) && (!!d() || B(ye))), Ee = G(() => B(Se) ? Math.min(20, Math.floor(u())) : B(Te) ? B(Y) === "percent" ? kh : Oh : Number.isInteger(B(xe)) ? 0 : 2), De = G(() => m() && Th(m()) !== null ? m().toUpperCase() : "VND"), Oe = G(() => ({
		...B(Y) === "currency" ? {
			style: B(Y),
			currency: B(De),
			minimumFractionDigits: Math.min(Th(B(De)) ?? 0, B(Ee)),
			maximumFractionDigits: B(Ee)
		} : {
			style: B(Y),
			maximumFractionDigits: B(Ee)
		},
		useGrouping: B(de)
	})), ke = G(() => new Intl.NumberFormat(B(ue), B(Oe))), Ae = (e) => B(ke).format(B(ye) ? Dh(e, -2) : e), je = G(() => B(q) === null ? "" : Ae(B(q))), Me = G(() => Math.min(20, Math.max(B(Ee) + (B(Y) === "percent" && !B(ye) ? 2 : 0), Eh(B(be))))), Ne = (e, t = B(Me)) => Number(e.toFixed(t)), Pe = K(null), Fe = K(""), Ie = G(() => k() === "space_comma" ? B(Fe).replace(/(?<=[0-9])[ \u00a0](?=[0-9])/g, " ") : B(Fe)), Le = K(!1), Re = K(!1), Be = "", He = null;
	re(() => {
		let e = B(je);
		e !== He && (He = e, ne(() => {
			B(Re) && (J(Re, !1), J(Le, !1));
		})), !B(Le) && (J(Fe, e, !0), B(Pe) && B(Pe).value !== e && (B(Pe).value = e));
	});
	let Ue = K(!1), We = G(() => !!S() || B(Ue)), Ge = G(() => [L(), z()].filter(Boolean).join(" ")), Ke = yh(() => ({
		id: i,
		ids: { input: ce },
		getRootNode: () => H.shadowRoot,
		locale: B(ue),
		dir: se,
		value: B(Ie),
		formatOptions: B(Oe),
		step: B(be),
		min: B(fe) ?? void 0,
		max: B(pe) ?? void 0,
		allowOverflow: !0,
		allowMouseWheel: !1,
		spinOnPress: !1,
		focusInputOnChange: !1,
		disabled: B(We),
		readOnly: !!ie(),
		invalid: !!ae()
	}));
	j(() => {
		H.toggleAttribute("data-unparsed", B(Re));
	});
	let qe = G(() => B(Re) ? { badInput: !0 } : N() && B(q) === null ? { valueMissing: !0 } : B(q) !== null && B(fe) !== null && B(q) < B(fe) ? { rangeUnderflow: !0 } : B(q) !== null && B(pe) !== null && B(q) > B(pe) ? { rangeOverflow: !0 } : {}), Je = G(() => "badInput" in B(qe) ? ge(me(B(le), "badNumber"), { example: new Intl.NumberFormat(B(ue), { useGrouping: B(de) }).format(1234.5) }) : "valueMissing" in B(qe) ? me(B(le), "valueMissing") : "rangeUnderflow" in B(qe) ? ge(me(B(le), "numberUnderflow"), { min: Ae(B(fe)) }) : "rangeOverflow" in B(qe) ? ge(me(B(le), "numberOverflow"), { max: Ae(B(pe)) }) : "");
	j(() => Ve(H, {
		name: A(),
		value: B(q) === null ? null : String(B(q)),
		validity: B(qe),
		message: B(Je),
		anchor: B(Pe)
	})), ze(H, {
		reset() {
			let e = H.getAttribute("value"), t = e === null || e.trim() === "" ? null : wh(Number(e));
			t !== B(q) && Ce(H, "change", { value: t });
		},
		disabled(e) {
			J(Ue, e, !0);
		}
	});
	function Ye(e) {
		let t = B(Re);
		J(Re, !1), (e !== B(q) || t) && Ce(H, "change", { value: e });
	}
	let Xe = () => {
		if (B(Fe).trim() === "") return null;
		let e = Ke().valueAsNumber;
		return B(ye) ? Dh(e, 2) : e;
	};
	function Ze() {
		if (!B(Le)) return;
		if (Ah(B(Ie), B(ue), B(de))) {
			(!B(Re) || B(Fe) !== Be) && Ce(H, "unparsed", { text: B(Fe) }), Be = B(Fe), J(Re, !0);
			return;
		}
		let e = Xe();
		J(Le, !1), e === null || Number.isFinite(e) ? Ye(e === null ? null : Ne(e)) : B(Re) && Ye(B(q));
	}
	function Qe(e, t = 1) {
		if (B(We) || ie()) return;
		let n = B(Le) && !Ah(B(Ie), B(ue), B(de)) ? Xe() : B(q);
		J(Le, !1);
		let r = n !== null && Number.isFinite(n) ? n : 0, i = Ne(r + e * t * B(be), B(Te) ? Math.min(B(Me), Math.max(Eh(r), Eh(B(be)))) : B(Me));
		B(fe) !== null && (i = Math.max(i, B(fe))), B(pe) !== null && (i = Math.min(i, B(pe))), Ye(i);
	}
	function $e(e) {
		if (e.target !== B(Pe) || e.isComposing) return;
		let t = Mh[e.key];
		e.key === "Enter" ? (e.preventDefault(), Ze()) : t && (e.preventDefault(), Qe(...t));
	}
	let et = G(() => {
		let { onkeydown: e, onfocusout: t, oninput: n, ...r } = Ke().getInputProps();
		return {
			...r,
			onfocusout(e) {
				B(Re) || t?.(e);
			},
			oninput(e) {
				J(Fe, e.currentTarget.value, !0), J(Le, !0), n?.(e);
			}
		};
	}), tt = G(() => B(q) !== null && B(fe) !== null && B(q) <= B(fe)), nt = G(() => B(q) !== null && B(pe) !== null && B(q) >= B(pe));
	var rt = {
		get value() {
			return a();
		},
		set value(e = null) {
			a(e), r();
		},
		get min() {
			return o();
		},
		set min(e = null) {
			o(e), r();
		},
		get max() {
			return s();
		},
		set max(e = null) {
			s(e), r();
		},
		get step() {
			return l();
		},
		set step(e = null) {
			l(e), r();
		},
		get precision() {
			return u();
		},
		set precision(e = null) {
			u(e), r();
		},
		get fractional() {
			return d();
		},
		set fractional(e = !1) {
			d(e), r();
		},
		get unscaled() {
			return f();
		},
		set unscaled(e = !1) {
			f(e), r();
		},
		get format() {
			return p();
		},
		set format(e = "plain") {
			p(e), r();
		},
		get currency() {
			return m();
		},
		set currency(e = "VND") {
			m(e), r();
		},
		get steppers() {
			return h();
		},
		set steppers(e = !1) {
			h(e), r();
		},
		get placeholder() {
			return _();
		},
		set placeholder(e = null) {
			_(e), r();
		},
		get label() {
			return y();
		},
		set label(e = null) {
			y(e), r();
		},
		get disabled() {
			return S();
		},
		set disabled(e = !1) {
			S(e), r();
		},
		get locale() {
			return C();
		},
		set locale(e = null) {
			C(e), r();
		},
		get separators() {
			return k();
		},
		set separators(e = null) {
			k(e), r();
		},
		get strings() {
			return ee();
		},
		set strings(e = null) {
			ee(e), r();
		},
		get name() {
			return A();
		},
		set name(e = null) {
			A(e), r();
		},
		get required() {
			return N();
		},
		set required(e = !1) {
			N(e), r();
		},
		get readonly() {
			return ie();
		},
		set readonly(e = !1) {
			ie(e), r();
		},
		get description() {
			return L();
		},
		set description(e = null) {
			L(e), r();
		},
		get error() {
			return z();
		},
		set error(e = null) {
			z(e), r();
		},
		get invalid() {
			return ae();
		},
		set invalid(e = !1) {
			ae(e), r();
		}
	}, it = Lh(), at = R(it);
	_e(at, {});
	var ot = P(at, 2), st = V(ot), ct = (e) => {
		var t = Ph(), n = F(t, !0);
		U(() => E(n, B(Ge))), T(e, t);
	};
	w(st, (e) => {
		B(Ge) && e(ct);
	});
	var lt = P(st, 2);
	return b(lt, () => xh, (e, t) => {
		t(e, {
			get value() {
				return Ke;
			},
			children: (e, t) => {
				var r = D(), i = R(r);
				{
					let e = G(() => h() ? "" : void 0);
					b(i, () => bm, (t, r) => {
						r(t, {
							part: "control",
							get "data-steppers"() {
								return B(e);
							},
							onkeydowncapture: $e,
							children: (e, t) => {
								var r = Ih(), i = R(r);
								n(i, () => ({
									...B(et),
									part: "input",
									value: B(Fe),
									placeholder: _() || void 0,
									"aria-label": y() || _() || void 0,
									"aria-describedby": B(Ge) ? "af-described" : void 0,
									"aria-invalid": ae() || B(Re) ? "true" : void 0,
									"aria-required": N() ? "true" : void 0,
									"aria-valuenow": B(q) ?? void 0,
									"aria-valuemin": B(fe) ?? void 0,
									"aria-valuemax": B(pe) ?? void 0,
									"aria-valuetext": B(Fe) || void 0,
									onblur: Ze
								}), void 0, void 0, void 0, "svelte-gc58zb", !0), te(i, (e) => J(Pe, e), () => B(Pe));
								var a = P(i, 2), o = (e) => {
									var t = Fh(), n = R(t);
									Sh(V(n), () => "m6 9 6 6 6-6"), v(n);
									var r = P(n, 2);
									Sh(V(r), () => "m18 15-6-6-6 6"), v(r), U(() => {
										x(n, "aria-label", B(le).decrease), x(n, "aria-controls", ce), n.disabled = B(We) || !!ie() || B(tt), x(r, "aria-label", B(le).increase), x(r, "aria-controls", ce), r.disabled = B(We) || !!ie() || B(nt);
									}), oe("mousedown", n, (e) => e.preventDefault()), oe("click", n, () => Qe(-1)), oe("mousedown", r, (e) => e.preventDefault()), oe("click", r, () => Qe(1)), T(e, t);
								};
								w(a, (e) => {
									h() && e(o);
								}), T(e, r);
							},
							$$slots: { default: !0 }
						});
					});
				}
				T(e, r);
			},
			$$slots: { default: !0 }
		});
	}), v(ot), T(e, it), g(rt);
}
z(["mousedown", "click"]), N(zh, {
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
}, Ch);
//#endregion
//#region src/kit/Pager.svelte
var Bh = y("<span class=\"note svelte-1ygr0dr\"> </span>"), Vh = y("<span class=\"af-spinner\" aria-hidden=\"true\"></span>"), Hh = y("<button type=\"button\" part=\"more\" class=\"af-button ghost sm more svelte-1ygr0dr\"><!> </button>"), Uh = y("<!> <!>", 1), Wh = y("<div part=\"page-size\" class=\"size svelte-1ygr0dr\"><span class=\"note svelte-1ygr0dr\" aria-hidden=\"true\"> </span> <af-select></af-select></div>", 2), Gh = y("<span part=\"range\" class=\"note svelte-1ygr0dr\"> </span>"), Kh = y("<!> <!> <button type=\"button\" part=\"prev\" class=\"af-button sm step svelte-1ygr0dr\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m15 18-6-6 6-6\"></path></svg> </button> <button type=\"button\" part=\"next\" class=\"af-button sm step svelte-1ygr0dr\"> <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m9 18 6-6-6-6\"></path></svg></button>", 1), qh = y("<span> </span>"), Jh = y("<div class=\"af-kit row svelte-1ygr0dr\"><!></div> <div part=\"status\" role=\"status\" class=\"live svelte-1ygr0dr\"><!></div>", 1), Yh = {
	hash: "svelte-1ygr0dr",
	code: ":host {display:block;}.row.svelte-1ygr0dr {display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;}.size.svelte-1ygr0dr {display:flex;align-items:center;gap:8px;}.note.svelte-1ygr0dr {font-size:12px;line-height:16px;color:var(--k-muted);white-space:nowrap;}.size.svelte-1ygr0dr af-select:where(.svelte-1ygr0dr) {width:76px;}button.af-button.sm.step.svelte-1ygr0dr {gap:4px;}button.af-button.sm.more.svelte-1ygr0dr {font-size:12px;line-height:16px;}.live.svelte-1ygr0dr {position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;}"
};
function Xh(e, t) {
	I(t, !0), c(e, Yh);
	let n = O(t, "mode", 7, "pages"), a = O(t, "hasPrev", 7, !1), o = O(t, "hasNext", 7, !1), s = O(t, "hasMore", 7, !1), l = O(t, "busy", 7, !1), u = O(t, "pageSize", 7, null), d = O(t, "pageSizes", 7, null), f = O(t, "rangeStart", 7, null), h = O(t, "rangeEnd", 7, null), _ = O(t, "total", 7, null), y = O(t, "shown", 7, null), b = O(t, "focusNew", 7, !1), C = O(t, "controls", 7, null), D = O(t, "locale", 7, null), k = O(t, "strings", 7, null), ee = t.$$host, A = G(() => he(D(), k() ?? void 0)), M = (e) => {
		let t = typeof e == "string" && e.trim() !== "" ? Number(e) : e;
		return typeof t == "number" && Number.isFinite(t) ? t : null;
	}, re = G(() => new Intl.NumberFormat(ve(D()) ? "vi-VN" : "en-GB")), N = (e) => B(re).format(e), ie = G(() => n() === "more"), L = G(() => M(f())), z = G(() => M(h())), ae = G(() => M(_())), H = G(() => M(y())), se = G(() => M(u())), ce = G(() => (d() ?? []).map(M).filter((e) => e !== null)), le = G(() => B(L) === null || B(z) === null ? "" : ge(B(ae) === null ? B(A).pageRangeOpen : B(A).pageRange, {
		start: N(B(L)),
		end: N(B(z)),
		total: B(ae) === null ? "" : N(B(ae))
	})), W = G(() => B(H) === null ? "" : ge(B(ae) === null ? B(A).shownOnly : B(A).shownOf, {
		shown: N(B(H)),
		total: B(ae) === null ? "" : N(B(ae))
	})), ue = G(() => B(ie) ? !!s() || B(H) !== null : !!a() || !!o() || B(le) !== ""), de = G(() => !a() || !!l()), q = G(() => !o() || !!l()), fe = K(""), pe = K(0), Y = !1, me = 0, ye = !1, be = !1, xe = K(null), Se = K(null);
	j(() => {
		B(H), s();
		let e = !!l();
		ne(() => {
			Y && (e && (ye = !0), be || (be = !0, queueMicrotask(we)));
		});
	});
	function we() {
		if (be = !1, !Y) return;
		let e = B(H), t = !!s();
		e !== null && e > me ? (Y = !1, J(fe, ge(B(A).moreLoaded, { count: N(e - me) }), !0), J(pe, B(pe) + 1), Te(e - me)) : !l() && (ye || !t) && (Y = !1, Te(0));
	}
	function Te(e) {
		let t = Oe(), n = !t || t === document.body, r = !!B(xe)?.isConnected, i = r && t === B(xe), a = e > 0 ? Ae() : null;
		(e > 0 && b() && C() && (i || n) || n && !r) && Ee(a ?? B(Se));
	}
	function Ee(e) {
		e?.isConnected && (!e.hasAttribute("tabindex") && e.tabIndex < 0 && e.setAttribute("tabindex", "-1"), e.focus());
	}
	function De(e) {
		if (!e) return null;
		let t = ee.getRootNode();
		return (typeof t.getElementById == "function" ? t : document).getElementById(e);
	}
	let ke = null;
	function Ae() {
		let e = De(C());
		if (!e || !ke) return null;
		let t = [...e.children].find((e) => !ke.has(e));
		return t instanceof HTMLElement || t instanceof SVGElement ? t : null;
	}
	function je() {
		let e = De(C());
		for (let t of ee.shadowRoot?.querySelectorAll("button[part=\"prev\"], button[part=\"next\"], button[part=\"more\"]") ?? []) "ariaControlsElements" in t && (t.ariaControlsElements = e ? [e] : null);
	}
	j(() => {
		C(), B(ue), B(ie), s(), je();
	});
	function Me(e, t) {
		je(), !e && (t === "more" && (ke = new Set(De(C())?.children ?? []), Y = !0, me = B(H) ?? 0, ye = !1, J(fe, "")), Ce(ee, t, {}));
	}
	function Ne(e) {
		let t = M(e.detail?.value);
		t !== null && Ce(ee, "page-size-change", { pageSize: t });
	}
	var Pe = {
		get mode() {
			return n();
		},
		set mode(e = "pages") {
			n(e), r();
		},
		get hasPrev() {
			return a();
		},
		set hasPrev(e = !1) {
			a(e), r();
		},
		get hasNext() {
			return o();
		},
		set hasNext(e = !1) {
			o(e), r();
		},
		get hasMore() {
			return s();
		},
		set hasMore(e = !1) {
			s(e), r();
		},
		get busy() {
			return l();
		},
		set busy(e = !1) {
			l(e), r();
		},
		get pageSize() {
			return u();
		},
		set pageSize(e = null) {
			u(e), r();
		},
		get pageSizes() {
			return d();
		},
		set pageSizes(e = null) {
			d(e), r();
		},
		get rangeStart() {
			return f();
		},
		set rangeStart(e = null) {
			f(e), r();
		},
		get rangeEnd() {
			return h();
		},
		set rangeEnd(e = null) {
			h(e), r();
		},
		get total() {
			return _();
		},
		set total(e = null) {
			_(e), r();
		},
		get shown() {
			return y();
		},
		set shown(e = null) {
			y(e), r();
		},
		get focusNew() {
			return b();
		},
		set focusNew(e = !1) {
			b(e), r();
		},
		get controls() {
			return C();
		},
		set controls(e = null) {
			C(e), r();
		},
		get locale() {
			return D();
		},
		set locale(e = null) {
			D(e), r();
		},
		get strings() {
			return k();
		},
		set strings(e = null) {
			k(e), r();
		}
	}, Fe = Uh(), Ie = R(Fe);
	_e(Ie, {});
	var Le = P(Ie, 2), Re = (e) => {
		var t = Jh(), n = R(t), r = V(n), a = (e) => {
			var t = Uh(), n = R(t), r = (e) => {
				var t = Bh(), n = F(t, !0);
				U(() => E(n, B(W))), T(e, t);
			};
			w(n, (e) => {
				B(W) && e(r);
			});
			var i = P(n, 2), a = (e) => {
				var t = Hh(), n = V(t), r = (e) => {
					var t = Vh();
					T(e, t);
				};
				w(n, (e) => {
					l() && e(r);
				});
				var i = P(n, 1, !0);
				v(t), te(t, (e) => J(xe, e), () => B(xe)), U(() => {
					x(t, "aria-controls", C() || void 0), x(t, "aria-disabled", l() ? "true" : void 0), E(i, B(A).loadMore);
				}), oe("click", t, () => Me(!!l(), "more")), T(e, t);
			};
			w(i, (e) => {
				s() && e(a);
			}), T(e, t);
		}, o = (e) => {
			var t = Kh(), n = R(t), r = (e) => {
				var t = Wh(), n = V(t), r = F(n, !0), a = P(n, 2);
				i(a, "size", "sm"), U(() => i(a, "label", B(A).rowsPerPage)), U((e) => i(a, "value", e), [() => String(B(se))]), U((e) => i(a, "options", e), [() => B(ce).map((e) => ({
					value: String(e),
					label: N(e)
				}))]), U(() => i(a, "locale", D() || void 0)), U(() => i(a, "strings", k() ?? void 0)), p(a, 1, "svelte-1ygr0dr"), v(t), U(() => E(r, B(A).rowsPerPage)), oe("change", a, Ne), T(e, t);
			};
			w(n, (e) => {
				B(se) !== null && B(ce).length > 0 && e(r);
			});
			var a = P(n, 2), o = (e) => {
				var t = Gh(), n = F(t, !0);
				U(() => E(n, B(le))), T(e, t);
			};
			w(a, (e) => {
				B(le) && e(o);
			});
			var s = P(a, 2), c = P(V(s), 1, !0);
			v(s);
			var l = P(s, 2), u = V(l, !0);
			m(), v(l), U(() => {
				x(s, "aria-controls", C() || void 0), x(s, "aria-disabled", B(de) ? "true" : void 0), E(c, B(A).previous), x(l, "aria-controls", C() || void 0), x(l, "aria-disabled", B(q) ? "true" : void 0), E(u, B(A).next);
			}), oe("click", s, () => Me(B(de), "prev")), oe("click", l, () => Me(B(q), "next")), T(e, t);
		};
		w(r, (e) => {
			B(ie) ? e(a) : e(o, -1);
		}), v(n);
		var c = P(n, 2), u = V(c);
		S(u, () => B(pe), (e) => {
			var t = qh(), n = F(t, !0);
			U(() => E(n, B(fe))), T(e, t);
		}), v(c), te(c, (e) => J(Se, e), () => B(Se)), oe("focusin", n, je), T(e, t);
	};
	return w(Le, (e) => {
		B(ue) && e(Re);
	}), T(e, Fe), g(Pe);
}
z([
	"focusin",
	"click",
	"change"
]), N(Xh, {
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
function Zh(e) {
	let t = e.trim().split(/\s+/).filter(Boolean).map((e) => Array.from(e)[0].toUpperCase());
	return t.length === 0 ? "" : t.length === 1 ? t[0] : t[0] + t[t.length - 1];
}
var Qh = y("<img alt=\"\"/>"), $h = y("<span class=\"af-avatar sm\"><!></span>"), eg = y("<span id=\"af-described\" hidden=\"\"> </span>"), tg = y("<span class=\"af-chip secondary\" part=\"chip\"><!> <span> </span> <button type=\"button\" part=\"remove\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button></span>"), ng = y("<span class=\"lead svelte-akzd1x\"><!></span>"), rg = y("<button type=\"button\" part=\"clear\" class=\"af-button ghost icon xs\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button>"), ig = y("<!> <!> <!>", 1), ag = y("<span class=\"detail\"> </span>"), og = y("<!> <span class=\"lines\"><span class=\"name\"> </span> <!></span>", 1), sg = y("<div part=\"loading\"> </div>"), cg = y("<button type=\"button\" part=\"load-more\"> </button>"), lg = y("<!> <!>", 1), ug = y("<div class=\"af-kit\"><!> <!></div>"), dg = {
	hash: "svelte-akzd1x",
	code: ".lead.svelte-akzd1x {display:inline-flex;margin-right:8px;}"
};
function fg(e, t) {
	I(t, !0), c(e, dg);
	let n = (e, t = l) => {
		var n = $h(), r = V(n), i = (e) => {
			var n = Qh();
			U(() => x(n, "src", t().avatar)), T(e, n);
		}, a = (e) => {
			var n = le();
			U((e) => E(n, e), [() => Zh(t().name)]), T(e, n);
		}, o = G(() => se(t().id)), s = (e) => {
			var t = le("?");
			T(e, t);
		};
		w(r, (e) => {
			t().avatar ? e(i) : B(o) ? e(a, 1) : e(s, -1);
		}), v(n), T(e, n);
	}, i = O(t, "people", 23, () => []), a = O(t, "source", 7, null), o = O(t, "value", 7, null), s = O(t, "multiple", 7, !1), u = O(t, "placeholder", 7, null), d = O(t, "label", 7, null), f = O(t, "loading", 7, !1), p = O(t, "locale", 7, null), h = O(t, "disabled", 7, !1), _ = O(t, "strings", 7, null), y = O(t, "name", 7, null), S = O(t, "required", 7, !1), k = O(t, "readonly", 7, !1), ee = O(t, "description", 7, null), te = O(t, "error", 7, null), A = O(t, "invalid", 7, !1), ne = t.$$host, M = we(ne), re = G(() => he(p(), _() ?? void 0)), N = G(() => {
		let e = /* @__PURE__ */ new Set();
		return (i() ?? []).filter((t) => !e.has(t.id) && !!e.add(t.id));
	}), ie = G(() => new Map(B(N).map((e) => [e.id, e]))), L = G(() => [...new Set(Array.isArray(o()) ? o() : o() ? [o()] : [])]), z = K(null), ae = K(!1), H = Yc((e) => e.id);
	Xc(H, () => a(), () => B(L), () => {
		B(ae) && H.now(B(z) ?? "");
	});
	let se = (e) => a() ? H.named.get(e) : B(ie).get(e), ce = G(() => B(L).filter((e) => !se(e)));
	function W(e) {
		let t = se(e);
		return t ? t.name : f() || a() && H.pending(e) ? "…" : (a() ? H.answered(e) : B(N).length > 0) ? B(ce).length > 1 ? `${B(re).unknownPerson} ${B(ce).indexOf(e) + 1}` : B(re).unknownPerson : "";
	}
	let ue = G(() => B(z) ?? (s() || !B(L)[0] || !a() && f() && !B(ie).has(B(L)[0]) ? "" : W(B(L)[0]))), de = G(() => a() ? H.items : B(N).filter((e) => xr(e.name, B(z) ?? "") || xr(e.email, B(z) ?? ""))), q = G(() => ji({
		items: B(de),
		itemToValue: (e) => e.id,
		itemToString: (e) => e.name
	})), fe = G(() => !!a() && (!!f() || H.busy)), pe = K(null);
	j(() => De(B(pe), B(ae), ne));
	let Y = (e) => Ce(ne, "change", { value: s() ? e : e[0] ?? null }), ge = K(!1), ve = G(() => !!h() || B(ge)), ye = G(() => B(ve) || !!k()), be = G(() => [ee(), te()].filter(Boolean).join(" ")), xe = K(null), Se = -Infinity, Te = -Infinity;
	j(() => {
		let e = !!S() && B(L).length === 0;
		Ve(ne, {
			name: y(),
			value: s() ? B(L) : B(L)[0] ?? null,
			validity: e ? { valueMissing: !0 } : {},
			message: e ? me(B(re), "valueMissing") : "",
			anchor: B(xe)
		});
	}), ze(ne, {
		reset() {
			let e = ne.getAttribute("value"), t = e ? [e] : [];
			(t.length !== B(L).length || t.some((e, t) => e !== B(L)[t])) && Y(t);
		},
		disabled(e) {
			J(ge, e, !0);
		}
	});
	function Ee(e) {
		let t = e.target;
		t === B(xe) || t.closest("button") || (e.preventDefault(), B(xe)?.focus());
	}
	var ke = {
		get people() {
			return i();
		},
		set people(e = []) {
			i(e), r();
		},
		get source() {
			return a();
		},
		set source(e = null) {
			a(e), r();
		},
		get value() {
			return o();
		},
		set value(e = null) {
			o(e), r();
		},
		get multiple() {
			return s();
		},
		set multiple(e = !1) {
			s(e), r();
		},
		get placeholder() {
			return u();
		},
		set placeholder(e = null) {
			u(e), r();
		},
		get label() {
			return d();
		},
		set label(e = null) {
			d(e), r();
		},
		get loading() {
			return f();
		},
		set loading(e = !1) {
			f(e), r();
		},
		get locale() {
			return p();
		},
		set locale(e = null) {
			p(e), r();
		},
		get disabled() {
			return h();
		},
		set disabled(e = !1) {
			h(e), r();
		},
		get strings() {
			return _();
		},
		set strings(e = null) {
			_(e), r();
		},
		get name() {
			return y();
		},
		set name(e = null) {
			y(e), r();
		},
		get required() {
			return S();
		},
		set required(e = !1) {
			S(e), r();
		},
		get readonly() {
			return k();
		},
		set readonly(e = !1) {
			k(e), r();
		},
		get description() {
			return ee();
		},
		set description(e = null) {
			ee(e), r();
		},
		get error() {
			return te();
		},
		set error(e = null) {
			te(e), r();
		},
		get invalid() {
			return A();
		},
		set invalid(e = !1) {
			A(e), r();
		}
	}, Ae = ig(), je = R(Ae);
	_e(je, {});
	var Me = P(je, 2);
	Bc(Me, {});
	var Ne = P(Me, 2);
	return Yt(Ne, {
		value: () => ne.shadowRoot,
		children: (e, t) => {
			Vc(e, {
				get dir() {
					return M;
				},
				children: (e, t) => {
					var r = ug(), i = V(r), o = (e) => {
						var t = eg(), n = F(t, !0);
						U(() => E(n, B(be))), T(e, t);
					};
					w(i, (e) => {
						B(be) && e(o);
					});
					var c = P(i, 2), l = () => B(L), f = () => B(ue);
					{
						let e = G(() => !!s()), t = G(() => !!k()), r = G(() => !!A()), i = G(() => a() ? "none" : "autohighlight");
						b(c, () => Rc, (o, c) => {
							c(o, {
								get collection() {
									return B(q);
								},
								get multiple() {
									return B(e);
								},
								get disabled() {
									return B(ve);
								},
								get readOnly() {
									return B(t);
								},
								get invalid() {
									return B(r);
								},
								get inputBehavior() {
									return B(i);
								},
								selectionBehavior: "preserve",
								positioning: {
									strategy: "fixed",
									placement: "bottom-start"
								},
								onInteractOutside: (e) => {
									let t = e.detail.originalEvent.timeStamp;
									B(xe) && Oe() === B(xe) && Se >= t && Te >= Se && e.preventDefault();
								},
								get scrollToIndexFn() {
									return hn;
								},
								get value() {
									return l();
								},
								set value(e) {},
								get inputValue() {
									return f();
								},
								set inputValue(e) {},
								onValueChange: (e) => {
									B(z) !== null && a() && B(ae) && H.search(""), J(z, null), Y(e.value);
								},
								onInputValueChange: (e) => {
									e.reason === "input-change" && (J(z, e.inputValue, !0), Ce(ne, "search", { query: e.inputValue }), a() && H.search(e.inputValue));
								},
								onOpenChange: (e) => {
									e.open ? a() && e.reason !== "input-change" && H.now(B(z) ?? "") : (J(z, null), H.stop());
								},
								get open() {
									return B(ae);
								},
								set open(e) {
									J(ae, e, !0);
								},
								children: (e, t) => {
									var r = lg(), i = R(r);
									b(i, () => To, (e, t) => {
										t(e, {
											part: "control",
											onmousedown: Ee,
											children: (e, t) => {
												var r = ig(), i = R(r), a = (e) => {
													var t = D(), r = R(t);
													C(r, 16, () => B(L), (e) => e, (e, t) => {
														let r = G(() => se(t) ?? {
															id: t,
															name: W(t)
														});
														var i = tg(), a = V(i);
														n(a, () => B(r));
														var o = P(a, 2), s = F(o, !0), c = P(o, 2);
														v(i), U(() => {
															E(s, B(r).name), x(c, "aria-label", `${B(re).remove ?? ""}: ${B(r).name ?? ""}`), c.disabled = B(ye);
														}), oe("click", c, () => Y(B(L).filter((e) => e !== t))), T(e, i);
													}), T(e, t);
												}, o = (e) => {
													let t = G(() => se(B(L)[0]) ?? {
														id: B(L)[0],
														name: W(B(L)[0])
													});
													var r = ng(), i = V(r);
													n(i, () => B(t)), v(r), T(e, r);
												};
												w(i, (e) => {
													s() ? e(a) : B(L)[0] && e(o, 1);
												});
												var c = P(i, 2);
												{
													let e = G(() => u() ?? ""), t = G(() => d() || void 0), n = G(() => B(be) ? "af-described" : void 0), r = G(() => S() ? "true" : void 0);
													b(c, () => Do, (i, a) => {
														a(i, {
															onfocusout: (e) => Se = e.timeStamp,
															onfocusin: (e) => Te = e.timeStamp,
															part: "input",
															autocomplete: "off",
															spellcheck: "false",
															get placeholder() {
																return B(e);
															},
															get "aria-label"() {
																return B(t);
															},
															get "aria-describedby"() {
																return B(n);
															},
															get "aria-required"() {
																return B(r);
															},
															get ref() {
																return B(xe);
															},
															set ref(e) {
																J(xe, e, !0);
															}
														});
													});
												}
												var l = P(c, 2), f = (e) => {
													var t = rg();
													U(() => x(t, "aria-label", B(re).clear)), oe("click", t, () => Y([])), T(e, t);
												};
												w(l, (e) => {
													!s() && B(L)[0] && !B(ye) && e(f);
												}), T(e, r);
											},
											$$slots: { default: !0 }
										});
									});
									var o = P(i, 2);
									b(o, () => Fo, (e, t) => {
										t(e, {
											popover: "manual",
											get ref() {
												return B(pe);
											},
											set ref(e) {
												J(pe, e, !0);
											},
											children: (e, t) => {
												var r = D(), i = R(r);
												b(i, () => pa, (e, t) => {
													t(e, {
														class: "af-overlay people",
														part: "content",
														children: (e, t) => {
															xn(e, {
																tabStop: !1,
																children: (e, t) => {
																	var r = lg(), i = R(r);
																	C(i, 17, () => B(q).items, (e) => e.id, (e, t) => {
																		var r = D(), i = R(r);
																		b(i, () => No, (e, r) => {
																			r(e, {
																				get item() {
																					return B(t);
																				},
																				part: "option",
																				children: (e, r) => {
																					var i = og(), a = R(i);
																					n(a, () => B(t));
																					var o = P(a, 2), s = V(o), c = F(s, !0), l = P(s, 2), u = (e) => {
																						var n = ag(), r = F(n, !0);
																						U(() => E(r, B(t).email)), T(e, n);
																					};
																					w(l, (e) => {
																						B(t).email && e(u);
																					}), v(o), U(() => E(c, B(t).name)), T(e, i);
																				},
																				$$slots: { default: !0 }
																			});
																		}), T(e, r);
																	});
																	var o = P(i, 2), s = (e) => {
																		var t = sg(), n = F(t, !0);
																		U(() => E(n, B(re).loading)), T(e, t);
																	}, c = (e) => {
																		var t = lg(), n = R(t), r = (e) => {
																			var t = cg(), n = F(t, !0);
																			U(() => E(n, B(re).loadMore)), oe("pointerdown", t, (e) => e.preventDefault()), oe("click", t, () => H.more()), T(e, t);
																		};
																		w(n, (e) => {
																			a() && H.next && e(r);
																		});
																		var i = P(n, 2);
																		b(i, () => Co, (e, t) => {
																			t(e, {
																				part: "empty",
																				children: (e, t) => {
																					m();
																					var n = le();
																					U(() => E(n, B(re).noResults)), T(e, n);
																				},
																				$$slots: { default: !0 }
																			});
																		}), T(e, t);
																	};
																	w(o, (e) => {
																		B(fe) ? e(s) : e(c, -1);
																	}), T(e, r);
																},
																$$slots: { default: !0 }
															});
														},
														$$slots: { default: !0 }
													});
												}), T(e, r);
											},
											$$slots: { default: !0 }
										});
									}), T(e, r);
								},
								$$slots: { default: !0 }
							});
						});
					}
					v(r), T(e, r);
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { default: !0 }
	}), T(e, Ae), g(ke);
}
z(["click", "pointerdown"]), N(fg, {
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
}, Le);
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/popover/popover-anchor.svelte
var pg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function mg(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, pg), a = Ne(), o = G(() => Q(a().getAnchorProps(), i));
	return X(e, q({ as: "div" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(mg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Popover.svelte
var hg = y("<!> <!>", 1), gg = y("<div class=\"af-kit\"><!></div>"), _g = {
	hash: "svelte-1netzpl",
	code: "[data-scope='popover'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='popover'][data-part='anchor'] {display:inline-block;}[data-scope='popover'][data-part='content'] {min-width:min(18rem, calc(100vw - 32px));max-width:min(28rem, calc(100vw - 32px));padding:16px;outline:none;}\n  @media (forced-colors: active) {[data-scope='popover'][data-part='content']:focus-visible {outline:2px solid;outline-offset:2px;} }"
};
function vg(e, t) {
	I(t, !0), c(e, _g);
	let n = O(t, "open", 7, !1), i = O(t, "placement", 7, "bottom-start"), a = t.$$host, o = K(null), s = "outside";
	j(() => De(B(o), !!n(), a));
	let l = "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])", u = !1;
	j(() => {
		n() && (u = !1);
	});
	let d = () => a.shadowRoot?.querySelector("slot[name=\"anchor\"]");
	function f(e) {
		let t = d()?.assignedElements() ?? [];
		for (let n = e; n; n = n.parentNode ?? (n instanceof ShadowRoot ? n.host : null)) if (t.includes(n)) return !0;
		return !1;
	}
	function p() {
		if (u) return null;
		let e = a.ownerDocument, t = !e.activeElement || e.activeElement === e.body, n = a.getRootNode().activeElement;
		if (!t && !(n && a.contains(n))) return null;
		for (let e of d()?.assignedElements() ?? []) {
			if (e.matches(l)) return e;
			let t = e.querySelector(l);
			if (t) return t;
		}
		return null;
	}
	var m = {
		get open() {
			return n();
		},
		set open(e = !1) {
			n(e), r();
		},
		get placement() {
			return i();
		},
		set placement(e = "bottom-start") {
			i(e), r();
		}
	}, h = hg(), _ = R(h);
	_e(_, {});
	var y = P(_, 2);
	return Yt(y, {
		value: () => a.shadowRoot,
		children: (e, r) => {
			var c = gg(), l = V(c);
			{
				let e = G(() => !!n()), r = G(() => ({
					strategy: "fixed",
					placement: i() || "bottom-start"
				}));
				b(l, () => Pe, (n, i) => {
					i(n, {
						get open() {
							return B(e);
						},
						closeOnEscape: !0,
						portalled: !1,
						get positioning() {
							return B(r);
						},
						finalFocusEl: p,
						onEscapeKeyDown: (e) => {
							Tf(a, e) ? e.preventDefault() : rr(e) && e.defaultPrevented ? Ce(a, "close", { reason: "escape" }) : s = "escape";
						},
						onInteractOutside: (e) => {
							let t = e.detail.target ?? null;
							if (f(t instanceof Node ? t : null)) {
								e.preventDefault();
								return;
							}
							s = "outside", u = !0;
						},
						onOpenChange: (e) => {
							e.open || (Ce(a, "close", { reason: s }), s = "outside");
						},
						children: (e, n) => {
							var r = hg(), i = R(r);
							b(i, () => mg, (e, n) => {
								n(e, {
									part: "anchor",
									children: (e, n) => {
										var r = D(), i = R(r);
										fe(i, t, "anchor", {}, null), T(e, r);
									},
									$$slots: { default: !0 }
								});
							});
							var a = P(i, 2);
							b(a, () => je, (e, n) => {
								n(e, {
									popover: "manual",
									get ref() {
										return B(o);
									},
									set ref(e) {
										J(o, e, !0);
									},
									children: (e, n) => {
										var r = D(), i = R(r);
										b(i, () => ke, (e, n) => {
											n(e, {
												class: "af-overlay popover",
												part: "content",
												children: (e, n) => {
													var r = D(), i = R(r);
													fe(i, t, "content", {}, null), T(e, r);
												},
												$$slots: { default: !0 }
											});
										}), T(e, r);
									},
									$$slots: { default: !0 }
								});
							}), T(e, r);
						},
						$$slots: { default: !0 }
					});
				});
			}
			v(c), T(e, c);
		},
		$$slots: { default: !0 }
	}), T(e, h), g(m);
}
N(vg, {
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
//#region src/kit/ScrollArea.svelte
var yg = y("<!> <div class=\"af-kit svelte-cu6e0i\"><!></div>", 1), bg = {
	hash: "svelte-cu6e0i",
	code: ":host {display:block;min-height:0;}.af-kit.svelte-cu6e0i {display:flex;flex-direction:column;box-sizing:border-box;height:100%;max-height:inherit;color:inherit;font:inherit;}"
};
function xg(e, t) {
	I(t, !0), c(e, bg);
	let n = O(t, "axis", 7, "vertical"), i = O(t, "label", 7, null), a = G(() => n() === "horizontal" || n() === "both" ? n() : "vertical");
	var o = {
		get axis() {
			return n();
		},
		set axis(e = "vertical") {
			n(e), r();
		},
		get label() {
			return i();
		},
		set label(e = null) {
			i(e), r();
		}
	}, s = yg(), l = R(s);
	_e(l, {});
	var u = P(l, 2), d = V(u);
	{
		let e = G(() => i() || null);
		xn(d, {
			get axis() {
				return B(a);
			},
			get label() {
				return B(e);
			},
			contentPart: !0,
			children: (e, n) => {
				var r = D(), i = R(r);
				fe(i, t, "default", {}, null), T(e, r);
			},
			$$slots: { default: !0 }
		});
	}
	return v(u), T(e, s), g(o);
}
N(xg, {
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
var [Sg, Cg] = Zt({ name: "SelectContext" }), wg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Tg(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, wg), a = Cg(), s = qn(), c = G(() => Q(a().getContentProps(), s().getPresenceProps(), i));
	function l(e) {
		s().setNode(e);
	}
	var u = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	}, d = D(), f = R(d), p = (e) => {
		X(e, q({ as: "div" }, () => B(c), {
			[o()]: l,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, m = G(() => !s().unmounted);
	return w(f, (e) => {
		B(m) && e(p);
	}), T(e, d), g(u);
}
N(Tg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/select/select-indicator.svelte
var Eg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Dg(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, Eg), a = Cg(), o = G(() => Q(a().getIndicatorProps(), i));
	return X(e, q({ as: "div" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(Dg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/select/use-select-item-context.js
var [Og, kg] = Zt({ name: "SelectItemContext" }), [Ag, jg] = Zt({ name: "SelectItemPropsContext" }), Mg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Ng(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, Mg), a = Cg(), o = G(() => Wt()(i, ["item", "persistFocus"])), s = G(() => f(B(o), 2)), c = G(() => B(s)[0]), l = G(() => B(s)[1]), u = G(() => Q(a().getItemProps(B(c)), B(l)));
	return Og(() => a().getItemState(B(c))), Ag(() => B(c)), X(e, q({ as: "div" }, () => B(u), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(Ng, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/select/select-item-indicator.svelte
var Pg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Fg(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, Pg), a = Cg(), o = jg(), s = G(() => Q(a().getItemIndicatorProps(o()), i));
	return X(e, q({ as: "div" }, () => B(s), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(Fg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/select/select-item-text.svelte
var Ig = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Lg(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, Ig), a = Cg(), o = jg(), s = G(() => Q(a().getItemTextProps(o()), i));
	return X(e, q({ as: "span" }, () => B(s), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(Lg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/select/select-positioner.svelte
var Rg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function zg(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, Rg), a = Cg(), o = qn(), s = G(() => Q(a().getPositionerProps(), i));
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	}, l = D(), u = R(l), d = (e) => {
		X(e, q({ as: "div" }, () => B(s), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = G(() => !o().unmounted);
	return w(u, (e) => {
		B(f) && e(d);
	}), T(e, l), g(c);
}
N(zg, { ref: {} }, [], [], { mode: "open" });
var Bg = xt("select").parts("label", "positioner", "trigger", "indicator", "clearTrigger", "item", "itemText", "itemIndicator", "itemGroup", "itemGroupLabel", "list", "content", "root", "control", "valueText").build(), Vg = (e) => new Yr(e);
Vg.empty = () => new Yr({ items: [] });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+select@1.43.3/node_modules/@zag-js/select/dist/select.dom.mjs
var Hg = (e) => e.ids?.root ?? `select:${e.id}`, Ug = (e) => e.ids?.content ?? `select:${e.id}:content`, Wg = (e) => e.ids?.trigger ?? `select:${e.id}:trigger`, Gg = (e) => e.ids?.clearTrigger ?? `select:${e.id}:clear-trigger`, Kg = (e) => e.ids?.label ?? `select:${e.id}:label`, qg = (e) => e.ids?.control ?? `select:${e.id}:control`, Jg = (e, t) => e.ids?.item?.(t) ?? `select:${e.id}:option:${t}`, Yg = (e) => e.ids?.hiddenSelect ?? `select:${e.id}:select`, Xg = (e) => e.ids?.positioner ?? `select:${e.id}:positioner`, Zg = (e, t) => e.ids?.itemGroup?.(t) ?? `select:${e.id}:optgroup:${t}`, Qg = (e, t) => e.ids?.itemGroupLabel?.(t) ?? `select:${e.id}:optgroup-label:${t}`, $g = (e) => e.getById(Yg(e)), e_ = (e) => e.getById(Ug(e)), t_ = (e) => e.getById(Wg(e)), n_ = (e) => e.getById(Gg(e)), r_ = (e) => e.getById(Xg(e)), i_ = (e, t) => t == null ? null : e.getById(Jg(e, t)), a_ = { clearTriggerLabel: "Clear value" };
function o_(e, t) {
	let { context: n, prop: r, scope: i, state: a, computed: o, send: s } = e, c = kt(a_, r("translations")), l = r("disabled") || n.get("fieldsetDisabled"), u = !!r("invalid"), d = !!r("required"), f = !!r("readOnly"), p = r("composite"), m = r("collection"), h = a.hasTag("open"), g = a.matches("focused"), _ = n.get("highlightedValue"), v = n.get("highlightedItem"), y = o("selectedItems"), b = n.get("currentPlacement"), x = b ? Me(b) : void 0, S = o("isTypingAhead"), C = o("isInteractive"), w = _ ? Jg(i, _) : void 0;
	function T(e) {
		let t = m.getItemDisabled(e.item), r = m.getItemValue(e.item);
		return Tt(r, () => `[zag-js] No value found for item ${JSON.stringify(e.item)}`), {
			value: r,
			disabled: !!(l || t),
			highlighted: _ === r,
			selected: n.get("value").includes(r)
		};
	}
	let E = Fe({
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
			t_(i)?.focus({ preventScroll: !0 });
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
		getItemState: T,
		getRootProps() {
			return t.element({
				...Bg.root.attrs,
				dir: r("dir"),
				id: Hg(i),
				"data-invalid": Z(u),
				"data-readonly": Z(f)
			});
		},
		getLabelProps() {
			return t.label({
				dir: r("dir"),
				id: Kg(i),
				...Bg.label.attrs,
				"data-disabled": Z(l),
				"data-invalid": Z(u),
				"data-readonly": Z(f),
				"data-required": Z(d),
				htmlFor: Yg(i),
				onClick(e) {
					e.defaultPrevented || l || t_(i)?.focus({ preventScroll: !0 });
				}
			});
		},
		getControlProps() {
			return t.element({
				...Bg.control.attrs,
				dir: r("dir"),
				id: qg(i),
				"data-state": h ? "open" : "closed",
				"data-focus": Z(g),
				"data-disabled": Z(l),
				"data-invalid": Z(u)
			});
		},
		getValueTextProps() {
			return t.element({
				...Bg.valueText.attrs,
				dir: r("dir"),
				"data-disabled": Z(l),
				"data-invalid": Z(u),
				"data-focus": Z(g)
			});
		},
		getTriggerProps() {
			return t.button({
				id: Wg(i),
				disabled: l,
				dir: r("dir"),
				type: "button",
				role: "combobox",
				"aria-controls": Ug(i),
				"aria-expanded": h,
				"aria-haspopup": "listbox",
				"data-state": h ? "open" : "closed",
				"aria-invalid": u,
				"aria-required": d,
				"aria-labelledby": Kg(i),
				...Bg.trigger.attrs,
				"data-disabled": Z(l),
				"data-invalid": Z(u),
				"data-readonly": Z(f),
				"data-placement": b,
				"data-side": x,
				"data-placeholder-shown": Z(!o("hasSelectedItems")),
				onClick(e) {
					C && (e.defaultPrevented || s({ type: "TRIGGER.CLICK" }));
				},
				onFocus() {
					s({ type: "TRIGGER.FOCUS" });
				},
				onBlur() {
					s({ type: "TRIGGER.BLUR" });
				},
				onKeyDown(e) {
					if (e.defaultPrevented || !C) return;
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
							s(S ? {
								type: "TRIGGER.TYPEAHEAD",
								key: e.key
							} : { type: "TRIGGER.ENTER" });
						}
					}[bt(e, {
						dir: r("dir"),
						orientation: "vertical"
					})];
					if (t) {
						t(e), e.preventDefault();
						return;
					}
					ca.isValidEvent(e) && (s({
						type: "TRIGGER.TYPEAHEAD",
						key: e.key
					}), e.preventDefault());
				}
			});
		},
		getIndicatorProps() {
			return t.element({
				...Bg.indicator.attrs,
				dir: r("dir"),
				"aria-hidden": !0,
				"data-state": h ? "open" : "closed",
				"data-disabled": Z(l),
				"data-invalid": Z(u),
				"data-readonly": Z(f)
			});
		},
		getItemProps(e) {
			let n = T(e);
			return t.element({
				id: Jg(i, n.value),
				role: "option",
				...Bg.item.attrs,
				dir: r("dir"),
				"data-value": n.value,
				"aria-selected": n.selected,
				"data-state": n.selected ? "checked" : "unchecked",
				"data-highlighted": Z(n.highlighted),
				"data-disabled": Z(n.disabled),
				"aria-disabled": ut(n.disabled),
				onPointerMove(e) {
					n.disabled || e.pointerType !== "mouse" || La() === "pointer" && n.value !== _ && s({
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
					n.disabled || e.persistFocus || t.pointerType === "mouse" && La() === "pointer" && s({ type: "ITEM.POINTER_LEAVE" });
				}
			});
		},
		getItemTextProps(e) {
			let n = T(e);
			return t.element({
				...Bg.itemText.attrs,
				"data-state": n.selected ? "checked" : "unchecked",
				"data-disabled": Z(n.disabled),
				"data-highlighted": Z(n.highlighted)
			});
		},
		getItemIndicatorProps(e) {
			let n = T(e);
			return t.element({
				"aria-hidden": !0,
				...Bg.itemIndicator.attrs,
				"data-state": n.selected ? "checked" : "unchecked",
				hidden: !n.selected
			});
		},
		getItemGroupLabelProps(e) {
			let { htmlFor: n } = e;
			return t.element({
				...Bg.itemGroupLabel.attrs,
				id: Qg(i, n),
				dir: r("dir"),
				role: "presentation"
			});
		},
		getItemGroupProps(e) {
			let { id: n } = e;
			return t.element({
				...Bg.itemGroup.attrs,
				"data-disabled": Z(l),
				id: Zg(i, n),
				"aria-labelledby": Qg(i, n),
				role: "group",
				dir: r("dir")
			});
		},
		getClearTriggerProps() {
			return t.button({
				...Bg.clearTrigger.attrs,
				id: Gg(i),
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
				Wi(on(e)) || s({
					type: "VALUE.SET",
					value: s_(e.currentTarget)
				});
			};
			return t.select({
				name: r("name"),
				form: r("form"),
				disabled: l,
				multiple: r("multiple"),
				required: r("required"),
				"aria-hidden": !0,
				id: Yg(i),
				defaultValue: a,
				style: Re,
				tabIndex: -1,
				autoComplete: r("autoComplete"),
				onChange: o,
				onInput: o,
				onFocus() {
					t_(i)?.focus({ preventScroll: !0 });
				},
				"aria-labelledby": Kg(i)
			});
		},
		getPositionerProps() {
			return t.element({
				...Bg.positioner.attrs,
				dir: r("dir"),
				id: Xg(i),
				style: E.floating
			});
		},
		getContentProps() {
			return t.element({
				hidden: !h,
				dir: r("dir"),
				id: Ug(i),
				role: p ? "listbox" : "dialog",
				...Bg.content.attrs,
				"data-state": h ? "open" : "closed",
				"data-placement": b,
				"data-side": x,
				"data-activedescendant": w,
				"aria-activedescendant": p ? w : void 0,
				"aria-multiselectable": r("multiple") && p ? !0 : void 0,
				"aria-labelledby": Kg(i),
				tabIndex: 0,
				onKeyDown(e) {
					if (!C || !et(e.currentTarget, Ct(e))) return;
					if (e.key === "Tab" && !Bn(e)) {
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
							S ? s({
								type: "CONTENT.TYPEAHEAD",
								key: e.key
							}) : t.Enter?.(e);
						}
					}, n = t[bt(e)];
					if (n) {
						n(e), e.preventDefault();
						return;
					}
					let r = Ct(e);
					$e(r) || ca.isValidEvent(e) && (s({
						type: "CONTENT.TYPEAHEAD",
						key: e.key
					}), e.preventDefault());
				}
			});
		},
		getListProps() {
			return t.element({
				...Bg.list.attrs,
				tabIndex: 0,
				role: p ? void 0 : "listbox",
				"aria-labelledby": Wg(i),
				"aria-activedescendant": p ? void 0 : w,
				"aria-multiselectable": !p && r("multiple") ? !0 : void 0
			});
		}
	};
}
var s_ = (e) => e.multiple ? Array.from(e.selectedOptions, (e) => e.value) : e.value ? [e.value] : [], { and: c_, not: l_, or: u_ } = Pt(), d_ = St({
	props({ props: e }) {
		return {
			loopFocus: !1,
			closeOnSelect: !e.multiple,
			composite: !0,
			defaultValue: [],
			...e,
			collection: e.collection ?? Vg.empty(),
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
				isEqual: Ze,
				onChange(t) {
					let r = n(), i = e("collection"), a = ti({
						values: t,
						collection: i,
						selectedItemMap: r.get("selectedItemMap")
					}), o = e("value") ?? t, s = o === t ? a : ti({
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
			selectedItemMap: t(() => ({ defaultValue: ni({
				selectedItems: i,
				collection: e("collection")
			}) }))
		};
	},
	refs() {
		return { typeahead: { ...ca.defaultOptions } };
	},
	computed: {
		hasSelectedItems: ({ context: e }) => e.get("value").length > 0,
		isTypingAhead: ({ refs: e }) => e.get("typeahead").keysSoFar !== "",
		isDisabled: ({ prop: e, context: t }) => !!e("disabled") || !!t.get("fieldsetDisabled"),
		isInteractive: ({ prop: e }) => !(e("disabled") || e("readOnly")),
		selectedItems: ({ context: e, prop: t }) => $r({
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
						guard: u_("isTriggerArrowDownEvent", "isTriggerEnterEvent"),
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
					guard: c_(l_("multiple"), "hasSelectedItems"),
					actions: ["selectPreviousItem"]
				}, {
					guard: l_("multiple"),
					actions: ["selectLastItem"]
				}],
				"TRIGGER.ARROW_RIGHT": [{
					guard: c_(l_("multiple"), "hasSelectedItems"),
					actions: ["selectNextItem"]
				}, {
					guard: l_("multiple"),
					actions: ["selectFirstItem"]
				}],
				"TRIGGER.HOME": {
					guard: l_("multiple"),
					actions: ["selectFirstItem"]
				},
				"TRIGGER.END": {
					guard: l_("multiple"),
					actions: ["selectLastItem"]
				},
				"TRIGGER.TYPEAHEAD": {
					guard: l_("multiple"),
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
						guard: c_("closeOnSelect", "isOpenControlled"),
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
						guard: c_("hasHighlightedItem", "loop", "isLastItemHighlighted"),
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
						guard: c_("hasHighlightedItem", "loop", "isFirstItemHighlighted"),
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
			restoreFocus: ({ event: e }) => f_(e),
			isOpenControlled: ({ prop: e }) => e("open") !== void 0,
			isTriggerClickEvent: ({ event: e }) => e.previousEvent?.type === "TRIGGER.CLICK",
			isTriggerEnterEvent: ({ event: e }) => e.previousEvent?.type === "TRIGGER.ENTER",
			isTriggerArrowUpEvent: ({ event: e }) => e.previousEvent?.type === "TRIGGER.ARROW_UP",
			isTriggerArrowDownEvent: ({ event: e }) => e.previousEvent?.type === "TRIGGER.ARROW_DOWN"
		},
		effects: {
			trackFocusVisible({ scope: e }) {
				return Ba({ root: e.getRootNode?.() });
			},
			trackFormControlState({ context: e, scope: t }) {
				return Hi($g(t), {
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
				let r = () => e_(e), i = !0;
				return In(r, {
					type: "listbox",
					defer: !0,
					exclude: [t_(e), n_(e)],
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
				return e.set("currentPlacement", r.placement), Ae(() => t_(n), () => r_(n), {
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
					if (i == null || La() === "pointer") return;
					let a = e_(n), o = t("scrollToIndexFn");
					if (o) {
						let e = t("collection").indexOf(i);
						o?.({
							index: e,
							immediate: r,
							getElement: () => i_(n, i)
						});
						return;
					}
					na(i_(n, i), {
						rootEl: a,
						block: "nearest"
					});
				};
				return Mt(() => {
					Ra("virtual"), r(!0);
				}), qi(() => e_(n), {
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
				Ae(t_(n), () => r_(n), {
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
				Mt(() => {
					Vn({ root: e_(e) })?.focus({ preventScroll: !0 });
				});
			},
			focusTriggerEl({ event: e, scope: t }) {
				f_(e) && Mt(() => {
					t_(t)?.focus({ preventScroll: !0 });
				});
			},
			selectHighlightedItem({ context: e, prop: t, event: n }) {
				let r = n.value ?? e.get("highlightedValue");
				r != null && t("collection").has(r) && (t("onSelect")?.({ value: r }), r = t("deselectable") && !t("multiple") && e.get("value").includes(r) ? null : r, e.set("value", (e) => r == null ? [] : t("multiple") ? st(e, r) : [r]));
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
				e.set("value", (e) => r == null ? [] : t("multiple") ? st(e, r) : [r]);
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
						getElement: () => i_(t, n)
					});
				} else e_(t)?.scrollTo(0, 0);
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
				let r = $g(n);
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
				let i = ti({
					values: e.get("value"),
					collection: n,
					selectedItemMap: e.get("selectedItemMap")
				});
				e.set("selectedItemMap", i.nextSelectedItemMap);
			},
			syncSelectedItems({ context: e, prop: t }) {
				let n = ti({
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
					let t = $g(e);
					if (!t) return;
					let n = new (e.getWin()).Event("change", {
						bubbles: !0,
						composed: !0
					});
					t.dispatchEvent(Gi(n));
				});
			}
		}
	}
});
function f_(e) {
	let t = e.restoreFocus ?? e.previousEvent?.restoreFocus;
	return t == null || !!t;
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/select/use-select.svelte.js
var p_ = (e) => {
	let t = Ut(), n = Nt(), r = Be(), i = G(() => {
		let i = rn(e);
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
	}), a = zt(d_, () => B(i)), o = G(() => o_(a, Et));
	return () => B(o);
}, m_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function h_(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, m_), a = G(() => Ln(i)), o = G(() => f(B(a), 2)), s = G(() => B(o)[0]), c = G(() => B(o)[1]), l = Un(() => ({
		present: t.value().open,
		...B(s)
	})), u = G(() => Q(t.value().getRootProps(), B(c)));
	return Sg(() => t.value()), Gn(l), X(e, q({ as: "div" }, () => B(u), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(h_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/select/select-trigger.svelte
var g_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function __(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, g_), a = Cg(), o = G(() => Q(a().getTriggerProps(), i));
	return X(e, q({ as: "button" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(__, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Select.svelte
var v_ = (e, t = l, n = l) => {
	var r = D(), i = R(r);
	b(i, () => Ng, (e, r) => {
		r(e, q({
			get item() {
				return t();
			},
			part: "option"
		}, n, {
			children: (e, n) => {
				var r = b_(), i = R(r);
				b(i, () => Lg, (e, n) => {
					n(e, {
						children: (e, n) => {
							m();
							var r = le();
							U(() => E(r, t().label)), T(e, r);
						},
						$$slots: { default: !0 }
					});
				});
				var a = P(i, 2), o = V(a);
				b(o, () => Fg, (e, t) => {
					t(e, {
						children: (e, t) => {
							var n = y_();
							T(e, n);
						},
						$$slots: { default: !0 }
					});
				}), v(a), T(e, r);
			},
			$$slots: { default: !0 }
		}));
	}), T(e, r);
}, y_ = e("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-1sa71xq\"><path d=\"M20 6 9 17l-5-5\"></path></svg>"), b_ = y("<!> <span class=\"check svelte-1sa71xq\"><!></span>", 1), x_ = y("<span id=\"af-described\" hidden=\"\"> </span>"), S_ = e("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-1sa71xq\"><path d=\"m6 9 6 6 6-6\"></path></svg>"), C_ = y("<span part=\"value\" class=\"svelte-1sa71xq\"> </span> <!>", 1), w_ = y("<af-tooltip><!></af-tooltip>", 2), T_ = y("<div part=\"empty\" class=\"svelte-1sa71xq\"> </div>"), E_ = y("<!> <!>", 1), D_ = y("<div class=\"af-kit\"><!> <!></div>"), O_ = {
	hash: "svelte-1sa71xq",
	code: ":host {display:inline-block;max-width:100%;vertical-align:middle;}af-tooltip.svelte-1sa71xq {display:block;}[part='value'].svelte-1sa71xq {flex:1 1 auto;min-width:0;overflow:hidden;text-align:start;text-overflow:ellipsis;white-space:nowrap;}.check.svelte-1sa71xq {position:absolute;right:8px;display:flex;align-items:center;justify-content:center;width:14px;height:14px;}svg.svelte-1sa71xq {flex:none;width:16px;height:16px;pointer-events:none;}[data-scope='select'][hidden] {display:none !important;}[data-scope='select'][data-part='trigger'] {display:flex;align-items:center;justify-content:space-between;gap:8px;box-sizing:border-box;width:100%;height:36px;margin:0;padding:8px 12px;border:1px solid var(--k-input);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark, 0) * 100%), transparent);box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);color:inherit;font:inherit;font-size:14px;line-height:20px;white-space:nowrap;outline:none;cursor:default;transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);}[data-scope='select'][data-part='trigger'][data-size='sm'] {height:32px;}\n  @media (hover: hover) {[data-scope='select'][data-part='trigger']:hover:not(:disabled) {background-color:color-mix(in oklab, color-mix(in oklab, var(--k-input) 50%, transparent) calc(var(--k-dark, 0) * 100%), transparent);}\n  }[data-scope='select'][data-part='trigger'][data-placeholder] {color:var(--k-muted);}[data-scope='select'][data-part='trigger']:focus-visible {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring), 0 1px 2px 0 rgb(0 0 0 / 0.05);}[data-scope='select'][data-part='trigger'][aria-invalid='true'] {border-color:var(--k-danger);}[data-scope='select'][data-part='trigger'][aria-invalid='true']:focus-visible {box-shadow:0 0 0 3px color-mix(in oklab, var(--k-danger) calc(20% + var(--k-dark, 0) * 20%), transparent), 0 1px 2px 0 rgb(0 0 0 / 0.05);}[data-scope='select'][data-part='trigger']:disabled {opacity:0.5;cursor:not-allowed;}[data-scope='select'][data-part='indicator'] {display:flex;color:var(--k-muted);opacity:0.5;}[data-scope='select'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='select'][data-part='content'] {box-sizing:border-box;display:flex;flex-direction:column;width:max-content;min-width:max(128px, 100%);max-width:var(--available-width, 100vw);max-height:var(--available-height, 300px);padding:4px;outline:none;}[data-scope='select'][data-part='item'] {position:relative;box-sizing:border-box;display:flex;align-items:center;gap:8px;width:100%;padding:6px 32px 6px 8px;border:0 solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 4px));outline:none;font-size:14px;line-height:20px;cursor:default;-webkit-user-select:none;user-select:none;}[data-scope='select'][data-part='item'][data-highlighted] {background-color:var(--k-accent);color:var(--k-accent-fg);}[data-scope='select'][data-part='item'][data-disabled] {opacity:0.5;}[data-scope='select'][data-part='item'] .check {color:var(--k-muted);}[part='empty'].svelte-1sa71xq {padding:24px 0;font-size:14px;line-height:20px;text-align:center;}\n  @media (prefers-reduced-motion: reduce) {[data-scope='select'][data-part='trigger'] {transition:none;} }\n  @media (forced-colors: active) {[data-scope='select'][data-part='trigger']:focus-visible {outline:2px solid;outline-offset:2px;}[data-scope='select'][data-part='item'][data-highlighted] {forced-color-adjust:none;background-color:Highlight;color:HighlightText;}\n  }"
};
function k_(e, t) {
	let n = M();
	I(t, !0), c(e, O_);
	let a = O(t, "options", 23, () => []), o = O(t, "value", 7, null), s = O(t, "multiple", 7, !1), l = O(t, "placeholder", 7, null), u = O(t, "label", 7, null), d = O(t, "disabled", 7, !1), f = O(t, "locale", 7, null), m = O(t, "strings", 7, null), h = O(t, "name", 7, null), _ = O(t, "required", 7, !1), y = O(t, "readonly", 7, !1), x = O(t, "description", 7, null), S = O(t, "error", 7, null), k = O(t, "invalid", 7, !1), te = O(t, "size", 7, null), A = t.$$host, ne = we(A), re = G(() => he(f(), m() ?? void 0)), N = G(() => {
		let e = /* @__PURE__ */ new Set();
		return (a() ?? []).filter((t) => !e.has(t.value) && !!e.add(t.value));
	}), ie = G(() => new Map(B(N).map((e) => [e.value, e]))), L = G(() => [...new Set(Array.isArray(o()) ? o() : o() ? [o()] : [])]), z = G(() => B(L).filter((e) => B(ie).has(e)).map((e) => B(ie).get(e).label).join(", ")), ae = G(() => ji({
		items: B(N),
		itemToValue: (e) => e.value,
		itemToString: (e) => e.label,
		isItemDisabled: (e) => !!e.disabled
	})), H = K(!1), oe = G(() => !!d() || B(H)), se = G(() => [x(), S()].filter(Boolean).join(" ")), ce = (e) => Ce(A, "change", { value: s() ? e : e[0] ?? null }), le = p_(() => ({
		id: n,
		dir: ne,
		getRootNode: () => A.shadowRoot,
		collection: B(ae),
		multiple: !!s(),
		value: B(L),
		disabled: B(oe),
		readOnly: !!y(),
		invalid: !!k(),
		required: !!_(),
		positioning: {
			strategy: "fixed",
			placement: "bottom-start",
			sameWidth: !0
		},
		scrollToIndexFn: hn,
		onValueChange: (e) => ce(e.value)
	})), W = K(null), ue = K(null), de = K(null);
	j(() => De(B(W), le().open, A)), j(() => ee(A, "keydown", (e) => {
		e.key === "Escape" && rr(e) && e.defaultPrevented && le().open && le().setOpen(!1);
	}));
	function q(e) {
		B(oe) || y() || e.isComposing || e.ctrlKey || e.metaKey || e.altKey || e.key.length === 1 && e.key !== " " && (e.preventDefault(), le().open || le().setOpen(!0), B(ue)?.dispatchEvent(new KeyboardEvent("keydown", {
			key: e.key,
			bubbles: !0,
			composed: !1
		})));
	}
	j(() => {
		let e = !!_() && B(L).length === 0;
		Ve(A, {
			name: h(),
			value: s() ? B(L) : B(L)[0] ?? null,
			validity: e ? { valueMissing: !0 } : {},
			message: e ? me(B(re), "valueMissing") : "",
			anchor: B(de)
		});
	}), ze(A, {
		reset() {
			let e = A.getAttribute("value"), t = e ? [e] : [];
			(t.length !== B(L).length || t.some((e, t) => e !== B(L)[t])) && ce(t);
		},
		disabled(e) {
			J(H, e, !0);
		}
	});
	let fe = (e) => e ? { "aria-description": e } : {};
	var pe = {
		get options() {
			return a();
		},
		set options(e = []) {
			a(e), r();
		},
		get value() {
			return o();
		},
		set value(e = null) {
			o(e), r();
		},
		get multiple() {
			return s();
		},
		set multiple(e = !1) {
			s(e), r();
		},
		get placeholder() {
			return l();
		},
		set placeholder(e = null) {
			l(e), r();
		},
		get label() {
			return u();
		},
		set label(e = null) {
			u(e), r();
		},
		get disabled() {
			return d();
		},
		set disabled(e = !1) {
			d(e), r();
		},
		get locale() {
			return f();
		},
		set locale(e = null) {
			f(e), r();
		},
		get strings() {
			return m();
		},
		set strings(e = null) {
			m(e), r();
		},
		get name() {
			return h();
		},
		set name(e = null) {
			h(e), r();
		},
		get required() {
			return _();
		},
		set required(e = !1) {
			_(e), r();
		},
		get readonly() {
			return y();
		},
		set readonly(e = !1) {
			y(e), r();
		},
		get description() {
			return x();
		},
		set description(e = null) {
			x(e), r();
		},
		get error() {
			return S();
		},
		set error(e = null) {
			S(e), r();
		},
		get invalid() {
			return k();
		},
		set invalid(e = !1) {
			k(e), r();
		},
		get size() {
			return te();
		},
		set size(e = null) {
			te(e), r();
		}
	}, Y = E_(), ge = R(Y);
	_e(ge, {});
	var ve = P(ge, 2);
	return Yt(ve, {
		value: () => A.shadowRoot,
		children: (e, t) => {
			Vc(e, {
				get dir() {
					return ne;
				},
				children: (e, t) => {
					var n = D_(), r = V(n), a = (e) => {
						var t = x_(), n = F(t, !0);
						U(() => E(n, B(se))), T(e, t);
					};
					w(r, (e) => {
						B(se) && e(a);
					});
					var o = P(r, 2);
					b(o, () => h_, (e, t) => {
						t(e, {
							get value() {
								return le;
							},
							children: (e, t) => {
								var n = E_(), r = R(n);
								{
									let e = G(() => u() || void 0), t = G(() => B(se) ? "af-described" : void 0), n = G(() => y() ? "true" : void 0), i = G(() => B(z) ? void 0 : ""), a = G(() => te() === "sm" ? "sm" : void 0);
									b(r, () => __, (r, o) => {
										o(r, {
											part: "trigger",
											get "aria-label"() {
												return B(e);
											},
											"aria-labelledby": null,
											get "aria-describedby"() {
												return B(t);
											},
											get "aria-readonly"() {
												return B(n);
											},
											get "data-placeholder"() {
												return B(i);
											},
											get "data-size"() {
												return B(a);
											},
											onkeydowncapture: q,
											get ref() {
												return B(de);
											},
											set ref(e) {
												J(de, e, !0);
											},
											children: (e, t) => {
												var n = C_(), r = R(n), i = F(r, !0), a = P(r, 2);
												b(a, () => Dg, (e, t) => {
													t(e, {
														part: "indicator",
														children: (e, t) => {
															var n = S_();
															T(e, n);
														},
														$$slots: { default: !0 }
													});
												}), U(() => E(i, B(z) || l() || "")), T(e, n);
											},
											$$slots: { default: !0 }
										});
									});
								}
								var a = P(r, 2);
								b(a, () => zg, (e, t) => {
									t(e, {
										popover: "manual",
										get ref() {
											return B(W);
										},
										set ref(e) {
											J(W, e, !0);
										},
										children: (e, t) => {
											var n = D(), r = R(n);
											{
												let e = G(() => u() || void 0);
												b(r, () => Tg, (t, n) => {
													n(t, {
														class: "af-overlay",
														part: "content",
														get "aria-label"() {
															return B(e);
														},
														"aria-labelledby": null,
														get ref() {
															return B(ue);
														},
														set ref(e) {
															J(ue, e, !0);
														},
														children: (e, t) => {
															xn(e, {
																tabStop: !1,
																children: (e, t) => {
																	var n = E_(), r = R(n);
																	C(r, 17, () => B(ae).items, (e) => e.value, (e, t) => {
																		var n = D(), r = R(n), a = (e) => {
																			var n = w_();
																			U(() => i(n, "text", B(t).reason ?? "")), p(n, 1, "svelte-1sa71xq");
																			var r = V(n);
																			{
																				let e = G(() => fe(B(t).reason));
																				v_(r, () => B(t), () => B(e));
																			}
																			v(n), T(e, n);
																		}, o = (e) => {
																			v_(e, () => B(t), () => ({}));
																		};
																		w(r, (e) => {
																			B(t).disabled ? e(a) : e(o, -1);
																		}), T(e, n);
																	});
																	var a = P(r, 2), o = (e) => {
																		var t = T_(), n = F(t, !0);
																		U(() => E(n, B(re).noOptions)), T(e, t);
																	};
																	w(a, (e) => {
																		B(ae).items.length === 0 && e(o);
																	}), T(e, n);
																},
																$$slots: { default: !0 }
															});
														},
														$$slots: { default: !0 }
													});
												});
											}
											T(e, n);
										},
										$$slots: { default: !0 }
									});
								}), T(e, n);
							},
							$$slots: { default: !0 }
						});
					}), v(n), T(e, n);
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { default: !0 }
	}), T(e, Y), g(pe);
}
N(k_, {
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
}, Le);
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/signature-pad/use-signature-pad-context.js
var [A_, j_] = Zt({
	name: "SignaturePadContext",
	hookName: "useSignaturePadContext",
	providerName: "<SignaturePadProvider />"
}), M_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function N_(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, M_), a = j_(), o = G(() => Q(a().getClearTriggerProps(), i));
	return X(e, q({ as: "button" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(N_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/signature-pad/signature-pad-control.svelte
var P_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function F_(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, P_), a = j_(), o = G(() => Q(a().getControlProps(), i));
	return X(e, q({ as: "div" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(F_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/signature-pad/signature-pad-guide.svelte
var I_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function L_(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, I_), a = j_(), o = G(() => Q(a().getGuideProps(), i));
	return X(e, q({ as: "div" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(L_, { ref: {} }, [], [], { mode: "open" });
var R_ = xt("signature-pad").parts("root", "control", "segment", "segmentPath", "guide", "clearTrigger", "label").build(), z_ = (e) => e.ids?.root ?? `signature-${e.id}`, B_ = (e) => e.ids?.control ?? `signature-control-${e.id}`, V_ = (e) => e.ids?.label ?? `signature-label-${e.id}`, H_ = (e) => e.ids?.hiddenInput ?? `signature-input-${e.id}`, U_ = (e) => e.getById(B_(e)), W_ = (e) => kn(U_(e), "[data-part=segment]"), G_ = (e, t) => Fi(W_(e), t), K_ = {
	control: "signature pad",
	clearTrigger: "clear signature"
};
function q_(e, t) {
	let { state: n, send: r, prop: i, computed: a, context: o, scope: s } = e, c = n.matches("drawing"), l = a("isEmpty"), u = a("isInteractive"), d = !!i("disabled"), f = !!i("required"), p = kt(K_, i("translations"));
	return {
		empty: l,
		drawing: c,
		currentPath: o.get("currentPath"),
		paths: o.get("paths"),
		clear() {
			r({ type: "CLEAR" });
		},
		getDataUrl(e, t) {
			return a("isEmpty") ? Promise.resolve("") : G_(s, {
				type: e,
				quality: t
			});
		},
		getLabelProps() {
			return t.label({
				...R_.label.attrs,
				dir: i("dir"),
				id: V_(s),
				"data-disabled": Z(d),
				"data-required": Z(f),
				htmlFor: H_(s),
				onClick(e) {
					u && (e.defaultPrevented || U_(s)?.focus({ preventScroll: !0 }));
				}
			});
		},
		getRootProps() {
			return t.element({
				...R_.root.attrs,
				dir: i("dir"),
				"data-disabled": Z(d),
				id: z_(s)
			});
		},
		getControlProps() {
			return t.element({
				...R_.control.attrs,
				dir: i("dir"),
				tabIndex: d ? void 0 : 0,
				id: B_(s),
				role: "application",
				"aria-roledescription": "signature pad",
				"aria-label": p.control,
				"aria-disabled": d,
				"data-disabled": Z(d),
				onPointerDown(e) {
					if (!ht(e) || Xe(e) || !u || Ct(e)?.closest("[data-part=clear-trigger]")) return;
					e.currentTarget.setPointerCapture(e.pointerId);
					let t = {
						x: e.clientX,
						y: e.clientY
					}, n = U_(s);
					if (!n) return;
					let { offset: i } = Zi(t, n);
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
				...R_.segment.attrs,
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
				...R_.segmentPath.attrs,
				d: e.path
			});
		},
		getGuideProps() {
			return t.element({
				...R_.guide.attrs,
				dir: i("dir"),
				"data-disabled": Z(d)
			});
		},
		getClearTriggerProps() {
			return t.button({
				...R_.clearTrigger.attrs,
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
				id: H_(s),
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
var { PI: J_ } = Math, Y_ = J_ + 1e-4, X_ = .5, Z_ = [1, 1];
function Q_(e, t, n, r = (e) => e) {
	return e * r(.5 - t * (.5 - n));
}
var { min: $_ } = Math;
function ev(e, t, n) {
	let r = $_(1, t / n);
	return $_(1, e + ($_(1, 1 - r) - e) * (r * .275));
}
function tv(e) {
	return [-e[0], -e[1]];
}
function nv(e, t) {
	return [e[0] + t[0], e[1] + t[1]];
}
function rv(e, t, n) {
	return e[0] = t[0] + n[0], e[1] = t[1] + n[1], e;
}
function iv(e, t) {
	return [e[0] - t[0], e[1] - t[1]];
}
function av(e, t, n) {
	return e[0] = t[0] - n[0], e[1] = t[1] - n[1], e;
}
function ov(e, t) {
	return [e[0] * t, e[1] * t];
}
function sv(e, t, n) {
	return e[0] = t[0] * n, e[1] = t[1] * n, e;
}
function cv(e, t) {
	return [e[0] / t, e[1] / t];
}
function lv(e) {
	return [e[1], -e[0]];
}
function uv(e, t) {
	let n = t[0];
	return e[0] = t[1], e[1] = -n, e;
}
function dv(e, t) {
	return e[0] * t[0] + e[1] * t[1];
}
function fv(e, t) {
	return e[0] === t[0] && e[1] === t[1];
}
function pv(e) {
	return Math.hypot(e[0], e[1]);
}
function mv(e, t) {
	let n = e[0] - t[0], r = e[1] - t[1];
	return n * n + r * r;
}
function hv(e) {
	return cv(e, pv(e));
}
function gv(e, t) {
	return Math.hypot(e[1] - t[1], e[0] - t[0]);
}
function _v(e, t, n) {
	let r = Math.sin(n), i = Math.cos(n), a = e[0] - t[0], o = e[1] - t[1], s = a * i - o * r, c = a * r + o * i;
	return [s + t[0], c + t[1]];
}
function vv(e, t, n, r) {
	let i = Math.sin(r), a = Math.cos(r), o = t[0] - n[0], s = t[1] - n[1], c = o * a - s * i, l = o * i + s * a;
	return e[0] = c + n[0], e[1] = l + n[1], e;
}
function yv(e, t, n) {
	return nv(e, ov(iv(t, e), n));
}
function bv(e, t, n, r) {
	let i = n[0] - t[0], a = n[1] - t[1];
	return e[0] = t[0] + i * r, e[1] = t[1] + a * r, e;
}
function xv(e, t, n) {
	return nv(e, ov(t, n));
}
var Sv = [0, 0], Cv = [0, 0], wv = [0, 0];
function Tv(e, t) {
	let n = xv(e, hv(lv(iv(e, nv(e, [1, 1])))), -t), r = [], i = 1 / 13;
	for (let t = i; t <= 1; t += i) r.push(_v(n, e, Y_ * 2 * t));
	return r;
}
function Ev(e, t, n) {
	let r = [], i = 1 / n;
	for (let n = i; n <= 1; n += i) r.push(_v(t, e, Y_ * n));
	return r;
}
function Dv(e, t, n) {
	let r = iv(t, n), i = ov(r, .5), a = ov(r, .51);
	return [
		iv(e, i),
		iv(e, a),
		nv(e, a),
		nv(e, i)
	];
}
function Ov(e, t, n, r) {
	let i = [], a = xv(e, t, n), o = 1 / r;
	for (let t = o; t < 1; t += o) i.push(_v(a, e, Y_ * 3 * t));
	return i;
}
function kv(e, t, n) {
	return [
		nv(e, ov(t, n)),
		nv(e, ov(t, n * .99)),
		iv(e, ov(t, n * .99)),
		iv(e, ov(t, n))
	];
}
function Av(e, t, n) {
	return e === !1 || e === void 0 ? 0 : e === !0 ? Math.max(t, n) : e;
}
function jv(e, t, n) {
	return e.slice(0, 10).reduce((e, r) => {
		let i = r.pressure;
		return t && (i = ev(e, r.distance, n)), (e + i) / 2;
	}, e[0].pressure);
}
function Mv(e, t = {}) {
	let { size: n = 16, smoothing: r = .5, thinning: i = .5, simulatePressure: a = !0, easing: o = (e) => e, start: s = {}, end: c = {}, last: l = !1 } = t, { cap: u = !0, easing: d = (e) => e * (2 - e) } = s, { cap: f = !0, easing: p = (e) => --e * e * e + 1 } = c;
	if (e.length === 0 || n <= 0) return [];
	let m = e[e.length - 1].runningLength, h = Av(s.taper, n, m), g = Av(c.taper, n, m), _ = (n * r) ** 2, v = [], y = [], b = jv(e, a, n), x = Q_(n, i, e[e.length - 1].pressure, o), S, C = e[0].vector, w = e[0].point, T = w, E = w, D = T, O = !1;
	for (let t = 0; t < e.length; t++) {
		let { pressure: r } = e[t], { point: s, vector: c, distance: l, runningLength: u } = e[t], f = t === e.length - 1;
		if (!f && m - u < 3) continue;
		i ? (a && (r = ev(b, l, n)), x = Q_(n, i, r, o)) : x = n / 2, S === void 0 && (S = x);
		let k = u < h ? d(u / h) : 1, ee = m - u < g ? p((m - u) / g) : 1;
		x = Math.max(.01, x * Math.min(k, ee));
		let te = (f ? e[t] : e[t + 1]).vector, A = f ? 1 : dv(c, te), ne = dv(c, C) < 0 && !O, j = A !== null && A < 0;
		if (ne || j) {
			uv(Sv, C), sv(Sv, Sv, x);
			for (let e = 0; e <= 1; e += .07692307692307693) av(Cv, s, Sv), vv(Cv, Cv, s, Y_ * e), E = [Cv[0], Cv[1]], v.push(E), rv(wv, s, Sv), vv(wv, wv, s, Y_ * -e), D = [wv[0], wv[1]], y.push(D);
			w = E, T = D, j && (O = !0);
			continue;
		}
		if (O = !1, f) {
			uv(Sv, c), sv(Sv, Sv, x), v.push(iv(s, Sv)), y.push(nv(s, Sv));
			continue;
		}
		bv(Sv, te, c, A), uv(Sv, Sv), sv(Sv, Sv, x), av(Cv, s, Sv), E = [Cv[0], Cv[1]], (t <= 1 || mv(w, E) > _) && (v.push(E), w = E), rv(wv, s, Sv), D = [wv[0], wv[1]], (t <= 1 || mv(T, D) > _) && (y.push(D), T = D), b = r, C = c;
	}
	let k = [e[0].point[0], e[0].point[1]], ee = e.length > 1 ? [e[e.length - 1].point[0], e[e.length - 1].point[1]] : nv(e[0].point, [1, 1]), te = [], A = [];
	if (e.length === 1) {
		if (!(h || g) || l) return Tv(k, S || x);
	} else {
		h || g && e.length === 1 || (u ? te.push(...Ev(k, y[0], 13)) : te.push(...Dv(k, v[0], y[0])));
		let t = lv(tv(e[e.length - 1].vector));
		g || h && e.length === 1 ? A.push(ee) : f ? A.push(...Ov(ee, t, x, 29)) : A.push(...kv(ee, t, x));
	}
	return v.concat(A, y.reverse(), te);
}
var Nv = [0, 0];
function Pv(e) {
	return e != null && e >= 0;
}
function Fv(e, t = {}) {
	let { streamline: n = .5, size: r = 16, last: i = !1 } = t;
	if (e.length === 0) return [];
	let a = .15 + (1 - n) * .85, o = Array.isArray(e[0]) ? e : e.map(({ x: e, y: t, pressure: n = X_ }) => [
		e,
		t,
		n
	]);
	if (o.length === 2) {
		let e = o[1];
		o = o.slice(0, -1);
		for (let t = 1; t < 5; t++) o.push(yv(o[0], e, t / 4));
	}
	o.length === 1 && (o = [...o, [...nv(o[0], Z_), ...o[0].slice(2)]]);
	let s = [{
		point: [o[0][0], o[0][1]],
		pressure: Pv(o[0][2]) ? o[0][2] : .25,
		vector: [...Z_],
		distance: 0,
		runningLength: 0
	}], c = !1, l = 0, u = s[0], d = o.length - 1;
	for (let e = 1; e < o.length; e++) {
		let t = i && e === d ? [o[e][0], o[e][1]] : yv(u.point, o[e], a);
		if (fv(u.point, t)) continue;
		let n = gv(t, u.point);
		if (l += n, e < d && !c) {
			if (l < r) continue;
			c = !0;
		}
		av(Nv, u.point, t), u = {
			point: t,
			pressure: Pv(o[e][2]) ? o[e][2] : X_,
			vector: hv(Nv),
			distance: n,
			runningLength: l
		}, s.push(u);
	}
	return s[0].vector = s[1]?.vector || [0, 0], s;
}
function Iv(e, t = {}) {
	return Mv(Fv(e, t), t);
}
var Lv = Iv, Rv = (e, t) => (e + t) / 2;
function zv(e, t = !0) {
	let n = e.length;
	if (n < 4) return "";
	let r = e[0], i = e[1], a = e[2], o = `M${r[0].toFixed(2)},${r[1].toFixed(2)} Q${i[0].toFixed(2)},${i[1].toFixed(2)} ${Rv(i[0], a[0]).toFixed(2)},${Rv(i[1], a[1]).toFixed(2)} T`;
	for (let t = 2, a = n - 1; t < a; t++) r = e[t], i = e[t + 1], o += `${Rv(r[0], i[0]).toFixed(2)},${Rv(r[1], i[1]).toFixed(2)} `;
	return t && (o += "Z"), o;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+signature-pad@1.43.3/node_modules/@zag-js/signature-pad/dist/signature-pad.machine.mjs
var Bv = St({
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
			return gn(n, {
				onPointerMove({ event: n, point: r }) {
					let i = U_(e);
					if (!i) return;
					let { offset: a } = Zi(r, i);
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
				let i = Lv(r, n("drawing"));
				e.set("currentPath", zv(i));
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
						return r("isEmpty") ? Promise.resolve("") : G_(n, {
							type: e,
							quality: t
						});
					}
				});
			}
		}
	}
}), Vv = (e) => {
	let t = Nt(), n = Ut(), r = Be(), i = G(() => {
		let i = rn(e);
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
	}), a = zt(Bv, () => B(i)), o = G(() => q_(a, Et));
	return () => B(o);
}, Hv = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"value"
]);
function Uv(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = O(t, "value", 7), a = W(t, Hv), o = G(() => Q(i()().getRootProps(), a));
	return A_(() => i()()), X(e, q({ as: "div" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		},
		get value() {
			return i();
		},
		set value(e) {
			i(e), r();
		}
	});
}
N(Uv, {
	ref: {},
	value: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/signature-pad/signature-pad-segment.svelte
var Wv = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]), Gv = e("<path></path>"), Kv = y("<title>Signature</title> <!> <!>", 1);
function qv(e, t) {
	I(t, !0);
	let i = O(t, "ref", 15, null), a = W(t, Wv), o = j_(), c = G(() => Q(o().getSegmentProps(), a)), l = G(() => o().currentPath);
	return X(e, q({ as: "svg" }, () => B(c), {
		get ref() {
			return i();
		},
		set ref(e) {
			i(e);
		},
		children: (e, t) => {
			var r = Kv(), i = P(R(r), 2);
			C(i, 17, () => o().paths, s, (e, t) => {
				var r = Gv();
				n(r, (e) => ({ ...e }), [() => o().getSegmentPathProps({ path: B(t) })]), T(e, r);
			});
			var a = P(i, 2), c = (e) => {
				var t = Gv();
				n(t, (e) => ({ ...e }), [() => o().getSegmentPathProps({ path: B(l) })]), T(e, t);
			};
			w(a, (e) => {
				B(l) && e(c);
			}), T(e, r);
		},
		$$slots: { default: !0 }
	})), g({
		get ref() {
			return i();
		},
		set ref(e = null) {
			i(e), r();
		}
	});
}
N(qv, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/SignaturePad.svelte
var Jv = /* @__PURE__ */ new WeakMap(), Yv = 3.3 / 2, Xv = 1.9000000000000001 / 3.3, Zv = "#0f172a", Qv = 5e3, $v = y("<span id=\"af-described\" hidden=\"\"> </span>"), ey = y("<img part=\"image\" alt=\"\"/>"), ty = y("<div class=\"frame svelte-ejan91\"><!></div>"), ny = y("<!> <!> <!>", 1), ry = y("<!> <div class=\"footer svelte-ejan91\"><p part=\"hint\" id=\"af-hint\"> </p> <!></div>", 1), iy = y("<div class=\"af-kit signature svelte-ejan91\"><!> <!></div>"), ay = y("<!> <!>", 1), oy = {
	hash: "svelte-ejan91",
	code: ":host {display:block;}.signature.svelte-ejan91 {display:flex;flex-direction:column;height:100%;}.signature.svelte-ejan91 > .root {display:contents;}.frame.svelte-ejan91, [part~='control'] {position:relative;box-sizing:border-box;flex:1 1 290px;min-height:0;overflow:hidden;border:1px solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:#fff;outline:none;touch-action:none;}[part~='control'] {cursor:crosshair;}[part~='control']:focus-visible {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring);}[part~='control'][data-disabled] {opacity:0.5;cursor:not-allowed;}[part~='control'][aria-invalid='true'] {border-color:var(--k-danger);}[part~='image'] {position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:left top;pointer-events:none;}[part~='guide'] {position:absolute;right:24px;bottom:25%;left:24px;border-bottom:1px dashed #d4d4d4;pointer-events:none;}.footer.svelte-ejan91 {display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px;}[part~='hint'] {margin:0;color:var(--k-muted);font-size:11px;}[part~='clear'] {flex:none;}\n  @media (forced-colors: active) {[part~='control']:focus-visible {outline:2px solid;outline-offset:2px;}\n  }"
};
function sy(e, t) {
	let n = M();
	I(t, !0), c(e, oy);
	let i = O(t, "value", 7, null), a = O(t, "label", 7, null), o = O(t, "disabled", 7, !1), s = O(t, "locale", 7, null), l = O(t, "strings", 7, null), u = O(t, "name", 7, null), d = O(t, "required", 7, !1), f = O(t, "readonly", 7, !1), p = O(t, "description", 7, null), h = O(t, "error", 7, null), _ = O(t, "invalid", 7, !1), y = t.$$host, S = G(() => he(s(), l() ?? void 0)), C = G(() => a() || B(S).signaturePad), k = K(!1), ee = G(() => !!o() || B(k)), te = G(() => [p(), h()].filter(Boolean).join(" ")), A = K(null), N = K(null), ie = K(null);
	re(() => {
		i(), ne(() => J(ie, null));
	});
	let L = 0, z;
	j(() => () => clearTimeout(z));
	let ae = 0, H = Vv(() => ({
		id: n,
		getRootNode: () => y.shadowRoot,
		disabled: B(ee),
		readOnly: !!f(),
		drawing: {
			size: Yv,
			thinning: Xv,
			simulatePressure: !1,
			fill: Zv
		},
		translations: {
			control: B(C),
			clearTrigger: B(S).clear
		},
		onDrawEnd: (e) => {
			let t = ++L;
			if (clearTimeout(z), !e.paths.length) {
				if (J(N, null), ae) {
					ae--;
					return;
				}
				J(ie, i()), Ce(y, "change", { value: null });
				return;
			}
			let n = new Promise((t) => t(e.getDataUrl("image/png"))), r = new Promise((e, t) => {
				z = setTimeout(() => t(/* @__PURE__ */ Error(`the export did not finish in ${Qv} ms`)), Qv);
			});
			Promise.race([n, r]).then((e) => {
				t === L && (clearTimeout(z), J(N, e || null, !0), e && Ce(y, "change", { value: e }));
			}, (e) => {
				t === L && (clearTimeout(z), J(N, null), console.warn("A signature could not be exported as an image; the pad reports no value.", { error: String(e) }));
			});
		}
	})), oe = G(() => H().paths.length > 0 || !!H().currentPath), se = G(() => !!i() && !B(oe) && i() !== B(ie)), ce = G(() => B(oe) ? B(N) : B(se) ? i() : null);
	Jv.set(y, () => {
		f() || !B(oe) && !B(se) || H().clear();
	}), j(() => {
		let e = !!d() && !B(ce);
		Ve(y, {
			name: u(),
			value: B(ce),
			validity: e ? { valueMissing: !0 } : {},
			message: e ? me(B(S), "valueMissing") : "",
			anchor: B(A)
		});
	}), ze(y, {
		reset() {
			let e = y.getAttribute("value") || null, t = B(ce);
			H().empty || (ae++, H().clear()), J(ie, null), t !== e && Ce(y, "change", { value: e });
		},
		disabled(e) {
			J(k, e, !0);
		}
	});
	var W = {
		get value() {
			return i();
		},
		set value(e = null) {
			i(e), r();
		},
		get label() {
			return a();
		},
		set label(e = null) {
			a(e), r();
		},
		get disabled() {
			return o();
		},
		set disabled(e = !1) {
			o(e), r();
		},
		get locale() {
			return s();
		},
		set locale(e = null) {
			s(e), r();
		},
		get strings() {
			return l();
		},
		set strings(e = null) {
			l(e), r();
		},
		get name() {
			return u();
		},
		set name(e = null) {
			u(e), r();
		},
		get required() {
			return d();
		},
		set required(e = !1) {
			d(e), r();
		},
		get readonly() {
			return f();
		},
		set readonly(e = !1) {
			f(e), r();
		},
		get description() {
			return p();
		},
		set description(e = null) {
			p(e), r();
		},
		get error() {
			return h();
		},
		set error(e = null) {
			h(e), r();
		},
		get invalid() {
			return _();
		},
		set invalid(e = !1) {
			_(e), r();
		}
	}, ue = ay(), de = R(ue);
	_e(de, {});
	var q = P(de, 2);
	return Yt(q, {
		value: () => y.shadowRoot,
		children: (e, t) => {
			var n = iy(), r = V(n), a = (e) => {
				var t = $v(), n = F(t, !0);
				U(() => E(n, B(te))), T(e, t);
			};
			w(r, (e) => {
				B(te) && e(a);
			});
			var o = P(r, 2), s = (e) => {
				var t = ty(), n = V(t), r = (e) => {
					var t = ey();
					U(() => x(t, "src", i())), T(e, t);
				};
				w(n, (e) => {
					i() && e(r);
				}), v(t), U(() => {
					x(t, "role", i() ? "img" : void 0), x(t, "aria-label", i() ? B(C) : void 0);
				}), T(e, t);
			}, c = (e) => {
				var t = D(), n = R(t);
				b(n, () => Uv, (e, t) => {
					t(e, {
						get value() {
							return H;
						},
						class: "root",
						children: (e, t) => {
							var n = ry(), r = R(n);
							{
								let e = G(() => B(te) ? "af-hint af-described" : "af-hint"), t = G(() => _() ? "true" : void 0);
								b(r, () => F_, (n, r) => {
									r(n, {
										part: "control",
										get "aria-describedby"() {
											return B(e);
										},
										get "aria-invalid"() {
											return B(t);
										},
										get ref() {
											return B(A);
										},
										set ref(e) {
											J(A, e, !0);
										},
										children: (e, t) => {
											var n = ny(), r = R(n), a = (e) => {
												var t = ey();
												U(() => x(t, "src", i())), T(e, t);
											};
											w(r, (e) => {
												B(se) && e(a);
											});
											var o = P(r, 2);
											b(o, () => qv, (e, t) => {
												t(e, {
													part: "segment",
													"aria-hidden": "true"
												});
											});
											var s = P(o, 2);
											b(s, () => L_, (e, t) => {
												t(e, { part: "guide" });
											}), T(e, n);
										},
										$$slots: { default: !0 }
									});
								});
							}
							var a = P(r, 2), o = V(a), s = F(o, !0), c = P(o, 2);
							{
								let e = G(() => B(ee) || !B(oe) && !B(se));
								b(c, () => N_, (t, n) => {
									n(t, {
										part: "clear",
										class: "af-button ghost sm",
										hidden: !1,
										get disabled() {
											return B(e);
										},
										children: (e, t) => {
											m();
											var n = le();
											U(() => E(n, B(S).clear)), T(e, n);
										},
										$$slots: { default: !0 }
									});
								});
							}
							v(a), U(() => E(s, B(S).signHint)), T(e, n);
						},
						$$slots: { default: !0 }
					});
				}), T(e, t);
			};
			w(o, (e) => {
				f() ? e(s) : e(c, -1);
			}), v(n), T(e, n);
		},
		$$slots: { default: !0 }
	}), T(e, ue), g(W);
}
N(sy, {
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
}, [], [], { mode: "open" }, (e) => class extends Le(e) {
	focus(e) {
		let t = this.shadowRoot?.querySelector("[part~=\"control\"]");
		t ? t.focus(e) : super.focus(e);
	}
	clear() {
		Jv.get(this)?.();
	}
});
var cy = xt("splitter").parts("root", "panel", "resizeTrigger", "resizeTriggerIndicator").build(), ly = (e) => e.ids?.root ?? `splitter:${e.id}`, uy = (e, t) => e.ids?.resizeTrigger?.(t) ?? `splitter:${e.id}:splitter:${t}`, dy = (e, t) => e.ids?.panel?.(t) ?? `splitter:${e.id}:panel:${t}`, fy = (e) => `splitter:${e.id}:global-cursor`, py = (e) => e.getById(ly(e)), my = (e, t) => t == null ? null : e.getById(uy(e, t)), hy = (e) => Jt(e) && e.dataset.part === "panel" ? e.dataset.id : void 0, gy = (e) => {
	let t = e?.previousElementSibling ?? null;
	for (; t;) {
		let e = hy(t);
		if (e) return e;
		t = t.previousElementSibling;
	}
}, _y = (e) => {
	let t = e?.nextElementSibling ?? null;
	for (; t;) {
		let e = hy(t);
		if (e) return e;
		t = t.nextElementSibling;
	}
}, vy = (e, t) => {
	let [n, r] = t.split(":");
	if (n && r) return t;
	let i = my(e, t), a = n || gy(i), o = r || _y(i);
	return a && o ? `${a}:${o}` : null;
}, yy = (e, t) => {
	let n = t ? "col-resize" : "row-resize";
	return e.isAtMin && (n = t ? "e-resize" : "s-resize"), e.isAtMax && (n = t ? "w-resize" : "n-resize"), n;
}, by = (e) => Pn(py(e), `[role=separator]${en(ly(e))}`), xy = (e) => e.getDoc().getElementById(fy(e)), Sy = (e, t, n, r) => {
	let i = xy(e), a = `* { cursor: ${yy(t, n)} !important; }`;
	if (i) i.textContent = a;
	else {
		let t = e.getDoc().createElement("style");
		r && (t.nonce = r), t.id = fy(e), t.textContent = a, e.getDoc().head.appendChild(t);
	}
}, Cy = (e) => {
	xy(e)?.remove();
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/utils/aria.mjs
function wy({ size: e, panels: t, pivotIndices: n }) {
	let r = 0, i = 100, a = 0, o = 0, s = n[0];
	return Tt(s, () => "No pivot index found"), t.forEach((e, t) => {
		let { maxSize: n = 100, minSize: c = 0 } = e;
		t === s ? (r = c, i = n) : (a += c, o += n);
	}), {
		valueMax: Math.min(i, 100 - a),
		valueMin: Math.max(r, 100 - o),
		valueNow: e[s]
	};
}
function Ty(e, t, n) {
	let [r, i] = n.split(":"), a = t.findIndex((e) => e.id === r), o = t.findIndex((e) => e.id === i);
	if (a === -1 || o === -1) return {
		beforeId: r || void 0,
		afterId: i || void 0,
		valueMax: void 0,
		valueMin: void 0,
		valueNow: void 0
	};
	let { valueMax: s, valueMin: c, valueNow: l } = wy({
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
function Ey(e, t, n = 10) {
	return e.toFixed(n) === t.toFixed(n) ? 0 : e > t ? 1 : -1;
}
function Dy(e, t, n = 10) {
	return e == null || t == null ? !1 : Ey(e, t, n) === 0;
}
function Oy(e, t, n) {
	if (e.length !== t.length) return !1;
	for (let r = 0; r < e.length; r++) {
		let i = e[r], a = t[r];
		if (!Dy(i, a, n)) return !1;
	}
	return !0;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/utils/size.mjs
var ky = /^(-?\d*\.?\d+)(%|px|em|rem|vw|vh)?$/, Ay = /^(-?\d*\.?\d+)%$/;
function jy(e, t) {
	if (!e) return 0;
	let n = e.getBoundingClientRect();
	return t === "horizontal" ? n.width : n.height;
}
function My(e, t) {
	return jy(e, t);
}
function Ny(e, t, n) {
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
function Py(e, t, n) {
	if (e == null) return;
	if (typeof e == "number") return e;
	let r = e.trim().match(ky);
	if (!r) return;
	let i = Number.parseFloat(r[1]);
	if (!Number.isFinite(i)) return;
	let a = r[2];
	if (a == null || a === "%") return i;
	if (!t) return;
	let o = jy(t, n);
	if (o === 0) return;
	let s = Ny(i, a, t);
	return s == null ? void 0 : s / o * 100;
}
function Fy(e) {
	if (e == null) return;
	if (typeof e == "number") return `${e}%`;
	let t = e.trim();
	if (Ay.test(t)) return t;
	let n = t.match(ky);
	if (!n) return;
	let r = Number.parseFloat(n[1]);
	if (!Number.isFinite(r)) return;
	let i = n[2];
	return i == null ? `${r}%` : `${r}${i}`;
}
function Iy({ sizes: e, panels: t, rootEl: n, orientation: r }) {
	let i = Array(t.length), a = 100, o = 0;
	for (let s = 0; s < t.length; s++) {
		let t = Py(e?.[s], n, r);
		t != null && (o++, i[s] = t, a -= t);
	}
	for (let e = 0; e < t.length; e++) {
		if (i[e] != null) continue;
		let n = t.length - o, r = n > 0 ? a / n : 0;
		o++, i[e] = r, a -= r;
	}
	return i;
}
function Ly(e, t, n) {
	return e.map((e) => ({
		...e,
		minSize: Py(e.minSize, t, n),
		maxSize: Py(e.maxSize, t, n),
		collapsedSize: Py(e.collapsedSize, t, n)
	}));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/utils/panel.mjs
function Ry(e, t) {
	let n = e.find((e) => e.id === t);
	return Tt(n, () => `Panel data not found for id "${t}"`), n;
}
function zy(e, t) {
	return e.findIndex((e) => e === t || e.id === t.id);
}
function By(e, t) {
	return e.findIndex((e) => e.id === t);
}
function Vy(e, t, n) {
	let r = By(e, t.id), i = r === e.length - 1 ? [r - 1, r] : [r, r + 1], a = n[r];
	return {
		...t,
		panelSize: a,
		pivotIndices: i
	};
}
function Hy(e) {
	return e.sort((e, t) => {
		let n = e.order, r = t.order;
		return n == null && r == null ? 0 : n == null ? -1 : r == null ? 1 : n - r;
	});
}
function Uy(e) {
	return e.map((e) => e.id).sort().join(":");
}
function Wy(e) {
	return e.map((e) => e.id).sort().map((t) => {
		let n = e.find((e) => e.id === t);
		return JSON.stringify(n);
	}).join(",");
}
function Gy({ size: e, defaultSize: t, dragState: n, resolvedSizes: r, panels: i, panelIndex: a, horizontal: o, collapsed: s = !1, precision: c = 3 }) {
	let l = r[a], u = e ?? t, d = i[a], f, p, m = 1, h = o ? "Width" : "Height", g = d ? Fy(d.minSize) : void 0, _ = d ? Fy(d.maxSize) : void 0, v = s ? Fy(d?.collapsedSize ?? 0) : g, y = Fy(u);
	return l == null ? y == null ? f = "1" : y.endsWith("%") ? f = Number.parseFloat(y).toPrecision(c) : (p = Ky({
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
function Ky({ basis: e, minSize: t, maxSize: n }) {
	return `clamp(${t ?? "0%"}, ${e}, ${n ?? "100%"})`;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/splitter.connect.mjs
function qy(e, t) {
	let { state: n, send: r, prop: i, computed: a, context: o, scope: s } = e, c = a("horizontal"), l = n.matches("dragging"), u = i("registry"), d = i("orientation"), f = i("panels"), p = o.get("panels"), m = () => {
		let e = o.get("size");
		return e.length > 0 ? e : Iy({
			sizes: i("size") ?? i("defaultSize"),
			panels: f,
			rootEl: null,
			orientation: d
		});
	}, h = (e) => {
		let t = f.findIndex((t) => t.id === e), n = i("size")?.[t], r = i("defaultSize")?.[t], a = o.get("dragState"), s = o.get("size"), l = p[t], u = s[t], d = !!l?.collapsible && u != null && Dy(u, l.collapsedSize ?? 0);
		return Gy({
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
			return Ry(f, e);
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
			let t = o.get("panels"), n = m(), r = Ry(t, e), { panelSize: i } = Vy(t, r, n);
			return Tt(i != null, () => `Panel size not found for panel "${r.id}"`), i;
		},
		isPanelCollapsed(e) {
			let t = o.get("panels"), n = m(), r = Ry(t, e), { collapsedSize: i = 0, collapsible: a, panelSize: s } = Vy(t, r, n);
			return Tt(s != null, () => `Panel size not found for panel "${r.id}"`), a === !0 && Dy(s, i);
		},
		isPanelExpanded(e) {
			let t = o.get("panels"), n = m(), r = Ry(t, e), { collapsedSize: i = 0, collapsible: a, panelSize: s } = Vy(t, r, n);
			return Tt(s != null, () => `Panel size not found for panel "${r.id}"`), !a || Ey(s, i) > 0;
		},
		getLayout() {
			return Uy(i("panels"));
		},
		getRootProps() {
			return t.element({
				...cy.root.attrs,
				"data-orientation": d,
				"data-dragging": Z(l),
				id: ly(s),
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
				...cy.panel.attrs,
				"data-orientation": d,
				"data-dragging": Z(l),
				dir: i("dir"),
				"data-id": n,
				"data-index": By(i("panels"), n),
				id: dy(s, n),
				"data-ownedby": ly(s),
				style: h(n)
			});
		},
		getResizeTriggerState: _,
		getResizeTriggerIndicator(e) {
			let n = _(e);
			return t.element({
				...cy.resizeTriggerIndicator.attrs,
				"data-orientation": d,
				"data-focus": Z(n.focused),
				"data-dragging": Z(n.dragging),
				"data-disabled": Z(n.disabled),
				"data-ownedby": ly(s)
			});
		},
		getResizeTriggerProps(e) {
			let { id: n } = e, a = _(e), o = g(n), l = Ty(m(), p, o);
			return t.element({
				...cy.resizeTrigger.attrs,
				dir: i("dir"),
				id: uy(s, n),
				role: "separator",
				"data-id": n,
				"data-ownedby": ly(s),
				tabIndex: a.disabled ? void 0 : 0,
				"aria-valuenow": l.valueNow,
				"aria-valuemin": l.valueMin,
				"aria-valuemax": l.valueMax,
				"data-orientation": d,
				"aria-orientation": d,
				"aria-controls": l.beforeId && l.afterId ? `${dy(s, l.beforeId)} ${dy(s, l.afterId)}` : void 0,
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
					if (!ht(e)) return;
					if (a.disabled) {
						e.preventDefault();
						return;
					}
					if (e.currentTarget.focus({
						preventScroll: !0,
						focusVisible: !1
					}), u) return;
					let t = nn(e);
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
					}[bt(e, {
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
function Jy({ panels: e, prevLayout: t, prevGroupSize: n, nextGroupSize: r }) {
	if (n <= 0 || r <= 0) return t;
	let i = [...t], a = [], o = 0, s = 0;
	if (e.forEach((e, c) => {
		if (e.resizeBehavior === "preserve-pixel-size") {
			let e = t[c] / 100 * n / r * 100;
			i[c] = e, o += e;
		} else a.push(c), s += t[c];
	}), a.length === 0) {
		let e = i.reduce((e, t) => e + t, 0);
		if (Dy(e, 100)) return i;
		if (e <= 0) return t;
		let n = 100 / e;
		return i.map((e) => e * n);
	}
	let c = 100 - o;
	if (c <= 0) {
		let e = i.reduce((e, t) => e + t, 0);
		if (Dy(e, 100)) return i;
		let t = 100 / Math.max(e, 1);
		return i.map((e) => e * t);
	}
	if (Dy(s, 0)) {
		let e = c / a.length;
		return a.forEach((t) => {
			i[t] = e;
		}), i;
	}
	a.forEach((e) => {
		i[e] = t[e] / s * c;
	});
	let l = i.reduce((e, t) => e + t, 0);
	if (Dy(l, 100)) return i;
	let u = 100 / l;
	return i.map((e) => e * u);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/utils/resize-panel.mjs
function Yy({ panels: e, index: t, size: n }) {
	let r = e[t];
	Tt(r, () => `Panel data not found for index ${t}`);
	let { collapsedSize: i = 0, collapsible: a, maxSize: o = 100, minSize: s = 0 } = r;
	if (Ey(n, s) < 0) {
		if (a) {
			let e = (i + s) / 2;
			n = Ey(n, e) < 0 ? i : s;
		} else n = s;
	}
	return n = Math.min(o, n), n = parseFloat(n.toFixed(10)), n;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/utils/resize-by-delta.mjs
function Xy(e) {
	let { delta: t, initialSize: n, panels: r, pivotIndices: i, prevSize: a, trigger: o } = e;
	if (Dy(t, 0)) return n;
	let s = [...n], [c, l] = i;
	Tt(c, () => "Invalid first pivot index"), Tt(l, () => "Invalid second pivot index");
	let u = 0;
	if (o === "keyboard") {
		{
			let e = t < 0 ? l : c, i = r[e];
			Tt(i, () => `Panel data not found for index ${e}`);
			let { collapsedSize: a = 0, collapsible: o, minSize: s = 0 } = i;
			if (o) {
				let r = n[e];
				if (Tt(r, () => `Previous size not found for panel index ${e}`), Dy(r, a)) {
					let e = s - r;
					Ey(e, Math.abs(t)) > 0 && (t = t < 0 ? 0 - e : e);
				}
			}
		}
		{
			let e = t < 0 ? c : l, i = r[e];
			Tt(i, () => `No panel data found for index ${e}`);
			let { collapsedSize: a = 0, collapsible: o, minSize: s = 0 } = i;
			if (o) {
				let r = n[e];
				if (Tt(r, () => `Previous size not found for panel index ${e}`), Dy(r, s)) {
					let e = r - a;
					Ey(e, Math.abs(t)) > 0 && (t = t < 0 ? 0 - e : e);
				}
			}
		}
	}
	{
		let e = t < 0 ? 1 : -1, i = t < 0 ? l : c, a = 0;
		for (;;) {
			let t = n[i];
			Tt(t, () => `Previous size not found for panel index ${i}`);
			let o = Yy({
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
			Tt(a, () => `Previous size not found for panel index ${e}`);
			let o = a - i, c = Yy({
				panels: r,
				index: e,
				size: o
			});
			if (!Dy(a, c) && (u += a - c, s[e] = c, u.toPrecision(3).localeCompare(Math.abs(t).toPrecision(3), void 0, { numeric: !0 }) >= 0)) break;
			t < 0 ? e-- : e++;
		}
	}
	if (Oy(a, s)) return a;
	{
		let e = t < 0 ? l : c, i = n[e];
		Tt(i, () => `Previous size not found for panel index ${e}`);
		let a = i + u, o = Yy({
			panels: r,
			index: e,
			size: a
		});
		if (s[e] = o, !Dy(o, a)) {
			let e = a - o, n = t < 0 ? l : c;
			for (; n >= 0 && n < r.length;) {
				let i = s[n];
				Tt(i, () => `Previous size not found for panel index ${n}`);
				let a = i + e, o = Yy({
					panels: r,
					index: n,
					size: a
				});
				if (Dy(i, o) || (e -= o - i, s[n] = o), Dy(e, 0)) break;
				t > 0 ? n-- : n++;
			}
		}
	}
	return Dy(s.reduce((e, t) => t + e, 0), 100) ? s : a;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/utils/validate-sizes.mjs
function Zy({ size: e, panels: t }) {
	let n = [...e], r = n.reduce((e, t) => e + t, 0);
	if (n.length !== t.length) throw Error(`Invalid ${t.length} panel size: ${n.map((e) => `${e}%`).join(", ")}`);
	if (!Dy(r, 100) && n.length > 0) for (let e = 0; e < t.length; e++) {
		let t = n[e];
		Tt(t, () => `No size data found for index ${e}`);
		let i = 100 / r * t;
		n[e] = i;
	}
	let i = 0;
	for (let e = 0; e < t.length; e++) {
		let r = n[e];
		Tt(r, () => `No size data found for index ${e}`);
		let a = Yy({
			panels: t,
			index: e,
			size: r
		});
		r != a && (i += r - a, n[e] = a);
	}
	if (!Dy(i, 0)) for (let e = 0; e < t.length; e++) {
		let r = n[e];
		Tt(r, () => `No size data found for index ${e}`);
		let a = r + i, o = Yy({
			panels: t,
			index: e,
			size: a
		});
		if (r !== o && (i -= o - r, n[e] = o, Dy(i, 0))) break;
	}
	return n;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+splitter@1.43.3/node_modules/@zag-js/splitter/dist/splitter.machine.mjs
var Qy = St({
	props({ props: e }) {
		return Bt(e, ["panels"]), {
			orientation: "horizontal",
			defaultSize: [],
			dir: "ltr",
			...e,
			panels: Hy(e.panels)
		};
	},
	initialState() {
		return "idle";
	},
	context({ prop: e, bindable: t, getContext: n, getRefs: r }) {
		return {
			panels: t(() => ({ defaultValue: Ly(e("panels"), null, e("orientation")) })),
			size: t(() => ({
				defaultValue: [],
				isEqual(e, t) {
					return t != null && Oy(e, t);
				},
				onChange(t) {
					let i = n(), a = r();
					if (a.get("suppressOnResize")) return;
					let o = a.get("panelSizeBeforeCollapse"), s = Object.fromEntries(o.entries()), c = i.get("dragState")?.resizeTriggerId ?? null, l = Uy(e("panels"));
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
			() => Wy(n("panels")),
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
			return t.isActiveElement(my(t, n?.resizeTriggerId));
		} },
		effects: {
			trackResizeHandles: ({ prop: e, scope: t, send: n }) => {
				let r = e("registry");
				if (!r) return;
				let i = [], a = () => {
					i.forEach((e) => e()), i = by(t).map((i) => {
						let a = i.dataset.id;
						if (a) return r.register({
							id: uy(t, a),
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
				let o = Yi(py(t), { callback: a });
				return () => {
					i.forEach((e) => e()), o?.();
				};
			},
			trackRootResize: ({ scope: e, send: t }) => {
				let n = py(e);
				if (n) return ea.observe(n, () => {
					t({ type: "ROOT.RESIZE" });
				});
			},
			waitForHoverDelay: ({ send: e }) => qr(() => {
				e({ type: "HOVER_DELAY" });
			}, 250),
			trackPointerMove: ({ scope: e, send: t }) => {
				let n = e.getDoc();
				return gn(n, {
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
				let { context: t, event: n, prop: r, scope: i } = e, a = n.size, o = t.get("size"), s = t.get("panels"), c = Zy({
					size: Iy({
						sizes: a,
						panels: r("panels"),
						rootEl: py(i),
						orientation: r("orientation")
					}),
					panels: s
				});
				Ze(o, c) || $y(e, c);
			},
			resetSize(e) {
				let { refs: t, context: n, prop: r, scope: i } = e;
				$y(e, t.get("initialSize") ?? Zy({
					size: Iy({
						sizes: r("size") ?? r("defaultSize"),
						panels: r("panels"),
						rootEl: py(i),
						orientation: r("orientation")
					}),
					panels: n.get("panels")
				}));
			},
			syncSize(e) {
				let { context: t, scope: n, prop: r, refs: i } = e, a = py(n);
				if (!a) return;
				let o = r("orientation"), s = My(a, o);
				if (s <= 0) return;
				let c = Ly(r("panels"), a, r("orientation"));
				t.set("panels", c);
				let l = r("size") ?? r("defaultSize"), u = `${Uy(r("panels"))}:${JSON.stringify(r("size") ?? [])}:${JSON.stringify(r("defaultSize") ?? [])}`, d = i.get("prevGroupSize"), f = t.get("size"), p = Iy({
					sizes: l,
					panels: r("panels"),
					rootEl: a,
					orientation: o
				}), m = Zy({
					size: d != null && d !== s && f.length === c.length ? Jy({
						panels: c,
						prevLayout: f,
						prevGroupSize: d,
						nextGroupSize: s
					}) : p,
					panels: c
				});
				i.get("prevInitialLayout") !== u && (i.set("initialSize", m), i.set("prevInitialLayout", u));
				let h = t.get("size");
				Ze(h, m) || (i.set("suppressOnResize", r("size") != null || h.length === 0), t.set("size", m), i.set("suppressOnResize", !1)), i.set("prevGroupSize", s);
			},
			setDraggingState({ context: e, event: t, prop: n, scope: r }) {
				let i = n("orientation"), a = e.get("size"), o = t.id, s = vy(r, o);
				if (!s || !py(r)) return;
				let c = my(r, o);
				Tt(c, () => `Drag handle element not found for id "${o}"`);
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
					resolvedResizeTriggerId: vy(n, r)
				});
			},
			clearKeyboardState({ context: e }) {
				e.set("keyboardState", null);
			},
			collapsePanel(e) {
				let { context: t, event: n, refs: r } = e, i = t.get("size"), a = t.get("panels"), o = a.find((e) => e.id === n.id);
				if (Tt(o, () => `Panel data not found for id "${n.id}"`), o.collapsible) {
					let { collapsedSize: t = 0, panelSize: n, pivotIndices: s } = Vy(a, o, i);
					if (Tt(n != null, () => `Panel size not found for panel "${o.id}"`), !Dy(n, t)) {
						r.get("panelSizeBeforeCollapse").set(o.id, n);
						let c = Xy({
							delta: zy(a, o) === a.length - 1 ? n - t : t - n,
							initialSize: i,
							panels: a,
							pivotIndices: s,
							prevSize: i,
							trigger: "imperative-api"
						});
						Ze(i, c) || $y(e, c);
					}
				}
			},
			expandPanel(e) {
				let { context: t, event: n, refs: r } = e, i = t.get("panels"), a = t.get("size"), o = i.find((e) => e.id === n.id);
				if (Tt(o, () => `Panel data not found for id "${n.id}"`), o.collapsible) {
					let { collapsedSize: t = 0, panelSize: s = 0, minSize: c = 0, pivotIndices: l } = Vy(i, o, a), u = n.minSize ?? c;
					if (Dy(s, t)) {
						let t = r.get("panelSizeBeforeCollapse").get(o.id), n = t != null && t >= u ? t : u, c = Xy({
							delta: zy(i, o) === i.length - 1 ? s - n : n - s,
							initialSize: a,
							panels: i,
							pivotIndices: l,
							prevSize: a,
							trigger: "imperative-api"
						});
						Ze(a, c) || $y(e, c);
					}
				}
			},
			resizePanel(e) {
				let { context: t, event: n } = e, r = t.get("size"), i = t.get("panels"), a = Ry(i, n.id), o = n.size, { panelSize: s, pivotIndices: c } = Vy(i, a, r);
				Tt(s != null, () => `Panel size not found for panel "${a.id}"`);
				let l = Xy({
					delta: zy(i, a) === i.length - 1 ? s - o : o - s,
					initialSize: r,
					panels: i,
					pivotIndices: c,
					prevSize: r,
					trigger: "imperative-api"
				});
				Ze(r, l) || $y(e, l);
			},
			setPointerValue(e) {
				let { context: t, event: n, prop: r, scope: i } = e, a = t.get("dragState");
				if (!a) return;
				let { resolvedResizeTriggerId: o, initialSize: s, initialCursorPosition: c } = a, l = t.get("panels"), u = py(i);
				Tt(u, () => "Panel group element not found");
				let d = o.split(":").map((e) => l.findIndex((t) => t.id === e)), f = r("orientation") === "horizontal", p = f ? n.point.x : n.point.y, m = u.getBoundingClientRect(), h = f ? m.width : m.height, g = (p - c) / h * 100, _ = t.get("size"), v = Xy({
					delta: g,
					initialSize: s ?? _,
					panels: l,
					pivotIndices: d,
					prevSize: _,
					trigger: "mouse-or-touch"
				});
				Ze(_, v) || $y(e, v);
			},
			setKeyboardValue(e) {
				let { context: t, event: n } = e, r = t.get("panels"), i = vy(e.scope, n.id);
				if (!i) return;
				let a = n.delta, o = i.split(":").map((e) => r.findIndex((t) => t.id === e)), s = t.get("size"), c = Xy({
					delta: a,
					initialSize: s,
					panels: r,
					pivotIndices: o,
					prevSize: s,
					trigger: "keyboard"
				});
				Ze(s, c) || $y(e, c);
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
				Tt(c, () => `No panel data found for index ${s}`);
				let l = i[s], { collapsedSize: u = 0, collapsible: d, minSize: f = 0 } = c;
				if (l != null && d) {
					let t = [a, o].map((e) => r.findIndex((t) => t.id === e)), s = Xy({
						delta: Dy(l, u) ? f - u : u - l,
						initialSize: n.get("initialSize") ?? i,
						panels: r,
						pivotIndices: t,
						prevSize: i,
						trigger: "keyboard"
					});
					Ze(i, s) || $y(e, s);
				}
			},
			setGlobalCursor(e) {
				let { context: t, scope: n, prop: r } = e;
				if (r("registry")) return;
				let i = t.get("dragState");
				if (!i) return;
				let a = t.get("panels"), o = r("orientation") === "horizontal", [s] = i.resolvedResizeTriggerId.split(":"), c = a[a.findIndex((e) => e.id === s)], l = Ty(t.get("size"), a, i.resolvedResizeTriggerId);
				Sy(n, {
					isAtMin: Dy(l.valueNow, l.valueMin) || Dy(l.valueNow, c.collapsedSize),
					isAtMax: Dy(l.valueNow, l.valueMax)
				}, o, r("nonce"));
			},
			clearGlobalCursor({ scope: e }) {
				Cy(e);
			},
			focusNextResizeTrigger({ event: e, scope: t }) {
				let n = by(t), r = n.findIndex((t) => t.dataset.id === e.id);
				(e.shiftKey ? tt(n, r) : lt(n, r))?.focus();
			}
		}
	}
});
function $y(e, t) {
	let { refs: n, prop: r, context: i } = e, a = i.get("panels"), o = r("onCollapse"), s = r("onExpand"), c = r("onResize"), l = r("onResizeStart"), u = r("onResizeEnd"), d = n.get("panelIdToLastNotifiedSizeMap"), f = i.get("dragState"), p = i.get("keyboardState"), m = f === null && p === null;
	if (n.set("lastRequestedSize", t), m && l && queueMicrotask(() => {
		l();
	}), r("size") == null) i.set("size", t);
	else if (c) {
		let e = n.get("panelSizeBeforeCollapse"), i = Object.fromEntries(e.entries()), a = f?.resizeTriggerId ?? null;
		c({
			size: t,
			layout: Uy(r("panels")),
			resizeTriggerId: a,
			expandToSizes: i
		});
	}
	t.forEach((e, t) => {
		let n = a[t];
		Tt(n, () => `Panel data not found for index ${t}`);
		let { collapsedSize: r = 0, collapsible: i, id: c } = n, l = d.get(c);
		(l == null || e !== l) && (d.set(c, e), i && l != null && (o || s) && (Dy(l, r) && !Dy(e, r) && s?.({
			panelId: c,
			size: e
		}), !Dy(l, r) && Dy(e, r) && o?.({
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
var [eb, tb] = Zt({
	name: "SplitterContext",
	hookName: "useSplitterContext",
	providerName: "<SplitterProvider />"
}), nb = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function rb(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, nb), a = G(() => Wt()(i, ["id"])), o = G(() => f(B(a), 2)), s = G(() => B(o)[0]), c = G(() => B(o)[1]), l = tb(), u = G(() => Q(l().getPanelProps(B(s)), B(c)));
	return X(e, q({ as: "div" }, () => B(u), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(rb, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/splitter/use-splitter-resize-trigger-props-context.js
var [ib, ab] = Zt({
	name: "SplitterResizeTriggerPropsContext",
	hookName: "useSplitterResizeTriggerPropsContext",
	providerName: "<SplitterResizeTriggerPropsProvider />"
}), ob = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function sb(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, ob), a = G(() => Wt()(i, ["disabled", "id"])), o = G(() => f(B(a), 2)), s = G(() => B(o)[0]), c = G(() => B(o)[1]), l = tb(), u = G(() => Q(l().getResizeTriggerProps(B(s)), B(c)));
	return ib(() => B(s)), X(e, q({ as: "button" }, () => B(u), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(sb, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/splitter/splitter-split-props.svelte.js
function cb(e) {
	return Wt()(e, [
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
var lb = (e) => {
	let t = Nt(), n = Ut(), r = G(() => {
		let r = rn(e);
		return Bt(r, ["id"]), {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = zt(Qy, () => B(r)), a = G(() => qy(i, Et));
	return () => B(a);
}, ub = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"size"
]);
function db(e, t) {
	let n = M();
	I(t, !0);
	let i = O(t, "ref", 15, null), a = O(t, "size", 15), o = W(t, ub), s = G(() => cb(o)), c = G(() => f(B(s), 2)), l = G(() => B(c)[0]), u = G(() => B(c)[1]), d = G(() => ({
		...B(l),
		id: B(l).id ?? n,
		size: a(),
		onResize: (e) => {
			B(l).onResize?.(e), a(e.size);
		}
	})), p = lb(() => B(d)), m = G(() => Q(p().getRootProps(), B(u)));
	return eb(p), X(e, q({ as: "div" }, () => B(m), {
		get ref() {
			return i();
		},
		set ref(e) {
			i(e);
		}
	})), g({
		get ref() {
			return i();
		},
		set ref(e = null) {
			i(e), r();
		},
		get size() {
			return a();
		},
		set size(e) {
			a(e), r();
		}
	});
}
N(db, {
	ref: {},
	size: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/Splitter.svelte
var fb = Symbol("af-splitter size set"), pb = y("<!> <!> <!>", 1), mb = y("<!> <!>", 1), hb = {
	hash: "svelte-125g2ht",
	code: ":host {display:flex;min-height:0;}[data-scope='splitter'][data-part='root'] {flex:1 1 auto;min-width:0;min-height:0;}[data-scope='splitter'][data-part='panel'] {min-width:0;min-height:0;overflow:hidden;}[data-scope='splitter'][data-part='resize-trigger'] {box-sizing:border-box;width:4px;margin:0;padding:0;border:0;border-radius:0;outline:none;appearance:none;background-color:var(--k-line);transition:background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);}[data-scope='splitter'][data-part='resize-trigger'][data-orientation='vertical'] {width:auto;height:4px;}[data-scope='splitter'][data-part='resize-trigger'][data-dragging] {background-color:color-mix(in oklab, var(--k-primary) 40%, transparent);}\n  @media (hover: hover) {[data-scope='splitter'][data-part='resize-trigger']:hover {background-color:color-mix(in oklab, var(--k-primary) 40%, transparent);} }[data-scope='splitter'][data-part='resize-trigger']:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[data-scope='splitter'][data-part='resize-trigger']:focus-visible, [data-scope='splitter'][data-part='resize-trigger'][data-dragging] {position:relative;z-index:1;}\n  @media (prefers-reduced-motion: reduce) {[data-scope='splitter'][data-part='resize-trigger'] {transition:none;} }\n  @media (forced-colors: active) {[data-scope='splitter'][data-part='resize-trigger'] {forced-color-adjust:none;background-color:CanvasText;}[data-scope='splitter'][data-part='resize-trigger'][data-dragging] {background-color:Highlight;}\n    @media (hover: hover) {[data-scope='splitter'][data-part='resize-trigger']:hover {background-color:Highlight;} }[data-scope='splitter'][data-part='resize-trigger']:focus-visible {outline:2px solid CanvasText;outline-offset:2px;}\n  }"
};
function gb(e, t) {
	I(t, !0), c(e, hb);
	let n = O(t, "size", 7, 50), i = O(t, "min", 7, 20), a = O(t, "max", 7, 80), o = O(t, "orientation", 7, "horizontal"), s = O(t, "label", 7, null), l = O(t, "locale", 7, null), u = O(t, "strings", 7, null), d = t.$$host, f = we(d), p = G(() => he(l(), u() ?? void 0)), m = (e, t) => {
		let n = typeof e == "string" && e.trim() !== "" ? Number(e) : e;
		return typeof n == "number" && Number.isFinite(n) ? n : t;
	}, h = G(() => Math.min(100, Math.max(0, m(i(), 20)))), _ = G(() => Math.min(100, Math.max(B(h), m(a(), 80)))), v = G(() => m(n(), 50)), y = (e) => Math.min(B(_), Math.max(B(h), e)), x = G(() => o() === "vertical"), S = G(() => [{
		id: "start",
		minSize: B(h),
		maxSize: B(_)
	}, { id: "end" }]), C = K(k([50, 50])), w = 50, E = K(0);
	d[fb] = () => {
		J(E, ne(() => B(E)) + 1);
	};
	function ee(e) {
		J(C, [e, 100 - e], !0), w = e;
	}
	re(() => {
		let e = B(v);
		B(E), ne(() => ee(y(e)));
	}), re(() => {
		B(h), B(_), ne(() => ee(y(B(C)[0])));
	});
	function te() {
		let e = B(C)[0];
		Math.abs(e - w) < 1e-9 || (w = e, Ce(d, "size-change", { size: Math.round(e * 100) / 100 }));
	}
	var A = {
		get size() {
			return n();
		},
		set size(e = 50) {
			n(e), r();
		},
		get min() {
			return i();
		},
		set min(e = 20) {
			i(e), r();
		},
		get max() {
			return a();
		},
		set max(e = 80) {
			a(e), r();
		},
		get orientation() {
			return o();
		},
		set orientation(e = "horizontal") {
			o(e), r();
		},
		get label() {
			return s();
		},
		set label(e = null) {
			s(e), r();
		},
		get locale() {
			return l();
		},
		set locale(e = null) {
			l(e), r();
		},
		get strings() {
			return u();
		},
		set strings(e = null) {
			u(e), r();
		}
	}, j = mb(), M = R(j);
	_e(M, {});
	var N = P(M, 2);
	return Yt(N, {
		value: () => d.shadowRoot,
		children: (e, n) => {
			Vc(e, {
				get dir() {
					return f;
				},
				children: (e, n) => {
					var r = D(), i = R(r), a = () => B(C), o = (e) => {
						e && J(C, e, !0);
					};
					{
						let e = G(() => B(x) ? "vertical" : "horizontal");
						b(i, () => db, (n, r) => {
							r(n, {
								get orientation() {
									return B(e);
								},
								get panels() {
									return B(S);
								},
								keyboardResizeBy: 5,
								get size() {
									return a();
								},
								set size(e) {
									o(e);
								},
								onResizeEnd: te,
								children: (e, n) => {
									var r = pb(), i = R(r);
									b(i, () => rb, (e, n) => {
										n(e, {
											id: "start",
											part: "start",
											children: (e, n) => {
												var r = D(), i = R(r);
												fe(i, t, "start", {}, null), T(e, r);
											},
											$$slots: { default: !0 }
										});
									});
									var a = P(i, 2);
									{
										let e = G(() => s() || B(p).resizeHandle);
										b(a, () => sb, (t, n) => {
											n(t, {
												id: "start:end",
												part: "handle",
												class: "af-kit",
												type: "button",
												get "aria-label"() {
													return B(e);
												}
											});
										});
									}
									var o = P(a, 2);
									b(o, () => rb, (e, n) => {
										n(e, {
											id: "end",
											part: "end",
											children: (e, n) => {
												var r = D(), i = R(r);
												fe(i, t, "end", {}, null), T(e, r);
											},
											$$slots: { default: !0 }
										});
									}), T(e, r);
								},
								$$slots: { default: !0 }
							});
						});
					}
					T(e, r);
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { default: !0 }
	}), T(e, j), g(A);
}
N(gb, {
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
		super.size = e, this[fb]?.();
	}
	attributeChangedCallback(e, t, n) {
		super.attributeChangedCallback(e, t, n), e === "size" && this[fb]?.();
	}
});
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tabs/use-tabs-context.js
var [_b, vb] = Zt({
	name: "TabsContext",
	hookName: "useTabsContext",
	providerName: "<TabsProvider />"
}), yb = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function bb(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, yb), a = G(() => Wt()(i, ["value"])), s = G(() => f(B(a), 2)), c = G(() => B(s)[0]), l = G(() => B(s)[1]), u = vb(), d = zn(), p = G(() => ({
		...d(),
		present: u().value === B(c).value,
		immediate: !0
	})), m = Un(() => B(p)), h = G(() => Q(u().getContentProps(B(c)), B(l)));
	Gn(m);
	function _(e) {
		m().setNode(e);
	}
	var v = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	}, y = D(), b = R(y), x = (e) => {
		X(e, q({ as: "div" }, () => B(h), {
			[o()]: _,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, S = G(() => !m().unmounted);
	return w(b, (e) => {
		B(S) && e(x);
	}), T(e, y), g(v);
}
N(bb, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tabs/tabs-list.svelte
var xb = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Sb(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, xb), a = vb(), o = G(() => Q(a().getListProps(), i));
	return X(e, q({ as: "div" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(Sb, { ref: {} }, [], [], { mode: "open" });
var Cb = xt("tabs").parts("root", "list", "trigger", "content", "indicator").build(), wb = (e) => e.ids?.root ?? `tabs:${e.id}`, Tb = (e) => e.ids?.list ?? `tabs:${e.id}:list`, Eb = (e, t) => e.ids?.content?.(t) ?? `tabs:${e.id}:content-${t}`, Db = (e, t) => e.ids?.trigger?.(t) ?? `tabs:${e.id}:trigger-${t}`, Ob = (e) => e.ids?.indicator ?? `tabs:${e.id}:indicator`, kb = (e) => e.getById(Tb(e)), Ab = (e, t) => e.getById(Eb(e, t)), jb = (e, t) => t == null ? null : e.getById(Db(e, t)), Mb = (e) => e.getById(Ob(e)), Nb = (e) => {
	let t = `[role=tab]${en(Tb(e))}:not([disabled])`;
	return Pn(kb(e), t);
}, Pb = (e) => It(Nb(e)), Fb = (e) => at(Nb(e)), Ib = (e, t) => Mn(Nb(e), Db(e, t.value), t.loopFocus), Lb = (e, t) => En(Nb(e), Db(e, t.value), t.loopFocus), Rb = (e) => ({
	x: e?.offsetLeft ?? 0,
	y: e?.offsetTop ?? 0,
	width: e?.offsetWidth ?? 0,
	height: e?.offsetHeight ?? 0
}), zb = (e, t) => Rb(jn(Nb(e), Db(e, t)));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tabs@1.43.3/node_modules/@zag-js/tabs/dist/tabs.connect.mjs
function Bb(e, t) {
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
			let t = Db(o, e);
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
			e && jb(o, e)?.focus();
		},
		getRootProps() {
			return t.element({
				...Cb.root.attrs,
				id: wb(o),
				"data-orientation": a("orientation"),
				"data-focus": Z(c),
				dir: a("dir")
			});
		},
		getListProps() {
			return t.element({
				...Cb.list.attrs,
				id: Tb(o),
				role: "tablist",
				dir: a("dir"),
				"data-focus": Z(c),
				"aria-orientation": a("orientation"),
				"data-orientation": a("orientation"),
				"aria-label": s?.listLabel,
				onKeyDown(e) {
					if (e.defaultPrevented || pt(e) || !et(e.currentTarget, Ct(e))) return;
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
					}[bt(e, {
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
				...Cb.trigger.attrs,
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
				"aria-controls": c.selected ? Eb(o, n) : void 0,
				"data-ownedby": Tb(o),
				"data-ssr": Z(i.get("ssr")),
				id: Db(o, n),
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
					e.defaultPrevented || Je(e) || s || (ct() && e.currentTarget.focus(), r({
						type: "TAB_CLICK",
						value: n
					}));
				}
			});
		},
		getContentProps(e) {
			let { value: n } = e, r = i.get("value") === n;
			return t.element({
				...Cb.content.attrs,
				dir: a("dir"),
				id: Eb(o, n),
				tabIndex: d ? 0 : -1,
				"aria-labelledby": Db(o, n),
				role: "tabpanel",
				"data-ownedby": Tb(o),
				"data-selected": Z(r),
				"data-orientation": a("orientation"),
				hidden: !r
			});
		},
		getIndicatorProps() {
			let e = i.get("indicatorRect"), n = i.get("animateIndicator");
			return t.element({
				id: Ob(o),
				...Cb.indicator.attrs,
				dir: a("dir"),
				"data-orientation": a("orientation"),
				hidden: Vb(e),
				onTransitionEnd(e) {
					Ct(e) === e.currentTarget && r({ type: "INDICATOR_TRANSITION_END" });
				},
				style: {
					"--transition-property": "left, right, top, bottom, width, height",
					"--left": fn(e?.x),
					"--top": fn(e?.y),
					"--width": fn(e?.width),
					"--height": fn(e?.height),
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
var Vb = (e) => e == null || e.width === 0 && e.height === 0 && e.x === 0 && e.y === 0, { createMachine: Hb } = Gt(), Ub = Hb({
	props({ props: e }) {
		return {
			dir: "ltr",
			orientation: "horizontal",
			activationMode: "automatic",
			loopFocus: !0,
			composite: !0,
			navigate(e) {
				Xi(e.node);
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
				Mt(() => {
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
				Mt(() => {
					Pb(e)?.focus();
				});
			},
			focusLastTab({ scope: e }) {
				Mt(() => {
					Fb(e)?.focus();
				});
			},
			focusNextTab({ context: e, prop: t, scope: n, event: r }) {
				let i = r.value ?? e.get("focusedValue");
				if (!i) return;
				let a = Ib(n, {
					value: i,
					loopFocus: t("loopFocus")
				});
				Mt(() => {
					t("composite") ? a?.focus() : a?.dataset.value != null && e.set("focusedValue", a.dataset.value);
				});
			},
			focusPrevTab({ context: e, prop: t, scope: n, event: r }) {
				let i = r.value ?? e.get("focusedValue");
				if (!i) return;
				let a = Lb(n, {
					value: i,
					loopFocus: t("loopFocus")
				});
				Mt(() => {
					t("composite") ? a?.focus() : a?.dataset.value != null && e.set("focusedValue", a.dataset.value);
				});
			},
			syncTabIndex({ context: e, scope: t }) {
				Mt(() => {
					let n = e.get("value");
					if (!n) return;
					let r = Ab(t, n);
					r && (Fn(r).length > 0 ? r.removeAttribute("tabindex") : r.setAttribute("tabindex", "0"));
				});
			},
			cleanupObserver({ refs: e }) {
				let t = e.get("indicatorCleanup");
				t && t();
			},
			setIndicatorRect({ context: e, event: t, scope: n }) {
				let r = t.id ?? e.get("value");
				Mb(n) && r && jb(n, r) && e.set("indicatorRect", zb(n, r));
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
				if (r && r(), !Mb(n)) return;
				let i = () => {
					let t = jb(n, e.get("value"));
					if (!t) return;
					let r = Rb(t);
					e.set("indicatorRect", (e) => Ze(e, r) ? e : r);
				};
				i();
				let a = Nb(n), o = kb(n), s = qt(...a.map((e) => ea.observe(e, i)), ...o ? [ea.observe(o, i)] : []);
				t.set("indicatorCleanup", s);
			},
			navigateIfNeeded({ context: e, prop: t, scope: n }) {
				let r = e.get("value");
				if (!r) return;
				let i = jb(n, r);
				_t(i) && t("navigate")?.({
					value: r,
					node: i,
					href: i.href
				});
			}
		}
	}
}), Wb = (e) => {
	let t = Nt(), n = Ut(), r = G(() => ({
		...rn(e),
		dir: n().dir,
		getRootNode: t().getRootNode
	})), i = zt(Ub, () => B(r)), a = G(() => Bb(i, Et));
	return () => B(a);
}, Gb = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"value"
]);
function Kb(e, t) {
	let n = M();
	I(t, !0);
	let i = O(t, "ref", 15, null), a = O(t, "value", 15), o = W(t, Gb), s = G(() => Rn(o)), c = G(() => f(B(s), 2)), l = G(() => B(c)[0]), u = G(() => B(c)[1]), d = G(() => {
		let e = {
			...B(u),
			value: a()
		};
		return Wt()(e, [
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
	}), p = G(() => f(B(d), 2)), m = G(() => B(p)[0]), h = G(() => B(p)[1]), _ = G(() => ({
		...B(m),
		id: B(m).id ?? n,
		value: a(),
		onValueChange(e) {
			B(m).onValueChange?.(e), a() !== void 0 && a(e.value);
		}
	})), v = Wb(() => B(_)), y = G(() => Q(v().getRootProps(), B(h)));
	return _b(v), Jn(() => B(l)), X(e, q({ as: "div" }, () => B(y), {
		get ref() {
			return i();
		},
		set ref(e) {
			i(e);
		}
	})), g({
		get ref() {
			return i();
		},
		set ref(e = null) {
			i(e), r();
		},
		get value() {
			return a();
		},
		set value(e) {
			a(e), r();
		}
	});
}
N(Kb, {
	ref: {},
	value: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tabs/tabs-trigger.svelte
var qb = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Jb(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, qb), a = G(() => Wt()(i, ["value", "disabled"])), o = G(() => f(B(a), 2)), s = G(() => B(o)[0]), c = G(() => B(o)[1]), l = vb(), u = G(() => Q(l().getTriggerProps(B(s)), B(c)));
	return X(e, q({ as: "button" }, () => B(u), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(Jb, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Tabs.svelte
var Yb = y("<af-tooltip><!></af-tooltip>", 2), Xb = y("<!> <!>", 1), Zb = {
	hash: "svelte-j0chmq",
	code: ":host {display:block;}[data-scope='tabs'][data-part='root'] {display:flex;flex-direction:column;gap:8px;}[data-scope='tabs'][data-part='content'] {flex:1;outline:none;}[data-scope='tabs'][data-part='list'] {border:0 solid var(--k-line);}.af-tabs > af-tooltip {display:flex;flex:1 1 0%;align-self:stretch;}.af-tabs > af-tooltip::part(anchor) {display:flex;flex:1 1 0%;align-items:center;}.af-tabs.segmented > af-tooltip {flex:0 1 auto;}.af-tabs [role='tab'][aria-disabled='true']:disabled {cursor:default;}"
};
function Qb(e, t) {
	I(t, !0), c(e, Zb);
	let a = O(t, "items", 23, () => []), o = O(t, "value", 7, null), s = O(t, "label", 7, null), l = O(t, "variant", 7, "pill"), u = t.$$host, f = we(u), p = G(() => l() === "line" || l() === "segmented" ? l() : "pill"), h = G(() => {
		let e = (a() ?? []).filter((e) => !e.disabled);
		return e.some((e) => e.value === o()) ? null : e[0]?.value ?? null;
	}), _ = (e) => B(h) === null ? void 0 : e.value === B(h) ? 0 : -1, y = (e) => e ? { "aria-description": e } : {};
	var x = {
		get items() {
			return a();
		},
		set items(e = []) {
			a(e), r();
		},
		get value() {
			return o();
		},
		set value(e = null) {
			o(e), r();
		},
		get label() {
			return s();
		},
		set label(e = null) {
			s(e), r();
		},
		get variant() {
			return l();
		},
		set variant(e = "pill") {
			l(e), r();
		}
	}, S = Xb(), k = R(S);
	_e(k, {});
	var ee = P(k, 2);
	return Yt(ee, {
		value: () => u.shadowRoot,
		children: (e, t) => {
			Vc(e, {
				get dir() {
					return f;
				},
				children: (e, t) => {
					var r = D(), c = R(r), l = () => o() ?? null;
					b(c, () => Kb, (e, t) => {
						t(e, {
							get value() {
								return l();
							},
							set value(e) {},
							activationMode: "automatic",
							loopFocus: !0,
							onValueChange: (e) => {
								e.value != null && Ce(u, "tab-change", { value: e.value });
							},
							children: (e, t) => {
								var r = Xb(), o = R(r);
								{
									let e = G(() => s() || void 0);
									b(o, () => Sb, (t, n) => {
										n(t, {
											part: "list",
											get class() {
												return `af-kit af-tabs ${B(p) ?? ""}`;
											},
											get "aria-label"() {
												return B(e);
											},
											children: (e, t) => {
												var n = D(), r = R(n);
												C(r, 17, () => a() ?? [], (e) => e.value, (e, t) => {
													var n = D(), r = R(n), a = (e) => {
														var n = Yb();
														U(() => i(n, "text", B(t).reason));
														var r = V(n);
														{
															let e = G(() => _(B(t))), n = G(() => y(B(t).reason));
															b(r, () => Jb, (r, i) => {
																i(r, q({
																	get value() {
																		return B(t).value;
																	},
																	disabled: !0,
																	part: "tab",
																	get tabindex() {
																		return B(e);
																	}
																}, () => B(n), {
																	children: (e, n) => {
																		m();
																		var r = le();
																		U(() => E(r, B(t).label)), T(e, r);
																	},
																	$$slots: { default: !0 }
																}));
															});
														}
														v(n), T(e, n);
													}, o = (e) => {
														var n = D(), r = R(n);
														{
															let e = G(() => !!B(t).disabled), n = G(() => _(B(t)));
															b(r, () => Jb, (r, i) => {
																i(r, {
																	get value() {
																		return B(t).value;
																	},
																	get disabled() {
																		return B(e);
																	},
																	part: "tab",
																	get tabindex() {
																		return B(n);
																	},
																	children: (e, n) => {
																		m();
																		var r = le();
																		U(() => E(r, B(t).label)), T(e, r);
																	},
																	$$slots: { default: !0 }
																});
															});
														}
														T(e, n);
													};
													w(r, (e) => {
														B(t).disabled && B(t).reason ? e(a) : e(o, -1);
													}), T(e, n);
												}), T(e, n);
											},
											$$slots: { default: !0 }
										});
									});
								}
								var c = P(o, 2);
								C(c, 17, () => a() ?? [], (e) => e.value, (e, t) => {
									var r = D(), i = R(r);
									b(i, () => bb, (e, r) => {
										r(e, {
											get value() {
												return B(t).value;
											},
											part: "panel",
											children: (e, r) => {
												var i = D(), a = R(i);
												d(a, () => "slot", !1, (e, r) => {
													n(e, () => ({ name: B(t).value }));
												}), T(e, i);
											},
											$$slots: { default: !0 }
										});
									}), T(e, r);
								}), T(e, r);
							},
							$$slots: { default: !0 }
						});
					}), T(e, r);
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { default: !0 }
	}), T(e, S), g(x);
}
N(Qb, {
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
var $b = y("<div class=\"state svelte-18matrm\" part=\"state\"><p class=\"lead svelte-18matrm\"> </p></div>"), ex = y("<div class=\"frame svelte-18matrm\" part=\"frame\"><!></div>"), tx = y("<!> <div class=\"af-kit svelte-18matrm\"><!></div>", 1), nx = {
	hash: "svelte-18matrm",
	code: ":host {display:block;}.af-kit.svelte-18matrm {height:100%;}.frame.svelte-18matrm {display:flex;flex-direction:column;gap:8px;box-sizing:border-box;height:100%;min-width:0;padding:12px 16px;border:1px solid var(--k-line);border-radius:var(--k-radius);background:var(--k-surface);font-size:14px;line-height:20px;}.state.svelte-18matrm {padding:16px 0;}.lead.svelte-18matrm {margin:0;font-weight:500;}"
};
function rx(e, t) {
	I(t, !0), c(e, nx);
	let n = O(t, "spec", 7, null), i = O(t, "result", 7, null), a = O(t, "fields", 7, null), o = O(t, "rows", 7, null), s = O(t, "columns", 7, null), l = O(t, "paging", 7, null), u = O(t, "table", 7, null), d = O(t, "drill", 7, !1), f = O(t, "locale", 7, null), p = O(t, "strings", 7, null), m = t.$$host, h = G(() => he(f(), p() ?? void 0)), _ = G(() => n() ? pe(n(), a() ?? void 0) : ""), y = K(null), x = K(!1);
	j(() => {
		let e = !0;
		return import("./chunks/tile-view-DYAzFxha.js").then((t) => {
			e && J(y, t.default);
		}, () => {
			e && J(x, !0);
		}), () => {
			e = !1;
		};
	});
	var S = {
		get spec() {
			return n();
		},
		set spec(e = null) {
			n(e), r();
		},
		get result() {
			return i();
		},
		set result(e = null) {
			i(e), r();
		},
		get fields() {
			return a();
		},
		set fields(e = null) {
			a(e), r();
		},
		get rows() {
			return o();
		},
		set rows(e = null) {
			o(e), r();
		},
		get columns() {
			return s();
		},
		set columns(e = null) {
			s(e), r();
		},
		get paging() {
			return l();
		},
		set paging(e = null) {
			l(e), r();
		},
		get table() {
			return u();
		},
		set table(e = null) {
			u(e), r();
		},
		get drill() {
			return d();
		},
		set drill(e = !1) {
			d(e), r();
		},
		get locale() {
			return f();
		},
		set locale(e = null) {
			f(e), r();
		},
		get strings() {
			return p();
		},
		set strings(e = null) {
			p(e), r();
		}
	}, C = tx(), k = R(C);
	_e(k, {});
	var ee = P(k, 2), te = V(ee), A = (e) => {
		var t = D(), r = R(t);
		{
			let e = G(() => !!d());
			b(r, () => B(y), (t, r) => {
				r(t, {
					get spec() {
						return n();
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
						return B(e);
					},
					get text() {
						return B(h);
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
		T(e, t);
	}, ne = (e) => {
		var t = ex(), n = V(t), r = (e) => {
			var t = $b(), n = V(t), r = F(n, !0);
			v(t), U(() => E(r, B(h).tileLoadFailed)), T(e, t);
		}, i = (e) => {
			Y(e, {
				get title() {
					return B(_);
				},
				get text() {
					return B(h);
				}
			});
		};
		w(n, (e) => {
			B(x) ? e(r) : e(i, -1);
		}), v(t), T(e, t);
	};
	return w(te, (e) => {
		B(y) ? e(A) : e(ne, -1);
	}), v(ee), T(e, C), g(S);
}
N(rx, {
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
var ix = xt("toast").parts("group", "root", "title", "description", "actionTrigger", "closeTrigger").build(), ax = (e) => `toast-group:${e}`, ox = (e, t) => e.getById(`toast-group:${t}`), sx = (e) => `toast:${e.id}`, cx = (e) => e.getById(sx(e)), lx = (e) => `toast:${e.id}:title`, ux = (e) => `toast:${e.id}:description`, dx = (e) => `toast${e.id}:close`, fx = {
	info: 5e3,
	error: 5e3,
	success: 2e3,
	loading: Infinity,
	warning: 5e3,
	DEFAULT: 5e3
};
function px(e, t) {
	return e ?? fx[t] ?? fx.DEFAULT;
}
var mx = (e) => typeof e == "string" ? {
	left: e,
	right: e,
	bottom: e,
	top: e
} : e;
function hx(e, t) {
	let { prop: n, computed: r, context: i } = e, { offsets: a, gap: o } = n("store").attrs, s = i.get("heights"), c = mx(a), l = n("dir") === "rtl", u = t.replace("-start", l ? "-right" : "-left").replace("-end", l ? "-left" : "-right"), d = u.includes("right"), f = u.includes("left"), p = {
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
		zIndex: yt
	}, m = "center";
	return d && (m = "flex-end"), f && (m = "flex-start"), p.alignItems = m, u.includes("top") && (p.top = `max(env(safe-area-inset-top, 0px), ${c.top})`), u.includes("bottom") && (p.bottom = `max(env(safe-area-inset-bottom, 0px), ${c.bottom})`), u.includes("left") || (p.insetInlineEnd = `calc(env(safe-area-inset-right, 0px) + ${c.right})`), u.includes("right") || (p.insetInlineStart = `calc(env(safe-area-inset-left, 0px) + ${c.left})`), p;
}
function gx(e, t) {
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
function _x(e, t) {
	let { computed: n } = e, r = {
		position: "absolute",
		inset: "0",
		scale: "1 2",
		pointerEvents: t ? "none" : "auto"
	};
	return n("frontmost") && !t && ((e) => Object.assign(r, e))({ height: "calc(var(--initial-height) + 80%)" }), r;
}
function vx() {
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
function yx(e, t) {
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
				...ix.group.attrs,
				dir: r("dir"),
				tabIndex: -1,
				role: "region",
				"aria-label": `${s}, ${u} (${l})`,
				id: ax(u),
				"data-placement": u,
				"data-side": d,
				"data-align": f,
				"aria-live": "polite",
				"aria-relevant": "additions text",
				"aria-atomic": "false",
				style: hx(e, u),
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
					a.get("isFocusWithin") && !et(e.currentTarget, e.relatedTarget) && queueMicrotask(() => i({ type: "REGION.BLUR" }));
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
var { guards: bx, createMachine: xx } = Gt(), { and: Sx } = bx, Cx = xx({
	props({ props: e }) {
		return {
			dir: "ltr",
			id: ln(),
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
			ignoreMouseTimer: Ot.create(),
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
				guard: Sx("isOverlapping", "isPointerOut"),
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
				return At(document, "keydown", (n) => {
					let { hotkey: r } = e("store").attrs;
					r.every((e) => n[e] || n.code === e) && t({ type: "DOC.HOTKEY" });
				}, { capture: !0 });
			},
			trackDocumentVisibility({ prop: e, send: t, scope: n }) {
				let { pauseOnPageIdle: r } = e("store").attrs;
				if (!r) return;
				let i = n.getDoc();
				return At(i, "visibilitychange", () => {
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
				let s = Hn(() => ox(r, a), { defer: !0 });
				e.set("dismissableCleanup", s);
			},
			clearDismissableBranch({ refs: e }) {
				e.get("dismissableCleanup")?.();
			},
			focusRegionEl({ scope: e, computed: t }) {
				queueMicrotask(() => {
					ox(e, t("placement"))?.focus();
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
}), wx = { closeTriggerLabel: "Dismiss notification" };
function Tx(e, t) {
	let { state: n, send: r, prop: i, scope: a, context: o, computed: s } = e, c = kt(wx, i("translations")), l = n.hasTag("visible"), u = n.hasTag("paused"), d = o.get("mounted"), f = s("frontmost"), p = i("parent").computed("placement"), m = i("type"), h = i("stacked"), g = i("title"), _ = i("description"), v = i("action"), [y, b = "center"] = p.split("-");
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
				...ix.root.attrs,
				dir: i("dir"),
				id: sx(a),
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
				"aria-describedby": _ ? ux(a) : void 0,
				"aria-labelledby": g ? lx(a) : void 0,
				tabIndex: 0,
				style: gx(e, l),
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
				style: _x(e, l)
			});
		},
		getGhostAfterProps() {
			return t.element({
				"data-ghost": "after",
				style: vx()
			});
		},
		getTitleProps() {
			return t.element({
				...ix.title.attrs,
				id: lx(a)
			});
		},
		getDescriptionProps() {
			return t.element({
				...ix.description.attrs,
				id: ux(a)
			});
		},
		getActionTriggerProps() {
			return t.button({
				...ix.actionTrigger.attrs,
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
				id: dx(a),
				...ix.closeTrigger.attrs,
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
var { not: Ex } = Pt(), Dx = St({
	props({ props: e }) {
		return Bt(e, [
			"id",
			"type",
			"parent",
			"removeDelay"
		], "toast"), {
			closable: !0,
			...e,
			duration: px(e.duration, e.type)
		};
	},
	initialState({ prop: e }) {
		return e("type") === "loading" || e("duration") === Infinity ? "visible:persist" : "visible";
	},
	context({ prop: e, bindable: t }) {
		return {
			remainingTime: t(() => ({ defaultValue: px(e("duration"), e("type")) })),
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
					guard: Ex("isLoadingType"),
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
				return qr(() => {
					t({
						type: "REMOVE",
						src: "timer"
					});
				}, e("removeDelay"));
			},
			waitForDuration({ send: e, context: t, computed: n }) {
				if (!n("shouldPersist")) return qr(() => {
					e({
						type: "DISMISS",
						src: "timer"
					});
				}, t.get("remainingTime"));
			},
			waitForNextTick({ send: e }) {
				return qr(() => {
					e({
						type: "SHOW",
						src: "timer"
					});
				}, 0);
			},
			trackHeight({ scope: e, prop: t }) {
				let n;
				return Mt(() => {
					let r = cx(e);
					if (!r) return;
					let i = new (e.getWin()).MutationObserver(() => {
						let e = Ox(r), n = {
							id: t("id"),
							height: e
						};
						kx(t("parent"), n);
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
				Mt(() => {
					e.set("mounted", !0);
				});
			},
			measureHeight({ scope: e, prop: t, context: n }) {
				queueMicrotask(() => {
					let r = cx(e);
					if (!r) return;
					let i = Ox(r);
					n.set("initialHeight", i);
					let a = {
						id: t("id"),
						height: i
					};
					kx(t("parent"), a);
				});
			},
			setCloseTimer({ refs: e }) {
				e.set("closeTimerStartTime", Date.now());
			},
			resetCloseTimer({ context: e, refs: t, prop: n }) {
				t.set("closeTimerStartTime", Date.now()), e.set("remainingTime", px(n("duration"), n("type")));
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
function Ox(e) {
	let t = e.style.height;
	e.style.height = "auto";
	let n = e.offsetHeight;
	return e.style.height = t, n;
}
function kx(e, t) {
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
var Ax = (e, t) => ({
	...t,
	...Dt(e)
}), jx = {
	error: [1, 2],
	warning: [3, 6],
	loading: [4, 5],
	success: [5, 7],
	info: [6, 8]
}, Mx = "info", Nx = (e, t) => {
	let [n, r] = jx[e ?? Mx];
	return t ? n : r;
}, Px = (e) => e.sort((e, t) => (e.priority ?? Nx(e.type, !!e.action)) - (t.priority ?? Nx(t.type, !!t.action)));
function Fx(e = {}) {
	let t = Ax(e, {
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
		for (a = Px(a); a.length > 0 && r.length < t.max;) {
			let e = a.shift();
			e && (s(e), r.unshift(e));
		}
	}, u = (e) => {
		let n = e.id ?? `toast:${ln()}`, a = r.find((e) => e.id === n);
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
				type: Mx,
				...e,
				stacked: !t.overlap,
				gap: t.gap
			}, i = r.priority ?? Nx(r.type, !!r.action);
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
				tn("[zag-js > toast] toaster.promise() requires at least a 'loading' option to be specified");
				return;
			}
			let r = u({
				...n,
				...t.loading,
				promise: e,
				type: "loading"
			}), i = !0, a, o = rn(e).then(async (e) => {
				if (a = ["resolve", e], Ix(e) && !e.ok) {
					i = !1;
					let a = rn(t.error, `HTTP Error! status: ${e.status}`);
					u({
						...n,
						...a,
						id: r,
						type: "error"
					});
				} else if (t.success !== void 0) {
					i = !1;
					let a = rn(t.success, e);
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
					let a = rn(t.error, e);
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
var Ix = (e) => e && typeof e == "object" && "ok" in e && typeof e.ok == "boolean" && "status" in e && typeof e.status == "number", Lx = {
	connect: yx,
	machine: Cx
}, Rx = (e) => Fx(e), [zx, Bx] = Zt({
	name: "ToastContext",
	hookName: "useToastContext",
	providerName: "<ToastProvider />"
}), Vx = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Hx(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, Vx), a = Bx(), o = G(() => Q(a().getActionTriggerProps(), i));
	return X(e, q({ as: "button" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(Hx, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toast-close-trigger.svelte
var Ux = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Wx(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, Ux), a = Bx(), o = G(() => Q(a().getCloseTriggerProps(), i));
	return X(e, q({ as: "button" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(Wx, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toast-description.svelte
var Gx = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Kx(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, Gx), a = Bx(), o = G(() => Q(a().getDescriptionProps(), i));
	return X(e, q({ as: "div" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(Kx, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toast-root.svelte
var qx = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]), Jx = y("<div></div> <!> <div></div>", 1);
function Yx(e, t) {
	I(t, !0);
	let i = O(t, "ref", 15, null), a = W(t, qx), o = Bx(), s = G(() => Q(o().getRootProps(), a));
	return X(e, q({ as: "div" }, () => B(s), {
		get ref() {
			return i();
		},
		set ref(e) {
			i(e);
		},
		children: (e, r) => {
			var i = Jx(), a = R(i);
			n(a, (e) => ({ ...e }), [() => o().getGhostBeforeProps()]);
			var s = P(a, 2);
			u(s, () => t.children ?? l);
			var c = P(s, 2);
			n(c, (e) => ({ ...e }), [() => o().getGhostAfterProps()]), T(e, i);
		},
		$$slots: { default: !0 }
	})), g({
		get ref() {
			return i();
		},
		set ref(e = null) {
			i(e), r();
		}
	});
}
N(Yx, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toaster-item.svelte
function Xx(e, t) {
	I(t, !0);
	let n = O(t, "children", 7), i = O(t, "value", 7), a = O(t, "parent", 7), o = O(t, "index", 7), s = Nt(), c = G(() => ({
		...i()(),
		parent: a(),
		index: o(),
		getRootNode: s().getRootNode
	})), l = zt(Dx, () => B(c)), d = G(() => Tx(l, Et));
	zx(() => B(d));
	var f = {
		get children() {
			return n();
		},
		set children(e) {
			n(e), r();
		},
		get value() {
			return i();
		},
		set value(e) {
			i(e), r();
		},
		get parent() {
			return a();
		},
		set parent(e) {
			a(e), r();
		},
		get index() {
			return o();
		},
		set index(e) {
			o(e), r();
		}
	}, p = D(), m = R(p);
	return u(m, n, i), T(e, p), g(f);
}
N(Xx, {
	children: {},
	value: {},
	parent: {},
	index: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toaster.svelte
var Zx = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"toaster",
	"children"
]);
function Qx(e, t) {
	let n = M();
	I(t, !0);
	let i = O(t, "ref", 15, null), a = O(t, "toaster", 7), o = O(t, "children", 7), s = W(t, Zx), c = Ut(), l = Nt(), d = G(() => ({
		store: a(),
		id: n,
		dir: c().dir,
		getRootNode: l().getRootNode
	})), f = zt(Lx.machine, () => B(d)), p = G(() => Lx.connect(f, Et)), m = G(() => B(p).getToasts()), h = G(() => Q(B(p).getGroupProps(), s));
	return X(e, q({ as: "div" }, () => B(h), {
		get ref() {
			return i();
		},
		set ref(e) {
			i(e);
		},
		children: (e, t) => {
			var n = D(), r = R(n);
			C(r, 19, () => B(m), (e) => e.id, (e, t, n, r) => {
				let i = G(() => () => B(t));
				Xx(e, {
					value: B(i),
					get parent() {
						return f;
					},
					get index() {
						return B(n);
					},
					children: (e, t) => {
						var n = D(), r = R(n);
						u(r, o, () => B(i)), T(e, n);
					},
					$$slots: { default: !0 }
				});
			}), T(e, n);
		},
		$$slots: { default: !0 }
	})), g({
		get ref() {
			return i();
		},
		set ref(e = null) {
			i(e), r();
		},
		get toaster() {
			return a();
		},
		set toaster(e) {
			a(e), r();
		},
		get children() {
			return o();
		},
		set children(e) {
			o(e), r();
		}
	});
}
N(Qx, {
	ref: {},
	toaster: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/Toast.svelte
var $x = /* @__PURE__ */ new WeakMap();
function eS(e) {
	let t = $x.get(e);
	return t || $x.set(e, t = Rx({
		placement: "bottom-end",
		overlap: !1,
		gap: 8,
		hotkey: ["af-kit-no-hotkey"]
	})), t;
}
function tS(e, t) {
	return e.create({
		type: t.kind,
		description: t.text,
		duration: t.kind === "error" ? t.action ? Infinity : 8e3 : 4e3,
		meta: { action: t.action ?? null }
	});
}
var nS = y("<p> </p>"), rS = e("<path d=\"m15 9-6 6\"></path><path d=\"M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z\"></path><path d=\"m9 9 6 6\"></path>", 1), iS = e("<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"m9 12 2 2 4-4\"></path>", 1), aS = e("<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 16v-4\"></path><path d=\"M12 8h.01\"></path>", 1), oS = e("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-e495ij\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg>"), sS = e("<svg part=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-e495ij\"><!></svg><!><!><!>", 1), cS = y("<div class=\"af-kit svelte-e495ij\"><div class=\"live svelte-e495ij\" role=\"status\"></div> <div class=\"live svelte-e495ij\" role=\"alert\"></div> <div class=\"region svelte-e495ij\" popover=\"manual\"><!></div></div>"), lS = y("<!> <!>", 1), uS = {
	hash: "svelte-e495ij",
	code: ":host {display:contents;}.af-kit.svelte-e495ij {display:contents;}.live.svelte-e495ij {position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;}.region[popover].svelte-e495ij {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;pointer-events:none;}[data-scope='toast'][data-part='root'] {--k-toast-tone: var(--k-info);--k-toast-bg: 6%;--k-toast-bg-dark: 0%;--k-toast-edge: 14%;--k-toast-edge-dark: 19%;--k-toast-ink: 100%;--k-toast-ink-dark: 100%;--k-toast-ground: color-mix(in oklab, color-mix(in oklab, var(--k-toast-tone) var(--k-toast-bg-dark), var(--k-bg)) calc(var(--k-dark, 0) * 100%),\n      color-mix(in oklab, var(--k-toast-tone) var(--k-toast-bg), var(--k-popover)));--k-toast-line: color-mix(in oklab, color-mix(in oklab, var(--k-toast-tone) var(--k-toast-edge-dark), var(--k-bg)) calc(var(--k-dark, 0) * 100%),\n      color-mix(in oklab, var(--k-toast-tone) var(--k-toast-edge), var(--k-popover)));--k-toast-text: color-mix(in oklab, color-mix(in oklab, var(--k-toast-tone) var(--k-toast-ink-dark), var(--k-fg)) calc(var(--k-dark, 0) * 100%),\n      color-mix(in oklab, var(--k-toast-tone) var(--k-toast-ink), var(--k-fg)));position:relative;display:flex;align-items:center;gap:6px;width:min(356px, calc(100vw - 32px));padding:16px;box-sizing:border-box;border-color:var(--k-toast-line);border-radius:var(--k-radius);background-color:var(--k-toast-ground);color:var(--k-toast-text);box-shadow:0 4px 12px rgb(0 0 0 / 0.1);outline:none;font-size:13px;line-height:1.5;translate:var(--x) var(--y);scale:var(--scale, 1);z-index:var(--z-index);opacity:var(--opacity);will-change:translate, opacity, scale;transition:translate 400ms cubic-bezier(0.21, 1.02, 0.73, 1), scale 400ms cubic-bezier(0.21, 1.02, 0.73, 1), opacity 400ms cubic-bezier(0.21, 1.02, 0.73, 1);}[data-scope='toast'][data-part='root'][data-state='closed'] {transition:translate 400ms cubic-bezier(0.06, 0.71, 0.55, 1), scale 400ms cubic-bezier(0.06, 0.71, 0.55, 1), opacity 200ms cubic-bezier(0.06, 0.71, 0.55, 1);}[data-scope='toast'][data-part='root']:focus-visible {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring), 0 4px 12px rgb(0 0 0 / 0.1);}[data-scope='toast'][data-part='root'][data-type='error'] {--k-toast-tone: var(--k-danger);--k-toast-bg: 7%;--k-toast-bg-dark: 5%;--k-toast-edge: 14%;--k-toast-edge-dark: 16%;--k-toast-ink: 100%;--k-toast-ink-dark: 56%;}[data-scope='toast'][data-part='root'][data-type='success'] {--k-toast-tone: var(--k-success);--k-toast-bg: 7%;--k-toast-bg-dark: 0%;--k-toast-edge: 22%;--k-toast-edge-dark: 16%;--k-toast-ink: 67%;--k-toast-ink-dark: 55%;}[part='icon'].svelte-e495ij {flex:none;width:16px;height:16px;margin-inline:-4px 5px;color:inherit;}[data-scope='toast'][data-part='description'] {flex:1;min-width:0;font-weight:500;overflow-wrap:anywhere;}[data-scope='toast'][data-part='action-trigger'] {display:flex;flex:none;align-items:center;height:24px;margin-left:auto;padding:0 8px;border:none;border-radius:4px;background-color:var(--k-popover-fg);color:var(--k-popover);outline:none;font:inherit;font-size:12px;font-weight:500;cursor:pointer;transition:opacity 400ms, box-shadow 200ms;}[data-scope='toast'][data-part='action-trigger']:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[data-scope='toast'][data-part='close-trigger'] {position:absolute;top:0;left:0;z-index:1;display:flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:1px solid var(--k-toast-line);border-radius:50%;background-color:var(--k-toast-ground);color:var(--k-toast-text);transform:translate(-35%, -35%);outline:none;cursor:pointer;transition:opacity 100ms, background 200ms, border-color 200ms;}[data-scope='toast'][data-part='close-trigger'] svg.svelte-e495ij {width:12px;height:12px;pointer-events:none;}[data-scope='toast'][data-part='close-trigger']:focus-visible {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring);}\n  @media (forced-colors: active) {[data-scope='toast'][data-part='root']:focus-visible, [data-scope='toast'][data-part='action-trigger']:focus-visible,\n    [data-scope='toast'][data-part='close-trigger']:focus-visible {outline:2px solid;outline-offset:2px;}\n  }\n  @media (prefers-reduced-motion: reduce) {[data-scope='toast'][data-part='root'], [data-scope='toast'][data-part='root'][data-state='closed'] {transition:none;}\n  }"
};
function dS(e, t) {
	I(t, !0), c(e, uS);
	let n = O(t, "locale", 7, null), i = O(t, "strings", 7, null), a = t.$$host, o = G(() => he(n(), i() ?? void 0)), s = eS(a), u = K(null), d = K(0), f = K(k([])), p = () => queueMicrotask(() => {
		let e = s.getVisibleToasts();
		J(d, e.length, !0), J(f, e.map((e) => ({
			id: e.id,
			error: e.type === "error",
			text: String(e.description ?? "")
		})), !0);
	});
	j(() => (p(), s.subscribe(p))), j(() => De(B(u), B(d) > 0, a));
	var h = {
		get locale() {
			return n();
		},
		set locale(e = null) {
			n(e), r();
		},
		get strings() {
			return i();
		},
		set strings(e = null) {
			i(e), r();
		}
	}, _ = lS(), y = R(_);
	_e(y, {});
	var x = P(y, 2);
	return Yt(x, {
		value: () => a.shadowRoot,
		children: (e, t) => {
			var n = cS(), r = V(n);
			C(r, 21, () => B(f).filter((e) => !e.error), (e) => e.id, (e, t) => {
				var n = nS(), r = F(n, !0);
				U(() => E(r, B(t).text)), T(e, n);
			}), v(r);
			var i = P(r, 2);
			C(i, 21, () => B(f).filter((e) => e.error), (e) => e.id, (e, t) => {
				var n = nS(), r = F(n, !0);
				U(() => E(r, B(t).text)), T(e, n);
			}), v(i);
			var c = P(i, 2);
			Qx(V(c), {
				get toaster() {
					return s;
				},
				get "aria-label"() {
					return B(o).notifications;
				},
				"aria-live": "off",
				children: (e, t = l) => {
					let n = G(() => t()().meta?.action);
					var r = D(), i = R(r);
					b(i, () => Yx, (e, r) => {
						r(e, {
							part: "toast",
							class: "af-overlay",
							"aria-live": "off",
							children: (e, r) => {
								var i = sS(), s = R(i), c = V(s), l = (e) => {
									var t = rS();
									m(2), T(e, t);
								}, u = G(() => t()().type === "error"), d = (e) => {
									var t = iS();
									m(), T(e, t);
								}, f = G(() => t()().type === "success"), p = (e) => {
									var t = aS();
									m(2), T(e, t);
								};
								w(c, (e) => {
									B(u) ? e(l) : B(f) ? e(d, 1) : e(p, -1);
								}), v(s);
								var h = P(s);
								b(h, () => Kx, (e, n) => {
									n(e, {
										part: "text",
										children: (e, n) => {
											m();
											var r = le();
											U((e) => E(r, e), [() => t()().description]), T(e, r);
										},
										$$slots: { default: !0 }
									});
								});
								var g = P(h), _ = (e) => {
									var r = D(), i = R(r);
									b(i, () => Hx, (e, r) => {
										r(e, {
											part: "action",
											onclick: () => Ce(a, "action", {
												toast: t()().id,
												action: B(n).id
											}),
											children: (e, t) => {
												m();
												var r = le();
												U(() => E(r, B(n).label)), T(e, r);
											},
											$$slots: { default: !0 }
										});
									}), T(e, r);
								};
								w(g, (e) => {
									B(n) && e(_);
								});
								var y = P(g);
								b(y, () => Wx, (e, t) => {
									t(e, {
										part: "close",
										get "aria-label"() {
											return B(o).close;
										},
										children: (e, t) => {
											var n = oS();
											T(e, n);
										},
										$$slots: { default: !0 }
									});
								}), T(e, i);
							},
							$$slots: { default: !0 }
						});
					}), T(e, r);
				},
				$$slots: { default: !0 }
			}), v(c), te(c, (e) => J(u, e), () => B(u)), v(n), T(e, n);
		},
		$$slots: { default: !0 }
	}), T(e, _), g(h);
}
N(dS, {
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, [], [], { mode: "open" }, (e) => class extends e {
	show(e) {
		return tS(eS(this), e);
	}
	dismiss(e) {
		eS(this).dismiss(e);
	}
});
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/use-tooltip-context.js
var [fS, pS] = Zt({ name: "TooltipContext" }), mS = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function hS(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, mS), a = pS(), o = G(() => Q(a().getArrowProps(), i));
	return X(e, q({ as: "div" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(hS, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/tooltip-arrow-tip.svelte
var gS = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function _S(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, gS), a = pS(), o = G(() => Q(a().getArrowTipProps(), i));
	return X(e, q({ as: "div" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(_S, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/tooltip-content.svelte
var vS = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function yS(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, vS), a = pS(), s = qn(), c = G(() => Q(a().getContentProps(), s().getPresenceProps(), i));
	function l(e) {
		s().setNode(e);
	}
	var u = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	}, d = D(), f = R(d), p = (e) => {
		X(e, q({ as: "div" }, () => B(c), {
			[o()]: l,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, m = G(() => !s().unmounted);
	return w(f, (e) => {
		B(m) && e(p);
	}), T(e, d), g(u);
}
N(yS, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/tooltip-context.svelte
function bS(e, t) {
	I(t, !0);
	let n = O(t, "render", 7), i = pS();
	var a = {
		get render() {
			return n();
		},
		set render(e) {
			n(e), r();
		}
	}, o = D(), s = R(o);
	return u(s, () => n() ?? l, () => i), T(e, o), g(a);
}
N(bS, { render: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/tooltip-positioner.svelte
var xS = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function SS(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, xS), a = pS(), o = qn(), s = G(() => Q(a().getPositionerProps(), i));
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	}, l = D(), u = R(l), d = (e) => {
		X(e, q({ as: "div" }, () => B(s), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = G(() => !o().unmounted);
	return w(u, (e) => {
		B(f) && e(d);
	}), T(e, l), g(c);
}
N(SS, { ref: {} }, [], [], { mode: "open" });
var CS = xt("tooltip").parts("trigger", "arrow", "arrowTip", "positioner", "content").build(), wS = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `tooltip:${e.id}:trigger:${t}` : `tooltip:${e.id}:trigger` : qe(n) ? n(t) : n;
}, TS = (e) => e.ids?.content ?? `tooltip:${e.id}:content`, ES = (e) => e.ids?.arrow ?? `tooltip:${e.id}:arrow`, DS = (e) => e.ids?.positioner ?? `tooltip:${e.id}:popper`, OS = (e) => e.getById(wS(e)), kS = (e) => e.getById(DS(e)), AS = (e) => Pn(e.getRootNode(), `[data-scope="tooltip"][data-part="trigger"]${en(e.id)}`), jS = (e, t) => t == null ? OS(e) ?? AS(e)[0] : e.getById(wS(e, t)), MS = Ur({
	id: null,
	prevId: null,
	instant: !1
});
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tooltip@1.43.3/node_modules/@zag-js/tooltip/dist/tooltip.connect.mjs
function NS(e, t) {
	let { state: n, context: r, send: i, scope: a, prop: o, event: s } = e, c = o("id"), l = !!o("aria-label"), u = n.matches("open", "closing"), d = r.get("triggerValue"), f = r.get("currentPlacement"), p = f ? Me(f) : void 0, m = TS(a), h = o("disabled"), g = Fe({
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
			let { value: n } = e, r = n != null && d === n, s = wS(a, n);
			return t.button({
				...CS.trigger.attrs,
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
					e.defaultPrevented || h || za() && i({
						type: u && n != null && !r ? "triggerValue.set" : "open",
						src: "trigger.focus",
						value: n,
						triggerId: s
					});
				},
				onBlur(e) {
					e.defaultPrevented || h || c === MS.get("id") && ((e.relatedTarget ?? a.getDoc().activeElement)?.closest(en(a.id)) ?? i({
						type: "close",
						src: "trigger.blur",
						value: n,
						triggerId: s
					}));
				},
				onPointerDown(e) {
					e.defaultPrevented || h || ht(e) && o("closeOnPointerDown") && c === MS.get("id") && i({
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
				id: ES(a),
				...CS.arrow.attrs,
				dir: o("dir"),
				style: g.arrow
			});
		},
		getArrowTipProps() {
			return t.element({
				...CS.arrowTip.attrs,
				dir: o("dir"),
				style: g.arrowTip
			});
		},
		getPositionerProps() {
			return t.element({
				id: DS(a),
				...CS.positioner.attrs,
				dir: o("dir"),
				style: g.floating
			});
		},
		getContentProps() {
			let e = MS.get("id") === c, n = MS.get("prevId") === c, r = MS.get("instant") && (u && e || n);
			return t.element({
				...CS.content.attrs,
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
var { and: PS, not: FS } = Pt(), IS = St({
	initialState: ({ prop: e }) => e("open") || e("defaultOpen") ? "open" : "closed",
	props({ props: e }) {
		Bt(e, ["id"]);
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
					triggerElement: jS(n, e)
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
					guard: PS("noVisibleTooltip", FS("hasPointerMoveOpened")),
					target: "opening",
					actions: ["setTriggerValue"]
				}, {
					guard: FS("hasPointerMoveOpened"),
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
			noVisibleTooltip: () => MS.get("id") === null,
			isVisible: ({ prop: e }) => e("id") === MS.get("id"),
			isInteractive: ({ prop: e }) => !!e("interactive"),
			hasPointerMoveOpened: ({ context: e }) => !!e.get("hasPointerMoveOpened"),
			isOpenControlled: ({ prop: e }) => e("open") !== void 0
		},
		actions: {
			setGlobalId: ({ prop: e }) => {
				let t = MS.get("id"), n = t !== null && t !== e("id");
				MS.update({
					id: e("id"),
					prevId: n ? t : null,
					instant: n
				});
			},
			clearGlobalId: ({ prop: e }) => {
				e("id") === MS.get("id") && MS.update({
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
				t.type === "positioning.set" && Ae(() => jS(r, e.get("triggerValue")), () => kS(r), {
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
				return Ae(() => jS(r, i), () => kS(r), {
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
			trackFocusVisible: ({ scope: e }) => Ba({ root: e.getRootNode?.() }),
			trackPositioning: ({ context: e, prop: t, scope: n }) => (e.get("currentPlacement") || e.set("currentPlacement", t("positioning").placement), Ae(() => jS(n, e.get("triggerValue")), () => kS(n), {
				...t("positioning"),
				defer: !0,
				onComplete(t) {
					e.set("currentPlacement", t.placement);
				}
			})),
			trackPointerlockChange: ({ send: e, scope: t }) => {
				let n = t.getDoc();
				return At(n, "pointerlockchange", () => e({
					type: "close",
					src: "pointerlock:change"
				}), !1);
			},
			trackScroll: ({ send: e, prop: t, scope: n, context: r }) => {
				if (!t("closeOnScroll")) return;
				let i = jS(n, r.get("triggerValue"));
				if (!i) return;
				let a = Kn(i).map((t) => At(t, "scroll", () => {
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
					n = MS.subscribe(() => {
						MS.get("id") !== e("id") && t({
							type: "close",
							src: "id.change"
						});
					});
				}), () => n?.();
			},
			trackEscapeKey: ({ send: e, prop: t }) => t("closeOnEscape") ? At(document, "keydown", (t) => {
				pt(t) || t.key === "Escape" && (t.stopPropagation(), e({
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
}), LS = (e) => {
	let t = Nt(), n = Ut(), r = G(() => {
		let r = rn(e);
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = zt(IS, () => B(r)), a = G(() => NS(i, Et));
	return () => B(a);
}, RS = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open"
]);
function zS(e, t) {
	let n = M();
	I(t, !0);
	let i = O(t, "open", 15), o = W(t, RS), s = G(() => Ln(o)), c = G(() => f(B(s), 2)), d = G(() => B(c)[0]), p = G(() => B(c)[1]), m = G(() => B(p).children), h = G(() => a(B(p), ["children"])), _ = G(() => ({
		...B(h),
		id: n,
		onOpenChange(e) {
			B(h).onOpenChange?.(e), i() !== void 0 && i(e.open);
		}
	})), v = LS(() => B(_)), y = G(() => ({
		...B(d),
		present: v().open
	})), b = Un(() => B(y));
	fS(v), Gn(b);
	var x = {
		get open() {
			return i();
		},
		set open(e) {
			i(e), r();
		}
	}, S = D(), C = R(S);
	return u(C, () => B(m) ?? l), T(e, S), g(x);
}
N(zS, { open: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/tooltip-trigger.svelte
var BS = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function VS(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, BS), a = G(() => Wt()(i, ["value"])), o = G(() => f(B(a), 2)), s = G(() => B(o)[0]), c = G(() => B(o)[1]), l = pS(), u = G(() => Q(l().getTriggerProps(B(s)), B(c)));
	return X(e, q({ as: "button" }, () => B(u), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(VS, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Tooltip.svelte
var HS = y("<span><!></span>"), US = y("<!> <!>", 1), WS = {
	hash: "svelte-1cq81kb",
	code: ":host {display:inline-block;}[part='anchor'].svelte-1cq81kb {display:block;}[data-scope='tooltip'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='tooltip'][data-part='arrow'] {--arrow-size: 10px;--arrow-background: var(--k-fg);--arrow-offset: calc(var(--arrow-size-half) * -1 - 2px) !important;}[data-scope='tooltip'][data-part='arrow-tip'] {border-radius:2px;}[data-scope='tooltip'][data-part='content'] {width:fit-content;max-width:280px;padding:6px 12px;border:0 solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:var(--k-fg);color:var(--k-bg);box-shadow:none;font-size:12px;line-height:16px;text-wrap:balance;overflow-wrap:anywhere;}"
};
function GS(e, t) {
	I(t, !0), c(e, WS);
	let i = O(t, "text", 7, ""), a = t.$$host, o = K(!1), s = K(null), u = !1;
	j(() => De(B(s), B(o), a));
	let d = (e) => (t) => ee(t, "keydown", (t) => {
		t.key === "Escape" && e().open && e().setOpen(!1);
	});
	function f(e) {
		let t = u;
		u = !1, t || e().setOpen(!0);
	}
	function p(e, t, n) {
		let r = t.relatedTarget;
		r && (a.contains(r) || n instanceof Node && n.contains(r)) || e().setOpen(!1);
	}
	var h = {
		get text() {
			return i();
		},
		set text(e = "") {
			i(e), r();
		}
	}, y = D(), x = R(y), S = (e) => {
		var r = US(), c = R(r);
		_e(c, {});
		var h = P(c, 2);
		Yt(h, {
			value: () => a.shadowRoot,
			children: (e, r) => {
				var a = D(), c = R(a);
				b(c, () => zS, (e, r) => {
					r(e, {
						openDelay: 300,
						closeDelay: 0,
						closeOnEscape: !1,
						positioning: {
							strategy: "fixed",
							gutter: 5
						},
						get open() {
							return B(o);
						},
						set open(e) {
							J(o, e, !0);
						},
						children: (e, r) => {
							var a = US(), o = R(a);
							{
								let e = (e, r = l) => {
									var i = D(), a = R(i);
									{
										let e = (e, i = l) => {
											var a = HS();
											n(a, (e) => ({
												part: "anchor",
												...e
											}), [() => i()()], void 0, void 0, "svelte-1cq81kb");
											var o = V(a);
											fe(o, t, "default", {}, null), v(a), _(a, () => d(r())), T(e, a);
										};
										b(a, () => VS, (t, n) => {
											n(t, {
												onfocusin: () => f(r()),
												onfocusout: (e) => p(r(), e, e.currentTarget),
												onpointerdown: () => u = !0,
												onpointerleave: () => u = !1,
												asChild: e,
												$$slots: { asChild: !0 }
											});
										});
									}
									T(e, i);
								};
								b(o, () => bS, (t, n) => {
									n(t, {
										render: e,
										$$slots: { render: !0 }
									});
								});
							}
							var c = P(o, 2);
							b(c, () => SS, (e, t) => {
								t(e, {
									popover: "manual",
									class: "af-kit",
									get ref() {
										return B(s);
									},
									set ref(e) {
										J(s, e, !0);
									},
									children: (e, t) => {
										var n = US(), r = R(n);
										b(r, () => hS, (e, t) => {
											t(e, {
												part: "arrow",
												children: (e, t) => {
													var n = D(), r = R(n);
													b(r, () => _S, (e, t) => {
														t(e, {});
													}), T(e, n);
												},
												$$slots: { default: !0 }
											});
										});
										var a = P(r, 2);
										b(a, () => yS, (e, t) => {
											t(e, {
												class: "af-overlay tooltip",
												children: (e, t) => {
													m();
													var n = le();
													U(() => E(n, i())), T(e, n);
												},
												$$slots: { default: !0 }
											});
										}), T(e, n);
									},
									$$slots: { default: !0 }
								});
							}), T(e, a);
						},
						$$slots: { default: !0 }
					});
				}), T(e, a);
			},
			$$slots: { default: !0 }
		}), T(e, r);
	}, C = (e) => {
		var n = D(), r = R(n);
		fe(r, t, "default", {}, null), T(e, n);
	};
	return w(x, (e) => {
		i() ? e(S) : e(C, -1);
	}), T(e, y), g(h);
}
N(GS, {
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
var [KS, qS] = Zt({ name: "CollapsibleContext" }), JS = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function YS(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, JS), a = qS(), o = G(() => Q(a().getContentProps(), i));
	var s = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	}, c = D(), l = R(c), u = (e) => {
		X(e, q({ as: "div" }, () => B(o), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, d = G(() => !a().isUnmounted);
	return w(l, (e) => {
		B(d) && e(u);
	}), T(e, c), g(s);
}
N(YS, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/collapsible/split-collapsible-props.svelte.js
var XS = Wt(), ZS = (e) => XS(e, [
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
]), QS = xt("collapsible").parts("root", "trigger", "content", "indicator").build(), $S = (e) => e.ids?.root ?? `collapsible:${e.id}`, eC = (e) => e.ids?.content ?? `collapsible:${e.id}:content`, tC = (e) => e.ids?.trigger ?? `collapsible:${e.id}:trigger`, nC = (e) => e.getById(eC(e));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+collapsible@1.43.3/node_modules/@zag-js/collapsible/dist/collapsible.connect.mjs
function rC(e, t) {
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
				...QS.root.attrs,
				"data-state": c ? "open" : "closed",
				dir: o("dir"),
				id: $S(a)
			});
		},
		getContentProps() {
			return t.element({
				...QS.content.attrs,
				id: eC(a),
				"data-collapsible": "",
				"data-state": v ? void 0 : c ? "open" : "closed",
				"data-disabled": Z(f),
				"data-has-collapsed-size": Z(_),
				hidden: !s && !_,
				dir: o("dir"),
				style: {
					"--height": fn(d),
					"--width": fn(u),
					"--collapsed-height": fn(p),
					"--collapsed-width": fn(m),
					...l && h && {
						overflow: "hidden",
						minHeight: fn(p),
						maxHeight: fn(p)
					},
					...l && g && {
						overflow: "hidden",
						minWidth: fn(m),
						maxWidth: fn(m)
					}
				}
			});
		},
		getTriggerProps() {
			return t.element({
				...QS.trigger.attrs,
				id: tC(a),
				dir: o("dir"),
				type: "button",
				"data-state": c ? "open" : "closed",
				"data-disabled": Z(f),
				"aria-controls": eC(a),
				"aria-expanded": s || !1,
				onClick(e) {
					e.defaultPrevented || f || r({ type: c ? "close" : "open" });
				}
			});
		},
		getIndicatorProps() {
			return t.element({
				...QS.indicator.attrs,
				dir: o("dir"),
				"data-state": c ? "open" : "closed",
				"data-disabled": Z(f)
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+collapsible@1.43.3/node_modules/@zag-js/collapsible/dist/collapsible.machine.mjs
var iC = St({
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
				let n, r = Mt(() => {
					let r = nC(t);
					if (!r) return;
					let i = Dn(r).animationName;
					if (!i || i === "none") {
						e({ type: "animation.end" });
						return;
					}
					let a = (t) => {
						Ct(t) === r && e({ type: "animation.end" });
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
				let n, r = Mt(() => {
					let r = nC(t);
					if (!r) return;
					let i = Dn(r).animationName;
					if (!i || i === "none") {
						e({ type: "animation.end" });
						return;
					}
					let a = (t) => {
						Ct(t) === r && e({ type: "animation.end" });
					};
					r.addEventListener("animationend", a);
					let o = An(r, { animationFillMode: "forwards" });
					n = () => {
						r.removeEventListener("animationend", a), Kt(() => o());
					};
				});
				return () => {
					r(), n?.();
				};
			},
			trackTabbableElements: ({ scope: e, prop: t }) => {
				if (!t("collapsedHeight") && !t("collapsedWidth")) return;
				let n = nC(e);
				if (!n) return;
				let r = () => {
					let e = Yn(n).map((e) => Nn(e, "inert", ""));
					return () => {
						e.forEach((e) => e());
					};
				}, i = r(), a = Yi(n, { callback() {
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
				let n = nC(t);
				if (!n) return;
				let { height: r, width: i } = n.getBoundingClientRect();
				e.set("size", {
					height: r,
					width: i
				});
			},
			computeSize: ({ refs: e, scope: t, context: n }) => {
				e.get("cleanup")?.();
				let r = Mt(() => {
					let e = nC(t);
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
}), aC = (e) => {
	let t = Nt(), n = Ut(), r = K(!1), i = G(() => {
		let { lazyMount: r, unmountOnExit: i, onExitComplete: a, ...o } = rn(e) || {};
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...o
		};
	}), a = zt(iC, () => B(i)), o = G(() => rC(a, Et)), s = G(() => rn(e));
	j(() => {
		B(o).visible && J(r, !0);
	});
	let c = G(() => {
		let { lazyMount: e, unmountOnExit: t } = B(s) || {};
		return !B(o).visible && !B(r) && e || t && !B(o).visible && B(r);
	});
	return () => ({
		...B(o),
		isUnmounted: !!B(c)
	});
}, oC = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"open"
]);
function sC(e, t) {
	let n = M();
	I(t, !0);
	let i = O(t, "ref", 15, null), a = O(t, "open", 15), o = W(t, oC), s = G(() => ZS(o)), c = G(() => f(B(s), 2)), l = G(() => B(c)[0]), u = G(() => B(c)[1]), d = G(() => ({
		...B(l),
		id: B(l).id ?? n,
		open: a(),
		onOpenChange(e) {
			B(l).onOpenChange?.(e), a() !== void 0 && a(e.open);
		}
	})), p = aC(() => B(d)), m = G(() => Q(p().getRootProps(), B(u)));
	return KS(p), X(e, q({ as: "div" }, () => B(m), {
		get ref() {
			return i();
		},
		set ref(e) {
			i(e);
		}
	})), g({
		get ref() {
			return i();
		},
		set ref(e = null) {
			i(e), r();
		},
		get open() {
			return a();
		},
		set open(e) {
			a(e), r();
		}
	});
}
N(sC, {
	ref: {},
	open: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/use-tree-view-context.js
var [cC, lC] = Zt({
	name: "TreeViewContext",
	hookName: "useTreeViewContext",
	providerName: "<TreeViewProvider />"
}), [uC, dC] = Zt({
	name: "TreeViewNodeContext",
	hookName: "useTreeViewNodeContext",
	providerName: "<TreeViewNodeProvider />"
}), [fC, pC] = Zt({
	name: "TreeViewNodePropsContext",
	hookName: "useTreeViewNodePropsContext",
	providerName: "<TreeViewNodePropsProvider />"
}), mC = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function hC(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, mC), a = lC(), o = pC(), s = dC(), c = zn(), l = G(() => Q(a().getBranchProps(o()), i)), u = G(() => a().getBranchContentProps(o()));
	var d = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	}, f = D(), p = R(f);
	{
		let e = G(() => s().expanded), t = G(() => ({ content: B(u).id })), r = G(c);
		b(p, () => sC, (i, a) => {
			a(i, q({
				get open() {
					return B(e);
				},
				get ids() {
					return B(t);
				}
			}, () => B(r), () => B(l), {
				get ref() {
					return n();
				},
				set ref(e) {
					n(e);
				}
			}));
		});
	}
	return T(e, f), g(d);
}
N(hC, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/tree-view-branch-content.svelte
var gC = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function _C(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, gC), a = lC(), o = pC(), s = G(() => a().getBranchContentProps(o())), c = G(Wt), l = G(() => B(c)(B(s), ["hidden", "data-state"])), u = G(() => f(B(l), 2)), d = G(() => B(u)[1]), p = G(() => Q(B(d), i));
	var m = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	}, h = D(), _ = R(h);
	return b(_, () => YS, (e, t) => {
		t(e, q(() => B(p), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}), T(e, h), g(m);
}
N(_C, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/tree-view-branch-control.svelte
var vC = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function yC(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, vC), a = lC(), o = pC(), s = G(() => Q(a().getBranchControlProps(o()), i));
	return X(e, q({ as: "div" }, () => B(s), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(yC, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/tree-view-branch-trigger.svelte
var bC = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function xC(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, bC), a = lC(), o = pC(), s = G(() => Q(a().getBranchTriggerProps(o()), i));
	return X(e, q({ as: "button" }, () => B(s), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(xC, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/tree-view-item.svelte
var SC = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function CC(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, SC), a = lC(), o = pC(), s = G(() => Q(a().getItemProps(o()), i));
	return X(e, q({ as: "li" }, () => B(s), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(CC, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/tree-view-node-provider.svelte
function wC(e, t) {
	I(t, !0);
	let n = O(t, "node", 7), i = O(t, "indexPath", 7), a = O(t, "children", 7), o = lC(), s = G(() => ({
		node: n(),
		indexPath: i()
	})), c = G(() => o().getNodeState(B(s)));
	uC(() => B(c)), fC(() => B(s));
	var d = {
		get node() {
			return n();
		},
		set node(e) {
			n(e), r();
		},
		get indexPath() {
			return i();
		},
		set indexPath(e) {
			i(e), r();
		},
		get children() {
			return a();
		},
		set children(e) {
			a(e), r();
		}
	}, f = D(), p = R(f);
	return u(p, () => a() ?? l), T(e, f), g(d);
}
N(wC, {
	node: {},
	indexPath: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/tree-view-split-props.js
var TC = Wt();
function EC(e) {
	return TC(e, /* @__PURE__ */ "canRename.checkedValue.collection.defaultCheckedValue.defaultExpandedValue.defaultFocusedValue.defaultSelectedValue.expandedValue.expandOnClick.focusedValue.id.ids.loadChildren.onBeforeRename.onCheckedChange.onExpandedChange.onFocusChange.onLoadChildrenComplete.onLoadChildrenError.onRenameComplete.onRenameStart.onSelectionChange.selectedValue.selectionMode.translations.typeahead.scrollToIndexFn".split("."));
}
var DC = xt("tree-view").parts("branch", "branchContent", "branchControl", "branchIndentGuide", "branchIndicator", "branchText", "branchTrigger", "item", "itemIndicator", "itemText", "label", "nodeCheckbox", "nodeRenameInput", "root", "tree").build(), OC = (e) => new ki(e);
OC.empty = () => new ki({ rootNode: { children: [] } });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tree-view@1.43.3/node_modules/@zag-js/tree-view/dist/tree-view.dom.mjs
var kC = (e) => e.ids?.root ?? `tree:${e.id}:root`, AC = (e) => e.ids?.label ?? `tree:${e.id}:label`, jC = (e, t) => e.ids?.node?.(t) ?? `tree:${e.id}:node:${t}`, MC = (e) => e.ids?.tree ?? `tree:${e.id}:tree`, NC = (e, t) => {
	t != null && e.getById(jC(e, t))?.focus();
}, PC = (e, t) => `tree:${e.id}:rename-input:${t}`, FC = (e, t) => e.getById(PC(e, t));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tree-view@1.43.3/node_modules/@zag-js/tree-view/dist/utils/checked-state.mjs
function IC(e, t, n) {
	let r = e.getNodeValue(t);
	if (!e.isBranchNode(t)) return n.includes(r);
	let i = e.getDescendantValues(r), a = i.every((e) => n.includes(e)), o = i.some((e) => n.includes(e));
	return a ? !0 : o ? "indeterminate" : !1;
}
function LC(e, t, n) {
	let r = e.getDescendantValues(t), i = r.every((e) => n.includes(e));
	return un(i ? rt(n, ...r) : Ye(n, ...r));
}
function RC(e, t) {
	let n = /* @__PURE__ */ new Map();
	return e.visit({ onEnter: (r) => {
		let i = e.getNodeValue(r), a = e.isBranchNode(r), o = IC(e, r, t);
		n.set(i, {
			type: a ? "branch" : "leaf",
			checked: o
		});
	} }), n;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tree-view@1.43.3/node_modules/@zag-js/tree-view/dist/tree-view.connect.mjs
var zC = {
	treeLabel: "Tree View",
	renameInputLabel: "Rename tree item"
};
function BC(e, t) {
	let { context: n, scope: r, computed: i, prop: a, send: o } = e, s = a("collection"), c = kt(zC, a("translations")), l = Array.from(n.get("expandedValue")), u = Array.from(n.get("selectedValue")), d = Array.from(n.get("checkedValue")), f = i("isTypingAhead"), p = n.get("focusedValue"), m = n.get("loadingStatus"), h = n.get("renamingValue"), g = s.getFirstNode(void 0, { skip: ({ indexPath: e }) => s.getValuePath(e).slice(0, -1).some((e) => !l.includes(e)) }), _ = g ? s.getNodeValue(g) : null;
	function v(e) {
		let { node: t, indexPath: n } = e, i = s.getNodeValue(t);
		return {
			id: jC(r, i),
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
				return IC(s, t, d);
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
			return RC(s, d);
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
			NC(r, e);
		},
		selectParent(e) {
			let t = s.getParentNode(e);
			if (!t) return;
			let n = Ye(u, s.getNodeValue(t));
			o({
				type: "SELECTED.SET",
				value: n,
				src: "select.parent"
			});
		},
		expandParent(e) {
			let t = s.getParentNode(e);
			if (!t) return;
			let n = Ye(l, s.getNodeValue(t));
			o({
				type: "EXPANDED.SET",
				value: n,
				src: "expand.parent"
			});
		},
		setExpandedValue(e) {
			let t = un(e);
			o({
				type: "EXPANDED.SET",
				value: t
			});
		},
		setSelectedValue(e) {
			let t = un(e);
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
				...DC.root.attrs,
				id: kC(r),
				dir: a("dir")
			});
		},
		getLabelProps() {
			return t.element({
				...DC.label.attrs,
				id: AC(r),
				dir: a("dir")
			});
		},
		getTreeProps() {
			return t.element({
				...DC.tree.attrs,
				id: MC(r),
				dir: a("dir"),
				role: "tree",
				"aria-label": c.treeLabel,
				"aria-labelledby": AC(r),
				"aria-multiselectable": a("selectionMode") === "multiple" || void 0,
				tabIndex: -1,
				onKeyDown(e) {
					if (e.defaultPrevented || pt(e)) return;
					let t = Ct(e);
					if ($e(t)) return;
					let n = t?.closest("[data-part=branch-control], [data-part=item]");
					if (!n) return;
					let r = n.dataset.value;
					if (r == null) {
						console.warn("[zag-js/tree-view] Node id not found for node", n);
						return;
					}
					let i = n.matches("[data-part=branch-control]"), c = {
						ArrowDown(e) {
							Xe(e) || (e.preventDefault(), o({
								type: "NODE.ARROW_DOWN",
								id: r,
								shiftKey: e.shiftKey
							}));
						},
						ArrowUp(e) {
							Xe(e) || (e.preventDefault(), o({
								type: "NODE.ARROW_UP",
								id: r,
								shiftKey: e.shiftKey
							}));
						},
						ArrowLeft(e) {
							Xe(e) || n.dataset.disabled || (e.preventDefault(), o({
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
							Xe(e) || (e.preventDefault(), o({
								type: "NODE.HOME",
								id: r,
								shiftKey: e.shiftKey
							}));
						},
						End(e) {
							Xe(e) || (e.preventDefault(), o({
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
							n.dataset.disabled || _t(t) && Xe(e) || (o({
								type: i ? "BRANCH_NODE.CLICK" : "NODE.CLICK",
								id: r,
								src: "keyboard"
							}), _t(t) || e.preventDefault());
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
					}, l = c[bt(e, { dir: a("dir") })];
					if (l) {
						l(e);
						return;
					}
					ca.isValidEvent(e) && (o({
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
				...DC.item.attrs,
				id: n.id,
				dir: a("dir"),
				"data-ownedby": MC(r),
				"data-path": e.indexPath.join("/"),
				"data-value": n.value,
				tabIndex: n.focused ? 0 : -1,
				"data-focus": Z(n.focused),
				role: "treeitem",
				"aria-current": n.selected ? "true" : void 0,
				"aria-selected": n.disabled ? void 0 : n.selected,
				"data-selected": Z(n.selected),
				"aria-disabled": ut(n.disabled),
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
					if (n.disabled || !ht(e) || _t(e.currentTarget) && Xe(e)) return;
					let t = e.metaKey || e.ctrlKey;
					o({
						type: "NODE.CLICK",
						id: n.value,
						shiftKey: e.shiftKey,
						ctrlKey: t
					}), e.stopPropagation(), _t(e.currentTarget) || e.preventDefault();
				}
			});
		},
		getItemTextProps(e) {
			let n = v(e);
			return t.element({
				...DC.itemText.attrs,
				"data-disabled": Z(n.disabled),
				"data-selected": Z(n.selected),
				"data-focus": Z(n.focused)
			});
		},
		getItemIndicatorProps(e) {
			let n = v(e);
			return t.element({
				...DC.itemIndicator.attrs,
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
				...DC.branch.attrs,
				"data-depth": n.depth,
				dir: a("dir"),
				"data-branch": n.value,
				role: "treeitem",
				"data-ownedby": MC(r),
				"data-value": n.value,
				"aria-level": n.depth,
				"aria-selected": n.disabled ? void 0 : n.selected,
				"data-path": e.indexPath.join("/"),
				"data-selected": Z(n.selected),
				"aria-expanded": n.expanded,
				"data-state": n.expanded ? "open" : "closed",
				"aria-disabled": ut(n.disabled),
				"data-disabled": Z(n.disabled),
				"data-loading": Z(n.loading),
				"aria-busy": ut(n.loading),
				style: { "--depth": n.depth }
			});
		},
		getBranchIndicatorProps(e) {
			let n = v(e);
			return t.element({
				...DC.branchIndicator.attrs,
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
				...DC.branchTrigger.attrs,
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
				...DC.branchControl.attrs,
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
				"aria-busy": ut(n.loading),
				onFocus(e) {
					o({
						type: "NODE.FOCUS",
						id: n.value
					}), e.stopPropagation();
				},
				onClick(e) {
					if (n.disabled || n.loading || !ht(e) || _t(e.currentTarget) && Xe(e)) return;
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
				...DC.branchText.attrs,
				dir: a("dir"),
				"data-disabled": Z(n.disabled),
				"data-state": n.expanded ? "open" : "closed",
				"data-loading": Z(n.loading)
			});
		},
		getBranchContentProps(e) {
			let n = v(e);
			return t.element({
				...DC.branchContent.attrs,
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
				...DC.branchIndentGuide.attrs,
				"data-depth": n.depth
			});
		},
		getNodeCheckboxProps(e) {
			let n = v(e), r = n.checked;
			return t.element({
				...DC.nodeCheckbox.attrs,
				tabIndex: -1,
				role: "checkbox",
				"data-state": r === !0 ? "checked" : r === !1 ? "unchecked" : "indeterminate",
				"aria-checked": r === !0 ? "true" : r === !1 ? "false" : "mixed",
				"data-disabled": Z(n.disabled),
				onClick(e) {
					e.defaultPrevented || n.disabled || ht(e) && (o({
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
				...DC.nodeRenameInput.attrs,
				id: PC(r, n.value),
				type: "text",
				"aria-label": c.renameInputLabel,
				hidden: !n.renaming,
				onKeyDown(e) {
					pt(e) || (e.key === "Escape" && (o({ type: "RENAME.CANCEL" }), e.preventDefault()), e.key === "Enter" && (o({
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
function VC(e, t) {
	let { context: n, prop: r, refs: i } = e;
	if (!r("loadChildren")) {
		n.set("expandedValue", (e) => un(Ye(e, ...t)));
		return;
	}
	let a = n.get("loadingStatus"), [o, s] = Qe(t, (e) => a[e] === "loaded");
	if (o.length > 0 && n.set("expandedValue", (e) => un(Ye(e, ...o))), s.length === 0) return;
	let c = r("collection"), [l, u] = Qe(s, (e) => {
		let t = c.findNode(e);
		return c.getNodeChildren(t).length > 0;
	});
	if (l.length > 0 && n.set("expandedValue", (e) => un(Ye(e, ...l))), u.length === 0) return;
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
	Tt(p, () => "[zag-js/tree-view] `loadChildren` is required for async expansion");
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
		}), n.set("loadingStatus", a), t.length && (n.set("expandedValue", (e) => un(Ye(e, ...t))), r("onLoadChildrenComplete")?.({ collection: o })), i.length && r("onLoadChildrenError")?.({ nodes: i });
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tree-view@1.43.3/node_modules/@zag-js/tree-view/dist/utils/visit-skip.mjs
function HC(e) {
	let { prop: t, context: n } = e;
	return function({ indexPath: e }) {
		return t("collection").getValuePath(e).slice(0, -1).some((e) => !n.get("expandedValue").includes(e));
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tree-view@1.43.3/node_modules/@zag-js/tree-view/dist/tree-view.machine.mjs
var { and: UC } = Pt(), WC = St({
	props({ props: e }) {
		return {
			selectionMode: "single",
			collection: OC.empty(),
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
				isEqual: Ze,
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
				isEqual: Ze,
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
				isEqual: Ze,
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
			typeaheadState: { ...ca.defaultOptions },
			pendingAborts: /* @__PURE__ */ new Map()
		};
	},
	computed: {
		isMultipleSelection: ({ prop: e }) => e("selectionMode") === "multiple",
		isTypingAhead: ({ refs: e }) => e.get("typeaheadState").keysSoFar.length > 0,
		visibleNodes: ({ prop: e, context: t }) => {
			let n = [];
			return e("collection").visit({
				skip: HC({
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
			guard: UC("isMultipleSelection", "moveFocus"),
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
			guard: UC("isShiftKey", "isMultipleSelection"),
			actions: ["focusTreeNextNode", "extendSelectionToNextNode"]
		}, { actions: ["focusTreeNextNode"] }],
		"NODE.ARROW_UP": [{
			guard: UC("isShiftKey", "isMultipleSelection"),
			actions: ["focusTreePrevNode", "extendSelectionToPrevNode"]
		}, { actions: ["focusTreePrevNode"] }],
		"NODE.ARROW_LEFT": { actions: ["focusBranchNode"] },
		"BRANCH_NODE.ARROW_LEFT": [{
			guard: "isBranchExpanded",
			actions: ["collapseBranch"]
		}, { actions: ["focusBranchNode"] }],
		"BRANCH_NODE.ARROW_RIGHT": [{
			guard: UC("isBranchFocused", "isBranchExpanded"),
			actions: ["focusBranchFirstNode"]
		}, { actions: ["expandBranch"] }],
		"SIBLINGS.EXPAND": { actions: ["expandSiblingBranches"] },
		"NODE.HOME": [{
			guard: UC("isShiftKey", "isMultipleSelection"),
			actions: ["extendSelectionToFirstNode", "focusTreeFirstNode"]
		}, { actions: ["focusTreeFirstNode"] }],
		"NODE.END": [{
			guard: UC("isShiftKey", "isMultipleSelection"),
			actions: ["extendSelectionToLastNode", "focusTreeLastNode"]
		}, { actions: ["focusTreeLastNode"] }],
		"NODE.CLICK": [
			{
				guard: UC("isCtrlKey", "isMultipleSelection"),
				actions: ["toggleNodeSelection"]
			},
			{
				guard: UC("isShiftKey", "isMultipleSelection"),
				actions: ["extendSelectionToNode"]
			},
			{ actions: ["selectNode"] }
		],
		"BRANCH_NODE.CLICK": [
			{
				guard: UC("isCtrlKey", "isMultipleSelection"),
				actions: ["toggleNodeSelection"]
			},
			{
				guard: UC("isShiftKey", "isMultipleSelection"),
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
				e.set("selectedValue", (e) => n == null ? e : !t.isTrusted && sn(n) ? e.concat(...n) : [sn(n) ? at(n) : n].filter(Boolean));
			},
			deselectNode({ context: e, event: t }) {
				let n = ft(t.id || t.value);
				e.set("selectedValue", (e) => rt(e, ...n));
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
				VC(e, [t.id]);
			},
			expandBranches(e) {
				let { context: t, event: n } = e, r = ft(n.value);
				VC(e, Ge(r, t.get("expandedValue")));
			},
			collapseBranch({ context: e, event: t }) {
				e.set("expandedValue", (e) => rt(e, t.id));
			},
			collapseBranches(e) {
				let { context: t, event: n } = e, r = ft(n.value);
				t.set("expandedValue", (e) => rt(e, ...r));
			},
			setExpanded({ context: e, event: t }) {
				sn(t.value) && e.set("expandedValue", t.value);
			},
			clearExpanded({ context: e }) {
				e.set("expandedValue", []);
			},
			setSelected({ context: e, event: t }) {
				sn(t.value) && e.set("selectedValue", t.value);
			},
			clearSelected({ context: e }) {
				e.set("selectedValue", []);
			},
			focusTreeFirstNode(e) {
				let { prop: t, scope: n } = e, r = t("collection"), i = r.getFirstNode(void 0, { skip: HC(e) });
				if (!i) return;
				let a = r.getNodeValue(i);
				GC(e, a) ? Mt(() => NC(n, a)) : NC(n, a);
			},
			focusTreeLastNode(e) {
				let { prop: t, scope: n } = e, r = t("collection"), i = r.getLastNode(void 0, { skip: HC(e) }), a = r.getNodeValue(i);
				GC(e, a) ? Mt(() => NC(n, a)) : NC(n, a);
			},
			focusBranchFirstNode(e) {
				let { event: t, prop: n, scope: r } = e, i = n("collection"), a = i.findNode(t.id), o = i.getFirstNode(a, { skip: HC(e) });
				if (!o) return;
				let s = i.getNodeValue(o);
				GC(e, s) ? Mt(() => NC(r, s)) : NC(r, s);
			},
			focusTreeNextNode(e) {
				let { event: t, prop: n, scope: r } = e, i = n("collection"), a = i.getNextNode(t.id, { skip: HC(e) });
				if (!a) return;
				let o = i.getNodeValue(a);
				GC(e, o) ? Mt(() => NC(r, o)) : NC(r, o);
			},
			focusTreePrevNode(e) {
				let { event: t, prop: n, scope: r } = e, i = n("collection"), a = i.getPreviousNode(t.id, { skip: HC(e) });
				if (!a) return;
				let o = i.getNodeValue(a);
				GC(e, o) ? Mt(() => NC(r, o)) : NC(r, o);
			},
			focusBranchNode(e) {
				let { event: t, prop: n, scope: r } = e, i = n("collection"), a = i.getParentNode(t.id), o = a ? i.getNodeValue(a) : void 0;
				o && (GC(e, o) ? Mt(() => NC(r, o)) : NC(r, o));
			},
			selectAllNodes({ context: e, prop: t }) {
				e.set("selectedValue", t("collection").getValues());
			},
			focusMatchedNode(e) {
				let { context: t, prop: n, refs: r, event: i, scope: a, computed: o } = e, s = ca(o("visibleNodes").map(({ node: e }) => ({
					textContent: n("collection").stringifyNode(e),
					id: n("collection").getNodeValue(e)
				})), {
					state: r.get("typeaheadState"),
					activeId: t.get("focusedValue"),
					key: i.key
				});
				s?.id && (GC(e, s.id) ? Mt(() => NC(a, s.id)) : NC(a, s.id));
			},
			toggleNodeSelection({ context: e, event: t }) {
				let n = st(e.get("selectedValue"), t.id);
				e.set("selectedValue", n);
			},
			expandAllBranches(e) {
				let { context: t, prop: n } = e, r = n("collection").getBranchValues();
				VC(e, Ge(r, t.get("expandedValue")));
			},
			expandSiblingBranches(e) {
				let { context: t, event: n, prop: r } = e, i = r("collection"), a = i.getIndexPath(n.id);
				if (!a) return;
				let o = i.getSiblingNodes(a).map((e) => i.getNodeValue(e));
				VC(e, Ge(o, t.get("expandedValue")));
			},
			extendSelectionToNode(e) {
				let { context: t, event: n, prop: r, computed: i } = e, a = r("collection"), o = It(t.get("selectedValue")) || a.getNodeValue(a.getFirstNode()), s = n.id, c = [o, s], l = 0;
				i("visibleNodes").forEach(({ node: e }) => {
					let t = a.getNodeValue(e);
					l === 1 && c.push(t), (t === o || t === s) && l++;
				}), t.set("selectedValue", un(c));
			},
			extendSelectionToNextNode(e) {
				let { context: t, event: n, prop: r } = e, i = r("collection"), a = i.getNextNode(n.id, { skip: HC(e) });
				if (!a) return;
				let o = new Set(t.get("selectedValue")), s = i.getNodeValue(a);
				s != null && (o.has(n.id) && o.has(s) ? o.delete(n.id) : o.has(s) || o.add(s), t.set("selectedValue", Array.from(o)));
			},
			extendSelectionToPrevNode(e) {
				let { context: t, event: n, prop: r } = e, i = r("collection"), a = i.getPreviousNode(n.id, { skip: HC(e) });
				if (!a) return;
				let o = new Set(t.get("selectedValue")), s = i.getNodeValue(a);
				s != null && (o.has(n.id) && o.has(s) ? o.delete(n.id) : o.has(s) || o.add(s), t.set("selectedValue", Array.from(o)));
			},
			extendSelectionToFirstNode(e) {
				let { context: t, prop: n } = e, r = n("collection"), i = It(t.get("selectedValue")), a = [];
				r.visit({
					skip: HC(e),
					onEnter: (e) => {
						let t = r.getNodeValue(e);
						if (a.push(t), t === i) return "stop";
					}
				}), t.set("selectedValue", a);
			},
			extendSelectionToLastNode(e) {
				let { context: t, prop: n } = e, r = n("collection"), i = It(t.get("selectedValue")), a = [], o = !1;
				r.visit({
					skip: HC(e),
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
				e.set("checkedValue", (e) => t.isBranch ? LC(r, t.value, e) : st(e, t.value));
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
					e.set("renamingValue", null), NC(r, i);
					return;
				}
				n("onRenameComplete")?.({
					value: i,
					label: o,
					indexPath: a
				}), e.set("renamingValue", null), NC(r, i);
			},
			cancelRenaming({ context: e, scope: t }) {
				let n = e.get("renamingValue");
				e.set("renamingValue", null), n && NC(t, n);
			},
			syncRenameInput({ context: e, scope: t, prop: n }) {
				let r = e.get("renamingValue");
				if (!r) return;
				let i = n("collection"), a = i.findNode(r);
				if (!a) return;
				let o = i.stringifyNode(a);
				Ri(FC(t, r), o);
			},
			focusRenameInput({ context: e, scope: t }) {
				let n = e.get("renamingValue");
				if (!n) return;
				let r = FC(t, n);
				r && (r.focus(), r.select());
			}
		}
	}
});
function GC(e, t) {
	let { prop: n, scope: r, computed: i } = e, a = n("scrollToIndexFn");
	if (!a) return !1;
	let o = n("collection"), s = i("visibleNodes");
	for (let e = 0; e < s.length; e++) {
		let { node: n, indexPath: i } = s[e];
		if (o.getNodeValue(n) === t) return a({
			index: e,
			node: n,
			indexPath: i,
			getElement: () => r.getById(jC(r, t))
		}), !0;
	}
	return !1;
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/use-tree-view.svelte.js
var KC = (e) => {
	let t = Nt(), n = Ut(), r = G(() => {
		let r = rn(e);
		return Bt(r, ["id"]), {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = zt(WC, () => B(r)), a = G(() => BC(i, Et));
	return () => B(a);
}, qC = /* @__PURE__ */ new Set([
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
function JC(e, t) {
	let n = M();
	I(t, !0);
	let i = O(t, "ref", 15, null), a = O(t, "expandedValue", 15), o = O(t, "selectedValue", 15), s = O(t, "focusedValue", 15), c = O(t, "checkedValue", 15), l = W(t, qC), u = G(() => Rn(l)), d = G(() => f(B(u), 2)), p = G(() => B(d)[0]), m = G(() => B(d)[1]), h = G(() => EC(B(m))), _ = G(() => f(B(h), 2)), v = G(() => B(_)[0]), y = G(() => B(_)[1]), b = G(() => ({
		...B(v),
		id: B(v).id ?? n,
		selectedValue: o(),
		expandedValue: a(),
		focusedValue: s(),
		checkedValue: c(),
		onExpandedChange: (e) => {
			B(v).onExpandedChange?.(e), a(e.expandedValue);
		},
		onFocusChange: (e) => {
			B(v).onFocusChange?.(e), s(e.focusedValue);
		},
		onSelectionChange: (e) => {
			B(v).onSelectionChange?.(e), o(e.selectedValue);
		},
		onCheckedChange: (e) => {
			B(v).onCheckedChange?.(e), c(e.checkedValue);
		}
	})), x = KC(() => B(b)), S = G(() => Q(x().getRootProps(), B(y)));
	return cC(x), Jn(() => B(p)), X(e, q({ as: "div" }, () => B(S), {
		get ref() {
			return i();
		},
		set ref(e) {
			i(e);
		}
	})), g({
		get ref() {
			return i();
		},
		set ref(e = null) {
			i(e), r();
		},
		get expandedValue() {
			return a();
		},
		set expandedValue(e) {
			a(e), r();
		},
		get selectedValue() {
			return o();
		},
		set selectedValue(e) {
			o(e), r();
		},
		get focusedValue() {
			return s();
		},
		set focusedValue(e) {
			s(e), r();
		},
		get checkedValue() {
			return c();
		},
		set checkedValue(e) {
			c(e), r();
		}
	});
}
N(JC, {
	ref: {},
	expandedValue: {},
	selectedValue: {},
	focusedValue: {},
	checkedValue: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tree-view/tree-view-tree.svelte
var YC = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function XC(e, t) {
	I(t, !0);
	let n = O(t, "ref", 15, null), i = W(t, YC), a = lC(), o = G(() => Q(a().getTreeProps(), i));
	return X(e, q({ as: "div" }, () => B(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), g({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), r();
		}
	});
}
N(XC, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/picker/forest.ts
function ZC(e) {
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
function QC(e, t) {
	let n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), i = (e) => {
		let a = !1;
		for (let t of e.children) i(t) && (a = !0);
		a && r.add(e.node.id);
		let o = a || xr(e.node.label, t) || xr(e.node.code, t);
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
function $C(e, t) {
	return e.filter((e) => t.has(e.node.id)).map((e) => ({
		...e,
		children: $C(e.children, t)
	}));
}
var ew = e("<svg viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m9 18 6-6-6-6\"></path></svg>"), tw = y("<span class=\"spacer svelte-wzhqq0\" aria-hidden=\"true\"></span>"), nw = e("<svg viewBox=\"0 0 24 24\" width=\"10\" height=\"10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 6 9 17l-5-5\"></path></svg>"), rw = y("<span part=\"check\" aria-hidden=\"true\"><!></span>"), iw = y("<span part=\"ancestry\"> </span>"), aw = y("<code part=\"code\"> </code>"), ow = y("<span part=\"archived\"> </span>"), sw = y("<!> <!> <span class=\"label svelte-wzhqq0\"> </span> <!> <!> <!>", 1), cw = y("<af-tooltip><!></af-tooltip>", 2), lw = y("<!> <!>", 1), uw = y("<span id=\"af-described\" hidden=\"\"> </span>"), dw = y("<span class=\"af-chip secondary\" part=\"chip\"><span> </span> <button type=\"button\" part=\"remove\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button></span>"), fw = y("<button type=\"button\" part=\"clear\" class=\"af-button ghost icon xs\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button>"), pw = y("<div part=\"control\" data-scope=\"combobox\" data-part=\"control\"><!> <input part=\"input\" data-scope=\"combobox\" data-part=\"input\" role=\"combobox\" aria-haspopup=\"tree\" aria-controls=\"af-tree\" autocomplete=\"off\" spellcheck=\"false\"/> <!></div>"), mw = y("<div part=\"loading\"> </div>"), hw = y("<button type=\"button\" part=\"load-more\"> </button>"), gw = y("<div part=\"empty\"> </div>"), _w = y("<div class=\"af-kit\"><!> <!></div>"), vw = y("<!> <!> <!>", 1), yw = {
	hash: "svelte-wzhqq0",
	code: ":host {display:inline-block;max-width:100%;vertical-align:middle;}af-tooltip.svelte-wzhqq0 {display:block;}[data-scope='popover'][data-part='anchor'] {display:block;}[data-scope='popover'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='popover'][data-part='content'] {display:flex;flex-direction:column;box-sizing:border-box;width:var(--reference-width, auto);max-height:256px;padding:6px;outline:none;}[data-scope='tree-view'][data-part='tree'], [data-scope='tree-view'][data-part='branch'], [data-scope='tree-view'][data-part='branch-content'] {display:flex;flex-direction:column;gap:2px;margin:0;padding:0;outline:none;}[data-scope='tree-view'][data-part='branch-content'][hidden] {display:none;}[part~='node'] {display:flex;box-sizing:border-box;align-items:center;gap:8px;height:32px;min-height:0;padding-right:8px;border:0 solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));font-size:12.5px;line-height:1.5;outline:none;cursor:pointer;-webkit-user-select:none;user-select:none;}\n  @media (hover: hover) {[part~='node']:hover {background-color:var(--k-muted-bg);} }[part~='node']:focus-visible {box-shadow:0 0 0 2px var(--k-focus-ring);}[part~='node'][data-selected]:not([aria-disabled='true']) {background-color:var(--k-accent);color:var(--k-accent-fg);font-weight:600;}[part~='node'][data-archived]:not([data-selected]) {font-style:italic;}[part~='node'][aria-disabled='true'] {color:color-mix(in oklab, var(--k-muted) 70%, transparent);cursor:not-allowed;}\n  @media (hover: hover) {[part~='node'][aria-disabled='true']:hover {background-color:transparent;} }[part~='toggle'] {display:grid;flex:none;place-items:center;width:16px;height:16px;padding:0;border:0;border-radius:0.25rem;background:transparent;color:var(--k-muted);cursor:pointer;}[part~='toggle'] svg {transition:transform 150ms cubic-bezier(0.4, 0, 0.2, 1);}[part~='toggle'][data-state='open'] svg {transform:rotate(90deg);}.spacer.svelte-wzhqq0 {flex:none;width:16px;height:16px;}[part~='check'] {display:grid;flex:none;box-sizing:border-box;place-items:center;width:14px;height:14px;border:1px solid var(--k-input);border-radius:4px;background-color:var(--k-surface);}[part~='check'][data-state='on'] {border-color:var(--k-primary);background-color:var(--k-primary);color:var(--k-primary-fg);}.label.svelte-wzhqq0 {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}[part~='ancestry'] {min-width:0;overflow:hidden;color:var(--k-muted);font-size:11px;font-style:normal;font-weight:400;text-overflow:ellipsis;white-space:nowrap;}[part~='code'] {flex:none;margin-left:auto;color:var(--k-muted);font-family:var(--af-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);font-size:10.5px;font-style:normal;font-weight:400;}[part~='archived'] {display:inline-flex;flex:none;box-sizing:border-box;align-items:center;height:18px;margin-left:auto;padding:0 6px;border:1px solid var(--k-line);border-radius:calc(infinity * 1px);background-color:var(--k-muted-bg);color:var(--k-muted);font-size:10px;font-style:normal;font-weight:600;}[part~='code'] + [part~='archived'] {margin-left:0;}[part~='loading'], [part~='empty'] {padding:20px 12px;color:var(--k-muted);font-size:12px;line-height:1.5;text-align:center;}[part~='load-more'] {display:flex;box-sizing:border-box;align-items:center;width:100%;height:32px;margin:2px 0 0;padding:0 8px;border:0;border-radius:max(0px, calc(var(--k-radius) - 2px));background:transparent;color:inherit;font:inherit;font-size:12.5px;text-align:start;outline:none;cursor:pointer;}\n  @media (hover: hover) {[part~='load-more']:hover {background-color:var(--k-muted-bg);} }[part~='load-more']:focus-visible {box-shadow:0 0 0 2px var(--k-focus-ring);}\n  @media (prefers-reduced-motion: reduce) {[part~='toggle'] svg {transition:none;} }\n  @media (forced-colors: active) {[part~='node']:focus-visible, [part~='load-more']:focus-visible {outline:2px solid;outline-offset:-2px;}[part~='node'][data-selected]:not([aria-disabled='true']) {forced-color-adjust:none;background-color:Highlight;color:HighlightText;}\n  }"
};
function bw(e, t) {
	I(t, !0), c(e, yw);
	let n = (e, t = l) => {
		let n = G(() => t().node), r = G(() => B(ue).includes(B(n).id));
		var i = sw(), a = R(i), o = (e) => {
			var t = D(), n = R(t);
			b(n, () => xC, (e, t) => {
				t(e, {
					part: "toggle",
					tabindex: -1,
					"aria-hidden": "true",
					children: (e, t) => {
						var n = ew();
						T(e, n);
					},
					$$slots: { default: !0 }
				});
			}), T(e, t);
		}, s = (e) => {
			var t = tw();
			T(e, t);
		};
		w(a, (e) => {
			t().children.length ? e(o) : e(s, -1);
		});
		var c = P(a, 2), u = (e) => {
			var t = rw(), n = V(t), i = (e) => {
				var t = nw();
				T(e, t);
			};
			w(n, (e) => {
				B(r) && e(i);
			}), v(t), U(() => x(t, "data-state", B(r) ? "on" : "off")), T(e, t);
		};
		w(c, (e) => {
			y() && e(u);
		});
		var d = P(c, 2), f = F(d, !0), p = P(d, 2), m = (e) => {
			var n = iw(), r = F(n, !0);
			U((e) => E(r, e), [() => t().ancestry.join(" › ")]), T(e, n);
		};
		w(p, (e) => {
			t().ancestry.length && e(m);
		});
		var h = P(p, 2), g = (e) => {
			var t = aw(), r = F(t, !0);
			U(() => E(r, B(n).code)), T(e, t);
		};
		w(h, (e) => {
			B(n).code && e(g);
		});
		var _ = P(h, 2), S = (e) => {
			var t = ow(), n = F(t, !0);
			U(() => E(n, B(W).archived)), T(e, t);
		};
		w(_, (e) => {
			B(n).archived && e(S);
		}), U(() => E(f, B(n).label)), T(e, i);
	}, a = (e, t = l) => {
		var r = D(), i = R(r);
		{
			let e = G(() => 8 + t().depth * 18), r = G(() => t().node.archived ? "" : void 0), a = G(() => gt(t().node));
			b(i, () => yC, (i, o) => {
				o(i, q({
					part: "node",
					get style() {
						return `padding-left: ${B(e) ?? ""}px`;
					},
					get "data-archived"() {
						return B(r);
					}
				}, () => B(a), {
					onclick: () => st(t().node.id),
					children: (e, r) => {
						n(e, t);
					},
					$$slots: { default: !0 }
				}));
			});
		}
		T(e, r);
	}, o = (e, t = l) => {
		var r = D(), i = R(r);
		{
			let e = G(() => 8 + t().depth * 18), r = G(() => t().node.archived ? "" : void 0), a = G(() => gt(t().node));
			b(i, () => CC, (i, o) => {
				o(i, q({
					part: "node",
					get style() {
						return `padding-left: ${B(e) ?? ""}px`;
					},
					get "data-archived"() {
						return B(r);
					}
				}, () => B(a), {
					onclick: () => st(t().node.id),
					children: (e, r) => {
						n(e, t);
					},
					$$slots: { default: !0 }
				}));
			});
		}
		T(e, r);
	}, s = (e, t = l, n = l) => {
		var r = D(), a = R(r), o = (e) => {
			var r = cw();
			U((e) => i(r, "text", e), [() => Xe(t().node)]), p(r, 1, "svelte-wzhqq0");
			var a = V(r);
			u(a, n, t), v(r), T(e, r);
		}, s = G(() => Ye(t().node) && Xe(t().node)), c = (e) => {
			var r = D(), i = R(r);
			u(i, n, t), T(e, r);
		};
		w(a, (e) => {
			B(s) ? e(o) : e(c, -1);
		}), T(e, r);
	}, d = (e, t = l, n = l) => {
		var r = D(), i = R(r);
		b(i, () => wC, (e, r) => {
			r(e, {
				get node() {
					return t();
				},
				get indexPath() {
					return n();
				},
				children: (e, r) => {
					var i = D(), c = R(i), l = (e) => {
						var r = D(), i = R(r);
						b(i, () => hC, (e, r) => {
							r(e, {
								children: (e, r) => {
									var i = lw(), o = R(i);
									s(o, t, () => a);
									var c = P(o, 2);
									b(c, () => _C, (e, r) => {
										r(e, {
											children: (e, r) => {
												var i = D(), a = R(i);
												C(a, 19, () => t().children, (e) => e.node.id, (e, t, r) => {
													{
														let i = G(() => [...n(), B(r)]);
														d(e, () => B(t), () => B(i));
													}
												}), T(e, i);
											},
											$$slots: { default: !0 }
										});
									}), T(e, i);
								},
								$$slots: { default: !0 }
							});
						}), T(e, r);
					}, u = (e) => {
						s(e, t, () => o);
					};
					w(c, (e) => {
						t().children.length ? e(l) : e(u, -1);
					}), T(e, i);
				},
				$$slots: { default: !0 }
			});
		}), T(e, r);
	}, f = O(t, "nodes", 23, () => []), m = O(t, "source", 7, null), _ = O(t, "value", 7, null), y = O(t, "multiple", 7, !1), S = O(t, "max", 7, null), k = O(t, "placeholder", 7, null), ee = O(t, "label", 7, null), A = O(t, "loading", 7, !1), M = O(t, "disabled", 7, !1), re = O(t, "locale", 7, null), N = O(t, "strings", 7, null), ie = O(t, "name", 7, null), L = O(t, "required", 7, !1), z = O(t, "readonly", 7, !1), ae = O(t, "description", 7, null), H = O(t, "error", 7, null), se = O(t, "invalid", 7, !1), ce = t.$$host, le = we(ce), W = G(() => he(re(), N() ?? void 0)), ue = G(() => [...new Set(Array.isArray(_()) ? _() : _() ? [_()] : [])]), fe = K(null), pe = K(!1), Y = Yc((e) => e.id), ve = null, ye = K(null), be = !1;
	function xe() {
		be && Y.busy || (be = !0, ve = null, Y.now(""));
	}
	Xc(Y, () => m(), () => B(ue), () => {
		J(ye, null), be = !1, B(pe) && xe();
	}), j(() => {
		let e = Y.next;
		if (B(pe) && m() && !Y.busy) {
			if (e === null) {
				be && (be = !1, J(ye, Y.items.length ? Y.items : null));
				return;
			}
			e !== ve && (ve = e, ne(() => Y.more()));
		}
	});
	let Se = G(() => m() ? B(ye) ?? Y.items : f() ?? []), Te = G(() => ZC(B(Se))), Ee = G(() => new Map(B(Se).map((e) => [e.id, e]))), Oe = G(() => (B(fe) ?? "").trim()), Ae = G(() => B(Oe) ? QC(B(Te), B(Oe)) : null), Me = G(() => B(Ae) ? $C(B(Te), B(Ae).shown) : B(Te)), Ne = new Kc(), Fe = new Kc(), Ie = (e) => B(Ae) ? Fe.get(e.node.id) ?? B(Ae).open.has(e.node.id) : Ne.get(e.node.id) ?? e.depth === 0, Le = G(() => {
		let e = [], t = (n) => {
			for (let r of n) r.children.length && (e.push(r), t(r.children));
		};
		return t(B(Me)), e;
	}), Re = G(() => B(Le).filter(Ie).map((e) => e.node.id));
	function Be(e) {
		let t = new Set(e), n = B(Ae) ? Fe : Ne;
		for (let e of B(Le)) Ie(e) !== t.has(e.node.id) && n.set(e.node.id, t.has(e.node.id));
	}
	let He = G(() => Mi({
		rootNode: {
			node: {
				id: "",
				parentId: null,
				label: ""
			},
			depth: -1,
			children: B(Me),
			ancestry: []
		},
		nodeToValue: (e) => e.node.id,
		nodeToString: (e) => e.node.label,
		nodeToChildren: (e) => e.children
	})), Ue = (e) => m() ? Y.named.get(e) : B(Ee).get(e), We = G(() => B(ue).filter((e) => !Ue(e)));
	function Ge(e) {
		let t = Ue(e);
		return t ? t.label : A() || m() && Y.pending(e) ? "…" : (m() ? Y.answered(e) : B(Se).length > 0) ? B(We).length > 1 ? `${B(W).unknownOption} ${B(We).indexOf(e) + 1}` : B(W).unknownOption : "";
	}
	let Ke = G(() => B(fe) ?? (y() || !B(ue)[0] ? "" : Ge(B(ue)[0]))), qe = G(() => !!A() || !!m() && Y.busy), Je = G(() => !!y() && S() != null && B(ue).length >= S()), Ye = (e) => !!e.disabled || B(Je) && !B(ue).includes(e.id), Xe = (e) => e.disabled ? e.reason ?? "" : B(Je) && !B(ue).includes(e.id) ? ge(B(W).maxPicked, { max: S() }) : "", Ze = (e) => Ce(ce, "change", { value: y() ? e : e[0] ?? null }), Qe = K(!1), $e = G(() => !!M() || B(Qe)), et = G(() => B($e) || !!z()), tt = G(() => [ae(), H()].filter(Boolean).join(" ")), nt = K(null), rt = K(null), it = K(null), at = K(null);
	j(() => De(B(at), B(pe), ce));
	function ot(e) {
		e === B(pe) || e && B(et) || (J(pe, e, !0), e ? m() && xe() : (J(fe, null), Fe.clear(), Y.stop(), be = !1));
	}
	function st(e) {
		let t = B(Ee).get(e);
		if (!(!t || B(et) || Ye(t))) {
			if (y()) {
				Ze(B(ue).includes(e) ? B(ue).filter((t) => t !== e) : [...B(ue), e]);
				return;
			}
			B(ue)[0] !== e && Ze([e]), ot(!1), B(nt)?.focus();
		}
	}
	let ct = !1, lt;
	j(() => () => clearTimeout(lt));
	let ut = (e) => e.key.length === 1 && e.key !== " " && e.key !== "*" && !e.ctrlKey && !e.metaKey;
	function dt(e) {
		if (e.key === " " ? ct : ut(e)) {
			ct = !0, clearTimeout(lt), lt = setTimeout(() => ct = !1, 350);
			return;
		}
		if (e.key !== "Enter" && e.key !== " ") return;
		let t = e.target.closest("[data-part=\"item\"], [data-part=\"branch-control\"]")?.dataset.value;
		t !== void 0 && (e.preventDefault(), st(t));
	}
	function ft() {
		let e = [...B(it)?.querySelectorAll("[data-part=\"item\"], [data-part=\"branch-control\"]") ?? []].filter((e) => !e.closest("[hidden]"));
		(e.find((e) => e.dataset.value === B(ue)[0]) ?? e.find((e) => e.tabIndex === 0) ?? e[0])?.focus();
	}
	function pt(e) {
		e.key !== "ArrowDown" || B(et) || (e.preventDefault(), B(pe) ? ft() : ot(!0));
	}
	function mt(e) {
		let t = e.currentTarget.value;
		J(fe, t, !0), Fe.clear(), Ce(ce, "search", { query: t }), ot(!0);
	}
	j(() => {
		let e = !!L() && B(ue).length === 0;
		Ve(ce, {
			name: ie(),
			value: y() ? B(ue) : B(ue)[0] ?? null,
			validity: e ? { valueMissing: !0 } : {},
			message: e ? me(B(W), "valueMissing") : "",
			anchor: B(nt)
		});
	}), ze(ce, {
		reset() {
			let e = ce.getAttribute("value"), t = e ? [e] : [];
			(t.length !== B(ue).length || t.some((e, t) => e !== B(ue)[t])) && Ze(t);
		},
		disabled(e) {
			J(Qe, e, !0);
		}
	});
	function ht(e) {
		let t = e.target;
		t === B(nt) || t.closest("button") || (e.preventDefault(), B(nt)?.focus());
	}
	let gt = (e) => {
		if (!Ye(e)) return {};
		let t = Xe(e);
		return t ? {
			"aria-disabled": "true",
			"aria-description": t
		} : { "aria-disabled": "true" };
	};
	var _t = {
		get nodes() {
			return f();
		},
		set nodes(e = []) {
			f(e), r();
		},
		get source() {
			return m();
		},
		set source(e = null) {
			m(e), r();
		},
		get value() {
			return _();
		},
		set value(e = null) {
			_(e), r();
		},
		get multiple() {
			return y();
		},
		set multiple(e = !1) {
			y(e), r();
		},
		get max() {
			return S();
		},
		set max(e = null) {
			S(e), r();
		},
		get placeholder() {
			return k();
		},
		set placeholder(e = null) {
			k(e), r();
		},
		get label() {
			return ee();
		},
		set label(e = null) {
			ee(e), r();
		},
		get loading() {
			return A();
		},
		set loading(e = !1) {
			A(e), r();
		},
		get disabled() {
			return M();
		},
		set disabled(e = !1) {
			M(e), r();
		},
		get locale() {
			return re();
		},
		set locale(e = null) {
			re(e), r();
		},
		get strings() {
			return N();
		},
		set strings(e = null) {
			N(e), r();
		},
		get name() {
			return ie();
		},
		set name(e = null) {
			ie(e), r();
		},
		get required() {
			return L();
		},
		set required(e = !1) {
			L(e), r();
		},
		get readonly() {
			return z();
		},
		set readonly(e = !1) {
			z(e), r();
		},
		get description() {
			return ae();
		},
		set description(e = null) {
			ae(e), r();
		},
		get error() {
			return H();
		},
		set error(e = null) {
			H(e), r();
		},
		get invalid() {
			return se();
		},
		set invalid(e = !1) {
			se(e), r();
		}
	}, vt = vw(), yt = R(vt);
	_e(yt, {});
	var bt = P(yt, 2);
	Bc(bt, {});
	var xt = P(bt, 2);
	return Yt(xt, {
		value: () => ce.shadowRoot,
		children: (e, t) => {
			Vc(e, {
				get dir() {
					return le;
				},
				children: (e, t) => {
					var n = _w(), r = V(n), i = (e) => {
						var t = uw(), n = F(t, !0);
						U(() => E(n, B(tt))), T(e, t);
					};
					w(r, (e) => {
						B(tt) && e(i);
					});
					var a = P(r, 2);
					b(a, () => Pe, (e, t) => {
						t(e, {
							get open() {
								return B(pe);
							},
							autoFocus: !1,
							restoreFocus: !1,
							portalled: !1,
							positioning: {
								strategy: "fixed",
								placement: "bottom-start"
							},
							persistentElements: [() => B(rt)],
							onOpenChange: (e) => ot(e.open),
							onEscapeKeyDown: (e) => {
								B(nt)?.focus(), rr(e) && e.defaultPrevented && ot(!1);
							},
							children: (e, t) => {
								var n = lw(), r = R(n);
								b(r, () => mg, (e, t) => {
									t(e, {
										children: (e, t) => {
											var n = pw(), r = V(n), i = (e) => {
												var t = D(), n = R(t);
												C(n, 16, () => B(ue), (e) => e, (e, t) => {
													let n = G(() => Ge(t));
													var r = dw(), i = V(r), a = F(i, !0), o = P(i, 2);
													v(r), U(() => {
														E(a, B(n)), x(o, "aria-label", `${B(W).remove ?? ""}: ${B(n) ?? ""}`), o.disabled = B(et);
													}), oe("click", o, () => Ze(B(ue).filter((e) => e !== t))), T(e, r);
												}), T(e, t);
											};
											w(r, (e) => {
												y() && e(i);
											});
											var a = P(r, 2);
											de(a), te(a, (e) => J(nt, e), () => B(nt));
											var o = P(a, 2), s = (e) => {
												var t = fw();
												U(() => x(t, "aria-label", B(W).clear)), oe("click", t, () => Ze([])), T(e, t);
											};
											w(o, (e) => {
												!y() && B(ue)[0] && !B(et) && e(s);
											}), v(n), te(n, (e) => J(rt, e), () => B(rt)), U(() => {
												x(n, "data-disabled", B($e) ? "" : void 0), x(a, "aria-expanded", B(pe)), x(a, "placeholder", k() ?? ""), x(a, "aria-label", ee() || void 0), x(a, "aria-describedby", B(tt) ? "af-described" : void 0), x(a, "aria-required", L() ? "true" : void 0), x(a, "aria-invalid", se() ? "true" : void 0), a.disabled = B($e), a.readOnly = !!z(), h(a, B(Ke));
											}), oe("mousedown", n, ht), oe("input", a, mt), oe("keydown", a, pt), oe("click", a, () => ot(!0)), T(e, n);
										},
										$$slots: { default: !0 }
									});
								});
								var i = P(r, 2);
								b(i, () => je, (e, t) => {
									t(e, {
										popover: "manual",
										get ref() {
											return B(at);
										},
										set ref(e) {
											J(at, e, !0);
										},
										children: (e, t) => {
											var n = D(), r = R(n);
											b(r, () => ke, (e, t) => {
												t(e, {
													class: "af-overlay",
													part: "content",
													children: (e, t) => {
														xn(e, {
															tabStop: !1,
															children: (e, t) => {
																var n = lw(), r = R(n), i = () => B(ue), a = () => B(Re), o = Be;
																{
																	let e = G(() => y() ? "multiple" : "single");
																	b(r, () => JC, (t, n) => {
																		n(t, {
																			get collection() {
																				return B(He);
																			},
																			ids: { tree: "af-tree" },
																			get selectionMode() {
																				return B(e);
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
																				var n = D(), r = R(n);
																				{
																					let e = G(() => ee() || k() || void 0);
																					b(r, () => XC, (t, n) => {
																						n(t, {
																							part: "tree",
																							get "aria-label"() {
																								return B(e);
																							},
																							onkeydown: dt,
																							get ref() {
																								return B(it);
																							},
																							set ref(e) {
																								J(it, e, !0);
																							},
																							children: (e, t) => {
																								var n = D(), r = R(n);
																								C(r, 19, () => B(Me), (e) => e.node.id, (e, t, n) => {
																									d(e, () => B(t), () => [B(n)]);
																								}), T(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					});
																				}
																				T(e, n);
																			},
																			$$slots: { default: !0 }
																		});
																	});
																}
																var s = P(r, 2), c = (e) => {
																	var t = mw(), n = F(t, !0);
																	U(() => E(n, B(W).loading)), T(e, t);
																}, l = (e) => {
																	var t = hw(), n = F(t, !0);
																	U(() => E(n, B(W).loadMore)), oe("click", t, () => Y.more()), T(e, t);
																}, u = (e) => {
																	var t = gw(), n = F(t, !0);
																	U(() => E(n, B(Oe) ? B(W).noMatches : B(W).noNodes)), T(e, t);
																};
																w(s, (e) => {
																	B(qe) ? e(c) : m() && Y.next ? e(l, 1) : B(Me).length === 0 && e(u, 2);
																}), T(e, n);
															},
															$$slots: { default: !0 }
														});
													},
													$$slots: { default: !0 }
												});
											}), T(e, n);
										},
										$$slots: { default: !0 }
									});
								}), T(e, n);
							},
							$$slots: { default: !0 }
						});
					}), v(n), T(e, n);
				},
				$$slots: { default: !0 }
			});
		},
		$$slots: { default: !0 }
	}), T(e, vt), g(_t);
}
z([
	"mousedown",
	"click",
	"input",
	"keydown"
]), N(bw, {
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
}, Le);
//#endregion
//#region src/kit/form/owned.ts
var xw = "data-af-owned", Sw = (e) => e instanceof Element && e.hasAttribute("data-af-owned");
function Cw(e, t, n) {
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
function ww(e, t, n) {
	let r = [...t], i = [...n];
	Cw(e, r, i);
	let a = new MutationObserver(() => Cw(e, r, i));
	return a.observe(e, { childList: !0 }), () => a.disconnect();
}
function Tw(e, t) {
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
var Ew = {
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
}, Dw = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/></svg>", Ow = 0, kw = (e) => e.constructor.kitVersion !== void 0, Aw = (e) => /^(radiogroup|group)$/.test(e.getAttribute("role") ?? ""), jw = (e) => e instanceof HTMLInputElement || e instanceof HTMLSelectElement || e instanceof HTMLTextAreaElement;
function Mw(e, t) {
	let n = document.createElement(e);
	return n.className = t, n.setAttribute(xw, ""), n;
}
var Nw = class extends HTMLElement {
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
	#t = `af-field-${++Ow}`;
	#n = Mw("div", "af-field-row");
	#r = Mw("label", "af-field-label");
	#i = Mw("p", "af-field-description");
	#a = Mw("p", "af-field-error");
	#o = Object.assign(document.createElement("span"), {
		className: "af-field-required",
		textContent: "*"
	});
	#s = document.createElement("af-tooltip");
	#c = Object.assign(document.createElement("button"), {
		type: "button",
		className: "af-button ghost icon xs af-field-lock",
		innerHTML: Dw
	});
	#l = null;
	#u = null;
	#d = !1;
	#f = null;
	#p = /* @__PURE__ */ new WeakSet();
	constructor() {
		super(), this.#r.id = `${this.#t}-label`, this.#i.id = `${this.#t}-description`, this.#a.id = `${this.#t}-error`, this.#n.append(this.#r), this.#o.setAttribute("aria-hidden", "true"), this.#s.append(this.#c), this.#r.addEventListener("click", () => {
			let e = this.#f?.control;
			e && kw(e) && e.focus();
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
		for (let e of this.children) if (!Sw(e) && !e.hasAttribute("slot")) return e;
		return null;
	}
	connectedCallback() {
		this.#d = !0;
		for (let e of [
			...Object.keys(Ew),
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
		let e = he(this.locale, this.#e ?? void 0), t = this.lockedReason || null;
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
			stop: ww(this, r, i)
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
		if (kw(e)) {
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
		Aw(e) ? (this.#r.removeAttribute("for"), e.setAttribute("aria-labelledby", this.#r.id), t.labelledBy = !0) : (e.id ||= `${this.#t}-control`, this.#r.htmlFor = e.id);
		let o = /* @__PURE__ */ new Set([this.#i.id, this.#a.id]), s = [...(e.getAttribute("aria-describedby") ?? "").split(/\s+/).filter((e) => e && !o.has(e)), ...i];
		s.length ? e.setAttribute("aria-describedby", s.join(" ")) : e.removeAttribute("aria-describedby"), this.invalid || this.error ? e.getAttribute("aria-invalid") !== "true" && (e.setAttribute("aria-invalid", "true"), t.ariaInvalid = !0) : t.ariaInvalid &&= (e.removeAttribute("aria-invalid"), !1), this.required ? (e.getAttribute("aria-required") !== "true" && (e.setAttribute("aria-required", "true"), t.ariaRequired = !0), jw(e) && !e.required && (e.required = !0, t.required = !0)) : (t.ariaRequired && e.removeAttribute("aria-required"), t.required && jw(e) && (e.required = !1), t.ariaRequired = !1, t.required = !1), e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement ? r && !e.readOnly ? (e.readOnly = !0, t.readOnly = !0) : !r && t.readOnly && (e.readOnly = !1, t.readOnly = !1) : (e instanceof HTMLSelectElement || e.getAttribute("role") === "radiogroup") && (r && e.getAttribute("aria-readonly") !== "true" ? (e.setAttribute("aria-readonly", "true"), t.ariaReadonly = !0) : !r && t.ariaReadonly && (e.removeAttribute("aria-readonly"), t.ariaReadonly = !1));
	}
	#_(e) {
		let { control: t } = e;
		if (kw(t)) {
			for (let [n, r] of Object.entries(e.kit)) t[n] = r;
			return;
		}
		e.labelledBy && t.getAttribute("aria-labelledby") === this.#r.id && t.removeAttribute("aria-labelledby");
		let n = /* @__PURE__ */ new Set([this.#i.id, this.#a.id]), r = (t.getAttribute("aria-describedby") ?? "").split(/\s+/).filter((e) => e && !n.has(e));
		r.length ? t.setAttribute("aria-describedby", r.join(" ")) : t.removeAttribute("aria-describedby"), e.ariaInvalid && t.removeAttribute("aria-invalid"), e.ariaRequired && t.removeAttribute("aria-required"), e.required && jw(t) && (t.required = !1), e.readOnly && (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) && (t.readOnly = !1), e.ariaReadonly && t.removeAttribute("aria-readonly");
	}
};
Tw(Nw, Ew);
//#endregion
//#region src/kit/form/fieldset.ts
var Pw = {
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
}, Fw = 4, Iw = 0, Lw = (e) => {
	let t = Math.round(Number(e));
	return Number.isFinite(t) ? Math.max(1, Math.min(Fw, t)) : 1;
};
function Rw(e, t) {
	let n = e.getAttribute("data-span"), r = e.getAttribute("data-col");
	if (n === null && r === null) return null;
	let i = (e) => {
		let t = Math.trunc(Number(e ?? 1));
		return Number.isFinite(t) ? t : 1;
	}, a = Math.max(1, Math.min(t, i(n))), o = Math.max(1, Math.min(t, i(r)));
	return t > 1 ? `${Math.min(o, t - a + 1)} / span ${a}` : `span ${a} / span ${a}`;
}
var zw = class extends HTMLElement {
	static observedAttributes = [
		"heading",
		"description",
		"columns",
		"locale"
	];
	#e = null;
	#t = `af-fieldset-${++Iw}`;
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
		]) e.setAttribute(xw, "");
		this.#r.id = `${this.#t}-heading`;
	}
	get strings() {
		return this.#e;
	}
	set strings(e) {
		this.#e = e ?? null;
	}
	get columns() {
		return Lw(this.getAttribute("columns"));
	}
	set columns(e) {
		e == null ? this.removeAttribute("columns") : this.setAttribute("columns", String(e));
	}
	connectedCallback() {
		this.#c = !0;
		for (let e of [
			...Object.keys(Pw),
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
		for (let t of this.children) if (t instanceof HTMLFieldSetElement && !Sw(t)) {
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
			stop: ww(t, r, [])
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
			if (Sw(n) || !(n instanceof HTMLElement)) continue;
			let e = Rw(n, t);
			e === null ? this.#p(n) : n.style.getPropertyValue("grid-column") !== e && (n.style.setProperty("grid-column", e), this.#l.add(n));
		}
	}
	#p(e) {
		e instanceof HTMLElement && this.#l.has(e) && (e.style.removeProperty("grid-column"), this.#l.delete(e));
	}
};
Tw(zw, Pw);
//#endregion
//#region src/kit/form/form.ts
var Bw = {
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
}, Vw = "button:not([type]), [type=submit]", Hw = (e) => e.replace(/^\//, "").replace(/\//g, ".");
function Uw(e) {
	let t = e.control;
	if (!(t instanceof HTMLElement)) return;
	t.focus();
	let n = t.getRootNode().activeElement;
	(!n || n !== t && !t.contains(n)) && t.querySelector("input, select, textarea, button, [tabindex]:not([tabindex=\"-1\"])")?.focus();
}
var Ww = class extends HTMLElement {
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
		super(), this.#s.className = "af-form-summary af-banner danger", this.#s.setAttribute(xw, ""), this.#s.setAttribute("role", "alert"), this.#s.tabIndex = -1, this.addEventListener("submit", this.#m);
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
		for (let e of this.children) if (e instanceof HTMLFormElement && !Sw(e)) return e;
		return null;
	}
	connectedCallback() {
		for (let e of [
			...Object.keys(Bw),
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
		Ce(this, "af-submit", {
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
		let e = this.#p, t = new Set(this.busy && this.#n && e ? e.querySelectorAll(Vw) : []);
		for (let e of this.#o) t.has(e) || (e.getAttribute("aria-disabled") === "true" && e.removeAttribute("aria-disabled"), this.#o.delete(e));
		for (let e of t) e.getAttribute("aria-disabled") !== "true" && (e.setAttribute("aria-disabled", "true"), this.#o.add(e));
	}
	#y() {
		let e = this.#p;
		return e ? [...e.querySelectorAll("af-field")].filter((e) => e instanceof Nw) : [];
	}
	#b(e) {
		if (!this.#n) return;
		let t = this.#p, n = this.#y(), r = /* @__PURE__ */ new Map();
		for (let { path: e, message: t } of this.#t) {
			let n = Hw(String(e ?? ""));
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
			stop: ww(t, [this.#s], [])
		}) : (this.#c?.stop(), this.#c = null, this.#s.remove()), e && (this.#c ? this.#s.focus() : o[0] && Uw(o[0]));
	}
	#x() {
		let { unmatched: e, matched: t } = this.#l;
		if (!e.length) return;
		let n = he(this.locale, this.#e ?? void 0);
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
					t.preventDefault(), Uw(e);
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
Tw(Ww, Bw);
//#endregion
//#region src/kit/fonts.ts
var Gw = Symbol.for("@reflexify/agentflow-elements/kit/fonts");
function Kw() {
	let e = globalThis;
	return e[Gw] ??= {
		faces: /* @__PURE__ */ new Map(),
		ours: /* @__PURE__ */ new WeakSet()
	};
}
function qw(e) {
	return e.trim().replace(/^(["'])(.*)\1$/, "$2").trim().toLowerCase();
}
function Jw(e) {
	let t = Object.entries(e.descriptors ?? {}).sort(([e], [t]) => e.localeCompare(t));
	return JSON.stringify([
		e.family,
		e.url,
		t
	]);
}
function Yw(e, t) {
	console.warn("A font face did not load; text falls back to the module's font stack.", {
		family: e.family,
		url: e.url,
		error: String(t)
	});
}
function Xw(e) {
	if (typeof document > "u" || !document.fonts || typeof FontFace > "u") return Promise.resolve();
	let { faces: t, ours: n } = Kw(), r = e.map((e) => {
		let r = Jw(e), i = t.get(r);
		if (i) return i;
		let a = qw(e.family);
		for (let e of document.fonts) if (!n.has(e) && qw(e.family) === a) return Promise.resolve();
		let o;
		try {
			let t = new FontFace(e.family, `url(${JSON.stringify(e.url)})`, e.descriptors);
			document.fonts.add(t), n.add(t), o = t.load().then(() => void 0, (t) => Yw(e, t));
		} catch (t) {
			Yw(e, t), o = Promise.resolve();
		}
		return t.set(r, o), o;
	});
	return Promise.all(r).then(() => void 0);
}
//#endregion
//#region src/kit/index.ts
var Zw = {
	"af-dialog": Af,
	"af-confirm": tr,
	"af-menu": gm,
	"af-popover": vg,
	"af-tooltip": GS,
	"af-toast": dS,
	"af-date": wf,
	"af-person-picker": fg,
	"af-number-input": zh,
	"af-select": k_,
	"af-combobox": dl,
	"af-rich-editor": Ie,
	"af-tile": rx,
	"af-field": { element: Nw },
	"af-fieldset": { element: zw },
	"af-form": { element: Ww },
	"af-scroll-area": xg,
	"af-tabs": Qb,
	"af-splitter": gb,
	"af-pager": Xh,
	"af-copy-button": _l,
	"af-markdown": ar,
	"af-tree-picker": bw,
	"af-bulk-bar": Nr,
	"af-file-upload": He,
	"af-signature-pad": sy,
	"af-folder-source": ir,
	"af-activity-feed": be,
	"af-comment-thread": Xn
}, Qw = Object.keys(Zw);
for (let e of Object.values(Zw)) Object.defineProperty(e.element, "kitVersion", { value: ce });
function $w(e = customElements) {
	for (let [t, n] of Object.entries(Zw)) {
		let r = e.get(t);
		if (!r) e.define(t, n.element);
		else if (r !== n.element) {
			let e = r.kitVersion;
			H(e, ce) && console.warn(`An older copy of the AgentFlow UI kit registered ${t} first; this page uses it, not this copy.`, {
				tag: t,
				registered: e ?? null,
				loaded: ce
			});
		}
	}
}
$w();
//#endregion
export { ye as KIT_CSS, Qw as KIT_TAGS, ce as KIT_VERSION, nr as claimEscape, $w as defineKitElements, Xw as loadFonts };
