import { $ as e, A as t, B as n, C as r, D as i, E as a, F as o, G as s, H as c, I as l, J as u, K as d, L as f, M as p, N as m, O as h, P as g, Q as _, R as v, S as y, T as b, U as x, V as S, W as C, X as w, Y as T, Z as E, _ as D, a as O, at as k, b as A, c as j, ct as M, d as N, dt as P, et as F, f as ee, g as te, h as ne, i as I, it as L, j as R, k as z, l as re, lt as ie, n as B, nt as ae, ot as oe, q as V, r as H, rt as se, s as ce, st as U, t as W, tt as le, u as G, ut as ue, v as de, w as fe, x as pe, y as me, z as he } from "./chunks/client-ChLD-Y6I.js";
import { a as ge, c as _e, d as ve, f as ye, l as be, n as xe, o as Se, p as Ce, r as we, s as Te, u as Ee } from "./chunks/mention-chip-BXN044oa.js";
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/chunk-QZ7TP4HQ.mjs
var De = Object.defineProperty, Oe = (e, t, n) => t in e ? De(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, ke = (e, t, n) => Oe(e, typeof t == "symbol" ? t : t + "", n);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/caret.mjs
function Ae(e) {
	if (e) try {
		if (e.ownerDocument.activeElement !== e) return;
		let t = e.value.length;
		e.setSelectionRange(t, t);
	} catch {}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/shared.mjs
var je = (e, t) => e.map((n, r) => e[(Math.max(t, 0) + r) % e.length]), Me = () => void 0, Ne = (e) => typeof e == "object" && !!e, Pe = 2147483647, K = (e) => e ? "" : void 0, Fe = (e) => e ? "true" : void 0, Ie = /\\/g, Le = /"/g, Re = (e) => globalThis.CSS?.escape?.(e) ?? e.replace(Ie, "\\\\").replace(Le, "\\\""), ze = (e) => `[data-ownedby~="${Re(String(e))}"]`, Be = 1, Ve = 9, He = 11, Ue = (e) => Ne(e) && e.nodeType === Be && typeof e.nodeName == "string", We = (e) => Ne(e) && e.nodeType === Ve, Ge = (e) => Ne(e) && e === e.window, Ke = (e) => Ue(e) ? e.localName || "" : "#document";
function qe(e) {
	return [
		"html",
		"body",
		"#document"
	].includes(Ke(e));
}
var Je = (e) => Ne(e) && e.nodeType !== void 0, Ye = (e) => Je(e) && e.nodeType === He && "host" in e, Xe = (e) => Ue(e) && e.localName === "input", Ze = (e) => !!e?.matches("a[href]"), Qe = (e) => Ue(e) ? e.offsetWidth > 0 || e.offsetHeight > 0 || e.getClientRects().length > 0 : !1;
function $e(e) {
	return e ? ot(e.getRootNode()) === e : !1;
}
var et = /(textarea|select)/;
function tt(e) {
	if (e == null || !Ue(e)) return !1;
	try {
		return Xe(e) && e.selectionStart != null || et.test(e.localName) || e.isContentEditable || e.getAttribute("contenteditable") === "true" || e.getAttribute("contenteditable") === "";
	} catch {
		return !1;
	}
}
function nt(e, t) {
	if (!e || !t || !Ue(e) || !Je(t)) return !1;
	if (Ue(t) && e === t || e.contains(t)) return !0;
	let n = t.getRootNode?.();
	if (n && Ye(n)) {
		let n = t;
		for (; n;) {
			if (e === n) return !0;
			n = n.parentNode || n.host;
		}
	}
	return !1;
}
function rt(e) {
	return We(e) ? e : Ge(e) ? e.document : e?.ownerDocument ?? document;
}
function it(e) {
	return rt(e).documentElement;
}
function at(e) {
	return Ye(e) ? at(e.host) : We(e) ? e.defaultView ?? window : Ue(e) ? e.ownerDocument?.defaultView ?? window : window;
}
function ot(e) {
	let t = e.activeElement;
	for (; t?.shadowRoot;) {
		let e = t.shadowRoot.activeElement;
		if (!e || e === t) break;
		t = e;
	}
	return t;
}
function st(e) {
	if (Ke(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Ye(e) && e.host || it(e);
	return Ye(t) ? t.host : t;
}
function ct(e) {
	let t;
	try {
		if (t = e.getRootNode({ composed: !0 }), We(t) || Ye(t)) return t;
	} catch {}
	return e.ownerDocument ?? document;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/computed-style.mjs
var lt = /* @__PURE__ */ new WeakMap();
function ut(e) {
	return lt.has(e) || lt.set(e, at(e).getComputedStyle(e)), lt.get(e);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/controller.mjs
var dt = /* @__PURE__ */ new Set([
	"menu",
	"listbox",
	"dialog",
	"grid",
	"tree",
	"region",
	"application"
]), ft = (e) => dt.has(e), pt = (e) => e.getAttribute("aria-controls")?.split(" ") || [];
function mt(e, t) {
	let n = /* @__PURE__ */ new Set(), r = ct(e), i = (e) => {
		let a = e.querySelectorAll("[aria-controls]");
		for (let e of a) {
			if (e.getAttribute("aria-expanded") !== "true") continue;
			let a = pt(e);
			for (let e of a) {
				if (!e || n.has(e)) continue;
				n.add(e);
				let a = r.getElementById(e);
				if (a) {
					let e = a.getAttribute("role"), n = a.getAttribute("aria-modal") === "true";
					if (e && ft(e) && !n && (a === t || a.contains(t) || i(a))) return !0;
				}
			}
		}
		return !1;
	};
	return i(e);
}
function ht(e, t) {
	let n = ct(e), r = /* @__PURE__ */ new Set(), i = (e) => {
		let a = e.querySelectorAll("[aria-controls]");
		for (let e of a) {
			if (e.getAttribute("aria-expanded") !== "true") continue;
			let a = pt(e);
			for (let e of a) {
				if (!e || r.has(e)) continue;
				r.add(e);
				let a = n.getElementById(e);
				if (a) {
					let e = a.getAttribute("role"), n = a.getAttribute("aria-modal") === "true";
					e && dt.has(e) && !n && (t(a), i(a));
				}
			}
		}
	};
	i(e);
}
function gt(e) {
	let t = /* @__PURE__ */ new Set();
	return ht(e, (n) => {
		e.contains(n) || t.add(n);
	}), Array.from(t);
}
function _t(e) {
	let t = e.getAttribute("role");
	return !!(t && dt.has(t));
}
function vt(e) {
	return e.hasAttribute("aria-controls") && e.getAttribute("aria-expanded") === "true";
}
function yt(e) {
	return vt(e) ? !0 : !!e.querySelector?.("[aria-controls][aria-expanded=\"true\"]");
}
function bt(e) {
	if (!e.id) return !1;
	let t = ct(e), n = CSS.escape(e.id), r = `[aria-controls~="${n}"][aria-expanded="true"], [aria-controls="${n}"][aria-expanded="true"]`;
	return !!(t.querySelector(r) && _t(e));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/platform.mjs
var xt = () => typeof document < "u";
function St() {
	return navigator.userAgentData?.platform ?? navigator.platform;
}
function Ct() {
	let e = navigator.userAgentData;
	return e && Array.isArray(e.brands) ? e.brands.map(({ brand: e, version: t }) => `${e}/${t}`).join(" ") : navigator.userAgent;
}
var wt = (e) => xt() && e.test(St()), Tt = (e) => xt() && e.test(Ct()), Et = (e) => xt() && e.test(navigator.vendor), Dt = /^iPhone/i, Ot = /^iPad/i, kt = /^Mac/i, At = /apple/i, jt = /Firefox/i, Mt = /Android/i, Nt = () => xt() && !!navigator.maxTouchPoints, Pt = () => wt(Dt), Ft = () => wt(Ot) || Rt() && navigator.maxTouchPoints > 1, It = () => Pt() || Ft(), Lt = () => Rt() || It(), Rt = () => wt(kt), zt = () => Lt() && Et(At), Bt = () => Tt(jt), Vt = () => Tt(Mt);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/event.mjs
function Ht(e) {
	return e.composedPath?.() ?? e.nativeEvent?.composedPath?.();
}
function Ut(e) {
	return Ht(e)?.[0] ?? e.target;
}
function Wt(e) {
	let t = e.currentTarget;
	if (!t || !t.matches("a[href], button[type='submit'], input[type='submit']")) return !1;
	let n = e.button === 1, r = qt(e);
	return n || r;
}
function Gt(e) {
	let t = e.currentTarget;
	if (!t) return !1;
	let n = t.localName;
	return e.altKey ? n === "a" || n === "button" && t.type === "submit" || n === "input" && t.type === "submit" : !1;
}
function Kt(e) {
	return rn(e).isComposing || e.keyCode === 229;
}
function qt(e) {
	return Rt() ? e.metaKey : e.ctrlKey;
}
function Jt(e) {
	return e.key.length === 1 && !e.ctrlKey && !e.metaKey;
}
function Yt(e) {
	return e.pointerType === "" && e.isTrusted ? !0 : Vt() && e.pointerType ? e.type === "click" && e.buttons === 1 : e.detail === 0 && !e.pointerType;
}
var Xt = (e) => e.button === 0, Zt = (e) => e.button === 2 || Rt() && e.ctrlKey && e.button === 0, Qt = (e) => e.ctrlKey || e.altKey || e.metaKey, $t = (e) => "touches" in e && e.touches.length > 0, en = {
	Up: "ArrowUp",
	Down: "ArrowDown",
	Esc: "Escape",
	" ": "Space",
	",": "Comma",
	Left: "ArrowLeft",
	Right: "ArrowRight"
}, tn = {
	ArrowLeft: "ArrowRight",
	ArrowRight: "ArrowLeft"
};
function nn(e, t = {}) {
	let { dir: n = "ltr", orientation: r = "horizontal" } = t, i = e.key;
	return i = en[i] ?? i, n === "rtl" && r === "horizontal" && i in tn && (i = tn[i]), i;
}
function rn(e) {
	return e.nativeEvent ?? e;
}
function an(e, t = "client") {
	let n = $t(e) ? e.touches[0] || e.changedTouches[0] : e;
	return {
		x: n[`${t}X`],
		y: n[`${t}Y`]
	};
}
var on = (e, t, n, r) => {
	let i = typeof e == "function" ? e() : e;
	return i?.addEventListener(t, n, r), () => {
		i?.removeEventListener(t, n, r);
	};
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/form.mjs
function sn(e, t) {
	let { type: n = "HTMLInputElement", property: r = "value" } = t, i = at(e)[n].prototype;
	return Object.getOwnPropertyDescriptor(i, r) ?? {};
}
function cn(e) {
	if (e.localName === "input") return "HTMLInputElement";
	if (e.localName === "textarea") return "HTMLTextAreaElement";
	if (e.localName === "select") return "HTMLSelectElement";
}
function ln(e, t, n = "value") {
	if (!e) return;
	let r = cn(e);
	r && sn(e, {
		type: r,
		property: n
	}).set?.call(e, t), e.setAttribute(n, t);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/tabbable.mjs
var un = (e) => Ue(e) && e.tagName === "IFRAME", dn = /^(audio|video|details)$/;
function fn(e) {
	let t = e.getAttribute("tabindex");
	return t ? parseInt(t, 10) : NaN;
}
var pn = (e) => !Number.isNaN(fn(e)), mn = (e) => fn(e) < 0;
function hn(e) {
	return Xe(e) && e.type === "radio";
}
function gn(e) {
	if (!hn(e) || !e.name || e.checked) return !0;
	let t = `input[type="radio"][name="${CSS.escape(e.name)}"]`, n = e.form ?? e.ownerDocument, r = Array.from(n.querySelectorAll(t)).filter((t) => t.form === e.form && xn(t)), i = r.find((e) => e.checked);
	return i ? i === e : r[0] === e;
}
function _n(e, t) {
	if (!t) return null;
	if (t === !0) return e.shadowRoot || null;
	let n = t(e);
	return (n === !0 ? e.shadowRoot : n) || null;
}
function vn(e, t, n) {
	let r = [...e], i = [...e], a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
	e.forEach((e, t) => o.set(e, t));
	let s = 0;
	for (; s < i.length;) {
		let e = i[s++];
		if (!e || a.has(e)) continue;
		a.add(e);
		let c = _n(e, t);
		if (c) {
			let t = Array.from(c.querySelectorAll(yn)).filter(n), a = o.get(e);
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
var yn = "input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], button:not([disabled]), [tabindex], iframe, object, embed, area[href], audio[controls], video[controls], [contenteditable]:not([contenteditable='false']), details > summary:first-of-type", bn = (e, t = {}) => {
	if (!e) return [];
	let { includeContainer: n = !1, getShadowRoot: r } = t, i = Array.from(e.querySelectorAll(yn));
	(n == 1 || n == "if-empty" && i.length === 0) && Ue(e) && xn(e) && i.unshift(e);
	let a = [];
	for (let e of i) if (xn(e)) {
		if (un(e) && e.contentDocument) {
			let t = e.contentDocument.body;
			a.push(...bn(t, { getShadowRoot: r }));
			continue;
		}
		a.push(e);
	}
	return r ? vn(a, r, xn) : a;
};
function xn(e) {
	return !Ue(e) || e.closest("[inert]") ? !1 : e.matches(yn) && Qe(e);
}
function Sn(e, t = {}) {
	if (!e) return [];
	let { includeContainer: n, getShadowRoot: r } = t, i = Array.from(e.querySelectorAll(yn));
	n && Cn(e) && i.unshift(e);
	let a = [];
	for (let e of i) if (Cn(e)) {
		if (un(e) && e.contentDocument) {
			let t = e.contentDocument.body;
			a.push(...Sn(t, { getShadowRoot: r }));
			continue;
		}
		a.push(e);
	}
	if (r) {
		let e = vn(a, r, Cn);
		return !e.length && n ? i : e;
	}
	return !a.length && n ? i : a;
}
function Cn(e) {
	return Ue(e) && e.tabIndex > 0 ? !0 : !xn(e) || mn(e) ? !1 : gn(e);
}
function wn(e, t = {}) {
	let n = Sn(e, t);
	return [n[0] || null, n[n.length - 1] || null];
}
function Tn(e) {
	return e.tabIndex < 0 && (dn.test(e.localName) || tt(e)) && !pn(e) ? 0 : e.tabIndex;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/initial-focus.mjs
function En(e) {
	let { root: t, getInitialEl: n, filter: r, enabled: i = !0 } = e;
	if (!i) return;
	let a = typeof n == "function" ? n() : n;
	return a ||= t?.querySelector("[data-autofocus],[autofocus]"), a ||= Sn(t).filter((e) => !r || r(e)).find((e) => !e.hasAttribute("data-no-autofocus")), a || t || void 0;
}
function Dn(e) {
	let t = e.currentTarget;
	if (!t) return !1;
	let [n, r] = wn(t);
	return !($e(n) && e.shiftKey || $e(r) && !e.shiftKey || !n && !r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/raf.mjs
var On = class e {
	constructor() {
		ke(this, "id", null), ke(this, "fn_cleanup"), ke(this, "cleanup", () => {
			this.cancel();
		});
	}
	static create() {
		return new e();
	}
	request(e) {
		this.cancel(), this.id = globalThis.requestAnimationFrame(() => {
			this.id = null, this.fn_cleanup = e?.();
		});
	}
	cancel() {
		this.id !== null && (globalThis.cancelAnimationFrame(this.id), this.id = null), this.fn_cleanup?.(), this.fn_cleanup = void 0;
	}
	isActive() {
		return this.id !== null;
	}
};
function q(e) {
	let t = On.create();
	return t.request(e), t.cleanup;
}
function kn(e) {
	let t = /* @__PURE__ */ new Set();
	function n(e) {
		let n = globalThis.requestAnimationFrame(e);
		t.add(() => globalThis.cancelAnimationFrame(n));
	}
	return n(() => n(e)), function() {
		t.forEach((e) => e());
	};
}
function An(e, t, n) {
	let r = q(() => {
		e.removeEventListener(t, i, !0), n();
	}), i = () => {
		r(), n();
	};
	return e.addEventListener(t, i, {
		once: !0,
		capture: !0
	}), r;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/mutation-observer.mjs
function jn(e, t) {
	if (!e) return;
	let { attributes: n, callback: r } = t, i = new (e.ownerDocument.defaultView || window).MutationObserver((e) => {
		for (let t of e) t.type === "attributes" && t.attributeName && n.includes(t.attributeName) && r(t);
	});
	return i.observe(e, {
		attributes: !0,
		attributeFilter: n
	}), () => i.disconnect();
}
function Mn(e, t) {
	let { defer: n } = t, r = n ? q : (e) => e(), i = [];
	return i.push(r(() => {
		let n = typeof e == "function" ? e() : e;
		i.push(jn(n, t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/navigate.mjs
function Nn(e) {
	let t = () => {
		let t = at(e);
		e.dispatchEvent(new t.MouseEvent("click"));
	};
	Bt() ? An(e, "keyup", t) : queueMicrotask(t);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/overflow.mjs
function Pn(e) {
	let t = st(e);
	return qe(t) ? rt(t).body : Ue(t) && Rn(t) ? t : Pn(t);
}
function Fn(e, t = []) {
	let n = Pn(e), r = n === e.ownerDocument.body, i = at(n);
	return r ? t.concat(i, i.visualViewport || [], Rn(n) ? n : []) : t.concat(n, Fn(n, []));
}
var In = /auto|scroll|overlay|hidden|clip/, Ln = /* @__PURE__ */ new Set(["inline", "contents"]);
function Rn(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = at(e).getComputedStyle(e);
	return In.test(t + r + n) && !Ln.has(i);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/text-selection.mjs
var zn = "default", Bn = "", Vn = /* @__PURE__ */ new WeakMap();
function Hn(e = {}) {
	let { target: t, doc: n } = e, r = n ?? document, i = r.documentElement;
	return It() ? (zn === "default" && (Bn = i.style.webkitUserSelect, i.style.webkitUserSelect = "none"), zn = "disabled") : t && (Vn.set(t, t.style.userSelect), t.style.userSelect = "none"), () => Un({
		target: t,
		doc: r
	});
}
function Un(e = {}) {
	let { target: t, doc: n } = e, r = (n ?? document).documentElement;
	if (It()) {
		if (zn !== "disabled") return;
		zn = "restoring", setTimeout(() => {
			kn(() => {
				zn === "restoring" && (r.style.webkitUserSelect === "none" && (r.style.webkitUserSelect = Bn || ""), Bn = "", zn = "default");
			});
		}, 300);
	} else if (t && Vn.has(t)) {
		let e = Vn.get(t);
		t.style.userSelect === "none" && (t.style.userSelect = e ?? ""), t.getAttribute("style") === "" && t.removeAttribute("style"), Vn.delete(t);
	}
}
function Wn(e = {}) {
	let { defer: t, target: n, ...r } = e, i = t ? q : (e) => e(), a = [];
	return a.push(i(() => {
		let e = typeof n == "function" ? n() : n;
		a.push(Hn({
			...r,
			target: e
		}));
	})), () => {
		a.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/proxy-tab-focus.mjs
function Gn(e) {
	return e == null ? null : typeof e == "function" ? e() : e;
}
function Kn(e, t, n) {
	if (!t) return null;
	let r = Sn(e.ownerDocument.body, { getShadowRoot: n }), i = r.indexOf(t);
	if (i === -1) return null;
	for (let t = i + 1; t < r.length; t++) {
		let n = r[t];
		if (!nt(e, n)) return n;
	}
	return null;
}
function qn(e, t = {}) {
	let { triggerElement: n, onFocus: r, onFocusEnter: i, getShadowRoot: a } = t, o = (Gn(e) ?? Gn(n))?.ownerDocument || document;
	function s(t) {
		if (t.key !== "Tab") return;
		let o = Gn(e), s = Gn(n);
		if (!o) return;
		let [c, l] = wn(o, {
			includeContainer: !0,
			getShadowRoot: a
		}), u = !c && !l, d = null;
		t.shiftKey && ($e(c) || u) ? d = s : !t.shiftKey && $e(s) ? (i?.(), d = c) : !t.shiftKey && ($e(l) || u) ? d = Kn(o, s, a) : t.shiftKey && $e(Kn(o, s, a)) && (i?.(), d = l), d && (t.preventDefault(), typeof r == "function" ? r(d) : d.focus());
	}
	return on(o, "keydown", s, !0);
}
function Jn(e, t) {
	let { defer: n, ...r } = t, i = n ? q : (e) => e(), a = [];
	return a.push(i(() => {
		a.push(qn(e, r));
	})), () => {
		a.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/query.mjs
function Yn(e, t) {
	return Array.from(e?.querySelectorAll(t) ?? []);
}
function Xn(e, t) {
	return e?.querySelector(t) ?? null;
}
var Zn = (e) => e.id;
function Qn(e, t, n = Zn) {
	return e.find((e) => n(e) === t);
}
function $n(e, t, n = Zn) {
	let r = Qn(e, t, n);
	return r ? e.indexOf(r) : -1;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/scroll.mjs
function er(e) {
	return e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth;
}
function tr(e, t) {
	let { rootEl: n, ...r } = t || {};
	e && n && Rn(n) && er(n) && e.scrollIntoView(r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/searchable.mjs
var nr = (e) => e.split("").map((e) => {
	let t = e.charCodeAt(0);
	return t > 0 && t < 128 ? e : t >= 128 && t <= 255 ? `/x${t.toString(16)}`.replace("/", "\\") : "";
}).join("").trim(), rr = (e) => nr(e.dataset?.valuetext ?? e.textContent ?? ""), ir = (e, t) => e.trim().toLowerCase().startsWith(t.toLowerCase());
function ar(e, t, n, r = Zn) {
	let i = n ? $n(e, n, r) : -1, a = n ? je(e, i) : e;
	return t.length === 1 && (a = a.filter((e) => r(e) !== n)), a.find((e) => ir(rr(e), t));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/set.mjs
function or(e, t) {
	if (!e) return Me;
	let n = Object.keys(t).reduce((t, n) => (t[n] = e.style.getPropertyValue(n), t), {});
	return cr(n, t) ? Me : (Object.assign(e.style, t), () => {
		Object.assign(e.style, n), e.style.length === 0 && e.removeAttribute("style");
	});
}
function sr(e, t, n) {
	if (!e) return Me;
	let r = e.style.getPropertyValue(t);
	return r === n ? Me : (e.style.setProperty(t, n), () => {
		e.style.setProperty(t, r), e.style.length === 0 && e.removeAttribute("style");
	});
}
function cr(e, t) {
	return Object.keys(e).every((n) => e[n] === t[n]);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/typeahead.mjs
function lr(e, t) {
	let { state: n, activeId: r, key: i, timeout: a = 350, itemToId: o } = t, s = n.keysSoFar + i, c = s.length > 1 && Array.from(s).every((e) => e === s[0]) ? s[0] : s, l = ar(e.slice(), c, r, o);
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
var ur = /* @__PURE__ */ Object.assign(lr, {
	defaultOptions: {
		keysSoFar: "",
		timer: -1
	},
	isValidEvent: dr
});
function dr(e) {
	return e.key.length === 1 && !e.ctrlKey && !e.metaKey;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/wait-for.mjs
function fr(e, t, n) {
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
function pr(e, t) {
	let { timeout: n, rootNode: r } = t, i = at(r), a = rt(r), o = new i.AbortController();
	return fr(new Promise((t) => {
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
function mr(e, t, n = {}) {
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
			o.push(q(() => {
				e || s(a());
			}));
		});
	}
	return () => {
		o.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/utils/run-if-fn.js
var hr = (e) => typeof e == "function", gr = (e, ...t) => hr(e) ? e(...t) : e;
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/utils/create-context.js
function _r(e, t) {
	return `${e} returned \`undefined\`. Seems you forgot to wrap component within ${t}`;
}
var vr = (e) => {
	let { name: t, strict: n = !0, hookName: r = "useContext", providerName: i = "Provider", errorMessage: a, defaultValue: o } = e, s = Symbol(t);
	return [
		(e) => oe(s, e),
		() => {
			let e = se(s);
			if (n && !e) throw Error(a ?? _r(r, i));
			return e ? ae(s) : o;
		},
		s
	];
}, [yr, br] = vr({
	name: "EnvironmentContext",
	strict: !1,
	defaultValue: () => ({
		getRootNode: () => document,
		getDocument: () => document,
		getWindow: () => window
	})
}), xr = m("<span hidden=\"\"></span>"), Sr = m("<!> <!>", 1);
function Cr(t, n) {
	k(n, !0);
	let r = B(n, "value", 7), i = B(n, "children", 7), a = _(null), o = () => gr(r()) ?? S(a)?.ownerDocument ?? document, s = F(() => ({
		getRootNode: o,
		getDocument: () => rt(o()),
		getWindow: () => at(o())
	}));
	yr(() => S(s));
	var c = {
		get value() {
			return r();
		},
		set value(t) {
			r(t), e();
		},
		get children() {
			return i();
		},
		set children(t) {
			i(t), e();
		}
	}, l = Sr(), u = V(l);
	z(u, () => i() ?? ue);
	var d = T(u, 2), f = (e) => {
		var t = xr();
		O(t, (e) => E(a, e), () => S(a)), R(e, t);
	};
	return b(d, (e) => {
		r() || e(f);
	}), R(t, l), L(c);
}
W(Cr, {
	value: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/utils/create-split-props.js
var wr = () => (e, t) => t.reduce((e, t) => {
	let [n, r] = e, i = t;
	return r[i] !== void 0 && (n[i] = r[i]), delete r[i], [n, r];
}, [{}, { ...e }]), [Tr, Er] = vr({
	name: "RenderStrategyContext",
	hookName: "useRenderStrategyContext",
	providerName: "<RenderStrategyPropsProvider />"
}), Dr = wr(), Or = (e) => Dr(e, ["lazyMount", "unmountOnExit"]), kr = Object.defineProperty, Ar = (e) => {
	throw TypeError(e);
}, jr = (e, t, n) => t in e ? kr(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, Mr = (e, t, n) => jr(e, typeof t == "symbol" ? t : t + "", n), Nr = (e, t, n) => t.has(e) || Ar("Cannot " + n), Pr = (e, t, n) => (Nr(e, t, "read from private field"), n ? n.call(e) : t.get(e)), Fr = (e, t, n) => t.has(e) ? Ar("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/array.mjs
function Ir(e) {
	return e == null ? [] : Array.isArray(e) ? e : [e];
}
var Lr = (e) => e[0], Rr = (e) => e[e.length - 1], zr = (e, t) => e.indexOf(t) !== -1, Br = (e, ...t) => e.concat(t), Vr = (e, ...t) => e.filter((e) => !t.includes(e)), Hr = (e) => Array.from(new Set(e)), Ur = (e, t) => zr(e, t) ? Vr(e, t) : Br(e, t);
function Wr(e, t, n = {}) {
	let { step: r = 1, loop: i = !0 } = n, a = t + r, o = e.length, s = o - 1;
	return t === -1 ? r > 0 ? 0 : s : a < 0 ? i ? s : 0 : a >= o ? i ? 0 : t > o ? o : t : a;
}
function Gr(e, t, n = {}) {
	return e[Wr(e, t, n)];
}
function Kr(e, t, n = {}) {
	let { step: r = 1, loop: i = !0 } = n;
	return Wr(e, t, {
		step: -r,
		loop: i
	});
}
function qr(e, t, n = {}) {
	return e[Kr(e, t, n)];
}
function Jr(e, t) {
	return e.reduce((e, n, r) => (r % t === 0 ? e.push([n]) : Rr(e)?.push(n), e), []);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/equal.mjs
var Yr = (e) => e?.constructor.name === "Array", Xr = (e, t) => {
	if (e.length !== t.length) return !1;
	for (let n = 0; n < e.length; n++) if (!Zr(e[n], t[n])) return !1;
	return !0;
}, Zr = (e, t) => {
	if (Object.is(e, t)) return !0;
	if (e == null && t != null || e != null && t == null) return !1;
	if (typeof e?.isEqual == "function" && typeof t?.isEqual == "function") return e.isEqual(t);
	if (typeof e == "function" && typeof t == "function") return e.toString() === t.toString();
	if (Yr(e) && Yr(t)) return Xr(Array.from(e), Array.from(t));
	if (typeof e != "object" || typeof t != "object") return !1;
	let n = Object.keys(t ?? /* @__PURE__ */ Object.create(null)), r = n.length;
	for (let t = 0; t < r; t++) if (!Reflect.has(e, n[t])) return !1;
	for (let i = 0; i < r; i++) {
		let r = n[i];
		if (!Zr(e[r], t[r])) return !1;
	}
	return !0;
}, Qr = (e) => Array.isArray(e), $r = (e) => e === !0 || e === !1, ei = (e) => typeof e == "object" && !!e, ti = (e) => ei(e) && !Qr(e), ni = (e) => typeof e == "string", ri = (e) => typeof e == "function", ii = (e) => e == null, ai = (e, t) => Object.prototype.hasOwnProperty.call(e, t), oi = (e) => Object.prototype.toString.call(e), si = Function.prototype.toString, ci = si.call(Object), li = (e) => {
	if (!ei(e) || oi(e) != "[object Object]" || fi(e)) return !1;
	let t = Object.getPrototypeOf(e);
	if (t === null) return !0;
	let n = ai(t, "constructor") && t.constructor;
	return typeof n == "function" && n instanceof n && si.call(n) == ci;
}, ui = (e) => typeof e == "object" && !!e && "$$typeof" in e && "props" in e, di = (e) => typeof e == "object" && !!e && "__v_isVNode" in e, fi = (e) => ui(e) || di(e), pi = (e, ...t) => (typeof e == "function" ? e(...t) : e) ?? void 0, mi = (e) => e, hi = (e) => e(), gi = () => {}, _i = (...e) => (...t) => {
	e.forEach(function(e) {
		e?.(...t);
	});
}, vi = /* @__PURE__ */ (() => {
	let e = 0;
	return () => (e++, e.toString(36));
})();
function yi(e, t, ...n) {
	if (e in t) {
		let r = t[e];
		return ri(r) ? r(...n) : r;
	}
	let r = /* @__PURE__ */ Error(`No matching key: ${JSON.stringify(e)} in ${JSON.stringify(Object.keys(t))}`);
	throw Error.captureStackTrace?.(r, yi), r;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/number.mjs
var { floor: bi, abs: xi, round: Si, min: Ci, max: wi, pow: Ti, sign: Ei } = Math, Di = (e) => Number.isNaN(e), Oi = (e) => Di(e) ? 0 : e, ki = (e, t, n) => {
	let r = Oi(e);
	return (t == null || r >= t) && (n == null || r <= n);
}, Ai = (e, t, n) => Ci(wi(Oi(e), t), n);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/object.mjs
function ji(e) {
	if (!li(e) || e === void 0) return e;
	let t = Reflect.ownKeys(e).filter((e) => typeof e == "string"), n = {};
	for (let r of t) {
		let t = e[r];
		t !== void 0 && (n[r] = ji(t));
	}
	return n;
}
function Mi(e, t) {
	if (!t) return e;
	let n = { ...e }, r = t;
	for (let e in r) {
		let t = r[e];
		t !== void 0 && (n[e] = t);
	}
	return n;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/store.mjs
function Ni(e, t = Object.is) {
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
var Pi = () => performance.now(), Fi, Ii = class {
	constructor(e) {
		Mr(this, "onTick", e), Mr(this, "frameId", null), Mr(this, "pausedAtMs", null), Mr(this, "context"), Mr(this, "cancelFrame", () => {
			this.frameId !== null && (cancelAnimationFrame(this.frameId), this.frameId = null);
		}), Mr(this, "setStartMs", (e) => {
			this.context.startMs = e;
		}), Mr(this, "start", () => {
			if (this.frameId !== null) return;
			let e = Pi();
			this.pausedAtMs === null ? this.context.startMs = e : (this.context.startMs += e - this.pausedAtMs, this.pausedAtMs = null), this.frameId = requestAnimationFrame(Pr(this, Fi));
		}), Mr(this, "pause", () => {
			this.frameId !== null && (this.cancelFrame(), this.pausedAtMs = Pi());
		}), Mr(this, "stop", () => {
			this.frameId !== null && (this.cancelFrame(), this.pausedAtMs = null);
		}), Fr(this, Fi, (e) => {
			if (this.context.now = e, this.context.deltaMs = e - this.context.startMs, this.onTick(this.context) === !1) {
				this.stop();
				return;
			}
			this.frameId = requestAnimationFrame(Pr(this, Fi));
		}), this.context = {
			now: 0,
			startMs: Pi(),
			deltaMs: 0
		};
	}
	get elapsedMs() {
		return this.pausedAtMs === null ? Pi() - this.context.startMs : this.pausedAtMs - this.context.startMs;
	}
};
Fi = /* @__PURE__ */ new WeakMap();
function Li(e, t) {
	let n = new Ii(({ deltaMs: n }) => {
		if (n >= t) return e(), !1;
	});
	return n.start(), () => n.stop();
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/warning.mjs
function Ri(...e) {
	let t = e.length === 1 ? e[0] : e[1];
	(e.length !== 2 || e[0]) && process.env.NODE_ENV !== "production" && console.warn(t);
}
function zi(...e) {
	let t = e.length === 1 ? e[0] : e[1];
	if ((e.length !== 2 || e[0]) && process.env.NODE_ENV !== "production") throw Error(t);
}
function Bi(e, t) {
	if (e == null) throw Error(t());
}
function Vi(e, t, n) {
	let r = [];
	for (let n of t) e[n] ?? r.push(n);
	if (r.length > 0) throw Error(`[zag-js${n ? ` > ${n}` : ""}] missing required props: ${r.join(", ")}`);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/merge-props.mjs
var Hi = (...e) => e.map((e) => e?.trim?.()).filter(Boolean).join(" "), Ui = (...e) => Array.from(new Set(Hi(...e).split(/\s+/).filter(Boolean))).join(" "), Wi = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g, Gi = (e) => {
	let t = {}, n;
	for (; n = Wi.exec(e);) t[n[1]] = n[2];
	return t;
}, Ki = (e, t) => {
	if (ni(e)) {
		if (ni(t)) return `${e};${t}`;
		e = Gi(e);
	} else ni(t) && (t = Gi(t));
	return Object.assign({}, e ?? {}, t ?? {});
};
function qi(...e) {
	let t = {};
	for (let n of e) {
		if (!n) continue;
		for (let e in t) {
			if (e.startsWith("on") && typeof t[e] == "function" && typeof n[e] == "function") {
				t[e] = _i(n[e], t[e]);
				continue;
			}
			if (e === "className" || e === "class") {
				t[e] = Hi(t[e], n[e]);
				continue;
			}
			if (e === "style") {
				t[e] = Ki(t[e], n[e]);
				continue;
			}
			if (e === "data-ownedby") {
				t[e] = Ui(t[e], n[e]);
				continue;
			}
			t[e] = n[e] === void 0 ? t[e] : n[e];
		}
		for (let e in n) t[e] === void 0 && (t[e] = n[e]);
		let e = Object.getOwnPropertySymbols(n);
		for (let r of e) t[r] = n[r];
	}
	return t;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/memo.mjs
function Ji(e, t, n) {
	let r = [], i;
	return (a) => {
		let o = e(a);
		return o.length !== r.length || o.some((e, t) => !Zr(r[t], e)) ? (r = o, i = t(o, a), n?.onChange?.(i), i) : i;
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/state.mjs
var Yi = ".", Xi = "#", Zi = /* @__PURE__ */ new WeakMap(), Qi = /* @__PURE__ */ new WeakMap();
function $i(e) {
	return e.join(Yi);
}
function ea(e) {
	return e.includes(Yi);
}
function ta(e) {
	return e.startsWith(Xi);
}
function na(e) {
	return e.startsWith(Yi);
}
function ra(e) {
	return ta(e) ? e.slice(Xi.length) : e;
}
function ia(e, t) {
	return e ? `${e}${Yi}${t}` : t;
}
function aa(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = (e, i) => {
		t.set(e, i);
		let a = i.id;
		a && (n.has(a) && zi(`[zag-js] Duplicate state id: "${a}"`), n.set(a, e));
		let o = i.states;
		if (o) {
			Bi(i.initial, () => `[zag-js] Compound state "${e}" has child states but no "initial" property`), i.initial in o || zi(`[zag-js] Compound state "${e}" has initial "${String(i.initial)}" which is not a child state`);
			for (let [t, n] of Object.entries(o)) {
				if (!n) continue;
				let i = ia(e, t);
				r(i, n);
			}
		}
	};
	for (let [t, n] of Object.entries(e.states)) n && r(t, n);
	return {
		index: t,
		idIndex: n
	};
}
function oa(e) {
	let t = Zi.get(e);
	if (t) return t;
	let { index: n, idIndex: r } = aa(e);
	return Zi.set(e, n), Qi.set(e, r), n;
}
function sa(e, t) {
	return oa(e), Qi.get(e)?.get(t);
}
function ca(e) {
	return e ? String(e).split(Yi).filter(Boolean) : [];
}
function la(e, t) {
	if (!t) return [];
	let n = oa(e), r = ca(t), i = [], a = [];
	for (let e of r) {
		a.push(e);
		let t = $i(a), r = n.get(t);
		if (!r) break;
		i.push({
			path: t,
			state: r
		});
	}
	return i;
}
function ua(e, t) {
	let n = oa(e), r = ca(t);
	if (!r.length) return t;
	let i = [];
	for (let e of r) {
		i.push(e);
		let r = $i(i);
		if (!n.has(r)) return t;
	}
	let a = $i(i), o = n.get(a);
	for (; o?.initial;) {
		let e = `${a}${Yi}${o.initial}`, t = n.get(e);
		if (!t) break;
		a = e, o = t;
	}
	return a;
}
function da(e, t) {
	return oa(e).has(t);
}
function fa(e, t, n) {
	let r = String(t);
	if (ta(r)) {
		let t = ra(r), n = sa(e, t);
		return Bi(n, () => `[zag-js] Unknown state id: "${t}"`), ua(e, n);
	}
	if (na(r) && n) return ua(e, ia(n, r.slice(1)));
	if (!ea(r) && n) {
		let t = ca(n);
		for (let n = t.length - 1; n >= 1; n--) {
			let i = ia(t.slice(0, n).join(Yi), r);
			if (da(e, i)) return ua(e, i);
		}
		if (da(e, r)) return ua(e, r);
	}
	return ua(e, r);
}
function pa(e, t, n) {
	let r = la(e, t);
	for (let e = r.length - 1; e >= 0; e--) {
		let t = r[e]?.state.on?.[n];
		if (t) return {
			transitions: t,
			source: r[e]?.path
		};
	}
	return {
		transitions: e.on?.[n],
		source: void 0
	};
}
function ma(e, t, n, r) {
	let i = t ? la(e, t) : [], a = la(e, n), o = 0;
	for (; o < i.length && o < a.length && i[o]?.path === a[o]?.path;) o += 1;
	let s = i.slice(o).reverse(), c = a.slice(o), l = i[i.length - 1]?.path === a[a.length - 1]?.path;
	return r && l && (s = i.slice().reverse(), c = a), {
		exiting: s,
		entering: c
	};
}
function ha(e, t) {
	return e ? e === t || e.startsWith(`${t}${Yi}`) : !1;
}
function ga(e, t, n) {
	return la(e, t).some((e) => e.state.tags?.includes(n));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/create-machine.mjs
function _a() {
	return {
		and: (...e) => function(t) {
			return e.every((e) => t.guard(e));
		},
		or: (...e) => function(t) {
			return e.some((e) => t.guard(e));
		},
		not: (e) => function(t) {
			return !t.guard(e);
		}
	};
}
function va(e) {
	return oa(e), e;
}
function ya() {
	return {
		guards: _a(),
		createMachine: (e) => va(e),
		choose: (e) => function({ choose: t }) {
			return t(e)?.actions;
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/types.mjs
var ba = /* @__PURE__ */ ((e) => (e.NotStarted = "Not Started", e.Started = "Started", e.Stopped = "Stopped", e))(ba || {}), xa = "__init__";
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/scope.mjs
function Sa(e) {
	let t = () => e.getRootNode?.() ?? document, n = () => rt(t()), r = () => n().defaultView ?? window, i = () => ot(t()), a = (e) => t().getElementById(e);
	return {
		...e,
		getRootNode: t,
		getDoc: n,
		getWin: r,
		getActiveElement: i,
		isActiveElement: $e,
		getById: a
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+types@1.43.3/node_modules/@zag-js/types/dist/prop-types.mjs
function Ca(e) {
	return new Proxy({}, { get(t, n) {
		return n === "style" ? (t) => e({ style: t }).style : e;
	} });
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+svelte@1.43.3_svelte@5.57.1/node_modules/@zag-js/svelte/dist/normalize-props.js
var wa = {
	className: "class",
	defaultChecked: "checked",
	defaultValue: "value",
	htmlFor: "for",
	onBlur: "onfocusout",
	onChange: "oninput",
	onFocus: "onfocusin",
	onDoubleClick: "ondblclick"
};
function Ta(e) {
	let t = "";
	for (let n in e) {
		let r = e[n];
		r != null && (n.startsWith("--") || (n = n.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`)), t += `${n}:${r};`);
	}
	return t;
}
var Ea = new Set("viewBox,className,preserveAspectRatio,fillRule,clipPath,clipRule,strokeWidth,strokeLinecap,strokeLinejoin,strokeDasharray,strokeDashoffset,strokeMiterlimit".split(","));
function Da(e) {
	return e in wa ? wa[e] : Ea.has(e) ? e : e.toLowerCase();
}
function Oa(e, t) {
	return e === "style" && typeof t == "object" ? Ta(t) : t;
}
var ka = Ca((e) => {
	let t = {};
	for (let n in e) t[Da(n)] = Oa(n, e[n]);
	return t;
}), Aa = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g, ja = (e) => {
	let t = {}, n;
	for (; n = Aa.exec(e);) t[n[1]] = n[2];
	return t;
};
function J(...e) {
	let t = [];
	for (let n of e) n && "class" in n && n.class != null && t.push(n.class);
	let n = qi(...e);
	return t.length > 0 && (n.class = t.length === 1 ? t[0] : t), "style" in n && (typeof n.style == "string" && (n.style = ja(n.style)), n.style = Ta(n.style)), n;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+svelte@1.43.3_svelte@5.57.1/node_modules/@zag-js/svelte/dist/bindable.svelte.js
function Ma(t) {
	let n = t().value ?? t().defaultValue, r = t().isEqual ?? Object.is, i = _(w(n)), a = F(() => t().value !== void 0), o = { current: c(() => S(i)) }, l = { current: void 0 };
	s(() => {
		let e = S(a) ? t().value : S(i);
		o = { current: e }, l = { current: e };
	});
	let u = (e) => {
		let n = ri(e) ? e(o.current) : e, s = l.current;
		t().debug && console.log(`[bindable > ${t().debug}] setValue`, {
			next: n,
			prev: s
		}), S(a) || E(i, n, !0), r(n, s) || t().onChange?.(n, s);
	};
	function d() {
		return S(a) ? t().value : S(i);
	}
	return {
		initial: n,
		ref: o,
		get: d,
		set(n) {
			let r = t().sync ? e : hi;
			c(() => r(() => u(n)));
		},
		invoke(e, n) {
			t().onChange?.(e, n);
		},
		hash(e) {
			return t().hash?.(e) ?? String(e);
		}
	};
}
Ma.cleanup = (e) => {
	i(() => e());
}, Ma.ref = (e) => {
	let t = e;
	return {
		get: () => t,
		set: (e) => {
			t = e;
		}
	};
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+svelte@1.43.3_svelte@5.57.1/node_modules/@zag-js/svelte/dist/refs.svelte.js
function Na(e) {
	let t = { current: e };
	return {
		get(e) {
			return t.current[e];
		},
		set(e, n) {
			t.current[e] = n;
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+svelte@1.43.3_svelte@5.57.1/node_modules/@zag-js/svelte/dist/track.svelte.js
var Pa = (e) => typeof e == "function" ? e() : e, Fa = (e, t) => {
	let n = [], r = !0;
	C(() => {
		if (r) {
			n = e.map((e) => Pa(e)), r = !1;
			return;
		}
		let i = !1;
		for (let t = 0; t < e.length; t++) if (!Zr(n[t], Pa(e[t]))) {
			i = !0;
			break;
		}
		i && (n = e.map((e) => Pa(e)), t());
	});
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+svelte@1.43.3_svelte@5.57.1/node_modules/@zag-js/svelte/dist/machine.svelte.js
function Ia(e) {
	return ri(e) ? e() : e;
}
function La(e, t) {
	let n = F(() => {
		let { id: e, ids: n, getRootNode: r } = Ia(t);
		return Sa({
			id: e,
			ids: n,
			getRootNode: r
		});
	}), r = (...t) => {
		e.debug && console.log(...t);
	}, a = F(() => e.props?.({
		props: ji(Ia(t)),
		scope: S(n)
	}) ?? Ia(t)), o = Ra(() => S(a)), s = e.context?.({
		prop: o,
		bindable: Ma,
		get scope() {
			return S(n);
		},
		flush: za,
		getContext() {
			return c;
		},
		getComputed() {
			return C;
		},
		getRefs() {
			return g;
		},
		getEvent() {
			return p();
		}
	}), c = {
		get(e) {
			return s?.[e].get();
		},
		set(e, t) {
			s?.[e].set(t);
		},
		initial(e) {
			return s?.[e].initial;
		},
		hash(e) {
			let t = s?.[e].get();
			return s?.[e].hash(t);
		}
	}, l = /* @__PURE__ */ new Map(), u = { current: null }, d = { current: null }, f = { current: { type: "" } }, p = () => ({
		...f.current,
		current() {
			return f.current;
		},
		previous() {
			return d.current;
		}
	}), m = () => ({
		...w,
		hasTag(t) {
			return ga(e, w.get(), t);
		},
		matches(...e) {
			let t = w.get();
			return e.some((e) => ha(t, e));
		}
	}), g = Na(e.refs?.({
		prop: o,
		context: c
	}) ?? {}), _ = () => ({
		state: m(),
		context: c,
		event: p(),
		prop: o,
		send: E,
		action: v,
		guard: y,
		track: Fa,
		refs: g,
		computed: C,
		flush: za,
		scope: S(n),
		choose: x
	}), v = (t) => {
		let n = ri(t) ? t(_()) : t;
		if (!n) return;
		let r = n.map((t) => {
			let n = e.implementations?.actions?.[t];
			return n || Ri(`[zag-js] No implementation found for action "${JSON.stringify(t)}"`), n;
		});
		for (let e of r) e?.(_());
	}, y = (t) => {
		if (ri(t)) return t(_());
		let n = e.implementations?.guards?.[t];
		return n || Ri(`[zag-js] No implementation found for guard "${JSON.stringify(t)}"`), n?.(_());
	}, b = (t) => {
		let n = ri(t) ? t(_()) : t;
		if (!n) return;
		let r = n.map((t) => {
			let n = e.implementations?.effects?.[t];
			return n || Ri(`[zag-js] No implementation found for effect "${JSON.stringify(t)}"`), n;
		}), i = [];
		for (let e of r) {
			let t = e?.(_());
			t && i.push(t);
		}
		return () => i.forEach((e) => e?.());
	}, x = (e) => Ir(e).find((e) => {
		let t = !e.guard;
		return ni(e.guard) ? t = !!y(e.guard) : ri(e.guard) && (t = e.guard(_())), t;
	}), C = (t) => {
		Bi(e.computed, () => "[zag-js] No computed object found on machine");
		let r = e.computed[t];
		return r({
			context: c,
			event: p(),
			prop: o,
			refs: g,
			scope: S(n),
			computed: C
		});
	}, w = Ma(() => ({
		defaultValue: fa(e, e.initialState({ prop: o })),
		onChange(t, n) {
			let { exiting: r, entering: i } = ma(e, n, t, u.current?.reenter);
			if (r.forEach((e) => {
				l.get(e.path)?.(), l.delete(e.path);
			}), r.forEach((e) => {
				v(e.state?.exit);
			}), v(u.current?.actions), i.forEach((e) => {
				let t = b(e.state?.effects);
				if (t) {
					let n = l.get(e.path);
					l.set(e.path, n ? _i(n, t) : t);
				}
			}), n === "__init__") {
				v(e.entry);
				let t = b(e.effects);
				if (t) {
					let e = l.get(xa);
					l.set(xa, e ? _i(e, t) : t);
				}
			}
			i.forEach((e) => {
				v(e.state?.entry);
			});
		}
	})), T = ba.NotStarted;
	h(() => {
		let e = T === ba.Started;
		T = ba.Started, r(e ? "rehydrating..." : "initializing..."), w.invoke(w.initial, xa);
	}), i(() => {
		T === ba.Started && (r("unmounting..."), T = ba.Stopped, l.forEach((e) => e?.()), l = /* @__PURE__ */ new Map(), u.current = null, v(e.exit));
	});
	let E = (t) => {
		if (T !== ba.Started) return;
		d.current = f.current, f.current = t;
		let n = w.get(), { transitions: i, source: a } = pa(e, n, t.type), o = x(i);
		if (!o) return;
		u.current = o;
		let s = fa(e, o.target ?? n, a);
		r("transition", t.type, o.target || n, `(${o.actions})`), s === n ? o.reenter ? w.invoke(n, n) : v(o.actions) : w.set(s);
	};
	return e.watch?.(_()), {
		get state() {
			return m();
		},
		send: E,
		context: c,
		prop: o,
		get scope() {
			return S(n);
		},
		refs: g,
		computed: C,
		get event() {
			return p();
		},
		getStatus: () => T
	};
}
function Ra(e) {
	return function(t) {
		return e()[t];
	};
}
function za(t) {
	e(() => {
		queueMicrotask(() => t());
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/utils/tags.js
var Ba = [
	"path",
	"rect",
	"circle",
	"ellipse",
	"line",
	"polygon",
	"polyline"
], Va = (e) => typeof e == "string" && Ba.includes(e), Ha = [
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link"
], Ua = (e) => typeof e == "string" && Ha.includes(e), Wa = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"as",
	"ref"
]);
function Ga(t, n) {
	k(n, !0);
	let r = B(n, "as", 7), i = B(n, "ref", 15, null), a = H(n, Wa);
	var o = {
		get as() {
			return r();
		},
		set as(t) {
			r(t), e();
		},
		get ref() {
			return i();
		},
		set ref(t = null) {
			i(t), e();
		}
	}, s = p(), c = V(s);
	return me(c, r, !0, (e, t) => {
		O(e, (e) => i(e), () => i()), j(e, () => ({ ...a }));
	}), R(t, s), L(o);
}
W(Ga, {
	as: {},
	ref: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/factory/factory.svelte
var Ka = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"asChild",
	"children",
	"as",
	"ref"
]), qa = m("<textarea></textarea>");
function Y(t, n) {
	k(n, !0);
	let r = B(n, "asChild", 7), i = B(n, "children", 7), a = B(n, "as", 7), o = B(n, "ref", 15, null), s = H(n, Ka), c = (e) => J(s, e ?? {});
	var l = {
		get asChild() {
			return r();
		},
		set asChild(t) {
			r(t), e();
		},
		get children() {
			return i();
		},
		set children(t) {
			i(t), e();
		},
		get as() {
			return a();
		},
		set as(t) {
			a(t), e();
		},
		get ref() {
			return o();
		},
		set ref(t = null) {
			o(t), e();
		}
	}, u = p(), d = V(u), f = (e) => {
		var t = p(), n = V(t);
		z(n, () => r() ?? ue, () => c), R(e, t);
	}, m = (e) => {
		Ga(e, I({ get as() {
			return a();
		} }, () => s, {
			get ref() {
				return o();
			},
			set ref(e) {
				o(e);
			}
		}));
	}, h = F(() => Va(a())), g = (e) => {
		var t = p(), n = V(t);
		me(n, a, !1, (e, t) => {
			O(e, (e) => o(e), () => o()), j(e, () => ({ ...s }));
		}), R(e, t);
	}, _ = F(() => Ua(a())), v = (e) => {
		var t = qa();
		le(t), j(t, () => ({ ...s })), O(t, (e) => o(e), () => o()), R(e, t);
	}, y = (e) => {
		var t = p(), n = V(t);
		me(n, a, !1, (e, t) => {
			O(e, (e) => o(e), () => o()), j(e, () => ({ ...s }));
			var n = p(), r = V(n);
			z(r, () => i() ?? ue), R(t, n);
		}), R(e, t);
	};
	return b(d, (e) => {
		r() ? e(f) : S(h) ? e(m, 1) : S(_) ? e(g, 2) : a() === "textarea" ? e(v, 3) : e(y, -1);
	}), R(t, u), L(l);
}
W(Y, {
	asChild: {},
	children: {},
	as: {},
	ref: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+presence@1.43.3/node_modules/@zag-js/presence/dist/presence.connect.mjs
function Ja(e, t) {
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
var Ya = va({
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
				let r = new (at(n)).CustomEvent("exitcomplete", { bubbles: !1 });
				n.dispatchEvent(r);
			},
			setupNode: ({ refs: e, event: t }) => {
				e.get("node") !== t.node && (e.set("node", t.node), e.set("styles", ut(t.node)));
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
				q(() => {
					if (r("present")) return;
					let i = Xa(t.get("styles"));
					e.set("unmountAnimationName", i), i === "none" || i === e.get("prevAnimationName") || t.get("styles")?.display === "none" || t.get("styles")?.animationDuration === "0s" ? n({
						type: "UNMOUNT",
						src: "presence.changed"
					}) : n({ type: "UNMOUNT.SUSPEND" });
				});
			},
			setPrevAnimationName: ({ context: e, refs: t }) => {
				q(() => {
					e.set("prevAnimationName", Xa(t.get("styles")));
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
					r = q(() => {
						let e = t.get("node");
						if (!e || !e.isConnected) {
							i();
							return;
						}
						let r = ut(e);
						if (Xa(r) === "none" || r.display === "none" || r.animationDuration === "0s") {
							n("onEnterComplete")?.();
							return;
						}
						let a = (t) => {
							Ut(t) === e && n("present") && (e.removeEventListener("animationend", a), n("onEnterComplete")?.());
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
					(n.composedPath?.()?.[0] ?? n.target) === i && e.set("prevAnimationName", Xa(t.get("styles")));
				}, o = (a) => {
					let o = Xa(t.get("styles"));
					Ut(a) === i && o === e.get("unmountAnimationName") && !r("present") && n({
						type: "UNMOUNT",
						src: "animationend"
					});
				}, s = (e) => {
					Ut(e) === i && !r("present") && n({
						type: "UNMOUNT",
						src: "animationcancel"
					});
				};
				i.addEventListener("animationstart", a), i.addEventListener("animationcancel", s), i.addEventListener("animationend", o);
				let c = or(i, { animationFillMode: "forwards" });
				return () => {
					i.removeEventListener("animationstart", a), i.removeEventListener("animationcancel", s), i.removeEventListener("animationend", o), kn(() => c());
				};
			}
		}
	}
});
function Xa(e) {
	return e?.animationName || "none";
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/presence/use-presence.svelte.js
var Za = (e) => {
	let t = F(() => pi(e)), n = F(() => Or(S(t))), r = F(() => P(S(n), 2)), i = F(() => S(r)[0]), a = F(() => S(r)[1]), o = La(Ya, () => S(a)), s = F(() => Ja(o, ka)), c = _(!1);
	C(() => {
		S(s).present && E(c, !0);
	});
	let l = (e) => {
		e && o.send({
			type: "NODE.SET",
			node: e
		});
	}, u = F(() => !S(s).present && !S(c) && S(i).lazyMount || S(i).unmountOnExit && !S(s).present && S(c)), d = F(() => ({
		getPresenceProps: () => ({
			"data-state": S(s).skip && S(t).skipAnimationOnMount ? void 0 : S(t).present ? "open" : "closed",
			hidden: !S(s).present
		}),
		present: S(s).present,
		setNode: l,
		unmounted: S(u)
	}));
	return () => S(d);
}, Qa = (e) => wr()(e, [
	"immediate",
	"lazyMount",
	"onEnterComplete",
	"onExitComplete",
	"present",
	"skipAnimationOnMount",
	"unmountOnExit"
]), [$a, eo] = vr({ name: "PresenceContext" }), [to, no] = vr({ name: "DialogContext" }), ro = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function io(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, ro), o = no(), s = eo(), c = F(() => J(o().getContentProps(), s().getPresenceProps(), i));
	function l(e) {
		s().setNode(e);
	}
	var u = {
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	}, d = p(), f = V(d), m = (e) => {
		Y(e, I({ as: "div" }, () => S(c), {
			[a()]: l,
			get ref() {
				return r();
			},
			set ref(e) {
				r(e);
			}
		}));
	}, h = F(() => !s().unmounted);
	return b(f, (e) => {
		S(h) && e(m);
	}), R(t, d), L(u);
}
W(io, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/dialog/dialog-description.svelte
var ao = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function oo(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, ao), a = no(), o = F(() => J(a().getDescriptionProps(), i));
	return Y(t, I({ as: "p" }, () => S(o), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(oo, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/dialog/dialog-positioner.svelte
var so = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function co(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, so), a = no(), o = eo(), s = F(() => J(a().getPositionerProps(), i));
	var c = {
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	}, l = p(), u = V(l), d = (e) => {
		Y(e, I({ as: "div" }, () => S(s), {
			get ref() {
				return r();
			},
			set ref(e) {
				r(e);
			}
		}));
	}, f = F(() => !o().unmounted);
	return b(u, (e) => {
		S(f) && e(d);
	}), R(t, l), L(c);
}
W(co, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/providers/locale/use-locale-context.js
var [lo, uo] = vr({
	name: "LocaleContext",
	strict: !1,
	defaultValue: () => ({
		dir: "ltr",
		locale: "en-US"
	})
});
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/utils.mjs
function fo(e, t) {
	return e - t * Math.floor(e / t);
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/calendars/GregorianCalendar.mjs
var po = 1721426;
function mo(e, t, n, r) {
	t = go(e, t);
	let i = t - 1, a = -2;
	return n <= 2 ? a = 0 : ho(t) && (a = -1), 1721425 + 365 * i + Math.floor(i / 4) - Math.floor(i / 100) + Math.floor(i / 400) + Math.floor((367 * n - 362) / 12 + a + r);
}
function ho(e) {
	return e % 4 == 0 && (e % 100 != 0 || e % 400 == 0);
}
function go(e, t) {
	return e === "BC" ? 1 - t : t;
}
function _o(e) {
	let t = "AD";
	return e <= 0 && (t = "BC", e = 1 - e), [t, e];
}
var vo = {
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
}, yo = class {
	fromJulianDay(e) {
		let t = e, n = t - po, r = Math.floor(n / 146097), i = fo(n, 146097), a = Math.floor(i / 36524), o = fo(i, 36524), s = Math.floor(o / 1461), c = fo(o, 1461), l = Math.floor(c / 365), [u, d] = _o(r * 400 + a * 100 + s * 4 + l + +(a !== 4 && l !== 4)), f = t - mo(u, d, 1, 1), p = 2;
		t < mo(u, d, 3, 1) ? p = 0 : ho(d) && (p = 1);
		let m = Math.floor(((f + p) * 12 + 373) / 367);
		return new Xs(u, d, m, t - mo(u, d, m, 1) + 1);
	}
	toJulianDay(e) {
		return mo(e.era, e.year, e.month, e.day);
	}
	getDaysInMonth(e) {
		return vo[ho(e.year) ? "leapyear" : "standard"][e.month - 1];
	}
	getMonthsInYear(e) {
		return 12;
	}
	getDaysInYear(e) {
		return ho(e.year) ? 366 : 365;
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
}, bo = {
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
function xo(e, t) {
	return t = ms(t, e.calendar), e.era === t.era && e.year === t.year && e.month === t.month && e.day === t.day;
}
function So(e, t) {
	return t = ms(t, e.calendar), e = Bo(e), t = Bo(t), e.era === t.era && e.year === t.year && e.month === t.month;
}
function Co(e, t) {
	return t = ms(t, e.calendar), e = Ho(e), t = Ho(t), e.era === t.era && e.year === t.year;
}
function wo(e, t) {
	return Do(e.calendar, t.calendar) && xo(e, t);
}
function To(e, t) {
	return Do(e.calendar, t.calendar) && So(e, t);
}
function Eo(e, t) {
	return Do(e.calendar, t.calendar) && Co(e, t);
}
function Do(e, t) {
	return e.isEqual?.(t) ?? t.isEqual?.(e) ?? e.identifier === t.identifier;
}
function Oo(e, t) {
	return xo(e, Mo(t));
}
var ko = {
	sun: 0,
	mon: 1,
	tue: 2,
	wed: 3,
	thu: 4,
	fri: 5,
	sat: 6
};
function Ao(e, t, n) {
	let r = e.calendar.toJulianDay(e), i = n ? ko[n] : Yo(t), a = Math.ceil(r + 1 - i) % 7;
	return a < 0 && (a += 7), a;
}
function jo(e) {
	return ds(Date.now(), e);
}
function Mo(e) {
	return fs(jo(e));
}
function No(e, t) {
	return e.calendar.toJulianDay(e) - t.calendar.toJulianDay(t);
}
function Po(e, t) {
	return Fo(e) - Fo(t);
}
function Fo(e) {
	return e.hour * 36e5 + e.minute * 6e4 + e.second * 1e3 + e.millisecond;
}
var Io = null, Lo = !1;
function Ro() {
	return Io ??= new Intl.DateTimeFormat().resolvedOptions().timeZone, Io;
}
function zo() {
	return Lo;
}
function Bo(e) {
	return e.subtract({ days: e.day - 1 });
}
function Vo(e) {
	return e.add({ days: e.calendar.getDaysInMonth(e) - e.day });
}
function Ho(e) {
	return Bo(e.subtract({ months: e.month - 1 }));
}
function Uo(e) {
	return Vo(e.add({ months: e.calendar.getMonthsInYear(e) - e.month }));
}
function Wo(e, t, n) {
	let r = Ao(e, t, n);
	return e.subtract({ days: r });
}
function Go(e, t, n) {
	return Wo(e, t, n).add({ days: 6 });
}
var Ko = /* @__PURE__ */ new Map(), qo = /* @__PURE__ */ new Map();
function Jo(e) {
	if (Intl.Locale) {
		let t = Ko.get(e);
		return t || (t = new Intl.Locale(e).maximize().region, t && Ko.set(e, t)), t;
	}
	let t = e.split("-")[1];
	return t === "u" ? void 0 : t;
}
function Yo(e) {
	let t = qo.get(e);
	if (!t) {
		if (Intl.Locale) {
			let n = new Intl.Locale(e);
			if ("getWeekInfo" in n && (t = n.getWeekInfo(), t)) return qo.set(e, t), t.firstDay;
		}
		let n = Jo(e);
		if (e.includes("-fw-")) {
			let n = e.split("-fw-")[1].split("-")[0];
			t = n === "mon" ? { firstDay: 1 } : n === "tue" ? { firstDay: 2 } : n === "wed" ? { firstDay: 3 } : n === "thu" ? { firstDay: 4 } : n === "fri" ? { firstDay: 5 } : n === "sat" ? { firstDay: 6 } : { firstDay: 0 };
		} else t = e.includes("-ca-iso8601") ? { firstDay: 1 } : { firstDay: n && bo[n] || 0 };
		qo.set(e, t);
	}
	return t.firstDay;
}
function Xo(e, t, n) {
	let r = e.calendar.getDaysInMonth(e);
	return Math.ceil((Ao(Bo(e), t, n) + r) / 7);
}
function Zo(e, t) {
	return e && t ? e.compare(t) <= 0 ? e : t : e || t;
}
function Qo(e, t) {
	return e && t ? e.compare(t) >= 0 ? e : t : e || t;
}
var $o = {
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
function es(e, t) {
	let n = e.calendar.toJulianDay(e), r = Math.ceil(n + 1) % 7;
	r < 0 && (r += 7);
	let [i, a] = $o[Jo(t)] || [6, 0];
	return r === i || r === a;
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/conversion.mjs
function ts(e) {
	return e = ms(e, new yo()), ns(go(e.era, e.year), e.month, e.day, e.hour, e.minute, e.second, e.millisecond);
}
function ns(e, t, n, r, i, a, o) {
	let s = /* @__PURE__ */ new Date();
	return s.setUTCHours(r, i, a, o), s.setUTCFullYear(e, t - 1, n), s.getTime();
}
function rs(e, t) {
	if (t === "UTC") return 0;
	if (e > 0 && t === Ro() && !zo()) return new Date(e).getTimezoneOffset() * -6e4;
	let { year: n, month: r, day: i, hour: a, minute: o, second: s } = as(e, t);
	return ns(n, r, i, a, o, s, 0) - Math.floor(e / 1e3) * 1e3;
}
var is = /* @__PURE__ */ new Map();
function as(e, t) {
	let n = is.get(t);
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
	}), is.set(t, n));
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
var os = 864e5;
function ss(e, t, n, r) {
	return (n === r ? [n] : [n, r]).filter((n) => cs(e, t, n));
}
function cs(e, t, n) {
	let r = as(n, t);
	return e.year === r.year && e.month === r.month && e.day === r.day && e.hour === r.hour && e.minute === r.minute && e.second === r.second;
}
function ls(e, t, n = "compatible") {
	let r = ps(e);
	if (t === "UTC") return ts(r);
	if (t === Ro() && n === "compatible" && !zo()) {
		r = ms(r, new yo());
		let e = /* @__PURE__ */ new Date(), t = go(r.era, r.year);
		return e.setFullYear(t, r.month - 1, r.day), e.setHours(r.hour, r.minute, r.second, r.millisecond), e.getTime();
	}
	let i = ts(r), a = rs(i - os, t), o = rs(i + os, t), s = ss(r, t, i - a, i - o);
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
function us(e, t, n = "compatible") {
	return new Date(ls(e, t, n));
}
function ds(e, t) {
	let n = rs(e, t), r = new Date(e + n), i = r.getUTCFullYear(), a = r.getUTCMonth() + 1, o = r.getUTCDate(), s = r.getUTCHours(), c = r.getUTCMinutes(), l = r.getUTCSeconds(), u = r.getUTCMilliseconds();
	return new Qs(i < 1 ? "BC" : "AD", i < 1 ? -i + 1 : i, a, o, t, n, s, c, l, u);
}
function fs(e) {
	return new Xs(e.calendar, e.era, e.year, e.month, e.day);
}
function ps(e, t) {
	let n = 0, r = 0, i = 0, a = 0;
	if ("timeZone" in e) ({hour: n, minute: r, second: i, millisecond: a} = e);
	else if ("hour" in e && !t) return e;
	return t && ({hour: n, minute: r, second: i, millisecond: a} = t), new Zs(e.calendar, e.era, e.year, e.month, e.day, n, r, i, a);
}
function ms(e, t) {
	if (Do(e.calendar, t)) return e;
	let n = t.fromJulianDay(e.calendar.toJulianDay(e)), r = e.copy();
	return r.calendar = t, r.era = n.era, r.year = n.year, r.month = n.month, r.day = n.day, ws(r), r;
}
function hs(e, t, n) {
	return e instanceof Qs ? e.timeZone === t ? e : _s(e, t) : ds(ls(e, t, n), t);
}
function gs(e) {
	let t = ts(e) - e.offset;
	return new Date(t);
}
function _s(e, t) {
	return ms(ds(ts(e) - e.offset, t), e.calendar);
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/manipulation.mjs
var vs = 36e5;
function ys(e, t) {
	let n = e.copy(), r = "hour" in n ? Ms(n, t) : 0;
	bs(n, t.years || 0), n.calendar.balanceYearMonth && n.calendar.balanceYearMonth(n, e), n.month += t.months || 0, xs(n), Cs(n), n.day += (t.weeks || 0) * 7, n.day += t.days || 0, n.day += r, Ss(n), n.calendar.balanceDate && n.calendar.balanceDate(n), n.year < 1 && (n.year = 1, n.month = 1, n.day = 1);
	let i = n.calendar.getYearsInEra(n);
	if (n.year > i) {
		let e = n.calendar.isInverseEra?.(n);
		n.year = i, n.month = e ? 1 : n.calendar.getMonthsInYear(n), n.day = e ? 1 : n.calendar.getDaysInMonth(n);
	}
	n.month < 1 && (n.month = 1, n.day = 1);
	let a = n.calendar.getMonthsInYear(n);
	return n.month > a && (n.month = a, n.day = n.calendar.getDaysInMonth(n)), n.day = Math.max(1, Math.min(n.calendar.getDaysInMonth(n), n.day)), n;
}
function bs(e, t) {
	e.calendar.isInverseEra?.(e) && (t = -t), e.year += t;
}
function xs(e) {
	for (; e.month < 1;) bs(e, -1), e.month += e.calendar.getMonthsInYear(e);
	let t = 0;
	for (; e.month > (t = e.calendar.getMonthsInYear(e));) e.month -= t, bs(e, 1);
}
function Ss(e) {
	for (; e.day < 1;) e.month--, xs(e), e.day += e.calendar.getDaysInMonth(e);
	for (; e.day > e.calendar.getDaysInMonth(e);) e.day -= e.calendar.getDaysInMonth(e), e.month++, xs(e);
}
function Cs(e) {
	e.month = Math.max(1, Math.min(e.calendar.getMonthsInYear(e), e.month)), e.day = Math.max(1, Math.min(e.calendar.getDaysInMonth(e), e.day));
}
function ws(e) {
	e.calendar.constrainDate && e.calendar.constrainDate(e), e.year = Math.max(1, Math.min(e.calendar.getYearsInEra(e), e.year)), Cs(e);
}
function Ts(e) {
	let t = {};
	for (let n in e) typeof e[n] == "number" && (t[n] = -e[n]);
	return t;
}
function Es(e, t) {
	return ys(e, Ts(t));
}
function Ds(e, t) {
	let n = e.copy();
	return t.era != null && (n.era = t.era), t.year != null && (n.year = t.year), t.month != null && (n.month = t.month), t.day != null && (n.day = t.day), ws(n), n;
}
function Os(e, t) {
	let n = e.copy();
	return t.hour != null && (n.hour = t.hour), t.minute != null && (n.minute = t.minute), t.second != null && (n.second = t.second), t.millisecond != null && (n.millisecond = t.millisecond), As(n), n;
}
function ks(e) {
	e.second += Math.floor(e.millisecond / 1e3), e.millisecond = js(e.millisecond, 1e3), e.minute += Math.floor(e.second / 60), e.second = js(e.second, 60), e.hour += Math.floor(e.minute / 60), e.minute = js(e.minute, 60);
	let t = Math.floor(e.hour / 24);
	return e.hour = js(e.hour, 24), t;
}
function As(e) {
	e.millisecond = Math.max(0, Math.min(e.millisecond, 999)), e.second = Math.max(0, Math.min(e.second, 59)), e.minute = Math.max(0, Math.min(e.minute, 59)), e.hour = Math.max(0, Math.min(e.hour, 23));
}
function js(e, t) {
	let n = e % t;
	return n < 0 && (n += t), n;
}
function Ms(e, t) {
	return e.hour += t.hours || 0, e.minute += t.minutes || 0, e.second += t.seconds || 0, e.millisecond += t.milliseconds || 0, ks(e);
}
function Ns(e, t, n, r) {
	let i = e.copy();
	switch (t) {
		case "era": {
			let t = e.calendar.getEras(), a = t.indexOf(e.era);
			if (a < 0) throw Error("Invalid era: " + e.era);
			a = Fs(a, n, 0, t.length - 1, r?.round), i.era = t[a], ws(i);
			break;
		}
		case "year":
			i.calendar.isInverseEra?.(i) && (n = -n), i.year = Fs(e.year, n, -Infinity, 9999, r?.round), i.year === -Infinity && (i.year = 1), i.calendar.balanceYearMonth && i.calendar.balanceYearMonth(i, e);
			break;
		case "month":
			i.month = Fs(e.month, n, 1, e.calendar.getMonthsInYear(e), r?.round);
			break;
		case "day":
			i.day = Fs(e.day, n, 1, e.calendar.getDaysInMonth(e), r?.round);
			break;
		default: throw Error("Unsupported field " + t);
	}
	return e.calendar.balanceDate && e.calendar.balanceDate(i), ws(i), i;
}
function Ps(e, t, n, r) {
	let i = e.copy();
	switch (t) {
		case "hour": {
			let t = e.hour, a = 0, o = 23;
			if (r?.hourCycle === 12) {
				let e = t >= 12;
				a = e ? 12 : 0, o = e ? 23 : 11;
			}
			i.hour = Fs(t, n, a, o, r?.round);
			break;
		}
		case "minute":
			i.minute = Fs(e.minute, n, 0, 59, r?.round);
			break;
		case "second":
			i.second = Fs(e.second, n, 0, 59, r?.round);
			break;
		case "millisecond":
			i.millisecond = Fs(e.millisecond, n, 0, 999, r?.round);
			break;
		default: throw Error("Unsupported field " + t);
	}
	return i;
}
function Fs(e, t, n, r, i = !1) {
	if (i) {
		e += Math.sign(t), e < n && (e = r);
		let i = Math.abs(t);
		e = t > 0 ? Math.ceil(e / i) * i : Math.floor(e / i) * i, e > r && (e = n);
	} else e += t, e < n ? e = r - (n - e - 1) : e > r && (e = n + (e - r - 1));
	return e;
}
function Is(e, t) {
	let n;
	return n = t.years != null && t.years !== 0 || t.months != null && t.months !== 0 || t.weeks != null && t.weeks !== 0 || t.days != null && t.days !== 0 ? ls(ys(ps(e), {
		years: t.years,
		months: t.months,
		weeks: t.weeks,
		days: t.days
	}), e.timeZone) : ts(e) - e.offset, n += t.milliseconds || 0, n += (t.seconds || 0) * 1e3, n += (t.minutes || 0) * 6e4, n += (t.hours || 0) * 36e5, ms(ds(n, e.timeZone), e.calendar);
}
function Ls(e, t) {
	return Is(e, Ts(t));
}
function Rs(e, t, n, r) {
	switch (t) {
		case "hour": {
			let t = 0, i = 23;
			if (r?.hourCycle === 12) {
				let n = e.hour >= 12;
				t = n ? 12 : 0, i = n ? 23 : 11;
			}
			let a = ps(e), o = ms(Os(a, { hour: t }), new yo()), s = [ls(o, e.timeZone, "earlier"), ls(o, e.timeZone, "later")].filter((t) => ds(t, e.timeZone).day === o.day)[0], c = ms(Os(a, { hour: i }), new yo()), l = [ls(c, e.timeZone, "earlier"), ls(c, e.timeZone, "later")].filter((t) => ds(t, e.timeZone).day === c.day).pop(), u = ts(e) - e.offset, d = Math.floor(u / vs), f = u % vs;
			return u = Fs(d, n, Math.floor(s / vs), Math.floor(l / vs), r?.round) * vs + f, ms(ds(u, e.timeZone), e.calendar);
		}
		case "minute":
		case "second":
		case "millisecond": return Ps(e, t, n, r);
		case "era":
		case "year":
		case "month":
		case "day": return ms(ds(ls(Ns(ps(e), t, n, r), e.timeZone), e.timeZone), e.calendar);
		default: throw Error("Unsupported field " + t);
	}
}
function zs(e, t, n) {
	let r = ps(e), i = Os(Ds(r, t), t);
	return i.compare(r) === 0 ? e : ms(ds(ls(i, e.timeZone, n), e.timeZone), e.calendar);
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/string.mjs
var Bs = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})$/, Vs = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})(?:T(\d{2}))?(?::(\d{2}))?(?::(\d{2}))?(\.\d+)?(?:(?:([+-]\d{2})(?::?(\d{2}))?)|Z)$/;
function Hs(e) {
	let t = e.match(Bs);
	if (!t) throw Vs.test(e) ? Error(`Invalid ISO 8601 date string: ${e}. Use parseAbsolute() instead.`) : Error("Invalid ISO 8601 date string: " + e);
	let n = new Xs(Us(t[1], 0, 9999), Us(t[2], 1, 12), 1);
	return n.day = Us(t[3], 1, n.calendar.getDaysInMonth(n)), n;
}
function Us(e, t, n) {
	let r = Number(e);
	if (r < t || r > n) throw RangeError(`Value out of range: ${t} <= ${r} <= ${n}`);
	return r;
}
function Ws(e) {
	return `${String(e.hour).padStart(2, "0")}:${String(e.minute).padStart(2, "0")}:${String(e.second).padStart(2, "0")}${e.millisecond ? String(e.millisecond / 1e3).slice(1) : ""}`;
}
function Gs(e) {
	let t = ms(e, new yo()), n;
	return n = t.era === "BC" ? t.year === 1 ? "0000" : "-" + String(Math.abs(1 - t.year)).padStart(6, "00") : String(t.year).padStart(4, "0"), `${n}-${String(t.month).padStart(2, "0")}-${String(t.day).padStart(2, "0")}`;
}
function Ks(e) {
	return `${Gs(e)}T${Ws(e)}`;
}
function qs(e) {
	let t = Math.sign(e) < 0 ? "-" : "+";
	e = Math.abs(e);
	let n = Math.floor(e / 36e5), r = Math.floor(e % 36e5 / 6e4), i = Math.floor(e % 36e5 % 6e4 / 1e3), a = `${t}${String(n).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
	return i !== 0 && (a += `:${String(i).padStart(2, "0")}`), a;
}
function Js(e) {
	return `${Ks(e)}${qs(e.offset)}[${e.timeZone}]`;
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/CalendarDate.mjs
function Ys(e) {
	let t = typeof e[0] == "object" ? e.shift() : new yo(), n;
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
var Xs = class e {
	constructor(...e) {
		let [t, n, r, i, a] = Ys(e);
		this.calendar = t, this.era = n, this.year = r, this.month = i, this.day = a, ws(this);
	}
	copy() {
		return this.era ? new e(this.calendar, this.era, this.year, this.month, this.day) : new e(this.calendar, this.year, this.month, this.day);
	}
	add(e) {
		return ys(this, e);
	}
	subtract(e) {
		return Es(this, e);
	}
	set(e) {
		return Ds(this, e);
	}
	cycle(e, t, n) {
		return Ns(this, e, t, n);
	}
	toDate(e) {
		return us(this, e);
	}
	toString() {
		return Gs(this);
	}
	compare(e) {
		return No(this, e);
	}
}, Zs = class e {
	constructor(...e) {
		let [t, n, r, i, a] = Ys(e);
		this.calendar = t, this.era = n, this.year = r, this.month = i, this.day = a, this.hour = e.shift() || 0, this.minute = e.shift() || 0, this.second = e.shift() || 0, this.millisecond = e.shift() || 0, ws(this);
	}
	copy() {
		return this.era ? new e(this.calendar, this.era, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond) : new e(this.calendar, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);
	}
	add(e) {
		return ys(this, e);
	}
	subtract(e) {
		return Es(this, e);
	}
	set(e) {
		return Ds(Os(this, e), e);
	}
	cycle(e, t, n) {
		switch (e) {
			case "era":
			case "year":
			case "month":
			case "day": return Ns(this, e, t, n);
			default: return Ps(this, e, t, n);
		}
	}
	toDate(e, t) {
		return us(this, e, t);
	}
	toString() {
		return Ks(this);
	}
	compare(e) {
		let t = No(this, e);
		return t === 0 ? Po(this, ps(e)) : t;
	}
}, Qs = class e {
	constructor(...e) {
		let [t, n, r, i, a] = Ys(e), o = e.shift(), s = e.shift();
		this.calendar = t, this.era = n, this.year = r, this.month = i, this.day = a, this.timeZone = o, this.offset = s, this.hour = e.shift() || 0, this.minute = e.shift() || 0, this.second = e.shift() || 0, this.millisecond = e.shift() || 0, ws(this);
	}
	copy() {
		return this.era ? new e(this.calendar, this.era, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond) : new e(this.calendar, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond);
	}
	add(e) {
		return Is(this, e);
	}
	subtract(e) {
		return Ls(this, e);
	}
	set(e, t) {
		return zs(this, e, t);
	}
	cycle(e, t, n) {
		return Rs(this, e, t, n);
	}
	toDate() {
		return gs(this);
	}
	toString() {
		return Js(this);
	}
	toAbsoluteString() {
		return this.toDate().toISOString();
	}
	compare(e) {
		return this.toDate().getTime() - hs(e, this.timeZone).toDate().getTime();
	}
}, $s = /* @__PURE__ */ new Map(), ec = class {
	constructor(e, t = {}) {
		this.formatter = nc(e, t), this.options = t;
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
		return oc() && (this.resolvedHourCycle ||= sc(e.locale, this.options), e.hourCycle = this.resolvedHourCycle, e.hour12 = this.resolvedHourCycle === "h11" || this.resolvedHourCycle === "h12"), e.calendar === "ethiopic-amete-alem" && (e.calendar = "ethioaa"), e;
	}
}, tc = {
	true: { ja: "h11" },
	false: {}
};
function nc(e, t = {}) {
	if (typeof t.hour12 == "boolean" && ic()) {
		t = { ...t };
		let n = tc[String(t.hour12)][e.split("-")[0]], r = t.hour12 ? "h12" : "h23";
		t.hourCycle = n ?? r, delete t.hour12;
	}
	let n = e + (t ? Object.entries(t).sort((e, t) => e[0] < t[0] ? -1 : 1).join() : "");
	if ($s.has(n)) return $s.get(n);
	let r = new Intl.DateTimeFormat(e, t);
	return $s.set(n, r), r;
}
var rc = null;
function ic() {
	return rc ??= new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		hour12: !1
	}).format(new Date(2020, 2, 3, 0)) === "24", rc;
}
var ac = null;
function oc() {
	return ac ??= new Intl.DateTimeFormat("fr", {
		hour: "numeric",
		hour12: !1
	}).resolvedOptions().hourCycle === "h12", ac;
}
function sc(e, t) {
	if (!t.timeStyle && !t.hour) return;
	e = e.replace(/(-u-)?-nu-[a-zA-Z0-9]+/, ""), e += (e.includes("-u-") ? "" : "-u") + "-nu-latn";
	let n = nc(e, {
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
//#region ../../node_modules/.pnpm/@zag-js+anatomy@1.43.3/node_modules/@zag-js/anatomy/dist/create-anatomy.mjs
var cc = (e, t = []) => ({
	parts: (...n) => {
		if (uc(t)) return cc(e, n);
		throw Error("createAnatomy().parts(...) should only be called once. Did you mean to use .extendWith(...) ?");
	},
	extendWith: (...n) => cc(e, [...t, ...n]),
	omit: (...n) => cc(e, t.filter((e) => !n.includes(e))),
	rename: (e) => cc(e, t),
	keys: () => t,
	build: () => [...new Set(t)].reduce((t, n) => Object.assign(t, { [n]: {
		selector: [`&[data-scope="${lc(e)}"][data-part="${lc(n)}"]`, `& [data-scope="${lc(e)}"][data-part="${lc(n)}"]`].join(", "),
		attrs: {
			"data-scope": lc(e),
			"data-part": lc(n)
		}
	} }), {})
}), lc = (e) => e.replace(/([A-Z])([A-Z])/g, "$1-$2").replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase(), uc = (e) => e.length === 0, dc = cc("dialog").parts("trigger", "backdrop", "positioner", "content", "title", "description", "closeTrigger").build(), fc = (e) => e.ids?.positioner ?? `dialog:${e.id}:positioner`, pc = (e) => e.ids?.backdrop ?? `dialog:${e.id}:backdrop`, mc = (e) => e.ids?.content ?? `dialog:${e.id}:content`, hc = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `dialog:${e.id}:trigger:${t}` : `dialog:${e.id}:trigger` : ri(n) ? n(t) : n;
}, gc = (e) => e.ids?.title ?? `dialog:${e.id}:title`, _c = (e) => e.ids?.description ?? `dialog:${e.id}:description`, vc = (e) => e.ids?.closeTrigger ?? `dialog:${e.id}:close`, yc = (e) => e.getById(mc(e)), bc = (e) => e.getById(fc(e)), xc = (e) => e.getById(pc(e)), Sc = (e) => e.getById(hc(e)), Cc = (e) => e.getById(gc(e)), wc = (e) => e.getById(_c(e)), Tc = (e) => e.getById(vc(e)), Ec = (e) => Yn(e.getRootNode(), `[data-scope="dialog"][data-part="trigger"]${ze(e.id)}`), Dc = (e, t) => t == null ? Sc(e) ?? Ec(e)[0] : e.getById(hc(e, t));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dialog@1.43.3/node_modules/@zag-js/dialog/dist/dialog.connect.mjs
function Oc(e, t) {
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
				...dc.trigger.attrs,
				dir: a("dir"),
				id: hc(o, n),
				"data-ownedby": o.id,
				"data-value": n,
				"aria-haspopup": "dialog",
				type: "button",
				"aria-expanded": n == null ? c : c && i,
				"data-state": c ? "open" : "closed",
				"aria-controls": mc(o),
				"data-current": K(i),
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
				...dc.backdrop.attrs,
				dir: a("dir"),
				hidden: !c,
				id: pc(o),
				"data-state": c ? "open" : "closed"
			});
		},
		getPositionerProps() {
			return t.element({
				...dc.positioner.attrs,
				dir: a("dir"),
				id: fc(o),
				style: ji({ pointerEvents: !c || !a("modal") ? "none" : void 0 })
			});
		},
		getContentProps() {
			let e = i.get("rendered");
			return t.element({
				...dc.content.attrs,
				dir: a("dir"),
				role: a("role"),
				hidden: !c,
				id: mc(o),
				tabIndex: -1,
				"data-state": c ? "open" : "closed",
				"aria-modal": a("modal"),
				"aria-label": s || void 0,
				"aria-labelledby": s || !e.title ? void 0 : gc(o),
				"aria-describedby": e.description ? _c(o) : void 0,
				style: ji({ pointerEvents: a("modal") ? void 0 : "auto" })
			});
		},
		getTitleProps() {
			return t.element({
				...dc.title.attrs,
				dir: a("dir"),
				id: gc(o)
			});
		},
		getDescriptionProps() {
			return t.element({
				...dc.description.attrs,
				dir: a("dir"),
				id: _c(o)
			});
		},
		getCloseTriggerProps() {
			return t.button({
				...dc.closeTrigger.attrs,
				dir: a("dir"),
				id: vc(o),
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
var kc = /* @__PURE__ */ new WeakMap(), Ac = /* @__PURE__ */ new WeakMap(), jc = {}, Mc = 0, Nc = (e) => e && (e.host || Nc(e.parentNode)), Pc = (e, t) => t.map((t) => {
	if (e.contains(t)) return t;
	let n = Nc(t);
	return n && e.contains(n) ? n : (console.error("[zag-js > ariaHidden] target", t, "in not contained inside", e, ". Doing nothing"), null);
}).filter((e) => !!e), Fc = /* @__PURE__ */ new Set([
	"script",
	"output",
	"status",
	"next-route-announcer"
]), Ic = (e) => Fc.has(e.localName) || e.role === "status" || e.hasAttribute("aria-live") ? !0 : e.matches("[data-live-announcer]"), Lc = (e, t) => {
	let { parentNode: n, markerName: r, controlAttribute: i, explicitBooleanValue: a, followControlledElements: o = !0 } = t, s = Pc(n, Array.isArray(e) ? e : [e]);
	jc[r] || (jc[r] = /* @__PURE__ */ new WeakMap());
	let c = jc[r], l = [], u = /* @__PURE__ */ new Set(), d = new Set(s), f = (e) => {
		e && !u.has(e) && (u.add(e), f(e.parentNode));
	};
	s.forEach((e) => {
		f(e), o && Ue(e) && ht(e, (e) => {
			f(e);
		});
	});
	let p = (e) => {
		e && !d.has(e) && Array.prototype.forEach.call(e.children, (e) => {
			if (u.has(e)) p(e);
			else try {
				if (Ic(e)) return;
				let t = e.getAttribute(i), n = a ? t === "true" : t !== null && t !== "false", o = (kc.get(e) || 0) + 1, s = (c.get(e) || 0) + 1;
				kc.set(e, o), c.set(e, s), l.push(e), o === 1 && n && Ac.set(e, !0), s === 1 && e.setAttribute(r, ""), n || e.setAttribute(i, a ? "true" : "");
			} catch (t) {
				console.error("[zag-js > ariaHidden] cannot operate on ", e, t);
			}
		});
	};
	return p(n), u.clear(), Mc++, () => {
		l.forEach((e) => {
			let t = kc.get(e) - 1, n = c.get(e) - 1;
			kc.set(e, t), c.set(e, n), t || (Ac.has(e) || e.removeAttribute(i), Ac.delete(e)), n || e.removeAttribute(r);
		}), Mc--, Mc || (kc = /* @__PURE__ */ new WeakMap(), kc = /* @__PURE__ */ new WeakMap(), Ac = /* @__PURE__ */ new WeakMap(), jc = {});
	};
}, Rc = (e) => (Array.isArray(e) ? e[0] : e).ownerDocument.body, zc = (e, t = Rc(e), n = "data-aria-hidden", r = !0) => {
	if (t) return Lc(e, {
		parentNode: t,
		markerName: n,
		controlAttribute: "aria-hidden",
		explicitBooleanValue: !0,
		followControlledElements: r
	});
}, Bc = (e) => {
	let t = requestAnimationFrame(() => e());
	return () => cancelAnimationFrame(t);
};
function Vc(e, t = {}) {
	let { defer: n = !0 } = t, r = n ? Bc : (e) => e(), i = [];
	return i.push(r(() => {
		let t = (typeof e == "function" ? e() : e).filter(Boolean);
		t.length !== 0 && i.push(zc(t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+interact-outside@1.43.3/node_modules/@zag-js/interact-outside/dist/frame-utils.mjs
function Hc(e) {
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
function Uc(e) {
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
var Wc = "pointerdown.outside", Gc = "focus.outside";
function Kc(e) {
	for (let t of e) if (Ue(t) && xn(t)) return !0;
	return !1;
}
var qc = (e) => "clientY" in e;
function Jc(e, t) {
	if (!qc(t) || !e) return !1;
	let n = e.getBoundingClientRect();
	return n.width === 0 || n.height === 0 ? !1 : n.top <= t.clientY && t.clientY <= n.top + n.height && n.left <= t.clientX && t.clientX <= n.left + n.width;
}
function Yc(e, t) {
	return e.y <= t.y && t.y <= e.y + e.height && e.x <= t.x && t.x <= e.x + e.width;
}
function Xc(e, t) {
	if (!t || !qc(e)) return !1;
	let n = t.scrollHeight > t.clientHeight, r = n && e.clientX > t.offsetLeft + t.clientWidth, i = t.scrollWidth > t.clientWidth, a = i && e.clientY > t.offsetTop + t.clientHeight;
	return Yc({
		x: t.offsetLeft,
		y: t.offsetTop,
		width: t.clientWidth + (n ? 16 : 0),
		height: t.clientHeight + (i ? 16 : 0)
	}, {
		x: e.clientX,
		y: e.clientY
	}) ? r || a : !1;
}
function Zc(e, t) {
	let { exclude: n, onFocusOutside: r, onPointerDownOutside: i, onInteractOutside: a, defer: o, followControlledElements: s = !0 } = t;
	if (!e) return;
	let c = rt(e), l = at(e), u = Hc(l), d = Uc(l);
	function f(t, r) {
		if (!Ue(r) || !r.isConnected || nt(e, r) || Jc(e, t) || s && mt(e, r)) return !1;
		let i = c.querySelector(`[aria-controls="${e.id}"]`);
		return i && Xc(t, Pn(i)) || Xc(t, Pn(e)) ? !1 : !n?.(r);
	}
	let p = /* @__PURE__ */ new Set(), m = Ye(e?.getRootNode()), h = !1;
	function g(t) {
		h = !0;
		let n = () => {
			h = !1;
		};
		c.addEventListener("pointerup", n, { once: !0 }), l.addEventListener("pointerup", n, { once: !0 });
		function r(n) {
			let r = o && !Nt() ? q : (e) => e(), s = n ?? t, c = s?.composedPath?.() ?? [s?.target];
			r(() => {
				let n = m ? c[0] : Ut(t);
				if (e && f(t, n)) {
					if (i || a) {
						let t = _i(i, a);
						e.addEventListener(Wc, t, { once: !0 });
					}
					$c(e, Wc, {
						bubbles: !1,
						cancelable: !0,
						detail: {
							originalEvent: s,
							contextmenu: Zt(s),
							focusable: Kc(c),
							target: n
						}
					});
				}
			});
		}
		t.pointerType === "touch" ? (p.forEach((e) => e()), p.add(on(c, "click", r, { once: !0 })), p.add(d.addEventListener("click", r, { once: !0 })), p.add(u.addEventListener("click", r, { once: !0 }))) : r();
	}
	let _ = /* @__PURE__ */ new Set(), v = setTimeout(() => {
		_.add(on(c, "pointerdown", g, !0)), _.add(d.addEventListener("pointerdown", g, !0)), _.add(u.addEventListener("pointerdown", g, !0));
	}, 0);
	function y(t) {
		h || (o ? q : (e) => e())(() => {
			let n = t?.composedPath?.() ?? [t?.target], i = m ? n[0] : Ut(t);
			if (e && f(t, i)) {
				if (r || a) {
					let t = _i(r, a);
					e.addEventListener(Gc, t, { once: !0 });
				}
				$c(e, Gc, {
					bubbles: !1,
					cancelable: !0,
					detail: {
						originalEvent: t,
						contextmenu: !1,
						focusable: xn(i),
						target: i
					}
				});
			}
		});
	}
	return Nt() || (_.add(on(c, "focusin", y, !0)), _.add(d.addEventListener("focusin", y, !0)), _.add(u.addEventListener("focusin", y, !0))), () => {
		clearTimeout(v), p.forEach((e) => e()), _.forEach((e) => e());
	};
}
function Qc(e, t) {
	let { defer: n } = t, r = n ? q : (e) => e(), i = [];
	return i.push(r(() => {
		let n = typeof e == "function" ? e() : e;
		i.push(Zc(n, t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
function $c(e, t, n) {
	let r = new (e.ownerDocument.defaultView || window).CustomEvent(t, n);
	return e.dispatchEvent(r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/escape-keydown.mjs
function el(e, t) {
	return on(rt(e), "keydown", (e) => {
		e.key === "Escape" && (e.isComposing || t?.(e));
	}, { capture: !0 });
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/layer-stack.mjs
var tl = "layer:request-dismiss", nl = {
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
		return !!(this.getNestedLayers(e).some((e) => nt(e.node, t)) || this.recentlyRemoved.size > 0);
	},
	isInBranch(e) {
		return Array.from(this.branches).some((t) => nt(t, e));
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
			t && il(t);
		}), this.recentlyRemoved.add(e), kn(() => this.recentlyRemoved.delete(e)), t < this.count() - 1 && this.getNestedLayers(e).forEach((t) => nl.dismiss(t.node, e)), this.layers.splice(t, 1), this.syncLayers());
	},
	removeBranch(e) {
		let t = this.branches.indexOf(e);
		t >= 0 && this.branches.splice(t, 1);
	},
	syncLayers() {
		this.layers.forEach((e, t) => {
			rl(e, t, e.node), e.styleTargets?.forEach((n) => {
				let r = n();
				if (!r || r === e.node) return;
				rl(e, t, r);
				let { zIndex: i } = ut(e.node);
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
		ol(e, tl, (e) => {
			r.requestDismiss?.(e), e.defaultPrevented || r?.dismiss();
		}), al(e, tl, {
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
function rl(e, t, n) {
	n.style.setProperty("--layer-index", `${t}`), n.removeAttribute("data-nested"), n.removeAttribute("data-has-nested"), nl.getParentLayerOfType(e.node, e.type) && n.setAttribute("data-nested", e.type);
	let r = nl.countNestedLayersOfType(e.node, e.type);
	r > 0 && n.setAttribute("data-has-nested", e.type), n.style.setProperty("--nested-layer-count", `${r}`);
}
function il(e) {
	e.style.removeProperty("--layer-index"), e.style.removeProperty("--nested-layer-count"), e.style.removeProperty("--z-index"), e.removeAttribute("data-nested"), e.removeAttribute("data-has-nested");
}
function al(e, t, n) {
	let r = new (e.ownerDocument.defaultView || window).CustomEvent(t, {
		cancelable: !0,
		bubbles: !0,
		detail: n
	});
	return e.dispatchEvent(r);
}
function ol(e, t, n) {
	e.addEventListener(t, n, { once: !0 });
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/pointer-event-outside.mjs
var sl = /* @__PURE__ */ new WeakMap(), cl = /* @__PURE__ */ new WeakMap();
function ll(e) {
	return nl.isBelowPointerBlockingLayer(e) ? "none" : "auto";
}
function ul(e) {
	let t = ll(e);
	e.style.pointerEvents !== t && (e.style.pointerEvents = t);
}
function dl(e) {
	if (cl.has(e)) return;
	let t = at(e);
	if (t.MutationObserver === void 0) return;
	let n = new t.MutationObserver(() => {
		cl.has(e) && ul(e);
	});
	n.observe(e, {
		attributes: !0,
		attributeFilter: ["style"]
	}), cl.set(e, n);
}
function fl() {
	nl.layers.forEach(({ node: e }) => {
		ul(e), dl(e);
	});
}
function pl(e) {
	let t = cl.get(e);
	t && (t.disconnect(), cl.delete(e)), e.style.pointerEvents = "";
}
function ml(e, t) {
	let n = rt(e), r = [];
	return nl.hasPointerBlockingLayer() && !n.body.hasAttribute("data-inert") && (sl.set(n.body, n.body.style.pointerEvents), queueMicrotask(() => {
		let e = n.body;
		e && (e.style.pointerEvents = "none", e.setAttribute("data-inert", ""));
	})), t?.forEach((e) => {
		let [t, n] = pr(() => {
			let t = e();
			return Ue(t) ? t : null;
		}, { timeout: 1e3 });
		t.then((e) => r.push(or(e, { pointerEvents: "auto" }))), r.push(n);
	}), () => {
		nl.hasPointerBlockingLayer() || (queueMicrotask(() => {
			let e = n.body;
			if (!e) return;
			let t = sl.get(e);
			t !== void 0 && (e.style.pointerEvents = t, sl.delete(e)), e.removeAttribute("data-inert"), e.style.length === 0 && e.removeAttribute("style");
		}), r.forEach((e) => e()));
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/dismissable-layer.mjs
function hl(e, t) {
	let { onDismiss: n, onRequestDismiss: r, pointerBlocking: i, exclude: a, debug: o, type: s = "dialog", layerStyleTargets: c } = t, l = {
		dismiss: n,
		node: e,
		type: s,
		pointerBlocking: i,
		requestDismiss: r,
		styleTargets: c
	};
	nl.add(l), fl();
	function u(r) {
		let i = Ut(r.detail.originalEvent);
		nl.isBelowPointerBlockingLayer(e) || nl.isInBranch(i) || (t.onPointerDownOutside?.(r), t.onInteractOutside?.(r), !r.defaultPrevented && (o && console.log("onPointerDownOutside:", r.detail.originalEvent), n?.()));
	}
	function d(e) {
		let r = Ut(e.detail.originalEvent);
		nl.isInBranch(r) || (t.onFocusOutside?.(e), t.onInteractOutside?.(e), !e.defaultPrevented && (o && console.log("onFocusOutside:", e.detail.originalEvent), n?.()));
	}
	function f(r) {
		nl.isTopMost(e) && (t.onEscapeKeyDown?.(r), !r.defaultPrevented && n && (r.preventDefault(), n()));
	}
	function p(n) {
		let r = typeof a == "function" ? a() : a, i = Array.isArray(r) ? r : [r], o = t.persistentElements?.map((e) => e()).filter(Ue);
		return o && i.push(...o), i.some((e) => nt(e, n)) || nl.isInNestedLayer(e, n);
	}
	let m = [
		i ? ml(e, t.persistentElements) : void 0,
		el(e, f),
		Qc(e, {
			exclude: p,
			onFocusOutside: d,
			onPointerDownOutside: u,
			defer: t.defer
		})
	];
	return () => {
		nl.remove(e), fl(), pl(e), m.forEach((e) => e?.());
	};
}
function gl(e, t) {
	let { warnOnMissingNode: n = !0 } = t;
	return mr(e, (e) => hl(e, t), {
		defer: t.defer,
		onMissing: n ? () => Ri("[@zag-js/dismissable] node is `null` or `undefined`") : void 0
	});
}
function _l(e, t = {}) {
	return mr(e, (e) => (nl.addBranch(e), () => {
		nl.removeBranch(e);
	}), {
		defer: t.defer,
		onMissing: () => Ri("[@zag-js/dismissable] branch node is `null` or `undefined`")
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+focus-trap@1.43.3/node_modules/@zag-js/focus-trap/dist/chunk-QZ7TP4HQ.mjs
var vl = Object.defineProperty, yl = (e, t, n) => t in e ? vl(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, X = (e, t, n) => yl(e, typeof t == "symbol" ? t : t + "", n), bl = {
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
}, xl = [], Sl = class {
	constructor(e, t) {
		X(this, "trapStack"), X(this, "config"), X(this, "doc"), X(this, "state", {
			containers: [],
			containerGroups: [],
			tabbableGroups: [],
			nodeFocusedBeforeActivation: null,
			mostRecentlyFocusedNode: null,
			active: !1,
			paused: !1,
			delayInitialFocusTimer: void 0,
			recentNavEvent: void 0
		}), X(this, "lastInteractionType", "keyboard"), X(this, "portalContainers", /* @__PURE__ */ new Set()), X(this, "listenerCleanups", []), X(this, "handleFocus", (e) => {
			let t = Ut(e), n = this.findContainerIndex(t, e) >= 0;
			if (n || We(t)) n && (this.state.mostRecentlyFocusedNode = t);
			else {
				e.stopImmediatePropagation();
				let t, n = !0;
				if (this.state.mostRecentlyFocusedNode) {
					if (Tn(this.state.mostRecentlyFocusedNode) > 0) {
						let e = this.findContainerIndex(this.state.mostRecentlyFocusedNode), { tabbableNodes: r } = this.state.containerGroups[e];
						if (r.length > 0) {
							let e = r.findIndex((e) => e === this.state.mostRecentlyFocusedNode);
							e >= 0 && (this.config.isKeyForward(this.state.recentNavEvent) ? e + 1 < r.length && (t = r[e + 1], n = !1) : e - 1 >= 0 && (t = r[e - 1], n = !1));
						}
					} else this.state.containerGroups.some((e) => e.tabbableNodes.some((e) => Tn(e) > 0)) || (n = !1);
				} else n = !1;
				n && (t = this.findNextNavNode({
					target: this.state.mostRecentlyFocusedNode,
					isBackward: this.config.isKeyBackward(this.state.recentNavEvent)
				})), t ? this.tryFocus(t) : this.tryFocus(this.state.mostRecentlyFocusedNode || this.getInitialFocusNode());
			}
			this.state.recentNavEvent = void 0;
		}), X(this, "handlePointerDown", (e) => {
			this.lastInteractionType = "pointer";
			let t = Ut(e);
			if (!(this.findContainerIndex(t, e) >= 0)) {
				if (Dl(this.config.clickOutsideDeactivates, e)) {
					this.deactivate({ returnFocus: this.config.returnFocusOnDeactivate });
					return;
				}
				Dl(this.config.allowOutsideClick, e) || e.preventDefault();
			}
		}), X(this, "handleClick", (e) => {
			let t = Ut(e);
			this.findContainerIndex(t, e) >= 0 || Dl(this.config.clickOutsideDeactivates, e) || Dl(this.config.allowOutsideClick, e) || (e.preventDefault(), e.stopImmediatePropagation());
		}), X(this, "handleTabKey", (e) => {
			if (this.lastInteractionType = "keyboard", this.config.isKeyForward(e) || this.config.isKeyBackward(e)) {
				this.state.recentNavEvent = e;
				let t = this.config.isKeyBackward(e), n = this.findNextNavNode({
					event: e,
					isBackward: t
				});
				if (!n) return;
				wl(e) && e.preventDefault(), this.tryFocus(n);
			}
		}), X(this, "handleEscapeKey", (e) => {
			Ol(e) && Dl(this.config.escapeDeactivates, e) !== !1 && (e.preventDefault(), this.deactivate());
		}), X(this, "_mutationObserver"), X(this, "setupMutationObserver", () => {
			let e = this.doc.defaultView || window;
			this._mutationObserver = new e.MutationObserver((e) => {
				e.some((e) => Array.from(e.removedNodes).some((e) => e === this.state.mostRecentlyFocusedNode)) && this.tryFocus(this.getInitialFocusNode()), e.some((e) => e.type === "attributes" && (e.attributeName === "aria-controls" || e.attributeName === "aria-expanded") || e.type === "childList" && e.addedNodes.length > 0 && Array.from(e.addedNodes).some((e) => {
					if (e.nodeType !== Node.ELEMENT_NODE) return !1;
					let t = e;
					return yt(t) ? !0 : t.id && !this.state.containers.some((e) => e.contains(t)) ? bt(t) : !1;
				})) && this.state.active && !this.state.paused && (this.updateTabbableNodes(), this.updatePortalContainers());
			});
		}), X(this, "updateObservedNodes", () => {
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
		}), X(this, "getInitialFocusNode", () => {
			let e = this.getNodeForOption("initialFocus", { hasFallback: !0 });
			if (e === !1) return !1;
			if (e === void 0 || e && !xn(e)) {
				let t = ot(this.doc);
				if (t && this.findContainerIndex(t) >= 0) e = t;
				else {
					let t = this.state.tabbableGroups[0];
					e = t && t.firstTabbableNode || this.getNodeForOption("fallbackFocus");
				}
			} else e === null && (e = this.getNodeForOption("fallbackFocus"));
			if (!e || (e.isConnected || (e = this.getNodeForOption("fallbackFocus")), !e || !e.isConnected)) throw Error("Your focus-trap needs to have at least one focusable element");
			return e;
		}), X(this, "tryFocus", (e, t) => {
			if (e !== !1 && e !== ot(this.doc)) {
				if (!e || !e.focus) {
					this.tryFocus(this.getInitialFocusNode());
					return;
				}
				e.focus({
					preventScroll: !!this.config.preventScroll,
					...t
				}), this.state.mostRecentlyFocusedNode = e, Al(e) && e.select();
			}
		}), X(this, "deactivate", (e) => {
			if (!this.state.active) return this;
			let t = {
				onDeactivate: this.config.onDeactivate,
				onPostDeactivate: this.config.onPostDeactivate,
				checkCanReturnFocus: this.config.checkCanReturnFocus,
				...e
			};
			clearTimeout(this.state.delayInitialFocusTimer), this.state.delayInitialFocusTimer = void 0, this.removeListeners(), this.state.active = !1, this.state.paused = !1, this.updateObservedNodes(), bl.deactivateTrap(this.trapStack, this), this.portalContainers.clear();
			let n = this.getOption(t, "onDeactivate"), r = this.getOption(t, "onPostDeactivate"), i = this.getOption(t, "checkCanReturnFocus"), a = this.getOption(t, "returnFocus", "returnFocusOnDeactivate");
			n?.();
			let o = () => {
				kl(() => {
					if (a && this.isSafeToOverrideFocus()) {
						let e = this.getReturnFocusNode(this.state.nodeFocusedBeforeActivation), t = this.lastInteractionType === "keyboard" ? { focusVisible: !0 } : void 0;
						this.tryFocus(e, t);
					}
					r?.();
				});
			};
			return a && i ? (i(this.getReturnFocusNode(this.state.nodeFocusedBeforeActivation)).then(o, o), this) : (o(), this);
		}), X(this, "pause", (e) => {
			if (this.state.paused || !this.state.active) return this;
			let t = this.getOption(e, "onPause"), n = this.getOption(e, "onPostPause");
			return this.state.paused = !0, t?.(), this.removeListeners(), this.updateObservedNodes(), n?.(), this;
		}), X(this, "unpause", (e) => {
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
		}), X(this, "updateContainerElements", (e) => (this.state.containers = Array.isArray(e) ? e.filter(Boolean) : [e].filter(Boolean), this.state.active && this.updateTabbableNodes(), this.updateObservedNodes(), this)), X(this, "getReturnFocusNode", (e) => {
			let t = this.getNodeForOption("setReturnFocus", { params: [e] });
			return t || t !== !1 && e;
		}), X(this, "getOption", (e, t, n) => e && e[t] !== void 0 ? e[t] : this.config[n || t]), X(this, "getNodeForOption", (e, { hasFallback: t = !1, params: n = [] } = {}) => {
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
		}), X(this, "findNextNavNode", (e) => {
			let { event: t, isBackward: n = !1 } = e, r = e.target || Ut(t);
			this.updateTabbableNodes();
			let i = null;
			if (this.state.tabbableGroups.length > 0) {
				let e = this.findContainerIndex(r, t), a = e >= 0 ? this.state.containerGroups[e] : void 0;
				if (e < 0) i = n ? this.state.tabbableGroups[this.state.tabbableGroups.length - 1].lastTabbableNode : this.state.tabbableGroups[0].firstTabbableNode;
				else if (n) {
					let n = this.state.tabbableGroups.findIndex(({ firstTabbableNode: e }) => r === e);
					if (n < 0 && (a?.container === r || xn(r) && !Cn(r) && !a?.nextTabbableNode(r, !1)) && (n = e), n >= 0) {
						let e = n === 0 ? this.state.tabbableGroups.length - 1 : n - 1, t = this.state.tabbableGroups[e];
						i = Tn(r) >= 0 ? t.lastTabbableNode : t.lastDomTabbableNode;
					} else wl(t) || (i = a?.nextTabbableNode(r, !1));
				} else {
					let n = this.state.tabbableGroups.findIndex(({ lastTabbableNode: e }) => r === e);
					if (n < 0 && (a?.container === r || xn(r) && !Cn(r) && !a?.nextTabbableNode(r)) && (n = e), n >= 0) {
						let e = n === this.state.tabbableGroups.length - 1 ? 0 : n + 1, t = this.state.tabbableGroups[e];
						i = Tn(r) >= 0 ? t.firstTabbableNode : t.firstDomTabbableNode;
					} else wl(t) || (i = a?.nextTabbableNode(r));
				}
			} else i = this.getNodeForOption("fallbackFocus");
			return i;
		}), this.trapStack = t.trapStack || xl;
		let n = {
			returnFocusOnDeactivate: !0,
			escapeDeactivates: !0,
			delayInitialFocus: !0,
			followControlledElements: !0,
			isKeyForward: Tl,
			isKeyBackward: El,
			...t
		};
		this.doc = n.document || rt(Array.isArray(e) ? e[0] : e), this.config = n, this.updateContainerElements(e), this.setupMutationObserver();
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
			gt(e).forEach((e) => {
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
		return this.config.followControlledElements ? mt(e, t) : !1;
	}
	isPersistentElement(e, t) {
		let n = this.config.persistentElements;
		if (!n || n.length === 0) return !1;
		let r = typeof t?.composedPath == "function" ? t.composedPath() : void 0;
		return n.some((t) => {
			let n = t();
			return nt(n, e) || n != null && r?.includes(n);
		});
	}
	updateTabbableNodes() {
		if (this.state.containerGroups = this.state.containers.map((e) => {
			let t = Sn(e, { getShadowRoot: this.config.getShadowRoot }), n = bn(e, { getShadowRoot: this.config.getShadowRoot }), r = t[0], i = t[t.length - 1], a = r, o = i, s = !1;
			for (let e = 0; e < t.length; e++) if (Tn(t[e]) > 0) {
				s = !0;
				break;
			}
			function c(e, r = !0) {
				let i = t.indexOf(e);
				if (i >= 0) return t[i + (r ? 1 : -1)];
				let a = n.indexOf(e);
				if (!(a < 0)) {
					if (r) {
						for (let e = a + 1; e < n.length; e++) if (Cn(n[e])) return n[e];
					} else for (let e = a - 1; e >= 0; e--) if (Cn(n[e])) return n[e];
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
		if (this.state.active) return bl.activateTrap(this.trapStack, this), this.listenerCleanups.push(on(this.doc, "focusin", this.handleFocus, !0), on(this.doc, "mousedown", this.handlePointerDown, {
			capture: !0,
			passive: !1
		}), on(this.doc, "touchstart", this.handlePointerDown, {
			capture: !0,
			passive: !1
		}), on(this.doc, "click", this.handleClick, {
			capture: !0,
			passive: !1
		}), on(this.doc, "keydown", this.handleTabKey, {
			capture: !0,
			passive: !1
		}), on(this.doc, "keydown", this.handleEscapeKey)), this;
	}
	commitInitialFocus() {
		return this.state.delayInitialFocusTimer = this.config.delayInitialFocus ? kl(() => {
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
		return this.state.containers.some((t) => nt(t, e));
	}
	isSafeToOverrideFocus() {
		let e = ot(this.doc);
		return !e || e === this.doc.body || this.containsElement(e) ? !0 : this.trapStack.some((t) => t !== this && t.containsElement(e));
	}
	activate(e) {
		if (this.state.active) return this;
		let t = this.getOption(e, "onActivate"), n = this.getOption(e, "onPostActivate"), r = this.getOption(e, "checkCanFocusTrap");
		r || this.updateTabbableNodes(), this.state.active = !0, this.state.paused = !1, this.state.nodeFocusedBeforeActivation = ot(this.doc), t?.();
		let i = () => {
			r && this.updateTabbableNodes(), this.addListeners(), this.updateObservedNodes(), n?.();
		};
		return r ? (r(this.state.containers.concat()).then(i, i), this) : (i(), this);
	}
}, Cl = (e) => e?.type === "keydown", wl = (e) => Cl(e) && e?.key === "Tab", Tl = (e) => Cl(e) && e.key === "Tab" && !e?.shiftKey, El = (e) => Cl(e) && e.key === "Tab" && e?.shiftKey, Dl = (e, ...t) => typeof e == "function" ? e(...t) : e, Ol = (e) => !e.isComposing && e.key === "Escape", kl = (e) => setTimeout(e, 0), Al = (e) => e.localName === "input" && "select" in e && typeof e.select == "function";
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+focus-trap@1.43.3/node_modules/@zag-js/focus-trap/dist/index.mjs
function jl(e, t = {}) {
	let n, r = q(() => {
		let r = (Array.isArray(e) ? e : [e]).map((e) => typeof e == "function" ? e() : e).filter((e) => e != null);
		if (r.length === 0) return;
		let i = r[0];
		n = new Sl(r, {
			escapeDeactivates: !1,
			allowOutsideClick: !0,
			preventScroll: !0,
			returnFocusOnDeactivate: !0,
			delayInitialFocus: !1,
			fallbackFocus: i,
			...t,
			document: rt(i)
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
var Ml = "data-scroll-lock", Nl = /* @__PURE__ */ new WeakMap();
function Pl(e) {
	let t = e.getBoundingClientRect().left;
	return Math.round(t) + e.scrollLeft ? "paddingLeft" : "paddingRight";
}
function Fl(e) {
	let t = ut(e)?.scrollbarGutter;
	return t === "stable" || t?.startsWith("stable ") === !0;
}
function Il(e) {
	let { documentElement: t, body: n } = e;
	return Rn(t) ? t : n;
}
function Ll(e) {
	let t = e.defaultView ?? window, { documentElement: n, body: r } = e, i = Il(e), a = Fl(n) || Fl(r), o = t.innerWidth - n.clientWidth;
	r.setAttribute(Ml, "");
	let s = () => sr(n, "--scrollbar-width", `${o}px`), c = Pl(n), l = [s(), It() ? (() => {
		let { scrollX: e, scrollY: n, visualViewport: i } = t, s = i?.offsetLeft ?? 0, l = i?.offsetTop ?? 0, u = {
			position: "fixed",
			overflow: "hidden",
			top: `${-(n - Math.floor(l))}px`,
			left: `${-(e - Math.floor(s))}px`,
			right: "0"
		};
		!a && o > 0 && (u[c] = `${o}px`);
		let d = or(r, u);
		return () => {
			d?.(), t.scrollTo({
				left: e,
				top: n,
				behavior: "instant"
			});
		};
	})() : (() => {
		let e = { overflow: "hidden" };
		return !a && o > 0 && (e[c] = `${o}px`), or(i, e);
	})()];
	return () => {
		l.forEach((e) => e?.()), r.removeAttribute(Ml);
	};
}
function Rl(e) {
	let t = e ?? document, n = Nl.get(t);
	n || (n = {
		count: 0,
		cleanup: Ll(t)
	}, Nl.set(t, n)), n.count++;
	let r = n, i = !1;
	return () => {
		i || (i = !0, r.count--, r.count === 0 && (r.cleanup(), Nl.delete(t)));
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dialog@1.43.3/node_modules/@zag-js/dialog/dist/dialog.machine.mjs
var zl = va({
	props({ props: e, scope: t }) {
		let n = e.role === "alertdialog", r = n ? () => Tc(t) : void 0, i = typeof e.modal != "boolean" || e.modal;
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
						triggerElement: Dc(n, e)
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
				return gl(() => yc(e), {
					type: "dialog",
					defer: !0,
					pointerBlocking: n("modal"),
					layerStyleTargets: [() => xc(e), () => bc(e)],
					exclude: [Sc(e), ...Ec(e)].filter(Boolean),
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
				if (t("preventScroll")) return Rl(e.getDoc());
			},
			trapFocus({ scope: e, prop: t, context: n }) {
				return t("trapFocus") ? jl(() => yc(e), {
					preventScroll: !0,
					returnFocusOnDeactivate: !!t("restoreFocus"),
					initialFocus: () => En({
						root: yc(e),
						getInitialEl: t("initialFocusEl")
					}),
					setReturnFocus: (r) => {
						let i = t("finalFocusEl")?.();
						if (i) return i;
						let a = n.get("triggerValue");
						if (a) {
							let t = Dc(e, a);
							if (t) return t;
						}
						return Ec(e)[0] || r;
					},
					getShadowRoot: !0
				}) : void 0;
			},
			hideContentBelow({ scope: e, prop: t }) {
				return t("modal") ? Vc(() => [yc(e)], { defer: !0 }) : void 0;
			}
		},
		actions: {
			setInitialFocus({ prop: e, scope: t }) {
				e("trapFocus") || q(() => {
					En({
						root: yc(t),
						getInitialEl: e("initialFocusEl")
					})?.focus({ preventScroll: !0 });
				});
			},
			checkRenderedElements({ context: e, scope: t }) {
				q(() => {
					e.set("rendered", {
						title: !!Cc(t),
						description: !!wc(t)
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
}), Bl = (e) => {
	let t = br(), n = uo(), r = F(() => {
		let r = pi(e) || {};
		return {
			getRootNode: t().getRootNode,
			dir: n().dir,
			...r
		};
	}), i = La(zl, () => S(r)), a = F(() => Oc(i, ka));
	return () => S(a);
}, Vl = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open",
	"children"
]);
function Hl(t, n) {
	let r = o();
	k(n, !0);
	let i = B(n, "open", 15), a = B(n, "children", 7), s = H(n, Vl), c = F(() => Qa(s)), l = F(() => P(S(c), 2)), u = F(() => S(l)[0]), d = F(() => S(l)[1]), f = F(() => Or(S(u))), m = F(() => P(S(f), 1)), h = F(() => S(m)[0]), g = F(() => ({
		...S(d),
		id: S(d).id ?? r,
		open: i(),
		onOpenChange(e) {
			S(d).onOpenChange?.(e), i() !== void 0 && i(e.open);
		}
	})), _ = Bl(() => S(g)), v = F(() => ({
		...S(u),
		present: _().open
	})), y = Za(() => S(v));
	to(_), Tr(() => S(h)), $a(y);
	var b = {
		get open() {
			return i();
		},
		set open(t) {
			i(t), e();
		},
		get children() {
			return a();
		},
		set children(t) {
			a(t), e();
		}
	}, x = p(), C = V(x);
	return z(C, () => a() ?? ue), R(t, x), L(b);
}
W(Hl, {
	open: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/dialog/dialog-title.svelte
var Ul = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Wl(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Ul), a = no(), o = F(() => J(a().getTitleProps(), i));
	return Y(t, I({ as: "h2" }, () => S(o), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(Wl, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/css.ts
var Gl = ".af-kit{--k-bg:var(--af-bg,#f8fafc);--k-surface:var(--af-surface,#fff);--k-fg:var(--af-fg,#0d1928);--k-muted:var(--af-muted-fg,#576477);--k-line:var(--af-border,#e0e6ee);--k-primary:var(--af-primary,#0c71d1);--k-primary-fg:var(--af-primary-fg,#fafcfe);--k-danger:var(--af-danger,#e40014);--k-warning:var(--af-warning,#dd7400);--k-success:var(--af-success,#009767);--k-info:#0f74c5;--k-radius:var(--af-radius,.625rem);--k-font:var(--af-font-sans,ui-sans-serif, system-ui, sans-serif);--k-ring:var(--k-primary);--k-hover:color-mix(in oklab, var(--k-fg) 5%, var(--k-surface));--k-press:color-mix(in oklab, var(--k-fg) 9%, var(--k-surface));font-family:var(--k-font);color:var(--k-fg)}@supports (color:lab(0% 0 0)){.af-kit{--k-bg:var(--af-bg,lab(98.1433% -.367165 -1.06069));--k-surface:var(--af-surface,lab(100% 0 0));--k-fg:var(--af-fg,lab(8.19431% -1.05806 -12.2385));--k-muted:var(--af-muted-fg,lab(41.8773% -1.78064 -12.648));--k-line:var(--af-border,lab(90.9248% -1.03632 -4.75875));--k-primary:var(--af-primary,lab(46.5609% 2.72214 -58.0728));--k-primary-fg:var(--af-primary-fg,lab(98.837% -.443995 -1.43219));--k-danger:var(--af-danger,lab(48.4493% 77.4328 61.5452));--k-warning:var(--af-warning,lab(60.3514% 40.5624 87.1228));--k-success:var(--af-success,lab(55.0481% -49.9246 15.93));--k-info:lab(47.0007% -3.24479 -50.2754)}}:host([data-theme=dark]) .af-kit{--k-bg:var(--af-bg,#0b121b);--k-surface:var(--af-surface,#131b25);--k-fg:var(--af-fg,#eff3f6);--k-muted:var(--af-muted-fg,#a9b2be);--k-line:var(--af-border,#ffffff1c);--k-primary:var(--af-primary,#63b1f9);--k-primary-fg:var(--af-primary-fg,#0a1725);--k-danger:var(--af-danger,#ff6568);--k-warning:var(--af-warning,#f99c00);--k-success:var(--af-success,#00bb7f);--k-info:#6db0f4}@supports (color:lab(0% 0 0)){:host([data-theme=dark]) .af-kit{--k-bg:var(--af-bg,lab(5.20297% -.7421 -7.06235));--k-surface:var(--af-surface,lab(9.19901% -1.18761 -8.50037));--k-fg:var(--af-fg,lab(95.5874% -.662178 -2.14615));--k-muted:var(--af-muted-fg,lab(72.1142% -1.52099 -7.28307));--k-line:var(--af-border,lab(100% 0 0/.11));--k-primary:var(--af-primary,lab(69.4527% -8.90157 -43.6168));--k-primary-fg:var(--af-primary-fg,lab(7.09383% -1.43068 -11.9741));--k-danger:var(--af-danger,lab(63.7053% 60.745 31.3109));--k-warning:var(--af-warning,lab(72.7183% 31.8672 97.9407));--k-success:var(--af-success,lab(66.9756% -58.27 19.5419));--k-info:lab(69.4439% -7.35071 -40.8943)}}.af-kit [popover]{color:inherit;background:0 0;border:0;margin:0;padding:0;inset:auto;overflow:visible}.af-button{border-radius:max(0px, calc(var(--k-radius) - 2px));border:1px solid var(--k-line);background:var(--k-surface);min-height:32px;color:var(--k-fg);font:inherit;white-space:nowrap;cursor:pointer;justify-content:center;align-items:center;gap:6px;padding:0 12px;font-size:14px;font-weight:500;line-height:20px;text-decoration:none;transition:background-color .1s cubic-bezier(.2,0,0,1),border-color .1s cubic-bezier(.2,0,0,1);display:inline-flex}.af-button svg{pointer-events:none;flex:none;width:16px;height:16px}.af-button:focus-visible{outline:2px solid var(--k-ring);outline-offset:2px}.af-button.primary{background:var(--k-primary);border-color:var(--k-primary);color:var(--k-primary-fg)}.af-button.secondary{background:var(--k-surface)}.af-button.danger{background:var(--k-danger);border-color:var(--k-danger);color:var(--k-primary-fg)}.af-button.ghost{background:0 0;border-color:#0000}.af-button:not([aria-disabled=true],:disabled):hover{background:var(--k-hover)}.af-button.primary:not([aria-disabled=true],:disabled):hover{background:color-mix(in oklab, var(--k-primary) 90%, var(--k-bg));border-color:color-mix(in oklab, var(--k-primary) 90%, var(--k-bg))}.af-button.danger:not([aria-disabled=true],:disabled):hover{background:color-mix(in oklab, var(--k-danger) 90%, var(--k-bg));border-color:color-mix(in oklab, var(--k-danger) 90%, var(--k-bg))}.af-button:not([aria-disabled=true],:disabled):active{background:var(--k-press);transition:none}.af-button.primary:not([aria-disabled=true],:disabled):active{background:color-mix(in oklab, var(--k-primary) 82%, var(--k-fg));border-color:color-mix(in oklab, var(--k-primary) 82%, var(--k-fg))}.af-button.danger:not([aria-disabled=true],:disabled):active{background:color-mix(in oklab, var(--k-danger) 82%, var(--k-fg));border-color:color-mix(in oklab, var(--k-danger) 82%, var(--k-fg))}.af-button.sm{min-height:28px;padding:0 10px;font-size:12px;line-height:18px}.af-button.icon{width:32px;padding:0}.af-button.icon.sm{border-radius:max(0px, calc(var(--k-radius) - 4px));width:24px;min-height:24px}.af-button[aria-disabled=true],.af-button:disabled{opacity:.55;cursor:not-allowed}.af-chip{background:color-mix(in oklab, var(--k-primary) 12%, var(--k-surface));color:var(--k-fg);border-radius:999px;align-items:center;gap:4px;padding:1px 8px;font-size:12px;line-height:18px;display:inline-flex}.af-chip.neutral{background:color-mix(in oklab, var(--k-fg) 7%, var(--k-surface));color:var(--k-fg)}.af-chip.danger{background:color-mix(in oklab, var(--k-danger) 12%, var(--k-surface));color:color-mix(in oklab, var(--k-danger) 75%, var(--k-fg))}.af-chip.success{background:color-mix(in oklab, var(--k-success) 12%, var(--k-surface));color:color-mix(in oklab, var(--k-success) 75%, var(--k-fg))}.af-chip.warning{background:color-mix(in oklab, var(--k-warning) 12%, var(--k-surface));color:color-mix(in oklab, var(--k-warning) 75%, var(--k-fg))}.af-chip.info{background:color-mix(in oklab, var(--k-info) 12%, var(--k-surface));color:color-mix(in oklab, var(--k-info) 75%, var(--k-fg))}.af-avatar{background:color-mix(in oklab, var(--k-primary) 20%, var(--k-surface));width:24px;height:24px;color:var(--k-fg);border-radius:50%;flex:none;place-items:center;font-size:10px;font-weight:600;display:inline-grid;overflow:hidden}.af-avatar.sm{width:20px;height:20px;font-size:9px}.af-avatar.lg{width:32px;height:32px;font-size:13px}.af-avatar img{object-fit:cover;width:100%;height:100%}.af-avatar[data-hue]{background:oklch(.92 .06 var(--k-hue,255));color:oklch(.38 .12 var(--k-hue,255))}:host([data-theme=dark]) .af-avatar[data-hue]{background:oklch(.36 .07 var(--k-hue,255));color:oklch(.9 .06 var(--k-hue,255))}.af-avatar[data-hue=\"0\"]{--k-hue:255}.af-avatar[data-hue=\"1\"]{--k-hue:290}.af-avatar[data-hue=\"2\"]{--k-hue:330}.af-avatar[data-hue=\"3\"]{--k-hue:20}.af-avatar[data-hue=\"4\"]{--k-hue:60}.af-avatar[data-hue=\"5\"]{--k-hue:145}.af-avatar[data-hue=\"6\"]{--k-hue:180}.af-avatar[data-hue=\"7\"]{--k-hue:215}.af-tabs{border-bottom:1px solid var(--k-line);gap:4px;display:flex}.af-tabs>[role=tab]{border-radius:max(0px, calc(var(--k-radius) - 4px)) max(0px, calc(var(--k-radius) - 4px)) 0 0;color:var(--k-muted);font:inherit;cursor:pointer;background:0 0;border:0;padding:8px 12px;transition:background-color .1s cubic-bezier(.2,0,0,1),color .1s cubic-bezier(.2,0,0,1)}.af-tabs>[role=tab]:hover{background:var(--k-hover);color:var(--k-fg)}.af-tabs>[role=tab]:active{background:var(--k-press);transition:none}.af-tabs>[role=tab]:focus-visible{outline:2px solid var(--k-ring);outline-offset:-2px}.af-tabs>[role=tab][aria-selected=true]{color:var(--k-fg);box-shadow:inset 0 -2px 0 var(--k-primary)}.af-tabs.segmented{border-radius:max(0px, calc(var(--k-radius) - 2px));background:color-mix(in oklab, var(--k-bg) 94%, var(--k-fg));border:0;gap:2px;padding:2px;display:inline-flex}.af-tabs.segmented>[role=tab]{border-radius:max(0px, calc(var(--k-radius) - 4px));white-space:nowrap;align-items:center;gap:6px;height:28px;padding:0 12px;font-size:12px;font-weight:500;line-height:18px;display:inline-flex}.af-tabs.segmented>[role=tab]:hover{background:color-mix(in oklab, var(--k-fg) 5%, transparent)}.af-tabs.segmented>[role=tab][aria-selected=true]{background:var(--k-surface);box-shadow:0 1px 2px #0f172a0f}.af-skeleton{border-radius:var(--k-radius);background:linear-gradient(90deg, color-mix(in oklab, var(--k-fg) 6%, transparent), color-mix(in oklab, var(--k-fg) 10%, transparent), color-mix(in oklab, var(--k-fg) 6%, transparent));background-size:200% 100%;min-height:12px;animation:1.2s linear infinite af-shimmer}@keyframes af-shimmer{to{background-position:-200% 0}}.af-banner{border-radius:var(--k-radius);border:1px solid var(--k-line);background:var(--k-surface);align-items:center;gap:8px;padding:8px 12px;display:flex}.af-banner>svg{flex:none}.af-banner.info{border-color:color-mix(in oklab, var(--k-info) 30%, var(--k-line));background:color-mix(in oklab, var(--k-info) 12%, var(--k-surface))}.af-banner.warning{border-color:color-mix(in oklab, var(--k-warning) 35%, var(--k-line));background:color-mix(in oklab, var(--k-warning) 14%, var(--k-surface))}.af-banner.danger{border-color:color-mix(in oklab, var(--k-danger) 35%, var(--k-line));background:color-mix(in oklab, var(--k-danger) 12%, var(--k-surface));color:color-mix(in oklab, var(--k-danger) 78%, var(--k-fg))}.af-overlay{background:var(--k-surface);color:var(--k-fg);border:1px solid var(--k-line);border-radius:var(--k-radius);box-shadow:0 2px 6px #0f172a14,0 12px 28px -6px #0f172a38}:host([data-theme=dark]) .af-overlay{box-shadow:0 2px 6px #0006,0 12px 28px -6px #0009}@media (prefers-reduced-motion:reduce){.af-skeleton{animation:none}.af-button,.af-tabs>[role=tab]{transition:none}}";
//#endregion
//#region src/kit/KitStyles.svelte
function Kl(e) {
	let t = `<style>${Gl}</style>`;
	var n = p(), r = V(n);
	y(r, () => t), R(e, n);
}
W(Kl, {}, [], [], { mode: "open" });
//#endregion
//#region src/kit/environment.ts
function ql(e, t, n) {
	e.dispatchEvent(new CustomEvent(t, {
		detail: n,
		bubbles: !0,
		composed: !1
	}));
}
function Jl(e, t, n) {
	if (!e || !e.isConnected) return;
	n.dataset.raised = String(t);
	let r;
	try {
		r = e.matches(":popover-open");
	} catch {
		r = e.dataset.shown === "true";
	}
	t && !r ? e.showPopover?.() : !t && r && e.hidePopover?.();
}
function Yl() {
	let e = document.activeElement;
	for (; e?.shadowRoot?.activeElement;) e = e.shadowRoot.activeElement;
	return e instanceof HTMLElement ? e : null;
}
function Xl(e, t) {
	for (let n = t; n;) {
		if (n === e) return !0;
		let t = n.getRootNode();
		n = n.parentNode ?? (t instanceof ShadowRoot ? t.host : null);
	}
	return !1;
}
var Zl = [];
function Ql(e) {
	for (let t = Zl.length - 1; t >= 0; t--) {
		if (Zl[t].isConnected) return Zl[t] === e;
		Zl.splice(t, 1);
	}
	return !1;
}
function $l(e) {
	let t = null;
	return (n, r) => {
		if (n) {
			if (r && !n.open) t = Yl(), n.showModal(), Zl.push(e);
			else if (!r && n.open) {
				n.close();
				let r = Zl.lastIndexOf(e);
				r >= 0 && Zl.splice(r, 1);
				let i = t;
				t = null;
				let a = Yl();
				i?.isConnected && (!a || a === document.body || Xl(e, a)) && i.focus({ preventScroll: !0 });
			}
		}
	};
}
//#endregion
//#region src/kit/text.ts
var eu = {
	en: {
		close: "Close",
		cancel: "Cancel",
		confirm: "Confirm",
		today: "Today",
		clear: "Clear",
		remove: "Remove",
		unknownPerson: "Unknown person",
		noResults: "No matches",
		bold: "Bold",
		italic: "Italic",
		bulletList: "Bulleted list",
		numberedList: "Numbered list",
		link: "Link",
		mentionMenu: "Mention suggestions",
		mentionRestricted: "Restricted record",
		mentionRestrictedPerson: "Restricted person",
		mentionDeleted: "Deleted record",
		previousMonth: "Previous month",
		nextMonth: "Next month",
		notifications: "Notifications",
		openCalendar: "Open calendar",
		closeCalendar: "Close calendar",
		calendar: "Calendar",
		chooseDate: "Choose {date}",
		selectedDate: "Selected date. {date}",
		previousYear: "Previous year",
		nextYear: "Next year",
		previousDecade: "Previous decade",
		nextDecade: "Next decade",
		switchView: "Switch to {view} view",
		currentView: "{view} view",
		viewDay: "day",
		viewMonth: "month",
		viewYear: "year"
	},
	vi: {
		close: "Đóng",
		cancel: "Huỷ",
		confirm: "Xác nhận",
		today: "Hôm nay",
		clear: "Xoá",
		remove: "Bỏ",
		unknownPerson: "Người không rõ",
		noResults: "Không có kết quả",
		bold: "Đậm",
		italic: "Nghiêng",
		bulletList: "Danh sách",
		numberedList: "Danh sách số",
		link: "Liên kết",
		mentionMenu: "Gợi ý nhắc đến",
		mentionRestricted: "Bản ghi bị hạn chế",
		mentionRestrictedPerson: "Người bị hạn chế",
		mentionDeleted: "Bản ghi đã xoá",
		previousMonth: "Tháng trước",
		nextMonth: "Tháng sau",
		notifications: "Thông báo",
		openCalendar: "Mở lịch",
		closeCalendar: "Đóng lịch",
		calendar: "Lịch",
		chooseDate: "Chọn {date}",
		selectedDate: "Đã chọn {date}",
		previousYear: "Năm trước",
		nextYear: "Năm sau",
		previousDecade: "Thập kỷ trước",
		nextDecade: "Thập kỷ sau",
		switchView: "Chuyển sang xem {view}",
		currentView: "Xem {view}",
		viewDay: "ngày",
		viewMonth: "tháng",
		viewYear: "năm"
	}
};
function tu(e, t) {
	let n = eu[/^vi(-|$)/i.test(e ?? "") ? "vi" : "en"], r = Object.fromEntries(Object.entries(t ?? {}).filter(([, e]) => e !== void 0));
	return {
		...n,
		...r
	};
}
//#endregion
//#region src/kit/Confirm.svelte
var nu = m("<p part=\"message\" class=\"svelte-1fchw0y\"> </p>"), ru = m("<p part=\"impact\" class=\"svelte-1fchw0y\"> </p>"), iu = m("<div><!> <!></div>"), au = m("<!> <!> <footer part=\"actions\" class=\"svelte-1fchw0y\"><button type=\"button\" part=\"cancel\" class=\"af-button secondary\"> </button> <button type=\"button\" part=\"confirm\"> </button></footer>", 1), ou = m("<dialog><!></dialog>"), su = m("<!> <!>", 1), cu = {
	hash: "svelte-1fchw0y",
	code: "dialog.svelte-1fchw0y {border:0;padding:0;background:transparent;max-width:calc(100vw - 32px);overflow:visible;}dialog.svelte-1fchw0y::backdrop {background:rgb(0 0 0 / 0.4);}p.svelte-1fchw0y {margin:0;}footer.svelte-1fchw0y {display:flex;justify-content:flex-end;gap:8px;}[data-scope='dialog'][data-part='content'] {display:grid;gap:12px;width:min(420px, calc(100vw - 32px));padding:16px;border-radius:calc(var(--k-radius) + 4px);}[data-scope='dialog'][data-part='content']:focus-visible {outline:2px solid var(--k-ring);outline-offset:2px;}[data-scope='dialog'][data-part='title'] {margin:0;font-size:16px;font-weight:600;line-height:24px;}.description.svelte-1fchw0y {display:grid;gap:8px;font-size:14px;line-height:22px;}[part='message'].svelte-1fchw0y {color:var(--k-muted);}[part='impact'].svelte-1fchw0y {color:var(--k-fg);font-weight:500;}"
};
function lu(n, r) {
	k(r, !0), de(n, cu);
	let i = B(r, "open", 7, !1), a = B(r, "heading", 7, ""), o = B(r, "message", 7, ""), s = B(r, "confirmLabel", 7, null), c = B(r, "danger", 7, !1), f = B(r, "impact", 7, null), m = B(r, "busy", 7, !1), h = B(r, "locale", 7, null), g = B(r, "strings", 7, null), y = r.$$host, w = F(() => tu(h(), g() ?? void 0)), D = _(null), N = _(!1), P = !1, ee = $l(y);
	C(() => ee(S(D), !!i())), C(() => {
		i() && E(N, !1);
	}), C(() => {
		let e = !!m();
		P && !e && E(N, !1), P = e;
	});
	function I() {
		S(N) || m() || (E(N, !0), ql(y, "confirm", {}));
	}
	var z = {
		get open() {
			return i();
		},
		set open(t = !1) {
			i(t), e();
		},
		get heading() {
			return a();
		},
		set heading(t = "") {
			a(t), e();
		},
		get message() {
			return o();
		},
		set message(t = "") {
			o(t), e();
		},
		get confirmLabel() {
			return s();
		},
		set confirmLabel(t = null) {
			s(t), e();
		},
		get danger() {
			return c();
		},
		set danger(t = !1) {
			c(t), e();
		},
		get impact() {
			return f();
		},
		set impact(t = null) {
			f(t), e();
		},
		get busy() {
			return m();
		},
		set busy(t = !1) {
			m(t), e();
		},
		get locale() {
			return h();
		},
		set locale(t = null) {
			h(t), e();
		},
		get strings() {
			return g();
		},
		set strings(t = null) {
			g(t), e();
		}
	}, re = su(), ie = V(re);
	return Kl(ie, {}), Cr(T(ie, 2), {
		value: () => y.shadowRoot,
		children: (e, n) => {
			var r = p(), h = V(r), g = () => !!i();
			A(h, () => Hl, (e, n) => {
				n(e, {
					get open() {
						return g();
					},
					set open(e) {},
					modal: !1,
					preventScroll: !0,
					closeOnInteractOutside: !1,
					role: "alertdialog",
					onOpenChange: (e) => {
						e.open || ql(y, "cancel", { reason: "escape" });
					},
					children: (e, n) => {
						var r = p(), i = V(r);
						{
							let e = (e, n = ue) => {
								var r = ou(), i = (e) => e.preventDefault();
								j(r, (e) => ({
									...e,
									class: "af-kit",
									oncancel: i
								}), [() => n()()], void 0, void 0, "svelte-1fchw0y");
								var h = d(r);
								A(h, () => io, (e, n) => {
									n(e, {
										part: "content",
										class: "af-overlay dialog",
										"aria-modal": "true",
										children: (e, n) => {
											var r = au(), i = V(r);
											A(i, () => Wl, (e, n) => {
												n(e, {
													part: "heading",
													children: (e, n) => {
														U();
														var r = l();
														x(() => t(r, a() ?? "")), R(e, r);
													},
													$$slots: { default: !0 }
												});
											});
											var h = T(i, 2), g = (e) => {
												var n = p(), r = V(n);
												{
													let e = (e, n = ue) => {
														var r = iu();
														j(r, (e) => ({
															...e,
															class: "description"
														}), [() => n()()], void 0, void 0, "svelte-1fchw0y");
														var i = d(r), a = (e) => {
															var n = nu(), r = u(n, !0);
															x(() => t(r, o())), R(e, n);
														};
														b(i, (e) => {
															o() && e(a);
														});
														var s = T(i, 2), c = (e) => {
															var n = ru(), r = u(n, !0);
															x(() => t(r, f())), R(e, n);
														};
														b(s, (e) => {
															f() && e(c);
														}), M(r), R(e, r);
													};
													A(r, () => oo, (t, n) => {
														n(t, {
															asChild: e,
															$$slots: { asChild: !0 }
														});
													});
												}
												R(e, n);
											};
											b(h, (e) => {
												(o() || f()) && e(g);
											});
											var _ = T(h, 2), C = d(_), E = u(C, !0), D = T(C, 2), O = u(D, !0);
											M(_), x(() => {
												t(E, S(w).cancel), ne(D, 1, te(c() ? "af-button danger" : "af-button primary")), G(D, "aria-disabled", S(N) || m() ? "true" : void 0), t(O, s() || S(w).confirm);
											}), v("click", C, () => ql(y, "cancel", { reason: "close-button" })), v("click", D, I), R(e, r);
										},
										$$slots: { default: !0 }
									});
								}), M(r), O(r, (e) => E(D, e), () => S(D)), R(e, r);
							};
							A(i, () => co, (t, n) => {
								n(t, {
									asChild: e,
									$$slots: { asChild: !0 }
								});
							});
						}
						R(e, r);
					},
					$$slots: { default: !0 }
				});
			}), R(e, r);
		},
		$$slots: { default: !0 }
	}), R(n, re), L(z);
}
f(["click"]), W(lu, {
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
var Z = cc("date-picker").parts("clearTrigger", "content", "control", "input", "label", "monthSelect", "nextTrigger", "positioner", "presetTrigger", "prevTrigger", "rangeText", "root", "table", "tableBody", "tableCell", "tableCellTrigger", "tableHead", "tableHeader", "tableRow", "trigger", "view", "viewControl", "viewTrigger", "yearSelect").build();
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/constrain.mjs
function uu(e, t, n, r, i) {
	let a = {};
	for (let e in t) {
		let n = e, r = t[n];
		r != null && (a[n] = Math.floor(r / 2), a[n] > 0 && r % 2 == 0 && a[n]--);
	}
	return pu(e, du(e, t, n).subtract(a), t, n, r, i);
}
function du(e, t, n, r, i) {
	let a = e;
	return t.years ? a = Ho(e) : t.months ? a = Bo(e) : t.weeks && (a = Wo(e, n)), pu(e, a, t, n, r, i);
}
function fu(e, t, n, r, i) {
	let a = { ...t };
	return a.days ? a.days-- : a.weeks ? a.weeks-- : a.months ? a.months-- : a.years && a.years--, pu(e, du(e, t, n).subtract(a), t, n, r, i);
}
function pu(e, t, n, r, i, a) {
	return i && e.compare(i) >= 0 && (t = Qo(t, du(fs(i), n, r))), a && e.compare(a) <= 0 && (t = Zo(t, fu(fs(a), n, r))), t;
}
function mu(e, t, n) {
	let r = fs(e), i = t ? fs(t) : void 0, a = n ? fs(n) : void 0, o = r;
	return i && (o = Qo(o, i)), a && (o = Zo(o, a)), o.compare(r) === 0 ? e : "hour" in e ? e.set({
		year: o.year,
		month: o.month,
		day: o.day
	}) : o;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/align.mjs
function hu(e, t, n, r, i, a) {
	switch (t) {
		case "start": return du(e, n, r, i, a);
		case "end": return fu(e, n, r, i, a);
		default: return uu(e, n, r, i, a);
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/assertion.mjs
function gu(e, t) {
	return e == null || t == null ? e === t : !("hour" in e) && !("hour" in t) ? xo(e, t) : ps(e).compare(ps(t)) === 0;
}
function _u(e, t, n, r, i) {
	return e ? t?.(e, n) ? !0 : vu(e, r, i) : !1;
}
function vu(e, t, n) {
	return t != null && e.compare(t) < 0 || n != null && e.compare(n) > 0;
}
function yu(e, t, n) {
	let r = e.subtract({ days: 1 });
	return xo(r, e) || vu(r, t, n);
}
function bu(e, t, n) {
	let r = e.add({ days: 1 });
	return xo(r, e) || vu(r, t, n);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/duration.mjs
function xu(e) {
	let t = { ...e };
	for (let e in t) t[e] = 1;
	return t;
}
function Su(e, t) {
	let n = { ...t };
	return n.days ? n.days-- : n.days = -1, e.add(n);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/get-era-format.mjs
function Cu(e) {
	if (!e) return;
	let t = e.calendar.identifier;
	return t === "gregory" || t === "iso8601" ? e.era === "BC" ? "short" : void 0 : "short";
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/formatter.mjs
function wu(e, t, n) {
	let r = n ?? ps(Mo(t));
	return new ec(e, {
		weekday: "long",
		month: "long",
		year: "numeric",
		day: "numeric",
		era: Cu(r),
		calendar: r.calendar.identifier,
		timeZone: t
	});
}
function Tu(e, t, n) {
	let r = n ?? Mo(t);
	return new ec(e, {
		month: "long",
		year: "numeric",
		era: Cu(r),
		calendar: r.calendar.identifier,
		timeZone: t
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/format.mjs
function Eu(e, t, n, r, i) {
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
function Du(e, t, n, r) {
	if (!e) return "";
	let i = e, a = t ?? e, o = wu(n, r);
	return xo(i, a) ? o.format(i.toDate(r)) : Eu(i, a, o, (e, t) => `${e} \u2013 ${t}`, r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/date-month.mjs
var Ou = [
	"sun",
	"mon",
	"tue",
	"wed",
	"thu",
	"fri",
	"sat"
];
function ku(e) {
	return e == null ? void 0 : Ou[e];
}
function Au(e, t, n) {
	return Wo(e, t, ku(n));
}
function ju(e, t, n, r) {
	let i = t.add({ weeks: e }), a = [], o = Au(i, n, r);
	for (; a.length < 7;) {
		a.push(o);
		let e = o.add({ days: 1 });
		if (xo(o, e)) break;
		o = e;
	}
	return a;
}
function Mu(e, t, n, r) {
	let i = ku(r), a = n ?? Xo(e, t, i);
	return [...Array(a).keys()].map((n) => ju(n, e, t, r));
}
function Nu(e, t) {
	let n = new ec(e, {
		weekday: "long",
		timeZone: t
	}), r = new ec(e, {
		weekday: "short",
		timeZone: t
	}), i = new ec(e, {
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
function Pu(e, t, n, r) {
	let i = Au(e, r, t), a = [...Array(7).keys()], o = Nu(r, n);
	return a.map((e) => o(i.add({ days: e })));
}
function Fu(e, t = "long", n) {
	if (!n || n.calendar.identifier === "gregory" || n.calendar.identifier === "iso8601") {
		let n = new Date(2021, 0, 1), r = [];
		for (let i = 0; i < 12; i++) r.push(n.toLocaleString(e, { month: t })), n.setMonth(n.getMonth() + 1);
		return r;
	}
	let r = n.calendar.getMonthsInYear(n), i = new ec(e, {
		month: t,
		calendar: n.calendar.identifier
	}), a = [];
	for (let e = 1; e <= r; e++) {
		let t = n.set({ month: e });
		a.push(i.format(t.toDate("UTC")));
	}
	return a;
}
function Iu(e, t) {
	let n = Wo(e, t, "mon"), r = n.year, i = Wo(n.set({
		month: 1,
		day: 4
	}), t, "mon"), a = n.calendar.toJulianDay(n), o = i.calendar.toJulianDay(i);
	if (a >= o) return 1 + Math.floor((a - o) / 7);
	let s = Wo(n.set({
		year: r - 1,
		month: 1,
		day: 4
	}), t, "mon"), c = s.calendar.toJulianDay(s);
	return 1 + Math.floor((a - c) / 7);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/date-year.mjs
function Lu(e) {
	let t = [];
	for (let n = e.from; n <= e.to; n += 1) t.push(n);
	return t;
}
var Ru = 1900, zu = 2099;
function Bu(e, t, n) {
	let r = e.calendar;
	return {
		from: t?.year ?? ms(new Xs(Ru, 1, 1), r).year,
		to: n?.year ?? ms(new Xs(zu, 12, 31), r).year
	};
}
var Vu = 10;
function Hu(e) {
	if (e) {
		if (e.length === 3) return e.padEnd(4, "0");
		if (e.length === 2) {
			let t = (/* @__PURE__ */ new Date()).getFullYear(), n = Math.floor(t / 100) * 100 + parseInt(e.slice(-2), 10);
			return n > t + Vu ? (n - 100).toString() : n.toString();
		}
		return e;
	}
}
function Uu(e, t) {
	let n = t?.strict ? 10 : 12, r = e - e % 10, i = [];
	for (let e = 0; e < n; e += 1) {
		let t = r + e;
		i.push(t);
	}
	return i;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/mutation.mjs
function Wu(e, t) {
	let n = Mo(e ?? Ro());
	return t ? ms(n, t) : n;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/pagination.mjs
function Gu(e, t, n, r) {
	return function(i) {
		let { startDate: a, focusedDate: o } = i, s = Su(a, e);
		return vu(o, n, r) ? {
			startDate: a,
			focusedDate: mu(o, n, r),
			endDate: s
		} : o.compare(a) < 0 ? {
			startDate: fu(o, e, t, n, r),
			focusedDate: mu(o, n, r),
			endDate: s
		} : o.compare(s) > 0 ? {
			startDate: du(o, e, t, n, r),
			endDate: s,
			focusedDate: mu(o, n, r)
		} : {
			startDate: a,
			endDate: s,
			focusedDate: mu(o, n, r)
		};
	};
}
function Ku(e, t, n, r, i, a) {
	let o = Gu(n, r, i, a), s = t.add(n);
	return o({
		focusedDate: e.add(n),
		startDate: du(pu(e, s, n, r, i, a), n, r)
	});
}
function qu(e, t, n, r, i, a) {
	let o = Gu(n, r, i, a), s = t.subtract(n);
	return o({
		focusedDate: e.subtract(n),
		startDate: du(pu(e, s, n, r, i, a), n, r)
	});
}
function Ju(e, t, n, r, i, a, o) {
	let s = Gu(r, i, a, o);
	if (!n && !r.days) return s({
		focusedDate: e.add(xu(r)),
		startDate: t
	});
	if (r.days) return Ku(e, t, r, i, a, o);
	if (r.weeks) return s({
		focusedDate: e.add({ months: 1 }),
		startDate: t
	});
	if (r.months || r.years) return s({
		focusedDate: e.add({ years: 1 }),
		startDate: t
	});
}
function Yu(e, t, n, r, i, a, o) {
	let s = Gu(r, i, a, o);
	if (!n && !r.days) return s({
		focusedDate: e.subtract(xu(r)),
		startDate: t
	});
	if (r.days) return qu(e, t, r, i, a, o);
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
var Xu = /* @__PURE__ */ new Map();
function Zu(e) {
	let t = Xu.get(e);
	return t ?? (t = "0123456789" + new Intl.NumberFormat(e, { useGrouping: !1 }).format(1234567890), Xu.set(e, t), t);
}
var Qu = (e, t) => t ? Zu(t).includes(e) : /\d/.test(e), $u = (e, t, n) => !e || e.length !== 1 || Qu(e, n) || t.includes(e), ed = (e, t, n) => e.split("").filter((e) => $u(e, t, n)).join(""), td = /* @__PURE__ */ new Map();
function nd(e) {
	let t = td.get(e);
	if (t != null) return t;
	let n = new Intl.DateTimeFormat(e).formatToParts(/* @__PURE__ */ new Date()).find((e) => e.type === "literal");
	return t = n ? n.value : "/", td.set(e, t), t;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/parse-date.mjs
var rd = (e) => e != null && e.length === 4, id = (e) => e != null && parseFloat(e) <= 12, ad = (e) => e != null && parseFloat(e) <= 31;
function od(e, t, n) {
	let { year: r, month: i, day: a } = cd(sd(t, n), e) ?? {};
	if (r != null || i != null || a != null) {
		let e = /* @__PURE__ */ new Date();
		r ||= e.getFullYear().toString(), i ||= (e.getMonth() + 1).toString(), a ||= e.getDate().toString();
	}
	if (rd(r) || (r = Hu(r)), rd(r) && id(i) && ad(a)) return new Xs(+r, +i, +a);
	let o = Date.parse(e);
	if (!isNaN(o)) {
		let e = new Date(o);
		return new Xs(e.getFullYear(), e.getMonth() + 1, e.getDate());
	}
}
function sd(e, t) {
	return new ec(e, {
		day: "numeric",
		month: "numeric",
		year: "numeric",
		timeZone: t
	}).formatToParts(new Date(2e3, 11, 25)).map(({ type: e, value: t }) => e === "literal" ? `${t}?` : `((?!=<${e}>)\\d+)?`).join("");
}
function cd(e, t) {
	let n = t.match(e);
	return e.toString().match(/<(.+?)>/g)?.map((e) => {
		let t = e.match(/<(.+)>/);
		return !t || t.length <= 0 ? null : e.match(/<(.+)>/)?.[1];
	}).reduce((e, t, r) => (t && (e[t] = n && n.length > r ? n[r + 1] : null), e), {});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/preset.mjs
function ld(e, t, n) {
	let r = fs(jo(n));
	switch (e) {
		case "thisWeek": return [Wo(r, t), Go(r, t)];
		case "thisMonth": return [Bo(r), r];
		case "thisQuarter": return [Bo(r).add({ months: -((r.month - 1) % 3) }), r];
		case "thisYear": return [Ho(r), r];
		case "last3Days": return [r.add({ days: -2 }), r];
		case "last7Days": return [r.add({ days: -6 }), r];
		case "last14Days": return [r.add({ days: -13 }), r];
		case "last30Days": return [r.add({ days: -29 }), r];
		case "last90Days": return [r.add({ days: -89 }), r];
		case "lastMonth": return [Bo(r.add({ months: -1 })), Vo(r.add({ months: -1 }))];
		case "lastQuarter": return [Bo(r.add({ months: -((r.month - 1) % 3) - 3 })), Vo(r.add({ months: -((r.month - 1) % 3) - 1 }))];
		case "lastWeek": return [Wo(r, t).add({ weeks: -1 }), Go(r, t).add({ weeks: -1 })];
		case "lastYear": return [Ho(r.add({ years: -1 })), Uo(r.add({ years: -1 }))];
		default: throw Error(`Invalid date range preset: ${e}`);
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/get-anchor.mjs
function ud(e = 0, t = 0, n = 0, r = 0) {
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
function dd(e) {
	if (!e) return ud();
	let { x: t, y: n, width: r, height: i } = e;
	return ud(t, n, r, i);
}
function fd(e, t) {
	return {
		contextElement: Ue(e) ? e : e?.contextElement,
		getBoundingClientRect: () => {
			let n = e, r = t?.(n);
			return r || !n ? dd(r) : n.getBoundingClientRect();
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/middleware.mjs
var pd = (e) => ({
	variable: e,
	reference: `var(${e})`
}), md = {
	arrowSize: pd("--arrow-size"),
	arrowSizeHalf: pd("--arrow-size-half"),
	arrowBg: pd("--arrow-background"),
	transformOrigin: pd("--transform-origin"),
	arrowOffset: pd("--arrow-offset")
}, hd = (e) => e === "top" || e === "bottom" ? "y" : "x";
function gd(e, t) {
	return {
		name: "transformOrigin",
		fn(n) {
			let { elements: r, middlewareData: i, placement: a, rects: o, y: s } = n, c = a.split("-")[0], l = hd(c), u = i.arrow?.x || 0, d = i.arrow?.y || 0, f = t?.clientWidth || 0, p = t?.clientHeight || 0, m = u + f / 2, h = d + p / 2, g = Math.abs(i.shift?.y || 0), _ = o.reference.height / 2, v = p / 2, y = e.offset?.mainAxis ?? e.gutter, b = typeof y == "number" ? y + v : y ?? v, x = g > b, S = {
				top: `${m}px calc(100% + ${b}px)`,
				bottom: `${m}px ${-b}px`,
				left: `calc(100% + ${b}px) ${h}px`,
				right: `${-b}px ${h}px`
			}[c], C = `${m}px ${o.reference.y + _ - s}px`, w = !!e.overlap && l === "y" && x;
			return r.floating.style.setProperty(md.transformOrigin.variable, w ? C : S), { data: { transformOrigin: w ? C : S } };
		}
	};
}
var _d = {
	name: "rects",
	fn({ rects: e }) {
		return { data: e };
	}
}, vd = (e) => {
	if (e) return {
		name: "shiftArrow",
		fn({ placement: t, middlewareData: n }) {
			if (!n.arrow) return {};
			let { x: r, y: i } = n.arrow, a = t.split("-")[0];
			return Object.assign(e.style, {
				left: r == null ? "" : `${r}px`,
				top: i == null ? "" : `${i}px`,
				[a]: `calc(100% + ${md.arrowOffset.reference})`
			}), {};
		}
	};
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/placement.mjs
function yd(e) {
	let [t, n] = e.split("-");
	return {
		side: t,
		align: n,
		hasAlign: n != null
	};
}
function bd(e) {
	return e.split("-")[0];
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/get-placement.mjs
var xd = {
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
function Sd(e, t) {
	let n = e.devicePixelRatio || 1;
	return Math.round(t * n) / n;
}
function Cd(e, t) {
	return e != null && Math.abs(e - t) < .5;
}
function wd(e) {
	return typeof e == "function" ? e() : e === "clipping-ancestors" ? "clippingAncestors" : e;
}
function Td(e, t, n) {
	let r = e || t.createElement("div");
	return ge({
		element: r,
		padding: n.arrowPadding
	});
}
function Ed(e, t) {
	if (!ii(t.offset ?? t.gutter)) return ve(({ placement: n }) => {
		let r = (e?.clientHeight || 0) / 2, i = t.offset?.mainAxis ?? t.gutter, a = typeof i == "number" ? i + r : i ?? r, { hasAlign: o } = yd(n), s = o ? void 0 : t.shift;
		return ji({
			crossAxis: t.offset?.crossAxis ?? s,
			mainAxis: a,
			alignmentAxis: t.shift
		});
	});
}
function Dd(e) {
	if (e.flip) return _e(() => {
		let t = wd(e.boundary);
		return {
			...t ? { boundary: t } : void 0,
			padding: e.overflowPadding,
			fallbackPlacements: e.flip === !0 ? void 0 : e.flip
		};
	});
}
function Od(e) {
	if (e.slide || e.overlap) return ye(() => {
		let t = wd(e.boundary);
		return {
			...t ? { boundary: t } : void 0,
			mainAxis: e.slide,
			crossAxis: e.overlap,
			padding: e.overflowPadding,
			limiter: Ee()
		};
	});
}
function kd(e) {
	if (e.sizeMiddleware === !1 && !e.sameWidth && !e.fitViewport) return;
	let t, n, r, i;
	return Ce(() => {
		let a = wd(e.boundary);
		return {
			padding: e.overflowPadding,
			...a ? { boundary: a } : void 0,
			apply({ elements: e, rects: a, availableHeight: o, availableWidth: s }) {
				let c = e.floating, l = Math.round(a.reference.width), u = Math.round(a.reference.height);
				s = Math.floor(s), o = Math.floor(o), Cd(t, l) || (c.style.setProperty("--reference-width", `${l}px`), t = l), Cd(n, u) || (c.style.setProperty("--reference-height", `${u}px`), n = u), Cd(r, s) || (c.style.setProperty("--available-width", `${s}px`), r = s), Cd(i, o) || (c.style.setProperty("--available-height", `${o}px`), i = o);
			}
		};
	});
}
function Ad(e) {
	if (e.hideWhenDetached) return be(() => ({
		strategy: "referenceHidden",
		boundary: wd(e.boundary) ?? "clippingAncestors"
	}));
}
function jd(e) {
	return e ? e === !0 ? {
		ancestorResize: !0,
		ancestorScroll: !0,
		elementResize: !0,
		layoutShift: !0
	} : e : {};
}
var Md = [
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
], Nd = [
	"top",
	"right",
	"bottom",
	"left"
];
function Pd(e, t) {
	if (!e) return gi;
	let n = new Map(t.map((t) => [t, e.style.getPropertyValue(t)]));
	return () => {
		n.forEach((t, n) => {
			t ? e.style.setProperty(n, t) : e.style.removeProperty(n);
		}), e.style.length === 0 && e.removeAttribute("style");
	};
}
function Fd(e) {
	return e == null ? null : Ue(e) ? e : typeof e == "object" && e && "contextElement" in e && e.contextElement ? e.contextElement : e;
}
function Id(e, t, n = {}) {
	let r = () => (typeof t == "function" ? t() : t) ?? null, i = () => {
		let t = typeof e == "function" ? e() : e;
		return n.getAnchorElement?.() ?? t;
	}, a = () => {
		let e = i();
		return !e && !n.getAnchorRect ? null : fd(e, n.getAnchorRect);
	}, o = Object.assign({}, xd, n), s = [], c = null, l, u;
	function d(e) {
		l?.(), u?.(), c = e, l = o.restoreStyles ? Pd(e, Md) : void 0;
		let t = e.querySelector("[data-part=arrow]");
		u = o.restoreStyles ? Pd(t, Nd) : void 0, s = [
			Ed(t, o),
			Dd(o),
			Od(o),
			Td(t, e.ownerDocument, o),
			vd(t),
			gd({
				gutter: o.gutter,
				offset: o.offset,
				overlap: o.overlap
			}, t),
			kd(o),
			Ad(o),
			_d
		];
	}
	let { placement: f, strategy: p, onComplete: m, onPositioned: h } = o, g, _, v = !1, y, b, x = gi, S = jd(o.listeners);
	function C() {
		if (!o.listeners) return;
		let e = i(), t = a(), n = r();
		t && n && (Fd(e) !== Fd(y) || n !== b) && (x(), y = e, b = n, x = Se(t, n, T, S));
	}
	async function w() {
		C();
		let e = r();
		if (!e) return;
		e !== c && (d(e), v = !1);
		let t = a();
		if (!t) return;
		let n = await Te(t, e, {
			placement: f,
			middleware: s,
			strategy: p
		}), i = at(e), l = Sd(i, n.x), u = Sd(i, n.y);
		if (m?.({
			...n,
			x: l,
			y: u
		}), o.applyStyles !== !1 && (Cd(g, l) || (e.style.setProperty("--x", `${l}px`), g = l), Cd(_, u) || (e.style.setProperty("--y", `${u}px`), _ = u), o.hideWhenDetached && (n.middlewareData.hide?.referenceHidden ? (e.style.setProperty("visibility", "hidden"), e.style.setProperty("pointer-events", "none")) : (e.style.removeProperty("visibility"), e.style.removeProperty("pointer-events"))), !v)) {
			let t = e.firstElementChild;
			t && (e.style.setProperty("--z-index", ut(t).zIndex), v = !0);
		}
	}
	async function T() {
		n.updatePosition ? (await n.updatePosition({
			updatePosition: w,
			floatingElement: r()
		}), h?.({ placed: !0 })) : await w();
	}
	return T(), () => {
		x(), u?.(), l?.(), h?.({ placed: !1 });
	};
}
function Ld(e, t, n = {}) {
	let { defer: r, ...i } = n, a = r ? q : (e) => e(), o = [];
	return o.push(a(() => {
		o.push(Id(e, t, i));
	})), () => {
		o.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/get-styles.mjs
var Rd = {
	bottom: "rotate(45deg)",
	left: "rotate(135deg)",
	top: "rotate(225deg)",
	right: "rotate(315deg)"
};
function zd(e = {}) {
	let { placement: t, sameWidth: n, fitViewport: r, strategy: i = "absolute" } = e;
	return {
		arrow: {
			position: "absolute",
			width: md.arrowSize.reference,
			height: md.arrowSize.reference,
			[md.arrowSizeHalf.variable]: `calc(${md.arrowSize.reference} / 2)`,
			[md.arrowOffset.variable]: `calc(${md.arrowSizeHalf.reference} * -1)`
		},
		arrowTip: {
			transform: t ? Rd[t.split("-")[0]] : void 0,
			background: md.arrowBg.reference,
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
//#region ../../node_modules/.pnpm/@zag-js+date-picker@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-picker/dist/date-picker.dom.mjs
var Bd = (e, t) => e.ids?.label?.(t) ?? `datepicker:${e.id}:label:${t}`, Vd = (e) => e.ids?.root ?? `datepicker:${e.id}`, Hd = (e, t) => e.ids?.table?.(t) ?? `datepicker:${e.id}:table:${t}`, Ud = (e) => e.ids?.content ?? `datepicker:${e.id}:content`, Wd = (e, t) => e.ids?.cellTrigger?.(t) ?? `datepicker:${e.id}:cell-trigger:${t}`, Gd = (e, t) => e.ids?.prevTrigger?.(t) ?? `datepicker:${e.id}:prev:${t}`, Kd = (e, t) => e.ids?.nextTrigger?.(t) ?? `datepicker:${e.id}:next:${t}`, qd = (e, t) => e.ids?.viewTrigger?.(t) ?? `datepicker:${e.id}:view:${t}`, Jd = (e) => e.ids?.clearTrigger ?? `datepicker:${e.id}:clear`, Yd = (e) => e.ids?.control ?? `datepicker:${e.id}:control`, Xd = (e, t) => e.ids?.input?.(t) ?? `datepicker:${e.id}:input:${t}`, Zd = (e) => e.ids?.trigger ?? `datepicker:${e.id}:trigger`, Qd = (e) => e.ids?.positioner ?? `datepicker:${e.id}:positioner`, $d = (e) => e.ids?.monthSelect ?? `datepicker:${e.id}:month-select`, ef = (e) => e.ids?.yearSelect ?? `datepicker:${e.id}:year-select`, tf = (e, t) => Xn(rf(e), `[data-part=table-cell-trigger][data-view=${t}][data-focus]:not([data-outside-range])`), nf = (e) => e.getById(Zd(e)), rf = (e) => e.getById(Ud(e)), af = (e) => Yn(uf(e), "[data-part=input]"), of = (e) => e.getById(ef(e)), sf = (e) => e.getById($d(e)), cf = (e) => e.getById(Jd(e)), lf = (e) => e.getById(Qd(e)), uf = (e) => e.getById(Yd(e));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-picker@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-picker/dist/date-picker.utils.mjs
function df(e) {
	let [t, n] = e, r;
	return r = !t || !n || t.compare(n) <= 0 ? e : [n, t], r;
}
function ff(e, t) {
	let [n, r] = t;
	return !n || !r ? !1 : n.compare(e) <= 0 && r.compare(e) >= 0;
}
function pf(e) {
	return e.slice().filter((e) => e != null).sort((e, t) => e.compare(t));
}
function mf(e) {
	return yi(e, {
		year: "calendar decade",
		month: "calendar year",
		day: "calendar month"
	});
}
var hf = {
	day: "dd",
	month: "mm",
	year: "yyyy"
};
function gf(e) {
	return new ec(e).formatToParts(/* @__PURE__ */ new Date()).map((e) => hf[e.type] ?? e.value).join("");
}
var _f = (e) => !Number.isNaN(e.day) && !Number.isNaN(e.month) && !Number.isNaN(e.year), vf = {
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
		return yi(e, {
			year: "Switch to previous decade",
			month: "Switch to previous year",
			day: "Switch to previous month"
		});
	},
	nextTrigger(e) {
		return yi(e, {
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
function yf(e, t) {
	return e ? e === "day" ? 0 : e === "month" ? 1 : 2 : t || 0;
}
function bf(e) {
	return e === 0 ? "day" : e === 1 ? "month" : "year";
}
function xf(e, t, n) {
	return bf(Ai(yf(e, 0), yf(t, 0), yf(n, 2)));
}
function Sf(e, t) {
	return yf(e, 0) > yf(t, 0);
}
function Cf(e, t) {
	return yf(e, 0) < yf(t, 0);
}
function wf(e, t, n) {
	return xf(bf(yf(e, 0) + 1), t, n);
}
function Tf(e, t, n) {
	return xf(bf(yf(e, 0) - 1), t, n);
}
var Ef = [
	"day",
	"month",
	"year"
];
function Df(e) {
	Ef.forEach((t) => e(t));
}
var Of = Ji((e) => [
	e.view,
	e.startValue.toString(),
	e.endValue.toString(),
	e.locale,
	e.timeZone,
	e.selectionMode
], ([e], t) => {
	let { startValue: n, endValue: r, locale: i, timeZone: a, selectionMode: o } = t;
	if (e === "year") {
		let e = Uu(n.year, { strict: !0 }), t = e.at(0).toString(), r = e.at(-1).toString();
		return {
			start: t,
			end: r,
			formatted: `${t} - ${r}`
		};
	}
	if (e === "month") {
		let e = new ec(i, {
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
	let s = new ec(i, {
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
function kf(e, t) {
	let { state: n, context: r, prop: i, send: a, computed: o, scope: s } = e, c = r.get("startValue"), l = o("endValue"), u = r.get("value"), d = r.get("focusedValue"), f = r.get("hoveredValue"), p = f ? df([u[0], f]) : [], m = !!i("disabled"), h = !!i("readOnly"), g = !!i("invalid"), _ = o("isInteractive"), v = u.length === 0, y = i("min"), b = i("max"), x = i("locale"), S = i("timeZone"), C = i("startOfWeek"), w = n.matches("focused"), T = n.matches("open"), E = i("selectionMode") === "range", D = i("selectionMode") === "multiple", O = i("isDateUnavailable"), k = i("maxSelectedDates"), A = D && k != null && u.length >= k, j = r.get("currentPlacement"), M = j ? bd(j) : void 0, N = zd({
		...i("positioning"),
		placement: j
	}), P = nd(x), F = Mi(vf, i("translations"));
	function ee(e = c) {
		let t = i("fixedWeeks") ? 6 : void 0;
		return Mu(e, x, t, C);
	}
	function te(e = {}) {
		let { format: t } = e;
		return Fu(x, t, d).map((e, t) => {
			let n = t + 1;
			return {
				label: e,
				value: n,
				disabled: vu(d.set({ month: n }), y, b)
			};
		});
	}
	function ne() {
		return Lu(Bu(d, y, b)).map((e) => ({
			label: e.toString(),
			value: e,
			disabled: !ki(e, y?.year, b?.year)
		}));
	}
	function I(e) {
		return _u(e, O, x, y, b);
	}
	function L(e) {
		let t = c ?? Wu(S, d.calendar);
		a({
			type: "FOCUS.SET",
			value: t.set({ month: e })
		});
	}
	function R(e) {
		let t = c ?? Wu(S, d.calendar);
		a({
			type: "FOCUS.SET",
			value: t.set({ year: e })
		});
	}
	function z(e) {
		let { value: t, disabled: n } = e, r = d.set({ year: t }), i = !Uu(c.year, { strict: !0 }).includes(t), a = ki(t, y?.year, b?.year), o = E && ff(r, u), s = E && u[0] && Eo(r, u[0]), l = E && u[1] && Eo(r, u[1]), f = E && p.length > 0, m = f && ff(r, p), h = f && p[0] && Eo(r, p[0]), g = f && p[1] && Eo(r, p[1]), _ = {
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
	function re(e) {
		let { value: t, disabled: n } = e, r = d.set({ month: t }), i = Tu(x, S, d), a = E && ff(r, u), o = E && u[0] && To(r, u[0]), s = E && u[1] && To(r, u[1]), c = E && p.length > 0, l = c && ff(r, p), f = c && p[0] && To(r, p[0]), m = c && p[1] && To(r, p[1]), h = {
			focused: d.month === e.value,
			selectable: !vu(r, y, b),
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
	function ie(e) {
		let { value: t, disabled: n, visibleRange: r = o("visibleRange") } = e, a = wu(x, S, d), s = xu(o("visibleDuration")), c = i("outsideDaySelectable"), l = r.start.add(s).subtract({ days: 1 }), f = vu(t, r.start, l), m = E && ff(t, u), h = E && u[0] && xo(t, u[0]), g = E && u[1] && xo(t, u[1]), _ = E && p.length > 0, v = _ && ff(t, p), C = _ && p[0] && xo(t, p[0]), w = _ && p[1] && xo(t, p[1]), T = u.some((e) => e != null && xo(t, e)), D = {
			invalid: vu(t, y, b),
			disabled: n || !c && f || vu(t, y, b) || A && !T,
			selected: T,
			unavailable: _u(t, O, x, y, b) && !n,
			outsideRange: f,
			today: Oo(t, S),
			weekend: es(t, x),
			value: t,
			valueText: a.format(t.toDate(S)),
			get focused() {
				return d != null && xo(t, d) && (!D.outsideRange || c);
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
		isMaxSelected: A,
		view: r.get("view"),
		getRangePresetValue(e) {
			return ld(e, x, S);
		},
		getWeekNumber(e) {
			let t = e[0];
			return t ? Iu(t, x) : 0;
		},
		getDaysInWeek(e, t = c) {
			return ju(e, t, x, C);
		},
		getOffset(e) {
			let t = c.add(e), n = l.add(e), r = Tu(x, S, d);
			return {
				visibleRange: {
					start: t,
					end: n
				},
				weeks: ee(t),
				visibleRangeText: {
					start: r.format(t.toDate(S)),
					end: r.format(n.toDate(S))
				}
			};
		},
		getMonthWeeks: ee,
		isUnavailable: I,
		weeks: ee(),
		weekDays: Pu(c, C, S, x),
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
			let e = mu(Wu(S, d.calendar), y, b);
			a({
				type: "VALUE.SET",
				value: [e]
			});
		},
		setValue(e) {
			let t = e.map((e) => mu(e, y, b));
			a({
				type: "VALUE.SET",
				value: t
			});
		},
		setTime(e, t = 0) {
			let n = Array.from(u), r = n[t];
			r && ("hour" in r || (r = ps(r)), r = r.set({
				hour: e.hour ?? ("hour" in r ? r.hour : 0),
				minute: e.minute ?? ("minute" in r ? r.minute : 0),
				second: e.second ?? ("second" in r ? r.second : 0),
				millisecond: e.millisecond ?? ("millisecond" in r ? r.millisecond : 0)
			}), n[t] = mu(r, y, b), a({
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
		focusMonth: L,
		focusYear: R,
		getYears: ne,
		getMonths: te,
		getYearsGrid(e = {}) {
			let { columns: t = 1 } = e;
			return Jr(Uu(c.year, { strict: !0 }).map((e) => ({
				label: e.toString(),
				value: e,
				disabled: !ki(e, y?.year, b?.year)
			})), t);
		},
		getDecade() {
			let e = Uu(c.year, { strict: !0 });
			return {
				start: e.at(0),
				end: e.at(-1)
			};
		},
		getMonthsGrid(e = {}) {
			let { columns: t = 1, format: n } = e;
			return Jr(te({ format: n }), t);
		},
		format(e, t = {
			month: "long",
			year: "numeric"
		}) {
			return new ec(x, {
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
				...Z.root.attrs,
				dir: i("dir"),
				id: Vd(s),
				"data-state": T ? "open" : "closed",
				"data-disabled": K(m),
				"data-readonly": K(h),
				"data-empty": K(v)
			});
		},
		getLabelProps(e = {}) {
			let { index: n = 0 } = e;
			return t.label({
				...Z.label.attrs,
				id: Bd(s, n),
				dir: i("dir"),
				htmlFor: Xd(s, n),
				"data-state": T ? "open" : "closed",
				"data-index": n,
				"data-disabled": K(m),
				"data-readonly": K(h)
			});
		},
		getControlProps() {
			return t.element({
				...Z.control.attrs,
				dir: i("dir"),
				id: Yd(s),
				"data-disabled": K(m),
				"data-placeholder-shown": K(v)
			});
		},
		getRangeTextProps() {
			return t.element({
				...Z.rangeText.attrs,
				dir: i("dir")
			});
		},
		getContentProps() {
			return t.element({
				...Z.content.attrs,
				hidden: !T,
				dir: i("dir"),
				"data-state": T ? "open" : "closed",
				"data-placement": j,
				"data-side": M,
				"data-inline": K(i("inline")),
				id: Ud(s),
				tabIndex: -1,
				role: "application",
				"aria-roledescription": "datepicker",
				"aria-label": F.content
			});
		},
		getTableProps(e = {}) {
			let { view: n = "day", columns: r = n === "day" ? 7 : 4 } = e, o = B(e);
			return t.element({
				...Z.table.attrs,
				role: "grid",
				"data-columns": r,
				"aria-roledescription": mf(n),
				id: Hd(s, o),
				"aria-readonly": Fe(h),
				"aria-disabled": Fe(m),
				"aria-multiselectable": Fe(i("selectionMode") !== "single"),
				"data-view": n,
				dir: i("dir"),
				tabIndex: -1,
				onKeyDown(e) {
					if (e.defaultPrevented || m) return;
					let t = {
						Enter() {
							_ && (n === "day" && I(d) || (n !== "month" || re({ value: d.month }).selectable) && (n !== "year" || z({ value: d.year }).selectable) && a({
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
					}[nn(e, { dir: i("dir") })];
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
				...Z.tableHead.attrs,
				"aria-hidden": !0,
				dir: i("dir"),
				"data-view": n,
				"data-disabled": K(m)
			});
		},
		getTableHeaderProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...Z.tableHeader.attrs,
				dir: i("dir"),
				"data-view": n,
				"data-disabled": K(m)
			});
		},
		getTableBodyProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...Z.tableBody.attrs,
				"data-view": n,
				"data-disabled": K(m)
			});
		},
		getTableRowProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...Z.tableRow.attrs,
				"aria-disabled": Fe(m),
				"data-disabled": K(m),
				"data-view": n
			});
		},
		getWeekNumberHeaderCellProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...Z.tableCell.attrs,
				scope: "col",
				"aria-label": F.weekColumnHeader,
				"data-view": n,
				"data-type": "week-number",
				"data-disabled": K(m)
			});
		},
		getWeekNumberCellProps(e) {
			let { weekIndex: n, week: r } = e, i = r[0] ? Iu(r[0], x) : 0;
			return t.element({
				...Z.tableCell.attrs,
				role: "rowheader",
				"aria-label": F.weekNumberCell?.(i),
				"data-view": "day",
				"data-week-index": n,
				"data-type": "week-number",
				"data-disabled": K(m)
			});
		},
		getDayTableCellState: ie,
		getDayTableCellProps(e) {
			let { value: n } = e, r = ie(e);
			return t.element({
				...Z.tableCell.attrs,
				role: "gridcell",
				"aria-disabled": Fe(!r.selectable),
				"aria-selected": r.selected || r.inRange,
				"aria-invalid": Fe(r.invalid),
				"aria-current": r.today ? "date" : void 0,
				"data-value": n.toString()
			});
		},
		getDayTableCellTriggerProps(e) {
			let { value: n } = e, r = ie(e);
			return t.element({
				...Z.tableCellTrigger.attrs,
				id: Wd(s, n.toString()),
				role: "button",
				dir: i("dir"),
				tabIndex: m ? -1 : r.focused ? 0 : -1,
				"aria-label": F.dayCell(r),
				"aria-disabled": Fe(!r.selectable),
				"aria-invalid": Fe(r.invalid),
				"data-disabled": K(!r.selectable),
				"data-selectable": K(r.selectable),
				"data-selected": K(r.selected),
				"data-value": n.toString(),
				"data-view": "day",
				"data-today": K(r.today),
				"data-focus": K(r.focused),
				"data-unavailable": K(r.unavailable),
				"data-range-start": K(r.firstInRange),
				"data-range-end": K(r.lastInRange),
				"data-in-range": K(r.inRange),
				"data-outside-range": K(r.outsideRange),
				"data-weekend": K(r.weekend),
				"data-in-hover-range": K(r.inHoveredRange),
				"data-hover-range-start": K(r.firstInHoveredRange),
				"data-hover-range-end": K(r.lastInHoveredRange),
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
					f && wo(n, f) || a({
						type: "CELL.POINTER_MOVE",
						cell: "day",
						value: n,
						focus: t,
						outsideRange: r.outsideRange
					});
				} : void 0
			});
		},
		getMonthTableCellState: re,
		getMonthTableCellProps(e) {
			let { value: n, columns: r } = e, a = re(e);
			return t.element({
				...Z.tableCell.attrs,
				dir: i("dir"),
				colSpan: r,
				role: "gridcell",
				"aria-selected": Fe(a.selected || a.inRange),
				"data-selected": K(a.selected),
				"aria-disabled": Fe(!a.selectable),
				"data-value": n
			});
		},
		getMonthTableCellTriggerProps(e) {
			let { value: n } = e, r = re(e);
			return t.element({
				...Z.tableCellTrigger.attrs,
				id: Wd(s, n.toString()),
				role: "button",
				dir: i("dir"),
				tabIndex: m ? -1 : r.focused ? 0 : -1,
				"aria-label": r.valueText,
				"aria-disabled": Fe(!r.selectable),
				"data-disabled": K(!r.selectable),
				"data-selectable": K(r.selectable),
				"data-selected": K(r.selected),
				"data-value": n,
				"data-view": "month",
				"data-focus": K(r.focused),
				"data-outside-range": K(r.outsideRange),
				"data-range-start": K(r.firstInRange),
				"data-range-end": K(r.lastInRange),
				"data-in-range": K(r.inRange),
				"data-in-hover-range": K(r.inHoveredRange),
				"data-hover-range-start": K(r.firstInHoveredRange),
				"data-hover-range-end": K(r.lastInHoveredRange),
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
					f && r.value && To(r.value, f) || a({
						type: "CELL.POINTER_MOVE",
						cell: "month",
						value: r.value,
						focus: t
					});
				} : void 0
			});
		},
		getYearTableCellState: z,
		getYearTableCellProps(e) {
			let { value: n, columns: r } = e, a = z(e);
			return t.element({
				...Z.tableCell.attrs,
				dir: i("dir"),
				colSpan: r,
				role: "gridcell",
				"aria-selected": Fe(a.selected || a.inRange),
				"data-selected": K(a.selected),
				"aria-disabled": Fe(!a.selectable),
				"data-value": n
			});
		},
		getYearTableCellTriggerProps(e) {
			let { value: n } = e, r = z(e);
			return t.element({
				...Z.tableCellTrigger.attrs,
				id: Wd(s, n.toString()),
				role: "button",
				dir: i("dir"),
				tabIndex: m ? -1 : r.focused ? 0 : -1,
				"aria-label": r.valueText,
				"aria-disabled": Fe(!r.selectable),
				"data-disabled": K(!r.selectable),
				"data-selectable": K(r.selectable),
				"data-selected": K(r.selected),
				"data-value": n,
				"data-view": "year",
				"data-focus": K(r.focused),
				"data-outside-range": K(r.outsideRange),
				"data-range-start": K(r.firstInRange),
				"data-range-end": K(r.lastInRange),
				"data-in-range": K(r.inRange),
				"data-in-hover-range": K(r.inHoveredRange),
				"data-hover-range-start": K(r.firstInHoveredRange),
				"data-hover-range-end": K(r.lastInHoveredRange),
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
					f && r.value && Eo(r.value, f) || a({
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
				...Z.nextTrigger.attrs,
				dir: i("dir"),
				id: Kd(s, n),
				type: "button",
				"aria-label": F.nextTrigger(n),
				disabled: r,
				"data-disabled": K(r),
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
				...Z.prevTrigger.attrs,
				dir: i("dir"),
				id: Gd(s, n),
				type: "button",
				"aria-label": F.prevTrigger(n),
				disabled: r,
				"data-disabled": K(r),
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
				...Z.clearTrigger.attrs,
				id: Jd(s),
				dir: i("dir"),
				type: "button",
				"aria-label": F.clearTrigger,
				hidden: !u.length,
				onClick(e) {
					e.defaultPrevented || _ && a({ type: "VALUE.CLEAR" });
				}
			});
		},
		getTriggerProps() {
			return t.button({
				...Z.trigger.attrs,
				id: Zd(s),
				dir: i("dir"),
				type: "button",
				"data-placement": j,
				"data-side": M,
				"aria-label": F.trigger(T),
				"aria-controls": Ud(s),
				"aria-expanded": T,
				"data-state": T ? "open" : "closed",
				"data-placeholder-shown": K(v),
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
				...Z.view.attrs,
				"data-view": n,
				hidden: r.get("view") !== n
			});
		},
		getViewTriggerProps(e = {}) {
			let { view: n = "day" } = e, r = wf(n, i("minView"), i("maxView")), o = r !== n, c = m || !o;
			return t.button({
				...Z.viewTrigger.attrs,
				"data-view": n,
				dir: i("dir"),
				id: qd(s, n),
				type: "button",
				disabled: c,
				"data-disabled": K(c),
				"aria-label": F.viewTrigger(n, o ? r : void 0),
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
				...Z.viewControl.attrs,
				"data-view": n,
				dir: i("dir")
			});
		},
		getInputProps(e = {}) {
			let { index: n = 0, fixOnBlur: r = !0 } = e;
			return t.input({
				...Z.input.attrs,
				id: Xd(s, n),
				autoComplete: "off",
				autoCorrect: "off",
				spellCheck: "false",
				dir: i("dir"),
				name: i("name"),
				"data-index": n,
				"data-state": T ? "open" : "closed",
				"data-placeholder-shown": K(v),
				readOnly: h,
				disabled: m,
				required: i("required"),
				"aria-invalid": Fe(g),
				"data-invalid": K(g),
				placeholder: i("placeholder") || gf(x),
				defaultValue: o("valueAsString")[n],
				onBeforeInput(e) {
					let { data: t } = rn(e);
					$u(t, P, x) || e.preventDefault();
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
						Kt(e) || I(d) || e.currentTarget.value.trim() !== "" && a({
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
						value: ed(t, P, x),
						index: n
					});
				}
			});
		},
		getMonthSelectProps() {
			return t.select({
				...Z.monthSelect.attrs,
				id: $d(s),
				"aria-label": F.monthSelect,
				disabled: m,
				dir: i("dir"),
				defaultValue: c.month,
				onChange(e) {
					L(Number(e.currentTarget.value));
				}
			});
		},
		getYearSelectProps() {
			return t.select({
				...Z.yearSelect.attrs,
				id: ef(s),
				disabled: m,
				"aria-label": F.yearSelect,
				dir: i("dir"),
				defaultValue: c.year,
				onChange(e) {
					R(Number(e.currentTarget.value));
				}
			});
		},
		getPositionerProps() {
			return t.element({
				id: Qd(s),
				...Z.positioner.attrs,
				dir: i("dir"),
				style: N.floating
			});
		},
		getPresetTriggerProps(e) {
			let n = Array.isArray(e.value) ? e.value : ld(e.value, x, S), r = n.filter((e) => e != null).map((e) => e.toDate(S).toDateString());
			return t.button({
				...Z.presetTrigger.attrs,
				"aria-label": F.presetTrigger(r),
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
//#region ../../node_modules/.pnpm/@zag-js+live-region@1.43.3/node_modules/@zag-js/live-region/dist/index.mjs
var Af = "__live-region__", jf = "__live-region-debug__", Mf = "position:fixed;inset-inline:0;bottom:0;z-index:2147483647;padding:12px 16px;background:black;color:white;font-size:14px;line-height:20px;text-align:center;pointer-events:none;";
function Nf(e = {}) {
	let { level: t = "polite", document: n = document, root: r, delay: i = 0, debug: a = !1 } = e, o = n.defaultView ?? window, s = r ?? n.body;
	function c() {
		if (!a) return;
		let e = n.getElementById(jf);
		return e || (e = n.createElement("div"), e.id = jf, e.dataset.liveAnnouncerDebug = "true", e.setAttribute("aria-hidden", "true"), e.style.cssText = Mf, s.appendChild(e), e);
	}
	function l(e, r) {
		n.getElementById(Af)?.remove(), r ??= i;
		let a = n.createElement("span");
		a.id = Af, a.dataset.liveAnnouncer = "true";
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
		n.getElementById(Af)?.remove(), n.getElementById(jf)?.remove();
	}
	return {
		announce: l,
		destroy: u,
		toJSON() {
			return Af;
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-picker@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-picker/dist/date-picker.machine.mjs
var { and: Pf } = _a();
function Ff(e, t) {
	if (e?.length !== t?.length) return !1;
	let n = Math.max(e.length, t.length);
	for (let r = 0; r < n; r++) if (!gu(e[r], t[r])) return !1;
	return !0;
}
function If(e, t) {
	return e.map((e) => e == null ? "" : t("format")(e, {
		locale: t("locale"),
		timeZone: t("timeZone")
	}));
}
var Lf = va({
	props({ props: e }) {
		let t = e.locale || "en-US", n = e.timeZone || "UTC", r = e.selectionMode || "single", i = e.numOfMonths || 1, a;
		if (e.createCalendar) {
			let n = new Intl.DateTimeFormat(t).resolvedOptions().calendar;
			n !== "gregory" && n !== "iso8601" && (a = e.createCalendar(n));
		}
		let o = (e) => !a || e.calendar.identifier === a.identifier ? e : ms(e, a), s = e.defaultValue ? pf(e.defaultValue).map((t) => mu(o(t), e.min, e.max)) : void 0, c = e.value ? pf(e.value).map((t) => mu(o(t), e.min, e.max)) : void 0, l = e.focusedValue || e.defaultFocusedValue || c?.[0] || s?.[0] || Wu(n, a);
		l = mu(o(l), e.min, e.max);
		let u = e.minView || "day", d = e.maxView || "year", f = xf(e.defaultView || e.view || u, u, d);
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
				return new ec(t, {
					timeZone: n,
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
					calendar: a?.identifier
				}).format(e.toDate(n));
			},
			parse(e, { locale: t, timeZone: n }) {
				return od(e, t, n);
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
				isEqual: gu,
				hash: (e) => e.toString(),
				sync: !0,
				onChange(t) {
					let r = n(), i = r.get("view"), a = r.get("value"), o = If(a, e);
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
				isEqual: Ff,
				hash: (e) => e.map((e) => e?.toString() ?? "").join(","),
				onChange(t) {
					let r = n(), i = If(t, e);
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
				isEqual: gu
			})),
			view: t(() => ({
				defaultValue: e("defaultView"),
				value: e("view"),
				onChange(t) {
					e("onViewChange")?.({ view: t });
				}
			})),
			startValue: t(() => ({
				defaultValue: hu(e("focusedValue") || e("defaultFocusedValue"), "start", { months: e("numOfMonths") }, e("locale")),
				isEqual: gu,
				hash: (e) => e.toString()
			})),
			currentPlacement: t(() => ({ defaultValue: void 0 })),
			restoreFocus: t(() => ({ defaultValue: !1 }))
		};
	},
	computed: {
		isInteractive: ({ prop: e }) => !e("disabled") && !e("readOnly"),
		visibleDuration: ({ prop: e }) => ({ months: e("numOfMonths") }),
		endValue: ({ context: e, computed: t }) => Su(e.get("startValue"), t("visibleDuration")),
		visibleRange: ({ context: e, computed: t }) => ({
			start: e.get("startValue"),
			end: t("endValue")
		}),
		visibleRangeText: ({ context: e, prop: t, computed: n }) => Of({
			view: e.get("view"),
			startValue: e.get("startValue"),
			endValue: n("endValue"),
			locale: t("locale"),
			timeZone: t("timeZone"),
			selectionMode: t("selectionMode")
		}),
		isPrevVisibleRangeValid: ({ context: e, prop: t }) => !yu(e.get("startValue"), t("min"), t("max")),
		isNextVisibleRangeValid: ({ prop: e, computed: t }) => !bu(t("endValue"), e("min"), e("max")),
		valueAsString: ({ context: e, prop: t }) => If(e.get("value"), t)
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
						guard: Pf("shouldRestoreFocus", "isInteractOutsideEvent"),
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
						guard: Pf("isRangePicker", "hasSelectedRange"),
						actions: [
							"setActiveIndexToStart",
							"resetSelection",
							"setActiveIndexToEnd"
						]
					},
					{
						guard: Pf("isRangePicker", "isSelectingEndDate", "closeOnSelect", "isOpenControlled"),
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
						guard: Pf("isRangePicker", "isSelectingEndDate", "closeOnSelect"),
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
						guard: Pf("isRangePicker", "isSelectingEndDate"),
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
						guard: Pf("isMultiPicker", "canSelectDate"),
						actions: ["setFocusedDate", "toggleSelectedDate"]
					},
					{
						guard: "isMultiPicker",
						actions: ["setFocusedDate"]
					},
					{
						guard: Pf("closeOnSelect", "isOpenControlled"),
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
					guard: Pf("isRangePicker", "isSelectingEndDate", "isDayPointerMoveOutsideVisibleMonth"),
					actions: ["setHoveredDate"]
				}, {
					guard: Pf("isRangePicker", "isSelectingEndDate"),
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
						guard: Pf("isRangePicker", "hasSelectedRange"),
						actions: [
							"setActiveIndexToStart",
							"resetSelection",
							"setActiveIndexToEnd",
							"focusNextDay"
						]
					},
					{
						guard: Pf("isRangePicker", "isSelectingEndDate", "closeOnSelect", "isOpenControlled"),
						actions: [
							"setSelectedDate",
							"setActiveIndexToStart",
							"clearHoveredDate",
							"invokeOnClose"
						]
					},
					{
						guard: Pf("isRangePicker", "isSelectingEndDate", "closeOnSelect"),
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
						guard: Pf("isRangePicker", "isSelectingEndDate"),
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
						guard: Pf("isMultiPicker", "canSelectDate"),
						actions: ["toggleSelectedDate"]
					},
					{ guard: "isMultiPicker" },
					{
						guard: Pf("closeOnSelect", "isOpenControlled"),
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
			isAboveMinView: ({ context: e, prop: t }) => Sf(e.get("view"), t("minView")),
			isDayView: ({ context: e, event: t }) => (t.view || e.get("view")) === "day",
			isMonthView: ({ context: e, event: t }) => (t.view || e.get("view")) === "month",
			isYearView: ({ context: e, event: t }) => (t.view || e.get("view")) === "year",
			isRangePicker: ({ prop: e }) => e("selectionMode") === "range",
			hasSelectedRange: ({ context: e }) => e.get("value").length === 2,
			isMultiPicker: ({ prop: e }) => e("selectionMode") === "multiple",
			canSelectDate: (e) => {
				let { context: t, prop: n, event: r } = e, i = n("maxSelectedDates");
				if (i == null) return !0;
				let a = t.get("value"), o = Rf(e, r.value ?? t.get("focusedValue"));
				return a.some((e) => gu(e, o)) ? !0 : a.length < i;
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
				return t("inline") ? void 0 : (e.get("currentPlacement") || e.set("currentPlacement", t("positioning").placement), Ld(uf(n), () => lf(n), {
					...t("positioning"),
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				}));
			},
			setupLiveRegion({ scope: e, refs: t }) {
				let n = e.getDoc();
				return t.set("announcer", Nf({
					level: "assertive",
					document: n
				})), () => t.get("announcer")?.destroy?.();
			},
			trackDismissableElement({ scope: e, send: t, context: n, prop: r }) {
				return r("inline") ? void 0 : gl(() => rf(e), {
					type: "popover",
					defer: !0,
					layerStyleTargets: [() => lf(e)],
					exclude: [
						...af(e),
						nf(e),
						cf(e)
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
				let n = wf(e.get("view"), t("minView"), t("maxView"));
				e.set("view", n);
			},
			setPreviousView({ context: e, prop: t }) {
				let n = Tf(e.get("view"), t("minView"), t("maxView"));
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
					o = e && t ? Du(e, t, i, a) : e ? Du(e, null, i, a) : t ? Du(t, null, i, a) : "";
				} else o = r.map((e) => Du(e, null, i, a)).filter(Boolean).join(",");
				n.get("announcer")?.announce(o, 3e3);
			},
			announceVisibleRange({ computed: e, refs: t }) {
				let { formatted: n } = e("visibleRangeText");
				t.get("announcer")?.announce(n);
			},
			disableTextSelection({ scope: e }) {
				Wn({
					target: rf(e),
					doc: e.getDoc()
				});
			},
			enableTextSelection({ scope: e }) {
				Un({
					doc: e.getDoc(),
					target: rf(e)
				});
			},
			focusFirstSelectedDate(e) {
				let { context: t } = e;
				t.get("value").length && Q(e, t.get("value")[0]);
			},
			syncInputElement({ scope: e, computed: t }) {
				q(() => {
					af(e).forEach((e, n) => {
						ln(e, t("valueAsString")[n] || "");
					});
				});
			},
			setFocusedDate(e) {
				let { event: t } = e;
				Q(e, Array.isArray(t.value) ? t.value[0] : t.value);
			},
			setFocusedValueForView(e) {
				let { context: t, event: n } = e;
				Q(e, t.get("focusedValue").set({ [t.get("view")]: n.value }));
			},
			focusNextMonth(e) {
				let { context: t } = e;
				Q(e, t.get("focusedValue").add({ months: 1 }));
			},
			focusPreviousMonth(e) {
				let { context: t } = e;
				Q(e, t.get("focusedValue").subtract({ months: 1 }));
			},
			setDateValue({ context: e, event: t, prop: n }) {
				if (!Array.isArray(t.value)) return;
				let r = t.value.map((e) => mu(e, n("min"), n("max")));
				e.set("value", r);
			},
			clearDateValue({ context: e }) {
				e.set("value", []);
			},
			setSelectedDate(e) {
				let { context: t, event: n } = e, r = Array.from(t.get("value")), i = t.get("activeIndex"), a = r[i];
				r[i] = zf(a, Rf(e, n.value ?? t.get("focusedValue"))), t.set("value", df(r));
			},
			resetSelection(e) {
				let { context: t, event: n } = e, r = t.get("value")[0], i = Rf(e, n.value ?? t.get("focusedValue"));
				t.set("value", [zf(r, i)]);
			},
			toggleSelectedDate(e) {
				let { context: t, event: n } = e, r = Rf(e, n.value ?? t.get("focusedValue")), i = t.get("value"), a = i.findIndex((e) => gu(e, r));
				if (a === -1) {
					let e = [...i, r];
					t.set("value", pf(e));
				} else {
					let e = Array.from(i);
					e.splice(a, 1), t.set("value", pf(e));
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
				n[r] = zf(i, e.get("focusedValue").copy()), e.set("value", df(n));
				let a = t("valueAsString");
				e.set("inputValue", a[r]);
			},
			focusPreviousDay(e) {
				let { context: t } = e;
				Q(e, t.get("focusedValue").subtract({ days: 1 }));
			},
			focusNextDay(e) {
				let { context: t } = e;
				Q(e, t.get("focusedValue").add({ days: 1 }));
			},
			focusPreviousWeek(e) {
				let { context: t } = e;
				Q(e, t.get("focusedValue").subtract({ weeks: 1 }));
			},
			focusNextWeek(e) {
				let { context: t } = e;
				Q(e, t.get("focusedValue").add({ weeks: 1 }));
			},
			focusNextPage(e) {
				let { context: t, computed: n, prop: r } = e;
				Bf(e, Ku(t.get("focusedValue"), t.get("startValue"), n("visibleDuration"), r("locale"), r("min"), r("max")));
			},
			focusPreviousPage(e) {
				let { context: t, computed: n, prop: r } = e;
				Bf(e, qu(t.get("focusedValue"), t.get("startValue"), n("visibleDuration"), r("locale"), r("min"), r("max")));
			},
			focusSectionStart(e) {
				let { context: t } = e;
				Q(e, t.get("startValue").copy());
			},
			focusSectionEnd(e) {
				let { computed: t } = e;
				Q(e, t("endValue").copy());
			},
			focusNextSection(e) {
				let { context: t, event: n, computed: r, prop: i } = e, a = Ju(t.get("focusedValue"), t.get("startValue"), n.larger, r("visibleDuration"), i("locale"), i("min"), i("max"));
				a && Bf(e, a);
			},
			focusPreviousSection(e) {
				let { context: t, event: n, computed: r, prop: i } = e, a = Yu(t.get("focusedValue"), t.get("startValue"), n.larger, r("visibleDuration"), i("locale"), i("min"), i("max"));
				a && Bf(e, a);
			},
			focusNextYear(e) {
				let { context: t } = e;
				Q(e, t.get("focusedValue").add({ years: 1 }));
			},
			focusPreviousYear(e) {
				let { context: t } = e;
				Q(e, t.get("focusedValue").subtract({ years: 1 }));
			},
			focusNextDecade(e) {
				let { context: t } = e;
				Q(e, t.get("focusedValue").add({ years: 10 }));
			},
			focusPreviousDecade(e) {
				let { context: t } = e;
				Q(e, t.get("focusedValue").subtract({ years: 10 }));
			},
			clearFocusedDate(e) {
				let { context: t, prop: n } = e, r = t.get("focusedValue").calendar;
				Q(e, Wu(n("timeZone"), r));
			},
			focusPreviousMonthColumn(e) {
				let { context: t, event: n } = e;
				Q(e, t.get("focusedValue").subtract({ months: n.columns }));
			},
			focusNextMonthColumn(e) {
				let { context: t, event: n } = e;
				Q(e, t.get("focusedValue").add({ months: n.columns }));
			},
			focusPreviousYearColumn(e) {
				let { context: t, event: n } = e;
				Q(e, t.get("focusedValue").subtract({ years: n.columns }));
			},
			focusNextYearColumn(e) {
				let { context: t, event: n } = e;
				Q(e, t.get("focusedValue").add({ years: n.columns }));
			},
			focusFirstMonth(e) {
				let { context: t } = e, n = t.get("focusedValue"), r = n.calendar.getMinimumMonthInYear?.(n) ?? 1;
				Q(e, n.set({ month: r }));
			},
			focusLastMonth(e) {
				let { context: t } = e, n = t.get("focusedValue"), r = n.calendar.getMonthsInYear(n);
				Q(e, n.set({ month: r }));
			},
			focusFirstYear(e) {
				let { context: t } = e, n = Uu(t.get("focusedValue").year);
				Q(e, t.get("focusedValue").set({ year: n[0] }));
			},
			focusLastYear(e) {
				let { context: t } = e, n = Uu(t.get("focusedValue").year);
				Q(e, t.get("focusedValue").set({ year: n[n.length - 1] }));
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
				n.src !== "input.click" && q(() => {
					tf(e, t.get("view"))?.focus({ preventScroll: !0 });
				});
			},
			focusActiveCellIfNeeded({ scope: e, context: t, event: n }) {
				n.focus && q(() => {
					tf(e, t.get("view"))?.focus({ preventScroll: !0 });
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
				q(() => {
					nf(e)?.focus({ preventScroll: !0 });
				});
			},
			focusFirstInputElement({ scope: e, event: t }) {
				t.focus !== !1 && q(() => {
					let [t] = af(e);
					(t ?? nf(e))?.focus({ preventScroll: !0 });
				});
			},
			focusInputElement({ scope: e }) {
				q(() => {
					let t = af(e);
					if (t.length === 0) {
						nf(e)?.focus({ preventScroll: !0 });
						return;
					}
					let n = t.findLastIndex((e) => e.value !== ""), r = t[Math.max(n, 0)];
					r?.focus({ preventScroll: !0 }), r?.setSelectionRange(r.value.length, r.value.length);
				});
			},
			syncMonthSelectElement({ scope: e, context: t }) {
				ln(sf(e), t.get("startValue").month.toString());
			},
			syncYearSelectElement({ scope: e, context: t }) {
				ln(of(e), t.get("startValue").year.toString());
			},
			setInputValue({ context: e, event: t }) {
				e.get("activeIndex") === t.index && e.set("inputValue", t.value);
			},
			syncInputValue({ scope: e, context: t, event: n }) {
				queueMicrotask(() => {
					ln(af(e)[n.index ?? t.get("activeIndex")], t.get("inputValue"));
				});
			},
			focusParsedDate(e) {
				let { event: t, prop: n } = e;
				if (t.index == null) return;
				let r = n("parse")(t.value, {
					locale: n("locale"),
					timeZone: n("timeZone")
				});
				r && _f(r) && Q(e, r);
			},
			selectParsedDate({ context: e, event: t, prop: n }) {
				if (t.index == null) return;
				let r = n("parse")(t.value, {
					locale: n("locale"),
					timeZone: n("timeZone")
				});
				if ((!r || !_f(r)) && t.value && (r = e.get("focusedValue").copy()), !r) return;
				r = mu(r, n("min"), n("max"));
				let i = Array.from(e.get("value"));
				i[t.index] = zf(i[t.index], r);
				let a = df(i);
				e.set("value", a);
				let o = If(a, n);
				e.set("inputValue", o[t.index]);
			},
			resetView({ context: e }) {
				e.set("view", e.initial("view"));
			},
			setStartValue({ context: e, computed: t, prop: n }) {
				let r = e.get("focusedValue");
				if (!vu(r, e.get("startValue"), t("endValue"))) return;
				let i = hu(r, "start", { months: n("numOfMonths") }, n("locale"));
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
}), Rf = (e, t) => {
	let { context: n, prop: r } = e, i = n.get("view"), a = typeof t == "number" ? n.get("focusedValue").set({ [i]: t }) : t;
	return Df((e) => {
		Cf(e, r("minView")) && (a = a.set({ [e]: +(e === "day") }));
	}), a;
}, zf = (e, t) => {
	if (!e || !("hour" in e)) return t;
	let n = "timeZone" in e, r = t;
	return "hour" in t || (r = n ? hs(ps(t), e.timeZone) : ps(t)), r.set({
		hour: e.hour,
		minute: e.minute,
		second: e.second,
		millisecond: e.millisecond
	});
};
function Q(e, t) {
	let { context: n, prop: r, computed: i } = e;
	if (!t) return;
	let a = Rf(e, t);
	if (gu(n.get("focusedValue"), a)) return;
	let o = Gu(i("visibleDuration"), r("locale"), r("min"), r("max"))({
		focusedDate: a,
		startDate: n.get("startValue")
	});
	n.set("startValue", o.startDate), n.set("focusedValue", o.focusedDate);
}
function Bf(e, t) {
	let { context: n } = e;
	n.set("startValue", t.startDate), !gu(n.get("focusedValue"), t.focusedDate) && n.set("focusedValue", t.focusedDate);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-picker@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-picker/dist/date-picker.parse.mjs
function Vf(e) {
	return Array.isArray(e) ? e.map((e) => Vf(e)) : e instanceof Date ? new Xs(e.getFullYear(), e.getMonth() + 1, e.getDate()) : Hs(e);
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-context.js
var [Hf, Uf] = vr({
	name: "DatePickerContext",
	hookName: "useDatePickerContext",
	providerName: "<DatePickerProvider />"
}), Wf = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Gf(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Wf), a = Uf(), o = F(() => J(a().getClearTriggerProps(), i));
	return Y(t, I({ as: "button" }, () => S(o), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(Gf, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-content.svelte
var Kf = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function qf(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Kf), o = Uf(), s = eo(), c = F(() => J(o().getContentProps(), s().getPresenceProps(), i));
	function l(e) {
		s().setNode(e);
	}
	var u = {
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	}, d = p(), f = V(d), m = (e) => {
		Y(e, I({ as: "div" }, () => S(c), {
			[a()]: l,
			get ref() {
				return r();
			},
			set ref(e) {
				r(e);
			}
		}));
	}, h = F(() => !s().unmounted);
	return b(f, (e) => {
		S(h) && e(m);
	}), R(t, d), L(u);
}
W(qf, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-context.svelte
function Jf(t, n) {
	k(n, !0);
	let r = B(n, "render", 7), i = Uf();
	var a = {
		get render() {
			return r();
		},
		set render(t) {
			r(t), e();
		}
	}, o = p(), s = V(o);
	return z(s, r, () => i), R(t, o), L(a);
}
W(Jf, { render: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-control.svelte
var Yf = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Xf(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Yf), a = Uf(), o = F(() => J(a().getControlProps(), i));
	return Y(t, I({ as: "div" }, () => S(o), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(Xf, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-view-props-context.js
var [Zf, Qf] = vr({
	name: "DatePickerViewPropsContext",
	hookName: "useDatePickerViewPropsContext",
	providerName: "<DatePickerViewPropsProvider />"
}), $f = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function ep(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, $f), a = Uf(), o = Qf(), s = F(() => J(a().getNextTriggerProps(o()), i));
	return Y(t, I({ as: "button" }, () => S(s), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(ep, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-positioner.svelte
var tp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function np(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, tp), a = Uf(), o = eo(), s = F(() => J(a().getPositionerProps(), i));
	var c = {
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	}, l = p(), u = V(l), d = (e) => {
		Y(e, I({ as: "div" }, () => S(s), {
			get ref() {
				return r();
			},
			set ref(e) {
				r(e);
			}
		}));
	}, f = F(() => !o().unmounted);
	return b(u, (e) => {
		S(f) && e(d);
	}), R(t, l), L(c);
}
W(np, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-prev-trigger.svelte
var rp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function ip(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, rp), a = Uf(), o = Qf(), s = F(() => J(a().getPrevTriggerProps(o()), i));
	return Y(t, I({ as: "button" }, () => S(s), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(ip, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-range-text.svelte
var ap = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function op(n, r) {
	k(r, !0);
	let i = B(r, "ref", 15, null), a = H(r, ap), o = Uf(), s = F(() => J(o().getRangeTextProps(), a)), c = F(() => {
		let { start: e, end: t } = o().visibleRangeText;
		return Hr([e, t]).filter(Boolean).join(" - ");
	});
	return Y(n, I({ as: "div" }, () => S(s), {
		get ref() {
			return i();
		},
		set ref(e) {
			i(e);
		},
		children: (e, n) => {
			U();
			var r = l();
			x(() => t(r, S(c))), R(e, r);
		},
		$$slots: { default: !0 }
	})), L({
		get ref() {
			return i();
		},
		set ref(t = null) {
			i(t), e();
		}
	});
}
W(op, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+focus-visible@1.43.3/node_modules/@zag-js/focus-visible/dist/index.mjs
function sp(e) {
	return !(e.metaKey || !Rt() && e.altKey || e.ctrlKey || e.key === "Control" || e.key === "Shift" || e.key === "Meta");
}
var cp = /* @__PURE__ */ new Set([
	"checkbox",
	"radio",
	"range",
	"color",
	"file",
	"image",
	"button",
	"submit",
	"reset"
]), lp = [
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
function up(e, t, n) {
	let r = n ? Ut(n) : null, i = rt(r), a = at(r), o = ot(i);
	return e = e || o instanceof a.HTMLInputElement && !cp.has(o?.type) || o instanceof a.HTMLTextAreaElement || o instanceof a.HTMLElement && o.isContentEditable, !(e && t === "keyboard" && n instanceof a.KeyboardEvent && !Reflect.has(vp, n.key));
}
var dp = null, fp = /* @__PURE__ */ new Set(), pp = /* @__PURE__ */ new Map(), mp = !1, hp = null, gp = !1, _p = null, vp = {
	Tab: !0,
	Escape: !0
};
function yp(e, t) {
	for (let n of fp) n(e, t);
}
function bp(e) {
	hp = null, mp = !0, sp(e) && (dp = "keyboard", yp("keyboard", e));
}
function xp(e) {
	(e.type !== "pointermove" && e.type !== "mousemove" || _p?.x !== e.clientX || _p?.y !== e.clientY) && (_p = {
		x: e.clientX,
		y: e.clientY
	}, dp = "pointer", (e.type === "mousedown" || e.type === "pointerdown") && (hp = null, mp = !0, yp("pointer", e)));
}
function Sp(e) {
	if (Yt(e)) {
		hp = null, mp = !0, dp = "virtual";
		return;
	}
	hp = null;
	let t = Ut(e), n = t?.closest("label"), r = n?.control;
	if (!n || !r || r.matches(":disabled")) return;
	let i = t?.closest(lp);
	i && n.contains(i) && i !== r || r !== ot(n.ownerDocument) && (hp = r);
}
function Cp(e) {
	let t = Ut(e), n = t === hp;
	t !== at(t) && t !== rt(t) && e.isTrusted && (!mp && !n && !gp && (dp = "virtual", yp("virtual", e)), mp = !1, hp = null, gp = !1);
}
function wp() {
	mp = !1, hp = null, gp = !0;
}
function Tp(e) {
	if (typeof window > "u" || pp.get(at(e))) return;
	let t = at(e), n = rt(e), r = t.HTMLElement.prototype.focus;
	function i() {
		mp = !0, r.apply(this, arguments);
	}
	try {
		Object.defineProperty(t.HTMLElement.prototype, "focus", {
			configurable: !0,
			value: i
		});
	} catch {}
	n.addEventListener("keydown", bp, !0), n.addEventListener("keyup", bp, !0), n.addEventListener("click", Sp, !0), t.addEventListener("focus", Cp, !0), t.addEventListener("blur", wp, !1), t.PointerEvent === void 0 ? (n.addEventListener("mousedown", xp, !0), n.addEventListener("mousemove", xp, !0), n.addEventListener("mouseup", xp, !0)) : (n.addEventListener("pointerdown", xp, !0), n.addEventListener("pointermove", xp, !0), n.addEventListener("pointerup", xp, !0)), t.addEventListener("beforeunload", () => {
		Ep(e);
	}, { once: !0 }), pp.set(t, { focus: r });
}
var Ep = (e, t) => {
	let n = at(e), r = rt(e);
	t && r.removeEventListener("DOMContentLoaded", t);
	let i = pp.get(n);
	if (i) {
		try {
			Object.defineProperty(n.HTMLElement.prototype, "focus", {
				configurable: !0,
				value: i.focus
			});
		} catch {}
		r.removeEventListener("keydown", bp, !0), r.removeEventListener("keyup", bp, !0), r.removeEventListener("click", Sp, !0), n.removeEventListener("focus", Cp, !0), n.removeEventListener("blur", wp, !1), n.PointerEvent === void 0 ? (r.removeEventListener("mousedown", xp, !0), r.removeEventListener("mousemove", xp, !0), r.removeEventListener("mouseup", xp, !0)) : (r.removeEventListener("pointerdown", xp, !0), r.removeEventListener("pointermove", xp, !0), r.removeEventListener("pointerup", xp, !0)), pp.delete(n);
	}
};
function Dp() {
	return dp;
}
function Op(e) {
	dp = e, yp(e, null);
}
function kp() {
	return dp === "keyboard" || dp === "virtual";
}
function Ap(e = {}) {
	let { isTextInput: t, autoFocus: n, onChange: r, root: i } = e;
	Tp(i), r?.({
		isFocusVisible: n || kp(),
		modality: dp
	});
	let a = (e, n) => {
		up(!!t, e, n) && r?.({
			isFocusVisible: kp(),
			modality: e
		});
	};
	return fp.add(a), () => {
		fp.delete(a);
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker.svelte.js
var jp = (e) => {
	let t = br(), n = uo(), r = F(() => {
		let r = pi(e);
		return {
			dir: n().dir,
			locale: n().locale,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = La(Lf, () => S(r)), a = F(() => kf(i, ka));
	return () => S(a);
}, Mp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"value",
	"focusedValue",
	"open",
	"view"
]);
function Np(t, n) {
	let r = o();
	k(n, !0);
	let i = B(n, "ref", 15, null), a = B(n, "value", 15), s = B(n, "focusedValue", 15), c = B(n, "open", 15), l = B(n, "view", 15), u = H(n, Mp), d = F(() => Qa(u)), f = F(() => P(S(d), 2)), p = F(() => S(f)[0]), m = F(() => S(f)[1]), h = F(() => wr()(S(m), /* @__PURE__ */ "closeOnSelect.createCalendar.defaultFocusedValue.defaultOpen.defaultValue.defaultView.disabled.fixedWeeks.focusedValue.format.id.ids.inline.invalid.isDateUnavailable.locale.max.maxSelectedDates.maxView.min.minView.name.numOfMonths.onFocusChange.onOpenChange.onValueChange.onViewChange.onVisibleRangeChange.open.openOnClick.outsideDaySelectable.parse.placeholder.positioning.readOnly.required.selectionMode.showWeekNumbers.startOfWeek.timeZone.translations.value.view".split("."))), g = F(() => P(S(h), 2)), _ = F(() => S(g)[0]), v = F(() => S(g)[1]), y = F(() => ({
		...S(_),
		id: S(_).id ?? r,
		value: a(),
		onValueChange(e) {
			S(_).onValueChange?.(e), a() !== void 0 && a(e.value);
		},
		focusedValue: s(),
		onFocusChange(e) {
			S(_).onFocusChange?.(e), s() !== void 0 && s(e.focusedValue);
		},
		open: c(),
		onOpenChange(e) {
			S(_).onOpenChange?.(e), c() !== void 0 && c(e.open);
		},
		view: l(),
		onViewChange(e) {
			S(_).onViewChange?.(e), l() !== void 0 && l(e.view);
		}
	})), b = jp(() => S(y)), x = Za(() => ({
		present: b().open,
		...S(p)
	})), C = F(() => J(b().getRootProps(), S(v)));
	return Hf(b), $a(x), Y(t, I({ as: "div" }, () => S(C), {
		get ref() {
			return i();
		},
		set ref(e) {
			i(e);
		}
	})), L({
		get ref() {
			return i();
		},
		set ref(t = null) {
			i(t), e();
		},
		get value() {
			return a();
		},
		set value(t) {
			a(t), e();
		},
		get focusedValue() {
			return s();
		},
		set focusedValue(t) {
			s(t), e();
		},
		get open() {
			return c();
		},
		set open(t) {
			c(t), e();
		},
		get view() {
			return l();
		},
		set view(t) {
			l(t), e();
		}
	});
}
W(Np, {
	ref: {},
	value: {},
	focusedValue: {},
	open: {},
	view: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-table-props-context.js
var [Pp, Fp] = vr({
	name: "DatePickerTablePropsContext",
	hookName: "useDatePickerTablePropsContext",
	providerName: "<DatePickerTablePropsProvider />"
}), Ip = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"columns"
]);
function Lp(t, n) {
	let r = o();
	k(n, !0);
	let i = B(n, "columns", 7), a = H(n, Ip), s = Uf(), c = Qf(), l = F(() => ({
		id: r,
		columns: i(),
		...c()
	})), u = F(() => J(s().getTableProps(S(l)), a));
	return Pp(() => S(l)), Y(t, I({ as: "table" }, () => S(u))), L({
		get columns() {
			return i();
		},
		set columns(t) {
			i(t), e();
		}
	});
}
W(Lp, { columns: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-body.svelte
var Rp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function zp(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Rp), a = Uf(), o = F(() => J(a().getTableBodyProps(), i));
	return Y(t, I({ as: "tbody" }, () => S(o), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(zp, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-head.svelte
var Bp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Vp(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Bp), a = Uf(), o = Fp(), s = F(() => J(a().getTableHeadProps(o()), i));
	return Y(t, I({ as: "thead" }, () => S(s), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(Vp, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-row.svelte
var Hp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Up(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Hp), a = Uf(), o = Fp(), s = F(() => J(a().getTableRowProps(o()), i));
	return Y(t, I({ as: "tr" }, () => S(s), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(Up, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-trigger.svelte
var Wp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Gp(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Wp), a = Uf(), o = F(() => J(a().getTriggerProps(), i));
	return Y(t, I({ as: "button" }, () => S(o), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(Gp, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-table-cell-props-context.js
var [Kp, qp] = vr({
	name: "DatePickerTableCellPropsContext",
	hookName: "useDatePickerTableCellPropsContext",
	providerName: "<DatePickerTableCellPropsProvider />"
}), Jp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Yp(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Jp), a = F(() => wr()(i, [
		"disabled",
		"value",
		"visibleRange",
		"columns"
	])), o = F(() => P(S(a), 2)), s = F(() => S(o)[0]), c = F(() => S(o)[1]), l = Uf(), u = Qf(), d = F(() => () => ({
		day: l().getDayTableCellProps,
		month: l().getMonthTableCellProps,
		year: l().getYearTableCellProps
	})[u().view](S(s))), f = F(() => J(S(d), S(c)));
	return Kp(() => S(s)), Y(t, I({ as: "td" }, () => S(f), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(Yp, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-cell-trigger.svelte
var Xp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Zp(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Xp), a = Uf(), o = qp(), s = Qf(), c = F(() => {
		let e = {
			day: a().getDayTableCellTriggerProps,
			month: a().getMonthTableCellTriggerProps,
			year: a().getYearTableCellTriggerProps
		}[s().view];
		return e(o());
	}), l = F(() => J(S(c), i));
	return Y(t, I({ as: "button" }, () => S(l), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(Zp, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-header.svelte
var Qp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function $p(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Qp), a = Uf(), o = Fp(), s = F(() => J(a().getTableHeaderProps(o()), i));
	return Y(t, I({ as: "th" }, () => S(s), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W($p, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-view.svelte
var em = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function tm(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, em), a = F(() => wr()(i, ["view"])), o = F(() => P(S(a), 2)), s = F(() => S(o)[0]), c = F(() => S(o)[1]), l = Uf(), u = F(() => J(l().getViewProps(S(s)), S(c)));
	return Zf(() => S(s)), Y(t, I({ as: "div" }, () => S(u), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(tm, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-view-control.svelte
var nm = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function rm(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, nm), a = Uf(), o = Qf(), s = F(() => J(a().getViewControlProps(o()), i));
	return Y(t, I({ as: "div" }, () => S(s), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(rm, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-view-trigger.svelte
var im = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function am(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, im), a = Uf(), o = Qf(), s = F(() => J(a().getViewTriggerProps(o()), i));
	return Y(t, I({ as: "button" }, () => S(s), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(am, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/DateField.svelte
var om = /^(\d{4})-(\d{2})-(\d{2})$/, sm = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, cm = (e) => String(e).padStart(2, "0");
function lm(e, t, n) {
	let r = new Date(Date.UTC(2e3, t - 1, n));
	return r.setUTCFullYear(e), r.getUTCFullYear() !== e || r.getUTCMonth() !== t - 1 || r.getUTCDate() !== n ? null : `${String(e).padStart(4, "0")}-${cm(t)}-${cm(n)}`;
}
function um(e) {
	let t = om.exec(e ?? "");
	return t ? lm(Number(t[1]), Number(t[2]), Number(t[3])) : null;
}
function dm(e) {
	let t = e.trim(), n = sm.exec(t);
	return n ? lm(Number(n[3]), Number(n[2]), Number(n[1])) : um(t);
}
var fm = (e) => /^vi(-|$)/i.test(e ?? "");
function pm(e, t) {
	let n = fm(t), r = n ? {
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
function mm() {
	let e = /* @__PURE__ */ new Date();
	return `${String(e.getFullYear()).padStart(4, "0")}-${cm(e.getMonth() + 1)}-${cm(e.getDate())}`;
}
var hm = (e, t) => e.replace(/\{(\w+)\}/g, (e, n) => t[n] ?? e), gm = g("<svg viewBox=\"0 0 16 16\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" aria-hidden=\"true\"><rect x=\"2\" y=\"3\" width=\"12\" height=\"11\" rx=\"2\"></rect><path d=\"M2 6.5h12M5.5 1.5v3M10.5 1.5v3\"></path></svg>"), _m = m("<input part=\"input\" data-scope=\"date-picker\" autocomplete=\"off\" spellcheck=\"false\" class=\"svelte-1voin8a\"/> <!>", 1), vm = m("<!> <!> <!>", 1), ym = m("<!> <!>", 1), bm = m("<!> <!> <!> <footer class=\"svelte-1voin8a\"><button type=\"button\" part=\"today\" class=\"af-button ghost\"> </button> <!></footer>", 1), xm = m("<div class=\"af-kit\"><!></div>"), Sm = {
	hash: "svelte-1voin8a",
	code: ":host {display:inline-block;max-width:100%;vertical-align:middle;}input.svelte-1voin8a {flex:1;min-width:0;width:8.5em;border:0;outline:none;background:transparent;color:inherit;font:inherit;}input.svelte-1voin8a::placeholder {color:var(--k-muted);}footer.svelte-1voin8a {display:flex;justify-content:space-between;gap:8px;margin-top:4px;}[data-scope='date-picker'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='date-picker'][hidden] {display:none !important;}[data-scope='date-picker'][data-part='control'] {display:flex;align-items:center;gap:2px;box-sizing:border-box;width:100%;min-height:32px;padding:0 2px 0 10px;border:1px solid color-mix(in oklab, var(--k-line), var(--k-fg) 40%);border-radius:max(0px, calc(var(--k-radius) - 2px));background:var(--k-surface);}[data-scope='date-picker'][data-part='control']:focus-within {outline:2px solid var(--k-ring);outline-offset:2px;}[data-scope='date-picker'][data-part='content'] {padding:8px;}[data-scope='date-picker'][data-part='content']:focus-visible {outline:2px solid var(--k-ring);outline-offset:2px;}[data-scope='date-picker'][data-part='view-control'] {display:flex;align-items:center;justify-content:space-between;gap:4px;margin-bottom:4px;}[data-scope='date-picker'][data-part='range-text'] {font-weight:600;}[data-scope='date-picker'][data-part='table'] {border-collapse:collapse;}[data-scope='date-picker'][data-part='table-header'] {padding:4px 0;color:var(--k-muted);font-size:12px;font-weight:500;}[data-scope='date-picker'][data-part='table-cell'] {padding:1px;text-align:center;}[data-scope='date-picker'][data-part='table-cell-trigger'] {display:inline-grid;place-items:center;min-width:32px;min-height:32px;padding:0 4px;border:0;border-radius:6px;background:transparent;color:inherit;font:inherit;cursor:pointer;}[data-scope='date-picker'][data-part='table-cell-trigger'][data-view='month'], [data-scope='date-picker'][data-part='table-cell-trigger'][data-view='year'] {min-width:56px;}[data-scope='date-picker'][data-part='table-cell-trigger']:hover:not([data-disabled]) {background:color-mix(in oklab, var(--k-primary) 10%, transparent);}[data-scope='date-picker'][data-part='table-cell-trigger']:focus-visible {outline:2px solid var(--k-ring);outline-offset:1px;}[data-scope='date-picker'][data-part='table-cell-trigger'][data-today] {box-shadow:inset 0 0 0 1px var(--k-primary);}[data-scope='date-picker'][data-part='table-cell-trigger'][data-selected] {background:var(--k-primary);color:var(--k-primary-fg);}[data-scope='date-picker'][data-part='table-cell-trigger'][data-outside-range] {color:var(--k-muted);}[data-scope='date-picker'][data-part='table-cell-trigger'][data-disabled] {opacity:0.4;cursor:not-allowed;}"
};
function Cm(n, i) {
	k(i, !0), de(n, Sm);
	let a = B(i, "value", 7, null), o = B(i, "locale", 7, null), s = B(i, "min", 7, null), c = B(i, "max", 7, null), f = B(i, "clearable", 7, !1), m = B(i, "placeholder", 7, null), h = B(i, "label", 7, null), g = B(i, "disabled", 7, !1), y = B(i, "strings", 7, null), w = i.$$host, D = F(() => tu(o(), y() ?? void 0)), j = F(() => fm(o()) ? "vi-VN" : "en-GB"), N = F(() => um(a())), P = F(() => um(s())), te = F(() => um(c())), ne = F(() => S(N) ? pm(S(N), o()) : ""), z = F(() => S(N) !== null && (S(P) !== null && S(N) < S(P) || S(te) !== null && S(N) > S(te))), ie = F(() => S(N) && !S(z) ? [Vf(S(N))] : []), ae = (e) => e === "month" ? S(D).viewMonth : e === "year" ? S(D).viewYear : S(D).viewDay, oe = _(!1), H = _(null), se = _(null), ce = !1;
	C(() => Jl(S(H), S(oe), w));
	let W = (e) => S(P) !== null && e < S(P) || S(te) !== null && e > S(te);
	function le(e) {
		return e !== null && W(e) ? !1 : (e !== S(N) && ql(w, "change", { value: e }), !0);
	}
	function pe() {
		if (!S(se) || !ce) return;
		ce = !1;
		let e = S(se).value.trim(), t = e === "" ? f() ? null : void 0 : dm(e) ?? void 0;
		t !== void 0 && t !== S(N) && le(t), S(se).value = S(ne);
	}
	function me(e) {
		e().setOpen(!1), w.shadowRoot?.querySelector("[part=\"trigger\"]")?.focus();
	}
	var ge = {
		get value() {
			return a();
		},
		set value(t = null) {
			a(t), e();
		},
		get locale() {
			return o();
		},
		set locale(t = null) {
			o(t), e();
		},
		get min() {
			return s();
		},
		set min(t = null) {
			s(t), e();
		},
		get max() {
			return c();
		},
		set max(t = null) {
			c(t), e();
		},
		get clearable() {
			return f();
		},
		set clearable(t = !1) {
			f(t), e();
		},
		get placeholder() {
			return m();
		},
		set placeholder(t = null) {
			m(t), e();
		},
		get label() {
			return h();
		},
		set label(t = null) {
			h(t), e();
		},
		get disabled() {
			return g();
		},
		set disabled(t = !1) {
			g(t), e();
		},
		get strings() {
			return y();
		},
		set strings(t = null) {
			y(t), e();
		}
	}, _e = ym(), ve = V(_e);
	return Kl(ve, {}), Cr(T(ve, 2), {
		value: () => w.shadowRoot,
		children: (e, n) => {
			var i = xm(), a = d(i), s = () => S(ie);
			{
				let e = F(() => S(P) ? Vf(S(P)) : void 0), n = F(() => S(te) ? Vf(S(te)) : void 0), i = F(() => !!g()), c = F(() => ({
					trigger: (e) => e ? S(D).closeCalendar : S(D).openCalendar,
					content: S(D).calendar,
					clearTrigger: S(D).clear,
					dayCell: (e) => hm(e.selected ? S(D).selectedDate : S(D).chooseDate, { date: e.valueText }),
					viewTrigger: (e, t) => hm(t ? S(D).switchView : S(D).currentView, { view: ae(t ?? e) }),
					prevTrigger: (e) => e === "day" ? S(D).previousMonth : e === "month" ? S(D).previousYear : S(D).previousDecade,
					nextTrigger: (e) => e === "day" ? S(D).nextMonth : e === "month" ? S(D).nextYear : S(D).nextDecade
				}));
				A(a, () => Np, (a, _) => {
					_(a, {
						get value() {
							return s();
						},
						set value(e) {},
						get locale() {
							return S(j);
						},
						selectionMode: "single",
						get min() {
							return S(e);
						},
						get max() {
							return S(n);
						},
						get disabled() {
							return S(i);
						},
						fixedWeeks: !0,
						positioning: {
							strategy: "fixed",
							placement: "bottom-start"
						},
						format: (e) => pm(e.toString(), o()),
						get translations() {
							return S(c);
						},
						onValueChange: (e) => le(e.value[0]?.toString() ?? null),
						onOpenChange: (e) => E(oe, e.open, !0),
						children: (e, n) => {
							var i = ym(), a = V(i);
							A(a, () => Xf, (e, t) => {
								t(e, {
									part: "control",
									children: (e, t) => {
										var n = _m(), r = V(n);
										re(r), O(r, (e) => E(se, e), () => S(se));
										var i = T(r, 2);
										A(i, () => Gp, (e, t) => {
											t(e, {
												part: "trigger",
												class: "af-button ghost",
												children: (e, t) => {
													var n = gm();
													R(e, n);
												},
												$$slots: { default: !0 }
											});
										}), x(() => {
											G(r, "data-part", S(z) ? void 0 : "input"), ee(r, S(ne)), G(r, "placeholder", m() || "dd/mm/yyyy"), G(r, "aria-label", h() || m() || void 0), r.disabled = !!g();
										}), v("keydown", r, (e) => {
											e.key === "Enter" && !e.isComposing && (e.preventDefault(), pe());
										}), v("input", r, () => ce = !0), he("blur", r, pe), R(e, n);
									},
									$$slots: { default: !0 }
								});
							});
							var o = T(a, 2);
							A(o, () => np, (e, n) => {
								n(e, {
									popover: "manual",
									get ref() {
										return S(H);
									},
									set ref(e) {
										E(H, e, !0);
									},
									children: (e, n) => {
										var i = p(), a = V(i);
										A(a, () => qf, (e, n) => {
											n(e, {
												class: "af-overlay date",
												part: "content",
												children: (e, n) => {
													var i = p(), a = V(i);
													{
														let e = (e, n = ue) => {
															var i = bm(), a = V(i);
															A(a, () => tm, (e, i) => {
																i(e, {
																	view: "day",
																	children: (e, i) => {
																		var a = ym(), o = V(a);
																		A(o, () => rm, (e, t) => {
																			t(e, {
																				children: (e, t) => {
																					var n = vm(), r = V(n);
																					A(r, () => ip, (e, t) => {
																						t(e, {
																							class: "af-button ghost",
																							children: (e, t) => {
																								U();
																								var n = l("‹");
																								R(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					});
																					var i = T(r, 2);
																					A(i, () => am, (e, t) => {
																						t(e, {
																							class: "af-button ghost",
																							children: (e, t) => {
																								var n = p(), r = V(n);
																								A(r, () => op, (e, t) => {
																									t(e, {});
																								}), R(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					});
																					var a = T(i, 2);
																					A(a, () => ep, (e, t) => {
																						t(e, {
																							class: "af-button ghost",
																							children: (e, t) => {
																								U();
																								var n = l("›");
																								R(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					}), R(e, n);
																				},
																				$$slots: { default: !0 }
																			});
																		});
																		var s = T(o, 2);
																		A(s, () => Lp, (e, i) => {
																			i(e, {
																				children: (e, i) => {
																					var a = ym(), o = V(a);
																					A(o, () => Vp, (e, i) => {
																						i(e, {
																							children: (e, i) => {
																								var a = p(), o = V(a);
																								A(o, () => Up, (e, i) => {
																									i(e, {
																										children: (e, i) => {
																											var a = p(), o = V(a);
																											r(o, 17, () => n()().weekDays, fe, (e, n) => {
																												var r = p(), i = V(r);
																												A(i, () => $p, (e, r) => {
																													r(e, {
																														children: (e, r) => {
																															U();
																															var i = l();
																															x(() => t(i, S(n).narrow)), R(e, i);
																														},
																														$$slots: { default: !0 }
																													});
																												}), R(e, r);
																											}), R(e, a);
																										},
																										$$slots: { default: !0 }
																									});
																								}), R(e, a);
																							},
																							$$slots: { default: !0 }
																						});
																					});
																					var s = T(o, 2);
																					A(s, () => zp, (e, i) => {
																						i(e, {
																							children: (e, i) => {
																								var a = p(), o = V(a);
																								r(o, 17, () => n()().weeks, fe, (e, i, a) => {
																									var o = p(), s = V(o);
																									A(s, () => Up, (e, i) => {
																										i(e, {
																											children: (e, i) => {
																												var o = p(), s = V(o);
																												r(s, 17, () => n()().getDaysInWeek(a), (e) => e.toString(), (e, n) => {
																													var r = p(), i = V(r);
																													A(i, () => Yp, (e, r) => {
																														r(e, {
																															get value() {
																																return S(n);
																															},
																															children: (e, r) => {
																																var i = p(), a = V(i);
																																A(a, () => Zp, (e, r) => {
																																	r(e, {
																																		children: (e, r) => {
																																			U();
																																			var i = l();
																																			x(() => t(i, S(n).day)), R(e, i);
																																		},
																																		$$slots: { default: !0 }
																																	});
																																}), R(e, i);
																															},
																															$$slots: { default: !0 }
																														});
																													}), R(e, r);
																												}), R(e, o);
																											},
																											$$slots: { default: !0 }
																										});
																									}), R(e, o);
																								}), R(e, a);
																							},
																							$$slots: { default: !0 }
																						});
																					}), R(e, a);
																				},
																				$$slots: { default: !0 }
																			});
																		}), R(e, a);
																	},
																	$$slots: { default: !0 }
																});
															});
															var o = T(a, 2);
															A(o, () => tm, (e, i) => {
																i(e, {
																	view: "month",
																	children: (e, i) => {
																		var a = ym(), o = V(a);
																		A(o, () => rm, (e, t) => {
																			t(e, {
																				children: (e, t) => {
																					var n = vm(), r = V(n);
																					A(r, () => ip, (e, t) => {
																						t(e, {
																							class: "af-button ghost",
																							children: (e, t) => {
																								U();
																								var n = l("‹");
																								R(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					});
																					var i = T(r, 2);
																					A(i, () => am, (e, t) => {
																						t(e, {
																							class: "af-button ghost",
																							children: (e, t) => {
																								var n = p(), r = V(n);
																								A(r, () => op, (e, t) => {
																									t(e, {});
																								}), R(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					});
																					var a = T(i, 2);
																					A(a, () => ep, (e, t) => {
																						t(e, {
																							class: "af-button ghost",
																							children: (e, t) => {
																								U();
																								var n = l("›");
																								R(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					}), R(e, n);
																				},
																				$$slots: { default: !0 }
																			});
																		});
																		var s = T(o, 2);
																		A(s, () => Lp, (e, i) => {
																			i(e, {
																				children: (e, i) => {
																					var a = p(), o = V(a);
																					A(o, () => zp, (e, i) => {
																						i(e, {
																							children: (e, i) => {
																								var a = p(), o = V(a);
																								r(o, 17, () => n()().getMonthsGrid({
																									columns: 4,
																									format: "short"
																								}), fe, (e, n) => {
																									var i = p(), a = V(i);
																									A(a, () => Up, (e, i) => {
																										i(e, {
																											children: (e, i) => {
																												var a = p(), o = V(a);
																												r(o, 17, () => S(n), (e) => e.value, (e, n) => {
																													var r = p(), i = V(r);
																													A(i, () => Yp, (e, r) => {
																														r(e, {
																															get value() {
																																return S(n).value;
																															},
																															children: (e, r) => {
																																var i = p(), a = V(i);
																																A(a, () => Zp, (e, r) => {
																																	r(e, {
																																		children: (e, r) => {
																																			U();
																																			var i = l();
																																			x(() => t(i, S(n).label)), R(e, i);
																																		},
																																		$$slots: { default: !0 }
																																	});
																																}), R(e, i);
																															},
																															$$slots: { default: !0 }
																														});
																													}), R(e, r);
																												}), R(e, a);
																											},
																											$$slots: { default: !0 }
																										});
																									}), R(e, i);
																								}), R(e, a);
																							},
																							$$slots: { default: !0 }
																						});
																					}), R(e, a);
																				},
																				$$slots: { default: !0 }
																			});
																		}), R(e, a);
																	},
																	$$slots: { default: !0 }
																});
															});
															var s = T(o, 2);
															A(s, () => tm, (e, i) => {
																i(e, {
																	view: "year",
																	children: (e, i) => {
																		var a = ym(), o = V(a);
																		A(o, () => rm, (e, t) => {
																			t(e, {
																				children: (e, t) => {
																					var n = vm(), r = V(n);
																					A(r, () => ip, (e, t) => {
																						t(e, {
																							class: "af-button ghost",
																							children: (e, t) => {
																								U();
																								var n = l("‹");
																								R(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					});
																					var i = T(r, 2);
																					A(i, () => am, (e, t) => {
																						t(e, {
																							class: "af-button ghost",
																							children: (e, t) => {
																								var n = p(), r = V(n);
																								A(r, () => op, (e, t) => {
																									t(e, {});
																								}), R(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					});
																					var a = T(i, 2);
																					A(a, () => ep, (e, t) => {
																						t(e, {
																							class: "af-button ghost",
																							children: (e, t) => {
																								U();
																								var n = l("›");
																								R(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					}), R(e, n);
																				},
																				$$slots: { default: !0 }
																			});
																		});
																		var s = T(o, 2);
																		A(s, () => Lp, (e, i) => {
																			i(e, {
																				children: (e, i) => {
																					var a = p(), o = V(a);
																					A(o, () => zp, (e, i) => {
																						i(e, {
																							children: (e, i) => {
																								var a = p(), o = V(a);
																								r(o, 17, () => n()().getYearsGrid({ columns: 4 }), fe, (e, n) => {
																									var i = p(), a = V(i);
																									A(a, () => Up, (e, i) => {
																										i(e, {
																											children: (e, i) => {
																												var a = p(), o = V(a);
																												r(o, 17, () => S(n), (e) => e.value, (e, n) => {
																													var r = p(), i = V(r);
																													A(i, () => Yp, (e, r) => {
																														r(e, {
																															get value() {
																																return S(n).value;
																															},
																															children: (e, r) => {
																																var i = p(), a = V(i);
																																A(a, () => Zp, (e, r) => {
																																	r(e, {
																																		children: (e, r) => {
																																			U();
																																			var i = l();
																																			x(() => t(i, S(n).label)), R(e, i);
																																		},
																																		$$slots: { default: !0 }
																																	});
																																}), R(e, i);
																															},
																															$$slots: { default: !0 }
																														});
																													}), R(e, r);
																												}), R(e, a);
																											},
																											$$slots: { default: !0 }
																										});
																									}), R(e, i);
																								}), R(e, a);
																							},
																							$$slots: { default: !0 }
																						});
																					}), R(e, a);
																				},
																				$$slots: { default: !0 }
																			});
																		}), R(e, a);
																	},
																	$$slots: { default: !0 }
																});
															});
															var c = T(s, 2), m = d(c), h = u(m, !0), g = T(m, 2), _ = (e) => {
																var r = p(), i = V(r);
																A(i, () => Gf, (e, r) => {
																	r(e, I({
																		part: "clear",
																		class: "af-button ghost"
																	}, () => S(z) ? { hidden: !1 } : {}, {
																		onclick: () => {
																			S(z) && le(null), me(n());
																		},
																		children: (e, n) => {
																			U();
																			var r = l();
																			x(() => t(r, S(D).clear)), R(e, r);
																		},
																		$$slots: { default: !0 }
																	}));
																}), R(e, r);
															};
															b(g, (e) => {
																f() && e(_);
															}), M(c), x((e) => {
																m.disabled = e, t(h, S(D).today);
															}, [() => W(mm())]), v("click", m, () => {
																le(mm()) && me(n());
															}), R(e, i);
														};
														A(a, () => Jf, (t, n) => {
															n(t, {
																render: e,
																$$slots: { render: !0 }
															});
														});
													}
													R(e, i);
												},
												$$slots: { default: !0 }
											});
										}), R(e, i);
									},
									$$slots: { default: !0 }
								});
							}), R(e, i);
						},
						$$slots: { default: !0 }
					});
				});
			}
			M(i), R(e, i);
		},
		$$slots: { default: !0 }
	}), R(n, _e), L(ge);
}
f([
	"keydown",
	"input",
	"click"
]), W(Cm, {
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
		type: "Boolean"
	},
	strings: { type: "Object" }
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/Dialog.svelte
var wm = m("<header class=\"svelte-gp7kvq\"><!> <button type=\"button\" part=\"close\" class=\"af-button ghost icon\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button></header> <div part=\"body\" class=\"svelte-gp7kvq\"><!></div> <footer part=\"actions\" class=\"svelte-gp7kvq\"><!></footer>", 1), Tm = m("<dialog><!></dialog>"), Em = m("<!> <!>", 1), Dm = {
	hash: "svelte-gp7kvq",
	code: "dialog.svelte-gp7kvq {border:0;padding:0;background:transparent;max-width:calc(100vw - 32px);overflow:visible;}dialog.svelte-gp7kvq::backdrop {background:rgb(0 0 0 / 0.4);}\n  /* On a short window the body scrolls between a heading and a footer that stay in view. */header.svelte-gp7kvq {display:flex;flex:none;align-items:center;justify-content:space-between;gap:12px;margin-right:-8px;}[part='body'].svelte-gp7kvq {flex:1 1 auto;min-height:0;margin:-4px -16px;padding:4px 16px;overflow:auto;overscroll-behavior:contain;}footer.svelte-gp7kvq {display:flex;flex:none;flex-wrap:wrap;justify-content:flex-end;gap:8px;}footer[hidden].svelte-gp7kvq {display:none;}[data-scope='dialog'][data-part='content'] {display:flex;flex-direction:column;gap:12px;width:min(480px, calc(100vw - 32px));max-height:calc(100dvh - 64px);padding:16px;border-radius:calc(var(--k-radius) + 4px);box-sizing:border-box;}[data-scope='dialog'][data-part='content']:focus-visible {outline:2px solid var(--k-ring);outline-offset:2px;}[data-scope='dialog'][data-part='title'] {margin:0;font-size:16px;font-weight:600;line-height:24px;}"
};
function Om(r, i) {
	k(i, !0), de(r, Dm);
	let a = B(i, "open", 7, !1), o = B(i, "heading", 7, ""), s = B(i, "locale", 7, null), c = B(i, "strings", 7, null), u = i.$$host, f = F(() => tu(s(), c() ?? void 0)), m = _(null), h = "escape", g = _(null), y = _(!1), b = $l(u);
	C(() => b(S(m), !!a()));
	let w = null, D = null, N = (e) => !(e instanceof Node && Xl(u, e)) && Ql(u);
	C(() => {
		if (a() && S(m)) return n(u.ownerDocument, "pointerdown", (e) => {
			e !== D && e.button === 0 && e.pointerType !== "touch" && N(e.composedPath()[0] ?? null) && (w = e, ql(u, "close", { reason: "outside" }));
		}, { capture: !0 });
	}), C(() => {
		let e = S(g)?.querySelector("slot");
		if (!e) return;
		let t = () => E(y, e.assignedNodes().length > 0);
		return t(), n(e, "slotchange", t);
	});
	var P = {
		get open() {
			return a();
		},
		set open(t = !1) {
			a(t), e();
		},
		get heading() {
			return o();
		},
		set heading(t = "") {
			o(t), e();
		},
		get locale() {
			return s();
		},
		set locale(t = null) {
			s(t), e();
		},
		get strings() {
			return c();
		},
		set strings(t = null) {
			c(t), e();
		}
	}, ee = Em(), te = V(ee);
	return Kl(te, {}), Cr(T(te, 2), {
		value: () => u.shadowRoot,
		children: (e, n) => {
			var r = p(), s = V(r), c = () => !!a();
			A(s, () => Hl, (e, n) => {
				n(e, {
					get open() {
						return c();
					},
					set open(e) {},
					modal: !1,
					preventScroll: !0,
					closeOnInteractOutside: !0,
					onEscapeKeyDown: () => h = "escape",
					onInteractOutside: (e) => {
						e.detail.originalEvent === w || !N(e.detail.target) ? e.preventDefault() : (D = e.detail.originalEvent, h = "outside");
					},
					onOpenChange: (e) => {
						e.open || (ql(u, "close", { reason: h }), h = "escape");
					},
					children: (e, n) => {
						var r = p(), a = V(r);
						{
							let e = (e, n = ue) => {
								var r = Tm(), a = (e) => e.preventDefault();
								j(r, (e) => ({
									...e,
									class: "af-kit",
									oncancel: a
								}), [() => n()()], void 0, void 0, "svelte-gp7kvq");
								var s = d(r);
								A(s, () => io, (e, n) => {
									n(e, {
										part: "content",
										class: "af-overlay dialog",
										"aria-modal": "true",
										children: (e, n) => {
											var r = wm(), a = V(r), s = d(a);
											A(s, () => Wl, (e, n) => {
												n(e, {
													part: "heading",
													children: (e, n) => {
														U();
														var r = l();
														x(() => t(r, o() ?? "")), R(e, r);
													},
													$$slots: { default: !0 }
												});
											});
											var c = T(s, 2);
											M(a);
											var p = T(a, 2), m = d(p);
											pe(m, i, "default", {}, null), M(p);
											var h = T(p, 2), _ = d(h);
											pe(_, i, "actions", {}, null), M(h), O(h, (e) => E(g, e), () => S(g)), x(() => {
												G(c, "aria-label", S(f).close), G(h, "hidden", !S(y));
											}), v("click", c, () => ql(u, "close", { reason: "close-button" })), R(e, r);
										},
										$$slots: { default: !0 }
									});
								}), M(r), O(r, (e) => E(m, e), () => S(m)), R(e, r);
							};
							A(a, () => co, (t, n) => {
								n(t, {
									asChild: e,
									$$slots: { asChild: !0 }
								});
							});
						}
						R(e, r);
					},
					$$slots: { default: !0 }
				});
			}), R(e, r);
		},
		$$slots: { default: !0 }
	}), R(r, ee), L(P);
}
f(["click"]), W(Om, {
	open: { type: "Boolean" },
	heading: {
		attribute: "heading",
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
var [km, Am] = vr({
	name: "MenuContext",
	hookName: "useMenuContext",
	providerName: "<MenuProvider />",
	strict: !1
}), [jm, Mm] = vr({
	name: "MenuItemContext",
	hookName: "useMenuItemContext",
	providerName: "<MenuItemProvider />"
}), [Nm, Pm] = vr({
	name: "MenuItemPropsContext",
	hookName: "useMenuItemPropsContext",
	providerName: "<MenuItemPropsProvider />"
}), Fm = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Im(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Fm), o = Am(), s = eo(), c = F(() => J(o().getContentProps(), s().getPresenceProps(), i));
	function l(e) {
		s().setNode(e);
	}
	var u = {
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	}, d = p(), f = V(d), m = (e) => {
		Y(e, I({
			as: "div",
			[a()]: l
		}, () => S(c), {
			get ref() {
				return r();
			},
			set ref(e) {
				r(e);
			}
		}));
	}, h = F(() => !s().unmounted);
	return b(f, (e) => {
		S(h) && e(m);
	}), R(t, d), L(u);
}
W(Im, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-context.svelte
function Lm(t, n) {
	k(n, !0);
	let r = B(n, "render", 7), i = Am();
	var a = {
		get render() {
			return r();
		},
		set render(t) {
			r(t), e();
		}
	}, o = p(), s = V(o);
	return z(s, r, () => i), R(t, o), L(a);
}
W(Lm, { render: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-item.svelte
var Rm = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function zm(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Rm), a = F(() => wr()(i, [
		"closeOnSelect",
		"disabled",
		"value",
		"valueText",
		"onSelect"
	])), o = F(() => P(S(a), 2)), s = F(() => S(o)[0]), c = F(() => S(o)[1]), l = Am(), u = F(() => J(l().getItemProps(S(s)), S(c))), d = F(() => l().getItemState(S(s)));
	return C(() => l().addItemListener({
		id: S(d).id,
		onSelect: S(s).onSelect
	})), Nm(() => S(s)), jm(() => S(d)), Y(t, I({ as: "div" }, () => S(u), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(zm, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-positioner.svelte
var Bm = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Vm(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Bm), a = Am(), o = eo(), s = F(() => J(a().getPositionerProps(), i));
	var c = {
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	}, l = p(), u = V(l), d = (e) => {
		Y(e, I({ as: "div" }, () => S(s), {
			get ref() {
				return r();
			},
			set ref(e) {
				r(e);
			}
		}));
	}, f = F(() => !o().unmounted);
	return b(u, (e) => {
		S(f) && e(d);
	}), R(t, l), L(c);
}
W(Vm, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/use-menu-machine-context.js
var [Hm, Um] = vr({
	name: "MenuMachineContext",
	hookName: "useMenuMachineContext",
	providerName: "<MenuMachineProvider />",
	strict: !1
}), [Wm, Gm] = vr({
	name: "MenuTriggerItemContext",
	hookName: "useMenuTriggerItemContext",
	providerName: "<MenuTriggerItemProvider />",
	strict: !1
}), Km = cc("menu").parts("arrow", "arrowTip", "content", "contextTrigger", "indicator", "item", "itemGroup", "itemGroupLabel", "itemIndicator", "itemText", "positioner", "separator", "trigger", "triggerItem").build(), qm = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `menu:${e.id}:trigger:${t}` : `menu:${e.id}:trigger` : ri(n) ? n(t) : n;
}, Jm = (e, t) => {
	let n = e.ids?.contextTrigger;
	return n == null ? t ? `menu:${e.id}:ctx-trigger:${t}` : `menu:${e.id}:ctx-trigger` : ri(n) ? n(t) : n;
}, Ym = (e) => e.ids?.content ?? `menu:${e.id}:content`, Xm = (e) => e.ids?.arrow ?? `menu:${e.id}:arrow`, Zm = (e) => e.ids?.positioner ?? `menu:${e.id}:popper`, Qm = (e, t) => e.ids?.group?.(t) ?? `menu:${e.id}:group:${t}`, $m = (e, t) => `${e.id}/${t}`, eh = (e) => e?.dataset.value ?? null, th = (e, t) => e.ids?.groupLabel?.(t) ?? `menu:${e.id}:group-label:${t}`, nh = (e) => e.getById(Ym(e)), rh = (e) => e.getById(Zm(e)), ih = (e) => e.getById(qm(e)), ah = (e, t) => t ? e.getById($m(e, t)) : null, oh = (e) => e.getById(Jm(e)), sh = (e) => Yn(e.getRootNode(), `[data-scope="menu"][data-part="trigger"]${ze(e.id)}`), ch = (e) => Yn(e.getRootNode(), `[data-scope="menu"][data-part="context-trigger"]${ze(e.id)}`), lh = (e, t) => t == null ? ih(e) ?? sh(e)[0] : e.getById(qm(e, t)), uh = (e) => {
	let t = `[role^="menuitem"]${ze(Ym(e))}:not([data-disabled])`;
	return Yn(nh(e), t);
}, dh = (e) => Lr(uh(e)), fh = (e) => Rr(uh(e)), ph = (e, t) => t ? e.id === t || e.dataset.value === t : !1, mh = (e, t) => {
	let n = uh(e);
	return Gr(n, n.findIndex((e) => ph(e, t.value)), { loop: t.loop ?? t.loopFocus });
}, hh = (e, t) => {
	let n = uh(e);
	return qr(n, n.findIndex((e) => ph(e, t.value)), { loop: t.loop ?? t.loopFocus });
}, gh = (e, t) => {
	let n = uh(e), r = n.find((e) => ph(e, t.value));
	return ur(n, {
		state: t.typeaheadState,
		key: t.key,
		activeId: r?.id ?? null
	});
}, _h = (e) => Ue(e) && (e.dataset.disabled === "" || e.hasAttribute("disabled")), vh = (e) => !!e?.getAttribute("role")?.startsWith("menuitem") && !!e?.hasAttribute("data-controls"), yh = "menu:select";
function bh(e, t) {
	if (!e) return;
	let n = new (at(e)).CustomEvent(yh, { detail: { value: t } });
	e.dispatchEvent(n);
}
function xh(e) {
	let t = Ym(e);
	return nh(e) ?? e.getDoc().getElementById(t);
}
function Sh(e, t) {
	if (!Ue(e)) return !1;
	for (let n in t) {
		let r = t[n], i = xh(r.scope);
		if (i && nt(i, e)) return !0;
		let a = r.refs.get("children");
		if (Object.keys(a).length > 0 && Sh(e, a)) return !0;
	}
	return !1;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+rect-utils@1.43.3/node_modules/@zag-js/rect-utils/dist/rect.mjs
var Ch = (e, t) => ({
	x: e,
	y: t
});
function wh(e) {
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
		center: Ch(a, o)
	};
}
function Th(e) {
	return {
		top: Ch(e.minX, e.minY),
		right: Ch(e.maxX, e.minY),
		bottom: Ch(e.maxX, e.maxY),
		left: Ch(e.minX, e.maxY)
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+rect-utils@1.43.3/node_modules/@zag-js/rect-utils/dist/polygon.mjs
function Eh(e, t) {
	let { top: n, right: r, left: i, bottom: a } = Th(wh(e)), [o] = t.split("-");
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
function Dh(e, t) {
	let { x: n, y: r } = t, i = !1;
	for (let t = 0, a = e.length - 1; t < e.length; a = t++) {
		let o = e[t].x, s = e[t].y, c = e[a].x, l = e[a].y;
		s > r != l > r && n < (c - o) * (r - s) / (l - s) + o && (i = !i);
	}
	return i;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+menu@1.43.3/node_modules/@zag-js/menu/dist/menu.utils.mjs
function Oh(e) {
	let t = e.parent;
	for (; t && t.context.get("isSubmenu");) t = t.refs.get("parent");
	t?.send({ type: "CLOSE" });
}
function kh(e, t) {
	return e ? Dh(e, t) : !1;
}
function Ah(e, t, n) {
	let r = Object.keys(e).length > 0;
	if (!t) return null;
	if (!r) return $m(n, t);
	for (let n in e) {
		let r = e[n], i = qm(r.scope);
		if (i === t) return i;
	}
	return $m(n, t);
}
function jh(e, t) {
	e && (e.refs.set("pointerRoutingLocked", t), e.context.set("pointerRoutingMode", t ? "locked" : "interactive"));
}
function Mh(e) {
	let t = e.context.get("highlightedValue");
	if (!t) return !1;
	let n = e.refs.get("children");
	for (let e in n) {
		let r = n[e];
		if (r.state.hasTag("open") && qm(r.scope) === t) return !0;
	}
	return !1;
}
function Nh(e, t) {
	e && (e.refs.get("pointerRoutingLocked") || t && Mh(e) || jh(e, !1));
}
function Ph(e) {
	e && (Mh(e) || jh(e, !1));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+menu@1.43.3/node_modules/@zag-js/menu/dist/menu.connect.mjs
function Fh(e, t) {
	let { context: n, send: r, state: i, computed: a, prop: o, scope: s } = e, c = i.hasTag("open"), l = n.get("isSubmenu"), u = a("isTypingAhead"), d = o("composite"), f = n.get("currentPlacement"), p = f ? bd(f) : void 0, m = n.get("anchorPoint"), h = n.get("highlightedValue"), g = n.get("triggerValue"), _ = zd({
		...o("positioning"),
		placement: f
	});
	function v(e) {
		return {
			id: $m(s, e.value),
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
		let { closeOnSelect: n, valueText: i, value: a } = e, o = v(e), c = $m(s, a);
		return t.element({
			...Km.item.attrs,
			id: c,
			role: "menuitem",
			"aria-disabled": Fe(o.disabled),
			"data-disabled": K(o.disabled),
			"data-ownedby": Ym(s),
			"data-highlighted": K(o.highlighted),
			"data-value": a,
			"data-valuetext": i,
			onDragStart(e) {
				e.currentTarget.matches("a[href]") && e.preventDefault();
			},
			onPointerMove(e) {
				if (o.disabled || e.pointerType !== "mouse" || Dp() !== "pointer") return;
				let t = e.currentTarget;
				if (o.highlighted) return;
				let i = an(e);
				r({
					type: "ITEM_POINTERMOVE",
					id: c,
					target: t,
					closeOnSelect: n,
					point: i
				});
			},
			onPointerLeave(e) {
				if (o.disabled || e.pointerType !== "mouse" || Dp() !== "pointer") return;
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
				if (Gt(e) || Wt(e) || o.disabled) return;
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
			return t.addEventListener(yh, n), () => t.removeEventListener(yh, n);
		},
		getContextTriggerProps(e = {}) {
			let { value: n } = e, i = n != null && g === n, a = Jm(s, n);
			return t.element({
				...Km.contextTrigger.attrs,
				dir: o("dir"),
				id: a,
				"data-ownedby": s.id,
				"data-value": n,
				"data-current": K(i),
				"data-state": c ? "open" : "closed",
				onPointerDown(e) {
					if (e.pointerType === "mouse") return;
					let t = an(e);
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
					let t = an(e);
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
			return qi(x({ value: t.id }), t);
		},
		getTriggerProps(n = {}) {
			let { value: i } = n, a = i != null && g === i, u = qm(s, i);
			return t.button({
				...l ? Km.triggerItem.attrs : Km.trigger.attrs,
				"data-placement": f,
				"data-side": p,
				type: "button",
				dir: o("dir"),
				id: u,
				...i != null && {
					"data-ownedby": s.id,
					"data-value": i,
					"data-current": K(a)
				},
				"data-uid": o("id"),
				"aria-haspopup": d ? "menu" : "dialog",
				"aria-controls": Ym(s),
				"data-controls": Ym(s),
				"aria-expanded": i == null ? c : c && a,
				"data-state": c ? "open" : "closed",
				onPointerMove(e) {
					if (e.pointerType !== "mouse" || _h(e.currentTarget) || !l) return;
					let t = an(e);
					r({
						type: "TRIGGER_POINTERMOVE",
						target: e.currentTarget,
						point: t
					});
				},
				onPointerLeave(t) {
					if (_h(t.currentTarget) || t.pointerType !== "mouse" || !l) return;
					jh(e.refs.get("parent"), !0);
					let n = an(t);
					r({
						type: "TRIGGER_POINTERLEAVE",
						target: t.currentTarget,
						point: n
					});
				},
				onPointerDown(e) {
					_h(e.currentTarget) || Zt(e) || e.preventDefault();
				},
				onClick(e) {
					e.defaultPrevented || _h(e.currentTarget) || r({
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
					}[nn(e, {
						orientation: "vertical",
						dir: o("dir")
					})];
					t && (e.preventDefault(), t(e));
				}
			});
		},
		getIndicatorProps() {
			return t.element({
				...Km.indicator.attrs,
				dir: o("dir"),
				"data-state": c ? "open" : "closed"
			});
		},
		getPositionerProps() {
			return t.element({
				...Km.positioner.attrs,
				dir: o("dir"),
				id: Zm(s),
				style: _.floating
			});
		},
		getArrowProps() {
			return t.element({
				id: Xm(s),
				...Km.arrow.attrs,
				dir: o("dir"),
				style: _.arrow
			});
		},
		getArrowTipProps() {
			return t.element({
				...Km.arrowTip.attrs,
				dir: o("dir"),
				style: _.arrowTip
			});
		},
		getContentProps() {
			return t.element({
				...Km.content.attrs,
				id: Ym(s),
				"aria-label": o("aria-label"),
				hidden: !c,
				"data-state": c ? "open" : "closed",
				role: d ? "menu" : "dialog",
				tabIndex: 0,
				dir: o("dir"),
				"aria-activedescendant": a("highlightedId") || void 0,
				"aria-labelledby": m ? Jm(s, g ?? void 0) : qm(s, g ?? void 0),
				"data-placement": f,
				"data-side": p,
				onPointerEnter(e) {
					e.pointerType === "mouse" && r({ type: "MENU_POINTERENTER" });
				},
				onKeyDown(e) {
					if (e.defaultPrevented || !nt(e.currentTarget, Ut(e))) return;
					let t = Ut(e);
					if (t?.closest("[role=menu]") !== e.currentTarget && t !== e.currentTarget) return;
					if (e.key === "Tab" && !Dn(e)) {
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
					}, i = n[nn(e, { dir: o("dir") })];
					if (i) {
						i(e), e.stopPropagation(), e.preventDefault();
						return;
					}
					o("typeahead") && Jt(e) && (Qt(e) || tt(t) || (r({
						type: "TYPEAHEAD",
						key: e.key
					}), e.preventDefault()));
				}
			});
		},
		getSeparatorProps() {
			return t.element({
				...Km.separator.attrs,
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
					...Km.item.attrs,
					dir: o("dir"),
					"data-value": s.value,
					role: `menuitem${n}`,
					"aria-checked": !!c.checked,
					"data-state": c.checked ? "checked" : "unchecked",
					onClick(e) {
						if (i || Gt(e) || Wt(e)) return;
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
			let n = b(mi(e)), r = n.checked ? "checked" : "unchecked";
			return t.element({
				...Km.itemIndicator.attrs,
				dir: o("dir"),
				"data-disabled": K(n.disabled),
				"data-highlighted": K(n.highlighted),
				"data-state": ai(e, "checked") ? r : void 0,
				hidden: ai(e, "checked") ? !n.checked : void 0
			});
		},
		getItemTextProps(e) {
			let n = b(mi(e)), r = n.checked ? "checked" : "unchecked";
			return t.element({
				...Km.itemText.attrs,
				dir: o("dir"),
				"data-disabled": K(n.disabled),
				"data-highlighted": K(n.highlighted),
				"data-state": ai(e, "checked") ? r : void 0
			});
		},
		getItemGroupLabelProps(e) {
			return t.element({
				...Km.itemGroupLabel.attrs,
				id: th(s, e.htmlFor),
				dir: o("dir")
			});
		},
		getItemGroupProps(e) {
			return t.element({
				id: Qm(s, e.id),
				...Km.itemGroup.attrs,
				dir: o("dir"),
				"aria-labelledby": th(s, e.id),
				role: "group"
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+menu@1.43.3/node_modules/@zag-js/menu/dist/menu.machine.mjs
var { not: Ih, and: Lh, or: Rh } = _a(), zh = va({
	props({ props: e }) {
		return {
			closeOnSelect: !0,
			typeahead: !0,
			composite: !0,
			loopFocus: !1,
			navigate(e) {
				Nn(e.node);
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
						triggerElement: lh(n, e)
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
			typeaheadState: { ...ur.defaultOptions },
			positioningOverride: {}
		};
	},
	computed: {
		isRtl: ({ prop: e }) => e("dir") === "rtl",
		isTypingAhead: ({ refs: e }) => e.get("typeaheadState").keysSoFar !== "",
		highlightedId: ({ context: e, scope: t, refs: n }) => Ah(n.get("children"), e.get("highlightedValue"), t)
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
					guard: Ih("isSubmenu"),
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
						guard: Rh("isOpenAutoFocusEvent", "isArrowDownEvent"),
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
					guard: Lh(Ih("isTriggerItem"), "isOpenControlled"),
					actions: ["invokeOnClose", "releaseParentRoutingLock"]
				}, {
					guard: Ih("isTriggerItem"),
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
					guard: Lh("isSubmenu", "isOpenControlled"),
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
					guard: Ih("isPointerRoutingLocked"),
					actions: [
						"setHighlightedItem",
						"focusMenu",
						"closeSiblingMenus"
					]
				}, { actions: ["setLastHighlightedItem", "closeSiblingMenus"] }],
				ITEM_POINTERLEAVE: {
					guard: Lh(Ih("isPointerRoutingLocked"), Ih("isTriggerItem")),
					actions: ["clearHighlightedItem"]
				},
				ITEM_CLICK: [
					{
						guard: Lh(Ih("isTriggerItemHighlighted"), Ih("isHighlightedItemEditable"), "closeOnSelect", "isOpenControlled"),
						actions: [
							"invokeOnSelect",
							"setOptionState",
							"closeRootMenu",
							"invokeOnClose",
							"releaseParentRoutingLock"
						]
					},
					{
						guard: Lh(Ih("isTriggerItemHighlighted"), Ih("isHighlightedItemEditable"), "closeOnSelect"),
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
						guard: Lh(Ih("isTriggerItemHighlighted"), Ih("isHighlightedItemEditable")),
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
			isTriggerItem: ({ event: e }) => vh(e.target),
			isTriggerItemHighlighted: ({ event: e, scope: t, computed: n }) => !!(e.target ?? t.getById(n("highlightedId")))?.hasAttribute("data-controls"),
			isSubmenu: ({ context: e }) => e.get("isSubmenu"),
			isPointerRoutingLocked: ({ refs: e }) => e.get("pointerRoutingLocked"),
			isHighlightedItemEditable: ({ scope: e, computed: t }) => tt(e.getById(t("highlightedId"))),
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
				return Ap({ root: e.getRootNode?.() });
			},
			trackPositioning({ context: e, prop: t, scope: n, refs: r }) {
				if (oh(n) || ch(n).length > 0) return;
				let i = {
					...t("positioning"),
					...r.get("positioningOverride")
				};
				return e.set("currentPlacement", i.placement), Ld(() => lh(n, e.get("triggerValue")), () => rh(n), {
					...i,
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			trackInteractOutside({ refs: e, scope: t, prop: n, context: r, send: i }) {
				let a = () => nh(t), o = !0, s = (e) => ch(t).some((t) => nt(t, e));
				return gl(a, {
					type: "menu",
					defer: !0,
					exclude: [ih(t), ...sh(t)].filter(Boolean),
					onInteractOutside: n("onInteractOutside"),
					onRequestDismiss: n("onRequestDismiss"),
					onFocusOutside(t) {
						n("onFocusOutside")?.(t);
						let r = Ut(t.detail.originalEvent);
						if (s(r)) {
							t.preventDefault();
							return;
						}
						if (Sh(r, e.get("children"))) {
							t.preventDefault();
							return;
						}
					},
					onEscapeKeyDown(t) {
						n("onEscapeKeyDown")?.(t), r.get("isSubmenu") && t.preventDefault(), Oh({ parent: e.get("parent") });
					},
					onPointerDownOutside(e) {
						n("onPointerDownOutside")?.(e);
						let t = Ut(e.detail.originalEvent);
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
				return i ? (jh(i, !0), on(t.getDoc(), "pointermove", (t) => {
					kh(e.get("intentPolygon"), {
						x: t.clientX,
						y: t.clientY
					}) || (n({ type: "POINTER_MOVED_AWAY_FROM_SUBMENU" }), jh(i, !1));
				})) : void 0;
			},
			scrollToHighlightedItem({ scope: e, computed: t }) {
				let n = () => {
					Dp() !== "pointer" && tr(e.getById(t("highlightedId")), {
						rootEl: nh(e),
						block: "nearest"
					});
				};
				return q(() => {
					Op("virtual"), n();
				}), Mn(() => nh(e), {
					defer: !0,
					attributes: ["aria-activedescendant"],
					callback: n
				});
			}
		},
		actions: {
			setAnchorPoint({ context: e, event: t }) {
				e.set("anchorPoint", (e) => Zr(e, t.point) ? e : t.point);
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
				let a = () => rh(t), o = r.point ?? e.get("anchorPoint"), s = o ? () => ({
					width: 0,
					height: 0,
					...o
				}) : void 0, c = {
					...n("positioning"),
					...i.get("positioningOverride")
				}, l = r.value ?? e.get("triggerValue");
				Ld(() => lh(t, l), a, {
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
				Ze(i) ? n("navigate")?.({
					value: a,
					node: i,
					href: i.href
				}) : queueMicrotask(() => i.click());
			},
			setIntentPolygon({ context: e, scope: t, event: n }) {
				let r = nh(t), i = e.get("currentPlacement");
				if (!r || !i) return;
				let a = Eh(r.getBoundingClientRect(), i);
				if (!a) return;
				let o = bd(i) === "right" ? -5 : 5;
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
					let e = qm(n);
					r?.send({
						type: "HIGHLIGHTED.SUGGEST",
						value: e
					});
				}
				jh(r, !1);
			},
			unlockParentOnClose({ refs: e, context: t }) {
				Nh(e.get("parent"), t.get("isSubmenu"));
			},
			setHighlightedItem({ context: e, event: t }) {
				let n = t.value || eh(t.target);
				e.set("highlightedValue", n);
			},
			clearHighlightedItem({ context: e }) {
				e.set("highlightedValue", null);
			},
			focusMenu({ scope: e }) {
				q(() => {
					let t = nh(e);
					En({
						root: t,
						enabled: !nt(t, e.getActiveElement()),
						filter(e) {
							return !e.role?.startsWith("menuitem");
						}
					})?.focus({ preventScroll: !0 });
				});
			},
			highlightFirstItem({ context: e, scope: t }) {
				(nh(t) ? queueMicrotask : q)(() => {
					let n = dh(t);
					n && e.set("highlightedValue", eh(n));
				});
			},
			highlightLastItem({ context: e, scope: t }) {
				(nh(t) ? queueMicrotask : q)(() => {
					let n = fh(t);
					n && e.set("highlightedValue", eh(n));
				});
			},
			highlightNextItem({ context: e, scope: t, event: n, prop: r }) {
				let i = mh(t, {
					loop: n.loop,
					value: e.get("highlightedValue"),
					loopFocus: r("loopFocus")
				});
				e.set("highlightedValue", eh(i));
			},
			highlightPrevItem({ context: e, scope: t, event: n, prop: r }) {
				let i = hh(t, {
					loop: n.loop,
					value: e.get("highlightedValue"),
					loopFocus: r("loopFocus")
				});
				e.set("highlightedValue", eh(i));
			},
			invokeOnSelect({ context: e, prop: t, scope: n }) {
				let r = e.get("highlightedValue");
				r != null && (bh(ah(n, r), r), t("onSelect")?.({ value: r }));
			},
			focusTrigger({ scope: e, context: t, event: n }) {
				t.get("isSubmenu") || t.get("anchorPoint") || n.restoreFocus === !1 || queueMicrotask(() => {
					lh(e, t.get("triggerValue"))?.focus({ preventScroll: !0 });
				});
			},
			highlightMatchedItem({ scope: e, context: t, event: n, refs: r }) {
				let i = gh(e, {
					key: n.key,
					value: t.get("highlightedValue"),
					typeaheadState: r.get("typeaheadState")
				});
				i && t.set("highlightedValue", eh(i));
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
				if (!vh(r)) return;
				let i = r?.getAttribute("data-uid"), a = e.get("children");
				for (let e in a) {
					if (e === i) continue;
					let r = a[e], o = r.context.get("intentPolygon");
					o && t.point && Dh(o, t.point) || (nh(n)?.focus({ preventScroll: !0 }), r.send({ type: "CLOSE" }));
				}
			},
			closeRootMenu({ refs: e }) {
				Oh({ parent: e.get("parent") });
			},
			openSubmenu({ refs: e, scope: t, computed: n }) {
				let r = t.getById(n("highlightedId"))?.getAttribute("data-uid"), i = e.get("children");
				(r ? i[r] : null)?.send({ type: "OPEN_AUTOFOCUS" });
			},
			focusParentMenu({ refs: e }) {
				e.get("parent")?.send({ type: "FOCUS_MENU" });
			},
			setLastHighlightedItem({ context: e, event: t }) {
				e.set("lastHighlightedValue", eh(t.target));
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
				t.get("isSubmenu") && Ph(e.get("parent"));
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
}), Bh = (e) => {
	let t = br(), n = uo(), r = F(() => {
		let r = pi(e);
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = La(zh, () => S(r)), a = F(() => Fh(i, ka));
	return () => ({
		api: S(a),
		service: i
	});
}, Vh = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open"
]);
function Hh(t, n) {
	let r = o();
	k(n, !0);
	let i = B(n, "open", 15), a = H(n, Vh), s = F(() => Qa(a)), c = F(() => P(S(s), 2)), l = F(() => S(c)[0]), u = F(() => S(c)[1]), d = F(() => wr()(S(u), [
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
	])), f = F(() => P(S(d), 2)), m = F(() => S(f)[0]), g = F(() => S(f)[1]), _ = Am(), v = Um(), y = F(() => ({
		...S(m),
		id: S(m).id ?? r,
		open: i(),
		onOpenChange(e) {
			S(m).onOpenChange?.(e), i() !== void 0 && i(e.open);
		}
	})), b = Bh(() => S(y)), x = F(() => b().api), C = F(() => b().service), w = Za(() => ({
		present: S(x).open,
		...S(l)
	}));
	h(() => {
		let e = v?.(), t = _?.();
		e && t && (t.setChild(S(C)), S(x).setParent(e));
	});
	let T = F(() => _?.().getTriggerItemProps(S(x)));
	Wm(() => S(T)), Hm(() => S(C)), km(() => S(x)), $a(w);
	var E = {
		get open() {
			return i();
		},
		set open(t) {
			i(t), e();
		}
	}, D = p(), O = V(D);
	return z(O, () => S(g).children ?? ue), R(t, D), L(E);
}
W(Hh, { open: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-trigger.svelte
var Uh = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Wh(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Uh), a = F(() => wr()(i, ["value"])), o = F(() => P(S(a), 2)), s = F(() => S(o)[0]), c = F(() => S(o)[1]), l = Am(), u = Gm(), d = F(() => J(l().getTriggerProps(S(s)), u?.() || {}, S(c)));
	return Y(t, I({
		as: "button",
		"data-scope": "menu",
		"data-part": "trigger"
	}, () => S(d), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(Wh, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Menu.svelte
var Gh = m("<af-tooltip><!></af-tooltip>", 2), Kh = m("<!> <!>", 1), qh = m("<div class=\"af-kit\"><!></div>"), Jh = {
	hash: "svelte-j0sh25",
	code: "af-tooltip.svelte-j0sh25 {display:block;}[data-scope='menu'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='menu'][data-part='content'] {min-width:180px;padding:4px;}[data-scope='menu'][data-part='item'] {padding:6px 10px;border-radius:max(0px, calc(var(--k-radius) - 4px));font-size:13px;line-height:20px;cursor:pointer;}[data-scope='menu'][data-part='item'][data-highlighted] {background:color-mix(in oklab, var(--k-fg) 6%, transparent);}[data-scope='menu'][data-part='item'][data-danger] {color:color-mix(in oklab, var(--k-danger) 78%, var(--k-fg));}[data-scope='menu'][data-part='item'][aria-disabled='true'] {opacity:0.55;cursor:not-allowed;}"
};
function Yh(n, i) {
	k(i, !0), de(n, Jh);
	let a = B(i, "items", 23, () => []), o = B(i, "label", 7, ""), s = i.$$host, c = _(!1), u = _(null);
	C(() => Jl(S(u), S(c), s));
	let f = (e) => e ? { "aria-description": e } : {};
	var m = {
		get items() {
			return a();
		},
		set items(t = []) {
			a(t), e();
		},
		get label() {
			return o();
		},
		set label(t = "") {
			o(t), e();
		}
	}, h = Kh(), g = V(h);
	return Kl(g, {}), Cr(T(g, 2), {
		value: () => s.shadowRoot,
		children: (e, n) => {
			var m = qh(), h = d(m);
			A(h, () => Hh, (e, n) => {
				n(e, {
					positioning: {
						strategy: "fixed",
						placement: "bottom-end"
					},
					onSelect: (e) => {
						let t = (a() ?? []).find((t) => t.id === e.value);
						t && !t.disabled && ql(s, "select", { id: t.id });
					},
					get open() {
						return S(c);
					},
					set open(e) {
						E(c, e, !0);
					},
					children: (e, n) => {
						var s = Kh(), c = V(s);
						{
							let e = F(() => o() ?? "");
							A(c, () => Wh, (t, n) => {
								n(t, {
									part: "trigger",
									class: "af-button ghost",
									get "aria-label"() {
										return S(e);
									},
									children: (e, t) => {
										var n = p(), r = V(n);
										pe(r, i, "default", {}, null), R(e, n);
									},
									$$slots: { default: !0 }
								});
							});
						}
						var m = T(c, 2);
						A(m, () => Vm, (e, n) => {
							n(e, {
								popover: "manual",
								get ref() {
									return S(u);
								},
								set ref(e) {
									E(u, e, !0);
								},
								children: (e, n) => {
									var i = p(), o = V(i);
									A(o, () => Im, (e, n) => {
										n(e, {
											class: "af-overlay menu",
											children: (e, n) => {
												var i = p(), o = V(i);
												{
													let e = (e, n = ue) => {
														var i = p(), o = V(i);
														r(o, 17, () => a() ?? [], (e) => e.id, (e, r) => {
															var i = p(), a = V(i), o = (e) => {
																var n = Gh();
																x(() => N(n, "text", S(r).reason ?? "")), ne(n, 1, "svelte-j0sh25");
																var i = d(n);
																{
																	let e = F(() => f(S(r).reason)), n = F(() => S(r).danger ? "" : void 0);
																	A(i, () => zm, (i, a) => {
																		a(i, I({
																			get value() {
																				return S(r).id;
																			},
																			disabled: !0,
																			part: "item",
																			"aria-disabled": "true"
																		}, () => S(e), {
																			get "data-danger"() {
																				return S(n);
																			},
																			children: (e, n) => {
																				U();
																				var i = l();
																				x(() => t(i, S(r).label)), R(e, i);
																			},
																			$$slots: { default: !0 }
																		}));
																	});
																}
																M(n), R(e, n);
															}, s = (e) => {
																var i = p(), a = V(i);
																{
																	let e = F(() => S(r).danger ? "" : void 0);
																	A(a, () => zm, (i, a) => {
																		a(i, {
																			get value() {
																				return S(r).id;
																			},
																			part: "item",
																			get "data-danger"() {
																				return S(e);
																			},
																			onclickcapture: () => n()().setHighlightedValue(S(r).id),
																			children: (e, n) => {
																				U();
																				var i = l();
																				x(() => t(i, S(r).label)), R(e, i);
																			},
																			$$slots: { default: !0 }
																		});
																	});
																}
																R(e, i);
															};
															b(a, (e) => {
																S(r).disabled ? e(o) : e(s, -1);
															}), R(e, i);
														}), R(e, i);
													};
													A(o, () => Lm, (t, n) => {
														n(t, {
															render: e,
															$$slots: { render: !0 }
														});
													});
												}
												R(e, i);
											},
											$$slots: { default: !0 }
										});
									}), R(e, i);
								},
								$$slots: { default: !0 }
							});
						}), R(e, s);
					},
					$$slots: { default: !0 }
				});
			}), M(m), R(e, m);
		},
		$$slots: { default: !0 }
	}), R(n, h), L(m);
}
W(Yh, {
	items: { type: "Array" },
	label: {
		attribute: "label",
		type: "String"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, ["default"], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+collection@1.43.3/node_modules/@zag-js/collection/dist/chunk-QZ7TP4HQ.mjs
var Xh = Object.defineProperty, Zh = (e, t, n) => t in e ? Xh(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, $ = (e, t, n) => Zh(e, typeof t == "symbol" ? t : t + "", n), Qh = {
	itemToValue(e) {
		return typeof e == "string" ? e : ti(e) && ai(e, "value") ? e.value : "";
	},
	itemToString(e) {
		return typeof e == "string" ? e : ti(e) && ai(e, "label") ? e.label : Qh.itemToValue(e);
	},
	isItemDisabled(e) {
		return ti(e) && ai(e, "disabled") ? !!e.disabled : !1;
	}
}, $h = class e {
	constructor(t) {
		$(this, "options", t), $(this, "items"), $(this, "indexMap", null), $(this, "copy", (t) => new e({
			...this.options,
			items: t ?? [...this.items]
		})), $(this, "isEqual", (e) => Zr(this.items, e.items)), $(this, "setItems", (e) => this.copy(e)), $(this, "getValues", (e = this.items) => {
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
		}), $(this, "sort", (e) => [...e].sort(this.sortFn.bind(this))), $(this, "getItemValue", (e) => e == null ? null : this.options.itemToValue?.(e) ?? Qh.itemToValue(e)), $(this, "getItemDisabled", (e) => e == null ? !1 : this.options.isItemDisabled?.(e) ?? Qh.isItemDisabled(e)), $(this, "stringifyItem", (e) => e == null ? null : this.options.itemToString?.(e) ?? Qh.itemToString(e)), $(this, "stringify", (e) => e == null ? null : this.stringifyItem(this.find(e))), $(this, "stringifyItems", (e, t = ", ") => {
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
				if (!(r && this.getItemValue(a) === t) && !this.getItemDisabled(a) && eg(this.stringifyItem(a), e)) return a;
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
		}), $(this, "insert", (e, ...t) => this.copy(tg(this.items, e, ...t))), $(this, "insertBefore", (e, ...t) => {
			let n = this.indexOf(e);
			if (n === -1) {
				if (this.items.length === 0) n = 0;
				else return this;
			}
			return this.copy(tg(this.items, n, ...t));
		}), $(this, "insertAfter", (e, ...t) => {
			let n = this.indexOf(e);
			if (n === -1) {
				if (this.items.length === 0) n = 0;
				else return this;
			}
			return this.copy(tg(this.items, n + 1, ...t));
		}), $(this, "prepend", (...e) => this.copy(tg(this.items, 0, ...e))), $(this, "append", (...e) => this.copy(tg(this.items, this.items.length, ...e))), $(this, "filter", (e) => {
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
			return n === -1 ? this : this.copy(ng(this.items, [n], t));
		}), $(this, "moveBefore", (e, ...t) => {
			let n = this.items.findIndex((t) => this.getItemValue(t) === e);
			if (n === -1) return this;
			let r = t.map((e) => this.items.findIndex((t) => this.getItemValue(t) === e)).sort((e, t) => e - t);
			return this.copy(ng(this.items, r, n));
		}), $(this, "moveAfter", (e, ...t) => {
			let n = this.items.findIndex((t) => this.getItemValue(t) === e);
			if (n === -1) return this;
			let r = t.map((e) => this.items.findIndex((t) => this.getItemValue(t) === e)).sort((e, t) => e - t);
			return this.copy(ng(this.items, r, n + 1));
		}), $(this, "reorder", (e, t) => this.copy(ng(this.items, [e], t))), $(this, "compareValue", (e, t) => {
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
}, eg = (e, t) => !!e?.toLowerCase().startsWith(t.toLowerCase());
function tg(e, t, ...n) {
	return [
		...e.slice(0, t),
		...n,
		...e.slice(t)
	];
}
function ng(e, t, n) {
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
function rg({ values: e, collection: t, selectedItemMap: n }) {
	let r = [];
	for (let i of e) {
		let e = t.find(i) ?? n.get(i);
		e != null && r.push(e);
	}
	return r;
}
function ig({ selectedItemMap: e, values: t, selectedItems: n, collection: r }) {
	let i = new Map(e);
	for (let e of n) {
		let t = r.getItemValue(e);
		t != null && i.set(t, e);
	}
	let a = new Set(t);
	for (let e of i.keys()) a.has(e) || i.delete(e);
	return i;
}
function ag({ values: e, collection: t, selectedItemMap: n }) {
	let r = rg({
		values: e,
		collection: t,
		selectedItemMap: n
	});
	return {
		selectedItems: r,
		nextSelectedItemMap: ig({
			selectedItemMap: n,
			values: e,
			selectedItems: r,
			collection: t
		})
	};
}
function og({ selectedItems: e, collection: t }) {
	return ig({
		selectedItemMap: /* @__PURE__ */ new Map(),
		values: e.map((e) => t.getItemValue(e)).filter(Boolean),
		selectedItems: e,
		collection: t
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/collection/list-collection.js
var sg = (e) => new $h(e), [cg, lg] = vr({
	name: "ComboboxContext",
	hookName: "useComboboxContext",
	providerName: "<ComboboxProvider />"
}), ug = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function dg(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, ug), o = lg(), s = eo(), c = F(() => J(o().getContentProps(), s().getPresenceProps(), i));
	function l(e) {
		s().setNode(e);
	}
	var u = {
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	}, d = p(), f = V(d), m = (e) => {
		Y(e, I({ as: "div" }, () => S(c), {
			[a()]: l,
			get ref() {
				return r();
			},
			set ref(e) {
				r(e);
			}
		}));
	}, h = F(() => !s().unmounted);
	return b(f, (e) => {
		S(h) && e(m);
	}), R(t, d), L(u);
}
W(dg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+combobox@1.43.3/node_modules/@zag-js/combobox/dist/combobox.anatomy.mjs
var fg = cc("combobox").parts("root", "clearTrigger", "content", "control", "input", "item", "itemGroup", "itemGroupLabel", "itemIndicator", "itemText", "label", "list", "positioner", "trigger"), pg = fg.build(), mg = (e) => new $h(e);
mg.empty = () => new $h({ items: [] });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+combobox@1.43.3/node_modules/@zag-js/combobox/dist/combobox.dom.mjs
var hg = (e) => e.ids?.root ?? `combobox:${e.id}`, gg = (e) => e.ids?.label ?? `combobox:${e.id}:label`, _g = (e) => e.ids?.control ?? `combobox:${e.id}:control`, vg = (e) => e.ids?.input ?? `combobox:${e.id}:input`, yg = (e) => e.ids?.content ?? `combobox:${e.id}:content`, bg = (e) => e.ids?.positioner ?? `combobox:${e.id}:popper`, xg = (e) => e.ids?.trigger ?? `combobox:${e.id}:toggle-btn`, Sg = (e) => e.ids?.clearTrigger ?? `combobox:${e.id}:clear-btn`, Cg = (e, t) => e.ids?.itemGroup?.(t) ?? `combobox:${e.id}:optgroup:${t}`, wg = (e, t) => e.ids?.itemGroupLabel?.(t) ?? `combobox:${e.id}:optgroup-label:${t}`, Tg = (e, t) => e.ids?.item?.(t) ?? `combobox:${e.id}:option:${t}`, Eg = (e) => e.getById(yg(e)), Dg = (e) => e.getById(vg(e)), Og = (e) => e.getById(bg(e)), kg = (e) => e.getById(_g(e)), Ag = (e) => e.getById(xg(e)), jg = (e) => e.getById(Sg(e)), Mg = (e, t) => {
	if (t == null) return null;
	let n = `[role=option][data-value="${CSS.escape(t)}"]`;
	return Xn(Eg(e), n);
}, Ng = (e) => {
	let t = Dg(e);
	e.isActiveElement(t) || t?.focus({ preventScroll: !0 }), Ae(t);
}, Pg = (e) => {
	let t = Ag(e);
	e.isActiveElement(t) || t?.focus({ preventScroll: !0 });
}, Fg = {
	triggerLabel: "Toggle suggestions",
	clearTriggerLabel: "Clear value"
};
function Ig(e, t) {
	let { context: n, prop: r, state: i, send: a, scope: o, computed: s } = e, c = Mi(Fg, r("translations")), l = r("collection"), u = !!r("disabled"), d = s("isInteractive"), f = !!r("invalid"), p = !!r("required"), m = !!r("readOnly"), h = i.hasTag("open"), g = i.hasTag("focused"), _ = r("composite"), v = n.get("highlightedValue"), y = n.get("currentPlacement"), b = y ? bd(y) : void 0, x = zd({
		...r("positioning"),
		placement: y
	});
	function S(e) {
		let t = l.getItemDisabled(e.item), r = l.getItemValue(e.item);
		return Bi(r, () => `[zag-js] No value found for item ${JSON.stringify(e.item)}`), {
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
			Dg(o)?.focus();
		},
		setOpen(e, t = "script") {
			i.hasTag("open") !== e && a({
				type: e ? "OPEN" : "CLOSE",
				src: t
			});
		},
		getRootProps() {
			return t.element({
				...pg.root.attrs,
				dir: r("dir"),
				id: hg(o),
				"data-invalid": K(f),
				"data-readonly": K(m)
			});
		},
		getLabelProps() {
			return t.label({
				...pg.label.attrs,
				dir: r("dir"),
				htmlFor: vg(o),
				id: gg(o),
				"data-readonly": K(m),
				"data-disabled": K(u),
				"data-invalid": K(f),
				"data-required": K(p),
				"data-focus": K(g),
				onClick(e) {
					_ || (e.preventDefault(), Ag(o)?.focus({ preventScroll: !0 }));
				}
			});
		},
		getControlProps() {
			return t.element({
				...pg.control.attrs,
				dir: r("dir"),
				id: _g(o),
				"data-state": h ? "open" : "closed",
				"data-focus": K(g),
				"data-disabled": K(u),
				"data-invalid": K(f)
			});
		},
		getPositionerProps() {
			return t.element({
				...pg.positioner.attrs,
				dir: r("dir"),
				id: bg(o),
				style: x.floating
			});
		},
		getInputProps() {
			return t.input({
				...pg.input.attrs,
				dir: r("dir"),
				"aria-invalid": Fe(f),
				"data-invalid": K(f),
				"data-autofocus": K(r("autoFocus")),
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
				id: vg(o),
				type: "text",
				role: "combobox",
				defaultValue: n.get("inputValue"),
				"aria-autocomplete": s("autoComplete") ? "both" : "list",
				"aria-controls": yg(o),
				"aria-expanded": h,
				"data-state": h ? "open" : "closed",
				"aria-activedescendant": v ? Tg(o, v) : void 0,
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
					if (e.defaultPrevented || !d || e.ctrlKey || e.shiftKey || Kt(e)) return;
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
							let c = Mg(o, v);
							Ze(c) && r("navigate")?.({
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
					}[nn(e, { dir: r("dir") })];
					i?.(e);
				}
			});
		},
		getTriggerProps(e = {}) {
			return t.button({
				...pg.trigger.attrs,
				dir: r("dir"),
				id: xg(o),
				"aria-haspopup": _ ? "listbox" : "dialog",
				type: "button",
				tabIndex: e.focusable ? void 0 : -1,
				"aria-label": c.triggerLabel,
				"aria-expanded": h,
				"data-state": h ? "open" : "closed",
				"aria-controls": h ? yg(o) : void 0,
				disabled: u,
				"data-invalid": K(f),
				"data-focusable": K(e.focusable),
				"data-readonly": K(m),
				"data-disabled": K(u),
				onFocus() {
					e.focusable && a({
						type: "INPUT.FOCUS",
						src: "trigger"
					});
				},
				onClick(e) {
					e.defaultPrevented || d && Xt(e) && a({
						type: "TRIGGER.CLICK",
						src: "trigger-click"
					});
				},
				onPointerDown(e) {
					d && e.pointerType !== "touch" && Xt(e) && (e.preventDefault(), queueMicrotask(() => {
						Ng(o);
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
					}[nn(e, { dir: r("dir") })];
					t && (t(e), e.preventDefault());
				}
			});
		},
		getContentProps() {
			return t.element({
				...pg.content.attrs,
				dir: r("dir"),
				id: yg(o),
				role: _ ? "listbox" : "dialog",
				tabIndex: -1,
				hidden: !h,
				"data-state": h ? "open" : "closed",
				"data-placement": y,
				"data-side": b,
				"aria-labelledby": gg(o),
				"aria-multiselectable": r("multiple") && _ ? !0 : void 0,
				"data-empty": K(l.size === 0),
				onPointerDown(e) {
					Xt(e) && e.preventDefault();
				}
			});
		},
		getListProps() {
			return t.element({
				...pg.list.attrs,
				role: _ ? void 0 : "listbox",
				"data-empty": K(l.size === 0),
				"aria-labelledby": gg(o),
				"aria-multiselectable": r("multiple") && !_ ? !0 : void 0
			});
		},
		getClearTriggerProps() {
			return t.button({
				...pg.clearTrigger.attrs,
				dir: r("dir"),
				id: Sg(o),
				type: "button",
				tabIndex: -1,
				disabled: u,
				"data-invalid": K(f),
				"aria-label": c.clearTriggerLabel,
				"aria-controls": vg(o),
				hidden: !n.get("value").length,
				onPointerDown(e) {
					Xt(e) && e.preventDefault();
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
				...pg.item.attrs,
				dir: r("dir"),
				id: Tg(o, i),
				role: "option",
				tabIndex: -1,
				"data-highlighted": K(n.highlighted),
				"data-state": n.selected ? "checked" : "unchecked",
				"aria-selected": Fe(n.selected),
				"aria-disabled": Fe(n.disabled),
				"data-disabled": K(n.disabled),
				"data-value": n.value,
				onPointerMove() {
					n.disabled || Dp() === "pointer" && (n.highlighted || a({
						type: "ITEM.POINTER_MOVE",
						value: i
					}));
				},
				onPointerLeave() {
					e.persistFocus || n.disabled || Dp() === "pointer" && a({
						type: "ITEM.POINTER_LEAVE",
						value: i
					});
				},
				onClick(e) {
					Gt(e) || Wt(e) || Zt(e) || n.disabled || a({
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
				...pg.itemText.attrs,
				dir: r("dir"),
				"data-state": n.selected ? "checked" : "unchecked",
				"data-disabled": K(n.disabled),
				"data-highlighted": K(n.highlighted)
			});
		},
		getItemIndicatorProps(e) {
			let n = S(e);
			return t.element({
				"aria-hidden": !0,
				...pg.itemIndicator.attrs,
				dir: r("dir"),
				"data-state": n.selected ? "checked" : "unchecked",
				hidden: !n.selected
			});
		},
		getItemGroupProps(e) {
			let { id: n } = e;
			return t.element({
				...pg.itemGroup.attrs,
				dir: r("dir"),
				id: Cg(o, n),
				"aria-labelledby": wg(o, n),
				"data-empty": K(l.size === 0),
				role: "group"
			});
		},
		getItemGroupLabelProps(e) {
			let { htmlFor: n } = e;
			return t.element({
				...pg.itemGroupLabel.attrs,
				dir: r("dir"),
				id: wg(o, n),
				role: "presentation"
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+combobox@1.43.3/node_modules/@zag-js/combobox/dist/combobox.machine.mjs
var { guards: Lg, createMachine: Rg, choose: zg } = ya(), { and: Bg, not: Vg } = Lg, Hg = Rg({
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
				Nn(e);
			},
			collection: mg.empty(),
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
				isEqual: Zr,
				hash(e) {
					return e.join(",");
				},
				onChange(t) {
					let r = n(), i = e("collection"), a = ag({
						values: t,
						collection: i,
						selectedItemMap: r.get("selectedItemMap")
					}), o = e("value") ?? t, s = o === t ? a : ag({
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
					t = yi(e("selectionBehavior"), {
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
			selectedItemMap: t(() => ({ defaultValue: og({
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
		selectedItems: ({ context: e, prop: t }) => rg({
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
	entry: zg([{
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
								guard: Bg("isOpenControlled", "openOnChange"),
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
							guard: Bg("isCustomValue", Vg("allowCustomValue")),
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
								guard: Bg("isOpenControlled", "autoComplete"),
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
								guard: Bg("isOpenControlled", "autoComplete"),
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
						guard: Bg("isOpenControlled", "isCustomValue", Vg("hasHighlightedItem"), Vg("allowCustomValue")),
						actions: ["revertInputValue", "invokeOnClose"]
					},
					{
						guard: Bg("isCustomValue", Vg("hasHighlightedItem"), Vg("allowCustomValue")),
						target: "closed.focused",
						actions: ["revertInputValue", "invokeOnClose"]
					},
					{
						guard: Bg("isOpenControlled", "closeOnSelect"),
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
						guard: Bg("isOpenControlled", "closeOnSelect"),
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
						guard: Bg("isOpenControlled", "isCustomValue", Vg("allowCustomValue")),
						actions: ["revertInputValue", "invokeOnClose"]
					},
					{
						guard: Bg("isCustomValue", Vg("allowCustomValue")),
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
						guard: Bg("autoComplete", "isLastItemHighlighted"),
						actions: ["clearHighlightedValue", "scrollContentToTop"]
					}, { actions: ["highlightNextItem"] }],
					"INPUT.ARROW_UP": [{
						guard: Bg("autoComplete", "isFirstItemHighlighted"),
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
							guard: Bg("isOpenControlled", "autoComplete"),
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
							guard: Bg("isHighlightedItemRemoved", "hasCollectionItems", "autoHighlight"),
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
				return $r(n) ? n : !!n?.({ inputValue: t.get("inputValue") });
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
				return Ap({ root: e.getRootNode?.() });
			},
			trackDismissableLayer({ send: e, prop: t, scope: n }) {
				return t("disableLayer") ? void 0 : gl(() => Eg(n), {
					type: "listbox",
					defer: !0,
					exclude: () => [
						Dg(n),
						Ag(n),
						jg(n)
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
				let n = Nf({
					level: "assertive",
					document: t.getDoc()
				});
				return e.set("liveRegion", n), () => n.destroy();
			},
			trackPlacement({ context: e, prop: t, scope: n }) {
				return e.set("currentPlacement", t("positioning").placement), Ld(() => kg(n) || Ag(n), () => Og(n), {
					...t("positioning"),
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			scrollToHighlightedItem({ context: e, prop: t, scope: n }) {
				let r = Dg(n), i = [], a = (r) => {
					if (Dp() === "pointer") return;
					let a = e.get("highlightedValue");
					if (!a) return;
					let o = Eg(n), s = t("scrollToIndexFn");
					if (s) {
						s({
							index: t("collection").indexOf(a),
							immediate: r,
							getElement: () => Mg(n, a)
						});
						return;
					}
					let c = Mg(n, a), l = q(() => {
						tr(c, {
							rootEl: o,
							block: "nearest"
						});
					});
					i.push(l);
				}, o = q(() => {
					Op("virtual"), a(!0);
				});
				i.push(o);
				let s = Mn(r, {
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
				Ld(() => kg(n), () => Og(n), {
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
				let a = n("multiple") ? Ur(t.get("value"), i) : [i];
				n("onSelect")?.({
					value: a,
					itemValue: i
				}), t.set("value", a);
				let o = yi(n("selectionBehavior"), {
					preserve: t.get("inputValue"),
					replace: r.stringifyMany(a),
					clear: ""
				});
				t.set("inputValue", o);
			},
			scrollToHighlightedItem({ context: e, prop: t, scope: n }) {
				kn(() => {
					let r = e.get("highlightedValue");
					if (r == null) return;
					let i = Mg(n, r), a = Eg(n), o = t("scrollToIndexFn");
					if (o) {
						o({
							index: t("collection").indexOf(r),
							immediate: !0,
							getElement: () => Mg(n, r)
						});
						return;
					}
					tr(i, {
						rootEl: a,
						block: "nearest"
					});
				});
			},
			selectItem(e) {
				let { context: t, event: n, flush: r, prop: i } = e;
				n.value != null && r(() => {
					let e = i("multiple") ? Ur(t.get("value"), n.value) : [n.value];
					i("onSelect")?.({
						value: e,
						itemValue: n.value
					}), t.set("value", e);
					let r = yi(i("selectionBehavior"), {
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
					let e = Vr(t.get("value"), n.value);
					t.set("value", e);
					let r = yi(i("selectionBehavior"), {
						preserve: t.get("inputValue"),
						replace: i("collection").stringifyMany(e),
						clear: ""
					});
					t.set("inputValue", r);
				});
			},
			setInitialFocus({ scope: e }) {
				q(() => {
					Ng(e);
				});
			},
			setFinalFocus({ scope: e }) {
				q(() => {
					Ag(e)?.dataset.focusable == null ? Ng(e) : Pg(e);
				});
			},
			syncInputValue({ context: e, scope: t, event: n }) {
				let r = Dg(t);
				r && (r.value = e.get("inputValue"), queueMicrotask(() => {
					n.current().type !== "INPUT.CHANGE" && Ae(r);
				}));
			},
			setInputValue({ context: e, event: t }) {
				e.set("inputValue", t.value);
			},
			clearInputValue({ context: e }) {
				e.set("inputValue", "");
			},
			revertInputValue({ context: e, prop: t, computed: n }) {
				let r = yi(t("selectionBehavior"), {
					replace: n("hasSelectedItems") ? n("valueAsString") : "",
					preserve: e.get("inputValue"),
					clear: ""
				});
				e.set("inputValue", r);
			},
			setValue(e) {
				let { context: t, flush: n, event: r, prop: i } = e;
				n(() => {
					t.set("value", r.value);
					let e = yi(i("selectionBehavior"), {
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
					let e = yi(r("selectionBehavior"), {
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
						getElement: () => Mg(t, r)
					});
				} else {
					let e = Eg(t);
					if (!e) return;
					e.scrollTop = 0;
				}
			},
			invokeOnOpen({ prop: e, event: t, context: n }) {
				let r = Ug(t);
				e("onOpenChange")?.({
					open: !0,
					reason: r,
					value: n.get("value")
				});
			},
			invokeOnClose({ prop: e, event: t, context: n }) {
				let r = Ug(t);
				e("onOpenChange")?.({
					open: !1,
					reason: r,
					value: n.get("value")
				});
			},
			highlightFirstItem({ context: e, prop: t, scope: n }) {
				(Eg(n) ? queueMicrotask : q)(() => {
					let n = t("collection").firstValue;
					n && e.set("highlightedValue", n);
				});
			},
			highlightFirstItemIfNeeded({ computed: e, action: t }) {
				e("autoHighlight") && t(["highlightFirstItem"]);
			},
			highlightLastItem({ context: e, prop: t, scope: n }) {
				(Eg(n) ? queueMicrotask : q)(() => {
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
				q(() => {
					let [n] = t("collection").sort(e.get("value"));
					n && e.set("highlightedValue", n);
				});
			},
			highlightFirstOrSelectedItem({ context: e, prop: t, computed: n }) {
				q(() => {
					let r = null;
					r = n("hasSelectedItems") ? t("collection").sort(e.get("value"))[0] : t("collection").firstValue, r && e.set("highlightedValue", r);
				});
			},
			highlightLastOrSelectedItem({ context: e, prop: t, computed: n }) {
				q(() => {
					let r = t("collection"), i = null;
					i = n("hasSelectedItems") ? r.sort(e.get("value"))[0] : r.lastValue, i && e.set("highlightedValue", i);
				});
			},
			autofillInputValue({ context: e, computed: t, prop: n, event: r, scope: i }) {
				let a = Dg(i), o = n("collection");
				if (!t("autoComplete") || !a || !r.keypress) return;
				let s = o.stringify(e.get("highlightedValue"));
				q(() => {
					a.value = s || e.get("inputValue");
				});
			},
			syncSelectedItems(e) {
				queueMicrotask(() => {
					let { context: t, prop: n } = e, r = n("collection"), i = t.get("value"), a = ag({
						values: i,
						collection: r,
						selectedItemMap: t.get("selectedItemMap")
					});
					t.set("selectedItemMap", a.nextSelectedItemMap);
					let o = yi(n("selectionBehavior"), {
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
				if (!Lt()) return;
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
function Ug(e) {
	return (e.previousEvent || e).src;
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox.anatomy.js
var Wg = fg.extendWith("empty"), Gg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Kg(t, n) {
	k(n, !0);
	let r = Wg.build(), i = B(n, "ref", 15, null), a = H(n, Gg), o = lg(), s = F(() => o().collection.size === 0);
	var c = {
		get ref() {
			return i();
		},
		set ref(t = null) {
			i(t), e();
		}
	}, l = p(), u = V(l), d = (e) => {
		Y(e, I({ as: "div" }, () => r.empty.attrs, () => a, {
			role: "presentation",
			get ref() {
				return i();
			},
			set ref(e) {
				i(e);
			}
		}));
	};
	return b(u, (e) => {
		S(s) && e(d);
	}), R(t, l), L(c);
}
W(Kg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox-control.svelte
var qg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Jg(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, qg), a = lg(), o = F(() => J(a().getControlProps(), i));
	return Y(t, I({ as: "div" }, () => S(o), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(Jg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox-input.svelte
var Yg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Xg(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Yg), a = lg(), o = F(() => J(a().getInputProps(), i));
	return Y(t, I({ as: "input" }, () => S(o), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(Xg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/use-combobox-item-context.js
var [Zg, Qg] = vr({
	name: "ComboboxItemContext",
	hookName: "useComboboxItemContext",
	providerName: "<ComboboxItemProvider />"
}), [$g, e_] = vr({
	name: "ComboboxItemPropsContext",
	hookName: "useComboboxItemPropsContext",
	providerName: "<ComboboxItemPropsProvider />"
}), t_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function n_(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, t_), a = F(() => wr()(i, ["item", "persistFocus"])), o = F(() => P(S(a), 2)), s = F(() => S(o)[0]), c = F(() => S(o)[1]), l = lg(), u = F(() => l().getItemState(S(s))), d = F(() => J(l().getItemProps(S(s)), S(c)));
	return Zg(() => S(u)), $g(() => S(s)), Y(t, I({ as: "div" }, () => S(d), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(n_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox-positioner.svelte
var r_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function i_(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, r_), a = lg(), o = eo(), s = F(() => J(a().getPositionerProps(), i));
	var c = {
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	}, l = p(), u = V(l), d = (e) => {
		Y(e, I({ as: "div" }, () => S(s), {
			get ref() {
				return r();
			},
			set ref(e) {
				r(e);
			}
		}));
	}, f = F(() => !o().unmounted);
	return b(u, (e) => {
		S(f) && e(d);
	}), R(t, l), L(c);
}
W(i_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/field/use-field-context.js
var [a_, o_] = vr({
	name: "FieldContext",
	strict: !1
}), s_ = (e) => {
	let t = br(), n = uo(), r = o_(), i = F(() => {
		let i = pi(e), a = pi(i.collection);
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
	}), a = La(Hg, () => S(i)), o = F(() => Ig(a, ka));
	return () => S(o);
}, c_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"open",
	"value",
	"inputValue"
]);
function l_(t, n) {
	let r = o();
	k(n, !0);
	let i = B(n, "ref", 15, null), a = B(n, "open", 15), s = B(n, "value", 15), c = B(n, "inputValue", 15), l = H(n, c_), u = F(() => Qa(l)), d = F(() => P(S(u), 2)), f = F(() => S(d)[0]), p = F(() => S(d)[1]), m = F(() => wr()(S(p), /* @__PURE__ */ "allowCustomValue.alwaysSubmitOnEnter.autoFocus.closeOnSelect.collection.composite.defaultHighlightedValue.defaultInputValue.defaultOpen.defaultValue.disabled.disableLayer.form.highlightedValue.id.ids.inputBehavior.inputValue.invalid.loopFocus.multiple.name.navigate.onFocusOutside.onHighlightChange.onInputValueChange.onInteractOutside.onOpenChange.onPointerDownOutside.onSelect.onValueChange.open.openOnChange.openOnClick.openOnKeyPress.placeholder.positioning.readOnly.required.scrollToIndexFn.selectionBehavior.translations.value".split("."))), h = F(() => P(S(m), 2)), g = F(() => S(h)[0]), _ = F(() => S(h)[1]), v = F(() => ({
		...S(g),
		id: S(g).id ?? r,
		open: a(),
		value: s(),
		inputValue: c(),
		onOpenChange(e) {
			S(g).onOpenChange?.(e), a() !== void 0 && a(e.open);
		},
		onValueChange(e) {
			S(g).onValueChange?.(e), s() !== void 0 && s(e.value);
		},
		onInputValueChange(e) {
			S(g).onInputValueChange?.(e), c() !== void 0 && c(e.inputValue);
		}
	})), y = s_(() => S(v)), b = Za(() => ({
		present: y().open,
		...S(f)
	})), x = F(() => J(y().getRootProps(), S(_)));
	return cg(y), $a(b), Y(t, I({ as: "div" }, () => S(x), {
		get ref() {
			return i();
		},
		set ref(e) {
			i(e);
		}
	})), L({
		get ref() {
			return i();
		},
		set ref(t = null) {
			i(t), e();
		},
		get open() {
			return a();
		},
		set open(t) {
			a(t), e();
		},
		get value() {
			return s();
		},
		set value(t) {
			s(t), e();
		},
		get inputValue() {
			return c();
		},
		set inputValue(t) {
			c(t), e();
		}
	});
}
W(l_, {
	ref: {},
	open: {},
	value: {},
	inputValue: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/PersonPicker.svelte
var u_ = (e) => e.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
function d_(e) {
	let t = e.trim().split(/\s+/).filter(Boolean).map((e) => Array.from(e)[0].toUpperCase());
	return t.length === 0 ? "" : t.length === 1 ? t[0] : t[0] + t[t.length - 1];
}
var f_ = m("<img alt=\"\"/>"), p_ = m("<span class=\"af-avatar\"><!></span>"), m_ = m("<span class=\"af-chip svelte-akzd1x\" part=\"chip\"><!> <span> </span> <button type=\"button\" part=\"remove\" class=\"svelte-akzd1x\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button></span>"), h_ = m("<span class=\"lead svelte-akzd1x\"><!></span>"), g_ = m("<button type=\"button\" part=\"clear\" class=\"af-button ghost svelte-akzd1x\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button>"), __ = m("<!> <!> <!>", 1), v_ = m("<span class=\"mail\"> </span>"), y_ = m("<!> <span class=\"who\"><span class=\"name\"> </span> <!></span>", 1), b_ = m("<!> <!>", 1), x_ = m("<div class=\"af-kit\"><!></div>"), S_ = {
	hash: "svelte-akzd1x",
	code: "[part='chip'].svelte-akzd1x button:where(.svelte-akzd1x), [part='clear'].svelte-akzd1x {display:inline-grid;flex:none;place-items:center;width:24px;height:24px;min-height:0;padding:0;border:0;border-radius:max(0px, calc(var(--k-radius) - 4px));background:transparent;color:var(--k-muted);cursor:pointer;}[part='chip'].svelte-akzd1x button:where(.svelte-akzd1x):hover:not(:disabled), [part='clear'].svelte-akzd1x:hover {background:color-mix(in oklab, var(--k-fg) 7%, transparent);color:var(--k-fg);}[part='chip'].svelte-akzd1x button:where(.svelte-akzd1x):focus-visible, [part='clear'].svelte-akzd1x:focus-visible {outline:2px solid var(--k-ring);outline-offset:-2px;}[part='chip'].svelte-akzd1x {padding-right:2px;}.lead.svelte-akzd1x {display:inline-flex;}[data-scope='combobox'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='combobox'][hidden] {display:none !important;}[data-scope='combobox'][data-part='control'] {display:flex;flex-wrap:wrap;align-items:center;gap:4px;min-width:14em;min-height:32px;padding:2px 6px;border:1px solid color-mix(in oklab, var(--k-line), var(--k-fg) 40%);border-radius:max(0px, calc(var(--k-radius) - 2px));background:var(--k-surface);}[data-scope='combobox'][data-part='control']:focus-within {outline:2px solid var(--k-ring);outline-offset:2px;}[data-scope='combobox'][data-part='input'] {flex:1;min-width:6em;border:0;outline:none;background:transparent;color:inherit;font:inherit;}[data-scope='combobox'][data-part='input']::placeholder {color:var(--k-muted);}[data-scope='combobox'][data-part='content'] {max-height:280px;overflow:auto;padding:4px;}[data-scope='combobox'][data-part='item'] {display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:4px;cursor:pointer;}[data-scope='combobox'][data-part='item'][data-highlighted] {background:color-mix(in oklab, var(--k-primary) 10%, transparent);}[data-scope='combobox'][data-part='item'][data-state='checked'] {font-weight:600;}[data-scope='combobox'][data-part='item'] .who {display:flex;flex-direction:column;min-width:0;}[data-scope='combobox'][data-part='item'] .mail {color:var(--k-muted);font-size:12px;}[data-scope='combobox'][data-part='empty'] {padding:8px;color:var(--k-muted);}"
};
function C_(n, i) {
	k(i, !0), de(n, S_);
	let a = (e, n = ue) => {
		var r = p_(), i = d(r), a = (e) => {
			var t = f_();
			x(() => G(t, "src", n().avatar)), R(e, t);
		}, o = (e) => {
			var r = l();
			x((e) => t(r, e), [() => d_(n().name)]), R(e, r);
		}, s = F(() => S(N).has(n().id)), c = (e) => {
			var t = l("?");
			R(e, t);
		};
		b(i, (e) => {
			n().avatar ? e(a) : S(s) ? e(o, 1) : e(c, -1);
		}), M(r), R(e, r);
	}, o = B(i, "people", 23, () => []), s = B(i, "value", 7, null), c = B(i, "multiple", 7, !1), f = B(i, "placeholder", 7, null), m = B(i, "label", 7, null), h = B(i, "loading", 7, !1), g = B(i, "locale", 7, null), y = B(i, "disabled", 7, !1), w = B(i, "strings", 7, null), D = i.$$host, O = F(() => tu(g(), w() ?? void 0)), j = F(() => {
		let e = /* @__PURE__ */ new Set();
		return (o() ?? []).filter((t) => !e.has(t.id) && !!e.add(t.id));
	}), N = F(() => new Map(S(j).map((e) => [e.id, e]))), P = F(() => [...new Set(Array.isArray(s()) ? s() : s() ? [s()] : [])]), ee = _(null), te = F(() => S(P).filter((e) => !S(N).has(e))), ne = (e) => S(N).get(e)?.name ?? (h() ? "…" : S(j).length === 0 ? "" : S(te).length > 1 ? `${S(O).unknownPerson} ${S(te).indexOf(e) + 1}` : S(O).unknownPerson), I = F(() => S(ee) ?? (c() || !S(P)[0] ? "" : S(N).has(S(P)[0]) ? S(N).get(S(P)[0]).name : h() ? "" : ne(S(P)[0]))), z = F(() => u_((S(ee) ?? "").trim())), re = F(() => S(z) === "" ? S(j) : S(j).filter((e) => u_(e.name).includes(S(z)) || u_(e.email ?? "").includes(S(z)))), ie = F(() => sg({
		items: S(re),
		itemToValue: (e) => e.id,
		itemToString: (e) => e.name
	})), ae = _(!1), oe = _(null);
	C(() => Jl(S(oe), S(ae), D));
	let H = (e) => ql(D, "change", { value: c() ? e : e[0] ?? null });
	var se = {
		get people() {
			return o();
		},
		set people(t = []) {
			o(t), e();
		},
		get value() {
			return s();
		},
		set value(t = null) {
			s(t), e();
		},
		get multiple() {
			return c();
		},
		set multiple(t = !1) {
			c(t), e();
		},
		get placeholder() {
			return f();
		},
		set placeholder(t = null) {
			f(t), e();
		},
		get label() {
			return m();
		},
		set label(t = null) {
			m(t), e();
		},
		get loading() {
			return h();
		},
		set loading(t = !1) {
			h(t), e();
		},
		get locale() {
			return g();
		},
		set locale(t = null) {
			g(t), e();
		},
		get disabled() {
			return y();
		},
		set disabled(t = !1) {
			y(t), e();
		},
		get strings() {
			return w();
		},
		set strings(t = null) {
			w(t), e();
		}
	}, ce = b_(), W = V(ce);
	return Kl(W, {}), Cr(T(W, 2), {
		value: () => D.shadowRoot,
		children: (e, n) => {
			var i = x_(), o = d(i), s = () => S(P), h = () => S(I);
			{
				let e = F(() => !!c()), n = F(() => !!y());
				A(o, () => l_, (i, o) => {
					o(i, {
						get collection() {
							return S(ie);
						},
						get multiple() {
							return S(e);
						},
						get disabled() {
							return S(n);
						},
						inputBehavior: "autohighlight",
						positioning: {
							strategy: "fixed",
							placement: "bottom-start"
						},
						get value() {
							return s();
						},
						set value(e) {},
						get inputValue() {
							return h();
						},
						set inputValue(e) {},
						onValueChange: (e) => H(e.value),
						onInputValueChange: (e) => {
							if (e.reason !== "input-change") {
								E(ee, null);
								return;
							}
							E(ee, e.inputValue, !0), ql(D, "search", { query: e.inputValue });
						},
						onOpenChange: (e) => {
							e.open || E(ee, null);
						},
						get open() {
							return S(ae);
						},
						set open(e) {
							E(ae, e, !0);
						},
						children: (e, n) => {
							var i = b_(), o = V(i);
							A(o, () => Jg, (e, n) => {
								n(e, {
									part: "control",
									children: (e, n) => {
										var i = __(), o = V(i), s = (e) => {
											var n = p(), i = V(n);
											r(i, 16, () => S(P), (e) => e, (e, n) => {
												let r = F(() => S(N).get(n) ?? {
													id: n,
													name: ne(n)
												});
												var i = m_(), o = d(i);
												a(o, () => S(r));
												var s = T(o, 2), c = u(s, !0), l = T(s, 2);
												M(i), x(() => {
													t(c, S(r).name), G(l, "aria-label", `${S(O).remove ?? ""}: ${S(r).name ?? ""}`), l.disabled = !!y();
												}), v("click", l, () => H(S(P).filter((e) => e !== n))), R(e, i);
											}), R(e, n);
										}, l = (e) => {
											let t = F(() => S(N).get(S(P)[0]) ?? {
												id: S(P)[0],
												name: ne(S(P)[0])
											});
											var n = h_(), r = d(n);
											a(r, () => S(t)), M(n), R(e, n);
										};
										b(o, (e) => {
											c() ? e(s) : S(P)[0] && e(l, 1);
										});
										var h = T(o, 2);
										{
											let e = F(() => f() ?? ""), t = F(() => m() || void 0);
											A(h, () => Xg, (n, r) => {
												r(n, {
													part: "input",
													autocomplete: "off",
													spellcheck: "false",
													get placeholder() {
														return S(e);
													},
													get "aria-label"() {
														return S(t);
													}
												});
											});
										}
										var g = T(h, 2), _ = (e) => {
											var t = g_();
											x(() => G(t, "aria-label", S(O).clear)), v("click", t, () => H([])), R(e, t);
										};
										b(g, (e) => {
											!c() && S(P)[0] && !y() && e(_);
										}), R(e, i);
									},
									$$slots: { default: !0 }
								});
							});
							var s = T(o, 2);
							A(s, () => i_, (e, n) => {
								n(e, {
									popover: "manual",
									get ref() {
										return S(oe);
									},
									set ref(e) {
										E(oe, e, !0);
									},
									children: (e, n) => {
										var i = p(), o = V(i);
										A(o, () => dg, (e, n) => {
											n(e, {
												class: "af-overlay people",
												part: "content",
												children: (e, n) => {
													var i = b_(), o = V(i);
													r(o, 17, () => S(ie).items, (e) => e.id, (e, n) => {
														var r = p(), i = V(r);
														A(i, () => n_, (e, r) => {
															r(e, {
																get item() {
																	return S(n);
																},
																part: "option",
																children: (e, r) => {
																	var i = y_(), o = V(i);
																	a(o, () => S(n));
																	var s = T(o, 2), c = d(s), l = u(c, !0), f = T(c, 2), p = (e) => {
																		var r = v_(), i = u(r, !0);
																		x(() => t(i, S(n).email)), R(e, r);
																	};
																	b(f, (e) => {
																		S(n).email && e(p);
																	}), M(s), x(() => t(l, S(n).name)), R(e, i);
																},
																$$slots: { default: !0 }
															});
														}), R(e, r);
													});
													var s = T(o, 2);
													A(s, () => Kg, (e, n) => {
														n(e, {
															part: "empty",
															children: (e, n) => {
																U();
																var r = l();
																x(() => t(r, S(O).noResults)), R(e, r);
															},
															$$slots: { default: !0 }
														});
													}), R(e, i);
												},
												$$slots: { default: !0 }
											});
										}), R(e, i);
									},
									$$slots: { default: !0 }
								});
							}), R(e, i);
						},
						$$slots: { default: !0 }
					});
				});
			}
			M(i), R(e, i);
		},
		$$slots: { default: !0 }
	}), R(n, ce), L(se);
}
f(["click"]), W(C_, {
	people: { type: "Array" },
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
		type: "Boolean"
	},
	strings: { type: "Object" }
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/popover/use-popover-context.js
var [w_, T_] = vr({ name: "PopoverContext" }), E_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function D_(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, E_), a = T_(), o = F(() => J(a().getAnchorProps(), i));
	return Y(t, I({ as: "div" }, () => S(o), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(D_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/popover/popover-content.svelte
var O_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function k_(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, O_), o = T_(), s = eo(), c = F(() => J(o().getContentProps(), s().getPresenceProps(), i));
	function l(e) {
		s().setNode(e);
	}
	var u = {
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	}, d = p(), f = V(d), m = (e) => {
		Y(e, I({ as: "div" }, () => S(c), {
			[a()]: l,
			get ref() {
				return r();
			},
			set ref(e) {
				r(e);
			}
		}));
	}, h = F(() => !s().unmounted);
	return b(f, (e) => {
		S(h) && e(m);
	}), R(t, d), L(u);
}
W(k_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/popover/popover-positioner.svelte
var A_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function j_(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, A_), a = T_(), o = eo(), s = F(() => J(a().getPositionerProps(), i));
	var c = {
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	}, l = p(), u = V(l), d = (e) => {
		Y(e, I({ as: "div" }, () => S(s), {
			get ref() {
				return r();
			},
			set ref(e) {
				r(e);
			}
		}));
	}, f = F(() => !o().unmounted);
	return b(u, (e) => {
		S(f) && e(d);
	}), R(t, l), L(c);
}
W(j_, { ref: {} }, [], [], { mode: "open" });
var M_ = cc("popover").parts("arrow", "arrowTip", "anchor", "trigger", "indicator", "positioner", "content", "title", "description", "closeTrigger").build(), N_ = (e) => e.ids?.anchor ?? `popover:${e.id}:anchor`, P_ = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `popover:${e.id}:trigger:${t}` : `popover:${e.id}:trigger` : ri(n) ? n(t) : n;
}, F_ = (e) => e.ids?.content ?? `popover:${e.id}:content`, I_ = (e) => e.ids?.positioner ?? `popover:${e.id}:popper`, L_ = (e) => e.ids?.arrow ?? `popover:${e.id}:arrow`, R_ = (e) => e.ids?.title ?? `popover:${e.id}:title`, z_ = (e) => e.ids?.description ?? `popover:${e.id}:desc`, B_ = (e) => e.ids?.closeTrigger ?? `popover:${e.id}:close`, V_ = (e) => e.getById(N_(e)), H_ = (e) => e.getById(P_(e)), U_ = (e) => Yn(e.getRootNode(), `[data-scope="popover"][data-part="trigger"]${ze(e.id)}`), W_ = (e, t) => t == null ? H_(e) ?? U_(e)[0] : e.getById(P_(e, t)), G_ = (e) => e.getById(F_(e)), K_ = (e) => e.getById(I_(e)), q_ = (e) => e.getById(R_(e)), J_ = (e) => e.getById(z_(e)), Y_ = { closeTriggerLabel: "close" };
function X_(e, t) {
	let { state: n, context: r, send: i, computed: a, prop: o, scope: s } = e, c = Mi(Y_, o("translations")), l = n.matches("open"), u = r.get("currentPlacement"), d = u ? bd(u) : void 0, f = a("currentPortalled"), p = r.get("renderedElements"), m = r.get("triggerValue"), h = zd({
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
				id: L_(s),
				...M_.arrow.attrs,
				dir: o("dir"),
				style: h.arrow
			});
		},
		getArrowTipProps() {
			return t.element({
				...M_.arrowTip.attrs,
				dir: o("dir"),
				style: h.arrowTip
			});
		},
		getAnchorProps() {
			return t.element({
				...M_.anchor.attrs,
				dir: o("dir"),
				id: N_(s)
			});
		},
		getTriggerProps(e = {}) {
			let { value: n } = e, r = n != null && m === n;
			return t.button({
				...M_.trigger.attrs,
				dir: o("dir"),
				type: "button",
				"data-placement": u,
				"data-side": d,
				id: P_(s, n),
				"data-ownedby": s.id,
				"data-value": n,
				"data-current": K(r),
				"aria-haspopup": "dialog",
				"aria-expanded": n == null ? l : l && r,
				"data-state": l ? "open" : "closed",
				"aria-controls": F_(s),
				onPointerDown(e) {
					Xt(e) && zt() && e.currentTarget.focus();
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
				...M_.indicator.attrs,
				dir: o("dir"),
				"data-state": l ? "open" : "closed"
			});
		},
		getPositionerProps() {
			return t.element({
				id: I_(s),
				...M_.positioner.attrs,
				dir: o("dir"),
				style: h.floating
			});
		},
		getContentProps() {
			return t.element({
				...M_.content.attrs,
				dir: o("dir"),
				id: F_(s),
				tabIndex: -1,
				role: "dialog",
				"aria-modal": Fe(o("modal")),
				hidden: !l,
				"data-state": l ? "open" : "closed",
				"data-expanded": K(l),
				"aria-labelledby": p.title ? R_(s) : void 0,
				"aria-describedby": p.description ? z_(s) : void 0,
				"data-placement": u,
				"data-side": d
			});
		},
		getTitleProps() {
			return t.element({
				...M_.title.attrs,
				id: R_(s),
				dir: o("dir")
			});
		},
		getDescriptionProps() {
			return t.element({
				...M_.description.attrs,
				id: z_(s),
				dir: o("dir")
			});
		},
		getCloseTriggerProps() {
			return t.button({
				...M_.closeTrigger.attrs,
				dir: o("dir"),
				id: B_(s),
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
var Z_ = va({
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
						triggerElement: W_(n, e)
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
				let r = V_(n);
				return Ld(() => r ?? W_(n, e.get("triggerValue")), () => K_(n), {
					...t("positioning"),
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			trackDismissableElement({ send: e, prop: t, scope: n }) {
				let r = () => G_(n), i = !0;
				return gl(r, {
					type: "popover",
					pointerBlocking: t("modal"),
					exclude: [H_(n), ...U_(n)].filter(Boolean),
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
				return e("modal") || !e("portalled") ? void 0 : Jn(() => G_(t), {
					triggerElement: W_(t, n.get("triggerValue")),
					defer: !0,
					getShadowRoot: !0,
					onFocus(e) {
						e.focus({ preventScroll: !0 });
					}
				});
			},
			hideContentBelow({ prop: e, scope: t, context: n }) {
				return e("modal") ? Vc(() => [G_(t), W_(t, n.get("triggerValue"))], { defer: !0 }) : void 0;
			},
			preventScroll({ prop: e, scope: t }) {
				if (e("modal")) return Rl(t.getDoc());
			},
			trapFocus({ prop: e, scope: t, context: n }) {
				return e("modal") ? jl(() => G_(t), {
					preventScroll: !0,
					returnFocusOnDeactivate: !!e("restoreFocus"),
					initialFocus: () => En({
						root: G_(t),
						getInitialEl: e("initialFocusEl"),
						enabled: e("autoFocus")
					}),
					setReturnFocus: (r) => {
						let i = e("finalFocusEl")?.();
						if (i) return i;
						let a = n.get("triggerValue");
						if (a) {
							let e = W_(t, a);
							if (e) return e;
						}
						return U_(t)[0] || r;
					},
					getShadowRoot: !0
				}) : void 0;
			}
		},
		actions: {
			reposition({ event: e, prop: t, scope: n, context: r }) {
				let i = V_(n);
				Ld(() => i ?? W_(n, r.get("triggerValue")), () => K_(n), {
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
				q(() => {
					Object.assign(e.get("renderedElements"), {
						title: !!q_(t),
						description: !!J_(t)
					});
				});
			},
			setInitialFocus({ prop: e, scope: t }) {
				e("modal") || q(() => {
					En({
						root: G_(t),
						getInitialEl: e("initialFocusEl"),
						enabled: e("autoFocus")
					})?.focus({ preventScroll: !0 });
				});
			},
			setFinalFocus({ event: e, prop: t, scope: n, context: r }) {
				let i = e.restoreFocus ?? e.previousEvent?.restoreFocus;
				(i == null || i) && t("restoreFocus") && q(() => {
					let e = t("finalFocusEl")?.();
					if (e) {
						e.focus({ preventScroll: !0 });
						return;
					}
					W_(n, r.get("triggerValue"))?.focus({ preventScroll: !0 });
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
}), Q_ = (e) => {
	let t = br(), n = uo(), r = F(() => {
		let r = pi(e) || {};
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = La(Z_, () => S(r)), a = F(() => X_(i, ka));
	return () => S(a);
}, $_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open",
	"children"
]);
function ev(t, n) {
	let r = o();
	k(n, !0);
	let i = B(n, "open", 15), a = B(n, "children", 7), s = H(n, $_), c = F(() => Qa(s)), l = F(() => P(S(c), 2)), u = F(() => S(l)[0]), d = F(() => S(l)[1]), f = F(() => ({
		...S(d),
		id: S(d).id ?? r,
		open: i(),
		onOpenChange(e) {
			S(d).onOpenChange?.(e), i() !== void 0 && i(e.open);
		}
	})), m = Q_(() => S(f)), h = F(() => ({
		...S(u),
		present: m().open
	})), g = Za(() => S(h));
	w_(m), $a(g);
	var _ = {
		get open() {
			return i();
		},
		set open(t) {
			i(t), e();
		},
		get children() {
			return a();
		},
		set children(t) {
			a(t), e();
		}
	}, v = p(), y = V(v);
	return z(y, () => a() ?? ue), R(t, v), L(_);
}
W(ev, {
	open: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/popover/popover-trigger.svelte
var tv = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function nv(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, tv), a = F(() => wr()(i, ["value"])), o = F(() => P(S(a), 2)), s = F(() => S(o)[0]), c = F(() => S(o)[1]), l = T_(), u = eo(), d = F(() => {
		let e = l().getTriggerProps(S(s));
		return J({
			...e,
			"aria-controls": u().unmounted ? void 0 : e["aria-controls"]
		}, S(c));
	});
	return Y(t, I({ as: "button" }, () => S(d), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(nv, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Popover.svelte
var rv = m("<!> <!>", 1), iv = m("<div class=\"af-kit\"><!></div>"), av = {
	hash: "svelte-1netzpl",
	code: "[data-scope='popover'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='popover'][data-part='anchor'] {display:inline-block;}[data-scope='popover'][data-part='content'] {padding:8px;}[data-scope='popover'][data-part='content']:focus-visible {outline:2px solid var(--k-ring);outline-offset:2px;}"
};
function ov(t, n) {
	k(n, !0), de(t, av);
	let r = B(n, "open", 7, !1), i = B(n, "placement", 7, "bottom-start"), a = n.$$host, o = _(null), s = "outside";
	C(() => Jl(S(o), !!r(), a));
	var c = {
		get open() {
			return r();
		},
		set open(t = !1) {
			r(t), e();
		},
		get placement() {
			return i();
		},
		set placement(t = "bottom-start") {
			i(t), e();
		}
	}, l = rv(), u = V(l);
	return Kl(u, {}), Cr(T(u, 2), {
		value: () => a.shadowRoot,
		children: (e, t) => {
			var c = iv(), l = d(c);
			{
				let e = F(() => !!r()), t = F(() => ({
					strategy: "fixed",
					placement: i() || "bottom-start"
				}));
				A(l, () => ev, (r, i) => {
					i(r, {
						get open() {
							return S(e);
						},
						closeOnEscape: !0,
						portalled: !1,
						get positioning() {
							return S(t);
						},
						onEscapeKeyDown: () => s = "escape",
						onInteractOutside: () => s = "outside",
						onOpenChange: (e) => {
							e.open || (ql(a, "close", { reason: s }), s = "outside");
						},
						children: (e, t) => {
							var r = rv(), i = V(r);
							A(i, () => D_, (e, t) => {
								t(e, {
									part: "anchor",
									children: (e, t) => {
										var r = p(), i = V(r);
										pe(i, n, "anchor", {}, null), R(e, r);
									},
									$$slots: { default: !0 }
								});
							});
							var a = T(i, 2);
							A(a, () => j_, (e, t) => {
								t(e, {
									popover: "manual",
									get ref() {
										return S(o);
									},
									set ref(e) {
										E(o, e, !0);
									},
									children: (e, t) => {
										var r = p(), i = V(r);
										A(i, () => k_, (e, t) => {
											t(e, {
												class: "af-overlay popover",
												part: "content",
												children: (e, t) => {
													var r = p(), i = V(r);
													pe(i, n, "content", {}, null), R(e, r);
												},
												$$slots: { default: !0 }
											});
										}), R(e, r);
									},
									$$slots: { default: !0 }
								});
							}), R(e, r);
						},
						$$slots: { default: !0 }
					});
				});
			}
			M(c), R(e, c);
		},
		$$slots: { default: !0 }
	}), R(t, l), L(c);
}
W(ov, {
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
var sv = g("<svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5\"></path><path d=\"M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5\"></path></svg>"), cv = m("<form class=\"link-form svelte-9gj0md\" novalidate=\"\"><input part=\"link-input\" type=\"url\" inputmode=\"url\" placeholder=\"https://\" class=\"svelte-9gj0md\"/> <button type=\"submit\" class=\"af-button primary\" part=\"link-apply\"> </button></form>"), lv = m("<!> <!>", 1), uv = m("<div part=\"toolbar\" class=\"toolbar svelte-9gj0md\"><button type=\"button\" part=\"tool-bold\" class=\"tool svelte-9gj0md\"><b>B</b></button> <button type=\"button\" part=\"tool-italic\" class=\"tool svelte-9gj0md\"><i>I</i></button> <button type=\"button\" part=\"tool-bullet-list\" class=\"tool svelte-9gj0md\">•</button> <button type=\"button\" part=\"tool-numbered-list\" class=\"tool svelte-9gj0md\">1.</button> <!></div>"), dv = m("<span part=\"placeholder\" class=\"placeholder svelte-9gj0md\" aria-hidden=\"true\"> </span>"), fv = m("<div class=\"mention-empty svelte-9gj0md\"> </div>"), pv = m("<div class=\"mention-title svelte-9gj0md\" part=\"mention-title\" aria-hidden=\"true\"> </div>"), mv = m("<div class=\"mention-scope svelte-9gj0md\" part=\"mention-scope\" role=\"option\" tabindex=\"-1\" data-kind=\"scope\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\" class=\"svelte-9gj0md\"><circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-3.5-3.5\"></path></svg> <span class=\"mention-name svelte-9gj0md\"> </span></div>"), hv = m("<div class=\"mention-scopes svelte-9gj0md\"></div>"), gv = m("<span class=\"mention-name svelte-9gj0md\"> </span>"), _v = m("<span class=\"mention-meta svelte-9gj0md\"> </span>"), vv = m("<span class=\"mention-meta mention-side svelte-9gj0md\"> </span>"), yv = m("<span class=\"af-avatar mention-avatar svelte-9gj0md\" aria-hidden=\"true\"> </span> <span class=\"mention-text svelte-9gj0md\"><span class=\"mention-name svelte-9gj0md\"> </span> <!></span> <!>", 1), bv = m("<div class=\"mention-option svelte-9gj0md\" part=\"mention-option\" role=\"option\" tabindex=\"-1\"><!></div>"), xv = m("<div class=\"mention-group\" role=\"group\"><!> <!></div>"), Sv = m("<div class=\"af-kit editor svelte-9gj0md\"><!> <div class=\"surface svelte-9gj0md\"><!> <div part=\"content\" class=\"content svelte-9gj0md\"></div></div> <div part=\"mention-menu\" class=\"af-overlay mention-menu svelte-9gj0md\" popover=\"manual\" role=\"listbox\"><!> <!></div></div>"), Cv = {
	hash: "svelte-9gj0md",
	code: ".editor.svelte-9gj0md {display:flex;flex-direction:column;border:1px solid var(--k-line);border-radius:var(--k-radius);background:var(--k-surface);}.editor.svelte-9gj0md:focus-within {outline:2px solid var(--k-ring);outline-offset:1px;}.editor[data-readonly].svelte-9gj0md {border-color:transparent;background:transparent;}.toolbar.svelte-9gj0md {display:flex;gap:2px;padding:4px;border-bottom:1px solid var(--k-line);}.tool.svelte-9gj0md, [data-scope='popover'][data-part='trigger'].tool {min-width:28px;height:28px;padding:0 6px;border:0;border-radius:4px;background:none;color:var(--k-fg);font:inherit;cursor:pointer;}.tool.svelte-9gj0md:not(:disabled):hover, [data-scope='popover'][data-part='trigger'].tool:hover {background:color-mix(in oklab, var(--k-fg) 6%, transparent);}.tool.svelte-9gj0md:not(:disabled):active {background:color-mix(in oklab, var(--k-fg) 10%, transparent);}.tool[aria-pressed='true'].svelte-9gj0md, [data-scope='popover'][data-part='trigger'].tool[aria-pressed='true'] {background:color-mix(in oklab, var(--k-primary) 14%, transparent);}.tool.svelte-9gj0md:disabled {opacity:0.55;cursor:default;}.tool.svelte-9gj0md:focus-visible {outline:2px solid var(--k-ring);outline-offset:1px;}.surface.svelte-9gj0md {position:relative;}.placeholder.svelte-9gj0md {position:absolute;inset:8px 12px auto;color:var(--k-muted);pointer-events:none;}.content.svelte-9gj0md > [contenteditable] {min-height:4.5em;padding:8px 12px;outline:none;white-space:pre-wrap;word-wrap:break-word;font-variant-ligatures:none;}.editor[data-readonly].svelte-9gj0md .content:where(.svelte-9gj0md) > [contenteditable] {min-height:0;padding:0;}.content.svelte-9gj0md p {margin:0 0 0.5em;}.content.svelte-9gj0md > [contenteditable] > :last-child {margin-bottom:0;}.content.svelte-9gj0md ul, .content.svelte-9gj0md ol {margin:0 0 0.5em;padding-left:1.5em;}.content.svelte-9gj0md a {color:var(--k-primary);}.editor[data-single-line].svelte-9gj0md .content:where(.svelte-9gj0md) > [contenteditable] {min-height:0;padding:4px 8px;white-space:nowrap;overflow:hidden;}.editor[data-single-line].svelte-9gj0md .content:where(.svelte-9gj0md) p {margin:0;}.content.svelte-9gj0md .af-mention-holder {display:inline;}.content.svelte-9gj0md .af-mention {display:inline-flex;align-items:center;gap:4px;padding:0 6px;border-radius:999px;vertical-align:baseline;background:color-mix(in oklab, var(--k-primary) 12%, transparent);color:var(--k-fg);font-size:0.95em;line-height:1.5;}.content.svelte-9gj0md .af-mention[data-state='restricted'] {background:color-mix(in oklab, var(--k-fg) 7%, transparent);color:var(--k-muted);}.content.svelte-9gj0md .af-mention[data-state='deleted'] {background:color-mix(in oklab, var(--k-fg) 7%, transparent);color:var(--k-muted);}.content.svelte-9gj0md .af-mention[data-state='deleted'] .af-mention-label {text-decoration:line-through;}.content.svelte-9gj0md .af-mention-link {color:inherit;text-decoration:none;}.content.svelte-9gj0md .af-mention-link:hover {text-decoration:underline;}.content.svelte-9gj0md .af-mention-avatar {width:16px;height:16px;font-size:10px;}.content.svelte-9gj0md table {border-collapse:collapse;}.content.svelte-9gj0md th, .content.svelte-9gj0md td {border:1px solid var(--k-line);padding:4px 8px;}.content.svelte-9gj0md ul[data-type='taskList'] {list-style:none;padding-left:0.25em;}.content.svelte-9gj0md ul[data-type='taskList'] li {display:flex;gap:6px;}[data-scope='popover'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}.mention-menu.svelte-9gj0md {position:fixed;inset:auto;margin:0;padding:4px;min-width:240px;max-width:360px;max-height:320px;overflow:auto;}.mention-title.svelte-9gj0md {padding:6px 8px 2px;color:var(--k-muted);font-size:12px;font-weight:600;}.mention-option.svelte-9gj0md {display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:4px;cursor:pointer;}.mention-option[aria-selected='true'].svelte-9gj0md {background:color-mix(in oklab, var(--k-primary) 10%, transparent);}.mention-avatar.svelte-9gj0md {flex:none;width:24px;height:24px;font-size:12px;}.mention-text.svelte-9gj0md {display:flex;flex-direction:column;min-width:0;flex:1;}.mention-name.svelte-9gj0md {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.mention-meta.svelte-9gj0md {color:var(--k-muted);font-size:12px;}.mention-side.svelte-9gj0md {flex:none;}.mention-empty.svelte-9gj0md {padding:8px;color:var(--k-muted);}.mention-scopes.svelte-9gj0md {display:flex;flex-wrap:wrap;gap:4px;padding:4px 8px 6px;}.mention-scope.svelte-9gj0md {display:inline-flex;align-items:center;gap:4px;max-width:100%;padding:2px 8px;border:1px solid var(--k-line);border-radius:999px;color:var(--k-fg);font-size:12px;cursor:pointer;}.mention-scope.svelte-9gj0md svg:where(.svelte-9gj0md) {flex:none;color:var(--k-muted);}.mention-scope[aria-selected='true'].svelte-9gj0md {border-color:var(--k-primary);background:color-mix(in oklab, var(--k-primary) 10%, transparent);}.link-form.svelte-9gj0md {display:flex;gap:6px;padding:8px;}.link-form.svelte-9gj0md input:where(.svelte-9gj0md) {min-width:240px;min-height:32px;padding:0 8px;border:1px solid var(--k-line);border-radius:var(--k-radius);background:var(--k-bg);color:var(--k-fg);font:inherit;}.link-form.svelte-9gj0md input:where(.svelte-9gj0md):focus-visible {outline:2px solid var(--k-ring);outline-offset:1px;}"
};
function wv(n, i) {
	k(i, !0), de(n, Cv);
	let a = B(i, "value", 7, ""), o = B(i, "readonly", 7, !1), s = B(i, "placeholder", 7, null), l = B(i, "label", 7, null), f = B(i, "locale", 7, null), m = B(i, "strings", 7, null), h = B(i, "mentions", 7, null), g = B(i, "singleLine", 7, !1), y = B(i, "mentionMap", 7, null), D = i.$$host, j = F(() => tu(f(), m() ?? void 0)), N = _(null), P = _(null), ee = _(!0), te = _(w({
		bold: !1,
		italic: !1,
		bulletList: !1,
		orderedList: !1,
		link: !1
	})), ne = _(!1), I = _(""), z = _(null);
	C(() => Jl(S(z), S(ne), D));
	let ie = null, ae = null, oe = _(null), H = _(0), se = _(null), U = `af-mention-${Math.random().toString(36).slice(2, 9)}`;
	C(() => Jl(S(se), S(oe) !== null, D)), C(() => {
		let e = S(oe)?.rect?.();
		S(se) && e && (S(se).style.left = `${Math.max(0, e.left)}px`, S(se).style.top = `${e.bottom + 4}px`);
	});
	let W = F(() => {
		let e = [];
		return (S(oe)?.entries ?? []).forEach((t, n) => {
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
		let t = S(oe);
		if (!t) return;
		if (e.kind === "item") {
			t.command(e);
			return;
		}
		let n = h(), r = xe(e);
		if (!n || !r) return;
		let i = await n(t.query, r);
		if (S(oe) !== t) return;
		let a = ae?.(i) ?? [];
		E(oe, {
			...t,
			entries: a
		}), E(H, 0);
	}
	let ue = (e) => e.some((e) => e.kind !== "scope"), fe = (e) => !ue(e.entries) && /\s/.test(e.query.trim()), pe = {
		show(e) {
			E(oe, fe(e) ? null : e), E(H, 0);
		},
		update(e) {
			E(oe, fe(e) ? null : e), E(H, 0);
		},
		hide() {
			E(oe, null);
		},
		key(e) {
			let t = S(oe);
			if (!t) return !1;
			let n = t.entries.length;
			if (e.key === "Escape") return S(P) && ie?.(S(P).view), E(oe, null), !0;
			if (n === 0) return !1;
			if (e.key === "ArrowDown") return E(H, (S(H) + 1) % n), !0;
			if (e.key === "ArrowUp") return E(H, (S(H) - 1 + n) % n), !0;
			if (e.key === "Enter" || e.key === "Tab") {
				let e = t.entries[S(H)];
				return e && le(e), !0;
			}
			return !1;
		}
	};
	C(() => {
		let e = S(P)?.view.dom;
		if (e) {
			if (S(oe)) e.setAttribute("aria-haspopup", "listbox"), e.setAttribute("aria-expanded", "true"), e.setAttribute("aria-controls", U), S(oe).entries.length > 0 ? e.setAttribute("aria-activedescendant", `${U}-${S(H)}`) : e.removeAttribute("aria-activedescendant");
			else for (let t of [
				"aria-expanded",
				"aria-controls",
				"aria-activedescendant"
			]) e.removeAttribute(t);
		}
	}), C(() => {
		S(P) && we(S(P), {
			map: y() ?? null,
			strings: S(j)
		});
	});
	let me, ge = null, _e = !1, ve = !1, ye = (e) => e.getMarkdown().replace(/\u00A0+$/gm, "").trimEnd();
	function be() {
		if (clearTimeout(me), me = void 0, !S(P) || !_e) return;
		_e = !1;
		let e = ye(S(P));
		e !== (a() ?? "") && e !== ge && (ge = e, ql(D, "change", { value: e }));
	}
	function Se(e, t) {
		ve = !1, ye(e) !== t && (e.commands.setContent(t, {
			contentType: "markdown",
			emitUpdate: !1
		}), _e = !1, ge = null);
	}
	function Ce(e) {
		E(ee, e.isEmpty, !0), E(te, {
			bold: e.isActive("bold"),
			italic: e.isActive("italic"),
			bulletList: e.isActive("bulletList"),
			orderedList: e.isActive("orderedList"),
			link: e.isActive("link")
		}, !0);
	}
	C(() => {
		let e = S(N);
		if (!e) return;
		let t = !!g(), n = !1, r = null;
		return import("./chunks/markdown-Dbjns2wm.js").then(({ createMarkdownEditor: i, exitSuggestion: s, flatten: l }) => {
			if (n) return;
			ie = s, ae = l;
			let u = i({
				element: e,
				content: c(() => a() ?? ""),
				editable: c(() => !o()),
				singleLine: t,
				mention: {
					source: () => c(() => h()),
					controller: pe,
					strings: () => c(() => S(j))
				},
				onUpdate() {
					_e = !0, clearTimeout(me), me = setTimeout(be, 600);
				},
				onBlur() {
					be(), ve && Se(u, a() ?? "");
				},
				onFocus() {}
			});
			we(u, {
				map: c(() => y() ?? null),
				strings: c(() => S(j))
			}), u.on("transaction", () => Ce(u)), r = u, Ce(u), E(P, u), D.editor = u;
		}), () => {
			n = !0, E(oe, null), be(), r?.destroy(), D.editor === r && (D.editor = null), E(P, null);
		};
	}), C(() => {
		let e = a() ?? "", t = S(P);
		t && c(() => {
			t.isFocused ? ve = !0 : Se(t, e);
		});
	}), C(() => {
		let e = S(P)?.view.dom;
		e && (l() ? e.setAttribute("aria-label", l()) : e.removeAttribute("aria-label"));
	}), C(() => {
		let e = !o();
		S(P) && S(P).isEditable !== e && S(P).setEditable(e, !1);
	});
	function Te(e) {
		e && S(P) && E(I, S(P).getAttributes("link").href ?? "", !0), E(ne, e, !0);
	}
	function Ee() {
		if (!S(P)) return;
		let e = S(I).trim(), t = S(P).chain().focus().extendMarkRange("link");
		e ? S(P).state.selection.empty && !S(P).isActive("link") ? t.insertContent({
			type: "text",
			text: e,
			marks: [{
				type: "link",
				attrs: { href: e }
			}]
		}).run() : t.setLink({ href: e }).run() : t.unsetLink().run(), E(ne, !1);
	}
	let De = (e) => e.preventDefault();
	var Oe = {
		get value() {
			return a();
		},
		set value(t = "") {
			a(t), e();
		},
		get readonly() {
			return o();
		},
		set readonly(t = !1) {
			o(t), e();
		},
		get placeholder() {
			return s();
		},
		set placeholder(t = null) {
			s(t), e();
		},
		get label() {
			return l();
		},
		set label(t = null) {
			l(t), e();
		},
		get locale() {
			return f();
		},
		set locale(t = null) {
			f(t), e();
		},
		get strings() {
			return m();
		},
		set strings(t = null) {
			m(t), e();
		},
		get mentions() {
			return h();
		},
		set mentions(t = null) {
			h(t), e();
		},
		get singleLine() {
			return g();
		},
		set singleLine(t = !1) {
			g(t), e();
		},
		get mentionMap() {
			return y();
		},
		set mentionMap(t = null) {
			y(t), e();
		}
	}, ke = lv(), Ae = V(ke);
	return Kl(Ae, {}), Cr(T(Ae, 2), {
		value: () => D.shadowRoot,
		children: (e, n) => {
			var i = Sv(), a = d(i), c = (e) => {
				var n = uv(), r = d(n), i = T(r, 2), a = T(i, 2), o = T(a, 2), s = T(o, 2);
				A(s, () => ev, (e, n) => {
					n(e, {
						get open() {
							return S(ne);
						},
						portalled: !1,
						positioning: {
							strategy: "fixed",
							placement: "bottom-start"
						},
						onOpenChange: (e) => Te(e.open),
						children: (e, n) => {
							var r = lv(), i = V(r);
							{
								let e = F(() => !S(P));
								A(i, () => nv, (t, n) => {
									n(t, {
										part: "tool-link",
										class: "tool",
										get "aria-label"() {
											return S(j).link;
										},
										get title() {
											return S(j).link;
										},
										get "aria-pressed"() {
											return S(te).link;
										},
										get disabled() {
											return S(e);
										},
										children: (e, t) => {
											var n = sv();
											R(e, n);
										},
										$$slots: { default: !0 }
									});
								});
							}
							var a = T(i, 2);
							A(a, () => j_, (e, n) => {
								n(e, {
									popover: "manual",
									get ref() {
										return S(z);
									},
									set ref(e) {
										E(z, e, !0);
									},
									children: (e, n) => {
										var r = p(), i = V(r);
										A(i, () => k_, (e, n) => {
											n(e, {
												class: "af-overlay link",
												part: "link-popover",
												children: (e, n) => {
													var r = cv(), i = d(r);
													re(i);
													var a = T(i, 2), o = u(a, !0);
													M(r), x(() => {
														G(i, "aria-label", S(j).link), t(o, S(j).confirm);
													}), he("submit", r, (e) => {
														e.preventDefault(), Ee();
													}), ce(i, () => S(I), (e) => E(I, e)), R(e, r);
												},
												$$slots: { default: !0 }
											});
										}), R(e, r);
									},
									$$slots: { default: !0 }
								});
							}), R(e, r);
						},
						$$slots: { default: !0 }
					});
				}), M(n), x(() => {
					G(r, "aria-label", S(j).bold), G(r, "title", S(j).bold), G(r, "aria-pressed", S(te).bold), r.disabled = !S(P), G(i, "aria-label", S(j).italic), G(i, "title", S(j).italic), G(i, "aria-pressed", S(te).italic), i.disabled = !S(P), G(a, "aria-label", S(j).bulletList), G(a, "title", S(j).bulletList), G(a, "aria-pressed", S(te).bulletList), a.disabled = !S(P), G(o, "aria-label", S(j).numberedList), G(o, "title", S(j).numberedList), G(o, "aria-pressed", S(te).orderedList), o.disabled = !S(P);
				}), v("mousedown", r, De), v("click", r, () => S(P)?.chain().focus().toggleBold().run()), v("mousedown", i, De), v("click", i, () => S(P)?.chain().focus().toggleItalic().run()), v("mousedown", a, De), v("click", a, () => S(P)?.chain().focus().toggleBulletList().run()), v("mousedown", o, De), v("click", o, () => S(P)?.chain().focus().toggleOrderedList().run()), R(e, n);
			};
			b(a, (e) => {
				!o() && !g() && e(c);
			});
			var l = T(a, 2), f = d(l), m = (e) => {
				var n = dv(), r = u(n, !0);
				x(() => t(r, s())), R(e, n);
			};
			b(f, (e) => {
				S(ee) && s() && e(m);
			});
			var h = T(f, 2);
			O(h, (e) => E(N, e), () => S(N)), M(l);
			var _ = T(l, 2), y = d(_), C = (e) => {
				var n = fv(), r = u(n, !0);
				x(() => t(r, S(j).noResults)), R(e, n);
			}, w = F(() => !ue(S(oe)?.entries ?? []));
			b(y, (e) => {
				S(w) && e(C);
			});
			var D = T(y, 2);
			r(D, 17, () => S(W), (e) => e.key + e.title, (e, n) => {
				var i = xv(), a = d(i), o = (e) => {
					var r = pv(), i = u(r, !0);
					x(() => t(i, S(n).title)), R(e, r);
				};
				b(a, (e) => {
					S(n).title && e(o);
				});
				var s = T(a, 2), c = (e) => {
					var i = hv();
					r(i, 21, () => S(n).rows, ({ entry: e, at: t }) => t, (e, n) => {
						let r = () => S(n).entry, i = () => S(n).at;
						var a = mv(), o = T(d(a), 2), s = u(o, !0);
						M(a), x(() => {
							G(a, "id", `${U}-${i() ?? ""}`), G(a, "aria-selected", i() === S(H)), G(a, "data-picked", i() === S(H) ? "" : void 0), G(a, "data-group", r().scope?.group), t(s, r().scope?.label);
						}), v("mousedown", a, (e) => e.preventDefault()), he("mouseenter", a, () => E(H, i(), !0)), v("click", a, () => void le(r())), v("keydown", a, () => {}), R(e, a);
					}), M(i), R(e, i);
				}, l = F(() => S(n).rows.every(({ entry: e }) => e.kind === "scope")), f = (e) => {
					var i = p(), a = V(i);
					r(a, 17, () => S(n).rows, ({ entry: e, at: t }) => t, (e, n) => {
						let r = () => S(n).entry, i = () => S(n).at;
						var a = bv(), o = d(a), s = (e) => {
							var n = gv(), i = u(n, !0);
							x(() => t(i, r().more?.label)), R(e, n);
						}, c = (e) => {
							var n = yv(), i = V(n), a = u(i, !0), o = T(i, 2), s = d(o), c = u(s, !0), l = T(s, 2), f = (e) => {
								var n = _v(), i = u(n, !0);
								x(() => t(i, r().item.entity_label)), R(e, n);
							};
							b(l, (e) => {
								r().item.entity_label && e(f);
							}), M(o);
							var p = T(o, 2), m = (e) => {
								var n = vv(), i = u(n, !0);
								x(() => t(i, r().item.meta)), R(e, n);
							};
							b(p, (e) => {
								r().item.meta && e(m);
							}), x((e) => {
								t(a, e), t(c, r().item.label);
							}, [() => Array.from(r().item.label.trim())[0]?.toUpperCase() ?? "?"]), R(e, n);
						};
						b(o, (e) => {
							r().kind === "more" ? e(s) : r().item && e(c, 1);
						}), M(a), x(() => {
							G(a, "id", `${U}-${i() ?? ""}`), G(a, "aria-selected", i() === S(H)), G(a, "data-picked", i() === S(H) ? "" : void 0), G(a, "data-kind", r().kind);
						}), v("mousedown", a, (e) => e.preventDefault()), he("mouseenter", a, () => E(H, i(), !0)), v("click", a, () => void le(r())), v("keydown", a, () => {}), R(e, a);
					}), R(e, i);
				};
				b(s, (e) => {
					S(l) ? e(c) : e(f, -1);
				}), M(i), x(() => G(i, "aria-label", S(n).title)), R(e, i);
			}), M(_), O(_, (e) => E(se, e), () => S(se)), M(i), x(() => {
				G(i, "data-readonly", o() ? "" : void 0), G(i, "data-single-line", g() ? "" : void 0), G(_, "id", U), G(_, "aria-label", S(j).mentionMenu);
			}), R(e, i);
		},
		$$slots: { default: !0 }
	}), R(n, ke), L(Oe);
}
f([
	"mousedown",
	"click",
	"keydown"
]), W(wv, {
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
var Tv = cc("toast").parts("group", "root", "title", "description", "actionTrigger", "closeTrigger").build(), Ev = (e) => `toast-group:${e}`, Dv = (e, t) => e.getById(`toast-group:${t}`), Ov = (e) => `toast:${e.id}`, kv = (e) => e.getById(Ov(e)), Av = (e) => `toast:${e.id}:title`, jv = (e) => `toast:${e.id}:description`, Mv = (e) => `toast${e.id}:close`, Nv = {
	info: 5e3,
	error: 5e3,
	success: 2e3,
	loading: Infinity,
	warning: 5e3,
	DEFAULT: 5e3
};
function Pv(e, t) {
	return e ?? Nv[t] ?? Nv.DEFAULT;
}
var Fv = (e) => typeof e == "string" ? {
	left: e,
	right: e,
	bottom: e,
	top: e
} : e;
function Iv(e, t) {
	let { prop: n, computed: r, context: i } = e, { offsets: a, gap: o } = n("store").attrs, s = i.get("heights"), c = Fv(a), l = n("dir") === "rtl", u = t.replace("-start", l ? "-right" : "-left").replace("-end", l ? "-left" : "-right"), d = u.includes("right"), f = u.includes("left"), p = {
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
		zIndex: Pe
	}, m = "center";
	return d && (m = "flex-end"), f && (m = "flex-start"), p.alignItems = m, u.includes("top") && (p.top = `max(env(safe-area-inset-top, 0px), ${c.top})`), u.includes("bottom") && (p.bottom = `max(env(safe-area-inset-bottom, 0px), ${c.bottom})`), u.includes("left") || (p.insetInlineEnd = `calc(env(safe-area-inset-right, 0px) + ${c.right})`), u.includes("right") || (p.insetInlineStart = `calc(env(safe-area-inset-left, 0px) + ${c.left})`), p;
}
function Lv(e, t) {
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
function Rv(e, t) {
	let { computed: n } = e, r = {
		position: "absolute",
		inset: "0",
		scale: "1 2",
		pointerEvents: t ? "none" : "auto"
	};
	return n("frontmost") && !t && ((e) => Object.assign(r, e))({ height: "calc(var(--initial-height) + 80%)" }), r;
}
function zv() {
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
function Bv(e, t) {
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
				...Tv.group.attrs,
				dir: r("dir"),
				tabIndex: -1,
				role: "region",
				"aria-label": `${s}, ${u} (${l})`,
				id: Ev(u),
				"data-placement": u,
				"data-side": d,
				"data-align": f,
				"aria-live": "polite",
				"aria-relevant": "additions text",
				"aria-atomic": "false",
				style: Iv(e, u),
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
					a.get("isFocusWithin") && !nt(e.currentTarget, e.relatedTarget) && queueMicrotask(() => i({ type: "REGION.BLUR" }));
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
var { guards: Vv, createMachine: Hv } = ya(), { and: Uv } = Vv, Wv = Hv({
	props({ props: e }) {
		return {
			dir: "ltr",
			id: vi(),
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
			ignoreMouseTimer: On.create(),
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
				guard: Uv("isOverlapping", "isPointerOut"),
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
				return on(document, "keydown", (n) => {
					let { hotkey: r } = e("store").attrs;
					r.every((e) => n[e] || n.code === e) && t({ type: "DOC.HOTKEY" });
				}, { capture: !0 });
			},
			trackDocumentVisibility({ prop: e, send: t, scope: n }) {
				let { pauseOnPageIdle: r } = e("store").attrs;
				if (!r) return;
				let i = n.getDoc();
				return on(i, "visibilitychange", () => {
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
				let s = _l(() => Dv(r, a), { defer: !0 });
				e.set("dismissableCleanup", s);
			},
			clearDismissableBranch({ refs: e }) {
				e.get("dismissableCleanup")?.();
			},
			focusRegionEl({ scope: e, computed: t }) {
				queueMicrotask(() => {
					Dv(e, t("placement"))?.focus();
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
}), Gv = { closeTriggerLabel: "Dismiss notification" };
function Kv(e, t) {
	let { state: n, send: r, prop: i, scope: a, context: o, computed: s } = e, c = Mi(Gv, i("translations")), l = n.hasTag("visible"), u = n.hasTag("paused"), d = o.get("mounted"), f = s("frontmost"), p = i("parent").computed("placement"), m = i("type"), h = i("stacked"), g = i("title"), _ = i("description"), v = i("action"), [y, b = "center"] = p.split("-");
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
				...Tv.root.attrs,
				dir: i("dir"),
				id: Ov(a),
				"data-state": l ? "open" : "closed",
				"data-type": m,
				"data-placement": p,
				"data-align": b,
				"data-side": y,
				"data-mounted": K(d),
				"data-paused": K(u),
				"data-first": K(f),
				"data-sibling": K(!f),
				"data-stack": K(h),
				"data-overlap": K(!h),
				role: "status",
				"aria-atomic": "true",
				"aria-describedby": _ ? jv(a) : void 0,
				"aria-labelledby": g ? Av(a) : void 0,
				tabIndex: 0,
				style: Lv(e, l),
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
				style: Rv(e, l)
			});
		},
		getGhostAfterProps() {
			return t.element({
				"data-ghost": "after",
				style: zv()
			});
		},
		getTitleProps() {
			return t.element({
				...Tv.title.attrs,
				id: Av(a)
			});
		},
		getDescriptionProps() {
			return t.element({
				...Tv.description.attrs,
				id: jv(a)
			});
		},
		getActionTriggerProps() {
			return t.button({
				...Tv.actionTrigger.attrs,
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
				id: Mv(a),
				...Tv.closeTrigger.attrs,
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
var { not: qv } = _a(), Jv = va({
	props({ props: e }) {
		return Vi(e, [
			"id",
			"type",
			"parent",
			"removeDelay"
		], "toast"), {
			closable: !0,
			...e,
			duration: Pv(e.duration, e.type)
		};
	},
	initialState({ prop: e }) {
		return e("type") === "loading" || e("duration") === Infinity ? "visible:persist" : "visible";
	},
	context({ prop: e, bindable: t }) {
		return {
			remainingTime: t(() => ({ defaultValue: Pv(e("duration"), e("type")) })),
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
					guard: qv("isLoadingType"),
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
				return Li(() => {
					t({
						type: "REMOVE",
						src: "timer"
					});
				}, e("removeDelay"));
			},
			waitForDuration({ send: e, context: t, computed: n }) {
				if (!n("shouldPersist")) return Li(() => {
					e({
						type: "DISMISS",
						src: "timer"
					});
				}, t.get("remainingTime"));
			},
			waitForNextTick({ send: e }) {
				return Li(() => {
					e({
						type: "SHOW",
						src: "timer"
					});
				}, 0);
			},
			trackHeight({ scope: e, prop: t }) {
				let n;
				return q(() => {
					let r = kv(e);
					if (!r) return;
					let i = new (e.getWin()).MutationObserver(() => {
						let e = Yv(r), n = {
							id: t("id"),
							height: e
						};
						Xv(t("parent"), n);
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
				q(() => {
					e.set("mounted", !0);
				});
			},
			measureHeight({ scope: e, prop: t, context: n }) {
				queueMicrotask(() => {
					let r = kv(e);
					if (!r) return;
					let i = Yv(r);
					n.set("initialHeight", i);
					let a = {
						id: t("id"),
						height: i
					};
					Xv(t("parent"), a);
				});
			},
			setCloseTimer({ refs: e }) {
				e.set("closeTimerStartTime", Date.now());
			},
			resetCloseTimer({ context: e, refs: t, prop: n }) {
				t.set("closeTimerStartTime", Date.now()), e.set("remainingTime", Pv(n("duration"), n("type")));
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
function Yv(e) {
	let t = e.style.height;
	e.style.height = "auto";
	let n = e.offsetHeight;
	return e.style.height = t, n;
}
function Xv(e, t) {
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
var Zv = (e, t) => ({
	...t,
	...ji(e)
}), Qv = {
	error: [1, 2],
	warning: [3, 6],
	loading: [4, 5],
	success: [5, 7],
	info: [6, 8]
}, $v = "info", ey = (e, t) => {
	let [n, r] = Qv[e ?? $v];
	return t ? n : r;
}, ty = (e) => e.sort((e, t) => (e.priority ?? ey(e.type, !!e.action)) - (t.priority ?? ey(t.type, !!t.action)));
function ny(e = {}) {
	let t = Zv(e, {
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
		for (a = ty(a); a.length > 0 && r.length < t.max;) {
			let e = a.shift();
			e && (s(e), r.unshift(e));
		}
	}, u = (e) => {
		let n = e.id ?? `toast:${vi()}`, a = r.find((e) => e.id === n);
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
				type: $v,
				...e,
				stacked: !t.overlap,
				gap: t.gap
			}, i = r.priority ?? ey(r.type, !!r.action);
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
				Ri("[zag-js > toast] toaster.promise() requires at least a 'loading' option to be specified");
				return;
			}
			let r = u({
				...n,
				...t.loading,
				promise: e,
				type: "loading"
			}), i = !0, a, o = pi(e).then(async (e) => {
				if (a = ["resolve", e], ry(e) && !e.ok) {
					i = !1;
					let a = pi(t.error, `HTTP Error! status: ${e.status}`);
					u({
						...n,
						...a,
						id: r,
						type: "error"
					});
				} else if (t.success !== void 0) {
					i = !1;
					let a = pi(t.success, e);
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
					let a = pi(t.error, e);
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
var ry = (e) => e && typeof e == "object" && "ok" in e && typeof e.ok == "boolean" && "status" in e && typeof e.status == "number", iy = {
	connect: Bv,
	machine: Wv
}, ay = (e) => ny(e), [oy, sy] = vr({
	name: "ToastContext",
	hookName: "useToastContext",
	providerName: "<ToastProvider />"
}), cy = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function ly(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, cy), a = sy(), o = F(() => J(a().getActionTriggerProps(), i));
	return Y(t, I({ as: "button" }, () => S(o), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(ly, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toast-close-trigger.svelte
var uy = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function dy(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, uy), a = sy(), o = F(() => J(a().getCloseTriggerProps(), i));
	return Y(t, I({ as: "button" }, () => S(o), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(dy, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toast-description.svelte
var fy = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function py(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, fy), a = sy(), o = F(() => J(a().getDescriptionProps(), i));
	return Y(t, I({ as: "div" }, () => S(o), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(py, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toast-root.svelte
var my = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]), hy = m("<div></div> <!> <div></div>", 1);
function gy(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, my), a = sy(), o = F(() => J(a().getRootProps(), i));
	return Y(t, I({ as: "div" }, () => S(o), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		},
		children: (e, t) => {
			var r = hy(), i = V(r);
			j(i, (e) => ({ ...e }), [() => a().getGhostBeforeProps()]);
			var o = T(i, 2);
			z(o, () => n.children ?? ue);
			var s = T(o, 2);
			j(s, (e) => ({ ...e }), [() => a().getGhostAfterProps()]), R(e, r);
		},
		$$slots: { default: !0 }
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(gy, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toaster-item.svelte
function _y(t, n) {
	k(n, !0);
	let r = B(n, "children", 7), i = B(n, "value", 7), a = B(n, "parent", 7), o = B(n, "index", 7), s = br(), c = F(() => ({
		...i()(),
		parent: a(),
		index: o(),
		getRootNode: s().getRootNode
	})), l = La(Jv, () => S(c)), u = F(() => Kv(l, ka));
	oy(() => S(u));
	var d = {
		get children() {
			return r();
		},
		set children(t) {
			r(t), e();
		},
		get value() {
			return i();
		},
		set value(t) {
			i(t), e();
		},
		get parent() {
			return a();
		},
		set parent(t) {
			a(t), e();
		},
		get index() {
			return o();
		},
		set index(t) {
			o(t), e();
		}
	}, f = p(), m = V(f);
	return z(m, r, i), R(t, f), L(d);
}
W(_y, {
	children: {},
	value: {},
	parent: {},
	index: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toaster.svelte
var vy = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"toaster",
	"children"
]);
function yy(t, n) {
	let i = o();
	k(n, !0);
	let a = B(n, "ref", 15, null), s = B(n, "toaster", 7), c = B(n, "children", 7), l = H(n, vy), u = uo(), d = br(), f = F(() => ({
		store: s(),
		id: i,
		dir: u().dir,
		getRootNode: d().getRootNode
	})), m = La(iy.machine, () => S(f)), h = F(() => iy.connect(m, ka)), g = F(() => S(h).getToasts()), _ = F(() => J(S(h).getGroupProps(), l));
	return Y(t, I({ as: "div" }, () => S(_), {
		get ref() {
			return a();
		},
		set ref(e) {
			a(e);
		},
		children: (e, t) => {
			var n = p(), i = V(n);
			r(i, 19, () => S(g), (e) => e.id, (e, t, n, r) => {
				let i = F(() => () => S(t));
				_y(e, {
					value: S(i),
					get parent() {
						return m;
					},
					get index() {
						return S(n);
					},
					children: (e, t) => {
						var n = p(), r = V(n);
						z(r, c, () => S(i)), R(e, n);
					},
					$$slots: { default: !0 }
				});
			}), R(e, n);
		},
		$$slots: { default: !0 }
	})), L({
		get ref() {
			return a();
		},
		set ref(t = null) {
			a(t), e();
		},
		get toaster() {
			return s();
		},
		set toaster(t) {
			s(t), e();
		},
		get children() {
			return c();
		},
		set children(t) {
			c(t), e();
		}
	});
}
W(yy, {
	ref: {},
	toaster: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/Toast.svelte
var by = /* @__PURE__ */ new WeakMap();
function xy(e) {
	let t = by.get(e);
	return t || by.set(e, t = ay({
		placement: "bottom-end",
		overlap: !1,
		gap: 8,
		hotkey: ["af-kit-no-hotkey"]
	})), t;
}
function Sy(e, t) {
	return e.create({
		type: t.kind,
		description: t.text,
		duration: t.kind === "error" ? t.action ? Infinity : 8e3 : 4e3,
		meta: { action: t.action ?? null }
	});
}
var Cy = m("<p> </p>"), wy = g("<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 8v4\"></path><path d=\"M12 16h.01\"></path>", 1), Ty = g("<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"m9 12 2 2 4-4\"></path>", 1), Ey = g("<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 16v-4\"></path><path d=\"M12 8h.01\"></path>", 1), Dy = g("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg>"), Oy = g("<svg part=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-e495ij\"><!></svg><!><!><!>", 1), ky = m("<div class=\"af-kit\"><div class=\"live svelte-e495ij\" role=\"status\"></div> <div class=\"live svelte-e495ij\" role=\"alert\"></div> <div class=\"region svelte-e495ij\" popover=\"manual\"><!></div></div>"), Ay = m("<!> <!>", 1), jy = {
	hash: "svelte-e495ij",
	code: ".live.svelte-e495ij {position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;}.region[popover].svelte-e495ij {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;pointer-events:none;}[data-scope='toast'][data-part='root'] {position:relative;display:flex;align-items:flex-start;gap:8px;width:min(360px, calc(100vw - 32px));padding:8px 8px 8px 14px;box-sizing:border-box;overflow:hidden;font-size:14px;line-height:22px;--k-tone: var(--k-info);translate:var(--x) var(--y);scale:var(--scale, 1);z-index:var(--z-index);opacity:var(--opacity);will-change:translate, opacity, scale;transition:translate 400ms cubic-bezier(0.21, 1.02, 0.73, 1), scale 400ms cubic-bezier(0.21, 1.02, 0.73, 1), opacity 400ms cubic-bezier(0.21, 1.02, 0.73, 1);}[data-scope='toast'][data-part='root'][data-state='closed'] {transition:translate 400ms cubic-bezier(0.06, 0.71, 0.55, 1), scale 400ms cubic-bezier(0.06, 0.71, 0.55, 1), opacity 200ms cubic-bezier(0.06, 0.71, 0.55, 1);}[data-scope='toast'][data-part='root']:focus-visible {outline:2px solid var(--k-ring);outline-offset:2px;}\n  /* The kind shows in a leading bar and an icon, not only in a colour of the border. */[data-scope='toast'][data-part='root']::before {content:'';position:absolute;inset-block:0;left:0;width:3px;background:var(--k-tone);}[data-scope='toast'][data-part='root'][data-type='error'] {--k-tone: var(--k-danger);}[data-scope='toast'][data-part='root'][data-type='success'] {--k-tone: var(--k-success);}[part='icon'].svelte-e495ij {flex:none;width:16px;height:16px;margin-top:3px;color:var(--k-tone);}[data-scope='toast'][data-part='description'] {flex:1;min-width:0;padding-block:1px;overflow-wrap:anywhere;}[data-scope='toast'][data-part='action'] {flex:none;min-height:28px;padding:0 10px;font-size:12px;}[data-scope='toast'][data-part='close'] {flex:none;color:var(--k-muted);}\n  @media (prefers-reduced-motion: reduce) {[data-scope='toast'][data-part='root'], [data-scope='toast'][data-part='root'][data-state='closed'] {transition:none;}\n  }"
};
function My(n, i) {
	k(i, !0), de(n, jy);
	let a = B(i, "locale", 7, null), o = B(i, "strings", 7, null), s = i.$$host, c = F(() => tu(a(), o() ?? void 0)), f = xy(s), m = _(null), h = _(0), g = _(w([])), v = () => queueMicrotask(() => {
		let e = f.getVisibleToasts();
		E(h, e.length, !0), E(g, e.map((e) => ({
			id: e.id,
			error: e.type === "error",
			text: String(e.description ?? "")
		})), !0);
	});
	C(() => (v(), f.subscribe(v))), C(() => Jl(S(m), S(h) > 0, s));
	var y = {
		get locale() {
			return a();
		},
		set locale(t = null) {
			a(t), e();
		},
		get strings() {
			return o();
		},
		set strings(t = null) {
			o(t), e();
		}
	}, D = Ay(), j = V(D);
	return Kl(j, {}), Cr(T(j, 2), {
		value: () => s.shadowRoot,
		children: (e, n) => {
			var i = ky(), a = d(i);
			r(a, 21, () => S(g).filter((e) => !e.error), (e) => e.id, (e, n) => {
				var r = Cy(), i = u(r, !0);
				x(() => t(i, S(n).text)), R(e, r);
			}), M(a);
			var o = T(a, 2);
			r(o, 21, () => S(g).filter((e) => e.error), (e) => e.id, (e, n) => {
				var r = Cy(), i = u(r, !0);
				x(() => t(i, S(n).text)), R(e, r);
			}), M(o);
			var h = T(o, 2);
			yy(d(h), {
				get toaster() {
					return f;
				},
				get "aria-label"() {
					return S(c).notifications;
				},
				"aria-live": "off",
				children: (e, n = ue) => {
					let r = F(() => n()().meta?.action);
					var i = p(), a = V(i);
					A(a, () => gy, (e, i) => {
						i(e, {
							part: "toast",
							class: "af-overlay",
							"aria-live": "off",
							children: (e, i) => {
								var a = Oy(), o = V(a), u = d(o), f = (e) => {
									var t = wy();
									U(2), R(e, t);
								}, m = F(() => n()().type === "error"), h = (e) => {
									var t = Ty();
									U(), R(e, t);
								}, g = F(() => n()().type === "success"), _ = (e) => {
									var t = Ey();
									U(2), R(e, t);
								};
								b(u, (e) => {
									S(m) ? e(f) : S(g) ? e(h, 1) : e(_, -1);
								}), M(o);
								var v = T(o);
								A(v, () => py, (e, r) => {
									r(e, {
										part: "text",
										children: (e, r) => {
											U();
											var i = l();
											x((e) => t(i, e), [() => n()().description]), R(e, i);
										},
										$$slots: { default: !0 }
									});
								});
								var y = T(v), C = (e) => {
									var i = p(), a = V(i);
									A(a, () => ly, (e, i) => {
										i(e, {
											part: "action",
											class: "af-button secondary",
											onclick: () => ql(s, "action", {
												toast: n()().id,
												action: S(r).id
											}),
											children: (e, n) => {
												U();
												var i = l();
												x(() => t(i, S(r).label)), R(e, i);
											},
											$$slots: { default: !0 }
										});
									}), R(e, i);
								};
								b(y, (e) => {
									S(r) && e(C);
								});
								var w = T(y);
								A(w, () => dy, (e, t) => {
									t(e, {
										part: "close",
										class: "af-button ghost icon sm",
										get "aria-label"() {
											return S(c).close;
										},
										children: (e, t) => {
											var n = Dy();
											R(e, n);
										},
										$$slots: { default: !0 }
									});
								}), R(e, a);
							},
							$$slots: { default: !0 }
						});
					}), R(e, i);
				},
				$$slots: { default: !0 }
			}), M(h), O(h, (e) => E(m, e), () => S(m)), M(i), R(e, i);
		},
		$$slots: { default: !0 }
	}), R(n, D), L(y);
}
W(My, {
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, [], [], { mode: "open" }, (e) => class extends e {
	show(e) {
		return Sy(xy(this), e);
	}
	dismiss(e) {
		xy(this).dismiss(e);
	}
});
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/use-tooltip-context.js
var [Ny, Py] = vr({ name: "TooltipContext" }), Fy = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Iy(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Fy), o = Py(), s = eo(), c = F(() => J(o().getContentProps(), s().getPresenceProps(), i));
	function l(e) {
		s().setNode(e);
	}
	var u = {
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	}, d = p(), f = V(d), m = (e) => {
		Y(e, I({ as: "div" }, () => S(c), {
			[a()]: l,
			get ref() {
				return r();
			},
			set ref(e) {
				r(e);
			}
		}));
	}, h = F(() => !s().unmounted);
	return b(f, (e) => {
		S(h) && e(m);
	}), R(t, d), L(u);
}
W(Iy, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/tooltip-context.svelte
function Ly(t, n) {
	k(n, !0);
	let r = B(n, "render", 7), i = Py();
	var a = {
		get render() {
			return r();
		},
		set render(t) {
			r(t), e();
		}
	}, o = p(), s = V(o);
	return z(s, () => r() ?? ue, () => i), R(t, o), L(a);
}
W(Ly, { render: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/tooltip-positioner.svelte
var Ry = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function zy(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Ry), a = Py(), o = eo(), s = F(() => J(a().getPositionerProps(), i));
	var c = {
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	}, l = p(), u = V(l), d = (e) => {
		Y(e, I({ as: "div" }, () => S(s), {
			get ref() {
				return r();
			},
			set ref(e) {
				r(e);
			}
		}));
	}, f = F(() => !o().unmounted);
	return b(u, (e) => {
		S(f) && e(d);
	}), R(t, l), L(c);
}
W(zy, { ref: {} }, [], [], { mode: "open" });
var By = cc("tooltip").parts("trigger", "arrow", "arrowTip", "positioner", "content").build(), Vy = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `tooltip:${e.id}:trigger:${t}` : `tooltip:${e.id}:trigger` : ri(n) ? n(t) : n;
}, Hy = (e) => e.ids?.content ?? `tooltip:${e.id}:content`, Uy = (e) => e.ids?.arrow ?? `tooltip:${e.id}:arrow`, Wy = (e) => e.ids?.positioner ?? `tooltip:${e.id}:popper`, Gy = (e) => e.getById(Vy(e)), Ky = (e) => e.getById(Wy(e)), qy = (e) => Yn(e.getRootNode(), `[data-scope="tooltip"][data-part="trigger"]${ze(e.id)}`), Jy = (e, t) => t == null ? Gy(e) ?? qy(e)[0] : e.getById(Vy(e, t)), Yy = Ni({
	id: null,
	prevId: null,
	instant: !1
});
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tooltip@1.43.3/node_modules/@zag-js/tooltip/dist/tooltip.connect.mjs
function Xy(e, t) {
	let { state: n, context: r, send: i, scope: a, prop: o, event: s } = e, c = o("id"), l = !!o("aria-label"), u = n.matches("open", "closing"), d = r.get("triggerValue"), f = r.get("currentPlacement"), p = f ? bd(f) : void 0, m = Hy(a), h = o("disabled"), g = zd({
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
			let { value: n } = e, r = n != null && d === n, s = Vy(a, n);
			return t.button({
				...By.trigger.attrs,
				id: s,
				"data-ownedby": a.id,
				"data-value": n,
				"data-current": K(r),
				dir: o("dir"),
				"data-expanded": K(u),
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
					e.defaultPrevented || h || kp() && i({
						type: u && n != null && !r ? "triggerValue.set" : "open",
						src: "trigger.focus",
						value: n,
						triggerId: s
					});
				},
				onBlur(e) {
					e.defaultPrevented || h || c === Yy.get("id") && ((e.relatedTarget ?? a.getDoc().activeElement)?.closest(ze(a.id)) ?? i({
						type: "close",
						src: "trigger.blur",
						value: n,
						triggerId: s
					}));
				},
				onPointerDown(e) {
					e.defaultPrevented || h || Xt(e) && o("closeOnPointerDown") && c === Yy.get("id") && i({
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
				id: Uy(a),
				...By.arrow.attrs,
				dir: o("dir"),
				style: g.arrow
			});
		},
		getArrowTipProps() {
			return t.element({
				...By.arrowTip.attrs,
				dir: o("dir"),
				style: g.arrowTip
			});
		},
		getPositionerProps() {
			return t.element({
				id: Wy(a),
				...By.positioner.attrs,
				dir: o("dir"),
				style: g.floating
			});
		},
		getContentProps() {
			let e = Yy.get("id") === c, n = Yy.get("prevId") === c, r = Yy.get("instant") && (u && e || n);
			return t.element({
				...By.content.attrs,
				dir: o("dir"),
				hidden: !u,
				"data-state": u ? "open" : "closed",
				"data-instant": K(r),
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
var { and: Zy, not: Qy } = _a(), $y = va({
	initialState: ({ prop: e }) => e("open") || e("defaultOpen") ? "open" : "closed",
	props({ props: e }) {
		Vi(e, ["id"]);
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
					triggerElement: Jy(n, e)
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
					guard: Zy("noVisibleTooltip", Qy("hasPointerMoveOpened")),
					target: "opening",
					actions: ["setTriggerValue"]
				}, {
					guard: Qy("hasPointerMoveOpened"),
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
			noVisibleTooltip: () => Yy.get("id") === null,
			isVisible: ({ prop: e }) => e("id") === Yy.get("id"),
			isInteractive: ({ prop: e }) => !!e("interactive"),
			hasPointerMoveOpened: ({ context: e }) => !!e.get("hasPointerMoveOpened"),
			isOpenControlled: ({ prop: e }) => e("open") !== void 0
		},
		actions: {
			setGlobalId: ({ prop: e }) => {
				let t = Yy.get("id"), n = t !== null && t !== e("id");
				Yy.update({
					id: e("id"),
					prevId: n ? t : null,
					instant: n
				});
			},
			clearGlobalId: ({ prop: e }) => {
				e("id") === Yy.get("id") && Yy.update({
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
				t.type === "positioning.set" && Ld(() => Jy(r, e.get("triggerValue")), () => Ky(r), {
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
				return Ld(() => Jy(r, i), () => Ky(r), {
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
			trackFocusVisible: ({ scope: e }) => Ap({ root: e.getRootNode?.() }),
			trackPositioning: ({ context: e, prop: t, scope: n }) => (e.get("currentPlacement") || e.set("currentPlacement", t("positioning").placement), Ld(() => Jy(n, e.get("triggerValue")), () => Ky(n), {
				...t("positioning"),
				defer: !0,
				onComplete(t) {
					e.set("currentPlacement", t.placement);
				}
			})),
			trackPointerlockChange: ({ send: e, scope: t }) => on(t.getDoc(), "pointerlockchange", () => e({
				type: "close",
				src: "pointerlock:change"
			}), !1),
			trackScroll: ({ send: e, prop: t, scope: n, context: r }) => {
				if (!t("closeOnScroll")) return;
				let i = Jy(n, r.get("triggerValue"));
				if (!i) return;
				let a = Fn(i).map((t) => on(t, "scroll", () => {
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
					n = Yy.subscribe(() => {
						Yy.get("id") !== e("id") && t({
							type: "close",
							src: "id.change"
						});
					});
				}), () => n?.();
			},
			trackEscapeKey: ({ send: e, prop: t }) => t("closeOnEscape") ? on(document, "keydown", (t) => {
				Kt(t) || t.key === "Escape" && (t.stopPropagation(), e({
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
}), eb = (e) => {
	let t = br(), n = uo(), r = F(() => {
		let r = pi(e);
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = La($y, () => S(r)), a = F(() => Xy(i, ka));
	return () => S(a);
}, tb = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open"
]);
function nb(t, n) {
	let r = o();
	k(n, !0);
	let i = B(n, "open", 15), a = H(n, tb), s = F(() => Qa(a)), c = F(() => P(S(s), 2)), l = F(() => S(c)[0]), u = F(() => S(c)[1]), d = F(() => S(u).children), f = F(() => ie(S(u), ["children"])), m = F(() => ({
		...S(f),
		id: r,
		onOpenChange(e) {
			S(f).onOpenChange?.(e), i() !== void 0 && i(e.open);
		}
	})), h = eb(() => S(m)), g = F(() => ({
		...S(l),
		present: h().open
	})), _ = Za(() => S(g));
	Ny(h), $a(_);
	var v = {
		get open() {
			return i();
		},
		set open(t) {
			i(t), e();
		}
	}, y = p(), b = V(y);
	return z(b, () => S(d) ?? ue), R(t, y), L(v);
}
W(nb, { open: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/tooltip-trigger.svelte
var rb = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function ib(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, rb), a = F(() => wr()(i, ["value"])), o = F(() => P(S(a), 2)), s = F(() => S(o)[0]), c = F(() => S(o)[1]), l = Py(), u = F(() => J(l().getTriggerProps(S(s)), S(c)));
	return Y(t, I({ as: "button" }, () => S(u), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), L({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
W(ib, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Tooltip.svelte
var ab = m("<span><!></span>"), ob = m("<!> <!>", 1), sb = {
	hash: "svelte-1cq81kb",
	code: ":host {display:inline-block;}[part='anchor'].svelte-1cq81kb {display:block;}[data-scope='tooltip'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='tooltip'][data-part='content'] {max-width:280px;padding:4px 8px;border-radius:max(0px, calc(var(--k-radius) - 4px));font-size:12px;line-height:18px;overflow-wrap:anywhere;}"
};
function cb(r, i) {
	k(i, !0), de(r, sb);
	let a = B(i, "text", 7, ""), o = i.$$host, s = _(!1), c = _(null), u = !1;
	C(() => Jl(S(c), S(s), o));
	let f = (e) => (t) => n(t, "keydown", (t) => {
		t.key === "Escape" && e().open && e().setOpen(!1);
	});
	function m(e) {
		let t = u;
		u = !1, t || e().setOpen(!0);
	}
	function h(e, t, n) {
		let r = t.relatedTarget;
		r && (o.contains(r) || n instanceof Node && n.contains(r)) || e().setOpen(!1);
	}
	var g = {
		get text() {
			return a();
		},
		set text(t = "") {
			a(t), e();
		}
	}, v = p(), y = V(v), w = (e) => {
		var n = ob(), r = V(n);
		Kl(r, {}), Cr(T(r, 2), {
			value: () => o.shadowRoot,
			children: (e, n) => {
				var r = p(), o = V(r);
				A(o, () => nb, (e, n) => {
					n(e, {
						openDelay: 300,
						closeDelay: 0,
						closeOnEscape: !1,
						positioning: { strategy: "fixed" },
						get open() {
							return S(s);
						},
						set open(e) {
							E(s, e, !0);
						},
						children: (e, n) => {
							var r = ob(), o = V(r);
							{
								let e = (e, t = ue) => {
									var n = p(), r = V(n);
									{
										let e = (e, n = ue) => {
											var r = ab();
											j(r, (e) => ({
												part: "anchor",
												...e
											}), [() => n()()], void 0, void 0, "svelte-1cq81kb");
											var a = d(r);
											pe(a, i, "default", {}, null), M(r), D(r, () => f(t())), R(e, r);
										};
										A(r, () => ib, (n, r) => {
											r(n, {
												onfocusin: () => m(t()),
												onfocusout: (e) => h(t(), e, e.currentTarget),
												onpointerdown: () => u = !0,
												onpointerleave: () => u = !1,
												asChild: e,
												$$slots: { asChild: !0 }
											});
										});
									}
									R(e, n);
								};
								A(o, () => Ly, (t, n) => {
									n(t, {
										render: e,
										$$slots: { render: !0 }
									});
								});
							}
							var s = T(o, 2);
							A(s, () => zy, (e, n) => {
								n(e, {
									popover: "manual",
									class: "af-kit",
									get ref() {
										return S(c);
									},
									set ref(e) {
										E(c, e, !0);
									},
									children: (e, n) => {
										var r = p(), i = V(r);
										A(i, () => Iy, (e, n) => {
											n(e, {
												class: "af-overlay tooltip",
												children: (e, n) => {
													U();
													var r = l();
													x(() => t(r, a())), R(e, r);
												},
												$$slots: { default: !0 }
											});
										}), R(e, r);
									},
									$$slots: { default: !0 }
								});
							}), R(e, r);
						},
						$$slots: { default: !0 }
					});
				}), R(e, r);
			},
			$$slots: { default: !0 }
		}), R(e, n);
	}, O = (e) => {
		var t = p(), n = V(t);
		pe(n, i, "default", {}, null), R(e, t);
	};
	return b(y, (e) => {
		a() ? e(w) : e(O, -1);
	}), R(r, v), L(g);
}
W(cb, {
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
//#region src/kit/version.ts
var lb = "0.4.1", ub = {
	"af-dialog": Om,
	"af-confirm": lu,
	"af-menu": Yh,
	"af-popover": ov,
	"af-tooltip": cb,
	"af-toast": My,
	"af-date": Cm,
	"af-person-picker": C_,
	"af-rich-editor": wv
}, db = Object.keys(ub);
for (let e of Object.values(ub)) Object.defineProperty(e.element, "kitVersion", { value: lb });
function fb(e, t) {
	if (typeof e != "string") return !0;
	let n = e.split(".").map((e) => Number.parseInt(e, 10) || 0), r = t.split(".").map((e) => Number.parseInt(e, 10) || 0);
	for (let e = 0; e < 3; e++) if ((n[e] ?? 0) !== (r[e] ?? 0)) return (n[e] ?? 0) < (r[e] ?? 0);
	return !1;
}
function pb(e = customElements) {
	for (let [t, n] of Object.entries(ub)) {
		let r = e.get(t);
		if (!r) e.define(t, n.element);
		else if (r !== n.element) {
			let e = r.kitVersion;
			fb(e, "0.4.1") && console.warn(`An older copy of the AgentFlow UI kit registered ${t} first; this page uses it, not this copy.`, {
				tag: t,
				registered: e ?? null,
				loaded: lb
			});
		}
	}
}
pb();
//#endregion
export { Gl as KIT_CSS, db as KIT_TAGS, lb as KIT_VERSION, pb as defineKitElements };
